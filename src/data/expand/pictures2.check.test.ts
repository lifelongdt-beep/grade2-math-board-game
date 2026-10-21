import { describe, expect, it } from 'vitest';
import type { QuestionVisual } from '../../types';
import type { G5Family, G5Spec } from '../grade5/build';
import { 각그림, 각합그림, 꺾은선그림, 나누기그림, 백분율그림, 상자그림, 세수그림, 수배열그림, 원그림둘, 평행사변형그림 } from './pictures2';

// ════════════════════════════════════════════════════════════════════
// 그림이 바뀌는 문항 둘째 묶음(pictures2.ts)을 그림만 보고 다시 풉니다.
// ────────────────────────────────────────────────────────────────────
// 각은 그림의 좌표로 다시 재고, 칠한 칸은 다시 세고, 그래프는 점의 값을
// 읽고, 상자·원·도형은 그림에 적힌 길이를 읽어 셈합니다. 문제 글에서는
// 무엇을 묻는지만 읽습니다.
// ════════════════════════════════════════════════════════════════════

const 뭉치들: G5Family[] = [
  각그림('직각'), 각그림('예둔'), 각그림('어림'), 각합그림(false), 각합그림(true), 꺾은선그림(), 나누기그림(), 백분율그림(), 상자그림('겉넓이'), 상자그림('부피'), 상자그림('m³'),
  세수그림(), 수배열그림(true), 수배열그림(false), 원그림둘('원주'), 원그림둘('넓이'), 평행사변형그림(),
];

type 점 = [number, number];
const 각재기 = ([a, o, b]: 점[]) => {
  const u = [a[0] - o[0], a[1] - o[1]]; const v = [b[0] - o[0], b[1] - o[1]];
  return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180) / Math.PI;
};
const 반 = (x: number) => Math.round(x * 1000) / 1000;
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 길이 = (t: string) => { const m = /([\d.]+)\s?(cm|m)/.exec(t)!; return m[2] === 'cm' ? +m[1] / 100 : +m[1]; };
// 앞말의 끝 글자에 받침이 있으면 '과', 없으면 '와'입니다(10시와, 3일과).
const 받침 = (t: string) => { const c = t.charCodeAt(t.length - 1); return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 !== 0 : /[013678]$/.test(t); };
const 사이글 = (a: string, b: string) => `${a}${받침(a) ? '과' : '와'} ${b} 사이`;

const 풀기 = (s: G5Spec): string | number | undefined => {
  const p = s.prompt;
  const v = s.visual as QuestionVisual;
  let m: RegExpExecArray | null;
  if (v.kind === 'line-figure') {
    const 각들 = v.items.map((it) => 각재기(it.points as 점[]));
    const 종류 = 각들.map((d) => (Math.abs(d - 90) < 1 ? '직각' : d < 90 ? '예각' : '둔각'));
    if (/더 큰 각/.test(p)) return 각들[0] > 각들[1] ? '가' : '나';
    if (/어림한 것으로/.test(p)) return `약 ${Math.round(각들[0] / 10) * 10}°`;
    if ((m = /가운데 (직각|예각|둔각)(?:인 것)?은 어느 것/.exec(p))) { const 찾은 = 종류.flatMap((x, j) => (x === m![1] ? [v.items[j].name] : [])); return 찾은.length === 1 ? 찾은[0] : 'X'; }
    if ((m = /가운데 (직각|예각|둔각)은 모두 몇 개/.exec(p))) return 종류.filter((x) => x === m![1]).length;
  }
  if (v.kind === 'figure-set' && /삼각형|사각형/.test(v.label) && v.items[0].angleLabels) {
    const it = v.items[0];
    const 합 = it.points!.length === 3 ? 180 : 360;
    const 아는 = it.angleLabels!.filter((x) => x.text !== '?').map((x) => 수(x.text));
    const 모름 = 합 - 아는.reduce((x, y) => x + y, 0);
    // 그림의 각도가 적힌 각도와 맞는지(사각형은 반올림 탓에 2°까지)
    const 점들 = it.points as 점[];
    it.angleLabels!.forEach((x) => { if (x.text === '?') return; const k = x.at; const n = 점들.length; expect(Math.abs(각재기([점들[(k + n - 1) % n], 점들[k], 점들[(k + 1) % n]]) - 수(x.text)), p).toBeLessThan(n === 3 ? 0.5 : 2.5); });
    return /한 직선을 이루는 각/.test(p) ? 180 - 모름 : 모름;
  }
  if (v.kind === 'figure-set' && v.label.includes('평행사변형')) {
    const 넓이 = (it: (typeof v.items)[number]) => 수(it.edgeLabels!.find((e) => e.from === 3 && e.to === 2)!.text) * 수(it.heightMark!.text);
    if (/두 평행사변형/.test(p)) { const [a, b] = v.items.map(넓이); return a === b ? '두 넓이가 같습니다' : a > b ? '가' : '나'; }
    const it = v.items[0];
    const 밑변 = it.edgeLabels!.find((e) => e.from === 3 && e.to === 2)!.text; const 높이 = it.heightMark!.text;
    if ((m = /넓이가 (\d+) cm²일 때 높이/.exec(p))) return +m[1] / 수(밑변);
    if ((m = /넓이가 (\d+) cm²일 때 밑변/.exec(p))) return +m[1] / 수(높이);
    return 수(밑변) * 수(높이);
  }
  if (v.kind === 'partition') {
    if (/똑같이 나누어/.test(p)) {
      const 같다 = v.figures.map((f) => !f.cuts);
      const 찾은 = v.figures.filter((_, j) => (/나누어지지 않은/.test(p) ? !같다[j] : 같다[j]));
      return 찾은.length === 1 ? 찾은[0].name! : 'X';
    }
    const 비율 = v.figures.map((f) => (f.shaded.length * 100) / (f.rows! * f.columns!));
    if (/비율이 더 높은/.test(p)) return 비율[0] === 비율[1] ? '두 비율이 같습니다' : 비율[0] > 비율[1] ? '가' : '나';
    return `${반(/색칠하지 않은/.test(p) ? 100 - 비율[0] : 비율[0])}%`;
  }
  if (v.kind === 'box-drawing') {
    const e = v.edgeLabels!;
    if (/몇 m³/.test(p)) return 반(길이(e.width!) * 길이(e.depth!) * 길이(e.height!));
    const [w, d, h] = [수(e.width!), 수(e.depth!), 수(e.height ?? '')];
    if ((m = /부피는 (\d+) cm³입니다\. 높이/.exec(p))) return +m[1] / (w * d);
    if (/겉넓이/.test(p)) return 2 * (w * d + d * h + w * h);
    // 그림의 비율이 적힌 길이와 같은지
    expect([v.width, v.depth, v.height]).toEqual([w, d, h]);
    return w * d * h;
  }
  if (v.kind === 'circles') {
    const π = +/원주율: ([\d.]+)/.exec(p)![1];
    if (v.circles.length === 2) { const [R, r] = v.circles.map((c) => c.r); return 반((R * R - r * r) * π); }
    const 선 = v.segments![0]; const 글길이 = 수(선.name!); const 그린길이 = Math.hypot(선.to[0] - 선.from[0], 선.to[1] - 선.from[1]);
    const 반지름 = 그린길이 > v.circles[0].r + 1e-9 ? 글길이 / 2 : 글길이;
    expect(Math.abs(그린길이 - (그린길이 > v.circles[0].r + 1e-9 ? 2 : 1) * v.circles[0].r)).toBeLessThan(1e-9);
    expect(반지름).toBe(v.circles[0].r);
    return /원주는/.test(p) ? 반(2 * 반지름 * π) : 반(반지름 * 반지름 * π);
  }
  if (v.kind === 'line-graph') {
    const 값 = v.points.map((x) => x.value); const 이름 = v.points.map((x) => x.name);
    if ((m = /그래프에서 (\S+)의 .+[은는] 얼마/.exec(p))) return 값[이름.indexOf(m[1])];
    if ((m = /그래프에서 (\S+)[과와] (\S+)의 .+의 차/.exec(p))) return Math.abs(값[이름.indexOf(m[1])] - 값[이름.indexOf(m[2])]);
    const 차 = 값.slice(1).map((x, j) => x - 값[j]);
    const j = /가장 많이 늘어난/.test(p) ? 차.indexOf(Math.max(...차)) : 차.findIndex((x) => x < 0);
    return 사이글(이름[j], 이름[j + 1]);
  }
  if (v.kind === 'counters') {
    const [a, b, c] = v.groups.map((g) => g.count);
    return /덧셈식/.test(p) ? `${a}+${b}+${c}=${a + b + c}` : a + b + c;
  }
  if (v.kind === 'number-array') {
    const r = v.rows;
    const 아는칸 = (i: number) => r[i].findIndex((x) => x !== null);
    // 가로·세로 규칙을 그림에서 찾습니다.
    const i0 = r.findIndex((row) => row.filter((x) => x !== null).length >= 2);
    const 칸들 = r[i0].map((x, j) => [x, j] as const).filter(([x]) => x !== null);
    const 가로 = (칸들[1][0]! - 칸들[0][0]!) / (칸들[1][1] - 칸들[0][1]);
    const j0 = [0, 1].find((j) => r[0][j] !== null && r[1][j] !== null)!;
    const 세로 = r[1][j0]! - r[0][j0]!;
    void 아는칸;
    if (/\?에 알맞은 수/.test(p)) {
      const qi = r.findIndex((row) => row.includes(null)); const qj = r[qi].indexOf(null);
      const ki = qi === 0 ? 1 : 0;
      return r[ki][qj]! + (qi - ki) * 세로;
    }
    if (/아래로 한 칸/.test(p)) return 세로;
    if (/↘/.test(p)) return 가로 + 세로;
  }
  return undefined;
};

describe('그림이 바뀌는 문항 둘째 묶음', () => {
  for (const f of 뭉치들) {
    it(`${f.id}: 그림만 보고 다시 푼 답이 맞고, 그림과 글이 넉넉히 다릅니다`, () => {
      const 다른 = new Set<string>();
      const 결들 = new Set<number>();
      for (let seed = 1; seed <= 500; seed += 1) {
        const s = f.make(seed * 7919 + 13);
        if (!s) continue;
        expect(s.visual, s.prompt).toBeTruthy();
        다른.add(s.prompt + JSON.stringify(s.visual));
        결들.add(s.결 ?? -1);
        expect(new Set([s.answer, ...s.wrongs]).size, s.prompt).toBe(4);
        expect(/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로|undefined|NaN/.test([s.prompt, s.answer, ...s.wrongs, ...s.steps, s.hint].join(' ')), `${s.prompt} / ${s.steps.join(' / ')}`).toBe(false);
        const 답 = 풀기(s);
        expect(답, `풀 수 없는 문항: ${s.prompt}`).not.toBeUndefined();
        if (typeof 답 === 'number') {
          expect(수(s.answer), s.prompt).toBeCloseTo(답, 6);
          for (const w of s.wrongs) if (/^[\d.]+\s?[^\d\s]*$/.test(w.trim())) expect(Math.abs(수(w) - 답) > 1e-9, `${s.prompt} 오답 ${w}`).toBe(true);
        } else expect(s.answer, s.prompt).toBe(답);
        // 그림의 좌표가 그리는 칸 밖으로 나가지 않습니다.
        if (s.visual!.kind === 'line-figure') for (const it of s.visual!.items) for (const [x, y] of it.points) expect(Math.max(Math.abs(x), Math.abs(y))).toBeLessThanOrEqual(1);
      }
      expect(다른.size, f.id).toBeGreaterThan(60);
      expect(결들.has(-1)).toBe(false);
      expect(결들.size, `${f.id} 결`).toBeGreaterThanOrEqual(2);
    });
  }
});
