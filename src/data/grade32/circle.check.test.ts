import { describe, expect, it } from 'vitest';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';
import type { CircleVisual, Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-2 3단원 원 — 그림의 좌표를 직접 재어 답을 다시 확인합니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Question[] = lessons32
  .filter((one) => one.unitNo === 3)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

const 거리 = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const 점 = (v: CircleVisual, name: string): [number, number] => {
  const p = (v.points ?? []).find((one) => one.name === name);
  if (!p) throw new Error(`점 ${name}이 없습니다`);
  return [p.x, p.y];
};
const 선분끝 = (v: CircleVisual, text: string): [[number, number], [number, number]] => {
  const m = /^선분 (.)(.)$/.exec(text);
  if (!m) throw new Error(text);
  return [점(v, m[1]), 점(v, m[2])];
};
const 원위 = (v: CircleVisual, p: [number, number]) => Math.abs(거리(p, [v.circles[0].cx, v.circles[0].cy]) - v.circles[0].r) < 1e-9;
const 중심 = (v: CircleVisual, p: [number, number]) => 거리(p, [v.circles[0].cx, v.circles[0].cy]) < 1e-9;
/** 선분이 원의 중심을 지나는지 봅니다. */
const 중심지남 = (v: CircleVisual, a: [number, number], b: [number, number]) => {
  const c: [number, number] = [v.circles[0].cx, v.circles[0].cy];
  return Math.abs(거리(a, c) + 거리(c, b) - 거리(a, b)) < 1e-9;
};

describe('3-2 3단원 원', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons32.filter((one) => one.unitNo === 3)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('지름·반지름 고르기: 답만 뜻에 맞고 나머지 보기는 맞지 않습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const 묻기 = /원의 (반지름|지름)은 어느 것일까요/.exec(q.prompt)?.[1];
      if (!묻기 || q.visual?.kind !== 'circles') continue;
      const v = q.visual;
      const 맞는가 = (choice: string) => {
        const [a, b] = 선분끝(v, choice);
        if (묻기 === '지름') return 원위(v, a) && 원위(v, b) && 중심지남(v, a, b);
        return (중심(v, a) && 원위(v, b)) || (중심(v, b) && 원위(v, a));
      };
      expect(맞는가(q.answer), q.prompt).toBe(true);
      for (const choice of q.choices) if (choice !== q.answer) expect(맞는가(choice), `${q.prompt} / ${choice}`).toBe(false);
      count += 1;
    }
    expect(count).toBeGreaterThan(10);
  });

  it('원의 중심 고르기와 가장 긴 선분이 그림과 맞습니다', () => {
    for (const q of 모두) {
      if (q.visual?.kind !== 'circles') continue;
      const v = q.visual;
      if (q.prompt === '원의 중심은 어느 점일까요?') {
        const 중심인 = (v.points ?? []).filter((p) => 중심(v, [p.x, p.y])).map((p) => `점 ${p.name}`);
        expect(중심인).toEqual([q.answer]);
      }
      if (q.prompt.startsWith('원 위의 두 점을 이은 선분 가운데 가장 긴')) {
        const 길이 = q.choices.filter((c) => c.startsWith('선분')).map((c) => ({ c, l: 거리(...선분끝(v, c)) }));
        const 가장 = 길이.reduce((p, n) => (n.l > p.l ? n : p));
        expect(q.answer).toBe(가장.c);
        expect(길이.filter((one) => Math.abs(one.l - 가장.l) < 1e-6).length).toBe(1);
      }
    }
  });

  it('여러 원을 놓은 그림: 글의 길이와 그림의 길이가 같고, 맞닿음·겹침이 글대로입니다', () => {
    let count = 0;
    for (const q of 모두) {
      if (q.visual?.kind !== 'circles') continue;
      const v = q.visual;
      const 답 = Number(q.answer.replace(/[^\d]/g, ''));
      if (/맞닿게 한 줄로/.test(q.prompt)) {
        const r = Number(/반지름이 (\d+) cm/.exec(q.prompt)![1]);
        v.circles.forEach((c) => expect(c.r).toBe(r));
        for (let k = 1; k < v.circles.length; k += 1) expect(v.circles[k].cx - v.circles[k - 1].cx).toBe(2 * r);
        expect(거리(점(v, 'ㄱ'), 점(v, 'ㄴ'))).toBe(답);
        count += 1;
      }
      if (/겹쳐 놓았습니다/.test(q.prompt)) {
        const d = Number(/지름이 (\d+) cm/.exec(q.prompt)![1]);
        v.circles.forEach((c) => expect(c.r * 2).toBe(d));
        // 각 원의 중심이 옆 원 위에 있습니다.
        for (let k = 1; k < v.circles.length; k += 1) expect(v.circles[k].cx - v.circles[k - 1].cx).toBe(d / 2);
        expect(거리(점(v, 'ㄱ'), 점(v, 'ㄴ'))).toBe(답);
        count += 1;
      }
      if (/맞닿아 있습니다/.test(q.prompt)) {
        const [큰, 작은] = v.circles;
        expect(거리([큰.cx, 큰.cy], [작은.cx, 작은.cy])).toBe(큰.r + 작은.r);
        const 지름들 = [...q.prompt.matchAll(/지름이 (\d+) cm/g)].map((m) => Number(m[1])).sort((a, b) => b - a);
        expect([큰.r * 2, 작은.r * 2]).toEqual(지름들);
        expect(거리(점(v, 'ㄱ'), 점(v, 'ㄴ'))).toBe(답);
        count += 1;
      }
      if (/직사각형 안에 꼭 맞게/.test(q.prompt) && v.rect) {
        const r = v.circles[0].r;
        v.circles.forEach((c) => {
          expect(c.cy - c.r).toBe(v.rect!.y);
          expect(c.cy + c.r).toBe(v.rect!.y + v.rect!.h);
        });
        expect(v.circles[0].cx - r).toBe(v.rect.x);
        expect(v.circles[v.circles.length - 1].cx + r).toBe(v.rect.x + v.rect.w);
        expect(답).toBe(q.prompt.includes('세로') ? v.rect.h : v.rect.w);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(10);
  });

  it('지름은 반지름의 2배이고, 컴퍼스는 반지름만큼 벌립니다', () => {
    for (const q of 모두) {
      const 답 = Number(q.answer.replace(/[^\d]/g, ''));
      const a = /반지름이 (\d+) cm인 원의 지름은/.exec(q.prompt);
      if (a) expect(답).toBe(Number(a[1]) * 2);
      const b = /지름이 (\d+) cm인 원의 반지름은/.exec(q.prompt);
      if (b) expect(답 * 2).toBe(Number(b[1]));
      const c = /지름이 (\d+) cm인 원을 컴퍼스로 그리려고/.exec(q.prompt);
      if (c) expect(답 * 2).toBe(Number(c[1]));
      const d = /누름 못에서 (\d+) cm 떨어진 구멍에 연필을 넣어 .+ 원의 (지름|반지름)은/.exec(q.prompt);
      if (d) expect(답).toBe(Number(d[1]) * (d[2] === '지름' ? 2 : 1));
      if (q.visual?.kind === 'ruler' && /컴퍼스를 자에 대고/.test(q.prompt)) {
        const r = (q.visual.highlightEnd ?? 0) - (q.visual.highlightStart ?? 0);
        expect(답).toBe(q.prompt.includes('원의 지름은') ? r * 2 : r);
      }
    }
  });

  it('원의 크기 비교가 맞습니다', () => {
    for (const q of 모두) {
      const m = /^가장 (큰|작은) 원은 어느 것일까요\? \((.+)\)$/.exec(q.prompt);
      if (!m) continue;
      const items = m[2].split(', ').map((one) => {
        const [, mark, 종류, n] = /^(.) (반지름|지름)이 (\d+) cm인 원$/.exec(one)!;
        return { mark, r: 종류 === '반지름' ? Number(n) : Number(n) / 2 };
      });
      const best = items.reduce((p, c) => ((m[1] === '큰' ? c.r > p.r : c.r < p.r) ? c : p));
      expect(items.filter((one) => one.r === best.r).length).toBe(1);
      expect(q.answer).toBe(best.mark);
    }
  });

  it('조사가 괄호로 남지 않습니다', () => {
    for (const q of 모두) {
      const all = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(all), all).toBe(false);
    }
  });
});
