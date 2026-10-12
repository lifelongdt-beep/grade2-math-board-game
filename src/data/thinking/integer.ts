import type { ConceptTag } from '../../types';
import type { G5Family, G5Spec } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 자연수 계산 차시에 함께 쓰는 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
// 계산 차시가 '□×□는 얼마일까요?'만 서른 번 되풀이하면, 아이는 계산
// 절차만 익히고 계산의 뜻은 놓칩니다. 지도서의 익힘·심화 문제는 같은
// 계산을 여러 방향에서 씁니다.
//   · 거꾸로: 어떤 수를 구하기(곱셈과 나눗셈의 관계)
//   · 잘못 계산한 값에서 바르게 계산한 값 구하기(두 단계)
//   · 수 카드로 가장 큰(작은) 곱이나 몫 만들기(자릿값 추론)
//   · 계산하지 않고 크기 견주기(어림, 수 감각)
//   · 나머지의 뜻: 적어도 몇 대, 몇 개 더 있어야 나누어떨어지는지
//   · □ 안에 들어갈 수 있는 가장 큰(작은) 수
//   · 여러 단계 문장제
// 차시마다 수의 범위만 넘겨 받아 그 차시의 계산으로 냅니다.
// ════════════════════════════════════════════════════════════════════

export type 범위 = [number, number];
const 다른 = <T,>(ans: T, xs: T[]) => [...new Set(xs)].filter((x) => x !== ans && (typeof x !== 'number' || x > 0));

/** 어떤 수에 b를 곱했더니 v — 어떤 수를 구합니다. 나눗셈이면 몫과 나머지로 처음 수를 구합니다. */
export const 어떤수 = (id: string, 연산: '×' | '÷', a범위: 범위, b범위: 범위, b단위 = 1, tag: ConceptTag = 연산 === '×' ? 'multiplication' : 'division', 조건?: (a: number, b: number) => boolean): G5Family => ({
  id: `${id}-unknown`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, ...a범위);
    const b = 사이(next, ...b범위) * b단위;
    // 차시가 다루는 올림 꼴만 내도록 곱하는 두 수를 거를 수 있습니다.
    if (조건 && !조건(a, b)) return null;
    if (연산 === '×') {
      const v = a * b;
      return {
        prompt: `어떤 수에 ${b}을(를) 곱했더니 ${v}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
        answer: String(a),
        wrongs: 다른(a, [v - b, v + b, a + 1, a * 10, Math.floor(v / (b + 1))]).slice(0, 3).map(String),
        tag,
        strategy: '곱셈과 나눗셈의 관계로 어떤 수 구하기',
        hint: '어떤 수를 □로 놓고 식을 세워 보세요. □×(곱한 수)=(곱)이면 □=(곱)÷(곱한 수)예요.',
        steps: [`□×${b}=${v}`, `□=${v}÷${b}=${a}`],
        misconceptionTip: '곱한 수를 빼는 것이 아니라 곱한 수로 나누어야 해요.',
        minusIsOperator: true,
      };
    }
    // 나눗셈: a는 몫, b는 나누는 수, 나머지는 b보다 작게.
    const r = 사이(next, 1, b - 1);
    const v = a * b + r;
    return {
      prompt: `어떤 수를 ${b}(으)로 나누었더니 몫이 ${a}, 나머지가 ${r}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
      answer: String(v),
      wrongs: 다른(v, [a * b, a * b - r, a * (b + r), v + b]).slice(0, 3).map(String),
      tag,
      strategy: '나눗셈의 검산식으로 나누어지는 수 구하기',
      hint: '(나누는 수)×(몫)+(나머지)=(나누어지는 수)예요.',
      steps: [`${b}×${a}=${a * b}`, `${a * b}+${r}=${v}`],
      misconceptionTip: '나머지를 빠뜨리면 안 돼요. 나머지까지 더해야 처음 수가 돼요.',
    };
  },
});

/** 곱해야 할 것을 더했다(나누어야 할 것을 곱했다) — 바르게 계산한 값을 구합니다. */
export const 잘못계산 = (id: string, 바른: '×' | '÷', a범위: 범위, b범위: 범위, tag: ConceptTag = 바른 === '×' ? 'multiplication' : 'division', 조건?: (a: number, b: number) => boolean): G5Family => ({
  id: `${id}-mistake`,
  make: (seed) => {
    const next = 고르개(seed);
    const b = 사이(next, ...b범위);
    if (바른 === '×') {
      const a = 사이(next, ...a범위);
      if (조건 && !조건(a, b)) return null;
      const 잘못 = a + b;
      const v = a * b;
      return {
        prompt: `어떤 수에 ${b}을(를) 곱해야 할 것을 잘못하여 더했더니 ${잘못}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
        answer: String(v),
        wrongs: 다른(v, [잘못 * b, a, (잘못 + b) * b, v + b, v - b]).slice(0, 3).map(String),
        tag,
        strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
        hint: '먼저 잘못 계산한 식으로 어떤 수를 찾고, 그다음에 바르게 계산해요.',
        steps: [`□+${b}=${잘못}이므로 □=${잘못}-${b}=${a}입니다.`, `바르게 계산하면 ${a}×${b}=${v}입니다.`],
        misconceptionTip: `잘못 나온 ${잘못}에 바로 ${b}을(를) 곱하면 안 돼요. 어떤 수부터 찾아요.`,
        minusIsOperator: true,
      };
    }
    // 나누어야 할 것을 곱했다. 어떤 수가 b로 나누어떨어지게 둡니다.
    const q = 사이(next, ...a범위);
    const a = q * b;
    const 잘못 = a * b;
    return {
      prompt: `어떤 수를 ${b}(으)로 나누어야 할 것을 잘못하여 곱했더니 ${잘못}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
      answer: String(q),
      wrongs: 다른(q, [a, 잘못 / b / b + b, 잘못 - b, q * 10, q + 1]).slice(0, 3).map(String),
      tag,
      strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
      hint: '먼저 잘못 계산한 식으로 어떤 수를 찾고, 그다음에 바르게 계산해요.',
      steps: [`□×${b}=${잘못}이므로 □=${잘못}÷${b}=${a}입니다.`, `바르게 계산하면 ${a}÷${b}=${q}입니다.`],
      misconceptionTip: '잘못 나온 값을 한 번만 나누면 어떤 수가 나와요. 바른 값은 그것을 한 번 더 나누어야 해요.',
    };
  },
});

const 순열 = (xs: number[], k: number): number[][] => {
  if (k === 0) return [[]];
  return xs.flatMap((x, i) => 순열([...xs.slice(0, i), ...xs.slice(i + 1)], k - 1).map((rest) => [x, ...rest]));
};
const 수로 = (ds: number[]) => ds.reduce((s, d) => s * 10 + d, 0);

/** 수 카드를 한 번씩만 써서 (m자리)×(n자리)의 가장 큰(작은) 곱을 만듭니다. 모든 경우를 따져 답을 구합니다. */
export const 수카드곱 = (id: string, m: number, n: number, tag: ConceptTag = 'multiplication'): G5Family => ({
  id: `${id}-cards`,
  make: (seed) => {
    const next = 고르개(seed);
    const 카드: number[] = [];
    while (카드.length < m + n) {
      const d = 사이(next, 1, 9);
      if (!카드.includes(d)) 카드.push(d);
    }
    const 큰 = next(2) === 0;
    let 최고 = 큰 ? -1 : Infinity;
    let 식 = '';
    const 값들: number[] = [];
    for (const p of 순열(카드, m + n)) {
      const a = 수로(p.slice(0, m));
      const b = 수로(p.slice(m));
      const v = a * b;
      값들.push(v);
      if (큰 ? v > 최고 : v < 최고) {
        최고 = v;
        식 = `${a}×${b}`;
      }
    }
    // 흔한 실수: 큰 수를 앞 수에 몰아 넣기(높은 자리끼리 나누지 않음).
    const 정렬 = [...카드].sort((x, y) => (큰 ? y - x : x - y));
    const 몰아넣기 = 수로(정렬.slice(0, m)) * 수로(정렬.slice(m));
    const 틀린 = 다른(최고, [몰아넣기, ...[...new Set(값들)].sort((x, y) => (큰 ? y - x : x - y)).slice(1, 4)]);
    if (틀린.length < 3) return null;
    return {
      prompt: `수 카드 ${카드.join(', ')}을(를) 한 번씩만 사용하여 (${m === 3 ? '세' : m === 2 ? '두' : '한'} 자리 수)×(${n === 2 ? '두' : '한'} 자리 수)를 만들려고 합니다. 곱이 가장 ${큰 ? '클' : '작을'} 때의 곱은 얼마일까요?`,
      answer: String(최고),
      wrongs: 틀린.slice(0, 3).map(String),
      tag,
      strategy: '자릿값을 생각하여 가장 큰(작은) 곱 만들기',
      hint: 큰 ? '가장 큰 두 숫자를 두 수의 가장 높은 자리에 하나씩 나누어 놓아 보세요.' : '가장 작은 두 숫자를 두 수의 가장 높은 자리에 하나씩 나누어 놓아 보세요.',
      steps: [`높은 자리에 놓이는 숫자가 곱을 가장 크게 바꿉니다.`, `여러 경우를 견주어 보면 ${식}=${최고}이(가) 가장 ${큰 ? '큽' : '작습'}니다.`],
      misconceptionTip: '큰 숫자를 한 수에만 몰아 넣으면 곱이 가장 커지지 않아요.',
    };
  },
});

/** 계산하지 않고 어림하여 가장 큰(작은) 것을 고릅니다. 보기 사이가 넉넉히 벌어지게 만듭니다. */
export const 어림견주기 = (id: string, 연산: '×' | '÷' | '+' | '-', a범위: 범위, b범위: 범위, tag: ConceptTag = 'estimate'): G5Family => ({
  id: `${id}-compare`,
  make: (seed) => {
    const next = 고르개(seed);
    const 계산 = (a: number, b: number) => (연산 === '×' ? a * b : 연산 === '÷' ? a / b : 연산 === '+' ? a + b : a - b);
    const 식들: Array<{ 글: string; 값: number }> = [];
    for (let t = 0; t < 40 && 식들.length < 4; t += 1) {
      let a = 사이(next, ...a범위);
      const b = 사이(next, ...b범위);
      if (연산 === '÷') a = b * Math.max(1, Math.round(a / b)); // 나누어떨어지게
      if (연산 === '-' && a <= b) continue;
      const 값 = 계산(a, b);
      if (식들.some((f) => Math.abs(f.값 - 값) < Math.max(1, Math.abs(값)) * 0.08)) continue;
      식들.push({ 글: `${a}${연산}${b}`, 값 });
    }
    if (식들.length < 4) return null;
    const 큰 = next(2) === 0;
    const 답 = 식들.reduce((m, f) => (큰 ? (f.값 > m.값 ? f : m) : f.값 < m.값 ? f : m));
    return {
      prompt: `계산하지 않고 어림하여 계산 결과가 가장 ${큰 ? '큰' : '작은'} 것을 찾으면 어느 것일까요?`,
      answer: 답.글,
      wrongs: 식들.filter((f) => f !== 답).map((f) => f.글),
      tag,
      strategy: '어림하여 계산 결과의 크기 견주기',
      hint: '두 수를 몇십, 몇백처럼 어림하여 대강의 크기를 견주어 보세요.',
      steps: [식들.map((f) => `${f.글} → 약 ${Math.round(f.값)}`).join(', '), `그러므로 ${답.글}이(가) 가장 ${큰 ? '큽' : '작습'}니다.`],
      minusIsOperator: true,
    };
  },
});

/** 나머지의 뜻을 생활에서 씁니다: 적어도 몇 대, 몇 개 더 있어야 나누어떨어지는지, 나머지가 될 수 있는 가장 큰 수. */
export const 나머지생각 = (id: string, 나뉨범위: 범위, 나눔범위: 범위): G5Family => ({
  id: `${id}-remainder`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, ...나눔범위);
    const a = 사이(next, ...나뉨범위);
    const q = Math.floor(a / d);
    const r = a % d;
    const 갈래 = next(3);
    if (갈래 === 0) {
      if (r === 0 || q < 1) return null;
      return {
        prompt: `학생 ${a}명이 한 대에 ${d}명씩 탈 수 있는 차에 모두 타려고 합니다. 차는 적어도 몇 대 있어야 할까요?`,
        answer: `${q + 1}대`,
        wrongs: 다른(`${q + 1}대`, [`${q}대`, `${q + 2}대`, `${r}대`]),
        tag: 'division',
        strategy: '나머지를 생각하여 몫 정하기',
        hint: '남는 학생도 타야 해요. 나머지가 있으면 차가 한 대 더 필요해요.',
        steps: [`${a}÷${d}=${q} … ${r}`, `${q}대에 타고 ${r}명이 남으므로 한 대가 더 있어야 합니다. ${q}+1=${q + 1}대`],
        misconceptionTip: '몫만 답으로 쓰면 남은 학생이 탈 차가 없어요.',
      };
    }
    if (갈래 === 1) {
      if (r === 0) return null;
      const 더 = d - r;
      return {
        prompt: `사탕 ${a}개를 ${d}명에게 남김없이 똑같이 나누어 주려면 사탕이 적어도 몇 개 더 있어야 할까요?`,
        answer: `${더}개`,
        wrongs: 다른(`${더}개`, [`${r}개`, `${d}개`, `${더 + 1}개`, `${q}개`]).slice(0, 3),
        tag: 'division',
        strategy: '나머지를 생각하여 더 필요한 수 구하기',
        hint: '먼저 나누어 주고 몇 개가 남는지 구하세요. 한 명에게 하나씩 더 주려면 몇 개가 모자라나요?',
        steps: [`${a}÷${d}=${q} … ${r}`, `${r}개가 남으므로 ${d}-${r}=${더}개가 더 있으면 한 명에게 하나씩 더 줄 수 있습니다.`],
        misconceptionTip: '남은 개수가 아니라, 나누는 수가 되려면 몇 개 모자라는지를 구해요.',
        minusIsOperator: true,
      };
    }
    return {
      prompt: `어떤 수를 ${d}(으)로 나누었을 때 나머지가 될 수 있는 수 가운데 가장 큰 수는 얼마일까요?`,
      answer: String(d - 1),
      wrongs: 다른(d - 1, [d, d + 1, d - 2, Math.floor(d / 2)]).slice(0, 3).map(String),
      tag: 'division',
      strategy: '나머지와 나누는 수의 관계',
      hint: '나머지는 나누는 수보다 항상 작아요.',
      steps: [`나머지는 ${d}보다 작아야 하므로 가장 큰 나머지는 ${d - 1}입니다.`],
      misconceptionTip: '나머지가 나누는 수와 같으면 한 번 더 나눌 수 있어요.',
    };
  },
});

/** □×b가 N보다 작을(클) 때 □ 안에 들어갈 수 있는 가장 큰(작은) 자연수 */
export const 네모범위 = (id: string, b범위: 범위, 몫범위: 범위, tag: ConceptTag = 'multiplication'): G5Family => ({
  id: `${id}-box-range`,
  make: (seed) => {
    const next = 고르개(seed);
    const b = 사이(next, ...b범위);
    const q = 사이(next, ...몫범위);
    const 작게 = next(2) === 0;
    // N이 b의 배수이면 '<'에서 경계가 하나 줄어듭니다. 그 경우를 모두 맞게 셉니다.
    const N = q * b + 사이(next, 0, b - 1);
    const v = 작게 ? Math.ceil(N / b) - 1 : Math.floor(N / b) + 1;
    return {
      prompt: 작게
        ? `□×${b}<${N}에서 □ 안에 들어갈 수 있는 자연수 가운데 가장 큰 수는 얼마일까요?`
        : `□×${b}>${N}에서 □ 안에 들어갈 수 있는 자연수 가운데 가장 작은 수는 얼마일까요?`,
      answer: String(v),
      wrongs: 다른(v, [v + 1, v - 1, Math.floor(N / b), N - b, v + 2]).slice(0, 3).map(String),
      tag,
      strategy: '곱셈과 나눗셈을 이용하여 □의 범위 구하기',
      hint: `${N}÷${b}을(를) 먼저 계산해 보고, □에 그 근처의 수를 넣어 확인해 보세요.`,
      steps: [`${N}÷${b}=${Math.floor(N / b)} … ${N % b}`, 작게 ? `${v}×${b}=${v * b}<${N}, ${v + 1}×${b}=${(v + 1) * b}≥${N}이므로 가장 큰 수는 ${v}입니다.` : `${v}×${b}=${v * b}>${N}, ${v - 1}×${b}=${(v - 1) * b}≤${N}이므로 가장 작은 수는 ${v}입니다.`],
      misconceptionTip: '경계에 있는 수를 넣어 부등호가 맞는지 꼭 확인해요.',
    };
  },
});

/** 두 단계 문장제입니다. 곱하고 빼거나, 나누고 견주는 생활 장면입니다. */
export const 두단계문장제 = (id: string, a범위: 범위, b범위: 범위): G5Family => ({
  id: `${id}-word2`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, ...a범위);
    const b = 사이(next, ...b범위);
    const 장면 = next(3);
    if (장면 === 0) {
      const 전체 = a * b;
      const 판 = 사이(next, 1, Math.max(1, 전체 - 1));
      const v = 전체 - 판;
      return {
        prompt: `한 상자에 귤이 ${a}개씩 들어 있습니다. ${b}상자 가운데 귤 ${판}개를 팔았다면 남은 귤은 몇 개일까요?`,
        answer: `${v}개`,
        wrongs: 다른(`${v}개`, [`${전체}개`, `${a * b + 판}개`, `${(a - 판 > 0 ? a - 판 : a + 판) * b}개`, `${v + a}개`]).slice(0, 3),
        tag: 'multiplication',
        strategy: '두 단계로 생각하는 문장제(곱셈 → 뺄셈)',
        hint: '먼저 귤이 모두 몇 개인지 구하고, 판 것을 빼요.',
        steps: [`귤은 모두 ${a}×${b}=${전체}개입니다.`, `${전체}-${판}=${v}개가 남았습니다.`],
        minusIsOperator: true,
      };
    }
    if (장면 === 1) {
      const 값 = 사이(next, 2, 9) * 100;
      const 낸돈 = 값 * b;
      const 거스름 = 낸돈 + 사이(next, 1, 9) * 1000;
      const 남 = 거스름 - 낸돈;
      return {
        prompt: `한 개에 ${값}원인 공책을 ${b}권 사고 ${거스름}원을 냈습니다. 거스름돈은 얼마일까요?`,
        answer: `${남}원`,
        wrongs: 다른(`${남}원`, [`${낸돈}원`, `${거스름 - 값}원`, `${남 + 값}원`, `${거스름 + 낸돈}원`]).slice(0, 3),
        tag: 'multiplication',
        strategy: '두 단계로 생각하는 문장제(곱셈 → 뺄셈)',
        hint: '먼저 공책값을 모두 구하고, 낸 돈에서 빼요.',
        steps: [`공책값은 ${값}×${b}=${낸돈}원입니다.`, `${거스름}-${낸돈}=${남}원`],
        minusIsOperator: true,
      };
    }
    // 두 가지 묶음 견주기
    const c = 사이(next, ...b범위);
    const d = 사이(next, ...a범위);
    if (a * b === d * c) return null;
    const 가 = a * b;
    const 나 = d * c;
    const 차 = Math.abs(가 - 나);
    const 더 = 가 > 나 ? '가 가게' : '나 가게';
    return {
      prompt: `가 가게에서는 구슬을 ${a}개씩 ${b}봉지, 나 가게에서는 ${d}개씩 ${c}봉지 팔았습니다. 어느 가게가 구슬을 몇 개 더 많이 팔았을까요?`,
      answer: `${더}, ${차}개`,
      wrongs: [`${더 === '가 가게' ? '나 가게' : '가 가게'}, ${차}개`, `${더}, ${차 + 10}개`, `${더}, ${Math.abs(a - d) * Math.abs(b - c) || 차 + 1}개`].filter((w, i, xs) => xs.indexOf(w) === i && w !== `${더}, ${차}개`),
      tag: 'multiplication',
      strategy: '두 곱을 구해 견주기',
      hint: '두 가게에서 판 구슬을 각각 구하여 견주어요.',
      steps: [`가 가게: ${a}×${b}=${가}개, 나 가게: ${d}×${c}=${나}개`, `${Math.max(가, 나)}-${Math.min(가, 나)}=${차}개`],
      minusIsOperator: true,
    };
  },
});

/** 어떤 수에 b를 더했더니(뺐더니) X — 어떤 수 */
export const 어떤수덧뺄 = (id: string, 연산: '+' | '-', 범위: 범위): G5Family => ({
  id: `${id}-unknown-${연산}`,
  make: (seed) => {
    const next = 고르개(seed);
    const x = 사이(next, ...범위);
    const b = 사이(next, ...범위);
    const X = 연산 === '+' ? x + b : x - b;
    if (X <= 0) return null;
    return {
      prompt: 연산 === '+' ? `어떤 수에 ${b}을(를) 더했더니 ${X}이(가) 되었습니다. 어떤 수는 얼마일까요?` : `어떤 수에서 ${b}을(를) 뺐더니 ${X}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
      answer: String(x),
      wrongs: 다른(x, [연산 === '+' ? X + b : X - b, x + 10, x - 10, x + 100, Math.abs(X - b)]).slice(0, 3).map(String),
      tag: 연산 === '+' ? 'addition' : 'subtraction',
      strategy: '덧셈과 뺄셈의 관계로 어떤 수 구하기',
      hint: 연산 === '+' ? '□+(더한 수)=(결과)이면 □=(결과)-(더한 수)예요.' : '□-(뺀 수)=(결과)이면 □=(결과)+(뺀 수)예요.',
      steps: [연산 === '+' ? `□+${b}=${X}` : `□-${b}=${X}`, 연산 === '+' ? `□=${X}-${b}=${x}` : `□=${X}+${b}=${x}`],
      misconceptionTip: '더한 것을 되돌리려면 빼고, 뺀 것을 되돌리려면 더해요.',
      minusIsOperator: true,
    };
  },
});

/** 더해야 할 것을 뺐다(빼야 할 것을 더했다) — 바르게 계산한 값 */
export const 잘못계산덧뺄 = (id: string, 범위: 범위): G5Family => ({
  id: `${id}-mistake-addsub`,
  make: (seed) => {
    const next = 고르개(seed);
    const x = 사이(next, ...범위);
    const b = 사이(next, ...범위);
    const 더해야 = next(2) === 0;
    const 잘못 = 더해야 ? x - b : x + b;
    const v = 더해야 ? x + b : x - b;
    if (잘못 <= 0 || v <= 0) return null;
    return {
      prompt: 더해야
        ? `어떤 수에 ${b}을(를) 더해야 할 것을 잘못하여 뺐더니 ${잘못}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`
        : `어떤 수에서 ${b}을(를) 빼야 할 것을 잘못하여 더했더니 ${잘못}이(가) 되었습니다. 바르게 계산한 값은 얼마일까요?`,
      answer: String(v),
      wrongs: 다른(v, [x, 더해야 ? 잘못 + b : 잘못 - b, 더해야 ? v + b : v - b, v + 10]).slice(0, 3).map(String),
      tag: 더해야 ? 'addition' : 'subtraction',
      strategy: '잘못 계산한 식에서 어떤 수를 찾아 바르게 계산하기',
      hint: '먼저 잘못 계산한 식으로 어떤 수를 찾아요.',
      steps: 더해야
        ? [`□-${b}=${잘못}이므로 □=${잘못}+${b}=${x}입니다.`, `바르게 계산하면 ${x}+${b}=${v}입니다.`]
        : [`□+${b}=${잘못}이므로 □=${잘못}-${b}=${x}입니다.`, `바르게 계산하면 ${x}-${b}=${v}입니다.`],
      minusIsOperator: true,
    };
  },
});

/** 수 카드 세 장으로 만든 가장 큰 세 자리 수와 가장 작은 세 자리 수의 합(차) */
export const 수카드합차 = (id: string): G5Family => ({
  id: `${id}-cards-addsub`,
  make: (seed) => {
    const next = 고르개(seed);
    const 카드: number[] = [];
    while (카드.length < 3) {
      const c = 사이(next, 1, 9);
      if (!카드.includes(c)) 카드.push(c);
    }
    const 오름 = [...카드].sort((a, b) => a - b);
    const 큰 = 오름[2] * 100 + 오름[1] * 10 + 오름[0];
    const 작은 = 오름[0] * 100 + 오름[1] * 10 + 오름[2];
    const 합 = next(2) === 0;
    const v = 합 ? 큰 + 작은 : 큰 - 작은;
    return {
      prompt: `수 카드 ${카드.join(', ')}을(를) 한 번씩만 사용하여 세 자리 수를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 ${합 ? '합' : '차'}은(는) 얼마일까요?`,
      answer: String(v),
      wrongs: 다른(v, [합 ? 큰 - 작은 : 큰 + 작은, 큰, v + 10, v - 9, v + 100]).slice(0, 3).map(String),
      tag: 합 ? 'addition' : 'subtraction',
      strategy: '자릿값을 생각하여 가장 큰 수와 가장 작은 수 만들기',
      hint: '가장 큰 수는 높은 자리부터 큰 숫자를, 가장 작은 수는 높은 자리부터 작은 숫자를 놓아요.',
      steps: [`가장 큰 수는 ${큰}, 가장 작은 수는 ${작은}입니다.`, `${큰}${합 ? '+' : '-'}${작은}=${v}`],
      minusIsOperator: true,
    };
  },
});
