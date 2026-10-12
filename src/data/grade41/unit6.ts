import type { Difficulty, GridMoveVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 몇째수 } from './thinking';

// ════════════════════════════════════════════════════════════════════
// 4-1 6단원 규칙 찾기
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 규칙을 찾아 설명하기 / 규칙을 수로
// 나타내기 / 규칙을 식으로 나타내기 / 계산식의 배열에서 규칙 찾기 /
// 계산 결과 추측하기 / 등호로 나타내기 ⑴(덧셈·뺄셈) / ⑵(곱셈·나눗셈)
//
// 지도서가 못박은 것:
//   · 규칙을 식으로 나타낼 때 혼합 계산식이나 일반항(□번째) 같은
//     복잡한 식은 다루지 않습니다. 같은 수를 거듭 더하거나 곱하는 꼴로
//     씁니다.
//   · 등호(=)는 '계산 결과를 쓰라'는 기호가 아니라 양쪽의 크기가 같다는
//     관계입니다. 등호 문항은 두 자리 수 범위입니다.
// ════════════════════════════════════════════════════════════════════

const 째 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째'];

// ── 수 배열 ─────────────────────────────────────────────────────────
const 수배열: G5Family = {
  id: 'sequence',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 곱 = lv === '상' && next(2) === 0;
    let seq: number[];
    let 규칙: string;
    if (곱) {
      const r = [2, 3][next(2)];
      const a = 사이(next, 2, 9);
      seq = Array.from({ length: 5 }, (_, k) => a * r ** k);
      규칙 = `${r}배씩 커지는`;
    } else {
      const step = [1, 10, 100, 1000, 11, 101][next(lv === '하' ? 4 : 6)];
      const 줄어 = next(3) === 0;
      const start = 사이(next, 1001, 5999);
      seq = Array.from({ length: 5 }, (_, k) => (줄어 ? start + step * 6 - step * k : start + step * k));
      규칙 = `${step}씩 ${줄어 ? '작아지는' : '커지는'}`;
    }
    const 빈 = 사이(next, 2, 4);
    const ans = seq[빈];
    const 차 = seq[1] - seq[0];
    const 보기 = 곱 ? [ans + 차, seq[빈 - 1] + 차, ans * 2] : [ans + 차, ans - 차 * 2, ans + 1 === ans + 차 ? ans + 10 : ans + 1, ans - 10];
    return {
      prompt: `${seq.map((x, k) => (k === 빈 ? '□' : String(x))).join(', ')}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(ans),
      wrongs: [...new Set(보기)].filter((x) => x > 0 && x !== ans).map(String),
      tag: 'pattern',
      strategy: '수의 배열에서 규칙 찾기',
      hint: '이웃한 두 수를 비교해 몇씩 변하는지 찾아보세요.',
      steps: [`${규칙} 규칙입니다.`, `그러므로 □ 안에 알맞은 수는 ${ans}입니다.`],
    };
  },
};

const 배열표: G5Family = {
  id: 'table',
  make: (seed) => {
    const next = 고르개(seed);
    const 가로 = [1, 10, 100][next(3)];
    const 세로 = [1000, 100, 10][next(3)];
    if (가로 === 세로) return null;
    const s = 사이(next, 1, 5) * 1000 + 사이(next, 0, 6) * 100 + 사이(next, 0, 6) * 10 + 사이(next, 0, 6);
    const r = 사이(next, 1, 2);
    const c = 사이(next, 1, 3);
    const ans = s + r * 세로 + c * 가로;
    // 표 전체를 보여 주고 한 칸만 비웁니다. 규칙은 표에서 찾게 합니다.
    const rows = Array.from({ length: 3 }, (_, rr) => Array.from({ length: 4 }, (_, cc) => (rr === r && cc === c ? null : s + rr * 세로 + cc * 가로)));
    return {
      prompt: '수 배열표에서 규칙을 찾아 ? 안에 알맞은 수를 구하면 얼마일까요?',
      answer: String(ans),
      wrongs: [...new Set([s + r * 가로 + c * 세로, ans + 가로, ans - 세로, s + (r + c) * 세로])].filter((x) => x !== ans).map(String),
      tag: 'pattern',
      strategy: '수 배열표의 규칙',
      hint: '오른쪽으로 갈 때와 아래쪽으로 갈 때 각각 몇씩 커지는지 찾아요.',
      steps: [`오른쪽으로 한 칸 갈 때마다 ${가로}씩, 아래쪽으로 한 칸 갈 때마다 ${세로}씩 커집니다.`, `? 바로 왼쪽 수 ${ans - 가로}보다 ${가로} 큰 ${ans}입니다.`],
      visual: { kind: 'number-array', label: '수 배열표', rows },
    };
  },
};

// ── 모양의 배열 ─────────────────────────────────────────────────────
type 모양규칙 = { id: string; 수: (n: number) => number; 칸: (n: number) => Array<[number, number]>; 식: (n: number) => string; 설명: string; 틀린식: (n: number) => string[] };
const 모양규칙들: 모양규칙[] = [
  {
    id: 'L',
    수: (n) => 2 * n - 1,
    칸: (n) => [...Array.from({ length: n }, (_, k): [number, number] => [0, 4 - k]), ...Array.from({ length: n - 1 }, (_, k): [number, number] => [k + 1, 4])],
    식: (n) => ['1', ...Array(n - 1).fill('2')].join('+'),
    설명: '사각형이 2개씩 늘어나는',
    틀린식: (n) => [['1', ...Array(n - 2).fill('2')].join('+'), ['1', ...Array(n).fill('2')].join('+'), `${n}×2`],
  },
  {
    id: 'square',
    수: (n) => n * n,
    칸: (n) => Array.from({ length: n * n }, (_, k): [number, number] => [k % n, 4 - Math.floor(k / n)]),
    식: (n) => `${n}×${n}`,
    설명: '가로와 세로가 1개씩 늘어나는 정사각형 모양인',
    틀린식: (n) => [`${n - 1}×${n - 1}`, `${n}×${n + 1}`, `${n}+${n}`],
  },
  {
    id: 'stairs',
    수: (n) => (n * (n + 1)) / 2,
    칸: (n) => Array.from({ length: n }, (_, c) => Array.from({ length: c + 1 }, (_, h): [number, number] => [c, 4 - h])).flat(),
    식: (n) => Array.from({ length: n }, (_, k) => String(k + 1)).join('+'),
    설명: '둘째부터 2개, 3개, 4개…씩 늘어나는',
    틀린식: (n) => [Array.from({ length: n - 1 }, (_, k) => String(k + 1)).join('+'), Array.from({ length: n + 1 }, (_, k) => String(k + 1)).join('+'), `${n}×${n}`],
  },
  {
    id: 'two-rows',
    수: (n) => 2 * n,
    칸: (n) => Array.from({ length: 2 * n }, (_, k): [number, number] => [k % n, 3 + Math.floor(k / n)]),
    식: (n) => `2×${n}`,
    설명: '2개씩 늘어나는',
    틀린식: (n) => [`2×${n - 1}`, `2×${n + 1}`, `${n}+${n + 1}`],
  },
  {
    id: 'three-rows',
    수: (n) => 3 * n,
    칸: (n) => Array.from({ length: 3 * n }, (_, k): [number, number] => [k % n, 2 + Math.floor(k / n)]),
    식: (n) => `3×${n}`,
    설명: '3개씩 늘어나는',
    틀린식: (n) => [`3×${n - 1}`, `3×${n + 1}`, `${n}+3`],
  },
  {
    id: 'tower',
    수: (n) => n + 1,
    칸: (n) => [[1, 4], ...Array.from({ length: n }, (_, k): [number, number] => [0, 4 - k])],
    식: (n) => `${n}+1`,
    설명: '1개씩 늘어나는',
    틀린식: (n) => [`${n - 1}+1`, `${n}+2`, `${n}×2`],
  },
];

const 계산 = (식: string) => 식.split('+').reduce((s, part) => s + part.split('×').reduce((m, x) => m * Number(x), 1), 0);

const 모양그림 = (r: 모양규칙): GridMoveVisual => ({
  kind: 'grid-move',
  label: '모양의 배열',
  size: 5,
  plain: true,
  panels: [1, 2, 3, 4].map((n) => ({ name: 째[n - 1], cells: r.칸(n) })),
});

const 모양수: G5Family = {
  id: 'shape-count',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const pool = lv === '하' ? 모양규칙들.filter((r) => r.id !== 'square' && r.id !== 'stairs') : 모양규칙들;
    const r = pool[next(pool.length)];
    const n = lv === '상' ? 사이(next, 6, 7) : 사이(next, 5, 6);
    const ans = r.수(n);
    const 직선 = r.수(4) + (r.수(4) - r.수(3)) * (n - 4);
    return {
      prompt: `규칙에 따라 사각형을 늘어놓았습니다. ${째[n - 1]}에 올 모양의 사각형은 몇 개일까요?`,
      answer: `${ans}개`,
      wrongs: [...new Set([직선 === ans ? ans + 2 : 직선, r.수(n - 1), ans + 1, ans - 1])].filter((x) => x !== ans && x > 0).map((x) => `${x}개`),
      tag: 'pattern',
      strategy: '모양의 배열에서 규칙을 찾아 수로 나타내기',
      hint: '첫째부터 넷째까지 사각형의 수를 세어 보고 어떻게 늘어나는지 보세요.',
      steps: [`사각형의 수는 ${[1, 2, 3, 4].map(r.수).join(', ')}개로 ${r.설명} 규칙입니다.`, `${째[n - 1]}에는 ${ans}개입니다.`],
      visual: 모양그림(r),
    };
  },
};

const 모양식: G5Family = {
  id: 'shape-expr',
  make: (seed) => {
    const next = 고르개(seed);
    const r = 모양규칙들[next(모양규칙들.length)];
    const n = 사이(next, 5, 6);
    const ans = r.식(n);
    const wrongs = r.틀린식(n).filter((w) => 계산(w) !== 계산(ans));
    if (wrongs.length < 3) return null;
    return {
      prompt: `사각형의 수를 첫째는 ${r.식(1)}, 둘째는 ${r.식(2)}, 셋째는 ${r.식(3)}처럼 식으로 나타냈습니다. 같은 규칙으로 ${째[n - 1]}를 나타낸 식은 어느 것일까요?`,
      answer: ans,
      wrongs,
      tag: 'pattern',
      strategy: '모양의 배열에서 규칙을 찾아 식으로 나타내기',
      hint: '넷째의 식을 먼저 써 보고 무엇이 하나씩 늘어나는지 보세요.',
      steps: [`넷째는 ${r.식(4)}입니다.`, `${째[n - 1]}는 ${ans}=${계산(ans)}입니다.`],
      visual: 모양그림(r),
    };
  },
};

const 늘어나는수: G5Family = {
  id: 'shape-step',
  make: (seed) => {
    const next = 고르개(seed);
    const pool = 모양규칙들.filter((r) => r.수(3) - r.수(2) === r.수(2) - r.수(1));
    const r = pool[next(pool.length)];
    const d = r.수(2) - r.수(1);
    const n = 사이(next, 4, 6);
    return {
      prompt: `규칙에 따라 사각형을 늘어놓았습니다. ${째[n - 1]} 모양은 ${째[n - 2]} 모양보다 사각형이 몇 개 더 많을까요?`,
      answer: `${d}개`,
      wrongs: [...new Set([d + 1, d - 1, r.수(n), d * 2])].filter((x) => x > 0 && x !== d).map((x) => `${x}개`),
      tag: 'pattern',
      strategy: '모양의 배열에서 늘어나는 수 찾기',
      hint: '이웃한 두 모양의 사각형 수를 견주어 보세요.',
      steps: [`사각형의 수는 ${[1, 2, 3, 4].map(r.수).join(', ')}개로 ${d}개씩 늘어납니다.`, `그러므로 ${d}개 더 많습니다.`],
      visual: 모양그림(r),
    };
  },
};

// ── 계산식의 배열 ───────────────────────────────────────────────────
type 계산식배열 = { 줄: (k: number) => string; 값: (k: number) => number; 설명: string };
const 계산식들 = (next: (b: number) => number): 계산식배열[] => {
  const a = 사이(next, 1, 4) * 100 + 사이(next, 0, 5);
  const b = 사이(next, 1, 4) * 100 + 사이(next, 0, 5);
  const c = 사이(next, 5, 9) * 100;
  const m = [11, 101, 1001][next(3)];
  return [
    { 줄: (k) => `${a + k}+${b + k}`, 값: (k) => a + b + 2 * k, 설명: '더하는 두 수가 각각 1씩 커지면 합은 2씩 커집니다.' },
    { 줄: (k) => `${c + 10 * k}-${a + 10 * k}`, 값: () => c - a, 설명: '빼지는 수와 빼는 수가 똑같이 커지면 차는 그대로입니다.' },
    { 줄: (k) => `${m}×${k + 1}`, 값: (k) => m * (k + 1), 설명: `곱하는 수가 1씩 커지면 곱은 ${m}씩 커집니다.` },
    { 줄: (k) => `${10 ** (k + 1) + 1}×9`, 값: (k) => (10 ** (k + 1) + 1) * 9, 설명: '곱해지는 수의 가운데 0이 하나씩 늘면 곱의 가운데 0도 하나씩 늘어납니다.' },
  ];
};

const 계산식규칙: G5Family = {
  id: 'calc-pattern',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 목록 = 계산식들(next);
    const r = 목록[next(lv === '하' ? 3 : 4)];
    const 보여줄 = [0, 1, 2, 3];
    const ans = `${r.줄(4)}=${r.값(4)}`;
    const wrongs = [`${r.줄(4)}=${r.값(4) + (r.값(1) - r.값(0) || 10)}`, `${r.줄(4)}=${r.값(3)}`, `${r.줄(5)}=${r.값(4)}`, `${r.줄(4)}=${r.값(4) + 1}`];
    return {
      prompt: `${보여줄.map((k) => `${r.줄(k)}=${r.값(k)}`).join(', ')} 다음에 올 계산식은 어느 것일까요?`,
      answer: ans,
      wrongs: [...new Set(wrongs)].filter((w) => w !== ans),
      tag: 'pattern',
      strategy: '계산식의 배열에서 규칙 찾기',
      hint: '식의 수들이 어떻게 바뀌고, 계산 결과는 어떻게 바뀌는지 보세요.',
      steps: [r.설명, `그러므로 다음 식은 ${ans}입니다.`],
      minusIsOperator: true,
    };
  },
};

const 결과추측: G5Family = {
  id: 'calc-guess',
  make: (seed) => {
    const next = 고르개(seed);
    const kind = next(3);
    if (kind === 0) {
      const n = 사이(next, 5, 8);
      const 식 = Array.from({ length: n }, (_, k) => String(2 * k + 1)).join('+');
      return {
        prompt: `1+3=2×2, 1+3+5=3×3, 1+3+5+7=4×4입니다. 규칙을 이용하면 ${식}은(는) 얼마일까요?`,
        answer: String(n * n),
        wrongs: [...new Set([(n - 1) * (n - 1), (n + 1) * (n + 1), n * 2, 2 * n - 1])].filter((x) => x !== n * n).map(String),
        tag: 'pattern',
        strategy: '계산 결과 추측하기',
        hint: '더한 홀수가 몇 개인지 세어 보세요.',
        steps: [`홀수를 ${n}개 더했으므로 ${n}×${n}입니다.`, `${n}×${n}=${n * n}`],
      };
    }
    if (kind === 1) {
      const d = 사이(next, 4, 9);
      const 수 = Number(String(d).repeat(3));
      return {
        prompt: `37×3=111, 37×6=222, 37×9=333입니다. 규칙을 이용하면 37×${d * 3}은(는) 얼마일까요?`,
        answer: String(수),
        wrongs: [...new Set([Number(String(d - 1).repeat(3)), Number(String(d + 1 > 9 ? 1 : d + 1).repeat(3)), d * 3 * 111])].filter((x) => x !== 수).map(String),
        tag: 'pattern',
        strategy: '계산 결과 추측하기',
        hint: '곱하는 수가 3씩 커질 때 곱이 어떻게 바뀌는지 보세요.',
        steps: [`37×${d * 3}은(는) 3의 ${d}배를 곱한 것이므로 111의 ${d}배입니다.`, `그러므로 ${수}입니다.`],
      };
    }
    const n = 사이(next, 4, 6);
    const 일 = Number('1'.repeat(n));
    const 값 = 일 * 일;
    return {
      prompt: `11×11=121, 111×111=12321, 1111×1111=1234321입니다. 규칙을 이용하면 ${일}×${일}은(는) 얼마일까요?`,
      answer: String(값),
      wrongs: [...new Set([Number('1'.repeat(n - 1)) ** 2, Number('1'.repeat(n + 1)) ** 2 / 1, Number(Array.from({ length: n }, (_, k) => k + 1).join(''))])].filter((x) => x !== 값 && Number.isSafeInteger(x)).map(String),
      tag: 'pattern',
      strategy: '계산 결과 추측하기',
      hint: '1의 개수와 곱의 가운데 숫자를 견주어 보세요.',
      steps: [`1이 ${n}개이면 곱은 1부터 ${n}까지 올라갔다가 다시 1로 내려옵니다.`, `그러므로 ${값}입니다.`],
    };
  },
};

// ── 등호 ────────────────────────────────────────────────────────────
const 등호덧셈: G5Family = {
  id: 'equal-add',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 더하기 = lv === '하' || next(2) === 0;
    const a = 사이(next, 12, 60);
    const b = 사이(next, 11, 39);
    const t = 사이(next, 1, 9) * (next(2) === 0 ? 1 : -1);
    const a2 = a + t;
    if (a2 < 10 || a2 > 99) return null;
    if (더하기) {
      const b2 = b - t;
      if (b2 < 1 || b2 > 99) return null;
      return {
        prompt: `${a}+${b}=${a2}+□에서 □ 안에 알맞은 수는 얼마일까요?`,
        answer: String(b2),
        wrongs: [...new Set([a + b, b + t, a + b - a2 + 10, b])].filter((x) => x > 0 && x !== b2).map(String),
        tag: 'pattern',
        strategy: '등호를 사용하여 크기가 같은 두 양 나타내기',
        hint: `${a}이(가) ${a2}(으)로 ${t > 0 ? `${t}만큼 커졌으니` : `${-t}만큼 작아졌으니`} 다른 수는 어떻게 되어야 할까요?`,
        steps: [`${a}+${b}=${a + b}입니다.`, `${a2}+□=${a + b}이므로 □=${b2}입니다.`],
        misconceptionTip: '등호(=)는 답을 쓰라는 표시가 아니라 양쪽의 크기가 같다는 뜻이에요.',
      };
    }
    const b2 = b + t;
    if (b2 < 1 || a2 - b2 < 0 || a <= b) return null;
    return {
      prompt: `${a}-${b}=${a2}-□에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(b2),
      wrongs: [...new Set([a - b, b - t, b, b2 + 2])].filter((x) => x > 0 && x !== b2).map(String),
      tag: 'pattern',
      strategy: '등호를 사용하여 크기가 같은 두 양 나타내기',
      hint: '빼지는 수가 커진 만큼 빼는 수도 커져야 차가 같아요.',
      steps: [`${a}-${b}=${a - b}입니다.`, `${a2}-□=${a - b}이므로 □=${b2}입니다.`],
      misconceptionTip: '뺄셈은 두 수를 똑같이 늘리거나 줄여야 차가 같아요.',
      minusIsOperator: true,
    };
  },
};

const 등호곱셈: G5Family = {
  id: 'equal-mul',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 2, 24);
    const b = 사이(next, 2, 12);
    const k = [2, 3, 4][next(3)];
    if (b % k !== 0 || a * k > 99) return null;
    const 답 = b / k;
    return {
      prompt: `${a}×${b}=${a * k}×□에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(답),
      wrongs: [...new Set([b * k, a * b, b, 답 + 1])].filter((x) => x !== 답).map(String),
      tag: 'pattern',
      strategy: '등호를 사용하여 곱셈식 나타내기',
      hint: `${a}이(가) ${a * k}(으)로 ${k}배가 되었으니 다른 수는 어떻게 되어야 할까요?`,
      steps: [`${a}×${b}=${a * b}입니다.`, `${a * k}×□=${a * b}이므로 □=${답}입니다.`, `곱해지는 수가 ${k}배가 되면 곱하는 수는 ${k}(으)로 나누어야 곱이 같습니다.`],
      misconceptionTip: '등호(=)는 양쪽의 크기가 같다는 뜻이에요.',
    };
  },
};

const 옳은식 = (곱: boolean): G5Family => ({
  id: `equal-true-${곱 ? 'm' : 'a'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 12, 40);
    const b = 사이(next, 2, 9);
    const t = 사이(next, 1, 5);
    if (곱) {
      if (a % 2 !== 0) return null;
      const 참 = `${a}×${b}=${a / 2}×${b * 2}`;
      return {
        prompt: '옳은 식은 어느 것일까요?',
        answer: 참,
        wrongs: [`${a}×${b}=${a / 2}×${b}`, `${a}×${b}=${a * 2}×${b * 2}`, `${a}×${b}=${a + 2}×${b - 2 > 0 ? b - 2 : b + 2}`],
        tag: 'pattern',
        strategy: '등호가 있는 식이 옳은지 판단하기',
        hint: '양쪽을 각각 계산해 크기가 같은지 보세요.',
        steps: [`${a}×${b}=${a * b}, ${a / 2}×${b * 2}=${a * b}(으)로 같습니다.`],
      };
    }
    const 참 = `${a}+${b}=${a + t}+${b - t >= 0 ? b - t : 0}`;
    if (b - t < 1) return null;
    return {
      prompt: '옳은 식은 어느 것일까요?',
      answer: 참,
      wrongs: [`${a}+${b}=${a + t}+${b + t}`, `${a}+${b}=${a + b}+${b}`, `${a}-${b}=${a + t}-${b - t}`],
      tag: 'pattern',
      strategy: '등호가 있는 식이 옳은지 판단하기',
      hint: '양쪽을 각각 계산해 크기가 같은지 보세요.',
      steps: [`${a}+${b}=${a + b}, ${a + t}+${b - t}=${a + b}(으)로 같습니다.`],
      minusIsOperator: true,
    };
  },
});

export const unit6Lesson41 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [수배열, 배열표];
    case 2:
      return lv === '하' ? [수배열, 몇째수] : [수배열, 배열표, 몇째수];
    case 3:
      return lv === '하' ? [늘어나는수, 모양수] : [모양수, 늘어나는수];
    case 4:
      return lv === '하' ? [모양식, 늘어나는수] : [모양식, 모양수];
    case 5:
      return [계산식규칙, 결과추측];
    case 6:
      return [결과추측, 계산식규칙];
    case 7:
      return [등호덧셈, 옳은식(false)];
    case 8:
      return [등호곱셈, 옳은식(true)];
    default:
      return null;
  }
};
