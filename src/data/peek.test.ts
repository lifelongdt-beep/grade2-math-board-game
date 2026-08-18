import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { questionBank } from './questionBank';

describe('peek', () => {
  it('lists templates reaching the hundred lesson', () => {
    const lesson = lessons.find((one) => one.id === '2-1-u1-l2')!;
    const out = questionBank
      .filter((t) => (!t.units || t.units.includes(lesson.unitTitle))
        && (!t.semester || t.semester === lesson.semester)
        && t.when.test(lesson.title))
      .map((t) => `${t.demand} ${t.id} => ${t.answer}${t.steps ? ' [steps]' : ''}`);
    expect([`제목: ${lesson.title}`, `맞는 틀 ${out.length}개`, ...out]).toEqual([]);
  });
});
