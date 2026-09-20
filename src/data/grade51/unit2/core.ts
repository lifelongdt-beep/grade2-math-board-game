// ════════════════════════════════════════════════════════════════════
// 약수와 배수에 쓰는 셈
// ────────────────────────────────────────────────────────────────────
// 지도서가 못박아 둔 것: "최대공약수와 최소공배수는 두 수에 대하여
// 약수와 배수를 각각 나열하여 공통된 약수와 배수를 찾는 방법으로 그
// 의미를 이해하게 하고, 평가에서 소인수의 곱으로 나타내어 구하는
// 방법은 다루지 않는다."
//
// 그래서 여기서 내는 풀이는 두 가지뿐입니다.
//   방법 1  약수(배수)를 각각 늘어놓고 공통인 것을 찾는다
//   방법 2  두 수를 1이 아닌 공약수로 나누어 간다
// 소인수분해는 답을 구할 때도, 풀이를 적을 때도 쓰지 않습니다.
// ════════════════════════════════════════════════════════════════════

import { eul, gwa, i } from '../../grade5/util';

/** N의 약수를 작은 수부터 모두 구합니다. */
export const divisorsOf = (value: number): number[] => {
  const out: number[] = [];
  for (let k = 1; k <= value; k += 1) {
    if (value % k === 0) out.push(k);
  }
  return out;
};

/** N의 배수를 작은 수부터 count개 구합니다. */
export const multiplesOf = (value: number, count: number): number[] =>
  Array.from({ length: count }, (_, at) => value * (at + 1));

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

export const commonDivisors = (a: number, b: number): number[] => divisorsOf(gcd(a, b));

export const commonMultiples = (a: number, b: number, count: number): number[] =>
  multiplesOf(lcm(a, b), count);

/** '1, 2, 3, 6'처럼 적습니다. */
export const listText = (values: number[]): string => values.join(', ');

/**
 * 두 수를 1이 아닌 공약수로 차례대로 나누어 가는 과정입니다.
 * 지도서의 '방법 2'이고, 소인수분해가 아닙니다 — 나누는 수를 소수로
 * 고르지 않고, 눈에 보이는 공약수 아무것이나 씁니다.
 *
 *   ┌ 45  60      3) 45 60
 *   │ 15  20  →   5) 15 20
 *   └  3   4          3  4
 *   최대공약수 3×5=15, 최소공배수 3×5×3×4=180
 */
export type Ladder = {
  rows: Array<{ by: number; left: number; right: number }>;
  leftEnd: number;
  rightEnd: number;
  gcdParts: number[];
};

export const ladderOf = (a: number, b: number): Ladder => {
  const rows: Ladder['rows'] = [];
  const gcdParts: number[] = [];
  let left = a;
  let right = b;
  for (let guard = 0; guard < 12; guard += 1) {
    const common = gcd(left, right);
    if (common === 1) break;
    // 아이가 실제로 쓰는 대로, 눈에 잘 띄는 작은 공약수부터 나눕니다.
    let by = common;
    for (let k = 2; k <= common; k += 1) {
      if (common % k === 0) { by = k; break; }
    }
    left /= by;
    right /= by;
    gcdParts.push(by);
    rows.push({ by, left, right });
  }
  return { rows, leftEnd: left, rightEnd: right, gcdParts };
};

/** 방법 2를 글로 적은 풀이 줄입니다. */
export const ladderSteps = (a: number, b: number, want: 'gcd' | 'lcm'): string[] => {
  const ladder = ladderOf(a, b);
  const lines: string[] = [];
  if (!ladder.rows.length) {
    lines.push(`${gwa(String(a))} ${b}의 1이 아닌 공약수가 없습니다.`);
    lines.push(want === 'gcd'
      ? `그러므로 최대공약수는 1입니다.`
      : `그러므로 최소공배수는 ${a}×${b}=${a * b}입니다.`);
    return lines;
  }
  let left = a;
  let right = b;
  for (const row of ladder.rows) {
    lines.push(`${gwa(String(left))} ${eul(String(right))} 공약수 ${row.by}로 나누면 ${gwa(String(row.left))} ${i(String(row.right))} 됩니다.`);
    left = row.left;
    right = row.right;
  }
  lines.push(`더 이상 1이 아닌 공약수가 없습니다(${gwa(String(ladder.leftEnd))} ${ladder.rightEnd}).`);
  const parts = ladder.gcdParts.join('×');
  if (want === 'gcd') {
    lines.push(`나눈 수를 모두 곱하면 최대공약수입니다. ${parts}=${gcd(a, b)}`);
  } else {
    lines.push(`나눈 수와 마지막에 남은 두 수를 모두 곱하면 최소공배수입니다. ${parts}×${ladder.leftEnd}×${ladder.rightEnd}=${lcm(a, b)}`);
  }
  return lines;
};

/** 방법 1(늘어놓기)로 적은 풀이 줄입니다. */
export const listSteps = (a: number, b: number, want: 'gcd' | 'lcm'): string[] => {
  if (want === 'gcd') {
    return [
      `${a}의 약수: ${listText(divisorsOf(a))}`,
      `${b}의 약수: ${listText(divisorsOf(b))}`,
      `두 줄에 함께 있는 수가 공약수입니다. ${listText(commonDivisors(a, b))}`,
      `그중 가장 큰 수가 최대공약수이므로 ${gcd(a, b)}입니다.`,
    ];
  }
  const count = Math.max(4, Math.ceil(lcm(a, b) / Math.min(a, b)) + 1);
  return [
    `${a}의 배수: ${listText(multiplesOf(a, Math.min(count, 12)))}, …`,
    `${b}의 배수: ${listText(multiplesOf(b, Math.min(count, 12)))}, …`,
    `두 줄에 함께 있는 수가 공배수입니다. 가장 작은 수가 최소공배수이므로 ${lcm(a, b)}입니다.`,
  ];
};

/**
 * 문항에 쓰기 좋은 두 수를 고릅니다.
 *
 *  · 최대공약수가 1이 아니어야 공약수를 묻는 뜻이 있습니다.
 *  · 최소공배수가 너무 크면(200 넘게) 배수를 늘어놓아 찾는 방법이
 *    쓸 수 없게 됩니다 — 지도서가 권하는 방법이 안 되는 문항입니다.
 *  · 두 수가 같으면 문항이 되지 않습니다.
 */
export const pairFor = (
  next: (bound: number) => number,
  want: { gcdAtLeast?: number; lcmAtMost?: number } = {},
): [number, number] | null => {
  const gcdAtLeast = want.gcdAtLeast ?? 2;
  const lcmAtMost = want.lcmAtMost ?? 120;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const g = 2 + next(8);
    const m = 2 + next(7);
    const n = 2 + next(7);
    if (m === n) continue;
    if (gcd(m, n) !== 1) continue;
    const a = g * m;
    const b = g * n;
    if (a < 4 || b < 4 || a > 100 || b > 100) continue;
    if (gcd(a, b) < gcdAtLeast) continue;
    if (lcm(a, b) > lcmAtMost) continue;
    return a < b ? [a, b] : [b, a];
  }
  return null;
};
