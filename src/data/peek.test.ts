import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('dumps the time unit', () => {
    const report: string[] = [];
    for (const lesson of lessons) {
      if (lesson.unitTitle !== '시각과 시간') continue;
      if (lesson.title === '단원 도입') continue;
      const seen = new Set<string>();
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          const shape = (question.basePrompt ?? question.prompt).replace(/\d+/g, '#');
          if (seen.has(shape)) continue;
          seen.add(shape);
          report.push(`[${lesson.title}|${level}] ${shape} => ${question.answer}`);
        }
      }
    }
    expect(report).toEqual([]);
  });
});
