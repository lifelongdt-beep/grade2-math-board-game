import type { NetLayout } from './box';

// ════════════════════════════════════════════════════════════════════
// 전개도 모양들
// ────────────────────────────────────────────────────────────────────
// 칸의 자리만 적어 둡니다. 그 모양이 정말 상자가 되는지는 적어 두지
// 않고 box.ts가 접어서 판단합니다. 여기 적힌 것이 틀리면 시험이 잡습니다.
// ════════════════════════════════════════════════════════════════════

type Spot = [number, number];

const layoutOf = (cols: number[], rows: number[], spots: Spot[]): NetLayout => ({
  cols,
  rows,
  cells: spots.map(([col, row]) => ({ col, row })),
});

const unitLayout = (width: number, height: number, spots: Spot[]): NetLayout =>
  layoutOf(Array(width).fill(1), Array(height).fill(1), spots);

// ── 정육면체의 전개도 열한 가지 ─────────────────────────────────────
// 지도서 이론적 배경: "정육면체의 전개도는 모서리를 자르는 방법에 따라
// 모두 11가지 모양이 있다." 여기 적힌 열하나가 정말 서로 다른 열한
// 가지인지는 시험이 6칸짜리 모양을 모두 만들어 보며 확인합니다.
export const CUBE_NETS: NetLayout[] = [
  unitLayout(4, 3, [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]]),
  unitLayout(5, 2, [[2, 0], [3, 0], [4, 0], [0, 1], [1, 1], [2, 1]]),
  unitLayout(4, 3, [[2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [2, 2]]),
  unitLayout(4, 3, [[2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [1, 2]]),
  unitLayout(4, 3, [[2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [0, 2]]),
  unitLayout(4, 3, [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]),
  unitLayout(4, 3, [[2, 0], [3, 0], [1, 1], [2, 1], [0, 2], [1, 2]]),
  unitLayout(4, 3, [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]]),
  unitLayout(4, 3, [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]]),
  unitLayout(4, 3, [[2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]]),
  unitLayout(4, 3, [[2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]),
];

// ── 정육면체의 전개도가 될 수 없는 것들 ─────────────────────────────
// 지도서 7차시가 아이에게 말하게 하는 까닭 그대로입니다.
//   "정사각형인 면이 6개 있어야 하는데 5개만 있습니다"
//   "접었을 때 겹치는 면이 있습니다"
export const CUBE_NOT_NETS: NetLayout[] = [
  // 2칸씩 세 줄. 접으면 면이 겹칩니다.
  unitLayout(2, 3, [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]]),
  // 한 줄에 다섯. 접으면 면이 겹칩니다.
  unitLayout(5, 2, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]]),
  unitLayout(5, 2, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1]]),
  // ㄴ자로 굽은 모양.
  unitLayout(3, 4, [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3]]),
  // 다섯 칸뿐입니다.
  unitLayout(4, 2, [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1]]),
  unitLayout(3, 3, [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]),
];

// ── 직육면체의 전개도 ───────────────────────────────────────────────
// 칸의 크기가 서로 다릅니다. 세로줄 너비는 [세로, 가로, 세로, 가로],
// 가로줄 높이는 [세로, 높이, 세로]입니다. 이렇게 두면 맞닿는 두 변의
// 길이가 저절로 같아집니다.
export type BoxSize = { width: number; depth: number; height: number };

export const boxNetLayouts = (size: BoxSize): NetLayout[] => {
  const { width, depth, height } = size;
  const cols = [depth, width, depth, width];
  const rows = [depth, height, depth];
  const belt: Spot[] = [[0, 1], [1, 1], [2, 1], [3, 1]];
  // 가운데 띠 네 칸이 옆으로 둘러싸는 면이고, 위아래로 붙는 두 칸이
  // 밑면입니다. 밑면은 가로가 width인 칸(1번 줄과 3번 줄) 위아래에만
  // 붙일 수 있습니다 — 세로가 depth인 칸 위에 붙이면 크기가 맞지
  // 않습니다.
  return [
    layoutOf(cols, rows, [[1, 0], ...belt, [1, 2]]),
    layoutOf(cols, rows, [[1, 0], ...belt, [3, 2]]),
    layoutOf(cols, rows, [[3, 0], ...belt, [1, 2]]),
    layoutOf(cols, rows, [[3, 0], ...belt, [3, 2]]),
  ];
};

/** 직육면체의 전개도가 될 수 없는 것입니다. 맞닿는 선분의 길이가 다릅니다. */
export const brokenBoxNet = (size: BoxSize): NetLayout => {
  const { width, depth, height } = size;
  // 가운데 띠의 네 칸을 가로-가로-세로-세로 차례로 두면, 접었을 때
  // 만나는 두 선분의 길이가 달라집니다.
  return layoutOf([width, width, depth, depth], [depth, height, depth], [
    [1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2],
  ]);
};
