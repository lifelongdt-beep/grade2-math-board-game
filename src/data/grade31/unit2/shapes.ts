import { rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-1 2단원 평면도형 — 그림에 쓸 도형의 꼭짓점
// ────────────────────────────────────────────────────────────────────
// 이 단원의 문항은 그림을 보고 직각이 있는지, 몇 개인지를 판단합니다.
// 아이는 삼각자를 대어 봅니다. 그러니 그림의 직각은 정말 직각이어야 하고,
// 직각이 아닌 각은 삼각자를 대 보면 한눈에 직각이 아니어야 합니다.
// 88°쯤 되는 각을 '직각이 아닌 것'으로 내면 아이가 옳게 보고도 틀립니다.
//
// 그래서 꼭짓점을 손으로 적지 않고 길이와 각에서 계산하고, 직각이 아닌
// 각은 직각에서 적어도 20° 떨어지게 만듭니다. 시험(shapes.check)이 모든
// 그림의 각을 다시 재어 확인합니다.
//
// 좌표는 그림(figure-set)이 쓰는 대로 -1~1 사이이고 위쪽이 -1입니다.
// ════════════════════════════════════════════════════════════════════

export type Pt = [number, number];

/** 꼭짓점 at에서의 각(도)입니다. */
export const angleAt = (points: Pt[], at: number): number => {
  const n = points.length;
  const p = points[at];
  const a = points[(at + n - 1) % n];
  const b = points[(at + 1) % n];
  const v1 = [a[0] - p[0], a[1] - p[1]];
  const v2 = [b[0] - p[0], b[1] - p[1]];
  const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};

export const rightAngles = (points: Pt[]): number =>
  points.filter((_, at) => Math.abs(angleAt(points, at) - 90) < 0.5).length;

/** 변의 길이입니다. at번 꼭짓점에서 다음 꼭짓점까지. */
export const sideLength = (points: Pt[], at: number): number => {
  const a = points[at];
  const b = points[(at + 1) % points.length];
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
};

const rotate = (points: Pt[], degrees: number): Pt[] => {
  const r = (degrees * Math.PI) / 180;
  return points.map(([x, y]) => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]);
};

/** 가운데로 옮기고, 가장 먼 점이 0.85에 오도록 키웁니다(모양은 그대로). */
const fit = (points: Pt[]): Pt[] => {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const half = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 || 1;
  return points.map(([x, y]) => [((x - cx) / half) * 0.85, ((y - cy) / half) * 0.85]);
};

// 돌려 놓을 각입니다. 반듯하게 놓인 것만 보면 '밑변이 바닥에 붙어 있어야
// 직각삼각형'이라고 알게 되므로(예시적 정의의 함정, 지도서 이론적 배경),
// 기울인 것도 섞습니다.
const 돌림각 = [0, 0, 90, 180, 270, 20, -25, 35];

export type ShapeKind =
  | 'right-triangle'    // 직각삼각형
  | 'acute-triangle'    // 직각이 없는 삼각형(세 각이 모두 직각보다 작음)
  | 'obtuse-triangle'   // 직각이 없는 삼각형(한 각이 직각보다 큼)
  | 'rectangle'         // 직사각형(정사각형이 아닌 것)
  | 'square'            // 정사각형
  | 'parallelogram'     // 직각이 없는 사각형(마주 보는 변이 나란함)
  | 'right-trapezoid'   // 직각이 2개인 사각형
  | 'one-right-quad'    // 직각이 1개인 사각형
  | 'kite-like'         // 네 변의 길이가 같지만 직각이 없는 사각형
  | 'quad';             // 직각이 없는 아무 사각형

export type Shape = { kind: ShapeKind; points: Pt[] };

const 삼각형 = (a: number, b: number, 끼인각: number): Pt[] => {
  // 꼭짓점 하나를 원점에 두고 두 변을 끼인각만큼 벌립니다.
  const r = (끼인각 * Math.PI) / 180;
  return [[0, 0], [a, 0], [b * Math.cos(r), -b * Math.sin(r)]];
};

/** 세 각으로 삼각형을 만듭니다(사인 법칙으로 변의 길이를 정합니다). */
const 각으로삼각형 = (A: number, B: number): Pt[] => {
  const C = 180 - A - B;
  const rad = (d: number) => (d * Math.PI) / 180;
  // 꼭짓점 0의 각이 A, 꼭짓점 1의 각이 B입니다. 변 01의 길이는 C의 맞은편입니다.
  const c = Math.sin(rad(C));
  const b = Math.sin(rad(B)); // 변 02
  return 삼각형(c, b, A);
};

/** 직각이 아닌 각이 직각에서 충분히 먼지 봅니다. */
const 또렷한가 = (points: Pt[]) =>
  points.every((_, at) => {
    const angle = angleAt(points, at);
    return Math.abs(angle - 90) < 0.5 || Math.abs(angle - 90) >= 20;
  }) && points.every((_, at) => angleAt(points, at) >= 25);

/** 볼록한 다각형인지 봅니다(안으로 움푹 들어간 꼭짓점이 없음). */
const 볼록한가 = (points: Pt[]) => {
  let sign = 0;
  for (let at = 0; at < points.length; at += 1) {
    const [ax, ay] = points[at];
    const [bx, by] = points[(at + 1) % points.length];
    const [cx, cy] = points[(at + 2) % points.length];
    const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(cross) < 1e-9) return false;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
};

const 각합 = (points: Pt[]) => points.reduce((sum, _, at) => sum + angleAt(points, at), 0);

export const makeShape = (kind: ShapeKind, seed: number): Shape => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const turn = 돌림각[next(돌림각.length)];
    let base: Pt[];
    if (kind === 'right-triangle') {
      // 다른 두 각은 30°~60°로 둡니다. 너무 뾰족하면 직각이 잘 보이지 않습니다.
      base = 각으로삼각형(90, 30 + next(31));
    } else if (kind === 'acute-triangle') {
      // 세 각이 모두 50°~70°입니다. 가장 큰 각도 직각에서 20° 넘게 작습니다.
      const A = 50 + next(21);
      const B = 50 + next(21);
      if (180 - A - B < 50 || 180 - A - B > 70) continue;
      base = 각으로삼각형(A, B);
    } else if (kind === 'obtuse-triangle') {
      // 너무 크게 벌리면 나머지 두 각이 뾰족해져 삼각형이 가늘게 그려집니다.
      const A = 112 + next(14);
      const B = 25 + next(Math.max(1, 180 - A - 50));
      if (180 - A - B < 25) continue;
      base = 각으로삼각형(A, B);
    } else if (kind === 'rectangle') {
      const w = 1.4 + next(4) * 0.2;
      const h = 0.6 + next(3) * 0.15;
      base = [[0, 0], [w, 0], [w, h], [0, h]];
    } else if (kind === 'square') {
      base = [[0, 0], [1, 0], [1, 1], [0, 1]];
    } else if (kind === 'parallelogram') {
      const w = 1.2 + next(3) * 0.2;
      const s = 0.4 + next(3) * 0.1;
      const h = 0.7;
      base = [[s, 0], [w + s, 0], [w, h], [0, h]];
    } else if (kind === 'right-trapezoid') {
      const top = 0.7 + next(3) * 0.15;
      base = [[0, 0], [top, 0], [1.5, 0.8], [0, 0.8]];
    } else if (kind === 'one-right-quad') {
      const k = next(3) * 0.1;
      base = [[0, 0], [1.2, 0], [1.6 + k, 1.0], [0, 0.4]];
    } else if (kind === 'kite-like') {
      // 네 변의 길이가 같고 직각이 없는 사각형입니다(정사각형과 견줄 때 씁니다).
      const r = ((55 + next(15)) * Math.PI) / 180;
      base = [[0, 0], [1, 0], [1 + Math.cos(r), Math.sin(r)], [Math.cos(r), Math.sin(r)]];
    } else {
      // 아무 조건도 없는 사각형입니다. 점을 흩어 놓고 볼록하며 각이 또렷한
      // 것만 씁니다.
      base = [
        [next(5) * 0.1, next(4) * 0.1],
        [1.2 + next(5) * 0.1, next(5) * 0.1],
        [1.0 + next(6) * 0.1, 0.9 + next(4) * 0.1],
        [next(4) * 0.1 + 0.2, 0.7 + next(4) * 0.1],
      ];
    }
    const points = fit(rotate(base, turn));
    if (!볼록한가(points) || !또렷한가(points)) continue;
    // 사각형의 네 각의 합은 360°입니다. 계산이 어긋나면 쓰지 않습니다.
    if (Math.abs(각합(points) - (points.length === 3 ? 180 : 360)) > 0.5) continue;
    const 직각수 = rightAngles(points);
    const 바라는직각: Record<ShapeKind, number> = {
      'right-triangle': 1, 'acute-triangle': 0, 'obtuse-triangle': 0,
      rectangle: 4, square: 4, parallelogram: 0, 'right-trapezoid': 2,
      'one-right-quad': 1, 'kite-like': 0, quad: 0,
    };
    if (직각수 !== 바라는직각[kind]) continue;
    return { kind, points };
  }
  throw new Error(`도형을 만들지 못했습니다: ${kind}`);
};

export const 이름: Record<ShapeKind, string> = {
  'right-triangle': '직각삼각형',
  'acute-triangle': '삼각형',
  'obtuse-triangle': '삼각형',
  rectangle: '직사각형',
  square: '정사각형',
  parallelogram: '사각형',
  'right-trapezoid': '사각형',
  'one-right-quad': '사각형',
  'kite-like': '사각형',
  quad: '사각형',
};
