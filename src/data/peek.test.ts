import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().slice(0, 40);

describe('peek', () => {
  it('shows 2-2-u2-l8 하', () => {
    const lesson = lessons.find((one) => one.id === '2-2-u2-l8');
    const report: string[] = [];
    if (lesson) {
      const tally = new Map<string, number>();
      for (const question of generateQuestions(lesson, '하')) {
        const key = shapeOf(question.prompt);
        tally.set(key, (tally.get(key) ?? 0) + 1);
      }
      for (const [shape, count] of tally) report.push(`${count}번 · ${shape}`);
      report.push(`제목: ${lesson.title} / dans: ${JSON.stringify(lesson.scope.dans)}`);
    }
    expect(report).toEqual([]);
  });
});
