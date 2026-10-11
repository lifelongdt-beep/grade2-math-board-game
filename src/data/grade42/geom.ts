// ════════════════════════════════════════════════════════════════════
// 4-2 도형 그림의 꼭짓점 계산
// ────────────────────────────────────────────────────────────────────
// figure-set 그림에 꼭짓점을 직접 넘깁니다. 적힌 각도·길이와 그림이
// 어긋나면 아이는 그림을 믿지 못하게 되므로, 각도와 길이에서 자리를
// 계산합니다. 화면 좌표(아래로 y)이고 -1~1 안에 들어가게 맞춥니다.
// ════════════════════════════════════════════════════════════════════

export type Pt = [number, number];

/** 가운데에 놓고 가장 긴 쪽이 1.8이 되게 늘이거나 줄입니다. 모양(비율)은 그대로입니다. */
export const 맞추기 = (pts: Pt[]): Pt[] => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const k = 1.8 / span;
  return pts.map(([x, y]) => [Number(((x - cx) * k).toFixed(4)), Number(((y - cy) * k).toFixed(4))]);
};

const 라디안 = (deg: number) => (deg * Math.PI) / 180;

/** 밑변 양 끝 각이 A°, B°인 삼각형입니다. 꼭짓점 차례: 왼쪽 아래, 오른쪽 아래, 위. */
export const 삼각형 = (A: number, B: number): Pt[] => {
  // 밑변 길이 1, 왼쪽 끝 (0,0). 위 꼭짓점은 사인 법칙으로 구합니다.
  const C = 180 - A - B;
  const 왼변 = Math.sin(라디안(B)) / Math.sin(라디안(C));
  const top: Pt = [왼변 * Math.cos(라디안(A)), -왼변 * Math.sin(라디안(A))];
  return 맞추기([[0, 0], [1, 0], top]);
};

/** 아랫변 길이 bottom, 높이 h, 윗변이 왼쪽 위 꼭짓점에서 shift만큼 밀린 사각형(왼쪽 아래부터 시계 반대 방향). */
export const 사각형 = (bottom: number, top: number, h: number, shift: number): Pt[] =>
  맞추기([[0, 0], [bottom, 0], [shift + top, -h], [shift, -h]]);

/** 두 대각선 길이가 p, q이고 수직으로 이등분하는 마름모입니다. */
export const 마름모 = (p: number, q: number): Pt[] => 맞추기([[-p / 2, 0], [0, q / 2], [p / 2, 0], [0, -q / 2]]);

/** 정n각형입니다. 한 변이 아래에 눕도록 돌립니다. */
export const 정다각형 = (n: number): Pt[] => {
  const 시작 = Math.PI / 2 + Math.PI / n;
  return 맞추기(Array.from({ length: n }, (_, k): Pt => [Math.cos(시작 + (2 * Math.PI * k) / n), Math.sin(시작 + (2 * Math.PI * k) / n)]));
};

/** 볼록한(오목하지 않은) 일반 n각형입니다. 한 원 위에 고르지 않은 간격으로 점을 찍으면 언제나 볼록합니다. */
export const 고르지않은다각형 = (n: number, next: (b: number) => number): Pt[] => {
  const 간격 = Array.from({ length: n }, () => 0.6 + next(9) / 10);
  const 합 = 간격.reduce((s, x) => s + x, 0);
  let t = Math.PI / 2;
  return 맞추기(
    간격.map((g) => {
      t += (2 * Math.PI * g) / 합;
      return [Math.cos(t), Math.sin(t)];
    }),
  );
};
