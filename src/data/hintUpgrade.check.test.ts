import { describe, expect, it } from 'vitest';
import type { Difficulty, Lesson, Question } from '../types';
import { lessons11 } from './curriculum11';
import { lessons12 } from './curriculum12';
import { lessons as lessons2 } from './curriculum';
import { lessons31 } from './curriculum31';
import { lessons32 } from './curriculum32';
import { lessons41 } from './curriculum41';
import { lessons42 } from './curriculum42';
import { lessons51 } from './curriculum51';
import { lessons5 } from './curriculum5';
import { lessons61 } from './curriculum61';
import { curriculum62 } from './curriculum62';
import { generateQuestions } from './questionFactory';
import { 수로말하는힌트, 힌트가답을말하나, 힌트다듬기 } from './hintUpgrade';

// 문제의 수로 말하는 힌트가 답을 말하지 않는지, 힌트 속 계산이 맞는지 봅니다.
const 모든차시: Lesson[] = [...lessons11, ...lessons12, ...lessons2, ...lessons31, ...lessons32, ...lessons41, ...lessons42, ...lessons51, ...lessons5, ...lessons61, ...curriculum62.flatMap((u) => u.lessons)];
const 모두: Question[] = [];
for (const l of 모든차시) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 바뀐 = 모두.filter((q) => 힌트다듬기(q.prompt, q.answer, '') === q.support.studentHint && q.support.studentHint !== '');

describe('문제의 수로 말하는 힌트', () => {
  it('넉넉히 쓰입니다', () => {
    expect(바뀐.length).toBeGreaterThan(3000);
  });

  it('답을 그대로 말하지 않습니다', () => {
    for (const q of 모두) expect(힌트가답을말하나(q.support.studentHint, q.answer) && 수로말하는힌트(q.prompt) !== null && q.support.studentHint === 수로말하는힌트(q.prompt), q.prompt).toBe(false);
  });

  it('힌트에 적은 계산이 모두 맞습니다', () => {
    for (const q of 바뀐) {
      const h = q.support.studentHint;
      for (const m of h.matchAll(/(?<![\d./])(\d+(?:\.\d+)?)([+\-×])(\d+(?:\.\d+)?)=(\d+(?:\.\d+)?)(?![\d/])/g)) {
        const [a, b, c] = [Number(m[1]), Number(m[3]), Number(m[4])];
        const v = m[2] === '+' ? a + b : m[2] === '-' ? a - b : a * b;
        expect(Math.abs(v - c) < 1e-9, `${q.prompt} / ${h}`).toBe(true);
      }
      for (const m of h.matchAll(/(?<![과와] )(?<!\d)(\d+)\/(\d+)=(\d+)\/(\d+)/g)) expect(Number(m[1]) * Number(m[4]), `${q.prompt} / ${h}`).toBe(Number(m[2]) * Number(m[3]));
      for (const m of h.matchAll(/(\d+)[과와] (\d+)\/(\d+)=(\d+)\/(\d+)/g)) expect([Number(m[1]) * Number(m[3]) + Number(m[2]), Number(m[3])], `${q.prompt} / ${h}`).toEqual([Number(m[4]), Number(m[5])]);
    }
  });

  it('조사가 바르고 문제의 수를 씁니다', () => {
    for (const q of 바뀐) {
      const h = q.support.studentHint;
      expect(h, q.prompt).not.toMatch(/\((을|를|은|는|이|가|과|와|으)\)|undefined|NaN|\d(이|가)에요/);
      // 힌트에는 문제에 나온 수가 적어도 하나 들어 있습니다(그 문제만의 힌트입니다).
      const 문제수 = new Set(q.prompt.match(/\d+(?:\.\d+)?/g) ?? []);
      expect((h.match(/\d+(?:\.\d+)?/g) ?? []).some((x) => 문제수.has(x)) || /곱셈구구|대분수는|여러 분수|두 수씩|자리끼리|자리부터|소수점/.test(h), `${q.prompt} / ${h}`).toBe(true);
    }
  });
});

describe('힌트에서 펼치는 풀이 걸음', () => {
  it('답이나 답의 수를 말하는 걸음은 펼치지 않습니다', async () => {
    const { 답전까지걸음 } = await import('./hintUpgrade');
    let 펼칠것 = 0;
    for (const q of 모두) {
      const 걸음 = 답전까지걸음(q);
      펼칠것 += 걸음.length;
      const 답수 = q.answer.match(/\d+(?:\.\d+)?(?:\/\d+)?/g) ?? [];
      for (const s of 걸음) {
        expect(힌트가답을말하나(s, q.answer), `${q.prompt} / ${s}`).toBe(false);
        if (답수.length) expect(답수.every((x) => new RegExp(`(^|[^\\d./])${x.replace('.', '\\.')}(?![\\d/]|\\.\\d)`).test(s)), `${q.prompt} / ${s}`).toBe(false);
      }
    }
    // 많은 문항에서 적어도 한 걸음은 펼칠 수 있어야 도움이 됩니다.
    expect(펼칠것 / 모두.length).toBeGreaterThan(0.6);
  });
});
