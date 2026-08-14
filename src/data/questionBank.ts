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
    units: ['세 자리 수'],
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
    solution: '십의 자리에 있는 {tens:은} {worth:을} 나타냅니다.',
  },
  {
    id: 'number-between',
    when: /크기를 비교/,
    demand: 'reason',
    tag: 'placeValue',
    strategy: '자료 해석 · 조건에 맞는 수를 거꾸로 찾기',
    vars: {
      head: { from: 2, to: 8 },
      low: { calc: 'head * 100 + 40' },
      high: { calc: 'head * 100 + 60' },
      middle: { calc: 'head * 100 + 50' },
    },
    prompt: '{low}보다 크고 {high}보다 작은 수 중 십의 자리 숫자가 5인 수는?',
    answer: '{middle}',
    wrongs: ['{low}', '{high}', '{middle + 10}'],
    solution: '{low:와} {high} 사이에서 십의 자리가 5인 수는 {middle}입니다.',
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
    prompt: '{a}+{b:은} 얼마일까요?',
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
      // 이 차시가 다루는 단에서만 고릅니다. 2단 차시에 7씩 묶는 문제가
      // 나오지 않는 것이 여기서 정해집니다.
      per: { dan: true },
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
    strategy: '조건 함께 보기 · 이어 붙인 길이의 합 구하기',
    vars: {
      a: { from: 12, to: 48 },
      b: { from: 11, to: 39 },
      total: { calc: 'a + b' },
    },
    prompt: '리본 {a}cm와 {b}cm를 겹치지 않게 이었습니다. 이은 리본은 몇 cm일까요?',
    answer: '{total}cm',
    wrongs: ['{total + 10}cm', '{total - 10}cm', '{a}cm'],
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

  // ── 세 자리 수 ─────────────────────────────────────────────────
  {
    id: 'number-pack-total',
    when: /세 자리 수를 알아/,
    units: ['세 자리 수'],
    demand: 'connect',
    tag: 'placeValue',
    strategy: '조건 함께 보기 · 묶음으로 담긴 물건의 수 구하기',
    vars: {
      box: { from: 2, to: 7 },
      bag: { from: 1, to: 8 },
      loose: { from: 1, to: 8 },
      total: { calc: 'box * 100 + bag * 10 + loose' },
    },
    words: { item: ['사과', '구슬', '단추', '색종이'] },
    prompt: '{item:이} 100개씩 든 상자 {box}개, 10개씩 든 봉지 {bag}개, 낱개 {loose}개 있습니다. {item:은} 모두 몇 개일까요?',
    answer: '{total}개',
    wrongs: ['{box + bag + loose}개', '{box * 100}개', '{total + 100}개'],
    solution: '100이 {box}개, 10이 {bag}개, 1이 {loose}개이므로 {total}개입니다.',
  },
  {
    id: 'number-jump-ten',
    when: /뛰어 세/,
    units: ['세 자리 수'],
    demand: 'recall',
    tag: 'number',
    strategy: '10씩 뛰어 세기',
    vars: {
      start: { from: 120, to: 780 },
      next: { calc: 'start + 10' },
    },
    prompt: '{start}에서 10씩 뛰어 세면 다음에 오는 수는 얼마일까요?',
    answer: '{next}',
    wrongs: ['{start + 1}', '{start + 100}', '{start - 10}'],
    solution: '10씩 뛰어 세면 십의 자리 숫자가 1 커지므로 {next}입니다.',
  },

  // ── 네 자리 수 ─────────────────────────────────────────────────
  {
    id: 'number-read-place-four',
    when: /각 자리의 숫자/,
    units: ['네 자리 수'],
    demand: 'recall',
    tag: 'placeValue',
    strategy: '자리 숫자가 나타내는 값 구하기',
    vars: {
      t: { from: 2, to: 9 },
      h: { from: 1, to: 8 },
      ten: { from: 1, to: 9 },
      one: { from: 0, to: 9 },
      value: { calc: 't * 1000 + h * 100 + ten * 10 + one' },
      worth: { calc: 'h * 100' },
    },
    prompt: '{value}에서 백의 자리 숫자가 나타내는 값은 얼마일까요?',
    answer: '{worth}',
    wrongs: ['{h}', '{h * 10}', '{t * 1000}'],
    solution: '백의 자리에 있는 숫자 {h:은} {worth:을} 나타냅니다.',
  },
  {
    id: 'number-jump-thousand',
    when: /뛰어 세/,
    units: ['네 자리 수'],
    demand: 'recall',
    tag: 'number',
    strategy: '1000씩 뛰어 세기',
    vars: {
      t: { from: 1, to: 8 },
      h: { from: 0, to: 9 },
      ten: { from: 0, to: 9 },
      one: { from: 0, to: 9 },
      start: { calc: 't * 1000 + h * 100 + ten * 10 + one' },
      next: { calc: 'start + 1000' },
    },
    prompt: '{start}에서 1000씩 뛰어 세면 다음에 오는 수는 얼마일까요?',
    answer: '{next}',
    wrongs: ['{start + 100}', '{start + 10}', '{start + 1}'],
    solution: '1000씩 뛰어 세면 천의 자리 숫자가 1 커지므로 {next}입니다.',
  },

  // ── 덧셈과 뺄셈 ────────────────────────────────────────────────
  {
    id: 'add-carry-word',
    when: /덧셈을 해 볼까요 ⑵/,
    demand: 'connect',
    tag: 'addition',
    strategy: '조건 함께 보기 · 두 수를 합치는 상황',
    vars: {
      a: { from: 26, to: 58 },
      b: { from: 17, to: 39 },
      total: { calc: 'a + b' },
    },
    words: { item: ['딱지', '구슬', '스티커', '색연필'] },
    prompt: '형은 {item:을} {a}개, 동생은 {b}개 가지고 있습니다. 두 사람이 가진 {item:은} 모두 몇 개일까요?',
    answer: '{total}개',
    wrongs: ['{a - b}개', '{total - 10}개', '{a}개'],
    solution: '두 사람의 수를 더하면 {a}+{b}={total}개입니다.',
  },
  {
    id: 'add-make-ten',
    when: /여러 가지 방법으로 덧셈/,
    demand: 'reason',
    tag: 'addition',
    strategy: '자료 해석 · 수를 바꾸어 계산한 식 판단하기',
    vars: {
      aTens: { from: 2, to: 5 },
      aOnes: { from: 6, to: 9 },
      bTens: { from: 1, to: 3 },
      bOnes: { from: 1, to: 5 },
      a: { calc: 'aTens * 10 + aOnes' },
      b: { calc: 'bTens * 10 + bOnes' },
      d: { calc: '10 - aOnes' },
      up: { calc: 'a + d' },
      down: { calc: 'b - d' },
      sum: { calc: 'a + b' },
    },
    prompt: '{a}+{b:을} 계산할 때 {a:을} 몇십으로 만들어 더하려고 합니다. 알맞은 식은 무엇일까요?',
    answer: '{up}+{down}',
    wrongs: ['{up}+{b}', '{a}+{down}', '{up}+{b + d}'],
    solution: '{a}에 {d:을} 더해 {up:을} 만들었으니 {b}에서 {d:을} 덜어 내야 합니다. {up}+{down}={sum}입니다.',
  },
  {
    id: 'sub-compare-word',
    when: /뺄셈을 해 볼까요 ⑵/,
    demand: 'connect',
    tag: 'subtraction',
    strategy: '조건 함께 보기 · 더 많은 수를 구하는 상황',
    vars: {
      many: { from: 52, to: 95 },
      few: { from: 18, to: 44 },
      gap: { calc: 'many - few' },
    },
    prompt: '학교 도서관에 동화책이 {many}권, 만화책이 {few}권 있습니다. 동화책은 만화책보다 몇 권 더 많을까요?',
    answer: '{gap}권',
    wrongs: ['{many + few}권', '{few}권', '{gap + 10}권'],
    solution: '얼마나 더 많은지는 빼서 구합니다. {many}-{few}={gap}권입니다.',
  },
  {
    id: 'sub-keep-difference',
    when: /여러 가지 방법으로 뺄셈/,
    demand: 'reason',
    tag: 'subtraction',
    strategy: '자료 해석 · 두 수를 함께 바꾼 식 판단하기',
    vars: {
      aTens: { from: 5, to: 8 },
      aOnes: { from: 2, to: 8 },
      bTens: { from: 1, to: 3 },
      bOnes: { from: 6, to: 9 },
      a: { calc: 'aTens * 10 + aOnes' },
      b: { calc: 'bTens * 10 + bOnes' },
      d: { calc: '10 - bOnes' },
      upA: { calc: 'a + d' },
      upB: { calc: 'b + d' },
      diff: { calc: 'a - b' },
    },
    prompt: '{a}-{b:을} 계산할 때 {b:을} 몇십으로 만들어 빼려고 합니다. 알맞은 식은 무엇일까요?',
    answer: '{upA}-{upB}',
    wrongs: ['{a}-{upB}', '{upA}-{b}', '{upA}-{b - d}'],
    solution: '{b}에 {d:을} 더해 {upB:을} 만들었으면 {a}에도 똑같이 {d:을} 더해야 차가 달라지지 않습니다. {upA}-{upB}={diff}입니다.',
  },
  {
    id: 'three-numbers-order',
    when: /세 수의 계산/,
    demand: 'reason',
    tag: 'addition',
    strategy: '자료 해석 · 계산 차례 판단하기',
    vars: {
      a: { from: 24, to: 48 },
      b: { from: 11, to: 26 },
      c: { from: 6, to: 18 },
      first: { calc: 'a + b' },
      result: { calc: 'a + b - c' },
    },
    prompt: '{a}+{b}-{c:을} 계산할 때 가장 먼저 계산해야 하는 것은 무엇일까요?',
    answer: '{a}+{b}',
    wrongs: ['{b}-{c}', '{a}-{c}', '{b}+{c}'],
    solution: '세 수의 계산은 앞에서부터 차례로 합니다. {a}+{b}={first}, {first}-{c}={result}입니다.',
  },
  {
    id: 'add-sub-relation',
    when: /덧셈과 뺄셈의 관계/,
    demand: 'reason',
    tag: 'subtraction',
    strategy: '자료 해석 · 덧셈식을 뺄셈식으로 바꾸어 나타내기',
    vars: {
      a: { from: 22, to: 48 },
      b: { from: 11, to: 19 },
      sum: { calc: 'a + b' },
    },
    prompt: '{a}+{b}={sum:을} 뺄셈식으로 바르게 나타낸 것은 무엇일까요?',
    answer: '{sum}-{b}={a}',
    wrongs: ['{sum}-{b}={b}', '{a}-{b}={sum}', '{sum}+{b}={a}'],
    solution: '전체에서 한 부분을 빼면 나머지 부분이 됩니다. {sum}-{b}={a}입니다.',
  },
  {
    id: 'blank-in-subtraction',
    when: /□의 값/,
    demand: 'reason',
    tag: 'subtraction',
    strategy: '자료 해석 · 뺄셈식에서 □를 거꾸로 찾기',
    vars: {
      b: { from: 11, to: 38 },
      diff: { from: 13, to: 49 },
      a: { calc: 'diff + b' },
    },
    prompt: '□-{b}={diff}에서 □에 알맞은 수는 얼마일까요?',
    answer: '{a}',
    wrongs: ['{diff}', '{b}', '{a + 10}'],
    solution: '{diff}에 {b:을} 도로 더하면 처음 수가 됩니다. {diff}+{b}={a}입니다.',
  },

  // ── 곱셈구구 ───────────────────────────────────────────────────
  {
    id: 'times-missing-factor',
    when: /곱셈표/,
    units: ['곱셈구구'],
    demand: 'reason',
    tag: 'multiplication',
    strategy: '자료 해석 · 곱하는 수를 거꾸로 찾기',
    vars: {
      dan: { dan: true },
      times: { from: 2, to: 9 },
      product: { calc: 'dan * times' },
    },
    prompt: '{dan}×□={product}에서 □에 알맞은 수는 얼마일까요?',
    answer: '{times}',
    wrongs: ['{times + 1}', '{dan}', '{product}'],
    solution: '{dan}씩 {times}묶음이면 {product}이므로 □는 {times}입니다.',
  },
  {
    id: 'times-left-over',
    when: /이용하여/,
    units: ['곱셈구구'],
    demand: 'connect',
    tag: 'multiplication',
    strategy: '조건 함께 보기 · 곱한 뒤 덜어 내는 상황',
    vars: {
      per: { dan: true },
      groups: { from: 3, to: 8 },
      eaten: { from: 2, to: 6 },
      made: { calc: 'per * groups' },
      left: { calc: 'per * groups - eaten' },
    },
    words: { item: ['빵', '귤', '초콜릿'] },
    prompt: '접시 한 개에 {item:이} {per}개씩 놓여 있습니다. 접시가 {groups}개 있는데 그중 {eaten}개를 먹었다면 남은 {item:은} 몇 개일까요?',
    answer: '{left}개',
    wrongs: ['{made}개', '{made + eaten}개', '{eaten}개'],
    solution: '{per}×{groups}={made}개에서 {eaten}개를 빼면 {left}개입니다.',
  },

  // ── 길이 재기 ──────────────────────────────────────────────────
  {
    id: 'length-difference',
    when: /길이의 차/,
    demand: 'connect',
    tag: 'measurement',
    strategy: '조건 함께 보기 · 두 길이의 차 구하기',
    vars: {
      long: { from: 45, to: 95 },
      short: { from: 12, to: 38 },
      gap: { calc: 'long - short' },
    },
    prompt: '노란 끈은 {long}cm, 파란 끈은 {short}cm입니다. 노란 끈은 파란 끈보다 몇 cm 더 길까요?',
    answer: '{gap}cm',
    wrongs: ['{long + short}cm', '{short}cm', '{gap + 10}cm'],
    solution: '더 긴 것에서 짧은 것을 빼면 {long}-{short}={gap}cm입니다.',
  },
  {
    id: 'length-m-to-cm',
    when: /더 큰 단위/,
    demand: 'recall',
    tag: 'measurement',
    strategy: 'm를 cm로 바꾸기',
    vars: {
      m: { from: 1, to: 4 },
      cm: { from: 10, to: 80 },
      total: { calc: 'm * 100 + cm' },
    },
    prompt: '{m}m {cm}cm는 몇 cm일까요?',
    answer: '{total}cm',
    wrongs: ['{m + cm}cm', '{m * 100}cm', '{m * 10 + cm}cm'],
    solution: '1m는 100cm이므로 {m}m는 {m * 100}cm이고, 여기에 {cm}cm를 더하면 {total}cm입니다.',
  },

  // ── 시각과 시간 ────────────────────────────────────────────────
  {
    id: 'time-minute-hand',
    when: /몇 시 몇 분을 읽어 볼까요 ⑴/,
    demand: 'recall',
    tag: 'time',
    strategy: '긴바늘이 가리키는 수를 분으로 바꾸기',
    vars: {
      point: { from: 2, to: 10 },
      minute: { calc: 'point * 5' },
    },
    prompt: '시계의 긴바늘이 {point:을} 가리키면 몇 분일까요?',
    answer: '{minute}분',
    wrongs: ['{point}분', '{minute - 5}분', '{minute + 5}분'],
    solution: '긴바늘이 한 칸 갈 때마다 5분이므로 {point}×5={minute}분입니다.',
  },
  {
    id: 'time-elapsed-word',
    when: /걸린 시간/,
    demand: 'connect',
    tag: 'time',
    strategy: '조건 함께 보기 · 걸린 시간을 구하는 상황',
    vars: {
      hour: { from: 1, to: 9 },
      begin: { from: 10, to: 20 },
      end: { from: 35, to: 55 },
      gap: { calc: 'end - begin' },
    },
    prompt: '{hour}시 {begin}분에 운동을 시작해서 {hour}시 {end}분에 마쳤습니다. 운동한 시간은 몇 분일까요?',
    answer: '{gap}분',
    wrongs: ['{end}분', '{begin}분', '{gap + 10}분'],
    solution: '마친 시각에서 시작한 시각을 빼면 {end}-{begin}={gap}이므로 {gap}분입니다.',
  },

  // ── 표와 그래프 ────────────────────────────────────────────────
  {
    id: 'data-missing-cell',
    when: /무엇을 알 수 있/,
    demand: 'reason',
    tag: 'data',
    strategy: '자료 해석 · 합계로 빠진 수 구하기',
    vars: {
      a: { from: 4, to: 9 },
      b: { from: 3, to: 8 },
      total: { from: 18, to: 26 },
      c: { calc: 'total - a - b' },
    },
    prompt: '좋아하는 동물을 조사한 표에서 강아지는 {a}명, 고양이는 {b}명입니다. 조사한 학생이 모두 {total}명이면 토끼를 좋아하는 학생은 몇 명일까요?',
    answer: '{c}명',
    wrongs: ['{total}명', '{a + b}명', '{c + 1}명'],
    solution: '합계에서 아는 수를 빼면 {total}-{a}-{b}={c}명입니다.',
  },

  // ── 분류하기 ───────────────────────────────────────────────────
  {
    id: 'sort-count-check',
    when: /분류하고 세어/,
    demand: 'connect',
    tag: 'classification',
    strategy: '조건 함께 보기 · 분류한 수를 모두 세기',
    vars: {
      a: { from: 3, to: 9 },
      b: { from: 2, to: 8 },
      c: { from: 1, to: 6 },
      total: { calc: 'a + b + c' },
    },
    prompt: '단추를 색깔에 따라 분류했더니 빨강 {a}개, 파랑 {b}개, 노랑 {c}개였습니다. 분류한 단추는 모두 몇 개일까요?',
    answer: '{total}개',
    wrongs: ['{a + b}개', '{total + 1}개', '{a}개'],
    solution: '분류한 수를 모두 더하면 처음 수와 같아야 합니다. {a}+{b}+{c}={total}개입니다.',
  },
];
