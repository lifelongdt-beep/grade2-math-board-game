import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('shows the new real-life questions', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2' || lesson.unitNo !== 1) continue;
      const seen = new Set<string>();
      for (const q of generateQuestions(lesson, '상')) {
        if (!/실생활|견주어|거꾸로 판단|가려내어|살 수 있는지|지폐 수|앞일을/.test(q.strategy)) continue;
        if (seen.has(q.prompt)) continue;
        seen.add(q.prompt);
        console.log(`PEEK|${lesson.lessonNo}|${q.prompt.slice(0, 80)}|=> ${q.answer}`);
      }
    }
    expect(true).toBe(true);
  });
});
