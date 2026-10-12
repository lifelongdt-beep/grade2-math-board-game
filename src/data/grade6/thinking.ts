import type { CircleVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { type Frac, compare, frac, mul, text } from '../grade5/fraction';
import { 고르개, 사이 } from '../grade11/common';
import { 소수 } from '../grade42/unit3';

// ════════════════════════════════════════════════════════════════════
// 6학년 계산·비율·원 단원의 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
// 같은 나눗셈이라도 거꾸로 어떤 수를 찾고, 잘못 계산한 값을 고치고,
// 계산하지 않고 몫의 크기를 가늠하고, 몫이 같은 식을 찾는 일은 각각
// 다른 생각을 씁니다. 비율과 원 단원은 생활 장면(성공률, 할인, 톱니바퀴,
// 축척, 굴러간 바퀴)에서 거꾸로 생각하게 합니다.
// 분수는 grade5/fraction의 text(기약분수·대분수)로, 소수는 천분 정수로
// 씁니다.
// ════════════════════════════════════════════════════════════════════

const 나누기 = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n);
const 다른분수 = (ans: Frac, xs: Frac[]) => {
  const 본 = new Set<string>([text(ans)]);
  return xs.filter((f) => f.n > 0 && f.d > 0 && compare(f, ans) !== 0).map(text).filter((t) => (본.has(t) ? false : (본.add(t), true)));
};
const 진분수 = (next: (b: number) => number, 최대분모 = 9): Frac | null => {
  const d = 사이(next, 2, 최대분모);
  const n = 사이(next, 1, d - 1);
  const f = frac(n, d);
  return f.d === d ? f : null;
};
const 분수글 = (f: Frac) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

// ── 분수의 나눗셈 ────────────────────────────────────────────────────
/** 어떤 수에 b를 곱했더니 F — 어떤 수. b는 자연수(6-1) 또는 진분수(6-2) */
export const 분수어떤수 = (나누는: '자연수' | '분수'): G5Family => ({
  id: `frac6-unknown-${나누는}`,
  make: (seed) => {
    const next = 고르개(seed);
    const x = 진분수(next) ?? null;
    if (!x) return null;
    const b: Frac = 나누는 === '자연수' ? { n: 사이(next, 2, 9), d: 1 } : (진분수(next) ?? { n: 0, d: 1 });
    if (b.n === 0) return null;
    const F = mul(x, b);
    return {
      prompt: `어떤 수에 ${분수글(b)}을(를) 곱했더니 ${text(F)}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
      answer: text(x),
      wrongs: 다른분수(x, [mul(F, b), frac(F.n, F.d * b.n * b.n), frac(F.n + b.n, F.d), frac(x.d, x.n), frac(x.n + 1, x.d)]),
      tag: 'fractionDiv',
      strategy: '곱셈과 나눗셈의 관계로 어떤 수 구하기',
      hint: '□×(곱한 수)=(곱)이면 □=(곱)÷(곱한 수)예요.',
      steps: [`□×${분수글(b)}=${text(F)}`, `□=${text(F)}÷${분수글(b)}=${text(x)}`],
      misconceptionTip: '곱한 수로 나누어야 처음 수가 나와요. 한 번 더 곱하면 안 돼요.',
    };
  },
});

/** b로 나누어야 할 것을 잘못하여 곱했더니 X — 바르게 계산한 값 */
export const 분수잘못계산 = (나누는: '자연수' | '분수'): G5Family => ({
  id: `frac6-mistake-${나누는}`,
  make: (seed) => {
    const next = 고르개(seed);
    const x = 진분수(next, 8);
    if (!x) return null;
    const b: Frac = 나누는 === '자연수' ? { n: 사이(next, 2, 6), d: 1 } : (진분수(next, 6) ?? { n: 0, d: 1 });
    if (b.n === 0) return null;
    const 잘못 = mul(x, b);
    const v = 나누기(x, b);
    return {
      prompt: `어떤 수를 ${분수글(b)}(으)로 나누어야 할 것을 잘못하여 곱했더니 ${text(잘못)}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
      answer: text(v),
      wrongs: 다른분수(v, [x, 나누기(잘못, b), mul(잘못, b), frac(v.n + 1, v.d), frac(v.d, v.n)]),
      tag: 'fractionDiv',
      strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
      hint: '먼저 잘못 계산한 식으로 어떤 수를 찾아요. 그다음에 바르게 나누어요.',
      steps: [`□×${분수글(b)}=${text(잘못)}이므로 □=${text(잘못)}÷${분수글(b)}=${text(x)}입니다.`, `바르게 계산하면 ${text(x)}÷${분수글(b)}=${text(v)}입니다.`],
      misconceptionTip: '어떤 수를 구한 것으로 끝내면 안 돼요.',
    };
  },
});

/** 계산하지 않고 몫이 1보다 큰(작은) 것 찾기 */
export const 몫1견주기 = (갈래: '분수' | '소수' | '자연수'): G5Family => ({
  id: `quot-vs-1-${갈래}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 큰것찾기 = next(2) === 0;
    type 식 = { 글: string; 큼: boolean };
    const 만들기 = (나뉨이큼: boolean): 식 | null => {
      if (갈래 === '자연수') {
        const a = 사이(next, 2, 15);
        const b = 사이(next, 2, 15);
        if (a === b || a > b !== 나뉨이큼) return null;
        return { 글: `${a}÷${b}`, 큼: 나뉨이큼 };
      }
      if (갈래 === '분수') {
        const a = 진분수(next);
        const b = 진분수(next);
        if (!a || !b || compare(a, b) === 0 || compare(a, b) > 0 !== 나뉨이큼) return null;
        return { 글: `${분수글(a)}÷${분수글(b)}`, 큼: 나뉨이큼 };
      }
      const a = 사이(next, 11, 99);
      const b = 사이(next, 11, 99);
      if (a === b || a > b !== 나뉨이큼) return null;
      return { 글: `${소수(a * 100)}÷${소수(b * 100)}`, 큼: 나뉨이큼 };
    };
    const 답 = (() => { for (let t = 0; t < 30; t += 1) { const f = 만들기(큰것찾기); if (f) return f; } return null; })();
    const 나머지: 식[] = [];
    for (let t = 0; t < 80 && 나머지.length < 3; t += 1) {
      const f = 만들기(!큰것찾기);
      if (f && !나머지.some((g) => g.글 === f.글) && f.글 !== 답?.글) 나머지.push(f);
    }
    if (!답 || 나머지.length < 3) return null;
    return {
      prompt: `계산하지 않고 몫이 1보다 ${큰것찾기 ? '큰' : '작은'} 것을 찾으면 어느 것일까요?`,
      answer: 답.글,
      wrongs: 나머지.map((f) => f.글),
      tag: 갈래 === '소수' ? 'decimalDiv' : 'fractionDiv',
      strategy: '나누어지는 수와 나누는 수를 견주어 몫의 크기 가늠하기',
      hint: '나누어지는 수가 나누는 수보다 크면 몫은 1보다 커요.',
      steps: [`${답.글}은(는) 나누어지는 수가 나누는 수보다 ${큰것찾기 ? '크므로' : '작으므로'} 몫이 1보다 ${큰것찾기 ? '큽' : '작습'}니다.`, '다른 식은 모두 그 반대입니다.'],
      misconceptionTip: '나눗셈의 몫이 늘 나누어지는 수보다 작은 것은 아니에요. 1보다 작은 수로 나누면 몫이 커져요.',
    };
  },
});

/** 수 카드로 진분수를 만들어 가장 큰 것을 가장 작은 것으로 나눈 몫 */
export const 분수카드나누기: G5Family = {
  id: 'frac6-cards',
  make: (seed) => {
    const next = 고르개(seed);
    const 카드: number[] = [];
    while (카드.length < 4) {
      const c = 사이(next, 1, 9);
      if (!카드.includes(c)) 카드.push(c);
    }
    const 진분수들: Frac[] = [];
    for (const n of 카드) for (const d of 카드) if (n < d) 진분수들.push({ n, d });
    const 큰 = 진분수들.reduce((m, f) => (compare(f, m) > 0 ? f : m));
    const 작은 = 진분수들.reduce((m, f) => (compare(f, m) < 0 ? f : m));
    const v = 나누기(큰, 작은);
    return {
      prompt: `수 카드 ${카드.join(', ')} 가운데 2장을 골라 진분수를 만들려고 합니다. 만들 수 있는 가장 큰 진분수를 가장 작은 진분수로 나눈 몫은 얼마일까요?`,
      answer: text(v),
      wrongs: 다른분수(v, [나누기(작은, 큰), mul(큰, 작은), frac(큰.n * 작은.n, 큰.d * 작은.d), frac(v.n + 1, v.d), frac(v.n, v.d + 1)]),
      tag: 'fractionDiv',
      strategy: '조건에 맞는 분수를 만들어 나누기',
      hint: '가장 큰 진분수는 분모와 분자가 가까운 큰 수, 가장 작은 진분수는 분자가 작고 분모가 큰 수예요.',
      steps: [`가장 큰 진분수는 ${분수글(큰)}, 가장 작은 진분수는 ${분수글(작은)}입니다.`, `${분수글(큰)}÷${분수글(작은)}=${text(v)}`],
    };
  },
};

// ── 소수의 나눗셈 ────────────────────────────────────────────────────
/** a÷k=q를 알 때 소수점이 옮겨진 나눗셈의 몫(6-1), 몫이 다른 식(6-2) */
export const 소수점관계 = (갈래: '자연수로' | '소수로'): G5Family => ({
  id: `decpoint-${갈래}`,
  make: (seed) => {
    const next = 고르개(seed);
    if (갈래 === '자연수로') {
      const k = 사이(next, 2, 9);
      const q = 사이(next, 11, 99);
      const a = q * k; // 자연수 나눗셈
      const 배 = [10, 100][next(2)];
      // a÷배 ÷ k = q÷배
      return {
        prompt: `${a}÷${k}=${q}입니다. 이것을 이용하여 ${소수((a * 1000) / 배)}÷${k}의 몫을 구하면 얼마일까요?`,
        answer: 소수((q * 1000) / 배),
        wrongs: [q * 1000, (q * 1000) / (배 * 10), (q * 1000 * 10) / 배, (q * 1000) / 배 + 1000].filter((x, i, xs) => Number.isInteger(x) && x !== (q * 1000) / 배 && xs.indexOf(x) === i).slice(0, 3).map(소수),
        tag: 'decimalDiv',
        strategy: '자연수의 나눗셈을 이용하여 소수의 나눗셈 하기',
        hint: `나누어지는 수가 1/${배}이(가) 되면 몫도 1/${배}이(가) 돼요.`,
        steps: [`${소수((a * 1000) / 배)}은(는) ${a}의 1/${배}입니다.`, `그러므로 몫도 ${q}의 1/${배}인 ${소수((q * 1000) / 배)}입니다.`],
      };
    }
    const b = 사이(next, 2, 9);
    const q = 사이(next, 2, 9);
    const a = b * q;
    // 같은 몫: a÷b, (a/10)÷(b/10), (a/100)÷(b/100) / 다른 몫: (a/10)÷(b/100) 등
    const 같은 = [`${a}÷${b}`, `${소수(a * 100)}÷${소수(b * 100)}`, `${소수(a * 10)}÷${소수(b * 10)}`];
    const 다른 = [`${소수(a * 100)}÷${소수(b * 10)}`, `${소수(a * 10)}÷${소수(b * 100)}`, `${a}÷${소수(b * 100)}`][next(3)];
    return {
      prompt: '몫이 다른 하나를 찾으면 어느 것일까요?',
      answer: 다른,
      wrongs: 같은,
      tag: 'decimalDiv',
      strategy: '나누어지는 수와 나누는 수를 똑같이 10배, 100배 하면 몫이 같음을 알기',
      hint: '나누어지는 수와 나누는 수에 같은 수를 곱하면 몫은 그대로예요.',
      steps: [`${같은.join(', ')}은(는) 나누어지는 수와 나누는 수를 똑같이 10배, 100배 한 식이므로 몫이 ${q}(으)로 같습니다.`, `${다른}은(는) 두 수를 다르게 바꾸었으므로 몫이 다릅니다.`],
      misconceptionTip: '한쪽만 10배 하면 몫이 달라져요.',
    };
  },
});

/** 어떤 수에 k를 곱했더니 X(소수) — 어떤 수 / k로 나누어야 할 것을 곱했다 */
export const 소수거꾸로 = (나누는: '자연수' | '소수'): G5Family => ({
  id: `dec6-reverse-${나누는}`,
  make: (seed) => {
    const next = 고르개(seed);
    const k = 나누는 === '자연수' ? 사이(next, 2, 9) * 1000 : 사이(next, 2, 19) * 100; // 천분
    if (k === 1000) return null;
    const x = 사이(next, 11, 99) * 100; // 1.1 ~ 9.9
    const 곱 = (p: number, q: number) => (p * q) / 1000;
    const 나눔 = (p: number, q: number) => (p * 1000) / q;
    if (next(2) === 0) {
      const X = 곱(x, k);
      if (!Number.isInteger(X)) return null;
      return {
        prompt: `어떤 수에 ${소수(k)}을(를) 곱했더니 ${소수(X)}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
        answer: 소수(x),
        wrongs: [곱(X, k), x * 10, x / 10, X - k].filter((v, i, xs) => Number.isInteger(v) && v > 0 && v !== x && xs.indexOf(v) === i).slice(0, 3).map(소수),
        tag: 'decimalDiv',
        strategy: '곱셈과 나눗셈의 관계로 어떤 수 구하기',
        hint: '□×(곱한 수)=(곱)이면 □=(곱)÷(곱한 수)예요.',
        steps: [`□×${소수(k)}=${소수(X)}`, `□=${소수(X)}÷${소수(k)}=${소수(x)}`],
        minusIsOperator: true,
      };
    }
    // 나누어야 할 것을 곱했다: 어떤 수 y = x×k (k로 나누어떨어지게)
    const y = 곱(x, k);
    const 잘못 = 곱(y, k);
    if (!Number.isInteger(y) || !Number.isInteger(잘못)) return null;
    const v = 나눔(y, k);
    return {
      prompt: `어떤 수를 ${소수(k)}(으)로 나누어야 할 것을 잘못하여 곱했더니 ${소수(잘못)}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
      answer: 소수(v),
      wrongs: [y, v * 10, v / 10, 잘못].filter((t, i, xs) => Number.isInteger(t) && t > 0 && t !== v && xs.indexOf(t) === i).slice(0, 3).map(소수),
      tag: 'decimalDiv',
      strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
      hint: '먼저 잘못 계산한 식으로 어떤 수를 찾아요.',
      steps: [`□×${소수(k)}=${소수(잘못)}이므로 □=${소수(잘못)}÷${소수(k)}=${소수(y)}입니다.`, `바르게 계산하면 ${소수(y)}÷${소수(k)}=${소수(v)}입니다.`],
    };
  },
});

// ── 비와 비율 ────────────────────────────────────────────────────────
const 친한분모 = [4, 5, 10, 20, 25, 50];

export const 비율견주기: G5Family = {
  id: 'ratio-compare',
  make: (seed) => {
    const next = 고르개(seed);
    const n1 = 친한분모[next(친한분모.length)];
    const n2 = 친한분모[next(친한분모.length)];
    if (n1 === n2) return null;
    const s1 = 사이(next, 1, n1 - 1);
    const s2 = 사이(next, 1, n2 - 1);
    const p1 = (s1 * 100) / n1;
    const p2 = (s2 * 100) / n2;
    if (p1 === p2 || !Number.isInteger(p1) || !Number.isInteger(p2)) return null;
    // 성공한 횟수가 많은 쪽과 성공률이 높은 쪽이 다르면 생각할 거리가 생깁니다.
    const 가높음 = p1 > p2;
    return {
      prompt: `농구 골 넣기에서 가 모둠은 공을 ${n1}번 던져서 ${s1}번 넣었고, 나 모둠은 ${n2}번 던져서 ${s2}번 넣었습니다. 던진 횟수에 대한 넣은 횟수의 비율이 더 높은 모둠은 어느 모둠일까요?`,
      answer: 가높음 ? '가 모둠' : '나 모둠',
      wrongs: [가높음 ? '나 모둠' : '가 모둠', '두 모둠이 같습니다', '알 수 없습니다'],
      tag: 'ratio',
      strategy: '비율을 백분율로 나타내어 견주기',
      hint: '넣은 횟수만 견주면 안 돼요. 던진 횟수가 다르니 비율로 견주어요.',
      steps: [`가: ${s1}/${n1}=${p1}%, 나: ${s2}/${n2}=${p2}%`, `${가높음 ? '가' : '나'} 모둠의 비율이 더 높습니다.`],
      misconceptionTip: '넣은 횟수가 많다고 비율이 높은 것은 아니에요.',
    };
  },
};

export const 백분율거꾸로: G5Family = {
  id: 'percent-reverse',
  make: (seed) => {
    const next = 고르개(seed);
    const 기준 = [20, 40, 50, 80, 200, 300, 400, 500][next(8)];
    const p = 사이(next, 1, 19) * 5;
    const 비교 = (기준 * p) / 100;
    if (!Number.isInteger(비교)) return null;
    if (next(2) === 0) {
      return {
        prompt: `우리 학교 학생 가운데 ${p}%가 안경을 썼습니다. 안경을 쓴 학생이 ${비교}명이라면 우리 학교 학생은 모두 몇 명일까요?`,
        answer: `${기준}명`,
        wrongs: [비교 * p, 비교 + p, Math.round((비교 * 100) / (100 - p)), 기준 * 2].filter((x, i, xs) => x !== 기준 && x > 0 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}명`),
        tag: 'ratio',
        strategy: '비교하는 양과 비율로 기준량 구하기',
        hint: `전체를 □명이라 하면 □의 ${p}%가 ${비교}명이에요.`,
        steps: [`□×${p}/100=${비교}`, `□=${비교}÷${p}×100=${기준}명`],
        misconceptionTip: '구하는 것이 기준량(전체)인지 비교하는 양인지 먼저 정해요.',
      };
    }
    const 정가 = 기준 * 100;
    const 판매 = 정가 - (정가 * p) / 100;
    return {
      prompt: `${정가}원인 옷을 ${p}% 할인하여 팔고 있습니다. 이 옷의 판매 가격은 얼마일까요?`,
      answer: `${판매}원`,
      wrongs: [(정가 * p) / 100, 정가 - p, 정가 + (정가 * p) / 100, 정가 - p * 100].filter((x, i, xs) => x !== 판매 && x > 0 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}원`),
      tag: 'ratio',
      strategy: '할인 금액을 구해 판매 가격 구하기',
      hint: '할인 금액은 정가의 몇 %인지 먼저 구해요.',
      steps: [`할인 금액: ${정가}×${p}/100=${(정가 * p) / 100}원`, `판매 가격: ${정가}-${(정가 * p) / 100}=${판매}원`],
      misconceptionTip: '할인 금액이 곧 판매 가격은 아니에요.',
      minusIsOperator: true,
    };
  },
};

// ── 비례식과 비례배분 ────────────────────────────────────────────────
export const 비례생각: G5Family = {
  id: 'proportion-think',
  make: (seed) => {
    const next = 고르개(seed);
    const 갈래 = next(3);
    if (갈래 === 0) {
      // 톱니바퀴: 톱니 수 × 바퀴 수가 같습니다.
      const 가 = 사이(next, 2, 12) * 3;
      const 나 = 사이(next, 2, 12) * 2;
      if (가 === 나) return null;
      const n = 사이(next, 2, 12) * 나 / gcd(가, 나);
      const m = (가 * n) / 나;
      if (!Number.isInteger(m) || m > 200) return null;
      return {
        prompt: `톱니가 ${가}개인 톱니바퀴 가와 톱니가 ${나}개인 톱니바퀴 나가 맞물려 돌고 있습니다. 가가 ${n}바퀴 도는 동안 나는 몇 바퀴 돌까요?`,
        answer: `${m}바퀴`,
        wrongs: [(나 * n) / 가, n, m + n].filter((x, i, xs) => Number.isInteger(x) && x !== m && x > 0 && xs.indexOf(x) === i).concat([m * 2]).slice(0, 3).map((x) => `${x}바퀴`),
        tag: 'ratio',
        strategy: '맞물린 톱니의 수가 같음을 이용하기',
        hint: '맞물려 도는 동안 두 바퀴에서 지나가는 톱니의 수가 같아요.',
        steps: [`가가 ${n}바퀴 돌면 톱니 ${가}×${n}=${가 * n}개가 지나갑니다.`, `나도 톱니 ${가 * n}개가 지나가야 하므로 ${가 * n}÷${나}=${m}바퀴입니다.`],
        misconceptionTip: '톱니가 많은 바퀴가 더 적게 돌아요.',
      };
    }
    if (갈래 === 1) {
      const 축척 = [10000, 20000, 25000, 50000][next(4)];
      const cm = 사이(next, 2, 12);
      const 실제cm = cm * 축척;
      const km = 실제cm / 100000;
      const 글 = Number.isInteger(km) ? `${km} km` : `${실제cm / 100} m`;
      return {
        prompt: `실제 거리를 1 : ${축척}(으)로 줄여 나타낸 지도가 있습니다. 지도에서 ${cm} cm인 거리는 실제로 몇 ${Number.isInteger(km) ? 'km' : 'm'}일까요?`,
        answer: 글,
        wrongs: Number.isInteger(km) ? [km * 10, km / 10, km * 100].map((x) => `${x} km`) : [실제cm, 실제cm / 1000, 실제cm / 10].map((x) => `${x} m`),
        tag: 'ratio',
        strategy: '비례식으로 축척 문제 풀기',
        hint: `지도의 1 cm는 실제로 ${축척} cm예요. 단위를 바꾸는 것도 잊지 마세요.`,
        steps: [`1 : ${축척}=${cm} : □이므로 □=${실제cm} cm입니다.`, `${실제cm} cm=${글}`],
        misconceptionTip: 'cm를 m, km로 바꿀 때 0의 개수를 잘 세어요.',
      };
    }
    // 비와 차로 큰 수 구하기
    const a = 사이(next, 2, 7);
    const b = 사이(next, a + 1, 9);
    const k = 사이(next, 2, 12);
    const D = (b - a) * k;
    return {
      prompt: `가와 나의 비가 ${a} : ${b}이고, 나는 가보다 ${D} 더 큽니다. 나는 얼마일까요?`,
      answer: String(b * k),
      wrongs: [a * k, D * b, (a + b) * k, b * D].filter((x, i, xs) => x !== b * k && xs.indexOf(x) === i).slice(0, 3).map(String),
      tag: 'ratio',
      strategy: '비의 차와 실제 차로 한 칸의 크기 구하기',
      hint: `비에서 나는 가보다 ${b - a}칸 더 많아요. 그 ${b - a}칸이 ${D}예요.`,
      steps: [`한 칸의 크기: ${D}÷${b - a}=${k}`, `나는 ${b}칸이므로 ${b}×${k}=${b * k}입니다.`],
    };
  },
};

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

export const 비례배분거꾸로: G5Family = {
  id: 'distribute-reverse',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 6);
    const b = 사이(next, 1, 6);
    if (a === b || gcd(a, b) !== 1) return null;
    const k = 사이(next, 3, 30);
    const 가 = a * k;
    return {
      prompt: `구슬을 가와 나에게 ${a} : ${b}(으)로 나누어 주었더니 가가 ${가}개를 받았습니다. 처음 구슬은 모두 몇 개였을까요?`,
      answer: `${(a + b) * k}개`,
      wrongs: [가 + b, 가 * (a + b), b * k, (a + b) * k + a].filter((x, i, xs) => x !== (a + b) * k && x > 0 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}개`),
      tag: 'ratio',
      strategy: '비례배분을 거꾸로 생각하기',
      hint: `가는 전체의 ${a}/${a + b}이에요.`,
      steps: [`□×${a}/${a + b}=${가}`, `□=${가}÷${a}×${a + b}=${(a + b) * k}개`],
    };
  },
};

// ── 원 ───────────────────────────────────────────────────────────────
// 6-2 5단원과 같은 원 그림입니다. 지름(반지름)에 길이 글을 붙입니다.
const 원그림 = (글: string, 지름선: boolean): CircleVisual => ({
  kind: 'circles',
  label: '원',
  circles: [{ cx: 0, cy: 0, r: 1 }],
  points: [{ x: 0, y: 0 }],
  segments: [지름선 ? { from: [-1, 0], to: [1, 0], name: 글 } : { from: [0, 0], to: [1, 0], name: 글 }],
});
export const 원생각 = (갈래들: Array<0 | 1 | 2 | 3>): G5Family => ({
  id: `circle-think-${갈래들.join('')}`,
  make: (seed) => {
    const next = 고르개(seed);
    // 0 원주→지름, 1 굴러간 거리, 2 넓이→반지름, 3 반지름을 늘릴 때
    const 갈래 = 갈래들[next(갈래들.length)];
    if (갈래 === 0) {
      const d = 사이(next, 2, 40);
      const C = d * 3140; // 천분
      return {
        prompt: `원주가 ${소수(C)} cm인 원의 지름은 몇 cm일까요? (원주율: 3.14)`,
        answer: `${d} cm`,
        wrongs: [d / 2, d * 2, Math.round(C / 1000 / 3)].filter((x, i, xs) => Number.isInteger(x) && x !== d && xs.indexOf(x) === i).concat([d + 1]).slice(0, 3).map((x) => `${x} cm`),
        tag: 'measurement',
        visual: 원그림('? cm', true),
        strategy: '원주에서 거꾸로 지름 구하기',
        hint: '(원주)=(지름)×(원주율)이므로 (지름)=(원주)÷(원주율)이에요.',
        steps: [`${소수(C)}÷3.14=${d} cm`],
      };
    }
    if (갈래 === 1) {
      const d = 사이(next, 2, 9) * 10;
      const n = 사이(next, 2, 10);
      const 거리 = d * n * 3140;
      return {
        prompt: `지름이 ${d} cm인 바퀴를 ${n}바퀴 굴렸습니다. 바퀴가 굴러간 거리는 몇 cm일까요? (원주율: 3.14)`,
        answer: `${소수(거리)} cm`,
        wrongs: [d * 3140, (d / 2) * n * 3140, d * n * 1000, 거리 * 2].filter((x, i, xs) => x !== 거리 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${소수(x)} cm`),
        tag: 'measurement',
        visual: 원그림(`${d} cm`, true),
        strategy: '바퀴가 한 바퀴 굴러간 거리는 원주임을 알기',
        hint: '바퀴가 한 바퀴 돌면 원주만큼 굴러가요.',
        steps: [`한 바퀴: ${d}×3.14=${소수(d * 3140)} cm`, `${n}바퀴: ${소수(d * 3140)}×${n}=${소수(거리)} cm`],
      };
    }
    if (갈래 === 2) {
      const r = 사이(next, 2, 12);
      const S = 3 * r * r;
      return {
        prompt: `넓이가 ${S} cm²인 원의 반지름은 몇 cm일까요? (원주율: 3)`,
        answer: `${r} cm`,
        wrongs: [r * 2, S / 3, Math.round(S / 6)].filter((x, i, xs) => x !== r && xs.indexOf(x) === i).concat([r + 1]).slice(0, 3).map((x) => `${x} cm`),
        tag: 'measurement',
        visual: 원그림('? cm', false),
        strategy: '원의 넓이에서 거꾸로 반지름 구하기',
        hint: '(원의 넓이)=(반지름)×(반지름)×(원주율)이에요. 원주율로 나눈 다음, 같은 수를 두 번 곱해 그 수가 되는 수를 찾아요.',
        steps: [`${S}÷3=${r * r}`, `${r}×${r}=${r * r}이므로 반지름은 ${r} cm입니다.`],
      };
    }
    const k = 사이(next, 2, 4);
    const 무엇 = next(2) === 0 ? '원주' : '넓이';
    const v = 무엇 === '원주' ? k : k * k;
    return {
      prompt: `원의 반지름을 ${k}배로 늘리면 ${무엇}은(는) 처음의 몇 배가 될까요?`,
      answer: `${v}배`,
      wrongs: [k, k * k, k * 2, k * k * k].filter((x, i, xs) => x !== v && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}배`),
      tag: 'measurement',
      strategy: '반지름이 늘 때 원주와 넓이의 변화',
      hint: '반지름이 1 cm인 원과 2 cm인 원으로 직접 계산해 보세요.',
      steps: 무엇 === '원주' ? [`원주는 (지름)×(원주율)이므로 반지름이 ${k}배이면 원주도 ${k}배입니다.`] : [`넓이는 (반지름)×(반지름)×(원주율)이므로 ${k}×${k}=${v}배입니다.`],
      misconceptionTip: '넓이는 길이를 두 번 곱하므로, 반지름이 2배이면 넓이는 4배예요.',
    };
  },
});

/** 원기둥의 전개도: 옆면의 가로에서 거꾸로 반지름, 옆면의 넓이 */
export const 원기둥전개도생각: G5Family = {
  id: 'cylinder-net-think',
  make: (seed) => {
    const next = 고르개(seed);
    const r = 사이(next, 2, 12);
    const h = 사이(next, 3, 20);
    const 가로 = 2 * r * 3140; // 천분
    if (next(2) === 0) {
      return {
        prompt: `원기둥의 전개도에서 옆면의 가로가 ${소수(가로)} cm입니다. 이 원기둥의 밑면의 반지름은 몇 cm일까요? (원주율: 3.14)`,
        answer: `${r} cm`,
        wrongs: [2 * r, r + 1, Math.round(가로 / 1000 / 3)].filter((x, i, xs) => x !== r && xs.indexOf(x) === i).concat([r * 3]).filter((x, i, xs) => x !== r && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x} cm`),
        tag: 'measurement',
        strategy: '옆면의 가로가 밑면의 둘레임을 이용하여 거꾸로 구하기',
        hint: '옆면을 감으면 가로가 밑면의 둘레(원주)와 꼭 맞아요.',
        steps: [`밑면의 원주가 ${소수(가로)} cm이므로 지름은 ${소수(가로)}÷3.14=${2 * r} cm입니다.`, `반지름은 ${2 * r}÷2=${r} cm입니다.`],
        misconceptionTip: '원주를 3.14로 나누면 반지름이 아니라 지름이 나와요.',
        visual: { kind: 'solid-net', label: '원기둥의 전개도', solid: 'cylinder', base: r, height: h, labels: { base: '? cm', height: `${h} cm`, width: `${소수(가로)} cm` } },
      };
    }
    const 넓이 = (가로 * h);
    return {
      prompt: `밑면의 반지름이 ${r} cm, 높이가 ${h} cm인 원기둥의 전개도에서 옆면의 넓이는 몇 cm²일까요? (원주율: 3.14)`,
      answer: `${소수(넓이)} cm²`,
      wrongs: [r * 3140 * h, 2 * r * h * 1000, 가로 * h + r * r * 3140 * 2].filter((x, i, xs) => x !== 넓이 && xs.indexOf(x) === i).map((x) => `${소수(x)} cm²`),
      tag: 'measurement',
      strategy: '옆면을 직사각형으로 보고 넓이 구하기',
      hint: '옆면은 가로가 밑면의 둘레, 세로가 높이인 직사각형이에요.',
      steps: [`옆면의 가로: ${2 * r}×3.14=${소수(가로)} cm`, `옆면의 넓이: ${소수(가로)}×${h}=${소수(넓이)} cm²`],
      visual: { kind: 'solid-net', label: '원기둥의 전개도', solid: 'cylinder', base: r, height: h, labels: { base: `${r} cm`, height: `${h} cm`, width: '? cm' } },
    };
  },
};
