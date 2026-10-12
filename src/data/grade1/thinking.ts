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
      prompt: `지금 시각은 ${글(h)}입니다. 긴바늘이 ${k}바퀴 돌면 몇 시${삼십분 ? ' 몇 분' : ''}이 될까요?`,
      answer: v,
      wrongs: [글(h + k + 1), 글(h), 글(h + k + 2 > 12 ? h + k - 1 : h + k + 2)].filter((w, i, xs) => w !== v && xs.indexOf(w) === i).concat([글(h + 5)]).filter((w, i, xs) => w !== v && xs.indexOf(w) === i).slice(0, 3),
      tag: 'time',
      strategy: '긴바늘이 한 바퀴 돌면 짧은바늘은 숫자 한 칸 움직임을 알기',
      hint: '긴바늘이 한 바퀴 돌면 짧은바늘은 다음 숫자로 가요.',
      steps: [`긴바늘이 한 바퀴 돌 때마다 1시간씩 지납니다.`, `${글(h)}에서 ${k}시간 뒤는 ${v}입니다.`],
    };
  },
});
