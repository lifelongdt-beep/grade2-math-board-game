import type { AngleVisual, Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 다각형각합, 사각형조건각, 삼각자각, 삼각형조건각, 시계각도, 시계각비교, 어림정확 } from './thinking';
import { 네각사각형, 삼각형 } from '../grade42/geom';

// ════════════════════════════════════════════════════════════════════
// 4-1 2단원 각도
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 각의 크기 비교 / 각의 크기 재기(1°, 각도기)
// / 예각과 둔각 / 각도 어림하고 재기 / 각도의 합과 차 / 삼각형 세 각의 합
// / 사각형 네 각의 합
//
// 지도서가 못박은 것:
//   · 각과 각도를 섞어 쓰지 않습니다. '각이 크다'가 아니라 '각의 크기가
//     크다'처럼, 각도는 크기를 나타내는 수입니다.
//   · 예각: 0°보다 크고 직각보다 작은 각. 둔각: 직각보다 크고 180°보다
//     작은 각. 직각과 180°는 예각도 둔각도 아닙니다.
//   · 각도 어림은 삼각자의 30°, 45°, 60°, 90°를 기준으로 합니다.
//   · 삼각형 세 각의 합 180°, 사각형 네 각의 합 360°.
//
// 화면에서 각도기를 대어 잴 수는 없으므로 '재기'는 눈금 읽기를 말로
// 묻고, 그림은 어림과 비교에만 씁니다. 그림의 각은 적힌 각도 그대로
// 그립니다.
// ════════════════════════════════════════════════════════════════════

const 이름 = ['가', '나', '다', '라'];
const 각그림 = (degs: number[], texts?: string[]): AngleVisual => ({
  kind: 'angle',
  label: '각',
  items: degs.map((deg, k) => ({ deg, name: degs.length > 1 ? 이름[k] : undefined, ...(texts?.[k] ? { text: texts[k] } : {}) })),
});

const 서로다른각 = (next: (b: number) => number, count: number, gap: number, lo = 20, hi = 160) => {
  const out: number[] = [];
  let guard = 0;
  while (out.length < count && guard < 200) {
    guard += 1;
    const d = 사이(next, lo / 5, hi / 5) * 5;
    if (out.every((x) => Math.abs(x - d) >= gap)) out.push(d);
  }
  return out.length === count ? out : null;
};

// ── 도입·비교 ───────────────────────────────────────────────────────
const 가장큰각 = (gap: number): G5Family => ({
  id: `biggest-${gap}`,
  make: (seed) => {
    const next = 고르개(seed);
    const degs = 서로다른각(next, 3, gap);
    if (!degs) return null;
    const bigger = next(2) === 0;
    const target = bigger ? Math.max(...degs) : Math.min(...degs);
    const ans = 이름[degs.indexOf(target)];
    return {
      prompt: `각의 크기가 가장 ${bigger ? '큰' : '작은'} 것은 어느 것일까요?`,
      answer: ans,
      wrongs: [...이름.slice(0, 3).filter((x) => x !== ans), '모두 같습니다'],
      tag: 'angle',
      strategy: '각의 크기 비교',
      hint: '두 변이 벌어진 정도를 견주어 보세요. 변의 길이는 상관없어요.',
      steps: [`세 각을 견주면 ${이름[degs.indexOf(target)]}의 두 변이 가장 ${bigger ? '많이' : '적게'} 벌어져 있습니다.`, `그러므로 ${ans}입니다.`],
      misconceptionTip: '변이 길다고 각의 크기가 큰 것이 아니에요.',
      visual: 각그림(degs),
    };
  },
});

// ── 1°와 각도기 ─────────────────────────────────────────────────────
const 일도: G5Family = {
  id: 'one-degree',
  make: (seed) => {
    const which = seed % 3;
    const qs = [
      { p: '직각을 똑같이 90으로 나눈 것 중의 하나를 무엇이라고 할까요?', a: '1도', w: ['1직각', '90도', '10도'], s: '직각을 똑같이 90으로 나눈 하나를 1도라 하고 1°라고 씁니다.' },
      { p: '직각은 몇 도일까요?', a: '90°', w: ['180°', '100°', '45°'], s: '직각은 1°가 90개이므로 90°입니다.' },
      { p: '각도기로 각도를 잴 때 각도기의 중심을 어디에 맞출까요?', a: '각의 꼭짓점', w: ['각의 한 변의 끝', '두 변의 가운데', '아무 곳이나'], s: '각도기의 중심을 각의 꼭짓점에, 밑금을 각의 한 변에 맞춥니다.' },
    ][which];
    return { prompt: qs.p, answer: qs.a, wrongs: qs.w, tag: 'angle', strategy: '각도의 단위와 각도기', hint: '각도기의 생김새와 1°의 뜻을 떠올려 보세요.', steps: [qs.s] };
  },
};

const 눈금읽기: G5Family = {
  id: 'protractor-read',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 34) * 5;
    if (d === 90) return null;
    const 안쪽 = next(2) === 0;
    // 한 변이 지나는 쪽의 눈금 0에서부터 읽어야 합니다. 반대쪽 눈금을 읽으면 180에서 뺀 값이 나옵니다.
    return {
      prompt: '각도기로 잰 각도는 몇 도일까요?',
      answer: `${d}°`,
      wrongs: [`${180 - d}°`, `${d + 10}°`, `${d - 5}°`].filter((w) => w !== `${d}°`),
      tag: 'angle',
      strategy: '각도기 눈금 바르게 읽기',
      hint: '각의 한 변이 지나는 눈금 0을 먼저 찾고, 그 0에서 시작하는 눈금을 따라 읽어요.',
      steps: [`한 변이 ${안쪽 ? '안쪽(파란)' : '바깥쪽'} 눈금 0을 지나므로 ${안쪽 ? '안쪽' : '바깥쪽'} 눈금을 읽습니다.`, `다른 변이 지나는 ${안쪽 ? '안쪽' : '바깥쪽'} 눈금은 ${d}이므로 ${d}°입니다.`],
      misconceptionTip: '안쪽 눈금과 바깥쪽 눈금을 섞어 읽으면 180°에서 뺀 값이 나와요.',
      visual: { kind: 'protractor', label: '각도기로 각도 재기', deg: d, base: 안쪽 ? 'inner' : 'outer' },
    };
  },
};

// ── 예각과 둔각 ─────────────────────────────────────────────────────
const 예둔고르기 = (want: '예각' | '둔각'): G5Family => ({
  id: `pick-${want}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 답 = want === '예각' ? 사이(next, 2, 17) * 5 : 사이(next, 19, 35) * 5;
    const 틀린 = want === '예각' ? [90, 사이(next, 19, 35) * 5, 180] : [90, 사이(next, 2, 17) * 5, 180];
    return {
      prompt: `다음 중 ${want}은 어느 것일까요?`,
      answer: `${답}°`,
      wrongs: 틀린.map((x) => `${x}°`),
      tag: 'angle',
      strategy: '예각과 둔각 구별',
      hint: '직각(90°)보다 작은지 큰지 보세요. 180°는 각이 펴진 것이에요.',
      steps: [want === '예각' ? '0°보다 크고 직각보다 작은 각이 예각입니다.' : '직각보다 크고 180°보다 작은 각이 둔각입니다.', `그러므로 ${답}°입니다.`],
      misconceptionTip: '90°는 직각이라 예각도 둔각도 아니에요.',
    };
  },
});

const 그림분류: G5Family = {
  id: 'classify-pic',
  make: (seed) => {
    const next = 고르개(seed);
    const d = [사이(next, 3, 16) * 5, 90, 사이(next, 20, 34) * 5][next(3)];
    const 종류 = d < 90 ? '예각' : d === 90 ? '직각' : '둔각';
    return {
      prompt: '그림의 각은 예각, 직각, 둔각 가운데 무엇일까요?',
      answer: 종류,
      wrongs: ['예각', '직각', '둔각', '알 수 없습니다'].filter((x) => x !== 종류).slice(0, 3),
      tag: 'angle',
      strategy: '그림의 각 분류',
      hint: '직각과 견주어 보세요. 직각 표시가 있으면 직각이에요.',
      steps: [`그림의 각은 ${d}°입니다.`, `그러므로 ${종류}입니다.`],
      visual: 각그림([d]),
    };
  },
};

const 시계각: G5Family = {
  id: 'clock-angle',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 11);
    const 각 = Math.min(h, 12 - h) * 30;
    const 종류 = 각 < 90 ? '예각' : 각 === 90 ? '직각' : 각 === 180 ? '180°' : '둔각';
    if (종류 === '180°') return null;
    return {
      prompt: `${h}시 정각일 때 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각은 예각, 직각, 둔각 가운데 무엇일까요?`,
      answer: 종류,
      wrongs: ['예각', '직각', '둔각', '알 수 없습니다'].filter((x) => x !== 종류).slice(0, 3),
      tag: 'angle',
      strategy: '시계에서 예각, 직각, 둔각 찾기',
      hint: '시계에서 숫자 한 칸은 30°예요.',
      steps: [`${h}시에는 두 바늘 사이가 숫자 ${Math.min(h, 12 - h)}칸이므로 ${각}°입니다.`, `그러므로 ${종류}입니다.`],
      visual: { kind: 'clock', label: `${h}시`, hour: h, minute: 0 },
    };
  },
};

// ── 어림 ────────────────────────────────────────────────────────────
const 어림: G5Family = {
  id: 'estimate',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 33) * 5;
    // 보기는 실제 각도에 가장 가까운 것이 하나뿐이게 30° 이상 벌립니다.
    const near = Math.round(d / 30) * 30 || 30;
    const options = [near - 60, near - 30, near, near + 30, near + 60].filter((x) => x > 0 && x < 180);
    if (!options.includes(near) || options.length < 4) return null;
    const 가까운 = options.reduce((m, x) => (Math.abs(x - d) < Math.abs(m - d) ? x : m));
    if (options.filter((x) => Math.abs(x - d) === Math.abs(가까운 - d)).length > 1) return null;
    const wrongs = options.filter((x) => x !== 가까운).slice(0, 3);
    return {
      prompt: '그림의 각도를 어림한 것으로 가장 알맞은 것은 어느 것일까요?',
      answer: `약 ${가까운}°`,
      wrongs: wrongs.map((x) => `약 ${x}°`),
      tag: 'angle',
      strategy: '삼각자의 각으로 각도 어림하기',
      hint: '직각(90°)보다 큰지 작은지 먼저 보고, 30°, 60°와도 견주어 보세요.',
      steps: [`그림의 각은 ${d}°쯤입니다.`, `가장 가까운 것은 약 ${가까운}°입니다.`],
      visual: 각그림([d]),
    };
  },
};

// ── 합과 차 ─────────────────────────────────────────────────────────
const 합차: G5Family = {
  id: 'sum-diff',
  make: (seed) => {
    const next = 고르개(seed);
    const plus = next(2) === 0;
    const a = 사이(next, 7, 34) * 5;
    const b = 사이(next, 3, 18) * 5;
    if (plus && a + b > 360) return null;
    if (!plus && a <= b) return null;
    const v = plus ? a + b : a - b;
    return {
      prompt: `${a}°${plus ? '+' : '-'}${b}°는 몇 도일까요?`,
      answer: `${v}°`,
      wrongs: [plus ? a - b : a + b, v + 10, v - 10].filter((x) => x > 0 && x !== v).map((x) => `${x}°`),
      tag: 'angle',
      strategy: plus ? '각도의 합' : '각도의 차',
      hint: '자연수의 덧셈, 뺄셈처럼 계산하고 °를 붙여요.',
      steps: [`${a}${plus ? '+' : '-'}${b}=${v}이므로 ${v}°입니다.`],
      minusIsOperator: true,
    };
  },
};

const 직선나머지: G5Family = {
  id: 'straight',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 4, 32) * 5;
    return {
      prompt: `한 직선 위에서 두 각이 이웃해 있습니다. 한 각이 ${a}°일 때 다른 각은 몇 도일까요?`,
      answer: `${180 - a}°`,
      wrongs: [90 - a > 0 ? 90 - a : 360 - a, 360 - a, a].filter((x) => x !== 180 - a).map((x) => `${x}°`),
      tag: 'angle',
      strategy: '직선이 이루는 각 180° 이용',
      hint: '직선을 이루는 각은 180°예요.',
      steps: [`두 각의 합은 180°입니다.`, `180-${a}=${180 - a}이므로 ${180 - a}°입니다.`],
      minusIsOperator: true,
      visual: { kind: 'angle-split', label: '한 직선 위의 두 각', known: a },
    };
  },
};

// ── 삼각형·사각형 ───────────────────────────────────────────────────
const 삼각형나머지: G5Family = {
  id: 'tri-rest',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 4, 20) * 5;
    const b = 사이(next, 4, 20) * 5;
    const c = 180 - a - b;
    if (c <= 0) return null;
    return {
      prompt: `삼각형의 두 각의 크기가 ${a}°, ${b}°일 때 나머지 한 각의 크기는 몇 도일까요?`,
      answer: `${c}°`,
      wrongs: [360 - a - b, a + b, c + 10, 90 - Math.min(a, b)].filter((x) => x > 0 && x !== c).map((x) => `${x}°`),
      tag: 'angle',
      strategy: '삼각형 세 각의 크기의 합 180°',
      hint: '삼각형의 세 각을 모으면 180°예요.',
      steps: ['삼각형의 세 각의 크기의 합은 180°입니다.', `180-${a}-${b}=${c}이므로 ${c}°입니다.`],
      misconceptionTip: '사각형의 360°와 헷갈리지 마세요.',
      minusIsOperator: true,
      visual: { kind: 'figure-set', label: '삼각형', items: [{ shape: '삼각형', points: 삼각형(a, b), angleLabels: [{ at: 0, text: `${a}°` }, { at: 1, text: `${b}°` }, { at: 2, text: '?' }] }] },
    };
  },
};

const 사각형나머지: G5Family = {
  id: 'quad-rest',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 12, 26) * 5;
    const b = 사이(next, 12, 26) * 5;
    const c = 사이(next, 12, 26) * 5;
    const d = 360 - a - b - c;
    if (d <= 10 || d >= 180) return null;
    const 모양 = 네각사각형(a, b, c, d);
    if (!모양) return null;
    return {
      prompt: `사각형의 세 각의 크기가 ${a}°, ${b}°, ${c}°일 때 나머지 한 각의 크기는 몇 도일까요?`,
      answer: `${d}°`,
      wrongs: [180 - a - b - c > 0 ? 180 - a - b - c : d + 20, d + 10, d - 10, a + b + c - 180].filter((x) => x > 0 && x !== d).map((x) => `${x}°`),
      tag: 'angle',
      strategy: '사각형 네 각의 크기의 합 360°',
      hint: '사각형은 삼각형 2개로 나눌 수 있어요.',
      steps: ['사각형의 네 각의 크기의 합은 360°입니다.', `360-${a}-${b}-${c}=${d}이므로 ${d}°입니다.`],
      misconceptionTip: '삼각형의 180°와 헷갈리지 마세요.',
      minusIsOperator: true,
      visual: { kind: 'figure-set', label: '사각형', items: [{ shape: '사각형', points: 모양, angleLabels: [{ at: 0, text: `${a}°` }, { at: 1, text: `${b}°` }, { at: 2, text: `${c}°` }, { at: 3, text: '?' }] }] },
    };
  },
};

const 합까닭 = (tri: boolean): G5Family => ({
  id: `sum-why-${tri ? 't' : 'q'}`,
  make: () => {
    return tri
      ? {
          prompt: '삼각형의 세 각을 잘라 꼭짓점이 한 점에 모이도록 이어 붙였습니다. 이어 붙인 각은 몇 도일까요?',
          answer: '180°',
          wrongs: ['90°', '360°', '270°'],
          tag: 'angle',
          strategy: '삼각형 세 각의 합 추론',
          hint: '세 각을 이어 붙이면 어떤 모양이 되는지 떠올려 보세요.',
          steps: ['세 각을 이어 붙이면 직선이 됩니다.', '직선이 이루는 각은 180°이므로 세 각의 크기의 합은 180°입니다.'],
        }
      : {
          prompt: '사각형에 대각선을 하나 그으면 삼각형 몇 개로 나누어지고, 네 각의 크기의 합은 몇 도일까요?',
          answer: '2개, 360°',
          wrongs: ['2개, 180°', '4개, 720°', '3개, 540°'],
          tag: 'angle',
          strategy: '사각형 네 각의 합 추론',
          hint: '삼각형 한 개의 세 각의 합은 180°예요.',
          steps: ['사각형은 삼각형 2개로 나누어집니다.', '180°×2=360°입니다.'],
        };
  },
});

export const unit2Lesson41 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [가장큰각(40), 일도];
    case 2:
      return lv === '상' ? [가장큰각(15), 시계각비교] : [가장큰각(lv === '하' ? 40 : 25), 시계각비교];
    case 3:
      return lv === '하' ? [일도, 눈금읽기] : [눈금읽기, 일도];
    case 4:
      if (lv === '하') return [그림분류, 예둔고르기('예각'), 예둔고르기('둔각'), 시계각];
      return [예둔고르기('예각'), 예둔고르기('둔각'), 시계각, 그림분류];
    case 5:
      return lv === '하' ? [어림, 눈금읽기, 시계각도] : [어림, 어림정확, 눈금읽기, 시계각도];
    case 6:
      return lv === '하' ? [합차, 직선나머지, 삼각자각] : [합차, 직선나머지, 삼각자각, 시계각도];
    case 7:
      return lv === '하' ? [삼각형나머지, 합까닭(true), 직선나머지, 삼각형조건각] : [삼각형나머지, 삼각형조건각, 합까닭(true), 삼각자각];
    case 8:
      return lv === '하' ? [사각형나머지, 합까닭(false), 직선나머지, 사각형조건각] : [사각형나머지, 사각형조건각, 합까닭(false), 다각형각합];
    default:
      return null;
  }
};
