import { describe, expect, it } from 'vitest';
import { lessons62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 6-2 문항을 생성기와 따로 처음부터 다시 풉니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Array<{ unitNo: number; lessonNo: number; q: Question }> = [];
for (const lesson of lessons62) {
  for (const level of levels) {
    for (const q of generateQuestions(lesson, level)) 모두.push({ unitNo: lesson.unitNo, lessonNo: lesson.lessonNo, q });
  }
}
const 단원 = (unitNo: number) => 모두.filter((x) => x.unitNo === unitNo);
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 분수값 = (t: string): number => {
  const s = t.replace(/ (L|m|cm)$/, '').trim();
  let m = /^(\d+)(?:과|와) (\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2]);
  return Number(s);
};
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('6-2 모든 문항', () => {
  it('차시·수준마다 문항이 있고, 보기는 넷이며 답이 하나 들어 있습니다', () => {
    for (const lesson of lessons62) {
      for (const level of levels) expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(10);
    }
    for (const { q } of 모두) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices.filter((c) => c === q.answer).length, q.prompt).toBe(1);
    }
  });

  it('조사가 괄호 꼴로 남거나 받침과 어긋나지 않고 undefined가 없습니다', () => {
    for (const { q } of 모두) {
      const raw = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(raw, q.prompt).not.toMatch(/을\(를\)|은\(는\)|이\(가\)|과\(와\)|\(으\)로|undefined|NaN|Infinity|0층/);
      const text = raw.replace(/(\d+)\/\d+/g, '$1');
      expect(text, q.prompt).not.toMatch(/[013678](를|는|가|와)\s/);
      expect(text, q.prompt).not.toMatch(/[2459](을|은|이|과)\s/);
      expect(text, q.prompt).not.toMatch(/[036]로\s|[1245789]으로\s/);
    }
  });

  it('지도서가 쓰지 말라는 말(역수, 회전체, 소수 나눗셈의 나머지)이 없습니다', () => {
    for (const { q, unitNo } of 모두) {
      const t = [q.prompt, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(t, q.prompt).not.toMatch(/역수|회전체/);
      if (unitNo === 2) expect(t, q.prompt).not.toMatch(/나머지/);
    }
  });
});

describe('6-2 1단원 분수의 나눗셈', () => {
  it('몫이 맞고, 보기에 답과 크기가 같은 다른 꼴이 없습니다', () => {
    let count = 0;
    for (const { q } of 단원(1)) {
      const m = /^(.+?)÷(.+?)(은|는) 얼마일까요/.exec(q.prompt);
      const s = /(?:주스|철사) (.+?) (?:L|m)를 (?:한 병에 )?(.+?) (?:L|m)씩/.exec(q.prompt);
      const pair = m ? [m[1], m[2]] : s ? [s[1], s[2]] : null;
      if (!pair) continue;
      const want = 분수값(pair[0]) / 분수값(pair[1]);
      const got = 분수값(q.answer.replace(/(개|도막)$/, ''));
      expect(같다(got, want), q.prompt).toBe(true);
      expect(q.choices.filter((c) => 같다(분수값(c.replace(/(개|도막)$/, '')), want)), q.prompt).toEqual([q.answer]);
      count += 1;
    }
    expect(count).toBeGreaterThan(200);
  });
});

describe('6-2 2단원 소수의 나눗셈', () => {
  const 천분 = (t: string) => Math.round(Number(t) * 1000);
  it('몫·반올림·남는 양이 맞습니다', () => {
    for (const { q } of 단원(2)) {
      const d = /([\d.]+)÷([\d.]+)(은|는) 얼마일까요/.exec(q.prompt) ?? /^([\d.]+)÷([\d.]+)의 몫을 어림하여/.exec(q.prompt);
      if (d && !/반올림/.test(q.prompt)) expect(Math.round((천분(q.answer) * 천분(d[2])) / 1000), q.prompt).toBe(천분(d[1]));
      const r = /^(\d+)÷(\d+)의 몫을 반올림하여 소수 (첫째|둘째) 자리/.exec(q.prompt);
      if (r) {
        const p = r[3] === '첫째' ? 1 : 2;
        expect(q.answer, q.prompt).toBe((Math.round((Number(r[1]) / Number(r[2])) * 10 ** p) / 10 ** p).toFixed(p));
      }
      const left = /([\d.]+) L를 한 병에 (\d+) L씩/.exec(q.prompt);
      if (left) {
        const total = 천분(left[1]);
        const per = Number(left[2]) * 1000;
        const n = Math.floor(total / per);
        expect(q.answer, q.prompt).toBe(`${n}병, ${(total - n * per) / 1000} L`);
      }
    }
  });
});

describe('6-2 3단원 공간과 입체', () => {
  it('위에서 본 모양의 수로 개수·층·앞·옆 모양을 다시 구합니다', () => {
    let count = 0;
    for (const { q } of 단원(3)) {
      if (q.visual?.kind !== 'stack-plan') continue;
      const h = q.visual.heights;
      const 앞 = h[0].map((_, c) => Math.max(...h.map((row) => row[c])));
      // 오른쪽에서 보면 앞쪽(아래) 줄이 왼쪽에 보입니다.
      const 옆 = h.map((row) => Math.max(...row)).reverse();
      const 층 = (xs: number[]) => xs.map((x) => `${x}층`).join(', ');
      if (q.prompt.includes('쌓기나무는 모두 몇 개')) expect(수(q.answer), q.prompt).toBe(h.flat().reduce((s, x) => s + x, 0));
      const lay = /(\d)층에 놓인 쌓기나무는 몇 개/.exec(q.prompt);
      if (lay) expect(수(q.answer), q.prompt).toBe(h.flat().filter((x) => x >= Number(lay[1])).length);
      if (q.prompt.startsWith('앞에서 본 모양을 왼쪽부터')) expect(q.answer, q.prompt).toBe(층(앞));
      if (q.prompt.startsWith('옆에서 본 모양을 앞쪽부터')) expect(q.answer, q.prompt).toBe(층(옆));
      if (q.prompt.startsWith('앞에서 본 모양을 그릴 때')) expect(수(q.answer), q.prompt).toBe(앞.reduce((s, x) => s + x, 0));
      if (q.prompt.includes('? 칸에 쌓인')) {
        const [r, c] = q.visual.hidden!;
        expect(q.prompt, q.prompt).toContain(`왼쪽부터 ${층(앞)}`);
        expect(q.prompt, q.prompt).toContain(`앞쪽부터 ${층(옆)}`);
        // 1~3 가운데 두 모양을 모두 지키는 값이 답 하나뿐인지 봅니다.
        const ok = [1, 2, 3].filter((t) => {
          const g = h.map((row) => [...row]);
          g[r][c] = t;
          const 앞2 = g[0].map((_, cc) => Math.max(...g.map((row) => row[cc])));
          const 옆2 = g.map((row) => Math.max(...row)).reverse();
          return 층(앞2) === 층(앞) && 층(옆2) === 층(옆);
        });
        expect(ok, q.prompt).toEqual([수(q.answer)]);
      }
      count += 1;
    }
    expect(count).toBeGreaterThan(100);
  });
});

describe('6-2 4단원 비례식과 비례배분', () => {
  it('비례식과 비례배분 답이 맞습니다', () => {
    for (const { q } of 단원(4)) {
      const box = /^([\d□]+) : ([\d□]+) = ([\d□]+) : ([\d□]+)에서 □/.exec(q.prompt);
      if (box) {
        const t = [1, 2, 3, 4].map((k) => (box[k] === '□' ? 수(q.answer) : Number(box[k])));
        expect(t[0] * t[3], q.prompt).toBe(t[1] * t[2]);
      }
      if (q.prompt === '비례식으로 옳은 것은 어느 것일까요?') {
        const 참 = (s: string) => {
          const m = /^(\d+) : (\d+) = (\d+) : (\d+)$/.exec(s)!;
          return Number(m[1]) * Number(m[4]) === Number(m[2]) * Number(m[3]);
        };
        expect(q.choices.filter(참), q.prompt).toEqual([q.answer]);
      }
      const simp = /^(.+?)(을|를) 가장 간단한 자연수의 비로/.exec(q.prompt);
      if (simp) {
        const [x, y] = simp[1].split(' : ').map(분수값);
        const [a, b] = q.answer.split(' : ').map(Number);
        expect(같다(x / y, a / b), q.prompt).toBe(true);
        const g = (m: number, n: number): number => (n === 0 ? m : g(n, m % n));
        expect(g(a, b), q.prompt).toBe(1);
        for (const c of q.choices.filter((c) => c !== q.answer)) {
          const [p, r] = c.split(' : ').map(Number);
          expect(같다(p / r, a / b), `${q.prompt} ${c}`).toBe(false);
        }
      }
      const dist = /구슬 (\d+)개를 형과 동생이 (\d+) : (\d+)(?:로|으로) 나누어 가지려고 합니다\. (형|동생)/.exec(q.prompt);
      if (dist) {
        const [n, a, b] = [1, 2, 3].map((k) => Number(dist[k]));
        expect(수(q.answer), q.prompt).toBe((n * (dist[4] === '형' ? a : b)) / (a + b));
      }
      const terms = /비례식 (\d+) : (\d+) = (\d+) : (\d+)에서 (외항|내항)/.exec(q.prompt);
      if (terms) expect(q.answer, q.prompt).toBe(terms[5] === '외항' ? `${terms[1]}, ${terms[4]}` : `${terms[2]}, ${terms[3]}`);
    }
  });
});

describe('6-2 5단원 원주율과 원의 넓이', () => {
  const pi = (x: number) => Math.round(x * 314) / 100;
  it('원주와 넓이가 맞습니다(원주율 3.14)', () => {
    for (const { q } of 단원(5)) {
      const c1 = /^지름이 (\d+) cm인 원의 원주는 몇/.exec(q.prompt);
      if (c1) expect(수(q.answer), q.prompt).toBe(pi(Number(c1[1])));
      const c2 = /^반지름이 (\d+) cm인 원의 원주는 몇/.exec(q.prompt);
      if (c2) expect(수(q.answer), q.prompt).toBe(pi(2 * Number(c2[1])));
      const c3 = /^원주가 ([\d.]+) cm인 원의 지름/.exec(q.prompt);
      if (c3) expect(pi(수(q.answer)), q.prompt).toBe(Number(c3[1]));
      const a1 = /^반지름이 (\d+) cm인 원의 넓이는 몇/.exec(q.prompt);
      if (a1) expect(수(q.answer), q.prompt).toBe(pi(Number(a1[1]) ** 2));
      const a2 = /^지름이 (\d+) cm인 원의 넓이는 몇/.exec(q.prompt);
      if (a2) expect(수(q.answer), q.prompt).toBe(pi((Number(a2[1]) / 2) ** 2));
      const half = /^반지름이 (\d+) cm인 반원의 넓이/.exec(q.prompt);
      if (half) expect(수(q.answer), q.prompt).toBe(pi(Number(half[1]) ** 2) / 2);
      const ring = /^반지름이 (\d+) cm인 원에서 같은 중심을 가진 반지름 (\d+) cm/.exec(q.prompt);
      if (ring) expect(수(q.answer), q.prompt).toBe(pi(Number(ring[1]) ** 2 - Number(ring[2]) ** 2));
      const wheel = /^지름이 (\d+) cm인 바퀴가 (\d+)바퀴/.exec(q.prompt);
      if (wheel) expect(수(q.answer), q.prompt).toBe(pi(Number(wheel[1]) * Number(wheel[2])));
      const out = /^반지름이 (\d+) cm인 원의 넓이를 어림하려고 합니다\. 원 밖에/.exec(q.prompt);
      if (out) expect(수(q.answer), q.prompt).toBe(4 * Number(out[1]) ** 2);
    }
  });
});

describe('6-2 6단원 원기둥, 원뿔, 구', () => {
  it('전개도와 길이 답이 맞습니다', () => {
    for (const { q } of 단원(6)) {
      const net = /밑면의 반지름이 (\d+) cm, 높이가 (\d+) cm인 원기둥의 전개도에서 옆면의 (가로|세로)/.exec(q.prompt);
      if (net) expect(수(q.answer), q.prompt).toBe(net[3] === '가로' ? Math.round(2 * Number(net[1]) * 314) / 100 : Number(net[2]));
      const sp = /지름이 (\d+) cm(?:인 구의| 일 때|일 때) 구?의? ?반지름|반원의 지름이 (\d+) cm일 때 구의 반지름|^지름이 (\d+) cm인 구의 반지름/.exec(q.prompt);
      if (sp) expect(수(q.answer), q.prompt).toBe(Number(sp[1] ?? sp[2] ?? sp[3]) / 2);
    }
  });
});
