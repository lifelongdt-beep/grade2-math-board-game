import { describe, expect, it } from 'vitest';
import type { Difficulty } from '../types';
import { curriculum31 } from './curriculum31';
import { CASTLE_DIVIDE_TITLE, generateClassQuestions, generateQuestions } from './questionFactory';

// 3-1 3단원 '나눗셈, 몬스터를 막아라!': 곱셈구구 안에서 나누어떨어지는 나눗셈만
const 게임 = curriculum31.flatMap((u) => u.lessons).find((l) => l.title === CASTLE_DIVIDE_TITLE)!;

describe('나눗셈, 몬스터를 막아라!', () => {
  it('3-1 3단원 나눗셈의 마지막 차시입니다', () => {
    expect(게임.unitNo).toBe(3);
    const 단원 = curriculum31.find((u) => u.unitNo === 3)!;
    expect(단원.lessons[단원.lessons.length - 1].id).toBe(게임.id);
  });

  it('나누는 수 2~9, 몫 1~9, 나머지 없이 81 이하이고 답이 맞습니다', () => {
    for (const lv of ['하', '중', '상'] as Difficulty[]) {
      const qs = generateQuestions(게임, lv);
      expect(qs.length).toBe(30);
      expect(new Set(qs.map((q) => q.prompt)).size).toBe(30);
      for (const q of qs) {
        const m = /^(\d+) ÷ (\d+) = 얼마일까요\?$/.exec(q.prompt)!;
        expect(m, q.prompt).not.toBeNull();
        const [a, b] = [Number(m[1]), Number(m[2])];
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(9);
        expect(a % b).toBe(0);
        expect(a).toBeLessThanOrEqual(81);
        expect(Number(q.answer)).toBe(a / b);
        expect(a / b).toBeGreaterThanOrEqual(1);
        expect(a / b).toBeLessThanOrEqual(9);
        expect(q.choices.filter((c) => c === q.answer).length).toBe(1);
        for (const c of q.choices) { expect(Number(c)).toBeGreaterThanOrEqual(1); expect(Number(c)).toBeLessThanOrEqual(9); }
      }
    }
  });

  it('고른 나누는 수만 나옵니다', () => {
    const qs = generateClassQuestions(게임, '중', { castleDans: [3, 7] });
    expect(qs.length).toBe(18);
    for (const q of qs) expect([' 3 ', ' 7 '].some((d) => q.prompt.includes(`÷${d}`))).toBe(true);
  });
});
