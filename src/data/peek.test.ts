import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('shows which generator still overlaps', () => {
    const want = ['2-1 2-2', '2-1 3-9', '2-1 3-10', '2-2 4-5', '2-2 3-4', '2-1 5-3'];
    for (const lesson of lessons) {
      const at = `${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo}`;
      if (!want.includes(at)) continue;
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const seen = new Set<string>();
      for (const q of generateQuestions(lesson, '중')) {
        if (!low.has(shapeOf(q.prompt))) continue;
        const kind = q.strategy.split(' · ').slice(-1)[0];
        if (seen.has(kind)) continue;
        seen.add(kind);
        console.log(`DUP|${at}|${kind}|${q.prompt.slice(0, 48)}`);
      }
    }
    expect(true).toBe(true);
  });
});
