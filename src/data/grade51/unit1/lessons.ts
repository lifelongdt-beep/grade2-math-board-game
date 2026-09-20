import type { G5Family, G5Spec } from '../../grade5/build';
import { eul, eun, particleOf, pick, rand } from '../../grade5/util';
import {
  evaluate,
  firstSpotText,
  kindName,
  makeExpression,
  num,
  op,
  par,
  parenRule,
  render,
  ruleText,
  trace,
  wrongValues,
  type LessonKind,
  type Node,
} from './expr';

// ════════════════════════════════════════════════════════════════════
// 1단원 자연수의 혼합 계산 — 2~6차시
// ────────────────────────────────────────────────────────────────────
// 다섯 차시가 하는 일이 같습니다 — 어떤 연산이 섞였을 때 어느 것을 먼저
// 계산하는가. 그래서 문항 뭉치는 한 벌만 두고 차시가 쓰는 연산으로
// 가릅니다(LessonKind).
//
// 답은 사람이 적지 않습니다. 식을 나무로 들고 있다가 계산해서 냅니다
// (expr.ts). 풀이 줄도 같은 계산에서 나오므로, 문제와 답과 풀이가
// 서로 어긋날 수가 없습니다.
// ════════════════════════════════════════════════════════════════════

const 순서핵심 = (kind: LessonKind, paren: boolean) =>
  paren ? `${parenRule} 그다음은 ${ruleText[kind]}` : ruleText[kind];

// 풀이 줄을 교과서처럼 '=' 로 이어 적습니다.
//   16-2×5+7 = 16-10+7 = 6+7 = 13
const 풀이줄 = (lines: string[]): string[] => {
  const steps: string[] = [];
  for (let at = 1; at < lines.length; at += 1) {
    steps.push(`${lines[at - 1]} = ${lines[at]}`);
  }
  return steps;
};

// ── 1. 계산하기 ─────────────────────────────────────────────────────
const 계산문항 = (kind: LessonKind, index: number, wantParen?: boolean): G5Family => ({
  id: `calc-${index}${wantParen === undefined ? '' : wantParen ? '-p' : '-n'}`,
  make: (seed) => {
    const made = makeExpression(kind, seed + index * 101, wantParen);
    if (!made) return null;
    return {
      prompt: `${eul(made.text)} 계산하면 얼마일까요?`,
      answer: String(made.answer),
      wrongs: wrongValues(made),
      tag: 'mixedCalc',
      concept: 순서핵심(kind, made.paren),
      strategy: `${kindName[kind]} 계산하기`,
      hint: made.paren
        ? '( )가 보이면 그 안을 가장 먼저 계산하세요. ( ) 안을 계산한 값을 적어 식을 한 줄로 다시 써 보세요.'
        : '먼저 계산할 곳에 ○표를 하고, 그 자리만 계산해 식을 한 줄로 다시 써 보세요.',
      steps: [
        made.paren ? parenRule : ruleText[kind],
        ...풀이줄(made.lines),
      ],
      misconceptionTip: '앞에서부터 차례대로만 계산하면 답이 달라집니다. 먼저 계산할 곳을 찾은 다음에 손을 대세요.',
      selfCheck: '한 줄씩 다시 읽으며 먼저 계산할 곳을 빠뜨리지 않았는지 확인했나요?',
    };
  },
});

// ── 2. 가장 먼저 계산해야 하는 부분 ─────────────────────────────────
// 지도서 '보기와 같이 식에서 가장 먼저 계산해야 하는 부분을 찾아 ○표
// 하세요'를 고르는 문항으로 옮긴 것입니다. 계산을 못 해도 순서는 알아야
// 하고, 순서를 아는지는 답이 아니라 이 물음이 가립니다.
const 먼저문항 = (kind: LessonKind, wantParen?: boolean): G5Family => ({
  id: `first${wantParen === undefined ? '' : wantParen ? '-p' : '-n'}`,
  make: (seed) => {
    const made = makeExpression(kind, seed + 7, wantParen);
    if (!made) return null;
    const first = firstSpotText(made.node);
    if (!first) return null;

    // 이 식 안에 있는 다른 연산들이 그대로 오답이 됩니다. 아이가 실제로
    // 고르는 것들이라, 지어낸 오답보다 낫습니다.
    const 조각: string[] = [];
    const 모으기 = (one: Node) => {
      if (one.kind === 'num') return;
      모으기(one.left);
      모으기(one.right);
      조각.push(`${render(one.left)}${one.op}${render(one.right)}`);
    };
    모으기(made.node);
    const wrongs = 조각.filter((one) => one !== first);
    if (wrongs.length < 2) return null;

    return {
      prompt: `${made.text}에서 가장 먼저 계산해야 하는 부분은 어느 것일까요?`,
      answer: first,
      // 자리가 모자라면 '맨 앞부터'라고 답하는 아이의 몫으로 한 칸 둡니다.
      wrongs: [...wrongs, `${made.text} 전체`],
      tag: 'mixedCalc',
      concept: 순서핵심(kind, made.paren),
      strategy: `${kindName[kind]}의 계산 순서 알기`,
      hint: made.paren
        ? '( )가 있으면 그 안이 가장 먼저입니다. ( )가 없는 곳끼리는 곱셈과 나눗셈이 먼저입니다.'
        : '어떤 연산이 섞여 있는지 먼저 보세요. 곱셈과 나눗셈은 덧셈과 뺄셈보다 먼저 계산합니다.',
      steps: [
        made.paren ? parenRule : ruleText[kind],
        `그러므로 ${eul(made.text)} 계산할 때 가장 먼저 계산해야 하는 부분은 ${first}입니다.`,
      ],
      misconceptionTip: '식은 왼쪽부터 읽지만 계산은 왼쪽부터가 아닙니다. 순서를 정하는 것은 자리가 아니라 연산입니다.',
      selfCheck: '고른 부분을 먼저 계산했을 때 식이 한 줄로 깔끔하게 줄어드나요?',
    };
  },
});

// ── 3. 계산 순서 규칙 ───────────────────────────────────────────────
const 규칙문항 = (kind: LessonKind): G5Family => {
  const 다른규칙 = (Object.keys(ruleText) as LessonKind[])
    .filter((one) => one !== kind)
    .map((one) => ruleText[one]);
  return {
    id: 'rule',
    make: () => ({
      prompt: `${eun(kindName[kind])} 어떤 순서로 계산해야 할까요?`,
      answer: ruleText[kind],
      wrongs: [
        ...다른규칙,
        '뒤에서부터 거꾸로 계산합니다.',
      ],
      tag: 'mixedCalc',
      concept: ruleText[kind],
      strategy: `${kindName[kind]}의 계산 순서 알기`,
      hint: '이 식에 섞여 있는 연산이 무엇인지 먼저 세어 보세요. 섞인 연산이 순서를 정합니다.',
      steps: [
        '곱셈과 나눗셈은 덧셈과 뺄셈보다 먼저 계산합니다.',
        '같은 무리끼리 섞여 있으면 앞에서부터 차례대로 계산합니다.',
        ruleText[kind],
      ],
      misconceptionTip: '섞여 있는 연산이 무엇인지에 따라 순서가 달라집니다. 외운 한 가지를 모든 식에 쓰지 마세요.',
      selfCheck: '고른 순서대로 실제 식 하나를 계산해 보았나요?',
    }),
  };
};

// ── 4. ( )가 있을 때와 없을 때 ──────────────────────────────────────
// 지도서 활동 2 '두 식을 각각 계산하고, 계산 결과를 비교해 봅시다'입니다.
// ( )가 계산 결과를 바꾼다는 것이 이 단원의 두 기둥 가운데 하나라,
// 차시마다 들어갑니다.
const 괄호비교문항 = (kind: LessonKind): G5Family => ({
  id: 'paren-compare',
  make: (seed) => {
    const made = makeExpression(kind, seed + 23, true);
    if (!made) return null;
    // 같은 수, 같은 연산인데 ( )만 뗀 식입니다.
    const 벗김 = (one: Node): Node =>
      one.kind === 'num' ? one : { kind: 'op', op: one.op, left: 벗김(one.left), right: 벗김(one.right) };
    const 민식 = 벗김(made.node);
    const 민값 = evaluate(민식);
    if (민값 === null || 민값 === made.answer) return null;
    const 큰쪽 = 민값 > made.answer ? render(민식) : made.text;
    const 차 = Math.abs(민값 - made.answer);

    return {
      prompt: `두 식 ${made.text}와 ${render(민식)}의 계산 결과의 차는 얼마일까요?`,
      answer: String(차),
      wrongs: [String(made.answer), String(민값), String(차 + 1), String(민값 + made.answer)],
      tag: 'mixedCalc',
      concept: 순서핵심(kind, true),
      strategy: '( )가 있는 식과 없는 식의 계산 결과 비교하기',
      hint: '두 식을 각각 끝까지 계산한 다음, 큰 값에서 작은 값을 빼세요. 같은 수와 같은 연산인데 ( ) 하나로 답이 달라집니다.',
      steps: [
        parenRule,
        ...풀이줄(trace(made.node) ?? []),
        ...풀이줄(trace(민식) ?? []),
        `계산 결과가 더 큰 식은 ${큰쪽}이고, 두 결과의 차는 ${차}입니다.`,
      ],
      misconceptionTip: '( )는 장식이 아니라 계산 순서를 바꾸는 표시입니다. 있는지 없는지를 먼저 보세요.',
      selfCheck: '두 식을 각각 따로 계산했나요? 한쪽 답을 다른 쪽에 그대로 쓰지 않았나요?',
    };
  },
});

// ── 5. 바르게 계산한 것 찾기 ────────────────────────────────────────
const 바른풀이문항 = (kind: LessonKind): G5Family => ({
  id: 'which-right',
  make: (seed) => {
    const made = makeExpression(kind, seed + 41);
    if (!made || made.lines.length < 3) return null;
    // 바른 풀이는 첫 줄에서 둘째 줄로 가는 자리입니다.
    const 바름 = `${made.lines[0]} = ${made.lines[1]}`;
    // 앞에서부터 차례대로 계산했을 때의 둘째 줄입니다. 그 차시의 규칙을
    // 잊은 아이가 실제로 적는 줄이라, 이 문항이 겨누는 것 그대로입니다.
    const 조각: Array<{ text: string; node: Node }> = [];
    const 모으기 = (one: Node) => {
      if (one.kind === 'num') return;
      모으기(one.left);
      모으기(one.right);
      조각.push({ text: `${render(one.left)}${one.op}${render(one.right)}`, node: one });
    };
    모으기(made.node);
    const wrongs: string[] = [];
    for (const 한칸 of 조각) {
      const line = `${made.lines[0]} = ${made.lines[1]}`;
      if (한칸.text === firstSpotText(made.node)) continue;
      if (한칸.node.kind !== 'op') continue;
      if (한칸.node.left.kind !== 'num' || 한칸.node.right.kind !== 'num') continue;
      const value = evaluate(한칸.node);
      if (value === null) continue;
      const 잘못 = made.lines[0].replace(한칸.text, String(value));
      if (잘못 === made.lines[0]) continue;
      const 줄 = `${made.lines[0]} = ${잘못}`;
      if (줄 !== line && !wrongs.includes(줄)) wrongs.push(줄);
    }
    // 값 하나를 어긋나게 적은 줄도 하나 둡니다.
    const 흔들기 = made.lines[1].replace(/\d+/, (hit) => String(Number(hit) + 1));
    if (흔들기 !== made.lines[1]) wrongs.push(`${made.lines[0]} = ${흔들기}`);
    if (wrongs.length < 3) return null;

    return {
      prompt: `${eul(made.text)} 계산할 때 첫 번째 줄을 바르게 쓴 것은 어느 것일까요?`,
      answer: 바름,
      wrongs,
      tag: 'mixedCalc',
      concept: 순서핵심(kind, made.paren),
      strategy: `${kindName[kind]}의 계산 순서 알기`,
      hint: '먼저 계산해야 하는 곳을 찾고, 그 자리 하나만 값으로 바꾼 줄을 고르세요. 나머지는 그대로 두어야 합니다.',
      steps: [
        made.paren ? parenRule : ruleText[kind],
        `그러므로 가장 먼저 계산할 곳은 ${firstSpotText(made.node)}입니다.`,
        `${바름}${particleOf(바름, '이')} 됩니다.`,
      ],
      misconceptionTip: '한 줄에 두 군데를 한꺼번에 계산하면 어디서 틀렸는지 찾을 수 없습니다. 한 줄에 한 곳씩만 계산하세요.',
      selfCheck: '바꾼 자리 말고 나머지 수와 연산이 그대로인지 확인했나요?',
    };
  },
});

// ── 6. 문장제 ───────────────────────────────────────────────────────
// 지도서가 차시마다 들고 있는 장면을 그대로 씁니다. 장면과 식이 따로
// 놀지 않도록, 여기서는 식을 뽑아 놓고 말을 입히는 것이 아니라 장면이
// 제 식을 직접 짓습니다.
type Story = {
  id: string;
  build: (n: (bound: number) => number) => { prompt: string; node: Node; unit: string } | null;
};

const 이름 = ['수지', '지윤', '제니', '민준', '소희', '재우', '기범', '연진', '성호', '은서'];

const stories: Record<LessonKind, Story[]> = {
  'add-sub': [
    {
      id: 'sign-up',
      build: (n) => {
        const a = 20 + n(40);
        const b = 2 + n(Math.min(a - 1, 12));
        const c = 2 + n(15);
        return {
          prompt: `어제까지 방송국 체험을 신청한 학생은 ${a}명이었습니다. 오늘 ${b}명이 신청을 취소하고 ${c}명이 새로 신청했습니다. 오늘 체험을 신청한 학생은 모두 몇 명일까요?`,
          node: op('+', op('-', num(a), num(b)), num(c)),
          unit: '명',
        };
      },
    },
    {
      id: 'give-two',
      build: (n) => {
        const b = 3 + n(15);
        const c = 3 + n(15);
        const a = b + c + 2 + n(30);
        return {
          prompt: `색종이 ${a}장을 가지고 있었습니다. 만들기 시간에 ${b}장을 쓰고 친구에게 ${c}장을 주었습니다. 남은 색종이는 몇 장일까요?`,
          node: op('-', num(a), par(op('+', num(b), num(c)))),
          unit: '장',
        };
      },
    },
  ],
  'mul-div': [
    {
      id: 'candy-plate',
      build: (n) => {
        const b = 2 + n(5);
        const q = 3 + n(8);
        const c = 2 + n(5);
        return {
          prompt: `사탕 ${b * q}개를 접시 ${b}개에 똑같이 나누어 담았습니다. 이런 접시 ${c}개에 담긴 사탕은 모두 몇 개일까요?`,
          node: op('×', op('÷', num(b * q), num(b)), num(c)),
          unit: '개',
        };
      },
    },
    {
      id: 'walnut-box',
      build: (n) => {
        const b = 2 + n(4);
        const c = 2 + n(4);
        const k = 2 + n(6);
        return {
          prompt: `한 상자에 호두과자를 ${b}개씩 ${c}줄 담을 수 있습니다. 호두과자 ${b * c * k}개를 상자에 담으려면 상자는 몇 개 필요할까요?`,
          node: op('÷', num(b * c * k), par(op('×', num(b), num(c)))),
          unit: '개',
        };
      },
    },
  ],
  'add-sub-mul': [
    {
      id: 'cookie',
      build: (n) => {
        const b = 2 + n(4);
        const c = 2 + n(6);
        const a = b * c + 3 + n(20);
        const d = 3 + n(12);
        return {
          prompt: `${eun(pick(이름, n(1000)))} 과자 ${a}개를 만들어 친구 ${b}명에게 ${c}개씩 나누어 준 후 ${d}개를 더 만들었습니다. 지금 가지고 있는 과자는 몇 개일까요?`,
          node: op('+', op('-', num(a), op('×', num(b), num(c))), num(d)),
          unit: '개',
        };
      },
    },
    {
      id: 'ticket',
      build: (n) => {
        const b = 2 + n(5);
        const c = 2 + n(6);
        const a = 10 + n(30);
        const d = 1 + n(a + b * c - 1);
        return {
          prompt: `주차장에 자동차가 ${a}대 있었습니다. ${b}분 동안 ${c}대씩 들어오고 ${d}대가 나갔습니다. 지금 주차장에 있는 자동차는 몇 대일까요?`,
          node: op('-', op('+', num(a), op('×', num(b), num(c))), num(d)),
          unit: '대',
        };
      },
    },
  ],
  'add-sub-div': [
    {
      id: 'flower',
      build: (n) => {
        const c = 2;
        const q = 3 + n(8);
        const a = 3 + n(10);
        const d = 1 + n(a + q - 1);
        return {
          prompt: `${eun(pick(이름, n(1000)))} 꽃 ${a}송이를 가지고 있었습니다. 선생님께서 꽃 ${c * q}송이를 ${c}명에게 똑같이 나누어 주셨습니다. 꽃다발을 만드는 데 ${d}송이를 사용했다면 남은 꽃은 몇 송이일까요?`,
          node: op('-', op('+', num(a), op('÷', num(c * q), num(c))), num(d)),
          unit: '송이',
        };
      },
    },
    {
      id: 'share-snack',
      build: (n) => {
        const c = 2 + n(5);
        const b = 2 + n(12);
        const total = c * (2 + n(8));
        const a = 1 + n(total - 1);
        return {
          prompt: `빵 ${a}개와 ${total - a}개를 한데 모아 ${c}명이 똑같이 나누어 가졌습니다. 한 사람이 가진 빵에 ${b}개를 더 받으면 몇 개가 될까요?`,
          node: op('+', op('÷', par(op('+', num(a), num(total - a))), num(c)), num(b)),
          unit: '개',
        };
      },
    },
  ],
  all: [
    {
      id: 'pencil',
      build: (n) => {
        const b = 2 + n(5);
        const q = 8 + n(14);
        const c = 2 + n(3);
        const d = 2 + n(3);
        if (c * d > q) return null;
        const e = 1 + n(5);
        return {
          prompt: `기념품점에서 연필 ${b * q}자루를 상자 ${b}개에 똑같이 나누어 담아 팝니다. ${eun(pick(이름, n(1000)))} 연필 한 상자를 사서 친구 ${c}명에게 각각 ${d}자루씩 나누어 주고, 언니에게 ${e}자루를 받았습니다. 지금 가지고 있는 연필은 몇 자루일까요?`,
          node: op('+', op('-', op('÷', num(b * q), num(b)), op('×', num(c), num(d))), num(e)),
          unit: '자루',
        };
      },
    },
    {
      id: 'marble',
      build: (n) => {
        const b = 2 + n(4);
        const c = 2 + n(5);
        const e = 2 + n(5);
        const q = 2 + n(6);
        const a = 10 + n(25);
        if (q > a + b * c) return null;
        return {
          prompt: `구슬 ${a}개를 가지고 있었습니다. 한 봉지에 ${c}개씩 들어 있는 구슬을 ${b}봉지 더 사고, 구슬 ${e * q}개를 ${e}명에게 똑같이 나누어 주었습니다. 지금 가지고 있는 구슬은 몇 개일까요?`,
          node: op('-', op('+', num(a), op('×', num(b), num(c))), op('÷', num(e * q), num(e))),
          unit: '개',
        };
      },
    },
  ],
};

const 문장문항 = (kind: LessonKind, index: number): G5Family => ({
  id: `story-${index}`,
  make: (seed) => {
    const pool = stories[kind];
    const story = pool[index % pool.length];
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const next = rand(seed * 37 + attempt * 13 + index * 7);
      const made = story.build(next);
      if (!made) continue;
      const lines = trace(made.node);
      if (!lines) continue;
      const answer = Number(lines[lines.length - 1]);
      if (answer < 1 || answer > 300) continue;
      const 식 = render(made.node);
      const 가짜 = wrongValues({
        node: made.node,
        text: 식,
        answer,
        lines,
        shapeId: story.id,
        paren: 식.includes('('),
      });
      if (가짜.length < 3) continue;
      return {
        prompt: made.prompt,
        answer: `${answer}${made.unit}`,
        wrongs: 가짜.map((one) => `${one}${made.unit}`),
        tag: 'mixedCalc',
        concept: 순서핵심(kind, 식.includes('(')),
        strategy: '실생활 문제를 하나의 식으로 나타내어 해결하기',
        hint: '이야기에 나온 차례대로 수와 연산을 하나의 식으로 적어 보세요. 식을 세운 다음에 계산 순서를 정합니다.',
        steps: [
          `하나의 식으로 나타내면 ${식}입니다.`,
          식.includes('(') ? parenRule : ruleText[kind],
          ...풀이줄(lines),
          `그러므로 ${answer}${made.unit}입니다.`,
        ],
        misconceptionTip: '식을 두 개로 나누어 풀어도 답은 같지만, 하나의 식으로 쓸 때는 계산 순서가 맞아야 합니다.',
        selfCheck: '세운 식을 이야기로 다시 읽었을 때 말이 되나요?',
      } satisfies G5Spec;
    }
    return null;
  },
});

// ── 7. 빈칸 구하기 (상) ─────────────────────────────────────────────
const 빈칸문항 = (kind: LessonKind): G5Family => ({
  id: 'blank',
  make: (seed) => {
    const made = makeExpression(kind, seed + 59);
    if (!made) return null;
    // 식에 나오는 수 하나를 □로 가립니다. 계산 순서를 알아야 거꾸로
    // 짚어 갈 수 있으므로, 이 단원에서 가장 어려운 물음입니다.
    const 수들: number[] = [];
    const 모으기 = (one: Node) => {
      if (one.kind === 'num') { 수들.push(one.value); return; }
      모으기(one.left);
      모으기(one.right);
    };
    모으기(made.node);
    const 고를자리 = 수들.length;
    if (고를자리 < 3) return null;
    const 자리 = seed % 고를자리;
    const 가린값 = 수들[자리];
    let 본적 = -1;
    const 가리기 = (one: Node): string => {
      if (one.kind === 'num') {
        본적 += 1;
        return 본적 === 자리 ? '□' : String(one.value);
      }
      const body = `${가리기(one.left)}${one.op}${가리기(one.right)}`;
      return one.paren ? `(${body})` : body;
    };
    const 가린식 = 가리기(made.node);
    if (!가린식.includes('□')) return null;

    return {
      prompt: `${가린식}=${made.answer} 일 때 □에 알맞은 수는 얼마일까요?`,
      answer: String(가린값),
      wrongs: [String(가린값 + 1), String(가린값 - 1), String(made.answer - 가린값), String(가린값 * 2)],
      tag: 'mixedCalc',
      concept: 순서핵심(kind, made.paren),
      strategy: '혼합 계산식에서 빠진 수 구하기',
      hint: '□에 수를 하나 넣어 계산해 보고, 답이 크면 줄이고 작으면 키워 보세요. 어느 자리를 먼저 계산하는지부터 정해야 합니다.',
      steps: [
        made.paren ? parenRule : ruleText[kind],
        `□에 ${가린값}${particleOf(String(가린값), '을')} 넣으면 ${made.text}${particleOf(made.text, '이')} 됩니다.`,
        ...풀이줄(made.lines),
        `계산 결과가 ${made.answer}이므로 □에 알맞은 수는 ${가린값}입니다.`,
      ],
      misconceptionTip: '□를 구할 때에도 계산 순서는 그대로입니다. 순서를 바꾸면 □의 값도 달라집니다.',
      selfCheck: '구한 수를 □에 넣어 실제로 계산해 보았나요?',
    };
  },
});

// ── 차시에 내보낼 뭉치 ──────────────────────────────────────────────
export const unit1Easy = (kind: LessonKind): G5Family[] => [
  계산문항(kind, 0, false),
  계산문항(kind, 1, false),
  먼저문항(kind, false),
  규칙문항(kind),
  계산문항(kind, 2, true),
  // 지도서의 활동 1은 늘 이야기에서 시작합니다. 기초에서도 식만 서른 번
  // 내면 이 단원이 무엇에 쓰이는지가 사라집니다.
  문장문항(kind, 0),
];

export const unit1Middle = (kind: LessonKind): G5Family[] => [
  계산문항(kind, 3, false),
  계산문항(kind, 4, true),
  먼저문항(kind, true),
  괄호비교문항(kind),
  문장문항(kind, 0),
  바른풀이문항(kind),
];

export const unit1Hard = (kind: LessonKind): G5Family[] => [
  문장문항(kind, 0),
  문장문항(kind, 1),
  괄호비교문항(kind),
  빈칸문항(kind),
  바른풀이문항(kind),
  계산문항(kind, 5, true),
];

// 1차시(단원 도입)입니다. 이 단원에서 배울 것을 미리 훑는 자리라,
// 앞 학년에서 배운 계산과 '순서가 다르면 값이 달라진다'는 것만 봅니다.
export const unit1Lesson1: G5Family[] = [
  {
    id: 'intro-why',
    make: (seed) => {
      const made = makeExpression('add-sub-mul', seed, false);
      if (!made) return null;
      const 앞에서부터 = 계산앞에서부터(made.node);
      if (앞에서부터 === null || 앞에서부터 === made.answer) return null;
      return {
        prompt: `${eul(made.text)} 계산했더니 한 친구는 ${앞에서부터}, 다른 친구는 ${made.answer}이라고 했습니다. 바르게 계산한 값은 얼마일까요?`,
        answer: String(made.answer),
        wrongs: [String(앞에서부터), String(made.answer + 1), String(앞에서부터 + 1), String(made.answer * 2)],
        tag: 'mixedCalc',
        concept: '한 식에 여러 연산이 섞이면 계산 순서가 답을 정합니다.',
        strategy: '계산 순서가 결과를 바꾸는 것 알기',
        hint: '같은 수와 같은 연산인데 값이 둘입니다. 둘 중 하나만 약속에 맞습니다 — 어느 연산을 먼저 하기로 했는지 떠올려 보세요.',
        steps: [
          '한 식에 여러 연산이 섞여 있을 때 계산 순서를 사람마다 다르게 하면 값이 달라집니다.',
          '그래서 순서를 약속해 두었습니다. 곱셈과 나눗셈을 덧셈과 뺄셈보다 먼저 계산합니다.',
          ...풀이줄(made.lines),
        ],
        misconceptionTip: '읽는 차례와 계산하는 차례는 다릅니다. 글은 왼쪽부터 읽지만 계산은 곱셈과 나눗셈부터입니다.',
        selfCheck: '왜 두 값이 나왔는지 한 줄로 말할 수 있나요?',
      };
    },
  },
  {
    id: 'intro-basic',
    make: (seed) => {
      const made = makeExpression('add-sub', seed + 11, false);
      if (!made) return null;
      return {
        prompt: `${eul(made.text)} 계산하면 얼마일까요?`,
        answer: String(made.answer),
        wrongs: wrongValues(made),
        tag: 'mixedCalc',
        concept: '덧셈과 뺄셈만 섞여 있으면 앞에서부터 차례대로 계산합니다.',
        strategy: '앞서 배운 덧셈과 뺄셈 떠올리기',
        hint: '덧셈과 뺄셈만 있으면 앞에서부터 차례대로 계산하면 됩니다.',
        steps: [ruleText['add-sub'], ...풀이줄(made.lines)],
      };
    },
  },
  {
    id: 'intro-muldiv',
    make: (seed) => {
      const made = makeExpression('mul-div', seed + 29, false);
      if (!made) return null;
      return {
        prompt: `${eul(made.text)} 계산하면 얼마일까요?`,
        answer: String(made.answer),
        wrongs: wrongValues(made),
        tag: 'mixedCalc',
        concept: '곱셈과 나눗셈만 섞여 있으면 앞에서부터 차례대로 계산합니다.',
        strategy: '앞서 배운 곱셈과 나눗셈 떠올리기',
        hint: '곱셈과 나눗셈만 있으면 앞에서부터 차례대로 계산하면 됩니다.',
        steps: [ruleText['mul-div'], ...풀이줄(made.lines)],
      };
    },
  },
  {
    id: 'intro-order-matters',
    make: (seed) => {
      const made = makeExpression('add-sub-div', seed + 43, false);
      if (!made) return null;
      const 앞에서부터 = 계산앞에서부터(made.node);
      if (앞에서부터 === null || 앞에서부터 === made.answer) return null;
      return {
        prompt: `${eul(made.text)} 계산했더니 한 친구는 ${앞에서부터}, 다른 친구는 ${made.answer}이라고 했습니다. 바르게 계산한 값은 얼마일까요?`,
        answer: String(made.answer),
        wrongs: [String(앞에서부터), String(made.answer + 3), String(앞에서부터 + 2), String(made.answer + 1)],
        tag: 'mixedCalc',
        concept: '한 식에 여러 연산이 섞이면 계산 순서가 답을 정합니다.',
        strategy: '계산 순서가 결과를 바꾸는 것 알기',
        hint: '나눗셈이 섞여 있습니다. 나눗셈과 덧셈·뺄셈 가운데 어느 것을 먼저 하기로 약속했는지 떠올려 보세요.',
        steps: [
          '같은 식을 사람마다 다른 순서로 계산하면 값이 달라집니다.',
          '그래서 곱셈과 나눗셈을 덧셈과 뺄셈보다 먼저 계산하기로 약속했습니다.',
          ...풀이줄(made.lines),
        ],
        misconceptionTip: '읽는 차례와 계산하는 차례는 다릅니다. 글은 왼쪽부터 읽지만 계산은 곱셈과 나눗셈부터입니다.',
        selfCheck: '왜 두 값이 나왔는지 한 줄로 말할 수 있나요?',
      };
    },
  },
  규칙문항('add-sub'),
  규칙문항('mul-div'),
];

// 단원 도입에서만 쓰는, '앞에서부터만 계산한 값'입니다.
function 계산앞에서부터(node: Node): number | null {
  const nums: number[] = [];
  const ops: Array<'+' | '-' | '×' | '÷'> = [];
  const 훑기 = (one: Node) => {
    if (one.kind === 'num') { nums.push(one.value); return; }
    훑기(one.left);
    ops.push(one.op);
    훑기(one.right);
  };
  훑기(node);
  let value = nums[0];
  for (let at = 0; at < ops.length; at += 1) {
    const right = nums[at + 1];
    if (ops[at] === '+') value += right;
    else if (ops[at] === '-') value -= right;
    else if (ops[at] === '×') value *= right;
    else if (right === 0 || value % right !== 0) return null;
    else value /= right;
    if (value < 0) return null;
  }
  return value;
}
