import type { Template } from './questionTemplate';

// ════════════════════════════════════════════════════════════════════
// 문항 데이터
// ────────────────────────────────────────────────────────────────────
// 여기 적힌 것이 곧 문항입니다. 수를 고르고 문장을 채우고 차시 범위를
// 지키는 일은 questionTemplate.ts의 해석기가 합니다.
//
// 문항을 더하려면 아래 형식으로 한 덩어리를 적으면 됩니다.
//   when     어느 차시에 쓸지 (차시 제목과 맞춰 봅니다)
//   demand   무엇을 요구하는지 — 난이도를 가르는 기준입니다
//              recall  아는 것을 꺼내거나 배운 절차를 그대로 수행 → 하
//              connect 상황을 읽고 어떤 식을 세울지 정해야 함     → 중
//              reason  풀이를 이해하고 판단하거나 거꾸로 생각     → 상
//   vars     쓸 수를 어떻게 고를지. {from,to}는 그 사이에서 고르고,
//            {calc}는 이미 정한 수로 계산합니다(+ - × 만 씁니다)
//   prompt   문제. 중괄호 안에 변수나 계산을 씁니다. 예: {a + b}
//
// 차시가 다루는 가장 큰 수를 넘는 값이 하나라도 나오면 그 문항은
// 만들어지지 않습니다. 범위를 일일이 확인하지 않아도 됩니다.
// ════════════════════════════════════════════════════════════════════

export const questionBank: Template[] = [
  // ── 세 자리 수 / 네 자리 수 ────────────────────────────────────
  {
    id: 'number-read-place',
    when: /각 자리의 숫자/,
    demand: 'recall',
    tag: 'placeValue',
    strategy: '자리 숫자가 나타내는 값 구하기',
    vars: {
      hundreds: { from: 2, to: 9 },
      tens: { from: 1, to: 8 },
      ones: { from: 1, to: 9 },
      value: { calc: 'hundreds * 100 + tens * 10 + ones' },
      worth: { calc: 'tens * 10' },
    },
    prompt: '{value}에서 십의 자리 숫자가 나타내는 값은 얼마일까요?',
    answer: '{worth}',
    wrongs: ['{tens}', '{hundreds}', '{ones}'],
    solution: '십의 자리에 있는 {tens}은 {worth}을 나타냅니다.',
  },
  {
    id: 'number-between',
    when: /크기를 비교/,
    demand: 'reason',
    tag: 'placeValue',
    strategy: '자료 해석 · 두 수 사이의 수 찾기',
    vars: {
      head: { from: 2, to: 8 },
      low: { calc: 'head * 100 + 40' },
      high: { calc: 'head * 100 + 60' },
      middle: { calc: 'head * 100 + 50' },
    },
    prompt: '{low}보다 크고 {high}보다 작은 수 중 십의 자리 숫자가 5인 수는?',
    answer: '{middle}',
    wrongs: ['{low}', '{high}', '{middle + 10}'],
    solution: '{low}와 {high} 사이에서 십의 자리가 5인 수는 {middle}입니다.',
  },

  // ── 덧셈과 뺄셈 ────────────────────────────────────────────────
  {
    id: 'add-two-digit',
    when: /덧셈을 해 볼까요 ⑴/,
    demand: 'recall',
    tag: 'addition',
    strategy: '받아올림 없는 덧셈 계산하기',
    vars: {
      aTens: { from: 2, to: 6 },
      aOnes: { from: 1, to: 4 },
      bTens: { from: 1, to: 3 },
      bOnes: { from: 1, to: 4 },
      a: { calc: 'aTens * 10 + aOnes' },
      b: { calc: 'bTens * 10 + bOnes' },
      sum: { calc: 'a + b' },
    },
    prompt: '{a}+{b}는 얼마일까요?',
    answer: '{sum}',
    wrongs: ['{sum + 10}', '{sum - 10}', '{a}'],
    solution: '십의 자리끼리, 일의 자리끼리 더하면 {sum}입니다.',
  },
  {
    id: 'sub-word-left',
    when: /뺄셈을 해/,
    demand: 'connect',
    tag: 'subtraction',
    strategy: '조건 함께 보기 · 남은 수를 구하는 상황',
    vars: {
      all: { from: 45, to: 89 },
      gone: { from: 12, to: 33 },
      left: { calc: 'all - gone' },
    },
    prompt: '색종이가 {all}장 있었습니다. {gone}장을 썼습니다. 남은 색종이는 몇 장일까요?',
    answer: '{left}장',
    wrongs: ['{all + gone}장', '{gone}장', '{left + 10}장'],
    solution: '쓴 만큼 빼면 {all}-{gone}={left}장입니다.',
  },

  // ── 곱셈구구 ───────────────────────────────────────────────────
  {
    id: 'times-word-groups',
    when: /단 곱셈구구/,
    demand: 'connect',
    tag: 'multiplication',
    strategy: '조건 함께 보기 · 묶음 상황을 곱셈으로 풀기',
    vars: {
      per: { from: 2, to: 9 },
      groups: { from: 2, to: 8 },
      total: { calc: 'per * groups' },
    },
    prompt: '한 상자에 공이 {per}개씩 들어 있습니다. {groups}상자에 든 공은 모두 몇 개일까요?',
    answer: '{total}개',
    wrongs: ['{per + groups}개', '{total + per}개', '{total - per}개'],
    solution: '{per}씩 {groups}묶음이므로 {per}×{groups}={total}개입니다.',
  },

  // ── 길이 재기 ──────────────────────────────────────────────────
  {
    id: 'length-sum',
    when: /길이의 합/,
    demand: 'connect',
    tag: 'measurement',
    strategy: '조건 함께 보기 · 이은 길이 구하기',
    vars: {
      a: { from: 12, to: 48 },
      b: { from: 11, to: 39 },
      total: { calc: 'a + b' },
    },
    prompt: '리본 {a}cm와 {b}cm를 겹치지 않게 이었습니다. 이은 리본은 몇 cm일까요?',
    answer: '{total}cm',
    wrongs: ['{a - b}cm', '{a}cm', '{total + 10}cm'],
    solution: '겹치지 않게 이으면 더하므로 {a}+{b}={total}cm입니다.',
  },

  // ── 표와 그래프 ────────────────────────────────────────────────
  {
    id: 'data-total',
    when: /표로 나타내|무엇을 알 수 있/,
    demand: 'connect',
    tag: 'data',
    strategy: '조건 함께 보기 · 표의 합계 구하기',
    vars: {
      a: { from: 3, to: 8 },
      b: { from: 2, to: 7 },
      c: { from: 1, to: 6 },
      total: { calc: 'a + b + c' },
    },
    prompt: '좋아하는 색을 조사했더니 빨강 {a}명, 파랑 {b}명, 노랑 {c}명이었습니다. 조사한 학생은 모두 몇 명일까요?',
    answer: '{total}명',
    wrongs: ['{a + b}명', '{total + 1}명', '{a}명'],
    solution: '{a}+{b}+{c}={total}명입니다.',
  },
];
