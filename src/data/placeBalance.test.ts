import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 자리값을 다루는 차시에서 한 자리만 계속 물으면 학생은 그 자리만 익힙니다.
// 천, 백, 십, 일을 골고루 물어야 합니다.
describe('place value balance', () => {
  it('asks about every place in the number units, not just one', () => {
    const unbalanced: string[] = [];

    for (const unit of curriculum) {
      if (unit.title !== '세 자리 수' && unit.title !== '네 자리 수') continue;
      const four = unit.title === '네 자리 수';
      // 자리별 묶음을 다루는 차시(자리 수 알아보기, 각 자리의 숫자)
      const lessons = unit.lessons.filter(
        (lesson) => lesson.title.includes('자리 수를 알아') || lesson.title.includes('각 자리'),
      );

      for (const lesson of lessons) {
        for (const level of levels) {
          const asked = new Set<string>();

          for (const question of generateQuestions(lesson, level)) {
            // '1000이 3개', '10이 6개'처럼 어떤 묶음을 묻는지 모읍니다.
            for (const match of question.prompt.matchAll(/(1000|100|10|1)이 \d+개/g)) {
              asked.add(match[1]);
            }
          }

          const expected = four ? ['1000', '100', '10', '1'] : ['100', '10', '1'];
          const missing = expected.filter((place) => !asked.has(place));

          if (asked.size > 0 && missing.length > 0) {
            unbalanced.push(
              `${unit.title} ${lesson.lessonNo}차시 (${level}): ${missing.join(', ')} 자리를 묻지 않음`,
            );
          }
        }
      }
    }

    expect(unbalanced).toEqual([]);
  });
});
