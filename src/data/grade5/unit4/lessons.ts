import type { G5Family } from '../build';
import { formatDecimal, mulDecimal, parseDecimal, placesOf, shiftPoint } from '../decimal';
import { eul, eun, gwa, i as iJosa, pick, rand } from '../util';

// ════════════════════════════════════════════════════════════════════
// 4단원 1차시 단원 도입 · 8차시 곱의 소수점의 위치
// ════════════════════════════════════════════════════════════════════

// ── 1차시 단원 도입 ────────────────────────────────────────────────
// 지도서가 적어 둔 선수 학습입니다.
//   · 분모가 10인 분수로 소수 알아보기 [3-1]
//   · (세 자리 수)×(두 자리 수) [4-1]
//   · 소수의 덧셈과 뺄셈, 소수 사이의 관계 [4-2]
export const unit4Lesson1Easy: G5Family[] = [
  {
    id: 'decimal-place-value',
    make: (seed) => {
      const next = rand(seed);
      const value = `${1 + next(9)}.${next(10)}${1 + next(9)}${1 + next(9)}`;
      const 자리 = next(3);
      const 자리이름 = ['소수 첫째 자리', '소수 둘째 자리', '소수 셋째 자리'];
      const digit = Number(value.split('.')[1][자리]);
      if (digit === 0) return null;
      const answer = (digit / 10 ** (자리 + 1)).toFixed(자리 + 1);
      return {
        prompt: `${value}에서 ${자리이름[자리]} 숫자가 나타내는 값은 얼마일까요?`,
        answer,
        wrongs: [
          String(digit),
          (digit / 10 ** (자리 === 0 ? 2 : 자리)).toFixed(자리 === 0 ? 2 : 자리),
          (digit / 10 ** (자리 + 2)).toFixed(자리 + 2),
          value,
        ],
        tag: 'decimal',
        strategy: '소수의 자리값 알기',
        hint: '소수점 오른쪽으로 한 칸씩 갈 때마다 자리의 크기가 1/10로 줄어듭니다. 몇 칸째인지 세어 보세요.',
        steps: [
          `${value}의 ${자리이름[자리]} 숫자는 ${digit}입니다.`,
          `${자리이름[자리]}는 ${(1 / 10 ** (자리 + 1)).toFixed(자리 + 1)}이 몇 개인지를 나타내는 자리입니다.`,
          `그러므로 ${iJosa(String(digit))} 나타내는 값은 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'ten-times',
    make: (seed) => {
      const next = rand(seed);
      const value = `${1 + next(9)}.${1 + next(9)}${1 + next(9)}`;
      const 몇배 = pick([10, 100, 0.1, 0.01], seed);
      const 칸 = 몇배 === 10 ? 1 : 몇배 === 100 ? 2 : 몇배 === 0.1 ? -1 : -2;
      const answer = shiftPoint(value, 칸);
      return {
        prompt: `${value}의 ${몇배 >= 1 ? `${몇배}배는` : `${몇배 === 0.1 ? '1/10' : '1/100'}은`} 얼마일까요?`,
        answer,
        wrongs: [
          shiftPoint(value, 칸 + 1),
          shiftPoint(value, 칸 - 1),
          value,
          shiftPoint(value, -칸),
        ],
        tag: 'decimal',
        strategy: '소수 사이의 관계 알기',
        hint: '10배가 되면 소수점이 오른쪽으로 한 칸, 1/10이 되면 왼쪽으로 한 칸 옮겨 갑니다.',
        steps: [
          칸 > 0
            ? `${몇배}배가 되면 소수점이 오른쪽으로 ${칸}칸 옮겨 갑니다.`
            : `1/${10 ** -칸}이 되면 소수점이 왼쪽으로 ${-칸}칸 옮겨 갑니다.`,
          `${value}의 소수점을 옮기면 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'decimal-add',
    make: (seed) => {
      const next = rand(seed);
      const a = parseDecimal(`${1 + next(9)}.${1 + next(9)}`);
      const b = parseDecimal(`${1 + next(9)}.${1 + next(9)}`);
      const answer = formatDecimal({ scaled: a.scaled + b.scaled, places: 1 });
      const 왼쪽 = formatDecimal(a);
      const 오른쪽 = formatDecimal(b);
      return {
        prompt: `${왼쪽} + ${eul(오른쪽)} 계산하면 얼마일까요?`,
        answer,
        wrongs: [
          formatDecimal({ scaled: a.scaled + b.scaled, places: 2 }),
          formatDecimal({ scaled: a.scaled * b.scaled, places: 2 }),
          String(Number(왼쪽.split('.')[0]) + Number(오른쪽.split('.')[0])),
          formatDecimal({ scaled: a.scaled + b.scaled + 10n, places: 1 }),
        ],
        tag: 'decimal',
        strategy: '소수의 덧셈',
        hint: '소수점의 자리를 맞추어 세로로 쓰고, 같은 자리끼리 더하세요.',
        steps: [
          '소수의 덧셈은 소수점의 자리를 맞추어 세로로 쓰고 같은 자리끼리 더합니다.',
          `${왼쪽} + ${오른쪽} = ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'decimal-compare',
    make: (seed) => {
      const next = rand(seed);
      const 정수 = 1 + next(9);
      const a = `${정수}.${next(10)}${1 + next(9)}`;
      const b = `${정수}.${next(10)}${1 + next(9)}`;
      if (a === b) return null;
      const 큰쪽 = Number(a) > Number(b) ? a : b;
      const 작은쪽 = 큰쪽 === a ? b : a;
      return {
        prompt: `${gwa(a)} ${b} 중에서 더 큰 수는 무엇일까요?`,
        answer: 큰쪽,
        wrongs: [작은쪽, String(정수), mulDecimal(a, '1'), String(정수 + 1)].filter((one) => one !== 큰쪽),
        tag: 'decimal',
        strategy: '소수의 크기 비교',
        hint: '자연수 부분부터 견주고, 같으면 소수 첫째 자리, 그다음 소수 둘째 자리를 차례로 견주세요.',
        steps: [
          `두 수의 자연수 부분은 ${정수}으로 같습니다.`,
          `소수 첫째 자리를 견주면 ${gwa(a.split('.')[1][0])} ${b.split('.')[1][0]}입니다.`,
          `차례로 견주어 보면 ${iJosa(큰쪽)} 더 큽니다.`,
        ],
      };
    },
  },
  {
    id: 'natural-product',
    make: (seed) => {
      const next = rand(seed);
      const a = 100 + next(800);
      const b = 11 + next(80);
      const answer = a * b;
      return {
        prompt: `${a} × ${eul(String(b))} 계산하면 얼마일까요?`,
        answer: String(answer),
        wrongs: [String(a * (b + 1)), String(a * (b - 1)), String(a + b), String(Math.round(answer / 10))],
        tag: 'decimal',
        strategy: '자연수의 곱셈',
        hint: '세로로 쓰고 일의 자리부터 차례로 곱한 뒤 더하세요. 소수의 곱셈도 이 계산 위에 세워집니다.',
        steps: [
          `${a} × ${eul(String(b))} 세로로 계산합니다.`,
          `${a} × ${b} = ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'decimal-as-fraction',
    make: (seed) => {
      const next = rand(seed);
      const 자리 = 1 + next(2);
      const value = 자리 === 1 ? `0.${1 + next(9)}` : `0.${next(10)}${1 + next(9)}`;
      const 분모 = 10 ** 자리;
      const 분자 = Number(value.split('.')[1]);
      const answer = `${분자}/${분모}`;
      return {
        prompt: `소수 ${eul(value)} 분수로 나타내면 얼마일까요?`,
        answer,
        wrongs: [`${분자}/${분모 * 10}`, `${분자}/${분모 / 10 || 1}`, `${분모}/${분자}`, `${분자}/10`].filter((one) => one !== answer),
        tag: 'decimal',
        strategy: '소수를 분수로 나타내기',
        hint: '소수점 아래 자리 수만큼 분모에 0이 붙습니다. 한 자리면 10, 두 자리면 100입니다.',
        steps: [
          `${eun(value)} 소수점 아래 자리 수가 ${자리}개이므로 분모가 ${분모}인 분수로 나타냅니다.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
];

// ── 8차시 곱의 소수점의 위치는 어떻게 달라질까요 ──────────────────
const 열의거듭제곱 = [10, 100, 1000];
const 십분의일 = [0.1, 0.01, 0.001];

export const 소수점위치Easy: G5Family[] = [
  {
    id: 'times-ten',
    make: (seed) => {
      const next = rand(seed);
      const value = `${1 + next(9)}.${1 + next(9)}${1 + next(9)}`;
      const 곱하는수 = 열의거듭제곱[next(3)];
      const 칸 = String(곱하는수).length - 1;
      const answer = shiftPoint(value, 칸);
      return {
        prompt: `${value} × ${eul(String(곱하는수))} 계산하면 얼마일까요?`,
        answer,
        wrongs: [shiftPoint(value, 칸 + 1), shiftPoint(value, 칸 - 1), value, shiftPoint(value, -칸)],
        tag: 'decimal',
        strategy: '10, 100, 1000을 곱할 때 소수점의 위치 알기',
        hint: '곱하는 수에 붙은 0의 개수를 세어 보세요. 그 수만큼 소수점이 오른쪽으로 옮겨 갑니다.',
        steps: [
          `${곱하는수}에는 0이 ${칸}개 붙어 있습니다.`,
          `${eul(String(곱하는수))} 곱하면 소수점이 오른쪽으로 ${칸}칸 옮겨 갑니다.`,
          `그러므로 ${value} × ${곱하는수} = ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'times-tenth',
    make: (seed) => {
      const next = rand(seed);
      const value = String(100 + next(900));
      const 곱하는수 = 십분의일[next(3)];
      const 칸 = placesOf(String(곱하는수));
      const answer = shiftPoint(value, -칸);
      return {
        prompt: `${value} × ${eul(String(곱하는수))} 계산하면 얼마일까요?`,
        answer,
        wrongs: [shiftPoint(value, -칸 - 1), shiftPoint(value, -칸 + 1), value, shiftPoint(value, 칸)],
        tag: 'decimal',
        strategy: '0.1, 0.01, 0.001을 곱할 때 소수점의 위치 알기',
        hint: '곱하는 수의 소수점 아래 자리 수를 세어 보세요. 그 수만큼 소수점이 왼쪽으로 옮겨 갑니다.',
        steps: [
          `${eun(String(곱하는수))} 소수점 아래 자리 수가 ${칸}개입니다.`,
          `${eul(String(곱하는수))} 곱하면 소수점이 왼쪽으로 ${칸}칸 옮겨 갑니다.`,
          `그러므로 ${value} × ${곱하는수} = ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'which-way',
    make: (seed) => {
      const next = rand(seed);
      const 오른쪽인가 = next(2) === 0;
      const 곱하는수 = 오른쪽인가 ? 열의거듭제곱[next(3)] : 십분의일[next(3)];
      const 칸 = 오른쪽인가 ? String(곱하는수).length - 1 : placesOf(String(곱하는수));
      const answer = `${오른쪽인가 ? '오른쪽' : '왼쪽'}으로 ${칸}칸 옮겨 갑니다.`;
      return {
        prompt: `어떤 소수에 ${eul(String(곱하는수))} 곱하면 소수점은 어느 쪽으로 몇 칸 옮겨 갈까요?`,
        answer,
        wrongs: [
          `${오른쪽인가 ? '왼쪽' : '오른쪽'}으로 ${칸}칸 옮겨 갑니다.`,
          `${오른쪽인가 ? '오른쪽' : '왼쪽'}으로 ${칸 + 1}칸 옮겨 갑니다.`,
          `${오른쪽인가 ? '오른쪽' : '왼쪽'}으로 ${Math.max(1, 칸 - 1)}칸 옮겨 갑니다.`,
          '옮겨 가지 않습니다.',
        ],
        tag: 'decimal',
        strategy: '곱의 소수점 위치가 달라지는 규칙 알기',
        hint: '1보다 큰 수를 곱하면 값이 커지고, 1보다 작은 수를 곱하면 값이 작아집니다. 소수점은 그 방향으로 옮겨 갑니다.',
        steps: [
          오른쪽인가
            ? `${eun(String(곱하는수))} 1보다 크므로 곱하면 값이 커집니다.`
            : `${eun(String(곱하는수))} 1보다 작으므로 곱하면 값이 작아집니다.`,
          오른쪽인가 ? `0이 ${칸}개이므로 소수점이 오른쪽으로 ${칸}칸 옮겨 갑니다.` : `소수점 아래 자리 수가 ${칸}개이므로 소수점이 왼쪽으로 ${칸}칸 옮겨 갑니다.`,
          `그러므로 ${answer}`,
        ],
      };
    },
  },
  {
    id: 'find-multiplier',
    make: (seed) => {
      const next = rand(seed);
      const value = `${1 + next(9)}.${1 + next(9)}${1 + next(9)}`;
      const 오른쪽인가 = next(2) === 0;
      const 곱하는수 = 오른쪽인가 ? 열의거듭제곱[next(3)] : 십분의일[next(3)];
      const 칸 = 오른쪽인가 ? String(곱하는수).length - 1 : -placesOf(String(곱하는수));
      const 결과 = shiftPoint(value, 칸);
      const 후보 = [...열의거듭제곱, ...십분의일].map(String).filter((one) => one !== String(곱하는수));
      return {
        prompt: `${value} × ▢ = ${결과}일 때 ▢에 알맞은 수는 무엇일까요?`,
        answer: String(곱하는수),
        wrongs: 후보.slice(0, 4),
        tag: 'decimal',
        strategy: '소수점이 옮겨 간 칸 수로 곱한 수 찾기',
        hint: '소수점이 어느 쪽으로 몇 칸 옮겨 갔는지 세어 보세요. 오른쪽으로 갔다면 곱한 수에 0이 그만큼 붙어 있고, 왼쪽으로 갔다면 곱한 수의 소수점 아래 자리 수가 그만큼입니다.',
        steps: [
          `${eun(value)} ${iJosa(결과)} 되었으므로 소수점이 ${오른쪽인가 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(칸)}칸 옮겨 갔습니다.`,
          오른쪽인가
            ? `소수점이 오른쪽으로 ${칸}칸 옮겨 가려면 0이 ${칸}개인 수를 곱해야 합니다.`
            : `소수점이 왼쪽으로 ${-칸}칸 옮겨 가려면 소수점 아래 자리 수가 ${-칸}개인 수를 곱해야 합니다.`,
          `그러므로 ▢에 알맞은 수는 ${곱하는수}입니다.`,
        ],
      };
    },
  },
  {
    id: 'same-digits',
    make: (seed) => {
      const next = rand(seed);
      const a = String(2 + next(8));
      const b = String(2 + next(8));
      const 자연수곱 = Number(a) * Number(b);
      const 왼쪽칸 = 1 + next(2);
      const 오른쪽칸 = 1 + next(2);
      const 왼쪽 = shiftPoint(a, -왼쪽칸);
      const 오른쪽 = shiftPoint(b, -오른쪽칸);
      const answer = mulDecimal(왼쪽, 오른쪽);
      return {
        prompt: `${a} × ${b} = ${자연수곱}입니다. 이것을 이용하여 ${왼쪽} × ${eul(오른쪽)} 구하면 얼마일까요?`,
        answer,
        wrongs: [shiftPoint(answer, 1), shiftPoint(answer, -1), String(자연수곱), shiftPoint(answer, 2)],
        tag: 'decimal',
        strategy: '자연수의 곱으로 소수의 곱 구하기',
        hint: '두 수의 소수점 아래 자리 수를 더해 보세요. 그 수만큼 곱의 소수점 아래 자리가 생깁니다.',
        steps: [
          `${eun(왼쪽)} ${a}의 1/${10 ** 왼쪽칸}배, ${eun(오른쪽)} ${b}의 1/${10 ** 오른쪽칸}배입니다.`,
          `그러므로 곱은 ${자연수곱}의 1/${10 ** (왼쪽칸 + 오른쪽칸)}배가 됩니다.`,
          `${자연수곱}의 소수점을 왼쪽으로 ${왼쪽칸 + 오른쪽칸}칸 옮기면 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'chain',
    make: (seed) => {
      const next = rand(seed);
      const value = `${1 + next(9)}.${1 + next(9)}`;
      const 칸 = 1 + next(2);
      const answer = shiftPoint(shiftPoint(value, 칸), -칸);
      return {
        prompt: `${value}에 ${eul(String(10 ** 칸))} 곱한 다음 다시 ${eul(shiftPoint('1', -칸))} 곱하면 얼마일까요?`,
        answer,
        wrongs: [shiftPoint(value, 칸), shiftPoint(value, -칸), shiftPoint(value, 칸 * 2), shiftPoint(value, -칸 * 2)],
        tag: 'decimal',
        strategy: '소수점이 옮겨 갔다가 되돌아오는 것 알기',
        hint: '소수점이 오른쪽으로 몇 칸 갔다가 다시 왼쪽으로 몇 칸 오는지 세어 보세요.',
        steps: [
          `${eul(String(10 ** 칸))} 곱하면 소수점이 오른쪽으로 ${칸}칸 옮겨 갑니다.`,
          `다시 ${eul(shiftPoint('1', -칸))} 곱하면 소수점이 왼쪽으로 ${칸}칸 되돌아옵니다.`,
          `그러므로 처음 수 그대로인 ${answer}입니다.`,
        ],
      };
    },
  },
];
