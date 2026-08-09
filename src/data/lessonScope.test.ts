import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 차시마다 '무엇을 물어도 되는가'를 선언해 두었습니다(Lesson.scope).
// 지금까지는 그 판단이 문항 생성기 수백 군데에 흩어진 제목 문자열 검사에
// 들어 있었고, 그래서 2단 차시에 3단이 나오거나 자를 배우기 전 차시에 자
// 그림이 나오는 일이 되풀이됐습니다. 여기서는 선언이 실제로 지켜지는지를
// 봅니다. 선언과 문항이 어긋나면 둘 중 하나가 틀린 것입니다.
describe('lesson scope', () => {
  it('never draws a tool the lesson has not taught yet', () => {
    const wrong: string[] = [];

    for (const lesson of lessons) {
      const forbidden = lesson.scope.forbidVisuals ?? [];
      if (forbidden.length === 0) continue;

      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual && forbidden.includes(question.visual.kind)) {
            wrong.push(`${question.id}: ${question.visual.kind} 그림은 이 차시에서 쓸 수 없음`);
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('keeps the numbers inside the range the lesson works in', () => {
    const over: string[] = [];

    for (const lesson of lessons) {
      const limit = lesson.scope.maxNumber;

      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          // 문제와 보기에 나온 수를 봅니다. 차시가 다루는 범위를 넘으면
          // 아직 배우지 않은 크기의 수를 다루게 됩니다.
          const shown = [question.prompt, ...question.choices].join(' ');
          const biggest = (shown.match(/\d+/g) ?? [])
            .map(Number)
            .filter((value) => Number.isFinite(value))
            .reduce((most, value) => Math.max(most, value), 0);

          if (biggest > limit) {
            over.push(`${question.id}: ${biggest}은 이 차시 범위(${limit})를 넘음 — ${question.prompt.slice(0, 30)}`);
          }
        }
      }
    }

    expect(over).toEqual([]);
  });

  it('only uses the times tables the lesson teaches', () => {
    const early: string[] = [];

    for (const lesson of lessons) {
      const allowed = lesson.scope.dans;
      if (!allowed || allowed.length === 0) continue;

      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const used = [...question.prompt.matchAll(/(\d)단/g)].map((match) => Number(match[1]));
          const outside = used.filter((dan) => !allowed.includes(dan));
          if (outside.length > 0) {
            early.push(`${question.id}: ${outside.join(',')}단은 이 차시(${allowed.join(',')}단)에서 다루지 않음`);
          }
        }
      }
    }

    expect(early).toEqual([]);
  });
});
