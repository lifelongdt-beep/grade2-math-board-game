import { rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-1 4단원 곱셈 — (두 자리 수)×(한 자리 수)의 수 고르기와 계산
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례(교과서 예):
//   2 올림이 없는 것           21×3, 24×2, 20×4
//   3 십의 자리에서 올림       32×4=128, 41×6, 70×2
//   4 일의 자리에서 올림       18×2=36
//   5 올림이 두 번 있는 것     36×4=144, 35×7, 58×7
// 차시마다 올림이 일어나는 자리를 직접 세어 그 꼴만 씁니다.
//
// 오답은 지도서 '(두 자리 수)×(한 자리 수)의 계산 오류 유형'(애슬럭,
// 2013) 그대로 계산합니다.
//   ① 일의 자리에서 올림을 하지 않는 오류   48×7 → 286
//   ② 올림한 수를 잘못 계산한 오류         53×8 → 564 (5+2를 먼저 하고 8을 곱함)
//   ③ 자릿값을 맞추지 못한 오류           24×8 → 48 (20×8 대신 2×8)
// ════════════════════════════════════════════════════════════════════

export type MulKind = 'none' | 'tens' | 'ones' | 'both';

export type Mul = { a: number; m: number; result: number; kind: MulKind };

export const kindOf = (a: number, m: number): MulKind => {
  const o = a % 10;
  const t = Math.floor(a / 10);
  const onesCarry = o * m >= 10;
  const carry = Math.floor((o * m) / 10);
  const tensOver = t * m + carry >= 10;
  if (!onesCarry && !tensOver) return 'none';
  if (!onesCarry && tensOver) return 'tens';
  if (onesCarry && !tensOver) return 'ones';
  return 'both';
};

export const mulFor = (kind: MulKind, seed: number): Mul => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const a = 11 + next(89);
    const m = 2 + next(8);
    // 11×m처럼 같은 숫자가 반복되거나 몇십(20, 30)만 계속 나오지 않게 섞습니다.
    if (kindOf(a, m) !== kind) continue;
    return { a, m, result: a * m, kind };
  }
  const fallback: Record<MulKind, [number, number]> = { none: [21, 3], tens: [32, 4], ones: [18, 2], both: [36, 4] };
  const [a, m] = fallback[kind];
  return { a, m, result: a * m, kind };
};

/** ① 일의 자리에서 올림한 수를 더하지 않은 값 */
export const noCarry = (a: number, m: number) => {
  const o = a % 10;
  const t = Math.floor(a / 10);
  return t * m * 10 + ((o * m) % 10);
};

/** ② 올림한 수를 십의 자리 숫자에 먼저 더하고 곱한 값 */
export const carryFirst = (a: number, m: number) => {
  const o = a % 10;
  const t = Math.floor(a / 10);
  const carry = Math.floor((o * m) / 10);
  return (t + carry) * m * 10 + ((o * m) % 10);
};

/** ③ 십의 자리를 곱한 값의 자릿값을 맞추지 못한 값(20×8 대신 2×8을 더함) */
export const placeSlip = (a: number, m: number) => {
  const o = a % 10;
  const t = Math.floor(a / 10);
  return o * m + t * m;
};

export const wrongResults = (one: Mul): number[] =>
  [
    noCarry(one.a, one.m),
    carryFirst(one.a, one.m),
    placeSlip(one.a, one.m),
    one.result + 10,
    one.result - 10,
    one.result + 100,
  ].filter((v, at, all) => v > 0 && v !== one.result && all.indexOf(v) === at);

/** 교과서의 세로 계산처럼 일의 자리부터 곱하는 풀이입니다. */
export const mulSteps = (one: Mul): string[] => {
  const { a, m } = one;
  const o = a % 10;
  const t = Math.floor(a / 10);
  const op = o * m;
  const carry = Math.floor(op / 10);
  const lines: string[] = [];
  if (op >= 10) {
    lines.push(`일의 자리: ${o}×${m}=${op}. 일의 자리에 ${op % 10}을 쓰고 ${carry}을 십의 자리로 올림합니다.`);
    lines.push(`십의 자리: ${t}×${m}=${t * m}, 올림한 ${carry}을 더하면 ${t * m + carry}입니다.`);
  } else {
    lines.push(`일의 자리: ${o}×${m}=${op}.`);
    lines.push(`십의 자리: ${t}×${m}=${t * m}. 이것은 ${t * 10}×${m}=${t * 10 * m}을 나타냅니다.`);
  }
  lines.push(`그러므로 ${a}×${m}=${one.result}입니다.`);
  return lines.map(받침맞추기);
};

// 숫자 뒤 '을'을 숫자의 받침에 맞춥니다(2을 → 2를).
const 받침있는숫자 = [true, true, false, true, false, false, true, true, true, false];
const 받침맞추기 = (line: string) =>
  line.replace(/(\d)(을|를)(?=\s)/g, (_, digit: string) => `${digit}${받침있는숫자[Number(digit)] ? '을' : '를'}`);

/** 가까운 몇십입니다. 일의 자리가 5이면 정해지지 않으므로 null입니다. */
export const nearestTen = (value: number): number | null => {
  const rest = value % 10;
  if (rest === 5) return null;
  return rest < 5 ? value - rest : value - rest + 10;
};
