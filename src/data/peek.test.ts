import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 선생님이 보내 주신 세 화면이 실제로 고쳐졌는지 봅니다.
describe('peek', () => {
  it('checks the three reported pictures', () => {
    const out: string[] = [];
    const want = [
      /씩 뛰어 세면 .* 다음에 오는 수/,
      /×.*덧셈식으로 나타내면/,
      /씩 \d+묶음일 때 이것을 나타낸 말/,
    ];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          if (!want.some((one) => one.test(q.prompt))) continue;
          const v = q.visual;
          const shape = v?.kind === 'array'
            ? `array ${v.columns}개씩 ${v.rows}묶음${v.plainCount ? ` (묶지 않음 ${v.plainCount}개)` : ''}`
            : v?.kind === 'number-line'
              ? `number-line step=${v.step} marks=${v.marks.map((m) => m.value).join(',')}`
              : String(v?.kind);
          const line = `${q.prompt.slice(0, 34)} => ${q.answer} | ${shape}`;
          if (!out.includes(line) && out.length < 6) out.push(line);
        }
      }
    }
    expect(out).toEqual([]);
  });
});
