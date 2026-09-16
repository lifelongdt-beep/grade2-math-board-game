import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from './build';
import { lesson1Easy, lesson1Hard, lesson1Middle } from './unit1/lesson1';
import { lesson23Easy, lesson23Hard, lesson23Middle } from './unit1/lesson23';
import { lesson4Easy, lesson4Hard, lesson4Middle } from './unit1/lesson4';
import { lesson567Easy, lesson567Hard, lesson567Middle } from './unit1/lesson567';
import { lesson8Easy, lesson8Hard, lesson8Middle } from './unit1/lesson8';
import type { Kind } from './unit2/kinds';
import { unit2Lesson1Easy, unit2Lesson1Hard, unit2Lesson1Middle } from './unit2/lesson1';
import { multiplyEasy, multiplyHard, multiplyMiddle } from './unit2/multiply';
import { unit3Lesson1Easy } from './unit3/lesson1';
import {
  대칭성질,
  선대칭Easy,
  선대칭Middle,
  점대칭Easy,
  점대칭Middle,
  합동Easy,
  합동Middle,
  합동성질Easy,
  합동성질Hard,
} from './unit3/lessons';
import type { DecimalKind } from './unit4/multiply';
import { decimalEasy, decimalHard, decimalMiddle } from './unit4/multiply';
import { unit4Lesson1Easy, 소수점위치Easy } from './unit4/lessons';
import type { Rounding } from './util';

// ════════════════════════════════════════════════════════════════════
// 5학년 차시에 어떤 문항 뭉치를 쓸지
// ────────────────────────────────────────────────────────────────────
// 2학년 생성기는 차시 제목을 문자열로 맞추어 갈래를 정합니다. 제목이
// 조금만 달라도 조용히 어긋나는 방식이라, 5학년에서는 차시 번호로
// 고릅니다. 차시 번호는 curriculum5.ts의 차례에서 나오고, 그 차례는
// 지도서의 단원 전개 계획 그대로입니다.
//
// 아직 만들지 않은 단원은 null을 돌려줍니다. 그러면 앱은 5학년 차시를
// 보여 주지 않습니다 — 2학년 문항을 대신 내보내는 것보다 낫습니다.
// ════════════════════════════════════════════════════════════════════

const unit1Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  // 5·6·7차시는 올림 / 버림 / 반올림입니다. 그 차시까지 배운 방법만
  // 골라 씁니다 — 6차시 문항에 반올림이 나오면 아직 배우지 않은 것을
  // 묻는 셈이 됩니다.
  const 어림차시: Record<number, { mode: Rounding; 아는방법: Rounding[] }> = {
    5: { mode: 'ceil', 아는방법: ['ceil'] },
    6: { mode: 'floor', 아는방법: ['ceil', 'floor'] },
    7: { mode: 'round', 아는방법: ['ceil', 'floor', 'round'] },
  };

  if (lessonNo === 1) {
    return difficulty === '하' ? lesson1Easy : difficulty === '중' ? lesson1Middle : lesson1Hard;
  }
  if (lessonNo === 2 || lessonNo === 3) {
    // 2차시는 이상·이하(경곗값을 넣음), 3차시는 초과·미만(넣지 않음).
    const included = lessonNo === 2;
    // 3차시에서는 이상·이하를 이미 배웠으므로 두 말을 나란히 놓고
    // 견주는 문항을 낼 수 있습니다. 2차시에서는 아직 안 됩니다.
    if (difficulty === '하') return lesson23Easy(included);
    if (difficulty === '중') return lesson23Middle(included);
    return lesson23Hard(included, lessonNo === 3);
  }
  if (lessonNo === 4) {
    return difficulty === '하' ? lesson4Easy : difficulty === '중' ? lesson4Middle : lesson4Hard;
  }
  if (어림차시[lessonNo]) {
    const { mode, 아는방법 } = 어림차시[lessonNo];
    if (difficulty === '하') return lesson567Easy(mode);
    if (difficulty === '중') return lesson567Middle(mode);
    return lesson567Hard(mode, 아는방법);
  }
  if (lessonNo === 8) {
    return difficulty === '하' ? lesson8Easy : difficulty === '중' ? lesson8Middle : lesson8Hard;
  }
  return null;
};

// 2단원 2~7차시가 맡는 곱셈의 종류입니다. 차시 차례는 지도서의 단원
// 전개 계획 그대로입니다 — (진분수)×(자연수)부터 시작해 (대분수)×(대분수)로
// 끝납니다. 앞 차시에서 배운 것 위에 하나씩 얹히는 차례라, 이 표를
// 바꾸면 차시가 배우지 않은 곱셈을 묻게 됩니다.
const unit2Kinds: Record<number, Kind> = {
  2: 'proper-whole',
  3: 'mixed-whole',
  4: 'whole-proper',
  5: 'whole-mixed',
  6: 'proper-proper',
  7: 'mixed-mixed',
};

const unit2Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) {
    return difficulty === '하' ? unit2Lesson1Easy : difficulty === '중' ? unit2Lesson1Middle : unit2Lesson1Hard;
  }
  const kind = unit2Kinds[lessonNo];
  if (!kind) return null;
  if (difficulty === '하') return multiplyEasy(kind);
  if (difficulty === '중') return multiplyMiddle(kind);
  return multiplyHard(kind);
};

// 3단원 차시별 문항 뭉치입니다. 지도서의 차례 그대로,
//   2 합동  3 합동의 성질  4 선대칭  5 선대칭의 성질
//   6 점대칭  7 점대칭의 성질
// 로 이어집니다. 성질 차시(5·7)는 뭉치 다섯을 수준에 따라 나눕니다.
const unit3Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit3Lesson1Easy;
  if (lessonNo === 2) {
    if (difficulty === '하') return 합동Easy;
    if (difficulty === '중') return 합동Middle;
    return [...합동Middle, ...합동Easy.slice(2)];
  }
  if (lessonNo === 3) {
    if (difficulty === '하') return 합동성질Easy;
    if (difficulty === '중') return [...합동성질Easy.slice(1), ...합동성질Hard.slice(1)];
    return 합동성질Hard;
  }
  if (lessonNo === 4) {
    if (difficulty === '하') return 선대칭Easy;
    if (difficulty === '중') return 선대칭Middle;
    return [...선대칭Middle, ...선대칭Easy.slice(2)];
  }
  if (lessonNo === 5) {
    const 뭉치 = 대칭성질(true);
    if (difficulty === '하') return 뭉치.slice(0, 4);
    if (difficulty === '중') return [...뭉치.slice(1), 뭉치[0]];
    return [...뭉치.slice(3), ...뭉치.slice(0, 3)];
  }
  if (lessonNo === 6) {
    if (difficulty === '하') return 점대칭Easy;
    if (difficulty === '중') return [...점대칭Middle, ...점대칭Easy.slice(3)];
    return [...점대칭Middle, ...점대칭Easy.slice(2)];
  }
  if (lessonNo === 7) {
    const 뭉치 = 대칭성질(false);
    if (difficulty === '하') return 뭉치.slice(0, 4);
    if (difficulty === '중') return [...뭉치.slice(1), 뭉치[0]];
    return [...뭉치.slice(3), ...뭉치.slice(0, 3)];
  }
  return null;
};

// 4단원 2~7차시가 맡는 곱셈의 종류입니다. 지도서의 차례 그대로,
// (1보다 작은 소수)×(자연수)부터 (1보다 큰 소수)×(1보다 큰 소수)까지
// 한 차시에 하나씩 올라갑니다.
const unit4Kinds: Record<number, DecimalKind> = {
  2: 'small-whole',
  3: 'big-whole',
  4: 'whole-small',
  5: 'whole-big',
  6: 'small-small',
  7: 'big-big',
};

const unit4Families = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  if (lessonNo === 1) return unit4Lesson1Easy;
  if (lessonNo === 8) {
    // 8차시는 곱의 소수점 위치 하나를 여러 갈래로 묻습니다.
    if (difficulty === '하') return 소수점위치Easy.slice(0, 4);
    if (difficulty === '중') return 소수점위치Easy;
    return [...소수점위치Easy.slice(3), ...소수점위치Easy.slice(0, 2)];
  }
  const kind = unit4Kinds[lessonNo];
  if (!kind) return null;
  if (difficulty === '하') return decimalEasy(kind);
  if (difficulty === '중') return decimalMiddle(kind);
  return decimalHard(kind);
};

export const grade5FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '5-2') return null;
  if (lesson.unitNo === 1) return unit1Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 2) return unit2Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 3) return unit3Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 4) return unit4Families(lesson.lessonNo, difficulty);
  return null;
};

/** 5학년 차시의 문항입니다. 5학년 차시가 아니면 null입니다. */
export const generateGrade5Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade5FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
