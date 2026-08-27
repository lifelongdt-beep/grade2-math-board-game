import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import { questionBank } from './questionBank';

describe('peek', () => {
  it('counts real-life questions per lesson', () => {
    const realStrategies = new Set(questionBank.filter((t) => t.real).map((t) => t.strategy.split(' · ').slice(-1)[0]));
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2') continue;
      const made = generateQuestions(lesson, '상');
      const real = made.filter((q) => realStrategies.has(q.strategy.split(' · ').slice(-1)[0]));
      console.log(`PEEK|${lesson.unitNo}-${lesson.lessonNo}|${lesson.title.slice(0, 13)}|${real.length}개 / ${new Set(real.map((q) => q.prompt)).size}가지`);
    }
    expect(true).toBe(true);
  });
});
