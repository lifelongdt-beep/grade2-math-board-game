import { describe, expect, it } from 'vitest';
import { lessons41 } from '../curriculum41';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 4-1 문항을 생성기와 따로 처음부터 다시 풉니다. 그림이 있는 문항은
// 그림의 값(각도, 막대, 모눈 칸)으로 풀어 답이 하나뿐인지 봅니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Array<{ unitNo: number; lessonNo: number; level: Difficulty; q: Question }> = [];
for (const lesson of lessons41) {
  for (const level of levels) {
    for (const q of generateQuestions(lesson, level)) 모두.push({ unitNo: lesson.unitNo, lessonNo: lesson.lessonNo, level, q });
  }
}
const 단원 = (unitNo: number) => 모두.filter((x) => x.unitNo === unitNo);
const 수 = (text: string) => Number(text.replace(/[^\d]/g, ''));

/** '삼천사십오만 칠십이'를 수로 바꿉니다(생성기와 따로 짠 풀이). */
const 읽은수 = (text: string) => {
  const 숫자: Record<string, number> = { 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9 };
  const 작은 = (part: string) => {
    let total = 0;
    let digit = 0;
    for (const ch of part) {
      if (숫자[ch]) digit = 숫자[ch];
      else {
        const mul = ch === '천' ? 1000 : ch === '백' ? 100 : ch === '십' ? 10 : 0;
        total += (digit || 1) * mul;
        digit = 0;
      }
    }
    return total + digit;
  };
  let total = 0;
  let rest = text.replace(/\s/g, '');
  for (const [unit, value] of [['조', 1e12], ['억', 1e8], ['만', 1e4]] as const) {
    const at = rest.indexOf(unit);
    if (at >= 0) {
      total += (작은(rest.slice(0, at)) || 1) * value;
      rest = rest.slice(at + 1);
    }
  }
  return total + 작은(rest);
};

type Cell = [number, number];
const 정돈 = (cells: Cell[]) => {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells
    .map(([x, y]) => `${x - mx},${y - my}`)
    .sort()
    .join(';');
};
const 변환 = {
  그대로: (c: Cell[]) => c,
  좌우: (c: Cell[]) => c.map(([x, y]): Cell => [-x, y]),
  상하: (c: Cell[]) => c.map(([x, y]): Cell => [x, -y]),
  // 화면 좌표(아래로 y)에서 시계 방향 90°: 오른쪽(1,0)이 아래(0,1)로 갑니다.
  시계90: (c: Cell[]) => c.map(([x, y]): Cell => [-y, x]),
};
const 거듭 = (c: Cell[], n: number) => {
  let out = c;
  for (let k = 0; k < n; k += 1) out = 변환.시계90(out);
  return out;
};

describe('4-1 모든 문항', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons41) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(12);
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
      const text = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(text, q.prompt).not.toMatch(/을\(를\)|은\(는\)|이\(가\)|과\(와\)|\(으\)로|undefined|NaN/);
      expect(text, q.prompt).not.toMatch(/[013678](를|는|가|와)\s/);
      expect(text, q.prompt).not.toMatch(/[2459](을|은|이|과)\s/);
      expect(text, q.prompt).not.toMatch(/조은|억는|만는/);
      expect(text, q.prompt).not.toMatch(/[036]로\s|[1245789]으로\s/);
    }
  });

  it('4학년 1학기에 배우지 않은 소수·분수가 나오지 않습니다', () => {
    for (const { q } of 모두) {
      expect([q.prompt, ...q.choices].join(' '), q.prompt).not.toMatch(/\d\.\d|\d\/\d/);
    }
  });
});

describe('4-1 1단원 큰 수', () => {
  it('읽기·자릿값·쓰기 문항의 답이 맞고 하나뿐입니다', () => {
    let count = 0;
    for (const { q } of 단원(1)) {
      const read = /^(\d+)(을|를) 바르게 읽은 것은/.exec(q.prompt);
      if (read) {
        expect(q.choices.filter((c) => 읽은수(c) === Number(read[1])), q.prompt).toEqual([q.answer]);
        count += 1;
      }
      const place = /^(\d+)에서 숫자 (\d)(이|가) 나타내는 값은/.exec(q.prompt);
      if (place) {
        const n = place[1];
        const k = n.indexOf(place[2]);
        expect(n.lastIndexOf(place[2]), q.prompt).toBe(k);
        const 값 = Number(place[2]) * 10 ** (n.length - 1 - k);
        const 풀기 = (t: string) => {
          const m = /^(\d+)(만|억|조)?$/.exec(t)!;
          return Number(m[1]) * (m[2] === '조' ? 1e12 : m[2] === '억' ? 1e8 : m[2] === '만' ? 1e4 : 1);
        };
        expect(풀기(q.answer), q.prompt).toBe(값);
        count += 1;
      }
      const compose = /^(.+)인 수는 얼마일까요/.exec(q.prompt);
      if (compose && /개/.test(compose[1]) && /^\d+$/.test(q.answer)) {
        let total = 0;
        for (const part of compose[1].split(', ')) {
          const m = /^(\d+)(만)?이 (\d+)개$/.exec(part)!;
          total += Number(m[1]) * (m[2] ? 10000 : 1) * Number(m[3]);
        }
        expect(Number(q.answer), q.prompt).toBe(total);
        count += 1;
      }
      if (q.prompt.startsWith('두 수의 크기를 바르게')) {
        const 참 = (t: string) => {
          const m = /^(\d+) ([<>=]) (\d+)$/.exec(t)!;
          const a = Number(m[1]);
          const b = Number(m[3]);
          return m[2] === '>' ? a > b : m[2] === '<' ? a < b : a === b;
        };
        expect(q.choices.filter(참), q.prompt).toEqual([q.answer]);
      }
      const most = /^([\d, ]+) 가운데 가장 (큰|작은) 수는/.exec(q.prompt);
      if (most) {
        const nums = most[1].split(', ').map(Number);
        expect(Number(q.answer), q.prompt).toBe(most[2] === '큰' ? Math.max(...nums) : Math.min(...nums));
      }
    }
    expect(count).toBeGreaterThan(100);
  });

  it('뛰어 세기는 같은 간격으로 이어집니다', () => {
    const 단위수 = (t: string) => {
      let total = 0;
      for (const part of t.split(' ')) {
        const m = /^(\d+)(조|억|만)?$/.exec(part)!;
        total += Number(m[1]) * (m[2] === '조' ? 1e12 : m[2] === '억' ? 1e8 : m[2] === '만' ? 1e4 : 1);
      }
      return total;
    };
    for (const { q } of 단원(1)) {
      const m = /^(.+), □ 에서/.exec(q.prompt);
      if (!m) continue;
      const seq = m[1].split(', ').map(단위수);
      const d = seq[1] - seq[0];
      for (let k = 2; k < seq.length; k += 1) expect(seq[k] - seq[k - 1], q.prompt).toBe(d);
      expect(단위수(q.answer), q.prompt).toBe(seq[seq.length - 1] + d);
    }
  });
});

describe('4-1 2단원 각도', () => {
  it('각도 계산과 그림 문항의 답이 맞습니다', () => {
    for (const { q } of 단원(2)) {
      const sum = /^(\d+)°([+-])(\d+)°는/.exec(q.prompt);
      if (sum) expect(수(q.answer), q.prompt).toBe(sum[2] === '+' ? Number(sum[1]) + Number(sum[3]) : Number(sum[1]) - Number(sum[3]));
      const tri = /삼각형의 두 각의 크기가 (\d+)°, (\d+)°/.exec(q.prompt);
      if (tri) expect(수(q.answer), q.prompt).toBe(180 - Number(tri[1]) - Number(tri[2]));
      const quad = /사각형의 세 각의 크기가 (\d+)°, (\d+)°, (\d+)°/.exec(q.prompt);
      if (quad) expect(수(q.answer), q.prompt).toBe(360 - Number(quad[1]) - Number(quad[2]) - Number(quad[3]));
      const line = /한 각이 (\d+)°일 때 다른 각은/.exec(q.prompt);
      if (line) expect(수(q.answer), q.prompt).toBe(180 - Number(line[1]));
      const pick = /^다음 중 (예각|둔각)은/.exec(q.prompt);
      if (pick) {
        const ok = (d: number) => (pick[1] === '예각' ? d > 0 && d < 90 : d > 90 && d < 180);
        expect(q.choices.filter((c) => ok(수(c))), q.prompt).toEqual([q.answer]);
      }
      const clock = /^(\d+)시 정각일 때/.exec(q.prompt);
      if (clock) {
        const h = Number(clock[1]);
        const d = Math.min(h, 12 - h) * 30;
        expect(q.answer, q.prompt).toBe(/예각, 직각, 둔각/.test(q.prompt) ? (d < 90 ? '예각' : d === 90 ? '직각' : '둔각') : `${d}°`);
      }
      if (q.visual?.kind !== 'angle') continue;
      const degs = q.visual.items.map((it) => it.deg);
      if (q.prompt.startsWith('각의 크기가 가장')) {
        const want = q.prompt.includes('큰') ? Math.max(...degs) : Math.min(...degs);
        expect(degs.filter((d) => d === want).length, q.prompt).toBe(1);
        expect(q.visual.items[degs.indexOf(want)].name, q.prompt).toBe(q.answer);
      }
      if (q.prompt.startsWith('그림의 각은 예각')) {
        const d = degs[0];
        expect(q.answer, q.prompt).toBe(/예각, 직각, 둔각/.test(q.prompt) ? (d < 90 ? '예각' : d === 90 ? '직각' : '둔각') : `${d}°`);
      }
      if (q.prompt.startsWith('그림의 각도를 어림한')) {
        const d = degs[0];
        const gaps = q.choices.map((c) => Math.abs(수(c) - d));
        const best = Math.min(...gaps);
        expect(gaps.filter((g) => g === best).length, q.prompt).toBe(1);
        expect(q.choices[gaps.indexOf(best)], q.prompt).toBe(q.answer);
      }
    }
  });

  it('삼각형 차시에는 사각형 문항이, 사각형 차시에는 삼각형 문항이 섞이지 않습니다', () => {
    for (const { q, lessonNo } of 단원(2)) {
      if (lessonNo === 7) expect(q.prompt, q.prompt).not.toMatch(/사각형/);
      if (lessonNo === 8) expect(q.prompt, q.prompt).not.toMatch(/^삼각형/);
    }
  });
});

describe('4-1 3단원 곱셈과 나눗셈', () => {
  const 몫나머지 = (text: string) => {
    const m = /^(\d+)(?: … (\d+))?$/.exec(text.trim())!;
    return { q: Number(m[1]), r: Number(m[2] ?? 0) };
  };
  it('곱셈과 나눗셈의 답이 맞고 나머지는 나누는 수보다 작습니다', () => {
    let count = 0;
    for (const { q, lessonNo } of 단원(3)) {
      const mul = /^(\d+)×(\d+)(은|는) 얼마/.exec(q.prompt);
      if (mul) {
        expect(Number(q.answer), q.prompt).toBe(Number(mul[1]) * Number(mul[2]));
        count += 1;
      }
      const div = /^(\d+)÷(\d+)의 몫과 나머지를/.exec(q.prompt);
      if (div) {
        const a = Number(div[1]);
        const d = Number(div[2]);
        const got = 몫나머지(q.answer);
        expect(got.q * d + got.r, q.prompt).toBe(a);
        expect(got.r < d, q.prompt).toBe(true);
        // 보기 가운데 바른 몫·나머지는 답 하나뿐입니다.
        const 바른 = q.choices.filter((c) => {
          const x = 몫나머지(c);
          return x.q * d + x.r === a && x.r < d;
        });
        expect(바른, q.prompt).toEqual([q.answer]);
        if (lessonNo === 5) expect(a < 100 && d >= 10, q.prompt).toBe(true);
        if (lessonNo === 6) expect(a >= 100 && got.q < 10, q.prompt).toBe(true);
        if (lessonNo === 7 || lessonNo === 8) expect(a >= 100 && got.q >= 10 && d >= 10, q.prompt).toBe(true);
        if (lessonNo === 7 || lessonNo === 8) {
          const 받아올림 = [Math.floor(d / 10), d % 10].some((x) => [Math.floor(got.q / 10), got.q % 10].some((y) => x * y >= 10));
          expect(받아올림, q.prompt).toBe(lessonNo === 8);
        }
        count += 1;
      }
      const digits = /^(\d+)÷(\d+)의 몫은 몇 자리 수/.exec(q.prompt);
      if (digits) expect(q.answer, q.prompt).toBe(Math.floor(Number(digits[1]) / Number(digits[2])) >= 10 ? '두 자리 수' : '한 자리 수');
      const check = /^(\d+)÷(\d+)=(\d+) … (\d+)을\(를\)|^(\d+)÷(\d+)=(\d+) … (\d+)(을|를) 바르게 계산했는지/.exec(q.prompt);
      if (check) {
        const [a, d, qq, r] = (check[1] ? check.slice(1, 5) : check.slice(5, 9)).map(Number);
        expect(q.answer, q.prompt).toBe(`${d}×${qq}+${r}=${a}`);
        expect(d * qq + r, q.prompt).toBe(a);
      }
      const est = /^(\d+)×(\d+)(을|를) 어림셈으로/.exec(q.prompt);
      if (est) {
        const A = Math.round(Number(est[1]) / 100) * 100;
        const B = Math.round(Number(est[2]) / 10) * 10;
        expect(q.answer, q.prompt).toBe(`약 ${A}×${B}=${A * B}`);
      }
      const destim = /^(\d+)÷(\d+)의 몫을 어림셈으로/.exec(q.prompt);
      if (destim) {
        const A = Math.round(Number(destim[1]) / 100) * 100;
        const B = Math.round(Number(destim[2]) / 10) * 10;
        expect(q.answer, q.prompt).toBe(`약 ${A / B}`);
      }
    }
    expect(count).toBeGreaterThan(200);
  });
});

describe('4-1 4단원 평면도형의 이동', () => {
  it('밀기·뒤집기·돌리기 그림에서 답인 도형 하나만 맞습니다', () => {
    let count = 0;
    for (const { q } of 단원(4)) {
      if (q.visual?.kind !== 'grid-move' || !q.prompt.startsWith('처음 도형을')) continue;
      const [처음, ...보기] = q.visual.panels;
      const c = 처음.cells!;
      let want: Cell[];
      if (q.prompt.includes('밀었을')) want = c;
      else if (q.prompt.includes('뒤집었을')) want = /왼쪽|오른쪽/.test(q.prompt) ? 변환.좌우(c) : 변환.상하(c);
      else {
        const m = /(시계 반대 방향|시계 방향)으로 (\d+)°만큼 돌렸을/.exec(q.prompt)!;
        const n = Number(m[2]) / 90;
        want = 거듭(c, m[1] === '시계 방향' ? n : (4 - n) % 4);
      }
      const 맞는 = 보기.filter((p) => 정돈(p.cells!) === 정돈(want));
      expect(맞는.length, q.prompt).toBe(1);
      expect(맞는[0].name, q.prompt).toBe(q.answer);
      // 색칠한 첫 칸도 따라 옮겨졌는지 봅니다.
      const 첫 = (cells: Cell[]) => {
        const mx = Math.min(...cells.map((x) => x[0]));
        const my = Math.min(...cells.map((x) => x[1]));
        return `${cells[0][0] - mx},${cells[0][1] - my}`;
      };
      expect(첫(맞는[0].cells!), q.prompt).toBe(첫(want));
      count += 1;
    }
    expect(count).toBeGreaterThan(100);
  });

  it('점의 이동은 그림의 두 점과 맞습니다', () => {
    for (const { q } of 단원(4)) {
      if (q.visual?.kind !== 'grid-move' || !q.prompt.startsWith('점 ㄱ을')) continue;
      const { point, target } = q.visual.panels[0];
      let x = point![0];
      let y = point![1];
      for (const part of q.answer.split(', ')) {
        const m = /^(위쪽|아래쪽|왼쪽|오른쪽)으로 (\d+)칸$/.exec(part)!;
        const n = Number(m[2]);
        if (m[1] === '오른쪽') x += n;
        if (m[1] === '왼쪽') x -= n;
        if (m[1] === '아래쪽') y += n;
        if (m[1] === '위쪽') y -= n;
      }
      expect([x, y], q.prompt).toEqual(target);
    }
  });
});

describe('4-1 5단원 막대그래프', () => {
  it('그래프에서 읽은 값으로 푼 답이 맞습니다', () => {
    let count = 0;
    for (const { q } of 단원(5)) {
      if (q.visual?.kind !== 'bar-graph') continue;
      const v = q.visual;
      for (const b of v.bars) {
        expect(b.value % v.step, q.prompt).toBe(0);
        expect(b.value <= v.max, q.prompt).toBe(true);
      }
      const 값 = (name: string) => v.bars.find((b) => b.name === name)!.value;
      const read = /^(.+)의 막대가 나타내는 수는/.exec(q.prompt);
      if (read) expect(수(q.answer), q.prompt).toBe(값(read[1]));
      const diff = /^(.+)(은|는) (.+)보다 몇 .+ 더 많을까요/.exec(q.prompt);
      if (diff) expect(수(q.answer), q.prompt).toBe(값(diff[1]) - 값(diff[3]));
      if (/가장 (많은|적은)/.test(q.prompt)) {
        const vals = v.bars.map((b) => b.value);
        const want = q.prompt.includes('많은') ? Math.max(...vals) : Math.min(...vals);
        expect(vals.filter((x) => x === want).length, q.prompt).toBe(1);
        expect(값(q.answer), q.prompt).toBe(want);
      }
      const total = /모두 (\d+).+\. (.+)의 막대\(\?\)/.exec(q.prompt);
      if (total) {
        const hidden = v.bars.filter((b) => b.hidden);
        expect(hidden.map((b) => b.name), q.prompt).toEqual([total[2]]);
        const rest = v.bars.filter((b) => !b.hidden).reduce((s, b) => s + b.value, 0);
        expect(수(q.answer), q.prompt).toBe(Number(total[1]) - rest);
      }
      if (q.prompt.startsWith('막대그래프에서 세로 눈금 한 칸은')) expect(수(q.answer), q.prompt).toBe(v.step);
      if (q.prompt.startsWith('많은 것부터 차례로')) {
        expect(q.answer, q.prompt).toBe([...v.bars].sort((a, b) => b.value - a.value).map((b) => b.name).join(', '));
      }
      count += 1;
    }
    expect(count).toBeGreaterThan(200);
  });
});

describe('4-1 6단원 규칙 찾기', () => {
  const 계산 = (식: string) => 식.split('+').reduce((s, part) => s + part.split('×').reduce((m, x) => m * Number(x), 1), 0);
  it('□ 안의 수와 등호 식이 맞습니다', () => {
    for (const { q } of 단원(6)) {
      const eq = /^(\d+)([+\-×])(\d+)=(\d+)([+\-×])□에서/.exec(q.prompt);
      if (eq) {
        const 값 = (a: number, op: string, b: number) => (op === '+' ? a + b : op === '-' ? a - b : a * b);
        expect(값(Number(eq[4]), eq[5], 수(q.answer)), q.prompt).toBe(값(Number(eq[1]), eq[2], Number(eq[3])));
        for (const n of [eq[1], eq[3], eq[4], q.answer]) expect(Number(n) < 100, q.prompt).toBe(true);
      }
      if (q.prompt === '옳은 식은 어느 것일까요?') {
        const 참 = (t: string) => {
          const [l, r] = t.split('=');
          const v = (s: string) => {
            const m = /^(\d+)([+\-×])(\d+)$/.exec(s)!;
            const a = Number(m[1]);
            const b = Number(m[3]);
            return m[2] === '+' ? a + b : m[2] === '-' ? a - b : a * b;
          };
          return v(l) === v(r);
        };
        expect(q.choices.filter(참), q.prompt).toEqual([q.answer]);
      }
      const seq = /^([\d, □]+)에서 □ 안에 알맞은 수는/.exec(q.prompt);
      if (seq) {
        const xs = seq[1].split(', ');
        const k = xs.indexOf('□');
        const nums = xs.map((x) => (x === '□' ? NaN : Number(x)));
        const 이웃 = nums.slice(1).map((x, i) => [nums[i], x] as const).filter(([p, x]) => !Number.isNaN(p) && !Number.isNaN(x));
        const 같은차 = new Set(이웃.map(([p, x]) => x - p)).size === 1;
        const [p0, x0] = 이웃[0];
        const 앞 = k > 0 ? nums[k - 1] : NaN;
        const want = 같은차 ? (Number.isNaN(앞) ? nums[k + 1] - (x0 - p0) : 앞 + (x0 - p0)) : 앞 * (x0 / p0);
        expect(Number(q.answer), q.prompt).toBe(want);
      }
      const next = /^(.+) 다음에 올 계산식은/.exec(q.prompt);
      if (next) {
        const m = /^(\d+)([+\-×])(\d+)=(\d+)$/.exec(q.answer)!;
        const a = Number(m[1]);
        const b = Number(m[3]);
        expect(m[2] === '+' ? a + b : m[2] === '-' ? a - b : a * b, q.prompt).toBe(Number(m[4]));
        const 식들 = next[1].split(', ');
        expect(식들.includes(q.answer), q.prompt).toBe(false);
      }
      const guess = /규칙을 이용하면 ([\d+×]+)(은|는) 얼마일까요/.exec(q.prompt);
      if (guess) expect(Number(q.answer), q.prompt).toBe(계산(guess[1]));
    }
  });

  it('모양의 배열 문항은 그림의 칸 수와 맞습니다', () => {
    const 째 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째'];
    for (const { q } of 단원(6)) {
      if (q.visual?.kind !== 'grid-move') continue;
      const counts = q.visual.panels.map((p) => p.cells!.length);
      // 4개의 값에서 계차가 일정한(1차 또는 2차) 수열로 늘려 갑니다.
      const 늘이기 = (n: number) => {
        const xs = [...counts];
        while (xs.length < n) {
          const d1 = xs[xs.length - 1] - xs[xs.length - 2];
          const d2 = d1 - (xs[xs.length - 2] - xs[xs.length - 3]);
          xs.push(xs[xs.length - 1] + d1 + d2);
        }
        return xs[n - 1];
      };
      const one = /(.+째)에 올 모양의 사각형은 몇 개/.exec(q.prompt);
      if (one) expect(수(q.answer), q.prompt).toBe(늘이기(째.indexOf(one[1].split(' ').pop()!) + 1));
      const more = /(.+째) 모양은 (.+째) 모양보다 사각형이 몇 개 더 많을까요/.exec(q.prompt);
      if (more) {
        const a = 째.indexOf(more[1].split(' ').pop()!) + 1;
        expect(수(q.answer), q.prompt).toBe(늘이기(a) - 늘이기(a - 1));
      }
      const expr = /같은 규칙으로 (.+째)를 나타낸 식은/.exec(q.prompt);
      if (expr) {
        const n = 째.indexOf(expr[1]) + 1;
        expect(계산(q.answer), q.prompt).toBe(늘이기(n));
        expect(q.choices.filter((c) => 계산(c) === 늘이기(n)), q.prompt).toEqual([q.answer]);
      }
    }
  });
});

describe('4-1 그림과 문항이 어긋나지 않습니다', () => {
  const 각도 = (p: Array<[number, number]>, i: number) => {
    const n = p.length;
    const [o, a, b] = [p[i], p[(i + 1) % n], p[(i + n - 1) % n]];
    const v1 = [a[0] - o[0], a[1] - o[1]];
    const v2 = [b[0] - o[0], b[1] - o[1]];
    return (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]))) * 180) / Math.PI;
  };
  it('각도기·시계·직선·도형 그림의 값이 문제와 같습니다', () => {
    let count = 0;
    for (const { q } of 모두) {
      const v = q.visual;
      if (v?.kind === 'protractor') {
        expect(수(q.answer), q.prompt).toBe(v.deg);
        count += 1;
      }
      if (v?.kind === 'clock') {
        const m = /^(\d+)시 정각/.exec(q.prompt)!;
        expect(v.hour, q.prompt).toBe(Number(m[1]));
        expect(v.minute, q.prompt).toBe(0);
      }
      if (v?.kind === 'angle-split') {
        expect(q.prompt, q.prompt).toContain(`한 각이 ${v.known}°`);
        expect(수(q.answer), q.prompt).toBe(180 - v.known);
      }
      if (v?.kind === 'figure-set') {
        for (const item of v.items) {
          for (const label of item.angleLabels ?? []) {
            if (label.text === '?') expect(Math.abs(각도(item.points as Array<[number, number]>, label.at) - 수(q.answer)), q.prompt).toBeLessThan(0.6);
            else expect(Math.abs(각도(item.points as Array<[number, number]>, label.at) - 수(label.text)), q.prompt).toBeLessThan(0.6);
            count += 1;
          }
        }
      }
      if (v?.kind === 'number-array') {
        // 표의 이웃한 칸끼리 일정하게 커지고, ?를 채우면 그 규칙이 맞습니다.
        const filled = v.rows.map((row) => row.map((x) => (x === null ? 수(q.answer) : x)));
        const 가로 = filled[0][1] - filled[0][0];
        const 세로 = filled[1][0] - filled[0][0];
        filled.forEach((row, r) => row.forEach((x, c) => expect(x, q.prompt).toBe(filled[0][0] + r * 세로 + c * 가로)));
        expect(v.rows.flat().filter((x) => x === null).length, q.prompt).toBe(1);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(100);
  });
});
