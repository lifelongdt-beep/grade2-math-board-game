import { describe, expect, it } from 'vitest';
import { 무엇을해볼까 } from './SymmetryLab';
import { FIGURE_POINTS } from './QuestionVisualGraphic';
import { lessons5 } from '../data/curriculum5';
import { lessons51 } from '../data/curriculum51';
import { generateQuestions } from '../data/questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 접어 보는 자리가 수학을 어기지 않는지
// ────────────────────────────────────────────────────────────────────
// 이 도움말은 아이에게 '이 선으로 접으면 겹칩니다'라고 말합니다.
// 그 말이 틀리면 오개념을 심는 쪽이 되므로, 도형마다 대칭축이 실제로
// 몇 개인지를 여기서 못박아 둡니다.
// ════════════════════════════════════════════════════════════════════

type 점 = [number, number];

const 가운데 = (pts: 점[]): 점 => [
  pts.reduce((s, [x]) => s + x, 0) / pts.length,
  pts.reduce((s, [, y]) => s + y, 0) / pts.length,
];

// SymmetryLab의 판정과 똑같은 셈입니다. 여기서 도형마다 답을 셉니다.
const 접히는가 = (pts: 점[], 라디안: number, 중심: 점): boolean => {
  const nx = Math.cos(라디안);
  const ny = Math.sin(라디안);
  const 비춘것 = pts.map(([x, y]) => {
    const d = (x - 중심[0]) * nx + (y - 중심[1]) * ny;
    return [x - 2 * d * nx, y - 2 * d * ny] as 점;
  });
  let 큰것 = 0;
  for (const [ax, ay] of pts) {
    for (const [bx, by] of pts) 큰것 = Math.max(큰것, Math.hypot(ax - bx, ay - by));
  }
  const 봐주기 = Math.max(0.02, 큰것 * 0.035);
  return 비춘것.every(([x, y]) => pts.some(([px, py]) => Math.hypot(x - px, y - py) < 봐주기));
};

/** 1도씩 돌려 보며 서로 다른 대칭축이 몇 개인지 셉니다. */
const 축개수 = (shape: string): number => {
  const pts = FIGURE_POINTS[shape] as 점[];
  const 중심 = 가운데(pts);
  const 찾음: number[] = [];
  for (let 각 = 0; 각 < 180; 각 += 1) {
    if (!접히는가(pts, (각 * Math.PI) / 180, 중심)) continue;
    const 겹침 = 찾음.some((one) => {
      const 차 = Math.abs(((one - 각) % 180 + 180) % 180);
      return Math.min(차, 180 - 차) < 7;
    });
    if (!겹침) 찾음.push(각);
  }
  return 찾음.length;
};

describe('접어 보는 자리', () => {
  // 지도서 5-2 각론2 246쪽이 대칭축의 개수를 직접 적어 두었습니다.
  it('도형마다 대칭축의 개수를 바르게 센다', () => {
    expect(축개수('정삼각형')).toBe(3);
    expect(축개수('정사각형')).toBe(4);
    expect(축개수('정오각형')).toBe(5);
    expect(축개수('정육각형')).toBe(6);
    expect(축개수('이등변삼각형')).toBe(1);
    expect(축개수('마름모')).toBe(2);
    expect(축개수('직사각형')).toBe(2);
    // 평행사변형은 선대칭도형이 아닙니다 — 점대칭도형입니다.
    // 여기서 1이 나오면 아이에게 거짓을 가르치게 됩니다.
    expect(축개수('평행사변형')).toBe(0);
    // 아무 조건 없는 사각형과 일반 삼각형도 접히는 선이 없습니다.
    expect(축개수('사각형')).toBe(0);
    expect(축개수('직각삼각형')).toBe(0);
    expect(축개수('둔각삼각형')).toBe(0);
  });

  it('사다리꼴은 대칭축이 없다', () => {
    // 지금 쓰는 사다리꼴은 두 밑변의 길이가 다르고 옆변도 서로 달라,
    // 접어 겹치는 선이 없습니다. 만약 좌우 대칭인 사다리꼴로 바꾸면
    // 이 시험이 알려 줍니다.
    expect(축개수('사다리꼴')).toBe(0);
  });

  it('돌려 놓은 합동 짝이 있는 그림에서만 포개기를 내놓는다', () => {
    const 포개기 = 무엇을해볼까({
      kind: 'figure-set',
      label: '',
      items: [
        { shape: '사각형', vertexLabels: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'] },
        { shape: '사각형', vertexLabels: ['ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'], rotate: 180 },
      ],
    } as unknown as QuestionVisual);
    expect(포개기?.갈래).toBe('포개기');

    // 모양이 서로 다른 도형을 늘어놓은 '무엇을 찾으면?' 문항은
    // 포갤 것이 없습니다.
    const 아님 = 무엇을해볼까({
      kind: 'figure-set',
      label: '',
      items: [{ shape: '정삼각형' }, { shape: '이등변삼각형' }, { shape: '직각삼각형' }, { shape: '정사각형' }],
    } as unknown as QuestionVisual);
    expect(아님).toBeNull();
  });

  it('5학년 문항에서 그림이 없는 것에는 아무것도 내놓지 않는다', () => {
    let 실험붙은것 = 0;
    for (const lesson of [...lessons51, ...lessons5]) {
      for (const level of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, level)) {
          if (!q.visual) {
            expect(무엇을해볼까(q.visual as unknown as QuestionVisual)).toBeNull();
            continue;
          }
          if (무엇을해볼까(q.visual)) 실험붙은것 += 1;
        }
      }
    }
    // 실제로 붙는 곳이 있어야 이 도움말이 일을 하는 것입니다.
    expect(실험붙은것).toBeGreaterThan(100);
  });
});
