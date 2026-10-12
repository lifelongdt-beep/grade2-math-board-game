import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { type Frac, frac, gcd, mixed, text } from '../grade5/fraction';
import { 고르개, 사이 } from '../grade11/common';
import { 몫1견주기, 분수어떤수, 분수잘못계산 } from '../grade6/thinking';

// ════════════════════════════════════════════════════════════════════
// 6-1 1단원 분수의 나눗셈
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / (자연수)÷(자연수)의 몫을 분수로 ⑴(몫<1)
// / ⑵(몫>1) / (분수)÷(자연수) / (대분수)÷(자연수)
//
// 지도서가 못박은 것:
//   · 계산 결과를 기약분수가 아닌 분수나 가분수로 나타내는 것도 허용합니다.
//     보기에서 하나를 고르는 문항이므로 답은 교과서가 적는 꼴(기약분수,
//     가분수는 대분수)로 두고, 답과 크기가 같은 다른 꼴은 보기에 넣지
//     않습니다 — 넣으면 맞는 답이 둘이 됩니다.
//   · (분수)÷(자연수)는 분자가 나누어떨어지면 분자를 나누고, 아니면
//     1/(자연수)를 곱합니다. '역수'라는 말은 쓰지 않습니다.
// ════════════════════════════════════════════════════════════════════

/** 답과 크기가 같은 보기와 0 이하인 보기를 뺍니다. */
const 다른값 = (answer: Frac, xs: Frac[]) => {
  const seen = new Set<string>();
  return xs
    .filter((f) => f.n > 0 && f.n * answer.d !== answer.n * f.d)
    .map(text)
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
};

const 몫분수 = (작은: boolean): G5Family => ({
  id: `whole-div-${작은 ? 'lt1' : 'gt1'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const b = 사이(next, 2, 9);
    const a = 작은 ? 사이(next, 1, b - 1) : 사이(next, b + 1, b * 3);
    if (!작은 && a % b === 0) return null;
    const ans = frac(a, b);
    return {
      prompt: `${a}÷${b}의 몫을 분수로 나타내면 얼마일까요?`,
      answer: text(ans),
      wrongs: 다른값(ans, [frac(b, a), frac(a, b + 1), frac(a + 1, b), frac(1, a * b), frac(a, b * 2)]),
      tag: 'fractionDiv',
      strategy: '(자연수)÷(자연수)의 몫을 분수로 나타내기',
      hint: `${a}을(를) ${b}(으)로 똑같이 나누면 한 몫은 1/${b}이(가) ${a}개예요.`,
      steps: [`${a}÷${b}=${a}/${b}`, ...(작은 ? [] : [`${a}/${b}=${text(ans)}`])],
      misconceptionTip: '나누어지는 수가 분자, 나누는 수가 분모예요. 거꾸로 쓰지 마세요.',
    };
  },
});

const 몫분수문장제: G5Family = {
  id: 'whole-div-story',
  make: (seed) => {
    const next = 고르개(seed);
    const b = 사이(next, 2, 8);
    const a = 사이(next, 1, b * 2);
    if (a % b === 0) return null;
    const ans = frac(a, b);
    const 물건 = ['주스', '페인트', '우유'][next(3)];
    return {
      prompt: `${물건} ${a} L를 ${b}명이 똑같이 나누어 가지려고 합니다. 한 명이 가지는 ${물건}은(는) 몇 L일까요?`,
      answer: `${text(ans)} L`,
      wrongs: 다른값(ans, [frac(b, a), frac(a, b + 1), frac(a + 1, b), frac(a * b, 1)]).map((t) => `${t} L`),
      tag: 'fractionDiv',
      strategy: '(자연수)÷(자연수) 문장제',
      hint: '똑같이 나누므로 나눗셈이에요.',
      steps: [`${a}÷${b}=${a}/${b}${text(ans) !== `${a}/${b}` ? `=${text(ans)}` : ''}이므로 ${text(ans)} L입니다.`],
    };
  },
};

const 분수나누기자연수 = (가분수: boolean): G5Family => ({
  id: `frac-div-whole-${가분수 ? 'imp' : 'prop'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 9);
    const k = 사이(next, 2, lv === '하' ? 4 : 7);
    // 하: 분자가 나누어떨어지는 것, 그 밖에는 섞습니다.
    const 떨어짐 = lv === '하' || next(2) === 0;
    const n = 떨어짐 ? k * 사이(next, 1, 가분수 ? 4 : 3) : 사이(next, 1, 가분수 ? d * 3 : d - 1);
    if (가분수 ? n <= d : n >= d) return null;
    if (!떨어짐 && n % k === 0) return null;
    // 문제에 약분되지 않은 분수(4/8 같은)를 내지 않습니다.
    if (gcd(n, d) !== 1) return null;
    const ans = frac(n, d * k);
    const 보기 = 다른값(ans, [frac(n * k, d), frac(n, d + k), frac(Math.max(1, n - k), d), frac(d, n * k), frac(n, d * (k + 1))]);
    return {
      prompt: `${n}/${d}÷${k}은(는) 얼마일까요?`,
      answer: text(ans),
      wrongs: 보기,
      tag: 'fractionDiv',
      strategy: '(분수)÷(자연수)',
      hint: n % k === 0 ? '분자가 나누는 수로 나누어떨어지면 분자를 나누어요.' : `÷${k}은(는) ×1/${k}과(와) 같아요.`,
      steps:
        n % k === 0
          ? [`${n}/${d}÷${k}=(${n}÷${k})/${d}=${n / k}/${d}`, ...(text(ans) !== `${n / k}/${d}` ? [`${n / k}/${d}=${text(ans)}`] : [])]
          : [`${n}/${d}÷${k}=${n}/${d}×1/${k}=${n}/${d * k}`, ...(text(ans) !== `${n}/${d * k}` ? [`${n}/${d * k}=${text(ans)}`] : [])],
      misconceptionTip: '분모에 나누는 수를 곱해야 해요. 분자에 곱하면 오히려 커져요.',
    };
  },
});

const 대분수나누기: G5Family = {
  id: 'mixed-div-whole',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 7);
    const w = 사이(next, 1, 4);
    const r = 사이(next, 1, d - 1);
    const k = 사이(next, 2, 6);
    const a = mixed(w, r, d);
    const ans = frac(a.n, a.d * k);
    return {
      prompt: `${text(a)}÷${k}은(는) 얼마일까요?`,
      answer: text(ans),
      wrongs: 다른값(ans, [frac(w * d + r * k, d * k), frac(a.n * k, a.d), frac(w, k), frac(r, d * k), frac(a.n, a.d * (k + 1)), frac(a.n + 1, a.d * k)]),
      tag: 'fractionDiv',
      strategy: '(대분수)÷(자연수)',
      hint: '대분수를 가분수로 바꾼 다음 나누어요.',
      steps: [`${text(a)}=${a.n}/${a.d}`, `${a.n}/${a.d}÷${k}=${a.n}/${a.d}×1/${k}=${a.n}/${a.d * k}`, `${a.n}/${a.d * k}=${text(ans)}`].filter((x, i) => i < 2 || text(ans) !== `${a.n}/${a.d * k}`),
      misconceptionTip: '자연수 부분만 나누고 분수 부분은 그대로 두면 안 돼요.',
    };
  },
};

const 넓이문장제: G5Family = {
  id: 'area-story',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 9);
    const n = 사이(next, 1, d * 2);
    const k = 사이(next, 2, 6);
    const 넓이: Frac = frac(n, d);
    if (넓이.d === 1) return null;
    const ans = frac(넓이.n, 넓이.d * k);
    return {
      prompt: `넓이가 ${넓이.n}/${넓이.d} m²이고 가로가 ${k} m인 직사각형이 있습니다. 세로는 몇 m일까요?`,
      answer: `${text(ans)} m`,
      wrongs: 다른값(ans, [frac(넓이.n * k, 넓이.d), frac(k, 1), frac(넓이.n, 넓이.d + k), frac(넓이.d, 넓이.n * k)]).map((t) => `${t} m`),
      tag: 'fractionDiv',
      strategy: '넓이에서 세로 구하기',
      hint: '(세로)=(넓이)÷(가로)예요.',
      steps: [`${넓이.n}/${넓이.d}÷${k}=${넓이.n}/${넓이.d * k}${text(ans) !== `${넓이.n}/${넓이.d * k}` ? `=${text(ans)}` : ''}이므로 ${text(ans)} m입니다.`],
    };
  },
};

export const unit1Lesson61 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [몫분수(true), 몫분수문장제];
    case 2:
      return lv === '하' ? [몫분수(true), 몫1견주기('자연수')] : [몫분수(true), 몫분수문장제, 몫1견주기('자연수')];
    case 3:
      return lv === '하' ? [몫분수(false), 몫1견주기('자연수')] : [몫분수(false), 몫분수문장제, 몫1견주기('자연수')];
    case 4:
      if (lv === '하') return [분수나누기자연수(false), 분수어떤수('자연수')];
      return lv === '중' ? [분수나누기자연수(false), 분수나누기자연수(true), 분수어떤수('자연수'), 분수잘못계산('자연수')] : [분수나누기자연수(true), 넓이문장제, 분수어떤수('자연수'), 분수잘못계산('자연수')];
    case 5:
      return lv === '하' ? [대분수나누기, 분수어떤수('자연수')] : [대분수나누기, 넓이문장제, 분수잘못계산('자연수')];
    default:
      return null;
  }
};
