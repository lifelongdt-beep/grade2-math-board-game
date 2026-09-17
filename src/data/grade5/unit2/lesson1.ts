import type { G5Family } from '../build';
import { add, compare, frac, mixed, mixedText, sub, text, type Frac } from '../fraction';
import { eul, eun, euroOf, gwa, i as iJosa, particleOf, pick, rand } from '../util';

// ════════════════════════════════════════════════════════════════════
// 2단원 1차시 단원 도입
// ────────────────────────────────────────────────────────────────────
// 지도서가 적어 둔 이 단원의 선수 학습입니다.
//   · 분수의 개념 [3-1]
//   · 여러 가지 분수(진분수·가분수·대분수) [3-2]
//   · 분모가 같은 분수의 덧셈·뺄셈 [4-2]
//   · 약분과 통분, 분모가 다른 분수의 덧셈·뺄셈 [5-1]
// 곱셈은 아직 배우지 않았으므로 여기서 묻지 않습니다.
// ════════════════════════════════════════════════════════════════════

// 문제에 쓰는 분수는 이미 약분된 것만 씁니다(2/4 같은 수를 쓰지 않습니다).
const 서로소 = (a: number, b: number): boolean => {
  for (let factor = 2; factor <= Math.min(a, b); factor += 1) {
    if (a % factor === 0 && b % factor === 0) return false;
  }
  return true;
};

const 분수만들기 = (next: (bound: number) => number) => {
  for (let tries = 0; tries < 30; tries += 1) {
    const d = 3 + next(7);
    const n = 1 + next(d - 1);
    if (서로소(n, d)) return { n, d };
  }
  return { n: 1, d: 3 };
};

const 최소공배수 = (a: number, b: number) => {
  for (let value = Math.max(a, b); value <= a * b; value += 1) {
    if (value % a === 0 && value % b === 0) return value;
  }
  return a * b;
};

export const unit2Lesson1Easy: G5Family[] = [
  {
    id: 'kind-of-fraction',
    make: (seed) => {
      const next = rand(seed);
      const d = 3 + next(6);
      const 갈래 = pick(['진분수', '가분수', '대분수'], seed);
      const 보기 =
        갈래 === '진분수'
          ? `${1 + next(d - 1)}/${d}`
          : 갈래 === '가분수'
            ? `${d + next(d)}/${d}`
            : mixedText(1 + next(3), 1 + next(d - 1), d);
      return {
        prompt: `${eun(보기)} 어떤 분수일까요?`,
        answer: 갈래,
        wrongs: ['진분수', '가분수', '대분수', '단위분수'].filter((one) => one !== 갈래),
        tag: 'fraction',
        strategy: '분수의 종류 구별하기',
        hint: '분자가 분모보다 작은지, 같거나 큰지 먼저 보세요. 자연수가 앞에 붙어 있는지도 봅니다.',
        steps: [
          '진분수는 분자가 분모보다 작고, 가분수는 분자가 분모와 같거나 큽니다.',
          '대분수는 자연수와 진분수로 이루어져 있습니다.',
          `그러므로 ${eun(보기)} ${갈래}입니다.`,
        ],
      };
    },
  },
  {
    id: 'mixed-to-improper',
    make: (seed) => {
      const next = rand(seed);
      const { n, d } = 분수만들기(next);
      const w = 1 + next(4);
      const answer = `${w * d + n}/${d}`;
      return {
        prompt: `대분수 ${mixedText(w, n, d)}${particleOf(`${n}/${d}`, '을')} 가분수로 나타내면 얼마일까요?`,
        answer,
        wrongs: [`${w + n}/${d}`, `${w * n}/${d}`, `${w * d + n}/${d * w}`, `${n}/${w * d}`],
        tag: 'fraction',
        strategy: '대분수를 가분수로 고치기',
        hint: `자연수 1이 ${iJosa(`1/${d}`)} ${d}개라는 것부터 떠올려 보세요.`,
        steps: [
          `자연수 ${eun(String(w))} ${iJosa(`1/${d}`)} ${w} × ${d} = ${w * d}(개)인 수입니다.`,
          `여기에 ${n}개를 더하면 ${iJosa(`1/${d}`)} ${w * d + n}개입니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'improper-to-mixed',
    make: (seed) => {
      const next = rand(seed);
      const d = 3 + next(6);
      const w = 1 + next(4);
      const rest = 1 + next(d - 1);
      const n = w * d + rest;
      const answer = `${mixedText(w, rest, d)}`;
      return {
        prompt: `가분수 ${eul(`${n}/${d}`)} 대분수로 나타내면 얼마일까요?`,
        answer,
        wrongs: [mixedText(w, rest + 1, d), mixedText(w + 1, rest, d), mixedText(rest, w, d), mixedText(w, d, rest)],
        tag: 'fraction',
        strategy: '가분수를 대분수로 고치기',
        hint: `분자 ${eul(String(n))} 분모 ${d}${euroText(d)} 나누어 보세요. 몫이 자연수 부분, 나머지가 분자가 됩니다.`,
        steps: [
          `${n} ÷ ${d} = ${w} … ${rest}입니다.`,
          `몫 ${iJosa(String(w))} 자연수 부분이 되고, 나머지 ${iJosa(String(rest))} 분자가 됩니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'reduce',
    make: (seed) => {
      const next = rand(seed);
      const d = 2 + next(5);
      const n = 1 + next(d - 1);
      const times = 2 + next(4);
      // n/d 자신이 기약분수가 아니면 답이 기약분수가 아니게 됩니다.
      // 8/16의 답은 2/4가 아니라 1/2입니다.
      const 줄인것 = frac(n, d);
      if (줄인것.n !== n || 줄인것.d !== d) return null;
      const answer = `${n}/${d}`;
      return {
        prompt: `${eul(`${n * times}/${d * times}`)} 기약분수로 나타내면 얼마일까요?`,
        answer,
        wrongs: [
          text(frac(n * times, d)),
          text(frac(n, d * times)),
          text(frac(n + 1, d + 1)),
          text(frac(n * times, d * times + times)),
        ],
        tag: 'fraction',
        strategy: '약분하여 기약분수로 나타내기',
        hint: '분자와 분모를 함께 나눌 수 있는 수를 찾아보세요. 가장 큰 수로 한 번에 나누면 기약분수가 됩니다.',
        steps: [
          `${gwa(String(n * times))} ${eun(String(d * times))} 모두 ${times}${euroText(times)} 나누어떨어집니다.`,
          `${n * times} ÷ ${times} = ${n}, ${d * times} ÷ ${times} = ${d}입니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'same-denominator-add',
    make: (seed) => {
      const next = rand(seed);
      const d = 4 + next(6);
      const a = 1 + next(d - 2);
      const b = 1 + next(d - 1);
      const answer = add(frac(a, d), frac(b, d));
      return {
        prompt: `${a}/${d} + ${eul(`${b}/${d}`)} 계산하면 얼마일까요?`,
        answer: text(answer),
        wrongs: [
          `${a + b}/${d + d}`,
          text(frac(a * b, d)),
          `${a + b}/${d * d}`,
          text(frac(Math.abs(a - b) || 1, d)),
        ],
        tag: 'fraction',
        strategy: '분모가 같은 분수의 덧셈',
        hint: '분모가 같으면 한 칸의 크기가 같습니다. 칸의 개수만 더하면 됩니다.',
        steps: [
          `분모가 ${d}${euroText(d)} 같으므로 분자끼리 더합니다.`,
          `${a} + ${b} = ${a + b}이므로 ${a + b}/${d}입니다.`,
          `${eul(`${a + b}/${d}`)} 정리하면 ${text(answer)}입니다.`,
        ],
      };
    },
  },
];

// '2로', '3으로', '1로'를 가려 씁니다. util의 규칙을 그대로 씁니다 —
// 받침이 없거나 ㄹ 받침이면 '로'입니다(일로, 칠로, 팔로).
const euroText = (value: number) => euroOf(String(value));

export const unit2Lesson1Middle: G5Family[] = [
  {
    id: 'different-denominator-add',
    make: (seed) => {
      const next = rand(seed);
      const d1 = 2 + next(5);
      const d2 = d1 + 1 + next(4);
      const a = 1 + next(d1 - 1);
      const b = 1 + next(d2 - 1);
      if (!서로소(a, d1) || !서로소(b, d2)) return null;
      const 공통 = 최소공배수(d1, d2);
      const answer = add(frac(a, d1), frac(b, d2));
      return {
        prompt: `${a}/${d1} + ${eul(`${b}/${d2}`)} 계산하면 얼마일까요?`,
        answer: text(answer),
        // 초등에서는 음수를 다루지 않으므로 뺄셈 결과를 오답으로 쓰지
        // 않습니다. 순서에 따라 음수가 나올 수 있습니다.
        wrongs: [
          `${a + b}/${d1 + d2}`,
          text(frac(a * b, d1 * d2)),
          `${a + b}/${공통}`,
          `${a + b}/${d1 * d2}`,
        ],
        tag: 'fraction',
        strategy: '분모가 다른 분수의 덧셈',
        hint: '분모가 다르면 바로 더할 수 없습니다. 두 분모의 공배수로 통분해 한 칸의 크기를 맞추세요.',
        steps: [
          `${gwa(String(d1))} ${d2}의 공배수인 ${d1 * d2}${euroText(d1 * d2)} 통분합니다.`,
          `${a}/${d1} = ${a * d2}/${d1 * d2}, ${b}/${d2} = ${b * d1}/${d1 * d2}입니다.`,
          `${a * d2} + ${b * d1} = ${a * d2 + b * d1}이므로 ${a * d2 + b * d1}/${d1 * d2}, 곧 ${text(answer)}입니다.`,
        ],
      };
    },
  },
  {
    id: 'compare-fractions',
    make: (seed) => {
      const next = rand(seed);
      const d1 = 3 + next(5);
      const d2 = d1 + 1 + next(4);
      const a = 1 + next(d1 - 1);
      const b = 1 + next(d2 - 1);
      if (!서로소(a, d1) || !서로소(b, d2)) return null;
      const left = frac(a, d1);
      const right = frac(b, d2);
      if (compare(left, right) === 0) return null;
      const 큰쪽 = compare(left, right) > 0 ? `${a}/${d1}` : `${b}/${d2}`;
      const 작은쪽 = 큰쪽 === `${a}/${d1}` ? `${b}/${d2}` : `${a}/${d1}`;
      return {
        prompt: `${gwa(`${a}/${d1}`)} ${b}/${d2} 중에서 더 큰 수는 무엇일까요?`,
        answer: 큰쪽,
        wrongs: [작은쪽, '두 분수는 같습니다.', text(add(left, right)), `${a + b}/${d1 + d2}`],
        tag: 'fraction',
        strategy: '분모가 다른 분수의 크기 비교',
        hint: '분모가 다르면 칸의 크기가 달라 분자만으로는 견줄 수 없습니다. 통분해서 한 칸의 크기를 맞추세요.',
        steps: [
          `${d1 * d2}${euroText(d1 * d2)} 통분하면 ${a * d2}/${d1 * d2}${gwa(String(a * d2))} ${b * d1}/${d1 * d2}입니다.`,
          `분모가 같으므로 분자를 견주면 ${Math.max(a * d2, b * d1)}${iJosa(String(Math.max(a * d2, b * d1)))} 더 큽니다.`,
          `그러므로 ${iJosa(큰쪽)} 더 큽니다.`,
        ],
        misconceptionTip: '분모가 다른 분수는 분자가 크다고 큰 수가 아닙니다. 1/2이 3/8보다 큽니다.',
      };
    },
  },
  {
    id: 'mixed-add',
    make: (seed) => {
      const next = rand(seed);
      const d = 4 + next(5);
      const w1 = 1 + next(3);
      const w2 = 1 + next(3);
      const a = 1 + next(d - 1);
      const b = 1 + next(d - 1);
      const answer = add(mixed(w1, a, d), mixed(w2, b, d));
      return {
        prompt: `${mixedText(w1, a, d)} + ${mixedText(w2, b, d)}${particleOf(`${b}/${d}`, '을')} 계산하면 얼마일까요?`,
        answer: text(answer),
        wrongs: [
          mixedText(w1 + w2, a + b, d * 2),
          text(mixed(w1 + w2, Math.min(a + b, d - 1), d)),
          text(mixed(w1 * w2, a + b, d)),
          text(sub(mixed(w1, a, d), mixed(w2, b, d))),
        ],
        tag: 'fraction',
        strategy: '대분수의 덧셈',
        hint: '자연수 부분끼리, 분수 부분끼리 더해 보세요. 분수 부분이 1보다 커지면 자연수 쪽으로 옮깁니다.',
        steps: [
          `자연수 부분끼리 더하면 ${w1} + ${w2} = ${w1 + w2}입니다.`,
          `분수 부분끼리 더하면 ${a}/${d} + ${b}/${d} = ${a + b}/${d}입니다.`,
          `두 결과를 합치면 ${text(answer)}입니다.`,
        ],
      };
    },
  },
  {
    id: 'fraction-of-day',
    make: (seed) => {
      const next = rand(seed);
      const 상황 = pick([
        { 글: '물이 1 L 있었는데 그중 얼마를 마셨습니다.', 남은: '남은 물' },
        { 글: '색 테이프가 1 m 있었는데 그중 얼마를 썼습니다.', 남은: '남은 색 테이프' },
        { 글: '피자 한 판을 똑같이 나누어 그중 얼마를 먹었습니다.', 남은: '남은 피자' },
      ], seed);
      const d = 4 + next(6);
      const n = 1 + next(d - 2);
      if (!서로소(n, d)) return null;
      const answer = frac(d - n, d);
      return {
        prompt: `${상황.글} 쓴 양이 전체의 ${n}/${d}일 때, ${상황.남은}은 전체의 얼마일까요?`,
        answer: text(answer),
        wrongs: [
          `${n}/${d}`,
          text(frac(d - n, d + n)),
          text(frac(n, d - n)),
          text(add(frac(n, d), frac(1, d))),
        ],
        tag: 'fraction',
        strategy: '전체에서 일부를 덜어 낸 나머지 구하기',
        hint: `전체는 ${d}/${d}, 곧 1입니다. 여기서 쓴 만큼을 빼 보세요.`,
        steps: [
          `전체 1${eul('1')} 분모가 ${d}인 분수로 나타내면 ${d}/${d}입니다.`,
          `${d}/${d} - ${n}/${d} = ${d - n}/${d}입니다.`,
          `그러므로 ${text(answer)}입니다.`,
        ],
      };
    },
  },
  {
    id: 'unit-fraction-count',
    make: (seed) => {
      const next = rand(seed);
      const d = 3 + next(6);
      const count = d + 1 + next(d * 2);
      const answer = text(frac(count, d));
      return {
        prompt: `${iJosa(`1/${d}`)} ${count}개인 수는 얼마일까요?`,
        answer,
        wrongs: [
          `${count}/${d * d}`,
          String(count),
          text(frac(d, count)),
          text(frac(count + 1, d)),
        ],
        tag: 'fraction',
        strategy: '단위분수의 개수로 분수 나타내기',
        hint: `${iJosa(`1/${d}`)} ${d}개이면 1입니다. ${d}개씩 몇 묶음인지 먼저 세어 보세요.`,
        steps: [
          `${iJosa(`1/${d}`)} ${count}개이면 ${count}/${d}입니다.`,
          `${eun(`${count}/${d}`)} 가분수이므로 대분수로 고칩니다. ${count} ÷ ${d} = ${Math.floor(count / d)} … ${count % d}입니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
];

export const unit2Lesson1Hard: G5Family[] = [
  {
    id: 'between-fractions',
    make: (seed) => {
      const next = rand(seed);
      const d = 3 + next(4);
      const n = 1 + next(d - 2);
      if (!서로소(n, d) || !서로소(n + 1, d)) return null;
      const left = frac(n, d);
      const right = frac(n + 1, d);
      // 두 분수 사이의 수는 통분해서 찾습니다.
      const answer = frac(2 * n + 1, 2 * d);
      return {
        prompt: `${n}/${d}보다 크고 ${n + 1}/${d}보다 작은 분수는 어느 것일까요?`,
        answer: text(answer),
        wrongs: [text(left), text(right), text(frac(n + 2, d)), text(frac(n, d + 1))],
        tag: 'fraction',
        strategy: '두 분수 사이의 분수 찾기',
        hint: '두 분수의 분모를 크게 바꾸어(통분하여) 사이에 자리가 생기게 해 보세요.',
        steps: [
          `${gwa(`${n}/${d}`)} ${eul(`${n + 1}/${d}`)} 분모 ${2 * d}${euroText(2 * d)} 통분하면 ${2 * n}/${2 * d}${gwa(String(2 * n))} ${2 * n + 2}/${2 * d}입니다.`,
          `그 사이에 ${2 * n + 1}/${2 * d}${iJosa(String(2 * n + 1))} 있습니다.`,
          `그러므로 ${text(answer)}입니다.`,
        ],
        misconceptionTip: '분모가 같은 두 분수 사이에도 분수는 얼마든지 있습니다. 분모를 크게 바꾸면 보입니다.',
      };
    },
  },
  {
    id: 'make-mixed',
    make: (seed) => {
      const next = rand(seed);
      const 합 = 5 + next(5);
      // 자연수 부분이 1이고 분자와 분모의 합이 주어진 대분수 중 가장 큰 것
      const 후보: Array<{ n: number; d: number }> = [];
      for (let n = 1; n < 합; n += 1) {
        const d = 합 - n;
        if (n < d) 후보.push({ n, d });
      }
      if (후보.length < 3) return null;
      const 가장큰 = 후보.reduce((best, one) => (one.n / one.d > best.n / best.d ? one : best));
      const answer = mixedText(1, 가장큰.n, 가장큰.d);
      return {
        prompt: `자연수 부분이 1이고 분자와 분모의 합이 ${합}인 대분수 중에서 가장 큰 수는 무엇일까요?`,
        answer,
        wrongs: 후보
          .filter((one) => one !== 가장큰)
          .map((one) => mixedText(1, one.n, one.d))
          .concat(mixedText(1, 가장큰.d, 가장큰.n)),
        tag: 'fraction',
        strategy: '조건에 맞는 대분수 만들기',
        hint: `분자와 분모의 합이 ${합}이면서 분자가 분모보다 작은 짝을 모두 적어 보세요. 그중에서 견주면 됩니다.`,
        steps: [
          `분자와 분모의 합이 ${합}이고 진분수인 것은 ${후보.map((one) => `${one.n}/${one.d}`).join(', ')}입니다.`,
          `자연수 부분이 모두 1로 같으므로 분수 부분이 가장 큰 것을 찾습니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'sum-to-target',
    make: (seed) => {
      const next = rand(seed);
      const d = 4 + next(5);
      const a = 1 + next(d - 2);
      const 남은 = d - a;
      if (!서로소(a, d) || !서로소(남은, d)) return null;
      const answer = `${남은}/${d}`;
      return {
        prompt: `${a}/${d} + ▢ = 1일 때 ▢에 알맞은 분수는 무엇일까요?`,
        answer,
        wrongs: [`${a}/${d}`, '1', `${d}/${남은}`, `${남은 + 1}/${d}`],
        tag: 'fraction',
        strategy: '합이 1이 되는 분수 구하기',
        hint: `1${eul('1')} 분모가 ${d}인 분수로 바꾸어 적어 보세요. 그러면 빼기만 하면 됩니다.`,
        steps: [
          `1${eul('1')} 분모가 ${d}인 분수로 나타내면 ${d}/${d}입니다.`,
          `${d}/${d} - ${a}/${d} = ${남은}/${d}입니다.`,
          `그러므로 ▢에 알맞은 분수는 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'common-denominator',
    make: (seed) => {
      const next = rand(seed);
      const d1 = 2 + next(5);
      const d2 = d1 + 1 + next(4);
      const a = 1 + next(d1 - 1);
      const b = 1 + next(d2 - 1);
      if (!서로소(a, d1) || !서로소(b, d2)) return null;
      const 공통 = 최소공배수(d1, d2);
      // 한쪽 분모가 다른 쪽의 배수이면 한 분수는 그대로 남아, 통분하는
      // 뜻이 드러나지 않습니다.
      if (공통 === d1 || 공통 === d2) return null;
      const answer = `${(a * 공통) / d1}/${공통}, ${(b * 공통) / d2}/${공통}`;
      return {
        prompt: `${gwa(`${a}/${d1}`)} ${eul(`${b}/${d2}`)} 최소공배수로 통분하면 어느 것일까요?`,
        answer,
        wrongs: [
          `${a}/${공통}, ${b}/${공통}`,
          `${(a * 공통) / d1}/${d1 * d2}, ${(b * 공통) / d2}/${d1 * d2}`,
          `${a * d2}/${d1 * d2}, ${b * d1}/${d1 * d2}`,
          `${a + 공통 - d1}/${공통}, ${b + 공통 - d2}/${공통}`,
        ],
        tag: 'fraction',
        strategy: '두 분수를 통분하기',
        hint: `두 분모 ${gwa(String(d1))} ${d2}의 최소공배수를 먼저 구하세요. 그 수가 새 분모가 됩니다.`,
        steps: [
          `${gwa(String(d1))} ${d2}의 최소공배수는 ${공통}입니다.`,
          `${a}/${d1}의 분모와 분자에 ${공통 / d1}${euroText(공통 / d1)} 곱하면 ${(a * 공통) / d1}/${공통}입니다.`,
          `${b}/${d2}의 분모와 분자에 ${공통 / d2}${euroText(공통 / d2)} 곱하면 ${(b * 공통) / d2}/${공통}입니다.`,
          `그러므로 ${answer}입니다.`,
        ],
        misconceptionTip: '통분할 때는 분모만 바꾸면 안 됩니다. 분모에 곱한 수를 분자에도 똑같이 곱해야 크기가 그대로입니다.',
      };
    },
  },
  {
    id: 'count-proper-fractions',
    make: (seed) => {
      const next = rand(seed);
      const d = 4 + next(6);
      // 분모가 d인 진분수는 1/d부터 (d-1)/d까지입니다.
      const 개수 = d - 1;
      return {
        prompt: `분모가 ${d}인 진분수는 모두 몇 개일까요?`,
        answer: `${개수}개`,
        wrongs: [`${d}개`, `${d + 1}개`, `${개수 - 1}개`, `${Math.floor(d / 2)}개`],
        tag: 'fraction',
        strategy: '조건에 맞는 분수의 개수 구하기',
        hint: `진분수는 분자가 분모보다 작습니다. 분자가 될 수 있는 수를 1부터 차례로 적어 보세요.`,
        steps: [
          `진분수는 분자가 분모보다 작은 분수입니다.`,
          `분모가 ${d}이므로 분자는 1부터 ${d - 1}까지가 될 수 있습니다.`,
          `그러므로 모두 ${개수}개입니다.`,
        ],
      };
    },
  },
  {
    id: 'order-three',
    make: (seed) => {
      const next = rand(seed);
      const 분수들: Frac[] = [];
      const 글: string[] = [];
      const 쓴것 = new Set<string>();
      while (분수들.length < 3) {
        const d = 3 + next(6);
        const n = 1 + next(d - 1);
        if (!서로소(n, d)) continue;
        const key = `${n}/${d}`;
        if (쓴것.has(key)) continue;
        const f = frac(n, d);
        if (분수들.some((one) => compare(one, f) === 0)) continue;
        쓴것.add(key);
        분수들.push(f);
        글.push(key);
      }
      const 가장큰 = 분수들.reduce((best, one) => (compare(one, best) > 0 ? one : best));
      const 가장큰글 = 글[분수들.indexOf(가장큰)];
      return {
        prompt: `세 분수 ${글.join(', ')} 중에서 가장 큰 수는 무엇일까요?`,
        answer: 가장큰글,
        wrongs: 글.filter((one) => one !== 가장큰글).concat('세 분수는 모두 같습니다.'),
        tag: 'fraction',
        strategy: '여러 분수의 크기 비교',
        hint: '분모를 모두 같게 맞추거나, 1에서 얼마나 모자란지를 견주어 보세요.',
        steps: [
          '분모가 다르므로 한 칸의 크기가 다릅니다. 통분하거나 1에서 모자란 만큼을 견줍니다.',
          `견주어 보면 ${iJosa(가장큰글)} 가장 큽니다.`,
        ],
      };
    },
  },
];
