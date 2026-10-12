import type { Difficulty, FigureSetVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 정삼각형생각 } from './thinking';
import { 삼각형 } from './geom';

// ════════════════════════════════════════════════════════════════════
// 4-2 2단원 삼각형
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 각의 크기에 따라 분류 / 변의 길이에 따라
// 분류 / 이등변삼각형의 성질 / 정삼각형의 성질
//
// 지도서가 못박은 것:
//   · 예각삼각형: 세 각이 모두 예각. 직각삼각형: 한 각이 직각.
//     둔각삼각형: 한 각이 둔각. "예각이 있기만 하면 예각삼각형"이라는
//     오개념을 짚습니다(둔각삼각형에도 예각이 두 개 있습니다).
//   · 이등변삼각형: 두 변의 길이가 같은 삼각형, 두 각의 크기가 같습니다.
//     정삼각형: 세 변의 길이가 같은 삼각형, 세 각이 모두 60°입니다.
//   · 정삼각형과 이등변삼각형의 포함 관계는 다루지 않습니다. 그래서 한
//     문항의 보기에 정삼각형과 이등변삼각형이 함께 맞는 답이 되는 일이
//     없게, 정삼각형인 것을 고르는 문항에 '이등변삼각형'을 보기로 두지
//     않고, 이등변삼각형을 고르는 문항에 정삼각형을 보기로 두지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 각분류 = (a: number, b: number, c: number) => {
  const big = Math.max(a, b, c);
  return big < 90 ? '예각삼각형' : big === 90 ? '직각삼각형' : '둔각삼각형';
};

const 그림 = (A: number, B: number, 각글 = true): FigureSetVisual => ({
  kind: 'figure-set',
  label: '삼각형',
  items: [{ shape: '삼각형', points: 삼각형(A, B), ...(각글 ? { angleLabels: [{ at: 0, text: `${A}°` }, { at: 1, text: `${B}°` }] } : {}) }],
});

/** 세 각이 모두 5°의 배수이고 서로 다른 삼각형을 만듭니다. */
const 세각 = (next: (b: number) => number, 종류: '예각삼각형' | '직각삼각형' | '둔각삼각형') => {
  for (let t = 0; t < 30; t += 1) {
    const big = 종류 === '직각삼각형' ? 90 : 종류 === '둔각삼각형' ? 사이(next, 19, 30) * 5 : 사이(next, 13, 17) * 5;
    const rest = 180 - big;
    const a = 사이(next, 4, rest / 5 - 4) * 5;
    const b = rest - a;
    if (각분류(big, a, b) !== 종류 || a === b || a === big || b === big) continue;
    return [a, b, big];
  }
  return null;
};

// ── 각의 크기에 따른 분류 ───────────────────────────────────────────
const 세각분류: G5Family = {
  id: 'classify-3',
  make: (seed) => {
    const next = 고르개(seed);
    const 종류 = (['예각삼각형', '직각삼각형', '둔각삼각형'] as const)[next(3)];
    const 각들 = 세각(next, 종류);
    if (!각들) return null;
    const 섞은 = [...각들].sort(() => 0).sort((x, y) => ((x * 7 + seed) % 5) - ((y * 7 + seed) % 5));
    return {
      prompt: `세 각의 크기가 ${섞은.join('°, ')}°인 삼각형은 어떤 삼각형일까요?`,
      answer: 종류,
      wrongs: ['예각삼각형', '직각삼각형', '둔각삼각형', '알 수 없습니다'].filter((x) => x !== 종류),
      tag: 'shape',
      strategy: '각의 크기에 따라 삼각형 분류하기',
      hint: '가장 큰 각이 예각인지, 직각인지, 둔각인지 보세요.',
      steps: [`가장 큰 각은 ${Math.max(...각들)}°입니다.`, `그러므로 ${종류}입니다.`],
      misconceptionTip: '예각이 하나라도 있다고 예각삼각형이 아니에요. 세 각이 모두 예각이어야 해요.',
    };
  },
};

const 두각분류: G5Family = {
  id: 'classify-2',
  make: (seed) => {
    const next = 고르개(seed);
    // 두 각이 모두 예각인데 나머지가 둔각·직각인 경우를 일부러 많이 냅니다.
    const 종류 = (['예각삼각형', '직각삼각형', '둔각삼각형', '둔각삼각형'] as const)[next(4)];
    const 각들 = 세각(next, 종류);
    if (!각들) return null;
    const [a, b, c] = 각들;
    const 보일 = 종류 === '예각삼각형' ? [a, c] : [a, b];
    const 나머지 = 180 - 보일[0] - 보일[1];
    return {
      prompt: `삼각형의 두 각의 크기가 ${보일[0]}°, ${보일[1]}°입니다. 이 삼각형은 어떤 삼각형일까요?`,
      answer: 종류,
      wrongs: ['예각삼각형', '직각삼각형', '둔각삼각형', '알 수 없습니다'].filter((x) => x !== 종류),
      tag: 'shape',
      strategy: '나머지 한 각을 구해 삼각형 분류하기',
      hint: '삼각형의 세 각의 크기의 합은 180°예요. 나머지 한 각을 먼저 구하세요.',
      steps: [`나머지 한 각은 180°-${보일[0]}°-${보일[1]}°=${나머지}°입니다.`, `세 각 가운데 가장 큰 각이 ${Math.max(보일[0], 보일[1], 나머지)}°이므로 ${종류}입니다.`],
      misconceptionTip: '보이는 두 각이 예각이어도 나머지 한 각이 둔각일 수 있어요.',
      minusIsOperator: true,
    };
  },
};

const 그림분류: G5Family = {
  id: 'classify-pic',
  make: (seed) => {
    const next = 고르개(seed);
    const 종류 = (['예각삼각형', '직각삼각형', '둔각삼각형'] as const)[next(3)];
    const 각들 = 세각(next, 종류);
    if (!각들) return null;
    const [a, b] = 각들;
    // 너무 납작한 삼각형은 그림에서 각을 알아보기 어렵습니다.
    if (Math.min(a, b) < 25 || 각들[2] > 125) return null;
    // 큰 각이 위 꼭짓점에 오도록 밑변 두 각에 작은 두 각을 둡니다.
    return {
      prompt: '그림의 삼각형은 각의 크기에 따라 어떤 삼각형일까요?',
      answer: 종류,
      wrongs: ['예각삼각형', '직각삼각형', '둔각삼각형', '알 수 없습니다'].filter((x) => x !== 종류),
      tag: 'shape',
      strategy: '그림의 삼각형 분류하기',
      hint: '적힌 두 각으로 나머지 한 각을 구해 보세요.',
      steps: [`나머지 한 각은 180°-${a}°-${b}°=${180 - a - b}°입니다.`, `그러므로 ${종류}입니다.`],
      visual: 그림(a, b),
      minusIsOperator: true,
    };
  },
};

const 뜻: G5Family = {
  id: 'definition',
  make: (seed) => {
    const qs = [
      { p: '세 각이 모두 예각인 삼각형을 무엇이라고 할까요?', a: '예각삼각형', w: ['둔각삼각형', '직각삼각형', '정삼각형'], s: '세 각이 모두 예각인 삼각형을 예각삼각형이라고 합니다.' },
      { p: '한 각이 둔각인 삼각형을 무엇이라고 할까요?', a: '둔각삼각형', w: ['예각삼각형', '직각삼각형', '이등변삼각형'], s: '한 각이 둔각인 삼각형을 둔각삼각형이라고 합니다.' },
      { p: '두 변의 길이가 같은 삼각형을 무엇이라고 할까요?', a: '이등변삼각형', w: ['직각삼각형', '예각삼각형', '둔각삼각형'], s: '두 변의 길이가 같은 삼각형을 이등변삼각형이라고 합니다.' },
      { p: '세 변의 길이가 같은 삼각형을 무엇이라고 할까요?', a: '정삼각형', w: ['직각삼각형', '둔각삼각형', '사각형'], s: '세 변의 길이가 같은 삼각형을 정삼각형이라고 합니다.' },
      { p: '둔각삼각형에는 예각이 몇 개 있을까요?', a: '2개', w: ['0개', '1개', '3개'], s: '둔각은 한 개뿐이고, 세 각의 합이 180°이므로 나머지 두 각은 예각입니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'shape', strategy: '삼각형의 이름', hint: '삼각형을 나누는 기준(각, 변)을 떠올려 보세요.', steps: [q.s] };
  },
};

// ── 변의 길이에 따른 분류 ───────────────────────────────────────────
const 될수있는변: G5Family = {
  id: 'sides-pick',
  make: (seed) => {
    const next = 고르개(seed);
    const 정 = next(2) === 0;
    const s = 사이(next, 4, 9);
    const t = s + 사이(next, 1, 3);
    // 세 변이 모두 다른 것, 두 변만 같은 것, 세 변이 같은 것 — 삼각형이 될 수 있는 길이만 씁니다.
    const 모두다름 = (k: number) => [s - 1 + k, s + 1 + k, s + 2 + k];
    const 두같음 = (x: number, y: number) => [x, x, y];
    const 글 = (xs: number[]) => `${xs.join(' cm, ')} cm`;
    if (정) {
      const ans = 글([s, s, s]);
      return {
        prompt: '정삼각형의 세 변의 길이가 될 수 있는 것은 어느 것일까요?',
        answer: ans,
        wrongs: [글(두같음(s, t)), 글(모두다름(0)), 글(두같음(t, s))],
        tag: 'shape',
        strategy: '변의 길이로 정삼각형 알기',
        hint: '정삼각형은 세 변의 길이가 모두 같아요.',
        steps: [`세 변의 길이가 모두 ${s} cm로 같은 것은 ${ans}입니다.`],
      };
    }
    const ans = 글(두같음(t, s));
    return {
      prompt: '이등변삼각형의 세 변의 길이가 될 수 있는 것은 어느 것일까요?',
      answer: ans,
      wrongs: [글(모두다름(0)), 글(모두다름(1)), 글([s, s + 2, s + 4])],
      tag: 'shape',
      strategy: '변의 길이로 이등변삼각형 알기',
      hint: '두 변의 길이가 같은 것을 찾아요.',
      steps: [`두 변의 길이가 ${t} cm로 같은 것은 ${ans}입니다.`],
    };
  },
};

// ── 이등변삼각형의 성질 ─────────────────────────────────────────────
const 이등변각: G5Family = {
  id: 'iso-angle',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 밑각 = 사이(next, 5, 14) * 5;
    if (밑각 === 60) return null;
    const 꼭지 = 180 - 밑각 * 2;
    const 밑각묻기 = lv !== '하' && next(2) === 0;
    if (밑각묻기) {
      return {
        prompt: `이등변삼각형에서 길이가 같은 두 변 사이의 각이 ${꼭지}°입니다. 나머지 한 각의 크기는 몇 도일까요?`,
        answer: `${밑각}°`,
        wrongs: [...new Set([180 - 꼭지, 꼭지, 90 - 꼭지 / 2 + 10, 밑각 + 10])].filter((x) => x > 0 && x !== 밑각).map((x) => `${x}°`),
        tag: 'shape',
        strategy: '이등변삼각형의 두 각의 크기가 같음을 이용하기',
        hint: '나머지 두 각의 크기가 같고, 세 각의 합은 180°예요.',
        steps: [`나머지 두 각의 합은 180°-${꼭지}°=${180 - 꼭지}°입니다.`, `두 각의 크기가 같으므로 한 각은 ${180 - 꼭지}°÷2=${밑각}°입니다.`],
        visual: { kind: 'figure-set', label: '이등변삼각형', items: [{ shape: '이등변삼각형', points: 삼각형(밑각, 밑각), angleLabels: [{ at: 2, text: `${꼭지}°` }, { at: 0, text: '?' }] }] },
        minusIsOperator: true,
      };
    }
    return {
      prompt: `이등변삼각형에서 크기가 같은 두 각 가운데 한 각이 ${밑각}°입니다. 나머지 한 각의 크기는 몇 도일까요?`,
      answer: `${꼭지}°`,
      wrongs: [...new Set([180 - 밑각, 밑각, 90 - 밑각 > 0 ? 90 - 밑각 : 꼭지 + 20, 꼭지 + 10])].filter((x) => x > 0 && x !== 꼭지).map((x) => `${x}°`),
      tag: 'shape',
      strategy: '이등변삼각형의 두 각의 크기가 같음을 이용하기',
      hint: '크기가 같은 각이 두 개예요. 세 각의 합은 180°예요.',
      steps: [`크기가 같은 두 각의 합은 ${밑각}°×2=${밑각 * 2}°입니다.`, `나머지 한 각은 180°-${밑각 * 2}°=${꼭지}°입니다.`],
      visual: { kind: 'figure-set', label: '이등변삼각형', items: [{ shape: '이등변삼각형', points: 삼각형(밑각, 밑각), angleLabels: [{ at: 0, text: `${밑각}°` }, { at: 2, text: '?' }] }] },
      misconceptionTip: '크기가 같은 각이 두 개라는 것을 잊지 마세요.',
      minusIsOperator: true,
    };
  },
};

/** 같은 두 변이 같은, 밑변이 다른인 이등변삼각형 그림입니다. 변 이름표: 밑변, 오른쪽, 왼쪽. */
const 이등변그림 = (같은: number, 다른: number, 글: [string, string, string]): FigureSetVisual => {
  const 밑각 = (Math.acos(다른 / 2 / 같은) * 180) / Math.PI;
  return {
    kind: 'figure-set',
    label: '이등변삼각형',
    items: [{ shape: '이등변삼각형', points: 삼각형(밑각, 밑각), edgeLabels: [{ from: 0, to: 1, text: 글[0] }, { from: 1, to: 2, text: 글[1] }, { from: 2, to: 0, text: 글[2] }] }],
  };
};

const 이등변둘레: G5Family = {
  id: 'iso-perimeter',
  make: (seed) => {
    const next = 고르개(seed);
    const 같은 = 사이(next, 5, 14);
    const 다른 = 사이(next, 3, 2 * 같은 - 1);
    if (다른 === 같은) return null;
    const 거꾸로 = next(2) === 0;
    if (거꾸로) {
      const 둘레 = 같은 * 2 + 다른;
      return {
        prompt: `둘레가 ${둘레} cm인 이등변삼각형에서 길이가 다른 한 변이 ${다른} cm입니다. 길이가 같은 한 변은 몇 cm일까요?`,
        answer: `${같은} cm`,
        wrongs: [...new Set([둘레 - 다른, Math.floor((둘레 - 다른) / 3), 같은 + 1, 같은 - 1])].filter((x) => x > 0 && x !== 같은).map((x) => `${x} cm`),
        tag: 'shape',
        strategy: '이등변삼각형의 변의 길이',
        hint: '둘레에서 다른 한 변을 빼면 같은 두 변의 합이에요.',
        steps: [`${둘레}-${다른}=${둘레 - 다른}`, `${둘레 - 다른}÷2=${같은}이므로 ${같은} cm입니다.`],
        minusIsOperator: true,
        visual: 이등변그림(같은, 다른, [`${다른} cm`, '?', '?']),
      };
    }
    const 둘레 = 같은 * 2 + 다른;
    return {
      prompt: `길이가 같은 두 변이 각각 ${같은} cm, 나머지 한 변이 ${다른} cm인 이등변삼각형의 세 변의 길이의 합은 몇 cm일까요?`,
      answer: `${둘레} cm`,
      wrongs: [...new Set([같은 + 다른, 같은 + 다른 * 2, 같은 * 3, 둘레 + 1])].filter((x) => x !== 둘레).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '이등변삼각형의 둘레',
      hint: '같은 길이의 변이 두 개예요.',
      steps: [`${같은}+${같은}+${다른}=${둘레}이므로 ${둘레} cm입니다.`],
      visual: 이등변그림(같은, 다른, [`${다른} cm`, `${같은} cm`, `${같은} cm`]),
    };
  },
};

// ── 정삼각형의 성질 ─────────────────────────────────────────────────
const 정삼각형: G5Family = {
  id: 'equilateral',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const kind = lv === '하' ? next(2) : next(3);
    const s = 사이(next, 3, 15);
    if (kind === 0) {
      return {
        prompt: `한 변이 ${s} cm인 정삼각형의 세 변의 길이의 합은 몇 cm일까요?`,
        answer: `${s * 3} cm`,
        wrongs: [s * 2, s * 4, s + 3].filter((x) => x !== s * 3).map((x) => `${x} cm`),
        tag: 'shape',
        strategy: '정삼각형의 둘레',
        hint: '정삼각형은 세 변의 길이가 모두 같아요.',
        steps: [`${s}×3=${s * 3}이므로 ${s * 3} cm입니다.`],
        visual: { kind: 'figure-set', label: '정삼각형', items: [{ shape: '정삼각형', points: 삼각형(60, 60), edgeLabels: [{ from: 0, to: 1, text: `${s} cm` }] }] },
      };
    }
    if (kind === 1) {
      return {
        prompt: '정삼각형의 한 각의 크기는 몇 도일까요?',
        answer: '60°',
        wrongs: ['90°', '45°', '180°'],
        tag: 'shape',
        strategy: '정삼각형의 각',
        hint: '정삼각형은 세 각의 크기가 모두 같고, 세 각의 합은 180°예요.',
        steps: ['180°÷3=60°입니다.'],
        visual: { kind: 'figure-set', label: '정삼각형', items: [{ shape: '정삼각형', points: 삼각형(60, 60) }] },
      };
    }
    return {
      prompt: `세 변의 길이의 합이 ${s * 3} cm인 정삼각형의 한 변은 몇 cm일까요?`,
      answer: `${s} cm`,
      wrongs: [...new Set([s * 3, Math.floor((s * 3) / 2), s + 3, s - 1])].filter((x) => x > 0 && x !== s).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '정삼각형의 변의 길이',
      hint: '세 변의 길이가 같으니 3으로 나누어요.',
      steps: [`${s * 3}÷3=${s}이므로 ${s} cm입니다.`],
    };
  },
};

const 두기준: G5Family = {
  id: 'two-criteria',
  make: (seed) => {
    const next = 고르개(seed);
    const 밑각 = [30, 35, 40, 45, 50, 55, 65, 70, 75, 80][next(10)];
    const 꼭지 = 180 - 2 * 밑각;
    const 종류 = 각분류(밑각, 밑각, 꼭지);
    const ans = `${종류}이면서 이등변삼각형`;
    return {
      prompt: `세 각의 크기가 ${밑각}°, ${밑각}°, ${꼭지}°인 삼각형의 이름으로 알맞은 것은 어느 것일까요?`,
      answer: ans,
      wrongs: ['예각삼각형', '직각삼각형', '둔각삼각형'].filter((x) => x !== 종류).map((x) => `${x}이면서 이등변삼각형`).concat([`${종류}이면서 세 변의 길이가 모두 다른 삼각형`]),
      tag: 'shape',
      strategy: '두 가지 기준으로 삼각형 분류하기',
      hint: '각의 크기로 한 번, 변(같은 각)으로 한 번 나누어 보세요.',
      steps: [`가장 큰 각이 ${Math.max(밑각, 꼭지)}°이므로 ${종류}입니다.`, '두 각의 크기가 같으므로 두 변의 길이가 같은 이등변삼각형입니다.'],
    };
  },
};

export const unit2Lesson42 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [뜻, 세각분류];
    case 2:
      if (lv === '하') return [세각분류, 그림분류, 뜻];
      return lv === '중' ? [그림분류, 두각분류, 세각분류] : [두각분류, 그림분류, 세각분류];
    case 3:
      return lv === '상' ? [될수있는변, 두기준] : [될수있는변, 뜻];
    case 4:
      return lv === '하' ? [이등변각, 이등변둘레] : [이등변각, 이등변둘레, 두기준];
    case 5:
      return [정삼각형, 정삼각형생각];
    default:
      return null;
  }
};
