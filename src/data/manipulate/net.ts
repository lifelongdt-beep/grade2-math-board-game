import type { GridPoint } from '../../types';
import { 고르개, type 조작갈래 } from './common';
import { 정육면체전개도인가, 접기, 마주보는칸 } from './check';

// ════════════════════════════════════════════════════════════════════
// 정육면체의 전개도(5-2 5단원)
// ────────────────────────────────────────────────────────────────────
// 정사각형 6개를 이은 모양 가운데 접어서 정육면체가 되는 것(11가지)을
// 모두 찾아 두고, 돌리거나 뒤집어 모눈 위에 놓습니다.
//   · 면 한두 개를 빼 두고 채워 완성하기(답이 여러 곳일 수 있습니다)
//   · 전개도가 아닌 모양에서 면 하나를 옮겨 전개도로 만들기
//   · 접었을 때 ★ 면과 마주 보는 면 찾기
// ════════════════════════════════════════════════════════════════════

type 칸들 = GridPoint[];
const 열쇠 = (cs: 칸들) => cs.map((c) => c.join(',')).sort().join(' ');
const 바로 = (cs: 칸들): 칸들 => {
  const x0 = Math.min(...cs.map((c) => c[0]));
  const y0 = Math.min(...cs.map((c) => c[1]));
  return cs.map(([x, y]) => [x - x0, y - y0] as GridPoint).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
};
const 모든방향 = (cs: 칸들): 칸들[] => {
  const out: 칸들[] = [];
  let c = cs;
  for (let k = 0; k < 4; k += 1) {
    c = 바로(c.map(([x, y]) => [-y, x] as GridPoint));
    out.push(c, 바로(c.map(([x, y]) => [-x, y] as GridPoint)));
  }
  return out;
};
const 이웃 = ([x, y]: GridPoint): GridPoint[] => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];

/** 정사각형 6개짜리 모양을 모두 늘어놓고, 정육면체가 되는 것만 모읍니다(돌리고 뒤집은 것은 하나로). */
const 전개도모두 = (() => {
  const 모양들 = new Map<string, 칸들>();
  let 지금 = new Map<string, 칸들>([['0,0', [[0, 0]]]]);
  for (let n = 1; n < 6; n += 1) {
    const 다음 = new Map<string, 칸들>();
    for (const cs of 지금.values()) {
      for (const c of cs) for (const d of 이웃(c)) {
        if (cs.some((e) => e[0] === d[0] && e[1] === d[1])) continue;
        const 새 = 바로([...cs, d]);
        다음.set(열쇠(새), 새);
      }
    }
    지금 = 다음;
  }
  for (const cs of 지금.values()) {
    const 대표 = 모든방향(cs).map(열쇠).sort()[0];
    if (!모양들.has(대표) && 정육면체전개도인가(cs)) 모양들.set(대표, cs);
  }
  return [...모양들.values()];
})();

export const 전개도가짓수 = 전개도모두.length;

const 놓기 = (next: (n: number) => number, cols: number, rows: number): 칸들 | null => {
  const 방향들 = 모든방향(전개도모두[next(전개도모두.length)]);
  const cs = 방향들[next(방향들.length)];
  const w = Math.max(...cs.map((c) => c[0])) + 1;
  const h = Math.max(...cs.map((c) => c[1])) + 1;
  if (w > cols || h > rows) return null;
  const dx = next(cols - w + 1);
  const dy = next(rows - h + 1);
  return cs.map(([x, y]) => [x + dx, y + dy] as GridPoint);
};

const 이어졌나 = (cs: 칸들) => 접기(cs) !== null;

export const 전개도완성 = (뺄: 1 | 2): 조작갈래 => ({
  id: `net-complete-${뺄}`,
  make: (seed) => {
    const next = 고르개(seed);
    const cols = 6;
    const rows = 5;
    const 전개도 = 놓기(next, cols, rows);
    if (!전개도) return null;
    const 뺀자리 = new Set<number>();
    while (뺀자리.size < 뺄) 뺀자리.add(next(6));
    const given = 전개도.filter((_, i) => !뺀자리.has(i));
    if (!이어졌나(given)) return null;
    return {
      prompt: `정육면체의 전개도가 되도록 빈 칸을 눌러 면을 ${뺄}개 더 그려 보세요.`,
      answer: '정육면체의 전개도를 완성함',
      manipulate: { kind: 'cube-net', cols, rows, mode: 'complete', given, example: 전개도 },
      tag: 'solid',
      strategy: '접었을 때 겹치지 않는 자리에 면 놓기',
      hint: '그려진 면을 머릿속으로 하나씩 접어 보세요. 아직 덮이지 않은 쪽(뚜껑이나 옆면)이 어디인지 찾아, 그 자리로 접히는 칸에 면을 놓아요.',
      steps: ['정육면체는 면이 6개이므로 전개도도 정사각형 6개로 되어 있습니다.', '한 면을 바닥으로 정하고 나머지 면을 접어 올려, 이미 있는 면과 겹치지 않는 빈 쪽을 찾습니다.', '그 빈 쪽으로 접히는 칸에 면을 놓으면 접었을 때 겹치는 면이 없는 정육면체의 전개도가 됩니다.'],
      concept: '정육면체의 전개도는 정사각형 6개로 되어 있고, 접었을 때 겹치는 면이 없어야 합니다.',
      misconception: '정사각형을 6개만 이으면 모두 전개도라고 생각하기 쉽습니다. 한 줄에 5개 넘게 있거나 접어서 겹치면 전개도가 아닙니다.',
      결: 뺄 === 1 ? 1 : 2,
    };
  },
});

export const 전개도고치기: 조작갈래 = {
  id: 'net-move',
  make: (seed) => {
    const next = 고르개(seed);
    const cols = 6;
    const rows = 5;
    const 전개도 = 놓기(next, cols, rows);
    if (!전개도) return null;
    const 옮길 = next(6);
    const 남은 = 전개도.filter((_, i) => i !== 옮길);
    if (!이어졌나(남은)) return null;
    // 남은 면 옆의 빈 칸 가운데 붙이면 겹치는(전개도가 아닌) 자리를 고릅니다.
    const 빈칸들 = 남은.flatMap(이웃).filter(([x, y]) => x >= 0 && y >= 0 && x < cols && y < rows && !전개도.some((c) => c[0] === x && c[1] === y));
    const 틀린곳 = 빈칸들.filter((d) => !정육면체전개도인가([...남은, d]));
    if (!틀린곳.length) return null;
    const given = [...남은, 틀린곳[next(틀린곳.length)]];
    if (정육면체전개도인가(given)) return null;
    return {
      prompt: '정육면체의 전개도가 아닙니다. 면 하나만 옮겨 정육면체의 전개도로 만들어 보세요. 면을 누르면 빠지고, 빈 칸을 누르면 면이 놓입니다.',
      answer: '면 하나를 옮겨 전개도로 만듦',
      manipulate: { kind: 'cube-net', cols, rows, mode: 'move', given, example: 전개도 },
      tag: 'solid',
      strategy: '접었을 때 겹치는 면을 찾아 옮기기',
      hint: '한 면을 바닥으로 정하고 나머지를 접어 보면 두 면이 같은 자리에 겹쳐요. 겹치는 두 면 가운데 하나를 비어 있는 쪽으로 옮겨요.',
      steps: ['면이 6개라도 접었을 때 두 면이 겹치면 전개도가 아닙니다.', '한 면씩 접어 보며 서로 겹치는 두 면을 찾습니다.', '겹치는 면 하나를 아무 면도 오지 않는 쪽으로 접히는 칸에 옮기면 전개도가 됩니다.'],
      concept: '정육면체의 전개도는 접었을 때 6개의 면이 서로 겹치지 않아야 합니다.',
      misconception: '모양만 보고 옮기면 다른 곳이 또 겹칠 수 있습니다. 옮긴 뒤 다시 접어 확인해야 합니다.',
      결: 2,
    };
  },
};

export const 마주보는면: 조작갈래 = {
  id: 'net-opposite',
  make: (seed) => {
    const next = 고르개(seed);
    const 전개도 = 놓기(next, 6, 5);
    if (!전개도) return null;
    const star = 전개도[next(6)];
    if (!마주보는칸(전개도, star)) return null;
    return {
      prompt: '정육면체의 전개도를 접었을 때 ★ 면과 마주 보는 면을 눌러 보세요.',
      answer: '★ 면과 마주 보는 면',
      manipulate: { kind: 'cube-net', cols: 6, rows: 5, mode: 'pick', given: 전개도, star, example: 전개도 },
      tag: 'solid',
      strategy: '전개도를 접었을 때 마주 보는 면 찾기',
      hint: '★ 면과 변이 맞닿은 면은 마주 보지 않아요. 한 줄로 이어진 세 면에서는 양 끝 면이 마주 봐요.',
      steps: ['★ 면을 바닥으로 놓고 나머지 면을 접어 올린다고 생각합니다.', '★ 면과 맞닿은 면은 옆면이 되고, 옆면 하나를 건너 접히는 면이 뚜껑이 됩니다.', '뚜껑이 되는 면이 ★ 면과 마주 보는 면입니다.'],
      concept: '정육면체에서 마주 보는 면은 서로 평행하고, 전개도에서는 맞닿아 있지 않습니다.',
      misconception: '★ 면 바로 옆의 면을 마주 보는 면으로 고르기 쉽습니다.',
      결: 2,
    };
  },
};

export { 정육면체전개도인가 };
