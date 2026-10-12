import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 만단위 } from './unit1';

// ════════════════════════════════════════════════════════════════════
// 4-1 큰 수·각도·평면도형의 이동·규칙 찾기의 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
// 같은 차시에서도 거꾸로 생각하기, 조건에 맞는 수 찾기, 여러 번 한 것을
// 한 번으로 줄이기, 규칙을 일반화하기처럼 생각하는 방향을 바꾸어 냅니다.
// ════════════════════════════════════════════════════════════════════

// ── 1단원 큰 수 ──────────────────────────────────────────────────────
const 뛰는수들 = [10000, 100000, 1000000, 10000000, 100000000];

/** 어떤 수에서 S씩 n번 뛰어 세었더니 X — 어떤 수, 또는 몇 번 뛰었는지 */
export const 뛰어세기거꾸로: G5Family = {
  id: 'skip-reverse',
  make: (seed) => {
    const next = 고르개(seed);
    const S = 뛰는수들[next(뛰는수들.length)];
    const n = 사이(next, 3, 6);
    const 처음 = 사이(next, 10, 98) * S + (S >= 100000 ? 사이(next, 0, 9) * (S / 10) : 0);
    const 끝 = 처음 + n * S;
    if (next(2) === 0) {
      return {
        prompt: `어떤 수에서 ${만단위(S)}씩 ${n}번 뛰어 세었더니 ${만단위(끝)}이(가) 되었습니다. 어떤 수는 얼마일까요?`,
        answer: 만단위(처음),
        wrongs: [만단위(끝 + n * S), 만단위(끝 - (n - 1) * S), 만단위(끝 - n * S * 10), 만단위(끝 - S)].filter((w, i, xs) => w !== 만단위(처음) && xs.indexOf(w) === i).slice(0, 3),
        tag: 'placeValue',
        strategy: '거꾸로 뛰어 세어 처음 수 구하기',
        hint: `${만단위(끝)}에서 거꾸로 ${만단위(S)}씩 ${n}번 뛰어 세어 보세요.`,
        steps: [`${만단위(S)}씩 ${n}번이면 ${만단위(n * S)}만큼 커진 것입니다.`, `${만단위(끝)}에서 ${만단위(n * S)}만큼 거꾸로 가면 ${만단위(처음)}입니다.`],
        misconceptionTip: '거꾸로 뛰어 셀 때는 같은 자리 숫자가 1씩 작아져요.',
      };
    }
    return {
      prompt: `${만단위(처음)}에서 ${만단위(S)}씩 몇 번 뛰어 세면 ${만단위(끝)}이(가) 될까요?`,
      answer: `${n}번`,
      wrongs: [`${n + 1}번`, `${n - 1}번`, `${n * 10}번`],
      tag: 'placeValue',
      strategy: '몇 번 뛰어 세었는지 구하기',
      hint: '어느 자리 숫자가 얼마나 커졌는지 보세요.',
      steps: [`${만단위(끝)}은(는) ${만단위(처음)}보다 ${만단위(끝 - 처음)}만큼 큽니다.`, `${만단위(S)}씩 ${n}번 뛰어 센 것입니다.`],
    };
  },
};

/** 0~9 가운데 몇 장으로 만든 가장 큰(작은, 둘째로 큰) 수 */
export const 큰수카드: G5Family = {
  id: 'big-cards',
  make: (seed) => {
    const next = 고르개(seed);
    const k = 사이(next, 6, 8);
    const 카드: number[] = [0];
    while (카드.length < k) {
      const c = 사이(next, 1, 9);
      if (!카드.includes(c)) 카드.push(c);
    }
    const 내림 = [...카드].sort((a, b) => b - a);
    const 오름 = [...카드].sort((a, b) => a - b);
    const 갈래 = next(3);
    const 가장큰 = Number(내림.join(''));
    const 둘째 = Number([...내림.slice(0, -2), 내림[k - 1], 내림[k - 2]].join(''));
    // 가장 작은 수: 0은 맨 앞에 올 수 없으므로 0이 아닌 가장 작은 숫자를 앞에 둡니다.
    const 가장작은 = Number([오름[1], 0, ...오름.slice(2)].join(''));
    const 답 = [가장큰, 둘째, 가장작은][갈래];
    const 말 = ['가장 큰', '둘째로 큰', '가장 작은'][갈래];
    const 틀린 = [가장큰, 둘째, 가장작은, Number(오름.join('')), Number([...내림.slice(0, -3), 내림[k - 1], 내림[k - 3], 내림[k - 2]].join(''))].filter((x, i, xs) => x !== 답 && xs.indexOf(x) === i && String(x).length === k);
    if (틀린.length < 3) return null;
    const 보일차례 = [...카드];
    for (let t = 보일차례.length - 1; t > 0; t -= 1) {
      const j = next(t + 1);
      [보일차례[t], 보일차례[j]] = [보일차례[j], 보일차례[t]];
    }
    return {
      prompt: `수 카드 ${보일차례.join(', ')}을(를) 한 번씩 모두 사용하여 ${['', '', '', '', '', '', '여섯', '일곱', '여덟'][k]} 자리 수를 만들려고 합니다. ${말} 수는 얼마일까요?`,
      answer: String(답),
      wrongs: 틀린.slice(0, 3).map(String),
      tag: 'placeValue',
      strategy: '자릿값을 생각하여 조건에 맞는 수 만들기',
      hint: 갈래 === 2 ? '0은 맨 앞에 올 수 없어요. 0이 아닌 가장 작은 숫자를 맨 앞에 두세요.' : '높은 자리부터 큰 숫자를 차례로 놓아요.',
      steps: 갈래 === 0
        ? [`높은 자리부터 ${내림.join(', ')}을(를) 놓으면 ${가장큰}입니다.`]
        : 갈래 === 1
          ? [`가장 큰 수는 ${가장큰}입니다.`, `둘째로 큰 수는 가장 낮은 두 자리의 숫자를 바꾼 ${둘째}입니다.`]
          : [`0은 맨 앞에 올 수 없으므로 맨 앞에 ${오름[1]}을(를) 놓고, 그다음에 0과 나머지 숫자를 작은 것부터 놓습니다.`, `가장 작은 수는 ${가장작은}입니다.`],
      misconceptionTip: '0이 맨 앞에 오면 그 자리 수가 아니에요.',
    };
  },
};

/** 5□3721>5638000 처럼 □에 들어갈 수 있는 숫자의 개수 */
export const 네모숫자: G5Family = {
  id: 'digit-box',
  make: (seed) => {
    const next = 고르개(seed);
    const k = 사이(next, 6, 8);
    const 비교 = Array.from({ length: k }, (_, i) => (i === 0 ? 사이(next, 2, 9) : 사이(next, 0, 9)));
    const 왼 = [...비교];
    const 자리 = 사이(next, 1, 3);
    for (let i = 자리 + 1; i < k; i += 1) 왼[i] = 사이(next, 0, 9);
    const 큼 = next(2) === 0;
    const 들어감 = Array.from({ length: 10 }, (_, d) => d).filter((d) => {
      const x = [...왼];
      x[자리] = d;
      const a = Number(x.join(''));
      const b = Number(비교.join(''));
      return 큼 ? a > b : a < b;
    });
    if (들어감.length === 0 || 들어감.length === 10) return null;
    const v = 들어감.length;
    const 왼글 = 왼.map((d, i) => (i === 자리 ? '□' : String(d))).join('');
    return {
      prompt: `${왼글}${큼 ? '>' : '<'}${비교.join('')}에서 □ 안에 들어갈 수 있는 숫자는 모두 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: [v + 1, v - 1, 10 - v, v + 2].filter((x, i, xs) => x >= 0 && x <= 10 && x !== v && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}개`),
      tag: 'placeValue',
      strategy: '높은 자리부터 견주어 □에 들어갈 숫자 찾기',
      hint: '□보다 높은 자리 숫자는 같아요. □의 자리 숫자를 견주고, 같을 때는 그다음 자리를 보세요.',
      steps: [`□ 자리에 ${비교[자리]}을(를) 넣으면 다음 자리부터 견주어야 합니다.`, `들어갈 수 있는 숫자는 ${들어감.join(', ')}(으)로 ${v}개입니다.`],
      misconceptionTip: '□에 같은 숫자를 넣었을 때도 될 수 있는지 꼭 따져 보세요.',
    };
  },
};

/** 같은 숫자 두 개가 나타내는 값이 몇 배인지 */
export const 자릿값배: G5Family = {
  id: 'place-times',
  make: (seed) => {
    const next = 고르개(seed);
    const k = 사이(next, 7, 9);
    const d = 사이(next, 2, 9);
    const ds = Array.from({ length: k }, (_, i) => (i === 0 ? 사이(next, 1, 9) : 사이(next, 0, 9))).map((x) => (x === d ? (x + 1) % 10 : x));
    const i = 사이(next, 0, k - 4);
    const j = 사이(next, i + 1, k - 1);
    ds[i] = d;
    ds[j] = d;
    if (ds[0] === 0) return null;
    const 배 = 10 ** (j - i);
    return {
      prompt: `${ds.join('')}에서 앞쪽의 숫자 ${d}이(가) 나타내는 값은 뒤쪽의 숫자 ${d}이(가) 나타내는 값의 몇 배일까요?`,
      answer: `${배}배`,
      wrongs: [배 * 10, 배 / 10, j - i, 배 * 100].filter((x, a, xs) => x >= 1 && x !== 배 && Number.isInteger(x) && xs.indexOf(x) === a).slice(0, 3).map((x) => `${x}배`),
      tag: 'placeValue',
      strategy: '자릿값의 관계 알기',
      hint: '왼쪽으로 한 자리 갈 때마다 나타내는 값이 10배가 돼요.',
      steps: [`두 숫자는 ${j - i}자리 떨어져 있습니다.`, `10을 ${j - i}번 곱하면 ${배}이므로 ${배}배입니다.`],
      misconceptionTip: '자리가 몇 칸 차이 나는지 세고, 그만큼 10을 곱해요.',
    };
  },
};

// ── 2단원 각도 ───────────────────────────────────────────────────────
/** 두 삼각자를 이어 붙이거나 겹쳐서 만들 수 없는 각 */
export const 삼각자각: G5Family = {
  id: 'set-squares',
  make: (seed) => {
    const next = 고르개(seed);
    const 가 = [30, 60, 90];
    const 나 = [45, 90];
    const 된다 = new Set<number>();
    for (const a of 가) for (const b of 나) {
      된다.add(a + b);
      if (a !== b) 된다.add(Math.abs(a - b));
    }
    const 되는것 = [...된다].filter((x) => x < 180);
    const 안되는것 = Array.from({ length: 34 }, (_, i) => (i + 1) * 5).filter((x) => !된다.has(x) && x % 15 !== 0);
    const 보기: number[] = [];
    while (보기.length < 3) {
      const x = 되는것[next(되는것.length)];
      if (!보기.includes(x)) 보기.push(x);
    }
    const 답 = 안되는것[next(안되는것.length)];
    return {
      prompt: '30°, 60°, 90°인 삼각자와 45°, 45°, 90°인 삼각자의 각을 하나씩 골라 이어 붙이거나 겹쳐서 만들 수 없는 각도는 어느 것일까요?',
      answer: `${답}°`,
      wrongs: 보기.map((x) => `${x}°`),
      tag: 'angle',
      strategy: '각도의 합과 차로 만들 수 있는 각 찾기',
      hint: '두 각을 이어 붙이면 합, 겹치면 차가 돼요.',
      steps: ['만들 수 있는 각은 두 각의 합이나 차입니다.', `${보기.map((x) => `${x}°`).join(', ')}은(는) 만들 수 있지만 ${답}°는 어떤 합이나 차로도 만들 수 없습니다.`],
      misconceptionTip: '이어 붙이는 것만 생각하지 말고 겹쳐서 빼는 것도 생각해요.',
    };
  },
};

/** 삼각형으로 나누어 다각형의 모든 각의 크기의 합 구하기 */
export const 다각형각합: G5Family = {
  id: 'polygon-angles',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 5, 8);
    const 이름 = ['', '', '', '삼', '사', '오', '육', '칠', '팔'][n];
    const v = (n - 2) * 180;
    return {
      prompt: `${이름}각형을 한 꼭짓점에서 그은 대각선으로 삼각형 여러 개로 나누었습니다. ${이름}각형의 모든 각의 크기의 합은 몇 도일까요?`,
      answer: `${v}°`,
      wrongs: [n * 180, (n - 1) * 180, 360 * (n - 3) || 180, v + 90].filter((x, i, xs) => x !== v && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}°`),
      tag: 'angle',
      strategy: '삼각형으로 나누어 각의 크기의 합 구하기',
      hint: '한 꼭짓점에서 대각선을 그으면 삼각형이 몇 개 생기는지 세어 보세요.',
      steps: [`${이름}각형은 삼각형 ${n - 2}개로 나누어집니다.`, `삼각형 한 개의 세 각의 합이 180°이므로 180°×${n - 2}=${v}°입니다.`],
      misconceptionTip: '사각형이 삼각형 2개(360°)인 것처럼, 변이 하나 늘 때마다 삼각형이 하나씩 늘어요.',
    };
  },
};

/** 실제 각도에 더 가깝게 어림한 모둠 */
export const 어림정확: G5Family = {
  id: 'estimate-closer',
  make: (seed) => {
    const next = 고르개(seed);
    const 실제 = 사이(next, 4, 34) * 5;
    const a = 실제 + [-20, -15, -10, 10, 15, 20][next(6)];
    const b = 실제 + [-10, -5, 5, 10][next(4)];
    if (Math.abs(실제 - a) === Math.abs(실제 - b) || a <= 0 || b <= 0 || a >= 180 || b >= 180) return null;
    const 가가까움 = Math.abs(실제 - a) < Math.abs(실제 - b);
    return {
      prompt: `각도기로 잰 각도는 ${실제}°입니다. 가 모둠은 약 ${a}°, 나 모둠은 약 ${b}°로 어림하였습니다. 더 가깝게 어림한 모둠은 어느 모둠일까요?`,
      answer: 가가까움 ? '가 모둠' : '나 모둠',
      wrongs: [가가까움 ? '나 모둠' : '가 모둠', '두 모둠이 같습니다', '알 수 없습니다'],
      tag: 'angle',
      strategy: '잰 각도와 어림한 각도의 차 견주기',
      hint: '잰 각도와 어림한 각도의 차가 작을수록 잘 어림한 것이에요.',
      steps: [`가 모둠: ${Math.abs(실제 - a)}° 차이, 나 모둠: ${Math.abs(실제 - b)}° 차이`, `차이가 작은 ${가가까움 ? '가' : '나'} 모둠이 더 가깝게 어림했습니다.`],
      minusIsOperator: true,
    };
  },
};

// ── 4단원 평면도형의 이동 ───────────────────────────────────────────
const 방향 = ['오른쪽', '왼쪽', '위쪽', '아래쪽'] as const;
const 반대 = { 오른쪽: '왼쪽', 왼쪽: '오른쪽', 위쪽: '아래쪽', 아래쪽: '위쪽' } as const;

export const 되돌아가기: G5Family = {
  id: 'move-back',
  make: (seed) => {
    const next = 고르개(seed);
    const 가로 = next(2) === 0 ? '오른쪽' : '왼쪽';
    const 세로 = next(2) === 0 ? '위쪽' : '아래쪽';
    const a = 사이(next, 2, 7);
    const b = 사이(next, 2, 7);
    if (a === b) return null;
    const 답 = `${반대[가로]}으로 ${a}칸, ${반대[세로]}으로 ${b}칸`;
    return {
      prompt: `점을 ${가로}으로 ${a}칸, ${세로}으로 ${b}칸 이동했습니다. 이동한 점을 처음 자리로 되돌리려면 어떻게 이동해야 할까요?`,
      answer: 답,
      wrongs: [`${가로}으로 ${a}칸, ${세로}으로 ${b}칸`, `${반대[가로]}으로 ${b}칸, ${반대[세로]}으로 ${a}칸`, `${가로}으로 ${a}칸, ${반대[세로]}으로 ${b}칸`],
      tag: 'shape',
      strategy: '이동을 거꾸로 생각하기',
      hint: '간 방향과 반대 방향으로, 간 칸 수만큼 돌아와요.',
      steps: [`${가로}으로 간 것은 ${반대[가로]}으로 ${a}칸, ${세로}으로 간 것은 ${반대[세로]}으로 ${b}칸 돌아오면 됩니다.`],
    };
  },
};

export const 여러번돌리기: G5Family = {
  id: 'rotate-many',
  make: (seed) => {
    const next = 고르개(seed);
    const 갈래 = next(2);
    if (갈래 === 0) {
      const k = 사이(next, 2, 7);
      const 합 = (90 * k) % 360;
      if (합 === 0) return null;
      return {
        prompt: `도형을 시계 방향으로 90°만큼 ${k}번 돌린 도형은 시계 방향으로 몇 도만큼 한 번 돌린 도형과 같을까요?`,
        answer: `${합}°`,
        wrongs: [90 * k, 360 - 합, (합 + 90) % 360 || 360].filter((x, i, xs) => x !== 합 && xs.indexOf(x) === i).map((x) => `${x}°`),
        tag: 'shape',
        strategy: '여러 번 돌린 것을 한 번으로 나타내기',
        hint: '360°만큼 돌리면 처음과 같아져요.',
        steps: [`90°×${k}=${90 * k}°입니다.`, 90 * k >= 360 ? `${90 * k}°에서 한 바퀴(360°)를 빼면 ${합}°입니다.` : `그러므로 ${합}°만큼 돌린 것과 같습니다.`],
        misconceptionTip: '한 바퀴(360°)를 돌면 처음 도형과 같아져요.',
        minusIsOperator: true,
      };
    }
    const d = [90, 180, 270][next(3)];
    const 반 = 360 - d;
    return {
      prompt: `도형을 시계 방향으로 ${d}°만큼 돌린 도형은 시계 반대 방향으로 몇 도만큼 돌린 도형과 같을까요?`,
      answer: `${반}°`,
      wrongs: [d, 90, 180, 270, 360].filter((x, i, xs) => x !== 반 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}°`),
      tag: 'shape',
      strategy: '돌리는 방향을 바꾸어 생각하기',
      hint: '두 방향으로 돌린 각도를 더하면 한 바퀴(360°)가 돼요.',
      steps: [`360°-${d}°=${반}°이므로 시계 반대 방향으로 ${반}°만큼 돌린 것과 같습니다.`],
      minusIsOperator: true,
    };
  },
};

// ── 6단원 규칙 찾기 ──────────────────────────────────────────────────
export const 몇째수: G5Family = {
  id: 'nth-term',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 30);
    const d = 사이(next, 2, 12);
    const n = 사이(next, 8, 20);
    const v = a + (n - 1) * d;
    return {
      prompt: `${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, …와 같은 규칙으로 수를 늘어놓을 때 ${n}째 수는 얼마일까요?`,
      answer: String(v),
      wrongs: [a + n * d, a + (n - 2) * d, n * d, v + 1].filter((x, i, xs) => x !== v && x > 0 && xs.indexOf(x) === i).slice(0, 3).map(String),
      tag: 'pattern',
      strategy: '규칙을 식으로 나타내어 멀리 있는 수 구하기',
      hint: `첫째 수에 ${d}을(를) 몇 번 더해야 ${n}째 수가 되는지 생각해 보세요.`,
      steps: [`${d}씩 커지는 규칙입니다.`, `${n}째 수는 첫째 수에 ${d}을(를) ${n - 1}번 더한 수이므로 ${a}+${d}×${n - 1}=${v}입니다.`],
      misconceptionTip: `${n}째 수는 ${d}을(를) ${n}번이 아니라 ${n - 1}번 더해요.`,
    };
  },
};

/** 계산하지 않고 등호의 양쪽을 같게 만들기: 46+29=45+□, 12×6=24×□ */
export const 등호보정 = (곱: boolean): G5Family => ({
  id: `equal-balance-${곱 ? 'mul' : 'add'}`,
  make: (seed) => {
    const next = 고르개(seed);
    if (!곱) {
      const a = 사이(next, 21, 89);
      const b = 사이(next, 11, 89);
      const k = 사이(next, 1, 9);
      const 빼기 = next(2) === 0;
      if (빼기) {
        // a-b=(a+k)-□ → □=b+k
        return {
          prompt: `계산하지 않고 □ 안에 알맞은 수를 구하면 얼마일까요? ${a}-${b}=${a + k}-□`,
          answer: String(b + k),
          wrongs: [b - k, b, a - b, b + 2 * k].filter((x, i, xs) => x > 0 && x !== b + k && xs.indexOf(x) === i).slice(0, 3).map(String),
          tag: 'pattern',
          strategy: '등호의 양쪽 크기를 같게 하는 규칙 찾기',
          hint: `빼어지는 수가 ${k}만큼 커졌어요. 차가 그대로이려면 빼는 수도 같은 만큼 커져야 해요.`,
          steps: [`${a}이(가) ${a + k}(으)로 ${k}만큼 커졌습니다.`, `차가 같으려면 빼는 수도 ${k}만큼 커져야 하므로 □=${b}+${k}=${b + k}입니다.`],
          misconceptionTip: '덧셈과 달리 뺄셈에서는 두 수를 같은 쪽으로 바꾸어야 차가 같아요.',
        };
      }
      // a+b=(a-k)+□ → □=b+k
      return {
        prompt: `계산하지 않고 □ 안에 알맞은 수를 구하면 얼마일까요? ${a}+${b}=${a - k}+□`,
        answer: String(b + k),
        wrongs: [b - k, b, a + b, b + 2 * k].filter((x, i, xs) => x > 0 && x !== b + k && xs.indexOf(x) === i).slice(0, 3).map(String),
        tag: 'pattern',
        strategy: '등호의 양쪽 크기를 같게 하는 규칙 찾기',
        hint: `한 수가 ${k}만큼 작아졌으니, 합이 같으려면 다른 수는 ${k}만큼 커져야 해요.`,
        steps: [`${a}이(가) ${a - k}(으)로 ${k}만큼 작아졌습니다.`, `□=${b}+${k}=${b + k}입니다.`],
        misconceptionTip: '양쪽을 모두 계산하지 않아도, 바뀐 만큼을 생각하면 □를 찾을 수 있어요.',
      };
    }
    const a = 사이(next, 2, 15);
    const b = 사이(next, 2, 9) * 2;
    const k = 2;
    return {
      prompt: `계산하지 않고 □ 안에 알맞은 수를 구하면 얼마일까요? ${a}×${b}=${a * k}×□`,
      answer: String(b / k),
      wrongs: [b * k, b, b - k, a].filter((x, i, xs) => x > 0 && x !== b / k && xs.indexOf(x) === i).slice(0, 3).map(String),
      tag: 'pattern',
      strategy: '곱의 크기가 같도록 두 수를 바꾸는 규칙 찾기',
      hint: '한 수가 2배가 되면, 곱이 같으려면 다른 수는 반으로 줄어야 해요.',
      steps: [`${a}이(가) ${a * k}(으)로 2배가 되었습니다.`, `□=${b}÷2=${b / k}입니다.`],
      misconceptionTip: '곱셈에서는 더하거나 빼서 맞추지 않고, 몇 배가 되었는지 생각해요.',
    };
  },
});

// ── 더 넓힌 생각 문항 ────────────────────────────────────────────────
//   · 시계 바늘이 이루는 각: 그림 없이 '숫자 몇 칸'으로 각을 견주고 재기
//   · 조건으로 정해지는 삼각형·사각형의 각(세 각이 같다, 두 각이 같다)
//   · 곱의 끝에 붙는 0의 개수(5×4=20처럼 0이 하나 더 생기는 경우)
//   · 만이 되려면 얼마가 더 있어야 하는지

/** 네 시각 가운데 두 바늘이 이루는 작은 쪽 각이 가장 큰(작은) 시각 */
export const 시계각비교: G5Family = {
  id: 'clock-angle-compare',
  make: (seed) => {
    const next = 고르개(seed);
    const 칸들: number[] = [];
    while (칸들.length < 4) {
      const c = 사이(next, 1, 5);
      if (!칸들.includes(c)) 칸들.push(c);
    }
    // 같은 칸 수라도 2시와 10시처럼 두 가지 시각이 있습니다.
    const 시들 = 칸들.map((c) => (next(2) === 0 ? c : 12 - c));
    const 큰 = next(2) === 0;
    const 목표 = 큰 ? Math.max(...칸들) : Math.min(...칸들);
    const k = 칸들.indexOf(목표);
    return {
      prompt: `${시들.map((h) => `${h}시`).join(', ')} 가운데 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각이 가장 ${큰 ? '큰' : '작은'} 시각은 언제일까요? (모두 정각입니다.)`,
      answer: `${시들[k]}시`,
      wrongs: 시들.filter((_, j) => j !== k).map((h) => `${h}시`),
      tag: 'angle',
      strategy: '두 바늘 사이의 숫자 칸 수로 각의 크기 견주기',
      hint: '긴바늘은 12를 가리켜요. 짧은바늘이 12에서 몇 칸 떨어져 있는지 세어 보세요(가까운 쪽으로).',
      steps: [`두 바늘 사이의 칸 수: ${시들.map((h, j) => `${h}시 ${칸들[j]}칸`).join(', ')}`, `칸 수가 가장 ${큰 ? '많은' : '적은'} ${시들[k]}시의 각이 가장 ${큰 ? '큽' : '작습'}니다.`],
      misconceptionTip: '10시는 10칸이 아니라 반대쪽으로 2칸이에요. 작은 쪽의 각을 봐요.',
    };
  },
};

/** h시 정각에 두 바늘이 이루는 작은 쪽의 각도 */
export const 시계각도: G5Family = {
  id: 'clock-angle-degree',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 11);
    if (h === 6) return null;
    const 칸 = Math.min(h, 12 - h);
    const v = 칸 * 30;
    return {
      prompt: `${h}시 정각일 때 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각도는 몇 도일까요?`,
      answer: `${v}°`,
      wrongs: [h * 30 === v ? (12 - h) * 30 : h * 30, v + 30, v - 30 || v + 60, h * 5, 칸 * 60].filter((x, i, xs) => x > 0 && x !== v && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}°`),
      tag: 'angle',
      strategy: '시계의 숫자 한 칸이 30°임을 이용하기',
      hint: '시계 한 바퀴는 360°이고 숫자가 12개 있으니 한 칸은 30°예요.',
      steps: ['360°÷12=30°이므로 숫자 한 칸은 30°입니다.', `${h}시에는 두 바늘 사이가 작은 쪽으로 ${칸}칸입니다.`, `30°×${칸}=${v}°`],
      misconceptionTip: '분을 세듯 5씩 세면 안 돼요. 숫자 한 칸은 30°예요.',
      visual: { kind: 'clock', label: `${h}시`, hour: h, minute: 0 },
    };
  },
};

/** 조건으로 정해지는 삼각형의 각 */
export const 삼각형조건각: G5Family = {
  id: 'triangle-condition',
  make: (seed) => {
    const next = 고르개(seed);
    const 갈래 = next(4);
    if (갈래 === 0) {
      return {
        prompt: '세 각의 크기가 모두 같은 삼각형이 있습니다. 한 각의 크기는 몇 도일까요?',
        answer: '60°',
        wrongs: ['90°', '45°', '120°'],
        tag: 'angle', strategy: '삼각형의 세 각의 합 180°를 똑같이 나누기',
        hint: '삼각형의 세 각의 크기의 합은 180°예요.', steps: ['180°÷3=60°'],
      };
    }
    if (갈래 === 1) {
      return {
        prompt: '한 각이 직각이고 나머지 두 각의 크기가 같은 삼각형이 있습니다. 크기가 같은 한 각은 몇 도일까요?',
        answer: '45°',
        wrongs: ['90°', '60°', '30°'],
        tag: 'angle', strategy: '삼각형의 세 각의 합에서 직각을 빼고 똑같이 나누기',
        hint: '180°에서 직각 90°를 빼면 남은 두 각의 합이에요.', steps: ['180°-90°=90°', '90°÷2=45°'],
        minusIsOperator: true,
      };
    }
    if (갈래 === 2) {
      const x = 사이(next, 2, 16) * 10;
      const v = (180 - x) / 2;
      return {
        prompt: `두 각의 크기가 같은 삼각형에서 나머지 한 각이 ${x}°입니다. 크기가 같은 한 각은 몇 도일까요?`,
        answer: `${v}°`,
        wrongs: [180 - x, x, (180 - x) / 3, v + 10].filter((y, i, xs) => Number.isInteger(y) && y > 0 && y !== v && xs.indexOf(y) === i).slice(0, 3).map((y) => `${y}°`),
        tag: 'angle', strategy: '세 각의 합에서 아는 각을 빼고 똑같이 나누기',
        hint: '크기가 같은 두 각의 합을 먼저 구해요.', steps: [`180°-${x}°=${180 - x}°`, `${180 - x}°÷2=${v}°`],
        misconceptionTip: '180°에서 빼고 끝내면 두 각의 합이에요. 한 각은 2로 나누어야 해요.',
        minusIsOperator: true,
      };
    }
    const a = 사이(next, 2, 9) * 10;
    const b = 사이(next, 2, 9) * 10;
    if (a + b >= 170) return null;
    const v = 180 - a - b;
    return {
      prompt: `삼각형 ㄱㄴㄷ에서 변 ㄴㄷ을 꼭짓점 ㄷ 쪽으로 늘였습니다. 각 ㄱㄴㄷ이 ${a}°, 각 ㄴㄱㄷ이 ${b}°일 때, 늘인 선과 변 ㄱㄷ이 이루는 바깥쪽의 각은 몇 도일까요?`,
      answer: `${a + b}°`,
      wrongs: [v, 180 - a, 180 - b, a + b + 10].filter((y, i, xs) => y > 0 && y !== a + b && xs.indexOf(y) === i).slice(0, 3).map((y) => `${y}°`),
      tag: 'angle', strategy: '삼각형의 세 각의 합과 직선이 이루는 각을 함께 쓰기',
      hint: '먼저 삼각형의 나머지 한 각을 구하고, 그 각과 바깥쪽 각을 더하면 180°예요.',
      steps: [`나머지 한 각: 180°-${a}°-${b}°=${v}°`, `바깥쪽 각: 180°-${v}°=${a + b}°`],
      misconceptionTip: '삼각형 안의 각과 바깥쪽 각을 헷갈리지 말아요.',
      minusIsOperator: true,
    };
  },
};

/** 조건으로 정해지는 사각형의 각 */
export const 사각형조건각: G5Family = {
  id: 'quad-condition',
  make: (seed) => {
    const next = 고르개(seed);
    if (next(2) === 0) {
      const x = 사이(next, 3, 15) * 10;
      const 나머지 = 360 - x;
      if (나머지 % 3 !== 0) return null;
      const v = 나머지 / 3;
      if (v >= 180) return null;
      return {
        prompt: `사각형의 네 각 가운데 세 각의 크기가 같고, 나머지 한 각은 ${x}°입니다. 크기가 같은 한 각은 몇 도일까요?`,
        answer: `${v}°`,
        wrongs: [나머지, (180 - x) / 3, 나머지 / 2, v + 10].filter((y, i, xs) => Number.isInteger(y) && y > 0 && y !== v && xs.indexOf(y) === i).slice(0, 3).map((y) => `${y}°`),
        tag: 'angle', strategy: '네 각의 합 360°에서 아는 각을 빼고 똑같이 나누기',
        hint: '사각형의 네 각의 크기의 합은 360°예요.', steps: [`360°-${x}°=${나머지}°`, `${나머지}°÷3=${v}°`],
        misconceptionTip: '사각형의 네 각의 합은 180°가 아니라 360°예요.',
        minusIsOperator: true,
      };
    }
    const a = 사이(next, 5, 12) * 10;
    const b = 사이(next, 5, 12) * 10;
    {
      const c = 사이(next, 6, 12) * 10;
      const v = 360 - a - b - c;
      if (v <= 0 || v >= 180) return null;
      return {
        prompt: `사각형 ㄱㄴㄷㄹ에서 각 ㄱ이 ${a}°, 각 ㄴ이 ${b}°, 각 ㄷ이 ${c}°입니다. 변 ㄷㄹ을 꼭짓점 ㄹ 쪽으로 늘였을 때, 늘인 선과 변 ㄱㄹ이 이루는 바깥쪽의 각은 몇 도일까요?`,
        answer: `${180 - v}°`,
        wrongs: [v, 360 - v, 180 - v + 10, 180 - v - 10].filter((y, i, xs) => y > 0 && y !== 180 - v && xs.indexOf(y) === i).slice(0, 3).map((y) => `${y}°`),
        tag: 'angle', strategy: '네 각의 합과 직선이 이루는 각을 함께 쓰기',
        hint: '먼저 사각형의 나머지 한 각을 구해요. 그 각과 바깥쪽 각을 더하면 180°예요.',
        steps: [`나머지 한 각: 360°-${a}°-${b}°-${c}°=${v}°`, `바깥쪽 각: 180°-${v}°=${180 - v}°`],
        minusIsOperator: true,
      };
    }
  },
};

/** 곱의 끝에 붙는 0의 개수 */
export const 끝0개수: G5Family = {
  id: 'trailing-zeros',
  make: (seed) => {
    const next = 고르개(seed);
    // 세 자리 수×몇십: 600×50, 250×40처럼 씁니다.
    const a = next(2) === 0 ? 사이(next, 1, 9) * 100 : (사이(next, 1, 9) * 10 + 5) * 10;
    const b = 사이(next, 2, 9) * 10;
    const 앞 = Number(String(a).replace(/0+$/, ''));
    const 곱 = a * b;
    const 영 = (String(곱).match(/0+$/) ?? [''])[0].length;
    const 단순 = (String(a).match(/0+$/) ?? [''])[0].length + 1;
    // 5×4, 2×5처럼 0이 하나 더 생기는 경우를 반쯤 섞습니다.
    if (next(2) === 0 && 영 === 단순) return null;
    return {
      prompt: `${a}×${b}을(를) 계산하면 곱의 끝에 0이 몇 개 있을까요?`,
      answer: `${영}개`,
      wrongs: [단순, 영 + 1, 영 - 1, 단순 + 1].filter((x, i, xs) => x > 0 && x !== 영 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}개`),
      tag: 'multiplication',
      strategy: '0을 뺀 수끼리 곱한 뒤 0의 개수 붙이기',
      hint: `0을 뺀 ${앞}×${b / 10}을(를) 먼저 계산해 보세요. 그 곱의 끝에도 0이 생길 수 있어요.`,
      steps: [`${a}×${b}=${곱}`, `곱의 끝에 0이 ${영}개 있습니다.`],
      misconceptionTip: '두 수의 0의 개수만 더하면 안 돼요. 5×4=20처럼 곱에서 0이 더 생길 수 있어요.',
    };
  },
};

/** 만이 되려면 얼마가 더 있어야 하는지 */
export const 만되려면: G5Family = {
  id: 'to-ten-thousand',
  make: (seed) => {
    const next = 고르개(seed);
    const 단위 = [1000, 100, 10][next(3)];
    const 모자람 = 사이(next, 1, 9) * 단위;
    const 있음 = 10000 - 모자람;
    const 단위말 = { 1000: '천 원짜리 지폐', 100: '백 원짜리 동전', 10: '십 원짜리 동전' }[단위]!;
    const v = 모자람 / 단위;
    return {
      prompt: `${있음}원이 있습니다. 10000원이 되려면 ${단위말}이(가) 몇 개 더 있어야 할까요?`,
      answer: `${v}개`,
      wrongs: [10 - v, v + 1, v * 10, v - 1].filter((x, i, xs) => x > 0 && x !== v && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x}개`),
      tag: 'placeValue',
      strategy: '10000이 되려면 얼마가 모자라는지 생각하기',
      hint: `${있음}에서 10000까지 얼마가 모자라는지 먼저 구해요.`,
      steps: [`10000-${있음}=${모자람}`, `${모자람}원은 ${단위말} ${v}개입니다.`],
      minusIsOperator: true,
    };
  },
};
