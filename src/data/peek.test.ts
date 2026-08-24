import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('checks grouping pictures', () => {
    const out: string[] = [];
    const want = [
      /상자에 .*씩 들어 있습니다/,
      /봉지에 .*씩/,
      /줄에 .*씩/,
      /물건이 \d+개 있습니다/,
    ];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          if (!want.some((one) => one.test(q.prompt))) continue;
          const v = q.visual;
          if (v?.kind !== 'array') continue;
          const drawn = v.plainCount ?? v.rows * v.columns;
          const shape = v.plainCount === undefined
            ? `${v.columns}개씩 ${v.rows}묶음 = ${drawn}개`
            : `묶지 않음 ${v.plainCount}개 (${v.rows}줄)`;
          const line = `${q.prompt.slice(0, 40)} => ${q.answer} | ${shape}`;
          if (!out.includes(line) && out.length < 7) out.push(line);
        }
      }
    }
    expect(out).toEqual([]);
  });
});
