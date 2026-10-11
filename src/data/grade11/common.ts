import type { CounterIcon, CountersVisual, Difficulty } from '../../types';
import type { G5Spec } from '../grade5/build';
import { rand } from '../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 1학년 1학기 문항이 함께 쓰는 것
// ════════════════════════════════════════════════════════════════════

/** 셀 물건입니다. 단위는 물건마다 우리말 단위를 씁니다. */
export type 물건 = { 이름: string; icon: CounterIcon; 단위: string };

export const 물건들: 물건[] = [
  { 이름: '사과', icon: 'apple', 단위: '개' },
  { 이름: '별', icon: 'star', 단위: '개' },
  { 이름: '꽃', icon: 'flower', 단위: '송이' },
  { 이름: '물고기', icon: 'fish', 단위: '마리' },
  { 이름: '공', icon: 'ball', 단위: '개' },
  { 이름: '자동차', icon: 'car', 단위: '대' },
  { 이름: '새', icon: 'bird', 단위: '마리' },
];

/** 개수를 말할 때 쓰는 우리말(한, 두, 세 …)입니다. 1~9만 씁니다. */
export const 관형 = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
/** 수를 우리말로 읽은 것입니다(하나, 둘 …). */
export const 우리말 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
/** 수를 한자어로 읽은 것입니다(일, 이 …). */
export const 한자어 = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
/** 순서를 나타내는 말입니다(첫째, 둘째 …). */
export const 째 = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];

/** 몇십을 우리말로 읽은 것입니다. */
const 우리말십 = ['', '열', '스물', '서른', '마흔', '쉰'];

/** 50까지의 수를 한자어로 읽습니다. 27 → 이십칠 */
export const 한자어로 = (n: number): string => {
  if (n === 0) return '영';
  const t = Math.floor(n / 10);
  const o = n % 10;
  const 십 = t === 0 ? '' : t === 1 ? '십' : `${한자어[t]}십`;
  return `${십}${o === 0 ? '' : 한자어[o]}`;
};

/** 50까지의 수를 우리말로 읽습니다. 27 → 스물일곱 */
export const 우리말로 = (n: number): string => {
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${우리말십[t]}${o === 0 ? '' : 우리말[o]}`;
};

/** a 이상 b 이하의 정수를 고릅니다. */
export const 사이 = (next: (bound: number) => number, a: number, b: number) => a + next(b - a + 1);

/** 씨앗에서 고르개를 만듭니다. */
export const 고르개 = (seed: number) => rand(seed);

/** 서로 다른 물건 둘을 고릅니다. */
export const 물건둘 = (next: (bound: number) => number): [물건, 물건] => {
  const a = next(물건들.length);
  const b = (a + 1 + next(물건들.length - 1)) % 물건들.length;
  return [물건들[a], 물건들[b]];
};

/** 한 무리를 그립니다. */
export const 셈그림 = (label: string, groups: CountersVisual['groups'], joiner?: CountersVisual['joiner']): CountersVisual => ({
  kind: 'counters',
  label,
  groups,
  ...(joiner ? { joiner } : {}),
});

/** 수 보기에서 범위를 벗어나거나 답과 같은 것을 거릅니다. */
export const 수보기 = (answer: number, candidates: number[], lo = 0, hi = 9): string[] =>
  [...new Set(candidates)].filter((v) => v !== answer && v >= lo && v <= hi).map(String);

/** 수준별로 다른 범위를 고릅니다. */
export const 수준범위 = (lv: Difficulty | undefined, 하: [number, number], 중: [number, number], 상: [number, number]) =>
  lv === '하' ? 하 : lv === '상' ? 상 : 중;

export type Spec = G5Spec;
