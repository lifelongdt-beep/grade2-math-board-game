import { describe, expect, it } from 'vitest';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-1 2단원 평면도형 — 그림을 다시 재어 답을 맞춰 봅니다
// ────────────────────────────────────────────────────────────────────
// 그림의 꼭짓점에서 각과 변의 길이를 여기서 따로 재고, 문제가 묻는
// 도형이 그림에 몇 개 있는지 다시 셉니다. 생성기가 '직각'이라고 한
// 각이 실제로 직각인지, 직각이 아닌 각은 삼각자로 대 보았을 때
// 한눈에 아닌지(20° 넘게 떨어졌는지)도 봅니다.
// ════════════════════════════════════════════════════════════════════

type P = [number, number];
const levels: Difficulty[] = ['하', '중', '상'];
const 문항들: Question[] = lessons31
  .filter((one) => one.unitNo === 2)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

const 각 = (pts: P[], i: number) => {
  const n = pts.length;
  const [px, py] = pts[i];
  const [ax, ay] = pts[(i + n - 1) % n];
  const [bx, by] = pts[(i + 1) % n];
  const dot = (ax - px) * (bx - px) + (ay - py) * (by - py);
  return (Math.acos(dot / (Math.hypot(ax - px, ay - py) * Math.hypot(bx - px, by - py))) * 180) / Math.PI;
};
const 직각수 = (pts: P[]) => pts.filter((_, i) => Math.abs(각(pts, i) - 90) < 0.5).length;
const 변 = (pts: P[], i: number) => Math.hypot(pts[(i + 1) % pts.length][0] - pts[i][0], pts[(i + 1) % pts.length][1] - pts[i][1]);
const 네변같음 = (pts: P[]) => pts.length === 4 && pts.every((_, i) => Math.abs(변(pts, i) - 변(pts, 0)) < 1e-6);

type 판별 = (pts: P[]) => boolean;
const 직각삼각형: 판별 = (pts) => pts.length === 3 && 직각수(pts) === 1;
const 직사각형: 판별 = (pts) => pts.length === 4 && 직각수(pts) === 4;
const 정사각형: 판별 = (pts) => 직사각형(pts) && 네변같음(pts);

const 도형점 = (q: Question): Array<{ name?: string; pts: P[] }> => {
  if (q.visual?.kind !== 'figure-set') return [];
  return q.visual.items.filter((one) => one.points).map((one) => ({ name: one.name, pts: one.points as P[] }));
};

describe('3-1 2단원 평면도형', () => {
  it('그림의 모든 각은 직각이거나, 직각에서 20° 넘게 떨어져 있습니다', () => {
    const 나쁨: string[] = [];
    for (const q of 문항들) {
      for (const { pts } of 도형점(q)) {
        pts.forEach((_, i) => {
          const a = 각(pts, i);
          if (Math.abs(a - 90) >= 0.5 && Math.abs(a - 90) < 20) 나쁨.push(`${a.toFixed(1)}° — ${q.prompt}`);
        });
      }
    }
    expect(나쁨.slice(0, 10)).toEqual([]);
  });

  it('“직각은 모두 몇 개”의 답이 그림의 직각 수와 같습니다', () => {
    for (const q of 문항들.filter((one) => one.prompt === '도형에서 직각은 모두 몇 개일까요?')) {
      const [shape] = 도형점(q);
      expect(q.answer, q.id).toBe(`${직각수(shape.pts)}개`);
    }
  });

  it('도형을 고르는 문항은 조건에 맞는 도형이 그림에 꼭 하나이고 그것이 답입니다', () => {
    const 판별들: Record<string, 판별> = { 직각삼각형, 직사각형, 정사각형 };
    for (const q of 문항들) {
      const m = /^(직각삼각형|직사각형|정사각형)은 어느 것일까요\?$/.exec(q.prompt);
      if (!m) continue;
      const 맞는 = 도형점(q).filter(({ pts }) => 판별들[m[1]](pts)).map(({ name }) => name);
      expect(맞는, q.id).toEqual([q.answer]);
    }
  });

  it('“모두 몇 개”의 답이 그림에서 다시 센 수와 같습니다', () => {
    const 판별들: Record<string, 판별> = { 직각삼각형, 직사각형, 정사각형 };
    for (const q of 문항들) {
      const m = /^(직각삼각형|직사각형|정사각형)은 모두 몇 개일까요\?$/.exec(q.prompt);
      if (!m) continue;
      const count = 도형점(q).filter(({ pts }) => 판별들[m[1]](pts)).length;
      expect(q.answer, q.id).toBe(`${count}개`);
    }
  });

  it('직사각형을 묻는 문항의 그림에는 정사각형이 없습니다(포함 관계를 다루지 않음)', () => {
    for (const q of 문항들.filter((one) => /직사각형은/.test(one.prompt))) {
      expect(도형점(q).filter(({ pts }) => 정사각형(pts)).length, q.prompt).toBe(0);
    }
  });

  it('직각을 고르는 문항의 그림에는 직각이 꼭 하나이고 그것이 답입니다', () => {
    for (const q of 문항들.filter((one) => one.prompt === '직각은 어느 것일까요?')) {
      if (q.visual?.kind !== 'line-figure') throw new Error('그림이 없습니다');
      const 직각들 = q.visual.items
        .filter((one) => {
          const [a, v, b] = one.points as P[];
          const dot = (a[0] - v[0]) * (b[0] - v[0]) + (a[1] - v[1]) * (b[1] - v[1]);
          return Math.abs(dot) < 1e-9;
        })
        .map((one) => one.name);
      expect(직각들, q.id).toEqual([q.answer]);
      for (const one of q.visual.items) {
        const [a, v, b] = one.points as P[];
        const deg = (Math.acos(((a[0] - v[0]) * (b[0] - v[0]) + (a[1] - v[1]) * (b[1] - v[1])) / (Math.hypot(a[0] - v[0], a[1] - v[1]) * Math.hypot(b[0] - v[0], b[1] - v[1]))) * 180) / Math.PI;
        if (one.name !== q.answer) expect(Math.abs(deg - 90), q.id).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it('선분·직선·반직선의 이름이 그림과 맞고, 같은 도형의 다른 이름을 오답으로 두지 않습니다', () => {
    for (const q of 문항들.filter((one) => one.prompt === '그림과 같은 도형의 이름은 무엇일까요?')) {
      if (q.visual?.kind !== 'line-figure') throw new Error('그림이 없습니다');
      const [item] = q.visual.items;
      const [p, r] = item.labels ?? [];
      const 이름 = { segment: '선분', line: '직선', ray: '반직선' }[item.shape as 'segment' | 'line' | 'ray'];
      expect(q.answer, q.id).toBe(`${이름} ${p}${r}`);
      if (item.shape !== 'ray') expect(q.choices, q.id).not.toContain(`${이름} ${r}${p}`);
    }
  });

  it('각의 이름은 꼭짓점이 가운데에 있습니다', () => {
    for (const q of 문항들.filter((one) => one.prompt === '그림의 각을 바르게 읽은 것은 어느 것일까요?')) {
      if (q.visual?.kind !== 'line-figure') throw new Error('그림이 없습니다');
      const [a, v, b] = q.visual.items[0].labels ?? [];
      expect([`각 ${a}${v}${b}`, `각 ${b}${v}${a}`], q.id).toContain(q.answer);
      expect(q.choices, q.id).not.toContain(q.answer === `각 ${a}${v}${b}` ? `각 ${b}${v}${a}` : `각 ${a}${v}${b}`);
    }
  });

  it('도형의 뜻을 묻는 문항의 오답은 그 도형에 대해 틀린 말입니다', () => {
    // 정사각형에 '네 각이 모두 직각인 사각형'은 틀린 말이 아닙니다.
    for (const q of 문항들.filter((one) => /^정사각형은 어떤 도형일까요/.test(one.prompt))) {
      expect(q.choices, q.id).not.toContain('네 각이 모두 직각인 사각형');
      expect(q.choices, q.id).not.toContain('네 변의 길이가 모두 같은 사각형');
    }
    for (const q of 문항들) {
      expect(`${q.prompt} ${q.choices.join(' ')}`, q.id).not.toMatch(/정사각형은 직사각형|직사각형은 정사각형/);
      // 3학년은 각도와 예각·둔각을 배우지 않습니다.
      expect(`${q.prompt} ${q.choices.join(' ')} ${q.support.steps.join(' ')}`, q.id).not.toMatch(/°|예각|둔각|각도/);
    }
  });

  it('보기는 넷이고 서로 다르며 정답이 그 안에 있습니다', () => {
    for (const q of 문항들) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices[q.answerIndex], q.prompt).toBe(q.answer);
    }
  });
});
