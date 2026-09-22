import { describe, expect, it } from 'vitest';
import { 무엇을겹쳐볼까 } from './FractionLab';
import { lessons } from '../data/curriculum';
import { lessons5 } from '../data/curriculum5';
import { lessons51 } from '../data/curriculum51';
import { generateQuestions } from '../data/questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 겹쳐 보는 자리가 문제의 답과 어긋나지 않는지
// ────────────────────────────────────────────────────────────────────
// 지도서 5-2 각론1 단원 개관이 이 단원에서 가장 조심할 것을 적어
// 두었습니다 — "계산 절차만 가르치게 되면 학생은 그렇게 계산하는
// 이유를 이해하지 못하고 계산 과정에서 쉽게 오류를 보일 수 있다."
//
// 그래서 그림으로 보입니다. 그런데 그림이 문제의 식과 어긋나면,
// 절차만 가르치는 것보다 나쁩니다. 그림이 곧 틀린 설명이 됩니다.
// 여기서는 그림이 나타내는 값이 문제가 묻는 곱과 같은지를 봅니다.
// ════════════════════════════════════════════════════════════════════

const 모두 = () => {
  const 나온것: Array<{ 차시: string; 수준: Difficulty; 문제: string; visual: QuestionVisual }> = [];
  for (const lesson of [...lessons, ...lessons51, ...lessons5]) {
    for (const level of ['하', '중', '상'] as Difficulty[]) {
      for (const q of generateQuestions(lesson, level)) {
        if (q.visual) 나온것.push({ 차시: lesson.id, 수준: level, 문제: q.prompt, visual: q.visual });
      }
    }
  }
  return 나온것;
};

/** 문제 글에서 'a/b × c' 같은 두 수를 읽어 곱을 구합니다. */
const 문제의곱 = (문제: string): number | null => {
  const 수 = (글: string): number | null => {
    const 대분수 = 글.match(/^(\d+)\s*(\d+)\/(\d+)$/);
    if (대분수) return Number(대분수[1]) + Number(대분수[2]) / Number(대분수[3]);
    const 분수 = 글.match(/^(\d+)\/(\d+)$/);
    if (분수) return Number(분수[1]) / Number(분수[2]);
    const 자연수 = 글.match(/^(\d+)$/);
    return 자연수 ? Number(자연수[1]) : null;
  };
  const m = 문제.match(/([\d/\s]+?)\s*×\s*([\d/\s]+?)\s*(?:을|를|은|는|이|가|의)?\s*계산/);
  if (!m) return null;
  const a = 수(m[1].trim());
  const b = 수(m[2].trim());
  return a !== null && b !== null ? a * b : null;
};

describe('분수의 곱셈 그림', () => {
  const 문항들 = 모두();

  it('실제로 붙는 문항이 있고, 세 갈래가 모두 쓰인다', () => {
    const 갈래 = new Set<string>();
    let 합 = 0;
    for (const { visual } of 문항들) {
      const 할것 = 무엇을겹쳐볼까(visual);
      if (!할것) continue;
      갈래.add(할것.갈래);
      합 += 1;
    }
    expect([...갈래].sort()).toEqual(['겹쳐보기', '덜어내기', '모아묶기']);
    expect(합).toBeGreaterThan(100);
  });

  // 아래 시험들은 문제 글에서 식을 읽어 그림과 견줍니다. 글을 하나도
  // 못 읽으면 견줄 것이 없어 저절로 통과해 버리므로, 얼마나 읽었는지를
  // 먼저 못박아 둡니다.
  it('문제 글에서 식을 충분히 읽어 낸다', () => {
    let 읽은것 = 0;
    for (const { 문제, visual } of 문항들) {
      if (!무엇을겹쳐볼까(visual)) continue;
      if (문제의곱(문제) !== null) 읽은것 += 1;
    }
    expect(읽은것).toBeGreaterThan(80);
  });

  it('겹친 자리가 문제가 묻는 곱과 같다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을겹쳐볼까(visual);
      if (할것?.갈래 !== '겹쳐보기') continue;
      const g = 할것.그림;
      const 겹친것 = ((g.shadedColumns ?? 1) * (g.shadedRows ?? 1)) / ((g.columns ?? 1) * (g.rows ?? 1));
      const 곱 = 문제의곱(문제);
      if (곱 === null) continue;
      if (Math.abs(겹친것 - 곱) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 그림 ${겹친것} ≠ 식 ${곱}: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('모은 조각의 개수가 문제가 묻는 곱과 같다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을겹쳐볼까(visual);
      if (할것?.갈래 !== '모아묶기') continue;
      const g = 할것.그림;
      const 그림값 = (g.numerator * (g.repeat ?? 1)) / g.denominator;
      const 곱 = 문제의곱(문제);
      if (곱 === null) continue;
      if (Math.abs(그림값 - 곱) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 그림 ${그림값} ≠ 식 ${곱}: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('가져온 묶음이 문제가 묻는 곱과 같다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을겹쳐볼까(visual);
      if (할것?.갈래 !== '덜어내기') continue;
      const g = 할것.그림;
      const 그림값 = ((g.whole ?? g.denominator) * g.numerator) / g.denominator;
      const 곱 = 문제의곱(문제);
      if (곱 === null) continue;
      if (Math.abs(그림값 - 곱) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 그림 ${그림값} ≠ 식 ${곱}: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('진분수끼리 곱한 겹친 자리는 두 분수보다 작다', () => {
    // 지도서가 이름 붙여 경고한 오개념입니다 — "두 진분수를 곱하면
    // 계산 결과는 곱하는 두 분수보다 항상 작게 되는 것". 그림이
    // 그것을 보여 주지 못하면 이 자리를 만든 뜻이 없습니다.
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을겹쳐볼까(visual);
      if (할것?.갈래 !== '겹쳐보기') continue;
      const g = 할것.그림;
      const 가로 = (g.shadedColumns ?? 1) / (g.columns ?? 1);
      const 세로 = (g.shadedRows ?? 1) / (g.rows ?? 1);
      if (가로 >= 1 || 세로 >= 1) continue;
      const 겹친것 = 가로 * 세로;
      if (겹친것 >= 가로 - 1e-12 || 겹친것 >= 세로 - 1e-12) {
        걸린것.push(`${차시}(${수준}) 겹친 것이 작아지지 않음: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });
});
