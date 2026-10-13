import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons42 } from '../curriculum42';
import { generateQuestions } from '../questionFactory';

// 4-2 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s42.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of lessons42) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 대분수 = (t: string) => { const m = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(t.trim())!; return +m[1] + +m[2] / +m[3]; };
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('4-2 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^(\d+[과와] \d+\/\d+) ([+-]) (\d+[과와] \d+\/\d+)[은는] 얼마일까요/.exec(p);
      if (m) { const v = m[2] === '+' ? 대분수(m[1]) + 대분수(m[3]) : 대분수(m[1]) - 대분수(m[3]); expect(같다(대분수(q.answer), v), p).toBe(true); 센다('대분수'); }
      m = /^이등변삼각형의 한 각의 크기가 (\d+)°입니다. 나머지 두 각/.exec(p);
      if (m && +m[1] > 90) { const x = (180 - +m[1]) / 2; expect(q.answer, p).toBe(`${x}°, ${x}°`); 센다('둔각'); }
      m = /^한 변이 (\d+) cm인 정삼각형을 만든 철사를 모두 펴서, 길이가 다른 한 변이 (\d+) cm인/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] * 3 - +m[2]) / 2); 센다('철사'); }
      m = /^어떤 수의 10배는 ([\d.]+)입니다. 어떤 수의 1\/10은/.exec(p);
      if (m) { expect(같다(Number(q.answer), +m[1] / 100), p).toBe(true); 센다('소수'); }
      m = /^0\.01이 (\d+)개인 수는/.exec(p);
      if (m) { expect(같다(Number(q.answer), +m[1] / 100), p).toBe(true); 센다('0.01'); }
      m = /이틀마다 재어 꺾은선그래프로 나타냈습니다. 1일 (\d+) cm, 3일 (\d+) cm, 5일 (\d+) cm, 7일 (\d+) cm/.exec(p);
      if (m) { const xs = m.slice(1).map(Number); expect(수(q.answer), p).toBe(xs[3] + (xs[1] - xs[0])); 센다('예상'); }
      m = /세로 눈금 한 칸이 (\d+)이고, 눈금은 (\d+)부터 시작합니다. 점이 (\d+)칸 위/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[2] + +m[1] * +m[3]); 센다('눈금'); }
      m = /^정삼각형 모양 조각 (\d+)개가 있습니다/.exec(p);
      if (m) { const n = +m[1]; expect(q.answer, p).toBe(`${Math.floor(n / 6)}개 만들고 ${n % 6}개 남습니다.`); 센다('조각'); }
      m = /^(\d+)[을를] 분모가 (\d+)인 대분수 (\d+)[과와] □\/(\d+)[으로]+ 나타내려고/.exec(p);
      if (m) { expect(+m[3] + 수(q.answer) / +m[4], p).toBe(+m[1]); expect(+m[2], p).toBe(+m[4]); 센다('자연수대분수'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['대분수', '둔각', '철사', '소수', '0.01', '예상', '눈금', '조각', '바르게', '자연수대분수']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});
