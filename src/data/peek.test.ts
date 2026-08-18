import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('ranks repeated answers', () => {
    const worst: string[] = [];
    const atIndex = [0, 0, 0, 0];
    let total = 0;
    for (const lesson of lessons) {
      if (lesson.title === '단원 도입') continue;
      for (const level of ['하', '중', '상'] as const) {
        const tally = new Map<string, number>();
        for (const q of generateQuestions(lesson, level)) {
          total += 1;
          const i = q.choices.indexOf(q.answer);
          if (i >= 0) atIndex[i] += 1;
          tally.set(q.answer, (tally.get(q.answer) ?? 0) + 1);
        }
        const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
        if (top && top[1] >= 8) worst.push(`${top[1]}회 ${lesson.id}|${level} '${top[0]}'`);
      }
    }
    worst.sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10));
    expect([`자리 ${atIndex.map((n) => Math.round((n / total) * 100)).join('/')}`, `8회 이상 ${worst.length}곳`, ...worst.slice(0, 20)]).toEqual([]);
  });
});
