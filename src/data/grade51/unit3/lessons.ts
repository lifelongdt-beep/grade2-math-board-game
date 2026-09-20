import type { G5Family, G5Spec } from '../../grade5/build';
import type { QuestionVisual } from '../../../types';
import { gwa, particleOf, pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3단원 대응 관계 — 1~5차시
// ────────────────────────────────────────────────────────────────────
// 지도서가 못박아 둔 것: "두 양 사이의 대응 관계를 식으로 나타내는
// 방법을 지도하는 활동에서는 덧셈식, 뺄셈식, 곱셈식, 나눗셈식 중 하나로
// 표현되는 간단한 경우만 다룬다."
//
// 그래서 ○×2+1 같은 두 단계 식은 만들지 않습니다. 관계는 한 번의
// 연산으로 끝나야 합니다.
//
// 또 하나: "대응 관계를 탐구할 때는 두 양의 변화를 함께 고려하게 하고,
// 한 양의 변화에만 초점을 두지 않는다." 그래서 '얼마씩 커지나요'만
// 묻지 않고, 늘 두 양을 짝지어 묻습니다.
//
// 차시 차례도 지킵니다. 2·3차시는 말로 표현하는 차시라 ○, △ 기호를
// 쓰지 않습니다. 기호로 식을 세우는 것은 4차시에서 처음 나옵니다.
// ════════════════════════════════════════════════════════════════════

type Relation = {
  id: string;
  /** 왼쪽 양의 이름. 표의 윗줄에 짧게 적습니다. */
  leftLabel: string;
  /** 오른쪽 양의 이름. 표의 아랫줄에 적습니다. */
  rightLabel: string;
  /** 문장에서 부르는 온전한 이름입니다. */
  leftName: string;
  rightName: string;
  kind: '×' | '+' | '-' | '÷';
  by: number;
  /** 장면을 소개하는 한 문장입니다. */
  scene: string;
  /** 표를 몇씩 건너뛰며 적을지. 나눗셈 관계는 나누어떨어지는 값만 씁니다. */
  step: number;
  /** 쓸 수 있는 가장 작은 왼쪽 값입니다. */
  from: number;
};

// 다섯째, 여섯째 … '6째'라고 적으면 아이가 문제를 읽다가 걸립니다.
const 차례 = (k: number): string => {
  const 이름 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
  return 이름[k - 1] ?? `${k}번째`;
};

const apply = (relation: Relation, left: number): number => {
  if (relation.kind === '×') return left * relation.by;
  if (relation.kind === '+') return left + relation.by;
  if (relation.kind === '-') return left - relation.by;
  return left / relation.by;
};

const 말로 = (relation: Relation): string => {
  if (relation.kind === '×') return `${relation.rightName}${particleOf(relation.rightName, '은')} ${relation.leftName}의 ${relation.by}배입니다.`;
  if (relation.kind === '+') return `${relation.rightName}${particleOf(relation.rightName, '은')} ${relation.leftName}보다 ${relation.by} 더 많습니다.`;
  if (relation.kind === '-') return `${relation.rightName}${particleOf(relation.rightName, '은')} ${relation.leftName}보다 ${relation.by} 더 적습니다.`;
  return `${relation.rightName}${particleOf(relation.rightName, '은')} ${relation.leftName}${particleOf(relation.leftName, '을')} ${relation.by}로 나눈 수입니다.`;
};

// 말로 적은 다른 관계들입니다. 오답으로 씁니다 — 아이가 실제로
// 헷갈리는 것은 '몇 배'와 '몇 더 많다', 그리고 어느 쪽이 기준인가입니다.
const 다른말 = (relation: Relation): string[] => {
  const 오른 = relation.rightName;
  const 왼 = relation.leftName;
  const 은 = particleOf(오른, '은');
  const out: string[] = [];

  // '1배'는 아무 말도 하지 않는 말입니다. by가 1인 관계(손수건과 집게,
  // 의자와 사이)에서는 '몇 배' 대신 방향을 뒤집은 말을 오답으로 씁니다.
  if (relation.by !== 1) {
    out.push(`${오른}${은} ${왼}의 ${relation.by}배입니다.`);
    out.push(`${왼}${particleOf(왼, '은')} ${오른}의 ${relation.by}배입니다.`);
    out.push(`${오른}${은} ${왼}의 ${relation.by + 1}배입니다.`);
  }
  out.push(`${오른}${은} ${왼}보다 ${relation.by} 더 많습니다.`);
  out.push(`${오른}${은} ${왼}보다 ${relation.by} 더 적습니다.`);
  out.push(`${오른}${은} ${왼}보다 ${relation.by + 1} 더 많습니다.`);
  out.push(`${오른}${은} ${왼}${particleOf(왼, '을')} ${relation.by + 1}로 나눈 수입니다.`);

  // 참인 말은 오답이 될 수 없습니다. 표의 모든 칸에서 맞는지 실제로
  // 넣어 보고 걸러 냅니다 — 사람이 눈으로 읽어 걸러서는 언젠가 놓칩니다.
  const 칸 = [0, 1, 2, 3].map((at) => relation.from + at * relation.step);
  const 참인가 = (말: string) => {
    const 배 = /의 (\d+)배입니다/.exec(말);
    const 더많 = /보다 (\d+) 더 많습니다/.exec(말);
    const 더적 = /보다 (\d+) 더 적습니다/.exec(말);
    const 나눈 = /(\d+)로 나눈 수입니다/.exec(말);
    const 뒤집힘 = 말.startsWith(왼);
    return 칸.every((left) => {
      const right = apply(relation, left);
      const [a, b] = 뒤집힘 ? [right, left] : [left, right];
      if (배) return b === a * Number(배[1]);
      if (더많) return b === a + Number(더많[1]);
      if (더적) return b === a - Number(더적[1]);
      if (나눈) return b * Number(나눈[1]) === a;
      return false;
    });
  };
  return out.filter((one) => one !== 말로(relation) && !참인가(one));
};

// 4·5차시에서 쓰는 기호 식입니다. 지도서가 쓰는 기호 그대로 ○와 △.
const 식으로 = (relation: Relation): string => {
  if (relation.kind === '×') return `○×${relation.by}=△`;
  if (relation.kind === '+') return `○+${relation.by}=△`;
  if (relation.kind === '-') return `○-${relation.by}=△`;
  return `○÷${relation.by}=△`;
};

const 다른식 = (relation: Relation): string[] => {
  const all = [
    `○×${relation.by}=△`,
    `○+${relation.by}=△`,
    `○-${relation.by}=△`,
    `○÷${relation.by}=△`,
    `△×${relation.by}=○`,
    `△+${relation.by}=○`,
  ];
  return all.filter((one) => one !== 식으로(relation));
};

const 표 = (relation: Relation, from: number, count: number, hideAt?: number): QuestionVisual => ({
  kind: 'table',
  label: `${gwa(relation.leftLabel)} ${relation.rightLabel}의 대응 관계`,
  categoryLabel: relation.leftLabel,
  valueLabel: relation.rightLabel,
  columns: Array.from({ length: count }, (_, at) => {
    const left = from + at * relation.step;
    return {
      name: String(left),
      value: hideAt === at ? null : apply(relation, left),
    };
  }),
});

// 지도서가 쓰는 장면들입니다. 단원 전체가 이 장면들 위에서 돌아갑니다 —
// 자전거와 바퀴, 손수건과 집게, 풍력 발전기와 날개, 어린이 수와 입장료.
const relations: Relation[] = [
  {
    id: 'bike',
    leftLabel: '자전거(대)', rightLabel: '바퀴(개)',
    leftName: '자전거의 수', rightName: '자전거 바퀴의 수',
    kind: '×', by: 2, step: 1, from: 1,
    scene: '자전거 한 대에는 바퀴가 2개씩 있습니다.',
  },
  {
    id: 'windmill',
    leftLabel: '발전기(대)', rightLabel: '날개(개)',
    leftName: '풍력 발전기의 수', rightName: '날개의 수',
    kind: '×', by: 3, step: 1, from: 1,
    scene: '풍력 발전기 한 대에는 날개가 3개씩 달려 있습니다.',
  },
  {
    id: 'desk',
    leftLabel: '책상(개)', rightLabel: '다리(개)',
    leftName: '책상의 수', rightName: '책상 다리의 수',
    kind: '×', by: 4, step: 1, from: 1,
    scene: '책상 한 개에는 다리가 4개씩 있습니다.',
  },
  {
    id: 'duck',
    leftLabel: '오리(마리)', rightLabel: '다리(개)',
    leftName: '오리의 수', rightName: '오리 다리의 수',
    kind: '×', by: 2, step: 1, from: 1,
    scene: '생태 공원의 오리 한 마리에는 다리가 2개씩 있습니다.',
  },
  {
    id: 'flower',
    leftLabel: '꽃(송이)', rightLabel: '꽃잎(장)',
    leftName: '꽃의 수', rightName: '꽃잎의 수',
    kind: '×', by: 5, step: 1, from: 1,
    scene: '꽃 한 송이에는 꽃잎이 5장씩 있습니다.',
  },
  {
    id: 'ticket',
    leftLabel: '어린이(명)', rightLabel: '입장료(원)',
    leftName: '어린이의 수', rightName: '입장료',
    kind: '×', by: 500, step: 1, from: 1,
    scene: '동물 생태관의 어린이 입장료는 한 명에 500원입니다.',
  },
  {
    id: 'clip',
    leftLabel: '손수건(장)', rightLabel: '집게(개)',
    leftName: '손수건의 수', rightName: '집게의 수',
    kind: '+', by: 1, step: 1, from: 1,
    scene: '빨랫줄에 손수건을 나란히 널면서 양 끝과 손수건 사이마다 집게를 하나씩 꽂습니다.',
  },
  {
    id: 'age',
    leftLabel: '시후(살)', rightLabel: '어머니(살)',
    leftName: '시후의 나이', rightName: '어머니의 나이',
    kind: '+', by: 32, step: 1, from: 11,
    scene: '시후가 11살일 때 어머니는 43살이었습니다.',
  },
  {
    id: 'tape',
    leftLabel: '자른 횟수(회)', rightLabel: '도막(도막)',
    leftName: '자른 횟수', rightName: '도막의 수',
    kind: '+', by: 1, step: 1, from: 1,
    scene: '색 테이프를 한 번 자를 때마다 도막이 하나씩 늘어납니다.',
  },
  {
    id: 'gap',
    leftLabel: '의자(개)', rightLabel: '사이(군데)',
    leftName: '의자의 수', rightName: '의자 사이의 수',
    kind: '-', by: 1, step: 1, from: 2,
    scene: '의자를 한 줄로 나란히 놓고 의자와 의자 사이의 수를 셉니다.',
  },
  {
    id: 'bread',
    leftLabel: '빵(개)', rightLabel: '접시(개)',
    leftName: '빵의 수', rightName: '접시의 수',
    kind: '÷', by: 4, step: 4, from: 4,
    scene: '빵을 접시 한 개에 4개씩 남김없이 담습니다.',
  },
  {
    id: 'pencil',
    leftLabel: '연필(자루)', rightLabel: '상자(개)',
    leftName: '연필의 수', rightName: '상자의 수',
    kind: '÷', by: 6, step: 6, from: 6,
    scene: '연필을 상자 한 개에 6자루씩 남김없이 담습니다.',
  },
];

const 배수관계 = relations.filter((one) => one.kind === '×');
const 더하기관계 = relations.filter((one) => one.kind === '+');
const 빼기관계 = relations.filter((one) => one.kind === '-');
const 나누기관계 = relations.filter((one) => one.kind === '÷');
const 더빼기관계 = [...더하기관계, ...빼기관계];

const 시작값 = (relation: Relation, next: (bound: number) => number) =>
  relation.from + next(7) * relation.step;

// ── 표의 빈칸 채우기 ────────────────────────────────────────────────
const poolTag = (pool: Relation[]) => pool.map((one) => one.id[0]).join('');

const 빈칸문항 = (pool: Relation[]): G5Family => ({
  id: `table-blank-${poolTag(pool)}`,
  make: (seed) => {
    const next = rand(seed);
    const relation = pick(pool, seed);
    const from = 시작값(relation, next);
    const hideAt = 2 + next(3);
    const left = from + hideAt * relation.step;
    const 답 = apply(relation, left);
    if (답 < 1) return null;
    return {
      prompt: `${relation.scene} 표의 빈칸에 알맞은 수는 얼마일까요?`,
      answer: String(답),
      wrongs: [
        String(답 + relation.by),
        String(답 - relation.by),
        String(left),
        String(답 + 1),
      ],
      tag: 'correspondence',
      concept: '두 양이 함께 변할 때, 한 양을 알면 다른 양도 알 수 있습니다.',
      strategy: '대응 관계를 표에서 찾기',
      hint: '표를 세로로 짝지어 보세요. 윗줄의 수에서 아랫줄의 수로 갈 때 무엇을 했는지 찾으면 빈칸도 채울 수 있습니다.',
      steps: [
        말로(relation),
        `${relation.leftName}${particleOf(relation.leftName, '이')} ${left}일 때 ${relation.rightName}${particleOf(relation.rightName, '은')} ${답}입니다.`,
      ],
      visual: 표(relation, from, 5, hideAt),
      misconceptionTip: '아랫줄만 보고 "얼마씩 커지는지"로 채우면 표를 벗어난 값에서 틀립니다. 윗줄과 짝지어 보세요.',
      selfCheck: '찾은 관계를 표의 다른 칸에도 넣어 보았나요?',
    } satisfies G5Spec;
  },
});

// ── 말로 나타내기 (2·3차시) ─────────────────────────────────────────
const 말문항 = (pool: Relation[]): G5Family => ({
  id: `in-words-${poolTag(pool)}`,
  make: (seed) => {
    const next = rand(seed + 3);
    const relation = pick(pool, seed);
    const from = 시작값(relation, next);
    const wrongs = 다른말(relation);
    if (wrongs.length < 3) return null;
    return {
      prompt: `${relation.scene} 표를 보고 두 양 사이의 대응 관계를 바르게 말한 것은 어느 것일까요?`,
      answer: 말로(relation),
      wrongs,
      tag: 'correspondence',
      concept: '대응 관계는 한 양에서 다른 양을 구하는 방법 하나로 말할 수 있습니다.',
      strategy: '두 양 사이의 대응 관계를 말로 표현하기',
      hint: '표의 한 칸에서 맞는 말을 찾았다면, 다른 칸에도 넣어 보세요. 모든 칸에서 맞아야 대응 관계입니다.',
      steps: [
        `${relation.leftName}${particleOf(relation.leftName, '이')} ${from}일 때 ${relation.rightName}${particleOf(relation.rightName, '은')} ${apply(relation, from)}입니다.`,
        `${relation.leftName}${particleOf(relation.leftName, '이')} ${from + relation.step}일 때 ${relation.rightName}${particleOf(relation.rightName, '은')} ${apply(relation, from + relation.step)}입니다.`,
        말로(relation),
      ],
      visual: 표(relation, from, 5),
      misconceptionTip: '어느 쪽이 기준인지 바꾸어 말하면 틀립니다. "무엇이 무엇의 몇 배인지" 차례를 지키세요.',
      selfCheck: '고른 말이 표의 모든 칸에서 맞나요?',
    };
  },
});

// ── 식으로 나타내기 (4·5차시) ──────────────────────────────────────
const 식문항 = (pool: Relation[]): G5Family => ({
  id: `as-formula-${poolTag(pool)}`,
  make: (seed) => {
    const next = rand(seed + 7);
    const relation = pick(pool, seed);
    const from = 시작값(relation, next);
    return {
      prompt: `${relation.scene} ${relation.leftName}${particleOf(relation.leftName, '을')} ○, ${relation.rightName}${particleOf(relation.rightName, '을')} △라고 할 때, 두 양 사이의 대응 관계를 바르게 나타낸 식은 어느 것일까요?`,
      answer: 식으로(relation),
      wrongs: 다른식(relation),
      tag: 'correspondence',
      concept: '대응 관계는 ○, △ 같은 기호를 써서 식 하나로 적을 수 있습니다.',
      strategy: '대응 관계를 기호를 사용하여 식으로 나타내기',
      hint: '표에서 ○에 수를 하나 넣어 보고 △가 맞게 나오는지 확인하세요. 한 칸만 맞아서는 안 되고 모든 칸에서 맞아야 합니다.',
      steps: [
        말로(relation),
        `${relation.leftName}${particleOf(relation.leftName, '을')} ○, ${relation.rightName}${particleOf(relation.rightName, '을')} △라고 하면 ${식으로(relation)}입니다.`,
        `○에 ${from + relation.step}${particleOf(String(from + relation.step), '을')} 넣으면 △는 ${apply(relation, from + relation.step)}${particleOf(String(apply(relation, from + relation.step)), '이')} 되어 표와 같습니다.`,
      ],
      visual: 표(relation, from, 5),
      misconceptionTip: '○과 △의 자리를 바꾸면 다른 식이 됩니다. 어느 쪽이 기준인지 먼저 정하세요.',
      selfCheck: '만든 식에 표의 다른 값을 넣어도 맞나요?',
    };
  },
});

// ── 식을 보고 값 구하기 ─────────────────────────────────────────────
const 값문항 = (pool: Relation[], 거꾸로: boolean): G5Family => ({
  id: `${거꾸로 ? 'from-right' : 'from-left'}-${poolTag(pool)}`,
  make: (seed) => {
    const next = rand(seed + 11);
    const relation = pick(pool, seed);
    const left = 시작값(relation, next) + (4 + next(8)) * relation.step;
    const right = apply(relation, left);
    if (right < 1) return null;
    if (거꾸로) {
      return {
        prompt: `${relation.scene} ${relation.leftName}${particleOf(relation.leftName, '을')} ○, ${relation.rightName}${particleOf(relation.rightName, '을')} △라고 하면 ${식으로(relation)}입니다. △가 ${right}일 때 ○는 얼마일까요?`,
        answer: String(left),
        wrongs: [String(right), String(apply(relation, left + relation.step)), String(left + relation.step), String(left - relation.step)],
        tag: 'correspondence',
        concept: '대응 관계를 알면 어느 쪽에서든 다른 쪽을 구할 수 있습니다.',
        strategy: '대응 관계를 이용하여 거꾸로 구하기',
        hint: '식에 △의 값을 넣고 ○를 구해 보세요. 곱한 것은 나누고, 더한 것은 빼면 됩니다.',
        steps: [
          `${식으로(relation)}에서 △=${right}입니다.`,
          relation.kind === '×' ? `○=${right}÷${relation.by}=${left}` :
          relation.kind === '+' ? `○=${right}-${relation.by}=${left}` :
          relation.kind === '-' ? `○=${right}+${relation.by}=${left}` :
          `○=${right}×${relation.by}=${left}`,
          `그러므로 ${relation.leftName}${particleOf(relation.leftName, '은')} ${left}입니다.`,
        ],
        misconceptionTip: '거꾸로 구할 때는 반대 연산을 씁니다. 같은 연산을 또 하면 값이 더 멀어집니다.',
        selfCheck: '구한 ○를 식에 넣으면 △가 문제의 값과 같나요?',
      };
    }
    return {
      prompt: `${relation.scene} ${relation.leftName}${particleOf(relation.leftName, '을')} ○, ${relation.rightName}${particleOf(relation.rightName, '을')} △라고 하면 ${식으로(relation)}입니다. ○가 ${left}일 때 △는 얼마일까요?`,
      answer: String(right),
      wrongs: [String(left), String(right + relation.by), String(right - relation.by), String(left + relation.by)],
      tag: 'correspondence',
      concept: '대응 관계를 알면 표에 없는 값도 구할 수 있습니다.',
      strategy: '대응 관계를 이용하여 값 구하기',
      hint: '식의 ○에 주어진 수를 넣고 계산하세요. 표를 끝까지 늘려 쓸 필요가 없습니다.',
      steps: [
        `${식으로(relation)}의 ○에 ${left}${particleOf(String(left), '을')} 넣습니다.`,
        relation.kind === '×' ? `△=${left}×${relation.by}=${right}` :
        relation.kind === '+' ? `△=${left}+${relation.by}=${right}` :
        relation.kind === '-' ? `△=${left}-${relation.by}=${right}` :
        `△=${left}÷${relation.by}=${right}`,
        `그러므로 ${relation.rightName}${particleOf(relation.rightName, '은')} ${right}입니다.`,
      ],
      misconceptionTip: '표에 있는 수만 보고 "다음은 얼마"로 세지 마세요. 멀리 있는 수는 식으로 구합니다.',
      selfCheck: '구한 값을 표의 규칙에 비추어 보면 말이 되나요?',
    };
  },
});

// ── 대응하는 두 양 찾기 (2차시) ─────────────────────────────────────
const 짝찾기: G5Family = {
  id: 'find-pair',
  make: (seed) => {
    const relation = pick(배수관계, seed);
    const 다른 = relations.filter((one) => one.id !== relation.id);
    const 답 = `${gwa(relation.leftName)} ${relation.rightName}`;
    // 한쪽만 바꾼 짝만 늘어놓으면 '자전거'가 두 번 나오는 것이 답이
    // 되어, 장면을 읽지 않고도 고를 수 있습니다. 양쪽을 섞습니다.
    const wrongs = [
      `${gwa(relation.leftName)} ${다른[0].rightName}`,
      `${gwa(다른[1].leftName)} ${relation.rightName}`,
      `${gwa(다른[2].leftName)} ${다른[3].rightName}`,
      `${gwa(relation.rightName)} ${다른[4].rightName}`,
    ].filter((one) => one !== 답);
    return {
      prompt: `${relation.scene} 이 장면에서 서로 대응하는 두 양을 바르게 짝지은 것은 어느 것일까요?`,
      answer: 답,
      wrongs,
      tag: 'correspondence',
      concept: '한 양이 변할 때 그에 따라 함께 변하는 양이 서로 대응하는 두 양입니다.',
      strategy: '서로 대응하는 두 양 찾기',
      hint: '한쪽이 늘어날 때 반드시 함께 늘어나는 것을 찾으세요. 장면에 없는 것은 짝이 될 수 없습니다.',
      steps: [
        `${relation.leftName}${particleOf(relation.leftName, '이')} 늘어나면 ${relation.rightName}도 함께 늘어납니다.`,
        `그러므로 서로 대응하는 두 양은 ${답}입니다.`,
      ],
      misconceptionTip: '장면에 나오지 않는 양은 짝이 될 수 없습니다. 무엇과 무엇이 함께 변하는지 보세요.',
      selfCheck: '한쪽을 하나 늘렸을 때 다른 쪽도 정해지나요?',
    };
  },
};

// ── 단원 도입 (1차시) ───────────────────────────────────────────────
// 4학년에서 배운 '규칙 찾기'를 떠올리는 자리입니다. 아직 '대응 관계'라는
// 말도, ○·△ 기호도 쓰지 않습니다.
export const unit3Lesson1: G5Family[] = [
  {
    id: 'number-pattern',
    make: (seed) => {
      const next = rand(seed);
      const start = 2 + next(20);
      const step = 2 + next(8);
      const 수열 = [start, start + step, start + step * 2, start + step * 3];
      const 답 = start + step * 4;
      return {
        prompt: `규칙에 따라 ${수열.join(', ')}, …와 같이 수를 늘어놓았습니다. 다섯째에 오는 수는 얼마일까요?`,
        answer: String(답),
        wrongs: [String(답 + step), String(답 - 1), String(답 + 1), String(start + step * 5)],
        tag: 'correspondence',
        concept: '수의 배열에서 얼마씩 커지는지 찾으면 다음 수를 알 수 있습니다.',
        strategy: '수의 배열에서 규칙 찾기',
        hint: '이웃한 두 수의 차를 모두 구해 보세요. 차가 늘 같으면 그만큼씩 커지는 규칙입니다.',
        steps: [
          `이웃한 두 수의 차가 모두 ${step}입니다.`,
          `넷째 수 ${수열[3]}에 ${step}${particleOf(String(step), '을')} 더하면 ${답}입니다.`,
        ],
        misconceptionTip: '앞의 두 수만 보고 규칙을 정하지 마세요. 끝까지 같은 규칙인지 확인해야 합니다.',
        selfCheck: '찾은 규칙으로 앞의 수들도 모두 만들어지나요?',
      };
    },
  },
  {
    id: 'shape-pattern',
    make: (seed) => {
      const next = rand(seed + 5);
      const per = 2 + next(4);
      const k = 5 + next(6);
      return {
        prompt: `삼각형 한 개를 만드는 데 성냥개비가 ${per + 1}개 필요합니다. 성냥개비를 ${per}개씩 더 놓아 삼각형을 옆으로 이어 붙일 때, 삼각형 ${k}개를 만들려면 성냥개비는 모두 몇 개 필요할까요?`,
        answer: String(per * k + 1),
        wrongs: [String(per * k), String((per + 1) * k), String(per * k + 2), String(per * (k + 1) + 1)],
        tag: 'correspondence',
        concept: '모양의 배열에서도 몇 개씩 늘어나는지 찾으면 멀리 있는 것도 구할 수 있습니다.',
        strategy: '모양의 배열에서 규칙 찾기',
        hint: '첫 번째 모양에 몇 개가 들어갔는지, 하나 늘 때마다 몇 개가 더 드는지 나누어 생각하세요.',
        steps: [
          `삼각형 1개에 ${per + 1}개, 하나 늘 때마다 ${per}개씩 더 듭니다.`,
          `삼각형 ${k}개: ${per}×${k}+1=${per * k + 1}(개)`,
        ],
        misconceptionTip: '처음 한 개에 드는 수와 늘어날 때마다 드는 수가 다릅니다. 한 가지로 묶어 곱하면 틀립니다.',
        selfCheck: '작은 수로 세어 보았을 때도 식이 맞나요?',
      };
    },
  },
  {
    id: 'calc-pattern',
    make: (seed) => {
      const next = rand(seed + 11);
      const base = 2 + next(6);
      const k = 3 + next(4);
      return {
        prompt: `규칙에 따라 ${base}×1=${base}, ${base}×2=${base * 2}, ${gwa(`${base}×3=${base * 3}`)} 같이 계산식을 늘어놓았습니다. ${차례(k)} 식의 계산 결과는 얼마일까요?`,
        answer: String(base * k),
        wrongs: [String(base * k + base), String(base + k), String(base * (k + 1)), String(base * k - 1)],
        tag: 'correspondence',
        concept: '계산식의 배열에서도 무엇이 어떻게 변하는지 찾을 수 있습니다.',
        strategy: '계산식의 배열에서 규칙 찾기',
        hint: '곱하는 수가 1씩 커지고 있습니다. 몇째 식인지가 곧 곱하는 수입니다.',
        steps: [`${차례(k)} 식은 ${base}×${k}이므로 계산 결과는 ${base * k}입니다.`],
        misconceptionTip: '식의 차례와 곱하는 수가 같습니다. 차례를 다른 자리에 넣지 마세요.',
        selfCheck: '앞의 식들도 같은 방법으로 만들어지나요?',
      };
    },
  },
  {
    id: 'table-rule',
    make: (seed) => {
      // 표를 보고 규칙을 찾는 것은 4학년에서 이미 합니다. 다만 여기서는
      // '대응 관계'라는 말을 쓰지 않고 '규칙'으로만 말합니다 — 그 말은
      // 2차시에서 처음 배웁니다.
      const next = rand(seed + 17);
      const 배 = 2 + next(5);
      const 시작 = 1 + next(4);
      const 칸 = [0, 1, 2, 3, 4].map((at) => 시작 + at);
      const 답 = 칸[4] * 배;
      return {
        prompt: `표의 위쪽 수에 항상 같은 수를 곱하여 아래쪽 수를 얻었습니다. 표의 빈칸에 알맞은 수는 얼마일까요?`,
        answer: String(답),
        wrongs: [String(답 + 배), String(답 - 배), String(칸[4]), String(답 + 1)],
        tag: 'correspondence',
        concept: '표에서 위아래 두 수를 짝지어 보면 규칙이 보입니다.',
        strategy: '표에서 규칙 찾기',
        hint: '표를 세로로 짝지어 보세요. 위쪽 수에 무엇을 곱하면 아래쪽 수가 되는지 찾으면 빈칸도 채울 수 있습니다.',
        steps: [
          `위쪽 수에 ${배}${particleOf(String(배), '을')} 곱하면 아래쪽 수가 됩니다.`,
          `${칸[4]}×${배}=${답}`,
        ],
        visual: {
          kind: 'table',
          label: '표에서 규칙 찾기',
          categoryLabel: '위쪽 수',
          valueLabel: '아래쪽 수',
          columns: 칸.map((value, at) => ({ name: String(value), value: at === 4 ? null : value * 배 })),
        },
        misconceptionTip: '아래쪽 줄만 보고 "얼마씩 커지는지"로 채우면 표를 벗어난 값에서 틀립니다. 위아래를 짝지어 보세요.',
        selfCheck: '찾은 규칙을 표의 다른 칸에도 넣어 보았나요?',
      };
    },
  },
];

// ── 차시에 내보낼 뭉치 ──────────────────────────────────────────────
// 2차시는 몇 배 관계(자전거와 바퀴), 3차시는 얼마 더 많은 관계(손수건과
// 집게)가 주인공입니다. 지도서 활동 1이 그렇게 나뉘어 있습니다.
// 두 차시 모두 말로만 표현합니다 — 기호 식은 4차시 것입니다.
export const unit3Lesson2 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 뭉치 = [빈칸문항(배수관계), 말문항(배수관계), 짝찾기, 빈칸문항(relations)];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [말문항(배수관계), 빈칸문항(relations), 짝찾기, 빈칸문항(배수관계)];
  return [말문항(relations), 빈칸문항(relations), 짝찾기, 말문항(배수관계)];
};

export const unit3Lesson3 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 뭉치 = [빈칸문항(더하기관계), 말문항(더하기관계), 빈칸문항(relations), 말문항(relations)];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [말문항(더빼기관계), 빈칸문항(relations), 말문항(relations), 빈칸문항(더하기관계)];
  return [말문항(relations), 빈칸문항(나누기관계), 말문항(더빼기관계), 빈칸문항(relations)];
};

export const unit3Lesson4 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 뭉치 = [식문항(배수관계), 식문항(더하기관계), 값문항(배수관계, false), 빈칸문항(relations), 말문항(relations)];
  if (difficulty === '하') return 뭉치;
  if (difficulty === '중') return [식문항(relations), 값문항(relations, false), 식문항(더하기관계), 값문항(배수관계, true), 빈칸문항(relations)];
  return [값문항(relations, true), 식문항(relations), 값문항(relations, false), 식문항(나누기관계), 말문항(relations)];
};

export const unit3Lesson5 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 뭉치 = [식문항(relations), 값문항(relations, false), 값문항(relations, true), 말문항(relations), 빈칸문항(relations)];
  if (difficulty === '하') return [식문항(배수관계), 값문항(배수관계, false), 빈칸문항(relations), 말문항(relations), 식문항(더하기관계)];
  if (difficulty === '중') return 뭉치;
  return [값문항(relations, true), 값문항(나누기관계, false), 식문항(relations), 식문항(나누기관계), 말문항(relations)];
};
