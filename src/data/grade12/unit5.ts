import type { Difficulty, NumberArrayVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이, 수보기 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 1-2 5단원 규칙 찾기
// ────────────────────────────────────────────────────────────────────
// 단원 전개 계획:
//   1 단원 도입
//   2 규칙을 찾아볼까요              — 물체·무늬에서 되풀이되는 부분
//   3 규칙을 만들어 볼까요 ⑴          — 구체물(바둑돌, 연결 모형)
//   4 규칙을 만들어 볼까요 ⑵          — 무늬
//   5 수 배열에서 규칙을 찾아볼까요   — 몇씩 커지거나 작아지는지
//   6 수 배열표에서 규칙을 찾아볼까요 — 오른쪽 1씩, 아래 10씩
//   7 규칙을 여러 가지 방법으로 나타내 볼까요 — 기호(○△), 수(1, 2)
//
// 유의 사항:
//   · 크기, 색깔, 위치, 방향의 단순한 규칙만 다루고 "지나치게 복잡한
//     배열은 다루지 않는다." 되풀이되는 마디는 두세 개짜리만 씁니다.
//   · 다음에 올 것이나 중간에 빠진 것을 추측하게 합니다.
// ════════════════════════════════════════════════════════════════════

const 기호 = ['●', '▲', '■', '★'];
const 색 = ['빨강', '파랑', '노랑', '초록'];

/** 되풀이 마디입니다. AB, ABB, AAB, ABC 꼴만 씁니다. */
const 마디들 = [[0, 1], [0, 1, 1], [0, 0, 1], [0, 1, 2]];

const 늘어놓기 = (next: (b: number) => number, 재료: string[]) => {
  const 꼴 = 마디들[next(마디들.length)];
  const 고른: string[] = [];
  while (고른.length < 3) {
    const v = 재료[next(재료.length)];
    if (!고른.includes(v)) 고른.push(v);
  }
  const 마디 = 꼴.map((k) => 고른[k]);
  return { 마디, 고른 };
};

const 다음것 = (재료: string[], 이름: string): G5Family => ({
  id: `next-${이름}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const { 마디, 고른 } = 늘어놓기(next, 재료);
    const 길이 = 마디.length * 2 + (lv === '상' ? 마디.length : 0);
    const 줄 = Array.from({ length: 길이 + 1 }, (_, k) => 마디[k % 마디.length]);
    // 하·중은 바로 다음, 상은 가운데 빠진 것입니다.
    const miss = lv === '상' ? 사이(next, 2, 길이 - 1) : 길이;
    const ans = 줄[miss];
    const items = 줄.slice(0, Math.max(miss + 1, lv === '상' ? 길이 + 1 : miss + 1)).slice(0, 9);
    return {
      prompt: lv === '상' ? `규칙에 따라 늘어놓았습니다. 빠진 ?에 알맞은 것은 무엇일까요?` : `규칙에 따라 늘어놓았습니다. ?에 알맞은 것은 무엇일까요?`,
      answer: ans,
      wrongs: [...재료.filter((v) => v !== ans)].slice(0, 3),
      tag: 'pattern',
      strategy: '되풀이되는 부분을 찾아 다음 것 알기',
      hint: '처음부터 되풀이되는 부분이 어디까지인지 찾아보세요.',
      steps: [`${마디.join(', ')}이(가) 되풀이됩니다.`, `그러므로 ?에 알맞은 것은 ${ans}입니다.`],
      misconceptionTip: '바로 앞의 것만 보지 말고 되풀이되는 부분 전체를 보세요.',
      visual: { kind: 'pattern', label: `${고른.join(', ')}의 규칙`, items, missingIndex: miss },
    };
  },
});

const 되풀이부분: G5Family = {
  id: 'unit-of-repeat',
  make: (seed) => {
    const next = 고르개(seed);
    const { 마디, 고른 } = 늘어놓기(next, 기호);
    const 줄 = Array.from({ length: 마디.length * 3 }, (_, k) => 마디[k % 마디.length]).slice(0, 9);
    const 답 = 마디.join('');
    const 후보 = [
      줄.slice(0, 마디.length + 1).join(''),
      [...마디].reverse().join(''),
      고른.join(''),
      줄.slice(1, 마디.length + 1).join(''),
    ];
    const 틀린 = 후보.filter((w, k, all) => w !== 답 && all.indexOf(w) === k && w.length >= 2);
    if (틀린.length < 3) return null;
    return {
      // 두 마디를 이은 것('●▲●▲')도 되풀이되기는 하므로 보기에 넣지 않습니다.
      prompt: '규칙에 따라 늘어놓았습니다. 되풀이되는 가장 짧은 부분은 어느 것일까요?',
      answer: 답,
      wrongs: 틀린,
      tag: 'pattern',
      strategy: '되풀이되는 부분 찾기',
      hint: '처음 모양이 다시 나오는 곳까지가 한 마디예요.',
      steps: [`${답}이(가) 계속 되풀이됩니다.`],
      visual: { kind: 'pattern', label: '늘어놓은 모양', items: 줄 },
    };
  },
};

const 몇째것: G5Family = {
  id: 'nth',
  make: (seed) => {
    const next = 고르개(seed);
    const 바둑 = ['흰색', '검은색'];
    const 꼴 = [[0, 1], [0, 1, 1], [0, 0, 1]][next(3)];
    const 마디 = 꼴.map((k) => 바둑[k]);
    const n = 사이(next, 8, 12);
    const ans = 마디[(n - 1) % 마디.length];
    const 째말: Record<number, string> = { 8: '여덟째', 9: '아홉째', 10: '열째', 11: '열한째', 12: '열두째' };
    return {
      prompt: `바둑돌을 ${마디.join(', ')} 차례로 되풀이하여 놓았습니다. 왼쪽에서 ${째말[n]} 바둑돌은 무슨 색일까요?`,
      answer: ans,
      wrongs: [ans === '흰색' ? '검은색' : '흰색', '빨간색', '알 수 없습니다'],
      tag: 'pattern',
      strategy: '규칙으로 몇째 것 알기',
      hint: '되풀이되는 부분을 이어서 써 보며 세어 보세요.',
      steps: [`${Array.from({ length: n }, (_, k) => 마디[k % 마디.length]).join(', ')}`, `그러므로 ${째말[n]} 바둑돌은 ${ans}입니다.`],
      visual: { kind: 'pattern', label: '바둑돌', items: Array.from({ length: 마디.length * 2 }, (_, k) => (마디[k % 마디.length] === '흰색' ? '○' : '●')) },
    };
  },
};

// ── 수 배열 ─────────────────────────────────────────────────────────
const 수배열 = (lvHard: boolean): G5Family => ({
  id: `num-seq-${lvHard ? 'h' : 'e'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const steps = lv === '하' ? [1, 2, 10] : [2, 3, 5, 10];
    const step = steps[next(steps.length)];
    const down = lvHard && next(2) === 0;
    const len = 5;
    const start = down ? 사이(next, step * (len - 1) + 1, 99) : 사이(next, 1, 99 - step * (len - 1));
    const seq = Array.from({ length: len }, (_, k) => (down ? start - step * k : start + step * k));
    const miss = lvHard ? 사이(next, 1, len - 1) : len - 1;
    const ans = seq[miss];
    return {
      prompt: `규칙에 따라 수를 늘어놓았습니다. ?에 알맞은 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [ans + 1, ans - 1, ans + step, ans - step, ans + 10], 1, 100),
      tag: 'pattern',
      strategy: '몇씩 커지거나 작아지는지 찾기',
      hint: '이웃한 두 수를 견주어 몇씩 커지는지(작아지는지) 찾아보세요.',
      steps: [`${step}씩 ${down ? '작아지는' : '커지는'} 규칙입니다.`, `그러므로 ?에 알맞은 수는 ${ans}입니다.`],
      misconceptionTip: '1씩 커지는 규칙이라고 미리 정하지 말고 두 수의 차이를 보세요.',
      visual: { kind: 'pattern', label: '수 배열', items: seq.map(String), missingIndex: miss },
    };
  },
});

const 몇씩: G5Family = {
  id: 'num-step',
  make: (seed) => {
    const next = 고르개(seed);
    const step = [2, 3, 4, 5, 10][next(5)];
    const start = 사이(next, 1, 40);
    const seq = Array.from({ length: 4 }, (_, k) => start + step * k);
    return {
      prompt: `${seq.join(', ')}은(는) 몇씩 커지는 규칙일까요?`,
      answer: `${step}씩`,
      wrongs: [1, step + 1, step === 2 ? 3 : step - 1, 10 === step ? 5 : 10].filter((v) => v !== step).map((v) => `${v}씩`),
      tag: 'pattern',
      strategy: '수 배열의 규칙 말하기',
      hint: '이웃한 두 수의 차이를 구해 보세요.',
      steps: [`${seq[0]}에서 ${seq[1]}까지 ${step}만큼 커집니다.`, `그러므로 ${step}씩 커지는 규칙입니다.`],
    };
  },
};

// ── 수 배열표 ───────────────────────────────────────────────────────
// 1부터 100까지의 수 배열표에서 몇 줄만 잘라 그립니다. 한 줄에 10칸입니다.
// 모르는 칸(hole)은 '?'로 둡니다.
const 배열그림 = (첫줄: number, 줄수: number, hole?: number, shaded?: number[]): NumberArrayVisual => ({
  kind: 'number-array',
  label: '수 배열표',
  rows: Array.from({ length: 줄수 }, (_, r) => Array.from({ length: 10 }, (_, c) => {
    const v = (첫줄 + r) * 10 + c + 1;
    return v === hole ? null : v;
  })),
  ...(shaded ? { shaded } : {}),
});
const 줄 = (n: number) => Math.floor((n - 1) / 10);

const 배열표: G5Family = {
  id: 'hundred-chart',
  make: (seed) => {
    const next = 고르개(seed);
    const kind = next(4);
    const n = 사이(next, 12, 88);
    if (n % 10 === 0) return null;
    if (kind === 0) {
      return {
        prompt: '1부터 100까지의 수 배열표에서 아래로 한 칸 내려가면 수는 몇씩 커질까요?',
        answer: '10씩',
        wrongs: ['1씩', '2씩', '5씩'],
        tag: 'pattern',
        strategy: '수 배열표의 세로 규칙',
        hint: '수 배열표는 한 줄에 10개씩 놓여 있어요.',
        steps: ['한 줄에 10개씩 놓여 있으므로 아래로 한 칸 가면 10만큼 커집니다.'],
        visual: 배열그림(0, 3),
      };
    }
    if (kind === 1) {
      return {
        prompt: `1부터 100까지의 수 배열표에서 ${n} 바로 아래 칸의 수는 무엇일까요?`,
        answer: String(n + 10),
        wrongs: 수보기(n + 10, [n + 1, n - 10, n + 11, n + 9], 1, 100),
        tag: 'pattern',
        strategy: '수 배열표에서 아래 칸 찾기',
        hint: '아래로 한 칸 가면 10만큼 커져요.',
        steps: [`아래로 한 칸 가면 10씩 커지므로 ${n}+10=${n + 10}입니다.`],
        visual: 배열그림(줄(n), 2, n + 10),
      };
    }
    if (kind === 2) {
      return {
        prompt: `1부터 100까지의 수 배열표에서 ${n} 바로 위 칸의 수는 무엇일까요?`,
        answer: String(n - 10),
        wrongs: 수보기(n - 10, [n - 1, n + 10, n - 11, n - 9], 1, 100),
        tag: 'pattern',
        strategy: '수 배열표에서 위 칸 찾기',
        hint: '위로 한 칸 가면 10만큼 작아져요.',
        steps: [`위로 한 칸 가면 10씩 작아지므로 ${n}-10=${n - 10}입니다.`],
        minusIsOperator: true,
        visual: 배열그림(줄(n) - 1, 2, n - 10),
      };
    }
    const step = [2, 3, 5][next(3)];
    const start = 사이(next, 1, 60);
    const seq = Array.from({ length: 4 }, (_, k) => start + step * k);
    const ans = start + step * 4;
    return {
      prompt: `수 배열표에서 ${seq.join(', ')}에 색칠했습니다. 같은 규칙으로 다음에 색칠할 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [ans + 1, ans - 1, seq[3] + 10, ans + step], 1, 100),
      tag: 'pattern',
      strategy: '색칠한 수의 규칙',
      hint: '색칠한 수가 몇씩 커지는지 보세요.',
      steps: [`${step}씩 커지는 규칙입니다.`, `${seq[3]}+${step}=${ans}입니다.`],
      // 색칠한 칸만 칠하고 다음 칸은 표시하지 않습니다. 표시하면 규칙을
      // 찾지 않고 그 칸을 읽기만 합니다.
      visual: 배열그림(줄(start), 줄(ans) - 줄(start) + 1, undefined, seq),
    };
  },
};

// ── 여러 가지 방법으로 나타내기 ─────────────────────────────────────
const 기호로: G5Family = {
  id: 'as-numbers',
  make: (seed) => {
    const next = 고르개(seed);
    const { 마디 } = 늘어놓기(next, 색);
    const 종류 = [...new Set(마디)];
    const 수로 = (x: string) => String(종류.indexOf(x) + 1);
    const 줄 = Array.from({ length: 마디.length * 2 }, (_, k) => 마디[k % 마디.length]);
    const 답 = 줄.map(수로).join(', ');
    const 틀린 = [
      줄.map((x) => String(종류.length - 종류.indexOf(x))).join(', '),
      줄.map((_, k) => String((k % 종류.length) + 1)).join(', '),
      줄.map((x, k) => (k === 줄.length - 1 ? String(((종류.indexOf(x) + 1) % 종류.length) + 1) : 수로(x))).join(', '),
    ].filter((w, k, all) => w !== 답 && all.indexOf(w) === k);
    if (틀린.length < 3) 틀린.push(줄.map(() => '1').join(', '));
    return {
      prompt: `${줄.join(', ')} 차례로 색칠했습니다. ${종류.map((c, k) => `${c}을(를) ${k + 1}`).join(', ')}(으)로 나타내면 어떻게 될까요?`,
      answer: 답,
      wrongs: 틀린,
      tag: 'pattern',
      strategy: '규칙을 수로 나타내기',
      hint: '색 하나하나를 정한 수로 바꾸어 차례로 써 보세요.',
      steps: [`${종류.map((c, k) => `${c}은(는) ${k + 1}`).join(', ')}입니다.`, `차례로 바꾸면 ${답}입니다.`],
      // 1학년은 글보다 색을 먼저 봅니다. 색칠한 차례를 그대로 보여 줍니다.
      visual: { kind: 'pattern', label: '색칠한 차례', items: 줄 },
    };
  },
};

export const unit5Lesson12 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [다음것(기호, 'shape')];
    case 2:
      if (lv === '하') return [다음것(기호, 'shape'), 다음것(색, 'color')];
      if (lv === '중') return [다음것(기호, 'shape'), 되풀이부분, 다음것(색, 'color')];
      return [다음것(기호, 'shape'), 되풀이부분];
    case 3:
      if (lv === '하') return [되풀이부분, 다음것(['○', '●', '◎', '◇'], 'stone')];
      return [몇째것, 되풀이부분];
    case 4:
      if (lv === '하') return [다음것(색, 'color')];
      return [다음것(색, 'color'), 다음것(기호, 'shape')];
    case 5:
      if (lv === '하') return [수배열(false), 몇씩];
      if (lv === '중') return [수배열(false), 몇씩, 수배열(true)];
      return [수배열(true), 몇씩];
    case 6:
      return [배열표];
    case 7:
      return lv === '하' ? [기호로, 되풀이부분] : [기호로];
    default:
      return null;
  }
};

