import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('shows the flagged question in full', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2' || lesson.unitNo !== 2 || lesson.lessonNo !== 4) continue;
      for (const q of generateQuestions(lesson, '상')) {
        if (!q.prompt.includes('6단의 곱은')) continue;
        console.log(`FULL|${q.prompt}|보기: ${q.choices.join(' / ')}|전략: ${q.strategy}`);
        break;
      }
    }
    expect(true).toBe(true);
  });
});
