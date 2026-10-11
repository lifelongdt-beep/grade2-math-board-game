import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import { unit1Lesson11 } from './unit1';
import { unit2Lesson11 } from './unit2';
import { unit3Lesson11 } from './unit3';
import { unit4Lesson11 } from './unit4';
import { unit5Lesson11 } from './unit5';

// ════════════════════════════════════════════════════════════════════
// 1학년 1학기 차시에 어떤 문항 뭉치를 쓸지
// ────────────────────────────────────────────────────────────────────
// 3학년과 같은 얼개입니다 — 차시 제목이 아니라 차시 번호로 고릅니다.
// 차시 번호는 curriculum11.ts의 차례에서 나오고, 그 차례는 지도서의
// 단원 전개 계획 그대로입니다.
// ════════════════════════════════════════════════════════════════════

export const grade11FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '1-1') return null;
  if (lesson.unitNo === 1) return unit1Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 2) return unit2Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 3) return unit3Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 4) return unit4Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 5) return unit5Lesson11(lesson.lessonNo, difficulty);
  return null;
};

/** 1학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade11Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade11FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
