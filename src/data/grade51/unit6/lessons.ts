import type { G5Family, G5Spec } from '../../grade5/build';
import type { FigureShapeName, QuestionVisual } from '../../../types';
import { particleOf, pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 6단원 다각형의 둘레와 넓이 — 1~9차시
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   2~3 다각형의 둘레  4 1 cm²  5 직사각형의 넓이  6 1 m²와 1 km²
//   7~8 평행사변형  9~10 삼각형  11~12 사다리꼴  13 마름모
//
// 지도서가 못박아 둔 것:
//   · "넓이 단위 사이의 관계 중 1 cm², 1 km² 사이의 단위 환산은 다루지
//     않는다." 그래서 cm²↔m²와 m²↔km²만 묻습니다.
//   · "삼각형의 넓이를 구할 때는 높이가 삼각형의 외부에 있는 것도
//     다룬다." 그래서 둔각삼각형을 따로 둡니다.
//
// 넓이 문항에서 아이가 가장 많이 하는 실수는 높이 대신 비스듬한 변의
// 길이를 쓰는 것입니다. 길이를 글로만 주면 그 실수를 막을 수도, 겨눌
// 수도 없습니다. 그래서 그림에 높이를 점선과 직각 표시로 긋고, 비스듬한
// 변의 길이도 함께 적어 둡니다 — 어느 쪽을 써야 하는지가 이 단원의
// 물음이기 때문입니다.
// ════════════════════════════════════════════════════════════════════

type Item = NonNullable<Extract<QuestionVisual, { kind: 'figure-set' }>['items']>[number];

const 그림 = (label: string, items: Item[]): QuestionVisual => ({
  kind: 'figure-set',
  label,
  items,
});

const 정다각형이름: Record<number, string> = {
  3: '정삼각형',
  4: '정사각형',
  5: '정오각형',
  6: '정육각형',
};

const 정다각형모양: Record<number, FigureShapeName> = {
  3: '정삼각형',
  4: '정사각형',
  5: '정오각형',
  6: '정육각형',
};

// ── 1차시 단원 도입 ─────────────────────────────────────────────────
// 4학년에서 배운 도형의 이름과 길이 단위를 떠올립니다. 아직 '넓이'라는
// 말은 쓰지 않습니다 — 넓이의 단위는 3차시에서 처음 나옵니다.
export const unit6Lesson1 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 기본뭉치: G5Family[] = [
  {
    id: 'name-shape',
    make: (seed) => {
      const 고를것: Array<{ shape: FigureShapeName; name: string; 설명: string }> = [
        { shape: '평행사변형', name: '평행사변형', 설명: '마주 보는 두 쌍의 변이 서로 평행한 사각형' },
        { shape: '마름모', name: '마름모', 설명: '네 변의 길이가 모두 같은 사각형' },
        { shape: '사다리꼴', name: '사다리꼴', 설명: '평행한 변이 한 쌍이라도 있는 사각형' },
        { shape: '직사각형', name: '직사각형', 설명: '네 각이 모두 직각인 사각형' },
        { shape: '정육각형', name: '정육각형', 설명: '변의 길이가 모두 같고 각의 크기도 모두 같은 육각형' },
      ];
      const 답 = pick(고를것, seed);
      const wrongs = 고를것.filter((one) => one.name !== 답.name).map((one) => one.name);
      return {
        prompt: `${답.설명}${particleOf(답.설명, '을')} 무엇이라고 할까요?`,
        answer: 답.name,
        wrongs,
        tag: 'area',
        concept: '도형의 이름은 변과 각에 어떤 조건이 붙어 있는지로 정해집니다.',
        strategy: '앞서 배운 도형의 이름 떠올리기',
        hint: '변의 길이가 조건인지, 각의 크기가 조건인지, 평행한 변이 조건인지 보세요.',
        steps: [`${답.설명}${particleOf(답.설명, '은')} ${답.name}입니다.`],
        visual: 그림(`${답.name} 그림`, [{ shape: 답.shape, active: true }]),
        misconceptionTip: '비슷해 보인다고 같은 도형이 아닙니다. 조건을 하나씩 확인하세요.',
        selfCheck: '고른 도형이 설명의 조건을 모두 갖추었나요?',
      };
    },
  },
  {
    id: 'length-unit',
    make: (seed) => {
      const 고를것 = [
        { 물건: '연필 한 자루의 길이', 답: 'cm' },
        { 물건: '교실 한 칸의 가로 길이', 답: 'm' },
        { 물건: '학교에서 시청까지의 거리', 답: 'km' },
        { 물건: '수학책의 두께', 답: 'mm' },
      ];
      const 하나 = pick(고를것, seed);
      return {
        prompt: `${하나.물건}${particleOf(하나.물건, '을')} 재기에 가장 알맞은 단위는 어느 것일까요?`,
        answer: 하나.답,
        wrongs: ['mm', 'cm', 'm', 'km'].filter((one) => one !== 하나.답),
        tag: 'area',
        concept: '재려는 것의 크기에 맞는 단위를 골라야 수가 읽기 쉬워집니다.',
        strategy: '알맞은 길이 단위 고르기',
        hint: '그 단위로 재었을 때 수가 너무 커지거나 너무 작아지지 않는 쪽을 고르세요.',
        steps: [`${하나.물건}${particleOf(하나.물건, '은')} ${하나.답}로 재는 것이 알맞습니다.`],
        misconceptionTip: '단위가 작을수록 좋은 것이 아닙니다. 수가 읽기 쉬운 단위를 고릅니다.',
        selfCheck: '그 단위로 재면 수가 몇 자리쯤 되나요?',
      };
    },
  },
  {
    id: 'count-sides',
    make: (seed) => {
      const next = rand(seed + 11);
      const 변수 = pick([3, 4, 5, 6], seed);
      const 물음 = next(2) === 0;
      if (물음) {
        return {
          prompt: `${정다각형이름[변수]}의 변은 모두 몇 개일까요?`,
          answer: `${변수}개`,
          wrongs: [3, 4, 5, 6, 8].filter((one) => one !== 변수).map((one) => `${one}개`),
          tag: 'area',
          concept: '정다각형의 이름에 그 도형의 변의 수가 들어 있습니다.',
          strategy: '앞서 배운 정다각형 떠올리기',
          hint: '이름의 가운데 글자가 변의 수를 말해 줍니다 — 삼, 사, 오, 육.',
          steps: [`${정다각형이름[변수]}은 변이 ${변수}개인 정다각형입니다.`],
          visual: 그림(`${정다각형이름[변수]} 그림`, [{ shape: 정다각형모양[변수], active: true }]),
          misconceptionTip: '변의 수와 꼭짓점의 수는 같습니다. 둘을 다르게 세지 마세요.',
          selfCheck: '그림에서 변을 하나씩 짚어 세어 보았나요?',
        };
      }
      return {
        prompt: `변이 ${변수}개이고 변의 길이가 모두 같으며 각의 크기도 모두 같은 도형을 무엇이라고 할까요?`,
        answer: 정다각형이름[변수],
        wrongs: [3, 4, 5, 6].filter((one) => one !== 변수).map((one) => 정다각형이름[one]),
        tag: 'area',
        concept: '변의 길이가 모두 같고 각의 크기도 모두 같은 다각형을 정다각형이라고 합니다.',
        strategy: '앞서 배운 정다각형 떠올리기',
        hint: '변의 수를 먼저 보세요. 이름의 가운데 글자가 변의 수입니다.',
        steps: [`변이 ${변수}개인 정다각형은 ${정다각형이름[변수]}입니다.`],
        visual: 그림(`${정다각형이름[변수]} 그림`, [{ shape: 정다각형모양[변수], active: true }]),
        misconceptionTip: '변의 길이만 같아서는 정다각형이 아닙니다. 각의 크기도 모두 같아야 합니다.',
        selfCheck: '변의 수와 이름이 맞나요?',
      };
    },
  },
  {
    id: 'parallel-or-perpendicular',
    make: (seed) => {
      const 고를것 = [
        { 도형: '직사각형', 물음: '마주 보는 두 변', 답: '서로 평행합니다.' },
        { 도형: '직사각형', 물음: '이웃한 두 변', 답: '서로 수직입니다.' },
        { 도형: '평행사변형', 물음: '마주 보는 두 변', 답: '서로 평행합니다.' },
        { 도형: '정사각형', 물음: '이웃한 두 변', 답: '서로 수직입니다.' },
      ];
      const 하나 = pick(고를것, seed);
      return {
        prompt: `${하나.도형}에서 ${하나.물음}은 어떤 관계일까요?`,
        answer: 하나.답,
        wrongs: [
          하나.답 === '서로 평행합니다.' ? '서로 수직입니다.' : '서로 평행합니다.',
          '길이가 서로 다릅니다.',
          '한 점에서 만납니다.',
        ],
        tag: 'area',
        concept: '평행은 만나지 않는 것이고, 수직은 직각으로 만나는 것입니다.',
        strategy: '앞서 배운 수직과 평행 떠올리기',
        hint: '두 변을 길게 늘여 보세요. 만나지 않으면 평행, 직각으로 만나면 수직입니다.',
        steps: [`${하나.도형}에서 ${하나.물음}${particleOf(하나.물음, '은')} ${하나.답}`],
        misconceptionTip: '평행과 수직을 바꾸어 말하지 마세요. 평행한 두 변은 아무리 늘여도 만나지 않습니다.',
        selfCheck: '두 변을 늘였을 때 만나나요?',
      };
    },
  },
  {
    id: 'perpendicular',
    make: (seed) => {
      const next = rand(seed + 5);
      const a = 2 + next(8);
      const b = 2 + next(8);
      return {
        prompt: `가로가 ${a} cm, 세로가 ${b} cm인 직사각형이 있습니다. 이 직사각형에서 서로 수직인 두 변의 길이를 더하면 몇 cm일까요?`,
        answer: `${a + b} cm`,
        wrongs: [`${a * b} cm`, `${(a + b) * 2} cm`, `${a * 2} cm`, `${Math.abs(a - b)} cm`],
        tag: 'area',
        concept: '직사각형에서 가로와 세로는 서로 수직입니다.',
        strategy: '앞서 배운 수직과 평행 떠올리기',
        hint: '수직은 두 변이 직각으로 만나는 것입니다. 직사각형에서 이웃한 두 변이 그렇습니다.',
        steps: [
          '직사각형의 네 각은 모두 직각이므로 이웃한 두 변은 서로 수직입니다.',
          `${a}+${b}=${a + b}(cm)`,
        ],
        misconceptionTip: '수직인 두 변은 이웃한 변입니다. 마주 보는 두 변은 평행합니다.',
        selfCheck: '고른 두 변이 직각으로 만나나요?',
      };
    },
  },
  ];

  // 이 차시는 앞 학년에서 배운 것을 떠올리는 자리라, 말의 뜻을 묻는
  // 뭉치가 대부분입니다. 그런 뭉치는 뽑을 것이 넷다섯뿐이어서 세
  // 수준이 나란히 쓰면 서른 자리가 같은 문항으로 찹니다 — 하와 상이
  // 스물둘을 똑같이 내고 있었습니다. 그래서 수를 주고 재거나 세게 하는
  // 뭉치를 새로 씁니다.
  const 범위 = 쓸수(difficulty);

  // 길이의 단위를 바꿉니다(3학년). 넓이의 단위는 3차시에서 처음이므로
  // 여기서는 길이만 다룹니다.
  const 길이바꾸기: G5Family = {
    id: 'length-convert',
    make: (seed) => {
      const next = rand(seed + 31);
      const k = 1 + next(범위.작은 + 범위.폭);
      const m쪽 = next(2) === 0;
      const 큰단위 = m쪽 ? 'm' : 'km';
      const 작은단위 = m쪽 ? 'cm' : 'm';
      const 배 = m쪽 ? 100 : 1000;
      return {
        prompt: `${k} ${큰단위}는 몇 ${작은단위}일까요?`,
        answer: `${k * 배} ${작은단위}`,
        wrongs: [
          `${k * (배 / 10)} ${작은단위}`,
          `${k * 배 * 10} ${작은단위}`,
          `${k + 배} ${작은단위}`,
          `${k} ${작은단위}`,
        ],
        tag: 'area',
        concept: m쪽 ? '1 m=100 cm' : '1 km=1000 m',
        strategy: '길이의 단위 바꾸기',
        hint: m쪽 ? '1 m가 몇 cm인지 먼저 떠올리세요.' : '1 km가 몇 m인지 먼저 떠올리세요.',
        steps: [
          m쪽 ? '1 m=100 cm입니다.' : '1 km=1000 m입니다.',
          `${k}×${배}=${k * 배}(${작은단위})`,
        ],
        misconceptionTip: '작은 단위로 바꿀 때는 곱합니다. 나누면 값이 작아져 말이 되지 않습니다.',
        selfCheck: '바꾼 값이 처음보다 커졌나요?',
      };
    },
  };

  // 나머지 한 각을 구합니다(4학년). 삼각형은 180도, 사각형은 360도입니다.
  const 남은각: G5Family = {
    id: 'angle-left',
    make: (seed) => {
      const next = rand(seed + 37);
      const 사각형인가 = Math.abs(seed) % 2 === 0;
      const 합 = 사각형인가 ? 360 : 180;
      const 개수 = 사각형인가 ? 4 : 3;
      const 각들: number[] = [];
      for (let at = 0; at < 개수 - 1; at += 1) 각들.push(20 + next(사각형인가 ? 80 : 50));
      const 남은 = 합 - 각들.reduce((sum, one) => sum + one, 0);
      if (남은 < 15 || 남은 > 160) return null;
      return {
        prompt: `${사각형인가 ? '사각형' : '삼각형'}의 ${개수 - 1}개의 각의 크기가 ${각들.join('도, ')}도입니다. 나머지 한 각의 크기는 몇 도일까요?`,
        answer: `${남은}도`,
        wrongs: [`${남은 + 10}도`, `${남은 - 10}도`, `${합 - 남은}도`, `${Math.round(합 / 개수)}도`],
        tag: 'area',
        concept: '삼각형의 세 각의 크기의 합은 180도, 사각형의 네 각의 크기의 합은 360도입니다.',
        strategy: '각의 크기의 합으로 남은 각 구하기',
        hint: `${사각형인가 ? '사각형' : '삼각형'}의 각의 크기의 합이 몇 도인지 먼저 떠올리세요.`,
        steps: [
          `${사각형인가 ? '사각형' : '삼각형'}의 각의 크기의 합은 ${합}도입니다.`,
          `${합}-${각들.join('-')}=${남은}`,
          `나머지 한 각의 크기는 ${남은}도입니다.`,
        ],
        misconceptionTip: '삼각형은 180도, 사각형은 360도입니다. 두 값을 바꾸어 쓰지 마세요.',
        selfCheck: '구한 각을 모두 더하면 합이 맞나요?',
      };
    },
  };

  // 이등변삼각형은 두 밑각이 같다는 조건을 먼저 써야 해서 두 걸음입니다.
  const 이등변각: G5Family = {
    id: 'isosceles-angle',
    make: (seed) => {
      const next = rand(seed + 43);
      const 꼭지각먼저 = Math.abs(seed) % 2 === 0;
      if (꼭지각먼저) {
        const 꼭지각 = 20 + next(6) * 10;
        if ((180 - 꼭지각) % 2 !== 0) return null;
        const 밑각 = (180 - 꼭지각) / 2;
        return {
          prompt: `이등변삼각형의 꼭지각의 크기가 ${꼭지각}도입니다. 한 밑각의 크기는 몇 도일까요?`,
          answer: `${밑각}도`,
          wrongs: [`${180 - 꼭지각}도`, `${꼭지각}도`, `${밑각 + 10}도`, `${Math.max(5, 밑각 - 10)}도`],
          tag: 'area',
          concept: '이등변삼각형은 두 밑각의 크기가 같습니다.',
          strategy: '이등변삼각형의 두 밑각이 같음을 쓰기',
          hint: '세 각의 합에서 꼭지각을 뺀 것을 둘로 나누세요.',
          steps: [
            `두 밑각의 합은 180-${꼭지각}=${180 - 꼭지각}(도)입니다.`,
            '두 밑각의 크기가 같으므로 둘로 나눕니다.',
            `${180 - 꼭지각}÷2=${밑각}이므로 한 밑각은 ${밑각}도입니다.`,
          ],
          misconceptionTip: '두 밑각의 합을 그대로 답하지 마세요. 한 밑각을 물었습니다.',
          selfCheck: '세 각을 모두 더하면 180도가 되나요?',
        };
      }
      const 밑각 = 25 + next(6) * 5;
      const 꼭지각 = 180 - 밑각 * 2;
      if (꼭지각 < 15) return null;
      return {
        prompt: `이등변삼각형의 한 밑각의 크기가 ${밑각}도입니다. 꼭지각의 크기는 몇 도일까요?`,
        answer: `${꼭지각}도`,
        wrongs: [`${밑각}도`, `${180 - 밑각}도`, `${꼭지각 + 10}도`, `${Math.max(5, 꼭지각 - 10)}도`],
        tag: 'area',
        concept: '이등변삼각형은 두 밑각의 크기가 같습니다.',
        strategy: '이등변삼각형의 두 밑각이 같음을 쓰기',
        hint: '밑각이 둘이라는 것을 먼저 쓰세요. 세 각의 합에서 두 밑각을 모두 빼야 합니다.',
        steps: [
          `두 밑각의 합은 ${밑각}×2=${밑각 * 2}(도)입니다.`,
          `180-${밑각 * 2}=${꼭지각}`,
          `꼭지각의 크기는 ${꼭지각}도입니다.`,
        ],
        misconceptionTip: '밑각을 한 번만 빼면 안 됩니다. 밑각은 둘입니다.',
        selfCheck: '세 각을 모두 더하면 180도가 되나요?',
      };
    },
  };

  const 골라 = (ids: string[]) =>
    ids.map((id) => 기본뭉치.find((one) => one.id === id)).filter((one): one is G5Family => Boolean(one));

  if (difficulty === '하') return [...골라(['name-shape', 'count-sides', 'perpendicular']), 길이바꾸기];
  if (difficulty === '중') {
    return [...골라(['length-unit', 'parallel-or-perpendicular', 'perpendicular']), 남은각, 길이바꾸기];
  }
  return [이등변각, 남은각, 길이바꾸기, ...골라(['perpendicular'])];
};

// ── 2차시 다각형의 둘레 ─────────────────────────────────────────────
// 2~5차시에서 쓰는 수의 크기입니다. 세 수준이 같은 범위에서 뽑으면
// 씨앗이 달라도 서른 자리를 채우고 나면 같은 문항이 나옵니다. 수의
// 크기가 수준을 따라 올라가는 것은 그 자체로 난이도이기도 합니다.
const 쓸수 = (수준: '하' | '중' | '상') =>
  수준 === '하' ? { 작은: 2, 폭: 8 } : 수준 === '중' ? { 작은: 7, 폭: 11 } : { 작은: 13, 폭: 15 };

export const unit6Lesson2 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 정다각형둘레: G5Family = {
    id: 'regular-perimeter',
    make: (seed) => {
      const next = rand(seed);
      const 변수 = pick([3, 4, 5, 6], seed);
      const 범위 = 쓸수(difficulty);
      const 한변 = 범위.작은 + next(범위.폭);
      const 둘레 = 한변 * 변수;
      return {
        prompt: `한 변의 길이가 ${한변} cm인 ${정다각형이름[변수]}의 둘레는 몇 cm일까요?`,
        answer: `${둘레} cm`,
        wrongs: [`${한변 * (변수 - 1)} cm`, `${한변 + 변수} cm`, `${한변 * 변수 * 2} cm`, `${한변 * (변수 + 1)} cm`],
        tag: 'area',
        concept: '(정다각형의 둘레)=(한 변의 길이)×(변의 수)',
        strategy: '정다각형의 둘레 구하기',
        hint: '정다각형은 변의 길이가 모두 같습니다. 변이 몇 개인지 먼저 세어 보세요.',
        steps: [
          `${정다각형이름[변수]}의 변은 ${변수}개이고 길이가 모두 같습니다.`,
          `${한변}×${변수}=${둘레}(cm)`,
        ],
        visual: 그림(`${정다각형이름[변수]}의 둘레`, [
          { shape: 정다각형모양[변수], active: true, edgeLabels: [{ from: 0, to: 1, text: `${한변} cm` }] },
        ]),
        misconceptionTip: '변의 수를 잘못 세면 답이 한 변만큼 어긋납니다. 도형의 이름에서 변의 수를 읽으세요.',
        selfCheck: '변의 길이를 변의 수만큼 더한 것과 같나요?',
      };
    },
  };

  const 직사각형둘레: G5Family = {
    id: 'rect-perimeter',
    make: (seed) => {
      const next = rand(seed + 5);
      const 범위 = 쓸수(difficulty);
      const a = 범위.작은 + next(범위.폭);
      const b = 범위.작은 + next(범위.폭);
      if (a === b) return null;
      const 둘레 = (a + b) * 2;
      return {
        prompt: `가로가 ${a} cm, 세로가 ${b} cm인 직사각형의 둘레는 몇 cm일까요?`,
        answer: `${둘레} cm`,
        wrongs: [`${a + b} cm`, `${a * b} cm`, `${a * 2 + b} cm`, `${둘레 + 2} cm`],
        tag: 'area',
        concept: '(직사각형의 둘레)=((가로)+(세로))×2',
        strategy: '직사각형의 둘레 구하기',
        hint: '직사각형은 마주 보는 변의 길이가 같습니다. 가로와 세로가 각각 두 번씩 있습니다.',
        steps: [
          `가로 ${a} cm와 세로 ${b} cm가 각각 2개씩 있습니다.`,
          `(${a}+${b})×2=${둘레}(cm)`,
        ],
        visual: 그림('직사각형의 둘레', [
          {
            shape: '직사각형',
            active: true,
            edgeLabels: [
              { from: 0, to: 1, text: `${a} cm` },
              { from: 1, to: 2, text: `${b} cm` },
            ],
          },
        ]),
        misconceptionTip: '가로와 세로를 한 번씩만 더하면 둘레의 반입니다. 2를 곱해야 합니다.',
        selfCheck: '네 변의 길이를 모두 더한 값과 같나요?',
      };
    },
  };

  const 평행사변형둘레: G5Family = {
    id: 'para-perimeter',
    make: (seed) => {
      const next = rand(seed + 11);
      const 범위 = 쓸수(difficulty);
      const 마름모인가 = next(2) === 0;
      const a = 범위.작은 + 1 + next(범위.폭);
      const b = 마름모인가 ? a : 범위.작은 + 1 + next(범위.폭);
      if (!마름모인가 && a === b) return null;
      const 둘레 = 마름모인가 ? a * 4 : (a + b) * 2;
      const 이름 = 마름모인가 ? '마름모' : '평행사변형';
      return {
        prompt: 마름모인가
          ? `한 변의 길이가 ${a} cm인 마름모의 둘레는 몇 cm일까요?`
          : `이웃한 두 변의 길이가 ${a} cm, ${b} cm인 평행사변형의 둘레는 몇 cm일까요?`,
        answer: `${둘레} cm`,
        wrongs: [`${a + b} cm`, `${a * b} cm`, `${둘레 / 2 + a} cm`, `${둘레 + a} cm`],
        tag: 'area',
        concept: 마름모인가
          ? '(마름모의 둘레)=(한 변의 길이)×4'
          : '(평행사변형의 둘레)=(이웃한 두 변의 길이의 합)×2',
        strategy: `${이름}의 둘레 구하기`,
        hint: 마름모인가
          ? '마름모는 네 변의 길이가 모두 같습니다.'
          : '평행사변형은 마주 보는 두 변의 길이가 같습니다. 서로 다른 길이는 두 가지뿐입니다.',
        steps: 마름모인가
          ? [`마름모는 네 변의 길이가 모두 같습니다.`, `${a}×4=${둘레}(cm)`]
          : [`마주 보는 변의 길이가 같으므로 ${a} cm와 ${b} cm가 각각 2개씩 있습니다.`, `(${a}+${b})×2=${둘레}(cm)`],
        visual: 그림(`${이름}의 둘레`, [
          {
            shape: 마름모인가 ? '마름모' : '평행사변형',
            active: true,
            edgeLabels: 마름모인가
              ? [{ from: 0, to: 1, text: `${a} cm` }]
              : [
                { from: 0, to: 1, text: `${a} cm` },
                { from: 1, to: 2, text: `${b} cm` },
              ],
          },
        ]),
        misconceptionTip: '둘레는 변의 길이를 모두 더한 것입니다. 곱셈으로 줄여 쓸 때 몇 개인지를 맞추세요.',
        selfCheck: '네 변의 길이를 하나씩 더해도 같은 값이 나오나요?',
      };
    },
  };

  const 거꾸로둘레: G5Family = {
    id: 'perimeter-back',
    make: (seed) => {
      const next = rand(seed + 17);
      const 변수 = pick([3, 4, 5, 6], seed);
      const 범위 = 쓸수(difficulty);
      const 한변 = 범위.작은 + next(범위.폭);
      const 둘레 = 한변 * 변수;
      return {
        prompt: `둘레가 ${둘레} cm인 ${정다각형이름[변수]} 모양의 타일이 있습니다. 이 타일의 한 변의 길이는 몇 cm일까요?`,
        answer: `${한변} cm`,
        wrongs: [`${둘레 - 변수} cm`, `${한변 + 1} cm`, `${Math.round(둘레 / (변수 + 1))} cm`, `${둘레} cm`],
        tag: 'area',
        concept: '(한 변의 길이)=(정다각형의 둘레)÷(변의 수)',
        strategy: '둘레를 알 때 한 변의 길이 구하기',
        hint: '둘레는 한 변의 길이를 변의 수만큼 더한 것입니다. 거꾸로 하려면 나누면 됩니다.',
        steps: [
          `${정다각형이름[변수]}의 변은 ${변수}개입니다.`,
          `${둘레}÷${변수}=${한변}(cm)`,
        ],
        misconceptionTip: '둘레에서 변의 수를 빼는 것이 아닙니다. 나누어야 합니다.',
        selfCheck: '구한 길이에 변의 수를 곱하면 둘레가 되나요?',
      };
    },
  };

  if (difficulty === '하') return [정다각형둘레, 직사각형둘레, 평행사변형둘레];
  if (difficulty === '중') return [직사각형둘레, 평행사변형둘레, 거꾸로둘레, 정다각형둘레];
  return [거꾸로둘레, 정다각형둘레, 직사각형둘레, 평행사변형둘레];
};

// ── 3차시 1 cm²는 무엇일까요 ────────────────────────────────────────
export const unit6Lesson3 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 단위뜻: G5Family = {
    id: 'unit-meaning',
    make: () => ({
      prompt: '1 cm²는 어떤 정사각형의 넓이일까요?',
      answer: '한 변의 길이가 1 cm인 정사각형의 넓이',
      wrongs: [
        '한 변의 길이가 1 m인 정사각형의 넓이',
        '둘레가 1 cm인 정사각형의 넓이',
        '네 변의 길이의 합이 1 cm인 정사각형의 넓이',
        '대각선의 길이가 1 cm인 정사각형의 넓이',
      ],
      tag: 'area',
      concept: '넓이의 단위 1 cm²는 한 변의 길이가 1 cm인 정사각형의 넓이입니다.',
      strategy: '넓이의 단위 1 cm² 알기',
      hint: '넓이의 단위는 "한 변이 1인 정사각형"으로 정합니다. 둘레가 아니라 한 변입니다.',
      steps: [
        '넓이를 재려면 기준이 되는 단위가 있어야 합니다.',
        '한 변의 길이가 1 cm인 정사각형의 넓이를 1 cm²라 쓰고 1 제곱센티미터라고 읽습니다.',
      ],
      misconceptionTip: '1 cm²는 둘레가 1 cm인 도형이 아닙니다. 한 변이 1 cm인 정사각형입니다.',
      selfCheck: '한 변이 1 cm인 정사각형을 그려 보았나요?',
    }),
  };

  const 칸세기: G5Family = {
    id: 'count-cells',
    make: (seed) => {
      const next = rand(seed + 3);
      const 모눈 = 쓸수(difficulty);
      const a = 2 + next(Math.min(모눈.폭, 10));
      const b = 2 + Math.floor(모눈.작은 / 2) + next(Math.min(모눈.폭, 10));
      const 넓이 = a * b;
      return {
        prompt: `1 cm²인 정사각형 ${a}칸씩 ${b}줄로 이루어진 도형이 있습니다. 이 도형의 넓이는 몇 cm²일까요?`,
        answer: `${넓이} cm²`,
        wrongs: [`${(a + b) * 2} cm²`, `${a + b} cm²`, `${넓이 + a} cm²`, `${넓이 * 2} cm²`],
        tag: 'area',
        concept: '도형의 넓이는 1 cm²인 정사각형이 몇 개인지로 나타냅니다.',
        strategy: '1 cm²의 개수를 세어 넓이 구하기',
        hint: '한 줄에 몇 칸이 있고 그런 줄이 몇 개인지 세어 곱하면 칸 수를 한 번에 구할 수 있습니다.',
        steps: [
          `한 줄에 ${a}칸씩 ${b}줄이므로 칸은 모두 ${a}×${b}=${넓이}개입니다.`,
          `한 칸이 1 cm²이므로 넓이는 ${넓이} cm²입니다.`,
        ],
        misconceptionTip: '칸의 개수를 세는 것이지 둘레의 길이를 세는 것이 아닙니다.',
        selfCheck: '세어 본 칸 수와 곱해서 구한 값이 같나요?',
      };
    },
  };

  const 왜단위: G5Family = {
    id: 'why-unit',
    make: () => ({
      prompt: '두 도형의 넓이를 비교할 때 서로 다른 크기의 조각으로 세면 어떤 일이 생길까요?',
      answer: '조각의 크기가 달라 개수를 비교해도 어느 것이 더 넓은지 알 수 없습니다.',
      wrongs: [
        '조각의 크기가 달라도 개수가 많은 쪽이 늘 더 넓습니다.',
        '조각의 크기와 상관없이 둘레가 긴 쪽이 더 넓습니다.',
        '조각을 세지 않아도 모양만 보면 알 수 있습니다.',
      ],
      tag: 'area',
      concept: '넓이를 재려면 모두가 같은 크기의 단위를 써야 합니다.',
      strategy: '넓이의 표준 단위가 필요한 까닭 알기',
      hint: '한쪽은 큰 조각으로, 다른 쪽은 작은 조각으로 세었다고 생각해 보세요. 개수만으로 견줄 수 있을까요?',
      steps: [
        '넓은 조각으로 세면 개수가 적고, 좁은 조각으로 세면 개수가 많아집니다.',
        '그래서 개수만으로는 견줄 수 없고, 모두가 같은 단위를 써야 합니다.',
        '그 단위가 1 cm²입니다.',
      ],
      misconceptionTip: '개수가 많다고 더 넓은 것이 아닙니다. 한 조각의 크기가 같아야 견줄 수 있습니다.',
      selfCheck: '같은 크기의 단위로 세었나요?',
    }),
  };

  // ㄱ자 모양처럼 직사각형이 아닌 도형도 칸을 세면 넓이를 알 수
  // 있습니다. 넓이가 '칸의 개수'라는 것을 가장 잘 보여 주는 자리입니다.
  const 조각모양: G5Family = {
    id: 'count-lshape',
    make: (seed) => {
      const next = rand(seed + 7);
      const 모눈 = 쓸수(difficulty);
      const a = 3 + Math.floor(모눈.작은 / 2) + next(Math.min(모눈.폭, 9));
      const b = 2 + Math.floor(모눈.작은 / 3) + next(Math.min(모눈.폭, 8));
      const c = 1 + next(Math.max(1, a - 2));
      const d = 1 + next(Math.max(1, b - 1));
      const 넓이 = a * b - c * d;
      if (넓이 < 4) return null;
      return {
        prompt: `가로 ${a} cm, 세로 ${b} cm인 직사각형에서 가로 ${c} cm, 세로 ${d} cm인 직사각형만큼을 잘라 냈습니다. 남은 도형의 넓이는 몇 cm²일까요?`,
        answer: `${넓이} cm²`,
        wrongs: [`${a * b} cm²`, `${a * b + c * d} cm²`, `${넓이 + c} cm²`, `${c * d} cm²`],
        tag: 'area',
        concept: '넓이는 1 cm²인 칸의 개수이므로, 잘라 낸 만큼 칸도 줄어듭니다.',
        strategy: '조각난 도형의 넓이 구하기',
        hint: '큰 직사각형의 칸 수를 먼저 구하고, 잘라 낸 직사각형의 칸 수를 빼세요.',
        steps: [
          `큰 직사각형의 넓이: ${a}×${b}=${a * b}(cm²)`,
          `잘라 낸 직사각형의 넓이: ${c}×${d}=${c * d}(cm²)`,
          `${a * b}-${c * d}=${넓이}(cm²)`,
        ],
        misconceptionTip: '잘라 낸 만큼은 더하는 것이 아니라 빼는 것입니다.',
        selfCheck: '구한 넓이가 큰 직사각형보다 작은가요?',
      };
    },
  };

  const 넓이비교: G5Family = {
    id: 'compare-area',
    make: (seed) => {
      const next = rand(seed + 13);
      const 모눈 = 쓸수(difficulty);
      const 고르기 = () => 2 + Math.floor(모눈.작은 / 2) + next(Math.min(모눈.폭, 9));
      const a1 = 고르기();
      const b1 = 고르기();
      const a2 = 고르기();
      const b2 = 고르기();
      if (a1 * b1 === a2 * b2) return null;
      const 가넓이 = a1 * b1;
      const 나넓이 = a2 * b2;
      const 답 = 가넓이 > 나넓이 ? '가' : '나';
      return {
        prompt: `1 cm²인 칸으로 나누어 보니 도형 가는 ${가넓이}칸, 도형 나는 ${나넓이}칸이었습니다. 더 넓은 도형은 어느 것일까요?`,
        answer: `도형 ${답}`,
        wrongs: [`도형 ${답 === '가' ? '나' : '가'}`, '두 도형의 넓이가 같습니다.', '칸 수만으로는 알 수 없습니다.'],
        tag: 'area',
        concept: '같은 단위로 세었다면 칸이 많은 쪽이 더 넓습니다.',
        strategy: '넓이 비교하기',
        hint: '두 도형을 같은 크기의 칸으로 세었습니다. 그러면 칸의 개수만 견주면 됩니다.',
        steps: [
          `도형 가의 넓이는 ${가넓이} cm², 도형 나의 넓이는 ${나넓이} cm²입니다.`,
          `${Math.max(가넓이, 나넓이)}${particleOf(String(Math.max(가넓이, 나넓이)), '이')} 더 크므로 도형 ${답}${particleOf(답, '이')} 더 넓습니다.`,
        ],
        misconceptionTip: '칸의 크기가 같을 때에만 개수로 견줄 수 있습니다.',
        selfCheck: '두 도형을 같은 크기의 칸으로 세었나요?',
      };
    },
  };

  const 읽기: G5Family = {
    id: 'read-unit',
    make: (seed) => {
      const next = rand(seed + 19);
      const k = 1 + next(difficulty === '하' ? 12 : difficulty === '중' ? 30 : 90);
      const 한글수 = (value: number): string => {
        const 일 = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
        if (value < 10) return 일[value];
        const 십 = Math.floor(value / 10);
        const 나머지 = value % 10;
        return `${십 > 1 ? 일[십] : ''}십${나머지 ? 일[나머지] : ''}`;
      };
      return {
        prompt: `${k} cm²를 읽으면 어떻게 될까요?`,
        answer: `${한글수(k)} 제곱센티미터`,
        wrongs: [
          `${한글수(k)} 센티미터`,
          `${한글수(k)} 제곱미터`,
          `제곱 ${한글수(k)} 센티미터`,
          `${한글수(k)} 센티미터 제곱`,
        ],
        tag: 'area',
        concept: '넓이의 단위 cm²는 제곱센티미터라고 읽습니다.',
        strategy: '넓이의 단위 읽기',
        hint: '작게 쓴 2를 "제곱"이라고 읽습니다. 수 다음에 "제곱센티미터"를 붙여 읽습니다.',
        steps: [`${k} cm²는 ${한글수(k)} 제곱센티미터라고 읽습니다.`],
        misconceptionTip: 'cm와 cm²는 다른 단위입니다. 하나는 길이, 하나는 넓이를 잽니다.',
        selfCheck: '길이의 단위와 넓이의 단위를 바꾸어 읽지 않았나요?',
      };
    },
  };

  // 수준마다 다른 뭉치를 줍니다. 차례만 돌리면 서른 자리를 채우고 나서
  // 남는 것이 수준마다 같습니다.
  if (difficulty === '하') return [칸세기, 넓이비교, 단위뜻, 읽기];
  if (difficulty === '중') return [조각모양, 넓이비교, 왜단위, 읽기];
  return [조각모양, 넓이비교, 칸세기, 읽기];
};

// ── 4차시 직사각형의 넓이 ───────────────────────────────────────────
export const unit6Lesson4 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 직사각형넓이: G5Family = {
    id: 'rect-area',
    make: (seed) => {
      const next = rand(seed);
      const 범위 = 쓸수(difficulty);
      const a = 범위.작은 + next(범위.폭);
      const b = 범위.작은 + next(범위.폭);
      if (a === b) return null;
      const 넓이 = a * b;
      return {
        prompt: `가로가 ${a} cm, 세로가 ${b} cm인 직사각형의 넓이는 몇 cm²일까요?`,
        answer: `${넓이} cm²`,
        wrongs: [`${(a + b) * 2} cm²`, `${a + b} cm²`, `${넓이 * 2} cm²`, `${넓이 - a} cm²`],
        tag: 'area',
        concept: '(직사각형의 넓이)=(가로)×(세로)',
        strategy: '직사각형의 넓이 구하기',
        hint: '가로에 놓이는 1 cm² 칸의 수와 줄의 수를 곱하는 것과 같습니다. 둘레와 헷갈리지 마세요.',
        steps: [
          `한 줄에 ${a}칸씩 ${b}줄이 놓입니다.`,
          `${a}×${b}=${넓이}(cm²)`,
        ],
        visual: 그림('직사각형의 넓이', [
          {
            shape: '직사각형',
            active: true,
            edgeLabels: [
              { from: 0, to: 1, text: `${a} cm` },
              { from: 1, to: 2, text: `${b} cm` },
            ],
          },
        ]),
        misconceptionTip: '둘레는 더하고 넓이는 곱합니다. 무엇을 구하라고 했는지 먼저 보세요.',
        selfCheck: '단위를 cm²로 썼나요?',
      };
    },
  };

  const 정사각형넓이: G5Family = {
    id: 'square-area',
    make: (seed) => {
      const next = rand(seed + 7);
      const 범위 = 쓸수(difficulty);
      const a = 범위.작은 + next(범위.폭);
      return {
        prompt: `한 변의 길이가 ${a} cm인 정사각형의 넓이는 몇 cm²일까요?`,
        answer: `${a * a} cm²`,
        wrongs: [`${a * 4} cm²`, `${a * 2} cm²`, `${a * a * 2} cm²`, `${a * a - a} cm²`],
        tag: 'area',
        concept: '(정사각형의 넓이)=(한 변의 길이)×(한 변의 길이)',
        strategy: '정사각형의 넓이 구하기',
        hint: '정사각형은 가로와 세로가 같은 직사각형입니다.',
        steps: [`${a}×${a}=${a * a}(cm²)`],
        visual: 그림('정사각형의 넓이', [
          { shape: '정사각형', active: true, edgeLabels: [{ from: 0, to: 1, text: `${a} cm` }] },
        ]),
        misconceptionTip: '한 변에 4를 곱하면 둘레입니다. 넓이는 한 변끼리 곱합니다.',
        selfCheck: '단위를 cm²로 썼나요?',
      };
    },
  };

  const 거꾸로넓이: G5Family = {
    id: 'area-back',
    make: (seed) => {
      const next = rand(seed + 13);
      const 범위 = 쓸수(difficulty);
      const a = 범위.작은 + next(범위.폭);
      const b = 범위.작은 + next(범위.폭);
      const 넓이 = a * b;
      return {
        prompt: `넓이가 ${넓이} cm²이고 가로가 ${a} cm인 직사각형이 있습니다. 세로는 몇 cm일까요?`,
        answer: `${b} cm`,
        wrongs: [`${넓이 - a} cm`, `${b + 1} cm`, `${넓이} cm`, `${a} cm`],
        tag: 'area',
        concept: '(세로)=(직사각형의 넓이)÷(가로)',
        strategy: '넓이를 알 때 변의 길이 구하기',
        hint: '넓이는 가로와 세로를 곱한 것입니다. 거꾸로 하려면 나누면 됩니다.',
        steps: [`${넓이}÷${a}=${b}(cm)`],
        misconceptionTip: '넓이에서 가로를 빼는 것이 아닙니다. 나누어야 합니다.',
        selfCheck: '구한 세로에 가로를 곱하면 넓이가 되나요?',
      };
    },
  };

  // 둘레와 넓이를 한 문항에서 함께 묻습니다. 두 가지를 모두 구해야
  // 하나를 고를 수 있어서, 같은 수로도 한 걸음 더 갑니다. 둘레는
  // 2차시에서, 넓이는 3차시에서 이미 배웠습니다.
  const 넓이와둘레: G5Family = {
    id: 'area-and-perimeter',
    make: (seed) => {
      const next = rand(seed + 17);
      const 범위 = 쓸수(difficulty);
      const a = 범위.작은 + next(범위.폭);
      const b = 범위.작은 + next(범위.폭);
      if (a === b) return null;
      const 넓이 = a * b;
      const 둘레 = (a + b) * 2;
      const 적기 = (넓이값: number, 둘레값: number) => `넓이 ${넓이값} cm², 둘레 ${둘레값} cm`;
      return {
        prompt: `가로가 ${a} cm, 세로가 ${b} cm인 직사각형의 넓이와 둘레를 바르게 구한 것은 어느 것일까요?`,
        answer: 적기(넓이, 둘레),
        wrongs: [
          // 넓이와 둘레를 맞바꾼 것
          적기(둘레, 넓이),
          // 둘레에서 2를 곱하는 것을 빠뜨린 것
          적기(넓이, a + b),
          // 넓이를 더해 구한 것
          적기(a + b, 둘레),
        ],
        tag: 'area',
        concept: '(직사각형의 넓이)=(가로)×(세로), (직사각형의 둘레)=((가로)+(세로))×2',
        strategy: '넓이와 둘레를 함께 구하기',
        hint: '넓이는 곱하고 둘레는 더합니다. 두 가지를 따로 구한 다음 보기와 맞춰 보세요.',
        steps: [
          `넓이: ${a}×${b}=${넓이}(cm²)`,
          `둘레: (${a}+${b})×2=${둘레}(cm)`,
          `그러므로 ${적기(넓이, 둘레)}입니다.`,
        ],
        misconceptionTip: '넓이는 cm², 둘레는 cm입니다. 단위가 다르면 다른 것을 잰 것입니다.',
        selfCheck: '넓이는 곱해서, 둘레는 더해서 구했나요?',
      };
    },
  };

  if (difficulty === '하') return [직사각형넓이, 정사각형넓이, 넓이와둘레, 거꾸로넓이];
  if (difficulty === '중') return [거꾸로넓이, 직사각형넓이, 정사각형넓이, 넓이와둘레];
  return [넓이와둘레, 거꾸로넓이, 직사각형넓이, 정사각형넓이];
};

// ── 5차시 1 m²와 1 km² ──────────────────────────────────────────────
// 지도서: "넓이 단위 사이의 관계 중 1 cm², 1 km² 사이의 단위 환산은
// 다루지 않는다." cm²↔m²와 m²↔km²만 묻습니다.
export const unit6Lesson5 = (difficulty: '하' | '중' | '상'): G5Family[] => {
  const 환산: G5Family = {
    id: 'convert',
    make: (seed) => {
      const next = rand(seed);
      const 위로 = next(2) === 0;
      // 어느 단위 쌍을 쓸지도 수준에 묶습니다. 셋이 같은 쌍에서 뽑으면
      // 씨앗이 달라도 서른 자리를 채우고 나면 같은 문항이 나옵니다.
      const cm쪽 = difficulty === '하' ? true : difficulty === '상' ? false : next(2) === 0;
      const 배 = cm쪽 ? 10000 : 1000000;
      const 작은단위 = cm쪽 ? 'cm²' : 'm²';
      const 큰단위 = cm쪽 ? 'm²' : 'km²';
      const k = 1 + next(difficulty === '하' ? 12 : difficulty === '중' ? 20 : 60);
      if (위로) {
        return {
          prompt: `${k} ${큰단위}는 몇 ${작은단위}일까요?`,
          answer: `${k * 배} ${작은단위}`,
          wrongs: [
            `${k * (cm쪽 ? 100 : 1000)} ${작은단위}`,
            `${k * 배 * 10} ${작은단위}`,
            `${k * (cm쪽 ? 1000 : 10000)} ${작은단위}`,
            `${k} ${작은단위}`,
          ],
          tag: 'area',
          concept: cm쪽 ? '1 m²=10000 cm²' : '1 km²=1000000 m²',
          strategy: '넓이의 단위 바꾸기',
          hint: cm쪽
            ? '한 변이 1 m인 정사각형은 한 변이 100 cm입니다. 100×100을 해 보세요.'
            : '한 변이 1 km인 정사각형은 한 변이 1000 m입니다. 1000×1000을 해 보세요.',
          steps: [
            cm쪽
              ? '한 변이 1 m인 정사각형은 한 변이 100 cm이므로 100×100=10000, 곧 1 m²=10000 cm²입니다.'
              : '한 변이 1 km인 정사각형은 한 변이 1000 m이므로 1000×1000=1000000, 곧 1 km²=1000000 m²입니다.',
            `${k}×${배}=${k * 배}(${작은단위})`,
          ],
          misconceptionTip: '길이의 단위는 100배, 1000배이지만 넓이의 단위는 그것을 두 번 곱한 만큼입니다.',
          selfCheck: '한 변의 길이를 두 번 곱했나요?',
        } satisfies G5Spec;
      }
      return {
        prompt: `${k * 배} ${작은단위}는 몇 ${큰단위}일까요?`,
        answer: `${k} ${큰단위}`,
        wrongs: [
          `${k * (cm쪽 ? 100 : 1000)} ${큰단위}`,
          `${k * 10} ${큰단위}`,
          `${k * 배} ${큰단위}`,
          `${Math.max(1, Math.round(k / 10))} ${큰단위}`,
        ],
        tag: 'area',
        concept: cm쪽 ? '1 m²=10000 cm²' : '1 km²=1000000 m²',
        strategy: '넓이의 단위 바꾸기',
        hint: '큰 단위로 바꿀 때는 나눕니다. 몇으로 나누어야 하는지는 한 변의 길이를 두 번 곱해서 정합니다.',
        steps: [
          cm쪽 ? '1 m²=10000 cm²입니다.' : '1 km²=1000000 m²입니다.',
          `${k * 배}÷${배}=${k}(${큰단위})`,
        ],
        misconceptionTip: '작은 단위에서 큰 단위로 갈 때는 나눕니다. 곱하면 값이 커져서 말이 되지 않습니다.',
        selfCheck: '바꾼 값이 처음보다 작아졌나요?',
      } satisfies G5Spec;
    },
  };

  const 알맞은단위: G5Family = {
    id: 'pick-unit',
    make: (seed) => {
      const 고를것 = [
        { 물건: '공책 한 장의 넓이', 답: 'cm²' },
        { 물건: '교실 바닥의 넓이', 답: 'm²' },
        { 물건: '우리나라 국토의 넓이', 답: 'km²' },
        { 물건: '손바닥의 넓이', 답: 'cm²' },
        { 물건: '학교 운동장의 넓이', 답: 'm²' },
      ];
      const 하나 = pick(고를것, seed);
      return {
        prompt: `${하나.물건}${particleOf(하나.물건, '을')} 나타내기에 가장 알맞은 단위는 어느 것일까요?`,
        answer: 하나.답,
        wrongs: ['cm²', 'm²', 'km²', 'cm'].filter((one) => one !== 하나.답),
        tag: 'area',
        concept: '재려는 것의 크기에 맞는 넓이 단위를 골라야 수가 읽기 쉬워집니다.',
        strategy: '알맞은 넓이 단위 고르기',
        hint: '그 단위로 재었을 때 수가 너무 커지거나 너무 작아지지 않는 쪽을 고르세요.',
        steps: [`${하나.물건}${particleOf(하나.물건, '은')} ${하나.답}로 나타내는 것이 알맞습니다.`],
        misconceptionTip: 'cm는 길이의 단위입니다. 넓이의 단위에는 ²가 붙습니다.',
        selfCheck: '고른 단위로 재면 수가 몇 자리쯤 되나요?',
      };
    },
  };

  const 큰넓이: G5Family = {
    id: 'big-area',
    make: (seed) => {
      const next = rand(seed + 11);
      const 범위 = 쓸수(difficulty);
      const a = 1 + next(범위.폭);
      const b = 1 + Math.floor(범위.작은 / 2) + next(범위.폭);
      return {
        prompt: `가로가 ${a} km, 세로가 ${b} km인 직사각형 모양의 공원이 있습니다. 이 공원의 넓이는 몇 km²일까요?`,
        answer: `${a * b} km²`,
        wrongs: [`${(a + b) * 2} km²`, `${a + b} km²`, `${a * b * 1000} km²`, `${a * b * 2} km²`],
        tag: 'area',
        concept: '넓이를 구하는 방법은 단위가 달라져도 같습니다. (가로)×(세로)입니다.',
        strategy: '큰 넓이를 알맞은 단위로 구하기',
        hint: 'm로 바꾸어 구하면 수가 아주 커집니다. km 그대로 곱하고 단위를 km²로 쓰면 됩니다.',
        steps: [`${a}×${b}=${a * b}(km²)`],
        misconceptionTip: '단위를 바꾸지 않고 구했다면 답의 단위도 그대로 km²입니다.',
        selfCheck: '단위를 km²로 썼나요?',
      };
    },
  };

  // m로 주어진 길이를 cm²로, 또는 그 반대로 바꾸어 넓이를 구합니다.
  // 단위를 바꾸는 걸음과 넓이를 구하는 걸음이 함께 있어 두 걸음입니다.
  const 바꿔서구하기: G5Family = {
    id: 'convert-then-area',
    make: (seed) => {
      const next = rand(seed + 23);
      const 범위 = 쓸수(difficulty);
      const a = 1 + next(범위.폭);
      const b = 1 + next(범위.폭);
      return {
        prompt: `가로가 ${a * 100} cm, 세로가 ${b * 100} cm인 직사각형 모양의 텃밭이 있습니다. 이 텃밭의 넓이는 몇 m²일까요?`,
        answer: `${a * b} m²`,
        wrongs: [
          `${a * b * 10000} m²`,
          `${a * 100 * b * 100} m²`,
          `${a * b * 100} m²`,
          `${(a + b) * 2} m²`,
        ],
        tag: 'area',
        concept: '1 m=100 cm이므로 1 m²=10000 cm²입니다.',
        strategy: '길이를 m로 바꾼 다음 넓이 구하기',
        hint: '길이를 먼저 m로 바꾸고 나서 곱하세요. cm로 곱한 다음 바꾸려면 10000으로 나누어야 합니다.',
        steps: [
          `${a * 100} cm=${a} m, ${b * 100} cm=${b} m입니다.`,
          `${a}×${b}=${a * b}(m²)`,
        ],
        misconceptionTip: '길이는 100배지만 넓이는 10000배입니다. 길이를 먼저 바꾸면 헷갈리지 않습니다.',
        selfCheck: '길이를 먼저 m로 바꾸었나요?',
      };
    },
  };

  // 단위가 다른 두 넓이를 견줍니다. 하나를 다른 쪽 단위로 바꾸어야
  // 견줄 수 있습니다.
  const 단위섞어견주기: G5Family = {
    id: 'compare-across-units',
    make: (seed) => {
      const next = rand(seed + 29);
      const 범위 = 쓸수(difficulty);
      const 가m2 = 1 + next(범위.폭);
      const 나m2 = 1 + next(범위.폭);
      if (가m2 === 나m2) return null;
      const 나cm2 = 나m2 * 10000;
      const 가큰가 = 가m2 > 나m2;
      return {
        prompt: `㉠ ${가m2} m²와 ㉡ ${나cm2} cm² 가운데 더 넓은 것은 어느 것일까요?`,
        answer: 가큰가 ? '㉠' : '㉡',
        wrongs: [가큰가 ? '㉡' : '㉠', '두 넓이가 같습니다.', '단위가 달라 견줄 수 없습니다.'],
        tag: 'area',
        concept: '1 m²=10000 cm²이므로 단위를 맞추면 견줄 수 있습니다.',
        strategy: '단위를 맞추어 넓이 견주기',
        hint: '수의 크기만 보면 안 됩니다. 한쪽을 다른 쪽 단위로 바꾼 다음 견주세요.',
        steps: [
          `1 m²=10000 cm²이므로 ${나cm2} cm²=${나cm2}÷10000=${나m2}(m²)입니다.`,
          `${가m2} m²와 ${나m2} m²를 견주면 ${Math.max(가m2, 나m2)} m²가 더 넓습니다.`,
          `그러므로 ${가큰가 ? '㉠' : '㉡'}입니다.`,
        ],
        misconceptionTip: 'cm²로 적힌 수가 크다고 더 넓은 것이 아닙니다. 단위가 작으면 수가 커집니다.',
        selfCheck: '두 넓이를 같은 단위로 맞추었나요?',
      };
    },
  };

  if (difficulty === '하') return [알맞은단위, 환산, 큰넓이];
  if (difficulty === '중') return [환산, 바꿔서구하기, 큰넓이];
  return [단위섞어견주기, 환산, 바꿔서구하기, 큰넓이];
};

// ── 6~9차시 평행사변형·삼각형·사다리꼴·마름모의 넓이 ────────────────
export type AreaKind = 'para' | 'triangle' | 'trapezoid' | 'rhombus';

const areaName: Record<AreaKind, string> = {
  para: '평행사변형',
  triangle: '삼각형',
  trapezoid: '사다리꼴',
  rhombus: '마름모',
};

const areaRule: Record<AreaKind, string> = {
  para: '(평행사변형의 넓이)=(밑변의 길이)×(높이)',
  triangle: '(삼각형의 넓이)=(밑변의 길이)×(높이)÷2',
  trapezoid: '(사다리꼴의 넓이)=((윗변의 길이)+(아랫변의 길이))×(높이)÷2',
  rhombus: '(마름모의 넓이)=(한 대각선의 길이)×(다른 대각선의 길이)÷2',
};

const areaWhy: Record<AreaKind, string> = {
  para: '평행사변형을 잘라 붙이면 밑변이 가로, 높이가 세로인 직사각형이 됩니다.',
  triangle: '똑같은 삼각형 2개를 붙이면 밑변과 높이가 같은 평행사변형이 되므로, 넓이는 그 반입니다.',
  trapezoid: '똑같은 사다리꼴 2개를 붙이면 밑변이 (윗변+아랫변)인 평행사변형이 되므로, 넓이는 그 반입니다.',
  rhombus: '마름모를 둘러싸는 직사각형은 두 대각선을 가로와 세로로 하고, 마름모의 넓이는 그 반입니다.',
};

type Dims = {
  밑변: number;
  높이: number;
  윗변?: number;
  /** 비스듬한 변의 길이입니다. 높이와 헷갈리라고 함께 적어 둡니다. */
  비스듬: number;
  /** 비스듬한 변이 가로로 얼마나 밀려 있는지. 그림을 그릴 때 씁니다. */
  오프셋: number;
  넓이: number;
};

// 높이·가로 밀림·비스듬한 변이 모두 자연수가 되는 짝입니다(피타고라스 수).
//
// 그림과 적힌 수가 어긋나지 않게 하려면 꼭짓점을 길이에서 계산해야
// 하는데, 아무 수나 쓰면 비스듬한 변의 길이가 자연수가 되지 않습니다.
// 5학년은 제곱근을 배우지 않으므로 그런 수를 적을 수 없습니다. 그래서
// 세 변이 모두 자연수가 되는 짝에서만 고릅니다.
const 직각짝: Array<[높이: number, 오프셋: number, 비스듬: number]> = [
  [3, 4, 5], [4, 3, 5],
  [6, 8, 10], [8, 6, 10],
  [5, 12, 13], [12, 5, 13],
  [9, 12, 15], [12, 9, 15],
  [8, 15, 17], [15, 8, 17],
];

// 그림이 지나치게 납작하거나 길쭉하면 길이를 적을 자리가 없어집니다.
// 밑변 14 cm에 높이 1 cm인 삼각형은 옳은 도형이지만, 화면에서는 선
// 하나로 보이고 글자가 서로 겹칩니다. 그림으로 읽을 수 있는 범위
// 안에서만 수를 뽑습니다.
const 그릴만한가 = (가로: number, 세로: number) => {
  const 비 = 가로 / 세로;
  // 밑변 6 cm에 높이 12 cm인 삼각형은 옳은 도형이지만 화면에서는
  // 바늘처럼 보입니다. 글자는 자리가 없으면 도형 밖으로 나가도록
  // 해 두었으므로, 읽을 수 있는 만큼만 막습니다.
  return 비 >= 0.5 && 비 <= 2.1;
};

// 그림에 적는 수가 풀이의 한 걸음과 같아지면, 그림이 답을 미리 흘립니다.
// 비스듬한 변의 길이는 넓이를 구하는 데 쓰지 않는 수인데, 그 수가 하필
// (밑변)+(높이)나 넓이와 같으면 아이는 그것을 셈의 결과로 읽습니다.
// 실제로 사다리꼴에서 비스듬한 변이 15 cm이고 (윗변)+(아랫변)이 3+12=15인
// 문항이 나갔습니다.
const 흘리는수인가 = (비스듬: number, 값들: number[]) => 값들.includes(비스듬);

// 수준에 따라 쓰는 수의 크기를 달리합니다.
//
// 이것을 두지 않으면 세 수준이 같은 수에서 뽑게 되고, 그러면 문제도
// 같아집니다. 실제로 평행사변형 차시는 하와 상이 서른 문항 가운데
// 아홉을 똑같이 내고 있었고, 문제에 나오는 수의 크기도 세 수준이
// 나란히 14였습니다. 수준을 고르는 뜻이 없었습니다.
//
// 피타고라스 수도 수준마다 나누어 씁니다. 같은 짝에서 뽑으면 씨앗이
// 달라도 서른 자리를 채우고 나면 같은 도형이 나옵니다.
export type 수준 = '하' | '중' | '상';

// 피타고라스 수는 슬라이스가 아니라 건너뛰며 나눕니다. 앞에서부터
// 잘라 주면 한 수준이 작은 도형만, 다른 수준이 큰 도형만 갖게 되어
// 그릴 수 있는 짝이 몇 개 남지 않습니다.
const 수범위: Record<수준, { 작은수: number; 폭: number; 나머지: number }> = {
  하: { 작은수: 3, 폭: 14, 나머지: 0 },
  중: { 작은수: 5, 폭: 15, 나머지: 1 },
  상: { 작은수: 7, 폭: 16, 나머지: 2 },
};

const dimsFor = (
  kind: AreaKind,
  next: (bound: number) => number,
  밖으로 = false,
  수준: 수준 = '중',
  // 그림을 그리지 않는 문항은 비스듬한 변의 길이를 적지 않습니다.
  // 그러면 세 변이 모두 자연수가 되는 짝(피타고라스 수)에 매일 까닭이
  // 없어지고, 쓸 수 있는 수가 열 배로 늘어납니다. 그림을 그리는
  // 문항만 그 짝에서 뽑습니다.
  그림 = true,
): Dims | null => {
  const 범위 = 수범위[수준];

  if (!그림 && kind !== 'rhombus') {
    const 밑변 = 범위.작은수 + next(범위.폭);
    const 높이 = 범위.작은수 + next(범위.폭);
    if (kind === 'para') return { 밑변, 높이, 비스듬: 0, 오프셋: 0, 넓이: 밑변 * 높이 };
    if (kind === 'triangle') {
      if ((밑변 * 높이) % 2 !== 0) return null;
      return { 밑변, 높이, 비스듬: 0, 오프셋: 0, 넓이: (밑변 * 높이) / 2 };
    }
    const 윗변 = 1 + next(밑변 - 1);
    if (윗변 >= 밑변) return null;
    if (((윗변 + 밑변) * 높이) % 2 !== 0) return null;
    return { 밑변, 높이, 윗변, 비스듬: 0, 오프셋: 0, 넓이: ((윗변 + 밑변) * 높이) / 2 };
  }
  if (kind === 'rhombus') {
    // 마름모는 두 대각선으로 정해집니다. 비스듬한 변은 쓰지 않습니다.
    const 가로 = 범위.작은수 + next(범위.폭 + 3);
    const 세로 = 범위.작은수 + next(범위.폭 + 3);
    if ((가로 * 세로) % 2 !== 0) return null;
    if (!그릴만한가(가로, 세로)) return null;
    return { 밑변: 가로, 높이: 세로, 비스듬: 0, 오프셋: 0, 넓이: (가로 * 세로) / 2 };
  }

  const 쓸짝 = 직각짝.filter((_, at) => at % 3 === 범위.나머지);
  const [높이, 오프셋, 비스듬] = 쓸짝[next(쓸짝.length)];
  const 밑변 = 범위.작은수 + next(범위.폭);

  if (kind === 'para') {
    // 높이를 내린 발이 밑변 안에 떨어져야 그림이 읽힙니다.
    if (밑변 <= 오프셋) return null;
    if (!그릴만한가(밑변 + 오프셋, 높이)) return null;
    const 넓이 = 밑변 * 높이;
    if (흘리는수인가(비스듬, [넓이, 밑변 + 높이, 넓이 * 2, 넓이 / 2])) return null;
    return { 밑변, 높이, 비스듬, 오프셋, 넓이 };
  }
  if (kind === 'triangle') {
    if ((밑변 * 높이) % 2 !== 0) return null;
    // 높이가 도형 안에 있는 삼각형은 꼭짓점이 밑변 위에 놓여야 합니다.
    if (!밖으로 && 밑변 <= 오프셋) return null;
    if (!그릴만한가(밖으로 ? 밑변 + 오프셋 : 밑변, 높이)) return null;
    const 넓이 = (밑변 * 높이) / 2;
    if (흘리는수인가(비스듬, [넓이, 밑변 + 높이, 밑변 * 높이, 넓이 * 2])) return null;
    return { 밑변, 높이, 비스듬, 오프셋, 넓이 };
  }
  // 사다리꼴은 왼쪽 변이 기울어지고 오른쪽 변이 수직입니다. 그러려면
  // 윗변이 아랫변에서 가로 밀림만큼 짧아야 합니다.
  const 윗변 = 밑변 - 오프셋;
  if (윗변 < 1) return null;
  if (((윗변 + 밑변) * 높이) % 2 !== 0) return null;
  if (!그릴만한가(밑변, 높이)) return null;
  return { 밑변, 높이, 윗변, 비스듬, 오프셋, 넓이: ((윗변 + 밑변) * 높이) / 2 };
};

// 길이에서 꼭짓점을 계산합니다. 가장 긴 쪽이 -1~1을 채우도록 줄이고
// 가운데로 옮깁니다. 그러면 밑변이 높이의 두 배인 도형은 그림에서도
// 두 배로 보입니다.
const 자리맞추기 = (points: Array<[number, number]>): Array<[number, number]> => {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const 가로 = Math.max(...xs) - Math.min(...xs);
  const 세로 = Math.max(...ys) - Math.min(...ys);
  const 배 = 2 / Math.max(가로, 세로, 1);
  const 가운데x = (Math.max(...xs) + Math.min(...xs)) / 2;
  const 가운데y = (Math.max(...ys) + Math.min(...ys)) / 2;
  return points.map(([x, y]) => [(x - 가운데x) * 배, (y - 가운데y) * 배] as [number, number]);
};

const 넓이그림 = (kind: AreaKind, dims: Dims, 밖으로: boolean): QuestionVisual => {
  const { 밑변: b, 높이: h, 오프셋: o } = dims;

  if (kind === 'rhombus') {
    // 두 대각선을 가로와 세로로 놓습니다. 꼭짓점 차례는 위·오른쪽·
    // 아래·왼쪽입니다.
    return 그림('마름모의 두 대각선', [
      {
        shape: '마름모',
        active: true,
        points: 자리맞추기([[0, -h / 2], [b / 2, 0], [0, h / 2], [-b / 2, 0]]),
        diagonals: [
          { from: 3, to: 1, text: `${b} cm` },
          { from: 0, to: 2, text: `${h} cm` },
        ],
      },
    ]);
  }

  if (kind === 'para') {
    // 0 왼쪽 위, 1 오른쪽 위, 2 오른쪽 아래, 3 왼쪽 아래.
    // 아랫변이 밑변이고, 윗변은 오른쪽으로 오프셋만큼 밀려 있습니다.
    return 그림('평행사변형의 밑변과 높이', [
      {
        shape: '평행사변형',
        active: true,
        points: 자리맞추기([[o, 0], [o + b, 0], [b, h], [0, h]]),
        edgeLabels: [
          { from: 3, to: 2, text: `밑변 ${b} cm`, span: true },
          { from: 0, to: 3, text: `${dims.비스듬} cm` },
        ],
        heightMark: { fromVertex: 0, text: `높이 ${h} cm` },
      },
    ]);
  }

  if (kind === 'triangle') {
    // 0 꼭짓점, 1 밑변의 오른쪽 끝, 2 밑변의 왼쪽 끝.
    // 꼭짓점이 밑변의 오른쪽 끝보다 더 오른쪽에 놓이면 높이가 도형
    // 밖으로 나갑니다 — 지도서가 다루라고 한 경우입니다.
    const 꼭짓점x = 밖으로 ? b + o : o;
    return 그림('삼각형의 밑변과 높이', [
      {
        shape: '이등변삼각형',
        active: true,
        points: 자리맞추기([[꼭짓점x, 0], [b, h], [0, h]]),
        edgeLabels: [
          { from: 1, to: 2, text: `밑변 ${b} cm`, span: true },
          // 비스듬한 변은 꼭짓점에서 '가로로 오프셋만큼 떨어진' 쪽입니다.
          // 높이가 도형 밖에 있으면 그쪽이 오른쪽 끝입니다.
          밖으로
            ? { from: 0, to: 1, text: `${dims.비스듬} cm` }
            : { from: 0, to: 2, text: `${dims.비스듬} cm` },
        ],
        heightMark: { fromVertex: 0, text: `높이 ${h} cm` },
      },
    ]);
  }

  // 사다리꼴: 0 윗변 왼쪽, 1 윗변 오른쪽, 2 아랫변 오른쪽, 3 아랫변 왼쪽.
  // 왼쪽 변이 기울어지고 오른쪽 변은 수직입니다.
  return 그림('사다리꼴의 윗변, 아랫변, 높이', [
    {
      shape: '사다리꼴',
      active: true,
      points: 자리맞추기([[o, 0], [b, 0], [b, h], [0, h]]),
      edgeLabels: [
        { from: 0, to: 1, text: `윗변 ${dims.윗변} cm`, span: true },
        { from: 3, to: 2, text: `아랫변 ${b} cm`, span: true },
        // 비스듬한 변에는 길이를 적지 않습니다. 지도서 5-1 150쪽의
        // 사다리꼴도 윗변·아랫변·높이 셋만 적습니다. 여기에 수를 하나
        // 더 적으면 그 수가 (윗변)+(아랫변)과 같아지는 일이 생기고,
        // 그러면 그림이 풀이의 한 걸음을 미리 보여 주게 됩니다.
      ],
      heightMark: { fromVertex: 0, text: `높이 ${h} cm` },
    },
  ]);
};

const 넓이식 = (kind: AreaKind, dims: Dims): string => {
  if (kind === 'para') return `${dims.밑변}×${dims.높이}=${dims.넓이}`;
  if (kind === 'triangle') return `${dims.밑변}×${dims.높이}÷2=${dims.넓이}`;
  if (kind === 'trapezoid') return `(${dims.윗변}+${dims.밑변})×${dims.높이}÷2=${dims.넓이}`;
  return `${dims.밑변}×${dims.높이}÷2=${dims.넓이}`;
};

const 넓이오답 = (kind: AreaKind, dims: Dims): string[] => {
  const out: number[] = [];
  const push = (value: number) => {
    if (!Number.isInteger(value) || value <= 0 || value === dims.넓이 || out.includes(value)) return;
    out.push(value);
  };
  if (kind === 'para') {
    // 높이 대신 비스듬한 변을 쓴 값 — 이 단원에서 가장 값진 오답입니다.
    push(dims.밑변 * dims.비스듬);
    // 2로 나눈 값(삼각형 공식과 섞은 것)
    push((dims.밑변 * dims.높이) / 2);
    push((dims.밑변 + dims.높이) * 2);
  } else if (kind === 'triangle') {
    // 2로 나누는 것을 빠뜨린 값
    push(dims.밑변 * dims.높이);
    push((dims.밑변 * dims.비스듬) / 2);
    push((dims.밑변 + dims.높이) * 2);
  } else if (kind === 'trapezoid') {
    push(((dims.윗변 ?? 0) + dims.밑변) * dims.높이);
    push((dims.밑변 * dims.높이) / 2);
    push(((dims.윗변 ?? 0) + dims.밑변 + dims.높이) * 2);
  } else {
    push(dims.밑변 * dims.높이);
    push((dims.밑변 + dims.높이) * 2);
    push(dims.밑변 * dims.높이 * 2);
  }
  push(dims.넓이 + dims.높이);
  push(dims.넓이 + 2);
  return out.map((value) => `${value} cm²`);
};

const 넓이구하기 = (kind: AreaKind, 밖으로: boolean, 수준: 수준): G5Family => ({
  id: `area-${밖으로 ? 'out' : 'in'}`,
  make: (seed) => {
    const next = rand(seed);
    let dims: Dims | null = null;
    for (let attempt = 0; attempt < 40 && !dims; attempt += 1) dims = dimsFor(kind, next, 밖으로, 수준);
    if (!dims) return null;
    const 오답 = 넓이오답(kind, dims);
    if (오답.length < 3) return null;
    const 안내 = kind === 'rhombus'
      ? `두 대각선의 길이가 ${dims.밑변} cm, ${dims.높이} cm인 마름모`
      : kind === 'trapezoid'
        ? `윗변의 길이가 ${dims.윗변} cm, 아랫변의 길이가 ${dims.밑변} cm, 높이가 ${dims.높이} cm인 사다리꼴`
        : `밑변의 길이가 ${dims.밑변} cm, 높이가 ${dims.높이} cm인 ${areaName[kind]}`;
    return {
      prompt: `${안내}의 넓이는 몇 cm²일까요?`,
      answer: `${dims.넓이} cm²`,
      wrongs: 오답,
      tag: 'area',
      concept: areaRule[kind],
      strategy: `${areaName[kind]}의 넓이 구하기`,
      hint: kind === 'rhombus'
        ? '두 대각선의 길이를 곱한 다음 2로 나누세요. 변의 길이가 아니라 대각선입니다.'
        : '높이는 밑변과 수직으로 잰 길이입니다. 그림에서 점선으로 그은 길이를 쓰세요.',
      steps: [
        areaWhy[kind],
        areaRule[kind],
        `${넓이식(kind, dims)}(cm²)`,
      ],
      visual: 넓이그림(kind, dims, 밖으로),
      misconceptionTip: kind === 'triangle'
        ? '2로 나누는 것을 빠뜨리면 평행사변형의 넓이가 됩니다. 그리고 높이는 비스듬한 변이 아닙니다.'
        : kind === 'rhombus'
          ? '변의 길이가 아니라 대각선의 길이를 씁니다.'
          : '비스듬한 변의 길이를 높이로 쓰면 안 됩니다. 밑변과 수직인 길이가 높이입니다.',
      selfCheck: '단위를 cm²로 썼나요? 높이 자리에 알맞은 길이를 넣었나요?',
    } satisfies G5Spec;
  },
});

// 공식을 고르는 문항의 오답입니다.
//
// 처음에는 다른 도형의 공식을 그대로 오답으로 썼는데, 그러면 평행사변형
// 차시(6차시)의 보기에 '윗변', '아랫변', '대각선'이 나옵니다. 아직 배우지
// 않은 말입니다. 그래서 오답은 그 차시가 배운 말로만 짓습니다 — 2로
// 나누는 것을 빠뜨리거나, 곱할 자리에서 더하거나, 둘레와 섞은 것.
// 아이가 실제로 하는 실수라 오히려 겨냥이 더 정확합니다.
const 다른공식: Record<AreaKind, string[]> = {
  para: [
    '(평행사변형의 넓이)=(밑변의 길이)×(높이)÷2',
    '(평행사변형의 넓이)=(밑변의 길이)+(높이)',
    '(평행사변형의 넓이)=((밑변의 길이)+(높이))×2',
  ],
  triangle: [
    '(삼각형의 넓이)=(밑변의 길이)×(높이)',
    '(삼각형의 넓이)=((밑변의 길이)+(높이))÷2',
    '(삼각형의 넓이)=(밑변의 길이)×(높이)÷3',
  ],
  trapezoid: [
    '(사다리꼴의 넓이)=((윗변의 길이)+(아랫변의 길이))×(높이)',
    '(사다리꼴의 넓이)=(윗변의 길이)×(아랫변의 길이)×(높이)÷2',
    '(사다리꼴의 넓이)=((윗변의 길이)+(아랫변의 길이)+(높이))÷2',
  ],
  rhombus: [
    '(마름모의 넓이)=(한 대각선의 길이)×(다른 대각선의 길이)',
    '(마름모의 넓이)=(한 대각선의 길이)+(다른 대각선의 길이)',
    '(마름모의 넓이)=(한 변의 길이)×(한 변의 길이)',
  ],
};

// 그 차시까지 이미 배운 도형의 공식은 오답으로 써도 됩니다. 뒤 차시일수록
// 고를 것이 많아져 문항이 어려워지는데, 그것이 옳은 차례입니다.
const 이미배운공식: Record<AreaKind, AreaKind[]> = {
  para: [],
  triangle: ['para'],
  trapezoid: ['para', 'triangle'],
  rhombus: ['para', 'triangle', 'trapezoid'],
};

const 공식고르기 = (kind: AreaKind): G5Family => ({
  id: 'which-rule',
  make: () => ({
    prompt: `${areaName[kind]}의 넓이를 구하는 방법으로 알맞은 것은 어느 것일까요?`,
    answer: areaRule[kind],
    wrongs: [
      ...이미배운공식[kind].map((one) => areaRule[one]),
      ...다른공식[kind],
    ],
    tag: 'area',
    concept: areaRule[kind],
    strategy: `${areaName[kind]}의 넓이를 구하는 방법 알기`,
    hint: '도형을 잘라 붙여 어떤 도형으로 만들 수 있는지 떠올리세요. 그 도형의 넓이와 견주면 식이 나옵니다.',
    steps: [areaWhy[kind], areaRule[kind]],
    misconceptionTip: '2로 나누는 도형과 나누지 않는 도형이 있습니다. 어떤 도형 둘을 붙여 만들었는지 생각하세요.',
    selfCheck: '작은 수를 넣어 직접 세어 보았을 때도 식이 맞나요?',
  }),
});

const 거꾸로넓이 = (kind: AreaKind, 수준: 수준): G5Family => ({
  id: 'area-back',
  make: (seed) => {
    const next = rand(seed + 7);
    let dims: Dims | null = null;
    for (let attempt = 0; attempt < 40 && !dims; attempt += 1) dims = dimsFor(kind, next, false, 수준, false);
    if (!dims) return null;
    const 묻는것 = kind === 'rhombus' ? '다른 대각선의 길이' : '높이';
    return {
      prompt: kind === 'rhombus'
        ? `넓이가 ${dims.넓이} cm²이고 한 대각선의 길이가 ${dims.밑변} cm인 마름모가 있습니다. 다른 대각선의 길이는 몇 cm일까요?`
        : kind === 'trapezoid'
          ? `넓이가 ${dims.넓이} cm²이고 윗변의 길이가 ${dims.윗변} cm, 아랫변의 길이가 ${dims.밑변} cm인 사다리꼴이 있습니다. 높이는 몇 cm일까요?`
          : `넓이가 ${dims.넓이} cm²이고 밑변의 길이가 ${dims.밑변} cm인 ${areaName[kind]}이 있습니다. 높이는 몇 cm일까요?`,
      answer: `${dims.높이} cm`,
      wrongs: [
        `${dims.넓이 - dims.밑변} cm`,
        `${dims.높이 + 1} cm`,
        `${kind === 'para' ? dims.높이 * 2 : Math.max(1, Math.round(dims.높이 / 2))} cm`,
        `${dims.밑변} cm`,
      ],
      tag: 'area',
      concept: areaRule[kind],
      strategy: `넓이를 알 때 ${묻는것} 구하기`,
      hint: '넓이를 구하는 식을 그대로 쓰고, 모르는 자리를 □로 두어 거꾸로 구해 보세요.',
      steps: [
        areaRule[kind],
        kind === 'para'
          ? `${dims.밑변}×□=${dims.넓이}이므로 □=${dims.넓이}÷${dims.밑변}=${dims.높이}(cm)`
          : kind === 'trapezoid'
            ? `(${dims.윗변}+${dims.밑변})×□÷2=${dims.넓이}이므로 □=${dims.넓이}×2÷${(dims.윗변 ?? 0) + dims.밑변}=${dims.높이}(cm)`
            : `${dims.밑변}×□÷2=${dims.넓이}이므로 □=${dims.넓이}×2÷${dims.밑변}=${dims.높이}(cm)`,
      ],
      misconceptionTip: kind === 'para'
        ? '넓이에서 밑변을 빼는 것이 아닙니다. 나누어야 합니다.'
        : '2로 나눈 식이므로 거꾸로 갈 때는 먼저 2를 곱해야 합니다.',
      selfCheck: '구한 값을 식에 넣으면 처음 넓이가 나오나요?',
    } satisfies G5Spec;
  },
});

const 같은넓이 = (kind: AreaKind, 수준: 수준): G5Family => ({
  id: 'same-area',
  make: (seed) => {
    if (kind !== 'para' && kind !== 'triangle') return null;
    const next = rand(seed + 13);
    let dims: Dims | null = null;
    for (let attempt = 0; attempt < 40 && !dims; attempt += 1) dims = dimsFor(kind, next, false, 수준, false);
    if (!dims) return null;
    return {
      prompt: `밑변의 길이가 ${dims.밑변} cm, 높이가 ${dims.높이} cm인 ${areaName[kind]}이 여러 개 있습니다. 이 ${areaName[kind]}들의 넓이에 대해 바르게 말한 것은 어느 것일까요?`,
      answer: `모양이 달라도 넓이는 모두 ${dims.넓이} cm²로 같습니다.`,
      wrongs: [
        '더 비스듬하게 기울어진 것이 넓이가 더 넓습니다.',
        '둘레가 더 긴 것이 넓이도 더 넓습니다.',
        '모양이 다르면 넓이도 반드시 다릅니다.',
      ],
      tag: 'area',
      concept: `넓이는 밑변의 길이와 높이로만 정해집니다. ${areaRule[kind]}`,
      strategy: `${areaName[kind]}의 넓이를 정하는 것 알기`,
      hint: '넓이를 구하는 식에 무엇이 들어가는지 보세요. 식에 없는 것은 넓이를 바꾸지 못합니다.',
      steps: [
        areaRule[kind],
        '식에 들어가는 것은 밑변의 길이와 높이뿐입니다.',
        `그러므로 밑변과 높이가 같으면 모양이 달라도 넓이는 ${dims.넓이} cm²로 같습니다.`,
      ],
      misconceptionTip: '둘레가 길다고 넓이가 넓은 것은 아닙니다. 둘레와 넓이는 다른 것을 잽니다.',
      selfCheck: '식에 넣는 값이 같은가요?',
    } satisfies G5Spec;
  },
});

// 넓이를 실제로 쓰는 자리입니다. 지도서의 장면(타일, 땅, 밭, 색종이)을
// 그대로 씁니다.
const 넓이문장 = (kind: AreaKind, 수준: 수준): G5Family => ({
  id: 'area-story',
  make: (seed) => {
    const next = rand(seed + 23);
    let dims: Dims | null = null;
    for (let attempt = 0; attempt < 40 && !dims; attempt += 1) dims = dimsFor(kind, next, false, 수준, false);
    if (!dims) return null;
    const 오답 = 넓이오답(kind, dims);
    if (오답.length < 3) return null;
    const 장면: Record<AreaKind, string> = {
      para: `밑변의 길이가 ${dims.밑변} m, 높이가 ${dims.높이} m인 평행사변형 모양의 화단`,
      triangle: `밑변의 길이가 ${dims.밑변} m, 높이가 ${dims.높이} m인 삼각형 모양의 텃밭`,
      trapezoid: `윗변의 길이가 ${dims.윗변} m, 아랫변의 길이가 ${dims.밑변} m, 높이가 ${dims.높이} m인 사다리꼴 모양의 땅`,
      rhombus: `두 대각선의 길이가 ${dims.밑변} m, ${dims.높이} m인 마름모 모양의 연날리기 천`,
    };
    return {
      prompt: `${장면[kind]}이 있습니다. 이 ${areaName[kind]} 모양의 넓이는 몇 m²일까요?`,
      answer: `${dims.넓이} m²`,
      wrongs: 오답.map((one) => one.replace('cm²', 'm²')),
      tag: 'area',
      concept: areaRule[kind],
      strategy: `${areaName[kind]}의 넓이를 실생활 문제에 쓰기`,
      hint: '단위가 m로 바뀌어도 넓이를 구하는 방법은 같습니다. 답의 단위만 m²로 쓰면 됩니다.',
      steps: [areaRule[kind], `${넓이식(kind, dims)}(m²)`],
      misconceptionTip: '단위가 m이면 넓이의 단위는 m²입니다. cm²로 쓰지 마세요.',
      selfCheck: '단위를 m²로 썼나요?',
    } satisfies G5Spec;
  },
});

// 그림에서 높이를 짚어 내는 문항입니다. 이 단원에서 가장 잦은 실수가
// 높이 대신 비스듬한 변의 길이를 쓰는 것이라, 넓이를 구하기 전에 그
// 하나만 따로 묻습니다. 그림에 비스듬한 변의 길이가 함께 적혀 있어야
// 묻는 뜻이 있습니다.
const 높이찾기 = (kind: AreaKind, 수준: 수준): G5Family => ({
  id: 'find-height',
  make: (seed) => {
    const next = rand(seed + 41);
    let dims: Dims | null = null;
    for (let attempt = 0; attempt < 40 && !dims; attempt += 1) dims = dimsFor(kind, next, false, 수준);
    if (!dims) return null;
    if (kind === 'rhombus') {
      return {
        prompt: '그림의 마름모에서 두 대각선의 길이를 모두 더하면 몇 cm일까요?',
        answer: `${dims.밑변 + dims.높이} cm`,
        wrongs: [
          `${dims.밑변} cm`,
          `${dims.높이} cm`,
          `${(dims.밑변 * dims.높이) / 2} cm`,
          `${dims.밑변 * dims.높이} cm`,
        ],
        tag: 'area',
        concept: areaRule[kind],
        strategy: '그림에서 두 대각선 읽기',
        hint: '마름모의 대각선은 마주 보는 꼭짓점끼리 이은 선분입니다. 그림에서 둘을 찾아 길이를 더하세요.',
        steps: [
          `두 대각선의 길이는 ${dims.밑변} cm와 ${dims.높이} cm입니다.`,
          `${dims.밑변}+${dims.높이}=${dims.밑변 + dims.높이}(cm)`,
        ],
        misconceptionTip: '대각선은 변이 아닙니다. 도형의 둘레를 이루는 선이 아니라 안을 가로지르는 선입니다.',
        selfCheck: '그림에서 대각선 둘을 모두 찾았나요?',
        visual: 넓이그림(kind, dims, false),
      } satisfies G5Spec;
    }
    return {
      prompt: `그림의 ${areaName[kind]}에서 넓이를 구할 때 쓰는 높이는 몇 cm일까요?`,
      answer: `${dims.높이} cm`,
      wrongs: [
        `${dims.비스듬} cm`,
        `${dims.밑변} cm`,
        `${dims.높이 + dims.밑변} cm`,
        `${dims.높이 + 1} cm`,
      ],
      tag: 'area',
      concept: areaRule[kind],
      strategy: '그림에서 높이 짚어 내기',
      hint: '높이는 밑변과 수직으로 잰 길이입니다. 그림에서 점선으로 긋고 직각 표시를 한 선을 찾으세요.',
      steps: [
        '높이는 밑변에 수직으로 그은 선분의 길이입니다.',
        '그림에서 점선과 직각 표시로 그린 선이 높이입니다.',
        `그러므로 높이는 ${dims.높이} cm입니다.`,
      ],
      misconceptionTip: '비스듬한 변의 길이는 높이가 아닙니다. 직각 표시가 있는 선을 보세요.',
      selfCheck: '고른 길이에 직각 표시가 붙어 있었나요?',
      visual: 넓이그림(kind, dims, false),
    } satisfies G5Spec;
  },
});

// 두 도형의 넓이를 저마다 구해 견줍니다. 한 번에 답이 나오지 않고
// 두 번 구한 다음 견주어야 해서, 같은 공식으로도 한 걸음 더 갑니다.
const 넓이견주기 = (kind: AreaKind, 수준: 수준): G5Family => ({
  id: 'compare-area',
  make: (seed) => {
    const next = rand(seed + 53);
    let 가: Dims | null = null;
    let 나: Dims | null = null;
    for (let attempt = 0; attempt < 40 && !가; attempt += 1) 가 = dimsFor(kind, next, false, 수준, false);
    for (let attempt = 0; attempt < 40 && !나; attempt += 1) 나 = dimsFor(kind, next, false, 수준, false);
    if (!가 || !나 || 가.넓이 === 나.넓이) return null;
    const 가가큰가 = 가.넓이 > 나.넓이;
    const 적기 = (dims: Dims) =>
      kind === 'rhombus'
        ? `두 대각선의 길이가 ${dims.밑변} cm, ${dims.높이} cm인 마름모`
        : kind === 'trapezoid'
          ? `윗변의 길이가 ${dims.윗변} cm, 아랫변의 길이가 ${dims.밑변} cm, 높이가 ${dims.높이} cm인 사다리꼴`
          : `밑변의 길이가 ${dims.밑변} cm, 높이가 ${dims.높이} cm인 ${areaName[kind]}`;
    return {
      prompt: `㉠ ${적기(가)}과 ㉡ ${적기(나)}이 있습니다. 넓이가 더 넓은 것은 어느 것일까요?`,
      answer: 가가큰가 ? '㉠' : '㉡',
      wrongs: [가가큰가 ? '㉡' : '㉠', '두 도형의 넓이가 같습니다.', '넓이를 견줄 수 없습니다.'],
      tag: 'area',
      concept: areaRule[kind],
      strategy: '두 도형의 넓이를 구해 견주기',
      hint: '한눈에 견주려 하지 말고, 두 도형의 넓이를 저마다 구한 다음 두 수를 견주세요.',
      steps: [
        areaRule[kind],
        `㉠의 넓이: ${넓이식(kind, 가)}(cm²)`,
        `㉡의 넓이: ${넓이식(kind, 나)}(cm²)`,
        `${Math.max(가.넓이, 나.넓이)}${particleOf(String(Math.max(가.넓이, 나.넓이)), '이')} 더 크므로 ${가가큰가 ? '㉠' : '㉡'}이 더 넓습니다.`,
      ],
      misconceptionTip: '길이가 큰 쪽이 늘 넓은 것은 아닙니다. 넓이를 직접 구해 견주어야 합니다.',
      selfCheck: '두 도형의 넓이를 모두 구했나요?',
    } satisfies G5Spec;
  },
});

export const unit6Area = (kind: AreaKind, difficulty: 수준): G5Family[] => {
  // 수준마다 하는 일과 수의 크기를 함께 올립니다.
  //   하  그림을 보고 공식에 넣어 넓이를 구한다 (작은 수)
  //   중  거꾸로 구하거나, 모양이 달라도 넓이가 같은 것을 가린다
  //   상  글로 된 상황에서 스스로 식을 세운다 (큰 수)
  //
  // 차례만 돌리던 때에는 하와 상이 서른 문항 가운데 열하나까지 똑같이
  // 냈습니다. 문제에 나오는 수의 크기도 세 수준이 나란히 같았습니다.
  if (difficulty === '하') {
    const 뭉치 = [넓이구하기(kind, false, '하'), 높이찾기(kind, '하'), 공식고르기(kind), 넓이문장(kind, '하')];
    if (kind === 'triangle') 뭉치.push(넓이구하기(kind, true, '하'));
    return 뭉치;
  }
  if (difficulty === '중') {
    const 뭉치 = [거꾸로넓이(kind, '중'), 넓이구하기(kind, false, '중'), 넓이문장(kind, '중')];
    if (kind === 'para' || kind === 'triangle') 뭉치.push(같은넓이(kind, '중'));
    else 뭉치.push(공식고르기(kind));
    return 뭉치;
  }
  const 뭉치 = [넓이문장(kind, '상'), 거꾸로넓이(kind, '상'), 넓이견주기(kind, '상')];
  if (kind === 'triangle') 뭉치.push(넓이구하기(kind, true, '상'));
  else if (kind === 'para') 뭉치.push(같은넓이(kind, '상'));
  else 뭉치.push(넓이구하기(kind, false, '상'));
  return 뭉치;
};
