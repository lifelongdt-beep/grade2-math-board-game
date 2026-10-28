import { describe, expect, it } from 'vitest';
import type { Difficulty, Lesson, QuestionVisual } from '../../types';
import { 단순문항, 단순문항단원들 } from './quick';

// ════════════════════════════════════════════════════════════════════
// 놀이의 그림 문제
// ────────────────────────────────────────────────────────────────────
// 그림을 보고 답하는 문제는 그림이 곧 문제입니다. 그림과 답이 어긋나면 아이는
// 그림을 바르게 읽고도 틀립니다. 그래서 답을 글이 아니라 그림에서 다시 구해
// 정답과 견줍니다.
// ════════════════════════════════════════════════════════════════════

const 수준들: Difficulty[] = ['하', '중', '상'];
const 놀이 = (key: string): Lesson => {
  const [semester, u] = key.split('-u');
  return { id: `${semester}-u${u}-game`, semester, unitNo: Number(u), title: '놀이' } as unknown as Lesson;
};

const 그림답 = (v: QuestionVisual, prompt: string): string | null => {
  switch (v.kind) {
    case 'clock': return v.minute === 0 ? `${v.hour}시` : `${v.hour}시 ${v.minute}분`;
    // 나누는 문제는 한 줄에 놓인 수가, 세는 문제는 모두의 수가 답입니다.
    case 'array': return /나누면/.test(prompt) ? `${v.columns}개` : `${v.rows * v.columns}개`;
    case 'place-value': return String(v.columns.reduce((sum, c) => sum * 10 + c.value, 0));
    case 'ruler': {
      const 길이 = v.highlightEnd - v.highlightStart;
      if (v.unit !== 'mm') return `${길이}cm`;
      return 길이 % 10 ? `${Math.floor(길이 / 10)}cm ${길이 % 10}mm` : `${길이 / 10}cm`;
    }
    case 'counters': {
      const 남은 = v.groups.reduce((sum, g) => sum + g.count - (g.crossed ?? 0), 0);
      return `${남은}개`;
    }
    case 'cube-stack': return `${v.cubes.length}개`;
    default: return null;
  }
};

describe('놀이의 그림 문제', () => {
  const 모든 = 단순문항단원들.flatMap((key) => 수준들.flatMap((lv) => [1, 2, 3].flatMap((seed) => 단순문항(놀이(key), lv, seed, 60).map((q) => ({ key, lv, q })))));
  const 그림문제 = 모든.filter((one) => one.q.visual);

  it('그림이 있는 단원이 여럿이고, 하 수준일수록 그림 문제가 많습니다', () => {
    expect(new Set(그림문제.map((one) => one.key)).size).toBeGreaterThanOrEqual(28);
    const 몫 = (lv: Difficulty) => {
      const 같은 = 모든.filter((one) => one.lv === lv && 그림문제.some((x) => x.key === one.key));
      return 같은.filter((one) => one.q.visual).length / 같은.length;
    };
    expect(몫('하')).toBeGreaterThan(몫('상'));
  });

  it('그림에서 다시 구한 답이 정답과 같고, 보기에 정답이 하나뿐입니다', () => {
    for (const { key, q } of 그림문제) {
      const 다시 = 그림답(q.visual!, q.prompt);
      if (다시 !== null) expect(q.answer, `${key} ${q.prompt}`).toBe(다시);
      expect(q.choices.filter((c) => c === q.answer)).toHaveLength(1);
      expect(new Set(q.choices).size).toBe(q.choices.length);
    }
  });

  it('띠·무늬·입체·도형 그림에서도 답이 나옵니다', () => {
    const 기약 = (n: number, d: number) => { const g = (a: number, b: number): number => (b ? g(b, a % b) : a); const k = g(n, d); return `${n / k}/${d / k}`; };
    const 변수: Record<string, number> = { 삼각형: 3, 사각형: 4, 오각형: 5, 육각형: 6, 정오각형: 5, 정육각형: 6 };
    for (const { key, q } of 그림문제) {
      const v = q.visual!;
      const 글 = `${key} ${q.prompt} ${q.answer}`;
      if (v.kind === 'fraction-model') {
        if (/소수/.test(q.prompt)) expect(q.answer, 글).toBe(`0.${v.numerator}`);
        else if (/%/.test(q.prompt)) expect(q.answer, 글).toBe(`${(v.numerator / v.denominator) * 100}%`);
        else if (/기약분수/.test(q.prompt)) expect(q.answer, 글).toBe(기약(v.numerator, v.denominator));
        else expect(q.answer, 글).toBe(`${v.numerator}/${v.denominator}`);
      }
      if (v.kind === 'pattern') {
        const 빈 = v.missingIndex!;
        const 마디 = [2, 3].find((m) => v.items.every((x, i) => i === 빈 || (i % m !== 빈 % m ? true : true)) && v.items.every((x, i) => i === 빈 || v.items[i % m] === x || i % m === 빈 % m));
        expect(마디, 글).toBeDefined();
        const 같은자리 = v.items.find((x, i) => i !== 빈 && i % 마디! === 빈 % 마디!);
        expect(q.answer, 글).toBe(같은자리);
      }
      if (v.kind === 'box-drawing') expect(q.answer, 글).toBe(`${4 * (v.width + v.depth + v.height)}cm`);
      if (v.kind === 'figure-set' && /변은 몇 개/.test(q.prompt)) expect(q.answer, 글).toBe(`${변수[v.items[0].shape]}개`);
      if (v.kind === 'figure-set' && /넓이/.test(q.prompt)) {
        const [가로, 세로] = (v.items[0].edgeLabels ?? []).map((e) => parseFloat(e.text));
        expect(q.answer, 글).toBe(`${가로 * 세로}cm²`);
      }
      if (v.kind === 'circles') {
        const r = v.circles[0].r;
        expect(q.answer, 글).toBe(/넓이/.test(q.prompt) ? `${r * r * 3}cm²` : `${r * 2}cm`);
      }
    }
  });

  it('그래프와 도형 문제도 그림에서 답이 나옵니다', () => {
    for (const { key, q } of 그림문제) {
      const v = q.visual!;
      if (v.kind === 'pictograph') {
        const 수들 = v.items.map((x) => x.count);
        const 고른 = /많은/.test(q.prompt) ? Math.max(...수들) : Math.min(...수들);
        expect(v.items.filter((x) => x.count === 고른)).toHaveLength(1);
        expect(q.answer, key).toBe(v.items.find((x) => x.count === 고른)!.label);
      }
      if (v.kind === 'plane-shapes' && v.items.length === 1) {
        const n = v.items[0].kind === 'triangle' ? 3 : 4;
        expect(q.answer, `${key} ${q.prompt}`).toBe(`${n}개`);
      }
    }
  });
});
