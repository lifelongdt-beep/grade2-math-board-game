import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons51 } from '../curriculum51';
import { generateQuestions } from '../questionFactory';

// 5-1 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s51.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of lessons51) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const 값 = (식: string) => Function(`return (${식.replace(/×/g, '*').replace(/÷/g, '/')})`)() as number;
const 분수값 = (t: string) => {
  const s = t.replace(/ m$/, '');
  let m = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(s);
  if (m) return +m[1] + +m[2] / +m[3];
  m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) return +m[1] / +m[2];
  return Number(s);
};
const 공약 = (a: number, b: number): number => (b ? 공약(b, a % b) : a);

describe('5-1 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^사탕 (\d+)개를 접시 (\d+)개에 똑같이 나누어 담았습니다. 이런 접시 (\d+)개/.exec(p);
      let 바른값: number | null = null;
      if (m) 바른값 = (+m[1] / +m[2]) * +m[3];
      m = /^한 상자에 과자를 (\d+)개씩 (\d+)줄 담을 수 있습니다. 과자 (\d+)개를 담으려면/.exec(p);
      if (m) 바른값 = +m[3] / (+m[1] * +m[2]);
      m = /^주차장에 자동차가 (\d+)대 있었습니다. (\d+)분 동안 1분마다 (\d+)대씩 들어오고 (\d+)대가 나갔습니다/.exec(p);
      if (m) 바른값 = +m[1] + +m[2] * +m[3] - +m[4];
      m = /^지우는 꽃 (\d+)송이를 가지고 있었습니다. 선생님께서 꽃 (\d+)송이를 (\d+)명에게 .+ (\d+)송이를 썼다면/.exec(p);
      if (m) 바른값 = +m[1] + +m[2] / +m[3] - +m[4];
      m = /^구슬 (\d+)개를 가지고 있었습니다. 한 봉지에 (\d+)개씩 들어 있는 구슬을 (\d+)봉지 더 사고, 구슬 (\d+)개를 (\d+)명에게/.exec(p);
      if (m) 바른값 = +m[1] + +m[2] * +m[3] - +m[4] / +m[5];
      if (바른값 !== null && /구하는 식으로 알맞은 것은/.test(p)) {
        expect(같다(값(q.answer), 바른값), `${p} → ${q.answer}`).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(같다(값(c), 바른값), c).toBe(false);
        센다('하나의식');
      }
      m = /^(.+)을? ?[을를] 계산할 때 가장 먼저 계산해야 하는 것/.exec(p);
      if (m && /^[\d+\-×÷]+[을를] 계산할 때/.test(p)) {
        const 식 = /^([\d+\-×÷]+)[을를]/.exec(p)![1];
        const 첫 = /[×÷]/.test(식) ? /\d+[×÷]\d+/.exec(식)![0] : /\d+[+-]\d+/.exec(식)![0];
        expect(q.answer, p).toBe(첫); 센다('먼저');
      }
      m = /^구슬 (\d+)개를 봉지 여러 개에 남김없이 똑같이 나누어 담으려고/.exec(p);
      if (m) { const n = +m[1]; let k = 0; for (let d = 2; d <= n / 2; d += 1) if (n % d === 0) k += 1; expect(수(q.answer), p).toBe(k); 센다('담기'); }
      m = /^(\d+)×(\d+)=(\d+)입니다. 이 곱셈식을 보고 약수와 배수의 관계/.exec(p);
      if (m) {
        const 맞나 = (c: string) => { const x = /^(\d+)[은는] (\d+)의 (배수|약수)입니다/.exec(c)!; return x[3] === '배수' ? +x[1] % +x[2] === 0 : +x[2] % +x[1] === 0; };
        expect(맞나(q.answer), q.answer).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(맞나(c), c).toBe(false);
        센다('관계');
      }
      m = /^○([×+])(\d+)=△입니다. ○가 (\d+)일 때/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(m[1] === '×' ? +m[2] * +m[3] : +m[2] + +m[3]); 센다('대응'); }
      m = /피자 한 판의 (\d+)\/(\d+)[을를] 먹었습니다. 같은 크기의 피자를 똑같이 (\d+)조각/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] / +m[2]) * +m[3]); 센다('피자'); }
      m = /^분모가 (\d+)인 진분수 □\/\d+ 가운데 기약분수는/.exec(p);
      if (m) { const d = +m[1]; let k = 0; for (let n = 1; n < d; n += 1) if (공약(n, d) === 1) k += 1; expect(수(q.answer), p).toBe(k); 센다('기약'); }
      m = /^(\d+)\/(\d+) < □\/(\d+) < (\d+)\/(\d+)에서/.exec(p);
      if (m) { const [a, b, d, c, e] = m.slice(1).map(Number); let k = 0; for (let n = 1; n <= d; n += 1) if (n / d > a / b && n / d < c / e) k += 1; expect(수(q.answer), p).toBe(k); 센다('사이'); }
      m = /^([\d./, ]+) 가운데 가장 큰 수는/.exec(p);
      if (m) { const xs = m[1].split(', '); const 가장 = Math.max(...xs.map(분수값)); expect(같다(분수값(q.answer), 가장), p).toBe(true); 센다('섞어'); }
      m = /^1\/(\d+)[과와] 1\/(\d+)[을를] 통분할 때 공통분모가 될 수 있는 가장 작은/.exec(p);
      if (m) { const a = +m[1]; const b = +m[2]; expect(수(q.answer), p).toBe((a * b) / 공약(a, b)); 센다('공통분모'); }
      m = /^끈 (.+) m가 있습니다. 상자를 묶는 데 (.+) m, 리본을 만드는 데 (.+) m를 썼습니다/.exec(p);
      if (m) { expect(같다(분수값(q.answer), 분수값(m[1]) - 분수값(m[2]) - 분수값(m[3])), p).toBe(true); 센다('남은끈'); }
      m = /가람이는 (.+) m, 나래는 (.+) m, 다솜이는 (.+) m를 가져왔습니다/.exec(p);
      if (m) { expect(같다(분수값(q.answer), 분수값(m[1]) + 분수값(m[2]) + 분수값(m[3])), p).toBe(true); 센다('모은끈'); }
      m = /^둘레가 (\d+) cm인 정삼각형과 둘레가 같은 정사각형/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] / 4); 센다('둘레'); }
      m = /^가로가 세로보다 (\d+) cm 긴 직사각형의 둘레가 (\d+) cm/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[2] / 2 - +m[1]) / 2 + +m[1]); 센다('가로'); }
      m = /가로와 세로를 각각 (\d)배로 늘였습니다. 새 직사각형의 넓이는 처음 넓이의 몇 배/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] * +m[1]); 센다('넓이배'); }
      m = /^넓이가 (\d+) cm²인 직사각형을 그리려고 합니다/.exec(p);
      if (m) { const n = +m[1]; let k = 0; for (let a = 1; a * a <= n; a += 1) if (n % a === 0) k += 1; expect(수(q.answer), p).toBe(k); 센다('같은넓이'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['하나의식', '먼저', '담기', '관계', '대응', '피자', '기약', '사이', '섞어', '공통분모', '남은끈', '모은끈', '둘레', '가로', '넓이배', '같은넓이', '바르게']) {
      expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
    }
  });
});
