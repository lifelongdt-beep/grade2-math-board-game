import { describe, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';

// 차시마다 풀이 과정 문항이 몇 개 나오는지 확인하기 위한 임시 조사용
describe('step coverage', () => {
  it('reports how many questions show their working', () => {
    for (const unit of curriculum) {
      const rows = unit.lessons.map((lesson) => {
        const questions = generateQuestions(lesson, '중');
        const steps = questions.filter((question) => question.prompt.includes('⊙')).length;
        return `${lesson.lessonNo}차시 ${steps}개`;
      });
      console.log(`${unit.semester} ${unit.title}: ${rows.join(' / ')}`);
    }
  });
});
