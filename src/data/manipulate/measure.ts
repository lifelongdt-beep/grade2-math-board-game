import { 고르개, 사이, type 조작갈래 } from './common';
import { 길이말, 시각말 } from './check';

// ════════════════════════════════════════════════════════════════════
// 자로 재기·긋기, 컴퍼스, 시계 바늘 맞추기
// ────────────────────────────────────────────────────────────────────
// 아이들이 자로 잴 때 가장 많이 하는 실수는 0이 아니라 1(또는 자의 끝)에
// 맞추는 것이고, 시계에서는 몇 시 30분에도 짧은바늘을 숫자에 딱 맞추는
// 것입니다. 그래서 자는 0이 가장자리보다 안쪽에 있게 그리고, 시계의
// 짧은바늘은 두 숫자 사이 어디에나 놓을 수 있게 했습니다.
// ════════════════════════════════════════════════════════════════════

const 물건들 = ['연필', '색연필', '크레파스', '지우개', '머리핀', '빨대', '리본', '막대'];

/** 자를 밀어 0을 맞추고 끝 눈금을 눌러 길이를 잽니다. */
export const 자로재기 = (unit: 'cm' | 'mm', 범위: [number, number], 결: 0 | 1 | 2 = 0): 조작갈래 => ({
  id: `ruler-measure-${unit}-${범위.join('-')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const item = 물건들[next(물건들.length)];
    const objectMm = unit === 'cm' ? 사이(next, 범위[0], 범위[1]) * 10 : 사이(next, 범위[0], 범위[1]);
    if (unit === 'mm' && objectMm % 10 === 0) return null;
    const objectStartMm = 사이(next, 2, 6) * 10 + (unit === 'mm' ? 사이(next, 0, 9) : 0);
    const rulerCm = objectMm > 95 ? 15 : objectMm > 70 ? 12 : 10;
    const 길이 = 길이말(objectMm, unit);
    return {
      prompt: `자를 밀어 0 눈금을 ${item}의 왼쪽 끝에 맞추고, ${item}의 오른쪽 끝에 닿는 눈금을 눌러 길이를 재어 보세요.`,
      answer: 길이,
      manipulate: { kind: 'ruler-measure', unit, objectMm, objectStartMm, item, rulerCm },
      tag: 'measurement',
      strategy: unit === 'mm' ? '자로 몇 cm 몇 mm 재기' : '자로 길이 재기',
      hint: `자의 1이 아니라 0 눈금을 ${item}의 끝에 맞추어요. 자의 끝(가장자리)과 0 눈금은 같은 곳이 아니에요.`,
      steps: [
        `자의 0 눈금을 ${item}의 왼쪽 끝에 맞춥니다.`,
        `${item}의 오른쪽 끝이 닿는 눈금을 읽습니다${unit === 'mm' ? ' — 큰 눈금으로 cm를, 작은 눈금으로 mm를 셉니다' : ''}.`,
        `0에서 시작했으므로 오른쪽 끝의 눈금이 곧 길이예요. ${item}의 길이는 ${길이}입니다.`,
      ],
      concept: '길이를 잴 때는 물건의 한끝을 자의 눈금 0에 맞추고, 다른 끝의 눈금을 읽습니다.',
      misconception: '자의 1이나 자의 가장자리에 맞추면 길이가 달라집니다.',
      selfCheck: '0 눈금이 물건의 끝과 딱 맞았는지 다시 보았나요?',
      결,
    };
  },
});

/** 자 위에서 연필 끝을 끌어 정해진 길이만큼 긋습니다. from은 시작 눈금(cm)입니다. */
export const 자로긋기 = (from0: boolean, 범위: [number, number], 결: 0 | 1 | 2 = 0): 조작갈래 => ({
  id: `ruler-draw-${from0 ? 0 : 'k'}-${범위.join('-')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const len = 사이(next, 범위[0], 범위[1]);
    const from = from0 ? 0 : 사이(next, 1, 4);
    if (from + len > 10) return null;
    return {
      prompt: from0
        ? `자의 0 눈금에서 시작하여 길이가 ${len} cm인 선을 그으려고 합니다. 연필 끝(◆)을 끌어 선을 그어 보세요.`
        : `자의 ${from} cm 눈금에서 시작하여 길이가 ${len} cm인 선을 그으려고 합니다. 연필 끝(◆)을 끌어 선을 그어 보세요.`,
      answer: `${from + len} cm 눈금까지 그은 ${len} cm`,
      manipulate: { kind: 'ruler-draw', tool: 'pencil', unit: 'cm', fromMm: from * 10, lengthMm: len * 10, rulerCm: 10 },
      tag: 'measurement',
      strategy: from0 ? '자로 정해진 길이만큼 선 긋기' : '0이 아닌 눈금에서 시작해 길이만큼 긋기',
      hint: from0 ? '0에서 1 cm, 2 cm… 한 칸씩 세며 끝을 옮겨요.' : `${from}에서 시작했으니 끝 눈금은 ${len}이(가) 아니에요. 1 cm 칸을 하나씩 세어 보세요.`,
      steps: [
        `선은 자의 ${from} 눈금에서 시작합니다.`,
        `1 cm인 칸을 ${len}번 셉니다.`,
        from0 ? `0에서 ${len}칸을 가면 ${len} 눈금이므로 ${len} 눈금까지 긋습니다.` : `${from} 눈금에서 ${len}칸을 더 가면 ${from}+${len}=${from + len} 눈금이므로 ${from + len} 눈금까지 그어야 ${len} cm입니다.`,
      ],
      concept: '길이는 시작한 눈금에서 1 cm가 몇 번 들어가는지로 셉니다.',
      misconception: `시작이 0이 아닐 때 끝 눈금(${len})을 그대로 길이로 생각하기 쉽습니다.`,
      결,
    };
  },
});

/** 컴퍼스를 반지름만큼 벌립니다. 지름을 주면 반지름을 먼저 구해야 합니다. */
export const 컴퍼스 = (지름으로: boolean): 조작갈래 => ({
  id: `compass-${지름으로 ? 'd' : 'r'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const r = 사이(next, 2, 6);
    const 말 = 지름으로 ? `지름이 ${r * 2} cm인 원` : `반지름이 ${r} cm인 원`;
    return {
      prompt: `${말}을 그리려고 합니다. 컴퍼스의 침을 자의 0 눈금에 꽂고, 연필 쪽 다리(✎)를 끌어 알맞게 벌려 보세요.`,
      answer: `${r} cm만큼 벌림`,
      manipulate: { kind: 'ruler-draw', tool: 'compass', unit: 'cm', fromMm: 0, lengthMm: r * 10, rulerCm: 10 },
      tag: 'shape',
      strategy: 지름으로 ? '지름을 보고 반지름만큼 컴퍼스 벌리기' : '반지름만큼 컴퍼스 벌리기',
      hint: 지름으로 ? '컴퍼스는 반지름만큼 벌려요. 지름은 반지름의 몇 배인지 떠올려 보세요.' : '컴퍼스를 벌린 길이가 원의 반지름이 돼요.',
      steps: [
        '컴퍼스의 침은 원의 중심이 되고, 벌린 길이는 반지름이 됩니다.',
        지름으로 ? `지름은 반지름의 2배이므로 반지름은 ${r * 2}÷2=${r}(cm)입니다.` : `반지름은 ${r} cm입니다.`,
        `그러므로 컴퍼스를 ${r} cm만큼 벌려야 ${말}을 그릴 수 있습니다.`,
      ],
      concept: '컴퍼스를 벌린 길이는 원의 반지름입니다. 지름은 반지름의 2배입니다.',
      misconception: '지름만큼 벌리면 원이 2배로 커집니다.',
      결: 지름으로 ? 2 : 0,
    };
  },
});

// ── 시계 ──────────────────────────────────────────────────────────
type 시각문제 = { 말: string; h: number; m: number; 걸음: string[]; 결: 0 | 1 | 2; strategy: string };

const 시계문항 = (id: string, step: number, 만들기: (next: (n: number) => number) => 시각문제 | null): 조작갈래 => ({
  id: `clock-${id}`,
  make: (seed) => {
    const t = 만들기(고르개(seed));
    if (!t) return null;
    // 처음 모습(12시)과 같으면 아무것도 하지 않아도 맞으므로 뺍니다.
    if (t.h % 12 === 0 && t.m === 0) return null;
    const 시각 = 시각말(t.h, t.m);
    return {
      prompt: `${t.말} 시계에 나타내 보세요. 시곗바늘을 끌어 돌릴 수 있습니다.`,
      answer: 시각,
      manipulate: { kind: 'clock', h: t.h, m: t.m, step },
      tag: 'time',
      strategy: t.strategy,
      hint: t.m === 0 ? '몇 시일 때 긴바늘은 12를 가리키고, 짧은바늘이 시를 가리켜요.' : t.m === 30 ? '몇 시 30분일 때 긴바늘은 6을 가리키고, 짧은바늘은 두 숫자의 가운데에 있어요.' : '긴바늘은 숫자 하나에 5분씩 세어 맞추고, 짧은바늘은 지나온 숫자와 다음 숫자 사이에 두어요.',
      steps: [
        ...t.걸음,
        `긴바늘은 ${t.m === 0 ? '12' : t.m % 5 === 0 ? `${t.m / 5}` : `${Math.floor(t.m / 5)}에서 작은 눈금 ${t.m % 5}칸 더 간 곳`}을(를) 가리키게 합니다.`,
        t.m === 0 ? `짧은바늘은 ${t.h}을(를) 가리키게 하여 ${시각}을 나타냅니다.` : `짧은바늘은 ${t.h}과(와) ${(t.h % 12) + 1} 사이에 두어 ${시각}을 나타냅니다 — ${t.m}분만큼 다음 숫자 쪽으로 가 있습니다.`,
      ].slice(-3) as [string, string, string],
      concept: '긴바늘은 분을, 짧은바늘은 시를 나타냅니다. 짧은바늘은 긴바늘이 도는 만큼 조금씩 다음 숫자로 갑니다.',
      misconception: '몇 시 몇 분에도 짧은바늘을 숫자에 딱 맞추거나, 긴바늘이 가리키는 숫자를 그대로 분으로 읽기 쉽습니다.',
      selfCheck: '짧은바늘이 지나온 숫자가 시와 같은지 보았나요?',
      결: t.결,
    };
  },
});

export const 몇시 = (결: 0 | 1 | 2 = 0) => 시계문항(`hour-${결}`, 30, (next) => {
  const h = 사이(next, 1, 11);
  if (결 === 2) {
    const 처음 = 사이(next, 1, 10);
    return { 말: `지금은 ${처음}시입니다. 긴바늘이 한 바퀴 돈 뒤의 시각을`, h: 처음 + 1, m: 0, 걸음: [`긴바늘이 한 바퀴 돌면 1시간이 지나 ${처음 + 1}시가 됩니다.`], 결, strategy: '긴바늘이 한 바퀴 돈 뒤의 시각 나타내기' };
  }
  return { 말: `${h}시를`, h, m: 0, 걸음: [`${h}시입니다.`], 결, strategy: '몇 시를 시계에 나타내기' };
});

export const 몇시반 = (결: 0 | 1 | 2 = 0) => 시계문항(`half-${결}`, 30, (next) => {
  const h = 사이(next, 1, 11);
  if (결 === 2) {
    return { 말: `지금은 ${h}시입니다. 30분이 지난 뒤의 시각을`, h, m: 30, 걸음: [`${h}시에서 30분이 지나면 ${h}시 30분입니다.`], 결, strategy: '30분 뒤의 시각 나타내기' };
  }
  return { 말: `${h}시 30분을`, h, m: 30, 걸음: [`${h}시 30분입니다.`], 결, strategy: '몇 시 30분을 시계에 나타내기' };
});

export const 몇분 = (단위: 5 | 1, 결: 0 | 1 | 2 = 0) => 시계문항(`min-${단위}-${결}`, 단위, (next) => {
  const h = 사이(next, 1, 11);
  // 상은 짧은바늘이 다음 숫자에 바짝 다가가는 시각(50분대)으로 냅니다.
  const m = 결 === 2 ? 사이(next, 50, 58) : 단위 === 5 ? 사이(next, 1, 11) * 5 : 사이(next, 1, 59);
  const mm = 단위 === 5 ? Math.round(m / 5) * 5 : m;
  if (mm === 0 || mm === 30 || mm >= 60) return null;
  return { 말: `${h}시 ${mm}분을`, h, m: mm, 걸음: [`${h}시 ${mm}분입니다.`], 결, strategy: '몇 시 몇 분을 시계에 나타내기' };
});

export const 몇분전 = 시계문항('before', 5, (next) => {
  const h = 사이(next, 2, 11);
  const 전 = [5, 10, 15][next(3)];
  return { 말: `${h}시 ${전}분 전을`, h: h - 1, m: 60 - 전, 걸음: [`${h}시 ${전}분 전은 ${h}시가 되기 ${전}분 전이므로 ${h - 1}시 ${60 - 전}분입니다.`], 결: 1, strategy: '몇 시 몇 분 전을 시계에 나타내기' };
});

/** 지금 시각에서 얼마가 지난 뒤의 시각입니다. 분은 5분 단위입니다. */
export const 지난시각 = (최대분: number, 결: 0 | 1 | 2, 이야기 = true) => 시계문항(`after-${최대분}-${결}`, 5, (next) => {
  const h = 사이(next, 1, 9);
  const m = 사이(next, 0, 11) * 5;
  const 지남 = 결 === 0 ? 60 : 사이(next, 2, 최대분 / 5) * 5;
  const 끝 = h * 60 + m + 지남;
  const eh = Math.floor(끝 / 60);
  const em = 끝 % 60;
  if (eh > 11) return null;
  const 지남말 = 지남 >= 60 ? `${Math.floor(지남 / 60)}시간${지남 % 60 ? ` ${지남 % 60}분` : ''}` : `${지남}분`;
  const 일 = ['책을 읽었습니다', '줄넘기를 했습니다', '그림을 그렸습니다', '피아노를 쳤습니다'][next(4)];
  const 말 = 이야기
    ? `${시각말(h, m)}에 시작하여 ${지남말} 동안 ${일}. 끝난 시각을`
    : `${시각말(h, m)}에서 ${지남말}이(가) 지난 시각을`;
  return {
    말,
    h: eh,
    m: em,
    걸음: [`${시각말(h, m)}에서 ${지남말}이(가) 지나면 ${시각말(eh, em)}입니다${m + (지남 % 60) >= 60 ? ' — 60분이 넘으면 1시간이 늘어납니다' : ''}.`],
    결,
    strategy: '걸린 시간이 지난 뒤의 시각 나타내기',
  };
});
