import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 4-2 삼각형·사각형·다각형의 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
// 도형 단원은 뜻을 외우는 데서 그치기 쉽습니다. 지도서는 도형 사이의
// 관계(정사각형은 직사각형이다 …)와, 성질을 써서 거꾸로 길이·각을 찾는
// 일을 함께 하게 합니다.
// ════════════════════════════════════════════════════════════════════

const 이름 = ['', '', '', '삼', '사', '오', '육', '칠', '팔', '구', '십'];

/** 사각형 사이의 관계: 옳은(옳지 않은) 설명 고르기 */
const 사각형관계문장 = [
  { 글: '정사각형은 직사각형이라고 할 수 있습니다.', 참: true },
  { 글: '정사각형은 마름모라고 할 수 있습니다.', 참: true },
  { 글: '마름모는 평행사변형이라고 할 수 있습니다.', 참: true },
  { 글: '직사각형은 평행사변형이라고 할 수 있습니다.', 참: true },
  { 글: '평행사변형은 사다리꼴이라고 할 수 있습니다.', 참: true },
  { 글: '정사각형은 사다리꼴이라고 할 수 있습니다.', 참: true },
  { 글: '직사각형은 정사각형이라고 할 수 있습니다.', 참: false },
  { 글: '마름모는 정사각형이라고 할 수 있습니다.', 참: false },
  { 글: '사다리꼴은 평행사변형이라고 할 수 있습니다.', 참: false },
  { 글: '평행사변형은 마름모라고 할 수 있습니다.', 참: false },
  { 글: '사다리꼴은 직사각형이라고 할 수 있습니다.', 참: false },
  { 글: '마름모는 직사각형이라고 할 수 있습니다.', 참: false },
];

export const 사각형관계: G5Family = {
  id: 'quad-relation',
  make: (seed) => {
    const next = 고르개(seed);
    const 옳은것 = next(2) === 0;
    const 맞는쪽 = 사각형관계문장.filter((s) => s.참 === 옳은것);
    const 다른쪽 = 사각형관계문장.filter((s) => s.참 !== 옳은것);
    const 답 = 맞는쪽[next(맞는쪽.length)];
    const 틀린: string[] = [];
    while (틀린.length < 3) {
      const s = 다른쪽[next(다른쪽.length)].글;
      if (!틀린.includes(s)) 틀린.push(s);
    }
    return {
      prompt: `사각형 사이의 관계를 바르게 생각하여, ${옳은것 ? '옳은' : '옳지 않은'} 것을 고르면 어느 것일까요?`,
      answer: 답.글,
      wrongs: 틀린,
      tag: 'shape',
      strategy: '사각형의 뜻으로 사각형 사이의 관계 따지기',
      hint: '뒤에 오는 사각형의 뜻(조건)을 앞의 사각형이 모두 만족하는지 따져 보세요.',
      steps: [
        '정사각형: 네 변이 같고 네 각이 직각, 직사각형: 네 각이 직각, 마름모: 네 변이 같음, 평행사변형: 마주 보는 두 쌍의 변이 평행, 사다리꼴: 평행한 변이 한 쌍이라도 있음',
        `${답.글.replace('라고 할 수 있습니다.', '')}라는 말은 ${답.참 ? '앞의 사각형이 뒤의 사각형의 조건을 모두 만족하므로 옳습니다' : '앞의 사각형이 뒤의 사각형의 조건을 늘 만족하지는 않으므로 옳지 않습니다'}.`,
      ],
      misconceptionTip: '정사각형은 직사각형이지만, 직사각형이 모두 정사각형은 아니에요. 방향을 바꾸면 달라져요.',
    };
  },
};

/** 둘레에서 거꾸로 변의 길이 구하기(평행사변형·마름모·이등변삼각형·정다각형) */
export const 둘레거꾸로 = (갈래들: Array<0 | 1 | 2>): G5Family => ({
  id: `perimeter-reverse-${갈래들.join('')}`,
  make: (seed) => {
    const next = 고르개(seed);
    // 0 평행사변형, 1 마름모(4단원), 2 정다각형(6단원)
    const 갈래 = 갈래들[next(갈래들.length)];
    if (갈래 === 0) {
      const a = 사이(next, 3, 15);
      const b = 사이(next, 3, 15);
      if (a === b) return null;
      const P = 2 * (a + b);
      return {
        prompt: `네 변의 길이의 합이 ${P} cm인 평행사변형이 있습니다. 한 변이 ${a} cm일 때, 이 변과 이웃한 변은 몇 cm일까요?`,
        answer: `${b} cm`,
        wrongs: [P - a, P / 2, P / 4, b + 1].filter((x, i, xs) => x !== b && Number.isInteger(x) && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x} cm`),
        tag: 'shape',
        strategy: '평행사변형의 성질로 거꾸로 변의 길이 구하기',
        hint: '평행사변형은 마주 보는 두 변의 길이가 같아요. 둘레의 절반이 이웃한 두 변의 합이에요.',
        steps: [`이웃한 두 변의 합은 ${P}÷2=${P / 2} cm입니다.`, `${P / 2}-${a}=${b} cm`],
        minusIsOperator: true,
      };
    }
    if (갈래 === 1) {
      const a = 사이(next, 3, 15);
      return {
        prompt: `네 변의 길이의 합이 ${4 * a} cm인 마름모의 한 변은 몇 cm일까요?`,
        answer: `${a} cm`,
        wrongs: [2 * a, 4 * a - 4, a + 2].filter((x) => x !== a).map((x) => `${x} cm`),
        tag: 'shape',
        strategy: '마름모의 성질로 거꾸로 변의 길이 구하기',
        hint: '마름모는 네 변의 길이가 모두 같아요.',
        steps: [`${4 * a}÷4=${a} cm`],
      };
    }
    const n = 사이(next, 3, 8);
    const a = 사이(next, 3, 12);
    return {
      prompt: `모든 변의 길이의 합이 ${n * a} cm인 정${이름[n]}각형의 한 변은 몇 cm일까요?`,
      answer: `${a} cm`,
      wrongs: [Math.round((n * a) / (n - 1)), Math.round((n * a) / (n + 1)), a + 1, n * a - n].filter((x, i, xs) => x !== a && x > 0 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '정다각형의 성질로 거꾸로 변의 길이 구하기',
      hint: '정다각형은 변의 길이가 모두 같아요. 변이 몇 개인지 먼저 세어요.',
      steps: [`정${이름[n]}각형은 변이 ${n}개입니다.`, `${n * a}÷${n}=${a} cm`],
    };
  },
});

/** 같은 길이의 철사로 만든 두 정다각형의 한 변 견주기 */
export const 같은철사: G5Family = {
  id: 'same-wire',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 3, 6);
    const m = 사이(next, n + 1, 8);
    const L = n * m * 사이(next, 1, 3);
    const a = L / n;
    const b = L / m;
    const d = a - b;
    return {
      prompt: `길이가 ${L} cm인 철사를 겹치지 않게 모두 써서 정${이름[n]}각형을 하나 만들었고, 같은 길이의 철사로 정${이름[m]}각형도 하나 만들었습니다. 두 정다각형의 한 변의 길이의 차는 몇 cm일까요?`,
      answer: `${d} cm`,
      wrongs: [a, b, m - n, d + 1].filter((x, i, xs) => x !== d && x > 0 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '정다각형의 둘레로 한 변을 구해 견주기',
      hint: '철사 길이가 곧 둘레예요. 변의 수로 나누어 한 변을 구해요.',
      steps: [`정${이름[n]}각형의 한 변: ${L}÷${n}=${a} cm`, `정${이름[m]}각형의 한 변: ${L}÷${m}=${b} cm`, `${a}-${b}=${d} cm`],
      minusIsOperator: true,
    };
  },
};

/** 대각선의 수에서 거꾸로 다각형 찾기 */
export const 대각선거꾸로: G5Family = {
  id: 'diagonal-reverse',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 4, 9);
    const k = (n * (n - 3)) / 2;
    return {
      prompt: `대각선이 모두 ${k}개인 다각형의 이름은 무엇일까요?`,
      answer: `${이름[n]}각형`,
      wrongs: [n - 1, n + 1, n + 2].filter((x) => x >= 3 && x <= 10).map((x) => `${이름[x]}각형`).concat(n - 1 < 3 ? ['구각형'] : []).slice(0, 3),
      tag: 'shape',
      strategy: '대각선의 수를 세는 규칙으로 거꾸로 생각하기',
      hint: '한 꼭짓점에서 그을 수 있는 대각선은 (꼭짓점의 수)-3개예요. 꼭짓점마다 그으면 같은 대각선을 두 번 세게 돼요.',
      steps: [`□각형의 대각선 수는 □×(□-3)÷2입니다.`, `${n}×${n - 3}÷2=${k}이므로 ${이름[n]}각형입니다.`],
      minusIsOperator: true,
    };
  },
};

/** 평행한 세 직선 사이의 거리 */
export const 세평행선: G5Family = {
  id: 'three-parallels',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 2, 12);
    const b = 사이(next, 2, 12);
    const 사이에 = next(2) === 0;
    if (사이에) {
      return {
        prompt: `서로 평행한 직선 가, 나, 다가 차례로 있습니다. 가와 나 사이의 거리는 ${a} cm, 나와 다 사이의 거리는 ${b} cm입니다. 가와 다 사이의 거리는 몇 cm일까요?`,
        answer: `${a + b} cm`,
        wrongs: [Math.abs(a - b) || a + b + 2, a * b, a + b + 1].filter((x, i, xs) => x !== a + b && x > 0 && xs.indexOf(x) === i).map((x) => `${x} cm`),
        tag: 'shape',
        strategy: '평행선 사이의 거리 더하기',
        hint: '가와 다 사이에 나가 있으므로 두 거리를 이어 붙여요.',
        steps: [`${a}+${b}=${a + b} cm`],
      };
    }
    if (a === b) return null;
    const 큰 = Math.max(a, b);
    const 작은 = Math.min(a, b);
    return {
      prompt: `서로 평행한 직선 가, 나, 다가 있습니다. 가와 다 사이의 거리는 ${큰} cm이고, 나는 가와 다 사이에 있으며 가와 나 사이의 거리는 ${작은} cm입니다. 나와 다 사이의 거리는 몇 cm일까요?`,
      answer: `${큰 - 작은} cm`,
      wrongs: [큰 + 작은, 큰, 작은].filter((x) => x !== 큰 - 작은).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '평행선 사이의 거리 빼기',
      hint: '그림을 그려 보세요. 가와 다 사이의 거리를 가-나, 나-다로 나누어요.',
      steps: [`${큰}-${작은}=${큰 - 작은} cm`],
      minusIsOperator: true,
    };
  },
};

/** 정삼각형과 이등변삼각형 사이의 관계, 이어 붙인 둘레 */
export const 정삼각형생각: G5Family = {
  id: 'equilateral-think',
  make: (seed) => {
    const next = 고르개(seed);
    if (next(2) === 0) {
      const 옳음 = next(2) === 0;
      const 참들 = ['정삼각형은 이등변삼각형이라고 할 수 있습니다.', '정삼각형의 세 각은 모두 60°입니다.', '정삼각형은 예각삼각형입니다.'];
      const 거짓들 = ['이등변삼각형은 모두 정삼각형입니다.', '정삼각형은 둔각삼각형이 될 수 있습니다.', '정삼각형은 직각삼각형이 될 수 있습니다.', '정삼각형의 한 각은 90°입니다.'];
      const 답 = 옳음 ? 참들[next(참들.length)] : 거짓들[next(거짓들.length)];
      const 다른 = (옳음 ? 거짓들 : 참들).slice();
      for (let t = 다른.length - 1; t > 0; t -= 1) { const j = next(t + 1); [다른[t], 다른[j]] = [다른[j], 다른[t]]; }
      return {
        prompt: `정삼각형에 대한 설명으로 ${옳음 ? '옳은' : '옳지 않은'} 것은 어느 것일까요?`,
        answer: 답,
        wrongs: 다른.slice(0, 3),
        tag: 'shape',
        strategy: '정삼각형과 이등변삼각형의 관계 따지기',
        hint: '정삼각형은 세 변의 길이가 같아요. 두 변의 길이가 같으면 이등변삼각형이에요.',
        steps: ['정삼각형은 세 변이 같으므로 두 변도 같아 이등변삼각형입니다. 세 각은 모두 60°로 예각입니다.', `그러므로 답은 '${답}'입니다.`],
      };
    }
    const a = 사이(next, 3, 12);
    const k = 사이(next, 2, 4);
    const v = (k + 2) * a;
    return {
      prompt: `한 변이 ${a} cm인 정삼각형 ${k}개를 변끼리 맞닿게 한 줄로 이어 붙여 만든 도형의 둘레는 몇 cm일까요?`,
      answer: `${v} cm`,
      wrongs: [3 * k * a, (k + 1) * a, (2 * k + 1) * a].filter((x, i, xs) => x !== v && xs.indexOf(x) === i).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '이어 붙인 도형의 둘레에서 맞닿은 변 빼기',
      hint: '맞닿은 변은 둘레가 아니에요. 바깥쪽 변만 세어요.',
      steps: [`정삼각형 ${k}개의 변은 모두 ${3 * k}개이고, 맞닿은 곳 ${k - 1}군데에서 변이 2개씩 안으로 들어갑니다.`, `바깥 변은 ${3 * k}-${2 * (k - 1)}=${k + 2}개이므로 ${a}×${k + 2}=${v} cm입니다.`],
      misconceptionTip: '정삼각형 둘레를 모두 더하면 맞닿은 변까지 세게 돼요.',
      minusIsOperator: true,
    };
  },
};
