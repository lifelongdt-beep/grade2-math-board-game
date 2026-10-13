import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons31 } from '../curriculum31';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';

// 3학년 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s3.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of [...lessons31, ...lessons32]) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 초 = (t: string) => { const m = /(\d+)시 (\d+)분 (\d+)초/.exec(t)!; return +m[1] * 3600 + +m[2] * 60 + +m[3]; };
const 분초 = (t: string) => { const m = /(\d+)분 (\d+)초/.exec(t)!; return +m[1] * 60 + +m[2]; };

describe('3학년 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^(.*) 가운데 시계의 두 바늘이 이루는 작은 쪽의 각이 직각인 시각을 모두/.exec(p);
      if (m) { const 답 = [...m[1].matchAll(/(㉠|㉡|㉢|㉣) (\d+)시/g)].filter((x) => +x[2] % 12 === 3 || +x[2] % 12 === 9).map((x) => x[1]).join(', '); expect(q.answer, p).toBe(답); 센다('직각'); }
      m = /^사탕 (\d+)개를 (한 봉지에 (\d+)개씩 담으려고|(\d+)명에게 똑같이 나누어 주려고)/.exec(p);
      if (m && /바르게 설명한 것/.test(p)) {
        const n = +m[1]; const k = +(m[3] ?? m[4]); expect(q.answer.startsWith(`${n}÷${k}=${n / k}이고`), p).toBe(true);
        expect(q.answer.includes(m[3] ? '봉지의 수' : '한 명이 받는'), p).toBe(true); 센다('나눗셈뜻');
      }
      m = /^나눗셈식 (\d+)÷(\d+)=(\d+)에서 (나누어지는 수|나누는 수|몫)[은는]/.exec(p);
      if (m) { expect(q.answer, p).toBe(m[4] === '나누어지는 수' ? m[1] : m[4] === '나누는 수' ? m[2] : m[3]); 센다('용어'); }
      m = /^집에서 학교까지는 (\d+) km (\d+) m이고, 학교에서 도서관까지는 (\d+) m/.exec(p);
      if (m) { const 합 = +m[1] * 1000 + +m[2] + +m[3]; expect(q.answer, p).toBe(`${Math.floor(합 / 1000)} km ${합 % 1000} m`); 센다('거리'); }
      m = /^(\d+시 \d+분 \d+초)에 영화가 시작했습니다. 영화는 (\d+분 \d+초) 동안 상영하고, 끝난 뒤 (\d+분 \d+초) 쉬었습니다/.exec(p);
      if (m) { expect(초(q.answer), p).toBe(초(m[1]) + 분초(m[2]) + 분초(m[3])); 센다('시간'); }
      m = /^(\d+) km (\d+) m는 몇 m/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] * 1000 + +m[2]); 센다('km'); }
      m = /^반지름이 (\d+) cm인 원 (\d+)개를 겹치지 않게 한 줄로/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(2 * +m[1] * +m[2]); 센다('원'); }
      m = /구슬 전체의 (\d+)\/(\d+)[이가] (\d+)개입니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[3] / +m[1]) * +m[2]); 센다('전체'); }
      m = /^(\d+)의 1\/(\d+)[은는] 얼마일까요/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] / +m[2]); 센다('분수만큼'); }
      m = /^□\/(\d+) < (\d+)[과와] (\d+)\/(\d+)입니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[2] * +m[1] + +m[3] - 1); 센다('대분수'); }
      m = /^무게가 (\d+) g인 빈 상자에 한 개에 (\d+) g인 사과를 (\d+)개/.exec(p);
      if (m) { const g = +m[1] + +m[2] * +m[3]; const 답 = g >= 1000 ? `${Math.floor(g / 1000)} kg ${g % 1000} g` : `${g} g`; expect(q.answer, p).toBe(답); 센다('무게'); }
      m = /^큰 그림은 100상자, 작은 그림은 10상자를 나타냅니다. (\d+)상자를/.exec(p);
      if (m) { const v = +m[1]; expect(q.answer, p).toBe(`큰 그림 ${Math.floor(v / 100)}개, 작은 그림 ${(v % 100) / 10}개`); 센다('그림'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['직각', '나눗셈뜻', '용어', '거리', '시간', 'km', '원', '전체', '분수만큼', '대분수', '무게', '그림', '바르게']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});
