import { describe, expect, it } from 'vitest';
import { lessons51 } from '../curriculum51';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 답이 맞는지 다시 셉니다
// ────────────────────────────────────────────────────────────────────
// 문항을 만드는 쪽과 답을 맞춰 보는 쪽이 같은 코드를 쓰면, 그 코드가
// 틀렸을 때 둘이 사이좋게 틀립니다. 그래서 이 파일은 생성기의 계산을
// 하나도 가져오지 않습니다 — 화면에 나갈 문제 글을 사람처럼 다시 읽고,
// 여기 적힌 셈으로 처음부터 다시 풀어 답과 맞춰 봅니다.
//
// 답이 틀리면 아이는 그것을 배웁니다. 이 시험이 막으려는 것은 그것
// 하나입니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];

const 모든문항 = (unitNo: number): Array<{ lesson: string; level: Difficulty; question: Question }> => {
  const out: Array<{ lesson: string; level: Difficulty; question: Question }> = [];
  for (const lesson of lessons51.filter((one) => one.unitNo === unitNo)) {
    for (const level of levels) {
      for (const question of generateQuestions(lesson, level)) {
        out.push({ lesson: lesson.id, level, question });
      }
    }
  }
  return out;
};

// ── 여기서 쓰는 셈 (생성기와 따로 적은 것) ─────────────────────────
const 최대공약수 = (a: number, b: number): number => (b === 0 ? a : 최대공약수(b, a % b));
const 최소공배수 = (a: number, b: number) => (a / 최대공약수(a, b)) * b;

type 분수 = { n: number; d: number };
const 줄이기 = ({ n, d }: 분수): 분수 => {
  const g = 최대공약수(Math.abs(n), Math.abs(d)) || 1;
  return { n: n / g, d: d / g };
};
const 더하기 = (a: 분수, b: 분수) => 줄이기({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const 빼기 = (a: 분수, b: 분수) => 줄이기({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });

/** '1과 3/4', '3/4', '5'를 읽습니다. */
const 분수읽기 = (text: string): 분수 | null => {
  const 대분수 = /^(\d+)[과와]\s*(\d+)\/(\d+)$/.exec(text.trim());
  if (대분수) {
    const [, w, n, d] = 대분수;
    return { n: Number(w) * Number(d) + Number(n), d: Number(d) };
  }
  const 진분수 = /^(\d+)\/(\d+)$/.exec(text.trim());
  if (진분수) return { n: Number(진분수[1]), d: Number(진분수[2]) };
  const 자연수 = /^(\d+)$/.exec(text.trim());
  if (자연수) return { n: Number(자연수[1]), d: 1 };
  return null;
};

const 분수글 = (one: 분수): string => {
  const { n, d } = 줄이기(one);
  if (d === 1) return String(n);
  if (n < d) return `${n}/${d}`;
  const 앞 = Math.floor(n / d);
  const 남 = n - 앞 * d;
  if (남 === 0) return String(앞);
  // 받침이 있으면 '과', 없으면 '와'. 앞의 자연수를 소리 내어 읽은 값입니다.
  const 받침 = [true, true, false, true, false, false, true, true, true, false][앞 % 10];
  return `${앞}${받침 ? '과' : '와'} ${남}/${d}`;
};

// ── 1단원 자연수의 혼합 계산 ────────────────────────────────────────
// 문제 글에 적힌 식을 그대로 다시 읽어 계산합니다. 생성기의 나무를
// 쓰지 않고, 여기서 따로 적은 파서로 읽습니다.
const 식계산 = (text: string): number | null => {
  const 토큰 = text.match(/\d+|[+\-×÷()]/g);
  if (!토큰) return null;
  let at = 0;
  const 끝 = () => at >= 토큰.length;

  const 값: () => number | null = () => {
    if (끝()) return null;
    if (토큰[at] === '(') {
      at += 1;
      const 안 = 더하기수준();
      if (안 === null || 토큰[at] !== ')') return null;
      at += 1;
      return 안;
    }
    if (!/^\d+$/.test(토큰[at])) return null;
    const value = Number(토큰[at]);
    at += 1;
    return value;
  };

  const 곱하기수준 = (): number | null => {
    let left = 값();
    if (left === null) return null;
    while (!끝() && (토큰[at] === '×' || 토큰[at] === '÷')) {
      const op = 토큰[at];
      at += 1;
      const right = 값();
      if (right === null) return null;
      if (op === '×') left *= right;
      else {
        if (right === 0 || left % right !== 0) return null;
        left /= right;
      }
    }
    return left;
  };

  const 더하기수준 = (): number | null => {
    let left = 곱하기수준();
    if (left === null) return null;
    while (!끝() && (토큰[at] === '+' || 토큰[at] === '-')) {
      const op = 토큰[at];
      at += 1;
      const right = 곱하기수준();
      if (right === null) return null;
      left = op === '+' ? left + right : left - right;
    }
    return left;
  };

  const got = 더하기수준();
  return 끝() ? got : null;
};

describe('5-1 1단원 자연수의 혼합 계산', () => {
  it('문제 글의 식을 다시 계산해도 답이 같다', () => {
    const 틀린것: string[] = [];
    let 본것 = 0;
    for (const { lesson, level, question } of 모든문항(1)) {
      const hit = /^([\d+\-×÷() ]+?)(?:을|를) 계산하면 얼마일까요\?$/.exec(question.prompt);
      if (!hit) continue;
      본것 += 1;
      const got = 식계산(hit[1]);
      if (got === null) {
        틀린것.push(`${lesson} ${level}: "${hit[1]}"을 읽지 못함`);
      } else if (String(got) !== question.answer) {
        틀린것.push(`${lesson} ${level}: ${hit[1]} = ${got}인데 답은 ${question.answer}`);
      }
    }
    expect(틀린것).toEqual([]);
    // 읽을 수 있는 문항이 하나도 없으면 시험이 아무것도 보지 않은 것입니다.
    expect(본것).toBeGreaterThan(60);
  });

  it('계산 과정의 마지막 줄이 답과 같다', () => {
    const 어긋난것: string[] = [];
    for (const { lesson, level, question } of 모든문항(1)) {
      const 마지막 = question.support.steps[question.support.steps.length - 1];
      if (!마지막.includes(question.answer)) {
        어긋난것.push(`${lesson} ${level}: 답 ${question.answer} / 마지막 줄 "${마지막}"`);
      }
    }
    expect(어긋난것).toEqual([]);
  });
});

// ── 2단원 약수와 배수 ───────────────────────────────────────────────
describe('5-1 2단원 약수와 배수', () => {
  it('약수와 배수, 최대공약수와 최소공배수를 다시 구해도 답이 같다', () => {
    const 틀린것: string[] = [];
    let 본것 = 0;
    for (const { lesson, level, question } of 모든문항(2)) {
      const 약수모두 = /^(\d+)의 약수를 모두 구한 것은/.exec(question.prompt);
      if (약수모두) {
        본것 += 1;
        const value = Number(약수모두[1]);
        const 바른답: number[] = [];
        for (let k = 1; k <= value; k += 1) if (value % k === 0) 바른답.push(k);
        if (바른답.join(', ') !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${value}의 약수는 ${바른답.join(', ')}인데 답은 ${question.answer}`);
        }
        continue;
      }
      const 개수 = /^(\d+)의 약수는 모두 몇 개일까요\?$/.exec(question.prompt);
      if (개수) {
        본것 += 1;
        const value = Number(개수[1]);
        let count = 0;
        for (let k = 1; k <= value; k += 1) if (value % k === 0) count += 1;
        if (`${count}개` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${value}의 약수는 ${count}개인데 답은 ${question.answer}`);
        }
        continue;
      }
      const 대표 = /^(\d+)[과와] (\d+)의 (최대공약수|최소공배수)/.exec(question.prompt);
      if (대표) {
        본것 += 1;
        const a = Number(대표[1]);
        const b = Number(대표[2]);
        const 바른답 = 대표[3] === '최대공약수' ? 최대공약수(a, b) : 최소공배수(a, b);
        if (String(바른답) !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${a}, ${b}의 ${대표[3]}는 ${바른답}인데 답은 ${question.answer}`);
        }
        continue;
      }
      const 공약수 = /^(\d+)[과와] (\d+)의 공약수를 모두 구한 것은/.exec(question.prompt);
      if (공약수) {
        본것 += 1;
        const a = Number(공약수[1]);
        const b = Number(공약수[2]);
        const g = 최대공약수(a, b);
        const 바른답: number[] = [];
        for (let k = 1; k <= g; k += 1) if (g % k === 0) 바른답.push(k);
        if (바른답.join(', ') !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${a}, ${b}의 공약수는 ${바른답.join(', ')}인데 답은 ${question.answer}`);
        }
      }
    }
    expect(틀린것).toEqual([]);
    expect(본것).toBeGreaterThan(60);
  });

  it('보기로 내놓은 약수는 실제로 나누어떨어지게 한다', () => {
    const 틀린것: string[] = [];
    for (const { lesson, level, question } of 모든문항(2)) {
      const hit = /^다음 중 (\d+)의 약수가 아닌 것은/.exec(question.prompt);
      if (!hit) continue;
      const value = Number(hit[1]);
      if (value % Number(question.answer) === 0) {
        틀린것.push(`${lesson} ${level}: ${value}는 ${question.answer}로 나누어떨어지는데 '약수가 아닌 것'이 답`);
      }
      for (const choice of question.choices) {
        if (choice === question.answer) continue;
        if (value % Number(choice) !== 0) {
          틀린것.push(`${lesson} ${level}: ${value}는 ${choice}로 나누어떨어지지 않는데 오답으로 들어감`);
        }
      }
    }
    expect(틀린것).toEqual([]);
  });
});

// ── 4단원 약분과 통분 · 5단원 분수의 덧셈과 뺄셈 ────────────────────
describe('5-1 4·5단원 분수', () => {
  it('분수의 덧셈과 뺄셈을 다시 계산해도 답이 같다', () => {
    const 틀린것: string[] = [];
    let 본것 = 0;
    for (const { lesson, level, question } of 모든문항(5)) {
      const hit = /^(.+?) ([+\-]) (.+?)(?:을|를) 계산하면 얼마일까요\?$/.exec(question.prompt);
      if (!hit) continue;
      const left = 분수읽기(hit[1]);
      const right = 분수읽기(hit[3]);
      if (!left || !right) continue;
      본것 += 1;
      const 바른답 = hit[2] === '+' ? 더하기(left, right) : 빼기(left, right);
      if (분수글(바른답) !== question.answer) {
        틀린것.push(`${lesson} ${level}: ${hit[1]} ${hit[2]} ${hit[3]} = ${분수글(바른답)}인데 답은 ${question.answer}`);
      }
    }
    expect(틀린것).toEqual([]);
    expect(본것).toBeGreaterThan(40);
  });

  it('통분한 두 분수는 처음 분수와 크기가 같다', () => {
    const 틀린것: string[] = [];
    let 본것 = 0;
    for (const { lesson, level, question } of [...모든문항(4), ...모든문항(5)]) {
      const hit = /^(\d+\/\d+)[과와] (\d+\/\d+)(?:을|를) .*통분/.exec(question.prompt);
      if (!hit) continue;
      const 답조각 = question.answer.split(',').map((one) => 분수읽기(one));
      if (답조각.length !== 2 || !답조각[0] || !답조각[1]) continue;
      본것 += 1;
      const 처음 = [분수읽기(hit[1]), 분수읽기(hit[2])];
      for (let at = 0; at < 2; at += 1) {
        const before = 처음[at];
        const after = 답조각[at];
        if (!before || !after) continue;
        if (before.n * after.d !== after.n * before.d) {
          틀린것.push(`${lesson} ${level}: ${hit[at + 1]}을 통분했더니 크기가 달라짐 (${question.answer})`);
        }
      }
      if (답조각[0].d !== 답조각[1].d) {
        틀린것.push(`${lesson} ${level}: 통분했는데 분모가 다름 (${question.answer})`);
      }
    }
    expect(틀린것).toEqual([]);
    expect(본것).toBeGreaterThan(20);
  });

  it('기약분수로 나타내라고 한 답은 실제로 기약분수다', () => {
    const 틀린것: string[] = [];
    for (const { lesson, level, question } of [...모든문항(4), ...모든문항(5)]) {
      if (!/기약분수로 나타내면/.test(question.prompt)) continue;
      const 답 = 분수읽기(question.answer);
      if (!답) continue;
      if (최대공약수(답.n, 답.d) !== 1) {
        틀린것.push(`${lesson} ${level}: ${question.answer}는 아직 약분할 수 있음`);
      }
    }
    expect(틀린것).toEqual([]);
  });

  it('두 분수의 크기 비교에서 더 큰 쪽을 답으로 낸다', () => {
    const 틀린것: string[] = [];
    let 본것 = 0;
    for (const { lesson, level, question } of 모든문항(4)) {
      const hit = /^(\d+\/\d+)[과와] (\d+\/\d+) 중에서 더 큰 분수는/.exec(question.prompt);
      if (!hit) continue;
      본것 += 1;
      const a = 분수읽기(hit[1]);
      const b = 분수읽기(hit[2]);
      if (!a || !b) continue;
      const 바른답 = a.n * b.d > b.n * a.d ? hit[1] : hit[2];
      if (바른답 !== question.answer) {
        틀린것.push(`${lesson} ${level}: ${hit[1]}과 ${hit[2]} 중 큰 것은 ${바른답}인데 답은 ${question.answer}`);
      }
    }
    expect(틀린것).toEqual([]);
    expect(본것).toBeGreaterThan(10);
  });
});

// ── 6단원 다각형의 둘레와 넓이 ──────────────────────────────────────
describe('5-1 6단원 다각형의 둘레와 넓이', () => {
  it('둘레와 넓이를 공식으로 다시 구해도 답이 같다', () => {
    const 틀린것: string[] = [];
    let 본것 = 0;
    const 변의수: Record<string, number> = { 정삼각형: 3, 정사각형: 4, 정오각형: 5, 정육각형: 6 };

    for (const { lesson, level, question } of 모든문항(6)) {
      const 정다각형 = /^한 변의 길이가 (\d+) cm인 (정삼각형|정사각형|정오각형|정육각형)의 둘레는/.exec(question.prompt);
      if (정다각형) {
        본것 += 1;
        const 바른답 = Number(정다각형[1]) * 변의수[정다각형[2]];
        if (`${바른답} cm` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm여야 하는데 ${question.answer}`);
        }
        continue;
      }
      const 직사각형둘레 = /^가로가 (\d+) cm, 세로가 (\d+) cm인 직사각형의 둘레는/.exec(question.prompt);
      if (직사각형둘레) {
        본것 += 1;
        const 바른답 = (Number(직사각형둘레[1]) + Number(직사각형둘레[2])) * 2;
        if (`${바른답} cm` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm여야 하는데 ${question.answer}`);
        }
        continue;
      }
      const 직사각형넓이 = /^가로가 (\d+) cm, 세로가 (\d+) cm인 직사각형의 넓이는/.exec(question.prompt);
      if (직사각형넓이) {
        본것 += 1;
        const 바른답 = Number(직사각형넓이[1]) * Number(직사각형넓이[2]);
        if (`${바른답} cm²` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm²여야 하는데 ${question.answer}`);
        }
        continue;
      }
      const 평행사변형 = /^밑변의 길이가 (\d+) cm, 높이가 (\d+) cm인 평행사변형의 넓이는/.exec(question.prompt);
      if (평행사변형) {
        본것 += 1;
        const 바른답 = Number(평행사변형[1]) * Number(평행사변형[2]);
        if (`${바른답} cm²` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm²여야 하는데 ${question.answer}`);
        }
        continue;
      }
      const 삼각형 = /^밑변의 길이가 (\d+) cm, 높이가 (\d+) cm인 삼각형의 넓이는/.exec(question.prompt);
      if (삼각형) {
        본것 += 1;
        const 바른답 = (Number(삼각형[1]) * Number(삼각형[2])) / 2;
        if (`${바른답} cm²` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm²여야 하는데 ${question.answer}`);
        }
        continue;
      }
      const 사다리꼴 = /^윗변의 길이가 (\d+) cm, 아랫변의 길이가 (\d+) cm, 높이가 (\d+) cm인 사다리꼴의 넓이는/.exec(question.prompt);
      if (사다리꼴) {
        본것 += 1;
        const 바른답 = ((Number(사다리꼴[1]) + Number(사다리꼴[2])) * Number(사다리꼴[3])) / 2;
        if (`${바른답} cm²` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm²여야 하는데 ${question.answer}`);
        }
        continue;
      }
      const 마름모 = /^두 대각선의 길이가 (\d+) cm, (\d+) cm인 마름모의 넓이는/.exec(question.prompt);
      if (마름모) {
        본것 += 1;
        const 바른답 = (Number(마름모[1]) * Number(마름모[2])) / 2;
        if (`${바른답} cm²` !== question.answer) {
          틀린것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} cm²여야 하는데 ${question.answer}`);
        }
      }
    }
    expect(틀린것).toEqual([]);
    expect(본것).toBeGreaterThan(80);
  });

  it('넓이 단위는 두 단계씩만 바꾸고, 바꾼 값도 맞다', () => {
    // 지도서: "넓이 단위 사이의 관계 중 1 cm², 1 km² 사이의 단위
    // 환산은 다루지 않는다." 그래서 cm²↔m²와 m²↔km²만 나와야 합니다.
    //
    // 세 단위를 보기에 늘어놓는 것(알맞은 단위 고르기)은 환산이
    // 아니므로 여기서 보지 않습니다. 실제로 '몇 …일까요'로 바꾸라고
    // 한 문항만 봅니다.
    const 어긴것: string[] = [];
    const 넓이배: Record<string, number> = { 'cm²': 1, 'm²': 10000, 'km²': 10000000000 };
    let 본것 = 0;
    for (const { lesson, level, question } of 모든문항(6)) {
      const hit = /^(\d+) (cm²|m²|km²)는 몇 (cm²|m²|km²)일까요\?$/.exec(question.prompt);
      if (!hit) continue;
      본것 += 1;
      const [, value, from, to] = hit;
      if ((from === 'cm²' && to === 'km²') || (from === 'km²' && to === 'cm²')) {
        어긴것.push(`${lesson} ${level}: cm²와 km² 사이를 바꾸라고 함 — ${question.prompt}`);
        continue;
      }
      const 바른답 = (Number(value) * 넓이배[from]) / 넓이배[to];
      if (`${바른답} ${to}` !== question.answer) {
        어긴것.push(`${lesson} ${level}: ${question.prompt} → ${바른답} ${to}여야 하는데 ${question.answer}`);
      }
    }
    expect(어긴것).toEqual([]);
    expect(본것).toBeGreaterThan(10);
  });
});

// ── 모든 단원 ───────────────────────────────────────────────────────
describe('5-1 모든 차시', () => {
  it('보기가 넷이고 서로 다르며 그 안에 답이 있다', () => {
    const 잘못: string[] = [];
    for (let unitNo = 1; unitNo <= 6; unitNo += 1) {
      for (const { lesson, level, question } of 모든문항(unitNo)) {
        if (question.choices.length !== 4) {
          잘못.push(`${lesson} ${level}: 보기가 ${question.choices.length}개 — ${question.prompt}`);
        }
        if (new Set(question.choices).size !== question.choices.length) {
          잘못.push(`${lesson} ${level}: 보기에 같은 것이 둘 — ${question.choices.join(' / ')}`);
        }
        if (!question.choices.includes(question.answer)) {
          잘못.push(`${lesson} ${level}: 보기에 답이 없음 — ${question.answer}`);
        }
        if (question.choices.some((one) => one.trim() === '')) {
          잘못.push(`${lesson} ${level}: 빈 보기 — ${question.prompt}`);
        }
      }
    }
    expect(잘못).toEqual([]);
  });

  it('차시마다 서른 문항을 낸다', () => {
    const 모자란것: string[] = [];
    for (const lesson of lessons51) {
      for (const level of levels) {
        const count = generateQuestions(lesson, level).length;
        if (count !== 30) 모자란것.push(`${lesson.id} ${level}: ${count}문항`);
      }
    }
    expect(모자란것).toEqual([]);
  });

  it('풀이와 볼 곳과 조심할 곳이 비어 있지 않다', () => {
    const 빈것: string[] = [];
    for (let unitNo = 1; unitNo <= 6; unitNo += 1) {
      for (const { lesson, level, question } of 모든문항(unitNo)) {
        const support = question.support;
        if (!support.studentHint.trim()) 빈것.push(`${lesson} ${level}: 볼 곳이 비었음`);
        if (support.steps.length < 2) 빈것.push(`${lesson} ${level}: 풀이가 한 줄뿐 — ${question.prompt}`);
        if (!support.misconceptionTip.trim()) 빈것.push(`${lesson} ${level}: 조심할 곳이 비었음`);
        if (!support.selfCheck.trim()) 빈것.push(`${lesson} ${level}: 확인 질문이 비었음`);
      }
    }
    expect(빈것).toEqual([]);
  });
});
