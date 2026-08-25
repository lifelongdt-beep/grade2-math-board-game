import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 수직선은 '몇씩 뛰는지'를 보여 주는 그림입니다. 눈금 간격이 문제와
// 상관없는 수이면 아이가 세어 볼 수가 없습니다.
//
// 예전에는 문제에 나온 두 수의 차를 그대로 간격으로 삼았습니다.
//   '100은 10이 몇 개인 수일까요?'  → 90씩 뛰는 자
//   '1000을 100씩 묶으면 몇 묶음?'  → 900씩 뛰는 자
// 전 차시를 훑어 보니 이런 곳이 123가지였습니다.
describe('수직선의 눈금 간격', () => {
  it('세어 볼 수 있는 간격만 쓴다', () => {
    // 2학년이 눈으로 좇을 수 있는 간격입니다. 3이나 7씩 가는 자는
    // 문제글이 그렇게 말해 줄 때만 씁니다.
    const easy = new Set([1, 2, 3, 4, 5, 10, 20, 25, 50, 100, 200, 500, 1000]);
    const odd: string[] = [];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          const visual = question.visual;
          if (!visual || visual.kind !== 'number-line') continue;

          const inPrompt = (question.prompt.match(/\d+/g) ?? []).map(Number);
          if (easy.has(visual.step) || inPrompt.includes(visual.step)) continue;

          const line = `${question.prompt.slice(0, 44)} → ${visual.step}씩`;
          if (!odd.includes(line)) odd.push(line);
        }
      }
    }

    expect(odd.slice(0, 6)).toEqual([]);
  });

  it('눈금이 너무 많거나 적지 않다', () => {
    const bad: string[] = [];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          const visual = question.visual;
          if (!visual || visual.kind !== 'number-line') continue;

          const ticks = Math.floor((visual.end - visual.start) / visual.step) + 1;
          if (ticks >= 3 && ticks <= 26) continue;

          const line = `${question.prompt.slice(0, 40)} → 눈금 ${ticks}개`;
          if (!bad.includes(line)) bad.push(line);
        }
      }
    }

    expect(bad.slice(0, 6)).toEqual([]);
  });
});
