import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('final numbers', () => {
    let five = 0; let eight = 0; let worst = 0; let where = '';
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
        if (top && top[1] >= 5) five += 1;
        if (top && top[1] >= 8) eight += 1;
        if (top && top[1] > worst) { worst = top[1]; where = `${lesson.id}|${level} '${top[0]}'`; }
      }
    }
    expect([
      `문항 ${total}개`,
      `자리 ${atIndex.map((n) => Math.round((n / total) * 100)).join('/')}`,
      `5회 이상 ${five}곳 · 8회 이상 ${eight}곳 · 최악 ${worst}회 (${where})`,
    ]).toEqual([]);
  });
});
