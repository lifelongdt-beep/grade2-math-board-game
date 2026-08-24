import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('checks the reported questions', () => {
    const out: string[] = [];
    const want = [
      /끈이 \d+cm.*몇 배/,
      /\d+의 \d+배/,
      /100이 \d+개이면/,
    ];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          if (!want.some((one) => one.test(q.prompt))) continue;
          const v = q.visual;
          const shape = !v
            ? '그림 없음'
            : v.kind === 'array'
              ? `${v.columns}개씩 ${v.rows}묶음`
              : v.kind === 'number-line'
                ? `수직선 step=${v.step} 짚은수=${v.marks.filter((m) => m.active).map((m) => m.value).join(',')}`
                : v.kind === 'bar-model'
                  ? `막대 ${v.bars.map((b) => `${b.label} ${b.value}`).join(' / ')}`
                  : v.kind;
          const line = `[${lesson.title}] ${q.prompt.slice(0, 38)} => ${q.answer} | ${shape}`;
          if (!out.includes(line) && out.length < 9) out.push(line);
        }
      }
    }
    expect(out).toEqual([]);
  });
});
