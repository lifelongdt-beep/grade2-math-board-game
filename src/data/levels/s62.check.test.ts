import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { curriculum62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';

// 6-2 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s62.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of curriculum62.flatMap((u) => u.lessons)) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const 나눔 = (식: string) => { const [a, b] = 식.split('÷').map(Number); return a / b; };

describe('6-2 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^([\d.]+÷[\d.]+)[와과] 몫이 같은 나눗셈식/.exec(p);
      if (m) {
        expect(같다(나눔(q.answer), 나눔(m[1])), p).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(같다(나눔(c), 나눔(m![1])), c).toBe(false);
        센다('몫같은');
      }
      m = /^리본 ([\d.]+) m를 ([\d.]+) m씩 잘라 선물을 포장하려고 합니다. 선물을 하나 더/.exec(p);
      if (m) { const 전 = +m[1]; const 한 = +m[2]; const 남 = 전 - Math.floor(전 / 한 + 1e-9) * 한; expect(같다(수(q.answer), 한 - 남), p).toBe(true); 센다('남는양'); }
      if (p.startsWith('계산하지 않고 어림하여 몫이 가장 큰 나눗셈식')) {
        const 가장 = Math.max(...q.choices.map(나눔));
        expect(같다(나눔(q.answer), 가장), p).toBe(true); 센다('어림');
      }
      m = /앞줄은 왼쪽부터 (\d), (\d), (\d), 뒷줄은 왼쪽부터 (\d), (\d), (\d)입니다. 앞에서 본 모양의 층수/.exec(p);
      if (m) { const v = m.slice(1).map(Number); expect(q.answer, p).toBe([0, 1, 2].map((k) => `${Math.max(v[k], v[k + 3])}층`).join(', ')); 센다('앞모양'); }
      m = /쌓은 쌓기나무의 수가 ([\d, ]+)입니다. 쌓기나무 (\d+)개로/.exec(p);
      if (m) {
        const 합 = m[1].split(', ').map(Number).reduce((s, x) => s + x, 0); const 가 = +m[2];
        expect(q.answer, p).toBe(가 >= 합 ? `${가 - 합}개 남습니다.` : `${합 - 가}개 더 있어야 합니다.`); 센다('필요');
      }
      m = /1층에 (\d+)개, 2층에 (\d+)개(?:, 3층에 (\d+)개)?입니다. 쌓기나무는 모두/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] + +m[2] + +(m[3] ?? 0)); 센다('층별'); }
      m = /각 칸에 쌓은 쌓기나무의 수를 적었더니 ([\d, ]+)였습니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(m[1].split(', ').map(Number).reduce((s, x) => s + x, 0)); 센다('위수합'); }
      m = /^(\d+) : (\d+)[와과] 비율이 같은 비가 아닌 것/.exec(p);
      if (m) {
        const r = +m[1] / +m[2]; const 비율 = (c: string) => +c.split(' : ')[0] / +c.split(' : ')[1];
        expect(같다(비율(q.answer), r), p).toBe(false);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(같다(비율(c), r), c).toBe(true);
        센다('비성질');
      }
      m = /^0\.(\d) : (\d)\/(\d)[을를] 간단한 자연수의 비/.exec(p);
      if (m) {
        const [x, y] = q.answer.split(' : ').map(Number);
        const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
        expect(g(x, y), p).toBe(1); expect(같다(x / y, (+m[1] / 10) / (+m[2] / +m[3])), p).toBe(true); 센다('섞인비');
      }
      m = /^비례식 (\d+) : (\d+) = (\d+) : (\d+)에서 (외항|내항)/.exec(p);
      if (m) { expect(q.answer, p).toBe(m[5] === '외항' ? `${m[1]}, ${m[4]}` : `${m[2]}, ${m[3]}`); 센다('외내항'); }
      if (p.startsWith('외항의 곱과 내항의 곱을 따져 볼 때')) {
        const 맞나 = (c: string) => { const [l, r] = c.split(' = '); const [a, b] = l.split(' : ').map(Number); const [x, y] = r.split(' : ').map(Number); return a * y === b * x; };
        expect(맞나(q.answer), q.answer).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(맞나(c), c).toBe(false);
        센다('비례식');
      }
      m = /1 : (\d+)[로으]+ 줄여 나타낸 지도가 있습니다. 집에서 도서관까지 실제 거리가 ([\d.]+) km/.exec(p);
      if (m) { expect(같다(수(q.answer), (+m[2] * 100000) / +m[1]), p).toBe(true); 센다('축척'); }
      m = /지름이 (\d+) cm인 원의 원주는 ([\d.]+) cm입니다. 지름이 (\d)배인/.exec(p);
      if (m) { expect(같다(수(q.answer), +m[1] * +m[3] * 3.14), p).toBe(true); 센다('지름배'); }
      m = /^지름이 (\d+) cm인 원의 원주는 몇 cm/.exec(p);
      if (m) { expect(같다(수(q.answer), +m[1] * 3.14), p).toBe(true); 센다('원주'); }
      m = /원주가 ([\d.]+) cm이고 지름이 (\d+) cm인 원이 있습니다. \(원주\)÷\(지름\)/.exec(p);
      if (m) { expect(같다(Number(q.answer), +m[1] / +m[2]), p).toBe(true); 센다('원주율'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['몫같은', '남는양', '어림', '앞모양', '필요', '층별', '위수합', '비성질', '섞인비', '외내항', '비례식', '축척', '지름배', '원주', '원주율', '바르게']) {
      expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
    }
  });
});
