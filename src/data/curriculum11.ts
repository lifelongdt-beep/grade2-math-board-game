import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 1학년 1학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명·학습 목표·성취기준은 동아출판 초등 수학 1-1 교사용 지도서
// (2022 개정 교육과정) 각론의 '단원의 전개 계획'을 그대로 따랐습니다.
//
// 3학년과 같은 약속을 지킵니다.
//   · 단원 끝의 '수학이랑 확인해요'(단원 평가), '수학이랑 만들어요'
//     (프로젝트), 학기 끝의 '수학이랑 함께해요'는 문항을 만들 차시가
//     아니므로 넣지 않습니다. 복습은 앱의 '단원 종합', '학기 종합'을 씁니다.
//   · 지도서가 한 주제에 두 차시를 주는 곳(2~3, 4~5, 6~7, 9~10)은 한
//     차시로 둡니다.
//
// 지도서가 못박아 둔 것 가운데 문항에 그대로 영향을 주는 것:
//   · 1학년 아이는 한글을 막 배우는 중입니다. 지도서: "1학년 학생들의
//     한글 학습 정도를 고려하여 수를 ‘하나’, ‘둘’과 같이 한글로 쓰게
//     하지 않으며" 소리 내어 읽는 활동을 앞세웁니다. 그래서 문항은 짧은
//     문장으로 쓰고, 셀 것은 그림으로 그려 줍니다. 수 이름을 묻는 문항은
//     고르기만 하게 합니다.
//   · 1단원 수 읽기는 우리말(하나, 둘)과 한자어(일, 이) 둘 다 다룹니다.
//     "개수나 횟수에는 우리말, 차례·번호에는 한자어"입니다. '일곱 세'나
//     '칠 살'처럼 섞어 읽지 않습니다.
//   · 1단원 '집합수, 순서수' 같은 용어를 쓰지 않습니다. 크기는 '크다,
//     작다'로 말합니다(개수는 '많다, 적다').
//   · 2단원 모양은 그림(상자·둥근기둥·공 모양)으로만 보입니다. 지도서:
//     "모양을 가리키는 수학적 용어를 사용하지 않고" — 직육면체, 원기둥,
//     구라는 말을 쓰지 않습니다. 특징은 '평평한 부분, 뾰족한 부분, 둥근
//     부분', '잘 쌓을 수 있다, 잘 굴러간다'로 말합니다.
//   · 3단원 덧셈과 뺄셈은 한 자리 수의 범위입니다. 합이 9 이하, 9 이하의
//     수에서 뺍니다. 모으기·가르기도 9 이하입니다. 10을 넘는 덧셈은
//     1-2에서 배웁니다. 첨가·합병(덧셈), 제거·비교(뺄셈) 상황을 모두
//     다룹니다.
//   · 4단원 비교하기는 "임의 단위나 표준 단위를 사용하지 않음에 유의하여"
//     직관적 비교와 직접 비교만 합니다. 수나 cm가 나오지 않습니다. 결과는
//     '길다/짧다, 무겁다/가볍다, 넓다/좁다, 많다/적다'로 말하고, 셋을
//     견줄 때는 '가장'을 씁니다.
//   · 5단원은 50까지의 수입니다. 모으기·가르기는 19 이하의 수에서
//     합니다(지도서 확인 차시). 10은 '십, 열'로 읽습니다.
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

// 1학년 문항은 차시마다 자기 수를 직접 고르므로(grade11 폴더) maxNumber가
// 문항을 자르는 일은 없습니다. 단원 종합·학기 종합에서 읽으므로 비워
// 두지 않습니다.
const scopeFor = (unitTitle: string): LessonScope => {
  // 2학년 이상 그림이 섞이지 않게 막아 둡니다.
  const forbidVisuals = ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern', 'grid-table'];
  if (unitTitle === '50까지의 수') return { maxNumber: 50, representation: 'concrete', forbidVisuals };
  return { maxNumber: 9, representation: 'concrete', forbidVisuals };
};

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '1-1';
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

const 수성취 = '[2수01-01] 수의 필요성을 인식하면서 0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.';
const 계열성취 = '[2수01-03] 수의 계열을 이해하고, 수의 크기를 비교할 수 있다.';
const 모가성취 = '[2수01-04] 하나의 수를 두 수로 분해하고 두 수를 하나의 수로 합성하는 활동을 통하여 수 감각을 기른다.';
const 덧뺄의미성취 = '[2수01-05] 덧셈과 뺄셈이 이루어지는 실생활 상황과 연결하여 덧셈과 뺄셈의 의미를 이해한다.';
const 덧뺄계산성취 = '[2수01-06] 두 자리 수의 범위에서 덧셈과 뺄셈의 계산 원리를 이해하고 그 계산을 할 수 있다.';
const 모양성취 = '[2수03-01] 교실 및 생활 주변에서 여러 가지 물건을 관찰하여 직육면체, 원기둥, 구의 모양을 찾고, 그것들을 이용하여 여러 가지 모양을 만들 수 있다.';
const 비교성취 = '[2수03-06] 구체물의 길이, 들이, 무게, 넓이를 비교하여 각각 ‘길다, 짧다’, ‘많다, 적다’, ‘무겁다, 가볍다’, ‘넓다, 좁다’ 등을 구별하여 말할 수 있다.';

export const curriculum11: Unit[] = [
  // ── 1단원 9까지의 수 (지도서 12차시 중 1~10차시) ─────────────────
  unit(1, '9까지의 수', [
    {
      title: '단원 도입',
      objective: '생활 속에서 수 세기가 필요한 상황을 알 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '학교 가는 장면에서 무엇을 세고 싶은지 이야기한다.',
      workbookFocus: '그림 속 물건을 하나씩 짚으며 세어 본다.',
    },
    {
      title: '1, 2, 3, 4, 5를 알아볼까요',
      objective: '1부터 5까지의 수를 세고 읽고 쓸 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '학교 준비물을 세어 1부터 5까지의 수로 나타내고 하나, 둘 / 일, 이로 읽는다.',
      workbookFocus: '물건의 수만큼 ○를 그리고 수를 쓴다.',
    },
    {
      title: '6, 7, 8, 9를 알아볼까요',
      objective: '6부터 9까지의 수를 세고 읽고 쓸 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '학교 가는 길의 물건을 세어 6부터 9까지의 수로 나타내고 연결 모형으로 나타낸다.',
      workbookFocus: '수만큼 색칠하고 여섯, 육처럼 두 가지로 읽는다.',
    },
    {
      title: '순서를 알아볼까요',
      objective: '첫째부터 아홉째까지 순서를 알고 말할 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '복도에 줄을 선 상황에서 몇째인지 말하고 왼쪽, 오른쪽에서 순서를 센다.',
      workbookFocus: '몇째와 몇 개를 구별하여 색칠한다.',
    },
    {
      title: '수의 순서를 알아볼까요',
      objective: '1부터 9까지 수의 순서를 알 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '수를 순서대로 따라가고 수 카드를 순서대로 놓는다.',
      workbookFocus: '빈칸에 알맞은 수를 쓰고 9부터 거꾸로 센다.',
    },
    {
      title: '1만큼 더 큰 수와 1만큼 더 작은 수를 알아볼까요',
      objective: '1만큼 더 큰 수와 1만큼 더 작은 수를 알 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '딱지치기 상황과 연결 모형으로 1만큼 더 큰 수, 1만큼 더 작은 수를 안다.',
      workbookFocus: '수의 순서에서 바로 뒤의 수, 바로 앞의 수를 찾는다.',
    },
    {
      title: '0을 알아볼까요',
      objective: '아무것도 없는 것을 0으로 나타내고 읽고 쓸 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '학용품이 하나도 없는 것을 0으로 나타내고 영이라고 읽는다.',
      workbookFocus: '하나씩 덜어 내며 남은 수를 쓰고 1보다 1만큼 더 작은 수가 0임을 안다.',
    },
    {
      title: '수의 크기를 비교해 볼까요',
      objective: '9까지의 두 수의 크기를 비교할 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '고리의 수를 하나씩 짝지어 비교하고 ‘많다, 적다’, ‘크다, 작다’로 말한다.',
      workbookFocus: '두 수 중 더 큰 수, 더 작은 수를 찾는다.',
    },
  ]),
  // ── 2단원 여러 가지 모양 (지도서 7차시 중 1~5차시) ────────────────
  unit(2, '여러 가지 모양', [
    {
      title: '단원 도입',
      objective: '교실에서 여러 가지 모양을 찾아볼 수 있다.',
      achievement: 모양성취,
      tags: ['solid'],
      textbookFocus: '교실 그림에서 서로 다른 곳을 찾고 상자·둥근기둥·공 모양의 물건을 찾는다.',
      workbookFocus: '물건을 보고 같은 모양끼리 짝짓는다.',
    },
    {
      title: '여러 가지 모양을 찾아볼까요',
      objective: '생활 주변에서 상자, 둥근기둥, 공 모양을 찾고 분류할 수 있다.',
      achievement: 모양성취,
      tags: ['solid'],
      textbookFocus: '여러 가지 물건을 모양에 따라 나누고 같은 모양끼리 모은다.',
      workbookFocus: '주어진 모양과 같은 모양의 물건을 찾는다.',
    },
    {
      title: '여러 가지 모양을 알아볼까요',
      objective: '상자, 둥근기둥, 공 모양의 특징을 알 수 있다.',
      achievement: 모양성취,
      tags: ['solid'],
      textbookFocus: '상자 속 물건의 일부를 보고 모양을 맞히고, 쌓고 굴려 보며 특징을 말한다.',
      workbookFocus: '평평한 부분, 뾰족한 부분, 둥근 부분과 잘 쌓이는지, 잘 굴러가는지를 말한다.',
    },
    {
      title: '여러 가지 모양으로 만들어 볼까요',
      objective: '여러 가지 모양으로 놀이 기구를 만들 수 있다.',
      achievement: 모양성취,
      tags: ['solid'],
      textbookFocus: '놀이터에서 모양을 찾고 여러 가지 모양으로 놀이 기구를 만든다.',
      workbookFocus: '만든 모양에 쓰인 모양의 수를 센다.',
    },
    {
      title: '모양 찾기 놀이를 해 볼까요',
      objective: '설명을 듣고 알맞은 모양을 찾을 수 있다.',
      achievement: 모양성취,
      tags: ['solid'],
      textbookFocus: '친구가 말하는 특징을 듣고 어떤 모양인지 맞힌다.',
      workbookFocus: '특징에 맞는 모양을 고른다.',
    },
  ]),
  // ── 3단원 덧셈과 뺄셈 (지도서 14차시 중 1~12차시) ─────────────────
  unit(3, '덧셈과 뺄셈', [
    {
      title: '단원 도입',
      objective: '모두 몇인지 세고 두 수를 비교할 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['number'],
      textbookFocus: '자연과 함께하는 활동에서 모두 세기와 수 비교를 한다.',
      workbookFocus: '두 무리를 모두 세어 본다.',
    },
    {
      title: '모으기와 가르기를 해 볼까요 ⑴',
      objective: '그림을 보고 9까지의 수를 모으고 가를 수 있다.',
      achievement: 모가성취,
      tags: ['number'],
      textbookFocus: '실생활에서 모으기와 가르기가 필요한 상황을 이해한다.',
      workbookFocus: '두 무리를 모으면 몇인지, 한 무리를 둘로 가르면 몇과 몇인지 쓴다.',
    },
    {
      title: '모으기와 가르기를 해 볼까요 ⑵',
      objective: '구체물로 9까지의 수를 여러 가지로 모으고 가를 수 있다.',
      achievement: 모가성취,
      tags: ['number'],
      textbookFocus: '연결 모형, 바둑돌로 9까지의 수를 모으고 가른다.',
      workbookFocus: '한 수를 여러 가지 방법으로 가른다.',
    },
    {
      title: '이야기를 만들어 볼까요',
      objective: '그림을 보고 모으기, 더하기, 빼기 이야기를 만들 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '그림을 보고 ‘모두 몇’, ‘남은 것은 몇’ 이야기를 만든다.',
      workbookFocus: '그림에 맞는 이야기를 고른다.',
    },
    {
      title: '덧셈을 알아볼까요',
      objective: '첨가와 합병 상황에서 덧셈의 뜻을 알고 덧셈식을 쓰고 읽을 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['addition'],
      textbookFocus: '나비 2마리와 3마리를 2+3=5로 쓰고 ‘2 더하기 3은 5와 같습니다’, ‘2와 3의 합은 5입니다’로 읽는다.',
      workbookFocus: '그림을 보고 덧셈식을 쓴다.',
    },
    {
      title: '덧셈을 해 볼까요',
      objective: '여러 가지 방법으로 한 자리 수의 덧셈을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition'],
      textbookFocus: '모으기, 이어 세기, 십 배열판으로 덧셈을 하고 두 수를 바꾸어 더해도 합이 같음을 안다.',
      workbookFocus: '합이 9 이하인 덧셈을 한다.',
    },
    {
      title: '뺄셈을 알아볼까요',
      objective: '제거와 비교 상황에서 뺄셈의 뜻을 알고 뺄셈식을 쓰고 읽을 수 있다.',
      achievement: 덧뺄의미성취,
      tags: ['subtraction'],
      textbookFocus: '5-2=3을 ‘5 빼기 2는 3과 같습니다’, ‘5와 2의 차는 3입니다’로 읽는다.',
      workbookFocus: '그림을 보고 뺄셈식을 쓴다.',
    },
    {
      title: '뺄셈을 해 볼까요',
      objective: '여러 가지 방법으로 한 자리 수의 뺄셈을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['subtraction'],
      textbookFocus: '가르기, 거꾸로 세기, 하나씩 짝짓기로 뺄셈을 한다.',
      workbookFocus: '9 이하의 수에서 뺄셈을 한다.',
    },
    {
      title: '0이 있는 덧셈과 뺄셈을 해 볼까요',
      objective: '0을 더하거나 빼는 계산, 전체를 빼는 계산을 할 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '0에 어떤 수를 더하거나 어떤 수에 0을 더하고, 어떤 수에서 0이나 그 수 전체를 뺀다.',
      workbookFocus: '0이 있는 덧셈식과 뺄셈식을 계산한다.',
    },
    {
      title: '덧셈과 뺄셈을 해 볼까요',
      objective: '고른 수가 계산 결과가 되는 덧셈식과 뺄셈식을 여러 가지로 만들 수 있다.',
      achievement: 덧뺄계산성취,
      tags: ['addition', 'subtraction'],
      textbookFocus: '계산한 값이 내가 고른 수가 되는 덧셈식, 뺄셈식을 만든다.',
      workbookFocus: '같은 값이 되는 식을 찾는다.',
    },
  ]),
  // ── 4단원 비교하기 (지도서 7차시 중 1~5차시) ─────────────────────
  unit(4, '비교하기', [
    {
      title: '단원 도입',
      objective: '생활에서 비교하기가 필요한 상황을 알 수 있다.',
      achievement: 비교성취,
      tags: ['measurement'],
      textbookFocus: '실생활 장면에서 무엇을 비교할 수 있는지 이야기한다.',
      workbookFocus: '두 물건 중 더 큰 것을 고른다.',
    },
    {
      title: '어느 것이 더 길까요',
      objective: '두 물건, 세 물건의 길이를 비교하여 말할 수 있다.',
      achievement: 비교성취,
      tags: ['measurement'],
      textbookFocus: '한쪽 끝을 맞추어 길이를 직접 비교하고 ‘더 길다, 더 짧다, 가장 길다’로 말한다.',
      workbookFocus: '키는 ‘더 크다, 더 작다’, 높이는 ‘더 높다, 더 낮다’로 말한다.',
    },
    {
      title: '어느 것이 더 무거울까요',
      objective: '두 물건, 세 물건의 무게를 비교하여 말할 수 있다.',
      achievement: 비교성취,
      tags: ['measurement'],
      textbookFocus: '손으로 들어 보거나 시소에 올려 무게를 비교하고 ‘더 무겁다, 더 가볍다’로 말한다.',
      workbookFocus: '시소가 내려간 쪽이 더 무거운 것을 안다.',
    },
    {
      title: '어느 것이 더 넓을까요',
      objective: '두 물건, 세 물건의 넓이를 비교하여 말할 수 있다.',
      achievement: 비교성취,
      tags: ['measurement'],
      textbookFocus: '겹쳐 맞대어 넓이를 비교하고 ‘더 넓다, 더 좁다’로 말한다.',
      workbookFocus: '남는 부분이 있는 쪽이 더 넓은 것을 안다.',
    },
    {
      title: '어느 것에 더 많이 담을 수 있을까요',
      objective: '그릇에 담을 수 있는 양과 담긴 양을 비교하여 말할 수 있다.',
      achievement: 비교성취,
      tags: ['measurement'],
      textbookFocus: '그릇의 크기로 담을 수 있는 양을 비교하고 ‘더 많다, 더 적다’로 말한다.',
      workbookFocus: '같은 그릇에서는 물의 높이가 높을수록 담긴 양이 많다.',
    },
  ]),
  // ── 5단원 50까지의 수 (지도서 11차시 중 1~9차시) ─────────────────
  unit(5, '50까지의 수', [
    {
      title: '단원 도입',
      objective: '생활에서 9보다 큰 수가 필요한 상황을 알 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '건강한 여름 나기 장면에서 수를 센다.',
      workbookFocus: '9까지의 수를 떠올리고 세어 본다.',
    },
    {
      title: '9 다음 수를 알아볼까요',
      objective: '10을 알고 세고 읽고 쓸 수 있으며 10을 모으고 가를 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '9보다 1만큼 더 큰 수를 10이라 쓰고 십, 열이라고 읽는다. 10이 되는 두 수를 찾는다.',
      workbookFocus: '10을 여러 가지로 가르고 10 만들기를 한다.',
    },
    {
      title: '십몇을 알아볼까요',
      objective: '11부터 19까지의 수를 10개씩 묶음 1개와 낱개로 알 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '10개씩 묶음 1개와 낱개 몇 개를 십몇으로 쓰고 읽는다.',
      workbookFocus: '십몇의 크기를 비교한다.',
    },
    {
      title: '모으기와 가르기를 해 볼까요',
      objective: '19까지의 수를 모으고 가를 수 있다.',
      achievement: 모가성취,
      tags: ['number'],
      textbookFocus: '그림과 바둑돌로 십몇을 모으고 가른다.',
      workbookFocus: '모으기와 가르기를 수로 나타낸다.',
    },
    {
      title: '10개씩 묶어 세어 볼까요',
      objective: '10개씩 묶음의 수로 몇십을 알 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '20, 30, 40, 50을 10개씩 묶음으로 나타내고 이십(스물), 삼십(서른)처럼 읽는다.',
      workbookFocus: '몇십의 크기를 비교한다.',
    },
    {
      title: '50까지의 수를 세어 볼까요',
      objective: '50까지의 수를 10개씩 묶음과 낱개로 세고 읽고 쓸 수 있다.',
      achievement: 수성취,
      tags: ['number'],
      textbookFocus: '10개씩 묶음 몇 개와 낱개 몇 개를 몇십몇으로 쓰고 두 가지로 읽는다.',
      workbookFocus: '주변에서 50까지의 수를 찾는다.',
    },
    {
      title: '50까지 수의 순서를 알아볼까요',
      objective: '50까지 수의 순서를 알 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '1만큼 더 큰 수와 1만큼 더 작은 수를 생각하며 50까지 수를 순서대로 센다.',
      workbookFocus: '수 배열에서 빈칸의 수를 찾는다.',
    },
    {
      title: '수의 크기를 비교해 볼까요',
      objective: '50까지 수의 크기를 비교할 수 있다.',
      achievement: 계열성취,
      tags: ['number'],
      textbookFocus: '10개씩 묶음의 수를 먼저 비교하고 같으면 낱개의 수를 비교한다. 세 수를 비교한다.',
      workbookFocus: '가장 큰 수와 가장 작은 수를 찾는다.',
    },
  ]),
];

export const lessons11 = curriculum11.flatMap((unitEntry) => unitEntry.lessons);
