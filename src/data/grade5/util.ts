// ════════════════════════════════════════════════════════════════════
// 5학년 문항이 쓰는 수 계산
// ────────────────────────────────────────────────────────────────────
// 어림(올림·버림·반올림)은 소수에도 합니다. 지도서 5~7차시가 자연수와
// 소수를 함께 다룹니다 — 52.084를 올림하여 소수 둘째 자리까지, 12.398을
// 버림하여 소수 둘째 자리까지처럼.
//
// 그런데 자바스크립트의 수로 0.1이나 12.398을 다루면 12.398 * 100이
// 1239.7999999999999가 됩니다. 이 값을 올림하면 12.4가 나와야 할 자리에
// 12.4가 아니라 다른 값이 나올 수 있습니다. 답이 하나라도 틀리면 아이가
// 그것을 배우므로, 여기서는 수를 글자로 받아 BigInt로만 셉니다.
// ════════════════════════════════════════════════════════════════════

// 자리의 이름입니다. exp는 10의 몇 제곱 자리인지입니다.
//   4 만, 3 천, 2 백, 1 십, 0 일, -1 소수 첫째, -2 소수 둘째, -3 소수 셋째
export const placeName = (exp: number): string => {
  if (exp >= 0) {
    const names = ['일', '십', '백', '천', '만', '십만', '백만'];
    return `${names[exp] ?? `10의 ${exp}제곱`}의 자리`;
  }
  const names = ['첫째', '둘째', '셋째', '넷째'];
  return `소수 ${names[-exp - 1] ?? `${-exp}째`} 자리`;
};

const split = (value: string) => {
  const [whole, fraction = ''] = value.split('.');
  return { whole, fraction };
};

// 소수 아래 자릿수를 맞추어 정수로 만듭니다.
const scale = (value: string, decimals: number) => {
  const { whole, fraction } = split(value);
  return BigInt(whole + fraction.padEnd(decimals, '0'));
};

const format = (scaled: bigint, decimals: number): string => {
  if (decimals === 0) return scaled.toString();
  const text = scaled.toString().padStart(decimals + 1, '0');
  return `${text.slice(0, text.length - decimals)}.${text.slice(text.length - decimals)}`;
};

export type Rounding = 'ceil' | 'floor' | 'round';

export const roundingName: Record<Rounding, string> = {
  ceil: '올림',
  floor: '버림',
  round: '반올림',
};

/**
 * value를 exp 자리까지 어림합니다. value는 '52.084'처럼 글자로 줍니다.
 *
 * 나오는 값도 글자입니다 — 올림하여 소수 둘째 자리까지 나타낸 값은
 * 1.95이지 1.9500000001이 아니고, 52.1은 52.10이 아니라 52.1입니다.
 * 구하려는 자리까지만 적습니다.
 */
export const estimate = (value: string, exp: number, mode: Rounding): string => {
  const { fraction } = split(value);
  const decimals = Math.max(fraction.length, Math.max(0, -exp));
  const scaled = scale(value, decimals);
  const k = exp + decimals; // 0 이상입니다.
  const unit = 10n ** BigInt(k);
  const q = scaled / unit;
  const remainder = scaled % unit;

  let result: bigint;
  if (mode === 'floor') {
    result = q * unit;
  } else if (mode === 'ceil') {
    result = remainder === 0n ? q * unit : (q + 1n) * unit;
  } else {
    // 반올림은 구하려는 자리 '바로 아래 자리'의 숫자 하나만 봅니다.
    // 아래 수를 모두 보는 올림·버림과 다른 점이고, 지도서가 유의 사항으로
    // 따로 적어 둔 곳이기도 합니다.
    const below = k === 0 ? 0n : (remainder / 10n ** BigInt(k - 1)) % 10n;
    result = below >= 5n ? (q + 1n) * unit : q * unit;
  }

  const outDecimals = Math.max(0, -exp);
  const drop = 10n ** BigInt(decimals - outDecimals);
  return format(result / drop, outDecimals);
};

/** value에서 exp 자리의 숫자 하나입니다. 없으면 0입니다. */
export const digitAt = (value: string, exp: number): number => {
  const { fraction } = split(value);
  const decimals = Math.max(fraction.length, Math.max(0, -exp));
  const scaled = scale(value, decimals);
  const k = exp + decimals;
  return Number((scaled / 10n ** BigInt(k)) % 10n);
};

/** 어림하기 전의 수가 들어갈 수 있는 범위입니다(거꾸로 묻는 문항에서 씁니다). */
export const preimage = (
  target: string,
  exp: number,
  mode: Rounding,
): { fromNatural: number; toNatural: number } => {
  // 자연수만 다룹니다. exp는 0 이상입니다.
  const unit = 10 ** exp;
  const value = Number(target);
  if (mode === 'ceil') return { fromNatural: value - unit + 1, toNatural: value };
  if (mode === 'floor') return { fromNatural: value, toNatural: value + unit - 1 };
  return { fromNatural: value - unit / 2, toNatural: value + unit / 2 - 1 };
};

// ── 뽑기 ────────────────────────────────────────────────────────────
// 같은 차시를 다시 열어도 같은 문제가 나오도록, 씨앗에서만 뽑습니다.
// 32비트 안에서만 셈하는 난수입니다(mulberry32).
//
// 처음에는 흔한 선형 합동식(cursor * 1103515245 + 12345)을 썼는데,
// 자바스크립트의 수는 2의 53제곱까지만 정확해서 곱하는 순간 자릿수가
// 잘려 나갔습니다. 그러면 씨앗을 바꿔도 늘 같은 값이 나옵니다. 실제로
// 어떤 문항 뭉치는 서른 번을 불러도 서로 다른 문제가 한 개밖에 나오지
// 않았습니다. Math.imul은 32비트 곱셈을 정확히 하므로 그 일이 없습니다.
export const rand = (seed: number) => {
  let cursor = (seed | 0) >>> 0;
  return (bound: number) => {
    cursor = (cursor + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(cursor ^ (cursor >>> 15), 1 | cursor);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return Math.floor((((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296) * bound);
  };
};

export const pick = <T,>(items: readonly T[], seed: number): T => items[Math.abs(seed) % items.length];

/** 1.947처럼 소수점 아래가 남지 않게 다듬습니다. */
export const trim = (value: number, decimals: number) => value.toFixed(decimals);

// 받침이 있으면 '이/은/을/과', 없으면 '가/는/를/와'입니다.
// 5학년 문장에도 '52.084를', '4605을'처럼 어긋나면 아이가 읽다가 걸립니다.
// 단위는 글자가 아니라 소리로 읽습니다. kg은 '킬로그램'이라 받침이
// 있고(kg이), cm는 '센티미터'라 받침이 없습니다(cm가). 글자 g, m만 보고
// 정하면 'kg가', '3 g가'처럼 어긋납니다.
const unitFinal: Array<[string, boolean]> = [
  ['kg', true], ['mg', true], ['mm', false], ['cm', false], ['km', false],
  ['mL', false], ['kL', false], ['g', true], ['m', false], ['L', false],
  ['t', false], ['%', false], ['℃', false], ['원', true], ['점', true],
];

const hasFinal = (word: string): boolean => {
  const unit = unitFinal.find(([suffix]) => word.endsWith(suffix));
  if (unit) return unit[1];
  const last = word[word.length - 1];
  if (/\d/.test(last)) return [true, true, false, true, false, false, true, true, true, false][Number(last)];
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};

/**
 * 조사만 돌려줍니다.
 *
 * '1과 3/4을'처럼 앞말과 조사를 따로 적어야 할 때 씁니다. 조사는 바로
 * 앞에 오는 소리를 따르므로, 대분수에서는 자연수 부분이 아니라 분수
 * 부분('3/4' → 사분의 삼 → 받침 없음)을 보고 골라야 합니다.
 */
export const particleOf = (word: string, kind: '을' | '은' | '이' | '과'): string => {
  const final = hasFinal(word);
  if (kind === '을') return final ? '을' : '를';
  if (kind === '은') return final ? '은' : '는';
  if (kind === '이') return final ? '이' : '가';
  return final ? '과' : '와';
};

export const eul = (word: string) => `${word}${hasFinal(word) ? '을' : '를'}`;
export const eun = (word: string) => `${word}${hasFinal(word) ? '은' : '는'}`;
export const i = (word: string) => `${word}${hasFinal(word) ? '이' : '가'}`;
export const gwa = (word: string) => `${word}${hasFinal(word) ? '과' : '와'}`;
// '이상'처럼 받침이 있는 말 뒤에는 '이라는', 없으면 '라는'입니다.
// '미만라는 말이'처럼 어긋나면 아이가 문제를 읽다가 걸립니다.
export const iraneun = (word: string) => `${word}${hasFinal(word) ? '이라는' : '라는'}`;

// '으로'와 '로'를 가립니다. 받침이 없거나 받침이 ㄹ이면 '로'입니다.
//   1 일로   7 칠로   8 팔로   (받침이 ㄹ)
//   3 삼으로  6 육으로  10 십으로 (다른 받침)
//   2 이로   4 사로   5 오로   9 구로 (받침 없음)
const endsWithRieul = (word: string): boolean => {
  const last = word[word.length - 1];
  if (/\d/.test(last)) return last === '1' || last === '7' || last === '8';
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 === 8;
};

export const euro = (word: string) => `${word}${hasFinal(word) && !endsWithRieul(word) ? '으로' : '로'}`;

/** 조사 '으로/로'만 돌려줍니다. */
export const euroOf = (word: string) => euro(word).slice(word.length);
