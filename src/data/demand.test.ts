import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 난이도가 서로 다른 문제여야 합니다. 예전에는 난이도가 '풀이 과정 문항을
// 몇 개 넣는가'로만 정해져, 중과 상에 같은 문항이 그대로 나오고 보기만
// 조금 달랐습니다. 세 수준이 실제로 다른 일을 요구하는지 봅니다.
//
//   하 아는 것을 꺼내거나 배운 절차를 그대로 수행
//   중 상황을 읽고 어떤 식을 세울지 정해야 함
//   상 풀이를 이해하고 판단하거나 거꾸로 생각해야 함
const shapeOf = (prompt: string) =>
  prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

// 단원 도입은 그 단원 내용을 아직 하나도 배우지 않아 낼 수 있는 문제가
// 앞 학년 내용으로 묶여 있습니다.
const covered = lessons.filter((lesson) => lesson.title !== '단원 도입');

describe('difficulty is a difference in what the question asks', () => {
  it('does not hand 중 and 상 the same questions', () => {
    const same: string[] = [];

    for (const lesson of covered) {
      const middle = new Set(generateQuestions(lesson, '중').map((q) => shapeOf(q.prompt)));
      const hard = new Set(generateQuestions(lesson, '상').map((q) => shapeOf(q.prompt)));

      const shared = [...hard].filter((shape) => middle.has(shape));
      // 겹치는 모양이 상 수준 모양의 대부분이면 두 수준을 나눈 뜻이 없습니다.
      if (hard.size > 0 && shared.length > hard.size * 0.7) {
        same.push(`${lesson.id}: 상 모양 ${hard.size}가지 중 ${shared.length}가지가 중과 같음`);
      }
    }

    expect(same).toEqual([]);
  });

  it('keeps the working-out questions out of the easiest level', () => {
    // 풀이 과정 문항은 남의 풀이를 따라가며 빈칸을 채우는 문항이라
    // 아직 답을 스스로 내지 못하는 단계에서는 이릅니다.
    const leaked: string[] = [];

    for (const lesson of lessons) {
      for (const question of generateQuestions(lesson, '하')) {
        if (question.prompt.includes('①')) {
          leaked.push(`${question.id}: ${question.prompt.slice(0, 34)}`);
        }
      }
    }

    expect(leaked).toEqual([]);
  });
});
