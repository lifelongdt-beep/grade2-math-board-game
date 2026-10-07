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
];

export const lessons31 = curriculum31.flatMap((unitEntry) => unitEntry.lessons);
