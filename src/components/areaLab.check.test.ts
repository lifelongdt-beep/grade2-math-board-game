import { describe, expect, it } from 'vitest';
import { 무엇을잘라볼까, 돌리기, 세로로자르기 } from './AreaLab';
import { lessons51 } from '../data/curriculum51';
import { lessons5 } from '../data/curriculum5';
import { lessons } from '../data/curriculum';
import { generateQuestions } from '../data/questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 잘라 옮기는 자리가 수학을 어기지 않는지
// ────────────────────────────────────────────────────────────────────
// 이 도움말은 아이에게 "잘라 옮기면 직사각형이 됩니다", "둘을 붙이면
// 넓이가 두 배입니다"라고 말합니다. 그 말이 그림과 어긋나면 아이는
// 넓이 공식을 '왜'가 아니라 '그냥 그렇다더라'로 배우게 됩니다. 그것이
// 이 단원에서 가장 크게 잃는 것입니다.
//
// 그래서 여기서는 움직임이 다 끝난 자리(t = 1)의 도형을 실제로 재어
// 봅니다. 눈으로 그럴듯해 보이는 것으로는 모자랍니다.
// ════════════════════════════════════════════════════════════════════

type 점 = [number, number];

/** 다각형의 넓이입니다(신발끈 공식). 차례가 거꾸로여도 되게 절댓값을 씁니다. */
const 넓이 = (pts: 점[]): number => {
  let 합 = 0;
  for (let at = 0; at < pts.length; at += 1) {
    const [x1, y1] = pts[at];
    const [x2, y2] = pts[(at + 1) % pts.length];
    합 += x1 * y2 - x2 * y1;
  }
  return Math.abs(합) / 2;
};

const 거리 = (a: 점, b: 점) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const 모든넓이문항 = () => {
  const 나온것: Array<{ 차시: string; 수준: Difficulty; 문제: string; visual: QuestionVisual }> = [];
  for (const lesson of [...lessons, ...lessons51, ...lessons5]) {
    for (const level of ['하', '중', '상'] as Difficulty[]) {
      for (const q of generateQuestions(lesson, level)) {
        if (q.visual && 무엇을잘라볼까(q.visual)) {
          나온것.push({ 차시: lesson.id, 수준: level, 문제: q.prompt, visual: q.visual });
        }
      }
    }
  }
  return 나온것;
};

const 점들 = (visual: QuestionVisual): 점[] =>
  ((visual as unknown as { items: Array<{ points: 점[] }> }).items[0].points);

describe('잘라 옮기는 자리', () => {
  const 문항들 = 모든넓이문항();

  it('실제로 붙는 문항이 있다', () => {
    // 아무 데도 안 붙으면 이 도움말은 없는 것과 같습니다.
    expect(문항들.length).toBeGreaterThan(100);
    const 갈래 = new Set(문항들.map((one) => 무엇을잘라볼까(one.visual)!.갈래));
    expect([...갈래].sort()).toEqual(['마름모감싸기', '사다리꼴두개', '삼각형두개', '평행사변형자르기']);
  });

  it('평행사변형을 잘라 옮기면 빈틈도 겹침도 없는 직사각형이 된다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      if (무엇을잘라볼까(visual)!.갈래 !== '평행사변형자르기') continue;
      const pts = 점들(visual);
      const 자를곳 = pts[0][0];
      const 옮길거리 = pts[1][0] - pts[0][0];
      const 왼조각 = 세로로자르기(pts, 자를곳, true);
      const 남은조각 = 세로로자르기(pts, 자를곳, false);
      const 옮긴조각 = 왼조각.map(([x, y]) => [x + 옮길거리, y] as 점);

      const 두조각넓이 = 넓이(남은조각) + 넓이(옮긴조각);
      const 모두 = [...남은조각, ...옮긴조각];
      const 가로 = Math.max(...모두.map(([x]) => x)) - Math.min(...모두.map(([x]) => x));
      const 세로 = Math.max(...모두.map(([, y]) => y)) - Math.min(...모두.map(([, y]) => y));

      // 자른 두 조각을 합한 넓이가 처음 평행사변형과 같아야 하고,
      // 그것이 둘러싼 직사각형의 넓이와도 같아야 합니다. 같으면 빈틈도
      // 겹침도 없이 직사각형을 꽉 채웠다는 뜻입니다.
      if (Math.abs(두조각넓이 - 넓이(pts)) > 1e-6) 걸린것.push(`${차시}(${수준}) 자른 조각의 합이 원래와 다름: ${문제}`);
      else if (Math.abs(가로 * 세로 - 두조각넓이) > 1e-6) 걸린것.push(`${차시}(${수준}) 직사각형이 되지 않음(빈틈 또는 겹침): ${문제}`);
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('삼각형 두 개를 붙이면 밑변이 그대로인 평행사변형이 된다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      if (무엇을잘라볼까(visual)!.갈래 !== '삼각형두개') continue;
      const pts = 점들(visual);
      // 0 꼭짓점, 1 밑변의 오른쪽 끝, 2 밑변의 왼쪽 끝입니다.
      const M: 점 = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
      const 돈것 = 돌리기(pts, M, Math.PI);

      // 돌린 것이 처음 것과 그 변을 정확히 함께 씁니다.
      if (거리(돈것[0], pts[1]) > 1e-9 || 거리(돈것[1], pts[0]) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 붙이는 변이 맞물리지 않음: ${문제}`);
        continue;
      }
      // 붙여 만든 사각형입니다(꼭짓점 차례: 밑변 왼끝 → 밑변 오른끝 → 돌린 꼭짓점 → 처음 꼭짓점).
      const 붙인것: 점[] = [pts[2], pts[1], 돈것[2], pts[0]];
      if (Math.abs(넓이(붙인것) - 넓이(pts) * 2) > 1e-6) {
        걸린것.push(`${차시}(${수준}) 붙인 넓이가 두 배가 아님: ${문제}`);
        continue;
      }
      // 붙여 만든 평행사변형의 밑변은 삼각형의 밑변 그대로여야 합니다.
      // 다른 변을 잡고 돌리면 여기가 어긋납니다.
      const 삼각밑변 = 거리(pts[1], pts[2]);
      if (Math.abs(거리(붙인것[0], 붙인것[1]) - 삼각밑변) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 붙인 도형의 밑변이 삼각형의 밑변과 다름: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('사다리꼴 두 개를 붙이면 밑변이 윗변+아랫변인 평행사변형이 된다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      if (무엇을잘라볼까(visual)!.갈래 !== '사다리꼴두개') continue;
      const pts = 점들(visual);
      // 0 윗변 왼쪽, 1 윗변 오른쪽, 2 아랫변 오른쪽, 3 아랫변 왼쪽입니다.
      const M: 점 = [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2];
      const 돈것 = 돌리기(pts, M, Math.PI);

      if (거리(돈것[1], pts[2]) > 1e-9 || 거리(돈것[2], pts[1]) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 붙이는 변이 맞물리지 않음: ${문제}`);
        continue;
      }
      const 붙인것: 점[] = [pts[3], pts[0], 돈것[3], 돈것[0]];
      if (Math.abs(넓이(붙인것) - 넓이(pts) * 2) > 1e-6) {
        걸린것.push(`${차시}(${수준}) 붙인 넓이가 두 배가 아님: ${문제}`);
        continue;
      }
      // 지도서 139쪽: "평행사변형의 밑변은 사다리꼴의 윗변과 아랫변의
      // 합과 같고". 이것이 (윗변+아랫변)×높이÷2가 나오는 까닭입니다.
      const 윗변 = 거리(pts[0], pts[1]);
      const 아랫변 = 거리(pts[2], pts[3]);
      // 붙여 만든 평행사변형의 밑변은 '아랫변 왼쪽 끝'에서 '돌린 것의
      // 윗변 왼쪽 끝'까지입니다. 처음에 여기를 돈것[0]과 pts[0] 사이로
      // 재었다가 시험이 틀렸습니다 — 그것은 밑변이 아니라 대각선입니다.
      const 붙인밑변 = 거리(pts[3], 돈것[0]);
      if (Math.abs(붙인밑변 - (윗변 + 아랫변)) > 1e-9) {
        걸린것.push(`${차시}(${수준}) 붙인 밑변 ${붙인밑변.toFixed(4)} ≠ 윗변+아랫변 ${(윗변 + 아랫변).toFixed(4)}: ${문제}`);
      }
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });

  it('마름모의 네 귀퉁이를 돌려 넣으면 마름모를 꼭 덮는다', () => {
    const 걸린것: string[] = [];
    for (const { 차시, 수준, 문제, visual } of 문항들) {
      if (무엇을잘라볼까(visual)!.갈래 !== '마름모감싸기') continue;
      const pts = 점들(visual);
      const 왼 = Math.min(...pts.map(([x]) => x));
      const 오 = Math.max(...pts.map(([x]) => x));
      const 위 = Math.min(...pts.map(([, y]) => y));
      const 아래 = Math.max(...pts.map(([, y]) => y));

      // 지도서 142쪽: "직사각형의 넓이는 마름모의 넓이의 2배입니다."
      if (Math.abs((오 - 왼) * (아래 - 위) - 넓이(pts) * 2) > 1e-6) {
        걸린것.push(`${차시}(${수준}) 둘러싼 직사각형이 두 배가 아님: ${문제}`);
        continue;
      }

      const 귀퉁이 = [
        { 삼각: [pts[0], [오, 위] as 점, pts[1]] as 점[], A: pts[0], B: pts[1] },
        { 삼각: [pts[1], [오, 아래] as 점, pts[2]] as 점[], A: pts[1], B: pts[2] },
        { 삼각: [pts[2], [왼, 아래] as 점, pts[3]] as 점[], A: pts[2], B: pts[3] },
        { 삼각: [pts[3], [왼, 위] as 점, pts[0]] as 점[], A: pts[3], B: pts[0] },
      ];
      // 변을 축으로 '접으면' 안 됩니다. 귀퉁이의 직각 꼭짓점이 마름모의
      // 가운데로 오는 것은 두 대각선의 길이가 같을 때뿐이어서, 다른
      // 마름모에서는 밖으로 삐져나갑니다. 변의 한가운데를 잡고 반 바퀴
      // 돌려야 어떤 마름모에서든 가운데로 옵니다.
      const 접은것 = 귀퉁이.map(({ 삼각, A, B }) =>
        돌리기(삼각, [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], Math.PI));

      // 접은 넷의 넓이를 더하면 마름모와 같아야 합니다.
      const 접은넓이 = 접은것.reduce((s, one) => s + 넓이(one), 0);
      if (Math.abs(접은넓이 - 넓이(pts)) > 1e-6) {
        걸린것.push(`${차시}(${수준}) 돌려 넣은 귀퉁이의 합이 마름모와 다름: ${문제}`);
        continue;
      }

      // 그리고 넷이 모두 마름모 안에 들어와 있어야 합니다. 넓이만 같고
      // 밖으로 삐져나가면 '꼭 덮었다'는 말이 거짓이 됩니다. 마름모는
      // |x|/a + |y|/b <= 1 인 곳입니다(가운데가 0, 0).
      const a = (오 - 왼) / 2;
      const b = (아래 - 위) / 2;
      const cx = (오 + 왼) / 2;
      const cy = (아래 + 위) / 2;
      const 밖에 = 접은것.some((one) =>
        one.some(([x, y]) => Math.abs(x - cx) / a + Math.abs(y - cy) / b > 1 + 1e-9));
      if (밖에) 걸린것.push(`${차시}(${수준}) 돌려 넣은 귀퉁이가 마름모 밖으로 나감: ${문제}`);
    }
    expect([...new Set(걸린것)].slice(0, 5).join('\n')).toBe('');
  });
});
