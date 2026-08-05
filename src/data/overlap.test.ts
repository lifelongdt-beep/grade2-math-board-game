import { describe, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';

// 같은 단원 안에서 차시끼리 문제가 얼마나 겹치는지 측정합니다.
// (차시별 학습 내용에 맞는 문제인지 확인하기 위한 임시 조사용)
describe('lesson overlap', () => {
  it('reports 차시 pairs that share most of their questions', () => {
    for (const unit of curriculum) {
      const perLesson = unit.lessons.map((lesson) => ({
        title: lesson.title,
        strategies: new Set(
          generateQuestions(lesson, '중').map((question) =>
            // 평가 층(형성/익힘/…) 라벨을 떼고 기본 전략만 남긴다
            question.strategy.split(' · ').slice(-1)[0],
          ),
        ),
      }));

      const lines: string[] = [];
      for (let a = 0; a < perLesson.length; a += 1) {
        for (let b = a + 1; b < perLesson.length; b += 1) {
          const first = perLesson[a];
          const second = perLesson[b];
          const shared = [...first.strategies].filter((s) => second.strategies.has(s)).length;
          const ratio = shared / Math.max(first.strategies.size, second.strategies.size);
          if (ratio >= 0.8) {
            lines.push(`    ${first.title}  ==  ${second.title}   (${Math.round(ratio * 100)}%)`);
          }
        }
      }

      console.log(`\n### ${unit.semester} ${unit.unitNo}. ${unit.title}`);
      if (lines.length === 0) {
        console.log('    (차시마다 다름)');
      } else {
        lines.forEach((line) => console.log(line));
      }
    }
  });
});
