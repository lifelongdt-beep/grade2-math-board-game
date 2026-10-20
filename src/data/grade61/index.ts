import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import { unit1Lesson61 } from './unit1';
import { unit2Lesson61 } from './unit2';
import { unit3Lesson61 } from './unit3';
import { unit4Lesson61 } from './unit4';
import { unit5Lesson61 } from './unit5';
import { unit6Lesson61 } from './unit6';

// ════════════════════════════════════════════════════════════════════
// 6학년 1학기 차시에 어떤 문항 뭉치를 쓸지 — 1학년과 같은 얼개입니다.
// ════════════════════════════════════════════════════════════════════

const 단원별 = [unit1Lesson61, unit2Lesson61, unit3Lesson61, unit4Lesson61, unit5Lesson61, unit6Lesson61];

export const grade61FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '6-1') return null;
  const 고르기 = 단원별[lesson.unitNo - 1];
  return 고르기 ? 고르기(lesson.lessonNo, difficulty) : null;
};

/** 6학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade61Questions = (lesson: Lesson, difficulty: Difficulty, 판 = 0): Question[] | null => {
  const families = grade61FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families, 판);
};
