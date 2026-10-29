import { describe, expect, it } from 'vitest';
import { curriculum } from './allCurriculum';
import { 마지막차시확인 } from './lastLesson';

const 단원 = curriculum.find((unit) => unit.semester === '2-2' && unit.unitNo === 4)!;
const 차시 = 단원.lessons[2];

describe('마지막으로 수업한 차시', () => {
  it('지금 교육과정에 있는 차시면 그대로 돌려줍니다', () => {
    expect(마지막차시확인({ semester: '2-2', unit: 4, lessonId: 차시.id, duration: 300 }, curriculum)).toEqual({ semester: '2-2', unit: 4, lessonId: 차시.id, duration: 300 });
    expect(마지막차시확인({ semester: '2-2', unit: 4, lessonId: '2-2-u4-review' }, curriculum)?.lessonId).toBe('2-2-u4-review');
    expect(마지막차시확인({ semester: '2-2', unit: 'semester-review', lessonId: '2-2-semester-review' }, curriculum)?.unit).toBe('semester-review');
  });

  it('없는 차시·다른 단원의 차시·망가진 값이면 null입니다', () => {
    expect(마지막차시확인({ semester: '2-2', unit: 4, lessonId: 'no-such-lesson' }, curriculum)).toBeNull();
    expect(마지막차시확인({ semester: '2-2', unit: 3, lessonId: 차시.id }, curriculum)).toBeNull();
    expect(마지막차시확인({ semester: '9-9', unit: 1, lessonId: 차시.id }, curriculum)).toBeNull();
    expect(마지막차시확인({ semester: '2-2', unit: 'semester-review', lessonId: 차시.id }, curriculum)).toBeNull();
    expect(마지막차시확인(null, curriculum)).toBeNull();
    expect(마지막차시확인('x', curriculum)).toBeNull();
  });
});
