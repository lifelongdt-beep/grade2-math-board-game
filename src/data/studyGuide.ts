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

export type StrongKind = {
  kind: string;
  total: number;
};

export type WeakKind = {
  kind: string;
  wrong: number;
  total: number;
};

export type StudyGuide = {
  answered: number;
  strong: StrongKind[];
  weak: WeakKind[];
  // 공부하는 방법입니다. 걸린 갈래가 요구하던 것이 같으면 한 번만
  // 말합니다. 계산에서 두 갈래가 걸렸다고 같은 말을 두 번 읽힐 이유가
  // 없습니다.
  advice: string[];
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
    .map(([kind, count]) => ({ kind, total: count.total }));

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
  }));

  // 같은 말은 한 번만 합니다. 갈래마다 붙이면 세 갈래가 모두 계산일 때
  // 똑같은 문장을 세 번 읽게 됩니다.
  const advice = [...new Set(missed.map(([, count]) => howToPractise(count.sample.strategy)))];

  // 조심할 곳과 확인 질문은 그 차시의 것이라 갈래가 달라도 같습니다.
  // 하나만 골라 아래에 둡니다.
  const first = missed[0]?.[1].sample;

  return {
    answered: mine.length,
    strong,
    weak,
    advice,
    watchOut: first?.support.misconceptionTip ?? '',
    selfCheck: first?.support.selfCheck ?? '',
  };
};
