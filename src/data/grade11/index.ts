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

const 차시뭉치 = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.unitNo === 1) return unit1Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 2) return unit2Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 3) return unit3Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 4) return unit4Lesson11(lesson.lessonNo, difficulty);
  if (lesson.unitNo === 5) return unit5Lesson11(lesson.lessonNo, difficulty);
  return null;
};

// ── 아직 배우지 않은 수 ─────────────────────────────────────────────
// 1단원(9까지의 수)과 3단원(덧셈과 뺄셈)은 9까지, 5단원 3차시(십몇)는
// 19까지의 수만 압니다. 오답 보기를 만들다 보면 '10마리', '13', '31'
// 처럼 아직 배우지 않은 수가 섞여 들어옵니다. 아이에게 그런 보기는
// 오답이 아니라 읽을 수 없는 글자입니다. 문항 뭉치마다 따로 막으면
// 새 뭉치를 만들 때 또 빠뜨리므로 여기서 한 번에 거릅니다.
const 아는수 = (lesson: Lesson): number | null =>
  lesson.unitNo === 1 || lesson.unitNo === 3 ? 9 : lesson.unitNo === 5 && lesson.lessonNo === 3 ? 19 : null;

const 수범위안 = (text: string, 끝: number) => [...text.matchAll(/\d+/g)].every((m) => Number(m[0]) <= 끝);

const 범위로거르기 = (family: G5Family, 끝: number): G5Family => ({
  ...family,
  make: (seed, lv) => {
    const spec = family.make(seed, lv);
    if (!spec || !수범위안(spec.prompt, 끝) || !수범위안(spec.answer, 끝)) return null;
    const wrongs = spec.wrongs.filter((w) => 수범위안(w, 끝));
    // 모자라면 답과 가까운 수로 채웁니다(답이 '7마리'처럼 수 하나일 때만).
    const 수답 = /^(\d+)(\D*)$/.exec(spec.answer);
    if (wrongs.length < 3 && 수답) {
      const n = Number(수답[1]);
      for (const d of [1, -1, 2, -2, 3, -3]) {
        const v = n + d;
        const t = `${v}${수답[2]}`;
        if (v >= (n === 0 ? 0 : 1) && v <= 끝 && !wrongs.includes(t)) wrongs.push(t);
        if (wrongs.length >= 3) break;
      }
    }
    return wrongs.length >= 3 ? { ...spec, wrongs } : null;
  },
});

export const grade11FamiliesFor = (lesson: Lesson, difficulty: Difficulty): G5Family[] | null => {
  if (lesson.semester !== '1-1') return null;
  const families = 차시뭉치(lesson, difficulty);
  const 끝 = 아는수(lesson);
  return families && 끝 !== null ? families.map((f) => 범위로거르기(f, 끝)) : families;
};

/** 1학년 1학기 차시의 문항입니다. 그 차시가 아니면 null입니다. */
export const generateGrade11Questions = (lesson: Lesson, difficulty: Difficulty, 판 = 0): Question[] | null => {
  const families = grade11FamiliesFor(lesson, difficulty);
  if (!families) return null;
  return buildGrade5Questions(lesson, difficulty, families, 판);
};
