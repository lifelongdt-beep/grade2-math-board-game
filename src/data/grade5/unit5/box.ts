import type { BoxFace } from '../../../types';

// ════════════════════════════════════════════════════════════════════
// 직육면체의 자리와, 전개도를 접는 일
// ────────────────────────────────────────────────────────────────────
// 이 단원의 답은 거의 다 "어느 면이 어느 면과 평행한가", "접었을 때 어느
// 점이 어느 점과 만나는가"입니다. 이런 답을 손으로 적어 두면 한 글자만
// 틀려도 아이가 그대로 외웁니다. 그래서 여기서는 손으로 적지 않고,
// 직육면체를 좌표로 놓고 전개도를 실제로 접어서 계산합니다.
//
// 좌표는 정수만 씁니다. 접는 일은 90°씩 도는 것뿐이라 소수가 끼어들
// 자리가 없고, 그래서 두 점이 만나는지를 '가까운지'가 아니라 '같은지'로
// 볼 수 있습니다.
// ════════════════════════════════════════════════════════════════════

export type Vec = readonly [number, number, number];

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const keyOf = (v: Vec) => `${v[0]},${v[1]},${v[2]}`;

// 축 A를 중심으로 ±90° 돌립니다. cos 90°가 0이라 로드리게스 식에서
// 남는 것은 (A×x)sinθ + A(A·x)뿐이고, A와 x가 정수라 답도 정수입니다.
const turn = (x: Vec, axis: Vec, quarter: 1 | -1): Vec =>
  add(scale(cross(axis, x), quarter), scale(axis, dot(axis, x)));

// ── 직육면체의 꼭짓점 이름 ──────────────────────────────────────────
// 윗면 ㄱㄴㄷㄹ, 아랫면 ㅁㅂㅅㅇ입니다. 가로를 width, 세로(안쪽으로
// 들어가는 길이)를 depth, 높이를 height라고 부릅니다.
export const VERTEX_NAMES = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'] as const;

/** 가로 w, 세로 d, 높이 h인 직육면체의 꼭짓점 여덟 개입니다. */
export const boxVertices = (w: number, d: number, h: number): Record<string, Vec> => ({
  ㄱ: [0, d, h],
  ㄴ: [0, 0, h],
  ㄷ: [w, 0, h],
  ㄹ: [w, d, h],
  ㅁ: [0, d, 0],
  ㅂ: [0, 0, 0],
  ㅅ: [w, 0, 0],
  ㅇ: [w, d, 0],
});

// 여섯 면입니다. 지도서가 쓰는 차례 그대로 적어 두고, 한 면은 늘 이
// 한 가지 이름으로만 부릅니다. 같은 면을 면 ㄷㅅㅇㄹ이라고도 부르고
// 면 ㄹㄷㅅㅇ이라고도 부르면, 보기 넷 가운데 정답이 둘이 됩니다.
export const FACE_LETTERS: Record<BoxFace, string> = {
  top: 'ㄱㄴㄷㄹ',
  bottom: 'ㅁㅂㅅㅇ',
  front: 'ㄴㅂㅅㄷ',
  back: 'ㄱㅁㅇㄹ',
  left: 'ㄱㄴㅂㅁ',
  right: 'ㄹㄷㅅㅇ',
};

export const ALL_FACES: BoxFace[] = ['top', 'bottom', 'front', 'back', 'left', 'right'];

export const faceName = (face: BoxFace) => `면 ${FACE_LETTERS[face]}`;

/** 마주 보는 면입니다. 직육면체에서 마주 보는 두 면은 서로 평행합니다. */
export const OPPOSITE: Record<BoxFace, BoxFace> = {
  top: 'bottom',
  bottom: 'top',
  front: 'back',
  back: 'front',
  left: 'right',
  right: 'left',
};

/** 주어진 면과 수직인 면 넷입니다(마주 보는 면 하나만 빠집니다). */
export const perpendicularTo = (face: BoxFace): BoxFace[] =>
  ALL_FACES.filter((one) => one !== face && one !== OPPOSITE[face]);

// 겨냥도를 그리면 보이는 면 셋, 보이지 않는 면 셋입니다. 그림에서 앞·위·
// 오른쪽이 보이고, 뒤·아래·왼쪽이 가려집니다. 가려지는 꼭짓점은 ㅁ
// 하나이고, 거기 붙은 모서리 셋이 점선이 됩니다.
export const VISIBLE_FACES: BoxFace[] = ['top', 'front', 'right'];
export const HIDDEN_FACES: BoxFace[] = ['bottom', 'back', 'left'];
export const HIDDEN_VERTEX = 'ㅁ';
export const HIDDEN_EDGES = ['ㄱㅁ', 'ㅁㅂ', 'ㅁㅇ'];

// 열두 모서리입니다. 두 글자를 이름으로 삼되, 늘 같은 차례로 적습니다.
export const ALL_EDGES: Array<[string, string]> = [
  ['ㄱ', 'ㄴ'], ['ㄴ', 'ㄷ'], ['ㄷ', 'ㄹ'], ['ㄹ', 'ㄱ'],
  ['ㅁ', 'ㅂ'], ['ㅂ', 'ㅅ'], ['ㅅ', 'ㅇ'], ['ㅇ', 'ㅁ'],
  ['ㄱ', 'ㅁ'], ['ㄴ', 'ㅂ'], ['ㄷ', 'ㅅ'], ['ㄹ', 'ㅇ'],
];

// ════════════════════════════════════════════════════════════════════
// 전개도를 접기
// ────────────────────────────────────────────────────────────────────
// 전개도는 격자 위의 칸 여섯으로 적습니다. cols는 세로줄의 너비,
// rows는 가로줄의 높이입니다. 칸 하나가 면 하나입니다.
//
// 접는 방법은 이렇습니다. 첫 칸을 바닥에 놓고, 이웃한 칸을 맞닿은
// 모서리를 축으로 90° 세웁니다. 그 이웃의 이웃을 또 세우고… 이렇게
// 여섯 칸을 모두 세우면 상자가 됩니다. 한 칸의 자리는 모퉁이 하나의
// 위치와 방향 벡터 둘로 적습니다.
// ════════════════════════════════════════════════════════════════════

export type NetCell = { col: number; row: number };

export type NetLayout = {
  cols: number[];
  rows: number[];
  cells: NetCell[];
};

export type FoldedCell = {
  cell: NetCell;
  /** 평면에서의 왼쪽 위 모퉁이 좌표(격자 단위)입니다. */
  plane: { x: number; y: number; w: number; h: number };
  /** 접었을 때 네 모퉁이가 가는 자리입니다. 왼위·오른위·오른아래·왼아래 차례입니다. */
  corners: [Vec, Vec, Vec, Vec];
  center: Vec;
};

export type Folded = {
  cells: FoldedCell[];
  /** 상자가 되면 참입니다. 겹치는 면이 있거나 길이가 맞지 않으면 거짓입니다. */
  makesBox: boolean;
  /** 상자가 되지 않은 까닭입니다. 상자가 되면 null입니다. */
  reason: string | null;
  /** 평면에서의 꼭짓점 열넷입니다. 위에서 아래로, 왼쪽에서 오른쪽으로 셉니다. */
  points: Array<{ x: number; y: number; name: string; at: Vec }>;
  /** 잘린 모서리, 곧 전개도의 바깥 테두리입니다. 이름 두 개로 적습니다. */
  border: Array<{ from: string; to: string; at: [Vec, Vec] }>;
};

const before = (sizes: number[], index: number) => sizes.slice(0, index).reduce((sum, one) => sum + one, 0);

const POINT_NAMES = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** 전개도를 접습니다. */
export const fold = (layout: NetLayout): Folded => {
  const { cols, rows, cells } = layout;
  const index = new Map<string, number>();
  cells.forEach((cell, at) => index.set(`${cell.col},${cell.row}`, at));

  type Frame = { p: Vec; u: Vec; v: Vec };
  const frames = new Array<Frame | null>(cells.length).fill(null);
  frames[0] = { p: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0] };

  const queue = [0];
  while (queue.length) {
    const at = queue.shift() as number;
    const here = frames[at] as Frame;
    const cell = cells[at];
    const w = cols[cell.col];
    const h = rows[cell.row];

    // 오른쪽·왼쪽 이웃은 세로 모서리(v)를, 위·아래 이웃은 가로
    // 모서리(u)를 축으로 돕니다. 여섯 칸이 모두 같은 쪽으로 서야
    // 상자가 되므로 도는 방향을 한 번 정해 두고 그대로 씁니다.
    const moves: Array<{ dc: number; dr: number; axis: Vec; quarter: 1 | -1 }> = [
      { dc: 1, dr: 0, axis: here.v, quarter: -1 },
      { dc: -1, dr: 0, axis: here.v, quarter: 1 },
      { dc: 0, dr: 1, axis: here.u, quarter: 1 },
      { dc: 0, dr: -1, axis: here.u, quarter: -1 },
    ];

    for (const move of moves) {
      const nextAt = index.get(`${cell.col + move.dc},${cell.row + move.dr}`);
      if (nextAt === undefined || frames[nextAt]) continue;
      const next = cells[nextAt];
      const u = turn(here.u, move.axis, move.quarter);
      const v = turn(here.v, move.axis, move.quarter);
      const nw = cols[next.col];
      const nh = rows[next.row];
      // 맞닿은 모서리 위의 점은 접어도 움직이지 않습니다. 그 점에서
      // 새 칸의 왼쪽 위 모퉁이가 어디인지를 되짚습니다.
      const p =
        move.dc === 1
          ? add(here.p, scale(here.u, w))
          : move.dc === -1
            ? add(here.p, scale(u, -nw))
            : move.dr === 1
              ? add(here.p, scale(here.v, h))
              : add(here.p, scale(v, -nh));
      frames[nextAt] = { p, u, v };
      queue.push(nextAt);
    }
  }

  const folded: FoldedCell[] = cells.map((cell, at) => {
    const frame = frames[at] ?? { p: [0, 0, 0] as Vec, u: [1, 0, 0] as Vec, v: [0, 1, 0] as Vec };
    const w = cols[cell.col];
    const h = rows[cell.row];
    const tl = frame.p;
    const tr = add(tl, scale(frame.u, w));
    const bl = add(tl, scale(frame.v, h));
    const br = add(tr, scale(frame.v, h));
    return {
      cell,
      plane: { x: before(cols, cell.col), y: before(rows, cell.row), w, h },
      corners: [tl, tr, br, bl],
      center: [(tl[0] + br[0]) / 2, (tl[1] + br[1]) / 2, (tl[2] + br[2]) / 2],
    };
  });

  // 상자가 되었는지 봅니다. 칸이 여섯이고, 면의 한가운데가 여섯 자리로
  // 흩어지고(겹치는 면이 없고), 모퉁이가 여덟 자리로 모이며(맞닿는
  // 선분의 길이가 같고), 그 여덟이 정확히 상자의 여덟 꼭짓점이어야
  // 합니다.
  // 한가운데는 .5로 떨어집니다. 반올림해서 견주면 서로 다른 면이 같은
  // 자리로 보이므로, 두 배 한 값(정수)으로 견줍니다.
  const centers = new Set(folded.map((one) => one.center.map((value) => value * 2).join(',')));
  const cornerSet = new Set<string>();
  for (const one of folded) for (const corner of one.corners) cornerSet.add(keyOf(corner));
  const everyCorner = [...cornerSet].map((text) => text.split(',').map(Number) as unknown as Vec);
  const span = (axis: 0 | 1 | 2) => {
    const values = everyCorner.map((one) => one[axis]);
    return [Math.min(...values), Math.max(...values)];
  };
  const [x0, x1] = span(0);
  const [y0, y1] = span(1);
  const [z0, z1] = span(2);
  const wanted = new Set<string>();
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) wanted.add(keyOf([x, y, z]));
  const makesBox =
    cells.length === 6 &&
    frames.every(Boolean) &&
    centers.size === 6 &&
    cornerSet.size === 8 &&
    wanted.size === 8 &&
    [...cornerSet].every((one) => wanted.has(one));

  // 상자가 되지 않은 까닭입니다. 손으로 적지 않고 접어 본 결과에서
  // 읽습니다 — 지도서가 아이에게 말하게 하는 까닭 그대로입니다.
  //   "면이 6개가 아닙니다" / "접었을 때 겹치는 면이 있습니다"
  //   "접었을 때 만나는 선분의 길이가 다릅니다"
  const reason = makesBox
    ? null
    : cells.length !== 6
      ? `면이 6개가 아니라 ${cells.length}개입니다.`
      : centers.size < 6
        ? '접었을 때 겹치는 면이 있습니다.'
        : '접었을 때 만나는 선분의 길이가 다릅니다.';

  // 평면 위의 꼭짓점입니다. 칸의 모퉁이를 모두 모아 겹치는 것을 지우면
  // 전개도의 꼭짓점 열넷이 남습니다.
  const planePoints = new Map<string, { x: number; y: number; at: Vec }>();
  for (const one of folded) {
    const spots: Array<[number, number, Vec]> = [
      [one.plane.x, one.plane.y, one.corners[0]],
      [one.plane.x + one.plane.w, one.plane.y, one.corners[1]],
      [one.plane.x + one.plane.w, one.plane.y + one.plane.h, one.corners[2]],
      [one.plane.x, one.plane.y + one.plane.h, one.corners[3]],
    ];
    for (const [x, y, at] of spots) planePoints.set(`${x},${y}`, { x, y, at });
  }
  const sorted = [...planePoints.values()].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const points = sorted.map((one, at) => ({ ...one, name: POINT_NAMES[at] ?? `P${at}` }));
  const nameAt = new Map(points.map((one) => [`${one.x},${one.y}`, one.name]));

  // 바깥 테두리입니다. 이웃한 칸이 없는 쪽이 잘린 모서리입니다.
  const border: Folded['border'] = [];
  for (const one of folded) {
    const { x, y, w, h } = one.plane;
    const sides: Array<{ dc: number; dr: number; a: [number, number]; b: [number, number]; at: [Vec, Vec] }> = [
      { dc: 0, dr: -1, a: [x, y], b: [x + w, y], at: [one.corners[0], one.corners[1]] },
      { dc: 1, dr: 0, a: [x + w, y], b: [x + w, y + h], at: [one.corners[1], one.corners[2]] },
      { dc: 0, dr: 1, a: [x, y + h], b: [x + w, y + h], at: [one.corners[3], one.corners[2]] },
      { dc: -1, dr: 0, a: [x, y], b: [x, y + h], at: [one.corners[0], one.corners[3]] },
    ];
    for (const side of sides) {
      if (index.has(`${one.cell.col + side.dc},${one.cell.row + side.dr}`)) continue;
      const from = nameAt.get(`${side.a[0]},${side.a[1]}`);
      const to = nameAt.get(`${side.b[0]},${side.b[1]}`);
      if (!from || !to) continue;
      border.push({ from, to, at: side.at });
    }
  }

  return { cells: folded, makesBox, reason, points, border };
};

/**
 * 접었을 때 어느 점과 어느 점이 만나는지입니다.
 * 이름 하나를 주면 그 점과 만나는 다른 점의 이름을 모두 돌려줍니다.
 */
export const meetingPoints = (folded: Folded, name: string): string[] => {
  const here = folded.points.find((one) => one.name === name);
  if (!here) return [];
  return folded.points.filter((one) => one.name !== name && keyOf(one.at) === keyOf(here.at)).map((one) => one.name);
};

/** 접었을 때 겹치는 선분입니다. 잘린 모서리는 늘 둘씩 짝을 이룹니다. */
export const overlappingSegment = (folded: Folded, from: string, to: string): string | null => {
  const here = folded.border.find(
    (one) => (one.from === from && one.to === to) || (one.from === to && one.to === from),
  );
  if (!here) return null;
  const wanted = [keyOf(here.at[0]), keyOf(here.at[1])].sort().join('|');
  const mate = folded.border.find((one) => {
    if (one === here) return false;
    return [keyOf(one.at[0]), keyOf(one.at[1])].sort().join('|') === wanted;
  });
  return mate ? `선분 ${mate.from}${mate.to}` : null;
};

/** 접었을 때 서로 마주 보는(평행한) 면입니다. 칸 번호로 짝지어 줍니다. */
export const oppositeCells = (folded: Folded): Array<[number, number]> => {
  const pairs: Array<[number, number]> = [];
  for (let a = 0; a < folded.cells.length; a += 1) {
    for (let b = a + 1; b < folded.cells.length; b += 1) {
      // 마주 보는 두 면은 한가운데를 이은 선이 상자의 한가운데를
      // 지납니다. 곧 두 면은 서로 닿지 않습니다 — 꼭짓점을 하나도
      // 함께 쓰지 않습니다.
      const left = new Set(folded.cells[a].corners.map(keyOf));
      const shared = folded.cells[b].corners.some((corner) => left.has(keyOf(corner)));
      if (!shared) pairs.push([a, b]);
    }
  }
  return pairs;
};
