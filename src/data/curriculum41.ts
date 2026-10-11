import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 4학년 1학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명은 동아출판 초등 수학 4-1 교사용 지도서(2022 개정) 각론의
// '단원의 전개 계획'을 그대로 따랐습니다. '뚝딱! 해결해요', '함께! 놀아요',
// '곰곰! 생각해요'는 문항 차시가 아니므로 넣지 않고, 두 차시짜리 주제는
// 한 차시로 둡니다(3학년과 같은 약속).
//
// 지도서가 못박아 둔 것:
//   · 1단원: 억, 조 단위의 큰 수는 억·조 아래 단위를 생략하여 자릿값에
//     집중합니다(예: 3245억). 크기 비교는 자릿수 먼저, 같으면 높은 자리부터.
//   · 2단원: 각과 각도를 섞어 쓰지 않습니다. 예각은 0°보다 크고 직각보다
//     작은 각, 둔각은 직각보다 크고 180°보다 작은 각입니다. 삼각형 세 각의
//     합 180°, 사각형 네 각의 합 360°.
//   · 3단원: (세 자리 수)×(몇십), ×(몇십몇), (두 자리 수)÷(두 자리 수),
//     (세 자리 수)÷(두 자리 수)(몫이 한 자리, 두 자리), 곱셈·나눗셈 어림셈.
//   · 4단원: 밀기·뒤집기는 위·아래·왼쪽·오른쪽, 돌리기는 시계(반대) 방향
//     90°, 180°, 270°, 360°로 한정합니다. 뒤집고 돌리기 같은 복합 변환은
//     다루지 않습니다. 점의 이동은 방향과 거리(~칸, ~cm)를 함께 말합니다.
//   · 5단원: 막대그래프 — 세로 눈금 한 칸의 크기를 먼저 봅니다.
//   · 6단원: 규칙을 식으로 나타낼 때 혼합 계산식·일반항 같은 복잡한 식은
//     다루지 않습니다. 등호 문항은 두 자리 수의 범위입니다.
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
  const semester: Semester = '4-1';
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
const 큰수성취 = '[4수01-01] 큰 수의 필요성을 인식하면서 10000 이상의 큰 수에 대한 자릿값과 위치적 기수법을 이해하고, 수를 읽고 쓸 수 있다.';
const 큰수비교성취 = '[4수01-02] 다섯 자리 이상의 수의 범위에서 수의 계열을 이해하고, 수의 크기를 비교하며 그 방법을 설명할 수 있다.';
const 각성취 = '[4수03-24] 각의 크기의 단위인 1도(°)를 알고, 각도기를 이용하여 각의 크기를 측정하고 어림할 수 있다.';
const 예둔성취 = '[4수03-02] 각과 직각을 이해하고, 직각과 비교하는 활동을 통하여 예각과 둔각을 구별할 수 있다.';
const 내각성취 = '[4수03-25] 여러 가지 방법으로 삼각형과 사각형의 내각의 크기의 합을 추론하고, 자신의 추론 과정을 설명할 수 있다.';
const 곱셈성취 = '[4수01-04] 곱하는 수가 한 자리 수 또는 두 자리 수인 곱셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 나눗셈성취 = '[4수01-07] 나누는 수가 두 자리 수인 나눗셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 어림성취 = '[4수01-08] 자연수의 덧셈, 뺄셈, 곱셈, 나눗셈과 관련한 여러 가지 상황에서 어림셈을 할 수 있다.';
const 이동성취 = '[4수03-04] 구체물이나 평면도형의 밀기, 뒤집기, 돌리기 활동을 통하여 그 변화를 이해한다.';
const 점이동성취 = '[4수03-05] 평면에서 점의 이동에 대해 위치와 방향을 이용하여 설명할 수 있다.';
const 막대성취 = '[4수04-01] 자료를 수집하여 그림그래프나 막대그래프로 나타내고 해석할 수 있다.';
const 탐구성취 = '[4수04-03] 탐구 문제를 해결하기 위해 자료를 수집, 정리하여 막대그래프나 꺾은선그래프로 나타내고 해석할 수 있다.';
const 규칙성취 = '[4수02-01] 다양한 변화 규칙을 찾아 설명하고, 그 규칙을 수나 식으로 나타낼 수 있다.';
const 계산식성취 = '[4수02-02] 계산식의 배열에서 규칙을 찾고, 계산 결과를 추측할 수 있다.';
const 등호성취 = '[4수02-03] 등호를 사용하여 크기가 같은 두 양의 관계를 식으로 나타낼 수 있다.';

export const curriculum41: Unit[] = [
  // ── 1단원 큰 수 ──
  unit(1, '큰 수', [
    {
      title: '단원 도입',
      objective: '생활에서 큰 수가 쓰이는 상황을 알 수 있다.',
      achievement: 큰수성취,
      tags: ['placeValue'],
      textbookFocus: '큰 수가 사용되는 상황을 살펴본다.',
      workbookFocus: '네 자리 수의 자릿값을 떠올린다.',
    },
    {
      title: '만을 알아볼까요',
      objective: '1000이 10개인 수로 10000을 이해하고 쓰고 읽을 수 있다.',
      achievement: 큰수성취,
      tags: ['placeValue'],
      textbookFocus: '1000이 10개이면 10000이고 만 또는 일만이라고 읽는다.',
      workbookFocus: '9000, 9900, 9990, 9999보다 얼마 큰 수가 10000인지 안다.',
    },
    {
      title: '다섯 자리 수를 알아볼까요',
      objective: '다섯 자리 수를 쓰고 읽고 자릿값을 알 수 있다.',
      achievement: 큰수성취,
      tags: ['placeValue'],
      textbookFocus: '10000이 몇 개, 1000이 몇 개 …인 수를 쓰고 읽는다.',
      workbookFocus: '각 자리 숫자가 나타내는 값을 안다.',
    },
    {
      title: '십만, 백만, 천만을 알아볼까요',
      objective: '천만 단위까지의 수를 쓰고 읽을 수 있다.',
      achievement: 큰수성취,
      tags: ['placeValue'],
      textbookFocus: '10000이 10개, 100개, 1000개인 수로 십만, 백만, 천만을 안다.',
      workbookFocus: '만 단위로 끊어 읽는다.',
    },
    {
      title: '억과 조를 알아볼까요',
      objective: '억, 조 단위까지의 수를 쓰고 읽을 수 있다.',
      achievement: 큰수성취,
      tags: ['placeValue'],
      textbookFocus: '천만이 10개인 수로 억을, 1000억이 10개인 수로 조를 안다.',
      workbookFocus: '네 자리씩 끊어 억, 조 단위로 읽는다.',
    },
    {
      title: '뛰어 세기를 어떻게 할까요',
      objective: '큰 수에서 뛰어 세기의 규칙을 찾아 뛰어 셀 수 있다.',
      achievement: 큰수비교성취,
      tags: ['placeValue'],
      textbookFocus: '어느 자리 숫자가 몇씩 커지는지 찾아 뛰어 센다.',
      workbookFocus: '10000씩, 10만씩, 1억씩 뛰어 센다.',
    },
    {
      title: '수의 크기를 어떻게 비교할까요',
      objective: '큰 수의 크기를 비교할 수 있다.',
      achievement: 큰수비교성취,
      tags: ['placeValue'],
      textbookFocus: '자릿수를 먼저 비교하고, 같으면 높은 자리부터 비교한다.',
      workbookFocus: '실생활에서 큰 수의 크기를 비교한다.',
    },
  ]),
  // ── 2단원 각도 ──
  unit(2, '각도', [
    {
      title: '단원 도입',
      objective: '각의 크기가 필요한 상황을 알 수 있다.',
      achievement: 각성취,
      tags: ['angle'],
      textbookFocus: '각의 크기가 필요한 상황을 살펴본다.',
      workbookFocus: '각과 직각을 떠올린다.',
    },
    {
      title: '각의 크기를 어떻게 비교할까요',
      objective: '각의 크기를 여러 가지 방법으로 비교할 수 있다.',
      achievement: 각성취,
      tags: ['angle'],
      textbookFocus: '두 변이 벌어진 정도로 각의 크기를 비교한다.',
      workbookFocus: '변의 길이와 각의 크기는 상관없음을 안다.',
    },
    {
      title: '각의 크기를 어떻게 잴까요',
      objective: '각도의 단위 1°를 알고 각도기로 각도를 잴 수 있다.',
      achievement: 각성취,
      tags: ['angle'],
      textbookFocus: '직각을 똑같이 90으로 나눈 하나가 1°이다. 각도기의 중심과 밑금을 맞추어 잰다.',
      workbookFocus: '안쪽 눈금과 바깥쪽 눈금을 바르게 읽는다.',
    },
    {
      title: '예각, 둔각은 무엇일까요',
      objective: '직각과 비교하여 예각과 둔각을 구별할 수 있다.',
      achievement: 예둔성취,
      tags: ['angle'],
      textbookFocus: '0°보다 크고 직각보다 작은 각은 예각, 직각보다 크고 180°보다 작은 각은 둔각이다.',
      workbookFocus: '시계에서 예각, 직각, 둔각을 찾는다.',
    },
    {
      title: '각도를 어떻게 어림하고 잴까요',
      objective: '각도를 어림하고 재어 확인할 수 있다.',
      achievement: 각성취,
      tags: ['angle'],
      textbookFocus: '삼각자의 30°, 45°, 60°, 90°를 이용하여 각도를 어림한다.',
      workbookFocus: '어림한 각도와 잰 각도를 비교한다.',
    },
    {
      title: '각도의 합과 차를 어떻게 구할까요',
      objective: '각도의 합과 차를 구할 수 있다.',
      achievement: 각성취,
      tags: ['angle'],
      textbookFocus: '두 각을 이어 붙이면 합, 포개면 차를 구한다.',
      workbookFocus: '자연수의 덧셈, 뺄셈처럼 계산하고 °를 붙인다.',
    },
    {
      title: '삼각형의 세 각의 크기의 합은 얼마일까요',
      objective: '삼각형의 세 각의 크기의 합이 180°임을 알 수 있다.',
      achievement: 내각성취,
      tags: ['angle'],
      textbookFocus: '세 각을 잘라 이어 붙이면 직선이 되어 180°이다.',
      workbookFocus: '두 각을 알 때 나머지 한 각을 구한다.',
    },
    {
      title: '사각형의 네 각의 크기의 합은 얼마일까요',
      objective: '사각형의 네 각의 크기의 합이 360°임을 알 수 있다.',
      achievement: 내각성취,
      tags: ['angle'],
      textbookFocus: '사각형을 삼각형 2개로 나누면 180°×2=360°이다.',
      workbookFocus: '세 각을 알 때 나머지 한 각을 구한다.',
    },
  ]),
  // ── 3단원 곱셈과 나눗셈 ──
  unit(3, '곱셈과 나눗셈', [
    {
      title: '단원 도입',
      objective: '곱셈과 나눗셈이 필요한 상황을 알 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication', 'division'],
      textbookFocus: '곱셈과 나눗셈이 필요한 상황을 살펴본다.',
      workbookFocus: '(세 자리 수)×(한 자리 수), (두 자리 수)÷(한 자리 수)를 떠올린다.',
    },
    {
      title: '(세 자리 수)×(몇십)을 어떻게 계산할까요',
      objective: '(세 자리 수)×(몇십)을 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '(세 자리 수)×(몇)의 10배로 (세 자리 수)×(몇십)을 계산한다.',
      workbookFocus: '곱의 끝에 0을 하나 붙인다.',
    },
    {
      title: '(세 자리 수)×(몇십몇)을 어떻게 계산할까요',
      objective: '(세 자리 수)×(몇십몇)을 계산할 수 있다.',
      achievement: 곱셈성취,
      tags: ['multiplication'],
      textbookFocus: '(세 자리 수)×(몇)과 (세 자리 수)×(몇십)을 더한다.',
      workbookFocus: '세로셈에서 자리를 맞추어 쓴다.',
    },
    {
      title: '곱셈의 어림셈을 어떻게 할까요',
      objective: '곱셈의 결과를 어림할 수 있다.',
      achievement: 어림성취,
      tags: ['estimate'],
      textbookFocus: '곱해지는 수를 몇백으로, 곱하는 수를 몇십으로 어림하여 곱한다.',
      workbookFocus: '어림한 값과 실제 계산 결과를 비교한다.',
    },
    {
      title: '(두 자리 수)÷(두 자리 수)를 어떻게 계산할까요',
      objective: '(두 자리 수)÷(두 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '곱셈을 이용하여 몫을 어림하고 나머지를 구한다.',
      workbookFocus: '나머지는 나누는 수보다 작아야 한다.',
    },
    {
      title: '몫이 한 자리 수인 (세 자리 수)÷(두 자리 수)를 어떻게 계산할까요',
      objective: '몫이 한 자리 수인 (세 자리 수)÷(두 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '나누는 수를 몇십으로 어림하여 몫을 찾는다.',
      workbookFocus: '몫과 나머지를 확인한다.',
    },
    {
      title: '내림이 없고 몫이 두 자리 수인 (세 자리 수)÷(두 자리 수)를 어떻게 계산할까요',
      objective: '내림이 없고 몫이 두 자리 수인 나눗셈을 할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '나누어지는 수의 앞 두 자리부터 나눈다.',
      workbookFocus: '몫의 십의 자리와 일의 자리를 차례로 구한다.',
    },
    {
      title: '내림이 있고 몫이 두 자리 수인 (세 자리 수)÷(두 자리 수)를 어떻게 계산할까요',
      objective: '내림이 있고 몫이 두 자리 수인 나눗셈을 할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '남은 수와 일의 자리 숫자를 내려 다시 나눈다.',
      workbookFocus: '(나누는 수)×(몫)+(나머지)로 확인한다.',
    },
    {
      title: '나눗셈의 어림셈을 어떻게 할까요',
      objective: '나눗셈의 결과를 어림할 수 있다.',
      achievement: 어림성취,
      tags: ['estimate'],
      textbookFocus: '나누어지는 수와 나누는 수를 몇백, 몇십으로 어림하여 나눈다.',
      workbookFocus: '어림한 몫과 실제 몫을 비교한다.',
    },
  ]),
  // ── 4단원 평면도형의 이동 ──
  unit(4, '평면도형의 이동', [
    {
      title: '단원 도입',
      objective: '평면도형의 이동이 쓰이는 상황을 알 수 있다.',
      achievement: 이동성취,
      tags: ['transform'],
      textbookFocus: '생활에서 밀기, 뒤집기, 돌리기를 찾는다.',
      workbookFocus: '도형의 변과 꼭짓점을 떠올린다.',
    },
    {
      title: '평면도형을 밀면 어떻게 될까요',
      objective: '평면도형을 밀었을 때의 변화를 알 수 있다.',
      achievement: 이동성취,
      tags: ['transform'],
      textbookFocus: '도형을 밀면 모양과 방향은 그대로이고 위치만 바뀐다.',
      workbookFocus: '몇 칸 밀었는지 말한다.',
    },
    {
      title: '평면도형을 뒤집으면 어떻게 될까요',
      objective: '평면도형을 뒤집었을 때의 변화를 알 수 있다.',
      achievement: 이동성취,
      tags: ['transform'],
      textbookFocus: '오른쪽(왼쪽)으로 뒤집으면 좌우가, 위(아래)로 뒤집으면 위아래가 바뀐다.',
      workbookFocus: '두 번 뒤집으면 처음 도형과 같다.',
    },
    {
      title: '평면도형을 돌리면 어떻게 될까요',
      objective: '평면도형을 돌렸을 때의 변화를 알 수 있다.',
      achievement: 이동성취,
      tags: ['transform'],
      textbookFocus: '시계 방향, 시계 반대 방향으로 90°, 180°, 270°, 360° 돌린다.',
      workbookFocus: '시계 방향 90°와 시계 반대 방향 270°는 같다.',
    },
    {
      title: '점이 어떻게 이동할까요',
      objective: '점의 이동을 방향과 거리로 설명할 수 있다.',
      achievement: 점이동성취,
      tags: ['transform'],
      textbookFocus: '점을 위, 아래, 왼쪽, 오른쪽으로 몇 칸(몇 cm) 옮긴다.',
      workbookFocus: '움직인 방향과 거리를 모두 말한다.',
    },
  ]),
  // ── 5단원 막대그래프 ──
  unit(5, '막대그래프', [
    {
      title: '단원 도입',
      objective: '막대그래프가 필요한 상황을 알 수 있다.',
      achievement: 막대성취,
      tags: ['data'],
      textbookFocus: '조사한 자료를 그래프로 나타내는 상황을 살펴본다.',
      workbookFocus: '표와 그림그래프를 떠올린다.',
    },
    {
      title: '막대그래프는 무엇일까요',
      objective: '막대그래프의 특성을 알 수 있다.',
      achievement: 막대성취,
      tags: ['data'],
      textbookFocus: '조사한 자료를 막대 모양으로 나타낸 그래프가 막대그래프이다.',
      workbookFocus: '표와 막대그래프의 좋은 점을 비교한다.',
    },
    {
      title: '막대그래프로 어떻게 나타낼까요',
      objective: '표를 보고 막대그래프로 나타낼 수 있다.',
      achievement: 막대성취,
      tags: ['data'],
      textbookFocus: '가로와 세로, 눈금 한 칸의 크기를 정하여 막대를 그린다.',
      workbookFocus: '가로와 세로를 바꾸어 나타낸다.',
    },
    {
      title: '막대그래프를 어떻게 해석할까요',
      objective: '막대그래프를 보고 알 수 있는 내용을 말할 수 있다.',
      achievement: 막대성취,
      tags: ['data'],
      textbookFocus: '가장 많은 것, 가장 적은 것, 몇 배인지를 읽는다.',
      workbookFocus: '눈금 한 칸의 크기를 먼저 확인한다.',
    },
    {
      title: '어떻게 자료를 수집하여 막대그래프로 나타낼까요',
      objective: '자료를 수집하여 표와 막대그래프로 나타내고 해석할 수 있다.',
      achievement: 탐구성취,
      tags: ['data'],
      textbookFocus: '조사할 내용과 방법을 정해 자료를 모으고 막대그래프로 나타낸다.',
      workbookFocus: '막대그래프를 보고 알 수 있는 내용을 쓴다.',
    },
  ]),
  // ── 6단원 규칙 찾기 ──
  unit(6, '규칙 찾기', [
    {
      title: '단원 도입',
      objective: '생활에서 규칙을 찾을 수 있다.',
      achievement: 규칙성취,
      tags: ['pattern'],
      textbookFocus: '우리 주변에서 규칙이 있는 사례를 찾는다.',
      workbookFocus: '수 배열의 규칙을 떠올린다.',
    },
    {
      title: '규칙을 찾아 어떻게 설명할까요',
      objective: '수의 배열에서 규칙을 찾아 설명할 수 있다.',
      achievement: 규칙성취,
      tags: ['pattern'],
      textbookFocus: '가로, 세로, 대각선 방향으로 몇씩 커지는지 찾는다.',
      workbookFocus: '규칙에 맞게 빈칸의 수를 구한다.',
    },
    {
      title: '규칙을 찾아 설명하고 어떻게 수로 나타낼까요',
      objective: '모양의 배열에서 규칙을 찾아 수로 나타낼 수 있다.',
      achievement: 규칙성취,
      tags: ['pattern'],
      textbookFocus: '모양의 개수가 늘어나는 규칙을 수로 나타낸다.',
      workbookFocus: '다음에 올 모양의 개수를 구한다.',
    },
    {
      title: '규칙을 찾아 어떻게 식으로 나타낼까요',
      objective: '모양의 배열에서 규칙을 찾아 식으로 나타낼 수 있다.',
      achievement: 규칙성취,
      tags: ['pattern'],
      textbookFocus: '늘어나는 규칙을 덧셈식이나 곱셈식으로 나타낸다.',
      workbookFocus: '식으로 다음 모양의 개수를 추측한다.',
    },
    {
      title: '계산식의 배열에서 어떻게 규칙을 찾을까요',
      objective: '계산식의 배열에서 규칙을 찾을 수 있다.',
      achievement: 계산식성취,
      tags: ['pattern'],
      textbookFocus: '더하는 수, 빼는 수, 계산 결과가 어떻게 변하는지 찾는다.',
      workbookFocus: '규칙에 맞는 계산식을 찾는다.',
    },
    {
      title: '계산식의 배열에서 어떻게 계산 결과를 추측할까요',
      objective: '계산식의 배열에서 계산 결과를 추측할 수 있다.',
      achievement: 계산식성취,
      tags: ['pattern'],
      textbookFocus: '규칙을 이용하여 다음 계산식과 결과를 추측한다.',
      workbookFocus: '추측한 결과를 계산하여 확인한다.',
    },
    {
      title: '크기가 같은 두 양을 등호를 사용하여 어떻게 나타낼까요 ⑴',
      objective: '크기가 같은 두 양을 등호를 사용하여 덧셈식으로 나타낼 수 있다.',
      achievement: 등호성취,
      tags: ['pattern'],
      textbookFocus: '15+12=14+13처럼 크기가 같은 두 양을 등호로 잇는다.',
      workbookFocus: '등호를 사용한 식이 옳은지 판단한다.',
    },
    {
      title: '크기가 같은 두 양을 등호를 사용하여 어떻게 나타낼까요 ⑵',
      objective: '크기가 같은 두 양을 등호를 사용하여 곱셈식으로 나타낼 수 있다.',
      achievement: 등호성취,
      tags: ['pattern'],
      textbookFocus: '4×6=8×3처럼 곱셈식을 등호로 잇는다.',
      workbookFocus: '등호의 양쪽 크기가 같아지는 수를 찾는다.',
    },
  ]),
];

export const lessons41 = curriculum41.flatMap((unitEntry) => unitEntry.lessons);
