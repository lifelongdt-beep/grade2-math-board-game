import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import { unit1Lesson42 } from './unit1';
import { unit2Lesson42 } from './unit2';
import { unit3Lesson42 } from './unit3';
import { unit4Lesson42 } from './unit4';
import { unit5Lesson42 } from './unit5';
import { unit6Lesson42 } from './unit6';

// ════════════════════════════════════════════════════════════════════
// 4학년 2학기 차시에 어떤 문항 뭉치를 쓸지 — 1학년과 같은 얼개입니다.
// ════════════════════════════════════════════════════════════════════

const 단원별 = [unit1Lesson42, unit2Lesson42, unit3Lesson42, unit4Lesson42, unit5Lesson42, unit6Lesson42];

export const grade42FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '4-2') return null;
  const 고르기 = 단원별[lesson.unitNo - 1];
  return 고르기 ? 고르기(lesson.lessonNo, difficulty) : null;
};

/** 4학년 2학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade42Questions = (lesson: Lesson, difficulty: Difficulty, 판 = 0): Question[] | null => {
  const families = grade42FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families, 판);
};
