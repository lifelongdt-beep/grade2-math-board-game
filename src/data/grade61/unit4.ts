import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { frac, text } from '../grade5/fraction';
import { 고르개, 사이 } from '../grade11/common';
import { 백분율거꾸로, 비율견주기 } from '../grade6/thinking';
import { 소수 } from '../grade42/unit3';

// ════════════════════════════════════════════════════════════════════
// 6-1 4단원 비와 비율
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 두 양 비교(뺄셈, 나눗셈) / 비 / 비율 /
// 생활 속 비율 / 백분율 / 생활 속 백분율
//
// 지도서가 못박은 것:
//   · 3 : 2는 '3 대 2', '3과 2의 비', '2에 대한 3의 비', '3의 2에 대한 비'로
//     읽습니다. 기호 : 의 오른쪽이 기준량, 왼쪽이 비교하는 양입니다.
//   · (비율)=(비교하는 양)÷(기준량). 분수나 소수로 나타냅니다.
//   · 기준량을 100으로 할 때의 비율이 백분율(%)입니다.
//   · 속력, 인구 밀도, 축척, 농도를 직접 구하는 문제는 다루지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 비 = (a: number, b: number) => `${a} : ${b}`;

const 비쓰기: G5Family = {
  id: 'ratio-write',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 15);
    const b = 사이(next, 1, 15);
    if (a === b) return null;
    const kind = next(4);
    const 말 = [`${a} 대 ${b}`, `${a}과(와) ${b}의 비`, `${b}에 대한 ${a}의 비`, `${a}의 ${b}에 대한 비`][kind];
    const ans = 비(a, b);
    return {
      prompt: `'${말}' — 기호 : 을 사용하여 바르게 나타낸 것은 어느 것일까요?`,
      answer: ans,
      wrongs: [비(b, a), 비(a + b, b), 비(a, a + b)].filter((w) => w !== ans),
      tag: 'ratio',
      strategy: '비 읽고 쓰기',
      hint: '기준량이 기호 : 의 오른쪽에 와요. ~에 대한 앞의 수가 기준량이에요.',
      steps: [`기준량은 ${b}, 비교하는 양은 ${a}이므로 ${ans}입니다.`],
      misconceptionTip: `${비(a, b)}와 ${비(b, a)}는 서로 다른 비예요.`,
    };
  },
};

const 상황비: G5Family = {
  id: 'ratio-situation',
  make: (seed) => {
    const next = 고르개(seed);
    const 남 = 사이(next, 5, 18);
    const 여 = 사이(next, 5, 18);
    if (남 === 여) return null;
    const 전체 = 남 + 여;
    const kind = next(3);
    const [p, ans] =
      kind === 0
        ? [`남학생 수에 대한 여학생 수의 비`, 비(여, 남)]
        : kind === 1
          ? [`여학생 수에 대한 남학생 수의 비`, 비(남, 여)]
          : [`전체 학생 수에 대한 남학생 수의 비`, 비(남, 전체)];
    return {
      prompt: `어느 반의 남학생은 ${남}명, 여학생은 ${여}명입니다. ${p}를 구하면 어느 것일까요?`,
      answer: ans,
      wrongs: [비(남, 여), 비(여, 남), 비(남, 전체), 비(여, 전체), 비(전체, 남)].filter((w, i, xs) => w !== ans && xs.indexOf(w) === i).slice(0, 3),
      tag: 'ratio',
      strategy: '상황을 비로 나타내기',
      hint: "'~에 대한'의 앞에 있는 양이 기준량이에요.",
      steps: [`기준량을 오른쪽에 써서 ${ans}입니다.`],
    };
  },
};

const 차와배: G5Family = {
  id: 'diff-vs-times',
  make: (seed) => {
    const next = 고르개(seed);
    const 모둠 = 사이(next, 2, 9);
    const 사람 = 사이(next, 2, 5);
    const 물건 = 모둠 * 사람;
    const 배 = next(2) === 0;
    return 배
      ? {
          prompt: `모둠 수가 ${모둠}이고 모둠마다 ${사람}명씩입니다. 학생 수는 모둠 수의 몇 배일까요?`,
          answer: `${사람}배`,
          wrongs: [물건 - 모둠, 물건, 모둠].filter((x) => x !== 사람).map((x) => `${x}배`),
          tag: 'ratio',
          strategy: '나눗셈으로 두 양 비교하기',
          hint: '몇 배인지는 나눗셈으로 비교해요.',
          steps: [`학생 수는 ${물건}명이고 ${물건}÷${모둠}=${사람}이므로 ${사람}배입니다.`],
        }
      : {
          prompt: `모둠 수가 ${모둠}이고 모둠마다 ${사람}명씩입니다. 학생 수는 모둠 수보다 몇 더 많을까요?`,
          answer: `${물건 - 모둠}`,
          wrongs: [사람, 물건, 물건 + 모둠].filter((x) => x !== 물건 - 모둠).map(String),
          tag: 'ratio',
          strategy: '뺄셈으로 두 양 비교하기',
          hint: '얼마나 더 많은지는 뺄셈으로 비교해요.',
          steps: [`학생 수는 ${물건}명이고 ${물건}-${모둠}=${물건 - 모둠}입니다.`],
          minusIsOperator: true,
        };
  },
};

/** 비율 a÷b가 소수로 끝나는 짝을 고릅니다(분모 2, 4, 5, 10, 20, 25, 50). */
const 끝나는짝 = (next: (b: number) => number) => {
  const b = [2, 4, 5, 10, 20, 25, 50][next(7)];
  const a = 사이(next, 1, b * 2);
  if (a === b) return null;
  return { a, b, m: (a * 1000) / b };
};

const 비율: G5Family = {
  id: 'ratio-value',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const one = 끝나는짝(next);
    if (!one) return null;
    const { a, b, m } = one;
    const 소수로 = lv !== '하' && next(2) === 0;
    const f = frac(a, b);
    const ans = 소수로 ? 소수(m) : text(f);
    const 거꾸로 = frac(b, a);
    const wrongs = 소수로
      ? [소수((b * 1000) / a), 소수(m * 10), 소수(Math.max(1, m - 100)), 소수(m + 100)].filter((w) => !/\.\d{4,}|e/.test(w))
      : [text(거꾸로), text(frac(a, a + b)), text(frac(a + 1, b))];
    return {
      prompt: `${비(a, b)}의 비율을 ${소수로 ? '소수' : '분수'}로 나타내면 얼마일까요?`,
      answer: ans,
      wrongs: [...new Set(wrongs)].filter((w) => w !== ans),
      tag: 'ratio',
      strategy: '비율을 분수, 소수로 나타내기',
      hint: '(비율)=(비교하는 양)÷(기준량)이에요.',
      steps: [`${a}÷${b}=${소수로 ? 소수(m) : `${a}/${b}`}`, ...(소수로 || text(f) === `${a}/${b}` ? [] : [`${a}/${b}=${text(f)}`])],
      misconceptionTip: '기준량으로 나누어야 해요. 거꾸로 나누면 안 돼요.',
    };
  },
};

const 생활비율: G5Family = {
  id: 'ratio-life',
  make: (seed) => {
    const next = 고르개(seed);
    const 장면 = next(3);
    const b = [10, 20, 25, 50][next(4)];
    const a = 사이(next, 1, b - 1);
    const m = (a * 1000) / b;
    const [prompt, step] =
      장면 === 0
        ? [`민지는 공을 ${b}번 던져 ${a}번 넣었습니다. 던진 횟수에 대한 넣은 횟수의 비율을 소수로 나타내면 얼마일까요?`, '던진 횟수가 기준량입니다.']
        : 장면 === 1
          ? [`씨앗 ${b}개를 심었더니 ${a}개가 싹이 텄습니다. 심은 씨앗 수에 대한 싹이 튼 씨앗 수의 비율을 소수로 나타내면 얼마일까요?`, '심은 씨앗 수가 기준량입니다.']
          : [`퀴즈 ${b}문제 가운데 ${a}문제를 맞혔습니다. 전체 문제 수에 대한 맞힌 문제 수의 비율을 소수로 나타내면 얼마일까요?`, '전체 문제 수가 기준량입니다.'];
    const ans = 소수(m);
    return {
      prompt,
      answer: ans,
      wrongs: [...new Set([소수((b * 1000) / a), 소수(m * 10), 소수(((b - a) * 1000) / b)])].filter((w) => w !== ans && !/\.\d{4,}/.test(w)).concat([소수(m + 100)]).filter((w, i, xs) => w !== ans && xs.indexOf(w) === i).slice(0, 3),
      tag: 'ratio',
      strategy: '생활 속 비율 구하기',
      hint: "'~에 대한'의 앞이 기준량이에요.",
      steps: [step, `${a}÷${b}=${ans}`],
    };
  },
};

const 백분율: G5Family = {
  id: 'percent',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const kind = next(lv === '하' ? 2 : 3);
    if (kind === 0) {
      const p = 사이(next, 1, 99);
      const m = p * 10;
      return {
        prompt: `비율 ${소수(m)}을(를) 백분율로 나타내면 몇 %일까요?`,
        answer: `${p}%`,
        wrongs: [...new Set([p / 10, p * 10, 100 - p])].filter((x) => x !== p && Number.isInteger(x) && x > 0).map((x) => `${x}%`).concat([`${소수(m)}%`]).slice(0, 3),
        tag: 'ratio',
        strategy: '비율을 백분율로 나타내기',
        hint: '비율에 100을 곱하고 %를 붙여요.',
        steps: [`${소수(m)}×100=${p}이므로 ${p}%입니다.`],
      };
    }
    if (kind === 1) {
      const b = [2, 4, 5, 10, 20, 25, 50][next(7)];
      const a = 사이(next, 1, b - 1);
      const p = (a * 100) / b;
      return {
        prompt: `비율 ${a}/${b}을(를) 백분율로 나타내면 몇 %일까요?`,
        answer: `${p}%`,
        wrongs: [...new Set([a, b, p / 10, 100 - p])].filter((x) => x !== p && Number.isInteger(x) && x > 0).slice(0, 3).map((x) => `${x}%`),
        tag: 'ratio',
        strategy: '분수 비율을 백분율로 나타내기',
        hint: '분모가 100인 분수로 바꾸거나 비율에 100을 곱해요.',
        steps: [`${a}/${b}×100=${p}이므로 ${p}%입니다.`],
      };
    }
    const p = 사이(next, 1, 19) * 5;
    return {
      prompt: `${p}%를 소수로 나타내면 얼마일까요?`,
      answer: 소수(p * 10),
      wrongs: [...new Set([소수(p * 100), 소수(p), 소수(p * 1000)])].filter((w) => w !== 소수(p * 10)),
      tag: 'ratio',
      strategy: '백분율을 소수로 나타내기',
      hint: '%의 수를 100으로 나누어요.',
      steps: [`${p}÷100=${소수(p * 10)}`],
    };
  },
};

const 생활백분율: G5Family = {
  id: 'percent-life',
  make: (seed) => {
    const next = 고르개(seed);
    const kind = next(3);
    if (kind === 0) {
      const 값 = 사이(next, 2, 20) * 1000;
      const 할인 = [10, 20, 25, 30, 40, 50][next(6)];
      const 깎은 = (값 * 할인) / 100;
      return {
        prompt: `${값}원짜리 물건을 ${할인}% 할인하여 판다고 합니다. 할인받는 금액은 얼마일까요?`,
        answer: `${깎은}원`,
        wrongs: [...new Set([값 - 깎은, 할인 * 10, 깎은 * 10, 깎은 / 10])].filter((x) => x !== 깎은 && Number.isInteger(x)).slice(0, 3).map((x) => `${x}원`),
        tag: 'ratio',
        strategy: '할인 금액 구하기',
        hint: `${할인}%는 ${할인}/100이에요.`,
        steps: [`${값}×${할인}/100=${깎은}이므로 ${깎은}원입니다.`],
      };
    }
    if (kind === 1) {
      const 원래 = 사이(next, 2, 20) * 1000;
      const 판값 = 원래 - 원래 * (사이(next, 1, 5) / 10);
      const 율 = ((원래 - 판값) * 100) / 원래;
      return {
        prompt: `${원래}원짜리 물건을 ${판값}원에 샀습니다. 할인율은 몇 %일까요?`,
        answer: `${율}%`,
        wrongs: [...new Set([100 - 율, (원래 - 판값) / 100, 율 + 10])].filter((x) => x !== 율 && x > 0 && Number.isInteger(x)).slice(0, 3).map((x) => `${x}%`),
        tag: 'ratio',
        strategy: '할인율 구하기',
        hint: '(할인 금액)÷(원래 가격)×100이에요.',
        steps: [`할인 금액은 ${원래 - 판값}원입니다.`, `${원래 - 판값}÷${원래}×100=${율}이므로 ${율}%입니다.`],
        minusIsOperator: true,
      };
    }
    const 투표 = [20, 25, 40, 50, 200, 250, 500][next(7)];
    const 표 = 사이(next, 1, 투표 - 1);
    const 율 = (표 * 100) / 투표;
    if (!Number.isInteger(율)) return null;
    return {
      prompt: `${투표}명이 투표하여 한 후보가 ${표}표를 얻었습니다. 이 후보의 득표율은 몇 %일까요?`,
      answer: `${율}%`,
      wrongs: [...new Set([100 - 율, 표, 율 * 10, 율 + 5])].filter((x) => x !== 율 && x > 0 && Number.isInteger(x)).slice(0, 3).map((x) => `${x}%`),
      tag: 'ratio',
      strategy: '득표율 구하기',
      hint: '(얻은 표 수)÷(전체 투표 수)×100이에요.',
      steps: [`${표}÷${투표}×100=${율}이므로 ${율}%입니다.`],
    };
  },
};

export const unit4Lesson61 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [차와배, 비쓰기];
    case 2:
      return [차와배, 비쓰기];
    case 3:
      return lv === '하' ? [비쓰기] : [비쓰기, 상황비];
    case 4:
      return [비율, 비율견주기, 비쓰기];
    case 5:
      return [생활비율, 비율견주기];
    case 6:
      return [백분율, 비율견주기];
    case 7:
      return [생활백분율, 백분율거꾸로, 비율견주기];
    default:
      return null;
  }
};
