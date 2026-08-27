import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 2학기 상 수준 문항이 어떤 모습인지 봅니다.
describe('peek', () => {
  it('dumps hard questions for 2-2', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2') continue;
      const seen = new Set<string>();
      for (const q of generateQuestions(lesson, '상')) {
        const kind = q.strategy.split(' · ').slice(-1)[0];
        if (seen.has(kind)) continue;
        seen.add(kind);
        console.log(`PEEK|${lesson.unitNo}-${lesson.lessonNo}|${lesson.title.slice(0, 16)}|${kind}|${q.prompt.slice(0, 72)}`);
      }
    }
    expect(true).toBe(true);
  });
});
