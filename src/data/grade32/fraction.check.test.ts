import { describe, expect, it } from 'vitest';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-2 4단원 분수 — 답을 처음부터 다시 셉니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Question[] = lessons32
  .filter((one) => one.unitNo === 4)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

/** '3/4', '2와 1/5', '7'을 (분자, 분모)로 읽습니다. */
const 읽기 = (text: string): { n: number; d: number } | null => {
  const t = text.trim();
  const mixed = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(t);
  if (mixed) return { n: Number(mixed[1]) * Number(mixed[3]) + Number(mixed[2]), d: Number(mixed[3]) };
  const f = /^(\d+)\/(\d+)$/.exec(t);
  if (f) return { n: Number(f[1]), d: Number(f[2]) };
  if (/^\d+$/.test(t)) return { n: Number(t), d: 1 };
  return null;
};
const 같은값 = (a: { n: number; d: number }, b: { n: number; d: number }) => a.n * b.d === b.n * a.d;
const 받침 = [true, true, false, true, false, false, true, true, true, false];

describe('3-2 4단원 분수', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons32.filter((one) => one.unitNo === 4)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('틀린 보기 가운데 답과 값이 같은 분수가 없습니다(9/12는 틀린 답이 아닙니다)', () => {
    for (const q of 모두) {
      const a = 읽기(q.answer);
      if (!a) continue;
      for (const choice of q.choices) {
        if (choice === q.answer) continue;
        const c = 읽기(choice);
        if (c && !/대분수는 어느 것/.test(q.prompt)) expect(같은값(a, c), `${q.prompt} / ${choice}`).toBe(false);
      }
    }
  });

  it('묶음으로 나타낸 분수가 맞습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const m = /(\d+)개를 (\d+)개씩 묶었습니다\. \S+ (\d+)개는 전체/.exec(q.prompt);
      if (m) {
        const [N, g, p] = [Number(m[1]), Number(m[2]), Number(m[3])];
        expect(q.answer).toBe(`${p / g}/${N / g}`);
        count += 1;
      }
      const e = /(\d+)\S+ 똑같이 (\d+)묶음으로 나누었습니다\. (\d+)묶음은 전체의/.exec(q.prompt);
      if (e) {
        expect(q.answer).toBe(`${e[3]}/${e[2]}`);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(20);
  });

  it('전체의 분수만큼이 맞습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const m = /(\d+)(?:개| cm| m)?의 (\d+)\/(\d+)(?:만큼|[은는] (?:얼마|몇))/.exec(q.prompt);
      if (!m || /은\(는\)|입니다\. \d+의/.test(q.prompt)) continue;
      const [N, a, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
      expect(N % b, q.prompt).toBe(0);
      expect(Number(q.answer.replace(/[^\d]/g, '')), q.prompt).toBe((N / b) * a);
      count += 1;
    }
    expect(count).toBeGreaterThan(40);
  });

  it('진분수·가분수·대분수 문항이 뜻에 맞습니다', () => {
    for (const q of 모두) {
      if (q.prompt === '진분수는 어느 것일까요?') {
        for (const choice of q.choices) {
          const c = 읽기(choice)!;
          expect(c.n < c.d, choice).toBe(choice === q.answer);
        }
      }
      if (q.prompt === '가분수는 어느 것일까요?') {
        for (const choice of q.choices) {
          const c = 읽기(choice)!;
          expect(c.n >= c.d, choice).toBe(choice === q.answer);
        }
      }
      if (q.prompt === '대분수는 어느 것일까요?') {
        for (const choice of q.choices) expect(/^\d+[과와] \d+\/\d+$/.test(choice), choice).toBe(choice === q.answer);
      }
      const 가로 = /^(\d+[과와] \d+\/\d+)[을를] 가분수로 나타내면/.exec(q.prompt);
      if (가로) {
        expect(같은값(읽기(가로[1])!, 읽기(q.answer)!)).toBe(true);
        expect(/^\d+\/\d+$/.test(q.answer)).toBe(true);
      }
      const 대로 = /^(\d+\/\d+)[을를] 대분수로 나타내면/.exec(q.prompt);
      if (대로) {
        const m = /^(\d+)([과와]) (\d+)\/(\d+)$/.exec(q.answer)!;
        expect(Number(m[3]) < Number(m[4])).toBe(true);
        expect(같은값(읽기(대로[1])!, 읽기(q.answer)!)).toBe(true);
        expect(m[2]).toBe(받침[Number(m[1].slice(-1))] ? '과' : '와');
      }
      const 자연수 = /^자연수 (\d+)[을를] 분모가 (\d+)인 가분수로/.exec(q.prompt);
      if (자연수) expect(q.answer).toBe(`${Number(자연수[1]) * Number(자연수[2])}/${자연수[2]}`);
    }
  });

  it('분수의 크기 비교가 맞습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const m = /^(.+) ([<>=]) (.+)$/.exec(q.answer);
      if (m && 읽기(m[1]) && 읽기(m[3])) {
        const x = 읽기(m[1])!;
        const y = 읽기(m[3])!;
        const s = Math.sign(x.n * y.d - y.n * x.d);
        expect({ '>': 1, '<': -1, '=': 0 }[m[2] as '>'], q.answer).toBe(s);
        count += 1;
      }
      const big = /^가장 (큰|작은) 분수는 어느 것일까요\? \((.+)\)$/.exec(q.prompt);
      if (big) {
        const items = big[2].split(', ').map((t) => ({ t, v: 읽기(t)! }));
        const best = items.reduce((p, c) => ((big[1] === '큰' ? c.v.n * p.v.d > p.v.n * c.v.d : c.v.n * p.v.d < p.v.n * c.v.d) ? c : p));
        expect(q.answer).toBe(best.t);
      }
    }
    expect(count).toBeGreaterThan(30);
  });

  it('조사가 괄호로 남지 않습니다', () => {
    for (const q of 모두) {
      const all = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(all), all).toBe(false);
    }
  });
});
