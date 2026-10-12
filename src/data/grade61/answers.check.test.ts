import { describe, expect, it } from 'vitest';
import { lessons61 } from '../curriculum61';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 6-1 문항을 생성기와 따로 처음부터 다시 풉니다.
// 지도서가 기약분수가 아닌 답도 허용하므로, 보기 가운데 답과 크기가 같은
// 것이 답 하나뿐인지(같은 값의 다른 꼴이 없는지)도 봅니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Array<{ unitNo: number; lessonNo: number; q: Question }> = [];
for (const lesson of lessons61) {
  for (const level of levels) {
    for (const q of generateQuestions(lesson, level)) 모두.push({ unitNo: lesson.unitNo, lessonNo: lesson.lessonNo, q });
  }
}
const 단원 = (unitNo: number) => 모두.filter((x) => x.unitNo === unitNo);
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));

/** '1과 2/3', '5/3', '4'를 분수 값(분자/분모 실수)으로 읽습니다. */
const 분수값 = (t: string): number => {
  const s = t.replace(/ (L|m|m²)$/, '').trim();
  let m = /^(\d+)(?:과|와) (\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2]);
  return Number(s);
};
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('6-1 모든 문항', () => {
  it('차시·수준마다 문항이 있고, 보기는 넷이며 답이 하나 들어 있습니다', () => {
    for (const lesson of lessons61) {
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
      expect(raw, q.prompt).not.toMatch(/을\(를\)|은\(는\)|이\(가\)|과\(와\)|\(으\)로|undefined|NaN|Infinity/);
      const text = raw.replace(/(\d+)\/\d+/g, '$1');
      expect(text, q.prompt).not.toMatch(/[013678](를|는|가|와)\s/);
      expect(text, q.prompt).not.toMatch(/[2459](을|은|이|과)\s/);
      expect(text, q.prompt).not.toMatch(/[036]로\s|[1245789]으로\s/);
    }
  });

  it('지도서가 쓰지 말라는 말(역수)이 없습니다', () => {
    for (const { q } of 모두) expect([q.prompt, ...q.support.steps, q.support.studentHint].join(' '), q.prompt).not.toMatch(/역수/);
  });
});

describe('6-1 1단원 분수의 나눗셈', () => {
  it('몫이 맞고, 보기에 답과 크기가 같은 다른 꼴이 없습니다', () => {
    let count = 0;
    for (const { q } of 단원(1)) {
      let want: number | null = null;
      const whole = /^(\d+)÷(\d+)의 몫을 분수로/.exec(q.prompt);
      if (whole) want = Number(whole[1]) / Number(whole[2]);
      const fd = /^(.+?)÷(\d+)(은|는) 얼마일까요/.exec(q.prompt);
      if (fd) want = 분수값(fd[1]) / Number(fd[2]);
      const story = /(\d+) L를 (\d+)명이 똑같이/.exec(q.prompt);
      if (story) want = Number(story[1]) / Number(story[2]);
      const area = /넓이가 (\d+)\/(\d+) m²이고 가로가 (\d+) m/.exec(q.prompt);
      if (area) want = Number(area[1]) / Number(area[2]) / Number(area[3]);
      if (want === null) continue;
      expect(같다(분수값(q.answer), want), q.prompt).toBe(true);
      expect(q.choices.filter((c) => 같다(분수값(c), want!)), q.prompt).toEqual([q.answer]);
      count += 1;
    }
    expect(count).toBeGreaterThan(200);
  });
});

describe('6-1 2단원 각기둥과 각뿔', () => {
  const 각 = { 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9, 십: 10 } as Record<string, number>;
  it('면·모서리·꼭짓점의 수와 이름이 맞습니다', () => {
    for (const { q } of 단원(2)) {
      const c = /^(.)각(기둥|뿔)의 (면|모서리|꼭짓점)(은|는|이|가)? ?몇 개/.exec(q.prompt.replace('의 면은', '의 면 ').replace('의 모서리는', '의 모서리 ').replace('의 꼭짓점은', '의 꼭짓점 '));
      if (c) {
        const n = 각[c[1]];
        const v = c[2] === '기둥' ? { 면: n + 2, 모서리: 3 * n, 꼭짓점: 2 * n }[c[3]]! : { 면: n + 1, 모서리: 2 * n, 꼭짓점: n + 1 }[c[3]]!;
        expect(수(q.answer), q.prompt).toBe(v);
      }
      const base = /밑면의 모양이 (.)각형인 각(기둥|뿔)의 이름/.exec(q.prompt);
      if (base) expect(q.answer, q.prompt).toBe(`${base[1]}각${base[2]}`);
      const side = /옆면이 (\d+)개인 각(기둥|뿔)의 이름/.exec(q.prompt);
      if (side) expect(각[q.answer[0]], q.prompt).toBe(Number(side[1]));
      const faces = /면이 모두 (\d+)개인 각(기둥|뿔)의 이름/.exec(q.prompt);
      if (faces) {
        expect(q.answer.endsWith(faces[2]), q.prompt).toBe(true);
        expect(각[q.answer[0]] + (faces[2] === '기둥' ? 2 : 1), q.prompt).toBe(Number(faces[1]));
      }
      const net = /한 변 (\d+) cm인 정(.)각형이고 높이가 \d+ cm/.exec(q.prompt);
      if (net) expect(수(q.answer), q.prompt).toBe(Number(net[1]) * 각[net[2]]);
    }
  });
});

describe('6-1 3단원 소수의 나눗셈', () => {
  const 천분 = (t: string) => Math.round(Number(t) * 1000);
  it('몫이 맞습니다', () => {
    let count = 0;
    for (const { q } of 단원(3)) {
      const a = /^([\d.]+)÷(\d+)(은|는) 얼마일까요/.exec(q.prompt);
      const b = /이용하면 ([\d.]+)÷(\d+)(은|는) 얼마/.exec(q.prompt);
      const c = /^(\d+)÷(\d+)의 몫을 소수로/.exec(q.prompt);
      const d = /^([\d.]+)÷(\d+)의 몫을 어림하여/.exec(q.prompt);
      const e = /([\d.]+) (m|kg)를? ?(?:를 )?(\d+)명이|공 (\d+)개의 무게가 ([\d.]+) kg/.exec(q.prompt);
      const m = a ?? b ?? c ?? d;
      if (m) {
        expect(천분(q.answer) * Number(m[2]), q.prompt).toBe(천분(m[1]));
        count += 1;
      }
      if (e && !m) {
        const [x, k] = e[4] ? [e[5], e[4]] : [e[1], e[3]];
        expect(천분(q.answer.split(' ')[0]) * Number(k), q.prompt).toBe(천분(x));
      }
    }
    expect(count).toBeGreaterThan(150);
  });
  it('세로셈 차시의 꼴을 지킵니다', () => {
    for (const { q, lessonNo } of 단원(3)) {
      const a = /^([\d.]+)÷(\d+)(은|는) 얼마일까요/.exec(q.prompt);
      if (!a) continue;
      const ans = Number(q.answer);
      if (lessonNo === 3) expect(ans > 1, q.prompt).toBe(true);
      if (lessonNo === 4) expect(ans < 1, q.prompt).toBe(true);
      if (lessonNo === 6) expect(q.answer, q.prompt).toMatch(/\.0\d/);
    }
  });
});

describe('6-1 4단원 비와 비율', () => {
  it('비·비율·백분율 답이 맞습니다', () => {
    for (const { q } of 단원(4)) {
      const 말 = /^'(.+)' — 기호/.exec(q.prompt);
      if (말) {
        const t = 말[1];
        let m = /^(\d+) 대 (\d+)$/.exec(t) ?? /^(\d+)(?:과|와) (\d+)의 비$/.exec(t) ?? /^(\d+)의 (\d+)에 대한 비$/.exec(t);
        let want = m ? `${m[1]} : ${m[2]}` : '';
        m = /^(\d+)에 대한 (\d+)의 비$/.exec(t);
        if (m) want = `${m[2]} : ${m[1]}`;
        expect(q.answer, q.prompt).toBe(want);
      }
      const r = /^(\d+) : (\d+)의 비율을 (분수|소수)로/.exec(q.prompt);
      if (r) expect(같다(분수값(q.answer), Number(r[1]) / Number(r[2])), q.prompt).toBe(true);
      const p1 = /^비율 ([\d./]+)을?를?\(?를?\)? ?백분율|^비율 ([\d./]+)(을|를) 백분율/.exec(q.prompt);
      if (p1) {
        const v = 분수값(p1[2] ?? p1[1]);
        expect(같다(수(q.answer), v * 100), q.prompt).toBe(true);
      }
      const p2 = /^(\d+)%를 소수로/.exec(q.prompt);
      if (p2) expect(Number(q.answer), q.prompt).toBe(Number(p2[1]) / 100);
      const sale = /^(\d+)원짜리 물건을 (\d+)% 할인/.exec(q.prompt);
      if (sale) expect(수(q.answer), q.prompt).toBe((Number(sale[1]) * Number(sale[2])) / 100);
      const rate = /^(\d+)원짜리 물건을 (\d+)원에 샀습니다/.exec(q.prompt);
      if (rate) expect(수(q.answer), q.prompt).toBe(((Number(rate[1]) - Number(rate[2])) * 100) / Number(rate[1]));
      const vote = /^(\d+)명이 투표하여 한 후보가 (\d+)표/.exec(q.prompt);
      if (vote) expect(수(q.answer), q.prompt).toBe((Number(vote[2]) * 100) / Number(vote[1]));
      const life = /(\d+)(?:번 던져|개를 심었더니|문제 가운데) (\d+)(?:번|개|문제)/.exec(q.prompt);
      if (life) expect(Number(q.answer), q.prompt).toBe(Number(life[2]) / Number(life[1]));
    }
  });
});

describe('6-1 5단원 띠그래프와 원그래프', () => {
  it('백분율의 합이 100%이고 그래프로 푼 답이 맞습니다', () => {
    for (const { q } of 단원(5)) {
      if (q.visual?.kind !== 'ratio-graph') continue;
      const items = q.visual.items;
      expect(items.reduce((s, it) => s + it.percent, 0), q.prompt).toBe(100);
      const 값 = (n: string) => items.find((it) => it.name === n)!.percent;
      const read = /^(.+?)(이|가) 차지하는 비율은/.exec(q.prompt);
      if (read) expect(수(q.answer), q.prompt).toBe(값(read[1]));
      const hid = /에서 (.+)의 백분율\(\?\)/.exec(q.prompt);
      if (hid) expect(수(q.answer), q.prompt).toBe(값(hid[1]));
      const times = /^(.+)의 비율은 (.+)의 비율의 몇 배/.exec(q.prompt);
      if (times) expect(수(q.answer), q.prompt).toBe(값(times[1]) / 값(times[2]));
      const more = /^(.+)(은|는) (.+)보다 몇 % 더 많을까요/.exec(q.prompt);
      if (more) expect(수(q.answer), q.prompt).toBe(값(more[1]) - 값(more[3]));
      const amt = /모두 (\d+)명일 때 (.+)(을|를) 좋아하는/.exec(q.prompt);
      if (amt) expect(수(q.answer), q.prompt).toBe((Number(amt[1]) * 값(amt[2])) / 100);
      if (/비율이 가장 (높은|낮은)/.test(q.prompt)) {
        const ps = items.map((it) => it.percent);
        const want = q.prompt.includes('높은') ? Math.max(...ps) : Math.min(...ps);
        expect(ps.filter((p) => p === want).length, q.prompt).toBe(1);
        expect(값(q.answer), q.prompt).toBe(want);
      }
    }
  });
});

describe('6-1 6단원 직육면체의 겉넓이와 부피', () => {
  it('겉넓이와 부피가 맞습니다', () => {
    for (const { q } of 단원(6)) {
      const box = /가로 (\d+) cm, 세로 (\d+) cm, 높이 (\d+) cm인 직육면체의 (겉넓이|부피)는 몇 (cm²|cm³|m³)/.exec(q.prompt);
      if (box) {
        const [a, b, c] = [1, 2, 3].map((k) => Number(box[k]));
        const want = box[4] === '겉넓이' ? 2 * (a * b + b * c + a * c) : box[5] === 'm³' ? (a * b * c) / 1000000 : a * b * c;
        expect(수(q.answer), q.prompt).toBe(want);
      }
      const cube = /한 모서리가 (\d+) cm인 정육면체의 (겉넓이|부피)/.exec(q.prompt);
      if (cube) {
        const a = Number(cube[1]);
        expect(수(q.answer), q.prompt).toBe(cube[2] === '겉넓이' ? 6 * a * a : a * a * a);
      }
      const h = /부피가 (\d+) cm³인 직육면체의 가로가 (\d+) cm, 세로가 (\d+) cm/.exec(q.prompt);
      if (h) expect(수(q.answer), q.prompt).toBe(Number(h[1]) / Number(h[2]) / Number(h[3]));
      const conv = /^(\d+) m³는 몇 cm³/.exec(q.prompt);
      if (conv) expect(수(q.answer), q.prompt).toBe(Number(conv[1]) * 1000000);
    }
  });
});

// ════════════════════════════════════════════════════════════════════
// 그림과 문항이 어긋나지 않습니다
// ────────────────────────────────────────────────────────────────────
// 오각기둥을 묻는데 육각기둥이 그려져 있거나, 높이 7 cm라고 해 놓고 그림에
// 8 cm라고 적혀 있으면 아이는 그림을 믿을 수 없게 됩니다.
// ════════════════════════════════════════════════════════════════════
const 각수 = { 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9, 십: 10 } as Record<string, number>;

describe('6-1 그림과 문항이 어긋나지 않습니다', () => {
  it('각기둥·각뿔 겨냥도와 전개도는 문항의 입체도형과 같습니다', () => {
    let 겨냥도수 = 0;
    let 전개도수 = 0;
    for (const { q } of 단원(2)) {
      const v = q.visual;
      if (v?.kind === 'solid-figure') {
        겨냥도수 += 1;
        const m = /^(.)각(기둥|뿔)의/.exec(q.prompt);
        expect(m, q.prompt).not.toBeNull();
        expect(v.sides, q.prompt).toBe(각수[m![1]]);
        expect(v.solid, q.prompt).toBe(m![2] === '기둥' ? 'prism' : 'pyramid');
      }
      if (v?.kind === 'solid-net') {
        전개도수 += 1;
        const m = /(.)각기둥/.exec(q.prompt);
        expect(v.sides, q.prompt).toBe(각수[m![1]]);
        const 길이 = /한 변 (\d+) cm인 정.각형이고 높이가 (\d+) cm/.exec(q.prompt);
        if (길이) {
          expect(v.labels?.base, q.prompt).toBe(`${길이[1]} cm`);
          expect(v.labels?.height, q.prompt).toBe(`${길이[2]} cm`);
          expect(v.labels?.width, q.prompt).toBe('? cm');
          expect([v.base, v.height], q.prompt).toEqual([Number(길이[1]), Number(길이[2])]);
        } else expect(v.labels, q.prompt).toBeUndefined();
      }
      // 수 세기와 전개도 문항에는 그림이 있어야 합니다.
      if (/의 (면|모서리|꼭짓점)은 몇 개/.test(q.prompt)) expect(v?.kind, q.prompt).toBe('solid-figure');
      if (/전개도/.test(q.prompt)) expect(v?.kind, q.prompt).toBe('solid-net');
    }
    expect(겨냥도수).toBeGreaterThan(0);
    expect(전개도수).toBeGreaterThan(0);
  });

  it('직육면체·정육면체 그림의 길이가 문항과 같습니다', () => {
    for (const { q } of 단원(6)) {
      const v = q.visual;
      const box = /가로 (\d+) cm, 세로 (\d+) cm, 높이 (\d+) cm인 직육면체/.exec(q.prompt);
      const cube = /한 모서리가 (\d+) cm인 정육면체/.exec(q.prompt);
      const 높이 = /부피가 \d+ cm³인 직육면체의 가로가 (\d+) cm, 세로가 (\d+) cm/.exec(q.prompt);
      if (box || cube || 높이) expect(v?.kind, q.prompt).toBe('box-drawing');
      if (v?.kind !== 'box-drawing') continue;
      if (box) {
        expect([v.width, v.depth, v.height], q.prompt).toEqual([1, 2, 3].map((k) => Number(box[k])));
        expect(v.edgeLabels, q.prompt).toEqual({ width: `${box[1]} cm`, depth: `${box[2]} cm`, height: `${box[3]} cm` });
      }
      if (cube) {
        const a = Number(cube[1]);
        expect([v.width, v.depth, v.height], q.prompt).toEqual([a, a, a]);
        expect(v.edgeLabels, q.prompt).toEqual({ width: `${a} cm` });
      }
      if (높이) {
        expect(v.edgeLabels, q.prompt).toEqual({ width: `${높이[1]} cm`, depth: `${높이[2]} cm`, height: '? cm' });
        expect([v.width, v.depth], q.prompt).toEqual([Number(높이[1]), Number(높이[2])]);
        expect(v.height, q.prompt).toBe(수(q.answer));
      }
    }
  });

  it('문제에 약분되지 않은 진분수·가분수가 나오지 않습니다', () => {
    for (const { q } of 단원(1)) {
      for (const m of q.prompt.matchAll(/(?<![\d/])(\d+)\/(\d+)(?![\d/])/g)) {
        const [a, b] = [Number(m[1]), Number(m[2])];
        const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
        expect(g(a, b), q.prompt).toBe(1);
      }
    }
  });
});
