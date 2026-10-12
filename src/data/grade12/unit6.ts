import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun } from '../grade5/util';
import { 고르개, 사이, 수보기 } from '../grade11/common';
import { 두단계이야기, 빈칸셈, 식관계 } from '../grade1/thinking';

// ════════════════════════════════════════════════════════════════════
// 1-2 6단원 덧셈과 뺄셈(3)
// ────────────────────────────────────────────────────────────────────
// 단원 전개 계획:
//   1 단원 도입               — (몇)+(몇)=(십몇), (십몇)-(몇)=(몇)
//   2 덧셈을 알아볼까요       — 받아올림 없는 (몇십)+(몇), (몇십)+(몇십),
//                               (몇십몇)+(몇), (몇십몇)+(몇십몇)
//   3 뺄셈을 알아볼까요       — 받아내림 없는 (몇십몇)-(몇), (몇십)-(몇십),
//                               (몇십몇)-(몇십몇)
//   4 덧셈과 뺄셈을 해 볼까요 — 이야기를 식으로
//
// 유의 사항:
//   · 받아올림과 받아내림이 없습니다. 10개씩 묶음끼리, 낱개끼리
//     계산합니다. 합은 99 이하입니다.
//   · 여러 가지 방법을 지나치게 형식화하지 않습니다.
// ════════════════════════════════════════════════════════════════════

type 꼴 = 'T+O' | 'T+T' | 'TO+O' | 'TO+TO';
type 뺄꼴 = 'TO-O' | 'T-T' | 'TO-TO';

const 덧셈수 = (next: (b: number) => number, kind: 꼴) => {
  const t1 = 사이(next, 1, 8);
  const o1 = kind === 'T+O' || kind === 'T+T' ? 0 : 사이(next, 1, 8);
  const a = t1 * 10 + o1;
  const t2 = kind === 'T+O' || kind === 'TO+O' ? 0 : 사이(next, 1, 9 - t1);
  const o2 = kind === 'T+T' ? 0 : 사이(next, 1, 9 - o1);
  const b = t2 * 10 + o2;
  return { a, b, s: a + b };
};

const 뺄셈수 = (next: (b: number) => number, kind: 뺄꼴) => {
  const t1 = 사이(next, 2, 9);
  const o1 = kind === 'T-T' ? 0 : 사이(next, 1, 9);
  const a = t1 * 10 + o1;
  const t2 = kind === 'TO-O' ? 0 : 사이(next, 1, t1 - 1);
  const o2 = kind === 'T-T' ? 0 : 사이(next, 1, o1);
  const b = t2 * 10 + o2;
  return { a, b, d: a - b };
};

const 덧셈 = (kinds: 꼴[]): G5Family => ({
  id: `add2-${kinds.join('')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const kind = kinds[next(kinds.length)];
    const { a, b, s } = 덧셈수(next, kind);
    if (s > 99) return null;
    const ta = Math.floor(a / 10), oa = a % 10, tb = Math.floor(b / 10), ob = b % 10;
    return {
      prompt: `${a}+${eun(String(b))} 얼마일까요?`,
      answer: String(s),
      // 자리를 맞추지 않고 더한 값(32+5를 82로)이 가장 흔한 실수입니다.
      wrongs: 수보기(s, [oa === 0 && tb === 0 ? ta + ob : (ta + ob) * 10 + oa, s + 10, s - 1, s + 1, ta + tb + oa + ob], 0, 99),
      tag: 'addition',
      strategy: '10개씩 묶음끼리, 낱개끼리 더하기',
      hint: '10개씩 묶음은 묶음끼리, 낱개는 낱개끼리 더해 보세요.',
      steps: [`10개씩 묶음: ${ta}+${tb}=${ta + tb}`, `낱개: ${oa}+${ob}=${oa + ob}`, `그러므로 ${a}+${b}=${s}입니다.`],
      misconceptionTip: '낱개를 10개씩 묶음과 더하면 안 돼요. 자리를 맞추어 더해요.',
    };
  },
});

const 뺄셈 = (kinds: 뺄꼴[]): G5Family => ({
  id: `sub2-${kinds.join('')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const kind = kinds[next(kinds.length)];
    const { a, b, d } = 뺄셈수(next, kind);
    const ta = Math.floor(a / 10), oa = a % 10, tb = Math.floor(b / 10), ob = b % 10;
    return {
      prompt: `${a}-${eun(String(b))} 얼마일까요?`,
      answer: String(d),
      wrongs: 수보기(d, [kind === 'TO-O' ? (ta - ob) * 10 + oa : d + 10, d - 10, d + 1, a + b], 0, 99),
      tag: 'subtraction',
      strategy: '10개씩 묶음끼리, 낱개끼리 빼기',
      hint: '10개씩 묶음은 묶음끼리, 낱개는 낱개끼리 빼 보세요.',
      steps: [`10개씩 묶음: ${ta}-${tb}=${ta - tb}`, `낱개: ${oa}-${ob}=${oa - ob}`, `그러므로 ${a}-${b}=${d}입니다.`],
      misconceptionTip: '낱개를 10개씩 묶음에서 빼면 안 돼요. 자리를 맞추어 빼요.',
      minusIsOperator: true,
    };
  },
});

const 문장 = (kinds: number[]): G5Family => ({
  id: `word-${kinds.join('')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const kind = kinds[next(kinds.length)];
    if (kind === 0) {
      const { a, b, s } = 덧셈수(next, 'TO+TO');
      if (s > 99) return null;
      return {
        prompt: `줄넘기를 어제 ${a}번, 오늘 ${b}번 넘었습니다. 이틀 동안 모두 몇 번 넘었을까요?`,
        answer: `${s}번`,
        wrongs: [s + 10, s - 10, Math.abs(a - b), s + 1].filter((v) => v > 0 && v < 100 && v !== s).map((v) => `${v}번`),
        tag: 'addition',
        strategy: '모두 몇인지 구하는 덧셈',
        hint: '‘모두’를 물으면 더해요.',
        steps: [`${a}+${b}을(를) 계산합니다.`, `${a}+${b}=${s}이므로 ${s}번입니다.`],
      };
    }
    if (kind === 1) {
      const { a, b, d } = 뺄셈수(next, 'TO-TO');
      return {
        prompt: `딱지가 ${a}장 있었는데 ${b}장을 친구에게 주었습니다. 남은 딱지는 몇 장일까요?`,
        answer: `${d}장`,
        wrongs: [d + 10, a + b, d + 1, b].filter((v) => v > 0 && v < 100 && v !== d).map((v) => `${v}장`),
        tag: 'subtraction',
        strategy: '남은 것을 구하는 뺄셈',
        hint: '남은 것을 물으면 빼요.',
        steps: [`${a}-${b}을(를) 계산합니다.`, `${a}-${b}=${d}이므로 ${d}장입니다.`],
        minusIsOperator: true,
      };
    }
    const { a, b, d } = 뺄셈수(next, 'TO-TO');
    return {
      prompt: `빨간 구슬이 ${a}개, 파란 구슬이 ${b}개 있습니다. 빨간 구슬은 파란 구슬보다 몇 개 더 많을까요?`,
      answer: `${d}개`,
      wrongs: [a + b, d + 10, d + 1, b].filter((v) => v > 0 && v < 100 && v !== d).map((v) => `${v}개`),
      tag: 'subtraction',
      strategy: '몇 개 더 많은지 구하는 뺄셈',
      hint: '두 수의 차이를 구해요.',
      steps: [`${a}-${b}을(를) 계산합니다.`, `${a}-${b}=${d}이므로 ${d}개입니다.`],
      misconceptionTip: '‘더 많다’라고 더하면 안 돼요. 차이를 구해요.',
      minusIsOperator: true,
    };
  },
});

const 알맞은식: G5Family = {
  id: 'which-expr',
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, s } = 덧셈수(next, 'TO+TO');
    if (s > 99) return null;
    const plus = next(2) === 0;
    return plus
      ? {
          prompt: `색종이가 ${a}장 있었는데 ${b}장을 더 샀습니다. 색종이는 모두 몇 장인지 구하는 식은 어느 것일까요?`,
          answer: `${a}+${b}`,
          wrongs: [`${Math.max(a, b)}-${Math.min(a, b)}`, `${s}+${b}`, `${s}-${a}`],
          tag: 'addition',
          strategy: '상황에 맞는 식 고르기',
          hint: '더 샀으면 늘어난 것이에요.',
          steps: [`늘어난 것이므로 덧셈식 ${a}+${b}입니다.`],
          minusIsOperator: true,
        }
      : {
          prompt: `색종이가 ${s}장 있었는데 ${b}장을 썼습니다. 남은 색종이는 몇 장인지 구하는 식은 어느 것일까요?`,
          answer: `${s}-${b}`,
          wrongs: [`${s}+${b}`, `${a}+${b}`, `${s}-${a}`],
          tag: 'subtraction',
          strategy: '상황에 맞는 식 고르기',
          hint: '썼으면 줄어든 것이에요.',
          steps: [`줄어든 것이므로 뺄셈식 ${s}-${b}입니다.`],
          minusIsOperator: true,
        };
  },
};

const 도입: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 3, 9);
    const b = 사이(next, 11 - a, 9);
    const plus = next(2) === 0;
    const s = a + b;
    return plus
      ? {
          prompt: `${a}+${eun(String(b))} 얼마일까요?`,
          answer: String(s),
          wrongs: 수보기(s, [s - 10, s + 1, s - 1, s + 10], 0, 30),
          tag: 'addition',
          strategy: '(몇)+(몇)=(십몇) 떠올리기',
          hint: '10을 만들어 더해 보세요.',
          steps: [`${a}+${b}=${s}입니다.`],
        }
      : {
          prompt: `${s}-${eun(String(b))} 얼마일까요?`,
          answer: String(a),
          wrongs: 수보기(a, [a + 1, a - 1, a + 10, b], 0, 19),
          tag: 'subtraction',
          strategy: '(십몇)-(몇)=(몇) 떠올리기',
          hint: '10을 만들어 빼 보세요.',
          steps: [`${s}-${b}=${a}입니다.`],
          minusIsOperator: true,
        };
  },
};

export const unit6Lesson12 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [도입];
    case 2:
      if (lv === '하') return [덧셈(['T+O', 'T+T']), 덧셈(['TO+O'])];
      if (lv === '중') return [덧셈(['TO+O', 'T+T']), 덧셈(['TO+TO']), 빈칸셈('1-2-6', '+', 99, 20)];
      return [덧셈(['TO+TO']), 문장([0]), 빈칸셈('1-2-6', '+', 99, 20)];
    case 3:
      if (lv === '하') return [뺄셈(['T-T']), 뺄셈(['TO-O'])];
      if (lv === '중') return [뺄셈(['TO-O', 'T-T']), 뺄셈(['TO-TO']), 빈칸셈('1-2-6', '-', 99, 20)];
      return [뺄셈(['TO-TO']), 문장([1, 2]), 빈칸셈('1-2-6', '-', 99, 20)];
    case 4:
      if (lv === '하') return [덧셈(['TO+TO']), 뺄셈(['TO-TO']), 식관계('1-2-6', 99)];
      return [문장([0, 1, 2]), 알맞은식, 두단계이야기('1-2-6', 99), 식관계('1-2-6', 99)];
    default:
      return null;
  }
};
