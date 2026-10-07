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

// ── 각이 정해진 대칭 사각형 ──────────────────────────────────────────
// 대응각의 크기를 묻는 문항은 "사각형 ㄱㄴㄷㄹ에서 각 ㄱㄴㄷ이 110°"라고
// 적으면서 그림을 달지 않았습니다. 그러면 아이는 각 ㄱㄴㄷ이 어느 각인지,
// 그 대응각이 어디 있는지 볼 수가 없습니다. 이 단원 머리말이 적어 둔
// "도형 문항은 글만으로 물으면 낱말을 아는지 묻게 된다"가 그대로
// 일어난 자리입니다.
//
// 그런데 정해 둔 모양(FIGURE_POINTS)을 쓰면 그림과 적힌 각도가
// 어긋납니다 — 평행사변형은 늘 110.6°로 그려지는데 문제는 83°라고
// 적을 수 있습니다. 그래서 적을 각도에 맞추어 꼭짓점을 계산합니다.

/**
 * 꼭짓점을 가운데로 옮기고 -1~1 안에 들어오게 줄입니다.
 *
 * 가로와 세로를 같은 배율로 줄입니다. 따로 줄이면 각의 크기가 바뀌어,
 * 적어 둔 각도와 그림이 어긋납니다.
 */
const 맞춰넣기 = (점들: Array<[number, number]>): Array<[number, number]> => {
  const xs = 점들.map(([x]) => x);
  const ys = 점들.map(([, y]) => y);
  const 가운데x = (Math.min(...xs) + Math.max(...xs)) / 2;
  const 가운데y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const 반지름 = Math.max(
    ...점들.map(([x, y]) => Math.max(Math.abs(x - 가운데x), Math.abs(y - 가운데y))),
  );
  const 배율 = 0.92 / 반지름;
  return 점들.map(([x, y]): [number, number] => [
    (x - 가운데x) * 배율,
    (y - 가운데y) * 배율,
  ]);
};

// 꼭짓점 차례는 FIGURE_POINTS와 같습니다 — 왼위, 오른위, 오른아래, 왼아래.

/**
 * 자리의 내각이 정확히 각도가 되는 평행사변형입니다(점대칭도형).
 *
 * 평행사변형은 대칭축이 없고 대칭의 중심만 있으므로, 점대칭도형을
 * 묻는 자리에 알맞습니다. 마주 보는 꼭짓점끼리 대응하므로 어느 자리를
 * 물어도 대응각은 저와 다른 꼭짓점에 있습니다.
 */
export const 점대칭사각형 = (자리: number, 각도: number): Array<[number, number]> => {
  // 0번과 2번 자리의 내각이 세타, 1번과 3번은 180-세타입니다.
  const 세타 = ((자리 % 2 === 0 ? 각도 : 180 - 각도) * Math.PI) / 180;
  // 가로를 빗변보다 너무 길게 두면 둔각일 때 납작해져, 각의 표시와
  // 숫자를 놓을 자리가 없어집니다. 두 길이를 같게 두면 마름모가 되어
  // 선대칭도형이기도 하므로, 조금만 다르게 둡니다.
  const 가로 = 1.3;
  const 빗변 = 1.12;
  return 맞춰넣기([
    [0, 0],
    [가로, 0],
    [가로 + 빗변 * Math.cos(세타), 빗변 * Math.sin(세타)],
    [빗변 * Math.cos(세타), 빗변 * Math.sin(세타)],
  ]);
};

/**
 * 자리의 내각이 정확히 각도가 되는 등변사다리꼴입니다(선대칭도형).
 *
 * 대칭축은 세로입니다. 네 꼭짓점이 모두 축에서 벗어나 있으므로, 어느
 * 자리를 물어도 대응각이 저와 다른 꼭짓점에 있습니다. 마름모를 쓰면
 * 축 위에 놓인 두 꼭짓점이 저 자신과 대응하게 되어, '그 대응각'이
 * 저 자신을 가리키는 이상한 문항이 됩니다.
 */
export const 선대칭사각형 = (자리: number, 각도: number): Array<[number, number]> => {
  // 아래 두 자리(2, 3)의 내각이 베타, 위 두 자리(0, 1)는 180-베타입니다.
  const 베타 = ((자리 >= 2 ? 각도 : 180 - 각도) * Math.PI) / 180;
  const 높이 = 0.55;
  // 베타가 90°보다 크면 벌어짐이 음수가 되어 윗변이 더 긴 사다리꼴이
  // 됩니다. 그것도 등변사다리꼴이고 선대칭도형입니다.
  const 벌어짐 = (2 * 높이) / Math.tan(베타);
  const 아래반 = 벌어짐 > 0 ? 0.42 + 벌어짐 : 0.42;
  const 위반 = 벌어짐 > 0 ? 0.42 : 0.42 - 벌어짐;
  return 맞춰넣기([
    [-위반, -높이],
    [위반, -높이],
    [아래반, 높이],
    [-아래반, 높이],
  ]);
};

/** 선대칭 사각형에서 그 자리와 대응하는 꼭짓점입니다(세로 축: 0↔1, 2↔3). */
export const 선대칭짝 = (자리: number) => (자리 % 2 === 0 ? 자리 + 1 : 자리 - 1);

/** 점대칭 사각형에서 그 자리와 대응하는 꼭짓점입니다(마주 보는 자리). */
export const 점대칭짝 = (자리: number) => (자리 + 2) % 4;

/**
 * 세 각의 크기가 정확히 그대로 그려지는 삼각형입니다.
 *
 * 합동인 두 삼각형에서 대응각을 묻는 문항은 "두 각이 70°, 23°"라고
 * 적으면서 그림을 달지 않았습니다. 그림 없이는 어느 각이 어느 각의
 * 대응각인지 볼 수가 없어, 아이는 세 각의 합만 계산하고 '대응'은
 * 건너뜁니다. 지도서가 "대응점, 대응변, 대응각의 위치를 혼동하지
 * 않도록 유의한다"고 적어 둔 바로 그 자리입니다.
 *
 * 각도는 사인 법칙으로 꼭짓점을 잡습니다. 0번 꼭짓점을 원점에, 1번을
 * 오른쪽에 두고, 2번을 두 각으로 정합니다.
 */
export const 각으로삼각형 = (각들: [number, number, number]): Array<[number, number]> => {
  const [A, B, C] = 각들.map((one) => (one * Math.PI) / 180);
  // 0번과 1번을 잇는 변의 길이를 1로 두면, 0번에서 2번까지는
  // sin(B)/sin(C)입니다.
  const 길이 = Math.sin(B) / Math.sin(C);
  return 맞춰넣기([
    [0, 0],
    [1, 0],
    [길이 * Math.cos(A), 길이 * Math.sin(A)],
  ]);
};

/**
 * 네 변의 길이로 그린 볼록한 사각형과, 그 그림에서 잰 네 내각입니다.
 *
 * 대응변·대응각 문항은 한 사각형에 변의 길이나 각의 크기를 적습니다.
 * 한 가지 모양을 그려 두고 숫자만 마음대로 바꾸면 그림과 어긋납니다 —
 * 둔각으로 그린 꼭짓점에 74°라고 적거나, 8 cm라는 변이 6 cm라는 변보다
 * 짧게 그려졌습니다. 그래서 변의 길이로 모양을 정하고, 각은 그 모양에서
 * 재어 정수로 반올림합니다(네 각의 합이 360°가 되게 하나만 맞춥니다).
 * 반올림으로 생기는 차이는 1°보다 작아 눈으로 구별되지 않습니다.
 *
 * 꼭짓점 차례는 왼위, 오른위, 오른아래, 왼아래이고, 변 i는 i번에서
 * i+1번으로 갑니다.
 */
export const 변으로사각형 = (
  변길이: [number, number, number, number],
): { points: Array<[number, number]>; 각: [number, number, number, number] } | null => {
  const [L0, L1, L2, L3] = 변길이;
  // 0번과 2번을 잇는 대각선의 길이를 정하면 모양이 하나로 정해집니다.
  // 두 삼각형이 만들어지는 범위에서, 가장 작은 각과 가장 큰 각이 가장
  // 덜 치우치는 길이를 고릅니다 — 너무 납작하면 각을 표시할 자리가 없습니다.
  const 아래끝 = Math.max(Math.abs(L0 - L1), Math.abs(L2 - L3));
  const 위끝 = Math.min(L0 + L1, L2 + L3);
  if (위끝 - 아래끝 < 0.5) return null;
  const 각재기 = (점들: Array<[number, number]>) =>
    점들.map((점, i) => {
      const 앞 = 점들[(i + 3) % 4];
      const 뒤 = 점들[(i + 1) % 4];
      const a = [앞[0] - 점[0], 앞[1] - 점[1]];
      const b = [뒤[0] - 점[0], 뒤[1] - 점[1]];
      const 코사인 = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]));
      return (Math.acos(Math.max(-1, Math.min(1, 코사인))) * 180) / Math.PI;
    });
  let 고른: { 점들: Array<[number, number]>; 각들: number[]; 점수: number } | null = null;
  for (let k = 1; k < 60; k += 1) {
    const d = 아래끝 + ((위끝 - 아래끝) * k) / 60;
    const 첫각 = Math.acos((L0 * L0 + d * d - L1 * L1) / (2 * L0 * d));
    const 둘각 = Math.acos((L3 * L3 + d * d - L2 * L2) / (2 * L3 * d));
    const 점들: Array<[number, number]> = [
      [0, 0],
      [L0 * Math.cos(첫각), -L0 * Math.sin(첫각)],
      [d, 0],
      [L3 * Math.cos(둘각), L3 * Math.sin(둘각)],
    ];
    const 각들 = 각재기(점들);
    const 점수 = Math.min(...각들, 180 - Math.max(...각들));
    if (!고른 || 점수 > 고른.점수) 고른 = { 점들, 각들, 점수 };
  }
  // 각이 50°보다 작거나 130°보다 크면 그림이 납작해집니다.
  if (!고른 || 고른.점수 < 50) return null;
  // 0번에서 1번으로 가는 변이 거의 가로로 놓이도록 돌립니다.
  const [x1, y1] = 고른.점들[1];
  const 돌림 = -Math.atan2(y1, x1) - (8 * Math.PI) / 180;
  const 돌린 = 고른.점들.map(([x, y]): [number, number] => [
    x * Math.cos(돌림) - y * Math.sin(돌림),
    x * Math.sin(돌림) + y * Math.cos(돌림),
  ]);
  const 각 = 고른.각들.map((one) => Math.round(one)) as [number, number, number, number];
  const 어긋남 = 360 - 각.reduce((sum, one) => sum + one, 0);
  const 큰자리 = 각.indexOf(Math.max(...각));
  각[큰자리] += 어긋남;
  return { points: 맞춰넣기(돌린), 각 };
};

// ── 대칭도형의 반쪽 ──────────────────────────────────────────────────
// "반쪽만 그려져 있습니다"라고 묻는 문항에 그림이 없었습니다.
//
// 대칭축(세로)이나 대칭의 중심이 그림의 원점에 놓이도록 적습니다.
// 그림에서 대칭축은 원점을 지나는 세로선으로, 대칭의 중심은 원점의
// 점으로 그려지므로, 원점에 맞추어 두면 반쪽과 축(중심)이 제자리에
// 놓입니다. 자세히 보기에서 나머지 반쪽을 채울 때도 이 원점을 씁니다.

/** 선대칭도형의 오른쪽 반쪽입니다. 첫 점과 끝 점이 대칭축(x = 0) 위에 있습니다. */
export const 선대칭반쪽들: Array<Array<[number, number]>> = [
  // 집 모양
  [[0, -0.95], [0.75, -0.2], [0.75, 0.85], [0, 0.85]],
  // 등변사다리꼴
  [[0, -0.6], [0.42, -0.6], [0.9, 0.6], [0, 0.6]],
  // 방패 모양
  [[0, -0.9], [0.35, -0.9], [0.85, -0.1], [0.45, 0.85], [0, 0.85]],
];

/**
 * 점대칭도형의 반쪽입니다. 첫 점과 끝 점을 잇는 변이 대칭의 중심(원점)을
 * 지나고, 원점은 그 변의 한가운데입니다.
 */
export const 점대칭반쪽들: Array<Array<[number, number]>> = [
  // 육각형의 위쪽 반
  [[-0.9, 0], [-0.4, -0.75], [0.55, -0.75], [0.9, 0]],
  // 평행사변형을 대각선으로 자른 반
  [[-0.6, -0.55], [0.9, -0.55], [0.6, 0.55]],
];
