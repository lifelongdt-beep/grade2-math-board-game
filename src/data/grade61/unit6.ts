import type { BoxDrawingVisual, Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 6-1 6단원 직육면체의 겉넓이와 부피
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 겉넓이 / 부피 비교 / 부피 구하기 /
// 1 cm³보다 큰 부피 단위(1 m³)
//
// 지도서가 못박은 것:
//   · 가로, 세로, 높이, 밑면, 옆면이라는 말을 바르게 씁니다.
//   · 겉넓이: 여섯 면의 넓이의 합 = (세 면의 넓이의 합)×2
//     = (한 밑면의 넓이)×2+(옆면의 넓이).
//   · 부피: (가로)×(세로)×(높이). 정육면체는 (한 모서리)×(한 모서리)×(한 모서리).
//   · 1 m³=1000000 cm³.
// ════════════════════════════════════════════════════════════════════

const 상자 = (a: number, b: number, c: number): BoxDrawingVisual => ({
  kind: 'box-drawing',
  label: '직육면체',
  width: a,
  depth: b,
  height: c,
  edgeLabels: { width: `${a} cm`, depth: `${b} cm`, height: `${c} cm` },
});

// 정육면체는 모서리가 모두 같으므로 한 군데에만 길이를 적습니다.
const 정육면체 = (a: number): BoxDrawingVisual => ({
  kind: 'box-drawing',
  label: '정육면체',
  width: a,
  depth: a,
  height: a,
  edgeLabels: { width: `${a} cm` },
});

const 수들 = (ans: number, xs: number[], 단위: string) => [...new Set(xs)].filter((x) => x > 0 && x !== ans).slice(0, 3).map((x) => `${x} ${단위}`);

const 겉넓이: G5Family = {
  id: 'surface',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 정 = lv !== '상' && next(3) === 0;
    const a = 사이(next, 2, 12);
    const b = 정 ? a : 사이(next, 2, 10);
    const c = 정 ? a : 사이(next, 2, 10);
    if (!정 && (a === b || b === c || a === c)) return null;
    const S = 2 * (a * b + b * c + a * c);
    return {
      prompt: 정 ? `한 모서리가 ${a} cm인 정육면체의 겉넓이는 몇 cm²일까요?` : `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 겉넓이는 몇 cm²일까요?`,
      answer: `${S} cm²`,
      wrongs: 수들(S, [a * b + b * c + a * c, a * b * c, 정 ? a * a * 4 : 2 * a * b + 2 * (a + b), S + 2 * a * b, 4 * (a + b + c)], 'cm²'),
      tag: 'volume',
      strategy: 정 ? '정육면체의 겉넓이' : '직육면체의 겉넓이',
      hint: 정 ? '정육면체는 여섯 면이 모두 합동인 정사각형이에요.' : '서로 다른 세 면의 넓이를 더한 다음 2배 해요.',
      steps: 정
        ? [`한 면의 넓이는 ${a}×${a}=${a * a}입니다.`, `${a * a}×6=${S}이므로 ${S} cm²입니다.`]
        : [`세 면의 넓이: ${a}×${b}=${a * b}, ${b}×${c}=${b * c}, ${a}×${c}=${a * c}`, `(${a * b}+${b * c}+${a * c})×2=${S}이므로 ${S} cm²입니다.`],
      misconceptionTip: '세 면의 넓이만 더하면 겉넓이의 절반이에요. 마주 보는 면이 하나씩 더 있어요.',
      visual: 정 ? 정육면체(a) : 상자(a, b, c),
    };
  },
};

const 부피: G5Family = {
  id: 'volume',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const kind = next(lv === '하' ? 2 : 3);
    const a = 사이(next, 2, 12);
    const b = 사이(next, 2, 10);
    const c = 사이(next, 2, 10);
    if (kind === 0) {
      const V = a * b * c;
      return {
        prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 부피는 몇 cm³일까요?`,
        answer: `${V} cm³`,
        wrongs: 수들(V, [a + b + c, 2 * (a * b + b * c + a * c), a * b + c, V + a * b, V - b * c], 'cm³'),
        tag: 'volume',
        strategy: '직육면체의 부피',
        hint: '(가로)×(세로)×(높이)예요.',
        steps: [`${a}×${b}×${c}=${V}이므로 ${V} cm³입니다.`],
        misconceptionTip: '부피는 세 길이를 곱해요. 더하면 안 돼요.',
        visual: 상자(a, b, c),
      };
    }
    if (kind === 1) {
      const V = a * a * a;
      return {
        prompt: `한 모서리가 ${a} cm인 정육면체의 부피는 몇 cm³일까요?`,
        answer: `${V} cm³`,
        wrongs: 수들(V, [a * 3, a * a, a * a * 6, a * a * 3], 'cm³'),
        tag: 'volume',
        strategy: '정육면체의 부피',
        hint: '(한 모서리)×(한 모서리)×(한 모서리)예요.',
        steps: [`${a}×${a}×${a}=${V}이므로 ${V} cm³입니다.`],
        visual: 정육면체(a),
      };
    }
    const V = a * b * c;
    return {
      prompt: `부피가 ${V} cm³인 직육면체의 가로가 ${a} cm, 세로가 ${b} cm일 때 높이는 몇 cm일까요?`,
      answer: `${c} cm`,
      wrongs: 수들(c, [V - a * b, a * b, c + 1, V / a], 'cm'),
      tag: 'volume',
      strategy: '부피에서 높이 구하기',
      hint: '(높이)=(부피)÷(가로)÷(세로)예요.',
      steps: [`${a}×${b}=${a * b}`, `${V}÷${a * b}=${c}이므로 ${c} cm입니다.`],
      visual: { ...상자(a, b, c), edgeLabels: { width: `${a} cm`, depth: `${b} cm`, height: '? cm' } },
    };
  },
};

const 부피비교: G5Family = {
  id: 'compare',
  make: (seed) => {
    const next = 고르개(seed);
    const p = [사이(next, 2, 6), 사이(next, 2, 6), 사이(next, 2, 6)];
    const q = [사이(next, 2, 6), 사이(next, 2, 6), 사이(next, 2, 6)];
    const vp = p[0] * p[1] * p[2];
    const vq = q[0] * q[1] * q[2];
    if (vp === vq) return null;
    const 큰 = vp > vq ? '가' : '나';
    return {
      prompt: `쌓기나무로 가는 가로 ${p[0]}개, 세로 ${p[1]}개, 높이 ${p[2]}층으로, 나는 가로 ${q[0]}개, 세로 ${q[1]}개, 높이 ${q[2]}층으로 쌓은 직육면체입니다. 부피가 더 큰 것은 어느 것일까요?`,
      answer: 큰,
      wrongs: [큰 === '가' ? '나' : '가', '부피가 같습니다', '알 수 없습니다'],
      tag: 'volume',
      strategy: '단위 부피의 개수로 부피 비교하기',
      hint: '쌓기나무의 개수를 각각 세어 보세요.',
      steps: [`가는 ${p[0]}×${p[1]}×${p[2]}=${vp}개, 나는 ${q[0]}×${q[1]}×${q[2]}=${vq}개입니다.`, `그러므로 ${큰}입니다.`],
      misconceptionTip: '가로, 세로, 높이 가운데 하나만 보고 비교하면 안 돼요.',
    };
  },
};

const 단위: G5Family = {
  id: 'unit',
  make: (seed) => {
    const next = 고르개(seed);
    const kind = next(3);
    if (kind === 0) {
      const n = 사이(next, 2, 9);
      return {
        prompt: `${n} m³는 몇 cm³일까요?`,
        answer: `${n * 1000000} cm³`,
        wrongs: [n * 1000, n * 100, n * 10000].map((x) => `${x} cm³`),
        tag: 'volume',
        strategy: 'm³를 cm³로 바꾸기',
        hint: '1 m³=1000000 cm³예요.',
        steps: [`1 m³=100 cm×100 cm×100 cm=1000000 cm³입니다.`, `${n} m³=${n * 1000000} cm³`],
        misconceptionTip: '1 m=100 cm이지만 1 m³는 100 cm³가 아니에요. 100을 세 번 곱해요.',
      };
    }
    if (kind === 1) {
      return {
        prompt: '한 모서리의 길이가 1 m인 정육면체의 부피를 무엇이라고 쓸까요?',
        answer: '1 m³',
        wrongs: ['1 m²', '1 cm³', '100 cm³'],
        tag: 'volume',
        strategy: '부피 단위 1 m³',
        hint: '한 모서리가 1 cm인 정육면체의 부피가 1 cm³예요.',
        steps: ['한 모서리가 1 m인 정육면체의 부피를 1 m³라 쓰고 1 세제곱미터라고 읽습니다.'],
      };
    }
    const a = 사이(next, 1, 5);
    const b = 사이(next, 1, 5);
    const c = 사이(next, 1, 3);
    const V = a * b * c;
    return {
      prompt: `가로 ${a * 100} cm, 세로 ${b * 100} cm, 높이 ${c * 100} cm인 직육면체의 부피는 몇 m³일까요?`,
      answer: `${V} m³`,
      wrongs: [...new Set([V * 100, V * 1000000, a + b + c, V * 10])].filter((x) => x !== V).slice(0, 3).map((x) => `${x} m³`),
      tag: 'volume',
      strategy: 'm 단위로 바꾸어 부피 구하기',
      hint: '100 cm=1 m로 바꾼 다음 곱해요.',
      steps: [`${a * 100} cm=${a} m, ${b * 100} cm=${b} m, ${c * 100} cm=${c} m`, `${a}×${b}×${c}=${V}이므로 ${V} m³입니다.`],      visual: 상자(a * 100, b * 100, c * 100),
    };
  },
};

const 뜻: G5Family = {
  id: 'meaning',
  make: (seed) => {
    const qs = [
      { p: '직육면체의 여섯 면의 넓이의 합을 무엇이라고 할까요?', a: '겉넓이', w: ['부피', '둘레', '들이'], s: '여섯 면의 넓이의 합을 겉넓이라고 합니다.' },
      { p: '한 모서리의 길이가 1 cm인 정육면체의 부피를 무엇이라고 쓸까요?', a: '1 cm³', w: ['1 cm²', '1 cm', '1 m³'], s: '한 모서리가 1 cm인 정육면체의 부피를 1 cm³라 쓰고 1 세제곱센티미터라고 읽습니다.' },
      { p: '직육면체의 겉넓이를 구하는 방법으로 알맞은 것은 어느 것일까요?', a: '(한 밑면의 넓이)×2+(옆면의 넓이)', w: ['(가로)×(세로)×(높이)', '(한 밑면의 넓이)+(옆면의 넓이)', '(세 면의 넓이의 합)'], s: '두 밑면과 네 옆면의 넓이를 모두 더합니다.' },
    ];
    const q = qs[seed % qs.length];
    return { prompt: q.p, answer: q.a, wrongs: q.w, tag: 'volume', strategy: '겉넓이와 부피의 뜻', hint: '겉넓이는 넓이, 부피는 공간의 크기예요.', steps: [q.s] };
  },
};

export const unit6Lesson61 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [뜻, 부피비교];
    case 2:
      return lv === '하' ? [겉넓이, 뜻] : [겉넓이];
    case 3:
      return [부피비교];
    case 4:
      return lv === '하' ? [부피, 뜻] : [부피];
    case 5:
      return [단위];
    default:
      return null;
  }
};
