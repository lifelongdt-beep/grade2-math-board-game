import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('counts guided coverage', () => {
    const missing: string[] = [];
    let covered = 0;
    for (const lesson of lessons) {
      const guided = generateQuestions(lesson, '하').filter((q) => q.prompt.includes('①'));
      if (guided.length) covered += 1;
      else missing.push(`${lesson.id} ${lesson.title}`);
    }
    expect([`${covered}/${lessons.length}개 차시`, ...missing.slice(0, 14)]).toEqual([]);
  });
});
