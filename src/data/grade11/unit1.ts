import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eul, eun, gwa, i as 이가 } from '../grade5/util';
import { 고르개, 관형, 물건둘, 물건들, 사이, 셈그림, 수보기, 수준범위, 우리말, 째, 한자어 } from './common';

// ════════════════════════════════════════════════════════════════════
// 1-1 1단원 9까지의 수
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입                    — 그림에서 무엇을 셀지 정하고 센다
//   2 1, 2, 3, 4, 5를 알아볼까요   — 세고, 하나/일 두 가지로 읽는다
//   3 6, 7, 8, 9를 알아볼까요
//   4 순서를 알아볼까요            — 첫째, 둘째 …, 왼쪽·오른쪽에서 몇째
//   5 수의 순서를 알아볼까요       — 1부터 9까지, 9부터 거꾸로
//   6 1만큼 더 큰 수와 1만큼 더 작은 수를 알아볼까요
//   7 0을 알아볼까요               — 아무것도 없는 것, 1보다 1만큼 작은 수
//   8 수의 크기를 비교해 볼까요    — 많다/적다, 크다/작다
//
// 지도서가 못박은 것:
//   · 개수는 우리말(세 개), 차례는 한자어로 읽습니다. '삼 개', '셋 개'로
//     읽지 않습니다. 수만 읽을 때는 하나/일 두 가지 모두 됩니다.
//   · 몇째와 몇 개를 구별합니다. 왼쪽에서 셋째는 하나뿐이고, 세 개는
//     셋을 모두 가리킵니다.
//   · 수의 크기는 '크다, 작다', 물건의 수는 '많다, 적다'로 말합니다.
// ════════════════════════════════════════════════════════════════════

// ── 그림의 물건 세기 ─────────────────────────────────────────────────
const 세기 = (id: string, lo: number, hi: number): G5Family => ({
  id,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const [a, b] = 물건둘(next);
    const n = 사이(next, lo, hi);
    // 상: 두 가지 물건이 함께 있을 때 한 가지만 셉니다.
    if (lv === '상') {
      const m = 사이(next, 1, 9);
      return {
        prompt: `그림에서 ${eun(a.이름)} 몇 ${a.단위}일까요?`,
        answer: `${n}${a.단위}`,
        wrongs: [n + m, m, n + 1, n - 1].filter((v) => v > 0 && v !== n && v <= 18).map((v) => `${v}${a.단위}`),
        tag: 'number',
        strategy: '여러 가지 중 하나만 세기',
        hint: `${a.이름}만 하나씩 짚으며 세어 보세요. ${eun(b.이름)} 세지 않아요.`,
        steps: [`${a.이름}만 하나씩 짚으며 셉니다.`, `${우리말[n]}까지 세었으므로 ${a.이름}${eun(a.이름).slice(a.이름.length)} ${n}${a.단위}입니다.`],
        misconceptionTip: '다른 물건까지 함께 세면 안 돼요.',
        visual: 셈그림(`${a.이름}${gwa(a.이름).slice(a.이름.length)} ${b.이름}`, [
          { count: n, icon: a.icon, name: a.이름 },
          { count: m, icon: b.icon, name: b.이름 },
        ]),
      };
    }
    return {
      prompt: `${a.이름}${eun(a.이름).slice(a.이름.length)} 몇 ${a.단위}일까요?`,
      answer: `${n}${a.단위}`,
      wrongs: [n + 1, n - 1, n + 2, n - 2].filter((v) => v > 0 && v <= 10).map((v) => `${v}${a.단위}`),
      tag: 'number',
      strategy: '그림의 물건 세기',
      hint: '하나씩 짚으며 하나, 둘, 셋 … 세어 보세요.',
      steps: [`${a.이름}${eul(a.이름).slice(a.이름.length)} 하나씩 짚으며 ${Array.from({ length: n }, (_, k) => 우리말[k + 1]).join(', ')} 하고 셉니다.`, `마지막에 센 수가 ${우리말[n]}이므로 ${n}${a.단위}입니다.`],
      misconceptionTip: '같은 것을 두 번 세지 않게, 센 것에 표시하며 세세요.',
      visual: 셈그림(a.이름, [{ count: n, icon: a.icon }]),
    };
  },
});

// ── 수 읽기 ─────────────────────────────────────────────────────────
const 수읽기 = (id: string, lo: number, hi: number): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, lo, hi);
    const 틀린 = [
      `${우리말[n]}, ${한자어[n + 1 > 9 ? n - 1 : n + 1]}`,
      `${우리말[n - 1 >= 1 ? n - 1 : n + 2]}, ${한자어[n - 1 >= 1 ? n - 1 : n + 2]}`,
      `${우리말[n + 1 <= 9 ? n + 1 : n - 2]}, ${한자어[n + 1 <= 9 ? n + 1 : n - 2]}`,
      `${한자어[n]}, ${우리말[n + 1 <= 9 ? n + 1 : n - 1]}`,
    ];
    return {
      prompt: `${eun(String(n))} 무엇이라고 읽을까요?`,
      answer: `${우리말[n]}, ${한자어[n]}`,
      wrongs: 틀린,
      tag: 'number',
      strategy: '수를 두 가지로 읽기',
      hint: `${n}까지 하나, 둘, 셋으로 세어 보고, 일, 이, 삼으로도 세어 보세요.`,
      steps: [`하나, 둘, 셋 …으로 세면 ${n}은(는) ${우리말[n]}입니다.`, `일, 이, 삼 …으로 세면 ${n}은(는) ${한자어[n]}입니다.`, `그러므로 ${n}은(는) ${우리말[n]} 또는 ${한자어[n]}(이)라고 읽습니다.`],
    };
  },
});

// 개수를 말할 때는 우리말(세 개)입니다. 지도서: '일곱 세', '칠 살'처럼
// 섞어 말하지 않습니다.
const 개수말하기 = (id: string, lo: number, hi: number): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 물건들[next(물건들.length)];
    const n = 사이(next, lo, hi);
    const 다른수 = n + 1 <= 9 ? n + 1 : n - 1;
    return {
      prompt: `${a.이름}의 수를 바르게 말한 것은 어느 것일까요?`,
      answer: `${a.이름} ${관형[n]} ${a.단위}`,
      wrongs: [`${a.이름} ${한자어[n]} ${a.단위}`, `${a.이름} ${우리말[n]} ${a.단위}`, `${a.이름} ${관형[다른수]} ${a.단위}`].filter((w) => w !== `${a.이름} ${관형[n]} ${a.단위}`),
      tag: 'number',
      strategy: '물건의 수를 말하기',
      hint: `‘${a.단위}’ 앞에서는 한, 두, 세, 네처럼 말해요.`,
      steps: [`${a.이름}${eul(a.이름).slice(a.이름.length)} 세면 ${우리말[n]}입니다.`, `${a.단위} 앞에서는 ${관형[n]}(이)라고 말하므로 ${a.이름} ${관형[n]} ${a.단위}입니다.`],
      misconceptionTip: `‘${한자어[n]} ${a.단위}’라고 말하지 않아요. 물건의 수는 하나, 둘로 세어 말해요.`,
      visual: 셈그림(a.이름, [{ count: n, icon: a.icon }]),
    };
  },
});

// ── 4차시 순서 ──────────────────────────────────────────────────────
const 몇째 = (from: 'left' | 'right'): G5Family => ({
  id: `ordinal-${from}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const a = 물건들[next(물건들.length)];
    const total = lv === '하' ? 사이(next, 5, 7) : 9;
    const k = 사이(next, 2, total - 1); // 왼쪽에서 k째
    const right = total - k + 1;
    const ans = from === 'left' ? k : right;
    const other = from === 'left' ? right : k;
    return {
      prompt: `색칠한 ${a.이름}${eun(a.이름).slice(a.이름.length)} ${from === 'left' ? '왼쪽' : '오른쪽'}에서 몇째일까요?`,
      answer: 째[ans],
      wrongs: [other, ans + 1, ans - 1].filter((v) => v >= 1 && v <= 9 && v !== ans).map((v) => 째[v]).concat([`${관형[ans] || ans} ${a.단위}`]),
      tag: 'number',
      strategy: '왼쪽·오른쪽에서 몇째인지 세기',
      hint: `${from === 'left' ? '왼쪽' : '오른쪽'} 끝부터 첫째, 둘째 … 하고 세어 보세요.`,
      steps: [`${from === 'left' ? '왼쪽' : '오른쪽'} 끝에 있는 것이 첫째입니다.`, `색칠한 ${a.이름}까지 세면 ${째[ans]}입니다.`],
      misconceptionTip: from === 'right' ? '오른쪽에서 셀 때는 오른쪽 끝부터 세어야 해요.' : '몇째는 하나만 가리키고, 몇 개는 모두를 가리켜요.',
      visual: { kind: 'counters', label: `${a.이름}의 줄`, groups: [{ count: total, icon: a.icon }], line: { marks: [k - 1], sides: true } },
    };
  },
});

const 앞에몇개: G5Family = {
  id: 'ordinal-before',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 물건들[next(물건들.length)];
    const k = 사이(next, 3, 9);
    return {
      prompt: `왼쪽에서 ${째[k]}에 있는 ${a.이름}의 왼쪽에는 ${a.이름}${이가(a.이름).slice(a.이름.length)} 몇 ${a.단위} 있을까요?`,
      answer: `${k - 1}${a.단위}`,
      wrongs: [k, k + 1, k - 2, 9 - k].filter((v) => v >= 0 && v !== k - 1).map((v) => `${v}${a.단위}`),
      tag: 'number',
      strategy: '몇째와 몇 개 구별하기',
      hint: `왼쪽에서 ${째[k]}까지 세어 보고, ${째[k]}보다 왼쪽에 있는 것만 세어 보세요.`,
      steps: [`왼쪽에서 ${째[k]}에 있는 ${a.이름}보다 왼쪽에는 첫째부터 ${째[k - 1]}까지 있습니다.`, `첫째부터 ${째[k - 1]}까지는 ${k - 1}${a.단위}입니다.`],
      misconceptionTip: `${째[k]}에 있는 것은 세지 않아요. 그 왼쪽에 있는 것만 세요.`,
      visual: { kind: 'counters', label: `${a.이름}의 줄`, groups: [{ count: 9, icon: a.icon }], line: { marks: [k - 1], sides: true } },
    };
  },
};

const 몇째와몇개: G5Family = {
  id: 'ordinal-vs-count',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 물건들[next(물건들.length)];
    const k = 사이(next, 3, 8);
    return {
      prompt: `${a.이름} 9${a.단위}${이가(`9${a.단위}`).slice(`9${a.단위}`.length)} 한 줄로 있습니다. 왼쪽에서 ${k}${a.단위}에 색칠할 때와 왼쪽에서 ${째[k]}에 색칠할 때, 색칠하는 ${a.이름}의 수는 각각 몇 ${a.단위}일까요?`,
      answer: `${k}${a.단위}, 1${a.단위}`,
      wrongs: [`${k}${a.단위}, ${k}${a.단위}`, `1${a.단위}, ${k}${a.단위}`, `1${a.단위}, 1${a.단위}`],
      tag: 'number',
      strategy: '몇째와 몇 개 구별하기',
      hint: `‘${k}${a.단위}’는 ${k}${a.단위} 모두, ‘${째[k]}’는 한 ${a.단위}만 가리켜요.`,
      steps: [`왼쪽에서 ${k}${a.단위}에 색칠하면 첫째부터 ${째[k]}까지 모두 ${k}${a.단위}에 색칠합니다.`, `왼쪽에서 ${째[k]}에 색칠하면 ${째[k]}에 있는 1${a.단위}에만 색칠합니다.`, `그러므로 ${k}${a.단위}, 1${a.단위}입니다.`],
      misconceptionTip: '몇째는 하나만 가리켜요.',
    };
  },
};

// ── 5차시 수의 순서 ─────────────────────────────────────────────────
const 빈칸순서 = (down: boolean): G5Family => ({
  id: `order-${down ? 'down' : 'up'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const len = 5;
    const start = down ? 사이(next, len, 9) : 사이(next, 1, 9 - len + 1);
    const seq = Array.from({ length: len }, (_, k) => (down ? start - k : start + k));
    const miss = lv === '하' ? 사이(next, 1, len - 2) : 사이(next, 1, len - 1);
    const ans = seq[miss];
    return {
      prompt: down ? '수를 거꾸로 세었습니다. ?에 알맞은 수는 무엇일까요?' : '수를 순서대로 놓았습니다. ?에 알맞은 수는 무엇일까요?',
      answer: String(ans),
      wrongs: 수보기(ans, [ans + 1, ans - 1, ans + 2, ans - 2, seq[miss - 1]], 0, 9),
      tag: 'number',
      strategy: down ? '거꾸로 세기' : '순서대로 세기',
      hint: down ? `${seq[miss - 1]} 다음에 거꾸로 세면 무엇이 오는지 생각해 보세요.` : `${seq[miss - 1]} 다음에 오는 수를 생각해 보세요.`,
      steps: [down ? `${seq[0]}부터 거꾸로 세면 ${seq.join(', ')}입니다.` : `${seq[0]}부터 순서대로 세면 ${seq.join(', ')}입니다.`, `그러므로 ?에 알맞은 수는 ${ans}입니다.`],
      visual: { kind: 'pattern', label: '수 카드', items: seq.map(String), missingIndex: miss },
    };
  },
});

const 사이의수: G5Family = {
  id: 'order-between',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 5);
    const b = 사이(next, a + 3, 9);
    const n = b - a - 1;
    const inside = Array.from({ length: n }, (_, k) => a + 1 + k);
    return {
      prompt: `${gwa(String(a))} ${b} 사이에 있는 수는 모두 몇 개일까요?`,
      answer: `${n}개`,
      wrongs: [n + 1, n + 2, n - 1, b - a].filter((v) => v > 0 && v !== n).map((v) => `${v}개`),
      tag: 'number',
      strategy: '두 수 사이의 수 찾기',
      hint: `${a} 다음 수부터 ${b} 바로 앞의 수까지 세어 보세요. ${gwa(String(a))} ${eun(String(b))} 넣지 않아요.`,
      steps: [`${a}부터 ${b}까지 순서대로 쓰면 ${Array.from({ length: b - a + 1 }, (_, k) => a + k).join(', ')}입니다.`, `${gwa(String(a))} ${b} 사이에 있는 수는 ${inside.join(', ')}입니다.`, `그러므로 모두 ${n}개입니다.`],
      misconceptionTip: '양 끝의 두 수는 ‘사이’에 들어가지 않아요.',
    };
  },
};

// ── 6차시 1만큼 더 큰 수, 1만큼 더 작은 수 ──────────────────────────
const 하나큰작은 = (bigger: boolean): G5Family => ({
  id: `one-${bigger ? 'more' : 'less'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const n = bigger ? 사이(next, 1, 8) : 사이(next, 2, 9);
    const ans = bigger ? n + 1 : n - 1;
    const a = 물건들[next(물건들.length)];
    return {
      prompt: `${n}보다 1만큼 더 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [bigger ? n - 1 : n + 1, n, bigger ? n + 2 : n - 2, bigger ? n + 3 : n - 3], 0, 10),
      tag: 'number',
      strategy: `1만큼 더 ${bigger ? '큰' : '작은'} 수 찾기`,
      hint: bigger ? `${n} 바로 다음에 오는 수를 찾아보세요.` : `${n} 바로 앞에 오는 수를 찾아보세요.`,
      steps: [bigger ? `수를 순서대로 셀 때 ${n} 바로 다음 수는 ${ans}입니다.` : `수를 순서대로 셀 때 ${n} 바로 앞의 수는 ${ans}입니다.`, `그러므로 ${n}보다 1만큼 더 ${bigger ? '큰' : '작은'} 수는 ${ans}입니다.`],
      misconceptionTip: bigger ? '1만큼 더 큰 수는 바로 다음 수예요.' : '1만큼 더 작은 수는 바로 앞의 수예요.',
      ...(lv === '하'
        ? { visual: 셈그림(`${a.이름} ${n}${a.단위}`, [{ count: n, icon: a.icon, ...(bigger ? {} : { crossed: 1 }) }]) }
        : {}),
    };
  },
});

const 어떤수: G5Family = {
  id: 'one-reverse',
  make: (seed) => {
    const next = 고르개(seed);
    const bigger = next(2) === 0;
    const m = bigger ? 사이(next, 2, 9) : 사이(next, 1, 8);
    const ans = bigger ? m - 1 : m + 1;
    return {
      prompt: `어떤 수보다 1만큼 더 ${bigger ? '큰' : '작은'} 수는 ${m}입니다. 어떤 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [bigger ? m + 1 : m - 1, m, bigger ? m - 2 : m + 2], 0, 10),
      tag: 'number',
      strategy: '거꾸로 생각하여 어떤 수 찾기',
      hint: `어떤 수 다음이 ${m}인지, 어떤 수 앞이 ${m}인지 생각해 보세요.`,
      steps: [bigger ? `어떤 수 바로 다음 수가 ${m}입니다.` : `어떤 수 바로 앞의 수가 ${m}입니다.`, bigger ? `${m} 바로 앞의 수는 ${ans}입니다.` : `${m} 바로 다음 수는 ${ans}입니다.`, `그러므로 어떤 수는 ${ans}입니다.`],
      misconceptionTip: `${m}보다 1만큼 더 ${bigger ? '큰' : '작은'} 수를 구하면 안 돼요. 거꾸로 생각해요.`,
    };
  },
};

const 두번: G5Family = {
  id: 'one-twice',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 2, 7);
    const ans = n + 2;
    return {
      prompt: `${n}보다 1만큼 더 큰 수보다 1만큼 더 큰 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [n + 1, n, n + 3], 0, 10),
      tag: 'number',
      strategy: '1만큼 더 큰 수를 두 번 찾기',
      hint: `먼저 ${n}보다 1만큼 더 큰 수를 찾고, 그 수보다 1만큼 더 큰 수를 다시 찾아보세요.`,
      steps: [`${n}보다 1만큼 더 큰 수는 ${n + 1}입니다.`, `${n + 1}보다 1만큼 더 큰 수는 ${ans}입니다.`],
      misconceptionTip: '한 번만 하고 멈추면 안 돼요.',
    };
  },
};

// ── 7차시 0 ─────────────────────────────────────────────────────────
const 영남기: G5Family = {
  id: 'zero-left',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 물건들[next(물건들.length)];
    const n = 사이(next, 1, 5);
    return {
      prompt: `${a.이름} ${n}${a.단위}${이가(`${n}${a.단위}`).slice(`${n}${a.단위}`.length)} 있었습니다. 하나씩 덜어 내어 모두 덜어 냈습니다. 남은 ${a.이름}${eun(a.이름).slice(a.이름.length)} 몇 ${a.단위}일까요?`,
      answer: `0${a.단위}`,
      wrongs: [`1${a.단위}`, `${n}${a.단위}`, `${n + 1}${a.단위}`].filter((w) => w !== `0${a.단위}`),
      tag: 'number',
      strategy: '아무것도 없는 것을 0으로 나타내기',
      hint: '모두 덜어 내면 남은 것이 있나요?',
      steps: ['모두 덜어 내면 아무것도 남지 않습니다.', `아무것도 없는 것은 0으로 나타내므로 0${a.단위}입니다.`],
      misconceptionTip: '아무것도 없을 때도 수로 나타낼 수 있어요. 0이에요.',
      visual: 셈그림(`${a.이름} ${n}${a.단위}`, [{ count: n, icon: a.icon, crossed: n }]),
    };
  },
};

const 영찾기: G5Family = {
  id: 'zero-facts',
  make: (seed) => {
    const which = seed % 3;
    if (which === 0) {
      return {
        prompt: '1보다 1만큼 더 작은 수는 무엇일까요?',
        answer: '0',
        wrongs: ['2', '1', '9'],
        tag: 'number',
        strategy: '0의 자리 알기',
        hint: '1 바로 앞에 오는 수를 생각해 보세요.',
        steps: ['수를 거꾸로 세면 3, 2, 1 다음에 0이 옵니다.', '그러므로 1보다 1만큼 더 작은 수는 0입니다.'],
      };
    }
    if (which === 1) {
      return {
        prompt: '0을 바르게 읽은 것은 어느 것일까요?',
        answer: '영',
        wrongs: ['일', '하나', '십'],
        tag: 'number',
        strategy: '0 읽기',
        hint: '아무것도 없는 것을 나타내는 수예요.',
        steps: ['0은 영이라고 읽습니다.'],
      };
    }
    const nums = [0, 1 + (seed % 3), 4 + (seed % 3), 7 + (seed % 3)];
    return {
      prompt: `${nums.slice(1).join(', ')}, 0 가운데 가장 작은 수는 무엇일까요?`,
      answer: '0',
      wrongs: nums.slice(1).map(String),
      tag: 'number',
      strategy: '0과 다른 수 견주기',
      hint: '아무것도 없는 것을 나타내는 수를 찾아보세요.',
      steps: ['0은 아무것도 없는 것을 나타냅니다.', '0은 1보다 작으므로 가장 작은 수는 0입니다.'],
      misconceptionTip: '0은 1보다 1만큼 더 작은 수예요.',
    };
  },
};

const 영순서: G5Family = {
  id: 'zero-order',
  make: (seed) => {
    const next = 고르개(seed);
    const start = 사이(next, 3, 5);
    const seq = Array.from({ length: start + 1 }, (_, k) => start - k);
    return {
      prompt: '수를 거꾸로 세었습니다. ?에 알맞은 수는 무엇일까요?',
      answer: '0',
      wrongs: ['1', '10', String(start + 1)],
      tag: 'number',
      strategy: '0까지 거꾸로 세기',
      hint: '1 다음에 거꾸로 세면 무엇이 올까요?',
      steps: [`${start}부터 거꾸로 세면 ${seq.join(', ')}입니다.`, '그러므로 ?에 알맞은 수는 0입니다.'],
      visual: { kind: 'pattern', label: '수 카드', items: seq.map(String), missingIndex: seq.length - 1 },
    };
  },
};

const 영사이: G5Family = {
  id: 'zero-between',
  make: (seed) => {
    const next = 고르개(seed);
    const b = 사이(next, 3, 7);
    const n = b - 1;
    return {
      prompt: `0과 ${b} 사이에 있는 수는 모두 몇 개일까요?`,
      answer: `${n}개`,
      wrongs: [n + 1, n + 2, n - 1, b].filter((v) => v > 0 && v !== n).map((v) => `${v}개`),
      tag: 'number',
      strategy: '0부터 수의 순서 알기',
      hint: `0 다음 수부터 ${b} 바로 앞의 수까지 세어 보세요.`,
      steps: [`0부터 ${b}까지 순서대로 쓰면 ${Array.from({ length: b + 1 }, (_, k) => k).join(', ')}입니다.`, `0과 ${b} 사이에 있는 수는 ${Array.from({ length: n }, (_, k) => k + 1).join(', ')}입니다.`, `그러므로 모두 ${n}개입니다.`],
      misconceptionTip: '0도 수예요. 하지만 양 끝의 두 수는 ‘사이’에 넣지 않아요.',
    };
  },
};

// ── 8차시 크기 비교 ─────────────────────────────────────────────────
const 많다적다: G5Family = {
  id: 'compare-groups',
  make: (seed) => {
    const next = 고르개(seed);
    const [a, b] = 물건둘(next);
    const n = 사이(next, 2, 9);
    let m = 사이(next, 1, 9);
    if (m === n) m = n === 9 ? 8 : n + 1;
    const more = n > m;
    return {
      prompt: `${a.이름}${eun(a.이름).slice(a.이름.length)} ${b.이름}보다 많을까요, 적을까요?`,
      answer: more ? '많습니다' : '적습니다',
      wrongs: [more ? '적습니다' : '많습니다', '같습니다', more ? '큽니다' : '작습니다'],
      tag: 'number',
      strategy: '하나씩 짝지어 많고 적음 견주기',
      hint: `${a.이름}${gwa(a.이름).slice(a.이름.length)} ${b.이름}${eul(b.이름).slice(b.이름.length)} 하나씩 짝지어 보세요. 남는 쪽이 더 많아요.`,
      steps: [`${a.이름}${eun(a.이름).slice(a.이름.length)} ${n}${a.단위}, ${b.이름}${eun(b.이름).slice(b.이름.length)} ${m}${b.단위}입니다.`, `하나씩 짝지으면 ${more ? a.이름 : b.이름}${이가(more ? a.이름 : b.이름).slice((more ? a.이름 : b.이름).length)} 남습니다.`, `그러므로 ${a.이름}${eun(a.이름).slice(a.이름.length)} ${b.이름}보다 ${more ? '많습니다' : '적습니다'}.`],
      misconceptionTip: '물건의 수는 ‘많다, 적다’로 말해요. ‘크다, 작다’는 수를 견줄 때 써요.',
      visual: 셈그림(`${a.이름}${gwa(a.이름).slice(a.이름.length)} ${b.이름}`, [
        { count: n, icon: a.icon, name: a.이름 },
        { count: m, icon: b.icon, name: b.이름 },
      ]),
    };
  },
};

const 보다큰수 = (bigger: boolean): G5Family => ({
  id: `compare-${bigger ? 'gt' : 'lt'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 3, 7);
    const 정답들 = bigger ? Array.from({ length: 9 - n }, (_, k) => n + 1 + k) : Array.from({ length: n }, (_, k) => k);
    // 오답에는 n 자신을 꼭 넣습니다. '보다 큰'에 같은 수를 고르는 실수입니다.
    const 오답들 = (bigger ? Array.from({ length: n }, (_, k) => k) : Array.from({ length: 9 - n }, (_, k) => n + 1 + k));
    const ans = 정답들[next(정답들.length)];
    const wrongSet = [n, 오답들[next(오답들.length)], 오답들[next(오답들.length)], ...오답들].filter((v, k, all) => all.indexOf(v) === k);
    return {
      prompt: `${n}보다 ${bigger ? '큰' : '작은'} 수는 어느 것일까요?`,
      answer: String(ans),
      wrongs: wrongSet.map(String),
      tag: 'number',
      strategy: `${bigger ? '더 큰' : '더 작은'} 수 찾기`,
      hint: bigger ? `수를 순서대로 셀 때 ${n}보다 뒤에 오는 수가 더 커요.` : `수를 순서대로 셀 때 ${n}보다 앞에 오는 수가 더 작아요.`,
      steps: [`수를 순서대로 세면 ${bigger ? `${n}보다 뒤에` : `${n}보다 앞에`} ${ans}${이가(String(ans)).slice(String(ans).length)} 있습니다.`, `그러므로 ${n}보다 ${bigger ? '큰' : '작은'} 수는 ${ans}입니다.`],
      misconceptionTip: `${n}${gwa(String(n)).slice(String(n).length)} 같은 수는 ${n}보다 ${bigger ? '큰' : '작은'} 수가 아니에요.`,
    };
  },
});

const 가장큰수: G5Family = {
  id: 'compare-most',
  make: (seed) => {
    const next = 고르개(seed);
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const picked: number[] = [];
    while (picked.length < 4) {
      const v = pool[next(pool.length)];
      if (!picked.includes(v)) picked.push(v);
    }
    const biggest = next(2) === 0;
    const ans = biggest ? Math.max(...picked) : Math.min(...picked);
    return {
      prompt: `${picked.join(', ')} 가운데 가장 ${biggest ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: picked.filter((v) => v !== ans).map(String),
      tag: 'number',
      strategy: `가장 ${biggest ? '큰' : '작은'} 수 찾기`,
      hint: biggest ? '수를 순서대로 셀 때 가장 뒤에 오는 수를 찾아보세요.' : '수를 순서대로 셀 때 가장 앞에 오는 수를 찾아보세요.',
      steps: [`네 수를 작은 수부터 늘어놓으면 ${[...picked].sort((x, y) => x - y).join(', ')}입니다.`, `그러므로 가장 ${biggest ? '큰' : '작은'} 수는 ${ans}입니다.`],
    };
  },
};

// ── 차시별 뭉치 ──────────────────────────────────────────────────────
export const unit1Lesson11 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1: {
      const [lo, hi] = 수준범위(lv, [1, 5], [4, 9], [3, 9]);
      return [세기('intro-count', lo, hi), 세기('intro-count2', lo, hi)];
    }
    case 2:
      if (lv === '하') return [세기('count-5', 1, 5), 수읽기('read-5', 1, 5)];
      if (lv === '중') return [수읽기('read-5', 1, 5), 개수말하기('say-5', 1, 5), 세기('count-5', 2, 5)];
      return [개수말하기('say-5', 1, 5), 세기('count-5', 2, 5), 수읽기('read-5', 1, 5)];
    case 3:
      if (lv === '하') return [세기('count-9', 6, 9), 수읽기('read-9', 6, 9)];
      if (lv === '중') return [수읽기('read-9', 6, 9), 개수말하기('say-9', 6, 9), 세기('count-9', 6, 9)];
      return [개수말하기('say-9', 6, 9), 세기('count-9', 6, 9), 수읽기('read-9', 6, 9)];
    case 4:
      if (lv === '하') return [몇째('left'), 몇째('right')];
      if (lv === '중') return [몇째('right'), 몇째('left'), 앞에몇개];
      return [앞에몇개, 몇째와몇개, 몇째('right')];
    case 5:
      if (lv === '하') return [빈칸순서(false)];
      if (lv === '중') return [빈칸순서(true), 빈칸순서(false)];
      return [사이의수, 빈칸순서(true)];
    case 6:
      if (lv === '하') return [하나큰작은(true), 하나큰작은(false)];
      if (lv === '중') return [하나큰작은(false), 하나큰작은(true), 어떤수];
      return [어떤수, 두번];
    case 7:
      if (lv === '하') return [영남기, 영찾기];
      if (lv === '중') return [영찾기, 영순서, 영남기];
      return [영순서, 영찾기, 영사이];
    case 8:
      if (lv === '하') return [많다적다, 보다큰수(true)];
      if (lv === '중') return [보다큰수(true), 보다큰수(false), 많다적다];
      return [가장큰수, 보다큰수(false)];
    default:
      return null;
  }
};
