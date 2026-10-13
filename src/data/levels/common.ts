import type { G5Family, G5Spec } from '../grade5/build';
import { 고르개 } from '../grade11/common';

// 수준 문항이 함께 쓰는 도구입니다.

export const 섞기 = <T,>(items: T[], next: (n: number) => number): T[] => {
  const out = [...items];
  for (let at = out.length - 1; at > 0; at -= 1) {
    const to = next(at + 1);
    [out[at], out[to]] = [out[to], out[at]];
  }
  return out;
};

export const 사람 = ['민준', '서연', '도윤', '하은', '지호', '수아'];
export const 기호 = ['㉠', '㉡', '㉢', '㉣'];

/** 고차적인 사고(과정·까닭, 거꾸로, 용어, 생활 응용)를 묻는 문항입니다. */
export const 사고 = (spec: Omit<G5Spec, '결'>): G5Spec => ({ ...spec, 결: 2 });
/** 단순한 지식(뜻, 이름, 바로 계산)을 묻는 문항입니다. */
export const 지식 = (spec: Omit<G5Spec, '결'>): G5Spec => ({ ...spec, 결: 0 });

/** 바른 말 하나와 틀린 말 셋으로 '바르게 말한 사람'을 묻습니다(수학 용어를 바르게 쓰는지 봅니다). */
export const 바르게말한 = (
  id: string,
  주제: string,
  참: string[],
  거짓: string[],
  tag: G5Spec['tag'],
  strategy: string,
  hint: string,
  까닭: (말: string) => string,
): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const 맞는말 = 참[next(참.length)];
    const 틀린말 = 섞기(거짓, next).slice(0, 3);
    const 누구 = 섞기(사람, next).slice(0, 4);
    const 놓인 = 섞기([맞는말, ...틀린말], next);
    const 답 = 누구[놓인.indexOf(맞는말)];
    return 사고({
      prompt: `${주제}에 대해 바르게 말한 사람은 누구일까요? ${놓인.map((말, k) => `${누구[k]}: ${말}`).join(' ')}`,
      answer: 답,
      wrongs: 누구.filter((one) => one !== 답),
      tag,
      strategy,
      hint,
      steps: [...틀린말.map((말) => `'${말}'는 틀린 말입니다.`), 까닭(맞는말), `그러므로 바르게 말한 사람은 ${답}입니다.`],
    });
  },
});
