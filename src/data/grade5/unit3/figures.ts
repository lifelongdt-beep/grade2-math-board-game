import type { FigureSetVisual, FigureShapeName } from '../../../types';

// ════════════════════════════════════════════════════════════════════
// 3단원이 다루는 도형과 그 성질
// ────────────────────────────────────────────────────────────────────
// 대칭축이 몇 개인지, 점대칭도형인지를 한 곳에 적어 둡니다. 문항마다
// 따로 적으면 한쪽만 고치는 일이 생깁니다.
//
// 지도서가 적어 둔 것:
//   선대칭도형 — 선분, 직사각형, 정사각형, 마름모, 이등변삼각형,
//                정삼각형, 부채꼴
//   점대칭도형 — 선분, 정사각형, 직사각형, 마름모, 평행사변형, 원
// 여기에 초등에서 함께 다루는 사다리꼴과 정오각형·정육각형을 더했습니다.
//
// 지도서가 적어 둔 오류 유형 가운데 가장 잘 걸리는 것이 이것입니다.
//   "직사각형의 대각선이나 평행사변형의 대각선을 대칭축이라고 생각하는 오류"
// 그래서 직사각형과 평행사변형을 늘 보기에 둡니다.
// ════════════════════════════════════════════════════════════════════

export type AxisKind = 'vertical' | 'horizontal' | 'diagonal' | 'anti-diagonal';

export type FigureFact = {
  shape: FigureShapeName;
  // 대칭축의 개수입니다. 원은 무수히 많습니다.
  axisCount: number | '무수히 많음';
  // 그림에 그릴 수 있는 대칭축입니다. 정오각형·정육각형처럼 45° 격자에
  // 놓이지 않는 축은 그리지 않습니다 — 잘못 그린 축은 없는 것만 못합니다.
  drawableAxes: AxisKind[];
  pointSymmetric: boolean;
  vertexCount: number;
};

// 여기 적은 대칭축의 수는 '그 이름으로 흔히 그리는 도형' 하나의 값입니다.
// 이름만으로는 하나로 정해지지 않는 것이 있습니다 — 등변사다리꼴도
// 사다리꼴이고 대칭축이 하나 있으며, 정사각형도 직사각형이고 마름모이며
// 대칭축이 넷입니다. 그래서 이 값을 쓰는 문항은 반드시 도형을 함께
// 그리고, 물음도 '그림의 사다리꼴에서…'처럼 그린 도형을 가리킵니다.
export const FIGURE_FACTS: FigureFact[] = [
  { shape: '정삼각형', axisCount: 3, drawableAxes: ['vertical'], pointSymmetric: false, vertexCount: 3 },
  { shape: '이등변삼각형', axisCount: 1, drawableAxes: ['vertical'], pointSymmetric: false, vertexCount: 3 },
  { shape: '직각삼각형', axisCount: 0, drawableAxes: [], pointSymmetric: false, vertexCount: 3 },
  { shape: '정사각형', axisCount: 4, drawableAxes: ['vertical', 'horizontal', 'diagonal', 'anti-diagonal'], pointSymmetric: true, vertexCount: 4 },
  { shape: '직사각형', axisCount: 2, drawableAxes: ['vertical', 'horizontal'], pointSymmetric: true, vertexCount: 4 },
  { shape: '마름모', axisCount: 2, drawableAxes: ['vertical', 'horizontal'], pointSymmetric: true, vertexCount: 4 },
  { shape: '평행사변형', axisCount: 0, drawableAxes: [], pointSymmetric: true, vertexCount: 4 },
  { shape: '사다리꼴', axisCount: 0, drawableAxes: [], pointSymmetric: false, vertexCount: 4 },
  { shape: '사각형', axisCount: 0, drawableAxes: [], pointSymmetric: false, vertexCount: 4 },
  { shape: '정오각형', axisCount: 5, drawableAxes: [], pointSymmetric: false, vertexCount: 5 },
  { shape: '정육각형', axisCount: 6, drawableAxes: [], pointSymmetric: true, vertexCount: 6 },
  { shape: '원', axisCount: '무수히 많음', drawableAxes: [], pointSymmetric: true, vertexCount: 0 },
];

export const factFor = (shape: FigureShapeName): FigureFact =>
  FIGURE_FACTS.find((one) => one.shape === shape) ?? FIGURE_FACTS[3];

export const 선대칭도형들 = FIGURE_FACTS.filter((one) => one.axisCount !== 0);
export const 선대칭아닌것들 = FIGURE_FACTS.filter((one) => one.axisCount === 0);
export const 점대칭도형들 = FIGURE_FACTS.filter((one) => one.pointSymmetric);
export const 점대칭아닌것들 = FIGURE_FACTS.filter((one) => !one.pointSymmetric);

/** 도형 하나를 그립니다. */
export const oneFigure = (
  label: string,
  shape: FigureShapeName,
  extra: Partial<FigureSetVisual['items'][number]> = {},
): FigureSetVisual => ({
  kind: 'figure-set',
  label,
  items: [{ shape, ...extra }],
});

/** 가·나·다·라 넷을 늘어놓습니다. */
export const figureChoices = (
  label: string,
  shapes: FigureShapeName[],
  names = ['가', '나', '다', '라'],
): FigureSetVisual => ({
  kind: 'figure-set',
  label,
  items: shapes.map((shape, index) => ({ shape, name: names[index] })),
});

// 도형의 꼭짓점 이름입니다. 교과서가 쓰는 차례 그대로입니다.
export const 자음이름 = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ'];

/** 첫 도형과 둘째 도형의 꼭짓점 이름입니다. 차례가 곧 대응입니다. */
export const 대응이름 = (vertexCount: number) => ({
  first: 자음이름.slice(0, vertexCount),
  second: 자음이름.slice(4, 4 + vertexCount),
});
