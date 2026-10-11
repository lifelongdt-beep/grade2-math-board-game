import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 1학년 2학기 차시
// ────────────────────────────────────────────────────────────────────
// 1-2 교사용 지도서는 아직 받지 못했습니다. 차시명과 내용은 동아출판
// 초등 수학 1-2 '단원 지도 계획'(한글 파일, 0~7단원)의 '단원 전개 계획:
// 수업의 흐름'과 '교수·학습 방법 및 유의 사항'을 그대로 따랐습니다.
//
// 1-1과 같은 약속을 지킵니다.
//   · '수학을 만나요'(0단원), '수학이랑 확인해요', '수학이랑 만들어요',
//     '수학이랑 함께해요'(7단원)는 문항 차시가 아니므로 넣지 않습니다.
//   · 한 주제에 두 차시를 주는 곳은 한 차시로 둡니다.
//
// 단원 지도 계획이 못박은 것:
//   · 1단원: 100까지의 수. 두 수의 크기를 부등호(>, <)로 나타냅니다.
//     짝수와 홀수는 "20 이하의 수의 범위에서" 둘씩 짝지어 다룹니다.
//     수를 한글로 쓰게 하지 않습니다(읽기를 고르게 합니다).
//   · 2단원: 세 수의 덧셈과 뺄셈은 "9 이하의 범위에서 … 앞에서부터 두
//     수씩 순서대로" 계산합니다. 10이 되는 더하기, 10에서 빼기, 10을
//     만들어 더하기(세 수, 합이 10을 넘을 수 있음).
//   · 3단원: ■, ▲, ● 모양은 입체의 한 부분인 평면 모양입니다. "모양을
//     지칭하기 위한 용어를 사용하지 않고" — 사각형·삼각형·원이라고 쓰지
//     않고 기호(■, ▲, ●)로 부릅니다. 시각은 몇 시와 몇 시 30분만 읽습니다.
//     짧은바늘은 시, 긴바늘은 분을 나타냅니다.
//   · 4단원: (몇)+(몇)=(십몇), (십몇)-(몇)=(십), (십몇)-(몇)=(몇).
//   · 5단원: 크기, 색깔, 위치, 방향의 단순한 규칙만 다루고 "지나치게
//     복잡한 배열은 다루지 않는다." 수 배열과 수 배열표의 규칙.
//   · 6단원: 받아올림·받아내림이 없는 두 자리 수의 덧셈과 뺄셈입니다.
//     계획에는 뺄셈 꼴이 '(몇십)-(몇)'으로 적혀 있으나, 30-4처럼 이 꼴은
//     늘 받아내림이 있어 '받아내림이 없는'과 맞지 않습니다. 같은 차시의
//     덧셈 꼴과 짝을 맞추어 (몇십몇)-(몇)으로 읽었습니다.
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

const scopeFor = (unitTitle: string): LessonScope => {
  const forbidVisuals = ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern', 'grid-table'];
  if (unitTitle === '모양과 시각') return { maxNumber: 12, representation: 'semi', forbidVisuals: forbidVisuals.filter((k) => k !== 'clock') };
  if (unitTitle === '덧셈과 뺄셈(1)') return { maxNumber: 19, representation: 'concrete', forbidVisuals };
  if (unitTitle === '덧셈과 뺄셈(2)') return { maxNumber: 19, representation: 'concrete', forbidVisuals };
  return { maxNumber: 100, representation: 'semi', forbidVisuals };
};

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '1-2';
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
      scope: scopeFor(title),
    })),
  };
};

const 수성취 = '[2수01-02] 수의 필요성을 인식하면서 0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.';
const 계열성취 = '[2수01-03] 네 자리 이하의 수의 범위에서 수의 계열을 이해하고, 수의 크기를 비교할 수 있다.';
const 덧뺄의미성취 = '[2수01-05] 덧셈과 뺄셈이 이루어지는 실생활 상황과 연결하여 덧셈과 뺄셈의 의미를 이해한다.';
const 덧뺄계산성취 = '[2수01-06] 두 자리 수의 범위에서 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 세수성취 = '[2수01-08] 두 자리 수의 범위에서 세 수의 덧셈과 뺄셈을 할 수 있다.';
const 모양성취 = '[2수03-03] 교실 및 생활 주변에서 여러 가지 물건을 관찰하여 삼각형, 사각형, 원의 모양을 찾고, 이를 이용하여 여러 가지 모양을 만들 수 있다.';
const 시각성취 = '[2수03-07] 시계를 보고 시각을 ‘몇 시 몇 분’까지 읽을 수 있다.';
const 규칙찾기성취 = '[2수02-01] 물체, 무늬, 수 등의 배열에서 규칙을 찾아 여러 가지 방법으로 표현할 수 있다.';
const 규칙만들기성취 = '[2수02-02] 자신이 정한 규칙에 따라 물체, 무늬, 수 등을 배열할 수 있다.';

export const curriculum12: Unit[] = [
  // ── 1단원 100까지의 수 (10차시 중 1~8차시) ────────────────────────
  unit(1, '100까지의 수', [
    {
      title: '단원 도입',
      objective: '생활에서 50보다 큰 수가 필요한 상황을 알 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '시장에 진열된 물건을 보고 50보다 큰 수에 관심을 갖는다.',
      workbookFocus: '50까지의 수를 10개씩 묶음과 낱개로 떠올린다.',
    },
    {
      title: '60, 70, 80, 90을 알아볼까요',
      objective: '10개씩 묶어 세어 60, 70, 80, 90을 알고 쓰고 읽을 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '10개씩 묶음 6개를 60이라 쓰고 육십, 예순으로 읽는다. 70(칠십, 일흔), 80(팔십, 여든), 90(구십, 아흔).',
      workbookFocus: '10개씩 묶음의 수와 몇십을 잇는다.',
    },
    {
      title: '99까지의 수를 알아볼까요',
      objective: '10개씩 묶음과 낱개로 99까지의 수를 세고 쓰고 읽을 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '낱개가 1개씩 늘어날 때와 10개씩 묶음이 1개씩 늘어날 때의 수를 쓰고 읽는다.',
      workbookFocus: '연결 모형의 수를 묻고 답한다.',
    },
    {
      title: '수를 넣어 이야기를 해 볼까요',
      objective: '그림 속 장면에서 수를 찾아 알맞게 읽고 이야기할 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '개수는 예순일곱처럼, 번호와 차례는 육십칠처럼 장면에 어울리게 읽는다.',
      workbookFocus: '이야기에 알맞은 수를 넣는다.',
    },
    {
      title: '수의 순서를 알아볼까요',
      objective: '100까지 수의 순서를 알고 99보다 1만큼 더 큰 수가 100임을 알 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '1만큼 더 큰 수와 1만큼 더 작은 수를 알고 수 배열표로 100까지 수의 순서를 안다.',
      workbookFocus: '99 다음 수 100을 백이라고 읽는다.',
    },
    {
      title: '수의 크기를 비교해 볼까요',
      objective: '두 수의 크기를 비교하여 >, <로 나타낼 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '10개씩 묶음의 수를 먼저 비교하고 같으면 낱개의 수를 비교하여 >, <로 나타낸다.',
      workbookFocus: '세 수를 골라 크기를 비교한다.',
    },
    {
      title: '짝수와 홀수를 알아볼까요',
      objective: '20 이하의 수에서 짝수와 홀수를 알 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '둘씩 짝을 지어 남는 것이 없으면 짝수, 하나가 남으면 홀수임을 안다.',
      workbookFocus: '20 이하의 수에서 짝수와 홀수를 찾는다.',
    },
  ]),
  // ── 2단원 덧셈과 뺄셈(1) (10차시 중 1~8차시) ──────────────────────
  unit(2, '덧셈과 뺄셈(1)', [
    {
      title: '단원 도입',
      objective: '놀이 상황에서 덧셈과 뺄셈을 찾아 식으로 나타낼 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '놀이 컵 쌓기에서 덧셈과 뺄셈 상황을 찾는다.',
      workbookFocus: '한 자리 수의 덧셈과 뺄셈을 떠올린다.',
    },
    {
      title: '세 수의 덧셈을 해 볼까요',
      objective: '한 자리 수인 세 수의 덧셈을 할 수 있다.',
      achievement: 세수성취,
      tags: ['addition'],
      textbookFocus: '앞에서부터 두 수씩 순서대로 더한다(합 9 이하).',
      workbookFocus: '세 수의 덧셈식을 만들고 계산한다.',
    },
    {
      title: '세 수의 뺄셈을 해 볼까요',
      objective: '한 자리 수인 세 수의 뺄셈을 할 수 있다.',
      achievement: 세수성취,
      tags: ['subtraction'],
      textbookFocus: '앞에서부터 두 수씩 순서대로 뺀다.',
      workbookFocus: '세 수의 뺄셈식을 만들고 계산한다.',
    },
    {
      title: '10이 되는 더하기를 해 볼까요',
      objective: '더하여 10이 되는 두 수를 알고 덧셈식을 만들 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition'],
      textbookFocus: '10이 되는 덧셈식을 만들고 두 수를 바꾸어 더해도 합이 같음을 안다.',
      workbookFocus: '□+■=10에서 빈칸을 채운다.',
    },
    {
      title: '10에서 빼기를 해 볼까요',
      objective: '10에서 빼는 뺄셈을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['subtraction'],
      textbookFocus: '십 배열판과 연결 모형으로 10에서 빼는 뺄셈식을 만든다.',
      workbookFocus: '10-□의 값을 구한다.',
    },
    {
      title: '10을 만들어 더해 볼까요',
      objective: '세 수의 덧셈에서 10을 만들어 합을 구할 수 있다.',
      achievement: 세수성취,
      tags: ['addition'],
      textbookFocus: '합이 10이 되는 두 수를 먼저 더하고 나머지 수를 더한다.',
      workbookFocus: '앞에서부터 더한 결과와 10을 만들어 더한 결과를 비교한다.',
    },
  ]),
  // ── 3단원 모양과 시각 (9차시 중 1~7차시) ──────────────────────────
  unit(3, '모양과 시각', [
    {
      title: '단원 도입',
      objective: '생활에서 ■, ▲, ● 모양과 시각의 쓰임을 찾을 수 있다.',
      achievement: 모양성취,
      tags: ['shape', 'time'],
      textbookFocus: '그림에서 ■, ▲, ● 모양을 찾고 시각이 필요한 상황을 이야기한다.',
      workbookFocus: '같은 모양끼리 잇는다.',
    },
    {
      title: '모양을 찾아볼까요',
      objective: '생활 주변에서 ■, ▲, ● 모양을 찾아 모을 수 있다.',
      achievement: 모양성취,
      tags: ['shape'],
      textbookFocus: '그림에서 ■, ▲, ● 모양을 찾아 같은 모양끼리 모은다.',
      workbookFocus: '모양의 특징을 바탕으로 이름을 지어 본다.',
    },
    {
      title: '모양을 알아볼까요',
      objective: '■, ▲, ● 모양의 특징을 알 수 있다.',
      achievement: 모양성취,
      tags: ['shape'],
      textbookFocus: '본뜨기와 찍기로 뾰족한 부분, 곧은 선, 둥근 선을 찾는다.',
      workbookFocus: '뾰족한 부분이 몇 군데인지 말한다.',
    },
    {
      title: '여러 가지 모양을 만들어 볼까요',
      objective: '■, ▲, ● 모양으로 여러 가지 모양을 만들 수 있다.',
      achievement: 모양성취,
      tags: ['shape'],
      textbookFocus: '만든 모양에서 ■, ▲, ● 모양을 찾아 센다.',
      workbookFocus: '가장 많이 쓴 모양을 찾는다.',
    },
    {
      title: '몇 시를 알아볼까요',
      objective: '시계를 보고 몇 시를 읽고 나타낼 수 있다.',
      achievement: 시각성취,
      tags: ['time'],
      textbookFocus: '긴바늘이 12를 가리키고 짧은바늘이 가리키는 수가 몇 시이다.',
      workbookFocus: '시계를 보고 시각을 쓰고 읽는다.',
    },
    {
      title: '몇 시 30분을 알아볼까요',
      objective: '시계를 보고 몇 시 30분을 읽고 나타낼 수 있다.',
      achievement: 시각성취,
      tags: ['time'],
      textbookFocus: '긴바늘이 6을 가리키고 짧은바늘이 두 수 사이에 있으면 몇 시 30분이다.',
      workbookFocus: '짧은바늘이 지난 수가 몇 시이다.',
    },
  ]),
  // ── 4단원 덧셈과 뺄셈(2) (11차시 중 1~9차시) ──────────────────────
  unit(4, '덧셈과 뺄셈(2)', [
    {
      title: '단원 도입',
      objective: '(십)+(몇)과 (십)-(몇)을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '10과 몇을 모으고 십몇에서 몇을 덜어 낸다.',
      workbookFocus: '10+몇, 1몇-몇을 계산한다.',
    },
    {
      title: '덧셈을 알아볼까요',
      objective: '첨가·합병 상황에서 (몇)+(몇)을 자신의 방법으로 할 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['addition'],
      textbookFocus: '바둑돌과 수 구슬로 이어 세기, 10 만들기를 하여 더한다.',
      workbookFocus: '덧셈 상황을 덧셈식으로 나타낸다.',
    },
    {
      title: '덧셈을 해 볼까요',
      objective: '(몇)+(몇)=(십몇)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition'],
      textbookFocus: '앞의 수나 뒤의 수로 10을 만들고 남은 수를 더한다.',
      workbookFocus: '받아올림이 있는 한 자리 수끼리의 덧셈을 한다.',
    },
    {
      title: '여러 가지 덧셈을 해 볼까요',
      objective: '더해지는 수와 더하는 수가 달라질 때 합이 어떻게 달라지는지 알 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition'],
      textbookFocus: '더하는 수가 1씩 커지면 합도 1씩 커짐을 안다.',
      workbookFocus: '표에서 합이 같은 식을 찾는다.',
    },
    {
      title: '뺄셈을 알아볼까요',
      objective: '제거·비교 상황에서 (십몇)-(몇)을 자신의 방법으로 할 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['subtraction'],
      textbookFocus: '바둑돌로 덜어 내거나 짝지어 뺄셈을 한다.',
      workbookFocus: '뺄셈 상황을 뺄셈식으로 나타낸다.',
    },
    {
      title: '뺄셈을 해 볼까요',
      objective: '(십몇)-(몇)=(십), (십몇)-(몇)=(몇)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['subtraction'],
      textbookFocus: '빼는 수를 갈라 10을 만들어 빼거나, 10에서 먼저 빼고 남은 수를 더한다.',
      workbookFocus: '받아내림이 있는 (십몇)-(몇)을 한다.',
    },
    {
      title: '여러 가지 뺄셈을 해 볼까요',
      objective: '빼어지는 수와 빼는 수가 달라질 때 차가 어떻게 달라지는지 알 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['subtraction'],
      textbookFocus: '빼는 수가 1씩 커지면 차는 1씩 작아짐을 안다.',
      workbookFocus: '표에서 차가 같은 식을 찾는다.',
    },
  ]),
  // ── 5단원 규칙 찾기 (9차시 중 1~7차시) ────────────────────────────
  unit(5, '규칙 찾기', [
    {
      title: '단원 도입',
      objective: '생활에서 되풀이되는 규칙을 찾을 수 있다.',
      achievement: 규칙찾기성취,
      tags: ['pattern'],
      textbookFocus: '실생활에서 일정하게 반복되는 규칙을 찾는다.',
      workbookFocus: '되풀이되는 부분을 찾는다.',
    },
    {
      title: '규칙을 찾아볼까요',
      objective: '물체나 무늬의 배열에서 규칙을 찾아 설명할 수 있다.',
      achievement: 규칙찾기성취,
      tags: ['pattern'],
      textbookFocus: '물체나 무늬의 배열에서 되풀이되는 부분을 찾아 다음에 올 것을 말한다.',
      workbookFocus: '규칙에 따라 다음에 올 것을 그린다.',
    },
    {
      title: '규칙을 만들어 볼까요 ⑴',
      objective: '구체물로 규칙을 만들고 설명할 수 있다.',
      achievement: 규칙만들기성취,
      tags: ['pattern'],
      textbookFocus: '연결 모형, 바둑돌로 규칙을 만든다.',
      workbookFocus: '친구가 만든 규칙을 말한다.',
    },
    {
      title: '규칙을 만들어 볼까요 ⑵',
      objective: '무늬를 배열하여 규칙을 만들고 설명할 수 있다.',
      achievement: 규칙만들기성취,
      tags: ['pattern'],
      textbookFocus: '두 가지 이상의 색이나 모양으로 무늬를 만든다.',
      workbookFocus: '규칙에 맞게 빈칸을 색칠한다.',
    },
    {
      title: '수 배열에서 규칙을 찾아볼까요',
      objective: '수 배열에서 규칙을 찾아 수로 나타낼 수 있다.',
      achievement: 규칙찾기성취,
      tags: ['pattern'],
      textbookFocus: '몇씩 커지거나 작아지는지 찾고 빈칸의 수를 구한다.',
      workbookFocus: '자신이 만든 규칙으로 수를 늘어놓는다.',
    },
    {
      title: '수 배열표에서 규칙을 찾아볼까요',
      objective: '1부터 100까지의 수 배열표에서 규칙을 찾을 수 있다.',
      achievement: 규칙찾기성취,
      tags: ['pattern'],
      textbookFocus: '오른쪽으로 갈수록 1씩, 아래로 갈수록 10씩 커지는 규칙을 찾는다.',
      workbookFocus: '규칙에 따라 수 배열표에 색칠한다.',
    },
    {
      title: '규칙을 여러 가지 방법으로 나타내 볼까요',
      objective: '찾은 규칙을 말, 그림, 기호, 수로 나타낼 수 있다.',
      achievement: 규칙찾기성취,
      tags: ['pattern'],
      textbookFocus: '물체나 무늬의 규칙을 ○△나 1, 2와 같은 기호와 수로 나타낸다.',
      workbookFocus: '같은 규칙을 다른 방법으로 나타낸 것을 찾는다.',
    },
  ]),
  // ── 6단원 덧셈과 뺄셈(3) (9차시 중 1~7차시) ───────────────────────
  unit(6, '덧셈과 뺄셈(3)', [
    {
      title: '단원 도입',
      objective: '(몇)+(몇)=(십몇), (십몇)-(몇)=(몇)을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '전통 놀이 장면에서 덧셈과 뺄셈을 한다.',
      workbookFocus: '앞 단원의 덧셈과 뺄셈을 떠올린다.',
    },
    {
      title: '덧셈을 알아볼까요',
      objective: '받아올림이 없는 두 자리 수의 덧셈을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition'],
      textbookFocus: '(몇십)+(몇), (몇십)+(몇십), (몇십몇)+(몇십몇)을 10개씩 묶음끼리, 낱개끼리 더한다.',
      workbookFocus: '받아올림이 없는 덧셈을 여러 가지 방법으로 계산한다.',
    },
    {
      title: '뺄셈을 알아볼까요',
      objective: '받아내림이 없는 두 자리 수의 뺄셈을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['subtraction'],
      textbookFocus: '(몇십)-(몇십), (몇십몇)-(몇), (몇십몇)-(몇십몇)을 10개씩 묶음끼리, 낱개끼리 뺀다.',
      workbookFocus: '받아내림이 없는 뺄셈을 여러 가지 방법으로 계산한다.',
    },
    {
      title: '덧셈과 뺄셈을 해 볼까요',
      objective: '덧셈 이야기와 뺄셈 이야기를 식으로 나타내고 계산할 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '그림을 보고 이야기를 만들어 덧셈식과 뺄셈식으로 나타낸다.',
      workbookFocus: '다양한 덧셈과 뺄셈을 한다.',
    },
  ]),
];

export const lessons12 = curriculum12.flatMap((unitEntry) => unitEntry.lessons);
