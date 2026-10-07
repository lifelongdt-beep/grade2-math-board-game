import type { Difficulty } from '../../../types';
import type { G5Family, G5Spec } from '../../grade5/build';
import { eul, eun, euro, gwa, i as iJosa, particleOf, pick, rand } from '../../grade5/util';

// '539이라고', '586라고'처럼 받침에 따라 달라지는 '(이)라고'입니다.
const 이라고 = (word: string) => `${word}${particleOf(word, '이') === '이' ? '이라고' : '라고'}`;
import {
  addDoubleCarry,
  addNoCarry,
  addSideways,
  borrowsOf,
  carriesOf,
  columnSteps,
  digits,
  isAdd,
  nearestHundred,
  pairFor,
  roundFriendly,
  subBigMinusSmall,
  subNoDecrement,
  subZeroCopy,
  wrongResults,
  type Kind,
  type Pair,
} from './core';

// ════════════════════════════════════════════════════════════════════
// 3-1 1단원 덧셈과 뺄셈 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입
//   2 받아올림 없는 덧셈   3 받아올림 한 번   4 받아올림 여러 번
//   5 덧셈의 어림셈
//   6 받아내림 없는 뺄셈   7 받아내림 한 번   8 받아내림 두 번
//   9 뺄셈의 어림셈
//
// 계산 차시(2~4, 6~8)는 하는 일이 같고 받아올림·받아내림의 횟수만
// 다르므로 한 벌의 뭉치를 꼴(Kind)로 나누어 씁니다.
//
// 지도서가 차시마다 함께 다루는 것:
//   · 수 모형으로 계산 원리 알기(활동 1)   → 수 모형 문항
//   · 계산 방법을 형식화하기(활동 2)      → 계산, 자리 숫자 문항
//   · 실생활 문제 해결하기(확인 3)        → 문장제
//   · 잘못 계산한 곳 찾기(확인 4)          → 바르게 고치기, 까닭 찾기
//   · 얼마쯤 될지 어림하기(3, 7차시)      → 어림 차시에서 따로 다룹니다
//
// 답은 늘 문제에 쓴 수로 계산해서 냅니다. 손으로 적은 답은 없습니다.
// ════════════════════════════════════════════════════════════════════

const 꼴이름: Record<Kind, string> = {
  add0: '받아올림이 없는 세 자리 수의 덧셈',
  add1: '받아올림이 한 번 있는 세 자리 수의 덧셈',
  add2: '받아올림이 여러 번 있는 세 자리 수의 덧셈',
  sub0: '받아내림이 없는 세 자리 수의 뺄셈',
  sub1: '받아내림이 한 번 있는 세 자리 수의 뺄셈',
  sub2: '받아내림이 두 번 있는 세 자리 수의 뺄셈',
};

const 기호 = (pair: Pair) => (isAdd(pair.kind) ? '+' : '-');
const 식 = (pair: Pair) => `${pair.a}${기호(pair)}${pair.b}`;
const tagOf = (kind: Kind): 'addition' | 'subtraction' => (isAdd(kind) ? 'addition' : 'subtraction');

const 계산볼곳 = (kind: Kind): string => {
  if (kind === 'add0') return '두 수를 자리에 맞추어 쓰고, 일의 자리부터 같은 자리끼리 더해 보세요.';
  if (kind === 'add1') return '일의 자리부터 더해 보세요. 어느 자리의 합이 10이거나 10보다 큰지 찾아 그 자리에서 받아올림하세요.';
  if (kind === 'add2') return '일의 자리부터 더하면서 받아올린 1을 바로 윗자리에 작게 적어 두세요. 받아올림이 한 번이 아닙니다.';
  if (kind === 'sub0') return '두 수를 자리에 맞추어 쓰고, 일의 자리부터 같은 자리끼리 빼 보세요.';
  if (kind === 'sub1') return '일의 자리부터 빼 보세요. 위의 수가 아래의 수보다 작은 자리를 찾아 바로 윗자리에서 받아내리세요.';
  return '일의 자리부터 빼면서 받아내린 자리에는 1을 뺀 수를 작게 적어 두세요. 받아내림이 두 번입니다.';
};

const 계산핵심 = (kind: Kind): string =>
  isAdd(kind)
    ? '같은 자리끼리 더합니다. 같은 자리의 합이 10이거나 10보다 크면 바로 윗자리로 1을 받아올립니다.'
    : '같은 자리끼리 뺍니다. 같은 자리끼리 뺄 수 없으면 바로 윗자리에서 1을 받아내려 10을 더한 다음 뺍니다.';

const 계산오개념 = (kind: Kind): string => {
  if (kind === 'add0' || kind === 'sub0') return '자리를 맞추지 않고 쓰면 다른 자리끼리 계산하게 됩니다. 일은 일끼리, 십은 십끼리, 백은 백끼리 계산하세요.';
  if (isAdd(kind)) return '받아올린 1을 윗자리에 더하는 것을 빠뜨리기 쉽습니다. 받아올린 1을 작게 적어 두고 윗자리를 더할 때 함께 더하세요.';
  return '자리마다 큰 수에서 작은 수를 빼면 안 됩니다. 위의 수가 작으면 받아내리고, 받아내려 준 자리에서는 1을 빼야 합니다.';
};

const 계산확인 = (kind: Kind): string =>
  isAdd(kind)
    ? '두 수를 가까운 몇백으로 어림한 값과 계산한 값이 비슷한가요?'
    : '구한 차에 빼는 수를 더하면 빼지는 수가 되나요?';

// ── 1. 계산하기 ─────────────────────────────────────────────────────
const 계산문항 = (kind: Kind): G5Family => ({
  id: `calc-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    return {
      prompt: `${eul(식(pair))} 계산하면 얼마일까요?`,
      answer: String(pair.result),
      wrongs: wrongResults(pair).map(String),
      tag: tagOf(kind),
      concept: 계산핵심(kind),
      strategy: `${꼴이름[kind]} 계산하기`,
      hint: 계산볼곳(kind),
      steps: [`두 수를 자리에 맞추어 세로로 씁니다.`, ...columnSteps(pair)],
      misconceptionTip: 계산오개념(kind),
      selfCheck: 계산확인(kind),
    };
  },
});

// ── 2. 세로셈에서 한 자리의 숫자 ────────────────────────────────────
// 교과서의 세로셈 빈칸(활동 2)을 고르는 문항으로 옮긴 것입니다. 답 전체를
// 맞히는 것보다 받아올림·받아내림이 어느 자리에 영향을 주는지 정확히
// 짚게 합니다.
const 자리숫자문항 = (kind: Kind): G5Family => ({
  id: `digit-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    const next = rand(seed + 3);
    // 받아올림·받아내림이 있으면 그 영향을 받는 자리를 묻습니다.
    const touched = isAdd(kind) ? carriesOf(pair.a, pair.b) : borrowsOf(pair.a, pair.b);
    const candidates = touched.length
      ? touched.filter((place) => place < 2).map((place) => place + 1)
      : [0, 1, 2];
    const place = candidates.length ? pick(candidates, next(99)) : 1;
    const 이름 = ['일', '십', '백'][place];
    const answerDigit = digits(pair.result)[place];
    const da = digits(pair.a)[place];
    const db = digits(pair.b)[place];
    // 받아올림·받아내림을 빠뜨린 숫자가 가장 그럴듯한 오답입니다.
    const 빠뜨림 = isAdd(kind) ? (da + db) % 10 : Math.abs(da - db);
    const 두번 = isAdd(kind) ? (answerDigit + 1) % 10 : (answerDigit + 9) % 10;
    const wrongs = [빠뜨림, 두번, (answerDigit + 2) % 10, da, db].map(String);
    return {
      prompt: `${eul(식(pair))} 세로로 계산할 때, 계산 결과의 ${이름}의 자리에 쓰는 숫자는 무엇일까요?`,
      answer: String(answerDigit),
      wrongs,
      tag: tagOf(kind),
      concept: 계산핵심(kind),
      strategy: `${꼴이름[kind]}에서 자리의 숫자 구하기`,
      hint: `${이름}의 자리만 보지 말고 일의 자리부터 차례로 계산해 오세요. 아랫자리에서 받아올리거나 받아내린 것이 ${이름}의 자리를 바꿉니다.`,
      steps: [...columnSteps(pair), `계산 결과 ${pair.result}의 ${이름}의 자리 숫자는 ${answerDigit}입니다.`],
      misconceptionTip: 계산오개념(kind),
    };
  },
});

// ── 3. 받아올린 1, 받아내린 1이 나타내는 값 ──────────────────────────
// 지도서 Q2: "받아올림, 받아내림을 어려워하는 것은 자릿값 개념이 명확히
// 인식되지 못했기 때문". 작게 쓴 1이 실제로 얼마인지를 묻습니다.
const 받아올림뜻문항 = (kind: Kind): G5Family => ({
  id: `carry-mean-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    const moves = isAdd(kind) ? carriesOf(pair.a, pair.b) : borrowsOf(pair.a, pair.b);
    const usable = moves.filter((place) => place < 2);
    if (!usable.length) return null;
    const place = pick(usable, seed);
    const 아래 = ['일', '십'][place];
    const 위 = ['십', '백'][place];
    const value = 10 ** (place + 1);
    if (isAdd(kind)) {
      return {
        prompt: `${eul(식(pair))} 세로로 계산할 때, ${아래}의 자리에서 ${위}의 자리로 받아올림한 1은 실제로 얼마를 나타낼까요?`,
        answer: String(value),
        wrongs: ['1', String(value === 10 ? 100 : 10), String(value + 1), String(value * 10)],
        tag: 'addition',
        concept: `${위}의 자리의 1은 ${value}입니다. ${아래}의 자리에서 ${value}을 모아 ${위}의 자리로 1을 올려 보낸 것입니다.`,
        strategy: '받아올림한 수의 자릿값 알기',
        hint: `작게 쓴 1이 어느 자리 위에 있는지 보세요. ${위}의 자리에 있는 1은 ${위} 모형 1개입니다. ${위} 모형 1개는 얼마인가요?`,
        steps: [
          `${아래}의 자리의 합이 10이거나 10보다 커서 10개를 묶어 ${위}의 자리로 올려 보냅니다.`,
          `${아래} 모형 10개는 ${위} 모형 1개와 같습니다.`,
          `${위}의 자리의 1은 ${value}을 나타냅니다.`,
        ],
        misconceptionTip: '작게 쓴 1을 그냥 1로 보면 안 됩니다. 받아올린 자리에 따라 10이 되기도 하고 100이 되기도 합니다.',
        selfCheck: '받아올린 1이 어느 자리에 있는지 확인했나요?',
      };
    }
    return {
      prompt: `${eul(식(pair))} 세로로 계산할 때, ${위}의 자리에서 ${아래}의 자리로 받아내림한 1은 ${아래}의 자리에서 얼마가 될까요?`,
      answer: String(10),
      wrongs: ['1', '100', '9', '11'],
      tag: 'subtraction',
      concept: `${위}의 자리의 1은 ${아래}의 자리에서는 10입니다. ${위} 모형 1개를 ${아래} 모형 10개로 바꾸는 것입니다.`,
      strategy: '받아내림한 수의 크기 알기',
      hint: `수 모형으로 생각해 보세요. ${위} 모형 1개를 ${아래} 모형 몇 개로 바꿀 수 있나요?`,
      steps: [
        `${위} 모형 1개는 ${아래} 모형 10개와 같습니다.`,
        `그래서 ${위}의 자리에서 1을 받아내리면 ${아래}의 자리에는 10을 더해 줍니다.`,
        `받아내림한 1은 ${아래}의 자리에서 10이 됩니다.`,
      ],
      misconceptionTip: '받아내린 1을 그대로 1로 더하면 안 됩니다. 바로 윗자리의 1은 아랫자리에서 10입니다.',
      selfCheck: '받아내린 자리에서는 1을 빼 주었나요?',
    };
  },
});

// ── 4. 수 모형으로 계산하기 ─────────────────────────────────────────
// 활동 1입니다. 두 수의 수 모형을 모으면 십 모형이 10개를 넘을 수
// 있습니다 — 그 모형이 나타내는 수를 바르게 읽으려면 받아올림을 해야
// 합니다. 그림은 모형만 보여 주고 숫자는 적지 않습니다.
const 수모형문항 = (kind: Kind): G5Family => ({
  id: `blocks-${kind}`,
  make: (seed) => {
    if (!isAdd(kind)) return null;
    const pair = pairFor(kind, seed);
    const da = digits(pair.a);
    const db = digits(pair.b);
    const 일 = da[0] + db[0];
    const 십 = da[1] + db[1];
    const 백 = da[2] + db[2];
    // 그림은 한 칸에 12개까지 또렷하게 그립니다.
    if (일 > 12 || 십 > 12 || 백 > 9) return null;
    const 이어쓰기 = Number(`${백}${십}${일}`);
    return {
      prompt: `수 모형으로 ${eul(식(pair))} 계산하려고 두 수의 수 모형을 모았더니 백 모형 ${백}개, 십 모형 ${십}개, 일 모형 ${일}개가 되었습니다. 모은 수 모형이 나타내는 수는 얼마일까요?`,
      answer: String(pair.result),
      wrongs: [
        이어쓰기 !== pair.result ? String(이어쓰기) : '',
        String(addNoCarry(pair.a, pair.b)),
        String(pair.result + 100),
        String(pair.result - 10),
      ].filter(Boolean),
      tag: 'addition',
      concept: '같은 모형이 10개가 되면 바로 윗자리 모형 1개로 바꿉니다. 일 모형 10개는 십 모형 1개, 십 모형 10개는 백 모형 1개입니다.',
      strategy: '수 모형으로 세 자리 수의 덧셈하기',
      hint: kind === 'add0'
        ? '백 모형은 100, 십 모형은 10, 일 모형은 1을 나타냅니다. 모형마다 몇 개인지 세어 보세요.'
        : '10개가 넘는 모형이 있는지 보세요. 10개를 묶어 바로 윗자리 모형 1개로 바꾼 다음 세어 보세요.',
      steps: [
        `백 모형 ${백}개는 ${백 * 100}, 십 모형 ${십}개는 ${십 * 10}, 일 모형 ${일}개는 ${일}입니다.`,
        ...(일 >= 10 ? [`일 모형 10개를 십 모형 1개로 바꿉니다.`] : []),
        ...(십 + (일 >= 10 ? 1 : 0) >= 10 ? [`십 모형 10개를 백 모형 1개로 바꿉니다.`] : []),
        `${백 * 100}+${십 * 10}+${일}=${pair.result}이므로 모은 수 모형이 나타내는 수는 ${pair.result}입니다.`,
      ],
      misconceptionTip: '모형의 개수를 그대로 이어 쓰면 안 됩니다. 십 모형이 12개이면 120이므로 백 모형 1개와 십 모형 2개로 바꾸어 읽어야 합니다.',
      selfCheck: `${eul(식(pair))} 세로로 계산한 값과 같은가요?`,
      visual: {
        kind: 'place-value',
        label: `${식(pair)}의 수 모형을 모은 그림`,
        countOnly: true,
        columns: [
          { label: '백', value: 백, blocks: 백 },
          { label: '십', value: 십, blocks: 십 },
          { label: '일', value: 일, blocks: 일 },
        ],
      },
    };
  },
});

// ── 5. 실생활 문제 ──────────────────────────────────────────────────
// 답: 풀이의 마지막 줄입니다. 답을 문장으로 맺어야 아이가 무엇이 답인지 압니다.
type 장면 = { make: (a: number, b: number) => { prompt: string; unit: string; 답: (v: string) => string } };

const 덧셈장면: 장면[] = [
  { make: (a, b) => ({ prompt: `가상 현실 체험관에 입장한 어른은 ${a}명, 어린이는 ${b}명입니다. 체험관에 입장한 사람은 모두 몇 명일까요?`, unit: '명', 답: (v) => `체험관에 입장한 사람은 모두 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `학교 도서관에 동화책이 ${a}권, 위인전이 ${b}권 있습니다. 동화책과 위인전은 모두 몇 권일까요?`, unit: '권', 답: (v) => `동화책과 위인전은 모두 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `과수원에서 사과를 ${a}개, 배를 ${b}개 땄습니다. 딴 사과와 배는 모두 몇 개일까요?`, unit: '개', 답: (v) => `딴 사과와 배는 모두 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `줄넘기를 어제는 ${a}번, 오늘은 ${b}번 넘었습니다. 이틀 동안 넘은 줄넘기는 모두 몇 번일까요?`, unit: '번', 답: (v) => `이틀 동안 넘은 줄넘기는 모두 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `색종이가 ${a}장 있었는데 ${b}장을 더 샀습니다. 색종이는 모두 몇 장이 되었을까요?`, unit: '장', 답: (v) => `색종이는 모두 ${v}이 되었습니다.` }) },
  { make: (a, b) => ({ prompt: `화재 안전 교육에 참여한 학생은 ${a}명, 교통안전 교육에 참여한 학생은 ${b}명입니다. 두 교육에 참여한 학생은 모두 몇 명일까요?`, unit: '명', 답: (v) => `두 교육에 참여한 학생은 모두 ${v}입니다.` }) },
];

const 뺄셈장면: 장면[] = [
  { make: (a, b) => ({ prompt: `가상 현실 체험관에 입장한 사람은 ${a}명이고, 그중 어린이는 ${b}명입니다. 입장한 어른은 몇 명일까요?`, unit: '명', 답: (v) => `입장한 어른은 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `구슬이 ${a}개 있었는데 동생에게 ${b}개를 주었습니다. 남은 구슬은 몇 개일까요?`, unit: '개', 답: (v) => `남은 구슬은 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `줄넘기를 오늘은 ${a}번, 어제는 ${b}번 넘었습니다. 오늘은 어제보다 몇 번 더 많이 넘었을까요?`, unit: '번', 답: (v) => `오늘은 어제보다 ${v} 더 많이 넘었습니다.` }) },
  { make: (a, b) => ({ prompt: `연못에 사는 개구리는 ${a}마리, 거북은 ${b}마리입니다. 개구리는 거북보다 몇 마리 더 많을까요?`, unit: '마리', 답: (v) => `개구리는 거북보다 ${v} 더 많습니다.` }) },
  { make: (a, b) => ({ prompt: `도서관에 책이 ${a}권 있었는데 ${b}권을 빌려 갔습니다. 도서관에 남은 책은 몇 권일까요?`, unit: '권', 답: (v) => `도서관에 남은 책은 ${v}입니다.` }) },
  { make: (a, b) => ({ prompt: `종이학을 ${a}개 접기로 했는데 지금까지 ${b}개를 접었습니다. 앞으로 몇 개를 더 접어야 할까요?`, unit: '개', 답: (v) => `앞으로 종이학을 ${v} 더 접어야 합니다.` }) },
];

const 문장제문항 = (kind: Kind, at: number): G5Family => ({
  id: `word-${kind}-${at}`,
  make: (seed) => {
    const pair = pairFor(kind, seed + at * 13);
    const scene = pick(isAdd(kind) ? 덧셈장면 : 뺄셈장면, seed + at).make(pair.a, pair.b);
    const 단위 = (value: number) => `${value}${scene.unit}`;
    // 덧셈 상황에 뺄셈을, 뺄셈 상황에 덧셈을 한 값도 오답에 넣습니다.
    // 상황을 읽고 연산을 고르는 것까지가 이 문항이 보는 것입니다.
    const 반대연산 = isAdd(kind) ? Math.abs(pair.a - pair.b) : pair.a + pair.b;
    return {
      prompt: scene.prompt,
      answer: 단위(pair.result),
      wrongs: [단위(반대연산), ...wrongResults(pair).map(단위)],
      tag: tagOf(kind),
      concept: isAdd(kind)
        ? '두 양을 합하면 모두 얼마인지 구할 때는 덧셈을 합니다.'
        : '남은 양을 구하거나 두 양의 차이를 구할 때는 뺄셈을 합니다.',
      strategy: `${꼴이름[kind]}로 실생활 문제 해결하기`,
      hint: isAdd(kind)
        ? '모두 몇인지 묻고 있나요? 두 수를 합하는 식을 세운 다음 일의 자리부터 계산해 보세요.'
        : '남은 수나 더 많은 수를 묻고 있나요? 큰 수에서 작은 수를 빼는 식을 세운 다음 일의 자리부터 계산해 보세요.',
      steps: [
        `식으로 나타내면 ${식(pair)}입니다.`,
        ...columnSteps(pair).slice(0, -1),
        `${식(pair)}=${pair.result}이므로 ${scene.답(단위(pair.result))}`,
      ],
      misconceptionTip: isAdd(kind)
        ? '문장에 나온 두 수를 보고 바로 계산하지 말고, 합을 구하는지 차를 구하는지 먼저 정하세요.'
        : '‘더 많은’, ‘남은’이라는 말은 뺄셈입니다. 두 수를 더하면 안 됩니다.',
      selfCheck: isAdd(kind)
        ? '구한 답이 두 수보다 각각 큰가요?'
        : '구한 답에 빼는 수를 더하면 처음 수가 되나요?',
    };
  },
});

// ── 6. 잘못 계산한 곳 바르게 고치기 ─────────────────────────────────
// 확인 4 '잘못 계산한 곳을 찾아 말하고, 바르게 계산해 봅시다'입니다.
// 틀린 계산은 지도서의 오류 유형 그대로 만듭니다.
type 실수 = { value: number; 까닭: string; 원인: string };

const 실수들 = (pair: Pair): 실수[] => {
  const { a, b } = pair;
  const out: Array<{ value: number | null; 까닭: string; 원인: string }> = isAdd(pair.kind)
    ? [
        { value: addNoCarry(a, b), 까닭: '받아올림한 1을 윗자리에 더하지 않았습니다.', 원인: '받아올림한 1을 윗자리에 더하지 않아서' },
        { value: addDoubleCarry(a, b), 까닭: '받아올림한 1을 두 번 더했습니다.', 원인: '받아올림한 1을 두 번 더해서' },
        { value: addSideways(a, b), 까닭: '자리마다 더한 값을 받아올림하지 않고 그대로 이어 썼습니다.', 원인: '자리마다 더한 값을 그대로 이어 써서' },
      ]
    : [
        { value: subBigMinusSmall(a, b), 까닭: '위의 수가 작은 자리에서 아래의 수에서 위의 수를 뺐습니다.', 원인: '위의 수가 작은 자리에서 아래의 수에서 위의 수를 빼서' },
        { value: subNoDecrement(a, b), 까닭: '받아내림한 자리에서 1을 빼지 않았습니다.', 원인: '받아내림한 자리에서 1을 빼지 않아서' },
        { value: subZeroCopy(a, b), 까닭: '0에서 뺄 수 없는 자리에 아래의 숫자를 그대로 썼습니다.', 원인: '0에서 뺄 수 없는 자리에 아래의 숫자를 그대로 써서' },
      ];
  return out.filter((one): one is 실수 => one.value !== null && one.value > 0 && one.value !== pair.result);
};

const 이름들 = ['민지', '서준', '하윤', '도윤', '지아', '시우'];

const 바르게문항 = (kind: Kind): G5Family => ({
  id: `fix-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    const mistakes = 실수들(pair);
    if (!mistakes.length) return null;
    const mistake = pick(mistakes, seed);
    const who = pick(이름들, seed + 1);
    return {
      prompt: `${iJosa(who)} ${eul(식(pair))} ${이라고(String(mistake.value))} 계산했습니다. 바르게 계산하면 얼마일까요?`,
      answer: String(pair.result),
      wrongs: [String(mistake.value), ...wrongResults(pair).map(String)],
      tag: tagOf(kind),
      concept: 계산핵심(kind),
      strategy: `${꼴이름[kind]}에서 잘못 계산한 곳 고치기`,
      hint: `${who}의 답을 믿지 말고 일의 자리부터 다시 계산해 보세요. 어느 자리에서 달라지는지 찾으면 무엇을 잘못했는지 보입니다.`,
      steps: [
        ...columnSteps(pair),
        `${eun(who)} ${mistake.원인} ${iJosa(String(mistake.value))} 나왔습니다.`,
        `바르게 계산하면 ${pair.result}입니다.`,
      ],
      misconceptionTip: 계산오개념(kind),
    };
  },
});

const 까닭문항 = (kind: Kind): G5Family => ({
  id: `why-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    const mistakes = 실수들(pair);
    if (mistakes.length < 1) return null;
    const mistake = pick(mistakes, seed + 2);
    // 같은 틀린 답이 두 가지 실수에서 나오면 까닭이 하나로 정해지지 않습니다.
    if (mistakes.some((one) => one !== mistake && one.value === mistake.value)) return null;
    const who = pick(이름들, seed + 3);
    const 모든까닭 = isAdd(kind)
      ? ['받아올림한 1을 윗자리에 더하지 않았습니다.', '받아올림한 1을 두 번 더했습니다.', '자리마다 더한 값을 받아올림하지 않고 그대로 이어 썼습니다.', '십의 자리끼리 더하지 않고 빼었습니다.']
      : ['위의 수가 작은 자리에서 아래의 수에서 위의 수를 뺐습니다.', '받아내림한 자리에서 1을 빼지 않았습니다.', '0에서 뺄 수 없는 자리에 아래의 숫자를 그대로 썼습니다.', '일의 자리끼리 더했습니다.'];
    return {
      prompt: `${iJosa(who)} ${식(pair)}=${euro(String(mistake.value))} 계산했습니다. 무엇을 잘못했을까요?`,
      answer: mistake.까닭,
      wrongs: 모든까닭.filter((one) => one !== mistake.까닭),
      tag: tagOf(kind),
      concept: 계산핵심(kind),
      strategy: `${꼴이름[kind]}에서 잘못 계산한 까닭 찾기`,
      hint: '바르게 계산한 값을 먼저 구하고, 어느 자리의 숫자가 다른지 찾아보세요. 그 자리에서 무슨 일이 있었는지 생각하면 됩니다.',
      steps: [
        ...columnSteps(pair),
        `${who}의 답 ${gwa(String(mistake.value))} 바른 답 ${eul(String(pair.result))} 자리마다 견주어 봅니다.`,
        `${eun(who)} ${mistake.까닭}`,
      ],
      misconceptionTip: 계산오개념(kind),
    };
  },
});

// ── 7. 빈칸에 알맞은 숫자 ───────────────────────────────────────────
const 빈칸문항 = (kind: Kind): G5Family => ({
  id: `blank-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    // 앞의 수의 십의 자리를 가립니다.
    const da = digits(pair.a);
    const hidden = da[1];
    const masked = `${da[2]}□${da[0]}`;
    const 결과 = pair.result;
    const 식글 = isAdd(kind) ? `${masked}+${pair.b}=${결과}` : `${masked}-${pair.b}=${결과}`;
    const 결과십 = digits(결과)[1];
    const db1 = digits(pair.b)[1];
    // 받아올림·받아내림을 생각하지 않고 결과의 십의 자리 숫자로 바로 구한 값
    const 바로 = isAdd(kind) ? (결과십 - db1 + 10) % 10 : (결과십 + db1) % 10;
    return {
      prompt: `${식글}에서 □ 안에 알맞은 숫자는 무엇일까요?`,
      answer: String(hidden),
      wrongs: [String(바로), String((hidden + 1) % 10), String((hidden + 9) % 10), String(결과십)],
      tag: tagOf(kind),
      concept: 계산핵심(kind),
      strategy: `${꼴이름[kind]}에서 모르는 숫자 구하기`,
      hint: '일의 자리부터 계산해 보세요. 일의 자리에서 받아올림이나 받아내림이 있었는지 확인한 다음 십의 자리를 생각하세요.',
      steps: [
        `□에 ${eul(String(hidden))} 넣으면 ${식(pair)}입니다.`,
        ...columnSteps(pair),
        `계산 결과가 ${결과}이므로 □ 안에 알맞은 숫자는 ${hidden}입니다.`,
      ],
      misconceptionTip: '십의 자리만 보고 구하면 아랫자리에서 받아올리거나 받아내린 1을 빠뜨리기 쉽습니다.',
      selfCheck: '구한 숫자를 □에 넣고 다시 계산하면 결과가 같나요?',
    };
  },
});

// ── 8. 계산 결과가 가장 큰 것 ───────────────────────────────────────
const 가장큰문항 = (kind: Kind): G5Family => ({
  id: `biggest-${kind}`,
  make: (seed) => {
    const pairs: Pair[] = [];
    for (let at = 0; at < 12 && pairs.length < 4; at += 1) {
      const one = pairFor(kind, seed * 7 + at * 31);
      if (pairs.some((other) => other.result === one.result || Math.abs(other.result - one.result) < 5)) continue;
      pairs.push(one);
    }
    if (pairs.length < 4) return null;
    const best = pairs.reduce((top, one) => (one.result > top.result ? one : top));
    return {
      prompt: '계산 결과가 가장 큰 것은 어느 것일까요?',
      answer: 식(best),
      wrongs: pairs.filter((one) => one !== best).map(식),
      tag: tagOf(kind),
      concept: 계산핵심(kind),
      strategy: `${꼴이름[kind]}의 계산 결과 견주기`,
      hint: '식마다 끝까지 계산해 보세요. 백의 자리만 보고 고르면 받아올림이나 받아내림 때문에 틀릴 수 있습니다.',
      steps: [
        ...pairs.map((one) => `${식(one)}=${one.result}`),
        `가장 큰 값은 ${best.result}이므로 계산 결과가 가장 큰 것은 ${식(best)}입니다.`,
      ],
      misconceptionTip: '앞의 수가 크다고 계산 결과가 큰 것은 아닙니다. 끝까지 계산해서 견주세요.',
      minusIsOperator: true,
    };
  },
});

// ── 9. 덧셈과 뺄셈의 관계로 어떤 수 구하기 ──────────────────────────
// 2학년에서 배운 '덧셈식을 뺄셈식으로, 뺄셈식을 덧셈식으로 나타내기'를
// 세 자리 수로 씁니다. 묻는 계산은 이 차시의 꼴 그대로입니다.
const 어떤수문항 = (kind: Kind): G5Family => ({
  id: `unknown-${kind}`,
  make: (seed) => {
    const pair = pairFor(kind, seed);
    if (isAdd(kind)) {
      // 어떤 수 - b = a  →  어떤 수 = a + b
      return {
        prompt: `어떤 수에서 ${eul(String(pair.b))} 뺐더니 ${iJosa(String(pair.a))} 되었습니다. 어떤 수는 얼마일까요?`,
        answer: String(pair.result),
        wrongs: [String(Math.abs(pair.a - pair.b)), ...wrongResults(pair).map(String)],
        tag: 'addition',
        concept: '뺄셈식 (어떤 수)-■=▲는 덧셈식 ▲+■=(어떤 수)로 바꾸어 나타낼 수 있습니다.',
        strategy: '덧셈과 뺄셈의 관계로 어떤 수 구하기',
        hint: '어떤 수에서 덜어 냈더니 남은 것입니다. 남은 수에 덜어 낸 수를 다시 더하면 처음 수가 됩니다.',
        steps: [
          `어떤 수를 □라 하면 □-${pair.b}=${pair.a}입니다.`,
          `뺄셈식을 덧셈식으로 바꾸면 □=${pair.a}+${pair.b}입니다.`,
          ...columnSteps(pair).slice(0, -1),
          `${pair.a}+${pair.b}=${pair.result}이므로 어떤 수는 ${pair.result}입니다.`,
        ],
        misconceptionTip: '‘뺐더니’라는 말이 나왔다고 뺄셈을 하면 안 됩니다. 처음 수를 구하는 것이므로 거꾸로 더해야 합니다.',
        selfCheck: '구한 수에서 다시 빼 보았을 때 문제의 수가 나오나요?',
      };
    }
    // 어떤 수 + b = a  →  어떤 수 = a - b
    return {
      prompt: `어떤 수에 ${eul(String(pair.b))} 더했더니 ${iJosa(String(pair.a))} 되었습니다. 어떤 수는 얼마일까요?`,
      answer: String(pair.result),
      wrongs: [String(pair.a + pair.b), ...wrongResults(pair).map(String)],
      tag: 'subtraction',
      concept: '덧셈식 (어떤 수)+■=▲는 뺄셈식 ▲-■=(어떤 수)로 바꾸어 나타낼 수 있습니다.',
      strategy: '덧셈과 뺄셈의 관계로 어떤 수 구하기',
      hint: '어떤 수에 더해서 커진 것입니다. 커진 수에서 더한 수를 다시 빼면 처음 수가 됩니다.',
      steps: [
        `어떤 수를 □라 하면 □+${pair.b}=${pair.a}입니다.`,
        `덧셈식을 뺄셈식으로 바꾸면 □=${pair.a}-${pair.b}입니다.`,
        ...columnSteps(pair).slice(0, -1),
        `${pair.a}-${pair.b}=${pair.result}이므로 어떤 수는 ${pair.result}입니다.`,
      ],
      misconceptionTip: '‘더했더니’라는 말이 나왔다고 덧셈을 하면 안 됩니다. 처음 수를 구하는 것이므로 거꾸로 빼야 합니다.',
      selfCheck: '구한 수에 다시 더해 보았을 때 문제의 수가 나오나요?',
    };
  },
});

// ── 10. 뺄셈을 덧셈으로 확인하기 ────────────────────────────────────
const 확인식문항 = (kind: Kind): G5Family => ({
  id: `check-${kind}`,
  make: (seed) => {
    if (isAdd(kind)) return null;
    const pair = pairFor(kind, seed);
    const { a, b, result: c } = pair;
    return {
      prompt: `${a}-${b}=${eul(String(c))} 바르게 계산했는지 확인하려고 합니다. 어떤 계산을 해 보면 될까요?`,
      answer: `${c}+${b}=${a}`,
      wrongs: [`${a}+${b}=${a + b}`, `${c}-${b}=${c - b}`, `${a}+${c}=${a + c}`],
      tag: 'subtraction',
      concept: '뺄셈식 ▲-■=●는 덧셈식 ●+■=▲로 바꿀 수 있습니다. 차에 빼는 수를 더하면 빼지는 수가 되어야 합니다.',
      strategy: '덧셈으로 뺄셈의 계산 확인하기',
      hint: '차에 빼는 수를 다시 더하면 무엇이 되어야 할까요?',
      steps: [
        `${a}에서 ${eul(String(b))} 빼서 ${iJosa(String(c))} 남았다면, ${c}에 ${eul(String(b))} 더하면 다시 ${iJosa(String(a))} 되어야 합니다.`,
        `그러므로 ${c}+${b}=${eul(String(a))} 계산해 보면 됩니다.`,
      ],
      misconceptionTip: '빼지는 수와 빼는 수를 더하면 확인이 되지 않습니다. 차와 빼는 수를 더해야 합니다.',
      selfCheck: '덧셈의 결과가 빼지는 수와 같았나요?',
      minusIsOperator: true,
    };
  },
});

// ════════════════════════════════════════════════════════════════════
// 어림셈 차시(5, 9차시)
// ════════════════════════════════════════════════════════════════════

type 어림쌍 = { a: number; b: number; ra: number; rb: number };

const 어림쌍고르기 = (add: boolean, seed: number): 어림쌍 | null => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const a = roundFriendly(next, add ? 1 : 4, add ? 8 : 9);
    const b = roundFriendly(next, 1, add ? 8 : 5);
    const ra = nearestHundred(a);
    const rb = nearestHundred(b);
    if (ra === null || rb === null || ra === 0 || rb === 0) continue;
    if (!add && ra - rb < 200) continue;
    if (add && ra + rb > 1200) continue;
    // 지도서의 예처럼 위로 어림하는 수와 아래로 어림하는 수가 섞이게 합니다.
    if (attempt < 30 && (a > ra) === (b > rb)) continue;
    return { a, b, ra, rb };
  }
  return null;
};

const 어림볼곳 = '수의 십의 자리 숫자를 보세요. 그 수가 위의 몇백과 아래의 몇백 가운데 어느 쪽에 더 가까운지 정해서 바꾸어 쓰세요.';
const 어림오개념 = '백의 자리 숫자만 남기고 나머지를 버리면 안 됩니다. 389는 300보다 400에 더 가까우므로 약 400으로 어림합니다.';

const 가까운몇백풀이 = (value: number, near: number) => {
  const 아래 = Math.floor(value / 100) * 100;
  const 위 = 아래 + 100;
  return `${eun(String(value))} ${gwa(String(아래))} ${위} 사이에 있고 ${near}에 더 가까우므로 약 ${euro(String(near))} 어림합니다.`;
};


// 가까운 몇백으로 어림하기
const 몇백어림문항 = (add: boolean): G5Family => ({
  id: `near-${add ? 'add' : 'sub'}`,
  make: (seed) => {
    const next = rand(seed);
    const value = roundFriendly(next);
    const near = nearestHundred(value);
    if (near === null) return null;
    const 아래 = Math.floor(value / 100) * 100;
    const 반대 = near === 아래 ? 아래 + 100 : 아래;
    const 십 = Math.round(value / 10) * 10;
    return {
      prompt: `${eul(String(value))} 가까운 몇백으로 어림하면 약 얼마일까요?`,
      answer: String(near),
      wrongs: [String(반대), String(십 === near ? near + 10 : 십), String(near === 아래 ? 아래 + 200 : Math.max(100, 아래 - 100)), String(value)],
      tag: 'estimate',
      concept: '어림할 때는 그 수와 가장 가까운 몇백을 찾습니다.',
      strategy: '세 자리 수를 가까운 몇백으로 어림하기',
      hint: 어림볼곳,
      steps: [가까운몇백풀이(value, near)],
      misconceptionTip: 어림오개념,
      selfCheck: '어림한 몇백과 처음 수의 차이가 50보다 작은가요?',
      visual: {
        kind: 'number-line',
        label: `${gwa(String(아래))} ${아래 + 100} 사이의 ${value}`,
        start: 아래,
        end: 아래 + 100,
        step: 10,
        marks: [{ value, label: String(value), active: true }],
      },
    };
  },
});

// 어림셈을 하기 위한 식
const 어림식문항 = (add: boolean): G5Family => ({
  id: `est-expr-${add ? 'add' : 'sub'}`,
  make: (seed) => {
    const one = 어림쌍고르기(add, seed);
    if (!one) return null;
    const op = add ? '+' : '-';
    const 내림 = (v: number) => Math.floor(v / 100) * 100;
    const 올림 = (v: number) => Math.floor(v / 100) * 100 + 100;
    const answer = `${one.ra}${op}${one.rb}`;
    const wrongs = [
      `${내림(one.a)}${op}${내림(one.b)}`,
      `${올림(one.a)}${op}${올림(one.b)}`,
      `${내림(one.a)}${op}${올림(one.b)}`,
      `${올림(one.a)}${op}${내림(one.b)}`,
    ].filter((w) => w !== answer);
    return {
      prompt: `${one.a}${op}${one.b}의 어림셈을 하려고 합니다. 두 수를 각각 가까운 몇백으로 어림하여 나타낸 식은 어느 것일까요?`,
      answer,
      wrongs,
      tag: 'estimate',
      concept: '어림셈은 두 수를 각각 가까운 몇백으로 바꾼 다음 계산합니다.',
      strategy: `${add ? '덧셈' : '뺄셈'}의 어림셈을 하기 위한 식 세우기`,
      hint: 어림볼곳,
      steps: [가까운몇백풀이(one.a, one.ra), 가까운몇백풀이(one.b, one.rb), `어림셈을 하기 위한 식은 ${answer}입니다.`],
      misconceptionTip: 어림오개념,
      minusIsOperator: !add,
    };
  },
});

// 어림셈으로 얼마쯤인지 구하기 (실생활)
const 어림장면덧셈 = [
  (a: number, b: number) => ({ prompt: `놀이공원에 오전에 ${a}명, 오후에 ${b}명이 입장했습니다. 하루 동안 입장한 사람은 약 몇 명인지 어림셈으로 구하면 얼마일까요?`, unit: '명' }),
  (a: number, b: number) => ({ prompt: `집에서 도서관까지는 ${a} m, 도서관에서 학교까지는 ${b} m입니다. 집에서 도서관을 거쳐 학교까지 가는 거리는 약 몇 m인지 어림셈으로 구하면 얼마일까요?`, unit: ' m' }),
  (a: number, b: number) => ({ prompt: `과학관에 어제는 ${a}명, 오늘은 ${b}명이 다녀갔습니다. 이틀 동안 다녀간 사람은 약 몇 명인지 어림셈으로 구하면 얼마일까요?`, unit: '명' }),
];
const 어림장면뺄셈 = [
  (a: number, b: number) => ({ prompt: `놀이공원에 입장한 어린이는 ${a}명, 어른은 ${b}명입니다. 어린이는 어른보다 약 몇 명 더 많은지 어림셈으로 구하면 얼마일까요?`, unit: '명' }),
  (a: number, b: number) => ({ prompt: `줄넘기 대회에 이번 달은 ${a}명, 지난달은 ${b}명이 참여했습니다. 이번 달은 지난달보다 약 몇 명 더 많은지 어림셈으로 구하면 얼마일까요?`, unit: '명' }),
  (a: number, b: number) => ({ prompt: `상자에 구슬이 ${a}개 있었는데 ${b}개를 꺼냈습니다. 남은 구슬은 약 몇 개인지 어림셈으로 구하면 얼마일까요?`, unit: '개' }),
];

const 어림값문항 = (add: boolean): G5Family => ({
  id: `est-value-${add ? 'add' : 'sub'}`,
  make: (seed) => {
    const one = 어림쌍고르기(add, seed + 11);
    if (!one) return null;
    const scene = pick(add ? 어림장면덧셈 : 어림장면뺄셈, seed)(one.a, one.b);
    const 값 = add ? one.ra + one.rb : one.ra - one.rb;
    const 내림값 = add
      ? Math.floor(one.a / 100) * 100 + Math.floor(one.b / 100) * 100
      : Math.floor(one.a / 100) * 100 - Math.floor(one.b / 100) * 100;
    const 글 = (v: number) => `약 ${v}${scene.unit}`;
    return {
      prompt: scene.prompt,
      answer: 글(값),
      wrongs: [글(내림값), 글(값 + 100), 글(Math.max(100, 값 - 100)), 글(값 + 200)].filter((w) => w !== 글(값)),
      tag: 'estimate',
      concept: '어림셈은 두 수를 각각 가까운 몇백으로 바꾼 다음 계산합니다.',
      strategy: `${add ? '덧셈' : '뺄셈'}의 어림셈으로 실생활 문제 해결하기`,
      hint: 어림볼곳,
      steps: [
        가까운몇백풀이(one.a, one.ra),
        가까운몇백풀이(one.b, one.rb),
        `어림셈을 하면 ${one.ra}${add ? '+' : '-'}${one.rb}=${값}이므로 ${글(값)}입니다.`,
      ],
      misconceptionTip: 어림오개념,
    };
  },
});

// 어림셈으로 계산 결과가 알맞은지 판단하기
const 알맞은값문항 = (add: boolean): G5Family => ({
  id: `est-check-${add ? 'add' : 'sub'}`,
  make: (seed) => {
    const one = 어림쌍고르기(add, seed + 23);
    if (!one) return null;
    const exact = add ? one.a + one.b : one.a - one.b;
    const 값 = add ? one.ra + one.rb : one.ra - one.rb;
    // 어림한 값에서 200 넘게 떨어진 값만 오답으로 씁니다. 그래야 어림셈만
    // 해도 오답을 가려낼 수 있습니다(정답은 어림한 값에서 60 안쪽입니다).
    const wrongs = [exact + 200, exact - 200, exact + 300, exact - 300]
      .filter((v) => v > 0 && Math.abs(v - 값) >= 140)
      .map(String);
    return {
      prompt: `${one.a}${add ? '+' : '-'}${eul(String(one.b))} 계산한 값을 어림셈으로 알아보려고 합니다. 계산 결과로 알맞은 것은 어느 것일까요?`,
      answer: String(exact),
      wrongs,
      tag: 'estimate',
      concept: '어림셈을 하면 계산 결과가 얼마쯤 될지 미리 알 수 있고, 계산한 값이 알맞은지 확인할 수 있습니다.',
      strategy: '어림셈으로 계산 결과가 알맞은지 판단하기',
      hint: '두 수를 가까운 몇백으로 어림하여 계산해 보세요. 그 값에 가장 가까운 것을 고르면 됩니다.',
      steps: [
        가까운몇백풀이(one.a, one.ra),
        가까운몇백풀이(one.b, one.rb),
        `어림셈을 하면 ${one.ra}${add ? '+' : '-'}${one.rb}=${값}이므로 계산 결과는 ${값}쯤입니다.`,
        `보기 가운데 ${값}에 가장 가까운 것은 ${exact}입니다. 실제로 계산해도 ${one.a}${add ? '+' : '-'}${one.b}=${exact}입니다.`,
      ],
      misconceptionTip: '어림한 값과 계산 결과가 똑같아야 하는 것은 아닙니다. 비슷하면 알맞은 것이고, 많이 다르면 계산을 다시 해야 합니다.',
    };
  },
});

// 어림셈으로 주장이 옳은지 판단하기 (지도서 활동 2)
const 주장문항 = (add: boolean): G5Family => ({
  id: `claim-${add ? 'add' : 'sub'}`,
  make: (seed) => {
    const one = 어림쌍고르기(add, seed + 37);
    if (!one) return null;
    const exact = add ? one.a + one.b : one.a - one.b;
    const 값 = add ? one.ra + one.rb : one.ra - one.rb;
    const next = rand(seed + 5);
    // 기준은 어림한 값보다 100 크거나 작게 잡습니다. 정확한 값도 같은 쪽에
    // 있는지 확인합니다 — 어림으로 내린 판단이 실제와 어긋나면 안 됩니다.
    const 위로 = next(2) === 0;
    const 기준 = 위로 ? 값 + 100 : 값 - 100;
    if (기준 <= 0) return null;
    if (위로 ? exact >= 기준 : exact <= 기준) return null;
    const who = pick(이름들, seed + 4);
    const 주장적다 = next(2) === 0; // '기준보다 적다'고 주장하는지
    const 옳음 = 주장적다 ? 값 < 기준 : 값 > 기준;
    // 뺄셈은 '어린이와 어른의 수의 차'로 말합니다. '어른보다 200명보다
    // 적게 더 많습니다'처럼 비교가 겹치면 3학년이 읽기 어렵습니다.
    const 주장 = add
      ? `오전과 오후에 입장한 사람은 모두 ${기준}명보다 ${주장적다 ? '적습니다' : '많습니다'}`
      : `어린이 수와 어른 수의 차는 ${기준}명보다 ${주장적다 ? '적습니다' : '많습니다'}`;
    const 상황 = add
      ? `놀이공원에 오전에 ${one.a}명, 오후에 ${one.b}명이 입장했습니다.`
      : `놀이공원에 입장한 어린이는 ${one.a}명, 어른은 ${one.b}명입니다.`;
    const 맞는까닭 = `어림셈을 하면 약 ${값}명이므로 ${기준}명보다 ${값 < 기준 ? '적습니다' : '많습니다'}.`;
    return {
      prompt: `${상황} ${iJosa(who)} "${주장}."라고 말했습니다. 어림셈을 이용하여 판단한 것으로 알맞은 것은 어느 것일까요?`,
      answer: `${옳음 ? '옳습니다' : '옳지 않습니다'}. ${맞는까닭}`,
      wrongs: [
        `${옳음 ? '옳지 않습니다' : '옳습니다'}. ${맞는까닭}`,
        `${옳음 ? '옳지 않습니다' : '옳습니다'}. 어림셈을 하면 약 ${위로 ? 값 + 200 : Math.max(100, 값 - 200)}명이므로 ${기준}명보다 ${위로 ? '많습니다' : '적습니다'}.`,
        `${옳음 ? '옳습니다' : '옳지 않습니다'}. 어림셈을 하면 약 ${기준}명이므로 ${기준}명과 같습니다.`,
      ],
      tag: 'estimate',
      concept: '정확히 계산하지 않아도 어림셈으로 구한 값으로 많은지 적은지 판단할 수 있습니다.',
      strategy: `${add ? '덧셈' : '뺄셈'}의 어림셈으로 주장이 옳은지 판단하기`,
      hint: `두 수를 가까운 몇백으로 어림하여 ${add ? '더해' : '빼'} 보세요. 그 값과 ${기준}명을 견주면 됩니다.`,
      steps: [
        가까운몇백풀이(one.a, one.ra),
        가까운몇백풀이(one.b, one.rb),
        `어림셈을 하면 ${one.ra}${add ? '+' : '-'}${one.rb}=${값}이므로 약 ${값}명입니다.`,
        `약 ${값}명은 ${기준}명보다 ${값 < 기준 ? '적으므로' : '많으므로'} ${who}의 말은 ${옳음 ? '옳습니다' : '옳지 않습니다'}.`,
      ],
      misconceptionTip: '어림셈의 값이 기준과 많이 차이 나면 정확히 계산하지 않아도 판단할 수 있습니다.',
      selfCheck: `실제로 계산해 보면 ${exact}명입니다. 어림셈으로 내린 판단과 같은가요?`,
    };
  },
});

// ════════════════════════════════════════════════════════════════════
// 단원 도입(1차시) — 2학년에서 배운 것 떠올리기
// ════════════════════════════════════════════════════════════════════

const 두자리덧셈문항: G5Family = {
  id: 'review-add2',
  make: (seed) => {
    const next = rand(seed);
    for (let at = 0; at < 50; at += 1) {
      const a = 11 + next(80);
      const b = 11 + next(80);
      if ((a % 10) + (b % 10) < 10 || a + b >= 100) continue;
      const sum = a + b;
      return {
        prompt: `${a}+${eul(String(b))} 계산하면 얼마일까요?`,
        answer: String(sum),
        wrongs: [String(sum - 10), `${Math.floor(a / 10) + Math.floor(b / 10)}${(a % 10) + (b % 10)}`, String(sum + 10)],
        tag: 'addition',
        concept: '일의 자리끼리의 합이 10이거나 10보다 크면 십의 자리로 1을 받아올립니다.',
        strategy: '받아올림이 있는 두 자리 수의 덧셈 떠올리기',
        hint: '일의 자리끼리 먼저 더해 보세요. 10이 넘으면 십의 자리로 1을 받아올립니다.',
        steps: [
          `일의 자리: ${a % 10}+${b % 10}=${(a % 10) + (b % 10)}. ${eul(String(sum % 10))} 쓰고 1을 십의 자리로 받아올립니다.`,
          `십의 자리: 1+${Math.floor(a / 10)}+${Math.floor(b / 10)}=${Math.floor(sum / 10)}.`,
          `그러므로 ${a}+${b}=${sum}입니다.`,
        ],
        misconceptionTip: '받아올린 1을 십의 자리에 더하는 것을 잊지 마세요.',
      };
    }
    return null;
  },
};

const 두자리뺄셈문항: G5Family = {
  id: 'review-sub2',
  make: (seed) => {
    const next = rand(seed + 9);
    for (let at = 0; at < 50; at += 1) {
      const a = 31 + next(68);
      const b = 11 + next(a - 20);
      if (a % 10 >= b % 10 || a - b < 10) continue;
      const diff = a - b;
      const 큰작 = Math.abs((a % 10) - (b % 10)) + (Math.floor(a / 10) - Math.floor(b / 10)) * 10;
      return {
        prompt: `${a}-${eul(String(b))} 계산하면 얼마일까요?`,
        answer: String(diff),
        wrongs: [String(큰작), String(diff + 10), String(diff - 10 > 0 ? diff - 10 : diff + 20)],
        tag: 'subtraction',
        concept: '일의 자리끼리 뺄 수 없으면 십의 자리에서 10을 받아내려 뺍니다.',
        strategy: '받아내림이 있는 두 자리 수의 뺄셈 떠올리기',
        hint: '일의 자리끼리 뺄 수 있는지 먼저 보세요. 뺄 수 없으면 십의 자리에서 받아내립니다.',
        steps: [
          `일의 자리: ${a % 10}에서 ${eul(String(b % 10))} 뺄 수 없으므로 십의 자리에서 10을 받아내립니다. ${(a % 10) + 10}-${b % 10}=${diff % 10}.`,
          `십의 자리: ${Math.floor(a / 10)}에서 받아내려 준 1을 뺀 ${Math.floor(a / 10) - 1}에서 ${Math.floor(a / 10) - 1}-${Math.floor(b / 10)}=${Math.floor(diff / 10)}.`,
          `그러므로 ${a}-${b}=${diff}입니다.`,
        ],
        misconceptionTip: '일의 자리에서 큰 수에서 작은 수를 거꾸로 빼면 안 됩니다.',
      };
    }
    return null;
  },
};

const 자릿값문항: G5Family = {
  id: 'review-place',
  make: (seed) => {
    const next = rand(seed + 17);
    for (let at = 0; at < 50; at += 1) {
      const value = 101 + next(898);
      const d = digits(value);
      if (new Set(d).size < 3 || d.includes(0)) continue;
      // 일의 자리는 숫자가 곧 값이라 물을 것이 없습니다.
      const place = 1 + next(2);
      const 이름 = ['일', '십', '백'][place];
      const answer = d[place] * 10 ** place;
      return {
        prompt: `${value}에서 ${이름}의 자리 숫자 ${eun(String(d[place]))} 얼마를 나타낼까요?`,
        answer: String(answer),
        wrongs: [d[place], d[place] * 10, d[place] * 100, d[place] * 1000].filter((v) => v !== answer).map(String),
        tag: 'addition',
        concept: '세 자리 수에서 백의 자리 숫자는 몇백, 십의 자리 숫자는 몇십, 일의 자리 숫자는 몇을 나타냅니다.',
        strategy: '세 자리 수의 자릿값 떠올리기',
        hint: '숫자가 어느 자리에 있는지 보세요. 같은 숫자라도 자리에 따라 나타내는 값이 다릅니다.',
        steps: [
          `${value}=${d[2] * 100}+${d[1] * 10}+${d[0]}입니다.`,
          `${이름}의 자리 숫자 ${eun(String(d[place]))} ${eul(String(answer))} 나타냅니다.`,
        ],
        misconceptionTip: '숫자만 보고 그 숫자 그대로라고 생각하면 안 됩니다. 자리를 함께 보아야 합니다.',
      };
    }
    return null;
  },
};

const 모형읽기문항: G5Family = {
  id: 'review-blocks',
  make: (seed) => {
    const next = rand(seed + 29);
    const 백 = 1 + next(7);
    const 십 = 10 + next(3);
    const 일 = 1 + next(9);
    const value = 백 * 100 + 십 * 10 + 일;
    return {
      prompt: `백 모형 ${백}개, 십 모형 ${십}개, 일 모형 ${일}개가 나타내는 수는 얼마일까요?`,
      answer: String(value),
      wrongs: [`${백}${십}${일}`, String(백 * 100 + (십 - 10) * 10 + 일), String(value + 100)],
      tag: 'addition',
      concept: '십 모형 10개는 백 모형 1개와 같습니다.',
      strategy: '수 모형이 나타내는 수 읽기',
      hint: '십 모형이 10개가 넘습니다. 십 모형 10개를 백 모형 1개로 바꾸어 세어 보세요.',
      steps: [
        십 === 10 ? '십 모형 10개는 백 모형 1개와 같습니다.' : `십 모형 ${십}개는 백 모형 1개와 십 모형 ${십 - 10}개와 같습니다.`,
        `그러면 백 모형 ${백 + 1}개${십 === 10 ? '' : `, 십 모형 ${십 - 10}개`}, 일 모형 ${일}개가 되어 ${value}입니다.`,
      ],
      misconceptionTip: '모형의 개수를 그대로 이어 쓰면 안 됩니다. 10개가 되면 바로 윗자리 모형으로 바꾸어야 합니다.',
      visual: {
        kind: 'place-value',
        label: '수 모형',
        countOnly: true,
        columns: [
          { label: '백', value: 백, blocks: 백 },
          { label: '십', value: 십, blocks: 십 },
          { label: '일', value: 일, blocks: 일 },
        ],
      },
    };
  },
};

const 연산고르기문항: G5Family = {
  id: 'review-choose-op',
  make: (seed) => {
    const next = rand(seed + 41);
    const a = 201 + next(600);
    const b = 101 + next(Math.max(1, a - 150));
    if (b >= a) return null;
    const 장면들: Array<{ prompt: string; answer: string; 까닭: string }> = [
      { prompt: `운동장에 남학생이 ${a}명, 여학생이 ${b}명 있습니다. 운동장에 있는 학생은 모두 몇 명인지 구하는 식은 어느 것일까요?`, answer: `${a}+${b}`, 까닭: '모두 몇 명인지 구하므로 두 수를 더합니다.' },
      { prompt: `색종이가 ${a}장 있었는데 ${b}장을 썼습니다. 남은 색종이는 몇 장인지 구하는 식은 어느 것일까요?`, answer: `${a}-${b}`, 까닭: '쓰고 남은 수를 구하므로 처음 수에서 쓴 수를 뺍니다.' },
      { prompt: `빨간 구슬은 ${a}개, 파란 구슬은 ${b}개입니다. 빨간 구슬은 파란 구슬보다 몇 개 더 많은지 구하는 식은 어느 것일까요?`, answer: `${a}-${b}`, 까닭: '몇 개 더 많은지 구하므로 큰 수에서 작은 수를 뺍니다.' },
    ];
    const scene = pick(장면들, next(99));
    const 다른 = scene.answer.includes('+') ? `${a}-${b}` : `${a}+${b}`;
    return {
      prompt: scene.prompt,
      answer: scene.answer,
      wrongs: [다른, `${a}+${a}`, `${b}+${b}`, `${a}-${b - 100}`],
      tag: scene.answer.includes('+') ? 'addition' : 'subtraction',
      concept: '모두 몇인지 구할 때는 덧셈을, 남은 수나 더 많은 수를 구할 때는 뺄셈을 합니다.',
      strategy: '상황에 알맞은 식 고르기',
      hint: '문제가 무엇을 묻는지 끝까지 읽어 보세요. ‘모두’인지 ‘남은’인지 ‘더 많은’인지가 식을 정합니다.',
      steps: [scene.까닭, `그러므로 알맞은 식은 ${scene.answer}입니다.`],
      misconceptionTip: '문제에 나온 수의 차례대로 더하기만 하면 안 됩니다. 묻는 것을 먼저 읽으세요.',
      minusIsOperator: true,
    };
  },
};

// ════════════════════════════════════════════════════════════════════
// 차시와 수준별 뭉치
// ════════════════════════════════════════════════════════════════════

export const unit1Lesson1 = (difficulty: Difficulty): G5Family[] => {
  if (difficulty === '하') return [두자리덧셈문항, 두자리뺄셈문항, 자릿값문항, 모형읽기문항];
  if (difficulty === '중') return [두자리덧셈문항, 두자리뺄셈문항, 모형읽기문항, 연산고르기문항, 자릿값문항];
  return [모형읽기문항, 연산고르기문항, 두자리덧셈문항, 두자리뺄셈문항];
};

export const unit1Calc = (kind: Kind, difficulty: Difficulty): G5Family[] => {
  if (difficulty === '하') {
    return [
      계산문항(kind),
      자리숫자문항(kind),
      ...(isAdd(kind) ? [수모형문항(kind)] : []),
      ...(kind === 'add0' || kind === 'sub0' ? [] : [받아올림뜻문항(kind)]),
      문장제문항(kind, 0),
    ];
  }
  if (difficulty === '중') {
    return [
      문장제문항(kind, 1),
      문장제문항(kind, 2),
      바르게문항(kind),
      까닭문항(kind),
      계산문항(kind),
      자리숫자문항(kind),
      ...(isAdd(kind) ? [] : [확인식문항(kind)]),
    ];
  }
  return [
    빈칸문항(kind),
    가장큰문항(kind),
    어떤수문항(kind),
    까닭문항(kind),
    문장제문항(kind, 3),
    ...(isAdd(kind) ? [] : [확인식문항(kind)]),
  ];
};

export const unit1Estimate = (add: boolean, difficulty: Difficulty): G5Family[] => {
  if (difficulty === '하') return [몇백어림문항(add), 어림식문항(add), 어림값문항(add)];
  if (difficulty === '중') return [어림식문항(add), 어림값문항(add), 알맞은값문항(add)];
  return [주장문항(add), 알맞은값문항(add), 어림값문항(add)];
};

// 테스트가 오류 유형을 따로 확인할 때 씁니다.
export const forTest = { 실수들 };
export type { G5Spec };
