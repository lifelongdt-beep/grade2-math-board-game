import type { ConceptTag, Lesson, LessonScope, Unit } from '../types';

// 차시 구성과 학습 목표는 동아출판 초등 수학 2-1 / 2-2 교사용 지도서의
// '단원 전개 계획'과 각 차시 '학습 목표'를 따랐습니다.
// 평가·프로젝트 차시인 '수학이랑 확인해요', '수학이랑 만들어요'는 문항을 만들지
// 않으므로 넣지 않았습니다. 복습은 앱의 '단원 종합', '학기 종합'을 이용합니다.

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

const unit = (
  semester: '2-1' | '2-2',
  unitNo: number,
  title: string,
  lessons: LessonSeed[],
): Unit => ({
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
    scope: scopeFor(title, lesson.title, index + 1),
  })),
});


// 차시가 다룰 수 있는 범위입니다. 단원과 차시 순서에서 정해집니다.
// 여기 적힌 것이 곧 규칙이고, 문항 생성기와 그림 선택이 이것을 읽습니다.
//
// 처음에는 단원마다 '쓸 수 없는 그림'을 길게 적었는데, 실제 문항이 정당하게
// 쓰고 있는 그림까지 막아 버렸습니다. 그래서 확실히 어긋나는 것만 적습니다.
// 어긋난다는 것은 '그 단원에서 아직 배우지 않은 도구'라는 뜻입니다.
const scopeFor = (unitTitle: string, lessonTitle: string, lessonNo: number): LessonScope => {
  const dans = [2, 3, 4, 5, 6, 7, 8, 9].filter((dan) => lessonTitle.includes(`${dan}단`));

  // 시계와 달력은 '시각과 시간' 단원의 도구입니다. 달력은 그중에서도
  // 달력 차시에서만 씁니다.
  const timeTools = unitTitle === '시각과 시간'
    ? (lessonTitle.includes('달력') ? [] : ['calendar'])
    : ['clock', 'calendar'];

  // 자와 임의 단위(클립·뼘)는 '길이 재기' 단원의 도구입니다.
  // 그 안에서도 자는 1cm를 배운 뒤부터, 임의 단위는 그전까지입니다.
  const lengthTools = unitTitle === '길이 재기'
    ? (lessonNo <= 3 ? ['ruler'] : ['unit-measure'])
    : ['ruler', 'unit-measure'];

  // 덧셈표·곱셈표는 규칙 찾기와 곱셈구구에서만 씁니다.
  const tableTools = unitTitle === '규칙 찾기' || unitTitle === '곱셈구구' ? [] : ['grid-table'];

  const forbidVisuals = [...timeTools, ...lengthTools, ...tableTools];

  if (unitTitle === '세 자리 수') {
    return {
      maxNumber: lessonNo <= 2 ? 1000 : 1000,
      representation: lessonNo <= 4 ? 'concrete' : 'symbolic',
      forbidVisuals,
    };
  }

  if (unitTitle === '네 자리 수') {
    return {
      maxNumber: 10000,
      representation: lessonNo <= 4 ? 'concrete' : 'symbolic',
      forbidVisuals,
    };
  }

  if (unitTitle === '덧셈과 뺄셈') {
    return { maxNumber: 200, representation: lessonNo <= 3 ? 'concrete' : 'symbolic', forbidVisuals };
  }

  if (unitTitle === '여러 가지 도형') {
    return { maxNumber: 100, representation: 'semi', forbidVisuals };
  }

  if (unitTitle === '길이 재기') {
    return {
      maxNumber: 1000,
      representation: lessonNo <= 3 ? 'concrete' : 'symbolic',
      forbidVisuals,
    };
  }

  if (unitTitle === '분류하기') {
    return { maxNumber: 100, representation: 'concrete', forbidVisuals };
  }

  if (unitTitle === '곱셈') {
    return { maxNumber: 100, representation: lessonNo <= 5 ? 'concrete' : 'symbolic', forbidVisuals };
  }

  if (unitTitle === '곱셈구구') {
    return {
      maxNumber: 100,
      dans: dans.length
        ? dans
        : /곱셈표|이용하여|단원 종합|학기 종합/.test(lessonTitle)
          ? [2, 3, 4, 5, 6, 7, 8, 9]
          : [],
      representation: lessonNo <= 2 ? 'concrete' : 'symbolic',
      forbidVisuals,
    };
  }

  if (unitTitle === '시각과 시간') {
    return { maxNumber: 100, representation: 'semi', forbidVisuals };
  }

  if (unitTitle === '표와 그래프') {
    return { maxNumber: 100, representation: 'semi', forbidVisuals };
  }

  if (unitTitle === '규칙 찾기') {
    return { maxNumber: 1000, representation: 'semi', forbidVisuals };
  }

  return { maxNumber: 10000, representation: 'symbolic' };
};

export const curriculum: Unit[] = [
  unit('2-1', 1, '세 자리 수', [
    {
      title: '단원 도입',
      objective: '실생활에서 세 자리 수를 찾아보고 세 자리 수의 필요성을 안다.',
      achievement: '[2수01-02] 세 자리 수의 필요성을 인식한다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '생활 속 물건의 수를 세어 보며 100보다 큰 수를 만난다.',
      workbookFocus: '두 자리 수까지의 수 세기와 자리값을 점검한다.',
    },
    {
      title: '백을 알아볼까요',
      objective: '여러 가지 방법으로 백을 알아보고 백을 쓰고 읽는다.',
      achievement: '[2수01-02] 100을 이해하고 읽고 쓴다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '10개씩 묶음 10개가 100임을 모형으로 확인한다.',
      workbookFocus: '90보다 10 큰 수, 99보다 1 큰 수로 100을 찾는다.',
    },
    {
      title: '몇백을 알아볼까요',
      objective: '여러 가지 방법으로 몇백을 알아보고 몇백을 쓰고 읽는다.',
      achievement: '[2수01-02] 몇백을 이해하고 읽고 쓴다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '100이 몇 개인지 세어 200, 300과 같은 몇백을 만든다.',
      workbookFocus: '몇백을 숫자와 말로 바꾸어 쓴다.',
    },
    {
      title: '세 자리 수를 알아볼까요',
      objective: '세 자리 수를 100이 몇 개, 10이 몇 개, 1이 몇 개인 수로 나타낸다.',
      achievement: '[2수01-02] 세 자리 수를 읽고 쓴다.',
      tags: ['placeValue', 'number'],
      textbookFocus: '백, 십, 일 모형을 합쳐 세 자리 수를 만든다.',
      workbookFocus: '모형 그림과 수, 말 읽기를 서로 연결한다.',
    },
    {
      title: '각 자리의 숫자는 얼마를 나타낼까요',
      objective: '세 자리 수에서 각 자리 숫자가 나타내는 값을 안다.',
      achievement: '[2수01-02] 자리값을 이해하고 수를 분해한다.',
      tags: ['placeValue', 'number'],
      textbookFocus: '같은 숫자라도 놓인 자리에 따라 값이 달라짐을 확인한다.',
      workbookFocus: '수를 분해하고 합성하며 빈 자리를 채운다.',
    },
    {
      title: '뛰어 세어 볼까요',
      objective: '뛰어 세기를 하며 세 자리 수의 계열을 안다.',
      achievement: '[2수01-02] 수의 계열을 이해하고 규칙적으로 센다.',
      tags: ['number', 'pattern'],
      textbookFocus: '1씩, 10씩, 100씩 뛰어 세며 어느 자리가 변하는지 본다.',
      workbookFocus: '빈칸의 수를 쓰고 앞뒤 수를 찾는다.',
    },
    {
      title: '수의 크기를 비교해 볼까요',
      objective: '세 자리 수의 크기를 비교한다.',
      achievement: '[2수01-03] 세 자리 수의 크기를 비교한다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '백의 자리부터 차례로 비교하는 방법을 익힌다.',
      workbookFocus: '두 수와 세 수의 크기를 비교해 순서대로 놓는다.',
    },
  ]),
  unit('2-1', 2, '여러 가지 도형', [
    {
      title: '단원 도입',
      objective: '생활 주변에서 여러 가지 도형을 찾는다.',
      achievement: '[2수03-01] 여러 가지 사물에서 도형의 모양을 관찰한다.',
      tags: ['shape', 'solid'],
      textbookFocus: '교실과 생활 장면의 물건을 도형 관점으로 바라본다.',
      workbookFocus: '도형 이름과 특징을 그림으로 연결한다.',
    },
    {
      title: '△을 알아보고 찾아볼까요',
      objective: '삼각형을 알고 특징을 설명한다.',
      achievement: '[2수03-03] 삼각형을 직관적으로 이해한다.',
      tags: ['shape'],
      textbookFocus: '곧은 변 3개와 꼭짓점 3개를 가진 모양을 찾는다.',
      workbookFocus: '삼각형인 것과 아닌 것을 고르고 까닭을 말한다.',
    },
    {
      title: '□을 알아보고 찾아볼까요',
      objective: '사각형을 알고 특징을 설명한다.',
      achievement: '[2수03-03] 사각형을 직관적으로 이해한다.',
      tags: ['shape'],
      textbookFocus: '곧은 변 4개와 꼭짓점 4개를 가진 모양을 찾는다.',
      workbookFocus: '여러 모양의 사각형을 함께 살펴본다.',
    },
    {
      title: '○을 알아보고 찾아볼까요',
      objective: '원을 알고 특징을 설명한다.',
      achievement: '[2수03-03] 원을 직관적으로 이해한다.',
      tags: ['shape'],
      textbookFocus: '어느 쪽에서 보아도 둥근 모양으로 원을 구별한다.',
      workbookFocus: '원인 것과 아닌 것을 고르고 까닭을 말한다.',
    },
    {
      title: '칠교판으로 모양을 만들어 볼까요',
      objective: '칠교 조각을 삼각형과 사각형으로 분류하고 모양을 만든다.',
      achievement: '[2수03-05] 도형을 이용해 여러 가지 모양을 만든다.',
      tags: ['shape'],
      textbookFocus: '칠교 조각을 돌리고 뒤집어 여러 모양을 만든다.',
      workbookFocus: '주어진 모양을 만들 때 필요한 조각 수를 생각한다.',
    },
    {
      title: '쌓은 모양을 알아볼까요',
      objective: '쌓기나무가 쌓인 모양을 보고 설명한다.',
      achievement: '[2수03-02] 쌓기나무 모양을 관찰하고 표현한다.',
      tags: ['solid'],
      textbookFocus: '앞, 옆, 위와 층을 이용해 쌓은 모양을 말로 설명한다.',
      workbookFocus: '설명을 듣고 같은 모양으로 쌓는 문제를 푼다.',
    },
    {
      title: '여러 가지 모양으로 쌓아 볼까요',
      objective: '쌓기나무로 여러 가지 모양을 만든다.',
      achievement: '[2수03-02] 쌓기나무로 모양을 만들고 설명한다.',
      tags: ['solid', 'shape'],
      textbookFocus: '쌓기나무 3개, 4개, 5개로 다양한 모양을 만든다.',
      workbookFocus: '같은 개수로 서로 다른 모양이 되는 경우를 찾는다.',
    },
  ]),
  unit('2-1', 3, '덧셈과 뺄셈', [
    {
      title: '단원 도입',
      objective: '문제 상황에서 덧셈과 뺄셈이 필요함을 안다.',
      achievement: '[2수01-05] 덧셈과 뺄셈이 필요한 상황을 이해한다.',
      tags: ['addition', 'subtraction'],
      textbookFocus: '이야기 상황을 보고 필요한 계산을 생각한다.',
      workbookFocus: '받아올림과 받아내림이 없는 계산을 점검한다.',
    },
    {
      title: '덧셈을 해 볼까요 ⑴',
      objective: '일의 자리에서 받아올림이 있는 (두 자리 수)+(한 자리 수)를 계산한다.',
      achievement: '[2수01-05] 받아올림이 있는 덧셈을 한다.',
      tags: ['addition'],
      textbookFocus: '일의 자리 합이 10이 넘으면 십의 자리로 받아올림한다.',
      workbookFocus: '세로셈으로 받아올림을 표시하며 계산한다.',
    },
    {
      title: '덧셈을 해 볼까요 ⑵',
      objective: '일의 자리에서 받아올림이 있는 (두 자리 수)+(두 자리 수)를 계산한다.',
      achievement: '[2수01-05] 받아올림이 있는 덧셈을 한다.',
      tags: ['addition'],
      textbookFocus: '두 수 모두 두 자리일 때 일의 자리부터 계산한다.',
      workbookFocus: '받아올림한 1을 빠뜨리지 않고 더한다.',
    },
    {
      title: '여러 가지 방법으로 덧셈을 해 볼까요',
      objective: '십의 자리에서 받아올림이 있는 덧셈을 여러 가지 방법으로 계산한다.',
      achievement: '[2수01-05] 덧셈을 여러 가지 방법으로 계산한다.',
      tags: ['addition'],
      textbookFocus: '가르기와 모으기, 수 모형 등 여러 방법을 비교한다.',
      workbookFocus: '자기에게 편한 방법을 골라 계산하고 설명한다.',
    },
    {
      title: '뺄셈을 해 볼까요 ⑴',
      objective: '받아내림이 있는 (두 자리 수)-(한 자리 수)를 계산한다.',
      achievement: '[2수01-06] 받아내림이 있는 뺄셈을 한다.',
      tags: ['subtraction'],
      textbookFocus: '일의 자리가 부족하면 십의 자리에서 10을 받아내린다.',
      workbookFocus: '세로셈으로 받아내림을 표시하며 계산한다.',
    },
    {
      title: '뺄셈을 해 볼까요 ⑵',
      objective: '받아내림이 있는 (몇십)-(몇십몇)을 계산한다.',
      achievement: '[2수01-06] 받아내림이 있는 뺄셈을 한다.',
      tags: ['subtraction'],
      textbookFocus: '몇십에서 빼는 상황을 모형으로 확인한다.',
      workbookFocus: '몇십에서 빼는 계산을 반복해 익힌다.',
    },
    {
      title: '여러 가지 방법으로 뺄셈을 해 볼까요',
      objective: '받아내림이 있는 (두 자리 수)-(두 자리 수)를 여러 가지 방법으로 계산한다.',
      achievement: '[2수01-06] 뺄셈을 여러 가지 방법으로 계산한다.',
      tags: ['subtraction'],
      textbookFocus: '여러 계산 방법을 비교하고 편한 방법을 고른다.',
      workbookFocus: '방법을 골라 계산하고 그 까닭을 말한다.',
    },
    {
      title: '세 수의 계산을 해 볼까요',
      objective: '세 수의 덧셈과 뺄셈을 앞에서부터 차례로 계산한다.',
      achievement: '[2수01-07] 세 수의 계산을 한다.',
      tags: ['addition', 'subtraction'],
      textbookFocus: '문제 상황을 세 수의 식으로 나타내고 순서대로 계산한다.',
      workbookFocus: '앞에서부터 차례로 계산하는 연습을 한다.',
    },
    {
      title: '덧셈과 뺄셈의 관계를 식으로 나타내 볼까요',
      objective: '한 가지 상황을 덧셈식과 뺄셈식으로 나타낸다.',
      achievement: '[2수01-08] 덧셈과 뺄셈의 관계를 이해한다.',
      tags: ['addition', 'subtraction'],
      textbookFocus: '같은 상황을 덧셈식과 뺄셈식으로 바꾸어 본다.',
      workbookFocus: '식을 바꾸어 쓰며 두 계산의 관계를 확인한다.',
    },
    {
      title: '□의 값을 구해 볼까요',
      objective: '모르는 수를 □로 하여 식을 만들고 □의 값을 구한다.',
      achievement: '[2수01-09] □가 있는 식에서 □의 값을 구한다.',
      tags: ['addition', 'subtraction'],
      textbookFocus: '모르는 수를 □로 나타내어 식을 세운다.',
      workbookFocus: '덧셈과 뺄셈의 관계를 이용해 □를 구한다.',
    },
  ]),
  unit('2-1', 4, '길이 재기', [
    {
      title: '단원 도입',
      objective: '실생활에서 길이 재기가 필요한 상황을 안다.',
      achievement: '[2수03-06] 길이 비교의 필요성을 인식한다.',
      tags: ['measurement'],
      textbookFocus: '길이를 재야 하는 생활 상황을 찾아본다.',
      workbookFocus: '길다, 짧다로 길이를 비교한다.',
    },
    {
      title: '길이를 비교하는 방법을 알아볼까요',
      objective: '직접 맞대기 어려운 물건의 길이를 비교하는 방법을 안다.',
      achievement: '[2수03-06] 여러 가지 방법으로 길이를 비교한다.',
      tags: ['measurement'],
      textbookFocus: '끈이나 종이띠를 이용해 옮겨 비교한다.',
      workbookFocus: '직접 비교와 간접 비교를 구별한다.',
    },
    {
      title: '여러 가지 단위로 길이를 재어 볼까요',
      objective: '여러 가지 단위를 이용하여 물건의 길이를 잰다.',
      achievement: '[2수03-10] 여러 가지 단위로 길이를 잰다.',
      tags: ['measurement'],
      textbookFocus: '뼘, 클립, 연필 같은 단위로 길이를 재어 본다.',
      workbookFocus: '단위가 다르면 잰 횟수도 달라짐을 확인한다.',
    },
    {
      title: '1cm를 알아볼까요',
      objective: '1cm를 알고 cm로 길이를 나타낸다.',
      achievement: '[2수03-10] 1cm를 알고 길이를 나타낸다.',
      tags: ['measurement'],
      textbookFocus: '단위가 제각각인 불편을 겪고 공통 단위 1cm를 만난다.',
      workbookFocus: '1cm가 몇 번인지 세어 길이를 쓴다.',
    },
    {
      title: '자로 길이를 재는 방법을 알아볼까요',
      objective: '자로 길이를 재는 방법을 안다.',
      achievement: '[2수03-11] 자를 이용하여 길이를 잰다.',
      tags: ['measurement'],
      textbookFocus: '물건의 한끝을 자의 0에 맞추어 재는 방법을 익힌다.',
      workbookFocus: '자를 바르게 놓았는지 확인하는 문제를 푼다.',
    },
    {
      title: '자로 길이를 재어 볼까요',
      objective: '자로 길이를 재고 약 몇 cm로 나타낸다.',
      achievement: '[2수03-11] 길이를 재고 약 몇 cm로 나타낸다.',
      tags: ['measurement'],
      textbookFocus: '눈금 사이에 있을 때 가까운 눈금으로 읽는다.',
      workbookFocus: '약 몇 cm인지 어림하여 읽는다.',
    },
    {
      title: '길이를 어림하고 어떻게 어림했는지 말해 볼까요',
      objective: '길이를 어림하고 어림한 방법을 말한다.',
      achievement: '[2수03-12] 길이를 어림하고 어림한 방법을 설명한다.',
      tags: ['measurement'],
      textbookFocus: '1cm, 5cm, 10cm의 양감을 기른다.',
      workbookFocus: '어림한 길이와 잰 길이를 비교한다.',
    },
  ]),
  unit('2-1', 5, '분류하기', [
    {
      title: '단원 도입',
      objective: '실생활에서 분류하기가 필요한 상황을 안다.',
      achievement: '[2수04-01] 분류의 필요성을 인식한다.',
      tags: ['classification'],
      textbookFocus: '어질러진 물건을 정리하는 상황에서 분류를 만난다.',
      workbookFocus: '같은 것끼리 모으는 활동을 한다.',
    },
    {
      title: '분류는 어떻게 할까요',
      objective: '분명한 분류 기준이 필요함을 안다.',
      achievement: '[2수04-01] 분명한 분류 기준을 이해한다.',
      tags: ['classification'],
      textbookFocus: '사람마다 달라지는 기준과 분명한 기준을 비교한다.',
      workbookFocus: '분명한 기준인 것과 아닌 것을 고른다.',
    },
    {
      title: '기준에 따라 분류해 볼까요',
      objective: '주어진 기준에 따라 분류한다.',
      achievement: '[2수04-01] 기준에 따라 분류한다.',
      tags: ['classification'],
      textbookFocus: '색깔, 모양처럼 정해진 기준으로 나눈다.',
      workbookFocus: '기준을 바꾸면 묶음도 달라짐을 확인한다.',
    },
    {
      title: '분류하고 세어 볼까요',
      objective: '분류하여 그 결과를 수로 센다.',
      achievement: '[2수04-01] 분류한 결과의 수를 센다.',
      tags: ['classification', 'data'],
      textbookFocus: '분류한 것에 표시하며 빠짐과 겹침 없이 센다.',
      workbookFocus: '분류하여 센 결과를 표에 쓴다.',
    },
    {
      title: '분류한 결과를 말해 볼까요',
      objective: '분류한 결과를 보고 알 수 있는 내용을 말한다.',
      achievement: '[2수04-01] 분류 결과를 해석한다.',
      tags: ['classification', 'data'],
      textbookFocus: '가장 많은 것과 가장 적은 것을 찾아 말한다.',
      workbookFocus: '분류 결과로 알 수 있는 점을 쓴다.',
    },
  ]),
  unit('2-1', 6, '곱셈', [
    {
      title: '단원 도입',
      objective: '물건의 수를 세는 여러 가지 방법이 있음을 안다.',
      achievement: '[2수01-10] 곱셈이 필요한 상황을 인식한다.',
      tags: ['multiplication'],
      textbookFocus: '많은 물건을 빠르게 세는 방법을 이야기한다.',
      workbookFocus: '뛰어 세기와 묶어 세기를 점검한다.',
    },
    {
      title: '여러 가지 방법으로 세어 볼까요',
      objective: '물건의 수를 여러 가지 방법으로 센다.',
      achievement: '[2수01-10] 여러 가지 방법으로 수를 센다.',
      tags: ['multiplication'],
      textbookFocus: '하나씩, 뛰어 세기, 묶어 세기를 비교한다.',
      workbookFocus: '어떤 방법이 편한지 골라 세어 본다.',
    },
    {
      title: '묶어 세어 볼까요',
      objective: '여러 가지 방법으로 묶어 센다.',
      achievement: '[2수01-10] 묶어 세기로 전체 수를 구한다.',
      tags: ['multiplication'],
      textbookFocus: '몇씩 몇 묶음인지 말하며 전체 수를 구한다.',
      workbookFocus: '묶음의 수를 바꾸어 세어 본다.',
    },
    {
      title: '몇의 몇 배를 알아볼까요',
      objective: '똑같은 묶음 상황에서 배의 뜻을 안다.',
      achievement: '[2수01-10] 배의 개념을 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '똑같은 묶음이 몇 번 있는지로 몇 배를 말한다.',
      workbookFocus: '묶음 그림을 보고 몇의 몇 배인지 쓴다.',
    },
    {
      title: '몇의 몇 배로 나타내 볼까요',
      objective: '두 양을 비교하여 몇의 몇 배로 나타낸다.',
      achievement: '[2수01-10] 곱셈적 비교로 배를 나타낸다.',
      tags: ['multiplication'],
      textbookFocus: '기준이 되는 수와 비교하는 수를 구별한다.',
      workbookFocus: '길이나 개수를 몇 배로 나타낸다.',
    },
    {
      title: '곱셈을 알아볼까요',
      objective: '몇의 몇 배를 곱셈식으로 나타낸다.',
      achievement: '[2수01-10] 곱셈식의 의미를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '몇씩 몇 묶음을 곱셈식으로 바꾸어 쓴다.',
      workbookFocus: '덧셈식과 곱셈식을 서로 바꾸어 쓴다.',
    },
    {
      title: '곱셈식으로 나타내 볼까요',
      objective: '물건의 수를 여러 가지 곱셈식으로 나타낸다.',
      achievement: '[2수01-10] 상황을 곱셈식으로 나타낸다.',
      tags: ['multiplication'],
      textbookFocus: '같은 수를 다른 묶음으로 나누어 곱셈식을 만든다.',
      workbookFocus: '그림을 보고 알맞은 곱셈식을 고른다.',
    },
  ]),
  unit('2-2', 1, '네 자리 수', [
    {
      title: '단원 도입',
      objective: '실생활에서 네 자리 수를 찾아보고 네 자리 수의 필요성을 안다.',
      achievement: '[2수01-04] 네 자리 수의 필요성을 인식한다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '생활 속에서 1000보다 큰 수를 찾아본다.',
      workbookFocus: '세 자리 수까지의 자리값을 점검한다.',
    },
    {
      title: '천을 알아볼까요',
      objective: '여러 가지 방법으로 천을 알아보고 천을 쓰고 읽는다.',
      achievement: '[2수01-04] 1000을 이해하고 읽고 쓴다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '100이 10개이면 1000임을 모형으로 확인한다.',
      workbookFocus: '900보다 100 큰 수로 1000을 찾는다.',
    },
    {
      title: '몇천을 알아볼까요',
      objective: '여러 가지 방법으로 몇천을 알아보고 몇천을 쓰고 읽는다.',
      achievement: '[2수01-04] 몇천을 이해하고 읽고 쓴다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '1000이 몇 개인지 세어 2000, 3000을 만든다.',
      workbookFocus: '몇천을 숫자와 말로 바꾸어 쓴다.',
    },
    {
      title: '네 자리 수를 알아볼까요',
      objective: '네 자리 수를 1000이 몇 개, 100이 몇 개, 10이 몇 개, 1이 몇 개인 수로 나타낸다.',
      achievement: '[2수01-04] 네 자리 수를 읽고 쓴다.',
      tags: ['placeValue', 'number'],
      textbookFocus: '천, 백, 십, 일 모형을 합쳐 네 자리 수를 만든다.',
      workbookFocus: '모형 그림과 수, 말 읽기를 서로 연결한다.',
    },
    {
      title: '각 자리의 숫자는 얼마를 나타낼까요',
      objective: '네 자리 수에서 각 자리 숫자가 나타내는 값을 안다.',
      achievement: '[2수01-04] 자리값을 이해하고 수를 분해한다.',
      tags: ['placeValue', 'number'],
      textbookFocus: '같은 숫자라도 자리에 따라 값이 달라짐을 확인한다.',
      workbookFocus: '수를 분해하고 합성하며 빈 자리를 채운다.',
    },
    {
      title: '뛰어 세어 볼까요',
      objective: '뛰어 세기를 하며 네 자리 수의 계열을 안다.',
      achievement: '[2수01-04] 수의 계열을 이해하고 규칙적으로 센다.',
      tags: ['number', 'pattern'],
      textbookFocus: '1씩, 10씩, 100씩, 1000씩 뛰어 세며 변하는 자리를 본다.',
      workbookFocus: '빈칸의 수를 쓰고 앞뒤 수를 찾는다.',
    },
    {
      title: '수의 크기를 비교해 볼까요',
      objective: '네 자리 수의 크기를 비교한다.',
      achievement: '[2수01-05] 네 자리 수의 크기를 비교한다.',
      tags: ['number', 'placeValue'],
      textbookFocus: '천의 자리부터 차례로 비교하는 방법을 익힌다.',
      workbookFocus: '두 수와 세 수의 크기를 비교해 순서대로 놓는다.',
    },
  ]),
  unit('2-2', 2, '곱셈구구', [
    {
      title: '단원 도입',
      objective: '곱셈구구가 필요한 실생활 상황을 통해 곱셈구구의 뜻을 안다.',
      achievement: '[2수01-11] 곱셈구구의 필요성을 인식한다.',
      tags: ['multiplication'],
      textbookFocus: '같은 수를 여러 번 더하는 상황을 곱셈으로 바꾼다.',
      workbookFocus: '묶어 세기와 곱셈식을 점검한다.',
    },
    {
      title: '2단 곱셈구구를 알아볼까요',
      objective: '2단 곱셈구구의 구성 원리를 안다.',
      achievement: '[2수01-11] 2단 곱셈구구를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '2씩 커지는 규칙으로 2단을 만든다.',
      workbookFocus: '2단 곱셈구구를 외우고 활용한다.',
    },
    {
      title: '5단 곱셈구구를 알아볼까요',
      objective: '5단 곱셈구구의 구성 원리를 안다.',
      achievement: '[2수01-11] 5단 곱셈구구를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '5씩 커지는 규칙으로 5단을 만든다.',
      workbookFocus: '5단 곱셈구구를 외우고 활용한다.',
    },
    {
      title: '3단, 6단 곱셈구구를 알아볼까요',
      objective: '3단과 6단 곱셈구구의 구성 원리를 안다.',
      achievement: '[2수01-11] 3단, 6단 곱셈구구를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '3단의 두 배가 6단임을 확인한다.',
      workbookFocus: '3단과 6단을 비교하며 외운다.',
    },
    {
      title: '4단, 8단 곱셈구구를 알아볼까요',
      objective: '4단과 8단 곱셈구구의 구성 원리를 안다.',
      achievement: '[2수01-11] 4단, 8단 곱셈구구를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '4단의 두 배가 8단임을 확인한다.',
      workbookFocus: '4단과 8단을 비교하며 외운다.',
    },
    {
      title: '7단 곱셈구구를 알아볼까요',
      objective: '7단 곱셈구구의 구성 원리를 안다.',
      achievement: '[2수01-11] 7단 곱셈구구를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '7씩 커지는 규칙으로 7단을 만든다.',
      workbookFocus: '7단 곱셈구구를 외우고 활용한다.',
    },
    {
      title: '9단 곱셈구구를 알아볼까요',
      objective: '9단 곱셈구구의 구성 원리를 안다.',
      achievement: '[2수01-11] 9단 곱셈구구를 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '9씩 커지는 규칙으로 9단을 만든다.',
      workbookFocus: '9단 곱셈구구를 외우고 활용한다.',
    },
    {
      title: '1단 곱셈구구와 0의 곱을 알아볼까요',
      objective: '1단 곱셈구구와 0의 곱을 안다.',
      achievement: '[2수01-11] 1단 곱셈구구와 0의 곱을 이해한다.',
      tags: ['multiplication'],
      textbookFocus: '1과의 곱과 0과의 곱의 결과를 확인한다.',
      workbookFocus: '1단과 0의 곱이 들어간 식을 계산한다.',
    },
    {
      title: '곱셈표를 만들어 볼까요',
      objective: '곱셈표를 만들고 두 수를 바꾸어 곱해도 결과가 같음을 안다.',
      achievement: '[2수01-11] 곱셈표에서 규칙을 찾는다.',
      tags: ['multiplication', 'pattern'],
      textbookFocus: '곱셈표를 채우며 규칙을 찾는다.',
      workbookFocus: '곱셈표의 빈칸을 채우고 규칙을 말한다.',
    },
    {
      title: '곱셈구구를 이용하여 문제를 해결해 볼까요',
      objective: '실생활 상황에서 곱셈구구를 이용하여 문제를 해결한다.',
      achievement: '[2수01-11] 곱셈구구로 문제를 해결한다.',
      tags: ['multiplication'],
      textbookFocus: '생활 속 상황을 곱셈식으로 세워 해결한다.',
      workbookFocus: '문장제를 곱셈식으로 나타내어 푼다.',
    },
  ]),
  unit('2-2', 3, '길이 재기', [
    {
      title: '단원 도입',
      objective: '실생활에서 길이 재기가 필요한 상황을 안다.',
      achievement: '[2수03-13] 긴 길이 재기의 필요성을 인식한다.',
      tags: ['measurement'],
      textbookFocus: 'cm로 재기 어려운 긴 길이를 만난다.',
      workbookFocus: 'cm 단위로 길이를 재는 방법을 점검한다.',
    },
    {
      title: 'cm보다 더 큰 단위를 알아볼까요',
      objective: 'cm보다 큰 단위의 필요성을 알고 100cm가 1m임을 안다.',
      achievement: '[2수03-13] 1m를 알고 m와 cm의 관계를 이해한다.',
      tags: ['measurement'],
      textbookFocus: '100cm를 1m로 나타내는 방법을 확인한다.',
      workbookFocus: 'm와 cm를 서로 바꾸어 나타낸다.',
    },
    {
      title: '자로 길이를 재어 볼까요',
      objective: '줄자로 물건의 길이를 재는 방법을 안다.',
      achievement: '[2수03-13] 줄자로 길이를 잰다.',
      tags: ['measurement'],
      textbookFocus: '줄자를 이용해 긴 물건의 길이를 잰다.',
      workbookFocus: '잰 길이를 몇 m 몇 cm로 쓴다.',
    },
    {
      title: '길이의 합을 구해 볼까요',
      objective: '길이의 합을 구한다.',
      achievement: '[2수03-14] 길이의 합을 구한다.',
      tags: ['measurement', 'addition'],
      textbookFocus: 'm는 m끼리, cm는 cm끼리 더한다.',
      workbookFocus: '길이의 합을 구하는 문장제를 푼다.',
    },
    {
      title: '길이의 차를 구해 볼까요',
      objective: '길이의 차를 구한다.',
      achievement: '[2수03-14] 길이의 차를 구한다.',
      tags: ['measurement', 'subtraction'],
      textbookFocus: 'm는 m끼리, cm는 cm끼리 뺀다.',
      workbookFocus: '길이의 차를 구하는 문장제를 푼다.',
    },
    {
      title: '길이를 어림해 볼까요 ⑴',
      objective: '몸의 부분을 이용하여 길이를 어림한다.',
      achievement: '[2수03-15] 길이를 어림한다.',
      tags: ['measurement'],
      textbookFocus: '뼘, 걸음, 양팔 길이로 어림한다.',
      workbookFocus: '어림한 길이와 잰 길이를 비교한다.',
    },
    {
      title: '길이를 어림해 볼까요 ⑵',
      objective: '여러 가지 어림 방법을 이용하여 길이를 어림한다.',
      achievement: '[2수03-15] 여러 가지 방법으로 길이를 어림한다.',
      tags: ['measurement'],
      textbookFocus: '알고 있는 길이를 기준으로 어림한다.',
      workbookFocus: '어림한 방법을 말로 설명한다.',
    },
  ]),
  unit('2-2', 4, '시각과 시간', [
    {
      title: '단원 도입',
      objective: '생활 속에서 시각과 시간이 필요한 상황을 안다.',
      achievement: '[2수03-07] 시각과 시간의 필요성을 인식한다.',
      tags: ['time'],
      textbookFocus: '하루 생활을 시각과 함께 이야기한다.',
      workbookFocus: '몇 시, 몇 시 30분 읽기를 점검한다.',
    },
    {
      title: '몇 시 몇 분을 읽어 볼까요 ⑴',
      objective: '5분 단위까지 몇 시 몇 분을 읽는다.',
      achievement: '[2수03-07] 5분 단위로 시각을 읽는다.',
      tags: ['time'],
      textbookFocus: '긴바늘이 가리키는 숫자를 5씩 뛰어 세어 분을 읽는다.',
      workbookFocus: '5분 단위 시각을 읽고 쓴다.',
    },
    {
      title: '몇 시 몇 분을 읽어 볼까요 ⑵',
      objective: '1분 단위까지 몇 시 몇 분을 읽는다.',
      achievement: '[2수03-07] 1분 단위로 시각을 읽는다.',
      tags: ['time'],
      textbookFocus: '작은 눈금 한 칸이 1분임을 확인한다.',
      workbookFocus: '1분 단위 시각을 읽고 쓴다.',
    },
    {
      title: '여러 가지 방법으로 시각을 읽어 볼까요',
      objective: '같은 시각을 두 가지 방법으로 읽는다.',
      achievement: '[2수03-07] 몇 시 몇 분 전으로도 시각을 읽는다.',
      tags: ['time'],
      textbookFocus: '2시 55분을 3시 5분 전으로도 읽어 본다.',
      workbookFocus: '두 가지 읽기를 서로 연결한다.',
    },
    {
      title: '1시간을 알아볼까요',
      objective: '1시간과 1분의 관계를 안다.',
      achievement: '[2수03-08] 1시간이 60분임을 이해한다.',
      tags: ['time'],
      textbookFocus: '긴바늘이 한 바퀴 도는 데 걸리는 시간이 1시간임을 확인한다.',
      workbookFocus: '시간과 분을 서로 바꾸어 나타낸다.',
    },
    {
      title: '걸린 시간을 알아볼까요',
      objective: '걸린 시간을 몇 시간 몇 분으로 나타낸다.',
      achievement: '[2수03-08] 걸린 시간을 구한다.',
      tags: ['time'],
      textbookFocus: '시작 시각과 끝 시각으로 걸린 시간을 구한다.',
      workbookFocus: '시간 띠를 이용해 걸린 시간을 구한다.',
    },
    {
      title: '하루의 시간을 알아볼까요',
      objective: '하루는 24시간임을 알고 오전과 오후로 나타낸다.',
      achievement: '[2수03-09] 하루가 24시간임을 이해한다.',
      tags: ['time'],
      textbookFocus: '오전 12시간과 오후 12시간을 합해 하루가 됨을 확인한다.',
      workbookFocus: '오전과 오후를 구별해 시각을 쓴다.',
    },
    {
      title: '달력을 알아볼까요',
      objective: '달력을 보고 1주일, 1개월, 1년의 관계를 안다.',
      achievement: '[2수03-09] 달력에서 날짜와 요일의 관계를 이해한다.',
      tags: ['time'],
      textbookFocus: '1주일은 7일, 1년은 12개월임을 달력에서 확인한다.',
      workbookFocus: '달력을 보고 날짜와 요일을 찾는다.',
    },
  ]),
  unit('2-2', 5, '표와 그래프', [
    {
      title: '단원 도입',
      objective: '실생활에서 자료를 모아 알아보기 쉽게 나타내야 함을 안다.',
      achievement: '[2수04-02] 자료를 표와 그래프로 나타낸다.',
      tags: ['data', 'classification'],
      textbookFocus: '좋아하는 것 조사처럼 생활 자료를 모은다.',
      workbookFocus: '표와 그래프에서 수를 읽는 기초를 점검한다.',
    },
    {
      title: '자료를 분류하여 표로 나타내 볼까요',
      objective: '모은 자료를 기준에 따라 분류하고 수를 세어 표로 나타낸다.',
      achievement: '[2수04-02] 자료를 분류하여 표로 나타낸다.',
      tags: ['data', 'classification'],
      textbookFocus: '조사 자료를 활동별로 분류해 세고 표의 빈칸을 채운다.',
      workbookFocus: '표의 빈칸과 합계를 채우는 문제를 푼다.',
    },
    {
      title: '자료를 조사하여 표로 나타내 볼까요',
      objective: '자료를 조사하는 방법을 알고 표로 나타낸다.',
      achievement: '[2수04-02] 자료 수집 방법을 이해하고 표로 나타낸다.',
      tags: ['data'],
      textbookFocus: '손 들기, 붙임쪽지 붙이기처럼 조사 방법을 정해 자료를 모은다.',
      workbookFocus: '빠짐과 겹침 없이 조사한 결과를 표로 옮긴다.',
    },
    {
      title: '자료를 분류하여 그래프로 나타내 볼까요',
      objective: '자료를 분류하여 그래프로 나타낸다.',
      achievement: '[2수04-03] 자료를 그래프로 나타낸다.',
      tags: ['data'],
      textbookFocus: '아래에서부터 빈칸 없이 한 칸에 하나씩 ◯를 그린다.',
      workbookFocus: '그래프의 빠진 칸을 채우고 필요한 칸 수를 구한다.',
    },
    {
      title: '표와 그래프를 보고 무엇을 알 수 있을까요',
      objective: '표와 그래프를 보고 알 수 있는 내용을 찾는다.',
      achievement: '[2수04-03] 자료 표현을 해석하고 비교한다.',
      tags: ['data', 'subtraction'],
      textbookFocus: '가장 많은 항목과 차이를 찾고 표와 그래프의 편리한 점을 비교한다.',
      workbookFocus: '자료 해석 문장제와 비교 문제를 푼다.',
    },
    {
      title: '표와 그래프로 나타내 볼까요',
      objective: '자료를 조사하여 표와 그래프로 나타낸다.',
      achievement: '[2수04-02] 조사, 표, 그래프의 과정을 연결한다.',
      tags: ['data'],
      textbookFocus: '조사하기에서 표, 그래프까지 차례대로 이어서 나타낸다.',
      workbookFocus: '표를 보고 그래프를, 그래프를 보고 표를 완성한다.',
    },
  ]),
  unit('2-2', 6, '규칙 찾기', [
    {
      title: '단원 도입',
      objective: '실생활 속에서 다양한 규칙을 찾는다.',
      achievement: '[2수02-01] 물체, 무늬, 수의 배열에서 규칙을 찾는다.',
      tags: ['pattern'],
      textbookFocus: '생활 주변에서 반복되는 규칙을 찾아본다.',
      workbookFocus: '반복되는 묶음을 찾는 기초를 점검한다.',
    },
    {
      title: '무늬에서 규칙을 찾아볼까요 ⑴',
      objective: '무늬에서 규칙을 찾아 설명한다.',
      achievement: '[2수02-01] 무늬에서 규칙을 찾는다.',
      tags: ['pattern'],
      textbookFocus: '모양과 색깔이 반복되는 규칙을 찾는다.',
      workbookFocus: '빈칸에 알맞은 모양을 그린다.',
    },
    {
      title: '무늬에서 규칙을 찾아볼까요 ⑵',
      objective: '조금 더 복잡한 무늬에서 규칙을 찾아 설명한다.',
      achievement: '[2수02-01] 무늬의 규칙을 설명한다.',
      tags: ['pattern'],
      textbookFocus: '방향이 돌아가거나 개수가 늘어나는 규칙을 찾는다.',
      workbookFocus: '규칙을 말로 설명하고 다음을 예상한다.',
    },
    {
      title: '쌓은 모양에서 규칙을 찾아볼까요',
      objective: '쌓은 모양의 배열에서 규칙을 찾아 설명한다.',
      achievement: '[2수02-01] 물체의 배열에서 규칙을 찾는다.',
      tags: ['pattern'],
      textbookFocus: '쌓기나무가 몇 개씩 늘어나는지 살펴본다.',
      workbookFocus: '다음에 놓일 모양의 쌓기나무 수를 구한다.',
    },
    {
      title: '덧셈표에서 규칙을 찾아볼까요',
      objective: '덧셈표에서 여러 가지 규칙을 찾아 설명한다.',
      achievement: '[2수02-02] 덧셈표에서 규칙을 찾는다.',
      tags: ['pattern'],
      textbookFocus: '오른쪽과 아래쪽으로 얼마씩 커지는지 살펴본다.',
      workbookFocus: '덧셈표의 빈칸을 채우고 규칙을 말한다.',
    },
    {
      title: '곱셈표에서 규칙을 찾아볼까요',
      objective: '곱셈표에서 여러 가지 규칙을 찾아 설명한다.',
      achievement: '[2수02-02] 곱셈표에서 규칙을 찾는다.',
      tags: ['pattern'],
      textbookFocus: '각 단이 얼마씩 커지는지, 대각선의 규칙을 살펴본다.',
      workbookFocus: '곱셈표의 빈칸을 채우고 규칙을 말한다.',
    },
    {
      title: '생활에서 규칙을 찾아볼까요',
      objective: '생활에서 여러 가지 규칙을 찾는다.',
      achievement: '[2수02-01] 생활 속 규칙을 찾아 설명한다.',
      tags: ['pattern'],
      textbookFocus: '달력, 신호등, 사물함 번호에서 규칙을 찾는다.',
      workbookFocus: '생활 속 규칙을 찾아 설명한다.',
    },
  ]),
];

export const lessons = curriculum.flatMap((u) => u.lessons);
