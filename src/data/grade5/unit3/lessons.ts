import type { FigureShapeName } from '../../../types';
import type { G5Family } from '../build';
import { eul, eun, gwa, i as iJosa, particleOf, pick, rand } from '../util';
import type { AxisKind } from './figures';
import {
  FIGURE_FACTS,
  factFor,
  figureChoices,
  oneFigure,
  대응이름,
  자음이름,
  선대칭도형들,
  선대칭아닌것들,
  점대칭도형들,
  점대칭아닌것들,
} from './figures';

// ════════════════════════════════════════════════════════════════════
// 3단원 합동과 대칭 (2~7차시)
// ────────────────────────────────────────────────────────────────────
// 지도서가 적어 둔 오류 유형을 그대로 오답으로 씁니다.
//   ① 모양만 같고 크기가 다른 두 도형을 합동이라고 생각
//   ② 합동인 도형에서 대응변·대응각을 바르게 찾지 못함
//      (두 도형이 뒤집혀 있거나 돌려져 있을 때 잘 일어납니다)
//   ③ 직사각형이나 평행사변형의 대각선을 대칭축이라고 생각
//   ④ 점대칭도형을 그려야 하는데 선대칭도형을 그림
//
// 도형 문항은 글만으로 물으면 낱말을 아는지 묻게 됩니다. 그래서 거의
// 모든 문항에 그림을 답니다. 다만 그림이 답을 짚어 주지 않도록,
// 대칭축을 묻는 문항에는 대칭축을 그리지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 각도합 = (vertexCount: number) => (vertexCount - 2) * 180;

// ── 2차시 합동은 무엇일까요 ─────────────────────────────────────────
// 두 도형을 나란히 두고 합동인지 묻습니다. 도형 열둘과 옮기는 방법
// 넷을 엮으므로 서로 다른 문항이 넉넉히 나옵니다.
const 합동짝판단 = (which: number): G5Family => ({
  id: `is-congruent-pair-${which}`,
  make: (seed) => {
    const next = rand(seed + which * 29);
    const 도형 = FIGURE_FACTS[next(FIGURE_FACTS.length)].shape;
    const 방법 = next(4);
    // 0 돌리기, 1 뒤집기, 2 크기 바꾸기, 3 다른 도형
    const 합동인가 = 방법 === 0 || 방법 === 1;
    const 다른도형 = FIGURE_FACTS.filter((one) => one.shape !== 도형)[next(FIGURE_FACTS.length - 1)].shape;
    const 둘째 =
      방법 === 0
        ? { shape: 도형, rotate: 40 + next(100) }
        : 방법 === 1
          ? { shape: 도형, flip: true }
          : 방법 === 2
            ? { shape: 도형, scale: 0.5 + next(3) / 10 }
            : { shape: 다른도형 };
    const 까닭 =
      방법 === 0
        ? '돌려 놓았을 뿐 모양과 크기가 같으므로 포개면 완전히 겹칩니다.'
        : 방법 === 1
          ? '뒤집어 놓았을 뿐 모양과 크기가 같으므로 포개면 완전히 겹칩니다.'
          : 방법 === 2
            ? '모양은 같지만 크기가 다르므로 포개어도 겹치지 않습니다.'
            : '모양 자체가 다르므로 포개어도 겹치지 않습니다.';
    return {
      prompt: '그림의 두 도형은 서로 합동일까요?',
      answer: 합동인가 ? '서로 합동입니다.' : '서로 합동이 아닙니다.',
      wrongs: [
        합동인가 ? '서로 합동이 아닙니다.' : '서로 합동입니다.',
        '넓이가 같을 때만 합동입니다.',
        '방향이 같아야 합동입니다.',
      ],
      tag: 'congruence',
      strategy: '두 도형이 합동인지 판단하기',
      hint: '하나를 오려서 다른 하나 위에 올려놓는다고 생각해 보세요. 돌리거나 뒤집어도 괜찮습니다.',
      steps: ['합동은 포개었을 때 완전히 겹치는 것입니다.', 까닭, `그러므로 ${합동인가 ? '서로 합동입니다' : '서로 합동이 아닙니다'}.`],
      visual: { kind: 'figure-set', label: '두 도형', items: [{ shape: 도형 }, 둘째] },
      misconceptionTip: '돌리거나 뒤집은 것은 합동입니다. 크기를 바꾼 것은 합동이 아닙니다.',
    };
  },
});

const 합동개수세기: G5Family = {
  id: 'count-congruent',
  make: (seed) => {
    const next = rand(seed);
    const 도형 = FIGURE_FACTS[next(FIGURE_FACTS.length)].shape;
    const 다른것 = FIGURE_FACTS.filter((one) => one.shape !== 도형)[next(FIGURE_FACTS.length - 1)].shape;
    const 몇개 = 1 + next(2); // 1개 또는 2개
    const 이름표 = ['나', '다', '라'];
    const items: Array<{ shape: FigureShapeName; name?: string; rotate?: number; flip?: boolean; scale?: number }> = [
      { shape: 도형, name: '가' },
    ];
    for (let index = 0; index < 3; index += 1) {
      if (index < 몇개) items.push({ shape: 도형, name: 이름표[index], rotate: 30 + index * 50 });
      else if (index === 몇개) items.push({ shape: 도형, name: 이름표[index], scale: 0.55 });
      else items.push({ shape: 다른것, name: 이름표[index] });
    }
    return {
      prompt: '그림에서 가와 서로 합동인 도형은 모두 몇 개일까요?',
      answer: `${몇개}개`,
      wrongs: ['0개', '1개', '2개', '3개'].filter((one) => one !== `${몇개}개`),
      tag: 'congruence',
      strategy: '합동인 도형의 개수 세기',
      hint: '가를 오려 하나씩 올려 본다고 생각하세요. 크기가 다른 것은 겹치지 않습니다.',
      steps: [
        '돌려 놓았거나 뒤집어 놓았어도 모양과 크기가 같으면 합동입니다.',
        '크기가 다르거나 모양이 다른 것은 합동이 아닙니다.',
        `가와 합동인 도형은 ${몇개}개입니다.`,
      ],
      visual: { kind: 'figure-set', label: '여러 도형', items },
    };
  },
};

export const 합동Easy: G5Family[] = [
  합동짝판단(2),
  합동짝판단(3),
  합동개수세기,
  {
    id: 'meaning',
    make: () => ({
      prompt: '서로 합동인 두 도형은 어떤 도형일까요?',
      answer: '포개었을 때 완전히 겹치는 두 도형',
      wrongs: [
        '모양이 같고 크기는 달라도 되는 두 도형',
        '넓이가 같은 두 도형',
        '변의 수가 같은 두 도형',
      ],
      tag: 'congruence',
      strategy: '합동의 뜻 알기',
      hint: '두 도형을 오려서 하나를 다른 하나 위에 올려놓는다고 생각해 보세요. 무엇이 같아야 딱 맞을까요?',
      steps: [
        '합동은 모양과 크기가 모두 같아서, 옮겨 포개면 완전히 겹치는 것을 말합니다.',
        '모양만 같고 크기가 다르면 포개어도 겹치지 않으므로 합동이 아닙니다.',
        '그러므로 서로 합동인 두 도형은 포개었을 때 완전히 겹치는 두 도형입니다.',
      ],
      misconceptionTip: '모양이 같다고 합동이 아닙니다. 크기까지 같아야 합니다.',
    }),
  },
  {
    id: 'same-shape-different-size',
    make: (seed) => {
      const 도형 = pick(['정사각형', '정삼각형', '직사각형', '마름모'] as FigureShapeName[], seed);
      return {
        prompt: '그림에서 가와 서로 합동인 도형은 어느 것일까요?',
        answer: '다',
        wrongs: ['나', '라', '없습니다.'],
        tag: 'congruence',
        strategy: '합동인 도형 찾기',
        hint: '모양이 같은 것을 먼저 고르고, 그중에서 크기까지 같은 것을 찾으세요.',
        steps: [
          '나는 모양은 같지만 크기가 더 작으므로 포개어도 겹치지 않습니다.',
          '라는 도형의 모양 자체가 다릅니다.',
          '다는 돌려 놓았을 뿐 모양과 크기가 가와 같으므로 포개면 완전히 겹칩니다. 그러므로 답은 다입니다.',
        ],
        visual: {
          kind: 'figure-set',
          label: '여러 도형',
          items: [
            { shape: 도형, name: '가' },
            { shape: 도형, name: '나', scale: 0.55 },
            { shape: 도형, name: '다', rotate: 35 },
            { shape: 도형 === '정삼각형' ? '정사각형' : '정삼각형', name: '라' },
          ],
        },
        misconceptionTip: '돌려 놓았거나 뒤집어 놓았어도 모양과 크기가 같으면 합동입니다. 크기가 다르면 합동이 아닙니다.',
      };
    },
  },
  {
    id: 'always-congruent',
    make: (seed) => {
      const 참 = pick(
        [
          '한 변의 길이가 같은 두 정사각형',
          '반지름의 길이가 같은 두 원',
          '한 변의 길이가 같은 두 정삼각형',
        ],
        seed,
      );
      return {
        prompt: '다음 중 두 도형이 반드시 서로 합동인 것은 어느 것일까요?',
        answer: 참,
        wrongs: ['두 직사각형', '두 평행사변형', '넓이가 같은 두 삼각형'],
        tag: 'congruence',
        strategy: '언제나 합동이 되는 경우 판단하기',
        hint: '크기를 정하는 값이 하나로 정해지는지 보세요. 그 값 하나로 도형이 딱 정해지면 언제나 합동입니다.',
        steps: [
          '합동이 되려면 모양과 크기가 모두 같아야 합니다.',
          '직사각형은 가로와 세로가 다를 수 있고, 평행사변형은 각의 크기가 다를 수 있습니다. 넓이가 같아도 모양이 다를 수 있습니다.',
          `${eun(참)} 크기를 정하는 값이 하나로 정해지므로 언제나 합동입니다.`,
        ],
      };
    },
  },
  {
    id: 'moves-keep-congruence',
    make: (seed) => {
      const 움직임 = pick(['밀기', '뒤집기', '돌리기'], seed);
      return {
        prompt: `어떤 도형을 ${euroOf(움직임)} 옮겼습니다. 옮긴 도형과 처음 도형은 어떤 관계일까요?`,
        answer: '서로 합동입니다.',
        wrongs: ['모양은 같지만 크기가 달라집니다.', '크기는 같지만 모양이 달라집니다.', '아무 관계가 없습니다.'],
        tag: 'congruence',
        strategy: '도형을 옮겨도 합동임을 알기',
        hint: `${eul(움직임)} 했을 때 변의 길이나 각의 크기가 달라지는지 생각해 보세요.`,
        steps: [
          '밀기, 뒤집기, 돌리기는 도형의 자리와 방향만 바꿉니다.',
          '변의 길이와 각의 크기는 그대로이므로 모양과 크기가 변하지 않습니다.',
          '그러므로 옮긴 도형과 처음 도형은 서로 합동입니다.',
        ],
      };
    },
  },
];

// 조사 '으로/로'만 따로 씁니다.
function euroOf(word: string) {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);
  const final = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 : 0;
  return `${word}${final === 0 || final === 8 ? '로' : '으로'}`;
}

export const 합동Middle: G5Family[] = [
  합동짝판단(0),
  합동짝판단(1),
  합동개수세기,
  {
    id: 'find-congruent-pair',
    make: (seed) => {
      const next = rand(seed);
      const 도형 = pick(['직사각형', '평행사변형', '사다리꼴', '이등변삼각형'] as FigureShapeName[], seed);
      const 다른것 = 도형 === '직사각형' ? '정사각형' : '직사각형';
      const 자리 = next(3);
      const 이름 = ['가', '나', '다', '라'];
      // 합동인 짝은 첫째와 (자리+1)째입니다.
      const items = [
        { shape: 도형, name: 이름[0] },
        ...[0, 1, 2].map((index) =>
          index === 자리
            ? { shape: 도형, name: 이름[index + 1], rotate: 180, flip: true }
            : index === (자리 + 1) % 3
              ? { shape: 도형, name: 이름[index + 1], scale: 0.6 }
              : { shape: 다른것 as FigureShapeName, name: 이름[index + 1] },
        ),
      ];
      return {
        prompt: '그림에서 가와 서로 합동인 도형은 어느 것일까요?',
        answer: 이름[자리 + 1],
        wrongs: 이름.filter((one) => one !== 이름[자리 + 1] && one !== '가').concat('없습니다.'),
        tag: 'congruence',
        strategy: '여러 도형 중 합동인 것 찾기',
        hint: '가를 오려서 하나씩 올려놓는다고 생각해 보세요. 돌리거나 뒤집어도 괜찮지만 크기는 그대로여야 합니다.',
        steps: [
          '합동은 포개었을 때 완전히 겹치는 것입니다. 돌리거나 뒤집어 놓은 것도 합동입니다.',
          '크기가 다른 것과 모양이 다른 것은 포개어도 겹치지 않습니다.',
          `그러므로 가와 합동인 도형은 ${이름[자리 + 1]}입니다.`,
        ],
        visual: { kind: 'figure-set', label: '여러 도형', items },
      };
    },
  },
  {
    id: 'cut-into-congruent',
    make: (seed) => {
      const 상황 = pick(
        [
          { 글: '직사각형 모양의 종이를 대각선을 따라 한 번 잘랐습니다.', 답: '2개', 까닭: '대각선으로 자르면 서로 합동인 삼각형 2개가 생깁니다.' },
          { 글: '정사각형 모양의 종이를 두 대각선을 따라 모두 잘랐습니다.', 답: '4개', 까닭: '두 대각선으로 자르면 서로 합동인 삼각형 4개가 생깁니다.' },
          { 글: '평행사변형 모양의 종이를 대각선을 따라 한 번 잘랐습니다.', 답: '2개', 까닭: '대각선으로 자르면 서로 합동인 삼각형 2개가 생깁니다.' },
        ],
        seed,
      );
      return {
        prompt: `${상황.글} 생긴 조각은 서로 합동인 도형 몇 개일까요?`,
        answer: 상황.답,
        wrongs: ['1개', '3개', '6개', '8개'].filter((one) => one !== 상황.답),
        tag: 'congruence',
        strategy: '잘라서 생기는 합동인 도형 세기',
        hint: '자른 두 조각을 겹쳐 보면 어떻게 될지 머릿속으로 그려 보세요.',
        steps: [상황.글, 상황.까닭, `그러므로 ${상황.답}입니다.`],
      };
    },
  },
  {
    id: 'judge-statements',
    make: (seed) => {
      const 옳은것 = [
        '돌려 놓은 두 도형도 포개면 완전히 겹치면 서로 합동입니다.',
        '뒤집어 놓은 두 도형도 포개면 완전히 겹치면 서로 합동입니다.',
        '서로 합동인 두 도형의 넓이는 같습니다.',
      ];
      const 틀린것 = [
        '넓이가 같으면 언제나 서로 합동입니다.',
        '모양이 같으면 크기가 달라도 서로 합동입니다.',
        '두 직사각형은 언제나 서로 합동입니다.',
      ];
      const answer = pick(옳은것, seed);
      return {
        prompt: '합동에 대한 설명으로 옳은 것은 어느 것일까요?',
        answer,
        wrongs: 틀린것,
        tag: 'congruence',
        strategy: '합동에 대한 설명 판단하기',
        hint: '설명마다 반대되는 예를 하나 찾아보세요. 하나라도 있으면 그 설명은 옳지 않습니다.',
        steps: [
          '합동은 모양과 크기가 모두 같은 것입니다.',
          '넓이가 같아도 모양이 다를 수 있고, 모양이 같아도 크기가 다를 수 있습니다.',
          `그러므로 옳은 설명은 "${answer}"입니다.`,
        ],
      };
    },
  },
];

// ── 3차시 합동인 도형의 성질 ────────────────────────────────────────
// 합동 성질 차시에서 쓰는 수 문항입니다.
const 삼각형대응각 = (which: number): G5Family => ({
  id: `triangle-angle-${which}`,
  make: (seed) => {
    const next = rand(seed + which * 31);
    const { first, second } = 대응이름(3);
    const 각1 = 40 + next(50);
    const 각2 = 40 + next(50);
    const 각3 = 180 - 각1 - 각2;
    if (각3 <= 15 || 각3 >= 140) return null;
    const 자리 = next(3);
    const 각 = [각1, 각2, 각3];
    return {
      prompt: `두 삼각형은 서로 합동입니다. 삼각형 ${first.join('')}의 두 각의 크기가 ${각.filter((_, index) => index !== 자리).map((one) => `${one}°`).join(', ')}일 때, 삼각형 ${second.join('')}에서 그 나머지 한 각의 대응각의 크기는 몇 도일까요?`,
      answer: `${각[자리]}°`,
      wrongs: [`${180 - 각[자리]}°`, `${각[자리] + 15}°`, `${각.filter((_, index) => index !== 자리)[0]}°`, `${각.filter((_, index) => index !== 자리)[1]}°`],
      tag: 'congruence',
      strategy: '삼각형의 세 각의 합과 합동을 함께 쓰기',
      hint: '삼각형의 세 각의 크기의 합은 180°입니다. 먼저 빠진 각을 구하고, 대응각을 찾으세요.',
      steps: [
        '삼각형의 세 각의 크기의 합은 180°입니다.',
        `180° - ${각.filter((_, index) => index !== 자리).join('° - ')}° = ${각[자리]}°입니다.`,
        `합동인 두 도형에서 대응각의 크기는 같으므로 답은 ${각[자리]}°입니다.`,
      ],
    };
  },
});

// 대응변·대응각을 묻는 문항이 쓰는 두 도형입니다.
//
// 직사각형이나 평행사변형을 그려 놓고 변의 길이와 각의 크기를 마음대로
// 적으면 그림과 어긋납니다 — 직사각형의 네 각은 모두 90°인데 107°라고
// 적어 두는 일이 생깁니다. 그래서 아무 조건도 없는 사각형을 씁니다.
const 합동짝 = (seed: number) => {
  const next = rand(seed);
  const 도형: FigureShapeName = '사각형';
  const { first, second } = 대응이름(4);
  const 변길이 = [4 + next(6), 3 + next(5), 4 + next(6), 3 + next(5)];
  // 사각형의 네 각의 합은 360°입니다. 셋을 고르고 나머지를 맞춥니다.
  const 각 = [60 + next(50), 60 + next(50), 60 + next(50), 0];
  각[3] = 360 - 각[0] - 각[1] - 각[2];
  return { 도형, first, second, 변길이, 각, next };
};

export const 합동성질Easy: G5Family[] = [
  삼각형대응각(2),
  {
    id: 'which-corresponds',
    make: (seed) => {
      const { 도형, first, second, next } = 합동짝(seed);
      const 자리 = next(4);
      const 묻는것 = pick(['점', '변', '각'], seed);
      const 물음 =
        묻는것 === '점'
          ? `점 ${first[자리]}`
          : 묻는것 === '변'
            ? `변 ${first[자리]}${first[(자리 + 1) % 4]}`
            : `각 ${first[(자리 + 3) % 4]}${first[자리]}${first[(자리 + 1) % 4]}`;
      const answer =
        묻는것 === '점'
          ? `점 ${second[자리]}`
          : 묻는것 === '변'
            ? `변 ${second[자리]}${second[(자리 + 1) % 4]}`
            : `각 ${second[(자리 + 3) % 4]}${second[자리]}${second[(자리 + 1) % 4]}`;
      const 다른자리 = [0, 1, 2, 3].filter((one) => one !== 자리);
      const wrongs = 다른자리.map((one) =>
        묻는것 === '점'
          ? `점 ${second[one]}`
          : 묻는것 === '변'
            ? `변 ${second[one]}${second[(one + 1) % 4]}`
            : `각 ${second[(one + 3) % 4]}${second[one]}${second[(one + 1) % 4]}`,
      );
      return {
        prompt: `두 사각형은 서로 합동입니다. ${물음}의 대응${묻는것}은 무엇일까요?`,
        answer,
        wrongs,
        tag: 'congruence',
        strategy: `합동인 도형에서 대응${묻는것} 찾기`,
        hint: '두 도형을 포개었다고 생각하고, 꼭짓점 이름을 차례대로 짝지어 보세요. 첫째는 첫째끼리, 둘째는 둘째끼리 만납니다.',
        steps: [
          `두 도형을 포개면 점 ${gwa(first[0])} 점 ${second[0]}, 점 ${gwa(first[1])} 점 ${second[1]}처럼 차례로 만납니다.`,
          `그러므로 ${물음}의 대응${묻는것}은 ${answer}입니다.`,
        ],
        visual: {
          kind: 'figure-set',
          label: '서로 합동인 두 도형',
          items: [
            { shape: 도형, vertexLabels: first },
            { shape: 도형, vertexLabels: second, rotate: 180 },
          ],
        },
        misconceptionTip: '두 도형이 돌려져 있거나 뒤집혀 있으면 눈으로 보이는 자리가 아니라 이름의 차례로 짝지어야 합니다.',
      };
    },
  },
  {
    id: 'corresponding-length',
    make: (seed) => {
      const { 도형, first, second, 변길이, next } = 합동짝(seed);
      const 자리 = next(4);
      const answer = `${변길이[자리]} cm`;
      return {
        prompt: `두 사각형은 서로 합동입니다. 변 ${second[자리]}${second[(자리 + 1) % 4]}의 길이는 몇 cm일까요?`,
        answer,
        wrongs: [0, 1, 2, 3]
          .filter((one) => one !== 자리)
          .map((one) => `${변길이[one]} cm`)
          .concat(`${변길이[자리] + 2} cm`),
        tag: 'congruence',
        strategy: '대응변의 길이 구하기',
        hint: '합동인 두 도형에서 대응변의 길이는 서로 같습니다. 묻는 변의 대응변을 첫째 도형에서 찾으세요.',
        steps: [
          `변 ${second[자리]}${second[(자리 + 1) % 4]}의 대응변은 변 ${first[자리]}${first[(자리 + 1) % 4]}입니다.`,
          '합동인 두 도형에서 대응변의 길이는 서로 같습니다.',
          `변 ${first[자리]}${first[(자리 + 1) % 4]}의 길이가 ${변길이[자리]} cm이므로 답은 ${answer}입니다.`,
        ],
        visual: {
          kind: 'figure-set',
          label: '서로 합동인 두 도형',
          items: [
            {
              shape: 도형,
              vertexLabels: first,
              edgeLabels: [0, 1, 2, 3].map((one) => ({ from: one, to: (one + 1) % 4, text: `${변길이[one]} cm` })),
            },
            { shape: 도형, vertexLabels: second, rotate: 180 },
          ],
        },
      };
    },
  },
  {
    id: 'corresponding-angle',
    make: (seed) => {
      const { 도형, first, second, 각, next } = 합동짝(seed);
      const 자리 = next(4);
      const answer = `${각[자리]}°`;
      if (각.some((one) => one <= 0 || one >= 180)) return null;
      return {
        prompt: `두 사각형은 서로 합동입니다. 각 ${second[(자리 + 3) % 4]}${second[자리]}${second[(자리 + 1) % 4]}의 크기는 몇 도일까요?`,
        answer,
        wrongs: [0, 1, 2, 3]
          .filter((one) => one !== 자리)
          .map((one) => `${각[one]}°`)
          .concat(`${180 - 각[자리]}°`),
        tag: 'congruence',
        strategy: '대응각의 크기 구하기',
        hint: '합동인 두 도형에서 대응각의 크기는 서로 같습니다. 묻는 각의 대응각을 첫째 도형에서 찾으세요.',
        steps: [
          `각 ${second[(자리 + 3) % 4]}${second[자리]}${second[(자리 + 1) % 4]}의 대응각은 각 ${first[(자리 + 3) % 4]}${first[자리]}${first[(자리 + 1) % 4]}입니다.`,
          '합동인 두 도형에서 대응각의 크기는 서로 같습니다.',
          `그 각이 ${각[자리]}°이므로 답은 ${answer}입니다.`,
        ],
        visual: {
          kind: 'figure-set',
          label: '서로 합동인 두 도형',
          items: [
            {
              shape: 도형,
              vertexLabels: first,
              angleLabels: [0, 1, 2, 3].map((one) => ({ at: one, text: `${각[one]}°` })),
            },
            { shape: 도형, vertexLabels: second, rotate: 180 },
          ],
        },
      };
    },
  },
  {
    id: 'property',
    make: (seed) => {
      const answer = pick(
        ['대응변의 길이가 서로 같습니다.', '대응각의 크기가 서로 같습니다.'],
        seed,
      );
      return {
        prompt: '서로 합동인 두 도형의 성질로 옳은 것은 어느 것일까요?',
        answer,
        wrongs: [
          '대응변의 길이는 서로 다릅니다.',
          '대응각의 크기는 서로 다릅니다.',
          '대응변의 길이는 같지만 대응각의 크기는 다릅니다.',
        ],
        tag: 'congruence',
        strategy: '합동인 도형의 성질 알기',
        hint: '두 도형을 포개면 변과 각이 하나씩 딱 맞게 겹칩니다. 겹친다는 것은 무엇이 같다는 뜻일까요?',
        steps: [
          '합동인 두 도형을 포개면 대응하는 변과 각이 완전히 겹칩니다.',
          '겹친다는 것은 길이와 크기가 같다는 뜻입니다.',
          `그러므로 ${answer}`,
        ],
      };
    },
  },
];

export const 합동성질Hard: G5Family[] = [
  삼각형대응각(0),
  삼각형대응각(1),
  {
    id: 'missing-angle',
    make: (seed) => {
      const { 도형, first, second, 각, next } = 합동짝(seed);
      if (각.some((one) => one <= 0 || one >= 180)) return null;
      const 감춘자리 = next(4);
      const 남은합 = 각.filter((_, index) => index !== 감춘자리).reduce((sum, one) => sum + one, 0);
      const answer = `${360 - 남은합}°`;
      if (360 - 남은합 !== 각[감춘자리]) return null;
      return {
        prompt: `두 사각형은 서로 합동입니다. 각 ${second[(감춘자리 + 3) % 4]}${second[감춘자리]}${second[(감춘자리 + 1) % 4]}의 크기는 몇 도일까요?`,
        answer,
        wrongs: [
          `${남은합}°`,
          `${180 - 각[감춘자리]}°`,
          `${각[감춘자리] + 10}°`,
          `${360 - 각[감춘자리]}°`,
        ],
        tag: 'congruence',
        strategy: '사각형의 네 각의 합을 이용해 대응각 구하기',
        hint: '사각형의 네 각의 크기의 합은 360°입니다. 첫째 도형에서 빠진 각을 먼저 구한 다음, 대응각을 찾으세요.',
        steps: [
          '사각형의 네 각의 크기의 합은 360°입니다.',
          `첫째 도형에서 나머지 세 각의 합이 ${남은합}°이므로 빠진 각은 360° - ${남은합}° = ${각[감춘자리]}°입니다.`,
          `합동인 두 도형에서 대응각의 크기는 같으므로 답은 ${answer}입니다.`,
        ],
        visual: {
          kind: 'figure-set',
          label: '서로 합동인 두 도형',
          items: [
            {
              shape: 도형,
              vertexLabels: first,
              angleLabels: [0, 1, 2, 3]
                .filter((one) => one !== 감춘자리)
                .map((one) => ({ at: one, text: `${각[one]}°` })),
            },
            { shape: 도형, vertexLabels: second, rotate: 180 },
          ],
        },
      };
    },
  },
  {
    id: 'perimeter',
    make: (seed) => {
      const { 도형, first, second, 변길이 } = 합동짝(seed);
      const 둘레 = 변길이.reduce((sum, one) => sum + one, 0);
      return {
        prompt: '두 사각형은 서로 합동입니다. 둘째 사각형의 둘레는 몇 cm일까요?',
        answer: `${둘레} cm`,
        wrongs: [`${둘레 * 2} cm`, `${둘레 - 변길이[0]} cm`, `${Math.round(둘레 / 2)} cm`, `${둘레 + 변길이[0]} cm`],
        tag: 'congruence',
        strategy: '합동을 이용해 둘레 구하기',
        hint: '대응변의 길이가 서로 같으므로 둘째 도형의 변의 길이도 첫째 도형과 같습니다. 네 변을 모두 더하세요.',
        steps: [
          '합동인 두 도형에서 대응변의 길이는 서로 같습니다.',
          `그러므로 둘째 사각형의 네 변도 ${변길이.join(' cm, ')} cm입니다.`,
          `${변길이.join(' + ')} = ${둘레}이므로 둘레는 ${둘레} cm입니다.`,
        ],
        visual: {
          kind: 'figure-set',
          label: '서로 합동인 두 도형',
          items: [
            {
              shape: 도형,
              vertexLabels: first,
              edgeLabels: [0, 1, 2, 3].map((one) => ({ from: one, to: (one + 1) % 4, text: `${변길이[one]} cm` })),
            },
            { shape: 도형, vertexLabels: second, rotate: 180 },
          ],
        },
      };
    },
  },
  {
    id: 'why-not-congruent',
    make: (seed) => {
      const 상황 = pick(
        [
          { 글: '두 직사각형의 넓이가 같습니다.', 답: '넓이가 같아도 가로와 세로의 길이가 다를 수 있습니다.' },
          { 글: '두 삼각형의 세 각의 크기가 각각 같습니다.', 답: '각의 크기가 같아도 변의 길이가 다를 수 있습니다.' },
          { 글: '두 사각형의 둘레가 같습니다.', 답: '둘레가 같아도 변의 길이가 저마다 다를 수 있습니다.' },
        ],
        seed,
      );
      return {
        prompt: `${상황.글} 이때 두 도형이 반드시 합동이라고 할 수 없는 까닭은 무엇일까요?`,
        answer: 상황.답,
        wrongs: [
          '합동은 넓이가 다를 때만 쓰는 말이기 때문입니다.',
          '도형을 돌리면 합동이 아니게 되기 때문입니다.',
          '변의 수가 다르기 때문입니다.',
        ],
        tag: 'congruence',
        strategy: '합동이 되는 조건을 따져 보기',
        hint: '주어진 조건은 같지만 서로 합동이 아닌 예를 하나 떠올려 보세요. 하나만 있으면 됩니다.',
        steps: [
          '합동이 되려면 대응변의 길이와 대응각의 크기가 모두 같아야 합니다.',
          '주어진 조건만으로는 그 두 가지가 모두 같다고 할 수 없습니다.',
          `그 까닭은 ${상황.답}`,
        ],
      };
    },
  },
];


// ── 대칭 차시에 더 쓰는 뭉치 ───────────────────────────────────────
// 도형 열둘과 그을 수 있는 축 넷을 엮어, 지도서가 적어 둔 오류 유형
// "직사각형이나 평행사변형의 대각선을 대칭축이라고 생각하는 오류"를
// 정면으로 묻습니다.
const 축인지판단 = (which: number): G5Family => ({
  id: `is-this-an-axis-${which}`,
  make: (seed) => {
    const next = rand(seed + which * 41);
    const 후보 = FIGURE_FACTS.filter((one) => one.shape !== '원' && one.vertexCount > 0);
    const 도형 = 후보[next(후보.length)];
    const 방향: AxisKind[] = ['vertical', 'horizontal', 'diagonal', 'anti-diagonal'];
    const 고른축 = 방향[next(4)];
    const 맞나 = 도형.drawableAxes.includes(고른축);
    const 방향이름: Record<AxisKind, string> = {
      vertical: '세로로 그은 선',
      horizontal: '가로로 그은 선',
      diagonal: '왼쪽 위에서 오른쪽 아래로 그은 선',
      'anti-diagonal': '왼쪽 아래에서 오른쪽 위로 그은 선',
    };
    // 정오각형·정육각형은 45° 격자에 축이 놓이지 않아 그림이 어긋납니다.
    if (도형.drawableAxes.length === 0 && 도형.axisCount !== 0) return null;
    return {
      prompt: `${도형.shape}에 ${방향이름[고른축]}을 따라 접으면 두 쪽이 완전히 겹칠까요?`,
      answer: 맞나 ? '겹치므로 대칭축입니다.' : '겹치지 않으므로 대칭축이 아닙니다.',
      wrongs: [
        맞나 ? '겹치지 않으므로 대칭축이 아닙니다.' : '겹치므로 대칭축입니다.',
        '겹치지만 대칭축이라고 하지는 않습니다.',
        '도형을 돌려 놓으면 달라집니다.',
      ],
      tag: 'congruence',
      strategy: '그은 선이 대칭축인지 판단하기',
      hint: '그 선을 접는 자리라고 생각하고, 접힌 두 쪽의 꼭짓점이 서로 만나는지 살펴보세요.',
      steps: [
        '대칭축은 접었을 때 두 쪽이 완전히 겹치는 직선입니다.',
        맞나
          ? `${eun(도형.shape)} 이 선을 따라 접으면 두 쪽의 꼭짓점이 서로 만납니다.`
          : `${eun(도형.shape)} 이 선을 따라 접으면 두 쪽의 꼭짓점이 어긋나 만나지 않습니다.`,
        `접어 보면 두 쪽이 ${맞나 ? '겹치므로 대칭축입니다' : '겹치지 않으므로 대칭축이 아닙니다'}.`,
      ],
      visual: oneFigure('도형과 그은 선', 도형.shape, { axes: [고른축] }),
      misconceptionTip: '합동인 두 조각으로 나누어진다고 대칭축이 되는 것은 아닙니다. 접어서 겹쳐야 대칭축입니다.',
    };
  },
});

const 글자대칭 = (선대칭인가: boolean): G5Family => ({
  id: 'letter-symmetry',
  make: (seed) => {
    const next = rand(seed);
    // 한글 자음과 숫자의 대칭입니다. 지도서 9차시 '픽토그램 만들기'와
    // 이어지는 생활 소재입니다.
    const 글자들 = [
      { 글: 'ㅁ', 선: true, 점: true },
      { 글: 'ㅇ', 선: true, 점: true },
      { 글: 'ㅗ', 선: true, 점: false },
      { 글: 'ㅜ', 선: true, 점: false },
      { 글: 'ㄱ', 선: false, 점: false },
      { 글: 'ㄴ', 선: false, 점: false },
      { 글: 'ㅅ', 선: true, 점: false },
      { 글: 'ㅂ', 선: true, 점: false },
      { 글: 'ㅍ', 선: true, 점: true },
      { 글: 'ㄹ', 선: false, 점: true },
      { 글: 'ㅎ', 선: true, 점: false },
      { 글: 'ㅋ', 선: false, 점: false },
    ];
    const 맞는것 = 글자들.filter((one) => (선대칭인가 ? one.선 : one.점));
    const 아닌것 = 글자들.filter((one) => !(선대칭인가 ? one.선 : one.점));
    if (맞는것.length < 1 || 아닌것.length < 3) return null;
    const 정답 = 맞는것[next(맞는것.length)];
    const 셋 = [...아닌것].sort((a, b) => (a.글 + seed).localeCompare(b.글 + seed)).slice(0, 3);
    const 이름 = 선대칭인가 ? '선대칭' : '점대칭';
    return {
      prompt: `다음 한글 자음 중 ${이름}인 글자는 어느 것일까요?`,
      answer: 정답.글,
      wrongs: 셋.map((one) => one.글),
      tag: 'congruence',
      strategy: `생활 속에서 ${이름}인 모양 찾기`,
      hint: 선대칭인가
        ? '글자를 세로나 가로로 접었다고 생각하고, 두 쪽이 딱 맞는지 살펴보세요.'
        : '글자를 가운데 점을 중심으로 반 바퀴 돌렸다고 생각해 보세요.',
      steps: [
        선대칭인가
          ? '선대칭인 글자는 어떤 직선을 따라 접었을 때 두 쪽이 완전히 겹칩니다.'
          : '점대칭인 글자는 180° 돌렸을 때 처음과 완전히 겹칩니다.',
        `${셋.map((one) => one.글).join(', ')}${particleOf(셋[셋.length - 1].글, '은')} 그렇지 않습니다.`,
        `${eun(정답.글)} ${이름}이므로 답은 ${정답.글}입니다.`,
      ],
    };
  },
});

const 대칭개수세기 = (선대칭인가: boolean): G5Family => ({
  id: 'count-symmetric',
  make: (seed) => {
    const next = rand(seed);
    const 이름 = 선대칭인가 ? '선대칭도형' : '점대칭도형';
    const 넷 = [...FIGURE_FACTS].sort((a, b) => (a.shape + seed).localeCompare(b.shape + seed)).slice(0, 4);
    const 개수 = 넷.filter((one) => (선대칭인가 ? one.axisCount !== 0 : one.pointSymmetric)).length;
    if (개수 === 0 || 개수 === 4) return null;
    return {
      prompt: `${넷.map((one) => one.shape).join(', ')} 중에서 ${eun(이름)} 모두 몇 개일까요?`,
      answer: `${개수}개`,
      wrongs: ['0개', '1개', '2개', '3개', '4개'].filter((one) => one !== `${개수}개`),
      tag: 'congruence',
      strategy: `${이름}의 개수 세기`,
      hint: 선대칭인가
        ? '도형마다 접을 수 있는 직선이 하나라도 있는지 차례로 살펴보세요.'
        : '도형마다 반 바퀴 돌렸을 때 처음과 겹치는지 차례로 살펴보세요.',
      steps: [
        넷
          .map(
            (one) =>
              `${one.shape}: ${선대칭인가 ? (one.axisCount !== 0 ? '선대칭도형' : '선대칭도형이 아님') : one.pointSymmetric ? '점대칭도형' : '점대칭도형이 아님'}`,
          )
          .join(', '),
        `그러므로 ${개수}개입니다.`,
      ],
      visual: figureChoices('여러 도형', 넷.map((one) => one.shape), ['가', '나', '다', '라']),
    };
  },
});

// 성질 차시에서 쓰는 수 문항입니다. 수를 바꿔 가며 낼 수 있습니다.
const 대응각구하기 = (선대칭인가: boolean): G5Family => ({
  id: 'corresponding-angle-value',
  make: (seed) => {
    const next = rand(seed);
    const { first } = 대응이름(4);
    const 각 = 50 + next(90);
    const 이름 = 선대칭인가 ? '선대칭도형' : '점대칭도형';
    const 자리 = next(4);
    return {
      prompt: `${이름}인 사각형 ${first.join('')}에서 각 ${first[(자리 + 3) % 4]}${first[자리]}${first[(자리 + 1) % 4]}의 크기가 ${각}°입니다. 그 대응각의 크기는 몇 도일까요?`,
      answer: `${각}°`,
      wrongs: [`${180 - 각}°`, `${360 - 각}°`, `${각 + 20}°`, `${Math.round(각 / 2)}°`],
      tag: 'congruence',
      strategy: '대응각의 크기 구하기',
      hint: `${이름}에서 대응각의 크기는 서로 같습니다. 새로 계산할 것이 없습니다.`,
      steps: [
        선대칭인가
          ? '선대칭도형을 대칭축으로 접으면 대응각이 완전히 겹칩니다.'
          : '점대칭도형을 180° 돌리면 대응각이 완전히 겹칩니다.',
        '겹치므로 대응각의 크기는 서로 같습니다.',
        `그러므로 대응각의 크기도 ${각}°입니다.`,
      ],
    };
  },
});

const 완성한둘레 = (선대칭인가: boolean): G5Family => ({
  id: 'completed-perimeter',
  make: (seed) => {
    const next = rand(seed);
    const 이름 = 선대칭인가 ? '선대칭도형' : '점대칭도형';
    const 반쪽둘레 = 6 + next(15);
    const answer = 반쪽둘레 * 2;
    return {
      prompt: `${이름}의 반쪽만 그려져 있습니다. 그려진 부분에서 ${eul(선대칭인가 ? '대칭축' : '대칭의 중심')} 뺀 변의 길이의 합이 ${반쪽둘레} cm일 때, 도형을 완성하면 둘레는 몇 cm일까요?`,
      answer: `${answer} cm`,
      wrongs: [`${반쪽둘레} cm`, `${반쪽둘레 * 3} cm`, `${반쪽둘레 + 2} cm`, `${Math.round(반쪽둘레 / 2)} cm`],
      tag: 'congruence',
      strategy: '대칭을 이용해 둘레 구하기',
      hint: '완성한 도형은 그려진 부분과 똑같은 모양이 하나 더 붙은 것입니다. 변의 길이도 그만큼 늘어납니다.',
      steps: [
        `${이름}에서 대응변의 길이는 서로 같습니다.`,
        `완성하면 그려진 부분과 같은 길이의 변이 하나 더 생기므로 ${반쪽둘레} × 2 = ${answer}입니다.`,
        `그러므로 둘레는 ${answer} cm입니다.`,
      ],
    };
  },
});

const 대응점이름 = (선대칭인가: boolean): G5Family => ({
  id: 'which-point',
  make: (seed) => {
    const next = rand(seed);
    const 이름 = 선대칭인가 ? '선대칭도형' : '점대칭도형';
    const 꼭짓점 = 자음이름.slice(0, 6);
    const 자리 = next(6);
    // 여섯 꼭짓점을 마주 보게 짝지으면 i와 i+3이 대응합니다.
    const 짝 = (자리 + 3) % 6;
    return {
      prompt: `${이름}인 육각형 ${꼭짓점.join('')}에서 점 ${꼭짓점[자리]}의 대응점은 무엇일까요? (마주 보는 꼭짓점끼리 대응합니다.)`,
      answer: `점 ${꼭짓점[짝]}`,
      wrongs: [0, 1, 2, 3, 4, 5]
        .filter((one) => one !== 짝 && one !== 자리)
        .slice(0, 3)
        .map((one) => `점 ${꼭짓점[one]}`),
      tag: 'congruence',
      strategy: '대응점 찾기',
      hint: '꼭짓점 여섯 개를 차례로 적고, 세 칸 건너뛴 자리를 찾아보세요.',
      steps: [
        `${이름}에서 대응점은 ${선대칭인가 ? '대칭축을 사이에 두고' : '대칭의 중심을 사이에 두고'} 마주 봅니다.`,
        `꼭짓점이 여섯 개이므로 점 ${꼭짓점[자리]}의 맞은편은 세 칸 건너뛴 점 ${꼭짓점[짝]}입니다.`,
        `그러므로 대응점은 점 ${꼭짓점[짝]}입니다.`,
      ],
    };
  },
});


// 생활 속에서 대칭을 찾습니다. 지도서 9·10차시(병풍책 만들기,
// 픽토그램 만들기)가 생활 소재로 이어지는 차시라, 그 앞자락을 둡니다.
const 생활속대칭 = (선대칭인가: boolean): G5Family => ({
  id: 'real-life-symmetry',
  make: (seed) => {
    const next = rand(seed);
    const 것들 = [
      { 이름: '나비 모양', 선: true, 점: false },
      { 이름: '바람개비 모양', 선: false, 점: true },
      { 이름: '하트 모양', 선: true, 점: false },
      { 이름: '태극 문양', 선: false, 점: true },
      { 이름: '사람의 얼굴 모양', 선: true, 점: false },
      { 이름: '뾰족한 별 모양', 선: true, 점: false },
      { 이름: '트럼프 카드의 숫자 모양', 선: false, 점: true },
      { 이름: '달팽이 껍데기 모양', 선: false, 점: false },
      { 이름: '왼발 신발 한 짝', 선: false, 점: false },
      { 이름: '계단 모양', 선: false, 점: false },
    ];
    const 맞는것 = 것들.filter((one) => (선대칭인가 ? one.선 : one.점));
    const 아닌것 = 것들.filter((one) => !(선대칭인가 ? one.선 : one.점));
    if (맞는것.length < 1 || 아닌것.length < 3) return null;
    const 정답 = 맞는것[next(맞는것.length)];
    const 셋 = [...아닌것].sort((a, b) => (a.이름 + seed).localeCompare(b.이름 + seed)).slice(0, 3);
    const 이름 = 선대칭인가 ? '선대칭' : '점대칭';
    return {
      prompt: `생활에서 볼 수 있는 다음 모양 중 ${이름}인 것은 어느 것일까요?`,
      answer: 정답.이름,
      wrongs: 셋.map((one) => one.이름),
      tag: 'congruence',
      strategy: `생활 속에서 ${이름}인 모양 찾기`,
      hint: 선대칭인가
        ? '모양을 반으로 접었다고 생각해 보세요. 두 쪽이 딱 맞아야 합니다.'
        : '모양을 반 바퀴 돌렸다고 생각해 보세요. 처음과 같아야 합니다.',
      steps: [
        선대칭인가
          ? '선대칭은 어떤 직선을 따라 접었을 때 두 쪽이 완전히 겹치는 것입니다.'
          : '점대칭은 어떤 점을 중심으로 180° 돌렸을 때 처음과 완전히 겹치는 것입니다.',
        `${eun(정답.이름)} 그 조건에 맞습니다.`,
        `그러므로 답은 ${정답.이름}입니다.`,
      ],
    };
  },
});

// ── 4·6차시 선대칭도형·점대칭도형은 무엇일까요 ─────────────────────
const 대칭찾기 = (선대칭인가: boolean): G5Family[] => {
  const 맞는것 = 선대칭인가 ? 선대칭도형들 : 점대칭도형들;
  const 아닌것 = 선대칭인가 ? 선대칭아닌것들 : 점대칭아닌것들;
  const 이름 = 선대칭인가 ? '선대칭도형' : '점대칭도형';

  return [
    {
      id: 'meaning',
      make: () => ({
        prompt: `${eun(이름)} 어떤 도형일까요?`,
        answer: 선대칭인가
          ? '한 직선을 따라 접었을 때 완전히 겹치는 도형'
          : '어떤 점을 중심으로 180° 돌렸을 때 처음 도형과 완전히 겹치는 도형',
        wrongs: 선대칭인가
          ? [
              '어떤 점을 중심으로 180° 돌렸을 때 완전히 겹치는 도형',
              '한 직선을 따라 접었을 때 반으로 나누어지는 모든 도형',
              '모든 변의 길이가 같은 도형',
            ]
          : [
              '한 직선을 따라 접었을 때 완전히 겹치는 도형',
              '어떤 점을 중심으로 90° 돌렸을 때 완전히 겹치는 도형',
              '모든 각의 크기가 같은 도형',
            ],
        tag: 'congruence',
        strategy: `${이름}의 뜻 알기`,
        hint: 선대칭인가
          ? '종이를 접는다고 생각해 보세요. 접힌 두 쪽이 딱 맞게 포개어져야 합니다.'
          : '도형을 압정으로 한 점에 꽂고 반 바퀴 돌린다고 생각해 보세요.',
        steps: 선대칭인가
          ? [
              '선대칭도형은 한 직선을 따라 접었을 때 두 쪽이 완전히 겹치는 도형입니다.',
              '이때 접은 직선을 대칭축이라고 합니다.',
              '그러므로 답은 한 직선을 따라 접었을 때 완전히 겹치는 도형입니다.',
            ]
          : [
              '점대칭도형은 어떤 점을 중심으로 180° 돌렸을 때 처음 도형과 완전히 겹치는 도형입니다.',
              '이때 그 점을 대칭의 중심이라고 합니다.',
              '그러므로 답은 어떤 점을 중심으로 180° 돌렸을 때 처음 도형과 완전히 겹치는 도형입니다.',
            ],
        misconceptionTip: 선대칭인가
          ? '반으로 나누어진다고 모두 선대칭이 아닙니다. 접었을 때 두 쪽이 딱 맞게 겹쳐야 합니다.'
          : '점대칭과 선대칭을 헷갈리지 마세요. 점대칭은 접는 것이 아니라 돌리는 것입니다.',
      }),
    },
    {
      id: 'pick-one',
      make: (seed) => {
        const next = rand(seed);
        const 정답도형 = 맞는것[next(맞는것.length)];
        const 나머지 = [...아닌것].sort((a, b) => (a.shape + seed).localeCompare(b.shape + seed)).slice(0, 3);
        if (나머지.length < 3) return null;
        const 자리 = next(4);
        const 이름표 = ['가', '나', '다', '라'];
        const shapes = [...나머지.map((one) => one.shape)];
        shapes.splice(자리, 0, 정답도형.shape);
        return {
          prompt: `그림에서 ${eul(이름)} 찾으면 어느 것일까요?`,
          answer: 이름표[자리],
          wrongs: 이름표.filter((one) => one !== 이름표[자리]),
          tag: 'congruence',
          strategy: `${이름} 찾기`,
          hint: 선대칭인가
            ? '도형마다 접을 수 있는 선을 하나 그어 보고, 접었을 때 두 쪽이 딱 맞는지 살펴보세요.'
            : '도형마다 가운데 점을 잡고 반 바퀴 돌렸다고 생각해 보세요. 처음 모양과 딱 맞아야 합니다.',
          steps: [
            선대칭인가
              ? '선대칭도형은 어떤 직선을 따라 접었을 때 두 쪽이 완전히 겹칩니다.'
              : '점대칭도형은 어떤 점을 중심으로 180° 돌렸을 때 처음 도형과 완전히 겹칩니다.',
            `${나머지.map((one) => one.shape).join(', ')}${particleOf(나머지[나머지.length - 1].shape, '은')} 그렇지 않습니다.`,
            `${eun(정답도형.shape)} ${이름}이므로 답은 ${이름표[자리]}입니다.`,
          ],
          visual: figureChoices('여러 도형', shapes, 이름표),
        };
      },
    },
    {
      id: 'is-it',
      make: (seed) => {
        const next = rand(seed);
        const 도형 = FIGURE_FACTS[next(FIGURE_FACTS.length)];
        const 맞나 = 선대칭인가 ? 도형.axisCount !== 0 : 도형.pointSymmetric;
        return {
          prompt: `${eun(도형.shape)} ${이름}일까요?`,
          answer: 맞나 ? `${이름}입니다.` : `${이름}이 아닙니다.`,
          wrongs: [
            맞나 ? `${이름}이 아닙니다.` : `${이름}입니다.`,
            '도형을 돌려 놓으면 달라집니다.',
            '크기에 따라 달라집니다.',
          ],
          tag: 'congruence',
          strategy: `${이름}인지 판단하기`,
          hint: 선대칭인가
            ? '접을 수 있는 직선이 하나라도 있는지 찾아보세요. 하나만 있어도 됩니다.'
            : '반 바퀴 돌렸을 때 처음과 같은 모양이 되는지 살펴보세요.',
          steps: [
            선대칭인가
              ? `${도형.shape}의 대칭축은 ${도형.axisCount === 0 ? '하나도 없습니다' : `${도형.axisCount}개입니다`}.`
              : `${eul(도형.shape)} 180° 돌리면 ${도형.pointSymmetric ? '처음 도형과 완전히 겹칩니다' : '처음 도형과 겹치지 않습니다'}.`,
            `그러므로 ${eun(도형.shape)} ${맞나 ? `${이름}입니다` : `${이름}이 아닙니다`}.`,
          ],
          visual: oneFigure('도형', 도형.shape),
          misconceptionTip: 선대칭인가
            ? '평행사변형을 대각선으로 접으면 두 쪽이 겹치지 않습니다. 대각선은 대칭축이 아닙니다.'
            : '정삼각형은 선대칭도형이지만 점대칭도형은 아닙니다. 두 가지는 다른 것입니다.',
        };
      },
    },
  ];
};

export const 선대칭Easy: G5Family[] = [...대칭찾기(true), 축인지판단(0), 글자대칭(true), 대칭개수세기(true), 생활속대칭(true)];
export const 점대칭Easy: G5Family[] = [...대칭찾기(false), 글자대칭(false), 대칭개수세기(false), 생활속대칭(false), 대응점이름(false)];

export const 선대칭Middle: G5Family[] = [
  축인지판단(1),
  대칭개수세기(true),
  글자대칭(true),
  생활속대칭(true),
  {
    id: 'axis-count',
    make: (seed) => {
      const next = rand(seed);
      const 도형 = FIGURE_FACTS.filter((one) => one.axisCount !== '무수히 많음')[next(11)] ?? FIGURE_FACTS[3];
      const answer = `${도형.axisCount}개`;
      const 다른수 = [0, 1, 2, 3, 4, 5, 6].filter((one) => one !== 도형.axisCount);
      return {
        prompt: `${도형.shape}의 대칭축은 모두 몇 개일까요?`,
        answer,
        wrongs: 다른수.slice(0, 3).map((one) => `${one}개`).concat('무수히 많습니다.'),
        tag: 'congruence',
        strategy: '대칭축의 개수 구하기',
        hint: '접을 수 있는 직선을 하나씩 그어 보세요. 세로, 가로, 대각선을 차례로 시험해 봅니다.',
        steps: [
          '대칭축은 접었을 때 두 쪽이 완전히 겹치는 직선입니다.',
          도형.axisCount === 0
            ? `${eun(도형.shape)} 어느 직선으로 접어도 두 쪽이 겹치지 않습니다.`
            : `${eun(도형.shape)} 그런 직선이 ${도형.axisCount}개 있습니다.`,
          `그러므로 대칭축은 ${answer}입니다.`,
        ],
        visual: oneFigure('도형', 도형.shape),
        misconceptionTip: '직사각형과 평행사변형의 대각선은 대칭축이 아닙니다. 접어 보면 두 쪽이 겹치지 않습니다.',
      };
    },
  },
  {
    id: 'diagonal-is-not-axis',
    make: (seed) => {
      const 도형 = pick(['직사각형', '평행사변형'] as FigureShapeName[], seed);
      return {
        prompt: `${eul(도형)} 대각선을 따라 접으면 두 쪽이 완전히 겹칠까요?`,
        answer: '겹치지 않으므로 대각선은 대칭축이 아닙니다.',
        wrongs: [
          '겹치므로 대각선은 대칭축입니다.',
          '겹치지만 대칭축이라고 하지는 않습니다.',
          '도형을 돌려 놓으면 겹칩니다.',
        ],
        tag: 'congruence',
        strategy: '대각선이 대칭축인지 판단하기',
        hint: '대각선으로 자르면 합동인 두 삼각형이 생깁니다. 하지만 합동인 것과 접어서 겹치는 것은 다른 일입니다.',
        steps: [
          `${eul(도형)} 대각선으로 자르면 서로 합동인 삼각형 두 개가 생깁니다.`,
          '그러나 자른 것이 아니라 접으면, 두 삼각형이 서로 반대로 놓여 포개어지지 않습니다.',
          '접어 보면 두 쪽이 겹치지 않으므로 대각선은 대칭축이 아닙니다.',
        ],
        visual: oneFigure('도형', 도형),
        misconceptionTip: '합동인 두 조각으로 나누어진다고 대칭축이 되는 것은 아닙니다. 접어서 겹쳐야 대칭축입니다.',
      };
    },
  },
  {
    id: 'most-axes',
    make: (seed) => {
      const 후보 = [
        ['정사각형', '직사각형', '이등변삼각형', '평행사변형'],
        ['정삼각형', '직사각형', '사다리꼴', '평행사변형'],
        ['정육각형', '정사각형', '마름모', '이등변삼각형'],
      ][Math.abs(seed) % 3] as FigureShapeName[];
      const 개수 = 후보.map((one) => factFor(one).axisCount as number);
      const 가장많은 = 후보[개수.indexOf(Math.max(...개수))];
      return {
        prompt: '다음 도형 중 대칭축이 가장 많은 것은 어느 것일까요?',
        answer: 가장많은,
        wrongs: 후보.filter((one) => one !== 가장많은),
        tag: 'congruence',
        strategy: '대칭축의 개수 비교하기',
        hint: '도형마다 대칭축을 몇 개 그을 수 있는지 하나씩 세어 적어 보세요.',
        steps: [
          후보.map((one, index) => `${one} ${개수[index]}개`).join(', '),
          `그중 가장 많은 것은 ${가장많은}입니다.`,
        ],
        visual: figureChoices('여러 도형', 후보),
      };
    },
  },
];

export const 점대칭Middle: G5Family[] = [
  대칭개수세기(false),
  글자대칭(false),
  생활속대칭(false),
  {
    id: 'line-vs-point',
    make: (seed) => {
      const next = rand(seed);
      const 도형 = FIGURE_FACTS[next(FIGURE_FACTS.length)];
      const 선대칭 = 도형.axisCount !== 0;
      const 점대칭 = 도형.pointSymmetric;
      const answer = 선대칭 && 점대칭
        ? '선대칭도형이면서 점대칭도형입니다.'
        : 선대칭
          ? '선대칭도형이지만 점대칭도형은 아닙니다.'
          : 점대칭
            ? '점대칭도형이지만 선대칭도형은 아닙니다.'
            : '선대칭도형도 점대칭도형도 아닙니다.';
      return {
        prompt: `${도형.shape}에 대한 설명으로 알맞은 것은 어느 것일까요?`,
        answer,
        wrongs: [
          '선대칭도형이면서 점대칭도형입니다.',
          '선대칭도형이지만 점대칭도형은 아닙니다.',
          '점대칭도형이지만 선대칭도형은 아닙니다.',
          '선대칭도형도 점대칭도형도 아닙니다.',
        ].filter((one) => one !== answer),
        tag: 'congruence',
        strategy: '선대칭과 점대칭을 가려 판단하기',
        hint: '접어서 겹치는지(선대칭), 반 바퀴 돌려서 겹치는지(점대칭)를 따로 살펴보세요.',
        steps: [
          `접어서 겹치는 직선이 ${선대칭 ? '있으므로 선대칭도형입니다' : '없으므로 선대칭도형이 아닙니다'}.`,
          `180° 돌렸을 때 ${점대칭 ? '처음과 겹치므로 점대칭도형입니다' : '처음과 겹치지 않으므로 점대칭도형이 아닙니다'}.`,
          `그러므로 ${answer}`,
        ],
        visual: oneFigure('도형', 도형.shape),
        misconceptionTip: '선대칭과 점대칭은 따로 따져야 합니다. 정삼각형은 선대칭이지만 점대칭이 아니고, 평행사변형은 점대칭이지만 선대칭이 아닙니다.',
      };
    },
  },
  {
    id: 'center-of-symmetry',
    make: (seed) => {
      const next = rand(seed);
      const 도형 = 점대칭도형들[next(점대칭도형들.length)];
      return {
        prompt: `${도형.shape}에서 대칭의 중심은 몇 개일까요?`,
        answer: '1개',
        wrongs: ['2개', '4개', '없습니다.', '무수히 많습니다.'],
        tag: 'congruence',
        strategy: '대칭의 중심 알기',
        hint: '점대칭도형을 돌릴 때 압정을 꽂을 수 있는 자리가 몇 군데인지 생각해 보세요.',
        steps: [
          '대칭의 중심은 180° 돌렸을 때 처음 도형과 겹치게 하는 점입니다.',
          '그런 점은 도형마다 오직 하나뿐입니다.',
          '그러므로 대칭의 중심은 1개입니다.',
        ],
        visual: oneFigure('도형', 도형.shape, { center: true }),
        misconceptionTip: '대칭축은 여러 개일 수 있지만 대칭의 중심은 언제나 하나뿐입니다.',
      };
    },
  },
  {
    id: 'both-list',
    make: (seed) => {
      const next = rand(seed);
      const 둘다 = FIGURE_FACTS.filter((one) => one.axisCount !== 0 && one.pointSymmetric);
      const 정답 = 둘다[next(둘다.length)];
      const 아닌것 = FIGURE_FACTS.filter((one) => !(one.axisCount !== 0 && one.pointSymmetric));
      const 셋 = [...아닌것].sort((a, b) => (a.shape + seed).localeCompare(b.shape + seed)).slice(0, 3);
      if (셋.length < 3) return null;
      return {
        prompt: '다음 중 선대칭도형이면서 점대칭도형인 것은 어느 것일까요?',
        answer: 정답.shape,
        wrongs: 셋.map((one) => one.shape),
        tag: 'congruence',
        strategy: '선대칭이면서 점대칭인 도형 찾기',
        hint: '두 가지를 모두 만족해야 합니다. 접어서 겹치는지, 반 바퀴 돌려서 겹치는지 따로 확인하세요.',
        steps: [
          '접어서 겹치면 선대칭도형, 180° 돌려서 겹치면 점대칭도형입니다.',
          `${eun(정답.shape)} 두 가지를 모두 만족합니다.`,
          `그러므로 답은 ${정답.shape}입니다.`,
        ],
      };
    },
  },
];

// ── 5·7차시 선대칭·점대칭도형의 성질 ───────────────────────────────
export const 대칭성질 = (선대칭인가: boolean): G5Family[] => {
  const 이름 = 선대칭인가 ? '선대칭도형' : '점대칭도형';
  const 기준 = 선대칭인가 ? '대칭축' : '대칭의 중심';

  return [
    대응각구하기(선대칭인가),
    완성한둘레(선대칭인가),
    대응점이름(선대칭인가),
    생활속대칭(선대칭인가),
    {
      id: 'segment-property',
      make: () => ({
        prompt: `${이름}에서 대응점끼리 이은 선분과 ${eun(기준)} 어떤 관계일까요?`,
        answer: 선대칭인가
          ? '대칭축이 대응점끼리 이은 선분을 수직으로 이등분합니다.'
          : '대칭의 중심이 대응점끼리 이은 선분을 이등분합니다.',
        wrongs: 선대칭인가
          ? [
              '대칭축이 대응점끼리 이은 선분을 이등분하지만 수직은 아닙니다.',
              '대칭축과 대응점끼리 이은 선분은 만나지 않습니다.',
              '대칭축이 대응점끼리 이은 선분과 평행합니다.',
            ]
          : [
              '대칭의 중심이 대응점끼리 이은 선분을 수직으로 이등분합니다.',
              '대칭의 중심은 대응점끼리 이은 선분 위에 있지 않습니다.',
              '대응점끼리 이은 선분은 대칭의 중심에서 만나지 않습니다.',
            ],
        tag: 'congruence',
        strategy: `${이름}에서 대응점 사이의 관계 알기`,
        hint: 선대칭인가
          ? '접었을 때 두 대응점이 만나려면, 두 점이 대칭축에서 같은 거리에 있어야 합니다. 그 선분은 대칭축과 어떻게 만날까요?'
          : '대응점 두 개와 대칭의 중심을 이으면 한 직선이 됩니다. 중심은 그 선분의 어디에 있을까요?',
        steps: 선대칭인가
          ? [
              '접었을 때 두 대응점이 딱 만나려면 두 점이 대칭축에서 같은 거리에 있어야 합니다.',
              '또한 접은 자리가 대칭축이므로 선분과 대칭축은 수직으로 만납니다.',
              '그러므로 대칭축이 대응점끼리 이은 선분을 수직으로 이등분합니다.',
            ]
          : [
              '180° 돌렸을 때 두 대응점이 서로 자리를 바꾸므로, 두 점은 대칭의 중심에서 같은 거리에 있습니다.',
              '두 대응점과 대칭의 중심은 한 직선 위에 있습니다.',
              '그러므로 대칭의 중심이 대응점끼리 이은 선분을 이등분합니다.',
            ],
        misconceptionTip: 선대칭인가
          ? undefined
          : '점대칭에서는 이등분만 합니다. 수직으로 만나는 것은 선대칭의 성질입니다.',
      }),
    },
    {
      id: 'length-and-angle',
      make: (seed) => {
        const answer = pick(
          ['대응변의 길이가 서로 같습니다.', '대응각의 크기가 서로 같습니다.'],
          seed,
        );
        return {
          prompt: `${이름}의 성질로 옳은 것은 어느 것일까요?`,
          answer,
          wrongs: [
            '대응변의 길이는 서로 다릅니다.',
            '대응각의 크기는 서로 다릅니다.',
            `${eul(기준)} 지나는 변은 길이가 반으로 줄어듭니다.`,
          ],
          tag: 'congruence',
          strategy: `${이름}의 성질 알기`,
          hint: 선대칭인가
            ? '접었을 때 겹치는 변과 각을 짝지어 보세요. 겹친다는 것은 무엇이 같다는 뜻일까요?'
            : '반 바퀴 돌렸을 때 겹치는 변과 각을 짝지어 보세요.',
          steps: [
            선대칭인가
              ? '선대칭도형을 대칭축으로 접으면 대응하는 변과 각이 완전히 겹칩니다.'
              : '점대칭도형을 180° 돌리면 대응하는 변과 각이 완전히 겹칩니다.',
            '겹친다는 것은 길이와 크기가 같다는 뜻입니다.',
            `그러므로 ${answer}`,
          ],
        };
      },
    },
    {
      id: 'find-length',
      make: (seed) => {
        const next = rand(seed);
        const { first } = 대응이름(4);
        const 길이 = 3 + next(9);
        const 도형: FigureShapeName = 선대칭인가 ? '마름모' : '평행사변형';
        return {
          prompt: `${이름}인 사각형 ${first.join('')}에서 변 ${first[0]}${first[1]}의 길이가 ${길이} cm입니다. 그 대응변의 길이는 몇 cm일까요?`,
          answer: `${길이} cm`,
          wrongs: [`${길이 * 2} cm`, `${Math.max(1, 길이 - 2)} cm`, `${길이 + 3} cm`, `${Math.round(길이 / 2)} cm`],
          tag: 'congruence',
          strategy: '대응변의 길이 구하기',
          hint: `${이름}에서 대응변의 길이는 서로 같습니다. 길이를 새로 계산할 필요가 없습니다.`,
          steps: [
            선대칭인가
              ? '선대칭도형을 대칭축으로 접으면 대응변이 완전히 겹칩니다.'
              : '점대칭도형을 180° 돌리면 대응변이 완전히 겹칩니다.',
            '겹치므로 대응변의 길이는 서로 같습니다.',
            `그러므로 대응변의 길이도 ${길이} cm입니다.`,
          ],
          visual: oneFigure(이름, 도형, 선대칭인가 ? { axes: ['vertical'] } : { center: true }),
        };
      },
    },
    {
      id: 'half-distance',
      make: (seed) => {
        const next = rand(seed);
        const 전체 = (2 + next(8)) * 2;
        return {
          prompt: 선대칭인가
            ? `선대칭도형에서 대응점끼리 이은 선분의 길이가 ${전체} cm입니다. 한 대응점에서 대칭축까지의 거리는 몇 cm일까요?`
            : `점대칭도형에서 대응점끼리 이은 선분의 길이가 ${전체} cm입니다. 한 대응점에서 대칭의 중심까지의 거리는 몇 cm일까요?`,
          answer: `${전체 / 2} cm`,
          wrongs: [`${전체} cm`, `${전체 * 2} cm`, `${전체 / 2 + 1} cm`, `${전체 - 2} cm`],
          tag: 'congruence',
          strategy: `${gwa(기준)} 대응점 사이의 거리 구하기`,
          hint: `${iJosa(기준)} 그 선분을 똑같이 둘로 나눕니다. 절반이 얼마인지 구하면 됩니다.`,
          steps: [
            `${이름}에서 ${eun(기준)} 대응점끼리 이은 선분을 이등분합니다.`,
            `${전체} ÷ 2 = ${전체 / 2}입니다.`,
            `그러므로 ${전체 / 2} cm입니다.`,
          ],
        };
      },
    },
    {
      id: 'how-to-draw',
      make: () => ({
        prompt: 선대칭인가
          ? '선대칭도형의 나머지 부분을 그리려면 어떻게 해야 할까요?'
          : '점대칭도형의 나머지 부분을 그리려면 어떻게 해야 할까요?',
        answer: 선대칭인가
          ? '각 꼭짓점에서 대칭축에 수직인 선을 긋고, 대칭축에서 같은 거리에 대응점을 찍어 잇습니다.'
          : '각 꼭짓점과 대칭의 중심을 잇고, 그 연장선에서 같은 거리에 대응점을 찍어 잇습니다.',
        wrongs: 선대칭인가
          ? [
              '각 꼭짓점과 대칭축 위의 아무 점을 이어 그립니다.',
              '각 꼭짓점을 대칭축과 나란한 방향으로 옮겨 그립니다.',
              '도형을 그대로 옆으로 밀어 그립니다.',
            ]
          : [
              '각 꼭짓점에서 대칭의 중심에 수직인 선을 긋고 같은 거리에 점을 찍습니다.',
              '도형을 그대로 옆으로 밀어 그립니다.',
              '각 꼭짓점을 대칭의 중심과 나란한 방향으로 옮겨 그립니다.',
            ],
        tag: 'congruence',
        strategy: `${이름} 그리는 방법 알기`,
        hint: `먼저 꼭짓점 하나의 대응점을 찾는 방법을 생각하세요. ${eul(기준)} 어떻게 쓰는지가 열쇠입니다.`,
        steps: [
          선대칭인가
            ? '대칭축은 대응점끼리 이은 선분을 수직으로 이등분합니다.'
            : '대칭의 중심은 대응점끼리 이은 선분을 이등분합니다.',
          '대응점을 모두 찍은 뒤 차례대로 이으면 도형이 완성됩니다.',
          선대칭인가
            ? '그러므로 각 꼭짓점에서 대칭축에 수직인 선을 긋고, 대칭축에서 같은 거리에 대응점을 찍어 잇습니다.'
            : '그러므로 각 꼭짓점과 대칭의 중심을 잇고, 그 연장선에서 같은 거리에 대응점을 찍어 잇습니다.',
        ],
      }),
    },
  ];
};
