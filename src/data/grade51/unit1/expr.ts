import { pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 자연수의 혼합 계산에 쓰는 식
// ────────────────────────────────────────────────────────────────────
// 이 단원의 문항은 거의 모두 식 하나에서 나옵니다 — 계산하기, 먼저
// 계산해야 하는 부분 찾기, ( )가 있을 때와 없을 때 견주기, 바르게 계산한
// 것 고르기. 그래서 식을 글자가 아니라 나무(tree)로 들고 다닙니다.
//
// 글자로 들고 다니면 답을 사람이 적어야 하고, 적은 답이 틀리면 아이가
// 그것을 배웁니다. 나무로 들고 있으면 답도 풀이 줄도 계산해서 냅니다.
//
// 지도서: "자연수의 혼합 계산은 계산 순서에 중점을 두고, 지나치게
// 복잡한 혼합 계산은 다루지 않는다." 그래서 수는 셋에서 다섯까지,
// ( )는 하나만 씁니다.
// ════════════════════════════════════════════════════════════════════

export type Op = '+' | '-' | '×' | '÷';

export type Node =
  | { kind: 'num'; value: number }
  | { kind: 'op'; op: Op; left: Node; right: Node; paren?: boolean };

export const num = (value: number): Node => ({ kind: 'num', value });
export const op = (o: Op, left: Node, right: Node): Node => ({ kind: 'op', op: o, left, right });
/** ( )로 묶습니다. 묶은 곳은 가장 먼저 계산합니다. */
export const par = (node: Node): Node =>
  node.kind === 'op' ? { ...node, paren: true } : node;

/** 식을 글로 적습니다. 12-2×5+7, 8+15÷(9-4) */
export const render = (node: Node): string => {
  if (node.kind === 'num') return String(node.value);
  const body = `${render(node.left)}${node.op}${render(node.right)}`;
  return node.paren ? `(${body})` : body;
};

const apply = (o: Op, a: number, b: number): number | null => {
  if (o === '+') return a + b;
  if (o === '-') return a - b < 0 ? null : a - b;
  if (o === '×') return a * b;
  if (b === 0 || a % b !== 0) return null;
  return a / b;
};

// 다음에 계산할 곳을 찾습니다.
//
// 규칙은 하나뿐입니다 — 적힌 차례대로 훑어서, 두 쪽이 모두 수인 연산을
// 처음 만나는 곳. 나무를 우선순위대로(곱셈·나눗셈을 덧셈·뺄셈보다
// 아래에, ( ) 안을 가장 아래에) 지어 두었으므로, 이 한 규칙이 교과서의
// 계산 순서와 정확히 같아집니다.
//
//   100÷5-3×4+2  →  (((100÷5) - (3×4)) + 2)
//   적힌 차례대로 훑으면 ÷가 먼저 잡힙니다. 20-3×4+2
//   다시 훑으면 ×가 잡힙니다.                  20-12+2
//   그다음 -, 그다음 +.                        8+2 → 10
const nextSpot = (node: Node): Node | null => {
  if (node.kind === 'num') return null;
  const fromLeft = nextSpot(node.left);
  if (fromLeft) return fromLeft;
  if (node.left.kind === 'num' && node.right.kind === 'num') return node;
  return nextSpot(node.right);
};

const replace = (node: Node, target: Node, value: Node): Node => {
  if (node === target) return value;
  if (node.kind === 'num') return node;
  return { ...node, left: replace(node.left, target, value), right: replace(node.right, target, value) };
};

/**
 * 계산해 나가는 줄입니다. 교과서가 적는 그대로입니다.
 *   ['16-2×5+7', '16-10+7', '6+7', '13']
 * 도중에 음수가 되거나 나누어떨어지지 않으면 null입니다.
 */
export const trace = (start: Node): string[] | null => {
  const lines = [render(start)];
  let node = start;
  for (let guard = 0; guard < 12; guard += 1) {
    const spot = nextSpot(node);
    if (!spot || spot.kind !== 'op') break;
    const left = spot.left as { kind: 'num'; value: number };
    const right = spot.right as { kind: 'num'; value: number };
    const got = apply(spot.op, left.value, right.value);
    if (got === null) return null;
    node = replace(node, spot, num(got));
    lines.push(render(node));
  }
  return node.kind === 'num' ? lines : null;
};

export const evaluate = (node: Node): number | null => {
  const lines = trace(node);
  if (!lines) return null;
  return Number(lines[lines.length - 1]);
};

/**
 * 가장 먼저 계산해야 하는 부분입니다. '2×5', '(9+11)'.
 *
 * ( )로 묶인 곳이면 괄호까지 함께 적습니다. 교과서가 ○표를 치는 자리가
 * 괄호를 포함한 '(9+11)'이기 때문입니다.
 */
export const firstSpotText = (node: Node): string | null => {
  const spot = nextSpot(node);
  if (!spot || spot.kind !== 'op') return null;
  return render(spot);
};

/** ( )를 모두 떼어 낸 식입니다. ( )를 못 본 척했을 때의 값을 낼 때 씁니다. */
const withoutParens = (node: Node): Node => {
  if (node.kind === 'num') return node;
  return { kind: 'op', op: node.op, left: withoutParens(node.left), right: withoutParens(node.right) };
};

/**
 * 앞에서부터 차례대로만 계산한 값입니다. 곱셈과 나눗셈을 먼저 해야
 * 한다는 것을 잊은 아이가 내놓는 값이라, 이 단원에서 가장 값진
 * 오답입니다. ( )는 있는 대로 지킵니다 — ( )까지 무시하는 것은 다른
 * 실수이므로 따로 셉니다.
 */
export const leftToRight = (node: Node): number | null => {
  // 적힌 차례대로 늘어놓고 앞에서부터 셉니다. ( ) 안은 그대로 먼저.
  const flatten = (one: Node): { nums: number[]; ops: Op[] } | null => {
    if (one.kind === 'num') return { nums: [one.value], ops: [] };
    if (one.paren) {
      // ( ) 안은 아이도 먼저 계산합니다. 잊는 것은 ( ) 밖의 차례입니다.
      const inside = leftToRight({ ...one, paren: false });
      return inside === null ? null : { nums: [inside], ops: [] };
    }
    const left = flatten(one.left);
    const right = flatten(one.right);
    if (!left || !right) return null;
    return { nums: [...left.nums, ...right.nums], ops: [...left.ops, one.op, ...right.ops] };
  };
  const flat = flatten(node);
  if (!flat) return null;
  let value = flat.nums[0];
  for (let at = 0; at < flat.ops.length; at += 1) {
    const got = apply(flat.ops[at], value, flat.nums[at + 1]);
    if (got === null) return null;
    value = got;
  }
  return value;
};

/** ( )를 못 본 척했을 때의 값입니다. */
export const ignoringParens = (node: Node): number | null => evaluate(withoutParens(node));

// 같은 무리(＋−끼리, ×÷끼리)에서 뒤엣것을 먼저 계산한 값입니다.
//   24-10+11을 24-(10+11)로 읽는 실수
//   36÷6×3을  36÷(6×3)으로 읽는 실수
// '앞에서부터 차례대로'를 잊었을 때 나오는 값이라, 곱셈과 나눗셈만
// 섞인 차시에서 가장 값진 오답입니다. 그 차시에서는 앞에서부터
// 차례대로가 곧 정답이어서, 우선순위를 뒤집은 값이 따로 없습니다.
const flatten = (one: Node): { nums: number[]; ops: Op[] } | null => {
  if (one.kind === 'num') return { nums: [one.value], ops: [] };
  if (one.paren) {
    const inside = evaluate({ ...one, paren: false });
    return inside === null ? null : { nums: [inside], ops: [] };
  }
  const left = flatten(one.left);
  const right = flatten(one.right);
  if (!left || !right) return null;
  return { nums: [...left.nums, ...right.nums], ops: [...left.ops, one.op, ...right.ops] };
};

export const rightFirst = (node: Node): number | null => {
  const flat = flatten(node);
  if (!flat || flat.ops.length < 2) return null;
  // 오른쪽에서 왼쪽으로 묶어 계산합니다. a-b+c → a-(b+c)
  let value = flat.nums[flat.nums.length - 1];
  for (let at = flat.ops.length - 1; at >= 0; at -= 1) {
    const got = apply(flat.ops[at], flat.nums[at], value);
    if (got === null) return null;
    value = got;
  }
  return value;
};

/**
 * 마지막 연산 기호를 잘못 읽었을 때의 값입니다.
 *
 * 기호만 바꾸고 계산 순서는 그대로 둡니다. 순서까지 함께 틀린 값은
 * leftToRight가 따로 내므로, 여기서까지 섞으면 두 실수가 겹친 값이
 * 나와 '이 오답을 고른 아이가 무엇을 틀렸는가'를 읽을 수 없습니다.
 */
export const misreadLastOp = (node: Node): number | null => {
  const swap: Record<Op, Op> = { '+': '-', '-': '+', '×': '÷', '÷': '×' };
  // 적힌 차례로 마지막에 오는 연산을 찾습니다.
  let last: Node | null = null;
  const 훑기 = (one: Node) => {
    if (one.kind === 'num') return;
    훑기(one.left);
    last = one;
    훑기(one.right);
  };
  훑기(node);
  if (!last) return null;
  const target: Node = last;
  const 바꾸기 = (one: Node): Node => {
    if (one.kind === 'num') return one;
    const next: Node = { ...one, left: 바꾸기(one.left), right: 바꾸기(one.right) };
    return one === target && next.kind === 'op' ? { ...next, op: swap[next.op] } : next;
  };
  return evaluate(바꾸기(node));
};

export const hasParen = (node: Node): boolean =>
  node.kind === 'op' && (Boolean(node.paren) || hasParen(node.left) || hasParen(node.right));

// ── 식의 모양 ───────────────────────────────────────────────────────
// 차시마다 쓸 수 있는 연산이 다릅니다. 2차시에 곱셈이 나오면 아직 배우지
// 않은 것을 묻는 셈이고, 3차시에 덧셈이 나오면 그 차시가 하려는 일
// (곱셈과 나눗셈만 섞였을 때 앞에서부터 차례대로)이 흐려집니다.
export type LessonKind = 'add-sub' | 'mul-div' | 'add-sub-mul' | 'add-sub-div' | 'all';

export const kindName: Record<LessonKind, string> = {
  'add-sub': '덧셈과 뺄셈이 섞여 있는 식',
  'mul-div': '곱셈과 나눗셈이 섞여 있는 식',
  'add-sub-mul': '덧셈, 뺄셈, 곱셈이 섞여 있는 식',
  'add-sub-div': '덧셈, 뺄셈, 나눗셈이 섞여 있는 식',
  all: '덧셈, 뺄셈, 곱셈, 나눗셈이 섞여 있는 식',
};

/** 그 차시가 정한 '계산 순서' 한 줄입니다. 지도서의 약속 문장 그대로입니다. */
export const ruleText: Record<LessonKind, string> = {
  'add-sub': '덧셈과 뺄셈이 섞여 있는 식에서는 앞에서부터 차례대로 계산합니다.',
  'mul-div': '곱셈과 나눗셈이 섞여 있는 식에서는 앞에서부터 차례대로 계산합니다.',
  'add-sub-mul': '덧셈, 뺄셈, 곱셈이 섞여 있는 식에서는 곱셈을 먼저 계산합니다.',
  'add-sub-div': '덧셈, 뺄셈, 나눗셈이 섞여 있는 식에서는 나눗셈을 먼저 계산합니다.',
  all: '덧셈, 뺄셈, 곱셈, 나눗셈이 섞여 있는 식에서는 곱셈과 나눗셈을 먼저 계산합니다.',
};

export const parenRule = '( )가 있는 식에서는 ( ) 안을 가장 먼저 계산합니다.';

type Shape = {
  id: string;
  paren: boolean;
  build: (next: (bound: number) => number) => Node | null;
};

// 수를 뽑는 작은 도구들입니다. 곱하고 나누는 수는 작게 둡니다 —
// 이 단원이 보는 것은 계산 순서이지 큰 수의 계산이 아닙니다.
const small = (next: (bound: number) => number) => 2 + next(8);        // 2~9
const mid = (next: (bound: number) => number) => 3 + next(18);         // 3~20
const big = (next: (bound: number) => number) => 10 + next(60);        // 10~69

const shapes: Record<LessonKind, Shape[]> = {
  'add-sub': [
    { id: 'a+b-c', paren: false, build: (n) => op('-', op('+', num(big(n)), num(mid(n))), num(mid(n))) },
    { id: 'a-b+c', paren: false, build: (n) => op('+', op('-', num(big(n)), num(mid(n))), num(mid(n))) },
    { id: 'a-(b+c)', paren: true, build: (n) => op('-', num(big(n) + 20), par(op('+', num(mid(n)), num(mid(n))))) },
    { id: 'a-(b-c)', paren: true, build: (n) => {
      const b = mid(n) + 6;
      return op('-', num(big(n) + 10), par(op('-', num(b), num(1 + n(b - 1)))));
    } },
    { id: 'a+(b-c)', paren: true, build: (n) => {
      const b = mid(n) + 6;
      return op('+', num(mid(n)), par(op('-', num(b), num(1 + n(b - 1)))));
    } },
    { id: 'a+b-c+d', paren: false, build: (n) =>
      op('+', op('-', op('+', num(big(n)), num(mid(n))), num(mid(n))), num(mid(n))) },
  ],
  'mul-div': [
    { id: 'a×b÷c', paren: false, build: (n) => {
      const c = small(n);
      const a = c * (1 + n(6));
      return op('÷', op('×', num(a), num(small(n))), num(c));
    } },
    { id: 'a÷b×c', paren: false, build: (n) => {
      const b = small(n);
      return op('×', op('÷', num(b * (2 + n(9))), num(b)), num(small(n)));
    } },
    { id: 'a÷(b×c)', paren: true, build: (n) => {
      const b = 2 + n(4);
      const c = 2 + n(4);
      return op('÷', num(b * c * (1 + n(8))), par(op('×', num(b), num(c))));
    } },
    { id: 'a×(b÷c)', paren: true, build: (n) => {
      const c = small(n);
      return op('×', num(small(n)), par(op('÷', num(c * (2 + n(6))), num(c))));
    } },
    { id: 'a÷b×c×d', paren: false, build: (n) => {
      const b = small(n);
      return op('×', op('×', op('÷', num(b * (2 + n(6))), num(b)), num(2 + n(3))), num(2 + n(3)));
    } },
  ],
  'add-sub-mul': [
    { id: 'a-b×c+d', paren: false, build: (n) => {
      const b = small(n);
      const c = small(n);
      return op('+', op('-', num(b * c + 5 + n(30)), op('×', num(b), num(c))), num(mid(n)));
    } },
    { id: 'a+b×c-d', paren: false, build: (n) => {
      const b = small(n);
      const c = small(n);
      const a = mid(n);
      const sum = a + b * c;
      return op('-', op('+', num(a), op('×', num(b), num(c))), num(1 + n(sum)));
    } },
    { id: 'a×b+c-d', paren: false, build: (n) => {
      const a = small(n);
      const b = small(n);
      const c = mid(n);
      return op('-', op('+', op('×', num(a), num(b)), num(c)), num(1 + n(a * b + c)));
    } },
    { id: '(a-b)×c', paren: true, build: (n) => {
      const b = mid(n);
      return op('×', par(op('-', num(b + 1 + n(20)), num(b))), num(small(n)));
    } },
    { id: '(a+b)×c-d', paren: true, build: (n) => {
      const a = small(n);
      const b = small(n);
      const c = small(n);
      return op('-', op('×', par(op('+', num(a), num(b))), num(c)), num(1 + n((a + b) * c)));
    } },
    { id: 'a-(b+c)×d', paren: true, build: (n) => {
      const b = 2 + n(5);
      const c = 2 + n(5);
      const d = 2 + n(4);
      return op('-', num((b + c) * d + 1 + n(30)), op('×', par(op('+', num(b), num(c))), num(d)));
    } },
  ],
  'add-sub-div': [
    { id: 'a+b÷c-d', paren: false, build: (n) => {
      const c = small(n);
      const q = 2 + n(8);
      const a = mid(n);
      return op('-', op('+', num(a), op('÷', num(c * q), num(c))), num(1 + n(a + q)));
    } },
    { id: 'a-b÷c+d', paren: false, build: (n) => {
      const c = small(n);
      const q = 2 + n(8);
      return op('+', op('-', num(q + 3 + n(30)), op('÷', num(c * q), num(c))), num(mid(n)));
    } },
    { id: 'a÷b+c-d', paren: false, build: (n) => {
      const b = small(n);
      const q = 2 + n(9);
      const c = mid(n);
      return op('-', op('+', op('÷', num(b * q), num(b)), num(c)), num(1 + n(q + c)));
    } },
    { id: '(a+b)÷c', paren: true, build: (n) => {
      const c = small(n);
      const total = c * (2 + n(9));
      const a = 1 + n(total - 1);
      return op('÷', par(op('+', num(a), num(total - a))), num(c));
    } },
    { id: '(a-b)÷c+d', paren: true, build: (n) => {
      const c = small(n);
      const diff = c * (2 + n(7));
      const b = mid(n);
      return op('+', op('÷', par(op('-', num(diff + b), num(b))), num(c)), num(mid(n)));
    } },
    { id: 'a-(b+c)÷d', paren: true, build: (n) => {
      const d = small(n);
      const total = d * (2 + n(6));
      const b = 1 + n(total - 1);
      return op('-', num(total / d + 2 + n(25)), op('÷', par(op('+', num(b), num(total - b))), num(d)));
    } },
  ],
  all: [
    { id: 'a÷b-c×d+e', paren: false, build: (n) => {
      const b = small(n);
      const q = 4 + n(12);
      const c = 2 + n(4);
      const d = 2 + n(4);
      if (c * d > q) return null;
      return op('+', op('-', op('÷', num(b * q), num(b)), op('×', num(c), num(d))), num(mid(n)));
    } },
    { id: 'a+b×c-d÷e', paren: false, build: (n) => {
      const b = small(n);
      const c = small(n);
      const e = small(n);
      const q = 2 + n(8);
      const a = mid(n);
      if (q > a + b * c) return null;
      return op('-', op('+', num(a), op('×', num(b), num(c))), op('÷', num(e * q), num(e)));
    } },
    { id: 'a÷b+c×d-e', paren: false, build: (n) => {
      const b = small(n);
      const q = 2 + n(9);
      const c = 2 + n(5);
      const d = 2 + n(5);
      return op('-', op('+', op('÷', num(b * q), num(b)), op('×', num(c), num(d))), num(1 + n(q + c * d)));
    } },
    { id: 'a-(b+c)×d', paren: true, build: (n) => {
      const b = 2 + n(5);
      const c = 2 + n(5);
      const d = 2 + n(4);
      return op('-', num((b + c) * d + 2 + n(25)), op('×', par(op('+', num(b), num(c))), num(d)));
    } },
    { id: '(a+b)×c÷d', paren: true, build: (n) => {
      const d = small(n);
      const c = small(n);
      const sum = d * (1 + n(5));
      const a = 1 + n(sum - 1);
      return op('÷', op('×', par(op('+', num(a), num(sum - a))), num(c)), num(d));
    } },
    { id: 'a×b÷(c+d)+e', paren: true, build: (n) => {
      const c = 2 + n(5);
      const d = 2 + n(5);
      const a = (c + d) * (1 + n(3));
      return op('+', op('÷', op('×', num(a), num(2 + n(4))), par(op('+', num(c), num(d)))), num(mid(n)));
    } },
  ],
};

export type Made = {
  node: Node;
  text: string;
  answer: number;
  lines: string[];
  shapeId: string;
  paren: boolean;
};

/**
 * 그 차시가 쓸 수 있는 식 하나를 만듭니다.
 *
 * wantParen을 주면 ( )가 있는(또는 없는) 식만 고릅니다. 값이 커지거나
 * 도중에 음수가 되거나 나누어떨어지지 않으면 다시 뽑습니다.
 */
export const makeExpression = (
  kind: LessonKind,
  seed: number,
  wantParen?: boolean,
): Made | null => {
  const pool = shapes[kind].filter((one) => wantParen === undefined || one.paren === wantParen);
  if (!pool.length) return null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const shape = pick(pool, seed + attempt * 7);
    const next = rand(seed * 131 + attempt * 17 + shape.id.length);
    const node = shape.build(next);
    if (!node) continue;
    const lines = trace(node);
    if (!lines) continue;
    const answer = Number(lines[lines.length - 1]);
    // 답이 0이면 '얼마일까요'의 답으로 어색하고, 너무 크면 이 단원이
    // 보려는 계산 순서 대신 큰 수의 계산이 문제가 됩니다.
    if (answer < 1 || answer > 500) continue;
    // 줄이 둘뿐이면 섞여 있는 식이 아닙니다(연산이 하나).
    if (lines.length < 3) continue;
    return { node, text: render(node), answer, lines, shapeId: shape.id, paren: shape.paren };
  }
  return null;
};

/**
 * 이 식에서 아이가 실제로 내놓는 오답들입니다.
 *
 *  · 앞에서부터 차례대로만 계산한 값 (곱셈·나눗셈을 먼저 한다는 것을 잊음)
 *  · ( )를 못 본 척한 값
 *  · 답에서 한두 걸음 어긋난 값 (자리를 메우려고 씁니다)
 */
export const wrongValues = (made: Made): string[] => {
  const out: number[] = [];
  const push = (value: number | null) => {
    if (value === null || value < 0 || !Number.isInteger(value)) return;
    if (value === made.answer || out.includes(value)) return;
    out.push(value);
  };
  push(leftToRight(made.node));
  if (made.paren) push(ignoringParens(made.node));
  push(rightFirst(made.node));
  push(misreadLastOp(made.node));
  // 여기까지로 셋이 차지 않을 때를 위한 자리입니다. 뜻이 있는 오답이
  // 아니므로 맨 뒤에 둡니다.
  push(made.answer + 2);
  push(made.answer - 2);
  push(made.answer + 1);
  push(made.answer * 2);
  return out.map(String);
};
