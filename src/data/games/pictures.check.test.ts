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

const 그림답 = (v: QuestionVisual): string | null => {
  switch (v.kind) {
    case 'clock': return v.minute === 0 ? `${v.hour}시` : `${v.hour}시 ${v.minute}분`;
    case 'array': return `${v.rows * v.columns}개`;
    case 'place-value': return String(v.columns.reduce((sum, c) => sum * 10 + c.value, 0));
    case 'ruler': return `${v.highlightEnd - v.highlightStart}cm`;
    case 'fraction-model': return `${v.numerator}/${v.denominator}`;
    default: return null;
  }
};

describe('놀이의 그림 문제', () => {
  const 모든 = 단순문항단원들.flatMap((key) => 수준들.flatMap((lv) => [1, 2, 3].flatMap((seed) => 단순문항(놀이(key), lv, seed, 60).map((q) => ({ key, lv, q })))));
  const 그림문제 = 모든.filter((one) => one.q.visual);

  it('그림이 있는 단원이 여럿이고, 하 수준일수록 그림 문제가 많습니다', () => {
    expect(new Set(그림문제.map((one) => one.key)).size).toBeGreaterThanOrEqual(10);
    const 몫 = (lv: Difficulty) => {
      const 같은 = 모든.filter((one) => one.lv === lv && 그림문제.some((x) => x.key === one.key));
      return 같은.filter((one) => one.q.visual).length / 같은.length;
    };
    expect(몫('하')).toBeGreaterThan(몫('상'));
  });

  it('그림에서 다시 구한 답이 정답과 같고, 보기에 정답이 하나뿐입니다', () => {
    for (const { key, q } of 그림문제) {
      const 다시 = 그림답(q.visual!);
      if (다시 !== null) expect(q.answer, `${key} ${q.prompt}`).toBe(다시);
      expect(q.choices.filter((c) => c === q.answer)).toHaveLength(1);
      expect(new Set(q.choices).size).toBe(q.choices.length);
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
