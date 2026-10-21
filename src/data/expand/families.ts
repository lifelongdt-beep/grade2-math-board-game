import type { G5Family } from '../grade5/build';
import { 결로, 글오답, 둘, 따옴표, 물건들, 뭉치, 사람들, 사이, 수문항, 수오답, 수읽기, 째말, 하나 } from './common';

// ════════════════════════════════════════════════════════════════════
// 문제집을 늘리는 문항 뭉치
// ────────────────────────────────────────────────────────────────────
// 뭉치마다 수의 범위를 받습니다. 같은 틀이라도 수와 상황(사람, 물건)을
// 바꾸어 답이 다른 문항이 여러 개 나오게 합니다. 결(0 지식, 1 적용,
// 2 사고)을 문항마다 밝혀, 하에는 사고형이, 상에는 지식형이 가지 않게
// 합니다(build.ts의 결맞음).
// 문제 글은 expand.check.test.ts가 글만 읽고 다시 풀 수 있는 꼴로 씁니다.
// ════════════════════════════════════════════════════════════════════

const 자리이름 = ['일', '십', '백', '천'];
const 자리값 = [1, 10, 100, 1000];

// ── 수 ──────────────────────────────────────────────────────────────

/** 몇 자리 수를 고릅니다. 맨 앞자리는 0이 아닙니다. */
const 자리수고르기 = (next: (b: number) => number, 자리: number, 영허용 = true) => {
  const 숫자 = Array.from({ length: 자리 }, (_, k) => (k === 0 ? 사이(next, 1, 9) : 영허용 && next(5) === 0 ? 0 : 사이(next, 1, 9)));
  return { 숫자, n: Number(숫자.join('')) };
};

/** 100이 a개, 10이 b개, 1이 c개인 수(두 자리는 10개씩 묶음과 낱개). */
export const 자릿값모으기 = (자리: 2 | 3 | 4, 최대 = 9999): G5Family =>
  뭉치(`place-gather-${자리}-${최대}`, (next) => {
    const { 숫자, n } = 자리수고르기(next, 자리);
    if (n > 최대) return null;
    const 말 = 자리 === 2
      ? `10개씩 묶음 ${숫자[0]}개와 낱개 ${숫자[1]}개인 수는 얼마일까요?`
      : `${숫자.map((d, k) => `${자리값[자리 - 1 - k]}이(가) ${d}개`).join(', ')}인 수는 얼마일까요?`;
    const 뒤집 = Number([...숫자].reverse().join(''));
    const 합 = 숫자.reduce((s, d) => s + d, 0);
    return 수문항(0, 말, n, [뒤집, 합, n + 자리값[자리 - 2] * (숫자[1] === 9 ? -1 : 1), Number(숫자.filter((d) => d).join(''))], {
      tag: 'placeValue', strategy: '자리마다 몇 개인지 보고 수로 나타내기',
      hint: '가장 큰 자리부터 차례로 숫자를 적어 보세요. 없는 자리에는 0을 써요.',
      steps: [`${숫자.map((d, k) => `${자리이름[자리 - 1 - k]}의 자리 숫자는 ${d}`).join(', ')}입니다.`, `그러므로 ${n}입니다.`],
    });
  });

/** n에서 어느 자리의 숫자, 또는 숫자가 나타내는 값 */
export const 자리숫자 = (자리: 2 | 3 | 4, 값으로: boolean, 최대 = 9999): G5Family =>
  뭉치(`place-digit-${자리}-${값으로 ? 'value' : 'digit'}`, (next) => {
    const { 숫자, n } = 자리수고르기(next, 자리);
    if (n > 최대) return null;
    const k = next(자리);
    const d = 숫자[k];
    const p = 자리 - 1 - k;
    if (값으로 && d === 0) return null;
    if (!값으로) {
      return 수문항(0, `${n}에서 ${자리이름[p]}의 자리 숫자는 무엇일까요?`, d, 숫자.filter((x) => x !== d).concat([d * 자리값[p]]), {
        tag: 'placeValue', strategy: '자리의 숫자 알기', hint: '오른쪽에서부터 일, 십, 백, 천의 자리예요.',
        steps: [`${n}의 ${자리이름[p]}의 자리 숫자는 ${d}입니다.`],
      });
    }
    // 같은 숫자가 다른 자리에도 있으면 묻는 뜻이 흐려집니다.
    if (숫자.filter((x) => x === d).length > 1) return null;
    const v = d * 자리값[p];
    return 수문항(1, `${n}에서 숫자 ${d}은(는) 얼마를 나타낼까요?`, v, [d, d * 자리값[Math.min(3, p + 1)], d * 자리값[Math.max(0, p - 1)]], {
      tag: 'placeValue', strategy: '숫자가 나타내는 값 알기', hint: `${d}이(가) 어느 자리에 있는지 먼저 찾아요.`,
      steps: [`${d}은(는) ${자리이름[p]}의 자리 숫자입니다.`, `그러므로 ${v}을(를) 나타냅니다.`],
    });
  });

/** 수를 읽거나(한자어) 읽은 것을 수로 쓰기 */
export const 수읽고쓰기 = (자리: 2 | 3 | 4, 최대 = 9999): G5Family =>
  뭉치(`read-write-${자리}`, (next) => {
    const { 숫자, n } = 자리수고르기(next, 자리);
    if (n > 최대) return null;
    if (next(2) === 0) {
      const 틀린 = [수읽기(Number([...숫자].reverse().join(''))), 수읽기(n + 자리값[Math.max(0, 자리 - 2)]), 숫자.map((d) => (d ? ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'][d] : '영')).join('')];
      return 결로(0, {
        prompt: `${n}을(를) 바르게 읽은 것은 어느 것일까요?`, answer: 수읽기(n), wrongs: 글오답(수읽기(n), 틀린),
        tag: 'number', strategy: '수 읽기', hint: '가장 큰 자리부터 숫자와 자리 이름을 함께 읽어요. 0인 자리는 읽지 않아요.',
        steps: [`${n}은(는) ${수읽기(n)}(이)라고 읽습니다.`],
      });
    }
    const 영빼기 = Number(숫자.filter((d) => d).join(''));
    return 수문항(0, `${따옴표(수읽기(n))} 수로 쓰면 얼마일까요?`, n, [영빼기, Number(숫자.join('') + '0'), Number([...숫자].reverse().join(''))], {
      tag: 'number', strategy: '읽은 수를 숫자로 쓰기', hint: '읽지 않은 자리에는 0을 써요.',
      steps: [`'${수읽기(n)}'은(는) ${n}입니다.`],
    });
  });

/** a에서 k씩 n번 뛰어 세기(거꾸로도) */
export const 뛰어세기 = (보폭: number[], 최소: number, 최대: number): G5Family =>
  뭉치(`skip-${보폭.join('-')}-${최대}`, (next) => {
    const k = 하나(next, 보폭);
    const 번 = 사이(next, 2, 5);
    const 거꾸로 = next(3) === 0;
    const a = 사이(next, 최소, 최대);
    const v = 거꾸로 ? a - k * 번 : a + k * 번;
    if (v < 최소 || v > 최대) return null;
    return 수문항(1, `${a}에서 ${k}씩 ${거꾸로 ? '거꾸로 ' : ''}${번}번 뛰어 센 수는 얼마일까요?`, v, [거꾸로 ? a + k * 번 : a - k * 번, 거꾸로 ? a - k * (번 - 1) : a + k * (번 - 1), 거꾸로 ? a - k * (번 + 1) : a + k * (번 + 1)], {
      tag: 'pattern', strategy: '몇씩 뛰어 세기', hint: `${k}씩 ${거꾸로 ? '작아지게' : '커지게'} 한 번씩 차례로 세어 보세요.`,
      steps: [`${a}에서 ${k}씩 ${번}번 ${거꾸로 ? '거꾸로 ' : ''}뛰어 세면 ${Array.from({ length: 번 }, (_, j) => a + (거꾸로 ? -1 : 1) * k * (j + 1)).join(', ')}입니다.`, `그러므로 ${v}입니다.`],
      아래: 0, 빼기: true,
    });
  });

/** 두 수(또는 세 수)의 크기 비교 */
export const 크기비교 = (최소: number, 최대: number, 셋 = false): G5Family =>
  뭉치(`compare-${최소}-${최대}-${셋 ? 3 : 2}`, (next) => {
    const 수들 = [...new Set(Array.from({ length: 셋 ? 3 : 2 }, () => 사이(next, 최소, 최대)))];
    if (수들.length < (셋 ? 3 : 2)) return null;
    const 큰 = next(2) === 0;
    const v = 큰 ? Math.max(...수들) : Math.min(...수들);
    const 보기 = [...수들, 큰 ? Math.min(...수들) - 1 : Math.max(...수들) + 1, v + (큰 ? -10 : 10)].filter((x) => x >= 0);
    const 오답 = 수오답(v, 보기.filter((x) => x !== v), '', 0, 최대);
    if (오답.length < 3) return null;
    return 결로(셋 ? 1 : 0, {
      prompt: 셋 ? `${수들.join(', ')} 가운데 가장 ${큰 ? '큰' : '작은'} 수는 무엇일까요?` : `${수들[0]}과(와) ${수들[1]} 가운데 더 ${큰 ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(v), wrongs: 오답, tag: 'number', strategy: '수의 크기 비교하기',
      hint: '가장 큰 자리의 숫자부터 비교해요. 같으면 다음 자리를 비교해요.',
      steps: [`가장 높은 자리부터 차례로 비교하면 ${큰 ? '가장 큰' : '가장 작은'} 수는 ${v}입니다.`],
    });
  });

/** a보다 크고 b보다 작은 수는 모두 몇 개(사고) */
export const 사이개수 = (최소: number, 최대: number, 간격: [number, number] = [3, 12]): G5Family =>
  뭉치(`between-count-${최대}`, (next) => {
    const a = 사이(next, 최소, 최대 - 간격[1]);
    const b = a + 사이(next, 간격[0], 간격[1]);
    const v = b - a - 1;
    return 수문항(2, `${a}보다 크고 ${b}보다 작은 수는 모두 몇 개일까요?`, v, [b - a, b - a + 1, v - 1], {
      단위: '개', tag: 'number', strategy: '두 수 사이의 수를 빠짐없이 세기', hint: `${a}과(와) ${b}은(는) 세지 않아요. ${a + 1}부터 세어 보세요.`,
      steps: [`${a}보다 크고 ${b}보다 작은 수는 ${a + 1}부터 ${b - 1}까지입니다.`, `${b - 1}-${a}=${v}이므로 ${v}개입니다.`], 아래: 1, 빼기: true,
    });
  });

/** n보다 k만큼 더 큰(작은) 수 */
export const 만큼큰수 = (보폭: number[], 최소: number, 최대: number): G5Family =>
  뭉치(`k-more-${보폭.join('-')}-${최대}`, (next) => {
    const k = 하나(next, 보폭);
    const n = 사이(next, 최소, 최대);
    const 큰 = next(2) === 0;
    const v = 큰 ? n + k : n - k;
    if (v < 0 || v > 최대) return null;
    return 수문항(0, `${n}보다 ${k}만큼 더 ${큰 ? '큰' : '작은'} 수는 얼마일까요?`, v, [큰 ? n - k : n + k, n, 큰 ? n + k * 10 : n - k * 10], {
      tag: 'number', strategy: `${k}만큼 더 큰 수와 더 작은 수`, hint: `${k}만큼 더 큰 수는 ${k}을(를) 더하고, 더 작은 수는 ${k}을(를) 빼요.`,
      steps: [`${n}${큰 ? '+' : '-'}${k}=${v}입니다.`], 아래: 0, 위: 최대, 빼기: true,
    });
  });

// ── 덧셈·뺄셈 ───────────────────────────────────────────────────────

type 조건 = (a: number, b: number) => boolean;

/** a+b, a-b 바로 계산(지식) */
export const 계산 = (연산: '+' | '-', a범위: [number, number], b범위: [number, number], 조건?: 조건): G5Family =>
  뭉치(`calc-${연산}-${a범위.join('-')}-${b범위.join('-')}`, (next) => {
    const a = 사이(next, ...a범위);
    const b = 사이(next, ...b범위);
    if (조건 && !조건(a, b)) return null;
    const v = 연산 === '+' ? a + b : a - b;
    if (v < 0) return null;
    return 수문항(0, `${a}${연산}${b}은(는) 얼마일까요?`, v, [연산 === '+' ? Math.abs(a - b) : a + b, v + 10, v - 10, v + 1], {
      tag: 연산 === '+' ? 'addition' : 'subtraction', strategy: 연산 === '+' ? '덧셈하기' : '뺄셈하기',
      hint: '같은 자리끼리 계산해요. 받아올림이나 받아내림이 있는지 보세요.', steps: [`${a}${연산}${b}=${v}입니다.`], 아래: 0, 빼기: true,
    });
  });

/** 세 수의 계산 */
export const 세수계산 = (최대: number, 연산들: Array<'+' | '-'>[], 범위: [number, number] = [1, 9]): G5Family =>
  뭉치(`three-${최대}-${연산들.map((x) => x.join('')).join('_')}-${범위.join('-')}`, (next) => {
    const [o1, o2] = 하나(next, 연산들);
    const a = 사이(next, ...범위);
    const b = 사이(next, ...범위);
    const c = 사이(next, ...범위);
    const 첫 = o1 === '+' ? a + b : a - b;
    const v = o2 === '+' ? 첫 + c : 첫 - c;
    if (첫 < 0 || 첫 > 최대 || v < 0 || v > 최대) return null;
    return 수문항(0, `${a}${o1}${b}${o2}${c}은(는) 얼마일까요?`, v, [o2 === '+' ? 첫 - c : 첫 + c, o1 === '+' ? a - b + c : a + b + c, v + 1], {
      tag: o1 === '+' && o2 === '+' ? 'addition' : 'subtraction', strategy: '세 수의 계산을 앞에서부터 차례로 하기',
      hint: '앞의 두 수를 먼저 계산하고, 그 값에 세 번째 수를 계산해요.', steps: [`${a}${o1}${b}=${첫}`, `${첫}${o2}${c}=${v}`], 아래: 0, 위: 최대, 빼기: true,
    });
  });

/** 덧셈·뺄셈 이야기 문제(적용) */
export const 이야기 = (연산: '+' | '-', a범위: [number, number], b범위: [number, number], 조건?: 조건): G5Family =>
  뭉치(`story-${연산}-${a범위.join('-')}-${b범위.join('-')}`, (next) => {
    const a = 사이(next, ...a범위);
    const b = 사이(next, ...b범위);
    if (조건 && !조건(a, b)) return null;
    const v = 연산 === '+' ? a + b : a - b;
    if (v < 0) return null;
    const 누구 = 하나(next, 사람들);
    const 것 = 하나(next, 물건들);
    const 말 = 연산 === '+'
      ? 하나(next, [
        `${누구}은(는) ${것.이름}을(를) ${a}${것.단위} 가지고 있었습니다. 친구에게 ${b}${것.단위}을(를) 더 받았습니다. ${누구}이(가) 가진 ${것.이름}은(는) 모두 몇 ${것.단위}일까요?`,
        `${것.이름}이(가) ${a}${것.단위} 있습니다. ${b}${것.단위}을(를) 더 사 왔습니다. ${것.이름}은(는) 모두 몇 ${것.단위}일까요?`,
      ])
      : 하나(next, [
        `${누구}은(는) ${것.이름}을(를) ${a}${것.단위} 가지고 있었습니다. 동생에게 ${b}${것.단위}을(를) 주었습니다. 남은 ${것.이름}은(는) 몇 ${것.단위}일까요?`,
        `${것.이름}이(가) ${a}${것.단위} 있었습니다. 그 가운데 ${b}${것.단위}을(를) 썼습니다. 남은 ${것.이름}은(는) 몇 ${것.단위}일까요?`,
      ]);
    return 수문항(1, 말, v, [연산 === '+' ? Math.abs(a - b) : a + b, v + 1, v - 1, v + 10], {
      단위: 것.단위, tag: 연산 === '+' ? 'addition' : 'subtraction', strategy: 연산 === '+' ? '더하는 상황을 덧셈식으로 나타내기' : '남는 상황을 뺄셈식으로 나타내기',
      hint: 연산 === '+' ? '처음 수에 더 생긴 수를 더해요.' : '처음 수에서 줄어든 수를 빼요.', steps: [`${a}${연산}${b}=${v}`, `그러므로 ${v}${것.단위}입니다.`], 아래: 0, 빼기: true,
    });
  });

/** 두 수량의 차 이야기(몇 개 더 많을까요) */
export const 차이야기 = (최소: number, 최대: number): G5Family =>
  뭉치(`diff-story-${최대}`, (next) => {
    const [p, q] = 둘(next, 사람들);
    const 것 = 하나(next, 물건들);
    const a = 사이(next, 최소, 최대);
    const b = 사이(next, 최소, 최대);
    if (a === b) return null;
    const v = Math.abs(a - b);
    const 많은 = a > b ? p : q;
    return 수문항(1, `${p}은(는) ${것.이름}을(를) ${a}${것.단위}, ${q}은(는) ${b}${것.단위} 가지고 있습니다. ${많은}이(가) 몇 ${것.단위} 더 많이 가지고 있을까요?`, v, [a + b, Math.max(a, b), v + 1], {
      단위: 것.단위, tag: 'subtraction', strategy: '두 수의 차 구하기', hint: '많은 수에서 적은 수를 빼요.',
      steps: [`${Math.max(a, b)}-${Math.min(a, b)}=${v}`, `그러므로 ${v}${것.단위} 더 많습니다.`], 아래: 0, 빼기: true,
    });
  });

/** □가 있는 덧셈식·뺄셈식(결은 차시에 따라 줍니다) */
export const 네모식 = (연산: '+' | '-', a범위: [number, number], b범위: [number, number], 결: 1 | 2, 조건?: 조건): G5Family =>
  뭉치(`box-${연산}-${a범위.join('-')}-${b범위.join('-')}-${결}`, (next) => {
    const a = 사이(next, ...a범위);
    const b = 사이(next, ...b범위);
    if (조건 && !조건(a, b)) return null;
    const c = 연산 === '+' ? a + b : a - b;
    if (c < 0) return null;
    const 앞 = next(2) === 0;
    const 식 = 앞 ? `□${연산}${b}=${c}` : `${a}${연산}□=${c}`;
    const v = 앞 ? a : b;
    return 수문항(결, `${식}에서 □ 안에 알맞은 수는 얼마일까요?`, v, [c, 연산 === '+' ? c + (앞 ? b : a) : Math.abs(c - (앞 ? b : a)), v + 1], {
      tag: 연산 === '+' ? 'addition' : 'subtraction', strategy: '덧셈과 뺄셈의 관계로 □ 구하기', hint: '덧셈식은 뺄셈식으로, 뺄셈식은 덧셈식으로 바꾸어 생각해요.',
      steps: [연산 === '+' ? `${c}-${앞 ? b : a}=${v}` : 앞 ? `${c}+${b}=${v}` : `${a}-${c}=${v}`, `그러므로 □는 ${v}입니다.`], 아래: 0, 빼기: true,
    });
  });

/** 어떤 수에 더하거나 뺐더니(사고) */
export const 어떤수덧뺄 = (최대: number, 작은최대 = 9): G5Family =>
  뭉치(`unknown-addsub-${최대}`, (next) => {
    const x = 사이(next, 2, 최대 - 작은최대);
    const k = 사이(next, 1, 작은최대);
    const 더 = next(2) === 0;
    const c = 더 ? x + k : x - k;
    if (c < 0 || c > 최대) return null;
    return 수문항(2, `어떤 수에 ${k}을(를) ${더 ? '더했더니' : '뺐더니'} ${c}이(가) 되었습니다. 어떤 수는 얼마일까요?`, x, [더 ? c + k : c - k, c, x + 1], {
      tag: 더 ? 'addition' : 'subtraction', strategy: '거꾸로 생각하여 어떤 수 구하기', hint: `${더 ? '더한 것은 빼서' : '뺀 것은 더해서'} 처음 수를 찾아요.`,
      steps: [`어떤 수를 □라 하면 □${더 ? '+' : '-'}${k}=${c}입니다.`, `□=${c}${더 ? '-' : '+'}${k}=${x}입니다.`], 아래: 0, 빼기: true,
    });
  });

// ── 곱셈 ────────────────────────────────────────────────────────────

/** 곱셈구구 바로 계산 */
export const 구구 = (단들: number[]): G5Family =>
  뭉치(`times-${단들.join('')}`, (next) => {
    const a = 하나(next, 단들);
    const b = 사이(next, 1, 9);
    const v = a * b;
    return 수문항(0, `${a}×${b}은(는) 얼마일까요?`, v, [v + a, v - a, a + b, a * (b + 1) + 1], {
      tag: 'multiplication', strategy: '곱셈구구 외우기', hint: `${a}단은 ${a}씩 커져요.`, steps: [`${a}×${b}=${v}입니다.`], 아래: 0,
    });
  });

/** 묶음 이야기: 한 봉지에 a개씩 b봉지 */
export const 묶음이야기 = (단들: number[], b범위: [number, number] = [2, 9]): G5Family =>
  뭉치(`group-story-${단들.join('')}-${b범위.join('-')}`, (next) => {
    const a = 하나(next, 단들);
    const b = 사이(next, ...b범위);
    const 것 = 하나(next, 물건들);
    const v = a * b;
    return 수문항(1, `${것.이름}이(가) 한 ${것.묶음}에 ${a}${것.단위}씩 ${b}${것.묶음} 있습니다. ${것.이름}은(는) 모두 몇 ${것.단위}일까요?`, v, [a + b, v + a, v - a, a * (b - 1)], {
      단위: 것.단위, tag: 'multiplication', strategy: '똑같이 묶인 상황을 곱셈식으로 나타내기', hint: `${a}씩 ${b}묶음은 ${a}×${b}예요.`,
      steps: [`${a}×${b}=${v}`, `그러므로 ${v}${것.단위}입니다.`], 아래: 1,
    });
  });

/** a×□=c(사고) 또는 곱이 같은 두 수 */
export const 곱네모 = (단들: number[], 결: 1 | 2): G5Family =>
  뭉치(`times-box-${단들.join('')}-${결}`, (next) => {
    const a = 하나(next, 단들);
    const b = 사이(next, 2, 9);
    const c = a * b;
    return 수문항(결, `${a}×□=${c}에서 □ 안에 알맞은 수는 얼마일까요?`, b, [c - a, a, b + 1, b - 1], {
      tag: 'multiplication', strategy: '곱셈구구로 □ 구하기', hint: `${a}단을 차례로 외워 ${c}이(가) 나오는 곳을 찾아요.`,
      steps: [`${a}×${b}=${c}이므로 □는 ${b}입니다.`], 아래: 0,
    });
  });

/** a씩 b묶음, a의 b배, a를 b번 더한 것 */
export const 묶어세기 = (최대: number, 꼴: '묶음' | '배' | '더하기'): G5Family =>
  뭉치(`bundle-${꼴}-${최대}`, (next) => {
    const a = 사이(next, 2, 9);
    const b = 사이(next, 2, 9);
    const v = a * b;
    if (v > 최대) return null;
    if (꼴 === '더하기' && b > 6) return null;
    const 말 = 꼴 === '묶음' ? `${a}씩 ${b}묶음은 모두 얼마일까요?` : 꼴 === '배' ? `${a}의 ${b}배는 얼마일까요?` : `${Array.from({ length: b }, () => a).join('+')}은(는) 얼마일까요?`;
    return 수문항(0, 말, v, [a + b, v + a, v - a], {
      tag: 'multiplication', strategy: 꼴 === '배' ? '몇의 몇 배 알기' : '묶어 세기', hint: `${a}씩 ${b}번 세어 보세요.`,
      steps: [`${a}씩 ${b}번이므로 ${Array.from({ length: b }, (_, k) => a * (k + 1)).join(', ')}`, `그러므로 ${v}입니다.`], 아래: 1,
    });
  });

/** a는 b의 몇 배(적용) */
export const 몇배인가 = (): G5Family =>
  뭉치('how-many-times', (next) => {
    const b = 사이(next, 2, 9);
    const k = 사이(next, 2, 9);
    const a = b * k;
    const [p, q] = 둘(next, ['빨간 끈', '파란 끈', '초록 끈', '노란 끈']);
    return 수문항(1, `${p}은(는) ${a}cm, ${q}은(는) ${b}cm입니다. ${p}의 길이는 ${q}의 몇 배일까요?`, k, [a - b, a + b, k + 1], {
      단위: '배', tag: 'multiplication', strategy: '몇 배인지 알기', hint: `${b}씩 몇 번이면 ${a}이(가) 되는지 세어 보세요.`,
      steps: [`${b}×${k}=${a}`, `그러므로 ${k}배입니다.`], 아래: 1,
    });
  });

/** 덧셈식을 곱셈식으로 */
export const 곱셈식으로 = (): G5Family =>
  뭉치('add-as-mul', (next) => {
    const a = 사이(next, 2, 9);
    const b = 사이(next, 3, 6);
    const 답 = `${a}×${b}`;
    return 결로(0, {
      prompt: `${Array.from({ length: b }, () => a).join('+')}을(를) 곱셈식으로 바르게 나타낸 것은 어느 것일까요?`,
      answer: 답, wrongs: 글오답(답, [`${a}×${a}`, `${b}×${b}`, `${a}+${b}`, `${a}×${b + 1}`]),
      tag: 'multiplication', strategy: '같은 수를 여러 번 더한 것을 곱셈식으로 나타내기', hint: `${a}을(를) 몇 번 더했는지 세어 보세요.`,
      steps: [`${a}을(를) ${b}번 더했으므로 ${답}입니다.`], minusIsOperator: true,
    });
  });

/** 0과 1의 곱 */
export const 영과일곱 = (): G5Family =>
  뭉치('zero-one', (next) => {
    const a = 사이(next, 1, 9);
    const 꼴 = next(4);
    if (꼴 === 3) {
      const 것 = 하나(next, 물건들);
      return 수문항(1, `빈 ${것.묶음} ${a}개가 있습니다. ${것.묶음}마다 ${것.이름}이(가) 0${것.단위}씩 들어 있습니다. ${것.이름}은(는) 모두 몇 ${것.단위}일까요?`, 0, [a, 1, a + 1], {
        단위: 것.단위, tag: 'multiplication', strategy: '0의 곱 알기', hint: '0을 몇 번 더해도 0이에요.', steps: [`0×${a}=0`, '그러므로 0입니다.'], 아래: 0,
      });
    }
    const [식, v] = 꼴 === 0 ? [`1×${a}`, a] : 꼴 === 1 ? [`${a}×1`, a] : [next(2) ? `0×${a}` : `${a}×0`, 0];
    return 수문항(0, `${식}은(는) 얼마일까요?`, v, [v === 0 ? a : 0, v + 1, 1], {
      tag: 'multiplication', strategy: '1의 곱과 0의 곱 알기', hint: '1과 어떤 수의 곱은 그 수, 0과 어떤 수의 곱은 0이에요.', steps: [`${식}=${v}입니다.`], 아래: 0,
    });
  });

/** 곱셈표에서 만나는 칸 */
export const 곱셈표칸 = (단들: number[]): G5Family =>
  뭉치(`times-table-cell-${단들.join('')}`, (next) => {
    const a = 하나(next, 단들);
    const b = 사이(next, 1, 9);
    const v = a * b;
    return 수문항(0, `곱셈표에서 ${a}단의 가로줄과 ${b}의 세로줄이 만나는 칸에 들어갈 수는 얼마일까요?`, v, [a + b, v + a, v + b], {
      tag: 'multiplication', strategy: '곱셈표 채우기', hint: `${a}×${b}을(를) 생각해요.`, steps: [`${a}×${b}=${v}입니다.`], 아래: 0,
    });
  });

// ── 길이·시각 ───────────────────────────────────────────────────────

/** m와 cm 바꾸기 */
export const 미터바꾸기 = (): G5Family =>
  뭉치('m-cm', (next) => {
    const m = 사이(next, 1, 9);
    const cm = 사이(next, 1, 99);
    const 합 = m * 100 + cm;
    if (next(2) === 0) {
      return 수문항(0, `${m}m ${cm}cm는 몇 cm일까요?`, 합, [m * 10 + cm, m + cm, Number(`${m}${cm}`) === 합 ? m * 1000 + cm : Number(`${m}${cm}`)], {
        단위: 'cm', tag: 'measurement', strategy: 'm와 cm의 관계 알기', hint: '1m는 100cm예요.', steps: [`${m}m는 ${m * 100}cm입니다.`, `${m * 100}+${cm}=${합}이므로 ${합}cm입니다.`], 아래: 1,
      });
    }
    const 답 = `${m}m ${cm}cm`;
    return 결로(0, {
      prompt: `${합}cm는 몇 m 몇 cm일까요?`, answer: 답,
      wrongs: 글오답(답, [`${m * 10 + Math.floor(cm / 10)}m ${cm % 10}cm`, `${m}m ${cm + 1}cm`, `${m + 1}m ${cm}cm`, `${Math.floor(합 / 10)}m ${합 % 10}cm`]),
      tag: 'measurement', strategy: 'cm를 m와 cm로 나타내기', hint: '100cm가 1m예요. 100씩 몇 번인지 보세요.', steps: [`${합}cm=${m * 100}cm+${cm}cm=${답}입니다.`],
    });
  });

/** 길이의 합과 차(m, cm) */
export const 길이합차 = (): G5Family =>
  뭉치('m-cm-addsub', (next) => {
    const 더 = next(2) === 0;
    const [m1, c1, m2, c2] = [사이(next, 1, 8), 사이(next, 10, 89), 사이(next, 1, 8), 사이(next, 10, 89)];
    const a = m1 * 100 + c1;
    const b = m2 * 100 + c2;
    if (!더 && a <= b) return null;
    const v = 더 ? a + b : a - b;
    if (v >= 1000 || v < 100) return null;
    const 답 = `${Math.floor(v / 100)}m ${v % 100}cm`;
    if (v % 100 === 0) return null;
    return 결로(1, {
      prompt: `${m1}m ${c1}cm ${더 ? '+' : '-'} ${m2}m ${c2}cm는 몇 m 몇 cm일까요?`, answer: 답,
      wrongs: 글오답(답, [`${Math.floor(v / 100) + 1}m ${v % 100}cm`, `${Math.max(0, Math.floor(v / 100) - 1)}m ${v % 100}cm`, `${Math.floor(v / 100)}m ${(v % 100) + 10}cm`, `${더 ? m1 + m2 : m1 - m2}m ${더 ? (c1 + c2) % 100 : Math.abs(c1 - c2)}cm`]),
      tag: 'measurement', strategy: `길이의 ${더 ? '합' : '차'} 구하기`, hint: 'm는 m끼리, cm는 cm끼리 계산해요. cm가 100을 넘거나 모자라면 1m를 바꾸어요.',
      steps: [`${a}cm${더 ? '+' : '-'}${b}cm=${v}cm`, `${v}cm는 ${답}입니다.`], minusIsOperator: true,
    });
  });

/** 자의 눈금에서 눈금까지(2-1 4단원) */
export const 눈금사이 = (최대: number): G5Family =>
  뭉치(`ruler-between-${최대}`, (next) => {
    const a = 사이(next, 1, 최대 - 3);
    const b = 사이(next, a + 2, 최대);
    const v = b - a;
    const 것 = 하나(next, ['연필', '지우개', '크레파스', '끈', '막대', '리본']);
    return 수문항(1, `${것}의 한끝을 자의 ${a}cm 눈금에 맞추었더니 다른 끝이 ${b}cm 눈금에 닿았습니다. ${것}의 길이는 몇 cm일까요?`, v, [b, a + b, v + 1], {
      단위: 'cm', tag: 'measurement', strategy: '0이 아닌 눈금에서 시작한 길이 재기', hint: '1cm가 몇 번 들어가는지 세어 보세요.',
      steps: [`${b}-${a}=${v}`, `그러므로 ${v}cm입니다.`], 아래: 1, 빼기: true,
    });
  });

/** 1cm가 몇 번 */
export const 일센티몇번 = (최대: number): G5Family =>
  뭉치(`one-cm-${최대}`, (next) => {
    const n = 사이(next, 2, 최대);
    if (next(2) === 0) return 수문항(0, `1cm가 ${n}번이면 몇 cm일까요?`, n, [n + 1, n - 1, n * 10], { 단위: 'cm', tag: 'measurement', strategy: '1cm로 길이 나타내기', hint: '1cm가 한 번이면 1cm예요.', steps: [`1cm가 ${n}번이면 ${n}cm입니다.`], 아래: 1 });
    return 수문항(0, `${n}cm는 1cm가 몇 번일까요?`, n, [n + 1, n - 1, n * 10], { 단위: '번', tag: 'measurement', strategy: '1cm로 길이 나타내기', hint: '1cm가 몇 번 들어가는지 세어 보세요.', steps: [`${n}cm는 1cm가 ${n}번입니다.`], 아래: 1 });
  });

/** 어림한 길이와 잰 길이의 차 */
export const 어림차 = (최대: number, 단위 = 'cm', 무엇 = '책상의 짧은 쪽 길이'): G5Family =>
  뭉치(`estimate-gap-${최대}-${단위}`, (next) => {
    const 실제 = 사이(next, 5, 최대);
    const 어림 = 실제 + (next(2) ? 1 : -1) * 사이(next, 1, 4);
    if (어림 <= 0) return null;
    const [p, q] = 둘(next, 사람들);
    const 다른 = 실제 + (next(2) ? 1 : -1) * 사이(next, 1, 4);
    if (다른 <= 0 || Math.abs(다른 - 실제) === Math.abs(어림 - 실제)) return null;
    const 가까운 = Math.abs(어림 - 실제) < Math.abs(다른 - 실제) ? p : q;
    return 결로(1, {
      prompt: `${무엇}을(를) ${p}은(는) 약 ${어림}${단위}, ${q}은(는) 약 ${다른}${단위}(으)로 어림했습니다. 자로 재어 보니 ${실제}${단위}였습니다. 실제 길이에 더 가깝게 어림한 사람은 누구일까요?`,
      answer: 가까운, wrongs: 글오답(가까운, [p, q, '두 사람이 똑같이 가깝습니다', '알 수 없습니다']),
      tag: 'measurement', strategy: '어림한 길이와 잰 길이 견주기', hint: '어림한 길이와 실제 길이의 차가 작을수록 더 가깝게 어림한 거예요.',
      steps: [`${p}: ${Math.abs(어림 - 실제)}${단위} 차이, ${q}: ${Math.abs(다른 - 실제)}${단위} 차이`, `차가 더 작은 ${가까운}이(가) 더 가깝게 어림했습니다.`],
    });
  });

/** 단위길이로 잰 횟수 비교(같은 단위면 많을수록, 같은 물건이면 단위가 길수록 적게) */
export const 단위비교 = (최대: number, 단위가다름: boolean): G5Family =>
  뭉치(`unit-compare-${최대}-${단위가다름 ? 'units' : 'things'}`, (next) => {
    const a = 사이(next, 2, 최대);
    const b = 사이(next, 2, 최대);
    if (a === b) return null;
    if (!단위가다름) {
      const [x, y] = 둘(next, ['빨간 끈', '파란 끈', '초록 끈', '노란 끈', '분홍 끈']);
      const 단위 = 하나(next, ['클립', '지우개', '뼘', '연필']);
      const 답 = a > b ? x : y;
      return 결로(1, {
        prompt: `${x}은(는) ${단위}(으)로 ${a}번, ${y}은(는) ${단위}(으)로 ${b}번 잰 길이입니다. 어느 끈이 더 길까요?`, answer: 답,
        wrongs: 글오답(답, [x, y, '두 끈의 길이가 같습니다', '알 수 없습니다']), tag: 'measurement', strategy: '같은 단위로 잰 횟수로 길이 비교하기',
        hint: '같은 단위로 재었다면 여러 번 잰 쪽이 더 길어요.', steps: [`같은 ${단위}로 ${Math.max(a, b)}번 잰 쪽이 더 깁니다.`, `그러므로 ${답}입니다.`],
      });
    }
    const [u, w] = 둘(next, ['클립', '지우개', '풀', '색연필']);
    const 답 = a > b ? w : u;
    return 결로(2, {
      prompt: `같은 책상의 길이를 ${u}(으)로 재면 ${a}번, ${w}(으)로 재면 ${b}번입니다. ${u}과(와) ${w} 가운데 어느 것이 더 길까요?`, answer: 답,
      wrongs: 글오답(답, [u, w, '두 물건의 길이가 같습니다', '알 수 없습니다']), tag: 'measurement', strategy: '잰 횟수로 단위의 길이 견주기',
      hint: '같은 길이를 잴 때 단위가 길수록 적은 번 재게 돼요.', steps: [`같은 길이를 더 적게(${Math.min(a, b)}번) 잰 단위가 더 깁니다.`, `그러므로 ${답}입니다.`],
    });
  });

const 시각글 = (분전체: number) => {
  const h = Math.floor(분전체 / 60) % 12 || 12;
  const m = 분전체 % 60;
  return m === 0 ? `${h}시` : `${h}시 ${m}분`;
};

/** 시각 읽기: 짧은바늘과 긴바늘의 자리 */
export const 바늘읽기 = (오분만: boolean): G5Family =>
  뭉치(`clock-read-${오분만 ? 5 : 1}`, (next) => {
    const h = 사이(next, 1, 12);
    const 숫자 = 사이(next, 1, 11);
    const 칸 = 오분만 ? 0 : 사이(next, 1, 4);
    const m = 숫자 * 5 + 칸;
    const 답 = `${h}시 ${m}분`;
    return 결로(오분만 ? 0 : 1, {
      prompt: `짧은바늘이 ${h}과(와) ${h % 12 + 1} 사이에 있고, 긴바늘이 숫자 ${숫자}${칸 ? `에서 작은 눈금 ${칸}칸 더 간 곳` : ''}을(를) 가리킵니다. 몇 시 몇 분일까요?`,
      answer: 답, wrongs: 글오답(답, [`${h}시 ${숫자}분`, `${h % 12 + 1}시 ${m}분`, `${숫자}시 ${h * 5 > 59 ? 0 : h * 5}분`, `${h}시 ${m + 5 > 59 ? m - 5 : m + 5}분`]),
      tag: 'time', strategy: '긴바늘이 가리키는 숫자로 분 읽기', hint: '긴바늘이 숫자 1을 가리키면 5분, 2를 가리키면 10분이에요. 작은 눈금 한 칸은 1분이에요.',
      steps: [`짧은바늘이 ${h}과(와) ${h % 12 + 1} 사이이므로 ${h}시입니다.`, `긴바늘은 ${숫자}×5${칸 ? `+${칸}` : ''}=${m}분을 나타냅니다.`, `그러므로 ${답}입니다.`],
    });
  });

/** a시 b분은 몇 시 몇 분 전 */
export const 몇분전 = (): G5Family =>
  뭉치('minutes-before', (next) => {
    const h = 사이(next, 1, 11);
    const m = 사이(next, 9, 11) * 5;
    const 전 = 60 - m;
    const 답 = `${h + 1}시 ${전}분 전`;
    return 결로(1, {
      prompt: `${h}시 ${m}분은 몇 시 몇 분 전일까요?`, answer: 답,
      wrongs: 글오답(답, [`${h}시 ${전}분 전`, `${h + 1}시 ${m}분 전`, `${h + 1}시 ${전 + 5}분 전`]),
      tag: 'time', strategy: '몇 시 몇 분 전으로 읽기', hint: `${h + 1}시가 되려면 몇 분이 더 지나야 하는지 생각해요.`,
      steps: [`${h}시 ${m}분에서 ${전}분이 지나면 ${h + 1}시입니다.`, `그러므로 ${답}입니다.`],
    });
  });

/** 시간과 분 바꾸기 */
export const 시간분바꾸기 = (): G5Family =>
  뭉치('hour-minute', (next) => {
    const h = 사이(next, 1, 3);
    const m = 사이(next, 1, 11) * 5;
    const 합 = h * 60 + m;
    if (next(2) === 0) return 수문항(0, `${h}시간 ${m}분은 몇 분일까요?`, 합, [h * 100 + m, h + m, (h - 1) * 60 + m || 합 + 60], { 단위: '분', tag: 'time', strategy: '1시간은 60분', hint: '1시간은 60분이에요.', steps: [`${h}시간은 ${h * 60}분입니다.`, `${h * 60}+${m}=${합}이므로 ${합}분입니다.`], 아래: 1 });
    const 답 = `${h}시간 ${m}분`;
    return 결로(0, {
      prompt: `${합}분은 몇 시간 몇 분일까요?`, answer: 답, wrongs: 글오답(답, [`${Math.floor(합 / 100)}시간 ${합 % 100}분`, `${h + 1}시간 ${m}분`, `${h}시간 ${m + 10}분`, `${h - 1}시간 ${m + 60}분`]),
      tag: 'time', strategy: '분을 시간과 분으로 나타내기', hint: '60분씩 묶으면 1시간이에요.', steps: [`${합}분=${h * 60}분+${m}분=${답}입니다.`],
    });
  });

/** 시작 시각과 걸린 시간 → 끝난 시각, 또는 걸린 시간 */
export const 걸린시간 = (): G5Family =>
  뭉치('elapsed', (next) => {
    const 시작 = 사이(next, 1, 10) * 60 + 사이(next, 0, 11) * 5;
    const 동안 = 사이(next, 2, 18) * 5;
    const 끝 = 시작 + 동안;
    if (Math.floor(끝 / 60) > 12) return null;
    const 일 = 하나(next, ['책 읽기', '줄넘기', '피아노 연습', '숙제', '그림 그리기', '블록 놀이']);
    if (next(2) === 0) {
      const 답 = 시각글(끝);
      return 결로(1, {
        prompt: `${시각글(시작)}부터 ${동안}분 동안 ${일}을(를) 했습니다. 끝난 시각은 언제일까요?`,
        answer: 답, wrongs: 글오답(답, [시각글(끝 + 5), 시각글(끝 - 5), 시각글(시작 + (동안 % 60)), 시각글(끝 + 60)]),
        tag: 'time', strategy: '걸린 시간으로 끝난 시각 구하기', hint: '긴바늘이 몇 칸 더 돌아가는지 생각해요. 60분이 되면 1시간이에요.',
        steps: [`${시각글(시작)}에서 ${동안}분이 지나면 ${답}입니다.`],
      });
    }
    return 수문항(1, `${시각글(시작)}부터 ${시각글(끝)}까지 ${일}을(를) 했습니다. 몇 분 동안 했을까요?`, 동안, [동안 + 5, 동안 - 5, 동안 + 60], {
      단위: '분', tag: 'time', strategy: '시작 시각과 끝난 시각으로 걸린 시간 구하기', hint: '시작 시각부터 끝난 시각까지 긴바늘이 몇 칸 움직였는지 세어요. 한 칸은 5분이에요.',
      steps: [`${시각글(시작)}부터 ${시각글(끝)}까지는 ${동안}분입니다.`], 아래: 1,
    });
  });

/** 오전·오후로 걸린 시간, 며칠은 몇 시간 */
export const 하루시간 = (): G5Family =>
  뭉치('day-hours', (next) => {
    if (next(3) === 0) {
      const d = 사이(next, 1, 4);
      return 수문항(0, `${d}일은 몇 시간일까요?`, d * 24, [d * 12, d * 60, d * 24 + 12], { 단위: '시간', tag: 'time', strategy: '하루는 24시간', hint: '하루는 24시간이에요.', steps: [`24×${d}=${d * 24}이므로 ${d * 24}시간입니다.`], 아래: 1 });
    }
    const a = 사이(next, 6, 11);
    const b = 사이(next, 1, 9);
    const v = 12 - a + b;
    const 일 = 하나(next, ['놀이공원에 있었습니다', '도서관에 있었습니다', '체험 학습을 했습니다', '박물관을 구경했습니다']);
    return 수문항(1, `오전 ${a}시부터 오후 ${b}시까지 ${일}. 모두 몇 시간 동안일까요?`, v, [b - a + 24, a + b, 12 - a, v + 1].map((x) => Math.abs(x)), {
      단위: '시간', tag: 'time', strategy: '오전과 오후에 걸친 시간 구하기', hint: '낮 12시를 기준으로 앞과 뒤를 나누어 세어요.',
      steps: [`오전 ${a}시부터 낮 12시까지 ${12 - a}시간, 낮 12시부터 오후 ${b}시까지 ${b}시간입니다.`, `${12 - a}+${b}=${v}이므로 ${v}시간입니다.`], 아래: 1,
    });
  });

const 요일 = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

/** 달력: 며칠 뒤의 요일, 몇 주일은 며칠 */
export const 달력 = (): G5Family =>
  뭉치('calendar', (next) => {
    if (next(3) === 0) {
      const w = 사이(next, 2, 5);
      const d = 사이(next, 0, 6);
      const v = w * 7 + d;
      return 수문항(0, d ? `${w}주일 ${d}일은 며칠일까요?` : `${w}주일은 며칠일까요?`, v, [w * 10 + d, w * 5 + d, v + 7], { 단위: '일', tag: 'time', strategy: '1주일은 7일', hint: '1주일은 7일이에요.', steps: [`7×${w}${d ? `+${d}` : ''}=${v}이므로 ${v}일입니다.`], 아래: 1 });
    }
    const 날 = 사이(next, 1, 9);
    const 뒤 = 사이(next, 1, 3) * 7 + 사이(next, 0, 6);
    const 그날 = 날 + 뒤;
    if (그날 > 30) return null;
    const 처음 = next(7);
    const 답 = 요일[(처음 + 뒤) % 7];
    return 결로(1, {
      prompt: `어느 달 ${날}일은 ${요일[처음]}입니다. 같은 달 ${그날}일은 무슨 요일일까요?`, answer: 답,
      wrongs: 글오답(답, [요일[(처음 + 뒤 + 1) % 7], 요일[(처음 + 뒤 + 6) % 7], 요일[처음], 요일[(처음 + 2) % 7]]),
      tag: 'time', strategy: '7일마다 같은 요일이 되풀이됨을 알기', hint: '같은 요일은 7일마다 돌아와요.',
      steps: [`${그날}-${날}=${뒤}일 뒤입니다.`, `${뒤}일은 7일씩 ${Math.floor(뒤 / 7)}번과 ${뒤 % 7}일이므로 ${답}입니다.`], minusIsOperator: true,
    });
  });

/** 몇 시(몇 시 30분)에 하는 일 — 짧은바늘과 긴바늘 */
export const 정각반 = (반: boolean): G5Family =>
  뭉치(`oclock-${반 ? 'half' : 'full'}`, (next) => {
    const h = 사이(next, 1, 11);
    const 누구 = 하나(next, 사람들);
    const 일 = 하나(next, ['일어난', '아침을 먹은', '학교에 간', '점심을 먹은', '책을 읽은', '집에 온', '잠자리에 든']);
    const 시각 = 반 ? `${h}시 30분` : `${h}시`;
    if (next(2) === 0) {
      return 결로(0, {
        prompt: `${누구}이(가) ${일} 때 시계를 보았더니 짧은바늘이 ${반 ? `${h}과(와) ${h + 1} 사이` : `${h}`}에 있고, 긴바늘이 ${반 ? 6 : 12}을(를) 가리켰습니다. 그때는 몇 시${반 ? ' 몇 분' : ''}일까요?`,
        answer: 시각, wrongs: 글오답(시각, 반 ? [`${h + 1}시 30분`, `${h}시`, `6시 ${h * 5}분`, `${h - 1 || 12}시 30분`] : [`${h + 1}시`, `12시 ${h * 5}분`, `${h}시 30분`, `${h - 1 || 12}시`]),
        tag: 'time', strategy: 반 ? '몇 시 30분 읽기' : '몇 시 읽기', hint: 반 ? '긴바늘이 6을 가리키면 30분이에요. 짧은바늘이 지나온 숫자가 시예요.' : '긴바늘이 12를 가리키면 몇 시예요. 짧은바늘이 가리키는 숫자를 읽어요.',
        steps: [반 ? `짧은바늘이 ${h}과(와) ${h + 1} 사이, 긴바늘이 6이므로 ${h}시 30분입니다.` : `짧은바늘이 ${h}, 긴바늘이 12이므로 ${h}시입니다.`],
      });
    }
    return 수문항(0, `${누구}은(는) ${시각}에 ${일.replace(/(난|은|간|온|든)$/, (e) => ({ 난: '났', 은: '었', 간: '갔', 온: '왔', 든: '들었' } as Record<string, string>)[e])}습니다. 그 시각을 시계에 나타낼 때 짧은바늘은 숫자 몇${반 ? '을(를) 지난 곳' : ''}에 있을까요?`, h, [반 ? 6 : 12, h + 1, h - 1 || 12], {
      tag: 'time', strategy: '시각에 맞게 짧은바늘 놓기', hint: '짧은바늘은 시를 나타내요.', steps: [`${시각}에 짧은바늘은 ${h}${반 ? '을(를) 지난 곳' : ''}에 있습니다.`], 아래: 1, 위: 12,
    });
  });

// ── 자료·분류 ───────────────────────────────────────────────────────

const 조사들 = [
  { 주제: '좋아하는 과일', 항목: ['사과', '배', '귤', '포도', '딸기'] },
  { 주제: '좋아하는 운동', 항목: ['축구', '줄넘기', '수영', '농구', '야구'] },
  { 주제: '좋아하는 동물', 항목: ['강아지', '고양이', '토끼', '햄스터', '거북'] },
  { 주제: '태어난 계절', 항목: ['봄', '여름', '가을', '겨울'] },
  { 주제: '좋아하는 색깔', 항목: ['빨강', '노랑', '파랑', '초록', '보라'] },
] as const;

/** 조사한 자료(표)를 보고 답하기 */
export const 자료읽기 = (최대: number, 꼴: '가장' | '모두' | '차' | '빈칸'): G5Family =>
  뭉치(`data-${꼴}-${최대}`, (next) => {
    const 조사 = 하나(next, 조사들);
    const 항목 = [...조사.항목].slice(0, 4);
    const 수 = 항목.map(() => 사이(next, 1, 최대));
    if (new Set(수).size < 4) return null;
    const 표 = 항목.map((h, k) => `${h} ${수[k]}명`).join(', ');
    const 앞말 = `우리 반 학생들의 ${조사.주제}을(를) 조사했더니 ${표}이었습니다.`;
    const 합 = 수.reduce((s, x) => s + x, 0);
    if (꼴 === '가장') {
      const 많이 = next(2) === 0;
      const 값 = 많이 ? Math.max(...수) : Math.min(...수);
      const 답 = 항목[수.indexOf(값)];
      return 결로(0, {
        prompt: `${앞말} 가장 ${많이 ? '많은' : '적은'} 학생이 고른 것은 무엇일까요?`, answer: 답, wrongs: 글오답(답, 항목),
        tag: 'data', strategy: '표에서 가장 많은 것과 적은 것 찾기', hint: '수를 하나씩 견주어 보세요.', steps: [`가장 ${많이 ? '큰' : '작은'} 수는 ${값}이므로 ${답}입니다.`],
      });
    }
    if (꼴 === '모두') return 수문항(1, `${앞말} 조사한 학생은 모두 몇 명일까요?`, 합, [합 - 수[0], 합 + 1, Math.max(...수) * 4], { 단위: '명', tag: 'data', strategy: '표의 합계 구하기', hint: '항목의 수를 모두 더해요.', steps: [`${수.join('+')}=${합}이므로 ${합}명입니다.`], 아래: 1 });
    if (꼴 === '차') {
      const [i, j] = 둘(next, [0, 1, 2, 3]);
      if (수[i] === 수[j]) return null;
      const [큰, 작] = 수[i] > 수[j] ? [i, j] : [j, i];
      const v = 수[큰] - 수[작];
      return 수문항(1, `${앞말} ${항목[큰]}을(를) 고른 학생은 ${항목[작]}을(를) 고른 학생보다 몇 명 더 많을까요?`, v, [수[큰] + 수[작], 수[큰], v + 1], { 단위: '명', tag: 'data', strategy: '표를 보고 두 항목의 차 구하기', hint: '많은 쪽에서 적은 쪽을 빼요.', steps: [`${수[큰]}-${수[작]}=${v}이므로 ${v}명입니다.`], 아래: 1, 빼기: true });
    }
    const 빈 = next(4);
    const 보이는 = 항목.map((h, k) => (k === 빈 ? `${h} □명` : `${h} ${수[k]}명`)).join(', ');
    return 수문항(2, `우리 반 학생 ${합}명의 ${조사.주제}을(를) 조사했더니 ${보이는}이었습니다. □에 알맞은 수는 얼마일까요?`, 수[빈], [합 - 수[빈], 수[(빈 + 1) % 4], 수[빈] + 1], { 단위: '명', tag: 'data', strategy: '합계에서 거꾸로 빠진 수 구하기', hint: '전체에서 알고 있는 수를 모두 빼요.', steps: [`${합}-${수.filter((_, k) => k !== 빈).join('-')}=${수[빈]}이므로 ${수[빈]}명입니다.`], 아래: 1, 빼기: true });
  });

/** 분류하고 세기 */
export const 분류세기 = (최대: number): G5Family =>
  뭉치(`classify-count-${최대}`, (next) => {
    const 기준 = 하나(next, [
      { 이름: '색깔', 값: ['빨간색', '노란색', '파란색'] },
      { 이름: '모양', 값: ['동그라미', '세모', '네모'] },
      { 이름: '종류', 값: ['연필', '지우개', '자'] },
    ]);
    const 수 = 기준.값.map(() => 사이(next, 1, 최대));
    if (new Set(수).size < 3) return null;
    const 물건 = 기준.이름 === '종류' ? '학용품' : 기준.이름 === '모양' ? '단추' : '블록';
    const 차 = next(2) === 0;
    const 앞 = `${물건}을(를) ${기준.이름}에 따라 분류했더니 ${기준.값.map((v, k) => `${v} ${수[k]}개`).join(', ')}였습니다.`;
    if (!차) {
      const 합 = 수.reduce((s, x) => s + x, 0);
      return 수문항(1, `${앞} ${물건}은(는) 모두 몇 개일까요?`, 합, [합 - 수[2], 합 + 1, Math.max(...수)], { 단위: '개', tag: 'classification', strategy: '분류한 것을 모두 세기', hint: '분류한 수를 모두 더해요.', steps: [`${수.join('+')}=${합}이므로 ${합}개입니다.`], 아래: 1 });
    }
    const 많 = 수.indexOf(Math.max(...수));
    const 적 = 수.indexOf(Math.min(...수));
    const v = 수[많] - 수[적];
    return 수문항(1, `${앞} 가장 많은 것은 가장 적은 것보다 몇 개 더 많을까요?`, v, [수[많], 수[많] + 수[적], v + 1], { 단위: '개', tag: 'classification', strategy: '분류한 결과를 견주기', hint: '가장 많은 것과 가장 적은 것을 먼저 찾아요.', steps: [`가장 많은 것은 ${기준.값[많]} ${수[많]}개, 가장 적은 것은 ${기준.값[적]} ${수[적]}개입니다.`, `${수[많]}-${수[적]}=${v}이므로 ${v}개입니다.`], 아래: 1, 빼기: true });
  });

// ── 규칙 ────────────────────────────────────────────────────────────

/** 수 배열의 규칙 */
export const 수배열 = (보폭: number[], 최대: number): G5Family =>
  뭉치(`number-seq-${보폭.join('-')}-${최대}`, (next) => {
    const k = 하나(next, 보폭);
    const 줄 = next(3) === 0;
    const a = 사이(next, 줄 ? k * 5 : 1, 최대 - k * 5);
    const 수 = Array.from({ length: 5 }, (_, j) => (줄 ? a - k * j : a + k * j));
    if (수.some((x) => x < 0 || x > 최대)) return null;
    const v = 수[4];
    return 수문항(1, `규칙에 따라 수를 늘어놓았습니다. ${수.slice(0, 4).join(', ')}, □ — □에 알맞은 수는 얼마일까요?`, v, [수[3] + (줄 ? 1 : -1), 수[3] + (줄 ? k : -k), v + (줄 ? -k : k)], {
      tag: 'pattern', strategy: '수 배열에서 규칙 찾기', hint: '이웃한 두 수의 차를 구해 보세요.', steps: [`${k}씩 ${줄 ? '작아지는' : '커지는'} 규칙입니다.`, `${수[3]}${줄 ? '-' : '+'}${k}=${v}입니다.`], 아래: 0, 빼기: true,
    });
  });

/** 되풀이되는 모양의 몇째 */
export const 반복모양 = (최대째: number): G5Family =>
  뭉치(`repeat-shape-${최대째}`, (next) => {
    const 모양 = [...하나(next, [['●', '▲'], ['●', '▲', '■'], ['★', '●', '●'], ['▲', '▲', '■'], ['■', '●', '▲', '●']])];
    const n = 사이(next, 모양.length + 2, 최대째);
    const 답 = 모양[(n - 1) % 모양.length];
    const 후보 = [...new Set(['●', '▲', '■', '★'])];
    const 보인 = Array.from({ length: 모양.length * 2 }, (_, k) => 모양[k % 모양.length]).join(' ');
    const 순서 = n <= 10 ? 째말[n] : `${n}번째`;
    return 결로(n > 10 ? 2 : 1, {
      prompt: `규칙에 따라 모양을 늘어놓았습니다. ${보인} … ${순서}에 올 모양은 무엇일까요?`,
      answer: 답, wrongs: 글오답(답, 후보), tag: 'pattern', strategy: '되풀이되는 부분으로 몇째 모양 알기',
      hint: `${모양.length}개가 한 묶음으로 되풀이돼요. ${n}을(를) 묶음으로 나누어 보세요.`,
      steps: [`${모양.join(' ')} ${모양.length}개가 되풀이됩니다.`, `${순서}는 묶음 안에서 ${째말[(n - 1) % 모양.length + 1]}이므로 ${답}입니다.`],
    });
  });

/** 덧셈표의 칸 */
export const 덧셈표칸 = (최대: number): G5Family =>
  뭉치(`add-table-${최대}`, (next) => {
    const a = 사이(next, 1, 최대);
    const b = 사이(next, 1, 최대);
    return 수문항(0, `덧셈표에서 가로줄의 ${a}과(와) 세로줄의 ${b}이(가) 만나는 칸에 들어갈 수는 얼마일까요?`, a + b, [a * b, a + b + 1, Math.abs(a - b)], {
      tag: 'pattern', strategy: '덧셈표 채우기', hint: '가로줄의 수와 세로줄의 수를 더해요.', steps: [`${a}+${b}=${a + b}입니다.`], 아래: 0,
    });
  });

/** 층마다 몇 개씩 늘어나는 쌓기 */
export const 늘어나는쌓기 = (최대: number): G5Family =>
  뭉치(`growing-stack-${최대}`, (next) => {
    const 처음 = 사이(next, 1, 4);
    const k = 사이(next, 1, 4);
    const n = 사이(next, 4, 7);
    const v = 처음 + k * (n - 1);
    if (v > 최대) return null;
    return 수문항(n > 5 ? 2 : 1, `쌓기나무를 첫째에 ${처음}개, 둘째에 ${처음 + k}개, 셋째에 ${처음 + 2 * k}개 쌓았습니다. 같은 규칙으로 쌓으면 ${째말[n]}에는 몇 개를 쌓을까요?`, v, [v - k, v + k, 처음 * n], {
      단위: '개', tag: 'pattern', strategy: '쌓은 모양에서 늘어나는 규칙 찾기', hint: '한 번 쌓을 때마다 몇 개씩 늘어나는지 보세요.',
      steps: [`${k}개씩 늘어나는 규칙입니다.`, `${째말[n]}에는 ${처음}+${k}×${n - 1}=${v}(개)입니다.`], 아래: 1,
    });
  });

/** 생활 속 규칙: 몇 분마다 떠나는 버스 */
export const 버스규칙 = (): G5Family =>
  뭉치('bus-rule', (next) => {
    const 간격 = 하나(next, [10, 15, 20, 30]);
    const h = 사이(next, 7, 10);
    const n = 사이(next, 3, 5);
    const 분 = 간격 * (n - 1);
    const 답 = 시각글(h * 60 + 분);
    return 결로(1, {
      prompt: `버스가 ${h}시에 처음 떠나고 ${간격}분마다 떠납니다. ${째말[n]} 버스가 떠나는 시각은 언제일까요?`,
      answer: 답, wrongs: 글오답(답, [시각글(h * 60 + 간격 * n), 시각글(h * 60 + 간격 * (n - 2)), 시각글(h * 60 + 분 + 5)]),
      tag: 'pattern', strategy: '생활 속 시간의 규칙 찾기', hint: `첫째 버스부터 ${간격}분씩 더해 가며 세어 보세요.`,
      steps: [`첫째 ${h}시, 그다음부터 ${간격}분씩 더합니다.`, `${째말[n]} 버스는 ${간격}×${n - 1}=${분}분 뒤인 ${답}에 떠납니다.`],
    });
  });

// ── 도형 ────────────────────────────────────────────────────────────

const 변수 = { 삼각형: 3, 사각형: 4, 원: 0 } as const;

/** 여러 도형의 꼭짓점(변)의 수 */
export const 꼭짓점합 = (도형들: Array<keyof typeof 변수>): G5Family =>
  뭉치(`vertex-sum-${도형들.join('')}`, (next) => {
    const [p, q] = 도형들.length > 1 ? 둘(next, 도형들) : [도형들[0], 도형들[0]];
    const a = 사이(next, 1, 6);
    const b = 사이(next, 1, 6);
    const 무엇 = next(2) === 0 ? '꼭짓점' : '변';
    const v = 변수[p] * a + (p === q ? 0 : 변수[q] * b);
    const 말 = p === q ? `${p} ${a}개` : `${p} ${a}개와 ${q} ${b}개`;
    return 수문항(1, `${말}의 ${무엇}은(는) 모두 몇 개일까요?`, v, [a + (p === q ? 0 : b), v + 1, 변수[p] * (a + b)], {
      단위: '개', tag: 'shape', strategy: '도형의 변과 꼭짓점 세기', hint: `${p}의 ${무엇}은(는) ${변수[p]}개예요.${p !== q ? ` ${q}의 ${무엇}은(는) ${변수[q]}개예요.` : ''}`,
      steps: [p === q ? `${변수[p]}×${a}=${v}` : `${변수[p]}×${a}+${변수[q]}×${b}=${v}`, `그러므로 ${v}개입니다.`], 아래: 0,
    });
  });

/** 칠교판 여러 벌의 조각 수 */
export const 칠교조각 = (): G5Family =>
  뭉치('tangram-pieces', (next) => {
    const n = 사이(next, 2, 9);
    const 무엇 = 하나(next, [['삼각형', 5], ['사각형', 2], ['조각', 7]] as const);
    const v = 무엇[1] * n;
    return 수문항(1, `칠교판 ${n}개를 모두 흩어 놓았습니다. ${무엇[0] === '조각' ? '조각은' : `${무엇[0]} 모양 조각은`} 모두 몇 개일까요?`, v, [n * 7, n * 5, n * 2, v + n].filter((x) => x !== v), {
      단위: '개', tag: 'shape', strategy: '칠교판 조각의 모양 알기', hint: '칠교판 한 개에는 삼각형 5조각, 사각형 2조각, 모두 7조각이 있어요.',
      steps: [`칠교판 한 개에 ${무엇[0]}${무엇[0] === '조각' ? '' : ' 모양 조각'}은(는) ${무엇[1]}개입니다.`, `${무엇[1]}×${n}=${v}이므로 ${v}개입니다.`], 아래: 1,
    });
  });

/** 층마다 쌓은 쌓기나무의 수 */
export const 층쌓기 = (): G5Family =>
  뭉치('layer-stack', (next) => {
    const 층 = Array.from({ length: 사이(next, 2, 3) }, () => 사이(next, 1, 6)).sort((x, y) => y - x);
    const v = 층.reduce((s, x) => s + x, 0);
    return 수문항(1, `쌓기나무를 ${층.map((x, k) => `${k + 1}층에 ${x}개`).join(', ')} 쌓았습니다. 쌓기나무는 모두 몇 개일까요?`, v, [층[0] * 층.length, v + 1, v - 1], {
      단위: '개', tag: 'solid', strategy: '층별로 세어 모두 몇 개인지 알기', hint: '층마다 센 수를 모두 더해요.', steps: [`${층.join('+')}=${v}이므로 ${v}개입니다.`], 아래: 1,
    });
  });

// ── 1학년 비교하기 ───────────────────────────────────────────────────

/** 무게·넓이·들이를 수로 견주기(1학년 4단원) */
export const 견주기 = (무엇: '무게' | '넓이' | '들이'): G5Family =>
  뭉치(`compare-${무엇}`, (next) => {
    const a = 사이(next, 2, 9);
    const b = 사이(next, 2, 9);
    if (a === b) return null;
    const [x, y] = 둘(next, 무엇 === '무게' ? ['필통', '가방', '사전', '인형', '상자'] : 무엇 === '넓이' ? ['손수건', '도화지', '색종이', '수첩', '달력'] : ['컵', '병', '주전자', '물통', '그릇']);
    const 말 = 무엇 === '무게'
      ? `${x}은(는) 바둑돌 ${a}개, ${y}은(는) 바둑돌 ${b}개와 무게가 같습니다. 더 무거운 것은 어느 것일까요?`
      : 무엇 === '넓이'
        ? `${x}은(는) 작은 칸 ${a}개, ${y}은(는) 작은 칸 ${b}개로 덮을 수 있습니다. 더 넓은 것은 어느 것일까요?`
        : `${x}에 가득 담은 물은 작은 컵으로 ${a}번, ${y}에 가득 담은 물은 작은 컵으로 ${b}번 부을 수 있습니다. 더 많이 담을 수 있는 것은 어느 것일까요?`;
    const 답 = a > b ? x : y;
    return 결로(1, {
      prompt: 말, answer: 답, wrongs: 글오답(답, [x, y, '둘이 똑같습니다', '알 수 없습니다']),
      tag: 'measurement', strategy: `같은 것을 몇 개로 견주어 ${무엇} 비교하기`, hint: '같은 것으로 견주었으니 수가 큰 쪽이 더 커요.',
      steps: [`${Math.max(a, b)}이(가) ${Math.min(a, b)}보다 크므로 ${답}입니다.`],
    });
  });

/** 몇째, 앞에서·뒤에서 */
export const 몇째 = (최대: number): G5Family =>
  뭉치(`ordinal-${최대}`, (next) => {
    const 모두 = 사이(next, 4, 최대);
    const 앞 = 사이(next, 1, 모두);
    const 뒤 = 모두 - 앞 + 1;
    const 누구 = 하나(next, 사람들);
    const 답 = 째말[뒤];
    return 결로(1, {
      prompt: `${모두}명이 한 줄로 서 있습니다. ${누구}은(는) 앞에서 ${째말[앞]}입니다. ${누구}은(는) 뒤에서 몇째일까요?`,
      answer: 답, wrongs: 글오답(답, [째말[앞], 째말[모두 - 앞] ?? 째말[뒤 + 1], 째말[뒤 + 1] ?? 째말[뒤 - 1], 째말[뒤 - 1] || 째말[뒤 + 2]].filter(Boolean) as string[]),
      tag: 'number', strategy: '앞에서와 뒤에서 순서 알기', hint: '그림을 그려 앞에서 세고, 다시 뒤에서 세어 보세요.',
      steps: [`${모두}명 가운데 앞에서 ${째말[앞]}이면 뒤에서는 ${모두}-${앞}+1=${뒤}째입니다.`, `그러므로 뒤에서 ${답}입니다.`], minusIsOperator: true,
    });
  });

/** 그림 없이 세는 모으기·가르기 */
export const 가르기 = (최대: number, 최소합 = 2): G5Family =>
  뭉치(`split-${최대}-${최소합}`, (next) => {
    const n = 사이(next, 최소합, 최대);
    const a = 사이(next, 1, n - 1);
    const 모으기 = next(2) === 0;
    if (모으기) return 수문항(0, `${a}과(와) ${n - a}을(를) 모으면 얼마일까요?`, n, [n - 1, n + 1, Math.abs(a - (n - a))], { tag: 'number', strategy: '두 수를 모으기', hint: '두 수를 이어서 세어 보세요.', steps: [`${a}과(와) ${n - a}을(를) 모으면 ${n}입니다.`], 아래: 0, 위: 최대 });
    return 수문항(0, `${n}은(는) ${a}과(와) 몇으로 가를 수 있을까요?`, n - a, [n, a, n - a + 1, n - a - 1], { tag: 'number', strategy: '수를 두 수로 가르기', hint: `${a}에서 ${n}까지 이어 세어 보세요.`, steps: [`${n}은(는) ${a}과(와) ${n - a}(으)로 가를 수 있습니다.`], 아래: 0, 위: 최대 });
  });
