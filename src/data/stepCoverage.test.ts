import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

// 풀이 과정 문항은 ① ② 로 단계를 나눠 보여 주고 그 사이 빈칸을 묻습니다.
// 읽을 것이 많고 단계를 따라가야 해서, 답만 묻는 문항보다 어렵습니다.
// 그래서 난이도마다 몇 문항을 줄지 다르게 정해 두었습니다.
//   하  3문항까지 — 2022 개정 성취수준에서 C 수준의 진술은 거의 모두
//               '안내된 절차에 따라 ~할 수 있다'입니다([2수01-06] C:
//               "안내된 절차에 따라 두 자리 수의 범위에서 간단한 덧셈과
//               뺄셈을 할 수 있다"). 단계를 보여 주는 것은 어렵게 만드는
//               장치가 아니라 도와주는 장치이므로 하에도 두어야 합니다.
//               다만 하의 단계 문항은 중·상과 다릅니다 — 길을 끝까지
//               보여 주고 마지막 답만 묻습니다. 중간을 비우지 않는지는
//               demand.test.ts가 봅니다.
//               아직 모든 차시에 쓰지는 못해, 만들 수 있는 차시에서만
//               나옵니다. 그래서 '몇 개 이하'로 봅니다.
//   중  5문항 — 중은 문장제가 중심이지만, 이 문항을 아예 빼면 차시끼리
//               문항이 똑같아집니다. 차시를 구분하고 있던 것이 사실은
//               이 문항이었기 때문입니다. 상과 겹치지 않는 자리에서만 뽑습니다.
//   상 10~20문항 — 남의 풀이를 따라가며 판단하는 것도 이 수준의 일이지만
//               그것만으로 스무 자리를 채우면 상이 한 가지 틀로 굳습니다.
//               실생활 문제 해결 문항을 쓴 차시는 그 절반을 내주므로
//               열 개까지 내려갑니다. 아직 문항을 쓰지 못한 차시는
//               스무 개 그대로입니다.
const expectedSteps: Record<Difficulty, number> = { 하: 3, 중: 5, 상: 20 };
const leastSteps: Record<Difficulty, number> = { 하: 0, 중: 5, 상: 10 };

describe('step coverage', () => {
  it('gives each difficulty the share of working-out questions it should have', () => {
    const wrong: string[] = [];

    for (const unit of curriculum) {
      for (const lesson of unit.lessons) {
        for (const level of Object.keys(expectedSteps) as Difficulty[]) {
          const questions = generateQuestions(lesson, level);
          // 빈칸 기호(□)는 보통 문항도 쓰므로 그것만으로는 셀 수 없습니다.
          // 풀이 과정을 ① ② 로 나눠 보여 주는 것이 이 문항의 표시입니다.
          // 빈칸을 채우는 것과 차례를 놓는 것 둘 다 풀이 과정 문항입니다.
          const steps = questions.filter(
            (question) => question.prompt.includes('①') || question.prompt.includes('바른 차례로 놓으면'),
          ).length;

          // 하는 아직 모든 차시를 덮지 못했고, 상은 실생활 문항에 자리를
          // 얼마나 내주었는지에 따라 달라지므로 폭으로 봅니다.
          if (steps > expectedSteps[level] || steps < leastSteps[level]) {
            wrong.push(
              `${unit.title} ${lesson.lessonNo}차시 (${level}): ${leastSteps[level]}~${expectedSteps[level]}개여야 하는데 ${steps}개`,
            );
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  // '하에 풀이 과정 문항이 들어오면 안 된다'는 규칙이 여기 있었습니다.
  // 이제는 들어와도 되고, 대신 중간 단계를 비우지 않았는지를 봅니다.
  // 그 검사는 demand.test.ts의 'never blanks a middle step at the
  // easiest level'이 맡습니다.
});
