import type { ConceptTag, Lesson, LessonScope, Semester, Unit } from '../types';

// ════════════════════════════════════════════════════════════════════
// 5학년 1학기 차시
// ────────────────────────────────────────────────────────────────────
// 차시명·학습 목표·성취기준은 동아출판 초등 수학 5-1 교사용 지도서
// (2022 개정 교육과정) 각론의 각 차시 머리글과 '단원 학습 목표' 표를
// 그대로 따랐습니다.
//
// 지도서는 한 주제에 두 차시를 주기도 합니다 — 2단원 '약수와 배수는
// 무엇일까요'가 2~3차시, 6단원 '평행사변형의 넓이'가 7~8차시입니다.
// 그런 곳은 한 차시로 둡니다. 선생님이 고르는 것은 시간이 아니라
// 주제이고, 두 칸으로 나누면 같은 문제가 두 번 나옵니다. 지도서의
// 차시 번호는 아래 주석에 남겨 둡니다.
//
// 단원 끝의 '뚝딱! 해결해요'(단원 평가), '함께! 놀아요'(놀이),
// '곰곰! 생각해요'(프로젝트)는 문항을 만들 차시가 아니므로 넣지
// 않았습니다. 5-2와 같은 까닭입니다 — 복습은 앱의 '단원 종합',
// '학기 종합'을 씁니다.
//
// 지도서가 못박아 둔 것 가운데 문항에 그대로 영향을 주는 것:
//   · 1단원 "지나치게 복잡한 혼합 계산은 다루지 않는다." 그래서 식은
//     수 셋에서 넷까지만 쓰고, 괄호도 하나만 씁니다.
//   · 2단원 "최대공약수와 최소공배수는 … 평가에서 소인수의 곱으로
//     나타내어 구하는 방법은 다루지 않는다." 그래서 문항의 풀이는
//     약수·배수를 늘어놓아 찾는 방법과, 공약수로 나누어 구하는
//     방법만 씁니다. 소인수분해는 쓰지 않습니다.
//   · 3단원 "대응 관계를 식으로 나타내는 … 덧셈식, 뺄셈식, 곱셈식,
//     나눗셈식 중 하나로 표현되는 간단한 경우만 다룬다." 그래서
//     ○×2+1 같은 두 단계 식은 내지 않습니다.
//   · 4단원 "통분할 때는 공통분모로 최소공배수뿐만 아니라 분모의 곱과
//     같은 공배수도 이용하게 할 수 있다." 두 방법을 모두 씁니다.
//   · 6단원 "넓이 단위 사이의 관계 중 1 cm², 1 km² 사이의 단위
//     환산은 다루지 않는다." cm²↔m²와 m²↔km²만 묻습니다.
//   · 6단원 "삼각형의 넓이를 구할 때는 높이가 삼각형의 외부에 있는
//     것도 다룬다."
// ════════════════════════════════════════════════════════════════════

type LessonSeed = {
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
};

// 5-1 차시가 다루는 범위입니다.
//
// 5학년 문항은 차시마다 자기 수를 직접 고르므로(grade51 폴더)
// maxNumber가 문항을 자르는 일은 없습니다. 다만 단원 종합·학기 종합처럼
// 차시를 섞어 쓰는 곳에서 읽으므로 비워 두지 않습니다.
const scopeFor = (unitTitle: string, lessonNo: number): LessonScope => {
  // 2학년 그림은 5학년 차시에 붙을 일이 없습니다. 혹시라도 섞이지 않게
  // 2학년 전용 도구는 모두 막아 둡니다.
  const forbidVisuals = ['ruler', 'unit-measure', 'clock', 'calendar', 'year-calendar', 'cube-stack', 'cube-pattern'];

  if (unitTitle === '자연수의 혼합 계산') {
    return { maxNumber: 1000, representation: 'symbolic', forbidVisuals };
  }
  if (unitTitle === '약수와 배수') {
    return { maxNumber: 1000, representation: 'symbolic', forbidVisuals };
  }
  if (unitTitle === '대응 관계') {
    return { maxNumber: 1000, representation: lessonNo <= 3 ? 'semi' : 'symbolic', forbidVisuals };
  }
  if (unitTitle === '약분과 통분' || unitTitle === '분수의 덧셈과 뺄셈') {
    return { maxNumber: 1000, representation: lessonNo <= 3 ? 'semi' : 'symbolic', forbidVisuals };
  }
  // 넓이는 1 km²까지 갑니다.
  return { maxNumber: 1000000, representation: 'semi', forbidVisuals };
};

const unit = (unitNo: number, title: string, lessons: LessonSeed[]): Unit => {
  const semester: Semester = '5-1';
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

export const curriculum51: Unit[] = [
  // ── 1단원 자연수의 혼합 계산 (지도서 9차시) ──────────────────────
  // 2차시 덧뺄 · 3차시 곱나 · 4차시 덧뺄곱 · 5차시 덧뺄나 · 6차시 넷 다
  // ( )가 있는 식은 차시마다 활동 2에서 함께 다룹니다. 그래서 2차시부터
  // 괄호를 써도 됩니다 — 다만 그 차시가 배운 연산만 괄호 안에 넣습니다.
  unit(1, '자연수의 혼합 계산', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-01] 덧셈, 뺄셈, 곱셈, 나눗셈의 혼합 계산에서 계산하는 순서를 알고, 혼합 계산을 할 수 있다.',
      tags: ['mixedCalc'],
      textbookFocus: '생활 속에서 여러 연산이 한 식에 섞여 나오는 장면을 살펴본다.',
      workbookFocus: '세 자리 수의 덧셈과 뺄셈, 곱셈과 나눗셈 등 앞서 배운 계산을 떠올린다.',
    },
    {
      title: '덧셈과 뺄셈이 섞여 있는 식을 어떻게 계산할까요',
      objective: '덧셈과 뺄셈이 섞여 있는 식의 계산 순서를 이해하고 계산할 수 있다.',
      achievement: '[6수01-01] 덧셈과 뺄셈이 섞여 있는 식에서 계산하는 순서를 알고 계산한다.',
      tags: ['mixedCalc'],
      textbookFocus: '신청과 취소처럼 늘고 주는 일이 이어지는 상황을 하나의 식으로 나타낸다.',
      workbookFocus: '앞에서부터 차례대로 계산하고, ( )가 있으면 ( ) 안을 먼저 계산한다.',
    },
    {
      title: '곱셈과 나눗셈이 섞여 있는 식을 어떻게 계산할까요',
      objective: '곱셈과 나눗셈이 섞여 있는 식의 계산 순서를 이해하고 계산할 수 있다.',
      achievement: '[6수01-01] 곱셈과 나눗셈이 섞여 있는 식에서 계산하는 순서를 알고 계산한다.',
      tags: ['mixedCalc'],
      textbookFocus: '똑같이 나눈 뒤 몇 배 하는 상황을 하나의 식으로 나타낸다.',
      workbookFocus: '앞에서부터 차례대로 계산하고, ( )가 있으면 ( ) 안을 먼저 계산한다.',
    },
    {
      title: '덧셈, 뺄셈, 곱셈이 섞여 있는 식을 어떻게 계산할까요',
      objective: '덧셈, 뺄셈, 곱셈이 섞여 있는 식의 계산 순서를 이해하고 계산할 수 있다.',
      achievement: '[6수01-01] 덧셈, 뺄셈, 곱셈이 섞여 있는 식에서 계산하는 순서를 알고 계산한다.',
      tags: ['mixedCalc'],
      textbookFocus: '몇 개씩 나누어 준 뒤 더 만든 상황을 하나의 식으로 나타낸다.',
      workbookFocus: '곱셈을 먼저 계산하고, ( )가 있으면 ( ) 안을 가장 먼저 계산한다.',
    },
    {
      title: '덧셈, 뺄셈, 나눗셈이 섞여 있는 식을 어떻게 계산할까요',
      objective: '덧셈, 뺄셈, 나눗셈이 섞여 있는 식의 계산 순서를 이해하고 계산할 수 있다.',
      achievement: '[6수01-01] 덧셈, 뺄셈, 나눗셈이 섞여 있는 식에서 계산하는 순서를 알고 계산한다.',
      tags: ['mixedCalc'],
      textbookFocus: '똑같이 나누어 받은 뒤 얼마를 쓴 상황을 하나의 식으로 나타낸다.',
      workbookFocus: '나눗셈을 먼저 계산하고, ( )가 있으면 ( ) 안을 가장 먼저 계산한다.',
    },
    {
      title: '덧셈, 뺄셈, 곱셈, 나눗셈이 섞여 있는 식을 어떻게 계산할까요',
      objective: '덧셈, 뺄셈, 곱셈, 나눗셈이 섞여 있는 식의 계산 순서를 이해하고 계산할 수 있다.',
      achievement: '[6수01-01] 네 연산이 섞여 있는 식에서 계산하는 순서를 알고 계산한다.',
      tags: ['mixedCalc'],
      textbookFocus: '나누어 담고 나누어 주고 받는 여러 일을 하나의 식으로 나타낸다.',
      workbookFocus: '곱셈과 나눗셈을 먼저 계산하고, ( )가 있으면 ( ) 안을 가장 먼저 계산한다.',
    },
  ]),

  // ── 2단원 약수와 배수 (지도서 10차시) ────────────────────────────
  // 2~3차시 약수와 배수 · 4차시 공약수와 최대공약수 · 5차시 최대공약수
  // 구하기 · 6차시 공배수와 최소공배수 · 7차시 최소공배수 구하기
  unit(2, '약수와 배수', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-04] 약수, 공약수, 최대공약수를 이해하고 구할 수 있다.',
      tags: ['divisor'],
      textbookFocus: '모둠을 똑같이 나누는 장면에서 나누어떨어지는 수를 살펴본다.',
      workbookFocus: '곱셈과 나눗셈의 관계 등 앞서 배운 내용을 떠올린다.',
    },
    {
      title: '약수와 배수는 무엇일까요',
      objective: '약수와 배수의 뜻을 알고 구할 수 있으며, 약수와 배수의 관계를 이해한다.',
      achievement: '[6수01-04] 약수를 이해하고 구할 수 있다. [6수01-05] 배수를 이해하고 구할 수 있다.',
      tags: ['divisor'],
      textbookFocus: '모종을 화분에 남김없이 똑같이 나누어 심을 수 있는 경우를 모두 찾는다.',
      workbookFocus: '곱셈식 하나에서 약수와 배수를 함께 읽어 낸다.',
    },
    {
      title: '공약수와 최대공약수는 무엇일까요',
      objective: '공약수와 최대공약수의 뜻을 알고, 두 수의 공약수와 최대공약수를 구할 수 있다.',
      achievement: '[6수01-04] 공약수, 최대공약수를 이해하고 구할 수 있다.',
      tags: ['divisor'],
      textbookFocus: '두 수의 약수를 각각 늘어놓고 공통인 수를 찾는다.',
      workbookFocus: '공약수는 최대공약수의 약수임을 확인한다.',
    },
    {
      title: '최대공약수를 어떻게 구할까요',
      objective: '여러 가지 방법으로 두 수의 최대공약수를 구할 수 있다.',
      achievement: '[6수01-04] 두 수의 최대공약수를 여러 가지 방법으로 구한다.',
      tags: ['divisor'],
      textbookFocus: '약수를 늘어놓는 방법과 두 수를 공약수로 나누는 방법을 견준다.',
      workbookFocus: '두 수를 1이 아닌 공약수로 나누어 최대공약수를 구한다.',
    },
    {
      title: '공배수와 최소공배수는 무엇일까요',
      objective: '공배수와 최소공배수의 뜻을 알고, 두 수의 공배수와 최소공배수를 구할 수 있다.',
      achievement: '[6수01-05] 공배수, 최소공배수를 이해하고 구할 수 있다.',
      tags: ['divisor'],
      textbookFocus: '며칠마다 하는 두 가지 일이 같은 날 겹치는 때를 찾는다.',
      workbookFocus: '공배수는 최소공배수의 배수임을 확인한다.',
    },
    {
      title: '최소공배수를 어떻게 구할까요',
      objective: '여러 가지 방법으로 두 수의 최소공배수를 구할 수 있다.',
      achievement: '[6수01-05] 두 수의 최소공배수를 여러 가지 방법으로 구한다.',
      tags: ['divisor'],
      textbookFocus: '배수를 늘어놓는 방법과 두 수를 공약수로 나누는 방법을 견준다.',
      workbookFocus: '두 수를 1이 아닌 공약수로 나눈 뒤 남은 몫까지 곱한다.',
    },
  ]),

  // ── 3단원 대응 관계 (지도서 8차시) ───────────────────────────────
  // 2차시 두 양 사이의 관계 (1) · 3차시 (2) · 4차시 식으로 나타내기
  // 5차시 생활 속에서 찾아 식으로 나타내기
  unit(3, '대응 관계', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수02-01] 대응 관계를 나타낸 표에서 규칙을 찾아 설명하고, 식으로 나타낼 수 있다.',
      tags: ['correspondence'],
      textbookFocus: '수와 모양의 배열에서 규칙을 찾던 경험을 떠올린다.',
      workbookFocus: '수의 배열, 모양의 배열, 계산식의 배열에서 규칙을 찾아본다.',
    },
    {
      title: '두 양 사이에는 어떤 관계가 있을까요 (1)',
      objective: '서로 대응하는 두 양을 찾고, 두 양 사이의 대응 관계를 말로 표현할 수 있다.',
      achievement: '[6수02-01] 한 양이 변할 때 다른 양이 그에 따라 변하는 대응 관계를 찾아 설명한다.',
      tags: ['correspondence'],
      textbookFocus: '자전거의 수와 바퀴의 수처럼 몇 배가 되는 관계를 찾는다.',
      workbookFocus: '한 양이 1씩 늘 때 다른 양이 얼마씩 느는지 말로 설명한다.',
    },
    {
      title: '두 양 사이에는 어떤 관계가 있을까요 (2)',
      objective: '표를 이용하여 두 양 사이의 대응 관계를 찾고 설명할 수 있다.',
      achievement: '[6수02-01] 대응 관계를 나타낸 표에서 규칙을 찾아 설명한다.',
      tags: ['correspondence'],
      textbookFocus: '손수건의 수와 집게의 수처럼 얼마만큼 더 많은 관계를 표로 찾는다.',
      workbookFocus: '표의 빈칸을 채우고 두 양 사이의 관계를 말로 설명한다.',
    },
    {
      title: '대응 관계를 어떻게 식으로 나타낼까요',
      objective: '두 양 사이의 대응 관계를 ○, △ 등의 기호를 사용하여 식으로 나타낼 수 있다.',
      achievement: '[6수02-01] ○, △ 등을 사용하여 대응 관계를 식으로 나타낸다.',
      tags: ['correspondence'],
      textbookFocus: '풍력 발전기의 수와 날개의 수 사이의 관계를 기호로 적는다.',
      workbookFocus: '표를 보고 기호를 정해 대응 관계를 식으로 나타낸다.',
    },
    {
      title: '생활 속에서 대응 관계를 찾아 식으로 나타내어 볼까요',
      objective: '생활 속에서 서로 대응하는 두 양을 찾아 대응 관계를 식으로 나타낼 수 있다.',
      achievement: '[6수02-01] 생활 속에서 대응 관계를 찾아 식으로 나타내고 문제를 해결한다.',
      tags: ['correspondence'],
      textbookFocus: '안내문에서 여러 가지 대응 관계를 찾아 식으로 나타낸다.',
      workbookFocus: '식을 이용하여 한 양을 알 때 다른 양을 구한다.',
    },
  ]),

  // ── 4단원 약분과 통분 (지도서 11차시) ────────────────────────────
  // 2차시 크기가 같은 분수 · 3차시 만들기 · 4차시 약분과 기약분수
  // 5~6차시 통분 · 7차시 분수의 크기 비교 · 8차시 분수와 소수의 크기 비교
  unit(4, '약분과 통분', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-06] 크기가 같은 분수를 만드는 방법을 이해하고, 분수를 약분, 통분할 수 있다.',
      tags: ['fractionCompare'],
      textbookFocus: '약수와 배수에서 배운 말을 떠올리며 분수를 다룰 준비를 한다.',
      workbookFocus: '분모가 같은 분수의 크기 비교 등 앞서 배운 내용을 떠올린다.',
    },
    {
      title: '크기가 같은 분수를 알아볼까요',
      objective: '그림을 이용하여 크기가 같은 분수가 있음을 안다.',
      achievement: '[6수01-06] 크기가 같은 분수를 안다.',
      tags: ['fractionCompare'],
      textbookFocus: '같은 크기를 서로 다른 분수로 나타낼 수 있음을 그림으로 확인한다.',
      workbookFocus: '수직선과 띠 그림에서 같은 자리를 가리키는 분수를 찾는다.',
    },
    {
      title: '크기가 같은 분수를 어떻게 만들까요',
      objective: '분모와 분자에 0이 아닌 같은 수를 곱하거나 나누어 크기가 같은 분수를 만들 수 있다.',
      achievement: '[6수01-06] 분수의 성질을 이용하여 크기가 같은 분수를 만든다.',
      tags: ['fractionCompare'],
      textbookFocus: '분모와 분자에 같은 수를 곱하거나 같은 수로 나눈다.',
      workbookFocus: '주어진 분수와 크기가 같은 분수를 여러 개 만든다.',
    },
    {
      title: '분수를 간단하게 나타내어 볼까요',
      objective: '분수를 약분할 수 있고, 기약분수로 나타낼 수 있다.',
      achievement: '[6수01-06] 분수를 약분하고 기약분수로 나타낸다.',
      tags: ['fractionCompare'],
      textbookFocus: '분모와 분자를 공약수로 나누어 간단한 분수로 만든다.',
      workbookFocus: '최대공약수로 한 번에 나누어 기약분수로 만든다.',
    },
    {
      title: '분모가 같은 분수로 어떻게 나타낼까요',
      objective: '분모가 다른 두 분수를 통분할 수 있다.',
      achievement: '[6수01-06] 분모가 다른 분수를 통분한다.',
      tags: ['fractionCompare'],
      textbookFocus: '두 분모의 곱과 두 분모의 최소공배수를 공통분모로 삼아 통분한다.',
      workbookFocus: '두 가지 방법으로 통분하고 결과를 견준다.',
    },
    {
      title: '분수의 크기를 어떻게 비교할까요',
      objective: '통분을 이용하여 분모가 다른 분수의 크기를 비교할 수 있다.',
      achievement: '[6수01-07] 분모가 다른 분수의 크기를 비교하고 그 방법을 설명할 수 있다.',
      tags: ['fractionCompare'],
      textbookFocus: '통분한 뒤 분자의 크기로 두 분수를 견준다.',
      workbookFocus: '세 분수를 두 개씩 견주어 큰 차례로 늘어놓는다.',
    },
    {
      title: '분수와 소수의 크기를 어떻게 비교할까요',
      objective: '분수와 소수의 관계를 알고, 분수와 소수의 크기를 비교할 수 있다.',
      achievement: '[6수01-12] 분수와 소수의 관계를 이해하고 크기를 비교하며 그 방법을 설명할 수 있다.',
      tags: ['fractionCompare'],
      textbookFocus: '분모를 10, 100으로 고쳐 소수로 나타내거나 소수를 분수로 고친다.',
      workbookFocus: '분수와 소수가 섞인 수들을 큰 차례로 늘어놓는다.',
    },
  ]),

  // ── 5단원 분수의 덧셈과 뺄셈 (지도서 10차시) ─────────────────────
  // 2차시 (진분수)+(진분수) (1) · 3차시 (2) · 4차시 (대분수)+(대분수)
  // 5차시 (진분수)-(진분수) · 6차시 (대분수)-(대분수) (1) · 7차시 (2)
  unit(5, '분수의 덧셈과 뺄셈', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수01-08] 분모가 다른 분수의 덧셈과 뺄셈의 계산 원리를 탐구하고 그 계산을 할 수 있다.',
      tags: ['fractionAdd'],
      textbookFocus: '분모가 같은 분수의 덧셈과 뺄셈을 떠올린다.',
      workbookFocus: '통분하는 방법을 떠올려 계산할 준비를 한다.',
    },
    {
      title: '(진분수)+(진분수)를 어떻게 계산할까요 (1)',
      objective: '합이 1보다 작은, 분모가 다른 진분수의 덧셈을 할 수 있다.',
      achievement: '[6수01-08] 분모가 다른 진분수의 덧셈을 통분하여 계산한다.',
      tags: ['fractionAdd'],
      textbookFocus: '두 분수를 통분한 뒤 분자끼리 더한다.',
      workbookFocus: '계산 결과를 기약분수로 나타낸다.',
    },
    {
      title: '(진분수)+(진분수)를 어떻게 계산할까요 (2)',
      objective: '합이 1보다 큰, 분모가 다른 진분수의 덧셈을 할 수 있다.',
      achievement: '[6수01-08] 합이 1보다 큰 진분수의 덧셈을 통분하여 계산한다.',
      tags: ['fractionAdd'],
      textbookFocus: '통분하여 더한 뒤 가분수를 대분수로 고친다.',
      workbookFocus: '가분수를 대분수로 고치는 과정을 빠뜨리지 않는다.',
    },
    {
      title: '(대분수)+(대분수)를 어떻게 계산할까요',
      objective: '분모가 다른 대분수의 덧셈을 할 수 있다.',
      achievement: '[6수01-08] 분모가 다른 대분수의 덧셈을 두 가지 방법으로 계산한다.',
      tags: ['fractionAdd'],
      textbookFocus: '자연수끼리 분수끼리 더하는 방법과 가분수로 고쳐 더하는 방법을 견준다.',
      workbookFocus: '분수 부분의 합이 1보다 크면 자연수로 받아올린다.',
    },
    {
      title: '(진분수)-(진분수)를 어떻게 계산할까요',
      objective: '분모가 다른 진분수의 뺄셈을 할 수 있다.',
      achievement: '[6수01-08] 분모가 다른 진분수의 뺄셈을 통분하여 계산한다.',
      tags: ['fractionAdd'],
      textbookFocus: '두 분수를 통분한 뒤 분자끼리 뺀다.',
      workbookFocus: '두 분모의 최소공배수를 공통분모로 삼아 통분한다.',
    },
    {
      title: '(대분수)-(대분수)를 어떻게 계산할까요 (1)',
      objective: '받아내림이 없는, 분모가 다른 대분수의 뺄셈을 할 수 있다.',
      achievement: '[6수01-08] 받아내림이 없는 대분수의 뺄셈을 두 가지 방법으로 계산한다.',
      tags: ['fractionAdd'],
      textbookFocus: '자연수끼리 분수끼리 빼는 방법과 가분수로 고쳐 빼는 방법을 견준다.',
      workbookFocus: '두 가지 방법의 결과가 같음을 확인한다.',
    },
    {
      title: '(대분수)-(대분수)를 어떻게 계산할까요 (2)',
      objective: '받아내림이 있는, 분모가 다른 대분수의 뺄셈을 할 수 있다.',
      achievement: '[6수01-08] 받아내림이 있는 대분수의 뺄셈을 계산한다.',
      tags: ['fractionAdd'],
      textbookFocus: '분수 부분끼리 뺄 수 없을 때 자연수에서 1을 받아내린다.',
      workbookFocus: '가분수로 고쳐 빼는 방법으로도 같은 답이 나오는지 확인한다.',
    },
  ]),

  // ── 6단원 다각형의 둘레와 넓이 (지도서 16차시) ───────────────────
  // 2~3차시 다각형의 둘레 · 4차시 1 cm² · 5차시 직사각형의 넓이
  // 6차시 1 m²와 1 km² · 7~8차시 평행사변형 · 9~10차시 삼각형
  // 11~12차시 사다리꼴 · 13차시 마름모
  unit(6, '다각형의 둘레와 넓이', [
    {
      title: '단원 도입',
      objective: '이전에 배운 내용을 확인하고 이 단원에서 배울 내용을 확인한다.',
      achievement: '[6수03-11] 평면도형의 둘레를 이해하고, 기본적인 평면도형의 둘레를 구할 수 있다.',
      tags: ['area'],
      textbookFocus: '다각형, 정다각형, 수직, 평행 등 앞서 배운 말을 떠올린다.',
      workbookFocus: 'cm, m, km와 여러 가지 도형의 이름을 확인한다.',
    },
    {
      title: '다각형의 둘레를 어떻게 구할까요',
      objective: '정다각형과 여러 가지 사각형의 둘레를 구할 수 있다.',
      achievement: '[6수03-11] 기본적인 평면도형의 둘레를 구한다.',
      tags: ['area'],
      textbookFocus: '한 변의 길이와 변의 수를 곱해 정다각형의 둘레를 구한다.',
      workbookFocus: '직사각형, 평행사변형, 마름모의 둘레를 성질을 이용해 구한다.',
    },
    {
      title: '1 cm²는 무엇일까요',
      objective: '넓이의 표준 단위가 필요함을 알고, 1 cm²를 이해한다.',
      achievement: '[6수03-12] 넓이 단위 1 cm²를 안다.',
      tags: ['area'],
      textbookFocus: '한 변의 길이가 1 cm인 정사각형의 넓이를 넓이의 단위로 삼는다.',
      workbookFocus: '1 cm²가 몇 개인지 세어 도형의 넓이를 구한다.',
    },
    {
      title: '직사각형의 넓이를 어떻게 구할까요',
      objective: '직사각형과 정사각형의 넓이를 구하는 방법을 알고 구할 수 있다.',
      achievement: '[6수03-13] 직사각형과 정사각형의 넓이를 구하는 방법을 이해하고, 이를 구할 수 있다.',
      tags: ['area'],
      textbookFocus: '가로와 세로를 곱하면 1 cm²의 개수가 됨을 확인한다.',
      workbookFocus: '넓이를 알 때 거꾸로 한 변의 길이를 구한다.',
    },
    {
      title: '1 cm²보다 큰 넓이 단위는 무엇일까요',
      objective: '1 m²와 1 km²를 알고, 1 cm²와 1 m², 1 m²와 1 km² 사이의 관계를 이해한다.',
      achievement: '[6수03-12] 넓이 단위 1 cm², 1 m², 1 km²를 알며, 그 관계를 이해한다.',
      tags: ['area'],
      textbookFocus: '넓은 곳을 재기에 알맞은 단위를 고른다.',
      workbookFocus: '1 m²=10000 cm², 1 km²=1000000 m²를 이용해 단위를 바꾼다.',
    },
    {
      title: '평행사변형의 넓이를 어떻게 구할까요',
      objective: '평행사변형의 밑변과 높이를 알고, 넓이를 구할 수 있다.',
      achievement: '[6수03-14] 평행사변형의 넓이를 구하는 방법을 추론하고 구한다.',
      tags: ['area'],
      textbookFocus: '평행사변형을 잘라 붙여 직사각형으로 만들어 넓이를 구한다.',
      workbookFocus: '밑변의 길이와 높이가 같으면 모양이 달라도 넓이가 같음을 확인한다.',
    },
    {
      title: '삼각형의 넓이를 어떻게 구할까요',
      objective: '삼각형의 밑변과 높이를 알고, 넓이를 구할 수 있다.',
      achievement: '[6수03-14] 삼각형의 넓이를 구하는 방법을 추론하고 구한다.',
      tags: ['area'],
      textbookFocus: '똑같은 삼각형 둘을 붙여 평행사변형을 만들어 넓이를 구한다.',
      workbookFocus: '높이가 도형의 밖에 있는 삼각형의 넓이도 같은 방법으로 구한다.',
    },
    {
      title: '사다리꼴의 넓이를 어떻게 구할까요',
      objective: '사다리꼴의 윗변, 아랫변, 높이를 알고, 넓이를 구할 수 있다.',
      achievement: '[6수03-14] 사다리꼴의 넓이를 구하는 방법을 추론하고 구한다.',
      tags: ['area'],
      textbookFocus: '똑같은 사다리꼴 둘을 붙여 평행사변형을 만들어 넓이를 구한다.',
      workbookFocus: '윗변과 아랫변의 길이의 합에 높이를 곱하고 2로 나눈다.',
    },
    {
      title: '마름모의 넓이를 어떻게 구할까요',
      objective: '마름모의 두 대각선의 길이를 이용하여 넓이를 구할 수 있다.',
      achievement: '[6수03-14] 마름모의 넓이를 구하는 방법을 추론하고 구한다.',
      tags: ['area'],
      textbookFocus: '마름모를 둘러싼 직사각형의 넓이의 반임을 확인한다.',
      workbookFocus: '두 대각선의 길이를 곱하고 2로 나눈다.',
    },
  ]),
];

export const lessons51 = curriculum51.flatMap((unitEntry) => unitEntry.lessons);
