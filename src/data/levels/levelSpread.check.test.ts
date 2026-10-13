import { describe, expect, it } from 'vitest';
import type { Difficulty, Lesson } from '../../types';
import { lessons11 } from '../curriculum11';
import { lessons12 } from '../curriculum12';
import { lessons31 } from '../curriculum31';
import { lessons32 } from '../curriculum32';
import { lessons41 } from '../curriculum41';
import { lessons42 } from '../curriculum42';
import { lessons51 } from '../curriculum51';
import { lessons5 } from '../curriculum5';
import { lessons61 } from '../curriculum61';
import { curriculum62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';

// ════════════════════════════════════════════════════════════════════
// 하·중·상이 생각의 결로 나뉘는지
// ────────────────────────────────────────────────────────────────────
// 하는 단순한 지식, 중은 약간의 고민, 상은 고차적인 사고(과정·까닭,
// 잘못 찾기, 거꾸로, 용어 활용, 생활 응용)를 묻습니다. 문항마다 남긴
// thinkingLevel(0 지식, 1 적용, 2 사고)로 셉니다.
//
// 1·3·4·5·6학년은 처음에 수준을 바꾸어도 같은 결의 문제가 나와, 상의
// 사고형 비율이 0~39%였고 서른 차시 중 사고형이 30%가 안 되는 차시가
// 이백 개쯤 있었습니다. 이 검사는 그 상태로 돌아가지 않게 막습니다.
// ════════════════════════════════════════════════════════════════════

const 학기: Array<[string, Lesson[]]> = [
  ['1-1', lessons11], ['1-2', lessons12], ['3-1', lessons31], ['3-2', lessons32], ['4-1', lessons41], ['4-2', lessons42],
  ['5-1', lessons51], ['5-2', lessons5], ['6-1', lessons61], ['6-2', curriculum62.flatMap((u) => u.lessons)],
];
const 비율 = (lesson: Lesson, lv: Difficulty, 결: 0 | 2) => {
  const qs = generateQuestions(lesson, lv);
  return qs.filter((q) => q.thinkingLevel === 결).length / Math.max(1, qs.length);
};

describe('하·중·상의 생각의 결', () => {
  for (const [이름, 차시들] of 학기) {
    it(`${이름}: 상은 사고형이, 하는 지식형이 많습니다`, () => {
      const 볼차시 = 차시들.filter((l) => l.title !== '단원 도입' && !/몬스터/.test(l.title));
      let 상사고 = 0;
      let 하사고 = 0;
      let 하지식 = 0;
      const 뒤집힘: string[] = [];
      for (const l of 볼차시) {
        const 상 = 비율(l, '상', 2);
        const 하 = 비율(l, '하', 2);
        상사고 += 상;
        하사고 += 하;
        하지식 += 비율(l, '하', 0);
        // 차시마다 상의 사고형이 하보다 적으면 안 됩니다.
        if (상 + 1e-9 < 하) 뒤집힘.push(`${l.id} 상 ${상.toFixed(2)} < 하 ${하.toFixed(2)}`);
      }
      const n = 볼차시.length;
      expect(뒤집힘).toEqual([]);
      expect(상사고 / n, '상의 사고형 비율').toBeGreaterThanOrEqual(0.3);
      expect(하사고 / n, '하의 사고형 비율').toBeLessThanOrEqual(0.2);
      expect(하지식 / n, '하의 지식형 비율').toBeGreaterThanOrEqual(0.45);
    });
  }
});
