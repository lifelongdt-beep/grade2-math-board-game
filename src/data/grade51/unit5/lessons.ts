import type { G5Family, G5Spec } from '../../grade5/build';
import {
  add,
  frac,
  improperText,
  mixed,
  mixedText,
  mixedToImproper,
  sub,
  text as fracText,
  type Frac,
} from '../../grade5/fraction';
import { eul, gwa, particleOf, pick, rand } from '../../grade5/util';
import { gcd, lcm } from '../unit2/core';

// ════════════════════════════════════════════════════════════════════
// 5단원 분수의 덧셈과 뺄셈 — 1~7차시
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   2 (진분수)+(진분수) (1)   3 (진분수)+(진분수) (2)
//   4 (대분수)+(대분수)       5 (진분수)-(진분수)
//   6 (대분수)-(대분수) (1)   7 (대분수)-(대분수) (2)
//
// 2차시는 합이 1보다 작은 것만, 3차시는 1보다 큰 것을 다룹니다.
// 6차시는 받아내림이 없는 것만, 7차시는 있는 것을 다룹니다. 그 차시가
// 아직 다루지 않은 꼴이 나오면 아이는 배우지 않은 것을 풉니다.
//
// 답은 늘 기약분수로 적고, 가분수는 대분수로 고칩니다. 지도서는 그렇게
// 고치지 않아도 정답으로 인정하라고 했지만, 보기에서 하나를 고르는
// 문항은 꼴이 하나여야 합니다. 대신 풀이에 고치는 줄을 남깁니다.
// ════════════════════════════════════════════════════════════════════

export type Kind =
  | 'proper-add-small'   // (진분수)+(진분수), 합이 1보다 작음
  | 'proper-add-big'     // (진분수)+(진분수), 합이 1보다 큼
  | 'mixed-add'          // (대분수)+(대분수)
  | 'proper-sub'         // (진분수)-(진분수)
  | 'mixed-sub-plain'    // (대분수)-(대분수), 받아내림 없음
  | 'mixed-sub-borrow';  // (대분수)-(대분수), 받아내림 있음

export const kindName: Record<Kind, string> = {
  'proper-add-small': '(진분수)+(진분수)',
  'proper-add-big': '(진분수)+(진분수)',
  'mixed-add': '(대분수)+(대분수)',
  'proper-sub': '(진분수)-(진분수)',
  'mixed-sub-plain': '(대분수)-(대분수)',
  'mixed-sub-borrow': '(대분수)-(대분수)',
};

const 더하기인가 = (kind: Kind) => kind.includes('add');
const 대분수인가 = (kind: Kind) => kind.startsWith('mixed');

type Operands = {
  kind: Kind;
  /** 앞의 수와 뒤의 수입니다. 대분수면 whole이 있습니다. */
  left: { whole: number; n: number; d: number };
  right: { whole: number; n: number; d: number };
  leftText: string;
  rightText: string;
  leftFrac: Frac;
  rightFrac: Frac;
  answer: Frac;
  /** 통분한 공통분모입니다. 두 분모의 최소공배수를 씁니다. */
  common: number;
};

// 자연수 부분이 0이면 '0과 3/5'이 아니라 그냥 '3/5'입니다.
// 오답도 아이가 실제로 적을 만한 꼴이라야 합니다 — '0과 1/1'을 적는
// 아이는 없고, 그런 보기는 읽자마자 답이 아닌 것이 드러납니다.
const 대분수글 = (whole: number, n: number, d: number) =>
  whole === 0 ? `${n}/${d}` : mixedText(whole, n, d);

/** 그 차시가 다루는 꼴의 두 수를 뽑습니다. */
export const operandsFor = (kind: Kind, seed: number): Operands | null => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const d1 = 2 + next(9);
    const d2 = 2 + next(9);
    if (d1 === d2) continue;
    // 지도서의 문항은 분모의 최소공배수가 작습니다. 크면 통분한 분수를
    // 머릿속에 둘 수 없어, 이 차시가 보려는 계산 원리가 묻힙니다.
    const common = lcm(d1, d2);
    if (common > 48) continue;
    const n1 = 1 + next(d1 - 1);
    const n2 = 1 + next(d2 - 1);
    if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) continue;

    const 진1 = frac(n1, d1);
    const 진2 = frac(n2, d2);

    if (kind === 'proper-add-small' || kind === 'proper-add-big') {
      const sum = add(진1, 진2);
      const 넘는가 = sum.n > sum.d;
      if (kind === 'proper-add-small' && (넘는가 || sum.n === sum.d)) continue;
      if (kind === 'proper-add-big' && !넘는가) continue;
      return {
        kind,
        left: { whole: 0, n: n1, d: d1 },
        right: { whole: 0, n: n2, d: d2 },
        leftText: `${n1}/${d1}`,
        rightText: `${n2}/${d2}`,
        leftFrac: 진1,
        rightFrac: 진2,
        answer: sum,
        common,
      };
    }

    if (kind === 'proper-sub') {
      if (진1.n * 진2.d <= 진2.n * 진1.d) continue;
      return {
        kind,
        left: { whole: 0, n: n1, d: d1 },
        right: { whole: 0, n: n2, d: d2 },
        leftText: `${n1}/${d1}`,
        rightText: `${n2}/${d2}`,
        leftFrac: 진1,
        rightFrac: 진2,
        answer: sub(진1, 진2),
        common,
      };
    }

    const w1 = 1 + next(4);
    const w2 = 1 + next(3);
    const 대1 = mixed(w1, n1, d1);
    const 대2 = mixed(w2, n2, d2);

    if (kind === 'mixed-add') {
      return {
        kind,
        left: { whole: w1, n: n1, d: d1 },
        right: { whole: w2, n: n2, d: d2 },
        leftText: mixedText(w1, n1, d1),
        rightText: mixedText(w2, n2, d2),
        leftFrac: 대1,
        rightFrac: 대2,
        answer: add(대1, 대2),
        common,
      };
    }

    // 뺄셈은 앞의 수가 커야 합니다. 받아내림이 있는지 없는지는
    // 통분한 분자끼리 견주어 정합니다.
    if (대1.n * 대2.d <= 대2.n * 대1.d) continue;
    const 분자1 = (n1 * common) / d1;
    const 분자2 = (n2 * common) / d2;
    const 받아내림 = 분자1 < 분자2;
    if (kind === 'mixed-sub-plain' && 받아내림) continue;
    if (kind === 'mixed-sub-borrow' && !받아내림) continue;
    return {
      kind,
      left: { whole: w1, n: n1, d: d1 },
      right: { whole: w2, n: n2, d: d2 },
      leftText: mixedText(w1, n1, d1),
      rightText: mixedText(w2, n2, d2),
      leftFrac: 대1,
      rightFrac: 대2,
      answer: sub(대1, 대2),
      common,
    };
  }
  return null;
};

/** 통분한 두 분자입니다. */
const 통분분자 = (one: Operands) => ({
  a: (one.left.n * one.common) / one.left.d,
  b: (one.right.n * one.common) / one.right.d,
});

/** 교과서가 적는 풀이 줄입니다. 통분해서 계산하는 방법입니다. */
const 통분풀이 = (one: Operands): string[] => {
  const { a, b } = 통분분자(one);
  const lines: string[] = [];
  const 기호 = 더하기인가(one.kind) ? '+' : '-';

  lines.push(`두 분모 ${gwa(String(one.left.d))} ${one.right.d}의 최소공배수 ${eul(String(one.common))} 공통분모로 하여 통분합니다.`);

  if (!대분수인가(one.kind)) {
    lines.push(`${one.leftText} ${기호} ${one.rightText} = ${a}/${one.common} ${기호} ${b}/${one.common} = ${a + (더하기인가(one.kind) ? b : -b)}/${one.common}`);
  } else {
    lines.push(`${one.leftText} = ${mixedText(one.left.whole, a, one.common)}, ${one.rightText} = ${mixedText(one.right.whole, b, one.common)}`);
    if (더하기인가(one.kind)) {
      lines.push(`자연수는 자연수끼리, 분수는 분수끼리 더합니다. ${one.left.whole}+${one.right.whole}=${one.left.whole + one.right.whole}, ${a}/${one.common}+${b}/${one.common}=${a + b}/${one.common}`);
      if (a + b >= one.common) {
        lines.push(`분수 부분이 1보다 크므로 자연수로 받아올립니다. ${mixedText(one.left.whole + one.right.whole, a + b, one.common)} = ${fracText(one.answer)}`);
      }
    } else if (a >= b) {
      lines.push(`자연수는 자연수끼리, 분수는 분수끼리 뺍니다. ${one.left.whole}-${one.right.whole}=${one.left.whole - one.right.whole}, ${a}/${one.common}-${b}/${one.common}=${a - b}/${one.common}`);
    } else {
      lines.push(`분수 부분끼리 뺄 수 없으므로 앞의 수의 자연수에서 1을 받아내립니다. ${mixedText(one.left.whole, a, one.common)} = ${mixedText(one.left.whole - 1, a + one.common, one.common)}`);
      lines.push(`${one.left.whole - 1}-${one.right.whole}=${one.left.whole - 1 - one.right.whole}, ${a + one.common}/${one.common}-${b}/${one.common}=${a + one.common - b}/${one.common}`);
    }
  }

  const 날것 = 더하기인가(one.kind)
    ? `${a + b}/${one.common}`
    : `${a - b}/${one.common}`;
  if (!대분수인가(one.kind) && 날것 !== fracText(one.answer)) {
    lines.push(`${eul(날것)} 약분하거나 대분수로 고치면 ${fracText(one.answer)}입니다.`);
  } else if (!lines[lines.length - 1].includes(fracText(one.answer))) {
    lines.push(`그러므로 답은 ${fracText(one.answer)}입니다.`);
  }
  return lines;
};

/** 대분수를 가분수로 고쳐서 계산하는 방법입니다(지도서의 방법 2). */
const 가분수풀이 = (one: Operands): string[] => {
  const 기호 = 더하기인가(one.kind) ? '+' : '-';
  const 가1 = one.leftFrac;
  const 가2 = one.rightFrac;
  const c = lcm(가1.d, 가2.d);
  const a = (가1.n * c) / 가1.d;
  const b = (가2.n * c) / 가2.d;
  return [
    `대분수를 가분수로 고칩니다. ${mixedToImproper(one.left.whole, one.left.n, one.left.d)}`,
    `대분수를 가분수로 고칩니다. ${mixedToImproper(one.right.whole, one.right.n, one.right.d)}`,
    `통분합니다. ${improperText(가1)} ${기호} ${improperText(가2)} = ${a}/${c} ${기호} ${b}/${c}`,
    `${a}/${c} ${기호} ${b}/${c} = ${더하기인가(one.kind) ? a + b : a - b}/${c} = ${fracText(one.answer)}`,
  ];
};

/**
 * 이 계산에서 아이가 실제로 내놓는 오답들입니다.
 *
 *  · 분모끼리 더하거나 뺀 값 — 분모가 다를 때 가장 먼저 하는 실수
 *  · 통분하지 않고 분자끼리만 계산한 값
 *  · 대분수에서 받아올림·받아내림을 빠뜨린 값
 */
const 오답들 = (one: Operands): string[] => {
  const out: string[] = [];
  const push = (value: string) => {
    if (value && value !== fracText(one.answer) && !out.includes(value)) out.push(value);
  };
  const { a, b } = 통분분자(one);
  const 더함 = 더하기인가(one.kind);

  const 자연수 = 더함 ? one.left.whole + one.right.whole : one.left.whole - one.right.whole;

  // 분모끼리도 계산해 버린 값
  const 분모끼리 = 더함 ? one.left.d + one.right.d : Math.abs(one.left.d - one.right.d);
  const 분자끼리 = 더함 ? one.left.n + one.right.n : one.left.n - one.right.n;
  // 분모가 1이 되거나 분자가 분모보다 크면 아이가 적을 만한 꼴이
  // 아닙니다. 그런 보기는 셈을 해 보지 않고도 지워집니다.
  if (분모끼리 > 1 && 분자끼리 > 0 && 분자끼리 < 분모끼리) {
    push(대분수글(자연수, 분자끼리, 분모끼리));
  }

  // 통분하지 않고 분자끼리만 계산한 값
  if (분자끼리 > 0 && 분자끼리 < one.left.d) {
    push(대분수글(자연수, 분자끼리, one.left.d));
  }

  if (대분수인가(one.kind)) {
    if (더함) {
      // 받아올림을 빠뜨린 값. 3과 7/5처럼 분수 부분이 1보다 큰 채로 둡니다.
      if (a + b >= one.common) {
        push(mixedText(자연수, a + b, one.common));
      }
    } else if (a < b) {
      // 받아내림 대신 큰 분자에서 작은 분자를 뺀 값
      push(대분수글(자연수, b - a, one.common));
    }
  } else if (!더함) {
    // 뺄셈에서 순서를 바꾸어 뺀 값
    if (b > a) push(`${b - a}/${one.common}`);
  }

  // 자리를 채우는 값입니다. 뜻이 있는 오답 뒤에 둡니다.
  push(fracText(더함 ? add(one.answer, frac(1, one.common)) : sub(one.answer, frac(1, one.common))));
  push(fracText(더함 ? sub(one.answer, frac(1, one.common)) : add(one.answer, frac(1, one.common))));
  return out.filter((value) => !value.startsWith('-') && !value.includes('/0'));
};

const 핵심 = (kind: Kind): string => {
  if (kind === 'mixed-sub-borrow') return '분수 부분끼리 뺄 수 없으면 자연수에서 1을 받아내립니다.';
  if (kind === 'mixed-add') return '통분한 뒤 자연수는 자연수끼리, 분수는 분수끼리 더합니다.';
  if (kind === 'mixed-sub-plain') return '통분한 뒤 자연수는 자연수끼리, 분수는 분수끼리 뺍니다.';
  if (kind === 'proper-add-big') return '통분해서 더한 뒤, 가분수가 되면 대분수로 고칩니다.';
  return '분모가 다르면 먼저 통분하여 분모를 같게 만듭니다.';
};

// ── 1. 계산하기 ─────────────────────────────────────────────────────
const 계산문항 = (kind: Kind, index: number): G5Family => ({
  id: `calc-${index}`,
  make: (seed) => {
    const one = operandsFor(kind, seed + index * 97);
    if (!one) return null;
    const 기호 = 더하기인가(kind) ? '+' : '-';
    return {
      prompt: `${one.leftText} ${기호} ${eul(one.rightText)} 계산하면 얼마일까요?`,
      answer: fracText(one.answer),
      wrongs: 오답들(one),
      tag: 'fractionAdd',
      concept: 핵심(kind),
      strategy: `${kindName[kind]} 계산하기`,
      hint: 대분수인가(kind)
        ? '먼저 두 분수를 통분하세요. 자연수 부분은 그대로 두고 분수 부분만 고치면 됩니다.'
        : '분모가 다르면 그대로 더하거나 뺄 수 없습니다. 먼저 통분하여 분모를 같게 만드세요.',
      steps: 통분풀이(one),
      misconceptionTip: '분모끼리 더하거나 빼면 안 됩니다. 통분한 뒤 분자끼리만 계산합니다.',
      selfCheck: '계산 결과를 기약분수로 나타냈나요? 가분수라면 대분수로 고쳤나요?',
    } satisfies G5Spec;
  },
});

// ── 2. 두 가지 방법 ─────────────────────────────────────────────────
// 지도서가 대분수의 덧셈·뺄셈을 두 가지 방법으로 가르칩니다.
// 방법이 달라도 답은 하나라는 것을 보는 문항입니다.
const 두방법문항 = (kind: Kind): G5Family => ({
  id: 'two-ways',
  make: (seed) => {
    if (!대분수인가(kind)) return null;
    const one = operandsFor(kind, seed + 31);
    if (!one) return null;
    const 기호 = 더하기인가(kind) ? '+' : '-';
    return {
      prompt: `${one.leftText} ${기호} ${eul(one.rightText)} 두 가지 방법으로 계산했습니다. 두 방법으로 구한 값은 얼마일까요?`,
      answer: fracText(one.answer),
      wrongs: 오답들(one),
      tag: 'fractionAdd',
      concept: '자연수끼리 분수끼리 계산하는 방법과 가분수로 고쳐 계산하는 방법의 답은 같습니다.',
      strategy: `${kindName[kind]}${particleOf(kindName[kind], '을')} 두 가지 방법으로 계산하기`,
      hint: '한 가지 방법으로 구한 뒤, 다른 방법으로 한 번 더 구해 보세요. 두 값이 같아야 합니다.',
      steps: [
        '[방법 1] 자연수는 자연수끼리, 분수는 분수끼리 계산하기',
        ...통분풀이(one),
        '[방법 2] 대분수를 가분수로 고쳐서 계산하기',
        ...가분수풀이(one),
      ],
      misconceptionTip: '두 방법의 답이 다르게 나왔다면 통분한 분자를 잘못 고친 것입니다.',
      selfCheck: '두 방법으로 구한 값이 같은가요?',
    };
  },
});

// ── 3. 잘못 계산한 곳 찾기 ──────────────────────────────────────────
const 잘못찾기 = (kind: Kind): G5Family => ({
  id: 'find-mistake',
  make: (seed) => {
    const one = operandsFor(kind, seed + 53);
    if (!one) return null;
    const 기호 = 더하기인가(kind) ? '+' : '-';
    const 잘못 = 오답들(one);
    if (잘못.length < 3) return null;
    return {
      prompt: `${eul(`${one.leftText} ${기호} ${one.rightText}`)} 바르게 계산한 것은 어느 것일까요?`,
      answer: fracText(one.answer),
      wrongs: 잘못,
      tag: 'fractionAdd',
      concept: 핵심(kind),
      strategy: `${kindName[kind]}에서 잘못 계산한 것 가리기`,
      hint: '분모를 같게 만들었는지, 분자만 계산했는지 차례대로 확인하세요. 분모끼리 계산한 것은 답이 될 수 없습니다.',
      steps: 통분풀이(one),
      misconceptionTip: '분모가 달라진 답이 보이면 분모끼리 계산한 것입니다. 통분할 때 말고는 분모가 변하지 않습니다.',
      selfCheck: '고른 답을 그림으로 그리면 크기가 말이 되나요?',
    };
  },
});

// ── 4. 문장제 ───────────────────────────────────────────────────────
type Story = {
  id: string;
  unit: string;
  더하기: boolean;
  make: (left: string, right: string, 사람1: string, 사람2: string) => string;
};

const 이름들 = ['소희', '재우', '기범', '민정', '보빈', '연진', '성호', '은서', '소민', '준열'];

const stories: Story[] = [
  {
    id: 'tape', unit: 'm', 더하기: true,
    make: (l, r, a, b) => `태양광 자동차를 만들면서 테이프를 ${a}${particleOf(a, '은')} ${l} m, ${b}${particleOf(b, '은')} ${r} m 사용했습니다. 두 사람이 사용한 테이프는 모두 몇 m일까요?`,
  },
  {
    id: 'walk', unit: 'km', 더하기: true,
    make: (l, r, a, b) => `${a}${particleOf(a, '은')} ${l} km를 걸었고, ${b}${particleOf(b, '은')} ${a}보다 ${r} km를 더 걸었습니다. ${b}${particleOf(b, '이')} 걸은 거리는 몇 km일까요?`,
  },
  {
    id: 'soap', unit: 'L', 더하기: false,
    make: (l, r, a, b) => `휴대용 물비누를 ${a}${particleOf(a, '은')} ${l} L, ${b}${particleOf(b, '은')} ${r} L 만들었습니다. ${a}${particleOf(a, '이')} ${b}보다 물비누를 몇 L 더 많이 만들었을까요?`,
  },
  {
    id: 'clay', unit: 'kg', 더하기: false,
    make: (l, r, a, b) => `도자기를 만드는 데 흙을 ${a}${particleOf(a, '은')} ${l} kg, ${b}${particleOf(b, '은')} ${r} kg 사용했습니다. ${a}${particleOf(a, '은')} ${b}보다 흙을 몇 kg 더 많이 사용했을까요?`,
  },
  {
    id: 'time', unit: '시간', 더하기: false,
    make: (l, r, a) => `${a}${particleOf(a, '은')} 체험 활동을 ${l}시간 하기로 하였습니다. 현재까지 ${r}시간 체험 활동을 하였다면 남은 시간은 몇 시간일까요?`,
  },
];

const 문장문항 = (kind: Kind, index: number): G5Family => ({
  id: `story-${index}`,
  make: (seed) => {
    const 쓸것 = stories.filter((one) => one.더하기 === 더하기인가(kind));
    if (!쓸것.length) return null;
    const story = 쓸것[index % 쓸것.length];
    const one = operandsFor(kind, seed + index * 71 + 17);
    if (!one) return null;
    const 사람1 = pick(이름들, seed);
    const 사람2 = pick(이름들.filter((name) => name !== 사람1), seed + 5);
    return {
      prompt: story.make(one.leftText, one.rightText, 사람1, 사람2),
      answer: `${fracText(one.answer)} ${story.unit}`,
      wrongs: 오답들(one).map((value) => `${value} ${story.unit}`),
      tag: 'fractionAdd',
      concept: 핵심(kind),
      strategy: '분수의 덧셈과 뺄셈을 실생활 문제에 쓰기',
      hint: '이야기에서 두 수를 찾아 식으로 먼저 적어 보세요. 분모가 다르면 통분한 뒤에 계산합니다.',
      steps: [
        `식으로 나타내면 ${one.leftText} ${더하기인가(kind) ? '+' : '-'} ${one.rightText}입니다.`,
        ...통분풀이(one),
        `그러므로 ${fracText(one.answer)} ${story.unit}입니다.`,
      ],
      misconceptionTip: '단위를 빠뜨리지 마세요. 그리고 분모끼리 계산하지 않았는지 확인하세요.',
      selfCheck: '구한 값이 이야기에 비추어 말이 되나요? 뺄셈인데 커지지는 않았나요?',
    };
  },
});

// ── 5. 크기 비교 (상) ───────────────────────────────────────────────
const 비교문항 = (kind: Kind): G5Family => ({
  id: 'compare-results',
  make: (seed) => {
    const 하나 = operandsFor(kind, seed + 101);
    const 둘 = operandsFor(kind, seed + 211);
    if (!하나 || !둘) return null;
    if (하나.answer.n * 둘.answer.d === 둘.answer.n * 하나.answer.d) return null;
    const 기호 = 더하기인가(kind) ? '+' : '-';
    const 큰쪽 = 하나.answer.n * 둘.answer.d > 둘.answer.n * 하나.answer.d ? 하나 : 둘;
    const 식1 = `${하나.leftText} ${기호} ${하나.rightText}`;
    const 식2 = `${둘.leftText} ${기호} ${둘.rightText}`;
    return {
      prompt: `두 식 ${식1}, ${식2} 중에서 계산 결과가 더 큰 것은 어느 것일까요?`,
      answer: 큰쪽 === 하나 ? 식1 : 식2,
      wrongs: [큰쪽 === 하나 ? 식2 : 식1, '두 식의 계산 결과가 같습니다.', '계산해 보지 않으면 알 수 없습니다.'],
      tag: 'fractionAdd',
      concept: '두 식의 계산 결과를 견주려면 각각 끝까지 계산해야 합니다.',
      strategy: '계산 결과의 크기 비교하기',
      hint: '두 식을 각각 끝까지 계산한 다음 두 값을 견주세요. 분모가 다르면 값을 견줄 때에도 통분합니다.',
      steps: [
        `${식1} = ${fracText(하나.answer)}`,
        `${식2} = ${fracText(둘.answer)}`,
        `두 값을 견주면 ${fracText(큰쪽.answer)}${particleOf(fracText(큰쪽.answer), '이')} 더 큽니다.`,
      ],
      misconceptionTip: '식에 나온 수가 크다고 계산 결과도 큰 것은 아닙니다. 끝까지 계산해서 견주세요.',
      selfCheck: '두 결과를 통분해서 견주어 보았나요?',
    };
  },
});

// ── 차시에 내보낼 뭉치 ──────────────────────────────────────────────
export const unit5Easy = (kind: Kind): G5Family[] => {
  const 뭉치 = [계산문항(kind, 0), 계산문항(kind, 1), 계산문항(kind, 2), 잘못찾기(kind), 문장문항(kind, 0)];
  return 대분수인가(kind) ? [...뭉치, 두방법문항(kind)] : 뭉치;
};

export const unit5Middle = (kind: Kind): G5Family[] => {
  const 뭉치 = [계산문항(kind, 3), 문장문항(kind, 0), 문장문항(kind, 1), 잘못찾기(kind), 계산문항(kind, 4)];
  return 대분수인가(kind) ? [...뭉치, 두방법문항(kind)] : 뭉치;
};

export const unit5Hard = (kind: Kind): G5Family[] => {
  const 뭉치 = [문장문항(kind, 0), 문장문항(kind, 1), 비교문항(kind), 잘못찾기(kind), 계산문항(kind, 5)];
  return 대분수인가(kind) ? [...뭉치, 두방법문항(kind)] : 뭉치;
};

// ── 1차시 단원 도입 ─────────────────────────────────────────────────
// 분모가 같은 분수의 덧셈·뺄셈(4학년)과 통분(4단원)을 떠올립니다.
export const unit5Lesson1: G5Family[] = [
  {
    id: 'same-denominator-add',
    make: (seed) => {
      const next = rand(seed);
      const d = 4 + next(8);
      const n1 = 1 + next(d - 2);
      const n2 = 1 + next(d - n1 - 1);
      if (n1 + n2 >= d) return null;
      const answer = frac(n1 + n2, d);
      return {
        prompt: `${n1}/${d} + ${eul(`${n2}/${d}`)} 계산하면 얼마일까요?`,
        answer: fracText(answer),
        wrongs: [`${n1 + n2}/${d * 2}`, `${n1 + n2}/${d + d}`, `${n1 * n2}/${d}`, `${n1 + n2 + 1}/${d}`],
        tag: 'fractionAdd',
        concept: '분모가 같은 분수끼리는 분자끼리만 더합니다.',
        strategy: '앞서 배운 분모가 같은 분수의 덧셈 떠올리기',
        hint: '분모가 같으면 한 칸의 크기가 같습니다. 칸의 수만 더하면 됩니다.',
        steps: [`${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}`, `기약분수로 나타내면 ${fracText(answer)}입니다.`],
        misconceptionTip: '분모끼리 더하면 안 됩니다. 분모는 한 칸의 크기이므로 그대로 둡니다.',
        selfCheck: '분모가 그대로인가요?',
      };
    },
  },
  {
    id: 'same-denominator-sub',
    make: (seed) => {
      const next = rand(seed + 7);
      const d = 4 + next(8);
      const n1 = 2 + next(d - 2);
      const n2 = 1 + next(n1 - 1);
      if (n1 <= n2) return null;
      const answer = frac(n1 - n2, d);
      return {
        prompt: `${n1}/${d} - ${eul(`${n2}/${d}`)} 계산하면 얼마일까요?`,
        answer: fracText(answer),
        // 뺄셈을 덧셈으로 읽은 값, 분자를 거꾸로 뺀 값, 한 칸 어긋난 값.
        wrongs: [`${n1 + n2}/${d}`, `${n1}/${d}`, `${n2}/${d}`, `${n1 - n2 + 1}/${d}`],
        tag: 'fractionAdd',
        concept: '분모가 같은 분수끼리는 분자끼리만 뺍니다.',
        strategy: '앞서 배운 분모가 같은 분수의 뺄셈 떠올리기',
        hint: '분모가 같으면 칸의 수만 빼면 됩니다.',
        steps: [`${n1}/${d} - ${n2}/${d} = ${n1 - n2}/${d}`, `기약분수로 나타내면 ${fracText(answer)}입니다.`],
        misconceptionTip: '분모끼리 빼면 안 됩니다. 분모는 그대로 둡니다.',
        selfCheck: '분모가 그대로인가요?',
      };
    },
  },
  {
    id: 'common-denominator-recall',
    make: (seed) => {
      const next = rand(seed + 13);
      const d1 = 2 + next(9);
      const d2 = 2 + next(9);
      if (d1 === d2) return null;
      const l = lcm(d1, d2);
      if (l > 48) return null;
      const n1 = 1 + next(d1 - 1);
      const n2 = 1 + next(d2 - 1);
      if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) return null;
      return {
        prompt: `${gwa(`${n1}/${d1}`)} ${n2}/${d2}${particleOf(`${n2}/${d2}`, '을')} 통분한 것으로 알맞은 것은 어느 것일까요? (공통분모는 가장 작은 수로 합니다.)`,
        answer: `${(n1 * l) / d1}/${l}, ${(n2 * l) / d2}/${l}`,
        wrongs: [
          `${n1}/${l}, ${n2}/${l}`,
          `${(n1 * l) / d1}/${l}, ${n2}/${l}`,
          `${n1}/${d1 + d2}, ${n2}/${d1 + d2}`,
          `${(n2 * l) / d2}/${l}, ${(n1 * l) / d1}/${l}`,
        ],
        sameValueOk: true,
        tag: 'fractionAdd',
        concept: '분모가 다른 두 분수를 분모가 같은 분수로 고치는 것을 통분한다고 합니다.',
        strategy: '앞서 배운 통분 떠올리기',
        hint: '분모에 곱한 수를 분자에도 똑같이 곱해야 크기가 그대로입니다.',
        steps: [
          `두 분모 ${gwa(String(d1))} ${d2}의 최소공배수는 ${l}입니다.`,
          `(${n1}×${l / d1})/(${d1}×${l / d1}) = ${(n1 * l) / d1}/${l}`,
          `(${n2}×${l / d2})/(${d2}×${l / d2}) = ${(n2 * l) / d2}/${l}`,
        ],
        misconceptionTip: '분모만 같게 만들고 분자를 그대로 두면 크기가 달라집니다.',
        selfCheck: '통분한 분수를 약분하면 처음 분수가 되나요?',
      };
    },
  },
];
