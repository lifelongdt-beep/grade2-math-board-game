import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// ㄱ·ㄴ·ㄷ·ㄹ 판별 문항이 자리 패턴을 만들지 않는지 봅니다.
//
// 예전에는 옳은 문장 둘을 먼저, 옳지 않은 문장 둘을 뒤에 늘어놓았습니다.
// 그래서 답이 늘 'ㄱ, ㄴ' 아니면 'ㄷ, ㄹ'이었습니다. 아이는 문장을 읽지
// 않고 자리만 보고 골랐습니다.
const judgements = () => {
  const found: Array<{ prompt: string; answer: string }> = [];
  for (const lesson of lessons) {
    for (const level of ['하', '중', '상'] as const) {
      for (const question of generateQuestions(lesson, level)) {
        if (!/것을 모두 고른 것은\?/.test(question.prompt)) continue;
        found.push({ prompt: question.prompt, answer: question.answer });
      }
    }
  }
  return found;
};

describe('여러 설명을 판단하는 문항', () => {
  it('무엇을 묻는지를 문장 앞에 둔다', () => {
    const late: string[] = [];
    for (const one of judgements()) {
      const asking = one.prompt.indexOf('것을 모두 고른 것은?');
      const firstLabel = one.prompt.indexOf('ㄱ ');
      // 네 문장을 다 읽고 나서야 무엇을 찾는지 알게 되면, 처음부터
      // 다시 읽어야 합니다.
      if (firstLabel >= 0 && asking > firstLabel) late.push(one.prompt.slice(0, 60));
    }
    expect(late.slice(0, 3)).toEqual([]);
  });

  it('옳은 것이 앞자리에만 몰리지 않는다', () => {
    const hits: Record<string, number> = { ㄱ: 0, ㄴ: 0, ㄷ: 0, ㄹ: 0 };
    const all = judgements();
    for (const one of all) {
      for (const label of one.answer.split(', ')) {
        if (label in hits) hits[label] += 1;
      }
    }

    const total = Object.values(hits).reduce((sum, one) => sum + one, 0);
    expect(total).toBeGreaterThan(200);

    // 네 자리가 고르게 나와야 합니다. 한 자리가 5분의 1도 안 되게
    // 나오면 자리로 답을 가릴 수 있다는 뜻입니다.
    const thin = Object.entries(hits).filter(([, count]) => count * 5 < total);
    expect(thin).toEqual([]);
  });

  it('옳은 것의 개수가 여러 가지로 나온다', () => {
    const sizes = new Set(judgements().map((one) => one.answer.split(', ').length));
    // 늘 둘이면 개수만 보고 보기를 지울 수 있습니다.
    expect(sizes.size).toBeGreaterThanOrEqual(3);
  });
});
