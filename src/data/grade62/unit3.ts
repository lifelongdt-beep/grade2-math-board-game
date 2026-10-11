import type { Difficulty, StackPlanVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

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
      visual: 그림(h, true, [r, c]),
    };
  },
};

export const unit3Lesson62 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [방향뜻, 개수];
    case 2:
      return [방향뜻, 본모양('앞')];
    case 3:
      return [개수, 방향뜻];
    case 4:
      return lv === '하' ? [본모양('앞'), 보이는수] : [본모양('앞'), 본모양('옆'), 보이는수];
    case 5:
      return [추측];
    case 6:
      return [개수];
    case 7:
      return [층별];
    case 8:
      return [개수, 층별, 본모양('옆')];
    default:
      return null;
  }
};
