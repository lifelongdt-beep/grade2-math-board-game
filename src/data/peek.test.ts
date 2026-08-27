import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('shows real-life questions per lesson', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2' || lesson.unitNo !== 1) continue;
      const made = generateQuestions(lesson, '상');
      const real = made.filter((q) => /거꾸로 판단|가려내어|살 수 있는지|지폐 수|앞일을|견주어|묶음을 모아|모자라는지/.test(q.strategy));
      const seen = new Set(real.map((q) => q.prompt));
      console.log(`PEEK|${lesson.lessonNo}차시|실생활 ${real.length}개 / 서로 다른 ${seen.size}가지`);
      for (const one of [...seen].slice(0, 2)) console.log(`SAMP|${lesson.lessonNo}|${one.slice(0, 92)}`);
    }
    expect(true).toBe(true);
  });
});
