import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

/* 문제를 가리고 보기 넷만 보고 찍습니다. 요령이 25%(그냥 찍기)보다
   잘 맞으면, 그 요령만큼 문제가 새고 있다는 뜻입니다. */

const num = (s: string) => {
  const m = /-?\d+/.exec(s);
  return m ? Number(m[0]) : null;
};
const suffix = (s: string) => s.replace(/^[\d\s.-]*/, '');
const shape = (s: string) => s.replace(/\d+/g, '#');

const CHEATS: Record<string, (cs: string[]) => string> = {
  '가장 긴 것': (cs) => [...cs].sort((a, b) => b.length - a.length)[0],
  '가장 짧은 것': (cs) => [...cs].sort((a, b) => a.length - b.length)[0],
  '혼자 단위가 다른 것': (cs) => {
    const tally = new Map<string, number>();
    cs.forEach((c) => tally.set(suffix(c), (tally.get(suffix(c)) ?? 0) + 1));
    return cs.find((c) => tally.get(suffix(c)) === 1) ?? cs[0];
  },
  '혼자 생김새가 다른 것': (cs) => {
    const tally = new Map<string, number>();
    cs.forEach((c) => tally.set(shape(c), (tally.get(shape(c)) ?? 0) + 1));
    return cs.find((c) => tally.get(shape(c)) === 1) ?? cs[0];
  },
  '수가 둘째로 작은 것': (cs) => {
    const ns = cs.map((c) => ({ c, n: num(c) }));
    if (ns.some((x) => x.n === null)) return cs[0];
    return ns.sort((a, b) => (a.n as number) - (b.n as number))[1].c;
  },
  '수가 가장 큰 것': (cs) => {
    const ns = cs.map((c) => ({ c, n: num(c) }));
    if (ns.some((x) => x.n === null)) return cs[0];
    return ns.sort((a, b) => (b.n as number) - (a.n as number))[0].c;
  },
  '가운데 두 값의 평균에 가까운 것': (cs) => {
    const ns = cs.map((c) => ({ c, n: num(c) }));
    if (ns.some((x) => x.n === null)) return cs[0];
    const mean = ns.reduce((s, x) => s + (x.n as number), 0) / ns.length;
    return ns.sort((a, b) => Math.abs((a.n as number) - mean) - Math.abs((b.n as number) - mean))[0].c;
  },
};

describe('peek', () => {
  it('measures how far the choices leak the answer', () => {
    const hits: Record<string, number> = {};
    Object.keys(CHEATS).forEach((k) => { hits[k] = 0; });
    let total = 0;

    for (const lesson of lessons) {
      if (lesson.title === '단원 도입') continue;
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          total += 1;
          for (const [name, cheat] of Object.entries(CHEATS)) {
            if (cheat(question.choices) === question.answer) hits[name] += 1;
          }
        }
      }
    }

    const report = Object.entries(hits)
      .map(([name, n]) => `${Math.round((n / total) * 100)}% ${name}`)
      .sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10));

    expect([`문항 ${total}개`, ...report]).toEqual([]);
  });
});
