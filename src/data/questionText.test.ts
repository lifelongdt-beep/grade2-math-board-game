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

  it('shows the number from the question in the place value table', () => {
    const issues: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'place-value') continue;

          const shown = Number(
            question.visual.columns.map((column) => String(column.value)).join(''),
          );
          const promptNumbers = question.prompt.match(/\d+/g)?.map(Number) ?? [];
          if (promptNumbers.length === 0) continue;

          if (!promptNumbers.includes(shown)) {
            issues.push(`${question.id}: table shows ${shown}, prompt has ${promptNumbers.join(',')} | ${question.prompt}`);
          }
        }
      }
    }

    expect(issues).toEqual([]);
  });
});
