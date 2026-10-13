import type { CubeViewsVisual, Difficulty, StackIsoVisual, StackPlanVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 가장적은개수, 블록들, 보이는블록, 숨은개수 } from '../stackIso';

// ════════════════════════════════════════════════════════════════════
// 6-2 3단원 공간과 입체
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 어느 방향에서 보았는지 / 쌓기나무 개수 ⑴
// / 위, 앞, 옆에서 본 모양 / 본 모양으로 쌓은 모양 추측 / 개수 ⑵(위에서
// 본 모양에 수 쓰기) / 개수 ⑶(층별로 나타내기) / 여러 가지 모양 만들기
//
// 그림은 위에서 본 모양(아래쪽이 앞, 오른쪽이 옆)입니다. 등각 그림만으로는
// 뒤에 숨은 쌓기나무를 셀 수 없어 답이 하나로 정해지지 않으므로, 개수를
// 묻는 문항은 위에서 본 모양에 쌓인 수를 적어 줍니다.
//
// 앞에서 본 모양: 왼쪽 열부터 각 열에서 가장 높은 층.
// 옆(오른쪽)에서 본 모양: 앞쪽 줄부터 각 줄에서 가장 높은 층. 오른쪽에
// 서서 보면 앞쪽 줄이 왼쪽에 보입니다.
// ════════════════════════════════════════════════════════════════════

type 판 = number[][];

const 판만들기 = (next: (b: number) => number, rows: number, cols: number, 높이: number): 판 | null => {
  const h = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 사이(next, 0, 높이)));
  // 바닥이 이어져 있어야 쌓기나무 모양입니다(빈 열·빈 줄 없이).
  if (h.some((row) => row.every((x) => x === 0))) return null;
  for (let c = 0; c < cols; c += 1) if (h.every((row) => row[c] === 0)) return null;
  const 칸수 = h.flat().filter((x) => x > 0).length;
  if (칸수 < 3) return null;
  // 1층이 한 덩어리로 이어져 있어야 실제로 쌓은 모양입니다(떨어진 칸이 없게).
  const 시작 = h.flatMap((row, r) => row.map((x, c) => [r, c, x] as const)).find(([, , x]) => x > 0)!;
  const 본 = new Set<string>([`${시작[0]},${시작[1]}`]);
  const 할일: Array<[number, number]> = [[시작[0], 시작[1]]];
  while (할일.length) {
    const [r, c] = 할일.pop()!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const [nr, nc] = [r + dr, c + dc];
      if (h[nr]?.[nc] > 0 && !본.has(`${nr},${nc}`)) {
        본.add(`${nr},${nc}`);
        할일.push([nr, nc]);
      }
    }
  }
  if (본.size !== 칸수) return null;
  return h;
};

const 그림 = (h: 판, numbers = true, hidden?: [number, number]): StackPlanVisual => ({
  kind: 'stack-plan',
  label: '쌓기나무를 위에서 본 모양',
  heights: h,
  numbers,
  ...(hidden ? { hidden } : {}),
});

// 비스듬히 내려다본 입체 그림입니다. 지도서 ⑴차시가 이 그림으로 개수를
// 세게 합니다. 숨은 쌓기나무가 없을 때만 '모두 몇 개'를 묻고, 숨은 것이
// 있을 수 있으면 '적어도 몇 개'를 묻습니다.
const 입체 = (h: 판): StackIsoVisual => ({ kind: 'stack-iso', label: '쌓기나무로 쌓은 모양', heights: h });

// 숨은 쌓기나무가 없는 모양만 고릅니다. 그래야 그림만 보고 답이 하나로
// 정해집니다.
// 마구 쌓아 보면 숨은 것이 생기는 일이 많아, 맞는 모양이 나올 때까지
// 여러 번 쌓아 봅니다.
const 다보이는판 = (next: (b: number) => number, lv: Difficulty = '중'): 판 | null => {
  for (let t = 0; t < 80; t += 1) {
    const h = lv === '하' ? 판만들기(next, 2, 3, 2) : 판만들기(next, 3, 3, 3);
    if (!h || 숨은개수(h) !== 0) continue;
    // 1층만 있는 납작한 모양은 쌓은 모양이라 하기 어렵습니다.
    if (Math.max(...h.flat()) < 2) continue;
    return h;
  }
  return null;
};

export const 앞모양 = (h: 판) => h[0].map((_, c) => Math.max(...h.map((row) => row[c])));
export const 옆모양 = (h: 판) => [...h].reverse().map((row) => Math.max(...row));
const 합 = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const 층글 = (xs: number[]) => xs.map((x) => `${x}층`).join(', ');

const 개수: G5Family = {
  id: 'count',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 판만들기(next, lv === '하' ? 2 : 3, 3, 3);
    if (!h) return null;
    const v = 합(h.flat());
    const 칸 = h.flat().filter((x) => x > 0).length;
    return {
      prompt: '위에서 본 모양의 각 칸에 쌓인 쌓기나무의 수를 적었습니다. 쌓기나무는 모두 몇 개일까요?',
      answer: `${v}개`,
      wrongs: [...new Set([칸, v + 1, v - 1, 합(앞모양(h))])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '위에서 본 모양에 쓴 수로 개수 구하기',
      hint: '칸에 적힌 수를 모두 더해요.',
      steps: [`${h.flat().filter((x) => x > 0).join('+')}=${v}이므로 ${v}개입니다.`],
      misconceptionTip: '위에서 보이는 칸 수만 세면 안 돼요. 칸마다 쌓인 수를 더해요.',
      visual: 그림(h),
    };
  },
};

const 층별: G5Family = {
  id: 'layer',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h) return null;
    const 층 = 사이(next, 1, 3);
    const v = h.flat().filter((x) => x >= 층).length;
    if (v === 0) return null;
    return {
      prompt: `위에서 본 모양의 각 칸에 쌓인 수를 적었습니다. ${층}층에 놓인 쌓기나무는 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: [...new Set([h.flat().filter((x) => x === 층).length, 합(h.flat()), v + 1, v - 1])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '층별로 쌓기나무 세기',
      hint: `${층}층에는 ${층}개 이상 쌓인 칸마다 하나씩 있어요.`,
      steps: [`${층} 이상이 적힌 칸이 ${v}개이므로 ${층}층에는 ${v}개가 있습니다.`],
      misconceptionTip: `${층}이 적힌 칸만 세면 안 돼요. 더 높이 쌓인 칸에도 ${층}층이 있어요.`,
      visual: 그림(h),
    };
  },
};

const 본모양 = (방향: '앞' | '옆'): G5Family => ({
  id: `view-${방향}`,
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h) return null;
    const 맞음 = 방향 === '앞' ? 앞모양(h) : 옆모양(h);
    const 다른 = 방향 === '앞' ? 옆모양(h) : 앞모양(h);
    const ans = 층글(맞음);
    const 거꾸로 = 층글([...맞음].reverse());
    const 첫줄 = 방향 === '앞' ? 층글(h[h.length - 1]) : 층글([...h].reverse().map((row) => row[row.length - 1]));
    const wrongs = [층글(다른), 거꾸로, 첫줄, 층글(맞음.map((x) => Math.min(3, x + 1)))].filter((w, i, xs) => w !== ans && xs.indexOf(w) === i && !w.includes('0층'));
    if (wrongs.length < 3) return null;
    return {
      prompt: `${방향}에서 본 모양을 ${방향 === '앞' ? '왼쪽' : '앞쪽'}부터 각 줄의 층수로 나타낸 것은 어느 것일까요?`,
      answer: ans,
      wrongs: wrongs.slice(0, 3),
      tag: 'solid',
      strategy: `${방향}에서 본 모양 알기`,
      hint: 방향 === '앞' ? '앞에서 보면 세로줄(열)마다 가장 높이 쌓인 층만 보여요.' : '옆에서 보면 가로줄마다 가장 높이 쌓인 층만 보여요. 오른쪽에 서서 보면 앞쪽 줄이 왼쪽에 보여요.',
      steps: [`각 줄에서 가장 높은 층을 차례로 쓰면 ${ans}입니다.`],
      misconceptionTip: '앞에 낮은 것이 있어도 뒤에 높은 것이 있으면 높은 것이 보여요.',
      visual: 그림(h),
    };
  },
});

const 보이는수: G5Family = {
  id: 'front-count',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h) return null;
    const v = 합(앞모양(h));
    return {
      prompt: '앞에서 본 모양을 그릴 때 정사각형은 모두 몇 개 그려야 할까요?',
      answer: `${v}개`,
      wrongs: [...new Set([합(h.flat()), 합(옆모양(h)), v + 1, v - 1])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '앞에서 본 모양 그리기',
      hint: '세로줄마다 가장 높은 층만큼 정사각형을 그려요.',
      steps: [`왼쪽 줄부터 ${층글(앞모양(h))}이므로 ${앞모양(h).join('+')}=${v}개입니다.`],
      visual: 그림(h),
    };
  },
};

const 방향뜻: G5Family = {
  id: 'direction',
  make: (seed) => {
    const qs = [
      { p: '쌓기나무로 쌓은 모양을 위에서 본 모양으로 알 수 있는 것은 무엇일까요?', a: '1층에 놓인 쌓기나무의 자리', w: ['쌓은 모양의 높이', '2층에 놓인 쌓기나무의 수', '보이지 않는 쌓기나무의 수'], s: '위에서 본 모양은 바닥(1층)에 놓인 쌓기나무의 자리를 보여 줍니다.' },
      { p: '같은 모양을 앞과 옆에서 보았을 때 모양이 다르게 보이는 까닭은 무엇일까요?', a: '보는 방향에 따라 보이는 면이 다르기 때문입니다', w: ['쌓기나무의 수가 바뀌기 때문입니다', '쌓기나무의 크기가 바뀌기 때문입니다', '항상 같게 보입니다'], s: '보는 방향에 따라 보이는 부분이 다르므로 모양이 다르게 보입니다.' },
      { p: '위에서 본 모양에 쌓인 수를 쓰면 좋은 점은 무엇일까요?', a: '쌓기나무의 개수를 정확히 알 수 있습니다', w: ['앞에서 본 모양을 알 수 없습니다', '쌓기나무의 색을 알 수 있습니다', '모양을 알 수 없습니다'], s: '칸마다 쌓인 수를 알면 보이지 않는 쌓기나무까지 정확히 셀 수 있습니다.' },
      { p: '쌓은 모양을 한 방향에서 그린 그림만 보고 쌓기나무의 개수를 정확히 알 수 없는 까닭은 무엇일까요?', a: '뒤에 숨어 보이지 않는 쌓기나무가 있을 수 있기 때문입니다', w: ['쌓기나무의 크기가 모두 다르기 때문입니다', '쌓기나무는 셀 수 없기 때문입니다', '정확히 알 수 있습니다'], s: '보이지 않는 곳에 쌓기나무가 있을 수 있으므로 위, 앞, 옆에서 본 모양이나 쌓인 수가 필요합니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'solid', strategy: '보는 방향과 모양', hint: '어느 쪽에서 보는지에 따라 보이는 것이 달라요.', steps: [q.s] };
  },
};

const 추측: G5Family = {
  id: 'guess',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h) return null;
    // 모르는 칸 하나를 앞·옆 모양으로 알아내게 합니다. 그 칸의 높이가 앞
    // 모양이나 옆 모양으로 하나로 정해질 때만 냅니다.
    const 후보칸: Array<[number, number]> = [];
    h.forEach((row, r) => row.forEach((x, c) => x > 0 && 후보칸.push([r, c])));
    const [r, c] = 후보칸[next(후보칸.length)];
    const 앞 = 앞모양(h);
    const 옆 = 옆모양(h);
    const 가능 = [1, 2, 3].filter((t) => {
      const g = h.map((row) => [...row]);
      g[r][c] = t;
      return 층글(앞모양(g)) === 층글(앞) && 층글(옆모양(g)) === 층글(옆);
    });
    if (가능.length !== 1) return null;
    const v = h[r][c];
    return {
      prompt: `앞에서 본 모양은 왼쪽부터 ${층글(앞)}, 옆에서 본 모양은 앞쪽부터 ${층글(옆)}입니다. ? 칸에 쌓인 쌓기나무는 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: [1, 2, 3, 4].filter((x) => x !== v).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '본 모양으로 쌓은 모양 추측하기',
      hint: '? 칸이 들어 있는 세로줄과 가로줄의 가장 높은 층을 보세요.',
      steps: [`? 칸은 앞에서 본 ${c + 1}째 줄(${앞[c]}층)과 옆에서 본 ${h.length - r}째 줄(${옆[h.length - 1 - r]}층)에 들어 있습니다.`, `두 모양에 모두 맞는 수는 ${v}입니다.`],
      // 앞에서 본 수와 옆에서 본 수를 화살표와 함께 그림에 적어, ? 칸이 어느 세로줄·가로줄에 드는지 보이게 합니다.
      visual: { ...그림(h, true, [r, c]), frontView: 앞, sideView: 옆 },
    };
  },
};

const 입체개수: G5Family = {
  id: 'iso-count',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 다보이는판(next, lv);
    if (!h) return null;
    const v = 합(h.flat());
    const 칸 = h.flat().filter((x) => x > 0).length;
    const 층수별 = [1, 2, 3].map((t) => h.flat().filter((x) => x >= t).length);
    return {
      prompt: '쌓기나무로 쌓은 모양입니다. 보이지 않는 쌓기나무는 없습니다. 쌓기나무는 모두 몇 개일까요?',
      answer: `${v}개`,
      wrongs: [...new Set([칸, v - 1, v + 1, v + 2])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '쌓은 모양을 보고 쌓기나무 개수 세기',
      hint: '1층, 2층, 3층으로 나누어 층마다 세어 보세요.',
      steps: [`층별로 세면 ${층수별.filter((x) => x > 0).map((x, i) => `${i + 1}층 ${x}개`).join(', ')}입니다.`, `${층수별.filter((x) => x > 0).join('+')}=${v}이므로 ${v}개입니다.`],
      misconceptionTip: '위에 쌓인 쌓기나무 아래에도 쌓기나무가 받치고 있어요. 위에서 보이는 것만 세면 안 돼요.',
      visual: 입체(h),
    };
  },
};

const 입체적어도: G5Family = {
  id: 'iso-min',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h || 숨은개수(h) === 0) return null;
    const v = 가장적은개수(h);
    const 보임 = 보이는블록(블록들(h)).length;
    const 전체 = 합(h.flat());
    const wrongs = [...new Set([보임, 전체, v + 1, v - 1, v + 2])].filter((x) => x > 0 && x !== v).slice(0, 3);
    if (wrongs.length < 3) return null;
    return {
      prompt: '쌓기나무로 쌓은 모양입니다. 똑같은 모양으로 쌓으려면 쌓기나무가 적어도 몇 개 필요할까요?',
      answer: `${v}개`,
      wrongs: wrongs.map((x) => `${x}개`),
      tag: 'solid',
      strategy: '보이지 않는 쌓기나무를 생각하여 개수 세기',
      hint: '보이는 쌓기나무를 모두 세고, 공중에 떠 있는 것이 없도록 그 아래를 받치는 쌓기나무를 더해요.',
      steps: [`그림에서 보이는 쌓기나무는 ${보임}개입니다.`, 보임 === v ? `보이는 것만으로 모두 받쳐지므로 적어도 ${v}개입니다.` : `위에 놓인 것을 받치려면 보이지 않는 곳에 ${v - 보임}개가 더 있어야 하므로 적어도 ${v}개입니다.`],
      misconceptionTip: '2층, 3층에 놓인 쌓기나무 아래에는 반드시 쌓기나무가 있어요. 보이지 않아도 세어야 해요.',
      visual: 입체(h),
    };
  },
};

const 입체본모양 = (방향: '앞' | '옆'): G5Family => ({
  id: `iso-view-${방향}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 다보이는판(next, lv === '하' ? '중' : lv);
    if (!h) return null;
    const 맞음 = 방향 === '앞' ? 앞모양(h) : 옆모양(h);
    const 다른 = 방향 === '앞' ? 옆모양(h) : 앞모양(h);
    const ans = 층글(맞음);
    const 첫줄 = 방향 === '앞' ? 층글(h[h.length - 1]) : 층글([...h].reverse().map((row) => row[row.length - 1]));
    const wrongs = [층글(다른), 층글([...맞음].reverse()), 첫줄, 층글(맞음.map((x) => Math.min(3, x + 1))), 층글(맞음.map((x) => Math.max(1, x - 1)))]
      .filter((w, i, xs) => w !== ans && xs.indexOf(w) === i && !w.includes('0층'));
    if (wrongs.length < 3) return null;
    return {
      prompt: `쌓기나무로 쌓은 모양입니다. 보이지 않는 쌓기나무는 없습니다. ${방향}에서 본 모양을 ${방향 === '앞' ? '왼쪽' : '앞쪽'}부터 각 줄의 층수로 나타낸 것은 어느 것일까요?`,
      answer: ans,
      wrongs: wrongs.slice(0, 3),
      tag: 'solid',
      strategy: `쌓은 모양을 ${방향}에서 본 모양 알기`,
      hint: 방향 === '앞' ? '그림의 ‘앞’ 화살표 쪽에서 보세요. 세로줄마다 가장 높은 층만 보여요.' : '그림의 ‘옆’ 화살표 쪽에서 보세요. 오른쪽에 서서 보면 앞쪽 줄이 왼쪽에 보여요.',
      steps: [`각 줄에서 가장 높은 층을 차례로 쓰면 ${ans}입니다.`],
      misconceptionTip: '앞에 낮은 것이 있어도 뒤에 높은 것이 있으면 높은 것이 보여요.',
      visual: 입체(h),
    };
  },
});

const 입체층별: G5Family = {
  id: 'iso-layer',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 다보이는판(next, lv === '하' ? '중' : lv);
    if (!h) return null;
    const 층 = 사이(next, 1, Math.max(...h.flat()));
    const v = h.flat().filter((x) => x >= 층).length;
    return {
      prompt: `쌓기나무로 쌓은 모양입니다. 보이지 않는 쌓기나무는 없습니다. ${층}층에 놓인 쌓기나무는 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: [...new Set([h.flat().filter((x) => x === 층).length, 합(h.flat()), v + 1, v - 1, v + 2])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '쌓은 모양을 층별로 나누어 세기',
      hint: `${층}층만 떼어 내어 위에서 본다고 생각해 보세요.`,
      steps: [`${층}층에는 ${층}개 이상 쌓인 자리마다 쌓기나무가 하나씩 있습니다.`, `그런 자리가 ${v}곳이므로 ${v}개입니다.`],
      misconceptionTip: `맨 위가 ${층}층인 것만 세면 안 돼요. 더 높이 쌓인 곳에도 ${층}층이 있어요.`,
      visual: 입체(h),
    };
  },
};

const 입체위모양: G5Family = {
  id: 'iso-top',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 다보이는판(next, lv);
    if (!h) return null;
    const v = h.flat().filter((x) => x > 0).length;
    return {
      prompt: '쌓기나무로 쌓은 모양입니다. 보이지 않는 쌓기나무는 없습니다. 위에서 본 모양을 그릴 때 정사각형은 모두 몇 개 그려야 할까요?',
      answer: `${v}개`,
      wrongs: [...new Set([합(h.flat()), 합(앞모양(h)), v + 1, v - 1])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '쌓은 모양을 위에서 본 모양 알기',
      hint: '위에서 보면 높이는 보이지 않고 바닥(1층)에 놓인 자리만 보여요.',
      steps: [`1층에 쌓기나무가 놓인 자리가 ${v}곳이므로 정사각형 ${v}개를 그립니다.`],
      misconceptionTip: '위에서 보면 2층, 3층은 1층과 겹쳐서 하나로 보여요.',
      visual: 입체(h),
    };
  },
};

const 정육면체채우기: G5Family = {
  id: 'iso-cube',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 다보이는판(next, lv === '하' ? '중' : lv);
    if (!h || h.length !== 3) return null;
    const v = 27 - 합(h.flat());
    if (v <= 0) return null;
    return {
      prompt: '쌓기나무로 쌓은 모양입니다. 보이지 않는 쌓기나무는 없습니다. 쌓기나무를 더 쌓아 가로, 세로, 높이가 모두 쌓기나무 3개인 정육면체 모양을 만들려면 쌓기나무가 몇 개 더 필요할까요?',
      answer: `${v}개`,
      wrongs: [...new Set([합(h.flat()), 9 - h.flat().filter((x) => x > 0).length, v + 1, v - 1, 27 - h.flat().filter((x) => x > 0).length])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
      tag: 'solid',
      strategy: '정육면체를 이루는 쌓기나무 수에서 빼기',
      hint: '정육면체 모양은 한 층에 3×3=9개씩 3층이에요. 지금 있는 개수를 먼저 세어요.',
      steps: [`정육면체 모양에는 9×3=27개가 필요합니다.`, `지금 ${합(h.flat())}개가 있으므로 27-${합(h.flat())}=${v}개가 더 필요합니다.`],
      visual: 입체(h),
    };
  },
};

const 입체비교: G5Family = {
  id: 'iso-compare',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 가 = 다보이는판(next, lv === '하' ? '하' : '중');
    const 나 = 다보이는판(next, lv === '하' ? '하' : '중');
    if (!가 || !나) return null;
    const a = 합(가.flat());
    const b = 합(나.flat());
    if (a === b) return null;
    const 큰 = a > b ? '가' : '나';
    const 작은 = a > b ? '나' : '가';
    const d = Math.abs(a - b);
    return {
      prompt: '쌓기나무로 쌓은 두 모양입니다. 보이지 않는 쌓기나무는 없습니다. 어느 모양에 쌓기나무가 몇 개 더 많을까요?',
      answer: `${큰}, ${d}개`,
      wrongs: [`${작은}, ${d}개`, `${큰}, ${d + 1}개`, d > 1 ? `${큰}, ${d - 1}개` : `${작은}, ${d + 1}개`],
      tag: 'solid',
      strategy: '두 모양의 쌓기나무 개수 견주기',
      hint: '두 모양을 층별로 나누어 각각 세어 보세요.',
      steps: [`가는 ${a}개, 나는 ${b}개입니다.`, `${Math.max(a, b)}-${Math.min(a, b)}=${d}이므로 ${큰}가 ${d}개 더 많습니다.`],
      visual: { kind: 'stack-iso', label: '쌓기나무로 쌓은 두 모양', heights: 가, items: [{ name: '가', heights: 가 }, { name: '나', heights: 나 }] },
    };
  },
};

// 위에서 본 모양에 수를 쓴 것과 같은 모양을 고릅니다. 틀린 보기는 한
// 칸의 높이를 바꾸거나 두 칸을 맞바꾼 모양입니다. 모두 숨은 쌓기나무가
// 없게 골라, 그림만 보고 가릴 수 있게 합니다.
const 같은모양찾기: G5Family = {
  id: 'iso-match',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 다보이는판(next, '하');
    if (!h) return null;
    const 글 = (g: 판) => g.map((row) => row.join('')).join('/');
    const 후보: 판[] = [];
    for (let t = 0; t < 30 && 후보.length < 3; t += 1) {
      const g = h.map((row) => [...row]);
      const 칸들 = g.flatMap((row, r) => row.map((x, c) => [r, c, x] as const)).filter(([, , x]) => x > 0);
      if (next(2) === 0) {
        const [r1, c1] = 칸들[next(칸들.length)];
        const [r2, c2] = 칸들[next(칸들.length)];
        [g[r1][c1], g[r2][c2]] = [g[r2][c2], g[r1][c1]];
      } else {
        const [r, c, x] = 칸들[next(칸들.length)];
        g[r][c] = x === 1 ? 2 : x === 3 ? 2 : x + (next(2) === 0 ? 1 : -1);
      }
      if (숨은개수(g) !== 0) continue;
      if ([h, ...후보].some((o) => 글(o) === 글(g))) continue;
      후보.push(g);
    }
    if (후보.length < 3) return null;
    const 자리 = next(4);
    const 모양들 = [...후보];
    모양들.splice(자리, 0, h);
    const 이름 = ['가', '나', '다', '라'];
    return {
      prompt: '위에서 본 모양의 각 칸에 쌓인 쌓기나무의 수를 적었습니다. 이 모양과 똑같이 쌓은 것은 어느 것일까요?',
      answer: 이름[자리],
      wrongs: 이름.filter((_, k) => k !== 자리),
      tag: 'solid',
      strategy: '위에서 본 모양에 쓴 수와 쌓은 모양 맞추어 보기',
      hint: '앞쪽 줄부터 칸마다 몇 층으로 쌓였는지 그림과 하나씩 맞추어 보세요.',
      steps: [`위에서 본 모양의 수와 칸마다 쌓인 층수가 모두 같은 것은 ${이름[자리]}입니다.`],
      misconceptionTip: '앞과 옆의 방향을 먼저 맞추어야 해요. 위에서 본 모양의 아래쪽이 앞이에요.',
      visual: { kind: 'stack-iso', label: '위에서 본 모양과 쌓은 모양 네 가지', heights: h, plan: h, items: 모양들.map((g, k) => ({ name: 이름[k], heights: g })) },
    };
  },
};

// ── 본 모양을 그림으로 ─────────────────────────────────────────────
// 본 모양은 정사각형으로 그립니다. 줄은 위쪽부터입니다.
const 세운격자 = (층들: number[]) => {
  const H = Math.max(...층들);
  return Array.from({ length: H }, (_, k) => 층들.map((x) => x >= H - k));
};
export const 앞격자 = (h: 판) => 세운격자(앞모양(h));
export const 옆격자 = (h: 판) => 세운격자(옆모양(h));
export const 위격자 = (h: 판) => h.map((row) => row.map((x) => x > 0));
const 격자글 = (g: boolean[][]) => g.map((r) => r.map((x) => (x ? 1 : 0)).join('')).join('/');

const 본모양그림고르기 = (방향: '앞' | '옆' | '위', 바탕: '입체' | '수'): G5Family => ({
  id: `pick-${방향}-${바탕}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const h = 바탕 === '입체' ? 다보이는판(next, lv === '하' ? '중' : lv) : 판만들기(next, 3, 3, 3);
    if (!h) return null;
    const 맞음 = 방향 === '앞' ? 앞격자(h) : 방향 === '옆' ? 옆격자(h) : 위격자(h);
    const 뒤집기 = (g: boolean[][]) => g.map((r) => [...r].reverse());
    const 한줄바꿈 = (층들: number[]) => {
      const k = next(층들.length);
      const 바꾼 = 층들.map((x, i) => (i === k ? (x >= 3 ? x - 1 : x + 1) : x));
      return 세운격자(바꾼);
    };
    const 후보 = [
      방향 === '앞' ? 옆격자(h) : 앞격자(h),
      방향 === '위' ? 뒤집기(위격자(h).slice().reverse()) : 위격자(h),
      뒤집기(맞음),
      방향 === '위' ? 위격자(h).slice().reverse() : 한줄바꿈(방향 === '앞' ? 앞모양(h) : 옆모양(h)),
      방향 === '옆' ? 뒤집기(옆격자(h)) : 옆격자(h),
    ];
    const 틀린것: boolean[][][] = [];
    for (const g of 후보) {
      if ([맞음, ...틀린것].some((o) => 격자글(o) === 격자글(g))) continue;
      틀린것.push(g);
    }
    if (틀린것.length < 3) return null;
    const 자리 = next(4);
    const 보기 = 틀린것.slice(0, 3);
    보기.splice(자리, 0, 맞음);
    const 이름 = ['가', '나', '다', '라'];
    const 설명 = 방향 === '앞'
      ? '앞에서 보면 왼쪽 세로줄부터 각 줄에서 가장 높은 층만큼 보입니다.'
      : 방향 === '옆'
        ? '오른쪽 옆에서 보면 앞쪽 줄이 왼쪽에 오고, 각 줄에서 가장 높은 층만큼 보입니다.'
        : '위에서 보면 1층에 놓인 자리만 보이고, 아래쪽이 앞입니다.';
    return {
      prompt: `${바탕 === '입체' ? '쌓기나무로 쌓은 모양입니다. 보이지 않는 쌓기나무는 없습니다' : '위에서 본 모양의 각 칸에 쌓인 쌓기나무의 수를 적었습니다'}. ${방향}에서 본 모양은 어느 것일까요?`,
      answer: 이름[자리],
      wrongs: 이름.filter((_, k) => k !== 자리),
      tag: 'solid',
      strategy: `${방향}에서 본 모양 찾기`,
      hint: 방향 === '위' ? '높이는 생각하지 말고 바닥에 놓인 자리만 보세요.' : `${방향}에 서서 본다고 생각하고, 줄마다 가장 높은 층을 찾아보세요.`,
      steps: [설명, `그렇게 그린 모양은 ${이름[자리]}입니다.`],
      misconceptionTip: 방향 === '옆' ? '옆에서 본 모양은 앞에서 본 모양과 달라요. 오른쪽에 서면 앞쪽 줄이 왼쪽에 보여요.' : '왼쪽과 오른쪽이 바뀌지 않았는지 확인해요.',
      visual: { kind: 'stack-iso', label: `쌓은 모양과 ${방향}에서 본 모양의 보기`, heights: h, planOnly: 바탕 === '수', views: 보기.map((cells, k) => ({ name: 이름[k], cells })) },
    };
  },
});

// 위·앞·옆에서 본 모양만 주고 가장 적게(많이) 쓴 경우를 묻습니다.
// 칸마다 1~3층을 모두 넣어 보아 세 모양이 그대로인 경우만 셉니다.
export const 본모양으로가능한것 = (위: boolean[][], 앞: number[], 옆: number[]) => {
  const 칸들 = 위.flatMap((row, r) => row.map((on, c) => [r, c, on] as const)).filter(([, , on]) => on);
  const 합들: number[] = [];
  const g = 위.map((row) => row.map(() => 0));
  const 채우기 = (i: number) => {
    if (i === 칸들.length) {
      if (층글(앞모양(g)) === 층글(앞) && 층글(옆모양(g)) === 층글(옆)) 합들.push(합(g.flat()));
      return;
    }
    const [r, c] = 칸들[i];
    for (let t = 1; t <= 3; t += 1) {
      g[r][c] = t;
      채우기(i + 1);
    }
    g[r][c] = 0;
  };
  채우기(0);
  return 합들;
};

const 세방향그림 = (h: 판): CubeViewsVisual => ({
  kind: 'cube-views',
  label: '쌓기나무로 쌓은 모양을 위, 앞, 옆에서 본 모양',
  views: [
    { label: '위', cells: 위격자(h) },
    { label: '앞', cells: 앞격자(h) },
    { label: '옆', cells: 옆격자(h) },
  ],
});

const 가장적게많이 = (어느: '적게' | '많이'): G5Family => ({
  id: `views-${어느}`,
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h) return null;
    const 합들 = 본모양으로가능한것(위격자(h), 앞모양(h), 옆모양(h));
    const 적게 = Math.min(...합들);
    const 많이 = Math.max(...합들);
    if (적게 === 많이) return null;
    const v = 어느 === '적게' ? 적게 : 많이;
    const 다른 = 어느 === '적게' ? 많이 : 적게;
    const 칸 = h.flat().filter((x) => x > 0).length;
    const wrongs = [...new Set([다른, 합(앞모양(h)) + 합(옆모양(h)), 칸, v + 1, v - 1])].filter((x) => x > 0 && x !== v).slice(0, 3);
    return {
      prompt: `쌓기나무로 쌓은 모양을 위, 앞, 옆에서 본 모양입니다. 쌓기나무를 가장 ${어느} 사용한 경우 쌓기나무는 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: wrongs.map((x) => `${x}개`),
      tag: 'solid',
      strategy: '위, 앞, 옆에서 본 모양으로 쌓은 모양 추측하기',
      hint: 어느 === '적게'
        ? '위에서 본 모양에 칸마다 몇 층까지 쌓을 수 있는지 적고, 앞과 옆의 가장 높은 층이 한 번씩은 나오게 하면서 되도록 낮게 쌓아요.'
        : '칸마다 앞에서 본 층수와 옆에서 본 층수 가운데 작은 쪽까지 쌓을 수 있어요.',
      steps: 어느 === '적게'
        ? ['위에서 본 모양의 칸마다 앞에서 본 층수와 옆에서 본 층수를 함께 봅니다.', '각 줄의 가장 높은 층이 한 번씩 나오도록 하고 나머지 칸은 1층으로 둡니다.', `그렇게 쌓으면 ${v}개입니다.`]
        : ['칸마다 (그 칸이 있는 세로줄의 앞 층수)와 (가로줄의 옆 층수) 가운데 작은 수만큼 쌓을 수 있습니다.', `그 수를 모두 더하면 ${v}개입니다.`],
      misconceptionTip: '세 방향에서 본 모양이 같아도 쌓은 모양은 여러 가지일 수 있어요.',
      visual: 세방향그림(h),
    };
  },
});

const 층별그림 = (묻기: '개수' | '앞'): G5Family => ({
  id: `layers-${묻기}`,
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h || Math.max(...h.flat()) < 3) return null;
    const v = 합(h.flat());
    const visual: CubeViewsVisual = {
      kind: 'cube-views',
      label: '쌓기나무로 쌓은 모양을 층별로 나타낸 모양',
      views: [1, 2, 3].map((t) => ({ label: `${t}층` as '1층' | '2층' | '3층', cells: h.map((row) => row.map((x) => x >= t)) })),
    };
    if (묻기 === '개수') {
      const 칸 = h.flat().filter((x) => x > 0).length;
      return {
        prompt: '쌓기나무로 쌓은 모양을 1층, 2층, 3층으로 나누어 위에서 본 모양입니다(아래쪽이 앞). 쌓기나무는 모두 몇 개일까요?',
        answer: `${v}개`,
        wrongs: [...new Set([칸, 칸 * 3, v + 1, v - 1, v + 2])].filter((x) => x > 0 && x !== v).slice(0, 3).map((x) => `${x}개`),
        tag: 'solid',
        strategy: '층별로 나타낸 모양으로 개수 구하기',
        hint: '층마다 색칠된 칸을 세어 더해요.',
        steps: [`1층 ${h.flat().filter((x) => x >= 1).length}개, 2층 ${h.flat().filter((x) => x >= 2).length}개, 3층 ${h.flat().filter((x) => x >= 3).length}개입니다.`, `모두 더하면 ${v}개입니다.`],
        visual,
      };
    }
    const ans = 층글(앞모양(h));
    const wrongs = [층글(옆모양(h)), 층글([...앞모양(h)].reverse()), 층글(h[h.length - 1]), 층글(h[0].map((_, c) => h.filter((row) => row[c] > 0).length))]
      .filter((w, i, xs) => w !== ans && xs.indexOf(w) === i && !w.includes('0층'));
    if (wrongs.length < 3) return null;
    return {
      prompt: '쌓기나무로 쌓은 모양을 1층, 2층, 3층으로 나누어 위에서 본 모양입니다(아래쪽이 앞). 앞에서 본 모양을 왼쪽부터 각 줄의 층수로 나타낸 것은 어느 것일까요?',
      answer: ans,
      wrongs: wrongs.slice(0, 3),
      tag: 'solid',
      strategy: '층별로 나타낸 모양으로 앞에서 본 모양 알기',
      hint: '세로줄마다 몇 층 그림까지 색칠된 칸이 있는지 보세요.',
      steps: ['세로줄마다 색칠된 칸이 있는 가장 높은 층을 찾습니다.', `왼쪽부터 차례로 쓰면 ${ans}입니다.`],
      visual,
    };
  },
});

const 뒤에서본모양: G5Family = {
  id: 'view-back',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 판만들기(next, 3, 3, 3);
    if (!h) return null;
    const 앞 = 앞모양(h);
    const ans = 층글([...앞].reverse());
    if (ans === 층글(앞)) return null;
    const wrongs = [층글(앞), 층글(옆모양(h)), 층글([...옆모양(h)].reverse()), 층글(h[0])].filter((w, i, xs) => w !== ans && xs.indexOf(w) === i && !w.includes('0층'));
    if (wrongs.length < 3) return null;
    return {
      prompt: '위에서 본 모양의 각 칸에 쌓인 쌓기나무의 수를 적었습니다. 뒤에서 본 모양을, 뒤에 서서 보았을 때 왼쪽 줄부터 각 줄의 층수로 나타낸 것은 어느 것일까요?',
      answer: ans,
      wrongs: wrongs.slice(0, 3),
      tag: 'solid',
      strategy: '뒤에서 본 모양 알기',
      hint: '뒤에 서면 앞에서 볼 때의 오른쪽 줄이 왼쪽에 보여요.',
      steps: [`앞에서 본 모양은 왼쪽부터 ${층글(앞)}입니다.`, `뒤에서 보면 왼쪽과 오른쪽이 바뀌므로 ${ans}입니다.`],
      misconceptionTip: '뒤에서 본 모양은 앞에서 본 모양을 좌우로 뒤집은 모양이에요.',
      visual: 그림(h),
    };
  },
};

export const unit3Lesson62 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  // 차시마다 생각하는 방법이 다른 문항을 고루 섞습니다. 같은 모양의
  // 문항을 수만 바꾸어 되풀이하지 않도록, 문항 뭉치를 넉넉히 둡니다.
  switch (lessonNo) {
    case 1:
      return [입체개수, 방향뜻, 개수, 본모양그림고르기('위', '입체')];
    case 2:
      return lv === '하'
        ? [본모양그림고르기('앞', '입체'), 본모양그림고르기('위', '입체'), 방향뜻, 입체본모양('앞')]
        : [본모양그림고르기('앞', '입체'), 본모양그림고르기('옆', '입체'), 본모양그림고르기('위', '입체'), 입체본모양('옆'), 방향뜻];
    case 3:
      return lv === '하' ? [입체개수, 입체비교, 방향뜻, 입체층별] : [입체개수, 입체적어도, 입체비교, 방향뜻];
    case 4:
      return lv === '하'
        ? [본모양그림고르기('앞', '수'), 입체본모양('앞'), 보이는수, 입체위모양]
        : [본모양그림고르기('앞', '수'), 본모양그림고르기('옆', '수'), 입체본모양('옆'), 본모양('옆'), 보이는수, 뒤에서본모양];
    case 5:
      return lv === '하' ? [추측, 가장적게많이('많이'), 가장적게많이('적게'), 본모양그림고르기('옆', '입체'), 입체본모양('앞')] : [추측, 가장적게많이('적게'), 가장적게많이('많이'), 본모양그림고르기('옆', '수')];
    case 6:
      return lv === '하' ? [개수, 입체개수, 같은모양찾기, 입체비교, 정육면체채우기] : [개수, 같은모양찾기, 입체개수, 정육면체채우기];
    case 7:
      return lv === '하' ? [층별, 입체층별, 층별그림('개수'), 입체개수, 입체적어도] : [층별, 입체층별, 층별그림('개수'), 층별그림('앞')];
    case 8:
      return lv === '하'
        ? [개수, 입체개수, 입체비교, 같은모양찾기, 층별그림('개수')]
        : [같은모양찾기, 입체적어도, 정육면체채우기, 가장적게많이('적게'), 뒤에서본모양, 층별그림('앞'), 입체비교];
    default:
      return null;
  }
};
