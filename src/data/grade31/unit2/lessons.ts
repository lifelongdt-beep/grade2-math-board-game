import type { Difficulty, FigureSetVisual, LineFigureVisual } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { eun, pick, rand } from '../../grade5/util';
import { makeShape, rightAngles, type Pt, type ShapeKind } from './shapes';

// ════════════════════════════════════════════════════════════════════
// 3-1 2단원 평면도형 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례(앱 차시):
//   1 단원 도입(곧은 선과 굽은 선, 여러 가지 평면도형)
//   2 선분, 직선, 반직선 (지도서 2~3차시를 한 차시로)
//   3 각   4 직각   5 직각삼각형   6 직사각형   7 정사각형
//
// 지도서가 못박은 것:
//   · "직사각형과 정사각형의 포함 관계는 다루지 않도록 한다."
//     그래서 직사각형을 고르는 문항에는 정사각형을 보기로 넣지 않고,
//     '정사각형은 직사각형이다' 같은 말도 쓰지 않습니다.
//   · 반직선은 시작점이 중요합니다. 반직선 ㄱㄴ과 반직선 ㄴㄱ은 다른
//     도형입니다. 선분과 직선은 두 점의 차례를 바꾸어 불러도 같습니다.
//     그래서 선분·직선의 이름을 묻는 문항에서 차례만 바꾼 이름은 오답
//     보기로 쓰지 않습니다(그것도 정답이기 때문입니다).
//   · 각의 이름은 꼭짓점을 가운데에 씁니다(각 ㄱㄴㄷ 또는 각 ㄷㄴㄱ).
//   · 3학년에서는 각도(°)와 예각·둔각을 배우지 않습니다. 직각은
//     삼각자의 직각 부분이나 종이를 두 번 접어 만든 직각에 대어 봅니다.
// ════════════════════════════════════════════════════════════════════

const 자음 = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ'];
const 기호 = ['가', '나', '다', '라'];

/** 서로 다른 자음 n개를 고릅니다(차례대로 이어진 것을 씁니다 — 교과서도 그렇습니다). */
const 자음들 = (n: number, seed: number) => {
  const start = Math.abs(seed) % (자음.length - n + 1);
  return 자음.slice(start, start + n);
};

const 섞기 = <T,>(items: T[], seed: number): T[] => {
  const copy = [...items];
  const next = rand(seed);
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = next(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ── 그림 ────────────────────────────────────────────────────────────
type 선꼴 = 'segment' | 'line' | 'ray' | 'curve' | 'angle' | 'polyline';

const 선이름: Record<'segment' | 'line' | 'ray', string> = { segment: '선분', line: '직선', ray: '반직선' };

// 두 점의 자리입니다. 기울기를 바꾸어 가며 씁니다 — 늘 가로로만 그리면
// '가로로 놓인 것만 선분'이라고 여기게 됩니다.
// 두 점 사이를 넉넉히 벌려 둡니다. 직선과 반직선은 점 밖으로 더 늘여
// 그리므로, 점을 칸 끝에 두면 늘인 부분이 보이지 않습니다.
const 두점자리: Array<[Pt, Pt]> = [
  [[-0.6, 0.1], [0.6, 0.1]],
  [[-0.55, 0.4], [0.55, -0.3]],
  [[-0.55, -0.3], [0.55, 0.4]],
  [[-0.6, 0.35], [0.6, -0.15]],
];

const 선그림 = (꼴: 선꼴, seed: number, labels?: string[]): LineFigureVisual['items'][number] => {
  const [a, b] = 두점자리[Math.abs(seed) % 두점자리.length];
  if (꼴 === 'curve') {
    return { shape: 'curve', points: [[-0.7, 0.3], [-0.25, -0.5], [0.2, 0.45], [0.7, -0.3]] };
  }
  if (꼴 === 'polyline') {
    return { shape: 'polyline', points: [[-0.7, 0.3], [-0.25, -0.35], [0.2, 0.35], [0.7, -0.3]] };
  }
  if (꼴 === 'angle') {
    return { shape: 'angle', points: [[-0.35, -0.55], [-0.55, 0.45], [0.6, 0.45]], labels };
  }
  return { shape: 꼴, points: [a, b], labels };
};

const 선그림판 = (label: string, items: LineFigureVisual['items']): LineFigureVisual => ({
  kind: 'line-figure',
  label,
  items,
});

// 도형 그림입니다. 꼭짓점은 shapes.ts가 계산한 것을 그대로 씁니다.
const 도형그림판 = (label: string, shapes: Array<{ name?: string; kind: ShapeKind; points: Pt[] }>): FigureSetVisual => ({
  kind: 'figure-set',
  label,
  items: shapes.map((one) => ({
    name: one.name,
    shape: one.points.length === 3 ? '직각삼각형' : '사각형',
    points: one.points,
  })),
});

// 각이 직각인지 견주는 그림입니다. 꼭짓점을 아래 왼쪽에 두고 두 변을
// 벌립니다. 직각이 아닌 각은 직각에서 25° 넘게 떨어지게 둡니다.
const 각그림 = (도: number, 돌림: number): LineFigureVisual['items'][number] => {
  const r = (d: number) => (d * Math.PI) / 180;
  const 시작 = r(돌림);
  const 끝 = r(돌림 + 도);
  const arm = 1;
  const raw: Pt[] = [
    [Math.cos(시작) * arm, -Math.sin(시작) * arm],
    [0, 0],
    [Math.cos(끝) * arm, -Math.sin(끝) * arm],
  ];
  // 칸 가운데에 오도록 옮기고, 가장 먼 점이 0.8에 오도록 키웁니다.
  // 늘 같은 자리에 꼭짓점을 두면 큰 각은 칸 밖으로 나가고 작은 각은 작아집니다.
  const xs = raw.map(([x]) => x);
  const ys = raw.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const half = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 || 1;
  return {
    shape: 'angle',
    points: raw.map(([x, y]) => [((x - cx) / half) * 0.8, ((y - cy) / half) * 0.8] as Pt),
  };
};

// ── 도입: 곧은 선과 굽은 선, 2학년에서 배운 도형 ────────────────────
const 굽은선문항: G5Family = {
  id: 'curve-pick',
  make: (seed) => {
    const next = rand(seed);
    const 굽은것찾기 = next(2) === 0;
    const 정답자리 = next(4);
    const 꼴들: 선꼴[] = [0, 1, 2, 3].map((at) => {
      const 정답 = at === 정답자리;
      if (굽은것찾기) return 정답 ? 'curve' : (['segment', 'polyline', 'segment'] as 선꼴[])[at % 3];
      return 정답 ? 'segment' : 'curve';
    });
    // 곧은 선을 찾을 때 굽은 선은 모양을 조금씩 다르게 그립니다.
    const items = 꼴들.map((꼴, at) => {
      const one = 선그림(꼴, seed + at);
      if (꼴 === 'curve') {
        one.points = one.points.map(([x, y]) => [x, y * (0.6 + at * 0.15) * (at % 2 ? -1 : 1)] as Pt);
      }
      if (꼴 === 'segment') one.labels = ['', ''];
      return { ...one, name: 기호[at] };
    });
    const answer = 기호[정답자리];
    return {
      prompt: 굽은것찾기 ? '그림에서 굽은 선은 어느 것일까요?' : '그림에서 곧은 선은 어느 것일까요?',
      answer,
      wrongs: 기호.filter((one) => one !== answer),
      tag: 'shape',
      concept: '곧은 선은 쭉 곧게 뻗은 선이고, 굽은 선은 구부러진 선입니다.',
      strategy: '곧은 선과 굽은 선 구별하기',
      hint: 굽은것찾기
        ? '선을 손가락으로 따라가 보세요. 구부러지는 곳이 있는 선을 찾으세요. 꺾인 선은 곧은 선을 이은 것입니다.'
        : '자를 대어 보았을 때 선 전체가 자에 딱 붙는 선을 찾으세요.',
      steps: [
        굽은것찾기 ? '구부러진 곳이 있는 선이 굽은 선입니다.' : '쭉 곧게 뻗은 선이 곧은 선입니다.',
        `그러므로 ${굽은것찾기 ? '굽은 선' : '곧은 선'}은 ${answer}입니다.`,
      ],
      misconceptionTip: '꺾인 선은 굽은 선이 아닙니다. 곧은 선 여러 개가 이어진 것입니다.',
      visual: 선그림판('곧은 선과 굽은 선', items),
    };
  },
};

const 도형수세기문항: G5Family = {
  id: 'review-count',
  make: (seed) => {
    const next = rand(seed);
    const 도형 = pick([
      { 이름: '삼각형', 변: 3, 꼭짓점: 3 },
      { 이름: '사각형', 변: 4, 꼭짓점: 4 },
      { 이름: '오각형', 변: 5, 꼭짓점: 5 },
      { 이름: '육각형', 변: 6, 꼭짓점: 6 },
      { 이름: '원', 변: 0, 꼭짓점: 0 },
    ], next(99));
    const 무엇 = 도형.이름 === '원' ? '꼭짓점' : pick(['변', '꼭짓점'], next(9));
    const value = 무엇 === '변' ? 도형.변 : 도형.꼭짓점;
    return {
      prompt: `${도형.이름}의 ${무엇}은 모두 몇 개일까요?`,
      answer: `${value}개`,
      wrongs: [0, 1, 2, 3, 4, 5, 6, 8].filter((v) => v !== value).slice(0, 5).map((v) => `${v}개`),
      tag: 'shape',
      concept: '도형을 둘러싼 곧은 선이 변이고, 두 변이 만나는 점이 꼭짓점입니다. 원은 굽은 선으로만 둘러싸여 있어 변도 꼭짓점도 없습니다.',
      strategy: '2학년에서 배운 도형의 변과 꼭짓점 떠올리기',
      hint: 도형.이름 === '원'
        ? '원을 둘러싼 선이 곧은 선인지 굽은 선인지 생각해 보세요. 곧은 선이 만나는 곳이 있나요?'
        : `${도형.이름}의 이름에 든 수를 떠올려 보세요. 변과 꼭짓점을 하나씩 세어 보아도 됩니다.`,
      steps: [
        도형.이름 === '원'
          ? '원은 굽은 선으로 둘러싸여 있어서 곧은 선이 만나는 점이 없습니다.'
          : `${eun(도형.이름)} 변이 ${도형.변}개, 꼭짓점이 ${도형.꼭짓점}개입니다.`,
        `그러므로 ${도형.이름}의 ${무엇}은 ${value}개입니다.`,
      ],
      misconceptionTip: '원을 그릴 때 시작한 곳을 꼭짓점이라고 여기면 안 됩니다. 원에는 꼭짓점이 없습니다.',
    };
  },
};

const 도형찾기문항: G5Family = {
  id: 'review-pick',
  make: (seed) => {
    const next = rand(seed);
    const 찾기 = pick(['삼각형', '사각형', '원'] as const, next(99));
    const 모양들 = 섞기<'삼각형' | '사각형' | '원' | '오각형'>(['삼각형', '사각형', '원', '오각형'], seed);
    const items: FigureSetVisual['items'] = 모양들.map((one, at) => {
      if (one === '원') return { name: 기호[at], shape: '원' };
      if (one === '오각형') return { name: 기호[at], shape: '정오각형' };
      if (one === '삼각형') return { name: 기호[at], shape: '직각삼각형', points: makeShape(next(2) ? 'acute-triangle' : 'obtuse-triangle', seed + at).points };
      return { name: 기호[at], shape: '사각형', points: makeShape('quad', seed + at).points };
    });
    const answer = 기호[모양들.indexOf(찾기)];
    return {
      prompt: `${eun(찾기)} 어느 것일까요?`,
      answer,
      wrongs: 기호.filter((one) => one !== answer),
      tag: 'shape',
      concept: '삼각형은 곧은 선 3개, 사각형은 곧은 선 4개로 둘러싸인 도형이고, 원은 굽은 선으로 둘러싸인 동그란 도형입니다.',
      strategy: '여러 가지 평면도형 찾기',
      hint: 찾기 === '원' ? '굽은 선으로 둘러싸인 도형을 찾으세요.' : '도형을 둘러싼 곧은 선이 몇 개인지 세어 보세요.',
      steps: [찾기 === '원' ? '굽은 선으로 둘러싸인 동그란 도형이 원입니다.' : `곧은 선 ${찾기 === '삼각형' ? 3 : 4}개로 둘러싸인 도형이 ${찾기}입니다.`, `그러므로 ${eun(찾기)} ${answer}입니다.`],
      misconceptionTip: '도형이 기울어져 있어도 이름은 바뀌지 않습니다. 변의 수를 세어 보세요.',
      visual: { kind: 'figure-set', label: '여러 가지 도형', items },
    };
  },
};

// ── 선분, 직선, 반직선 ──────────────────────────────────────────────
const 선이름문항: G5Family = {
  id: 'line-name',
  make: (seed) => {
    const next = rand(seed);
    const 꼴 = pick(['segment', 'line', 'ray', 'ray'] as const, next(99));
    const [p, q] = 자음들(2, next(99));
    // 반직선은 시작점을 바꾸어 그리기도 합니다(반직선 ㄴㄱ).
    const 거꾸로 = 꼴 === 'ray' && next(2) === 0;
    const [시작, 지남] = 거꾸로 ? [q, p] : [p, q];
    const item = 선그림(꼴, next(9), [p, q]);
    if (거꾸로) item.points = [item.points[1], item.points[0]];
    if (거꾸로) item.labels = [q, p];
    const answer = `${선이름[꼴]} ${시작}${지남}`;
    // 선분·직선은 차례를 바꾸어도 같은 이름이므로 오답에서 뺍니다.
    const 모든이름 = [
      `선분 ${p}${q}`, `직선 ${p}${q}`, `반직선 ${p}${q}`, `반직선 ${q}${p}`,
    ];
    const wrongs = 모든이름.filter((one) => one !== answer);
    return {
      prompt: '그림과 같은 도형의 이름은 무엇일까요?',
      answer,
      wrongs,
      tag: 'shape',
      concept: '선분은 두 점을 곧게 이은 선, 직선은 선분을 양쪽으로 끝없이 늘인 곧은 선, 반직선은 한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선입니다.',
      strategy: '선분, 직선, 반직선의 이름 알기',
      hint: '선이 점에서 끝나는지, 점을 지나 계속 늘어나는지 양쪽 끝을 하나씩 보세요. 반직선은 어느 점에서 시작하는지가 이름의 첫 글자입니다.',
      steps: 꼴 === 'segment'
        ? [`점 ${p}과 점 ${q} 사이에서 끝나는 곧은 선입니다.`, `그러므로 ${answer}(또는 선분 ${q}${p})입니다.`]
        : 꼴 === 'line'
          ? [`점 ${p}과 점 ${q}을 지나 양쪽으로 끝없이 늘어나는 곧은 선입니다.`, `그러므로 ${answer}(또는 직선 ${q}${p})입니다.`]
          : [`점 ${시작}에서 시작하여 점 ${지남}을 지나 한쪽으로 끝없이 늘어나는 곧은 선입니다.`, `시작하는 점을 먼저 읽으므로 ${answer}입니다.`],
      misconceptionTip: '반직선은 시작하는 점을 먼저 읽습니다. 반직선 ㄱㄴ과 반직선 ㄴㄱ은 다른 도형입니다.',
      selfCheck: '선의 양쪽 끝을 모두 확인했나요?',
      visual: 선그림판('도형', [item]),
    };
  },
};

const 선고르기문항: G5Family = {
  id: 'line-pick',
  make: (seed) => {
    const next = rand(seed);
    const 찾을것 = pick(['segment', 'line', 'ray'] as const, next(99));
    const 꼴들 = 섞기<선꼴>(['segment', 'line', 'ray', 'curve'], seed);
    const items = 꼴들.map((꼴, at) => ({ ...선그림(꼴, seed + at, 꼴 === 'curve' ? undefined : ['', '']), name: 기호[at] }));
    const answer = 기호[꼴들.indexOf(찾을것)];
    const 뜻: Record<typeof 찾을것, string> = {
      segment: '두 점을 곧게 이은 선',
      line: '선분을 양쪽으로 끝없이 늘인 곧은 선',
      ray: '한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선',
    };
    return {
      prompt: `${선이름[찾을것]}은 어느 것일까요?`,
      answer,
      wrongs: 기호.filter((one) => one !== answer),
      tag: 'shape',
      concept: `${eun(선이름[찾을것])} ${뜻[찾을것]}입니다.`,
      strategy: '선분, 직선, 반직선 구별하기',
      hint: '선의 양쪽 끝을 보세요. 점에서 끝나는 쪽이 몇 군데인지 세면 구별할 수 있습니다.',
      steps: [
        '선분은 양쪽 끝이 모두 점에서 끝납니다.',
        '반직선은 한쪽만 점에서 시작하고 다른 쪽은 늘어납니다.',
        '직선은 양쪽으로 모두 늘어납니다.',
        `그러므로 ${선이름[찾을것]}은 ${answer}입니다.`,
      ],
      misconceptionTip: '선의 길이로 구별하지 않습니다. 끝이 점에서 멈추는지 계속 늘어나는지로 구별합니다.',
      visual: 선그림판('선분, 직선, 반직선, 굽은 선', items),
    };
  },
};

const 선뜻문항: G5Family = {
  id: 'line-meaning',
  make: (seed) => {
    const 뜻들 = [
      { 뜻: '두 점을 곧게 이은 선', 이름: '선분' },
      { 뜻: '선분을 양쪽으로 끝없이 늘인 곧은 선', 이름: '직선' },
      { 뜻: '한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선', 이름: '반직선' },
    ];
    const one = pick(뜻들, seed);
    return {
      prompt: `${one.뜻}을 무엇이라고 할까요?`,
      answer: one.이름,
      wrongs: ['선분', '직선', '반직선', '굽은 선'].filter((name) => name !== one.이름),
      tag: 'shape',
      concept: '선분, 직선, 반직선은 모두 곧은 선입니다. 끝이 어디에 있는지가 다릅니다.',
      strategy: '선분, 직선, 반직선의 뜻 알기',
      hint: '끝이 몇 개 있는지 생각해 보세요. 두 끝이 모두 있는지, 한 끝만 있는지, 끝이 없는지가 이름을 정합니다.',
      steps: [`${one.뜻}을 ${one.이름}이라고 합니다.`, `그러므로 ${one.이름}입니다.`],
      misconceptionTip: '직선과 반직선은 끝없이 늘인 선이라 끝까지 다 그릴 수 없습니다. 그림은 그중 일부만 그린 것입니다.',
    };
  },
};

const 같은이름문항: G5Family = {
  id: 'same-name',
  make: (seed) => {
    const next = rand(seed);
    const [p, q] = 자음들(2, next(99));
    const 꼴 = pick(['segment', 'line'] as const, next(9));
    const answer = `${선이름[꼴]} ${q}${p}`;
    const 다른 = 꼴 === 'segment' ? '직선' : '선분';
    return {
      prompt: `${선이름[꼴]} ${p}${q}과 같은 도형을 나타내는 이름은 어느 것일까요?`,
      answer,
      wrongs: [`반직선 ${p}${q}`, `반직선 ${q}${p}`, `${다른} ${p}${q}`],
      tag: 'shape',
      concept: '선분과 직선은 두 점의 차례를 바꾸어 불러도 같은 도형입니다. 반직선은 시작점이 정해져 있어서 차례를 바꾸면 다른 도형이 됩니다.',
      strategy: '선분과 직선의 두 가지 이름 알기',
      hint: `${선이름[꼴]}에는 시작하는 점이 따로 정해져 있나요? 정해져 있지 않다면 두 점을 어느 차례로 읽어도 됩니다.`,
      steps: [
        `${선이름[꼴]}은 두 점 ${p}, ${q} 가운데 어느 점을 먼저 읽어도 같은 도형입니다.`,
        `그러므로 ${선이름[꼴]} ${p}${q}은 ${answer}이라고도 합니다.`,
      ],
      misconceptionTip: '반직선은 차례를 바꾸면 다른 도형입니다. 반직선 ㄱㄴ은 점 ㄱ에서, 반직선 ㄴㄱ은 점 ㄴ에서 시작합니다.',
    };
  },
};

const 반직선다름문항: G5Family = {
  id: 'ray-diff',
  make: (seed) => {
    const [p, q] = 자음들(2, seed);
    return {
      prompt: `반직선 ${p}${q}과 반직선 ${q}${p}에 대한 설명으로 알맞은 것은 어느 것일까요?`,
      answer: '시작하는 점과 늘어나는 쪽이 달라서 서로 다른 도형입니다.',
      wrongs: [
        '두 점이 같으므로 같은 도형입니다.',
        '길이가 같으므로 같은 도형입니다.',
        '둘 다 양쪽으로 끝없이 늘인 곧은 선입니다.',
      ],
      tag: 'shape',
      concept: '반직선은 한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선입니다. 이름의 첫 글자가 시작하는 점입니다.',
      strategy: '반직선의 시작점 알기',
      hint: `반직선 ${p}${q}은 어느 점에서 시작하나요? 반직선 ${q}${p}은요? 각각 어느 쪽으로 늘어나는지 그려 보세요.`,
      steps: [
        `반직선 ${p}${q}은 점 ${p}에서 시작하여 점 ${q}을 지나 늘어납니다.`,
        `반직선 ${q}${p}은 점 ${q}에서 시작하여 점 ${p}을 지나 늘어납니다.`,
        '시작하는 점과 늘어나는 쪽이 달라서 서로 다른 도형입니다.',
      ],
      misconceptionTip: '같은 두 점을 쓴다고 같은 반직선이 아닙니다. 시작하는 점이 다르면 다른 반직선입니다.',
    };
  },
};

// 점 여러 개 가운데 두 점을 이어 그을 수 있는 선분의 수 (지도서 2~3차시 활동)
const 선분세기문항: G5Family = {
  id: 'count-segments',
  make: (seed) => {
    const next = rand(seed);
    const n = 3 + next(2); // 3개 또는 4개 (세 점이 한 줄에 있지 않게 둡니다)
    const 자리들: Pt[][] = [
      [[0, -0.6], [-0.6, 0.45], [0.6, 0.45]],
      [[-0.55, -0.45], [0.55, -0.45], [0.55, 0.45], [-0.55, 0.45]],
    ];
    const points = 자리들[n - 3];
    const labels = 자음들(n, next(9));
    const answer = (n * (n - 1)) / 2;
    const 짝들: string[] = [];
    for (let i = 0; i < n; i += 1) for (let j = i + 1; j < n; j += 1) 짝들.push(`선분 ${labels[i]}${labels[j]}`);
    return {
      prompt: `점 ${n}개 가운데 두 점을 이어 그을 수 있는 선분은 모두 몇 개일까요?`,
      answer: `${answer}개`,
      wrongs: [`${n}개`, `${n * (n - 1)}개`, `${answer + 1}개`, `${n - 1}개`].filter((w) => w !== `${answer}개`),
      tag: 'shape',
      concept: '선분은 두 점을 곧게 이은 선입니다. 선분 ㄱㄴ과 선분 ㄴㄱ은 같은 선분입니다.',
      strategy: '두 점을 이은 선분의 개수 세기',
      hint: '한 점에서 다른 점으로 그을 수 있는 선분을 빠짐없이 세어 보세요. 이미 그은 선분을 거꾸로 또 세지 않게 조심하세요.',
      steps: [`그을 수 있는 선분은 ${짝들.join(', ')}입니다.`, `모두 ${answer}개입니다.`],
      misconceptionTip: '선분 ㄱㄴ과 선분 ㄴㄱ은 같은 선분입니다. 두 번 세면 안 됩니다.',
      visual: 선그림판(`점 ${n}개`, [{ shape: 'dots', points, labels }]),
    };
  },
};

// ── 각 ──────────────────────────────────────────────────────────────
const 각이름문항: G5Family = {
  id: 'angle-name',
  make: (seed) => {
    const next = rand(seed);
    const [a, v, b] = 자음들(3, next(99));
    // 꼭짓점 이름을 가운데 글자가 아닌 것으로도 둡니다. 늘 'ㄴ'이 꼭짓점이면
    // 자리로 외워 버립니다.
    const 바꿈 = next(3);
    const names = 바꿈 === 0 ? [a, v, b] : 바꿈 === 1 ? [v, a, b] : [a, b, v];
    const [p0, vertex, p2] = names;
    const answer = `각 ${p0}${vertex}${p2}`;
    const wrongs = [
      `각 ${vertex}${p0}${p2}`,
      `각 ${p0}${p2}${vertex}`,
      `각 ${vertex}${p2}${p0}`,
      `각 ${p2}${p0}${vertex}`,
    ];
    const item = 선그림('angle', 0, [p0, vertex, p2]);
    return {
      prompt: '그림의 각을 바르게 읽은 것은 어느 것일까요?',
      answer,
      wrongs,
      tag: 'shape',
      concept: '각을 읽을 때는 꼭짓점을 가운데에 읽습니다. 각 ㄱㄴㄷ에서 꼭짓점은 점 ㄴ입니다.',
      strategy: '각의 이름 읽기',
      hint: '두 반직선이 만나는 점, 꼭짓점이 어느 점인지 먼저 찾으세요. 꼭짓점은 이름의 가운데에 씁니다.',
      steps: [
        `두 반직선이 만나는 꼭짓점은 점 ${vertex}입니다.`,
        `꼭짓점을 가운데에 두고 읽으면 ${answer} 또는 각 ${p2}${vertex}${p0}입니다.`,
      ],
      misconceptionTip: '각의 이름을 왼쪽부터 차례로 읽으면 안 됩니다. 꼭짓점이 가운데에 와야 합니다.',
      visual: 선그림판('각', [item]),
    };
  },
};

const 각부분문항: G5Family = {
  id: 'angle-parts',
  make: (seed) => {
    const next = rand(seed);
    const [p0, vertex, p2] = 자음들(3, next(99));
    const 무엇 = next(2) === 0 ? '꼭짓점' : '변';
    const item = 선그림('angle', 0, [p0, vertex, p2]);
    if (무엇 === '꼭짓점') {
      return {
        prompt: `각 ${p0}${vertex}${p2}의 꼭짓점은 어느 것일까요?`,
        answer: `점 ${vertex}`,
        wrongs: [`점 ${p0}`, `점 ${p2}`, `변 ${vertex}${p0}`],
        tag: 'shape',
        concept: '각은 한 점에서 그은 두 반직선으로 이루어진 도형이고, 그 한 점을 각의 꼭짓점이라고 합니다.',
        strategy: '각의 꼭짓점 알기',
        hint: '두 반직선이 시작하는 점을 찾으세요. 각의 이름에서는 가운데 글자입니다.',
        steps: [`각 ${p0}${vertex}${p2}의 가운데 글자는 ${vertex}입니다.`, `두 반직선이 만나는 점 ${vertex}이 꼭짓점입니다.`],
        misconceptionTip: '각의 이름 첫 글자가 꼭짓점이 아닙니다. 가운데 글자가 꼭짓점입니다.',
        visual: 선그림판('각', [item]),
      };
    }
    return {
      prompt: `각 ${p0}${vertex}${p2}의 변을 바르게 나타낸 것은 어느 것일까요?`,
      answer: `변 ${vertex}${p0}과 변 ${vertex}${p2}`,
      wrongs: [`변 ${p0}${p2}과 변 ${vertex}${p0}`, `변 ${p0}${p2}`, `점 ${p0}과 점 ${p2}`],
      tag: 'shape',
      concept: '각을 이루는 두 반직선을 각의 변이라고 합니다. 변은 꼭짓점에서 시작하므로 꼭짓점을 먼저 읽습니다.',
      strategy: '각의 변 알기',
      hint: '꼭짓점에서 시작하는 두 반직선을 찾으세요. 두 변 모두 꼭짓점에서 시작합니다.',
      steps: [
        `꼭짓점은 점 ${vertex}입니다.`,
        `꼭짓점에서 시작하는 두 반직선이 변이므로 변 ${vertex}${p0}과 변 ${vertex}${p2}입니다.`,
      ],
      misconceptionTip: `점 ${p0}과 점 ${p2}을 잇는 선은 각의 변이 아닙니다. 변은 꼭짓점에서 시작합니다.`,
      visual: 선그림판('각', [item]),
    };
  },
};

const 각고르기문항: G5Family = {
  id: 'angle-pick',
  make: (seed) => {
    const 꼴들 = 섞기<선꼴>(['angle', 'line', 'ray', 'curve'], seed);
    const items = 꼴들.map((꼴, at) => {
      const one = 꼴 === 'angle' ? 선그림('angle', 0, ['', '', '']) : 선그림(꼴, seed + at, 꼴 === 'curve' ? undefined : ['', '']);
      return { ...one, name: 기호[at] };
    });
    const answer = 기호[꼴들.indexOf('angle')];
    return {
      prompt: '각은 어느 것일까요?',
      answer,
      wrongs: 기호.filter((one) => one !== answer),
      tag: 'shape',
      concept: '한 점에서 그은 두 반직선으로 이루어진 도형을 각이라고 합니다.',
      strategy: '각 알아보기',
      hint: '반직선이 몇 개인지, 그 반직선들이 한 점에서 시작하는지 보세요.',
      steps: ['각은 한 점에서 그은 두 반직선으로 이루어진 도형입니다.', `그러므로 각은 ${answer}입니다.`],
      misconceptionTip: '곧은 선 하나만으로는 각이 되지 않습니다. 한 점에서 시작하는 반직선이 두 개 있어야 합니다.',
      visual: 선그림판('여러 가지 도형', items),
    };
  },
};

const 다각형: Array<{ 이름: string; 수: number; shape: 'square' | '정오각형' | '정육각형' | 'triangle' }> = [
  { 이름: '삼각형', 수: 3, shape: 'triangle' },
  { 이름: '사각형', 수: 4, shape: 'square' },
  { 이름: '오각형', 수: 5, shape: '정오각형' },
  { 이름: '육각형', 수: 6, shape: '정육각형' },
];

const 각세기문항: G5Family = {
  id: 'angle-count',
  make: (seed) => {
    const next = rand(seed);
    const one = pick(다각형, next(99));
    const visual: FigureSetVisual = {
      kind: 'figure-set',
      label: one.이름,
      items: [one.shape === 'triangle'
        ? { shape: '직각삼각형', points: makeShape('acute-triangle', seed).points }
        : one.shape === 'square'
          ? { shape: '사각형', points: makeShape('quad', seed).points }
          : { shape: one.shape }],
    };
    return {
      prompt: '도형에서 찾을 수 있는 각은 모두 몇 개일까요?',
      answer: `${one.수}개`,
      wrongs: [`${one.수 - 1}개`, `${one.수 + 1}개`, `${one.수 * 2}개`, '0개'],
      tag: 'shape',
      concept: '도형의 꼭짓점마다 두 변이 만나 각이 하나씩 생깁니다.',
      strategy: '도형에서 각 찾기',
      hint: '두 변이 만나는 꼭짓점에 하나씩 표시하며 세어 보세요.',
      steps: [`이 도형은 ${one.이름}이고 꼭짓점이 ${one.수}개입니다.`, `꼭짓점마다 각이 하나씩 있으므로 각은 모두 ${one.수}개입니다.`],
      misconceptionTip: '도형의 안쪽에 있는 각만 셉니다. 같은 꼭짓점을 두 번 세지 마세요.',
      visual,
    };
  },
};

const 각더하기문항: G5Family = {
  id: 'angle-sum',
  make: (seed) => {
    const next = rand(seed);
    const a = 다각형[next(4)];
    let b = 다각형[next(4)];
    if (b === a) b = 다각형[(다각형.indexOf(a) + 1) % 4];
    const sum = a.수 + b.수;
    return {
      prompt: `${a.이름}과 ${b.이름}에 있는 각은 모두 몇 개일까요?`,
      answer: `${sum}개`,
      wrongs: [`${sum - 1}개`, `${sum + 1}개`, `${sum + 2}개`, `${a.수 * b.수}개`].filter((w) => w !== `${sum}개`),
      tag: 'shape',
      concept: '도형의 꼭짓점의 수만큼 각이 있습니다. 삼각형은 3개, 사각형은 4개입니다.',
      strategy: '여러 도형의 각의 수 구하기',
      hint: '두 도형에 꼭짓점이 각각 몇 개 있는지 떠올려 더해 보세요.',
      steps: [
        `${eun(a.이름)} 각이 ${a.수}개, ${eun(b.이름)} 각이 ${b.수}개입니다.`,
        `${a.수}+${b.수}=${sum}이므로 각은 모두 ${sum}개입니다.`,
      ],
      misconceptionTip: '변의 수와 각의 수를 헷갈리지 마세요. 이 도형들은 변의 수와 꼭짓점의 수가 같습니다.',
    };
  },
};

// ── 직각 ────────────────────────────────────────────────────────────
const 직각고르기문항: G5Family = {
  id: 'right-pick',
  make: (seed) => {
    const next = rand(seed);
    // 직각이 아닌 각은 직각보다 25° 넘게 작거나 큽니다.
    const 다른각 = 섞기([45, 55, 60, 120, 130, 140], seed).slice(0, 3);
    const 각들 = 섞기([90, ...다른각], seed + 1);
    const items = 각들.map((도, at) => ({ ...각그림(도, (next(4) - 1) * 10), name: 기호[at] }));
    const answer = 기호[각들.indexOf(90)];
    return {
      prompt: '직각은 어느 것일까요?',
      answer,
      wrongs: 기호.filter((one) => one !== answer),
      tag: 'shape',
      concept: '종이를 반듯하게 두 번 접었을 때 생기는 각을 직각이라고 합니다. 삼각자의 직각 부분을 대어 꼭 맞으면 직각입니다.',
      strategy: '직각 알아보기',
      hint: '삼각자의 직각 부분을 각의 꼭짓점에 맞추고 한 변을 겹쳐 보세요. 다른 변도 꼭 맞는 각을 찾으세요.',
      steps: ['삼각자의 직각 부분을 대어 봅니다.', `두 변이 모두 꼭 맞는 각은 ${answer}입니다.`],
      misconceptionTip: '변이 가로와 세로로 놓여 있어야 직각인 것은 아닙니다. 기울어져 있어도 삼각자의 직각 부분에 꼭 맞으면 직각입니다.',
      visual: 선그림판('여러 가지 각', items),
    };
  },
};

const 직각세기종류: ShapeKind[] = ['right-triangle', 'rectangle', 'right-trapezoid', 'one-right-quad', 'parallelogram', 'quad', 'acute-triangle', 'obtuse-triangle'];

const 직각세기문항: G5Family = {
  id: 'right-count',
  make: (seed) => {
    const kind = 직각세기종류[Math.abs(seed) % 직각세기종류.length];
    const shape = makeShape(kind, seed);
    const count = rightAngles(shape.points);
    return {
      prompt: '도형에서 직각은 모두 몇 개일까요?',
      answer: `${count}개`,
      wrongs: [0, 1, 2, 3, 4].filter((v) => v !== count).map((v) => `${v}개`),
      tag: 'shape',
      concept: '삼각자의 직각 부분을 대어 꼭 맞는 각이 직각입니다.',
      strategy: '도형에서 직각 찾기',
      hint: '꼭짓점마다 삼각자의 직각 부분을 대어 보세요. 꼭 맞는 꼭짓점에 표시하며 세면 빠뜨리지 않습니다.',
      steps: [
        `꼭짓점 ${shape.points.length}개에 삼각자의 직각 부분을 하나씩 대어 봅니다.`,
        `꼭 맞는 각은 ${count}개이므로 직각은 모두 ${count}개입니다.`,
      ],
      misconceptionTip: '도형이 기울어져 있어도 각의 크기는 그대로입니다. 꼭짓점마다 직접 대어 보세요.',
      visual: 도형그림판('도형', [shape]),
    };
  },
};

const 시계직각문항: G5Family = {
  id: 'clock-right',
  make: (seed) => {
    const answer = pick(['3시', '9시'], seed);
    return {
      prompt: '시계의 긴바늘과 짧은바늘이 이루는 각이 직각인 시각은 어느 것일까요?',
      answer,
      wrongs: ['6시', '12시', '1시', '5시'],
      tag: 'shape',
      concept: '두 바늘이 이루는 각이 삼각자의 직각 부분과 꼭 맞으면 직각입니다.',
      strategy: '생활에서 직각 찾기',
      hint: '정각에는 긴바늘이 12를 가리킵니다. 짧은바늘이 12에서 시계 둘레의 4분의 1만큼 떨어진 시각을 찾아보세요.',
      steps: [
        '정각에는 긴바늘이 12를 가리킵니다.',
        `${answer}에는 짧은바늘이 ${answer === '3시' ? '3' : '9'}을 가리키므로 두 바늘이 직각을 이룹니다.`,
        `그러므로 ${answer}입니다.`,
      ],
      misconceptionTip: '6시에는 두 바늘이 한 줄로 곧게 놓여 직각이 아닙니다.',
    };
  },
};

const 직각뜻문항: G5Family = {
  id: 'right-meaning',
  make: (seed) => {
    const one = pick([
      { prompt: '종이를 반듯하게 두 번 접었다가 펼쳤을 때 접힌 선이 만나 생기는 각을 무엇이라고 할까요?', answer: '직각', wrongs: ['꼭짓점', '반직선', '선분'] },
      { prompt: '어떤 각이 직각인지 알아볼 때 대어 보는 도구로 알맞은 것은 어느 것일까요?', answer: '삼각자의 직각 부분', wrongs: ['줄자의 눈금', '시계의 숫자', '자의 끝'] },
    ], seed);
    return {
      prompt: one.prompt,
      answer: one.answer,
      wrongs: one.wrongs,
      tag: 'shape',
      concept: '종이를 반듯하게 두 번 접었을 때 생기는 각을 직각이라고 합니다. 삼각자에도 직각이 있습니다.',
      strategy: '직각의 뜻 알기',
      hint: '종이를 반듯하게 두 번 접으면 접힌 선이 어떤 모양으로 만나는지 떠올려 보세요.',
      steps: ['종이를 반듯하게 두 번 접어 만든 각과 삼각자의 직각 부분은 꼭 맞습니다.', `그러므로 답은 ${one.answer}입니다.`],
      misconceptionTip: '자의 눈금으로는 직각인지 알 수 없습니다. 직각인 부분을 대어 보아야 합니다.',
    };
  },
};

// ── 도형 고르기(직각삼각형, 직사각형, 정사각형) ─────────────────────
type 고를도형 = 'right-triangle' | 'rectangle' | 'square';

const 비교도형: Record<고를도형, ShapeKind[]> = {
  // 직각삼각형을 고를 때는 다른 삼각형과 견줍니다.
  'right-triangle': ['acute-triangle', 'obtuse-triangle', 'acute-triangle', 'obtuse-triangle'],
  // 직사각형을 고를 때 정사각형은 넣지 않습니다(포함 관계를 다루지 않음).
  rectangle: ['parallelogram', 'right-trapezoid', 'one-right-quad', 'quad'],
  // 정사각형을 고를 때는 '네 각만 직각'인 것과 '네 변만 같은' 것을 함께 둡니다.
  square: ['rectangle', 'kite-like', 'right-trapezoid', 'parallelogram'],
};

const 도형이름: Record<고를도형, string> = { 'right-triangle': '직각삼각형', rectangle: '직사각형', square: '정사각형' };
const 도형뜻: Record<고를도형, string> = {
  'right-triangle': '한 각이 직각인 삼각형',
  rectangle: '네 각이 모두 직각인 사각형',
  square: '네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형',
};

const 도형고르기문항 = (target: 고를도형): G5Family => ({
  id: `pick-${target}`,
  make: (seed) => {
    const others = 섞기(비교도형[target], seed).slice(0, 3);
    const kinds = 섞기<ShapeKind>([target, ...others], seed + 3);
    const shapes = kinds.map((kind, at) => ({ ...makeShape(kind, seed * 7 + at), name: 기호[at] }));
    const answer = 기호[kinds.indexOf(target)];
    return {
      prompt: `${eun(도형이름[target])} 어느 것일까요?`,
      answer,
      wrongs: 기호.filter((one) => one !== answer),
      tag: 'shape',
      concept: `${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`,
      strategy: `${도형이름[target]} 알아보기`,
      hint: target === 'square'
        ? '먼저 네 각이 모두 직각인 사각형을 찾고, 그중에서 네 변의 길이가 모두 같은 것을 찾으세요.'
        : `꼭짓점마다 삼각자의 직각 부분을 대어 보세요. ${target === 'right-triangle' ? '직각이 한 개 있는' : '네 각이 모두 직각인'} 도형을 찾으세요.`,
      steps: [
        `${eun(도형이름[target])} ${도형뜻[target]}입니다.`,
        `조건에 맞는 도형은 ${answer}입니다.`,
      ],
      misconceptionTip: target === 'square'
        ? '네 각이 모두 직각이어도 네 변의 길이가 같지 않으면 정사각형이 아닙니다. 네 변의 길이가 같아도 직각이 없으면 정사각형이 아닙니다.'
        : '도형이 기울어져 있어도 이름은 바뀌지 않습니다. 반듯하게 놓인 것만 찾지 마세요.',
      visual: 도형그림판('여러 가지 도형', shapes),
    };
  },
});

const 도형세기문항 = (target: 고를도형): G5Family => ({
  id: `count-${target}`,
  make: (seed) => {
    const next = rand(seed);
    const 몇개 = 1 + next(3); // 1~3개
    // 직사각형을 셀 때 정사각형은 넣지 않습니다(포함 관계를 다루지 않음).
    const 다른것: ShapeKind[] = target === 'right-triangle'
      ? ['acute-triangle', 'obtuse-triangle', 'quad', 'rectangle']
      : target === 'rectangle'
        ? ['parallelogram', 'right-trapezoid', 'quad', 'right-triangle']
        : ['rectangle', 'kite-like', 'parallelogram', 'right-trapezoid'];
    const kinds = 섞기<ShapeKind>([...Array(몇개).fill(target), ...섞기(다른것, seed).slice(0, 4 - 몇개)], seed + 5);
    const shapes = kinds.map((kind, at) => ({ ...makeShape(kind, seed * 11 + at), name: 기호[at] }));
    const 이름 = 도형이름[target];
    return {
      prompt: `${eun(이름)} 모두 몇 개일까요?`,
      answer: `${몇개}개`,
      wrongs: [0, 1, 2, 3, 4].filter((v) => v !== 몇개).map((v) => `${v}개`),
      tag: 'shape',
      concept: `${도형뜻[target]}을 ${이름}이라고 합니다.`,
      strategy: `${이름} 찾아 세기`,
      hint: target === 'square'
        ? '먼저 네 각이 모두 직각인 사각형을 찾고, 그중에서 네 변의 길이가 모두 같은 것만 세세요.'
        : `도형마다 삼각자의 직각 부분을 대어 보세요. ${target === 'right-triangle' ? '삼각형인지, 직각이 있는지' : '사각형인지, 네 각이 모두 직각인지'} 둘 다 확인하세요.`,
      steps: [
        `${eun(이름)} ${도형뜻[target]}입니다.`,
        `조건에 맞는 것은 ${kinds.map((kind, at) => (kind === target ? 기호[at] : null)).filter(Boolean).join(', ')}이므로 모두 ${몇개}개입니다.`,
      ],
      misconceptionTip: target === 'right-triangle'
        ? '직각이 있어도 사각형이면 직각삼각형이 아닙니다.'
        : target === 'rectangle'
          ? '직각이 한두 개 있는 사각형은 직사각형이 아닙니다. 네 각이 모두 직각이어야 합니다.'
          : '네 변의 길이가 같아도 직각이 없으면 정사각형이 아닙니다.',
      visual: 도형그림판('여러 가지 도형', shapes),
    };
  },
});

// 뜻을 묻는 문항입니다.
//
// 오답은 그 도형에 대해 '틀린' 말이어야 합니다. 정사각형을 묻는데
// '네 각이 모두 직각인 사각형'을 오답으로 두면, 정사각형도 네 각이
// 모두 직각이므로 그 말은 틀리지 않습니다. 답이 둘이 되고, 아이는
// 정사각형에 직각이 없다고 배울 수도 있습니다.
const 틀린뜻: Record<고를도형, string[]> = {
  'right-triangle': ['네 각이 모두 직각인 사각형', '세 각이 모두 직각인 삼각형', '직각이 없는 삼각형', '네 변의 길이가 모두 같은 사각형'],
  rectangle: ['한 각이 직각인 삼각형', '직각이 2개인 사각형', '세 각이 모두 직각인 삼각형', '직각이 없는 사각형'],
  square: ['한 각이 직각인 삼각형', '직각이 2개인 사각형', '세 각이 모두 직각인 삼각형', '직각이 없는 사각형'],
};

const 뜻문항 = (target: 고를도형): G5Family => ({
  id: `meaning-${target}`,
  make: (seed) => {
    const 거꾸로 = Math.abs(seed) % 2 === 1;
    if (거꾸로) {
      // 뜻을 주고 이름을 묻습니다.
      const 이름들 = ['직각삼각형', '직사각형', '정사각형', '삼각형', '사각형'];
      return {
        prompt: `${도형뜻[target]}을 무엇이라고 할까요?`,
        answer: 도형이름[target],
        // 정사각형의 뜻에 '직사각형'을, 직사각형의 뜻에 '정사각형'을 오답으로
        // 두지 않습니다(포함 관계를 다루지 않습니다). 그 대신 조건을 덜 갖춘
        // 이름을 둡니다.
        wrongs: 이름들.filter((one) => one !== 도형이름[target] && !(target !== 'right-triangle' && (one === '직사각형' || one === '정사각형'))).concat(target === 'right-triangle' ? [] : ['직각삼각형', '오각형']),
        tag: 'shape',
        concept: `${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`,
        strategy: `${도형이름[target]}의 뜻 알기`,
        hint: '도형이 삼각형인지 사각형인지 먼저 보고, 직각이 몇 개인지와 변의 길이에 대한 조건을 확인하세요.',
        steps: [`${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`, `그러므로 답은 ${도형이름[target]}입니다.`],
        misconceptionTip: '조건을 하나라도 빠뜨리지 말고 모두 확인하세요.',
      };
    }
    return {
      prompt: `${eun(도형이름[target])} 어떤 도형일까요?`,
      answer: 도형뜻[target],
      wrongs: 틀린뜻[target],
      tag: 'shape',
      concept: `${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`,
      strategy: `${도형이름[target]}의 뜻 알기`,
      hint: '도형의 이름에 무엇이 들어 있는지 보세요. 직각이 몇 개인지, 변의 길이에 조건이 있는지 생각해 보세요.',
      steps: [`${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`, `그러므로 ${eun(도형이름[target])} ${도형뜻[target]}입니다.`],
      misconceptionTip: target === 'square'
        ? '정사각형은 각에 대한 조건과 변의 길이에 대한 조건을 모두 갖추어야 합니다.'
        : '모양을 떠올리지 말고 각과 변에 어떤 조건이 있는지로 말해 보세요.',
    };
  },
});

const 직각수문항 = (target: 고를도형): G5Family => ({
  id: `right-in-${target}`,
  make: () => {
    const count = target === 'right-triangle' ? 1 : 4;
    return {
      prompt: `${도형이름[target]}에서 직각은 몇 개일까요?`,
      answer: `${count}개`,
      wrongs: [0, 1, 2, 3, 4].filter((v) => v !== count).map((v) => `${v}개`),
      tag: 'shape',
      concept: `${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`,
      strategy: `${도형이름[target]}의 직각 알기`,
      hint: `${도형이름[target]}의 뜻을 떠올려 보세요. 뜻 속에 직각이 몇 개인지 들어 있습니다.`,
      steps: [`${eun(도형이름[target])} ${도형뜻[target]}입니다.`, `그러므로 직각은 ${count}개입니다.`],
      misconceptionTip: target === 'right-triangle' ? '삼각형에는 직각이 두 개 있을 수 없습니다.' : '네 각이 모두 직각이어야 합니다.',
    };
  },
});

// 직사각형 종이를 마주 보는 꼭짓점을 잇는 선을 따라 자르기
const 자르기문항: G5Family = {
  id: 'cut-rectangle',
  make: (seed) => {
    const 종이 = pick(['직사각형', '정사각형'], seed);
    return {
      prompt: `${종이} 모양의 종이를 마주 보는 두 꼭짓점을 잇는 곧은 선을 따라 한 번 잘랐습니다. 어떤 도형이 몇 개 생길까요?`,
      answer: '직각삼각형 2개',
      wrongs: ['직각삼각형 1개', '직사각형 2개', '삼각형 4개', '정사각형 2개'],
      tag: 'shape',
      concept: '한 각이 직각인 삼각형을 직각삼각형이라고 합니다.',
      strategy: '도형을 잘라 생기는 도형 알기',
      hint: `${종이}의 네 각은 모두 직각입니다. 자른 뒤 생긴 조각마다 처음 ${종이}의 각이 몇 개씩 남는지 보세요.`,
      steps: [
        '마주 보는 두 꼭짓점을 이으면 종이가 두 조각으로 나뉘고, 조각마다 변이 3개입니다.',
        `조각마다 처음 ${종이}의 직각이 하나씩 그대로 남습니다.`,
        '그러므로 직각삼각형 2개가 생깁니다.',
      ],
      misconceptionTip: '자른 선 때문에 각이 바뀌는 것은 직각이 아닌 두 각입니다. 남아 있는 직각을 찾으세요.',
    };
  },
};

const 같은점다른점문항: G5Family = {
  id: 'rect-vs-square',
  make: (seed) => {
    const 같은점 = pick([true, false], seed);
    return {
      prompt: `직사각형과 정사각형의 ${같은점 ? '같은 점' : '다른 점'}으로 알맞은 것은 어느 것일까요?`,
      answer: 같은점 ? '네 각이 모두 직각입니다.' : '정사각형은 네 변의 길이가 모두 같습니다.',
      wrongs: 같은점
        ? ['네 변의 길이가 모두 같습니다.', '직각이 한 개뿐입니다.', '변이 3개입니다.']
        : ['정사각형은 직각이 없습니다.', '직사각형은 변이 3개입니다.', '정사각형은 꼭짓점이 3개입니다.'],
      tag: 'shape',
      concept: '직사각형은 네 각이 모두 직각인 사각형이고, 정사각형은 네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형입니다.',
      strategy: '직사각형과 정사각형 견주기',
      hint: '두 도형의 뜻을 나란히 적어 보세요. 겹치는 조건과 한쪽에만 있는 조건을 찾으세요.',
      steps: [
        '직사각형: 네 각이 모두 직각인 사각형',
        '정사각형: 네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형',
        같은점 ? '두 도형 모두 네 각이 모두 직각입니다.' : '정사각형은 네 변의 길이가 모두 같다는 조건이 더 있습니다.',
      ],
      misconceptionTip: '정사각형도 네 각이 모두 직각입니다. 두 도형이 다른 것은 변의 길이에 대한 조건입니다.',
    };
  },
};

const 정사각형변문항: G5Family = {
  id: 'square-side',
  make: (seed) => {
    const next = rand(seed);
    const side = 3 + next(9);
    return {
      prompt: `정사각형의 한 변의 길이가 ${side} cm입니다. 이 정사각형의 다른 한 변의 길이는 몇 cm일까요?`,
      answer: `${side} cm`,
      wrongs: [`${side * 2} cm`, `${side * 4} cm`, `${side + 1} cm`, `${Math.max(1, side - 1)} cm`],
      tag: 'shape',
      concept: '정사각형은 네 변의 길이가 모두 같습니다.',
      strategy: '정사각형의 변의 길이 알기',
      hint: '정사각형의 뜻에서 변의 길이에 대한 조건을 떠올려 보세요.',
      steps: ['정사각형은 네 변의 길이가 모두 같습니다.', `그러므로 다른 한 변의 길이도 ${side} cm입니다.`],
      misconceptionTip: '네 변의 길이를 모두 더한 것을 묻는 것이 아닙니다. 한 변의 길이를 묻고 있습니다.',
    };
  },
};

const 가장큰정사각형문항: G5Family = {
  id: 'square-from-rect',
  make: (seed) => {
    const next = rand(seed);
    const short = 4 + next(6);
    const long = short + 2 + next(5);
    return {
      prompt: `가로 ${long} cm, 세로 ${short} cm인 직사각형 모양의 종이를 접고 잘라서 가장 큰 정사각형을 만들려고 합니다. 정사각형의 한 변의 길이는 몇 cm일까요?`,
      answer: `${short} cm`,
      wrongs: [`${long} cm`, `${long - short} cm`, `${long + short} cm`, `${short + 1} cm`].filter((w) => w !== `${short} cm`),
      tag: 'shape',
      concept: '정사각형은 네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형입니다.',
      strategy: '직사각형 종이로 정사각형 만들기',
      hint: '정사각형은 네 변의 길이가 같아야 합니다. 종이의 짧은 쪽보다 긴 변을 만들 수 있을까요?',
      steps: [
        '직사각형 종이의 한 꼭짓점을 짧은 변이 긴 변에 겹치도록 접으면 네 변의 길이가 같은 사각형이 생깁니다.',
        `한 변의 길이는 짧은 변의 길이인 ${short} cm를 넘을 수 없습니다.`,
        `그러므로 가장 큰 정사각형의 한 변의 길이는 ${short} cm입니다.`,
      ],
      misconceptionTip: '긴 변에 맞추면 종이가 모자랍니다. 짧은 변에 맞추어야 합니다.',
    };
  },
};

// 옳지 않은 설명 고르기 (상)
const 설명문항 = (target: 'line' | 'angle' | 고를도형): G5Family => ({
  id: `claims-${target}`,
  make: (seed) => {
    const 묶음: Record<typeof target, { 맞음: string[];틀림: string[] }> = {
      line: {
        맞음: ['선분은 두 점을 곧게 이은 선입니다.', '직선은 양쪽으로 끝없이 늘인 곧은 선입니다.', '반직선은 한 점에서 시작합니다.', '선분 ㄱㄴ과 선분 ㄴㄱ은 같은 도형입니다.'],
        틀림: ['반직선 ㄱㄴ과 반직선 ㄴㄱ은 같은 도형입니다.', '직선은 양쪽 끝에 점이 있습니다.', '선분은 한쪽으로 끝없이 늘인 선입니다.'],
      },
      angle: {
        맞음: ['각은 한 점에서 그은 두 반직선으로 이루어진 도형입니다.', '각 ㄱㄴㄷ의 꼭짓점은 점 ㄴ입니다.', '사각형에는 각이 4개 있습니다.', '각 ㄱㄴㄷ을 각 ㄷㄴㄱ이라고도 합니다.'],
        틀림: ['각 ㄱㄴㄷ의 꼭짓점은 점 ㄱ입니다.', '곧은 선 하나로도 각을 만들 수 있습니다.', '원에는 각이 1개 있습니다.'],
      },
      'right-triangle': {
        맞음: ['직각삼각형에는 직각이 1개 있습니다.', '직각삼각형은 변이 3개입니다.', '직각삼각형은 꼭짓점이 3개입니다.', '기울어져 놓인 직각삼각형도 직각삼각형입니다.'],
        틀림: ['직각삼각형에는 직각이 2개 있습니다.', '직각이 있는 사각형은 직각삼각형입니다.', '직각삼각형의 세 각은 모두 직각입니다.'],
      },
      rectangle: {
        맞음: ['직사각형은 네 각이 모두 직각입니다.', '직사각형은 변이 4개입니다.', '직사각형은 꼭짓점이 4개입니다.', '직사각형에는 직각이 4개 있습니다.'],
        틀림: ['직사각형은 직각이 2개만 있습니다.', '직각이 한 개라도 있는 사각형은 직사각형입니다.', '직사각형은 변이 3개입니다.'],
      },
      square: {
        맞음: ['정사각형은 네 각이 모두 직각입니다.', '정사각형은 네 변의 길이가 모두 같습니다.', '정사각형에는 직각이 4개 있습니다.', '정사각형은 꼭짓점이 4개입니다.'],
        틀림: ['네 변의 길이가 같으면 모두 정사각형입니다.', '정사각형은 직각이 2개만 있습니다.', '정사각형은 변이 3개입니다.'],
      },
    };
    const set = 묶음[target];
    const answer = pick(set.틀림, seed);
    const wrongs = 섞기(set.맞음, seed).slice(0, 3);
    const 주제 = target === 'line' ? '선분, 직선, 반직선' : target === 'angle' ? '각' : 도형이름[target];
    return {
      prompt: `${주제}에 대한 설명으로 옳지 않은 것은 어느 것일까요?`,
      answer,
      wrongs,
      tag: 'shape',
      concept: target === 'line'
        ? '선분은 두 점을 곧게 이은 선, 직선은 양쪽으로 끝없이 늘인 곧은 선, 반직선은 한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선입니다.'
        : target === 'angle'
          ? '각은 한 점에서 그은 두 반직선으로 이루어진 도형이고, 꼭짓점은 이름의 가운데에 씁니다.'
          : `${도형뜻[target]}을 ${도형이름[target]}이라고 합니다.`,
      strategy: `${주제}의 뜻으로 옳고 그름 판단하기`,
      hint: '보기를 하나씩 읽으며 뜻과 맞는지 확인하세요. 하나라도 뜻과 어긋나는 말을 찾으면 됩니다.',
      steps: [`'${answer}'는 뜻과 맞지 않습니다.`, `그러므로 옳지 않은 것은 '${answer}'입니다.`],
      misconceptionTip: '익숙한 말이라고 옳은 것은 아닙니다. 뜻에 비추어 하나씩 확인하세요.',
    };
  },
});

// ════════════════════════════════════════════════════════════════════
// 차시와 수준별 뭉치
// ════════════════════════════════════════════════════════════════════

export const unit2Lesson = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) {
    if (하) return [굽은선문항, 도형수세기문항, 도형찾기문항];
    return [굽은선문항, 도형수세기문항, 도형찾기문항];
  }
  if (lessonNo === 2) {
    if (하) return [선이름문항, 선고르기문항, 선뜻문항];
    if (상) return [선분세기문항, 설명문항('line'), 같은이름문항, 반직선다름문항, 선이름문항];
    return [선이름문항, 선고르기문항, 같은이름문항, 반직선다름문항];
  }
  if (lessonNo === 3) {
    if (하) return [각고르기문항, 각부분문항, 각세기문항];
    if (상) return [각이름문항, 각더하기문항, 설명문항('angle'), 각세기문항];
    return [각이름문항, 각부분문항, 각세기문항, 각고르기문항];
  }
  if (lessonNo === 4) {
    if (하) return [직각고르기문항, 직각뜻문항, 시계직각문항, 직각세기문항];
    if (상) return [직각세기문항, 시계직각문항, 직각고르기문항];
    return [직각세기문항, 직각고르기문항, 시계직각문항];
  }
  if (lessonNo === 5) {
    if (하) return [도형고르기문항('right-triangle'), 뜻문항('right-triangle'), 직각수문항('right-triangle'), 도형세기문항('right-triangle')];
    if (상) return [도형세기문항('right-triangle'), 자르기문항, 설명문항('right-triangle'), 도형고르기문항('right-triangle')];
    return [도형고르기문항('right-triangle'), 도형세기문항('right-triangle'), 뜻문항('right-triangle')];
  }
  if (lessonNo === 6) {
    if (하) return [도형고르기문항('rectangle'), 뜻문항('rectangle'), 직각수문항('rectangle'), 도형세기문항('rectangle')];
    if (상) return [도형세기문항('rectangle'), 설명문항('rectangle'), 직각세기문항];
    return [도형고르기문항('rectangle'), 도형세기문항('rectangle'), 뜻문항('rectangle')];
  }
  if (lessonNo === 7) {
    if (하) return [도형고르기문항('square'), 뜻문항('square'), 정사각형변문항, 같은점다른점문항, 도형세기문항('square')];
    if (상) return [가장큰정사각형문항, 설명문항('square'), 같은점다른점문항, 도형고르기문항('square')];
    return [도형고르기문항('square'), 같은점다른점문항, 정사각형변문항, 뜻문항('square'), 도형세기문항('square')];
  }
  return null;
};
