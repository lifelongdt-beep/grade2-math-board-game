import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 3학년 1학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명·학습 목표·성취기준은 동아출판 초등 수학 3-1 교사용 지도서
// (2022 개정 교육과정) 각론의 '단원의 전개 계획'과 '단원 학습 목표'를
// 그대로 따랐습니다.
//
// 5학년과 같은 약속을 지킵니다.
//   · 단원 끝의 '뚝딱! 해결해요'(단원 평가), '함께! 놀아요'(놀이),
//     '곰곰! 생각해요'(프로젝트)는 문항을 만들 차시가 아니므로 넣지
//     않습니다. 복습은 앱의 '단원 종합', '학기 종합'을 씁니다.
//   · 지도서가 한 주제에 두 차시를 주는 곳은 한 차시로 둡니다.
//
// 단원은 문항을 다 만든 것부터 하나씩 붙입니다. 문항이 없는 단원을
// 먼저 붙이면 그 차시가 2학년 생성기로 떨어져 2학년 문제가 나옵니다.
//
// 지도서가 못박아 둔 것 가운데 문항에 그대로 영향을 주는 것:
//   · 1단원 "덧셈은 세 자리 수의 범위에서 다루되, 합이 네 자리 수인
//     경우도 포함한다." 그래서 받아올림이 여러 번 있는 4차시에는 합이
//     1000을 넘는 식도 냅니다.
//   · 1단원 어림셈은 두 수를 각각 가까운 몇백으로 어림해 계산합니다
//     (지도서 605+403 → 600+400, 812-589 → 800-600). '반올림'이라는
//     말은 5학년에서 배우므로 쓰지 않습니다. 가운데에 걸리는 수(250
//     같은)는 어느 쪽으로 어림할지 정해지지 않으므로 내지 않습니다.
//   · 2단원 "직사각형과 정사각형의 포함 관계는 다루지 않도록 한다."
//     직사각형을 고르는 문항에 정사각형을 넣지 않습니다.
//   · 2단원 지도서 2~3차시 '선분, 직선, 반직선은 무엇일까요'는 한
//     차시로 둡니다.
//   · 3단원 나눗셈은 곱셈구구 안에서 나누어떨어지는 것만 다룹니다(나머지는
//     3-2). 0을 나누거나 0으로 나누는 것은 다루지 않습니다.
//   · 4단원 곱셈은 (두 자리 수)×(한 자리 수)이고, 차시마다 올림이 일어나는
//     자리가 정해져 있습니다(2 없음, 3 십의 자리, 4 일의 자리, 5 두 번).
//     어림셈은 두 자리 수를 가까운 몇십으로 어림합니다(19×7 → 20×7).
//   · 5단원 "1 km와 1 cm의 관계 등의 지나친 단위 환산은 다루지 않는다."
//     cm↔mm, km↔m만 바꿉니다. 시간의 계산은 분·초와 시각으로 합니다.
//   · 6단원 분수는 전체가 1인 연속량(띠·원·사각형)을 똑같이 나누는
//     것으로만 다룹니다. 사탕 12개의 1/3 같은 이산량은 3-2에서
//     배웁니다. '똑같이 나눈 것'은 조각의 모양과 크기가 같은 것입니다
//     (넓이 모델은 넓이를 배운 뒤). 가분수·대분수는 3-2입니다.
//     크기 비교는 단위분수끼리와 분모가 같은 분수끼리만 합니다.
//   · 6단원 소수는 소수 한 자리 수만 다룹니다. 학생에게 '대소수',
//     '자연수 부분'이라는 말을 쓰지 않고 '소수점 왼쪽 부분'이라고
//     합니다. 들이·무게(L, kg)는 3-2라서 소수의 단위로 쓰지 않습니다.
//     지도서 7~8차시 '소수를 알아볼까요 ⑴'은 한 차시로 둡니다.
//   · 1단원 차시마다 받아올림·받아내림의 횟수가 정해져 있습니다.
//     2차시 받아올림 없음, 3차시 한 번, 4차시 여러 번,
//     6차시 받아내림 없음, 7차시 한 번, 8차시 두 번.
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

// 3학년 문항은 차시마다 자기 수를 직접 고르므로(grade31 폴더)
// maxNumber가 문항을 자르는 일은 없습니다. 단원 종합·학기 종합처럼
// 차시를 섞어 쓰는 곳에서 읽으므로 비워 두지 않습니다.
const scopeFor = (unitTitle: string, lessonNo: number): LessonScope => {
  // 2학년 전용 그림이 섞이지 않게 막아 둡니다.
  const forbidVisuals = ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern'];
  if (unitTitle === '길이와 시간') {
    // 자와 초바늘 시계를 그려야 하므로 ruler, clock은 막지 않습니다.
    return { maxNumber: 10000, representation: 'semi', forbidVisuals: forbidVisuals.filter((kind) => kind !== 'ruler' && kind !== 'clock') };
  }
  if (unitTitle === '분수와 소수') {
    return { maxNumber: 100, representation: 'semi', forbidVisuals };
  }
  if (unitTitle === '곱셈') {
    return { maxNumber: 900, representation: lessonNo <= 2 ? 'semi' : 'symbolic', forbidVisuals };
  }
  if (unitTitle === '나눗셈') {
    return { maxNumber: 81, representation: lessonNo <= 3 ? 'semi' : 'symbolic', forbidVisuals };
  }
  if (unitTitle === '평면도형') {
    return { maxNumber: 100, representation: 'semi', forbidVisuals };
  }
  if (unitTitle === '덧셈과 뺄셈') {
    return { maxNumber: 2000, representation: lessonNo <= 1 ? 'semi' : 'symbolic', forbidVisuals };
  }
  return { maxNumber: 1000, representation: 'symbolic', forbidVisuals };
};

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '3-1';
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
      scope: scopeFor(title, index + 1),
    })),
  };
};

const 덧뺄성취 = '[4수01-03] 세 자리 수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 선성취 = '[4수03-01] 직선, 선분, 반직선을 이해하고 구별할 수 있다.';
const 각성취 = '[4수03-02] 각과 직각을 이해하고, 직각과 비교하는 활동을 통하여 예각과 둔각을 구별할 수 있다.';
const 삼각형성취 = '[4수03-09] 여러 가지 모양의 삼각형에 대한 분류 활동을 통하여 직각삼각형, 예각삼각형, 둔각삼각형을 이해한다.';
const 사각형성취 = '[4수03-10] 여러 가지 모양의 사각형에 대한 분류 활동을 통하여 직사각형, 정사각형, 사다리꼴, 평행사변형, 마름모를 이해하고, 그 성질을 탐구하고 설명할 수 있다.';
const 나눗셈성취 = '[4수01-05] 나눗셈이 이루어지는 실생활 상황과 연결하여 나눗셈의 의미를 알고, 곱셈과 나눗셈의 관계를 이해한다.';
const 나눗셈몫성취 = '[4수01-06] 나누는 수가 한 자리 수인 나눗셈의 계산 원리를 이해하고 그 계산을 할 수 있으며, 나눗셈에서 몫과 나머지의 의미를 안다.';
const 곱셈성취 = '[4수01-04] 곱하는 수가 한 자리 수 또는 두 자리 수인 곱셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 시각성취 = '[4수03-13] 1분과 1초의 관계를 이해하고, 초 단위까지 시각을 읽을 수 있다.';
const 시간계산성취 = '[4수03-14] 실생활 문제 상황과 연결하여 초 단위까지의 시간의 덧셈과 뺄셈을 할 수 있다.';
const mmkm성취 = '[4수03-15] 길이 단위 1 mm와 1 km를 알고, 이를 이용하여 길이를 측정하고 어림하며 수학의 유용성을 인식할 수 있다.';
const 길이관계성취 = '[4수03-16] 1 cm와 1 mm, 1 km와 1 m의 관계를 이해하고, 길이를 ‘몇 cm 몇 mm’와 ‘몇 mm’, ‘몇 km 몇 m’와 ‘몇 m’로 다양하게 표현할 수 있다.';
const 분수성취 = '[4수01-09] 양의 등분할을 통하여 분수의 필요성을 인식하고, 분수를 이해하고 읽고 쓸 수 있다.';
const 분수비교성취 = '[4수01-11] 분모가 같은 분수끼리, 단위분수끼리 크기를 비교하고 그 방법을 설명할 수 있다.';
const 소수성취 = '[4수01-12] 분모가 10인 진분수와 연결하여 소수 한 자리 수를 이해하고 읽고 쓸 수 있다.';
const 소수비교성취 = '[4수01-14] 소수의 크기를 비교하고 그 방법을 설명할 수 있다.';
const 어림성취 = '[4수01-08] 자연수의 덧셈, 뺄셈, 곱셈, 나눗셈과 관련한 여러 가지 상황에서 어림셈을 할 수 있다.';

export const curriculum31: Unit[] = [
  // ── 1단원 덧셈과 뺄셈 (지도서 12차시 중 1~9차시) ─────────────────
  unit(1, '덧셈과 뺄셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 덧뺄성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '실생활에서 세 자리 수의 덧셈과 뺄셈이 필요한 상황을 살펴본다.',
      workbookFocus: '받아올림이 있는 두 자리 수의 덧셈과 받아내림이 있는 두 자리 수의 뺄셈, 세 자리 수의 자릿값을 떠올린다.',
    },
    {
      title: '받아올림이 없는 세 자리 수의 덧셈을 어떻게 할까요',
      objective: '받아올림이 없는 세 자리 수의 덧셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: 덧뺄성취,
      tags: ['addition'],
      textbookFocus: '수 모형으로 324+215를 계산하며 같은 자리끼리 더하는 원리를 알아본다.',
      workbookFocus: '각 자리에 맞추어 숫자를 쓰고 일의 자리, 십의 자리, 백의 자리끼리 더한다.',
    },
    {
      title: '받아올림이 한 번 있는 세 자리 수의 덧셈을 어떻게 할까요',
      objective: '받아올림이 한 번 있는 세 자리 수의 덧셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: 덧뺄성취,
      tags: ['addition'],
      textbookFocus: '수 모형으로 219+126을 계산하며 일 모형 10개를 십 모형 1개로 바꾸는 원리를 알아본다.',
      workbookFocus: '같은 자리의 합이 10이거나 10보다 크면 바로 윗자리로 받아올림하여 계산한다.',
    },
    {
      title: '받아올림이 여러 번 있는 세 자리 수의 덧셈을 어떻게 할까요',
      objective: '받아올림이 여러 번 있는 세 자리 수의 덧셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: 덧뺄성취,
      tags: ['addition'],
      textbookFocus: '수 모형으로 265+249, 597+654를 계산하며 받아올림이 여러 번 있는 덧셈을 알아본다.',
      workbookFocus: '받아올림한 수를 빠뜨리지 않고 더하며, 합이 네 자리 수가 되는 경우도 계산한다.',
    },
    {
      title: '덧셈의 어림셈을 어떻게 할까요',
      objective: '세 자리 수의 덧셈의 어림셈을 할 수 있다.',
      achievement: 어림성취,
      tags: ['estimate'],
      textbookFocus: '두 수를 각각 가까운 몇백으로 어림하여 어림셈을 하기 위한 덧셈식으로 나타낸다.',
      workbookFocus: '어림셈으로 구한 값을 이용하여 주장이 옳은지 판단한다.',
    },
    {
      title: '받아내림이 없는 세 자리 수의 뺄셈을 어떻게 할까요',
      objective: '받아내림이 없는 세 자리 수의 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: 덧뺄성취,
      tags: ['subtraction'],
      textbookFocus: '수 모형으로 369-235를 계산하며 같은 자리끼리 빼는 원리를 알아본다.',
      workbookFocus: '각 자리에 맞추어 숫자를 쓰고 일의 자리, 십의 자리, 백의 자리끼리 뺀다.',
    },
    {
      title: '받아내림이 한 번 있는 세 자리 수의 뺄셈을 어떻게 할까요',
      objective: '받아내림이 한 번 있는 세 자리 수의 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: 덧뺄성취,
      tags: ['subtraction'],
      textbookFocus: '수 모형으로 475-328을 계산하며 십 모형 1개를 일 모형 10개로 바꾸는 원리를 알아본다.',
      workbookFocus: '같은 자리끼리 뺄 수 없으면 바로 윗자리에서 받아내림하여 계산한다.',
    },
    {
      title: '받아내림이 두 번 있는 세 자리 수의 뺄셈을 어떻게 할까요',
      objective: '받아내림이 두 번 있는 세 자리 수의 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: 덧뺄성취,
      tags: ['subtraction'],
      textbookFocus: '수 모형으로 346-178을 계산하며 받아내림이 두 번 있는 뺄셈을 알아본다.',
      workbookFocus: '받아내림한 자리에서 1을 빼는 것을 잊지 않고 계산하며, 십의 자리가 0인 수의 뺄셈도 계산한다.',
    },
    {
      title: '뺄셈의 어림셈을 어떻게 할까요',
      objective: '세 자리 수의 뺄셈의 어림셈을 할 수 있다.',
      achievement: 어림성취,
      tags: ['estimate'],
      textbookFocus: '두 수를 각각 가까운 몇백으로 어림하여 어림셈을 하기 위한 뺄셈식으로 나타낸다.',
      workbookFocus: '어림셈으로 구한 값을 이용하여 주장이 옳은지 판단한다.',
    },
  ]),
  // ── 2단원 평면도형 (지도서 11차시 중 1~8차시) ────────────────────
  unit(2, '평면도형', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 선성취,
      tags: ['shape'],
      textbookFocus: '놀이판에서 곧은 선과 굽은 선, 여러 가지 평면도형을 찾아본다.',
      workbookFocus: '삼각형, 사각형, 원의 변과 꼭짓점을 떠올린다.',
    },
    {
      title: '선분, 직선, 반직선은 무엇일까요',
      objective: '선분, 직선, 반직선을 이해하고 구별할 수 있다.',
      achievement: 선성취,
      tags: ['shape'],
      textbookFocus: '곧은 선과 굽은 선을 분류하고 선분, 직선, 반직선을 약속한다.',
      workbookFocus: '선분 ㄱㄴ, 직선 ㄱㄴ, 반직선 ㄱㄴ을 구별하고 반직선 ㄱㄴ과 반직선 ㄴㄱ의 다른 점을 말한다.',
    },
    {
      title: '각은 무엇일까요',
      objective: '각을 이해하고 각의 구성 요소를 알 수 있다.',
      achievement: 각성취,
      tags: ['shape'],
      textbookFocus: '한 점에서 그은 두 반직선으로 이루어진 도형을 각이라고 약속한다.',
      workbookFocus: '각의 꼭짓점과 변을 알고 각 ㄱㄴㄷ처럼 꼭짓점을 가운데에 두고 읽는다.',
    },
    {
      title: '직각은 무엇일까요',
      objective: '직각을 이해하고 직각을 찾거나 그릴 수 있다.',
      achievement: 각성취,
      tags: ['shape'],
      textbookFocus: '종이를 반듯하게 두 번 접어 직각을 만들고 삼각자의 직각과 비교한다.',
      workbookFocus: '삼각자를 이용하여 직각을 찾고 그린다.',
    },
    {
      title: '직각삼각형은 무엇일까요',
      objective: '직각삼각형을 이해하고 여러 가지 직각삼각형을 만들고 그릴 수 있다.',
      achievement: 삼각형성취,
      tags: ['shape'],
      textbookFocus: '여러 가지 삼각형을 분류하여 한 각이 직각인 삼각형을 직각삼각형이라고 약속한다.',
      workbookFocus: '여러 가지 삼각형 중에서 직각삼각형을 찾는다.',
    },
    {
      title: '직사각형은 무엇일까요',
      objective: '직사각형을 이해하고 여러 가지 직사각형을 만들고 그릴 수 있다.',
      achievement: 사각형성취,
      tags: ['shape'],
      textbookFocus: '여러 가지 사각형을 분류하여 네 각이 모두 직각인 사각형을 직사각형이라고 약속한다.',
      workbookFocus: '여러 가지 사각형 중에서 직사각형을 찾는다.',
    },
    {
      title: '정사각형은 무엇일까요',
      objective: '정사각형을 이해하고 여러 가지 정사각형을 만들고 그릴 수 있다.',
      achievement: 사각형성취,
      tags: ['shape'],
      textbookFocus: '사각형을 각의 크기와 변의 길이에 따라 분류하여 정사각형을 약속한다.',
      workbookFocus: '직사각형 모양의 종이를 접고 잘라 정사각형을 만든다.',
    },
  ]),
  // ── 3단원 나눗셈 (지도서 8차시 중 1~5차시) ──────────────────────
  unit(3, '나눗셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '생활에서 똑같이 나누는 상황을 살펴본다.',
      workbookFocus: '곱셈구구를 떠올리고 물건을 똑같이 나누어 본다.',
    },
    {
      title: '어떻게 똑같이 나눌까요 ⑴',
      objective: '똑같이 나누는 활동을 통해 나눗셈을 이해하고 나눗셈식으로 나타낼 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '색종이 8장을 2명이 똑같이 나누어 가지는 상황에서 8÷2=4를 알아본다.',
      workbookFocus: '나눗셈식을 읽고 나누어지는 수, 나누는 수, 몫을 구별한다.',
    },
    {
      title: '어떻게 똑같이 나눌까요 ⑵',
      objective: '몇씩 묶어 덜어 내는 활동을 통해 나눗셈을 이해하고 나눗셈식으로 나타낼 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '떡 12개를 한 접시에 3개씩 담는 상황을 뺄셈식과 나눗셈식으로 나타낸다.',
      workbookFocus: '전체를 몇씩 묶으면 몇 묶음이 되는지 나눗셈으로 구한다.',
    },
    {
      title: '곱셈과 나눗셈은 어떤 관계일까요',
      objective: '곱셈과 나눗셈의 관계를 이해할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '한 가지 상황을 곱셈식과 나눗셈식으로 나타낸다.',
      workbookFocus: '곱셈식 하나를 나눗셈식 두 개로, 나눗셈식을 곱셈식으로 나타낸다.',
    },
    {
      title: '나눗셈의 몫을 곱셈으로 어떻게 구할까요',
      objective: '나눗셈의 몫을 곱셈식과 곱셈구구로 구할 수 있다.',
      achievement: 나눗셈몫성취,
      tags: ['division'],
      textbookFocus: '학생 10명을 2모둠으로 똑같이 나누는 상황에서 몫을 곱셈식으로 구한다.',
      workbookFocus: '나누는 수의 단 곱셈구구를 이용하여 나눗셈의 몫을 구한다.',
    },
  ]),
  // ── 4단원 곱셈 (지도서 9차시 중 1~6차시) ────────────────────────
  unit(4, '곱셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '생활에서 같은 수를 여러 번 더하는 곱셈 상황을 살펴본다.',
      workbookFocus: '곱셈구구와 (몇십)×(몇)을 떠올린다.',
    },
    {
      title: '올림이 없는 (두 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '올림이 없는 (두 자리 수)×(한 자리 수)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '수 모형으로 21×3을 계산하며 20×3과 1×3을 더하는 원리를 알아본다.',
      workbookFocus: '일의 자리와 십의 자리를 각각 곱하여 세로로 계산한다.',
    },
    {
      title: '십의 자리에서 올림이 있는 (두 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '십의 자리에서 올림이 있는 (두 자리 수)×(한 자리 수)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '수 모형으로 32×4를 계산하며 십의 자리를 곱한 값이 백을 넘는 경우를 알아본다.',
      workbookFocus: '70×2를 7×2=14로 쓰지 않고 140으로 계산한다.',
    },
    {
      title: '일의 자리에서 올림이 있는 (두 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '일의 자리에서 올림이 있는 (두 자리 수)×(한 자리 수)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '수 모형으로 18×2를 계산하며 일 모형 10개를 십 모형 1개로 바꾸는 원리를 알아본다.',
      workbookFocus: '일의 자리에서 올림한 수를 십의 자리를 곱한 값에 더한다.',
    },
    {
      title: '올림이 두 번 있는 (두 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '올림이 두 번 있는 (두 자리 수)×(한 자리 수)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '수 모형으로 36×4를 계산하며 올림이 두 번 있는 곱셈을 알아본다.',
      workbookFocus: '세로 계산에서 24는 6×4, 120은 30×4의 값임을 알고 계산한다.',
    },
    {
      title: '곱셈의 어림셈을 어떻게 할까요',
      objective: '(두 자리 수)×(한 자리 수)의 계산 결과를 어림하고 그 결과가 타당한지 확인할 수 있다.',
      achievement: 어림성취,
      tags: ['multiplication'],
      textbookFocus: '48×9를 50×9로 어림하여 계산 결과가 타당한지 확인한다.',
      workbookFocus: '곱해지는 수를 가까운 몇십으로 어림하여 어림셈을 한다.',
    },
  ]),
  // ── 5단원 길이와 시간 (지도서 11차시 중 1~8차시) ────────────────
  unit(5, '길이와 시간', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 길이관계성취,
      tags: ['measurement', 'time'],
      textbookFocus: '가족 여행, 운동회 등 생활에서 길이와 시간을 재는 상황을 살펴본다.',
      workbookFocus: '1 m=100 cm, 1시간=60분을 떠올린다.',
    },
    {
      title: 'cm보다 작은 단위는 무엇일까요',
      objective: '1 mm를 알고 길이를 몇 cm 몇 mm, 몇 mm로 나타낼 수 있다.',
      achievement: 길이관계성취,
      tags: ['measurement'],
      textbookFocus: '키를 정확하게 재는 상황에서 cm보다 작은 단위 1 mm의 필요성을 안다.',
      workbookFocus: '자의 작은 눈금을 읽어 몇 cm 몇 mm로 나타낸다.',
    },
    {
      title: 'm보다 큰 단위는 무엇일까요',
      objective: '1 km를 알고 길이를 몇 km 몇 m, 몇 m로 나타낼 수 있다.',
      achievement: 길이관계성취,
      tags: ['measurement'],
      textbookFocus: '먼 거리를 나타내는 상황에서 m보다 큰 단위 1 km의 필요성을 안다.',
      workbookFocus: '1 km=1000 m를 이용하여 길이를 바꾸어 나타낸다.',
    },
    {
      title: '길이를 어떻게 어림하고 잴까요',
      objective: '길이를 어림하고 재어 볼 수 있다.',
      achievement: mmkm성취,
      tags: ['measurement'],
      textbookFocus: '내 몸의 일부나 알고 있는 길이를 이용하여 길이를 어림하고 잰다.',
      workbookFocus: '알맞은 단위를 골라 길이를 어림하고, 눈금에 맞지 않으면 ‘약’으로 나타낸다.',
    },
    {
      title: '분보다 작은 단위는 무엇일까요',
      objective: '1초를 알고 초 단위까지 시각을 읽을 수 있다.',
      achievement: 시각성취,
      tags: ['time'],
      textbookFocus: '초바늘이 작은 눈금 한 칸을 가는 시간이 1초임을 안다.',
      workbookFocus: '1분=60초를 이용하여 시간을 바꾸어 나타내고, 시각을 몇 시 몇 분 몇 초로 읽는다.',
    },
    {
      title: '시간의 덧셈을 어떻게 할까요',
      objective: '초 단위까지의 시간의 덧셈을 할 수 있다.',
      achievement: 시간계산성취,
      tags: ['time'],
      textbookFocus: '2분 30초+1분 50초, 9시 10분 20초+2분 30초를 계산한다.',
      workbookFocus: '초는 초끼리, 분은 분끼리 더하고 60초는 1분으로 받아올린다.',
    },
    {
      title: '시간의 뺄셈을 어떻게 할까요',
      objective: '초 단위까지의 시간의 뺄셈을 할 수 있다.',
      achievement: 시간계산성취,
      tags: ['time'],
      textbookFocus: '3분 10초-1분 40초, 1시 33분 20초-2분 10초를 계산한다.',
      workbookFocus: '초끼리 뺄 수 없으면 1분을 60초로 받아내린다.',
    },
  ]),
  // ── 6단원 분수와 소수 (지도서 13차시 중 1~10차시, 7~8차시는 한 차시) ──
  unit(6, '분수와 소수', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 분수성취,
      tags: ['fraction', 'decimal'],
      textbookFocus: '팬케이크 한 판을 4조각으로 나눈 것 중 1조각처럼 1보다 작은 양을 나타내야 하는 상황을 살펴본다.',
      workbookFocus: '1 cm=10 mm, 3 cm 2 mm=32 mm를 떠올린다.',
    },
    {
      title: '하나를 똑같이 나누려면 어떻게 해야 할까요',
      objective: '전체를 똑같이 나눌 수 있다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '똑같이 둘, 셋, 넷으로 나누어진 도형을 찾는다.',
      workbookFocus: '나눈 조각의 모양과 크기가 같은지 확인한다.',
    },
    {
      title: '분수를 알아볼까요 ⑴',
      objective: '전체에 대한 부분의 크기로서의 분수를 이해하고 분수를 쓰고 읽을 수 있다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '전체를 똑같이 3으로 나눈 것 중의 2를 2/3라 쓰고 3분의 2라고 읽는다.',
      workbookFocus: '색칠한 부분은 전체의 얼마인지 분수로 나타내고, 분모와 분자를 말한다.',
    },
    {
      title: '분수를 알아볼까요 ⑵',
      objective: '전체와 부분의 관계를 분수로 나타내고, 부분을 보고 전체를 알 수 있다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '먹은 부분이 전체의 1/3이면 남은 부분은 전체의 2/3임을 안다.',
      workbookFocus: '분수만큼 색칠하고, 부분을 보고 전체를 완성한다.',
    },
    {
      title: '단위분수의 크기를 어떻게 비교할까요',
      objective: '단위분수를 이해하고 단위분수의 크기를 비교할 수 있다.',
      achievement: 분수비교성취,
      tags: ['fraction'],
      textbookFocus: '1/2, 1/3, 1/4처럼 분자가 1인 분수를 단위분수라고 한다.',
      workbookFocus: '단위분수는 분모가 클수록 더 작다.',
    },
    {
      title: '분모가 같은 분수의 크기를 어떻게 비교할까요',
      objective: '분모가 같은 분수의 크기를 비교할 수 있다.',
      achievement: 분수비교성취,
      tags: ['fraction'],
      textbookFocus: '3/5은 1/5이 3개, 2/5는 1/5이 2개이므로 3/5이 더 크다.',
      workbookFocus: '분모가 같으면 분자가 큰 분수가 더 크다.',
    },
    {
      title: '소수를 알아볼까요 ⑴',
      objective: '분모가 10인 분수를 통하여 소수를 이해하고 쓰고 읽을 수 있다.',
      achievement: 소수성취,
      tags: ['decimal'],
      textbookFocus: '1/10 cm=0.1 cm처럼 1/10, 2/10, …, 9/10을 0.1, 0.2, …, 0.9라 쓴다.',
      workbookFocus: '0.7은 0.1이 7개인 수임을 알고, 영 점 칠이라고 읽는다.',
    },
    {
      title: '소수를 알아볼까요 ⑵',
      objective: '자연수와 소수로 이루어진 소수를 이해하고 쓰고 읽을 수 있다.',
      achievement: 소수성취,
      tags: ['decimal'],
      textbookFocus: '7 cm 6 mm=7.6 cm처럼 7과 0.6만큼을 7.6이라 쓰고 칠 점 육이라고 읽는다.',
      workbookFocus: '1은 0.1이 10개이고, 2.4는 0.1이 24개이다.',
    },
    {
      title: '소수의 크기를 어떻게 비교할까요',
      objective: '소수의 크기를 비교할 수 있다.',
      achievement: 소수비교성취,
      tags: ['decimal'],
      textbookFocus: '0.7과 0.9를 0.1의 개수로 비교하고, 8.4와 7.8을 수직선에 나타내어 비교한다.',
      workbookFocus: '소수점 왼쪽 부분을 먼저 비교하고, 같으면 소수점 오른쪽 부분을 비교한다.',
    },
  ]),
];

export const lessons31 = curriculum31.flatMap((unitEntry) => unitEntry.lessons);
