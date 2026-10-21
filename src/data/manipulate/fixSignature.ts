import type { ManipState } from './check';

// ════════════════════════════════════════════════════════════════════
// 친구의 틀린 조작을 바르게 고치는 데 필요한 '움직임'을 한 줄 글로 나타냅니다.
// ────────────────────────────────────────────────────────────────────
// 수는 (바른 값 − 친구 값)으로, 수의 목록은 자리마다의 차로, 칸을 고르는 목록은
// 더할 칸과 뺄 칸으로 적습니다. 두 문항의 움직임 글이 같으면 아이는 문제를
// 읽지 않고 같은 손놀림으로 둘 다 고칠 수 있습니다(검사가 씁니다).
// ════════════════════════════════════════════════════════════════════

const 차 = (바른: unknown, 친구: unknown): unknown => {
  if (typeof 바른 === 'number' && typeof 친구 === 'number') return Math.round((바른 - 친구) * 1000) / 1000;
  if (Array.isArray(바른) && Array.isArray(친구)) {
    if (바른.every((x) => typeof x === 'number') && 친구.every((x) => typeof x === 'number')) {
      if (바른.length === 친구.length) return 바른.map((x, k) => 차(x, 친구[k]));
      // 고른 칸의 목록: 더할 칸 수와 뺄 칸 수만 봅니다(어느 칸인지는 문항마다 다름).
      const 더 = 바른.filter((x) => !친구.includes(x)).length;
      const 뺄 = 친구.filter((x) => !바른.includes(x)).length;
      return `+${더}-${뺄}`;
    }
    // 선분을 빠뜨렸거나 더 그은 그림: 어느 선분인지까지 적습니다(문항마다 다른 선분이면 다른 움직임입니다).
    if (바른.length !== 친구.length) {
      const 글 = (x: unknown) => JSON.stringify(x);
      const 친구글 = new Set(친구.map(글));
      const 바른글 = new Set(바른.map(글));
      return `길이${바른.length - 친구.length}:${바른.filter((x) => !친구글.has(글(x))).map(글).join('|')}/${친구.filter((x) => !바른글.has(글(x))).map(글).join('|')}`;
    }
    return 바른.map((x, k) => 차(x, 친구[k]));
  }
  if (바른 && 친구 && typeof 바른 === 'object' && typeof 친구 === 'object') {
    const 열쇠들 = [...new Set([...Object.keys(바른), ...Object.keys(친구)])].sort();
    return Object.fromEntries(열쇠들.map((k) => [k, 차((바른 as Record<string, unknown>)[k], (친구 as Record<string, unknown>)[k])]));
  }
  return 바른 === 친구 ? '=' : '≠';
};

export const 고칠움직임 = (바른: ManipState, 친구: ManipState): string => JSON.stringify(차(바른, 친구));
