import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';

const lessons = curriculum.flatMap((unit) => unit.lessons);
const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().slice(0, 40);

// 잠깐 들여다보는 검사입니다. 무엇이 나오는지 알고 나면 지웁니다.
describe('peek', () => {
  it('shows 중 and 상 shapes', () => {
    const report: string[] = [];
    for (const id of ['2-1-u2-l2', '2-2-u6-l3', '2-1-u1-l2']) {
      const lesson = lessons.find((one) => one.id === id);
      if (!lesson) continue;
      const middle = new Set(generateQuestions(lesson, '중').map((q) => shapeOf(q.prompt)));
      const hard = new Set(generateQuestions(lesson, '상').map((q) => shapeOf(q.prompt)));
      report.push(`=== ${id} 중(${middle.size}) ===`);
      report.push(...[...middle]);
      report.push(`=== ${id} 상(${hard.size}) ===`);
      report.push(...[...hard]);
    }
    expect(report).toEqual([]);
  });
});
