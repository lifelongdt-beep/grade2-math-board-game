import { describe, expect, it } from 'vitest';
import type { GridPoint, Manipulation } from '../../types';
import { 채점, type ManipState } from './check';
import type { 조작갈래 } from './common';
import { 길이합차긋기 } from './hands3';
import { 고쳐보기 } from './higher';
import { 정답모습 as 바른모습 } from './check';
import { 고칠움직임 as 움직임글 } from './fixSignature';
import { 조작표, 수준갈래들 } from './index';
import { 자로긋기, 자로재기 } from './measure';

// ════════════════════════════════════════════════════════════════════
// 친구의 틀린 조작을 고치는 문항이 한 가지 손놀림으로 다 풀리지 않는지
// ────────────────────────────────────────────────────────────────────
// 친구의 실수가 늘 '오른쪽으로 1 cm'이면 아이는 문제를 읽지 않고
// '왼쪽으로 한 칸'만 옮겨도 모두 맞힙니다. 고치는 데 필요한 움직임(바른
// 자리 − 친구의 자리)이 문항마다 방향과 크기가 고루 달라야 합니다.
// ════════════════════════════════════════════════════════════════════

const 고칠움직임 = (m: Manipulation): string | null => {
  const 친구 = m.friend?.state as ManipState | undefined;
  if (!친구) return null;
  expect(채점(m, 친구).ok).toBe(false);
  if (m.kind === 'ruler-measure' && 친구.kind === 'ruler-measure') return `자 ${m.objectStartMm - 친구.rulerAt}, 눈금 ${m.objectMm - (친구.endTick ?? 0)}`;
  if (m.kind === 'ruler-draw' && 친구.kind === 'ruler-draw') return `끝 ${m.fromMm + m.lengthMm - 친구.end}`;
  if (m.kind === 'shape-move' && 친구.kind === 'shape-move') {
    const 바른: GridPoint = [m.goal.cells[0][0] - 친구.cells[0][0], m.goal.cells[0][1] - 친구.cells[0][1]];
    return `옮김 ${바른[0] - 친구.offset[0]},${바른[1] - 친구.offset[1]}`;
  }
  return null;
};

const 살피기 = (이름: string, 갈래: 조작갈래) => {
  it(`${이름}: 고치는 움직임이 한 가지로 굳지 않습니다`, () => {
    const 고침 = 고쳐보기(갈래);
    const 셈 = new Map<string, number>();
    let 모두 = 0;
    for (let seed = 1; seed <= 300; seed += 1) {
      const t = 고침.make(seed, 2);
      if (!t) continue;
      const k = 고칠움직임(t.manipulate);
      if (!k) continue;
      모두 += 1;
      셈.set(k, (셈.get(k) ?? 0) + 1);
    }
    expect(모두).toBeGreaterThan(100);
    const 가장많은 = Math.max(...셈.values());
    // 한 가지 움직임으로 고쳐지는 문항이 3분의 1을 넘지 않고, 움직임이 여러 가지입니다.
    expect(가장많은 / 모두, [...셈.entries()].join(' | ')).toBeLessThan(1 / 3);
    expect(셈.size).toBeGreaterThanOrEqual(5);
  });
};

describe('친구 실수 고치기의 다양성', () => {
  살피기('자로 재기(cm)', 자로재기('cm', [5, 12], 1));
  살피기('자로 긋기(시작 눈금이 0이 아님)', 자로긋기(false, [3, 6], 2));
  살피기('자로 긋기(0에서 시작)', 자로긋기(true, [2, 8]));
  살피기('두 길이의 합만큼 긋기', 길이합차긋기(false));
  살피기('두 길이의 차만큼 긋기', 길이합차긋기(true));
});

// 모든 학년·차시의 상 수준 '친구 실수 고치기' 문항을 봅니다. 한 가지 움직임(같은 칸 수·같은 방향으로
// 옮기기, 같은 수만큼 더 놓기 등)으로 고쳐지는 문항이 그 갈래의 60%를 넘으면 안 됩니다.
describe('모든 차시의 친구 실수 고치기', () => {
  it('한 가지 움직임으로 고쳐지는 문항이 갈래마다 60%를 넘지 않습니다', () => {
    const 넘친: string[] = [];
    for (const 열쇠 of Object.keys(조작표)) {
      for (const g of 수준갈래들(열쇠, '상')) {
        if (!g.id.startsWith('fix-')) continue;
        const 셈 = new Map<string, number>();
        let 모두 = 0;
        for (let seed = 1; seed <= 200; seed += 1) {
          const t = g.make(seed, 2);
          if (!t?.manipulate.friend) continue;
          모두 += 1;
          const k = 움직임글(바른모습(t.manipulate), t.manipulate.friend.state as ManipState);
          셈.set(k, (셈.get(k) ?? 0) + 1);
        }
        if (모두 < 15) continue;
        const [글, 수] = [...셈.entries()].sort((a, b) => b[1] - a[1])[0];
        if (수 / 모두 > 0.6) 넘친.push(`${열쇠} ${g.id}: ${Math.round((수 / 모두) * 100)}% ${글.slice(0, 80)}`);
      }
    }
    expect(넘친.join("\n")).toBe("");
  }, 120000);
});
