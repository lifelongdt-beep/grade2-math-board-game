import type { CircleRegionVisual, CircleVisual, Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 원생각 } from '../grade6/thinking';
import { 소수 } from '../grade42/unit3';

// ════════════════════════════════════════════════════════════════════
// 6-2 5단원 원주율과 원의 넓이
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 원주와 지름의 관계 / 원주율 / 원주 구하기 /
// 원의 넓이 어림 / 원의 넓이 구하기 / 원의 넓이 활용
//
// 지도서가 못박은 것:
//   · 원주율은 (원주)÷(지름)이고 원의 크기와 상관없이 일정합니다. 계산에는
//     근삿값 3.14를 씁니다(문제에 따라 3, 3.1).
//   · 원주는 지름의 3배보다 길고 4배보다 짧습니다(원 안의 정육각형 둘레는
//     지름의 3배, 원 밖의 정사각형 둘레는 지름의 4배).
//   · (원주)=(지름)×(원주율), (원의 넓이)=(반지름)×(반지름)×(원주율).
//   · 원의 넓이 어림: 원 안의 정사각형(반지름×반지름×2) < 원의 넓이 <
//     원 밖의 정사각형(반지름×반지름×4).
//
// 3.14를 곱한 값은 천분 정수로 계산해 오차가 없습니다(3.14 = 3140/1000).
// ════════════════════════════════════════════════════════════════════

const 원그림 = (글: string, 지름선: boolean): CircleVisual => ({
  kind: 'circles',
  label: '원',
  circles: [{ cx: 0, cy: 0, r: 1 }],
  points: [{ x: 0, y: 0 }],
  segments: [지름선 ? { from: [-1, 0], to: [1, 0], name: 글 } : { from: [0, 0], to: [1, 0], name: 글 }],
});

const 곱 = (a: number, 원주율천분: number) => a * 원주율천분; // a는 자연수, 결과는 천분
const 다른것 = (answer: string, xs: number[]) => [...new Set(xs.filter((x) => x > 0 && Number.isInteger(x)).map(소수))].filter((x) => x !== answer);

const 관계: G5Family = {
  id: 'relation',
  make: (seed) => {
    const qs = [
      { p: '원주는 지름의 몇 배쯤일까요?', a: '3배보다 길고 4배보다 짧습니다', w: ['2배보다 짧습니다', '4배보다 깁니다', '꼭 3배입니다'], s: '원 안의 정육각형 둘레(지름의 3배)보다 길고, 원 밖의 정사각형 둘레(지름의 4배)보다 짧습니다.' },
      { p: '원의 지름에 대한 원주의 비율을 무엇이라고 할까요?', a: '원주율', w: ['반지름', '비례식', '백분율'], s: '(원주)÷(지름)을 원주율이라고 합니다.' },
      { p: '원의 크기가 커지면 원주율은 어떻게 될까요?', a: '변하지 않습니다', w: ['커집니다', '작아집니다', '2배가 됩니다'], s: '원주율은 원의 크기와 상관없이 일정합니다.' },
      { p: '원주율 3.14는 어떤 값일까요?', a: '원주율을 어림한 값입니다', w: ['원주율의 정확한 값입니다', '지름의 길이입니다', '원의 넓이입니다'], s: '원주율은 3.1415926…처럼 끝없이 이어지므로 3.14는 어림한 값입니다.' },
      { p: '원 안에 꼭 맞게 그린 정육각형의 둘레는 원의 지름의 몇 배일까요?', a: '3배', w: ['2배', '4배', '6배'], s: '정육각형의 한 변은 반지름과 같으므로 둘레는 반지름의 6배, 지름의 3배입니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'measurement', strategy: '원주와 지름의 관계', hint: '원 안과 밖에 정다각형을 그려 비교해 보세요.', steps: [q.s] };
  },
};

const 원주율구하기: G5Family = {
  id: 'pi-ratio',
  make: (seed) => {
    const next = 고르개(seed);
    const d = 사이(next, 2, 30);
    const 원주 = 곱(d, 3140);
    return {
      prompt: `지름이 ${d} cm인 원의 원주가 ${소수(원주)} cm입니다. (원주)÷(지름)은 얼마일까요?`,
      answer: '3.14',
      wrongs: ['31.4', '0.314', '6.28'],
      tag: 'measurement',
      strategy: '원주율 구하기',
      hint: '원주를 지름으로 나누어요.',
      steps: [`${소수(원주)}÷${d}=3.14`],
    };
  },
};

const 원주: G5Family = {
  id: 'circumference',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const kind = next(lv === '하' ? 2 : 3);
    const r = 사이(next, 2, 15);
    if (kind === 0) {
      const v = 곱(2 * r, 3140);
      return {
        prompt: `지름이 ${2 * r} cm인 원의 원주는 몇 cm일까요? (원주율: 3.14)`,
        answer: `${소수(v)} cm`,
        wrongs: 다른것(소수(v), [곱(r, 3140), 곱(r * r, 3140), 곱(4 * r, 3140), v + 1000]).slice(0, 3).map((x) => `${x} cm`),
        tag: 'measurement',
        strategy: '지름으로 원주 구하기',
        hint: '(원주)=(지름)×(원주율)이에요.',
        steps: [`${2 * r}×3.14=${소수(v)}이므로 ${소수(v)} cm입니다.`],
        visual: 원그림(`${2 * r} cm`, true),
      };
    }
    if (kind === 1) {
      const v = 곱(2 * r, 3140);
      return {
        prompt: `반지름이 ${r} cm인 원의 원주는 몇 cm일까요? (원주율: 3.14)`,
        answer: `${소수(v)} cm`,
        wrongs: 다른것(소수(v), [곱(r, 3140), 곱(r * r, 3140), 곱(4 * r, 3140)]).slice(0, 3).map((x) => `${x} cm`),
        tag: 'measurement',
        strategy: '반지름으로 원주 구하기',
        hint: '반지름의 2배가 지름이에요.',
        steps: [`지름은 ${r}×2=${2 * r}입니다.`, `${2 * r}×3.14=${소수(v)}이므로 ${소수(v)} cm입니다.`],
        misconceptionTip: '반지름에 원주율을 곱하면 원주의 절반이에요.',
        visual: 원그림(`${r} cm`, false),
      };
    }
    const d = 사이(next, 2, 30);
    const c = 곱(d, 3140);
    return {
      prompt: `원주가 ${소수(c)} cm인 원의 지름은 몇 cm일까요? (원주율: 3.14)`,
      answer: `${d} cm`,
      wrongs: [...new Set([d * 2, d / 2, d + 1, d - 1])].filter((x) => x > 0 && x !== d && Number.isInteger(x)).slice(0, 3).map((x) => `${x} cm`),
      tag: 'measurement',
      strategy: '원주로 지름 구하기',
      hint: '(지름)=(원주)÷(원주율)이에요.',
      steps: [`${소수(c)}÷3.14=${d}이므로 ${d} cm입니다.`],
      visual: 원그림('? cm', true),
    };
  },
};

const 넓이어림: G5Family = {
  id: 'area-estimate',
  make: (seed) => {
    const next = 고르개(seed);
    const r = 사이(next, 2, 12);
    const 안 = 2 * r * r;
    const 밖 = 4 * r * r;
    const kind = next(2);
    if (kind === 0) {
      return {
        prompt: `반지름이 ${r} cm인 원의 넓이를 어림하려고 합니다. 원 밖에 꼭 맞게 그린 정사각형의 넓이는 몇 cm²일까요?`,
        answer: `${밖} cm²`,
        wrongs: [...new Set([안, r * r, 2 * r * 4])].filter((x) => x !== 밖).map((x) => `${x} cm²`),
        tag: 'area',
        strategy: '원 밖의 정사각형으로 넓이 어림하기',
        hint: '원 밖의 정사각형의 한 변은 원의 지름이에요.',
        steps: [`한 변이 ${2 * r} cm이므로 ${2 * r}×${2 * r}=${밖} cm²입니다.`],
      };
    }
    return {
      prompt: `반지름이 ${r} cm인 원의 넓이는 어느 범위에 있을까요?`,
      answer: `${안} cm²보다 크고 ${밖} cm²보다 작습니다`,
      wrongs: [`${r * r} cm²보다 크고 ${안} cm²보다 작습니다`, `${밖} cm²보다 크고 ${밖 * 2} cm²보다 작습니다`, `${r * 4} cm²보다 크고 ${r * 8} cm²보다 작습니다`],
      tag: 'area',
      strategy: '원의 넓이 어림하기',
      hint: '원 안의 정사각형(대각선이 지름)과 원 밖의 정사각형(한 변이 지름)의 넓이 사이에 있어요.',
      steps: [`원 안의 정사각형: ${2 * r}×${2 * r}÷2=${안} cm²`, `원 밖의 정사각형: ${2 * r}×${2 * r}=${밖} cm²`],
    };
  },
};

const 넓이: G5Family = {
  id: 'area',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const r = 사이(next, 2, lv === '하' ? 12 : 20);
    const 지름으로 = lv !== '하' && next(2) === 0;
    const v = 곱(r * r, 3140);
    return {
      prompt: `${지름으로 ? `지름이 ${2 * r}` : `반지름이 ${r}`} cm인 원의 넓이는 몇 cm²일까요? (원주율: 3.14)`,
      answer: `${소수(v)} cm²`,
      wrongs: 다른것(소수(v), [곱(4 * r * r, 3140), 곱(2 * r, 3140), 곱(r, 3140), 곱(2 * r * r, 3140)]).slice(0, 3).map((x) => `${x} cm²`),
      tag: 'area',
      strategy: '원의 넓이 구하기',
      hint: '(원의 넓이)=(반지름)×(반지름)×(원주율)이에요.',
      steps: [...(지름으로 ? [`반지름은 ${2 * r}÷2=${r}입니다.`] : []), `${r}×${r}×3.14=${소수(v)}이므로 ${소수(v)} cm²입니다.`],
      misconceptionTip: '지름을 두 번 곱하면 넓이가 4배가 돼요. 반지름을 써요.',
      visual: 원그림(지름으로 ? `${2 * r} cm` : `${r} cm`, 지름으로),
    };
  },
};

const 활용: G5Family = {
  id: 'apply',
  make: (seed) => {
    const next = 고르개(seed);
    const kind = next(3);
    const r = 사이(next, 2, 10) * 2;
    if (kind === 0) {
      const v = 곱(r * r, 3140) / 2;
      if (!Number.isInteger(v)) return null;
      return {
        prompt: `반지름이 ${r} cm인 반원의 넓이는 몇 cm²일까요? (원주율: 3.14)`,
        answer: `${소수(v)} cm²`,
        wrongs: 다른것(소수(v), [v * 2, v / 2, 곱(r, 3140)]).slice(0, 3).map((x) => `${x} cm²`),
        tag: 'area',
        strategy: '반원의 넓이',
        hint: '원의 넓이의 절반이에요.',
        steps: [`${r}×${r}×3.14÷2=${소수(v)}이므로 ${소수(v)} cm²입니다.`],
        visual: { kind: 'circle-region', label: '반원', shape: 'semicircle', outer: r, labels: { outer: `${r} cm` } } satisfies CircleRegionVisual,
      };
    }
    if (kind === 1) {
      const R = r + 사이(next, 1, 5);
      const v = 곱(R * R - r * r, 3140);
      return {
        prompt: `반지름이 ${R} cm인 원에서 같은 중심을 가진 반지름 ${r} cm인 원을 오려 냈습니다. 남은 고리 모양의 넓이는 몇 cm²일까요? (원주율: 3.14)`,
        answer: `${소수(v)} cm²`,
        wrongs: 다른것(소수(v), [곱((R - r) * (R - r), 3140), 곱(R * R, 3140), 곱(R * R + r * r, 3140)]).slice(0, 3).map((x) => `${x} cm²`),
        tag: 'area',
        strategy: '두 원의 넓이의 차',
        hint: '큰 원의 넓이에서 작은 원의 넓이를 빼요.',
        steps: [`${R}×${R}×3.14=${소수(곱(R * R, 3140))}`, `${r}×${r}×3.14=${소수(곱(r * r, 3140))}`, `${소수(곱(R * R, 3140))}-${소수(곱(r * r, 3140))}=${소수(v)}`],
        misconceptionTip: '반지름의 차로 원의 넓이를 구하면 안 돼요.',
        minusIsOperator: true,
        visual: { kind: 'circle-region', label: '고리 모양', shape: 'ring', outer: R, inner: r, labels: { outer: `${R} cm`, inner: `${r} cm` } } satisfies CircleRegionVisual,
      };
    }
    const 바퀴 = 사이(next, 2, 9);
    const d = 사이(next, 2, 9) * 10;
    const v = 곱(d * 바퀴, 3140);
    return {
      prompt: `지름이 ${d} cm인 바퀴가 ${바퀴}바퀴 굴러간 거리는 몇 cm일까요? (원주율: 3.14)`,
      answer: `${소수(v)} cm`,
      wrongs: 다른것(소수(v), [곱(d, 3140), 곱(d * 바퀴, 3140) / 2, 곱((d / 2) * (d / 2) * 바퀴, 3140)]).slice(0, 3).map((x) => `${x} cm`),
      tag: 'measurement',
      strategy: '원주를 이용한 문장제',
      hint: '바퀴가 한 바퀴 굴러간 거리는 원주와 같아요.',
      steps: [`원주는 ${d}×3.14=${소수(곱(d, 3140))} cm입니다.`, `${소수(곱(d, 3140))}×${바퀴}=${소수(v)}이므로 ${소수(v)} cm입니다.`],
      visual: { ...원그림(`${d} cm`, true), label: '바퀴' },
    };
  },
};

export const unit5Lesson62 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [관계, 원주];
    case 2:
      return lv === '하' ? [관계, 원주율구하기] : [관계, 원주율구하기, 원주];
    case 3:
      return [원주율구하기, 관계];
    case 4:
      return [원주, 원생각([0, 1])];
    case 5:
      return [넓이어림, 원생각([0, 1])];
    case 6:
      return lv === '하' ? [넓이, 원생각([2]), 원생각([3])] : [넓이, 원생각([2, 3])];
    case 7:
      return lv === '하' ? [넓이, 활용, 원생각([1, 2])] : [활용, 원생각([1, 2, 3]), 넓이];
    default:
      return null;
  }
};
