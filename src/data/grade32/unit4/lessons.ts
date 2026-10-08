import type { Difficulty } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { gwa, pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-2 4단원 분수 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입
//   2 분수로 어떻게 나타낼까요(이산량: 12를 3씩 묶으면 9는 12의 3/4)
//   3 전체 개수의 분수만큼은 얼마일까요(8의 1/4=2, 16의 3/4=12)
//   4 전체 길이의 분수만큼은 얼마일까요(15 cm의 2/5=6 cm)
//   5 진분수와 가분수는 무엇일까요
//   6 대분수는 무엇일까요(2와 1/5=11/5, 8/3=2와 2/3)
//   7 분모가 같은 분수의 크기 비교(가분수끼리, 대분수끼리, 가분수와 대분수)
//
// 지도서가 못박은 것:
//   · 이산량에서는 묶음의 수로 분수를 나타냅니다. '12를 3씩 묶으면 9는
//     12의 얼마'에서 9/12는 틀린 답은 아니지만 묶음을 생각하지 않은
//     답이라고 했습니다. 그래서 값이 같은 분수(9/12)를 틀린 보기로 두지
//     않습니다(보기를 만들 때 값이 같은 것은 걸러집니다).
//   · '크기가 같은 분수', '약분'이라는 말은 쓰지 않습니다(5학년).
//   · 'N의 1/4'을 구할 때 4묶음으로 나누지 않고 4씩 묶는 오류를 짚습니다.
//   · 분자가 분모와 같은 분수(4/4)는 진분수가 아니라 가분수이고, 자연수
//     1과 같습니다.
//   · 대분수↔가분수는 단위분수가 몇 개인지로 설명합니다(형식 암기 금지).
// 글은 조사를 '을(를)'처럼 적고, 문항을 만들 때 앞말에 맞춥니다.
// ════════════════════════════════════════════════════════════════════

const 분수 = (n: number, d: number) => `${n}/${d}`;
/** 대분수 글: 2와 1/5 (자연수 뒤 '과/와'는 자연수의 받침에 맞춥니다) */
const 대분수 = (w: number, n: number, d: number) => `${gwa(String(w))} ${n}/${d}`;
const 대분수읽기 = (w: number, n: number, d: number) => `${gwa(String(w))} ${d}분의 ${n}`;

// ── 1차시: 단원 도입(3학년 1학기 분수 떠올리기) ───────────────────────
const 도입문항: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = rand(seed);
    const n = 3 + next(6);
    const k = 1 + next(n - 1);
    if (next(2) === 0) {
      return {
        prompt: '색칠한 부분은 전체의 얼마일까요?',
        answer: 분수(k, n),
        wrongs: [분수(n - k, n), k > 1 ? 분수(n, k) : 분수(1, n + 1), 분수(k, n + 1), n - k > 1 ? 분수(k, n - k) : 분수(k + 1, n)],
        tag: 'fraction',
        concept: '전체를 똑같이 ■로 나눈 것 중의 ▲는 ▲/■입니다(3학년 1학기).',
        strategy: '전체 조각 수와 색칠한 조각 수 세기',
        hint: '먼저 전체가 똑같이 몇 조각인지 세고, 그다음 색칠한 조각을 세어 보세요.',
        steps: [`전체는 똑같이 ${n}조각, 색칠한 조각은 ${k}개입니다.`, `그러므로 ${분수(k, n)}입니다.`],
        misconceptionTip: '분모에는 전체 조각 수, 분자에는 색칠한 조각 수를 씁니다.',
        visual: { kind: 'partition', label: '똑같이 나누어 일부를 색칠한 띠', figures: [{ shape: 'bar', parts: n, shaded: Array.from({ length: k }, (_, at) => at) }] },
      };
    }
    const a = 2 + next(8);
    let b = 2 + next(8);
    if (a === b) b = a === 9 ? 2 : a + 1;
    const 큰 = a < b ? a : b;
    return {
      prompt: `${분수(1, a)}과(와) ${분수(1, b)} 중에서 더 큰 분수는 어느 것일까요?`,
      answer: 분수(1, 큰),
      wrongs: [분수(1, a + b - 큰), '두 분수의 크기가 같습니다.', '비교할 수 없습니다.'],
      tag: 'fraction',
      concept: '단위분수는 분모가 작을수록 더 큽니다(3학년 1학기).',
      strategy: '단위분수의 크기 비교',
      hint: '같은 크기의 종이를 더 적게 나눈 한 조각이 더 큽니다.',
      steps: [`똑같이 ${큰}조각으로 나눈 한 조각이 ${a + b - 큰}조각으로 나눈 한 조각보다 큽니다.`, `그러므로 ${분수(1, 큰)}이(가) 더 큽니다.`],
      misconceptionTip: '분모가 크다고 큰 분수가 아닙니다.',
    };
  },
};

// ── 2차시: 분수로 나타내기(이산량) ─────────────────────────────────
const 묶음분수문항: G5Family = {
  id: 'group-fraction',
  make: (seed) => {
    const next = rand(seed + 1);
    const g = 2 + next(4);
    const 묶음 = 3 + next(4);
    const N = g * 묶음;
    const 부분 = 1 + next(묶음 - 1);
    const p = g * 부분;
    const 물건 = pick(['사탕', '바둑돌', '구슬', '딸기'], seed);
    return {
      prompt: `${물건} ${N}개를 ${g}개씩 묶었습니다. ${물건} ${p}개는 전체 ${N}개의 얼마인지 분수로 나타내면 얼마일까요?`,
      answer: 분수(부분, 묶음),
      wrongs: [부분 > 1 ? 분수(묶음, 부분) : 분수(1, N), 분수(부분, N), 분수(묶음 - 부분, 묶음), 분수(g, N), 분수(부분, 묶음 + 1)],
      tag: 'fraction',
      concept: '물건을 같은 수씩 묶으면, 전체 묶음 수를 분모로, 부분 묶음 수를 분자로 하여 분수로 나타낼 수 있습니다.',
      strategy: '묶음의 수로 분수 나타내기',
      hint: `${N}개를 ${g}개씩 묶으면 모두 몇 묶음인지, ${p}개는 그중 몇 묶음인지 세어 보세요.`,
      steps: [`${N}개를 ${g}개씩 묶으면 ${묶음}묶음입니다.`, `${p}개는 ${묶음}묶음 중의 ${부분}묶음입니다.`, `그러므로 ${p}개는 ${N}개의 ${분수(부분, 묶음)}입니다.`],
      misconceptionTip: '분모는 물건의 수가 아니라 전체 묶음의 수입니다.',
      visual: { kind: 'grouped', label: `${N}개를 ${g}개씩 묶은 그림`, groups: 묶음, perGroup: g, shadedGroups: 부분 },
    };
  },
};

const 똑같이묶음문항: G5Family = {
  id: 'equal-groups',
  make: (seed) => {
    const next = rand(seed + 2);
    const k = 2 + next(4);
    const g = 2 + next(4);
    const N = k * g;
    const 부분 = 1 + next(k - 1);
    const 물건 = pick(['종이꽃', '쿠키', '연필', '공'], seed);
    const 단위 = 물건 === '종이꽃' ? '송이' : 물건 === '연필' ? '자루' : '개';
    return {
      prompt: `${물건} ${N}${단위}를 똑같이 ${k}묶음으로 나누었습니다. ${부분}묶음은 전체의 얼마일까요?`,
      answer: 분수(부분, k),
      wrongs: [분수(부분, N), 부분 > 1 ? 분수(k, 부분) : 분수(1, N), 분수(k - 부분, k), 분수(부분, g === k ? k + 1 : g)],
      tag: 'fraction',
      concept: '전체를 똑같이 몇 묶음으로 나누었는지가 분모, 그중 몇 묶음인지가 분자입니다.',
      strategy: '묶음 수로 분수 나타내기',
      hint: `전체는 똑같이 몇 묶음인가요? 그중 몇 묶음을 묻나요?`,
      steps: [`${N}${단위}를 똑같이 ${k}묶음으로 나누었습니다.`, `${부분}묶음은 ${k}묶음 중의 ${부분}묶음이므로 전체의 ${분수(부분, k)}입니다.`],
      misconceptionTip: '한 묶음에 든 물건의 수를 분모로 쓰면 안 됩니다. 묶음의 수가 분모입니다.',
      visual: { kind: 'grouped', label: `${N}${단위}를 똑같이 ${k}묶음으로 나눈 그림`, groups: k, perGroup: g, shadedGroups: 부분 },
    };
  },
};

// ── 3, 4차시: 전체의 분수만큼 ───────────────────────────────────────
const 분수만큼수 = (N: number, a: number, b: number) => (N / b) * a;

const 개수만큼문항 = (그림: boolean): G5Family => ({
  id: `of-count-${그림 ? 'pic' : 'word'}`,
  make: (seed) => {
    const next = rand(seed + 3);
    const b = 2 + next(5);
    const 한묶음 = 2 + next(4);
    const N = b * 한묶음;
    const a = 1 + next(b - 1);
    const v = 분수만큼수(N, a, b);
    const 장면 = pick([
      { p: `${N}의 ${분수(a, b)}은(는) 얼마일까요?`, u: '' },
      { p: `붕어빵 ${N}개의 ${분수(a, b)}만큼은 팥붕어빵입니다. 팥붕어빵은 몇 개일까요?`, u: '개' },
      { p: `비타민사탕 ${N}개의 ${분수(a, b)}만큼을 먹었습니다. 먹은 사탕은 몇 개일까요?`, u: '개' },
    ], seed);
    return {
      prompt: 장면.p,
      answer: `${v}${장면.u}`,
      wrongs: [N / b, a * b, N - v, v + N / b, N].filter((w) => w !== v && w > 0).map((w) => `${w}${장면.u}`),
      tag: 'fraction',
      concept: `${N}의 ${분수(a, b)}은(는) ${N}을(를) 똑같이 ${b}묶음으로 나눈 것 중의 ${a}묶음입니다.`,
      strategy: '단위분수만큼을 먼저 구하기',
      hint: `${N}을(를) 똑같이 ${b}묶음으로 나누면 한 묶음은 몇인가요? 그런 묶음 ${a}개는 얼마일까요?`,
      steps: [`${N}을(를) 똑같이 ${b}묶음으로 나누면 1묶음은 ${N}÷${b}=${N / b}입니다.`, a === 1 ? `그러므로 ${N}의 ${분수(1, b)}은(는) ${v}입니다.` : `${a}묶음은 ${N / b}×${a}=${v}이므로 ${N}의 ${분수(a, b)}은(는) ${v}입니다.`],
      misconceptionTip: `${b}묶음으로 나누어야 하는데 ${b}씩 묶으면 안 됩니다. 분모는 똑같이 나눈 묶음의 수입니다.`,
      ...(그림 ? { visual: { kind: 'grouped' as const, label: `${N}개를 똑같이 ${b}묶음으로 나눈 그림`, groups: b, perGroup: 한묶음, shadedGroups: a } } : {}),
    };
  },
});

const 길이만큼문항: G5Family = {
  id: 'of-length',
  make: (seed) => {
    const next = rand(seed + 4);
    const b = 2 + next(7);
    const 한부분 = 1 + next(5);
    const L = b * 한부분;
    const a = 1 + next(b - 1);
    const v = 분수만큼수(L, a, b);
    const 단위 = pick(['cm', 'm'], seed);
    const 장면 = pick([
      `${L} ${단위}의 ${분수(a, b)}은(는) 몇 ${단위}일까요?`,
      `길이가 ${L} ${단위}인 끈의 ${분수(a, b)}만큼을 사용했습니다. 사용한 끈은 몇 ${단위}일까요?`,
      `철사 ${L} ${단위}의 ${분수(a, b)}만큼을 잘랐습니다. 자른 철사는 몇 ${단위}일까요?`,
    ], seed + 1);
    return {
      prompt: 장면,
      answer: `${v} ${단위}`,
      wrongs: [L / b, a * b, L - v, v + L / b, L].filter((w) => w !== v && w > 0).map((w) => `${w} ${단위}`),
      tag: 'fraction',
      concept: `${L} ${단위}의 ${분수(a, b)}은(는) ${L} ${단위}를 똑같이 ${b}부분으로 나눈 것 중의 ${a}부분입니다.`,
      strategy: '전체 길이를 똑같이 나누어 분수만큼 구하기',
      hint: `${L} ${단위}를 똑같이 ${b}부분으로 나누면 1부분은 몇 ${단위}인가요?`,
      steps: [`${L} ${단위}를 똑같이 ${b}부분으로 나누면 1부분은 ${L}÷${b}=${L / b}(${단위})입니다.`, a === 1 ? `그러므로 ${v} ${단위}입니다.` : `${a}부분은 ${L / b}×${a}=${v}(${단위})입니다.`],
      misconceptionTip: '분모만큼 똑같이 나누고 분자만큼 셉니다. 분자와 분모를 곱하면 안 됩니다.',
      visual: { kind: 'fraction-model', shape: 'part', label: `${L} ${단위}를 똑같이 ${b}부분으로 나누어 ${a}부분을 칠한 띠`, denominator: b, numerator: a, whole: L },
    };
  },
};

const 거꾸로문항: G5Family = {
  id: 'of-reverse',
  make: (seed) => {
    const next = rand(seed + 5);
    const b = 2 + next(6);
    const 한묶음 = 2 + next(5);
    const N = b * 한묶음;
    const a = 2 + next(Math.max(1, b - 2));
    if (a >= b) return null;
    return {
      prompt: `${N}의 ${분수(1, b)}은(는) ${한묶음}입니다. ${N}의 ${분수(a, b)}은(는) 얼마일까요?`,
      answer: String(한묶음 * a),
      wrongs: [한묶음 + a, 한묶음 * b, N - 한묶음 * a, 한묶음 * (a + 1)].filter((w) => w !== 한묶음 * a && w > 0).map(String),
      tag: 'fraction',
      concept: `${분수(a, b)}은(는) ${분수(1, b)}이(가) ${a}개입니다. 그러므로 ${N}의 ${분수(a, b)}은(는) ${N}의 ${분수(1, b)}의 ${a}배입니다.`,
      strategy: '단위분수만큼을 이용하기',
      hint: `${분수(a, b)}은(는) ${분수(1, b)}이(가) 몇 개인가요?`,
      steps: [`${분수(a, b)}은(는) ${분수(1, b)}이(가) ${a}개입니다.`, `${한묶음}×${a}=${한묶음 * a}이므로 ${N}의 ${분수(a, b)}은(는) ${한묶음 * a}입니다.`],
      misconceptionTip: '분자만큼 더하는 것이 아니라 단위분수만큼을 분자의 수만큼 모읍니다.',
    };
  },
};

// ── 5차시: 진분수, 가분수, 자연수 ──────────────────────────────────
const 진가분수문항: G5Family = {
  id: 'proper-improper',
  make: (seed) => {
    const next = rand(seed + 6);
    const d = 3 + next(7);
    const 갈래 = next(3);
    if (갈래 === 0) {
      const 진 = 1 + next(d - 1);
      const 가들 = [d, d + 1 + next(3), d + 4 + next(4)].map((n) => 분수(n, d));
      return {
        prompt: '진분수는 어느 것일까요?',
        answer: 분수(진, d),
        wrongs: 가들,
        tag: 'fraction',
        concept: '분자가 분모보다 작은 분수를 진분수, 분자가 분모와 같거나 분모보다 큰 분수를 가분수라고 합니다.',
        strategy: '분자와 분모의 크기 비교하기',
        hint: '분자가 분모보다 작은 분수를 찾으세요. 분자와 분모가 같으면 진분수가 아닙니다.',
        steps: [`${분수(진, d)}은(는) 분자 ${진}이(가) 분모 ${d}보다 작으므로 진분수입니다.`, `${분수(d, d)}은(는) 분자와 분모가 같으므로 가분수입니다.`],
        misconceptionTip: `${분수(d, d)}처럼 분자와 분모가 같은 분수는 진분수가 아니라 가분수입니다.`,
      };
    }
    if (갈래 === 1) {
      const 가 = pick([d, d + 1 + next(5)], seed);
      const 진들 = [1, Math.floor(d / 2), d - 1].filter((n, k, all) => n > 0 && all.indexOf(n) === k).map((n) => 분수(n, d));
      if (진들.length < 3) 진들.push(분수(1, d + 1));
      return {
        prompt: '가분수는 어느 것일까요?',
        answer: 분수(가, d),
        wrongs: 진들,
        tag: 'fraction',
        concept: '분자가 분모와 같거나 분모보다 큰 분수를 가분수라고 합니다.',
        strategy: '분자와 분모의 크기 비교하기',
        hint: '분자가 분모와 같거나 분모보다 큰 분수를 찾으세요.',
        steps: [`${분수(가, d)}은(는) 분자 ${가}이(가) 분모 ${d}${가 === d ? '와 같으므로' : '보다 크므로'} 가분수입니다.`],
        misconceptionTip: '분자와 분모가 같은 분수도 가분수입니다.',
      };
    }
    return {
      prompt: `분모가 ${d}인 분수 □/${d}이(가) 가분수일 때, □ 안에 들어갈 수 있는 가장 작은 자연수는 얼마일까요?`,
      answer: String(d),
      wrongs: [String(d + 1), String(d - 1), '1'],
      tag: 'fraction',
      concept: '가분수는 분자가 분모와 같거나 분모보다 큰 분수입니다.',
      strategy: '가분수의 뜻 적용하기',
      hint: '분자가 분모와 같은 분수는 진분수인가요, 가분수인가요?',
      steps: [`□/${d}이(가) 가분수이려면 □는 ${d}과(와) 같거나 ${d}보다 커야 합니다.`, `그러므로 가장 작은 수는 ${d}입니다.`],
      misconceptionTip: `분모보다 커야만 가분수인 것이 아닙니다. ${분수(d, d)}도 가분수입니다.`,
    };
  },
};

const 자연수분수문항: G5Family = {
  id: 'whole-fraction',
  make: (seed) => {
    const next = rand(seed + 7);
    const d = 2 + next(8);
    const w = 1 + next(4);
    if (w === 1) {
      return {
        prompt: `자연수 1과 크기가 같은 분수는 어느 것일까요?`,
        answer: 분수(d, d),
        wrongs: [분수(d - 1, d), 분수(d + 1, d), 분수(1, d)].filter((w2) => w2 !== 분수(0, d)),
        tag: 'fraction',
        concept: '분자와 분모가 같은 분수는 자연수 1과 같습니다. 1, 2, 3과 같은 수를 자연수라고 합니다.',
        strategy: '분자와 분모가 같은 분수 알기',
        hint: `${분수(1, d)}이(가) 몇 개이면 1이 되나요?`,
        steps: [`${분수(1, d)}이(가) ${d}개이면 1입니다.`, `그러므로 ${분수(d, d)}=1입니다.`],
        misconceptionTip: '분자가 1인 분수가 1인 것이 아닙니다.',
      };
    }
    return {
      prompt: `자연수 ${w}을(를) 분모가 ${d}인 가분수로 나타내면 얼마일까요?`,
      answer: 분수(w * d, d),
      wrongs: [분수(w, d), 분수(w + d, d), 분수(w * d + 1, d), 분수(d, w)].filter((x) => x !== 분수(w * d, d)),
      tag: 'fraction',
      concept: `1은 ${분수(d, d)}이므로 ${w}은(는) ${분수(1, d)}이(가) ${w * d}개입니다.`,
      strategy: '자연수를 단위분수의 개수로 나타내기',
      hint: `1은 ${분수(1, d)}이(가) 몇 개인가요? ${w}은(는) 몇 개일까요?`,
      steps: [`1=${분수(d, d)}이므로 1은 ${분수(1, d)}이(가) ${d}개입니다.`, `${w}은(는) ${분수(1, d)}이(가) ${d}×${w}=${w * d}개이므로 ${분수(w * d, d)}입니다.`],
      misconceptionTip: '자연수를 분자에 그대로 쓰면 안 됩니다.',
    };
  },
};

// ── 6차시: 대분수 ───────────────────────────────────────────────────
const 대분수만들기 = (seed: number) => {
  const next = rand(seed);
  const d = 2 + next(8);
  const w = 1 + next(4);
  const n = 1 + next(d - 1);
  return { d, w, n, 가: w * d + n };
};

const 대분수가분수문항: G5Family = {
  id: 'mixed-to-improper',
  make: (seed) => {
    const { d, w, n, 가 } = 대분수만들기(seed + 8);
    return {
      prompt: `${대분수(w, n, d)}을(를) 가분수로 나타내면 얼마일까요?`,
      answer: 분수(가, d),
      wrongs: [분수(w + n, d), 분수(Number(`${w}${n}`), d), 분수(w * n + d, d), 분수(가 - 1, d), 분수(가 + d, d)],
      tag: 'fraction',
      concept: `${대분수(w, n, d)}은(는) 자연수 ${w}과(와) 진분수 ${분수(n, d)}을(를) 합한 것입니다. ${w}은(는) ${분수(1, d)}이(가) ${w * d}개입니다.`,
      strategy: '단위분수의 개수로 대분수를 가분수로 나타내기',
      hint: `1은 ${분수(1, d)}이(가) ${d}개입니다. ${w}은(는) ${분수(1, d)}이(가) 몇 개인지 먼저 세어 보세요.`,
      steps: [`${w}은(는) ${분수(1, d)}이(가) ${w * d}개, ${분수(n, d)}은(는) ${분수(1, d)}이(가) ${n}개입니다.`, `${분수(1, d)}이(가) 모두 ${w * d}+${n}=${가}개이므로 ${분수(가, d)}입니다.`],
      misconceptionTip: '자연수를 분자에 그대로 더하면 안 됩니다. 자연수를 먼저 분모가 같은 분수로 바꿉니다.',
    };
  },
};

const 가분수대분수문항: G5Family = {
  id: 'improper-to-mixed',
  make: (seed) => {
    const { d, w, n, 가 } = 대분수만들기(seed + 9);
    const 후보 = [
      n + 1 < d ? 대분수(w, n + 1, d) : 대분수(w, n - 1 || 1, d),
      대분수(w + 1, n, d),
      w > 1 ? 대분수(w - 1, n, d) : 대분수(w + 2, n, d),
      n < d && w < d ? 대분수(n, w, d) : 대분수(w, d - n === n ? n : d - n, d),
    ];
    return {
      prompt: `${분수(가, d)}을(를) 대분수로 나타내면 얼마일까요?`,
      answer: 대분수(w, n, d),
      wrongs: 후보,
      tag: 'fraction',
      concept: `${분수(d, d)}=1이므로 ${분수(가, d)}에서 ${분수(d, d)}씩 묶으면 자연수가 됩니다. 남은 것은 진분수로 씁니다.`,
      strategy: '분모만큼씩 묶어 자연수 만들기',
      hint: `${분수(가, d)}은(는) ${분수(1, d)}이(가) ${가}개입니다. ${d}개씩 묶으면 몇 묶음이고 몇 개가 남나요?`,
      steps: [`${분수(1, d)}이(가) ${가}개를 ${d}개씩 묶으면 ${w}묶음이고 ${n}개가 남습니다.`, `${w}묶음은 자연수 ${w}, 남은 ${n}개는 ${분수(n, d)}이므로 ${대분수(w, n, d)}입니다.`],
      misconceptionTip: '대분수의 분수 부분은 진분수여야 합니다. 분자가 분모보다 크면 한 번 더 묶으세요.',
    };
  },
};

const 대분수뜻문항: G5Family = {
  id: 'mixed-meaning',
  make: (seed) => {
    const { d, w, n } = 대분수만들기(seed + 10);
    if (seed % 2 === 0) {
      return {
        prompt: `${대분수(w, n, d)}을(를) 바르게 읽은 것은 어느 것일까요?`,
        answer: 대분수읽기(w, n, d),
        wrongs: [`${gwa(String(w))} ${n}분의 ${d}`, `${d}분의 ${w}${n}`, `${w}분의 ${gwa(String(n))} ${d}`],
        tag: 'fraction',
        concept: '자연수와 진분수로 이루어진 분수를 대분수라고 합니다. 1과 3/4은 1과 4분의 3이라고 읽습니다.',
        strategy: '대분수 읽기',
        hint: '자연수를 먼저 읽고 ‘과(와)’를 붙인 다음, 진분수를 분모부터 읽으세요.',
        steps: [`자연수 ${w}을(를) 먼저 읽고, 진분수 ${분수(n, d)}은(는) ${d}분의 ${n}(이)라고 읽습니다.`, `그러므로 ${대분수읽기(w, n, d)}(이)라고 읽습니다.`],
        misconceptionTip: '진분수 부분은 3학년 1학기에 배운 대로 분모부터 읽습니다.',
      };
    }
    return {
      prompt: '대분수는 어느 것일까요?',
      answer: 대분수(w, n, d),
      wrongs: [분수(n, d), 분수(w * d + n, d), 분수(d, d)],
      tag: 'fraction',
      concept: '자연수와 진분수로 이루어진 분수를 대분수라고 합니다.',
      strategy: '대분수의 뜻 알기',
      hint: '자연수와 진분수가 함께 있는 분수를 찾으세요.',
      steps: [`${대분수(w, n, d)}은(는) 자연수 ${w}과(와) 진분수 ${분수(n, d)}(으)로 이루어져 있으므로 대분수입니다.`, `${분수(w * d + n, d)}은(는) 크기는 같지만 가분수입니다.`],
      misconceptionTip: '1보다 큰 분수가 모두 대분수인 것은 아닙니다. 자연수와 진분수로 이루어져야 대분수입니다.',
      sameValueOk: true,
    };
  },
};

// ── 7차시: 분모가 같은 분수의 크기 비교 ─────────────────────────────
type 수 = { 글: string; 분자합: number; d: number };
const 가분수수 = (n: number, d: number): 수 => ({ 글: 분수(n, d), 분자합: n, d });
const 대분수수 = (w: number, n: number, d: number): 수 => ({ 글: 대분수(w, n, d), 분자합: w * d + n, d });

const 크기비교문항 = (꼴: 'improper' | 'mixed' | 'both'): G5Family => ({
  id: `compare-${꼴}`,
  make: (seed) => {
    const next = rand(seed + 11);
    const d = 3 + next(7);
    let x: 수;
    let y: 수;
    if (꼴 === 'improper') {
      const a = d + 1 + next(2 * d);
      let b = d + 1 + next(2 * d);
      if (a === b) b += 1;
      x = 가분수수(a, d);
      y = 가분수수(b, d);
    } else if (꼴 === 'mixed') {
      const w1 = 1 + next(4);
      const w2 = next(2) === 0 ? w1 : 1 + next(4);
      const n1 = 1 + next(d - 1);
      let n2 = 1 + next(d - 1);
      if (w1 === w2 && n1 === n2) n2 = n1 === d - 1 ? n1 - 1 : n1 + 1;
      if (n2 < 1) return null;
      x = 대분수수(w1, n1, d);
      y = 대분수수(w2, n2, d);
    } else {
      const w = 1 + next(3);
      const n = 1 + next(d - 1);
      const 같게 = next(4) === 0;
      const 가 = 같게 ? w * d + n : w * d + n + (next(2) === 0 ? 1 : -1) * (1 + next(2));
      if (가 <= d || 가 % d === 0) return null;
      x = next(2) === 0 ? 가분수수(가, d) : 대분수수(w, n, d);
      y = x.글.includes('와') || x.글.includes('과') ? 가분수수(가, d) : 대분수수(w, n, d);
    }
    const 기호 = x.분자합 > y.분자합 ? '>' : x.분자합 < y.분자합 ? '<' : '=';
    const 답 = `${x.글} ${기호} ${y.글}`;
    return {
      prompt: `${x.글}과(와) ${y.글}의 크기를 바르게 비교한 것은 어느 것일까요?`,
      answer: 답,
      wrongs: ['>', '<', '='].filter((s) => s !== 기호).map((s) => `${x.글} ${s} ${y.글}`).concat(['분모가 같아도 비교할 수 없습니다.']),
      sameValueOk: true,
      tag: 'fraction',
      concept: '분모가 같은 가분수는 분자가 클수록 큽니다. 대분수는 자연수를 먼저 비교하고, 같으면 분자를 비교합니다. 가분수와 대분수는 한 가지로 바꾸어 비교합니다.',
      strategy: 꼴 === 'both' ? '가분수나 대분수 한 가지로 바꾸어 비교하기' : 꼴 === 'mixed' ? '자연수부터 비교하기' : '분자 비교하기',
      hint: 꼴 === 'both' ? '대분수를 가분수로 바꾸거나, 가분수를 대분수로 바꾸어 같은 꼴로 만들어 보세요.' : 꼴 === 'mixed' ? '먼저 자연수 부분을 비교하세요. 같으면 분자를 비교합니다.' : '분모가 같으므로 분자를 비교하세요.',
      steps: [
        `두 분수를 가분수로 나타내면 ${분수(x.분자합, d)}, ${분수(y.분자합, d)}입니다.`,
        `분모가 같으므로 분자 ${x.분자합}과(와) ${y.분자합}을(를) 비교하면 ${x.분자합} ${기호} ${y.분자합}입니다.`,
        `그러므로 ${답}입니다.`,
      ],
      misconceptionTip: 꼴 === 'mixed' ? '분자가 크다고 큰 대분수가 아닙니다. 자연수 부분이 먼저입니다.' : '대분수의 자연수 부분을 빠뜨리고 분자만 비교하면 안 됩니다.',
    };
  },
});

const 가장큰분수문항: G5Family = {
  id: 'largest',
  make: (seed) => {
    const next = rand(seed + 12);
    const d = 3 + next(6);
    const 값들 = new Set<number>();
    while (값들.size < 4) {
      const v = d + 1 + next(3 * d);
      if (v % d !== 0) 값들.add(v);
    }
    const 목록 = [...값들].map((v, k) => (k % 2 === 0 ? 가분수수(v, d) : 대분수수(Math.floor(v / d), v % d, d)));
    const 큰 = next(2) === 0;
    const best = 목록.reduce((p, c) => ((큰 ? c.분자합 > p.분자합 : c.분자합 < p.분자합) ? c : p));
    return {
      prompt: `가장 ${큰 ? '큰' : '작은'} 분수는 어느 것일까요? (${목록.map((one) => one.글).join(', ')})`,
      answer: best.글,
      wrongs: 목록.filter((one) => one !== best).map((one) => one.글),
      tag: 'fraction',
      concept: '분모가 같은 분수는 모두 가분수(또는 대분수)로 바꾸면 쉽게 비교할 수 있습니다.',
      strategy: '같은 꼴로 바꾸어 여러 분수 비교하기',
      hint: '대분수를 모두 가분수로 바꾸어 분자를 비교해 보세요.',
      steps: [목록.map((one) => `${one.글}=${분수(one.분자합, d)}`).join(', '), `분자가 가장 ${큰 ? '큰' : '작은'} 것은 ${분수(best.분자합, d)}이므로 ${best.글}입니다.`],
      misconceptionTip: '대분수와 가분수가 섞여 있으면 겉모양만 보고 비교하면 틀리기 쉽습니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
export const unit4Lesson32 = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [도입문항];
  if (lessonNo === 2) return 하 ? [묶음분수문항, 똑같이묶음문항] : [묶음분수문항, 똑같이묶음문항];
  if (lessonNo === 3) {
    if (하) return [개수만큼문항(true), 개수만큼문항(false)];
    if (상) return [개수만큼문항(false), 거꾸로문항];
    return [개수만큼문항(false), 개수만큼문항(true), 거꾸로문항];
  }
  if (lessonNo === 4) return 상 ? [길이만큼문항, 거꾸로문항] : [길이만큼문항];
  if (lessonNo === 5) return [진가분수문항, 자연수분수문항];
  if (lessonNo === 6) {
    if (하) return [대분수가분수문항, 가분수대분수문항, 대분수뜻문항];
    return [대분수가분수문항, 가분수대분수문항, 대분수뜻문항, 자연수분수문항];
  }
  if (lessonNo === 7) {
    if (하) return [크기비교문항('improper'), 크기비교문항('mixed')];
    if (상) return [크기비교문항('both'), 가장큰분수문항, 크기비교문항('mixed')];
    return [크기비교문항('improper'), 크기비교문항('mixed'), 크기비교문항('both'), 가장큰분수문항];
  }
  return null;
};
