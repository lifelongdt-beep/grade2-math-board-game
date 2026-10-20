import type { DrawGoal, GridPoint, GridSegment, PolygonGoal } from '../../types';
import { 고르개, 사이, 섞기, 이름들, type 조작갈래, type 조작틀 } from './common';
import { 시계로돌리기, 반대로돌리기, 좌우뒤집기, 위아래뒤집기, 칸바로놓기, 놓인칸 } from './check';

// ════════════════════════════════════════════════════════════════════
// 모눈 위의 조작: 점 찍기, 선 잇기, 도형 밀기·뒤집기·돌리기
// ════════════════════════════════════════════════════════════════════

const 닫힌선 = (ps: GridPoint[]): GridSegment[] => ps.map((p, i) => [p, ps[(i + 1) % ps.length]] as GridSegment);
const 방향말 = (dx: number, dy: number) =>
  [dx ? `${dx > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(dx)}칸` : '', dy ? `${dy > 0 ? '아래쪽' : '위쪽'}으로 ${Math.abs(dy)}칸` : ''].filter(Boolean).join(', ');

// ── 점의 이동(4-1 4단원) ────────────────────────────────────────────
export const 점이동 = (거꾸로: boolean): 조작갈래 => ({
  id: `point-move-${거꾸로 ? 'back' : 'go'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const cols = 10;
    const rows = 7;
    const a: GridPoint = [사이(next, 0, cols), 사이(next, 0, rows)];
    const dx = (next(2) ? 1 : -1) * 사이(next, 1, 5);
    const dy = (next(2) ? 1 : -1) * 사이(next, 0, 4);
    const b: GridPoint = [a[0] + dx, a[1] + dy];
    if (b[0] < 0 || b[0] > cols || b[1] < 0 || b[1] > rows) return null;
    if (!거꾸로) {
      return {
        prompt: `점 ㄱ을 ${방향말(dx, dy)} 이동한 자리에 점을 찍어 보세요.`,
        answer: '이동한 자리에 점을 찍음',
        manipulate: { kind: 'grid-point', cols, rows, shapes: [], marks: [{ at: a, name: 'ㄱ' }], target: [b], pointName: 'ㄴ', guide: [[a, [b[0], a[1]]], [[b[0], a[1]], b]] },
        tag: 'shape',
        strategy: '점을 정한 방향과 칸 수만큼 이동하기',
        hint: '가로로 먼저 칸을 세어 옮기고, 그다음 세로로 칸을 세어 옮겨요. 점이 아니라 칸을 세요.',
        steps: [`점 ㄱ에서 ${방향말(dx, 0) || '가로로는 움직이지 않고'} 갑니다.`, dy ? `그 자리에서 ${방향말(0, dy)} 갑니다.` : '세로로는 움직이지 않습니다.', `그러므로 점 ㄱ을 ${방향말(dx, dy)} 이동한 자리는 처음 자리에서 그만큼 떨어진 점입니다.`],
        concept: '점을 이동할 때는 방향과 칸 수를 차례로 세어 옮깁니다.',
        misconception: '칸이 아니라 점(선)을 세면 한 칸씩 어긋납니다.',
        결: 1,
        실수: ([
          // 방향을 반대로 옮기거나, 가로와 세로의 칸 수를 바꾸어 옮기는 실수입니다.
          [[a[0] - dx, a[1] - dy], `칸 수는 맞게 셌지만 방향을 반대로 옮겼습니다. ${방향말(dx, dy)} 옮겨야 합니다.`],
          [[a[0] + Math.sign(dx) * Math.abs(dy), a[1] + Math.sign(dy || 1) * Math.abs(dx)], '방향은 맞게 잡았지만 가로로 갈 칸 수와 세로로 갈 칸 수를 바꾸어 옮겼습니다.'],
        ] as [GridPoint, string][]).filter(([p]) => p[0] >= 0 && p[1] >= 0 && p[0] <= cols && p[1] <= rows && (p[0] !== b[0] || p[1] !== b[1]))
          .map(([pt, 말]) => ({ state: { kind: 'grid-point', pt }, 말 })),
      };
    }
    return {
      prompt: `어떤 점을 ${방향말(dx, dy)} 이동했더니 점 ㄴ이 되었습니다. 처음 점의 자리를 찍어 보세요.`,
      answer: '처음 점의 자리를 찍음',
      manipulate: { kind: 'grid-point', cols, rows, shapes: [], marks: [{ at: b, name: 'ㄴ' }], target: [a], pointName: '처음', guide: [[b, [a[0], b[1]]], [[a[0], b[1]], a]] },
      tag: 'shape',
      strategy: '이동을 거꾸로 생각하여 처음 자리 찾기',
      hint: '이동한 방향의 반대쪽으로 같은 칸 수만큼 되돌아가 보세요.',
      steps: [`점 ㄴ은 처음 점을 ${방향말(dx, dy)} 옮긴 자리입니다.`, `처음 자리로 가려면 반대로 ${방향말(-dx, -dy)} 옮깁니다.`, `방향은 반대로, 칸 수는 그대로 되돌리면 처음 점의 자리가 됩니다.`],
      concept: '이동을 되돌릴 때는 반대 방향으로 같은 칸 수만큼 옮깁니다.',
      misconception: '문제에 적힌 방향 그대로 옮기면 처음 자리에서 더 멀어집니다.',
      결: 2,
      실수: ([
        // 되돌리지 않고 문제에 적힌 방향 그대로 한 번 더 옮기는 실수입니다.
        [[b[0] + dx, b[1] + dy], `처음 자리를 찾으려면 반대로 되돌아가야 하는데, 문제에 적힌 방향(${방향말(dx, dy)}) 그대로 점 ㄴ을 한 번 더 옮겼습니다.`],
        // 가로와 세로의 칸 수를 바꾸어 되돌린 실수입니다.
        [[b[0] - Math.sign(dx) * Math.abs(dy), b[1] - Math.sign(dy || 1) * Math.abs(dx)], '방향은 반대로 잡았지만 가로로 갈 칸 수와 세로로 갈 칸 수를 바꾸어 되돌렸습니다.'],
      ] as [GridPoint, string][]).filter(([p]) => p[0] >= 0 && p[1] >= 0 && p[0] <= cols && p[1] <= rows && (p[0] !== a[0] || p[1] !== a[1]))
        .map(([pt, 말]) => ({ state: { kind: 'grid-point', pt }, 말 })),
    };
  },
});

// ── 대칭의 대응점(5-2 3단원) ───────────────────────────────────────
const 반쪽도형 = (next: (n: number) => number, 축: number): GridPoint[] => {
  // 축 위의 두 점과, 축 오른쪽의 꼭짓점 두세 개로 된 반쪽입니다.
  const 위 = 사이(next, 0, 1);
  const 아래 = 사이(next, 5, 6);
  const 가운데 = 사이(next, 2, 4);
  const 바깥: GridPoint[] = [[축 + 사이(next, 1, 3), 위 + 사이(next, 0, 1)], [축 + 사이(next, 2, 4), 가운데], [축 + 사이(next, 1, 3), 아래 - 사이(next, 0, 1)]];
  return [[축, 위], ...바깥, [축, 아래]];
};

export const 선대칭대응점: 조작갈래 = {
  id: 'line-sym-point',
  make: (seed) => {
    const next = 고르개(seed);
    const 축 = 5;
    const 반 = 반쪽도형(next, 축);
    const 고를 = 1 + next(3);
    const p = 반[고를];
    const q: GridPoint = [2 * 축 - p[0], p[1]];
    const 이름 = 이름들.slice(0, 반.length);
    return {
      prompt: `선대칭도형의 반쪽입니다. 점 ${이름[고를]}의 대응점을 찍어 보세요.`,
      answer: `점 ${이름[고를]}의 대응점을 찍음`,
      manipulate: { kind: 'grid-point', cols: 10, rows: 7, shapes: [{ pts: 반, closed: false }], marks: 반.map((at, k) => ({ at, name: 이름[k] })), axis: { x: 축 }, target: [q], pointName: `${이름[고를]}의 대응점`, guide: [[p, q]] },
      tag: 'shape',
      strategy: '대칭축에 수직인 선을 긋고 같은 거리에 대응점 찍기',
      hint: `점 ${이름[고를]}에서 대칭축까지 몇 칸인지 세고, 축의 반대쪽으로 같은 칸 수만큼 가요.`,
      steps: [`점 ${이름[고를]}에서 대칭축에 수직인 선을 긋습니다.`, `점 ${이름[고를]}에서 대칭축까지는 ${p[0] - 축}칸입니다.`, `대응점은 대칭축에서 반대쪽으로 같은 거리(${p[0] - 축}칸)에 있으므로 그 자리에 찍습니다.`],
      concept: '선대칭도형에서 대응점을 이은 선분은 대칭축과 수직으로 만나고, 대칭축이 그 선분을 똑같이 둘로 나눕니다.',
      misconception: '대칭축에서의 거리가 아니라 도형 끝에서 칸을 세면 어긋납니다.',
      결: 1,
    };
  },
};

export const 점대칭대응점: 조작갈래 = {
  id: 'point-sym-point',
  make: (seed) => {
    const next = 고르개(seed);
    const c: GridPoint = [5, 4];
    const 반: GridPoint[] = [[c[0] - 사이(next, 2, 4), c[1]], [c[0] - 사이(next, 1, 3), c[1] - 사이(next, 2, 3)], [c[0] + 사이(next, 1, 3), c[1] - 사이(next, 1, 3)], [c[0] + 사이(next, 2, 4), c[1]]];
    const 고를 = next(4);
    const p = 반[고를];
    const q: GridPoint = [2 * c[0] - p[0], 2 * c[1] - p[1]];
    if (반.some((v) => v[0] === q[0] && v[1] === q[1])) return null;
    const 이름 = 이름들.slice(0, 4);
    return {
      prompt: `점대칭도형의 반쪽과 대칭의 중심(빨간 점)입니다. 점 ${이름[고를]}의 대응점을 찍어 보세요.`,
      answer: `점 ${이름[고를]}의 대응점을 찍음`,
      manipulate: { kind: 'grid-point', cols: 10, rows: 8, shapes: [{ pts: 반, closed: false }], marks: 반.map((at, k) => ({ at, name: 이름[k] })), center: c, target: [q], pointName: `${이름[고를]}의 대응점`, guide: [[p, q]] },
      tag: 'shape',
      strategy: '대칭의 중심을 지나는 선을 긋고 같은 거리에 대응점 찍기',
      hint: `점 ${이름[고를]}에서 대칭의 중심까지 가로·세로로 몇 칸인지 세고, 중심에서 같은 만큼 더 가요.`,
      steps: [`점 ${이름[고를]}과(와) 대칭의 중심을 잇는 선을 긋고 길게 늘입니다.`, `점 ${이름[고를]}에서 중심까지는 ${방향말(c[0] - p[0], c[1] - p[1])}입니다.`, `대응점은 중심에서 같은 방향으로 같은 거리만큼 더 간 곳, 곧 중심에서 ${방향말(c[0] - p[0], c[1] - p[1])} 더 간 자리입니다.`],
      concept: '점대칭도형에서 대응점을 이은 선분은 대칭의 중심을 지나고, 중심이 그 선분을 똑같이 둘로 나눕니다.',
      misconception: '점대칭인데 선대칭처럼 좌우로만 뒤집어 찍기 쉽습니다.',
      결: 1,
    };
  },
};

// ── 네 번째 꼭짓점 찍기(3-1 2단원, 4-2 4단원) ─────────────────────────
type 사각 = 'rect' | 'square' | 'parallelogram' | 'rhombus';
const 사각이름: Record<사각, string> = { rect: '직사각형', square: '정사각형', parallelogram: '평행사변형', rhombus: '마름모' };

export const 넷째꼭짓점 = (종류: 사각): 조작갈래 => ({
  id: `fourth-vertex-${종류}`,
  make: (seed) => {
    const next = 고르개(seed);
    let u: GridPoint;
    let v: GridPoint;
    if (종류 === 'rect') { u = [사이(next, 2, 5), 0]; v = [0, 사이(next, 2, 4)]; if (u[0] === v[1]) return null; }
    else if (종류 === 'square') { const k = 사이(next, 2, 4); u = [k, 0]; v = [0, k]; }
    else if (종류 === 'parallelogram') { u = [사이(next, 3, 5), 0]; v = [사이(next, 1, 2), 사이(next, 2, 3)]; }
    else { const a = 사이(next, 1, 2); const b = 사이(next, 2, 3); u = [a, b]; v = [a, -b]; }
    const ㄴ: GridPoint = [사이(next, 1, 3), 종류 === 'rhombus' ? 3 : 사이(next, 1, 2)];
    const ㄱ: GridPoint = [ㄴ[0] + v[0], ㄴ[1] + v[1]];
    const ㄷ: GridPoint = [ㄴ[0] + u[0], ㄴ[1] + u[1]];
    const ㄹ: GridPoint = [ㄱ[0] + u[0], ㄱ[1] + u[1]];
    const 모두 = [ㄱ, ㄴ, ㄷ, ㄹ];
    if (모두.some(([x, y]) => x < 0 || y < 0 || x > 9 || y > 7)) return null;
    const 이름 = 사각이름[종류];
    return {
      prompt: `점 ㄱ, ㄴ, ㄷ을 꼭짓점으로 하는 ${이름} ㄱㄴㄷㄹ을 만들려고 합니다. 꼭짓점 ㄹ이 될 점을 찍어 보세요.`,
      answer: `${이름}의 꼭짓점 ㄹ을 찍음`,
      manipulate: { kind: 'grid-point', cols: 9, rows: 7, shapes: [{ pts: [ㄱ, ㄴ, ㄷ], closed: false }], marks: [{ at: ㄱ, name: 'ㄱ' }, { at: ㄴ, name: 'ㄴ' }, { at: ㄷ, name: 'ㄷ' }], target: [ㄹ], pointName: 'ㄹ', guide: [[ㄷ, ㄹ], [ㄱ, ㄹ]] },
      tag: 'shape',
      strategy: `${이름}의 성질을 이용해 꼭짓점 찾기`,
      // 3학년(직사각형·정사각형)은 '평행'을 배우기 전이므로 길이와 직각으로만 말합니다.
      hint: 종류 === 'rect' || 종류 === 'square' ? '네 각이 모두 직각이 되어야 해요. 점 ㄴ에서 ㄷ으로 간 것과 같은 방향으로 같은 칸 수만큼, 점 ㄱ에서도 가 보세요.' : '마주 보는 변끼리 평행하고 길이가 같아요. 점 ㄴ에서 ㄷ으로 간 만큼 점 ㄱ에서도 똑같이 가 보세요.',
      steps: [종류 === 'rect' || 종류 === 'square' ? `${이름}은(는) 네 각이 모두 직각이고 마주 보는 변의 길이가 같습니다.` : `${이름}은(는) 마주 보는 두 쌍의 변이 서로 평행하고 길이가 같습니다.`, `점 ㄴ에서 점 ㄷ까지는 ${방향말(u[0], u[1])}입니다.`, `그러므로 꼭짓점 ㄹ은 점 ㄱ에서 똑같이 ${방향말(u[0], u[1])} 간 자리입니다.`],
      concept: 종류 === 'rect' || 종류 === 'square' ? `${이름}은(는) 네 각이 모두 직각인 사각형입니다.` : `${이름}의 마주 보는 변은 서로 평행하고 길이가 같습니다.`,
      misconception: '세 점만 보고 눈어림으로 찍으면 변의 길이나 방향이 어긋납니다.',
      결: 종류 === 'rect' || 종류 === 'square' ? 1 : 2,
    };
  },
});

/** 밑변이 주어진 이등변삼각형의 남은 꼭짓점(여러 곳이 답입니다) */
export const 이등변꼭짓점: 조작갈래 = {
  id: 'isosceles-apex',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 짧은 가로 밑변, 중: 긴 가로 밑변, 상: 세로로 놓인 밑변
    const 세로 = lv === 2;
    const 밑 = 2 * (lv === 0 ? 1 : 사이(next, 2, 3));
    const y = 세로 ? 사이(next, 0, 7 - 밑) : 사이(next, 4, 6);
    const x0 = 세로 ? 사이(next, 2, 6) : 사이(next, 1, 3);
    const a: GridPoint = [x0, y];
    const b: GridPoint = 세로 ? [x0, y + 밑] : [x0 + 밑, y];
    const target: GridPoint[] = [];
    if (세로) for (let px = 0; px <= 9; px += 1) { if (px !== x0) target.push([px, y + 밑 / 2]); }
    else for (let py = 0; py <= 7; py += 1) if (py !== y) target.push([x0 + 밑 / 2, py]);
    return {
      prompt: `선분 ㄱㄴ을 한 변으로 하는 이등변삼각형 ㄱㄴㄷ을 만들려고 합니다. 변 ㄱㄷ과 변 ㄴㄷ의 길이가 같도록 꼭짓점 ㄷ을 찍어 보세요.`,
      answer: '두 변의 길이가 같아지는 점을 찍음',
      manipulate: { kind: 'grid-point', cols: 9, rows: 7, shapes: [{ pts: [a, b], closed: false }], marks: [{ at: a, name: 'ㄱ' }, { at: b, name: 'ㄴ' }], target, pointName: 'ㄷ', guide: 세로 ? [[[0, y + 밑 / 2], [9, y + 밑 / 2]]] : [[[x0 + 밑 / 2, 0], [x0 + 밑 / 2, 7]]] },
      tag: 'shape',
      strategy: '두 점에서 같은 거리에 있는 점 찾기',
      hint: 세로 ? '점 ㄷ에서 점 ㄱ까지와 점 ㄴ까지가 같으려면, 점 ㄷ이 선분 ㄱㄴ의 가운데에서 왼쪽이나 오른쪽으로 곧게 간 곳에 있어야 해요.' : '점 ㄷ에서 점 ㄱ까지와 점 ㄴ까지가 같으려면, 점 ㄷ이 선분 ㄱㄴ의 가운데 위쪽이나 아래쪽에 있어야 해요.',
      steps: ['이등변삼각형은 두 변의 길이가 같습니다.', `점 ㄷ에서 점 ㄱ, 점 ㄴ까지의 거리가 같으려면 점 ㄷ은 선분 ㄱㄴ의 한가운데에서 ${세로 ? '좌우' : '위아래'}로 곧게 그은 선 위에 있어야 합니다.`, `선분 ㄱㄴ은 ${밑}칸이므로 가운데는 점 ㄱ에서 ${밑 / 2}칸 간 곳이고, 그 ${세로 ? '왼쪽이나 오른쪽' : '위나 아래'}의 점은 어느 것이나 답이 됩니다.`],
      concept: '이등변삼각형은 두 변의 길이가 같은 삼각형입니다.',
      misconception: '점 ㄷ을 한쪽 끝 바로 위에 찍으면 직각삼각형이 되고 두 변의 길이가 달라집니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
};

/** 원의 중심 찍기(3-2 3단원). 원은 모눈 위에 그립니다. */
export const 원중심: 조작갈래 = {
  id: 'circle-center',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const r = lv === 0 ? 2 : 3;
    const c: GridPoint = [사이(next, r, 9 - r), 사이(next, r, 7 - r)];
    // 원을 꼭짓점이 많은 닫힌 선으로 그립니다.
    const pts: GridPoint[] = Array.from({ length: 48 }, (_, k) => [c[0] + r * Math.cos((k / 48) * Math.PI * 2), c[1] + r * Math.sin((k / 48) * Math.PI * 2)] as GridPoint);
    if (lv === 2) {
      // 원 위의 한 점 ㄱ을 지나는 지름의 다른 끝점(중심을 지나 같은 거리만큼 더 간 점)
      const 쪽 = [[r, 0], [-r, 0], [0, r], [0, -r]][next(4)];
      const a: GridPoint = [c[0] + 쪽[0], c[1] + 쪽[1]];
      const b: GridPoint = [c[0] - 쪽[0], c[1] - 쪽[1]];
      return {
        prompt: '원 위의 점 ㄱ을 지나는 지름을 그으려고 합니다. 지름의 다른 끝점을 찍어 보세요.',
        answer: '지름의 다른 끝점을 찍음',
        manipulate: { kind: 'grid-point', cols: 9, rows: 7, shapes: [{ pts, closed: true }], marks: [{ at: a, name: 'ㄱ' }], target: [b], pointName: '끝점', guide: [[a, b]] },
        tag: 'shape',
        strategy: '지름은 원의 중심을 지난다는 것을 이용하기',
        hint: '지름은 원의 중심을 지나요. 먼저 원의 중심을 찾고, 점 ㄱ에서 중심까지 간 만큼 같은 방향으로 한 번 더 가 보세요.',
        steps: ['지름은 원 위의 두 점을 이으면서 원의 중심을 지나는 선분입니다.', `점 ㄱ에서 원의 중심까지는 반지름 ${r}칸입니다.`, '중심에서 같은 방향으로 반지름만큼 더 간 점이 지름의 다른 끝점입니다.'],
        concept: '한 원에서 지름은 반지름의 2배이고, 모든 지름은 원의 중심을 지납니다.',
        misconception: '중심을 지나지 않는 선분도 지름이라고 생각하기 쉽습니다.',
        결: 2,
      };
    }
    return {
      prompt: '원의 중심이 되는 점을 찍어 보세요.',
      answer: '원의 중심을 찍음',
      manipulate: { kind: 'grid-point', cols: 9, rows: 7, shapes: [{ pts, closed: true }], marks: [], target: [c], pointName: '중심', guide: [[[c[0] - r, c[1]], [c[0] + r, c[1]]], [[c[0], c[1] - r], [c[0], c[1] + r]]] },
      tag: 'shape',
      strategy: '원의 가장 긴 선분(지름)이 만나는 곳 찾기',
      hint: '원 위의 두 점을 이은 선분 가운데 가장 긴 것(지름)은 원의 중심을 지나요. 가로와 세로로 가장 긴 선분이 만나는 곳을 찾아보세요.',
      steps: ['원의 중심에서 원 위의 어느 점까지나 거리(반지름)가 같습니다.', '가로로 가장 긴 선분과 세로로 가장 긴 선분은 모두 지름이고, 원의 중심을 지납니다.', '두 지름이 만나는 점이 원의 중심입니다.'],
      concept: '원의 중심은 원 위의 모든 점에서 같은 거리에 있는 점입니다.',
      misconception: '원의 맨 위나 원 위의 점을 중심으로 생각하기 쉽습니다.',
      결: lv === 0 ? 0 : 1,
    };
  },
};

// ── 선 긋기·도형 그리기 ────────────────────────────────────────────
/** 상 수준에서는 모눈선에 나란하지 않은(비스듬한) 변이 있는 도형을 그립니다. */
type 비스듬히 = { 이름: string; 예: GridPoint[]; 힌트: string };
const 그리기 = (id: string, prompt: string, goal: PolygonGoal, example: GridPoint[], t: Omit<조작틀, 'prompt' | 'manipulate' | 'answer'>, answer: string, cols = 9, rows = 7, 상?: 비스듬히): 조작갈래 => ({
  id: `draw-${id}`,
  make: (_seed, lv = 0) => (lv === 2 && 상
    ? {
      ...t,
      prompt: `모눈의 점을 이어 모눈선에 나란하지 않은 변이 있는 ${상.이름}을 그려 보세요.`,
      answer,
      hint: 상.힌트,
      결: 2,
      manipulate: { kind: 'grid-draw', cols, rows, fixed: [], marks: [], goal: { type: 'polygon', goal: { ...goal, tilted: true } }, example: 닫힌선(상.예) },
    }
    : {
      ...t,
      prompt,
      answer,
      manipulate: { kind: 'grid-draw', cols, rows, fixed: [], marks: [], goal: { type: 'polygon', goal }, example: 닫힌선(example) },
    }),
});

const 그리기안내 = '점 두 개를 차례로 누르면 선이 그어지고, 이어서 다음 점을 누르면 계속 이어 그려져요. 처음 점까지 이어 도형을 닫아요.';

export const 삼각형그리기 = (종류?: 'acute' | 'right' | 'obtuse'): 조작갈래 => {
  const 이름 = 종류 ? { acute: '예각삼각형', right: '직각삼각형', obtuse: '둔각삼각형' }[종류] : '삼각형';
  const 예: GridPoint[] = 종류 === 'obtuse' ? [[1, 5], [6, 5], [8, 2]] : 종류 === 'right' ? [[2, 1], [2, 5], [7, 5]] : 종류 === 'acute' ? [[1, 5], [7, 5], [4, 1]] : [[2, 5], [6, 5], [3, 1]];
  return 그리기(`tri-${종류 ?? 'any'}`, `모눈의 점을 이어 ${이름}을 그려 보세요.`, { sides: 3, ...(종류 ? { triangle: 종류 } : {}) }, 예, {
    tag: 'shape',
    strategy: `${이름} 그리기`,
    hint: 종류 === 'right' ? '모눈의 가로선과 세로선은 직각으로 만나요. 한 꼭짓점에서 가로로 한 변, 세로로 한 변을 그은 다음 두 끝을 이어요.' : 종류 === 'obtuse' ? '한 각이 직각보다 크게 벌어지도록, 한 꼭짓점을 옆으로 멀리 비껴 찍어 보세요.' : 종류 === 'acute' ? '세 각이 모두 직각보다 작아야 해요. 꼭대기 점을 밑변의 가운데쯤 위에 두면 돼요.' : 그리기안내,
    steps: [`${이름}은(는) ${종류 === 'right' ? '한 각이 직각인' : 종류 === 'obtuse' ? '한 각이 둔각인' : 종류 === 'acute' ? '세 각이 모두 예각인' : '곧은 선 3개로 둘러싸인'} 도형입니다.`, '꼭짓점이 될 점 3개를 정합니다.', `세 점을 차례로 이어 닫으면 ${이름}이 됩니다.`],
    concept: 종류 ? `${이름}은(는) 각의 크기로 나눈 삼각형입니다.` : '삼각형은 곧은 선 3개로 둘러싸인 도형입니다.',
    misconception: '선이 끊어지거나 처음 점으로 돌아오지 않으면 도형이 되지 않습니다.',
    결: 종류 && 종류 !== 'right' ? 1 : 0,
  }, `${이름}을 그림`, 9, 7, {
    이름,
    예: 종류 === 'obtuse' ? [[1, 4], [5, 2], [8, 1]] : 종류 === 'right' ? [[2, 2], [5, 1], [6, 4]] : 종류 === 'acute' ? [[1, 5], [6, 3], [3, 1]] : [[2, 5], [6, 3], [3, 1]],
    힌트: 종류 === 'right'
      ? '비스듬한 변으로도 직각을 만들 수 있어요. 오른쪽으로 3칸·위로 1칸 간 변과, 오른쪽으로 1칸·아래로 3칸 간 변은 서로 직각이에요.'
      : '세 꼭짓점을 같은 가로줄이나 세로줄에 두지 말고 비껴 찍어 보세요. 그다음 각이 조건에 맞는지 확인해요.',
  });
};

export const 사각형그리기 = (종류: 'any' | 'rect' | 'square' | 'tiltSquare' | 'trapezoid' | 'parallelogram' | 'rhombus' | 'rectSize', w = 4, h = 2): 조작갈래 => {
  const 표: Record<string, { 이름: string; goal: PolygonGoal; 예: GridPoint[]; 힌트: string; 뜻: string; 결: 0 | 1 | 2 }> = {
    any: { 이름: '사각형', goal: { sides: 4 }, 예: [[1, 1], [6, 2], [7, 5], [2, 6]], 힌트: 그리기안내, 뜻: '사각형은 곧은 선 4개로 둘러싸인 도형입니다.', 결: 0 },
    rect: { 이름: '직사각형', goal: { sides: 4, rightAngles: 4, notAllSidesEqual: true }, 예: [[1, 1], [6, 1], [6, 4], [1, 4]], 힌트: '네 각이 모두 직각이 되도록 모눈의 가로선과 세로선을 따라 그려요. 정사각형이 아니게 가로와 세로의 길이를 다르게 해 보세요.', 뜻: '직사각형은 네 각이 모두 직각인 사각형입니다.', 결: 0 },
    rectSize: { 이름: `가로 ${w}칸, 세로 ${h}칸인 직사각형`, goal: { sides: 4, rightAngles: 4, width: w, height: h, axisAligned: true }, 예: [[1, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]], 힌트: '한 꼭짓점을 정하고, 가로로 칸을 세어 찍은 다음 세로로 칸을 세어 찍어요.', 뜻: '직사각형은 네 각이 모두 직각이고 마주 보는 변의 길이가 같습니다.', 결: 1 },
    square: { 이름: '정사각형', goal: { sides: 4, rightAngles: 4, allSidesEqual: true }, 예: [[2, 1], [5, 1], [5, 4], [2, 4]], 힌트: '네 변의 길이가 모두 같아야 해요. 가로 칸 수와 세로 칸 수를 똑같이 세어 그려요.', 뜻: '정사각형은 네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형입니다.', 결: 0 },
    tiltSquare: { 이름: '모눈선을 따르지 않는 비스듬한 정사각형', goal: { sides: 4, rightAngles: 4, allSidesEqual: true, tilted: true }, 예: [[3, 1], [6, 2], [5, 5], [2, 4]], 힌트: '오른쪽으로 3칸, 아래로 1칸 간 다음, 다음 변은 그 방향을 직각으로 돌려 왼쪽으로 1칸, 아래로 3칸 가 보세요.', 뜻: '정사각형은 놓인 방향과 상관없이 네 각이 직각이고 네 변의 길이가 같습니다.', 결: 2 },
    trapezoid: { 이름: '사다리꼴', goal: { sides: 4, minParallelPairs: 1 }, 예: [[2, 1], [5, 1], [7, 5], [1, 5]], 힌트: '위와 아래의 변을 모두 가로선을 따라 그으면 두 변이 평행해요. 그다음 양 끝을 이어요.', 뜻: '사다리꼴은 평행한 변이 한 쌍이라도 있는 사각형입니다.', 결: 1 },
    parallelogram: { 이름: '직사각형이 아닌 평행사변형', goal: { sides: 4, parallelPairs: 2, rightAngles: 0 }, 예: [[3, 1], [7, 1], [5, 5], [1, 5]], 힌트: '위의 변과 아래의 변을 같은 길이로 가로로 긋되, 위의 변을 옆으로 비껴 놓은 다음 양 끝을 이어요.', 뜻: '평행사변형은 마주 보는 두 쌍의 변이 서로 평행한 사각형입니다.', 결: 1 },
    rhombus: { 이름: '마름모', goal: { sides: 4, allSidesEqual: true }, 예: [[4, 1], [6, 4], [4, 7], [2, 4]], 힌트: '가운데 한 점에서 위·아래로 같은 칸, 왼쪽·오른쪽으로 같은 칸 떨어진 네 점을 찍고 이어 보세요.', 뜻: '마름모는 네 변의 길이가 모두 같은 사각형입니다.', 결: 1 },
  };
  const t = 표[종류];
  return 그리기(`quad-${종류}-${w}x${h}`, `모눈의 점을 이어 ${t.이름}을 그려 보세요.`, t.goal, t.예, {
    tag: 'shape',
    strategy: `${t.이름} 그리기`,
    hint: t.힌트,
    steps: [t.뜻, '조건에 맞도록 꼭짓점 4개를 정합니다.', `네 점을 차례로 이어 닫고, 변의 길이와 각을 확인하면 ${t.이름}이 됩니다.`],
    concept: t.뜻,
    misconception: '모양을 눈어림으로만 그리면 변의 길이나 각이 조건과 어긋납니다. 칸을 세어 확인해야 합니다.',
    결: t.결,
  }, `${t.이름}을 그림`, 9, 7, 기운[종류]);
};

const 기운: Partial<Record<string, 비스듬히>> = {
  any: { 이름: '사각형', 예: [[1, 3], [4, 1], [7, 4], [3, 6]], 힌트: '네 꼭짓점을 비껴 찍어 비스듬한 변이 생기게 하고, 곧은 선 4개로 둘러싸이게 이어요.' },
  rect: { 이름: '직사각형', 예: [[1, 3], [3, 1], [6, 4], [4, 6]], 힌트: '오른쪽으로 2칸·위로 2칸 간 변과 오른쪽으로 3칸·아래로 3칸 간 변은 서로 직각이에요. 네 각이 모두 직각이 되게 이어요.' },
  square: { 이름: '정사각형', 예: [[3, 1], [6, 2], [5, 5], [2, 4]], 힌트: '오른쪽으로 3칸·아래로 1칸 간 다음, 방향을 직각으로 돌려 왼쪽으로 1칸·아래로 3칸 가 보세요. 네 변을 모두 같은 칸 수로 가요.' },
  trapezoid: { 이름: '사다리꼴', 예: [[1, 4], [4, 1], [5, 2], [3, 4]], 힌트: '비스듬한 두 변을 같은 방향(오른쪽으로 1칸 갈 때 위로 1칸)으로 그으면 서로 평행해요. 그다음 양 끝을 이어요.' },
  parallelogram: { 이름: '평행사변형', 예: [[1, 3], [3, 1], [6, 2], [4, 4]], 힌트: '마주 보는 두 변을 같은 방향, 같은 칸 수로 그으면 평행하고 길이도 같아요.' },
  rhombus: { 이름: '마름모', 예: [[2, 1], [5, 2], [6, 5], [3, 4]], 힌트: '오른쪽으로 3칸·아래로 1칸, 오른쪽으로 1칸·아래로 3칸처럼 길이가 같은 비스듬한 변 네 개로 둘러싸 보세요.' },
};

/** 둘레·넓이가 정해진 도형(5-1 6단원). 답이 여러 가지인 문제입니다. */
export const 넓이그리기 = (종류: 'rect-area' | 'rect-perimeter' | 'parallelogram' | 'triangle' | 'trapezoid'): 조작갈래 => ({
  id: `area-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 작은 도형, 중: 중간, 상: 큰 도형(가로·세로를 여러 가지로 생각해야 함)
    if (종류 === 'rect-area' || 종류 === 'rect-perimeter') {
      const w = [사이(next, 2, 3), 사이(next, 3, 5), 사이(next, 5, 7)][lv];
      const h = [사이(next, 1, 2), 사이(next, 2, 3), 사이(next, 3, 5)][lv];
      if (w === h) return null;
      const 넓이 = w * h;
      const 둘레 = 2 * (w + h);
      const 넓이로 = 종류 === 'rect-area';
      return {
        prompt: 넓이로
          ? `모눈 한 칸의 넓이는 1 cm²입니다. 넓이가 ${넓이} cm²인 직사각형을 그려 보세요.`
          : `모눈 한 칸의 한 변은 1 cm입니다. 둘레가 ${둘레} cm인 직사각형을 그려 보세요.`,
        answer: 넓이로 ? `넓이가 ${넓이} cm²인 직사각형` : `둘레가 ${둘레} cm인 직사각형`,
        manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: 넓이로 ? { sides: 4, rightAngles: 4, area: 넓이, axisAligned: true } : { sides: 4, rightAngles: 4, perimeter: 둘레, axisAligned: true } }, example: 닫힌선([[1, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]]) },
        tag: 'measurement',
        strategy: 넓이로 ? '곱해서 넓이가 되는 가로와 세로 찾기' : '가로와 세로의 합이 둘레의 반이 되게 하기',
        hint: 넓이로 ? `(가로)×(세로)=${넓이}가 되는 두 수를 찾아 가로와 세로로 정해 보세요.` : `둘레는 (가로+세로)×2예요. 가로와 세로의 합이 ${둘레 / 2}이 되게 정해 보세요.`,
        steps: 넓이로
          ? ['직사각형의 넓이는 (가로)×(세로)입니다.', `곱이 ${넓이}이 되는 두 수, 예를 들어 ${w}과(와) ${h}을(를) 가로와 세로로 정합니다.`, `가로 ${w}칸, 세로 ${h}칸으로 그리면 넓이가 ${넓이} cm²입니다 — 곱이 ${넓이}인 다른 두 수로 그려도 맞습니다.`]
          : ['직사각형의 둘레는 (가로+세로)×2입니다.', `가로와 세로의 합은 ${둘레}÷2=${둘레 / 2}이어야 합니다.`, `예를 들어 가로 ${w}칸, 세로 ${h}칸으로 그리면 둘레가 ${둘레} cm입니다 — 합이 ${둘레 / 2}인 다른 두 수로 그려도 맞습니다.`],
        concept: 넓이로 ? '직사각형의 넓이는 (가로)×(세로)입니다.' : '직사각형의 둘레는 (가로+세로)×2입니다.',
        misconception: 넓이로 ? '둘레와 넓이를 헷갈리기 쉽습니다.' : '변 두 개만 더하고 둘레라고 생각하기 쉽습니다.',
        결: lv === 0 ? 1 : 2,
      };
    }
    const 밑 = [사이(next, 2, 3), 사이(next, 3, 4), 사이(next, 4, 5)][lv];
    const 높이 = [2, 사이(next, 2, 3), 사이(next, 3, 4)][lv];
    if (종류 === 'parallelogram') {
      const 넓이 = 밑 * 높이;
      const k = 사이(next, 1, 2);
      return {
        prompt: `모눈 한 칸의 넓이는 1 cm²입니다. 직사각형이 아니면서 넓이가 ${넓이} cm²인 평행사변형을 그려 보세요.`,
        answer: `넓이가 ${넓이} cm²인 평행사변형`,
        manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: { sides: 4, parallelPairs: 2, rightAngles: 0, area: 넓이 } }, example: 닫힌선([[1 + k, 1], [1 + k + 밑, 1], [1 + 밑, 1 + 높이], [1, 1 + 높이]]) },
        tag: 'measurement',
        strategy: '밑변과 높이로 평행사변형의 넓이 맞추기',
        hint: `평행사변형의 넓이는 (밑변)×(높이)예요. 곱이 ${넓이}이 되게 밑변과 높이를 정하고, 윗변을 옆으로 비껴 그려 보세요.`,
        steps: ['평행사변형의 넓이는 (밑변)×(높이)입니다.', `예를 들어 밑변 ${밑}칸, 높이 ${높이}칸이면 ${밑}×${높이}=${넓이}입니다.`, '윗변을 옆으로 몇 칸 비껴도 밑변과 높이가 같으면 넓이는 같습니다.'],
        concept: '평행사변형의 넓이는 (밑변)×(높이)입니다. 기울어져도 밑변과 높이가 같으면 넓이가 같습니다.',
        misconception: '비스듬한 변의 길이를 높이로 생각하기 쉽습니다.',
        결: lv === 0 ? 1 : 2,
      };
    }
    if (종류 === 'triangle') {
      const 넓이 = (밑 * 2 * 높이) / 2;
      const 꼭대기 = 사이(next, 0, 밑 * 2);
      return {
        prompt: `모눈 한 칸의 넓이는 1 cm²입니다. 넓이가 ${넓이} cm²인 삼각형을 그려 보세요.`,
        answer: `넓이가 ${넓이} cm²인 삼각형`,
        manipulate: { kind: 'grid-draw', cols: 10, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: { sides: 3, area: 넓이 } }, example: 닫힌선([[1, 1 + 높이], [1 + 밑 * 2, 1 + 높이], [1 + 꼭대기, 1]]) },
        tag: 'measurement',
        strategy: '밑변과 높이로 삼각형의 넓이 맞추기',
        hint: `삼각형의 넓이는 (밑변)×(높이)÷2예요. (밑변)×(높이)가 ${넓이 * 2}이 되게 정해 보세요.`,
        steps: ['삼각형의 넓이는 (밑변)×(높이)÷2입니다.', `(밑변)×(높이)가 ${넓이}×2=${넓이 * 2}이면 됩니다. 예를 들어 밑변 ${밑 * 2}칸, 높이 ${높이}칸입니다.`, '꼭대기 점을 밑변과 나란한 선 위 어디에 찍어도 높이가 같으므로 넓이가 같습니다.'],
        concept: '삼각형의 넓이는 (밑변)×(높이)÷2입니다.',
        misconception: '÷2를 빠뜨려 넓이가 2배인 삼각형을 그리기 쉽습니다.',
        결: lv === 0 ? 1 : 2,
      };
    }
    const 윗 = 사이(next, 1, 3);
    const 아랫 = 윗 + 2 * 사이(next, 1, 2);
    const 넓이 = ((윗 + 아랫) * 높이) / 2;
    const 비킴 = (아랫 - 윗) / 2;
    return {
      prompt: `모눈 한 칸의 넓이는 1 cm²입니다. 넓이가 ${넓이} cm²인 사다리꼴을 그려 보세요.`,
      answer: `넓이가 ${넓이} cm²인 사다리꼴`,
      manipulate: { kind: 'grid-draw', cols: 10, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: { sides: 4, minParallelPairs: 1, area: 넓이 } }, example: 닫힌선([[1 + 비킴, 1], [1 + 비킴 + 윗, 1], [1 + 아랫, 1 + 높이], [1, 1 + 높이]]) },
      tag: 'measurement',
      strategy: '윗변, 아랫변, 높이로 사다리꼴의 넓이 맞추기',
      hint: `사다리꼴의 넓이는 (윗변+아랫변)×(높이)÷2예요. (윗변+아랫변)×(높이)가 ${넓이 * 2}이 되게 정해 보세요.`,
      steps: ['사다리꼴의 넓이는 (윗변+아랫변)×(높이)÷2입니다.', `예를 들어 윗변 ${윗}칸, 아랫변 ${아랫}칸, 높이 ${높이}칸이면 (${윗}+${아랫})×${높이}÷2=${넓이}입니다.`, '윗변과 아랫변을 모두 가로선을 따라 그으면 두 변이 평행합니다.'],
      concept: '사다리꼴의 넓이는 (윗변+아랫변)×(높이)÷2입니다.',
      misconception: '윗변과 아랫변 가운데 하나만 쓰기 쉽습니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
});

/** 한 점을 지나고 주어진 선분에 수직인(평행한) 선분 긋기(3-1 직각, 4-2 수직·평행) */
export const 수직평행긋기 = (rel: 'perp' | 'parallel', 직각말 = false): 조작갈래 => ({
  id: `line-${rel}${직각말 ? '-right' : ''}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 기준 선분 — 하: 가로·세로, 중: 1:1로 기운 선, 상: 2:1로 기운 선(직각말은 늘 가로·세로)
    const 방향들: GridPoint[] = 직각말 || lv === 0 ? [[1, 0], [0, 1]] : lv === 1 ? [[1, 1], [1, -1]] : [[2, 1], [1, 2], [2, -1]];
    const d = 방향들[next(방향들.length)];
    const k = 직각말 ? 사이(next, 3, 5) : d[0] === 2 || d[1] === 2 ? 2 : 사이(next, 2, 4);
    const a: GridPoint = [사이(next, 1, 3), d[1] < 0 ? 사이(next, 4, 6) : 사이(next, 1, 3)];
    const b: GridPoint = [a[0] + d[0] * k, a[1] + d[1] * k];
    if (b[0] > 9 || b[1] > 7 || b[1] < 0) return null;
    // 지나는 점: 수직이면 선분 위의 점(직각의 꼭짓점), 평행이면 선분 밖의 점
    const through: GridPoint = rel === 'perp' ? (직각말 ? a : [a[0] + d[0] * 사이(next, 1, k - 1), a[1] + d[1] * 사이(next, 1, k - 1)]) : [a[0] + (d[1] ? 2 : 0), a[1] + (d[1] ? 0 : 2)];
    if (through[0] > 9 || through[1] > 7) return null;
    const 짝: GridPoint = rel === 'perp' ? [through[0] - d[1], through[1] + d[0]] : [through[0] + d[0], through[1] + d[1]];
    const 끝: GridPoint = rel === 'perp' ? [through[0] - d[1] * 2, through[1] + d[0] * 2] : [through[0] + d[0] * 2, through[1] + d[1] * 2];
    const 예끝 = [끝, 짝, [through[0] + d[1] * 2, through[1] - d[0] * 2] as GridPoint].find(([x, y]) => x >= 0 && y >= 0 && x <= 9 && y <= 7) ?? 짝;
    const 이름 = 직각말 ? '직각' : rel === 'perp' ? '수선' : '평행선';
    const goal: DrawGoal = { type: 'line', through, rel, to: [a, b] };
    return {
      prompt: 직각말
        ? '점 ㄱ을 꼭짓점으로 하는 직각을 그리려고 합니다. 변 ㄱㄴ이 그어져 있습니다. 점 ㄱ에서 시작하는 선을 하나 더 그어 직각을 만들어 보세요.'
        : rel === 'perp'
          ? '점 ㄷ을 지나고 선분 ㄱㄴ에 수직인 선분을 그어 보세요.'
          : '점 ㄷ을 지나고 선분 ㄱㄴ에 평행한 선분을 그어 보세요.',
      answer: `${이름}을 바르게 그음`,
      manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [[a, b]], marks: [{ at: a, name: 'ㄱ' }, { at: b, name: 'ㄴ' }, ...(직각말 ? [] : [{ at: through, name: 'ㄷ' }])], goal, example: [[through, 예끝]] },
      tag: 'shape',
      strategy: 직각말 ? '모눈을 따라 직각 그리기' : `${이름} 긋기`,
      hint: rel === 'perp'
        ? d[0] && d[1] ? '선분 ㄱㄴ이 오른쪽으로 갈 때 아래(위)로 몇 칸 가는지 보세요. 수직인 선은 그 칸 수를 바꾸어, 방향을 직각으로 돌려 가요.' : '모눈의 가로선과 세로선은 서로 직각으로 만나요. 기준 선분과 다른 방향의 모눈선을 따라 그어 보세요.'
        : '평행한 선은 기준 선분과 같은 방향으로 가요. 선분 ㄱㄴ이 한 칸 갈 때마다 옆으로 몇 칸 가는지 똑같이 따라 그어 보세요.',
      steps: rel === 'perp'
        ? [직각말 ? '두 변이 만나서 이루는 각이 직각이 되어야 합니다.' : '두 직선이 만나서 이루는 각이 직각이면 두 직선은 서로 수직입니다.', d[0] && d[1] ? `선분 ㄱㄴ은 오른쪽으로 ${d[0]}칸 갈 때 ${d[1] > 0 ? '아래' : '위'}로 ${Math.abs(d[1])}칸 갑니다. 수직인 선은 ${d[1] > 0 ? '왼쪽' : '오른쪽'}으로 ${Math.abs(d[1])}칸 갈 때 아래로 ${d[0]}칸 갑니다.` : '기준 선분이 가로선이면 세로선을, 세로선이면 가로선을 따라 긋습니다.', `점 ${직각말 ? 'ㄱ' : 'ㄷ'}을 지나도록 그 방향으로 그으면 ${이름}이 됩니다.`]
        : ['서로 만나지 않는 두 직선을 평행하다고 합니다.', `선분 ㄱㄴ과 같은 방향(오른쪽으로 ${d[0]}칸, ${d[1] >= 0 ? '아래' : '위'}로 ${Math.abs(d[1])}칸씩)으로 가는 선은 아무리 늘여도 만나지 않습니다.`, '점 ㄷ에서 시작하여 그 방향으로 그으면 평행선이 됩니다.'],
      concept: 직각말 ? '종이를 반듯하게 두 번 접었을 때 생기는 각을 직각이라고 합니다.' : rel === 'perp' ? '두 직선이 직각으로 만날 때 서로 수직이라고 합니다.' : '서로 만나지 않는 두 직선을 평행하다고 합니다.',
      misconception: 직각말 ? '모눈의 선을 따르지 않고 비스듬히 그으면 직각이 되지 않습니다.' : rel === 'perp' ? '비스듬한 선분에 수직인 선을 눈어림으로 그으면 직각이 되지 않습니다.' : '기준 선분과 길이만 같게 그리고 방향을 맞추지 않기 쉽습니다.',
      결: 직각말 ? (lv === 2 ? 1 : 0) : lv === 0 ? 1 : 2,
    };
  },
});

/** 다각형의 대각선 모두 긋기(4-2 6단원) */
export const 대각선긋기: 조작갈래 = {
  id: 'diagonals',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 사각형, 중: 오각형, 상: 육각형
    const 도형들: GridPoint[][][] = [
      [[[1, 1], [6, 1], [7, 5], [2, 5]], [[2, 0], [7, 2], [6, 6], [0, 4]]],
      [[[3, 0], [6, 2], [5, 6], [1, 6], [0, 2]], [[2, 1], [7, 1], [8, 4], [5, 6], [1, 5]]],
      [[[3, 0], [6, 0], [8, 3], [6, 6], [3, 6], [1, 3]], [[2, 0], [6, 1], [8, 4], [6, 6], [2, 6], [0, 3]]],
    ];
    const ps = 도형들[lv][next(도형들[lv].length)];
    const 변 = 닫힌선(ps);
    const 대각선: GridSegment[] = [];
    for (let i = 0; i < ps.length; i += 1) for (let j = i + 2; j < ps.length; j += 1) if (!(i === 0 && j === ps.length - 1)) 대각선.push([ps[i], ps[j]]);
    const n = ps.length;
    const 이름 = ['', '', '', '삼각형', '사각형', '오각형', '육각형'][n];
    return {
      prompt: `${이름}의 대각선을 모두 그어 보세요.`,
      answer: `대각선 ${대각선.length}개를 모두 그음`,
      manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: 변, marks: [], goal: { type: 'exact', segs: [...변, ...대각선] } },
      tag: 'shape',
      strategy: '꼭짓점마다 이웃하지 않는 꼭짓점과 이어 대각선 긋기',
      hint: '한 꼭짓점을 정해 이웃하지 않은 꼭짓점과 모두 이은 다음, 다음 꼭짓점으로 옮겨 가며 빠뜨린 것이 없는지 보세요.',
      steps: ['대각선은 서로 이웃하지 않는 두 꼭짓점을 이은 선분입니다.', `한 꼭짓점에서 그을 수 있는 대각선은 ${n - 3}개입니다.`, `${n}×${n - 3}÷2=${대각선.length}이므로 대각선은 모두 ${대각선.length}개입니다 — 같은 대각선을 두 번 세지 않도록 2로 나눕니다.`],
      concept: '다각형에서 이웃하지 않는 두 꼭짓점을 이은 선분을 대각선이라고 합니다.',
      misconception: '변을 대각선으로 생각하거나, 같은 대각선을 두 번 세기 쉽습니다.',
      결: n > 4 ? 2 : 1,
    };
  },
};

/** 선대칭·점대칭도형 완성하기, 합동인 도형 그리기(5-2 3단원) */
export const 대칭완성 = (종류: 'line' | 'point'): 조작갈래 => ({
  id: `sym-complete-${종류}`,
  make: (seed) => {
    const next = 고르개(seed);
    if (종류 === 'line') {
      const 축 = 5;
      const 반 = 반쪽도형(next, 축);
      const 반대 = 반.map(([x, y]) => [2 * 축 - x, y] as GridPoint);
      const 주어진 = 반.slice(0, -1).map((p, i) => [p, 반[i + 1]] as GridSegment);
      const 그릴 = 반대.slice(0, -1).map((p, i) => [p, 반대[i + 1]] as GridSegment);
      return {
        prompt: '대칭축(빨간 점선)을 기준으로 선대칭도형이 되도록 나머지 반쪽을 그려 보세요.',
        answer: '선대칭도형을 완성함',
        manipulate: { kind: 'grid-draw', cols: 10, rows: 7, fixed: 주어진, marks: [], axis: { x: 축 }, goal: { type: 'exact', segs: [...주어진, ...그릴] }, guide: 반.slice(1, -1).map((p) => [p, [2 * 축 - p[0], p[1]]] as GridSegment) },
        tag: 'shape',
        strategy: '대응점을 먼저 찍고 차례로 이어 선대칭도형 완성하기',
        hint: '꼭짓점마다 대칭축까지 몇 칸인지 세어, 축의 반대쪽 같은 칸에 대응점을 정한 다음 차례로 이어요.',
        steps: ['각 꼭짓점에서 대칭축에 수직인 선을 긋습니다.', '대칭축에서 같은 거리만큼 반대쪽에 대응점을 찍습니다.', '대응점을 처음 반쪽과 같은 차례로 이으면 선대칭도형이 완성됩니다.'],
        concept: '선대칭도형은 대칭축으로 접었을 때 완전히 겹치는 도형입니다.',
        misconception: '대칭축과의 거리를 세지 않고 모양만 비슷하게 그리면 접었을 때 겹치지 않습니다.',
        결: 2,
      };
    }
    const c: GridPoint = [5, 4];
    const 반: GridPoint[] = [[c[0] - 사이(next, 2, 4), c[1]], [c[0] - 사이(next, 1, 3), c[1] - 사이(next, 2, 3)], [c[0] + 사이(next, 1, 2), c[1] - 사이(next, 2, 3)], [c[0] + 사이(next, 2, 4), c[1]]];
    const 반대 = 반.map(([x, y]) => [2 * c[0] - x, 2 * c[1] - y] as GridPoint);
    const 주어진 = 반.slice(0, -1).map((p, i) => [p, 반[i + 1]] as GridSegment);
    const 그릴 = 반대.slice(0, -1).map((p, i) => [p, 반대[i + 1]] as GridSegment);
    return {
      prompt: '대칭의 중심(빨간 점)을 기준으로 점대칭도형이 되도록 나머지 반쪽을 그려 보세요.',
      answer: '점대칭도형을 완성함',
      manipulate: { kind: 'grid-draw', cols: 10, rows: 8, fixed: 주어진, marks: [], center: c, goal: { type: 'exact', segs: [...주어진, ...그릴] }, guide: 반.slice(1, -1).map((p) => [p, [2 * c[0] - p[0], 2 * c[1] - p[1]]] as GridSegment) },
      tag: 'shape',
      strategy: '중심을 지나는 선 위에 대응점을 찍고 이어 점대칭도형 완성하기',
      hint: '꼭짓점에서 중심까지 가로·세로로 몇 칸인지 세고, 중심에서 같은 방향으로 같은 칸만큼 더 가서 대응점을 찍어요.',
      steps: ['각 꼭짓점에서 대칭의 중심을 지나는 선을 긋습니다.', '중심에서 같은 거리만큼 반대쪽에 대응점을 찍습니다.', '대응점을 차례로 이으면 180° 돌렸을 때 처음과 겹치는 점대칭도형이 됩니다.'],
      concept: '점대칭도형은 어떤 점을 중심으로 180° 돌렸을 때 처음 도형과 완전히 겹치는 도형입니다.',
      misconception: '점대칭인데 좌우로만 뒤집어 그리기 쉽습니다.',
      결: 2,
    };
  },
});

export const 합동그리기: 조작갈래 = {
  id: 'congruent-draw',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 모눈선을 따른 도형, 중: 비스듬한 변이 있는 도형, 상: 비스듬한 변이 여럿이고 돌려서 그리기
    const 도형들: GridPoint[][][] = [
      [[[0, 0], [3, 0], [3, 2], [0, 2]], [[0, 0], [2, 0], [2, 1], [3, 1], [3, 3], [0, 3]], [[0, 0], [4, 0], [4, 2], [0, 2]]],
      [[[0, 0], [3, 0], [3, 2], [1, 3]], [[0, 0], [2, 0], [3, 3], [0, 2]], [[0, 0], [4, 0], [1, 3]]],
      [[[1, 0], [3, 1], [2, 3], [0, 2]], [[0, 1], [3, 0], [4, 2], [1, 3]], [[0, 0], [3, 1], [1, 3]]],
    ];
    const 원 = 도형들[lv][next(도형들[lv].length)].map(([x, y]) => [x + 0, y + 1] as GridPoint);
    const 옆 = 5;
    return {
      prompt: lv === 2 ? '왼쪽 도형과 합동인 도형을 오른쪽 빈 곳에 그려 보세요. 처음 도형을 돌리거나 뒤집은 모양으로 그려도 됩니다.' : '왼쪽 도형과 합동인 도형을 오른쪽 빈 곳에 그려 보세요. 돌리거나 뒤집어 그려도 됩니다.',
      answer: '합동인 도형을 그림',
      manipulate: { kind: 'grid-draw', cols: 10, rows: 5, fixed: 닫힌선(원), marks: [], goal: { type: 'congruent', shape: 원 }, example: 닫힌선(원.map(([x, y]) => [x + 옆 + 1, y] as GridPoint)) },
      tag: 'shape',
      strategy: '대응하는 변의 길이와 각을 같게 옮겨 그리기',
      hint: '왼쪽 도형의 한 꼭짓점에서 다음 꼭짓점까지 가로·세로로 몇 칸인지 세고, 오른쪽에서도 똑같이 세어 찍어요.',
      steps: ['합동인 두 도형은 대응변의 길이와 대응각의 크기가 각각 같습니다.', '왼쪽 도형의 꼭짓점을 하나씩 칸 수를 세어 오른쪽으로 옮겨 찍습니다.', '찍은 꼭짓점을 같은 차례로 이으면 포개었을 때 완전히 겹치는 합동인 도형이 됩니다.'],
      concept: '모양과 크기가 같아서 포개었을 때 완전히 겹치는 두 도형을 서로 합동이라고 합니다.',
      misconception: '모양만 비슷하고 크기(칸 수)가 다르면 합동이 아닙니다.',
      결: lv === 2 ? 2 : 1,
    };
  },
};

/** 네 점(또는 세 점)을 잇는 선분 모두 긋기(3-1 선분) */
export const 선분모두: 조작갈래 = {
  id: 'all-segments',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 점 3개, 중: 점 4개, 상: 점 5개
    const 점들: GridPoint[][][] = [
      [[[1, 2], [5, 1], [7, 5]], [[2, 5], [4, 1], [7, 4]]],
      [[[1, 1], [6, 1], [7, 5], [2, 5]], [[2, 1], [7, 2], [4, 6], [1, 4]]],
      [[[1, 1], [5, 0], [7, 3], [4, 5], [0, 4]], [[2, 0], [6, 1], [7, 4], [3, 6], [0, 3]]],
    ];
    const ps = 점들[lv][next(점들[lv].length)];
    const segs: GridSegment[] = [];
    for (let i = 0; i < ps.length; i += 1) for (let j = i + 1; j < ps.length; j += 1) segs.push([ps[i], ps[j]]);
    const 이름 = 이름들.slice(0, ps.length);
    return {
      prompt: `점 ${이름.join(', ')} 가운데 두 점을 이어 그을 수 있는 선분을 모두 그어 보세요.`,
      answer: `선분 ${segs.length}개를 모두 그음`,
      manipulate: { kind: 'grid-draw', cols: 8, rows: 6, fixed: [], marks: ps.map((at, k) => ({ at, name: 이름[k] })), goal: { type: 'exact', segs } },
      tag: 'shape',
      strategy: '빠짐없이 두 점씩 이어 선분 긋기',
      hint: '점 ㄱ에서 다른 점으로 모두 잇고, 다음에 점 ㄴ에서 아직 잇지 않은 점으로 이어 가며 빠뜨리지 않게 해요.',
      steps: ['선분은 두 점을 곧게 이은 선입니다.', `${이름.slice(0, -1).map((x, i) => `점 ${x}에서 ${ps.length - 1 - i}개`).join(', ')}를 긋습니다(앞에서 이은 점은 다시 잇지 않습니다).`, `그러므로 선분은 모두 ${segs.length}개입니다.`],
      concept: '두 점을 곧게 이은 선을 선분이라고 합니다.',
      misconception: '같은 선분을 두 번 세거나 빠뜨리기 쉽습니다.',
      결: 2,
    };
  },
};

// ── 도형 밀기·뒤집기·돌리기(4-1 4단원) ──────────────────────────────
// 돌리거나 뒤집으면 모양이 달라지는(대칭이 없는) 조각만 씁니다.
const 조각들: GridPoint[][] = [
  [[0, 0], [0, 1], [0, 2], [1, 2]],          // L
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]],  // F
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]],  // P
  [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]],  // N
  [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]],  // Y
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],  // S/Z 모양 5칸
];
const 같은모양 = (a: GridPoint[], b: GridPoint[]) => {
  const k = (c: GridPoint[]) => 칸바로놓기(c).map((p) => p.join(',')).join(' ');
  return k(a) === k(b);
};

type 움직임 = 'cw' | 'ccw' | 'cw180' | 'flipH' | 'flipV' | 'flipHflipV' | 'flipHcw' | 'cw270' | 'flipH2';
const 움직임말: Record<움직임, string> = {
  cw: '시계 방향으로 90°만큼 돌린',
  ccw: '시계 반대 방향으로 90°만큼 돌린',
  cw180: '시계 방향으로 180°만큼 돌린',
  cw270: '시계 방향으로 270°만큼 돌린',
  flipH: '오른쪽으로 뒤집은',
  flipV: '아래쪽으로 뒤집은',
  flipHflipV: '오른쪽으로 뒤집은 다음 아래쪽으로 뒤집은',
  flipHcw: '오른쪽으로 뒤집은 다음 시계 방향으로 90°만큼 돌린',
  flipH2: '오른쪽으로 두 번 뒤집은',
};
const 움직이기 = (c: GridPoint[], m: 움직임): GridPoint[] => {
  switch (m) {
    case 'cw': return 시계로돌리기(c);
    case 'ccw': return 반대로돌리기(c);
    case 'cw180': return 시계로돌리기(시계로돌리기(c));
    case 'cw270': return 반대로돌리기(c);
    case 'flipH': return 좌우뒤집기(c);
    case 'flipV': return 위아래뒤집기(c);
    case 'flipHflipV': return 위아래뒤집기(좌우뒤집기(c));
    case 'flipHcw': return 시계로돌리기(좌우뒤집기(c));
    case 'flipH2': return 칸바로놓기(c);
  }
};

export const 도형뒤집기돌리기 = (움직임들: 움직임[], tools: ('cw' | 'ccw' | 'flipH' | 'flipV')[], 결: 0 | 1 | 2): 조작갈래 => ({
  id: `shape-turn-${움직임들.join('-')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 조각 = 조각들[next(조각들.length)];
    const m = 움직임들[next(움직임들.length)];
    const 결과 = 움직이기(조각, m);
    // 두 번 뒤집기처럼 처음과 같아지는 문제는 그 자체가 묻는 것이므로 둡니다.
    if (m !== 'flipH2' && 같은모양(결과, 조각)) return null;
    // 시계 방향과 반대 방향의 결과가 같으면 방향을 아는지 가릴 수 없으므로 뺍니다.
    if ((m === 'cw' || m === 'ccw') && 같은모양(시계로돌리기(조각), 반대로돌리기(조각))) return null;
    const start: GridPoint = [2, 1];
    const 말 = 움직임말[m];
    const 뒤집기 = m.startsWith('flip');
    return {
      prompt: `도형을 ${말} 모양을 만들어 보세요. 아래 단추를 눌러 도형을 움직일 수 있습니다.`,
      answer: `${말} 모양`,
      manipulate: { kind: 'shape-move', cols: 8, rows: 6, cells: 조각, start, goal: { cells: 놓인칸(결과, start), place: false }, ghost: false, tools },
      tag: 'shape',
      strategy: 뒤집기 ? '도형을 뒤집으면 어떻게 되는지 알기' : '도형을 돌리면 어떻게 되는지 알기',
      hint: 뒤집기
        ? '오른쪽(왼쪽)으로 뒤집으면 왼쪽과 오른쪽이 서로 바뀌고, 아래쪽(위쪽)으로 뒤집으면 위쪽과 아래쪽이 서로 바뀌어요. ★ 칸이 어디로 가는지 보세요.'
        : '시계 방향으로 90°씩 돌리면 위쪽이 오른쪽으로, 오른쪽이 아래쪽으로 가요. ★ 칸을 따라가 보세요.',
      steps: [
        뒤집기 ? '도형을 오른쪽으로 뒤집으면 왼쪽과 오른쪽이, 아래쪽으로 뒤집으면 위쪽과 아래쪽이 서로 바뀝니다.' : '도형을 시계 방향으로 90°만큼 돌리면 도형의 위쪽 부분이 오른쪽으로 갑니다.',
        m === 'flipH2' ? '같은 방향으로 두 번 뒤집으면 처음 도형과 같아집니다.' : m === 'cw270' ? '시계 방향으로 270°만큼 돌린 것은 시계 반대 방향으로 90°만큼 돌린 것과 같습니다.' : m === 'flipHflipV' ? '오른쪽으로 뒤집고 다시 아래쪽으로 뒤집으면 180°만큼 돌린 것과 같습니다.' : m === 'cw180' ? '시계 방향으로 180°만큼 돌리면 위쪽과 아래쪽, 왼쪽과 오른쪽이 모두 바뀝니다.' : '움직이기 전과 후에 ★ 칸의 자리를 견주어 봅니다.',
        `그러므로 ${말} 모양은 처음 도형을 그 차례대로 움직인 모양입니다.`,
      ],
      concept: '도형을 뒤집거나 돌려도 모양과 크기는 그대로이고, 놓인 방향만 바뀝니다.',
      misconception: '시계 방향과 시계 반대 방향, 오른쪽으로 뒤집기와 아래쪽으로 뒤집기를 헷갈리기 쉽습니다.',
      결,
    };
  },
});

export const 도형밀기 = (두번: boolean): 조작갈래 => ({
  id: `shape-slide-${두번 ? 2 : 1}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 조각 = 조각들[next(조각들.length)];
    const start: GridPoint = [사이(next, 0, 2), 사이(next, 0, 1)];
    const dx = 사이(next, 2, 5);
    const dy = 두번 ? 0 : 사이(next, 0, 2);
    const 되돌 = 두번 ? 사이(next, 1, dx - 1) : 0;
    const 끝: GridPoint = [start[0] + dx - 되돌, start[1] + dy];
    const w = Math.max(...조각.map((c) => c[0])) + 1;
    const h = Math.max(...조각.map((c) => c[1])) + 1;
    if (start[0] + dx + w > 10 || 끝[1] + h > 6) return null;
    const 말 = 두번 ? `오른쪽으로 ${dx}칸 민 다음, 다시 왼쪽으로 ${되돌}칸 민` : `${방향말(dx, dy)} 민`;
    return {
      prompt: `도형을 끌어서 ${말} 자리에 놓아 보세요.`,
      answer: `${말} 자리`,
      manipulate: { kind: 'shape-move', cols: 10, rows: 6, cells: 조각, start, goal: { cells: 놓인칸(칸바로놓기(조각), 끝), place: true }, ghost: false, tools: ['move'] },
      tag: 'shape',
      strategy: 두번 ? '두 번 민 결과를 한 번에 생각하기' : '도형을 정한 방향과 칸 수만큼 밀기',
      hint: '도형의 한 꼭짓점(★ 칸의 모서리)을 정해 두고, 그 점이 몇 칸 움직이는지 세어요.',
      steps: ['도형을 밀면 모양은 그대로이고 자리만 바뀝니다.', 두번 ? `오른쪽으로 ${dx}칸 갔다가 왼쪽으로 ${되돌}칸 돌아오면 처음 자리에서 오른쪽으로 ${dx - 되돌}칸 간 것과 같습니다.` : `★ 칸이 ${방향말(dx, dy)} 가도록 옮깁니다.`, `그러므로 도형은 처음 자리에서 ${방향말(끝[0] - start[0], 끝[1] - start[1])} 간 자리에 놓입니다.`],
      concept: '도형을 밀면 모양과 방향은 그대로이고 위치만 바뀝니다.',
      misconception: '도형의 끝이 아니라 도형과 도형 사이의 빈칸을 세면 칸 수가 어긋납니다.',
      결: 두번 ? 2 : 1,
    };
  },
});

export const 쓰는조각 = 섞기(조각들, 고르개(1));
