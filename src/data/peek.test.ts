import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import { questionBank } from './questionBank';

const realIds = new Set(questionBank.filter((t) => t.real).map((t) => t.id));

describe('peek', () => {
  it('counts real-life questions per 2-2 lesson', () => {
    for (const lesson of lessons) {
      if (lesson.semester !== '2-2') continue;
      const made = generateQuestions(lesson, '상');
      const real = made.filter((q) => q.id.includes('bank') || /거꾸로 판단|가려내어|살 수 있는지|지폐 수|앞일을|견주어|묶음을 모아|모자라는지|짝을 이루는|시계 눈금|낱개를 함께|주와 날수|아무것도 없는|알맞은 단위|이어 붙인|쓰고 남은|몸의 길이|알맞은 도구|담는 방법/.test(q.strategy));
      const seen = new Set(real.map((q) => q.prompt));
      console.log(`PEEK|${lesson.unitNo}-${lesson.lessonNo}|${lesson.title.slice(0, 14)}|${real.length}개 / ${seen.size}가지`);
    }
    expect(realIds.size).toBeGreaterThan(0);
  });
});
