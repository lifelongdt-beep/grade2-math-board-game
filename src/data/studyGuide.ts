import { demandOfStrategy } from './questionFactory';
import type { AnswerRecord } from '../types';

// ════════════════════════════════════════════════════════════════════
// 무엇을 더 공부하면 좋을까
// ────────────────────────────────────────────────────────────────────
// 수업이 끝난 뒤 아이에게 '7문제 중 4개 맞았어요'라고 말해 주는 것은
// 아이가 이미 아는 것입니다. 문제를 풀 때마다 맞았는지 틀렸는지 보았고,
// 틀린 문제는 그 자리에서 풀이를 읽었습니다.
//
// 끝나고 나서 알 수 있는 것은 하나뿐입니다 — 여러 문제를 지나고 나서야
// 보이는 것. 어떤 갈래를 잘 풀었고 어떤 갈래에서 자꾸 걸렸는가입니다.
// 한 문제만 보면 실수인지 모르는 것인지 알 수 없지만, 같은 갈래에서 세 번
// 걸렸다면 그것은 실수가 아닙니다.
//
// 그래서 여기서는 개수를 세지 않고 갈래를 셉니다.
// ════════════════════════════════════════════════════════════════════

// 문항의 갈래입니다. 전략 이름의 마지막 조각이 '이 문항이 무엇을 묻는가'
// 이고, 앞쪽은 난이도와 평가 층 표시라 아이에게는 뜻이 없습니다.
//   '기초 · 기초 확인 · 받아올림 있는 덧셈 계산하기' → '받아올림 있는 덧셈 계산하기'
const kindOf = (strategy: string) => strategy.split(' · ').slice(-1)[0].trim();

// 무엇을 요구하는 갈래였는지에 따라 공부하는 방법이 다릅니다.
// 계산에서 걸린 아이에게 '문장을 다시 읽어 보라'고 하면 도움이 되지
// 않습니다.
const howToPractise = (strategy: string) => {
  const demand = demandOfStrategy(strategy);
  if (demand === 'reason') {
    return '풀이를 한 줄씩 짚어 가며 "왜 이렇게 했지?"를 소리 내어 말해 보세요. 차례를 알면 다음에는 스스로 세울 수 있어요.';
  }
  if (demand === 'connect') {
    return '문장을 소리 내어 읽고, 무엇을 구하라고 했는지 먼저 찾아 밑줄을 그어 보세요. 식은 그다음에 세우면 됩니다.';
  }
  return '수를 하나씩 세어 보고, 계산은 자리를 맞추어 다시 써 보세요. 천천히 한 번이 빠르게 세 번보다 낫습니다.';
};

// 무엇을 잘했는지 말해 줍니다.
//
// '3번 만나 모두 맞혔어요'는 아이가 이미 아는 것입니다. 화면에서 맞았다고
// 나올 때마다 보았으니까요. 끝나고 나서 해 줄 수 있는 말은 '무엇을 할 줄
// 알게 되었는가'입니다. 그것이 다음에도 쓸 수 있는 말입니다.
const whatWentWell = (strategy: string) => {
  const demand = demandOfStrategy(strategy);
  if (demand === 'reason') {
    return '왜 그렇게 푸는지 차례를 세워서 풀었어요.';
  }
  if (demand === 'connect') {
    return '문장에서 무엇을 구하라고 했는지 찾아 식을 세웠어요.';
  }
  return '수를 빠뜨리지 않고 세고, 자리를 맞추어 계산했어요.';
};

// 되풀이된 실수를 고치는 법입니다.
//
// 아이가 고른 오답에서 이미 무엇을 잘못했는지 읽어 두었습니다
// (choiceMeaning). 그런데 끝나고 나서 주는 말은 갈래별 일반 문장
// 하나뿐이었습니다. 무엇을 틀렸는지 아는데 그 이야기를 하지 않은
// 것입니다.
//
// 실수마다 '무엇이 일어났는지'와 '다음에 어떻게 하는지'를 짝지어
// 둡니다. 두 번 넘게 되풀이된 것만 말합니다 — 한 번은 실수이고
// 두 번부터가 버릇입니다.
const habitFix: Record<string, string> = {
  '문제에 나온 수를 그대로 고름':
    '보기에서 문제에 있던 수가 보이면 먼저 손이 갑니다. 답을 고르기 전에 종이에 한 번 계산해 보고, 그 값이 보기에 있는지 찾으세요.',
  '빼야 할 곳에서 더함':
    '"모두"와 "남은"을 바꾸어 읽고 있습니다. 문장에서 묻는 말에 동그라미를 치고, 늘어나는 이야기인지 줄어드는 이야기인지 먼저 말해 보세요.',
  '더해야 할 곳에서 뺌':
    '"모두"와 "남은"을 바꾸어 읽고 있습니다. 문장에서 묻는 말에 동그라미를 치고, 늘어나는 이야기인지 줄어드는 이야기인지 먼저 말해 보세요.',
  '더해야 할 곳에서 곱함':
    '묶음이 아닌데 곱하고 있습니다. "몇 개씩"이라는 말이 있는지 먼저 찾으세요. 그 말이 없으면 곱셈이 아닙니다.',
  '받아올림이나 받아내림을 빠뜨림':
    '올린 1과 빌려 온 10을 자꾸 잊습니다. 세로로 쓰고 올린 수는 윗자리에 작게 적어 두세요. 적어 두면 잊지 않습니다.',
  '자리를 한 칸 잘못 봄':
    '자리를 한 칸씩 밀려 보고 있습니다. 수를 쓸 때 천·백·십·일 이름을 위에 적고 그 아래에 숫자를 쓰세요.',
  '하나 더 세거나 덜 셈':
    '셀 때 하나를 겹쳐 세거나 빠뜨립니다. 센 것에는 반드시 표시를 하고, 다 센 뒤에 한 번 더 세어 맞는지 보세요.',
};

export type StrongKind = {
  kind: string;
  total: number;
  // 이 갈래에서 무엇을 할 줄 알게 되었는지입니다.
  praise: string;
};

export type WeakKind = {
  kind: string;
  wrong: number;
  total: number;
  // 그 갈래에서 실제로 틀린 문제 하나입니다. '무엇을 더 공부하라'는
  // 말만으로는 집에서 무엇을 펼쳐야 할지 알 수 없습니다. 틀린 문제와
  // 그 문제의 첫 동작을 함께 남겨, 그 자리에서 다시 해 볼 수 있게
  // 합니다.
  example: { prompt: string; answer: string; firstMove: string } | null;
};

export type StudyGuide = {
  answered: number;
  strong: StrongKind[];
  weak: WeakKind[];
  // 늘 한 줄은 칭찬합니다. 잘한 갈래가 없어도 칭찬할 것은 있습니다 —
  // 끝까지 푼 것, 틀린 문제를 다시 잡은 것, 어려운 단계를 고른 것.
  // 걸린 곳만 적힌 화면을 받아 드는 아이는 다음에 손을 들지 않습니다.
  cheer: string;
  // 처음에 걸렸다가 다시 풀어 맞힌 문제 수입니다.
  recovered: number;
  // 공부하는 방법입니다. 걸린 갈래가 요구하던 것이 같으면 한 번만
  // 말합니다. 계산에서 두 갈래가 걸렸다고 같은 말을 두 번 읽힐 이유가
  // 없습니다.
  advice: string[];
  // 되풀이된 실수와 그것을 고치는 법입니다.
  habits: Array<{ what: string; times: number; fix: string }>;
  // 이 차시에서 조심할 곳과 다 풀고 확인할 것입니다. 차시마다 하나씩
  // 정해져 있으므로 갈래마다 되풀이하지 않고 아래에 한 번 둡니다.
  watchOut: string;
  selfCheck: string;
};

export const studyGuideFor = (records: AnswerRecord[], playerId: number): StudyGuide => {
  const mine = records.filter((record) => record.playerId === playerId);

  // 갈래마다 몇 번 만났고 몇 번 틀렸는지 모읍니다.
  const byKind = new Map<string, { total: number; wrong: number; sample: AnswerRecord }>();
  for (const record of mine) {
    const kind = kindOf(record.strategy);
    const seen = byKind.get(kind);
    if (seen) {
      seen.total += 1;
      if (!record.correct) {
        seen.wrong += 1;
        // 도움말은 틀린 문항의 것으로 보여 줍니다.
        seen.sample = record;
      }
    } else {
      byKind.set(kind, { total: 1, wrong: record.correct ? 0 : 1, sample: record });
    }
  }

  const kinds = [...byKind.entries()];

  // 잘한 갈래. 한 번 맞힌 것으로는 잘한다고 말하기 어려우므로 두 번
  // 이상 만나 한 번도 틀리지 않은 것만 셉니다.
  const strong = kinds
    .filter(([, count]) => count.total >= 2 && count.wrong === 0)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3)
    .map(([kind, count]) => ({
      kind,
      total: count.total,
      praise: whatWentWell(count.sample.strategy),
    }));

  // 어려웠던 갈래. 많이 걸린 것부터입니다. 셋까지만 보여 줍니다 —
  // 한 번에 여러 가지를 고치라고 하면 아무것도 고치지 못합니다.
  const missed = kinds
    .filter(([, count]) => count.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong || b[1].total - a[1].total)
    .slice(0, 3);

  const weak = missed.map(([kind, count]) => ({
    kind,
    wrong: count.wrong,
    total: count.total,
    example: {
      prompt: count.sample.prompt,
      answer: count.sample.answer,
      firstMove: count.sample.support.studentHint,
    },
  }));

  // 같은 말은 한 번만 합니다. 갈래마다 붙이면 세 갈래가 모두 계산일 때
  // 똑같은 문장을 세 번 읽게 됩니다.
  const advice = [...new Set(missed.map(([, count]) => howToPractise(count.sample.strategy)))];

  // 아이가 고른 오답에서 읽어 둔 실수를 셉니다. 두 번 넘게 되풀이된
  // 것만 말합니다 — 한 번은 실수이고 두 번부터가 버릇입니다.
  const habitCount = new Map<string, number>();
  for (const record of mine) {
    if (record.correct || !record.chosenMeaning) continue;
    habitCount.set(record.chosenMeaning, (habitCount.get(record.chosenMeaning) ?? 0) + 1);
  }
  const habits = [...habitCount.entries()]
    .filter(([what, times]) => times >= 2 && habitFix[what])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([what, times]) => ({ what, times, fix: habitFix[what] }));

  // 조심할 곳과 확인 질문은 그 차시의 것이라 갈래가 달라도 같습니다.
  // 하나만 골라 아래에 둡니다.
  const first = missed[0]?.[1].sample;

  // 한 번 틀렸다가 다시 풀어 맞힌 문제입니다. 처음에 맞힌 것보다
  // 오히려 이쪽이 칭찬할 일입니다 — 틀린 뒤에 다시 붙잡은 것이니까요.
  const tried = new Map<string, { missedOnce: boolean; gotIt: boolean }>();
  for (const record of mine) {
    const seen = tried.get(record.questionId) ?? { missedOnce: false, gotIt: false };
    if (record.correct) seen.gotIt = true;
    else seen.missedOnce = true;
    tried.set(record.questionId, seen);
  }
  const recovered = [...tried.values()].filter((one) => one.missedOnce && one.gotIt).length;

  const rightCount = mine.filter((record) => record.correct).length;
  const wrongCount = mine.length - rightCount;

  // 칭찬할 것을 이 차례로 찾습니다. 앞쪽일수록 그 아이만의 이야기입니다.
  const cheer = mine.length === 0
    ? ''
    : wrongCount === 0
      ? `${mine.length}문제를 모두 맞혔어요. 끝까지 집중했네요.`
      : recovered > 0
        ? `틀렸던 문제를 다시 풀어 ${recovered}문제를 맞혔어요. 다시 해 보는 힘이 정말 좋아요.`
        : strong.length > 0
          ? `${strong[0].kind} — 이건 확실히 잡았어요.`
          : rightCount > 0
            ? `${rightCount}문제를 맞혔어요. 어려운 문제도 끝까지 풀어 봤어요.`
            : '끝까지 자리를 지키며 다 풀어 봤어요. 그게 가장 어려운 일이에요.';

  return {
    answered: mine.length,
    strong,
    weak,
    cheer,
    recovered,
    habits,
    advice,
    watchOut: first?.support.misconceptionTip ?? '',
    selfCheck: first?.support.selfCheck ?? '',
  };
};
