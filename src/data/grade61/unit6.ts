import type { BoxDrawingVisual, Difficulty, StackIsoVisual } from '../../types';
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

// ── 그림으로 생각하는 문항 ─────────────────────────────────────────
// 쌓기나무(1 cm³)를 빈틈없이 쌓은 직육면체를 그대로 그립니다. 지도서
// 부피 비교 차시가 '단위 부피가 몇 개인지'로 견주게 합니다. 쌓기나무를
// 그림에서 층별로 세어 보는 일이 곧 (가로)×(세로)×(높이)의 뜻입니다.
const 쌓은직육면체 = (가로: number, 세로: number, 높이: number) => Array.from({ length: 세로 }, () => Array.from({ length: 가로 }, () => 높이));
const 쌓기그림 = (items: Array<{ name: string; d: [number, number, number] }>, label: string): StackIsoVisual => ({
  kind: 'stack-iso',
  label,
  heights: 쌓은직육면체(...items[0].d),
  ...(items.length > 1 ? { items: items.map((it) => ({ name: it.name, heights: 쌓은직육면체(...it.d) })) } : {}),
});

const 쌓기나무부피: G5Family = {
  id: 'cube-count',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const a = 사이(next, 2, lv === '하' ? 3 : 4);
    const b = 사이(next, 2, 3);
    const c = 사이(next, 2, lv === '하' ? 2 : 3);
    const V = a * b * c;
    const 보이는면 = a * b + b * c + a * c;
    return {
      prompt: '부피가 1 cm³인 쌓기나무를 빈틈없이 쌓아 만든 직육면체입니다. 이 직육면체의 부피는 몇 cm³일까요?',
      answer: `${V} cm³`,
      wrongs: 수들(V, [보이는면, a + b + c, a * b + c, V + a * b, V - a * b], 'cm³'),
      tag: 'volume',
      strategy: '단위 부피의 개수로 부피 구하기',
      hint: '한 층에 쌓기나무가 몇 개인지 먼저 세고, 몇 층인지 세어 보세요.',
      steps: [`한 층에 ${a}×${b}=${a * b}개씩 ${c}층이므로 ${a * b}×${c}=${V}개입니다.`, `쌓기나무 1개가 1 cm³이므로 ${V} cm³입니다.`],
      misconceptionTip: '겉에 보이는 면만 세면 안 돼요. 안쪽에 가려진 쌓기나무도 있어요.',
      visual: 쌓기그림([{ name: '', d: [a, b, c] }], '쌓기나무로 쌓은 직육면체'),
    };
  },
};

const 쌓기비교: G5Family = {
  id: 'cube-compare',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const 크기 = () => [사이(next, 1, 4), 사이(next, 1, 3), 사이(next, 1, 3)] as [number, number, number];
    const p = 크기();
    const q = 크기();
    const vp = p[0] * p[1] * p[2];
    const vq = q[0] * q[1] * q[2];
    if (vp < 4 || vq < 4) return null;
    // 길이 하나만 보고 고르면 틀리도록, 한쪽이 더 길거나 높은데 부피는 작은 짝을 즐겨 냅니다.
    const 속는짝 = (p[0] > q[0] || p[2] > q[2]) !== vp > vq;
    if (lv !== '하' && !속는짝 && vp !== vq && next(2) === 0) return null;
    const 같음 = vp === vq;
    const 큰 = vp > vq ? '가' : '나';
    if (lv === '하' && 같음) return null;
    const 묻기 = lv === '상' && !같음 ? '차' : '비교';
    if (묻기 === '차') {
      const d = Math.abs(vp - vq);
      return {
        prompt: '부피가 1 cm³인 쌓기나무를 빈틈없이 쌓아 만든 두 직육면체입니다. 어느 것의 부피가 몇 cm³ 더 클까요?',
        answer: `${큰}, ${d} cm³`,
        wrongs: [`${큰 === '가' ? '나' : '가'}, ${d} cm³`, `${큰}, ${d + 1} cm³`, `${큰}, ${Math.abs(p[0] * p[1] - q[0] * q[1]) || d + 2} cm³`].filter((w, i, xs) => xs.indexOf(w) === i),
        tag: 'volume',
        strategy: '단위 부피의 개수로 부피의 차 구하기',
        hint: '두 직육면체에 쌓기나무가 각각 몇 개인지 세어 보세요.',
        steps: [`가는 ${p.join('×')}=${vp}개, 나는 ${q.join('×')}=${vq}개입니다.`, `${Math.max(vp, vq)}-${Math.min(vp, vq)}=${d}이므로 ${큰}가 ${d} cm³ 더 큽니다.`],
        minusIsOperator: true,
        visual: 쌓기그림([{ name: '가', d: p }, { name: '나', d: q }], '쌓기나무로 쌓은 두 직육면체'),
      };
    }
    return {
      prompt: '부피가 1 cm³인 쌓기나무를 빈틈없이 쌓아 만든 두 직육면체입니다. 부피가 더 큰 것은 어느 것일까요?',
      answer: 같음 ? '부피가 같습니다' : 큰,
      wrongs: 같음 ? ['가', '나', '알 수 없습니다'] : [큰 === '가' ? '나' : '가', '부피가 같습니다', '알 수 없습니다'],
      tag: 'volume',
      strategy: '단위 부피의 개수로 부피 비교하기',
      hint: '더 길어 보이는 것이 더 큰 것은 아니에요. 쌓기나무의 개수를 세어 보세요.',
      steps: [`가는 ${p.join('×')}=${vp}개, 나는 ${q.join('×')}=${vq}개입니다.`, 같음 ? '개수가 같으므로 부피가 같습니다.' : `그러므로 ${큰}의 부피가 더 큽니다.`],
      misconceptionTip: '가로, 세로, 높이 가운데 하나만 보고 비교하면 안 돼요.',
      visual: 쌓기그림([{ name: '가', d: p }, { name: '나', d: q }], '쌓기나무로 쌓은 두 직육면체'),
    };
  },
};

// 부피가 같아도 겉넓이는 다를 수 있습니다. 두 모양을 견주어 보게 합니다.
const 같은부피겉넓이: G5Family = {
  id: 'same-volume-surface',
  make: (seed) => {
    const next = 고르개(seed);
    const 모양들: Array<[number, number, number]> = [];
    const V = [8, 12, 12, 16, 18, 24][next(6)];
    for (let a = 1; a <= 6; a += 1) for (let b = 1; b <= 3; b += 1) for (let c = 1; c <= 4; c += 1) if (a * b * c === V && a >= b) 모양들.push([a, b, c]);
    if (모양들.length < 2) return null;
    const p = 모양들[next(모양들.length)];
    const q = 모양들[next(모양들.length)];
    const 겉 = ([a, b, c]: [number, number, number]) => 2 * (a * b + b * c + a * c);
    if (겉(p) === 겉(q)) return null;
    const 넓은 = 겉(p) > 겉(q) ? '가' : '나';
    return {
      prompt: `부피가 1 cm³인 쌓기나무 ${V}개로 만든 두 직육면체입니다. 겉넓이가 더 넓은 것은 어느 것일까요?`,
      answer: 넓은,
      wrongs: [넓은 === '가' ? '나' : '가', '겉넓이가 같습니다', '알 수 없습니다'],
      tag: 'volume',
      strategy: '부피가 같은 직육면체의 겉넓이 견주기',
      hint: '쌓기나무의 수(부피)가 같아도 겉에 드러나는 면의 수는 다를 수 있어요.',
      steps: [`가: (${p[0] * p[1]}+${p[1] * p[2]}+${p[0] * p[2]})×2=${겉(p)} cm²`, `나: (${q[0] * q[1]}+${q[1] * q[2]}+${q[0] * q[2]})×2=${겉(q)} cm²`, `그러므로 ${넓은}의 겉넓이가 더 넓습니다.`],
      misconceptionTip: '부피가 같으면 겉넓이도 같다고 생각하기 쉬워요. 길쭉할수록 겉넓이가 넓어져요.',
      visual: 쌓기그림([{ name: '가', d: p }, { name: '나', d: q }], '쌓기나무로 만든 두 직육면체'),
    };
  },
};

// 정육면체의 겉넓이·부피에서 거꾸로 한 모서리를 찾습니다.
const 정육면체거꾸로: G5Family = {
  id: 'cube-reverse',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 2, 10);
    const 겉으로 = next(2) === 0;
    const 값 = 겉으로 ? 6 * a * a : a * a * a;
    return {
      prompt: 겉으로 ? `겉넓이가 ${값} cm²인 정육면체의 한 모서리는 몇 cm일까요?` : `부피가 ${값} cm³인 정육면체의 한 모서리는 몇 cm일까요?`,
      answer: `${a} cm`,
      wrongs: 수들(a, 겉으로 ? [값 / 6, a + 1, a - 1, Math.round(값 / 4)] : [Math.round(값 / 3), a + 1, a - 1, a * a], 'cm'),
      tag: 'volume',
      strategy: '거꾸로 생각하여 한 모서리 구하기',
      hint: 겉으로 ? '정육면체의 여섯 면은 모두 같아요. 한 면의 넓이부터 구해 보세요.' : '같은 수를 세 번 곱해서 부피가 되는 수를 찾아보세요.',
      steps: 겉으로
        ? [`한 면의 넓이는 ${값}÷6=${a * a} cm²입니다.`, `${a}×${a}=${a * a}이므로 한 모서리는 ${a} cm입니다.`]
        : [`□×□×□=${값}인 □를 찾습니다.`, `${a}×${a}×${a}=${값}이므로 한 모서리는 ${a} cm입니다.`],
      misconceptionTip: 겉으로 ? '겉넓이를 6으로 나눈 값은 한 면의 넓이예요. 한 모서리가 아니에요.' : '부피를 3으로 나누면 안 돼요.',
      visual: { ...정육면체(a), edgeLabels: { width: '? cm' } },
    };
  },
};

const 늘린배: G5Family = {
  id: 'scale',
  make: (seed) => {
    const next = 고르개(seed);
    const k = 사이(next, 2, 3);
    const 무엇 = next(2) === 0 ? '부피' : '겉넓이';
    const v = 무엇 === '부피' ? k ** 3 : k ** 2;
    return {
      prompt: `직육면체의 가로, 세로, 높이를 각각 ${k}배로 늘리면 ${무엇}은(는) 처음의 몇 배가 될까요?`,
      answer: `${v}배`,
      wrongs: [...new Set([k, k * 3, k ** 2, k ** 3, k * 2])].filter((x) => x !== v).slice(0, 3).map((x) => `${x}배`),
      tag: 'volume',
      strategy: '길이를 늘릴 때 부피와 겉넓이의 변화',
      hint: '가로 2, 세로 1, 높이 1처럼 쉬운 수로 직접 계산해 보세요.',
      steps: 무엇 === '부피'
        ? [`부피는 세 길이를 곱하므로 ${k}×${k}×${k}=${v}배가 됩니다.`]
        : [`한 면의 넓이는 두 길이를 곱하므로 ${k}×${k}=${k * k}배가 되고, 여섯 면이 모두 그렇게 되므로 겉넓이도 ${v}배입니다.`],
      misconceptionTip: `길이가 ${k}배라고 ${무엇}도 ${k}배가 되는 것은 아니에요.`,
    };
  },
};

const 물높이: G5Family = {
  id: 'water',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 10, 30);
    const b = 사이(next, 10, 25);
    const d = 사이(next, 2, 6);
    const V = a * b * d;
    return {
      prompt: `가로 ${a} cm, 세로 ${b} cm인 직육면체 모양의 수조에 물이 들어 있습니다. 돌을 물속에 완전히 잠기게 넣었더니 물의 높이가 ${d} cm 높아졌습니다. 돌의 부피는 몇 cm³일까요?`,
      answer: `${V} cm³`,
      wrongs: 수들(V, [a * b, a * b + d, (a + b) * d * 2, V * 2], 'cm³'),
      tag: 'volume',
      strategy: '늘어난 물의 부피로 물건의 부피 구하기',
      hint: '돌의 부피만큼 물이 위로 밀려 올라와요. 늘어난 물의 모양도 직육면체예요.',
      steps: ['돌의 부피는 높아진 만큼의 물의 부피와 같습니다.', `${a}×${b}×${d}=${V}이므로 ${V} cm³입니다.`],
      visual: { ...상자(a, b, 사이(next, 15, 30)), edgeLabels: { width: `${a} cm`, depth: `${b} cm` }, label: '수조' },
    };
  },
};

const 옆면넓이: G5Family = {
  id: 'lateral',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 2, 10);
    const b = 사이(next, 2, 9);
    const c = 사이(next, 2, 9);
    if (a === b) return null;
    const 옆 = 2 * (a + b) * c;
    const S = 2 * a * b + 옆;
    const 묻기 = next(2) === 0 ? '옆' : '겉';
    return {
      prompt: 묻기 === '옆'
        ? `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체에서 색칠한 두 면을 밑면으로 볼 때, 네 옆면의 넓이의 합은 몇 cm²일까요?`
        : `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 겉넓이를 (한 밑면의 넓이)×2+(옆면의 넓이)로 구하면 몇 cm²일까요?`,
      answer: 묻기 === '옆' ? `${옆} cm²` : `${S} cm²`,
      wrongs: 묻기 === '옆' ? 수들(옆, [(a + b) * c, 4 * a * c, 2 * a * b + (a + b) * c, a * b * c], 'cm²') : 수들(S, [a * b + 옆, 2 * a * b + (a + b) * c, a * b * c, S - 2 * a * b], 'cm²'),
      tag: 'volume',
      strategy: '옆면을 펼쳐 하나의 직사각형으로 보기',
      hint: '네 옆면을 펼치면 가로가 밑면의 둘레, 세로가 높이인 직사각형이 돼요.',
      steps: 묻기 === '옆'
        ? [`밑면의 둘레는 (${a}+${b})×2=${2 * (a + b)} cm입니다.`, `옆면의 넓이는 ${2 * (a + b)}×${c}=${옆} cm²입니다.`]
        : [`한 밑면의 넓이는 ${a}×${b}=${a * b} cm²입니다.`, `옆면의 넓이는 (${a}+${b})×2×${c}=${옆} cm²입니다.`, `${a * b}×2+${옆}=${S} cm²`],
      visual: { ...상자(a, b, c), shaded: ['top', 'bottom'] },
    };
  },
};

const 혼합단위: G5Family = {
  id: 'mixed-unit',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 4);
    const b50 = [50, 150, 250][next(3)];
    const c = 사이(next, 1, 3);
    const V = a * (b50 / 100) * c;
    if (!Number.isInteger(V * 10)) return null;
    return {
      prompt: `가로 ${a} m, 세로 ${b50} cm, 높이 ${c} m인 직육면체의 부피는 몇 m³일까요?`,
      answer: `${V} m³`,
      wrongs: [...new Set([a * b50 * c, V * 10, a * c + b50 / 100, V + 1])].filter((x) => x !== V).slice(0, 3).map((x) => `${x} m³`),
      tag: 'volume',
      strategy: '단위를 하나로 맞추어 부피 구하기',
      hint: '먼저 세 길이를 모두 m로 나타내요.',
      steps: [`${b50} cm=${b50 / 100} m입니다.`, `${a}×${b50 / 100}×${c}=${V}이므로 ${V} m³입니다.`],
      misconceptionTip: '단위가 다른 길이를 그대로 곱하면 안 돼요.',
    };
  },
};

export const unit6Lesson61 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  // 그림을 보고 세는 문항, 거꾸로 생각하는 문항, 늘린 배를 따지는 문항,
  // 생활 문제를 차시마다 고루 섞습니다.
  switch (lessonNo) {
    case 1:
      return [뜻, 쌓기나무부피, 쌓기비교];
    case 2:
      return lv === '하' ? [겉넓이, 옆면넓이, 정육면체거꾸로, 뜻] : [겉넓이, 옆면넓이, 정육면체거꾸로, 같은부피겉넓이, 늘린배];
    case 3:
      return lv === '하' ? [쌓기비교, 쌓기나무부피, 부피비교] : [쌓기비교, 쌓기나무부피, 부피비교, 같은부피겉넓이];
    case 4:
      return lv === '하' ? [부피, 쌓기나무부피, 정육면체거꾸로, 뜻] : [부피, 정육면체거꾸로, 물높이, 늘린배];
    case 5:
      return lv === '하' ? [단위, 혼합단위] : [단위, 혼합단위, 물높이];
    default:
      return null;
  }
};
