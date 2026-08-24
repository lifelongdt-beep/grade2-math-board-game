import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('checks grouping pictures', () => {
    const out: string[] = [];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          if (!/상자에|봉지에|줄에|접시에/.test(q.prompt)) continue;
          const v = q.visual;
          if (v?.kind !== 'array') continue;
          const shape = v.plainCount === undefined
            ? `${v.columns}개씩 ${v.rows}묶음 = ${v.rows * v.columns}개`
            : `묶지 않음 ${v.plainCount}개`;
          const line = `${q.prompt.slice(0, 44)} | ${shape}`;
          if (!out.includes(line) && out.length < 7) out.push(line);
        }
      }
    }
    expect(out).toEqual([]);
  });
});
