import { describe, expect, it } from 'vitest';
import { 무엇을해볼까_가능성, 고르게 } from './ChanceLab';
import { lessons } from '../data/curriculum';
import { lessons5 } from '../data/curriculum5';
import { lessons51 } from '../data/curriculum51';
import { generateQuestions } from '../data/questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 고르게 만드는 자리가 수학을 어기지 않는지
// ────────────────────────────────────────────────────────────────────
// 이 도움말은 아이에게 "고르게 만든 높이가 이 자료를 대표하는 값"
// 이라고 보여 줍니다. 고르게 만든 높이가 평균이 아니면, 아이는 평균의
// 뜻을 틀리게 배웁니다. 지도서가 "평균의 개념은 수집한 자료의 값을
// 고르게 하여 자료의 대푯값을 정하는 것을 바탕으로 하고 있다"고
// 적어 둔 바로 그 자리입니다.
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

describe('고르게 만드는 자리', () => {
  const 문항들 = 모두();

  it('고르게 만든 높이가 정확히 평균이다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을해볼까_가능성(visual, 문제);
      if (할것?.갈래 !== '고르게만들기') continue;
      const 값들 = 할것.칸들.map((one) => one.value);
      const 평균 = 값들.reduce((s, one) => s + one, 0) / 값들.length;
      const 끝 = 고르게(값들, 1);
      if (끝.some((one) => Math.abs(one - 평균) > 1e-9)) {
        걸린것.push(`${차시}(${수준}) 고르게 만든 높이가 평균이 아님: ${문제}`);
        continue;
      }
      // 옮기기만 한 것이지 없애거나 만들어 낸 것이 아니어야 합니다.
      // 어느 자리에서 보아도 합이 그대로여야 합니다.
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const 지금 = 고르게(값들, t);
        const 합 = 지금.reduce((s, one) => s + one, 0);
        if (Math.abs(합 - 값들.reduce((s, one) => s + one, 0)) > 1e-9) {
          걸린것.push(`${차시}(${수준}) t=${t}에서 합이 달라짐: ${문제}`);
          break;
        }
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('빈칸이 있거나 평균을 묻지 않는 표에는 내놓지 않는다', () => {
    // "평균이 12개일 때 빈칸은?"은 아직 모르는 값이 하나 있어 고르게
    // 만들 수가 없고, "가장 작은 값은?"은 표를 읽는 문항입니다.
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을해볼까_가능성(visual, 문제);
      if (할것?.갈래 !== '고르게만들기') continue;
      if (!/평균|고르게/.test(문제)) 걸린것.push(`${차시}(${수준}) 평균을 묻지 않는데 내놓음: ${문제}`);
      const 칸들 = (visual as unknown as { columns?: Array<{ value: number | null }> }).columns ?? [];
      if (칸들.some((one) => one.value === null || one.value === undefined)) {
        걸린것.push(`${차시}(${수준}) 빈칸이 있는데 내놓음: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('회전판과 주머니는 그림에 있는 칸만 쓴다', () => {
    // 돌려 보는 결과가 그림에 없는 색으로 나오면 안 됩니다.
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 할것 = 무엇을해볼까_가능성(visual, 문제);
      if (할것?.갈래 === '돌려보기') {
        if (할것.판들.some((one) => !one.slices?.length)) {
          걸린것.push(`${차시}(${수준}) 칸이 없는 회전판: ${문제}`);
        }
      }
      if (할것?.갈래 === '꺼내보기') {
        if (할것.주머니들.some((one) => !one.marbles?.length)) {
          걸린것.push(`${차시}(${수준}) 바둑돌이 없는 주머니: ${문제}`);
        }
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('실제로 붙는 문항이 있고, 세 갈래가 모두 쓰인다', () => {
    const 갈래 = new Set<string>();
    let 합 = 0;
    for (const { 문제, visual } of 문항들) {
      const 할것 = 무엇을해볼까_가능성(visual, 문제);
      if (!할것) continue;
      갈래.add(할것.갈래);
      합 += 1;
    }
    expect([...갈래].sort()).toEqual(['고르게만들기', '꺼내보기', '돌려보기']);
    expect(합).toBeGreaterThan(100);
  });
});
