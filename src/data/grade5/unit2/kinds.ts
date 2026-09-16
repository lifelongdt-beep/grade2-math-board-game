import type { FractionModelVisual } from '../../../types';
import { add, frac, mixed, mixedText, mul, text, whole, type Frac } from '../fraction';
import { rand } from '../util';

// ════════════════════════════════════════════════════════════════════
// 2단원이 다루는 여섯 가지 곱셈
// ────────────────────────────────────────────────────────────────────
// 지도서의 2~8차시가 곱셈의 종류를 하나씩 맡습니다. 여섯 차시가 하는
// 일은 같고 '무엇과 무엇을 곱하는가'만 다르므로, 여기 한 벌을 두고
// 종류로 가릅니다.
//
// 오답은 지도서 '단원 배경지식'의 오류 유형 표에서 가져왔습니다. 그
// 표가 아이들이 실제로 저지르는 잘못을 적어 둔 것이라, 아무 수나 넣는
// 것보다 훨씬 쓸모가 있습니다.
//   · 대분수를 가분수로 바꾸지 않고 그대로 분자를 곱하는 경우
//   · 자연수와 분수의 곱셈에서 자연수를 분모에 곱하는 경우
//   · 대분수를 가분수로 바꾸지 않고 약분하는 경우
// ════════════════════════════════════════════════════════════════════

export type Kind = 'proper-whole' | 'mixed-whole' | 'whole-proper' | 'whole-mixed' | 'proper-proper' | 'mixed-mixed';

export const kindName: Record<Kind, string> = {
  'proper-whole': '(진분수)×(자연수)',
  'mixed-whole': '(대분수)×(자연수)',
  'whole-proper': '(자연수)×(진분수)',
  'whole-mixed': '(자연수)×(대분수)',
  'proper-proper': '(진분수)×(진분수)',
  'mixed-mixed': '(대분수)×(대분수)',
};

/** 문제에 쓸 두 수입니다. 글에 적히는 모양까지 함께 들고 다닙니다. */
export type Operands = {
  kind: Kind;
  left: Frac;
  right: Frac;
  leftText: string;
  rightText: string;
  // 대분수의 자연수 부분과 분수 부분입니다. 가분수로 고치는 풀이에 씁니다.
  leftParts?: { whole: number; n: number; d: number };
  rightParts?: { whole: number; n: number; d: number };
};

// 교과서는 문제에 2/4 같은 수를 쓰지 않습니다. 이미 약분되는 분수를
// 그대로 내면 답도 2/4처럼 나와, 아이가 기약분수로 고쳐야 하는지
// 아닌지를 알 수 없게 됩니다. 분자와 분모가 서로소인 것만 씁니다.
const 서로소 = (a: number, b: number): boolean => {
  for (let factor = 2; factor <= Math.min(a, b); factor += 1) {
    if (a % factor === 0 && b % factor === 0) return false;
  }
  return true;
};

const properFraction = (next: (bound: number) => number): { n: number; d: number } => {
  for (let tries = 0; tries < 30; tries += 1) {
    const d = 3 + next(7); // 3 ~ 9
    const n = 1 + next(d - 1);
    if (서로소(n, d)) return { n, d };
  }
  return { n: 1, d: 3 };
};

export const operandsFor = (kind: Kind, seed: number): Operands => {
  const next = rand(seed);

  if (kind === 'proper-whole') {
    const { n, d } = properFraction(next);
    const k = 2 + next(8);
    return { kind, left: frac(n, d), right: whole(k), leftText: `${n}/${d}`, rightText: String(k) };
  }
  if (kind === 'whole-proper') {
    const { n, d } = properFraction(next);
    const k = 2 + next(8);
    return { kind, left: whole(k), right: frac(n, d), leftText: String(k), rightText: `${n}/${d}` };
  }
  if (kind === 'mixed-whole') {
    const { n, d } = properFraction(next);
    const w = 1 + next(3);
    const k = 2 + next(6);
    return {
      kind,
      left: mixed(w, n, d),
      right: whole(k),
      leftText: `${mixedText(w, n, d)}`,
      rightText: String(k),
      leftParts: { whole: w, n, d },
    };
  }
  if (kind === 'whole-mixed') {
    const { n, d } = properFraction(next);
    const w = 1 + next(3);
    const k = 2 + next(6);
    return {
      kind,
      left: whole(k),
      right: mixed(w, n, d),
      leftText: String(k),
      rightText: `${mixedText(w, n, d)}`,
      rightParts: { whole: w, n, d },
    };
  }
  if (kind === 'proper-proper') {
    const a = properFraction(next);
    const b = properFraction(next);
    return {
      kind,
      left: frac(a.n, a.d),
      right: frac(b.n, b.d),
      leftText: `${a.n}/${a.d}`,
      rightText: `${b.n}/${b.d}`,
    };
  }
  // mixed-mixed
  const a = properFraction(next);
  const b = properFraction(next);
  const w1 = 1 + next(2);
  const w2 = 1 + next(2);
  return {
    kind,
    left: mixed(w1, a.n, a.d),
    right: mixed(w2, b.n, b.d),
    leftText: `${mixedText(w1, a.n, a.d)}`,
    rightText: `${mixedText(w2, b.n, b.d)}`,
    leftParts: { whole: w1, n: a.n, d: a.d },
    rightParts: { whole: w2, n: b.n, d: b.d },
  };
};

/**
 * 아이들이 실제로 하는 잘못으로 만든 오답입니다.
 * 답과 같아지는 것은 부르는 쪽에서 거릅니다.
 */
export const wrongAnswersFor = (operands: Operands): string[] => {
  const { left, right, leftParts, rightParts } = operands;
  const wrong: Frac[] = [];

  if (operands.kind === 'proper-whole') {
    const k = right.n;
    // 자연수를 분모에 곱함
    wrong.push(frac(left.n, left.d * k));
    // 곱하지 않고 그대로 둠(분자와 분모에 모두 곱해 약분된다고 생각)
    wrong.push(left);
    // 곱셈을 덧셈으로
    wrong.push(add(left, whole(k)));
    // 자연수를 분자에 더함
    wrong.push(frac(left.n + k, left.d));
  } else if (operands.kind === 'whole-proper') {
    const k = left.n;
    wrong.push(frac(right.n, right.d * k));
    wrong.push(right);
    wrong.push(add(whole(k), right));
    // 분자와 분모를 뒤집어 곱함(나눗셈과 헷갈림)
    wrong.push(frac(k * right.d, right.n));
  } else if (operands.kind === 'mixed-whole' && leftParts) {
    const k = right.n;
    // 자연수 부분만 곱함
    wrong.push(mixed(leftParts.whole * k, leftParts.n, leftParts.d));
    // 분수 부분만 곱함
    wrong.push(add(whole(leftParts.whole), frac(leftParts.n * k, leftParts.d)));
    // 가분수로 바꾸지 않고 자연수 부분과 분수 부분에 따로 곱함
    wrong.push(add(whole(leftParts.whole * k), frac(leftParts.n * k, leftParts.d * k)));
    wrong.push(add(left, whole(k)));
  } else if (operands.kind === 'whole-mixed' && rightParts) {
    const k = left.n;
    wrong.push(whole(k * rightParts.whole));
    wrong.push(add(whole(k * rightParts.whole), frac(rightParts.n, rightParts.d)));
    wrong.push(mixed(k * rightParts.whole, rightParts.n, rightParts.d * k));
    wrong.push(add(whole(k), mixed(rightParts.whole, rightParts.n, rightParts.d)));
  } else if (operands.kind === 'proper-proper') {
    // 분자끼리 더하고 분모끼리 더함
    wrong.push(frac(left.n + right.n, left.d + right.d));
    // 뒤집어 곱함
    wrong.push(frac(left.n * right.d, left.d * right.n));
    // 분모는 한쪽만 씀
    wrong.push(frac(left.n * right.n, right.d));
    wrong.push(add(left, right));
  } else if (operands.kind === 'mixed-mixed' && leftParts && rightParts) {
    // 지도서 오류 유형: 가분수로 바꾸지 않고 자연수끼리, 분수끼리 곱함
    wrong.push(add(whole(leftParts.whole * rightParts.whole), frac(leftParts.n * rightParts.n, leftParts.d * rightParts.d)));
    wrong.push(whole(leftParts.whole * rightParts.whole));
    wrong.push(add(left, right));
    wrong.push(mul(whole(leftParts.whole), right));
  }

  return wrong.map(text);
};

/** 차시마다 지도서가 쓰는 그림입니다. */
export const modelFor = (operands: Operands): FractionModelVisual | undefined => {
  if (operands.kind === 'proper-whole' && operands.right.n <= 5) {
    return {
      kind: 'fraction-model',
      label: '같은 만큼씩 여러 번',
      shape: 'bar',
      denominator: operands.left.d,
      numerator: operands.left.n,
      repeat: operands.right.n,
    };
  }
  if (operands.kind === 'whole-proper') {
    return {
      kind: 'fraction-model',
      label: '똑같이 나눈 것 중 몇 묶음',
      shape: 'part',
      denominator: operands.right.d,
      numerator: operands.right.n,
      whole: operands.left.n,
    };
  }
  if (operands.kind === 'proper-proper') {
    return {
      kind: 'fraction-model',
      label: '가로와 세로로 나눈 넓이',
      shape: 'area',
      denominator: operands.right.d,
      numerator: operands.right.n,
      columns: operands.left.d,
      shadedColumns: operands.left.n,
      rows: operands.right.d,
      shadedRows: operands.right.n,
    };
  }
  return undefined;
};

/** 그 차시에서 가르치는 계산 방법을 말로 적은 것입니다. */
export const methodText: Record<Kind, string> = {
  'proper-whole': '분모는 그대로 두고 분자와 자연수를 곱합니다.',
  'mixed-whole': '대분수를 가분수로 고친 다음, 분모는 그대로 두고 분자와 자연수를 곱합니다.',
  'whole-proper': '자연수와 분자를 곱하고 분모는 그대로 둡니다.',
  'whole-mixed': '대분수를 가분수로 고친 다음, 자연수와 분자를 곱하고 분모는 그대로 둡니다.',
  'proper-proper': '분자는 분자끼리, 분모는 분모끼리 곱합니다.',
  'mixed-mixed': '대분수를 가분수로 고친 다음, 분자는 분자끼리, 분모는 분모끼리 곱합니다.',
};

export const wrongMethods: Record<Kind, string[]> = {
  'proper-whole': ['분자는 그대로 두고 분모와 자연수를 곱합니다.', '분자와 분모에 모두 자연수를 곱합니다.', '분자에 자연수를 더합니다.'],
  'mixed-whole': ['자연수 부분에만 자연수를 곱합니다.', '분수 부분에만 자연수를 곱합니다.', '대분수를 그대로 두고 분모와 자연수를 곱합니다.'],
  'whole-proper': ['자연수와 분모를 곱하고 분자는 그대로 둡니다.', '자연수와 분자, 자연수와 분모를 모두 곱합니다.', '자연수와 분수를 더합니다.'],
  'whole-mixed': ['자연수끼리만 곱합니다.', '대분수를 그대로 두고 자연수와 분모를 곱합니다.', '자연수와 대분수를 더합니다.'],
  'proper-proper': ['분자는 분자끼리 더하고 분모는 분모끼리 더합니다.', '한쪽 분수의 분자와 다른 쪽 분수의 분모를 곱합니다.', '분모는 한쪽 것을 그대로 씁니다.'],
  'mixed-mixed': ['자연수 부분끼리 곱하고 분수 부분끼리 곱합니다.', '자연수 부분끼리만 곱합니다.', '대분수를 그대로 두고 분자끼리, 분모끼리 곱합니다.'],
};
