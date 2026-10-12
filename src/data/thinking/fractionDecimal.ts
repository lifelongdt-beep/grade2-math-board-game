import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { mixedText } from '../grade5/fraction';

// 4-2 1단원·3단원과 같은 꼴로 씁니다(그 파일들이 이 파일을 불러 쓰므로
// 서로 불러오지 않게 여기에 따로 둡니다).
/** 분모 d인 분자 n을 약분하지 않고 씁니다. 가분수는 대분수로. */
const 분수글 = (n: number, d: number): string => {
  if (n % d === 0) return String(n / d);
  if (n < d) return `${n}/${d}`;
  return mixedText(Math.floor(n / d), n % d, d);
};
/** 천분 정수를 소수로 씁니다. 끝자리 0은 지웁니다. */
const 소수 = (m: number): string => {
  const 정수 = Math.floor(m / 1000);
  const 아래 = String(m % 1000).padStart(3, '0').replace(/0+$/, '');
  return `${정수}${아래 ? `.${아래}` : ''}`;
};

// ════════════════════════════════════════════════════════════════════
// 분모가 같은 분수, 소수 한·두 자리 수의 덧셈·뺄셈에 쓰는 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
// 4학년 2학기 1단원(분모가 같은 분수)과 3단원(소수)은 약분을 하지 않고,
// 소수는 끝자리 0을 지워 씁니다. 그 규칙을 그대로 따릅니다.
//   분수는 (분자, 공통 분모) 두 정수로, 소수는 천분(1000배 한 정수)으로
//   들고 다녀 계산 오차가 없게 합니다.
// ════════════════════════════════════════════════════════════════════

const 다른 = (ans: string, xs: string[]) => [...new Set(xs)].filter((x) => x !== ans && !x.startsWith('-') && x !== '0');

// ── 분수 ─────────────────────────────────────────────────────────────
/** 어떤 수에 a/d를 더했더니(뺐더니) X — 어떤 수 구하기 */
export const 분수어떤수 = (id: string, 최대: number): G5Family => ({
  id: `${id}-frac-unknown`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 12);
    const x = 사이(next, 1, 최대 * d - 1); // 어떤 수(분자)
    const a = 사이(next, 1, 최대 * d - 1);
    const 더함 = next(2) === 0;
    const 결과 = 더함 ? x + a : x - a;
    if (결과 <= 0 || x % d === 0 || a % d === 0) return null;
    return {
      prompt: `어떤 수에${더함 ? '' : '서'} ${분수글(a, d)}을(를) ${더함 ? '더했' : '뺐'}더니 ${분수글(결과, d)}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
      answer: 분수글(x, d),
      wrongs: 다른(분수글(x, d), [분수글(더함 ? 결과 + a : 결과 - a, d), 분수글(x + 1, d), 분수글(x + d, d), 분수글(Math.max(1, x - 1), d)]),
      tag: 'fractionAdd',
      strategy: '덧셈과 뺄셈의 관계로 어떤 수 구하기',
      hint: 더함 ? '□+(더한 수)=(결과)이면 □=(결과)-(더한 수)예요.' : '□-(뺀 수)=(결과)이면 □=(결과)+(뺀 수)예요.',
      steps: [`□${더함 ? '+' : '-'}${분수글(a, d)}=${분수글(결과, d)}`, `□=${분수글(결과, d)}${더함 ? '-' : '+'}${분수글(a, d)}=${분수글(x, d)}`],
      misconceptionTip: '더한 것을 거꾸로 하려면 빼고, 뺀 것을 거꾸로 하려면 더해요.',
      minusIsOperator: true,
    };
  },
});

/** 더해야 할 것을 잘못하여 뺐다 — 바르게 계산한 값 */
export const 분수잘못계산 = (id: string, 최대: number): G5Family => ({
  id: `${id}-frac-mistake`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 12);
    const x = 사이(next, d + 1, 최대 * d - 1);
    const a = 사이(next, 1, x - 1);
    const 잘못 = x - a;
    const v = x + a;
    if (x % d === 0 || a % d === 0) return null;
    return {
      prompt: `어떤 수에 ${분수글(a, d)}을(를) 더해야 할 것을 잘못하여 뺐더니 ${분수글(잘못, d)}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
      answer: 분수글(v, d),
      wrongs: 다른(분수글(v, d), [분수글(x, d), 분수글(잘못 + a, d) === 분수글(x, d) ? 분수글(v + a, d) : 분수글(잘못 + a, d), 분수글(v + 1, d), 분수글(잘못 + 2 * a + 1, d)]),
      tag: 'fractionAdd',
      strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
      hint: '먼저 잘못 계산한 식으로 어떤 수를 찾아요.',
      steps: [`□-${분수글(a, d)}=${분수글(잘못, d)}이므로 □=${분수글(잘못, d)}+${분수글(a, d)}=${분수글(x, d)}입니다.`, `바르게 계산하면 ${분수글(x, d)}+${분수글(a, d)}=${분수글(v, d)}입니다.`],
      misconceptionTip: '어떤 수를 구한 것으로 끝내면 안 돼요. 마지막에 바르게 한 번 더 계산해요.',
      minusIsOperator: true,
    };
  },
});

/** 수 카드로 분모가 d인 대분수를 만들 때 가장 큰 수와 가장 작은 수의 합(차) */
export const 분수카드 = (id: string): G5Family => ({
  id: `${id}-frac-cards`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 5, 9);
    const 카드: number[] = [];
    while (카드.length < 3) {
      const c = 사이(next, 1, 9);
      if (!카드.includes(c)) 카드.push(c);
    }
    // 두 장을 골라 자연수 부분과 분자에 놓습니다. 분자는 분모보다 작아야 합니다.
    const 만든것: number[] = [];
    for (const w of 카드) for (const n of 카드) if (w !== n && n < d) 만든것.push(w * d + n);
    if (만든것.length < 2) return null;
    const 큰 = Math.max(...만든것);
    const 작은 = Math.min(...만든것);
    const 합 = next(2) === 0;
    const v = 합 ? 큰 + 작은 : 큰 - 작은;
    if (v <= 0) return null;
    return {
      prompt: `수 카드 ${카드.join(', ')} 가운데 2장을 골라 분모가 ${d}인 대분수를 만들려고 합니다. 만들 수 있는 가장 큰 대분수와 가장 작은 대분수의 ${합 ? '합' : '차'}은(는) 얼마일까요?`,
      answer: 분수글(v, d),
      wrongs: 다른(분수글(v, d), [분수글(합 ? 큰 - 작은 : 큰 + 작은, d), 분수글(큰, d), 분수글(v + 1, d), 분수글(v + d, d)]),
      tag: 'fractionAdd',
      strategy: '조건에 맞는 가장 큰 대분수와 가장 작은 대분수 만들기',
      hint: '자연수 부분이 클수록 큰 대분수예요. 분자는 분모보다 작아야 해요.',
      steps: [`가장 큰 대분수는 ${분수글(큰, d)}, 가장 작은 대분수는 ${분수글(작은, d)}입니다.`, `${분수글(큰, d)}${합 ? '+' : '-'}${분수글(작은, d)}=${분수글(v, d)}`],
      misconceptionTip: `분자에는 ${d}보다 작은 수만 놓을 수 있어요.`,
      minusIsOperator: true,
    };
  },
});

/** 두 단계 문장제: 끈을 두 번 쓰고 남은 길이, 물을 붓고 마신 양 */
export const 분수문장제 = (id: string): G5Family => ({
  id: `${id}-frac-word2`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 4, 10);
    const 전체 = 사이(next, 2, 5) * d + 사이(next, 0, d - 1);
    const a = 사이(next, 1, 2 * d - 1);
    const b = 사이(next, 1, 2 * d - 1);
    const v = 전체 - a - b;
    if (v <= 0 || a % d === 0 || b % d === 0) return null;
    return {
      prompt: `끈 ${분수글(전체, d)} m 가운데 상자를 묶는 데 ${분수글(a, d)} m, 리본을 만드는 데 ${분수글(b, d)} m를 썼습니다. 남은 끈은 몇 m일까요?`,
      answer: `${분수글(v, d)} m`,
      wrongs: 다른(`${분수글(v, d)} m`, [`${분수글(전체 - a, d)} m`, `${분수글(a + b, d)} m`, `${분수글(전체 - a + b, d)} m`, `${분수글(v + 1, d)} m`]),
      tag: 'fractionAdd',
      strategy: '두 번 쓴 양을 빼어 남은 양 구하기',
      hint: '쓴 끈을 먼저 모두 더한 다음 전체에서 빼도 되고, 차례로 빼도 돼요.',
      steps: [`쓴 끈: ${분수글(a, d)}+${분수글(b, d)}=${분수글(a + b, d)} m`, `남은 끈: ${분수글(전체, d)}-${분수글(a + b, d)}=${분수글(v, d)} m`],
      minusIsOperator: true,
    };
  },
});

/** □/d + a/d < X 에서 □에 들어갈 수 있는 가장 큰 자연수 */
export const 분수네모 = (id: string): G5Family => ({
  id: `${id}-frac-box`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 5, 12);
    const a = 사이(next, 1, d - 1);
    const X = 사이(next, 1, 3) * d + 사이(next, 1, d - 1);
    const v = X - a - 1;
    if (v <= 0) return null;
    return {
      prompt: `□/${d}+${a}/${d}<${분수글(X, d)}에서 □ 안에 들어갈 수 있는 자연수 가운데 가장 큰 수는 얼마일까요?`,
      answer: String(v),
      wrongs: [v + 1, v - 1, v + 2, X].filter((x, i, xs) => x > 0 && x !== v && xs.indexOf(x) === i).slice(0, 3).map(String),
      tag: 'fractionAdd',
      strategy: '분자끼리 견주어 □의 범위 구하기',
      hint: `${분수글(X, d)}을(를) 가분수로 바꾸면 분자끼리 견줄 수 있어요.`,
      steps: [`${분수글(X, d)}=${X}/${d}이므로 □+${a}<${X}입니다.`, `□<${X - a}이므로 가장 큰 자연수는 ${v}입니다.`],
      misconceptionTip: '같을 때는 들어가지 않아요(<이니까요).',
    };
  },
});

// ── 소수 ─────────────────────────────────────────────────────────────
const 소수하나 = (next: (b: number) => number, 자리: 1 | 2, 최대: number) => 사이(next, 1, 최대 * 10 ** 자리) * 10 ** (3 - 자리);

export const 소수어떤수 = (id: string, 자리: 1 | 2): G5Family => ({
  id: `${id}-dec-unknown`,
  make: (seed) => {
    const next = 고르개(seed);
    const x = 소수하나(next, 자리, 9);
    const a = 소수하나(next, 자리, 9);
    const 더함 = next(2) === 0;
    const 결과 = 더함 ? x + a : x - a;
    if (결과 <= 0) return null;
    return {
      prompt: `어떤 수에${더함 ? '' : '서'} ${소수(a)}을(를) ${더함 ? '더했' : '뺐'}더니 ${소수(결과)}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
      answer: 소수(x),
      wrongs: 다른(소수(x), [소수(더함 ? 결과 + a : 결과 - a), 소수(x + 10 ** (3 - 자리)), 소수(x * 10), 소수(Math.abs(x - 10 ** (3 - 자리)))]),
      tag: 'decimal',
      strategy: '덧셈과 뺄셈의 관계로 어떤 수 구하기',
      hint: 더함 ? '□+(더한 수)=(결과)이면 □=(결과)-(더한 수)예요.' : '□-(뺀 수)=(결과)이면 □=(결과)+(뺀 수)예요.',
      steps: [`□${더함 ? '+' : '-'}${소수(a)}=${소수(결과)}`, `□=${소수(결과)}${더함 ? '-' : '+'}${소수(a)}=${소수(x)}`],
      misconceptionTip: '소수점의 자리를 맞추어 계산해요.',
      minusIsOperator: true,
    };
  },
});

export const 소수잘못계산 = (id: string, 자리: 1 | 2): G5Family => ({
  id: `${id}-dec-mistake`,
  make: (seed) => {
    const next = 고르개(seed);
    const x = 소수하나(next, 자리, 9);
    const a = 소수하나(next, 자리, 5);
    if (x <= a) return null;
    const 잘못 = x - a;
    const v = x + a;
    return {
      prompt: `어떤 수에 ${소수(a)}을(를) 더해야 할 것을 잘못하여 뺐더니 ${소수(잘못)}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
      answer: 소수(v),
      wrongs: 다른(소수(v), [소수(x), 소수(v + a), 소수(잘못 + a + 10 ** (3 - 자리)), 소수(v * 10)]),
      tag: 'decimal',
      strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
      hint: '먼저 잘못 계산한 식으로 어떤 수를 찾아요.',
      steps: [`□-${소수(a)}=${소수(잘못)}이므로 □=${소수(잘못)}+${소수(a)}=${소수(x)}입니다.`, `바르게 계산하면 ${소수(x)}+${소수(a)}=${소수(v)}입니다.`],
      minusIsOperator: true,
    };
  },
});

/** 수 카드 3장으로 소수 두 자리 수 □.□□를 만들 때 가장 큰 수와 가장 작은 수의 합(차) */
export const 소수카드 = (id: string): G5Family => ({
  id: `${id}-dec-cards`,
  make: (seed) => {
    const next = 고르개(seed);
    const 카드: number[] = [];
    while (카드.length < 3) {
      const c = 사이(next, 1, 9);
      if (!카드.includes(c)) 카드.push(c);
    }
    const 오름 = [...카드].sort((a, b) => a - b);
    const 큰 = (오름[2] * 100 + 오름[1] * 10 + 오름[0]) * 10;
    const 작은 = (오름[0] * 100 + 오름[1] * 10 + 오름[2]) * 10;
    const 합 = next(2) === 0;
    const v = 합 ? 큰 + 작은 : 큰 - 작은;
    return {
      prompt: `수 카드 ${카드.join(', ')}을(를) 한 번씩만 사용하여 소수 두 자리 수를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 ${합 ? '합' : '차'}은(는) 얼마일까요?`,
      answer: 소수(v),
      wrongs: 다른(소수(v), [소수(합 ? 큰 - 작은 : 큰 + 작은), 소수(v * 10), 소수(v + 100), 소수(큰)]),
      tag: 'decimal',
      strategy: '자릿값을 생각하여 가장 큰 소수와 가장 작은 소수 만들기',
      hint: '가장 높은 자리(일의 자리)부터 큰 숫자를 놓으면 가장 큰 수가 돼요.',
      steps: [`가장 큰 수는 ${소수(큰)}, 가장 작은 수는 ${소수(작은)}입니다.`, `${소수(큰)}${합 ? '+' : '-'}${소수(작은)}=${소수(v)}`],
      minusIsOperator: true,
    };
  },
});

export const 소수문장제 = (id: string, 자리: 1 | 2): G5Family => ({
  id: `${id}-dec-word2`,
  make: (seed) => {
    const next = 고르개(seed);
    const 처음 = 소수하나(next, 자리, 3) + 1000;
    const 마심 = 소수하나(next, 자리, 1);
    const 더부음 = 소수하나(next, 자리, 2);
    const v = 처음 - 마심 + 더부음;
    if (처음 <= 마심) return null;
    return {
      prompt: `물병에 물이 ${소수(처음)} L 있었습니다. 그중에서 ${소수(마심)} L를 마시고 ${소수(더부음)} L를 더 부었습니다. 물병에 있는 물은 몇 L일까요?`,
      answer: `${소수(v)} L`,
      wrongs: 다른(`${소수(v)} L`, [`${소수(처음 - 마심)} L`, `${소수(처음 + 마심 + 더부음)} L`, `${소수(Math.abs(처음 - 마심 - 더부음))} L`, `${소수(v + 100)} L`]),
      tag: 'decimal',
      strategy: '차례대로 빼고 더하는 문장제',
      hint: '마신 양은 빼고, 더 부은 양은 더해요.',
      steps: [`${소수(처음)}-${소수(마심)}=${소수(처음 - 마심)}`, `${소수(처음 - 마심)}+${소수(더부음)}=${소수(v)} L`],
      minusIsOperator: true,
    };
  },
});
