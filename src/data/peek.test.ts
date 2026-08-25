import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 한 아이가 한 차시에서 겪는 되풀이를 셉니다. 30문항 안에 똑같은
// 문제글이 몇 번이나 나오는지가 곧 지겨움입니다.
describe('peek', () => {
  it('counts repeats inside one lesson', () => {
    const worst: Array<{ times: number; lesson: string; prompt: string; answer: string }> = [];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        const seen = new Map<string, { times: number; answers: Set<string> }>();
        for (const q of generateQuestions(lesson, level)) {
          const found = seen.get(q.prompt) ?? { times: 0, answers: new Set<string>() };
          found.times += 1;
          found.answers.add(q.answer);
          seen.set(q.prompt, found);
        }
        for (const [prompt, info] of seen) {
          if (info.times >= 3) {
            worst.push({ times: info.times, lesson: `${lesson.title}·${level}`, prompt, answer: [...info.answers].join(' / ') });
          }
        }
      }
    }

    worst.sort((a, b) => b.times - a.times);
    for (const one of worst.slice(0, 40)) {
      console.log(`PEEK|${one.times}|${one.lesson}|${one.prompt.slice(0, 44)}|${one.answer.slice(0, 30)}`);
    }

    expect([`한 차시에서 3번 넘게 되풀이되는 문항 ${worst.length}곳`]).toEqual([]);
  });
});
