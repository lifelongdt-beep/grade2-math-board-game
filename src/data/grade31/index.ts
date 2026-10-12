import type { Difficulty, Lesson, Question } from '../../types';
import { buildGrade5Questions, type G5Family } from '../grade5/build';
import type { Kind } from './unit1/core';
import { unit1Calc, unit1Estimate, unit1Lesson1 } from './unit1/lessons';
import { unit2Lesson } from './unit2/lessons';
import { unit3Lesson } from './unit3/lessons';
import { unit4Lesson } from './unit4/lessons';
import { unit5Lesson } from './unit5/lessons';
import { unit6Lesson } from './unit6/lessons';
import { unit1Lesson32 } from '../grade32/unit1/lessons';
import { unit2Lesson32 } from '../grade32/unit2/lessons';
import { unit3Lesson32 } from '../grade32/unit3/lessons';
import { unit4Lesson32 } from '../grade32/unit4/lessons';
import { unit5Lesson32 } from '../grade32/unit5/lessons';
import { unit6Lesson32 } from '../grade32/unit6/lessons';
import { 나머지생각, 네모범위, 두단계문장제, 수카드곱, 수카드합차, 어떤수, 어떤수덧뺄, 어림견주기, 잘못계산, 잘못계산덧뺄 } from '../thinking/integer';
import { 걸린시간, 단위견주기, 시작시각, 저울맞춤, 직각시각, 직사각형변거꾸로, 처음양, 컵비교 } from '../grade3/thinking';

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

// ── 생각하는 문항 덧붙이기 ─────────────────────────────────────────
// 계산 차시가 계산만 되풀이하지 않도록 거꾸로 생각하기·잘못 계산한 값
// 고치기·수 카드·어림 견주기·나머지의 뜻·문장제를 덧붙입니다. 받아올림
// 차례를 지키려고, 어떤 받아올림이든 쓰는 차시(여러 번 있는 차시)와
// 어림셈 차시에만 붙입니다.
// 3-1 4단원은 차시마다 올림 꼴이 정해져 있습니다(4차시 일의 자리에서만,
// 5차시 두 번).
const 일의자리올림만 = (a: number, b: number) => (a % 10) * b >= 10 && Math.floor(a / 10) * b + Math.floor(((a % 10) * b) / 10) < 10;
const 올림두번 = (a: number, b: number) => (a % 10) * b >= 10 && Math.floor(a / 10) * b + Math.floor(((a % 10) * b) / 10) >= 10;

const 생각 = {
  덧어떤수: 어떤수덧뺄('3-1-1', '+', [120, 789]),
  뺄어떤수: 어떤수덧뺄('3-1-1', '-', [120, 789]),
  덧뺄잘못: 잘못계산덧뺄('3-1-1', [110, 499]),
  세자리카드: 수카드합차('3-1-1'),
  덧어림: 어림견주기('3-1-1-add', '+', [110, 890], [110, 890]),
  뺄어림: 어림견주기('3-1-1-sub', '-', [500, 990], [110, 480]),
  구구어떤수: 어떤수('3-1-3', '×', [2, 9], [2, 9]),
  두한어떤수4: 어떤수('3-1-4-4', '×', [11, 99], [2, 9], 1, 'multiplication', 일의자리올림만),
  두한어떤수5: 어떤수('3-1-4-5', '×', [11, 99], [2, 9], 1, 'multiplication', 올림두번),
  두한잘못5: 잘못계산('3-1-4-5', '×', [11, 99], [2, 9], 'multiplication', 올림두번),
  두한어림: 어림견주기('3-1-4', '×', [11, 99], [2, 9]),
  세한어떤수: 어떤수('3-2-1-a', '×', [102, 999], [2, 9]),
  세한잘못: 잘못계산('3-2-1-a', '×', [102, 999], [2, 9]),
  세한카드: 수카드곱('3-2-1-a', 3, 1),
  두두어떤수: 어떤수('3-2-1-b', '×', [11, 99], [11, 99]),
  두두카드: 수카드곱('3-2-1-b', 2, 2),
  두두문장제: 두단계문장제('3-2-1-b', [11, 99], [11, 40]),
  두두네모: 네모범위('3-2-1-b', [11, 30], [2, 9]),
  두두어림: 어림견주기('3-2-1-b', '×', [11, 99], [11, 99]),
  나눔어떤수: 어떤수('3-2-2', '÷', [2, 20], [3, 9]),
  두자리나머지: 나머지생각('3-2-2-a', [11, 99], [2, 9]),
  나눔잘못: 잘못계산('3-2-2', '÷', [2, 20], [2, 9]),
  세자리나머지: 나머지생각('3-2-2-b', [100, 999], [2, 9]),
  나눔네모: 네모범위('3-2-2', [2, 9], [11, 99]),
  나눔어림: 어림견주기('3-2-2', '÷', [100, 900], [2, 9]),
};

const 덧붙일것 = (lesson: Lesson, lv: Difficulty): G5Family[] => {
  const 하 = lv === '하';
  const 키 = `${lesson.semester}-${lesson.unitNo}-${lesson.lessonNo}`;
  const 표: Record<string, G5Family[]> = {
    '3-1-1-4': 하 ? [생각.덧어떤수] : [생각.덧어떤수, 생각.덧뺄잘못, 생각.세자리카드],
    '3-1-1-5': [생각.덧어림],
    '3-1-1-8': 하 ? [생각.뺄어떤수] : [생각.뺄어떤수, 생각.덧뺄잘못, 생각.세자리카드],
    '3-1-1-9': [생각.뺄어림],
    '3-1-3-4': [생각.구구어떤수],
    '3-1-3-5': [생각.구구어떤수],
    // 4단원 수 카드 문항은 단원에 이미 있습니다(식으로 답하는 꼴).
    '3-1-4-4': [생각.두한어떤수4],
    '3-1-4-5': 하 ? [생각.두한어떤수5] : [생각.두한어떤수5, 생각.두한잘못5],
    '3-1-4-6': [생각.두한어림],
    '3-1-2-4': [직각시각],
    '3-1-2-6': 하 ? [] : [직사각형변거꾸로],
    // 5단원: 단위가 섞인 양을 같은 단위로 맞추어 견주기, 두 시각 사이의 시간
    '3-1-5-1': [단위견주기('m-cm'), 단위견주기('시간-분')],
    '3-1-5-2': [단위견주기('cm-mm')],
    '3-1-5-5': [단위견주기('분-초')],
    '3-1-5-6': 하 ? [] : [단위견주기('분-초')],
    '3-1-5-7': [시작시각, 걸린시간],
    // 2학기 도입 차시는 1학기에 배운 곱셈·나눗셈을 거꾸로 생각해 봅니다.
    '3-2-1-1': [생각.두한어림],
    '3-2-2-1': [생각.구구어떤수],
    '3-2-1-4': 하 ? [생각.세한어떤수] : [생각.세한어떤수, 생각.세한잘못, 생각.세한카드],
    '3-2-1-7': 하 ? [] : [생각.두두네모],
    '3-2-1-8': 하 ? [생각.두두어떤수] : [생각.두두어떤수, 생각.두두카드, 생각.두두문장제],
    '3-2-1-9': [생각.두두어림],
    // 5차시는 내림이 없는 나눗셈만 다루므로 붙이지 않습니다.
    '3-2-2-6': 하 ? [생각.두자리나머지] : [생각.두자리나머지, 생각.나눔어떤수],
    '3-2-2-7': [생각.나눔어떤수, 생각.나눔잘못, 생각.두자리나머지],
    '3-2-2-9': 하 ? [생각.세자리나머지] : [생각.세자리나머지, 생각.나눔네모],
    '3-2-2-10': [생각.나눔어림],
    '3-2-5-2': [컵비교],
    '3-2-5-3': [단위견주기('L-mL')],
    '3-2-5-5': [컵비교, 처음양('L-mL')],
    '3-2-5-7': [단위견주기('kg-g')],
    '3-2-5-6': [저울맞춤],
    '3-2-5-9': [저울맞춤, 처음양('kg-g')],
  };
  return 표[키] ?? [];
};

const 기본뭉치 = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  // 3학년 2학기도 같은 틀로 만듭니다. 단원이 붙는 대로 여기 늘립니다.
  if (lesson.semester === '3-2') {
    if (lesson.unitNo === 1) return unit1Lesson32(lesson.lessonNo, difficulty);
    if (lesson.unitNo === 2) return unit2Lesson32(lesson.lessonNo, difficulty);
    if (lesson.unitNo === 3) return unit3Lesson32(lesson.lessonNo, difficulty);
    if (lesson.unitNo === 4) return unit4Lesson32(lesson.lessonNo, difficulty);
    if (lesson.unitNo === 5) return unit5Lesson32(lesson.lessonNo, difficulty);
    if (lesson.unitNo === 6) return unit6Lesson32(lesson.lessonNo, difficulty);
    return null;
  }
  if (lesson.semester !== '3-1') return null;
  if (lesson.unitNo === 1) return unit1Families(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 2) return unit2Lesson(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 3) return unit3Lesson(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 4) return unit4Lesson(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 5) return unit5Lesson(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 6) return unit6Lesson(lesson.lessonNo, difficulty);
  return null;
};

export const grade31FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  const 기본 = 기본뭉치(lesson, difficulty);
  return 기본 ? [...기본, ...덧붙일것(lesson, difficulty)] : null;
};

/** 3학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade31Questions = (lesson: Lesson, difficulty: Difficulty): Question[] | null => {
  const families = grade31FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families);
};
