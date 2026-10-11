import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun, i as 이가 } from '../grade5/util';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 4-1 1단원 큰 수
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 만 / 다섯 자리 수 / 십만·백만·천만 /
// 억과 조 / 뛰어 세기 / 수의 크기 비교
//
// 지도서가 못박은 것:
//   · 억, 조 단위는 억·조 아래 단위를 생략하여 자릿값에 집중합니다
//     (3245억, 17조처럼).
//   · 큰 수는 네 자리씩 끊어 만, 억, 조를 붙여 읽습니다.
//   · 크기 비교는 자릿수를 먼저, 같으면 높은 자리부터 봅니다.
//
// 자바스크립트의 수는 9천조쯤까지만 정확합니다. 조 단위는 999조까지만
// 씁니다.
// ════════════════════════════════════════════════════════════════════

const 한자 = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

/** 네 자리(0~9999)를 읽습니다. 십·백·천 앞의 1은 읽지 않습니다. */
const 네자리읽기 = (n: number): string => {
  const 자리 = ['천', '백', '십', ''];
  const digits = String(n).padStart(4, '0').split('').map(Number);
  return digits
    .map((d, k) => (d === 0 ? '' : `${d === 1 && k < 3 ? '' : 한자[d]}${자리[k]}`))
    .join('');
};

/** 큰 수를 한글로 읽습니다. 30450072 → 삼천사십오만 칠십이 */
export const 큰수읽기 = (n: number): string => {
  const 단위 = ['', '만', '억', '조'];
  const 묶음: string[] = [];
  let rest = n;
  let k = 0;
  while (rest > 0) {
    const g = rest % 10000;
    if (g > 0) 묶음.unshift(`${네자리읽기(g)}${단위[k]}`);
    rest = Math.floor(rest / 10000);
    k += 1;
  }
  return 묶음.join(' ') || '영';
};

/** 큰 수를 '3045만 72'처럼 숫자와 단위로 씁니다. */
export const 만단위 = (n: number): string => {
  const 단위 = ['', '만', '억', '조'];
  const 묶음: string[] = [];
  let rest = n;
  let k = 0;
  while (rest > 0) {
    const g = rest % 10000;
    if (g > 0) 묶음.unshift(`${g}${단위[k]}`);
    rest = Math.floor(rest / 10000);
    k += 1;
  }
  return 묶음.join(' ') || '0';
};

const 자리이름 = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조', '십조', '백조'];

/** 숫자가 나타내는 값을 '700만'처럼 씁니다. */
const 값이름 = (digit: number, place: number): string => {
  const 단위 = ['', '만', '억', '조'][Math.floor(place / 4)];
  const 안 = digit * 10 ** (place % 4);
  return `${안}${단위}`;
};

/** 0이 몇 개 섞인 큰 수를 만듭니다. 맨 앞 자리는 2 이상입니다. */
const 큰수 = (next: (b: number) => number, digits: number, zeros = 1) => {
  const ds = Array.from({ length: digits }, (_, k) => (k === 0 ? 사이(next, 2, 9) : 사이(next, 0, 9)));
  for (let z = 0; z < zeros; z += 1) ds[사이(next, 1, digits - 1)] = 0;
  return Number(ds.join(''));
};

// ── 도입: 지폐 세기 ─────────────────────────────────────────────────
const 지폐: G5Family = {
  id: 'bills',
  make: (seed) => {
    const next = 고르개(seed);
    const 만 = 사이(next, 2, 9);
    const 천 = 사이(next, 0, 9);
    const 백 = 사이(next, 1, 9);
    const v = 만 * 10000 + 천 * 1000 + 백 * 100;
    return {
      prompt: `만 원짜리 지폐 ${만}장, 천 원짜리 지폐 ${천}장, 백 원짜리 동전 ${백}개는 모두 얼마일까요?`,
      answer: `${v}원`,
      wrongs: [만 * 1000 + 천 * 100 + 백 * 10, 만 * 10000 + 백 * 1000 + 천 * 100, (만 + 천 + 백) * 1000, v + 10000].filter((x) => x !== v).map((x) => `${x}원`),
      tag: 'placeValue',
      strategy: '돈으로 다섯 자리 수 만들기',
      hint: '만 원은 10000원, 천 원은 1000원, 백 원은 100원이에요.',
      steps: [`10000원이 ${만}장이면 ${만 * 10000}원, 1000원이 ${천}장이면 ${천 * 1000}원, 100원이 ${백}개면 ${백 * 100}원입니다.`, `모두 ${v}원입니다.`],
      misconceptionTip: '천 원짜리가 0장이면 천의 자리에 0을 써야 해요.',
    };
  },
};

// ── 만 ──────────────────────────────────────────────────────────────
const 만알기: G5Family = {
  id: 'ten-thousand',
  make: (seed) => {
    const next = 고르개(seed);
    const 기준 = [9000, 9900, 9990, 9999, 8000, 9500][next(6)];
    const 차 = 10000 - 기준;
    const 거꾸로 = next(2) === 0;
    return 거꾸로
      ? {
          prompt: `10000은 ${eun(String(기준))} 얼마만큼 더 큰 수일까요?`.replace(`${eun(String(기준))}`, `${기준}보다`),
          answer: String(차),
          wrongs: [차 * 10, 차 / 10 >= 1 ? 차 / 10 : 차 + 1, 10000 + 차, 기준].filter((x) => x !== 차 && Number.isInteger(x)).map(String),
          tag: 'placeValue',
          strategy: '10000과 가까운 수의 관계',
          hint: `${기준}에서 10000까지 몇을 더 세어야 하는지 생각해 보세요.`,
          steps: [`${기준}+${차}=10000입니다.`, `그러므로 10000은 ${기준}보다 ${차}만큼 더 큰 수입니다.`],
        }
      : {
          prompt: '1000이 10개인 수를 쓰고 읽은 것으로 알맞은 것은 어느 것일까요?',
          answer: '10000, 만',
          wrongs: ['1000, 천', '100000, 십만', '10000, 천'],
          tag: 'placeValue',
          strategy: '10000 알기',
          hint: '1000이 10개이면 몇일까요?',
          steps: ['1000이 10개인 수는 10000이고 만 또는 일만이라고 읽습니다.'],
        };
  },
};

const 천의몇개: G5Family = {
  id: 'thousands',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 2, 9);
    const v = n * 10000;
    return {
      prompt: `1000이 ${n * 10}개인 수는 얼마일까요?`,
      answer: String(v),
      wrongs: [v / 10, v * 10, n * 1000 + 10].map(String),
      tag: 'placeValue',
      strategy: '1000이 10개인 수 알기',
      hint: '1000이 10개이면 10000이에요.',
      steps: [`1000이 10개이면 10000이므로 1000이 ${n * 10}개이면 10000이 ${n}개입니다.`, `그러므로 ${v}입니다.`],
    };
  },
};

// ── 다섯 자리 이상 수 쓰기·읽기 ─────────────────────────────────────
const 자리모아쓰기 = (digits: number): G5Family => ({
  id: `compose-${digits}`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 큰수(next, digits, 1);
    const ds = String(n).split('').map(Number);
    const 이름 = 자리이름.slice(0, digits).reverse();
    // 0인 자리는 말하지 않습니다(지도서: '1000이 0개'라고 쓰지 않음).
    const 말 = ds.map((d, k) => (d === 0 ? '' : `${digits - 1 - k === 4 ? '10000' : 값이름(1, digits - 1 - k)}이 ${d}개`)).filter(Boolean).join(', ');
    const 빠뜨림 = Number(ds.filter((d) => d !== 0).join(''));
    return {
      prompt: `${말}인 수는 얼마일까요?`,
      answer: String(n),
      wrongs: [빠뜨림, n * 10, Math.floor(n / 10), n + 10 ** (digits - 2)].filter((x) => x !== n).map(String),
      tag: 'placeValue',
      strategy: '자릿값으로 수 쓰기',
      hint: '말하지 않은 자리에는 0을 써야 해요.',
      steps: [`각 자리의 숫자를 높은 자리부터 쓰면 ${n}입니다.`, `${n}은(는) ${큰수읽기(n)}(이)라고 읽습니다.`],
      misconceptionTip: '0인 자리를 빠뜨리면 자릿수가 줄어들어요.',
    };
  },
});

const 읽기고르기 = (digits: number): G5Family => ({
  id: `read-${digits}`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 큰수(next, digits, 2);
    const 맞음 = 큰수읽기(n);
    // 0 하나를 빼먹거나, 만 단위를 잘못 끊은 읽기입니다.
    const 틀린1 = 큰수읽기(Math.floor(n / 10));
    const 틀린2 = 큰수읽기(n * 10 > 9e14 ? n + 10 ** (digits - 1) : n * 10);
    const 틀린3 = 큰수읽기(n + 10 ** Math.max(0, digits - 3));
    return {
      prompt: `${eul(String(n))} 바르게 읽은 것은 어느 것일까요?`,
      answer: 맞음,
      wrongs: [틀린1, 틀린2, 틀린3].filter((w) => w !== 맞음),
      tag: 'placeValue',
      strategy: '큰 수 읽기',
      hint: '오른쪽에서부터 네 자리씩 끊어 만, 억, 조를 붙여 읽으세요.',
      steps: [`네 자리씩 끊으면 ${만단위(n)}입니다.`, `그러므로 ${맞음}(이)라고 읽습니다.`],
      misconceptionTip: '숫자가 0인 자리는 읽지 않아요.',
    };
  },
});

function eul(word: string) {
  return `${word}${/[013678]$/.test(word) ? '을' : '를'}`;
}

const 숫자의값 = (digits: number): G5Family => ({
  id: `place-value-${digits}`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 큰수(next, digits, 0);
    const ds = String(n).split('').map(Number);
    // 한 번만 나오는 숫자를 고릅니다.
    const 후보 = ds.map((d, k) => ({ d, k })).filter(({ d }) => d !== 0 && ds.filter((x) => x === d).length === 1);
    if (!후보.length) return null;
    const { d, k } = 후보[next(후보.length)];
    const place = digits - 1 - k;
    // 아홉 자리 아래 수는 값을 모두 숫자로만, 그 이상은 모두 '700만'처럼 단위를 붙여 씁니다.
    // 보기의 꼴이 섞이면 꼴만 보고 답을 고를 수 있기 때문입니다.
    const 글 = (p: number) => (digits >= 9 ? 값이름(d, p) : String(d * 10 ** p));
    const ans = 글(place);
    const 먼자리 = digits >= 9 ? (place + 4 <= 14 ? place + 4 : place - 4) : place + 2 <= digits ? place + 2 : place - 2;
    const 틀린 = [...new Set([글(place + 1), 글(Math.max(0, place - 1)), String(d), 글(Math.max(0, 먼자리))])].filter((w) => w !== ans);
    return {
      prompt: `${n}에서 숫자 ${d}이(가) 나타내는 값은 얼마일까요?`,
      answer: ans,
      wrongs: 틀린,
      tag: 'placeValue',
      strategy: '숫자가 나타내는 값 알기',
      hint: '숫자가 어느 자리에 있는지 오른쪽에서부터 세어 보세요.',
      steps: [`${d}은(는) ${자리이름[place]}의 자리 숫자입니다.`, `그러므로 ${ans}을(를) 나타냅니다.`],
      misconceptionTip: '숫자만 쓰면 안 돼요. 그 자리의 값을 써야 해요.',
    };
  },
});

// ── 억과 조 ─────────────────────────────────────────────────────────
const 억조쓰기: G5Family = {
  id: 'eok-jo',
  make: (seed) => {
    const next = 고르개(seed);
    const 조단위 = next(2) === 0;
    const a = 사이(next, 12, 9999);
    const unit = 조단위 ? 10 ** 12 : 10 ** 8;
    const 이름 = 조단위 ? '조' : '억';
    if (조단위 && a > 999) return null;
    const n = a * unit;
    const zeros = 조단위 ? 12 : 8;
    return {
      prompt: `${a}${이름}을(를) 수로 쓰면 ${a} 뒤에 0을 몇 개 붙여야 할까요?`,
      answer: `${zeros}개`,
      wrongs: [zeros - 4, zeros + 4, zeros - 1, zeros + 1].filter((x) => x > 0).map((x) => `${x}개`),
      tag: 'placeValue',
      strategy: '억, 조를 수로 쓰기',
      hint: `1${이름}${조단위 ? '는' : '은'} 1 뒤에 0이 몇 개인지 떠올려 보세요.`,
      steps: [`1${이름}${조단위 ? '는' : '은'} ${'1'.padEnd(zeros + 1, '0')}입니다.`, `${a}${이름}은(는) ${a} 뒤에 0을 ${zeros}개 붙인 ${n.toLocaleString('en').replace(/,/g, '')}입니다.`],
      misconceptionTip: '억은 0이 8개, 조는 0이 12개예요.',
    };
  },
};

const 억몇배: G5Family = {
  id: 'eok-relation',
  make: (seed) => {
    const which = seed % 3;
    const qs = [
      { prompt: '1000만이 10개인 수는 얼마일까요?', answer: '1억', wrongs: ['1000만', '100억', '1조'], step: '1000만의 10배는 1억입니다.' },
      { prompt: '1000억이 10개인 수는 얼마일까요?', answer: '1조', wrongs: ['1억', '10000억', '100조'], step: '1000억의 10배는 1조입니다.' },
      { prompt: '1억은 1만이 몇 개인 수일까요?', answer: '10000개', wrongs: ['1000개', '100개', '100000개'], step: '1만이 10000개이면 1억입니다.' },
    ][which];
    return {
      prompt: qs.prompt,
      answer: qs.answer,
      wrongs: qs.wrongs,
      tag: 'placeValue',
      strategy: '억과 조의 관계',
      hint: '네 자리마다 단위가 바뀌어요: 만, 억, 조.',
      steps: [qs.step],
    };
  },
};

// ── 뛰어 세기 ───────────────────────────────────────────────────────
const 뛰어세기 = (big: boolean): G5Family => ({
  id: `skip-${big ? 'b' : 's'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const steps = big ? [10 ** 8, 10 ** 9, 10 ** 12] : [10000, 100000, 1000000, 10000000];
    const step = steps[next(steps.length)];
    const start = 큰수(next, big ? 11 : 7, 1);
    if (start + step * 4 > 9e14) return null;
    const seq = Array.from({ length: 4 }, (_, k) => start + step * k);
    const ans = start + step * 4;
    return {
      prompt: `${seq.map(만단위).join(', ')}, □ 에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: 만단위(ans),
      wrongs: [만단위(ans + step), 만단위(seq[3] + step / 10), 만단위(seq[3] + step * 10)].filter((w) => w !== 만단위(ans)),
      tag: 'placeValue',
      strategy: '뛰어 세는 규칙 찾기',
      hint: '어느 자리 숫자가 1씩 커지는지 찾아보세요.',
      steps: [`${만단위(step)}씩 뛰어 센 것입니다.`, `${만단위(seq[3])}에서 ${만단위(step)} 더 뛰어 세면 ${만단위(ans)}입니다.`],
      misconceptionTip: '몇씩 커지는지 이웃한 두 수를 비교해서 찾아요.',
    };
  },
});

// ── 크기 비교 ───────────────────────────────────────────────────────
const 크기비교: G5Family = {
  id: 'compare',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const digits = lv === '하' ? 사이(next, 5, 6) : 사이(next, 7, 9);
    const a = 큰수(next, digits, 1);
    // 상: 자릿수가 같고 높은 자리 몇 개가 같은 수, 하·중: 자릿수가 다른 수도 섞습니다.
    const s = String(a).split('');
    const k = lv === '상' ? 사이(next, 2, digits - 2) : 사이(next, 1, digits - 1);
    s[k] = String((Number(s[k]) + 사이(next, 1, 8)) % 10);
    let b = Number(s.join(''));
    if (lv !== '상' && next(3) === 0) b = Math.floor(a / 10) + 10 ** (digits - 2) * 9;
    if (b === a || String(b).length < 4) return null;
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const first = next(2) === 0;
    const answer = first ? `${big} > ${small}` : `${small} < ${big}`;
    return {
      prompt: '두 수의 크기를 바르게 나타낸 것은 어느 것일까요?',
      answer,
      wrongs: first ? [`${big} < ${small}`, `${small} > ${big}`, `${big} = ${small}`] : [`${small} > ${big}`, `${big} < ${small}`, `${small} = ${big}`],
      tag: 'placeValue',
      strategy: '큰 수의 크기 비교',
      hint: '자릿수가 같은지 먼저 보고, 같으면 높은 자리부터 차례로 비교하세요.',
      steps: [String(a).length !== String(b).length ? `자릿수가 많은 ${big}이(가) 더 큽니다.` : `자릿수가 같으므로 높은 자리부터 비교하면 ${big}이(가) 더 큽니다.`, `그러므로 ${answer}입니다.`],
      misconceptionTip: '맨 앞 숫자만 보면 안 돼요. 자릿수를 먼저 세세요.',
    };
  },
};

const 가장큰수: G5Family = {
  id: 'compare-most',
  make: (seed) => {
    const next = 고르개(seed);
    const base = 큰수(next, 8, 1);
    const nums = [base, base + 10 ** 5 * 사이(next, 1, 3), base - 10 ** 4 * 사이(next, 1, 9), Math.floor(base / 10) + 9 * 10 ** 6];
    if (new Set(nums).size < 4) return null;
    const bigger = next(2) === 0;
    const ans = bigger ? Math.max(...nums) : Math.min(...nums);
    const list = [...nums];
    for (let t = list.length - 1; t > 0; t -= 1) {
      const j = next(t + 1);
      [list[t], list[j]] = [list[j], list[t]];
    }
    return {
      prompt: `${list.join(', ')} 가운데 가장 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: list.filter((x) => x !== ans).map(String),
      tag: 'placeValue',
      strategy: '여러 큰 수의 크기 비교',
      hint: '자릿수를 먼저 세고, 같으면 높은 자리부터 비교하세요.',
      steps: [`작은 수부터 늘어놓으면 ${[...list].sort((x, y) => x - y).join(', ')}입니다.`, `그러므로 가장 ${bigger ? '큰' : '작은'} 수는 ${ans}입니다.`],
      misconceptionTip: '자릿수가 적은 수는 맨 앞 숫자가 커도 더 작아요.',
    };
  },
};

export const unit1Lesson41 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [지폐];
    case 2:
      return lv === '하' ? [만알기, 지폐, 천의몇개] : [만알기, 천의몇개, 지폐];
    case 3:
      if (lv === '하') return [자리모아쓰기(5), 숫자의값(5)];
      return [자리모아쓰기(5), 읽기고르기(5), 숫자의값(5)];
    case 4:
      if (lv === '하') return [숫자의값(7), 자리모아쓰기(6)];
      return [읽기고르기(8), 숫자의값(8), 자리모아쓰기(7)];
    case 5:
      if (lv === '하') return [억몇배, 억조쓰기];
      return [억조쓰기, 읽기고르기(11), 숫자의값(12)];
    case 6:
      return lv === '상' ? [뛰어세기(true), 뛰어세기(false)] : [뛰어세기(false)];
    case 7:
      return lv === '상' ? [가장큰수, 크기비교] : [크기비교];
    default:
      return null;
  }
};

void 이가;
