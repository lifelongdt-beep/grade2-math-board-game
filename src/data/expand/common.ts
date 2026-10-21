import type { ConceptTag } from '../../types';
import type { G5Family, G5Spec } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { resolveParticles } from '../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 문제집을 늘리는 문항이 함께 쓰는 도구
// ────────────────────────────────────────────────────────────────────
// 같은 틀이라도 수와 답이 달라지게 만드는 것이 목적입니다. 뭉치마다 수의
// 범위를 받아, 차시가 다루는 범위(Lesson.scope) 안에서만 수를 고릅니다.
// ════════════════════════════════════════════════════════════════════

export { 고르개, 사이 };
export type 고르개형 = (bound: number) => number;

/** 작은따옴표로 묶은 말 뒤에 을(를)을 붙입니다. 따옴표 때문에 받침을 잘못 읽지 않게 안쪽 말로 고릅니다. */
export const 따옴표 = (말: string, 조사: '을(를)' | '은(는)' = '을(를)') => `'${말}'${resolveParticles(`${말}${조사}`).slice(말.length)}`;

/** 하나를 고릅니다. */
export const 하나 = <T,>(next: 고르개형, items: readonly T[]): T => items[next(items.length)];

/** 서로 다른 둘을 고릅니다. */
export const 둘 = <T,>(next: 고르개형, items: readonly T[]): [T, T] => {
  const a = next(items.length);
  const b = (a + 1 + next(items.length - 1)) % items.length;
  return [items[a], items[b]];
};

/** 답과 다르고 서로 다른 수 보기 셋을 고릅니다. 모자라면 답 가까운 수로 채웁니다. */
export const 수오답 = (답: number, 후보: number[], 단위 = '', 아래 = 0, 위 = Number.MAX_SAFE_INTEGER): string[] => {
  const 고른: number[] = [];
  const 넣기 = (v: number) => {
    if (!Number.isInteger(v) || v === 답 || v < 아래 || v > 위 || 고른.includes(v)) return;
    고른.push(v);
  };
  후보.forEach(넣기);
  for (const d of [1, -1, 2, -2, 10, -10, 3, -3, 5, -5]) if (고른.length < 3) 넣기(답 + d);
  return 고른.slice(0, 3).map((v) => `${v}${단위}`);
};

/** 글 보기 셋을 답과 다르고 서로 다르게 고릅니다. */
export const 글오답 = (답: string, 후보: string[]): string[] => [...new Set(후보)].filter((w) => w !== 답).slice(0, 3);

export const 사람들 = ['민준', '서연', '도윤', '하은', '지호', '수아', '예준', '지우'] as const;

/** 셀 물건과 단위, 담는 것입니다. */
export const 물건들 = [
  { 이름: '사탕', 단위: '개', 묶음: '봉지' },
  { 이름: '연필', 단위: '자루', 묶음: '상자' },
  { 이름: '딸기', 단위: '개', 묶음: '접시' },
  { 이름: '꽃', 단위: '송이', 묶음: '꽃병' },
  { 이름: '구슬', 단위: '개', 묶음: '주머니' },
  { 이름: '쿠키', 단위: '개', 묶음: '상자' },
  { 이름: '공책', 단위: '권', 묶음: '묶음' },
  { 이름: '색종이', 단위: '장', 묶음: '묶음' },
  { 이름: '귤', 단위: '개', 묶음: '바구니' },
  { 이름: '풍선', 단위: '개', 묶음: '다발' },
  { 이름: '도토리', 단위: '개', 묶음: '자루' },
  { 이름: '스티커', 단위: '장', 묶음: '판' },
] as const;
export type 물건 = (typeof 물건들)[number];

const 한자 = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

/** 9999까지의 수를 한자어로 읽습니다. 3045 → 삼천사십오 */
export const 수읽기 = (n: number): string => {
  if (n === 0) return '영';
  const 자리 = ['천', '백', '십', ''];
  const 숫자 = String(n).padStart(4, '0').split('').map(Number);
  return 숫자.map((d, k) => (d === 0 ? '' : `${d === 1 && k < 3 ? '' : 한자[d]}${자리[k]}`)).join('');
};

/** 몇째 말입니다(첫째 … 열째). */
export const 째말 = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];

type 틀 = Omit<G5Spec, '결'>;

/** 수준의 결을 밝혀 문항을 냅니다(0 지식, 1 적용, 2 사고). */
// 5학년 문항은 build.ts가 조사를 고르지 않으므로 여기서 한 번에 고릅니다.
export const 결로 = (결: 0 | 1 | 2, spec: 틀): G5Spec => ({
  ...spec,
  prompt: resolveParticles(spec.prompt),
  answer: resolveParticles(spec.answer),
  wrongs: spec.wrongs.map(resolveParticles),
  hint: resolveParticles(spec.hint),
  steps: spec.steps.map(resolveParticles),
  결,
});

/** 씨앗에서 문항 하나를 만드는 뭉치입니다. 만들 수 없는 씨앗이면 null을 돌려줍니다. */
export const 뭉치 = (id: string, make: (next: 고르개형) => G5Spec | null): G5Family => ({ id: `expand-${id}`, make: (seed) => make(고르개(seed)) });

/** 수 하나가 답인 문항을 짧게 만듭니다. */
export const 수문항 = (
  결: 0 | 1 | 2,
  prompt: string,
  답: number,
  후보: number[],
  o: { 단위?: string; tag: ConceptTag; strategy: string; hint: string; steps: string[]; 아래?: number; 위?: number; 빼기?: boolean },
): G5Spec | null => {
  const wrongs = 수오답(답, 후보, o.단위 ?? '', o.아래 ?? 0, o.위);
  if (wrongs.length < 3) return null;
  return 결로(결, {
    prompt,
    answer: `${답}${o.단위 ?? ''}`,
    wrongs,
    tag: o.tag,
    strategy: o.strategy,
    hint: o.hint,
    steps: o.steps,
    ...(o.빼기 ? { minusIsOperator: true } : {}),
  });
};
