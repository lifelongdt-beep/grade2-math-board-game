// ════════════════════════════════════════════════════════════════════
// 친구와 겨루는 판
// ────────────────────────────────────────────────────────────────────
// 전자칠판에서 둘 이상이 단원 놀이를 하면 컴퓨터 라이벌 대신 같이 하는 친구들과
// 겨룹니다. 수업 내내 맞힌 개수로만 견주면 처음에 앞선 아이가 끝까지 이기므로,
// 짧은 판을 여러 번 합니다. 누군가 이번 판에서 먼저 결승 점수(5점이나 10점)를 내면
// 그 아이가 판을 이기고(👑), 모두 0점에서 새 판을 시작합니다. 한 번 뒤처져도
// 다음 판에서 다시 이길 수 있습니다.
//
// 순위는 이긴 판 수가 먼저이고, 같으면 이번 판 점수, 그래도 같으면 맞힌 개수로
// 정합니다. 모두 같으면 같은 등수입니다.
// ════════════════════════════════════════════════════════════════════

export interface 친구판 {
  /** 이번 판을 시작할 때 저마다 맞힌 개수입니다. */
  출발: Record<number, number>;
  /** 저마다 이긴 판 수입니다. */
  승: Record<number, number>;
  /** 끝난 판 수입니다. */
  판: number;
  /** 바로 앞 판을 이긴 아이들입니다(같이 결승에 닿으면 여럿입니다). */
  승자: number[];
}

export const 새친구판 = (): 친구판 => ({ 출발: {}, 승: {}, 판: 0, 승자: [] });

/** 이번 판에서 낸 점수입니다. */
export const 판점수 = (판: 친구판, 맞힘: Record<number, number>, id: number) =>
  Math.max(0, (맞힘[id] ?? 0) - (판.출발[id] ?? 0));

/** 누군가 결승 점수에 닿았으면 판을 넘기고, 아니면 그대로 돌려줍니다. */
export function 판넘기기(판: 친구판, ids: number[], 맞힘: Record<number, number>, 결승: number): 친구판 {
  const 승자 = ids.filter((id) => 판점수(판, 맞힘, id) >= 결승);
  if (승자.length === 0) return 판;
  return {
    출발: Object.fromEntries(ids.map((id) => [id, 맞힘[id] ?? 0])),
    승: Object.fromEntries(ids.map((id) => [id, (판.승[id] ?? 0) + (승자.includes(id) ? 1 : 0)])),
    판: 판.판 + 1,
    승자,
  };
}

/** 저마다의 등수(1부터)입니다. 견줄 거리가 모두 같으면 같은 등수를 줍니다. */
export function 순위매기기(판: 친구판, ids: number[], 맞힘: Record<number, number>): Record<number, number> {
  const 값 = (id: number) => [판.승[id] ?? 0, 판점수(판, 맞힘, id), 맞힘[id] ?? 0];
  const 앞서나 = (a: number, b: number) => {
    const [x, y] = [값(a), 값(b)];
    for (let at = 0; at < x.length; at += 1) if (x[at] !== y[at]) return x[at] > y[at];
    return false;
  };
  return Object.fromEntries(ids.map((id) => [id, 1 + ids.filter((other) => 앞서나(other, id)).length]));
}

export const 등수표시 = (등수: number) => (['🥇', '🥈', '🥉'][등수 - 1] ?? `${등수}등`);
