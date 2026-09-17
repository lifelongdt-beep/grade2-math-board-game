import type { FractionModelVisual } from '../../../types';
import type { G5Family } from '../build';
import { asFractionText, mulDecimal, mulDecimalKeepingZeros, placesOf, shiftPoint, withoutPoint } from '../decimal';
import { eul, eun, euro, gwa, i as iJosa, particleOf, pick, rand } from '../util';

// ════════════════════════════════════════════════════════════════════
// 4단원 2~7차시 소수의 곱셈
// ────────────────────────────────────────────────────────────────────
// 지도서의 차시가 곱하는 두 수의 종류로 나뉩니다.
//   2 (1보다 작은 소수)×(자연수)   3 (1보다 큰 소수)×(자연수)
//   4 (자연수)×(1보다 작은 소수)   5 (자연수)×(1보다 큰 소수)
//   6 (1보다 작은 소수)×(1보다 작은 소수)
//   7 (1보다 큰 소수)×(1보다 큰 소수)
//
// 지도서가 가르치는 계산 방법은 둘입니다. 둘 다 풀이에 적습니다.
//   ① 소수를 분수로 고쳐 계산한다 (4.2×1.6 = 42/10 × 16/10 = 672/100)
//   ② 자연수의 곱셈을 이용한다 (42×16=672, 곱해지는 수가 1/10배,
//      곱하는 수가 1/10배이므로 결과는 1/100배)
//
// 오답은 이 단원에서 가장 흔한 잘못으로 만듭니다 — 소수점 자리를 한 칸
// 틀리게 찍기, 아예 찍지 않기(자연수의 곱), 곱셈을 덧셈으로 하기.
// ════════════════════════════════════════════════════════════════════

export type DecimalKind =
  | 'small-whole'   // (1보다 작은 소수)×(자연수)
  | 'big-whole'     // (1보다 큰 소수)×(자연수)
  | 'whole-small'   // (자연수)×(1보다 작은 소수)
  | 'whole-big'     // (자연수)×(1보다 큰 소수)
  | 'small-small'   // (1보다 작은 소수)×(1보다 작은 소수)
  | 'big-big';      // (1보다 큰 소수)×(1보다 큰 소수)

export const decimalKindName: Record<DecimalKind, string> = {
  'small-whole': '(1보다 작은 소수)×(자연수)',
  'big-whole': '(1보다 큰 소수)×(자연수)',
  'whole-small': '(자연수)×(1보다 작은 소수)',
  'whole-big': '(자연수)×(1보다 큰 소수)',
  'small-small': '(1보다 작은 소수)×(1보다 작은 소수)',
  'big-big': '(1보다 큰 소수)×(1보다 큰 소수)',
};

const 작은소수 = (next: (bound: number) => number) => {
  const 자리 = 1 + next(2); // 소수 한 자리 또는 두 자리
  if (자리 === 1) return `0.${1 + next(9)}`;
  return `0.${next(10)}${1 + next(9)}`;
};

const 큰소수 = (next: (bound: number) => number) => {
  const 자리 = 1 + next(2);
  const 정수 = 1 + next(8);
  if (자리 === 1) return `${정수}.${1 + next(9)}`;
  return `${정수}.${next(10)}${1 + next(9)}`;
};

export const decimalOperands = (kind: DecimalKind, seed: number): { left: string; right: string } => {
  const next = rand(seed);
  const 자연수 = () => String(2 + next(8));
  if (kind === 'small-whole') return { left: 작은소수(next), right: 자연수() };
  if (kind === 'big-whole') return { left: 큰소수(next), right: 자연수() };
  if (kind === 'whole-small') return { left: 자연수(), right: 작은소수(next) };
  if (kind === 'whole-big') return { left: 자연수(), right: 큰소수(next) };
  if (kind === 'small-small') {
    // 두 수 모두 소수 한 자리이면 모눈 100칸 그림으로 보일 수 있습니다
    // (지도서 6차시의 그림). 그림이 붙는 쪽이 자주 나오게 합니다.
    if (next(5) < 3) return { left: `0.${1 + next(9)}`, right: `0.${1 + next(9)}` };
    return { left: 작은소수(next), right: 작은소수(next) };
  }
  return { left: 큰소수(next), right: 큰소수(next) };
};

/** 지도서가 가르치는 두 가지 계산 방법을 풀이로 적습니다. */
export const decimalSteps = (left: string, right: string): string[] => {
  const answer = mulDecimal(left, right);
  const 자리 = placesOf(left) + placesOf(right);
  const 자연수곱 = `${withoutPoint(left)} × ${withoutPoint(right)} = ${Number(withoutPoint(left)) * Number(withoutPoint(right))}`;
  const lines: string[] = [];

  if (placesOf(left) > 0 && placesOf(right) > 0) {
    lines.push(`소수를 분수로 고치면 ${left} × ${right} = ${asFractionText(left)} × ${asFractionText(right)}입니다.`);
  } else if (placesOf(left) > 0) {
    lines.push(`소수를 분수로 고치면 ${left} × ${right} = ${asFractionText(left)} × ${right}입니다.`);
  } else {
    lines.push(`소수를 분수로 고치면 ${left} × ${right} = ${left} × ${asFractionText(right)}입니다.`);
  }

  lines.push(`소수점을 지우고 자연수끼리 곱하면 ${자연수곱}입니다.`);
  // 자리 수를 늘 더해서 말합니다. '두 수 모두 1개'처럼 줄여 쓰면
  // 0.9 × 7처럼 한쪽이 자연수일 때 거짓말이 됩니다.
  lines.push(
    `곱하는 두 수의 소수점 아래 자리 수를 더하면 ${placesOf(left)} + ${placesOf(right)} = ${자리}이므로, 곱의 소수점 아래 자리 수도 ${자리}입니다.`,
  );
  // 0.5 × 0.04처럼 끝자리가 0이 되는 곱이 있습니다. 규칙대로 찍으면
  // 0.020인데 적을 때는 0.02입니다. 이 한 줄이 없으면 바로 앞 줄과
  // 마지막 줄의 자리 수가 어긋나 보입니다.
  const 자리대로 = mulDecimalKeepingZeros(left, right);
  if (자리대로 !== answer) {
    lines.push(`소수점 아래 ${자리} 자리로 찍으면 ${자리대로}입니다. 끝자리의 0은 지워도 크기가 같으므로 ${euro(answer)} 씁니다.`);
  }
  lines.push(`그러므로 ${left} × ${right} = ${answer}입니다.`);
  return lines;
};

/** 소수점 자리를 틀리게 찍은 값 등 이 단원에서 흔한 잘못입니다. */
export const decimalWrongs = (left: string, right: string): string[] => {
  const answer = mulDecimal(left, right);
  return [
    // 소수점을 한 칸 오른쪽으로 잘못 찍음(자리 수를 하나 덜 셈)
    shiftPoint(answer, 1),
    // 소수점을 한 칸 왼쪽으로 잘못 찍음(자리 수를 하나 더 셈)
    shiftPoint(answer, -1),
    // 소수점을 아예 찍지 않음(자연수의 곱)
    String(Number(withoutPoint(left)) * Number(withoutPoint(right))),
    // 곱셈을 덧셈으로
    String(Number(left) + Number(right)),
  ];
};

/** 1보다 작은 소수끼리의 곱은 모눈 그림으로 보입니다(지도서 6차시). */
export const decimalArea = (left: string, right: string): FractionModelVisual | undefined => {
  if (placesOf(left) !== 1 || placesOf(right) !== 1) return undefined;
  if (Number(left) >= 1 || Number(right) >= 1) return undefined;
  return {
    kind: 'fraction-model',
    label: '가로와 세로로 나눈 모눈',
    shape: 'area',
    denominator: 10,
    numerator: Math.round(Number(right) * 10),
    columns: 10,
    shadedColumns: Math.round(Number(left) * 10),
    rows: 10,
    shadedRows: Math.round(Number(right) * 10),
  };
};

const 계산문항 = (kind: DecimalKind, which: number): G5Family => ({
  id: `calc-${which}`,
  make: (seed) => {
    const { left, right } = decimalOperands(kind, seed + which * 13);
    const answer = mulDecimal(left, right);
    return {
      prompt: `${left} × ${eul(right)} 계산하면 얼마일까요?`,
      answer,
      wrongs: decimalWrongs(left, right),
      tag: 'decimal',
      strategy: `${decimalKindName[kind]} 계산하기`,
      hint: '소수점을 잠시 지우고 자연수처럼 곱해 보세요. 곱한 뒤에 지운 자리 수만큼 오른쪽에서 세어 소수점을 찍습니다.',
      steps: decimalSteps(left, right),
      visual: decimalArea(left, right),
    };
  },
});

const 어림문항 = (kind: DecimalKind): G5Family => ({
  id: 'estimate',
  make: (seed) => {
    const { left, right } = decimalOperands(kind, seed);
    const answer = mulDecimal(left, right);
    const 왼쪽어림 = Math.round(Number(left));
    const 오른쪽어림 = Math.round(Number(right));
    const 어림 = 왼쪽어림 * 오른쪽어림;
    if (어림 === 0) return null;
    // 어림한 값과 가장 가까운 값을 고르게 합니다. 소수점 자리를
    // 틀리게 찍은 값은 어림값과 크게 어긋나므로 바로 걸러집니다.
    const 후보 = [answer, shiftPoint(answer, 1), shiftPoint(answer, -1)];
    if (new Set(후보).size !== 3) return null;
    return {
      prompt: `${left} × ${eul(right)} 계산했습니다. 어림하여 짐작할 때 알맞은 값은 어느 것일까요?`,
      answer,
      wrongs: [
        shiftPoint(answer, 1),
        shiftPoint(answer, -1),
        String(Number(withoutPoint(left)) * Number(withoutPoint(right))),
      ],
      tag: 'decimal',
      strategy: '어림하여 곱의 크기 짐작하기',
      hint: `${eun(left)} 약 ${왼쪽어림}, ${eun(right)} 약 ${오른쪽어림}입니다. 두 수를 곱하면 답이 얼마쯤일지 알 수 있습니다.`,
      steps: [
        `${eun(left)} 약 ${왼쪽어림}, ${eun(right)} 약 ${오른쪽어림}이므로 곱은 ${어림}쯤 됩니다.`,
        `보기 가운데 ${어림}에 가장 가까운 값은 ${answer}입니다.`,
        `실제로 계산해 보아도 ${left} × ${right} = ${answer}입니다.`,
      ],
      misconceptionTip: '계산하기 전에 어림해 보면 소수점을 잘못 찍었을 때 바로 알아차릴 수 있습니다.',
    };
  },
});

const 자리수문항 = (kind: DecimalKind): G5Family => ({
  id: 'how-many-places',
  make: (seed) => {
    const { left, right } = decimalOperands(kind, seed);
    const 자리 = placesOf(left) + placesOf(right);
    if (자리 === 0) return null;
    // 끝자리가 0이 되어 지워지는 곱은 묻지 않습니다. 0.5 × 0.04는
    // 규칙대로면 세 자리인데 적은 값 0.02는 두 자리라, 답이 둘이 됩니다.
    if (mulDecimalKeepingZeros(left, right) !== mulDecimal(left, right)) return null;
    return {
      prompt: `${left} × ${right}의 곱은 소수점 아래 자리 수가 몇 개일까요?`,
      answer: `${자리}개`,
      wrongs: [`${자리 + 1}개`, `${Math.max(0, 자리 - 1)}개`, `${Math.max(placesOf(left), placesOf(right))}개`, '0개'],
      tag: 'decimal',
      strategy: '곱의 소수점 아래 자리 수 구하기',
      hint: '두 수의 소수점 아래 자리 수를 각각 세어 적고, 그 둘을 더해 보세요.',
      steps: [
        `${eun(left)} 소수점 아래 자리 수가 ${placesOf(left)}개, ${eun(right)} ${placesOf(right)}개입니다.`,
        `곱의 소수점 아래 자리 수는 두 수의 자리 수를 더한 것입니다. ${placesOf(left)} + ${placesOf(right)} = ${자리}입니다.`,
        `그러므로 ${자리}개입니다.`,
      ],
      misconceptionTip: '더 많은 쪽에 맞추는 것이 아니라 두 수의 자리 수를 더합니다.',
    };
  },
});

// ── 하 ──────────────────────────────────────────────────────────────
export const decimalEasy = (kind: DecimalKind): G5Family[] => [
  계산문항(kind, 0),
  계산문항(kind, 1),
  계산문항(kind, 2),
  자리수문항(kind),
  {
    id: 'method',
    make: () => ({
      prompt: '소수의 곱셈은 어떻게 계산할까요?',
      answer: '소수점을 지우고 자연수처럼 곱한 뒤, 두 수의 소수점 아래 자리 수를 더한 만큼 곱에 소수점을 찍습니다.',
      wrongs: [
        '소수점을 지우고 자연수처럼 곱한 뒤, 두 수 중 자리 수가 많은 쪽에 맞추어 소수점을 찍습니다.',
        '소수점을 지우고 자연수처럼 곱한 뒤, 소수점을 찍지 않습니다.',
        '소수점의 자리를 맞추어 세로로 쓴 다음 자리끼리 곱합니다.',
      ],
      tag: 'decimal',
      strategy: '소수의 곱셈 방법 알기',
      hint: '소수를 분수로 고쳐 보세요. 분모가 10, 100이 되는 까닭에서 소수점 자리가 나옵니다.',
      steps: [
        '소수를 분모가 10이나 100인 분수로 고치면, 분모끼리의 곱이 10, 100, 1000이 됩니다.',
        '분모가 10이면 소수점 아래 한 자리, 100이면 두 자리입니다.',
        '그러므로 소수점을 지우고 자연수처럼 곱한 뒤, 두 수의 소수점 아래 자리 수를 더한 만큼 곱에 소수점을 찍습니다.',
      ],
    }),
  },
  {
    id: 'as-fraction',
    make: (seed) => {
      const { left, right } = decimalOperands(kind, seed + 5);
      const answer = `${asFractionText(left)} × ${asFractionText(right)}`;
      return {
        prompt: `${left} × ${eul(right)} 분수의 곱셈으로 바꾸어 나타내면 어느 것일까요?`,
        answer,
        wrongs: [
          `${withoutPoint(left)} × ${withoutPoint(right)}`,
          `${asFractionText(left)} + ${asFractionText(right)}`,
          `${asFractionText(right)} × ${asFractionText(left)}`.replace('×', '÷'),
          `${left} × ${asFractionText(right)}`,
        ],
        tag: 'decimal',
        strategy: '소수를 분수로 고쳐 나타내기',
        hint: '소수점 아래 한 자리는 분모가 10, 두 자리는 분모가 100인 분수입니다.',
        steps: [
          `${eun(left)} ${asFractionText(left)}, ${eun(right)} ${asFractionText(right)}입니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
];

// ── 중 ──────────────────────────────────────────────────────────────
type 상황 = { 글: (left: string, right: string) => string; 단위: string; 물음: string };

const 상황들: Record<DecimalKind, 상황[]> = {
  'small-whole': [
    { 글: (l, r) => `물병 한 개에 물이 ${l} L씩 들어 있습니다. 물병 ${r}개에 들어 있는`, 단위: 'L', 물음: '물은 모두 몇 L일까요?' },
    { 글: (l, r) => `리본 한 도막의 길이가 ${l} m입니다. 같은 리본 ${r}도막의`, 단위: 'm', 물음: '길이는 모두 몇 m일까요?' },
    { 글: (l, r) => `사과 한 개의 무게가 ${l} kg입니다. 사과 ${r}개의`, 단위: 'kg', 물음: '무게는 모두 몇 kg일까요?' },
  ],
  'big-whole': [
    // 1보다 큰 소수를 쓰는 자리이므로 무게가 몇 kg인 것이라야 합니다.
    // 배 한 개가 7.8 kg이면 답은 맞아도 장면이 말이 되지 않습니다.
    { 글: (l, r) => `수박 한 통의 무게가 ${l} kg입니다. 수박 ${r}통의`, 단위: 'kg', 물음: '무게는 모두 몇 kg일까요?' },
    { 글: (l, r) => `한 시간에 ${l} km를 걷습니다. ${r} 시간 동안 걸으면`, 단위: 'km', 물음: '모두 몇 km를 걸을까요?' },
    { 글: (l, r) => `주스 한 병에 주스가 ${l} L씩 들어 있습니다. ${r}병에 들어 있는`, 단위: 'L', 물음: '주스는 모두 몇 L일까요?' },
  ],
  'whole-small': [
    { 글: (l, r) => `끈 ${l} m의 ${r}만큼을 사용했습니다. 사용한`, 단위: 'm', 물음: '끈은 몇 m일까요?' },
    { 글: (l, r) => `밭 ${l} m²의 ${r}만큼에 고추를 심었습니다. 고추를 심은`, 단위: 'm²', 물음: '넓이는 몇 m²일까요?' },
    { 글: (l, r) => `물 ${l} L의 ${r}만큼을 마셨습니다. 마신`, 단위: 'L', 물음: '물은 몇 L일까요?' },
  ],
  'whole-big': [
    { 글: (l, r) => `한 상자의 무게가 ${r} kg입니다. 같은 상자 ${l}개의`, 단위: 'kg', 물음: '무게는 모두 몇 kg일까요?' },
    { 글: (l, r) => `줄 한 도막의 길이가 ${r} m입니다. 같은 줄 ${l}도막의`, 단위: 'm', 물음: '길이는 모두 몇 m일까요?' },
    { 글: (l, r) => `한 사람이 우유를 ${r} L씩 마십니다. ${l}명이 마신`, 단위: 'L', 물음: '우유는 모두 몇 L일까요?' },
  ],
  'small-small': [
    { 글: (l, r) => `가로가 ${l} m, 세로가 ${r} m인 직사각형 모양의 종이가 있습니다. 이 종이의`, 단위: 'm²', 물음: '넓이는 몇 m²일까요?' },
    { 글: (l, r) => `물 ${l} L의 ${r}만큼을 덜어 냈습니다. 덜어 낸`, 단위: 'L', 물음: '물은 몇 L일까요?' },
  ],
  'big-big': [
    { 글: (l, r) => `가로가 ${l} m, 세로가 ${r} m인 직사각형 모양의 커튼이 있습니다. 이 커튼의`, 단위: 'm²', 물음: '넓이는 몇 m²일까요?' },
    { 글: (l, r) => `한 시간에 ${l} km를 달립니다. ${r} 시간 동안 달리면`, 단위: 'km', 물음: '모두 몇 km를 달릴까요?' },
    { 글: (l, r) => `가로가 ${l} m, 세로가 ${r} m인 직사각형 모양의 화단이 있습니다. 이 화단의`, 단위: 'm²', 물음: '넓이는 몇 m²일까요?' },
  ],
};

export const decimalMiddle = (kind: DecimalKind): G5Family[] => {
  const 목록 = 상황들[kind];
  const 문장제 = (which: number): G5Family => ({
    id: `word-${which}`,
    make: (seed) => {
      const { left, right } = decimalOperands(kind, seed + which * 17);
      const 상 = 목록[(Math.abs(seed) + which) % 목록.length];
      const answer = mulDecimal(left, right);
      return {
        prompt: `${상.글(left, right)} ${상.물음}`,
        answer: `${answer} ${상.단위}`,
        wrongs: decimalWrongs(left, right).map((one) => `${one} ${상.단위}`),
        tag: 'decimal',
        strategy: `${decimalKindName[kind]} 상황에서 문제 해결하기`,
        hint: '먼저 곱셈식으로 나타내세요. 계산하기 전에 얼마쯤 될지 어림해 두면 소수점을 잘못 찍었을 때 바로 압니다.',
        steps: [`곱셈식으로 나타내면 ${left} × ${right}입니다.`, ...decimalSteps(left, right), `그러므로 ${answer} ${상.단위}입니다.`],
        visual: decimalArea(left, right),
      };
    },
  });

  return [
    문장제(0),
    문장제(1),
    문장제(2),
    어림문항(kind),
    계산문항(kind, 7),
    {
      id: 'find-error',
      make: (seed) => {
        const { left, right } = decimalOperands(kind, seed + 11);
        const answer = mulDecimal(left, right);
        const 잘못 = shiftPoint(answer, 1);
        if (잘못 === answer) return null;
        return {
          prompt: `어떤 학생이 ${left} × ${eul(right)} 계산하여 ${iJosa(잘못)} 나왔습니다. 바르게 계산하면 얼마일까요?`,
          answer,
          wrongs: decimalWrongs(left, right).filter((one) => one !== 잘못),
          tag: 'decimal',
          strategy: '소수점을 잘못 찍은 계산 바로잡기',
          hint: '두 수의 소수점 아래 자리 수를 더해 보세요. 그 수만큼 곱에 소수점 아래 자리가 있어야 합니다.',
          steps: decimalSteps(left, right),
          misconceptionTip: '자연수끼리의 곱은 맞아도 소수점 자리를 한 칸 틀리면 답이 10배나 1/10배가 됩니다.',
        };
      },
    },
  ];
};

// ── 상 ──────────────────────────────────────────────────────────────
export const decimalHard = (kind: DecimalKind): G5Family[] => [
  {
    id: 'missing-factor',
    make: (seed) => {
      const { left, right } = decimalOperands(kind, seed);
      const answer = mulDecimal(left, right);
      const 왼쪽을묻기 = Math.abs(seed) % 2 === 0;
      const 감춘것 = 왼쪽을묻기 ? left : right;
      const 보이는것 = 왼쪽을묻기 ? right : left;
      return {
        prompt: `${왼쪽을묻기 ? `▢ × ${보이는것}` : `${보이는것} × ▢`} = ${answer}일 때 ▢에 알맞은 수는 무엇일까요?`,
        answer: 감춘것,
        wrongs: [shiftPoint(감춘것, 1), shiftPoint(감춘것, -1), answer, 보이는것],
        tag: 'decimal',
        strategy: '곱셈식에서 빠진 수 구하기',
        hint: '보기의 수를 ▢에 하나씩 넣어 곱해 보세요. 소수점 아래 자리 수를 세어 보면 빨리 가려집니다.',
        steps: [
          `${left} × ${eul(right)} 계산하면 ${answer}입니다.`,
          `그러므로 ▢에 알맞은 수는 ${감춘것}입니다.`,
        ],
      };
    },
  },
  {
    id: 'compare-products',
    make: (seed) => {
      const a = decimalOperands(kind, seed);
      const b = decimalOperands(kind, seed + 101);
      const 곱1 = mulDecimal(a.left, a.right);
      const 곱2 = mulDecimal(b.left, b.right);
      if (Number(곱1) === Number(곱2)) return null;
      const 큰쪽 = Number(곱1) > Number(곱2) ? a : b;
      const 큰값 = Number(곱1) > Number(곱2) ? 곱1 : 곱2;
      const 작은값 = 큰값 === 곱1 ? 곱2 : 곱1;
      const 식 = (one: { left: string; right: string }) => `${one.left} × ${one.right}`;
      return {
        prompt: `${식(a)}${particleOf(a.right, '과')} ${식(b)} 중에서 계산 결과가 더 큰 것은 어느 것일까요?`,
        answer: 식(큰쪽),
        wrongs: [식(큰쪽 === a ? b : a), '두 식의 결과는 같습니다.', 큰값, 작은값],
        tag: 'decimal',
        strategy: '두 곱셈의 결과 비교하기',
        hint: '두 식을 각각 끝까지 계산해 소수점 아래 자리를 맞추어 견주세요.',
        steps: [`${식(a)} = ${곱1}입니다.`, `${식(b)} = ${곱2}입니다.`, `${iJosa(큰값)} ${작은값}보다 크므로 ${iJosa(식(큰쪽))} 더 큽니다.`],
      };
    },
  },
  {
    id: 'bigger-or-smaller',
    make: (seed) => {
      const { left, right } = decimalOperands(kind, seed + 5);
      const answer = mulDecimal(left, right);
      const 곱하는수가1보다작다 = Number(right) < 1;
      const 결론 = 곱하는수가1보다작다 ? `${left}보다 작습니다.` : `${left}보다 큽니다.`;
      return {
        prompt: `계산하지 않고 생각해 봅시다. ${left} × ${right}의 결과는 ${gwa(left)} 견주면 어떠할까요?`,
        answer: 결론,
        wrongs: [
          곱하는수가1보다작다 ? `${left}보다 큽니다.` : `${left}보다 작습니다.`,
          `${gwa(left)} 같습니다.`,
          `${gwa(right)} 같습니다.`,
          '알 수 없습니다.',
        ],
        tag: 'decimal',
        strategy: '곱한 결과의 크기를 어림하기',
        hint: `곱하는 수 ${iJosa(right)} 1보다 큰지 작은지를 먼저 보세요. 어떤 수에 1을 곱하면 그 수 그대로입니다.`,
        steps: [
          '어떤 수에 1을 곱하면 그 수 그대로입니다.',
          곱하는수가1보다작다
            ? `곱하는 수 ${iJosa(right)} 1보다 작으므로 곱은 ${left}보다 작아집니다.`
            : `곱하는 수 ${iJosa(right)} 1보다 크므로 곱은 ${left}보다 커집니다.`,
          `실제로 계산해 보면 ${iJosa(answer)} 되어 ${결론}`,
        ],
        misconceptionTip: '자연수끼리 곱하면 늘 커지지만, 1보다 작은 수를 곱하면 오히려 작아집니다.',
      };
    },
  },
  {
    id: 'from-natural-product',
    make: (seed) => {
      const { left, right } = decimalOperands(kind, seed + 7);
      const 자연수곱 = Number(withoutPoint(left)) * Number(withoutPoint(right));
      const answer = mulDecimal(left, right);
      return {
        prompt: `${withoutPoint(left)} × ${withoutPoint(right)} = ${자연수곱}입니다. 이것을 이용하여 ${left} × ${eul(right)} 구하면 얼마일까요?`,
        answer,
        wrongs: [shiftPoint(answer, 1), shiftPoint(answer, -1), String(자연수곱), shiftPoint(answer, 2)],
        tag: 'decimal',
        strategy: '자연수의 곱을 이용해 소수의 곱 구하기',
        hint: `${eun(left)} ${withoutPoint(left)}의 몇 분의 몇인지, ${eun(right)} ${withoutPoint(right)}의 몇 분의 몇인지 각각 적어 보세요.`,
        steps: [
          `${eun(left)} ${withoutPoint(left)}의 ${placesOf(left) === 0 ? '1배' : `${'1/' + 10 ** placesOf(left)}배`}, ${eun(right)} ${withoutPoint(right)}의 ${placesOf(right) === 0 ? '1배' : `${'1/' + 10 ** placesOf(right)}배`}입니다.`,
          `곱해지는 수와 곱하는 수가 각각 그만큼 작아지므로 곱은 ${자연수곱}의 1/${10 ** (placesOf(left) + placesOf(right))}배가 됩니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
];
