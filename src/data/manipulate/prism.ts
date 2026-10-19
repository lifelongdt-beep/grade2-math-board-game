import { 고르개, 사이, 섞기, type 조작갈래 } from './common';
import { 각기둥이름, 다각형이름 } from './check';

// ════════════════════════════════════════════════════════════════════
// 각기둥의 전개도(6-1 2단원)
// ────────────────────────────────────────────────────────────────────
// 옆면(직사각형) n개가 한 줄로 놓이고, 밑면(n각형) 2개가 옆면의 위쪽과
// 아래쪽에 하나씩 붙습니다.
//   · 다른 밑면을 붙일 자리 고르기(같은 쪽이면 겹칩니다)
//   · 빠진 옆면 채우기(옆면의 수 = 밑면의 변의 수)
//   · 접었을 때 만나는 점 찾기(띠의 양 끝)
// ════════════════════════════════════════════════════════════════════

type 쪽 = 'top' | 'bottom';
const 반대쪽 = (s: 쪽): 쪽 => (s === 'top' ? 'bottom' : 'top');

export const 밑면붙이기: 조작갈래 = {
  id: 'prism-base',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 3, 6);
    const strip = Array.from({ length: n }, (_, i) => i);
    const side: 쪽 = next(2) ? 'top' : 'bottom';
    const 하나 = { col: next(n), side };
    const 다른 = { col: next(n), side: 반대쪽(side) };
    const 이름 = 각기둥이름(n);
    return {
      prompt: `${이름}의 전개도를 만들려고 합니다. 밑면이 하나 붙어 있습니다. 다른 밑면을 붙일 자리를 눌러 보세요.`,
      answer: `${side === 'top' ? '아래쪽' : '위쪽'}의 한 자리에 밑면을 붙임`,
      manipulate: { kind: 'prism-net', n, columns: n, mode: 'base', strip, bases: [하나], example: { strip, bases: [하나, 다른] } },
      tag: 'solid',
      strategy: '각기둥의 두 밑면이 서로 마주 보게 붙이기',
      hint: '각기둥의 두 밑면은 서로 마주 보고 평행해요. 옆면을 둥글게 세웠을 때 이미 붙은 밑면의 반대쪽을 덮을 자리를 찾아요.',
      steps: [`${이름}은(는) 밑면이 2개이고, 두 밑면은 서로 평행합니다.`, '옆면을 둥글게 세우면 한 밑면은 위쪽을, 다른 밑면은 아래쪽을 덮습니다.', `그러므로 다른 밑면은 옆면 띠의 ${side === 'top' ? '아래쪽' : '위쪽'}에 붙여야 합니다 — 어느 옆면에 붙여도 됩니다.`],
      concept: '각기둥의 전개도에서 두 밑면은 옆면 띠의 서로 다른 쪽에 붙습니다.',
      misconception: '두 밑면을 같은 쪽에 붙이면 접었을 때 겹치고, 다른 쪽은 비게 됩니다.',
      결: 1,
    };
  },
};

export const 옆면채우기 = (뺄: 1 | 2): 조작갈래 => ({
  id: `prism-sides-${뺄}`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 3, 6);
    const columns = n + 2;
    const 시작 = 사이(next, 0, 2);
    const 바른띠 = Array.from({ length: n }, (_, i) => 시작 + i);
    const a = 바른띠[next(n)];
    const b = 바른띠[next(n)];
    const 위아래: 쪽 = next(2) ? 'top' : 'bottom';
    const bases = [{ col: a, side: 위아래 }, { col: b, side: 반대쪽(위아래) }];
    const 뺄곳 = 바른띠.filter((c) => c !== a && c !== b);
    if (뺄곳.length < 뺄) return null;
    const 뺀 = new Set<number>();
    while (뺀.size < 뺄) 뺀.add(뺄곳[next(뺄곳.length)]);
    const strip = 바른띠.filter((c) => !뺀.has(c));
    const 이름 = 각기둥이름(n);
    return {
      prompt: `밑면이 ${다각형이름(n)}인 ${이름}의 전개도입니다. 빈 칸을 눌러 빠진 옆면을 채워 전개도를 완성해 보세요.`,
      answer: `옆면 ${n}개가 이어진 전개도`,
      manipulate: { kind: 'prism-net', n, columns, mode: 'sides', strip, bases, example: { strip: 바른띠, bases } },
      tag: 'solid',
      strategy: '밑면의 변의 수만큼 옆면을 이어 놓기',
      hint: '밑면의 변 하나하나에 옆면이 하나씩 붙어요. 밑면의 변이 몇 개인지 세어 보세요.',
      steps: [`밑면이 ${다각형이름(n)}이므로 변이 ${n}개입니다.`, `밑면의 변마다 옆면이 하나씩 있으므로 옆면은 ${n}개입니다.`, `옆면 ${n}개가 끊어지지 않게 한 줄로 이어지고, 두 밑면이 그 옆면에 붙어 있으면 전개도가 됩니다.`],
      concept: '각기둥의 옆면의 수는 밑면의 변의 수와 같고, 옆면은 모두 직사각형입니다.',
      misconception: '옆면을 하나 더 붙이거나 덜 붙이기 쉽습니다. 옆면의 수는 밑면의 변의 수와 같습니다.',
      결: 뺄 === 1 ? 1 : 2,
    };
  },
});

export const 만나는점찾기: 조작갈래 = {
  id: 'prism-meet',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 3, 6);
    const strip = Array.from({ length: n }, (_, i) => i);
    const 위아래: 쪽 = next(2) ? 'top' : 'bottom';
    const bases = [{ col: next(n), side: 위아래 }, { col: next(n), side: 반대쪽(위아래) }];
    // 띠의 위쪽과 아래쪽 꼭짓점 몇 개에 이름을 붙입니다.
    const 자리: { corner: 'T' | 'B'; i: number }[] = [
      { corner: 'T', i: 0 }, { corner: 'T', i: n }, { corner: 'B', i: 0 }, { corner: 'B', i: n }, { corner: next(2) ? 'T' : 'B', i: 사이(next, 1, n - 1) },
    ];
    const 이름들 = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'];
    // 이름은 섞어 붙여, 이름의 차례로 답을 짐작하지 못하게 합니다.
    const 섞은 = 섞기(이름들, next);
    const points = 자리.map((p, k) => ({ name: 섞은[k], ...p }));
    const 물을 = points[next(4)];
    const 짝 = points.find((p) => p.corner === 물을.corner && p.i === (물을.i === 0 ? n : 0))!;
    const 이름 = 각기둥이름(n);
    return {
      prompt: `${이름}의 전개도를 접었을 때 점 ${물을.name}과(와) 만나는 점을 눌러 보세요.`,
      answer: `점 ${짝.name}`,
      manipulate: { kind: 'prism-net', n, columns: n, mode: 'meet', strip, bases, points, ask: 물을.name, example: { strip, bases } },
      tag: 'solid',
      strategy: '전개도를 접었을 때 만나는 점 찾기',
      hint: '옆면 띠를 둥글게 말아 세운다고 생각해 보세요. 띠의 왼쪽 끝 변과 오른쪽 끝 변이 맞닿아요.',
      steps: ['옆면 띠를 둥글게 말아 세우면 띠의 양 끝 변이 맞닿아 하나의 모서리가 됩니다.', `점 ${물을.name}은(는) 띠의 ${물을.i === 0 ? '왼쪽' : '오른쪽'} 끝 ${물을.corner === 'T' ? '위쪽' : '아래쪽'} 꼭짓점입니다.`, `그러므로 띠의 반대쪽 끝 ${물을.corner === 'T' ? '위쪽' : '아래쪽'} 꼭짓점인 점과 만납니다.`],
      concept: '전개도를 접으면 잘린 모서리의 양쪽이 다시 만나 하나의 모서리가 됩니다.',
      misconception: '바로 옆에 있는 점이나 위아래가 바뀐 점을 고르기 쉽습니다.',
      결: 2,
    };
  },
};
