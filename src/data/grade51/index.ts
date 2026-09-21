import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import type { LessonKind } from './unit1/expr';
import { unit1Easy, unit1Hard, unit1Lesson1, unit1Middle } from './unit1/lessons';
import { unit2Common, unit2Find, unit2Lesson1, unit2Lesson2 } from './unit2/lessons';
import { unit3Lesson1, unit3Lesson2, unit3Lesson3, unit3Lesson4, unit3Lesson5 } from './unit3/lessons';
import {
  unit4Lesson1,
  unit4Lesson2,
  unit4Lesson3,
  unit4Lesson4,
  unit4Lesson5,
  unit4Lesson6,
  unit4Lesson7,
} from './unit4/lessons';
import type { Kind as Unit5Kind } from './unit5/lessons';
import { unit5Easy, unit5Hard, unit5Lesson1, unit5Middle } from './unit5/lessons';
import type { AreaKind } from './unit6/lessons';
import {
  unit6Area,
  unit6Lesson1,
  unit6Lesson2,
  unit6Lesson3,
  unit6Lesson4,
  unit6Lesson5,
} from './unit6/lessons';

// ════════════════════════════════════════════════════════════════════
// 5학년 1학기 차시에 어떤 문항 뭉치를 쓸지
// ────────────────────────────────────────────────────────────────────
// 5-2와 같은 얼개입니다 — 차시 제목이 아니라 차시 번호로 고릅니다.
// 제목으로 맞추면 글자 하나만 달라져도 조용히 어긋나고, 그러면 아직
// 배우지 않은 것을 묻게 됩니다.
//
// 차시 번호는 curriculum51.ts의 차례에서 나오고, 그 차례는 지도서의
// 단원 전개 계획 그대로입니다.
// ════════════════════════════════════════════════════════════════════

// 1단원 2~6차시가 맡는 연산의 조합입니다. 지도서의 차시 차례 그대로,
// 덧셈과 뺄셈으로 시작해 네 연산이 모두 섞인 식으로 끝납니다. 이 표를
// 바꾸면 차시가 배우지 않은 연산을 묻게 됩니다.
const unit1Kinds: Record<number, LessonKind> = {
  2: 'add-sub',
  3: 'mul-div',
  4: 'add-sub-mul',
  5: 'add-sub-div',
  6: 'all',
};

const unit1Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit1Lesson1;
  const kind = unit1Kinds[lessonNo];
  if (!kind) return null;
  if (difficulty === '하') return unit1Easy(kind);
  if (difficulty === '중') return unit1Middle(kind);
  return unit1Hard(kind);
};

// 2단원 차시별 문항 뭉치입니다. 지도서의 차례 그대로,
//   2 약수와 배수  3 공약수와 최대공약수  4 최대공약수 구하기
//   5 공배수와 최소공배수  6 최소공배수 구하기
// 로 이어집니다. 3·5차시와 4·6차시는 하는 일이 같고 약수냐 배수냐만
// 다르므로 한 뭉치를 쪽으로 나누어 씁니다.
//
// 차례를 지키는 것이 여기서는 특히 중요합니다. 3·4차시 문항에
// '최소공배수'가 나오면 두 차시를 앞지르게 됩니다.
const unit2Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit2Lesson1;
  if (lessonNo === 2) return unit2Lesson2(difficulty);
  if (lessonNo === 3) return unit2Common('divisor', difficulty);
  if (lessonNo === 4) return unit2Find('divisor', difficulty);
  if (lessonNo === 5) return unit2Common('multiple', difficulty);
  if (lessonNo === 6) return unit2Find('multiple', difficulty);
  return null;
};

// 3단원 차시별 문항 뭉치입니다. 지도서의 차례 그대로,
//   2 두 양 사이의 관계 (1)  3 (2)  4 식으로 나타내기
//   5 생활 속에서 찾아 식으로 나타내기
// 로 이어집니다. 2·3차시는 말로만 표현합니다 — ○, △ 기호로 식을
// 세우는 것은 4차시에서 처음 배웁니다.
const unit3Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit3Lesson1;
  if (lessonNo === 2) return unit3Lesson2(difficulty);
  if (lessonNo === 3) return unit3Lesson3(difficulty);
  if (lessonNo === 4) return unit3Lesson4(difficulty);
  if (lessonNo === 5) return unit3Lesson5(difficulty);
  return null;
};

// 4단원 차시별 문항 뭉치입니다. 지도서의 차례 그대로,
//   2 크기가 같은 분수  3 만들기  4 약분과 기약분수  5 통분
//   6 분수의 크기 비교  7 분수와 소수의 크기 비교
// 로 이어집니다. 말의 차례가 곧 차시의 차례입니다 — '약분'은 4차시,
// '통분'은 5차시에서 처음 나옵니다.
const unit4Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit4Lesson1;
  if (lessonNo === 2) return unit4Lesson2(difficulty);
  if (lessonNo === 3) return unit4Lesson3(difficulty);
  if (lessonNo === 4) return unit4Lesson4(difficulty);
  if (lessonNo === 5) return unit4Lesson5(difficulty);
  if (lessonNo === 6) return unit4Lesson6(difficulty);
  if (lessonNo === 7) return unit4Lesson7(difficulty);
  return null;
};

// 5단원 2~7차시가 맡는 계산의 꼴입니다. 지도서의 차례 그대로,
// 합이 1보다 작은 진분수의 덧셈에서 받아내림이 있는 대분수의 뺄셈까지
// 한 차시에 하나씩 올라갑니다. 이 표를 바꾸면 차시가 아직 다루지 않은
// 꼴을 묻게 됩니다.
const unit5Kinds: Record<number, Unit5Kind> = {
  2: 'proper-add-small',
  3: 'proper-add-big',
  4: 'mixed-add',
  5: 'proper-sub',
  6: 'mixed-sub-plain',
  7: 'mixed-sub-borrow',
};

const unit5Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit5Lesson1;
  const kind = unit5Kinds[lessonNo];
  if (!kind) return null;
  if (difficulty === '하') return unit5Easy(kind);
  if (difficulty === '중') return unit5Middle(kind);
  return unit5Hard(kind);
};

// 6단원 차시별 문항 뭉치입니다. 지도서의 차례 그대로,
//   2 다각형의 둘레  3 1 cm²  4 직사각형의 넓이  5 1 m²와 1 km²
//   6 평행사변형  7 삼각형  8 사다리꼴  9 마름모
// 로 이어집니다. 6~9차시는 하는 일이 같고 도형만 다르므로 한 뭉치를
// 도형으로 나누어 씁니다.
const unit6Kinds: Record<number, AreaKind> = {
  6: 'para',
  7: 'triangle',
  8: 'trapezoid',
  9: 'rhombus',
};

const unit6Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit6Lesson1(difficulty);
  if (lessonNo === 2) return unit6Lesson2(difficulty);
  if (lessonNo === 3) return unit6Lesson3(difficulty);
  if (lessonNo === 4) return unit6Lesson4(difficulty);
  if (lessonNo === 5) return unit6Lesson5(difficulty);
  const kind = unit6Kinds[lessonNo];
  return kind ? unit6Area(kind, difficulty) : null;
};

export const grade51FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '5-1') return null;
  if (lesson.unitNo === 1) return unit1Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 2) return unit2Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 3) return unit3Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 4) return unit4Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 5) return unit5Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 6) return unit6Families(lesson.lessonNo, difficulty);
  return null;
};

/** 5학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade51Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade51FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
