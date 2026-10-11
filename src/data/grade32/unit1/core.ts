import { rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-2 1단원 곱셈 — 수 고르기, 부분 곱, 틀린 계산
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례(교과서 예):
//   2 올림이 없는 (세 자리 수)×(한 자리 수)        123×2, 132×3, 432×2
//   3 일의 자리에서 올림이 있는 것                  126×3=378, 107×5, 326×3
//   4 십의 자리, 백의 자리에서 올림이 있는 것       132×4=528, 431×9=3879, 641×5
//   5 (몇십)×(몇십), (몇십몇)×(몇십)                30×20, 60×40, 16×20, 98×30
//   6 (한 자리 수)×(두 자리 수)                     4×17=68, 5×22, 4×57
//   7 올림이 한 번 있는 (두 자리 수)×(두 자리 수)   27×12, 21×15, 12×64, 31×29
//   8 올림이 여러 번 있는 것                        26×45=1170, 63×35, 53×68
//
// '올림이 한 번'은 교과서 예로 정합니다. 27×12는 54+270을 더할 때 십의
// 자리에서 받아올림이 있지만 '한 번'입니다(27×2의 7×2=14). 31×29는
// 31×9의 3×9=27이 백의 자리로 넘어가는 것이 그 한 번입니다. 그래서 부분
// 곱(곱해지는 수×곱하는 수의 한 자리)을 구할 때 생기는 올림만 셉니다.
//
// 틀린 값은 지도서 '(두 자리 수)×(두 자리 수)의 계산 오류 유형'(애슬럭,
// 2013)과 차시 학생 반응 그대로 계산합니다.
//   · 올림 오류: 일의 자리 곱에서 올림한 수를 십의 자리 곱에서도 씀
//   · 자릿값 오류: 69×30의 2070을 207로 써서 345+207=552
//   · 5×19=545처럼 올림하지 않고 곱을 나란히 씀
//   · 일의 자리에서 올림한 수를 더하지 않음(3-1과 같음)
// ════════════════════════════════════════════════════════════════════

export const 자리 = (n: number) => String(n).split('').reverse().map(Number);

/** a×d(d는 한 자리 수)에서 올림이 생기는 자리 수입니다. 맨 윗자리가 넘치는 것도 셉니다. */
export const carriesOne = (a: number, d: number): number => {
  let carry = 0;
  let count = 0;
  for (const digit of 자리(a)) {
    const v = digit * d + carry;
    carry = Math.floor(v / 10);
    if (carry > 0) count += 1;
  }
  return count;
};

/** 자리마다 올림이 생기는지(일, 십, 백 … 차례)입니다. */
export const carryPlaces = (a: number, d: number): boolean[] => {
  let carry = 0;
  return 자리(a).map((digit) => {
    const v = digit * d + carry;
    carry = Math.floor(v / 10);
    return carry > 0;
  });
};

/** (두 자리 수)×(두 자리 수)의 부분 곱에서 생기는 올림의 수입니다. */
export const carriesTwo = (a: number, b: number): number =>
  자리(b).reduce((sum, d) => sum + (d === 0 ? 0 : carriesOne(a, d)), 0);

// ── 틀린 값 ─────────────────────────────────────────────────────────

/** 올림한 수를 더하지 않음. 맨 윗자리 곱은 그대로 씁니다(3-1과 같음). */
export const noCarryOne = (a: number, d: number): number => {
  const ds = 자리(a);
  return ds.reduce((sum, digit, p) => sum + (p === ds.length - 1 ? digit * d : (digit * d) % 10) * 10 ** p, 0);
};

/** 곱셈구구 값을 자리마다 나란히 이어 씀(5×19 → 5와 45 → 545). */
export const sideBySide = (a: number, d: number): number =>
  Number(자리(a).reverse().map((digit) => String(digit * d)).join(''));

/** 자릿값 오류: 곱하는 수의 십의 자리 곱을 한 자리 내려 쓰지 않음(69×35 → 345+207). */
export const placeSlipTwo = (a: number, b: number): number => a * (b % 10) + a * Math.floor(b / 10);

/** 올림 오류: 일의 자리 곱에서 올림한 수를 십의 자리 곱에서도 더함. */
export const carryReuse = (a: number, b: number): number | null => {
  const o = b % 10;
  const t = Math.floor(b / 10);
  const c = Math.floor(((a % 10) * o) / 10);
  if (c === 0 || t === 0) return null;
  return a * o + (a * t + c * 10) * 10;
};

/** 부분 곱마다 올림을 빠뜨림. */
export const noCarryTwo = (a: number, b: number): number =>
  noCarryOne(a, b % 10) + noCarryOne(a, Math.floor(b / 10)) * 10;

// ── 수 고르기 ───────────────────────────────────────────────────────
export type Pair = { a: number; b: number };

export type Kind =
  | 'h0' // 올림 없는 (세)×(한)
  | 'h1' // 일의 자리에서만 올림
  | 'h2' // 십·백의 자리에서 올림(일의 자리 올림 없음)
  | 'tt' // (몇십)×(몇십)
  | 'nt' // (몇십몇)×(몇십)
  | 'od' // (한 자리 수)×(두 자리 수)
  | 'd1' // 올림이 한 번 있는 (두)×(두)
  | 'd2'; // 올림이 여러 번 있는 (두)×(두)

const 맞는가: Record<Kind, (a: number, b: number) => boolean> = {
  h0: (a, b) => a >= 100 && b < 10 && carriesOne(a, b) === 0,
  h1: (a, b) => {
    const p = carryPlaces(a, b);
    return a >= 100 && b < 10 && p[0] && !p[1] && !p[2];
  },
  h2: (a, b) => {
    const p = carryPlaces(a, b);
    return a >= 100 && b < 10 && !p[0] && (p[1] || p[2]);
  },
  tt: (a, b) => a % 10 === 0 && b % 10 === 0,
  nt: (a, b) => a % 10 !== 0 && b % 10 === 0,
  od: (a, b) => a < 10 && b % 10 !== 0,
  d1: (a, b) => carriesTwo(a, b) === 1,
  d2: (a, b) => carriesTwo(a, b) >= 2,
};

const 뽑기: Record<Kind, (next: (n: number) => number) => Pair> = {
  h0: (next) => ({ a: 100 + next(900), b: 2 + next(3) }),
  h1: (next) => ({ a: 100 + next(900), b: 2 + next(8) }),
  h2: (next) => ({ a: 100 + next(900), b: 2 + next(8) }),
  tt: (next) => ({ a: (1 + next(9)) * 10, b: (2 + next(8)) * 10 }),
  nt: (next) => ({ a: 11 + next(89), b: (2 + next(8)) * 10 }),
  od: (next) => ({ a: 2 + next(8), b: 11 + next(89) }),
  d1: (next) => ({ a: 11 + next(89), b: 11 + next(89) }),
  d2: (next) => ({ a: 11 + next(89), b: 11 + next(89) }),
};

export const pairFor = (kind: Kind, seed: number): Pair | null => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const { a, b } = 뽑기[kind](next);
    // 곱해지는 수·곱하는 수의 일의 자리가 0인 (두)×(두)는 5차시(몇십) 꼴이라 뺍니다.
    if ((kind === 'd1' || kind === 'd2') && (a % 10 === 0 || b % 10 === 0)) continue;
    // 11×11처럼 1만 있는 수는 계산이 너무 쉬워 뺍니다.
    if ((kind === 'd1' || kind === 'd2') && (a === 11 || b === 11)) continue;
    if (!맞는가[kind](a, b)) continue;
    return { a, b };
  }
  return null;
};

export const kindOk = (kind: Kind, a: number, b: number) => 맞는가[kind](a, b);

/** 틀린 값 후보입니다. 차례대로 쓰고, 정답과 같거나 0 이하인 것은 뺍니다. */
export const wrongsFor = (kind: Kind, { a, b }: Pair): number[] => {
  const r = a * b;
  const out: Array<number | null> = [];
  if (kind === 'h0' || kind === 'h1' || kind === 'h2') {
    out.push(noCarryOne(a, b), a * b - Math.floor(a / 100) * 100 * b + Math.floor(a / 100) * b, r + 10, r + 100, r - 100);
  } else if (kind === 'tt' || kind === 'nt') {
    // 0을 하나 빠뜨림 / 0을 하나 더 붙임 / 몇십에 곱하는 것을 잊음
    out.push(r / 10, r * 10, r + 100, r - 100, r + 10 * a);
  } else if (kind === 'od') {
    out.push(sideBySide(b, a), a * (b % 10) + a * Math.floor(b / 10), noCarryOne(b, a), r + 10, r - 10);
  } else {
    out.push(placeSlipTwo(a, b), carryReuse(a, b), noCarryTwo(a, b), r + 10, r - 10, r + 100);
  }
  return out.filter((v, at, all): v is number => v !== null && v > 0 && v !== r && Number.isInteger(v) && all.indexOf(v) === at);
};

// ── 풀이 ────────────────────────────────────────────────────────────
// 조사는 '을(를)'처럼 적어 두면 문항을 만들 때 앞말에 맞추어 고릅니다.

/** 교과서의 부분 곱 풀이입니다(자릿값이 보이게 몇백, 몇십을 그대로 씁니다). */
export const mulSteps = (kind: Kind, { a, b }: Pair): string[] => {
  const r = a * b;
  if (kind === 'h0' || kind === 'h1' || kind === 'h2') {
    const h = Math.floor(a / 100) * 100;
    const t = Math.floor((a % 100) / 10) * 10;
    const o = a % 10;
    const parts = [...(o ? [`${o}×${b}=${o * b}`] : []), ...(t ? [`${t}×${b}=${t * b}`] : []), `${h}×${b}=${h * b}`];
    return [
      `${a}=${[h, t, o].filter((v) => v).join('+')}이므로 자리마다 ${b}을(를) 곱합니다.`,
      `${parts.join(', ')}입니다.`,
      `${[o * b, t * b, h * b].filter((v) => v).join('+')}=${r}이므로 ${a}×${b}=${r}입니다.`,
    ];
  }
  if (kind === 'tt' || kind === 'nt') {
    const 몇 = b / 10;
    return [
      `${b}=${몇}×10이므로 ${a}×${b}=${a}×${몇}×10입니다.`,
      `${a}×${몇}=${a * 몇}이고, 여기에 10을 곱하면 ${r}입니다.`,
      `그러므로 ${a}×${b}=${r}입니다.`,
    ];
  }
  if (kind === 'od') {
    const t = Math.floor(b / 10) * 10;
    const o = b % 10;
    return [
      `${b}=${t}+${o}이므로 ${a}×${b}은(는) ${a}×${t}과(와) ${a}×${o}의 합입니다.`,
      `${a}×${t}=${a * t}, ${a}×${o}=${a * o}입니다.`,
      `${a * t}+${a * o}=${r}이므로 ${a}×${b}=${r}입니다.`,
    ];
  }
  const t = Math.floor(b / 10) * 10;
  const o = b % 10;
  return [
    `${b}=${t}+${o}이므로 ${a}×${o}과(와) ${a}×${t}을(를) 각각 구해 더합니다.`,
    `${a}×${o}=${a * o}입니다. ${a}×${t}은(는) ${a}×${t / 10}=${a * (t / 10)}의 10배인 ${a * t}입니다. 세로 셈에서는 한 자리 왼쪽에 맞추어 씁니다.`,
    `${a * o}+${a * t}=${r}이므로 ${a}×${b}=${r}입니다.`,
  ];
};

/** 가까운 몇십(일의 자리가 5면 정하지 않음), 가까운 몇백(십의 자리 이하가 50이면 정하지 않음)입니다. */
export const nearestTen = (v: number): number | null => (v % 10 === 5 ? null : v % 10 < 5 ? v - (v % 10) : v - (v % 10) + 10);
export const nearestHundred = (v: number): number | null => (v % 100 === 50 ? null : v % 100 < 50 ? v - (v % 100) : v - (v % 100) + 100);
