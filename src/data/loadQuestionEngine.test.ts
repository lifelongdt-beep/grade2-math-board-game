import { curriculum51 } from './curriculum51';
import { curriculum5 } from './curriculum5';
import { curriculum31 } from './curriculum31';
import { expect, it, vi } from 'vitest';
import { curriculum61 } from './curriculum61';
import { curriculum11 } from './curriculum11';
import { curriculum } from './curriculum';
import { generateClassQuestions } from './questionFactory';
import { 도입복습차시 } from './introReview';
import type { Difficulty } from '../types';

it('분리 엔진도 기본 문항과 선수 학년 도입 복습을 동일하게 만듭니다', async () => {
  const targets = [curriculum51[3].lessons[6], curriculum5[2].lessons[1], curriculum5[5].lessons[7], curriculum31[2].lessons[1], curriculum31[3].lessons[1], curriculum11[0].lessons[1], curriculum[0].lessons[1], curriculum61[0].lessons[0], curriculum61[0].lessons[1]];
  const levels: Difficulty[] = ['하','중','상'];
  const expected = targets.map(lesson => levels.map(level => generateClassQuestions(lesson, level)));
  vi.resetModules();
  const { loadQuestionEngine, requiredGrades } = await import('./loadQuestionEngine');
  const { rawGenerator } = await import('./questionRegistry');
  expect(() => rawGenerator(curriculum61[0].lessons[1])).toThrow();
  expect(requiredGrades([curriculum61[0].lessons[1]])).toEqual([6]);
  const intro = curriculum61[0].lessons[0];
  const prerequisites = 도입복습차시(intro) ?? [];
  expect(requiredGrades([intro])).toEqual([...new Set([6, ...prerequisites.map(l => Number(l.semester[0]))])].sort());
  for (let index = 0; index < targets.length; index++) {
    const engine = await loadQuestionEngine([targets[index]]);
    expect(levels.map(level => engine.generateClassQuestions(targets[index], level))).toEqual(expected[index]);
  }
}, 60000);
