import type { Difficulty } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { pick, rand } from '../../grade5/util';
import { carryReuse, kindOk, mulSteps, nearestHundred, nearestTen, noCarryOne, noCarryTwo, pairFor, placeSlipTwo, sideBySide, wrongsFor, type Kind, type Pair } from './core';

// ════════════════════════════════════════════════════════════════════
// 3-2 1단원 곱셈 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입
//   2 올림이 없는 (세 자리 수)×(한 자리 수)
//   3 일의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)
//   4 십의 자리, 백의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)
//   5 (몇십)×(몇십), (몇십몇)×(몇십)
//   6 (한 자리 수)×(두 자리 수)
//   7 올림이 한 번 있는 (두 자리 수)×(두 자리 수)
//   8 올림이 여러 번 있는 (두 자리 수)×(두 자리 수)
//   9 곱셈의 어림셈 — 세 자리 수는 가까운 몇백, 두 자리 수는 가까운
//     몇십으로 어림합니다(지도서 796×2 → 800×2, 52×28 → 50×30,
//     19×30 → 20×30, 58×40 → 60×40). 가운데에 걸리는 수(45, 650)는
//     어느 쪽으로 어림할지 정해지지 않으므로 내지 않습니다.
// 글은 조사를 '을(를)'처럼 적고, 문항을 만들 때 앞말에 맞춥니다.
// ════════════════════════════════════════════════════════════════════

const 꼴이름: Record<Kind, string> = {
  h0: '올림이 없는 (세 자리 수)×(한 자리 수)',
  h1: '일의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)',
  h2: '십의 자리, 백의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)',
  tt: '(몇십)×(몇십)',
  nt: '(몇십몇)×(몇십)',
  od: '(한 자리 수)×(두 자리 수)',
  d1: '올림이 한 번 있는 (두 자리 수)×(두 자리 수)',
  d2: '올림이 여러 번 있는 (두 자리 수)×(두 자리 수)',
};

const 핵심: Record<Kind, string> = {
  h0: '(세 자리 수)×(한 자리 수)는 일의 자리, 십의 자리, 백의 자리 수에 각각 곱한 다음 모두 더합니다.',
  h1: '일의 자리 곱이 10이거나 10보다 크면 십의 자리 위에 올림한 수를 작게 쓰고, 십의 자리를 곱한 다음 더합니다.',
  h2: '십의 자리 곱이 10이거나 10보다 크면 백의 자리로, 백의 자리 곱이 10이거나 10보다 크면 천의 자리로 올림합니다.',
  tt: '(몇십)×(몇십)은 (몇)×(몇)을 계산한 다음 두 수에 있는 0의 수만큼 0을 붙입니다. 30×20=30×2×10입니다.',
  nt: '(몇십몇)×(몇십)은 (몇십몇)×(몇)의 10배입니다. 16×20은 16×2=32의 10배인 320입니다.',
  od: '(한 자리 수)×(두 자리 수)는 곱하는 수를 몇십과 몇으로 나누어 각각 곱한 다음 더합니다. 4×17=4×10+4×7입니다.',
  d1: '(두 자리 수)×(두 자리 수)는 곱하는 수를 몇십과 몇으로 나누어 곱한 다음 더합니다. 27×12=27×2+27×10입니다.',
  d2: '(두 자리 수)×(두 자리 수)는 곱하는 수의 일의 자리와 몇십을 각각 곱해 더합니다. 올림한 수는 그 곱셈 안에서만 더합니다.',
};

const 볼곳: Record<Kind, string> = {
  h0: '일의 자리부터 곱하세요. 십의 자리 숫자는 몇십, 백의 자리 숫자는 몇백을 나타냅니다.',
  h1: '일의 자리 곱이 10을 넘습니다. 올림한 수를 십의 자리 위에 작게 써 두고, 십의 자리를 곱한 다음 더하세요.',
  h2: '십의 자리 곱이나 백의 자리 곱이 10을 넘습니다. 넘친 수를 바로 윗자리 위에 작게 써 두고 더하세요.',
  tt: '0을 떼고 (몇)×(몇)을 먼저 계산한 다음, 떼어 낸 0의 수만큼 0을 붙이세요.',
  nt: '곱하는 수의 0을 떼고 (몇십몇)×(몇)을 먼저 계산한 다음 0을 하나 붙이세요.',
  od: '곱하는 수를 몇십과 몇으로 나누어 보세요. 각각 곱한 다음 더합니다.',
  d1: '곱하는 수의 일의 자리 수를 먼저 곱하고, 십의 자리 수를 곱한 값은 한 자리 왼쪽에 맞추어 쓴 다음 더하세요.',
  d2: '두 번의 곱셈을 따로 하세요. 첫 번째 곱셈에서 올림한 수를 두 번째 곱셈에 더하면 안 됩니다.',
};

const 오개념: Record<Kind, string> = {
  h0: '십의 자리, 백의 자리 숫자에 곱한 값도 자리에 맞추어 쓰세요. 200을 2로 쓰면 안 됩니다.',
  h1: '일의 자리에서 올림한 수를 십의 자리 계산에 더하는 것을 잊지 마세요.',
  h2: '십의 자리에서 올림한 수는 백의 자리 계산에 더합니다. 백의 자리 곱이 넘치면 천의 자리에 씁니다.',
  tt: '0을 빠뜨리거나 더 붙이지 않도록 하세요. 0의 수를 세어 확인하세요.',
  nt: '곱하는 수가 몇십이면 계산 결과의 일의 자리는 0입니다. 0을 빠뜨리지 마세요.',
  od: '곱셈구구 값을 나란히 이어 쓰면 안 됩니다. 5×19를 545라고 하면 올림을 하지 않은 것입니다.',
  d1: '십의 자리 수를 곱한 값은 몇십을 곱한 값입니다. 자리를 맞추지 않고 더하면 안 됩니다.',
  d2: '일의 자리 곱에서 올림한 수를 십의 자리 곱에서 또 쓰면 안 됩니다. 어림한 값과 견주어 확인하세요.',
};

const 식 = ({ a, b }: Pair) => `${a}×${b}`;

const 자기확인: Record<Kind, string> = {
  h0: '곱해지는 수를 가까운 몇백으로 어림하여 곱한 값과 비슷한가요?',
  h1: '곱해지는 수를 가까운 몇백으로 어림하여 곱한 값과 비슷한가요?',
  h2: '곱해지는 수를 가까운 몇백으로 어림하여 곱한 값과 비슷한가요?',
  tt: '계산 결과 끝에 0이 알맞게 붙었나요?',
  nt: '(몇십몇)×(몇)의 10배가 되었나요?',
  od: '두 수를 바꾸어 곱해도 같은 값이 나오나요?',
  d1: '두 수를 각각 가까운 몇십으로 어림하여 곱한 값과 비슷한가요?',
  d2: '두 수를 각각 가까운 몇십으로 어림하여 곱한 값과 비슷한가요?',
};

// ── 계산 ────────────────────────────────────────────────────────────
const 계산문항 = (kind: Kind): G5Family => ({
  id: `calc-${kind}`,
  make: (seed) => {
    const one = pairFor(kind, seed);
    if (!one) return null;
    return {
      prompt: `${식(one)}을(를) 계산하면 얼마일까요?`,
      answer: String(one.a * one.b),
      wrongs: wrongsFor(kind, one).map(String),
      tag: 'multiplication',
      concept: 핵심[kind],
      strategy: `${꼴이름[kind]} 계산하기`,
      hint: 볼곳[kind],
      steps: mulSteps(kind, one),
      misconceptionTip: 오개념[kind],
      selfCheck: 자기확인[kind],
    };
  },
});

// ── 세로 셈의 한 줄이 나타내는 것 ──────────────────────────────────
const 부분곱문항 = (kind: Kind): G5Family => ({
  id: `partial-${kind}`,
  make: (seed) => {
    const one = pairFor(kind, seed + 11);
    if (!one) return null;
    const { a, b } = one;
    if (kind === 'h0' || kind === 'h1' || kind === 'h2') {
      const t = Math.floor((a % 100) / 10);
      if (t === 0) return null;
      const 값 = t * 10 * b;
      return {
        prompt: `${식(one)}을(를) 자리마다 나누어 계산했더니 ${a % 10 * b}, ${값}, ${Math.floor(a / 100) * 100 * b}이(가) 나왔습니다. ${값}은(는) 어떤 곱셈을 계산한 값일까요?`,
        answer: `${t * 10}×${b}`,
        wrongs: [`${t}×${b}`, `${a % 10}×${b}`, `${Math.floor(a / 100) * 100}×${b}`, `${t * 100}×${b}`].filter((w) => w !== `${t * 10}×${b}` && !w.startsWith('0×')),
        tag: 'multiplication',
        concept: '세로 셈에서 십의 자리 숫자를 곱한 값은 몇십에 곱한 값입니다.',
        strategy: '세로 셈의 부분 곱 알기',
        hint: `${a}의 십의 자리 숫자 ${t}은(는) 실제로 얼마를 나타내나요?`,
        steps: [`${a}의 십의 자리 숫자 ${t}은(는) ${t * 10}을(를) 나타냅니다.`, `${t * 10}×${b}=${값}이므로 ${값}은(는) ${t * 10}×${b}을(를) 계산한 값입니다.`],
        misconceptionTip: `십의 자리 숫자 ${t}에 곱한 것이 아니라 ${t * 10}에 곱한 것입니다.`,
      };
    }
    if (kind === 'od') {
      const t = Math.floor(b / 10) * 10;
      return {
        prompt: `${식(one)}을(를) 세로로 계산했더니 ${a * (b % 10)}과(와) ${a * t}이(가) 나왔습니다. ${a * t}은(는) 어떤 곱셈을 계산한 값일까요?`,
        answer: `${a}×${t}`,
        wrongs: [`${a}×${t / 10}`, `${a}×${b % 10}`, `${t}×${b % 10}`, `${a}×${b}`].filter((w) => w !== `${a}×${t}`),
        tag: 'multiplication',
        concept: '곱하는 수를 몇십과 몇으로 나누어 곱합니다. 몇십을 곱한 값은 일의 자리가 0입니다.',
        strategy: '세로 셈의 부분 곱 알기',
        hint: `${b}을(를) ${t}과(와) ${b % 10}(으)로 나누어 생각해 보세요.`,
        steps: [`${b}=${t}+${b % 10}입니다.`, `${a}×${t}=${a * t}이므로 ${a * t}은(는) ${a}×${t}을(를) 계산한 값입니다.`],
        misconceptionTip: `${a}×${t / 10}=${a * (t / 10)}이 아니라 ${a}×${t}=${a * t}입니다.`,
      };
    }
    if (kind === 'd1' || kind === 'd2') {
      const t = Math.floor(b / 10) * 10;
      return {
        prompt: `${식(one)}을(를) 세로로 계산할 때 두 번째 줄에 쓰는 ${a * t}은(는) 어떤 곱셈을 계산한 값일까요?`,
        answer: `${a}×${t}`,
        wrongs: [`${a}×${t / 10}`, `${a}×${b % 10}`, `${Math.floor(a / 10) * 10}×${t}`, `${a % 10}×${t}`].filter((w) => w !== `${a}×${t}`),
        tag: 'multiplication',
        concept: '(두 자리 수)×(두 자리 수)의 세로 셈에서 첫째 줄은 곱하는 수의 일의 자리를, 둘째 줄은 몇십을 곱한 값입니다.',
        strategy: '세로 셈의 두 줄이 나타내는 것 알기',
        hint: `${b}의 십의 자리 숫자 ${t / 10}은(는) 실제로 얼마를 나타내나요?`,
        steps: [`${b}=${t}+${b % 10}입니다.`, `둘째 줄은 ${a}×${t}=${a * t}입니다. 그래서 한 자리 왼쪽에 맞추어 씁니다.`],
        misconceptionTip: `둘째 줄을 ${a * (t / 10)}(으)로 생각하고 일의 자리에 맞추어 쓰면 자릿값이 틀립니다.`,
      };
    }
    const 몇 = b / 10;
    return {
      prompt: `${식(one)}=${a}×${몇}×□입니다. □ 안에 알맞은 수는 얼마일까요?`,
      answer: '10',
      wrongs: ['100', String(몇), '0', '2'].filter((w) => w !== '10' && w !== '0'),
      tag: 'multiplication',
      concept: `(몇십)은 (몇)×10입니다. 그래서 ${a}×${b}은(는) ${a}×${몇}의 10배입니다.`,
      strategy: '곱하는 수의 몇십을 (몇)×10으로 보기',
      hint: `${b}은(는) ${몇}의 몇 배인가요?`,
      steps: [`${b}=${몇}×10입니다.`, `그러므로 ${a}×${b}=${a}×${몇}×10이고 □ 안에 알맞은 수는 10입니다.`],
      misconceptionTip: '몇십은 몇의 10배입니다. 100배가 아닙니다.',
    };
  },
});

// ── 가르기: 27×12=27×10+27×□ ───────────────────────────────────────
const 가르기문항 = (kind: Kind): G5Family => ({
  id: `split-${kind}`,
  make: (seed) => {
    const one = pairFor(kind, seed + 13);
    if (!one) return null;
    const { a, b } = one;
    if (kind === 'h0' || kind === 'h1' || kind === 'h2') {
      const h = Math.floor(a / 100) * 100;
      const t = Math.floor((a % 100) / 10) * 10;
      const o = a % 10;
      if (!t || !o) return null;
      return {
        prompt: `${식(one)}=${h}×${b}+${t}×${b}+□×${b}입니다. □ 안에 알맞은 수는 얼마일까요?`,
        answer: String(o),
        wrongs: [String(b), String(o * 10), String(a - h), String(o + 1)].filter((w) => w !== String(o)),
        tag: 'multiplication',
        concept: `${a}=${h}+${t}+${o}이므로 ${식(one)}은(는) 자리마다 ${b}을(를) 곱한 값의 합입니다.`,
        strategy: '곱해지는 수를 몇백, 몇십, 몇으로 갈라 곱하기',
        hint: `${a}을(를) 몇백, 몇십, 몇으로 갈라 보세요.`,
        steps: [`${a}=${h}+${t}+${o}입니다.`, `그러므로 ${식(one)}=${h}×${b}+${t}×${b}+${o}×${b}이고 □=${o}입니다.`],
        misconceptionTip: '자리마다 같은 수를 곱합니다. 한 자리라도 빠뜨리면 안 됩니다.',
      };
    }
    if (kind === 'tt' || kind === 'nt') return null;
    const 큰 = kind === 'od' ? b : b;
    const t = Math.floor(큰 / 10) * 10;
    const o = 큰 % 10;
    return {
      prompt: `${식(one)}=${a}×${t}+${a}×□입니다. □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(o),
      wrongs: [String(t), String(t / 10), String(a), String(o + 1)].filter((w) => w !== String(o)),
      tag: 'multiplication',
      concept: `${b}=${t}+${o}이므로 ${a}×${b}은(는) ${a}×${t}과(와) ${a}×${o}의 합입니다.`,
      strategy: '곱하는 수를 몇십과 몇으로 갈라 곱하기',
      hint: `${b}을(를) 몇십과 몇으로 나누어 보세요.`,
      steps: [`${b}=${t}+${o}입니다.`, `그러므로 ${식(one)}=${a}×${t}+${a}×${o}이고 □=${o}입니다.`],
      misconceptionTip: '곱하는 수를 갈랐으면 두 부분 모두에 같은 수를 곱해야 합니다.',
      // 교과서의 모눈: ${a}칸씩 ${t}줄과 ${a}칸씩 ${o}줄입니다. □의 값(${o}줄)을 이름표에
      // 쓰면 답이 보이므로 아래 덩어리 이름은 '?줄'로 둡니다.
      ...(kind !== 'od' && b <= 50 ? { visual: {
        kind: 'mul-grid' as const,
        label: `${a}칸씩 ${b}줄인 모눈을 ${t}줄과 나머지로 나눈 그림`,
        columns: a,
        rowParts: [t, o],
        partLabels: [`${a}×${t}`, `${a}×□`],
      } } : {}),
    };
  },
});

// ── 문장제 ──────────────────────────────────────────────────────────
type 장면 = (a: number, b: number) => { prompt: string; unit: string };
const 장면들: 장면[] = [
  (a, b) => ({ prompt: `구슬이 한 바구니에 ${a}개씩 들어 있습니다. ${b}바구니에 들어 있는 구슬은 모두 몇 개일까요?`, unit: '개' }),
  (a, b) => ({ prompt: `배 한 척에 승객이 ${a}명씩 탈 수 있습니다. 배 ${b}척에 탈 수 있는 승객은 모두 몇 명일까요?`, unit: '명' }),
  (a, b) => ({ prompt: `한 상자에 한과가 ${a}개씩 들어 있습니다. ${b}상자에 들어 있는 한과는 모두 몇 개일까요?`, unit: '개' }),
  (a, b) => ({ prompt: `색종이를 한 사람에게 ${a}장씩 ${b}명에게 나누어 주려고 합니다. 필요한 색종이는 모두 몇 장일까요?`, unit: '장' }),
  (a, b) => ({ prompt: `밤을 한 봉지에 ${a}개씩 ${b}봉지에 담았습니다. 담은 밤은 모두 몇 개일까요?`, unit: '개' }),
  (a, b) => ({ prompt: `감을 한 줄에 ${a}개씩 ${b}줄에 꿰었습니다. 꿴 감은 모두 몇 개일까요?`, unit: '개' }),
];

const 문장제문항 = (kind: Kind, at: number): G5Family => ({
  id: `word-${kind}-${at}`,
  make: (seed) => {
    const one = pairFor(kind, seed + at * 17 + 5);
    if (!one) return null;
    const scene = pick(장면들, seed + at)(one.a, one.b);
    const r = one.a * one.b;
    return {
      prompt: scene.prompt,
      answer: `${r}${scene.unit}`,
      wrongs: [one.a + one.b, ...wrongsFor(kind, one)].filter((v) => v !== r).map((v) => `${v}${scene.unit}`),
      tag: 'multiplication',
      concept: '같은 수씩 여러 묶음이 있으면 곱셈으로 모두 몇인지 구합니다.',
      strategy: `${꼴이름[kind]}(으)로 문제 해결하기`,
      hint: '한 묶음에 몇씩, 몇 묶음인지 찾아 곱셈식을 세우세요.',
      steps: [`${one.a}씩 ${one.b}묶음이므로 식은 ${식(one)}입니다.`, ...mulSteps(kind, one).slice(0, -1), `${식(one)}=${r}이므로 모두 ${r}${scene.unit}입니다.`],
      misconceptionTip: '두 수를 더하면 안 됩니다. 같은 수가 여러 번 있으므로 곱합니다.',
    };
  },
});

// ── 잘못 계산한 곳 고치기 ──────────────────────────────────────────
type 실수 = { value: number; 까닭: string };
const 실수들 = (kind: Kind, { a, b }: Pair): 실수[] => {
  const r = a * b;
  const out: Array<실수 | null> = [];
  if (kind === 'h0' || kind === 'h1' || kind === 'h2') {
    out.push({ value: noCarryOne(a, b), 까닭: '올림한 수를 윗자리 계산에 더하지 않았습니다.' });
    const h = Math.floor(a / 100);
    out.push({ value: r - h * 100 * b + h * b, 까닭: `백의 자리 계산 ${h * 100}×${b}=${h * 100 * b}을(를) 자리에 맞추어 쓰지 않았습니다.` });
  } else if (kind === 'tt' || kind === 'nt') {
    out.push({ value: r / 10, 까닭: '곱하는 수의 0을 붙이지 않았습니다.' });
    out.push({ value: r * 10, 까닭: '0을 하나 더 붙였습니다.' });
  } else if (kind === 'od') {
    out.push({ value: sideBySide(b, a), 까닭: '올림을 하지 않고 곱셈구구 값을 나란히 썼습니다.' });
    out.push({ value: a * (b % 10) + a * Math.floor(b / 10), 까닭: `${a}×${Math.floor(b / 10) * 10}의 값을 몇십으로 쓰지 않았습니다.` });
  } else {
    out.push({ value: placeSlipTwo(a, b), 까닭: `${a}×${Math.floor(b / 10) * 10}의 계산 결과를 자리에 맞추어 쓰지 않았습니다.` });
    const reuse = carryReuse(a, b);
    if (reuse !== null) out.push({ value: reuse, 까닭: '일의 자리 곱에서 올림한 수를 십의 자리 곱에서도 더했습니다.' });
    out.push({ value: noCarryTwo(a, b), 까닭: '올림한 수를 윗자리 계산에 더하지 않았습니다.' });
  }
  return out.filter((m): m is 실수 => m !== null && m.value !== r && m.value > 0 && Number.isInteger(m.value));
};

const 이름들 = ['은지', '도윤', '서아', '하준', '지우', '민재', '민서'];

const 고치기문항 = (kind: Kind): G5Family => ({
  id: `fix-${kind}`,
  make: (seed) => {
    const one = pairFor(kind, seed + 19);
    if (!one) return null;
    const ms = 실수들(kind, one);
    if (!ms.length) return null;
    const mistake = pick(ms, seed);
    const who = pick(이름들, seed + 1);
    const r = one.a * one.b;
    return {
      prompt: `${who}은(는) ${식(one)}을(를) ${mistake.value}(이)라고 계산했습니다. 바르게 계산하면 얼마일까요?`,
      answer: String(r),
      wrongs: [mistake.value, ...wrongsFor(kind, one)].filter((v) => v !== r).map(String),
      tag: 'multiplication',
      concept: 핵심[kind],
      strategy: `${꼴이름[kind]}에서 잘못 계산한 곳 고치기`,
      hint: '처음부터 자리마다 다시 곱해 보세요. 올림한 수와 자릿값을 확인하세요.',
      steps: [...mulSteps(kind, one), `${who}은(는) ${mistake.까닭.replace(/습니다\.$/, '')}어서 틀렸습니다.`.replace('않았어서', '않아서').replace('썼어서', '써서').replace('더했어서', '더해서').replace('붙였어서', '붙여서')],
      misconceptionTip: 오개념[kind],
    };
  },
});

const 까닭문항 = (kind: Kind): G5Family => ({
  id: `why-${kind}`,
  make: (seed) => {
    const one = pairFor(kind, seed + 23);
    if (!one) return null;
    const ms = 실수들(kind, one);
    if (!ms.length) return null;
    const mistake = pick(ms, seed + 2);
    const who = pick(이름들, seed + 3);
    const 다른까닭 = [
      '올림한 수를 윗자리 계산에 더하지 않았습니다.',
      '곱하는 수의 0을 붙이지 않았습니다.',
      '일의 자리 곱에서 올림한 수를 십의 자리 곱에서도 더했습니다.',
      '올림을 하지 않고 곱셈구구 값을 나란히 썼습니다.',
      '곱셈 대신 덧셈을 했습니다.',
      '0을 하나 더 붙였습니다.',
    ]
      .filter((one2) => !ms.some((m) => m.까닭 === one2))
      // (한 자리 수)×(두 자리 수), (두 자리 수)×(두 자리 수)에서 몇십을 곱한 값을
      // 자리에 맞추지 않은 것은 '0을 붙이지 않은 것'과 같은 실수라서 오답 보기로 두지 않습니다.
      .filter((one2) => !(one2 === '곱하는 수의 0을 붙이지 않았습니다.' && (kind === 'od' || kind === 'd1' || kind === 'd2')));
    return {
      prompt: `${who}은(는) ${식(one)}=${mistake.value}(이)라고 계산했습니다. 잘못 계산한 까닭으로 알맞은 것은 어느 것일까요?`,
      answer: mistake.까닭,
      wrongs: 다른까닭.slice(0, 3),
      tag: 'multiplication',
      concept: 핵심[kind],
      strategy: '잘못 계산한 까닭 찾기',
      hint: `바르게 계산하면 ${식(one)}=${one.a * one.b}입니다. ${who}의 값과 어디가 다른지 자리마다 견주어 보세요.`,
      steps: [...mulSteps(kind, one), `${mistake.value}은(는) ${mistake.까닭.replace(/습니다\.$/, '')}을 때 나오는 값입니다.`.replace('않았을', '않았을').replace('썼을', '썼을')],
      misconceptionTip: 오개념[kind],
    };
  },
});

// ── 상: 계산 결과 비교 ─────────────────────────────────────────────
const 기호 = ['㉠', '㉡', '㉢', '㉣'];
const 비교문항 = (kind: Kind): G5Family => ({
  id: `order-${kind}`,
  make: (seed) => {
    const next = rand(seed + 31);
    const pairs: Pair[] = [];
    for (let k = 0; k < 12 && pairs.length < 3; k += 1) {
      const one = pairFor(kind, seed * 7 + k * 101 + next(50));
      if (one && !pairs.some((p) => p.a * p.b === one.a * one.b)) pairs.push(one);
    }
    if (pairs.length < 3) return null;
    const 큰 = next(2) === 0;
    const values = pairs.map((p) => p.a * p.b);
    const best = 큰 ? Math.max(...values) : Math.min(...values);
    const at = values.indexOf(best);
    return {
      prompt: `계산 결과가 가장 ${큰 ? '큰' : '작은'} 것은 어느 것일까요? (${pairs.map((p, k) => `${기호[k]} ${식(p)}`).join(', ')})`,
      answer: 기호[at],
      wrongs: [...기호.slice(0, 3).filter((_, k) => k !== at), '모두 같습니다.'],
      tag: 'multiplication',
      concept: 핵심[kind],
      strategy: '곱셈식을 계산하여 크기 비교하기',
      hint: '세 식을 모두 계산한 다음 견주어 보세요. 먼저 어림해 보면 크기를 짐작할 수 있습니다.',
      steps: [pairs.map((p, k) => `${기호[k]} ${식(p)}=${p.a * p.b}`).join(', '), `가장 ${큰 ? '큰' : '작은'} 값은 ${best}이므로 ${기호[at]}입니다.`],
      misconceptionTip: '곱해지는 수만 보고 판단하면 틀릴 수 있습니다. 곱하는 수도 함께 보세요.',
    };
  },
});

// ── 1차시: 단원 도입 ───────────────────────────────────────────────
const 도입문항: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = rand(seed);
    const a = 12 + next(87);
    const m = 2 + next(8);
    if (a % 10 === 0) return null;
    const r = a * m;
    const 문장 = next(2) === 0;
    const t = Math.floor(a / 10) * 10;
    const o = a % 10;
    return {
      prompt: 문장 ? `줄넘기를 하루에 ${a}번씩 ${m}일 동안 했습니다. 모두 몇 번 했을까요?` : `${a}×${m}을(를) 계산하면 얼마일까요?`,
      answer: 문장 ? `${r}번` : String(r),
      wrongs: [t * m + ((o * m) % 10), Math.floor(a / 10) * m + o * m, r + 10, r - 10, a + m].filter((v) => v !== r && v > 0).map((v) => (문장 ? `${v}번` : String(v))),
      tag: 'multiplication',
      concept: '(두 자리 수)×(한 자리 수)는 몇십과 몇에 각각 곱한 다음 더합니다(3학년 1학기).',
      strategy: '(두 자리 수)×(한 자리 수) 떠올리기',
      hint: `${a}을(를) ${t}과(와) ${o}(으)로 나누어 각각 ${m}을(를) 곱해 보세요.`,
      steps: [`${t}×${m}=${t * m}, ${o}×${m}=${o * m}입니다.`, `${t * m}+${o * m}=${r}이므로 ${r}${문장 ? '번' : ''}입니다.`],
      misconceptionTip: '일의 자리에서 올림한 수를 더하는 것을 잊지 마세요.',
    };
  },
};

// ── 5차시 덧붙임: 30×20은 30×2의 몇 배 ───────────────────────────────
const 열배문항: G5Family = {
  id: 'ten-times',
  make: (seed) => {
    const next = rand(seed + 37);
    const a = next(2) === 0 ? (1 + next(9)) * 10 : 11 + next(89);
    const 몇 = 2 + next(8);
    if (a % 10 === 0 && a === 10) return null;
    return {
      prompt: `${a}×${몇 * 10}의 계산 결과는 ${a}×${몇}의 계산 결과의 몇 배일까요?`,
      answer: '10배',
      wrongs: ['2배', '100배', `${몇}배`, '20배'].filter((w) => w !== '10배'),
      tag: 'multiplication',
      concept: '곱하는 수가 10배가 되면 곱도 10배가 됩니다.',
      strategy: '곱하는 수가 10배일 때 곱의 변화 알기',
      hint: `${몇 * 10}은(는) ${몇}의 몇 배인가요?`,
      steps: [`${몇 * 10}=${몇}×10입니다.`, `그러므로 ${a}×${몇 * 10}=${a}×${몇}×10이고, ${a * 몇}의 10배인 ${a * 몇 * 10}입니다.`],
      misconceptionTip: '0이 하나 붙으면 10배입니다. 100배가 아닙니다.',
    };
  },
};

// ── 6차시 덧붙임: 6×23과 23×6 ─────────────────────────────────────────
const 바꾸어곱하기문항: G5Family = {
  id: 'commute',
  make: (seed) => {
    const one = pairFor('od', seed + 41);
    if (!one) return null;
    const { a, b } = one;
    return {
      prompt: `${a}×${b}과(와) ${b}×${a}의 계산 결과를 비교한 것으로 알맞은 것은 어느 것일까요?`,
      answer: '두 계산 결과가 같습니다.',
      wrongs: [`${a}×${b}이(가) 더 큽니다.`, `${b}×${a}이(가) 더 큽니다.`, '계산해 보기 전에는 알 수 없습니다.'],
      tag: 'multiplication',
      concept: '두 수를 바꾸어 곱해도 곱은 같습니다. 하지만 뜻은 다릅니다. 4×17은 4씩 17묶음, 17×4는 17씩 4묶음입니다.',
      strategy: '두 수를 바꾸어 곱하기',
      hint: '두 식을 각각 계산해 보세요.',
      steps: [`${a}×${b}=${a * b}, ${b}×${a}=${a * b}입니다.`, '두 수를 바꾸어 곱해도 계산 결과는 같습니다.'],
      misconceptionTip: '곱해지는 수가 크다고 곱이 더 큰 것은 아닙니다.',
    };
  },
};

// ── 9차시: 어림셈 ───────────────────────────────────────────────────
type 어림쌍 = { a: number; b: number; ea: number; eb: number };
const 어림쌍뽑기 = (seed: number): 어림쌍 | null => {
  const next = rand(seed);
  if (next(2) === 0) {
    const a = 101 + next(898);
    const b = 2 + next(8);
    const ea = nearestHundred(a);
    if (ea === null || a % 100 === 0 || ea === 0) return null;
    return { a, b, ea, eb: b };
  }
  const a = 11 + next(89);
  const b = 11 + next(89);
  const ea = nearestTen(a);
  const eb = nearestTen(b);
  if (ea === null || eb === null || a % 10 === 0 || b % 10 === 0) return null;
  return { a, b, ea, eb };
};

const 어림말 = (q: 어림쌍) =>
  q.b < 10
    ? `${q.a}은(는) ${q.ea}에 가까우므로 ${q.ea}×${q.b}(으)로 어림합니다.`
    : `${q.a}은(는) ${q.ea}에, ${q.b}은(는) ${q.eb}에 가까우므로 ${q.ea}×${q.eb}(으)로 어림합니다.`;

const 어림식문항: G5Family = {
  id: 'est-expr',
  make: (seed) => {
    const q = 어림쌍뽑기(seed + 43);
    if (!q) return null;
    const 세자리 = q.b < 10;
    const 답 = `${q.ea}×${q.eb}`;
    const 내림 = 세자리 ? Math.floor(q.a / 100) * 100 : Math.floor(q.a / 10) * 10;
    const 올림 = 내림 + (세자리 ? 100 : 10);
    const 반대 = q.ea === 내림 ? 올림 : 내림;
    const wrongs = 세자리
      ? [`${반대}×${q.b}`, `${Math.floor(q.a / 10) * 10}×${q.b}`, `${q.ea / 100}×${q.b}`]
      : [`${반대}×${q.eb}`, `${q.ea}×${q.eb === Math.floor(q.b / 10) * 10 ? q.eb + 10 : q.eb - 10}`, `${q.ea / 10}×${q.eb / 10}`];
    return {
      prompt: `${q.a}×${q.b}을(를) 어림셈하려고 합니다. 어림셈을 하기 위한 식으로 가장 알맞은 것은 어느 것일까요?`,
      answer: 답,
      wrongs: wrongs.filter((w) => w !== 답 && !/^0×|×0$/.test(w)),
      tag: 'estimate',
      concept: 세자리 ? '세 자리 수는 가까운 몇백으로 어림하면 계산하기 쉽습니다.' : '두 자리 수는 각각 가까운 몇십으로 어림하면 계산하기 쉽습니다.',
      strategy: '곱셈의 어림셈 식 세우기',
      hint: 세자리 ? `${q.a}은(는) 어느 몇백에 더 가까운가요?` : `${q.a}과(와) ${q.b}은(는) 각각 어느 몇십에 더 가까운가요?`,
      steps: [어림말(q), `그러므로 어림셈을 하기 위한 식은 ${답}입니다.`],
      misconceptionTip: '무조건 버리면 안 됩니다. 더 가까운 쪽으로 어림합니다.',
    };
  },
};

const 어림값문항: G5Family = {
  id: 'est-value',
  make: (seed) => {
    const q = 어림쌍뽑기(seed + 47);
    if (!q) return null;
    const v = q.ea * q.eb;
    const scene = q.b < 10
      ? pick([
          { p: `한 바퀴가 ${q.a} m인 호수를 ${q.b}바퀴 걸었습니다. 걸은 거리는 약 몇 m인지 어림셈으로 구해 보세요.`, u: ' m' },
          { p: `한 상자에 ${q.a}개씩 들어 있는 사탕 ${q.b}상자가 있습니다. 사탕은 약 몇 개인지 어림셈으로 구해 보세요.`, u: '개' },
        ], seed)
      : pick([
          { p: `붙임딱지가 한 묶음에 ${q.a}장씩 ${q.b}묶음 있습니다. 붙임딱지는 약 몇 장인지 어림셈으로 구해 보세요.`, u: '장' },
          { p: `빵 가게에서 하루에 밀가루를 ${q.a}봉지씩 ${q.b}일 동안 씁니다. 쓰는 밀가루는 약 몇 봉지인지 어림셈으로 구해 보세요.`, u: '봉지' },
        ], seed);
    const 다른어림 = q.b < 10
      ? [Math.floor(q.a / 100) * 100 * q.b, (Math.floor(q.a / 100) + 1) * 100 * q.b]
      : [Math.floor(q.a / 10) * 10 * Math.floor(q.b / 10) * 10, (Math.floor(q.a / 10) + 1) * 10 * (Math.floor(q.b / 10) + 1) * 10];
    return {
      prompt: scene.p,
      answer: `약 ${v}${scene.u}`,
      wrongs: [...다른어림, v * 10, v / 10].filter((w) => w !== v && Number.isInteger(w) && w > 0).map((w) => `약 ${w}${scene.u}`),
      tag: 'estimate',
      concept: '곱셈의 어림셈은 수를 가까운 몇백이나 몇십으로 어림하여 계산 결과가 얼마쯤인지 구하는 것입니다.',
      strategy: '곱셈의 어림셈으로 실생활 문제 해결하기',
      hint: q.b < 10 ? `${q.a}을(를) 가까운 몇백으로 어림한 다음 ${q.b}을(를) 곱해 보세요.` : '두 수를 각각 가까운 몇십으로 어림한 다음 곱해 보세요.',
      steps: [어림말(q), `${q.ea}×${q.eb}=${v}이므로 약 ${v}${scene.u}입니다.`],
      misconceptionTip: '두 수를 모두 버리거나 모두 올리면 어림한 값이 실제와 많이 달라질 수 있습니다. 각각 가까운 쪽으로 어림하세요.',
    };
  },
};

const 어림판단문항: G5Family = {
  id: 'est-check',
  make: (seed) => {
    const next = rand(seed + 53);
    const 꼴들: Kind[] = ['h1', 'h2', 'd1', 'd2', 'nt'];
    const pairs: Array<{ p: Pair; kind: Kind }> = [];
    for (let k = 0; k < 20 && pairs.length < 4; k += 1) {
      const kind = 꼴들[next(꼴들.length)];
      const p = pairFor(kind, seed * 5 + k * 97);
      if (p && !pairs.some((one) => one.p.a === p.a && one.p.b === p.b)) pairs.push({ p, kind });
    }
    if (pairs.length < 4) return null;
    const 틀린자리 = next(4);
    const 틀린 = pairs[틀린자리];
    const ms = 실수들(틀린.kind, 틀린.p).filter((m) => {
      // 어림한 값과 크게 달라 어림셈으로 알아챌 수 있는 실수만 씁니다.
      const r = 틀린.p.a * 틀린.p.b;
      return Math.abs(m.value - r) / r >= 0.3;
    });
    if (!ms.length) return null;
    const 틀린값 = pick(ms, seed).value;
    const 줄 = pairs.map((one, k) => `${기호[k]} ${식(one.p)}=${k === 틀린자리 ? 틀린값 : one.p.a * one.p.b}`);
    return {
      prompt: `어림셈으로 확인했을 때 계산 결과가 잘못된 것은 어느 것일까요? (${줄.join(', ')})`,
      answer: 기호[틀린자리],
      wrongs: 기호.filter((_, k) => k !== 틀린자리),
      tag: 'estimate',
      concept: '계산한 값을 어림한 값과 견주면 계산이 바른지 확인할 수 있습니다. 둘이 크게 다르면 다시 계산합니다.',
      strategy: '어림셈으로 계산 결과 확인하기',
      hint: '각 식의 두 수를 가까운 몇십이나 몇백으로 어림해 얼마쯤 나와야 하는지 먼저 생각해 보세요.',
      steps: [`${기호[틀린자리]} ${식(틀린.p)}은(는) 바르게 계산하면 ${틀린.p.a * 틀린.p.b}입니다.`, `${틀린값}은(는) 이 값과 크게 다르므로 잘못 계산한 것입니다.`, `나머지 식은 계산 결과가 맞습니다.`],
      misconceptionTip: '0을 빠뜨리거나 자리를 잘못 맞추면 계산 결과가 어림한 값과 크게 달라집니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
const 차시꼴: Record<number, Kind[]> = { 2: ['h0'], 3: ['h1'], 4: ['h2'], 5: ['tt', 'nt'], 6: ['od'], 7: ['d1'], 8: ['d2'] };

export const unit1Lesson32 = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [도입문항];
  if (lessonNo === 9) {
    if (하) return [어림식문항, 어림값문항];
    if (상) return [어림판단문항, 어림값문항, 어림식문항];
    return [어림값문항, 어림식문항, 어림판단문항];
  }
  const kinds = 차시꼴[lessonNo];
  if (!kinds) return null;
  const 공통 = kinds.flatMap((kind): G5Family[] => {
    if (하) return [계산문항(kind), 가르기문항(kind), 문장제문항(kind, 0)];
    if (상) return [고치기문항(kind), 까닭문항(kind), 비교문항(kind), 문장제문항(kind, 1)];
    return [계산문항(kind), 부분곱문항(kind), 문장제문항(kind, 0), 고치기문항(kind)];
  });
  if (lessonNo === 5) return 하 ? [...공통, 부분곱문항('nt')] : [...공통, 열배문항];
  if (lessonNo === 6 && !하) return [...공통, 바꾸어곱하기문항];
  return 공통;
};

export { kindOk };
