import type { Difficulty, Player, PlayerQuestionState, Question } from './types';

// ════════════════════════════════════════════════════════════════════
// 다음에 무엇을 낼까
// ────────────────────────────────────────────────────────────────────
// 아이가 답을 하나 누를 때마다 정해지는 것들입니다 — 수준을 올릴지
// 내릴지, 틀린 문제를 언제 다시 낼지, 새 문제 차례를 앞당길지.
//
// App.tsx 안에 있었는데, 그러면 화면을 띄우지 않고는 확인할 수가 없습니다.
// 실제로 되돌아온 문제가 새 문제를 굶겨서 아이가 서른 문항 가운데 넉 대만
// 되풀이해 푸는 일이 있었고, 그때까지 아무도 몰랐습니다. 화면 없이 수천
// 번 눌러 볼 수 있는 자리에 두면 그런 것이 드러납니다.
// ════════════════════════════════════════════════════════════════════

// 수준이 오르내리는 규칙입니다.
// 아이를 미리 상·중·하로 나누어 두면 한번 정해진 자리에 갇힙니다.
// 대신 하에서 시작해 잘 풀면 올리고 틀리면 내려서, 그 아이가 지금 풀 수
// 있는 자리를 계속 따라갑니다.
const LEVEL_LADDER: Difficulty[] = ['하', '중', '상'];
const STEP_UP_AFTER = 3;
// 내려갈 때는 두 번 연속 틀려야 합니다. 2학년은 아는 문제도 잘못 누르는
// 일이 있어서, 한 번의 실수로 수준을 내리면 실제 실력보다 아래에 머뭅니다.
const STEP_DOWN_AFTER = 2;

const levelUp = (level: Difficulty): Difficulty =>
  LEVEL_LADDER[Math.min(LEVEL_LADDER.length - 1, LEVEL_LADDER.indexOf(level) + 1)];

const levelDown = (level: Difficulty): Difficulty =>
  LEVEL_LADDER[Math.max(0, LEVEL_LADDER.indexOf(level) - 1)];

// 되돌아온 문제가 있으면 그때 그 수준의 문제집에서, 없으면 지금 수준에서 냅니다.
export const getPlayerQuestion = (banks: Record<Difficulty, Question[]>, state: PlayerQuestionState) => {
  const bank = banks[state.activeRetry?.level ?? state.level];
  return bank[(state.activeRetry?.index ?? state.questionIndex) % bank.length];
};

// 틀린 문제는 세 문제 뒤에 다시 옵니다. 바로 다시 내면 답을 외워서 맞히고,
// 너무 멀면 다시 만나기 전에 수업이 끝납니다.
const RETRY_AFTER = 3;

// 같은 문제는 두 번까지만 나옵니다. 세 번째로 또 틀린다면 그것은 사이를
// 띄워 다시 만나게 해서 될 일이 아닙니다 — 그때 필요한 것은 되풀이가
// 아니라 도움말이고, 그것은 틀린 그 자리에서 이미 보여 주었습니다.
const RETRY_LIMIT = 2;

// 한 문제를 끝내고 다음으로 넘어갈 때의 상태를 만듭니다.
// wasWrong이면 방금 문제를 다시 낼 줄에 넣고, 맞혔으면 넣지 않습니다.
export const advancePlayerState = (
  state: PlayerQuestionState,
  playerCount: number,
  wasWrong: boolean,
): PlayerQuestionState => {
  const answered = state.answered + 1;
  const shown = state.activeRetry ?? { index: state.questionIndex, level: state.level, tries: 1 };
  // 두 번까지만 되돌립니다. 세 번째로 또 틀리면 줄에서 뺍니다.
  const queued = wasWrong && shown.tries < RETRY_LIMIT
    ? [...state.retries, { ...shown, tries: shown.tries + 1, dueAt: answered + RETRY_AFTER }]
    : state.retries;

  // 연속 정답 3번이면 올라가고, 연속 오답 2번이면 내려옵니다.
  // 되돌아온 문제도 똑같이 셈에 넣습니다.
  const streak = wasWrong ? 0 : state.streak + 1;
  const missStreak = wasWrong ? state.missStreak + 1 : 0;
  const level = missStreak >= STEP_DOWN_AFTER
    ? levelDown(state.level)
    : streak >= STEP_UP_AFTER
      ? levelUp(state.level)
      : state.level;
  // 수준이 바뀌면 두 셈 모두 0부터 다시 셉니다.
  const moved = level !== state.level;
  const nextStreak = moved ? 0 : streak;
  const nextMiss = moved ? 0 : missStreak;

  // 낼 때가 된 것 중 가장 오래 기다린 것부터 냅니다.
  //
  // 다만 되돌아온 문제를 잇달아 내지는 않습니다. 되돌아온 문제를 푸는
  // 동안에는 새 문제 차례가 앞으로 가지 않으므로, 줄에 서너 개만 쌓이면
  // 늘 하나는 낼 때가 되어 있어 새 문제가 영영 나오지 않습니다. 실제로
  // 서른 문항 가운데 넉 대만 끝없이 돌고 있었습니다.
  //
  // 한 번 걸러 내면 적어도 두 번에 한 번은 새 문제가 나오고, 차례는
  // 반드시 앞으로 나갑니다.
  const canServeRetry = state.activeRetry === null;
  const dueAt = canServeRetry ? queued.findIndex((item) => item.dueAt <= answered) : -1;
  const servingRetry = dueAt !== -1;
  const nextRetries = servingRetry ? queued.filter((_, at) => at !== dueAt) : queued;

  return {
    // 새 문제를 하나 썼을 때만 새 문제 차례를 앞당깁니다. 방금 푼 것이
    // 되돌아온 문제였다면 새 문제는 아직 하나도 안 썼으므로 그대로 둡니다.
    // (다음에 낼 것이 되돌아온 문제인지와는 상관없습니다. 그걸로 판단하면
    //  방금 푼 새 문제를 나중에 또 내게 됩니다.)
    questionIndex: state.activeRetry !== null
      ? state.questionIndex
      : state.questionIndex + playerCount,
    selected: null,
    correct: null,
    locked: false,
    feedback: 'idle',
    questionStartedAt: Date.now(),
    answered,
    retries: nextRetries,
    activeRetry: servingRetry
      ? { index: queued[dueAt].index, level: queued[dueAt].level, tries: queued[dueAt].tries }
      : null,
    level,
    streak: nextStreak,
    missStreak: nextMiss,
  };
};


export const createQuestionState = (players: Player[], now = Date.now()): Record<number, PlayerQuestionState> =>
  Object.fromEntries(
    players.map((player, index) => [
      player.id,
      {
        questionIndex: index * 4,
        selected: null,
        correct: null,
        locked: false,
        feedback: 'idle',
        questionStartedAt: now,
        answered: 0,
        retries: [],
        activeRetry: null,
        // 모두 하에서 시작합니다. 어디까지 갈 수 있는지는 풀면서 정해집니다.
        level: '하',
        streak: 0,
        missStreak: 0,
      },
    ]),
  );


// 아이 한 명의 처음 상태입니다. 검사에서 한 아이만 두고 볼 때 씁니다.
export const createInitialPlayerState = (startAt = 0, now = 0): PlayerQuestionState => ({
  questionIndex: startAt,
  selected: null,
  correct: null,
  locked: false,
  feedback: 'idle',
  questionStartedAt: now,
  answered: 0,
  retries: [],
  activeRetry: null,
  level: '하',
  streak: 0,
  missStreak: 0,
});
