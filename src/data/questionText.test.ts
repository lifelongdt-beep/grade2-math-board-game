import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 숫자를 우리말로 읽었을 때 받침이 있는지 (0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔)
const digitJong: Record<string, boolean> = {
  '0': true, '1': true, '3': true, '6': true, '7': true, '8': true,
  '2': false, '4': false, '5': false, '9': false,
};

describe('generated question text', () => {
  it('uses the right Korean particle after a number', () => {
    const issues: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          for (const text of [question.prompt, question.answer, question.explanation, ...question.choices]) {
            for (const match of text.matchAll(/(\d)(을|를|이|가|은|는|와|과)(?=[\s.,?!)]|$)/g)) {
              const hasFinal = digitJong[match[1]];
              const wrong = hasFinal
                ? ['를', '가', '는', '와'].includes(match[2])
                : ['을', '이', '은', '과'].includes(match[2]);
              if (wrong) issues.push(`${question.id}: "${match[0]}" in ${text}`);
            }
          }
        }
      }
    }

    expect(issues).toEqual([]);
  });

  // 자리값 표는 문제에 나온 수보다 작은 수를 그리면 안 됩니다.
  // (예: "274에서 일의 자리 숫자가 나타내는 값은?"의 정답 4를 그리면
  //  백 0 / 십 0 / 일 4가 되어 학생이 분해할 274가 화면에서 사라집니다.)
  it('never shrinks the place value table below a number the question mentions', () => {
    const issues: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'place-value') continue;

          const promptNumbers = question.prompt.match(/\d+/g)?.map(Number) ?? [];
          if (promptNumbers.length === 0) continue;

          const shown = Number(question.visual.columns.map((column) => String(column.value)).join(''));
          const largestInPrompt = Math.max(...promptNumbers);

          if (shown < largestInPrompt) {
            issues.push(`${question.id}: table shows ${shown} but prompt mentions ${largestInPrompt} | ${question.prompt}`);
          }
        }
      }
    }

    expect(issues).toEqual([]);
  });
});
