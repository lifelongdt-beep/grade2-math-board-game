import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const WORST = new Set(['2-1-u1-l2|하', '2-1-u5-l2|하', '2-2-u2-l8|하', '2-1-u2-l4|상', '2-1-u5-l5|하']);

describe('peek', () => {
  it('dumps the worst lessons', () => {
    const out: string[] = [];
    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        if (!WORST.has(`${lesson.id}|${level}`)) continue;
        out.push(`### ${lesson.id} ${level} ${lesson.title}`);
        const seen = new Set<string>();
        for (const q of generateQuestions(lesson, level)) {
          const shape = (q.basePrompt ?? q.prompt).replace(/\d+/g, '#');
          if (seen.has(shape)) continue;
          seen.add(shape);
          out.push(`${shape} => ${q.answer}`);
        }
      }
    }
    expect(out).toEqual([]);
  });
});
