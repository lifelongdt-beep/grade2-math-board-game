import { rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-1 1단원 덧셈과 뺄셈 — 수를 고르고 계산하는 곳
// ────────────────────────────────────────────────────────────────────
// 차시마다 받아올림·받아내림의 횟수가 정해져 있습니다(지도서 단원의
// 전개 계획).
//   2차시 받아올림 없음      6차시 받아내림 없음
//   3차시 받아올림 한 번     7차시 받아내림 한 번
//   4차시 받아올림 여러 번   8차시 받아내림 두 번
// 그 차시가 아직 다루지 않은 꼴이 나오면 아이는 배우지 않은 것을
// 풉니다. 그래서 수를 고를 때마다 횟수를 직접 세어 맞는 것만 씁니다.
//
// 오답은 지도서 '덧셈과 뺄셈의 오류 유형'(최진숙·유현주, 2006)에 실린
// 실수를 그대로 계산해서 만듭니다. 아이가 실제로 쓰는 틀린 답이라야
// 보기에서 그 실수를 가려낼 수 있습니다.
// ════════════════════════════════════════════════════════════════════

export type AddKind = 'add0' | 'add1' | 'add2';
export type SubKind = 'sub0' | 'sub1' | 'sub2';
export type Kind = AddKind | SubKind;

export const isAdd = (kind: Kind): kind is AddKind => kind.startsWith('add');

/** 일·십·백의 자리 숫자입니다. [일, 십, 백] 차례입니다. */
export const digits = (value: number): [number, number, number] => [
  value % 10,
  Math.floor(value / 10) % 10,
  Math.floor(value / 100) % 10,
];

/** 덧셈에서 받아올림이 일어나는 자리입니다. 0 일→십, 1 십→백, 2 백→천 */
export const carriesOf = (a: number, b: number): number[] => {
  const da = digits(a);
  const db = digits(b);
  const out: number[] = [];
  let carry = 0;
  for (let place = 0; place < 3; place += 1) {
    const sum = da[place] + db[place] + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry) out.push(place);
  }
  return out;
};

/**
 * 뺄셈에서 받아내림이 일어나는 자리입니다. 0이면 십의 자리에서 일의
 * 자리로, 1이면 백의 자리에서 십의 자리로 받아내린 것입니다.
 *
 * 602-243처럼 십의 자리가 0이면, 일의 자리로 받아내리려고 먼저 백의
 * 자리에서 십의 자리로 받아내립니다. 교과서는 이것을 받아내림 두 번으로
 * 셉니다(8차시 602-243).
 */
export const borrowsOf = (a: number, b: number): number[] => {
  const da = digits(a);
  const db = digits(b);
  const out: number[] = [];
  let borrow = 0;
  for (let place = 0; place < 3; place += 1) {
    const top = da[place] - borrow;
    borrow = top < db[place] ? 1 : 0;
    if (borrow) out.push(place);
  }
  return out;
};

export type Pair = { a: number; b: number; kind: Kind; result: number };

/** 차시의 꼴에 맞는 두 수를 고릅니다. */
export const pairFor = (kind: Kind, seed: number): Pair => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const a = 101 + next(899);
    const b = 101 + next(899);
    if (a % 100 === 0 || b % 100 === 0) continue; // 몇백은 받아올림을 볼 것이 없습니다.
    if (isAdd(kind)) {
      const carries = carriesOf(a, b);
      if (kind === 'add0' && carries.length !== 0) continue;
      // 3차시는 받아올림이 한 번이고 합이 세 자리 수입니다. 백의 자리에서
      // 받아올림이 일어나 합이 천을 넘는 것은 '여러 번'의 4차시 몫입니다.
      if (kind === 'add1' && (carries.length !== 1 || carries[0] === 2)) continue;
      if (kind === 'add2' && carries.length < 2) continue;
      return { a, b, kind, result: a + b };
    }
    if (a <= b) continue;
    const borrows = borrowsOf(a, b);
    if (kind === 'sub0' && borrows.length !== 0) continue;
    if (kind === 'sub1' && borrows.length !== 1) continue;
    if (kind === 'sub2' && borrows.length !== 2) continue;
    // 차가 두 자리 수보다 작으면 세 자리 수 뺄셈의 모양이 무너집니다.
    if (a - b < 100 && kind !== 'sub2') continue;
    if (a - b < 10) continue;
    return { a, b, kind, result: a - b };
  }
  // 400번 안에 못 찾을 일은 없지만, 혹시라도 빈손이면 교과서 예시를 씁니다.
  const fallback: Record<Kind, [number, number]> = {
    add0: [324, 215], add1: [219, 126], add2: [265, 249],
    sub0: [369, 235], sub1: [475, 328], sub2: [346, 178],
  };
  const [a, b] = fallback[kind];
  return { a, b, kind, result: isAdd(kind) ? a + b : a - b };
};

// ── 지도서의 오류 유형 ──────────────────────────────────────────────

/** 받아올림을 하지 않는 오류: 자리마다 합의 일의 자리 숫자만 씁니다. 379+485 → 754 */
export const addNoCarry = (a: number, b: number) => {
  const da = digits(a);
  const db = digits(b);
  return ((da[0] + db[0]) % 10) + ((da[1] + db[1]) % 10) * 10 + (da[2] + db[2]) * 100;
};

/** 더한 결과를 옆으로 쓰는 오류: 자리마다의 합을 그대로 이어 씁니다. 182+357 → 4139 */
export const addSideways = (a: number, b: number): number | null => {
  const da = digits(a);
  const db = digits(b);
  const parts = [da[2] + db[2], da[1] + db[1], da[0] + db[0]];
  if (parts.every((part) => part < 10)) return null; // 받아올림이 없으면 같은 답이 됩니다.
  return Number(parts.join(''));
};

/** 받아올림을 2번 이상 하는 오류: 받아올린 1을 한 번 더 더합니다. */
export const addDoubleCarry = (a: number, b: number): number | null => {
  const carries = carriesOf(a, b);
  if (!carries.length) return null;
  return a + b + 10 ** (carries[0] + 1);
};

/** 받아올림을 하지 않아도 되는 자리에서 받아올리는 오류입니다. */
export const addAlwaysCarry = (a: number, b: number): number | null => {
  const da = digits(a);
  const db = digits(b);
  const carries = carriesOf(a, b);
  // 일의 자리 합이 10보다 작은데도 1을 받아올렸다고 보는 것입니다.
  if (carries.includes(0) || da[0] + db[0] === 9) return null;
  return a + b + 10;
};

/** 항상 큰 수에서 작은 수를 빼는 오류입니다. 712-365 → 453 */
export const subBigMinusSmall = (a: number, b: number) => {
  const da = digits(a);
  const db = digits(b);
  return Math.abs(da[0] - db[0]) + Math.abs(da[1] - db[1]) * 10 + Math.abs(da[2] - db[2]) * 100;
};

/** 받아내림한 후 1을 빼지 않는 오류: 받아내린 자리마다 10이나 100이 남습니다. */
export const subNoDecrement = (a: number, b: number): number | null => {
  const borrows = borrowsOf(a, b);
  if (!borrows.length) return null;
  return a - b + borrows.reduce((sum, place) => sum + 10 ** (place + 1), 0);
};

/** 0에서 못 빼면 빼는 수의 숫자를 그대로 쓰는 오류입니다. 400-176 → 376 */
export const subZeroCopy = (a: number, b: number): number | null => {
  const da = digits(a);
  const db = digits(b);
  if (!da.slice(0, 2).some((digit, place) => digit === 0 && db[place] > 0)) return null;
  let value = 0;
  let borrow = 0;
  for (let place = 0; place < 3; place += 1) {
    if (place < 2 && da[place] === 0 && db[place] > 0) {
      value += db[place] * 10 ** place;
      continue;
    }
    const top = da[place] - borrow;
    if (top < db[place]) {
      value += (top + 10 - db[place]) * 10 ** place;
      borrow = 1;
    } else {
      value += (top - db[place]) * 10 ** place;
      borrow = 0;
    }
  }
  return value;
};

/** 오류 유형으로 만든 오답들입니다. 답과 같거나 겹치는 것은 build가 거릅니다. */
export const wrongResults = (pair: Pair): number[] => {
  const { a, b, result } = pair;
  const out: Array<number | null> = isAdd(pair.kind)
    ? [
        addNoCarry(a, b),
        addDoubleCarry(a, b),
        addSideways(a, b),
        addAlwaysCarry(a, b),
        // 받아올림이 천의 자리로 넘어간 것을 빠뜨린 값입니다(1251 → 251).
        result >= 1000 ? result - 1000 : null,
        result + 100,
        result - 10,
      ]
    : [
        subBigMinusSmall(a, b),
        subNoDecrement(a, b),
        subZeroCopy(a, b),
        result + 100,
        result - 10,
        result + 10,
      ];
  return out.filter((one): one is number => one !== null && one > 0 && one !== result);
};

// ── 풀이 줄 ─────────────────────────────────────────────────────────

const 자리이름 = ['일', '십', '백'] as const;

/** 교과서처럼 일의 자리부터 한 자리씩 계산하는 풀이입니다. */
export const columnSteps = (pair: Pair): string[] => {
  const { a, b } = pair;
  const da = digits(a);
  const db = digits(b);
  const lines: string[] = [];
  if (isAdd(pair.kind)) {
    let carry = 0;
    for (let place = 0; place < 3; place += 1) {
      const sum = da[place] + db[place] + carry;
      const 식 = carry ? `${da[place]}+${db[place]}+1(받아올림)=${sum}` : `${da[place]}+${db[place]}=${sum}`;
      if (sum >= 10 && place < 2) {
        lines.push(`${자리이름[place]}의 자리: ${식}. ${sum % 10}을 쓰고 1을 ${자리이름[place + 1]}의 자리로 받아올립니다.`);
      } else if (sum >= 10) {
        lines.push(`${자리이름[place]}의 자리: ${식}. ${sum % 10}을 쓰고 1을 천의 자리에 씁니다.`);
      } else {
        lines.push(`${자리이름[place]}의 자리: ${식}.`);
      }
      carry = sum >= 10 ? 1 : 0;
    }
    lines.push(`그러므로 ${a}+${b}=${a + b}입니다.`);
    return lines.map(받침맞추기);
  }
  // 일의 자리
  const 일받음 = da[0] < db[0];
  if (!일받음) {
    lines.push(`일의 자리: ${da[0]}-${db[0]}=${da[0] - db[0]}.`);
  } else if (da[1] > 0) {
    lines.push(`일의 자리: ${da[0]}에서 ${db[0]}을 뺄 수 없으므로 십의 자리에서 10을 받아내립니다. ${da[0] + 10}-${db[0]}=${da[0] + 10 - db[0]}.`);
  } else {
    // 602-243: 십의 자리가 0이라 바로 받아내려 줄 수 없습니다.
    lines.push(`일의 자리: ${da[0]}에서 ${db[0]}을 뺄 수 없는데 십의 자리 숫자가 0입니다. 백의 자리에서 1을 받아내려 십의 자리를 10으로 만들고, 그중 1을 일의 자리로 받아내립니다. ${da[0] + 10}-${db[0]}=${da[0] + 10 - db[0]}.`);
  }
  // 십의 자리
  let 백받음 = false;
  if (일받음 && da[1] === 0) {
    백받음 = true;
    lines.push(`십의 자리: 10에서 일의 자리로 1을 받아내려 주고 남은 9에서 뺍니다. 9-${db[1]}=${9 - db[1]}.`);
  } else {
    const top = da[1] - (일받음 ? 1 : 0);
    const 위글 = 일받음 ? `${da[1]}에서 일의 자리로 받아내려 준 1을 뺀 ${top}` : `${da[1]}`;
    if (top < db[1]) {
      백받음 = true;
      lines.push(`십의 자리: ${위글}에서 ${db[1]}을 뺄 수 없으므로 백의 자리에서 받아내립니다. ${top + 10}-${db[1]}=${top + 10 - db[1]}.`);
    } else {
      lines.push(`십의 자리: ${일받음 ? `${위글}에서 ` : ''}${top}-${db[1]}=${top - db[1]}.`);
    }
  }
  // 백의 자리
  const 백위 = da[2] - (백받음 ? 1 : 0);
  lines.push(`백의 자리: ${백받음 ? `${da[2]}에서 십의 자리로 받아내려 준 1을 뺀 ${백위}에서 ` : ''}${백위}-${db[2]}=${백위 - db[2]}.`);
  lines.push(`그러므로 ${a}-${b}=${a - b}입니다.`);
  return lines.map(받침맞추기);
};

// 숫자 뒤 '을'·'은'을 숫자의 받침에 맞춥니다(2을 → 2를, 5을 → 5를).
const 받침있는숫자 = [true, true, false, true, false, false, true, true, true, false];
const 받침맞추기 = (line: string) =>
  line.replace(/(\d)(을|를)(?=\s)/g, (_, digit: string) => `${digit}${받침있는숫자[Number(digit)] ? '을' : '를'}`);

// ── 어림 ────────────────────────────────────────────────────────────

/** 가까운 몇백입니다. 가운데(몇백오십)는 정해지지 않으므로 null입니다. */
export const nearestHundred = (value: number): number | null => {
  const rest = value % 100;
  if (rest === 50) return null;
  return rest < 50 ? value - rest : value - rest + 100;
};

/**
 * 어림하기에 알맞은 수입니다. 몇백에서 35보다 멀면 위·아래 몇백과의
 * 거리가 비슷해져서 3학년 아이가 어느 쪽인지 바로 정하기 어렵습니다.
 * 지도서의 예(605, 403, 389, 812, 589, 197, 706)는 모두 몇백에서
 * 15 안쪽입니다.
 */
export const roundFriendly = (next: (bound: number) => number, low = 1, high = 9): number => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const hundreds = low + next(high - low + 1);
    const offset = 1 + next(30);
    const value = next(2) === 0 ? hundreds * 100 + offset : hundreds * 100 - offset;
    if (value >= 101 && value <= 999) return value;
  }
  return 405;
};
