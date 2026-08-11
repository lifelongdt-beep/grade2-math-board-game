import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

// 풀이 과정 문항은 ① ② 로 단계를 나눠 보여 주고 그 사이 빈칸을 묻습니다.
// 읽을 것이 많고 단계를 따라가야 해서, 답만 묻는 문항보다 어렵습니다.
// 그래서 난이도마다 몇 문항을 줄지 다르게 정해 두었습니다.
//   하  0문항 — 아직 과정을 따라갈 단계가 아닙니다. 먼저 답을 낼 수 있어야 합니다.
//   중  0문항 — 중은 문장제가 중심입니다. 상황을 읽고 어떤 식을 세울지
//               스스로 정하는 것이 이 수준의 일입니다.
//   상 20문항 — 남의 풀이를 따라가며 판단하는 것이 이 수준의 일입니다.
//               중에도 두었더니 두 수준이 같은 문항을 나눠 가져 구별되지
//               않았습니다.
const expectedSteps: Record<Difficulty, number> = { 하: 0, 중: 0, 상: 20 };

describe('step coverage', () => {
  it('gives each difficulty the share of working-out questions it should have', () => {
    const wrong: string[] = [];

    for (const unit of curriculum) {
      for (const lesson of unit.lessons) {
        for (const level of Object.keys(expectedSteps) as Difficulty[]) {
          const questions = generateQuestions(lesson, level);
          // 빈칸 기호(□)는 보통 문항도 쓰므로 그것만으로는 셀 수 없습니다.
          // 풀이 과정을 ① ② 로 나눠 보여 주는 것이 이 문항의 표시입니다.
          const steps = questions.filter((question) => question.prompt.includes('①')).length;

          if (steps !== expectedSteps[level]) {
            wrong.push(
              `${unit.title} ${lesson.lessonNo}차시 (${level}): ${expectedSteps[level]}개여야 하는데 ${steps}개`,
            );
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('never puts a working-out question in the easiest level', () => {
    // 하 수준에서 이 문항이 하나라도 새어 들어오면 그 자리에서 막습니다.
    const leaked: string[] = [];

    for (const unit of curriculum) {
      for (const lesson of unit.lessons) {
        for (const question of generateQuestions(lesson, '하')) {
          if (question.prompt.includes('①')) {
            leaked.push(`${question.id}: ${question.prompt.slice(0, 40)}`);
          }
        }
      }
    }

    expect(leaked).toEqual([]);
  });
});
