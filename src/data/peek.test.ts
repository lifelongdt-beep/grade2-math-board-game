import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('shows the new construction questions', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2' || lesson.unitNo !== 2) continue;
      const seen = new Set<string>();
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          if (!/한 번 더 더하기|두 배|한 묶음 덜|아는 두 단|자리 규칙|1을 곱한|0을 곱한|접히는|커지는 폭|얼마를 더할지/.test(q.strategy)) continue;
          if (seen.has(q.prompt)) continue;
          seen.add(q.prompt);
          if (seen.size > 3) break;
          console.log(`NEW|${lesson.lessonNo}|${level}|${q.prompt.slice(0, 60)}|=> ${q.answer}`);
        }
      }
    }
    expect(true).toBe(true);
  });
});
