import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 소수문장제, 소수어떤수, 소수잘못계산, 소수카드 } from '../thinking/fractionDecimal';

// ════════════════════════════════════════════════════════════════════
// 4-2 3단원 소수의 덧셈과 뺄셈
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 소수 두 자리 수 / 소수 세 자리 수 / 소수의
// 크기 비교 / 소수 사이의 관계(10배, 1/10) / 소수 한 자리 수의 덧셈 /
// 소수 두 자리 수의 덧셈 / 소수 한 자리 수의 뺄셈 / 소수 두 자리 수의 뺄셈
//
// 지도서가 못박은 것:
//   · 0.01은 '영 점 영일', 0.37은 '영 점 삼칠'로 소수점 아래는 숫자만 읽습니다.
//   · 소수의 오른쪽 끝자리 0은 생략할 수 있습니다(0.70=0.7).
//   · 크기 비교는 자연수 부분부터, 같으면 소수 첫째 자리부터 차례로
//     비교합니다. '자릿수가 많으면 크다'는 오개념을 짚습니다(0.5>0.47).
//   · 덧셈과 뺄셈은 소수점의 자리를 맞추어 세로로 계산합니다.
//   · 너무 복잡한 계산은 다루지 않습니다.
//
// 부동소수 오차가 나지 않도록 모든 소수를 1000배 한 정수(천분)로 들고
// 다니고, 글로 쓸 때만 소수점을 찍습니다.
// ════════════════════════════════════════════════════════════════════

/** 천분 정수를 소수로 씁니다. 끝자리 0은 지웁니다. 1250 → '1.25' */
export const 소수 = (m: number): string => {
  const sign = m < 0 ? '-' : '';
  const a = Math.abs(m);
  const 정수 = Math.floor(a / 1000);
  const 아래 = String(a % 1000).padStart(3, '0').replace(/0+$/, '');
  return `${sign}${정수}${아래 ? `.${아래}` : ''}`;
};

const 숫자말 = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const 자연수말 = (n: number): string => {
  if (n === 0) return '영';
  const 자리 = ['천', '백', '십', ''];
  return String(n)
    .padStart(4, '0')
    .split('')
    .map(Number)
    .map((d, k) => (d === 0 ? '' : `${d === 1 && k < 3 ? '' : 숫자말[d]}${자리[k]}`))
    .join('');
};
/** 소수를 읽습니다. 소수점 아래는 숫자를 하나씩 읽습니다. 2.05 → 이 점 영오 */
export const 소수읽기 = (m: number): string => {
  const [앞, 뒤] = 소수(m).split('.');
  return 뒤 ? `${자연수말(Number(앞))} 점 ${뒤.split('').map((d) => 숫자말[Number(d)]).join('')}` : 자연수말(Number(앞));
};

const 다른것 = (answer: string, xs: string[]) => [...new Set(xs)].filter((x) => x !== answer && !x.startsWith('-'));

/** places 자리(1~3)의 소수를 천분 정수로 만듭니다. 끝자리는 0이 아닙니다. */
const 소수만들기 = (next: (b: number) => number, places: 1 | 2 | 3, 정수최대 = 9) => {
  const unit = 10 ** (3 - places);
  const 아래 = 사이(next, 1, 10 ** places - 1);
  if (아래 % 10 === 0) return null;
  return 사이(next, 0, 정수최대) * 1000 + 아래 * unit;
};

// ── 소수 두·세 자리 수 ──────────────────────────────────────────────
const 읽기: G5Family = {
  id: 'read',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const places = (lv === '하' ? 2 : [2, 3][next(2)]) as 2 | 3;
    const m = 소수만들기(next, places, 9);
    if (m === null) return null;
    const ans = 소수읽기(m);
    const [앞, 뒤] = 소수(m).split('.');
    // 소수점 아래를 자연수처럼 읽는 실수입니다(0.37 → 영 점 삼십칠).
    const 자연수처럼 = `${자연수말(Number(앞))} 점 ${자연수말(Number(뒤))}`;
    return {
      prompt: `${소수(m)}을(를) 바르게 읽은 것은 어느 것일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [자연수처럼, 소수읽기(m + 10 ** (3 - places)), 소수읽기(m * 10 < 10000 ? m * 10 : m + 1000), `${자연수말(Number(앞))}${자연수말(Number(뒤))}`]),
      tag: 'decimal',
      strategy: '소수 읽기',
      hint: '소수점 아래는 숫자만 하나씩 읽어요.',
      steps: [`${소수(m)}은(는) ${ans}(이)라고 읽습니다.`],
      misconceptionTip: '0.37을 영 점 삼십칠이라고 읽지 않아요.',
    };
  },
};

const 모아쓰기: G5Family = {
  id: 'compose',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const places = lv === '하' ? 2 : 3;
    const 정수 = 사이(next, 1, 9);
    const ds = Array.from({ length: places }, () => 사이(next, 0, 9));
    if (ds[places - 1] === 0) return null;
    const m = 정수 * 1000 + ds.reduce((s, d, k) => s + d * 10 ** (2 - k), 0);
    const 이름 = ['0.1', '0.01', '0.001'];
    const 말 = [`1이 ${정수}개`, ...ds.map((d, k) => (d === 0 ? '' : `${이름[k]}이 ${d}개`)).filter(Boolean)].join(', ');
    const 빠뜨림 = Number(`${정수}${ds.filter((d) => d !== 0).join('')}`);
    const 빠진것 = ds.includes(0) ? `${정수}.${ds.filter((d) => d !== 0).join('')}` : 소수(m + 10 ** (3 - places));
    return {
      prompt: `${말}인 수는 얼마일까요?`,
      answer: 소수(m),
      wrongs: 다른것(소수(m), [빠진것, 소수(m * 10 < 100000 ? m * 10 : m + 1000), String(빠뜨림), 소수(m + 1000)]),
      tag: 'decimal',
      strategy: '자릿값으로 소수 쓰기',
      hint: '0.1은 소수 첫째 자리, 0.01은 둘째 자리, 0.001은 셋째 자리예요.',
      steps: [`각 자리 숫자를 차례로 쓰면 ${소수(m)}입니다.`],
      misconceptionTip: '말하지 않은 자리에는 0을 써야 해요.',
    };
  },
};

const 자리값: G5Family = {
  id: 'digit-value',
  make: (seed) => {
    const next = 고르개(seed);
    const m = 소수만들기(next, 3, 9);
    if (m === null) return null;
    const ds = String(m).padStart(4, '0').split('').map(Number); // [정수, 첫째, 둘째, 셋째]
    const 후보 = [1, 2, 3].filter((k) => ds[k] !== 0 && ds.filter((x) => x === ds[k]).length === 1);
    if (!후보.length) return null;
    const k = 후보[next(후보.length)];
    const d = ds[k];
    const 값 = (place: number) => 소수(d * 10 ** (3 - place));
    const 자리말 = ['일의 자리', '소수 첫째 자리', '소수 둘째 자리', '소수 셋째 자리'][k];
    return {
      prompt: `${소수(m)}에서 숫자 ${d}이(가) 나타내는 수는 얼마일까요?`,
      answer: 값(k),
      wrongs: 다른것(값(k), [String(d), 값(k === 3 ? 1 : k + 1), 값(k === 1 ? 3 : k - 1), 값(0) === String(d) ? 값(k === 2 ? 3 : 2) : 값(0)]),
      tag: 'decimal',
      strategy: '소수의 자릿값',
      hint: '소수점 오른쪽으로 몇째 자리에 있는지 세어 보세요.',
      steps: [`${d}은(는) ${자리말} 숫자입니다.`, `그러므로 ${값(k)}을(를) 나타냅니다.`],
    };
  },
};

// ── 크기 비교 ───────────────────────────────────────────────────────
const 크기비교: G5Family = {
  id: 'compare',
  make: (seed, lv) => {
    const next = 고르개(seed);
    // 자릿수가 많은 쪽이 더 작은 짝을 자주 냅니다(0.5와 0.47).
    const 정수 = 사이(next, 0, lv === '하' ? 3 : 9);
    const a = 정수 * 1000 + 사이(next, 1, 9) * 100;
    const 함정 = next(3) !== 0;
    const b = 함정 ? a - 100 + 사이(next, 1, 99) : 정수 * 1000 + 사이(next, 1, 999);
    if (b === a || b <= 정수 * 1000 || b % 10 === 0) return null;
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const 앞 = next(2) === 0;
    const answer = 앞 ? `${소수(big)} > ${소수(small)}` : `${소수(small)} < ${소수(big)}`;
    return {
      prompt: '두 소수의 크기를 바르게 비교한 것은 어느 것일까요?',
      answer,
      wrongs: 앞 ? [`${소수(big)} < ${소수(small)}`, `${소수(small)} > ${소수(big)}`, `${소수(big)} = ${소수(small)}`] : [`${소수(small)} > ${소수(big)}`, `${소수(big)} < ${소수(small)}`, `${소수(small)} = ${소수(big)}`],
      tag: 'decimal',
      strategy: '소수의 크기 비교',
      hint: '자연수 부분부터, 같으면 소수 첫째 자리부터 차례로 비교해요.',
      steps: [`자연수 부분이 같으므로 소수 첫째 자리부터 비교하면 ${소수(big)}이(가) 더 큽니다.`, `그러므로 ${answer}입니다.`],
      misconceptionTip: '소수점 아래 자릿수가 많다고 더 큰 수가 아니에요. 0.5가 0.47보다 커요.',
    };
  },
};

const 끝자리영: G5Family = {
  id: 'trailing-zero',
  make: (seed) => {
    const next = 고르개(seed);
    const m = 사이(next, 1, 9) * 1000 + 사이(next, 1, 9) * 100;
    const 글 = 소수(m);
    const ans = `${글}0`;
    return {
      prompt: `${글}과(와) 크기가 같은 수는 어느 것일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [`${글.replace('.', '.0')}`, 소수(m * 10), 소수(m + 10)]),
      tag: 'decimal',
      strategy: '소수의 끝자리 0',
      hint: '소수의 오른쪽 끝자리 0은 있어도 없어도 크기가 같아요.',
      steps: [`${글}=${ans}입니다.`],
      misconceptionTip: '소수점 바로 뒤에 0을 넣으면 크기가 바뀌어요.',
    };
  },
};

// ── 소수 사이의 관계 ────────────────────────────────────────────────
const 열배: G5Family = {
  id: 'times-ten',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const m = 소수만들기(next, 2, 9);
    if (m === null) return null;
    const kind = next(lv === '하' ? 2 : 4);
    const 배 = [10, 1 / 10, 100, 1 / 100][kind];
    const 말 = ['10배', '1/10', '100배', '1/100'][kind];
    const v = Math.round(m * 배);
    if (!Number.isInteger(m * 배) || v === 0) return null;
    const 틀린 = [m / 배, m * (배 > 1 ? 배 * 10 : 배 / 10), m, v * 10, v / 10].filter((x) => Number.isInteger(x) && x > 0 && x !== v);
    return {
      prompt: `${소수(m)}의 ${말}은(는) 얼마일까요?`,
      answer: 소수(v),
      wrongs: 다른것(소수(v), 틀린.map(소수).concat([소수(v + 1000)])),
      tag: 'decimal',
      strategy: '소수의 10배, 1/10',
      hint: 배 > 1 ? '10배 하면 소수점이 오른쪽으로 한 자리 옮겨져요.' : '1/10을 하면 소수점이 왼쪽으로 한 자리 옮겨져요.',
      steps: [`${소수(m)}의 ${말}은(는) 소수점을 ${배 > 1 ? '오른쪽' : '왼쪽'}으로 ${배 === 10 || 배 === 0.1 ? '한' : '두'} 자리 옮긴 ${소수(v)}입니다.`],
    };
  },
};

// ── 덧셈과 뺄셈 ─────────────────────────────────────────────────────
const 계산 = (places: 1 | 2, op: '+' | '-'): G5Family => ({
  id: `${op === '+' ? 'add' : 'sub'}-${places}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const unit = 10 ** (3 - places);
    const a = 사이(next, 1, lv === '하' ? 99 : 999) * unit;
    // 상: 자릿수가 다른 두 소수(2.5+1.34)도 섞어 소수점 맞추기를 묻습니다.
    const 다른자리 = places === 2 && lv === '상' && next(2) === 0;
    const b = 다른자리 ? 사이(next, 1, 99) * 100 : 사이(next, 1, lv === '하' ? 99 : 999) * unit;
    if (a % 1000 === 0 || b % 1000 === 0) return null;
    if (op === '-' && a <= b) return null;
    const v = op === '+' ? a + b : a - b;
    if (v % 10 !== 0 && places === 1) return null;
    // 소수점을 맞추지 않고 끝을 맞추어 계산한 값입니다.
    const 끝맞춤 = (() => {
      const [x, y] = [소수(a), 소수(b)];
      const 자리 = (s: string) => (s.split('.')[1] ?? '').length;
      if (자리(x) === 자리(y)) return null;
      const nx = Number(x.replace('.', ''));
      const ny = Number(y.replace('.', ''));
      const r = op === '+' ? nx + ny : nx - ny;
      const k = Math.max(자리(x), 자리(y));
      return r > 0 ? 소수(r * 10 ** (3 - k)) : null;
    })();
    const ans = 소수(v);
    return {
      prompt: `${소수(a)}${op}${소수(b)}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [끝맞춤 ?? 소수(v + 1000), 소수(v + 10 * unit === v ? v + 100 : v + 10 * unit), 소수(v - unit > 0 ? v - unit : v + 2 * unit), 소수(op === '+' ? Math.abs(a - b) : a + b), 소수(v + unit)]).slice(0, 4),
      tag: 'decimal',
      strategy: `소수 ${places === 1 ? '한' : '두'} 자리 수의 ${op === '+' ? '덧셈' : '뺄셈'}`,
      hint: '소수점의 자리를 맞추어 세로로 쓰고, 자연수처럼 계산한 뒤 소수점을 그대로 내려 찍어요.',
      steps: [`소수점을 맞추어 계산하면 ${소수(a)}${op}${소수(b)}=${ans}입니다.`],
      misconceptionTip: '끝을 맞추어 쓰면 안 돼요. 소수점끼리 맞추어야 해요.',
      minusIsOperator: true,
    };
  },
});

const 문장제 = (op: '+' | '-'): G5Family => ({
  id: `story-${op === '+' ? 'add' : 'sub'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 11, 99) * 10;
    const b = 사이(next, 11, 99) * 10;
    if (a % 100 === 0 || b % 100 === 0) return null;
    if (op === '-' && a <= b) return null;
    const v = op === '+' ? a + b : a - b;
    const 장면 = next(2) === 0;
    const 단위 = 장면 ? 'kg' : 'm';
    const prompt =
      op === '+'
        ? 장면
          ? `감자 ${소수(a)} kg과 고구마 ${소수(b)} kg을 샀습니다. 산 것은 모두 몇 kg일까요?`
          : `리본을 ${소수(a)} m 쓰고 ${소수(b)} m 더 썼습니다. 쓴 리본은 모두 몇 m일까요?`
        : 장면
          ? `밀가루가 ${소수(a)} kg 있었는데 ${소수(b)} kg을 썼습니다. 남은 밀가루는 몇 kg일까요?`
          : `철사 ${소수(a)} m 가운데 ${소수(b)} m를 잘라 썼습니다. 남은 철사는 몇 m일까요?`;
    return {
      prompt,
      answer: `${소수(v)} ${단위}`,
      wrongs: 다른것(`${소수(v)} ${단위}`, [소수(op === '+' ? Math.abs(a - b) : a + b), 소수(v + 100), 소수(v > 10 ? v - 10 : v + 20), 소수(v + 1000)].map((x) => `${x} ${단위}`)).slice(0, 4),
      tag: 'decimal',
      strategy: op === '+' ? '소수의 덧셈 문장제' : '소수의 뺄셈 문장제',
      hint: op === '+' ? '모두 몇인지 구하니 덧셈이에요.' : '남은 것을 구하니 뺄셈이에요.',
      steps: [`${소수(a)}${op}${소수(b)}=${소수(v)}이므로 ${소수(v)} ${단위}입니다.`],
      minusIsOperator: true,
    };
  },
});

const 생각 = {
  한자리어떤수: 소수어떤수('4-2-3-1', 1),
  두자리어떤수: 소수어떤수('4-2-3-2', 2),
  한자리잘못: 소수잘못계산('4-2-3-1', 1),
  두자리잘못: 소수잘못계산('4-2-3-2', 2),
  카드: 소수카드('4-2-3'),
  한자리문장제: 소수문장제('4-2-3-1', 1),
  두자리문장제: 소수문장제('4-2-3-2', 2),
};

export const unit3Lesson42 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [읽기, 계산(1, '+')];
    case 2:
      return lv === '하' ? [읽기, 모아쓰기] : [읽기, 모아쓰기, 자리값];
    case 3:
      return [모아쓰기, 자리값, 읽기];
    case 4:
      return lv === '하' ? [크기비교, 끝자리영] : [크기비교, 끝자리영, 생각.카드];
    case 5:
      return [열배, 자리값];
    case 6:
      return lv === '하' ? [계산(1, '+'), 생각.한자리어떤수] : [계산(1, '+'), 문장제('+'), 생각.한자리어떤수, 생각.한자리문장제];
    case 7:
      return lv === '하' ? [계산(2, '+'), 생각.두자리어떤수] : [계산(2, '+'), 문장제('+'), 생각.두자리어떤수, 생각.카드];
    case 8:
      return lv === '하' ? [계산(1, '-'), 생각.한자리어떤수] : [계산(1, '-'), 문장제('-'), 생각.한자리잘못, 생각.한자리문장제];
    case 9:
      return lv === '하' ? [계산(2, '-'), 생각.두자리문장제] : [계산(2, '-'), 문장제('-'), 생각.두자리잘못, 생각.두자리문장제, 생각.카드];
    default:
      return null;
  }
};
