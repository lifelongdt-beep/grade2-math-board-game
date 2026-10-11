import type { BarGraphVisual, Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 4-1 5단원 막대그래프
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 막대그래프는 무엇일까요 / 막대그래프로
// 어떻게 나타낼까요 / 막대그래프를 어떻게 해석할까요 / 자료를 수집하여
// 막대그래프로 나타내기
//
// 지도서가 못박은 것:
//   · 막대그래프를 읽을 때는 세로(가로) 눈금 한 칸의 크기를 먼저 봅니다.
//   · 막대의 길이로 수량의 많고 적음을 한눈에 비교합니다.
//   · 나타낼 때는 가장 큰 값을 나타낼 수 있게 눈금 수를 정합니다.
//
// 그림의 막대 값은 언제나 눈금 한 칸의 배수로 두어 눈금을 세어 정확히
// 읽을 수 있게 합니다.
// ════════════════════════════════════════════════════════════════════

const 주제들 = [
  { 제목: '좋아하는 과일별 학생 수', 이름: ['사과', '포도', '귤', '딸기', '배'], 단위: '명', 눈금: '학생 수(명)', 무엇: '과일' },
  { 제목: '좋아하는 운동별 학생 수', 이름: ['축구', '줄넘기', '피구', '수영', '야구'], 단위: '명', 눈금: '학생 수(명)', 무엇: '운동' },
  { 제목: '좋아하는 계절별 학생 수', 이름: ['봄', '여름', '가을', '겨울'], 단위: '명', 눈금: '학생 수(명)', 무엇: '계절' },
  { 제목: '마을별 심은 나무 수', 이름: ['가 마을', '나 마을', '다 마을', '라 마을'], 단위: '그루', 눈금: '나무 수(그루)', 무엇: '마을' },
  { 제목: '반별 모은 빈 병 수', 이름: ['1반', '2반', '3반', '4반', '5반'], 단위: '개', 눈금: '병 수(개)', 무엇: '반' },
];

type 자료 = { 주제: (typeof 주제들)[number]; step: number; max: number; bars: Array<{ name: string; value: number }> };

/** 값이 모두 다른 막대 자료를 만듭니다. */
const 자료만들기 = (next: (b: number) => number, lv: Difficulty = '중'): 자료 | null => {
  const 주제 = 주제들[next(주제들.length)];
  const step = lv === '하' ? 1 : [1, 2, 5][next(3)];
  const count = Math.min(주제.이름.length, lv === '하' ? 4 : 사이(next, 4, 5));
  const 칸수 = lv === '하' ? 사이(next, 3, 10) : 사이(next, 3, 12);
  const values: number[] = [];
  let guard = 0;
  while (values.length < count && guard < 100) {
    guard += 1;
    const v = 사이(next, 1, 칸수) * step;
    if (!values.includes(v)) values.push(v);
  }
  if (values.length < count) return null;
  const 큰값 = Math.max(...values);
  const 묶음 = step * 5;
  const max = Math.max(묶음, Math.ceil(큰값 / 묶음) * 묶음);
  return { 주제, step, max, bars: 주제.이름.slice(0, count).map((name, k) => ({ name, value: values[k] })) };
};

const 그림 = (d: 자료, hidden?: string): BarGraphVisual => ({
  kind: 'bar-graph',
  label: d.주제.제목,
  title: d.주제.제목,
  valueLabel: d.주제.눈금,
  step: d.step,
  max: d.max,
  bars: d.bars.map((b) => (b.name === hidden ? { ...b, hidden: true } : b)),
});

const 수들 = (answer: number, xs: number[]) => [...new Set(xs)].filter((x) => x > 0 && x !== answer);

// ── 눈금 한 칸 ──────────────────────────────────────────────────────
const 한칸: G5Family = {
  id: 'step',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, lv === '하' ? '중' : lv);
    if (!d) return null;
    // 눈금마다 수가 적혀 있으면 묻는 뜻이 없으므로 수를 건너 적은 그래프만 씁니다.
    if (Math.round(d.max / d.step / 5) <= 1) return null;
    return {
      prompt: `막대그래프에서 세로 눈금 한 칸은 몇 ${d.주제.단위}을(를) 나타낼까요?`,
      answer: `${d.step}${d.주제.단위}`,
      wrongs: 수들(d.step, [1, 2, 5, 10, d.step * 2]).slice(0, 3).map((x) => `${x}${d.주제.단위}`),
      tag: 'data',
      strategy: '눈금 한 칸의 크기 알기',
      hint: '수가 적힌 두 눈금 사이가 몇 칸인지 세어 보세요.',
      steps: [`수가 적힌 눈금 사이의 값을 칸 수로 나누면 ${d.step}입니다.`, `그러므로 세로 눈금 한 칸은 ${d.step}${d.주제.단위}입니다.`],
      misconceptionTip: '눈금 한 칸이 언제나 1인 것은 아니에요.',
      visual: 그림(d),
    };
  },
};

// ── 값 읽기 ─────────────────────────────────────────────────────────
const 값읽기: G5Family = {
  id: 'read',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, lv);
    if (!d) return null;
    const b = d.bars[next(d.bars.length)];
    const 칸 = b.value / d.step;
    return {
      prompt: `${b.name}의 막대가 나타내는 수는 몇 ${d.주제.단위}일까요?`,
      answer: `${b.value}${d.주제.단위}`,
      wrongs: 수들(b.value, [칸 === b.value ? b.value + 1 : 칸, b.value + d.step, b.value - d.step, b.value + 2 * d.step, b.value + 3 * d.step]).slice(0, 3).map((x) => `${x}${d.주제.단위}`),
      tag: 'data',
      strategy: '막대그래프 읽기',
      hint: '눈금 한 칸의 크기를 먼저 알고, 막대 끝이 몇 칸인지 세어 보세요.',
      steps: [`세로 눈금 한 칸은 ${d.step}${d.주제.단위}입니다.`, `${b.name}의 막대는 ${칸}칸이므로 ${b.value}${d.주제.단위}입니다.`],
      misconceptionTip: '칸 수를 그대로 답하면 안 돼요. 한 칸의 크기를 곱해야 해요.',
      visual: 그림(d),
    };
  },
};

const 가장: G5Family = {
  id: 'most',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, lv);
    if (!d) return null;
    const 많은 = next(2) === 0;
    const pick = d.bars.reduce((m, b) => ((많은 ? b.value > m.value : b.value < m.value) ? b : m));
    const 무엇 = d.주제.무엇;
    const 동사 = d.주제.단위 === '명' ? `좋아하는 학생이 가장 ${많은 ? '많은' : '적은'} ${무엇}` : `${d.주제.눈금.split('(')[0]}가 가장 ${많은 ? '많은' : '적은'} ${무엇}`;
    return {
      prompt: `${동사}은(는) 무엇일까요?`,
      answer: pick.name,
      wrongs: d.bars.filter((b) => b !== pick).map((b) => b.name).slice(0, 3),
      tag: 'data',
      strategy: '막대 길이로 비교하기',
      hint: `막대가 가장 ${많은 ? '긴' : '짧은'} 것을 찾아요.`,
      steps: [`막대가 가장 ${많은 ? '긴' : '짧은'} 것은 ${pick.name}입니다.`],
      visual: 그림(d),
    };
  },
};

const 차이: G5Family = {
  id: 'difference',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, lv);
    if (!d) return null;
    const [a, b] = [...d.bars].sort((x, y) => y.value - x.value).filter((_, k) => k === 0 || k === d.bars.length - 1 - next(2));
    if (!a || !b || a.value === b.value) return null;
    const v = a.value - b.value;
    const 칸 = v / d.step;
    return {
      prompt: `${a.name}은(는) ${b.name}보다 몇 ${d.주제.단위} 더 많을까요?`,
      answer: `${v}${d.주제.단위}`,
      wrongs: 수들(v, [a.value + b.value, 칸 === v ? v + d.step : 칸, v + d.step, v - d.step, v + 2 * d.step]).slice(0, 3).map((x) => `${x}${d.주제.단위}`),
      tag: 'data',
      strategy: '막대그래프에서 차이 구하기',
      hint: '두 막대의 값을 읽어 빼거나, 길이 차이가 몇 칸인지 세어 보세요.',
      steps: [`${a.name}은(는) ${a.value}${d.주제.단위}, ${b.name}은(는) ${b.value}${d.주제.단위}입니다.`, `${a.value}-${b.value}=${v}이므로 ${v}${d.주제.단위} 더 많습니다.`],
      visual: 그림(d),
      minusIsOperator: true,
    };
  },
};

// ── 나타내기 ────────────────────────────────────────────────────────
const 빈막대: G5Family = {
  id: 'missing-bar',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, lv);
    if (!d) return null;
    const hid = d.bars[next(d.bars.length)];
    const 합계 = d.bars.reduce((s, b) => s + b.value, 0);
    return {
      prompt: `조사한 수가 모두 ${합계}${d.주제.단위}입니다. ${hid.name}의 막대(?)가 나타내야 하는 수는 몇 ${d.주제.단위}일까요?`,
      answer: `${hid.value}${d.주제.단위}`,
      wrongs: 수들(hid.value, [hid.value + d.step, hid.value - d.step, 합계 - hid.value, hid.value + 2 * d.step, hid.value + 3 * d.step]).slice(0, 3).map((x) => `${x}${d.주제.단위}`),
      tag: 'data',
      strategy: '합계로 모르는 막대 구하기',
      hint: '전체에서 나머지 막대들의 값을 빼 보세요.',
      steps: [`나머지 막대의 합은 ${합계 - hid.value}${d.주제.단위}입니다.`, `${합계}-${합계 - hid.value}=${hid.value}이므로 ${hid.value}${d.주제.단위}입니다.`],
      visual: 그림(d, hid.name),
      minusIsOperator: true,
    };
  },
};

const 몇칸: G5Family = {
  id: 'how-many-cells',
  make: (seed) => {
    const next = 고르개(seed);
    const step = [2, 5, 10][next(3)];
    const 칸 = 사이(next, 3, 12);
    const v = 칸 * step;
    const 주제 = 주제들[next(주제들.length)];
    return {
      prompt: `세로 눈금 한 칸이 ${step}${주제.단위}인 막대그래프에 ${v}${주제.단위}을(를) 나타내려면 막대를 몇 칸으로 그려야 할까요?`,
      answer: `${칸}칸`,
      wrongs: 수들(칸, [v, 칸 + 1, 칸 - 1, 칸 * 2, 칸 + 2]).slice(0, 3).map((x) => `${x}칸`),
      tag: 'data',
      strategy: '막대그래프로 나타내기',
      hint: `${v}은(는) ${step}이(가) 몇 개인지 생각해 보세요.`,
      steps: [`${v}÷${step}=${칸}이므로 ${칸}칸으로 그립니다.`],
    };
  },
};

const 뜻: G5Family = {
  id: 'meaning',
  make: (seed) => {
    const qs = [
      { p: '조사한 자료의 수량을 막대 모양으로 나타낸 그래프를 무엇이라고 할까요?', a: '막대그래프', w: ['그림그래프', '표', '꺾은선그래프'], s: '조사한 자료를 막대 모양으로 나타낸 그래프를 막대그래프라고 합니다.' },
      { p: '막대그래프에서 막대의 길이는 무엇을 나타낼까요?', a: '조사한 수량', w: ['조사한 날짜', '항목의 이름', '그래프의 제목'], s: '막대의 길이는 각 항목의 수량을 나타냅니다.' },
      { p: '막대그래프가 표보다 좋은 점은 무엇일까요?', a: '수량의 많고 적음을 한눈에 비교하기 쉽습니다', w: ['전체 합계를 바로 알 수 있습니다', '항목이 더 많이 나타납니다', '조사한 사람을 알 수 있습니다'], s: '막대의 길이로 많고 적음을 한눈에 비교할 수 있습니다. 합계는 표에서 바로 알 수 있습니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'data', strategy: '막대그래프 알기', hint: '막대그래프의 생김새를 떠올려 보세요.', steps: [q.s] };
  },
};

const 차례: G5Family = {
  id: 'order',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, lv);
    if (!d || d.bars.length > 4) return null;
    const 정렬 = [...d.bars].sort((x, y) => y.value - x.value).map((b) => b.name);
    const ans = 정렬.join(', ');
    const 원래 = d.bars.map((b) => b.name).join(', ');
    const 거꾸로 = [...정렬].reverse().join(', ');
    const 바꿈 = [정렬[1], 정렬[0], ...정렬.slice(2)].join(', ');
    return {
      prompt: '많은 것부터 차례로 쓴 것은 어느 것일까요?',
      answer: ans,
      wrongs: [...new Set([거꾸로, 바꿈, 원래, [정렬[0], 정렬[2], 정렬[1], ...정렬.slice(3)].join(', ')])].filter((w) => w !== ans).slice(0, 3),
      tag: 'data',
      strategy: '막대그래프 해석하기',
      hint: '막대가 긴 것부터 차례로 찾아요.',
      steps: [`막대가 긴 것부터 쓰면 ${ans}입니다.`],
      visual: 그림(d),
    };
  },
};

export const unit5Lesson41 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [가장, 뜻];
    case 2:
      return lv === '하' ? [값읽기, 뜻] : [한칸, 값읽기, 뜻];
    case 3:
      return lv === '하' ? [몇칸, 값읽기] : [몇칸, 빈막대];
    case 4:
      return lv === '하' ? [가장, 차이] : [차이, 차례, 가장];
    case 5:
      return [빈막대, 차이];
    default:
      return null;
  }
};
