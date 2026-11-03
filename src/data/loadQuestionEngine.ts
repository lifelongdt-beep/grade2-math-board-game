import type { Lesson } from '../types';
import { 도입복습차시 } from './introReview';
import { 놀이원본 } from './games';
import { CASTLE_DIVIDE_TITLE } from './lessonKinds';
const loaders = {
  1: () => import('./engineGrades/grade1'), 2: () => import('./engineGrades/grade2'),
  3: () => import('./engineGrades/grade3'), 4: () => import('./engineGrades/grade4'),
  5: () => import('./engineGrades/grade5'), 6: () => import('./engineGrades/grade6'),
};
const loading = new Map<number, Promise<unknown>>();
/** 도입 복습은 선수 학년을 쓰므로 선택 차시의 의존 학년까지 먼저 준비합니다. */
export function requiredGrades(lessons: Lesson[]): number[] {
  const grades = new Set<number>();
  const visit = (lesson: Lesson) => {
    grades.add(Number(lesson.semester[0]));
    if (lesson.title === CASTLE_DIVIDE_TITLE) grades.add(2);
    for (const source of [...(도입복습차시(lesson) ?? []), ...(놀이원본(lesson) ?? [])]) grades.add(Number(source.semester[0]));
  };
  lessons.forEach(visit);
  return [...grades].sort();
}
export async function loadQuestionEngine(lessons: Lesson[]) {
  await Promise.all(requiredGrades(lessons).map(grade => {
    if (!(grade in loaders)) throw new Error('지원하지 않는 학년입니다.');
    if (!loading.has(grade)) loading.set(grade, loaders[grade as keyof typeof loaders]().catch(error => { loading.delete(grade); throw error; }));
    return loading.get(grade);
  }));
  return import('./engine');
}
