import { describe, expect, it } from 'vitest';
import { lessons42 } from '../curriculum42';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 4-2 문항을 생성기와 따로 처음부터 다시 풉니다.
// 도형 고르기 문항은 그림의 꼭짓점으로 평행·길이·직각을 다시 재어,
// 답인 도형만 정의를 만족하는지(포함 관계로 답이 둘이 되지 않는지) 봅니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Array<{ unitNo: number; lessonNo: number; level: Difficulty; q: Question }> = [];
for (const lesson of lessons42) {
  for (const level of levels) {
    for (const q of generateQuestions(lesson, level)) 모두.push({ unitNo: lesson.unitNo, lessonNo: lesson.lessonNo, level, q });
  }
}
const 단원 = (unitNo: number) => 모두.filter((x) => x.unitNo === unitNo);
const 수 = (text: string) => Number(text.replace(/[^\d.]/g, ''));

/** '3과 2/5', '7/5', '4'를 (분자, 분모)로 읽습니다. 약분하지 않습니다. */
const 분수 = (t: string): { n: number; d: number } => {
  const s = t.replace(/ L$/, '').trim();
  let m = /^(\d+)(?:과|와) (\d+)\/(\d+)$/.exec(s);
  if (m) return { n: Number(m[1]) * Number(m[3]) + Number(m[2]), d: Number(m[3]) };
  m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) return { n: Number(m[1]), d: Number(m[2]) };
  return { n: Number(s), d: 1 };
};
/** 천분 정수로 읽습니다. */
const 천분 = (t: string) => Math.round(Number(t) * 1000);

describe('4-2 모든 문항', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons42) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it('보기가 넷이고 서로 다르며 답이 하나 들어 있습니다', () => {
    for (const { q } of 모두) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices.filter((c) => c === q.answer).length, q.prompt).toBe(1);
    }
  });

  it('조사가 괄호 꼴로 남거나 받침과 어긋나지 않고 undefined가 없습니다', () => {
    for (const { q } of 모두) {
      const raw = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(raw, q.prompt).not.toMatch(/을\(를\)|은\(는\)|이\(가\)|과\(와\)|\(으\)로|undefined|NaN|(^|[^\d])0\/\d/);
      // 분수는 분모부터 읽으므로(5/3 = 삼분의 오) 조사는 분자를 따릅니다. 소수는 끝 숫자를 따릅니다.
      const text = raw.replace(/(\d+)\/\d+/g, '$1');
      expect(text, q.prompt).not.toMatch(/[013678](를|는|가|와)\s/);
      expect(text, q.prompt).not.toMatch(/[2459](을|은|이|과)\s/);
      expect(text, q.prompt).not.toMatch(/[036]로\s|[1245789]으로\s/);
    }
  });
});

describe('4-2 1단원 분수의 덧셈과 뺄셈', () => {
  it('계산이 맞고, 분모는 그대로이며 약분하지 않고, 가분수는 대분수로 씁니다', () => {
    let count = 0;
    for (const { q } of 단원(1)) {
      // 생각하는 문항(thinking/)은 따로 검사합니다.
      if (/□|어떤 수|수 카드|끈 /.test(q.prompt)) continue;
      const m = /^(.+?)([+-])(.+?)(은|는) 얼마일까요/.exec(q.prompt);
      const story = /(?:이|가) (.+?) L 있었는데 (.+?) L를 (더 부었습니다|마셨습니다)/.exec(q.prompt);
      const parts = m ? [m[1], m[2], m[3]] : story ? [story[1], story[3].startsWith('더') ? '+' : '-', story[2]] : null;
      if (!parts) continue;
      const a = 분수(parts[0]);
      const b = 분수(parts[2]);
      const d = Math.max(a.d, b.d);
      const 값 = (f: { n: number; d: number }) => (f.d === 1 ? f.n * d : f.n);
      const want = parts[1] === '+' ? 값(a) + 값(b) : 값(a) - 값(b);
      const got = 분수(q.answer);
      if (got.d === 1) expect(got.n * d, q.prompt).toBe(want);
      else {
        expect(got.d, q.prompt).toBe(d);
        expect(got.n, q.prompt).toBe(want);
      }
      // 꼴: 자연수로 떨어지면 자연수, 아니면 진분수 또는 대분수(가분수 아님).
      const ans = q.answer.replace(/ L$/, '');
      if (want % d === 0) expect(ans, q.prompt).toBe(String(want / d));
      else if (want < d) expect(ans, q.prompt).toBe(`${want}/${d}`);
      else expect(ans, q.prompt).toMatch(new RegExp(`^${Math.floor(want / d)}(과|와) ${want % d}/${d}$`));
      count += 1;
    }
    // 생각하는 문항이 섞여 계산 문항 수는 줄었습니다. 그쪽은 thinking/에서 검사합니다.
    expect(count).toBeGreaterThan(220);
  });

  it('가분수를 대분수로 바꾸는 답이 맞습니다', () => {
    for (const { q } of 단원(1)) {
      const m = /^(\d+)\/(\d+)(을|를) 대분수로/.exec(q.prompt);
      if (!m) continue;
      const got = 분수(q.answer);
      expect(got.n, q.prompt).toBe(Number(m[1]));
      expect(got.d, q.prompt).toBe(Number(m[2]));
    }
  });
});

describe('4-2 2단원 삼각형', () => {
  const 분류 = (degs: number[]) => {
    const big = Math.max(...degs);
    return big < 90 ? '예각삼각형' : big === 90 ? '직각삼각형' : '둔각삼각형';
  };
  it('각으로 분류하고 각을 구한 답이 맞습니다', () => {
    for (const { q } of 단원(2)) {
      const three = /세 각의 크기가 (\d+)°, (\d+)°, (\d+)°인 삼각형은 어떤/.exec(q.prompt);
      if (three) expect(q.answer, q.prompt).toBe(분류([1, 2, 3].map((k) => Number(three[k]))));
      const two = /두 각의 크기가 (\d+)°, (\d+)°입니다\. 이 삼각형은/.exec(q.prompt);
      if (two) {
        const a = Number(two[1]);
        const b = Number(two[2]);
        expect(q.answer, q.prompt).toBe(분류([a, b, 180 - a - b]));
      }
      if (q.prompt.startsWith('그림의 삼각형은 각의 크기에') && q.visual?.kind === 'figure-set') {
        const labels = q.visual.items[0].angleLabels!.map((l) => 수(l.text));
        expect(q.answer, q.prompt).toBe(분류([...labels, 180 - labels[0] - labels[1]]));
        // 그림의 꼭짓점에서 잰 각이 적힌 각과 같은지 봅니다.
        const p = q.visual.items[0].points!;
        const 각 = (i: number) => {
          const [o, a, b] = [p[i], p[(i + 1) % 3], p[(i + 2) % 3]];
          const v1 = [a[0] - o[0], a[1] - o[1]];
          const v2 = [b[0] - o[0], b[1] - o[1]];
          return (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]))) * 180) / Math.PI;
        };
        expect(Math.abs(각(0) - labels[0]) < 0.5, q.prompt).toBe(true);
        expect(Math.abs(각(1) - labels[1]) < 0.5, q.prompt).toBe(true);
      }
      const iso1 = /크기가 같은 두 각 가운데 한 각이 (\d+)°/.exec(q.prompt);
      if (iso1) expect(수(q.answer), q.prompt).toBe(180 - 2 * Number(iso1[1]));
      const iso2 = /길이가 같은 두 변 사이의 각이 (\d+)°/.exec(q.prompt);
      if (iso2) expect(수(q.answer), q.prompt).toBe((180 - Number(iso2[1])) / 2);
      const names = /세 각의 크기가 (\d+)°, (\d+)°, (\d+)°인 삼각형의 이름으로/.exec(q.prompt);
      if (names) {
        const degs = [1, 2, 3].map((k) => Number(names[k]));
        expect(new Set(degs).size, q.prompt).toBe(2);
        expect(q.answer, q.prompt).toBe(`${분류(degs)}이면서 이등변삼각형`);
      }
    }
  });

  it('변의 길이로 고르는 문항은 답 하나만 맞고, 정삼각형과 이등변삼각형이 함께 답이 되지 않습니다', () => {
    for (const { q } of 단원(2)) {
      const m = /^(정삼각형|이등변삼각형)의 세 변의 길이가 될 수 있는/.exec(q.prompt);
      if (!m) continue;
      const 변 = (c: string) => c.split(', ').map((x) => 수(x));
      const 맞음 = (c: string) => {
        const s = 변(c).sort((x, y) => x - y);
        const 삼각형 = s[0] + s[1] > s[2];
        const 같은수 = new Set(s).size;
        return 삼각형 && (m[1] === '정삼각형' ? 같은수 === 1 : 같은수 === 2);
      };
      expect(q.choices.filter(맞음), q.prompt).toEqual([q.answer]);
      if (m[1] === '이등변삼각형') for (const c of q.choices) expect(new Set(변(c)).size, q.prompt).not.toBe(1);
    }
  });
});

describe('4-2 3단원 소수의 덧셈과 뺄셈', () => {
  const 읽은값 = (t: string) => {
    const 숫자 = '영일이삼사오육칠팔구';
    const [앞, 뒤] = t.split(' 점 ');
    const 자연수 = (s: string) => {
      if (s === '영') return 0;
      let total = 0;
      let digit = 0;
      for (const ch of s) {
        const k = 숫자.indexOf(ch);
        if (k > 0) digit = k;
        else {
          total += (digit || 1) * (ch === '천' ? 1000 : ch === '백' ? 100 : 10);
          digit = 0;
        }
      }
      return total + digit;
    };
    return 자연수(앞) * 1000 + (뒤 ? [...뒤].reduce((s, ch, k) => s + 숫자.indexOf(ch) * 10 ** (2 - k), 0) : 0);
  };
  it('계산·읽기·비교·자릿값 답이 맞습니다', () => {
    let count = 0;
    for (const { q } of 단원(3)) {
      const calc = /^([\d.]+)([+-])([\d.]+)(은|는) 얼마일까요/.exec(q.prompt);
      if (calc) {
        const v = calc[2] === '+' ? 천분(calc[1]) + 천분(calc[3]) : 천분(calc[1]) - 천분(calc[3]);
        expect(천분(q.answer), q.prompt).toBe(v);
        expect(q.answer, q.prompt).not.toMatch(/\.\d*0$/);
        count += 1;
      }
      const story = /([\d.]+) (kg|m)(?:과|을|를| 있었는데| 쓰고| 가운데)?.*?([\d.]+) (kg|m)/.exec(q.prompt);
      if (story && !calc) {
        const a = 천분(story[1]);
        const b = 천분(story[3]);
        const v = /모두/.test(q.prompt) ? a + b : a - b;
        expect(천분(q.answer.split(' ')[0]), q.prompt).toBe(v);
      }
      const read = /^([\d.]+)(을|를) 바르게 읽은 것은/.exec(q.prompt);
      if (read) {
        expect(q.choices.filter((c) => 읽은값(c) === 천분(read[1])), q.prompt).toEqual([q.answer]);
        count += 1;
      }
      if (q.prompt.startsWith('두 소수의 크기를 바르게')) {
        const 참 = (t: string) => {
          const m = /^([\d.]+) ([<>=]) ([\d.]+)$/.exec(t)!;
          const a = 천분(m[1]);
          const b = 천분(m[3]);
          return m[2] === '>' ? a > b : m[2] === '<' ? a < b : a === b;
        };
        expect(q.choices.filter(참), q.prompt).toEqual([q.answer]);
      }
      const same = /^([\d.]+)(과|와) 크기가 같은 수는/.exec(q.prompt);
      if (same) expect(q.choices.filter((c) => 천분(c) === 천분(same[1])), q.prompt).toEqual([q.answer]);
      const times = /^([\d.]+)의 (10배|100배|1\/10|1\/100)(은|는) 얼마/.exec(q.prompt);
      if (times) {
        const k = { '10배': 10, '100배': 100, '1/10': 0.1, '1/100': 0.01 }[times[2]]!;
        expect(천분(q.answer), q.prompt).toBe(Math.round(천분(times[1]) * k));
      }
      const digit = /^([\d.]+)에서 숫자 (\d)(이|가) 나타내는 수는/.exec(q.prompt);
      if (digit) {
        const s = digit[1].replace('.', '');
        const k = s.indexOf(digit[2]);
        expect(s.lastIndexOf(digit[2]), q.prompt).toBe(k);
        expect(천분(q.answer), q.prompt).toBe(Number(digit[2]) * 10 ** (3 - k));
      }
      const compose = /^(1이 \d+개(?:, 0\.0*1이 \d+개)*)인 수는/.exec(q.prompt);
      if (compose) {
        const v = compose[1].split(', ').reduce((s, part) => {
          const m = /^([\d.]+)이 (\d+)개$/.exec(part)!;
          return s + 천분(m[1]) * Number(m[2]);
        }, 0);
        expect(천분(q.answer), q.prompt).toBe(v);
      }
    }
    expect(count).toBeGreaterThan(200);
  });
});

describe('4-2 4단원 사각형', () => {
  type P = [number, number];
  const 변들 = (p: P[]) => p.map((a, k) => [a, p[(k + 1) % p.length]] as const);
  const 평행 = (e: readonly [P, P], f: readonly [P, P]) => Math.abs((e[1][0] - e[0][0]) * (f[1][1] - f[0][1]) - (e[1][1] - e[0][1]) * (f[1][0] - f[0][0])) < 1e-3;
  const 길이 = (e: readonly [P, P]) => Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]);
  const 직각 = (p: P[], i: number) => {
    const o = p[i];
    const a = p[(i + 1) % 4];
    const b = p[(i + 3) % 4];
    return Math.abs((a[0] - o[0]) * (b[0] - o[0]) + (a[1] - o[1]) * (b[1] - o[1])) < 1e-3;
  };
  const 성질 = (p: P[]) => {
    const e = 변들(p);
    const 쌍 = (평행(e[0], e[2]) ? 1 : 0) + (평행(e[1], e[3]) ? 1 : 0);
    const ls = e.map(길이);
    return {
      사다리꼴: 쌍 >= 1,
      평행사변형: 쌍 === 2,
      마름모: ls.every((l) => Math.abs(l - ls[0]) < 1e-3),
      직사각형: [0, 1, 2, 3].every((i) => 직각(p, i)),
      쌍,
      직각수: [0, 1, 2, 3].filter((i) => 직각(p, i)).length,
    };
  };
  it('고르는 문항에서 정의를 만족하는 도형은 답 하나뿐입니다', () => {
    let count = 0;
    for (const { q } of 단원(4)) {
      const m = /^(사다리꼴|평행사변형|마름모|직사각형)(은|는) 어느 것일까요/.exec(q.prompt);
      if (!m || q.visual?.kind !== 'figure-set') continue;
      const key = m[1] as '사다리꼴' | '평행사변형' | '마름모' | '직사각형';
      const 맞는 = q.visual.items.filter((it) => 성질(it.points as P[])[key]);
      expect(맞는.map((it) => it.name), q.prompt).toEqual([q.answer]);
      count += 1;
    }
    expect(count).toBeGreaterThan(50);
  });
  it('평행·수직 개수와 각·둘레 답이 맞습니다', () => {
    for (const { q } of 단원(4)) {
      if (q.visual?.kind === 'figure-set' && q.prompt.includes('서로 평행한 변은 모두 몇 쌍')) expect(수(q.answer), q.prompt).toBe(성질(q.visual.items[0].points as P[]).쌍);
      if (q.visual?.kind === 'figure-set' && q.prompt.includes('서로 수직으로 만나는 변은 모두 몇 쌍')) expect(수(q.answer), q.prompt).toBe(성질(q.visual.items[0].points as P[]).직각수);
      const near = /한 각의 크기가 (\d+)°입니다\. 이 각과 이웃한 각/.exec(q.prompt);
      if (near) expect(수(q.answer), q.prompt).toBe(180 - Number(near[1]));
      const opp = /한 각의 크기가 (\d+)°입니다\. 이 각과 마주 보는 각/.exec(q.prompt);
      if (opp) expect(수(q.answer), q.prompt).toBe(Number(opp[1]));
      const pg = /이웃한 두 변의 길이가 (\d+) cm, (\d+) cm일 때 네 변의 길이의 합/.exec(q.prompt);
      if (pg) expect(수(q.answer), q.prompt).toBe((Number(pg[1]) + Number(pg[2])) * 2);
    }
  });
});

describe('4-2 5단원 꺾은선그래프', () => {
  it('그래프에서 읽은 값으로 푼 답이 맞습니다', () => {
    let count = 0;
    for (const { q } of 단원(5)) {
      if (q.visual?.kind !== 'line-graph') continue;
      const v = q.visual;
      const from = v.from ?? 0;
      for (const p of v.points) expect((p.value - from) % v.step, q.prompt).toBe(0);
      // 키는 줄어들지 않고, 평균 키는 해마다 자랍니다. 무엇을 조사했는지 문제 글에 밝힙니다.
      if (v.valueLabel.startsWith('키')) for (let k = 1; k < v.points.length; k += 1) expect(v.points[k].value, q.prompt).toBeGreaterThan(v.points[k - 1].value);
      if (v.title?.includes('평균 키')) expect(v.points[0].value, q.prompt).toBeGreaterThanOrEqual(118);
      if (!/물결선|그래프로 나타내/.test(q.prompt) && /키|기온|방문자/.test(q.prompt)) expect(q.prompt.includes(v.title ?? ''), q.prompt).toBe(true);
      const 값 = (name: string) => v.points.find((p) => p.name === name)!.value;
      const read = /(?:^|\. )([^.\s]+)의 (기온|싹의 키|평균 키|방문자 수)(은|는) 몇/.exec(q.prompt);
      if (read) expect(수(q.answer), q.prompt).toBe(값(read[1]));
      const wave = /(\d학년) 때의 평균 키는/.exec(q.prompt);
      if (wave) expect(수(q.answer), q.prompt).toBe(값(wave[1]));
      const diff = /(?:^|\. )([^.\s]+)부터 (\S+)까지/.exec(q.prompt);
      if (diff) expect(수(q.answer), q.prompt).toBe(Math.abs(값(diff[2]) - 값(diff[1])));
      if (/변화가 가장 큰 때/.test(q.prompt)) {
        const ch = v.points.slice(1).map((p, k) => Math.abs(p.value - v.points[k].value));
        const big = Math.max(...ch);
        expect(ch.filter((c) => c === big).length, q.prompt).toBe(1);
        const k = ch.indexOf(big);
        expect(q.answer.startsWith(v.points[k].name) && q.answer.includes(` ${v.points[k + 1].name} 사이`), q.prompt).toBe(true);
      }
      const mid = /(?:^|\. )(\S+) 30분의 기온은/.exec(q.prompt);
      if (mid) {
        const k = v.points.findIndex((p) => p.name === mid[1]);
        expect(수(q.answer), q.prompt).toBe((v.points[k].value + v.points[k + 1].value) / 2);
      }
      count += 1;
    }
    expect(count).toBeGreaterThan(150);
  });
});

describe('4-2 6단원 다각형', () => {
  const 변수 = { 삼각형: 3, 사각형: 4, 오각형: 5, 육각형: 6, 칠각형: 7, 팔각형: 8 } as Record<string, number>;
  it('이름·둘레·대각선 수가 맞습니다', () => {
    for (const { q } of 단원(6)) {
      if (q.prompt === '그림의 다각형의 이름은 무엇일까요?' && q.visual?.kind === 'figure-set') expect(변수[q.answer], q.prompt).toBe(q.visual.items[0].points!.length);
      const per = /한 변이 (\d+) cm인 정(.각형)의 모든 변의 길이의 합/.exec(q.prompt);
      if (per) expect(수(q.answer), q.prompt).toBe(Number(per[1]) * 변수[per[2]]);
      const side = /합이 (\d+) cm인 정(.각형)의 한 변/.exec(q.prompt);
      if (side) expect(수(q.answer), q.prompt).toBe(Number(side[1]) / 변수[side[2]]);
      const diag = /^(.각형)에 그을 수 있는 대각선은/.exec(q.prompt);
      if (diag) {
        const n = 변수[diag[1]];
        expect(수(q.answer), q.prompt).toBe((n * (n - 3)) / 2);
      }
    }
  });
  it('대각선 성질 문항의 보기에 정사각형이 없습니다(포함 관계를 다루지 않음)', () => {
    for (const { q } of 단원(6)) {
      if (/대각선/.test(q.prompt)) expect(q.choices.join(' '), q.prompt).not.toMatch(/정사각형/);
    }
  });
});

describe('4-2 그림과 문항이 어긋나지 않습니다', () => {
  type P = [number, number];
  const 각도 = (p: P[], i: number) => {
    const n = p.length;
    const [o, a, b] = [p[i], p[(i + 1) % n], p[(i + n - 1) % n]];
    const v1 = [a[0] - o[0], a[1] - o[1]];
    const v2 = [b[0] - o[0], b[1] - o[1]];
    return (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]))) * 180) / Math.PI;
  };
  const 길이 = (p: P[], a: number, b: number) => Math.hypot(p[a][0] - p[b][0], p[a][1] - p[b][1]);
  it('적힌 각도와 그린 각, 적힌 길이의 비와 그린 변의 비가 같습니다', () => {
    let count = 0;
    for (const { q } of 모두) {
      if (q.visual?.kind !== 'figure-set') continue;
      for (const item of q.visual.items) {
        const p = (item.points ?? []) as P[];
        for (const label of item.angleLabels ?? []) {
          const want = label.text === '?' ? 수(q.answer) : 수(label.text);
          if (label.text === '?' && !/°$/.test(q.answer)) continue;
          expect(Math.abs(각도(p, label.at) - want), q.prompt).toBeLessThan(0.6);
          count += 1;
        }
        const 적힌 = (item.edgeLabels ?? []).filter((e) => /cm$/.test(e.text));
        for (let k = 1; k < 적힌.length; k += 1) {
          const [e0, e1] = [적힌[0], 적힌[k]];
          const 그린비 = 길이(p, e1.from, e1.to) / 길이(p, e0.from, e0.to);
          const 적힌비 = 수(e1.text) / 수(e0.text);
          expect(Math.abs(그린비 - 적힌비), q.prompt).toBeLessThan(0.01);
          count += 1;
        }
      }
    }
    expect(count).toBeGreaterThan(100);
  });
  it('평행선 그림에서 수직인 선분이 하나뿐이고 그 길이가 답입니다', () => {
    for (const { q } of 모두) {
      if (q.visual?.kind !== 'parallel-distance') continue;
      const 수직 = q.visual.segments.filter((s) => s.slant === 0);
      expect(수직.length, q.prompt).toBe(1);
      expect(수직[0].text, q.prompt).toBe(q.answer);
    }
  });
});
