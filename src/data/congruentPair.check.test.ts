import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { lessons5 } from './curriculum5';
import { lessons51 } from './curriculum51';
import { generateQuestions } from './questionFactory';
import { FIGURE_POINTS } from '../components/QuestionVisualGraphic';
import type { Difficulty, Lesson } from '../types';

// ════════════════════════════════════════════════════════════════════
// 합동인 두 도형을 나란히 그릴 때, 돌린 티가 나야 합니다
// ────────────────────────────────────────────────────────────────────
// "두 사각형은 서로 합동입니다. 점 ㄷ의 대응점은 무엇일까요?" 같은
// 문항은 답이 그림에만 있습니다. 글에는 어느 꼭짓점이 어느 꼭짓점과
// 겹치는지가 적혀 있지 않기 때문입니다. 그러니 그림에서 그것을 읽어
// 낼 수 없으면 답을 고를 길이 없습니다.
//
// 실제로 그런 일이 있었습니다. 대응점 문항이 쓰던 사각형은 네 변이
// 1.42, 1.56, 1.57, 1.59로 거의 같아 평행사변형에 가까웠습니다.
// 그런 도형은 가운데를 잡고 반 바퀴 돌려도 처음 모양과 거의
// 포개집니다. 두 도형을 나란히 두면 눈에는 똑같이 생긴 사각형 두
// 개가 보일 뿐이어서, 아이는 화면에서 같은 쪽에 있는 꼭짓점끼리
// 짝지어 버립니다. 지도서 5-2 각론2 12쪽이 "서로 합동인 두 도형이
// 서로 마주 보듯 제시되어 있으므로 대응점, 대응변, 대응각의 위치를
// 혼동하지 않도록 유의한다"고 적어 둔 바로 그 자리입니다.
//
// 그래서 여기서는 도형 자체를 재 봅니다. 가운데를 잡고 반 바퀴 돌린
// 점들이 처음 점들과 얼마나 어긋나는지를, 도형의 지름에 견주어
// 봅니다. 어긋남이 없으면 돌린 티가 나지 않는 도형입니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const all: Lesson[] = [...lessons, ...lessons51, ...lessons5];

// 지름의 몇 곱절만큼 어긋나야 하는가. 문제가 되었던 사각형은 0.034,
// 지금 쓰는 사각형은 0.191입니다. 그 사이에 선을 긋습니다.
const 어긋남한계 = 0.08;

const 반바퀴어긋남 = (points: Array<[number, number]>) => {
  const 가운데x = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const 가운데y = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const 돌린것 = points.map(([x, y]) => [2 * 가운데x - x, 2 * 가운데y - y] as [number, number]);

  let 지름 = 0;
  for (const [ax, ay] of points) {
    for (const [bx, by] of points) 지름 = Math.max(지름, Math.hypot(ax - bx, ay - by));
  }
  if (지름 === 0) return 0;

  // 처음 점마다 '돌린 점들 가운데 가장 가까운 것'까지의 거리를 재고,
  // 그 가운데 가장 큰 것을 씁니다. 하나라도 제자리를 벗어나면 돌린
  // 티가 납니다.
  const 어긋남 = Math.max(
    ...points.map(([x, y]) => Math.min(...돌린것.map(([rx, ry]) => Math.hypot(x - rx, y - ry)))),
  );
  return 어긋남 / 지름;
};

type 그림항목 = { shape?: string; rotate?: number; vertexLabels?: string[] };

// 꼭짓점 이름을 붙인 채로 돌려 놓은 짝만 봅니다. 이름이 없으면
// 어느 꼭짓점인지 물을 수 없고, 돌리지 않았으면 헷갈릴 일도 없습니다.
const 돌려놓은짝인가 = (items: 그림항목[]) => {
  const 이름붙은것 = items.filter((one) => one.vertexLabels?.length);
  if (이름붙은것.length < 2) return null;
  const 도형 = 이름붙은것[0]?.shape;
  if (!도형 || 이름붙은것.some((one) => one.shape !== 도형)) return null;
  if (!이름붙은것.some((one) => (one.rotate ?? 0) % 360 !== 0)) return null;
  return 도형;
};

describe('합동인 두 도형을 나란히 그린 그림', () => {
  it('반 바퀴 돌려 놓았을 때 돌린 티가 나는 도형을 쓴다', () => {
    const 걸린것: string[] = [];

    for (const lesson of all) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const visual = question.visual as
            | { kind?: string; items?: 그림항목[] }
            | undefined;
          if (visual?.kind !== 'figure-set' || !visual.items) continue;

          const 도형 = 돌려놓은짝인가(visual.items);
          if (!도형) continue;

          const points = FIGURE_POINTS[도형];
          if (!points) continue;

          const 어긋남 = 반바퀴어긋남(points);
          if (어긋남 < 어긋남한계) {
            걸린것.push(
              `${lesson.id} (${level}) — ${도형}: 어긋남 ${어긋남.toFixed(3)} < ${어긋남한계}\n  ${question.prompt}`,
            );
          }
        }
      }
    }

    expect(
      [...new Set(걸린것)].slice(0, 10).join('\n'),
      '반 바퀴 돌려도 처음 모양과 포개지는 도형입니다. 아이가 그림에서 대응하는 꼭짓점을 찾아낼 수 없습니다.',
    ).toBe('');
  });
});
