import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

describe('peek', () => {
  it('counts blank visuals by kind', () => {
    let tableBlank = 0;
    let graphBlank = 0;
    const graphSample: string[] = [];
    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          const v = q.visual;
          if (!v) continue;
          if (v.kind === 'table' && v.columns.some((one) => one.value === null)) tableBlank += 1;
          if (v.kind === 'pictograph' && v.blankAt !== undefined) {
            graphBlank += 1;
            const one = `${lesson.title}|${level} ${q.prompt.slice(0, 40)} => ${q.answer}`;
            if (!graphSample.includes(one) && graphSample.length < 4) graphSample.push(one);
          }
        }
      }
    }
    expect([`표 빈칸 ${tableBlank}개 · 그래프 빈칸 ${graphBlank}개`, ...graphSample]).toEqual([]);
  });
});
