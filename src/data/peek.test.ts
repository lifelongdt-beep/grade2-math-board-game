import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('measures how specific the hints are', () => {
    let generic = 0;
    let all = 0;
    const worst = new Map<string, number>();

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          all += 1;
          const numbers = q.prompt.match(/\d+/g) ?? [];
          const useful = numbers.some((one) => q.support.studentHint.includes(one));
          if (!useful) {
            generic += 1;
            worst.set(q.support.studentHint, (worst.get(q.support.studentHint) ?? 0) + 1);
          }
        }
      }
    }

    console.log(`PEEK|수를 안 쓴 볼 곳 ${generic}/${all}`);
    for (const [text, count] of [...worst.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
      console.log(`THIN|${count}회|${text.slice(0, 60)}`);
    }
    expect(true).toBe(true);
  });
});
