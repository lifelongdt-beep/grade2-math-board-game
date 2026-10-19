import { describe, expect, it } from 'vitest';
import type { Difficulty, GridPoint, GridSegment, Lesson, Manipulation, Question } from '../../types';
import { lessons11 } from '../curriculum11';
import { lessons12 } from '../curriculum12';
import { lessons as lessons2 } from '../curriculum';
import { lessons31 } from '../curriculum31';
import { lessons32 } from '../curriculum32';
import { lessons41 } from '../curriculum41';
import { lessons42 } from '../curriculum42';
import { lessons51 } from '../curriculum51';
import { lessons5 } from '../curriculum5';
import { lessons61 } from '../curriculum61';
import { curriculum62 } from '../curriculum62';
import { 조작문항들, 조작섞기, 조작표 } from './index';
import { 채점, 처음상태, 정답모습, 도형살피기, 닫힌도형, 합동인가 } from './check';
import type { ManipState } from './check';
import { generateQuestions } from '../questionFactory';

// ════════════════════════════════════════════════════════════════════
// 손 조작 문항을 글만 보고 다시 풀어 채점과 견줍니다.
// ────────────────────────────────────────────────────────────────────
// 만드는 쪽(families)의 계산을 쓰지 않습니다. 문제 글에서 수를 읽어
// 바른 조작을 따로 만들고, 그것이 채점에서 맞다고 나오는지, 조금
// 어긋난 조작은 틀리다고 나오는지 봅니다.
// ════════════════════════════════════════════════════════════════════

const 모든차시: Lesson[] = [...lessons11, ...lessons12, ...lessons2, ...lessons31, ...lessons32, ...lessons41, ...lessons42, ...lessons51, ...lessons5, ...lessons61, ...curriculum62.flatMap((u) => u.lessons)];
const 수준들: Difficulty[] = ['하', '중', '상'];
const 모두: Question[] = [];
for (const l of 모든차시) for (const lv of 수준들) 모두.push(...조작문항들(l, lv, 12));
const n = (t: string) => Number(t);
const 숫자들 = (t: string) => (t.match(/\d+/g) ?? []).map(Number);

const 시각풀기 = (p: string): [number, number] | null => {
  let m = /지금은 (\d+)시입니다\. 긴바늘이 한 바퀴/.exec(p);
  if (m) return [n(m[1]) + 1, 0];
  m = /지금은 (\d+)시입니다\. 30분이 지난/.exec(p);
  if (m) return [n(m[1]), 30];
  m = /^(\d+)시 (\d+)분 전을/.exec(p);
  if (m) return [n(m[1]) - 1, 60 - n(m[2])];
  m = /^(\d+)시(?: (\d+)분)?(?:에 시작하여|에서) (?:(\d+)시간)? ?(?:(\d+)분)?(?: 동안|이 지난|가 지난)/.exec(p);
  if (m) {
    const t = n(m[1]) * 60 + n(m[2] ?? '0') + n(m[3] ?? '0') * 60 + n(m[4] ?? '0');
    return [Math.floor(t / 60), t % 60];
  }
  m = /^(\d+)시 (\d+)분을/.exec(p);
  if (m) return [n(m[1]), n(m[2])];
  m = /^(\d+)시를/.exec(p);
  if (m) return [n(m[1]), 0];
  return null;
};

const 방향읽기 = (t: string): GridPoint => {
  let dx = 0;
  let dy = 0;
  for (const m of t.matchAll(/(오른쪽|왼쪽|위쪽|아래쪽)으로 (\d+)칸/g)) {
    const k = n(m[2]);
    if (m[1] === '오른쪽') dx += k;
    if (m[1] === '왼쪽') dx -= k;
    if (m[1] === '아래쪽') dy += k;
    if (m[1] === '위쪽') dy -= k;
  }
  return [dx, dy];
};
const 이름점 = (mk: { at: GridPoint; name: string }[], name: string) => mk.find((x) => x.name === name)!.at;

/** 테스트 쪽에서 따로 만든 바른 조작 */
const 바른조작 = (q: Question): ManipState => {
  const m = q.manipulate!;
  const p = q.prompt;
  switch (m.kind) {
    case 'ruler-measure': {
      // 답 글의 길이와 그림의 길이가 같아야 합니다.
      const [a, b] = 숫자들(q.answer);
      const mm = /cm \d+ mm/.test(q.answer) ? a * 10 + b : /mm/.test(q.answer) ? a : a * 10;
      expect(mm, p).toBe(m.objectMm);
      return { kind: m.kind, rulerAt: m.objectStartMm, endTick: mm };
    }
    case 'ruler-draw': {
      const 바퀴 = /지름이 (\d+) cm인 바퀴가 한 바퀴 .+\(원주율: ([\d.]+)\)/.exec(p);
      if (바퀴) { expect(m.fromMm).toBe(0); return { kind: m.kind, end: Math.round(n(바퀴[1]) * Number(바퀴[2]) * 10) }; }
      let r = /반지름이 (\d+) cm/.exec(p);
      if (r) { expect(m.fromMm).toBe(0); return { kind: m.kind, end: n(r[1]) * 10 }; }
      r = /지름이 (\d+) cm/.exec(p);
      if (r) { expect(m.fromMm).toBe(0); return { kind: m.kind, end: (n(r[1]) / 2) * 10 }; }
      r = /길이가 (\d+) cm인 색 테이프의 (\d+)\/(\d+)만큼/.exec(p);
      if (r) { expect(m.fromMm).toBe(0); return { kind: m.kind, end: (n(r[1]) * n(r[2]) / n(r[3])) * 10 }; }
      const s = /자의 (\d+)(?: cm)? 눈금에서 시작하여 길이가 (\d+) cm/.exec(p)!;
      expect(s, p).not.toBeNull();
      expect(m.fromMm, p).toBe(n(s[1]) * 10);
      return { kind: m.kind, end: (n(s[1]) + n(s[2])) * 10 };
    }
    case 'clock': {
      const t = 시각풀기(p);
      expect(t, p).not.toBeNull();
      const [h, mm] = t!;
      expect([m.h, m.m], p).toEqual([h, mm]);
      return { kind: m.kind, hourDeg: (h % 12) * 30 + mm / 2, minuteDeg: mm * 6 };
    }
    case 'grid-point': {
      if (/^점 ㄱ을 .+ 이동한 자리/.test(p)) {
        const [dx, dy] = 방향읽기(p);
        const a = 이름점(m.marks, 'ㄱ');
        return { kind: m.kind, pt: [a[0] + dx, a[1] + dy] };
      }
      if (/^어떤 점을 .+ 이동했더니 점 ㄴ/.test(p)) {
        const [dx, dy] = 방향읽기(p);
        const b = 이름점(m.marks, 'ㄴ');
        return { kind: m.kind, pt: [b[0] - dx, b[1] - dy] };
      }
      const 대응 = /점 (\S)의 대응점/.exec(p);
      if (대응 && m.axis && 'x' in m.axis) {
        const a = 이름점(m.marks, 대응[1]);
        return { kind: m.kind, pt: [2 * m.axis.x - a[0], a[1]] };
      }
      if (대응 && m.center) {
        const a = 이름점(m.marks, 대응[1]);
        return { kind: m.kind, pt: [2 * m.center[0] - a[0], 2 * m.center[1] - a[1]] };
      }
      if (/꼭짓점 ㄹ이 될 점/.test(p)) {
        const [a, b, c] = ['ㄱ', 'ㄴ', 'ㄷ'].map((x) => 이름점(m.marks, x));
        return { kind: m.kind, pt: [a[0] + c[0] - b[0], a[1] + c[1] - b[1]] };
      }
      if (/이등변삼각형/.test(p)) {
        const a = 이름점(m.marks, 'ㄱ');
        const b = 이름점(m.marks, 'ㄴ');
        const x = (a[0] + b[0]) / 2;
        return { kind: m.kind, pt: [x, a[1] >= 3 ? a[1] - 3 : a[1] + 3] };
      }
      if (/원의 중심/.test(p)) {
        const ps = m.shapes[0].pts;
        const cx = Math.round(ps.reduce((s, q2) => s + q2[0], 0) / ps.length);
        const cy = Math.round(ps.reduce((s, q2) => s + q2[1], 0) / ps.length);
        return { kind: m.kind, pt: [cx, cy] };
      }
      throw new Error(`풀 수 없는 점 찍기: ${p}`);
    }
    case 'grid-draw': {
      const g = m.goal;
      if (/대각선을 모두/.test(p)) {
        const ps = 닫힌도형(m.fixed)!;
        const segs: GridSegment[] = [];
        for (let i = 0; i < ps.length; i += 1) for (let j = i + 2; j < ps.length; j += 1) if (!(i === 0 && j === ps.length - 1)) segs.push([ps[i], ps[j]]);
        return { kind: m.kind, segs };
      }
      if (/선대칭도형이 되도록/.test(p) && m.axis && 'x' in m.axis) {
        const ax = m.axis.x;
        return { kind: m.kind, segs: m.fixed.map(([a, b]) => [[2 * ax - a[0], a[1]], [2 * ax - b[0], b[1]]] as GridSegment) };
      }
      if (/점대칭도형이 되도록/.test(p) && m.center) {
        const c = m.center;
        return { kind: m.kind, segs: m.fixed.map(([a, b]) => [[2 * c[0] - a[0], 2 * c[1] - a[1]], [2 * c[0] - b[0], 2 * c[1] - b[1]]] as GridSegment) };
      }
      if (/두 점을 이어 그을 수 있는 선분을 모두/.test(p)) {
        const ps = m.marks.map((x) => x.at);
        const segs: GridSegment[] = [];
        for (let i = 0; i < ps.length; i += 1) for (let j = i + 1; j < ps.length; j += 1) segs.push([ps[i], ps[j]]);
        return { kind: m.kind, segs };
      }
      if (g.type === 'between') {
        // 한 평행선 위의 모눈점에서 수직인 방향으로 걸어가 다른 평행선에 닿을 때까지 긋습니다.
        expect(/평행/.test(p), p).toBe(true);
        const [l1, l2] = m.fixed;
        const d = [l1[1][0] - l1[0][0], l1[1][1] - l1[0][1]];
        const 약 = (x: number, y: number): number => (y ? 약(y, x % y) : Math.abs(x));
        const k = 약(d[0], d[1]);
        const 수직: GridPoint = [-d[1] / k, d[0] / k];
        const 위에 = (l: GridSegment, q2: GridPoint) => (l[1][0] - l[0][0]) * (q2[1] - l[0][1]) - (l[1][1] - l[0][1]) * (q2[0] - l[0][0]) === 0
          && Math.min(l[0][0], l[1][0]) <= q2[0] && q2[0] <= Math.max(l[0][0], l[1][0]) && Math.min(l[0][1], l[1][1]) <= q2[1] && q2[1] <= Math.max(l[0][1], l[1][1]);
        for (let t = 1; t < k; t += 1) {
          const 시작: GridPoint = [l1[0][0] + (d[0] / k) * t, l1[0][1] + (d[1] / k) * t];
          for (const 쪽 of [1, -1]) for (let j = 1; j < 12; j += 1) {
            const 끝: GridPoint = [시작[0] + 수직[0] * 쪽 * j, 시작[1] + 수직[1] * 쪽 * j];
            if (위에(l2, 끝)) return { kind: m.kind, segs: [[시작, 끝]] };
          }
        }
        throw new Error(`평행선 사이를 잇지 못함: ${p}`);
      }
      if (g.type === 'line') {
        const [a, b] = m.fixed[0];
        const d = [b[0] - a[0], b[1] - a[1]];
        const k = Math.abs(d[0] && d[1] ? 1 : 1);
        const u: GridPoint = /평행/.test(p) ? [Math.sign(d[0]), Math.sign(d[1])] : [-Math.sign(d[1]), Math.sign(d[0])];
        // 2:1처럼 기울면 방향을 그 비대로 맞춥니다.
        const 비 = Math.abs(d[0]) === Math.abs(d[1]) || d[0] === 0 || d[1] === 0 ? 1 : 0;
        const 방향: GridPoint = 비 ? u : /평행/.test(p) ? [d[0] / 2, d[1] / 2] : [-d[1] / 2, d[0] / 2];
        const t = g.through;
        const 끝후보: GridPoint[] = [[t[0] + 방향[0] * k, t[1] + 방향[1] * k], [t[0] - 방향[0] * k, t[1] - 방향[1] * k]];
        const 끝 = 끝후보.find(([x, y]) => x >= 0 && y >= 0 && x <= m.cols && y <= m.rows)!;
        expect(/직각|수직|평행/.test(p), p).toBe(true);
        return { kind: m.kind, segs: [[t, 끝]] };
      }
      // 조건이 있는 도형: 예시 도형이 조건을 지키는지는 채점에 맡기고, 조건이 문제 글과 맞는지 따로 봅니다.
      if (g.type === 'polygon') {
        const 넓이 = /넓이가 (\d+) cm²/.exec(p);
        if (넓이) expect(g.goal.area, p).toBe(n(넓이[1]));
        const 둘레 = /둘레가 (\d+) cm/.exec(p);
        if (둘레) expect(g.goal.perimeter, p).toBe(n(둘레[1]));
        const 크기 = /가로 (\d+)칸, 세로 (\d+)칸/.exec(p);
        if (크기) expect([g.goal.width, g.goal.height], p).toEqual([n(크기[1]), n(크기[2])]);
        if (/삼각형/.test(p) && !/사각형/.test(p)) expect(g.goal.sides, p).toBe(3);
        if (/사각형|사다리꼴|마름모|평행사변형/.test(p)) expect(g.goal.sides, p).toBe(4);
        if (/오각형/.test(p)) expect(g.goal.sides, p).toBe(5);
        if (/육각형/.test(p)) expect(g.goal.sides, p).toBe(6);
        return { kind: m.kind, segs: m.example ?? [] };
      }
      if (g.type === 'congruent') {
        // 왼쪽 도형을 오른쪽으로 6칸 옮겨 그립니다.
        const ps = 닫힌도형(m.fixed)!;
        const 옮김 = ps.map(([x, y]) => [x + 6, y] as GridPoint);
        return { kind: m.kind, segs: 옮김.map((q2, i) => [q2, 옮김[(i + 1) % 옮김.length]] as GridSegment) };
      }
      throw new Error(`풀 수 없는 그리기: ${p}`);
    }
    case 'shape-move': {
      const 바로 = (c: GridPoint[]) => {
        const x0 = Math.min(...c.map((v) => v[0]));
        const y0 = Math.min(...c.map((v) => v[1]));
        return c.map(([x, y]) => [x - x0, y - y0] as GridPoint);
      };
      const 시계 = (c: GridPoint[]) => 바로(c.map(([x, y]) => [-y, x] as GridPoint));
      const 좌우 = (c: GridPoint[]) => 바로(c.map(([x, y]) => [-x, y] as GridPoint));
      const 상하 = (c: GridPoint[]) => 바로(c.map(([x, y]) => [x, -y] as GridPoint));
      let c = 바로(m.cells);
      if (/민 자리/.test(p)) {
        const [dx, dy] = 방향읽기(p);
        return { kind: m.kind, cells: c, offset: [m.start[0] + dx, m.start[1] + dy] };
      }
      // 문제 글의 움직임을 차례대로 합니다.
      const 말 = p.replace(/ 모양을 만들어.*$/, '');
      const 조각 = 말.split(/다음/);
      for (const 한 of 조각) {
        if (/오른쪽으로 두 번 뒤집은/.test(한)) { c = 좌우(좌우(c)); continue; }
        if (/오른쪽으로 뒤집/.test(한)) c = 좌우(c);
        if (/아래쪽으로 뒤집/.test(한)) c = 상하(c);
        const 각 = /(시계 반대 방향|시계 방향)으로 (\d+)°/.exec(한);
        if (각) {
          const 번 = n(각[2]) / 90;
          const 시계번 = 각[1] === '시계 방향' ? 번 : (4 - 번) % 4;
          for (let k = 0; k < 시계번; k += 1) c = 시계(c);
        }
      }
      return { kind: m.kind, cells: c, offset: m.start };
    }
    case 'number-line': {
      const 앞 = (k: number) => m.labels.find((l) => l.at === k)!;
      const 값 = (텍스트: string) => Number(텍스트);
      // 이름 붙은 첫 두 눈금으로 수를 눈금 자리로 바꿉니다(이름이 수일 때).
      const 자리 = (v: number) => {
        const [l0, l1] = m.labels;
        return Math.round(((v - Number(l0.text)) / (Number(l1.text) - Number(l0.text))) * (l1.at - l0.at) + l0.at);
      };
      let 어 = /(\d+)[을를] (올림|버림|반올림)하여 (십|백)의 자리까지/.exec(p);
      if (어) {
        const v = n(어[1]);
        const u = 어[3] === '십' ? 10 : 100;
        const 아래 = v - (v % u);
        const 답 = 어[2] === '버림' ? 아래 : 어[2] === '올림' ? 아래 + u : v % u >= u / 2 ? 아래 + u : 아래;
        expect(q.answer, p).toBe(String(답));
        return { kind: m.kind, at: 자리(답) };
      }
      if ((어 = /수직선에서 \(?(?:(\d+)[과와] )?(\d+)\/(\d+)\)?×(\d+)[을를]/.exec(p))) {
        const d = n(어[3]);
        return { kind: m.kind, at: ((n(어[1] ?? '0') * d + n(어[2])) * n(어[4])) * (m.labels[1].at / d) };
      }
      if ((어 = /(\d+)÷(\d+)의 몫을 반올림하여 소수 첫째 자리까지/.exec(p))) {
        const v = Math.round((n(어[1]) * 10) / n(어[2])) / 10;
        expect(q.answer, p).toBe(v.toFixed(1));
        return { kind: m.kind, at: 자리(v) };
      }
      if ((어 = /수직선에서 (\d+)÷(\d+)의 몫을 나타내는/.exec(p))) return { kind: m.kind, at: (n(어[1]) / n(어[2])) * m.labels[1].at };
      if (/가능성을 수로 나타내어/.test(p)) {
        let v = -1;
        if ((어 = /4칸으로 나눈 회전판에서 빨간 칸이 (\d)칸일 때/.exec(p))) v = n(어[1]) / 4;
        if (/짝수의 눈이 나올|그림 면이 나올/.test(p)) v = 1 / 2;
        if (/흰 바둑돌만 \d+개 든 주머니에서 검은/.test(p)) v = 0;
        if (/흰 바둑돌만 \d+개 든 주머니에서 흰/.test(p)) v = 1;
        expect(v, p).toBeGreaterThanOrEqual(0);
        return { kind: m.kind, at: v * m.ticks };
      }
      let r = /(\d+)과\(와\)|(\d+)[과와] (\d+)\/(\d+)을?를?\(?를?\)? 나타내는/.exec(p);
      r = /에서 (\d+)[과와] (\d+)\/(\d+)[을를] 나타내는/.exec(p);
      if (r) return { kind: m.kind, at: (n(r[1]) * n(r[3]) + n(r[2])) * (m.labels[1].at / 1) / n(r[3]) * (n(r[3]) / m.labels[1].at) };
      r = /에서 (\d+)\/(\d+)[을를] 나타내는/.exec(p);
      if (r) {
        const 한칸 = m.labels[1].at; // 0과 1 사이 칸 수
        return { kind: m.kind, at: (n(r[1]) * 한칸) / n(r[2]) };
      }
      r = /0과 1 사이를 (\d+)칸으로 나눈 수직선입니다\. (\d+)\/(\d+)[과와] 크기가 같은/.exec(p);
      if (r) return { kind: m.kind, at: (n(r[2]) * n(r[1])) / n(r[3]) };
      r = /에서 (\d+\.\d+)[을를] 나타내는/.exec(p);
      if (r) {
        const a = 값(앞(0).text);
        const b = 값(m.labels[m.labels.length - 1].text);
        return { kind: m.kind, at: Math.round(((값(r[1]) - a) / (b - a)) * m.ticks) };
      }
      r = /(\d+)보다 1만큼 더 (큰|작은) 수/.exec(p);
      const 시작 = 값(앞(0).text);
      if (r) return { kind: m.kind, at: n(r[1]) + (r[2] === '큰' ? 1 : -1) - 시작 };
      r = /줄입니다\. (\d+)이?가?\(?가?\)? 있는/.exec(p);
      if (r) return { kind: m.kind, at: n(r[1]) - 시작 };
      throw new Error(`풀 수 없는 수직선: ${p}`);
    }
    case 'tap-fill': {
      const 째들 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];
      let 칸: number[] | null = null;
      let e = /왼쪽에서부터 \S+ (\d+)개를 눌러/.exec(p);
      if (e) 칸 = Array.from({ length: n(e[1]) }, (_, k) => k);
      if (!칸 && (e = /(왼쪽|오른쪽)에서 (\S+째) /.exec(p))) {
        const k = 째들.indexOf(e[2]);
        칸 = [e[1] === '왼쪽' ? k : m.parts - 1 - k];
      }
      if (!칸 && /수 배열표에서 색칠한 수/.test(p)) {
        // 미리 칠한 칸의 수를 읽어 얼마씩 커지는지 구합니다.
        const 수들 = m.pre.map((k) => (m.from ?? 1) + k);
        const 차 = 수들[1] - 수들[0];
        expect(수들[2] - 수들[1], p).toBe(차);
        칸 = [];
        for (let v = 수들[0]; v < (m.from ?? 1) + m.parts; v += 차) 칸.push(v - (m.from ?? 1));
      }
      if (!칸 && (e = /(오전|오후) (\d+)시에 .+ (오전|오후) (\d+)시에/.exec(p))) {
        const 시 = (낮: string, h: number) => (h % 12) + (낮 === '오후' ? 12 : 0);
        const 시작 = 시(e[1], n(e[2]));
        const 끝 = 시(e[3], n(e[4]));
        칸 = Array.from({ length: 끝 - 시작 }, (_, k) => 시작 + k);
      }
      if (!칸 && (e = /(\d+)[과와] (\d+)의 (공약수|최대공약수|공배수|최소공배수)/.exec(p))) {
        const [a, b] = [n(e[1]), n(e[2])];
        const 수들: number[] = [];
        for (let v = 1; v <= m.parts; v += 1) {
          const 공약 = a % v === 0 && b % v === 0;
          const 공배 = v % a === 0 && v % b === 0;
          if ((e[3] === '공약수' && 공약) || (e[3] === '공배수' && 공배)) 수들.push(v);
        }
        if (e[3] === '최대공약수') for (let v = Math.min(a, b); v >= 1; v -= 1) if (a % v === 0 && b % v === 0) { 수들.push(v); break; }
        if (e[3] === '최소공배수') for (let v = Math.max(a, b); ; v += 1) if (v % a === 0 && v % b === 0) { 수들.push(v); break; }
        칸 = 수들.map((v) => v - 1);
      }
      if (!칸 && (e = /(\d+) (이상|초과) (\d+) (이하|미만)인 수/.exec(p))) {
        const [lo, hi] = [n(e[1]), n(e[3])];
        칸 = [];
        for (let k = 0; k < m.parts; k += 1) {
          const v = (m.from ?? 1) + k;
          if ((e[2] === '이상' ? v >= lo : v > lo) && (e[4] === '이하' ? v <= hi : v < hi)) 칸.push(k);
        }
      }
      if (!칸 && (e = /곱셈표에서 곱이 (\d+)인 칸/.exec(p))) {
        칸 = [];
        for (let a = 1; a <= 9; a += 1) for (let b = 1; b <= 9; b += 1) if (a * b === n(e[1])) 칸.push((a - 1) * 9 + b - 1);
      }
      if (칸) {
        expect([...칸].sort((a, b) => a - b), p).toEqual([...m.exact!].sort((a, b) => a - b));
        return { kind: m.kind, on: 칸.filter((k) => !m.pre.includes(k)) };
      }
      expect(m.exact, p).toBeUndefined();
      let t: number | null = null;
      // 분모가 다른 분수: 막대 한 칸은 1/L입니다.
      let r = /1을 (\d+)칸으로 똑같이 나눈 막대.*?(\d+)\/(\d+)([+-])(\d+)\/(\d+)만큼/.exec(p);
      if (r) t = (n(r[2]) / n(r[3]) + (r[4] === '+' ? 1 : -1) * n(r[5]) / n(r[6])) * n(r[1]);
      if (t === null && (r = /100칸으로 똑같이 나눈 모눈입니다\. ([\d.]+)([×÷])([\d.]+)(?:의 몫)?만큼/.exec(p))) t = (r[2] === '×' ? Number(r[1]) * Number(r[3]) : Number(r[1]) / Number(r[3])) * 100;
      if (t === null && (r = /파란 구슬이 (\d+)개 있습니다\. .*?(\d+) : (\d+)/.exec(p))) t = (n(r[1]) * n(r[2])) / n(r[3]);
      if (t !== null) t = Math.round(t * 1e9) / 1e9;
      if (t === null) r = /(\d+)\/(\d+)\+(\d+)\/(\d+)만큼/.exec(p);
      if (t === null && r) t = n(r[1]) + n(r[3]);
      if (t === null && (r = /(\d+)\/(\d+)의 (\d+)\/(\d+)만큼/.exec(p))) t = n(r[1]) * n(r[3]) * (m.parts / (n(r[2]) * n(r[4])));
      if (t === null && (r = /(\d+)\/(\d+)[을를] (\d+)로 똑같이 나눈 것 가운데 하나/.exec(p))) t = (m.parts * n(r[1])) / n(r[2]) / n(r[3]);
      if (t === null && (r = /(\d+)\/(\d+)[과와] 크기가 같도록/.exec(p))) t = (m.parts * n(r[1])) / n(r[2]);
      if (t === null && (r = /(\d+)개의 (\d+)\/(\d+)만큼/.exec(p))) t = (n(r[1]) * n(r[2])) / n(r[3]);
      if (t === null && (r = /(\d+)개를 형과 동생이 (\d+) : (\d+)로/.exec(p))) t = (n(r[1]) * n(r[2])) / (n(r[2]) + n(r[3]));
      if (t === null && (r = /0\.(\d\d)만큼/.exec(p))) t = n(r[1]);
      if (t === null && (r = /(\d+)%만큼/.exec(p))) t = n(r[1]);
      if (t === null && (r = /(\d+)\/(\d+)만큼 색칠/.exec(p))) t = (m.parts * n(r[1])) / n(r[2]);
      if (t === null && (r = /학생 (\d+)명 가운데 (\d+)명이 .+ 20칸으로/.exec(p))) t = (n(r[2]) / n(r[1])) * 20;
      if (t === null && (r = /모두 (\d+)개가 되도록/.exec(p))) t = n(r[1]);
      if (t === null && (r = /빨간 구슬이 (\d+)개 있습니다\. 파란 구슬 (\d+)개를 더 놓아/.exec(p))) { expect(m.pre.length, p).toBe(n(r[1])); t = n(r[1]) + n(r[2]); }
      if (t === null && (r = /구슬을 (\d+)개 놓아/.exec(p))) t = n(r[1]);
      if (t === null && (r = /(\d+)개만 눌러/.exec(p))) t = n(r[1]);
      expect(t, p).not.toBeNull();
      expect(Number.isInteger(t), p).toBe(true);
      expect(t, p).toBe(m.target);
      const on: number[] = [];
      for (let k = 0; on.length + m.pre.length < t! && k < m.parts; k += 1) if (!m.pre.includes(k)) on.push(k);
      return { kind: m.kind, on };
    }
    case 'base-ten': {
      let t: number;
      let r = /^(\d+)\+(\d+)[을를]/.exec(p);
      const 계산 = /^수 모형이 (\d+)[을를] 나타내고 있습니다\. (\d+)만큼 모형을 (더 놓아|덜어 내어) (\d+)([+-])(\d+)[을를]/.exec(p);
      if (계산) {
        expect([n(계산[4]), n(계산[6])], p).toEqual([n(계산[1]), n(계산[2])]);
        expect(계산[3] === '더 놓아' ? '+' : '-', p).toBe(계산[5]);
        expect(m.start, p).toEqual(m.places.map((pl) => Math.floor(n(계산[1]) / pl) % 10));
      }
      if (계산) t = 계산[5] === '+' ? n(계산[1]) + n(계산[2]) : n(계산[1]) - n(계산[2]);
      else if (/(\d+)원을 만들어/.test(p)) t = n(/(\d+)원을 만들어/.exec(p)![1]);
      else if (r) t = n(r[1]) + n(r[2]);
      else if ((r = /^(\d+)보다 (\d+)만큼 더 (큰|작은)/.exec(p))) t = n(r[1]) + (r[3] === '큰' ? 1 : -1) * n(r[2]);
      else t = n(/수 모형으로 (\d+)[을를]/.exec(p)![1]);
      expect(t, p).toBe(m.target);
      const counts = m.places.map((pl) => Math.floor(t / pl) % 10);
      if (m.places[0] * 10 <= t) counts[0] = Math.floor(t / m.places[0]);
      return { kind: m.kind, counts };
    }
    case 'bars': {
      if (/평균/.test(p)) {
        const 자료 = [...p.matchAll(/(\S+) (\d+)권/g)].map((x) => n(x[2]));
        const 평균 = 자료.reduce((a, b) => a + b, 0) / 자료.length;
        expect(Number.isInteger(평균), p).toBe(true);
        expect(m.start, p).toEqual(자료);
        expect(q.answer, p).toBe(`모두 ${평균}권`);
        return { kind: m.kind, vals: 자료.map(() => 평균) };
      }
      const 쌍 = [...p.matchAll(/(\S+) (\d+)(명|장|권)/g)].map((x) => [x[1], n(x[2])] as const);
      const vals = m.labels.map((label) => 쌍.find(([l]) => l === label)![1]);
      expect(vals, p).toEqual(m.values);
      return { kind: m.kind, vals };
    }
    case 'angle': {
      const 사각 = /사각형의 세 각이 (\d+)°, (\d+)°, (\d+)°/.exec(p);
      if (사각) return { kind: m.kind, deg: 360 - n(사각[1]) - n(사각[2]) - n(사각[3]) };
      let r = /(\d+)°와 (\d+)°의 (합|차)/.exec(p);
      if (r) return { kind: m.kind, deg: r[3] === '합' ? n(r[1]) + n(r[2]) : n(r[1]) - n(r[2]) };
      if ((r = /두 각이 (\d+)°, (\d+)°/.exec(p))) return { kind: m.kind, deg: 180 - n(r[1]) - n(r[2]) };
      if ((r = /(\d+)°인 각/.exec(p))) return { kind: m.kind, deg: n(r[1]) };
      if (/직각을 만들어/.test(p)) return { kind: m.kind, deg: 90 };
      if (/예각을 만들어/.test(p)) return { kind: m.kind, deg: 45 };
      if (/둔각을 만들어/.test(p)) return { kind: m.kind, deg: 135 };
      throw new Error(`풀 수 없는 각: ${p}`);
    }
    case 'sort-bins': {
      const 알기 = (label: string, bins: string[]): number => {
        const 수 = Number(label);
        if (!Number.isNaN(수)) {
          if (bins[0] === '짝수') return 수 % 2 ? 1 : 0;
          let r = /^(\d+)의 약수$/.exec(bins[0]);
          if (r) return n(r[1]) % 수 === 0 ? 0 : 1;
          if ((r = /^(\d+)의 배수$/.exec(bins[0]))) return 수 % n(r[1]) === 0 ? 0 : 1;
          if ((r = /^(\d+) 이상인 수$/.exec(bins[0]))) return 수 >= n(r[1]) ? 0 : 1;
          if ((r = /^(\d+) 초과인 수$/.exec(bins[0]))) return 수 > n(r[1]) ? 0 : 1;
        }
        const 입체: Record<string, string[]> = {
          '두 밑면이 평행하고 합동인 삼각형, 옆면이 직사각형 3개': ['각기둥'], '두 밑면이 평행하고 합동인 오각형, 옆면이 직사각형 5개': ['각기둥'],
          '두 밑면이 평행하고 합동인 육각형, 옆면이 직사각형 6개': ['각기둥'], '상자 모양(직육면체)': ['각기둥'],
          '밑면이 사각형 1개, 옆면이 삼각형 4개': ['각뿔', '각기둥이 아닌 것'], '밑면이 삼각형 1개, 옆면이 삼각형 3개': ['각뿔'], '밑면이 육각형 1개, 옆면이 삼각형 6개': ['각뿔'],
          '밑면이 원 2개이고 옆면이 굽은 면': ['원기둥', '둘 다 아닌 것', '각기둥이 아닌 것'], '밑면이 원 1개이고 뾰족한 꼭짓점': ['원뿔', '둘 다 아닌 것'],
          '두 밑면이 평행하지만 크기가 다른 사각형': ['각기둥이 아닌 것'], '공 모양': ['둘 다 아닌 것', '각기둥이 아닌 것'],
          '음료수 캔': ['원기둥'], '두루마리 휴지': ['원기둥'], 고깔모자: ['원뿔'], '공사장 고깔': ['원뿔'], 축구공: ['구'], 구슬: ['구'], '어느 방향에서 보아도 원': ['구'],
        };
        const 입체칸 = 입체[label] ? bins.findIndex((b) => 입체[label].includes(b)) : -1;
        if (입체칸 >= 0) return 입체칸;
        const 표: Record<string, string> = {
          '선물 상자': '상자 모양', 주사위: '상자 모양', 우유갑: '상자 모양', 책: '상자 모양',
          통조림: '둥근기둥 모양', 북: '둥근기둥 모양', 건전지: '둥근기둥 모양', 양초: '둥근기둥 모양',
          축구공: '공 모양', 농구공: '공 모양', 구슬: '공 모양', 귤: '공 모양',
          공책: '■ 모양', 액자: '■ 모양', 창문: '■ 모양', 삼각김밥: '▲ 모양', '조각 피자': '▲ 모양', '삼각 깃발': '▲ 모양', 동전: '● 모양', 시계: '● 모양', 접시: '● 모양',
          닭: '다리가 2개', 오리: '다리가 2개', 펭귄: '다리가 2개', 타조: '다리가 2개', 강아지: '다리가 4개', 고양이: '다리가 4개', 돼지: '다리가 4개', 소: '다리가 4개', 코끼리: '다리가 4개',
          물고기: '물에서 사는 것', 문어: '물에서 사는 것', 고래: '물에서 사는 것', 상어: '물에서 사는 것', 토끼: '땅에서 사는 것', 사자: '땅에서 사는 것', 말: '땅에서 사는 것', 다람쥐: '땅에서 사는 것',
          참새: '날개가 있는 것', 나비: '날개가 있는 것', 벌: '날개가 있는 것', 독수리: '날개가 있는 것', 곰: '날개가 없는 것', 뱀: '날개가 없는 것', 개구리: '날개가 없는 것', 원숭이: '날개가 없는 것',
        };
        if (표[label]) return bins.indexOf(표[label]);
        // 가능성: 수와 상식으로 판단합니다.
        if (/7의 눈|1월 다음에 3월|흰 바둑돌만 든 주머니에서 검은/.test(label)) return bins.indexOf('불가능하다');
        if (/동전을 던지면|짝수의 눈|흰 돌 1개, 검은 돌 1개/.test(label)) return bins.indexOf('반반이다');
        if (/해가 동쪽|6 이하의 눈|빨간 공만 든 상자에서 빨간/.test(label)) return bins.indexOf('확실하다');
        throw new Error(`분류를 모름: ${label}`);
      };
      const placed = m.items.map((it) => 알기(it.label, m.bins));
      placed.forEach((b) => expect(b, p).toBeGreaterThanOrEqual(0));
      return { kind: m.kind, placed };
    }
    case 'stack-build': {
      if (m.show === 'none') {
        const 가로 = n(/가로 (\d+) cm/.exec(p)![1]);
        const 세로 = n(/세로 (\d+) cm/.exec(p)![1]);
        const 높이 = /높이 (\d+) cm/.test(p) ? n(/높이 (\d+) cm/.exec(p)![1]) : n(/부피가 (\d+) cm³인 직육면체/.exec(p)![1]) / (가로 * 세로);
        expect([m.rows, m.cols], p).toEqual([세로, 가로]);
        return { kind: m.kind, h: Array.from({ length: 세로 }, () => Array.from({ length: 가로 }, () => 높이)) };
      }
      // 본 모양은 테스트 쪽에서 따로 셉니다(0번 줄이 뒤, 옆은 오른쪽에서 보아 앞쪽 줄이 왼쪽).
      const 앞 = (h: number[][]) => h[0].map((_, c) => Math.max(...h.map((row) => row[c])));
      const 옆 = (h: number[][]) => h.map((row) => Math.max(...row)).reverse();
      if (m.check === 'exact' || m.check === 'views') return { kind: m.kind, h: m.target.map((row) => [...row]) };
      // 가장 적게·많게: 바닥 칸마다 1~3층을 모두 넣어 보고 본 모양이 같은 것 가운데 고릅니다.
      const 칸들: [number, number][] = [];
      m.target.forEach((row, r) => row.forEach((v, c) => { if (v > 0) 칸들.push([r, c]); }));
      const h = m.target.map((row) => row.map(() => 0));
      let 고른: number[][] | null = null;
      let 고른수 = m.check === 'views-min' ? Infinity : -Infinity;
      const 돌기 = (k: number) => {
        if (k === 칸들.length) {
          if (JSON.stringify(앞(h)) === JSON.stringify(앞(m.target)) && JSON.stringify(옆(h)) === JSON.stringify(옆(m.target))) {
            const 수 = h.flat().reduce((a, b) => a + b, 0);
            if (m.check === 'views-min' ? 수 < 고른수 : 수 > 고른수) { 고른수 = 수; 고른 = h.map((row) => [...row]); }
          }
          return;
        }
        const [r, c] = 칸들[k];
        for (let v = 1; v <= 3; v += 1) { h[r][c] = v; 돌기(k + 1); }
        h[r][c] = 0;
      };
      돌기(0);
      expect(m.count, p).toBe(고른수);
      expect(n(/(\d+)개/.exec(q.answer)![1]), p).toBe(고른수);
      return { kind: m.kind, h: 고른! };
    }
    case 'cube-net': {
      // 테스트 쪽 접기: 주사위를 굴리듯 칸마다 바닥에 닿는 면(1~6)을 셉니다.
      type 주사위 = { 아래: number; 위: number; 북: number; 남: number; 동: number; 서: number };
      const 굴리기 = (d: 주사위, 쪽: string): 주사위 =>
        쪽 === '동' ? { ...d, 아래: d.동, 위: d.서, 동: d.위, 서: d.아래 }
          : 쪽 === '서' ? { ...d, 아래: d.서, 위: d.동, 서: d.위, 동: d.아래 }
            : 쪽 === '북' ? { ...d, 아래: d.북, 위: d.남, 북: d.위, 남: d.아래 }
              : { ...d, 아래: d.남, 위: d.북, 남: d.위, 북: d.아래 };
      const 접어보기 = (cs: GridPoint[]) => {
        const 면 = new Map<string, 주사위>();
        const 할것: [GridPoint, 주사위][] = [[cs[0], { 아래: 1, 위: 6, 북: 2, 남: 5, 동: 3, 서: 4 }]];
        면.set(cs[0].join(','), 할것[0][1]);
        while (할것.length) {
          const [c, d] = 할것.pop()!;
          for (const [dx, dy, 쪽] of [[1, 0, '동'], [-1, 0, '서'], [0, -1, '북'], [0, 1, '남']] as const) {
            const k = `${c[0] + dx},${c[1] + dy}`;
            if (!cs.some((e) => e.join(',') === k) || 면.has(k)) continue;
            const nd = 굴리기(d, 쪽);
            면.set(k, nd);
            할것.push([[c[0] + dx, c[1] + dy], nd]);
          }
        }
        return 면;
      };
      const 전개도인가 = (cs: GridPoint[]) => cs.length === 6 && new Set([...접어보기(cs).values()].map((d) => d.아래)).size === 6 && 접어보기(cs).size === 6;
      if (m.mode === 'pick') {
        const 면 = 접어보기(m.given);
        const 별 = 면.get(m.star!.join(','))!;
        const 답 = [...면.entries()].find(([, d]) => d.아래 === 별.위)![0].split(',').map(Number) as GridPoint;
        return { kind: m.kind, cells: m.given, picked: 답 };
      }
      // 빈 칸을 하나(또는 둘) 고르는 모든 경우를 따로 찾아봅니다.
      const 빈칸: GridPoint[] = [];
      for (let y = 0; y < m.rows; y += 1) for (let x = 0; x < m.cols; x += 1) if (!m.given.some((c) => c[0] === x && c[1] === y)) 빈칸.push([x, y]);
      if (m.mode === 'complete') {
        const 더 = 6 - m.given.length;
        const 후보 = 더 === 1 ? 빈칸.map((a) => [a]) : 빈칸.flatMap((a, i) => 빈칸.slice(i + 1).map((b) => [a, b]));
        const 찾음 = 후보.find((add) => 전개도인가([...m.given, ...add]));
        expect(찾음, p).toBeTruthy();
        expect(전개도인가(m.given), p).toBe(false);
        return { kind: m.kind, cells: [...m.given, ...찾음!], picked: null };
      }
      expect(전개도인가(m.given), p).toBe(false);
      for (let i = 0; i < m.given.length; i += 1) for (const b of 빈칸) {
        const cs = [...m.given.filter((_, j) => j !== i), b];
        if (전개도인가(cs)) return { kind: m.kind, cells: cs, picked: null };
      }
      throw new Error(`고칠 수 없는 전개도: ${p}`);
    }
    case 'cylinder-net': {
      if (m.mode === 'base') {
        const 붙은 = m.bases[0];
        return { kind: m.kind, bases: [붙은, { pos: m.slots - 1, side: 붙은.side === 'top' ? 'bottom' : 'top' }], w: 0, hh: 0 };
      }
      // 문제 글의 지름(반지름)·높이·원주율로 옆면의 크기를 따로 구합니다.
      const 원주율 = Number(/원주율: ([\d.]+)/.exec(p)![1]);
      const 지름 = /지름이 (\d+) cm/.test(p) && !/반지름이/.test(p) ? n(/지름이 (\d+) cm/.exec(p)![1]) : n(/반지름이 (\d+) cm/.exec(p)![1]) * 2;
      const 높이 = n(/높이가 (\d+) cm/.exec(p)![1]);
      const 가로 = Math.round(지름 * 원주율 * 100) / 100;
      expect(q.answer, p).toBe(`가로 ${가로} cm, 세로 ${높이} cm`);
      return { kind: m.kind, bases: [], w: 가로, hh: 높이 };
    }
    case 'prism-net': {
      const 이름n = ['삼', '사', '오', '육'].indexOf(/(삼|사|오|육)각기둥/.exec(p)![1]) + 3;
      expect(m.n, p).toBe(이름n);
      if (m.mode === 'meet') {
        // 띠의 양 끝 꼭짓점은 위는 위끼리, 아래는 아래끼리 만납니다.
        const 물은 = m.points!.find((x) => x.name === m.ask)!;
        const 끝 = Math.max(...m.strip) + 1;
        const 짝 = m.points!.find((x) => x.corner === 물은.corner && x.i === (물은.i === 0 ? 끝 : 0))!;
        return { kind: m.kind, strip: m.strip, bases: m.bases, picked: 짝.name };
      }
      if (m.mode === 'base') {
        const 붙은 = m.bases[0];
        return { kind: m.kind, strip: m.strip, bases: [붙은, { col: m.strip[m.strip.length - 1], side: 붙은.side === 'top' ? 'bottom' : 'top' }], picked: null };
      }
      // 두 밑면이 붙은 칸을 모두 포함하도록 n칸을 한 줄로 채웁니다.
      const 왼 = Math.min(...m.bases.map((b) => b.col));
      const 시작 = Math.max(0, Math.min(왼, m.columns - 이름n));
      const 띠 = Array.from({ length: 이름n }, (_, i) => 시작 + i);
      expect(m.bases.every((b) => 띠.includes(b.col)), p).toBe(true);
      return { kind: m.kind, strip: 띠, bases: m.bases, picked: null };
    }
    case 'order': {
      if (m.expr) {
        // 괄호 깊이가 깊은 것, 곱셈·나눗셈, 왼쪽에 있는 것 차례로 정합니다.
        let 깊이 = 0;
        const 기호 = m.expr.flatMap((t, i) => {
          if (t === '(') 깊이 += 1;
          if (t === ')') 깊이 -= 1;
          return '+-×÷'.includes(t) ? [{ at: i, 깊이, 셈: '×÷'.includes(t) ? 0 : 1 }] : [];
        });
        const 차례 = [...기호].sort((a, b) => b.깊이 - a.깊이 || a.셈 - b.셈 || a.at - b.at);
        const seq = 차례.map((x) => m.items.findIndex((it) => it.at === x.at));
        expect(seq.every((i) => i >= 0) && seq.length === m.items.length, p).toBe(true);
        expect(q.prompt.replace(/\s/g, ''), p).toContain(m.expr.join(''));
        return { kind: m.kind, seq };
      }
      if (/회전판/.test(p)) {
        const 값들 = m.items.map((it) => n(/빨간 칸이 (\d)칸/.exec(it.label)![1]) / 4);
        const 높은 = /높은 것부터/.test(p);
        return { kind: m.kind, seq: 값들.map((_, i) => i).sort((a, b) => (높은 ? 값들[b] - 값들[a] : 값들[a] - 값들[b])) };
      }
      // 글자만 보고 수의 크기를 따로 읽습니다.
      const 값 = (t: string): number => {
        let r = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(t);
        if (r) return n(r[1]) + n(r[2]) / n(r[3]);
        if ((r = /^(\d+)\/(\d+)$/.exec(t))) return n(r[1]) / n(r[2]);
        expect(t, p).toMatch(/^\d+(\.\d+)?$/);
        return Number(t);
      };
      const 큰 = /큰 수부터|가장 긴 것부터/.test(p);
      expect(큰 || /작은 수부터|가장 짧은 것부터/.test(p), p).toBe(true);
      const 크기 = m.items.map((it) => (it.len !== undefined ? it.len : 값(it.label)));
      m.items.forEach((it, i) => expect(Math.abs(it.value - 크기[i]) < 1e-9, `${p} ${it.label}`).toBe(true));
      expect(new Set(크기).size, p).toBe(크기.length);
      const seq = 크기.map((_, i) => i).sort((a, b) => (큰 ? 크기[b] - 크기[a] : 크기[a] - 크기[b]));
      expect(q.answer, p).toBe(seq.map((i) => m.items[i].label).join(큰 ? ' > ' : ' < '));
      return { kind: m.kind, seq };
    }
    case 'gauge': {
      const 양들 = [...p.matchAll(/(?:(\d+) (L|kg))?(?: ?(\d+) (mL|g))?(?=을|를|만큼| 들어| 인|인|입니다|이 | 더| 덜)/g)]
        .filter((x) => x[1] || x[3])
        .map((x) => n(x[1] ?? '0') * 1000 + n(x[3] ?? '0'));
      expect(양들.length, p).toBeGreaterThan(0);
      let 답 = 양들[0];
      if (/더 부으면|함께 올리면/.test(p)) 답 = 양들[0] + 양들[1];
      if (/덜어 내면|꺼내면/.test(p)) 답 = 양들[0] - 양들[1];
      if (양들.length > 1) expect(m.pre, p).toBe(양들[0]);
      expect(m.target, p).toBe(답);
      expect(답 % m.minor, p).toBe(0);
      expect(m.tool, p).toBe(/저울|바늘/.test(p) ? 'scale' : 'beaker');
      return { kind: m.kind, value: 답 };
    }
    case 'pictograph': {
      const 큰수 = n(/큰 그림은 (\d+)/.exec(p)![1]);
      const 작은수 = n(/작은 그림은 (\d+)/.exec(p)![1]);
      const vals = m.labels.map((l) => n(new RegExp(`${l} (\\d+)${m.unitLabel}`).exec(p)![1]));
      expect(vals, p).toEqual(m.values);
      return { kind: m.kind, big: vals.map((v) => Math.floor(v / 큰수)), small: vals.map((v) => (v % 큰수) / 작은수) };
    }
    case 'calendar': {
      const 달 = n(/^(\d+)월 달력/.exec(p)![1]);
      expect(m.days, p).toBe([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][달 - 1]);
      const 요일들 = ['일', '월', '화', '수', '목', '금', '토'];
      const 날들 = Array.from({ length: m.days }, (_, i) => i + 1);
      const 요일 = (d: number) => (m.first + d - 1) % 7;
      let picked: number[];
      let r = /이달의 (.)요일을 모두/.exec(p);
      if (r) picked = 날들.filter((d) => 요일(d) === 요일들.indexOf(r![1]));
      else if ((r = /이달의 (\S+째) (.)요일/.exec(p))) picked = [날들.filter((d) => 요일(d) === 요일들.indexOf(r![2]))[['첫째', '둘째', '셋째', '넷째'].indexOf(r[1])]];
      else if ((r = /(\d+)일로부터 (\d+)주일 (후|전)/.exec(p))) picked = [n(r[1]) + (r[3] === '후' ? 7 : -7) * n(r[2])];
      else if ((r = /(\d+)일로부터 (\d+)일 후/.exec(p))) picked = [n(r[1]) + n(r[2])];
      else throw new Error(`풀 수 없는 달력: ${p}`);
      return { kind: m.kind, picked };
    }
    case 'share': {
      const 조각 = /(?:(\d+)\/(\d+)|([\d.]+))÷(?:(\d+)\/(\d+)|([\d.]+))[을를] 알아보려고/.exec(p);
      if (조각) {
        const 앞 = 조각[1] ? n(조각[1]) : Math.round(Number(조각[3]) * 10);
        const 뒤 = 조각[4] ? n(조각[4]) : Math.round(Number(조각[6]) * 10);
        if (조각[1]) expect(조각[2], p).toBe(조각[5]);
        expect([m.total, m.size, m.rest], p).toEqual([앞, 뒤, 앞 % 뒤 !== 0]);
        expect(m.rest, p).toBe(/남는 조각은 그대로/.test(p));
        return { kind: m.kind, plates: Array.from({ length: Math.floor(앞 / 뒤) }, () => 뒤) };
      }
      let r = /(\d+)개를 접시 (\d+)개에 똑같이/.exec(p);
      if (r) {
        const [total, g] = [n(r[1]), n(r[2])];
        expect([m.total, m.groups], p).toEqual([total, g]);
        expect(m.rest, p).toBe(/남는 것은 그대로/.test(p));
        if (!m.rest) expect(total % g, p).toBe(0);
        return { kind: m.kind, plates: Array.from({ length: g }, () => Math.floor(total / g)) };
      }
      r = /(\d+)개를 (?:한 접시에 )?(\d+)개씩/.exec(p);
      const [total, size] = [n(r![1]), n(r![2])];
      expect([m.total, m.size, total % size], p).toEqual([total, size, 0]);
      return { kind: m.kind, plates: Array.from({ length: total / size }, () => size) };
    }
    case 'array': {
      let rows = 0;
      let cols = 0;
      let r = /^(\d+)의 (\d+)배만큼/.exec(p);
      if (r) { cols = n(r[1]); rows = n(r[2]); }
      else if ((r = /^(\d+)[은는] (\d+)의 몇 배인지.+한 줄에 (\d+)개씩, 모두 (\d+)개/.exec(p))) { expect([n(r[2]), n(r[4])], p).toEqual([n(r[3]), n(r[1])]); cols = n(r[3]); rows = n(r[4]) / cols; }
      else if ((r = /^(\d+)×(\d+)보다 (\d+)만큼 더 큰 수/.exec(p))) { cols = n(r[1]); rows = n(r[2]) + n(r[3]) / n(r[1]); }
      else if ((r = /^(\d+)단 곱셈구구에서 곱이 (\d+)인/.exec(p))) { cols = n(r[1]); rows = n(r[2]) / n(r[1]); }
      else if ((r = /^(\d+)×(\d+)[을를] 점 배열/.exec(p))) { cols = n(r[1]); rows = n(r[2]); }
      else if ((r = /^점 (\d+)개를 (\d+)줄로 똑같이/.exec(p))) { rows = n(r[2]); cols = n(r[1]) / rows; }
      else throw new Error(`풀 수 없는 배열: ${p}`);
      const 한줄 = /한 줄에 (\d+)개씩 놓아요/.exec(p);
      if (한줄) expect(cols, p).toBe(n(한줄[1]));
      expect(Number.isInteger(rows) && Number.isInteger(cols), p).toBe(true);
      return { kind: m.kind, rows, cols };
    }
    case 'pattern': {
      // 보이는 그림만으로 가장 짧은 되풀이 묶음을 찾습니다(묶음의 칸마다 보이는 것이 있어야 합니다).
      const g = m.given;
      for (let per = 1; per <= g.length; per += 1) {
        const 묶음: (number | null)[] = Array.from({ length: per }, () => null);
        let 맞음 = true;
        g.forEach((v, i) => {
          if (v === null) return;
          if (묶음[i % per] === null) 묶음[i % per] = v;
          else if (묶음[i % per] !== v) 맞음 = false;
        });
        if (!맞음 || 묶음.some((v) => v === null)) continue;
        // 묶음이 두 번 넘게 온전히 보여야 규칙이라고 말할 수 있습니다.
        expect(g.slice(0, 2 * per).every((v) => v !== null), p).toBe(true);
        return { kind: m.kind, fill: g.map((_, i) => 묶음[i % per]) };
      }
      throw new Error(`규칙을 찾지 못함: ${p}`);
    }
    default:
      throw new Error('모르는 조작');
  }
};

/** 조금 어긋나게 바꾼 조작(틀려야 합니다) */
const 어긋난조작 = (m: Manipulation, s: ManipState): ManipState | null => {
  switch (s.kind) {
    case 'ruler-measure': return { ...s, rulerAt: s.rulerAt - 10, endTick: s.endTick! + 10 };
    case 'ruler-draw': return { ...s, end: s.end + 10 };
    case 'clock': return { ...s, minuteDeg: (s.minuteDeg + (m.kind === 'clock' ? m.step : 5) * 6) % 360 };
    case 'grid-point': return { ...s, pt: [s.pt![0] + 1, s.pt![1]] };
    case 'grid-draw': return { ...s, segs: s.segs.slice(0, -1) };
    case 'number-line': return { ...s, at: s.at! + 1 };
    case 'tap-fill': return { ...s, on: s.on.length ? s.on.slice(0, -1) : [m.kind === 'tap-fill' ? (m.pre.length) : 0] };
    case 'base-ten': return { ...s, counts: s.counts.map((c, i) => (i === s.counts.length - 1 ? (c + 1) % 10 : c)) };
    case 'bars': { const i = m.kind === 'bars' ? m.labels.findIndex((_, k) => !m.pre.includes(k)) : 0; return { ...s, vals: s.vals.map((v, k) => (k === i ? (v ?? 0) + (m.kind === 'bars' ? m.step : 1) : v)) }; }
    case 'angle': return m.kind === 'angle' && m.range ? { ...s, deg: 90 } : { ...s, deg: s.deg + 5 };
    case 'stack-build': {
      // 앞줄 맨 오른쪽 칸을 한 층 더(또는 덜) 쌓습니다.
      const h = s.h.map((row) => [...row]);
      const r = h.length - 1;
      const c = h[r].length - 1;
      h[r][c] = h[r][c] === 3 ? 2 : h[r][c] + 1;
      // 본 모양만 보는 문항은 한 층 바꾸어도 본 모양이 같을 수 있어 앞줄 전체를 비웁니다.
      if (m.kind === 'stack-build' && m.check !== 'exact') h[r] = h[r].map(() => 0);
      return { ...s, h };
    }
    case 'cylinder-net': return m.kind === 'cylinder-net' && m.mode === 'base' ? { ...s, bases: s.bases.map((b) => ({ ...b, side: 'top' as const })) } : { ...s, w: m.kind === 'cylinder-net' ? 2 * m.r : s.w };
    case 'prism-net': {
      if (s.picked) return { ...s, picked: (m.kind === 'prism-net' ? m.points! : []).find((x) => x.name !== s.picked)!.name };
      // 두 밑면을 같은 쪽에 붙이거나 옆면을 하나 뺍니다.
      return s.strip.length > 1 && m.kind === 'prism-net' && m.mode === 'sides' ? { ...s, strip: s.strip.slice(1) } : { ...s, bases: s.bases.map((b) => ({ ...b, side: 'top' as const })) };
    }
    case 'cube-net': {
      if (s.picked) {
        const 다른 = (m.kind === 'cube-net' ? m.given : []).find((c) => c[0] !== s.picked![0] || c[1] !== s.picked![1])!;
        return { ...s, picked: 다른 };
      }
      return { ...s, cells: s.cells.slice(0, -1) };
    }
    case 'sort-bins': return { ...s, placed: s.placed.map((b, k) => (k === 0 ? ((b! + 1) % (m.kind === 'sort-bins' ? m.bins.length : 2)) : b)) };
    case 'order': return { ...s, seq: [s.seq[1], s.seq[0], ...s.seq.slice(2)] };
    case 'gauge': return { ...s, value: s.value + (m.kind === 'gauge' ? m.minor : 0) };
    case 'pictograph': return { ...s, big: s.big.map((v, i) => (i === 0 ? v + 1 : v)) };
    case 'calendar': return s.picked.length > 1 ? { ...s, picked: s.picked.slice(0, -1) } : { ...s, picked: [s.picked[0] > 1 ? s.picked[0] - 1 : 2] };
    case 'share': return m.kind === 'share' && m.groups ? { ...s, plates: s.plates.map((v, i) => (i === 0 ? v - 1 : i === 1 ? v + 1 : v)) } : { ...s, plates: s.plates.slice(0, -1) };
    case 'array': return { ...s, rows: s.rows < (m.kind === 'array' ? m.maxRows : 9) ? s.rows + 1 : s.rows - 1 };
    case 'pattern': {
      const i = (m.kind === 'pattern' ? m.given : []).findIndex((v) => v === null);
      return { ...s, fill: s.fill.map((v, k) => (k === i ? ((v! + 1) % (m.kind === 'pattern' ? m.palette.length : 3)) : v)) };
    }
    default: return null;
  }
};

describe('손 조작 문항', () => {
  it('문항이 넉넉히 만들어집니다', () => {
    expect(모두.length).toBeGreaterThan(1000);
    // 표에 적은 차시마다 수준별로 조작 문항이 만들어지는지 봅니다.
    const 빈곳: string[] = [];
    for (const [열쇠, 표] of Object.entries(조작표)) {
      const [학기, 단원차시] = 열쇠.split(' ');
      const [u, l] = 단원차시.split('-').map(Number);
      const 차시 = 모든차시.find((x) => x.semester === 학기 && x.unitNo === u && x.lessonNo === l);
      if (!차시) { 빈곳.push(`${열쇠} 차시 없음`); continue; }
      // 조건을 주고 그리게 하는 문항은 글이 하나뿐일 수 있으므로 하나 이상이면 됩니다.
      for (const lv of 수준들) if (표[lv]?.length && 조작문항들(차시, lv, 4).length < 1) 빈곳.push(`${열쇠} ${lv}`);
    }
    expect(빈곳).toEqual([]);
  });

  it('글만 보고 다시 푼 조작이 맞고, 조금 어긋난 조작은 틀립니다', () => {
    for (const q of 모두) {
      const m = q.manipulate!;
      const s = 바른조작(q);
      const r = 채점(m, s);
      expect(r.ok, `${q.prompt} → ${r.said} ${r.tip ?? ''}`).toBe(true);
      const 어긋 = 어긋난조작(m, s);
      if (어긋) expect(채점(m, 어긋).ok, `${q.prompt} (어긋남)`).toBe(false);
      // 틀렸을 때 보여 주는 바른 모습도 맞아야 합니다.
      expect(채점(m, 정답모습(m)).ok, `${q.prompt} (바른 모습)`).toBe(true);
    }
  });

  it('아무것도 하지 않으면 맞지 않습니다(두 번 뒤집기처럼 그대로가 답인 것은 빼고)', () => {
    for (const q of 모두) {
      if (/두 번 뒤집은/.test(q.prompt)) continue;
      if (q.manipulate!.kind === 'cube-net' && q.manipulate!.mode === 'pick') continue;
      expect(채점(q.manipulate!, 처음상태(q.manipulate!)).ok, q.prompt).toBe(false);
    }
  });

  it('글이 바르고 도움말과 풀이가 갖추어져 있습니다', () => {
    for (const q of 모두) {
      const 글 = [q.prompt, q.answer, q.support.studentHint, ...q.support.steps].join(' ');
      expect(글, q.prompt).not.toMatch(/\((을|를|은|는|이|가|과|와|으)\)|undefined|NaN/);
      expect(q.support.steps.length, q.prompt).toBeGreaterThanOrEqual(3);
      expect(q.support.studentHint.length, q.prompt).toBeGreaterThan(10);
      // 도움말이 답을 그대로 말하지 않습니다.
      if (/^\d/.test(q.answer)) expect(new RegExp(`(^|[^\\d./])${q.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(q.support.studentHint), `${q.prompt} / ${q.support.studentHint}`).toBe(false);
    }
  });

  it('배우지 않은 말과 수를 쓰지 않습니다', () => {
    for (const q of 모두) {
      const l = 모든차시.find((x) => x.id === q.lessonId)!;
      const 글 = [q.prompt, q.support.studentHint, ...q.support.steps].join(' ');
      if (l.semester.startsWith('1')) expect(글, q.prompt).not.toMatch(/수직선|십 배열판/);
      if (l.semester === '1-1' && (l.unitNo === 1 || l.unitNo === 3)) for (const x of 숫자들(q.prompt)) expect(x, q.prompt).toBeLessThanOrEqual(9);
      if (l.semester === '1-1') for (const x of 숫자들(q.prompt)) expect(x, q.prompt).toBeLessThanOrEqual(50);
      if (l.semester.startsWith('3') || (l.semester === '4-2' && l.unitNo < 4)) expect(글, q.prompt).not.toMatch(/평행|수직(?!선)/);
      if (l.semester === '5-2' && l.unitNo === 1 && l.lessonNo === 2) expect(글, q.prompt).not.toMatch(/미만|초과/);
      if (l.semester === '4-1' && l.unitNo === 2 && l.lessonNo < 6) expect(q.prompt, q.prompt).not.toMatch(/합|차/);
    }
  });

  it('조작 문항을 섞어도 문항 수는 그대로이고 셋에 하나쯤입니다', () => {
    const 차시 = lessons41.find((x) => x.unitNo === 4 && x.lessonNo === 4)!;
    const 원래 = generateQuestions(차시, '중');
    const 섞음 = 조작섞기(차시, '중', 원래);
    expect(섞음.length).toBe(원래.length);
    const 조작수 = 섞음.filter((q) => q.manipulate).length;
    expect(조작수).toBeGreaterThanOrEqual(Math.floor(원래.length / 4));
    expect(조작수).toBeLessThanOrEqual(Math.ceil(원래.length / 2));
  });
});

describe('도형 살피기(채점의 바탕)', () => {
  const 닫기 = (ps: GridPoint[]): GridSegment[] => ps.map((p, i) => [p, ps[(i + 1) % ps.length]]);
  it('직사각형, 비스듬한 정사각형, 사다리꼴, 평행사변형, 마름모를 바르게 알아봅니다', () => {
    const 직사각형 = 도형살피기(닫힌도형(닫기([[0, 0], [4, 0], [4, 2], [0, 2]]))!);
    expect([직사각형.sides, 직사각형.rightAngles, 직사각형.area, 직사각형.perimeter, 직사각형.parallelPairs]).toEqual([4, 4, 8, 12, 2]);
    const 기운정사각형 = 도형살피기(닫힌도형(닫기([[3, 1], [6, 2], [5, 5], [2, 4]]))!);
    expect([기운정사각형.rightAngles, new Set(기운정사각형.sideSq).size, 기운정사각형.area, 기운정사각형.axisAligned]).toEqual([4, 1, 10, false]);
    const 사다리꼴 = 도형살피기(닫힌도형(닫기([[2, 1], [5, 1], [7, 5], [1, 5]]))!);
    expect([사다리꼴.parallelPairs, 사다리꼴.area]).toEqual([1, 18]);
    const 마름모 = 도형살피기(닫힌도형(닫기([[4, 1], [6, 4], [4, 7], [2, 4]]))!);
    expect([new Set(마름모.sideSq).size, 마름모.rightAngles, 마름모.area]).toEqual([1, 0, 12]);
    expect(도형살피기([[1, 5], [6, 5], [8, 2]]).triangle).toBe('obtuse');
    expect(도형살피기([[2, 1], [2, 5], [7, 5]]).triangle).toBe('right');
    expect(도형살피기([[1, 5], [7, 5], [4, 1]]).triangle).toBe('acute');
  });
  it('나누어 그은 선도 하나로 보고, 곧게 이어지는 점은 꼭짓점으로 세지 않습니다', () => {
    const 조각난 = 닫힌도형([[[0, 0], [2, 0]], [[2, 0], [4, 0]], [[4, 0], [4, 2]], [[4, 2], [0, 2]], [[0, 2], [0, 0]]]);
    expect(조각난?.length).toBe(4);
    expect(닫힌도형([[[0, 0], [4, 0]], [[4, 0], [4, 2]]])).toBeNull();
  });
  it('돌리거나 뒤집은 도형을 합동으로, 크기가 다르면 합동이 아닌 것으로 봅니다', () => {
    const a: GridPoint[] = [[0, 0], [3, 0], [3, 2], [1, 3]];
    const 돌림 = a.map(([x, y]) => [-y + 10, x] as GridPoint);
    const 뒤집음 = a.map(([x, y]) => [-x + 9, y] as GridPoint);
    const 큼 = a.map(([x, y]) => [x * 2, y * 2] as GridPoint);
    expect(합동인가(돌림, a)).toBe(true);
    expect(합동인가(뒤집음, a)).toBe(true);
    expect(합동인가(큼, a)).toBe(false);
  });
  it('자, 시계에서 자주 하는 실수를 알아봅니다', () => {
    const 자 = { kind: 'ruler-measure', unit: 'cm', objectMm: 60, objectStartMm: 30, item: '연필', rulerCm: 10 } as const;
    expect(채점(자, { kind: 'ruler-measure', rulerAt: 20, endTick: 70 }).tip).toMatch(/1에 끝을 맞추었어요/);
    expect(채점(자, { kind: 'ruler-measure', rulerAt: 36, endTick: 50 }).tip).toMatch(/가장자리/);
    const 시계 = { kind: 'clock', h: 4, m: 30, step: 5 } as const;
    expect(채점(시계, { kind: 'clock', hourDeg: 120, minuteDeg: 180 }).tip).toMatch(/사이에 있어요/);
    expect(채점(시계, { kind: 'clock', hourDeg: 180, minuteDeg: 135 }).tip).toMatch(/바꾸어/);
  });
});

describe('새 조작에서 자주 하는 실수를 알아봅니다', () => {
  it('몇째와 몇 개, 받아올림을 하지 않은 수 모형', () => {
    const 째 = { kind: 'tap-fill', layout: 'objects', parts: 8, cols: 8, pre: [], target: 1, exact: [2] } satisfies Manipulation;
    expect(채점(째, { kind: 'tap-fill', on: [0, 1, 2] }).tip).toMatch(/하나만 가리켜요/);
    expect(채점(째, { kind: 'tap-fill', on: [2] }).ok).toBe(true);
    const 모형 = { kind: 'base-ten', places: [10, 1], target: 63, start: [5, 7], trade: true } satisfies Manipulation;
    expect(채점(모형, { kind: 'base-ten', counts: [5, 13] }).ok).toBe(false);
    expect(채점(모형, { kind: 'base-ten', counts: [5, 13] }).tip).toMatch(/10개는 십 모형 1개로/);
    expect(채점(모형, { kind: 'base-ten', counts: [6, 3] }).ok).toBe(true);
  });
  it('똑같이 나누지 않은 접시, 바꾸어 놓은 배열, 작은 그림이 너무 많은 그림그래프', () => {
    const 접시 = { kind: 'share', total: 12, groups: 3, emoji: '🍬', rest: false } satisfies Manipulation;
    expect(채점(접시, { kind: 'share', plates: [5, 4, 3] }).tip).toMatch(/달라요/);
    expect(채점(접시, { kind: 'share', plates: [3, 3, 3] }).tip).toMatch(/남았어요/);
    const 나머지 = { kind: 'share', total: 17, groups: 5, emoji: '🍬', rest: true } satisfies Manipulation;
    expect(채점(나머지, { kind: 'share', plates: [3, 3, 3, 3, 3] }).ok).toBe(true);
    expect(채점(나머지, { kind: 'share', plates: [2, 2, 2, 2, 2] }).ok).toBe(false);
    const 배열 = { kind: 'array', maxRows: 9, maxCols: 9, rows: 4, cols: 3, emoji: '●' } satisfies Manipulation;
    expect(채점(배열, { kind: 'array', rows: 3, cols: 4 }).tip).toMatch(/바뀌었어요/);
    const 그래프 = { kind: 'pictograph', labels: ['가'], values: [32], big: 10, small: 1, icon: '🍎', unitLabel: '상자' } satisfies Manipulation;
    expect(채점(그래프, { kind: 'pictograph', big: [2], small: [12] }).tip).toMatch(/큰 그림 1개로/);
    expect(채점(그래프, { kind: 'pictograph', big: [2], small: [3] }).tip).toMatch(/바꾸어 그렸어요/);
    expect(채점(그래프, { kind: 'pictograph', big: [3], small: [2] }).ok).toBe(true);
  });
  it('1 L와 mL, 1주일, 비스듬한 선분, 단위분수의 크기', () => {
    const 비커 = { kind: 'gauge', tool: 'beaker', max: 2000, major: 500, minor: 100, target: 1300, pre: 0 } satisfies Manipulation;
    expect(채점(비커, { kind: 'gauge', value: 300 }).tip).toMatch(/1 L는 1000 mL/);
    expect(채점(비커, { kind: 'gauge', value: 1200 }).tip).toMatch(/한 눈금 차이/);
    const 달 = { kind: 'calendar', month: 5, first: 3, days: 31, target: [17] } satisfies Manipulation;
    expect(채점(달, { kind: 'calendar', picked: [10] }).tip).toMatch(/1주일은 7일/);
    const 평행 = { type: 'between', a: [[0, 2], [9, 2]], b: [[0, 5], [9, 5]] } as const;
    const 문항 = { kind: 'grid-draw', cols: 9, rows: 7, fixed: [평행.a, 평행.b], marks: [], goal: 평행 } as unknown as Manipulation;
    expect(채점(문항, { kind: 'grid-draw', segs: [[[3, 2], [3, 5]]] }).ok).toBe(true);
    expect(채점(문항, { kind: 'grid-draw', segs: [[[3, 2], [4, 3]], [[4, 3], [5, 4]], [[5, 4], [6, 5]]] }).tip).toMatch(/수직인 선분/);
    expect(채점(문항, { kind: 'grid-draw', segs: [[[3, 2], [3, 4]]] }).ok).toBe(false);
    const 순서 = { kind: 'order', dir: 'asc', items: [{ label: '1/3', value: 1 / 3 }, { label: '1/5', value: 1 / 5 }] } satisfies Manipulation;
    expect(채점(순서, { kind: 'order', seq: [0, 1] }).tip).toMatch(/분모가 클수록/);
    expect(채점(순서, { kind: 'order', seq: [1, 0] }).ok).toBe(true);
  });
});

describe('5~6학년 새 조작', () => {
  it('계산 순서는 괄호 안, 곱셈·나눗셈, 왼쪽부터의 약속을 따릅니다', async () => {
    const { 차례대로계산 } = await import('./hands56');
    expect(차례대로계산(['20', '-', '3', '×', '4', '+', '6'])!.차례.map((c) => c.식)).toEqual(['3×4', '20-12', '8+6']);
    expect(차례대로계산(['2', '×', '3', '+', '(', '8', '-', '5', ')'])!.차례.map((c) => c.식)).toEqual(['8-5', '2×3', '6+3']);
    expect(차례대로계산(['48', '÷', '(', '2', '×', '4', ')', '×', '3'])!.값).toBe(18);
    expect(차례대로계산(['7', '-', '9', '+', '1'])).toBeNull();
  });
  it('평균 막대는 모두 평균 높이여야 맞고, 아니면 고르게 하는 방법을 알려 줍니다', () => {
    const 막대 = { kind: 'bars', style: 'bar', labels: ['가', '나'], values: [4, 4], max: 10, step: 1, pre: [], unitLabel: '권', start: [2, 6] } satisfies Manipulation;
    expect(채점(막대, 처음상태(막대)).tip).toMatch(/덜어 낮은 막대에/);
    expect(채점(막대, { kind: 'bars', vals: [4, 4] }).ok).toBe(true);
  });
});
