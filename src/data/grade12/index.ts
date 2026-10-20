import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import { unit1Lesson12 } from './unit1';
import { unit2Lesson12 } from './unit2';
import { unit3Lesson12 } from './unit3';
import { unit4Lesson12 } from './unit4';
import { unit5Lesson12 } from './unit5';
import { unit6Lesson12 } from './unit6';

// ════════════════════════════════════════════════════════════════════
// 1학년 2학기 차시에 어떤 문항 뭉치를 쓸지 — 1-1과 같은 얼개입니다.
// ════════════════════════════════════════════════════════════════════

const 단원별 = [unit1Lesson12, unit2Lesson12, unit3Lesson12, unit4Lesson12, unit5Lesson12, unit6Lesson12];

export const grade12FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '1-2') return null;
  const 고르기 = 단원별[lesson.unitNo - 1];
  return 고르기 ? 고르기(lesson.lessonNo, difficulty) : null;
};

/** 1학년 2학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade12Questions = (lesson: Lesson, difficulty: Difficulty, 판 = 0): Question[] | null => {
  const families = grade12FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families, 판);
};
