import { describe, expect, it } from 'vitest';
import { fold, meetingPoints, overlappingSegment, oppositeCells } from './box';
import { CUBE_NETS, CUBE_NOT_NETS, boxNetLayouts, brokenBoxNet } from './nets';

// ════════════════════════════════════════════════════════════════════
// 접기가 맞는지 지도서에 적힌 답으로 맞춰 봅니다
// ════════════════════════════════════════════════════════════════════

describe('전개도를 접으면', () => {
  it('적어 둔 열한 가지는 모두 정육면체가 된다', () => {
    for (const net of CUBE_NETS) {
      const folded = fold(net);
      expect(folded.reason).toBe(null);
      expect(folded.makesBox).toBe(true);
    }
  });

  it('적어 둔 열한 가지는 서로 다른 모양이다', () => {
    const seen = new Set(CUBE_NETS.map((net) => canonical(net.cells.map((one) => [one.col, one.row]))));
    expect(seen.size).toBe(11);
  });

  // 지도서 이론적 배경: "정육면체의 전개도는 모서리를 자르는 방법에 따라
  // 다음과 같이 모두 11가지 모양이 있다."
  //
  // 여섯 칸짜리 모양을 하나도 빠짐없이 만들어 접어 보고, 정육면체가 되는
  // 것만 남겨 돌리고 뒤집어 같은 것을 하나로 셉니다. 그 수가 11이어야
  // 하고, 그 열하나가 위에 적어 둔 열하나와 같아야 합니다.
  it('정육면체의 전개도는 모두 11가지이고, 적어 둔 것이 그 열하나이다', () => {
    const found: string[] = [];
    const spots: Array<[number, number]> = [];
    const grid = 5;
    for (let row = 0; row < grid; row += 1) for (let col = 0; col < grid; col += 1) spots.push([col, row]);

    const walk = (start: number, picked: Array<[number, number]>) => {
      if (picked.length === 6) {
        if (!connected(picked)) return;
        const cells = picked.map(([col, row]) => ({ col, row }));
        if (!fold({ cols: Array(grid).fill(1), rows: Array(grid).fill(1), cells }).makesBox) return;
        const key = canonical(picked);
        if (!found.includes(key)) found.push(key);
        return;
      }
      for (let at = start; at < spots.length; at += 1) walk(at + 1, [...picked, spots[at]]);
    };
    walk(0, []);

    expect(found.length).toBe(11);
    expect([...found].sort()).toEqual(CUBE_NETS.map((net) => canonical(net.cells.map((one) => [one.col, one.row]))).sort());
  });

  it('될 수 없다고 적어 둔 것은 정말 되지 않고, 까닭까지 말한다', () => {
    for (const net of CUBE_NOT_NETS) {
      const folded = fold(net);
      expect(folded.makesBox).toBe(false);
      expect(folded.reason).toBeTruthy();
    }
    // 다섯 칸짜리는 '면이 6개가 아니다', 여섯 칸짜리는 '겹치는 면이 있다'
    expect(fold(CUBE_NOT_NETS[0]).reason).toBe('접었을 때 겹치는 면이 있습니다.');
    expect(fold(CUBE_NOT_NETS[4]).reason).toBe('면이 6개가 아니라 5개입니다.');
  });

  // 지도서 7차시: "모서리를 자른 부분은 몇 군데인가요? — 7군데",
  // "잘리지 않은 모서리가 5군데 있습니다."
  it('잘린 모서리는 7군데, 잘리지 않은 모서리는 5군데이다', () => {
    for (const net of CUBE_NETS) {
      const folded = fold(net);
      // 바깥 테두리 열넷이 잘린 모서리 일곱을 둘씩 나누어 가집니다.
      expect(folded.border.length).toBe(14);
      const cut = new Set(folded.border.map((one) => [one.at[0].join(','), one.at[1].join(',')].sort().join('|')));
      expect(cut.size).toBe(7);
      expect(12 - cut.size).toBe(5);
    }
  });

  // 지도서 6차시 활동 1: 전개도의 꼭짓점에 ㄱ부터 ㅎ까지 열넷을 붙입니다.
  it('전개도의 꼭짓점은 열넷이고, 접으면 여덟 자리로 모인다', () => {
    for (const net of CUBE_NETS) {
      const folded = fold(net);
      expect(folded.points.length).toBe(14);
      expect(new Set(folded.points.map((one) => one.at.join(','))).size).toBe(8);
    }
  });

  it('겹치는 선분은 늘 하나씩 짝이 있다', () => {
    for (const net of CUBE_NETS) {
      const folded = fold(net);
      for (const edge of folded.border) {
        expect(overlappingSegment(folded, edge.from, edge.to)).toBeTruthy();
      }
    }
  });

  it('만나는 점이 있는 꼭짓점이 있고, 저와 만난다고 하지 않는다', () => {
    for (const net of CUBE_NETS) {
      const folded = fold(net);
      const twos = folded.points.filter((one) => meetingPoints(folded, one.name).length === 1);
      expect(twos.length).toBeGreaterThan(0);
      for (const point of folded.points) {
        expect(meetingPoints(folded, point.name)).not.toContain(point.name);
      }
    }
  });

  it('마주 보는 면은 세 쌍이다', () => {
    for (const net of [...CUBE_NETS, ...boxNetLayouts({ width: 5, depth: 3, height: 7 })]) {
      expect(oppositeCells(fold(net))).toHaveLength(3);
    }
  });
});

describe('직육면체의 전개도', () => {
  it('적어 둔 것은 모두 직육면체가 된다', () => {
    for (const size of [
      { width: 5, depth: 3, height: 7 },
      { width: 4, depth: 2, height: 3 },
      { width: 6, depth: 6, height: 2 },
    ]) {
      for (const net of boxNetLayouts(size)) {
        expect(fold(net).makesBox).toBe(true);
      }
    }
  });

  it('맞닿는 선분의 길이가 다르면 접어도 상자가 되지 않는다', () => {
    const folded = fold(brokenBoxNet({ width: 5, depth: 3, height: 7 }));
    expect(folded.makesBox).toBe(false);
    expect(folded.reason).toBe('접었을 때 만나는 선분의 길이가 다릅니다.');
  });
});

// ── 시험이 쓰는 도구 ────────────────────────────────────────────────

const connected = (picked: Array<[number, number]>) => {
  const all = new Set(picked.map(([col, row]) => `${col},${row}`));
  const seen = new Set([`${picked[0][0]},${picked[0][1]}`]);
  const queue = [picked[0]];
  while (queue.length) {
    const [col, row] = queue.shift() as [number, number];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${col + dc},${row + dr}`;
      if (all.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push([col + dc, row + dr]);
      }
    }
  }
  return seen.size === picked.length;
};

/** 돌리고 뒤집어 같은 모양은 같은 이름이 되게 합니다. */
const canonical = (picked: Array<[number, number]>) => {
  const shift = (points: Array<[number, number]>) => {
    const minCol = Math.min(...points.map((one) => one[0]));
    const minRow = Math.min(...points.map((one) => one[1]));
    return points
      .map(([col, row]) => [col - minCol, row - minRow] as [number, number])
      .sort((a, b) => a[1] - b[1] || a[0] - b[0])
      .map((one) => one.join(','))
      .join(' ');
  };
  const names: string[] = [];
  let here = picked.map((one) => [...one] as [number, number]);
  for (let flip = 0; flip < 2; flip += 1) {
    for (let turn = 0; turn < 4; turn += 1) {
      names.push(shift(here));
      here = here.map(([col, row]) => [-row, col] as [number, number]);
    }
    here = here.map(([col, row]) => [-col, row] as [number, number]);
  }
  return names.sort()[0];
};
