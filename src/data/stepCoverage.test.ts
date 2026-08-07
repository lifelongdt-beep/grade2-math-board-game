import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 한 차시는 30문항이고, 그중 20문항은 풀이 과정을 보여 주는 문항이어야 합니다.
// 답만 묻는 문제만 있으면 학생이 어떻게 풀었는지 알기 어렵습니다.
describe('step coverage', () => {
  it('gives every 차시 20 questions that show their working', () => {
    const missing: string[] = [];

    for (const unit of curriculum) {
      for (const lesson of unit.lessons) {
        for (const level of levels) {
          const questions = generateQuestions(lesson, level);
          // 빈칸 기호(□)는 보통 문항도 쓰므로 그것만으로는 셀 수 없습니다.
          // 풀이 과정을 ① ② 로 나눠 보여 주는 것이 이 문항의 표시입니다.
          const steps = questions.filter((question) => question.prompt.includes('①')).length;

          if (steps < 20) {
            missing.push(`${unit.title} ${lesson.lessonNo}차시 (${level}): ${steps}개`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
