import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 3학년 2학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명·학습 목표·성취기준은 동아출판 초등 수학 3-2 교사용 지도서
// (2022 개정 교육과정) 각론의 '단원의 전개 계획'과 '단원 학습 목표'를
// 그대로 따랐습니다. 3-1(curriculum31.ts)과 같은 약속을 지킵니다.
//   · '뚝딱! 해결해요', '함께! 놀아요', '곰곰! 생각해요'는 넣지 않습니다.
//   · 단원은 문항을 다 만든 것부터 하나씩 붙입니다.
//
// 지도서가 못박아 둔 것 가운데 문항에 그대로 영향을 주는 것:
//   · 1단원 차시마다 곱셈의 꼴과 올림이 생기는 자리가 정해져 있습니다
//     (grade32/unit1/core.ts). '올림이 한 번'은 교과서 예(27×12, 31×29)
//     대로 부분 곱을 구할 때 생기는 올림만 셉니다.
//   · 1단원 어림셈은 세 자리 수는 가까운 몇백, 두 자리 수는 가까운
//     몇십으로 어림합니다(796×2 → 800×2, 52×28 → 50×30).
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

const scopeFor = (unitTitle: string, lessonNo: number): LessonScope => {
  // 2학년 전용 그림이 섞이지 않게 막아 둡니다.
  const forbidVisuals = ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern'];
  if (unitTitle === '곱셈') {
    return { maxNumber: 10000, representation: lessonNo <= 4 ? 'semi' : 'symbolic', forbidVisuals };
  }
  return { maxNumber: 10000, representation: 'symbolic', forbidVisuals };
};

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '3-2';
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

const 곱셈성취 = '[4수01-04] 곱하는 수가 한 자리 수 또는 두 자리 수인 곱셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 어림성취 = '[4수01-08] 자연수의 덧셈, 뺄셈, 곱셈, 나눗셈과 관련한 여러 가지 상황에서 어림셈을 할 수 있다.';

export const curriculum32: Unit[] = [
  // ── 1단원 곱셈 (지도서 12차시 중 1~9차시) ─────────────────────────
  unit(1, '곱셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '500원씩 3장의 표값처럼 곱셈이 필요한 상황을 살펴본다.',
      workbookFocus: '23×2, 19×4, 26×8 같은 (두 자리 수)×(한 자리 수)를 떠올린다.',
    },
    {
      title: '올림이 없는 (세 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '올림이 없는 (세 자리 수)×(한 자리 수)의 계산 원리와 형식을 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '123×2를 100×2, 20×2, 3×2의 합으로 구한다.',
      workbookFocus: '자리마다 곱한 값을 한 줄에 써서 계산한다.',
    },
    {
      title: '일의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '일의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)를 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '126×3을 어림하고 18, 60, 300을 더하여 378을 구한다.',
      workbookFocus: '일의 자리에서 올림한 수를 십의 자리 위에 작게 쓰고 십의 자리 계산에 더한다.',
    },
    {
      title: '십의 자리, 백의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)를 어떻게 계산할까요',
      objective: '십의 자리, 백의 자리에서 올림이 있는 (세 자리 수)×(한 자리 수)를 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '132×4=528, 431×9=3879를 계산한다.',
      workbookFocus: '백의 자리 곱이 10을 넘으면 천의 자리에 쓴다.',
    },
    {
      title: '(몇십)×(몇십), (몇십몇)×(몇십)을 어떻게 계산할까요',
      objective: '(몇십)×(몇십), (몇십몇)×(몇십)의 계산 원리와 형식을 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '30×20=30×2×10, 16×20=16×2×10임을 안다.',
      workbookFocus: '(몇)×(몇)이나 (몇십몇)×(몇)을 계산한 다음 0을 붙인다.',
    },
    {
      title: '(한 자리 수)×(두 자리 수)를 어떻게 계산할까요',
      objective: '(한 자리 수)×(두 자리 수)의 계산 원리와 형식을 이해하고 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '모눈종이로 4×17을 4×10과 4×7의 합으로 구한다.',
      workbookFocus: '6×23과 23×6의 계산 결과가 같음을 안다.',
    },
    {
      title: '올림이 한 번 있는 (두 자리 수)×(두 자리 수)를 어떻게 계산할까요',
      objective: '올림이 한 번 있는 (두 자리 수)×(두 자리 수)를 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '27×12를 어림하고 27×2와 27×10의 합으로 구한다.',
      workbookFocus: '세로 셈에서 27×10의 값은 한 자리 왼쪽에 맞추어 쓴다.',
    },
    {
      title: '올림이 여러 번 있는 (두 자리 수)×(두 자리 수)를 어떻게 계산할까요',
      objective: '올림이 여러 번 있는 (두 자리 수)×(두 자리 수)를 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '26×45를 26×5와 26×40의 합으로 구한다.',
      workbookFocus: '올림수의 위치를 알맞게 쓰고 세로 셈 순서를 지킨다.',
    },
    {
      title: '곱셈의 어림셈을 어떻게 할까요',
      objective: '곱셈의 계산 결과를 어림하고, 어림한 값으로 계산 결과가 타당한지 확인할 수 있다.',
      achievement: 어림성취,
      tags: ['estimate', 'multiplication'],
      textbookFocus: '796×2를 800×2로, 52×28을 50×30으로 어림한다.',
      workbookFocus: '58×40=2420이 바른지 60×40=2400과 견주어 판단한다.',
    },
  ]),
];

export const lessons32 = curriculum32.flatMap((unitEntry) => unitEntry.lessons);
