import { describe, expect, it } from 'vitest';
import { lessons12 } from '../curriculum12';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 1-2 문항을 처음부터 다시 풉니다 — 1-1과 같은 원칙입니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Array<{ unitNo: number; lessonNo: number; level: Difficulty; q: Question }> = [];
for (const lesson of lessons12) {
  for (const level of levels) {
    for (const q of generateQuestions(lesson, level)) 모두.push({ unitNo: lesson.unitNo, lessonNo: lesson.lessonNo, level, q });
  }
}
const 단원 = (unitNo: number) => 모두.filter((x) => x.unitNo === unitNo);
const 수 = (text: string) => Number(text.replace(/[^\d]/g, ''));
const 값 = (식: string) => {
  const parts = 식.replace(/\s/g, '').match(/\d+|[+-]/g) ?? [];
  let v = Number(parts[0]);
  for (let k = 1; k < parts.length; k += 2) v = parts[k] === '+' ? v + Number(parts[k + 1]) : v - Number(parts[k + 1]);
  return v;
};

describe('1-2 모든 문항', () => {
  it('차시·수준마다 문항이 있습니다', () => {
    for (const lesson of lessons12) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('보기가 넷이고 서로 다르며 답이 하나 들어 있습니다', () => {
    for (const { q } of 모두) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices.filter((c) => c === q.answer).length, q.prompt).toBe(1);
    }
  });

  it('조사가 괄호 꼴로 남거나 받침과 어긋나지 않습니다', () => {
    for (const { q } of 모두) {
      const text = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(text, q.prompt).not.toMatch(/을\(를\)|은\(는\)|이\(가\)|과\(와\)|\(으\)로/);
      expect(text, q.prompt).not.toMatch(/[013678](를|는|가|와)\s/);
      expect(text, q.prompt).not.toMatch(/[2459](을|은|이|과)\s/);
    }
  });

  it('1학년 수는 100을 넘지 않습니다', () => {
    for (const { q } of 모두) {
      // 910(99 다음을 '9, 10'으로 이어 쓴 것)과 1010(10개씩 묶음 10개를
      // '10, 10'으로 쓴 것)은 일부러 둔 오답입니다.
      for (const n of [q.prompt, ...q.choices].join(' ').match(/\d+/g) ?? []) {
        if (n === '910' || n === '1010') continue;
        expect(Number(n), q.prompt).toBeLessThanOrEqual(100);
      }
    }
  });

  it('모양 단원은 삼각형·사각형·원이라는 말을 쓰지 않습니다', () => {
    for (const { q } of 단원(3)) {
      expect([q.prompt, ...q.choices, ...q.support.steps].join(' '), q.prompt).not.toMatch(/삼각형|사각형|원 모양|원이/);
    }
  });

  it('"얼마일까요" 계산 문항의 답이 맞습니다', () => {
    for (const { q } of 모두) {
      const m = /^([\d+\-]+)(은|는) 얼마일까요/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(값(m[1]));
      const box = /^([\d+\-□]+)=(\d+)에서 □/.exec(q.prompt);
      if (box) {
        const v = 수(q.answer);
        expect(값(box[1].replace('□', String(v))), q.prompt).toBe(Number(box[2]));
      }
    }
  });

  it('식 보기 문항은 조건에 맞는 보기가 답 하나입니다', () => {
    for (const { q } of 모두) {
      if (q.prompt === '합이 10인 덧셈식은 어느 것일까요?') expect(q.choices.filter((c) => 값(c) === 10), q.prompt).toEqual([q.answer]);
      const same = /^(\d+)([+-])(\d+)(과|와) (합|차)이 같은 식은/.exec(q.prompt);
      if (same) {
        const want = 값(`${same[1]}${same[2]}${same[3]}`);
        expect(q.choices.filter((c) => 값(c) === want), q.prompt).toEqual([q.answer]);
      }
    }
  });
});

describe('1-2 1단원 100까지의 수', () => {
  it('묶음 그림·부등호·짝수홀수가 맞습니다', () => {
    for (const { q } of 단원(1)) {
      if (q.prompt === '그림이 나타내는 수는 얼마일까요?' && q.visual?.kind === 'tens-ones') {
        expect(수(q.answer), q.prompt).toBe(q.visual.tens * 10 + q.visual.ones);
      }
      if (q.prompt.startsWith('두 수의 크기를 바르게')) {
        const 참 = (t: string) => {
          const m = /^(\d+) ([<>=]) (\d+)$/.exec(t)!;
          const a = Number(m[1]);
          const b = Number(m[3]);
          return m[2] === '>' ? a > b : m[2] === '<' ? a < b : a === b;
        };
        expect(q.choices.filter(참), q.prompt).toEqual([q.answer]);
      }
      const eo = /^다음 중 (짝수|홀수)는/.exec(q.prompt);
      if (eo) {
        const want = eo[1] === '짝수' ? 0 : 1;
        expect(q.choices.filter((c) => Number(c) % 2 === want), q.prompt).toEqual([q.answer]);
        for (const c of q.choices) expect(Number(c), q.prompt).toBeLessThanOrEqual(20);
      }
      if (q.prompt.startsWith('바둑돌을 둘씩 짝지어') && q.visual?.kind === 'counters') {
        const n = q.visual.groups[0].count;
        expect(q.answer, q.prompt).toBe(`${n}개, ${n % 2 === 0 ? '짝수' : '홀수'}`);
      }
    }
  });
});

describe('1-2 2단원 덧셈과 뺄셈(1)', () => {
  it('세 수의 덧셈·뺄셈은 9 이하이고 0보다 작아지지 않습니다', () => {
    for (const { q, lessonNo } of 단원(2)) {
      if (lessonNo !== 2 && lessonNo !== 3) continue;
      const m = /^(\d)([+-])(\d)([+-])(\d)(은|는) 얼마/.exec(q.prompt);
      if (!m) continue;
      const first = m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
      expect(first >= 0 && first <= 9, q.prompt).toBe(true);
      expect(수(q.answer) <= 9, q.prompt).toBe(true);
    }
  });
});

describe('1-2 3단원 모양과 시각', () => {
  it('시계 그림의 시각과 답이 맞고 몇 시, 몇 시 30분만 나옵니다', () => {
    for (const { q } of 단원(3)) {
      if (q.visual?.kind !== 'clock') continue;
      expect([0, 30], q.prompt).toContain(q.visual.minute);
      expect(q.answer, q.prompt).toBe(q.visual.minute === 0 ? `${q.visual.hour}시` : `${q.visual.hour}시 30분`);
    }
  });

  it('특징으로 고르는 모양 문항은 그림에서 답 하나만 맞습니다', () => {
    const 수세기 = { square: [4, 4], rectangle: [4, 4], triangle: [3, 3], circle: [0, 0] } as Record<string, [number, number]>;
    for (const { q } of 단원(3)) {
      if (q.visual?.kind !== 'plane-shapes' || !/인 모양은 어느 것|된 모양은 어느 것|없는 모양은 어느 것/.test(q.prompt)) continue;
      const m = /(뾰족한 부분이|곧은 선이) (\d)(군데|개)인/.exec(q.prompt);
      const items = q.visual.items;
      const 맞는 = items.filter((it) => {
        if (m) return 수세기[it.kind][0] === Number(m[2]);
        return it.kind === 'circle';
      });
      expect(맞는.length, q.prompt).toBe(1);
      expect(맞는[0].label, q.prompt).toBe(q.answer);
    }
  });
});

describe('1-2 6단원 덧셈과 뺄셈(3)', () => {
  it('받아올림·받아내림이 없습니다', () => {
    for (const { q } of 단원(6)) {
      const m = /^(\d+)([+-])(\d+)(은|는) 얼마/.exec(q.prompt);
      if (!m) continue;
      const a = Number(m[1]);
      const b = Number(m[3]);
      if (a < 20 && b < 10) continue; // 단원 도입의 (십몇)-(몇) 복습입니다.
      if (m[2] === '+') expect((a % 10) + (b % 10) < 10, q.prompt).toBe(true);
      else expect(a % 10 >= b % 10, q.prompt).toBe(true);
    }
  });
});

// ════════════════════════════════════════════════════════════════════
// 수 배열표·색칠 그림이 문항과 같습니다
// ════════════════════════════════════════════════════════════════════
describe('1-2 그림과 문항이 어긋나지 않습니다', () => {
  it('수 배열표 그림은 1부터 100까지의 배열 그대로이고, ? 칸이 답입니다', () => {
    let 그림수 = 0;
    for (const { q } of 단원(5)) {
      const v = q.visual;
      if (/수 배열표/.test(q.prompt)) expect(v?.kind, q.prompt).toBe('number-array');
      if (v?.kind !== 'number-array') continue;
      그림수 += 1;
      // 한 줄에 10칸이고, 칸의 수는 (줄)×10+(칸)+1입니다.
      for (const row of v.rows) {
        expect(row.length, q.prompt).toBe(10);
        const 첫 = row.find((x) => x !== null)!;
        const 줄첫 = 첫 - row.indexOf(첫);
        expect((줄첫 - 1) % 10, q.prompt).toBe(0);
        row.forEach((x, c) => { if (x !== null) expect(x, q.prompt).toBe(줄첫 + c); });
      }
      const 빈칸 = v.rows.flatMap((row, r) => row.map((x, c) => (x === null ? [r, c] : null)).filter(Boolean));
      if (/바로 (아래|위) 칸/.test(q.prompt)) {
        expect(빈칸.length, q.prompt).toBe(1);
        const [r, c] = 빈칸[0] as number[];
        const 첫줄 = v.rows[0].find((x) => x !== null)!;
        const 첫줄시작 = 첫줄 - v.rows[0].indexOf(첫줄);
        expect(첫줄시작 + r * 10 + c, q.prompt).toBe(Number(q.answer));
        const n = Number(/배열표에서 (\d+) 바로/.exec(q.prompt)![1]);
        expect(v.rows.flat(), q.prompt).toContain(n);
      } else expect(빈칸.length, q.prompt).toBe(0);
      const 색칠 = /배열표에서 ([\d, ]+)에 색칠/.exec(q.prompt);
      if (색칠) {
        const seq = 색칠[1].split(', ').map(Number);
        expect(v.shaded, q.prompt).toEqual(seq);
        for (const x of seq) expect(v.rows.flat(), q.prompt).toContain(x);
        expect(v.rows.flat(), q.prompt).toContain(Number(q.answer));
      }
    }
    expect(그림수).toBeGreaterThan(0);
  });

  it('색을 수로 나타내는 문항의 그림은 문항에 적힌 색 차례와 같습니다', () => {
    for (const { q } of 단원(5)) {
      const m = /^(.+) 차례로 색칠했습니다/.exec(q.prompt);
      if (!m) continue;
      expect(q.visual?.kind, q.prompt).toBe('pattern');
      if (q.visual?.kind === 'pattern') expect(q.visual.items, q.prompt).toEqual(m[1].split(', '));
    }
  });
});
