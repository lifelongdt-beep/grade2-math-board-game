import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';

const lessons = curriculum.flatMap((unit) => unit.lessons);
const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().slice(0, 46);

describe('peek', () => {
  it('shows how the thirty slots get filled', () => {
    const report: string[] = [];
    for (const id of ['2-2-u1-l2', '2-2-u2-l2']) {
      const lesson = lessons.find((one) => one.id === id);
      if (!lesson) continue;
      for (const level of ['하', '중', '상'] as const) {
        const questions = generateQuestions(lesson, level);
        const tally = new Map<string, number>();
        for (const question of questions) {
          const key = shapeOf(question.prompt);
          tally.set(key, (tally.get(key) ?? 0) + 1);
        }
        report.push(`### ${id} ${level} — ${tally.size}가지`);
        for (const [shape, count] of tally) report.push(`${count}번 · ${shape}`);
      }
    }
    expect(report).toEqual([]);
  });
});
