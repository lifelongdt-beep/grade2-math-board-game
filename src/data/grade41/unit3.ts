import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 끝0개수 } from './thinking';
import { 나머지생각, 네모범위, 두단계문장제, 수카드곱, 어떤수, 어림견주기, 잘못계산 } from '../thinking/integer';

// ════════════════════════════════════════════════════════════════════
// 4-1 3단원 곱셈과 나눗셈
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / (세 자리 수)×(몇십) / (세 자리 수)×(몇십몇)
// / 곱셈의 어림셈 / (두 자리 수)÷(두 자리 수) / 몫이 한 자리 수인
// (세 자리 수)÷(두 자리 수) / 내림이 없고 몫이 두 자리 수인 … / 내림이
// 있고 몫이 두 자리 수인 … / 나눗셈의 어림셈
//
// 지도서 예: 내림이 없는 286÷13=22(13×2=26처럼 몫의 각 자리와 나누는
// 수를 곱할 때 받아올림이 없습니다), 내림이 있는 840÷24=35(24×3=72,
// 24×5=120). 그래서 '내림 없음'은 나누는 수의 각 자리 숫자와 몫의 각
// 자리 숫자의 곱이 모두 10보다 작은 나눗셈으로 둡니다.
//
// 몫과 나머지는 3학년과 같이 '몫 … 나머지'로 씁니다. 나머지는 언제나
// 나누는 수보다 작습니다.
// ════════════════════════════════════════════════════════════════════

const 몫글 = (q: number, r: number) => (r === 0 ? String(q) : `${q} … ${r}`);
const 다른것 = (answer: string, xs: string[]) => [...new Set(xs)].filter((x) => x !== answer);

// ── 단원 도입: 3학년 복습 ───────────────────────────────────────────
const 복습: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = 고르개(seed);
    if (next(2) === 0) {
      const a = 사이(next, 112, 489);
      const b = 사이(next, 2, 9);
      const v = a * b;
      return {
        prompt: `${a}×${b}은(는) 얼마일까요?`,
        answer: String(v),
        wrongs: [v + 10, v - 10, v + 100, a * (b + 1)].filter((x) => x !== v).map(String),
        tag: 'multiplication',
        strategy: '(세 자리 수)×(한 자리 수) 떠올리기',
        hint: '일의 자리부터 곱하고 올림한 수를 더해요.',
        steps: [`${a}×${b}=${v}입니다.`],
      };
    }
    const d = 사이(next, 3, 9);
    const q = 사이(next, 11, Math.floor(99 / d));
    const r = 사이(next, 0, d - 1);
    const a = d * q + r;
    if (a > 99) return null;
    return {
      prompt: `${a}÷${d}의 몫과 나머지를 바르게 구한 것은 어느 것일까요?`,
      answer: 몫글(q, r),
      wrongs: 다른것(몫글(q, r), [몫글(q - 1, r + d), 몫글(q + 1, r), 몫글(q, r + 1), 몫글(q - 1, r)]),
      tag: 'division',
      strategy: '(두 자리 수)÷(한 자리 수) 떠올리기',
      hint: '나머지는 나누는 수보다 작아야 해요.',
      steps: [`${d}×${q}=${d * q}이고 ${a}-${d * q}=${r}입니다.`, `몫은 ${q}, 나머지는 ${r}입니다.`],
      minusIsOperator: true,
    };
  },
};

// ── 곱셈 ────────────────────────────────────────────────────────────
const 곱몇십: G5Family = {
  id: 'mul-tens',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 102, 899);
    const b = 사이(next, 2, 9) * 10;
    const v = a * b;
    return {
      prompt: `${a}×${b}은(는) 얼마일까요?`,
      answer: String(v),
      wrongs: [v / 10, v * 10, v + b * 10, v - 1000].filter((x) => x > 0 && x !== v).map(String),
      tag: 'multiplication',
      strategy: '(세 자리 수)×(몇)의 10배',
      hint: `${a}×${b / 10}을(를) 먼저 구하고 10배 하세요.`,
      steps: [`${a}×${b / 10}=${(a * b) / 10}입니다.`, `${a}×${b}은(는) 그 10배이므로 ${v}입니다.`],
      misconceptionTip: '몇십을 곱하면 곱의 끝에 0을 하나 붙여요.',
    };
  },
};

const 곱몇십몇: G5Family = {
  id: 'mul-2digit',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const a = 사이(next, 102, lv === '하' ? 399 : 899);
    const b = 사이(next, 1, lv === '하' ? 3 : 9) * 10 + 사이(next, 1, 9);
    const t = Math.floor(b / 10) * 10;
    const o = b % 10;
    const v = a * b;
    const 자리틀림 = a * Math.floor(b / 10) + a * o; // 몇십을 몇으로 곱한 실수
    return {
      prompt: `${a}×${b}은(는) 얼마일까요?`,
      answer: String(v),
      wrongs: [자리틀림, v + a, v - a, v + 1000].filter((x) => x > 0 && x !== v).map(String),
      tag: 'multiplication',
      strategy: '(세 자리 수)×(몇)과 (세 자리 수)×(몇십)을 더하기',
      hint: `${a}×${o}과(와) ${a}×${t}을(를) 따로 구해 더하세요.`,
      steps: [`${a}×${o}=${a * o}`, `${a}×${t}=${a * t}`, `${a * o}+${a * t}=${v}입니다.`],
      misconceptionTip: '십의 자리를 곱한 값은 한 자리 왼쪽에 써야 해요(몇십을 곱한 것이니까요).',
    };
  },
};

const 곱셈어림: G5Family = {
  id: 'mul-estimate',
  make: (seed) => {
    const next = 고르개(seed);
    const A = 사이(next, 2, 9) * 100;
    const B = 사이(next, 2, 9) * 10;
    const a = A + [-2, -1, 1, 2, 3][next(5)] * (next(2) === 0 ? 1 : 5);
    const b = B + [-1, 1, 2][next(3)];
    if (Math.round(a / 100) * 100 !== A || Math.round(b / 10) * 10 !== B) return null;
    const v = A * B;
    return {
      prompt: `${a}×${b}을(를) 어림셈으로 구하려고 합니다. 가장 알맞은 것은 어느 것일까요?`,
      answer: `약 ${A}×${B}=${v}`,
      wrongs: [`약 ${A}×${B}=${v / 10}`, `약 ${A}×${B}=${v * 10}`, `약 ${A / 100}×${B / 10}=${(A / 100) * (B / 10)}`],
      tag: 'estimate',
      strategy: '곱셈의 어림셈',
      hint: '곱해지는 수는 몇백으로, 곱하는 수는 몇십으로 어림하세요.',
      steps: [`${a}은(는) 약 ${A}, ${b}은(는) 약 ${B}입니다.`, `${A}×${B}=${v}이므로 약 ${v}입니다.`],
      misconceptionTip: '0의 개수를 세어 붙여야 해요. 몇백×몇십이면 0이 셋 이상이에요.',
    };
  },
};

// ── 나눗셈 ──────────────────────────────────────────────────────────
const 나눗셈문항 = (a: number, d: number, strategy: string, hint: string) => {
  const q = Math.floor(a / d);
  const r = a % d;
  const ans = 몫글(q, r);
  const wrongs = 다른것(ans, [몫글(q - 1, r + d), 몫글(q + 1, r), 몫글(q, (r + 1) % d === 0 ? r + 2 : r + 1), 몫글(q + 10, r), 몫글(q - 1, r)].filter((w) => !w.startsWith('0') && !w.startsWith('-')));
  return {
    prompt: `${a}÷${d}의 몫과 나머지를 바르게 구한 것은 어느 것일까요?`,
    answer: ans,
    wrongs: wrongs.slice(0, 4),
    tag: 'division' as const,
    strategy,
    hint,
    steps: [`${d}×${q}=${d * q}${r ? `이고 ${a}-${d * q}=${r}` : ''}입니다.`, r ? `몫은 ${q}, 나머지는 ${r}입니다.` : `몫은 ${q}이고 나누어떨어집니다.`, `확인: ${d}×${q}${r ? `+${r}` : ''}=${a}`],
    misconceptionTip: '나머지가 나누는 수보다 크거나 같으면 몫을 더 크게 해야 해요.',
    minusIsOperator: true,
  };
};

const 두자리나누기: G5Family = {
  id: 'div-2by2',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 사이(next, 11, 32);
    const q = 사이(next, 2, Math.floor(99 / d));
    const r = lv === '하' ? 0 : 사이(next, lv === '상' ? 1 : 0, d - 1);
    const a = d * q + r;
    if (a > 99 || q < 2) return null;
    return 나눗셈문항(a, d, '(두 자리 수)÷(두 자리 수)', `${d}에 몇을 곱해야 ${a}에 가까워지는지 어림해 보세요.`);
  },
};

const 몫한자리: G5Family = {
  id: 'div-3by2-1',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 사이(next, 12, 89);
    const q = 사이(next, 2, 9);
    const r = lv === '하' ? 0 : 사이(next, 0, d - 1);
    const a = d * q + r;
    if (a < 100 || a > 999 || a >= d * 10) return null;
    return 나눗셈문항(a, d, '몫이 한 자리 수인 (세 자리 수)÷(두 자리 수)', `${d}을(를) 몇십으로 어림하여 몫을 짐작해 보세요.`);
  },
};

/** 몫의 각 자리 숫자와 나누는 수의 각 자리 숫자의 곱이 모두 10보다 작은지 봅니다. */
const 내림없음 = (d: number, q: number) => {
  const ds = [Math.floor(d / 10), d % 10];
  const qs = [Math.floor(q / 10), q % 10];
  return ds.every((x) => qs.every((y) => x * y < 10));
};

const 몫두자리 = (내림: boolean): G5Family => ({
  id: `div-3by2-2-${내림 ? 'c' : 'n'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 사이(next, 11, 49);
    const q = 사이(next, 11, Math.floor(999 / d));
    if (q > 99 || 내림없음(d, q) === 내림) return null;
    const r = lv === '상' ? 사이(next, 0, d - 1) : 0;
    const a = d * q + r;
    if (a > 999) return null;
    return 나눗셈문항(a, d, `${내림 ? '내림이 있고' : '내림이 없고'} 몫이 두 자리 수인 (세 자리 수)÷(두 자리 수)`, `${String(a).slice(0, 2)}에 ${d}이(가) 몇 번 들어가는지부터 구하세요.`);
  },
});

const 몫자리수: G5Family = {
  id: 'quotient-digits',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 12, 79);
    const a = 사이(next, 100, 999);
    const 두자리 = Math.floor(a / 10) >= d;
    if (Math.floor(a / d) < 2) return null;
    return {
      prompt: `${a}÷${d}의 몫은 몇 자리 수일까요?`,
      answer: 두자리 ? '두 자리 수' : '한 자리 수',
      wrongs: [두자리 ? '한 자리 수' : '두 자리 수', '세 자리 수', '알 수 없습니다'],
      tag: 'division',
      strategy: '몫의 자리 수 알아보기',
      hint: `나누어지는 수의 앞 두 자리 ${Math.floor(a / 10)}이(가) ${d}보다 큰지 작은지 보세요.`,
      steps: [`${Math.floor(a / 10)}은(는) ${d}보다 ${두자리 ? '크거나 같으므로' : '작으므로'} 몫은 ${두자리 ? '두 자리 수' : '한 자리 수'}입니다.`, `실제로 몫은 ${Math.floor(a / d)}입니다.`],
    };
  },
};

const 확인식: G5Family = {
  id: 'div-check',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 12, 49);
    const q = 사이(next, 3, 25);
    const r = 사이(next, 1, d - 1);
    const a = d * q + r;
    if (a < 100 || a > 999) return null;
    return {
      prompt: `${a}÷${d}=${q} … ${r}을(를) 바르게 계산했는지 확인하는 식은 어느 것일까요?`,
      answer: `${d}×${q}+${r}=${a}`,
      wrongs: [`${d}×${r}+${q}=${d * r + q}`, `${d}×${q}-${r}=${d * q - r}`, `${a}×${d}+${r}=${a * d + r}`],
      tag: 'division',
      strategy: '나눗셈 결과 확인',
      hint: '(나누는 수)×(몫)+(나머지)=(나누어지는 수)예요.',
      steps: [`${d}×${q}=${d * q}`, `${d * q}+${r}=${a}이므로 바르게 계산했습니다.`],
      minusIsOperator: true,
    };
  },
};

const 나눗셈어림: G5Family = {
  id: 'div-estimate',
  make: (seed) => {
    const next = 고르개(seed);
    const B = 사이(next, 2, 9) * 10;
    const q = 사이(next, 2, 30);
    const A = B * q;
    if (A % 100 !== 0 || A > 900) return null;
    const a = A + [-3, -2, -1, 1, 2, 4][next(6)];
    const b = B + [-1, 1][next(2)];
    if (Math.round(a / 100) * 100 !== A || Math.round(b / 10) * 10 !== B) return null;
    return {
      prompt: `${a}÷${b}의 몫을 어림셈으로 구한 것으로 가장 알맞은 것은 어느 것일까요?`,
      answer: `약 ${q}`,
      wrongs: 다른것(`약 ${q}`, [`약 ${q * 10}`, `약 ${q + 10}`, `약 ${q * 100}`]),
      tag: 'estimate',
      strategy: '나눗셈의 어림셈',
      hint: '나누어지는 수는 몇백으로, 나누는 수는 몇십으로 어림하세요.',
      steps: [`${a}은(는) 약 ${A}, ${b}은(는) 약 ${B}입니다.`, `${A}÷${B}=${q}이므로 약 ${q}입니다.`],
    };
  },
};

// 계산을 여러 방향에서 쓰는 문항입니다(thinking/integer.ts).
const 생각 = {
  곱몇십어떤수: 어떤수('4-1-3-tens', '×', [102, 899], [2, 9], 10),
  곱어림견주기: 어림견주기('4-1-3-mul', '×', [110, 980], [12, 98]),
  곱네모: 네모범위('4-1-3-mul', [21, 89], [11, 40]),
  곱카드: 수카드곱('4-1-3', 3, 2),
  곱잘못: 잘못계산('4-1-3-mul', '×', [102, 899], [11, 99]),
  곱어떤수: 어떤수('4-1-3-mul', '×', [102, 899], [11, 99]),
  곱문장제: 두단계문장제('4-1-3', [102, 499], [11, 40]),
  두자리어떤수: 어떤수('4-1-3-div22', '÷', [2, 8], [11, 30]),
  두자리나머지: 나머지생각('4-1-3-div22', [31, 99], [11, 30]),
  나눔네모: 네모범위('4-1-3-div', [11, 30], [2, 8]),
  몫한자리잘못: 잘못계산('4-1-3-div32', '÷', [2, 9], [12, 60]),
  세자리나머지: 나머지생각('4-1-3-div32', [100, 999], [12, 60]),
  몫두자리어떤수: 어떤수('4-1-3-div32b', '÷', [11, 40], [11, 25]),
  나눔어림견주기: 어림견주기('4-1-3-div', '÷', [200, 990], [11, 49]),
};

export const unit3Lesson41 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  // 계산 절차만 되풀이하지 않도록, 차시마다 거꾸로 생각하기·잘못 계산한
  // 값 고치기·수 카드·어림 견주기·나머지의 뜻·문장제를 섞습니다.
  switch (lessonNo) {
    case 1:
      return [복습];
    case 2:
      return lv === '하' ? [곱몇십, 생각.곱몇십어떤수, 끝0개수] : [곱몇십, 생각.곱몇십어떤수, 끝0개수, 생각.곱어림견주기, 생각.곱네모];
    case 3:
      return lv === '하' ? [곱몇십몇, 곱몇십, 생각.곱어떤수, 생각.곱문장제] : [곱몇십몇, 생각.곱카드, 생각.곱잘못, 생각.곱문장제, 생각.곱어떤수];
    case 4:
      return [곱셈어림, 생각.곱어림견주기];
    case 5:
      return lv === '하' ? [두자리나누기, 생각.두자리어떤수] : [두자리나누기, 생각.두자리어떤수, 생각.두자리나머지, 생각.나눔네모];
    case 6:
      return lv === '하' ? [몫한자리, 생각.세자리나머지] : [몫한자리, 몫자리수, 생각.몫한자리잘못, 생각.세자리나머지];
    case 7:
      return lv === '상' ? [몫두자리(false), 확인식, 생각.몫두자리어떤수, 생각.세자리나머지] : [몫두자리(false), 생각.몫두자리어떤수, 확인식];
    case 8:
      return lv === '하' ? [몫두자리(true), 확인식, 생각.세자리나머지] : [몫두자리(true), 확인식, 몫자리수, 생각.몫한자리잘못, 생각.세자리나머지];
    case 9:
      return [나눗셈어림, 생각.나눔어림견주기];
    default:
      return null;
  }
};
