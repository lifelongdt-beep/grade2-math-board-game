import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 6학년 2학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명은 동아출판 초등 수학 6-2 교사용 지도서(2022 개정) 각론의
// '단원의 전개 계획'을 그대로 따랐습니다. 6-1과 같은 약속을 지킵니다.
//
// 지도서가 못박아 둔 것(각 단원 '단원 지도 유의 사항'):
//   · 1단원: '역수'라는 말은 중학교에서 배우므로 쓰지 않습니다. 결과를
//     대분수나 기약분수가 아닌 분수로 나타내는 것도 허용하므로, 보기에
//     답과 크기가 같은 다른 꼴을 두지 않습니다.
//   · 2단원: 소수의 나눗셈에서 '나머지'라는 말을 쓰지 않고 '나누어 주고
//     남는 양'으로 다룹니다. 나누어떨어지지 않으면 몫을 반올림합니다.
//   · 3단원: 쌓기나무의 위, 앞, 옆에서 본 모양과 개수.
//   · 4단원: 간단한 자연수의 비, 비례식의 성질(외항의 곱=내항의 곱), 비례배분.
//   · 5단원: 원주율은 3.14를 주로 쓰고, 근삿값임을 압니다. (원의 넓이)=
//     (반지름)×(반지름)×(원주율).
//   · 6단원: 원뿔과 구의 전개도는 다루지 않습니다. 회전체라는 말을
//     직접 쓰지 않습니다.
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
  forbidVisuals: ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'grid-table'],
});

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '6-2';
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
const 분수나눗셈성취 = '[6수01-11] 분수의 나눗셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.';
const 소수나눗셈성취 = '[6수01-15] 소수의 나눗셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.';
const 쌓기개수성취 = '[6수03-09] 쌓기나무로 만든 입체도형을 보고 사용된 쌓기나무의 개수를 구할 수 있다.';
const 쌓기모양성취 = '[6수03-10] 쌓기나무로 만든 입체도형의 위, 앞, 옆에서 본 모양을 표현할 수 있고, 이러한 표현을 보고 입체도형의 모양을 추측할 수 있다.';
const 비례식성취 = '[6수02-04] 비례식을 알고, 그 성질을 이해하며, 이를 활용하여 간단한 비례식을 풀 수 있다.';
const 비례배분성취 = '[6수02-05] 비례배분을 알고, 주어진 양을 비례배분 할 수 있다.';
const 원주율성취 = '[6수03-15] 여러 가지 원 모양 물체의 원주와 지름을 측정하는 활동을 통하여, 원주율이 일정한 값임을 알 수 있다.';
const 원넓이성취 = '[6수03-16] 원주와 원의 넓이를 구하는 방법을 이해하고, 이를 구할 수 있다.';
const 원기둥성취 = '[6수03-07] 원기둥, 원뿔, 구를 이해하고, 구성 요소와 성질을 탐구하고 설명할 수 있다.';
const 원기둥전개도성취 = '[6수03-08] 원기둥의 전개도를 그릴 수 있다.';

export const curriculum62: Unit[] = [
  // ── 1단원 분수의 나눗셈 ──
  unit(1, '분수의 나눗셈', [
    {
      title: '단원 도입',
      objective: '분수의 나눗셈이 필요한 상황을 알 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '(분수)÷(분수)가 필요한 상황을 살펴본다.',
      workbookFocus: '(분수)÷(자연수)를 떠올린다.',
    },
    {
      title: '분모가 같은 (분수)÷(분수)를 어떻게 계산할까요 ⑴',
      objective: '분자끼리 나누어떨어지는 분모가 같은 (분수)÷(분수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '6/7÷2/7=6÷2=3',
      workbookFocus: '분자끼리 나눈다.',
    },
    {
      title: '분모가 같은 (분수)÷(분수)를 어떻게 계산할까요 ⑵',
      objective: '분자끼리 나누어떨어지지 않는 분모가 같은 (분수)÷(분수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '5/9÷2/9=5÷2=5/2=2과 1/2',
      workbookFocus: '분자끼리의 나눗셈 몫을 분수로 나타낸다.',
    },
    {
      title: '(자연수)÷(분수)를 어떻게 계산할까요 ⑴',
      objective: '(자연수)÷(단위분수가 아닌 분수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '6÷2/5: 1/5에 해당하는 양을 구하고 5배 한다.',
      workbookFocus: '(자연수)÷(분수)를 계산한다.',
    },
    {
      title: '(자연수)÷(분수)를 어떻게 계산할까요 ⑵',
      objective: '(자연수)÷(분수)를 곱셈으로 바꾸어 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '(자연수)÷(분수)는 분수의 분모와 분자를 바꾸어 곱한다.',
      workbookFocus: '곱셈으로 바꾸어 계산한다.',
    },
    {
      title: '분모가 다른 (분수)÷(분수)를 어떻게 계산할까요',
      objective: '분모가 다른 (분수)÷(분수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '통분하여 분자끼리 나누거나, 나누는 분수의 분모와 분자를 바꾸어 곱한다.',
      workbookFocus: '분모가 다른 분수의 나눗셈을 한다.',
    },
    {
      title: '분모가 다른 (대분수)÷(분수)를 어떻게 계산할까요',
      objective: '(대분수)÷(분수)를 계산할 수 있다.',
      achievement: 분수나눗셈성취,
      tags: ['fractionDiv'],
      textbookFocus: '대분수를 가분수로 바꾸어 계산한다.',
      workbookFocus: '(대분수)÷(분수)를 계산한다.',
    },
  ]),
  // ── 2단원 소수의 나눗셈 ──
  unit(2, '소수의 나눗셈', [
    {
      title: '단원 도입',
      objective: '소수의 나눗셈이 필요한 상황을 알 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '(소수)÷(소수)가 필요한 상황을 살펴본다.',
      workbookFocus: '(소수)÷(자연수)를 떠올린다.',
    },
    {
      title: '(소수)÷(소수)를 어떻게 계산할까요 ⑴',
      objective: '자연수의 나눗셈을 이용하여 (소수)÷(소수)를 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '나누는 수와 나누어지는 수를 똑같이 10배, 100배 하여도 몫은 같다.',
      workbookFocus: '자연수의 나눗셈으로 바꾼다.',
    },
    {
      title: '(소수)÷(소수)를 어떻게 계산할까요 ⑵',
      objective: '소수 한 자리 수, 두 자리 수의 (소수)÷(소수)를 세로로 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '두 수의 소수점을 똑같이 옮겨 계산한다.',
      workbookFocus: '세로로 계산한다.',
    },
    {
      title: '(소수)÷(소수)를 어떻게 계산할까요 ⑶',
      objective: '자릿수가 다른 (소수)÷(소수)를 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '나누는 수가 자연수가 되도록 소수점을 옮긴다.',
      workbookFocus: '자릿수가 다른 나눗셈을 한다.',
    },
    {
      title: '(자연수)÷(소수)를 어떻게 계산할까요',
      objective: '(자연수)÷(소수)를 계산할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '나누는 수가 자연수가 되도록 두 수에 똑같이 10, 100을 곱한다.',
      workbookFocus: '(자연수)÷(소수)를 계산한다.',
    },
    {
      title: '몫을 반올림하여 어떻게 나타낼까요',
      objective: '나누어떨어지지 않는 나눗셈의 몫을 반올림하여 나타낼 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv', 'rounding'],
      textbookFocus: '몫을 소수 첫째 자리, 둘째 자리까지 반올림한다.',
      workbookFocus: '몫을 반올림한다.',
    },
    {
      title: '나누어 주고 남는 양을 알아볼까요',
      objective: '나누어 주고 남는 양을 구할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv'],
      textbookFocus: '몫을 자연수까지 구하고 남는 양을 구한다.',
      workbookFocus: '나누어 주고 남는 양을 구한다.',
    },
    {
      title: '소수의 나눗셈의 어림셈을 어떻게 할까요',
      objective: '소수의 나눗셈의 몫을 어림할 수 있다.',
      achievement: 소수나눗셈성취,
      tags: ['decimalDiv', 'estimate'],
      textbookFocus: '자연수로 어림하여 몫을 짐작한다.',
      workbookFocus: '어림하여 소수점 위치를 확인한다.',
    },
  ]),
  // ── 3단원 공간과 입체 ──
  unit(3, '공간과 입체', [
    {
      title: '단원 도입',
      objective: '공간과 입체가 필요한 상황을 알 수 있다.',
      achievement: 쌓기모양성취,
      tags: ['solid'],
      textbookFocus: '보는 방향에 따라 모양이 달라지는 상황을 살펴본다.',
      workbookFocus: '쌓기나무를 떠올린다.',
    },
    {
      title: '어느 방향에서 보았는지 어떻게 알까요',
      objective: '보는 방향에 따라 모양이 달라짐을 알 수 있다.',
      achievement: 쌓기모양성취,
      tags: ['solid'],
      textbookFocus: '위, 앞, 옆에서 본 모양을 구별한다.',
      workbookFocus: '보는 방향을 찾는다.',
    },
    {
      title: '쌓은 모양과 쌓기나무의 개수를 어떻게 알까요 ⑴',
      objective: '쌓은 모양을 보고 쌓기나무의 개수를 알 수 있다.',
      achievement: 쌓기개수성취,
      tags: ['solid'],
      textbookFocus: '보이지 않는 쌓기나무까지 생각하여 센다.',
      workbookFocus: '개수를 센다.',
    },
    {
      title: '쌓은 모양의 위, 앞, 옆에서 본 모양을 어떻게 표현할까요',
      objective: '쌓은 모양을 위, 앞, 옆에서 본 모양으로 나타낼 수 있다.',
      achievement: 쌓기모양성취,
      tags: ['solid'],
      textbookFocus: '앞에서 본 모양은 각 줄에서 가장 높은 층으로 정해진다.',
      workbookFocus: '본 모양을 그린다.',
    },
    {
      title: '위, 앞, 옆에서 본 모양을 보고 쌓은 모양을 추측해 볼까요',
      objective: '위, 앞, 옆에서 본 모양으로 쌓은 모양과 개수를 추측할 수 있다.',
      achievement: 쌓기모양성취,
      tags: ['solid'],
      textbookFocus: '위에서 본 모양으로 바닥을 정하고 앞과 옆으로 층을 정한다.',
      workbookFocus: '쌓은 모양을 추측한다.',
    },
    {
      title: '쌓은 모양과 쌓기나무의 개수를 어떻게 알까요 ⑵',
      objective: '위에서 본 모양에 수를 써서 개수를 알 수 있다.',
      achievement: 쌓기개수성취,
      tags: ['solid'],
      textbookFocus: '위에서 본 모양의 각 칸에 쌓인 개수를 쓴다.',
      workbookFocus: '수를 써서 개수를 구한다.',
    },
    {
      title: '쌓은 모양과 쌓기나무의 개수를 어떻게 알까요 ⑶',
      objective: '층별로 나타낸 모양으로 개수를 알 수 있다.',
      achievement: 쌓기개수성취,
      tags: ['solid'],
      textbookFocus: '1층, 2층, 3층의 모양을 그려 개수를 구한다.',
      workbookFocus: '층별 모양으로 개수를 구한다.',
    },
    {
      title: '여러 가지 모양을 어떻게 만들까요',
      objective: '쌓기나무로 여러 가지 모양을 만들 수 있다.',
      achievement: 쌓기모양성취,
      tags: ['solid'],
      textbookFocus: '쌓기나무 4개로 만들 수 있는 모양을 찾는다.',
      workbookFocus: '돌리거나 뒤집어 같은 모양을 찾는다.',
    },
  ]),
  // ── 4단원 비례식과 비례배분 ──
  unit(4, '비례식과 비례배분', [
    {
      title: '단원 도입',
      objective: '비례식과 비례배분이 필요한 상황을 알 수 있다.',
      achievement: 비례식성취,
      tags: ['ratio'],
      textbookFocus: '비를 떠올리고 필요한 상황을 살펴본다.',
      workbookFocus: '비와 비율을 떠올린다.',
    },
    {
      title: '비에는 어떤 성질이 있을까요',
      objective: '비의 성질을 알 수 있다.',
      achievement: 비례식성취,
      tags: ['ratio'],
      textbookFocus: '비의 전항과 후항에 0이 아닌 같은 수를 곱하거나 나누어도 비율은 같다.',
      workbookFocus: '비의 성질로 비율이 같은 비를 만든다.',
    },
    {
      title: '간단한 자연수의 비로 어떻게 나타낼까요',
      objective: '비를 간단한 자연수의 비로 나타낼 수 있다.',
      achievement: 비례식성취,
      tags: ['ratio'],
      textbookFocus: '소수, 분수의 비를 간단한 자연수의 비로 나타낸다.',
      workbookFocus: '간단한 자연수의 비로 나타낸다.',
    },
    {
      title: '비례식은 무엇일까요',
      objective: '비례식의 뜻을 알고 외항과 내항을 구별할 수 있다.',
      achievement: 비례식성취,
      tags: ['ratio'],
      textbookFocus: '비율이 같은 두 비를 기호 =를 써서 나타낸 식을 비례식이라고 한다.',
      workbookFocus: '외항과 내항을 찾는다.',
    },
    {
      title: '비례식에는 어떤 성질이 있을까요',
      objective: '비례식의 성질을 알 수 있다.',
      achievement: 비례식성취,
      tags: ['ratio'],
      textbookFocus: '비례식에서 외항의 곱과 내항의 곱은 같다.',
      workbookFocus: '비례식의 성질로 □를 구한다.',
    },
    {
      title: '비례식을 활용해 볼까요',
      objective: '비례식을 활용하여 문제를 해결할 수 있다.',
      achievement: 비례식성취,
      tags: ['ratio'],
      textbookFocus: '구하려는 것을 □로 하여 비례식을 세운다.',
      workbookFocus: '비례식을 세워 푼다.',
    },
    {
      title: '비례배분은 무엇일까요',
      objective: '주어진 양을 비례배분 할 수 있다.',
      achievement: 비례배분성취,
      tags: ['ratio'],
      textbookFocus: '전체를 주어진 비로 배분하는 것을 비례배분이라고 한다.',
      workbookFocus: '비례배분 한다.',
    },
  ]),
  // ── 5단원 원주율과 원의 넓이 ──
  unit(5, '원주율과 원의 넓이', [
    {
      title: '단원 도입',
      objective: '원주와 원의 넓이가 필요한 상황을 알 수 있다.',
      achievement: 원주율성취,
      tags: ['measurement'],
      textbookFocus: '원 모양 물건을 살펴본다.',
      workbookFocus: '원의 지름과 반지름을 떠올린다.',
    },
    {
      title: '원주와 지름에는 어떤 관계가 있을까요',
      objective: '원주와 지름의 관계를 알 수 있다.',
      achievement: 원주율성취,
      tags: ['measurement'],
      textbookFocus: '원주는 지름의 3배보다 길고 4배보다 짧다.',
      workbookFocus: '원주와 지름을 비교한다.',
    },
    {
      title: '원주율은 무엇일까요',
      objective: '원주율의 뜻을 알 수 있다.',
      achievement: 원주율성취,
      tags: ['measurement'],
      textbookFocus: '원의 지름에 대한 원주의 비율을 원주율이라 하며 3.14로 어림하여 쓴다.',
      workbookFocus: '원주율을 구한다.',
    },
    {
      title: '원주를 어떻게 구할까요',
      objective: '원주와 지름을 구할 수 있다.',
      achievement: 원넓이성취,
      tags: ['measurement'],
      textbookFocus: '(원주)=(지름)×(원주율), (지름)=(원주)÷(원주율)',
      workbookFocus: '원주와 지름을 구한다.',
    },
    {
      title: '원의 넓이를 어떻게 어림할까요',
      objective: '원의 넓이를 어림할 수 있다.',
      achievement: 원넓이성취,
      tags: ['area'],
      textbookFocus: '원 안과 밖의 정사각형 넓이로 원의 넓이를 어림한다.',
      workbookFocus: '원의 넓이를 어림한다.',
    },
    {
      title: '원의 넓이를 어떻게 구할까요',
      objective: '원의 넓이를 구할 수 있다.',
      achievement: 원넓이성취,
      tags: ['area'],
      textbookFocus: '(원의 넓이)=(반지름)×(반지름)×(원주율)',
      workbookFocus: '원의 넓이를 구한다.',
    },
    {
      title: '원의 넓이를 활용해 볼까요',
      objective: '여러 가지 원의 넓이를 구할 수 있다.',
      achievement: 원넓이성취,
      tags: ['area'],
      textbookFocus: '원의 넓이를 이용하여 여러 가지 모양의 넓이를 구한다.',
      workbookFocus: '여러 가지 넓이를 구한다.',
    },
  ]),
  // ── 6단원 원기둥, 원뿔, 구 ──
  unit(6, '원기둥, 원뿔, 구', [
    {
      title: '단원 도입',
      objective: '원기둥, 원뿔, 구가 필요한 상황을 알 수 있다.',
      achievement: 원기둥성취,
      tags: ['solid'],
      textbookFocus: '생활에서 둥근 입체도형을 찾는다.',
      workbookFocus: '각기둥과 각뿔을 떠올린다.',
    },
    {
      title: '원기둥은 무엇일까요',
      objective: '원기둥과 구성 요소를 알 수 있다.',
      achievement: 원기둥성취,
      tags: ['solid'],
      textbookFocus: '서로 평행하고 합동인 두 원을 밑면으로 하는 입체도형을 원기둥이라고 한다.',
      workbookFocus: '밑면, 옆면, 높이를 찾는다.',
    },
    {
      title: '원기둥의 전개도는 무엇일까요',
      objective: '원기둥의 전개도를 알 수 있다.',
      achievement: 원기둥전개도성취,
      tags: ['solid'],
      textbookFocus: '원기둥의 전개도에서 옆면은 직사각형이고 가로는 밑면의 둘레와 같다.',
      workbookFocus: '전개도의 길이를 구한다.',
    },
    {
      title: '원뿔은 무엇일까요',
      objective: '원뿔과 구성 요소를 알 수 있다.',
      achievement: 원기둥성취,
      tags: ['solid'],
      textbookFocus: '밑면이 원이고 옆면이 굽은 면인 뿔 모양의 입체도형을 원뿔이라고 한다.',
      workbookFocus: '모선, 높이, 원뿔의 꼭짓점을 찾는다.',
    },
    {
      title: '구는 무엇일까요',
      objective: '구와 구성 요소를 알 수 있다.',
      achievement: 원기둥성취,
      tags: ['solid'],
      textbookFocus: '공 모양의 입체도형을 구라고 한다. 구의 중심, 구의 반지름.',
      workbookFocus: '구의 반지름을 찾는다.',
    },
  ]),
];

export const lessons62 = curriculum62.flatMap((unitEntry) => unitEntry.lessons);
