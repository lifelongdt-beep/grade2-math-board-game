import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('dumps the fill-in questions', () => {
    const out: string[] = [];
    for (const lesson of lessons) {
      if (lesson.unitTitle !== '표와 그래프') continue;
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          const v = q.visual;
          if (!v) continue;
          const blankCell = v.kind === 'table' && v.columns.some((one) => one.value === null);
          const blankRow = v.kind === 'pictograph' && v.blankAt !== undefined;
          if (!blankCell && !blankRow) continue;
          const shape = `${lesson.title}|${level} ${v.kind} ${q.prompt.slice(0, 44)} => ${q.answer}`;
          if (!out.includes(shape) && out.length < 8) out.push(shape);
        }
      }
    }
    expect([`빈칸 문항 ${out.length}가지`, ...out]).toEqual([]);
  });
});
