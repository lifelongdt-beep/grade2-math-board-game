import type { Difficulty, LineGraphVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { gwa } from '../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 4-2 5단원 꺾은선그래프
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 꺾은선그래프는 무엇일까요 / 나타내기 /
// 해석하기 / 자료를 수집하여 나타내기 / 알맞은 그래프 고르기
//
// 지도서가 못박은 것:
//   · 꺾은선그래프는 연속적으로 변화하는 양을 점으로 찍고 선분으로 이은
//     그래프입니다. 시간에 따른 변화를 한눈에 알아보기 쉽습니다.
//   · 선이 많이 기울어질수록 변화가 큽니다.
//   · 필요 없는 부분은 물결선(≈)으로 줄여 나타낼 수 있습니다.
//   · 항목끼리 많고 적음을 비교할 때는 막대그래프, 시간에 따른 변화를
//     볼 때는 꺾은선그래프가 알맞습니다.
//
// 점의 값은 언제나 눈금 한 칸의 배수로 두어 그림에서 정확히 읽게 합니다.
// ════════════════════════════════════════════════════════════════════

// 시작: 첫 값이 아래에서 눈금 몇 칸 위인지, 늘: 한 번에 눈금 몇 칸 변하는지.
// 키는 줄지 않고(늘 1칸 이상), 평균 키는 실제처럼 1학년 약 120 cm에서
// 해마다 4~6 cm씩 자랍니다.
const 주제들 = [
  { 제목: '교실의 기온', 이름: ['9시', '10시', '11시', '12시', '1시', '2시'], 단위: '°C', 눈금: '기온(°C)', 무엇: '기온', 아래: 0, 위: 30, 시작: [14, 20], 늘: [0, 4] },
  { 제목: '강낭콩 싹의 키', 이름: ['1일', '3일', '5일', '7일', '9일', '11일'], 단위: ' cm', 눈금: '키(cm)', 무엇: '싹의 키', 아래: 0, 위: 20, 시작: [1, 3], 늘: [1, 3] },
  { 제목: '연도별 우리 반 학생의 평균 키', 이름: ['1학년', '2학년', '3학년', '4학년', '5학년'], 단위: ' cm', 눈금: '키(cm)', 무엇: '평균 키', 아래: 110, 위: 150, 시작: [5, 7], 늘: [2, 4] },
  { 제목: '월별 도서관 방문자 수', 이름: ['3월', '4월', '5월', '6월', '7월'], 단위: '명', 눈금: '방문자 수(명)', 무엇: '방문자 수', 아래: 0, 위: 100, 시작: [1, 3], 늘: [0, 4] },
];

type 자료 = { 주제: (typeof 주제들)[number]; step: number; from: number; max: number; pts: Array<{ name: string; value: number }> };

/** 이웃한 변화의 크기가 서로 다른 자료를 만듭니다(가장 크게 변한 때가 하나뿐이게). */
const 자료만들기 = (next: (b: number) => number, 줄이기 = false): 자료 | null => {
  const 주제 = 주제들[줄이기 ? 2 : next(주제들.length)];
  const step = 주제.위 - 주제.아래 >= 80 ? 10 : 주제.아래 > 0 || 주제.무엇 === '기온' ? 2 : [1, 2][next(2)];
  const n = Math.min(주제.이름.length, 5);
  // 기온의 시작은 칸이 아니라 °C(14~20°C)로 잡고 눈금 칸으로 바꿉니다.
  const 시작칸 = 주제.무엇 === '기온' ? Math.round(사이(next, 주제.시작[0], 주제.시작[1]) / step) : 사이(next, 주제.시작[0], 주제.시작[1]);
  let v = 주제.아래 + step * 시작칸;
  const values = [v];
  for (let k = 1; k < n; k += 1) {
    v += step * (사이(next, 주제.늘[0], 주제.늘[1]) - (주제.무엇 === '기온' && k >= 3 ? 2 : 0));
    if (v <= 주제.아래) v = 주제.아래 + step;
    values.push(v);
  }
  const 변화 = values.slice(1).map((x, k) => Math.abs(x - values[k]));
  const 큰 = Math.max(...변화);
  if (큰 === 0 || 변화.filter((d) => d === 큰).length > 1) return null;
  const from = 주제.아래;
  const max = Math.ceil((Math.max(...values) + step) / (step * 5)) * step * 5;
  return { 주제, step, from, max: Math.max(max, from + step * 5), pts: 주제.이름.slice(0, n).map((name, k) => ({ name, value: values[k] })) };
};

const 그림 = (d: 자료, hidden?: string): LineGraphVisual => ({
  kind: 'line-graph',
  label: d.주제.제목,
  title: d.주제.제목,
  valueLabel: d.주제.눈금,
  step: d.step,
  max: d.max,
  ...(d.from > 0 ? { from: d.from } : {}),
  points: d.pts.map((p) => (p.name === hidden ? { ...p, hidden: true } : p)),
});

// 무엇을 조사한 그래프인지 문제 글에 먼저 밝힙니다('7일의 키'만으로는 누구의 키인지 모릅니다).
const 머리말 = (d: 자료) => `${d.주제.제목}을(를) 조사하여 꺾은선그래프로 나타냈습니다.`;

const 수들 = (answer: number, xs: number[]) => [...new Set(xs)].filter((x) => x >= 0 && x !== answer);

const 값읽기: G5Family = {
  id: 'read',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d) return null;
    const p = d.pts[next(d.pts.length)];
    const 칸 = (p.value - d.from) / d.step;
    return {
      prompt: `${머리말(d)} ${p.name}의 ${d.주제.무엇}은(는) 몇 ${d.주제.단위.trim()}일까요?`,
      answer: `${p.value}${d.주제.단위}`,
      wrongs: 수들(p.value, [칸 === p.value ? p.value + 2 * d.step : 칸, p.value + d.step, p.value - d.step, p.value + 2 * d.step]).slice(0, 3).map((x) => `${x}${d.주제.단위}`),
      tag: 'data',
      strategy: '꺾은선그래프 읽기',
      hint: '세로 눈금 한 칸의 크기를 먼저 보고, 점의 높이를 읽어요.',
      steps: [`세로 눈금 한 칸은 ${d.step}${d.주제.단위}입니다.`, `${p.name}의 점은 ${p.value}${d.주제.단위}에 있습니다.`],
      visual: 그림(d),
    };
  },
};

const 가장큰변화: G5Family = {
  id: 'biggest-change',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d) return null;
    const 변화 = d.pts.slice(1).map((p, k) => ({ 구간: `${gwa(d.pts[k].name)} ${p.name} 사이`, 크기: Math.abs(p.value - d.pts[k].value) }));
    const 큰 = 변화.reduce((m, x) => (x.크기 > m.크기 ? x : m));
    const 해결 = (t: string) => t;
    return {
      prompt: `${머리말(d)} ${d.주제.무엇}의 변화가 가장 큰 때는 언제일까요?`,
      answer: 해결(큰.구간),
      wrongs: 변화.filter((x) => x !== 큰).map((x) => 해결(x.구간)).slice(0, 3),
      tag: 'data',
      strategy: '선의 기울기로 변화의 크기 알기',
      hint: '선분이 가장 많이 기울어진 곳을 찾아요.',
      steps: [`선분이 가장 많이 기울어진 곳은 ${해결(큰.구간)}입니다.`, `그때 ${큰.크기}${d.주제.단위}만큼 변했습니다.`],
      misconceptionTip: '값이 가장 큰 때와 변화가 가장 큰 때는 달라요.',
      visual: 그림(d),
    };
  },
};

const 차이: G5Family = {
  id: 'difference',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d) return null;
    const k = 사이(next, 0, d.pts.length - 2);
    const a = d.pts[k];
    const b = d.pts[k + 1];
    if (a.value === b.value) return null;
    const 오름 = b.value > a.value;
    const v = Math.abs(b.value - a.value);
    const 말 = d.주제.무엇 === '방문자 수' ? (오름 ? '늘었을까요' : '줄었을까요') : d.주제.무엇.endsWith('키') ? (오름 ? '자랐을까요' : '작아졌을까요') : 오름 ? '높아졌을까요' : '낮아졌을까요';
    return {
      prompt: `${머리말(d)} ${a.name}부터 ${b.name}까지 ${d.주제.무엇}은(는) 몇 ${d.주제.단위.trim()} ${말}?`,
      answer: `${v}${d.주제.단위}`,
      wrongs: 수들(v, [a.value + b.value, v + d.step, v > d.step ? v - d.step : v + 2 * d.step, b.value]).slice(0, 3).map((x) => `${x}${d.주제.단위}`),
      tag: 'data',
      strategy: '꺾은선그래프에서 변화량 구하기',
      hint: '두 점의 값을 읽어 큰 값에서 작은 값을 빼요.',
      steps: [`${a.name}은(는) ${a.value}${d.주제.단위}, ${b.name}은(는) ${b.value}${d.주제.단위}입니다.`, `${Math.max(a.value, b.value)}-${Math.min(a.value, b.value)}=${v}`],
      visual: 그림(d),
      minusIsOperator: true,
    };
  },
};

const 사이값: G5Family = {
  id: 'between',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d || d.주제.무엇 !== '기온') return null;
    const k = 사이(next, 0, d.pts.length - 2);
    const a = d.pts[k].value;
    const b = d.pts[k + 1].value;
    if ((a + b) % 2 !== 0 || a === b) return null;
    const mid = (a + b) / 2;
    const 시 = d.pts[k].name;
    return {
      prompt: `${머리말(d)} ${시} 30분의 기온은 약 몇 °C였을까요?`,
      answer: `약 ${mid}°C`,
      wrongs: 수들(mid, [a + b, Math.min(a, b) - d.step * 2, Math.max(a, b) + d.step * 2]).map((x) => `약 ${x}°C`),
      tag: 'data',
      strategy: '꺾은선그래프로 중간 값 예상하기',
      hint: `${시}과(와) 그다음 시각의 점을 이은 선분의 가운데를 읽어요.`,
      steps: [`${d.pts[k].name}은(는) ${a}°C, ${d.pts[k + 1].name}은(는) ${b}°C입니다.`, `그 사이 가운데쯤은 약 ${mid}°C입니다.`],
      visual: 그림(d),
    };
  },
};

const 물결선: G5Family = {
  id: 'wave',
  make: (seed) => {
    const qs = [
      { p: '꺾은선그래프에서 필요 없는 부분을 줄여 나타낼 때 쓰는 선은 무엇일까요?', a: '물결선', w: ['수선', '대각선', '평행선'], s: '필요 없는 부분은 물결선으로 줄여 나타냅니다.' },
      { p: '학생들의 키가 모두 120 cm보다 큰 자료를 꺾은선그래프로 나타낼 때 물결선을 쓰면 좋은 점은 무엇일까요?', a: '변화하는 모습이 잘 나타납니다', w: ['자료의 값이 커집니다', '점의 수가 늘어납니다', '제목을 쓰지 않아도 됩니다'], s: '필요 없는 0~120 cm를 줄이면 눈금 한 칸을 작게 잡을 수 있어 변화가 뚜렷하게 보입니다.' },
      { p: '꺾은선그래프에서 선이 많이 기울어질수록 무엇을 뜻할까요?', a: '변화가 큽니다', w: ['변화가 작습니다', '값이 0입니다', '자료가 틀렸습니다'], s: '선이 많이 기울어질수록 그 사이의 변화가 큽니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'data', strategy: '꺾은선그래프 알기', hint: '꺾은선그래프의 생김새를 떠올려 보세요.', steps: [q.s] };
  },
};

const 그래프뜻: G5Family = {
  id: 'meaning',
  make: (seed) => {
    const qs = [
      { p: '연속적으로 변화하는 양을 점으로 찍고, 그 점들을 선분으로 이어 그린 그래프를 무엇이라고 할까요?', a: '꺾은선그래프', w: ['막대그래프', '그림그래프', '표'], s: '이런 그래프를 꺾은선그래프라고 합니다.' },
      { p: '시간에 따라 변화하는 모습을 한눈에 알아보기 쉬운 그래프는 어느 것일까요?', a: '꺾은선그래프', w: ['막대그래프', '그림그래프', '표'], s: '꺾은선그래프는 시간에 따른 변화를 한눈에 알아보기 쉽습니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'data', strategy: '꺾은선그래프 알기', hint: '선이 이어져 있는 그래프를 떠올려 보세요.', steps: [q.s] };
  },
};

const 알맞은그래프: G5Family = {
  id: 'which-graph',
  make: (seed) => {
    const qs: Array<[string, '막대그래프' | '꺾은선그래프']> = [
      ['하루 동안 시각별 운동장의 기온 변화', '꺾은선그래프'],
      ['우리 반 학생들이 좋아하는 과일별 학생 수', '막대그래프'],
      ['한 달 동안 강낭콩 싹의 키 변화', '꺾은선그래프'],
      ['반별 모은 빈 병의 수', '막대그래프'],
      ['월별 우리 집 전기 사용량의 변화', '꺾은선그래프'],
      ['나라별 금메달 수', '막대그래프'],
      ['1학년 때부터 해마다 잰 내 몸무게의 변화', '꺾은선그래프'],
      ['마을별 심은 나무 수', '막대그래프'],
      ['일주일 동안 날마다 잰 화분의 흙 온도 변화', '꺾은선그래프'],
      ['우리 반 학생들이 태어난 계절별 학생 수', '막대그래프'],
      ['한 시간마다 잰 우리 마을의 미세 먼지 농도 변화', '꺾은선그래프'],
      ['좋아하는 운동별 학생 수', '막대그래프'],
      ['연도별 우리 학교 입학생 수의 변화', '꺾은선그래프'],
      ['반별 도서관 대출 권수', '막대그래프'],
    ];
    const [상황, 답] = qs[seed % qs.length];
    return {
      prompt: `'${상황}'을(를) 나타내기에 더 알맞은 그래프는 어느 것일까요?`,
      answer: 답,
      wrongs: [답 === '막대그래프' ? '꺾은선그래프' : '막대그래프', '둘 다 나타낼 수 없습니다', '그래프로 나타낼 수 없습니다'],
      tag: 'data',
      strategy: '알맞은 그래프 고르기',
      hint: '항목끼리 비교하는지, 시간에 따른 변화를 보는지 생각해 보세요.',
      steps: [답 === '막대그래프' ? '항목끼리 많고 적음을 비교하므로 막대그래프가 알맞습니다.' : '시간에 따라 변화하는 모습을 보므로 꺾은선그래프가 알맞습니다.'],
    };
  },
};

const 물결선그래프: G5Family = {
  id: 'wave-read',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next, true);
    if (!d) return null;
    const p = d.pts[next(d.pts.length)];
    return {
      prompt: `${d.주제.제목}을(를) 물결선을 넣은 꺾은선그래프로 나타냈습니다. ${p.name} 때의 평균 키는 몇 cm일까요?`,
      answer: `${p.value} cm`,
      wrongs: 수들(p.value, [p.value - d.from, p.value + d.step, p.value - d.step, p.value + 2 * d.step]).slice(0, 3).map((x) => `${x} cm`),
      tag: 'data',
      strategy: '물결선이 있는 꺾은선그래프 읽기',
      hint: `물결선 위의 눈금은 ${d.from}부터 시작해요. 한 칸이 ${d.step} cm예요.`,
      steps: [`세로 눈금은 ${d.from} cm부터 한 칸에 ${d.step} cm씩입니다.`, `${p.name}의 점은 ${p.value} cm입니다.`],
      misconceptionTip: '물결선 아래를 줄였으니 맨 아래 눈금이 0이 아니에요.',
      visual: 그림(d),
    };
  },
};

export const unit5Lesson42 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [그래프뜻, 값읽기];
    case 2:
      return lv === '하' ? [그래프뜻, 값읽기] : [값읽기, 물결선, 그래프뜻];
    case 3:
      return lv === '하' ? [값읽기, 물결선] : [물결선그래프, 물결선, 값읽기];
    case 4:
      return lv === '하' ? [차이, 가장큰변화] : [가장큰변화, 차이, 사이값];
    case 5:
      return [차이, 사이값, 가장큰변화];
    case 6:
      return [알맞은그래프];
    default:
      return null;
  }
};
