import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('overlap and inner variety', () => {
    let same = 0;
    let all = 0;
    let thinnest = 99;
    let thinAt = '';
    for (const lesson of lessons) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const mid = generateQuestions(lesson, '중');
      same += mid.filter((q) => low.has(shapeOf(q.prompt))).length;
      all += mid.length;
      const kinds = new Set(mid.map((q) => shapeOf(q.prompt))).size;
      if (kinds < thinnest) { thinnest = kinds; thinAt = `${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo}`; }
    }
    console.log(`PEEK|겹침 ${same}/${all} · 중 안에서 가장 적은 모양 ${thinnest}가지 (${thinAt})`);
    expect(true).toBe(true);
  });
});
