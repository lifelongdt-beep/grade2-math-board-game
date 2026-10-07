import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import type { Kind } from './unit1/core';
import { unit1Calc, unit1Estimate, unit1Lesson1 } from './unit1/lessons';
import { unit2Lesson } from './unit2/lessons';
import { unit3Lesson } from './unit3/lessons';
import { unit4Lesson } from './unit4/lessons';

// ════════════════════════════════════════════════════════════════════
// 3학년 1학기 차시에 어떤 문항 뭉치를 쓸지
// ────────────────────────────────────────────────────────────────────
// 5학년과 같은 얼개입니다 — 차시 제목이 아니라 차시 번호로 고릅니다.
// 차시 번호는 curriculum31.ts의 차례에서 나오고, 그 차례는 지도서의
// 단원 전개 계획 그대로입니다.
//
// 문항을 만드는 틀은 5학년 것(grade5/build.ts)을 그대로 씁니다. 보기
// 섞기, 같은 문항 거르기, 해설 짓기는 학년과 상관없이 같은 일입니다.
// 도움말만 3학년 말로 적은 것을 씁니다(grade3/support.ts).
// ════════════════════════════════════════════════════════════════════

// 1단원 계산 차시가 맡는 꼴입니다. 지도서의 차시 차례 그대로입니다.
// 이 표를 바꾸면 차시가 배우지 않은 받아올림·받아내림을 묻게 됩니다.
const unit1Kinds: Record<number, Kind> = {
  2: 'add0',
  3: 'add1',
  4: 'add2',
  6: 'sub0',
  7: 'sub1',
  8: 'sub2',
};

const unit1Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit1Lesson1(difficulty);
  if (lessonNo === 5) return unit1Estimate(true, difficulty);
  if (lessonNo === 9) return unit1Estimate(false, difficulty);
  const kind = unit1Kinds[lessonNo];
  return kind ? unit1Calc(kind, difficulty) : null;
};

export const grade31FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '3-1') return null;
  if (lesson.unitNo === 1) return unit1Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 2) return unit2Lesson(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 3) return unit3Lesson(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 4) return unit4Lesson(lesson.lessonNo, difficulty);
  return null;
};

/** 3학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade31Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade31FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
