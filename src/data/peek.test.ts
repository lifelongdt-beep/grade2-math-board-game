import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('final overlap', () => {
    let same = 0;
    let all = 0;
    let worst = 0;
    let thinnest = 99;
    for (const lesson of lessons) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const mid = generateQuestions(lesson, '중');
      const dup = mid.filter((q) => low.has(shapeOf(q.prompt))).length;
      same += dup;
      all += mid.length;
      if (dup > worst) worst = dup;
      const kinds = new Set(mid.map((q) => shapeOf(q.prompt))).size;
      if (kinds < thinnest) thinnest = kinds;
    }
    console.log(`PEEK|겹침 ${same}/${all} · 한 차시 최대 ${worst} · 중 최소 모양 ${thinnest}가지`);
    expect(true).toBe(true);
  });
});
