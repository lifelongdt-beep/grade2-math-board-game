import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 6학년 1학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명은 동아출판 초등 수학 6-1 교사용 지도서(2022 개정) 각론의
// '단원의 전개 계획'을 그대로 따랐습니다. '뚝딱! 해결해요', '함께! 놀아요',
// '곰곰! 생각해요'는 문항 차시가 아니므로 넣지 않고, 두 차시짜리 주제는
// 한 차시로 둡니다(3·4학년과 같은 약속).
//
// 지도서가 못박아 둔 것(각 단원 '단원 지도 유의 사항'):
//   · 1단원: (자연수)÷(자연수), (분수)÷(자연수)의 결과를 기약분수가 아닌
//     분수나 가분수로 나타내는 것도 허용합니다. 그래서 보기에는 답과 크기가
//     같은 다른 꼴을 두지 않습니다.
//   · 2단원: 밑면은 놓인 방향에 따라 달라지지 않습니다. 구성 요소보다 형태를
//     먼저 봅니다.
//   · 3단원: 계산 원리를 이해하는 수준에서 다루고 복잡한 계산은 피합니다.
//   · 4단원: 속력, 인구 밀도, 축척, 농도를 직접 구하는 문제는 다루지 않습니다.
//   · 5단원: 백분율을 구하기 쉬운 자료를 씁니다. 그리기보다 해석에 중점을 둡니다.
//   · 6단원: 가로, 세로, 높이, 밑면, 옆면을 바르게 씁니다.
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

// 6학년 문항은 차시마다 자기 수를 직접 고르므로 maxNumber가 문항을 자르는
// 일은 없습니다. 단원 종합·학기 종합에서 읽으므로 비워 두지 않습니다.
const scopeFor = (): LessonScope => ({
  maxNumber: 100000000,
  representation: 'symbolic',
  forbidVisuals: ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern', 'grid-table'],
});

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '6-1';
  return {
    semester,
    unitNo,
    title,
    lessons: lessons.map((lesson, index): Lesson => ({
      ...lesson,
      id: `${semester}-u${unitNo}-l${index + 1}`,
      semester,
      unitNo,
      unitTitle: title,
      lessonNo: index + 1,
      scope: scopeFor(),
    })),
  };
};
const 몫분수성취 = '[6수01-10] ‘(자연수)÷(자연수)’에서 나눗셈의 몫을 분수로 나타낼 수 있다.';
const 분수나눗셈성취 = '[6수01-11] 분수의 나눗셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.';
const 각기둥성취 = '[6수03-05] 각기둥과 각뿔을 이해하고, 구성 요소와 성질을 탐구하고 설명할 수 있다.';
const 전개도성취 = '[6수03-06] 각기둥의 전개도를 그릴 수 있다.';
const 몫소수성취 = '[6수01-14] ‘(자연수)÷(자연수)’에서 나눗셈의 몫을 소수로 나타낼 수 있다.';
const 소수나눗셈성취 = '[6수01-15] 소수의 나눗셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.';
const 비성취 = '[6수02-02] 두 양의 크기를 비교하는 상황을 통해 비의 개념을 이해하고, 두 양의 관계를 비로 나타낼 수 있다.';
const 비율성취 = '[6수02-03] 비율을 이해하고, 비율을 분수, 소수, 백분율로 나타낼 수 있다.';
const 그래프성취 = '[6수04-02] 자료를 수집하여 띠그래프나 원그래프로 나타내고 해석할 수 있다.';
const 탐구성취 = '[6수04-03] 탐구 문제를 설정하고, 그에 맞는 자료를 수집, 정리하여 적절한 그래프로 나타내고 해석할 수 있다.';
const 겉넓이성취 = '[6수03-17] 직육면체와 정육면체의 겉넓이를 구하는 방법을 이해하고, 이를 구할 수 있다.';
const 부피단위성취 = '[6수03-18] 부피 단위 1 cm³, 1 m³를 알며, 그 관계를 이해한다.';
const 부피성취 = '[6수03-19] 직육면체와 정육면체의 부피를 구하는 방법을 이해하고, 이를 구할 수 있다.';

export const curriculum61: Unit[] = [
  // ── 1단원 분수의 나눗셈 ──
  unit(1, '분수의 나눗셈', [
    {
      title: '단원 도입',
      objective: '분수의 나눗셈이 필요한 상황을 알 수 있다.',
      achievement: 몫분수성취,
      tags: ['fractionDiv'],
      textbookFocus: '분수의 나눗셈이 필요한 상황을 살펴본다.',
      workbookFocus: '분수의 곱셈과 자연수의 나눗셈을 떠올린다.',
    },
    {
      title: '(자연수)÷(자연수)의 몫을 분수로 어떻게 나타낼까요 ⑴',
      objective: '몫이 1보다 작은 (자연수)÷(자연수)의 몫을 분수로 나타낼 수 있다.',
      achievement: 몫분수성취,
      tags: ['fractionDiv'],
      textbookFocus: '1÷3=1/3, 2÷3=2/3처럼 나타낸다.',
      workbookFocus: '몫이 1보다 작은 나눗셈의 몫을 분수로 쓴다.',
    },
    {
      title: '(자연수)÷(자연수)의 몫을 분수로 어떻게 나타낼까요 ⑵',
      objective: '몫이 1보다 큰 (자연수)÷(자연수)의 몫을 분수로 나타낼 수 있다.',
      achievement: 몫분수성취,
      tags: ['fractionDiv'],
      textbookFocus: '5÷3=5/3=1과 2/3처럼 나타낸다.',
      workbookFocus: '몫이 1보다 큰 나눗셈의 몫을 분수로 쓴다.',
    },
    {
      title: '(분수)÷(자연수)를 어떻게 계산할까요',
      objective: '(진분수)÷(자연수), (가분수)÷(자연수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '분자가 나누어떨어지면 분자를 나누고, 아니면 1/(자연수)를 곱한다.',
      workbookFocus: '(분수)÷(자연수)를 계산한다.',
    },
    {
      title: '(대분수)÷(자연수)를 어떻게 계산할까요',
      objective: '(대분수)÷(자연수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '대분수를 가분수로 바꾸어 계산한다.',
      workbookFocus: '(대분수)÷(자연수)를 계산한다.',
    },
  ]),
  // ── 2단원 각기둥과 각뿔 ──
  unit(2, '각기둥과 각뿔', [
    {
      title: '단원 도입',
      objective: '입체도형을 떠올리고 각기둥과 각뿔이 필요한 상황을 알 수 있다.',
      achievement: 각기둥성취,
      tags: ['solid'],
      textbookFocus: '생활에서 입체도형을 찾아본다.',
      workbookFocus: '직육면체를 떠올린다.',
    },
    {
      title: '각기둥은 무엇일까요 ⑴',
      objective: '각기둥과 각기둥의 밑면, 옆면을 알 수 있다.',
      achievement: 각기둥성취,
      tags: ['solid'],
      textbookFocus: '서로 평행한 두 면이 합동인 다각형이고 옆면이 직사각형인 입체도형을 각기둥이라고 한다.',
      workbookFocus: '밑면과 옆면을 찾는다.',
    },
    {
      title: '각기둥은 무엇일까요 ⑵',
      objective: '각기둥의 이름과 모서리, 꼭짓점, 높이를 알 수 있다.',
      achievement: 각기둥성취,
      tags: ['solid'],
      textbookFocus: '밑면의 모양에 따라 삼각기둥, 사각기둥 … 이라고 한다.',
      workbookFocus: '면, 모서리, 꼭짓점의 수를 센다.',
    },
    {
      title: '각기둥의 전개도는 무엇일까요',
      objective: '각기둥의 전개도를 알고 그릴 수 있다.',
      achievement: 전개도성취,
      tags: ['solid'],
      textbookFocus: '각기둥의 모서리를 잘라 펼친 그림을 전개도라고 한다.',
      workbookFocus: '전개도에서 밑면과 옆면을 찾는다.',
    },
    {
      title: '각뿔은 무엇일까요 ⑴',
      objective: '각뿔과 각뿔의 밑면, 옆면을 알 수 있다.',
      achievement: 각기둥성취,
      tags: ['solid'],
      textbookFocus: '밑면이 다각형이고 옆면이 모두 삼각형인 입체도형을 각뿔이라고 한다.',
      workbookFocus: '밑면과 옆면을 찾는다.',
    },
    {
      title: '각뿔은 무엇일까요 ⑵',
      objective: '각뿔의 이름과 모서리, 꼭짓점, 각뿔의 꼭짓점, 높이를 알 수 있다.',
      achievement: 각기둥성취,
      tags: ['solid'],
      textbookFocus: '밑면의 모양에 따라 삼각뿔, 사각뿔 … 이라고 한다.',
      workbookFocus: '면, 모서리, 꼭짓점의 수를 센다.',
    },
  ]),
  // ── 3단원 소수의 나눗셈 ──
  unit(3, '소수의 나눗셈', [
    {
      title: '단원 도입',
      objective: '소수의 나눗셈이 필요한 상황을 알 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '소수의 나눗셈이 필요한 상황을 살펴본다.',
      workbookFocus: '자연수의 나눗셈을 떠올린다.',
    },
    {
      title: '(소수)÷(자연수)를 어떻게 계산할까요 ⑴',
      objective: '자연수의 나눗셈을 이용하여 (소수)÷(자연수)를 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '나누어지는 수가 1/10배, 1/100배가 되면 몫도 1/10배, 1/100배가 된다.',
      workbookFocus: '자연수의 나눗셈으로 몫을 구한다.',
    },
    {
      title: '(소수)÷(자연수)를 어떻게 계산할까요 ⑵',
      objective: '몫이 1보다 큰 (소수)÷(자연수)를 세로로 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '몫의 소수점은 나누어지는 수의 소수점 위치에 맞추어 찍는다.',
      workbookFocus: '세로로 계산한다.',
    },
    {
      title: '(소수)÷(자연수)를 어떻게 계산할까요 ⑶',
      objective: '몫이 1보다 작은 (소수)÷(자연수)를 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '몫의 일의 자리에 0을 쓴다.',
      workbookFocus: '몫이 1보다 작은 나눗셈을 계산한다.',
    },
    {
      title: '(소수)÷(자연수)를 어떻게 계산할까요 ⑷',
      objective: '소수점 아래 0을 내려 계산하는 (소수)÷(자연수)를 할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '나누어떨어지지 않으면 0을 내려 계산한다.',
      workbookFocus: '0을 내려 계산한다.',
    },
    {
      title: '(소수)÷(자연수)를 어떻게 계산할까요 ⑸',
      objective: '몫의 소수 첫째 자리에 0이 있는 (소수)÷(자연수)를 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '나눌 수 없는 자리에는 몫에 0을 쓴다.',
      workbookFocus: '몫에 0이 있는 나눗셈을 계산한다.',
    },
    {
      title: '(자연수)÷(자연수)의 몫을 소수로 어떻게 나타낼까요',
      objective: '(자연수)÷(자연수)의 몫을 소수로 나타낼 수 있다.',
      achievement: 몫소수성취,
      tags: ['decimalDiv'],
      textbookFocus: '나누어지는 수 뒤에 소수점과 0을 붙여 계산한다.',
      workbookFocus: '몫을 소수로 나타낸다.',
    },
    {
      title: '소수의 나눗셈의 어림셈을 어떻게 할까요',
      objective: '소수의 나눗셈의 몫을 어림하여 소수점의 위치를 확인할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv', 'estimate'],
      textbookFocus: '나누어지는 수를 자연수로 어림하여 몫을 짐작한다.',
      workbookFocus: '어림한 몫으로 소수점 위치를 정한다.',
    },
  ]),
  // ── 4단원 비와 비율 ──
  unit(4, '비와 비율', [
    {
      title: '단원 도입',
      objective: '비와 비율이 필요한 상황을 알 수 있다.',
      achievement: 비성취,
      tags: ['ratio'],
      textbookFocus: '두 양을 비교하는 상황을 살펴본다.',
      workbookFocus: '뺄셈과 나눗셈으로 비교해 본다.',
    },
    {
      title: '두 양을 어떻게 비교할까요',
      objective: '뺄셈과 나눗셈으로 두 양을 비교할 수 있다.',
      achievement: 비성취,
      tags: ['ratio'],
      textbookFocus: '뺄셈으로 비교하면 차가, 나눗셈으로 비교하면 몇 배인지가 나온다.',
      workbookFocus: '두 방법으로 비교한다.',
    },
    {
      title: '비는 무엇일까요',
      objective: '비의 뜻을 알고 비로 나타낼 수 있다.',
      achievement: 비성취,
      tags: ['ratio'],
      textbookFocus: '두 수를 나눗셈으로 비교하기 위해 기호 :을 사용하여 나타낸 것을 비라고 한다. 3 : 2에서 기준량은 2이다.',
      workbookFocus: '기준량과 비교하는 양을 구별한다.',
    },
    {
      title: '비율은 무엇일까요',
      objective: '비율의 뜻을 알고 분수와 소수로 나타낼 수 있다.',
      achievement: 비율성취,
      tags: ['ratio'],
      textbookFocus: '(비율)=(비교하는 양)÷(기준량)',
      workbookFocus: '비율을 분수와 소수로 나타낸다.',
    },
    {
      title: '생활 속에서 비율을 활용해 볼까요',
      objective: '생활 속 상황에서 비율을 구하여 비교할 수 있다.',
      achievement: 비율성취,
      tags: ['ratio'],
      textbookFocus: '걸린 시간에 대한 간 거리의 비율 등을 구하여 비교한다.',
      workbookFocus: '비율로 비교한다.',
    },
    {
      title: '백분율은 무엇일까요',
      objective: '백분율의 뜻을 알고 비율을 백분율로 나타낼 수 있다.',
      achievement: 비율성취,
      tags: ['ratio'],
      textbookFocus: '기준량을 100으로 할 때의 비율을 백분율이라 하고 %를 쓴다.',
      workbookFocus: '비율을 백분율로 나타낸다.',
    },
    {
      title: '생활 속에서 백분율을 활용해 볼까요',
      objective: '생활 속 상황에서 백분율을 구할 수 있다.',
      achievement: 비율성취,
      tags: ['ratio'],
      textbookFocus: '할인율, 득표율 등을 백분율로 나타낸다.',
      workbookFocus: '백분율을 구하여 비교한다.',
    },
  ]),
  // ── 5단원 띠그래프와 원그래프 ──
  unit(5, '띠그래프와 원그래프', [
    {
      title: '단원 도입',
      objective: '띠그래프와 원그래프가 필요한 상황을 알 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '자료를 비율로 나타내는 상황을 살펴본다.',
      workbookFocus: '백분율을 떠올린다.',
    },
    {
      title: '띠그래프는 무엇일까요',
      objective: '띠그래프를 알고 읽을 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '전체에 대한 각 부분의 비율을 띠 모양에 나타낸 그래프를 띠그래프라고 한다.',
      workbookFocus: '띠그래프를 읽는다.',
    },
    {
      title: '띠그래프로 어떻게 나타낼까요',
      objective: '자료를 띠그래프로 나타낼 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '각 항목의 백분율을 구하고 합계가 100%인지 확인한다.',
      workbookFocus: '띠그래프로 나타낸다.',
    },
    {
      title: '원그래프는 무엇일까요',
      objective: '원그래프를 알고 읽을 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '전체에 대한 각 부분의 비율을 원 모양에 나타낸 그래프를 원그래프라고 한다.',
      workbookFocus: '원그래프를 읽는다.',
    },
    {
      title: '원그래프로 어떻게 나타낼까요',
      objective: '자료를 원그래프로 나타낼 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '각 항목의 백분율을 구하여 원을 나눈다.',
      workbookFocus: '원그래프로 나타낸다.',
    },
    {
      title: '그래프를 어떻게 해석할까요',
      objective: '띠그래프와 원그래프를 해석할 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '비율을 비교하고 전체 수량으로 항목의 수량을 구한다.',
      workbookFocus: '그래프를 해석한다.',
    },
    {
      title: '알맞은 그래프를 알아볼까요',
      objective: '자료에 알맞은 그래프를 고를 수 있다.',
      achievement: 탐구성취,
      tags: ['data'],
      textbookFocus: '그림그래프, 막대그래프, 꺾은선그래프, 띠그래프, 원그래프의 특징을 비교한다.',
      workbookFocus: '알맞은 그래프를 고른다.',
    },
    {
      title: '탐구 문제를 설정하고 자료를 수집하여 해결해 볼까요',
      objective: '자료를 수집하여 알맞은 그래프로 나타내고 해석할 수 있다.',
      achievement: 탐구성취,
      tags: ['data'],
      textbookFocus: '탐구 문제, 자료 수집, 정리, 그래프, 해석의 순서로 해결한다.',
      workbookFocus: '그래프로 나타내고 해석한다.',
    },
  ]),
  // ── 6단원 직육면체의 겉넓이와 부피 ──
  unit(6, '직육면체의 겉넓이와 부피', [
    {
      title: '단원 도입',
      objective: '겉넓이와 부피가 필요한 상황을 알 수 있다.',
      achievement: 겉넓이성취,
      tags: ['volume'],
      textbookFocus: '상자를 포장하거나 채우는 상황을 살펴본다.',
      workbookFocus: '직육면체와 넓이를 떠올린다.',
    },
    {
      title: '직육면체의 겉넓이를 어떻게 구할까요',
      objective: '직육면체와 정육면체의 겉넓이를 구할 수 있다.',
      achievement: 겉넓이성취,
      tags: ['volume'],
      textbookFocus: '여섯 면의 넓이의 합, (세 면의 넓이의 합)×2, (한 밑면의 넓이)×2+(옆면의 넓이)로 구한다.',
      workbookFocus: '겉넓이를 구한다.',
    },
    {
      title: '직육면체의 부피를 어떻게 비교할까요',
      objective: '직육면체의 부피를 여러 가지 방법으로 비교할 수 있다.',
      achievement: 부피성취,
      tags: ['volume'],
      textbookFocus: '쌓기나무 같은 단위 부피의 수로 비교한다.',
      workbookFocus: '부피를 비교한다.',
    },
    {
      title: '직육면체의 부피를 어떻게 구할까요',
      objective: '1 cm³를 알고 직육면체와 정육면체의 부피를 구할 수 있다.',
      achievement: 부피성취,
      tags: ['volume'],
      textbookFocus: '(직육면체의 부피)=(가로)×(세로)×(높이)',
      workbookFocus: '부피를 구한다.',
    },
    {
      title: '1 cm³보다 큰 부피 단위는 무엇일까요',
      objective: '1 m³를 알고 1 cm³와 1 m³의 관계를 알 수 있다.',
      achievement: 부피단위성취,
      tags: ['volume'],
      textbookFocus: '1 m³=1000000 cm³',
      workbookFocus: '부피 단위를 바꾼다.',
    },
  ]),
];

export const lessons61 = curriculum61.flatMap((unitEntry) => unitEntry.lessons);
