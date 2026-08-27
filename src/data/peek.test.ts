import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('counts the overlap now', () => {
    let same = 0;
    let all = 0;
    const rows: Array<{ at: string; same: number }> = [];
    for (const lesson of lessons) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const mid = generateQuestions(lesson, '중');
      const dup = mid.filter((q) => low.has(shapeOf(q.prompt)));
      same += dup.length;
      all += mid.length;
      if (dup.length >= 6) rows.push({ at: `${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo} ${lesson.title.slice(0, 16)}`, same: dup.length });
    }
    console.log(`PEEK|겹침 ${same}/${all}`);
    rows.sort((a, b) => b.same - a.same);
    for (const one of rows.slice(0, 12)) console.log(`SAME|${one.same}|${one.at}`);
    expect(true).toBe(true);
  });
});
