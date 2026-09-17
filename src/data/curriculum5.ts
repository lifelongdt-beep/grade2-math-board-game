import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 5학년 2학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명·학습 목표·성취기준은 동아출판 초등 수학 5-2 교사용 지도서
// (2022 개정 교육과정)의 'Ⅴ. 단원 지도 계획'과 각 차시 '학습 목표'를
// 그대로 따랐습니다. 단원 이름도 지도서 그대로입니다 — 1단원은 흔히
// 쓰는 '수의 범위와 어림하기'가 아니라 '수의 범위와 올림, 버림,
// 반올림'이고, 5단원은 '직육면체'가 아니라 '직육면체와 정육면체'입니다.
//
// 지도서의 9~11차시 '뚝딱! 해결해요'(단원 평가), '함께! 놀아요'(놀이),
// '곰곰! 생각해요'(프로젝트)는 문항을 만들 차시가 아니므로 넣지
// 않았습니다. 2학년에서 '수학이랑 확인해요'를 뺀 것과 같은 까닭입니다.
// 복습은 앱의 '단원 종합', '학기 종합'을 씁니다.
//
// 지도서가 못박아 둔 것 가운데 문항에 그대로 영향을 주는 것:
//   · "'수직선'은 중학교에서 배우는 용어이므로 학생에게 사용하지 않는다."
//     (각론 1단원 머리말) — 그래서 학생이 읽는 문장에는 '수직선'을 쓰지
//     않고 '그림'이라고만 합니다. 그림 자체는 지도서와 같이 그립니다.
//   · 1단원에서 어림은 자연수뿐 아니라 소수에도 합니다(소수 첫째·둘째
//     자리까지). 자연수만 내면 차시의 절반이 빠집니다.
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

// 5학년 차시가 다루는 범위입니다.
//
// 2학년에서는 이 선언이 '몇까지 셀 수 있는가'와 '어떤 그림을 아직 쓰면
// 안 되는가'를 정했습니다. 5학년 문항은 차시마다 자기 수를 직접 고르므로
// (grade5 폴더) maxNumber가 문항을 자르는 일은 없지만, 단원 종합·학기
// 종합처럼 차시를 섞어 쓰는 곳에서 읽으므로 비워 두지 않습니다.
const scopeFor = (unitTitle: string, lessonNo: number): LessonScope => {
  // 2학년 그림은 5학년 차시에 붙을 일이 없습니다. 혹시라도 섞이지 않게
  // 2학년 전용 도구는 모두 막아 둡니다.
  const forbidVisuals = ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern'];

  if (unitTitle === '수의 범위와 올림, 버림, 반올림') {
    // 어림은 만의 자리까지 다룹니다(지도서 7차시 '68236명을 만의 자리까지').
    return { maxNumber: 100000, representation: lessonNo <= 4 ? 'semi' : 'symbolic', forbidVisuals };
  }
  if (unitTitle === '분수의 곱셈' || unitTitle === '소수의 곱셈') {
    return { maxNumber: 10000, representation: lessonNo <= 3 ? 'semi' : 'symbolic', forbidVisuals };
  }
  if (unitTitle === '합동과 대칭' || unitTitle === '직육면체와 정육면체') {
    return { maxNumber: 1000, representation: 'semi', forbidVisuals };
  }
  if (unitTitle === '평균과 가능성') {
    return { maxNumber: 10000, representation: lessonNo <= 4 ? 'symbolic' : 'semi', forbidVisuals };
  }
  return { maxNumber: 10000, representation: 'symbolic', forbidVisuals };
};

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '5-2';
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

export const curriculum5: Unit[] = [
  unit(1, '수의 범위와 올림, 버림, 반올림', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-02] 실생활과 연결하여 이상, 이하, 초과, 미만의 의미와 쓰임을 안다.',
      tags: ['range', 'number'],
      textbookFocus: '생활 속에서 수의 범위와 어림이 쓰이는 장면을 살펴본다.',
      workbookFocus: '수의 크기 비교와 측정 단위 등 앞서 배운 내용을 떠올린다.',
    },
    {
      title: '이상과 이하는 무엇일까요',
      objective: '이상과 이하의 의미를 알고, 이상과 이하인 수의 범위를 나타낼 수 있다.',
      achievement: '[6수01-02] 이상, 이하의 의미와 쓰임을 알고 수의 범위를 나타낸다.',
      tags: ['range'],
      textbookFocus: '경기 참가 나이, 기내 반입 무게처럼 경곗값을 포함하는 상황을 읽는다.',
      workbookFocus: '●로 경곗값을 표시하고 화살표 방향으로 범위를 나타낸다.',
    },
    {
      title: '초과와 미만은 무엇일까요',
      objective: '초과와 미만의 의미를 알고, 초과와 미만인 수의 범위를 나타낼 수 있다.',
      achievement: '[6수01-02] 초과, 미만의 의미와 쓰임을 알고 수의 범위를 나타낸다.',
      tags: ['range'],
      textbookFocus: '썰매 무게 제한, 기온처럼 경곗값을 포함하지 않는 상황을 읽는다.',
      workbookFocus: '○로 경곗값을 표시하고 화살표 방향으로 범위를 나타낸다.',
    },
    {
      title: '생활 속에서 수의 범위를 활용해 볼까요',
      objective: '이상, 이하, 초과, 미만을 활용한 실생활 문제를 해결하고 두 가지 수의 범위를 나타낼 수 있다.',
      achievement: '[6수01-02] 이상, 이하, 초과, 미만을 활용하여 수의 범위를 나타낸다.',
      tags: ['range'],
      textbookFocus: '역도 체급, 티셔츠 치수처럼 두 수로 구간을 나눈 표를 읽는다.',
      workbookFocus: '두 가지 수의 범위를 한 그림에 함께 나타낸다.',
    },
    {
      title: '올림은 무엇일까요',
      objective: '올림의 의미를 알고, 이를 활용하여 수를 어림하여 나타낼 수 있다.',
      achievement: '[6수01-03] 올림의 의미와 필요성을 알고 실생활에 활용한다.',
      tags: ['rounding'],
      textbookFocus: '모자라면 안 되는 상황에서 구하려는 자리 아래 수를 올린다.',
      workbookFocus: '자연수와 소수를 주어진 자리까지 올림하여 나타낸다.',
    },
    {
      title: '버림은 무엇일까요',
      objective: '버림의 의미를 알고, 이를 활용하여 수를 어림하여 나타낼 수 있다.',
      achievement: '[6수01-03] 버림의 의미와 필요성을 알고 실생활에 활용한다.',
      tags: ['rounding'],
      textbookFocus: '넘치면 안 되는 상황에서 구하려는 자리 아래 수를 버린다.',
      workbookFocus: '자연수와 소수를 주어진 자리까지 버림하여 나타낸다.',
    },
    {
      title: '반올림은 무엇일까요',
      objective: '반올림의 의미를 알고, 이를 활용하여 수를 어림하여 나타낼 수 있다.',
      achievement: '[6수01-03] 반올림의 의미와 필요성을 알고 실생활에 활용한다.',
      tags: ['rounding'],
      textbookFocus: '구하려는 자리 바로 아래 자리의 숫자가 5 미만이면 버리고 5 이상이면 올린다.',
      workbookFocus: '자연수와 소수를 주어진 자리까지 반올림하여 나타낸다.',
    },
    {
      title: '생활 속에서 올림, 버림, 반올림을 활용해 볼까요',
      objective: '상황에 적절한 어림의 방법을 알고, 어림을 활용한 실생활 문제를 해결할 수 있다.',
      achievement: '[6수01-03] 상황에 맞는 어림 방법을 고르고 그 결과를 해석한다.',
      tags: ['rounding'],
      textbookFocus: '상자 수, 쓸 수 있는 점수처럼 같은 수라도 상황에 따라 다른 방법으로 어림한다.',
      workbookFocus: '어떤 방법으로 어림했는지 고르고 그 까닭을 말한다.',
    },
  ]),
  unit(2, '분수의 곱셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-09] 분수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['fraction'],
      textbookFocus: '생활 속에서 분수의 곱셈이 쓰이는 장면을 살펴본다.',
      workbookFocus: '분수의 종류, 대분수와 가분수, 약분과 통분, 분모가 같은 분수의 덧셈을 떠올린다.',
    },
    {
      title: '(진분수)×(자연수)를 어떻게 계산할까요',
      objective: '(진분수)×(자연수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: '[6수01-09] 분수와 자연수의 곱셈 계산 원리를 이해하고 그 계산을 한다.',
      tags: ['fraction'],
      textbookFocus: '같은 분수를 여러 번 더하는 상황에서 분모는 그대로 두고 분자와 자연수를 곱한다.',
      workbookFocus: '띠 그림으로 계산 원리를 확인하고 여러 가지 방법으로 계산한다.',
    },
    {
      title: '(대분수)×(자연수)를 어떻게 계산할까요',
      objective: '(대분수)×(자연수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: '[6수01-09] 분수와 자연수의 곱셈 계산 원리를 이해하고 그 계산을 한다.',
      tags: ['fraction'],
      textbookFocus: '대분수를 가분수로 고친 뒤 곱하거나, 자연수 부분과 분수 부분으로 나누어 곱한다.',
      workbookFocus: '대분수를 가분수로 고치는 과정을 빠뜨리지 않는지 확인한다.',
    },
    {
      title: '(자연수)×(진분수)를 어떻게 계산할까요',
      objective: '(자연수)×(진분수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: '[6수01-09] 자연수와 분수의 곱셈 계산 원리를 이해하고 그 계산을 한다.',
      tags: ['fraction'],
      textbookFocus: "'~의 몇 분의 몇'이 곱셈임을 알고, 전체를 똑같이 나눈 것 중 몇 묶음인지로 구한다.",
      workbookFocus: '자연수를 분모에 곱하지 않도록 계산 과정을 확인한다.',
    },
    {
      title: '(자연수)×(대분수)를 어떻게 계산할까요',
      objective: '(자연수)×(대분수)의 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: '[6수01-09] 자연수와 분수의 곱셈 계산 원리를 이해하고 그 계산을 한다.',
      tags: ['fraction'],
      textbookFocus: '대분수를 가분수로 고쳐 곱하거나 분배법칙을 이용해 나누어 곱한다.',
      workbookFocus: '자연수 부분만 곱하고 분수 부분을 빠뜨리지 않는지 확인한다.',
    },
    {
      title: '진분수의 곱셈을 어떻게 할까요',
      objective: '진분수의 곱셈 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: '[6수01-09] 진분수의 곱셈 계산 원리를 이해하고 그 계산을 한다.',
      tags: ['fraction'],
      textbookFocus: '직사각형을 가로와 세로로 나눈 넓이 그림으로 분자끼리, 분모끼리 곱함을 확인한다.',
      workbookFocus: '약분을 먼저 하는 방법과 곱한 뒤 약분하는 방법을 모두 익힌다.',
    },
    {
      title: '대분수의 곱셈을 어떻게 할까요',
      objective: '대분수의 곱셈 계산 원리를 이해하고 그 계산을 할 수 있다.',
      achievement: '[6수01-09] 대분수의 곱셈 계산 원리를 이해하고 그 계산을 한다.',
      tags: ['fraction'],
      textbookFocus: '대분수를 가분수로 고친 뒤 분자끼리, 분모끼리 곱한다.',
      workbookFocus: '가분수로 고치지 않고 자연수 부분과 분수 부분을 따로 곱하는 잘못을 살핀다.',
    },
  ]),
  unit(3, '합동과 대칭', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수03-01] 도형의 합동을 이해하고, 합동인 도형의 성질을 탐구하고 설명할 수 있다.',
      tags: ['shape'],
      textbookFocus: '생활 주변에서 합동과 대칭이 쓰인 모양을 살펴본다.',
      workbookFocus: '평면도형, 평면도형의 이동, 각도, 다각형을 떠올린다.',
    },
    {
      title: '합동은 무엇일까요',
      objective: '도형의 합동을 이해하고, 합동인 두 도형을 찾을 수 있다.',
      achievement: '[6수03-01] 도형의 합동을 이해한다.',
      tags: ['congruence'],
      textbookFocus: '포개었을 때 완전히 겹치는 두 도형을 찾아 합동의 뜻을 세운다.',
      workbookFocus: '모양만 같고 크기가 다른 도형을 가려낸다.',
    },
    {
      title: '합동인 도형에는 어떤 성질이 있을까요',
      objective: '합동인 두 도형에서 대응점, 대응변, 대응각을 찾고 그 성질을 이해한다.',
      achievement: '[6수03-01] 합동인 도형의 성질을 탐구하고 설명한다.',
      tags: ['congruence'],
      textbookFocus: '대응변의 길이가 같고 대응각의 크기가 같음을 확인한다.',
      workbookFocus: '돌리거나 뒤집어 놓은 도형에서 대응변과 대응각을 바르게 찾는다.',
    },
    {
      title: '선대칭도형은 무엇일까요',
      objective: '선대칭도형을 이해하고, 선대칭도형에서 대응점, 대응변, 대응각을 안다.',
      achievement: '[6수03-02] 실생활과 연결하여 선대칭도형을 이해한다.',
      tags: ['congruence'],
      textbookFocus: '한 직선을 따라 접어 완전히 겹치는 도형을 찾고 대칭축을 긋는다.',
      workbookFocus: '대각선을 대칭축으로 잘못 보지 않는지 확인한다.',
    },
    {
      title: '선대칭도형에는 어떤 성질이 있을까요',
      objective: '선대칭도형의 성질을 이해하고 도형의 나머지 부분을 그릴 수 있다.',
      achievement: '[6수03-02] 선대칭도형을 이해하고 그릴 수 있다.',
      tags: ['congruence'],
      textbookFocus: '대응점끼리 이은 선분이 대칭축에 의해 수직 이등분됨을 확인한다.',
      workbookFocus: '대응점을 찍어 나머지 부분을 완성한다.',
    },
    {
      title: '점대칭도형은 무엇일까요',
      objective: '점대칭도형을 이해하고, 점대칭도형에서 대응점, 대응변, 대응각을 안다.',
      achievement: '[6수03-02] 실생활과 연결하여 점대칭도형을 이해한다.',
      tags: ['congruence'],
      textbookFocus: '대칭의 중심을 중심으로 180° 돌려 완전히 겹치는 도형을 찾는다.',
      workbookFocus: '선대칭과 점대칭을 가려 판단한다.',
    },
    {
      title: '점대칭도형에는 어떤 성질이 있을까요',
      objective: '점대칭도형의 성질을 이해하고 도형의 나머지 부분을 그릴 수 있다.',
      achievement: '[6수03-02] 점대칭도형을 이해하고 그릴 수 있다.',
      tags: ['congruence'],
      textbookFocus: '대응점끼리 이은 선분이 대칭의 중심에 의해 이등분됨을 확인한다.',
      workbookFocus: '점대칭도형을 그려야 할 때 선대칭도형을 그리지 않는지 확인한다.',
    },
  ]),
  unit(4, '소수의 곱셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '생활 속에서 소수의 곱셈이 필요한 장면을 살펴본다.',
      workbookFocus: '소수의 자리값, 소수 사이의 관계, 소수의 덧셈과 뺄셈, 자연수의 곱셈을 떠올린다.',
    },
    {
      title: '(1보다 작은 소수)×(자연수)를 어떻게 계산할까요',
      objective: '(1보다 작은 소수)×(자연수)의 계산 원리를 탐구하고 여러 가지 방법으로 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '같은 소수를 여러 번 더하는 상황을 그림으로 나타내고 계산 원리를 찾는다.',
      workbookFocus: '소수를 분수로 고쳐 계산하는 방법과 자연수의 곱셈을 이용하는 방법을 모두 익힌다.',
    },
    {
      title: '(1보다 큰 소수)×(자연수)를 어떻게 계산할까요',
      objective: '(1보다 큰 소수)×(자연수)의 계산 원리를 탐구하고 여러 가지 방법으로 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '계산하기 전에 얼마쯤 될지 어림해 보고 그 까닭을 말한다.',
      workbookFocus: '곱해지는 수가 1/10배가 되면 결과도 1/10배가 됨을 이용한다.',
    },
    {
      title: '(자연수)×(1보다 작은 소수)를 어떻게 계산할까요',
      objective: '(자연수)×(1보다 작은 소수)의 계산 원리를 탐구하고 여러 가지 방법으로 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '‘~의 몇 배’로 읽고 1배와 0.1배에 주목하여 계산 원리를 찾는다.',
      workbookFocus: '곱하는 수가 1보다 작으면 곱이 곱해지는 수보다 작아짐을 확인한다.',
    },
    {
      title: '(자연수)×(1보다 큰 소수)를 어떻게 계산할까요',
      objective: '(자연수)×(1보다 큰 소수)의 계산 원리를 탐구하고 여러 가지 방법으로 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '자연수의 곱셈과 이어 생각하여 계산 방법을 세운다.',
      workbookFocus: '어림한 값과 견주어 소수점을 바르게 찍었는지 확인한다.',
    },
    {
      title: '(1보다 작은 소수)×(1보다 작은 소수)를 어떻게 계산할까요',
      objective: '(1보다 작은 소수)×(1보다 작은 소수)의 계산 원리를 탐구하고 여러 가지 방법으로 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '모눈 100칸을 가로와 세로로 나누어 겹치는 칸으로 곱을 확인한다.',
      workbookFocus: '두 수의 소수점 아래 자리 수를 더한 만큼 곱에 소수점을 찍는다.',
    },
    {
      title: '(1보다 큰 소수)×(1보다 큰 소수)를 어떻게 계산할까요',
      objective: '(1보다 큰 소수)×(1보다 큰 소수)의 계산 원리를 탐구하고 여러 가지 방법으로 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '직사각형의 넓이를 구하는 상황에서 곱셈식을 세우고 계산한다.',
      workbookFocus: '소수를 분수로 고치는 방법과 자연수의 곱셈을 이용하는 방법을 견준다.',
    },
    {
      title: '곱의 소수점의 위치는 어떻게 달라질까요',
      objective: '소수의 곱셈 상황에서 곱의 소수점의 위치가 달라지는 원리를 이해하고 계산할 수 있다.',
      achievement: '[6수01-13] 소수의 곱셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['decimal'],
      textbookFocus: '10, 100, 1000을 곱할 때와 0.1, 0.01, 0.001을 곱할 때 소수점이 옮겨 가는 방향과 칸 수를 찾는다.',
      workbookFocus: '곱하는 수의 0의 개수, 소수점 아래 자리 수와 옮겨 가는 칸 수를 연결한다.',
    },
  ]),
];

export const lessons5 = curriculum5.flatMap((unitEntry) => unitEntry.lessons);
