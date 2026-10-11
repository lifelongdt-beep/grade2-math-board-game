import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun, i as 이가붙임 } from '../grade5/util';
import { 고르개, 물건들, 사이, 수보기 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 1-2 4단원 덧셈과 뺄셈(2)
// ────────────────────────────────────────────────────────────────────
// 단원 전개 계획:
//   1 단원 도입                — (십)+(몇), (십)-(몇) 확인
//   2 덧셈을 알아볼까요        — 첨가·합병, 자신의 방법으로
//   3 덧셈을 해 볼까요         — (몇)+(몇)=(십몇), 10을 만들어 더하기
//   4 여러 가지 덧셈을 해 볼까요 — 더하는 수가 1씩 커지면 합도 1씩 커짐
//   5 뺄셈을 알아볼까요        — 제거·비교, 자신의 방법으로
//   6 뺄셈을 해 볼까요         — (십몇)-(몇)=(십), (십몇)-(몇)=(몇)
//   7 여러 가지 뺄셈을 해 볼까요 — 빼는 수가 1씩 커지면 차는 1씩 작아짐
//
// 유의 사항:
//   · 10개씩 묶음과 낱개로 나타내어 계산 원리를 탐구합니다(십 배열판 두 개).
//   · 첨가와 합병, 제거와 비교 상황을 모두 다룹니다.
// ════════════════════════════════════════════════════════════════════

/** 합이 11~18인 한 자리 수 두 개입니다. */
const 받아올림덧셈 = (next: (b: number) => number) => {
  for (let t = 0; t < 50; t += 1) {
    const a = 사이(next, 2, 9);
    const b = 사이(next, 2, 9);
    if (a + b >= 11) return { a, b, s: a + b };
  }
  return { a: 8, b: 5, s: 13 };
};

/** (십몇)-(몇)=(몇): 받아내림이 있는 뺄셈입니다. */
const 받아내림뺄셈 = (next: (b: number) => number) => {
  const { a, b, s } = 받아올림덧셈(next);
  return { m: s, n: b, d: a };
};

const 두판 = (a: number, b: number) => ({
  kind: 'ten-frame' as const,
  label: `바둑돌 ${a}개와 ${b}개`,
  frames: 2,
  fills: [{ count: a, color: 'teal' as const }, { count: b, color: 'orange' as const }],
});

// ── 도입: (십)+(몇), (십몇)-(몇)=(십) ───────────────────────────────
const 도입: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = 고르개(seed);
    const k = 사이(next, 1, 9);
    const plus = next(2) === 0;
    return plus
      ? {
          prompt: `10+${eun(String(k))} 얼마일까요?`,
          answer: String(10 + k),
          wrongs: 수보기(10 + k, [k, 10 + k + 1, 10 + k - 1, 10 - k], 0, 19),
          tag: 'addition',
          strategy: '(십)+(몇)',
          hint: '10개씩 묶음 1개와 낱개 몇 개인 수예요.',
          steps: [`10과 ${k}을(를) 모으면 ${10 + k}입니다.`],
        }
      : {
          prompt: `${10 + k}-${eun(String(k))} 얼마일까요?`,
          answer: '10',
          wrongs: 수보기(10, [k, 10 + k, 9, 11], 0, 19),
          tag: 'subtraction',
          strategy: '(십몇)-(몇)=(십)',
          hint: '낱개를 모두 덜어 내면 10개씩 묶음만 남아요.',
          steps: [`${10 + k}은(는) 10과 ${k}입니다.`, `낱개 ${k}을(를) 빼면 10이 남습니다.`],
          minusIsOperator: true,
        };
  },
};

// ── 덧셈 ────────────────────────────────────────────────────────────
const 덧셈그림: G5Family = {
  id: 'add-pic',
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, s } = 받아올림덧셈(next);
    const 합병 = next(2) === 0;
    const t = 물건들[next(물건들.length)];
    return {
      prompt: 합병
        ? `흰 바둑돌 ${a}개와 검은 바둑돌 ${b}개가 있습니다. 바둑돌은 모두 몇 개일까요?`
        : `${t.이름} ${a}${t.단위}${이가(`${a}${t.단위}`)} 있었는데 ${b}${t.단위}${이가(`${b}${t.단위}`)} 더 생겼습니다. ${eun(t.이름)} 모두 몇 ${t.단위}일까요?`,
      answer: `${s}${합병 ? '개' : t.단위}`,
      wrongs: [s + 1, s - 1, s - 10, a + b + 10].filter((v) => v > 0 && v !== s).map((v) => `${v}${합병 ? '개' : t.단위}`),
      tag: 'addition',
      strategy: 합병 ? '합하여 모두 몇인지 구하기' : '더 생겨서 모두 몇인지 구하기',
      hint: '첫째 판을 먼저 10개로 채우고 남은 것을 세어 보세요.',
      steps: [`${a}+${b}을(를) 계산합니다.`, `${a}에 ${10 - a}을(를) 더하면 10이고, 남은 ${b - (10 - a)}을(를) 더하면 ${s}입니다.`],
      misconceptionTip: '10을 넘으면 10개씩 묶음 1개와 낱개로 나타내요.',
      visual: 두판(a, b),
    };
  },
};

function 이가(word: string) {
  return 이가붙임(word).slice(word.length);
}

const 덧셈계산 = (picture: boolean): G5Family => ({
  id: `add-calc-${picture ? 'p' : 'n'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, s } = 받아올림덧셈(next);
    return {
      prompt: `${a}+${eun(String(b))} 얼마일까요?`,
      answer: String(s),
      wrongs: 수보기(s, [s - 10, s + 1, s - 1, s + 10], 0, 30),
      tag: 'addition',
      strategy: '10을 만들어 더하기',
      hint: `${b}을(를) 갈라 ${a}과(와) 10을 만들어 보세요.`,
      steps: [`${b}을(를) ${10 - a}과(와) ${b - (10 - a)}(으)로 가릅니다.`, `${a}+${10 - a}=10, 10+${b - (10 - a)}=${s}입니다.`],
      misconceptionTip: '받아올린 10을 빠뜨려 낱개만 쓰면 안 돼요.',
      ...(picture ? { visual: 두판(a, b) } : {}),
    };
  },
});

const 가르기과정: G5Family = {
  id: 'add-split-step',
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, s } = 받아올림덧셈(next);
    const need = 10 - a;
    const rest = b - need;
    return {
      prompt: `${a}+${b}을(를) 계산하는 과정입니다. □에 알맞은 수는? ① ${b}을(를) ${need}과(와) □(으)로 가릅니다. ② ${a}+${need}=10 ③ 10+□=${s}`,
      answer: String(rest),
      wrongs: 수보기(rest, [need, rest + 1, s, b], 0, 18),
      tag: 'addition',
      strategy: '10을 만들어 더하는 과정',
      hint: `${a}에 몇을 더해야 10이 되는지 먼저 보세요.`,
      steps: [`${a}+${need}=10이므로 ${b}을(를) ${need}과(와) ${rest}(으)로 가릅니다.`, `10+${rest}=${s}이므로 □는 ${rest}입니다.`],
    };
  },
};

const 여러덧셈: G5Family = {
  id: 'add-pattern',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 4, 9);
    const b0 = 사이(next, Math.max(2, 11 - a), 7);
    const rows = [0, 1, 2].map((k) => ({ b: b0 + k, s: a + b0 + k }));
    const ans = rows[2].s;
    return {
      prompt: `${a}+${b0}=${rows[0].s}, ${a}+${b0 + 1}=${rows[1].s}입니다. ${a}+${eun(String(b0 + 2))} 얼마일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [rows[1].s, ans + 1, ans - 10, ans + 2], 0, 30),
      tag: 'addition',
      strategy: '더하는 수와 합의 관계',
      hint: '더하는 수가 1 커지면 합은 어떻게 될까요?',
      steps: ['더하는 수가 1씩 커지면 합도 1씩 커집니다.', `${rows[1].s}보다 1 큰 ${ans}입니다.`],
    };
  },
};

const 합같은식: G5Family = {
  id: 'add-same',
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, s } = 받아올림덧셈(next);
    // 합이 같은 다른 식 하나와 합이 1 다른 식 셋입니다.
    let c = a + 1 <= 9 && b - 1 >= 2 ? a + 1 : a - 1;
    let d = s - c;
    if (d > 9 || d < 2 || c === b) { c = b; d = a; }
    const 정답 = `${c}+${d}`;
    const 틀린 = [`${a}+${b + 1}`, `${a + 1}+${b + 1}`, `${a - 1}+${b}`].filter((w) => w !== 정답);
    return {
      prompt: `${a}+${b}과(와) 합이 같은 식은 어느 것일까요?`,
      answer: 정답,
      wrongs: 틀린,
      tag: 'addition',
      strategy: '합이 같은 식 찾기',
      hint: '더해지는 수가 1 커지고 더하는 수가 1 작아지면 합은 같아요.',
      steps: [`${a}+${b}=${s}이고 ${정답}=${s}입니다.`, `그러므로 합이 같은 식은 ${정답}입니다.`],
    };
  },
};

// ── 뺄셈 ────────────────────────────────────────────────────────────
const 뺄셈그림: G5Family = {
  id: 'sub-pic',
  make: (seed) => {
    const next = 고르개(seed);
    const { m, n, d } = 받아내림뺄셈(next);
    const 비교 = next(2) === 0;
    return {
      prompt: 비교
        ? `흰 바둑돌이 ${m}개, 검은 바둑돌이 ${n}개 있습니다. 흰 바둑돌은 검은 바둑돌보다 몇 개 더 많을까요?`
        : `바둑돌 ${m}개 중에서 ${n}개를 덜어 냈습니다. 남은 바둑돌은 몇 개일까요?`,
      answer: `${d}개`,
      wrongs: [d + 1, d - 1, d + 10, m + n].filter((v) => v > 0 && v !== d).map((v) => `${v}개`),
      tag: 'subtraction',
      strategy: 비교 ? '몇 개 더 많은지 구하기' : '덜어 내고 남은 것 구하기',
      hint: 비교 ? '하나씩 짝지어 남는 것을 세어 보세요.' : '낱개를 먼저 덜어 내고 10개 중에서 나머지를 덜어 내 보세요.',
      steps: [`${m}-${n}을(를) 계산합니다.`, `${m}-${n}=${d}이므로 ${d}개입니다.`],
      misconceptionTip: '‘더 많다’라는 말이 있어도 차이를 구하는 것이니 빼요.',
      minusIsOperator: true,
      visual: { kind: 'ten-frame', label: `바둑돌 ${m}개`, frames: 2, fills: [{ count: m, color: 'teal' }], ...(비교 ? {} : { crossed: n }) },
    };
  },
};

const 뺄셈계산 = (kind: '십' | '몇'): G5Family => ({
  id: `sub-calc-${kind}`,
  make: (seed) => {
    const next = 고르개(seed);
    if (kind === '십') {
      const k = 사이(next, 1, 9);
      return {
        prompt: `${10 + k}-${eun(String(k))} 얼마일까요?`,
        answer: '10',
        wrongs: 수보기(10, [k, 10 + k, 0, 11], 0, 19),
        tag: 'subtraction',
        strategy: '(십몇)-(몇)=(십)',
        hint: '낱개를 모두 덜어 내면 무엇이 남을까요?',
        steps: [`${10 + k}은(는) 10과 ${k}입니다.`, `낱개 ${k}을(를) 모두 빼면 10이 남습니다.`],
        minusIsOperator: true,
      };
    }
    const { m, n, d } = 받아내림뺄셈(next);
    const ones = m - 10;
    return {
      prompt: `${m}-${eun(String(n))} 얼마일까요?`,
      answer: String(d),
      wrongs: 수보기(d, [n - ones, d + 10, d + 1, d - 1], 0, 19),
      tag: 'subtraction',
      strategy: '(십몇)-(몇)=(몇)',
      hint: `${n}을(를) ${ones}과(와) ${n - ones}(으)로 갈라 차례로 빼 보세요.`,
      steps: [`${m}-${ones}=10입니다.`, `10-${n - ones}=${d}입니다.`, `그러므로 ${m}-${n}=${d}입니다.`],
      misconceptionTip: '낱개끼리 큰 수에서 작은 수를 빼면 안 돼요(13-7을 7-3으로 하면 안 돼요).',
      minusIsOperator: true,
    };
  },
});

const 뺄셈과정: G5Family = {
  id: 'sub-split-step',
  make: (seed) => {
    const next = 고르개(seed);
    const { m, n, d } = 받아내림뺄셈(next);
    const ones = m - 10;
    const rest = n - ones;
    return {
      prompt: `${m}-${n}을(를) 계산하는 과정입니다. □에 알맞은 수는? ① ${n}을(를) ${ones}과(와) □(으)로 가릅니다. ② ${m}-${ones}=10 ③ 10-□=${d}`,
      answer: String(rest),
      wrongs: 수보기(rest, [ones, rest + 1, d, n], 0, 18),
      tag: 'subtraction',
      strategy: '10을 만들어 빼는 과정',
      hint: `${m}에서 몇을 빼면 10이 되는지 먼저 보세요.`,
      steps: [`${m}-${ones}=10이므로 ${n}을(를) ${ones}과(와) ${rest}(으)로 가릅니다.`, `10-${rest}=${d}이므로 □는 ${rest}입니다.`],
    };
  },
};

const 여러뺄셈: G5Family = {
  id: 'sub-pattern',
  make: (seed) => {
    const next = 고르개(seed);
    const m = 사이(next, 13, 17);
    const n0 = 사이(next, m - 9, 7);
    const ans = m - n0 - 2;
    if (n0 + 2 > 9) return null;
    return {
      prompt: `${m}-${n0}=${m - n0}, ${m}-${n0 + 1}=${m - n0 - 1}입니다. ${m}-${eun(String(n0 + 2))} 얼마일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [m - n0 - 1, ans + 2, ans - 1, ans + 10], 0, 19),
      tag: 'subtraction',
      strategy: '빼는 수와 차의 관계',
      hint: '빼는 수가 1 커지면 차는 어떻게 될까요?',
      steps: ['빼는 수가 1씩 커지면 차는 1씩 작아집니다.', `${m - n0 - 1}보다 1 작은 ${ans}입니다.`],
      misconceptionTip: '빼는 수가 커지면 차는 작아져요.',
      minusIsOperator: true,
    };
  },
};

const 차같은식: G5Family = {
  id: 'sub-same',
  make: (seed) => {
    const next = 고르개(seed);
    const { m, n, d } = 받아내림뺄셈(next);
    if (m + 1 > 18 || n + 1 > 9) return null;
    const 정답 = `${m + 1}-${n + 1}`;
    const 틀린 = [`${m + 1}-${n}`, `${m}-${n + 1}`, `${m - 1}-${n + 1}`];
    return {
      prompt: `${m}-${n}과(와) 차가 같은 식은 어느 것일까요?`,
      answer: 정답,
      wrongs: 틀린,
      tag: 'subtraction',
      strategy: '차가 같은 식 찾기',
      hint: '빼지는 수와 빼는 수가 똑같이 1씩 커지면 차는 같아요.',
      steps: [`${m}-${n}=${d}이고 ${정답}=${d}입니다.`, `그러므로 차가 같은 식은 ${정답}입니다.`],
      minusIsOperator: true,
    };
  },
};

export const unit4Lesson12 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [도입];
    case 2:
      if (lv === '상') return [덧셈그림, 덧셈계산(false)];
      return [덧셈그림, 덧셈계산(true)];
    case 3:
      if (lv === '하') return [덧셈계산(true), 덧셈계산(false)];
      if (lv === '중') return [덧셈계산(false), 가르기과정];
      return [가르기과정, 덧셈계산(false)];
    case 4:
      if (lv === '하') return [여러덧셈, 덧셈계산(false)];
      return [여러덧셈, 합같은식];
    case 5:
      if (lv === '상') return [뺄셈그림, 뺄셈계산('몇')];
      return [뺄셈그림];
    case 6:
      if (lv === '하') return [뺄셈계산('십'), 뺄셈계산('몇')];
      if (lv === '중') return [뺄셈계산('몇'), 뺄셈과정];
      return [뺄셈과정, 뺄셈계산('몇')];
    case 7:
      if (lv === '하') return [여러뺄셈, 뺄셈계산('몇')];
      return [여러뺄셈, 차같은식];
    default:
      return null;
  }
};
