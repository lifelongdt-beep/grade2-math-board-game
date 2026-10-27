import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateClassQuestions } from './questionFactory';

// 칠교판 문제는 그림이 없으면 풀 수 없습니다. 삼각형 조각이 몇 개인지,
// 사각형 조각이 몇 개인지는 칠교판을 보고 세는 것이기 때문입니다.
// 늘림 뭉치(expand/)로 만든 칠교 문항에 그림이 빠져 화면이 비었던 적이 있습니다.
describe('칠교판 문항의 그림', () => {
  it('2-1 여러 가지 도형 단원의 칠교 문항은 모두 칠교판 그림이 있습니다', () => {
    const 단원 = curriculum.find((u) => u.semester === '2-1' && u.title === '여러 가지 도형');
    expect(단원).toBeDefined();
    const 없음: string[] = [];
    let 수 = 0;
    for (const 차시 of 단원!.lessons) for (const lv of ['하', '중', '상'] as const) for (const 판 of [0, 1, 2]) {
      for (const q of generateClassQuestions(차시, lv, { 판 })) {
        if (!/칠교/.test(q.prompt)) continue;
        수 += 1;
        if (!q.visual && !q.choiceVisuals && !q.manipulate) 없음.push(q.prompt);
      }
    }
    expect(수).toBeGreaterThan(50);
    expect(없음).toEqual([]);
  }, 300000);
});
