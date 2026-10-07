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
];

export const lessons31 = curriculum31.flatMap((unitEntry) => unitEntry.lessons);
