import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';

// 같은 단원의 두 차시가 거의 같은 문제를 내면 안 됩니다.
// 차시마다 배우는 내용이 다르므로 문제도 달라야 합니다.
describe('lesson overlap', () => {
  it('does not give two 차시 in a unit nearly the same questions', () => {
    const issues: string[] = [];

    for (const unit of curriculum) {
      const perLesson = unit.lessons.map((lesson) => ({
        title: lesson.title,
        strategies: new Set(
          generateQuestions(lesson, '중').map(
            // 평가 층(형성/익힘/…) 라벨을 떼고 기본 전략만 비교한다
            (question) => question.strategy.split(' · ').slice(-1)[0],
          ),
        ),
      }));

      for (let a = 0; a < perLesson.length; a += 1) {
        for (let b = a + 1; b < perLesson.length; b += 1) {
          const first = perLesson[a];
          const second = perLesson[b];
          const shared = [...first.strategies].filter((item) => second.strategies.has(item)).length;
          const ratio = shared / Math.max(first.strategies.size, second.strategies.size);

          if (ratio >= 0.8) {
            issues.push(
              `${unit.semester} ${unit.title}: "${first.title}" 와 "${second.title}" 가 ${Math.round(ratio * 100)}% 같음`,
            );
          }
        }
      }
    }

    expect(issues).toEqual([]);
  });
});
