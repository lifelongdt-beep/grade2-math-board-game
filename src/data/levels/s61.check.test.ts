import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons61 } from '../curriculum61';
import { generateQuestions } from '../questionFactory';

// 6-1 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s61.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of lessons61) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 각수 = { 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9, 십: 10 } as Record<string, number>;
const 이름수 = (t: string) => 각수[t[0]];
const 분수값 = (t: string) => { const m = /^(\d+)\/(\d+)$/.exec(t); return m ? +m[1] / +m[2] : Number(t); };
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('6-1 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^모서리가 (\d+)개인 (각뿔|각기둥)이 있습니다. 이 \S+의 꼭짓점은/.exec(p);
      if (m) { const 뿔 = m[2] === '각뿔'; const n = +m[1] / (뿔 ? 2 : 3); expect(수(q.answer), p).toBe(뿔 ? n + 1 : 2 * n); 센다('모서리'); }
      m = /^면, 모서리, 꼭짓점의 수를 모두 더하면 (\d+)개인 (각뿔|각기둥)의 이름/.exec(p);
      if (m) {
        const 뿔 = m[2] === '각뿔';
        const n = [3, 4, 5, 6, 7, 8, 9, 10].find((k) => (뿔 ? k + 1 + 2 * k + k + 1 : k + 2 + 3 * k + 2 * k) === +m![1]);
        expect(이름수(q.answer), p).toBe(n); expect(q.answer.endsWith(m[2])).toBe(true); 센다('합');
      }
      m = /^꼭짓점이 (\d+)개인 (각뿔|각기둥)이 있습니다. 이 \S+의 모서리는/.exec(p);
      if (m) { const 뿔 = m[2] === '각뿔'; const n = 뿔 ? +m[1] - 1 : +m[1] / 2; expect(수(q.answer), p).toBe(뿔 ? 2 * n : 3 * n); 센다('꼭짓점'); }
      m = /큰 직사각형의 가로가 (\d+) cm, 세로가 (\d+) cm입니다. 밑면의 한 변이 (\d+) cm라면/.exec(p);
      if (m) { expect(이름수(q.answer), p).toBe(+m[1] / +m[3]); expect(q.answer.endsWith('각기둥')).toBe(true); 센다('전개도'); }
      m = /^(\S+)각기둥과 꼭짓점의 수가 같은 각뿔/.exec(p);
      if (m) { expect(이름수(q.answer), p).toBe(2 * 각수[m[1]] - 1); 센다('기둥뿔'); }
      m = /^(\S+)각기둥과 \S+각뿔의 모서리의 수의 차/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(각수[m[1]]); 센다('모서리차'); }
      m = /^(\d+)÷(\d+)=(\d+)[을를] 이용하여 몫이 ([\d.]+)[이가] 되는 나눗셈식/.exec(p);
      if (m) { const [a, b] = q.answer.split('÷').map(Number); expect(같다(a / b, +m[4]), p).toBe(true); 센다('몫식'); }
      m = /^([\d.]+)÷(\d+)[은는] 얼마일까요/.exec(p);
      if (m) { expect(같다(Number(q.answer), +m[1] / +m[2]), p).toBe(true); 센다('소수나눗셈'); }
      m = /(\d+)[과와] (\d+)\/(\d+)[을를] 가분수로/.exec(p);
      if (m) { expect(q.answer, p).toBe(`${+m[1] * +m[3] + +m[2]}/${m[3]}`); 센다('가분수'); }
      m = /^한 모둠에 (\d+)명씩 앉습니다/.exec(p);
      if (m) { expect(q.answer).toBe(`학생 수는 언제나 모둠 수의 ${m[1]}배입니다.`); 센다('두양'); }
      m = /모두 (\d+)명이고 그중 남학생은 (\d+)명입니다. (여학생 수에 대한 남학생 수|전체 학생 수에 대한 여학생 수)의 비/.exec(p);
      if (m) { const 여 = +m[1] - +m[2]; expect(q.answer, p).toBe(m[3].startsWith('여') ? `${m[2]} : ${여}` : `${여} : ${m[1]}`); 센다('비'); }
      m = /가 자동차는 (\d+) km를 (\d+)시간 동안, 나 자동차는 (\d+) km를 (\d+)시간/.exec(p);
      if (m) { expect(q.answer, p).toBe(+m[1] / +m[2] > +m[3] / +m[4] ? '가 자동차' : '나 자동차'); 센다('빠르기'); }
      m = /가 마을은 넓이가 (\d+) km²이고 (\d+)명이 삽니다. 나 마을은 넓이가 (\d+) km²이고 (\d+)명/.exec(p);
      if (m) { expect(q.answer, p).toBe(+m[2] / +m[1] > +m[4] / +m[3] ? '가 마을' : '나 마을'); 센다('밀도'); }
      m = /^기준량이 (\d+)이고 비교하는 양이 (\d+)일 때 비율/.exec(p);
      if (m) { expect(같다(Number(q.answer), +m[2] / +m[1]), p).toBe(true); 센다('비율'); }
      if (p === '비율이 가장 큰 것은 어느 것일까요?') {
        const 값 = (t: string) => (t.endsWith('%') ? 수(t) / 100 : t.includes(' : ') ? +t.split(' : ')[0] / +t.split(' : ')[1] : 분수값(t));
        const 가장 = Math.max(...q.choices.map(값));
        expect(같다(값(q.answer), 가장), p).toBe(true);
        expect(q.choices.filter((c) => 같다(값(c), 가장)).length).toBe(1); 센다('꼴');
      }
      m = /가 가게는 (\d+)원에서 (\d+)% 할인하여, 나 가게는 (\d+)원에서 (\d+)% 할인/.exec(p);
      if (m) { const 가 = +m[1] * (100 - +m[2]) / 100; const 나 = +m[3] * (100 - +m[4]) / 100; expect(q.answer, p).toBe(가 < 나 ? `가 가게, ${가}원` : `나 가게, ${나}원`); 센다('할인'); }
      m = /^어떤 물건을 (\d+)% 할인하여 (\d+)원에 샀습니다/.exec(p);
      if (m) { expect(같다(수(q.answer) * (100 - +m[1]) / 100, +m[2]), p).toBe(true); 센다('정가'); }
      m = /^(\d+)% 할인하여 물건을 사면 원래 가격의 몇 %/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(100 - +m[1]); 센다('할인율'); }
      m = /작년에는 학생 (\d+)명 가운데 (\d+)%가, 올해에는 학생 (\d+)명 가운데 (\d+)%/.exec(p);
      if (m) { expect(q.answer, p).toBe(+m[1] * +m[2] > +m[3] * +m[4] ? '작년' : '올해'); 센다('두해'); }
      m = /전체 길이가 (\d+) cm인 띠그래프로 나타내려고 합니다. 전체의 (\d+)%인/.exec(p);
      if (m) { expect(같다(수(q.answer), +m[1] * +m[2] / 100), p).toBe(true); 센다('띠길이'); }
      m = /원그래프에서 전체의 (\d+)%를 차지하는 항목의 중심각/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(3.6 * +m[1]); 센다('중심각'); }
      m = /가로 (\d+) cm, 세로 (\d+) cm, 높이 (\d+) cm인 직육면체에서 (가로를 2배로 늘이고 높이를 반으로|가로와 세로를 각각 2배로)/.exec(p);
      if (m) { const v = +m[1] * +m[2] * +m[3]; expect(수(q.answer), p).toBe(m[4].startsWith('가로를') ? v : v * 4); 센다('부피'); }
      m = /가로 (\d+)개, 세로 (\d+)개, 높이 (\d+)층으로 빈틈없이/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] * +m[2] * +m[3]); 센다('쌓기'); }
      m = /^(\d+) m³는 몇 cm³/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] * 1000000); 센다('m3'); }
      m = /^(\d+) cm³는 몇 m³/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] / 1000000); 센다('m3'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['모서리', '합', '꼭짓점', '전개도', '모서리차', '몫식', '소수나눗셈', '가분수', '두양', '비', '빠르기', '밀도', '비율', '꼴', '할인', '정가', '할인율', '두해', '띠길이', '중심각', '부피', '쌓기', 'm3', '바르게']) {
      expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
    }
  });
});
