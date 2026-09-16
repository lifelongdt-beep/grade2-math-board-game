import type { G5Family } from '../build';
import { digitAt, estimate, eul, eun, gwa, i as iJosa, pick, placeName, rand, roundingName, type Rounding } from '../util';

// ════════════════════════════════════════════════════════════════════
// 5차시 올림 / 6차시 버림 / 7차시 반올림
// ────────────────────────────────────────────────────────────────────
// 세 차시는 흐름이 같습니다(실생활 상황 → 자연수 어림 → 소수 어림 →
// 실생활 문제해결). 하는 일만 다르므로 한 벌을 두고 mode로 가릅니다.
//
// 지도서가 세 차시 모두에서 소수를 함께 다룹니다 — 1.947을 올림하여
// 소수 둘째 자리까지, 12.398을 버림하여 소수 둘째 자리까지, 90.074를
// 반올림하여 소수 첫째 자리까지. 자연수만 내면 차시의 절반이 빠집니다.
//
// 오답은 셋을 씁니다.
//   · 다른 어림 방법으로 구한 값 (올림할 자리에서 버린 값 등)
//   · 한 자리 옆에서 어림한 값
//   · 반올림에서 아래 수를 모두 본 값
// 모두 아이가 실제로 하는 실수입니다.
//
// 계산은 util.ts의 estimate가 합니다. 자바스크립트의 소수 연산을 쓰지
// 않고 BigInt로만 세므로, 12.398 × 100이 1239.7999…가 되는 일이
// 없습니다. 그 값이 시험(util.check.test.ts)에서 지도서에 적힌 답과
// 하나하나 맞춰져 있습니다.
// ════════════════════════════════════════════════════════════════════

const 다른방법 = (mode: Rounding): Rounding[] =>
  (['ceil', 'floor', 'round'] as Rounding[]).filter((other) => other !== mode);

const 자연수자리 = [1, 2, 3, 4];
const 소수자리 = [-1, -2];

/** 어림하기 좋은 자연수를 만듭니다. 구하려는 자리 아래가 0이면 물을 것이 없습니다. */
const 어림할자연수 = (seed: number, exp: number): string => {
  const next = rand(seed);
  const 자릿수 = exp + 1 + next(2); // 구하려는 자리보다 한두 자리 큰 수
  let value = 0;
  for (let place = 자릿수; place >= 0; place -= 1) {
    const digit = place === 자릿수 ? 1 + next(9) : next(10);
    value += digit * 10 ** place;
  }
  // 아래 자리가 모두 0이면 올림해도 버림해도 같은 값이라 물을 것이 없습니다.
  if (value % 10 ** exp === 0) value += 1 + next(10 ** exp - 1);
  return String(value);
};

const 어림할소수 = (seed: number, exp: number): string => {
  const next = rand(seed);
  const 정수부 = 1 + next(400);
  const 자리수 = -exp + 1; // 구하려는 자리보다 한 자리 더 깊게
  let 소수부 = '';
  for (let i = 0; i < 자리수; i += 1) 소수부 += String(next(10));
  if (Number(소수부.slice(-1)) === 0) 소수부 = `${소수부.slice(0, -1)}${1 + next(9)}`;
  return `${정수부}.${소수부}`;
};

const 뜻보기 = (mode: Rounding) => ({
  ceil: '구하려는 자리 아래의 수를 올려서 나타내는 방법',
  floor: '구하려는 자리 아래의 수를 버려서 나타내는 방법',
  round: '구하려는 자리 바로 아래 자리의 숫자가 5 미만이면 버리고 5 이상이면 올려서 나타내는 방법',
}[mode]);

// ── 하 ──────────────────────────────────────────────────────────────
export const lesson567Easy = (mode: Rounding): G5Family[] => {
  const 이름 = roundingName[mode];

  const 어림문항 = (소수인가: boolean, which: number): G5Family => ({
    id: `estimate-${소수인가 ? 'decimal' : 'natural'}-${which}`,
    make: (seed) => {
      const exp = 소수인가 ? pick(소수자리, seed + which) : pick(자연수자리, seed + which);
      const value = 소수인가 ? 어림할소수(seed + which * 11, exp) : 어림할자연수(seed + which * 11, exp);
      const answer = estimate(value, exp, mode);
      const others = 다른방법(mode).map((other) => estimate(value, exp, other));
      const 옆자리 = [exp + 1, exp - 1]
        .filter((next) => (소수인가 ? next >= -3 && next <= 0 : next >= 0 && next <= 5))
        .map((next) => estimate(value, next, mode));
      return {
        prompt: `${eul(value)} ${이름}하여 ${placeName(exp)}까지 나타내면 얼마일까요?`,
        answer,
        wrongs: [...others, ...옆자리, value],
        tag: 'rounding',
        strategy: `${이름}하여 나타내기`,
        hint:
          mode === 'round'
            ? `${placeName(exp)} 바로 아래 자리의 숫자 하나에 동그라미를 쳐 보세요. 그 숫자만 보면 됩니다.`
            : `${placeName(exp)}에 밑줄을 긋고, 그 아래에 있는 수를 따로 적어 보세요.`,
        steps: [
          mode === 'round'
            ? `${placeName(exp)} 바로 아래 자리의 숫자는 ${digitAt(value, exp - 1)}입니다.`
            : `${placeName(exp)} 아래의 수를 ${mode === 'ceil' ? '올립니다' : '버립니다'}.`,
          mode === 'round'
            ? `${digitAt(value, exp - 1)}${iJosa(String(digitAt(value, exp - 1)))} 5 ${digitAt(value, exp - 1) >= 5 ? '이상이므로 올립니다' : '미만이므로 버립니다'}.`
            : mode === 'ceil'
              ? '올림은 아래에 0이 아닌 수가 하나라도 있으면 구하려는 자리를 1 크게 합니다.'
              : '버림은 아래의 수를 모두 0으로 바꿉니다.',
          `그러므로 ${eul(value)} ${이름}하여 ${placeName(exp)}까지 나타내면 ${answer}입니다.`,
        ],
      };
    },
  });

  return [
    어림문항(false, 0),
    어림문항(false, 1),
    어림문항(false, 2),
    어림문항(true, 0),
    어림문항(true, 1),
    {
      id: 'meaning',
      make: (seed) => ({
        prompt: `${이름}에 대한 설명으로 알맞은 것은 어느 것일까요?`,
        answer: 뜻보기(mode),
        wrongs: [...다른방법(mode).map(뜻보기), '구하려는 자리의 숫자를 그대로 두는 방법'],
        tag: 'rounding',
        strategy: `${이름}의 뜻 알기`,
        hint: `${iJosa(이름)} 참값보다 커지는 방법인지 작아지는 방법인지, 아니면 가장 가까운 값을 찾는 방법인지 떠올려 보세요.`,
        steps: [
          mode === 'ceil'
            ? '올림은 모자라면 안 되는 상황에서 씁니다. 그래서 참값보다 크거나 같은 값이 나옵니다.'
            : mode === 'floor'
              ? '버림은 넘치면 안 되는 상황에서 씁니다. 그래서 참값보다 작거나 같은 값이 나옵니다.'
              : '반올림은 참값에 가장 가깝게 어림하는 방법입니다.',
          `그러므로 ${eun(이름)} ${뜻보기(mode)}입니다.`,
        ],
        misconceptionTip:
          mode === 'round'
            ? '반올림은 구하려는 자리 바로 아래 자리의 숫자 하나만 봅니다. 그 아래에 어떤 수가 더 있어도 보지 않습니다.'
            : undefined,
      }),
    },
    {
      id: 'which-digit',
      make: (seed) => {
        const exp = pick(자연수자리, seed);
        const value = 어림할자연수(seed, exp);
        if (mode === 'round') {
          return {
            prompt: `${eul(value)} 반올림하여 ${placeName(exp)}까지 나타내려면 어느 자리의 숫자를 보아야 할까요?`,
            answer: placeName(exp - 1),
            wrongs: [placeName(exp), placeName(exp + 1), placeName(Math.max(0, exp - 2)), '일의 자리'],
            tag: 'rounding',
            strategy: '반올림에서 살펴볼 자리 찾기',
            hint: '반올림은 구하려는 자리 바로 아래 자리 하나만 봅니다. 구하려는 자리에서 한 칸만 오른쪽으로 옮겨 보세요.',
            steps: [
              `구하려는 자리는 ${placeName(exp)}입니다.`,
              `반올림은 그 바로 아래 자리의 숫자가 5 미만인지 5 이상인지를 봅니다.`,
              `그러므로 ${placeName(exp - 1)}의 숫자를 보아야 합니다.`,
            ],
            misconceptionTip: '아래 자리의 수를 모두 이어 붙여 보면 올림·버림이 됩니다. 반올림은 한 자리만 봅니다.',
          };
        }
        const answer = estimate(value, exp, mode);
        const 아래 = Number(value) % 10 ** exp;
        return {
          prompt: `${eul(value)} ${이름}하여 ${placeName(exp)}까지 나타낼 때, ${placeName(exp)} 아래의 수 ${eun(String(아래))} 어떻게 될까요?`,
          answer: mode === 'ceil' ? `${iJosa(String(10 ** exp))} 되어 윗자리로 올라갑니다.` : '모두 0이 됩니다.',
          wrongs: [
            mode === 'ceil' ? '모두 0이 됩니다.' : `${iJosa(String(10 ** exp))} 되어 윗자리로 올라갑니다.`,
            '그대로 남습니다.',
            '반으로 줄어듭니다.',
          ],
          tag: 'rounding',
          strategy: `${이름}에서 아래 수가 어떻게 되는지 알기`,
          hint: `${이름}한 값 ${gwa(answer)} 처음 수 ${eul(value)} 나란히 적고 무엇이 달라졌는지 견주어 보세요.`,
          steps: [
            `${placeName(exp)} 아래의 수는 ${아래}입니다.`,
            mode === 'ceil'
              ? `올림은 아래의 수가 0이 아니면 ${10 ** exp}으로 채워 윗자리를 1 크게 합니다.`
              : '버림은 아래의 수를 모두 0으로 바꿉니다.',
            mode === 'ceil'
              ? `그래서 ${placeName(exp)} 아래의 수 ${eun(String(아래))} ${iJosa(String(10 ** exp))} 되어 윗자리로 올라갑니다. ${eun(value)} ${iJosa(estimate(value, exp, mode))} 됩니다.`
              : `그래서 ${placeName(exp)} 아래의 수는 모두 0이 됩니다. ${eun(value)} ${iJosa(estimate(value, exp, mode))} 됩니다.`,
          ],
        };
      },
    },
  ];
};

// ── 중 ──────────────────────────────────────────────────────────────
type 상황 = {
  id: string;
  mode: Rounding;
  make: (seed: number) => {
    prompt: string;
    exp: number;
    value: string;
    answer: string;
    단위: string;
    풀이: string[];
    hint: string;
  } | null;
};

export const lesson567Middle = (mode: Rounding): G5Family[] => {
  const 이름 = roundingName[mode];

  if (mode === 'ceil') {
    return [
      {
        id: 'badge',
        make: (seed) => {
          const next = rand(seed);
          const 필요 = 100 + next(900);
          const 묶음 = pick([10, 100], seed);
          const exp = 묶음 === 10 ? 1 : 2;
          if (필요 % 묶음 === 0) return null;
          const answer = estimate(String(필요), exp, 'ceil');
          return {
            prompt: `선수단에 나누어 줄 배지가 ${필요}개 필요합니다. 상점에서 배지를 ${묶음}개씩 묶음으로만 판다면 최소 몇 개를 사야 할까요?`,
            answer: `${answer}개`,
            wrongs: [
              `${estimate(String(필요), exp, 'floor')}개`,
              `${estimate(String(필요), exp, 'round')}개`,
              `${필요}개`,
              `${Number(answer) + 묶음}개`,
            ],
            tag: 'rounding',
            strategy: '올림을 활용하여 문제 해결하기',
            hint: `배지가 모자라면 안 됩니다. ${필요}개보다 크면서 ${묶음}으로 묶을 수 있는 수 가운데 가장 작은 수를 찾으세요.`,
            steps: [
              `배지가 부족하지 않아야 하므로 ${필요}보다 큰 수로 어림합니다. 이것이 올림입니다.`,
              `${묶음}개씩 묶음으로 사므로 ${placeName(exp)}까지 올림합니다.`,
              `${eul(String(필요))} 올림하여 ${placeName(exp)}까지 나타내면 ${answer}이므로 최소 ${answer}개를 사야 합니다.`,
            ],
          };
        },
      },
      {
        id: 'bill',
        make: (seed) => {
          const next = rand(seed);
          const 금액 = 1000 + next(20000);
          const 지폐 = pick([1000, 10000], seed);
          const exp = 지폐 === 1000 ? 3 : 4;
          if (금액 % 지폐 === 0) return null;
          const answer = estimate(String(금액), exp, 'ceil');
          return {
            prompt: `문구점에서 ${금액}원을 계산하려고 합니다. ${지폐}원짜리 지폐로만 낸다면 최소 얼마를 내야 할까요?`,
            answer: `${answer}원`,
            wrongs: [
              `${estimate(String(금액), exp, 'floor')}원`,
              `${estimate(String(금액), exp, 'round')}원`,
              `${금액}원`,
              `${Number(answer) + 지폐}원`,
            ],
            tag: 'rounding',
            strategy: '올림을 활용하여 문제 해결하기',
            hint: `지폐 한 장의 금액이 얼마인지 보고, ${금액}원보다 모자라지 않게 어림하세요.`,
            steps: [
              `${지폐}원짜리 지폐로만 내므로 ${금액}원보다 적게 낼 수 없습니다. 그래서 올림합니다.`,
              `${eul(String(금액))} 올림하여 ${placeName(exp)}까지 나타내면 ${answer}입니다.`,
              `그러므로 최소 ${answer}원을 내야 합니다.`,
            ],
          };
        },
      },
      {
        id: 'box',
        make: (seed) => {
          const next = rand(seed);
          const 개수 = 100 + next(500);
          const 한상자 = pick([10, 20, 25], seed);
          const 상자 = Math.ceil(개수 / 한상자);
          if (개수 % 한상자 === 0) return null;
          return {
            prompt: `도시락 ${개수}개를 한 상자에 ${한상자}개씩 담으려고 합니다. 상자는 최소 몇 개 필요할까요?`,
            answer: `${상자}개`,
            wrongs: [`${상자 - 1}개`, `${상자 + 1}개`, `${Math.floor(개수 / 한상자)}개`, `${개수}개`],
            tag: 'rounding',
            strategy: '나눗셈 상황에서 올림하기',
            hint: `${개수} ÷ ${eul(String(한상자))} 계산해 보고, 남는 도시락이 있는지 살펴보세요. 하나라도 남으면 상자가 한 개 더 필요합니다.`,
            steps: [
              `${개수} ÷ ${한상자} = ${Math.floor(개수 / 한상자)} … ${개수 % 한상자}입니다.`,
              `남은 ${개수 % 한상자}개도 담아야 하므로 상자가 한 개 더 필요합니다.`,
              `그러므로 상자는 최소 ${상자}개 필요합니다.`,
            ],
          };
        },
      },
      {
        id: 'bus',
        make: (seed) => {
          const next = rand(seed);
          const 사람 = 50 + next(250);
          const 정원 = pick([30, 40, 45], seed);
          const 대수 = Math.ceil(사람 / 정원);
          if (사람 % 정원 === 0) return null;
          return {
            prompt: `학생 ${사람}명이 버스를 타고 현장 체험 학습을 갑니다. 버스 한 대에 ${정원}명씩 탈 수 있다면 버스는 최소 몇 대 필요할까요?`,
            answer: `${대수}대`,
            wrongs: [`${대수 - 1}대`, `${대수 + 1}대`, `${Math.floor(사람 / 정원)}대`, `${정원}대`],
            tag: 'rounding',
            strategy: '나눗셈 상황에서 올림하기',
            hint: '남는 학생도 버스를 타야 합니다. 나머지가 있으면 버스가 한 대 더 필요합니다.',
            steps: [
              `${사람} ÷ ${정원} = ${Math.floor(사람 / 정원)} … ${사람 % 정원}입니다.`,
              `남은 ${사람 % 정원}명도 버스를 타야 하므로 한 대가 더 필요합니다.`,
              `그러므로 버스는 최소 ${대수}대 필요합니다.`,
            ],
          };
        },
      },
      {
        id: 'mountain',
        make: (seed) => {
          const next = rand(seed);
          const 산 = pick([
            { 이름: '한라산', 높이: '1.947' },
            { 이름: '지리산', 높이: '1.915' },
            { 이름: '설악산', 높이: '1.708' },
            { 이름: '덕유산', 높이: '1.614' },
          ], seed);
          const exp = pick(소수자리, seed + 1);
          const answer = estimate(산.높이, exp, 'ceil');
          return {
            prompt: `${산.이름}의 높이는 ${산.높이} km입니다. 이 높이를 올림하여 ${placeName(exp)}까지 나타내면 몇 km일까요?`,
            answer: `${answer} km`,
            wrongs: [
              `${estimate(산.높이, exp, 'floor')} km`,
              `${estimate(산.높이, exp, 'round')} km`,
              `${산.높이} km`,
              `${estimate(산.높이, 0, 'ceil')} km`,
            ],
            tag: 'rounding',
            strategy: '소수를 올림하여 나타내기',
            hint: `${placeName(exp)}에 밑줄을 긋고 그 아래에 남는 숫자가 있는지 보세요. 하나라도 있으면 올립니다.`,
            steps: [
              `${산.높이}에서 ${placeName(exp)} 아래의 수를 봅니다.`,
              '올림은 아래에 0이 아닌 수가 있으면 구하려는 자리를 1 크게 합니다.',
              `그러므로 ${answer} km입니다.`,
            ],
          };
        },
      },
    ];
  }

  if (mode === 'floor') {
    return [
      {
        id: 'pack',
        make: (seed) => {
          const next = rand(seed);
          const 개수 = 100 + next(900);
          const 묶음 = pick([10, 100], seed);
          const exp = 묶음 === 10 ? 1 : 2;
          if (개수 % 묶음 === 0) return null;
          const answer = estimate(String(개수), exp, 'floor');
          return {
            prompt: `공 ${개수}개를 ${묶음}개씩 포장하여 판매하려고 합니다. 포장하여 판매할 수 있는 공은 최대 몇 개일까요?`,
            answer: `${answer}개`,
            wrongs: [
              `${estimate(String(개수), exp, 'ceil')}개`,
              `${estimate(String(개수), exp, 'round')}개`,
              `${개수}개`,
              `${Number(answer) - 묶음}개`,
            ],
            tag: 'rounding',
            strategy: '버림을 활용하여 문제 해결하기',
            hint: `포장 단위가 되지 않는 나머지는 팔 수 없습니다. ${개수}개보다 작은 쪽으로 어림하세요.`,
            steps: [
              `포장 단위가 되지 않으면 포장할 수 없으므로 ${개수}보다 작은 수로 어림합니다. 이것이 버림입니다.`,
              `${eul(String(개수))} 버림하여 ${placeName(exp)}까지 나타내면 ${answer}입니다.`,
              `그러므로 최대 ${answer}개를 포장할 수 있습니다.`,
            ],
          };
        },
      },
      {
        id: 'coin',
        make: (seed) => {
          const next = rand(seed);
          const 금액 = 1000 + next(30000);
          const 지폐 = pick([1000, 10000], seed);
          const exp = 지폐 === 1000 ? 3 : 4;
          if (금액 % 지폐 === 0) return null;
          const answer = estimate(String(금액), exp, 'floor');
          return {
            prompt: `저금통에 모은 동전 ${금액}원을 ${지폐}원짜리 지폐로 바꾸려고 합니다. 최대 얼마까지 바꿀 수 있을까요?`,
            answer: `${answer}원`,
            wrongs: [
              `${estimate(String(금액), exp, 'ceil')}원`,
              `${estimate(String(금액), exp, 'round')}원`,
              `${금액}원`,
              `${Number(answer) - 지폐}원`,
            ],
            tag: 'rounding',
            strategy: '버림을 활용하여 문제 해결하기',
            hint: `지폐 한 장의 금액이 되지 않는 나머지는 바꿀 수 없습니다. ${금액}원에서 그 아래 수를 덜어 내고 생각하세요.`,
            steps: [
              `${지폐}원이 되지 않으면 지폐로 바꿀 수 없으므로 버림합니다.`,
              `${eul(String(금액))} 버림하여 ${placeName(exp)}까지 나타내면 ${answer}입니다.`,
              `그러므로 최대 ${answer}원까지 바꿀 수 있습니다.`,
            ],
          };
        },
      },
      {
        id: 'point',
        make: (seed) => {
          const next = rand(seed);
          const 점수 = 1000 + next(9000);
          const 단위 = pick([10, 100, 1000], seed);
          const exp = 단위 === 10 ? 1 : 단위 === 100 ? 2 : 3;
          if (점수 % 단위 === 0) return null;
          const answer = estimate(String(점수), exp, 'floor');
          return {
            prompt: `서점에서 책을 사고 ${점수}점을 적립하였습니다. 적립한 점수를 ${단위}점 단위로만 쓸 수 있다면 최대 몇 점까지 쓸 수 있을까요?`,
            answer: `${answer}점`,
            wrongs: [
              `${estimate(String(점수), exp, 'ceil')}점`,
              `${estimate(String(점수), exp, 'round')}점`,
              `${점수}점`,
              `${Number(answer) - 단위}점`,
            ],
            tag: 'rounding',
            strategy: '버림을 활용하여 문제 해결하기',
            hint: `쓸 수 있는 단위가 되지 않는 나머지 점수는 쓸 수 없습니다. ${점수}점보다 작은 쪽으로 어림하세요.`,
            steps: [
              `${단위}점이 되지 않으면 쓸 수 없으므로 버림합니다.`,
              `${eul(String(점수))} 버림하여 ${placeName(exp)}까지 나타내면 ${answer}입니다.`,
              `그러므로 최대 ${answer}점까지 쓸 수 있습니다.`,
            ],
          };
        },
      },
      {
        id: 'trail',
        make: (seed) => {
          const 구간 = pick([
            { 이름: '가', 거리: '18.635' },
            { 이름: '나', 거리: '12.398' },
            { 이름: '다', 거리: '15.173' },
            { 이름: '라', 거리: '9.826' },
          ], seed);
          const exp = pick([...소수자리, 0], seed + 1);
          const answer = estimate(구간.거리, exp, 'floor');
          return {
            prompt: `어느 둘레길 ${구간.이름} 구간의 거리는 ${구간.거리} km입니다. 이 거리를 버림하여 ${placeName(exp)}까지 나타내면 몇 km일까요?`,
            answer: `${answer} km`,
            wrongs: [
              `${estimate(구간.거리, exp, 'ceil')} km`,
              `${estimate(구간.거리, exp, 'round')} km`,
              `${구간.거리} km`,
              `${estimate(구간.거리, exp === 0 ? -1 : 0, 'floor')} km`,
            ],
            tag: 'rounding',
            strategy: '소수를 버림하여 나타내기',
            hint: `${placeName(exp)}까지만 남기고 그 아래 숫자는 모두 지운다고 생각해 보세요.`,
            steps: [
              `${구간.거리}에서 ${placeName(exp)} 아래의 수를 봅니다.`,
              '버림은 그 아래의 수를 모두 버립니다.',
              `그러므로 ${answer} km입니다.`,
            ],
          };
        },
      },
      {
        id: 'compare-ceil-floor',
        make: (seed) => {
          const next = rand(seed);
          const exp = pick([2, 3], seed);
          const value = 어림할자연수(seed, exp);
          const 올림 = estimate(value, exp, 'ceil');
          const 버림 = estimate(value, exp, 'floor');
          const 차 = Number(올림) - Number(버림);
          if (차 === 0) return null;
          return {
            prompt: `${eul(value)} 올림하여 ${placeName(exp)}까지 나타낸 수와 버림하여 ${placeName(exp)}까지 나타낸 수의 차는 얼마일까요?`,
            answer: String(차),
            wrongs: [올림, 버림, String(차 * 2), String(Number(value) - Number(버림))],
            tag: 'rounding',
            strategy: '올림한 값과 버림한 값 비교하기',
            hint: '두 값을 각각 구해서 나란히 적어 보세요. 올림한 값이 늘 더 큽니다.',
            steps: [
              `${eul(value)} 올림하여 ${placeName(exp)}까지 나타내면 ${올림}입니다.`,
              `${eul(value)} 버림하여 ${placeName(exp)}까지 나타내면 ${버림}입니다.`,
              `${올림} - ${버림} = ${차}입니다.`,
            ],
          };
        },
      },
    ];
  }

  // 반올림
  return [
    {
      id: 'visitors',
      make: (seed) => {
        const next = rand(seed);
        const 사람 = 10000 + next(80000);
        const exp = pick([2, 3, 4], seed);
        const answer = estimate(String(사람), exp, 'round');
        return {
          prompt: `경기를 보러 온 입장객이 ${사람}명입니다. 입장객 수를 반올림하여 ${placeName(exp)}까지 나타내면 약 몇 명일까요?`,
          answer: `약 ${answer}명`,
          wrongs: [
            `약 ${estimate(String(사람), exp, 'ceil')}명`,
            `약 ${estimate(String(사람), exp, 'floor')}명`,
            `약 ${사람}명`,
            `약 ${estimate(String(사람), exp + 1, 'round')}명`,
          ],
          tag: 'rounding',
          strategy: '반올림을 활용하여 문제 해결하기',
          hint: `${placeName(exp)} 바로 아래 자리의 숫자 하나만 보세요. 그 숫자가 5보다 작은지 아닌지가 답을 정합니다.`,
          steps: [
            `${placeName(exp)} 바로 아래 자리의 숫자는 ${digitAt(String(사람), exp - 1)}입니다.`,
            `${digitAt(String(사람), exp - 1)}${iJosa(String(digitAt(String(사람), exp - 1)))} 5 ${digitAt(String(사람), exp - 1) >= 5 ? '이상이므로 올립니다' : '미만이므로 버립니다'}.`,
            `그러므로 약 ${answer}명입니다.`,
          ],
        };
      },
    },
    {
      id: 'drone',
      make: (seed) => {
        const next = rand(seed);
        const 대수 = 1000 + next(8000);
        const answer = estimate(String(대수), 2, 'round');
        return {
          prompt: `드론 ${대수}대를 사용하여 불빛 공연을 하였습니다. 사용한 드론의 수는 약 몇천 몇백 대라고 할 수 있을까요?`,
          answer: `약 ${answer}대`,
          wrongs: [
            `약 ${estimate(String(대수), 2, 'ceil')}대`,
            `약 ${estimate(String(대수), 2, 'floor')}대`,
            `약 ${estimate(String(대수), 3, 'round')}대`,
            `약 ${대수}대`,
          ],
          tag: 'rounding',
          strategy: '가장 가깝게 어림하는 방법 고르기',
          hint: "'약 몇천 몇백'은 백의 자리까지 나타내라는 뜻입니다. 가장 가깝게 어림하려면 어떤 방법을 써야 할지 생각하세요.",
          steps: [
            '가장 가깝게 어림하는 방법은 반올림입니다.',
            `몇천 몇백으로 나타내려면 백의 자리까지 반올림합니다. 십의 자리 숫자는 ${digitAt(String(대수), 1)}입니다.`,
            `${digitAt(String(대수), 1)}${iJosa(String(digitAt(String(대수), 1)))} 5 ${digitAt(String(대수), 1) >= 5 ? '이상이므로 올려' : '미만이므로 버려'} 약 ${answer}대입니다.`,
          ],
        };
      },
    },
    {
      id: 'island',
      make: (seed) => {
        const 섬 = pick([
          { 이름: '완도', 면적: '90.074' },
          { 이름: '진도', 면적: '374.981' },
          { 이름: '울릉도', 면적: '72.859' },
          { 이름: '거제도', 면적: '378.784' },
        ], seed);
        const exp = pick([...소수자리, 0], seed + 1);
        const answer = estimate(섬.면적, exp, 'round');
        return {
          prompt: `${섬.이름}의 면적은 ${섬.면적} km²입니다. 이 면적을 반올림하여 ${placeName(exp)}까지 나타내면 몇 km²일까요?`,
          answer: `${answer} km²`,
          wrongs: [
            `${estimate(섬.면적, exp, 'ceil')} km²`,
            `${estimate(섬.면적, exp, 'floor')} km²`,
            `${섬.면적} km²`,
            `${estimate(섬.면적, exp - 1, 'round')} km²`,
          ],
          tag: 'rounding',
          strategy: '소수를 반올림하여 나타내기',
          hint: `${placeName(exp)} 바로 아래 자리의 숫자 하나에 동그라미를 치고 그것만 보세요.`,
          steps: [
            `${placeName(exp)} 바로 아래 자리의 숫자는 ${digitAt(섬.면적, exp - 1)}입니다.`,
            `${digitAt(섬.면적, exp - 1)}${iJosa(String(digitAt(섬.면적, exp - 1)))} 5 ${digitAt(섬.면적, exp - 1) >= 5 ? '이상이므로 올립니다' : '미만이므로 버립니다'}.`,
            `그러므로 ${answer} km²입니다.`,
          ],
        };
      },
    },
    {
      id: 'height',
      make: (seed) => {
        const next = rand(seed);
        const 키 = `${130 + next(40)}.${next(10)}${1 + next(9)}`;
        const exp = pick([0, -1], seed);
        const answer = estimate(키, exp, 'round');
        return {
          prompt: `어떤 학생의 키는 ${키} cm입니다. 이 키를 반올림하여 ${placeName(exp)}까지 나타내면 몇 cm일까요?`,
          answer: `${answer} cm`,
          wrongs: [
            `${estimate(키, exp, 'ceil')} cm`,
            `${estimate(키, exp, 'floor')} cm`,
            `${키} cm`,
            `${estimate(키, exp === 0 ? 1 : 0, 'round')} cm`,
          ],
          tag: 'rounding',
          strategy: '측정한 값을 반올림하여 나타내기',
          hint: '키나 몸무게처럼 잰 값은 반올림하여 나타내는 일이 많습니다. 구하려는 자리 바로 아래 자리만 보세요.',
          steps: [
            `${placeName(exp)} 바로 아래 자리의 숫자는 ${digitAt(키, exp - 1)}입니다.`,
            `${digitAt(키, exp - 1)}${iJosa(String(digitAt(키, exp - 1)))} 5 ${digitAt(키, exp - 1) >= 5 ? '이상이므로 올립니다' : '미만이므로 버립니다'}.`,
            `그러므로 ${answer} cm입니다.`,
          ],
        };
      },
    },
    {
      id: 'closer-to',
      make: (seed) => {
        const next = rand(seed);
        const exp = pick([1, 2], seed);
        const value = 어림할자연수(seed, exp);
        const 아래 = estimate(value, exp, 'floor');
        const 위 = estimate(value, exp, 'ceil');
        const answer = estimate(value, exp, 'round');
        const unit = 10 ** exp;
        if (아래 === 위) return null;
        // 한가운데에 놓인 수는 '가장 가까운 수'가 둘이 되어 물을 수
        // 없습니다. 5를 올린다는 약속은 반올림 규칙에서 따로 다룹니다.
        if ((Number(value) - Number(아래)) * 2 === unit) return null;
        return {
          // 보기 넷이 모두 눈금 위의 수라, 어느 것이 가장 가까운지
          // 재어 보아야 합니다. 두 수만 보여 주고 고르게 하면 나머지
          // 보기가 뜬금없어집니다.
          prompt: `다음 중 ${gwa(value)} 가장 가까운 수는 어느 것일까요?`,
          answer,
          wrongs: [answer === 아래 ? 위 : 아래, String(Number(아래) - unit), String(Number(위) + unit)],
          tag: 'rounding',
          strategy: '더 가까운 어림값 찾기',
          hint: `${eun(value)} 어느 두 눈금 사이에 있는지 먼저 찾고, 그 두 눈금의 한가운데 수를 구해 보세요.`,
          steps: [
            `${gwa(아래)} ${위}의 한가운데 수는 ${(Number(아래) + Number(위)) / 2}입니다.`,
            `${eun(value)} 이 수보다 ${Number(value) >= (Number(아래) + Number(위)) / 2 ? '크므로' : '작으므로'} ${answer}에 더 가깝습니다.`,
            `그러므로 반올림하여 ${placeName(exp)}까지 나타내면 ${answer}입니다.`,
          ],
        };
      },
    },
  ];
};

// ── 상 ──────────────────────────────────────────────────────────────
export const lesson567Hard = (mode: Rounding, 아는방법: Rounding[]): G5Family[] => {
  const 이름 = roundingName[mode];

  const families: G5Family[] = [
    {
      // 어림값과 참값이 얼마나 벌어지는지를 묻습니다. 지도서가 차시마다
      // '참값과 어림값이 얼마만큼 차이가 나는지 확인해 보도록 한다'고
      // 적어 둔 것을 그대로 문항으로 만든 것입니다.
      id: 'gap-from-true',
      make: (seed) => {
        const exp = pick([1, 2, 3], seed);
        const value = 어림할자연수(seed, exp);
        const 어림값 = estimate(value, exp, mode);
        const 차 = Math.abs(Number(어림값) - Number(value));
        if (차 === 0) return null;
        return {
          prompt: `${eul(value)} ${이름}하여 ${placeName(exp)}까지 나타낸 값과 처음 수의 차는 얼마일까요?`,
          answer: String(차),
          wrongs: [어림값, value, String(10 ** exp - 차), String(차 + 10 ** exp), String(10 ** exp)],
          tag: 'rounding',
          strategy: '어림값과 참값의 차 구하기',
          hint: `먼저 ${이름}한 값을 구해 처음 수 아래에 나란히 적고, 큰 수에서 작은 수를 빼 보세요.`,
          steps: [
            `${eul(value)} ${이름}하여 ${placeName(exp)}까지 나타내면 ${어림값}입니다.`,
            `${Math.max(Number(어림값), Number(value))} - ${Math.min(Number(어림값), Number(value))} = ${차}입니다.`,
            `그러므로 두 수의 차는 ${차}입니다.`,
          ],
        };
      },
    },
    {
      id: 'inverse-largest',
      make: (seed) => {
        const next = rand(seed);
        const exp = pick([2, 3], seed);
        const unit = 10 ** exp;
        const target = (2 + next(8)) * unit;
        const 범위 = mode === 'ceil'
          ? { 작은: target - unit + 1, 큰: target }
          : mode === 'floor'
            ? { 작은: target, 큰: target + unit - 1 }
            : { 작은: target - unit / 2, 큰: target + unit / 2 - 1 };
        const 큰쪽 = next(2) === 0;
        const answer = 큰쪽 ? 범위.큰 : 범위.작은;
        return {
          prompt: `어떤 자연수를 ${이름}하여 ${placeName(exp)}까지 나타내었더니 ${iJosa(String(target))} 되었습니다. 어떤 수가 될 수 있는 수 중에서 가장 ${큰쪽 ? '큰' : '작은'} 수는 무엇일까요?`,
          answer: String(answer),
          wrongs: [
            String(큰쪽 ? 범위.작은 : 범위.큰),
            String(target),
            String(answer + 1),
            String(answer - 1),
          ],
          tag: 'rounding',
          strategy: '어림한 값으로 처음 수의 범위 구하기',
          hint: `${이름}한 값이 그대로 나오는 수를 작은 것부터 차례로 몇 개 적어 보세요. 어디서 시작해 어디서 끝나는지 보입니다.`,
          steps: [
            mode === 'ceil'
              ? `올림하여 ${iJosa(String(target))} 되려면 ${target - unit}보다 크고 ${target}보다 크지 않아야 합니다.`
              : mode === 'floor'
                ? `버림하여 ${iJosa(String(target))} 되려면 ${target} 이상 ${target + unit} 미만이어야 합니다.`
                : `반올림하여 ${iJosa(String(target))} 되려면 ${범위.작은} 이상 ${범위.큰 + 1} 미만이어야 합니다.`,
            `그 범위의 자연수는 ${범위.작은}부터 ${범위.큰}까지입니다.`,
            `그러므로 가장 ${큰쪽 ? '큰' : '작은'} 수는 ${answer}입니다.`,
          ],
        };
      },
    },
    {
      id: 'two-places',
      make: (seed) => {
        const next = rand(seed);
        const value = 어림할자연수(seed, 3);
        const 백 = estimate(value, 2, mode);
        const 천 = estimate(value, 3, mode);
        const 차 = Math.abs(Number(천) - Number(백));
        if (차 === 0) return null;
        return {
          prompt: `${eul(value)} ${이름}하여 백의 자리까지 나타낸 수와 천의 자리까지 나타낸 수의 차는 얼마일까요?`,
          answer: String(차),
          wrongs: [백, 천, String(차 + 100), String(Math.abs(Number(value) - Number(백)))],
          tag: 'rounding',
          strategy: '어림하는 자리를 바꾸어 비교하기',
          hint: '두 값을 각각 구해 나란히 적어 보세요. 같은 수라도 어느 자리까지 어림하느냐에 따라 값이 달라집니다.',
          steps: [
            `${eul(value)} ${이름}하여 백의 자리까지 나타내면 ${백}입니다.`,
            `${eul(value)} ${이름}하여 천의 자리까지 나타내면 ${천}입니다.`,
            `두 수의 차는 ${Math.max(Number(천), Number(백))} - ${Math.min(Number(천), Number(백))} = ${차}입니다.`,
          ],
        };
      },
    },
    {
      id: 'card-number',
      make: (seed) => {
        const next = rand(seed);
        // 지도서 9차시 '창의적으로 해결하기'와 같은 꼴입니다.
        const target = (1 + next(8)) * 1000;
        const 범위 = mode === 'ceil'
          ? { 작은: target - 999, 큰: target }
          : mode === 'floor'
            ? { 작은: target, 큰: target + 999 }
            : { 작은: target - 500, 큰: target + 499 };
        const 개수 = 범위.큰 - 범위.작은 + 1;
        return {
          prompt: `어떤 자연수를 ${이름}하여 천의 자리까지 나타내었더니 ${iJosa(String(target))} 되었습니다. 어떤 수가 될 수 있는 자연수는 모두 몇 개일까요?`,
          answer: `${개수}개`,
          wrongs: [`${개수 - 1}개`, `${개수 + 1}개`, '1000개', `${target}개`, '100개', '999개'],
          tag: 'rounding',
          strategy: '어림한 값이 같은 수의 개수 구하기',
          hint: '가장 작은 수와 가장 큰 수를 먼저 구하고, (큰 수) - (작은 수) + 1로 세어 보세요.',
          steps: [
            `${이름}하여 ${iJosa(String(target))} 되는 수는 ${범위.작은}부터 ${범위.큰}까지입니다.`,
            `${범위.큰} - ${범위.작은} + 1 = ${개수}입니다.`,
            `그러므로 모두 ${개수}개입니다.`,
          ],
        };
      },
    },
  ];

  // '올림, 버림, 반올림 중 어떤 방법으로 어림해야 할까요'는 세 방법을
  // 모두 배운 뒤에야 물을 수 있습니다. 5차시(올림만 배운 차시)에 내면
  // 아직 배우지 않은 말을 묻는 셈이 됩니다.
  if (아는방법.length === 3) {
    families.push({
      id: 'which-method',
      make: (seed) => {
        const 상황 = pick([
          { 글: '끈 1 m로 선물 상자 하나를 묶을 수 있습니다. 선물 상자 27개를 묶으려면 끈은 최소 몇 m 사야 할까요?', 방법: 'ceil' as Rounding },
          { 글: '사탕 253개를 한 봉지에 10개씩 담아 팔려고 합니다. 팔 수 있는 사탕은 최대 몇 개일까요?', 방법: 'floor' as Rounding },
          { 글: '우리 학교 학생 수가 743명일 때 약 몇백 명이라고 하면 좋을까요?', 방법: 'round' as Rounding },
          { 글: '동전 12760원을 1000원짜리 지폐로 바꾸면 최대 얼마까지 바꿀 수 있을까요?', 방법: 'floor' as Rounding },
          { 글: '한 상자에 12개씩 담는 과자 500개를 모두 담으려면 상자는 최소 몇 개 필요할까요?', 방법: 'ceil' as Rounding },
        ], seed);
        return {
          prompt: `다음 문제를 풀려면 올림, 버림, 반올림 중 어떤 방법으로 어림해야 할까요? "${상황.글}"`,
          answer: roundingName[상황.방법],
          wrongs: 다른방법(상황.방법).map((other) => roundingName[other]).concat('어림하지 않습니다.'),
          tag: 'rounding',
          strategy: '상황에 맞는 어림 방법 고르기',
          hint: '모자라면 안 되는 상황인지, 넘치면 안 되는 상황인지, 아니면 가장 가까운 값을 말하려는 상황인지 가려 보세요.',
          steps: [
            상황.방법 === 'ceil'
              ? '모자라면 안 되는 상황입니다. 남더라도 넉넉히 준비해야 합니다.'
              : 상황.방법 === 'floor'
                ? '넘치면 안 되는 상황입니다. 단위가 되지 않는 나머지는 쓸 수 없습니다.'
                : '참값에 가장 가깝게 나타내려는 상황입니다.',
            `그러므로 ${roundingName[상황.방법]}으로 어림합니다.`,
          ],
        };
      },
    });
  }

  // '어림한 값이 같아지는 두 방법'은 세 방법을 모두 배운 뒤에만 물을 수
  // 있습니다. 올림과 버림만 아는 차시에서는 두 값이 같아지는 일이
  // 아예 없어(딱 떨어지는 수를 쓰지 않으므로) 만들어지지 않습니다.
  if (아는방법.length === 3) {
    families.push({
      id: 'compare-methods',
      make: (seed) => {
        const exp = pick([2, 3], seed);
        const value = 어림할자연수(seed, exp);
        const 값들 = 아는방법.map((method) => ({ method, value: estimate(value, exp, method) }));
        const 서로다른 = new Set(값들.map((x) => x.value));
        // 세 방법 중 어느 둘이 같은 값이 되는지를 묻습니다. 같은 값이
        // 하나도 없으면 물을 것이 없습니다.
        if (서로다른.size === 값들.length) return null;
        const 같은쌍 = 값들.filter((x, index) => 값들.some((y, j) => j !== index && y.value === x.value));
        if (같은쌍.length < 2) return null;
        const answer = 같은쌍.map((x) => roundingName[x.method]).join('과 ');
        const 다른쌍 = 값들.filter((x) => !같은쌍.includes(x));
        return {
          prompt: `${eul(value)} ${placeName(exp)}까지 어림할 때, 어림한 값이 서로 같아지는 두 방법은 무엇일까요?`,
          answer,
          wrongs: [
            다른쌍.length
              ? `${roundingName[다른쌍[0].method]}과 ${roundingName[같은쌍[0].method]}`
              : '올림과 버림',
            다른쌍.length
              ? `${roundingName[다른쌍[0].method]}과 ${roundingName[같은쌍[1].method]}`
              : '버림과 반올림',
            '세 방법이 모두 같습니다.',
            '세 방법이 모두 다릅니다.',
          ],
          tag: 'rounding',
          strategy: '어림 방법에 따른 결과 비교하기',
          hint: `${eul(value)} 세 가지 방법으로 각각 어림해 값을 나란히 적어 보세요.`,
          steps: [
            ...값들.map((x) => `${roundingName[x.method]}하여 ${placeName(exp)}까지 나타내면 ${x.value}입니다.`),
            `${answer}의 결과가 ${같은쌍[0].value}으로 서로 같습니다.`,
          ],
        };
      },
    });
  }

  return families;
};
