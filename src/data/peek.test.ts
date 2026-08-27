import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('shows lesson 4 and 7', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2' || lesson.unitNo !== 1) continue;
      if (lesson.lessonNo !== 4 && lesson.lessonNo !== 7 && lesson.lessonNo !== 3) continue;
      const seen = new Set<string>();
      for (const q of generateQuestions(lesson, '상')) {
        if (seen.has(q.strategy)) continue;
        seen.add(q.strategy);
        console.log(`PEEK|${lesson.lessonNo}|${q.strategy.slice(-30)}|${q.prompt.slice(0, 56)}`);
      }
    }
    expect(true).toBe(true);
  });
});
