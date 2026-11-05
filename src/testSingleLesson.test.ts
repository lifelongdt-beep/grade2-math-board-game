import { it, expect } from 'vitest';
import { curriculum } from './data/allCurriculum';
import { generateQuestions } from './data/questionFactory';

it('1학년 1단원 1차시 문항 생성 테스트', () => {
  const lesson = curriculum.find(u => u.semester === '1-1')?.lessons[0];
  console.log('Target Lesson:', lesson?.id, lesson?.title);
  if (lesson) {
    const q = generateQuestions(lesson, '하');
    console.log('하 문항 수:', q.length);
    const q2 = generateQuestions(lesson, '중');
    console.log('중 문항 수:', q2.length);
    const q3 = generateQuestions(lesson, '상');
    console.log('상 문항 수:', q3.length);
  }
});
