import { 고르개, 사이, 섞기, 앞칸들, type 조작갈래, type 수준 } from './common';

// ════════════════════════════════════════════════════════════════════
// 수직선에 점 놓기, 칸 색칠하기·구슬 놓기, 수 모형, 그래프 그리기,
// 각 만들기, 분류하기
// ════════════════════════════════════════════════════════════════════

const 분수말 = (n: number, d: number) => `${n}/${d}`;

// ── 수직선 ────────────────────────────────────────────────────────
/** 0과 1(또는 0~끝) 사이를 d칸으로 나눈 수직선에 분수 놓기 */
export const 수직선분수 = (끝: number, 대분수말: boolean, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `nl-frac-${끝}-${대분수말 ? 'm' : 'p'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 3, 8);
    const n = 끝 === 1 ? 사이(next, 1, d - 1) : 사이(next, d + 1, d * 끝 - 1);
    if (n % d === 0) return null;
    const 말 = 대분수말 ? `${Math.floor(n / d)}과(와) ${n % d}/${d}` : 분수말(n, d);
    const labels = Array.from({ length: 끝 + 1 }, (_, k) => ({ at: k * d, text: String(k) }));
    return {
      prompt: `수직선에서 ${말}을(를) 나타내는 곳에 점을 놓아 보세요.`,
      answer: `${말}의 자리`,
      manipulate: { kind: 'number-line', ticks: d * 끝, labels, target: n, minor: d },
      tag: 'fraction',
      strategy: '수직선의 한 칸이 얼마인지 알고 분수의 자리 찾기',
      hint: `0과 1 사이가 몇 칸으로 나뉘었는지 세어 보세요. 한 칸은 1/${d}이에요.`,
      steps: [`0과 1 사이가 똑같이 ${d}칸으로 나뉘어 있으므로 작은 눈금 한 칸은 1/${d}입니다.`, 대분수말 ? `${말}은(는) ${Math.floor(n / d)}에서 1/${d}이 ${n % d}개 더 있는 수입니다.` : `${말}은(는) 1/${d}이 ${n}개인 수입니다.`, `그러므로 0에서 작은 눈금 ${n}칸을 간 곳이 ${말}의 자리입니다.`],
      concept: '수직선에서 0과 1 사이를 똑같이 나눈 한 칸이 단위분수입니다.',
      misconception: '눈금의 개수(선의 수)를 세면 칸 수보다 1이 많아집니다. 칸을 세어야 합니다.',
      결,
    };
  },
});

/** 소수 한 자리(0~2)·두 자리(0.1 사이) 수직선 */
export const 수직선소수 = (두자리: boolean): 조작갈래 => ({
  id: `nl-dec-${두자리 ? 2 : 1}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    if (!두자리) {
      // 하: 1보다 작은 소수, 중: 1보다 큰 소수, 상: '0.1이 몇 개인 수'로 묻기
      const k = lv === 0 ? 사이(next, 1, 9) : 사이(next, 11, 19);
      const 값 = (k / 10).toFixed(1);
      return {
        prompt: lv === 2 ? `수직선에서 0.1이 ${k}개인 수를 나타내는 곳에 점을 놓아 보세요.` : `수직선에서 ${값}을(를) 나타내는 곳에 점을 놓아 보세요.`,
        answer: `${값}의 자리`,
        manipulate: { kind: 'number-line', ticks: 20, labels: [{ at: 0, text: '0' }, { at: 10, text: '1' }, { at: 20, text: '2' }], target: k, minor: 10 },
        tag: 'decimal',
        strategy: '0.1씩 나뉜 수직선에서 소수의 자리 찾기',
        hint: '0과 1 사이가 10칸으로 나뉘었어요. 작은 눈금 한 칸은 0.1이에요.',
        steps: ['0과 1 사이를 똑같이 10칸으로 나눈 한 칸은 0.1입니다.', `${값}은(는) 0.1이 ${k}개인 수입니다.`, `그러므로 0에서 작은 눈금 ${k}칸 간 곳이 ${값}의 자리입니다.`],
        concept: '1을 똑같이 10으로 나눈 하나는 0.1입니다.',
        misconception: '1을 지나면 다시 0.1부터 세는 것을 잊고 1.5를 0.5 자리에 놓기 쉽습니다.',
        결: lv,
      };
    }
    const 앞 = 사이(next, 1, 8);
    const k = 사이(next, 1, 9);
    const 값 = `0.${앞}${k}`;
    return {
      prompt: lv === 2 ? `수직선에서 0.01이 ${앞 * 10 + k}개인 수를 나타내는 곳에 점을 놓아 보세요.` : `수직선에서 ${값}을(를) 나타내는 곳에 점을 놓아 보세요.`,
      answer: `${값}의 자리`,
      manipulate: { kind: 'number-line', ticks: 10, labels: [{ at: 0, text: `0.${앞}` }, { at: 10, text: 앞 === 9 ? '1' : `0.${앞 + 1}` }], target: k },
      tag: 'decimal',
      strategy: '0.01씩 나뉜 수직선에서 소수 두 자리 수의 자리 찾기',
      hint: `0.${앞}과(와) 0.${앞 + 1} 사이가 10칸으로 나뉘었어요. 작은 눈금 한 칸은 0.01이에요.`,
      steps: [`0.${앞}과(와) 0.${앞 + 1} 사이를 똑같이 10칸으로 나눈 한 칸은 0.01입니다.`, `${값}은(는) 0.${앞}보다 0.01이 ${k}개 더 큰 수입니다.`, `그러므로 0.${앞}에서 작은 눈금 ${k}칸 간 곳이 ${값}의 자리입니다.`],
      concept: '0.1을 똑같이 10으로 나눈 하나는 0.01입니다.',
      misconception: '작은 눈금 한 칸을 0.1로 생각하기 쉽습니다.',
      결: lv === 2 ? 2 : 1,
    };
  },
});

/** 크기가 같은 분수: 1을 12칸으로 나눈 수직선에 2/3 놓기 등 */
export const 수직선같은분수: 조작갈래 = {
  id: 'nl-equiv',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 분모를 2배 하는 쉬운 분수, 중: 여러 배, 상: 24칸으로 나눈 수직선
    const 쌍: [number, number, number][] = lv === 0
      ? [[1, 2, 8], [1, 2, 10], [1, 4, 8], [3, 4, 8], [1, 3, 6], [2, 3, 6], [1, 5, 10], [2, 5, 10]]
      : lv === 1 ? [[1, 3, 12], [2, 3, 12], [1, 4, 12], [3, 4, 12], [1, 6, 12], [5, 6, 12], [3, 5, 10], [4, 5, 10]]
        : [[3, 8, 24], [5, 8, 24], [5, 6, 24], [7, 12, 24], [3, 4, 24], [2, 3, 24], [5, 12, 24], [7, 8, 24]];
    const [n, d, T] = 쌍[next(쌍.length)];
    const k = (n * T) / d;
    return {
      prompt: `0과 1 사이를 ${T}칸으로 나눈 수직선입니다. ${n}/${d}과(와) 크기가 같은 곳에 점을 놓아 보세요.`,
      answer: `${k}/${T}의 자리`,
      manipulate: { kind: 'number-line', ticks: T, labels: [{ at: 0, text: '0' }, { at: T, text: '1' }], target: k },
      tag: 'fraction',
      strategy: '분모와 분자에 같은 수를 곱해 크기가 같은 분수 만들기',
      hint: `${d}의 몇 배가 ${T}인지 생각해 보세요. 분자에도 같은 수를 곱해요.`,
      steps: [`수직선의 작은 눈금 한 칸은 1/${T}입니다.`, `${n}/${d}의 분모와 분자에 ${T / d}을(를) 곱하면 ${n}×${T / d}/${d}×${T / d}=${k}/${T}입니다.`, `그러므로 0에서 작은 눈금 ${k}칸 간 곳이 ${n}/${d}과(와) 크기가 같습니다.`],
      concept: '분모와 분자에 0이 아닌 같은 수를 곱하면 크기가 같은 분수가 됩니다.',
      misconception: `분자 ${n}을 그대로 써서 ${n}칸에 놓기 쉽습니다.`,
      결: lv === 0 ? 1 : 2,
    };
  },
};

/** 수의 순서(1학년). 1학년은 '수직선'을 배우지 않으므로 '수가 차례로 놓인 줄'이라고 합니다. */
export const 수직선자연수 = (끝: number, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `nl-whole-${끝}-${결}`,
  make: (seed) => {
    const next = 고르개(seed);
    // 9까지의 수를 배울 때는 0부터 9까지만 둡니다(10은 아직 배우지 않았습니다).
    const 한자리 = 끝 <= 10;
    const 시작 = 한자리 ? 0 : 사이(next, 1, 끝 / 10 - 1) * 10;
    const 칸수 = 한자리 ? 9 : 10;
    const n = 한자리 ? 사이(next, 1, 8) : 사이(next, 시작 + 1, 시작 + 9);
    const 큰작은 = next(2);
    const 기준 = 큰작은 ? n - 1 : n + 1;
    if (한자리 && (기준 < 0 || 기준 > 9)) return null;
    const 말 = 결 === 2 ? `${기준}보다 1만큼 더 ${큰작은 ? '큰' : '작은'} 수` : String(n);
    const labels = 한자리 ? [{ at: 0, text: '0' }, { at: 5, text: '5' }, { at: 9, text: '9' }] : [{ at: 0, text: String(시작) }, { at: 5, text: String(시작 + 5) }, { at: 10, text: String(시작 + 10) }];
    return {
      prompt: `수가 차례로 놓인 줄입니다. ${말}이(가) 있는 눈금을 눌러 점을 놓아 보세요.`,
      answer: `${n}의 자리`,
      manipulate: { kind: 'number-line', ticks: 칸수, labels, target: n - 시작 },
      tag: 'number',
      strategy: '수의 순서를 알고 자리 찾기',
      hint: `${시작}에서 한 칸씩 하나, 둘, 셋… 세어 가요.`,
      steps: ['눈금 한 칸을 갈 때마다 1씩 커집니다.', 결 === 2 ? `${기준}보다 1만큼 더 ${큰작은 ? '큰' : '작은'} 수는 ${기준}의 ${큰작은 ? '바로 다음' : '바로 앞'} 수인 ${n}입니다.` : `${n}은(는) ${시작}에서 ${n - 시작}칸 간 곳입니다.`, `그러므로 ${시작}에서 ${n - 시작}칸 간 눈금에 점을 놓습니다.`],
      concept: '오른쪽으로 갈수록 수가 커집니다. 바로 다음 수는 1만큼 더 큰 수입니다.',
      misconception: '눈금을 하나씩 어긋나게 세기 쉽습니다.',
      결,
    };
  },
});

// ── 칸 색칠하기·구슬 놓기 ───────────────────────────────────────────
export const 분수색칠 = (모양: 'bar' | 'circle', 결: 0 | 1): 조작갈래 => ({
  id: `shade-frac-${모양}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const d = lv === 0 ? 사이(next, 2, 4) : lv === 1 ? 사이(next, 4, 6) : 사이(next, 7, 10);
    const n = 사이(next, 1, d - 1);
    return {
      prompt: `전체를 똑같이 ${d}로 나누었습니다. ${분수말(n, d)}만큼 색칠해 보세요.`,
      answer: `${d}칸 가운데 ${n}칸`,
      manipulate: { kind: 'tap-fill', layout: 모양, parts: d, pre: [], target: n },
      tag: 'fraction',
      strategy: '분수만큼 색칠하기',
      hint: `분모 ${d}은(는) 전체를 나눈 조각 수, 분자 ${n}은(는) 색칠할 조각 수예요.`,
      steps: [`전체를 똑같이 ${d}로 나눈 것 가운데 하나는 1/${d}입니다.`, `${분수말(n, d)}은(는) 1/${d}이 ${n}개입니다.`, `그러므로 ${d}조각 가운데 ${n}조각을 색칠합니다.`],
      concept: '전체를 똑같이 나눈 것 가운데 부분을 분수로 나타냅니다.',
      misconception: '분모만큼 칠하거나, 칠하지 않은 부분을 분수로 생각하기 쉽습니다.',
      결: lv === 2 ? 1 : 결,
    };
  },
});

/** 전체 개수의 분수만큼(3-2), 비례배분(6-2) */
export const 묶음분수 = (비례: boolean): 조작갈래 => ({
  id: `shade-set-${비례 ? 'ratio' : 'frac'}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const emoji = ['🍎', '🍓', '⭐', '🎈', '🍪'][next(5)];
    if (비례) {
      const a = 사이(next, 1, lv === 0 ? 2 : 4);
      const b = 사이(next, 1, lv === 0 ? 3 : 4);
      if (a === b) return null;
      const 묶음 = lv === 0 ? 2 : 사이(next, 2, 4);
      const 전체 = (a + b) * 묶음;
      if (lv === 2 && (a + b) * 묶음 < 15) return null;
      if (전체 > 24) return null;
      const 몫 = a * 묶음;
      return {
        prompt: `${emoji} ${전체}개를 형과 동생이 ${a} : ${b}로 나누어 가지려고 합니다. 형이 가지는 만큼 눌러 표시해 보세요.`,
        answer: `${몫}개`,
        manipulate: { kind: 'tap-fill', layout: 'objects', parts: 전체, cols: 6, pre: [], target: 몫, emoji },
        tag: 'ratio',
        strategy: '전체를 비의 합으로 나누어 비례배분하기',
        hint: `${a}+${b}=${a + b}이므로 전체를 ${a + b}묶음으로 나누어 보세요. 형은 그 가운데 몇 묶음을 가질까요?`,
        steps: [`비 ${a} : ${b}로 나누면 전체는 ${a}+${b}=${a + b}묶음입니다.`, `한 묶음은 ${전체}÷${a + b}=${묶음}(개)입니다.`, `형은 ${a}묶음을 가지므로 ${전체}×${a}/${a + b}=${몫}(개)입니다.`],
        concept: '전체를 주어진 비로 나누는 것을 비례배분이라고 합니다.',
        misconception: `형의 몫을 ${a}개로 생각하거나, 전체를 ${a}로 나누기 쉽습니다.`,
        결: lv === 0 ? 1 : 2,
        실수: [
          { state: 앞칸들(b * 묶음), 말: `형이 아니라 동생이 가지는 만큼(${b}묶음)을 표시했습니다. 전체를 ${a + b}묶음으로 나누면 형은 앞의 수만큼인 ${a}묶음을 가집니다.` },
          ...(전체 % b === 0 && (전체 / b) * a <= 전체 && (전체 / b) * a !== 몫 ? [{ state: 앞칸들((전체 / b) * a), 말: `전체를 비의 합 ${a + b}이(가) 아니라 ${b}(으)로 나누어 한 묶음을 ${전체 / b}개로 생각했습니다. 전체는 ${a}+${b}=${a + b}묶음입니다.` }] : []),
          ...(a !== 몫 ? [{ state: 앞칸들(a), 말: `비의 앞의 수 ${a}을(를) 그대로 ${a}개만 표시했습니다. 전체를 ${a + b}묶음으로 나눈 것 가운데 ${a}묶음이어야 합니다.` }] : []),
        ],
      };
    }
    // 하: 단위분수, 중: 진분수, 상: 큰 전체의 진분수
    const d = lv === 0 ? [2, 3, 4][next(3)] : [3, 4, 6][next(3)];
    const 묶음 = lv === 2 ? 사이(next, 3, 4) : 사이(next, 2, 3);
    const 전체 = d * 묶음;
    const n = lv === 0 ? 1 : 사이(next, 2, d - 1);
    if (n >= d) return null;
    return {
      prompt: `${emoji} ${전체}개의 ${분수말(n, d)}만큼 눌러 표시해 보세요.`,
      answer: `${n * 묶음}개`,
      manipulate: { kind: 'tap-fill', layout: 'objects', parts: 전체, cols: 6, pre: [], target: n * 묶음, emoji },
      tag: 'fraction',
      strategy: '전체 개수를 똑같이 묶어 분수만큼 알기',
      hint: `${전체}개를 똑같이 ${d}묶음으로 나누면 한 묶음은 몇 개인지 먼저 구해 보세요.`,
      steps: [`${전체}개를 똑같이 ${d}묶음으로 나누면 한 묶음은 ${묶음}개입니다.`, `${분수말(n, d)}은(는) ${d}묶음 가운데 ${n}묶음입니다.`, `그러므로 ${묶음}×${n}=${n * 묶음}(개)를 표시합니다.`],
      concept: '전체 개수의 분수만큼은 전체를 분모만큼 똑같이 묶은 것 가운데 분자만큼입니다.',
      misconception: `분자 ${n}만큼 ${n}개만 표시하기 쉽습니다.`,
      결: lv === 2 ? 2 : 1,
    };
  },
});

/** 십 배열판에 구슬 놓기(1학년 모으기, 10 만들기) */
export const 십배열 = (종류: 'count' | 'make10' | 'gather' | 'teen'): 조작갈래 => ({
  id: `tenframe-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    if (종류 === 'teen') {
      const n = lv === 0 ? 사이(next, 11, 13) : lv === 1 ? 사이(next, 14, 16) : 사이(next, 17, 19);
      return {
        prompt: `구슬 판에 구슬을 ${n}개 놓아 보세요.`,
        answer: `${n}개`,
        manipulate: { kind: 'tap-fill', layout: 'tenframe', parts: 20, pre: [], target: n },
        tag: 'number',
        strategy: '10과 몇으로 십몇 나타내기',
        hint: `위의 판 10칸을 모두 채우고, 아래 판에 ${n - 10}개를 더 놓아요.`,
        steps: [`${n}은(는) 10과 ${n - 10}입니다.`, '먼저 10칸을 모두 채웁니다.', `그다음 ${n - 10}개를 더 놓으면 ${n}개입니다.`],
        concept: '십몇은 10개씩 묶음 1개와 낱개 몇 개입니다.',
        misconception: '하나씩 세다가 빠뜨리거나 두 번 세기 쉽습니다. 10을 먼저 채우면 쉽게 셀 수 있습니다.',
        결: lv === 2 ? 1 : 0,
      };
    }
    // 하: 조금만 더 놓기(작은 수), 중: 중간, 상: 많이 더 놓기(큰 수)
    const 있는 = 종류 === 'count' ? 0 : 종류 === 'make10' ? [사이(next, 7, 9), 사이(next, 4, 6), 사이(next, 1, 3)][lv] : 사이(next, 1, lv === 0 ? 3 : 4);
    const 목표 = 종류 === 'make10' ? 10 : 종류 === 'count' ? [사이(next, 2, 5), 사이(next, 5, 7), 사이(next, 7, 9)][lv] : [사이(next, 있는 + 1, 5), 사이(next, Math.max(있는 + 2, 6), 8), 사이(next, Math.max(있는 + 3, 8), 9)][lv];
    if (목표 <= 있는) return null;
    const pre = Array.from({ length: 있는 }, (_, k) => k);
    const 더 = 목표 - 있는;
    return {
      prompt: 종류 === 'count'
        ? `빈칸에 구슬을 ${목표}개 놓아 보세요.`
        : 종류 === 'make10'
          ? `빨간 구슬이 ${있는}개 있습니다. 모두 10개가 되도록 파란 구슬을 놓아 보세요.`
          : `빨간 구슬이 ${있는}개 있습니다. 모두 ${목표}개가 되도록 파란 구슬을 더 놓아 보세요.`,
      answer: 종류 === 'count' ? `${목표}개` : `파란 구슬 ${더}개`,
      manipulate: { kind: 'tap-fill', layout: 'tenframe', parts: 10, pre, target: 목표 },
      tag: 종류 === 'count' ? 'number' : 'addition',
      strategy: 종류 === 'make10' ? '10이 되도록 더하기' : 종류 === 'gather' ? '모으기' : '구슬 세기',
      hint: 종류 === 'make10' ? '빈칸이 몇 개인지 세어 보세요. 빈칸을 모두 채우면 10이에요.' : 종류 === 'gather' ? `${있는}에 이어서 ${[있는 + 1, 있는 + 2].filter((v) => v <= 목표).join(', ')}${목표 - 있는 > 2 ? '…' : ''} 하고 세며 ${목표}까지 놓아요.` : '한 줄에 5칸씩이에요. 5와 몇으로 생각하면 쉽게 셀 수 있어요.',
      steps: 종류 === 'count'
        ? ['판은 한 줄에 5칸씩 2줄입니다.', `${목표}은(는) ${목표 >= 5 ? `5와 ${목표 - 5}` : `${목표}`}입니다.`, `그러므로 구슬을 ${목표}개 놓습니다.`]
        : [`빨간 구슬 ${있는}개가 있습니다.`, `${있는}과(와) ${더}을(를) 모으면 ${목표}입니다.`, `그러므로 파란 구슬을 ${더}개 놓습니다.`],
      concept: 종류 === 'make10' ? '10이 되는 두 수를 알면 계산이 쉬워집니다.' : '두 수를 모으면 더 큰 수가 됩니다.',
      misconception: '이미 있는 구슬까지 다시 놓아 목표보다 많아지기 쉽습니다.',
      결: 종류 === 'count' ? (lv === 2 ? 1 : 0) : lv === 2 ? 2 : 1,
    };
  },
});

/** 1학년 물건 세기 */
export const 물건세기: 조작갈래 = {
  id: 'count-objects',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const emoji = ['🍎', '🐟', '⭐', '🎈', '🌷'][next(5)];
    const 이름 = { '🍎': '사과', '🐟': '물고기', '⭐': '별', '🎈': '풍선', '🌷': '꽃' }[emoji]!;
    const n = [사이(next, 2, 4), 사이(next, 5, 6), 사이(next, 7, 8)][lv];
    return {
      prompt: `${이름}을(를) ${n}개만 눌러 표시해 보세요.`,
      answer: `${n}개`,
      manipulate: { kind: 'tap-fill', layout: 'objects', parts: 9, cols: 5, pre: [], target: n, emoji },
      tag: 'number',
      strategy: '수만큼 세어 표시하기',
      hint: '하나, 둘, 셋… 소리 내어 세면서 하나씩 눌러요.',
      steps: ['하나씩 세며 누릅니다.', `마지막으로 센 수가 ${n}이면 멈춥니다.`, `그러므로 ${n}개를 표시합니다.`],
      concept: '마지막으로 센 수가 전체의 개수입니다.',
      misconception: '세다가 같은 것을 두 번 누르기 쉽습니다.',
      결: lv === 2 ? 1 : 0,
    };
  },
};

/** 10×10 모눈 색칠(소수 두 자리, 백분율, 넓이 모델의 분수 곱셈) */
export const 백칸색칠 = (종류: 'decimal' | 'percent' | 'frac-mul' | 'frac-add' | 'frac-div' | 'equiv-bar'): 조작갈래 => ({
  id: `grid-shade-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    if (종류 === 'decimal' || 종류 === 'percent') {
      // 하: 몇십 칸, 중: 몇십몇 칸, 상: 다른 꼴로 준 양(0.1과 0.01의 개수, 25명 가운데 몇 명)
      const k = lv === 0 ? 사이(next, 2, 9) * 10 : 사이(next, 11, 89);
      if (lv > 0 && k % 10 === 0) return null;
      if (lv === 2 && 종류 === 'percent' && k % 4 !== 0) return null;
      const 말 = 종류 === 'decimal' ? (k % 10 === 0 ? `0.${k / 10}` : `0.${k}`) : `${k}%`;
      const 다른말 = 종류 === 'decimal' ? `0.1이 ${Math.floor(k / 10)}개, 0.01이 ${k % 10}개인 수만큼` : `학생 25명 가운데 ${k / 4}명이 차지하는 비율만큼`;
      return {
        prompt: lv === 2 ? `전체가 100칸입니다. ${다른말} 색칠해 보세요. 칸을 누른 채로 끌면 여러 칸을 한꺼번에 칠할 수 있습니다.` : `전체가 100칸입니다. ${말}만큼 색칠해 보세요. 칸을 누른 채로 끌면 여러 칸을 한꺼번에 칠할 수 있습니다.`,
        answer: `${k}칸`,
        manipulate: { kind: 'tap-fill', layout: 'grid', parts: 100, cols: 10, pre: [], target: k },
        tag: 종류 === 'decimal' ? 'decimal' : 'ratio',
        strategy: 종류 === 'decimal' ? '0.01이 몇 개인지로 소수 나타내기' : '백분율을 100칸에 나타내기',
        hint: 종류 === 'decimal' ? `0.01은 한 칸, 0.1은 한 줄(10칸)이에요. ${말}은(는) 0.1이 몇 개, 0.01이 몇 개인지 생각해 보세요.` : '백분율은 전체를 100으로 보았을 때의 양이에요. 1%는 한 칸, 10%는 한 줄(10칸)이에요.',
        steps: [종류 === 'decimal' ? '전체 100칸 가운데 1칸은 0.01이고, 한 줄(10칸)은 0.1입니다.' : '백분율은 기준량을 100으로 할 때의 비율입니다.', `${말}은(는) 100칸 가운데 ${k}칸이므로 ${Math.floor(k / 10)}줄과 ${k % 10}칸입니다.`, `그러므로 ${k}칸을 색칠합니다.`],
        concept: 종류 === 'decimal' ? '1을 100으로 나눈 하나는 0.01입니다.' : '백분율은 기준량을 100으로 할 때의 비율이고 %로 나타냅니다.',
        misconception: 종류 === 'decimal' ? `${말}을(를) ${Math.floor(k / 10)}칸만 칠하기 쉽습니다.` : '백분율을 10칸 기준으로 생각하기 쉽습니다.',
        결: lv,
        ...(종류 === 'percent' ? {
          실수: lv === 2
            ? [{ state: 앞칸들(k / 4), 말: `학생 수 ${k / 4}명을 그대로 ${k / 4}칸으로 칠했습니다. 25명 가운데 1명은 100÷25=4(%)이므로 한 명이 4칸입니다.` }]
            : [{ state: 앞칸들(Math.floor(k / 10)), 말: `${k}%를 10칸 기준으로 생각해 ${Math.floor(k / 10)}칸만 칠했습니다. 백분율은 전체를 100으로 보므로 1%가 한 칸입니다.` }],
        } : {}),
      };
    }
    if (종류 === 'frac-mul') {
      const d1 = lv === 0 ? 사이(next, 2, 3) : 사이(next, 3, 5);
      const d2 = lv === 2 ? 사이(next, 3, 5) : 사이(next, 2, 3);
      const n1 = 사이(next, 1, d1 - 1);
      const n2 = 사이(next, 1, d2 - 1);
      return {
        prompt: `가로를 ${d1}칸, 세로를 ${d2}칸으로 나눈 직사각형입니다. ${n1}/${d1}의 ${n2}/${d2}만큼 색칠해 보세요.`,
        answer: `${d1 * d2}칸 가운데 ${n1 * n2}칸`,
        manipulate: { kind: 'tap-fill', layout: 'grid', parts: d1 * d2, cols: d1, pre: [], target: n1 * n2 },
        tag: 'fraction',
        strategy: '넓이 모델로 진분수의 곱셈 이해하기',
        hint: `먼저 가로로 ${n1}/${d1}만큼(왼쪽 ${n1}줄)을 생각하고, 그 가운데 세로로 ${n2}/${d2}만큼(위쪽 ${n2}줄)만 칠해요.`,
        steps: [`${n1}/${d1}은(는) 가로 ${d1}칸 가운데 ${n1}칸입니다.`, `그 가운데 ${n2}/${d2}은(는) 세로 ${d2}칸 가운데 ${n2}칸이므로 겹치는 칸은 ${n1}×${n2}=${n1 * n2}칸입니다.`, `전체 ${d1}×${d2}=${d1 * d2}칸 가운데 ${n1 * n2}칸이므로 ${n1}/${d1}×${n2}/${d2}=${n1 * n2}/${d1 * d2}입니다.`],
        concept: '진분수끼리의 곱은 분자는 분자끼리, 분모는 분모끼리 곱한 것과 같습니다.',
        misconception: '두 분수만큼을 따로따로 더해서 칠하기 쉽습니다.',
        결: lv === 0 ? 1 : 2,
      };
    }
    if (종류 === 'frac-add') {
      const d = [사이(next, 4, 6), 사이(next, 6, 9), 사이(next, 10, 12)][lv];
      const a = 사이(next, 1, d - 2);
      const b = 사이(next, 1, d - 1 - a);
      if (b < 1) return null;
      return {
        prompt: `전체를 똑같이 ${d}칸으로 나누었습니다. ${a}/${d}+${b}/${d}만큼 색칠해 보세요.`,
        answer: `${a + b}칸`,
        manipulate: { kind: 'tap-fill', layout: 'bar', parts: d, pre: [], target: a + b },
        tag: 'fraction',
        strategy: '분모가 같은 분수의 덧셈을 그림으로 나타내기',
        hint: `${a}/${d}만큼 칠한 다음, 이어서 ${b}/${d}만큼 더 칠해 보세요.`,
        steps: [`한 칸은 1/${d}입니다.`, `${a}/${d}은(는) ${a}칸, ${b}/${d}은(는) ${b}칸입니다.`, `${a}+${b}=${a + b}이므로 ${a + b}칸을 칠하면 ${a + b}/${d}입니다 — 분모는 그대로입니다.`],
        concept: '분모가 같은 분수의 덧셈은 분자끼리 더합니다.',
        misconception: `분모끼리도 더해 ${a + b}/${d * 2}로 생각하기 쉽습니다.`,
        결: lv === 2 ? 2 : 1,
      };
    }
    if (종류 === 'frac-div') {
      const d = lv === 0 ? 3 : 사이(next, 3, 5) + (lv === 2 ? 1 : 0);
      const n = 사이(next, 2, d - 1);
      const k = n;
      // n/d ÷ k = 1/d 조각 하나입니다. 막대를 d×k칸으로 그립니다.
      const 칸 = d * k;
      return {
        prompt: `막대 전체를 ${칸}칸으로 나누었습니다. ${n}/${d}을(를) ${k}로 똑같이 나눈 것 가운데 하나만큼 색칠해 보세요.`,
        answer: `${칸}칸 가운데 ${n}칸`,
        manipulate: { kind: 'tap-fill', layout: 'bar', parts: 칸, pre: [], target: n },
        tag: 'fraction',
        strategy: '(분수)÷(자연수)를 그림으로 나타내기',
        hint: `${n}/${d}은(는) 막대에서 몇 칸인지 먼저 구하고, 그것을 ${k}로 나누어 보세요.`,
        steps: [`막대 한 칸은 1/${칸}이고, ${n}/${d}=${n * k}/${칸}이므로 ${n * k}칸입니다.`, `${n * k}칸을 ${k}로 똑같이 나누면 ${n}칸입니다.`, `그러므로 ${n}/${d}÷${k}=${n}/${칸}이고, ${n}칸을 색칠합니다.`],
        concept: '(분수)÷(자연수)는 분수에 1/(자연수)를 곱한 것과 같습니다.',
        misconception: '분자만 나누어 생각하다가 나누어떨어지지 않으면 멈추기 쉽습니다.',
        결: lv === 0 ? 1 : 2,
      };
    }
    // 크기가 같은 분수(5-1): 12칸 막대에 2/3만큼
    // 하: 12칸에 쉬운 분수, 중: 12칸에 여러 분수, 상: 24칸에 분모가 8·12인 분수
    const 칸 = lv === 2 ? 24 : 12;
    const 쌍: [number, number][] = lv === 0 ? [[1, 2], [1, 3], [1, 4], [1, 6]] : lv === 1 ? [[2, 3], [3, 4], [5, 6], [5, 12], [7, 12]] : [[3, 8], [5, 8], [7, 8], [5, 6], [7, 12], [11, 12]];
    const [n, d] = 쌍[next(쌍.length)];
    return {
      prompt: `막대를 ${칸}칸으로 나누었습니다. ${n}/${d}과(와) 크기가 같도록 색칠해 보세요.`,
      answer: `${(n * 칸) / d}칸`,
      manipulate: { kind: 'tap-fill', layout: 'bar', parts: 칸, pre: [], target: (n * 칸) / d },
      tag: 'fraction',
      strategy: '크기가 같은 분수 만들기',
      hint: `${칸}칸을 ${d}묶음으로 나누면 한 묶음은 몇 칸일까요?`,
      steps: [`${칸}칸을 똑같이 ${d}묶음으로 나누면 한 묶음은 ${칸 / d}칸입니다.`, `${n}/${d}은(는) ${n}묶음이므로 ${n}×${칸 / d}=${(n * 칸) / d}칸입니다.`, `그러므로 ${n}/${d}=${(n * 칸) / d}/${칸}입니다.`],
      concept: '분모와 분자에 같은 수를 곱하면 크기가 같은 분수가 됩니다.',
      misconception: `분자 ${n}만큼만 칠하기 쉽습니다.`,
      결: lv === 0 ? 1 : 2,
    };
  },
});

// ── 수 모형 ───────────────────────────────────────────────────────
export const 수모형만들기 = (places: number[], 종류: 'read' | 'plus' | 'minus' | 'add', 범위?: [number, number]): 조작갈래 => ({
  id: `base-ten-${places.join('-')}-${종류}${범위 ? `-${범위.join('-')}` : ''}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 최대 = 범위?.[1] ?? places[0] * 10 - 1;
    const 최소 = 범위?.[0] ?? places[0];
    const n = 사이(next, 최소, 최대);
    // 읽기 — 하: 0이 없는 수, 중: 0이 있는 자리가 섞인 수, 상: 몇십(몇백)만큼 더 큰 수 만들기
    if (종류 === 'read' && places.length > 1) {
      const 영자리 = places.slice(1).some((p) => Math.floor(n / p) % 10 === 0);
      if (lv === 0 && 영자리) return null;
      if (lv === 1 && !영자리 && !범위) return null;
      if (lv === 2) { const t = 수모형만들기(places, 'plus', 범위).make(seed, 1); if (t) return t; }
    }
    const 자리 = places[1 + next(places.length - 1)] ?? 1;
    const 큰자리 = places[next(places.length - 1)];
    const 이름 = { 1000: '천', 100: '백', 10: '십', 1: '일' } as Record<number, string>;
    if (종류 === 'read') {
      return {
        prompt: `수 모형으로 ${n}을(를) 만들어 보세요.`,
        answer: String(n),
        manipulate: { kind: 'base-ten', places, target: n },
        tag: 'placeValue',
        strategy: '자릿값에 맞게 수 모형 놓기',
        hint: '가장 높은 자리부터, 그 자리의 숫자만큼 모형을 놓아요.',
        steps: [`${n}의 각 자리 숫자를 읽습니다.`, places.map((p) => `${이름[p]}의 자리 숫자 ${Math.floor(n / p) % 10}`).join(', ') + '입니다.', `그러므로 ${places.map((p) => `${이름[p]} 모형 ${Math.floor(n / p) % 10}개`).join(', ')}를 놓습니다.`],
        concept: '같은 숫자라도 어느 자리에 있느냐에 따라 나타내는 값이 다릅니다.',
        misconception: '자리를 바꾸어 놓거나 0인 자리를 빠뜨리기 쉽습니다.',
        결: lv === 1 ? 1 : 0,
      };
    }
    if (종류 === 'add') {
      const a = 사이(next, 12, 48);
      const b = 사이(next, 11, 49 - (a % 10 > 5 ? 10 : 0));
      const 합 = a + b;
      if (합 > 99 || (a % 10) + (b % 10) < 10) return null;
      return {
        prompt: `${a}+${b}을(를) 수 모형으로 만들어 보세요. 일 모형이 10개가 되면 십 모형 1개로 바꾸어요.`,
        answer: String(합),
        manipulate: { kind: 'base-ten', places: [10, 1], target: 합 },
        tag: 'addition',
        strategy: '받아올림을 수 모형으로 하기',
        hint: `일 모형 ${a % 10}개와 ${b % 10}개를 모으면 10개가 넘어요. 10개는 십 모형 1개로 바꾸어요.`,
        steps: [`일 모형은 ${a % 10}+${b % 10}=${(a % 10) + (b % 10)}개이므로 10개를 십 모형 1개로 바꾸고 일 모형 ${(합) % 10}개가 남습니다.`, `십 모형은 ${Math.floor(a / 10)}+${Math.floor(b / 10)}+1=${Math.floor(합 / 10)}개입니다.`, `그러므로 십 모형 ${Math.floor(합 / 10)}개, 일 모형 ${합 % 10}개이고 ${a}+${b}=${합}입니다.`],
        concept: '같은 자리끼리 더하고, 10이 되면 윗자리로 받아올립니다.',
        misconception: '받아올린 1을 더하지 않기 쉽습니다.',
        결: lv === 0 ? 1 : 2,
      };
    }
    const 차 = 큰자리;
    // 하: 1만큼, 중: 2만큼, 상: 3만큼 몇십(몇백) 더 크거나 작은 수
    const m = 종류 === 'plus' ? n + 차 * (lv + 1) : n - 차 * (lv + 1);
    if (m < 최소 || m > 최대) return null;
    const 몇 = Math.abs(m - n) / 차;
    // 받아올림·받아내림이 생기지 않는 것만 둡니다.
    if (Math.floor(m / 차) % 10 !== (Math.floor(n / 차) % 10) + (종류 === 'plus' ? 몇 : -몇)) return null;
    void 자리;
    return {
      prompt: `${n}보다 ${몇 * 차}만큼 더 ${종류 === 'plus' ? '큰' : '작은'} 수를 수 모형으로 만들어 보세요.`,
      answer: String(m),
      manipulate: { kind: 'base-ten', places, target: m },
      tag: 'placeValue',
      strategy: '자릿값을 생각해 몇백(몇십) 큰 수 만들기',
      hint: `${몇 * 차}은(는) ${이름[차]} 모형 ${몇}개예요. ${n}을(를) 만든 다음 ${이름[차]} 모형만 바꾸어 보세요.`,
      steps: [`${n}을(를) 수 모형으로 나타냅니다.`, `${몇 * 차}만큼 더 ${종류 === 'plus' ? '크려면' : '작으려면'} ${이름[차]} 모형을 ${몇}개 ${종류 === 'plus' ? '더 놓습니다' : '덜어 냅니다'}.`, `그러므로 ${m}이(가) 됩니다 — 다른 자리 모형은 그대로입니다.`],
      concept: '몇백(몇십)만큼 크거나 작은 수는 그 자리의 숫자만 바뀝니다.',
      misconception: `${몇 * 차}을(를) 일 모형 ${몇}개로 생각하기 쉽습니다.`,
      결: lv === 0 ? 1 : 2,
    };
  },
});

// ── 그래프 ────────────────────────────────────────────────────────
const 주제들 = [
  { 제목: '좋아하는 과일', 항목: ['사과', '포도', '딸기', '귤', '배'], 단위: '명' },
  { 제목: '좋아하는 운동', 항목: ['축구', '줄넘기', '수영', '농구', '야구'], 단위: '명' },
  { 제목: '좋아하는 동물', 항목: ['강아지', '고양이', '토끼', '햄스터', '거북'], 단위: '명' },
  { 제목: '받은 칭찬 붙임딱지', 항목: ['민준', '서연', '도윤', '하은', '지호'], 단위: '장' },
];

export const 그래프그리기 = (style: 'bar' | 'stack' | 'line', step: number, 최대: number, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `graph-${style}-${step}-${최대}`,
  make: (seed) => {
    const next = 고르개(seed);
    if (style === 'line') {
      const 달 = ['3월', '4월', '5월', '6월', '7월'];
      const 시작 = 사이(next, 2, 6) * step;
      const values: number[] = [시작];
      for (let k = 1; k < 5; k += 1) values.push(Math.max(0, Math.min(최대, values[k - 1] + (next(3) - 1) * step * 사이(next, 1, 2))));
      if (new Set(values).size < 3) return null;
      const 글 = 달.map((d, k) => `${d} ${values[k]}권`).join(', ');
      return {
        prompt: `달마다 읽은 책 수입니다: ${글}. 마지막 두 달의 점을 끌어 올려 꺾은선그래프를 완성해 보세요.`,
        answer: '꺾은선그래프를 완성함',
        manipulate: { kind: 'bars', style, labels: 달, values, max: 최대, step, pre: [0, 1, 2], unitLabel: '권' },
        tag: 'data',
        strategy: '표를 보고 꺾은선그래프의 점 찍기',
        hint: `세로 눈금 한 칸은 ${step}권이에요. ${values[3]}은(는) 몇 칸인지 ${values[3]}÷${step}을(를) 해 보세요.`,
        steps: [`세로 눈금 한 칸의 크기는 ${step}권입니다.`, `6월은 ${values[3]}권이므로 ${values[3] / step}칸, 7월은 ${values[4]}권이므로 ${values[4] / step}칸 높이에 점을 찍습니다.`, '점을 차례로 선분으로 이으면 꺾은선그래프가 됩니다.'],
        concept: '꺾은선그래프는 시간에 따라 변하는 양을 점과 선으로 나타냅니다.',
        misconception: '눈금 한 칸을 1로 생각하고 칸 수를 값으로 읽기 쉽습니다.',
        결,
      };
    }
    const 주제 = 주제들[next(주제들.length)];
    const 항목 = 섞기(주제.항목, next).slice(0, 4);
    const values = 항목.map(() => 사이(next, 1, 최대 / step) * step);
    if (new Set(values).size < 3) return null;
    const pre = style === 'stack' ? [] : [0];
    const 글 = 항목.map((h, k) => `${h} ${values[k]}${주제.단위}`).join(', ');
    return {
      prompt: `${주제.제목}을(를) 조사했습니다: ${글}. ${style === 'stack' ? '○를 쌓아 그래프로 나타내어 보세요. 칸을 누르거나 끌어 올리면 ○가 쌓입니다.' : '막대 끝을 끌어 올려 막대그래프를 완성해 보세요.'}`,
      answer: `${style === 'stack' ? '그래프' : '막대그래프'}를 완성함`,
      manipulate: { kind: 'bars', style, labels: 항목, values, max: 최대, step, pre, unitLabel: 주제.단위 },
      tag: 'data',
      strategy: style === 'stack' ? '자료를 ○로 그래프에 나타내기' : '표를 보고 막대그래프 그리기',
      hint: step > 1 ? `세로 눈금 한 칸은 ${step}${주제.단위}이에요. 칸 수가 아니라 눈금의 수를 보고 맞추어요.` : '항목마다 수만큼 한 칸에 하나씩 올려요.',
      steps: [step > 1 ? `세로 눈금 한 칸의 크기는 ${step}${주제.단위}입니다.` : '세로 눈금 한 칸은 1입니다.', `${항목[1]}은(는) ${values[1]}${주제.단위}이므로 ${values[1] / step}칸 높이로 나타냅니다.`, '항목마다 수에 맞는 높이로 나타내면 가장 많은 것과 적은 것을 한눈에 알 수 있습니다.'],
      concept: '그래프는 자료의 많고 적음을 한눈에 알아보게 해 줍니다.',
      misconception: '눈금 한 칸의 크기를 확인하지 않고 칸 수를 그대로 수로 보기 쉽습니다.',
      결,
    };
  },
});

// ── 각 ────────────────────────────────────────────────────────────
export const 각그리기 = (종류: 'right' | 'deg' | 'acute' | 'obtuse' | 'sum' | 'tri' | 'quad'): 조작갈래 => ({
  id: `angle-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    if (종류 === 'right' && lv > 0) {
      // 중: 직각보다 작은 각, 상: 직각보다 큰 각(예각·둔각이라는 말을 배우기 전)
      const 작게 = lv === 1;
      return {
        prompt: `파란 변을 돌려 직각보다 ${작게 ? '작은' : '크고 일직선보다 작은'} 각을 만들어 보세요.`,
        answer: `직각보다 ${작게 ? '작은' : '큰'} 각`,
        manipulate: { kind: 'angle', range: 작게 ? [0, 90] : [90, 180], protractor: false },
        tag: 'shape',
        strategy: '직각과 견주어 각의 크기 비교하기',
        hint: '도움을 누르면 직각 자리를 점선으로 보여 줘요. 파란 변이 그 점선보다 안쪽이면 작은 각, 바깥쪽이면 큰 각이에요.',
        steps: ['각의 크기는 두 변이 벌어진 정도입니다.', '직각을 기준으로 두 변이 덜 벌어지면 직각보다 작고, 더 벌어지면 직각보다 큽니다.', `그러므로 파란 변을 직각보다 ${작게 ? '안쪽으로 좁게' : '바깥쪽으로 넓게'} 돌립니다.`],
        concept: '각의 크기는 변의 길이와 상관없이 두 변이 벌어진 정도로 정해집니다.',
        misconception: '변이 길면 각이 크다고 생각하기 쉽습니다.',
        결: lv === 2 ? 2 : 1,
      };
    }
    if (종류 === 'right') {
      return {
        prompt: '파란 변을 돌려 직각을 만들어 보세요.',
        answer: '직각',
        manipulate: { kind: 'angle', target: 90, protractor: false },
        tag: 'shape',
        strategy: '직각 만들기',
        hint: '삼각자의 직각 모서리나 종이를 반듯하게 두 번 접은 모서리를 떠올려 보세요. 두 변이 그렇게 꼭 맞게 만나야 해요.',
        steps: ['종이를 반듯하게 두 번 접었을 때 생기는 각을 직각이라고 합니다.', '아래 변과 파란 변이 똑바로 서서 만나도록 돌립니다.', '두 변이 기울지 않고 꼭 맞게 만나면 직각입니다.'],
        concept: '직각은 종이를 반듯하게 두 번 접었을 때 생기는 각입니다.',
        misconception: '조금이라도 기울면 직각이 아닙니다.',
        결: 0,
      };
    }
    if (종류 === 'acute' || 종류 === 'obtuse') {
      const 예 = 종류 === 'acute';
      return {
        prompt: `파란 변을 돌려 ${예 ? '예각' : '둔각'}을 만들어 보세요.`,
        answer: 예 ? '예각' : '둔각',
        manipulate: { kind: 'angle', range: 예 ? [0, 90] : [90, 180], protractor: false },
        tag: 'shape',
        strategy: `${예 ? '예각' : '둔각'} 만들기`,
        hint: '직각(90°)보다 좁은지 넓은지를 생각해요. 도움을 누르면 직각 자리를 점선으로 보여 줘요.',
        steps: ['각도가 0°보다 크고 직각보다 작은 각은 예각, 직각보다 크고 180°보다 작은 각은 둔각입니다.', `파란 변을 직각보다 ${예 ? '안쪽으로 좁게' : '바깥쪽으로 넓게'} 돌립니다.`, `그러면 ${예 ? '예각' : '둔각'}이 됩니다 — 꼭 90°나 180°가 되면 안 됩니다.`],
        concept: '예각은 0°보다 크고 직각보다 작은 각, 둔각은 직각보다 크고 180°보다 작은 각입니다.',
        misconception: '변의 길이가 길면 각이 크다고 생각하기 쉽습니다. 각의 크기는 벌어진 정도입니다.',
        결: 1,
      };
    }
    let target: number;
    let 말: string;
    let 걸음: [string, string];
    if (종류 === 'deg') {
      // 하: 몇십°인 예각, 중: 5° 단위 예각, 상: 둔각(반대쪽 눈금과 헷갈리기 쉬움)
      target = lv === 0 ? 사이(next, 2, 8) * 10 : lv === 1 ? 사이(next, 3, 17) * 5 : 사이(next, 19, 34) * 5;
      if (target === 90 || (lv === 1 && target % 10 === 0)) return null;
      말 = `${target}°인 각`;
      걸음 = ['각도기의 중심을 꼭짓점에, 밑금을 아래 변에 맞추었습니다.', `아래 변이 가리키는 0에서 시작하는 눈금을 따라 ${target}까지 갑니다.`];
    } else if (종류 === 'sum') {
      const a = lv === 0 ? 사이(next, 2, 6) * 10 : 사이(next, 4, 12) * 5;
      const b = lv === 0 ? 사이(next, 2, 6) * 10 : 사이(next, 4, 12) * 5;
      // 하: 몇십°끼리의 합, 중: 합 또는 차, 상: 차
      const 빼기 = lv === 0 ? false : lv === 2 ? a !== b : next(2) === 1 && a !== b;
      const [x, y] = 빼기 ? [Math.max(a, b), Math.min(a, b)] : [a, b];
      target = 빼기 ? x - y : x + y;
      if (target > 175 || target < 15) return null;
      말 = `${x}°와 ${y}°의 ${빼기 ? '차' : '합'}만큼의 각`;
      걸음 = [`${x}°${빼기 ? '-' : '+'}${y}°=${target}°입니다.`, `각도기에서 0에서 시작하는 눈금을 따라 ${target}까지 갑니다.`];
    } else if (종류 === 'quad') {
      // 하: 두 각이 직각, 중: 세 각이 모두 다름, 상: 세 각 가운데 하나를 '직각'이라는 말로 줌
      const a = lv === 0 ? 90 : 사이(next, 14, 26) * 5;
      const b = lv === 0 ? 90 : 사이(next, 14, 26) * 5;
      const c = lv === 2 ? 90 : lv === 0 ? 사이(next, 7, 30) * 5 : 사이(next, 12, 26) * 5;
      target = 360 - a - b - c;
      if (target < 30 || target > 170 || target === 90 || (lv === 1 && [a, b, c].includes(90))) return null;
      말 = lv === 2 ? `사각형의 세 각이 ${a}°, ${b}°, 직각일 때 나머지 한 각의 크기만큼의 각` : `사각형의 세 각이 ${a}°, ${b}°, ${c}°일 때 나머지 한 각의 크기만큼의 각`;
      걸음 = [`사각형의 네 각의 크기의 합은 360°이므로 나머지 한 각은 360°-${a}°-${b}°-${c}°=${target}°입니다.`, `각도기에서 0에서 시작하는 눈금을 따라 ${target}까지 갑니다.`];
    } else {
      const a = lv === 0 ? 사이(next, 3, 7) * 10 : 사이(next, 6, 14) * 5;
      const b = lv === 0 ? 사이(next, 3, 7) * 10 : 사이(next, 6, 14) * 5;
      target = 180 - a - b;
      if (lv === 2 && target <= 90) return null;
      if (target < 20 || target > 120) return null;
      말 = `삼각형의 두 각이 ${a}°, ${b}°일 때 나머지 한 각의 크기만큼의 각`;
      걸음 = [`삼각형의 세 각의 크기의 합은 180°이므로 나머지 한 각은 180°-${a}°-${b}°=${target}°입니다.`, `각도기에서 0에서 시작하는 눈금을 따라 ${target}까지 갑니다.`];
    }
    return {
      prompt: `각도기를 보며 파란 변을 돌려 ${말}을 만들어 보세요.`,
      answer: `${target}°`,
      manipulate: { kind: 'angle', target, protractor: true },
      tag: 'shape',
      strategy: 종류 === 'deg' ? '각도기로 각 그리기' : 종류 === 'sum' ? '각도의 합과 차를 구해 각 그리기' : 종류 === 'quad' ? '사각형의 네 각의 합을 이용하기' : '삼각형의 세 각의 합을 이용하기',
      hint: 종류 === 'quad'
        ? '사각형은 대각선 하나로 삼각형 2개로 나뉘어서 네 각의 합이 180°×2=360°예요. 360°에서 주어진 세 각을 차례로 빼 보세요.'
        : 종류 === 'tri'
          ? '삼각형의 세 각을 잘라 모으면 한 직선(180°)이 돼요. 180°에서 주어진 두 각을 차례로 빼 보세요.'
          : '각도기에는 눈금이 두 줄 있어요. 아래 변이 가리키는 쪽의 0에서 시작하는 줄(빨간 숫자)을 따라 읽어요.',
      steps: [...걸음, `그 눈금에 파란 변을 맞추면 ${target}°인 각이 됩니다 — 바깥 눈금과 안쪽 눈금을 바꾸어 읽으면 ${180 - target}°가 됩니다.`],
      concept: '각도기의 중심을 꼭짓점에, 밑금을 한 변에 맞추고 그 변의 0에서 시작하는 눈금을 읽습니다.',
      misconception: '각도기의 두 줄 눈금 가운데 반대쪽 줄을 읽기 쉽습니다.',
      결: 종류 === 'deg' ? (lv === 2 ? 2 : 1) : lv === 0 ? 1 : 2,
    };
  },
});

// ── 분류하기 ──────────────────────────────────────────────────────
type 물건 = { label: string; emoji?: string; bin: number };
const 분류문항 = (id: string, 만들기: (next: (n: number) => number, lv: 수준) => { prompt: string; bins: string[]; items: 물건[]; 기준: string; 결: 0 | 1 | 2; tag: 'classification' | 'solid' | 'shape' | 'number' | 'possibility' } | null): 조작갈래 => ({
  id: `sort-${id}`,
  make: (seed, lv = 0) => {
    const t = 만들기(고르개(seed), lv);
    if (!t) return null;
    return {
      prompt: t.prompt,
      answer: '모두 바르게 나눔',
      manipulate: { kind: 'sort-bins', bins: t.bins, items: t.items },
      tag: t.tag,
      strategy: '기준에 따라 분류하기',
      hint: `${t.기준} 하나씩 살펴보고 알맞은 칸에 넣어요. 물건을 누른 다음 칸을 누르면 옮겨져요.`,
      steps: [`분류하는 기준은 '${t.기준}'입니다.`, '물건을 하나씩 그 기준에 비추어 봅니다.', `${t.items.map((it) => `${it.label}은(는) ${t.bins[it.bin]}`).slice(0, 3).join(', ')}처럼 기준에 맞는 칸에 넣습니다.`],
      concept: '분류는 분명한 기준에 따라 나누는 것입니다. 누가 나누어도 결과가 같아야 합니다.',
      misconception: '기준이 아닌 다른 특징(색, 크기)을 보고 나누기 쉽습니다.',
      결: lv === 2 ? 2 : t.결,
    };
  },
});

const 뽑기 = <T,>(items: T[], k: number, next: (n: number) => number) => 섞기(items, next).slice(0, k);

export const 입체모양분류 = 분류문항('solid-1', (next, lv) => {
  const 모두: 물건[] = [
    { label: '선물 상자', emoji: '🎁', bin: 0 }, { label: '주사위', emoji: '🎲', bin: 0 }, { label: '우유갑', emoji: '🧃', bin: 0 }, { label: '책', emoji: '📕', bin: 0 },
    { label: '통조림', emoji: '🥫', bin: 1 }, { label: '북', emoji: '🥁', bin: 1 }, { label: '건전지', emoji: '🔋', bin: 1 }, { label: '양초', emoji: '🕯️', bin: 1 },
    { label: '축구공', emoji: '⚽', bin: 2 }, { label: '농구공', emoji: '🏀', bin: 2 }, { label: '구슬', emoji: '🔮', bin: 2 }, { label: '귤', emoji: '🍊', bin: 2 },
  ];
  const items = [0, 1, 2].flatMap((b) => 뽑기(모두.filter((it) => it.bin === b), 2 + lv, next));
  return { prompt: '물건을 같은 모양끼리 모아 보세요.', bins: ['상자 모양', '둥근기둥 모양', '공 모양'], items: 섞기(items, next), 기준: '물건의 모양', 결: 0, tag: 'solid' };
});

export const 평면모양분류 = 분류문항('plane-1', (next, lv) => {
  const 모두: 물건[] = [
    { label: '공책', emoji: '📓', bin: 0 }, { label: '액자', emoji: '🖼️', bin: 0 }, { label: '창문', emoji: '🪟', bin: 0 },
    { label: '삼각김밥', emoji: '🍙', bin: 1 }, { label: '조각 피자', emoji: '🍕', bin: 1 }, { label: '삼각 깃발', emoji: '🚩', bin: 1 },
    { label: '동전', emoji: '🪙', bin: 2 }, { label: '시계', emoji: '🕒', bin: 2 }, { label: '접시', emoji: '🍽️', bin: 2 },
  ];
  const items = [0, 1, 2].flatMap((b) => 뽑기(모두.filter((it) => it.bin === b), 2 + lv, next));
  return { prompt: '물건의 본을 떴을 때 나오는 모양끼리 모아 보세요.', bins: ['■ 모양', '▲ 모양', '● 모양'], items: 섞기(items, next), 기준: '본뜬 모양', 결: 1, tag: 'shape' };
});

export const 동물분류 = 분류문항('animals', (next, lv) => {
  const 기준들 = [
    { 기준: '다리의 수', bins: ['다리가 2개', '다리가 4개'], 모두: [['닭', '🐔', 0], ['오리', '🦆', 0], ['펭귄', '🐧', 0], ['타조', '🦤', 0], ['강아지', '🐶', 1], ['고양이', '🐱', 1], ['돼지', '🐷', 1], ['소', '🐮', 1], ['코끼리', '🐘', 1]] },
    { 기준: '사는 곳', bins: ['물에서 사는 것', '땅에서 사는 것'], 모두: [['물고기', '🐟', 0], ['문어', '🐙', 0], ['고래', '🐳', 0], ['상어', '🦈', 0], ['토끼', '🐰', 1], ['사자', '🦁', 1], ['말', '🐴', 1], ['다람쥐', '🐿️', 1]] },
    { 기준: '날개가 있는지', bins: ['날개가 있는 것', '날개가 없는 것'], 모두: [['참새', '🐦', 0], ['나비', '🦋', 0], ['벌', '🐝', 0], ['독수리', '🦅', 0], ['곰', '🐻', 1], ['뱀', '🐍', 1], ['개구리', '🐸', 1], ['원숭이', '🐵', 1]] },
  ] as const;
  const g = 기준들[next(기준들.length)];
  const 모두 = g.모두.map(([label, emoji, bin]) => ({ label, emoji, bin }) as 물건);
  const items = [0, 1].flatMap((b) => 뽑기(모두.filter((it) => it.bin === b), 2 + lv, next));
  return { prompt: `${g.기준}에 따라 동물을 분류해 보세요.`, bins: [...g.bins], items: 섞기(items, next), 기준: g.기준, 결: 1, tag: 'classification' };
});

export const 수분류 = (종류: 'even' | 'divisor' | 'multiple' | 'range-ge' | 'range-gt'): 조작갈래 => 분류문항(`num-${종류}`, (next, lv) => {
  if (종류 === 'even') {
    // 하: 20까지 6개, 중: 50까지 8개, 상: 99까지 10개
    const ns = 뽑기(Array.from({ length: [20, 50, 99][lv] }, (_, k) => k + 1), 6 + 2 * lv, next);
    if (ns.filter((n) => n % 2 === 0).length < 2 || ns.filter((n) => n % 2).length < 2) return null;
    return { prompt: '수를 짝수와 홀수로 나누어 보세요.', bins: ['짝수', '홀수'], items: ns.map((n) => ({ label: String(n), bin: n % 2 ? 1 : 0 })), 기준: '둘씩 짝을 지을 수 있는지(일의 자리 숫자)', 결: 1, tag: 'number' };
  }
  if (종류 === 'divisor' || 종류 === 'multiple') {
    const 기준수 = 종류 === 'divisor' ? [[8, 10, 12], [12, 16, 18, 20], [24, 30, 36]][lv][next(3)] : [사이(next, 2, 4), 사이(next, 4, 6), 사이(next, 6, 9)][lv];
    const 후보 = 종류 === 'divisor' ? Array.from({ length: 기준수 }, (_, k) => k + 1) : Array.from({ length: [30, 50, 80][lv] }, (_, k) => k + 1);
    const 맞음 = (n: number) => (종류 === 'divisor' ? 기준수 % n === 0 : n % 기준수 === 0);
    const 예 = 뽑기(후보.filter(맞음), 3 + (lv === 2 ? 1 : 0), next);
    const 아니오 = 뽑기(후보.filter((n) => !맞음(n)), 3 + lv, next);
    const 말 = 종류 === 'divisor' ? `${기준수}의 약수` : `${기준수}의 배수`;
    return { prompt: `수를 ${말}인 것과 아닌 것으로 나누어 보세요.`, bins: [말, `${말}가 아닌 수`], items: 섞기([...예.map((n) => ({ label: String(n), bin: 0 })), ...아니오.map((n) => ({ label: String(n), bin: 1 }))], next), 기준: 종류 === 'divisor' ? `${기준수}을(를) 나누어떨어지게 하는지` : `${기준수}을(를) 몇 배 한 수인지`, 결: 1, tag: 'number' };
  }
  const 경계 = [사이(next, 12, 30), 사이(next, 30, 70), 사이(next, 100, 400)][lv];
  const 이상 = 종류 === 'range-ge';
  // 상에서는 경계에 1만큼 가까운 수를 더 넣어 헷갈리게 합니다.
  const ns = [...new Set([경계, 경계 - 사이(next, 1, 5), 경계 + 사이(next, 1, 5), 경계 - 사이(next, 6, 9), 경계 + 사이(next, 6, 9), 경계 + 10, ...(lv === 2 ? [경계 - 1, 경계 + 1] : [])])];
  // 1-2차시는 이상·이하만 배웠으므로 '미만'을 쓰지 않습니다.
  const bins = 이상 ? [`${경계} 이상인 수`, `${경계} 이상이 아닌 수`] : [`${경계} 초과인 수`, `${경계} 이하인 수`];
  return {
    prompt: `수를 ${bins[0]}와 ${bins[1]}로 나누어 보세요.`,
    bins,
    items: 섞기(ns.map((n) => ({ label: String(n), bin: 이상 ? (n >= 경계 ? 0 : 1) : (n > 경계 ? 0 : 1) })), next),
    기준: 이상 ? `${경계}과(와) 같거나 큰지` : `${경계}보다 큰지`,
    결: lv === 0 ? 1 : 2,
    tag: 'number',
  };
});

export const 가능성분류 = 분류문항('chance', (next, lv) => {
  const 모두: 물건[] = [
    { label: '주사위를 굴리면 7의 눈이 나온다', bin: 0 }, { label: '1월 다음에 3월이 온다', bin: 0 }, { label: '흰 바둑돌만 든 주머니에서 검은 돌을 꺼낸다', bin: 0 },
    { label: '동전을 던지면 그림 면이 나온다', bin: 1 }, { label: '주사위를 굴리면 짝수의 눈이 나온다', bin: 1 }, { label: '흰 돌 1개, 검은 돌 1개 가운데 흰 돌을 꺼낸다', bin: 1 },
    { label: '내일 아침에 해가 동쪽에서 뜬다', bin: 2 }, { label: '주사위를 굴리면 6 이하의 눈이 나온다', bin: 2 }, { label: '빨간 공만 든 상자에서 빨간 공을 꺼낸다', bin: 2 },
  ];
  const items = [0, 1, 2].flatMap((b) => 뽑기(모두.filter((it) => it.bin === b), 2 + lv, next));
  return { prompt: '일이 일어날 가능성에 알맞게 나누어 보세요.', bins: ['불가능하다', '반반이다', '확실하다'], items: 섞기(items, next), 기준: '일이 일어날 가능성', 결: 1, tag: 'possibility' };
});

/** 띠그래프·원그래프(6-1 5단원): 20칸으로 나눈 띠(원)에 백분율만큼 칠하기 */
export const 비율그래프칠하기 = (모양: 'bar' | 'circle'): 조작갈래 => ({
  id: `ratio-graph-${모양}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 칸 = 사이(next, 2, 15);
    const 퍼센트 = 칸 * 5;
    const 항목 = ['축구', '피구', '줄넘기', '수영', '농구'][next(5)];
    // 하: 20명(한 칸이 한 명), 중: 40명·60명, 상: 80명·120명
    const 전체 = lv === 0 ? 20 : lv === 1 ? [40, 60][next(2)] : [80, 120][next(2)];
    const 명 = (전체 * 퍼센트) / 100;
    if (!Number.isInteger(명)) return null;
    const 말 = 모양 === 'bar' ? '띠그래프' : '원그래프';
    return {
      prompt: `학생 ${전체}명 가운데 ${명}명이 ${항목}을(를) 좋아합니다. 전체를 20칸으로 똑같이 나눈 ${말}에 ${항목}이(가) 차지하는 만큼 색칠해 보세요.`,
      answer: `20칸 가운데 ${칸}칸(${퍼센트}%)`,
      manipulate: { kind: 'tap-fill', layout: 모양, parts: 20, pre: [], target: 칸 },
      tag: 'ratio',
      strategy: `백분율을 구해 ${말}에 나타내기`,
      hint: `먼저 ${명}÷${전체}×100으로 백분율을 구하세요. 20칸 가운데 한 칸은 5%입니다.`,
      steps: [`${항목}의 백분율은 ${명}÷${전체}×100=${퍼센트}(%)입니다.`, '20칸으로 나누었으므로 한 칸은 100÷20=5(%)입니다.', `${퍼센트}÷5=${칸}이므로 ${칸}칸을 색칠합니다.`],
      concept: `${말}는 전체를 100%로 보고 각 항목이 차지하는 비율을 나타낸 그래프입니다.`,
      misconception: '사람 수를 그대로 칸 수로 칠하기 쉽습니다. 먼저 백분율로 바꾸어야 합니다.',
      결: lv === 0 ? 1 : 2,
      실수: [
        ...(명 <= 20 && 명 !== 칸 ? [{ state: 앞칸들(명), 말: `학생 수 ${명}명을 그대로 ${명}칸으로 칠했습니다. 먼저 백분율을 구하고, 20칸으로 나누었으니 한 칸이 5%임을 생각해야 합니다.` }] : []),
        ...(퍼센트 <= 20 && 퍼센트 !== 칸 ? [{ state: 앞칸들(퍼센트), 말: `백분율 ${퍼센트}%를 그대로 ${퍼센트}칸으로 칠했습니다. 전체가 20칸이므로 한 칸은 5%입니다.` }] : []),
        // 100칸 모눈처럼 한 칸을 10%로 보는 실수입니다(65%면 6칸쯤).
        ...(퍼센트 >= 10 && Math.floor(퍼센트 / 10) !== 칸 ? [{ state: 앞칸들(Math.floor(퍼센트 / 10)), 말: `한 칸을 10%로 생각해 ${퍼센트}%를 ${Math.floor(퍼센트 / 10)}칸${퍼센트 % 10 ? '쯤' : ''}으로 칠했습니다. 전체 100%를 20칸으로 나누었으니 한 칸은 5%입니다.` }] : []),
      ],
    };
  },
});
