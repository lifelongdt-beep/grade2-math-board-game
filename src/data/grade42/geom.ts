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

/**
 * 네 각이 a°, b°, c°, d°인 볼록 사각형입니다(4-1 사각형의 네 각). 꼭짓점 차례는
 * 왼쪽 아래(a), 오른쪽 아래(b), 오른쪽 위(c), 왼쪽 위(d)입니다. 밑변을 1로
 * 두고 왼쪽 변의 길이를 바꾸어 가며 d가 맞는 자리를 찾습니다. 못 찾으면 null.
 */
export const 네각사각형 = (a: number, b: number, c: number, d: number): Pt[] | null => {
  if (a + b + c + d !== 360) return null;
  const r = (x: number) => (x * Math.PI) / 180;
  const 각 = (o: Pt, p: Pt, q: Pt) => {
    const v1 = [p[0] - o[0], p[1] - o[1]];
    const v2 = [q[0] - o[0], q[1] - o[1]];
    return (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]))) * 180) / Math.PI;
  };
  // 위쪽이 +y인 좌표에서 계산하고 마지막에 뒤집습니다.
  const A: Pt = [0, 0];
  const B: Pt = [1, 0];
  // 왼쪽 변의 길이를 여러 가지로 해 보고, 가장 짧은 변이 가장 긴 것(고르게
  // 생긴 모양)을 고릅니다. 한 변이 너무 짧으면 각 이름표가 겹칩니다.
  let 가장좋은: Pt[] | null = null;
  let 점수 = 0;
  for (let t = 0.3; t <= 1.6; t += 0.05) {
    const D: Pt = [t * Math.cos(r(a)), t * Math.sin(r(a))];
    // C = B + s·(cos(180-b), sin(180-b)); D에서의 각이 d가 되는 s를 찾습니다.
    const C = (s: number): Pt => [1 + s * Math.cos(r(180 - b)), s * Math.sin(r(180 - b))];
    let lo = 0.05;
    let hi = 4;
    const f = (s: number) => 각(D, A, C(s)) - d;
    if (f(lo) * f(hi) > 0) continue;
    for (let k = 0; k < 60; k += 1) {
      const mid = (lo + hi) / 2;
      if (f(lo) * f(mid) <= 0) hi = mid;
      else lo = mid;
    }
    const Cp = C(lo);
    if (Math.abs(각(Cp, B, D) - c) > 0.5 || Math.abs(각(A, B, D) - a) > 0.5) continue;
    const 변 = [[A, B], [B, Cp], [Cp, D], [D, A]].map(([p, q]) => Math.hypot(p[0] - q[0], p[1] - q[1]));
    const 고름 = Math.min(...변) / Math.max(...변);
    if (고름 > 점수) {
      점수 = 고름;
      가장좋은 = [A, B, Cp, D];
    }
  }
  return 가장좋은 && 점수 > 0.25 ? 맞추기(가장좋은.map(([x, y]): Pt => [x, -y])) : null;
};

/** 모양 조각(한 변이 u)입니다. 서로 크기를 견줄 수 있게 같은 단위로 그리고 가운데에 둡니다. */
export const 모양조각점 = (이름: string, u = 0.42): Pt[] => {
  const h = (u * Math.sqrt(3)) / 2;
  const 가운데 = (pts: Pt[]): Pt[] => {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return pts.map(([x, y]) => [Number((x - cx).toFixed(4)), Number((y - cy).toFixed(4))]);
  };
  switch (이름) {
    case '정삼각형':
      return 가운데([[0, 0], [u, 0], [u / 2, -h]]);
    case '마름모':
      return 가운데([[0, 0], [u, 0], [u * 1.5, -h], [u / 2, -h]]);
    case '사다리꼴':
      return 가운데([[0, 0], [2 * u, 0], [1.5 * u, -h], [u / 2, -h]]);
    case '정사각형':
      return 가운데([[0, 0], [u, 0], [u, -u], [0, -u]]);
    default:
      // 정육각형
      return 가운데(Array.from({ length: 6 }, (_, k): Pt => [u * Math.cos((Math.PI / 3) * k), -u * Math.sin((Math.PI / 3) * k)]));
  }
};
