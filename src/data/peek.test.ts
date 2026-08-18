import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 잠깐 들여다보는 검사입니다. 어느 차시가 셈만 묻고 있는지 세어 보고
// 나면 지웁니다.
const isArithmetic = (prompt: string) =>
  /\d+\s*[+\-×]\s*\d+/.test(prompt)
  || /모두 몇|남은|더 많|더 적|몇 개일까요|몇 명일까요|몇 장일까요|얼마일까요/.test(prompt);

describe('peek', () => {
  it('counts how many questions are just arithmetic', () => {
    const report: string[] = [];

    for (const lesson of lessons) {
      if (lesson.title === '단원 도입') continue;
      let sums = 0;
      let total = 0;
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          total += 1;
          if (isArithmetic(question.basePrompt ?? question.prompt)) sums += 1;
        }
      }
      const share = Math.round((sums / total) * 100);
      if (share >= 70) report.push(`${share}% ${lesson.id} ${lesson.title}`);
    }

    expect(report.sort().reverse()).toEqual([]);
  });
});
