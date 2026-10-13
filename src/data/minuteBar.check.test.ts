import { describe, expect, it } from 'vitest';
import type { Difficulty } from '../types';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// '93분은 몇 시간 몇 분' 문제의 분 칸 그림: 칸 수는 문제의 분과 같고, 정답은 그 분을 60분씩 묶은 결과입니다.
describe('분 칸 그림(시간과 분)', () => {
  it('그림의 칸 수와 문제의 분, 정답이 서로 맞습니다', () => {
    let n = 0;
    for (const lesson of lessons) {
      for (const lv of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, lv)) {
          if (q.visual?.kind !== 'minute-bar') continue;
          n += 1;
          const total = q.visual.total;
          expect(q.prompt, q.prompt).toContain(`${total}분`);
          expect(total).toBeGreaterThan(60);
          const 시 = Math.floor(total / 60);
          const 분 = total % 60;
          const 답 = 분 === 0 ? `${시}시간` : `${시}시간 ${분}분`;
          expect(String(q.answer).replace(/\s+/g, ' ').trim(), q.prompt).toBe(답);
        }
      }
    }
    expect(n).toBeGreaterThan(5);
  });
});
