import { 고르개, 사이, type 조작갈래 } from './common';
import { 본모양개수, 앞에서본, 옆에서본 } from './check';
import { 보이는블록, 블록들 } from '../stackIso';

// ════════════════════════════════════════════════════════════════════
// 쌓기나무 쌓기(6-2 3단원)
// ────────────────────────────────────────────────────────────────────
// 위에서 본 모양의 칸을 누를 때마다 그 자리에 쌓기나무가 한 층씩
// 올라가고, 옆에 쌓은 모양이 바로 그려집니다.
//   · 그림 보고 똑같이 쌓기 — 그림만으로 쌓은 모양이 하나로 정해지는 것만 냅니다.
//   · 층별로 나타낸 모양 보고 쌓기
//   · 위·앞·옆에서 본 모양이 같도록 쌓기(답이 여러 가지), 가장 적게·많게 쌓기
// ════════════════════════════════════════════════════════════════════

type 판 = number[][];

/** 그림만 보고 쌓은 모양이 하나로 정해지는지: 칸마다 맨 위가 보이고, 어디에 하나를 더 얹어도 그것이 보여야 합니다. */
export const 그림으로정해지나 = (h: 판): boolean => {
  const 보임 = new Set(보이는블록(블록들(h)).map((b) => `${b.x},${b.y},${b.z}`));
  for (let r = 0; r < h.length; r += 1) for (let c = 0; c < h[0].length; c += 1) {
    if (h[r][c] > 0 && !보임.has(`${c},${r},${h[r][c] - 1}`)) return false;
    const 더 = h.map((row) => [...row]);
    더[r][c] += 1;
    if (!보이는블록(블록들(더)).some((b) => b.x === c && b.y === r && b.z === h[r][c])) return false;
  }
  return true;
};

const 쌓기판 = (next: (n: number) => number, rows: number, cols: number, maxH: number, 빈칸: boolean): 판 | null => {
  const h = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 사이(next, 빈칸 ? 0 : 1, maxH)));
  if (h.flat().every((v) => v === 0)) return null;
  // 바닥이 이어져 있어야 합니다(떨어진 쌓기나무 무리가 없게).
  const 칸들 = h.flatMap((row, r) => row.map((v, c) => (v > 0 ? `${r},${c}` : ''))).filter(Boolean);
  const 본 = new Set([칸들[0]]);
  const 할것 = [칸들[0]];
  while (할것.length) {
    const [r, c] = 할것.pop()!.split(',').map(Number);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${r + dr},${c + dc}`;
      if (칸들.includes(k) && !본.has(k)) { 본.add(k); 할것.push(k); }
    }
  }
  if (본.size !== 칸들.length) return null;
  // 가장자리 줄이 통째로 비면 판을 줄인 것과 같으므로 다시 고릅니다.
  if (h[0].every((v) => !v) || h[rows - 1].every((v) => !v) || h.every((row) => !row[0]) || h.every((row) => !row[cols - 1])) return null;
  return h;
};

const 개수 = (h: 판) => h.flat().reduce((a, b) => a + b, 0);

export const 그림보고쌓기 = (rows: number, cols: number, maxH: number, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `stack-copy-${rows}x${cols}-${maxH}`,
  make: (seed) => {
    const h = 쌓기판(고르개(seed), rows, cols, maxH, true);
    if (!h || !그림으로정해지나(h) || 개수(h) < 4) return null;
    return {
      prompt: '그림과 똑같은 모양이 되도록 쌓기나무를 쌓아 보세요. 아래 칸(위에서 본 모양)을 누를 때마다 그 자리에 한 층씩 올라갑니다.',
      answer: `쌓기나무 ${개수(h)}개로 똑같이 쌓음`,
      manipulate: { kind: 'stack-build', rows, cols, maxH, show: 'iso', target: h, check: 'exact' },
      tag: 'solid',
      strategy: '쌓은 모양을 보고 위에서 본 모양의 칸마다 층수 세기',
      hint: '그림의 맨 앞줄부터 칸마다 가장 위의 쌓기나무가 몇 층에 있는지 세어 보세요. 위에 있는 쌓기나무는 그 아래가 모두 받쳐 주어야 해요.',
      steps: ['쌓은 모양을 위에서 내려다보았다고 생각하고, 바닥에 놓인 칸을 찾습니다.', '칸마다 가장 위의 쌓기나무가 몇 층에 있는지 셉니다. 그 아래는 모두 쌓기나무로 채워져 있습니다.', `칸마다 센 층수만큼 쌓으면 그림과 같고, 모두 ${개수(h)}개입니다.`],
      concept: '위에서 본 모양의 칸마다 쌓인 쌓기나무의 수를 알면 쌓은 모양과 개수를 정확히 알 수 있습니다.',
      misconception: '앞쪽 쌓기나무에 가려 보이지 않는 아래층이나 뒤쪽 쌓기나무를 빠뜨리기 쉽습니다.',
      결,
    };
  },
});

export const 층별로쌓기 = (rows: number, cols: number): 조작갈래 => ({
  id: `stack-layers-${rows}x${cols}`,
  make: (seed) => {
    const h = 쌓기판(고르개(seed), rows, cols, 3, true);
    if (!h || Math.max(...h.flat()) < 2 || 개수(h) < 4) return null;
    return {
      prompt: '쌓은 모양을 1층, 2층, 3층으로 나누어 위에서 본 모양입니다. 똑같은 모양이 되도록 쌓기나무를 쌓아 보세요.',
      answer: `쌓기나무 ${개수(h)}개로 똑같이 쌓음`,
      manipulate: { kind: 'stack-build', rows, cols, maxH: 3, show: 'layers', target: h, check: 'exact' },
      tag: 'solid',
      strategy: '층별로 나타낸 모양을 보고 쌓기',
      hint: '1층 그림에 색칠된 칸에는 모두 1개 이상 쌓여요. 2층 그림에도 색칠된 칸은 2층까지, 3층에도 색칠되면 3층까지 쌓아요.',
      steps: ['1층 그림에서 색칠된 칸은 바닥에 쌓기나무가 놓인 자리입니다.', '2층, 3층 그림에 색칠된 칸은 그 층까지 쌓기나무가 올라간 자리입니다.', `칸마다 색칠된 층의 수만큼 쌓으면 모두 ${개수(h)}개입니다.`],
      concept: '층별로 나타낸 모양에서 칸마다 몇 층까지 색칠되어 있는지 보면 그 칸에 쌓인 개수를 알 수 있습니다.',
      misconception: '위층이 있는 칸의 아래층을 빠뜨리기 쉽습니다. 위층은 아래층이 받쳐 주어야 합니다.',
      결: 1,
    };
  },
});

export const 본모양으로쌓기 = (check: 'views' | 'views-min' | 'views-max', rows: number, cols: number): 조작갈래 => ({
  id: `stack-views-${check}-${rows}x${cols}`,
  make: (seed) => {
    const next = 고르개(seed);
    const h = 쌓기판(next, rows, cols, 3, next(3) === 0);
    if (!h) return null;
    const 최소 = 본모양개수(h, 'min');
    const 최대 = 본모양개수(h, 'max');
    // 가장 적게·많게를 묻는데 쌓는 방법이 하나뿐이면 묻는 뜻이 없습니다.
    if (check !== 'views' && 최소 === 최대) return null;
    if (check === 'views' && 개수(h) < 4) return null;
    const count = check === 'views-min' ? 최소 : check === 'views-max' ? 최대 : undefined;
    const 말 = check === 'views' ? '' : check === 'views-min' ? ' 쌓기나무를 가장 적게 사용하여' : ' 쌓기나무를 가장 많이 사용하여';
    const 앞 = 앞에서본(h);
    const 옆 = 옆에서본(h);
    return {
      prompt: `위, 앞, 옆에서 본 모양이 그림과 같도록${말} 쌓기나무를 쌓아 보세요.`,
      answer: count !== undefined ? `쌓기나무 ${count}개로 쌓음` : '본 모양이 모두 같게 쌓음',
      manipulate: { kind: 'stack-build', rows, cols, maxH: 3, show: 'views', target: h, check, ...(count !== undefined ? { count } : {}) },
      tag: 'solid',
      strategy: check === 'views' ? '위, 앞, 옆에서 본 모양으로 쌓은 모양 추측하기' : `본 모양을 지키며 쌓기나무를 가장 ${check === 'views-min' ? '적게' : '많이'} 쓰기`,
      hint: check === 'views-max'
        ? '위에서 본 모양의 칸마다 그 칸이 든 세로줄(앞에서 본 층수)과 가로줄(옆에서 본 층수)을 보고, 둘 가운데 작은 층수까지 쌓을 수 있어요.'
        : check === 'views-min'
          ? '먼저 위에서 본 모양의 칸에 모두 1개씩 놓아요. 그다음 앞과 옆에서 본 가장 높은 층이 줄마다 한 번씩만 나오게 몇 칸만 올려요.'
          : '먼저 위에서 본 모양의 칸에 1개씩 놓고, 앞에서 본 모양(세로줄마다 가장 높은 층)과 옆에서 본 모양(가로줄마다 가장 높은 층)에 맞게 올려요.',
      steps: [
        `위에서 본 모양으로 바닥에 놓일 칸을 정합니다. 앞에서 본 모양은 왼쪽부터 ${앞.join(', ')}층, 옆에서 본 모양은 앞쪽부터 ${옆.join(', ')}층입니다.`,
        check === 'views-max' ? '칸마다 앞에서 본 층수와 옆에서 본 층수 가운데 작은 쪽까지 쌓아도 본 모양이 그대로입니다.' : '세로줄마다, 가로줄마다 가장 높은 층이 본 모양과 같아지도록 칸을 올립니다.',
        count !== undefined ? `그렇게 쌓으면 쌓기나무는 ${count}개입니다.` : '세 방향에서 본 모양이 모두 같으면 바르게 쌓은 것입니다 — 쌓는 방법은 여러 가지일 수 있습니다.',
      ],
      concept: '위에서 본 모양으로 바닥 자리를, 앞과 옆에서 본 모양으로 줄마다 가장 높은 층을 알 수 있습니다.',
      misconception: '옆에서 본 모양은 오른쪽에서 본 것이라 앞쪽 줄이 왼쪽에 보입니다. 앞에서 본 모양과 헷갈리기 쉽습니다.',
      결: check === 'views' ? 1 : 2,
    };
  },
});
