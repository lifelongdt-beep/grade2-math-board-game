import type { G5Family, G5Spec } from '../build';
import { eul, eun, euro, gwa, i as iJosa, iraneun, pick, rand } from '../util';
import {
  aboveMeaning,
  aboveWord,
  belowMeaning,
  belowWord,
  inAbove,
  inBelow,
  rangeLine,
  rangeText,
  type Edge,
} from './rangeCore';

// ════════════════════════════════════════════════════════════════════
// 2차시 이상과 이하는 무엇일까요 / 3차시 초과와 미만은 무엇일까요
// ────────────────────────────────────────────────────────────────────
// 두 차시가 하는 일은 같습니다. 기준이 되는 수를 범위에 넣느냐 마느냐만
// 다르고, 지도서도 같은 흐름(실생활 상황 → 말로 나타내기 → 그림으로
// 나타내기 → 실생활 문제해결)으로 짜여 있습니다. 그래서 한 벌만 쓰고
// included로 가릅니다.
//
// 이 차시의 오개념은 하나뿐이고 그것이 전부입니다 — 경곗값이 들어가는지.
// 그래서 오답에는 늘 '경곗값을 반대로 본 값'을 넣습니다. 아무 수나 넣으면
// 아이가 답을 맞혀도 무엇을 아는지 알 수 없습니다.
//
// 지도서가 못박은 것: '수직선'은 중학교 용어라 학생에게 쓰지 않습니다.
// 그래서 문항 글에는 '그림'이라고만 씁니다.
// ════════════════════════════════════════════════════════════════════

const 사람이름 = ['재준', '희재', '민성', '가람', '나우', '소정', '예지', '주호', '은수', '지수', '우리', '주원', '수현', '민규'];

const 자연수목록 = (seed: number, boundary: number, spread: number): number[] => {
  const next = rand(seed);
  const set = new Set<number>([boundary]);
  while (set.size < 5) {
    const delta = next(spread * 2 + 1) - spread;
    const value = boundary + delta;
    if (value > 0) set.add(value);
  }
  return [...set].sort((a, b) => a - b);
};

const 목록글 = (values: Array<number | string>) => values.join(', ');

// ── 하 ──────────────────────────────────────────────────────────────
export const lesson23Easy = (included: boolean): G5Family[] => [
  {
    id: 'meaning-above',
    make: (seed) => {
      const base = 10 + (Math.abs(seed) % 9) * 5;
      const word = aboveWord(included);
      return {
        prompt: `'${base} ${word}인 수'는 어떤 수일까요?`,
        answer: aboveMeaning(base, included),
        wrongs: [aboveMeaning(base, !included), belowMeaning(base, included), belowMeaning(base, !included)],
        tag: 'range',
        strategy: `${word}의 뜻 알기`,
        hint: `${iraneun(word)} 말에서 기준이 되는 수 ${base} 자신이 들어가는지부터 가려 보세요.`,
        steps: [
          `${eun(String(word))} 기준이 되는 수보다 큰 쪽을 가리키는 말입니다.`,
          included
            ? `이상은 기준이 되는 수 자신도 넣습니다. 그래서 ${base} ${word}인 수는 ${aboveMeaning(base, included)}입니다.`
            : `초과는 기준이 되는 수 자신은 넣지 않습니다. 그래서 ${base} ${word}인 수는 ${aboveMeaning(base, included)}입니다.`,
        ],
      };
    },
  },
  {
    id: 'meaning-below',
    make: (seed) => {
      const base = 12 + (Math.abs(seed) % 9) * 5;
      const word = belowWord(included);
      return {
        prompt: `'${base} ${word}인 수'는 어떤 수일까요?`,
        answer: belowMeaning(base, included),
        wrongs: [belowMeaning(base, !included), aboveMeaning(base, included), aboveMeaning(base, !included)],
        tag: 'range',
        strategy: `${word}의 뜻 알기`,
        hint: `${iraneun(word)} 말이 기준이 되는 수 ${base} 자신까지 넣는 말인지 아닌지를 먼저 가려 보세요.`,
        steps: [
          `${eun(String(word))} 기준이 되는 수보다 작은 쪽을 가리키는 말입니다.`,
          included
            ? `이하는 기준이 되는 수 자신도 넣습니다. 그래서 ${base} ${word}인 수는 ${belowMeaning(base, included)}입니다.`
            : `미만은 기준이 되는 수 자신은 넣지 않습니다. 그래서 ${base} ${word}인 수는 ${belowMeaning(base, included)}입니다.`,
        ],
      };
    },
  },
  {
    id: 'count-above',
    make: (seed) => {
      const base = 15 + (Math.abs(seed) % 8) * 5;
      const values = 자연수목록(seed, base, 4);
      const edge: Edge = { value: base, included };
      const answer = values.filter((v) => inAbove(v, edge)).length;
      const flipped = values.filter((v) => inAbove(v, { value: base, included: !included })).length;
      const other = values.filter((v) => inBelow(v, edge)).length;
      if (answer === flipped) return null; // 경곗값이 없으면 물을 것이 없습니다.
      return {
        prompt: `수 ${목록글(values)} 중에서 ${base} ${aboveWord(included)}인 수는 모두 몇 개일까요?`,
        answer: `${answer}개`,
        wrongs: [`${flipped}개`, `${other}개`, `${values.length - answer}개`, `${answer + 1}개`, `${Math.max(0, answer - 1)}개`],
        tag: 'range',
        strategy: `${aboveWord(included)}인 수 찾기`,
        hint: `수를 작은 것부터 늘어놓고 ${eul(String(base))} 찾은 다음, ${base} 자신이 들어가는지 먼저 정하세요.`,
        steps: [
          `${base} ${aboveWord(included)}인 수는 ${aboveMeaning(base, included)}입니다.`,
          `${목록글(values)} 중에서 여기에 맞는 수는 ${목록글(values.filter((v) => inAbove(v, edge)))}입니다.`,
          `그러므로 모두 ${answer}개입니다.`,
        ],
      };
    },
  },
  {
    id: 'count-below',
    make: (seed) => {
      const base = 18 + (Math.abs(seed) % 8) * 5;
      const values = 자연수목록(seed + 7, base, 4);
      const edge: Edge = { value: base, included };
      const answer = values.filter((v) => inBelow(v, edge)).length;
      const flipped = values.filter((v) => inBelow(v, { value: base, included: !included })).length;
      if (answer === flipped) return null;
      return {
        prompt: `수 ${목록글(values)} 중에서 ${base} ${belowWord(included)}인 수는 모두 몇 개일까요?`,
        answer: `${answer}개`,
        wrongs: [`${flipped}개`, `${values.length - answer}개`, `${answer + 1}개`, `${Math.max(0, answer - 1)}개`, `${values.length}개`],
        tag: 'range',
        strategy: `${belowWord(included)}인 수 찾기`,
        hint: `${eul(String(base))} 기준으로 왼쪽에 있는 수를 세되, ${base} 자신을 셀지 말지를 먼저 정하세요.`,
        steps: [
          `${base} ${belowWord(included)}인 수는 ${belowMeaning(base, included)}입니다.`,
          `${목록글(values)} 중에서 여기에 맞는 수는 ${목록글(values.filter((v) => inBelow(v, edge)))}입니다.`,
          `그러므로 모두 ${answer}개입니다.`,
        ],
      };
    },
  },
  {
    id: 'read-picture',
    make: (seed) => {
      const next = rand(seed);
      const base = 20 + next(9) * 5;
      const upward = next(2) === 0;
      const edge: Edge = { value: base, included };
      return {
        prompt: '그림이 나타내는 수의 범위는 무엇일까요?',
        // 2차시에서는 초과·미만을 아직 배우지 않았습니다. 그렇다고
        // 기준이 되는 수를 옮긴 것(45 이상 / 50 이상)을 오답으로 쓰면,
        // 그림에 적힌 경곗값만 보고 두 개를 지울 수 있어 물음이
        // 반으로 줄어듭니다. 그래서 같은 수를 두고 뜻만 다른 넷을
        // 보기로 놓습니다 — 점이 찼는지 비었는지, 화살표가 어느 쪽으로
        // 뻗는지를 모두 읽어야 고를 수 있습니다.
        answer: included
          ? (upward ? aboveMeaning(base, true) : belowMeaning(base, true))
          : (upward ? rangeText(edge) : rangeText(undefined, edge)),
        wrongs: included
          ? [
              upward ? belowMeaning(base, true) : aboveMeaning(base, true),
              upward ? aboveMeaning(base, false) : belowMeaning(base, false),
              upward ? belowMeaning(base, false) : aboveMeaning(base, false),
            ]
          : [
              upward ? rangeText({ value: base, included: !included }) : rangeText(undefined, { value: base, included: !included }),
              upward ? rangeText(undefined, edge) : rangeText(edge),
              upward
                ? rangeText(undefined, { value: base, included: !included })
                : rangeText({ value: base, included: !included }),
            ],
        tag: 'range',
        strategy: '그림에서 수의 범위 읽기',
        hint: '점이 까맣게 칠해져 있으면 그 수를 넣는 것이고, 속이 비어 있으면 넣지 않는 것입니다. 화살표가 어느 쪽으로 뻗는지도 보세요.',
        steps: [
          `점이 찍힌 자리가 기준이 되는 수 ${base}입니다.`,
          included
            ? '점이 까맣게 칠해져 있으므로 그 수가 범위에 들어갑니다.'
            : '점의 속이 비어 있으므로 그 수는 범위에 들어가지 않습니다.',
          `화살표가 ${upward ? '오른쪽' : '왼쪽'}으로 뻗으므로 ${upward ? aboveWord(included) : belowWord(included)}입니다. 그래서 ${
            included
              ? (upward ? aboveMeaning(base, true) : belowMeaning(base, true))
              : (upward ? rangeText(edge) : rangeText(undefined, edge))
          }입니다.`,
        ],
        visual: rangeLine(
          '수의 범위',
          5,
          upward ? edge : undefined,
          upward ? undefined : edge,
        ),
      };
    },
  },
  {
    id: 'edge-natural',
    make: (seed) => {
      const next = rand(seed);
      const base = 20 + next(12) * 5;
      const upward = next(2) === 0;
      if (upward) {
        const answer = included ? base : base + 1;
        return {
          prompt: `${base} ${aboveWord(included)}인 수 중에서 가장 작은 자연수는 무엇일까요?`,
          answer: String(answer),
          wrongs: [String(included ? base + 1 : base), String(base - 1), String(base + 2), String(base - 2)],
          tag: 'range',
          strategy: '범위에 들어가는 가장 작은 자연수 찾기',
          hint: `${base} 자신이 이 범위에 들어가는지부터 정하세요. 들어간다면 더 볼 것이 없습니다.`,
          steps: [
            `${base} ${aboveWord(included)}인 수는 ${aboveMeaning(base, included)}입니다.`,
            included
              ? `${base} 자신이 들어가므로 가장 작은 자연수는 ${answer}입니다.`
              : `${base} 자신은 들어가지 않으므로 그다음 자연수인 ${iJosa(String(answer))} 가장 작습니다.`,
          ],
        };
      }
      const answer = included ? base : base - 1;
      return {
        prompt: `${base} ${belowWord(included)}인 수 중에서 가장 큰 자연수는 무엇일까요?`,
        answer: String(answer),
        wrongs: [String(included ? base - 1 : base), String(base + 1), String(base - 2), String(base + 2)],
        tag: 'range',
        strategy: '범위에 들어가는 가장 큰 자연수 찾기',
        hint: `${base} 자신이 이 범위에 들어가는지부터 정하세요. 들어간다면 더 볼 것이 없습니다.`,
        steps: [
          `${base} ${belowWord(included)}인 수는 ${belowMeaning(base, included)}입니다.`,
          included
            ? `${base} 자신이 들어가므로 가장 큰 자연수는 ${answer}입니다.`
            : `${base} 자신은 들어가지 않으므로 그 앞 자연수인 ${iJosa(String(answer))} 가장 큽니다.`,
        ],
      };
    },
  },
  {
    id: 'pick-member',
    make: (seed) => {
      const next = rand(seed);
      const base = 30 + next(10) * 5;
      const edge: Edge = { value: base, included };
      // 경곗값을 반드시 보기에 넣습니다. 이상이면 답이 되고, 초과이면
      // 가장 잘 걸리는 오답이 됩니다. 이 차시가 묻는 것이 바로 그것입니다.
      const answer = included ? base : base + 1;
      const wrongs = included ? [base - 1, base - 2, base - 5] : [base, base - 1, base - 3];
      return {
        prompt: `${base} ${aboveWord(included)}인 수에 포함되는 수는 어느 것일까요?`,
        answer: String(answer),
        wrongs: wrongs.map(String),
        tag: 'range',
        strategy: '범위에 포함되는 수 고르기',
        hint: `보기의 수를 하나씩 ${gwa(String(base))} 견주어 보세요. ${base} 자신이 들어가는지가 갈림길입니다.`,
        steps: [
          `${base} ${aboveWord(included)}인 수는 ${aboveMeaning(base, included)}입니다.`,
          included
            ? `${eun(String(base))} 기준이 되는 수 자신이고, 이상은 그 수를 넣으므로 범위에 들어갑니다.`
            : `${eun(String(base))} 기준이 되는 수 자신이라 초과에는 들어가지 않습니다. ${base}보다 큰 ${iJosa(String(answer))} 범위에 들어갑니다.`,
          `그러므로 답은 ${answer}입니다.`,
        ],
        // 범위만 그립니다. 답이 되는 수에 점을 찍어 두면 그림이 답을
        // 짚어 주는 셈이라, 아이는 이상과 초과를 가리지 않고도 맞힙니다.
        visual: rangeLine('수의 범위', 5, edge),
      };
    },
  },
];

// ── 중 ──────────────────────────────────────────────────────────────
type 상황 = {
  id: string;
  // 기준이 되는 수를 받아 상황 문장을 만듭니다.
  intro: (base: number) => string;
  단위: string;
  방향: 'above' | 'below';
  값들: (seed: number, base: number) => number[];
  기준후보: number[];
  물음: string;
};

const 이상이하상황: 상황[] = [
  {
    id: 'marathon',
    intro: (base) => `올림픽 마라톤 경기는 나이가 ${base}세와 같거나 ${base}세보다 많으면 참가할 수 있습니다.`,
    단위: '세',
    방향: 'above',
    기준후보: [18, 20, 22],
    값들: (seed, base) => 자연수목록(seed, base, 4),
    물음: '참가할 수 있는 선수는 모두 몇 명일까요?',
  },
  {
    id: 'vote',
    intro: (base) => `우리나라에서는 ${base}세와 같거나 ${base}세보다 많으면 선거에서 투표할 수 있습니다.`,
    단위: '세',
    방향: 'above',
    기준후보: [18],
    값들: (seed, base) => 자연수목록(seed, base, 5),
    물음: '투표할 수 있는 사람은 모두 몇 명일까요?',
  },
  {
    id: 'ride',
    intro: (base) => `이 놀이기구는 키가 ${base} cm와 같거나 ${base} cm보다 크면 탈 수 있습니다.`,
    단위: 'cm',
    방향: 'above',
    기준후보: [120, 130, 140],
    값들: (seed, base) => 자연수목록(seed, base, 8),
    물음: '놀이기구를 탈 수 있는 학생은 모두 몇 명일까요?',
  },
  {
    id: 'cabin',
    intro: (base) => `어느 항공사는 무게가 ${base} kg과 같거나 ${base} kg보다 가벼운 가방만 비행기에 들고 탈 수 있습니다.`,
    단위: 'kg',
    방향: 'below',
    기준후보: [10, 12],
    값들: (seed, base) => 자연수목록(seed, base, 3),
    물음: '비행기에 들고 탈 수 있는 가방은 모두 몇 개일까요?',
  },
  {
    id: 'library',
    intro: (base) => `이 도서관에서는 한 사람이 책을 ${base}권과 같거나 ${base}권보다 적게 빌릴 수 있습니다.`,
    단위: '권',
    방향: 'below',
    기준후보: [5, 6, 7],
    값들: (seed, base) => 자연수목록(seed, base, 3),
    물음: '한 번에 빌릴 수 있는 권수는 모두 몇 가지일까요?',
  },
];

const 초과미만상황: 상황[] = [
  {
    id: 'sled',
    intro: (base) => `동계 올림픽 여자 스켈레톤 경기에서 ${base} kg보다 무거운 썰매는 사용할 수 없습니다.`,
    단위: 'kg',
    방향: 'above',
    기준후보: [38, 40],
    값들: (seed, base) => 자연수목록(seed, base, 3),
    물음: '사용할 수 없는 썰매는 모두 몇 개일까요?',
  },
  {
    id: 'temperature',
    intro: (base) => `어느 지역에서 최고 기온이 ${base} ℃보다 낮은 날을 서늘한 날이라고 합니다.`,
    단위: '℃',
    방향: 'below',
    기준후보: [25, 28, 30],
    값들: (seed, base) => 자연수목록(seed, base, 4),
    물음: '서늘한 날은 모두 며칠일까요?',
  },
  {
    id: 'signup',
    intro: (base) => `${base}세보다 어린 학생이 누리집에 회원 가입하려면 보호자의 동의가 필요합니다.`,
    단위: '세',
    방향: 'below',
    기준후보: [14],
    값들: (seed, base) => 자연수목록(seed, base, 3),
    물음: '보호자의 동의가 필요한 학생은 모두 몇 명일까요?',
  },
  {
    id: 'speed',
    intro: (base) => `이 도로에서는 자동차가 시속 ${base} km보다 빠르게 달리면 안 됩니다.`,
    단위: 'km',
    방향: 'above',
    기준후보: [60, 80, 100],
    값들: (seed, base) => 자연수목록(seed, base, 10),
    물음: '규정을 어긴 자동차는 모두 몇 대일까요?',
  },
];

export const lesson23Middle = (included: boolean): G5Family[] => {
  const 상황들 = included ? 이상이하상황 : 초과미만상황;

  const 개수세기 = (which: number): G5Family => ({
    id: `real-count-${which}`,
    make: (seed) => {
      const 상 = 상황들[(Math.abs(seed) + which) % 상황들.length];
      const base = pick(상.기준후보, seed + which);
      const values = 상.값들(seed + which * 13, base);
      const edge: Edge = { value: base, included };
      const 맞는것 = values.filter((v) => (상.방향 === 'above' ? inAbove(v, edge) : inBelow(v, edge)));
      const flipEdge: Edge = { value: base, included: !included };
      const 뒤집은것 = values.filter((v) => (상.방향 === 'above' ? inAbove(v, flipEdge) : inBelow(v, flipEdge)));
      if (맞는것.length === 뒤집은것.length) return null;
      if (맞는것.length === 0 || 맞는것.length === values.length) return null;
      const word = 상.방향 === 'above' ? aboveWord(included) : belowWord(included);
      // 무엇을 세는지에 따라 단위가 달라집니다. '모두 2입니다'처럼
      // 단위를 빠뜨리면 무엇이 둘인지 알 수 없습니다.
      const 세는말 = 상.물음.includes('명')
        ? '명'
        : 상.물음.includes('며칠')
          ? '일'
          : 상.물음.includes('대')
            ? '대'
            : 상.물음.includes('가지')
              ? '가지'
              : '개';
      return {
        prompt: `${상.intro(base)} 조사한 값이 ${목록글(values.map((v) => `${v} ${상.단위}`))}일 때, ${상.물음}`,
        answer: `${맞는것.length}${세는말}`,
        wrongs: [
          뒤집은것.length,
          values.length - 맞는것.length,
          맞는것.length + 1,
          Math.max(0, 맞는것.length - 1),
          values.length,
          1,
        ].map((n) => `${n}${세는말}`),
        tag: 'range',
        strategy: '실생활 상황에서 수의 범위 적용하기',
        hint: `문장에 나온 조건을 '${base} ${word}' 꼴로 바꾸어 적어 보세요. 그러면 ${base} 자신을 셀지 말지가 분명해집니다.`,
        steps: [
          `문장이 말하는 조건은 ${base} ${상.단위} ${word}입니다.`,
          `${목록글(values.map((v) => `${v} ${상.단위}`))} 중 조건에 맞는 것은 ${목록글(맞는것.map((v) => `${v} ${상.단위}`))}입니다.`,
          `그러므로 모두 ${맞는것.length}${세는말}입니다.`,
        ],
        visual: rangeLine(
          '조건에 맞는 범위',
          Math.max(1, Math.round((Math.max(...values) - Math.min(...values)) / 5)) || 1,
          상.방향 === 'above' ? edge : undefined,
          상.방향 === 'above' ? undefined : edge,
        ),
      };
    },
  });

  return [
    개수세기(0),
    개수세기(1),
    개수세기(2),
    {
      id: 'to-range-text',
      make: (seed) => {
        const 상 = 상황들[Math.abs(seed) % 상황들.length];
        const base = pick(상.기준후보, seed);
        const edge: Edge = { value: base, included };
        const answer = 상.방향 === 'above' ? rangeText(edge, undefined, 상.단위) : rangeText(undefined, edge, 상.단위);
        return {
          prompt: `${상.intro(base)} 조건에 맞는 수의 범위를 바르게 나타낸 것은 어느 것일까요?`,
          answer,
          // 2차시(이상·이하)에서는 초과·미만이라는 말을 아직 배우지
          // 않았으므로 오답에 쓰지 않습니다.
          wrongs: included
            ? [
                상.방향 === 'above' ? rangeText(undefined, edge, 상.단위) : rangeText(edge, undefined, 상.단위),
                상.방향 === 'above'
                  ? rangeText({ value: base + 1, included }, undefined, 상.단위)
                  : rangeText(undefined, { value: base + 1, included }, 상.단위),
                상.방향 === 'above'
                  ? rangeText(undefined, { value: base + 1, included }, 상.단위)
                  : rangeText({ value: base + 1, included }, undefined, 상.단위),
              ]
            : [
                상.방향 === 'above'
                  ? rangeText({ value: base, included: !included }, undefined, 상.단위)
                  : rangeText(undefined, { value: base, included: !included }, 상.단위),
                상.방향 === 'above' ? rangeText(undefined, edge, 상.단위) : rangeText(edge, undefined, 상.단위),
                상.방향 === 'above'
                  ? rangeText(undefined, { value: base, included: !included }, 상.단위)
                  : rangeText({ value: base, included: !included }, undefined, 상.단위),
              ],
          tag: 'range',
          strategy: '상황을 수의 범위로 나타내기',
          hint: "'같거나'라는 말이 문장에 있는지 찾아보세요. 그 한 마디가 기준이 되는 수를 넣을지 말지를 정합니다.",
          steps: [
            `문장에서 기준이 되는 수는 ${base} ${상.단위}입니다.`,
            included
              ? "'같거나'라는 말이 있으므로 기준이 되는 수도 범위에 넣습니다."
              : "'보다'라는 말만 있으므로 기준이 되는 수는 범위에 넣지 않습니다.",
            `그러므로 ${answer}입니다.`,
          ],
        };
      },
    },
    {
      id: 'who-is-out',
      make: (seed) => {
        const 상 = 상황들[Math.abs(seed + 3) % 상황들.length];
        const base = pick(상.기준후보, seed + 3);
        const edge: Edge = { value: base, included };
        const next = rand(seed + 5);
        const 사람 = [...사람이름].sort((a, b) => (a + seed).localeCompare(b + seed)).slice(0, 4);
        const 맞는쪽 = (v: number) => (상.방향 === 'above' ? inAbove(v, edge) : inBelow(v, edge));
        // 딱 한 사람만 조건에서 벗어나게 값을 짭니다.
        const 벗어난값 = 상.방향 === 'above' ? base - 1 - next(3) : base + 1 + next(3);
        const 드는값 = (offset: number) => (상.방향 === 'above' ? base + offset : base - offset);
        const 값 = [드는값(included ? 0 : 1), 드는값(included ? 2 : 3), 벗어난값, 드는값(included ? 4 : 5)];
        const 자리 = Math.abs(seed) % 4;
        const 짝 = 사람.map((이름, index) => ({ 이름, 값: 값[(index + 자리) % 4] }));
        const 벗어난사람 = 짝.filter((x) => !맞는쪽(x.값));
        if (벗어난사람.length !== 1) return null;
        return {
          prompt: `${상.intro(base)} ${목록글(짝.map((x) => `${x.이름} ${x.값} ${상.단위}`))}일 때, 조건에 맞지 않는 사람은 누구일까요?`,
          answer: 벗어난사람[0].이름,
          wrongs: 짝.filter((x) => 맞는쪽(x.값)).map((x) => x.이름),
          tag: 'range',
          strategy: '조건에서 벗어난 자료 찾기',
          hint: `한 사람씩 값을 ${gwa(String(base))} 견주어 보세요. ${eul(String(base))} 넣는지 아닌지를 먼저 정해 두면 헷갈리지 않습니다.`,
          steps: [
            `조건은 ${base} ${상.단위} ${상.방향 === 'above' ? aboveWord(included) : belowWord(included)}입니다.`,
            `${목록글(짝.map((x) => `${x.이름}(${x.값} ${상.단위})`))}을 하나씩 살펴봅니다.`,
            `${벗어난사람[0].이름}의 값 ${벗어난사람[0].값} ${상.단위}만 조건에 맞지 않습니다.`,
          ],
        };
      },
    },
    {
      id: 'decimal-member',
      make: (seed) => {
        const next = rand(seed);
        const base = 10 + next(5);
        const edge: Edge = { value: base, included };
        // 지도서도 가방 무게를 8.8 kg, 10.0 kg처럼 소수로 줍니다.
        // 자연수만 내면 '경곗값과 같은 수'를 물을 자리가 없어집니다.
        const values = [base - 1.2, base - 0.3, base, base + 0.4].map((v) => Number(v.toFixed(1)));
        const 맞는것 = values.filter((v) => inBelow(v, edge));
        const 뒤집은것 = values.filter((v) => inBelow(v, { value: base, included: !included }));
        if (맞는것.length === 뒤집은것.length) return null;
        return {
          prompt: `무게가 ${base} kg ${belowWord(included)}인 가방만 비행기에 들고 탈 수 있습니다. 가방의 무게가 ${목록글(values.map((v) => `${v.toFixed(1)} kg`))}일 때 들고 탈 수 있는 가방은 모두 몇 개일까요?`,
          answer: `${맞는것.length}개`,
          wrongs: [
            `${뒤집은것.length}개`,
            `${values.length - 맞는것.length}개`,
            `${맞는것.length + 1}개`,
            `${Math.max(0, 맞는것.length - 1)}개`,
            `${values.length}개`,
            '1개',
          ],
          tag: 'range',
          strategy: '소수인 자료에 수의 범위 적용하기',
          hint: `${base}.0 kg처럼 딱 맞는 무게가 있는지 먼저 찾아보세요. 그 가방을 넣을지 말지가 답을 가릅니다.`,
          steps: [
            `조건은 ${base} kg ${belowWord(included)}, 곧 ${belowMeaning(base, included)}입니다.`,
            `${목록글(values.map((v) => `${v.toFixed(1)} kg`))} 중 조건에 맞는 것은 ${목록글(맞는것.map((v) => `${v.toFixed(1)} kg`))}입니다.`,
            `그러므로 ${맞는것.length}개입니다.`,
          ],
        };
      },
    },
  ];
};

// ── 상 ──────────────────────────────────────────────────────────────
export const lesson23Hard = (included: boolean, 이상이하도쓸수있음: boolean): G5Family[] => {
  const families: G5Family[] = [
    {
      id: 'smallest-natural',
      make: (seed) => {
        const next = rand(seed);
        const base = 40 + next(20) * 5;
        const answer = included ? base : base + 1;
        return {
          prompt: `어떤 자연수 ▢는 ${base} ${aboveWord(included)}입니다. ▢가 될 수 있는 수 중에서 가장 작은 수는 무엇일까요?`,
          answer: String(answer),
          wrongs: [String(included ? base + 1 : base), String(base - 1), String(base + 5), String(base - 5)],
          tag: 'range',
          strategy: '조건을 만족하는 가장 작은 수 구하기',
          hint: '▢에 기준이 되는 수를 그대로 넣어 보고 조건이 맞는지 따져 보세요. 맞으면 거기서 끝이고, 맞지 않으면 그다음 자연수를 봅니다.',
          steps: [
            `${base} ${aboveWord(included)}인 수는 ${aboveMeaning(base, included)}입니다.`,
            included
              ? `▢에 ${eul(String(base))} 넣으면 ${iJosa(String(base))} ${gwa(String(base))} 같으므로 조건에 맞습니다.`
              : `▢에 ${eul(String(base))} 넣으면 ${iJosa(String(base))} ${base}보다 크지 않으므로 조건에 맞지 않습니다.`,
            `그러므로 가장 작은 수는 ${answer}입니다.`,
          ],
        };
      },
    },
    {
      id: 'not-member',
      make: (seed) => {
        const next = rand(seed);
        const base = 50 + next(15) * 4;
        const upward = next(2) === 0;
        const edge: Edge = { value: base, included };
        const 든다 = (v: number) => (upward ? inAbove(v, edge) : inBelow(v, edge));
        // 경곗값은 늘 보기에 넣습니다. 이상·이하면 범위에 들어가므로
        // 답이 아니고, 초과·미만이면 들어가지 않으므로 답입니다 —
        // 이 차시가 가리려는 것이 바로 그것입니다.
        const 후보 = included
          ? (upward ? [base, base + 2, base + 6, base - 3] : [base, base - 2, base - 6, base + 3])
          : (upward ? [base, base + 1, base + 2, base + 6] : [base, base - 1, base - 2, base - 6]);
        const 밖 = 후보.filter((v) => !든다(v));
        if (밖.length !== 1) return null;
        return {
          prompt: `${base} ${upward ? aboveWord(included) : belowWord(included)}인 수에 포함되지 않는 수는 어느 것일까요?`,
          answer: String(밖[0]),
          wrongs: 후보.filter((v) => 든다(v)).map(String),
          tag: 'range',
          strategy: '범위 밖의 수 가려내기',
          hint: `보기 가운데 ${gwa(String(base))} 똑같은 수가 있는지 먼저 보세요. 그 수가 들어가는지 아닌지가 이 문제의 갈림길입니다.`,
          steps: [
            `${base} ${upward ? aboveWord(included) : belowWord(included)}인 수는 ${upward ? aboveMeaning(base, included) : belowMeaning(base, included)}입니다.`,
            `보기를 하나씩 살펴보면 ${eun(String(목록글(후보.filter((v) => 든다(v)))))} 범위에 들어갑니다.`,
            `${밖[0]}만 범위에 들어가지 않으므로 답은 ${밖[0]}입니다.`,
          ],
          visual: rangeLine('수의 범위', 2, upward ? edge : undefined, upward ? undefined : edge),
        };
      },
    },
    {
      id: 'largest-decimal',
      make: (seed) => {
        const next = rand(seed);
        const base = 20 + next(20);
        if (included) {
          // 이하이면 가장 큰 소수 한 자리 수는 경곗값 자신입니다.
          return {
            prompt: `${base} 이하인 수 중에서 가장 큰 소수 한 자리 수는 무엇일까요?`,
            answer: `${base}.0`,
            wrongs: [`${base - 1}.9`, `${base}.1`, `${base}.9`, `${base - 1}.0`],
            tag: 'range',
            strategy: '범위에 들어가는 가장 큰 소수 찾기',
            hint: '기준이 되는 수를 소수 한 자리 수로 고쳐 적어 보세요. 그다음 이하가 기준이 되는 수를 넣는 말인지 떠올리면 됩니다.',
            steps: [
              `${base} 이하인 수는 ${belowMeaning(base, true)}입니다.`,
              `${eun(`${base}.0`)} ${gwa(String(base))} 같은 수이므로 범위에 들어갑니다.`,
              `${eun(`${base}.1`)} ${base}보다 크므로 들어가지 않습니다. 그러므로 가장 큰 소수 한 자리 수는 ${base}.0입니다.`,
            ],
          };
        }
        // 미만이면 경곗값은 빠지고, 소수 한 자리에서 가장 가까운 수는 0.1 작은 수입니다.
        const answer = (base - 0.1).toFixed(1);
        return {
          prompt: `${base} 미만인 수 중에서 가장 큰 소수 한 자리 수는 무엇일까요?`,
          answer,
          wrongs: [`${base}.0`, `${base - 1}.0`, `${base}.1`, (base - 0.2).toFixed(1)],
          tag: 'range',
          strategy: '범위에 들어가는 가장 큰 소수 찾기',
          hint: '기준이 되는 수를 소수 한 자리 수로 고쳐 적고, 그 수를 넣을 수 있는지 따져 보세요. 넣을 수 없다면 0.1 작은 수를 봅니다.',
          steps: [
            `${base} 미만인 수는 ${belowMeaning(base, false)}입니다.`,
            `${eun(`${base}.0`)} ${gwa(String(base))} 같은 수이므로 범위에 들어가지 않습니다.`,
            `소수 한 자리 수 중 ${base}보다 작으면서 가장 큰 수는 ${answer}입니다.`,
          ],
        };
      },
    },
    {
      id: 'how-many-in-range',
      make: (seed) => {
        const next = rand(seed);
        const base = 30 + next(20);
        const 위 = base + 10 + next(10);
        // 이상~이하: 위-base+1개, 초과~이하: 위-base개 …
        const 개수 = included ? 위 - base + 1 : 위 - base;
        const 반대 = included ? 위 - base : 위 - base + 1;
        if (개수 === 반대) return null;
        return {
          prompt: `${base} ${aboveWord(included)}이면서 ${위} 이하인 자연수는 모두 몇 개일까요?`,
          answer: `${개수}개`,
          wrongs: [`${반대}개`, `${위 - base - 1}개`, `${위 - base + 2}개`, `${위}개`],
          tag: 'range',
          strategy: '범위 안의 자연수 개수 구하기',
          hint: `가장 작은 수와 가장 큰 수를 먼저 적어 보세요. ${iJosa(String(base))} 들어가는지가 개수를 하나 바꿉니다.`,
          steps: [
            `가장 큰 수는 ${위}입니다.`,
            included
              ? `${base} 이상이므로 가장 작은 수는 ${base}입니다. ${base}부터 ${위}까지의 자연수는 ${위} - ${base} + 1 = ${개수}(개)입니다.`
              : `${base} 초과이므로 가장 작은 수는 ${base + 1}입니다. ${base + 1}부터 ${위}까지의 자연수는 ${위} - ${base + 1} + 1 = ${개수}(개)입니다.`,
          ],
        };
      },
    },
    {
      id: 'judge-statements',
      make: (seed) => {
        const next = rand(seed);
        const base = 20 + next(15) * 2;
        const 옳은것 = [
          `${base} ${aboveWord(included)}인 수에 ${iJosa(String(base))} ${included ? '포함됩니다' : '포함되지 않습니다'}.`,
          `${base} ${belowWord(included)}인 수에 ${iJosa(String(base))} ${included ? '포함됩니다' : '포함되지 않습니다'}.`,
        ];
        const 틀린것 = [
          `${base} ${aboveWord(included)}인 수는 ${base}보다 작은 수입니다.`,
          `${base} ${belowWord(included)}인 수는 ${base}보다 큰 수입니다.`,
          `${base} ${aboveWord(included)}인 수에 ${iJosa(String(base))} ${included ? '포함되지 않습니다' : '포함됩니다'}.`,
        ];
        const answer = pick(옳은것, seed);
        return {
          prompt: `수의 범위에 대한 설명으로 옳은 것은 어느 것일까요?`,
          answer,
          wrongs: 틀린것,
          tag: 'range',
          strategy: '수의 범위에 대한 설명 판단하기',
          hint: `설명마다 기준이 되는 수 ${eul(String(base))} 직접 넣어 보세요. 말이 되면 옳은 설명입니다.`,
          steps: [
            `${eun(aboveWord(included))} ${aboveMeaning(base, included)}, ${eun(belowWord(included))} ${belowMeaning(base, included)}입니다.`,
            included
              ? `이상과 이하는 기준이 되는 수 자신을 포함합니다.`
              : `초과와 미만은 기준이 되는 수 자신을 포함하지 않습니다.`,
            `그러므로 옳은 설명은 "${answer}"입니다.`,
          ],
        };
      },
    },
    {
      id: 'count-unbounded',
      make: (seed) => {
        const next = rand(seed);
        const base = 100 + next(20) * 10;
        return {
          prompt: `${base} ${aboveWord(included)}인 수는 모두 몇 개일까요?`,
          answer: '셀 수 없이 많습니다.',
          wrongs: [`${base}개`, '1개', '10개', `${base - 1}개`],
          tag: 'range',
          strategy: '범위에 들어가는 수가 얼마나 많은지 알기',
          hint: `${base}보다 큰 수를 하나 찾았다면, 거기에 1을 더한 수도 범위에 들어가는지 생각해 보세요.`,
          steps: [
            `${base} ${aboveWord(included)}인 수는 ${aboveMeaning(base, included)}입니다.`,
            '조건에 맞는 수를 하나 찾아도 거기에 1을 더한 수, 또 1을 더한 수가 끝없이 이어집니다. 자연수뿐 아니라 소수도 들어갑니다.',
            '그러므로 범위에 들어가는 수는 셀 수 없이 많습니다.',
          ],
          misconceptionTip: '수의 범위는 몇 개인지 세는 것이 아니라 어디부터 어디까지인지를 나타내는 것입니다.',
        };
      },
    },
  ];

  if (이상이하도쓸수있음) {
    families.push({
      id: 'boundary-difference',
      make: (seed) => {
        const next = rand(seed);
        const base = 25 + next(20);
        return {
          prompt: `${base} 이상인 수에는 포함되지만 ${base} 초과인 수에는 포함되지 않는 수는 무엇일까요?`,
          answer: String(base),
          wrongs: [String(base + 1), String(base - 1), `${base}.5`, '없습니다.'],
          tag: 'range',
          strategy: '이상과 초과의 차이 설명하기',
          hint: '두 범위가 어디서부터 달라지는지 그림으로 나란히 그려 보세요. 달라지는 자리는 한 곳뿐입니다.',
          steps: [
            `${base} 이상인 수는 ${aboveMeaning(base, true)}입니다.`,
            `${base} 초과인 수는 ${aboveMeaning(base, false)}입니다.`,
            `두 범위가 다른 곳은 기준이 되는 수 ${base} 하나뿐입니다. 그러므로 답은 ${base}입니다.`,
          ],
          // 여기서도 답이 되는 수에는 점을 찍지 않습니다.
          visual: rangeLine('두 범위의 차이', 2, { value: base, included: true }),
        };
      },
    });
  }

  return families;
};
