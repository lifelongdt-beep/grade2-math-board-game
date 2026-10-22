// ════════════════════════════════════════════════════════════════════
// 별과 꾸미기, 배지, 불꽃 — 다음 시간에도 이어서 하고 싶게
// ────────────────────────────────────────────────────────────────────
// 판이 끝나면 맞힌 수가 사라져서, 아이에게 남는 것이 없었습니다. 맞힐 때마다
// 별을 모아 두고(이 컴퓨터, 출석 번호마다), 모인 별로 캐릭터에 모자·망토·
// 배경을 하나씩 붙입니다. 배지는 빠르기가 아니라 처음 해낸 일에 줍니다.
// 화면 없이 확인할 수 있도록 셈은 모두 여기 둡니다(rewards.test.ts).
// ════════════════════════════════════════════════════════════════════

export type 꾸미개자리 = 'hat' | 'cape' | 'bg';

export interface 꾸미개 {
  id: string;
  slot: 꾸미개자리;
  /** 모자는 그림 글자, 망토와 배경은 CSS 이름(styles.css의 cape-*, bg-*)입니다. */
  look: string;
  name: string;
  /** 알림에 함께 띄우는 그림 글자입니다. */
  icon: string;
  /** 모은 별이 이만큼이 되면 붙습니다. */
  stars: number;
}

// 처음 몇 개는 금방 열리게 하고, 뒤로 갈수록 사이를 넓힙니다. 한 시간(맞힌 문제 스무 개 남짓)에
// 하나쯤은 새것이 붙어야 '다음 시간'이 기다려집니다.
export const 꾸미개들: 꾸미개[] = [
  { id: 'hat-ribbon', slot: 'hat', look: '🎀', name: '리본', icon: '🎀', stars: 5 },
  { id: 'cape-red', slot: 'cape', look: 'cape-red', name: '빨간 망토', icon: '🦸', stars: 15 },
  { id: 'bg-rainbow', slot: 'bg', look: 'bg-rainbow', name: '무지개 배경', icon: '🌈', stars: 30 },
  { id: 'hat-cap', slot: 'hat', look: '🧢', name: '모자', icon: '🧢', stars: 50 },
  { id: 'cape-blue', slot: 'cape', look: 'cape-blue', name: '파란 별 망토', icon: '🦸', stars: 75 },
  { id: 'bg-sea', slot: 'bg', look: 'bg-sea', name: '바다 배경', icon: '🌊', stars: 100 },
  { id: 'hat-tophat', slot: 'hat', look: '🎩', name: '마술 모자', icon: '🎩', stars: 140 },
  { id: 'cape-gold', slot: 'cape', look: 'cape-gold', name: '황금 망토', icon: '🦸', stars: 190 },
  { id: 'bg-space', slot: 'bg', look: 'bg-space', name: '우주 배경', icon: '🌌', stars: 250 },
  { id: 'hat-crown', slot: 'hat', look: '👑', name: '왕관', icon: '👑', stars: 320 },
  { id: 'cape-rainbow', slot: 'cape', look: 'cape-rainbow', name: '무지개 망토', icon: '🦸', stars: 400 },
  { id: 'bg-castle', slot: 'bg', look: 'bg-castle', name: '성 배경', icon: '🏰', stars: 500 },
];

export type 차림 = Partial<Record<꾸미개자리, 꾸미개>>;

/** 모은 별로 붙는 자리마다 가장 좋은 꾸미개입니다. */
export const 차림새 = (stars: number): 차림 => {
  const 차림: 차림 = {};
  for (const item of 꾸미개들) if (stars >= item.stars) 차림[item.slot] = item;
  return 차림;
};

/** 다음에 붙을 꾸미개와, 그때까지 남은 별입니다. 다 모았으면 null입니다. */
export const 다음꾸미개 = (stars: number): { item: 꾸미개; left: number } | null => {
  const item = 꾸미개들.find((one) => one.stars > stars);
  return item ? { item, left: item.stars - stars } : null;
};

/** 별이 늘면서 새로 붙은 꾸미개들입니다. */
export const 새로붙은 = (before: number, after: number): 꾸미개[] =>
  꾸미개들.filter((item) => before < item.stars && item.stars <= after);

// ── 맞힌 문제 하나에 붙는 별 ──────────────────────────────────────────

/**
 * 맞히면 별 하나, 황금 문제는 두 배입니다. 마지막 피버 타임에는 하나를 더 얹습니다.
 * 틀린 문제에는 별을 빼앗지 않습니다 — 별은 모으기만 합니다.
 */
export const 받을별 = (o: { golden: boolean; fever: boolean }) => (o.golden ? 2 : 1) + (o.fever ? 1 : 0);

// ── 황금 문제 ──────────────────────────────────────────────────────────

/**
 * 융합 문항은 늘 황금 문제입니다. 어려운 문제가 벌이 아니라 상으로 느껴지게 합니다.
 * 나머지는 열에 하나쯤, 판(seed)마다 다른 문제가 황금이 됩니다. 되돌아온 문제는 황금이 아닙니다
 * (틀린 문제를 다시 풀어 별을 두 배로 받으면, 일부러 틀리는 편이 낫게 됩니다).
 */
export const 황금문제인가 = (o: { questionId: string; seed: number; fusion?: boolean; retry: boolean }) => {
  if (o.retry) return false;
  if (o.fusion) return true;
  let h = (o.seed ^ 0x9e3779b9) >>> 0;
  for (const ch of o.questionId) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0;
  return (h ^ (h >>> 13)) % 10 === 0;
};

// ── 연속 정답 불꽃 ────────────────────────────────────────────────────

/** 3·5·10연속에서 불꽃이 한 단계씩 커집니다. */
export const 불꽃문턱 = [3, 5, 10] as const;

export const 불꽃단계 = (count: number): 0 | 1 | 2 | 3 =>
  count >= 불꽃문턱[2] ? 3 : count >= 불꽃문턱[1] ? 2 : count >= 불꽃문턱[0] ? 1 : 0;

/**
 * 틀리면 불꽃이 한 단계만 줄어듭니다. 한 번 틀렸다고 처음부터면 다시 쌓을 마음이 꺾입니다.
 * 줄어든 단계의 문턱에서 다시 셉니다(10연속 불꽃에서 틀리면 5연속 불꽃으로).
 */
export const 틀린뒤불꽃 = (count: number): number => {
  const 단계 = 불꽃단계(count);
  return 단계 <= 1 ? 0 : 불꽃문턱[단계 - 2];
};

// ── '처음 해냈다' 배지 ────────────────────────────────────────────────

export interface 배지 {
  id: string;
  look: string;
  name: string;
  /** 아이에게 보이는 말입니다. 빠르기나 등수가 아니라 해낸 일을 말합니다. */
  says: string;
}

export const 배지들: 배지[] = [
  { id: 'first-correct', look: '🌱', name: '첫걸음', says: '첫 문제를 맞혔어요' },
  { id: 'reach-mid', look: '🪜', name: '한 계단 위로', says: '처음으로 중 단계에 올라갔어요' },
  { id: 'reach-top', look: '🏔️', name: '꼭대기', says: '처음으로 상 단계에 올라갔어요' },
  { id: 'no-hint-5', look: '🧠', name: '스스로 다섯', says: '힌트 없이 다섯 문제를 이어서 맞혔어요' },
  { id: 'fix-friend', look: '🤝', name: '친구 도우미', says: '친구의 실수를 처음으로 바르게 고쳤어요' },
  { id: 'retry-win', look: '💪', name: '다시 도전 성공', says: '틀렸던 문제를 다시 만나 맞혔어요' },
  { id: 'hint-then-solve', look: '💡', name: '힌트 활용', says: '힌트를 보고 끝까지 풀어냈어요' },
  { id: 'flame-10', look: '🔥', name: '큰 불꽃', says: '열 문제를 이어서 맞혔어요' },
  { id: 'golden', look: '🌟', name: '황금 문제', says: '황금 문제를 처음으로 맞혔어요' },
  { id: 'stars-100', look: '💯', name: '별 백 개', says: '별을 모두 백 개 모았어요' },
];

const 배지표 = new Map(배지들.map((one) => [one.id, one]));
export const 배지찾기 = (id: string) => 배지표.get(id);

/** 맞힌 문제 하나를 두고 배지를 볼 때 필요한 것입니다. */
export interface 맞힌일 {
  correct: boolean;
  /** 방금 문제를 풀고 난 뒤의 수준입니다. */
  levelAfter: '하' | '중' | '상';
  hintUsed: boolean;
  /** 힌트 없이 이어서 맞힌 수(방금 것까지)입니다. */
  noHintRun: number;
  /** 연속 정답 불꽃의 수(방금 것까지)입니다. */
  fireCount: number;
  friendFix: boolean;
  retry: boolean;
  golden: boolean;
  totalStars: number;
}

/** 이 일로 새로 받는 배지입니다(이미 받은 것은 빼고). */
export const 새배지 = (일: 맞힌일, 가진: ReadonlySet<string>): 배지[] => {
  const 얻은: string[] = [];
  if (일.correct) {
    얻은.push('first-correct');
    if (일.noHintRun >= 5) 얻은.push('no-hint-5');
    if (일.friendFix) 얻은.push('fix-friend');
    if (일.retry) 얻은.push('retry-win');
    if (일.hintUsed) 얻은.push('hint-then-solve');
    if (일.fireCount >= 10) 얻은.push('flame-10');
    if (일.golden) 얻은.push('golden');
  }
  if (일.levelAfter !== '하') 얻은.push('reach-mid');
  if (일.levelAfter === '상') 얻은.push('reach-top');
  if (일.totalStars >= 100) 얻은.push('stars-100');
  return 얻은.filter((id) => !가진.has(id)).map((id) => 배지표.get(id)!);
};

// ── 저장: 이 컴퓨터, 출석 번호마다 ───────────────────────────────────

export interface 기록장 {
  stars: number;
  badges: string[];
}

const 저장열쇠 = 'mathRewards:v1';

const 읽기 = (): Record<string, 기록장> => {
  try {
    const raw = window.localStorage.getItem(저장열쇠);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const 기록장읽기 = (attendanceNo: number): 기록장 => {
  const one = 읽기()[String(attendanceNo)];
  return {
    stars: Number.isFinite(one?.stars) ? Math.max(0, Math.floor(one.stars)) : 0,
    badges: Array.isArray(one?.badges) ? one.badges.filter((id: unknown) => typeof id === 'string' && 배지표.has(id)) : [],
  };
};

export const 기록장쓰기 = (attendanceNo: number, 장: 기록장) => {
  try {
    const all = 읽기();
    all[String(attendanceNo)] = 장;
    window.localStorage.setItem(저장열쇠, JSON.stringify(all));
  } catch {
    // 저장할 수 없는 환경(사생활 보호 창 등)이면 이번 수업에만 남습니다.
  }
};

/** 선생님이 새 반을 맡거나 학년이 바뀌었을 때 모두 지웁니다. */
export const 기록장모두지우기 = () => {
  try {
    window.localStorage.removeItem(저장열쇠);
  } catch {
    // 지울 수 없는 환경이면 그대로 둡니다.
  }
};
