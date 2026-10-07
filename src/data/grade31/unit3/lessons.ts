import type { ArrayVisual, Difficulty } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { eul, eun, euro, gwa, i as iJosa, pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-1 3단원 나눗셈 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입
//   2 어떻게 똑같이 나눌까요 ⑴  — 나누어 주기(한 명이 몇 개씩). ÷, 몫,
//                                 나누어지는 수, 나누는 수를 처음 배웁니다.
//   3 어떻게 똑같이 나눌까요 ⑵  — 몇씩 묶기(몇 묶음). 뺄셈식으로도 나타냅니다.
//   4 곱셈과 나눗셈은 어떤 관계일까요
//   5 나눗셈의 몫을 곱셈으로 어떻게 구할까요 — 곱셈식, 곱셈구구
//
// 지도서가 못박은 것:
//   · 이 단원의 나눗셈은 모두 곱셈구구 안에서 나누어떨어집니다. 나머지는
//     3-2에서 배우므로 내지 않습니다.
//   · "0을 나누는 것과 0으로 나누는 것은 … 강조하여 지도하지 않습니다."
//     나누어지는 수, 나누는 수, 몫에 0이 오지 않게 합니다.
//   · 등분제·포함제라는 말은 쓰지 않고, 두 상황을 모두 경험하게 합니다.
//   · 2~3차시는 아직 곱셈과의 관계를 배우기 전이라, 풀이에서 곱셈구구를
//     앞세우지 않고 나누어 주기·묶어 세기·뺄셈으로 설명합니다. 수도 작게
//     둡니다(나누어지는 수 40 이하).
// ════════════════════════════════════════════════════════════════════

type Div = { a: number; b: number; q: number };

/** 나누어떨어지는 나눗셈 a÷b=q 입니다. b, q는 2~9입니다. */
const 나눗셈 = (seed: number, opts: { maxA?: number; maxB?: number } = {}): Div => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const b = 2 + next((opts.maxB ?? 9) - 1);
    const q = 2 + next(8);
    const a = b * q;
    if (a > (opts.maxA ?? 81)) continue;
    // 나누는 수와 몫이 같으면 '어느 것이 몫인지' 묻는 문항이 무너집니다.
    if (b === q) continue;
    return { a, b, q };
  }
  return { a: 12, b: 3, q: 4 };
};

const 식 = (d: Div) => `${d.a}÷${d.b}=${d.q}`;

const 물건들 = [
  { 이름: '사탕', 단위: '개' },
  { 이름: '색종이', 단위: '장' },
  { 이름: '연필', 단위: '자루' },
  { 이름: '구슬', 단위: '개' },
  { 이름: '딸기', 단위: '개' },
  { 이름: '공책', 단위: '권' },
];

// ── 단원 도입: 곱셈구구 떠올리기 ────────────────────────────────────
const 곱셈구구문항: G5Family = {
  id: 'review-times',
  make: (seed) => {
    const { b, q, a } = 나눗셈(seed);
    return {
      prompt: `${b}×${eun(String(q))} 얼마일까요?`,
      answer: String(a),
      wrongs: [a + b, a - b, a + q, b + q].filter((v) => v > 0 && v !== a).map(String),
      tag: 'multiplication',
      concept: '곱셈구구는 같은 수를 여러 번 더한 것을 빠르게 구하는 방법입니다.',
      strategy: '곱셈구구 떠올리기',
      hint: `${b}단 곱셈구구를 처음부터 외워 보세요. ${b}씩 ${q}번 뛰어 세어도 됩니다.`,
      steps: [`${eul(String(b))} ${q}번 더하면 ${a}입니다.`, `그러므로 ${b}×${q}=${a}입니다.`],
      misconceptionTip: '곱하는 두 수를 더하면 안 됩니다.',
    };
  },
};

const 빈칸곱셈문항: G5Family = {
  id: 'review-blank',
  make: (seed) => {
    const { b, q, a } = 나눗셈(seed + 5);
    return {
      prompt: `${b}×□=${a}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(q),
      wrongs: [q + 1, q - 1, a - b, b].filter((v) => v > 0 && v !== q).map(String),
      tag: 'multiplication',
      concept: '곱셈구구에서 곱이 나오는 곳을 찾으면 곱하는 수를 알 수 있습니다.',
      strategy: '곱셈구구에서 모르는 수 찾기',
      hint: `${b}단 곱셈구구를 차례로 외우며 ${iJosa(String(a))} 나오는 곳을 찾으세요.`,
      steps: [`${b}단 곱셈구구에서 ${b}×${q}=${a}입니다.`, `그러므로 □ 안에 알맞은 수는 ${q}입니다.`],
      misconceptionTip: `${a}에서 ${eul(String(b))} 빼면 안 됩니다. ${eul(String(b))} 몇 번 더해야 ${iJosa(String(a))} 되는지 찾는 것입니다.`,
    };
  },
};

const 똑같이나누기도입문항: G5Family = {
  id: 'review-share',
  make: (seed) => {
    const d = 나눗셈(seed + 9, { maxA: 20, maxB: 4 });
    const thing = pick(물건들, seed);
    return {
      prompt: `${thing.이름} ${eul(`${d.a}${thing.단위}`)} ${d.b}명이 똑같이 나누어 가지려고 합니다. 한 명이 몇 ${thing.단위}씩 가질 수 있을까요?`,
      answer: `${d.q}${thing.단위}`,
      wrongs: [d.q + 1, d.q - 1, d.a - d.b, d.b].filter((v) => v > 0 && v !== d.q).map((v) => `${v}${thing.단위}`),
      tag: 'division',
      concept: '똑같이 나누어 가지려면 한 명씩 차례로 하나씩 나누어 주면 됩니다.',
      strategy: '똑같이 나누어 보기',
      hint: `${d.b}명에게 하나씩 차례로 나누어 주는 것을 그려 보세요. 다 나누어 주었을 때 한 명이 가진 수를 세면 됩니다.`,
      steps: [`${eul(`${d.a}${thing.단위}`)} ${d.b}명에게 하나씩 차례로 나누어 줍니다.`, `한 명이 ${d.q}${thing.단위}씩 가지면 ${d.b}명이 모두 ${eul(`${d.a}${thing.단위}`)} 가집니다.`, `그러므로 한 명이 ${d.q}${thing.단위}씩 가질 수 있습니다.`],
      misconceptionTip: '전체에서 사람 수를 빼면 안 됩니다. 똑같이 나누는 것입니다.',
    };
  },
};

// ── 2차시: 똑같이 나누어 주기, 나눗셈식 ────────────────────────────
const 나누어주기문항 = (작게: boolean): G5Family => ({
  id: `share-${작게 ? 's' : 'l'}`,
  make: (seed) => {
    const d = 나눗셈(seed, 작게 ? { maxA: 40, maxB: 6 } : {});
    const thing = pick(물건들, seed + 1);
    return {
      prompt: `${thing.이름} ${eul(`${d.a}${thing.단위}`)} ${d.b}명에게 똑같이 나누어 주려고 합니다. 한 명에게 몇 ${thing.단위}씩 줄 수 있을까요?`,
      answer: `${d.q}${thing.단위}`,
      wrongs: [d.q + 1, d.q - 1, d.a - d.b, d.b].filter((v) => v > 0 && v !== d.q).map((v) => `${v}${thing.단위}`),
      tag: 'division',
      concept: '똑같이 나누어 줄 때 한 명이 받는 수는 나눗셈의 몫입니다.',
      strategy: '똑같이 나누어 주는 상황 해결하기',
      hint: `${d.b}명에게 하나씩 차례로 나누어 주는 것을 생각해 보세요. 한 바퀴 돌 때마다 ${d.b}${thing.단위}씩 줄어듭니다.`,
      steps: [
        `식으로 나타내면 ${d.a}÷${d.b}입니다.`,
        `${d.b}명에게 하나씩 나누어 주면 ${d.q}바퀴를 돌 때 모두 나누어 줄 수 있습니다.`,
        `${식(d)}이므로 한 명에게 ${d.q}${thing.단위}씩 줄 수 있습니다.`,
      ],
      misconceptionTip: '나눗셈식의 앞에는 전체의 수, 뒤에는 나누어 줄 사람 수를 씁니다. 두 수의 자리를 바꾸면 안 됩니다.',
      selfCheck: `한 명이 받은 수에 사람 수를 곱하면 처음의 ${iJosa(`${d.a}${thing.단위}`)} 되나요?`,
    };
  },
});

const 나눗셈식고르기문항: G5Family = {
  id: 'share-expr',
  make: (seed) => {
    const d = 나눗셈(seed + 3, { maxA: 40, maxB: 6 });
    const thing = pick(물건들, seed);
    return {
      prompt: `${thing.이름} ${eul(`${d.a}${thing.단위}`)} ${d.b}명에게 똑같이 나누어 주면 한 명에게 ${d.q}${thing.단위}씩 줄 수 있습니다. 이것을 나눗셈식으로 바르게 나타낸 것은 어느 것일까요?`,
      answer: 식(d),
      // 나누는 수와 몫을 바꾼 식(a÷q=b)은 셈은 맞지만 이 상황을 나타내지
      // 않습니다. 아이가 '셈이 맞으니 맞다'고 여길 수 있어 보기에서 뺍니다.
      wrongs: [`${d.a}-${d.b}=${d.a - d.b}`, `${d.b}÷${d.a}=${d.q}`, `${d.a}÷${d.b}=${d.q + 1}`, `${d.a}+${d.b}=${d.a + d.b}`],
      tag: 'division',
      concept: '나눗셈식에서 전체의 수가 나누어지는 수, 나누어 주는 사람 수가 나누는 수, 한 명이 받는 수가 몫입니다.',
      strategy: '상황을 나눗셈식으로 나타내기',
      hint: '나눗셈식은 (전체의 수)÷(나누어 주는 사람 수)=(한 명이 받는 수)의 차례로 씁니다.',
      steps: [`전체 ${eul(`${d.a}${thing.단위}`)} ${d.b}명에게 나누어 한 명이 ${d.q}${thing.단위}씩 받습니다.`, `그러므로 나눗셈식은 ${식(d)}입니다.`],
      misconceptionTip: '작은 수를 앞에 쓰면 안 됩니다. 나누어지는 수(전체)가 앞에 옵니다.',
      minusIsOperator: true,
    };
  },
};

const 읽기문항: G5Family = {
  id: 'read-div',
  make: (seed) => {
    const d = 나눗셈(seed + 11, { maxA: 40, maxB: 6 });
    return {
      prompt: `${eul(식(d))} 바르게 읽은 것은 어느 것일까요?`,
      answer: `${d.a} 나누기 ${eun(String(d.b))} ${gwa(String(d.q))} 같습니다.`,
      wrongs: [
        `${d.b} 나누기 ${eun(String(d.a))} ${gwa(String(d.q))} 같습니다.`,
        `${d.a} 곱하기 ${eun(String(d.b))} ${gwa(String(d.q))} 같습니다.`,
        `${d.a} 빼기 ${eun(String(d.b))} ${gwa(String(d.q))} 같습니다.`,
      ],
      tag: 'division',
      concept: '÷는 "나누기"라고 읽고, =는 "같습니다"라고 읽습니다.',
      strategy: '나눗셈식 읽기',
      hint: '기호 ÷를 무엇이라고 읽는지 떠올려 보세요. 수는 식에 쓰인 차례대로 읽습니다.',
      steps: [`${eun(식(d))} 왼쪽부터 차례로 읽습니다.`, `${d.a} 나누기 ${eun(String(d.b))} ${gwa(String(d.q))} 같습니다.`],
      misconceptionTip: '두 수의 차례를 바꾸어 읽으면 다른 식이 됩니다.',
    };
  },
};

const 용어문항: G5Family = {
  id: 'terms',
  make: (seed) => {
    const d = 나눗셈(seed + 17, { maxA: 40, maxB: 6 });
    const 무엇 = pick(['몫', '나누는 수', '나누어지는 수'] as const, seed);
    const answer = 무엇 === '몫' ? d.q : 무엇 === '나누는 수' ? d.b : d.a;
    return {
      prompt: `나눗셈식 ${식(d)}에서 ${eun(무엇)} 얼마일까요?`,
      answer: String(answer),
      wrongs: [d.a, d.b, d.q, d.a - d.b].filter((v) => v !== answer && v > 0).map(String),
      tag: 'division',
      concept: `${d.a}÷${d.b}=${d.q}에서 ${eun(String(d.a))} 나누어지는 수, ${eun(String(d.b))} 나누는 수, ${eun(String(d.q))} ${eul(String(d.a))} ${euro(String(d.b))} 나눈 몫입니다.`,
      strategy: '나누어지는 수, 나누는 수, 몫 알기',
      hint: '나눗셈식에서 맨 앞의 수, ÷ 뒤의 수, = 뒤의 수가 각각 무엇인지 떠올려 보세요.',
      steps: [`${식(d)}에서 맨 앞의 ${eun(String(d.a))} 나누어지는 수, ÷ 뒤의 ${eun(String(d.b))} 나누는 수, = 뒤의 ${eun(String(d.q))} 몫입니다.`, `그러므로 ${eun(무엇)} ${answer}입니다.`],
      misconceptionTip: '몫은 = 뒤에 있는 계산 결과입니다. 나누는 수와 헷갈리지 마세요.',
    };
  },
};

// ── 3차시: 몇씩 묶기, 뺄셈식 ────────────────────────────────────────
const 묶기문항 = (작게: boolean): G5Family => ({
  id: `group-${작게 ? 's' : 'l'}`,
  make: (seed) => {
    const d = 나눗셈(seed + 23, 작게 ? { maxA: 40, maxB: 6 } : {});
    const 장면 = pick([
      { prompt: `떡 ${d.a}개를 한 접시에 ${d.b}개씩 담으려고 합니다. 접시는 몇 개 필요할까요?`, unit: '개', 답: (v: number) => `접시는 ${v}개 필요합니다.` },
      { prompt: `연필 ${d.a}자루를 한 명에게 ${d.b}자루씩 나누어 주려고 합니다. 몇 명에게 나누어 줄 수 있을까요?`, unit: '명', 답: (v: number) => `${v}명에게 나누어 줄 수 있습니다.` },
      { prompt: `구슬 ${d.a}개를 한 상자에 ${d.b}개씩 넣으려고 합니다. 상자는 몇 개 필요할까요?`, unit: '개', 답: (v: number) => `상자는 ${v}개 필요합니다.` },
      { prompt: `학생 ${d.a}명이 한 모둠에 ${d.b}명씩 모이면 몇 모둠이 될까요?`, unit: '모둠', 답: (v: number) => `${v}모둠이 됩니다.` },
    ], seed);
    return {
      prompt: 장면.prompt,
      answer: `${d.q}${장면.unit}`,
      wrongs: [d.q + 1, d.q - 1, d.a - d.b, d.b].filter((v) => v > 0 && v !== d.q).map((v) => `${v}${장면.unit}`),
      tag: 'division',
      concept: '몇씩 묶어 덜어 낼 때 덜어 낸 횟수, 곧 묶음의 수가 나눗셈의 몫입니다.',
      strategy: '몇씩 묶는 상황 해결하기',
      hint: `${d.a}에서 ${d.b}씩 몇 번 덜어 낼 수 있는지 세어 보세요.`,
      steps: [
        `${d.a}에서 ${d.b}씩 덜어 내면 ${Array.from({ length: d.q }, (_, i) => d.a - d.b * (i + 1)).join(', ')}이 되어 ${d.q}번 만에 0이 됩니다.`,
        `나눗셈식으로 나타내면 ${식(d)}입니다.`,
        `그러므로 ${장면.답(d.q)}`,
      ],
      misconceptionTip: '한 묶음의 수를 답으로 쓰면 안 됩니다. 몇 묶음인지를 묻고 있습니다.',
      selfCheck: '묶음의 수에 한 묶음의 수를 곱하면 전체의 수가 되나요?',
    };
  },
});

const 뺄셈식문항: G5Family = {
  id: 'subtract-expr',
  make: (seed) => {
    const d = 나눗셈(seed + 29, { maxA: 40, maxB: 6 });
    if (d.q > 6) return null;
    const 뺄셈 = `${d.a}${`-${d.b}`.repeat(d.q)}=0`;
    return {
      prompt: `뺄셈식 ${eul(뺄셈)} 나눗셈식으로 나타낸 것은 어느 것일까요?`,
      answer: 식(d),
      wrongs: [`${d.a}÷${d.b}=${d.q + 1}`, `${d.a}-${d.b}=${d.a - d.b}`, `${d.b}÷${d.a}=${d.q}`, `${d.a}÷${d.b}=${d.q - 1}`],
      tag: 'division',
      concept: '같은 수를 여러 번 빼서 0이 되는 것은 나눗셈으로 나타낼 수 있습니다. 뺀 횟수가 몫입니다.',
      strategy: '뺄셈식을 나눗셈식으로 나타내기',
      hint: `${eul(String(d.b))} 몇 번 뺐는지 세어 보세요. 그 횟수가 몫입니다.`,
      steps: [`${d.a}에서 ${eul(String(d.b))} ${d.q}번 빼면 0이 됩니다.`, `그러므로 나눗셈식은 ${식(d)}입니다.`],
      misconceptionTip: '뺄셈식에 나온 수를 그대로 이어 쓰면 안 됩니다. 몇 번 뺐는지를 세어야 합니다.',
      minusIsOperator: true,
    };
  },
};

const 묶음그림문항: G5Family = {
  id: 'group-picture',
  make: (seed) => {
    const d = 나눗셈(seed + 31, { maxA: 30, maxB: 6 });
    if (d.q > 6) return null;
    const visual: ArrayVisual = { kind: 'array', label: `구슬 ${d.a}개를 ${d.b}개씩 묶은 그림`, rows: d.q, columns: d.b, hideCaption: true };
    return {
      prompt: `구슬 ${d.a}개를 ${d.b}개씩 묶었습니다. 몇 묶음이 될까요?`,
      answer: `${d.q}묶음`,
      wrongs: [d.q + 1, d.q - 1, d.b, d.a - d.b].filter((v) => v > 0 && v !== d.q).map((v) => `${v}묶음`),
      tag: 'division',
      concept: `${d.a}개를 ${d.b}개씩 묶으면 몇 묶음인지는 나눗셈 ${d.a}÷${d.b}로 구합니다.`,
      strategy: '묶어 세어 나눗셈의 몫 구하기',
      hint: '그림에서 한 줄이 한 묶음입니다. 묶음이 몇 줄인지 세어 보세요.',
      steps: [`${d.b}개씩 묶은 줄이 ${d.q}줄입니다.`, `${식(d)}이므로 ${d.q}묶음입니다.`],
      misconceptionTip: '한 묶음 안의 개수와 묶음의 수를 헷갈리지 마세요.',
      visual,
    };
  },
};

// ── 4차시: 곱셈과 나눗셈의 관계 ─────────────────────────────────────
const 곱셈에서나눗셈문항: G5Family = {
  id: 'mul-to-div',
  make: (seed) => {
    const d = 나눗셈(seed + 37);
    const 곱셈 = `${d.b}×${d.q}=${d.a}`;
    return {
      prompt: `곱셈식 ${eul(곱셈)} 나눗셈식 2개로 바르게 나타낸 것은 어느 것일까요?`,
      answer: `${d.a}÷${d.b}=${d.q}, ${d.a}÷${d.q}=${d.b}`,
      wrongs: [
        `${d.b}÷${d.q}=${d.a}, ${d.q}÷${d.b}=${d.a}`,
        `${d.a}÷${d.b}=${d.q}, ${d.b}÷${d.a}=${d.q}`,
        `${d.a}÷${d.b}=${d.q}, ${d.a}÷${d.a}=${d.b}`,
      ],
      tag: 'division',
      concept: '곱셈식 ▲×●=■는 나눗셈식 ■÷▲=●와 ■÷●=▲로 나타낼 수 있습니다.',
      strategy: '곱셈식을 나눗셈식으로 나타내기',
      hint: `곱 ${iJosa(String(d.a))} 두 나눗셈식에서 모두 맨 앞에 옵니다. 곱하는 두 수가 차례로 나누는 수와 몫이 됩니다.`,
      steps: [
        `${곱셈}에서 곱 ${eun(String(d.a))} 나누어지는 수가 됩니다.`,
        `${eul(String(d.a))} ${euro(String(d.b))} 나누면 ${d.q}, ${euro(String(d.q))} 나누면 ${d.b}입니다.`,
        `그러므로 ${d.a}÷${d.b}=${d.q}, ${d.a}÷${d.q}=${d.b}입니다.`,
      ],
      misconceptionTip: '곱하는 두 수를 나누면 안 됩니다. 곱이 나누어지는 수가 됩니다.',
    };
  },
};

const 나눗셈에서곱셈문항: G5Family = {
  id: 'div-to-mul',
  make: (seed) => {
    const d = 나눗셈(seed + 41);
    const answer = `${d.b}×${d.q}=${d.a}`;
    return {
      prompt: `나눗셈식 ${eul(식(d))} 곱셈식으로 바르게 나타낸 것은 어느 것일까요?`,
      answer,
      // q×b=a도 맞는 곱셈식이므로 오답에 넣지 않습니다.
      // 18×9=162처럼 곱셈구구를 넘는 식은 아직 셈할 수 없으므로 쓰지 않습니다.
      wrongs: [`${d.b}×${d.q}=${d.a + 1}`, `${d.b}+${d.q}=${d.b + d.q}`, `${d.q}×${d.q}=${d.q * d.q}`, `${d.b}×${d.b}=${d.b * d.b}`].filter((one) => one !== answer),
      tag: 'division',
      concept: '나눗셈식 ■÷▲=●는 곱셈식 ▲×●=■로 나타낼 수 있습니다.',
      strategy: '나눗셈식을 곱셈식으로 나타내기',
      hint: '나누는 수와 몫을 곱하면 무엇이 되어야 할까요?',
      steps: [`나누는 수 ${gwa(String(d.b))} 몫 ${eul(String(d.q))} 곱하면 나누어지는 수 ${d.a}입니다.`, `그러므로 곱셈식은 ${answer}입니다.`],
      misconceptionTip: '나누어지는 수에 나누는 수를 곱하면 안 됩니다.',
    };
  },
};

const 같은상황문항: G5Family = {
  id: 'same-situation',
  make: (seed) => {
    const d = 나눗셈(seed + 43, { maxA: 54 });
    const thing = pick(물건들, seed + 2);
    return {
      prompt: `${iJosa(thing.이름)} 한 묶음에 ${d.b}${thing.단위}씩 ${d.q}묶음 있습니다. 모두 몇 ${thing.단위}인지 곱셈식으로 나타내면 ${d.b}×${d.q}=${d.a}입니다. 이 ${eul(thing.이름)} ${d.b}${thing.단위}씩 묶으면 몇 묶음인지 나타내는 나눗셈식은 어느 것일까요?`,
      answer: 식(d),
      // a÷q=b도 셈은 맞는 식이라 오답 보기로 두지 않습니다. 셈이 맞는 식을
      // '틀렸다'고 하면 아이가 무엇이 틀렸는지 알 수 없습니다.
      wrongs: [`${d.b}÷${d.q}=${d.a}`, `${d.a}÷${d.b}=${d.q + 1}`, `${d.a}-${d.b}=${d.a - d.b}`, `${d.q}÷${d.b}=${d.a}`],
      minusIsOperator: true,
      tag: 'division',
      concept: '한 가지 상황을 곱셈식과 나눗셈식으로 나타낼 수 있습니다.',
      strategy: '한 상황을 곱셈식과 나눗셈식으로 나타내기',
      hint: `전체 ${eul(`${d.a}${thing.단위}`)} ${d.b}${thing.단위}씩 묶는 것입니다. 무엇을 무엇으로 나누어야 할까요?`,
      steps: [`전체 ${eul(`${d.a}${thing.단위}`)} ${d.b}${thing.단위}씩 묶으면 ${d.q}묶음입니다.`, `그러므로 나눗셈식은 ${식(d)}입니다.`],
      misconceptionTip: '나눗셈식의 맨 앞에는 전체의 수를 씁니다. 묶음의 수를 구할 때는 한 묶음의 수로 나눕니다.',
      selfCheck: '나눗셈식의 몫이 묻는 것(묶음의 수)과 같은가요?',
    };
  },
};

// ── 5차시: 몫을 곱셈으로 구하기 ─────────────────────────────────────
const 몫구하기문항: G5Family = {
  id: 'quotient',
  make: (seed) => {
    const d = 나눗셈(seed + 47);
    return {
      prompt: `${d.a}÷${eul(String(d.b))} 계산하면 몫은 얼마일까요?`,
      answer: String(d.q),
      wrongs: [d.q + 1, d.q - 1, d.a - d.b, d.b].filter((v) => v > 0 && v !== d.q).map(String),
      tag: 'division',
      concept: '나눗셈의 몫은 나누는 수의 단 곱셈구구에서 찾을 수 있습니다.',
      strategy: '곱셈구구로 나눗셈의 몫 구하기',
      hint: `${d.b}단 곱셈구구에서 곱이 ${iJosa(String(d.a))} 되는 곳을 찾으세요.`,
      steps: [`${d.b}×□=${d.a}에서 ${d.b}단 곱셈구구를 외우면 ${d.b}×${d.q}=${d.a}입니다.`, `그러므로 ${d.a}÷${d.b}의 몫은 ${d.q}입니다.`],
      misconceptionTip: '나누어지는 수에서 나누는 수를 빼면 안 됩니다. 몇 번 들어가는지 찾는 것입니다.',
      selfCheck: '몫과 나누는 수를 곱하면 나누어지는 수가 되나요?',
    };
  },
};

const 몇단문항: G5Family = {
  id: 'which-dan',
  make: (seed) => {
    const d = 나눗셈(seed + 53);
    const 다른단 = [d.b - 1, d.b + 1, d.q, d.a % 10 || 3].filter((v) => v >= 2 && v <= 9 && v !== d.b);
    return {
      prompt: `${d.a}÷${d.b}의 몫을 구할 때 이용하면 좋은 곱셈구구는 몇 단일까요?`,
      answer: `${d.b}단`,
      wrongs: [...new Set(다른단)].map((v) => `${v}단`).concat(['1단']).slice(0, 4),
      tag: 'division',
      concept: '나눗셈 ■÷▲의 몫은 ▲단 곱셈구구에서 곱이 ■인 곳을 찾으면 구할 수 있습니다.',
      strategy: '몫을 구할 때 쓸 곱셈구구 고르기',
      hint: '나누는 수가 얼마인지 보세요. 그 수에 무엇을 곱해야 나누어지는 수가 될까요?',
      steps: [`나누는 수가 ${d.b}이므로 ${d.b}×□=${d.a}인 □를 찾습니다.`, `${d.b}단 곱셈구구를 이용합니다.`],
      misconceptionTip: '몫의 단이 아니라 나누는 수의 단을 씁니다.',
    };
  },
};

const 몫비교문항: G5Family = {
  id: 'compare-quotient',
  make: (seed) => {
    const divs: Div[] = [];
    for (let at = 0; at < 20 && divs.length < 4; at += 1) {
      const one = 나눗셈(seed * 7 + at * 13);
      if (divs.some((other) => other.q === one.q || other.a === one.a)) continue;
      divs.push(one);
    }
    if (divs.length < 4) return null;
    const best = divs.reduce((top, one) => (one.q > top.q ? one : top));
    return {
      prompt: '몫이 가장 큰 나눗셈은 어느 것일까요?',
      answer: `${best.a}÷${best.b}`,
      wrongs: divs.filter((one) => one !== best).map((one) => `${one.a}÷${one.b}`),
      tag: 'division',
      concept: '나눗셈의 몫은 곱셈구구로 구할 수 있습니다.',
      strategy: '나눗셈의 몫 견주기',
      hint: '나누어지는 수가 크다고 몫이 큰 것은 아닙니다. 하나씩 몫을 구해 보세요.',
      steps: [...divs.map((one) => `${one.a}÷${one.b}=${one.q}`), `몫이 가장 큰 것은 ${best.a}÷${best.b}입니다.`],
      misconceptionTip: '나누어지는 수만 보고 고르면 안 됩니다. 나누는 수도 함께 보아야 합니다.',
    };
  },
};

const 어떤수나눗셈문항: G5Family = {
  id: 'unknown-dividend',
  make: (seed) => {
    const d = 나눗셈(seed + 59);
    const 무엇 = pick(['나누어지는 수', '나누는 수'] as const, seed);
    if (무엇 === '나누어지는 수') {
      return {
        prompt: `□÷${d.b}=${d.q}에서 □ 안에 알맞은 수는 얼마일까요?`,
        answer: String(d.a),
        wrongs: [d.a + d.b, d.a - d.b, d.b + d.q, d.q].filter((v) => v > 0 && v !== d.a).map(String),
        tag: 'division',
        concept: '□÷▲=●이면 ▲×●=□입니다.',
        strategy: '곱셈과 나눗셈의 관계로 나누어지는 수 구하기',
        hint: '나눗셈식을 곱셈식으로 바꾸어 보세요. 나누는 수와 몫을 곱하면 무엇이 되나요?',
        steps: [`${eul(`□÷${d.b}=${d.q}`)} 곱셈식으로 바꾸면 ${d.b}×${d.q}=□입니다.`, `${d.b}×${d.q}=${d.a}이므로 □ 안에 알맞은 수는 ${d.a}입니다.`],
        misconceptionTip: '나누는 수와 몫을 더하면 안 됩니다. 곱해야 합니다.',
      };
    }
    return {
      prompt: `${d.a}÷□=${d.q}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(d.b),
      wrongs: [d.b + 1, d.b - 1, d.a - d.q, d.q].filter((v) => v > 0 && v !== d.b).map(String),
      tag: 'division',
      concept: '■÷□=●이면 ●×□=■입니다.',
      strategy: '곱셈과 나눗셈의 관계로 나누는 수 구하기',
      hint: `${d.q}에 얼마를 곱해야 ${iJosa(String(d.a))} 되는지 곱셈구구에서 찾아보세요.`,
      steps: [`${eul(`${d.a}÷□=${d.q}`)} 곱셈식으로 바꾸면 ${d.q}×□=${d.a}입니다.`, `${d.q}×${d.b}=${d.a}이므로 □ 안에 알맞은 수는 ${d.b}입니다.`],
      misconceptionTip: '나누어지는 수에서 몫을 빼면 안 됩니다.',
    };
  },
};

const 두번나누기문항: G5Family = {
  id: 'two-step',
  make: (seed) => {
    const next = rand(seed + 61);
    // 사과 a개를 b개씩 봉지에 담아 → 봉지 m개, 봉지를 n명에게 똑같이 → 한 명에 k봉지
    const b = 2 + next(4);
    const n = 2 + next(3);
    const k = 2 + next(3);
    const m = n * k;
    const a = b * m;
    if (a > 81 || m > 9) return null;
    return {
      prompt: `사과 ${a}개를 한 봉지에 ${b}개씩 담았습니다. 이 봉지들을 ${n}명에게 똑같이 나누어 주면 한 명에게 몇 봉지씩 줄 수 있을까요?`,
      answer: `${k}봉지`,
      wrongs: [m, k + 1, a / n, b].filter((v) => Number.isInteger(v) && v !== k).map((v) => `${v}봉지`),
      tag: 'division',
      concept: '두 번 나누는 문제는 먼저 무엇을 구해야 하는지 차례를 정합니다.',
      strategy: '나눗셈을 두 번 하여 문제 해결하기',
      hint: '먼저 봉지가 모두 몇 개인지 구하세요. 그다음 그 봉지들을 사람 수로 나누세요.',
      steps: [`봉지의 수: ${a}÷${b}=${m}`, `한 명이 받는 봉지의 수: ${m}÷${n}=${k}`, `그러므로 한 명에게 ${k}봉지씩 줄 수 있습니다.`],
      misconceptionTip: '사과의 수를 바로 사람 수로 나누면 사과가 몇 개인지를 구하게 됩니다. 묻는 것은 봉지의 수입니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
export const unit3Lesson = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return 하 ? [곱셈구구문항, 똑같이나누기도입문항] : [곱셈구구문항, 빈칸곱셈문항, 똑같이나누기도입문항];
  if (lessonNo === 2) {
    if (하) return [나누어주기문항(true), 읽기문항, 용어문항];
    if (상) return [나누어주기문항(true), 나눗셈식고르기문항, 용어문항, 읽기문항];
    return [나누어주기문항(true), 나눗셈식고르기문항, 용어문항];
  }
  if (lessonNo === 3) {
    if (하) return [묶음그림문항, 묶기문항(true), 뺄셈식문항];
    if (상) return [묶기문항(true), 뺄셈식문항, 나누어주기문항(true), 용어문항];
    return [묶기문항(true), 뺄셈식문항, 묶음그림문항];
  }
  if (lessonNo === 4) {
    if (하) return [곱셈에서나눗셈문항, 나눗셈에서곱셈문항];
    if (상) return [같은상황문항, 어떤수나눗셈문항, 곱셈에서나눗셈문항];
    return [곱셈에서나눗셈문항, 나눗셈에서곱셈문항, 같은상황문항];
  }
  if (lessonNo === 5) {
    if (하) return [몫구하기문항, 몇단문항, 나눗셈에서곱셈문항];
    if (상) return [몫비교문항, 어떤수나눗셈문항, 두번나누기문항, 묶기문항(false)];
    return [몫구하기문항, 나누어주기문항(false), 묶기문항(false), 몫비교문항];
  }
  return null;
};
