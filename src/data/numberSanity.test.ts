import { describe, expect, it } from 'vitest';
import { curriculum, lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

describe('number questions make sense', () => {
  it('only asks about a digit the number actually has', () => {
    const wrong: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          // "505에서 숫자 2가 나타내는 값" — 505에는 2가 없습니다.
          for (const match of question.prompt.matchAll(/(\d+)에서 (?:숫자 )?(\d)(?:이|가) 나타내는/g)) {
            const [, value, digit] = match;
            if (!value.includes(digit)) {
              wrong.push(`${question.id}: ${value}에 숫자 ${digit}이 없음`);
            }
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('does not ask which place a repeated digit sits in', () => {
    const ambiguous: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          // 숫자가 두 번 나오면 어느 자리를 말하는지 정할 수 없습니다.
          // (같은 숫자를 일부러 두 자리에 놓고 값을 견주는 문제는 제외)
          if (/값이 가장 큰|몇 배일까요/.test(question.prompt)) continue;

          for (const match of question.prompt.matchAll(/(\d+)에서 (?:숫자 )?(\d)(?:이|가) 나타내는/g)) {
            const [, value, digit] = match;
            const times = value.split('').filter((one) => one === digit).length;
            if (times > 1) {
              ambiguous.push(`${question.id}: ${value}에 숫자 ${digit}이 ${times}번 나옴`);
            }
          }
        }
      }
    }

    expect(ambiguous).toEqual([]);
  });

  it('uses numbers of the right size for the unit', () => {
    const offSize: string[] = [];

    for (const unit of curriculum) {
      const expected = unit.title === '네 자리 수' ? 4 : unit.title === '세 자리 수' ? 3 : 0;
      if (expected === 0) continue;

      for (const lesson of unit.lessons) {
        // 도입과 백/천, 몇백/몇천 차시는 더 작은 수로 시작합니다.
        if (lesson.lessonNo < 4) continue;

        for (const level of levels) {
          for (const question of generateQuestions(lesson, level)) {
            const match = question.prompt.match(/(\d+)에서 (?:숫자 )?\d(?:이|가) 나타내는/);
            if (!match) continue;

            if (match[1].length !== expected) {
              offSize.push(`${question.id}: ${unit.title}인데 ${match[1]}`);
            }
          }
        }
      }
    }

    expect(offSize).toEqual([]);
  });
});
