import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 수를 지운 '문항의 모양'입니다. 수만 다른 문항은 아이에게 같은 문항입니다.
const shapeOf = (prompt: string) =>
  prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

describe('peek', () => {
  it('measures how much 중 repeats 하', () => {
    let sameTotal = 0;
    let midTotal = 0;
    const worst: string[] = [];

    for (const lesson of lessons) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const mid = generateQuestions(lesson, '중');
      const same = mid.filter((q) => low.has(shapeOf(q.prompt)));
      sameTotal += same.length;
      midTotal += mid.length;
      if (same.length >= 8) {
        worst.push(`${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo} ${lesson.title.slice(0, 14)}: ${same.length}/30 겹침`);
      }
    }

    console.log(`PEEK|겹침 ${sameTotal}/${midTotal}`);
    for (const one of worst.slice(0, 30)) console.log(`SAME|${one}`);
    expect(true).toBe(true);
  });

  it('measures how generic the solutions are', () => {
    let thin = 0;
    let all = 0;
    const seen = new Map<string, number>();

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          all += 1;
          const numbers = (q.prompt.match(/\d+/g) ?? []);
          // 문제에 나온 수를 하나도 쓰지 않은 해설은 그 문제의 해설이
          // 아니라 일반적인 말입니다.
          const usesNumber = numbers.some((one) => q.explanation.includes(one));
          if (!usesNumber || q.explanation.length < 18) {
            thin += 1;
            seen.set(q.explanation, (seen.get(q.explanation) ?? 0) + 1);
          }
        }
      }
    }

    console.log(`PEEK|맹탕 해설 ${thin}/${all}`);
    for (const [text, count] of [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
      console.log(`THIN|${count}회|${text.slice(0, 70)}`);
    }
    expect(true).toBe(true);
  });
});
