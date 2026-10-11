import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import { unit1Lesson62 } from './unit1';
import { unit2Lesson62 } from './unit2';
import { unit3Lesson62 } from './unit3';
import { unit4Lesson62 } from './unit4';
import { unit5Lesson62 } from './unit5';
import { unit6Lesson62 } from './unit6';

// ════════════════════════════════════════════════════════════════════
// 6학년 2학기 차시에 어떤 문항 뭉치를 쓸지 — 1학년과 같은 얼개입니다.
// ════════════════════════════════════════════════════════════════════

const 단원별 = [unit1Lesson62, unit2Lesson62, unit3Lesson62, unit4Lesson62, unit5Lesson62, unit6Lesson62];

export const grade62FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '6-2') return null;
  const 고르기 = 단원별[lesson.unitNo - 1];
  return 고르기 ? 고르기(lesson.lessonNo, difficulty) : null;
};

/** 6학년 2학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade62Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade62FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
