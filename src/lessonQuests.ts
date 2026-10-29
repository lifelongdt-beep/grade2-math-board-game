// ════════════════════════════════════════════════════════════════════
// 일반 차시의 게임 요소: 실수 몬스터 · 오늘의 미션 · 나와의 경주
// ────────────────────────────────────────────────────────────────────
// 일반 차시는 한 칸에서도 아이마다 하·중·상 수준이 달라, 놀이 차시처럼 맞힌 수나
// 빠르기로 친구와 겨루면 공평하지 않습니다. 그래서 여기 셋은 모두 '나 자신'과
// 겨루고, 빠르기가 아니라 좋은 공부 습관(다시 풀기, 힌트 없이 풀기, 꾸준히 풀기)에
// 상을 줍니다.
//
//   · 실수 몬스터: 틀린 문제는 몇 문제 뒤에 다시 나옵니다(playerState.ts). 틀릴 때
//     '실수 몬스터'가 생기고, 그 문제가 돌아왔을 때 맞히면 잡습니다.
//   · 오늘의 미션: 아이마다 작은 미션 셋을 줍니다. 다 해내면 별을 더 받습니다.
//   · 나와의 경주: 같은 단원에서 지난번에 맞힌 수를 '지난번의 나'로 보여 줍니다.
// ════════════════════════════════════════════════════════════════════

/** 이번 판에 한 아이가 해낸 것입니다. 미션이 끝났는지 볼 때 씁니다. */
export interface 미션통계 {
  맞힘: number;
  /** 가장 길게 이어서 맞힌 수 */
  연속최고: number;
  /** 힌트 없이 가장 길게 이어서 맞힌 수 */
  힌트없이최고: number;
  잡은몬스터: number;
  /** 한 단계 위로 올라간 적이 있는지 */
  올라감: boolean;
}

export const 빈통계 = (): 미션통계 => ({ 맞힘: 0, 연속최고: 0, 힌트없이최고: 0, 잡은몬스터: 0, 올라감: false });

export interface 미션 {
  id: string;
  look: string;
  /** 칸 위에 짧게 보이는 말입니다. 좁은 칸에도 들어가게 짧게 씁니다. */
  글: string;
  됐나: (통계: 미션통계) => boolean;
}

export const 미션들: 미션[] = [
  { id: 'solve-5', look: '✏️', 글: '5문제 맞히기', 됐나: (t) => t.맞힘 >= 5 },
  { id: 'solve-8', look: '✏️', 글: '8문제 맞히기', 됐나: (t) => t.맞힘 >= 8 },
  { id: 'streak-3', look: '🔥', 글: '3문제 연속', 됐나: (t) => t.연속최고 >= 3 },
  { id: 'no-hint-3', look: '🧠', 글: '힌트 없이 3연속', 됐나: (t) => t.힌트없이최고 >= 3 },
  { id: 'catch-1', look: '👾', 글: '실수 몬스터 잡기', 됐나: (t) => t.잡은몬스터 >= 1 },
  { id: 'level-up', look: '🪜', 글: '한 단계 오르기', 됐나: (t) => t.올라감 },
];

// 앞부분(출석번호·차시)이 같은 글자는 끝 몇 글자만 달라 고르게 섞이지 않으므로, 마지막에 한 번 더 뒤섞습니다.
const 해시 = (text: string) => {
  let h = text.split('').reduce((sum, ch) => Math.imul(sum ^ ch.charCodeAt(0), 0x01000193) >>> 0, 0x811c9dc5);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};

/**
 * 오늘의 미션 셋입니다. 출석번호와 차시로 정하므로 같은 아이가 같은 차시를 다시 열면 같은 미션이고,
 * 다른 차시에서는 미션이 바뀝니다. 비슷한 미션(5문제·8문제)은 함께 나오지 않습니다.
 */
export const 오늘미션 = (attendanceNo: number, lessonId: string): 미션[] => {
  const 섞인 = [...미션들].sort((a, b) => 해시(`${attendanceNo}|${lessonId}|${a.id}`) - 해시(`${attendanceNo}|${lessonId}|${b.id}`));
  const 고른: 미션[] = [];
  for (const one of 섞인) {
    const 갈래 = one.id.split('-')[0];
    if (고른.some((x) => x.id.split('-')[0] === 갈래)) continue;
    고른.push(one);
    if (고른.length === 3) break;
  }
  return 고른;
};

/** 다 해냈을 때 더 주는 별입니다. */
export const 미션보너스별 = 3;
/** 실수 몬스터를 잡으면 더 주는 별입니다. */
export const 몬스터보너스별 = 1;
/** 지난번의 나를 넘어서면 더 주는 별입니다. */
export const 나이김보너스별 = 2;

// ── 나와의 경주: 단원마다 지난번 기록 ───────────────────────────────────

export interface 지난기록 {
  맞힘: number;
  /** 그때 수업 시간(초)입니다. 오늘 수업 시간이 다르면 이 비율로 맞춥니다. */
  초: number;
}

const 저장열쇠 = 'mathGhost:v1';

const 모두읽기 = (): Record<string, Record<string, 지난기록>> => {
  try {
    const raw = window.localStorage.getItem(저장열쇠);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const 지난나읽기 = (attendanceNo: number, 단원: string): 지난기록 | null => {
  const one = 모두읽기()[String(attendanceNo)]?.[단원];
  return one && Number.isFinite(one.맞힘) && Number.isFinite(one.초) && one.초 > 0 ? one : null;
};

export const 지난나쓰기 = (attendanceNo: number, 단원: string, 기록: 지난기록) => {
  try {
    const all = 모두읽기();
    all[String(attendanceNo)] = { ...(all[String(attendanceNo)] ?? {}), [단원]: 기록 };
    window.localStorage.setItem(저장열쇠, JSON.stringify(all));
  } catch {
    // 저장할 수 없는 환경(사생활 보호 창 등)이면 다음번에 견줄 기록이 없을 뿐입니다.
  }
};

export const 지난나모두지우기 = () => {
  try {
    window.localStorage.removeItem(저장열쇠);
  } catch {
    // 지울 수 없으면 그대로 둡니다.
  }
};

/**
 * 오늘 넘어서야 할 '지난번의 나'의 수입니다. 수업 시간이 다르면 같은 빠르기로 풀었을 때의 수로 맞춥니다
 * (지난번 10분에 8개였으면 오늘 5분 수업에서는 4개). 한 문제도 못 맞혔던 기록은 견주지 않습니다.
 */
export const 지난나목표 = (지난: 지난기록 | null, 오늘초: number): number | null => {
  if (!지난 || 지난.맞힘 <= 0) return null;
  return Math.max(1, Math.round((지난.맞힘 * 오늘초) / 지난.초));
};

// ── 개념 카드 도감: 차시마다 한 장 ──────────────────────────────────────
// 일반 차시에서 힌트 없이 3문제를 이어서 맞히면 그 차시의 개념 카드를 얻습니다. 그때 푼 문제의 수준에 따라
// 하는 동, 중은 은, 상은 금 카드이고, 나중에 더 높은 수준에서 해내면 카드가 올라갑니다. 단원의 차시 수만큼
// 칸이 있어, 무엇을 할 줄 알게 되었는지가 도감에 남습니다.

export type 카드등급 = '하' | '중' | '상';
export const 카드조건 = 3;
export const 카드모양: Record<카드등급, { look: string; 이름: string }> = {
  하: { look: '🥉', 이름: '동' },
  중: { look: '🥈', 이름: '은' },
  상: { look: '🥇', 이름: '금' },
};
const 등급차례: 카드등급[] = ['하', '중', '상'];

/** 카드에 적을 이름입니다. 차시 이름 끝의 '(1)' 같은 번호는 뺍니다. */
export const 카드이름 = (lessonTitle: string) => lessonTitle.replace(/\s*\(\d+\)\s*$/, '').trim();

const 카드열쇠 = 'mathCards:v1';

const 카드모두읽기 = (): Record<string, Record<string, 카드등급>> => {
  try {
    const raw = window.localStorage.getItem(카드열쇠);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/** 한 아이가 모은 카드입니다: 차시 id → 등급. */
export const 카드읽기 = (attendanceNo: number): Record<string, 카드등급> => {
  const 모음 = 카드모두읽기()[String(attendanceNo)] ?? {};
  return Object.fromEntries(Object.entries(모음).filter(([, 등급]) => 등급차례.includes(등급)));
};

/**
 * 카드를 넣습니다. 없던 카드면 'new', 등급이 올랐으면 'up', 이미 그 등급 이상이면 null을 돌려주고 아무것도 바꾸지 않습니다.
 */
export const 카드넣기 = (모음: Record<string, 카드등급>, lessonId: string, 등급: 카드등급): { 모음: Record<string, 카드등급>; 바뀜: 'new' | 'up' | null } => {
  const 있던 = 모음[lessonId];
  if (있던 && 등급차례.indexOf(있던) >= 등급차례.indexOf(등급)) return { 모음, 바뀜: null };
  return { 모음: { ...모음, [lessonId]: 등급 }, 바뀜: 있던 ? 'up' : 'new' };
};

export const 카드쓰기 = (attendanceNo: number, 모음: Record<string, 카드등급>) => {
  try {
    const all = 카드모두읽기();
    all[String(attendanceNo)] = 모음;
    window.localStorage.setItem(카드열쇠, JSON.stringify(all));
  } catch {
    // 저장할 수 없으면 이번 화면에서만 보입니다.
  }
};

export const 카드모두지우기 = () => {
  try {
    window.localStorage.removeItem(카드열쇠);
  } catch {
    // 지울 수 없으면 그대로 둡니다.
  }
};
