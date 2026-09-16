import { describe, expect, it } from 'vitest';
import { curriculum5 } from '../curriculum5';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Lesson, Question } from '../../types';

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
        const key = `${question.prompt}||${[...question.choices].sort().join('|')}||${question.answer}`;
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
        for (const [, number, josa] of 글.matchAll(/(\d+)(을|를|은|는|이|가|과|와)(?![가-힣])/g)) {
          const 받침 = 받침있는끝.test(number);
          const 옳은것 = 받침 ? ['을', '은', '이', '과'] : ['를', '는', '가', '와'];
          if (받침있는끝.test(number) || 받침없는끝.test(number)) {
            if (!옳은것.includes(josa)) broken.push(`${question.id}: "${number}${josa}" — ${글.slice(0, 80)}`);
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
