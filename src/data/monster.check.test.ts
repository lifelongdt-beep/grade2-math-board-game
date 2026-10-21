import { describe, expect, it } from 'vitest';
import { lessons as lessons2 } from './curriculum';
import { lessons31 } from './curriculum31';
import { generateClassQuestions } from './questionFactory';
import { 조작섞기 } from './manipulate';
import type { Difficulty } from '../types';

// 몬스터 막기 놀이 차시는 단순 곱셈(나눗셈) 계산만 냅니다. 조작 문항은 넣지 않습니다.
describe('몬스터를 막아라 차시', () => {
  const 차시들 = [...lessons2, ...lessons31].filter((l) => /몬스터를 막아라/.test(l.title));
  it('차시가 있습니다', () => expect(차시들.length).toBeGreaterThanOrEqual(2));
  for (const l of 차시들) {
    it(`${l.title}: 판마다 'a × b = 얼마일까요?' 계산만 나오고 조작 문항이 없습니다`, () => {
      for (const lv of ['하', '중', '상'] as Difficulty[]) for (const 판 of [0, 1, 2]) {
        const qs = 조작섞기(l, lv, generateClassQuestions(l, lv, { 판 }), 판);
        expect(qs.length).toBeGreaterThan(0);
        for (const q of qs) {
          expect(q.manipulate, q.prompt).toBeUndefined();
          expect(q.prompt, q.prompt).toMatch(/^\d+ [×÷] \d+ = 얼마일까요\?$/);
        }
      }
    });
  }
});
