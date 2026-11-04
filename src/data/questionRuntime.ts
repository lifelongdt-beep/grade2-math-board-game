import { grade2Support } from './grade2/supportScope';
import type { Difficulty, Lesson, Question } from '../types';
import { 도입복습차시 } from './introReview';
import { 힌트다듬기 } from './hintUpgrade';
import { 그림추론 } from './autoFigure';
import { rawGenerator } from './questionRegistry';
export interface GenerateQuestionsOptions { castleDans?: number[]; 판?: number; }
export const generateClassQuestions = (
  lesson: Lesson,
  difficulty: Difficulty,
  options?: GenerateQuestionsOptions,
): Question[] => {
  const 자기것 = generateQuestions(lesson, difficulty, options);
  const 앞차시들 = 도입복습차시(lesson);
  if (!앞차시들) return 자기것;
  const 줄들 = 앞차시들.map((l) => generateQuestions(l, difficulty, { 판: options?.판 })).filter((qs) => qs.length > 0);
  if (줄들.length === 0) return 자기것;
  const 목표 = Math.max(자기것.length, 20);
  const 본 = new Set<string>();
  const 판 = options?.판 ?? 0;
  // 뒤 판은 앞 판들의 복습 문항을 피합니다. 다른 차시에서 온 같은 글도 같은 문제로 봅니다.
  const 글답 = (q: Question) => `${q.basePrompt ?? q.prompt}|${q.answer}`;
  for (let 앞판 = 0; 앞판 < 판; 앞판 += 1) {
    const 열쇠 = `${lesson.id}|${difficulty}|${앞판}`;
    if (!판에서낸복습.has(열쇠)) generateClassQuestions(lesson, difficulty, { ...options, 판: 앞판 });
    for (const k of 판에서낸복습.get(열쇠) ?? []) 본.add(k);
  }
  const 모음: Question[] = [];
  for (let 차례 = 0; 모음.length < 목표 && 줄들.some((qs) => 차례 < qs.length); 차례 += 1) {
    for (const qs of 줄들) {
      const q = qs[차례];
      if (!q || 모음.length >= 목표) continue;
      const 열쇠 = `${q.basePrompt ?? q.prompt}|${q.answer}|${q.lessonId}`;
      if (본.has(열쇠) || (판 && 본.has(글답(q)))) continue;
      본.add(열쇠);
      본.add(글답(q));
      모음.push({ ...q, id: `${lesson.id}-${difficulty}-review-${판 ? `p${판}-` : ""}${모음.length + 1}`, lessonId: lesson.id, difficulty });
    }
  }
  판에서낸복습.set(`${lesson.id}|${difficulty}|${판}`, new Set(모음.map(글답)));
  return 모음;
};

// 판마다 낸 단원 도입 복습 문항입니다(차시·수준·판).
const 판에서낸복습 = new Map<string, Set<string>>();


export const generateQuestions = (lesson: Lesson, difficulty: Difficulty, options?: GenerateQuestionsOptions): Question[] =>
  rawGenerator(lesson)(lesson, difficulty, options).map(q => {
    const studentHint = 힌트다듬기(q.prompt, q.answer, q.support.studentHint);
    const hinted = studentHint === q.support.studentHint ? q : { ...q, support: { ...q.support, studentHint } };
    const withHint = grade2Support(hinted, lesson);
    if (withHint.visual || withHint.choiceVisuals) return withHint;
    const visual = 그림추론(withHint.prompt);
    return visual ? { ...withHint, visual } : withHint;
  });
export const generateLessonBank = (lesson: Lesson): Record<Difficulty, Question[]> => ({
  하: generateQuestions(lesson, '하'), 중: generateQuestions(lesson, '중'), 상: generateQuestions(lesson, '상'),
});
export { ALL_CASTLE_DEFENSE_DANS, CASTLE_DIVIDE_TITLE, CASTLE_MULTIPLY_TITLE, demandOfStrategy, isCastleLesson } from './lessonKinds';
