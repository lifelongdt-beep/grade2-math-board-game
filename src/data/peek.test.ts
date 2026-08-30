import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('dumps 2-2 unit 2', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2' || lesson.unitNo !== 2) continue;
      console.log(`LESSON|${lesson.lessonNo}|${lesson.title}|${lesson.objective}`);
      for (const level of ['하', '중', '상'] as const) {
        const made = generateQuestions(lesson, level);
        const kinds = new Map<string, string>();
        for (const q of made) {
          const kind = q.strategy.split(' · ').slice(-1)[0];
          if (!kinds.has(kind)) kinds.set(kind, q.prompt.slice(0, 52));
        }
        for (const [kind, sample] of kinds) {
          console.log(`Q|${lesson.lessonNo}|${level}|${kind}|${sample}`);
        }
      }
    }
    expect(true).toBe(true);
  });
});
