import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 4학년 2학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명은 동아출판 초등 수학 4-2 교사용 지도서(2022 개정) 각론의
// '단원의 전개 계획'을 그대로 따랐습니다. 4-1과 같은 약속을 지킵니다.
//
// 지도서가 못박아 둔 것:
//   · 1단원: 분모가 같은 분수의 덧셈과 뺄셈입니다. 계산 결과가 가분수이면
//     대분수로 나타내고, 약분할 수 있어도 기약분수로 바꾸지 않습니다.
//   · 2단원: 정삼각형과 이등변삼각형의 포함 관계는 다루지 않습니다.
//     이등변삼각형은 두 변의 길이가 같고 두 각의 크기가 같습니다.
//     정삼각형은 세 변의 길이가 같고 세 각이 모두 60°입니다.
//   · 3단원: 소수 두 자리·세 자리 수. 자연수처럼 높은 자리부터 비교하고
//     소수점의 위치를 맞추어 계산합니다. 너무 복잡한 계산은 다루지 않습니다.
//   · 4단원: 수직, 수선, 평행, 평행선, 평행선 사이의 거리를 구별합니다.
//     여러 가지 사각형 사이의 포함 관계는 다루지 않습니다.
//   · 5단원: 꺾은선그래프 — 물결선은 필요 없는 부분을 줄여 나타낼 때
//     씁니다. 막대그래프와 꺾은선그래프를 알맞게 고릅니다.
//   · 6단원: 다각형은 선분으로만 둘러싸인 도형이며 볼록다각형만 다룹니다.
//     정다각형은 변의 길이가 모두 같고 각의 크기가 모두 같은 다각형입니다.
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

// 4학년 문항은 차시마다 자기 수를 직접 고르므로 maxNumber가 문항을 자르는
// 일은 없습니다. 단원 종합·학기 종합에서 읽으므로 비워 두지 않습니다.
const scopeFor = (): LessonScope => ({
  maxNumber: 100000000,
  representation: 'symbolic',
  forbidVisuals: ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern', 'grid-table'],
});

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '4-2';
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
const 분수성취 = '[4수01-15] 분모가 같은 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 이등변성취 = '[4수03-08] 여러 가지 모양의 삼각형에 대한 분류 활동을 통하여 이등변삼각형, 정삼각형을 이해하고, 그 성질을 탐구하고 설명할 수 있다.';
const 예둔삼각성취 = '[4수03-09] 여러 가지 모양의 삼각형에 대한 분류 활동을 통하여 직각삼각형, 예각삼각형, 둔각삼각형을 이해한다.';
const 소수성취 = '[4수01-13] 자릿값의 원리를 바탕으로 소수 두 자리 수와 소수 세 자리 수를 이해하고 읽고 쓸 수 있다.';
const 소수비교성취 = '[4수01-14] 소수의 크기를 비교하고 그 방법을 설명할 수 있다.';
const 소수계산성취 = '[4수01-16] 소수 두 자리 수의 범위에서 소수의 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 수직평행성취 = '[4수03-03] 직선의 수직 관계와 평행 관계를 이해한다.';
const 사각형성취 = '[4수03-10] 여러 가지 모양의 사각형에 대한 분류 활동을 통하여 직사각형, 정사각형, 사다리꼴, 평행사변형, 마름모를 이해하고, 그 성질을 탐구하고 설명할 수 있다.';
const 꺾은선성취 = '[4수04-02] 자료를 수집하여 꺾은선그래프로 나타내고 해석할 수 있다.';
const 탐구성취 = '[4수04-03] 탐구 문제를 해결하기 위해 자료를 수집, 정리하여 막대그래프나 꺾은선그래프로 나타내고 해석할 수 있다.';
const 다각형성취 = '[4수03-11] 다각형과 정다각형을 이해한다.';
const 모양성취 = '[4수03-12] 주어진 도형을 이용하여 여러 가지 모양을 만들거나 채우고 설명할 수 있다.';

export const curriculum42: Unit[] = [
  // ── 1단원 분수의 덧셈과 뺄셈 ──
  unit(1, '분수의 덧셈과 뺄셈', [
    {
      title: '단원 도입',
      objective: '분수의 덧셈과 뺄셈이 필요한 상황을 알 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '분수의 덧셈과 뺄셈이 필요한 상황을 살펴본다.',
      workbookFocus: '단위분수, 진분수, 가분수, 대분수를 떠올린다.',
    },
    {
      title: '(진분수)+(진분수)를 어떻게 계산할까요',
      objective: '분모가 같은 진분수의 덧셈을 할 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '단위분수가 몇 개인지 세어 분모는 그대로 두고 분자끼리 더한다.',
      workbookFocus: '계산 결과가 가분수이면 대분수로 나타낸다.',
    },
    {
      title: '(대분수)+(대분수)를 어떻게 계산할까요 ⑴',
      objective: '진분수 부분의 합이 1보다 작은 대분수의 덧셈을 할 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '자연수 부분끼리, 진분수 부분끼리 더한다.',
      workbookFocus: '대분수를 가분수로 나타내어 더한다.',
    },
    {
      title: '(대분수)+(대분수)를 어떻게 계산할까요 ⑵',
      objective: '진분수 부분의 합이 1보다 큰 대분수의 덧셈을 할 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '진분수 부분의 합이 가분수이면 대분수로 바꾸어 자연수 부분에 더한다.',
      workbookFocus: '받아올림을 빠뜨리지 않는다.',
    },
    {
      title: '(분수)-(분수)를 어떻게 계산할까요',
      objective: '분모가 같은 진분수와 대분수의 뺄셈을 할 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '분모는 그대로 두고 분자끼리 뺀다. 대분수는 자연수끼리, 분수끼리 뺀다.',
      workbookFocus: '계산 결과를 확인한다.',
    },
    {
      title: '(자연수)-(분수)를 어떻게 계산할까요',
      objective: '자연수에서 분수를 뺄 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '자연수에서 1을 가분수로 바꾸어 뺀다.',
      workbookFocus: '3-1과 1/4을 2와 4/4-1과 1/4로 계산한다.',
    },
    {
      title: '(대분수)-(대분수)를 어떻게 계산할까요',
      objective: '진분수 부분끼리 뺄 수 없는 대분수의 뺄셈을 할 수 있다.',
      achievement: 분수성취,
      tags: ['fractionAdd'],
      textbookFocus: '자연수에서 1을 분수로 바꾸어 진분수 부분끼리 뺀다.',
      workbookFocus: '대분수를 가분수로 바꾸어 뺀다.',
    },
  ]),
  // ── 2단원 삼각형 ──
  unit(2, '삼각형', [
    {
      title: '단원 도입',
      objective: '삼각형을 분류하고 정의할 필요성을 알 수 있다.',
      achievement: 예둔삼각성취,
      tags: ['shape'],
      textbookFocus: '삼각형을 여러 가지 기준으로 나누어 본다.',
      workbookFocus: '직각삼각형과 예각, 둔각을 떠올린다.',
    },
    {
      title: '삼각형을 각의 크기에 따라 어떻게 분류할까요',
      objective: '예각삼각형, 직각삼각형, 둔각삼각형을 알 수 있다.',
      achievement: 예둔삼각성취,
      tags: ['shape'],
      textbookFocus: '세 각이 모두 예각이면 예각삼각형, 한 각이 둔각이면 둔각삼각형이다.',
      workbookFocus: '세 각의 크기를 보고 삼각형을 분류한다.',
    },
    {
      title: '삼각형을 변의 길이에 따라 어떻게 분류할까요',
      objective: '이등변삼각형과 정삼각형을 알 수 있다.',
      achievement: 이등변성취,
      tags: ['shape'],
      textbookFocus: '두 변의 길이가 같으면 이등변삼각형, 세 변의 길이가 같으면 정삼각형이다.',
      workbookFocus: '각의 크기와 변의 길이에 따라 삼각형을 분류한다.',
    },
    {
      title: '이등변삼각형에는 어떤 성질이 있을까요',
      objective: '이등변삼각형의 두 각의 크기가 같음을 알 수 있다.',
      achievement: 이등변성취,
      tags: ['shape'],
      textbookFocus: '이등변삼각형은 길이가 같은 두 변과 함께하는 두 각의 크기가 같다.',
      workbookFocus: '한 각을 알 때 나머지 각을 구한다.',
    },
    {
      title: '정삼각형에는 어떤 성질이 있을까요',
      objective: '정삼각형의 세 각의 크기가 같음을 알 수 있다.',
      achievement: 이등변성취,
      tags: ['shape'],
      textbookFocus: '정삼각형은 세 각의 크기가 모두 60°이다.',
      workbookFocus: '정삼각형의 둘레와 한 변의 길이를 구한다.',
    },
  ]),
  // ── 3단원 소수의 덧셈과 뺄셈 ──
  unit(3, '소수의 덧셈과 뺄셈', [
    {
      title: '단원 도입',
      objective: '소수와 소수의 덧셈, 뺄셈이 필요한 상황을 알 수 있다.',
      achievement: 소수성취,
      tags: ['decimal'],
      textbookFocus: '소수가 쓰이는 상황을 살펴본다.',
      workbookFocus: '소수 한 자리 수를 떠올린다.',
    },
    {
      title: '소수 두 자리 수를 알아볼까요',
      objective: '소수 두 자리 수를 쓰고 읽을 수 있다.',
      achievement: 소수성취,
      tags: ['decimal'],
      textbookFocus: '1/100을 0.01이라 쓰고 영 점 영일이라고 읽는다.',
      workbookFocus: '각 자리 숫자가 나타내는 값을 안다.',
    },
    {
      title: '소수 세 자리 수를 알아볼까요',
      objective: '소수 세 자리 수를 쓰고 읽을 수 있다.',
      achievement: 소수성취,
      tags: ['decimal'],
      textbookFocus: '1/1000을 0.001이라 쓰고 영 점 영영일이라고 읽는다.',
      workbookFocus: '소수 셋째 자리 숫자가 나타내는 값을 안다.',
    },
    {
      title: '소수의 크기를 어떻게 비교할까요',
      objective: '소수의 크기를 비교할 수 있다.',
      achievement: 소수비교성취,
      tags: ['decimal'],
      textbookFocus: '자연수 부분부터 높은 자리 순서대로 비교한다.',
      workbookFocus: '0.5=0.50처럼 끝자리 0은 생략할 수 있다.',
    },
    {
      title: '소수 사이에는 어떤 관계가 있을까요',
      objective: '1, 0.1, 0.01, 0.001 사이의 관계를 알 수 있다.',
      achievement: 소수성취,
      tags: ['decimal'],
      textbookFocus: '소수를 10배 하면 소수점이 오른쪽으로 한 칸, 1/10을 하면 왼쪽으로 한 칸 옮겨진다.',
      workbookFocus: '10배, 100배, 1/10, 1/100을 구한다.',
    },
    {
      title: '소수 한 자리 수의 덧셈을 어떻게 할까요',
      objective: '소수 한 자리 수의 덧셈을 할 수 있다.',
      achievement: 소수계산성취,
      tags: ['decimal'],
      textbookFocus: '소수점의 자리를 맞추어 같은 자리끼리 더한다.',
      workbookFocus: '받아올림이 있는 덧셈을 한다.',
    },
    {
      title: '소수 두 자리 수의 덧셈을 어떻게 할까요',
      objective: '소수 두 자리 수의 덧셈을 할 수 있다.',
      achievement: 소수계산성취,
      tags: ['decimal'],
      textbookFocus: '소수점의 자리를 맞추어 같은 자리끼리 더한다.',
      workbookFocus: '자릿수가 다른 소수의 덧셈을 한다.',
    },
    {
      title: '소수 한 자리 수의 뺄셈을 어떻게 할까요',
      objective: '소수 한 자리 수의 뺄셈을 할 수 있다.',
      achievement: 소수계산성취,
      tags: ['decimal'],
      textbookFocus: '소수점의 자리를 맞추어 같은 자리끼리 뺀다.',
      workbookFocus: '받아내림이 있는 뺄셈을 한다.',
    },
    {
      title: '소수 두 자리 수의 뺄셈을 어떻게 할까요',
      objective: '소수 두 자리 수의 뺄셈을 할 수 있다.',
      achievement: 소수계산성취,
      tags: ['decimal'],
      textbookFocus: '소수점의 자리를 맞추어 같은 자리끼리 뺀다.',
      workbookFocus: '자릿수가 다른 소수의 뺄셈을 한다.',
    },
  ]),
  // ── 4단원 사각형 ──
  unit(4, '사각형', [
    {
      title: '단원 도입',
      objective: '여러 가지 사각형을 떠올릴 수 있다.',
      achievement: 수직평행성취,
      tags: ['shape'],
      textbookFocus: '직각, 직사각형, 정사각형을 떠올린다.',
      workbookFocus: '사각형의 변과 각을 살펴본다.',
    },
    {
      title: '수직은 무엇일까요',
      objective: '수직과 수선을 알 수 있다.',
      achievement: 수직평행성취,
      tags: ['shape'],
      textbookFocus: '두 직선이 만나서 이루는 각이 직각이면 서로 수직이고, 한 직선은 다른 직선에 대한 수선이다.',
      workbookFocus: '수선을 긋는다.',
    },
    {
      title: '평행은 무엇일까요',
      objective: '평행과 평행선을 알 수 있다.',
      achievement: 수직평행성취,
      tags: ['shape'],
      textbookFocus: '한 직선에 수직인 두 직선은 서로 만나지 않으며 평행하다. 평행한 두 직선을 평행선이라고 한다.',
      workbookFocus: '평행선을 긋는다.',
    },
    {
      title: '평행선 사이의 거리는 무엇일까요',
      objective: '평행선 사이의 거리를 알 수 있다.',
      achievement: 수직평행성취,
      tags: ['shape'],
      textbookFocus: '평행선 사이의 수선의 길이를 평행선 사이의 거리라고 한다.',
      workbookFocus: '평행선 사이의 거리를 잰다.',
    },
    {
      title: '사다리꼴은 무엇일까요',
      objective: '사다리꼴을 알 수 있다.',
      achievement: 사각형성취,
      tags: ['shape'],
      textbookFocus: '평행한 변이 한 쌍이라도 있는 사각형이 사다리꼴이다.',
      workbookFocus: '사다리꼴을 찾고 그린다.',
    },
    {
      title: '평행사변형은 무엇일까요',
      objective: '평행사변형과 그 성질을 알 수 있다.',
      achievement: 사각형성취,
      tags: ['shape'],
      textbookFocus: '마주 보는 두 쌍의 변이 서로 평행한 사각형이 평행사변형이다. 마주 보는 변의 길이와 각의 크기가 같다.',
      workbookFocus: '이웃한 두 각의 크기의 합은 180°이다.',
    },
    {
      title: '마름모는 무엇일까요',
      objective: '마름모와 그 성질을 알 수 있다.',
      achievement: 사각형성취,
      tags: ['shape'],
      textbookFocus: '네 변의 길이가 모두 같은 사각형이 마름모이다. 마주 보는 각의 크기가 같다.',
      workbookFocus: '마름모의 둘레와 각의 크기를 구한다.',
    },
    {
      title: '여러 가지 사각형을 알아볼까요',
      objective: '여러 가지 사각형의 성질을 알 수 있다.',
      achievement: 사각형성취,
      tags: ['shape'],
      textbookFocus: '사다리꼴, 평행사변형, 마름모, 직사각형, 정사각형을 찾아 정당화한다.',
      workbookFocus: '직사각형과 정사각형의 성질을 이용하여 문제를 해결한다.',
    },
  ]),
  // ── 5단원 꺾은선그래프 ──
  unit(5, '꺾은선그래프', [
    {
      title: '단원 도입',
      objective: '꺾은선그래프가 필요한 상황을 알 수 있다.',
      achievement: 꺾은선성취,
      tags: ['data'],
      textbookFocus: '시간에 따라 변하는 자료를 살펴본다.',
      workbookFocus: '막대그래프를 떠올린다.',
    },
    {
      title: '꺾은선그래프는 무엇일까요',
      objective: '꺾은선그래프의 특성을 알 수 있다.',
      achievement: 꺾은선성취,
      tags: ['data'],
      textbookFocus: '수량을 점으로 찍고 선분으로 이은 그래프가 꺾은선그래프이다. 물결선으로 필요 없는 부분을 줄인다.',
      workbookFocus: '선이 기울어진 정도로 변화의 크기를 안다.',
    },
    {
      title: '꺾은선그래프로 어떻게 나타낼까요',
      objective: '표를 보고 꺾은선그래프로 나타낼 수 있다.',
      achievement: 꺾은선성취,
      tags: ['data'],
      textbookFocus: '가로와 세로, 눈금 한 칸의 크기, 물결선 사용을 정하여 점을 찍고 잇는다.',
      workbookFocus: '물결선을 사용한 꺾은선그래프로 나타낸다.',
    },
    {
      title: '꺾은선그래프를 어떻게 해석할까요',
      objective: '꺾은선그래프를 보고 알 수 있는 내용을 말할 수 있다.',
      achievement: 꺾은선성취,
      tags: ['data'],
      textbookFocus: '가장 많이 변한 때, 늘어난 때와 줄어든 때를 읽는다.',
      workbookFocus: '그래프로 그 사이의 값을 짐작한다.',
    },
    {
      title: '어떻게 자료를 수집하여 꺾은선그래프로 나타낼까요',
      objective: '자료를 수집하여 꺾은선그래프로 나타내고 해석할 수 있다.',
      achievement: 탐구성취,
      tags: ['data'],
      textbookFocus: '자료를 수집하여 표와 꺾은선그래프로 나타낸다.',
      workbookFocus: '알 수 있는 내용을 말한다.',
    },
    {
      title: '알맞은 그래프를 알아볼까요',
      objective: '자료에 알맞은 그래프를 고를 수 있다.',
      achievement: 탐구성취,
      tags: ['data'],
      textbookFocus: '항목끼리 비교하면 막대그래프, 시간에 따른 변화는 꺾은선그래프가 알맞다.',
      workbookFocus: '알맞은 그래프를 고르고 이유를 말한다.',
    },
  ]),
  // ── 6단원 다각형 ──
  unit(6, '다각형', [
    {
      title: '단원 도입',
      objective: '다각형이 필요한 상황을 알 수 있다.',
      achievement: 다각형성취,
      tags: ['shape'],
      textbookFocus: '생활에서 다각형을 찾는다.',
      workbookFocus: '삼각형과 사각형을 떠올린다.',
    },
    {
      title: '다각형은 무엇일까요',
      objective: '다각형을 알고 변의 수에 따라 이름을 붙일 수 있다.',
      achievement: 다각형성취,
      tags: ['shape'],
      textbookFocus: '선분으로만 둘러싸인 도형을 다각형이라 하고 변의 수에 따라 오각형, 육각형 …이라고 한다.',
      workbookFocus: '다각형의 변과 꼭짓점의 수를 센다.',
    },
    {
      title: '정다각형은 무엇일까요',
      objective: '정다각형을 알 수 있다.',
      achievement: 다각형성취,
      tags: ['shape'],
      textbookFocus: '변의 길이가 모두 같고 각의 크기가 모두 같은 다각형을 정다각형이라고 한다.',
      workbookFocus: '정다각형의 둘레를 구한다.',
    },
    {
      title: '대각선은 무엇일까요',
      objective: '대각선을 알고 그 수를 셀 수 있다.',
      achievement: 다각형성취,
      tags: ['shape'],
      textbookFocus: '서로 이웃하지 않는 두 꼭짓점을 이은 선분을 대각선이라고 한다.',
      workbookFocus: '사각형의 대각선의 특징을 안다.',
    },
    {
      title: '모양 만들기를 해 볼까요',
      objective: '여러 가지 도형으로 다각형을 만들 수 있다.',
      achievement: 모양성취,
      tags: ['shape'],
      textbookFocus: '칠교 조각과 모양 조각으로 다각형을 만든다.',
      workbookFocus: '모양 조각 몇 개로 만들 수 있는지 센다.',
    },
    {
      title: '모양 채우기를 해 볼까요',
      objective: '여러 가지 도형으로 다각형을 채울 수 있다.',
      achievement: 모양성취,
      tags: ['shape'],
      textbookFocus: '빈틈없이 겹치지 않게 모양 조각으로 채운다.',
      workbookFocus: '조각의 수를 센다.',
    },
  ]),
];

export const lessons42 = curriculum42.flatMap((unitEntry) => unitEntry.lessons);
