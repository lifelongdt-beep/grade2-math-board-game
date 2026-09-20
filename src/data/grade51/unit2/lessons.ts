import type { G5Family } from '../../grade5/build';
import { eun, euro, gwa, particleOf, pick, rand } from '../../grade5/util';
import {
  commonDivisors,
  commonMultiples,
  divisorsOf,
  gcd,
  lcm,
  ladderSteps,
  listSteps,
  listText,
  multiplesOf,
  pairFor,
} from './core';

// ════════════════════════════════════════════════════════════════════
// 2단원 약수와 배수 — 1~6차시
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   2~3 약수와 배수  4 공약수와 최대공약수  5 최대공약수 구하기
//   6 공배수와 최소공배수  7 최소공배수 구하기
//
// 차례가 곧 쓸 수 있는 말의 차례입니다. 2차시 문항에 '공약수'가 나오면
// 아직 배우지 않은 말을 묻는 것이고, 4·5차시 문항에 '최소공배수'가
// 나오면 두 차시를 앞질러 갑니다. 그래서 차시마다 쓰는 말을 뭉치가
// 직접 정합니다.
// ════════════════════════════════════════════════════════════════════

const 이름 = ['수지', '지윤', '제니', '민준', '소희', '재우', '기범', '연진', '성호', '은서'];

// 약수를 묻기 좋은 수입니다. 약수가 둘(1과 자기 자신)뿐인 수는 물어도
// 답이 늘 같아 문항이 되지 않고, 약수가 너무 많으면 늘어놓기가 됩니다.
const 약수좋은수 = (next: (bound: number) => number): number => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const value = 6 + next(55);
    const count = divisorsOf(value).length;
    if (count >= 4 && count <= 8) return value;
  }
  return 24;
};

// ── 1차시 단원 도입 ─────────────────────────────────────────────────
// 아직 '약수'도 '배수'도 배우지 않았습니다. 나누어떨어지는지, 곱셈식과
// 나눗셈식이 어떻게 이어지는지만 봅니다.
export const unit2Lesson1: G5Family[] = [
  {
    id: 'divides',
    make: (seed) => {
      const next = rand(seed);
      const value = 약수좋은수(next);
      // 답과 오답의 크기가 비슷해야 합니다. 오답이 한 자리 수인데 답만
      // 19라면, 아이는 나누어 보지 않고 '혼자 다른 것'을 고릅니다.
      const 되는수 = divisorsOf(value).filter((one) => one >= 2 && one <= 9);
      if (!되는수.length) return null;
      const 답 = pick(되는수, seed);
      const 안되는수 = [2, 3, 4, 5, 6, 7, 8, 9].filter((one) => value % one !== 0);
      if (안되는수.length < 3) return null;
      return {
        prompt: `${value}${particleOf(String(value), '을')} 남김없이 똑같이 나눌 수 있는 수는 어느 것일까요?`,
        answer: String(답),
        wrongs: 안되는수.map(String),
        tag: 'divisor',
        concept: '나누어떨어진다는 것은 나머지가 0이라는 뜻입니다.',
        strategy: '나누어떨어지는 수 찾기',
        hint: `${value}${particleOf(String(value), '을')} 보기의 수로 각각 나누어 보고 나머지가 0인 것을 찾으세요.`,
        steps: [
          `${value}÷${답}=${value / 답}이므로 나머지가 0입니다.`,
          `그러므로 ${value}${particleOf(String(value), '은')} ${euro(String(답))} 나누어떨어집니다.`,
        ],
        misconceptionTip: '나누어떨어지는지는 눈으로 보아 정할 수 없습니다. 실제로 나누어 나머지를 확인하세요.',
        selfCheck: '나눈 몫에 나눈 수를 곱하면 처음 수가 되나요?',
      };
    },
  },
  {
    id: 'mul-div-pair',
    make: (seed) => {
      const next = rand(seed + 5);
      const a = 2 + next(8);
      const b = 3 + next(9);
      const product = a * b;
      return {
        prompt: `${a}×${b}=${product}입니다. 이 곱셈식을 나눗셈식으로 바르게 나타낸 것은 어느 것일까요?`,
        answer: `${product}÷${a}=${b}`,
        wrongs: [`${a}÷${b}=${product}`, `${product}÷${b}=${a + 1}`, `${product}×${a}=${b}`, `${b}÷${product}=${a}`],
        tag: 'divisor',
        concept: '곱셈식 하나는 나눗셈식 두 개와 같은 말입니다.',
        strategy: '곱셈과 나눗셈의 관계 떠올리기',
        hint: '곱해서 나온 수가 나눗셈에서는 나누어지는 수입니다. 가장 큰 수가 어디에 놓이는지 보세요.',
        steps: [
          `${a}×${b}=${product}이므로 ${product}${particleOf(String(product), '을')} ${a}로 나누면 ${b}입니다.`,
          `${product}÷${a}=${b}`,
        ],
        misconceptionTip: '나눗셈식에서 가장 큰 수는 늘 맨 앞(나누어지는 수)에 옵니다.',
        selfCheck: '만든 나눗셈식의 몫에 나눈 수를 곱하면 처음 수가 되나요?',
      };
    },
  },
  {
    id: 'times',
    make: (seed) => {
      const next = rand(seed + 11);
      const base = 2 + next(8);
      const k = 3 + next(5);
      return {
        prompt: `${base}${particleOf(String(base), '을')} ${k}배 한 수는 얼마일까요?`,
        answer: String(base * k),
        wrongs: [String(base + k), String(base * (k + 1)), String(base * (k - 1)), String(base * k + 1)],
        tag: 'divisor',
        concept: '몇 배 한 수는 곱셈으로 구합니다.',
        strategy: '몇 배 한 수 구하기',
        hint: '"몇 배"는 곱하라는 말입니다. 더하는 것이 아닙니다.',
        steps: [`${base}×${k}=${base * k}`],
        misconceptionTip: '"몇 배"와 "몇 더"를 바꾸어 읽지 마세요. 배는 곱셈입니다.',
        selfCheck: '구한 수를 처음 수로 나누면 몇 배 했는지가 나오나요?',
      };
    },
  },
  {
    id: 'share-evenly',
    make: (seed) => {
      const next = rand(seed + 17);
      const value = 약수좋은수(next);
      const 쓸수있는 = divisorsOf(value).filter((one) => one >= 2 && one <= 9);
      if (!쓸수있는.length) return null;
      const 답 = pick(쓸수있는, seed + 3);
      const 안되는 = [2, 3, 4, 5, 6, 7, 8, 9].filter((one) => value % one !== 0);
      if (안되는.length < 3) return null;
      return {
        prompt: `모종 ${value}포기를 화분에 남김없이 똑같이 나누어 심으려고 합니다. 화분 몇 개에 나누어 심을 수 있을까요?`,
        answer: `${답}개`,
        wrongs: 안되는.map((one) => `${one}개`),
        tag: 'divisor',
        concept: '남김없이 똑같이 나눌 수 있다는 것은 나누어떨어진다는 뜻입니다.',
        strategy: '남김없이 똑같이 나누는 경우 찾기',
        hint: '화분 수로 모종 수를 나누어 보세요. 남는 모종이 있으면 그 수는 안 됩니다.',
        steps: [
          `${value}÷${답}=${value / 답}이므로 남는 모종이 없습니다.`,
          `그러므로 화분 ${답}개에 ${value / 답}포기씩 심을 수 있습니다.`,
        ],
        misconceptionTip: '한 화분에 몇 포기씩 심느냐가 아니라, 남는 것이 있느냐를 먼저 봅니다.',
        selfCheck: '한 화분에 심는 수에 화분 수를 곱하면 처음 모종 수가 되나요?',
      };
    },
  },
];

// ── 2차시 약수와 배수는 무엇일까요 ──────────────────────────────────
export const unit2Lesson2 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 약수모두: G5Family = {
    id: 'all-divisors',
    make: (seed) => {
      const next = rand(seed);
      const value = 약수좋은수(next);
      const all = divisorsOf(value);
      if (all.length < 4) return null;
      return {
        prompt: `${value}의 약수를 모두 구한 것은 어느 것일까요?`,
        answer: listText(all),
        wrongs: [
          // 1을 빠뜨린 것 — 가장 흔한 실수입니다.
          listText(all.slice(1)),
          // 자기 자신을 빠뜨린 것 — 그다음으로 흔합니다.
          listText(all.slice(0, -1)),
          // 약수가 아닌 수를 하나 끼워 넣은 것
          listText([...all, value + 1].sort((a, b) => a - b)),
          listText(all.filter((one) => one % 2 === 1)),
        ],
        tag: 'divisor',
        concept: '어떤 수를 나누어떨어지게 하는 수가 그 수의 약수입니다.',
        strategy: '약수 구하기',
        hint: '1부터 차례대로 나누어 보세요. 1과 그 수 자신도 빠뜨리지 말고 넣어야 합니다.',
        steps: [
          `1부터 ${value}까지 차례대로 나누어 나머지가 0인 수를 찾습니다.`,
          ...all.map((one) => `${value}÷${one}=${value / one}`).slice(0, 6),
          `그러므로 ${value}의 약수는 ${listText(all)}입니다.`,
        ],
        misconceptionTip: '1과 그 수 자신도 약수입니다. 이 둘을 빠뜨리는 일이 가장 잦습니다.',
        selfCheck: '고른 수로 모두 나누어떨어지는지 하나씩 확인했나요?',
      };
    },
  };

  const 약수아닌것: G5Family = {
    id: 'not-divisor',
    make: (seed) => {
      const next = rand(seed + 7);
      const value = 약수좋은수(next);
      const all = divisorsOf(value);
      if (all.length < 4) return null;
      // 보기 넷이 비슷한 크기여야 합니다. 약수 셋을 먼저 고른 다음,
      // 그 사이에 있는 '약수가 아닌 수'를 답으로 씁니다. 크기로 답이
      // 드러나면 아이는 나누어 보지 않고 고릅니다.
      const 보기약수 = all.slice(0, 3);
      const 아래 = 보기약수[0];
      const 위 = 보기약수[보기약수.length - 1];
      const 아닌수: number[] = [];
      for (let k = 아래 + 1; k < Math.max(위, 아래 + 4); k += 1) {
        if (value % k !== 0) 아닌수.push(k);
      }
      if (!아닌수.length) return null;
      const 답 = pick(아닌수, seed);
      return {
        prompt: `다음 중 ${value}의 약수가 아닌 것은 어느 것일까요?`,
        answer: String(답),
        wrongs: 보기약수.map(String),
        tag: 'divisor',
        concept: '어떤 수를 나누어떨어지게 하는 수가 그 수의 약수입니다.',
        strategy: '약수인지 가리기',
        hint: `보기의 수로 ${value}${particleOf(String(value), '을')} 각각 나누어 보세요. 나머지가 생기는 것이 답입니다.`,
        steps: [
          `${value}의 약수는 ${listText(all)}입니다.`,
          `${답}${particleOf(String(답), '은')} 이 안에 없습니다. ${value}÷${답}${particleOf(String(답), '은')} 나누어떨어지지 않습니다.`,
        ],
        misconceptionTip: '작은 수라고 모두 약수인 것은 아닙니다. 나누어 보아야 압니다.',
        selfCheck: '나머지가 0이 아닌 것을 골랐나요?',
      };
    },
  };

  const 배수쓰기: G5Family = {
    id: 'first-multiples',
    make: (seed) => {
      const next = rand(seed + 13);
      const base = 3 + next(12);
      const three = multiplesOf(base, 3);
      return {
        prompt: `${base}의 배수를 가장 작은 수부터 차례로 3개 쓴 것은 어느 것일까요?`,
        answer: listText(three),
        wrongs: [
          // 0부터 시작한다고 생각한 것
          listText([0, base, base * 2]),
          // 배수를 '더해 가는 수'가 아니라 '1씩 커지는 수'로 읽은 것
          listText([base, base + 1, base + 2]),
          // 1배를 빠뜨린 것
          listText(multiplesOf(base, 4).slice(1)),
          listText([base, base * 2, base * 4]),
        ],
        tag: 'divisor',
        concept: '어떤 수를 1배, 2배, 3배 … 한 수가 그 수의 배수입니다.',
        strategy: '배수 구하기',
        hint: '배수는 그 수를 1배 한 것부터 시작합니다. 1배 한 수는 그 수 자신입니다.',
        steps: [
          `${base}×1=${base}, ${base}×2=${base * 2}, ${base}×3=${base * 3}`,
          `그러므로 ${base}의 배수는 ${listText(three)}, …입니다.`,
        ],
        misconceptionTip: '배수는 그 수 자신부터 시작합니다. 0은 넣지 않습니다.',
        selfCheck: '쓴 수들을 모두 처음 수로 나누면 나머지가 0인가요?',
      };
    },
  };

  const 관계: G5Family = {
    id: 'relation',
    make: (seed) => {
      const next = rand(seed + 19);
      const a = 2 + next(7);
      const b = 3 + next(9);
      if (a === b) return null;
      const product = a * b;
      return {
        prompt: `${a}×${b}=${product}입니다. 이 식을 보고 알 수 있는 것으로 옳은 것은 어느 것일까요?`,
        answer: `${product}${particleOf(String(product), '은')} ${a}의 배수입니다.`,
        wrongs: [
          `${a}${particleOf(String(a), '은')} ${product}의 배수입니다.`,
          `${product}${particleOf(String(product), '은')} ${a}의 약수입니다.`,
          `${b}${particleOf(String(b), '은')} ${product}의 배수입니다.`,
          `${a}${particleOf(String(a), '은')} ${b}의 약수입니다.`,
        ],
        tag: 'divisor',
        concept: '■=▲×●이면 ▲와 ●는 ■의 약수이고, ■는 ▲와 ●의 배수입니다.',
        strategy: '약수와 배수의 관계 알기',
        hint: '곱해서 나온 큰 수가 배수이고, 곱한 두 수가 약수입니다. 어느 쪽이 큰지부터 보세요.',
        steps: [
          `${a}×${b}=${product}이므로 ${product}${particleOf(String(product), '은')} ${a}${particleOf(String(a), '과')} ${b}로 나누어떨어집니다.`,
          `그러므로 ${a}${particleOf(String(a), '과')} ${b}${particleOf(String(b), '은')} ${product}의 약수이고, ${product}${particleOf(String(product), '은')} ${a}${particleOf(String(a), '과')} ${b}의 배수입니다.`,
        ],
        misconceptionTip: '약수는 그 수보다 작거나 같고, 배수는 그 수보다 크거나 같습니다. 방향을 바꾸어 말하지 마세요.',
        selfCheck: '고른 문장에서 큰 수가 배수 자리에 있나요?',
      };
    },
  };

  const 약수개수: G5Family = {
    id: 'count-divisors',
    make: (seed) => {
      const next = rand(seed + 23);
      const value = 약수좋은수(next);
      const count = divisorsOf(value).length;
      return {
        prompt: `${value}의 약수는 모두 몇 개일까요?`,
        answer: `${count}개`,
        wrongs: [`${count - 1}개`, `${count + 1}개`, `${count + 2}개`, `${Math.max(1, count - 2)}개`],
        tag: 'divisor',
        concept: '어떤 수를 나누어떨어지게 하는 수가 그 수의 약수입니다.',
        strategy: '약수의 개수 구하기',
        hint: `곱해서 ${value}${particleOf(String(value), '이')} 되는 두 수를 짝지어 찾으면 빠뜨리지 않습니다.`,
        steps: [
          `${value}의 약수: ${listText(divisorsOf(value))}`,
          `모두 ${count}개입니다.`,
        ],
        misconceptionTip: '1과 그 수 자신도 세어야 합니다.',
        selfCheck: '짝지어 센 것 가운데 겹친 수를 두 번 세지 않았나요?',
      };
    },
  };

  const 문장: G5Family = {
    id: 'story-divisor',
    make: (seed) => {
      const next = rand(seed + 29);
      const value = 약수좋은수(next);
      const all = divisorsOf(value).filter((one) => one >= 2 && one < value);
      if (all.length < 2) return null;
      const 사람 = pick(이름, seed);
      const 답 = Math.max(...all);
      return {
        prompt: `${eun(사람)} 딱지 ${value}장을 친구들에게 남김없이 똑같이 나누어 주려고 합니다. 자기를 뺀 친구 수가 될 수 있는 수 가운데 가장 큰 수는 얼마일까요? (한 명이 적어도 2장은 받습니다.)`,
        answer: `${답}명`,
        wrongs: [`${value}명`, `${답 + 1}명`, `${value / 답}명`, `${답 - 1}명`],
        tag: 'divisor',
        concept: '남김없이 똑같이 나눌 수 있는 사람 수는 그 수의 약수입니다.',
        strategy: '약수를 실생활 문제에 쓰기',
        hint: `${value}의 약수를 모두 써 보세요. 한 명이 2장 이상 받아야 하므로 너무 큰 수는 안 됩니다.`,
        steps: [
          `${value}의 약수: ${listText(divisorsOf(value))}`,
          `한 명이 2장 이상 받아야 하므로 친구 수는 ${value}보다 작아야 합니다.`,
          `그중 가장 큰 수는 ${답}이고, 이때 한 명이 ${value / 답}장씩 받습니다.`,
        ],
        misconceptionTip: '나누어 주는 사람 수와 한 명이 받는 수는 둘 다 약수입니다. 무엇을 묻는지 보세요.',
        selfCheck: '구한 사람 수로 나누었을 때 남는 딱지가 없나요?',
      };
    },
  };

  if (difficulty === '하') return [약수모두, 배수쓰기, 약수아닌것, 약수개수, 관계];
  if (difficulty === '중') return [약수모두, 배수쓰기, 관계, 약수개수, 약수아닌것, 문장];
  return [관계, 문장, 약수모두, 약수아닌것, 배수쓰기, 약수개수];
};

// ── 3차시 공약수와 최대공약수 / 5차시 공배수와 최소공배수 ───────────
// 두 차시가 하는 일이 같습니다 — 두 수에서 공통인 것을 찾고, 그중
// 가장 큰(작은) 것에 이름을 붙입니다. 그래서 한 벌로 두고 약수인지
// 배수인지로 가릅니다.
type Side = 'divisor' | 'multiple';

const 말 = {
  divisor: { 공통: '공약수', 대표: '최대공약수', 무엇: '약수', 큰작: '가장 큰' },
  multiple: { 공통: '공배수', 대표: '최소공배수', 무엇: '배수', 큰작: '가장 작은' },
} as const;

const 공통모두 = (side: Side): G5Family => ({
  id: 'commons',
  make: (seed) => {
    const next = rand(seed);
    const pair = pairFor(next, { lcmAtMost: side === 'multiple' ? 90 : 120 });
    if (!pair) return null;
    const [a, b] = pair;
    if (side === 'divisor') {
      const commons = commonDivisors(a, b);
      if (commons.length < 2) return null;
      return {
        prompt: `${gwa(String(a))} ${b}의 공약수를 모두 구한 것은 어느 것일까요?`,
        answer: listText(commons),
        wrongs: [
          listText(commons.slice(1)),
          listText(divisorsOf(a)),
          listText(divisorsOf(b)),
          listText([...commons, gcd(a, b) + 1].sort((x, y) => x - y)),
        ],
        tag: 'divisor',
        concept: '두 수의 약수 가운데 공통인 것이 공약수입니다.',
        strategy: '공약수 구하기',
        hint: '두 수의 약수를 각각 줄로 써 놓고, 두 줄에 함께 있는 수를 찾으세요.',
        steps: listSteps(a, b, 'gcd'),
        misconceptionTip: '1은 어느 두 수에서나 공약수입니다. 빠뜨리지 마세요.',
        selfCheck: '고른 수가 두 수를 모두 나누어떨어지게 하나요?',
      };
    }
    const commons = commonMultiples(a, b, 3);
    return {
      prompt: `${gwa(String(a))} ${b}의 공배수를 가장 작은 수부터 차례로 3개 쓴 것은 어느 것일까요?`,
      answer: listText(commons),
      wrongs: [
        listText(multiplesOf(a, 3)),
        listText(multiplesOf(b, 3)),
        listText([lcm(a, b), lcm(a, b) + a, lcm(a, b) + b]),
        listText([a * b, a * b * 2, a * b * 3]),
      ],
      tag: 'divisor',
      concept: '두 수의 배수 가운데 공통인 것이 공배수입니다.',
      strategy: '공배수 구하기',
      hint: '두 수의 배수를 각각 줄로 써 놓고, 두 줄에 함께 나오는 수를 작은 것부터 찾으세요.',
      steps: [
        ...listSteps(a, b, 'lcm'),
        `공배수는 최소공배수의 배수이므로 ${listText(commons)}, …입니다.`,
      ],
      misconceptionTip: '두 수를 그냥 곱한 값이 늘 최소공배수인 것은 아닙니다.',
      selfCheck: '쓴 수들이 두 수로 모두 나누어떨어지나요?',
    };
  },
});

const 대표값 = (side: Side, 방법: 'list' | 'ladder'): G5Family => ({
  id: `best-${방법}`,
  make: (seed) => {
    const next = rand(seed + 3);
    const pair = pairFor(next, { lcmAtMost: side === 'multiple' ? 100 : 120 });
    if (!pair) return null;
    const [a, b] = pair;
    const 답 = side === 'divisor' ? gcd(a, b) : lcm(a, b);
    const 이름표 = 말[side];
    const wrongs = side === 'divisor'
      ? [String(a * b), String(lcm(a, b)), String(Math.min(a, b)), String(gcd(a, b) * 2)]
      : [String(a * b), String(gcd(a, b)), String(Math.max(a, b)), String(lcm(a, b) * 2)];
    return {
      prompt: `${gwa(String(a))} ${b}의 ${이름표.대표}${particleOf(이름표.대표, '은')} 얼마일까요?`,
      answer: String(답),
      wrongs,
      tag: 'divisor',
      concept: side === 'divisor'
        ? '두 수의 공약수 가운데 가장 큰 수가 최대공약수입니다.'
        : '두 수의 공배수 가운데 가장 작은 수가 최소공배수입니다.',
      strategy: `${이름표.대표} 구하기`,
      hint: 방법 === 'list'
        ? `두 수의 ${이름표.무엇}${particleOf(이름표.무엇, '을')} 각각 늘어놓고 두 줄에 함께 있는 수를 찾으세요.`
        : '두 수를 1이 아닌 공약수로 나누어 가세요. 더 나눌 수 없을 때까지 나눕니다.',
      steps: 방법 === 'list'
        ? listSteps(a, b, side === 'divisor' ? 'gcd' : 'lcm')
        : ladderSteps(a, b, side === 'divisor' ? 'gcd' : 'lcm'),
      misconceptionTip: side === 'divisor'
        ? '최대공약수는 두 수 가운데 작은 수와 같을 수도 있지만, 늘 그런 것은 아닙니다.'
        : '두 수를 그냥 곱한 값은 공배수이지만 가장 작은 공배수가 아닐 수 있습니다.',
      selfCheck: side === 'divisor'
        ? '구한 수로 두 수가 모두 나누어떨어지나요?'
        : '구한 수를 두 수로 각각 나누면 나머지가 0인가요?',
    };
  },
});

const 공통성질 = (side: Side): G5Family => ({
  id: 'property',
  make: (seed) => {
    const next = rand(seed + 9);
    const pair = pairFor(next, { gcdAtLeast: 4, lcmAtMost: side === 'multiple' ? 100 : 150 });
    if (!pair) return null;
    const [a, b] = pair;
    const 이름표 = 말[side];
    if (side === 'divisor') {
      const g = gcd(a, b);
      const commons = divisorsOf(g);
      if (commons.length < 3) return null;
      return {
        prompt: `두 수의 최대공약수가 ${g}일 때, 두 수의 공약수를 모두 구한 것은 어느 것일까요?`,
        answer: listText(commons),
        wrongs: [
          listText(commons.slice(1)),
          listText(multiplesOf(g, commons.length)),
          listText(commons.slice(0, -1)),
          String(g),
        ],
        tag: 'divisor',
        concept: '두 수의 공약수는 두 수의 최대공약수의 약수입니다.',
        strategy: '공약수와 최대공약수의 관계 알기',
        hint: '공약수를 하나씩 찾지 않아도 됩니다. 최대공약수의 약수를 구하면 그것이 공약수입니다.',
        steps: [
          '두 수의 공약수는 최대공약수의 약수와 같습니다.',
          `${g}의 약수: ${listText(commons)}`,
          `그러므로 두 수의 공약수는 ${listText(commons)}입니다.`,
        ],
        misconceptionTip: '최대공약수의 배수가 아니라 약수입니다. 방향을 바꾸지 마세요.',
        selfCheck: '구한 수들이 모두 최대공약수를 나누어떨어지게 하나요?',
      };
    }
    const l = lcm(a, b);
    const commons = multiplesOf(l, 3);
    return {
      prompt: `두 수의 최소공배수가 ${l}일 때, 두 수의 공배수를 가장 작은 수부터 차례로 3개 쓴 것은 어느 것일까요?`,
      answer: listText(commons),
      wrongs: [
        listText(divisorsOf(l).slice(0, 3)),
        listText([l, l + 1, l + 2]),
        listText([l * 2, l * 3, l * 4]),
        listText([l, l + a, l + b]),
      ],
      tag: 'divisor',
      concept: '두 수의 공배수는 두 수의 최소공배수의 배수입니다.',
      strategy: '공배수와 최소공배수의 관계 알기',
      hint: '공배수를 하나씩 찾지 않아도 됩니다. 최소공배수를 1배, 2배, 3배 하면 그것이 공배수입니다.',
      steps: [
        '두 수의 공배수는 최소공배수의 배수와 같습니다.',
        `${l}×1=${l}, ${l}×2=${l * 2}, ${l}×3=${l * 3}`,
        `그러므로 두 수의 공배수는 ${listText(commons)}, …입니다.`,
      ],
      misconceptionTip: '최소공배수의 약수가 아니라 배수입니다. 방향을 바꾸지 마세요.',
      selfCheck: '구한 수들이 모두 최소공배수로 나누어떨어지나요?',
    };
  },
});

const 아닌것 = (side: Side): G5Family => ({
  id: 'not-common',
  make: (seed) => {
    const next = rand(seed + 15);
    const pair = pairFor(next, { gcdAtLeast: 3, lcmAtMost: side === 'multiple' ? 80 : 120 });
    if (!pair) return null;
    const [a, b] = pair;
    if (side === 'divisor') {
      const commons = commonDivisors(a, b);
      if (commons.length < 3) return null;
      const 아닌수 = divisorsOf(a).filter((one) => !commons.includes(one));
      if (!아닌수.length) return null;
      const 답 = pick(아닌수, seed);
      return {
        prompt: `다음 중 ${gwa(String(a))} ${b}의 공약수가 아닌 것은 어느 것일까요?`,
        answer: String(답),
        wrongs: commons.map(String),
        tag: 'divisor',
        concept: '두 수의 약수 가운데 공통인 것이 공약수입니다.',
        strategy: '공약수인지 가리기',
        hint: '보기의 수로 두 수를 모두 나누어 보세요. 한 쪽이라도 나머지가 생기면 공약수가 아닙니다.',
        steps: [
          `${gwa(String(a))} ${b}의 공약수: ${listText(commons)}`,
          `${답}${particleOf(String(답), '은')} ${a}의 약수이지만 ${b}${particleOf(String(b), '은')} 나누어떨어지게 하지 못합니다.`,
        ],
        misconceptionTip: '한 수의 약수이기만 해서는 공약수가 아닙니다. 두 수 모두를 나누어야 합니다.',
        selfCheck: '고른 수로 두 수를 각각 나누어 보았나요?',
      };
    }
    const l = lcm(a, b);
    const commons = multiplesOf(l, 3);
    // 공배수 셋과 크기가 비슷한 '공배수가 아닌 수'를 고릅니다. 보기
    // 가운데 하나만 눈에 띄게 작으면 세어 보지 않고도 답이 보입니다.
    const 아닌수 = multiplesOf(a, Math.ceil((l * 3) / a))
      .filter((one) => one % b !== 0 && one > l && one < l * 3);
    if (!아닌수.length) return null;
    const 답 = pick(아닌수, seed);
    return {
      prompt: `다음 중 ${gwa(String(a))} ${b}의 공배수가 아닌 것은 어느 것일까요?`,
      answer: String(답),
      wrongs: commons.map(String),
      tag: 'divisor',
      concept: '두 수의 배수 가운데 공통인 것이 공배수입니다.',
      strategy: '공배수인지 가리기',
      hint: '보기의 수를 두 수로 각각 나누어 보세요. 한 쪽이라도 나머지가 생기면 공배수가 아닙니다.',
      steps: [
        `${gwa(String(a))} ${b}의 최소공배수는 ${l}이므로 공배수는 ${listText(commons)}, …입니다.`,
        `${답}${particleOf(String(답), '은')} ${a}의 배수이지만 ${b}로는 나누어떨어지지 않습니다.`,
      ],
      misconceptionTip: '한 수의 배수이기만 해서는 공배수가 아닙니다. 두 수 모두의 배수여야 합니다.',
      selfCheck: '고른 수를 두 수로 각각 나누어 보았나요?',
    };
  },
});

const 문장공통 = (side: Side): G5Family => ({
  id: 'story-common',
  make: (seed) => {
    const next = rand(seed + 21);
    const pair = pairFor(next, { gcdAtLeast: 3, lcmAtMost: side === 'multiple' ? 90 : 150 });
    if (!pair) return null;
    const [a, b] = pair;
    if (side === 'divisor') {
      const g = gcd(a, b);
      return {
        prompt: `사탕 ${a}개와 초콜릿 ${b}개를 친구들에게 남김없이 똑같이 나누어 주려고 합니다. 최대 몇 명에게 나누어 줄 수 있을까요?`,
        answer: `${g}명`,
        wrongs: [`${Math.min(a, b)}명`, `${g * 2}명`, `${a + b}명`, `${g - 1}명`],
        tag: 'divisor',
        concept: '두 수를 모두 남김없이 나누려면 사람 수가 두 수의 공약수여야 합니다.',
        strategy: '최대공약수를 실생활 문제에 쓰기',
        hint: '사탕도 초콜릿도 남으면 안 됩니다. 두 수를 모두 나누어떨어지게 하는 수 가운데 가장 큰 수를 찾으세요.',
        steps: [
          ...listSteps(a, b, 'gcd'),
          `그러므로 최대 ${g}명에게 사탕 ${a / g}개와 초콜릿 ${b / g}개씩 나누어 줄 수 있습니다.`,
        ],
        misconceptionTip: '한쪽만 나누어떨어지게 하는 수로는 안 됩니다. 두 수 모두를 나누어야 합니다.',
        selfCheck: '구한 사람 수로 두 수를 각각 나누어 보았나요?',
      };
    }
    const l = lcm(a, b);
    return {
      prompt: `스마트 팜에서 ${a}일마다 물을 주고 ${b}일마다 양분을 줍니다. 오늘 물과 양분을 함께 주었다면, 다음번에 함께 주는 날은 며칠 후일까요?`,
      answer: `${l}일 후`,
      wrongs: [`${a * b}일 후`, `${a + b}일 후`, `${gcd(a, b)}일 후`, `${l * 2}일 후`],
      tag: 'divisor',
      concept: '두 가지 일이 함께 일어나는 때는 두 수의 공배수입니다.',
      strategy: '최소공배수를 실생활 문제에 쓰기',
      hint: '물 주는 날과 양분 주는 날을 각각 써 보세요. 두 줄에 처음으로 함께 나오는 날이 답입니다.',
      steps: [
        ...listSteps(a, b, 'lcm'),
        `그러므로 ${l}일 후에 다시 함께 주게 됩니다.`,
      ],
      misconceptionTip: '두 수를 그냥 곱한 날에도 함께 주지만, 그보다 먼저 함께 주는 날이 있을 수 있습니다.',
      selfCheck: '구한 날을 두 수로 각각 나누면 나머지가 0인가요?',
    };
  },
});

export const unit2Common = (side: Side, difficulty: '하' | '중' | '상'): G5Family[] => {
  const 뭉치 = [공통모두(side), 대표값(side, 'list'), 아닌것(side), 공통성질(side), 문장공통(side)];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [...뭉치.slice(1), 뭉치[0]];
  return [문장공통(side), 공통성질(side), 대표값(side, 'list'), 아닌것(side), 공통모두(side)];
};

// ── 4차시 최대공약수 구하기 / 6차시 최소공배수 구하기 ───────────────
// 지도서가 두 가지 방법을 나란히 둡니다 — 늘어놓기와 공약수로 나누기.
// 소인수분해는 쓰지 않습니다(지도서 유의 사항).
const 사다리빈칸 = (side: Side): G5Family => ({
  id: 'ladder-blank',
  make: (seed) => {
    const next = rand(seed + 31);
    const pair = pairFor(next, { gcdAtLeast: 4, lcmAtMost: side === 'multiple' ? 150 : 200 });
    if (!pair) return null;
    const [a, b] = pair;
    const g = gcd(a, b);
    const 이름표 = 말[side];
    const 답 = side === 'divisor' ? g : lcm(a, b);
    return {
      prompt: `${gwa(String(a))} ${b}${particleOf(String(b), '을')} 1이 아닌 공약수로 나누어 ${이름표.대표}${particleOf(이름표.대표, '을')} 구하려고 합니다. ${이름표.대표}${particleOf(이름표.대표, '은')} 얼마일까요?`,
      answer: String(답),
      wrongs: side === 'divisor'
        ? [String(lcm(a, b)), String(a * b), String(g * 2), String(Math.min(a, b))]
        : [String(g), String(a * b), String(lcm(a, b) + g), String(Math.max(a, b))],
      tag: 'divisor',
      concept: side === 'divisor'
        ? '두 수를 공약수로 나누어 간 뒤, 나눈 수를 모두 곱하면 최대공약수입니다.'
        : '두 수를 공약수로 나누어 간 뒤, 나눈 수와 남은 두 수를 모두 곱하면 최소공배수입니다.',
      strategy: `${이름표.대표}${particleOf(이름표.대표, '을')} 여러 가지 방법으로 구하기`,
      hint: '두 수를 나란히 쓰고 1이 아닌 공약수로 나누세요. 더 나눌 수 없을 때까지 나눈 다음, 무엇을 곱해야 하는지 생각합니다.',
      steps: ladderSteps(a, b, side === 'divisor' ? 'gcd' : 'lcm'),
      misconceptionTip: side === 'divisor'
        ? '마지막에 남은 두 수는 최대공약수에 곱하지 않습니다. 나눈 수만 곱합니다.'
        : '마지막에 남은 두 수도 함께 곱해야 최소공배수가 됩니다. 나눈 수만 곱하면 최대공약수가 됩니다.',
      selfCheck: side === 'divisor'
        ? '구한 수로 두 수가 모두 나누어떨어지나요?'
        : '구한 수를 두 수로 각각 나누면 나머지가 0인가요?',
    };
  },
});

const 두방법비교 = (side: Side): G5Family => ({
  id: 'two-ways',
  make: (seed) => {
    const next = rand(seed + 37);
    const pair = pairFor(next, { gcdAtLeast: 3, lcmAtMost: side === 'multiple' ? 120 : 160 });
    if (!pair) return null;
    const [a, b] = pair;
    const 이름표 = 말[side];
    const 답 = side === 'divisor' ? gcd(a, b) : lcm(a, b);
    return {
      prompt: `${gwa(String(a))} ${b}의 ${이름표.대표}${particleOf(이름표.대표, '을')} 두 가지 방법으로 구했습니다. 두 방법으로 구한 값은 얼마일까요?`,
      answer: String(답),
      wrongs: side === 'divisor'
        ? [String(lcm(a, b)), String(a * b), String(gcd(a, b) + 1), String(Math.min(a, b))]
        : [String(gcd(a, b)), String(a * b), String(lcm(a, b) - gcd(a, b)), String(Math.max(a, b))],
      tag: 'divisor',
      concept: '방법이 달라도 답은 하나입니다. 늘어놓아 찾은 값과 나누어 구한 값은 같습니다.',
      strategy: `${이름표.대표}${particleOf(이름표.대표, '을')} 여러 가지 방법으로 구하기`,
      hint: '두 방법 가운데 편한 쪽으로 구한 뒤, 다른 방법으로 한 번 더 확인해 보세요.',
      steps: [
        '[방법 1] 늘어놓아 찾기',
        ...listSteps(a, b, side === 'divisor' ? 'gcd' : 'lcm'),
        '[방법 2] 공약수로 나누어 구하기',
        ...ladderSteps(a, b, side === 'divisor' ? 'gcd' : 'lcm'),
      ],
      misconceptionTip: '두 방법의 답이 다르게 나왔다면 어느 한쪽에서 수를 빠뜨린 것입니다.',
      selfCheck: '두 방법으로 구한 값이 같은가요?',
    };
  },
});

export const unit2Find = (side: Side, difficulty: '하' | '중' | '상'): G5Family[] => {
  const 뭉치 = [
    대표값(side, 'ladder'),
    대표값(side, 'list'),
    사다리빈칸(side),
    두방법비교(side),
    문장공통(side),
  ];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [...뭉치.slice(1), 뭉치[0], 아닌것(side)];
  return [문장공통(side), 두방법비교(side), 사다리빈칸(side), 대표값(side, 'ladder'), 공통성질(side)];
};
