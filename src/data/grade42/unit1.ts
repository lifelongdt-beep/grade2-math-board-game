import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { mixedText } from '../grade5/fraction';
import { 고르개, 사이 } from '../grade11/common';
import { 분수네모, 분수문장제, 분수어떤수, 분수잘못계산, 분수카드 } from '../thinking/fractionDecimal';

// ════════════════════════════════════════════════════════════════════
// 4-2 1단원 분수의 덧셈과 뺄셈 (분모가 같은 분수)
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / (진분수)+(진분수) / (대분수)+(대분수) ⑴
// (받아올림 없음) / ⑵(분수 부분의 합이 가분수) / (분수)-(분수) /
// (자연수)-(분수) / (대분수)-(대분수)(받아내림 있음)
//
// 지도서가 못박은 것:
//   · 분모가 같은 분수만 다룹니다. 분모는 그대로 두고 분자끼리 계산합니다.
//   · 계산 결과가 가분수이면 대분수로 나타냅니다.
//   · 약분은 5학년에서 배우므로 결과를 기약분수로 고치지 않습니다.
//     4/8을 1/2로 적지 않습니다.
//
// 그래서 여기서는 분수를 (분자, 분모) 두 정수로만 들고 다니며 약분하지
// 않습니다. 대분수는 '1과 3/4'처럼 씁니다.
// ════════════════════════════════════════════════════════════════════

/** 분모 d인 분자 n을 교과서 꼴로 씁니다. 약분하지 않습니다. */
export const 분수글 = (n: number, d: number): string => {
  if (n % d === 0) return String(n / d);
  if (n < d) return `${n}/${d}`;
  return mixedText(Math.floor(n / d), n % d, d);
};
/** 대분수를 쓴 그대로(가분수로 바꾸지 않은 채) 적습니다. */
const 대분수 = (w: number, n: number, d: number) => (w === 0 ? `${n}/${d}` : mixedText(w, n, d));

const 다른것 = (answer: string, xs: string[]) => [...new Set(xs)].filter((x) => x !== answer);

// ── (진분수)±(진분수) ───────────────────────────────────────────────
const 진분수덧셈 = (넘침: 'no' | 'yes' | 'any'): G5Family => ({
  id: `proper-add-${넘침}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 12);
    const a = 사이(next, 1, d - 1);
    const b = 사이(next, 1, d - 1);
    const s = a + b;
    if (넘침 === 'no' && s >= d) return null;
    if (넘침 === 'yes' && s <= d) return null;
    const ans = 분수글(s, d);
    return {
      prompt: `${a}/${d}+${b}/${d}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [`${s}/${d + d}`, 분수글(s + 1, d), 분수글(Math.max(1, s - 1), d), `${s}/${d}` === ans ? 분수글(s, d + 1) : `${s}/${d}`]),
      tag: 'fractionAdd',
      strategy: '분모가 같은 진분수의 덧셈',
      hint: '분모는 그대로 두고 분자끼리 더해요.',
      steps: [`${a}/${d}+${b}/${d}=${s}/${d}`, s >= d && s % d !== 0 ? `${s}/${d}은(는) 가분수이므로 대분수로 나타내면 ${ans}입니다.` : `답은 ${ans}입니다.`],
      misconceptionTip: '분모끼리 더하면 안 돼요. 1/5+1/5은 2/10이 아니라 2/5예요.',
    };
  },
});

const 진분수뺄셈: G5Family = {
  id: 'proper-sub',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 12);
    const a = 사이(next, 2, d - 1);
    const b = 사이(next, 1, a - 1);
    if (b >= a) return null;
    const ans = `${a - b}/${d}`;
    return {
      prompt: `${a}/${d}-${b}/${d}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [분수글(a + b, d), `${a - b + 1}/${d}`, a - b > 1 ? `${a - b - 1}/${d}` : `${a - b}/${d + 1}`, `${a - b}/${d - 1}`]),
      tag: 'fractionAdd',
      strategy: '분모가 같은 진분수의 뺄셈',
      hint: '분모는 그대로 두고 분자끼리 빼요.',
      steps: [`${a}/${d}-${b}/${d}=${a - b}/${d}`],
      misconceptionTip: '분모끼리 빼면 0이 되어 버려요. 분모는 그대로 둬요.',
      minusIsOperator: true,
    };
  },
};

// ── (대분수)+(대분수) ───────────────────────────────────────────────
const 대분수덧셈 = (올림: boolean): G5Family => ({
  id: `mixed-add-${올림 ? 'c' : 'n'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 9);
    const w1 = 사이(next, 1, 5);
    const w2 = 사이(next, 1, 4);
    const a = 사이(next, 1, d - 1);
    const b = 사이(next, 1, d - 1);
    if (올림 ? a + b <= d : a + b >= d) return null;
    const 전체 = (w1 + w2) * d + a + b;
    const ans = 분수글(전체, d);
    const 올림안함 = 올림 ? mixedText(w1 + w2, a + b, d) : 분수글((w1 + w2) * d + a + b + 1, d);
    return {
      prompt: `${대분수(w1, a, d)}+${대분수(w2, b, d)}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [올림안함, 분수글(전체 + d, d), 분수글(전체 - 1, d), mixedText(w1 + w2, a + b, d + d)]),
      tag: 'fractionAdd',
      strategy: 올림 ? '분수 부분의 합이 가분수인 대분수의 덧셈' : '대분수의 덧셈',
      hint: '자연수는 자연수끼리, 분수는 분수끼리 더해요.',
      steps: [
        `자연수끼리: ${w1}+${w2}=${w1 + w2}`,
        `분수끼리: ${a}/${d}+${b}/${d}=${a + b}/${d}`,
        올림 ? `${a + b}/${d}=${분수글(a + b, d)}이므로 ${w1 + w2}+${분수글(a + b, d)}=${ans}입니다.` : `그러므로 ${ans}입니다.`,
      ],
      misconceptionTip: 올림 ? '분수 부분이 가분수가 되면 1만큼을 자연수 부분으로 올려요.' : '분모끼리는 더하지 않아요.',
    };
  },
});

// ── (자연수)-(분수) ─────────────────────────────────────────────────
const 자연수빼기: G5Family = {
  id: 'whole-sub',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 9);
    const w = 사이(next, lv === '하' ? 1 : 2, 6);
    const 대 = lv !== '하' && next(2) === 0;
    const bw = 대 ? 사이(next, 1, w - 1) : 0;
    const b = 사이(next, 1, d - 1);
    if (대 && bw >= w) return null;
    const 남은 = w * d - (bw * d + b);
    const ans = 분수글(남은, d);
    return {
      prompt: `${w}-${대분수(bw, b, d)}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [대분수(w - bw, b, d), 분수글(남은 + d, d), 분수글(Math.max(1, 남은 - 1), d), 분수글(남은 + 1, d)]),
      tag: 'fractionAdd',
      strategy: '(자연수)-(분수)',
      hint: `${w}에서 1만큼을 ${d}/${d}(으)로 바꾸어 빼요.`,
      steps: [`${w}=${대분수(w - 1, d, d)}(으)로 생각합니다.`, `${대분수(w - 1, d, d)}-${대분수(bw, b, d)}=${ans}`],
      misconceptionTip: '자연수에서 분자만 빼면 안 돼요. 1을 분모가 같은 분수로 바꿔요.',
      minusIsOperator: true,
    };
  },
};

// ── (대분수)-(대분수) ───────────────────────────────────────────────
const 대분수뺄셈 = (내림: boolean): G5Family => ({
  id: `mixed-sub-${내림 ? 'b' : 'n'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 9);
    const w1 = 사이(next, 2, 7);
    const w2 = 사이(next, 1, w1 - 1);
    const a = 사이(next, 1, d - 1);
    const b = 사이(next, 1, d - 1);
    if (내림 ? a >= b : a < b) return null;
    const 남은 = w1 * d + a - (w2 * d + b);
    if (남은 <= 0) return null;
    const ans = 분수글(남은, d);
    // 흔한 실수: 큰 분자에서 작은 분자를 거꾸로 뺍니다(3/5-4/5를 1/5로).
    const 거꾸로 = 내림 ? 대분수(w1 - w2, b - a, d) : 분수글(남은 + d, d);
    return {
      prompt: `${대분수(w1, a, d)}-${대분수(w2, b, d)}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [거꾸로, 분수글(남은 + 1, d), 분수글(Math.max(1, 남은 - 1), d), 분수글(남은 + d, d)]),
      tag: 'fractionAdd',
      strategy: 내림 ? '받아내림이 있는 대분수의 뺄셈' : '대분수의 뺄셈',
      hint: 내림 ? '빼지는 분수가 작으면 자연수 1을 분수로 바꾸어 빼요. 가분수로 바꾸어 빼도 돼요.' : '자연수는 자연수끼리, 분수는 분수끼리 빼요.',
      steps: 내림
        ? [`${대분수(w1, a, d)}=${대분수(w1 - 1, a + d, d)}(으)로 바꿉니다.`, `자연수끼리: ${w1 - 1}-${w2}=${w1 - 1 - w2}, 분수끼리: ${a + d}/${d}-${b}/${d}=${a + d - b}/${d}`, `그러므로 ${ans}입니다.`]
        : [`자연수끼리: ${w1}-${w2}=${w1 - w2}`, `분수끼리: ${a}/${d}-${b}/${d}=${a - b === 0 ? 0 : `${a - b}/${d}`}`, `그러므로 ${ans}입니다.`],
      misconceptionTip: '분자끼리 뺄 수 없을 때 작은 수에서 큰 수를 거꾸로 빼면 안 돼요.',
      minusIsOperator: true,
    };
  },
});

const 가분수대분수: G5Family = {
  id: 'improper-to-mixed',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 9);
    const w = 사이(next, 1, 4);
    const r = 사이(next, 1, d - 1);
    const n = w * d + r;
    const ans = mixedText(w, r, d);
    return {
      prompt: `${n}/${d}을(를) 대분수로 나타내면 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [mixedText(w + 1, r, d), mixedText(w, r + 1 < d ? r + 1 : r - 1, d), mixedText(r, w, d), mixedText(w > 1 ? w - 1 : w + 2, r, d)]),
      tag: 'fractionAdd',
      strategy: '가분수를 대분수로 나타내기',
      hint: `${d}/${d}이(가) 1이에요. ${n}/${d}에 1이 몇 번 들어 있나요?`,
      steps: [`${n}÷${d}=${w} … ${r}`, `그러므로 ${ans}입니다.`],
    };
  },
};

const 문장제: G5Family = {
  id: 'story',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 4, 9);
    const w1 = 사이(next, 1, 4);
    const a = 사이(next, 1, d - 1);
    const b = 사이(next, 1, d - 1);
    const 더 = next(2) === 0;
    const 이름 = ['우유', '주스', '물'][next(3)];
    if (더) {
      const 전체 = w1 * d + a + b;
      const ans = 분수글(전체, d);
      return {
        prompt: `${이름}이(가) ${대분수(w1, a, d)} L 있었는데 ${b}/${d} L를 더 부었습니다. ${이름}은(는) 모두 몇 L일까요?`,
        answer: `${ans} L`,
        wrongs: 다른것(`${ans} L`, [`${분수글(전체 + 1, d)} L`, `${분수글(Math.abs(w1 * d + a - b) || 1, d)} L`, `${mixedText(w1, a + b, d)} L`, `${분수글(전체 + d, d)} L`]),
        tag: 'fractionAdd',
        strategy: '분수의 덧셈 문장제',
        hint: '더 부었으니 덧셈이에요.',
        steps: [`${대분수(w1, a, d)}+${b}/${d}=${ans}`],
      };
    }
    const 전체 = w1 * d + a;
    if (b >= 전체) return null;
    const ans = 분수글(전체 - b, d);
    return {
      prompt: `${이름}이(가) ${대분수(w1, a, d)} L 있었는데 ${b}/${d} L를 마셨습니다. 남은 ${이름}은(는) 몇 L일까요?`,
      answer: `${ans} L`,
      wrongs: 다른것(`${ans} L`, [`${분수글(전체 + b, d)} L`, `${분수글(전체 - b + 1, d)} L`, `${분수글(Math.max(1, 전체 - b - 1), d)} L`, `${mixedText(w1, Math.abs(a - b) || 1, d)} L`]),
      tag: 'fractionAdd',
      strategy: '분수의 뺄셈 문장제',
      hint: '마시고 남은 양이니 뺄셈이에요.',
      steps: [`${대분수(w1, a, d)}-${b}/${d}=${ans}`],
      minusIsOperator: true,
    };
  },
};

const 생각 = {
  진어떤수: 분수어떤수('4-2-1-p', 1),
  대어떤수: 분수어떤수('4-2-1-m', 4),
  잘못: 분수잘못계산('4-2-1', 4),
  카드: 분수카드('4-2-1'),
  문장제: 분수문장제('4-2-1'),
  네모: 분수네모('4-2-1'),
};

export const unit1Lesson42 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  // 계산만 되풀이하지 않게 거꾸로 구하기·잘못 계산 고치기·수 카드·□ 범위·
  // 두 단계 문장제를 차시마다 섞습니다.
  switch (lessonNo) {
    case 1:
      return [진분수덧셈('no'), 진분수뺄셈, 가분수대분수];
    case 2:
      return lv === '하' ? [진분수덧셈('no'), 생각.진어떤수] : lv === '중' ? [진분수덧셈('any'), 가분수대분수, 생각.진어떤수, 생각.네모] : [진분수덧셈('yes'), 문장제, 생각.진어떤수, 생각.네모];
    case 3:
      return lv === '하' ? [대분수덧셈(false), 생각.대어떤수] : [대분수덧셈(false), 생각.대어떤수, 생각.카드];
    case 4:
      return lv === '하' ? [대분수덧셈(true), 가분수대분수, 생각.대어떤수] : [대분수덧셈(true), 문장제, 생각.카드, 생각.잘못];
    case 5:
      return lv === '상' ? [진분수뺄셈, 대분수뺄셈(false), 문장제, 생각.잘못, 생각.네모] : [진분수뺄셈, 대분수뺄셈(false), 생각.대어떤수];
    case 6:
      return lv === '하' ? [자연수빼기, 생각.대어떤수] : [자연수빼기, 생각.대어떤수, 생각.문장제];
    case 7:
      return lv === '하' ? [대분수뺄셈(true), 생각.문장제] : [대분수뺄셈(true), 문장제, 생각.문장제, 생각.카드, 생각.잘못];
    default:
      return null;
  }
};
