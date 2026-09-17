import { describe, expect, it } from 'vitest';
import { curriculum5 } from '../curriculum5';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Lesson, Question, QuestionVisual } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 5-2 문항 검사
// ────────────────────────────────────────────────────────────────────
// 선생님이 말한 그대로입니다 — 답이 틀리거나 문제가 틀리거나 해설이
// 틀리면 아이가 그것을 배웁니다. 그래서 사람이 눈으로 읽어 찾는 데
// 기대지 않고, 문항이 내놓은 답을 여기서 '다시' 계산해 맞춰 봅니다.
//
// 다시 계산할 때는 문항이 쓰는 함수(util.ts의 estimate)를 쓰지 않습니다.
// 같은 함수를 두 번 부르면 그 함수가 틀렸을 때 둘 다 똑같이 틀립니다.
// 여기서는 자릿수를 하나씩 손으로 옮기는 다른 방법으로 셉니다.
// ════════════════════════════════════════════════════════════════════

type Rounding = 'ceil' | 'floor' | 'round';

// 어림의 독립 구현입니다. util.ts는 BigInt 나눗셈으로 셈하고,
// 여기서는 숫자 배열을 직접 올려 가며 셈합니다.
const refEstimate = (value: string, exp: number, mode: Rounding): string => {
  const [whole, fractionRaw = ''] = value.split('.');
  const outDecimals = Math.max(0, -exp);
  const decimals = Math.max(fractionRaw.length, outDecimals);
  const fraction = fractionRaw.padEnd(decimals, '0');
  const digits = `${whole}${fraction}`.split('').map(Number);
  const index = digits.length - 1 - (exp + decimals);
  if (index < 0) throw new Error(`자리가 수보다 큽니다: ${value} ${exp}`);

  const below = digits.slice(index + 1);
  const keep = digits.slice(0, index + 1);
  const up = mode === 'ceil'
    ? below.some((digit) => digit !== 0)
    : mode === 'floor'
      ? false
      : below.length > 0 && below[0] >= 5;

  if (up) {
    let cursor = keep.length - 1;
    while (cursor >= 0) {
      keep[cursor] += 1;
      if (keep[cursor] === 10) {
        keep[cursor] = 0;
        cursor -= 1;
      } else break;
    }
    if (cursor < 0) keep.unshift(1);
  }

  const all = [...keep, ...below.map(() => 0)];
  const wholeLength = all.length - decimals;
  const wholeText = String(Number(all.slice(0, wholeLength).join('')));
  if (outDecimals === 0) return wholeText;
  return `${wholeText}.${all.slice(wholeLength).join('').slice(0, outDecimals)}`;
};

// ── 분수 ────────────────────────────────────────────────────────────
// fraction.ts를 부르지 않고 여기서 다시 만듭니다. 같은 함수를 두 번
// 부르면 그 함수가 틀렸을 때 둘 다 똑같이 틀립니다.
type Ratio = { n: number; d: number };

const reduce = (n: number, d: number): Ratio => {
  // 소인수로 하나씩 나눕니다. fraction.ts의 유클리드 호제법과 다른 길입니다.
  let top = n;
  let bottom = d;
  for (let factor = 2; factor <= Math.min(Math.abs(top), bottom); factor += 1) {
    while (top % factor === 0 && bottom % factor === 0) {
      top /= factor;
      bottom /= factor;
    }
  }
  return { n: top, d: bottom };
};

const readFraction = (input: string): Ratio | null => {
  const trimmed = input.trim();
  const mixedHit = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(trimmed);
  if (mixedHit) {
    const w = Number(mixedHit[1]);
    const n = Number(mixedHit[2]);
    const d = Number(mixedHit[3]);
    return reduce(w * d + n, d);
  }
  const fracHit = /^(\d+)\/(\d+)$/.exec(trimmed);
  if (fracHit) return reduce(Number(fracHit[1]), Number(fracHit[2]));
  const wholeHit = /^(\d+)$/.exec(trimmed);
  if (wholeHit) return { n: Number(wholeHit[1]), d: 1 };
  return null;
};

// 대분수의 '과/와'도 소리에 맞춰야 합니다. 1 일과, 2 이와, 3 삼과 …
const 받침있는수 = (value: number) => [true, true, false, true, false, false, true, true, true, false][value % 10];

const writeFraction = ({ n, d }: Ratio): string => {
  if (d === 1) return String(n);
  if (n < d) return `${n}/${d}`;
  const front = Math.floor(n / d);
  const rest = n - front * d;
  return rest === 0 ? String(front) : `${front}${받침있는수(front) ? '과' : '와'} ${rest}/${d}`;
};

const multiply = (a: Ratio, b: Ratio): Ratio => reduce(a.n * b.n, a.d * b.d);

// ── 소수 ────────────────────────────────────────────────────────────
// decimal.ts는 BigInt 곱셈으로 셈합니다. 여기서는 자릿수를 손으로
// 올려 가며 곱하는 학교 셈법으로 다시 셉니다.
const 손으로곱하기 = (a: string, b: string): string => {
  const left = a.split('').map(Number).reverse();
  const right = b.split('').map(Number).reverse();
  const result = new Array(left.length + right.length).fill(0);
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      result[i + j] += left[i] * right[j];
    }
  }
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] >= 10) {
      result[i + 1] += Math.floor(result[i] / 10);
      result[i] %= 10;
    }
  }
  const text = result.reverse().join('').replace(/^0+(?=\d)/, '');
  return text;
};

const 소수곱 = (a: string, b: string): string => {
  const 자리 = (text: string) => (text.split('.')[1] ?? '').length;
  const 숫자만 = (text: string) => text.replace('.', '');
  const places = 자리(a) + 자리(b);
  let digits = 손으로곱하기(숫자만(a), 숫자만(b));
  if (places === 0) return String(Number(digits));
  digits = digits.padStart(places + 1, '0');
  const whole = String(Number(digits.slice(0, digits.length - places)));
  const fraction = digits.slice(digits.length - places).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
};

const 소수점옮기기 = (text: string, by: number): string => {
  const [whole, fraction = ''] = text.split('.');
  const digits = whole + fraction;
  let point = whole.length + by;
  let padded = digits;
  while (point <= 0) {
    padded = `0${padded}`;
    point += 1;
  }
  while (point > padded.length) padded = `${padded}0`;
  const left = String(Number(padded.slice(0, point)));
  const right = padded.slice(point).replace(/0+$/, '');
  return right ? `${left}.${right}` : left;
};

const placeExp = (name: string): number => {
  const whole: Record<string, number> = { 일: 0, 십: 1, 백: 2, 천: 3, 만: 4 };
  const decimal: Record<string, number> = { 첫째: -1, 둘째: -2, 셋째: -3 };
  const decimalHit = /^소수 (첫째|둘째|셋째) 자리$/.exec(name);
  if (decimalHit) return decimal[decimalHit[1]];
  const wholeHit = /^(일|십|백|천|만)의 자리$/.exec(name);
  if (wholeHit) return whole[wholeHit[1]];
  throw new Error(`모르는 자리 이름: ${name}`);
};

const inAbove = (x: number, edge: number, word: string) => (word === '이상' ? x >= edge : x > edge);
const inBelow = (x: number, edge: number, word: string) => (word === '이하' ? x <= edge : x < edge);

// 문제 글을 읽어 답을 다시 구합니다. 읽을 수 있는 꼴이면 답을,
// 읽을 수 없으면 null을 돌려줍니다.
// ── 5단원 직육면체와 정육면체 ───────────────────────────────────────
// 면·모서리·꼭짓점의 수를 6, 12, 8이라고 적어 두고 견주면 문항과 같은
// 표를 두 번 쓰는 셈입니다. 그래서 여기서는 상자를 좌표로 세워 직접
// 셉니다. 꼭짓점은 (0,0,0)부터 (1,1,1)까지 여덟, 모서리는 한 자리만
// 다른 두 꼭짓점을 이은 것, 면은 한 자리가 고정된 네 꼭짓점 묶음입니다.
const 상자꼭짓점: Array<[number, number, number]> = [];
for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) 상자꼭짓점.push([x, y, z]);

const 상자모서리 = 상자꼭짓점.flatMap((a, at) =>
  상자꼭짓점.slice(at + 1).filter((b) => a.filter((one, axis) => one !== b[axis]).length === 1).map((b) => [a, b] as const),
);

const 상자면 = [0, 1, 2].flatMap((axis) =>
  [0, 1].map((value) => 상자꼭짓점.filter((one) => one[axis] === value)),
);

// 겨냥도에서 가려지는 꼭짓점 하나입니다. 그 꼭짓점에 붙은 모서리와
// 면이 보이지 않는 것입니다.
const 가려진꼭짓점: [number, number, number] = [0, 1, 0];
const 같은점 = (a: readonly number[], b: readonly number[]) => a.every((one, at) => one === b[at]);

const 상자수 = {
  면: 상자면.length,
  모서리: 상자모서리.length,
  꼭짓점: 상자꼭짓점.length,
};
const 안보이는수 = {
  면: 상자면.filter((face) => face.some((one) => 같은점(one, 가려진꼭짓점))).length,
  모서리: 상자모서리.filter(([a, b]) => 같은점(a, 가려진꼭짓점) || 같은점(b, 가려진꼭짓점)).length,
  꼭짓점: 1,
};
const 보이는수 = {
  면: 상자수.면 - 안보이는수.면,
  모서리: 상자수.모서리 - 안보이는수.모서리,
  꼭짓점: 상자수.꼭짓점 - 안보이는수.꼭짓점,
};

const 요소수 = (name: string) => 상자수[name as keyof typeof 상자수];

// ── 6단원: 평균을 나눗셈 없이 구하기 ────────────────────────────────
// 문항은 (합)÷(자료의 수)로 평균을 구합니다. 여기서 같은 나눗셈을 다시
// 하면 그 셈이 틀렸을 때 둘 다 똑같이 틀립니다. 그래서 지도서가 평균을
// 처음 꺼내는 방법 그대로, 많은 쪽에서 적은 쪽으로 하나씩 옮겨 모두
// 같아질 때까지 고르게 만듭니다. 그 높이가 평균입니다.
const 고르게하기 = (values: number[]): number | null => {
  const 칸 = [...values];
  for (let 옮긴횟수 = 0; 옮긴횟수 < 100000; 옮긴횟수 += 1) {
    let 큰자리 = 0;
    let 작은자리 = 0;
    for (let at = 1; at < 칸.length; at += 1) {
      if (칸[at] > 칸[큰자리]) 큰자리 = at;
      if (칸[at] < 칸[작은자리]) 작은자리 = at;
    }
    if (칸[큰자리] === 칸[작은자리]) return 칸[0];
    if (칸[큰자리] - 칸[작은자리] === 1) return null; // 고르게 되지 않습니다
    칸[큰자리] -= 1;
    칸[작은자리] += 1;
  }
  return null;
};

const recompute = (prompt: string): string | null => {
  let hit: RegExpExecArray | null;

  // 4605를 올림하여 백의 자리까지 나타내면 얼마일까요?
  hit = /^([\d.]+)[을를] (올림|버림|반올림)하여 (.+?)까지 나타내면 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const mode: Rounding = hit[2] === '올림' ? 'ceil' : hit[2] === '버림' ? 'floor' : 'round';
    return refEstimate(hit[1], placeExp(hit[3]), mode);
  }

  // 한라산의 높이는 1.947 km입니다. … 올림하여 소수 둘째 자리까지 …
  hit = /(\d+\.\d+) km입니다\. 이 (?:높이|거리)를 (올림|버림|반올림)하여 (.+?)까지 나타내면 몇 km일까요\?$/.exec(prompt);
  if (hit) {
    const mode: Rounding = hit[2] === '올림' ? 'ceil' : hit[2] === '버림' ? 'floor' : 'round';
    return `${refEstimate(hit[1], placeExp(hit[3]), mode)} km`;
  }
  hit = /(\d+\.\d+) km²입니다\. 이 면적을 반올림하여 (.+?)까지 나타내면 몇 km²일까요\?$/.exec(prompt);
  if (hit) return `${refEstimate(hit[1], placeExp(hit[2]), 'round')} km²`;
  hit = /키는 (\d+\.\d+) cm입니다\. 이 키를 반올림하여 (.+?)까지 나타내면 몇 cm일까요\?$/.exec(prompt);
  if (hit) return `${refEstimate(hit[1], placeExp(hit[2]), 'round')} cm`;

  // 수 18, 20, 21 중에서 20 이상인 수는 모두 몇 개일까요?
  hit = /^수 ([\d, ]+) 중에서 (\d+) (이상|이하|초과|미만)인 수는 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const values = hit[1].split(',').map((text) => Number(text.trim()));
    const edge = Number(hit[2]);
    const word = hit[3];
    const count = values.filter((value) =>
      word === '이상' || word === '초과' ? inAbove(value, edge, word) : inBelow(value, edge, word),
    ).length;
    return `${count}개`;
  }

  // 20 이상인 수 중에서 가장 작은 자연수는 무엇일까요?
  hit = /^(\d+) (이상|초과)인 수 중에서 가장 작은 자연수는 무엇일까요\?$/.exec(prompt);
  if (hit) return String(hit[2] === '이상' ? Number(hit[1]) : Number(hit[1]) + 1);
  hit = /^(\d+) (이하|미만)인 수 중에서 가장 큰 자연수는 무엇일까요\?$/.exec(prompt);
  if (hit) return String(hit[2] === '이하' ? Number(hit[1]) : Number(hit[1]) - 1);

  // 20 이하인 수 중에서 가장 큰 소수 한 자리 수는 무엇일까요?
  hit = /^(\d+) (이하|미만)인 수 중에서 가장 큰 소수 한 자리 수는 무엇일까요\?$/.exec(prompt);
  if (hit) return hit[2] === '이하' ? `${hit[1]}.0` : (Number(hit[1]) - 0.1).toFixed(1);

  // 30 이상이면서 45 이하인 자연수는 모두 몇 개일까요?
  hit = /^(\d+) (이상|초과)이면서 (\d+) (이하|미만)인 자연수는 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const from = hit[2] === '이상' ? Number(hit[1]) : Number(hit[1]) + 1;
    const to = hit[4] === '이하' ? Number(hit[3]) : Number(hit[3]) - 1;
    return `${to - from + 1}개`;
  }
  hit = /^(\d+) (이상|초과) (\d+) (이하|미만)인 자연수는 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const from = hit[2] === '이상' ? Number(hit[1]) : Number(hit[1]) + 1;
    const to = hit[4] === '이하' ? Number(hit[3]) : Number(hit[3]) - 1;
    return `${to - from + 1}개`;
  }

  // 수 12, 20, 33 중에서 20 이상 33 이하인 수에 들어가는 수는 모두 몇 개일까요?
  hit = /^수 ([\d, ]+) 중에서 (\d+) (이상|초과) (\d+) (이하|미만)인 수에 들어가는 수는 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const values = hit[1].split(',').map((text) => Number(text.trim()));
    const count = values.filter(
      (value) => inAbove(value, Number(hit![2]), hit![3]) && inBelow(value, Number(hit![4]), hit![5]),
    ).length;
    return `${count}개`;
  }

  // 학생 128명이 … 버스 한 대에 40명씩 … 버스는 최소 몇 대 필요할까요?
  hit = /학생 (\d+)명이 버스를 타고 .*버스 한 대에 (\d+)명씩 탈 수 있다면 버스는 최소 몇 대 필요할까요\?$/.exec(prompt);
  if (hit) return `${Math.ceil(Number(hit[1]) / Number(hit[2]))}대`;
  hit = /도시락 (\d+)개를 한 상자에 (\d+)개씩 담으려고 합니다\. 상자는 최소 몇 개 필요할까요\?$/.exec(prompt);
  if (hit) return `${Math.ceil(Number(hit[1]) / Number(hit[2]))}개`;

  // 배지가 352개 필요합니다. … 10개씩 묶음으로만 판다면 최소 몇 개를 사야 할까요?
  hit = /배지가 (\d+)개 필요합니다\..*배지를 (\d+)개씩 묶음으로만 판다면 최소 몇 개를 사야 할까요\?$/.exec(prompt);
  if (hit) {
    const need = Number(hit[1]);
    const pack = Number(hit[2]);
    return `${Math.ceil(need / pack) * pack}개`;
  }
  // 공 847개를 10개씩 포장하여 … 최대 몇 개일까요?
  hit = /^공 (\d+)개를 (\d+)개씩 포장하여 판매하려고 합니다\. 포장하여 판매할 수 있는 공은 최대 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const have = Number(hit[1]);
    const pack = Number(hit[2]);
    return `${Math.floor(have / pack) * pack}개`;
  }
  // 11870원을 1000원짜리 지폐로만 낸다면 최소 얼마를 내야 할까요?
  hit = /(\d+)원을 계산하려고 합니다\. (\d+)원짜리 지폐로만 낸다면 최소 얼마를 내야 할까요\?$/.exec(prompt);
  if (hit) {
    const amount = Number(hit[1]);
    const bill = Number(hit[2]);
    return `${Math.ceil(amount / bill) * bill}원`;
  }
  // 동전 18450원을 1000원짜리 지폐로 바꾸면 최대 얼마까지?
  hit = /동전 (\d+)원을 (\d+)원짜리 지폐로 바꾸려고 합니다\. 최대 얼마까지 바꿀 수 있을까요\?$/.exec(prompt);
  if (hit) {
    const amount = Number(hit[1]);
    const bill = Number(hit[2]);
    return `${Math.floor(amount / bill) * bill}원`;
  }
  // 3528점을 1000점 단위로만 쓸 수 있다면 최대 몇 점까지?
  hit = /(\d+)점을 적립하였습니다\. 적립한 점수를 (\d+)점 단위로만 쓸 수 있다면 최대 몇 점까지 쓸 수 있을까요\?$/.exec(prompt);
  if (hit) {
    const point = Number(hit[1]);
    const unit = Number(hit[2]);
    return `${Math.floor(point / unit) * unit}점`;
  }
  // 입장객이 68236명입니다. … 반올림하여 백의 자리까지 … 약 몇 명일까요?
  hit = /입장객이 (\d+)명입니다\..*반올림하여 (.+?)까지 나타내면 약 몇 명일까요\?$/.exec(prompt);
  if (hit) return `약 ${refEstimate(hit[1], placeExp(hit[2]), 'round')}명`;
  // 드론 1278대 → 약 몇천 몇백 대
  hit = /드론 (\d+)대를 사용하여.*약 몇천 몇백 대라고 할 수 있을까요\?$/.exec(prompt);
  if (hit) return `약 ${refEstimate(hit[1], 2, 'round')}대`;

  // 2/5 × 3을 계산하면 얼마일까요?
  hit = /^(\d+(?:과 \d+\/\d+)?|\d+\/\d+) × (\d+(?:과 \d+\/\d+)?|\d+\/\d+)[을를] 계산하면 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const left = readFraction(hit[1]);
    const right = readFraction(hit[2]);
    if (left && right) return writeFraction(multiply(left, right));
  }
  // 2/5 × 3 × 1/4를 계산하면 얼마일까요?
  hit = /^(\d+(?:과 \d+\/\d+)?|\d+\/\d+) × (\d+(?:과 \d+\/\d+)?|\d+\/\d+) × (\d+\/\d+)[을를] 계산하면 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const a = readFraction(hit[1]);
    const b = readFraction(hit[2]);
    const c = readFraction(hit[3]);
    if (a && b && c) return writeFraction(multiply(multiply(a, b), c));
  }
  // 대분수 1과 3/4을 가분수로 나타내면 얼마일까요?
  hit = /^대분수 (\d+)과 (\d+)\/(\d+)[을를] 가분수로 나타내면 얼마일까요\?$/.exec(prompt);
  if (hit) return `${Number(hit[1]) * Number(hit[3]) + Number(hit[2])}/${hit[3]}`;
  // 가분수 7/4를 대분수로 나타내면 얼마일까요?
  hit = /^가분수 (\d+)\/(\d+)[을를] 대분수로 나타내면 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const n = Number(hit[1]);
    const d = Number(hit[2]);
    return writeFraction({ n, d });
  }
  // 8/12를 기약분수로 나타내면 얼마일까요?
  hit = /^(\d+)\/(\d+)[을를] 기약분수로 나타내면 얼마일까요\?$/.exec(prompt);
  if (hit) return writeFraction(reduce(Number(hit[1]), Number(hit[2])));
  // 2/9 + 5/9를 계산하면 얼마일까요?
  hit = /^(\d+)\/(\d+) \+ (\d+)\/(\d+)[을를] 계산하면 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const [, a, b, c, d] = hit.map(Number);
    return writeFraction(reduce(a * d + c * b, b * d));
  }
  // 12의 1/4은 얼마일까요?
  hit = /^(\d+)의 1\/(\d+)[은는] 얼마일까요\?$/.exec(prompt);
  if (hit) return writeFraction(reduce(Number(hit[1]), Number(hit[2])));
  // 1/6이 20개인 수는 얼마일까요?
  hit = /^1\/(\d+)[이가] (\d+)개인 수는 얼마일까요\?$/.exec(prompt);
  if (hit) return writeFraction(reduce(Number(hit[2]), Number(hit[1])));

  // 0.9 × 4를 계산하면 얼마일까요?  /  2.4 × 1.5를 …
  hit = /^(\d+(?:\.\d+)?) × (\d+(?:\.\d+)?)[을를] 계산하면 얼마일까요\?$/.exec(prompt);
  if (hit) return 소수곱(hit[1], hit[2]);
  // 3.24의 10배는 얼마일까요?
  hit = /^(\d+(?:\.\d+)?)의 (10|100)배[은는] 얼마일까요\?$/.exec(prompt);
  if (hit) return 소수점옮기기(hit[1], hit[2] === '10' ? 1 : 2);
  hit = /^(\d+(?:\.\d+)?)의 1\/(10|100)[은는] 얼마일까요\?$/.exec(prompt);
  if (hit) return 소수점옮기기(hit[1], hit[2] === '10' ? -1 : -2);
  // 2.4 × 1.5의 곱은 소수점 아래 자리 수가 몇 개일까요?
  hit = /^(\d+(?:\.\d+)?) × (\d+(?:\.\d+)?)의 곱은 소수점 아래 자리 수가 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const 자리 = (text: string) => (text.split('.')[1] ?? '').length;
    return `${자리(hit[1]) + 자리(hit[2])}개`;
  }

  // 0.1이 35개인 수는 얼마일까요?
  hit = /^0\.1이 (\d+)개인 수는 얼마일까요\?$/.exec(prompt);
  if (hit) return (Number(hit[1]) / 10).toFixed(1);

  // 2.5 km는 몇 m일까요?
  hit = /^([\d.]+) (km|kg|L|m|cm)는 몇 (m|g|mL|cm|mm)일까요\?$/.exec(prompt);
  if (hit) {
    const factor: Record<string, number> = { 'km>m': 1000, 'kg>g': 1000, 'L>mL': 1000, 'm>cm': 100, 'cm>mm': 10 };
    const times = factor[`${hit[2]}>${hit[3]}`];
    if (times) return `${Math.round(Number(hit[1]) * times)} ${hit[3]}`;
  }
  // 3 m 45 cm는 모두 몇 cm일까요?
  hit = /길이가 (\d+) m (\d+) cm인 끈이 있습니다\..*모두 몇 cm일까요\?$/.exec(prompt);
  if (hit) return `${Number(hit[1]) * 100 + Number(hit[2])} cm`;

  // ── 5단원 ─────────────────────────────────────────────────────────
  hit = /^(?:직육면체|정육면체)에서 (면|모서리|꼭짓점)은 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) return `${요소수(hit[1])}개`;

  hit = /^.+?[은는] (?:직육면체|정육면체) 모양입니다\. .+?의 (면|모서리|꼭짓점)[은는] 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) return `${요소수(hit[1])}개`;

  hit = /^(?:직육면체|정육면체)의 전개도에서 면은 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) return `${요소수('면')}개`;

  hit = /^직육면체에서 (면|모서리|꼭짓점)의 수와 (면|모서리|꼭짓점)의 수의 (합|차)를? 구하면 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const left = 요소수(hit[1]);
    const right = 요소수(hit[2]);
    return `${hit[3] === '합' ? left + right : Math.abs(left - right)}`;
  }

  hit = /^직육면체의 한 꼭짓점에서 만나는 (면|모서리)[은는] 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    // 한 꼭짓점에 모이는 모서리는 그 꼭짓점과 한 자리만 다른 꼭짓점의
    // 수이고, 모이는 면은 그 꼭짓점을 품은 면의 수입니다.
    const 한점 = 상자꼭짓점[0];
    const 모이는모서리 = 상자모서리.filter(([a, b]) => 같은점(a, 한점) || 같은점(b, 한점)).length;
    const 모이는면 = 상자면.filter((face) => face.some((one) => 같은점(one, 한점))).length;
    return `${hit[1] === '모서리' ? 모이는모서리 : 모이는면}개`;
  }

  hit = /^직육면체의 겨냥도를 그렸습니다\. (보이는|보이지 않는) (면|모서리|꼭짓점)[이가] 몇 개일까요\?$/.exec(prompt);
  if (hit) {
    const 표 = hit[1] === '보이는' ? 보이는수 : 안보이는수;
    return `${표[hit[2] as keyof typeof 표]}개`;
  }

  hit = /^직육면체의 겨냥도에서 보이는 (면|모서리|꼭짓점)의 수와 보이지 않는 (?:면|모서리|꼭짓점)의 수의 (합|차)[은는] 얼마일까요\?$/.exec(prompt);
  if (hit) {
    const key = hit[1] as keyof typeof 보이는수;
    return `${hit[2] === '합' ? 보이는수[key] + 안보이는수[key] : 보이는수[key] - 안보이는수[key]}`;
  }

  hit = /^한 모서리의 길이가 (\d+) cm인 정육면체가 있습니다\. 모든 모서리의 길이의 합은 몇 cm일까요\?$/.exec(prompt);
  if (hit) return `${Number(hit[1]) * 상자수.모서리} cm`;

  hit = /^모든 모서리의 길이의 합이 (\d+) cm인 정육면체가 있습니다\. 한 모서리의 길이는 몇 cm일까요\?$/.exec(prompt);
  if (hit) return `${Number(hit[1]) / 상자수.모서리} cm`;

  hit = /^그림은 가로가 (\d+) cm, 세로가 (\d+) cm, 높이가 (\d+) cm인 직육면체의 겨냥도입니다\. 모든 모서리의 길이의 합은 몇 cm일까요\?$/.exec(prompt);
  if (hit) {
    // 길이가 같은 모서리가 몇 개씩인지도 세어서 구합니다.
    const 같은길이 = 상자모서리.filter(([a, b]) => a[0] !== b[0]).length;
    return `${(Number(hit[1]) + Number(hit[2]) + Number(hit[3])) * 같은길이} cm`;
  }

  hit = /^그림은 가로가 (\d+) cm, 세로가 (\d+) cm, 높이가 (\d+) cm인 직육면체의 전개도입니다\. 이 전개도를 접었을 때 (가로|세로|높이)를 나타내는 모서리의 길이는 몇 cm일까요\?$/.exec(prompt);
  if (hit) {
    const 값: Record<string, string> = { 가로: hit[1], 세로: hit[2], 높이: hit[3] };
    return `${값[hit[4]]} cm`;
  }

  hit = /^가로가 (\d+) cm, 세로가 (\d+) cm, 높이가 (\d+) cm인 직육면체가 있습니다\. 이 직육면체는 정육면체일까요\?$/.exec(prompt);
  if (hit) {
    const 셋 = [hit[1], hit[2], hit[3]];
    return 셋.every((one) => one === 셋[0]) ? '정육면체입니다.' : '정육면체가 아닙니다.';
  }

  hit = /^(?:직육면체|정육면체) 모양의 상자를 펼칠 때 모서리를 자른 곳은 몇 군데일까요\?$/.exec(prompt);
  if (hit) return `${상자수.모서리 - 5}군데`;

  hit = /^(?:직육면체|정육면체)의 전개도에서 잘리지 않은 모서리는 몇 군데일까요\?$/.exec(prompt);
  if (hit) return '5군데';

  // ── 6단원 평균 ────────────────────────────────────────────────────
  hit = /^(.+?)의 평균이 (\d+)(개|쪽|분|회|점|시간)이고 자료가 (\d+)개입니다\. .+?의 합은 얼마일까요\?$/.exec(prompt);
  if (hit) return `${Number(hit[2]) * Number(hit[4])}${hit[3]}`;

  hit = /^(.+?)의 합이 (\d+)(?:개|쪽|분|회|점|시간)이고 평균이 (\d+)(?:개|쪽|분|회|점|시간)입니다\. 자료는 모두 몇 개일까요\?$/.exec(prompt);
  if (hit) return `${Number(hit[2]) / Number(hit[3])}개`;

  hit = /^민아가 월요일부터 금요일까지 책을 읽은 시간은 ([\d, ]+)시간입니다\. 하루에 책을 읽은 시간의 평균은 몇 시간일까요\?$/.exec(prompt);
  if (hit) {
    const 평균값 = 고르게하기(hit[1].split(',').map((one) => Number(one.trim())));
    return 평균값 === null ? null : `${평균값}시간`;
  }

  hit = /^준호가 월요일부터 목요일까지 읽은 책의 쪽수는 ([\d, ]+)쪽입니다\. 금요일까지 5일 동안 읽은 책의 쪽수의 평균이 (\d+)쪽이 되려면 금요일에 적어도 몇 쪽을 읽어야 할까요\?$/.exec(prompt);
  if (hit) {
    const values = hit[1].split(',').map((one) => Number(one.trim()));
    return `${Number(hit[2]) * 5 - values.reduce((sum, one) => sum + one, 0)}쪽`;
  }

  hit = /^가 모둠 \d+명의 .+?[은는] ([\d, ]+)(?:개|쪽|분|회|점|시간)이고, 나 모둠 \d+명의 .+?[은는] ([\d, ]+)(?:개|쪽|분|회|점|시간)입니다\. 어느 모둠의 평균이 더 높을까요\?$/.exec(prompt);
  if (hit) {
    const 왼 = 고르게하기(hit[1].split(',').map((one) => Number(one.trim())));
    const 오른 = 고르게하기(hit[2].split(',').map((one) => Number(one.trim())));
    if (왼 === null || 오른 === null) return null;
    return 왼 === 오른 ? '두 모둠이 같습니다.' : 왼 > 오른 ? '가 모둠' : '나 모둠';
  }

  return null;
};

const lessons5 = curriculum5.flatMap((unit) => unit.lessons);
const difficulties: Difficulty[] = ['하', '중', '상'];
const every: Array<[Lesson, Difficulty, Question[]]> = lessons5.flatMap((lesson) =>
  difficulties.map((difficulty): [Lesson, Difficulty, Question[]] => [
    lesson,
    difficulty,
    generateQuestions(lesson, difficulty),
  ]),
);

describe('5-2 문항', () => {
  it.each(every.map(([lesson, difficulty, questions]) => [`${lesson.id} ${difficulty}`, questions]))(
    '%s — 서른 문항이 만들어진다',
    (_label, questions) => {
      expect((questions as Question[]).length).toBe(30);
    },
  );

  it('보기는 언제나 넷이고, 답이 꼭 하나 들어 있다', () => {
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        if (question.choices.length !== 4) broken.push(`${question.id} 보기 ${question.choices.length}개`);
        if (new Set(question.choices).size !== question.choices.length) broken.push(`${question.id} 보기 겹침 ${question.choices.join('/')}`);
        if (question.choices[question.answerIndex] !== question.answer) broken.push(`${question.id} 정답 자리 어긋남`);
        if (question.choices.filter((choice) => choice === question.answer).length !== 1) {
          broken.push(`${question.id} 정답이 여러 번`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('보기 넷이 서로 다른 값을 가리킨다', () => {
    // 글자가 달라도 값이 같으면 정답이 둘입니다. 1/2과 2/4가 함께
    // 보기에 있으면 둘 다 맞는 답이라, 아이가 무엇을 골라도 맞거나
    // 틀리게 됩니다. 분수로 읽히는 보기는 값으로 견줍니다.
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const 값들 = question.choices
          .map((choice) => readFraction(choice.replace(/\s*(개|명|일|대|가지|권|원|점|컵|도막|cm|km|kg|m²|m|g|L|mL)$/u, '')))
          .filter((one): one is Ratio => one !== null);
        for (let i = 0; i < 값들.length; i += 1) {
          for (let j = i + 1; j < 값들.length; j += 1) {
            if (값들[i].n * 값들[j].d === 값들[j].n * 값들[i].d) {
              broken.push(`${question.id}: 값이 같은 보기 — ${question.choices.join(' | ')}`);
            }
          }
        }
      }
    }
    expect([...new Set(broken)]).toEqual([]);
  });

  it('음수가 보기에 나오지 않는다', () => {
    // 초등에서는 음수를 다루지 않습니다. 뺄셈으로 오답을 만들다 보면
    // 순서에 따라 음수가 나올 수 있습니다.
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const 글 = [question.prompt, ...question.choices].join(' ');
        if (/-\d/.test(글)) broken.push(`${question.id}: ${글.slice(0, 100)}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('한 차시 안에서 같은 문제가 두 번 나오지 않는다', () => {
    // '그림이 나타내는 수의 범위는?'처럼 수가 그림에만 있는 문항은
    // 글이 같아도 다른 문제입니다. 그래서 글만이 아니라 보기까지 함께
    // 봅니다. 대신 글이 같은 두 문항은 그림이 서로 달라야 합니다 —
    // 그림까지 같으면 아이에게는 똑같은 문제입니다.
    const broken: string[] = [];
    for (const [lesson, difficulty, questions] of every) {
      const seen = new Set<string>();
      const seenVisual = new Map<string, Set<string>>();
      for (const question of questions) {
        // 보기 넷이 같아도 답과 그림이 다르면 다른 문제입니다. 25와
        // 35로 만들 수 있는 네 가지 범위를 보기로 놓고, 그림만 바꾸어
        // 어느 것인지 묻는 문항이 그렇습니다.
        const key = `${question.prompt}||${[...question.choices].sort().join('|')}||${question.answer}||${JSON.stringify(question.visual ?? null)}`;
        if (seen.has(key)) broken.push(`${lesson.id} ${difficulty}: ${question.prompt}`);
        seen.add(key);

        const drawn = JSON.stringify(question.visual ?? null);
        const sameText = seenVisual.get(question.prompt) ?? new Set<string>();
        if (question.visual && sameText.has(drawn)) {
          broken.push(`${lesson.id} ${difficulty}: 글도 그림도 같음 — ${question.prompt}`);
        }
        sameText.add(drawn);
        seenVisual.set(question.prompt, sameText);
      }
    }
    expect(broken).toEqual([]);
  });

  // 가장 중요한 검사입니다. 문제 글을 다시 읽어 답을 새로 구하고,
  // 문항이 들고 있는 답과 맞춰 봅니다.
  it('문제 글을 다시 읽어 구한 답이 문항의 답과 같다', () => {
    const broken: string[] = [];
    let checked = 0;
    for (const [, , questions] of every) {
      for (const question of questions) {
        const again = recompute(question.prompt);
        if (again === null) continue;
        checked += 1;
        if (again !== question.answer) {
          broken.push(`${question.id}\n  문제: ${question.prompt}\n  문항의 답: ${question.answer}\n  다시 구한 답: ${again}`);
        }
      }
    }
    expect(broken).toEqual([]);
    // 아무것도 읽지 못했는데 통과하는 일이 없도록 바닥을 둡니다.
    expect(checked).toBeGreaterThan(200);
  });

  it('볼 곳(힌트)이 답을 그대로 말해 주지 않는다', () => {
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const answer = question.answer.trim();
        // 한두 글자 답까지 막으면 멀쩡한 볼 곳이 거의 다 걸립니다.
        if (answer.length < 3) continue;
        if (question.support.studentHint.includes(answer)) {
          broken.push(`${question.id}: 답 "${answer}"이(가) 볼 곳에 들어 있음 — ${question.support.studentHint}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('풀이의 마지막 줄이 이 문항의 답을 말한다', () => {
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const last = question.support.steps[question.support.steps.length - 1];
        // 답에서 단위를 떼고 수(또는 낱말)만 견줍니다.
        const core = question.answer.replace(/^약 /, '').replace(/\s*(개|명|일|대|가지|권|원|점|cm|km|kg|m|g|L|mL|㎡|km²|℃)$/u, '').trim();
        if (core.length >= 1 && !last.includes(core)) {
          broken.push(`${question.id}\n  답: ${question.answer}\n  마지막 풀이: ${last}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('그림이 답이 되는 자리를 짚어 주지 않는다', () => {
    // 범위 그림에 찍는 점은 '이 수가 범위에 들어가는지 살펴보라'는
    // 뜻입니다. 그 점이 하필 답이 되는 수에 찍히면, 아이는 이상과
    // 초과를 가리지 않고도 점을 따라 답을 고릅니다.
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        if (question.visual?.kind !== 'range-line') continue;
        // 답이 수 자체일 때만 봅니다. '59 kg급'처럼 수가 이름의 일부인
        // 답은 그 수가 문제 글에 주어진 값이라 짚어 주는 것이 아닙니다.
        if (!/^\d+(\.\d+)?$/.test(question.answer.trim())) continue;
        for (const dot of question.visual.dots ?? []) {
          if (String(dot.value) === question.answer.trim()) {
            broken.push(`${question.id}: 점이 답 ${question.answer} 자리에 찍힘 — ${question.prompt}`);
          }
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('그림의 이름표가 답을 적어 두지 않는다', () => {
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const label = question.visual && 'label' in question.visual ? question.visual.label : '';
        if (question.answer.length >= 2 && label.includes(question.answer)) {
          broken.push(`${question.id}: ${label}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  // 차시가 아직 배우지 않은 말을 문제 글이나 보기에 쓰면 안 됩니다.
  it('차시가 아직 배우지 않은 말을 쓰지 않는다', () => {
    const 금지: Record<string, string[]> = {
      // 2차시는 이상·이하만 배웁니다.
      '5-2-u1-l2': ['초과', '미만', '올림하여', '버림하여', '반올림하여'],
      // 3차시는 초과·미만까지입니다. 어림은 아직입니다.
      '5-2-u1-l3': ['올림하여', '버림하여', '반올림하여'],
      '5-2-u1-l4': ['올림하여', '버림하여', '반올림하여'],
      // 5차시는 올림만 배웁니다.
      '5-2-u1-l5': ['버림', '반올림'],
      // 6차시는 올림과 버림까지입니다.
      '5-2-u1-l6': ['반올림'],
      // 1차시(단원 도입)는 아직 이 단원의 계산을 하지 않습니다. 다만
      // 지도서의 만화처럼 생활 장면을 보여 주는 것은 이 차시의 일이라,
      // 장면 속에 '이상'이 적혀 있는 것까지 막지는 않습니다.
      '5-2-u1-l1': ['올림하여', '버림하여', '반올림하여', '초과', '미만'],
    };
    const broken: string[] = [];
    for (const [lesson, , questions] of every) {
      const words = 금지[lesson.id];
      if (!words) continue;
      for (const question of questions) {
        // '올림픽'은 올림이 아닙니다. 지도서가 이 단원의 소재로 삼은
        // 말이라 문항마다 나오므로, 먼저 걷어 내고 봅니다.
        const 학생이보는글 = [question.prompt, ...question.choices].join(' ').replace(/올림픽/g, '○○○');
        for (const word of words) {
          if (학생이보는글.includes(word)) {
            broken.push(`${question.id}: '${word}' — ${question.prompt} / ${question.choices.join(' | ')}`);
          }
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('조사가 어긋나지 않는다', () => {
    // 받침이 있는 수 뒤에 '를/는/가/와', 없는 수 뒤에 '을/은/이/과'가
    // 붙으면 아이가 문제를 읽다가 걸립니다.
    const 받침있는끝 = /[013678]$/;
    const 받침없는끝 = /[2459]$/;
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const 글 = [question.prompt, question.support.studentHint, ...question.support.steps].join(' ');
        // 분수는 '분모분의 분자'로 읽으므로, 조사는 글자 차례대로 맨 뒤인
        // 분모가 아니라 분자를 따릅니다(3/5 → 오분의 삼 → '3/5과').
        // 그래서 조사 앞의 수가 분모이면 분자를 보고 따져야 합니다.
        for (const one of 글.matchAll(/(\d+)(\/)?(\d+)?(을|를|은|는|이|가|과|와)(?![가-힣])/g)) {
          const [, 앞, 빗금, 뒤, josa] = one;
          // 분수든 그냥 수든 조사를 정하는 것은 늘 앞의 수입니다.
          // 분모(뒤)는 여기서 조사와 떼어 놓기만 하면 됩니다.
          const number = 앞;
          if (빗금 && !뒤) continue;
          const 받침 = 받침있는끝.test(number);
          const 옳은것 = 받침 ? ['을', '은', '이', '과'] : ['를', '는', '가', '와'];
          if (받침있는끝.test(number) || 받침없는끝.test(number)) {
            if (!옳은것.includes(josa)) {
              broken.push(`${question.id}: "${one[0]}" — ${글.slice(0, 80)}`);
            }
          }
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('받침 뒤의 으로·이라는를 빠뜨리지 않는다', () => {
    // 받침이 있는 말 뒤에는 '으로', '이라는'가 붙습니다(ㄹ 받침은 뺍니다).
    // '25 미만로 바꾸어', '미만라는 말이'처럼 어긋나면 아이가 문장을
    // 읽다가 걸립니다. 수 뒤의 조사와 달리 이쪽은 낱말 뒤라, 글자의
    // 받침을 직접 봐야 합니다.
    const 받침 = (syllable: string) => {
      const code = syllable.charCodeAt(0);
      if (code < 0xac00 || code > 0xd7a3) return 0;
      return (code - 0xac00) % 28;
    };
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const 글 = [question.prompt, ...question.choices, question.support.studentHint, ...question.support.steps].join(' ');
        for (const [, syllable] of 글.matchAll(/([가-힣])로(?![가-힣])/g)) {
          // 8은 ㄹ 받침입니다. ㄹ 뒤에는 '로'가 맞습니다.
          if (받침(syllable) !== 0 && 받침(syllable) !== 8) {
            broken.push(`${question.id}: "${syllable}로" — 으로가 맞습니다`);
          }
        }
        for (const [, syllable] of 글.matchAll(/([가-힣])라는/g)) {
          if (받침(syllable) !== 0) broken.push(`${question.id}: "${syllable}라는" — 이라는가 맞습니다`);
        }
      }
    }
    expect([...new Set(broken)]).toEqual([]);
  });

  it('빈 목록을 말로 이어 붙이다 문장이 깨지지 않는다', () => {
    // '없습니다이 조건에 맞습니다'처럼, 비어 있을 때를 따로 쓰지 않으면
    // 조사가 낱말 뒤에 그대로 붙어 문장이 깨집니다.
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        const 글 = [question.prompt, question.support.studentHint, ...question.support.steps].join(' ');
        if (/없습니다[이가은는을를과와]/.test(글) || /undefined|NaN|\[object/.test(글)) {
          broken.push(`${question.id}: ${글.slice(0, 120)}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('같은 말이 잇달아 두 번 찍히지 않는다', () => {
    // '마름모마름모는', '2과 1/62과 1/6과'처럼 낱말 뒤에 조사를 붙이려다
    // 낱말까지 한 번 더 찍는 실수가 잦습니다. 문장 안에서 두 글자 이상이
    // 잇달아 되풀이되면 걸러 냅니다.
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        for (const 글 of [question.prompt, ...question.choices, question.support.studentHint, ...question.support.steps]) {
          // 낱말이 되풀이된 것, 수가 되풀이된 것('8.678.67'), 그리고
          // 단위 한 글자가 되풀이된 것('10배배')을 모두 봅니다.
          const hit =
            /([가-힣]{2,12})\1/.exec(글)
            // 소수가 되풀이된 것만 봅니다. 370000처럼 0이 이어지는 수는
            // 멀쩡한 수라 걸러 내면 안 됩니다.
            ?? /(\d+\.\d+)\1/.exec(글)
            ?? /(배|개|명|번|칸|쪽|원|점)\1/.exec(글);
          if (hit) broken.push(`${question.id}: "${hit[1]}"이(가) 두 번 — ${글.slice(0, 90)}`);
        }
      }
    }
    expect([...new Set(broken)]).toEqual([]);
  });

  it('그림에 적은 길이와 각도가 그 도형과 어긋나지 않는다', () => {
    // 직사각형을 그려 놓고 한 각을 107°라고 적으면, 아이는 그림과 글
    // 가운데 어느 것을 믿어야 할지 알 수 없습니다. 각이 정해진 도형과
    // 변의 길이가 정해진 도형에는 마음대로 적을 수 없습니다.
    const 각이정해진도형 = ['정사각형', '직사각형'];
    const 변이같은도형 = ['정사각형', '정삼각형', '마름모', '정오각형', '정육각형'];
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        if (question.visual?.kind !== 'figure-set') continue;
        for (const item of question.visual.items) {
          for (const angle of item.angleLabels ?? []) {
            if (각이정해진도형.includes(item.shape) && angle.text !== '90°') {
              broken.push(`${question.id}: ${item.shape}에 ${angle.text}`);
            }
          }
          const 길이들 = new Set((item.edgeLabels ?? []).map((edge) => edge.text));
          if (변이같은도형.includes(item.shape) && 길이들.size > 1) {
            broken.push(`${question.id}: ${item.shape}에 서로 다른 변의 길이 ${[...길이들].join(', ')}`);
          }
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('5학년 차시에 2학년 문항이 섞이지 않는다', () => {
    const 이학년말 = /곱셈구구|쌓기나무|칠교|받아올림|받아내림|몇십몇|뛰어 세/;
    const broken: string[] = [];
    for (const [, , questions] of every) {
      for (const question of questions) {
        if (이학년말.test(question.prompt)) broken.push(`${question.id}: ${question.prompt}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════
// 5단원 — 면 사이의 관계와 전개도를 '다른 방법으로' 다시 구해 맞춰 보기
// ────────────────────────────────────────────────────────────────────
// 문항은 box.ts가 만듭니다. box.ts는 상자를 3차원 좌표에 놓고 전개도를
// 90°씩 돌려 접습니다. 여기서 같은 방법을 다시 쓰면, 그 방법이 틀렸을 때
// 둘 다 똑같이 틀립니다.
//
// 그래서 여기서는 좌표를 쓰지 않습니다.
//   · 면 사이의 관계는 꼭짓점 이름을 좌표에 대응시켜, 네 꼭짓점이 어느
//     자리를 함께 가지는지로 봅니다.
//   · 전개도는 '주사위 굴리기'로 접습니다. 칸 하나에 주사위를 얹어 놓고
//     이웃 칸으로 굴리면, 그 칸이 상자의 어느 면이 되는지가 정해집니다.
//     좌표는 한 번도 나오지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 꼭짓점자리: Record<string, [number, number, number]> = {
  ㄱ: [0, 1, 1], ㄴ: [0, 0, 1], ㄷ: [1, 0, 1], ㄹ: [1, 1, 1],
  ㅁ: [0, 1, 0], ㅂ: [0, 0, 0], ㅅ: [1, 0, 0], ㅇ: [1, 1, 0],
};

/** 네 꼭짓점이 한 면을 이루면 그 면이 붙어 있는 축과 값을 돌려줍니다. */
const 면자리 = (letters: string): { axis: number; value: number } | null => {
  const points = [...letters].map((one) => 꼭짓점자리[one]);
  if (points.length !== 4 || points.some((one) => !one)) return null;
  for (const axis of [0, 1, 2]) {
    const value = points[0][axis];
    if (points.every((one) => one[axis] === value)) return { axis, value };
  }
  return null;
};

const 면관계 = (a: string, b: string): '같은면' | '평행' | '수직' | null => {
  const left = 면자리(a);
  const right = 면자리(b);
  if (!left || !right) return null;
  if (left.axis !== right.axis) return '수직';
  return left.value === right.value ? '같은면' : '평행';
};

// ── 주사위 굴리기로 전개도 접기 ─────────────────────────────────────
// 면은 0~5로 적고, 마주 보는 면은 1을 더하거나 빼서 짝을 짓습니다
// (0↔1, 2↔3, 4↔5). 칸마다 세 가지를 들고 다닙니다.
//   F 이 칸이 되는 면
//   U 이 칸의 위쪽 모서리 너머에 있는 면
//   R 이 칸의 오른쪽 모서리 너머에 있는 면
// 오른쪽 칸으로 넘어가면 그 칸은 R이 되고, 왼쪽 너머가 지금 칸이 되므로
// R은 F의 맞은편이 됩니다. 위아래도 같은 식입니다.
const 맞은편 = (face: number) => face ^ 1;

type 굴린칸 = { col: number; row: number; F: number; U: number; R: number };

const 굴리기 = (cells: Array<{ col: number; row: number }>): 굴린칸[] | null => {
  const 자리 = new Map<string, number>();
  cells.forEach((cell, at) => 자리.set(`${cell.col},${cell.row}`, at));
  const 놓인것: Array<굴린칸 | null> = cells.map(() => null);
  놓인것[0] = { ...cells[0], F: 0, U: 2, R: 4 };
  const 줄 = [0];
  while (줄.length) {
    const at = 줄.shift() as number;
    const here = 놓인것[at] as 굴린칸;
    const 갈곳: Array<{ dc: number; dr: number; next: { F: number; U: number; R: number } }> = [
      { dc: 1, dr: 0, next: { F: here.R, U: here.U, R: 맞은편(here.F) } },
      { dc: -1, dr: 0, next: { F: 맞은편(here.R), U: here.U, R: here.F } },
      { dc: 0, dr: 1, next: { F: 맞은편(here.U), U: here.F, R: here.R } },
      { dc: 0, dr: -1, next: { F: here.U, U: 맞은편(here.F), R: here.R } },
    ];
    for (const one of 갈곳) {
      const to = 자리.get(`${here.col + one.dc},${here.row + one.dr}`);
      if (to === undefined || 놓인것[to]) continue;
      놓인것[to] = { ...cells[to], ...one.next };
      줄.push(to);
    }
  }
  return 놓인것.every(Boolean) ? (놓인것 as 굴린칸[]) : null;
};

/** 격자 위의 한 점이 상자의 어느 꼭짓점이 되는지입니다. 세 면의 이름으로 적습니다. */
const 점이름 = (
  visual: Extract<QuestionVisual, { kind: 'box-net' }>,
   굴린: 굴린칸[],
): Map<string, string> => {
  const 앞까지 = (sizes: number[], upto: number) => sizes.slice(0, upto).reduce((sum, one) => sum + one, 0);
  const out = new Map<string, string>();
  for (const cell of 굴린) {
    const x = 앞까지(visual.cols, cell.col);
    const y = 앞까지(visual.rows, cell.row);
    const w = visual.cols[cell.col];
    const h = visual.rows[cell.row];
    const 네모퉁이: Array<[number, number, number[]]> = [
      [x, y, [cell.F, cell.U, 맞은편(cell.R)]],
      [x + w, y, [cell.F, cell.U, cell.R]],
      [x + w, y + h, [cell.F, 맞은편(cell.U), cell.R]],
      [x, y + h, [cell.F, 맞은편(cell.U), 맞은편(cell.R)]],
    ];
    for (const [px, py, faces] of 네모퉁이) {
      const name = [...faces].sort((a, b) => a - b).join('');
      const already = out.get(`${px},${py}`);
      // 한 점을 여러 칸이 나누어 가지더라도 접으면 한 꼭짓점이어야 합니다.
      if (already && already !== name) return new Map();
      out.set(`${px},${py}`, name);
    }
  }
  return out;
};

describe('5-2 5단원 — 다른 방법으로 다시 구해 보기', () => {
  const 다섯단원 = every.filter(([lesson]) => lesson.unitNo === 5);

  it('5단원 차시가 모두 문항을 내놓는다', () => {
    expect(다섯단원.length).toBe(7 * 3);
    for (const [, , questions] of 다섯단원) expect(questions.length).toBe(30);
  });

  it('평행한 면과 수직인 면을 꼭짓점 이름에서 다시 구해도 답이 같다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 다섯단원) {
      for (const question of questions) {
        const 물음 = /색칠한 면 ([ㄱ-ㅇ]{4})[과와] (평행한 면|수직인 면이 아닌 것|수직인 면)/.exec(question.prompt)
          ?? /색칠한 면 ([ㄱ-ㅇ]{4})[을를] 한 밑면으로 정했습니다\. (옆면이 아닌 면)/.exec(question.prompt);
        if (!물음) continue;
        본것 += 1;
        const 기준 = 물음[1];
        if (!면자리(기준)) {
          broken.push(`${question.id}: 면 ${기준}은 직육면체의 면이 아닙니다`);
          continue;
        }
        if (물음[2] === '수직인 면') {
          // 몇 개인지 묻는 문항입니다. 여섯 면 가운데 기준과 수직인 것을 셉니다.
          const 모든면 = Object.keys(꼭짓점자리);
          let 셈 = 0;
          for (const axis of [0, 1, 2]) {
            for (const value of [0, 1]) {
              const letters = 모든면.filter((one) => 꼭짓점자리[one][axis] === value).join('');
              if (면관계(기준, letters) === '수직') 셈 += 1;
            }
          }
          if (question.answer !== `${셈}개`) broken.push(`${question.id}: 수직인 면 ${셈}개인데 답이 ${question.answer}`);
          continue;
        }
        // 답은 기준과 평행한 면이어야 하고, 오답은 모두 수직이거나 기준 자신이어야 합니다.
        const 답letters = /면 ([ㄱ-ㅇ]{4})/.exec(question.answer)?.[1] ?? '';
        if (면관계(기준, 답letters) !== '평행') {
          broken.push(`${question.id}: ${question.prompt} → 답 ${question.answer}는 평행한 면이 아닙니다`);
        }
        for (const choice of question.choices) {
          if (choice === question.answer) continue;
          const letters = /면 ([ㄱ-ㅇ]{4})/.exec(choice)?.[1] ?? '';
          const 관계 = 면관계(기준, letters);
          if (관계 !== '수직' && 관계 !== '같은면') {
            broken.push(`${question.id}: 오답 ${choice}가 기준과 ${관계}입니다`);
          }
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(30);
  });

  it('전개도를 주사위 굴리기로 다시 접어도 만나는 점과 겹치는 선분이 같다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 다섯단원) {
      for (const question of questions) {
        const visual = question.visual;
        if (!visual || visual.kind !== 'box-net') continue;
        const 굴린 = 굴리기(visual.cells);
        if (!굴린) {
          // 접을 수 없는 그림은 '전개도가 될 수 없다'를 묻는 문항뿐입니다.
          continue;
        }
        const 이름 = 점이름(visual, 굴린);

        const 만남 = /접었을 때 점 ([ㄱ-ㅎ])[과와] 만나는 점은/.exec(question.prompt);
        if (만남 && visual.points) {
          본것 += 1;
          if (!이름.size) {
            broken.push(`${question.id}: 접어 보니 한 점이 두 꼭짓점이 됩니다`);
            continue;
          }
          const 자리 = new Map(visual.points.map((one) => [one.text, 이름.get(`${one.x},${one.y}`)]));
          const 기준 = 자리.get(만남[1]);
          const 만나는것 = visual.points
            .filter((one) => one.text !== 만남[1] && 자리.get(one.text) === 기준)
            .map((one) => `점 ${one.text}`);
          if (만나는것.length !== 1) {
            broken.push(`${question.id}: 점 ${만남[1]}과 만나는 점이 ${만나는것.length}개입니다`);
          } else if (만나는것[0] !== question.answer) {
            broken.push(`${question.id}: ${question.prompt} → 다시 구하니 ${만나는것[0]}인데 답은 ${question.answer}`);
          }
        }

        const 겹침 = /접었을 때 선분 ([ㄱ-ㅎ])([ㄱ-ㅎ])[과와] 겹치는 선분은/.exec(question.prompt);
        if (겹침 && visual.points) {
          본것 += 1;
          const 앞까지 = (sizes: number[], upto: number) => sizes.slice(0, upto).reduce((sum, one) => sum + one, 0);
          const 자리 = new Map(visual.points.map((one) => [one.text, `${one.x},${one.y}`]));
          const 있는칸 = new Set(visual.cells.map((one) => `${one.col},${one.row}`));
          // 바깥 테두리를 모읍니다. 이웃 칸이 없는 쪽이 잘린 모서리입니다.
          const 테두리: Array<{ a: string; b: string }> = [];
          for (const cell of visual.cells) {
            const x = 앞까지(visual.cols, cell.col);
            const y = 앞까지(visual.rows, cell.row);
            const w = visual.cols[cell.col];
            const h = visual.rows[cell.row];
            const 네변: Array<{ dc: number; dr: number; a: string; b: string }> = [
              { dc: 0, dr: -1, a: `${x},${y}`, b: `${x + w},${y}` },
              { dc: 1, dr: 0, a: `${x + w},${y}`, b: `${x + w},${y + h}` },
              { dc: 0, dr: 1, a: `${x},${y + h}`, b: `${x + w},${y + h}` },
              { dc: -1, dr: 0, a: `${x},${y}`, b: `${x},${y + h}` },
            ];
            for (const side of 네변) {
              if (있는칸.has(`${cell.col + side.dc},${cell.row + side.dr}`)) continue;
              테두리.push({ a: side.a, b: side.b });
            }
          }
          const 모서리이름 = (one: { a: string; b: string }) =>
            [이름.get(one.a) ?? '?', 이름.get(one.b) ?? '?'].sort().join('|');
          const 물은자리 = [자리.get(겹침[1]) ?? '', 자리.get(겹침[2]) ?? ''];
          const 물은변 = 테두리.find(
            (one) => (one.a === 물은자리[0] && one.b === 물은자리[1]) || (one.a === 물은자리[1] && one.b === 물은자리[0]),
          );
          if (!물은변) {
            broken.push(`${question.id}: 선분 ${겹침[1]}${겹침[2]}이 테두리에 없습니다`);
            continue;
          }
          const 이름찾기 = new Map([...자리].map(([text, spot]) => [spot, text]));
          const 짝 = 테두리.filter((one) => one !== 물은변 && 모서리이름(one) === 모서리이름(물은변));
          if (짝.length !== 1) {
            broken.push(`${question.id}: 겹치는 선분이 ${짝.length}개입니다`);
            continue;
          }
          const 짝이름 = [이름찾기.get(짝[0].a) ?? '?', 이름찾기.get(짝[0].b) ?? '?'];
          const 답letters = /선분 ([ㄱ-ㅎ])([ㄱ-ㅎ])/.exec(question.answer);
          if (!답letters || [답letters[1], 답letters[2]].sort().join('') !== [...짝이름].sort().join('')) {
            broken.push(`${question.id}: ${question.prompt} → 다시 구하니 선분 ${짝이름.join('')}인데 답은 ${question.answer}`);
          }
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(20);
  });

  it('마주 보는 면을 주사위 굴리기로 다시 구해도 답이 같다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 다섯단원) {
      for (const question of questions) {
        const visual = question.visual;
        if (!visual || visual.kind !== 'box-net') continue;
        const 굴린 = 굴리기(visual.cells);
        if (!굴린) continue;

        const 면물음 = /접었을 때 색칠한 면 ([가-바])[과와] 마주 보는 면은/.exec(question.prompt);
        if (면물음) {
          본것 += 1;
          const 물은칸 = visual.cells.findIndex((one) => one.text === 면물음[1]);
          const 답이름 = /면 ([가-바])/.exec(question.answer)?.[1] ?? '';
          const 답칸 = visual.cells.findIndex((one) => one.text === 답이름);
          if (물은칸 < 0 || 답칸 < 0) {
            broken.push(`${question.id}: 그림에 면 ${면물음[1]} 또는 면 ${답이름}이 없습니다`);
            continue;
          }
          if (visual.cells[물은칸].shade !== 1) {
            broken.push(`${question.id}: 물은 면에 색칠이 되어 있지 않습니다`);
          }
          if (굴린[답칸].F !== 맞은편(굴린[물은칸].F)) {
            broken.push(`${question.id}: ${question.prompt} → 면 ${답이름}은 마주 보는 면이 아닙니다`);
          }
        }

        const 주사위 = /주사위는 마주 보는 두 면의 눈의 수의 합이 7입니다/.test(question.prompt);
        if (주사위) {
          본것 += 1;
          const 물은칸 = visual.cells.findIndex((one) => one.shade === 1);
          const 답칸 = 굴린.findIndex((one) => one.F === 맞은편(굴린[물은칸].F));
          const 물은눈 = Number(visual.cells[물은칸].text);
          const 답눈 = Number(visual.cells[답칸].text);
          if (물은눈 + 답눈 !== 7) {
            broken.push(`${question.id}: 마주 보는 두 면의 눈이 ${물은눈}과 ${답눈}이라 합이 7이 아닙니다`);
          }
          if (String(답눈) !== question.answer) {
            broken.push(`${question.id}: 다시 구하니 ${답눈}인데 답은 ${question.answer}`);
          }
          // 여섯 면의 눈이 1부터 6까지 한 번씩이어야 합니다.
          const 눈들 = visual.cells.map((one) => Number(one.text)).sort((a, b) => a - b);
          if (눈들.join('') !== '123456') broken.push(`${question.id}: 주사위 눈이 ${눈들.join(',')}입니다`);
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(20);
  });

  it('전개도가 될 수 있는지 묻는 문항의 그림이 답과 맞다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 다섯단원) {
      for (const question of questions) {
        if (!/^그림을 접어 .+? 만들 수 있을까요\?/.test(question.prompt)) continue;
        const visual = question.visual;
        if (!visual || visual.kind !== 'box-net') continue;
        본것 += 1;
        const 굴린 = 굴리기(visual.cells);
        const 만들수있나 = /만들 수 있습니다\.$/.test(question.answer);
        // 주사위를 굴려 여섯 칸이 서로 다른 면이 되면 상자가 됩니다.
        const 여섯면 = 굴린 ? new Set(굴린.map((one) => one.F)).size === 6 && visual.cells.length === 6 : false;
        if (만들수있나 !== 여섯면) {
          broken.push(`${question.id}: 다시 접어 보니 ${여섯면 ? '만들 수 있는데' : '만들 수 없는데'} 답은 ${question.answer}`);
        }
        if (!만들수있나 && visual.cells.length !== 6 && !question.answer.includes('면이 6개가 아니')) {
          broken.push(`${question.id}: 면이 ${visual.cells.length}개인데 까닭이 ${question.answer}`);
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(10);
  });

  it('겨냥도 그림이 보이는 모서리 9개, 보이지 않는 모서리 3개가 되게 그려진다', () => {
    // 그림 쪽이 이 수를 지키지 못하면, 세어 보라고 낸 문항의 답을
    // 그림에서 확인할 수 없게 됩니다.
    expect(보이는수).toEqual({ 면: 3, 모서리: 9, 꼭짓점: 7 });
    expect(안보이는수).toEqual({ 면: 3, 모서리: 3, 꼭짓점: 1 });
  });
});

// ════════════════════════════════════════════════════════════════════
// 6단원 — 평균과 가능성을 '다른 방법으로' 다시 구해 맞춰 보기
// ────────────────────────────────────────────────────────────────────
// 평균은 나누지 않고 고르게 만들어 구합니다(고르게하기). 가능성은
// 문항이 쓰는 말로()와 수로()를 부르지 않고, 그림에서 칸과 바둑돌을
// 직접 세어 다시 정합니다.
// ════════════════════════════════════════════════════════════════════

const 가능성말 = (좋은것: number, 모두: number): string => {
  if (좋은것 === 0) return '불가능하다';
  if (좋은것 === 모두) return '확실하다';
  // 반인지 아닌지는 나누지 않고 두 배 해서 견줍니다.
  if (좋은것 + 좋은것 === 모두) return '반반이다';
  return 좋은것 + 좋은것 < 모두 ? '~아닐 것 같다' : '~일 것 같다';
};

const 가능성수 = (좋은것: number, 모두: number): string | null => {
  if (좋은것 === 0) return '0';
  if (좋은것 === 모두) return '1';
  if (좋은것 + 좋은것 === 모두) return '1/2';
  return null;
};

const 색말 = (text: string): string | null => {
  const 표: Record<string, string> = {
    빨간색: 'red', 파란색: 'blue', 노란색: 'yellow', 초록색: 'green', 흰색: 'white', 검은색: 'black',
  };
  return 표[text] ?? null;
};

describe('5-2 6단원 — 다른 방법으로 다시 구해 보기', () => {
  const 여섯단원 = every.filter(([lesson]) => lesson.unitNo === 6);

  it('6단원 차시가 모두 문항을 내놓는다', () => {
    expect(여섯단원.length).toBe(8 * 3);
    for (const [, , questions] of 여섯단원) expect(questions.length).toBe(30);
  });

  it('표와 막대그래프의 평균을 고르게 만들어 다시 구해도 답이 같다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 여섯단원) {
      for (const question of questions) {
        const visual = question.visual;
        if (!visual) continue;
        let values: number[] | null = null;
        if (visual.kind === 'table' && visual.columns.every((one) => typeof one.value === 'number')) {
          values = visual.columns.map((one) => one.value as number);
        }
        if (visual.kind === 'bar-model') values = visual.bars.map((one) => one.value);
        if (!values) continue;
        if (!/고르게 하면|막대의 길이를 모두 같게|의 평균은 얼마일까요/.test(question.prompt)) continue;
        본것 += 1;
        const 평균값 = 고르게하기(values);
        if (평균값 === null) {
          broken.push(`${question.id}: 고르게 만들어지지 않는 자료입니다 — ${values.join(', ')}`);
          continue;
        }
        const 답의수 = Number(question.answer.replace(/[^\d.]/g, ''));
        if (답의수 !== 평균값) {
          broken.push(`${question.id}: ${question.prompt} → 고르게 만드니 ${평균값}인데 답은 ${question.answer}`);
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(20);
  });

  it('빈칸이 있는 표는 그 칸을 답으로 메우면 평균이 문제에 적힌 값이 된다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 여섯단원) {
      for (const question of questions) {
        const visual = question.visual;
        if (!visual || visual.kind !== 'table') continue;
        if (!visual.columns.some((one) => one.value === null)) continue;
        본것 += 1;
        const 적힌평균 = Number(/평균이 (\d+)/.exec(question.prompt)?.[1] ?? NaN);
        const 메운것 = visual.columns.map((one) => (one.value === null ? Number(question.answer) : one.value));
        const 평균값 = 고르게하기(메운것);
        if (평균값 !== 적힌평균) {
          broken.push(`${question.id}: 빈칸을 ${question.answer}으로 메우면 평균이 ${평균값}인데 문제는 ${적힌평균}이라고 합니다`);
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(5);
  });

  it('회전판과 주머니의 가능성을 그림에서 다시 세어도 답이 같다', () => {
    const broken: string[] = [];
    let 본것 = 0;
    for (const [, , questions] of 여섯단원) {
      for (const question of questions) {
        const visual = question.visual;
        if (!visual) continue;

        // 하나짜리 그림에서 말이나 수를 묻는 문항입니다.
        const 하나물음 = /가능성을 (말로 표현하면|수로 나타내면)/.exec(question.prompt);
        if (하나물음) {
          const 색 = /화살이 ([가-힣]+색)을 가리킬|([가-힣]+색)이 나올/.exec(question.prompt);
          const 색코드 = 색말((색?.[1] ?? 색?.[2] ?? '').trim());
          if (!색코드) continue;
          let 모두 = 0;
          let 좋은것 = 0;
          if (visual.kind === 'spinner' && visual.items.length === 1) {
            모두 = visual.items[0].slices.length;
            좋은것 = visual.items[0].slices.filter((one) => one === 색코드).length;
          } else if (visual.kind === 'marble-bag' && visual.bags.length === 1) {
            모두 = visual.bags[0].marbles.length;
            좋은것 = visual.bags[0].marbles.filter((one) => one === 색코드).length;
          } else continue;
          본것 += 1;
          const 다시 = 하나물음[1] === '말로 표현하면' ? 가능성말(좋은것, 모두) : 가능성수(좋은것, 모두);
          if (다시 === null) {
            broken.push(`${question.id}: 0, 1/2, 1이 아닌 가능성을 수로 물었습니다 (${좋은것}/${모두})`);
          } else if (다시 !== question.answer) {
            broken.push(`${question.id}: ${question.prompt} → 다시 세니 ${다시}인데 답은 ${question.answer}`);
          }
          continue;
        }

        // 여럿을 견주는 문항입니다.
        const 견줌 = /가능성이 가장 (높은|낮은) (회전판|주머니)/.exec(question.prompt);
        if (견줌) {
          const 색 = /화살이 ([가-힣]+색)을 가리킬|([가-힣]+색)이 나올/.exec(question.prompt);
          const 색코드 = 색말((색?.[1] ?? 색?.[2] ?? '').trim());
          if (!색코드) continue;
          const 것들: Array<{ name: string; 좋은것: number; 모두: number }> = [];
          if (visual.kind === 'spinner') {
            for (const item of visual.items) {
              것들.push({
                name: item.name ?? '',
                좋은것: item.slices.filter((one) => one === 색코드).length,
                모두: item.slices.length,
              });
            }
          } else if (visual.kind === 'marble-bag') {
            for (const bag of visual.bags) {
              것들.push({
                name: bag.name ?? '',
                좋은것: bag.marbles.filter((one) => one === 색코드).length,
                모두: bag.marbles.length,
              });
            }
          } else continue;
          본것 += 1;
          // 어긋셈으로만 견줍니다. 소수로 바꾸지 않습니다.
          const 더높은가 = (a: typeof 것들[number], b: typeof 것들[number]) => a.좋은것 * b.모두 - b.좋은것 * a.모두;
          const 고른것 = 것들.reduce((best, one) =>
            (견줌[1] === '높은' ? 더높은가(one, best) > 0 : 더높은가(one, best) < 0) ? one : best,
          );
          const 같은것 = 것들.filter((one) => 더높은가(one, 고른것) === 0);
          if (같은것.length !== 1) {
            broken.push(`${question.id}: 가장 ${견줌[1]} 것이 ${같은것.length}개입니다`);
          } else if (question.answer !== `${고른것.name} ${견줌[2]}`) {
            broken.push(`${question.id}: ${question.prompt} → 다시 세니 ${고른것.name}인데 답은 ${question.answer}`);
          }
        }
      }
    }
    expect(broken).toEqual([]);
    expect(본것).toBeGreaterThan(40);
  });

  it('가능성을 말로 묻는 문항의 보기는 지도서가 쓰는 다섯 말뿐이다', () => {
    const 다섯말 = ['불가능하다', '~아닐 것 같다', '반반이다', '~일 것 같다', '확실하다'];
    const broken: string[] = [];
    for (const [lesson, , questions] of 여섯단원) {
      if (lesson.lessonNo !== 5) continue;
      for (const question of questions) {
        if (!/가능성을 말로 표현하면/.test(question.prompt)) continue;
        for (const choice of question.choices) {
          if (!다섯말.includes(choice)) broken.push(`${question.id}: 보기 '${choice}'`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  // 지도서 7차시: "가능성이 직관적으로 파악되는 상황들을 제시하여 일이
  // 일어날 가능성을 0, 1/2, 1의 수로 나타내어 보게 한다."
  it('7차시에서 수로 나타낸 답은 0, 1/2, 1뿐이다', () => {
    const broken: string[] = [];
    for (const [lesson, , questions] of 여섯단원) {
      if (lesson.lessonNo !== 7) continue;
      for (const question of questions) {
        if (!/가능성을 수로 나타내면 얼마일까요/.test(question.prompt)) continue;
        if (!['0', '1/2', '1'].includes(question.answer)) {
          broken.push(`${question.id}: 답이 ${question.answer}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  // 5차시 앞에서는 가능성을, 5차시 뒤에서는 평균을 묻지 않습니다.
  it('차시가 아직 배우지 않은 것을 묻지 않는다', () => {
    const broken: string[] = [];
    for (const [lesson, , questions] of 여섯단원) {
      for (const question of questions) {
        const 글 = [question.prompt, ...question.choices].join(' ');
        if (lesson.lessonNo <= 4 && /가능성/.test(글)) broken.push(`${lesson.id}: ${question.prompt}`);
        if (lesson.lessonNo >= 5 && /평균/.test(글)) broken.push(`${lesson.id}: ${question.prompt}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
