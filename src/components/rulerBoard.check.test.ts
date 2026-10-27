import { describe, expect, it } from 'vitest';
import type { Difficulty, Lesson, Manipulation } from '../types';
import { lessons11 } from '../data/curriculum11';
import { lessons12 } from '../data/curriculum12';
import { lessons as lessons2 } from '../data/curriculum';
import { lessons31 } from '../data/curriculum31';
import { lessons32 } from '../data/curriculum32';
import { 조작문항들 } from '../data/manipulate';
import { 정답모습 } from '../data/manipulate/check';
import { 자로재기판 } from './Manipulate';

// '자로 길이 재기'에서 자가 판 밖으로 잘리지 않는지 봅니다. 자가 처음 놓인 자리와 바르게 맞춘 자리,
// 그리고 끌 수 있는 가장 왼쪽·오른쪽 자리 모두에서 자의 두 끝이 판 안에 있어야 합니다.
describe('자로 길이 재기 판', () => {
  const 차시들: Lesson[] = [...lessons11, ...lessons12, ...lessons2, ...lessons31, ...lessons32];
  const 수준들: Difficulty[] = ['하', '중', '상'];
  const 자문항: Extract<Manipulation, { kind: 'ruler-measure' }>[] = [];
  for (const l of 차시들) for (const lv of 수준들) {
    for (const q of 조작문항들(l, lv, 12)) if (q.manipulate?.kind === 'ruler-measure') 자문항.push(q.manipulate);
  }

  it('자 문항이 있습니다', () => {
    expect(자문항.length).toBeGreaterThan(10);
  });

  it('처음 자리·바른 자리·끌 수 있는 끝 자리 모두에서 자가 판 안에 들어옵니다', () => {
    for (const m of 자문항) {
      const 판 = 자로재기판(m);
      const 바른 = (정답모습(m) as { rulerAt: number }).rulerAt;
      for (const at of [판.처음자리, 바른, 판.끌왼, 판.끌오른]) {
        const [왼끝, 오른끝] = 판.자끝(at);
        expect(왼끝, `${m.item} at=${at}`).toBeGreaterThanOrEqual(0);
        expect(오른끝, `${m.item} at=${at}`).toBeLessThanOrEqual(판.판폭);
      }
      expect(판.끌왼).toBeLessThanOrEqual(바른);
      expect(판.끌오른).toBeGreaterThanOrEqual(바른);
    }
  });
});
