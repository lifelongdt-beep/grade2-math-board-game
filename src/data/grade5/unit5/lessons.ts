import type { BoxFace, FigureShapeName, QuestionVisual } from '../../../types';
import type { G5Family } from '../build';
import { eul, eun, gwa, i as iJosa, particleOf, pick, rand } from '../util';
import { ALL_FACES, OPPOSITE, faceName, perpendicularTo } from './box';

// ════════════════════════════════════════════════════════════════════
// 5단원 직육면체와 정육면체 (1~4차시)
// ────────────────────────────────────────────────────────────────────
// 지도서가 적어 둔 오개념을 그대로 오답으로 씁니다.
//   ① 밑면을 '아래에 있는 면'으로만 알아 밑면이 1개라고 생각
//      → 밑면은 평행한 두 면이고, 직육면체를 돌리면 옆에도 위에도 옵니다.
//   ② 보이지 않는 면·모서리·꼭짓점을 빠뜨리고 세기
//      → 면 3개, 모서리 9개, 꼭짓점 7개라고 답하게 됩니다.
//   ③ 겨냥도에서 면이 평행사변형으로 보이므로 실제 모양도 그렇다고 생각
//      → 실제로는 직사각형입니다.
//   ④ 직육면체와 정육면체의 관계를 거꾸로 알기
//      → 정육면체는 직육면체이지만, 직육면체가 늘 정육면체는 아닙니다.
// ════════════════════════════════════════════════════════════════════

/**
 * 풀이의 마지막 줄은 늘 이 문항의 답을 말해야 합니다. 까닭만 적어 두면
 * 아이가 풀이를 읽고도 무엇이 답인지 모르는 일이 생깁니다.
 */
export const 답으로맺기 = (까닭: string, 답: string): string[] => {
  const 알맹이 = 답.replace(/[.]$/, '');
  if (까닭.includes(알맹이)) return [까닭];
  return [까닭, `그러므로 ${답.endsWith('.') ? 답 : `${답}입니다.`}`];
};

/** 그림에 쓸 직육면체의 크기입니다. 셋이 서로 다르게 나오게 합니다. */
export const boxSizeFor = (seed: number) => {
  const next = rand(seed);
  const width = 5 + next(4);
  const depth = 2 + next(3);
  const height = 3 + next(4);
  return { width, depth: depth === width ? depth + 1 : depth, height: height === width ? height + 1 : height };
};

export const boxPicture = (
  label: string,
  seed: number,
  extra: Partial<Extract<QuestionVisual, { kind: 'box-drawing' }>> = {},
): QuestionVisual => {
  const size = boxSizeFor(seed);
  return { kind: 'box-drawing', label, width: size.width, depth: size.depth, height: size.height, ...extra };
};

export const cubePicture = (
  label: string,
  extra: Partial<Extract<QuestionVisual, { kind: 'box-drawing' }>> = {},
): QuestionVisual => ({ kind: 'box-drawing', label, width: 4, depth: 4, height: 4, ...extra });

// ── 1차시 단원 도입 ─────────────────────────────────────────────────
// 지도서 '떠올려 보기'가 묻는 것 그대로입니다 — 직사각형, 정사각형,
// 수직, 평행. 직육면체는 아직 묻지 않습니다.

const 선수학습: Array<{ 말: string; 뜻: string; 아닌뜻: string[]; 도형?: FigureShapeName }> = [
  {
    말: '직사각형',
    뜻: '네 각이 모두 직각인 사각형',
    아닌뜻: ['네 변의 길이가 모두 같은 사각형', '마주 보는 한 쌍의 변만 평행한 사각형', '세 각이 직각인 사각형'],
    도형: '직사각형',
  },
  {
    말: '정사각형',
    뜻: '네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형',
    아닌뜻: ['네 각이 모두 직각인 사각형', '네 변의 길이가 모두 같은 사각형', '마주 보는 두 쌍의 변이 평행한 사각형'],
    도형: '정사각형',
  },
  {
    말: '수직',
    뜻: '두 직선이 만나서 이루는 각이 직각인 관계',
    아닌뜻: ['서로 만나지 않는 두 직선의 관계', '길이가 같은 두 직선의 관계', '한 점에서 만나기만 하는 두 직선의 관계'],
  },
  {
    말: '평행',
    뜻: '서로 만나지 않는 두 직선의 관계',
    아닌뜻: ['만나서 직각을 이루는 두 직선의 관계', '길이가 같은 두 직선의 관계', '한 점에서 만나는 두 직선의 관계'],
  },
  {
    말: '마름모',
    뜻: '네 변의 길이가 모두 같은 사각형',
    아닌뜻: ['네 각이 모두 직각인 사각형', '마주 보는 한 쌍의 변만 평행한 사각형', '세 변의 길이가 같은 사각형'],
    도형: '마름모',
  },
  {
    말: '평행사변형',
    뜻: '마주 보는 두 쌍의 변이 서로 평행한 사각형',
    아닌뜻: ['마주 보는 한 쌍의 변만 평행한 사각형', '네 각이 모두 직각인 사각형', '네 변의 길이가 모두 같은 사각형'],
    도형: '평행사변형',
  },
];

const 포함관계: Array<{ 물음: string; 답: string; 까닭: string }> = [
  {
    물음: '정사각형은 직사각형이라고 할 수 있을까요?',
    답: '할 수 있습니다.',
    까닭: '정사각형도 네 각이 모두 직각이므로 직사각형의 조건을 모두 갖추었습니다.',
  },
  {
    물음: '직사각형은 모두 정사각형이라고 할 수 있을까요?',
    답: '할 수 없습니다.',
    까닭: '직사각형 중에는 네 변의 길이가 모두 같지 않은 것이 있습니다.',
  },
  {
    물음: '정사각형은 마름모라고 할 수 있을까요?',
    답: '할 수 있습니다.',
    까닭: '정사각형도 네 변의 길이가 모두 같으므로 마름모의 조건을 갖추었습니다.',
  },
  {
    물음: '평행사변형은 모두 직사각형이라고 할 수 있을까요?',
    답: '할 수 없습니다.',
    까닭: '평행사변형 중에는 네 각이 직각이 아닌 것이 있습니다.',
  },
];

export const unit5Lesson1: G5Family[] = [
  {
    id: 'word-meaning',
    make: (seed) => {
      const 하나 = 선수학습[Math.abs(seed) % 선수학습.length];
      return {
        prompt: `${eun(하나.말)} 무엇일까요?`,
        answer: 하나.뜻,
        wrongs: 하나.아닌뜻,
        tag: 'shape',
        strategy: '앞서 배운 말의 뜻 떠올리기',
        hint: '변의 길이가 정해져 있는 말인지, 각의 크기가 정해져 있는 말인지 나누어 생각해 보세요.',
        steps: [`${eun(하나.말)} ${하나.뜻}입니다.`],
        ...(하나.도형
          ? { visual: { kind: 'figure-set', label: '도형', items: [{ shape: 하나.도형 }] } as QuestionVisual }
          : {}),
        misconceptionTip: '이 단원은 직사각형과 정사각형 위에 세워집니다. 두 말의 뜻을 정확히 해 두세요.',
      };
    },
  },
  {
    id: 'word-from-meaning',
    make: (seed) => {
      const 하나 = 선수학습[Math.abs(seed + 3) % 선수학습.length];
      const 다른말 = 선수학습.filter((one) => one.말 !== 하나.말).map((one) => one.말);
      return {
        prompt: `${eul(하나.뜻)} 무엇이라고 할까요?`,
        answer: 하나.말,
        wrongs: [다른말[0], 다른말[1], 다른말[2]],
        tag: 'shape',
        strategy: '뜻을 보고 이름 찾기',
        hint: '조건을 하나씩 짚어 가며 그 조건을 모두 갖춘 것의 이름을 떠올리세요.',
        steps: [`${eun(하나.뜻)} ${하나.말}입니다.`],
      };
    },
  },
  {
    id: 'shape-family',
    make: (seed) => {
      const 하나 = 포함관계[Math.abs(seed) % 포함관계.length];
      return {
        prompt: 하나.물음,
        answer: 하나.답,
        wrongs: [
          하나.답 === '할 수 있습니다.' ? '할 수 없습니다.' : '할 수 있습니다.',
          '변의 길이가 같을 때만 할 수 있습니다.',
          '각의 크기가 같을 때만 할 수 있습니다.',
        ],
        tag: 'shape',
        strategy: '도형 사이의 포함 관계 알기',
        hint: '한쪽이 다른 쪽의 조건을 모두 갖추었는지 하나씩 짚어 보세요.',
        steps: [하나.까닭, `그러므로 ${하나.답}`],
        misconceptionTip: '조건을 더 많이 갖춘 도형이 더 좁은 무리입니다. 방향을 바꾸면 성립하지 않을 수 있습니다.',
      };
    },
  },
  {
    id: 'pick-rectangle',
    make: (seed) => {
      const next = rand(seed);
      const 찾을것: FigureShapeName = Math.abs(seed) % 2 === 0 ? '직사각형' : '정사각형';
      const 다른것: FigureShapeName[] = ['마름모', '평행사변형', '사다리꼴', '정육각형', '이등변삼각형'];
      const 몇개 = 1 + next(3);
      const 이름표 = ['가', '나', '다', '라'];
      const items = 이름표.map((name, at) => ({
        name,
        shape: at < 몇개 ? 찾을것 : 다른것[(next(5) + at) % 다른것.length],
      }));
      return {
        prompt: `그림에서 ${iJosa(찾을것)} 모두 몇 개일까요?`,
        answer: `${몇개}개`,
        wrongs: ['0개', '1개', '2개', '3개', '4개'].filter((one) => one !== `${몇개}개`),
        tag: 'shape',
        strategy: '조건에 맞는 도형 세기',
        hint: `${찾을것}의 조건을 먼저 말한 다음, 도형을 하나씩 그 조건에 대어 보세요.`,
        steps: [
          `${eun(찾을것)} ${찾을것 === '직사각형' ? '네 각이 모두 직각인 사각형' : '네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형'}입니다.`,
          `조건에 맞는 도형은 ${몇개}개입니다.`,
        ],
        visual: { kind: 'figure-set', label: '여러 도형', items },
      };
    },
  },
  {
    id: 'right-angle',
    make: (seed) => {
      const 물음 = [
        { q: '직각의 크기는 몇 도일까요?', a: '90도', w: ['45도', '100도', '180도'] },
        { q: '사각형의 네 각의 크기의 합은 몇 도일까요?', a: '360도', w: ['180도', '270도', '540도'] },
        { q: '직사각형에서 마주 보는 두 변의 길이는 어떠할까요?', a: '서로 같습니다.', w: ['서로 다릅니다.', '한 쌍만 같습니다.', '길이를 알 수 없습니다.'] },
      ][Math.abs(seed) % 3];
      return {
        prompt: 물음.q,
        answer: 물음.a,
        wrongs: 물음.w,
        tag: 'shape',
        strategy: '각과 변에 대해 배운 것 확인하기',
        hint: '앞서 배운 각도와 사각형의 성질을 떠올려 보세요.',
        steps: [`${물음.q.replace('일까요?', '은').replace('까요?', '은')} ${물음.a}`],
      };
    },
  },
  {
    id: 'box-around-us',
    make: (seed) => {
      const 물건 = ['상자', '주사위', '벽돌', '책'][Math.abs(seed) % 4];
      return {
        prompt: `${eun(물건)} 여러 개의 평평한 면으로 둘러싸여 있습니다. 이렇게 평평한 면으로 둘러싸인 도형을 무엇이라고 할까요?`,
        answer: '입체도형',
        wrongs: ['평면도형', '다각형', '원'],
        tag: 'solid',
        strategy: '입체도형이 무엇인지 알기',
        hint: '종이에 그린 도형처럼 납작한 것인지, 두께가 있어 손으로 잡히는 것인지 생각해 보세요.',
        steps: [
          '평면도형은 한 평면 위에 그려지는 납작한 도형입니다.',
          `${eun(물건)} 두께가 있어 한눈에 전체를 볼 수 없습니다.`,
          '이런 도형을 입체도형이라고 합니다.',
        ],
      };
    },
  },
];

// ── 2차시 직육면체는 무엇일까요 ─────────────────────────────────────

const 구성요소: Array<{ 이름: string; 뜻: string; 아닌뜻: string[]; 수: number }> = [
  {
    이름: '면',
    뜻: '선분으로 둘러싸인 부분',
    아닌뜻: ['면과 면이 만나는 선분', '모서리와 모서리가 만나는 점', '가장 긴 선분'],
    수: 6,
  },
  {
    이름: '모서리',
    뜻: '면과 면이 만나는 선분',
    아닌뜻: ['선분으로 둘러싸인 부분', '모서리와 모서리가 만나는 점', '마주 보는 두 면 사이의 거리'],
    수: 12,
  },
  {
    이름: '꼭짓점',
    뜻: '모서리와 모서리가 만나는 점',
    아닌뜻: ['면과 면이 만나는 선분', '선분으로 둘러싸인 부분', '면의 한가운데에 있는 점'],
    수: 8,
  },
];

const 물건들 = ['필통', '냉장고', '지우개', '과자 상자', '벽돌'];

export const unit5Lesson2: G5Family[] = [
  {
    id: 'box-meaning',
    make: (seed) => {
      const 거꾸로 = Math.abs(seed) % 2 === 0;
      if (거꾸로) {
        return {
          prompt: '직사각형 6개로 둘러싸인 도형을 무엇이라고 할까요?',
          answer: '직육면체',
          wrongs: ['직사각형', '다각형', '평면도형'],
          tag: 'solid',
          strategy: '직육면체의 뜻 알기',
          hint: '둘러싼 도형이 무엇이고 몇 개인지를 그대로 이름에 담은 말입니다.',
          steps: ['직사각형 6개로 둘러싸인 도형을 직육면체라고 합니다.'],
          visual: boxPicture('입체도형', seed),
        };
      }
      return {
        prompt: '직육면체는 어떤 도형일까요?',
        answer: '직사각형 6개로 둘러싸인 도형',
        wrongs: ['정사각형 6개로 둘러싸인 도형', '직사각형 4개로 둘러싸인 도형', '선분으로 둘러싸인 평면도형'],
        tag: 'solid',
        strategy: '직육면체의 뜻 알기',
        hint: '둘러싼 도형의 이름과 그 개수를 함께 말해야 합니다.',
        steps: ['직육면체는 직사각형 6개로 둘러싸인 도형입니다.'],
        visual: boxPicture('입체도형', seed + 5),
      };
    },
  },
  {
    id: 'part-meaning',
    make: (seed) => {
      const 하나 = 구성요소[Math.abs(seed) % 3];
      return {
        prompt: `직육면체에서 ${eul(하나.뜻)} 무엇이라고 할까요?`,
        answer: 하나.이름,
        wrongs: 구성요소.filter((one) => one.이름 !== 하나.이름).map((one) => one.이름).concat(['대각선']),
        tag: 'solid',
        strategy: '직육면체의 구성 요소 이름 알기',
        hint: '점인지, 선분인지, 넓이가 있는 부분인지부터 가려 보세요.',
        steps: [`직육면체에서 ${eun(하나.뜻)} ${하나.이름}입니다.`],
        visual: boxPicture('직육면체', seed + 2),
      };
    },
  },
  {
    id: 'part-from-name',
    make: (seed) => {
      const 하나 = 구성요소[Math.abs(seed + 1) % 3];
      return {
        prompt: `직육면체에서 ${eun(하나.이름)} 무엇일까요?`,
        answer: 하나.뜻,
        wrongs: 하나.아닌뜻,
        tag: 'solid',
        strategy: '직육면체의 구성 요소 뜻 알기',
        hint: '그 부분이 점인지 선분인지 넓이가 있는 부분인지를 먼저 정하세요.',
        steps: [`직육면체에서 ${eun(하나.이름)} ${하나.뜻}입니다.`],
        visual: boxPicture('직육면체', seed + 7),
      };
    },
  },
  {
    id: 'part-count',
    make: (seed) => {
      const 하나 = 구성요소[Math.abs(seed) % 3];
      // 보이지 않는 곳까지 세어야 합니다. 보이는 것만 센 값을 오답으로
      // 둡니다 — 면 3개, 모서리 9개, 꼭짓점 7개입니다.
      const 보이는것: Record<string, number> = { 면: 3, 모서리: 9, 꼭짓점: 7 };
      return {
        prompt: `직육면체에서 ${eun(하나.이름)} 모두 몇 개일까요?`,
        answer: `${하나.수}개`,
        wrongs: [`${보이는것[하나.이름]}개`, `${하나.수 + 2}개`, `${하나.수 - 2}개`, '4개'],
        tag: 'solid',
        strategy: '직육면체의 구성 요소 개수 세기',
        hint: '그림에서 가려져 보이지 않는 곳까지 세어야 합니다. 겹쳐 세거나 빠뜨리지 않았는지 확인하세요.',
        steps: [
          `직육면체의 ${하나.이름} 가운데 그림에서 보이는 것은 ${보이는것[하나.이름]}개입니다.`,
          '가려져 보이지 않는 것까지 세어야 합니다.',
          `직육면체의 ${eun(하나.이름)} 모두 ${하나.수}개입니다.`,
        ],
        visual: boxPicture('직육면체', seed + 11),
        misconceptionTip: '보이는 것만 세면 면은 3개, 모서리는 9개, 꼭짓점은 7개가 됩니다. 가려진 쪽도 세세요.',
      };
    },
  },
  {
    id: 'at-one-vertex',
    make: (seed) => {
      const 무엇 = Math.abs(seed) % 2 === 0 ? '모서리' : '면';
      return {
        prompt: `직육면체의 한 꼭짓점에서 만나는 ${eun(무엇)} 몇 개일까요?`,
        answer: '3개',
        wrongs: ['2개', '4개', '6개'],
        tag: 'solid',
        strategy: '한 꼭짓점에 모이는 것 세기',
        hint: '상자의 한 모퉁이를 손으로 잡았다고 생각하고, 그 모퉁이에 모이는 것을 세어 보세요.',
        steps: [
          '직육면체의 한 꼭짓점은 상자의 한 모퉁이입니다.',
          `그 모퉁이에는 ${무엇} 3개가 모입니다.`,
          `그러므로 3개입니다.`,
        ],
        visual: boxPicture('직육면체', seed + 13),
      };
    },
  },
  {
    id: 'not-a-box',
    make: (seed) => {
      const 경우 = [
        {
          q: '어떤 상자는 면이 6개이지만 그중 한 면이 사다리꼴입니다. 이 상자는 직육면체일까요?',
          a: '직육면체가 아닙니다.',
          why: '직육면체는 여섯 면이 모두 직사각형이어야 하는데, 직사각형이 아닌 면이 있습니다.',
        },
        {
          q: '어떤 상자는 모든 면이 직사각형이지만 면이 5개뿐입니다. 이 상자는 직육면체일까요?',
          a: '직육면체가 아닙니다.',
          why: '직육면체는 면이 6개여야 하는데 5개뿐입니다.',
        },
        {
          q: '어떤 상자는 면이 6개이고 여섯 면이 모두 직사각형입니다. 이 상자는 직육면체일까요?',
          a: '직육면체입니다.',
          why: '직사각형 6개로 둘러싸여 있으므로 직육면체의 조건을 모두 갖추었습니다.',
        },
      ][Math.abs(seed) % 3];
      return {
        prompt: 경우.q,
        answer: 경우.a,
        wrongs: [
          경우.a === '직육면체입니다.' ? '직육면체가 아닙니다.' : '직육면체입니다.',
          '면의 크기가 모두 같아야 알 수 있습니다.',
          '세워 놓았을 때만 직육면체입니다.',
        ],
        tag: 'solid',
        strategy: '직육면체인지 판단하기',
        hint: '조건은 둘입니다. 면이 6개인지, 그 여섯이 모두 직사각형인지 따로 확인하세요.',
        steps: ['직육면체는 직사각형 6개로 둘러싸인 도형입니다.', 경우.why, `그러므로 ${경우.a}`],
      };
    },
  },
  {
    id: 'thing-count',
    make: (seed) => {
      // 물건과 구성 요소를 난수로 고르면 같은 짝이 내리 나옵니다.
      // 씨앗 차례로 고르면 열다섯 짝이 고루 돌아갑니다.
      const 물건 = 물건들[Math.abs(seed) % 물건들.length];
      const 하나 = 구성요소[Math.abs(seed) % 3];
      return {
        prompt: `${eun(물건)} 직육면체 모양입니다. ${물건}의 ${eun(하나.이름)} 모두 몇 개일까요?`,
        answer: `${하나.수}개`,
        wrongs: [`${하나.수 + 2}개`, `${하나.수 - 2}개`, `${하나.수 + 4}개`, '4개'],
        tag: 'solid',
        strategy: '실생활 물건에서 구성 요소 세기',
        hint: '직육면체 모양이면 크기가 달라도 면, 모서리, 꼭짓점의 수는 늘 같습니다.',
        steps: [
          `${eun(물건)} 직육면체 모양이므로 직육면체의 구성 요소 수와 같습니다.`,
          `직육면체의 ${eun(하나.이름)} ${하나.수}개입니다.`,
        ],
      };
    },
  },
  {
    id: 'count-sum',
    make: (seed) => {
      const 셈 = [
        { q: '면의 수와 꼭짓점의 수의 합', a: 14, w: [12, 16, 20] },
        { q: '모서리의 수와 면의 수의 차', a: 6, w: [4, 8, 18] },
        { q: '모서리의 수와 꼭짓점의 수의 합', a: 20, w: [18, 14, 24] },
        { q: '모서리의 수와 꼭짓점의 수의 차', a: 4, w: [2, 6, 20] },
        { q: '꼭짓점의 수와 면의 수의 차', a: 2, w: [4, 14, 6] },
      ][Math.abs(seed) % 5];
      return {
        prompt: `직육면체에서 ${eul(셈.q)} 구하면 얼마일까요?`,
        answer: `${셈.a}`,
        wrongs: 셈.w.map(String),
        tag: 'solid',
        strategy: '구성 요소의 수로 계산하기',
        hint: '면 6개, 모서리 12개, 꼭짓점 8개를 먼저 적어 놓고 계산하세요.',
        steps: [
          '직육면체는 면이 6개, 모서리가 12개, 꼭짓점이 8개입니다.',
          `${eul(셈.q)} 구하면 ${셈.a}입니다.`,
        ],
        visual: boxPicture('직육면체', seed + 17),
      };
    },
  },
];

// ── 3차시 직육면체에는 어떤 성질이 있을까요 ─────────────────────────
// 지도서: 계속 늘여도 만나지 않는 두 면을 서로 평행하다고 하고, 이 두
// 면이 밑면입니다. 밑면과 수직인 면이 옆면이고, 한 밑면에 대한 옆면은
// 4개입니다. 평행한 면은 3쌍이고 어느 쌍이든 밑면이 될 수 있습니다.

const 면차례: BoxFace[] = ALL_FACES;

const 면고르기 = (seed: number) => 면차례[Math.abs(seed) % 면차례.length];

/** 답이 아닌 면 이름 셋입니다. */
const 다른면이름 = (기준: BoxFace, 답: BoxFace, seed: number): string[] => {
  const 남은 = 면차례.filter((one) => one !== 답);
  const next = rand(seed);
  const 섞은 = [...남은];
  for (let at = 섞은.length - 1; at > 0; at -= 1) {
    const to = next(at + 1);
    [섞은[at], 섞은[to]] = [섞은[to], 섞은[at]];
  }
  // 기준이 되는 면은 오답으로 꼭 넣습니다. 스스로와 평행하다거나
  // 수직이라고 생각하는 아이가 있습니다.
  const 고른 = [기준, ...섞은.filter((one) => one !== 기준)].slice(0, 3);
  return 고른.map(faceName);
};

export const unit5Lesson3: G5Family[] = [
  {
    id: 'parallel-face',
    make: (seed) => {
      const 기준 = 면고르기(seed);
      const 답 = OPPOSITE[기준];
      return {
        prompt: `그림의 직육면체에서 색칠한 ${gwa(faceName(기준))} 평행한 면은 어느 것일까요?`,
        answer: faceName(답),
        wrongs: 다른면이름(기준, 답, seed),
        tag: 'solid',
        strategy: '평행한 면 찾기',
        hint: '색칠한 면을 계속 늘여도 만나지 않는 면을 찾으세요. 색칠한 면과 마주 보는 면입니다.',
        steps: [
          '직육면체에서 계속 늘여도 만나지 않는 두 면을 서로 평행하다고 합니다.',
          `${gwa(faceName(기준))} 마주 보는 면을 찾습니다.`,
          `${gwa(faceName(기준))} 평행한 면은 ${faceName(답)}입니다.`,
        ],
        visual: boxPicture('직육면체', seed + 3, { labelVertices: true, shaded: [기준] }),
        misconceptionTip: '평행한 면은 마주 보는 면입니다. 옆에서 만나는 면은 평행하지 않습니다.',
      };
    },
  },
  {
    id: 'not-perpendicular',
    make: (seed) => {
      const 기준 = 면고르기(seed + 1);
      const 답 = OPPOSITE[기준];
      const 수직면 = perpendicularTo(기준);
      const next = rand(seed);
      const 섞은 = [...수직면];
      for (let at = 섞은.length - 1; at > 0; at -= 1) {
        const to = next(at + 1);
        [섞은[at], 섞은[to]] = [섞은[to], 섞은[at]];
      }
      return {
        prompt: `그림의 직육면체에서 색칠한 ${gwa(faceName(기준))} 수직인 면이 아닌 것은 어느 것일까요?`,
        answer: faceName(답),
        wrongs: 섞은.slice(0, 3).map(faceName),
        tag: 'solid',
        strategy: '수직인 면과 그렇지 않은 면 가리기',
        hint: '색칠한 면과 만나는 면은 모두 수직입니다. 만나지 않는 면이 하나 있습니다.',
        steps: [
          '직육면체에서 서로 만나는 두 면은 수직으로 만납니다.',
          `${gwa(faceName(기준))} 만나지 않는 면은 마주 보는 면 하나뿐입니다.`,
          `그 면은 ${iJosa(faceName(답))}므로 수직인 면이 아닙니다.`,
        ],
        visual: boxPicture('직육면체', seed + 8, { labelVertices: true, shaded: [기준] }),
      };
    },
  },
  {
    id: 'perpendicular-count',
    make: (seed) => {
      const 기준 = 면고르기(seed + 2);
      return {
        prompt: `그림의 직육면체에서 색칠한 ${gwa(faceName(기준))} 수직인 면은 모두 몇 개일까요?`,
        answer: '4개',
        wrongs: ['2개', '3개', '5개', '6개'],
        tag: 'solid',
        strategy: '수직인 면의 개수 세기',
        hint: '여섯 면 가운데 색칠한 면 자신과, 그 면과 마주 보는 면을 빼고 세어 보세요.',
        steps: [
          '직육면체의 면은 모두 6개입니다.',
          `${faceName(기준)} 자신과, 그 면과 평행한 면 1개는 수직인 면이 아닙니다.`,
          '6 - 1 - 1 = 4이므로 수직인 면은 4개입니다.',
        ],
        visual: boxPicture('직육면체', seed + 9, { labelVertices: true, shaded: [기준] }),
      };
    },
  },
  {
    id: 'base-side-meaning',
    make: (seed) => {
      const 하나 = [
        {
          q: '직육면체에서 계속 늘여도 만나지 않는 두 면을 무엇이라고 할까요?',
          a: '밑면',
          w: ['옆면', '모서리', '꼭짓점'],
          why: '계속 늘여도 만나지 않는 두 면은 서로 평행하고, 이 두 면을 밑면이라고 합니다.',
        },
        {
          q: '직육면체에서 밑면과 수직인 면을 무엇이라고 할까요?',
          a: '옆면',
          w: ['밑면', '모서리', '겨냥도'],
          why: '한 밑면에 수직으로 만나는 면을 옆면이라고 합니다.',
        },
        {
          q: '직육면체에서 서로 만나는 두 면은 어떻게 만날까요?',
          a: '수직으로 만납니다.',
          w: ['평행하게 만납니다.', '비스듬히 만납니다.', '만나는 방법이 면마다 다릅니다.'],
          why: '직육면체의 면은 모두 직사각형이므로 서로 만나는 두 면은 늘 수직으로 만납니다.',
        },
        {
          q: '직육면체에서 서로 평행한 두 면은 어떻게 만날까요?',
          a: '만나지 않습니다.',
          w: ['수직으로 만납니다.', '한 점에서 만납니다.', '한 모서리에서 만납니다.'],
          why: '평행한 두 면은 계속 늘여도 만나지 않습니다.',
        },
      ][Math.abs(seed) % 4];
      return {
        prompt: 하나.q,
        answer: 하나.a,
        wrongs: 하나.w,
        tag: 'solid',
        strategy: '밑면과 옆면의 뜻 알기',
        hint: '두 면이 만나는지 만나지 않는지부터 가려 보세요.',
        steps: 답으로맺기(하나.why, 하나.a),
        visual: boxPicture('직육면체', seed + 15),
      };
    },
  },
  {
    id: 'pair-count',
    make: (seed) => {
      const 하나 = [
        {
          q: '직육면체에서 서로 평행한 두 면은 모두 몇 쌍일까요?',
          a: '3쌍',
          w: ['1쌍', '2쌍', '6쌍'],
          why: '여섯 면이 둘씩 마주 보므로 평행한 면은 3쌍입니다.',
        },
        {
          q: '직육면체에서 한 밑면에 대한 옆면은 모두 몇 개일까요?',
          a: '4개',
          w: ['2개', '3개', '6개'],
          why: '밑면 2개를 뺀 나머지 4개가 모두 옆면입니다.',
        },
        {
          q: '직육면체에서 밑면이 될 수 있는 면은 모두 몇 쌍일까요?',
          a: '3쌍',
          w: ['1쌍', '2쌍', '4쌍'],
          why: '평행한 면 3쌍은 어느 쌍이든 밑면이 될 수 있습니다.',
        },
      ][Math.abs(seed) % 3];
      return {
        prompt: 하나.q,
        answer: 하나.a,
        wrongs: 하나.w,
        tag: 'solid',
        strategy: '평행한 면과 옆면의 개수 세기',
        hint: '여섯 면을 마주 보는 것끼리 둘씩 묶어 보세요.',
        steps: ['직육면체의 면은 모두 6개입니다.', 하나.why],
        visual: boxPicture('직육면체', seed + 21),
      };
    },
  },
  {
    id: 'base-misread',
    make: (seed) => {
      const 하나 = [
        {
          q: '직육면체에서 밑면은 반드시 아래에 있는 면일까요?',
          a: '아닙니다. 기준으로 정한 평행한 두 면이 밑면입니다.',
          w: [
            '맞습니다. 바닥에 닿은 면만 밑면입니다.',
            '맞습니다. 밑면은 언제나 1개입니다.',
            '아닙니다. 옆면도 밑면이라고 합니다.',
          ],
          why: '직육면체를 돌리면 어느 면이든 아래에 올 수 있으므로, 밑면은 아래라는 위치가 아니라 평행한 두 면을 가리킵니다.',
        },
        {
          q: '직육면체에서 밑면은 모두 몇 개일까요?',
          a: '2개',
          w: ['1개', '3개', '4개'],
          why: '밑면은 서로 평행한 두 면이므로 한 번에 2개입니다.',
        },
        {
          q: '직육면체를 옆으로 눕히면 밑면은 어떻게 될까요?',
          a: '눕힌 방향에 따라 다른 면이 밑면이 될 수 있습니다.',
          w: [
            '밑면은 처음 그대로입니다.',
            '밑면이 없어집니다.',
            '밑면이 4개로 늘어납니다.',
          ],
          why: '평행한 면 3쌍은 어느 쌍이든 밑면이 될 수 있으므로, 놓는 방향에 따라 밑면이 달라집니다.',
        },
      ][Math.abs(seed) % 3];
      return {
        prompt: 하나.q,
        answer: 하나.a,
        wrongs: 하나.w,
        tag: 'solid',
        strategy: '밑면의 뜻을 바르게 알기',
        hint: '밑면은 자리를 말하는 것이 아니라 두 면 사이의 관계를 말합니다.',
        steps: 답으로맺기(하나.why, 하나.a),
        misconceptionTip: '밑면을 아랫면으로만 알면 밑면이 1개라고 생각하게 됩니다. 밑면은 평행한 두 면입니다.',
      };
    },
  },
  {
    id: 'base-then-side',
    make: (seed) => {
      const 기준 = 면고르기(seed + 4);
      const 답 = OPPOSITE[기준];
      return {
        prompt: `그림의 직육면체에서 색칠한 ${eul(faceName(기준))} 한 밑면으로 정했습니다. 옆면이 아닌 면은 어느 것일까요?`,
        answer: faceName(답),
        wrongs: perpendicularTo(기준).slice(0, 3).map(faceName),
        tag: 'solid',
        strategy: '밑면을 정하고 옆면 가리기',
        hint: '밑면으로 정한 면과 마주 보는 면도 밑면입니다. 밑면은 옆면이 아닙니다.',
        steps: [
          `${eul(faceName(기준))} 한 밑면으로 정하면, 그 면과 평행한 ${iJosa(faceName(답))} 다른 밑면입니다.`,
          '밑면과 수직으로 만나는 나머지 4개가 옆면입니다.',
          `그러므로 옆면이 아닌 면은 ${faceName(답)}입니다.`,
        ],
        visual: boxPicture('직육면체', seed + 25, { labelVertices: true, shaded: [기준] }),
      };
    },
  },
  {
    id: 'two-shaded',
    make: (seed) => {
      const 기준 = 면고르기(seed + 6);
      const next = rand(seed);
      const 평행인가 = Math.abs(seed) % 2 === 0;
      const 짝 = 평행인가 ? OPPOSITE[기준] : perpendicularTo(기준)[next(4)];
      return {
        prompt: `그림의 직육면체에서 파란색으로 칠한 면과 주황색으로 칠한 면은 서로 어떤 관계일까요?`,
        answer: 평행인가 ? '서로 평행합니다.' : '서로 수직으로 만납니다.',
        wrongs: [
          평행인가 ? '서로 수직으로 만납니다.' : '서로 평행합니다.',
          '한 점에서만 만납니다.',
          '길이가 같은 두 면입니다.',
        ],
        tag: 'solid',
        strategy: '두 면의 관계 말하기',
        hint: '두 면이 한 모서리에서 맞닿아 있는지, 아니면 마주 보고 떨어져 있는지 보세요.',
        steps: [
          '직육면체에서 마주 보는 두 면은 평행하고, 만나는 두 면은 수직입니다.',
          평행인가
            ? '두 면은 마주 보고 있어 계속 늘여도 만나지 않습니다.'
            : '두 면은 한 모서리에서 맞닿아 있습니다.',
          평행인가 ? '그러므로 서로 평행합니다.' : '그러므로 서로 수직으로 만납니다.',
        ],
        visual: boxPicture('직육면체', seed + 31, { labelVertices: true, shaded: [기준], shaded2: [짝] }),
      };
    },
  },
];

// ── 4차시 정육면체는 무엇일까요 ─────────────────────────────────────

export const unit5Lesson4: G5Family[] = [
  {
    id: 'cube-meaning',
    make: (seed) => {
      const 거꾸로 = Math.abs(seed) % 2 === 0;
      if (거꾸로) {
        return {
          prompt: '정사각형 6개로 둘러싸인 도형을 무엇이라고 할까요?',
          answer: '정육면체',
          wrongs: ['직육면체', '정사각형', '평면도형'],
          tag: 'solid',
          strategy: '정육면체의 뜻 알기',
          hint: '둘러싼 도형이 직사각형인지 정사각형인지를 보세요.',
          steps: ['정사각형 6개로 둘러싸인 도형을 정육면체라고 합니다.'],
          visual: cubePicture('입체도형'),
        };
      }
      return {
        prompt: '정육면체는 어떤 도형일까요?',
        answer: '정사각형 6개로 둘러싸인 도형',
        wrongs: ['직사각형 6개로 둘러싸인 도형', '정사각형 4개로 둘러싸인 도형', '정사각형 6개를 늘어놓은 평면도형'],
        tag: 'solid',
        strategy: '정육면체의 뜻 알기',
        hint: '둘러싼 도형의 이름과 그 개수를 함께 말해야 합니다.',
        steps: ['정육면체는 정사각형 6개로 둘러싸인 도형입니다.'],
        visual: cubePicture('입체도형'),
      };
    },
  },
  {
    id: 'cube-face-shape',
    make: (seed) => {
      const 하나 = [
        {
          q: '정육면체의 면은 어떤 모양일까요?',
          a: '정사각형',
          w: ['직사각형이지만 정사각형은 아닌 모양', '마름모', '평행사변형'],
          why: '정육면체는 정사각형 6개로 둘러싸여 있으므로 여섯 면이 모두 정사각형입니다.',
        },
        {
          q: '정육면체의 모서리의 길이는 어떠할까요?',
          a: '열두 모서리의 길이가 모두 같습니다.',
          w: ['서로 다른 길이가 세 가지 있습니다.', '마주 보는 모서리만 길이가 같습니다.', '길이를 알 수 없습니다.'],
          why: '여섯 면이 모두 같은 정사각형이므로 열두 모서리의 길이가 모두 같습니다.',
        },
        {
          q: '정육면체와 직육면체에서 같은 점은 무엇일까요?',
          a: '면, 모서리, 꼭짓점의 수가 같습니다.',
          w: ['면의 모양이 같습니다.', '모서리의 길이가 같습니다.', '면의 크기가 같습니다.'],
          why: '둘 다 면이 6개, 모서리가 12개, 꼭짓점이 8개입니다. 다른 점은 면의 모양입니다.',
        },
        {
          q: '정육면체와 직육면체에서 다른 점은 무엇일까요?',
          a: '정육면체는 여섯 면이 모두 정사각형입니다.',
          w: ['정육면체는 면이 더 많습니다.', '정육면체는 꼭짓점이 더 적습니다.', '정육면체는 모서리가 더 많습니다.'],
          why: '면, 모서리, 꼭짓점의 수는 같고 면의 모양이 다릅니다.',
        },
      ][Math.abs(seed) % 4];
      return {
        prompt: 하나.q,
        answer: 하나.a,
        wrongs: 하나.w,
        tag: 'solid',
        strategy: '정육면체의 특징 알기',
        hint: '정육면체를 둘러싼 여섯 면이 서로 어떠한지, 직육면체와 견주어 무엇이 다른지 짚어 보세요.',
        steps: 답으로맺기(하나.why, 하나.a),
        visual: cubePicture('입체도형'),
      };
    },
  },
  {
    id: 'cube-part-count',
    make: (seed) => {
      const 하나 = 구성요소[Math.abs(seed) % 3];
      const 보이는것: Record<string, number> = { 면: 3, 모서리: 9, 꼭짓점: 7 };
      return {
        prompt: `정육면체에서 ${eun(하나.이름)} 모두 몇 개일까요?`,
        answer: `${하나.수}개`,
        wrongs: [`${보이는것[하나.이름]}개`, `${하나.수 + 2}개`, `${하나.수 - 2}개`, '4개'],
        tag: 'solid',
        strategy: '정육면체의 구성 요소 개수 세기',
        hint: '정육면체도 직육면체이므로 구성 요소의 수는 직육면체와 같습니다.',
        steps: [
          '정육면체는 직육면체 가운데 여섯 면이 모두 정사각형인 것입니다.',
          `그러므로 구성 요소의 수가 직육면체와 같아 ${eun(하나.이름)} ${하나.수}개입니다.`,
        ],
        visual: cubePicture('입체도형'),
      };
    },
  },
  {
    id: 'cube-is-box',
    make: (seed) => {
      const 하나 = [
        {
          q: '정육면체는 직육면체라고 할 수 있을까요?',
          a: '할 수 있습니다.',
          why: '정사각형은 직사각형이므로, 정사각형 6개로 둘러싸인 정육면체는 직사각형 6개로 둘러싸인 직육면체입니다.',
        },
        {
          q: '직육면체는 모두 정육면체라고 할 수 있을까요?',
          a: '할 수 없습니다.',
          why: '직육면체 중에는 면이 정사각형이 아닌 것이 있습니다.',
        },
      ][Math.abs(seed) % 2];
      return {
        prompt: 하나.q,
        answer: 하나.a,
        wrongs: [
          하나.a === '할 수 있습니다.' ? '할 수 없습니다.' : '할 수 있습니다.',
          '면의 수가 같을 때만 할 수 있습니다.',
          '눕혀 놓았을 때만 할 수 있습니다.',
        ],
        tag: 'solid',
        strategy: '정육면체와 직육면체의 관계 알기',
        hint: '정사각형과 직사각형의 관계를 그대로 옮겨 생각해 보세요.',
        steps: [하나.why, `그러므로 ${하나.a}`],
        misconceptionTip: '정육면체는 직육면체의 특별한 경우입니다. 방향을 바꾸면 성립하지 않습니다.',
      };
    },
  },
  {
    id: 'cube-edge-total',
    make: (seed) => {
      const next = rand(seed);
      const 한변 = 3 + next(12);
      return {
        prompt: `한 모서리의 길이가 ${한변} cm인 정육면체가 있습니다. 모든 모서리의 길이의 합은 몇 cm일까요?`,
        answer: `${한변 * 12} cm`,
        wrongs: [`${한변 * 8} cm`, `${한변 * 6} cm`, `${한변 * 4} cm`, `${한변 * 12 + 한변} cm`],
        tag: 'solid',
        strategy: '모든 모서리의 길이의 합 구하기',
        hint: '정육면체의 모서리는 몇 개이고, 그 길이는 모두 같은지 먼저 확인하세요.',
        steps: [
          '정육면체의 모서리는 12개이고 길이가 모두 같습니다.',
          `${한변} × 12 = ${한변 * 12}`,
          `모든 모서리의 길이의 합은 ${한변 * 12} cm입니다.`,
        ],
        visual: cubePicture('정육면체', { edgeLabels: { width: `${한변} cm` } }),
        misconceptionTip: '모서리는 12개입니다. 꼭짓점 8개나 면 6개를 곱하지 마세요.',
      };
    },
  },
  {
    id: 'cube-edge-one',
    make: (seed) => {
      const next = rand(seed);
      const 한변 = 2 + next(10);
      const 합 = 한변 * 12;
      return {
        prompt: `모든 모서리의 길이의 합이 ${합} cm인 정육면체가 있습니다. 한 모서리의 길이는 몇 cm일까요?`,
        answer: `${한변} cm`,
        wrongs: [`${한변 * 2} cm`, `${한변 * 3} cm`, `${한변 + 1} cm`, `${한변 + 2} cm`],
        tag: 'solid',
        strategy: '모서리 길이의 합에서 한 모서리 구하기',
        hint: '길이가 모두 같은 모서리가 몇 개인지 세고, 그 수로 나누세요.',
        steps: [
          '정육면체의 모서리는 12개이고 길이가 모두 같습니다.',
          `${합} ÷ 12 = ${한변}`,
          `한 모서리의 길이는 ${한변} cm입니다.`,
        ],
        visual: cubePicture('정육면체'),
      };
    },
  },
  {
    id: 'cube-around-us',
    make: (seed) => {
      const 물건 = ['주사위', '각설탕', '큐브'][Math.abs(seed) % 3];
      const 하나 = 구성요소[Math.abs(seed + 1) % 3];
      return {
        prompt: `${eun(물건)} 정육면체 모양입니다. ${물건}의 ${eun(하나.이름)} 모두 몇 개일까요?`,
        answer: `${하나.수}개`,
        wrongs: [`${하나.수 + 2}개`, `${하나.수 - 2}개`, `${하나.수 + 4}개`, '4개'],
        tag: 'solid',
        strategy: '실생활 물건에서 구성 요소 세기',
        hint: '정육면체 모양이면 크기가 달라도 구성 요소의 수는 늘 같습니다.',
        steps: [
          `${eun(물건)} 정육면체 모양이므로 정육면체의 구성 요소 수와 같습니다.`,
          `정육면체의 ${eun(하나.이름)} ${하나.수}개입니다.`,
        ],
      };
    },
  },
  {
    id: 'cube-sort',
    make: (seed) => {
      const next = rand(seed);
      // 가로·세로·높이를 주고 정육면체인지 가립니다.
      const 정육면체인가 = Math.abs(seed) % 2 === 0;
      const 한변 = 3 + next(6);
      const 가로 = 한변;
      const 세로 = 정육면체인가 ? 한변 : 한변 + 1 + next(3);
      const 높이 = 정육면체인가 ? 한변 : 한변 + 2 + next(2);
      return {
        prompt: `가로가 ${가로} cm, 세로가 ${세로} cm, 높이가 ${높이} cm인 직육면체가 있습니다. 이 직육면체는 정육면체일까요?`,
        answer: 정육면체인가 ? '정육면체입니다.' : '정육면체가 아닙니다.',
        wrongs: [
          정육면체인가 ? '정육면체가 아닙니다.' : '정육면체입니다.',
          '가로와 세로만 같으면 정육면체입니다.',
          '높이가 가장 길면 정육면체입니다.',
        ],
        tag: 'solid',
        strategy: '정육면체인지 가리기',
        hint: '여섯 면이 모두 정사각형이 되려면 가로, 세로, 높이가 어떠해야 하는지 생각해 보세요.',
        steps: [
          '정육면체는 여섯 면이 모두 정사각형이므로 가로, 세로, 높이가 모두 같아야 합니다.',
          정육면체인가
            ? `${가로} cm, ${세로} cm, ${높이} cm가 모두 같습니다.`
            : `${가로} cm, ${세로} cm, ${높이} cm가 모두 같지는 않습니다.`,
          `그러므로 ${정육면체인가 ? '정육면체입니다' : '정육면체가 아닙니다'}.`,
        ],
      };
    },
  },
];
