import type { ConceptTag, Difficulty, Lesson, Manipulation, Question } from '../../types';
import { resolveParticles } from '../grade5/util';

export { 고르개, 사이 } from '../grade11/common';

/** 조작 문항 하나를 만드는 데 필요한 것입니다. 답은 조작 결과로 채점하므로 보기는 없습니다. */
export interface 조작틀 {
  prompt: string;
  /** 바르게 했을 때의 결과를 한 줄로(기록과 '정답' 칸에 보입니다). */
  answer: string;
  manipulate: Manipulation;
  tag: ConceptTag;
  strategy: string;
  /** 첫 걸음을 짚어 주는 도움말(정답을 말하지 않습니다). */
  hint: string;
  /** 푸는 과정 세 줄. 셋째 줄은 틀렸을 때 '왜?' 칸에 나옵니다. */
  steps: [string, string, string, ...string[]];
  concept: string;
  misconception: string;
  selfCheck?: string;
  /** 0 지식, 1 적용, 2 사고 */
  결: 0 | 1 | 2;
}

/** 수준: 0 하(배운 그대로), 1 중(한 번 더 생각), 2 상(거꾸로·조건 여럿·큰 수). 갈래마다 수준에 맞게 수와 조건을 바꿉니다. */
export type 수준 = 0 | 1 | 2;
export type 조작갈래 = { id: string; make: (seed: number, 수준: 수준) => 조작틀 | null };

export const 조작문항 = (lesson: Lesson, difficulty: Difficulty, id: string, seed: number, t: 조작틀): Question => {
  const r = resolveParticles;
  return {
    id: `${lesson.id}-${difficulty}-manip-${id}-${seed}`,
    lessonId: lesson.id,
    difficulty,
    prompt: r(t.prompt),
    thinkingLevel: t.결,
    choices: [r(t.answer)],
    answerIndex: 0,
    answer: r(t.answer),
    explanation: r(t.steps.join(' ')),
    misconception: r(t.misconception),
    type: t.tag,
    strategy: t.strategy,
    support: {
      studentConcept: r(t.concept),
      studentHint: r(t.hint),
      coreConcept: r(t.concept),
      readStrategy: '문제에서 무엇을 만들거나 놓아야 하는지 먼저 찾아요.',
      steps: t.steps.map(r),
      misconceptionTip: r(t.misconception),
      textbookConnection: lesson.title,
      selfCheck: r(t.selfCheck ?? '확인을 누르기 전에, 만든 것이 문제의 조건에 모두 맞는지 다시 보았나요?'),
    },
    manipulate: t.manipulate,
  };
};

export const 섞기 = <T,>(items: T[], next: (n: number) => number): T[] => {
  const out = [...items];
  for (let at = out.length - 1; at > 0; at -= 1) {
    const to = next(at + 1);
    [out[at], out[to]] = [out[to], out[at]];
  }
  return out;
};

export const 이름들 = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'];
