import { describe, expect, it } from 'vitest';
import { advancePlayerState, createInitialPlayerState } from '../playerState';

// ════════════════════════════════════════════════════════════════════
// 새 문제는 계속 나와야 합니다
// ────────────────────────────────────────────────────────────────────
// 틀린 문제는 세 문제 뒤에 다시 옵니다. 다시 만나는 것은 좋은 일이지만,
// 되돌아온 문제를 푸는 동안에는 새 문제 차례가 앞으로 가지 않습니다.
//
// 그래서 이런 일이 있었습니다. 몇 개를 틀려 줄에 서너 개가 쌓이면 언제나
// 하나는 낼 때가 되어 있고, 그러면 되돌아온 문제만 끝없이 나옵니다.
// 실제로 서른 문항짜리 차시에서 아이가 네 문제만 되풀이해 풀고 있었습니다:
//   1 → 2 → 3 → 4 → 1 → 5 → 6 → 4 → 1 → 5 → 6 → 4 → …
//
// 여기서는 아무리 많이 틀려도 새 문제가 계속 나오는지를 봅니다.
// ════════════════════════════════════════════════════════════════════

// 아이 한 명이 문제를 푸는 것을 흉내 냅니다. wrongAt(n)이 참이면 n번째를
// 틀린 것으로 칩니다.
const play = (turns: number, wrongAt: (turn: number) => boolean) => {
  let state = createInitialPlayerState(0);
  const shown: number[] = [];

  for (let turn = 0; turn < turns; turn += 1) {
    shown.push(state.activeRetry?.index ?? state.questionIndex);
    state = advancePlayerState(state, 1, wrongAt(turn));
  }

  return shown;
};

describe('the child keeps getting new questions', () => {
  it('does not run out of new questions when almost everything is wrong', () => {
    // 넷 중 셋을 틀립니다. 예전에는 이럴 때 네 문제만 돌았습니다.
    const shown = play(40, (turn) => turn % 4 !== 0);
    const fresh = new Set(shown);

    expect(fresh.size, `40번 푸는 동안 만난 문제가 ${fresh.size}가지뿐: ${shown.join(',')}`)
      .toBeGreaterThanOrEqual(15);
  });

  it('does not run out even when every single answer is wrong', () => {
    const shown = play(40, () => true);
    const fresh = new Set(shown);

    expect(fresh.size, `${shown.join(',')}`).toBeGreaterThanOrEqual(15);
  });

  it('never shows two returning questions in a row', () => {
    // 되돌아온 문제가 잇달아 나오면 그동안 새 문제 차례가 멈춰 섭니다.
    let state = createInitialPlayerState(0);
    let previousWasRetry = false;
    const doubled: string[] = [];

    for (let turn = 0; turn < 60; turn += 1) {
      const isRetry = state.activeRetry !== null;
      if (isRetry && previousWasRetry) doubled.push(`${turn}번째`);
      previousWasRetry = isRetry;
      state = advancePlayerState(state, 1, turn % 3 !== 0);
    }

    expect(doubled).toEqual([]);
  });

  it('brings a question back at most once', () => {
    // 두 번 만나고도 틀렸다면 사이를 띄워 또 내밀 일이 아닙니다.
    let state = createInitialPlayerState(0);
    const timesShown = new Map<number, number>();

    for (let turn = 0; turn < 60; turn += 1) {
      const at = state.activeRetry?.index ?? state.questionIndex;
      timesShown.set(at, (timesShown.get(at) ?? 0) + 1);
      state = advancePlayerState(state, 1, true);
    }

    const tooOften = [...timesShown.entries()].filter(([, times]) => times > 2);
    expect(tooOften.map(([at, times]) => `${at}번 문제가 ${times}번`)).toEqual([]);
  });

  it('moves the new-question mark forward every time a new question is answered', () => {
    // 되돌아온 문제를 푼 뒤에는 차례가 그대로여야 합니다. 앞당기면 방금
    // 건너뛴 새 문제를 영영 만나지 못합니다.
    let state = createInitialPlayerState(0);

    for (let turn = 0; turn < 30; turn += 1) {
      const wasRetry = state.activeRetry !== null;
      const before = state.questionIndex;
      state = advancePlayerState(state, 1, turn % 2 === 0);

      if (wasRetry) {
        expect(state.questionIndex, `${turn}번째`).toBe(before);
      } else {
        expect(state.questionIndex, `${turn}번째`).toBe(before + 1);
      }
    }
  });
});
