import { describe, expect, it } from 'vitest';
import type { FigureShapeName, Lesson, Difficulty, QuestionVisual } from '../types';
import { FIGURE_POINTS } from './QuestionVisualGraphic';
import { lessons5 } from '../data/curriculum5';
import { lessons51 } from '../data/curriculum51';
import { lessons41 } from '../data/curriculum41';
import { lessons42 } from '../data/curriculum42';
import { lessons as lessons2 } from '../data/curriculum';
import { lessons31 } from '../data/curriculum31';
import { generateQuestions } from '../data/questionFactory';

// 도형 이름으로 그리는 그림은 그 이름의 꼭짓점이 있어야 합니다. 없으면
// 정사각형으로 그려져, '두 오각형'에 사각형이 나왔습니다.
const 차시들: Lesson[] = [...lessons2, ...lessons31, ...lessons41, ...lessons42, ...lessons51, ...lessons5];

describe('도형 그림', () => {
  it('문항 글의 도형 이름과 그림의 꼭짓점 수가 맞습니다', () => {
    const 틀린: string[] = [];
    const 변수 = { 삼각형: 3, 사각형: 4, 오각형: 5, 육각형: 6 } as const;
    for (const l of 차시들) for (const lv of ['하', '중', '상'] as Difficulty[]) for (const q of generateQuestions(l, lv)) {
      const v = q.visual as QuestionVisual | undefined;
      if (!v || v.kind !== 'figure-set') continue;
      for (const item of v.items) {
        const 점 = item.points ?? FIGURE_POINTS[item.shape as FigureShapeName];
        if (item.shape !== '원' && !점) 틀린.push(`${q.prompt} — ${item.shape}의 꼭짓점이 없음`);
      }
      const m = /두 (삼각형|사각형|오각형|육각형)/.exec(q.prompt);
      if (m) {
        for (const item of v.items) {
          const 점 = item.points ?? FIGURE_POINTS[item.shape as FigureShapeName];
          if (점 && 점.length !== 변수[m[1] as keyof typeof 변수]) 틀린.push(`${q.prompt} — 그림의 꼭짓점 ${점.length}개`);
        }
      }
    }
    expect(틀린.slice(0, 5)).toEqual([]);
  });
});
