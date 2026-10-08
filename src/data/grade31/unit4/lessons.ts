import type { Difficulty } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { eul, eun, euro, i as iJosa, particleOf, pick, rand } from '../../grade5/util';
import { carryFirst, mulFor, mulSteps, nearestTen, noCarry, placeSlip, wrongResults, type Mul, type MulKind } from './core';

// ════════════════════════════════════════════════════════════════════
// 3-1 4단원 곱셈 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입
//   2 올림이 없는 (두 자리 수)×(한 자리 수)
//   3 십의 자리에서 올림이 있는 것
//   4 일의 자리에서 올림이 있는 것
//   5 올림이 두 번 있는 것
//   6 곱셈의 어림셈 — 두 자리 수를 가까운 몇십으로 어림합니다
//     (지도서 19×7 → 20×7=140, 52×8 → 50×8=400, 48×9 → 50×9).
// ════════════════════════════════════════════════════════════════════

const 꼴이름: Record<MulKind, string> = {
  none: '올림이 없는 (두 자리 수)×(한 자리 수)',
  tens: '십의 자리에서 올림이 있는 (두 자리 수)×(한 자리 수)',
  ones: '일의 자리에서 올림이 있는 (두 자리 수)×(한 자리 수)',
  both: '올림이 두 번 있는 (두 자리 수)×(한 자리 수)',
};

const 식 = (one: Mul) => `${one.a}×${one.m}`;
const 이라고 = (word: string) => `${word}${particleOf(word, '이') === '이' ? '이라고' : '라고'}`;

const 볼곳: Record<MulKind, string> = {
  none: '일의 자리 숫자와 곱하는 수를 먼저 곱하고, 십의 자리 숫자와 곱하는 수를 곱하세요. 십의 자리 숫자는 몇십을 나타냅니다.',
  tens: '십의 자리 숫자와 곱하는 수를 곱한 값이 10을 넘습니다. 그 값은 몇십을 나타내므로 백의 자리까지 써야 합니다.',
  ones: '일의 자리에서 곱한 값이 10을 넘습니다. 올림한 수를 십의 자리 위에 작게 써 두고 십의 자리를 계산할 때 더하세요.',
  both: '일의 자리에서 올림한 수를 작게 써 두고, 십의 자리를 곱한 다음 그 수를 더하세요. 십의 자리 계산 결과가 백의 자리까지 갑니다.',
};

const 오개념: Record<MulKind, string> = {
  none: '십의 자리 숫자를 곱한 값은 몇십입니다. 자리를 맞추어 쓰세요.',
  tens: '십의 자리를 곱한 값을 십의 자리에만 쓰면 안 됩니다. 몇백몇십이 되었는지 보세요.',
  ones: '올림한 수는 십의 자리를 곱한 다음에 더합니다. 먼저 더하고 곱하면 안 됩니다.',
  both: '올림한 수를 빠뜨리거나, 십의 자리 숫자에 먼저 더하고 곱하는 실수를 조심하세요.',
};

// ── 계산 ────────────────────────────────────────────────────────────
const 계산문항 = (kind: MulKind): G5Family => ({
  id: `calc-${kind}`,
  make: (seed) => {
    const one = mulFor(kind, seed);
    return {
      prompt: `${eul(식(one))} 계산하면 얼마일까요?`,
      answer: String(one.result),
      wrongs: wrongResults(one).map(String),
      tag: 'multiplication',
      concept: '(두 자리 수)×(한 자리 수)는 일의 자리와 십의 자리를 각각 곱하여 더합니다. 십의 자리를 곱한 값은 몇십입니다.',
      strategy: `${꼴이름[kind]} 계산하기`,
      hint: 볼곳[kind],
      steps: mulSteps(one),
      misconceptionTip: 오개념[kind],
      selfCheck: '곱해지는 수를 가까운 몇십으로 어림하여 곱한 값과 계산한 값이 비슷한가요?',
    };
  },
});

// ── 나누어 곱하기: 36×4=30×4+6×4 ────────────────────────────────────
const 가르기문항 = (kind: MulKind): G5Family => ({
  id: `split-${kind}`,
  make: (seed) => {
    const one = mulFor(kind, seed + 7);
    const t = Math.floor(one.a / 10) * 10;
    const o = one.a % 10;
    if (o === 0) return null;
    return {
      prompt: `${식(one)}=${t}×${one.m}+${o}×□입니다. □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(one.m),
      wrongs: [o, t, one.m + 1, one.a].filter((v) => v !== one.m).map(String),
      tag: 'multiplication',
      concept: `${eun(String(one.a))} ${t}과(와) ${o}을(를) 더한 수이므로, ${t}에 곱한 것과 ${o}에 곱한 것을 더하면 됩니다.`.replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`).replace(/(\d+)을\(를\)/, (_, n: string) => eul(n)),
      strategy: '곱해지는 수를 몇십과 몇으로 갈라 곱하기',
      hint: `${one.a}씩 ${one.m}묶음을 ${t}씩 ${one.m}묶음과 ${o}씩 ${one.m}묶음으로 나누어 생각해 보세요.`,
      steps: [
        `${one.a}=${t}+${o}이므로 ${식(one)}=${t}×${one.m}+${o}×${one.m}입니다.`,
        `${t}×${one.m}=${t * one.m}, ${o}×${one.m}=${o * one.m}이고 더하면 ${one.result}입니다.`,
        `그러므로 □ 안에 알맞은 수는 ${one.m}입니다.`,
      ],
      misconceptionTip: '몇십 부분에만 곱하고 몇 부분은 곱하지 않으면 안 됩니다. 두 부분 모두 같은 수를 곱합니다.',
    };
  },
});

// ── 세로 계산에서 각 줄이 나타내는 것 ──────────────────────────────
const 부분곱문항 = (kind: MulKind): G5Family => ({
  id: `partial-${kind}`,
  make: (seed) => {
    const one = mulFor(kind, seed + 11);
    const t = Math.floor(one.a / 10);
    const o = one.a % 10;
    if (o === 0) return null;
    const 십쪽 = t * 10 * one.m;
    return {
      prompt: `${eul(식(one))} 세로로 나누어 계산했더니 ${o * one.m}과(와) ${iJosa(String(십쪽))} 나왔습니다. ${eun(String(십쪽))} 어떤 곱셈을 계산한 값일까요?`.replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`),
      answer: `${t * 10}×${one.m}`,
      wrongs: [`${t}×${one.m}`, `${o}×${one.m}`, `${one.a}×${one.m}`, `${t * 10}×${o}`].filter((w) => w !== `${t * 10}×${one.m}`),
      tag: 'multiplication',
      concept: '세로 계산에서 십의 자리 숫자를 곱한 값은 실제로 몇십에 곱한 값입니다.',
      strategy: '세로 계산의 부분 곱 알기',
      hint: `${one.a}의 십의 자리 숫자 ${eun(String(t))} 실제로 얼마를 나타내나요? 그 값에 ${eul(String(one.m))} 곱해 보세요.`,
      steps: [
        `${one.a}=${t * 10}+${o}입니다.`,
        `${o}×${one.m}=${o * one.m}, ${t * 10}×${one.m}=${십쪽}입니다.`,
        `그러므로 ${eun(String(십쪽))} ${t * 10}×${one.m}을 계산한 값입니다.`.replace(/×(\d)을/, (_, d: string) => `×${eul(d)}`),
      ],
      misconceptionTip: `십의 자리 숫자 ${t}에 곱한 것이 아니라 ${t * 10}에 곱한 것입니다. 그래서 ${t * one.m}이 아니라 ${십쪽}입니다.`,
    };
  },
});

// ── 수 모형 ─────────────────────────────────────────────────────────
const 수모형문항 = (kind: MulKind): G5Family => ({
  id: `blocks-${kind}`,
  make: (seed) => {
    const one = mulFor(kind, seed + 13);
    const t = Math.floor(one.a / 10);
    const o = one.a % 10;
    const 십 = t * one.m;
    const 일 = o * one.m;
    if (십 > 12 || 일 > 12) return null;
    return {
      prompt: `수 모형으로 ${eul(식(one))} 계산하려고 ${one.a}씩 ${one.m}묶음을 놓았더니 십 모형 ${십}개, 일 모형 ${일}개가 되었습니다. 이 수 모형이 나타내는 수는 얼마일까요?`,
      answer: String(one.result),
      wrongs: [Number(`${십}${일}`), 십 + 일, one.result + 10, noCarry(one.a, one.m), one.result - 10, one.result + 100, placeSlip(one.a, one.m)].filter((v, at, all) => v > 0 && v !== one.result && all.indexOf(v) === at).map(String),
      tag: 'multiplication',
      concept: '십 모형 10개는 백 모형 1개, 일 모형 10개는 십 모형 1개와 같습니다.',
      strategy: '수 모형으로 (두 자리 수)×(한 자리 수) 계산하기',
      hint: '십 모형은 10, 일 모형은 1을 나타냅니다. 10개가 넘는 모형은 바로 윗자리 모형으로 바꾸어 세어 보세요.',
      steps: [
        `십 모형 ${십}개는 ${십 * 10}, 일 모형 ${일}개는 ${일}입니다.`,
        `${십 * 10}+${일}=${one.result}이므로 수 모형이 나타내는 수는 ${one.result}입니다.`,
      ],
      misconceptionTip: '모형의 개수를 그대로 이어 쓰면 안 됩니다. 십 모형 12개는 120입니다.',
      visual: {
        kind: 'place-value',
        label: `${one.a}씩 ${one.m}묶음의 수 모형`,
        countOnly: true,
        columns: [
          { label: '십', value: 십, blocks: 십 },
          { label: '일', value: 일, blocks: 일 },
        ],
      },
    };
  },
});

// ── 문장제 ──────────────────────────────────────────────────────────
const 장면들 = [
  (a: number, m: number) => ({ prompt: `한 상자에 사과가 ${a}개씩 들어 있습니다. ${m}상자에 들어 있는 사과는 모두 몇 개일까요?`, unit: '개', 답: (v: string) => `사과는 모두 ${v}입니다.` }),
  (a: number, m: number) => ({ prompt: `색종이가 한 묶음에 ${a}장씩 ${m}묶음 있습니다. 색종이는 모두 몇 장일까요?`, unit: '장', 답: (v: string) => `색종이는 모두 ${v}입니다.` }),
  (a: number, m: number) => ({ prompt: `민서는 줄넘기를 하루에 ${a}번씩 ${m}일 동안 했습니다. 민서가 한 줄넘기는 모두 몇 번일까요?`, unit: '번', 답: (v: string) => `줄넘기는 모두 ${v}입니다.` }),
  (a: number, m: number) => ({ prompt: `버스 한 대에 ${a}명씩 탈 수 있습니다. 버스 ${m}대에는 모두 몇 명이 탈 수 있을까요?`, unit: '명', 답: (v: string) => `모두 ${iJosa(v)} 탈 수 있습니다.` }),
  (a: number, m: number) => ({ prompt: `연필이 한 상자에 ${a}자루씩 들어 있습니다. ${m}상자에 들어 있는 연필은 모두 몇 자루일까요?`, unit: '자루', 답: (v: string) => `연필은 모두 ${v}입니다.` }),
];

const 문장제문항 = (kind: MulKind, at: number): G5Family => ({
  id: `word-${kind}-${at}`,
  make: (seed) => {
    const one = mulFor(kind, seed + at * 17);
    const scene = pick(장면들, seed + at)(one.a, one.m);
    const 단위 = (v: number) => `${v}${scene.unit}`;
    return {
      prompt: scene.prompt,
      answer: 단위(one.result),
      wrongs: [one.a + one.m, ...wrongResults(one)].filter((v) => v !== one.result).map(단위),
      tag: 'multiplication',
      concept: '같은 수씩 여러 묶음이면 곱셈으로 모두 몇인지 구합니다.',
      strategy: `${꼴이름[kind]}로 문제 해결하기`,
      hint: '한 묶음에 몇씩, 몇 묶음인지 찾아 곱셈식을 세우세요. 그다음 일의 자리부터 곱합니다.',
      steps: [`식으로 나타내면 ${식(one)}입니다.`, ...mulSteps(one).slice(0, -1), `${식(one)}=${one.result}이므로 ${scene.답(단위(one.result))}`],
      misconceptionTip: '두 수를 더하면 안 됩니다. 같은 수가 여러 번 있으므로 곱합니다.',
    };
  },
});

// ── 잘못 계산한 곳 바르게 고치기 ────────────────────────────────────
const 실수들 = (one: Mul) =>
  [
    { value: noCarry(one.a, one.m), 까닭: '일의 자리에서 올림한 수를 더하지 않았습니다.' },
    { value: carryFirst(one.a, one.m), 까닭: '올림한 수를 십의 자리 숫자에 먼저 더한 다음 곱했습니다.' },
    { value: placeSlip(one.a, one.m), 까닭: '십의 자리 숫자를 곱한 값을 몇십으로 쓰지 않았습니다.' },
  ].filter((m) => m.value !== one.result && m.value > 0);

const 이름들 = ['은지', '도윤', '서아', '하준', '지우', '민재'];

const 고치기문항 = (kind: MulKind): G5Family => ({
  id: `fix-${kind}`,
  make: (seed) => {
    const one = mulFor(kind, seed + 19);
    const ms = 실수들(one);
    if (!ms.length) return null;
    const mistake = pick(ms, seed);
    const who = pick(이름들, seed + 1);
    return {
      prompt: `${iJosa(who)} ${eul(식(one))} ${이라고(String(mistake.value))} 계산했습니다. 바르게 계산하면 얼마일까요?`,
      answer: String(one.result),
      wrongs: [mistake.value, ...wrongResults(one)].filter((v) => v !== one.result).map(String),
      tag: 'multiplication',
      concept: '(두 자리 수)×(한 자리 수)는 일의 자리부터 곱하고, 올림한 수는 십의 자리를 곱한 값에 더합니다.',
      strategy: `${꼴이름[kind]}에서 잘못 계산한 곳 고치기`,
      hint: '일의 자리부터 다시 곱해 보세요. 올림한 수를 언제 더하는지, 십의 자리를 곱한 값이 몇십인지 확인하세요.',
      steps: [...mulSteps(one), `${who}의 답은 ${mistake.까닭.replace(/습니다\.$/, '서')} 나온 값입니다.`.replace('않았서', '않아서').replace('곱했서', '곱해서')],
      misconceptionTip: 오개념[kind],
    };
  },
});

// ── 상: 수 카드로 가장 큰 곱 / 어떤 수 / 비교 ───────────────────────
const 수카드문항: G5Family = {
  id: 'cards',
  make: (seed) => {
    const next = rand(seed + 23);
    const cards = new Set<number>();
    while (cards.size < 3) cards.add(2 + next(8));
    const [x, y, z] = [...cards].sort((p, q) => q - p);
    // (두 자리 수)×(한 자리 수)의 곱이 가장 크려면: 가장 큰 수를 곱하는 수로,
    // 나머지 둘로 가장 큰 두 자리 수를 만듭니다. 모든 경우를 다 따져 확인합니다.
    const 경우 = [
      { a: y * 10 + z, m: x }, { a: z * 10 + y, m: x },
      { a: x * 10 + z, m: y }, { a: z * 10 + x, m: y },
      { a: x * 10 + y, m: z }, { a: y * 10 + x, m: z },
    ];
    const best = 경우.reduce((top, one) => (one.a * one.m > top.a * top.m ? one : top));
    if (경우.filter((one) => one.a * one.m === best.a * best.m).length > 1) return null;
    const others = 경우.filter((one) => one !== best).sort((p, q) => q.a * q.m - p.a * p.m);
    return {
      prompt: `수 카드 ${x}, ${y}, ${z}을(를) 한 번씩만 사용하여 (두 자리 수)×(한 자리 수)를 만들려고 합니다. 곱이 가장 크게 되는 곱셈식은 어느 것일까요?`.replace(/(\d)을\(를\)/, (_, d: string) => eul(d)),
      answer: `${best.a}×${best.m}`,
      wrongs: others.slice(0, 4).map((one) => `${one.a}×${one.m}`),
      tag: 'multiplication',
      concept: '곱이 크려면 곱하는 수와 곱해지는 수의 십의 자리 숫자가 커야 합니다. 여러 경우를 직접 계산해 견주어 봅니다.',
      strategy: '수 카드로 곱이 가장 큰 곱셈식 만들기',
      hint: '가장 큰 수를 어디에 놓으면 좋을지 두세 가지 경우를 직접 곱해 견주어 보세요.',
      steps: [...경우.map((one) => `${one.a}×${one.m}=${one.a * one.m}`), `가장 큰 곱은 ${best.a * best.m}이므로 ${best.a}×${best.m}입니다.`],
      misconceptionTip: '가장 큰 두 자리 수를 만든다고 곱이 가장 큰 것은 아닙니다. 곱하는 수도 함께 생각해야 합니다.',
    };
  },
};

const 어떤수문항 = (kind: MulKind): G5Family => ({
  id: `unknown-${kind}`,
  make: (seed) => {
    const one = mulFor(kind, seed + 29);
    return {
      prompt: `어떤 수를 ${euro(String(one.m))} 나누었더니 몫이 ${one.a}이었습니다. 어떤 수는 얼마일까요?`.replace(/(\d)이었습니다/, (_, d: string) => `${d}${particleOf(d, '이') === '이' ? '이었습니다' : '였습니다'}`),
      answer: String(one.result),
      wrongs: [one.a + one.m, ...wrongResults(one)].filter((v) => v !== one.result).map(String),
      tag: 'multiplication',
      concept: '□÷▲=●이면 □=▲×●입니다. 나눗셈과 곱셈은 서로 거꾸로입니다.',
      strategy: '곱셈과 나눗셈의 관계로 어떤 수 구하기',
      hint: '나눗셈식을 곱셈식으로 바꾸어 보세요. 몫과 나누는 수를 곱하면 처음 수가 됩니다.',
      steps: [`어떤 수를 □라 하면 □÷${one.m}=${one.a}이므로 □=${one.a}×${one.m}입니다.`, ...mulSteps(one).slice(0, -1), `${식(one)}=${one.result}이므로 어떤 수는 ${one.result}입니다.`],
      misconceptionTip: '‘나누었더니’라는 말이 있다고 나누면 안 됩니다. 처음 수를 구하므로 곱해야 합니다.',
    };
  },
});

const 곱비교문항 = (kind: MulKind): G5Family => ({
  id: `biggest-${kind}`,
  make: (seed) => {
    const list: Mul[] = [];
    for (let at = 0; at < 20 && list.length < 4; at += 1) {
      const one = mulFor(kind, seed * 5 + at * 41);
      if (list.some((o) => Math.abs(o.result - one.result) < 3)) continue;
      list.push(one);
    }
    if (list.length < 4) return null;
    const best = list.reduce((top, one) => (one.result > top.result ? one : top));
    return {
      prompt: '계산 결과가 가장 큰 것은 어느 것일까요?',
      answer: 식(best),
      wrongs: list.filter((one) => one !== best).map(식),
      tag: 'multiplication',
      concept: '곱셈식마다 끝까지 계산하여 견주어 봅니다.',
      strategy: `${꼴이름[kind]}의 계산 결과 견주기`,
      hint: '곱해지는 수가 크다고 곱이 큰 것은 아닙니다. 곱하는 수도 함께 보고, 하나씩 계산해 보세요.',
      steps: [...list.map((one) => `${식(one)}=${one.result}`), `가장 큰 값은 ${best.result}이므로 ${식(best)}입니다.`],
      misconceptionTip: '곱해지는 수만 보고 고르면 안 됩니다.',
    };
  },
});

// ── 6차시: 곱셈의 어림셈 ────────────────────────────────────────────
const 어림쌍 = (seed: number) => {
  const next = rand(seed);
  for (let at = 0; at < 50; at += 1) {
    const a = 12 + next(87);
    const m = 3 + next(7);
    const r = nearestTen(a);
    if (r === null || r === a || r === 100 && false) continue;
    return { a, m, r };
  }
  return { a: 48, m: 9, r: 50 };
};

const 어림식문항: G5Family = {
  id: 'est-expr',
  make: (seed) => {
    const { a, m, r } = 어림쌍(seed);
    const 아래 = Math.floor(a / 10) * 10;
    const 다른 = r === 아래 ? 아래 + 10 : 아래;
    return {
      prompt: `${a}×${m}의 계산 결과를 어림하려고 합니다. ${eul(String(a))} 가까운 몇십으로 어림하여 나타낸 식은 어느 것일까요?`,
      answer: `${r}×${m}`,
      // 68×90처럼 아직 셈할 수 없는 식은 쓰지 않습니다.
      wrongs: [`${다른}×${m}`, `${r}×${m + 1}`, `${r}×${m - 1}`, `${다른}×${m + 1}`],
      tag: 'multiplication',
      concept: '곱셈의 어림셈은 곱해지는 수를 가까운 몇십으로 바꾸어 곱합니다.',
      strategy: '곱셈의 어림셈을 하기 위한 식 세우기',
      hint: `${a}의 일의 자리 숫자를 보세요. ${eun(String(a))} 위의 몇십과 아래의 몇십 가운데 어느 쪽에 더 가까운가요?`,
      steps: [`${eun(String(a))} ${아래}과(와) ${아래 + 10} 사이에 있고 ${r}에 더 가깝습니다.`.replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`), `그러므로 어림셈을 하기 위한 식은 ${r}×${m}입니다.`],
      misconceptionTip: '곱하는 한 자리 수는 그대로 두고, 두 자리 수만 가까운 몇십으로 어림합니다.',
    };
  },
};

const 어림값문항: G5Family = {
  id: 'est-value',
  make: (seed) => {
    const { a, m, r } = 어림쌍(seed + 3);
    const 장면 = pick([
      { prompt: `한 상자에 귤이 ${a}개씩 들어 있습니다. ${m}상자에 들어 있는 귤은 약 몇 개인지 어림셈으로 구하면 얼마일까요?`, unit: '개' },
      { prompt: `리본을 한 개 만드는 데 색 테이프가 ${a} cm 필요합니다. 리본 ${m}개를 만드는 데 필요한 색 테이프는 약 몇 cm인지 어림셈으로 구하면 얼마일까요?`, unit: ' cm' },
      { prompt: `한 봉지에 사탕이 ${a}개씩 들어 있습니다. ${m}봉지에 들어 있는 사탕은 약 몇 개인지 어림셈으로 구하면 얼마일까요?`, unit: '개' },
    ], seed);
    const 값 = r * m;
    const 아래값 = Math.floor(a / 10) * 10 * m;
    const 글 = (v: number) => `약 ${v}${장면.unit}`;
    return {
      prompt: 장면.prompt,
      answer: 글(값),
      wrongs: [아래값 === 값 ? 값 + 10 * m : 아래값, 값 + m * 10 * 2, a * m === 값 ? 값 + 5 : a + m, r + m].filter((v) => v !== 값).map(글),
      tag: 'multiplication',
      concept: '곱셈의 어림셈은 곱해지는 수를 가까운 몇십으로 바꾸어 곱합니다.',
      strategy: '곱셈의 어림셈으로 실생활 문제 해결하기',
      hint: `${eul(String(a))} 가까운 몇십으로 바꾼 다음 ${eul(String(m))} 곱해 보세요.`,
      steps: [`${eun(String(a))} 약 ${euro(String(r))} 어림할 수 있습니다.`, `${r}×${m}=${값}이므로 ${글(값)}입니다.`],
      misconceptionTip: '어림셈은 정확한 값이 아니라 얼마쯤인지 구하는 것입니다. 가까운 몇십으로 바꾼 다음 곱하세요.',
    };
  },
};

const 어림판단문항: G5Family = {
  id: 'est-check',
  make: (seed) => {
    const { a, m, r } = 어림쌍(seed + 5);
    const exact = a * m;
    const 값 = r * m;
    const next = rand(seed + 9);
    const 맞음 = next(2) === 0;
    // 틀린 값은 어림한 값에서 150 넘게 떨어지게 둡니다. 바른 값은 어림한
    // 값에서 50 안쪽입니다(가까운 몇십으로 어림했으므로 많아야 5×9=45).
    // 둘 사이가 넉넉해야 '비슷하다'와 '많이 다르다'가 하나로 정해집니다.
    const 틀린값 = exact + (exact > 300 && next(2) === 0 ? -200 : 200);
    if (틀린값 <= 0) return null;
    const 말한값 = 맞음 ? exact : 틀린값;
    if (!맞음 && Math.abs(틀린값 - 값) < 150) return null;
    const who = pick(이름들, seed);
    return {
      prompt: `${iJosa(who)} ${a}×${eul(String(m))} 계산해서 ${eul(String(말한값))} 구했습니다. 어림셈을 이용하여 바르게 계산했는지 판단한 것으로 알맞은 것은 어느 것일까요?`,
      answer: 맞음
        ? `바르게 계산했습니다. 어림셈으로 구한 값 ${값}과(와) 비슷합니다.`.replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`)
        : `잘못 계산했습니다. 어림셈으로 구한 값 ${값}과(와) 많이 다릅니다.`.replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`),
      wrongs: [
        (맞음 ? `잘못 계산했습니다. 어림셈으로 구한 값 ${값}과(와) 많이 다릅니다.` : `바르게 계산했습니다. 어림셈으로 구한 값 ${값}과(와) 비슷합니다.`).replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`),
        `바르게 계산했습니다. 어림셈으로 구한 값 ${값 + 200}과(와) 비슷합니다.`.replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`),
        '어림셈으로는 바르게 계산했는지 알 수 없습니다.',
      ],
      tag: 'multiplication',
      concept: '어림셈으로 구한 값과 계산한 값을 견주면 계산이 바른지 확인할 수 있습니다.',
      strategy: '어림셈으로 곱셈의 계산 결과 확인하기',
      hint: `${eul(String(a))} 가까운 몇십으로 어림하여 곱해 보세요. ${who}의 값과 얼마나 차이 나는지 보세요.`,
      steps: [
        `${eun(String(a))} 약 ${euro(String(r))} 어림하면 ${r}×${m}=${값}입니다.`,
        맞음
          ? `${말한값}은(는) ${값}과(와) 비슷하므로 바르게 계산했습니다.`.replace(/(\d+)은\(는\)/, (_, n: string) => eun(n)).replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`)
          : `${말한값}은(는) ${값}과(와) 많이 다르므로 잘못 계산했습니다. 바르게 계산하면 ${a}×${m}=${exact}입니다.`.replace(/(\d+)은\(는\)/, (_, n: string) => eun(n)).replace(/(\d+)과\(와\)/, (_, n: string) => `${n}${particleOf(n, '과')}`),
      ],
      misconceptionTip: '어림셈의 값과 똑같지 않다고 틀린 것은 아닙니다. 비슷한지 많이 다른지를 봅니다.',
    };
  },
};

// ── 단원 도입 ───────────────────────────────────────────────────────
const 몇십문항: G5Family = {
  id: 'tens',
  make: (seed) => {
    const next = rand(seed + 31);
    const t = 2 + next(8);
    const m = 2 + next(4);
    if (t * m >= 10) return null;
    const value = t * 10 * m;
    return {
      prompt: `${t * 10}×${eun(String(m))} 얼마일까요?`,
      answer: String(value),
      wrongs: [t * m, t * 10 + m, value + 10, value * 10].filter((v) => v !== value).map(String),
      tag: 'multiplication',
      concept: `${t * 10}은(는) 10이 ${t}개인 수이므로, ${t * 10}×${m}은(는) 10이 ${t}×${m}=${t * m}개인 수입니다.`.replace(/(\d+)은\(는\)/g, (_, n: string) => eun(n)),
      strategy: '(몇십)×(몇) 계산하기',
      hint: `${t * 10}은 10이 몇 개인 수인가요? 10의 개수에 ${eul(String(m))} 곱해 보세요.`.replace(/(\d+)은 10이/, (_, n: string) => `${eun(n)} 10이`),
      steps: [`${t}×${m}=${t * m}이므로 10이 ${t * m}개입니다.`, `그러므로 ${t * 10}×${m}=${value}입니다.`],
      misconceptionTip: '몇십에 곱하면 결과도 몇십입니다. 끝에 0을 빠뜨리지 마세요.',
    };
  },
};

const 반복덧셈문항: G5Family = {
  id: 'repeat-add',
  make: (seed) => {
    const one = mulFor(pick(['none', 'ones'] as MulKind[], seed), seed + 37);
    if (one.m > 5) return null;
    const 덧셈 = Array(one.m).fill(one.a).join('+');
    return {
      prompt: `${eul(덧셈)} 곱셈식으로 나타낸 것은 어느 것일까요?`,
      answer: `${one.a}×${one.m}`,
      wrongs: [`${one.a}×${one.a}`, `${one.m}×${one.m}`, `${one.a}+${one.m}`, `${one.a}×${one.m + 1}`],
      tag: 'multiplication',
      concept: '같은 수를 여러 번 더한 것은 곱셈식으로 나타낼 수 있습니다.',
      strategy: '같은 수를 여러 번 더한 것을 곱셈식으로 나타내기',
      hint: `${one.a}을(를) 몇 번 더했는지 세어 보세요.`.replace(/(\d+)을\(를\)/, (_, n: string) => eul(n)),
      steps: [`${eul(String(one.a))} ${one.m}번 더했습니다.`, `그러므로 곱셈식은 ${one.a}×${one.m}입니다.`],
      misconceptionTip: '더한 횟수를 세어 곱하는 수로 씁니다.',
    };
  },
};

const 구구문항: G5Family = {
  id: 'times-table',
  make: (seed) => {
    const next = rand(seed + 41);
    const a = 2 + next(8);
    const b = 2 + next(8);
    return {
      prompt: `${a}×${eun(String(b))} 얼마일까요?`,
      answer: String(a * b),
      wrongs: [a * b + a, a * b - a, a + b, a * b + b].filter((v) => v > 0 && v !== a * b).map(String),
      tag: 'multiplication',
      concept: '곱셈구구를 정확히 알면 큰 수의 곱셈도 할 수 있습니다.',
      strategy: '곱셈구구 떠올리기',
      hint: `${a}단 곱셈구구를 외워 보세요.`,
      steps: [`${a}단 곱셈구구에서 ${a}×${b}=${a * b}입니다.`],
      misconceptionTip: '곱하는 두 수를 더하면 안 됩니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
const 차시꼴: Record<number, MulKind> = { 2: 'none', 3: 'tens', 4: 'ones', 5: 'both' };

export const unit4Lesson = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [구구문항, 몇십문항, 반복덧셈문항];
  if (lessonNo === 6) {
    if (하) return [어림식문항, 어림값문항];
    if (상) return [어림판단문항, 어림값문항, 어림식문항];
    return [어림식문항, 어림값문항, 어림판단문항];
  }
  const kind = 차시꼴[lessonNo];
  if (!kind) return null;
  if (하) return [계산문항(kind), 수모형문항(kind), 가르기문항(kind), 문장제문항(kind, 0)];
  if (상) return [곱비교문항(kind), 어떤수문항(kind), 고치기문항(kind), 문장제문항(kind, 2), ...(kind === 'both' ? [수카드문항] : [])];
  return [문장제문항(kind, 1), 고치기문항(kind), 부분곱문항(kind), 계산문항(kind)];
};
