import type { Difficulty, RatioGraphVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 6-1 5단원 띠그래프와 원그래프
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 띠그래프 / 띠그래프로 나타내기 / 원그래프 /
// 원그래프로 나타내기 / 그래프 해석 / 알맞은 그래프 / 탐구 문제 해결
//
// 지도서가 못박은 것:
//   · 백분율을 구하기 쉬운 자료를 씁니다(백분율이 자연수로 떨어지게).
//   · 그리기보다 해석과 의사소통에 중점을 둡니다.
//   · 각 항목의 백분율의 합은 100%입니다.
//   · 상황에 알맞은 그래프를 학생이 스스로 고르게 합니다.
//
// 그래프의 항목은 모두 10% 이상, 5%의 배수이고 서로 달라 '가장 많은
// 것'이 하나뿐입니다.
// ════════════════════════════════════════════════════════════════════

const 주제들 = [
  { 제목: '좋아하는 과일별 학생 수', 이름: ['사과', '포도', '귤', '딸기', '배'], 무엇: '학생' },
  { 제목: '좋아하는 운동별 학생 수', 이름: ['축구', '피구', '수영', '야구', '농구'], 무엇: '학생' },
  { 제목: '용돈 쓰임새', 이름: ['저축', '간식', '학용품', '선물', '기타'], 무엇: '돈' },
  { 제목: '마을의 땅 쓰임새', 이름: ['논', '밭', '숲', '집', '기타'], 무엇: '땅' },
];

type 자료 = { 주제: (typeof 주제들)[number]; items: Array<{ name: string; percent: number }> };

const 자료만들기 = (next: (b: number) => number): 자료 | null => {
  const 주제 = 주제들[next(주제들.length)];
  const count = 사이(next, 3, 5);
  // 5%씩 나눈 칸(20칸)을 항목에 나누어 줍니다. 항목마다 2칸(10%) 이상.
  const 칸 = Array(count).fill(2);
  let 남은 = 20 - 2 * count;
  while (남은 > 0) {
    칸[next(count)] += 1;
    남은 -= 1;
  }
  if (new Set(칸).size !== count) return null;
  칸.sort((a, b) => b - a);
  // 마지막 '기타'가 가장 작게 오도록 큰 것부터 둡니다(교과서 관례).
  return { 주제, items: 칸.map((c, k) => ({ name: 주제.이름[k], percent: c * 5 })) };
};

const 그림 = (d: 자료, shape: 'band' | 'pie', hidden?: string): RatioGraphVisual => ({
  kind: 'ratio-graph',
  label: d.주제.제목,
  shape,
  title: d.주제.제목,
  items: d.items.map((it) => (it.name === hidden ? { ...it, hidden: true } : it)),
});

const 퍼센트들 = (answer: number, xs: number[]) => [...new Set(xs)].filter((x) => x > 0 && x <= 100 && x !== answer).slice(0, 3).map((x) => `${x}%`);

const 읽기 = (shape: 'band' | 'pie'): G5Family => ({
  id: `read-${shape}`,
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d) return null;
    const kind = next(3);
    if (kind === 0) {
      const 많은 = next(2) === 0;
      const pick = 많은 ? d.items[0] : d.items[d.items.length - 1];
      return {
        prompt: `${shape === 'band' ? '띠그래프' : '원그래프'}에서 비율이 가장 ${많은 ? '높은' : '낮은'} 항목은 무엇일까요?`,
        answer: pick.name,
        wrongs: d.items.filter((it) => it !== pick).map((it) => it.name).slice(0, 3),
        tag: 'data',
        strategy: `${shape === 'band' ? '띠그래프' : '원그래프'} 읽기`,
        hint: shape === 'band' ? '띠에서 가장 긴 칸을 찾아요.' : '원에서 가장 큰 부채꼴을 찾아요.',
        steps: [`${pick.name}이(가) ${pick.percent}%로 가장 ${많은 ? '높습니다' : '낮습니다'}.`],
        visual: 그림(d, shape),
      };
    }
    if (kind === 1) {
      const it = d.items[next(d.items.length)];
      return {
        prompt: `${it.name}이(가) 차지하는 비율은 전체의 몇 %일까요?`,
        answer: `${it.percent}%`,
        wrongs: 퍼센트들(it.percent, [100 - it.percent, it.percent + 5, it.percent - 5, it.percent * 2]),
        tag: 'data',
        strategy: `${shape === 'band' ? '띠그래프' : '원그래프'} 읽기`,
        hint: '그래프에 적힌 백분율을 읽어요.',
        steps: [`${it.name}은(는) ${it.percent}%입니다.`],
        visual: 그림(d, shape),
      };
    }
    const [a, b] = [d.items[0], d.items[d.items.length - 1]];
    if (a.percent % b.percent !== 0) {
      return {
        prompt: `${a.name}은(는) ${b.name}보다 몇 % 더 많을까요?`,
        answer: `${a.percent - b.percent}%`,
        wrongs: 퍼센트들(a.percent - b.percent, [a.percent + b.percent, a.percent, b.percent, a.percent - b.percent + 5]),
        tag: 'data',
        strategy: '그래프에서 비율 비교하기',
        hint: '두 백분율의 차를 구해요.',
        steps: [`${a.percent}-${b.percent}=${a.percent - b.percent}이므로 ${a.percent - b.percent}%입니다.`],
        visual: 그림(d, shape),
        minusIsOperator: true,
      };
    }
    const 배 = a.percent / b.percent;
    return {
      prompt: `${a.name}의 비율은 ${b.name}의 비율의 몇 배일까요?`,
      answer: `${배}배`,
      wrongs: [...new Set([배 + 1, 배 * 2, a.percent - b.percent])].filter((x) => x !== 배 && x > 0).slice(0, 3).map((x) => `${x}배`),
      tag: 'data',
      strategy: '그래프에서 비율 비교하기',
      hint: '두 백분율을 나누어요.',
      steps: [`${a.percent}÷${b.percent}=${배}이므로 ${배}배입니다.`],
      visual: 그림(d, shape),
    };
  },
});

const 빈칸: G5Family = {
  id: 'missing',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d) return null;
    const shape = next(2) === 0 ? 'band' : 'pie';
    const it = d.items[next(d.items.length)];
    const 나머지 = 100 - it.percent;
    return {
      prompt: `${shape === 'band' ? '띠그래프' : '원그래프'}에서 ${it.name}의 백분율(?)은 몇 %일까요?`,
      answer: `${it.percent}%`,
      wrongs: 퍼센트들(it.percent, [나머지, it.percent + 5, it.percent - 5, it.percent + 10]),
      tag: 'data',
      strategy: '백분율의 합계가 100%임을 이용하기',
      hint: '모든 항목의 백분율의 합은 100%예요.',
      steps: [`나머지 항목의 합은 ${나머지}%입니다.`, `100-${나머지}=${it.percent}이므로 ${it.percent}%입니다.`],
      visual: 그림(d, shape, it.name),
      minusIsOperator: true,
    };
  },
};

const 백분율구하기: G5Family = {
  id: 'make-percent',
  make: (seed) => {
    const next = 고르개(seed);
    const 전체 = [20, 25, 40, 50, 200][next(5)];
    const 수 = 사이(next, 1, 전체 - 1);
    const p = (수 * 100) / 전체;
    if (!Number.isInteger(p)) return null;
    return {
      prompt: `조사한 학생 ${전체}명 가운데 ${수}명이 '봄'을 좋아합니다. 띠그래프로 나타낼 때 '봄'의 백분율은 몇 %일까요?`,
      answer: `${p}%`,
      wrongs: 퍼센트들(p, [수, 100 - p, p * 2, p + 5]),
      tag: 'data',
      strategy: '자료를 백분율로 나타내기',
      hint: '(항목의 수)÷(전체 수)×100이에요.',
      steps: [`${수}÷${전체}×100=${p}이므로 ${p}%입니다.`],
    };
  },
};

const 수량구하기: G5Family = {
  id: 'amount',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 자료만들기(next);
    if (!d || d.주제.무엇 !== '학생') return null;
    const 전체 = [20, 40, 60, 80, 100, 200][next(6)];
    const it = d.items[next(d.items.length)];
    const v = (전체 * it.percent) / 100;
    if (!Number.isInteger(v)) return null;
    return {
      prompt: `조사한 학생이 모두 ${전체}명일 때 ${it.name}을(를) 좋아하는 학생은 몇 명일까요?`,
      answer: `${v}명`,
      wrongs: [...new Set([it.percent, 전체 - v, v + 2, v * 2])].filter((x) => x !== v && x > 0).slice(0, 3).map((x) => `${x}명`),
      tag: 'data',
      strategy: '그래프를 해석하여 항목의 수량 구하기',
      hint: `전체 ${전체}명의 ${it.percent}%를 구해요.`,
      steps: [`${전체}×${it.percent}/100=${v}이므로 ${v}명입니다.`],
      visual: 그림(d, next(2) === 0 ? 'band' : 'pie'),
    };
  },
};

const 뜻: G5Family = {
  id: 'meaning',
  make: (seed) => {
    const qs = [
      { p: '전체에 대한 각 부분의 비율을 띠 모양에 나타낸 그래프를 무엇이라고 할까요?', a: '띠그래프', w: ['원그래프', '막대그래프', '꺾은선그래프'], s: '띠 모양에 나타낸 그래프를 띠그래프라고 합니다.' },
      { p: '전체에 대한 각 부분의 비율을 원 모양에 나타낸 그래프를 무엇이라고 할까요?', a: '원그래프', w: ['띠그래프', '그림그래프', '꺾은선그래프'], s: '원 모양에 나타낸 그래프를 원그래프라고 합니다.' },
      { p: '띠그래프에서 모든 항목의 백분율을 더하면 몇 %일까요?', a: '100%', w: ['10%', '50%', '360%'], s: '전체를 100%로 보므로 합은 100%입니다.' },
      { p: '원그래프에서 25%인 항목은 원 전체의 얼마만큼을 차지할까요?', a: '1/4', w: ['1/2', '1/3', '1/25'], s: '25%는 25/100=1/4입니다.' },
      { p: '원그래프에서 50%인 항목은 원 전체의 얼마만큼을 차지할까요?', a: '1/2', w: ['1/4', '1/5', '1/50'], s: '50%는 50/100=1/2입니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'data', strategy: '띠그래프와 원그래프의 뜻', hint: '전체를 100%로 보는 그래프예요.', steps: [q.s] };
  },
};

const 알맞은그래프: G5Family = {
  id: 'which-graph',
  make: (seed) => {
    const qs: Array<[string, string, string[]]> = [
      ['전체에 대한 각 부분의 비율을 한눈에 비교할 때', '띠그래프', ['꺾은선그래프', '그림그래프', '표']],
      ['시간에 따라 변하는 기온을 나타낼 때', '꺾은선그래프', ['원그래프', '띠그래프', '그림그래프']],
      ['마을별 사과 생산량을 그림으로 쉽게 나타낼 때', '그림그래프', ['꺾은선그래프', '원그래프', '띠그래프']],
      ['반별 학생 수의 많고 적음을 비교할 때', '막대그래프', ['꺾은선그래프', '원그래프', '띠그래프']],
      ['용돈의 쓰임새가 전체의 얼마인지 원 모양으로 나타낼 때', '원그래프', ['꺾은선그래프', '막대그래프', '그림그래프']],
      ['몇 년 동안 학생들이 좋아하는 운동의 비율이 어떻게 바뀌었는지 비교할 때', '띠그래프', ['그림그래프', '원그래프', '표']],
      ['한 달 동안 강낭콩 싹의 키가 자란 모습을 나타낼 때', '꺾은선그래프', ['원그래프', '띠그래프', '그림그래프']],
      ['우리 반 학생들이 좋아하는 계절별 학생 수를 비교할 때', '막대그래프', ['꺾은선그래프', '원그래프', '띠그래프']],
      ['전교 학생이 좋아하는 간식의 비율을 원 모양으로 나타낼 때', '원그래프', ['꺾은선그래프', '막대그래프', '그림그래프']],
      ['권역별 쌀 생산량을 지도 위에 그림으로 나타낼 때', '그림그래프', ['꺾은선그래프', '원그래프', '띠그래프']],
      ['하루 동안 시각별 교실 온도의 변화를 나타낼 때', '꺾은선그래프', ['원그래프', '띠그래프', '그림그래프']],
    ];
    const [상황, 답, 오답] = qs[seed % qs.length];
    return {
      prompt: `${상황} 가장 알맞은 그래프는 어느 것일까요?`,
      answer: 답,
      wrongs: 오답,
      tag: 'data',
      strategy: '알맞은 그래프 고르기',
      hint: '비율인지, 변화인지, 많고 적음인지 먼저 생각해요.',
      steps: [`${상황}에는 ${답}이(가) 알맞습니다.`],
    };
  },
};

export const unit5Lesson61 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [뜻, 읽기('band')];
    case 2:
      return lv === '하' ? [읽기('band'), 뜻] : [읽기('band')];
    case 3:
      return [백분율구하기, 빈칸];
    case 4:
      return lv === '하' ? [읽기('pie'), 뜻] : [읽기('pie')];
    case 5:
      return [백분율구하기, 빈칸];
    case 6:
      return [수량구하기, 읽기('pie'), 읽기('band')];
    case 7:
      return [알맞은그래프];
    case 8:
      return [수량구하기, 백분율구하기, 알맞은그래프];
    default:
      return null;
  }
};
