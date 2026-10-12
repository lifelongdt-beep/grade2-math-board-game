import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun } from '../grade5/util';
import { 고르개, 물건들, 사이, 셈그림, 수보기 } from '../grade11/common';
import { 빈칸셈, 합짝 } from '../grade1/thinking';

// ════════════════════════════════════════════════════════════════════
// 1-2 2단원 덧셈과 뺄셈(1)
// ────────────────────────────────────────────────────────────────────
// 단원 전개 계획:
//   1 단원 도입
//   2 세 수의 덧셈을 해 볼까요       — 9 이하, 앞에서부터 두 수씩
//   3 세 수의 뺄셈을 해 볼까요       — 9 이하, 앞에서부터 두 수씩
//   4 10이 되는 더하기를 해 볼까요   — 바꾸어 더해도 10
//   5 10에서 빼기를 해 볼까요
//   6 10을 만들어 더해 볼까요        — 합이 10인 두 수를 먼저 더하기
//
// 유의 사항:
//   · "9 이하의 범위에서 세 수의 덧셈과 뺄셈은 앞에서부터 두 수씩
//     순서대로 계산할 수 있도록 지도한다."
//   · 10이 되는 더하기는 1-1의 10 모으기·가르기를 바탕으로 합니다.
//   · 10을 만들어 더하는 세 수의 덧셈은 합이 10을 넘을 수 있습니다
//     (10과 나머지 수를 더해 십몇).
// ════════════════════════════════════════════════════════════════════

const 계산 = (식: string): number => {
  const parts = 식.match(/\d+|[+-]/g) ?? [];
  let v = Number(parts[0]);
  for (let k = 1; k < parts.length; k += 2) v = parts[k] === '+' ? v + Number(parts[k + 1]) : v - Number(parts[k + 1]);
  return v;
};

// ── 도입: 한 자리 수 덧셈·뺄셈 떠올리기 ─────────────────────────────
const 도입: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = 고르개(seed);
    const plus = next(2) === 0;
    const a = 사이(next, 2, 8);
    const b = plus ? 사이(next, 1, 9 - a) : 사이(next, 1, a);
    const v = plus ? a + b : a - b;
    const t = 물건들[next(물건들.length)];
    return {
      prompt: `${a}${plus ? '+' : '-'}${eun(String(b))} 얼마일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [v + 1, v - 1, plus ? Math.abs(a - b) : a + b, v + 2], 0, 18),
      tag: plus ? 'addition' : 'subtraction',
      strategy: '한 자리 수의 덧셈과 뺄셈 떠올리기',
      hint: plus ? `${a}에서 ${b}만큼 이어 세어 보세요.` : `${a}에서 ${b}만큼 거꾸로 세어 보세요.`,
      steps: [`${a}${plus ? '+' : '-'}${b}=${v}입니다.`],
      minusIsOperator: true,
      visual: plus
        ? 셈그림(t.이름, [{ count: a, icon: t.icon }, { count: b, icon: t.icon }], '+')
        : 셈그림(t.이름, [{ count: a, icon: t.icon, crossed: b }]),
    };
  },
};

// ── 세 수의 덧셈(9 이하) ────────────────────────────────────────────
const 세수덧셈 = (picture: boolean): G5Family => ({
  id: `add3-${picture ? 'pic' : 'num'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 5);
    const b = 사이(next, 1, 8 - a);
    const c = 사이(next, 1, 9 - a - b);
    const v = a + b + c;
    const t = 물건들[next(물건들.length)];
    return {
      prompt: `${a}+${b}+${eun(String(c))} 얼마일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [a + b, v + 1, v - 1, b + c, v - c + 1], 0, 18),
      tag: 'addition',
      strategy: '세 수의 덧셈 — 앞에서부터 두 수씩',
      hint: `앞의 두 수 ${a}+${b}을(를) 먼저 계산하고, 그 값에 ${c}을(를) 더해 보세요.`,
      steps: [`앞의 두 수를 먼저 더하면 ${a}+${b}=${a + b}입니다.`, `${a + b}에 ${c}을(를) 더하면 ${a + b}+${c}=${v}입니다.`],
      misconceptionTip: '앞의 두 수만 더하고 멈추면 안 돼요. 세 수를 모두 더해요.',
      ...(picture ? { visual: { kind: 'counters' as const, label: t.이름, groups: [{ count: a, icon: t.icon }, { count: b, icon: t.icon }, { count: c, icon: t.icon }], joiner: '+' as const } } : {}),
    };
  },
});

const 세수뺄셈 = (picture: boolean): G5Family => ({
  id: `sub3-${picture ? 'pic' : 'num'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 4, 9);
    const b = 사이(next, 1, a - 2);
    const c = 사이(next, 1, a - b - 1);
    const v = a - b - c;
    const t = 물건들[next(물건들.length)];
    return {
      prompt: `${a}-${b}-${eun(String(c))} 얼마일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [a - b, v + 1, a - b + c, v + 2, b + c], 0, 9),
      tag: 'subtraction',
      strategy: '세 수의 뺄셈 — 앞에서부터 두 수씩',
      hint: `앞의 두 수 ${a}-${b}을(를) 먼저 계산하고, 그 값에서 ${c}을(를) 빼 보세요.`,
      steps: [`앞의 두 수를 먼저 빼면 ${a}-${b}=${a - b}입니다.`, `${a - b}에서 ${c}을(를) 빼면 ${a - b}-${c}=${v}입니다.`],
      misconceptionTip: '뒤의 두 수를 먼저 계산하면 안 돼요. 뺄셈은 앞에서부터 차례로 계산해요.',
      minusIsOperator: true,
      ...(picture ? { visual: 셈그림(t.이름, [{ count: a, icon: t.icon, crossed: b + c }]) } : {}),
    };
  },
});

const 세수문장 = (plus: boolean): G5Family => ({
  id: `three-word-${plus ? 'add' : 'sub'}`,
  make: (seed) => {
    const next = 고르개(seed);
    if (plus) {
      const a = 사이(next, 1, 5);
      const b = 사이(next, 1, 8 - a);
      const c = 사이(next, 1, 9 - a - b);
      const v = a + b + c;
      return {
        prompt: `연못에 오리가 ${a}마리 있었습니다. ${b}마리가 더 오고, 또 ${c}마리가 더 왔습니다. 오리는 모두 몇 마리일까요?`,
        answer: `${v}마리`,
        wrongs: [a + b, v + 1, v - 1, b + c].filter((x) => x !== v && x > 0).map((x) => `${x}마리`),
        tag: 'addition',
        strategy: '세 수의 덧셈 문장제',
        hint: '처음 수에 더 온 수를 차례로 더해요.',
        steps: [`${a}+${b}+${c}을(를) 계산합니다.`, `${a}+${b}=${a + b}, ${a + b}+${c}=${v}이므로 ${v}마리입니다.`],
      };
    }
    const a = 사이(next, 5, 9);
    const b = 사이(next, 1, a - 2);
    const c = 사이(next, 1, a - b - 1);
    const v = a - b - c;
    return {
      prompt: `사탕이 ${a}개 있었습니다. 동생에게 ${b}개를 주고, 친구에게 ${c}개를 주었습니다. 남은 사탕은 몇 개일까요?`,
      answer: `${v}개`,
      wrongs: [a - b, v + 1, a - b + c, b + c].filter((x) => x !== v && x >= 0).map((x) => `${x}개`),
      tag: 'subtraction',
      strategy: '세 수의 뺄셈 문장제',
      hint: '처음 수에서 준 수를 차례로 빼요.',
      steps: [`${a}-${b}-${c}을(를) 계산합니다.`, `${a}-${b}=${a - b}, ${a - b}-${c}=${v}이므로 ${v}개입니다.`],
      minusIsOperator: true,
    };
  },
});

// ── 10이 되는 더하기 ────────────────────────────────────────────────
const 십되기: G5Family = {
  id: 'make-ten',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 10 - a;
    const 앞빈칸 = lv === '상' && next(2) === 0;
    return {
      prompt: 앞빈칸 ? `□+${b}=10에서 □ 안에 알맞은 수는 무엇일까요?` : `${a}+□=10에서 □ 안에 알맞은 수는 무엇일까요?`,
      answer: String(앞빈칸 ? a : b),
      wrongs: 수보기(앞빈칸 ? a : b, [앞빈칸 ? b : a, (앞빈칸 ? a : b) + 1, (앞빈칸 ? a : b) - 1, 10], 0, 10),
      tag: 'addition',
      strategy: '10이 되는 두 수 찾기',
      hint: '십 배열판의 빈칸이 몇 칸인지 세어 보세요.',
      steps: [`${a}에서 10까지 이어 세면 ${b}만큼 더 셉니다.`, `${a}+${b}=10이므로 □는 ${앞빈칸 ? a : b}입니다.`],
      misconceptionTip: '10에 더하면 안 돼요. 더해서 10이 되는 수를 찾아요.',
      ...(lv === '하' ? { visual: { kind: 'ten-frame' as const, label: `바둑돌 ${a}개`, frames: 1, fills: [{ count: a, color: 'teal' as const }] } } : {}),
    };
  },
};

const 바꾸어십: G5Family = {
  id: 'ten-swap',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 10 - a;
    if (a === b) return null;
    return {
      prompt: `${a}+${b}=10입니다. ${b}+${eun(String(a))} 얼마일까요?`,
      answer: '10',
      wrongs: 수보기(10, [a, b, b - a > 0 ? b - a : a - b, 11], 0, 18),
      tag: 'addition',
      strategy: '두 수를 바꾸어 더하기',
      hint: '더하는 두 수의 자리를 바꾸어도 합은 같아요.',
      steps: [`${a}+${b}과(와) ${b}+${a}은(는) 같은 두 수를 더한 것입니다.`, `그러므로 ${b}+${a}=10입니다.`],
    };
  },
};

const 십되는식: G5Family = {
  id: 'ten-pick',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const right = `${a}+${10 - a}`;
    const wrongs: string[] = [];
    let guard = 0;
    while (wrongs.length < 3 && guard < 40) {
      guard += 1;
      const p = 사이(next, 1, 9);
      const q = 사이(next, 1, 9);
      const 식 = `${p}+${q}`;
      if (p + q === 10 || wrongs.includes(식) || p + q < 7 || p + q > 12) continue;
      wrongs.push(식);
    }
    return {
      prompt: '합이 10인 덧셈식은 어느 것일까요?',
      answer: right,
      wrongs,
      tag: 'addition',
      strategy: '10이 되는 덧셈식 찾기',
      hint: '보기의 식을 하나씩 계산해 보세요.',
      steps: [`${right}=10입니다.`, `그러므로 합이 10인 식은 ${right}입니다.`],
    };
  },
};

// ── 10에서 빼기 ─────────────────────────────────────────────────────
const 십빼기: G5Family = {
  id: 'ten-minus',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const b = 사이(next, 1, 9);
    const v = 10 - b;
    const 빈칸 = lv === '상' && next(2) === 0;
    return {
      prompt: 빈칸 ? `10-□=${v}에서 □ 안에 알맞은 수는 무엇일까요?` : `10-${eun(String(b))} 얼마일까요?`,
      answer: String(빈칸 ? b : v),
      wrongs: 수보기(빈칸 ? b : v, [빈칸 ? v : b, (빈칸 ? b : v) + 1, (빈칸 ? b : v) - 1, 10 + b], 0, 19),
      tag: 'subtraction',
      strategy: '10에서 빼기',
      hint: '십 배열판 10칸에서 빼는 수만큼 지우고 남은 칸을 세어 보세요.',
      steps: [`10개 중 ${b}개를 덜어 내면 ${v}개가 남습니다.`, 빈칸 ? `10-${b}=${v}이므로 □는 ${b}입니다.` : `그러므로 10-${b}=${v}입니다.`],
      misconceptionTip: '10과 빼는 수를 더하면 안 돼요.',
      minusIsOperator: true,
      ...(lv !== '상' ? { visual: { kind: 'ten-frame' as const, label: '바둑돌 10개', frames: 1, fills: [{ count: 10, color: 'teal' as const }], crossed: b } } : {}),
    };
  },
};

// ── 10을 만들어 더하기 ──────────────────────────────────────────────
const 십만들어더하기 = (where: 'front' | 'back' | 'any'): G5Family => ({
  id: `make-ten-add-${where}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const p = 사이(next, 1, 9);
    const q = 10 - p;
    const r = 사이(next, 1, 9);
    const 앞 = where === 'front' || (where === 'any' && next(2) === 0);
    // 앞: p+q+r, 뒤: r+p+q
    const [x, y, z] = 앞 ? [p, q, r] : [r, p, q];
    const v = x + y + z;
    if (v > 19) return null;
    if (lv === '상' && next(2) === 0) {
      return {
        prompt: `${x}+${y}+□=${v}에서 □ 안에 알맞은 수는 무엇일까요?`,
        answer: String(z),
        wrongs: 수보기(z, [z + 1, z - 1, v, x + y], 0, 19),
        tag: 'addition',
        strategy: '10을 만들어 더하기에서 모르는 수',
        hint: `${x}+${y}을(를) 먼저 계산해 보세요.`,
        steps: [`${x}+${y}=${x + y}입니다.`, `${x + y}+□=${v}이므로 □는 ${z}입니다.`],
      };
    }
    return {
      prompt: `${x}+${y}+${eun(String(z))} 얼마일까요?`,
      answer: String(v),
      wrongs: 수보기(v, [v - 10, v + 1, v - 1, x + y, y + z], 0, 19),
      tag: 'addition',
      strategy: '합이 10이 되는 두 수를 먼저 더하기',
      hint: 앞 ? `${x}+${y}=10이에요. 10에 ${z}을(를) 더해 보세요.` : `${y}+${z}=10이에요. ${x}에 10을 더해 보세요.`,
      steps: 앞 ? [`${x}+${y}=10입니다.`, `10+${z}=${v}입니다.`] : [`뒤의 두 수 ${y}+${z}=10을 먼저 더합니다.`, `${x}+10=${v}입니다.`],
      misconceptionTip: '10이 되는 두 수를 찾아 먼저 더하면 쉽게 계산할 수 있어요.',
      ...(lv === '하'
        ? { visual: { kind: 'ten-frame' as const, label: `${x}, ${y}, ${z}`, frames: 2, fills: 앞 ? [{ count: x + y, color: 'teal' as const }, { count: z, color: 'orange' as const }] : [{ count: y + z, color: 'teal' as const }, { count: x, color: 'orange' as const }] } }
        : {}),
    };
  },
});

const 먼저더할두수: G5Family = {
  id: 'which-first',
  make: (seed) => {
    const next = 고르개(seed);
    const p = 사이(next, 1, 9);
    const q = 10 - p;
    const r = 사이(next, 1, 9);
    if (r === p || r === q) return null;
    const order = [p, q, r];
    for (let k = order.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [order[k], order[j]] = [order[j], order[k]];
    }
    const 식 = order.join('+');
    const 쌍 = `${p}과(와) ${q}`;
    const 다른쌍 = [`${p}과(와) ${r}`, `${q}과(와) ${r}`];
    return {
      prompt: `${식}을(를) 계산할 때 10을 만들려면 어느 두 수를 먼저 더하면 좋을까요?`,
      answer: 쌍,
      wrongs: [...다른쌍, '어느 두 수도 10이 되지 않습니다'],
      tag: 'addition',
      strategy: '10이 되는 두 수 찾기',
      hint: '더해서 10이 되는 두 수를 찾아보세요.',
      steps: [`${p}+${q}=10입니다.`, `그러므로 ${쌍}을(를) 먼저 더하면 좋습니다. 합은 ${계산(식)}입니다.`],
      sameValueOk: true,
    };
  },
};

export const unit2Lesson12 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [도입];
    case 2:
      if (lv === '하') return [세수덧셈(true), 세수덧셈(false)];
      if (lv === '중') return [세수덧셈(false), 세수문장(true)];
      return [세수문장(true), 세수덧셈(false)];
    case 3:
      if (lv === '하') return [세수뺄셈(true), 세수뺄셈(false)];
      if (lv === '중') return [세수뺄셈(false), 세수문장(false)];
      return [세수문장(false), 세수뺄셈(false)];
    case 4:
      if (lv === '하') return [십되기, 바꾸어십];
      if (lv === '중') return [십되기, 바꾸어십, 십되는식];
      return [십되기, 십되는식, 바꾸어십];
    case 5:
      return lv === '하' ? [십빼기, 빈칸셈('1-2-2', '-', 10, 10)] : [십빼기, 빈칸셈('1-2-2', '-', 10, 10), 합짝('1-2-2', 10)];
    case 6:
      if (lv === '하') return [십만들어더하기('front'), 십만들어더하기('back')];
      if (lv === '중') return [십만들어더하기('any'), 먼저더할두수];
      return [먼저더할두수, 십만들어더하기('any')];
    default:
      return null;
  }
};
