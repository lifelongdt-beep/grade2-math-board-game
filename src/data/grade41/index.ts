import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import { unit1Lesson41 } from './unit1';
import { unit2Lesson41 } from './unit2';
import { unit3Lesson41 } from './unit3';
import { unit4Lesson41 } from './unit4';
import { unit5Lesson41 } from './unit5';
import { unit6Lesson41 } from './unit6';

// ════════════════════════════════════════════════════════════════════
// 4학년 1학기 차시에 어떤 문항 뭉치를 쓸지 — 1학년과 같은 얼개입니다.
// ════════════════════════════════════════════════════════════════════

const 단원별 = [unit1Lesson41, unit2Lesson41, unit3Lesson41, unit4Lesson41, unit5Lesson41, unit6Lesson41];

export const grade41FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '4-1') return null;
  const 고르기 = 단원별[lesson.unitNo - 1];
  return 고르기 ? 고르기(lesson.lessonNo, difficulty) : null;
};

/** 4학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade41Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade41FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
