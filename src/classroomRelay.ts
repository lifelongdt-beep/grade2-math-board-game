import type { AnswerRecord, LearningSupport, Player } from './types';

// 학생 폰과 선생님 화면은 서로 다른 기기입니다. 둘 사이에 답을 옮겨 줄
// 자리가 없으면 아무리 큐알로 들어와도 결과가 건너오지 않습니다.
//
// 그 자리를 두 가지로 둡니다.
//  - local: 선생님 컴퓨터에서 실행 파일로 서버를 켠 경우입니다(/api/*).
//  - cloud: 선생님이 무료 실시간 저장소 주소를 한 번 넣어 둔 경우입니다.
//
// cloud 쪽은 SDK를 쓰지 않고 REST 창구만 씁니다. 선생님은 주소 하나만
// 붙여 넣으면 되고, 앱에는 새 꾸러미가 늘지 않습니다.

export type RelayTarget =
  | { kind: 'local' }
  | { kind: 'cloud'; dbUrl: string; room: string };

// 큐알 주소에 담겨 오는 값이므로, 아무 주소나 받으면 학생 폰이 엉뚱한
// 곳으로 답을 보내게 됩니다. 무료 실시간 저장소의 주소 모양만 받습니다.
const ALLOWED_HOST_SUFFIXES = ['.firebaseio.com', '.firebasedatabase.app'];

export const normalizeDbUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  if (!ALLOWED_HOST_SUFFIXES.some((suffix) => parsed.hostname.endsWith(suffix))) return null;

  return `https://${parsed.host}`;
};

// 반마다 다른 방을 씁니다. 옆 반이 같은 주소를 쓰더라도 서로의 기록이
// 섞이지 않습니다. 읽기 쉬운 글자만 씁니다(0/O, 1/I 같은 혼동 없이).
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const makeRoomCode = (): string => {
  const values = new Uint32Array(6);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join('');
};

export const isRoomCode = (value: string): boolean => /^[A-Z0-9]{4,12}$/.test(value);

const emptySupport: LearningSupport = {
  studentConcept: '',
  studentHint: '',
  coreConcept: '',
  readStrategy: '',
  steps: [],
  misconceptionTip: '',
  textbookConnection: '',
  selfCheck: '',
};

// 실시간 저장소로 보낼 때는 무거운 글(해설·도움말·그림)을 뺍니다.
// 이 셋이 기록 하나 크기의 대부분인데, 선생님 화면의 분석에는 쓰이지
// 않습니다. 빼 두면 한 시간 수업에서 오가는 양이 수십 분의 일이 됩니다.
export const trimRecordForCloud = (record: AnswerRecord) => {
  const { support: _support, explanation: _explanation, visual: _visual, ...rest } = record;
  return rest;
};

// 받아 온 기록에는 위에서 뺀 자리가 비어 있습니다. 선생님 화면의 다른
// 코드가 그 자리를 그대로 읽으므로, 빈 값이라도 모양은 채워 돌려줍니다.
export const rehydrateCloudRecord = (raw: Partial<AnswerRecord>): AnswerRecord =>
  ({
    ...raw,
    explanation: raw.explanation ?? '',
    support: raw.support ?? emptySupport,
    choices: raw.choices ?? [],
  }) as AnswerRecord;

const isRecordLike = (value: unknown): value is Partial<AnswerRecord> =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as AnswerRecord).id === 'string' &&
  typeof (value as AnswerRecord).playerId === 'number';

const isPlayerLike = (value: unknown): value is Player =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Player).id === 'number' &&
  typeof (value as Player).name === 'string';

// 실시간 저장소는 목록을 배열이 아니라 "열쇠: 값" 꾸러미로 돌려줍니다.
export const valuesOf = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value.filter((item) => item !== null);
  if (typeof value === 'object' && value !== null) return Object.values(value);
  return [];
};

export const readCloudState = (
  playersPayload: unknown,
  recordsPayload: unknown,
): { players: Player[]; records: AnswerRecord[] } => ({
  players: valuesOf(playersPayload).filter(isPlayerLike),
  records: valuesOf(recordsPayload).filter(isRecordLike).map(rehydrateCloudRecord),
});

const requestJson = async (url: string, init?: RequestInit): Promise<unknown | null> => {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init });
    if (!response.ok) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const roomUrl = (target: Extract<RelayTarget, { kind: 'cloud' }>, path: string) =>
  `${target.dbUrl}/rooms/${encodeURIComponent(target.room)}${path}`;

// 선생님 화면은 새 기록만 알면 됩니다. 매번 전부 내려받으면 한 시간
// 수업에도 수백 MB가 오가므로, 가장 나중 것 몇 개만 받아 이미 아는
// 기록은 걸러 냅니다(같은 기록이 두 번 와도 id로 한 번만 셉니다).
const CLOUD_RECENT_RECORDS = 100;

export const relayPing = async (target: RelayTarget): Promise<boolean> => {
  if (target.kind === 'local') {
    return (await requestJson('/api/state')) !== null;
  }
  // 값이 없으면 null이 오지만, 읽을 수 있었다는 사실은 확인됩니다.
  try {
    const response = await fetch(roomUrl(target, '/ping.json'), { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
};

export const relayJoin = async (
  target: RelayTarget,
  player: { name: string; attendanceNo: number; avatar: string; difficulty: string },
): Promise<number | null> => {
  if (target.kind === 'local') {
    const result = (await requestJson('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
    })) as { id?: number } | null;
    return typeof result?.id === 'number' ? result.id : null;
  }

  // 폰이 스스로 번호를 정합니다. 한 반 안에서 겹칠 일이 사실상 없고,
  // 서버에 번호를 물어보는 왕복이 없어 첫 문제를 놓칠 틈도 줄어듭니다.
  const id = 100000 + Math.floor(Math.random() * 899999);
  const saved = await requestJson(roomUrl(target, `/players/${id}.json`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...player, id, color: '#7c6bd6' }),
  });
  return saved === null ? null : id;
};

export const relayRecord = async (target: RelayTarget, record: AnswerRecord): Promise<void> => {
  if (target.kind === 'local') {
    await requestJson('/api/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return;
  }

  await requestJson(roomUrl(target, '/records.json'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trimRecordForCloud(record)),
  });
};

export const relayState = async (
  target: RelayTarget,
): Promise<{ players: Player[]; records: AnswerRecord[] } | null> => {
  if (target.kind === 'local') {
    const data = (await requestJson('/api/state')) as
      | { players?: unknown; records?: unknown }
      | null;
    if (!data) return null;
    return readCloudState(data.players, data.records);
  }

  const [players, records] = await Promise.all([
    requestJson(roomUrl(target, '/players.json')),
    requestJson(
      roomUrl(target, `/records.json?orderBy=${encodeURIComponent('"$key"')}&limitToLast=${CLOUD_RECENT_RECORDS}`),
    ),
  ]);

  if (players === null && records === null) return null;
  return readCloudState(players, records);
};

export const relayReset = async (target: RelayTarget): Promise<void> => {
  if (target.kind === 'local') {
    await requestJson('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    return;
  }

  await requestJson(roomUrl(target, '.json'), { method: 'DELETE' });
};

// 선생님 컴퓨터에 남겨 두는 값은 '연결 주소'와 '방 이름'뿐입니다.
// 학생이 푼 기록은 여기에 담지 않습니다.
const DB_URL_KEY = 'grade2-math.relay.dbUrl';
const ROOM_KEY = 'grade2-math.relay.room';

export const loadSavedDbUrl = (): string => {
  try {
    return window.localStorage.getItem(DB_URL_KEY) ?? '';
  } catch {
    return '';
  }
};

export const saveDbUrl = (value: string): void => {
  try {
    if (value) window.localStorage.setItem(DB_URL_KEY, value);
    else window.localStorage.removeItem(DB_URL_KEY);
  } catch {
    // 저장이 막혀 있어도(사생활 보호 모드 등) 이번 수업에는 그대로 씁니다.
  }
};

export const loadOrCreateRoom = (): string => {
  try {
    const saved = window.localStorage.getItem(ROOM_KEY);
    if (saved && isRoomCode(saved)) return saved;
    const created = makeRoomCode();
    window.localStorage.setItem(ROOM_KEY, created);
    return created;
  } catch {
    return makeRoomCode();
  }
};
