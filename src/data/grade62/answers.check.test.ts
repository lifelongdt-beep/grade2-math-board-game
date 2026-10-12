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

// 쌓기나무 입체 그림을 화면의 점마다 다시 그려 보아, 어느 쌓기나무가
// 보이는지 생성기와 따로 구합니다. 쌓기나무 하나가 덮는 육각형을 세 면의
// 다각형으로 보고, 점마다 가장 가까운(x+y+z가 큰) 쌓기나무를 찾습니다.
const 다각형안 = (px: number, py: number, pts: Array<[number, number]>) => {
  let 안 = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) 안 = !안;
  }
  return 안;
};
const 그려서보이는것 = (h: number[][]) => {
  const P = (x: number, y: number, z: number): [number, number] => [(x - y) * Math.sqrt(3) / 2, (x + y) / 2 - z];
  const cubes: Array<{ x: number; y: number; z: number }> = [];
  h.forEach((row, y) => row.forEach((n, x) => { for (let z = 0; z < n; z += 1) cubes.push({ x, y, z }); }));
  const 면들 = cubes.map((b) => {
    const p = (dx: number, dy: number, dz: number) => P(b.x + dx, b.y + dy, b.z + dz);
    return [
      [p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)],
      [p(0, 1, 0), p(1, 1, 0), p(1, 1, 1), p(0, 1, 1)],
      [p(1, 0, 0), p(1, 1, 0), p(1, 1, 1), p(1, 0, 1)],
    ];
  });
  const 보임 = new Set<number>();
  for (let u = -4; u <= 4; u += 0.037) {
    for (let v = -4; v <= 4; v += 0.041) {
      let best = -1;
      cubes.forEach((b, i) => {
        if (!면들[i].some((f) => 다각형안(u, v, f))) return;
        if (best < 0 || b.x + b.y + b.z > cubes[best].x + cubes[best].y + cubes[best].z) best = i;
      });
      if (best >= 0) 보임.add(best);
    }
  }
  return cubes.filter((_, i) => 보임.has(i));
};

describe('6-2 3단원 쌓기나무 입체 그림', () => {
  it('그림을 다시 그려 보아 개수·층·모양 답을 구합니다', () => {
    let count = 0;
    const 층 = (xs: number[]) => xs.map((x) => `${x}층`).join(', ');
    for (const { q } of 단원(3)) {
      if (q.visual?.kind !== 'stack-iso') continue;
      if (q.visual.plan && q.visual.items) {
        // 위에서 본 모양과 똑같은 것은 답 하나뿐이고, 모든 보기는 숨은 것이 없어야 합니다.
        const 같은것 = q.visual.items.filter((m) => JSON.stringify(m.heights) === JSON.stringify(q.visual!.kind === 'stack-iso' ? q.visual.plan : []));
        expect(같은것.map((m) => m.name), q.prompt).toEqual([q.answer]);
        for (const m of q.visual.items) expect(그려서보이는것(m.heights).length).toBe(m.heights.flat().reduce((s, x) => s + x, 0));
        count += 1;
        continue;
      }
      if (q.visual.items) {
        const [a, b] = q.visual.items.map((m) => m.heights.flat().reduce((s, x) => s + x, 0));
        for (const m of q.visual.items) expect(그려서보이는것(m.heights).length).toBe(m.heights.flat().reduce((s, x) => s + x, 0));
        expect(q.answer, q.prompt).toBe(`${a > b ? '가' : '나'}, ${Math.abs(a - b)}개`);
        count += 1;
        continue;
      }
      const h = q.visual.heights;
      const 전체 = h.flat().reduce((s, x) => s + x, 0);
      const 보임 = 그려서보이는것(h);
      if (q.prompt.includes('보이지 않는 쌓기나무는 없습니다')) expect(보임.length, q.prompt).toBe(전체);
      if (q.prompt.includes('쌓기나무는 모두 몇 개')) expect(수(q.answer), q.prompt).toBe(전체);
      if (q.prompt.includes('적어도 몇 개 필요')) {
        const 높이 = new Map<string, number>();
        for (const b of 보임) 높이.set(`${b.x},${b.y}`, Math.max(높이.get(`${b.x},${b.y}`) ?? 0, b.z + 1));
        expect(수(q.answer), q.prompt).toBe([...높이.values()].reduce((s, x) => s + x, 0));
      }
      const lay = /(\d)층에 놓인 쌓기나무는 몇 개/.exec(q.prompt);
      if (lay) expect(수(q.answer), q.prompt).toBe(h.flat().filter((x) => x >= Number(lay[1])).length);
      if (q.prompt.includes('앞에서 본 모양을 왼쪽부터')) expect(q.answer, q.prompt).toBe(층(h[0].map((_, c) => Math.max(...h.map((row) => row[c])))));
      if (q.prompt.includes('옆에서 본 모양을 앞쪽부터')) expect(q.answer, q.prompt).toBe(층(h.map((row) => Math.max(...row)).reverse()));
      if (q.prompt.includes('위에서 본 모양을 그릴 때')) expect(수(q.answer), q.prompt).toBe(h.flat().filter((x) => x > 0).length);
      if (q.prompt.includes('정육면체 모양을 만들려면')) expect(수(q.answer), q.prompt).toBe(27 - 전체);
      count += 1;
    }
    expect(count).toBeGreaterThan(60);
  });
});

describe('6-2 3단원 본 모양 그림·층별 그림·추측', () => {
  const 앞층 = (h: number[][]) => h[0].map((_, c) => Math.max(...h.map((row) => row[c])));
  const 옆층 = (h: number[][]) => h.map((row) => Math.max(...row)).reverse();
  const 세움 = (xs: number[]) => {
    const H = Math.max(...xs);
    return Array.from({ length: H }, (_, k) => xs.map((x) => x >= H - k));
  };
  const 층 = (xs: number[]) => xs.map((x) => `${x}층`).join(', ');
  it('본 모양 보기 가운데 맞는 것은 답 하나뿐입니다', () => {
    let count = 0;
    for (const { q } of 단원(3)) {
      if (q.visual?.kind !== 'stack-iso' || !q.visual.views) continue;
      const h = q.visual.heights;
      const 방향 = /(앞|옆|위)에서 본 모양은 어느 것/.exec(q.prompt)![1];
      const 맞음 = 방향 === '앞' ? 세움(앞층(h)) : 방향 === '옆' ? 세움(옆층(h)) : h.map((row) => row.map((x) => x > 0));
      const 같은 = q.visual.views.filter((v) => JSON.stringify(v.cells) === JSON.stringify(맞음)).map((v) => v.name);
      expect(같은, q.prompt).toEqual([q.answer]);
      if (!q.visual.planOnly) expect(그려서보이는것(h).length, q.prompt).toBe(h.flat().reduce((s, x) => s + x, 0));
      count += 1;
    }
    expect(count).toBeGreaterThan(30);
  });
  it('위·앞·옆에서 본 모양과 층별 모양으로 답을 다시 구합니다', () => {
    let count = 0;
    for (const { q } of 단원(3)) {
      if (q.visual?.kind !== 'cube-views') continue;
      const v = q.visual.views;
      if (v[0].label === '1층') {
        const h = v[0].cells.map((row, r) => row.map((_, c) => v.filter((one) => one.cells[r][c]).length));
        if (q.prompt.includes('모두 몇 개')) expect(수(q.answer), q.prompt).toBe(h.flat().reduce((s, x) => s + x, 0));
        if (q.prompt.includes('앞에서 본 모양')) expect(q.answer, q.prompt).toBe(층(앞층(h)));
        count += 1;
        continue;
      }
      const 위 = v.find((one) => one.label === '위')!.cells;
      const 앞 = v.find((one) => one.label === '앞')!.cells;
      const 옆 = v.find((one) => one.label === '옆')!.cells;
      const 높이들 = (g: boolean[][]) => g[0].map((_, c) => g.filter((row) => row[c]).length);
      const 칸들: Array<[number, number]> = [];
      위.forEach((row, r) => row.forEach((on, c) => on && 칸들.push([r, c])));
      const 합들: number[] = [];
      for (let m = 0; m < 3 ** 칸들.length; m += 1) {
        const g = 위.map((row) => row.map(() => 0));
        let t = m;
        칸들.forEach(([r, c]) => { g[r][c] = (t % 3) + 1; t = Math.floor(t / 3); });
        if (층(앞층(g)) === 층(높이들(앞)) && 층(옆층(g)) === 층(높이들(옆))) 합들.push(g.flat().reduce((s, x) => s + x, 0));
      }
      if (q.prompt.includes('가장 적게')) expect(수(q.answer), q.prompt).toBe(Math.min(...합들));
      if (q.prompt.includes('가장 많이')) expect(수(q.answer), q.prompt).toBe(Math.max(...합들));
      count += 1;
    }
    expect(count).toBeGreaterThan(20);
  });
  it('뒤에서 본 모양은 앞에서 본 모양을 좌우로 뒤집은 것입니다', () => {
    for (const { q } of 단원(3)) {
      if (!q.prompt.includes('뒤에서 본 모양') || q.visual?.kind !== 'stack-plan') continue;
      expect(q.answer, q.prompt).toBe(층([...앞층(q.visual.heights)].reverse()));
    }
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

// ════════════════════════════════════════════════════════════════════
// 그림과 문항이 어긋나지 않습니다
// ════════════════════════════════════════════════════════════════════
describe('6-2 그림과 문항이 어긋나지 않습니다', () => {
  it('원의 넓이 활용 그림의 반지름·지름이 문항과 같습니다', () => {
    for (const { q } of 단원(5)) {
      const v = q.visual;
      const 반원 = /반지름이 (\d+) cm인 반원/.exec(q.prompt);
      if (반원) {
        expect(v?.kind, q.prompt).toBe('circle-region');
        if (v?.kind === 'circle-region') {
          expect(v.shape, q.prompt).toBe('semicircle');
          expect(v.labels.outer, q.prompt).toBe(`${반원[1]} cm`);
          expect(v.outer, q.prompt).toBe(Number(반원[1]));
        }
      }
      const 고리 = /반지름이 (\d+) cm인 원에서 같은 중심을 가진 반지름 (\d+) cm인 원/.exec(q.prompt);
      if (고리) {
        expect(v?.kind, q.prompt).toBe('circle-region');
        if (v?.kind === 'circle-region') {
          expect(v.shape, q.prompt).toBe('ring');
          expect([v.outer, v.inner], q.prompt).toEqual([Number(고리[1]), Number(고리[2])]);
          expect(v.labels, q.prompt).toEqual({ outer: `${고리[1]} cm`, inner: `${고리[2]} cm` });
        }
      }
      const 바퀴 = /지름이 (\d+) cm인 바퀴/.exec(q.prompt);
      if (바퀴) {
        expect(v?.kind, q.prompt).toBe('circles');
        if (v?.kind === 'circles') expect(v.segments?.[0].name, q.prompt).toBe(`${바퀴[1]} cm`);
      }
      if (/^원주가 [\d.]+ cm인 원의 지름/.test(q.prompt)) {
        expect(v?.kind, q.prompt).toBe('circles');
        if (v?.kind === 'circles') {
          expect(v.segments?.[0].name, q.prompt).toBe('? cm');
          // 지름 선이어야 합니다(반지름 선이면 아이가 반지름을 구합니다).
          expect(v.segments?.[0].from, q.prompt).toEqual([-1, 0]);
        }
      }
    }
  });

  it('원기둥·원뿔·구 그림의 길이가 문항과 같습니다', () => {
    let 그림수 = 0;
    for (const { q } of 단원(6)) {
      const v = q.visual;
      const 원기둥 = /밑면의 반지름이 (\d+) cm, 높이가 (\d+) cm인 원기둥/.exec(q.prompt);
      if (원기둥) {
        const [r, h] = [Number(원기둥[1]), Number(원기둥[2])];
        if (/전개도/.test(q.prompt)) {
          expect(v?.kind, q.prompt).toBe('solid-net');
          if (v?.kind === 'solid-net') {
            expect([v.solid, v.base, v.height], q.prompt).toEqual(['cylinder', r, h]);
            expect(v.labels?.base, q.prompt).toBe(`${r} cm`);
            const 묻는세로 = /세로/.test(q.prompt);
            expect(v.labels?.height, q.prompt).toBe(묻는세로 ? '? cm' : `${h} cm`);
            expect(v.labels?.width, q.prompt).toBe(묻는세로 ? undefined : '? cm');
          }
        } else {
          expect(v?.kind, q.prompt).toBe('solid-figure');
          if (v?.kind === 'solid-figure') {
            expect([v.solid, v.radius, v.height], q.prompt).toEqual(['cylinder', r, h]);
            expect(v.labels, q.prompt).toEqual({ radius: `${r} cm`, height: `${h} cm` });
          }
        }
        그림수 += 1;
      }
      const 원뿔 = /선분은 (\d+) cm, 원뿔의 꼭짓점에서 밑면에 수직인 선분은 (\d+) cm, 밑면의 반지름은 (\d+) cm/.exec(q.prompt);
      if (원뿔) {
        const [l, h, r] = [1, 2, 3].map((k) => Number(원뿔[k]));
        expect(r * r + h * h, q.prompt).toBe(l * l);
        expect(v?.kind, q.prompt).toBe('solid-figure');
        if (v?.kind === 'solid-figure') {
          expect([v.solid, v.radius, v.height], q.prompt).toEqual(['cone', r, h]);
          expect(v.labels, q.prompt).toEqual({ radius: `${r} cm`, height: `${h} cm`, slant: `${l} cm` });
        }
        그림수 += 1;
      }
      const 구 = /^지름이 (\d+) cm인 구/.exec(q.prompt);
      if (구) {
        expect(v?.kind, q.prompt).toBe('solid-figure');
        if (v?.kind === 'solid-figure') {
          expect(v.solid, q.prompt).toBe('sphere');
          expect((v.radius ?? 0) * 2, q.prompt).toBe(Number(구[1]));
          expect(v.labels, q.prompt).toEqual({ diameter: `${구[1]} cm` });
        }
        그림수 += 1;
      }
    }
    expect(그림수).toBeGreaterThan(20);
  });
});
