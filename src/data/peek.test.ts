import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 늘 같은 답이 나오는 문항을 찾습니다. 수가 바뀌지 않는 개념 문항은
// 아이가 문장을 읽지 않고 답을 외워 버립니다.
describe('peek', () => {
  it('finds questions whose answer never changes', () => {
    const seen = new Map<string, { answers: Set<string>; count: number; lesson: string }>();

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          const key = q.prompt;
          const found = seen.get(key) ?? { answers: new Set<string>(), count: 0, lesson: lesson.title };
          found.answers.add(q.answer);
          found.count += 1;
          seen.set(key, found);
        }
      }
    }

    for (const [prompt, info] of [...seen.entries()]
      .filter(([, one]) => one.answers.size === 1 && one.count >= 6)
      .sort((a, b) => b[1].count - a[1].count)) {
      console.log(`PEEK|${info.count}|${info.lesson}|${prompt}|${[...info.answers][0]}`);
    }

    const stuck = [...seen.entries()]
      .filter(([, info]) => info.answers.size === 1 && info.count >= 6)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 24)
      .map(([prompt, info]) => `${info.count}회 · ${prompt.slice(0, 46)} => ${[...info.answers][0]}`);

    expect.soft([`한 답만 나오는 문항 ${[...seen.values()].filter((i) => i.answers.size === 1 && i.count >= 6).length}가지`, ...stuck]).toEqual([]);
  });
});
