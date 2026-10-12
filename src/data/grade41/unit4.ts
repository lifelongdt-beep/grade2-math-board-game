import type { Difficulty, GridMoveVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 되돌아가기, 여러번돌리기 } from './thinking';

// ════════════════════════════════════════════════════════════════════
// 4-1 4단원 평면도형의 이동
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 밀기 / 뒤집기 / 돌리기 / 점의 이동
//
// 지도서가 못박은 것:
//   · 밀기·뒤집기는 위쪽, 아래쪽, 왼쪽, 오른쪽으로만 합니다.
//   · 돌리기는 시계 방향·시계 반대 방향으로 90°, 180°, 270°, 360°만
//     다룹니다.
//   · 뒤집고 돌리기처럼 두 가지를 이어 하는 이동은 다루지 않습니다.
//   · 점의 이동은 방향과 거리(몇 칸, 몇 cm)를 함께 말합니다.
//
// 도형은 모눈 칸으로 그리고, 이동한 결과도 칸을 옮겨 계산합니다. 첫 칸은
// 색을 달리 칠해 방향을 알아보게 합니다. 모양이 대칭이면 뒤집은 것과
// 돌린 것이 같아져 보기 둘이 정답이 될 수 있으므로, 보기 도형들이 서로
// 다를 때만 문항을 냅니다.
// ════════════════════════════════════════════════════════════════════

type Cell = [number, number];

// 대칭이 없는 모양들(첫 칸은 색칠한 칸)
const 모양들: Cell[][] = [
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  [[1, 0], [0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2]],
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
];

const 정돈 = (cells: Cell[]): Cell[] => {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]);
};
const 모양열쇠 = (cells: Cell[]) =>
  정돈(cells)
    .map(([x, y]) => `${x},${y}`)
    .sort()
    .join(';');

/** 화면 좌표(아래로 y 증가)에서 시계 방향 90° 돌리기 */
const 시계90 = (cells: Cell[]): Cell[] => 정돈(cells.map(([x, y]) => [-y, x]));
const 돌리기 = (cells: Cell[], 시계방향: boolean, deg: number): Cell[] => {
  let 횟수 = (deg / 90) % 4;
  if (!시계방향) 횟수 = (4 - 횟수) % 4;
  let out = 정돈(cells);
  for (let k = 0; k < 횟수; k += 1) out = 시계90(out);
  return out;
};
const 좌우뒤집기 = (cells: Cell[]): Cell[] => 정돈(cells.map(([x, y]) => [-x, y]));
const 상하뒤집기 = (cells: Cell[]): Cell[] => 정돈(cells.map(([x, y]) => [x, -y]));
const 옮기기 = (cells: Cell[], dx: number, dy: number): Cell[] => 정돈(cells).map(([x, y]) => [x + dx, y + dy]);

const 판크기 = 5;
const 보기이름 = ['가', '나', '다', '라'];

/** 처음 도형과 보기 네 개를 그린 그림을 만듭니다. 보기 도형이 서로 다르지 않으면 null입니다. */
const 보기그림 = (처음: Cell[], 보기: Cell[][], next: (b: number) => number): GridMoveVisual | null => {
  const keys = 보기.map(모양열쇠);
  if (new Set(keys).size !== 보기.length) return null;
  const 둘레 = (cells: Cell[]) => {
    const w = Math.max(...cells.map((c) => c[0])) + 1;
    const h = Math.max(...cells.map((c) => c[1])) + 1;
    return 옮기기(cells, 사이(next, 0, 판크기 - w), 사이(next, 0, 판크기 - h));
  };
  return {
    kind: 'grid-move',
    label: '처음 도형과 보기 도형',
    size: 판크기,
    panels: [{ name: '처음', cells: 옮기기(처음, 1, 1) }, ...보기.map((cells, k) => ({ name: 보기이름[k], cells: 둘레(cells) }))],
  };
};

const 섞기 = <T,>(next: (b: number) => number, xs: T[]): T[] => {
  const out = [...xs];
  for (let t = out.length - 1; t > 0; t -= 1) {
    const j = next(t + 1);
    [out[t], out[j]] = [out[j], out[t]];
  }
  return out;
};

const 방향들 = ['위쪽', '아래쪽', '왼쪽', '오른쪽'] as const;

// ── 밀기 ────────────────────────────────────────────────────────────
const 밀기: G5Family = {
  id: 'slide',
  make: (seed) => {
    const next = 고르개(seed);
    const 처음 = 정돈(모양들[next(모양들.length)]);
    const 방향 = 방향들[next(4)];
    const 칸 = 사이(next, 2, 5);
    const 후보 = [처음, 좌우뒤집기(처음), 상하뒤집기(처음), 돌리기(처음, true, 90)];
    const 순서 = 섞기(next, [0, 1, 2, 3]);
    const 그림 = 보기그림(처음, 순서.map((k) => 후보[k]), next);
    if (!그림) return null;
    const 답 = 보기이름[순서.indexOf(0)];
    return {
      prompt: `처음 도형을 ${방향}으로 ${칸}칸 밀었을 때의 도형은 어느 것일까요?`,
      answer: 답,
      wrongs: 보기이름.filter((x) => x !== 답),
      tag: 'transform',
      strategy: '도형 밀기',
      hint: '도형을 밀면 모양과 방향은 그대로이고 위치만 바뀌어요.',
      steps: ['밀기를 하면 도형의 모양과 방향이 변하지 않습니다.', `처음 도형과 모양, 방향이 똑같은 것은 ${답}입니다.`],
      misconceptionTip: '민 방향으로 도형이 기울거나 뒤집히지 않아요.',
      visual: 그림,
    };
  },
};

// ── 뒤집기 ──────────────────────────────────────────────────────────
const 뒤집기: G5Family = {
  id: 'flip',
  make: (seed) => {
    const next = 고르개(seed);
    const 처음 = 정돈(모양들[next(모양들.length)]);
    const 방향 = 방향들[next(4)];
    const 좌우 = 방향 === '왼쪽' || 방향 === '오른쪽';
    const 맞음 = 좌우 ? 좌우뒤집기(처음) : 상하뒤집기(처음);
    const 후보 = [맞음, 좌우 ? 상하뒤집기(처음) : 좌우뒤집기(처음), 처음, 돌리기(처음, true, 90)];
    const 순서 = 섞기(next, [0, 1, 2, 3]);
    const 그림 = 보기그림(처음, 순서.map((k) => 후보[k]), next);
    if (!그림) return null;
    const 답 = 보기이름[순서.indexOf(0)];
    return {
      prompt: `처음 도형을 ${방향}으로 뒤집었을 때의 도형은 어느 것일까요?`,
      answer: 답,
      wrongs: 보기이름.filter((x) => x !== 답),
      tag: 'transform',
      strategy: '도형 뒤집기',
      hint: 좌우 ? '왼쪽이나 오른쪽으로 뒤집으면 도형의 왼쪽과 오른쪽이 서로 바뀌어요.' : '위쪽이나 아래쪽으로 뒤집으면 도형의 위쪽과 아래쪽이 서로 바뀌어요.',
      steps: [좌우 ? '왼쪽(오른쪽)으로 뒤집으면 왼쪽과 오른쪽이 바뀝니다.' : '위쪽(아래쪽)으로 뒤집으면 위쪽과 아래쪽이 바뀝니다.', `그러므로 ${답}입니다.`],
      misconceptionTip: '오른쪽으로 뒤집은 것과 왼쪽으로 뒤집은 것은 결과가 같아요.',
      visual: 그림,
    };
  },
};

const 뒤집기두번: G5Family = {
  id: 'flip-twice',
  make: (seed) => {
    const 좌우 = seed % 2 === 0;
    return {
      prompt: `도형을 ${좌우 ? '오른쪽으로 두 번' : '위쪽으로 두 번'} 뒤집으면 어떻게 될까요?`,
      answer: '처음 도형과 같습니다',
      wrongs: [좌우 ? '왼쪽과 오른쪽이 바뀝니다' : '위쪽과 아래쪽이 바뀝니다', '시계 방향으로 180°만큼 돌린 것과 같습니다', '도형이 2배로 커집니다'],
      tag: 'transform',
      strategy: '같은 방향으로 두 번 뒤집기',
      hint: '한 번 뒤집고, 그 도형을 다시 같은 방향으로 뒤집어 보세요.',
      steps: ['한 번 뒤집으면 방향이 바뀌고, 한 번 더 뒤집으면 다시 처음 방향이 됩니다.', '그러므로 처음 도형과 같습니다.'],
    };
  },
};

// ── 돌리기 ──────────────────────────────────────────────────────────
const 돌리기문항: G5Family = {
  id: 'turn',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 처음 = 정돈(모양들[next(모양들.length)]);
    const 시계 = lv === '하' ? true : next(2) === 0;
    const deg = lv === '하' ? [90, 180][next(2)] : [90, 180, 270][next(3)];
    const 맞음 = 돌리기(처음, 시계, deg);
    const 다른각 = deg === 180 ? 90 : 180;
    const 후보 = [맞음, 돌리기(처음, !시계, deg), 돌리기(처음, 시계, 다른각), 좌우뒤집기(처음)];
    // 180°는 방향이 달라도 같으므로 다른 오답을 씁니다.
    if (deg === 180) 후보[1] = 상하뒤집기(처음);
    const 순서 = 섞기(next, [0, 1, 2, 3]);
    const 그림 = 보기그림(처음, 순서.map((k) => 후보[k]), next);
    if (!그림) return null;
    const 답 = 보기이름[순서.indexOf(0)];
    const 이름 = 시계 ? '시계 방향' : '시계 반대 방향';
    return {
      prompt: `처음 도형을 ${이름}으로 ${deg}°만큼 돌렸을 때의 도형은 어느 것일까요?`,
      answer: 답,
      wrongs: 보기이름.filter((x) => x !== 답),
      tag: 'transform',
      strategy: '도형 돌리기',
      hint: '색칠한 칸이 어디로 가는지 따라가 보세요. 90°만큼 돌리면 위쪽이 옆쪽으로 가요.',
      steps: [`${이름}으로 ${deg}°만큼 돌리면 도형의 위쪽이 ${deg === 180 ? '아래쪽' : (시계 === (deg === 90)) ? '오른쪽' : '왼쪽'}으로 갑니다.`, `그러므로 ${답}입니다.`],
      misconceptionTip: '돌린 도형은 뒤집은 도형과 달라요. 모양이 거울에 비친 것처럼 바뀌지 않아요.',
      visual: 그림,
    };
  },
};

const 같은돌리기: G5Family = {
  id: 'turn-same',
  make: (seed) => {
    const next = 고르개(seed);
    const qs = [
      { p: '시계 방향으로 90°만큼 돌린 도형과 같은 것은 어느 것일까요?', a: '시계 반대 방향으로 270°만큼 돌린 도형', w: ['시계 반대 방향으로 90°만큼 돌린 도형', '시계 방향으로 270°만큼 돌린 도형', '시계 방향으로 180°만큼 돌린 도형'], s: '시계 방향으로 90°와 시계 반대 방향으로 270°는 합하여 한 바퀴(360°)이므로 같습니다.' },
      { p: '시계 방향으로 180°만큼 돌린 도형과 같은 것은 어느 것일까요?', a: '시계 반대 방향으로 180°만큼 돌린 도형', w: ['시계 반대 방향으로 90°만큼 돌린 도형', '시계 방향으로 90°만큼 돌린 도형', '시계 방향으로 360°만큼 돌린 도형'], s: '180°는 반 바퀴라 어느 방향으로 돌려도 같습니다.' },
      { p: '도형을 시계 방향으로 360°만큼 돌리면 어떻게 될까요?', a: '처음 도형과 같습니다', w: ['위쪽과 아래쪽이 바뀝니다', '왼쪽과 오른쪽이 바뀝니다', '시계 방향으로 90°만큼 돌린 것과 같습니다'], s: '360°는 한 바퀴이므로 처음 도형과 같습니다.' },
      { p: '시계 반대 방향으로 90°만큼 돌린 도형과 같은 것은 어느 것일까요?', a: '시계 방향으로 270°만큼 돌린 도형', w: ['시계 방향으로 90°만큼 돌린 도형', '시계 반대 방향으로 270°만큼 돌린 도형', '시계 방향으로 180°만큼 돌린 도형'], s: '시계 반대 방향으로 90°와 시계 방향으로 270°는 합하여 한 바퀴(360°)이므로 같습니다.' },
    ];
    const q = qs[next(qs.length)];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'transform', strategy: '돌리기의 관계', hint: '한 바퀴는 360°예요.', steps: [q.s] };
  },
};

// ── 도입: 이동의 성질 ───────────────────────────────────────────────
const 성질: G5Family = {
  id: 'property',
  make: (seed) => {
    const qs = [
      { p: '도형을 밀었을 때 바뀌는 것은 무엇일까요?', a: '위치', w: ['모양', '크기', '방향'], s: '도형을 밀면 모양, 크기, 방향은 그대로이고 위치만 바뀝니다.' },
      { p: '도형을 오른쪽으로 뒤집었을 때 서로 바뀌는 것은 무엇일까요?', a: '도형의 왼쪽과 오른쪽', w: ['도형의 위쪽과 아래쪽', '도형의 크기', '아무것도 바뀌지 않습니다'], s: '오른쪽으로 뒤집으면 도형의 왼쪽과 오른쪽이 서로 바뀝니다.' },
      { p: '도형을 아래쪽으로 뒤집었을 때 서로 바뀌는 것은 무엇일까요?', a: '도형의 위쪽과 아래쪽', w: ['도형의 왼쪽과 오른쪽', '도형의 크기', '아무것도 바뀌지 않습니다'], s: '아래쪽으로 뒤집으면 도형의 위쪽과 아래쪽이 서로 바뀝니다.' },
      { p: '도형을 시계 방향으로 90°만큼 돌리면 도형의 위쪽은 어느 쪽으로 갈까요?', a: '오른쪽', w: ['왼쪽', '아래쪽', '위쪽'], s: '시계 방향으로 90°만큼 돌리면 위쪽이 오른쪽으로 갑니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'transform', strategy: '밀기, 뒤집기, 돌리기의 성질', hint: '종이 도형을 움직인다고 생각해 보세요.', steps: [q.s] };
  },
};

// ── 점의 이동 ───────────────────────────────────────────────────────
const 점이동: G5Family = {
  id: 'point-move',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const size = 8;
    const p: Cell = [사이(next, 1, 7), 사이(next, 1, 7)];
    const t: Cell = [사이(next, 1, 7), 사이(next, 1, 7)];
    const dx = t[0] - p[0];
    const dy = t[1] - p[1];
    if (dx === 0 && dy === 0) return null;
    if (lv === '하' && dx !== 0 && dy !== 0) return null;
    if (lv !== '하' && (dx === 0 || dy === 0)) return null;
    const 가로 = dx === 0 ? '' : `${dx > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(dx)}칸`;
    const 세로 = dy === 0 ? '' : `${dy > 0 ? '아래쪽' : '위쪽'}으로 ${Math.abs(dy)}칸`;
    const 말 = (a: string, b: string) => [a, b].filter(Boolean).join(', ');
    const 반대가로 = dx === 0 ? '' : `${dx > 0 ? '왼쪽' : '오른쪽'}으로 ${Math.abs(dx)}칸`;
    const 반대세로 = dy === 0 ? '' : `${dy > 0 ? '위쪽' : '아래쪽'}으로 ${Math.abs(dy)}칸`;
    const 답 = 말(가로, 세로);
    const wrongs =
      dx !== 0 && dy !== 0
        ? [말(반대가로, 세로), 말(가로, 반대세로), Math.abs(dx) !== Math.abs(dy) ? 말(`${dx > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(dy)}칸`, `${dy > 0 ? '아래쪽' : '위쪽'}으로 ${Math.abs(dx)}칸`) : 말(반대가로, 반대세로)]
        : [반대가로 || 반대세로, `${dx !== 0 ? (dx > 0 ? '오른쪽' : '왼쪽') : dy > 0 ? '아래쪽' : '위쪽'}으로 ${Math.abs(dx || dy) + 1}칸`, dx !== 0 ? `${dx > 0 ? '아래쪽' : '위쪽'}으로 ${Math.abs(dx)}칸` : `${dy > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(dy)}칸`];
    return {
      prompt: '점 ㄱ을 ○ 자리로 옮기려면 어떻게 이동해야 할까요?',
      answer: 답,
      wrongs: wrongs.filter((w) => w !== 답),
      tag: 'transform',
      strategy: '점의 이동을 방향과 거리로 말하기',
      hint: '왼쪽·오른쪽으로 몇 칸, 위쪽·아래쪽으로 몇 칸인지 따로 세어 보세요.',
      steps: [dx ? `옆으로는 ${가로} 갑니다.` : '옆으로는 움직이지 않습니다.', dy ? `위아래로는 ${세로} 갑니다.` : '위아래로는 움직이지 않습니다.', `그러므로 ${답} 이동합니다.`],
      misconceptionTip: '점에서 칸을 셀 때는 선과 선 사이를 하나씩 세어요.',
      visual: { kind: 'grid-move', label: '점 ㄱ과 옮길 자리', size, panels: [{ point: p, target: t }] },
    };
  },
};

export const unit4Lesson41 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [성질, 밀기, 같은돌리기];
    case 2:
      return lv === '하' ? [밀기, 성질] : [밀기];
    case 3:
      return lv === '상' ? [뒤집기, 뒤집기두번] : [뒤집기];
    case 4:
      return lv === '하' ? [돌리기문항, 같은돌리기] : [돌리기문항, 같은돌리기, 여러번돌리기];
    case 5:
      return [점이동, 되돌아가기];
    default:
      return null;
  }
};
