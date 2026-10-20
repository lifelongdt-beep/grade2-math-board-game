import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 1학년 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
// 1학년도 계산만 되풀이하면 '+ 기호가 보이면 더한다'만 남습니다.
// 지도서가 1학년에서 키우라는 것은 수 감각과 덧셈·뺄셈의 관계입니다.
//   · 빈칸이 있는 식(□+3=7): 덧셈과 뺄셈의 관계
//   · 더해서 같은 수가 되는 짝: 모으기·가르기의 여러 방법
//   · 두 수 사이의 수: 끝 수를 넣는지 따지기
//   · 두 단계로 찾는 수(○보다 1 큰 수보다 2 작은 수)
//   · 덧셈식을 보고 뺄셈식 만들기
//   · 수 카드로 가장 큰(작은) 몇십몇 만들기
//   · 두 단계 이야기(먹고 또 받기)
// 차시가 아는 수까지만 쓰도록 '최대'를 받습니다.
// ════════════════════════════════════════════════════════════════════

// 1-2 6단원은 받아올림·받아내림이 없는 두 자리 셈만 배웁니다. 20 넘는
// 수를 쓰는 문항은 자리마다 빼어지는(더해 10이 넘지 않는) 수만 고릅니다.
const 자리셈되나 = (큰: number, 작은: number) => 큰 < 20 || (큰 % 10 >= 작은 % 10 && Math.floor(큰 / 10) >= Math.floor(작은 / 10));

const 수보기 = (ans: number, xs: number[], 최대: number, 단위 = '') =>
  [...new Set(xs)].filter((x) => x >= 0 && x <= 최대 && x !== ans).slice(0, 3).map((x) => `${x}${단위}`);

/** □+a=b, a+□=b, a-□=b, □-a=b */
export const 빈칸셈 = (id: string, 연산: '+' | '-', 최대: number, 최소 = 1): G5Family => ({
  id: `${id}-blank-${연산}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 큰 = 사이(next, Math.max(2, 최소), 최대);
    const 작은 = 사이(next, 1, 큰 - 1);
    const 나머지 = 큰 - 작은;
    if (!자리셈되나(큰, 작은)) return null;
    const 앞 = next(2) === 0;
    if (연산 === '+') {
      // □+작은=큰 또는 작은+□=큰
      const 식 = 앞 ? `□+${작은}=${큰}` : `${작은}+□=${큰}`;
      return {
        prompt: `${식}에서 □ 안에 알맞은 수는 얼마일까요?`,
        answer: String(나머지),
        wrongs: 수보기(나머지, [큰 + 작은, 나머지 + 1, 나머지 - 1, 큰, 작은], 최대).concat([String(나머지 + 2)]).filter((x, i, xs) => xs.indexOf(x) === i).slice(0, 3),
        tag: 'addition',
        strategy: '덧셈과 뺄셈의 관계로 □ 구하기',
        hint: `${작은}에 얼마를 더해야 ${큰}이(가) 되는지 이어 세어 보세요.`,
        steps: [`${작은}에서 ${큰}까지 이어 세면 ${나머지}만큼입니다.`, `${큰}-${작은}=${나머지}이므로 □=${나머지}입니다.`],
        misconceptionTip: '□가 있는 덧셈식에서 두 수를 그냥 더하면 안 돼요.',
        minusIsOperator: true,
      };
    }
    // 큰-□=작은 또는 □-작은=나머지
    if (앞) {
      return {
        prompt: `${큰}-□=${작은}에서 □ 안에 알맞은 수는 얼마일까요?`,
        answer: String(나머지),
        wrongs: 수보기(나머지, [큰 + 작은, 나머지 + 1, 나머지 - 1, 작은], 최대).concat([String(나머지 + 2)]).filter((x, i, xs) => xs.indexOf(x) === i).slice(0, 3),
        tag: 'subtraction',
        strategy: '덧셈과 뺄셈의 관계로 □ 구하기',
        hint: `${큰}에서 얼마를 빼야 ${작은}이(가) 남는지 생각해 보세요.`,
        steps: [`${큰}-${나머지}=${작은}이므로 □=${나머지}입니다.`],
        minusIsOperator: true,
      };
    }
    return {
      prompt: `□-${작은}=${나머지}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(큰),
      wrongs: 수보기(큰, [나머지 - 작은, 큰 + 1, 큰 - 1, 작은, 나머지], 최대).concat([String(큰 - 2)]).filter((x, i, xs) => xs.indexOf(x) === i).slice(0, 3),
      tag: 'subtraction',
      strategy: '뺄셈을 덧셈으로 바꾸어 □ 구하기',
      hint: '처음 수는 빼고 남은 수와 뺀 수를 모은 것이에요.',
      steps: [`${나머지}+${작은}=${큰}이므로 □=${큰}입니다.`],
      misconceptionTip: '□-3=4에서 □는 4-3이 아니라 4+3이에요.',
      minusIsOperator: true,
    };
  },
});

/** 더해서 n이 되는 두 수의 짝 고르기 */
export const 합짝 = (id: string, 최대: number): G5Family => ({
  id: `${id}-pair`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 5, 최대);
    const a = 사이(next, 1, n - 1);
    const 답 = `${a}과(와) ${n - a}`;
    const 틀린: string[] = [];
    for (let t = 0; t < 30 && 틀린.length < 3; t += 1) {
      const x = 사이(next, 1, 최대 - 1);
      const y = 사이(next, 1, 최대 - 1);
      if (x + y === n || x + y > 최대 + 3) continue;
      const g = `${x}과(와) ${y}`;
      if (!틀린.includes(g)) 틀린.push(g);
    }
    if (틀린.length < 3) return null;
    return {
      prompt: `두 수를 모아서(더해서) ${n}이(가) 되는 것은 어느 것일까요?`,
      answer: 답,
      wrongs: 틀린,
      tag: 'addition',
      strategy: '더해서 같은 수가 되는 여러 짝 찾기',
      hint: '두 수를 더해 보거나, 한 수에서 이어 세어 보세요.',
      steps: [`${a}+${n - a}=${n}이므로 ${답}입니다.`],
    };
  },
});

/** a와 b 사이에 있는 수의 개수(두 끝 수는 넣지 않음) */
export const 사이개수 = (id: string, 최대: number): G5Family => ({
  id: `${id}-between`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 최대 - 3);
    const b = 사이(next, a + 2, Math.min(최대, a + 9));
    const v = b - a - 1;
    return {
      prompt: `${a}과(와) ${b} 사이에 있는 수는 모두 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: 수보기(v, [v + 1, v + 2, v - 1, b - a], 최대, '개'),
      tag: 'number',
      strategy: '두 수 사이의 수 세기',
      hint: `${a} 바로 다음 수부터 ${b} 바로 앞의 수까지 세어요.`,
      steps: [`${a}과(와) ${b} 사이의 수는 ${Array.from({ length: v }, (_, k) => a + 1 + k).join(', ')}입니다.`, `모두 ${v}개입니다.`],
      misconceptionTip: `사이에 있는 수에는 ${a}과(와) ${b}이(가) 들어가지 않아요.`,
    };
  },
});

/** ○보다 p만큼 더 큰 수보다 q만큼 더 작은 수 */
export const 두단계수 = (id: string, 최대: number, 단위: 1 | 10 = 1): G5Family => ({
  id: `${id}-two-step-${단위}`,
  make: (seed) => {
    const next = 고르개(seed);
    const p = 사이(next, 1, 2) * 단위;
    const q = 사이(next, 1, 3) * 단위;
    const a = 사이(next, q, 최대 - p);
    const v = a + p - q;
    if (v < 0 || v > 최대 || a + p > 최대) return null;
    return {
      prompt: `${a}보다 ${p}만큼 더 큰 수보다 ${q}만큼 더 작은 수는 얼마일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [a + p, a - q, a + p + q, v + 단위, v - 단위], 최대),
      tag: 'number',
      strategy: '두 단계로 수 찾기',
      hint: '먼저 앞부분의 수를 구하고, 그 수에서 다시 생각해요.',
      steps: [`${a}보다 ${p}만큼 더 큰 수는 ${a + p}입니다.`, `${a + p}보다 ${q}만큼 더 작은 수는 ${v}입니다.`],
      minusIsOperator: true,
    };
  },
});

/** 덧셈식을 보고 만들 수 있는 뺄셈식 */
export const 식관계 = (id: string, 최대: number): G5Family => ({
  id: `${id}-relation`,
  make: (seed) => {
    const next = 고르개(seed);
    const c = 사이(next, 3, 최대);
    const a = 사이(next, 1, c - 1);
    const b = c - a;
    if (a === b || !자리셈되나(c, a)) return null;
    const 답 = next(2) === 0 ? `${c}-${a}=${b}` : `${c}-${b}=${a}`;
    return {
      prompt: `${a}+${b}=${c}을(를) 보고 만들 수 있는 뺄셈식은 어느 것일까요?`,
      answer: 답,
      wrongs: [`${Math.max(a, b)}-${Math.min(a, b)}=${c}`, `${c}-${a}=${b + 1}`, `${c}+${a}=${b}`, `${a}+${c}=${b}`].filter((w, i, xs) => w !== 답 && xs.indexOf(w) === i).slice(0, 3),
      tag: 'subtraction',
      strategy: '덧셈과 뺄셈의 관계',
      hint: '전체에서 한 부분을 빼면 다른 부분이 남아요.',
      steps: [`${a}과(와) ${b}을(를) 모으면 ${c}입니다.`, `${c}에서 한 부분을 빼면 다른 부분이 남으므로 ${답}입니다.`],
      minusIsOperator: true,
    };
  },
});

/** 수 카드 세 장 중 두 장으로 만드는 가장 큰(작은) 몇십몇 */
export const 수카드몇십몇 = (id: string, 최대: number): G5Family => ({
  id: `${id}-cards`,
  make: (seed) => {
    const next = 고르개(seed);
    const 높은 = Math.min(9, Math.floor(최대 / 10));
    const 카드: number[] = [];
    while (카드.length < 3) {
      const c = 사이(next, 1, 9);
      if (!카드.includes(c)) 카드.push(c);
    }
    const 모든 = 카드.flatMap((t) => 카드.filter((o) => o !== t).map((o) => t * 10 + o)).filter((x) => x <= 최대);
    if (모든.length < 4 || Math.max(...카드) > 9 || 높은 < 1) return null;
    const 큰 = next(2) === 0;
    const v = 큰 ? Math.max(...모든) : Math.min(...모든);
    const 틀린 = [...new Set(모든.filter((x) => x !== v))].sort((x, y) => (큰 ? y - x : x - y)).slice(0, 3);
    if (틀린.length < 3) return null;
    return {
      prompt: `수 카드 ${카드.join(', ')} 가운데 2장을 골라 몇십몇을 만들려고 합니다. ${최대 < 99 ? `${최대}까지의 수 가운데 ` : ''}만들 수 있는 가장 ${큰 ? '큰' : '작은'} 수는 얼마일까요?`,
      answer: String(v),
      wrongs: 틀린.map(String),
      tag: 'placeValue',
      strategy: '10개씩 묶음의 수를 먼저 생각하여 수 만들기',
      hint: 큰 ? '10개씩 묶음 자리에 가장 큰 숫자를 놓아 보세요.' : '10개씩 묶음 자리에 가장 작은 숫자를 놓아 보세요.',
      steps: [`10개씩 묶음의 수가 ${큰 ? '클수록 큰' : '작을수록 작은'} 수입니다.`, `만들 수 있는 가장 ${큰 ? '큰' : '작은'} 수는 ${v}입니다.`],
      misconceptionTip: '낱개의 수보다 10개씩 묶음의 수가 더 중요해요.',
    };
  },
});

/** 두 단계 이야기: 있다가 먹고(주고) 또 받기 */
export const 두단계이야기 = (id: string, 최대: number): G5Family => ({
  id: `${id}-story2`,
  make: (seed) => {
    const next = 고르개(seed);
    const 처음 = 사이(next, 3, 최대);
    const 먹음 = 사이(next, 1, 처음 - 1);
    const 받음 = 사이(next, 1, 최대 - (처음 - 먹음));
    const v = 처음 - 먹음 + 받음;
    if (v > 최대 || 받음 < 1 || !자리셈되나(처음, 먹음) || !자리셈되나(v, 받음)) return null;
    return {
      prompt: `사탕이 ${처음}개 있었습니다. 그중에서 ${먹음}개를 먹고, 언니에게 ${받음}개를 더 받았습니다. 사탕은 몇 개가 되었을까요?`,
      answer: `${v}개`,
      wrongs: 수보기(v, [처음 - 먹음, 처음 + 먹음 + 받음, 처음 + 받음, Math.abs(처음 - 먹음 - 받음), v + 1], 최대, '개'),
      tag: 'addition',
      strategy: '두 번 일어난 일을 차례로 계산하기',
      hint: '먹은 것은 빼고, 받은 것은 더해요.',
      steps: [`먹고 남은 사탕: ${처음}-${먹음}=${처음 - 먹음}개`, `더 받은 뒤: ${처음 - 먹음}+${받음}=${v}개`],
      minusIsOperator: true,
    };
  },
});

/** 짝수와 홀수: 두 수 사이의 짝수(홀수) 개수 */
export const 짝홀사이 = (id: string): G5Family => ({
  id: `${id}-even-between`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 40);
    const b = 사이(next, a + 4, a + 12);
    const 짝 = next(2) === 0;
    const 수들 = Array.from({ length: b - a - 1 }, (_, k) => a + 1 + k).filter((x) => (x % 2 === 0) === 짝);
    const v = 수들.length;
    return {
      prompt: `${a}과(와) ${b} 사이에 있는 수 가운데 ${짝 ? '짝수' : '홀수'}는 모두 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: 수보기(v, [v + 1, v - 1, b - a - 1, v + 2], 99, '개'),
      tag: 'number',
      strategy: '둘씩 짝을 지어 짝수와 홀수 가리기',
      hint: '낱개의 숫자가 0, 2, 4, 6, 8이면 짝수, 1, 3, 5, 7, 9이면 홀수예요.',
      steps: [`${a}과(와) ${b} 사이의 ${짝 ? '짝수' : '홀수'}는 ${수들.join(', ')}입니다.`, `모두 ${v}개입니다.`],
      misconceptionTip: '사이에 있는 수이므로 두 끝 수는 넣지 않아요.',
    };
  },
});

/** 시각: 몇 시(몇 시 30분)에서 긴바늘이 몇 바퀴 돈 뒤 */
export const 시각뒤 = (id: string, 삼십분: boolean): G5Family => ({
  id: `${id}-later-${삼십분 ? 'half' : 'hour'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 9);
    const k = 사이(next, 1, 3);
    const 글 = (x: number) => `${((x - 1) % 12) + 1}시${삼십분 ? ' 30분' : ''}`;
    const v = 글(h + k);
    return {
      prompt: `지금 시각은 ${글(h)}입니다. 긴바늘이 ${k}바퀴 돌면 몇 시${삼십분 ? ' 몇 분이' : '가'} 될까요?`,
      answer: v,
      wrongs: [글(h + k + 1), 글(h), 글(h + k + 2 > 12 ? h + k - 1 : h + k + 2)].filter((w, i, xs) => w !== v && xs.indexOf(w) === i).concat([글(h + 5)]).filter((w, i, xs) => w !== v && xs.indexOf(w) === i).slice(0, 3),
      tag: 'time',
      strategy: '긴바늘이 한 바퀴 돌면 짧은바늘은 숫자 한 칸 움직임을 알기',
      hint: '긴바늘이 한 바퀴 돌면 짧은바늘은 다음 숫자로 가요.',
      steps: [`긴바늘이 한 바퀴 돌 때마다 1시간씩 지납니다.`, `${글(h)}에서 ${k}시간 뒤는 ${v}입니다.`],
    };
  },
});

/** 세 수의 셈에서 □ 구하기: 4+□+3=9, 9-□-2=3 */
export const 세수빈칸 = (id: string, 연산: '+' | '-'): G5Family => ({
  id: `${id}-three-blank-${연산}`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 사이(next, 1, 9);
    const c = 사이(next, 1, 9);
    if (연산 === '+') {
      const s = a + b + c;
      if (s > 19) return null;
      return {
        prompt: `${a}+□+${c}=${s}에서 □ 안에 알맞은 수는 얼마일까요?`,
        answer: String(b),
        wrongs: 수보기(b, [s - a, s - c, b + 1, b - 1, a + c], 19),
        tag: 'addition',
        strategy: '세 수의 덧셈에서 모르는 수 찾기',
        hint: `먼저 ${a}과(와) ${c}을(를) 더한 다음, ${s}이(가) 되려면 얼마가 더 있어야 하는지 생각해요.`,
        steps: [`${a}+${c}=${a + c}`, `${a + c}+□=${s}이므로 □=${b}입니다.`],
      };
    }
    const 처음 = a + b + c;
    if (처음 > 19) return null;
    return {
      prompt: `${처음}-□-${c}=${a}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(b),
      wrongs: 수보기(b, [처음 - a, 처음 - c, b + 1, b - 1, a + c], 19),
      tag: 'subtraction',
      strategy: '세 수의 뺄셈에서 모르는 수 찾기',
      hint: `${처음}에서 두 번 빼고 ${a}이(가) 남았어요. 모두 얼마를 뺐는지 먼저 생각해 보세요.`,
      steps: [`모두 ${처음}-${a}=${b + c}만큼 뺐습니다.`, `${b + c}에서 ${c}을(를) 빼면 □=${b}입니다.`],
      minusIsOperator: true,
    };
  },
});

/** 수 배열의 규칙을 말로 나타내기 */
export const 규칙말하기 = (id: string, 최대: number): G5Family => ({
  id: `${id}-rule-say`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 10);
    const 커짐 = next(3) !== 0;
    const 시작 = 커짐 ? 사이(next, 1, Math.max(1, 최대 - 4 * d)) : 사이(next, 4 * d + 1, 최대);
    const 수들 = Array.from({ length: 5 }, (_, k) => 시작 + (커짐 ? d : -d) * k);
    if (수들.some((x) => x < 0 || x > 최대)) return null;
    const 답 = `${d}씩 ${커짐 ? '커집니다' : '작아집니다'}`;
    return {
      prompt: `${수들.join(', ')}의 규칙을 바르게 말한 것은 어느 것일까요?`,
      answer: 답,
      wrongs: [`${d}씩 ${커짐 ? '작아집니다' : '커집니다'}`, `${d + 1}씩 ${커짐 ? '커집니다' : '작아집니다'}`, `${Math.max(1, d - 1) === d ? d + 2 : d - 1}씩 ${커짐 ? '커집니다' : '작아집니다'}`],
      tag: 'pattern',
      strategy: '이웃한 두 수를 견주어 규칙 말하기',
      hint: '앞의 수와 바로 뒤의 수가 얼마만큼 차이 나는지 보세요.',
      steps: [`${수들[0]}에서 ${수들[1]}(으)로, ${수들[1]}에서 ${수들[2]}(으)로 ${d}씩 ${커짐 ? '커집' : '작아집'}니다.`],
    };
  },
});

// ── 더 넓힌 1학년 생각 문항 ─────────────────────────────────────────
// '하' 단계도 한 가지 물음만 되풀이하지 않도록, 같은 개념을 다른
// 쪽에서 보게 하는 문항입니다.
//   · 거꾸로 세기: 수의 순서를 반대로 따라가기
//   · 10과 몇: 십몇을 10과 낱개로 가르기
//   · 봉지에 10개씩 담기: 묶음과 낱개를 실제 상황에서 쓰기
//   · 낱개가 10개 넘을 때: 낱개 10개를 묶음 하나로 바꾸기
//   · 세 가지 견주기: 두 번 견준 것을 이어서 가장 ○○한 것 찾기
//   · □ 안에 들어갈 수 있는 숫자: 자리마다 견주기
//   · 시각의 순서: 가장 이른(늦은) 시각 찾기

/** 수를 거꾸로 셀 때 빈 곳 */
export const 거꾸로순서 = (id: string, 최대: number, 최소 = 0): G5Family => ({
  id: `${id}-count-down`,
  make: (seed) => {
    const next = 고르개(seed);
    const 시작 = 사이(next, Math.max(최소 + 4, 5), 최대);
    const 수들 = Array.from({ length: 5 }, (_, k) => 시작 - k);
    const 빈 = 사이(next, 1, 3);
    const v = 수들[빈];
    return {
      prompt: `수를 거꾸로 세었습니다. (${수들.map((x, k) => (k === 빈 ? '?' : String(x))).join(', ')}) ?에 알맞은 수는 무엇일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [v + 2, v - 2, v - 3, v + 3, v - 1, v + 1].filter((x) => x >= 1), 최대),
      tag: 'number',
      strategy: '수를 거꾸로 세기',
      hint: '거꾸로 세면 1씩 작아져요. ? 바로 앞의 수보다 1 작은 수를 찾아요.',
      steps: [`${수들[빈 - 1]}보다 1만큼 더 작은 수는 ${v}입니다.`, `그 다음 수 ${수들[빈 + 1]}도 ${v}보다 1 작으므로 맞습니다.`],
      misconceptionTip: '거꾸로 셀 때는 앞의 수보다 1 큰 수가 아니라 1 작은 수가 와요.',
    };
  },
});

/** 십몇은 10과 몇 */
export const 십과몇 = (id: string): G5Family => ({
  id: `${id}-ten-and`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 11, 19);
    const v = n - 10;
    return {
      prompt: `10과 어떤 수를 모으면 ${n}입니다. 어떤 수는 얼마일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [n, v + 1, v - 1, 10, n - 1], 19),
      tag: 'placeValue',
      strategy: '십몇을 10과 낱개로 가르기',
      hint: `${n}은(는) 10개씩 묶음 1개와 낱개 몇 개인지 생각해요.`,
      steps: [`${n}은(는) 10개씩 묶음 1개와 낱개 ${v}개입니다.`, `그러므로 10과 ${v}을(를) 모으면 ${n}입니다.`],
      misconceptionTip: `${n}의 앞 숫자 1은 10을 나타내요. 뒤 숫자가 낱개예요.`,
      // '어떤 수'라는 말이 있지만 십몇을 10과 낱개로 가르는 이 차시의 기본 활동입니다.
      결: 1,
    };
  },
});

/** 10개씩 봉지에 담기(남는 것이 있을 수도 있음) */
export const 봉지담기 = (id: string, 최대: number, 남김: boolean, 최소묶음 = 2): G5Family => ({
  id: `${id}-bags-${남김 ? 'rest' : 'even'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 묶음 = 사이(next, 최소묶음, Math.floor(최대 / 10));
    const 낱 = 남김 ? 사이(next, 1, 9) : 0;
    const n = 묶음 * 10 + 낱;
    if (n > 최대) return null;
    const 물건 = ['구슬', '사탕', '밤', '단추'][next(4)];
    if (!남김) {
      return {
        prompt: `${물건} ${n}개를 한 봉지에 10개씩 담으려고 합니다. 봉지는 몇 개 필요할까요?`,
        answer: `${묶음}개`,
        wrongs: 수보기(묶음, [n, 묶음 + 1, 묶음 - 1, 10], 99, '개'),
        tag: 'placeValue',
        strategy: '10개씩 묶음의 수 생각하기',
        hint: `${n}은(는) 10개씩 묶음이 몇 개인지 생각해요.`,
        steps: [`${n}은(는) 10개씩 묶음 ${묶음}개입니다.`, `그러므로 봉지 ${묶음}개가 필요합니다.`],
      };
    }
    const 답 = `${묶음}봉지, ${낱}개`;
    return {
      prompt: `${물건} ${n}개를 한 봉지에 10개씩 담았습니다. 몇 봉지가 되고, 몇 개가 남을까요?`,
      answer: 답,
      wrongs: [`${낱}봉지, ${묶음}개`, `${묶음 + 1}봉지, 0개`, `${묶음}봉지, ${10 - 낱 === 낱 ? 낱 + 1 : 10 - 낱}개`].filter((w) => w !== 답),
      tag: 'placeValue',
      strategy: '10개씩 묶음과 낱개로 나누기',
      hint: '10개씩 묶음의 수가 봉지의 수, 낱개의 수가 남는 것이에요.',
      steps: [`${n}은(는) 10개씩 묶음 ${묶음}개와 낱개 ${낱}개입니다.`, `그러므로 ${묶음}봉지가 되고 ${낱}개가 남습니다.`],
      misconceptionTip: '앞 숫자는 봉지의 수, 뒤 숫자는 남는 낱개의 수예요.',
    };
  },
});

/** 낱개가 10개를 넘을 때: 10개씩 묶음 a개와 낱개 b개(b≥10) */
export const 낱개넘침 = (id: string, 최대: number): G5Family => ({
  id: `${id}-overflow`,
  make: (seed) => {
    const next = 고르개(seed);
    const 묶음 = 사이(next, 1, Math.floor(최대 / 10) - 2);
    const 낱 = 사이(next, 11, 19);
    const v = 묶음 * 10 + 낱;
    if (v > 최대) return null;
    return {
      prompt: `10개씩 묶음 ${묶음}개와 낱개 ${낱}개가 있습니다. 모두 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: 수보기(v, [묶음 * 10 + (낱 - 10), 묶음 * 100 + 낱, 묶음 + 낱, v + 10, v - 1, v + 1], 최대, '개'),
      tag: 'placeValue',
      strategy: '낱개 10개를 10개씩 묶음 1개로 바꾸기',
      hint: `낱개 ${낱}개는 10개씩 묶음 1개와 낱개 ${낱 - 10}개예요.`,
      steps: [`낱개 ${낱}개를 10개씩 묶으면 묶음 1개와 낱개 ${낱 - 10}개입니다.`, `10개씩 묶음은 모두 ${묶음 + 1}개, 낱개는 ${낱 - 10}개입니다.`, `그러므로 ${v}개입니다.`],
      misconceptionTip: `숫자를 그대로 이어 붙여 ${묶음}${낱}(이)라고 쓰면 안 돼요.`,
    };
  },
});

const 견줌말 = {
  length: { 무엇: '길이', 큰: '깁니다', 작은: '짧습니다', 가장큰: '가장 긴', 가장작은: '가장 짧은', 물건: ['연필', '크레파스', '붓'] },
  weight: { 무엇: '무게', 큰: '무겁습니다', 작은: '가볍습니다', 가장큰: '가장 무거운', 가장작은: '가장 가벼운', 물건: ['수박', '사과', '귤'] },
  area: { 무엇: '넓이', 큰: '넓습니다', 작은: '좁습니다', 가장큰: '가장 넓은', 가장작은: '가장 좁은', 물건: ['공책', '수첩', '스케치북'] },
  capacity: { 무엇: '담을 수 있는 양', 큰: '많이 담깁니다', 작은: '적게 담깁니다', 가장큰: '가장 많이 담기는', 가장작은: '가장 적게 담기는', 물건: ['컵', '물병', '주전자'] },
} as const;

/** 두 번 견준 것을 이어서 셋 가운데 가장 ○○한 것 찾기 */
export const 세가지견주기 = (id: string, 종류: keyof typeof 견줌말): G5Family => ({
  id: `${id}-chain-${종류}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 말 = 견줌말[종류];
    const 이름 = ['가', '나', '다'];
    // 큰 차례: 순서[0] > 순서[1] > 순서[2]
    const 순열 = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]][next(6)];
    const [첫, 둘, 셋] = 순열.map((k) => 이름[k]);
    const 앞뒤 = next(2) === 0;
    const 문장 = 앞뒤
      ? `${첫}은(는) ${둘}보다 ${말.큰}. ${셋}은(는) ${둘}보다 ${말.작은}.`
      : `${둘}은(는) ${첫}보다 ${말.작은}. ${둘}은(는) ${셋}보다 ${말.큰}.`;
    const 큰것 = next(2) === 0;
    const v = 큰것 ? 첫 : 셋;
    const 물건 = 말.물건[next(3)];
    return {
      prompt: `${물건} 가, 나, 다의 ${말.무엇}을(를) 견주었습니다. ${문장} ${큰것 ? 말.가장큰 : 말.가장작은} 것은 어느 것일까요?`,
      answer: v,
      wrongs: [...이름.filter((x) => x !== v), '알 수 없어요'],
      tag: 'measurement',
      strategy: '두 번 견준 것을 이어서 차례 정하기',
      hint: '두 문장에 함께 나오는 것을 가운데에 두고 차례대로 늘어놓아 보세요.',
      steps: [`${말.가장큰.replace('가장 ', '')} 차례로 늘어놓으면 ${첫}, ${둘}, ${셋}입니다.`, `${큰것 ? 말.가장큰 : 말.가장작은} 것은 ${v}입니다.`],
      misconceptionTip: '두 번 모두 나오는 것은 가운데예요. 한 번만 견주고 답하면 안 돼요.',
    };
  },
});

/** 몇십몇의 □ 안에 들어갈 수 있는 숫자의 개수: 6□ > 64 */
export const 숫자넣기비교 = (id: string): G5Family => ({
  id: `${id}-digit-fit`,
  make: (seed) => {
    const next = 고르개(seed);
    const 십 = 사이(next, 2, 9);
    const 일 = 사이(next, 1, 8);
    const 기준 = 십 * 10 + 일;
    const 크게 = next(2) === 0;
    // □는 0부터 9까지의 숫자
    const 맞는 = Array.from({ length: 10 }, (_, d) => d).filter((d) => (크게 ? 십 * 10 + d > 기준 : 십 * 10 + d < 기준));
    const v = 맞는.length;
    if (v < 1) return null;
    return {
      prompt: `${십}□은(는) ${기준}보다 ${크게 ? '큽니다' : '작습니다'}. 0부터 9까지의 숫자 가운데 □ 안에 들어갈 수 있는 숫자는 모두 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: 수보기(v, [v + 1, v - 1, 10 - v, v + 2], 10, '개'),
      tag: 'number',
      strategy: '10개씩 묶음의 수가 같으면 낱개의 수로 견주기',
      hint: `10개씩 묶음의 수가 ${십}(으)로 같으니 낱개 자리만 ${일}과(와) 견주어요.`,
      steps: [`10개씩 묶음의 수가 같으므로 □이(가) ${일}보다 ${크게 ? '커야' : '작아야'} 합니다.`, `들어갈 수 있는 숫자는 ${맞는.join(', ')}입니다.`, `모두 ${v}개입니다.`],
      misconceptionTip: `□에 ${일}을(를) 넣으면 두 수가 같아지므로 넣을 수 없어요.`,
    };
  },
});

/** 한 일과 시각을 보고 가장 먼저(나중에) 한 일 찾기 */
export const 시각순서 = (id: string, 삼십분: boolean): G5Family => ({
  id: `${id}-time-order-${삼십분 ? 'half' : 'hour'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 일들 = ['책 읽기', '줄넘기', '그림 그리기', '피아노 치기', '숙제하기', '산책하기'];
    const 시각들: number[] = []; // 분으로
    for (let t = 0; t < 40 && 시각들.length < 4; t += 1) {
      // 오전·오후가 섞이면 1시가 10시보다 늦을 수 있으므로 오후 1~6시만 씁니다.
      const h = 사이(next, 1, 6);
      const m = 삼십분 && next(2) === 0 ? 30 : 0;
      const x = h * 60 + m;
      // 같은 몇 시가 두 번 나오면 '30분이 나중'을 따지게 됩니다.
      if (!시각들.includes(x)) 시각들.push(x);
    }
    if (시각들.length < 4) return null;
    const 고른일: string[] = [];
    while (고른일.length < 4) {
      const w = 일들[next(일들.length)];
      if (!고른일.includes(w)) 고른일.push(w);
    }
    const 먼저 = next(2) === 0;
    const 목표 = 먼저 ? Math.min(...시각들) : Math.max(...시각들);
    const 글 = (x: number) => `${Math.floor(x / 60)}시${x % 60 ? ' 30분' : ''}`;
    const k = 시각들.indexOf(목표);
    const 차례 = 시각들.map((x, j) => [x, 고른일[j]] as const).sort((a, b) => a[0] - b[0]);
    return {
      prompt: `지우가 오후에 한 일입니다. ${고른일.map((w, j) => `${w}: ${글(시각들[j])}`).join(', ')}. 가장 ${먼저 ? '먼저' : '나중에'} 한 일은 무엇일까요?`,
      answer: 고른일[k],
      wrongs: 고른일.filter((_, j) => j !== k),
      tag: 'time',
      strategy: '몇 시를 먼저 견주고, 같으면 30분을 견주기',
      hint: '몇 시의 수가 작을수록 먼저예요. 같은 몇 시라면 30분이 나중이에요.',
      steps: [`이른 시각부터 늘어놓으면 ${차례.map(([x, w]) => `${글(x)}(${w})`).join(', ')}입니다.`, `가장 ${먼저 ? '먼저' : '나중에'} 한 일은 ${고른일[k]}입니다.`],
    };
  },
});

/** 더해서 꼭 n이 되는 짝 */
export const 합짝고정 = (id: string, n: number): G5Family => ({
  id: `${id}-pair-${n}`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, n - 1);
    const 답 = `${a}과(와) ${n - a}`;
    const 틀린: string[] = [];
    for (let t = 0; t < 40 && 틀린.length < 3; t += 1) {
      const x = 사이(next, 1, n - 1);
      const d = [1, -1, 2, -2][next(4)];
      const y = n - x + d;
      if (y < 1 || y > 9) continue;
      const g = `${x}과(와) ${y}`;
      if (!틀린.includes(g)) 틀린.push(g);
    }
    if (틀린.length < 3) return null;
    return {
      prompt: `두 수를 더해서 ${n}이(가) 되는 것은 어느 것일까요?`,
      answer: 답,
      wrongs: 틀린,
      tag: 'addition',
      strategy: `${n}이(가) 되는 두 수의 짝 찾기`,
      hint: `한 수에서 ${n}까지 이어 세어 보세요.`,
      steps: [`${a}+${n - a}=${n}이므로 ${답}입니다.`],
    };
  },
});
