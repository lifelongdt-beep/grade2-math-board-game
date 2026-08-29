import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('worst lessons now', () => {
    const rows: Array<{ at: string; same: number; kinds: string[] }> = [];
    for (const lesson of lessons) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const dup = generateQuestions(lesson, '중').filter((q) => low.has(shapeOf(q.prompt)));
      if (dup.length >= 5) {
        rows.push({
          at: `${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo} ${lesson.title.slice(0, 15)}`,
          same: dup.length,
          kinds: [...new Set(dup.map((q) => q.strategy.split(' · ').slice(-1)[0]))].slice(0, 3),
        });
      }
    }
    rows.sort((a, b) => b.same - a.same);
    for (const one of rows) console.log(`SAME|${one.same}|${one.at}|${one.kinds.join(' / ')}`);
    expect(true).toBe(true);
  });
});
