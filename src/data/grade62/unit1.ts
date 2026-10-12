import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { type Frac, frac, mixed, text } from '../grade5/fraction';
import { 고르개, 사이 } from '../grade11/common';
import { 몫1견주기, 분수어떤수, 분수잘못계산, 분수카드나누기 } from '../grade6/thinking';

// ════════════════════════════════════════════════════════════════════
// 6-2 1단원 분수의 나눗셈 ((분수)÷(분수), (자연수)÷(분수))
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 분모가 같은 (분수)÷(분수) ⑴(분자끼리
// 나누어떨어짐) / ⑵(나누어떨어지지 않음) / (자연수)÷(분수) ⑴ / ⑵ /
// 분모가 다른 (분수)÷(분수) / 분모가 다른 (대분수)÷(분수)
//
// 지도서가 못박은 것:
//   · '역수'라는 말은 중학교에서 배우므로 쓰지 않습니다. '나누는 분수의
//     분모와 분자를 바꾸어 곱한다'고 씁니다.
//   · 결과를 대분수나 기약분수가 아닌 분수로 나타내는 것도 허용하므로,
//     보기에 답과 크기가 같은 다른 꼴을 두지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 나누기 = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n);
const 다른값 = (answer: Frac, xs: Frac[]) => {
  const seen = new Set<string>();
  return xs
    .filter((f) => f.n > 0 && f.d > 0 && f.n * answer.d !== answer.n * f.d)
    .map(text)
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
};
const 글 = (f: Frac) => `${f.n}/${f.d}`;

const 같은분모 = (떨어짐: boolean): G5Family => ({
  id: `same-den-${떨어짐 ? 'div' : 'nodiv'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 13);
    const b = 사이(next, 1, Math.floor((d - 1) / 2));
    const a = 떨어짐 ? b * 사이(next, 2, Math.floor((d - 1) / b)) : 사이(next, 1, d - 1);
    if (a >= d || b >= d || a === b) return null;
    if (!떨어짐 && a % b === 0) return null;
    if (떨어짐 && a % b !== 0) return null;
    const ans = frac(a, b);
    return {
      prompt: `${a}/${d}÷${b}/${d}은(는) 얼마일까요?`,
      answer: text(ans),
      wrongs: 다른값(ans, [frac(b, a), frac(a, b * d), frac(a * b, d * d), frac(a + 1, b), frac(a, b + 1)]),
      tag: 'fractionDiv',
      strategy: '분모가 같은 (분수)÷(분수)',
      hint: `분모가 같으니 1/${d}이(가) 몇 개인지만 보면 돼요. 분자끼리 나누어요.`,
      steps: [`${a}/${d}÷${b}/${d}=${a}÷${b}`, `${a}÷${b}=${떨어짐 ? a / b : `${a}/${b}`}${!떨어짐 && text(ans) !== `${a}/${b}` ? `=${text(ans)}` : ''}`],
      misconceptionTip: '분모끼리도 나누면 1이 되어 분모가 사라지는 것이 아니에요. 분자끼리의 나눗셈만 남아요.',
    };
  },
});

const 자연수나누기 = (방법: '단위' | '곱셈'): G5Family => ({
  id: `whole-div-frac-${방법}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 9);
    const n = 사이(next, 2, d - 1 >= 2 ? d - 1 : 2);
    if (n >= d && 방법 === '단위') return null;
    if (frac(n, d).d !== d) return null;
    const 몫 = 사이(next, 2, 6);
    const w = 방법 === '단위' ? n * 몫 : 사이(next, 2, 12);
    const ans = 나누기({ n: w, d: 1 }, { n, d });
    if (방법 === '단위' && ans.d !== 1) return null;
    return {
      prompt: `${w}÷${n}/${d}은(는) 얼마일까요?`,
      answer: text(ans),
      wrongs: 다른값(ans, [frac(w * n, d), frac(w, n * d), frac(w * d, 1), frac(d, w * n), frac(w * d + n, n)]),
      tag: 'fractionDiv',
      strategy: '(자연수)÷(분수)',
      hint: 방법 === '단위' ? `먼저 1/${d}에 해당하는 양을 구하고 ${d}배 해요.` : `나누는 분수의 분모와 분자를 바꾸어 곱해요: ×${d}/${n}`,
      steps:
        방법 === '단위'
          ? [`${w}÷${n}=${w / n}이(가) 1/${d}에 해당하는 양입니다.`, `${w / n}×${d}=${text(ans)}`]
          : [`${w}÷${n}/${d}=${w}×${d}/${n}=${w * d}/${n}`, ...(text(ans) !== `${w * d}/${n}` ? [`${w * d}/${n}=${text(ans)}`] : [])],
      misconceptionTip: '나누어지는 수가 아니라 나누는 분수의 분모와 분자를 바꿔요.',
    };
  },
});

const 다른분모 = (대분수: boolean): G5Family => ({
  id: `diff-den-${대분수 ? 'mixed' : 'proper'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d1 = 사이(next, 2, 9);
    const d2 = 사이(next, 2, 9);
    if (d1 === d2) return null;
    const w = 대분수 ? 사이(next, 1, 3) : 0;
    const a = 대분수 ? mixed(w, 사이(next, 1, d1 - 1), d1) : { n: 사이(next, 1, d1 - 1), d: d1 };
    const b = { n: 사이(next, 1, d2 - 1), d: d2 };
    if (frac(a.n, a.d).d !== a.d && !대분수) return null;
    if (frac(b.n, b.d).d !== b.d) return null;
    const ans = 나누기(a, b);
    const 앞글 = 대분수 ? text(a) : 글(a);
    return {
      prompt: `${앞글}÷${글(b)}은(는) 얼마일까요?`,
      answer: text(ans),
      wrongs: 다른값(ans, [나누기(b, a), frac(a.n * b.n, a.d * b.d), frac(a.d * b.n, a.n * b.d), frac(a.n * b.d + 1, a.d * b.n), 대분수 ? frac(w * b.d + (a.n - w * a.d), a.d * b.n) : frac(a.n, b.n)]),
      tag: 'fractionDiv',
      strategy: 대분수 ? '(대분수)÷(분수)' : '분모가 다른 (분수)÷(분수)',
      hint: 대분수 ? '대분수를 가분수로 바꾼 다음, 나누는 분수의 분모와 분자를 바꾸어 곱해요.' : '통분하여 분자끼리 나누거나, 나누는 분수의 분모와 분자를 바꾸어 곱해요.',
      steps: [
        ...(대분수 ? [`${text(a)}=${글(a)}`] : []),
        `${글(a)}÷${글(b)}=${글(a)}×${b.d}/${b.n}=${a.n * b.d}/${a.d * b.n}`,
        ...(text(ans) !== `${a.n * b.d}/${a.d * b.n}` ? [`${a.n * b.d}/${a.d * b.n}=${text(ans)}`] : []),
      ],
      misconceptionTip: '분자끼리, 분모끼리 그냥 나누면 나누어떨어지지 않을 때가 많아요. 통분하거나 바꾸어 곱하세요.',
    };
  },
});

const 문장제: G5Family = {
  id: 'story',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 9);
    const b = 사이(next, 1, d - 1);
    const 병 = 사이(next, 2, 8);
    const a = b * 병;
    if (frac(b, d).d !== d) return null;
    const 전체 = frac(a, d);
    const 장면 = next(2) === 0;
    return {
      prompt: 장면
        ? `주스 ${text(전체)} L를 한 병에 ${b}/${d} L씩 나누어 담으려고 합니다. 병은 몇 개 필요할까요?`
        : `철사 ${text(전체)} m를 ${b}/${d} m씩 자르면 몇 도막이 될까요?`,
      answer: `${병}${장면 ? '개' : '도막'}`,
      wrongs: [병 + 1, 병 - 1 > 0 ? 병 - 1 : 병 + 2, 병 * 2, a].filter((x, i, xs) => x !== 병 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}${장면 ? '개' : '도막'}`),
      tag: 'fractionDiv',
      strategy: '포함제 분수의 나눗셈 문장제',
      hint: `${text(전체)} 안에 ${b}/${d}이(가) 몇 번 들어가는지 구해요.`,
      steps: [`${text(전체)}÷${b}/${d}=${a}/${d}÷${b}/${d}=${a}÷${b}=${병}`],
    };
  },
};

export const unit1Lesson62 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [같은분모(true), 문장제];
    case 2:
      return lv === '하' ? [같은분모(true), 몫1견주기('분수')] : [같은분모(true), 문장제, 몫1견주기('분수'), 분수어떤수('분수')];
    case 3:
      return [같은분모(false), 몫1견주기('분수'), 분수어떤수('분수')];
    case 4:
      return [자연수나누기('단위'), 문장제, 분수어떤수('분수')];
    case 5:
      return [자연수나누기('곱셈'), 분수잘못계산('분수'), 몫1견주기('분수')];
    case 6:
      return lv === '하' ? [다른분모(false), 분수어떤수('분수')] : [다른분모(false), 문장제, 분수카드나누기, 분수잘못계산('분수')];
    case 7:
      return lv === '하' ? [다른분모(true), 분수어떤수('분수')] : [다른분모(true), 분수카드나누기, 분수잘못계산('분수')];
    default:
      return null;
  }
};
