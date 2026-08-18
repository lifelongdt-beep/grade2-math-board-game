import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const WATCH = /여러 가지 방법으로|관계를 식으로|세 수의 계산|곱셈구구를 이용|2단|3단, 6단/;

describe('peek', () => {
  it('dumps the method lessons', () => {
    const report: string[] = [];
    for (const lesson of lessons) {
      if (!WATCH.test(lesson.title)) continue;
      if (/시각을 읽어/.test(lesson.title)) continue;
      const seen = new Set<string>();
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          const shape = (question.basePrompt ?? question.prompt).replace(/\d+/g, '#');
          if (seen.has(shape)) continue;
          seen.add(shape);
          report.push(`[${lesson.title}|${level}] ${shape} => ${question.answer}`);
        }
      }
    }
    expect(report).toEqual([]);
  });
});
