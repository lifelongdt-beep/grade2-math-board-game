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
//   · 2단원 나머지는 나누는 수보다 작아야 하고, 계산이 맞는지 '확인'할
//     때는 4×8=32, 32+3=35처럼 두 식으로 나누어 씁니다(혼합 계산은
//     5~6학년). '검산' 대신 '확인'이라고 씁니다. 나눗셈의 어림셈은
//     나누어지는 수를 나누는 수로 쉽게 나누어지는 수로 바꿉니다
//     (298÷3 → 300÷3, 477÷6 → 480÷6).
//   · 3단원 지도서 2~3차시 '원의 중심, 반지름, 지름은 무엇일까요'는 한
//     차시로 둡니다. 지름 고르기에는 원의 중심을 지나지 않는 선분을
//     꼭 넣습니다(지도서가 짚은 오개념).
//   · 4단원 이산량 분수는 묶음의 수로 나타냅니다. 9/12처럼 값이 같은
//     분수는 '틀린 답은 아니지만 묶음을 생각하지 않은 답'이므로 틀린
//     보기로 두지 않습니다. '크기가 같은 분수', '약분'은 5학년 말입니다.
//   · 5단원 "지나친 단위 환산은 다루지 않는다." L↔mL, kg↔g, t↔kg만
//     바꿉니다. 덧셈·뺄셈은 교과서처럼 받아올림·받아내림이 없는 것만
//     냅니다(3 L 500 mL+1 L 300 mL).
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
  if (unitTitle === '원') {
    // 컴퍼스를 벌린 길이를 자 그림으로 보이므로 ruler는 막지 않습니다.
    return { maxNumber: 100, representation: 'semi', forbidVisuals: forbidVisuals.filter((kind) => kind !== 'ruler') };
  }
  if (unitTitle === '나눗셈') {
    return { maxNumber: 1000, representation: lessonNo <= 3 ? 'semi' : 'symbolic', forbidVisuals };
  }
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
const 나눗셈성취 = '[4수01-06] 나누는 수가 한 자리 수인 나눗셈의 계산 원리를 이해하고 그 계산을 할 수 있으며, 나눗셈에서 몫과 나머지의 의미를 안다.';
const 원성취 = '[4수03-03] 원의 중심, 반지름, 지름을 이해하고, 그 성질을 탐구하고 설명할 수 있다.';
const 컴퍼스성취 = '[4수03-04] 컴퍼스를 이용하여 여러 가지 크기의 원을 그려서 다양한 모양을 꾸밀 수 있다.';
const 분수성취 = '[4수01-09] 양의 등분할을 통하여 분수의 필요성을 인식하고, 분수를 이해하고 읽고 쓸 수 있다.';
const 분수종류성취 = '[4수01-10] 단위분수, 진분수, 가분수, 대분수를 알고, 그 관계를 이해한다.';
const 분수비교성취 = '[4수01-11] 분모가 같은 분수끼리, 단위분수끼리 크기를 비교하고 그 방법을 설명할 수 있다.';
const 들이성취 = '[4수03-17] 실생활 문제 상황을 통하여 들이와 무게의 단위의 필요성을 인식하고, 1 L, 1 mL, 1 kg, 1 g, 1 t의 단위를 알며, 이를 이용하여 들이와 무게를 측정하고 어림할 수 있다.';
const 들이관계성취 = '[4수03-18] 1 L와 1 mL, 1 kg과 1 g, 1 t과 1 kg의 관계를 이해하고, 들이와 무게를 단명수와 복명수로 표현할 수 있다.';
const 들이계산성취 = '[4수03-19] 들이와 무게의 덧셈과 뺄셈을 할 수 있다.';
const 그래프성취 = '[4수04-01] 탐구 문제를 설정하고, 그에 맞는 자료를 수집하여 그림그래프로 나타내고 해석할 수 있다.';
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
  // ── 2단원 나눗셈 (지도서 13차시 중 1~10차시) ──────────────────────
  unit(2, '나눗셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '생활 속에서 똑같이 나누어야 하는 상황을 살펴본다.',
      workbookFocus: '56÷7, 24÷4처럼 곱셈구구로 몫을 구하던 것을 떠올린다.',
    },
    {
      title: '내림이 없는 (몇십)÷(몇)을 어떻게 계산할까요',
      objective: '내림이 없는 (몇십)÷(몇)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '6÷3=2를 이용하여 60÷3=20을 구한다.',
      workbookFocus: '십 모형이 몇 개씩인지 생각하여 몫을 구한다.',
    },
    {
      title: '내림이 없는 (몇십몇)÷(몇)을 어떻게 계산할까요',
      objective: '내림이 없는 (몇십몇)÷(몇)의 계산 원리를 이해하고 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '24÷2를 20÷2와 4÷2로 나누어 계산한다.',
      workbookFocus: '세로 셈으로 십의 자리부터 나눈다.',
    },
    {
      title: '내림이 있는 (두 자리 수)÷(한 자리 수)를 어떻게 계산할까요',
      objective: '내림이 있는 (두 자리 수)÷(한 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '52÷4를 40÷4와 12÷4로 나누어 13을 구한다.',
      workbookFocus: '십의 자리에서 남은 수를 일의 자리로 내려 함께 나눈다.',
    },
    {
      title: '내림이 없고 나머지가 있는 (두 자리 수)÷(한 자리 수)를 어떻게 계산할까요',
      objective: '나머지의 뜻을 알고 내림이 없고 나머지가 있는 (두 자리 수)÷(한 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '29÷8=3 … 5에서 5를 나머지라고 한다.',
      workbookFocus: '나머지는 나누는 수보다 작아야 한다.',
    },
    {
      title: '내림이 있고 나머지가 있는 (두 자리 수)÷(한 자리 수)를 어떻게 계산할까요',
      objective: '내림이 있고 나머지가 있는 (두 자리 수)÷(한 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '64÷5=12 … 4를 계산한다.',
      workbookFocus: '몫을 어림하고 계산 결과와 비교한다.',
    },
    {
      title: '나눗셈의 계산이 맞는지 어떻게 확인할 수 있을까요',
      objective: '나눗셈의 계산이 맞는지 확인할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '35÷4=8 … 3을 4×8=32, 32+3=35로 확인한다.',
      workbookFocus: '53÷4=12 … 3이 맞는지 확인하고 바르게 계산한다.',
    },
    {
      title: '나머지가 없는 (세 자리 수)÷(한 자리 수)를 어떻게 계산할까요',
      objective: '나머지가 없는 (세 자리 수)÷(한 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '360÷3, 536÷4를 백의 자리부터 나누어 계산한다.',
      workbookFocus: '834 cm인 끈을 6 cm씩 자르는 문제를 해결한다.',
    },
    {
      title: '나머지가 있는 (세 자리 수)÷(한 자리 수)를 어떻게 계산할까요',
      objective: '나머지가 있는 (세 자리 수)÷(한 자리 수)를 계산할 수 있다.',
      achievement: 나눗셈성취,
      tags: ['division'],
      textbookFocus: '417÷4=104 … 1, 659÷8=82 … 3을 계산한다.',
      workbookFocus: '백의 자리에서 나눌 수 없으면 십의 자리까지 함께 나눈다.',
    },
    {
      title: '나눗셈의 어림셈을 어떻게 할까요',
      objective: '나눗셈의 몫을 어림할 수 있다.',
      achievement: 어림성취,
      tags: ['estimate', 'division'],
      textbookFocus: '298÷3을 300÷3으로 어림하여 약 100을 구한다.',
      workbookFocus: '477÷6의 몫이 83이 맞는지 480÷6=80으로 판단한다.',
    },
  ]),
  // ── 3단원 원 (지도서 9차시 중 1~5차시, 2~3차시는 한 차시) ─────────
  unit(3, '원', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 원성취,
      tags: ['shape'],
      textbookFocus: '운동장에 원을 그리는 방법을 생각해 본다.',
      workbookFocus: '원 모양의 특징(곧은 선과 뾰족한 곳이 없음)을 떠올린다.',
    },
    {
      title: '원의 중심, 반지름, 지름은 무엇일까요',
      objective: '원의 중심, 반지름, 지름을 알 수 있다.',
      achievement: 원성취,
      tags: ['shape'],
      textbookFocus: '누름 못과 띠 종이로 원을 그리며 원의 중심과 반지름을 안다.',
      workbookFocus: '한 원에서 원의 중심은 한 개이고, 반지름과 지름은 셀 수 없이 많이 그을 수 있다.',
    },
    {
      title: '원에는 어떤 성질이 있을까요',
      objective: '원의 지름과 반지름의 성질과 관계를 알 수 있다.',
      achievement: 원성취,
      tags: ['shape'],
      textbookFocus: '지름은 원을 똑같이 둘로 나누고, 원 위의 두 점을 이은 선분 중 가장 길다.',
      workbookFocus: '한 원에서 지름은 반지름의 2배이다.',
    },
    {
      title: '컴퍼스를 이용하여 원을 어떻게 그릴까요',
      objective: '컴퍼스를 이용하여 여러 가지 크기의 원을 그릴 수 있다.',
      achievement: 컴퍼스성취,
      tags: ['shape'],
      textbookFocus: '원의 중심을 정하고, 컴퍼스를 반지름만큼 벌린 다음, 침을 꽂고 돌려 원을 그린다.',
      workbookFocus: '컴퍼스만 이용하여 주어진 원과 크기가 같은 원을 그린다.',
    },
  ]),
  // ── 4단원 분수 (지도서 10차시 중 1~7차시) ─────────────────────────
  unit(4, '분수', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '전체의 분수만큼이 얼마인지 궁금해 하는 상황을 살펴본다.',
      workbookFocus: '3학년 1학기에 배운 분수와 단위분수의 크기 비교를 떠올린다.',
    },
    {
      title: '분수로 어떻게 나타낼까요',
      objective: '이산량에서 부분이 전체의 얼마인지 분수로 나타낼 수 있다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '종이꽃 6송이를 똑같이 2묶음으로 나누면 1묶음은 전체의 1/2이다.',
      workbookFocus: '12를 3씩 묶으면 9는 12의 3/4이다.',
    },
    {
      title: '전체 개수의 분수만큼은 얼마인지 어떻게 알까요',
      objective: '이산량에서 전체의 분수만큼은 얼마인지 구할 수 있다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '8의 1/2은 4, 6의 2/3는 4임을 묶음으로 알아본다.',
      workbookFocus: '붕어빵 16개의 3/4만큼이 몇 개인지 구한다.',
    },
    {
      title: '전체 길이의 분수만큼은 얼마인지 어떻게 알까요',
      objective: '길이에서 전체의 분수만큼은 얼마인지 구할 수 있다.',
      achievement: 분수성취,
      tags: ['fraction'],
      textbookFocus: '15 cm의 2/5는 15 cm를 똑같이 5부분으로 나눈 것 중의 2부분인 6 cm이다.',
      workbookFocus: '16 cm의 3/8은 2 cm의 3배인 6 cm이다.',
    },
    {
      title: '진분수와 가분수는 무엇일까요',
      objective: '진분수, 가분수, 자연수를 알 수 있다.',
      achievement: 분수종류성취,
      tags: ['fraction'],
      textbookFocus: '분자가 분모보다 작은 분수를 진분수, 분자가 분모와 같거나 분모보다 큰 분수를 가분수라고 한다.',
      workbookFocus: '4/4는 자연수 1과 같고 가분수이다.',
    },
    {
      title: '대분수는 무엇일까요',
      objective: '대분수를 알고, 대분수를 가분수로, 가분수를 대분수로 나타낼 수 있다.',
      achievement: 분수종류성취,
      tags: ['fraction'],
      textbookFocus: '2와 1/5은 1/5이 11개이므로 11/5이다.',
      workbookFocus: '8/3에서 6/3만큼을 자연수 2로 나타내면 2와 2/3이다.',
    },
    {
      title: '분모가 같은 분수의 크기를 어떻게 비교할까요',
      objective: '분모가 같은 가분수, 대분수의 크기를 비교할 수 있다.',
      achievement: 분수비교성취,
      tags: ['fraction'],
      textbookFocus: '1과 6/7과 2와 3/7은 자연수부터 비교한다.',
      workbookFocus: '10/6과 1과 5/6은 한 가지 꼴로 바꾸어 비교한다.',
    },
  ]),
  // ── 5단원 들이와 무게 (지도서 12차시 중 1~9차시) ─────────────────
  unit(5, '들이와 무게', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 들이성취,
      tags: ['measurement'],
      textbookFocus: '전통 시장에서 mL와 g이 쓰인 상황을 살펴본다.',
      workbookFocus: '‘더 많다, 더 무겁다’ 같은 비교하는 말을 떠올린다.',
    },
    {
      title: '들이를 어떻게 비교할까요',
      objective: '여러 가지 방법으로 들이를 비교할 수 있다.',
      achievement: 들이성취,
      tags: ['measurement'],
      textbookFocus: '옮겨 담거나 같은 컵으로 몇 번 붓는지 세어 들이를 비교한다.',
      workbookFocus: '임의 단위로 재면 불편한 점을 알고 표준 단위가 필요함을 안다.',
    },
    {
      title: '들이의 단위는 무엇일까요',
      objective: 'L와 mL를 알고 1 L=1000 mL의 관계를 이해할 수 있다.',
      achievement: 들이관계성취,
      tags: ['measurement'],
      textbookFocus: '1 L 200 mL는 1200 mL이다.',
      workbookFocus: '1800 mL를 1 L 800 mL로 나타낸다.',
    },
    {
      title: '들이를 어떻게 어림하고 잴까요',
      objective: '들이를 어림하고 잴 수 있다.',
      achievement: 들이성취,
      tags: ['measurement'],
      textbookFocus: '식용유의 들이를 약 2 L로 어림한다.',
      workbookFocus: '들이에 알맞은 단위(L, mL)를 고른다.',
    },
    {
      title: '들이의 덧셈과 뺄셈을 어떻게 할까요',
      objective: '들이의 덧셈과 뺄셈을 할 수 있다.',
      achievement: 들이계산성취,
      tags: ['measurement'],
      textbookFocus: '3 L 500 mL+1 L 300 mL=4 L 800 mL',
      workbookFocus: 'L는 L끼리, mL는 mL끼리 계산한다.',
    },
    {
      title: '무게를 어떻게 비교할까요',
      objective: '여러 가지 방법으로 무게를 비교할 수 있다.',
      achievement: 들이성취,
      tags: ['measurement'],
      textbookFocus: '양팔저울과 바둑돌로 무게를 비교한다.',
      workbookFocus: '큰 물건이 늘 무거운 것은 아님을 안다.',
    },
    {
      title: '무게의 단위는 무엇일까요',
      objective: 'kg, g, t을 알고 단위 사이의 관계를 이해할 수 있다.',
      achievement: 들이관계성취,
      tags: ['measurement'],
      textbookFocus: '1 kg 500 g=1500 g, 1 t=1000 kg',
      workbookFocus: '무게에 알맞은 단위(t, kg, g)를 안다.',
    },
    {
      title: '무게를 어떻게 어림하고 잴까요',
      objective: '무게를 어림하고 잴 수 있다.',
      achievement: 들이성취,
      tags: ['measurement'],
      textbookFocus: '고구마 1개의 무게를 약 250 g으로 어림한다.',
      workbookFocus: '어림한 값과 잰 값을 비교한다.',
    },
    {
      title: '무게의 덧셈과 뺄셈을 어떻게 할까요',
      objective: '무게의 덧셈과 뺄셈을 할 수 있다.',
      achievement: 들이계산성취,
      tags: ['measurement'],
      textbookFocus: '3 kg 300 g+4 kg 100 g=7 kg 400 g',
      workbookFocus: 'kg은 kg끼리, g은 g끼리 계산한다.',
    },
  ]),
  // ── 6단원 그림그래프 (지도서 9차시 중 1~6차시, 5~6차시는 한 차시) ──
  unit(6, '그림그래프', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '2학년에 배운 표와 그래프를 떠올린다.',
      workbookFocus: '표에서 합계와 가장 많은 항목을 찾는다.',
    },
    {
      title: '그림그래프는 무엇일까요',
      objective: '그림그래프를 알고 표와 비교하여 편리한 점을 설명할 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '큰 그림과 작은 그림이 나타내는 수를 알고 그림그래프를 읽는다.',
      workbookFocus: '그림이 길게 그려진 줄이 가장 많은 것은 아님을 안다.',
    },
    {
      title: '그림그래프로 어떻게 나타낼까요',
      objective: '표를 보고 그림그래프로 나타낼 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '그림은 두 가지로 하고, 자료에 맞게 10과 1 또는 100과 10으로 단위를 정한다.',
      workbookFocus: '큰 단위의 그림을 먼저, 크게 그린다.',
    },
    {
      title: '그림그래프를 어떻게 해석할까요',
      objective: '그림그래프를 보고 여러 가지 내용을 알 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '가장 많은 것과 적은 것, 두 항목의 차이를 알아본다.',
      workbookFocus: '합계를 이용하여 모르는 항목의 수를 구한다.',
    },
    {
      title: '어떻게 자료를 수집하여 그림그래프로 나타낼까요',
      objective: '자료를 수집하여 표와 그림그래프로 나타낼 수 있다.',
      achievement: 그래프성취,
      tags: ['data'],
      textbookFocus: '조사한 자료를 빠뜨리거나 두 번 세지 않게 표로 정리한다.',
      workbookFocus: '정리한 표를 그림그래프로 나타내고 해석한다.',
    },
  ]),
];

export const lessons32 = curriculum32.flatMap((unitEntry) => unitEntry.lessons);
