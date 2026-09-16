import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from './build';
import { lesson1Easy, lesson1Hard, lesson1Middle } from './unit1/lesson1';
import { lesson23Easy, lesson23Hard, lesson23Middle } from './unit1/lesson23';
import { lesson4Easy, lesson4Hard, lesson4Middle } from './unit1/lesson4';
import { lesson567Easy, lesson567Hard, lesson567Middle } from './unit1/lesson567';
import { lesson8Easy, lesson8Hard, lesson8Middle } from './unit1/lesson8';
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

export const grade5FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '5-2') return null;
  if (lesson.unitNo === 1) return unit1Families(lesson.lessonNo, difficulty);
  return null;
};

/** 5학년 차시의 문항입니다. 5학년 차시가 아니면 null입니다. */
export const generateGrade5Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade5FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
