import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 틀린 아이가 읽는 '볼 곳'입니다. 읽고 바로 움직일 수 있어야 합니다.
//
// 예전에는 갈래마다 한 문장이 고정되어 있었습니다. 곱셈이면 어떤
// 문항이든 '같은 수가 몇 번 있는지 세어 봐요'였습니다. 그 문장으로는
// 이 문제를 어떻게 푸는지 알 수 없습니다.
describe('틀렸을 때 주는 볼 곳', () => {
  it('무엇을 하라는 말로 끝난다', () => {
    const vague: string[] = [];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          const hint = question.support.studentHint;
          // 첫 동작이 적혀 있어야 합니다. '…보세요', '…적으세요',
          // '…합니다'처럼 시키는 말로 끝나야 합니다.
          const acts = /(세요|니다)\.?$/.test(hint.trim());
          if (!acts || hint.length < 20) vague.push(`${question.id}: ${hint}`);
        }
      }
    }

    expect(vague.slice(0, 5)).toEqual([]);
  });

  it('그 문항의 수를 쓴 볼 곳이 충분히 많다', () => {
    let useful = 0;
    let all = 0;

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          all += 1;
          const numbers = question.prompt.match(/\d+/g) ?? [];
          if (numbers.some((one) => question.support.studentHint.includes(one))) useful += 1;
        }
      }
    }

    // 수가 아예 없는 문항(분류 기준 고르기 등)이 있어 전부는 될 수
    // 없습니다. 절반은 그 문항의 수로 짚어 주어야 합니다.
    expect(useful * 3).toBeGreaterThan(all);
  });
});
