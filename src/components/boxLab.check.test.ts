import { describe, expect, it } from 'vitest';
import { 무엇을접어볼까, 접은면들 } from './BoxLab';
import { lessons } from '../data/curriculum';
import { lessons5 } from '../data/curriculum5';
import { lessons51 } from '../data/curriculum51';
import { generateQuestions } from '../data/questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 접어 보는 자리가 수학을 어기지 않는지
// ────────────────────────────────────────────────────────────────────
// 이 도움말은 아이에게 "이렇게 접으면 상자가 됩니다"라고 보여 줍니다.
// 그 접기가 틀리면, 아이는 전개도와 입체 사이의 관계를 틀리게
// 배웁니다. 이 단원에서 가장 크게 잃는 것이 그것입니다.
//
// 그래서 다 접은 자리(t = 1)의 여섯 면을 실제로 재어 봅니다.
// ════════════════════════════════════════════════════════════════════

type 점3 = [number, number, number];

const 거리 = (a: 점3, b: 점3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** 세 변의 길이로 직육면체인지 봅니다(모든 꼭짓점이 상자의 모서리 위). */
const 상자인가 = (면들: 점3[][]) => {
  const 모든점 = 면들.flat();
  const xs = 모든점.map((p) => p[0]);
  const ys = 모든점.map((p) => p[1]);
  const zs = 모든점.map((p) => p[2]);
  const 가로 = Math.max(...xs) - Math.min(...xs);
  const 세로 = Math.max(...ys) - Math.min(...ys);
  const 높이 = Math.max(...zs) - Math.min(...zs);
  return { 가로, 세로, 높이 };
};

const 모든전개도문항 = () => {
  const 나온것: Array<{ 차시: string; 수준: Difficulty; 문제: string; visual: QuestionVisual }> = [];
  for (const lesson of [...lessons, ...lessons51, ...lessons5]) {
    for (const level of ['하', '중', '상'] as Difficulty[]) {
      for (const q of generateQuestions(lesson, level)) {
        const 할것 = q.visual && 무엇을접어볼까(q.visual, q.prompt);
        if (할것?.갈래 === '전개도접기') {
          나온것.push({ 차시: lesson.id, 수준: level, 문제: q.prompt, visual: q.visual as QuestionVisual });
        }
      }
    }
  }
  return 나온것;
};

describe('전개도를 접는 자리', () => {
  const 문항들 = 모든전개도문항();

  it('실제로 붙는 문항이 있다', () => {
    expect(문항들.length).toBeGreaterThan(100);
  });

  it('접는 동안 면의 모양과 크기가 달라지지 않는다', () => {
    // 접기는 종이를 구부리는 것이지 늘이는 것이 아닙니다. 네 변의
    // 길이가 그대로여야 합니다.
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 평면 = 접은면들(visual, 0);
      const 접힌 = 접은면들(visual, 1);
      if (평면.length !== 접힌.length) {
        걸린것.push(`${차시}(${수준}) 면의 개수가 달라짐: ${문제}`);
        continue;
      }
      평면.forEach((면, at) => {
        for (let i = 0; i < 4; i += 1) {
          const 처음 = 거리(면[i], 면[(i + 1) % 4]);
          const 나중 = 거리(접힌[at][i], 접힌[at][(i + 1) % 4]);
          if (Math.abs(처음 - 나중) > 1e-6) {
            걸린것.push(`${차시}(${수준}) 면 ${at}의 변 길이가 ${처음.toFixed(3)} → ${나중.toFixed(3)}: ${문제}`);
          }
        }
      });
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('여섯 면짜리 전개도는 다 접으면 빈틈 없는 직육면체가 된다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 면 = (visual as unknown as { cells: unknown[] }).cells;
      if (면.length !== 6) continue;
      // 여섯 면이어도 붙는 자리가 어긋나 상자가 안 되는 전개도가
      // 문항에 일부러 들어 있습니다("만들 수 있을까요?"). 그런 것은
      // 접히지 않는 것이 맞으므로 여기서는 보지 않습니다.
      if (문제.includes('만들 수 있을까요')) continue;

      const 접힌 = 접은면들(visual, 1);
      const { 가로, 세로, 높이 } = 상자인가(접힌);

      // 여섯 면의 넓이의 합이 상자의 겉넓이와 같아야 합니다. 빈 곳이
      // 있거나 두 면이 겹치면 여기서 어긋납니다.
      const 면넓이합 = 접힌.reduce((s, 면) => s + 거리(면[0], 면[1]) * 거리(면[1], 면[2]), 0);
      const 겉넓이 = 2 * (가로 * 세로 + 세로 * 높이 + 높이 * 가로);
      if (Math.abs(면넓이합 - 겉넓이) > 1e-6) {
        걸린것.push(
          `${차시}(${수준}) 겉넓이가 맞지 않음 (면의 합 ${면넓이합.toFixed(2)} ≠ ${겉넓이.toFixed(2)}): ${문제}`,
        );
        continue;
      }
      // 세 변이 모두 0보다 커야 진짜 입체입니다(납작하게 접히면 안 됩니다).
      if (가로 < 1e-6 || 세로 < 1e-6 || 높이 < 1e-6) {
        걸린것.push(`${차시}(${수준}) 납작하게 접힘 (${가로}, ${세로}, ${높이}): ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('모든 면이 상자의 겉면 위에 놓인다', () => {
    // 겉넓이가 맞아도 면 하나가 엉뚱한 자리에 가 있을 수 있습니다.
    // 꼭짓점이 모두 상자의 바깥 껍질 위에 있는지 봅니다.
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      const 면 = (visual as unknown as { cells: unknown[] }).cells;
      if (면.length !== 6 || 문제.includes('만들 수 있을까요')) continue;
      const 접힌 = 접은면들(visual, 1);
      const { 가로, 세로, 높이 } = 상자인가(접힌);
      const 모든점 = 접힌.flat();
      const 최소 = [0, 1, 2].map((i) => Math.min(...모든점.map((p) => p[i])));
      const 크기 = [가로, 세로, 높이];
      const 껍질밖 = 모든점.some((p) =>
        [0, 1, 2].every((i) => {
          const 값 = p[i] - 최소[i];
          return 값 > 1e-6 && 값 < 크기[i] - 1e-6;
        }),
      );
      if (껍질밖) 걸린것.push(`${차시}(${수준}) 상자 속으로 들어간 꼭짓점이 있음: ${문제}`);
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });
});

describe('겨냥도를 돌리는 자리', () => {
  it('말을 묻는 문항에는 돌려 보라고 하지 않는다', () => {
    // "직사각형 6개로 둘러싸인 도형을 무엇이라고 할까요?"를 푸는
    // 아이에게 상자를 돌려 보라고 하는 것은 도움이 아니라 딴 길입니다.
    const 걸린것: string[] = [];
    for (const lesson of [...lessons, ...lessons51, ...lessons5]) {
      for (const level of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, level)) {
          if (!q.visual) continue;
          const 할것 = 무엇을접어볼까(q.visual, q.prompt);
          if (할것?.갈래 !== '겨냥도돌리기') continue;
          const 그림 = q.visual as unknown as {
            labelVertices?: boolean;
            shaded?: unknown[];
            shaded2?: unknown[];
            edgeLabels?: unknown;
          };
          const 표시있음 = Boolean(그림.labelVertices || 그림.shaded?.length || 그림.shaded2?.length || 그림.edgeLabels);
          if (표시있음) continue;
          if (/몇 개|몇 쌍|몇 군데/.test(q.prompt)) continue;
          걸린것.push(`${lesson.id}(${level}) ${q.prompt}`);
        }
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('잘못 그린 겨냥도는 돌리지 않는다', () => {
    // 일부러 틀리게 그린 그림을 3차원으로 되돌려 놓으면 무엇이
    // 잘못인지가 사라져 문제가 못 쓰게 됩니다.
    const 걸린것: string[] = [];
    for (const lesson of lessons5) {
      for (const level of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, level)) {
          const 흠 = (q.visual as unknown as { flaw?: string } | undefined)?.flaw;
          if (흠 && 무엇을접어볼까(q.visual, q.prompt)) 걸린것.push(`${lesson.id}(${level}) ${흠}: ${q.prompt}`);
        }
      }
    }
    expect([...new Set(걸린것)].join('\n')).toBe('');
  });

  it('세는 문항과 색칠한 문항에는 실제로 붙는다', () => {
    let 붙은것 = 0;
    for (const lesson of lessons5) {
      for (const level of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, level)) {
          if (무엇을접어볼까(q.visual, q.prompt)?.갈래 === '겨냥도돌리기') 붙은것 += 1;
        }
      }
    }
    expect(붙은것).toBeGreaterThan(100);
  });
});
