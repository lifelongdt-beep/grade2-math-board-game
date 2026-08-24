import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('lists multiplication questions with no picture', () => {
    const out: string[] = [];
    for (const lesson of lessons) {
      if (lesson.id !== '2-1-u6-l1') continue;
      for (const q of generateQuestions(lesson, '하')) {
        if (q.visual) continue;
        const one = `${q.prompt.slice(0, 46)} => ${q.answer}`;
        if (!out.includes(one)) out.push(one);
      }
    }
    expect(out.slice(0, 8)).toEqual([]);
  });
});
