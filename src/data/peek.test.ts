import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 수직선의 눈금 간격이 문제글과 상관없는 수인 곳을 셉니다.
describe('peek', () => {
  it('counts odd number-line steps', () => {
    const natural = new Set([1, 2, 3, 4, 5, 10, 20, 25, 50, 100, 200, 500, 1000]);
    const odd: string[] = [];
    let total = 0;

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          const v = q.visual;
          if (!v || v.kind !== 'number-line') continue;
          total += 1;
          const inPrompt = (q.prompt.match(/\d+/g) ?? []).map(Number);
          if (natural.has(v.step) || inPrompt.includes(v.step)) continue;
          const line = `${q.prompt.slice(0, 40)} => step ${v.step}`;
          if (!odd.includes(line)) odd.push(line);
        }
      }
    }

    expect([`수직선 ${total}개 중 어긋난 눈금 ${odd.length}가지`, ...odd.slice(0, 6)]).toEqual([]);
  });
});
