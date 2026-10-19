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
      let r = /반지름이 (\d+) cm/.exec(p);
      if (r) { expect(m.fromMm).toBe(0); return { kind: m.kind, end: n(r[1]) * 10 }; }
      r = /지름이 (\d+) cm/.exec(p);
      if (r) { expect(m.fromMm).toBe(0); return { kind: m.kind, end: (n(r[1]) / 2) * 10 }; }
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
      let t: number | null = null;
      let r = /(\d+)\/(\d+)\+(\d+)\/(\d+)만큼/.exec(p);
      if (r) t = n(r[1]) + n(r[3]);
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
      if (r) t = n(r[1]) + n(r[2]);
      else if ((r = /^(\d+)보다 (\d+)만큼 더 (큰|작은)/.exec(p))) t = n(r[1]) + (r[3] === '큰' ? 1 : -1) * n(r[2]);
      else t = n(/수 모형으로 (\d+)[을를]/.exec(p)![1]);
      expect(t, p).toBe(m.target);
      const counts = m.places.map((pl) => Math.floor(t / pl) % 10);
      if (m.places[0] * 10 <= t) counts[0] = Math.floor(t / m.places[0]);
      return { kind: m.kind, counts };
    }
    case 'bars': {
      const 쌍 = [...p.matchAll(/(\S+) (\d+)(명|장|권)/g)].map((x) => [x[1], n(x[2])] as const);
      const vals = m.labels.map((label) => 쌍.find(([l]) => l === label)![1]);
      expect(vals, p).toEqual(m.values);
      return { kind: m.kind, vals };
    }
    case 'angle': {
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
