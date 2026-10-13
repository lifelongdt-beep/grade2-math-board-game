import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons5 } from '../curriculum5';
import { generateQuestions } from '../questionFactory';

// 5-2 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s52.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of lessons5) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-6;

describe('5-2 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^\S+[은는] ([\d.]+)×([\d.]+)[을를] ([\d.]+)[이라고]+ 계산했습니다. 잘못 계산한 까닭을 생각하여/.exec(p);
      if (m) { expect(같다(Number(q.answer), +m[1] * +m[2]), p).toBe(true); expect(같다(+m[3], +m[1] * +m[2]), p).toBe(false); 센다('소수점'); }
      m = /계산 결과가 (\d+)보다 작은 곱셈식은/.exec(p);
      if (m) {
        const 값 = (c: string) => c.split('×').map(Number).reduce((a, b) => a * b, 1);
        expect(값(q.answer) < +m[1], p).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(값(c) < +m![1], c).toBe(false);
        센다('작아지는');
      }
      m = /^1 m에 (\d+)원인 리본을 ([\d.]+) m씩 잘라 선물 (\d+)개를/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Math.round(+m[1] * +m[2]) * +m[3]); 센다('리본'); }
      m = /^가로 ([\d.]+) m, 세로 ([\d.]+) m인 직사각형 모양의 꽃밭에 1 m²마다 비료를 (\d+) kg씩/.exec(p);
      if (m) { expect(같다(수(q.answer), Math.round(+m[1] * +m[2] * 100) / 100 * +m[3]), p).toBe(true); 센다('비료'); }
      m = /^모든 모서리의 길이의 합이 (\d+) cm인 정육면체가 있습니다. 이 정육면체의 한 면의 둘레/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] / 12) * 4); 센다('모서리합'); }
      m = /보이는 세 면의 눈이 (\d), (\d), (\d)일 때 보이지 않는 세 면/.exec(p);
      if (m) {
        const xs = m.slice(1).map(Number);
        expect(new Set([...xs, ...xs.map((x) => 7 - x)]).size, p).toBe(6);
        expect(수(q.answer), p).toBe(21 - xs.reduce((a, b) => a + b, 0)); 센다('주사위');
      }
      if (/^직육면체에서 한 면과 (수직|평행)인 면/.test(p)) { expect(q.answer.startsWith(p.includes('수직') ? '4개' : '1개'), p).toBe(true); 센다('면관계'); }
      m = /^모둠 친구 (\d+)명이 읽은 책 수의 평균은 (\d+)권입니다. 새로 온 친구가 (\d+)권을 읽었다면/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] * +m[2] + +m[3]) / (+m[1] + 1)); 센다('새평균'); }
      m = /^주사위를 한 번 굴려 (\S+?)[은는] (.+?)의 눈이 나오면 이기고, (\S+?)[은는] (.+?)의 눈이 나오면 이기기로/.exec(p);
      if (m) {
        const 눈수 = (c: string) => [1, 2, 3, 4, 5, 6].filter((x) =>
          c === '짝수' ? x % 2 === 0 : c === '홀수' ? x % 2 === 1 : c === '3의 배수' ? x % 3 === 0
            : /이상/.test(c) ? x >= 수(c) : /이하/.test(c) ? x <= 수(c) : x === 수(c)).length;
        const [a, b] = [눈수(m[2]), 눈수(m[4])];
        expect(a, p).not.toBe(b);
        expect(q.answer, p).toBe(a > b ? m[1] : m[3]); 센다('주사위유리');
      }
      m = /^일이 일어날 가능성이 '(\S+)'일 때 이 가능성을 수로/.exec(p);
      if (m) { expect(q.answer, p).toBe({ 불가능하다: '0', 반반이다: '1/2', 확실하다: '1' }[m[1]]); 센다('가능성말'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['소수점', '작아지는', '리본', '비료', '모서리합', '주사위', '면관계', '새평균', '바르게', '주사위유리', '가능성말']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});
