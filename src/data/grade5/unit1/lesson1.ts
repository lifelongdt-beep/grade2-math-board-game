import type { G5Family } from '../build';
import { eul, eun, gwa, i as iJosa, pick, rand } from '../util';

// ════════════════════════════════════════════════════════════════════
// 1차시 단원 도입
// ────────────────────────────────────────────────────────────────────
// 지도서의 1차시는 새 개념을 가르치지 않습니다. '떠올려 보기'로 앞서
// 배운 것을 확인하고(알맞은 단위 고르기), 만화로 수의 범위와 어림이
// 쓰이는 장면을 보여 줍니다. 진단 평가도 여기에 붙어 있고, 그 내용은
// 소수의 자리값, 소수의 크기 비교, 부등호, 가장 큰 수 찾기입니다.
//
// 그래서 이 차시의 문항은 모두 '이미 배운 것'입니다. 이상·이하나 올림·
// 버림을 여기서 물으면 아직 배우지 않은 것을 묻는 셈이 됩니다.
// ════════════════════════════════════════════════════════════════════

const 단위상황 = [
  { 것: '공책의 긴 쪽 길이', 답: 'cm', 오답: ['km', 't', 'L'] },
  { 것: '서울에서 인천까지의 거리', 답: 'km', 오답: ['cm', 'mm', 'g'] },
  { 것: '연필 한 자루의 무게', 답: 'g', 오답: ['t', 'km', 'L'] },
  { 것: '트럭 한 대의 무게', 답: 't', 오답: ['g', 'mm', 'mL'] },
  { 것: '우유갑에 든 우유의 양', 답: 'mL', 오답: ['km', 't', 'cm'] },
  { 것: '욕조에 담긴 물의 양', 답: 'L', 오답: ['mm', 'g', 'cm'] },
  { 것: '교실 문의 높이', 답: 'm', 오답: ['km', 'mL', 't'] },
  { 것: '개미 한 마리의 길이', 답: 'mm', 오답: ['km', 'm', 't'] },
];

const 소수만들기 = (seed: number) => {
  const next = rand(seed);
  return `${1 + next(9)}.${next(10)}${1 + next(9)}${1 + next(9)}`;
};

const 자리이름 = ['소수 첫째 자리', '소수 둘째 자리', '소수 셋째 자리'];

export const lesson1Easy: G5Family[] = [
  {
    id: 'unit-choice',
    make: (seed) => {
      const 상황 = pick(단위상황, seed);
      return {
        prompt: `${eul(상황.것)} 재기에 알맞은 단위는 무엇일까요?`,
        answer: 상황.답,
        wrongs: 상황.오답,
        tag: 'number',
        strategy: '알맞은 측정 단위 고르기',
        hint: '재려는 것이 길이인지, 무게인지, 들이인지 먼저 가른 다음 크기에 맞는 단위를 고르세요.',
        steps: [
          `${eun(상황.것)} ${['cm', 'mm', 'm', 'km'].includes(상황.답) ? '길이' : ['g', 't'].includes(상황.답) ? '무게' : '들이'}입니다.`,
          `그 크기에 알맞은 단위는 ${상황.답}입니다.`,
        ],
        misconceptionTip: '단위를 잘못 고르면 수가 너무 커지거나 너무 작아집니다. 답을 넣어 크기를 소리 내어 읽어 보세요.',
        selfCheck: '고른 단위로 말해 보았을 때 크기가 어색하지 않나요?',
      };
    },
  },
  {
    id: 'decimal-place-value',
    make: (seed) => {
      const value = 소수만들기(seed);
      const next = rand(seed + 1);
      const 자리 = next(3);
      const digit = Number(value.split('.')[1][자리]);
      const 값 = (digit / 10 ** (자리 + 1)).toFixed(자리 + 1);
      if (digit === 0) return null;
      return {
        prompt: `${value}에서 ${자리이름[자리]} 숫자가 나타내는 값은 얼마일까요?`,
        answer: 값,
        wrongs: [
          String(digit),
          (digit / 10 ** (자리 === 0 ? 2 : 자리)).toFixed(자리 === 0 ? 2 : 자리),
          (digit / 10 ** (자리 + 2)).toFixed(자리 + 2),
          value,
        ],
        tag: 'number',
        strategy: '소수의 자리값 알기',
        hint: '소수점 오른쪽으로 한 칸씩 갈 때마다 자리의 크기가 0.1씩 줄어듭니다. 몇 칸째인지 세어 보세요.',
        steps: [
          `${value}의 ${자리이름[자리]} 숫자는 ${digit}입니다.`,
          `${자리이름[자리]}는 ${iJosa(String((1 / 10 ** (자리 + 1)).toFixed(자리 + 1)))} 몇 개인지를 나타내는 자리입니다.`,
          `그러므로 ${iJosa(String(digit))} 나타내는 값은 ${값}입니다.`,
        ],
        misconceptionTip: '소수에서도 숫자 모양만 보면 안 됩니다. 어느 자리에 있는지가 값을 정합니다.',
      };
    },
  },
  {
    id: 'decimal-compare',
    make: (seed) => {
      const next = rand(seed);
      const 정수 = 1 + next(20);
      const a = `${정수}.${next(10)}${1 + next(9)}`;
      const b = `${정수}.${next(10)}${1 + next(9)}`;
      if (a === b) return null;
      const 큰쪽 = Number(a) > Number(b) ? a : b;
      const 작은쪽 = 큰쪽 === a ? b : a;
      return {
        prompt: `${gwa(a)} ${b} 중에서 더 큰 수는 무엇일까요?`,
        answer: 큰쪽,
        wrongs: [작은쪽, `${정수}`, (Number(a) + Number(b)).toFixed(2), `${정수 + 1}`],
        tag: 'number',
        strategy: '소수의 크기 비교하기',
        hint: '자연수 부분부터 견주고, 같으면 소수 첫째 자리, 그다음 소수 둘째 자리를 차례로 견주세요.',
        steps: [
          `두 수의 자연수 부분은 ${정수}으로 같습니다.`,
          `소수 첫째 자리를 견주면 ${gwa(a.split('.')[1][0])} ${b.split('.')[1][0]}입니다.`,
          `차례로 견주어 보면 ${iJosa(String(큰쪽))} 더 큽니다.`,
        ],
        misconceptionTip: '소수는 자리 수가 많다고 큰 수가 아닙니다. 0.9가 0.85보다 큽니다.',
      };
    },
  },
  {
    id: 'count-of-tenths',
    make: (seed) => {
      const next = rand(seed);
      // 10의 배수는 뽑지 않습니다. 0.1이 90개이면 9인데, toFixed(1)이
      // '9.0'으로 적어 버려 9와 다른 수처럼 보입니다. 풀이의 '10개씩
      // 9묶음과 0개'도 아이에게는 어색한 말입니다.
      const 뽑은수 = 11 + next(80);
      const 개수 = 뽑은수 % 10 === 0 ? 뽑은수 + 1 : 뽑은수;
      const value = (개수 / 10).toFixed(1);
      return {
        prompt: `0.1이 ${개수}개인 수는 얼마일까요?`,
        answer: value,
        wrongs: [String(개수), (개수 / 100).toFixed(2), (개수 * 10).toFixed(0), (개수 / 10 + 1).toFixed(1)],
        tag: 'number',
        strategy: '0.1의 개수로 소수 나타내기',
        hint: '0.1이 10개이면 1입니다. 10개씩 몇 묶음인지 먼저 세어 보세요.',
        steps: [
          '0.1이 10개이면 1입니다.',
          `0.1이 ${개수}개이면 10개씩 ${Math.floor(개수 / 10)}묶음과 ${개수 % 10}개입니다.`,
          `그러므로 ${value}입니다.`,
        ],
      };
    },
  },
  {
    id: 'largest-of-four',
    make: (seed) => {
      const next = rand(seed);
      const 수들 = new Set<string>();
      while (수들.size < 4) 수들.add(`${1 + next(9)}.${next(10)}${1 + next(9)}`);
      const 목록 = [...수들];
      const 가장큰 = 목록.reduce((a, b) => (Number(a) >= Number(b) ? a : b));
      return {
        prompt: `수 ${목록.join(', ')} 중에서 가장 큰 수는 무엇일까요?`,
        answer: 가장큰,
        wrongs: 목록.filter((x) => x !== 가장큰),
        tag: 'number',
        strategy: '여러 수의 크기 비교하기',
        hint: '자연수 부분이 가장 큰 수를 먼저 찾고, 같은 것이 있으면 소수 첫째 자리를 견주세요.',
        steps: [
          '자연수 부분부터 견줍니다.',
          '자연수 부분이 같으면 소수 첫째 자리, 그다음 소수 둘째 자리를 차례로 견줍니다.',
          `그러므로 가장 큰 수는 ${가장큰}입니다.`,
        ],
      };
    },
  },
];

export const lesson1Middle: G5Family[] = [
  {
    id: 'unit-convert',
    make: (seed) => {
      const next = rand(seed);
      const 짝 = pick([
        { 큰: 'km', 작은: 'm', 배: 1000 },
        { 큰: 'kg', 작은: 'g', 배: 1000 },
        { 큰: 'L', 작은: 'mL', 배: 1000 },
        { 큰: 'm', 작은: 'cm', 배: 100 },
        { 큰: 'cm', 작은: 'mm', 배: 10 },
      ], seed);
      const 값 = Number(`${1 + next(9)}.${1 + next(9)}`);
      const answer = Math.round(값 * 짝.배);
      return {
        prompt: `${값} ${짝.큰}는 몇 ${짝.작은}일까요?`,
        answer: `${answer} ${짝.작은}`,
        wrongs: [
          `${Math.round(값 * 짝.배 * 10)} ${짝.작은}`,
          `${Math.round((값 * 짝.배) / 10)} ${짝.작은}`,
          `${Math.round(값 * 짝.배 * 100)} ${짝.작은}`,
          `${값} ${짝.작은}`,
        ],
        tag: 'number',
        strategy: '단위를 바꾸어 나타내기',
        hint: `1 ${iJosa(짝.큰)} 몇 ${짝.작은}인지 먼저 적어 보세요. 그만큼씩 곱하면 됩니다.`,
        steps: [
          `1 ${짝.큰} = ${짝.배} ${짝.작은}입니다.`,
          `${값} ${짝.큰} = ${값} × ${짝.배} = ${answer}입니다.`,
          `그러므로 ${answer} ${짝.작은}입니다.`,
        ],
      };
    },
  },
  {
    id: 'compare-with-units',
    make: (seed) => {
      const next = rand(seed);
      const km = Number(`${1 + next(3)}.${1 + next(8)}`);
      const m = Math.round(km * 1000) + (next(2) === 0 ? 50 + next(200) : -(50 + next(200)));
      if (Math.round(km * 1000) === m) return null;
      const 더긴쪽 = Math.round(km * 1000) > m ? `${km} km` : `${m} m`;
      return {
        prompt: `${km} km와 ${m} m 중에서 더 긴 것은 무엇일까요?`,
        answer: 더긴쪽,
        wrongs: [더긴쪽 === `${km} km` ? `${m} m` : `${km} km`, '두 길이는 같습니다.', `${km} m`, `${m} km`],
        tag: 'number',
        strategy: '단위를 맞추어 크기 비교하기',
        hint: '단위가 다르면 바로 견줄 수 없습니다. 둘을 같은 단위로 바꾸어 적어 보세요.',
        steps: [
          `${km} km = ${Math.round(km * 1000)} m입니다.`,
          `${Math.round(km * 1000)} m와 ${m} m를 견주면 ${Math.max(Math.round(km * 1000), m)} m가 더 깁니다.`,
          `그러므로 ${iJosa(String(더긴쪽))} 더 깁니다.`,
        ],
        misconceptionTip: '단위가 다른 두 양은 수만 보고 비교하면 안 됩니다. 반드시 같은 단위로 맞추세요.',
      };
    },
  },
  {
    id: 'inequality',
    make: (seed) => {
      const next = rand(seed);
      const a = 1000 + next(9000);
      const b = a + (next(2) === 0 ? 1 + next(500) : -(1 + next(500)));
      if (a === b) return null;
      const 옳은식 = a > b ? `${a} > ${b}` : `${a} < ${b}`;
      return {
        prompt: `두 수 ${gwa(String(a))} ${b}의 크기를 바르게 비교한 것은 어느 것일까요?`,
        answer: 옳은식,
        wrongs: [a > b ? `${a} < ${b}` : `${a} > ${b}`, `${a} = ${b}`, a > b ? `${b} > ${a}` : `${b} < ${a}`],
        tag: 'number',
        strategy: '부등호로 크기 비교하기',
        hint: '부등호의 벌어진 쪽이 큰 수를 향합니다. 두 수를 자리별로 견주어 보세요.',
        steps: [
          `${gwa(String(a))} ${eul(String(b))} 높은 자리부터 차례로 견줍니다.`,
          `${iJosa(String(Math.max(a, b)))} 더 큰 수입니다.`,
          `부등호의 벌어진 쪽이 큰 수를 향하므로 ${옳은식}입니다.`,
        ],
      };
    },
  },
  {
    id: 'closest-ten',
    make: (seed) => {
      const next = rand(seed);
      const 십 = (2 + next(8)) * 10;
      const 나머지 = 1 + next(9);
      if (나머지 === 5) return null; // 한가운데는 반올림 차시에서 다룹니다.
      const value = 십 + 나머지;
      const answer = 나머지 < 5 ? 십 : 십 + 10;
      return {
        prompt: `${eun(String(value))} ${gwa(String(십))} ${십 + 10} 중 어느 쪽에 더 가까울까요?`,
        answer: String(answer),
        wrongs: [String(answer === 십 ? 십 + 10 : 십), String(value), String(십 + 20), String(십 - 10)],
        tag: 'number',
        strategy: '더 가까운 수 찾기',
        hint: `${gwa(String(십))} ${십 + 10}의 한가운데 수는 ${십 + 5}입니다. ${iJosa(String(value))} 그 수보다 큰지 작은지 보세요.`,
        steps: [
          `${gwa(String(십))} ${십 + 10}의 한가운데 수는 ${십 + 5}입니다.`,
          `${eun(String(value))} ${십 + 5}보다 ${value > 십 + 5 ? '크므로' : '작으므로'} ${answer}에 더 가깝습니다.`,
          `그러므로 답은 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'real-life-scene',
    make: (seed) => {
      const 장면 = pick([
        // 단원 도입은 생활 장면을 보여 주는 차시입니다. 다만 '이상'은
        // 다음 차시에서 처음 배우는 말이라, 뜻이 같은 '부터'로 적습니다.
        { 글: '놀이기구 앞에 "키가 130 cm부터 탈 수 있습니다"라고 쓰여 있습니다.', 답: '수의 범위를 나타낸 것입니다.' },
        { 글: '뉴스에서 "오늘 경기장을 찾은 관중은 약 5만 명"이라고 말합니다.', 답: '어림한 값을 나타낸 것입니다.' },
        { 글: '엘리베이터 안에 "정원 15명, 최대 하중 1000 kg"이라고 쓰여 있습니다.', 답: '수의 범위를 나타낸 것입니다.' },
        { 글: '지도에 두 도시 사이의 거리가 "약 120 km"라고 적혀 있습니다.', 답: '어림한 값을 나타낸 것입니다.' },
      ], seed);
      return {
        prompt: `다음은 생활에서 수가 쓰인 장면입니다. 이것은 무엇을 나타낸 것일까요? "${장면.글}"`,
        answer: 장면.답,
        wrongs: [
          장면.답 === '수의 범위를 나타낸 것입니다.' ? '어림한 값을 나타낸 것입니다.' : '수의 범위를 나타낸 것입니다.',
          '물건의 개수를 정확히 센 것입니다.',
          '두 수의 합을 구한 것입니다.',
        ],
        tag: 'number',
        strategy: '생활 속에서 수의 범위와 어림 찾기',
        // 이 차시는 단원 도입입니다. 지도서가 보여 주는 생활 장면에
        // '이상'이 적혀 있는 것까지는 그대로 두되, 볼 곳과 풀이가 그
        // 말의 뜻을 미리 가르치면 안 됩니다 — '이상'과 '이하'는 다음
        // 차시에서 처음 배웁니다.
        hint: '어디부터 어디까지인지를 못박아 말하고 있는지, 아니면 대략 얼마쯤이라고 말하고 있는지 살펴보세요.',
        steps: [
          장면.답 === '수의 범위를 나타낸 것입니다.'
            ? '들어갈 수 있는 수가 어디까지인지를 못박아 말하고 있으므로 수의 범위입니다.'
            : "'약'이라는 말이 붙어 정확한 값이 아니라 가까운 값을 말하고 있으므로 어림한 값입니다.",
          `그러므로 ${장면.답}`,
        ],
      };
    },
  },
];

export const lesson1Hard: G5Family[] = [
  {
    id: 'make-largest-decimal',
    make: (seed) => {
      const next = rand(seed);
      const 카드 = new Set<number>();
      while (카드.size < 4) 카드.add(1 + next(9));
      const 목록 = [...카드];
      const 내림차순 = [...목록].sort((a, b) => b - a);
      const 오름차순 = [...목록].sort((a, b) => a - b);
      const 가장큰 = next(2) === 0;
      const 정렬 = 가장큰 ? 내림차순 : 오름차순;
      const answer = `${정렬[0]}${정렬[1]}.${정렬[2]}${정렬[3]}`;
      const 반대 = 가장큰
        ? `${오름차순[0]}${오름차순[1]}.${오름차순[2]}${오름차순[3]}`
        : `${내림차순[0]}${내림차순[1]}.${내림차순[2]}${내림차순[3]}`;
      return {
        prompt: `수 카드 ${eul(String(목록.join(', ')))} 한 번씩만 사용하여 □□.□□ 모양의 소수를 만들려고 합니다. 만들 수 있는 가장 ${가장큰 ? '큰' : '작은'} 수는 무엇일까요?`,
        answer,
        wrongs: [반대, `${정렬[0]}${정렬[2]}.${정렬[1]}${정렬[3]}`, `${정렬[1]}${정렬[0]}.${정렬[2]}${정렬[3]}`, `${정렬[3]}${정렬[2]}.${정렬[1]}${정렬[0]}`],
        tag: 'number',
        strategy: '조건에 맞는 수 만들기',
        hint: `가장 높은 자리부터 채웁니다. 가장 ${가장큰 ? '큰' : '작은'} 수를 만들려면 높은 자리에 ${가장큰 ? '큰' : '작은'} 숫자를 놓으세요.`,
        steps: [
          `자리의 크기는 십의 자리 > 일의 자리 > 소수 첫째 자리 > 소수 둘째 자리 차례입니다.`,
          `가장 ${가장큰 ? '큰' : '작은'} 수를 만들려면 높은 자리부터 ${가장큰 ? '큰' : '작은'} 숫자를 차례로 놓습니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'blank-inequality',
    make: (seed) => {
      const next = rand(seed);
      const 백 = 1 + next(8);
      const 뒤 = 10 + next(80);
      const 기준 = Number(`${백}${뒤}`);
      // □가 백의 자리인 세 자리 수 □뒤 꼴에서 기준보다 큰 가장 작은 숫자
      const answer = 백 + 1;
      if (answer > 9) return null;
      // 오답도 문제의 조건(1부터 9까지)을 지켜야 합니다. 조건을 벗어난
      // 보기는 계산하지 않아도 지워지고, 무엇보다 '10도 숫자 하나'라는
      // 잘못된 생각을 남깁니다.
      const 오답들 = [백, answer + 1, 백 - 1, 9, 1, 백 + 2]
        .filter((one) => one >= 1 && one <= 9 && one !== answer)
        .map(String);
      return {
        prompt: `식 '${기준} < □${뒤}'이 참이 되도록 □ 안에 1부터 9까지의 숫자를 넣으려고 합니다. 넣을 수 있는 가장 작은 숫자는 무엇일까요?`,
        answer: String(answer),
        wrongs: [...new Set(오답들)],
        tag: 'number',
        strategy: '조건을 만족하는 숫자 찾기',
        hint: `뒤의 두 자리 ${eun(String(뒤))} 양쪽이 같습니다. 그러면 앞자리 숫자만 견주면 됩니다.`,
        steps: [
          `두 수의 뒤 두 자리는 ${뒤}로 같습니다.`,
          `그러므로 앞자리가 ${백}보다 커야 식이 참이 됩니다.`,
          `1부터 9까지의 숫자 중 ${백}보다 큰 가장 작은 숫자는 ${answer}입니다.`,
        ],
        misconceptionTip: `□에 ${eul(String(백))} 넣으면 두 수가 같아져 '<'가 성립하지 않습니다.`,
      };
    },
  },
  {
    id: 'decimal-between',
    make: (seed) => {
      const next = rand(seed);
      const 정수 = 1 + next(8);
      const a = Number(`${정수}.${1 + next(4)}`);
      const b = Number((a + 0.3).toFixed(1));
      const answer = ((a + b) / 2).toFixed(2);
      return {
        prompt: `${a}보다 크고 ${b}보다 작은 소수 두 자리 수는 어느 것일까요?`,
        answer,
        wrongs: [a.toFixed(2), b.toFixed(2), (a - 0.05).toFixed(2), (b + 0.05).toFixed(2)],
        tag: 'number',
        strategy: '두 수 사이의 수 찾기',
        hint: `${gwa(String(a))} ${eul(String(b))} 소수 두 자리 수로 바꾸어 적어 보세요. 그 사이의 수를 찾기 쉬워집니다.`,
        steps: [
          `${eun(String(a))} ${a.toFixed(2)}, ${eun(String(b))} ${b.toFixed(2)}입니다.`,
          `${a.toFixed(2)}보다 크고 ${b.toFixed(2)}보다 작은 소수 두 자리 수를 찾습니다.`,
          `${eun(answer)} 두 수 사이에 있으므로 답이 됩니다.`,
        ],
        misconceptionTip: "'보다 크고'는 그 수 자신을 넣지 않는다는 뜻입니다. 양 끝의 수는 답이 될 수 없습니다.",
      };
    },
  },
  {
    id: 'unit-sum',
    make: (seed) => {
      const next = rand(seed);
      const m = 1 + next(4);
      const cm = 10 + next(80);
      const 전체cm = m * 100 + cm;
      return {
        prompt: `길이가 ${m} m ${cm} cm인 끈이 있습니다. 이 끈의 길이는 모두 몇 cm일까요?`,
        answer: `${전체cm} cm`,
        wrongs: [`${m + cm} cm`, `${m * 10 + cm} cm`, `${m * 1000 + cm} cm`, `${전체cm + 100} cm`],
        tag: 'number',
        strategy: '단위를 하나로 모아 나타내기',
        hint: '1 m가 몇 cm인지 먼저 적고, m 부분만 cm로 바꾼 다음 더하세요.',
        steps: [
          '1 m = 100 cm입니다.',
          `${m} m = ${m} × 100 = ${m * 100} cm입니다.`,
          `${m * 100} + ${cm} = ${전체cm}이므로 모두 ${전체cm} cm입니다.`,
        ],
      };
    },
  },
];
