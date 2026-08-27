import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('measures 하-중 overlap again', () => {
    let same = 0;
    let all = 0;
    const worst: string[] = [];
    for (const lesson of lessons) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const mid = generateQuestions(lesson, '중');
      const dup = mid.filter((q) => low.has(shapeOf(q.prompt)));
      same += dup.length;
      all += mid.length;
      if (dup.length >= 8) worst.push(`${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo} ${lesson.title.slice(0, 14)}: ${dup.length}/30`);
    }
    console.log(`PEEK|겹침 ${same}/${all}`);
    for (const one of worst.slice(0, 20)) console.log(`SAME|${one}`);
    expect(true).toBe(true);
  });
});
