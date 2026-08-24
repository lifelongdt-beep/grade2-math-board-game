import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('checks the times-table pictures', () => {
    const out: string[] = [];

    for (const lesson of lessons) {
      if (lesson.unitTitle !== '곱셈구구') continue;
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          if (!/×□|□×|단 곱셈구구는 몇씩/.test(q.prompt)) continue;
          const v = q.visual;
          const shape = !v
            ? '그림 없음'
            : v.kind === 'array'
              ? `${v.columns}개씩 ${v.rows}줄`
              : v.kind === 'number-line'
                ? `수직선 step=${v.step} 점=${v.marks.map((m) => m.value).join(',')}`
                : v.kind;
          const line = `${q.prompt.slice(0, 34)} => ${q.answer} | ${shape}`;
          if (!out.includes(line) && out.length < 8) out.push(line);
        }
      }
    }
    expect(out).toEqual([]);
  });
});
