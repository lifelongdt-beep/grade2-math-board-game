import type { Difficulty, PartitionVisual, QuestionVisual } from '../../../types';
import type { G5Family, G5Spec } from '../../grade5/build';
import { eul, pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-1 6단원 분수와 소수 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입
//   2 하나를 똑같이 나누기        3 분수 ⑴        4 분수 ⑵
//   5 단위분수의 크기 비교        6 분모가 같은 분수의 크기 비교
//   7 소수 ⑴(지도서 7~8차시)      8 소수 ⑵        9 소수의 크기 비교
//
// 지도서가 못박은 것:
//   · 3학년 1학기 분수는 전체가 1인 연속량(띠·원·사각형)을 똑같이
//     나누는 것만 다룹니다. 사탕 12개의 1/3 같은 이산량은 3-2입니다.
//   · '똑같이 나누었다'는 조각의 모양과 크기가 같다는 뜻입니다. 모양은
//     달라도 넓이가 같은 조각(넓이 모델)은 넓이를 배운 뒤라 '틀렸다'고
//     하지도 않습니다. 그래서 '똑같이 나누지 않은' 그림은 조각의 크기가
//     눈에 띄게 다른 것만 씁니다.
//   · 진분수만 씁니다. 가분수·대분수는 3-2입니다. 전체를 다 칠한 그림
//     (4/4)도 내지 않습니다.
//   · 크기 비교는 단위분수끼리, 분모가 같은 분수끼리만 합니다. 분수를
//     비교할 때는 전체가 같아야 한다는 것을 문장에 적습니다
//     ('똑같은 가래떡', '크기가 같은 컵').
//   · 소수는 소수 한 자리 수만 씁니다(0.07 같은 수는 내지 않습니다).
//     학생에게 '대소수', '자연수 부분'이라고 하지 않고 '소수점 왼쪽
//     부분'이라고 합니다. L, kg은 3-2에서 배우므로 단위로 쓰지 않습니다.
//   · "0.1이 10개이면 0.10이라는 오개념이 생기지 않도록" — 0.1이 10개인
//     수는 1입니다.
//   · 소수점 아래 숫자는 자릿값 없이 숫자만 읽습니다(2.4 → 이 점 사).
// 글은 조사를 '을(를)'처럼 적고, 문항을 만들 때 앞말에 맞춥니다.
// ════════════════════════════════════════════════════════════════════

type Fig = PartitionVisual['figures'][number];

const 분수 = (n: number, d: number) => `${n}/${d}`;
/** 0.1이 tenths개인 수를 씁니다. 10개씩이면 자연수로 씁니다. */
export const 소수 = (tenths: number) =>
  tenths % 10 === 0 ? `${tenths / 10}` : `${Math.floor(tenths / 10)}.${tenths % 10}`;
const 숫자말 = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const 수말 = (n: number): string => {
  if (n < 10) return 숫자말[n];
  const 십 = Math.floor(n / 10);
  const 일 = n % 10;
  return `${십 === 1 ? '' : 숫자말[십]}십${일 ? 숫자말[일] : ''}`;
};
export const 소수읽기 = (tenths: number) => `${수말(Math.floor(tenths / 10))} 점 ${숫자말[tenths % 10]}`;
const 몇으로 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

const shuffleWith = <T,>(items: T[], next: (n: number) => number): T[] => {
  const out = [...items];
  for (let k = out.length - 1; k > 0; k -= 1) {
    const j = next(k + 1);
    [out[k], out[j]] = [out[j], out[k]];
  }
  return out;
};

/** 0부터 n-1 가운데 k개를 고릅니다. 칠한 칸이 떨어져 있어도 셀 수 있어야 합니다. */
const 칠할칸 = (n: number, k: number, next: (n: number) => number, 붙여서 = false) => {
  if (붙여서) {
    const start = next(n);
    return Array.from({ length: k }, (_, at) => (start + at) % n);
  }
  return shuffleWith(Array.from({ length: n }, (_, at) => at), next).slice(0, k);
};

/** 똑같이 n으로 나눈 그림입니다. n에 맞는 모양 가운데 하나를 고릅니다. */
const 똑같이 = (n: number, shaded: number[], next: (n: number) => number, name?: string): Fig => {
  const grids: Record<number, [number, number]> = { 4: [2, 2], 6: [2, 3], 8: [2, 4], 9: [3, 3], 10: [2, 5] };
  const shapes: Array<Fig['shape']> = ['bar'];
  if (n <= 8) shapes.push('circle');
  if (grids[n]) shapes.push('grid');
  if (n === 4) shapes.push('diag');
  const shape = shapes[next(shapes.length)];
  const base = name ? { name } : {};
  if (shape === 'grid') return { ...base, shape, rows: grids[n][0], columns: grids[n][1], shaded };
  if (shape === 'diag') return { ...base, shape, shaded };
  return { ...base, shape, parts: n, shaded };
};

/**
 * 조각의 크기가 눈에 띄게 다른 그림입니다. 가장 작은 조각과 가장 큰
 * 조각이 두 배 넘게 차이 나게 잡습니다 — 아이가 보고 '다르다'고 할 수
 * 있어야 합니다.
 */
const 다르게 = (n: number, shaded: number[], next: (n: number) => number, name?: string): Fig => {
  const weights = shuffleWith(Array.from({ length: n }, (_, at) => at + (n <= 3 ? 1 : 2)), next);
  const total = weights.reduce((sum, one) => sum + one, 0);
  const cuts: number[] = [];
  let run = 0;
  for (const one of weights.slice(0, -1)) {
    run += one;
    cuts.push(run / total);
  }
  const shape: Fig['shape'] = n <= 6 && next(3) !== 0 ? 'circle' : 'bar';
  return { ...(name ? { name } : {}), shape, cuts, shaded };
};

const 그림 = (label: string, figures: Fig[]): QuestionVisual => ({ kind: 'partition', label, figures });

const 이름표 = ['가', '나', '다', '라'];

// ── 1차시: 단원 도입 ────────────────────────────────────────────────
const 도입문항: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = rand(seed);
    const 갈래 = next(3);
    if (갈래 === 0) {
      const cm = 1 + next(9);
      const mm = 1 + next(9);
      return {
        prompt: `${cm} cm ${mm} mm는 몇 mm일까요?`,
        answer: `${cm * 10 + mm} mm`,
        wrongs: [`${cm + mm} mm`, `${cm * 100 + mm} mm`, `${cm * 10 + mm + 10} mm`, `${mm * 10 + cm} mm`],
        tag: 'measurement',
        concept: '1 cm=10 mm입니다.',
        strategy: 'cm와 mm의 관계 떠올리기',
        hint: '1 cm는 몇 mm인지 떠올려 보세요. cm를 mm로 바꾼 다음 남은 mm를 더하세요.',
        steps: [`${cm} cm=${cm * 10} mm입니다.`, `${cm * 10}+${mm}=${cm * 10 + mm}이므로 ${cm * 10 + mm} mm입니다.`],
        misconceptionTip: '1 cm는 100 mm가 아니라 10 mm입니다.',
      };
    }
    if (갈래 === 1) {
      const mm = 11 + next(88);
      if (mm % 10 === 0) return null;
      const cm = Math.floor(mm / 10);
      return {
        prompt: `${mm} mm는 몇 cm 몇 mm일까요?`,
        answer: `${cm} cm ${mm % 10} mm`,
        wrongs: [`${mm % 10} cm ${cm} mm`, `${cm + 1} cm ${mm % 10} mm`, `${mm} cm ${mm % 10} mm`, `${cm} cm ${mm} mm`],
        tag: 'measurement',
        concept: '10 mm=1 cm입니다.',
        strategy: 'mm를 cm와 mm로 나타내기',
        hint: `${mm} mm 안에 10 mm가 몇 번 들어 있는지 생각해 보세요.`,
        steps: [`${mm} mm=${cm * 10} mm+${mm % 10} mm입니다.`, `${cm * 10} mm=${cm} cm이므로 ${cm} cm ${mm % 10} mm입니다.`],
        misconceptionTip: '10 mm가 1 cm입니다. 앞자리와 뒷자리를 바꾸어 쓰지 않도록 하세요.',
      };
    }
    const 조각 = 3 + next(6);
    const 먹은 = 1 + next(조각 - 2);
    const 음식 = pick(['피자', '팬케이크', '케이크', '부침개'], seed);
    return {
      prompt: `${음식} 한 판을 똑같이 ${조각}조각으로 나누어 ${먹은}조각을 먹었습니다. 남은 것은 몇 조각일까요?`,
      answer: `${조각 - 먹은}조각`,
      wrongs: [`${먹은}조각`, `${조각}조각`, `${조각 + 먹은}조각`, `${조각 - 먹은 + 1}조각`],
      tag: 'fraction',
      concept: '전체를 똑같이 나눈 조각 가운데 일부를 먹으면 나머지 조각이 남습니다.',
      strategy: '전체 조각과 먹은 조각 구별하기',
      hint: `전체는 ${조각}조각입니다. 그중 먹은 조각을 빼 보세요.`,
      steps: [`전체 ${조각}조각에서 ${먹은}조각을 먹었습니다.`, `${조각}-${먹은}=${조각 - 먹은}이므로 남은 것은 ${조각 - 먹은}조각입니다.`],
      misconceptionTip: '먹은 조각 수와 남은 조각 수를 헷갈리지 마세요.',
      visual: 그림(`${eul(음식)} 똑같이 ${조각}조각으로 나눈 그림. 칠한 곳이 먹은 조각`, [{ shape: 'circle', parts: 조각, shaded: Array.from({ length: 먹은 }, (_, at) => at) }]),
    };
  },
};

// ── 2차시: 하나를 똑같이 나누기 ─────────────────────────────────────
const 똑같이찾기문항: G5Family = {
  id: 'find-equal',
  make: (seed) => {
    const next = rand(seed + 1);
    const n = 2 + next(3);
    const 다른수 = n === 4 ? 3 : n + 1 + next(2);
    const 정답자리 = next(4);
    const 나머지: Array<(name: string) => Fig> = shuffleWith([
      (name: string) => 다르게(n, [], next, name),
      (name: string) => 다르게(n, [], next, name),
      (name: string) => 똑같이(다른수, [], next, name),
    ], next);
    const figures: Fig[] = [];
    for (let at = 0; at < 4; at += 1) {
      figures.push(at === 정답자리 ? 똑같이(n, [], next, 이름표[at]) : 나머지.shift()!(이름표[at]));
    }
    const 다른자리 = figures.findIndex((one) => !one.cuts && one.name !== 이름표[정답자리]);
    return {
      prompt: `똑같이 ${몇으로[n]}(으)로 나누어진 도형은 어느 것일까요?`,
      answer: 이름표[정답자리],
      wrongs: 이름표.filter((_, at) => at !== 정답자리),
      tag: 'fraction',
      concept: '똑같이 나누면 나누어진 조각들의 모양과 크기가 모두 같습니다.',
      strategy: '조각의 수와 크기 함께 보기',
      hint: `먼저 조각이 ${n}개인 도형을 찾고, 그 조각들의 모양과 크기가 모두 같은지 보세요.`,
      steps: [
        `${이름표[정답자리]}은(는) 모양과 크기가 같은 조각 ${n}개로 나누어져 있습니다.`,
        ...(다른자리 >= 0 ? [`${이름표[다른자리]}도 똑같이 나누어졌지만 조각이 ${다른수}개입니다.`] : []),
        `나머지는 조각의 크기가 서로 다릅니다. 그러므로 답은 ${이름표[정답자리]}입니다.`,
      ],
      misconceptionTip: '조각의 수만 세면 안 됩니다. 크기가 다른 조각으로 나눈 것은 똑같이 나눈 것이 아닙니다.',
      visual: 그림('도형 가, 나, 다, 라', figures),
    };
  },
};

const 똑같이판단문항: G5Family = {
  id: 'judge-equal',
  make: (seed) => {
    const next = rand(seed + 2);
    const n = 2 + next(4);
    const 같다 = next(2) === 0;
    const fig = 같다 ? 똑같이(n, [], next) : 다르게(n, [], next);
    const 옳음 = 같다
      ? `똑같이 나누어졌습니다. 조각 ${n}개의 모양과 크기가 같습니다.`
      : '똑같이 나누어지지 않았습니다. 조각의 크기가 서로 다릅니다.';
    return {
      prompt: `도형을 ${n}조각으로 나누었습니다. 바르게 말한 것은 어느 것일까요?`,
      answer: 옳음,
      wrongs: 같다
        ? ['똑같이 나누어지지 않았습니다. 조각의 크기가 서로 다릅니다.', `똑같이 나누어지지 않았습니다. 조각이 ${n + 1}개여야 합니다.`, '조각의 수만 보고는 알 수 없으니 똑같이 나눈 것입니다.']
        : [`똑같이 나누어졌습니다. 조각 ${n}개의 모양과 크기가 같습니다.`, `똑같이 나누어졌습니다. 조각이 ${n}개이기 때문입니다.`, '똑같이 나누어졌습니다. 선을 곧게 그었기 때문입니다.'],
      tag: 'fraction',
      concept: '똑같이 나누어졌는지는 조각의 모양과 크기가 같은지로 알 수 있습니다. 조각을 오려 겹쳐 보면 남김없이 겹쳐집니다.',
      strategy: '조각을 겹쳐 본다고 생각하기',
      hint: '조각을 오려서 서로 겹쳐 본다고 생각해 보세요. 남김없이 꼭 겹쳐지나요?',
      steps: 같다
        ? [`조각 ${n}개를 겹쳐 보면 꼭 맞게 겹쳐집니다.`, '모양과 크기가 같으므로 똑같이 나누어졌습니다.']
        : ['조각을 겹쳐 보면 큰 조각과 작은 조각이 있어 꼭 맞게 겹쳐지지 않습니다.', '크기가 다르므로 똑같이 나누어지지 않았습니다.'],
      misconceptionTip: '조각의 수가 맞아도 크기가 다르면 똑같이 나눈 것이 아닙니다.',
      visual: 그림(`${n}조각으로 나눈 도형`, [fig]),
    };
  },
};

const 조각세기문항: G5Family = {
  id: 'count-parts',
  make: (seed) => {
    const next = rand(seed + 3);
    const n = 2 + next(9);
    const fig = 똑같이(n, [], next);
    return {
      prompt: '도형은 똑같이 몇 조각으로 나누어졌을까요?',
      answer: `${n}조각`,
      wrongs: [`${n - 1}조각`, `${n + 1}조각`, `${n + 2}조각`, `${n * 2}조각`].filter((one) => one !== '1조각'),
      tag: 'fraction',
      concept: '똑같이 나눈 조각의 수를 세면 전체를 몇으로 나누었는지 알 수 있습니다.',
      strategy: '조각을 빠뜨리지 않고 세기',
      hint: '한 조각부터 차례로 표시하며 세어 보세요. 나누는 선의 수가 아니라 조각의 수를 셉니다.',
      steps: [`조각을 하나씩 세면 ${n}개입니다.`, `조각의 모양과 크기가 같으므로 똑같이 ${n}조각으로 나누어졌습니다.`],
      misconceptionTip: '나누는 선의 수를 세면 조각의 수와 다를 수 있습니다. 조각을 세세요.',
      visual: 그림('똑같이 나눈 도형', [fig]),
    };
  },
};

const 똑같이뜻문항: G5Family = {
  id: 'equal-meaning',
  make: (seed) => {
    const next = rand(seed + 4);
    const 묻기 = next(2);
    if (묻기 === 0) {
      return {
        prompt: '도형이 똑같이 나누어졌는지 알아보는 방법으로 알맞은 것은 어느 것일까요?',
        answer: '나눈 조각을 겹쳐 보아 모양과 크기가 같은지 봅니다.',
        wrongs: ['나눈 조각의 수가 짝수인지 봅니다.', '나누는 선이 곧은 선인지 봅니다.', '나눈 조각의 색깔이 같은지 봅니다.'],
        tag: 'fraction',
        concept: '똑같이 나누면 조각들의 모양과 크기가 같습니다.',
        strategy: '똑같이 나눈 것의 뜻 떠올리기',
        hint: '종이를 반으로 접었을 때 두 쪽이 어떻게 되는지 떠올려 보세요.',
        steps: ['똑같이 나눈 조각은 겹쳐 보면 남김없이 꼭 겹쳐집니다.', '그러므로 조각의 모양과 크기가 같은지 봅니다.'],
        misconceptionTip: '선을 곧게 긋거나 조각 수를 맞추어도 크기가 다르면 똑같이 나눈 것이 아닙니다.',
      };
    }
    const n = pick([2, 4], seed);
    return {
      prompt: `정사각형 모양 색종이를 접어서 똑같이 ${몇으로[n]}(으)로 나누려고 합니다. 알맞은 방법은 어느 것일까요?`,
      answer: n === 2 ? '마주 보는 변이 꼭 맞게 반으로 한 번 접습니다.' : '마주 보는 변이 꼭 맞게 반으로 접고, 한 번 더 반으로 접습니다.',
      wrongs: n === 2
        ? ['아무 곳이나 한 번 접습니다.', '한쪽 끝을 조금만 접습니다.', '반으로 접고, 한 번 더 반으로 접습니다.']
        : ['아무 곳이나 세 번 접습니다.', '반으로 한 번 접습니다.', '한쪽 끝을 조금씩 네 번 접습니다.'],
      tag: 'fraction',
      concept: '반으로 접으면 똑같이 둘로, 반으로 접은 것을 다시 반으로 접으면 똑같이 넷으로 나누어집니다.',
      strategy: '접어서 똑같이 나누기',
      hint: '반으로 한 번 접으면 몇 조각이 되는지, 한 번 더 반으로 접으면 몇 조각이 되는지 생각해 보세요.',
      steps: n === 2
        ? ['마주 보는 변이 꼭 맞게 반으로 접으면 두 쪽이 꼭 겹칩니다.', '그러므로 똑같이 둘로 나누어집니다.']
        : ['반으로 접으면 똑같이 둘로 나누어집니다.', '그것을 한 번 더 반으로 접으면 똑같이 넷으로 나누어집니다.'],
      misconceptionTip: '접는 횟수만큼 조각이 생기는 것이 아닙니다. 반으로 두 번 접으면 넷이 됩니다.',
    };
  },
};

// ── 3차시: 분수 ⑴ ───────────────────────────────────────────────────
/** 색칠한 부분을 분수로 나타낼 때 아이들이 흔히 쓰는 틀린 답입니다(지도서 학생 반응). */
const 분수오답 = (k: number, n: number) => {
  const out = [
    k > 1 ? 분수(n, k) : null, // 분자와 분모의 자리를 바꾸어 씀
    분수(n - k, n), // 색칠하지 않은 부분
    n - k > 1 ? 분수(k, n - k) : null, // 색칠한 조각과 칠하지 않은 조각을 견줌
    분수(k, n + 1),
    k + 1 < n ? 분수(k + 1, n) : 분수(k - 1 || 1, n),
  ];
  return out.filter((one): one is string => one !== null);
};

const 색칠분수문항 = (그림만: boolean): G5Family => ({
  id: `shaded-fraction-${그림만 ? 'plain' : 'say'}`,
  make: (seed) => {
    const next = rand(seed + 5);
    const n = 2 + next(9);
    const k = 1 + next(n - 1);
    const fig = 똑같이(n, 칠할칸(n, k, next, next(2) === 0), next);
    return {
      prompt: 그림만
        ? '색칠한 부분은 전체의 얼마일까요?'
        : '색칠한 부분은 전체를 똑같이 몇으로 나눈 것 중의 몇일까요?',
      answer: 그림만 ? 분수(k, n) : `똑같이 ${n}(으)로 나눈 것 중의 ${k}`,
      wrongs: 그림만
        ? 분수오답(k, n)
        : [k > 1 ? `똑같이 ${k}(으)로 나눈 것 중의 ${n}` : null, `똑같이 ${n}(으)로 나눈 것 중의 ${n - k}`, `똑같이 ${n + 1}(으)로 나눈 것 중의 ${k}`, `똑같이 ${n}(으)로 나눈 것 중의 ${k === 1 ? 2 : k - 1}`].filter((one): one is string => one !== null && one !== `똑같이 ${n}(으)로 나눈 것 중의 ${k}`),
      tag: 'fraction',
      concept: `전체를 똑같이 ${n}(으)로 나눈 것 중의 ${k}을(를) ${분수(k, n)}(이)라 쓰고 ${n}분의 ${k}(이)라고 읽습니다.`,
      strategy: '전체 조각 수와 색칠한 조각 수 세기',
      hint: '먼저 전체가 똑같이 몇 조각인지 세어 보세요. 그다음 색칠한 조각을 세어 보세요.',
      steps: [
        `전체는 똑같이 ${n}조각으로 나누어져 있습니다.`,
        `색칠한 조각은 ${k}개입니다.`,
        그림만 ? `전체를 똑같이 ${n}(으)로 나눈 것 중의 ${k}이므로 ${분수(k, n)}입니다.` : `그러므로 똑같이 ${n}(으)로 나눈 것 중의 ${k}입니다.`,
      ],
      misconceptionTip: '분모에는 전체 조각 수를, 분자에는 색칠한 조각 수를 씁니다. 색칠하지 않은 조각 수를 분모에 쓰면 안 됩니다.',
      visual: 그림('똑같이 나누어 일부를 색칠한 도형', [fig]),
    };
  },
});

const 분수읽기문항: G5Family = {
  id: 'read-fraction',
  make: (seed) => {
    const next = rand(seed + 6);
    const n = 3 + next(7);
    const k = 1 + next(n - 1);
    if (k === n - k) return null;
    if (next(2) === 0) {
      return {
        prompt: `${분수(k, n)}을(를) 바르게 읽은 것은 어느 것일까요?`,
        answer: `${n}분의 ${k}`,
        wrongs: [`${k}분의 ${n}`, `${n}분의 ${n - k}`, `${n + k}분의 ${k}`, `${k}의 ${n}분`],
        tag: 'fraction',
        concept: '분수는 분모를 먼저 읽고 분자를 나중에 읽습니다. 2/3는 3분의 2라고 읽습니다.',
        strategy: '분모부터 읽기',
        hint: '가로선 아래의 수(분모)를 먼저 읽고 ‘분의’를 붙인 다음, 가로선 위의 수(분자)를 읽으세요.',
        steps: [`${분수(k, n)}에서 분모는 ${n}, 분자는 ${k}입니다.`, `분모를 먼저 읽으므로 ${n}분의 ${k}(이)라고 읽습니다.`],
        misconceptionTip: '위에 있는 수부터 읽으면 안 됩니다. 분모(아래)를 먼저 읽습니다.',
      };
    }
    return {
      prompt: `${n}분의 ${k}을(를) 분수로 바르게 쓴 것은 어느 것일까요?`,
      answer: 분수(k, n),
      wrongs: [k > 1 ? 분수(n, k) : null, 분수(n - k, n), 분수(k, n + k), 분수(k, n - 1)].filter((one): one is string => one !== null && one !== 분수(k, 1)),
      tag: 'fraction',
      concept: '■분의 ▲는 ▲/■로 씁니다. 분모 ■는 가로선 아래에, 분자 ▲는 가로선 위에 씁니다.',
      strategy: '분모와 분자의 자리 확인하기',
      hint: `‘${n}분의’에서 ${n}이(가) 분모입니다. 분모는 가로선 아래에 씁니다.`,
      steps: [`${n}분의 ${k}에서 분모는 ${n}, 분자는 ${k}입니다.`, `분모를 아래에, 분자를 위에 쓰면 ${분수(k, n)}입니다.`],
      misconceptionTip: '읽을 때 먼저 나오는 수가 분모입니다. 분모를 위에 쓰면 안 됩니다.',
    };
  },
};

const 분모분자문항: G5Family = {
  id: 'numer-denom',
  make: (seed) => {
    const next = rand(seed + 7);
    const n = 3 + next(7);
    const k = 1 + next(n - 1);
    const 갈래 = next(3);
    if (갈래 === 2) {
      return {
        prompt: `분모가 ${n}, 분자가 ${k}인 분수는 어느 것일까요?`,
        answer: 분수(k, n),
        wrongs: [k > 1 ? 분수(n, k) : null, 분수(k, n + k), 분수(n - k, n), 분수(k + 1 < n ? k + 1 : k - 1, n)].filter((one): one is string => one !== null && !one.endsWith('/1') && one !== 분수(0, n)),
        tag: 'fraction',
        concept: '분수에서 가로선 아래에 있는 수를 분모, 위에 있는 수를 분자라고 합니다.',
        strategy: '분모와 분자의 자리 알기',
        hint: '분모는 가로선 아래, 분자는 가로선 위에 씁니다.',
        steps: [`분모 ${n}을(를) 가로선 아래에, 분자 ${k}을(를) 가로선 위에 씁니다.`, `그러므로 ${분수(k, n)}입니다.`],
        misconceptionTip: '분모와 분자의 자리를 바꾸어 쓰지 않도록 하세요.',
      };
    }
    const 분모를 = 갈래 === 0;
    const 답 = 분모를 ? n : k;
    return {
      prompt: `분수 ${분수(k, n)}에서 ${분모를 ? '분모' : '분자'}는 얼마일까요?`,
      answer: `${답}`,
      wrongs: [`${분모를 ? k : n}`, `${n + k}`, `${n - k}`, `${답 + 1}`].filter((one) => one !== '0'),
      tag: 'fraction',
      concept: '분수에서 가로선 아래에 있는 수를 분모, 위에 있는 수를 분자라고 합니다. 분모는 전체를 똑같이 나눈 수, 분자는 그중의 몇입니다.',
      strategy: '분모와 분자의 자리 알기',
      hint: '분모는 가로선 아래(전체를 나눈 수), 분자는 가로선 위(그중의 몇)에 있습니다.',
      steps: [`${분수(k, n)}에서 가로선 아래의 수는 ${n}, 위의 수는 ${k}입니다.`, `그러므로 ${분모를 ? '분모' : '분자'}는 ${답}입니다.`],
      misconceptionTip: '‘분모’는 아래, ‘분자’는 위입니다. 자리를 헷갈리지 마세요.',
    };
  },
};

// ── 4차시: 분수 ⑵ ───────────────────────────────────────────────────
const 남은부분문항 = (그림있음: boolean): G5Family => ({
  id: `left-part-${그림있음 ? 'pic' : 'word'}`,
  make: (seed) => {
    const next = rand(seed + 8);
    const n = 3 + next(6);
    const k = 1 + next(n - 1);
    const 음식 = pick(['백설기', '초콜릿', '김밥', '가래떡', '와플'], seed);
    const 남은 = n - k;
    const 묻는것 = next(3) === 0 ? '먹은' : '남은';
    const 답분자 = 묻는것 === '먹은' ? k : 남은;
    const 남분자 = 묻는것 === '먹은' ? 남은 : k;
    return {
      prompt: 그림있음
        ? `${음식} 하나를 똑같이 ${n}조각으로 나누어 색칠한 조각만큼 먹었습니다. ${묻는것} 부분은 전체의 얼마일까요?`
        : `${음식} 하나를 똑같이 ${n}조각으로 나누어 ${k}조각을 먹었습니다. ${묻는것} 부분은 전체의 얼마일까요?`,
      answer: 분수(답분자, n),
      wrongs: [분수(남분자, n), 남분자 > 0 && 답분자 !== 남분자 ? 분수(답분자, 남분자) : null, 답분자 > 1 ? 분수(n, 답분자) : null, 분수(답분자, n + 1), 분수(답분자, k)].filter((one): one is string => one !== null && !one.endsWith('/1')),
      tag: 'fraction',
      concept: '전체를 똑같이 나눈 조각 수가 분모입니다. 먹은 부분과 남은 부분의 분자를 더하면 분모와 같습니다.',
      strategy: '먹은 부분과 남은 부분 나누어 보기',
      hint: `전체는 ${n}조각입니다. ${묻는것} 조각이 몇 개인지 세어 분자에 쓰세요.`,
      steps: [
        `전체 ${n}조각 가운데 ${k}조각을 먹었으므로 남은 것은 ${n}-${k}=${남은}(조각)입니다.`,
        `${묻는것} 부분은 전체를 똑같이 ${n}(으)로 나눈 것 중의 ${답분자}이므로 ${분수(답분자, n)}입니다.`,
      ],
      misconceptionTip: '분모는 남은 조각 수가 아니라 전체 조각 수입니다.',
      ...(그림있음
        ? { visual: 그림(`${eul(음식)} 똑같이 ${n}조각으로 나눈 그림. 칠한 곳이 먹은 부분`, [{ shape: 'bar' as const, parts: n, shaded: Array.from({ length: k }, (_, at) => at) }]) }
        : {}),
    };
  },
});

const 먹고남은문항: G5Family = {
  id: 'eaten-to-left',
  make: (seed) => {
    const next = rand(seed + 9);
    const n = 3 + next(7);
    const k = 1 + next(n - 1);
    const 음식 = pick(['백설기', '피자', '케이크', '빵'], seed);
    return {
      prompt: `${음식} 한 개를 똑같이 나누어 전체의 ${분수(k, n)}만큼 먹었습니다. 남은 부분은 전체의 얼마일까요?`,
      answer: 분수(n - k, n),
      wrongs: [분수(k, n), n - k > 1 ? 분수(n, n - k) : null, 분수(n - k, k), 분수(n - k, n + k), n - k > 1 ? 분수(n - k - 1, n) : 분수(2, n)].filter((one): one is string => one !== null && !one.endsWith('/1') && one !== 분수(n - k, n) && !one.startsWith('0/')),
      tag: 'fraction',
      concept: `${분수(k, n)}은(는) 전체를 똑같이 ${n}(으)로 나눈 것 중의 ${k}입니다. 남은 것은 ${n}조각 가운데 나머지 조각입니다.`,
      strategy: '분수를 조각으로 바꾸어 생각하기',
      hint: `${분수(k, n)}만큼 먹었다는 것은 똑같이 ${n}조각으로 나눈 것 중 ${k}조각을 먹었다는 뜻입니다. 남은 조각은 몇 개일까요?`,
      steps: [`전체를 똑같이 ${n}조각으로 나눈 것 중 ${k}조각을 먹었습니다.`, `남은 것은 ${n}-${k}=${n - k}(조각)이므로 전체의 ${분수(n - k, n)}입니다.`],
      misconceptionTip: '남은 부분도 분모는 그대로 전체 조각 수입니다.',
      selfCheck: `먹은 ${k}조각과 남은 ${n - k}조각을 더하면 전체 ${n}조각이 되나요?`,
    };
  },
};

const 분수만큼고르기문항: G5Family = {
  id: 'pick-shading',
  make: (seed) => {
    const next = rand(seed + 10);
    const n = 3 + next(4);
    const k = 1 + next(n - 1);
    if (k * 2 === n) return null;
    // 틀린 그림: 칠하지 않은 칸 수만큼 칠함 / 조각 크기가 다름 / 분모가 다른 수
    const 다른분모 = n + 2;
    if (k * 다른분모 === n * k) return null;
    const 정답자리 = next(4);
    const makers: Array<(name: string) => Fig> = shuffleWith([
      (name: string) => 똑같이(n, 칠할칸(n, n - k, next), next, name),
      (name: string) => 다르게(n, 칠할칸(n, k, next), next, name),
      (name: string) => 똑같이(다른분모, 칠할칸(다른분모, k, next), next, name),
    ], next);
    const figures: Fig[] = [];
    for (let at = 0; at < 4; at += 1) {
      figures.push(at === 정답자리 ? 똑같이(n, 칠할칸(n, k, next), next, 이름표[at]) : makers.shift()!(이름표[at]));
    }
    return {
      prompt: `${분수(k, n)}만큼 색칠한 것은 어느 것일까요?`,
      answer: 이름표[정답자리],
      wrongs: 이름표.filter((_, at) => at !== 정답자리),
      tag: 'fraction',
      concept: `${분수(k, n)}은(는) 전체를 똑같이 ${n}(으)로 나눈 것 중의 ${k}입니다.`,
      strategy: '분모와 똑같이 나눈 조각 수 맞추어 보기',
      hint: `똑같이 ${n}조각으로 나누어진 그림을 먼저 찾고, 그중 색칠한 조각이 ${k}개인지 세어 보세요.`,
      steps: [
        `${분수(k, n)}이(가) 되려면 모양과 크기가 같은 조각 ${n}개 가운데 ${k}개를 색칠해야 합니다.`,
        `${이름표[정답자리]}은(는) 똑같이 ${n}조각으로 나누어 ${k}조각을 색칠했습니다. 그러므로 답은 ${이름표[정답자리]}입니다.`,
      ],
      misconceptionTip: '색칠한 조각 수만 맞으면 안 됩니다. 전체가 똑같이 나누어졌는지, 몇 조각인지도 맞아야 합니다.',
      visual: 그림('색칠한 도형 가, 나, 다, 라', figures),
    };
  },
};

const 부분보고전체문항: G5Family = {
  id: 'part-to-whole',
  make: (seed) => {
    const next = rand(seed + 11);
    const n = 3 + next(7);
    const k = 1 + next(Math.min(4, n - 1));
    const 단위 = k === 1;
    return {
      prompt: 단위
        ? `색칠한 조각 1개는 전체의 ${분수(1, n)}입니다. 전체는 이 조각과 똑같은 조각 몇 개로 이루어져 있을까요?`
        : `색칠한 ${k}칸은 전체의 ${분수(k, n)}입니다. 전체는 이 칸과 똑같은 칸 몇 칸으로 이루어져 있을까요?`,
      answer: 단위 ? `${n}개` : `${n}칸`,
      wrongs: (단위 ? [`${n + 1}개`, `${n - 1}개`, `${n * 2}개`, `${n + 2}개`] : [`${k}칸`, `${n - k}칸`, `${n + k}칸`, `${n * k}칸`]).filter((one) => !/^1(개|칸)$/.test(one) && one !== `${n}칸`),
      tag: 'fraction',
      concept: '분모는 전체를 똑같이 나눈 조각 수입니다. 그래서 분모를 보면 전체가 똑같은 조각 몇 개인지 알 수 있습니다.',
      strategy: '분모로 전체 조각 수 알기',
      hint: `${분수(k, n)}에서 분모 ${n}은(는) 무엇을 나타내나요?`,
      steps: [
        `${분수(k, n)}은(는) 전체를 똑같이 ${n}(으)로 나눈 것 중의 ${k}입니다.`,
        `그러므로 전체는 똑같은 ${단위 ? '조각' : '칸'} ${n}${단위 ? '개' : '칸'}입니다.`,
      ],
      misconceptionTip: '색칠한 조각이 전체가 아닙니다. 분모만큼 있어야 전체가 됩니다.',
      visual: 그림(`색칠한 ${단위 ? '조각' : `${k}칸`}`, [{ shape: 'bar', parts: k, shaded: Array.from({ length: k }, (_, at) => at) }]),
    };
  },
};

// ── 5차시: 단위분수 ─────────────────────────────────────────────────
const 단위분수찾기문항: G5Family = {
  id: 'unit-fraction-find',
  make: (seed) => {
    const next = rand(seed + 12);
    if (next(3) === 0) {
      return {
        prompt: '1/2, 1/3, 1/4과(와) 같이 분자가 1인 분수를 무엇이라고 할까요?',
        answer: '단위분수',
        wrongs: ['분모', '분자', '소수'],
        tag: 'fraction',
        concept: '분수 중에서 1/2, 1/3, 1/4과 같이 분자가 1인 분수를 단위분수라고 합니다.',
        strategy: '용어의 뜻 떠올리기',
        hint: '분자가 1인 분수는 전체를 똑같이 나눈 것 중의 ‘하나’를 나타냅니다.',
        steps: ['1/2, 1/3, 1/4은 모두 분자가 1입니다.', '분자가 1인 분수를 단위분수라고 합니다.'],
        misconceptionTip: '분모와 분자는 분수의 아래와 위에 있는 수의 이름입니다. 분수 자체의 이름이 아닙니다.',
      };
    }
    const n = 3 + next(8);
    // 틀린 보기는 분자가 2 이상이고 분모보다 작은 진분수입니다(2/2 같은 수는 3-2에서 배웁니다).
    const 다른 = shuffleWith([3, 4, 5, 6, 7, 8, 9].filter((d) => d !== n), next).slice(0, 3);
    return {
      prompt: '단위분수는 어느 것일까요?',
      answer: 분수(1, n),
      wrongs: 다른.map((d) => 분수(2 + next(d - 2), d)),
      tag: 'fraction',
      concept: '분자가 1인 분수를 단위분수라고 합니다.',
      strategy: '분자 보기',
      hint: '분자(가로선 위의 수)가 1인 것을 찾으세요.',
      steps: [`${분수(1, n)}은(는) 분자가 1입니다.`, `그러므로 단위분수는 ${분수(1, n)}입니다.`],
      misconceptionTip: '분모가 아니라 분자가 1이어야 단위분수입니다.',
    };
  },
};

const 비교문장 = (왼: string, 오른: string, 기호: '>' | '<') => ({
  answer: `${왼} ${기호} ${오른}`,
  wrongs: [`${왼} ${기호 === '>' ? '<' : '>'} ${오른}`, `${왼} = ${오른}`],
});

const 단위분수비교문항: G5Family = {
  id: 'unit-compare',
  make: (seed) => {
    const next = rand(seed + 13);
    const a = 2 + next(9);
    let b = 2 + next(9);
    if (a === b) b = a === 10 ? 3 : a + 1;
    const 기호 = a < b ? '>' : '<';
    const { answer, wrongs } = 비교문장(분수(1, a), 분수(1, b), 기호);
    const 큰 = a < b ? a : b;
    const 작은 = a < b ? b : a;
    return {
      prompt: `${분수(1, a)}과(와) ${분수(1, b)}의 크기를 바르게 비교한 것은 어느 것일까요?`,
      answer,
      wrongs: [...wrongs, '두 분수의 크기는 비교할 수 없습니다.'],
      sameValueOk: true,
      tag: 'fraction',
      concept: '단위분수는 분모가 클수록 더 작습니다. 똑같이 나누는 수가 많을수록 한 조각이 작아지기 때문입니다.',
      strategy: '같은 전체를 똑같이 나눈 한 조각의 크기 떠올리기',
      hint: `같은 크기의 종이를 똑같이 ${큰}조각으로 나눈 한 조각과 ${작은}조각으로 나눈 한 조각 가운데 어느 쪽이 더 클까요?`,
      steps: [
        `${분수(1, 큰)}은(는) 전체를 ${큰}조각으로, ${분수(1, 작은)}은(는) ${작은}조각으로 똑같이 나눈 것 중의 하나입니다.`,
        `더 많이 나눌수록 한 조각은 작아지므로 ${분수(1, 큰)}이(가) 더 큽니다.`,
        `그러므로 ${answer}입니다.`,
      ],
      misconceptionTip: '분모가 크다고 더 큰 분수가 아닙니다. 단위분수는 분모가 클수록 작습니다.',
      visual: 그림(`같은 크기의 띠를 똑같이 ${a}조각, ${b}조각으로 나누어 한 조각씩 색칠한 그림`, [
        { shape: 'bar', parts: a, shaded: [0] },
        { shape: 'bar', parts: b, shaded: [0] },
      ]),
    };
  },
};

const 가장큰단위분수문항 = (가장큰: boolean): G5Family => ({
  id: `unit-extreme-${가장큰 ? 'max' : 'min'}`,
  make: (seed) => {
    const next = rand(seed + 14);
    const ds = shuffleWith([2, 3, 4, 5, 6, 7, 8, 9, 10], next).slice(0, 4);
    const 답 = 가장큰 ? Math.min(...ds) : Math.max(...ds);
    return {
      prompt: `가장 ${가장큰 ? '큰' : '작은'} 분수는 어느 것일까요? (${ds.map((d) => 분수(1, d)).join(', ')})`,
      answer: 분수(1, 답),
      wrongs: ds.filter((d) => d !== 답).map((d) => 분수(1, d)),
      tag: 'fraction',
      concept: '단위분수는 분모가 작을수록 더 크고, 분모가 클수록 더 작습니다.',
      strategy: '단위분수는 분모로 비교하기',
      hint: `모두 분자가 1인 단위분수입니다. 분모가 ${가장큰 ? '가장 작은' : '가장 큰'} 것이 ${가장큰 ? '가장 큽니다' : '가장 작습니다'}. 왜 그런지 생각해 보세요.`,
      steps: [
        `네 분수는 모두 단위분수입니다. 분모는 ${[...ds].sort((x, y) => x - y).join(', ')}입니다.`,
        `똑같이 나누는 수가 ${가장큰 ? '적을수록 한 조각이 크므로' : '많을수록 한 조각이 작으므로'} 가장 ${가장큰 ? '큰' : '작은'} 분수는 ${분수(1, 답)}입니다.`,
      ],
      misconceptionTip: '자연수처럼 분모가 큰 쪽을 큰 수로 생각하면 안 됩니다.',
    };
  },
});

const 단위분수순서문항: G5Family = {
  id: 'unit-order',
  make: (seed) => {
    const next = rand(seed + 15);
    const ds = shuffleWith([2, 3, 4, 5, 6, 7, 8, 9, 10], next).slice(0, 3);
    const 작은부터 = [...ds].sort((x, y) => y - x);
    const 글 = (list: number[]) => list.map((d) => 분수(1, d)).join(', ');
    const 거꾸로 = [...작은부터].reverse();
    return {
      prompt: `작은 분수부터 차례로 쓴 것은 어느 것일까요? (${글(ds)})`,
      answer: 글(작은부터),
      wrongs: [글(거꾸로), 글([작은부터[1], 작은부터[0], 작은부터[2]]), 글([작은부터[0], 작은부터[2], 작은부터[1]])],
      sameValueOk: true,
      tag: 'fraction',
      concept: '단위분수는 분모가 클수록 더 작습니다.',
      strategy: '분모가 큰 단위분수부터 쓰기',
      hint: '분모가 가장 큰 단위분수가 가장 작습니다.',
      steps: [`분모가 큰 차례는 ${작은부터.join(', ')}입니다.`, `단위분수는 분모가 클수록 작으므로 작은 분수부터 쓰면 ${글(작은부터)}입니다.`],
      misconceptionTip: '분모가 작은 것부터 쓰면 큰 분수부터 쓴 것이 됩니다.',
    };
  },
};

const 가래떡문항: G5Family = {
  id: 'rice-cake',
  make: (seed) => {
    const next = rand(seed + 16);
    const a = 2 + next(4);
    const b = a + 1 + next(4);
    const 앞이적다 = next(2) === 0;
    const [첫, 둘] = 앞이적다 ? [a, b] : [b, a];
    const 음식 = pick(['가래떡', '종이띠', '막대 사탕'], seed);
    return {
      prompt: `똑같은 ${음식} 2개 가운데 하나는 똑같이 ${첫}조각으로, 다른 하나는 똑같이 ${둘}조각으로 나누었습니다. 한 조각의 크기가 더 큰 것은 어느 것일까요?`,
      answer: `${a}조각으로 나눈 것의 한 조각`,
      wrongs: [`${b}조각으로 나눈 것의 한 조각`, '두 조각의 크기가 같습니다.', `${a + b}조각으로 나눈 것의 한 조각`],
      tag: 'fraction',
      concept: '같은 전체를 더 많은 조각으로 똑같이 나눌수록 한 조각의 크기는 작아집니다.',
      strategy: '조각 수와 한 조각의 크기 관계 생각하기',
      hint: '똑같은 것을 더 많은 사람이 나누어 가지면 한 사람이 받는 양은 어떻게 될까요?',
      steps: [
        `${a}조각으로 나눈 한 조각은 전체의 ${분수(1, a)}, ${b}조각으로 나눈 한 조각은 전체의 ${분수(1, b)}입니다.`,
        `${b}조각으로 나눈 쪽이 더 잘게 나누었으므로 한 조각이 작습니다.`,
        `그러므로 ${a}조각으로 나눈 것의 한 조각이 더 큽니다.`,
      ],
      misconceptionTip: '조각 수가 많다고 한 조각이 큰 것이 아닙니다.',
      visual: 그림(`똑같은 ${eul(음식)} ${첫}조각, ${둘}조각으로 나누어 한 조각씩 색칠한 그림`, [
        { shape: 'bar', parts: 첫, shaded: [0] },
        { shape: 'bar', parts: 둘, shaded: [0] },
      ]),
    };
  },
};

// ── 6차시: 분모가 같은 분수 ─────────────────────────────────────────
const 같은분모비교문항: G5Family = {
  id: 'same-denom-compare',
  make: (seed) => {
    const next = rand(seed + 17);
    const n = 3 + next(8);
    const a = 1 + next(n - 1);
    let b = 1 + next(n - 1);
    if (a === b) b = a === n - 1 ? a - 1 : a + 1;
    if (b < 1) return null;
    const 기호 = a > b ? '>' : '<';
    const { answer, wrongs } = 비교문장(분수(a, n), 분수(b, n), 기호);
    const 큰 = Math.max(a, b);
    const 작은 = Math.min(a, b);
    return {
      prompt: `${분수(a, n)}과(와) ${분수(b, n)}의 크기를 바르게 비교한 것은 어느 것일까요?`,
      answer,
      wrongs: [...wrongs, '두 분수의 크기는 비교할 수 없습니다.'],
      sameValueOk: true,
      tag: 'fraction',
      concept: '분모가 같은 분수는 단위분수가 몇 개인지로 비교합니다. 분자가 클수록 더 큰 분수입니다.',
      strategy: `${분수(1, n)}이(가) 몇 개인지 세어 비교하기`,
      hint: `${분수(a, n)}과(와) ${분수(b, n)}은(는) 각각 ${분수(1, n)}이(가) 몇 개인가요?`,
      steps: [
        `${분수(큰, n)}은(는) ${분수(1, n)}이(가) ${큰}개, ${분수(작은, n)}은(는) ${분수(1, n)}이(가) ${작은}개입니다.`,
        `${분수(1, n)}이(가) 더 많은 ${분수(큰, n)}이(가) 더 크므로 ${answer}입니다.`,
      ],
      misconceptionTip: '분모가 같을 때는 단위분수의 크기가 같으므로, 분자가 큰 쪽이 더 큽니다.',
      visual: 그림(`같은 크기의 띠를 똑같이 ${n}조각으로 나누어 ${a}칸과 ${b}칸을 색칠한 그림`, [
        { shape: 'bar', parts: n, shaded: Array.from({ length: a }, (_, at) => at) },
        { shape: 'bar', parts: n, shaded: Array.from({ length: b }, (_, at) => at) },
      ]),
    };
  },
};

const 단위분수몇개문항: G5Family = {
  id: 'count-unit',
  make: (seed) => {
    const next = rand(seed + 18);
    const n = 3 + next(8);
    const a = 2 + next(n - 2);
    if (a >= n) return null;
    if (next(2) === 0) {
      return {
        prompt: `${분수(a, n)}은(는) ${분수(1, n)}이(가) 몇 개일까요?`,
        answer: `${a}개`,
        wrongs: [`${n}개`, `${n - a}개`, `${a + n}개`, `${a - 1}개`].filter((one) => one !== '0개' && one !== '1개'),
        tag: 'fraction',
        concept: `${분수(a, n)}은(는) 전체를 똑같이 ${n}(으)로 나눈 것 중의 ${a}이므로 ${분수(1, n)}이(가) ${a}개입니다.`,
        strategy: '분자로 단위분수의 개수 알기',
        hint: `${분수(1, n)}은(는) 똑같이 ${n}(으)로 나눈 것 중의 하나입니다. ${분수(a, n)}은(는) 그런 조각이 몇 개인가요?`,
        steps: [`${분수(a, n)}은(는) 똑같이 ${n}(으)로 나눈 것 중의 ${a}입니다.`, `그러므로 ${분수(1, n)}이(가) ${a}개입니다.`],
        misconceptionTip: '분모가 아니라 분자가 단위분수의 개수입니다.',
      };
    }
    return {
      prompt: `${분수(1, n)}이(가) ${a}개이면 얼마일까요?`,
      answer: 분수(a, n),
      wrongs: [분수(n, a), 분수(a, n + a), 분수(1, n), 분수(a - 1, n), 분수(1, a)].filter((one) => !one.endsWith('/1') && !one.startsWith('0/')),
      tag: 'fraction',
      concept: '단위분수가 ■개이면 분모는 그대로이고 분자가 ■입니다.',
      strategy: '단위분수를 여러 개 모으기',
      hint: `${분수(1, n)}은(는) 똑같이 ${n}(으)로 나눈 것 중의 하나입니다. 그런 조각 ${a}개는 ${n}(으)로 나눈 것 중의 몇일까요?`,
      steps: [`${분수(1, n)}이(가) ${a}개이면 똑같이 ${n}(으)로 나눈 것 중의 ${a}입니다.`, `그러므로 ${분수(a, n)}입니다.`],
      misconceptionTip: '조각을 모아도 분모는 바뀌지 않습니다. 분모에 개수를 곱하면 안 됩니다.',
    };
  },
};

const 같은분모가장큰문항: G5Family = {
  id: 'same-denom-max',
  make: (seed) => {
    const next = rand(seed + 19);
    const n = 6 + next(5);
    const nums = shuffleWith(Array.from({ length: n - 1 }, (_, at) => at + 1), next).slice(0, 4);
    const 가장큰 = next(2) === 0;
    const 답 = 가장큰 ? Math.max(...nums) : Math.min(...nums);
    return {
      prompt: `가장 ${가장큰 ? '큰' : '작은'} 분수는 어느 것일까요? (${nums.map((k) => 분수(k, n)).join(', ')})`,
      answer: 분수(답, n),
      wrongs: nums.filter((k) => k !== 답).map((k) => 분수(k, n)),
      tag: 'fraction',
      concept: '분모가 같은 분수는 분자가 클수록 더 큽니다.',
      strategy: '분모가 같으면 분자만 비교하기',
      hint: `모두 분모가 ${n}입니다. ${분수(1, n)}이(가) 가장 ${가장큰 ? '많은' : '적은'} 것을 찾으세요.`,
      steps: [`분모가 ${n}(으)로 같으므로 분자를 비교합니다.`, `분자가 가장 ${가장큰 ? '큰' : '작은'} 것은 ${답}이므로 ${분수(답, n)}입니다.`],
      misconceptionTip: '분모가 같을 때는 분자가 큰 쪽이 큽니다. 단위분수끼리 비교할 때와 헷갈리지 마세요.',
    };
  },
};

const 음료문항: G5Family = {
  id: 'drink-compare',
  make: (seed) => {
    const next = rand(seed + 20);
    const n = 4 + next(6);
    const a = 1 + next(n - 1);
    let b = 1 + next(n - 1);
    if (a === b) b = a === 1 ? 2 : a - 1;
    const [이름1, 이름2] = pick([['수박주스', '요구르트'], ['우유', '포도주스'], ['사과주스', '식혜']], seed);
    const 많이 = a > b ? 이름1 : 이름2;
    const 적게 = a > b ? 이름2 : 이름1;
    return {
      prompt: `크기가 같은 컵에 ${이름1}은(는) 한 컵의 ${분수(a, n)}만큼, ${이름2}은(는) 한 컵의 ${분수(b, n)}만큼 남았습니다. 더 많이 남은 것은 어느 것일까요?`,
      answer: 많이,
      wrongs: [적게, '두 음료의 양이 같습니다.', '알 수 없습니다.'],
      tag: 'fraction',
      concept: '전체(한 컵)의 크기가 같을 때, 분모가 같은 분수는 분자가 큰 쪽이 더 많습니다.',
      strategy: '같은 전체인지 확인하고 분자 비교하기',
      hint: `두 분수의 분모는 모두 ${n}입니다. ${분수(1, n)}이(가) 몇 개씩인지 비교해 보세요.`,
      steps: [
        `${분수(Math.max(a, b), n)}은(는) ${분수(1, n)}이(가) ${Math.max(a, b)}개, ${분수(Math.min(a, b), n)}은(는) ${Math.min(a, b)}개입니다.`,
        `컵의 크기가 같으므로 ${분수(Math.max(a, b), n)}만큼 남은 ${많이}이(가) 더 많이 남았습니다.`,
      ],
      misconceptionTip: '분수로 양을 비교할 때는 전체의 크기가 같아야 합니다. 그래서 크기가 같은 컵이라고 했습니다.',
    };
  },
};

const 보다큰분수문항: G5Family = {
  id: 'greater-than',
  make: (seed) => {
    const next = rand(seed + 21);
    const n = 6 + next(5);
    const 기준 = 2 + next(n - 4);
    const 큰쪽 = 기준 + 1 + next(n - 1 - 기준);
    const 작은쪽들 = shuffleWith(Array.from({ length: 기준 - 1 }, (_, at) => at + 1), next).slice(0, 2);
    const wrongs = [분수(기준, n), ...작은쪽들.map((k) => 분수(k, n))];
    if (wrongs.length < 3) wrongs.push(분수(1, n + 2));
    return {
      prompt: `${분수(기준, n)}보다 큰 분수는 어느 것일까요?`,
      answer: 분수(큰쪽, n),
      wrongs,
      sameValueOk: true,
      tag: 'fraction',
      concept: '분모가 같은 분수는 분자가 클수록 더 큽니다.',
      strategy: '분자 비교하기',
      hint: `분모가 ${n}인 분수는 분자가 ${기준}보다 커야 ${분수(기준, n)}보다 큽니다. ‘보다 큰’에는 같은 수가 들어가지 않습니다.`,
      steps: [`분모가 ${n}(으)로 같으므로 분자가 ${기준}보다 큰 것을 찾습니다.`, `분자가 ${큰쪽}인 ${분수(큰쪽, n)}이(가) ${분수(기준, n)}보다 큽니다.`],
      misconceptionTip: `${분수(기준, n)}과(와) 같은 분수는 ‘보다 큰’ 분수가 아닙니다.`,
    };
  },
};

const 전체다름문항: G5Family = {
  id: 'different-whole',
  make: (seed) => {
    const next = rand(seed + 22);
    const n = 4 + next(4);
    const a = 1;
    const b = 2 + next(n - 2);
    const [큰것, 작은것] = pick([['수박', '사과'], ['큰 피자', '작은 쿠키'], ['운동장', '공책']], seed);
    return {
      prompt: `${큰것}을(를) 똑같이 ${n}조각으로 나눈 것 중 ${a}조각은 ${분수(a, n)}, ${작은것}을(를) 똑같이 ${n}조각으로 나눈 것 중 ${b}조각은 ${분수(b, n)}입니다. ${분수(b, n)}이(가) 더 크니 ${작은것} ${b}조각이 더 크다고 말해도 될까요?`,
      answer: '안 됩니다. 전체의 크기가 달라서 분수만 보고 비교할 수 없습니다.',
      wrongs: [`됩니다. 분자 ${b}이(가) ${a}보다 크기 때문입니다.`, '됩니다. 분모가 같기 때문입니다.', '안 됩니다. 분모가 같으면 크기를 비교할 수 없습니다.'],
      tag: 'fraction',
      concept: '분수의 크기를 비교할 때는 전체가 같아야 합니다. 전체의 크기가 다르면 분수만 보고 양을 비교할 수 없습니다.',
      strategy: '전체가 같은지 먼저 확인하기',
      hint: `${큰것} 한 개와 ${작은것} 한 개는 크기가 같나요?`,
      steps: [
        `${분수(b, n)}이(가) ${분수(a, n)}보다 큰 것은 전체가 같을 때입니다.`,
        `${큰것}과(와) ${작은것}은(는) 전체의 크기가 다르므로 분수만 보고 실제 양을 비교할 수 없습니다.`,
      ],
      misconceptionTip: '분수는 ‘전체의 얼마’입니다. 전체가 다르면 같은 분수라도 양이 다릅니다.',
    };
  },
};

// ── 7차시: 소수 ⑴ ───────────────────────────────────────────────────
const 분수를소수로문항: G5Family = {
  id: 'frac-to-dec',
  make: (seed) => {
    const next = rand(seed + 23);
    const k = 1 + next(9);
    if (next(3) === 0) {
      return {
        prompt: `${k === 1 ? '0.1' : 소수(k)}을(를) 분수로 나타내면 얼마일까요?`,
        answer: 분수(k, 10),
        wrongs: [분수(1, k === 1 ? 2 : k), 분수(10, k), 분수(10 - k, 10), 분수(k + 1, 10)].filter((one) => one !== 분수(k, 10) && !one.startsWith('0/') && one !== '10/1' && one !== '10/10'),
        tag: 'decimal',
        concept: '1/10, 2/10, …, 9/10을 0.1, 0.2, …, 0.9라고 씁니다.',
        strategy: '분모가 10인 분수와 소수 잇기',
        hint: `${소수(k)}은(는) 0.1이 몇 개인가요? 0.1은 분수로 1/10입니다.`,
        steps: [`${소수(k)}은(는) 0.1이 ${k}개입니다.`, `1/10이 ${k}개이면 ${분수(k, 10)}입니다.`],
        misconceptionTip: '소수 0.■는 분모가 10인 분수 ■/10과 같습니다.',
      };
    }
    return {
      prompt: `${분수(k, 10)}을(를) 소수로 나타내면 얼마일까요?`,
      answer: 소수(k),
      wrongs: [`${k}`, 소수(10 - k), `${k}.1`, `1.${k}`].filter((one) => one !== 소수(k)),
      tag: 'decimal',
      concept: '1/10, 2/10, 3/10, …, 9/10을 0.1, 0.2, 0.3, …, 0.9라 쓰고 영 점 일, 영 점 이, 영 점 삼, …, 영 점 구라고 읽습니다.',
      strategy: '분모가 10인 분수를 소수로 쓰기',
      hint: `${분수(k, 10)}은(는) 1/10이 몇 개인가요? 1/10은 0.1입니다.`,
      steps: [`${분수(k, 10)}은(는) 1/10이 ${k}개입니다.`, `1/10=0.1이므로 0.1이 ${k}개인 ${소수(k)}입니다.`],
      misconceptionTip: '소수점을 빠뜨리면 전혀 다른 수가 됩니다. 1보다 작은 소수는 0.■로 씁니다.',
    };
  },
};

const 소수읽기문항 = (큰수: boolean): G5Family => ({
  id: `read-decimal-${큰수 ? 'big' : 'small'}`,
  make: (seed) => {
    const next = rand(seed + 24);
    const 앞 = 큰수 ? 1 + next(9) : 0;
    const 뒤 = 1 + next(9);
    const t = 앞 * 10 + 뒤;
    if (next(2) === 0) {
      const 잘못 = [
        큰수 ? `${수말(t)}` : `${숫자말[뒤]} 점 영`,
        `${숫자말[뒤]} 점 ${큰수 ? 숫자말[앞] : '영'}`,
        `${수말(앞)} ${숫자말[뒤]}`,
        큰수 ? `${수말(앞)} 점 ${숫자말[뒤]}십` : `영 점 ${숫자말[뒤]}십`,
      ];
      return {
        prompt: `${소수(t)}을(를) 바르게 읽은 것은 어느 것일까요?`,
        answer: 소수읽기(t),
        wrongs: [...new Set(잘못)].filter((one) => one !== 소수읽기(t)),
        tag: 'decimal',
        concept: '소수점은 ‘점’이라고 읽고, 소수점 오른쪽의 숫자는 숫자만 읽습니다.',
        strategy: '소수점 왼쪽, 점, 오른쪽 차례로 읽기',
        hint: '소수점 왼쪽 부분을 먼저 읽고, ‘점’을 읽은 다음, 소수점 오른쪽 숫자를 읽으세요.',
        steps: [`${소수(t)}에서 소수점 왼쪽은 ${앞}, 오른쪽은 ${뒤}입니다.`, `그러므로 ${소수읽기(t)}(이)라고 읽습니다.`],
        misconceptionTip: '소수점 오른쪽 숫자에는 ‘십’ 같은 자릿값을 붙여 읽지 않습니다.',
      };
    }
    const 잘못수 = [`${t}`, 소수(뒤 * 10 + 앞), `${앞}${뒤}0`, 소수(t + 10)].filter((one) => one !== 소수(t) && one !== '0' && !/^0\d/.test(one));
    return {
      prompt: `${소수읽기(t)}을(를) 소수로 바르게 쓴 것은 어느 것일까요?`,
      answer: 소수(t),
      wrongs: 잘못수,
      tag: 'decimal',
      concept: '‘점’은 소수점(.)으로 씁니다.',
      strategy: '‘점’을 소수점으로 바꾸어 쓰기',
      hint: '‘점’ 앞은 소수점 왼쪽에, ‘점’ 뒤는 소수점 오른쪽에 씁니다.',
      steps: [`‘점’ 앞의 ${수말(앞)}은(는) ${앞}, 뒤의 ${숫자말[뒤]}은(는) ${뒤}입니다.`, `그러므로 ${소수(t)}입니다.`],
      misconceptionTip: '소수점을 빠뜨리면 다른 수가 됩니다.',
    };
  },
});

const 영점일몇개문항 = (큰수: boolean): G5Family => ({
  id: `count-tenths-${큰수 ? 'big' : 'small'}`,
  make: (seed) => {
    const next = rand(seed + 25);
    const t = 큰수 ? 11 + next(89) : 1 + next(9);
    if (t % 10 === 0) return null;
    if (next(2) === 0) {
      return {
        prompt: `${소수(t)}은(는) 0.1이 몇 개인 수일까요?`,
        answer: `${t}개`,
        wrongs: [큰수 ? `${t % 10}개` : '1개', 큰수 ? `${Math.floor(t / 10)}개` : `${10 - t}개`, `${t * 10}개`, `${t + 10}개`].filter((one) => one !== `${t}개` && one !== '0개'),
        tag: 'decimal',
        concept: '1은 0.1이 10개입니다. 소수는 0.1이 몇 개인지로 나타낼 수 있습니다.',
        strategy: '0.1이 몇 개인지 세기',
        hint: 큰수 ? `${Math.floor(t / 10)}은(는) 0.1이 몇 개인가요? 거기에 0.${t % 10}만큼을 더해 보세요.` : `0.1, 0.2, 0.3, …으로 0.1씩 세어 ${소수(t)}까지 가 보세요.`,
        steps: 큰수
          ? [`1은 0.1이 10개이므로 ${Math.floor(t / 10)}은(는) 0.1이 ${Math.floor(t / 10) * 10}개입니다.`, `0.${t % 10}은(는) 0.1이 ${t % 10}개입니다.`, `${Math.floor(t / 10) * 10}+${t % 10}=${t}이므로 0.1이 ${t}개입니다.`]
          : [`${소수(t)}은(는) ${분수(t, 10)}과(와) 같습니다.`, `1/10=0.1이므로 0.1이 ${t}개입니다.`],
        misconceptionTip: '소수점 오른쪽 숫자만 세면 안 됩니다. 소수점 왼쪽의 1마다 0.1이 10개씩 있습니다.',
      };
    }
    return {
      prompt: `0.1이 ${t}개인 수는 얼마일까요?`,
      answer: 소수(t),
      wrongs: [`${t}`, 소수(t + 10), 큰수 ? 소수((t % 10) * 10 + Math.floor(t / 10)) : `${t}.1`, 큰수 ? `${t}.1` : `1.${t}`].filter((one) => one !== 소수(t)),
      tag: 'decimal',
      concept: '0.1이 10개이면 1입니다. 0.1이 ■▲개이면 ■.▲입니다.',
      strategy: '0.1이 10개씩 묶어 1 만들기',
      hint: '0.1이 10개이면 1입니다. 0.1이 몇 개씩 묶을 수 있는지 보세요.',
      steps: 큰수
        ? [`0.1이 ${Math.floor(t / 10) * 10}개이면 ${Math.floor(t / 10)}입니다.`, `남은 0.1이 ${t % 10}개이면 0.${t % 10}입니다.`, `그러므로 ${소수(t)}입니다.`]
        : [`0.1이 ${t}개이면 ${분수(t, 10)}입니다.`, `그러므로 ${소수(t)}입니다.`],
      misconceptionTip: '0.1이 10개이면 0.10이 아니라 1입니다.',
    };
  },
});

const 영점일열개문항: G5Family = {
  id: 'ten-tenths',
  make: (seed) => {
    const next = rand(seed + 26);
    if (next(2) === 0) {
      return {
        prompt: '0.1이 10개인 수는 얼마일까요?',
        answer: '1',
        wrongs: ['0.10', '10', '0.11'].filter(() => true).slice(0, 2).concat(['1.1']),
        tag: 'decimal',
        concept: '1을 똑같이 10으로 나눈 것 중의 하나가 0.1입니다. 그러므로 0.1이 10개이면 1입니다.',
        strategy: '10개가 모이면 받아올리기',
        hint: '1이 10개이면 10이 되어 윗자리로 받아올립니다. 0.1이 10개이면 어떻게 될까요?',
        steps: ['0.1은 1을 똑같이 10으로 나눈 것 중의 하나입니다.', '그런 조각 10개를 모으면 전체 1이 됩니다.'],
        misconceptionTip: '0.1이 10개이면 0.10이 아닙니다. 1이 됩니다.',
      };
    }
    return {
      prompt: '1은 0.1이 몇 개일까요?',
      answer: '10개',
      wrongs: ['1개', '100개', '9개'],
      tag: 'decimal',
      concept: '1을 똑같이 10으로 나눈 것 중의 하나가 0.1이므로 1은 0.1이 10개입니다.',
      strategy: '1을 똑같이 10으로 나누어 생각하기',
      hint: '1 cm를 똑같이 10칸으로 나누면 한 칸이 0.1 cm입니다. 1 cm는 몇 칸인가요?',
      steps: ['1을 똑같이 10으로 나눈 한 칸이 0.1입니다.', '그러므로 1은 0.1이 10개입니다.'],
      misconceptionTip: '0.1을 10개 모으면 1입니다. 0.10이 아닙니다.',
    };
  },
};

const 색칠소수문항 = (큰수: boolean): G5Family => ({
  id: `shaded-decimal-${큰수 ? 'big' : 'small'}`,
  make: (seed) => {
    const next = rand(seed + 27);
    const 앞 = 큰수 ? 1 + next(2) : 0;
    const 뒤 = 1 + next(9);
    const t = 앞 * 10 + 뒤;
    const figures: Fig[] = [
      ...Array.from({ length: 앞 }, (): Fig => ({ shape: 'bar', parts: 10, shaded: Array.from({ length: 10 }, (_, at) => at) })),
      { shape: 'bar', parts: 10, shaded: 큰수 ? Array.from({ length: 뒤 }, (_, at) => at) : 칠할칸(10, 뒤, next, next(2) === 0) },
    ];
    return {
      prompt: `띠 하나가 1일 때 색칠한 부분을 소수로 나타내면 얼마일까요?`,
      answer: 소수(t),
      wrongs: [`${t}`, 소수(앞 * 10 + (10 - 뒤)), 소수(뒤), 소수(t + 10), 소수(t + 1)].filter((one) => one !== 소수(t) && one !== '0'),
      tag: 'decimal',
      concept: '띠 하나를 똑같이 10칸으로 나누면 한 칸이 0.1입니다.',
      strategy: '다 칠한 띠와 0.1칸 따로 세기',
      hint: 큰수
        ? '모두 칠한 띠는 1씩입니다. 마지막 띠에서 칠한 칸이 0.1이 몇 개인지 세어 더하세요.'
        : '띠 하나가 똑같이 10칸입니다. 한 칸은 0.1입니다. 색칠한 칸을 빠짐없이 세어 보세요.',
      steps: 큰수
        ? [`모두 칠한 띠가 ${앞}개이므로 ${앞}입니다.`, `마지막 띠는 10칸 가운데 ${뒤}칸을 칠했으므로 0.${뒤}입니다.`, `${앞}과(와) 0.${뒤}만큼이므로 ${소수(t)}입니다.`]
        : [`10칸 가운데 ${뒤}칸을 칠했습니다.`, `한 칸이 0.1이므로 0.1이 ${뒤}개인 ${소수(t)}입니다.`],
      misconceptionTip: '칠한 칸이 떨어져 있어도 모두 세어야 합니다. 칠하지 않은 칸을 세면 안 됩니다.',
      visual: 그림(큰수 ? '똑같이 10칸으로 나눈 띠 여러 개' : '똑같이 10칸으로 나눈 띠', figures),
    };
  },
});

const 수직선소수문항 = (큰수: boolean): G5Family => ({
  id: `line-decimal-${큰수 ? 'big' : 'small'}`,
  make: (seed) => {
    const next = rand(seed + 28);
    const 시작 = 큰수 ? 1 + next(6) : 0;
    const t = 시작 * 10 + 1 + next(19);
    if (t % 10 === 0) return null;
    if (!큰수 && t > 9) return null;
    const 끝 = 큰수 ? 시작 + 2 : 1;
    const 왼눈금 = Math.floor(t / 10);
    return {
      prompt: '수직선에서 ⓐ가 나타내는 소수는 얼마일까요?',
      answer: 소수(t),
      wrongs: [소수(왼눈금 * 10 + (10 - (t % 10))), `${t}`, 소수(t + 1), 소수(t - 1), 소수(t + 10)].filter((one) => one !== 소수(t) && one !== '0'),
      tag: 'decimal',
      concept: '수직선에서 1을 똑같이 10칸으로 나눈 작은 눈금 한 칸은 0.1입니다.',
      strategy: '작은 눈금 한 칸의 크기 알기',
      hint: `${왼눈금}에서 오른쪽으로 작은 눈금 몇 칸을 갔는지 세어 보세요. 작은 눈금 한 칸은 0.1입니다.`,
      steps: [`큰 눈금 사이가 똑같이 10칸이므로 작은 눈금 한 칸은 0.1입니다.`, `ⓐ는 ${왼눈금}에서 ${t % 10}칸 더 간 곳이므로 ${소수(t)}입니다.`],
      misconceptionTip: '오른쪽 큰 눈금에서 거꾸로 세면 안 됩니다. 왼쪽 큰 눈금에서부터 세세요.',
      visual: {
        kind: 'number-line',
        label: `${시작}부터 ${끝}까지 0.1씩 눈금을 그은 수직선`,
        start: 시작,
        end: 끝,
        step: 0.1,
        majorEvery: 1,
        marks: [{ value: t / 10, label: 'ⓐ', active: true }],
      },
    };
  },
});

const 길이소수문항 = (큰수: boolean): G5Family => ({
  id: `length-decimal-${큰수 ? 'big' : 'small'}`,
  make: (seed) => {
    const next = rand(seed + 29);
    const cm = 큰수 ? 1 + next(15) : 0;
    const mm = 1 + next(9);
    const t = cm * 10 + mm;
    const 갈래 = next(2);
    if (!큰수) {
      return {
        prompt: 갈래 === 0 ? `${mm} mm는 몇 cm일까요?` : `1 cm를 똑같이 10으로 나눈 것 중의 ${mm}은(는) 몇 cm일까요?`,
        answer: `${소수(t)} cm`,
        wrongs: [`${mm} cm`, `${소수(t)} mm`, `${소수(10 - mm)} cm`, `1.${mm} cm`].filter((one) => one !== `${소수(t)} cm`),
        tag: 'decimal',
        concept: '1 mm는 1 cm를 똑같이 10으로 나눈 것 중의 하나이므로 1 mm=1/10 cm=0.1 cm입니다.',
        strategy: 'mm를 0.1 cm로 생각하기',
        hint: '1 mm는 몇 cm인지 먼저 생각해 보세요. 1 cm=10 mm입니다.',
        steps: ['1 mm=1/10 cm=0.1 cm입니다.', `${mm} mm는 0.1 cm가 ${mm}개이므로 ${소수(t)} cm입니다.`],
        misconceptionTip: 'mm를 cm로 바꿀 때 수를 그대로 쓰면 안 됩니다. 10 mm가 1 cm입니다.',
      };
    }
    const 몇mm = 갈래 === 1;
    return {
      prompt: 몇mm ? `${t} mm는 몇 cm일까요?` : `${cm} cm ${mm} mm는 몇 cm일까요?`,
      answer: `${소수(t)} cm`,
      wrongs: [`${t} cm`, `${소수(mm * 10 + (cm % 10))} cm`, `${cm} cm`, `${소수(t)} mm`, `${소수(t + 10)} cm`].filter((one) => one !== `${소수(t)} cm`),
      tag: 'decimal',
      concept: '1 mm=0.1 cm입니다. 몇 cm 몇 mm는 cm 부분을 소수점 왼쪽에, mm 부분을 소수점 오른쪽에 써서 나타냅니다.',
      strategy: 'cm는 소수점 왼쪽, mm는 소수점 오른쪽',
      hint: 몇mm ? `${t} mm는 몇 cm 몇 mm인지 먼저 바꾸어 보세요.` : `${mm} mm는 몇 cm인지 생각해 보세요. 1 mm=0.1 cm입니다.`,
      steps: [
        ...(몇mm ? [`${t} mm=${cm} cm ${mm} mm입니다.`] : []),
        `${mm} mm=0.${mm} cm입니다.`,
        `${cm} cm와 0.${mm} cm를 합하면 ${소수(t)} cm입니다.`,
      ],
      misconceptionTip: '단위를 cm로 바꾸었는지 확인하세요. mm 수를 그대로 cm에 붙이면 안 됩니다.',
    };
  },
});

const 와만큼문항: G5Family = {
  id: 'and-part',
  make: (seed) => {
    const next = rand(seed + 30);
    const 앞 = 1 + next(9);
    const 뒤 = 1 + next(9);
    if (next(2) === 0) {
      return {
        prompt: `${소수(앞 * 10 + 뒤)}은(는) ${앞}과(와) 얼마만큼인 수일까요?`,
        answer: `0.${뒤}`,
        wrongs: [`${뒤}`, `0.${10 - 뒤 === 10 ? 1 : 10 - 뒤}`, `${앞}`, `1.${뒤}`].filter((one) => one !== `0.${뒤}`),
        tag: 'decimal',
        concept: '■과 0.▲만큼을 ■.▲(이)라고 씁니다. 7과 0.6만큼은 7.6입니다.',
        strategy: '소수점 왼쪽과 오른쪽 나누어 보기',
        hint: '소수점 오른쪽의 숫자는 0.1이 몇 개인지 나타냅니다.',
        steps: [`${소수(앞 * 10 + 뒤)}에서 소수점 왼쪽은 ${앞}, 오른쪽은 ${뒤}입니다.`, `소수점 오른쪽 ${뒤}은(는) 0.${뒤}만큼이므로 ${앞}과(와) 0.${뒤}만큼입니다.`],
        misconceptionTip: `소수점 오른쪽의 ${뒤}은(는) ${뒤}이(가) 아니라 0.${뒤}만큼입니다.`,
      };
    }
    return {
      prompt: `${앞}과(와) 0.${뒤}만큼인 수는 얼마일까요?`,
      answer: 소수(앞 * 10 + 뒤),
      wrongs: [`${앞 + 뒤}`, `${앞}${뒤}`, 소수(뒤 * 10 + 앞), `0.${앞}${뒤}`].filter((one) => one !== 소수(앞 * 10 + 뒤) && !/^0\.\d\d$/.test(one)),
      tag: 'decimal',
      concept: '■과 0.▲만큼을 ■.▲(이)라 쓰고 ‘■ 점 ▲’라고 읽습니다.',
      strategy: '소수점 왼쪽에 ■, 오른쪽에 ▲ 쓰기',
      hint: `${앞}은(는) 소수점 왼쪽에, 0.${뒤}의 ${뒤}은(는) 소수점 오른쪽에 씁니다.`,
      steps: [`${앞}을(를) 소수점 왼쪽에 씁니다.`, `0.${뒤}의 ${뒤}을(를) 소수점 오른쪽에 쓰면 ${소수(앞 * 10 + 뒤)}입니다.`],
      misconceptionTip: '두 수를 더하거나 이어 붙이는 것이 아닙니다. 소수점으로 나누어 씁니다.',
    };
  },
};

// ── 9차시: 소수의 크기 비교 ─────────────────────────────────────────
const 소수비교문항 = (큰수: boolean): G5Family => ({
  id: `dec-compare-${큰수 ? 'big' : 'small'}`,
  make: (seed) => {
    const next = rand(seed + 31);
    let a: number;
    let b: number;
    if (!큰수) {
      a = 1 + next(9);
      b = 1 + next(9);
    } else if (next(2) === 0) {
      // 소수점 왼쪽 부분이 같은 경우
      const 앞 = 1 + next(9);
      a = 앞 * 10 + 1 + next(9);
      b = 앞 * 10 + 1 + next(9);
    } else {
      // 소수점 왼쪽 부분이 다르고, 오른쪽 숫자는 거꾸로인 경우(4.2와 3.9)
      const 앞 = 2 + next(8);
      a = 앞 * 10 + next(5);
      b = (앞 - 1) * 10 + 5 + next(5);
    }
    if (a === b || a % 10 === 0 && !큰수) return null;
    const 기호 = a > b ? '>' : '<';
    const { answer, wrongs } = 비교문장(소수(a), 소수(b), 기호);
    const 큰 = Math.max(a, b);
    const 작은 = Math.min(a, b);
    const 왼같음 = Math.floor(a / 10) === Math.floor(b / 10);
    return {
      prompt: `${소수(a)}과(와) ${소수(b)}의 크기를 바르게 비교한 것은 어느 것일까요?`,
      answer,
      wrongs: [...wrongs, '두 소수의 크기는 비교할 수 없습니다.'],
      sameValueOk: true,
      tag: 'decimal',
      concept: '소수의 크기는 0.1이 몇 개인지로 비교할 수 있습니다. 소수점 왼쪽 부분을 먼저 비교하고, 같으면 소수점 오른쪽을 비교합니다.',
      strategy: 큰수 ? '소수점 왼쪽부터 비교하기' : '0.1의 개수 비교하기',
      hint: 큰수
        ? '소수점 왼쪽 부분이 같은지 먼저 보세요. 다르면 왼쪽 부분만으로 크기가 정해집니다.'
        : '두 소수는 각각 0.1이 몇 개인가요?',
      steps: 큰수
        ? 왼같음
          ? [`소수점 왼쪽 부분이 ${Math.floor(a / 10)}(으)로 같습니다.`, `소수점 오른쪽은 ${큰 % 10}이(가) ${작은 % 10}보다 크므로 ${소수(큰)}이(가) 더 큽니다.`, `그러므로 ${answer}입니다.`]
          : [`소수점 왼쪽 부분은 ${Math.floor(큰 / 10)}이(가) ${Math.floor(작은 / 10)}보다 큽니다.`, `왼쪽 부분이 크면 오른쪽 숫자와 상관없이 더 크므로 ${소수(큰)}이(가) 더 큽니다.`, `그러므로 ${answer}입니다.`]
        : [`${소수(큰)}은(는) 0.1이 ${큰}개, ${소수(작은)}은(는) 0.1이 ${작은}개입니다.`, `0.1이 더 많은 ${소수(큰)}이(가) 더 크므로 ${answer}입니다.`],
      misconceptionTip: '소수점 오른쪽 숫자만 보고 비교하면 안 됩니다. 소수점 왼쪽 부분이 먼저입니다.',
      ...(큰수 && !왼같음
        ? {}
        : {
            visual: {
              kind: 'number-line' as const,
              label: `${Math.floor(작은 / 10)}부터 ${Math.floor(작은 / 10) + (큰수 ? 2 : 1)}까지 0.1씩 눈금을 그은 수직선`,
              start: Math.floor(작은 / 10),
              end: Math.floor(작은 / 10) + (큰수 ? 2 : 1),
              step: 0.1,
              majorEvery: 1,
              marks: [
                { value: a / 10, label: 소수(a) },
                { value: b / 10, label: 소수(b) },
              ],
            },
          }),
    };
  },
});

const 가장큰소수문항: G5Family = {
  id: 'dec-max',
  make: (seed) => {
    const next = rand(seed + 32);
    const 앞 = 2 + next(7);
    // 소수점 왼쪽이 같은 두 수, 하나 작은 수(오른쪽 숫자가 큼), 하나 큰 수 섞기
    const pool = new Set<number>([
      앞 * 10 + 1 + next(4),
      앞 * 10 + 5 + next(4),
      (앞 - 1) * 10 + 9,
      (앞 + 1) * 10 + next(3),
    ]);
    const nums = shuffleWith([...pool], next);
    if (nums.length < 4) return null;
    const 가장큰 = next(2) === 0;
    const 답 = 가장큰 ? Math.max(...nums) : Math.min(...nums);
    return {
      prompt: `가장 ${가장큰 ? '큰' : '작은'} 소수는 어느 것일까요? (${nums.map(소수).join(', ')})`,
      answer: 소수(답),
      wrongs: nums.filter((one) => one !== 답).map(소수),
      tag: 'decimal',
      concept: '소수점 왼쪽 부분을 먼저 비교하고, 같으면 소수점 오른쪽을 비교합니다.',
      strategy: '소수점 왼쪽부터 비교하기',
      hint: `소수점 왼쪽 부분이 가장 ${가장큰 ? '큰' : '작은'} 수를 먼저 찾으세요. 왼쪽 부분이 같은 수가 여럿이면 그때 오른쪽을 비교합니다.`,
      steps: [
        `소수점 왼쪽 부분은 ${nums.map((one) => Math.floor(one / 10)).join(', ')}입니다.`,
        가장큰
          ? `왼쪽 부분이 가장 큰 것은 ${소수(답)}입니다.`
          : `왼쪽 부분이 가장 작은 것은 ${소수(답)}입니다.`,
        `그러므로 가장 ${가장큰 ? '큰' : '작은'} 소수는 ${소수(답)}입니다.`,
      ],
      misconceptionTip: `${소수((앞 - 1) * 10 + 9)}처럼 소수점 오른쪽 숫자가 9로 커도 소수점 왼쪽 부분이 작으면 작은 수입니다.`,
    };
  },
};

const 멀리뛰기문항: G5Family = {
  id: 'long-jump',
  make: (seed) => {
    const next = rand(seed + 33);
    const 이름 = shuffleWith(['현진', '소민', '태은', '하영', '도훈', '지우'], next).slice(0, 3);
    const 기록 = new Set<number>();
    기록.add(5 + next(5));
    기록.add(11 + next(4));
    기록.add(15 + next(5));
    const 값 = shuffleWith([...기록], next);
    if (값.length < 3 || 값.some((v) => v % 10 === 0)) return null;
    const 짝 = 이름.map((name, at) => ({ name, t: 값[at] }));
    const 순서 = [...짝].sort((x, y) => y.t - x.t).map((one) => one.name);
    const 글 = (list: string[]) => list.join(', ');
    return {
      prompt: `멀리뛰기 기록입니다. ${짝.map((one) => `${one.name} ${소수(one.t)} m`).join(', ')}. 멀리 뛴 사람부터 차례로 쓴 것은 어느 것일까요?`,
      answer: 글(순서),
      wrongs: [글([...순서].reverse()), 글([순서[1], 순서[0], 순서[2]]), 글([순서[0], 순서[2], 순서[1]])],
      tag: 'decimal',
      concept: '기록이 큰 사람이 더 멀리 뛰었습니다. 소수의 크기는 소수점 왼쪽 부분부터 비교합니다.',
      strategy: '두 개씩 비교하여 차례 정하기',
      hint: '셋을 한꺼번에 비교하기 어려우면 두 사람씩 비교해 보세요. 기록이 큰 사람이 더 멀리 뛴 것입니다.',
      steps: [
        `기록을 큰 수부터 쓰면 ${[...짝].sort((x, y) => y.t - x.t).map((one) => `${소수(one.t)} m`).join(', ')}입니다.`,
        `그러므로 멀리 뛴 사람부터 ${글(순서)}입니다.`,
      ],
      misconceptionTip: '0.9처럼 소수점 오른쪽 숫자가 커도 1보다 작으면 1.■보다 작습니다.',
    };
  },
};

const 영점일개수비교문항: G5Family = {
  id: 'tenths-compare',
  make: (seed) => {
    const next = rand(seed + 34);
    const a = 21 + next(70);
    const b = a + (next(2) === 0 ? 1 : -1) * (1 + next(8));
    if (a % 10 === 0 || b % 10 === 0 || b < 11) return null;
    const 큰 = Math.max(a, b);
    return {
      prompt: `0.1이 ${a}개인 수와 ${소수(b)} 가운데 더 큰 수는 어느 것일까요?`,
      answer: 소수(큰),
      wrongs: [소수(Math.min(a, b)), '두 수가 같습니다.', `${큰}`],
      tag: 'decimal',
      concept: '0.1이 ■▲개인 수는 ■.▲입니다. 같은 꼴로 바꾸면 비교하기 쉽습니다.',
      strategy: '같은 꼴로 바꾸어 비교하기',
      hint: `0.1이 ${a}개인 수를 먼저 소수로 나타내 보세요.`,
      steps: [`0.1이 ${a}개인 수는 ${소수(a)}입니다.`, `${소수(a)}과(와) ${소수(b)}을(를) 비교하면 ${소수(큰)}이(가) 더 큽니다.`],
      misconceptionTip: `0.1이 ${a}개인 수는 ${a}이(가) 아닙니다. 0.1이 10개이면 1입니다.`,
    };
  },
};

const 소수오개념문항: G5Family = {
  id: 'dec-misconception',
  make: (seed) => {
    const next = rand(seed + 35);
    const 앞 = 3 + next(6);
    const 큰 = 앞 * 10 + 1 + next(3);
    const 작은 = (앞 - 1) * 10 + 6 + next(4);
    const 이름 = pick(['민호', '서연', '준우', '지아'], seed);
    return {
      prompt: `${이름}은(는) “${소수(작은)}의 소수점 오른쪽 숫자 ${작은 % 10}이(가) ${큰 % 10}보다 크니까 ${소수(작은)}이(가) ${소수(큰)}보다 커.”라고 말했습니다. 바르게 고친 것은 어느 것일까요?`,
      answer: `소수점 왼쪽 부분이 ${앞}인 ${소수(큰)}이(가) 더 큽니다.`,
      wrongs: [`${이름}의 말이 맞습니다.`, '두 수의 크기가 같습니다.', `소수점 오른쪽 숫자를 더해 보아야 알 수 있습니다.`],
      tag: 'decimal',
      concept: '소수의 크기는 소수점 왼쪽 부분을 먼저 비교합니다. 왼쪽 부분이 다르면 그것만으로 크기가 정해집니다.',
      strategy: '틀린 생각 바로잡기',
      hint: '두 수의 소수점 왼쪽 부분을 비교해 보세요. 0.1이 몇 개인지로 바꾸어 보아도 좋습니다.',
      steps: [
        `${소수(큰)}은(는) 0.1이 ${큰}개, ${소수(작은)}은(는) 0.1이 ${작은}개입니다.`,
        `${큰}개가 ${작은}개보다 많으므로 ${소수(큰)}이(가) 더 큽니다.`,
        `소수점 왼쪽 부분 ${앞}이(가) ${앞 - 1}보다 크기 때문입니다.`,
      ],
      misconceptionTip: '소수점 오른쪽 숫자만 보고 비교하면 틀립니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
export const unit6Lesson = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [도입문항];
  if (lessonNo === 2) {
    if (하) return [조각세기문항, 똑같이판단문항, 똑같이찾기문항];
    if (상) return [똑같이찾기문항, 똑같이판단문항, 똑같이뜻문항];
    return [똑같이찾기문항, 똑같이판단문항, 조각세기문항, 똑같이뜻문항];
  }
  if (lessonNo === 3) {
    if (하) return [색칠분수문항(true), 분모분자문항, 색칠분수문항(false)];
    if (상) return [색칠분수문항(true), 분수읽기문항, 분모분자문항];
    return [색칠분수문항(true), 분수읽기문항, 분모분자문항, 색칠분수문항(false)];
  }
  if (lessonNo === 4) {
    if (하) return [남은부분문항(true), 분수만큼고르기문항];
    if (상) return [먹고남은문항, 부분보고전체문항, 분수만큼고르기문항, 남은부분문항(false)];
    return [남은부분문항(true), 먹고남은문항, 분수만큼고르기문항, 부분보고전체문항];
  }
  if (lessonNo === 5) {
    if (하) return [단위분수비교문항, 단위분수찾기문항, 가래떡문항];
    if (상) return [가장큰단위분수문항(true), 가장큰단위분수문항(false), 단위분수순서문항, 가래떡문항];
    return [단위분수비교문항, 가장큰단위분수문항(true), 단위분수찾기문항, 가래떡문항];
  }
  if (lessonNo === 6) {
    if (하) return [같은분모비교문항, 단위분수몇개문항];
    if (상) return [같은분모가장큰문항, 보다큰분수문항, 음료문항, 전체다름문항];
    return [같은분모비교문항, 단위분수몇개문항, 음료문항, 같은분모가장큰문항];
  }
  if (lessonNo === 7) {
    if (하) return [분수를소수로문항, 색칠소수문항(false), 소수읽기문항(false)];
    if (상) return [수직선소수문항(false), 길이소수문항(false), 영점일몇개문항(false), 분수를소수로문항];
    return [분수를소수로문항, 색칠소수문항(false), 소수읽기문항(false), 영점일몇개문항(false), 수직선소수문항(false)];
  }
  if (lessonNo === 8) {
    if (하) return [길이소수문항(true), 와만큼문항, 색칠소수문항(true)];
    if (상) return [영점일몇개문항(true), 수직선소수문항(true), 영점일열개문항, 길이소수문항(true)];
    return [길이소수문항(true), 소수읽기문항(true), 영점일몇개문항(true), 색칠소수문항(true), 영점일열개문항];
  }
  if (lessonNo === 9) {
    if (하) return [소수비교문항(false), 소수비교문항(true), 영점일개수비교문항, 멀리뛰기문항];
    if (상) return [가장큰소수문항, 소수오개념문항, 영점일개수비교문항, 멀리뛰기문항];
    return [소수비교문항(false), 소수비교문항(true), 가장큰소수문항, 멀리뛰기문항];
  }
  return null;
};

export type { G5Spec };
