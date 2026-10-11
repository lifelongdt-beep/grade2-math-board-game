import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eul, eun, gwa, i as 이가 } from '../grade5/util';
import { 고르개, 물건들, 사이, 셈그림, 수보기, 우리말로, 한자어로 } from './common';

// ════════════════════════════════════════════════════════════════════
// 1-1 5단원 50까지의 수
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입
//   2 9 다음 수를 알아볼까요      — 10(십, 열), 10 만들기, 10 가르기
//   3 십몇을 알아볼까요           — 10개씩 묶음 1개와 낱개
//   4 모으기와 가르기를 해 볼까요  — 19 이하
//   5 10개씩 묶어 세어 볼까요      — 20, 30, 40, 50(이십·스물 …)
//   6 50까지의 수를 세어 볼까요    — 몇십몇
//   7 50까지 수의 순서를 알아볼까요
//   8 수의 크기를 비교해 볼까요    — 묶음 먼저, 같으면 낱개. 세 수 비교
//
// 지도서가 못박은 것:
//   · 수는 50까지입니다.
//   · 모으기·가르기는 19 이하입니다.
//   · 읽기는 한자어끼리, 우리말끼리 읽습니다. 27을 ‘이십일곱’으로 읽지
//     않습니다(‘이십칠’ 또는 ‘스물일곱’).
//   · 크기 비교는 10개씩 묶음의 수를 먼저 보고, 같으면 낱개의 수를 봅니다.
// ════════════════════════════════════════════════════════════════════

const 묶음그림 = (n: number, digits = false) => ({
  kind: 'tens-ones' as const,
  label: '10개씩 묶음과 낱개',
  tens: Math.floor(n / 10),
  ones: n % 10,
  ...(digits ? { showDigits: true } : {}),
});

// ── 도입 ────────────────────────────────────────────────────────────
const 도입세기: G5Family = {
  id: 'intro-count',
  make: (seed) => {
    const next = 고르개(seed);
    const t = 물건들[next(물건들.length)];
    const n = 사이(next, 6, 9);
    return {
      prompt: `${eun(t.이름)} 몇 ${t.단위}일까요?`,
      answer: `${n}${t.단위}`,
      wrongs: [n - 1, n + 1, n + 2, 10].filter((v) => v !== n).map((v) => `${v}${t.단위}`),
      tag: 'number',
      strategy: '9까지의 수 세기',
      hint: '하나씩 짚으며 세어 보세요.',
      steps: [`하나씩 세면 ${n}${t.단위}입니다.`],
      visual: 셈그림(t.이름, [{ count: n, icon: t.icon }]),
    };
  },
};

// ── 10 ─────────────────────────────────────────────────────────────
const 열만들기: G5Family = {
  id: 'make-ten',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const k = lv === '하' ? 사이(next, 6, 9) : 사이(next, 1, 9);
    const ans = 10 - k;
    return {
      prompt: `10이 되려면 바둑돌이 몇 개 더 있어야 할까요?`,
      answer: `${ans}개`,
      wrongs: [ans + 1, ans - 1, k, 10].filter((v) => v > 0 && v !== ans).map((v) => `${v}개`),
      tag: 'number',
      strategy: '10이 되는 두 수 찾기',
      hint: '십 배열판에서 빈칸을 세어 보세요.',
      steps: [`바둑돌이 ${k}개 있습니다.`, `빈칸이 ${ans}칸이므로 ${ans}개 더 있어야 10이 됩니다.`],
      misconceptionTip: '있는 것을 세지 말고 빈칸을 세요.',
      visual: { kind: 'ten-frame', label: `바둑돌 ${k}개`, frames: 1, fills: [{ count: k, color: 'teal' }] },
    };
  },
};

const 열읽기: G5Family = {
  id: 'read-ten',
  make: (seed) => {
    const which = seed % 2;
    if (which === 0) {
      return {
        prompt: '10을 바르게 읽은 것은 어느 것일까요?',
        answer: '십, 열',
        wrongs: ['일, 하나', '구, 아홉', '일영, 열'],
        tag: 'number',
        strategy: '10 읽기',
        hint: '9보다 1만큼 더 큰 수예요.',
        steps: ['10은 십 또는 열이라고 읽습니다.'],
      };
    }
    return {
      prompt: '9보다 1만큼 더 큰 수는 무엇일까요?',
      answer: '10',
      wrongs: ['8', '91', '11'],
      tag: 'number',
      strategy: '9 다음 수 알기',
      hint: '9 바로 다음에 오는 수를 생각해 보세요.',
      steps: ['9보다 1만큼 더 큰 수를 10이라고 씁니다.'],
      misconceptionTip: '9 다음 수는 10이에요. 91이라고 쓰지 않아요.',
    };
  },
};

const 열가르기: G5Family = {
  id: 'split-ten',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    return {
      prompt: `10은 ${gwa(String(a))} 몇으로 가를 수 있을까요?`,
      answer: String(10 - a),
      wrongs: 수보기(10 - a, [a, 11 - a, 9 - a, 10], 0, 10),
      tag: 'number',
      strategy: '10 가르기',
      hint: '십 배열판 10칸을 두 가지 색으로 나누어 보세요.',
      steps: [`10칸 중 ${a}칸을 칠하면 ${10 - a}칸이 남습니다.`, `그러므로 10은 ${gwa(String(a))} ${10 - a}(으)로 가를 수 있습니다.`],
      visual: { kind: 'ten-frame', label: `10을 ${gwa(String(a))} 몇으로`, frames: 1, fills: [{ count: a, color: 'teal' }, { count: 10 - a, color: 'orange' }] },
    };
  },
};

// ── 십몇, 몇십, 몇십몇 세기 ─────────────────────────────────────────
const 묶음세기 = (id: string, lo: number, hi: number, onlyTens = false): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = onlyTens ? 사이(next, lo / 10, hi / 10) * 10 : 사이(next, lo, hi);
    const t = Math.floor(n / 10);
    const o = n % 10;
    const swap = o * 10 + t;
    return {
      prompt: '그림이 나타내는 수는 얼마일까요?',
      answer: String(n),
      wrongs: 수보기(n, [swap, t + o, n + 10, n - 10, n + 1, n - 1], 1, 50),
      tag: 'number',
      strategy: '10개씩 묶음과 낱개로 세기',
      hint: '10개씩 묶음이 몇 개인지, 낱개가 몇 개인지 따로 세어 보세요.',
      steps: [`10개씩 묶음이 ${t}개, 낱개가 ${o}개입니다.`, `그러므로 ${n}입니다.`],
      misconceptionTip: '10개씩 묶음 하나는 1이 아니라 10이에요.',
      visual: 묶음그림(n),
    };
  },
});

const 묶음말로 = (id: string, lo: number, hi: number): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, lo, hi);
    const t = Math.floor(n / 10);
    const o = n % 10;
    const swap = o * 10 + t;
    return {
      prompt: `10개씩 묶음 ${t}개와 낱개 ${o}개인 수는 얼마일까요?`,
      answer: String(n),
      wrongs: 수보기(n, [swap, t + o, n + 10, n + 1, n - 1], 1, 50),
      tag: 'number',
      strategy: '묶음과 낱개로 수 쓰기',
      hint: '10개씩 묶음의 수를 앞에, 낱개의 수를 뒤에 써요.',
      steps: [`10개씩 묶음 ${t}개는 ${t * 10}입니다.`, `${t * 10}과(와) 낱개 ${o}개를 합하면 ${n}입니다.`],
      misconceptionTip: '묶음의 수와 낱개의 수를 더하면 안 돼요.',
    };
  },
});

const 거꾸로묶음: G5Family = {
  id: 'tens-of',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 21, 49);
    const t = Math.floor(n / 10);
    const o = n % 10;
    if (o === 0 || o === t) return null;
    return {
      prompt: `${eun(String(n))} 10개씩 묶음 몇 개와 낱개 몇 개일까요?`,
      answer: `묶음 ${t}개, 낱개 ${o}개`,
      wrongs: [`묶음 ${o}개, 낱개 ${t}개`, `묶음 ${t}개, 낱개 ${o + 1}개`, `묶음 ${n}개, 낱개 0개`],
      tag: 'number',
      strategy: '수를 묶음과 낱개로 나타내기',
      hint: '앞의 숫자는 10개씩 묶음, 뒤의 숫자는 낱개예요.',
      steps: [`${n}의 앞 숫자 ${t}은(는) 10개씩 묶음의 수, 뒤 숫자 ${o}은(는) 낱개의 수입니다.`, `그러므로 묶음 ${t}개, 낱개 ${o}개입니다.`],
    };
  },
};

// ── 읽기 ────────────────────────────────────────────────────────────
const 수읽기 = (id: string, lo: number, hi: number, onlyTens = false): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = onlyTens ? 사이(next, Math.max(1, lo / 10), hi / 10) * 10 : 사이(next, lo, hi);
    const o = n % 10;
    const t = Math.floor(n / 10);
    const 우리 = next(2) === 0;
    const ans = 우리 ? 우리말로(n) : 한자어로(n);
    // 섞어 읽기(이십일곱)와 이웃 수 읽기를 오답으로 둡니다.
    // 몇십을 '셋십', '삼영'처럼 읽는 실수입니다. 다른 방식의 바른 읽기(30에
    // 대한 '삼십')는 오답으로 두지 않습니다. 그것도 맞는 읽기이기 때문입니다.
    const 섞기 = o === 0 ? (우리 ? `${['', '하나', '둘', '셋', '넷', '다섯'][t]}십` : `${['', '일', '이', '삼', '사', '오'][t]}영`) : 우리 ? `${우리말로(t * 10)}${['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'][o]}` : `${한자어로(t * 10)}${['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'][o]}`;
    const 이웃 = 우리 ? 우리말로(n + 1 <= 50 ? n + 1 : n - 1) : 한자어로(n + 1 <= 50 ? n + 1 : n - 1);
    const 바꿈 = o === 0 || o === t ? (우리 ? 우리말로(n - 1) : 한자어로(n - 1)) : 우리 ? 우리말로(o * 10 + t <= 50 ? o * 10 + t : n + 2) : 한자어로(o * 10 + t <= 50 ? o * 10 + t : n + 2);
    return {
      prompt: `${eul(String(n))} ${우리 ? '하나, 둘처럼 세는 말로' : '일, 이처럼 세는 말로'} 바르게 읽은 것은 어느 것일까요?`,
      answer: ans,
      wrongs: [섞기, 이웃, 바꿈],
      tag: 'number',
      strategy: '두 자리 수 읽기',
      hint: 우리 ? '열, 스물, 서른, 마흔, 쉰을 떠올려 보세요.' : '십, 이십, 삼십, 사십, 오십을 떠올려 보세요.',
      steps: [`${n}은(는) ${한자어로(n)} 또는 ${우리말로(n)}(이)라고 읽습니다.`, `그러므로 ${ans}입니다.`],
      misconceptionTip: '한자어와 우리말을 섞어 읽지 않아요. 이십일곱이 아니라 이십칠 또는 스물일곱이에요.',
    };
  },
});

// ── 모으기·가르기(19 이하) ───────────────────────────────────────────
const 큰모으기: G5Family = {
  id: 'join-teen',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const sum = 사이(next, 11, lv === '하' ? 14 : 18);
    const a = 사이(next, sum - 9, 9);
    const b = sum - a;
    return {
      prompt: `${gwa(String(a))} ${eul(String(b))} 모으면 얼마일까요?`,
      answer: String(sum),
      wrongs: 수보기(sum, [sum + 1, sum - 1, sum + 10, Math.abs(a - b), sum - 10 + 1], 1, 19),
      tag: 'number',
      strategy: '십몇 모으기',
      hint: `${a}에 몇을 더 모으면 10이 되는지 먼저 생각해 보세요.`,
      steps: [`${a}에 ${10 - a}을(를) 모으면 10입니다.`, `${b}에서 ${10 - a}을(를) 쓰고 남은 ${b - (10 - a)}을(를) 더 모으면 ${sum}입니다.`],
      visual: { kind: 'ten-frame', label: `${gwa(String(a))} ${b}`, frames: 2, fills: [{ count: a, color: 'teal' }, { count: b, color: 'orange' }] },
    };
  },
};

const 큰가르기: G5Family = {
  id: 'split-teen',
  make: (seed) => {
    const next = 고르개(seed);
    const sum = 사이(next, 11, 18);
    const a = 사이(next, sum - 9, 9);
    const b = sum - a;
    return {
      prompt: `${eun(String(sum))} ${gwa(String(a))} 몇으로 가를 수 있을까요?`,
      answer: String(b),
      wrongs: 수보기(b, [b + 1, b - 1, sum + a, a, sum - 10], 0, 19),
      tag: 'number',
      strategy: '십몇 가르기',
      hint: `${a}에서 몇을 더 세어야 ${sum}${이가(String(sum)).slice(String(sum).length)} 되는지 세어 보세요.`,
      steps: [`${sum}개 중 ${a}개를 한쪽에 두면 다른 쪽에 ${b}개가 남습니다.`, `그러므로 ${b}입니다.`],
      visual: { kind: 'ten-frame', label: `바둑돌 ${sum}개`, frames: 2, fills: [{ count: sum, color: 'teal' }] },
    };
  },
};

// ── 순서 ────────────────────────────────────────────────────────────
const 순서빈칸: G5Family = {
  id: 'order-50',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const len = 5;
    const down = lv === '상' && next(2) === 0;
    const start = down ? 사이(next, 15, 50) : 사이(next, 10, 46);
    const seq = Array.from({ length: len }, (_, k) => (down ? start - k : start + k));
    // 몇십을 넘어가는 자리(29 다음 30)를 자주 비웁니다.
    const crossing = seq.findIndex((v) => v % 10 === 0);
    const miss = crossing > 0 && next(2) === 0 ? crossing : 사이(next, 1, len - 1);
    const ans = seq[miss];
    return {
      prompt: down ? '수를 거꾸로 세었습니다. ?에 알맞은 수는 무엇일까요?' : '수를 순서대로 놓았습니다. ?에 알맞은 수는 무엇일까요?',
      answer: String(ans),
      wrongs: 수보기(ans, [ans + 1, ans - 1, ans + 10, ans - 10, Math.floor(ans / 10) * 10 + 10], 1, 50),
      tag: 'number',
      strategy: down ? '50까지 거꾸로 세기' : '50까지 순서대로 세기',
      hint: `${seq[miss - 1]}보다 1만큼 더 ${down ? '작은' : '큰'} 수를 생각해 보세요.`,
      steps: [`${seq[miss - 1]}보다 1만큼 더 ${down ? '작은' : '큰'} 수는 ${ans}입니다.`, `그러므로 ?에 알맞은 수는 ${ans}입니다.`],
      misconceptionTip: '29 다음은 30이에요. 낱개가 10개가 되면 10개씩 묶음이 하나 늘어요.',
      visual: { kind: 'pattern', label: '수 카드', items: seq.map(String), missingIndex: miss },
    };
  },
};

const 사이의수50: G5Family = {
  id: 'between-50',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 10, 46);
    const b = a + 2;
    return {
      prompt: `${gwa(String(a))} ${b} 사이에 있는 수는 무엇일까요?`,
      answer: String(a + 1),
      wrongs: 수보기(a + 1, [a, b, a + 10, b + 1], 1, 50),
      tag: 'number',
      strategy: '두 수 사이의 수',
      hint: `${a} 바로 다음 수를 생각해 보세요.`,
      steps: [`${a}보다 1만큼 더 큰 수는 ${a + 1}이고, ${a + 1}보다 1만큼 더 큰 수가 ${b}입니다.`, `그러므로 ${gwa(String(a))} ${b} 사이에 있는 수는 ${a + 1}입니다.`],
    };
  },
};

// ── 크기 비교 ───────────────────────────────────────────────────────
const 더큰수: G5Family = {
  id: 'cmp-two',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const sameTens = lv !== '하' && next(2) === 0;
    const a = 사이(next, 11, 49);
    let b = sameTens ? Math.floor(a / 10) * 10 + 사이(next, 0, 9) : 사이(next, 11, 50);
    if (b === a || b > 50) b = a === 11 ? 12 : a - 1;
    const bigger = next(2) === 0;
    const ans = bigger ? Math.max(a, b) : Math.min(a, b);
    const other = ans === a ? b : a;
    return {
      prompt: `${gwa(String(a))} ${b} 가운데 더 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: [String(other), '두 수가 같습니다', String(bigger ? ans + 10 <= 50 ? ans + 10 : ans - 10 : Math.max(1, other - 10 === ans ? ans + 1 : other - 10))],
      tag: 'number',
      strategy: '10개씩 묶음 먼저, 같으면 낱개 견주기',
      hint: '10개씩 묶음의 수를 먼저 견주고, 같으면 낱개의 수를 견주어 보세요.',
      steps: Math.floor(a / 10) === Math.floor(b / 10)
        ? [`10개씩 묶음의 수가 ${Math.floor(a / 10)}(으)로 같습니다.`, `낱개의 수를 견주면 ${ans}이(가) 더 ${bigger ? '큽' : '작습'}니다.`]
        : [`10개씩 묶음의 수를 견주면 ${ans}이(가) 더 ${bigger ? '큽' : '작습'}니다.`],
      misconceptionTip: '낱개의 수부터 견주면 안 돼요. 10개씩 묶음의 수를 먼저 봐요.',
    };
  },
};

const 가장큰수50: G5Family = {
  id: 'cmp-three',
  make: (seed) => {
    const next = 고르개(seed);
    const nums: number[] = [];
    // 묶음은 같고 낱개만 다른 수, 낱개는 크지만 묶음이 작은 수를 섞습니다.
    const t = 사이(next, 2, 4);
    nums.push(t * 10 + 사이(next, 0, 4));
    nums.push(t * 10 + 사이(next, 5, 9));
    nums.push((t - 1) * 10 + 9);
    if (new Set(nums).size < 3) return null;
    const bigger = next(2) === 0;
    const ans = bigger ? Math.max(...nums) : Math.min(...nums);
    const shuffled = [...nums];
    for (let k = shuffled.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]];
    }
    return {
      prompt: `${shuffled.join(', ')} 가운데 가장 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: [...nums.filter((v) => v !== ans).map(String), String(t * 10)].filter((v) => v !== String(ans)),
      tag: 'number',
      strategy: '세 수의 크기 비교',
      hint: '10개씩 묶음의 수를 먼저 견주고, 같으면 낱개의 수를 견주어 보세요.',
      steps: [`작은 수부터 늘어놓으면 ${[...nums].sort((x, y) => x - y).join(', ')}입니다.`, `그러므로 가장 ${bigger ? '큰' : '작은'} 수는 ${ans}입니다.`],
      misconceptionTip: '낱개가 9라도 10개씩 묶음이 적으면 더 작은 수예요.',
    };
  },
};

const 몇십묶음: G5Family = {
  id: 'tens-bundles',
  make: (seed) => {
    const next = 고르개(seed);
    const t = 사이(next, 2, 5);
    const 거꾸로 = next(2) === 0;
    if (거꾸로) {
      return {
        prompt: `${eun(String(t * 10))} 10개씩 묶음 몇 개일까요?`,
        answer: `${t}개`,
        wrongs: [t * 10, t + 1, t - 1, 10].filter((v) => v > 0 && v !== t).map((v) => `${v}개`),
        tag: 'number',
        strategy: '몇십을 10개씩 묶음으로 나타내기',
        hint: '10, 20, 30 …처럼 10씩 세어 보세요.',
        steps: [`10씩 ${t}번 세면 ${t * 10}입니다.`, `그러므로 ${eun(String(t * 10))} 10개씩 묶음 ${t}개입니다.`],
        misconceptionTip: `${t * 10}개가 아니라 묶음의 수를 물었어요.`,
      };
    }
    return {
      prompt: `10개씩 묶음 ${t}개는 얼마일까요?`,
      answer: String(t * 10),
      wrongs: 수보기(t * 10, [t, t * 10 + 10, t * 10 - 10, 10 + t], 1, 50),
      tag: 'number',
      strategy: '10개씩 묶음의 수로 몇십 알기',
      hint: '10, 20, 30 …처럼 10씩 세어 보세요.',
      steps: [`10개씩 묶음을 하나씩 세면 ${Array.from({ length: t }, (_, k) => (k + 1) * 10).join(', ')}입니다.`, `그러므로 ${t * 10}입니다.`],
      misconceptionTip: '10개씩 묶음 하나는 10이에요.',
      visual: 묶음그림(t * 10),
    };
  },
};

const 몇십비교: G5Family = {
  id: 'tens-compare',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 5);
    let b = 사이(next, 1, 5);
    if (b === a) b = a === 5 ? 4 : a + 1;
    const bigger = next(2) === 0;
    const ans = (bigger ? Math.max(a, b) : Math.min(a, b)) * 10;
    const other = ans === a * 10 ? b * 10 : a * 10;
    return {
      prompt: `${gwa(String(a * 10))} ${b * 10} 가운데 더 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: [String(other), '두 수가 같습니다', String(ans / 10)],
      tag: 'number',
      strategy: '몇십의 크기 비교',
      hint: '10개씩 묶음이 몇 개인지 견주어 보세요.',
      steps: [`${eun(String(a * 10))} 10개씩 묶음 ${a}개, ${eun(String(b * 10))} 10개씩 묶음 ${b}개입니다.`, `묶음이 ${bigger ? '많은' : '적은'} ${ans}이(가) 더 ${bigger ? '큽' : '작습'}니다.`],
    };
  },
};

export const unit5Lesson11 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [도입세기];
    case 2:
      if (lv === '하') return [열만들기, 열읽기, 열가르기];
      if (lv === '중') return [열만들기, 열가르기];
      return [열가르기, 열만들기];
    case 3:
      if (lv === '하') return [묶음세기('teen', 11, 19), 묶음말로('teen-word', 11, 19)];
      if (lv === '중') return [묶음세기('teen', 11, 19), 묶음말로('teen-word', 11, 19), 수읽기('teen-read', 11, 19)];
      return [수읽기('teen-read', 11, 19), 더큰수];
    case 4:
      if (lv === '하') return [큰모으기];
      return [큰모으기, 큰가르기];
    case 5:
      if (lv === '하') return [묶음세기('tens', 20, 50, true), 몇십묶음];
      if (lv === '중') return [묶음세기('tens', 20, 50, true), 수읽기('tens-read', 20, 50, true), 몇십묶음, 몇십비교];
      return [수읽기('tens-read', 20, 50, true), 몇십비교, 몇십묶음];
    case 6:
      if (lv === '하') return [묶음세기('tens-ones', 21, 49)];
      if (lv === '중') return [묶음세기('tens-ones', 21, 49), 묶음말로('tens-word', 21, 49), 거꾸로묶음];
      return [수읽기('read-50', 21, 49), 거꾸로묶음, 묶음말로('tens-word', 21, 49)];
    case 7:
      if (lv === '하') return [순서빈칸];
      if (lv === '중') return [순서빈칸, 사이의수50];
      return [순서빈칸, 사이의수50];
    case 8:
      if (lv === '하') return [더큰수];
      if (lv === '중') return [더큰수];
      return [가장큰수50, 더큰수];
    default:
      return null;
  }
};
