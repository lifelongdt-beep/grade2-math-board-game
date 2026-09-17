// ════════════════════════════════════════════════════════════════════
// 분수
// ────────────────────────────────────────────────────────────────────
// 5-2 2단원(분수의 곱셈)과 4단원(소수의 곱셈)이 씁니다.
//
// 분수는 소수로 바꾸어 다루지 않습니다. 1/3을 0.333…으로 바꾸면 곱한
// 뒤에 되돌릴 수가 없고, 답이 조금씩 어긋납니다. 여기서는 분자와 분모를
// 정수로만 들고 다니며 약분도 정수로 합니다.
//
// 답을 어떤 꼴로 적을지는 지도서를 따랐습니다. 지도서는 "계산 결과를
// 기약분수나 대분수로 나타내지 않아도 정답으로 인정한다"고 적어 두었지만,
// 보기에서 하나를 고르는 문항은 꼴이 하나여야 합니다. 그래서 교과서가
// 답을 적을 때 쓰는 꼴(기약분수, 가분수는 대분수로)로 통일하고, 풀이에
// 가분수에서 대분수로 고치는 줄을 남깁니다 — 6/5을 구한 아이가 보기에서
// '1과 1/5'을 찾을 수 있어야 하니까요.
// ════════════════════════════════════════════════════════════════════

import { gwa } from './util';

export type Frac = { n: number; d: number };

/**
 * 대분수를 글로 적습니다. '1과 3/4', '2와 4/7'.
 *
 * 자연수 부분을 소리 내어 읽었을 때 받침이 있으면 '과', 없으면 '와'입니다.
 *   1 일과   2 이와   3 삼과   4 사와   5 오와
 *   6 육과   7 칠과   8 팔과   9 구와
 * '2과 4/7'이라고 적으면 아이가 문장을 읽다가 걸립니다.
 */
export const mixedText = (front: number, n: number, d: number) => `${gwa(String(front))} ${n}/${d}`;

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** 약분한 분수를 만듭니다. 분모는 늘 양수입니다. */
export const frac = (n: number, d: number): Frac => {
  if (d === 0) throw new Error('분모가 0입니다.');
  const sign = d < 0 ? -1 : 1;
  const divisor = gcd(n, d) || 1;
  return { n: (sign * n) / divisor, d: (sign * d) / divisor };
};

/** 대분수를 가분수로 바꿉니다. 1과 3/4 → 7/4 */
export const mixed = (whole: number, n: number, d: number): Frac => frac(whole * d + n, d);

export const whole = (value: number): Frac => ({ n: value, d: 1 });

export const mul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
export const add = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const equals = (a: Frac, b: Frac) => a.n * b.d === b.n * a.d;
export const compare = (a: Frac, b: Frac) => a.n * b.d - b.n * a.d;
export const value = (f: Frac) => f.n / f.d;

export const isProper = (f: Frac) => Math.abs(f.n) < f.d;
export const isWhole = (f: Frac) => f.d === 1;

/**
 * 교과서가 답을 적는 꼴입니다.
 *   분모가 1이면 자연수, 진분수면 그대로, 가분수면 대분수.
 * 대분수는 '1과 3/4'으로 적습니다. '1 3/4'로 적으면 아이가 13/4이나
 * 1×3/4로 읽을 수 있습니다.
 */
export const text = (f: Frac): string => {
  if (f.d === 1) return String(f.n);
  if (Math.abs(f.n) < f.d) return `${f.n}/${f.d}`;
  const front = Math.floor(f.n / f.d);
  const rest = f.n - front * f.d;
  return rest === 0 ? String(front) : mixedText(front, rest, f.d);
};

/** 가분수 꼴 그대로입니다. 풀이에서 '6/5 = 1과 1/5'을 보일 때 씁니다. */
export const improperText = (f: Frac): string => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

/** 약분하지 않은 채로 적습니다. 풀이에서 곱한 직후의 모양을 보일 때 씁니다. */
export const rawText = (n: number, d: number): string => (d === 1 ? String(n) : `${n}/${d}`);

/** 대분수를 가분수로 고치는 줄입니다. 1과 3/4 → 7/4 */
export const mixedToImproper = (whole: number, n: number, d: number): string =>
  `${mixedText(whole, n, d)} = (${whole}×${d}+${n})/${d} = ${whole * d + n}/${d}`;

/** 글로 적힌 분수를 다시 읽습니다. 시험에서 문제 글을 되읽을 때 씁니다. */
export const parse = (input: string): Frac | null => {
  const trimmed = input.trim();
  const mixedHit = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(trimmed);
  if (mixedHit) return mixed(Number(mixedHit[1]), Number(mixedHit[2]), Number(mixedHit[3]));
  const fracHit = /^(\d+)\/(\d+)$/.exec(trimmed);
  if (fracHit) return frac(Number(fracHit[1]), Number(fracHit[2]));
  const wholeHit = /^(\d+)$/.exec(trimmed);
  if (wholeHit) return whole(Number(wholeHit[1]));
  return null;
};
