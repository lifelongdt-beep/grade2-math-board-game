import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('dumps the guided-step questions', () => {
    const out: string[] = [];
    let covered = 0;
    for (const lesson of lessons) {
      const guided = generateQuestions(lesson, '하').filter((q) => q.prompt.includes('①'));
      if (guided.length) covered += 1;
      if (guided.length && out.length < 9) out.push(`[${lesson.id} ${lesson.title}] ${guided[0].prompt} => ${guided[0].answer}`);
    }
    expect([`단계 문항이 나오는 차시 ${covered}개`, ...out]).toEqual([]);
  });
});
