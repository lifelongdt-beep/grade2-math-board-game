import type { Difficulty, FigureSetVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 고르지않은다각형, 마름모 as 마름모점, 사각형, type Pt } from './geom';

// ════════════════════════════════════════════════════════════════════
// 4-2 4단원 사각형
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 수직 / 평행 / 평행선 사이의 거리 /
// 사다리꼴 / 평행사변형 / 마름모 / 여러 가지 사각형
//
// 지도서가 못박은 것:
//   · 두 직선이 만나서 이루는 각이 직각일 때 서로 수직이고, 한 직선을
//     다른 직선에 대한 수선이라고 합니다. 서로 만나지 않는 두 직선을
//     평행하다고 하고 평행선이라고 합니다. 평행선 사이의 거리는 평행선
//     사이에 그은 수선의 길이입니다.
//   · 사다리꼴: 평행한 변이 한 쌍이라도 있는 사각형.
//     평행사변형: 마주 보는 두 쌍의 변이 서로 평행한 사각형.
//     마름모: 네 변의 길이가 모두 같은 사각형.
//   · 여러 가지 사각형 사이의 포함 관계는 다루지 않습니다.
//
// 포함 관계를 다루지 않으므로, '○○은 어느 것일까요' 문항의 오답 도형은
// ○○의 정의를 정말로 만족하지 않는 것만 씁니다. 예를 들어 사다리꼴을
// 고르는 문항에는 평행한 변이 하나도 없는 사각형만 오답으로 두고,
// 평행사변형·직사각형은 넣지 않습니다(정의로는 사다리꼴이기도 하므로).
// ════════════════════════════════════════════════════════════════════

type 종류 = '사다리꼴' | '평행사변형' | '마름모' | '직사각형' | '정사각형' | '사각형';

/** 각 종류의 도형 꼭짓점을 만듭니다. 이름에 꼭 맞는 모양만 나옵니다(사다리꼴은 평행한 변이 한 쌍뿐). */
const 모양 = (k: 종류, next: (b: number) => number): Pt[] => {
  switch (k) {
    case '사다리꼴': {
      const bottom = 사이(next, 9, 12);
      const top = 사이(next, 4, 7);
      return 사각형(bottom, top, 사이(next, 4, 6), 사이(next, 1, bottom - top - 1));
    }
    case '평행사변형': {
      const w = 사이(next, 7, 10);
      return 사각형(w, w, 사이(next, 4, 6), 사이(next, 2, 4));
    }
    case '마름모':
      return 마름모점(사이(next, 10, 12), 사이(next, 5, 7));
    case '직사각형': {
      const w = 사이(next, 8, 11);
      return 사각형(w, w, 사이(next, 4, 6), 0);
    }
    case '정사각형':
      return 사각형(6, 6, 6, 0);
    default: {
      // 원 위의 네 점은 마주 보는 변이 우연히 평행할 수 있습니다. 평행한 변이
      // 하나도 없는 것이 나올 때까지 다시 찍습니다.
      for (let t = 0; t < 50; t += 1) {
        const pts = 고르지않은다각형(4, next);
        // 거의 평행해 보이는 변도 피합니다. 마주 보는 변의 방향이 15° 넘게
        // 어긋나야 그림만 보고도 평행하지 않다고 알 수 있습니다.
        if (평행쌍(pts) === 0 && 어긋남(pts) >= 15) return pts;
      }
      return [[-0.9, 0.6], [0.8, 0.9], [0.5, -0.8], [-0.4, -0.5]];
    }
  }
};

/** 밑변 w, 옆변 L, 왼쪽 아래 각이 a°인 평행사변형(마름모는 w=L)입니다. 그림의 각과 길이가 적힌 값과 같습니다. */
const 평행사변형점 = (w: number, L: number, a: number): Pt[] => 사각형(w, w, L * Math.sin((a * Math.PI) / 180), L * Math.cos((a * Math.PI) / 180));
const 변글 = (글: Array<[number, number, string]>) => 글.map(([from, to, text]) => ({ from, to, text }));

const 다변 = (pts: Pt[]) => pts.map((p, k) => [p, pts[(k + 1) % pts.length]] as const);
const 평행 = (a: readonly [Pt, Pt], b: readonly [Pt, Pt]) => Math.abs((a[1][0] - a[0][0]) * (b[1][1] - b[0][1]) - (a[1][1] - a[0][1]) * (b[1][0] - b[0][0])) < 1e-3;
/** 마주 보는 두 쌍의 변이 이루는 방향 차이 가운데 작은 것(도)입니다. */
const 어긋남 = (pts: Pt[]) => {
  const e = 다변(pts);
  const 방향 = (x: readonly [Pt, Pt]) => (Math.atan2(x[1][1] - x[0][1], x[1][0] - x[0][0]) * 180) / Math.PI;
  const 차 = (a: number, b: number) => {
    const d = Math.abs(a - b) % 180;
    return Math.min(d, 180 - d);
  };
  return Math.min(차(방향(e[0]), 방향(e[2])), 차(방향(e[1]), 방향(e[3])));
};

/** 마주 보는 변 가운데 평행한 쌍의 수입니다. */
export const 평행쌍 = (pts: Pt[]) => {
  const e = 다변(pts);
  return (평행(e[0], e[2]) ? 1 : 0) + (평행(e[1], e[3]) ? 1 : 0);
};

const 그림 = (items: Array<{ name: string; points: Pt[] }>): FigureSetVisual => ({
  kind: 'figure-set',
  label: '여러 가지 사각형',
  items: items.map((it) => ({ name: it.name, shape: '사각형', points: it.points })),
});

const 이름들 = ['가', '나', '다', '라'];

// 고르는 문항의 오답 후보: 묻는 이름의 정의를 만족하지 않는 것만.
const 오답후보: Record<'사다리꼴' | '평행사변형' | '마름모' | '직사각형', 종류[]> = {
  사다리꼴: ['사각형'],
  평행사변형: ['사다리꼴', '사각형'],
  마름모: ['평행사변형', '직사각형', '사다리꼴', '사각형'],
  직사각형: ['평행사변형', '마름모', '사다리꼴', '사각형'],
};

const 고르기 = (want: '사다리꼴' | '평행사변형' | '마름모' | '직사각형'): G5Family => ({
  id: `pick-${want}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 답자리 = next(4);
    const 후보 = 오답후보[want];
    const items = 이름들.map((name, k) => ({ name, points: 모양(k === 답자리 ? want : 후보[(k + seed) % 후보.length], next) }));
    const 뜻 = { 사다리꼴: '평행한 변이 한 쌍이라도 있는 사각형', 평행사변형: '마주 보는 두 쌍의 변이 서로 평행한 사각형', 마름모: '네 변의 길이가 모두 같은 사각형', 직사각형: '네 각이 모두 직각인 사각형' }[want];
    return {
      prompt: `${want}은(는) 어느 것일까요?`,
      answer: 이름들[답자리],
      wrongs: 이름들.filter((_, k) => k !== 답자리),
      tag: 'shape',
      strategy: `${want} 찾기`,
      hint: `${want}은(는) ${뜻}이에요.`,
      steps: [`${뜻}을(를) ${want}(이)라고 합니다.`, `그러므로 ${이름들[답자리]}입니다.`],
      visual: 그림(items),
    };
  },
});

// ── 수직과 평행 ─────────────────────────────────────────────────────
const 수직평행뜻: G5Family = {
  id: 'perp-parallel',
  make: (seed) => {
    const qs = [
      { p: '두 직선이 만나서 이루는 각이 직각일 때, 두 직선은 서로 어떤 관계일까요?', a: '수직입니다', w: ['평행합니다', '만나지 않습니다', '길이가 같습니다'], s: '두 직선이 만나서 이루는 각이 직각이면 서로 수직입니다.' },
      { p: '두 직선이 서로 수직으로 만날 때, 한 직선을 다른 직선에 대한 무엇이라고 할까요?', a: '수선', w: ['평행선', '대각선', '선분'], s: '수직으로 만나는 한 직선을 다른 직선에 대한 수선이라고 합니다.' },
      { p: '한 평면에서 아무리 늘여도 서로 만나지 않는 두 직선을 무엇이라고 할까요?', a: '평행선', w: ['수선', '대각선', '반직선'], s: '서로 만나지 않는 두 직선은 평행하고, 이 두 직선을 평행선이라고 합니다.' },
      { p: '한 직선에 수직인 직선을 두 개 그으면 두 직선은 서로 어떤 관계일까요?', a: '평행합니다', w: ['수직입니다', '한 점에서 만납니다', '알 수 없습니다'], s: '한 직선에 수직인 두 직선은 서로 만나지 않으므로 평행합니다.' },
      { p: '한 점을 지나고 주어진 직선에 수직인 직선은 몇 개 그을 수 있을까요?', a: '1개', w: ['2개', '0개', '셀 수 없이 많습니다'], s: '한 점을 지나고 한 직선에 수직인 직선은 하나뿐입니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'shape', strategy: '수직과 평행', hint: '수직은 직각으로 만나는 것, 평행은 만나지 않는 것이에요.', steps: [q.s] };
  },
};

const 수직변수: G5Family = {
  id: 'count-perp',
  make: (seed) => {
    const next = 고르개(seed);
    const k = (['직사각형', '사다리꼴', '평행사변형'] as const)[next(3)];
    // 직각 사다리꼴(직각이 2개)과 일반 평행사변형(직각 없음)
    const 직각사다리꼴: Pt[] = 사각형(10, 6, 5, 0);
    const pts = k === '직사각형' ? 모양('직사각형', next) : k === '사다리꼴' ? 직각사다리꼴 : 모양('평행사변형', next);
    const 쌍 = k === '직사각형' ? 4 : k === '사다리꼴' ? 2 : 0;
    return {
      prompt: '그림의 사각형에서 서로 수직으로 만나는 변은 모두 몇 쌍일까요?',
      answer: `${쌍}쌍`,
      wrongs: [0, 1, 2, 3, 4].filter((x) => x !== 쌍).slice(0, 3).map((x) => `${x}쌍`),
      tag: 'shape',
      strategy: '도형에서 수직 찾기',
      hint: '두 변이 직각으로 만나는 곳(꼭짓점)을 세어 보세요.',
      steps: [`직각인 꼭짓점이 ${쌍}개이므로 수직으로 만나는 변은 ${쌍}쌍입니다.`],
      visual: { kind: 'figure-set', label: '사각형', items: [{ shape: '사각형', points: pts }] },
    };
  },
};

const 평행변수: G5Family = {
  id: 'count-parallel',
  make: (seed) => {
    const next = 고르개(seed);
    const k = (['평행사변형', '사다리꼴', '사각형'] as const)[next(3)];
    const pts = 모양(k, next);
    const 쌍 = 평행쌍(pts);
    return {
      prompt: '그림의 사각형에서 서로 평행한 변은 모두 몇 쌍일까요?',
      answer: `${쌍}쌍`,
      wrongs: [0, 1, 2, 4].filter((x) => x !== 쌍).map((x) => `${x}쌍`),
      tag: 'shape',
      strategy: '도형에서 평행 찾기',
      hint: '마주 보는 변을 늘였을 때 만나지 않는지 보세요.',
      steps: [`마주 보는 변 가운데 평행한 것은 ${쌍}쌍입니다.`],
      visual: { kind: 'figure-set', label: '사각형', items: [{ shape: '사각형', points: pts }] },
    };
  },
};

const 평행선거리: G5Family = {
  id: 'parallel-distance',
  make: (seed) => {
    const next = 고르개(seed);
    const w = 사이(next, 6, 12);
    const h = 사이(next, 3, w - 1);
    const 비스듬 = h + 사이(next, 1, 3);
    const kind = next(2);
    if (kind === 0) {
      return {
        prompt: `가로 ${w} cm, 세로 ${h} cm인 직사각형에서 가로인 두 변은 서로 평행합니다. 이 평행선 사이의 거리는 몇 cm일까요?`,
        answer: `${h} cm`,
        wrongs: [...new Set([w, w + h, (w + h) * 2, h + 1])].filter((x) => x !== h).map((x) => `${x} cm`).slice(0, 3),
        tag: 'shape',
        strategy: '평행선 사이의 거리',
        hint: '평행선 사이의 거리는 두 평행선에 수직인 선분의 길이예요.',
        steps: [`가로인 두 변 사이에 수직인 선분은 세로이므로 ${h} cm입니다.`],
        visual: { kind: 'figure-set', label: '직사각형', items: [{ shape: '직사각형', points: 사각형(w, w, h, 0), edgeLabels: 변글([[0, 1, `${w} cm`], [1, 2, `${h} cm`]]) }] },
      };
    }
    return {
      prompt: `평행선 사이에 선분 세 개를 그었습니다. 길이가 ${비스듬 + 2} cm, ${h} cm, ${비스듬} cm이고, ${h} cm인 선분만 평행선에 수직입니다. 평행선 사이의 거리는 몇 cm일까요?`,
      answer: `${h} cm`,
      wrongs: [`${비스듬} cm`, `${비스듬 + 2} cm`, `${h + 비스듬 + 비스듬 + 2} cm`],
      tag: 'shape',
      strategy: '평행선 사이의 거리',
      hint: '평행선 사이에 그은 선분 가운데 수직인 선분의 길이가 거리예요. 그 선분이 가장 짧아요.',
      steps: [`평행선에 수직인 선분의 길이가 평행선 사이의 거리이므로 ${h} cm입니다.`],
      misconceptionTip: '비스듬히 그은 선분은 거리가 아니에요.',
      // 선분 차례를 섞어, 수직인 선분이 늘 가운데 있지 않게 합니다.
      visual: {
        kind: 'parallel-distance',
        label: '평행선 가와 나 사이에 그은 선분',
        segments: [
          { text: `${비스듬 + 2} cm`, slant: 60 },
          { text: `${h} cm`, slant: 0 },
          { text: `${비스듬} cm`, slant: -40 },
        ].sort((p, q) => ((p.slant * 7 + seed) % 5) - ((q.slant * 7 + seed) % 5)),
      },
    };
  },
};

// ── 평행사변형·마름모의 성질 ────────────────────────────────────────
const 평행사변형성질: G5Family = {
  id: 'parallelogram',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const kind = next(lv === '하' ? 2 : 3);
    if (kind === 0) {
      const a = 사이(next, 7, 17) * 5;
      if (a === 90) return null;
      return {
        prompt: `평행사변형에서 한 각의 크기가 ${a}°입니다. 이 각과 이웃한 각의 크기는 몇 도일까요?`,
        answer: `${180 - a}°`,
        wrongs: [...new Set([a, 360 - a, 90 - a > 0 ? 90 - a : a - 90 || 45])].filter((x) => x !== 180 - a).map((x) => `${x}°`),
        tag: 'shape',
        strategy: '평행사변형의 이웃한 두 각의 합',
        hint: '평행사변형에서 이웃한 두 각의 크기의 합은 180°예요.',
        steps: [`180°-${a}°=${180 - a}°입니다.`],
        visual: { kind: 'figure-set', label: '평행사변형', items: [{ shape: '평행사변형', points: 평행사변형점(10, 6, a), angleLabels: [{ at: 0, text: `${a}°` }, { at: 1, text: '?' }] }] },
        minusIsOperator: true,
      };
    }
    if (kind === 1) {
      const x = 사이(next, 4, 12);
      const y = 사이(next, 3, 9);
      if (x === y) return null;
      return {
        prompt: `평행사변형의 이웃한 두 변의 길이가 ${x} cm, ${y} cm일 때 네 변의 길이의 합은 몇 cm일까요?`,
        answer: `${(x + y) * 2} cm`,
        wrongs: [...new Set([x + y, x * 4, y * 4, x * 2 + y])].filter((v) => v !== (x + y) * 2).map((v) => `${v} cm`).slice(0, 3),
        tag: 'shape',
        strategy: '평행사변형의 마주 보는 변의 길이',
        hint: '평행사변형은 마주 보는 두 변의 길이가 같아요.',
        steps: [`(${x}+${y})×2=${(x + y) * 2}이므로 ${(x + y) * 2} cm입니다.`],
        visual: { kind: 'figure-set', label: '평행사변형', items: [{ shape: '평행사변형', points: 평행사변형점(x, y, 65), edgeLabels: 변글([[0, 1, `${x} cm`], [3, 0, `${y} cm`]]) }] },
      };
    }
    const a = 사이(next, 7, 17) * 5;
    if (a === 90) return null;
    return {
      prompt: `평행사변형에서 한 각의 크기가 ${a}°입니다. 이 각과 마주 보는 각의 크기는 몇 도일까요?`,
      answer: `${a}°`,
      wrongs: [...new Set([180 - a, 360 - a, 90])].filter((x) => x !== a).map((x) => `${x}°`),
      tag: 'shape',
      strategy: '평행사변형의 마주 보는 각',
      hint: '평행사변형은 마주 보는 두 각의 크기가 같아요.',
      steps: [`마주 보는 각의 크기는 같으므로 ${a}°입니다.`],
      visual: { kind: 'figure-set', label: '평행사변형', items: [{ shape: '평행사변형', points: 평행사변형점(10, 6, a), angleLabels: [{ at: 0, text: `${a}°` }, { at: 2, text: '?' }] }] },
    };
  },
};

const 마름모성질: G5Family = {
  id: 'rhombus',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const kind = next(lv === '하' ? 2 : 3);
    const s = 사이(next, 3, 15);
    if (kind === 0) {
      return {
        prompt: `한 변이 ${s} cm인 마름모의 네 변의 길이의 합은 몇 cm일까요?`,
        answer: `${s * 4} cm`,
        wrongs: [s * 2, s * 3, s + 4].filter((x) => x !== s * 4).map((x) => `${x} cm`),
        tag: 'shape',
        strategy: '마름모의 네 변',
        hint: '마름모는 네 변의 길이가 모두 같아요.',
        steps: [`${s}×4=${s * 4}이므로 ${s * 4} cm입니다.`],
        visual: { kind: 'figure-set', label: '마름모', items: [{ shape: '마름모', points: 평행사변형점(1, 1, 60), edgeLabels: 변글([[0, 1, `${s} cm`]]) }] },
      };
    }
    if (kind === 1) {
      return {
        prompt: `네 변의 길이의 합이 ${s * 4} cm인 마름모의 한 변은 몇 cm일까요?`,
        answer: `${s} cm`,
        wrongs: [...new Set([s * 2, s + 4, Math.floor((s * 4) / 3), s - 1])].filter((x) => x > 0 && x !== s).map((x) => `${x} cm`).slice(0, 3),
        tag: 'shape',
        strategy: '마름모의 한 변',
        hint: '네 변의 길이가 같으니 4로 나누어요.',
        steps: [`${s * 4}÷4=${s}이므로 ${s} cm입니다.`],
      };
    }
    const a = 사이(next, 8, 16) * 5;
    if (a === 90) return null;
    return {
      prompt: `마름모에서 한 각의 크기가 ${a}°입니다. 이 각과 이웃한 각의 크기는 몇 도일까요?`,
      answer: `${180 - a}°`,
      wrongs: [...new Set([a, 360 - a, 90])].filter((x) => x !== 180 - a).map((x) => `${x}°`),
      tag: 'shape',
      strategy: '마름모의 각',
      hint: '마름모도 마주 보는 두 쌍의 변이 평행해서 이웃한 두 각의 합이 180°예요.',
      steps: [`180°-${a}°=${180 - a}°입니다.`],
      minusIsOperator: true,
      visual: { kind: 'figure-set', label: '마름모', items: [{ shape: '마름모', points: 평행사변형점(1, 1, a), angleLabels: [{ at: 0, text: `${a}°` }, { at: 1, text: '?' }] }] },
    };
  },
};

// ── 뜻과 성질 ───────────────────────────────────────────────────────
const 뜻: G5Family = {
  id: 'definitions',
  make: (seed) => {
    const qs = [
      { p: '평행한 변이 한 쌍이라도 있는 사각형을 무엇이라고 할까요?', a: '사다리꼴', w: ['마름모', '직사각형', '정사각형'], s: '평행한 변이 한 쌍이라도 있는 사각형을 사다리꼴이라고 합니다.' },
      { p: '마주 보는 두 쌍의 변이 서로 평행한 사각형을 무엇이라고 할까요?', a: '평행사변형', w: ['사다리꼴', '마름모', '정사각형'], s: '마주 보는 두 쌍의 변이 서로 평행한 사각형을 평행사변형이라고 합니다.' },
      { p: '네 변의 길이가 모두 같은 사각형을 무엇이라고 할까요?', a: '마름모', w: ['평행사변형', '사다리꼴', '직사각형'], s: '네 변의 길이가 모두 같은 사각형을 마름모라고 합니다.' },
      { p: '평행사변형의 성질로 알맞은 것은 어느 것일까요?', a: '마주 보는 두 각의 크기가 같습니다', w: ['네 변의 길이가 모두 같습니다', '네 각이 모두 직각입니다', '평행한 변이 한 쌍뿐입니다'], s: '평행사변형은 마주 보는 두 변의 길이가 같고, 마주 보는 두 각의 크기가 같습니다.' },
      { p: '마름모의 성질로 알맞은 것은 어느 것일까요?', a: '네 변의 길이가 모두 같습니다', w: ['네 각이 모두 직각입니다', '평행한 변이 한 쌍뿐입니다', '이웃한 두 각의 크기가 항상 같습니다'], s: '마름모는 네 변의 길이가 모두 같고, 마주 보는 두 각의 크기가 같습니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'shape', strategy: '여러 가지 사각형의 뜻', hint: '변이 평행한지, 길이가 같은지, 각이 직각인지 차례로 생각해요.', steps: [q.s] };
  },
};

const 직사각형정사각형: G5Family = {
  id: 'rect-square',
  make: (seed) => {
    const next = 고르개(seed);
    const w = 사이(next, 5, 15);
    const h = 사이(next, 3, w - 1);
    const kind = next(2);
    if (kind === 0) {
      return {
        prompt: `직사각형의 가로가 ${w} cm, 세로가 ${h} cm일 때 네 변의 길이의 합은 몇 cm일까요?`,
        answer: `${(w + h) * 2} cm`,
        wrongs: [...new Set([w + h, w * h, w * 4, (w + h) * 2 + 2])].filter((v) => v !== (w + h) * 2).map((v) => `${v} cm`).slice(0, 3),
        tag: 'shape',
        strategy: '직사각형의 둘레',
        hint: '직사각형은 마주 보는 두 변의 길이가 같아요.',
        steps: [`(${w}+${h})×2=${(w + h) * 2}이므로 ${(w + h) * 2} cm입니다.`],
        visual: { kind: 'figure-set', label: '직사각형', items: [{ shape: '직사각형', points: 사각형(w, w, h, 0), edgeLabels: 변글([[0, 1, `${w} cm`], [1, 2, `${h} cm`]]) }] },
      };
    }
    return {
      prompt: '정사각형의 성질로 알맞은 것은 어느 것일까요?',
      answer: '네 변의 길이가 모두 같고 네 각이 모두 직각입니다',
      wrongs: ['네 변의 길이는 모두 같지만 네 각이 직각은 아닙니다', '평행한 변이 한 쌍뿐입니다', '마주 보는 두 변의 길이만 같고 이웃한 두 변의 길이는 항상 다릅니다'],
      tag: 'shape',
      strategy: '정사각형의 성질',
      hint: '정사각형의 네 변과 네 각을 떠올려 보세요.',
      steps: ['정사각형은 네 변의 길이가 모두 같고 네 각이 모두 직각입니다.'],
    };
  },
};

export const unit4Lesson42 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [수직평행뜻, 뜻, 평행변수];
    case 2:
      return lv === '하' ? [수직평행뜻, 수직변수] : [수직변수, 수직평행뜻];
    case 3:
      return [평행변수, 수직평행뜻];
    case 4:
      return [평행선거리];
    case 5:
      return lv === '하' ? [고르기('사다리꼴'), 뜻] : [고르기('사다리꼴'), 평행변수];
    case 6:
      return lv === '하' ? [고르기('평행사변형'), 평행사변형성질] : [평행사변형성질, 고르기('평행사변형')];
    case 7:
      return lv === '하' ? [고르기('마름모'), 마름모성질] : [마름모성질, 고르기('마름모')];
    case 8:
      return lv === '하' ? [뜻, 직사각형정사각형] : [고르기('직사각형'), 직사각형정사각형, 뜻];
    default:
      return null;
  }
};
