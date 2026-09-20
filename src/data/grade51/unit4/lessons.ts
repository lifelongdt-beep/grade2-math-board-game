import type { G5Family, G5Spec } from '../../grade5/build';
import type { QuestionVisual } from '../../../types';
import type { Frac } from '../../grade5/fraction';
import { euro, gwa, particleOf, pick, rand } from '../../grade5/util';
import { divisorsOf, gcd, lcm, listText } from '../unit2/core';

// ════════════════════════════════════════════════════════════════════
// 4단원 약분과 통분 — 1~7차시
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   2 크기가 같은 분수  3 크기가 같은 분수 만들기  4 약분과 기약분수
//   5~6 통분  7 분수의 크기 비교  8 분수와 소수의 크기 비교
//
// 말에도 차례가 있습니다.
//   · '약분', '기약분수'는 4차시에서 처음 나옵니다. 2·3차시 문항과
//     풀이에 쓰면 아직 배우지 않은 말을 읽히게 됩니다.
//   · '통분', '공통분모'는 5차시에서 처음 나옵니다.
// 그래서 2·3차시의 풀이는 '분모와 분자에 같은 수를 곱한다/나눈다'로만
// 적습니다.
//
// 지도서: "분수를 통분할 때는 공통분모로 최소공배수뿐만 아니라 분모의
// 곱과 같은 공배수도 이용하게 할 수 있다." 두 방법을 모두 냅니다.
// ════════════════════════════════════════════════════════════════════

const 분수글 = (n: number, d: number) => `${n}/${d}`;

/** 약분할 수 있는 진분수를 하나 고릅니다. */
const 약분할분수 = (next: (bound: number) => number): { n: number; d: number } | null => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const g = 2 + next(6);
    const n0 = 1 + next(8);
    const d0 = n0 + 1 + next(8);
    if (gcd(n0, d0) !== 1) continue;
    const n = n0 * g;
    const d = d0 * g;
    if (d > 60) continue;
    return { n, d };
  }
  return null;
};

/** 통분하기 좋은 두 진분수를 고릅니다. 분모가 다르고 값도 달라야 합니다. */
const 통분할두분수 = (
  next: (bound: number) => number,
  want: { 분모최대?: number } = {},
): { a: Frac; b: Frac } | null => {
  const 분모최대 = want.분모최대 ?? 12;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const d1 = 2 + next(분모최대 - 1);
    const d2 = 2 + next(분모최대 - 1);
    if (d1 === d2) continue;
    const n1 = 1 + next(d1 - 1);
    const n2 = 1 + next(d2 - 1);
    const a = { n: n1, d: d1 };
    const b = { n: n2, d: d2 };
    if (a.n * b.d === b.n * a.d) continue;
    if (lcm(d1, d2) > 60) continue;
    return { a, b };
  }
  return null;
};

const 띠그림 = (n: number, d: number, label: string): QuestionVisual => ({
  kind: 'fraction-model',
  label,
  shape: 'bar',
  denominator: d,
  numerator: n,
});

// ── 1차시 단원 도입 ─────────────────────────────────────────────────
// 아직 '약분'도 '통분'도 배우지 않았습니다. 앞에서 배운 약수·배수와
// 분모가 같은 분수의 크기 비교만 떠올립니다.
export const unit4Lesson1: G5Family[] = [
  {
    id: 'same-denominator',
    make: (seed) => {
      const next = rand(seed);
      const d = 5 + next(8);
      const n1 = 1 + next(d - 2);
      const n2 = n1 + 1 + next(d - n1 - 1);
      if (n2 >= d || n1 === n2) return null;
      return {
        prompt: `${gwa(분수글(n1, d))} ${분수글(n2, d)} 중에서 더 큰 분수는 어느 것일까요?`,
        answer: 분수글(n2, d),
        wrongs: [분수글(n1, d), 분수글(d, n2), 분수글(n1 + 1, d + 1)],
        tag: 'fractionCompare',
        concept: '분모가 같은 분수는 분자가 클수록 큽니다.',
        strategy: '분모가 같은 분수의 크기 비교하기',
        hint: '분모가 같으면 한 칸의 크기가 같습니다. 그러면 칸을 더 많이 가진 쪽이 큽니다.',
        steps: [
          `분모가 ${d}로 같으므로 한 칸의 크기가 같습니다.`,
          `분자를 견주면 ${n2}${particleOf(String(n2), '이')} ${n1}보다 크므로 ${분수글(n2, d)}${particleOf(분수글(n2, d), '이')} 더 큽니다.`,
        ],
        visual: 띠그림(n2, d, `${분수글(n2, d)}만큼 색칠한 그림`),
        misconceptionTip: '분모가 같을 때만 분자만 보고 정할 수 있습니다.',
        selfCheck: '그림으로 그렸을 때도 더 많이 칠해지나요?',
      };
    },
  },
  {
    id: 'divisors-recall',
    make: (seed) => {
      const next = rand(seed + 7);
      const value = 12 + next(40);
      const all = divisorsOf(value);
      if (all.length < 4 || all.length > 8) return null;
      return {
        prompt: `${value}의 약수를 모두 구한 것은 어느 것일까요?`,
        answer: listText(all),
        wrongs: [
          listText(all.slice(1)),
          listText(all.slice(0, -1)),
          listText([...all, value + 1]),
        ],
        tag: 'fractionCompare',
        concept: '약수는 어떤 수를 나누어떨어지게 하는 수입니다.',
        strategy: '앞서 배운 약수 떠올리기',
        hint: '1부터 차례대로 나누어 보세요. 1과 그 수 자신도 약수입니다.',
        steps: [`${value}의 약수: ${listText(all)}`],
        misconceptionTip: '1과 그 수 자신을 빠뜨리지 마세요.',
        selfCheck: '고른 수로 모두 나누어떨어지나요?',
      };
    },
  },
  {
    id: 'lcm-recall',
    make: (seed) => {
      const next = rand(seed + 13);
      const a = 2 + next(8);
      const b = 2 + next(8);
      if (a === b) return null;
      const l = lcm(a, b);
      if (l > 60) return null;
      return {
        prompt: `${gwa(String(a))} ${b}의 최소공배수는 얼마일까요?`,
        answer: String(l),
        wrongs: [String(a * b), String(gcd(a, b)), String(l + a), String(Math.max(a, b))],
        tag: 'fractionCompare',
        concept: '두 수의 공배수 가운데 가장 작은 수가 최소공배수입니다.',
        strategy: '앞서 배운 최소공배수 떠올리기',
        hint: '두 수의 배수를 각각 써 보고 처음으로 함께 나오는 수를 찾으세요.',
        steps: [
          `${a}의 배수: ${[1, 2, 3, 4, 5, 6].map((k) => a * k).join(', ')}, …`,
          `${b}의 배수: ${[1, 2, 3, 4, 5, 6].map((k) => b * k).join(', ')}, …`,
          `처음으로 함께 나오는 수는 ${l}입니다.`,
        ],
        misconceptionTip: '두 수를 그냥 곱한 값이 늘 최소공배수인 것은 아닙니다.',
        selfCheck: '구한 수를 두 수로 각각 나누면 나머지가 0인가요?',
      };
    },
  },
];

// ── 2차시 크기가 같은 분수를 알아볼까요 ────────────────────────────
export const unit4Lesson2 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 같은분수찾기: G5Family = {
    id: 'find-equal',
    make: (seed) => {
      const next = rand(seed);
      const n = 1 + next(4);
      const d = n + 1 + next(5);
      const k = 2 + next(4);
      const 답 = 분수글(n * k, d * k);
      return {
        prompt: `${gwa(분수글(n, d))} 크기가 같은 분수는 어느 것일까요?`,
        answer: 답,
        wrongs: [
          // 분자에만 곱한 것
          분수글(n * k, d),
          // 분모에만 곱한 것
          분수글(n, d * k),
          // 분모와 분자에 같은 수를 '더한' 것 — 가장 흔한 실수입니다.
          분수글(n + k, d + k),
          분수글(n * k, d * (k + 1)),
        ],
        tag: 'fractionCompare',
        concept: '분모와 분자에 0이 아닌 같은 수를 곱해도 분수의 크기는 변하지 않습니다.',
        strategy: '크기가 같은 분수 찾기',
        hint: '분모와 분자에 똑같은 수를 곱했는지 보세요. 한쪽에만 곱하면 크기가 달라집니다.',
        steps: [
          `${분수글(n, d)}의 분모와 분자에 각각 ${k}${particleOf(String(k), '을')} 곱하면 ${분수글(n * k, d * k)}입니다.`,
          `(${n}×${k})/(${d}×${k}) = ${분수글(n * k, d * k)}`,
          `나눈 칸의 수와 색칠한 칸의 수가 함께 ${k}배가 되었으므로 색칠한 크기는 그대로입니다.`,
        ],
        visual: 띠그림(n, d, `${분수글(n, d)}만큼 색칠한 그림`),
        misconceptionTip: '같은 수를 더하면 크기가 달라집니다. 곱하거나 나누어야 크기가 그대로입니다.',
        selfCheck: '두 분수를 그림으로 그렸을 때 색칠한 부분의 크기가 같나요?',
      };
    },
  };

  const 다른분수찾기: G5Family = {
    id: 'find-different',
    make: (seed) => {
      const next = rand(seed + 5);
      const n = 1 + next(4);
      const d = n + 1 + next(5);
      const 같은것 = [2, 3, 4].map((k) => 분수글(n * k, d * k));
      const 답 = 분수글(n + 1, d + 1);
      // 분모와 분자에 1씩 더한 것이 우연히 같은 크기가 되면 답이 둘이
      // 됩니다(1/1처럼). 값으로 견주어 걸러 냅니다.
      if ((n + 1) * d === n * (d + 1)) return null;
      return {
        prompt: `다음 중 ${gwa(분수글(n, d))} 크기가 같지 않은 분수는 어느 것일까요?`,
        answer: 답,
        wrongs: 같은것,
        sameValueOk: true,
        tag: 'fractionCompare',
        concept: '분모와 분자에 0이 아닌 같은 수를 곱해도 분수의 크기는 변하지 않습니다.',
        strategy: '크기가 같은 분수 가리기',
        hint: '분모와 분자에 무엇을 했는지 보세요. 같은 수를 곱한 것만 크기가 같습니다.',
        steps: [
          `${분수글(n, d)}의 분모와 분자에 2, 3, 4를 각각 곱하면 ${같은것.join(', ')}입니다.`,
          `${답}${particleOf(답, '은')} 분모와 분자에 1씩 더한 것이라 크기가 달라집니다.`,
        ],
        misconceptionTip: '분모와 분자에 같은 수를 더하는 것은 크기를 그대로 두는 방법이 아닙니다.',
        selfCheck: '고른 분수를 그림으로 그려 보면 색칠한 부분의 크기가 다른가요?',
      };
    },
  };

  const 그림읽기: G5Family = {
    id: 'read-picture',
    make: (seed) => {
      const next = rand(seed + 11);
      const n = 1 + next(4);
      const d = n + 1 + next(6);
      const k = 2 + next(3);
      return {
        prompt: `그림에서 색칠한 부분을 분수로 나타낸 것과 크기가 같은 분수는 어느 것일까요?`,
        answer: 분수글(n * k, d * k),
        wrongs: [분수글(n, d * k), 분수글(n * k, d), 분수글(n + k, d + k), 분수글(d, n)],
        tag: 'fractionCompare',
        concept: '같은 크기를 여러 가지 분수로 나타낼 수 있습니다.',
        strategy: '그림에서 크기가 같은 분수 찾기',
        hint: '그림에서 색칠한 부분이 전체의 얼마인지 먼저 분수로 적어 보세요.',
        steps: [
          `그림은 전체를 ${d}칸으로 나눈 것 중 ${n}칸을 칠한 것이므로 ${분수글(n, d)}입니다.`,
          `분모와 분자에 ${k}${particleOf(String(k), '을')} 곱하면 ${분수글(n * k, d * k)}입니다.`,
        ],
        visual: 띠그림(n, d, '색칠한 부분을 분수로 나타내기'),
        misconceptionTip: '그림을 볼 때 전체 칸 수와 칠한 칸 수를 바꾸어 읽지 마세요.',
        selfCheck: '두 분수를 각각 그림으로 그리면 색칠한 부분의 크기가 같나요?',
      };
    },
  };

  const 뭉치 = [같은분수찾기, 다른분수찾기, 그림읽기];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [다른분수찾기, 그림읽기, 같은분수찾기];
  return [그림읽기, 다른분수찾기, 같은분수찾기];
};

// ── 3차시 크기가 같은 분수를 어떻게 만들까요 ───────────────────────
export const unit4Lesson3 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 곱해만들기: G5Family = {
    id: 'make-by-multiply',
    make: (seed) => {
      const next = rand(seed);
      const n = 1 + next(5);
      const d = n + 1 + next(6);
      const k = 2 + next(4);
      return {
        prompt: `${분수글(n, d)}의 분모와 분자에 각각 ${k}${particleOf(String(k), '을')} 곱하여 크기가 같은 분수를 만들면 얼마일까요?`,
        answer: 분수글(n * k, d * k),
        wrongs: [분수글(n * k, d), 분수글(n, d * k), 분수글(n + k, d + k), 분수글(n * k, d * k + 1)],
        tag: 'fractionCompare',
        concept: '분모와 분자에 0이 아닌 같은 수를 곱해도 분수의 크기는 변하지 않습니다.',
        strategy: '곱하여 크기가 같은 분수 만들기',
        hint: '분모와 분자 둘 다에 같은 수를 곱해야 합니다. 한쪽만 곱하면 다른 분수가 됩니다.',
        steps: [
          `(${n}×${k})/(${d}×${k}) = ${분수글(n * k, d * k)}`,
        ],
        misconceptionTip: '분자에만 곱하면 분수가 커지고, 분모에만 곱하면 작아집니다.',
        selfCheck: '만든 분수를 다시 간단히 하면 처음 분수가 되나요?',
      };
    },
  };

  const 나눠만들기: G5Family = {
    id: 'make-by-divide',
    make: (seed) => {
      const next = rand(seed + 5);
      const 분수 = 약분할분수(next);
      if (!분수) return null;
      const { n, d } = 분수;
      const 공약수 = divisorsOf(gcd(n, d)).filter((one) => one > 1);
      if (!공약수.length) return null;
      const k = pick(공약수, seed);
      return {
        prompt: `${분수글(n, d)}의 분모와 분자를 각각 ${k}로 나누어 크기가 같은 분수를 만들면 얼마일까요?`,
        answer: 분수글(n / k, d / k),
        wrongs: [분수글(n / k, d), 분수글(n, d / k), 분수글(n - k, d - k), 분수글(n / k, d / k + 1)],
        tag: 'fractionCompare',
        concept: '분모와 분자를 0이 아닌 같은 수로 나누어도 분수의 크기는 변하지 않습니다.',
        strategy: '나누어 크기가 같은 분수 만들기',
        hint: '분모와 분자 둘 다를 같은 수로 나누어야 합니다. 나누어떨어지는 수로만 나눌 수 있습니다.',
        steps: [
          `(${n}÷${k})/(${d}÷${k}) = ${분수글(n / k, d / k)}`,
        ],
        misconceptionTip: '분모와 분자에서 같은 수를 빼는 것이 아닙니다. 나누어야 크기가 그대로입니다.',
        selfCheck: '만든 분수의 분모와 분자에 다시 그 수를 곱하면 처음 분수가 되나요?',
      };
    },
  };

  const 여러개만들기: G5Family = {
    id: 'make-three',
    make: (seed) => {
      const next = rand(seed + 11);
      const n = 1 + next(4);
      const d = n + 1 + next(5);
      const 답 = [2, 3, 4].map((k) => 분수글(n * k, d * k)).join(', ');
      return {
        prompt: `${gwa(분수글(n, d))} 크기가 같은 분수를 작은 것부터 차례로 3개 만든 것은 어느 것일까요?`,
        answer: 답,
        wrongs: [
          [2, 3, 4].map((k) => 분수글(n + k, d + k)).join(', '),
          [2, 3, 4].map((k) => 분수글(n * k, d)).join(', '),
          [2, 3, 4].map((k) => 분수글(n, d * k)).join(', '),
          [1, 2, 3].map((k) => 분수글(n * k, d * (k + 1))).join(', '),
        ],
        tag: 'fractionCompare',
        concept: '분모와 분자에 2, 3, 4 … 를 차례로 곱하면 크기가 같은 분수를 얼마든지 만들 수 있습니다.',
        strategy: '크기가 같은 분수를 여러 개 만들기',
        hint: '분모와 분자에 2를 곱하고, 3을 곱하고, 4를 곱해 보세요. 늘 둘 다에 곱합니다.',
        steps: [
          `(${n}×2)/(${d}×2) = ${분수글(n * 2, d * 2)}`,
          `(${n}×3)/(${d}×3) = ${분수글(n * 3, d * 3)}`,
          `(${n}×4)/(${d}×4) = ${분수글(n * 4, d * 4)}`,
        ],
        misconceptionTip: '곱하는 수가 커져도 분수의 크기는 그대로입니다. 분수가 커지는 것이 아닙니다.',
        selfCheck: '만든 분수들을 그림으로 그리면 색칠한 부분의 크기가 모두 같나요?',
      };
    },
  };

  const 빈칸: G5Family = {
    id: 'blank-equal',
    make: (seed) => {
      const next = rand(seed + 17);
      const n = 1 + next(5);
      const d = n + 1 + next(6);
      const k = 2 + next(4);
      return {
        prompt: `${분수글(n, d)} = ${n * k}/□ 일 때 □에 알맞은 수는 얼마일까요?`,
        answer: String(d * k),
        wrongs: [String(d), String(d + k), String(d * (k + 1)), String(d + n * k)],
        tag: 'fractionCompare',
        concept: '분자에 곱한 수만큼 분모에도 곱해야 크기가 같습니다.',
        strategy: '크기가 같은 분수에서 빠진 수 구하기',
        hint: '분자가 몇 배가 되었는지 먼저 보세요. 분모도 같은 배가 되어야 합니다.',
        steps: [
          `분자가 ${n}에서 ${euro(String(n * k))} ${k}배가 되었습니다.`,
          `분모도 ${k}배가 되어야 하므로 ${d}×${k}=${d * k}입니다.`,
        ],
        misconceptionTip: '분자에 더한 수만큼 분모에 더하는 것이 아닙니다. 곱한 배를 맞춥니다.',
        selfCheck: '두 분수의 분모와 분자를 각각 견주면 같은 배인가요?',
      };
    },
  };

  const 뭉치 = [곱해만들기, 나눠만들기, 여러개만들기, 빈칸];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [나눠만들기, 빈칸, 곱해만들기, 여러개만들기];
  return [빈칸, 여러개만들기, 나눠만들기, 곱해만들기];
};

// ── 4차시 분수를 간단하게 나타내어 볼까요 (약분·기약분수) ──────────
export const unit4Lesson4 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 약분하기: G5Family = {
    id: 'reduce-by',
    make: (seed) => {
      const next = rand(seed);
      const 분수 = 약분할분수(next);
      if (!분수) return null;
      const { n, d } = 분수;
      const 공약수 = divisorsOf(gcd(n, d)).filter((one) => one > 1);
      if (!공약수.length) return null;
      const k = pick(공약수, seed);
      return {
        prompt: `${분수글(n, d)}${particleOf(분수글(n, d), '을')} ${k}로 약분하면 얼마일까요?`,
        answer: 분수글(n / k, d / k),
        wrongs: [분수글(n, d / k), 분수글(n / k, d), 분수글(n - k, d - k), 분수글(n / k + 1, d / k)],
        tag: 'fractionCompare',
        concept: '분모와 분자를 그들의 공약수로 나누는 것을 약분한다고 합니다.',
        strategy: '분수를 약분하기',
        hint: '약분은 분모와 분자를 같은 수로 나누는 것입니다. 나누는 수는 두 수의 공약수여야 합니다.',
        steps: [
          `${k}${particleOf(String(k), '은')} ${gwa(String(n))} ${d}의 공약수입니다.`,
          `(${n}÷${k})/(${d}÷${k}) = ${분수글(n / k, d / k)}`,
        ],
        misconceptionTip: '공약수가 아닌 수로는 약분할 수 없습니다. 나누어떨어지는지 먼저 보세요.',
        selfCheck: '약분한 분수가 처음 분수와 크기가 같나요?',
      };
    },
  };

  const 기약분수로: G5Family = {
    id: 'to-lowest',
    make: (seed) => {
      const next = rand(seed + 7);
      const 분수 = 약분할분수(next);
      if (!분수) return null;
      const { n, d } = 분수;
      const g = gcd(n, d);
      if (g < 2) return null;
      const 작은공약수 = divisorsOf(g).filter((one) => one > 1 && one < g)[0];
      const wrongs = [분수글(n, d), 분수글(d / g, n / g), 분수글(n / g + 1, d / g)];
      if (작은공약수) wrongs.unshift(분수글(n / 작은공약수, d / 작은공약수));
      return {
        prompt: `${분수글(n, d)}${particleOf(분수글(n, d), '을')} 기약분수로 나타내면 얼마일까요?`,
        answer: 분수글(n / g, d / g),
        wrongs,
        tag: 'fractionCompare',
        concept: '분모와 분자의 공약수가 1뿐인 분수를 기약분수라고 합니다.',
        strategy: '기약분수로 나타내기',
        hint: '한 번 약분한 뒤에도 더 나눌 수 있는지 보세요. 최대공약수로 나누면 한 번에 끝납니다.',
        steps: [
          `${gwa(String(n))} ${d}의 최대공약수는 ${g}입니다.`,
          `(${n}÷${g})/(${d}÷${g}) = ${분수글(n / g, d / g)}`,
          `${분수글(n / g, d / g)}의 분모와 분자의 공약수는 1뿐이므로 기약분수입니다.`,
        ],
        misconceptionTip: '한 번 약분했다고 기약분수가 되는 것은 아닙니다. 더 나눌 수 있는지 끝까지 보세요.',
        selfCheck: '구한 분수의 분모와 분자에 1 말고 또 다른 공약수가 있나요?',
      };
    },
  };

  const 기약인지: G5Family = {
    id: 'is-lowest',
    make: (seed) => {
      const next = rand(seed + 11);
      const 분수 = 약분할분수(next);
      if (!분수) return null;
      const { n, d } = 분수;
      const g = gcd(n, d);
      const 기약 = 분수글(n / g, d / g);
      const 아닌것 = [분수글(n, d), 분수글(n * 2, d * 2), 분수글((n / g) * 3, (d / g) * 3)];
      return {
        prompt: `다음 중 기약분수는 어느 것일까요?`,
        answer: 기약,
        wrongs: 아닌것,
        sameValueOk: true,
        tag: 'fractionCompare',
        concept: '분모와 분자의 공약수가 1뿐인 분수를 기약분수라고 합니다.',
        strategy: '기약분수 가리기',
        hint: '보기마다 분모와 분자를 함께 나눌 수 있는 수가 있는지 보세요. 1 말고는 없어야 기약분수입니다.',
        steps: [
          `${기약}의 분모와 분자의 공약수는 1뿐입니다.`,
          `나머지는 분모와 분자를 1이 아닌 수로 더 나눌 수 있습니다.`,
        ],
        misconceptionTip: '분자가 1이 아니어도 기약분수일 수 있습니다. 공약수가 1뿐인지가 기준입니다.',
        selfCheck: '고른 분수를 더 약분해 볼 수 있나요?',
      };
    },
  };

  const 몇번: G5Family = {
    id: 'all-reduced',
    make: (seed) => {
      const next = rand(seed + 13);
      const 분수 = 약분할분수(next);
      if (!분수) return null;
      const { n, d } = 분수;
      const 공약수 = divisorsOf(gcd(n, d)).filter((one) => one > 1);
      if (공약수.length < 2) return null;
      const 답 = 공약수.map((k) => 분수글(n / k, d / k)).join(', ');
      return {
        prompt: `${분수글(n, d)}${particleOf(분수글(n, d), '을')} 약분하여 나타낼 수 있는 분수를 모두 쓴 것은 어느 것일까요?`,
        answer: 답,
        wrongs: [
          공약수.map((k) => 분수글(n / k, d)).join(', '),
          [분수글(n / 공약수[0], d / 공약수[0])].join(', '),
          공약수.map((k) => 분수글(n * k, d * k)).join(', '),
          [...공약수, 공약수[공약수.length - 1] + 1].map((k) => 분수글(Math.round(n / k), Math.round(d / k))).join(', '),
        ],
        tag: 'fractionCompare',
        concept: '분모와 분자의 1이 아닌 공약수마다 한 번씩 약분할 수 있습니다.',
        strategy: '약분하여 나타낼 수 있는 분수 모두 찾기',
        hint: '분모와 분자의 공약수를 모두 찾으세요. 1을 뺀 공약수마다 분수가 하나씩 나옵니다.',
        steps: [
          `${gwa(String(n))} ${d}의 공약수: ${listText(divisorsOf(gcd(n, d)))}`,
          `1을 뺀 공약수 ${listText(공약수)}로 각각 약분하면 ${답}입니다.`,
        ],
        misconceptionTip: '최대공약수로 나눈 것만 답이 아닙니다. 1이 아닌 공약수마다 하나씩 나옵니다.',
        selfCheck: '구한 분수들이 모두 처음 분수와 크기가 같나요?',
      };
    },
  };

  const 뭉치 = [약분하기, 기약분수로, 기약인지, 몇번];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [기약분수로, 약분하기, 몇번, 기약인지];
  return [몇번, 기약분수로, 기약인지, 약분하기];
};

// ── 5차시 분모가 같은 분수로 어떻게 나타낼까요 (통분) ──────────────
export const unit4Lesson5 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 통분하기 = (방법: '곱' | '최소'): G5Family => ({
    id: `common-${방법}`,
    make: (seed) => {
      const next = rand(seed + (방법 === '곱' ? 0 : 5));
      const 두분수 = 통분할두분수(next, { 분모최대: 방법 === '곱' ? 8 : 12 });
      if (!두분수) return null;
      const { a, b } = 두분수;
      const 분모 = 방법 === '곱' ? a.d * b.d : lcm(a.d, b.d);
      // 분모가 100을 넘으면 통분한 분수를 그림으로도 머릿속으로도 그릴
      // 수 없게 됩니다. 이 차시가 보려는 것은 큰 수의 곱셈이 아닙니다.
      if (분모 > 72) return null;
      if (방법 === '최소' && a.d * b.d === lcm(a.d, b.d)) return null;
      const ka = 분모 / a.d;
      const kb = 분모 / b.d;
      const 답 = `${분수글(a.n * ka, 분모)}, ${분수글(b.n * kb, 분모)}`;
      return {
        prompt: `${gwa(분수글(a.n, a.d))} ${분수글(b.n, b.d)}${particleOf(분수글(b.n, b.d), '을')} ${방법 === '곱' ? '두 분모의 곱' : '두 분모의 최소공배수'}${particleOf(방법 === '곱' ? '곱' : '수', '을')} 공통분모로 하여 통분하면 어느 것일까요?`,
        answer: 답,
        wrongs: [
          // 분자는 그대로 두고 분모만 고친 것 — 가장 흔한 실수입니다.
          `${분수글(a.n, 분모)}, ${분수글(b.n, 분모)}`,
          // 곱하는 수를 서로 바꾼 것
          `${분수글(a.n * kb, 분모)}, ${분수글(b.n * ka, 분모)}`,
          // 분모를 더한 것
          `${분수글(a.n, a.d + b.d)}, ${분수글(b.n, a.d + b.d)}`,
          `${분수글(a.n * ka, 분모)}, ${분수글(b.n * kb, 분모 + 1)}`,
        ],
        tag: 'fractionCompare',
        concept: '분모가 다른 두 분수를 분모가 같은 분수로 고치는 것을 통분한다고 하고, 같아진 분모를 공통분모라고 합니다.',
        strategy: `${방법 === '곱' ? '두 분모의 곱' : '두 분모의 최소공배수'}으로 통분하기`,
        hint: '분모를 고친 만큼 분자도 함께 고쳐야 합니다. 분모에 곱한 수를 분자에도 똑같이 곱하세요.',
        steps: [
          방법 === '곱'
            ? `두 분모의 곱은 ${a.d}×${b.d}=${분모}입니다.`
            : `두 분모의 최소공배수는 ${분모}입니다.`,
          `(${a.n}×${ka})/(${a.d}×${ka}) = ${분수글(a.n * ka, 분모)}`,
          `(${b.n}×${kb})/(${b.d}×${kb}) = ${분수글(b.n * kb, 분모)}`,
          `그러므로 ${답}입니다.`,
        ],
        misconceptionTip: '분모만 같게 만들고 분자를 그대로 두면 크기가 달라집니다. 분자도 함께 고치세요.',
        selfCheck: '통분한 분수를 약분하면 처음 분수가 되나요?',
      } satisfies G5Spec;
    },
  });

  const 공통분모찾기: G5Family = {
    id: 'find-common-denominator',
    make: (seed) => {
      const next = rand(seed + 11);
      const 두분수 = 통분할두분수(next);
      if (!두분수) return null;
      const { a, b } = 두분수;
      const 최소 = lcm(a.d, b.d);
      if (최소 === a.d * b.d) return null;
      return {
        prompt: `${gwa(분수글(a.n, a.d))} ${분수글(b.n, b.d)}${particleOf(분수글(b.n, b.d), '을')} 통분할 때 공통분모가 될 수 있는 수 가운데 가장 작은 수는 얼마일까요?`,
        answer: String(최소),
        wrongs: [String(a.d * b.d), String(a.d + b.d), String(gcd(a.d, b.d)), String(최소 * 2)],
        tag: 'fractionCompare',
        concept: '공통분모는 두 분모의 공배수입니다. 그 가운데 가장 작은 것이 최소공배수입니다.',
        strategy: '공통분모 찾기',
        hint: '공통분모는 두 분모의 공배수여야 합니다. 두 분모의 배수를 써 보고 처음으로 함께 나오는 수를 찾으세요.',
        steps: [
          `${a.d}의 배수: ${[1, 2, 3, 4, 5, 6].map((k) => a.d * k).join(', ')}, …`,
          `${b.d}의 배수: ${[1, 2, 3, 4, 5, 6].map((k) => b.d * k).join(', ')}, …`,
          `처음으로 함께 나오는 수가 ${최소}이므로 가장 작은 공통분모는 ${최소}입니다.`,
        ],
        misconceptionTip: '두 분모를 곱한 수도 공통분모가 되지만, 가장 작은 것은 아닐 수 있습니다.',
        selfCheck: '구한 수가 두 분모로 모두 나누어떨어지나요?',
      };
    },
  };

  const 통분결과읽기: G5Family = {
    id: 'which-common',
    make: (seed) => {
      const next = rand(seed + 17);
      const 두분수 = 통분할두분수(next);
      if (!두분수) return null;
      const { a, b } = 두분수;
      const 최소 = lcm(a.d, b.d);
      const 답 = `${분수글((a.n * 최소) / a.d, 최소)}, ${분수글((b.n * 최소) / b.d, 최소)}`;
      return {
        prompt: `${gwa(분수글(a.n, a.d))} ${분수글(b.n, b.d)}${particleOf(분수글(b.n, b.d), '을')} 통분한 것으로 알맞은 것은 어느 것일까요? (공통분모는 가장 작은 수로 합니다.)`,
        answer: 답,
        wrongs: [
          `${분수글(a.n, 최소)}, ${분수글(b.n, 최소)}`,
          `${분수글((a.n * (a.d * b.d)) / a.d, a.d * b.d)}, ${분수글((b.n * (a.d * b.d)) / b.d, a.d * b.d)}`,
          `${분수글(a.n + b.n, 최소)}, ${분수글(a.n, 최소)}`,
          `${분수글((a.n * 최소) / a.d, 최소)}, ${분수글((b.n * 최소) / b.d + 1, 최소)}`,
        ],
        tag: 'fractionCompare',
        concept: '통분해도 각 분수의 크기는 변하지 않습니다.',
        strategy: '통분하기',
        hint: '공통분모를 먼저 정하고, 각 분수의 분모에 곱한 수를 분자에도 똑같이 곱하세요.',
        steps: [
          `두 분모 ${gwa(String(a.d))} ${b.d}의 최소공배수는 ${최소}입니다.`,
          `(${a.n}×${최소 / a.d})/(${a.d}×${최소 / a.d}) = ${분수글((a.n * 최소) / a.d, 최소)}`,
          `(${b.n}×${최소 / b.d})/(${b.d}×${최소 / b.d}) = ${분수글((b.n * 최소) / b.d, 최소)}`,
        ],
        misconceptionTip: '공통분모를 두 분모의 곱으로 해도 틀린 것은 아니지만, 가장 작은 수로 하라고 했다면 최소공배수를 씁니다.',
        selfCheck: '통분한 두 분수를 각각 약분하면 처음 분수가 되나요?',
      };
    },
  };

  const 뭉치 = [통분하기('최소'), 통분하기('곱'), 공통분모찾기, 통분결과읽기];
  if (difficulty === '하') return [통분하기('곱'), 통분하기('최소'), 공통분모찾기];
  if (difficulty === '중') return 뭉치;
  return [통분결과읽기, 공통분모찾기, 통분하기('최소'), 통분하기('곱')];
};

// ── 6차시 분수의 크기를 어떻게 비교할까요 ──────────────────────────
export const unit4Lesson6 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 둘비교: G5Family = {
    id: 'compare-two',
    make: (seed) => {
      const next = rand(seed);
      const 두분수 = 통분할두분수(next);
      if (!두분수) return null;
      const { a, b } = 두분수;
      const 최소 = lcm(a.d, b.d);
      const na = (a.n * 최소) / a.d;
      const nb = (b.n * 최소) / b.d;
      const 큰쪽 = na > nb ? a : b;
      const 작은쪽 = na > nb ? b : a;
      return {
        prompt: `${gwa(분수글(a.n, a.d))} ${분수글(b.n, b.d)} 중에서 더 큰 분수는 어느 것일까요?`,
        answer: 분수글(큰쪽.n, 큰쪽.d),
        wrongs: [
          분수글(작은쪽.n, 작은쪽.d),
          분수글(a.n + b.n, a.d + b.d),
          분수글(최소, na),
        ],
        tag: 'fractionCompare',
        concept: '분모가 다른 분수는 통분하여 분모를 같게 만든 뒤 분자를 견줍니다.',
        strategy: '분모가 다른 두 분수의 크기 비교하기',
        hint: '분모가 다르면 한 칸의 크기가 다릅니다. 통분해서 한 칸의 크기를 같게 만든 뒤에 분자를 견주세요.',
        steps: [
          `두 분모의 최소공배수 ${최소}${particleOf(String(최소), '을')} 공통분모로 하여 통분합니다.`,
          `${분수글(a.n, a.d)} = ${분수글(na, 최소)}, ${분수글(b.n, b.d)} = ${분수글(nb, 최소)}`,
          `분자를 견주면 ${Math.max(na, nb)}${particleOf(String(Math.max(na, nb)), '이')} 더 크므로 ${분수글(큰쪽.n, 큰쪽.d)}${particleOf(분수글(큰쪽.n, 큰쪽.d), '이')} 더 큽니다.`,
        ],
        misconceptionTip: '분모가 다른데 분자만 보고 정하면 안 됩니다. 분모가 클수록 한 칸이 작다는 것도 생각하세요.',
        selfCheck: '통분한 두 분수를 각각 약분하면 처음 분수가 되나요?',
      };
    },
  };

  const 셋줄세우기: G5Family = {
    id: 'order-three',
    make: (seed) => {
      const next = rand(seed + 7);
      const d1 = 2 + next(6);
      const d2 = 2 + next(6);
      const d3 = 2 + next(6);
      if (new Set([d1, d2, d3]).size < 3) return null;
      const ds = [d1, d2, d3];
      const 분수들 = ds.map((d) => ({ n: 1 + next(d - 1), d }));
      const 공통 = ds.reduce((acc, d) => lcm(acc, d), 1);
      if (공통 > 120) return null;
      const 값 = 분수들.map((one) => (one.n * 공통) / one.d);
      if (new Set(값).size < 3) return null;
      const 차례 = [...분수들].sort((x, y) => (y.n * 공통) / y.d - (x.n * 공통) / x.d);
      const 답 = 차례.map((one) => 분수글(one.n, one.d)).join(' > ');
      const 거꾸로 = [...차례].reverse().map((one) => 분수글(one.n, one.d)).join(' > ');
      const 분자순 = [...분수들].sort((x, y) => y.n - x.n).map((one) => 분수글(one.n, one.d)).join(' > ');
      const 분모순 = [...분수들].sort((x, y) => y.d - x.d).map((one) => 분수글(one.n, one.d)).join(' > ');
      return {
        prompt: `${분수들.map((one) => 분수글(one.n, one.d)).join(', ')}${particleOf(분수글(분수들[2].n, 분수들[2].d), '을')} 큰 것부터 차례로 쓴 것은 어느 것일까요?`,
        answer: 답,
        wrongs: [거꾸로, 분자순, 분모순],
        tag: 'fractionCompare',
        concept: '세 분수도 두 개씩 짝지어 견주거나, 한꺼번에 통분하여 견줍니다.',
        strategy: '세 분수의 크기 비교하기',
        hint: '세 분모의 공배수를 하나 찾아 한꺼번에 통분해 보세요. 그러면 분자만 보고 줄 세울 수 있습니다.',
        steps: [
          `세 분모 ${listText(ds)}의 공배수 ${공통}${particleOf(String(공통), '을')} 공통분모로 하여 통분합니다.`,
          분수들.map((one) => `${분수글(one.n, one.d)} = ${분수글((one.n * 공통) / one.d, 공통)}`).join(', '),
          `분자를 견주어 큰 것부터 쓰면 ${답}입니다.`,
        ],
        misconceptionTip: '분자가 크다고 큰 분수가 아니고, 분모가 작다고 큰 분수도 아닙니다. 통분해서 견주세요.',
        selfCheck: '줄 세운 차례대로 두 개씩 다시 견주어도 맞나요?',
      };
    },
  };

  const 부등호: G5Family = {
    id: 'sign',
    make: (seed) => {
      const next = rand(seed + 13);
      const 두분수 = 통분할두분수(next);
      if (!두분수) return null;
      const { a, b } = 두분수;
      const 최소 = lcm(a.d, b.d);
      const na = (a.n * 최소) / a.d;
      const nb = (b.n * 최소) / b.d;
      const 답 = na > nb ? '>' : '<';
      return {
        prompt: `${분수글(a.n, a.d)} □ ${분수글(b.n, b.d)} 의 □ 안에 알맞은 것은 어느 것일까요?`,
        answer: 답,
        wrongs: ['=', na > nb ? '<' : '>', '≥', '≤'],
        tag: 'fractionCompare',
        concept: '분모가 다른 분수는 통분하여 분자를 견줍니다.',
        strategy: '분수의 크기를 부등호로 나타내기',
        hint: '통분한 뒤 분자를 견주세요. 부등호는 큰 쪽으로 벌어집니다.',
        steps: [
          `${분수글(a.n, a.d)} = ${분수글(na, 최소)}, ${분수글(b.n, b.d)} = ${분수글(nb, 최소)}`,
          `${na} ${답} ${nb}이므로 ${분수글(a.n, a.d)} ${답} ${분수글(b.n, b.d)}입니다.`,
        ],
        misconceptionTip: '부등호의 벌어진 쪽이 큰 수를 봅니다. 방향을 거꾸로 쓰지 마세요.',
        selfCheck: '부등호의 벌어진 쪽에 더 큰 분수가 있나요?',
      };
    },
  };

  const 문장: G5Family = {
    id: 'story-compare',
    make: (seed) => {
      const next = rand(seed + 19);
      const 두분수 = 통분할두분수(next);
      if (!두분수) return null;
      const { a, b } = 두분수;
      const 최소 = lcm(a.d, b.d);
      const na = (a.n * 최소) / a.d;
      const nb = (b.n * 최소) / b.d;
      const 이름들 = ['수아', '준호', '지우', '민서', '태윤'];
      const 하나 = pick(이름들, seed);
      const 둘 = pick(이름들.filter((one) => one !== 하나), seed + 3);
      const 더많은 = na > nb ? 하나 : 둘;
      return {
        prompt: `${하나}${particleOf(하나, '은')} 물을 ${분수글(a.n, a.d)} L 마셨고, ${둘}${particleOf(둘, '은')} ${분수글(b.n, b.d)} L 마셨습니다. 물을 더 많이 마신 사람은 누구일까요?`,
        answer: 더많은,
        wrongs: [na > nb ? 둘 : 하나, '두 사람이 같습니다.', '알 수 없습니다.'],
        tag: 'fractionCompare',
        concept: '분모가 다른 양을 견줄 때에는 통분하여 같은 단위로 만든 뒤 견줍니다.',
        strategy: '실생활에서 분수의 크기 비교하기',
        hint: '두 분수의 분모가 다릅니다. 통분해서 같은 크기의 칸으로 만든 뒤 분자를 견주세요.',
        steps: [
          `${분수글(a.n, a.d)} = ${분수글(na, 최소)}, ${분수글(b.n, b.d)} = ${분수글(nb, 최소)}`,
          `${Math.max(na, nb)}${particleOf(String(Math.max(na, nb)), '이')} 더 크므로 ${더많은}${particleOf(더많은, '이')} 더 많이 마셨습니다.`,
        ],
        misconceptionTip: '분모가 큰 쪽이 더 많은 것이 아닙니다. 한 칸의 크기가 다르기 때문입니다.',
        selfCheck: '통분한 값으로 다시 견주어 보았나요?',
      };
    },
  };

  const 뭉치 = [둘비교, 부등호, 셋줄세우기, 문장];
  if (difficulty === '하') return [둘비교, 부등호, 문장];
  if (difficulty === '중') return 뭉치;
  return [셋줄세우기, 문장, 둘비교, 부등호];
};

// ── 7차시 분수와 소수의 크기를 어떻게 비교할까요 ───────────────────
export const unit4Lesson7 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  // 분모를 10이나 100으로 고칠 수 있는 분수만 씁니다. 1/3처럼 소수로
  // 딱 떨어지지 않는 분수는 이 차시에서 다루지 않습니다.
  const 소수되는분수 = (next: (bound: number) => number): { n: number; d: number; dec: string } | null => {
    const 분모들 = [2, 4, 5, 10, 20, 25, 50];
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const d = pick(분모들, next(1000));
      const n = 1 + next(d - 1);
      if (gcd(n, d) !== 1) continue;
      const 배 = 100 % d === 0 ? 100 / d : 0;
      if (!배) continue;
      const 백분자 = n * 배;
      const dec = 백분자 % 10 === 0 ? `0.${백분자 / 10}` : `0.${String(백분자).padStart(2, '0')}`;
      return { n, d, dec };
    }
    return null;
  };

  const 분수를소수로: G5Family = {
    id: 'to-decimal',
    make: (seed) => {
      const next = rand(seed);
      const one = 소수되는분수(next);
      if (!one) return null;
      const { n, d, dec } = one;
      // 분모를 10으로 만들 수 있으면 10, 아니면 100으로 만듭니다.
      const 바꾼분모 = 10 % d === 0 ? 10 : 100;
      const 곱할수 = 바꾼분모 / d;
      return {
        prompt: `${분수글(n, d)}${particleOf(분수글(n, d), '을')} 소수로 나타내면 얼마일까요?`,
        answer: dec,
        wrongs: [`0.${n}${d}`, `0.${d}${n}`, String(Number(dec) * 10), `0.${n}`],
        tag: 'fractionCompare',
        concept: '분모를 10이나 100으로 고치면 분수를 소수로 나타낼 수 있습니다.',
        strategy: '분수를 소수로 나타내기',
        hint: '분모를 10이나 100으로 만들려면 분모에 얼마를 곱해야 하는지 보세요. 분자에도 같은 수를 곱합니다.',
        steps: [
          `${d}에 ${곱할수}${particleOf(String(곱할수), '을')} 곱하면 ${바꾼분모}${particleOf(String(바꾼분모), '이')} 됩니다.`,
          `분자에도 같은 수를 곱하면 ${분수글(n * 곱할수, 바꾼분모)}입니다.`,
          `그러므로 ${dec}입니다.`,
        ],
        misconceptionTip: '분자와 분모를 그대로 늘어놓아 소수로 적으면 안 됩니다. 분모를 10이나 100으로 고쳐야 합니다.',
        selfCheck: '구한 소수를 다시 분수로 고치면 처음 분수가 되나요?',
      };
    },
  };

  const 소수를분수로: G5Family = {
    id: 'to-fraction',
    make: (seed) => {
      const next = rand(seed + 5);
      const 백분자 = 5 * (1 + next(19));
      if (백분자 >= 100) return null;
      const dec = 백분자 % 10 === 0 ? `0.${백분자 / 10}` : `0.${String(백분자).padStart(2, '0')}`;
      const g = gcd(백분자, 100);
      const 답 = 분수글(백분자 / g, 100 / g);
      return {
        prompt: `${dec}${particleOf(dec, '을')} 기약분수로 나타내면 얼마일까요?`,
        answer: 답,
        wrongs: [분수글(백분자, 100), 분수글(100, 백분자), 분수글(백분자 / g, 10), 분수글(백분자 / 5, 100 / 5 + 1)],
        tag: 'fractionCompare',
        concept: '소수 두 자리 수는 분모가 100인 분수로 나타낼 수 있습니다.',
        strategy: '소수를 분수로 나타내기',
        hint: '소수점 아래 자리 수만큼 분모에 0을 붙이세요. 그다음 약분합니다.',
        steps: [
          `${dec} = ${분수글(백분자, 100)}`,
          `${gwa(String(백분자))} 100의 최대공약수는 ${g}입니다.`,
          `(${백분자}÷${g})/(100÷${g}) = ${답}`,
        ],
        misconceptionTip: '분모를 100으로 고친 뒤 약분하는 것을 잊지 마세요. 기약분수로 나타내라고 했습니다.',
        selfCheck: '구한 분수를 다시 소수로 고치면 처음 소수가 되나요?',
      };
    },
  };

  const 섞어비교: G5Family = {
    id: 'compare-mixed',
    make: (seed) => {
      const next = rand(seed + 11);
      const one = 소수되는분수(next);
      if (!one) return null;
      const { n, d, dec } = one;
      const 값 = Number(dec);
      const 소수 = 값 + (next(2) === 0 ? 0.05 : -0.05);
      if (소수 <= 0 || 소수 >= 1) return null;
      const 소수글 = 소수.toFixed(2).replace(/0$/, '').replace(/\.$/, '');
      const 답 = 값 > 소수 ? 분수글(n, d) : 소수글;
      return {
        prompt: `${gwa(분수글(n, d))} ${소수글} 중에서 더 큰 수는 어느 것일까요?`,
        answer: 답,
        wrongs: [
          값 > 소수 ? 소수글 : 분수글(n, d),
          '두 수가 같습니다.',
          분수글(d, n),
        ],
        tag: 'fractionCompare',
        concept: '분수와 소수는 한쪽으로 고쳐서 견줍니다.',
        strategy: '분수와 소수의 크기 비교하기',
        hint: '분수를 소수로 고치거나 소수를 분수로 고쳐 보세요. 같은 꼴이 되어야 견줄 수 있습니다.',
        steps: [
          `${분수글(n, d)}${particleOf(분수글(n, d), '을')} 소수로 고치면 ${dec}입니다.`,
          `${gwa(dec)} ${소수글}${particleOf(소수글, '을')} 견주면 ${답 === 소수글 ? 소수글 : dec}${particleOf(답 === 소수글 ? 소수글 : dec, '이')} 더 큽니다.`,
          `그러므로 더 큰 수는 ${답}입니다.`,
        ],
        misconceptionTip: '분수와 소수를 그대로 견줄 수는 없습니다. 반드시 한쪽 꼴로 고치세요.',
        selfCheck: '고친 값으로 다시 견주어 보았나요?',
      };
    },
  };

  const 뭉치 = [분수를소수로, 소수를분수로, 섞어비교];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [소수를분수로, 섞어비교, 분수를소수로];
  return [섞어비교, 소수를분수로, 분수를소수로];
};
