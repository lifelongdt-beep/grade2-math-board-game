import type { Difficulty, Lesson, Question } from '../types';
import type { GenerateQuestionsOptions } from './questionRuntime';
import { CASTLE_DIVIDE_TITLE } from './lessonKinds';
export type RawGenerator = (lesson: Lesson, difficulty: Difficulty, options?: GenerateQuestionsOptions) => Question[];
const generators = new Map<number, RawGenerator>();
export const registerGenerator = (grade: number, generator: RawGenerator) => { generators.set(grade, generator); };
export const rawGenerator = (lesson: Lesson): RawGenerator => {
  const grade = lesson.title === CASTLE_DIVIDE_TITLE ? 2 : Number(lesson.semester[0]);
  const generator = generators.get(grade);
  if (!generator) throw new Error(`${grade}학년 문항 엔진을 먼저 준비해야 합니다.`);
  return generator;
};
