import type { GridPoint, GridSegment } from '../../types';
import { resolveParticles } from '../grade5/util';
import { 고르개, 사이, 섞기, type 조작갈래 } from './common';

// ════════════════════════════════════════════════════════════════════
// 5~6학년 손 조작 문항 (2)
// ────────────────────────────────────────────────────────────────────
//   · 혼합 계산의 계산 순서대로 기호 누르기
//   · 수 배열표에서 공약수·공배수·수의 범위 색칠하기
//   · 막대·모눈에 분수와 소수의 계산만큼 색칠하기
//   · 올림·버림·반올림한 수, 분수의 곱, 나눗셈의 몫을 수직선에 놓기
//   · 막대를 고르게 맞추어 평균 알기, 가능성을 수로 나타내기
//   · 비에 맞게 구슬 놓기, 쌓기나무로 직육면체의 부피 만들기
//   · 분수·소수의 나눗셈을 조각 묶기로 하기, 바퀴가 구른 거리(원주) 긋기
//   · 입체도형 분류하기, 넓이가 정해진 도형·마름모 그리기
// ════════════════════════════════════════════════════════════════════

type 다음 = (n: number) => number;
const 뽑기 = <T,>(items: T[], k: number, next: 다음) => 섞기(items, next).slice(0, k);
const 최대공약 = (a: number, b: number): number => (b ? 최대공약(b, a % b) : a);
const 최소공배 = (a: number, b: number) => (a * b) / 최대공약(a, b);

// ── 혼합 계산의 순서 ──────────────────────────────────────────────
type 낱말 = { t: string; 원래: number };
const 기호들 = ['+', '-', '×', '÷'];
const 셈 = (a: number, op: string, b: number) => (op === '+' ? a + b : op === '-' ? a - b : op === '×' ? a * b : a / b);

/** 교과서의 약속(괄호 안 → 곱셈·나눗셈 → 덧셈·뺄셈, 같은 차례는 왼쪽부터)대로 한 번씩 계산하며 기호마다 계산한 식을 적습니다. */
export const 차례대로계산 = (tokens: string[]): { 차례: { at: number; 식: string }[]; 값: number } | null => {
  let 줄: 낱말[] = tokens.map((t, i) => ({ t, 원래: i }));
  const 차례: { at: number; 식: string }[] = [];
  while (줄.length > 1) {
    // 가장 안쪽 괄호를 찾습니다(괄호가 없으면 식 전체).
    let 왼 = -1;
    let 오 = 줄.length;
    for (let i = 0; i < 줄.length; i += 1) {
      if (줄[i].t === '(') 왼 = i;
      if (줄[i].t === ')' && 왼 >= 0) { 오 = i; break; }
    }
    const 안 = 줄.slice(왼 + 1, 오);
    if (안.length === 1) {
      줄 = [...줄.slice(0, 왼), 안[0], ...줄.slice(오 + 1)];
      continue;
    }
    let k = 안.findIndex((x) => x.t === '×' || x.t === '÷');
    if (k < 0) k = 안.findIndex((x) => x.t === '+' || x.t === '-');
    const a = Number(안[k - 1].t);
    const b = Number(안[k + 1].t);
    const v = 셈(a, 안[k].t, b);
    if (!Number.isInteger(v) || v < 0) return null;
    차례.push({ at: 안[k].원래, 식: `${a}${안[k].t}${b}` });
    const 새안 = [...안.slice(0, k - 1), { t: String(v), 원래: -1 }, ...안.slice(k + 2)];
    줄 = [...줄.slice(0, 왼 + 1), ...새안, ...줄.slice(오)];
  }
  return { 차례, 값: Number(줄[0].t) };
};

export const 계산순서 = (쓸기호: string[], 괄호: boolean, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `expr-order-${쓸기호.join('')}-${괄호 ? 'p' : 'n'}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const ops = Array.from({ length: 3 }, () => 쓸기호[next(쓸기호.length)]);
    if (new Set(ops).size < Math.min(2, 쓸기호.length)) return null;
    const nums = ops.map(() => 0).concat(0).map((_, i) => {
      const 곁 = [ops[i - 1], ops[i]];
      // 하: 작은 수, 중: 두 자리 수, 상: 큰 두 자리 수
      return 곁.includes('×') || 곁.includes('÷') ? 사이(next, 2, [5, 9, 9][lv]) : 사이(next, 3, [20, 40, 90][lv]);
    });
    // 나눗셈은 앞 수를 나누는 수의 배수로 고칩니다.
    ops.forEach((o, i) => { if (o === '÷') nums[i] = nums[i + 1] * 사이(next, 2, 9); });
    const tokens: string[] = [];
    const 괄호자리 = 괄호 ? next(3) : -1; // 괄호로 묶을 첫 수(두 수 또는 세 수)
    const 괄호길이 = 괄호 ? (next(2) ? 2 : 3) : 0;
    nums.forEach((n, i) => {
      if (i === 괄호자리) tokens.push('(');
      tokens.push(String(n));
      if (괄호 && i === 괄호자리 + 괄호길이 - 1) tokens.push(')');
      if (i < ops.length) tokens.push(ops[i]);
    });
    if (괄호 && 괄호자리 + 괄호길이 > nums.length) return null;
    const 풀이 = 차례대로계산(tokens);
    if (!풀이 || 풀이.값 > 999) return null;
    // 왼쪽부터 차례대로 계산하는 것과 순서가 같으면 생각할 거리가 없습니다.
    const 왼쪽부터 = 풀이.차례.every((c, i) => i === 0 || c.at > 풀이.차례[i - 1].at);
    if (왼쪽부터 && next(4)) return null;
    const 기호칸 = tokens.map((t, i) => (기호들.includes(t) ? i : -1)).filter((i) => i >= 0);
    const items = 기호칸.map((at) => {
      const k = 풀이.차례.findIndex((c) => c.at === at);
      return { label: 풀이.차례[k].식, value: k, at };
    });
    const 식 = tokens.join('').replace(/([+\-×÷])/g, ' $1 ').replace(/\( /g, '(').replace(/ \)/g, ')');
    const 차례글 = 풀이.차례.map((c) => c.식).join(' → ');
    // 식이 괄호로 끝나면 조사는 괄호 안 마지막 수의 소리를 따릅니다.
    const 끝수 = String(nums[nums.length - 1]);
    const 조사 = resolveParticles(`${끝수}을(를)`).slice(끝수.length);
    return {
      prompt: `${식}${조사} 계산하려고 합니다. 먼저 계산하는 것부터 차례로 기호를 눌러 보세요.`,
      answer: 차례글,
      manipulate: { kind: 'order', items, dir: 'asc', expr: tokens, why: '계산 순서가 달라요. 괄호 안을 가장 먼저, 그다음 곱셈과 나눗셈, 마지막에 덧셈과 뺄셈을 계산해요. 같은 차례끼리는 왼쪽부터예요.' },
      tag: 'mixedCalc',
      strategy: '혼합 계산의 순서 알기',
      hint: tokens.includes('(')
        ? '괄호가 있으면 괄호 안을 가장 먼저 계산해요. 그다음 ×, ÷를 찾고, 마지막에 +, -를 왼쪽부터 계산해요.'
        : ops.some((o) => o === '×' || o === '÷') && ops.some((o) => o === '+' || o === '-')
          ? '곱셈과 나눗셈을 덧셈과 뺄셈보다 먼저 계산해요. 같은 차례끼리는 왼쪽부터예요.'
          : '같은 차례의 계산만 있으면 왼쪽부터 차례로 계산해요.',
      steps: [
        '괄호 안 → 곱셈과 나눗셈 → 덧셈과 뺄셈의 차례로 계산하고, 같은 차례끼리는 왼쪽부터 계산합니다.',
        `${식}에서 이 약속대로 한 번에 하나씩 계산합니다.`,
        `계산하는 차례는 ${차례글}입니다.`,
      ],
      concept: '여러 가지 계산이 섞인 식은 괄호 안, 곱셈과 나눗셈, 덧셈과 뺄셈의 차례로 계산합니다.',
      misconception: '앞에서부터 차례로 계산하여 곱셈·나눗셈이나 괄호를 먼저 하지 않기 쉽습니다.',
      결: (lv === 2 ? Math.max(결, 1) : 결) as 0 | 1 | 2,
    };
  },
});

// ── 수 배열표: 공약수·공배수·수의 범위 ─────────────────────────────
export const 공약수배수색칠 = (종류: '공약수' | '최대공약수' | '공배수' | '최소공배수'): 조작갈래 => ({
  id: `numgrid-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 약수쪽 = 종류.includes('약수');
    // 하: 작은 두 수, 중: 중간, 상: 큰 두 수(공약수·공배수를 놓치기 쉬움)
    const a = 약수쪽 ? [사이(next, 4, 12), 사이(next, 8, 20), 사이(next, 16, 30)][lv] : [사이(next, 2, 4), 사이(next, 3, 6), 사이(next, 4, 9)][lv];
    const b = 약수쪽 ? [사이(next, 6, 16), 사이(next, 10, 24), 사이(next, 18, 30)][lv] : [사이(next, 3, 6), 사이(next, 4, 8), 사이(next, 6, 12)][lv];
    if (a >= b) return null;
    const g = 최대공약(a, b);
    const l = 최소공배(a, b);
    const parts = 약수쪽 ? 30 : 50;
    let 수들: number[];
    if (종류 === '공약수') { 수들 = Array.from({ length: g }, (_, i) => i + 1).filter((d) => g % d === 0); if (수들.length < 3) return null; }
    else if (종류 === '최대공약수') { 수들 = [g]; if (g < 3 || g === a) return null; }
    else if (종류 === '공배수') { 수들 = Array.from({ length: Math.floor(parts / l) }, (_, i) => l * (i + 1)); if (수들.length < 2 || l === a * b && next(2)) return null; }
    else { 수들 = [l]; if (l > parts || l === a * b || l === b) return null; }
    const 모두 = 종류 === '공약수' || 종류 === '공배수';
    return {
      prompt: `1부터 ${parts}까지의 수 배열표입니다. ${a}과(와) ${b}의 ${종류}${모두 ? '를 모두' : '을(를)'} 찾아 색칠해 보세요.`,
      answer: `${수들.join(', ')}`,
      manipulate: { kind: 'tap-fill', layout: 'numgrid', parts, cols: 10, pre: [], target: 수들.length, exact: 수들.map((v) => v - 1), from: 1 },
      tag: 'divisor',
      strategy: 약수쪽 ? '두 수의 약수를 각각 구해 공통인 수 찾기' : '두 수의 배수를 각각 구해 공통인 수 찾기',
      hint: 약수쪽
        ? `두 수의 약수를 각각 써 보고, 두 곳에 모두 있는 수를 찾아요.${종류 === '최대공약수' ? ' 그 가운데 가장 큰 수예요.' : ''}`
        : `큰 수의 배수를 작은 것부터 차례로 써 보며, 그 가운데 작은 수로도 나누어떨어지는 수를 찾아요.${종류 === '최소공배수' ? ' 그 가운데 가장 작은 수예요.' : ''}`,
      steps: 약수쪽
        ? [`${a}의 약수와 ${b}의 약수를 각각 구합니다.`, `두 수의 공통인 약수가 공약수이고, 그 가운데 가장 큰 수가 최대공약수 ${g}입니다.`, 종류 === '공약수' ? `공약수는 최대공약수 ${g}의 약수와 같으므로 ${수들.join(', ')}에 색칠합니다.` : `그러므로 ${g}에 색칠합니다.`]
        : [`${a}의 배수와 ${b}의 배수를 각각 구합니다.`, `두 수의 공통인 배수가 공배수이고, 그 가운데 가장 작은 수가 최소공배수 ${l}입니다.`, 종류 === '공배수' ? `공배수는 최소공배수 ${l}의 배수와 같으므로 ${수들.join(', ')}에 색칠합니다.` : `그러므로 ${l}에 색칠합니다.`],
      concept: 약수쪽 ? '두 수의 공약수는 두 수의 최대공약수의 약수와 같습니다.' : '두 수의 공배수는 두 수의 최소공배수의 배수와 같습니다.',
      misconception: 약수쪽 ? '한 수의 약수만 보고 칠하거나, 1을 빠뜨리기 쉽습니다.' : '두 수를 곱한 수만 공배수라고 생각하기 쉽습니다.',
      결: lv === 2 ? 2 : 모두 ? 1 : 2,
    };
  },
});

export const 범위색칠: 조작갈래 = {
  id: 'numgrid-range',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const from = [사이(next, 1, 3), 사이(next, 3, 6), 사이(next, 10, 40)][lv] * 10 + 1;
    const 아래 = from + 사이(next, 2, 9);
    const 위 = 아래 + 사이(next, 6, 14);
    if (위 > from + 29) return null;
    // 하: 이상·이하, 중: 초과·미만, 상: 섞어서
    const 아래말 = lv === 0 ? '이상' : lv === 1 ? '초과' : next(2) ? '이상' : '초과';
    const 위말 = lv === 0 ? '이하' : lv === 1 ? '미만' : 아래말 === '이상' ? '미만' : '이하';
    const 수들: number[] = [];
    for (let v = from; v < from + 30; v += 1) if ((아래말 === '이상' ? v >= 아래 : v > 아래) && (위말 === '이하' ? v <= 위 : v < 위)) 수들.push(v);
    return {
      prompt: `${아래} ${아래말} ${위} ${위말}인 수를 수 배열표에서 모두 찾아 색칠해 보세요.`,
      answer: `${수들[0]}부터 ${수들[수들.length - 1]}까지`,
      manipulate: { kind: 'tap-fill', layout: 'numgrid', parts: 30, cols: 10, pre: [], target: 수들.length, exact: 수들.map((v) => v - from), from },
      tag: 'range',
      strategy: '이상·이하·초과·미만에서 경계의 수가 들어가는지 가리기',
      hint: `'이상'과 '이하'는 경계의 수가 들어가고, '초과'와 '미만'은 들어가지 않아요. ${아래}과(와) ${위}을(를) 칠하는지 먼저 정해요.`,
      steps: [`${아래} ${아래말}은(는) ${아래}${아래말 === '이상' ? '과(와) 같거나 큰 수' : '보다 큰 수'}입니다.`, `${위} ${위말}은(는) ${위}${위말 === '이하' ? '과(와) 같거나 작은 수' : '보다 작은 수'}입니다.`, '두 조건을 모두 만족하는 수에만 색칠합니다.'],
      concept: '이상과 이하는 경계의 수를 포함하고, 초과와 미만은 포함하지 않습니다.',
      misconception: '경계의 수를 넣을지 뺄지 거꾸로 생각하기 쉽습니다.',
      결: lv === 2 ? 2 : 1,
    };
  },
};

// ── 막대·모눈에 계산만큼 색칠 ─────────────────────────────────────
export const 분수막대계산 = (종류: 'add' | 'add-over' | 'sub'): 조작갈래 => ({
  id: `frac-bar-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 한 분모가 다른 분모의 배수(2와 4), 중: 여러 가지, 상: 두 분모를 곱해야 하는 경우(3과 4)
    const [d1, d2] = lv === 0 ? 뽑기([[2, 4], [3, 6], [2, 6]], 1, next)[0] : lv === 1 ? 뽑기([2, 3, 4, 6], 2, next) : 뽑기([[3, 4], [4, 6], [2, 3]], 1, next)[0];
    const L = 최소공배(d1, d2);
    const n1 = 사이(next, 1, d1 - 1);
    const n2 = 사이(next, 1, d2 - 1);
    const 칸1 = (n1 * L) / d1;
    const 칸2 = (n2 * L) / d2;
    const 칸 = 종류 === 'sub' ? 칸1 - 칸2 : 칸1 + 칸2;
    if (종류 === 'add' && 칸 >= L) return null;
    if (종류 === 'add-over' && 칸 <= L) return null;
    if (종류 === 'sub' && 칸 <= 0) return null;
    const 막대 = 종류 === 'add-over' ? 2 : 1;
    const 식 = `${n1}/${d1}${종류 === 'sub' ? '-' : '+'}${n2}/${d2}`;
    return {
      prompt: `1을 ${L}칸으로 똑같이 나눈 막대${막대 === 2 ? ' 2개를 이어 놓았습니다' : '입니다'}. ${식}만큼 칸을 색칠해 보세요.`,
      answer: `${L * 막대}칸 가운데 ${칸}칸`,
      manipulate: { kind: 'tap-fill', layout: 'bar', parts: L * 막대, pre: [], target: 칸 },
      tag: 'fractionAdd',
      strategy: '통분하여 분모가 같은 분수로 계산하기',
      hint: `한 칸은 1/${L}이에요. ${n1}/${d1}과(와) ${n2}/${d2}이(가) 각각 몇 칸인지 분모를 ${L}(으)로 통분해 보세요.`,
      steps: [`${n1}/${d1}=${칸1}/${L}, ${n2}/${d2}=${칸2}/${L}입니다.`, `${칸1}/${L}${종류 === 'sub' ? '-' : '+'}${칸2}/${L}=${칸}/${L}입니다.`, `그러므로 1/${L}인 칸을 ${칸}칸 색칠합니다.`],
      concept: '분모가 다른 분수의 덧셈과 뺄셈은 통분하여 분모를 같게 한 다음 분자끼리 계산합니다.',
      misconception: '분모끼리, 분자끼리 더하거나 빼기 쉽습니다.',
      결: lv === 2 ? 2 : 종류 === 'add' ? 1 : lv === 0 ? 1 : 2,
    };
  },
});

export const 소수모눈 = (종류: 'mul-nat' | 'mul-dec' | 'div' | 'div-nat'): 조작갈래 => ({
  id: `dec-grid-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    let 식: string;
    let 칸: number;
    let 걸음: [string, string];
    if (종류 === 'mul-nat') {
      const a = [사이(next, 5, 15), 사이(next, 11, 25), 사이(next, 15, 33)][lv];
      const k = [2, 사이(next, 2, 3), 사이(next, 3, 4)][lv];
      칸 = a * k;
      if (칸 > 100 || a % 10 === 0) return null;
      식 = `${(a / 100).toFixed(2)}×${k}`;
      걸음 = [`${(a / 100).toFixed(2)}은(는) 0.01이 ${a}개입니다.`, `${(a / 100).toFixed(2)}×${k}은(는) 0.01이 ${a}×${k}=${칸}(개)입니다.`];
    } else if (종류 === 'mul-dec') {
      const a = [사이(next, 2, 4), 사이(next, 3, 6), 사이(next, 6, 9)][lv];
      const b = [사이(next, 2, 4), 사이(next, 3, 6), 사이(next, 6, 9)][lv];
      칸 = a * b;
      식 = `0.${a}×0.${b}`;
      걸음 = [`모눈의 가로를 0.${a}만큼, 세로를 0.${b}만큼 잡으면 겹치는 부분이 0.${a}×0.${b}입니다.`, `겹치는 부분은 가로 ${a}칸, 세로 ${b}칸이므로 ${a}×${b}=${칸}(칸)이고, 한 칸은 0.01입니다.`];
    } else {
      const k = [사이(next, 2, 3), 사이(next, 3, 6), 사이(next, 6, 9)][lv];
      const q = [사이(next, 3, 30), 사이(next, 11, 60), 사이(next, 31, 99)][lv];
      if (q * k > 999 || q % 10 === 0) return null;
      칸 = q;
      if (종류 === 'div-nat') {
        // (자연수)÷(자연수)의 몫을 소수로: 3÷4=0.75
        const 짝 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [7, 10], [9, 20], [7, 25], [3, 20]];
        const [a, b] = 짝[next(짝.length)];
        칸 = (a * 100) / b;
        식 = `${a}÷${b}`;
        걸음 = [`${a}을(를) ${a * 100}/100으로 생각하면 0.01이 ${a * 100}개입니다.`, `0.01이 ${a * 100}÷${b}=${칸}(개)이므로 몫은 ${(칸 / 100).toFixed(2)}입니다.`];
      } else {
        식 = `${((q * k) / 100).toFixed(2)}÷${k}`;
        걸음 = [`${((q * k) / 100).toFixed(2)}은(는) 0.01이 ${q * k}개입니다.`, `0.01이 ${q * k}÷${k}=${q}(개)이므로 몫은 ${(q / 100).toFixed(2)}입니다.`];
      }
    }
    if (칸 >= 100) return null;
    const 몫으로 = 종류 === 'div-nat';
    return {
      prompt: `1을 100칸으로 똑같이 나눈 모눈입니다. ${식}${몫으로 ? '의 몫' : ''}만큼 칸을 색칠해 보세요.`,
      answer: `100칸 가운데 ${칸}칸`,
      manipulate: { kind: 'tap-fill', layout: 'grid', parts: 100, cols: 10, pre: [], target: 칸 },
      tag: 종류.startsWith('mul') ? 'decimal' : 'decimalDiv',
      strategy: '0.01이 몇 개인지로 소수의 계산하기',
      hint: 종류 === 'mul-dec' ? '모눈의 가로 10칸이 1, 세로 10칸이 1이에요. 가로와 세로를 소수만큼 잡아 겹치는 부분을 생각해요.' : '모눈 한 칸은 0.01이에요. 소수를 0.01이 몇 개인지로 바꾸어 계산해 보세요.',
      steps: [걸음[0], 걸음[1], `그러므로 모눈을 ${칸}칸 색칠합니다.`],
      concept: '소수의 계산은 0.1이나 0.01이 몇 개인지 생각하면 자연수처럼 계산할 수 있습니다.',
      misconception: 종류 === 'mul-dec' ? '0.3×0.4를 1.2나 0.0012로 소수점 자리를 잘못 생각하기 쉽습니다.' : '소수점의 자리를 잘못 옮기기 쉽습니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
});

// ── 수직선에 놓기 ─────────────────────────────────────────────────
export const 어림수직선 = (방법: '올림' | '버림' | '반올림', 자리: 10 | 100): 조작갈래 => ({
  id: `nl-round-${방법}-${자리}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const n = 자리 === 10 ? 사이(next, 101, 989) : 사이(next, 1001, 9899);
    if (n % 자리 === 0) return null;
    // 반올림에서 5를 다루는 문제를 자주 내려고 반쯤은 바로 아랫자리를 5로 둡니다.
    const m = 방법 === '반올림' && next(3) === 0 ? n - (n % 자리) + 자리 / 2 + (자리 === 100 ? 사이(next, 0, 9) : 0) : n;
    const 아래 = m - (m % 자리);
    const 답 = 방법 === '버림' ? 아래 : 방법 === '올림' ? 아래 + 자리 : (m % 자리 >= 자리 / 2 ? 아래 + 자리 : 아래);
    const 시작 = 아래 - 자리;
    const 한칸 = 자리 / 10;
    const labels = [0, 10, 20, 30].map((k) => ({ at: k, text: String(시작 + k * 한칸) }));
    const 자리말 = 자리 === 10 ? '십' : '백';
    const 아랫자리 = 자리 === 10 ? '일' : '십';
    return {
      prompt: `${m}을(를) ${방법}하여 ${자리말}의 자리까지 나타낸 수를 수직선에서 찾아 점을 놓아 보세요.`,
      answer: String(답),
      manipulate: { kind: 'number-line', ticks: 30, labels, target: (답 - 시작) / 한칸, minor: 10 },
      tag: 'rounding',
      strategy: `${방법}하여 나타낸 수를 수직선에서 찾기`,
      hint: 방법 === '반올림'
        ? `${아랫자리}의 자리 숫자를 보세요. 0, 1, 2, 3, 4이면 버리고, 5, 6, 7, 8, 9이면 올려요. ${m}이(가) 수직선의 어느 두 큰 눈금 사이에 있는지 먼저 찾아요.`
        : `${m}은(는) 수직선의 어느 두 큰 눈금 사이에 있을까요? ${방법 === '올림' ? '그 가운데 큰' : '그 가운데 작은'} 눈금이 ${방법}한 수예요.`,
      steps: [
        `${m}은(는) ${아래}과(와) ${아래 + 자리} 사이에 있습니다.`,
        방법 === '반올림' ? `${아랫자리}의 자리 숫자가 ${Math.floor((m % 자리) / 한칸)}이므로 ${m % 자리 >= 자리 / 2 ? '올립니다' : '버립니다'}.` : `${방법}은(는) ${자리말}의 자리 아래 수를 ${방법 === '올림' ? '올려서 나타내는' : '버려서 나타내는'} 방법입니다.`,
        `그러므로 ${답}에 점을 놓습니다.`,
      ],
      concept: '올림은 구하려는 자리 아래 수를 올리고, 버림은 버리고, 반올림은 바로 아래 자리 숫자가 5 이상이면 올리고 4 이하이면 버립니다.',
      misconception: '어느 자리 숫자를 보아야 하는지 헷갈리거나, 반올림에서 5를 버리기 쉽습니다.',
      결: 방법 === '반올림' ? 2 : 1,
    };
  },
});

const 대분수글 = (n: number, d: number) => (n % d === 0 ? String(n / d) : n > d ? resolveParticles(`${Math.floor(n / d)}과(와) ${n % d}/${d}`) : `${n}/${d}`);

export const 분수곱수직선 = (대분수: boolean): 조작갈래 => ({
  id: `nl-frac-mul-${대분수 ? 'm' : 'p'}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const d = [사이(next, 3, 4), 사이(next, 4, 5), 사이(next, 5, 6)][lv];
    const n = 대분수 ? d + 사이(next, 1, d - 1) : 사이(next, 1, d - 1);
    const k = 대분수 ? 2 : [2, 3, 4][lv];
    const 곱 = n * k;
    const 끝 = Math.ceil(곱 / d);
    if (끝 > 4 || 곱 % d === 0) return null;
    const 앞말 = 대분수글(n, d);
    const 식 = `${대분수 ? `(${앞말})` : 앞말}×${k}`;
    return {
      prompt: `수직선에서 ${식}을(를) 나타내는 곳에 점을 놓아 보세요.`,
      answer: 대분수글(곱, d),
      manipulate: { kind: 'number-line', ticks: d * 끝, labels: Array.from({ length: 끝 + 1 }, (_, i) => ({ at: i * d, text: String(i) })), target: 곱, minor: d },
      tag: 'fraction',
      strategy: '분수만큼씩 여러 번 뛰어 세기',
      hint: `작은 눈금 한 칸은 1/${d}이에요. ${앞말}은(는) 1/${d}이 ${n}개이니, ${n}칸씩 ${k}번 뛰어 세어 보세요.`,
      steps: [`${앞말}은(는) 1/${d}이 ${n}개입니다.`, `${식}은(는) 1/${d}이 ${n}×${k}=${곱}(개)입니다.`, `그러므로 0에서 작은 눈금 ${곱}칸 간 곳, ${대분수글(곱, d)}에 점을 놓습니다.`],
      concept: '(분수)×(자연수)는 분수를 자연수만큼 더한 것과 같으므로 분자에 자연수를 곱합니다.',
      misconception: '분모에도 자연수를 곱하거나, 대분수의 자연수 부분에만 곱하기 쉽습니다.',
      결: lv === 2 || (대분수 && lv === 1) ? 2 : 1,
    };
  },
});

export const 나눗셈몫수직선 = (넘는: boolean): 조작갈래 => ({
  id: `nl-div-frac-${넘는 ? 'over' : 'under'}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const b = [사이(next, 3, 4), 사이(next, 4, 6), 사이(next, 6, 8)][lv];
    const a = 넘는 ? 사이(next, b + 1, b * (lv === 0 ? 2 : 3) - 1) : 사이(next, 2, b - 1);
    if (a % b === 0) return null;
    const 끝 = Math.ceil(a / b);
    return {
      prompt: `수직선에서 ${a}÷${b}의 몫을 나타내는 곳에 점을 놓아 보세요.`,
      answer: 대분수글(a, b),
      manipulate: { kind: 'number-line', ticks: b * 끝, labels: Array.from({ length: 끝 + 1 }, (_, i) => ({ at: i * b, text: String(i) })), target: a, minor: b },
      tag: 'fractionDiv',
      strategy: '(자연수)÷(자연수)의 몫을 분수로 나타내기',
      hint: `1÷${b}은(는) 1/${b}이에요. ${a}÷${b}은(는) 1/${b}이 몇 개인지 생각해 보세요.`,
      steps: [`1÷${b}=1/${b}입니다.`, `${a}÷${b}은(는) 1/${b}이 ${a}개이므로 ${a}/${b}입니다.`, `그러므로 0에서 작은 눈금 ${a}칸 간 곳, ${대분수글(a, b)}에 점을 놓습니다.`],
      concept: '(자연수)÷(자연수)의 몫은 나누어지는 수를 분자, 나누는 수를 분모로 하는 분수로 나타낼 수 있습니다.',
      misconception: '나누는 수와 나누어지는 수를 바꾸어 분자와 분모에 쓰기 쉽습니다.',
      결: lv === 2 || 넘는 ? 2 : 1,
    };
  },
});

export const 몫반올림수직선: 조작갈래 = {
  id: 'nl-div-round',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const b = lv === 0 ? 3 : [6, 7, 9][next(3)];
    const a = [사이(next, b + 1, b * 3), 사이(next, b * 2, b * 6), 사이(next, b * 5, b * 9)][lv];
    if (a % b === 0) return null;
    const 백배 = Math.floor((a * 100) / b);
    const 답10 = Math.floor(백배 / 10) + (백배 % 10 >= 5 ? 1 : 0);
    const 자연 = Math.floor(a / b);
    if (Math.floor(답10 / 10) !== 자연) return null;
    return {
      prompt: `${a}÷${b}의 몫을 반올림하여 소수 첫째 자리까지 나타낸 수를 수직선에서 찾아 점을 놓아 보세요.`,
      answer: (답10 / 10).toFixed(1),
      manipulate: { kind: 'number-line', ticks: 10, labels: [{ at: 0, text: String(자연) }, { at: 10, text: String(자연 + 1) }], target: 답10 - 자연 * 10 },
      tag: 'decimalDiv',
      strategy: '몫을 소수 둘째 자리까지 구해 반올림하기',
      hint: `${a}÷${b}의 몫을 소수 둘째 자리까지 구해 보세요. 둘째 자리 숫자가 5 이상이면 첫째 자리를 1 올려요.`,
      steps: [`${a}÷${b}의 몫을 소수 둘째 자리까지 구하면 ${(백배 / 100).toFixed(2)}…입니다.`, `소수 둘째 자리 숫자가 ${백배 % 10}이므로 ${백배 % 10 >= 5 ? '올립니다' : '버립니다'}.`, `그러므로 ${(답10 / 10).toFixed(1)}에 점을 놓습니다.`],
      concept: '몫을 반올림하여 소수 첫째 자리까지 나타내려면 소수 둘째 자리에서 반올림합니다.',
      misconception: '소수 첫째 자리 숫자를 보고 반올림하기 쉽습니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
};

// ── 평균과 가능성 ─────────────────────────────────────────────────
const 친구들 = ['민준', '서연', '도윤', '하은', '지호', '수아'];
export const 평균고르기 = (사람: number): 조작갈래 => ({
  id: `mean-level-${사람}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 평균 = 사이(next, 3, 6);
    const vals = Array.from({ length: 사람 }, () => 평균);
    // 평균은 그대로 두고 몇 권씩 옮겨 들쭉날쭉하게 만듭니다.
    for (let t = 0; t < 사람 * 2; t += 1) {
      const i = next(사람);
      const j = next(사람);
      if (i === j || vals[i] <= 1 || vals[j] >= 9) continue;
      vals[i] -= 1;
      vals[j] += 1;
    }
    if (vals.every((v) => v === 평균) || vals.filter((v) => v === 평균).length > 1) return null;
    const 이름 = 친구들.slice(0, 사람);
    const 표 = 이름.map((x, i) => `${x} ${vals[i]}권`).join(', ');
    const 합 = vals.reduce((a, b) => a + b, 0);
    return {
      prompt: `친구들이 읽은 책 수입니다. ${표}. 막대의 높이를 고르게 하면 평균이 됩니다. 모든 막대를 평균 높이로 맞추어 보세요.`,
      answer: `모두 ${평균}권`,
      manipulate: { kind: 'bars', style: 'bar', labels: 이름, values: vals.map(() => 평균), max: 10, step: 1, pre: [], unitLabel: '권', start: vals },
      tag: 'average',
      strategy: '많은 쪽에서 적은 쪽으로 옮겨 고르게 하기',
      hint: '가장 높은 막대에서 하나를 덜어 가장 낮은 막대에 채워 보세요. 모든 막대가 같아질 때까지 되풀이해요. 막대를 다 더한 수는 그대로예요.',
      steps: [`책 수를 모두 더하면 ${vals.join('+')}=${합}(권)입니다.`, `${합}÷${사람}=${평균}이므로 고르게 하면 한 사람이 ${평균}권씩입니다.`, `그러므로 모든 막대를 ${평균}권에 맞춥니다.`],
      concept: '자료의 값을 고르게 하여 나타낸 수를 평균이라고 합니다. 평균은 (자료의 값을 모두 더한 수)÷(자료의 수)입니다.',
      misconception: '가장 큰 값과 가장 작은 값의 가운데를 평균이라고 생각하기 쉽습니다.',
      결: 사람 > 4 ? 2 : 1,
    };
  },
});

const 회전판말 = (k: number) => `빨간 칸이 ${k}칸`;
export const 가능성수직선: 조작갈래 = {
  id: 'nl-chance',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 일들: [string, number][] = [
      ...[0, 1, 2, 3, 4].map((k) => [`똑같이 4칸으로 나눈 회전판에서 ${회전판말(k)}일 때, 화살이 빨간 칸에 멈출 가능성`, k] as [string, number]),
      ['주사위를 한 번 굴릴 때 짝수의 눈이 나올 가능성', 2],
      ['동전을 한 번 던질 때 그림 면이 나올 가능성', 2],
      ['흰 바둑돌만 4개 든 주머니에서 검은 바둑돌을 꺼낼 가능성', 0],
      ['흰 바둑돌만 4개 든 주머니에서 흰 바둑돌을 꺼낼 가능성', 4],
    ];
    // 하: 불가능·확실, 중: 반반, 상: 1/4·3/4
    const 고른일 = 일들.filter(([, k]) => (lv === 0 ? k === 0 || k === 4 : lv === 1 ? k === 2 : k === 1 || k === 3));
    const [말, k] = 고른일[next(고른일.length)];
    const 수 = ['0', '1/4', '1/2', '3/4', '1'][k];
    return {
      prompt: `${말}을 수로 나타내어 수직선에 점을 놓아 보세요.`,
      answer: `${수}의 자리`,
      manipulate: { kind: 'number-line', ticks: 4, labels: [{ at: 0, text: '0' }, { at: 2, text: '1/2' }, { at: 4, text: '1' }], target: k },
      tag: 'possibility',
      strategy: '일이 일어날 가능성을 0, 1/2, 1과 견주어 수로 나타내기',
      hint: '불가능하면 0, 반반이면 1/2, 확실하면 1이에요. 그 사이라면 전체 가운데 일어나는 경우가 얼마인지 생각해요.',
      steps: ['일이 일어날 가능성은 0부터 1까지의 수로 나타냅니다.', '불가능하면 0, 반반이면 1/2, 확실하면 1입니다.', `이 일은 ${수}이므로 그 자리에 점을 놓습니다.`],
      concept: '가능성을 수로 나타내면 불가능은 0, 반반은 1/2, 확실은 1입니다.',
      misconception: '가능성을 개수(1칸, 3칸)로 나타내기 쉽습니다. 전체에 대한 크기로 나타내야 합니다.',
      결: lv,
    };
  },
};

export const 가능성순서: 조작갈래 = {
  id: 'order-chance',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const ks = 뽑기([0, 1, 2, 3, 4], [3, 4, 5][lv], next);
    const 높은 = next(2) === 0;
    const items = ks.map((k) => ({ label: 회전판말(k), value: k / 4 }));
    const 정렬 = [...items].sort((a, b) => (높은 ? b.value - a.value : a.value - b.value));
    if (정렬.every((x, i) => x === items[i])) return null;
    return {
      prompt: `똑같이 4칸으로 나눈 회전판 여러 개가 있습니다. 화살이 빨간 칸에 멈출 가능성이 ${높은 ? '높은' : '낮은'} 것부터 차례로 눌러 늘어놓아 보세요.`,
      answer: 정렬.map((x) => x.label).join(높은 ? ' > ' : ' < '),
      manipulate: { kind: 'order', items, dir: 높은 ? 'desc' : 'asc', why: '빨간 칸이 많을수록 화살이 빨간 칸에 멈출 가능성이 높아요. 4칸 가운데 빨간 칸이 몇 칸인지 견주어 보세요.' },
      tag: 'possibility',
      strategy: '일이 일어날 가능성 비교하기',
      hint: '빨간 칸이 4칸 가운데 몇 칸인지 보세요. 빨간 칸이 많을수록 가능성이 높아요.',
      steps: ['전체 칸 수가 같으므로 빨간 칸의 수만 견주면 됩니다.', '빨간 칸이 많을수록 빨간 칸에 멈출 가능성이 높습니다.', `그러므로 ${정렬.map((x) => x.label).join(높은 ? ' > ' : ' < ')} 차례입니다.`],
      concept: '일이 일어날 가능성은 전체 가운데 그 일이 일어나는 경우가 많을수록 높습니다.',
      misconception: '빨간 칸이 0칸이면 가능성이 조금은 있다고 생각하기 쉽습니다. 0칸이면 불가능합니다.',
      결: lv === 2 ? 2 : 1,
    };
  },
};

// ── 비에 맞게 놓기 ────────────────────────────────────────────────
export const 비만큼놓기 = (종류: 'ratio' | 'proportion'): 조작갈래 => ({
  id: `ratio-objects-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 1 : 몇, 중: 작은 비, 상: 전항이 후항보다 큰 비와 큰 배수
    const a = lv === 0 ? 1 : lv === 1 ? 사이(next, 2, 3) : 사이(next, 4, 5);
    const b = lv === 2 ? 사이(next, 2, 3) : 사이(next, 2, 5);
    if (a === b || 최대공약(a, b) !== 1) return null;
    const 배 = [2, 사이(next, 2, 3), 사이(next, 3, 4)][lv];
    const 파랑 = b * 배;
    const 빨강 = a * 배;
    if (빨강 > 18) return null;
    const parts = Math.min(24, 빨강 + 사이(next, 3, 6));
    const 비례식 = 종류 === 'proportion';
    return {
      prompt: 비례식
        ? `파란 구슬이 ${파랑}개 있습니다. ${a} : ${b}=□ : ${파랑}이(가) 되도록, 빨간 구슬을 □개만큼 눌러 놓아 보세요.`
        : `파란 구슬이 ${파랑}개 있습니다. 빨간 구슬 수와 파란 구슬 수의 비가 ${a} : ${b}이(가) 되도록 빨간 구슬을 눌러 놓아 보세요.`,
      answer: `빨간 구슬 ${빨강}개`,
      manipulate: { kind: 'tap-fill', layout: 'objects', parts, cols: 6, pre: [], target: 빨강, emoji: '🔴' },
      tag: 'ratio',
      strategy: 비례식 ? '비의 성질로 비례식의 □ 구하기' : '비를 보고 두 양의 크기 정하기',
      hint: `파란 구슬 ${파랑}개는 ${b}의 몇 배인지 먼저 구해요. 빨간 구슬도 ${a}의 그만큼 배가 되어야 해요.`,
      steps: [`${파랑}÷${b}=${배}이므로 파란 구슬은 ${b}의 ${배}배입니다.`, `비의 전항과 후항에 같은 수를 곱해도 비율은 같으므로 빨간 구슬도 ${a}의 ${배}배입니다.`, `${a}×${배}=${빨강}이므로 빨간 구슬을 ${빨강}개 놓습니다.`],
      concept: '비의 전항과 후항에 0이 아닌 같은 수를 곱하거나 나누어도 비율은 같습니다.',
      misconception: `빨간 구슬을 ${a}개만 놓거나, 파란 구슬 수에서 빼서 구하기 쉽습니다.`,
      결: lv === 2 || 비례식 ? 2 : 1,
    };
  },
});

// ── 쌓기나무로 부피 ───────────────────────────────────────────────
export const 부피쌓기 = (높이로: boolean): 조작갈래 => ({
  id: `volume-stack-${높이로 ? 'h' : 'd'}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 가로 = lv === 0 ? 2 : 3;
    const 세로 = [1, 2, 3][lv];
    const 높이 = lv === 0 ? 2 : 사이(next, 2, 3);
    const 부피 = 가로 * 세로 * 높이;
    const target = Array.from({ length: 세로 }, () => Array.from({ length: 가로 }, () => 높이));
    return {
      prompt: 높이로
        ? `부피가 1 cm³인 쌓기나무로 가로 ${가로} cm, 세로 ${세로} cm이고 부피가 ${부피} cm³인 직육면체를 쌓아 보세요.`
        : `부피가 1 cm³인 쌓기나무로 가로 ${가로} cm, 세로 ${세로} cm, 높이 ${높이} cm인 직육면체를 쌓아 보세요.`,
      answer: `쌓기나무 ${부피}개(높이 ${높이}층)`,
      manipulate: { kind: 'stack-build', rows: 세로, cols: 가로, maxH: 3, show: 'none', target, check: 'exact' },
      tag: 'volume',
      strategy: 높이로 ? '부피와 밑면의 넓이로 높이 구하기' : '쌓기나무 수로 부피 알기',
      hint: 높이로 ? `한 층에 쌓기나무가 ${가로}×${세로}개 놓여요. 몇 층을 쌓아야 ${부피}개가 될까요?` : `한 층에 가로 ${가로}개, 세로 ${세로}개씩 놓고, 그런 층을 높이만큼 쌓아요. 아래 칸을 누를 때마다 한 층씩 올라가요.`,
      steps: [`한 층에는 쌓기나무가 ${가로}×${세로}=${가로 * 세로}(개) 놓입니다.`, 높이로 ? `${부피}÷${가로 * 세로}=${높이}이므로 ${높이}층을 쌓아야 합니다.` : `${높이}층을 쌓으면 ${가로 * 세로}×${높이}=${부피}(개)입니다.`, `그러므로 칸마다 ${높이}층씩 쌓으면 부피는 ${부피} cm³입니다.`],
      concept: '직육면체의 부피는 (가로)×(세로)×(높이)입니다. 쌓기나무 하나의 부피가 1 cm³이면 쌓기나무 수가 곧 부피입니다.',
      misconception: '겉에 보이는 쌓기나무만 세거나, 한 층만 쌓기 쉽습니다.',
      결: lv === 2 || 높이로 ? 2 : 1,
    };
  },
});

// ── 분수·소수의 나눗셈을 조각 묶기로 ──────────────────────────────
export const 조각묶기 = (종류: 'frac' | 'frac-rest' | 'dec' | 'nat-dec' | 'nat-frac' | 'frac-diff' | 'mixed-frac' | 'dec-rest'): 조작갈래 => ({
  id: `share-unit-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    if (종류 === 'nat-frac' || 종류 === 'frac-diff' || 종류 === 'mixed-frac' || 종류 === 'dec-rest') return 조각묶기더(종류, next, lv);
    const 소수 = 종류 === 'dec' || 종류 === 'nat-dec';
    const d = 소수 ? 10 : [사이(next, 5, 7), 사이(next, 7, 9), 사이(next, 9, 12)][lv];
    let size = 소수 ? [2, 사이(next, 3, 4), 사이(next, 5, 7)][lv] : [2, 사이(next, 2, 3), 사이(next, 3, 4)][lv];
    let 몫 = 소수 ? [사이(next, 2, 3), 사이(next, 3, 5), 사이(next, 4, 5)][lv] : [2, 사이(next, 2, 3), 사이(next, 2, 3)][lv];
    if (종류 === 'nat-dec') {
      // (자연수)÷(소수): 하 1÷0.5, 중 2÷0.4·2÷0.5, 상 3÷0.5·3÷0.6
      const 짝 = [[[10, 5], [10, 2]], [[20, 5], [20, 4]], [[30, 5], [30, 6]]][lv][next(2)];
      size = 짝[1];
      몫 = 짝[0] / 짝[1];
    }
    const 남 = 종류 === 'frac-rest' ? 사이(next, 1, size - 1) : 0;
    const total = size * 몫 + 남;
    if (total >= d && !소수) return null;
    if (종류 === 'nat-dec' && total % 10 !== 0) return null;
    if (total > 36) return null;
    const 단위 = 소수 ? '0.1' : `1/${d}`;
    const 앞 = 소수 ? (종류 === 'nat-dec' ? String(total / 10) : (total / 10).toFixed(1)) : `${total}/${d}`;
    const 뒤 = 소수 ? (size / 10).toFixed(1) : `${size}/${d}`;
    const 몫글 = 남 ? 대분수글(남 + 몫 * size, size) : String(몫);
    return {
      prompt: `${앞}÷${뒤}을(를) 알아보려고 합니다. ${단위} 조각 ${total}개를 한 접시에 ${size}개씩(${뒤}씩) 담아 보세요.${남 ? ' 남는 조각은 그대로 두세요.' : ''}`,
      answer: 남 ? `접시 ${몫}개, 조각 ${남}개 남음(몫 ${몫글})` : `접시 ${몫}개(몫 ${몫})`,
      manipulate: { kind: 'share', total, size, emoji: '🟦', rest: 남 > 0 },
      tag: 소수 ? 'decimalDiv' : 'fractionDiv',
      strategy: '나누는 수가 몇 번 들어가는지 묶어 세기',
      hint: `${앞}은(는) ${단위}이 ${total}개, ${뒤}은(는) ${단위}이 ${size}개예요. ${size}개씩 몇 묶음이 되는지 접시에 담아 보세요.`,
      steps: [`${앞}은(는) ${단위}이 ${total}개, ${뒤}은(는) ${단위}이 ${size}개입니다.`, `그러므로 ${앞}÷${뒤}은(는) ${total}÷${size}과(와) 같습니다.`, 남 ? `${size}개씩 ${몫}접시에 담고 ${남}개가 남으므로 몫은 ${몫}과(와) ${남}/${size}, 곧 ${몫글}입니다.` : `${size}개씩 ${몫}접시가 되므로 몫은 ${몫}입니다.`],
      concept: 소수 ? '(소수)÷(소수)는 두 수를 똑같이 10배 하여 (자연수)÷(자연수)로 바꾸어 계산할 수 있습니다.' : '분모가 같은 (분수)÷(분수)는 분자끼리 나눈 것과 같습니다.',
      misconception: 남 ? '남은 조각을 몫에 넣지 않거나, 남은 조각 수를 그대로 분자로 쓰고 분모를 잘못 정하기 쉽습니다.' : '소수점이나 분모를 그대로 두고 나누어 몫을 잘못 구하기 쉽습니다.',
      결: 남 || lv === 2 ? 2 : 1,
    };
  },
});

// ── 원주: 바퀴가 한 바퀴 구른 거리 ────────────────────────────────
export const 원주긋기 = (원주율: 3 | 3.1): 조작갈래 => ({
  id: `circum-roll-${원주율}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 지름 1~2 cm, 중: 지름 3~4 cm, 상: 반지름으로 주기
    const 지름 = lv === 0 ? 사이(next, 1, 2) : lv === 1 ? 사이(next, 3, 4) : 2 * 사이(next, 1, 2);
    const mm = Math.round(지름 * 원주율 * 10);
    const 길이 = mm / 10;
    return {
      prompt: lv === 2 ? `반지름이 ${지름 / 2} cm인 바퀴가 한 바퀴 굴러간 거리만큼 자의 0 눈금에서부터 선을 그어 보세요. (원주율: ${원주율})` : `지름이 ${지름} cm인 바퀴가 한 바퀴 굴러간 거리만큼 자의 0 눈금에서부터 선을 그어 보세요. (원주율: ${원주율})`,
      answer: `${길이} cm`,
      manipulate: { kind: 'ruler-draw', tool: 'pencil', unit: 원주율 === 3 ? 'cm' : 'mm', fromMm: 0, lengthMm: mm, rulerCm: 15 },
      tag: 'measurement',
      strategy: '원주는 지름의 원주율 배임을 이용하기',
      hint: `바퀴가 한 바퀴 구르면 바퀴의 둘레(원주)만큼 가요. 원주는 (지름)×(원주율)이에요.`,
      steps: ['바퀴가 한 바퀴 구른 거리는 바퀴의 원주와 같습니다.', `원주는 (지름)×(원주율)=${지름}×${원주율}=${길이}(cm)입니다.`, `그러므로 0 눈금에서 ${길이} cm까지 긋습니다.`],
      concept: '원의 지름에 대한 원주의 비율을 원주율이라고 합니다. (원주)=(지름)×(원주율)입니다.',
      misconception: '반지름에 원주율을 곱하거나, 지름만큼만 가기 쉽습니다.',
      결: lv === 2 || 원주율 !== 3 ? 2 : 1,
    };
  },
});

// ── 넓이가 정해진 도형, 마름모 ────────────────────────────────────
const 닫은선 = (ps: GridPoint[]): GridSegment[] => ps.map((p, i) => [p, ps[(i + 1) % ps.length]]);
export const 넓이도형: 조작갈래 = {
  id: 'area-free',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 작은 넓이, 중: 큰 넓이, 상: 직사각형이 아닌 ㄱ자 모양(변 6개)
    const 넓이 = [사이(next, 4, 6), 사이(next, 7, 12), 2 * 사이(next, 3, 6) + 1][lv];
    const a = Math.ceil((넓이 + 1) / 2);
    const 예: GridPoint[] = 넓이 % 2 ? [[1, 1], [1 + a, 1], [1 + a, 3], [2, 3], [2, 2], [1, 2]] : [[1, 1], [1 + 넓이 / 2, 1], [1 + 넓이 / 2, 3], [1, 3]];
    if (a > 7) return null;
    return {
      prompt: lv === 2 ? `모눈 한 칸의 넓이는 1 cm²입니다. 모눈선을 따라 변이 6개인 ㄱ자 모양으로 넓이가 ${넓이} cm²인 도형을 그려 보세요.` : `모눈 한 칸의 넓이는 1 cm²입니다. 모눈선을 따라 넓이가 ${넓이} cm²인 도형을 그려 보세요. 어떤 모양이어도 됩니다.`,
      answer: `넓이가 ${넓이} cm²인 도형`,
      manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: lv === 2 ? { area: 넓이, axisAligned: true, sides: 6 } : { area: 넓이, axisAligned: true } }, example: 닫은선(예) },
      tag: 'area',
      strategy: '1 cm²가 몇 개인지로 넓이 알기',
      hint: `도형 안의 모눈 칸이 ${넓이}칸이 되게 그려요. 칸을 세면서 선을 이어 가요.`,
      steps: ['한 변이 1 cm인 정사각형의 넓이가 1 cm²입니다.', `도형 안에 1 cm²가 ${넓이}개 들어가면 넓이는 ${넓이} cm²입니다.`, '모양이 달라도 1 cm²의 수가 같으면 넓이가 같습니다.'],
      concept: '넓이는 단위넓이(1 cm²)가 몇 개인지로 나타냅니다.',
      misconception: '도형의 둘레에 닿은 선분 수를 세어 넓이라고 생각하기 쉽습니다.',
      결: lv === 2 ? 2 : lv === 1 ? 1 : 0,
    };
  },
};

export const 마름모넓이: 조작갈래 = {
  id: 'area-rhombus',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const d1 = 2 * [사이(next, 1, 2), 사이(next, 2, 3), 사이(next, 3, 4)][lv];
    const d2 = 2 * [사이(next, 1, 2), 사이(next, 1, 3), 사이(next, 2, 3)][lv];
    if (d1 === d2) return null;
    const 넓이 = (d1 * d2) / 2;
    const cx = 1 + d1 / 2;
    const cy = 1 + d2 / 2;
    return {
      prompt: `모눈 한 칸의 넓이는 1 cm²입니다. 넓이가 ${넓이} cm²인 마름모를 그려 보세요.`,
      answer: `넓이가 ${넓이} cm²인 마름모`,
      manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: { sides: 4, allSidesEqual: true, area: 넓이 } }, example: 닫은선([[cx, 1], [cx + d1 / 2, cy], [cx, cy + d2 / 2], [cx - d1 / 2, cy]]) },
      tag: 'area',
      strategy: '두 대각선의 길이로 마름모의 넓이 맞추기',
      hint: `마름모의 넓이는 (한 대각선)×(다른 대각선)÷2예요. 두 대각선의 곱이 ${넓이 * 2}이(가) 되게 정하고, 가운데 점에서 위아래·양옆으로 같은 칸만큼 떨어진 네 점을 이어요.`,
      steps: ['마름모의 넓이는 (한 대각선의 길이)×(다른 대각선의 길이)÷2입니다.', `두 대각선의 곱이 ${넓이}×2=${넓이 * 2}이면 됩니다. 예를 들어 ${d1}칸과 ${d2}칸입니다.`, '가운데 점에서 가로로 양쪽 같은 칸, 세로로 위아래 같은 칸 떨어진 네 점을 이으면 마름모가 됩니다.'],
      concept: '마름모의 넓이는 두 대각선의 길이를 곱해 2로 나눈 값입니다.',
      misconception: '÷2를 빠뜨리거나, 한 변의 길이를 곱하기 쉽습니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
};

// ── 입체도형 분류하기 ─────────────────────────────────────────────
type 입체 = { label: string; emoji?: string; bin: number };
const 입체분류 = (id: string, prompt: string, bins: string[], 모두: 입체[], 기준: string, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `sort-solid-${id}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 칸마다 2개, 중: 3개, 상: 있는 만큼(설명으로 된 것이 많음)
    const items = bins.flatMap((_, b) => 뽑기(모두.filter((it) => it.bin === b), 2 + lv, next));
    return {
      prompt,
      answer: '모두 바르게 나눔',
      manipulate: { kind: 'sort-bins', bins, items: 섞기(items, next) },
      tag: 'solid',
      strategy: '입체도형의 밑면과 옆면을 보고 분류하기',
      hint: `${기준}을(를) 하나씩 살펴보세요. 물건(설명)을 누른 다음 넣을 칸을 누르면 옮겨져요.`,
      steps: [`분류하는 기준은 ${기준}입니다.`, bins.length > 2 ? '밑면이 몇 개인지, 옆면이 어떤 모양인지, 뾰족한 꼭짓점이 있는지 차례로 봅니다.' : '두 밑면이 평행하고 합동인지, 옆면이 모두 직사각형인지 봅니다.', '기준에 맞는 칸에 하나씩 넣습니다.'],
      concept: bins.includes('각뿔') ? '각기둥은 밑면이 2개이고 옆면이 직사각형, 각뿔은 밑면이 1개이고 옆면이 삼각형입니다.' : bins.includes('원뿔') ? '원기둥은 밑면이 원 2개, 원뿔은 밑면이 원 1개이고 뾰족한 꼭짓점이 있으며, 구는 어느 방향에서 보아도 원입니다.' : '각기둥은 두 밑면이 서로 평행하고 합동인 다각형이고, 옆면이 모두 직사각형인 입체도형입니다.',
      misconception: '굽은 면이 있는 입체도형(원기둥)도 각기둥이라고 생각하기 쉽습니다.',
      결: lv === 2 ? 2 : 결,
    };
  },
});

export const 각기둥분류 = 입체분류('prism', '설명을 읽고 각기둥인 것과 각기둥이 아닌 것으로 나누어 보세요.', ['각기둥', '각기둥이 아닌 것'], [
  { label: '두 밑면이 평행하고 합동인 삼각형, 옆면이 직사각형 3개', bin: 0 },
  { label: '두 밑면이 평행하고 합동인 오각형, 옆면이 직사각형 5개', bin: 0 },
  { label: '두 밑면이 평행하고 합동인 육각형, 옆면이 직사각형 6개', bin: 0 },
  { label: '상자 모양(직육면체)', emoji: '📦', bin: 0 },
  { label: '밑면이 원 2개이고 옆면이 굽은 면', bin: 1 },
  { label: '밑면이 사각형 1개, 옆면이 삼각형 4개', bin: 1 },
  { label: '두 밑면이 평행하지만 크기가 다른 사각형', bin: 1 },
  { label: '공 모양', emoji: '⚽', bin: 1 },
], '두 밑면이 평행하고 합동인 다각형인지, 옆면이 모두 직사각형인지', 1);

export const 각기둥각뿔분류 = 입체분류('pyramid', '설명을 읽고 각기둥, 각뿔, 둘 다 아닌 것으로 나누어 보세요.', ['각기둥', '각뿔', '둘 다 아닌 것'], [
  { label: '두 밑면이 평행하고 합동인 삼각형, 옆면이 직사각형 3개', bin: 0 },
  { label: '두 밑면이 평행하고 합동인 오각형, 옆면이 직사각형 5개', bin: 0 },
  { label: '상자 모양(직육면체)', emoji: '📦', bin: 0 },
  { label: '밑면이 사각형 1개, 옆면이 삼각형 4개', bin: 1 },
  { label: '밑면이 삼각형 1개, 옆면이 삼각형 3개', bin: 1 },
  { label: '밑면이 육각형 1개, 옆면이 삼각형 6개', bin: 1 },
  { label: '밑면이 원 2개이고 옆면이 굽은 면', bin: 2 },
  { label: '밑면이 원 1개이고 뾰족한 꼭짓점', bin: 2 },
  { label: '공 모양', emoji: '⚽', bin: 2 },
], '밑면의 수와 옆면의 모양', 1);

export const 원기둥원뿔구분류 = 입체분류('round', '물건이나 설명을 보고 원기둥, 원뿔, 구로 나누어 보세요.', ['원기둥', '원뿔', '구'], [
  { label: '음료수 캔', emoji: '🥫', bin: 0 },
  { label: '두루마리 휴지', emoji: '🧻', bin: 0 },
  { label: '밑면이 원 2개이고 옆면이 굽은 면', bin: 0 },
  { label: '고깔모자', bin: 1 },
  { label: '공사장 고깔', bin: 1 },
  { label: '밑면이 원 1개이고 뾰족한 꼭짓점', bin: 1 },
  { label: '축구공', emoji: '⚽', bin: 2 },
  { label: '구슬', emoji: '🔮', bin: 2 },
  { label: '어느 방향에서 보아도 원', bin: 2 },
], '밑면의 수, 뾰족한 꼭짓점, 어느 쪽에서 보아도 원인지', 1);

/** 조각 묶기 (2): (자연수)÷(분수), 분모가 다른 (분수)÷(분수), (대분수)÷(분수), 나누어 주고 남는 양 */
const 조각묶기더 = (종류: 'nat-frac' | 'frac-diff' | 'mixed-frac' | 'dec-rest', next: (n: number) => number, lv: number): ReturnType<조작갈래['make']> => {
  let 단위: string;
  let 앞: string;
  let 뒤: string;
  let total: number;
  let size: number;
  if (종류 === 'nat-frac') {
    const d = [사이(next, 2, 3), 사이(next, 3, 4), 사이(next, 4, 5)][lv];
    const n = [1, 2, 사이(next, 2, 3)][lv];
    const b = lv === 0 ? 1 : 사이(next, 2, d - 1);
    if (b >= d) return null;
    total = n * d;
    size = b;
    단위 = `1/${d}`;
    앞 = String(n);
    뒤 = `${b}/${d}`;
  } else if (종류 === 'dec-rest') {
    size = [사이(next, 3, 4), 사이(next, 4, 6), 사이(next, 6, 8)][lv];
    const 몫 = 사이(next, 2, 4);
    total = size * 몫 + 사이(next, 1, size - 1);
    단위 = '0.1';
    앞 = (total / 10).toFixed(1);
    뒤 = (size / 10).toFixed(1);
  } else {
    const [d1, d2] = 뽑기([[2, 4], [3, 6], [2, 6], [4, 8], [3, 9]], 1, next)[0];
    const L = 최소공배(d1, d2);
    const 대 = 종류 === 'mixed-frac';
    const a = 대 ? d1 + 사이(next, 1, d1 - 1) : 사이(next, 1, d1 - 1);
    const b = 사이(next, 1, d2 - 1);
    total = (a * L) / d1;
    size = (b * L) / d2;
    단위 = `1/${L}`;
    앞 = 대 ? 대분수글(a, d1) : `${a}/${d1}`;
    뒤 = `${b}/${d2}`;
    if (lv === 0 && total % size !== 0) return null;
  }
  if (total > 36 || size < 1 || total <= size) return null;
  const 몫 = Math.floor(total / size);
  const 남 = total % size;
  const 몫글 = 남 ? 대분수글(total, size) : String(몫);
  const 소수 = 종류 === 'dec-rest';
  return {
    prompt: `${앞}÷${뒤}을(를) 알아보려고 합니다. ${단위} 조각 ${total}개를 한 접시에 ${size}개씩(${뒤}씩) 담아 보세요.${남 ? ' 남는 조각은 그대로 두세요.' : ''}`,
    answer: 남 ? (소수 ? `접시 ${몫}개, ${(남 / 10).toFixed(1)} 남음` : `접시 ${몫}개, 조각 ${남}개 남음(몫 ${몫글})`) : `접시 ${몫}개(몫 ${몫})`,
    manipulate: { kind: 'share', total, size, emoji: '🟦', rest: 남 > 0 },
    tag: 소수 ? 'decimalDiv' : 'fractionDiv',
    strategy: 종류 === 'dec-rest' ? '나누어 주고 남는 양 알기' : '같은 단위 조각으로 바꾸어 몇 번 들어가는지 세기',
    hint: `${앞}과(와) ${뒤}을(를) 모두 ${단위} 조각으로 바꾸어 보세요.${종류 === 'frac-diff' || 종류 === 'mixed-frac' ? ' 두 분모를 같게 통분하면 돼요.' : ''} 그다음 ${size}개씩 몇 접시가 되는지 담아요.`,
    steps: [`${앞}은(는) ${단위}이 ${total}개, ${뒤}은(는) ${단위}이 ${size}개입니다.`, `그러므로 ${앞}÷${뒤}은(는) ${total}÷${size}과(와) 같습니다.`, 남 ? (소수 ? `${size}개씩 ${몫}접시에 담고 ${남}개, 곧 ${(남 / 10).toFixed(1)}이(가) 남습니다.` : `${size}개씩 ${몫}접시에 담고 ${남}개가 남으므로 몫은 ${몫글}입니다.`) : `${size}개씩 ${몫}접시가 되므로 몫은 ${몫}입니다.`],
    concept: 소수 ? '나누어 주고 남는 양은 나머지에 소수점을 그대로 찍어 나타냅니다.' : '(분수)÷(분수)는 분모를 같게 하여 분자끼리 나누어 구할 수 있습니다.',
    misconception: 소수 ? '남는 양을 0.1이 몇 개인지가 아니라 자연수(4)로 쓰기 쉽습니다.' : '분모가 다른데 분자끼리만 나누기 쉽습니다.',
    결: lv === 0 && !남 ? 1 : 2,
  };
};
