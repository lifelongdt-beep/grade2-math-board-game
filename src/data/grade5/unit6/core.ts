import type { ChanceColor, QuestionVisual } from '../../../types';
import { rand } from '../util';

// ════════════════════════════════════════════════════════════════════
// 6단원 평균과 가능성 — 셈과 판단을 한곳에서
// ────────────────────────────────────────────────────────────────────
// 평균은 (자료 값의 합)÷(자료의 수)입니다. 나누어떨어지지 않으면
// 5학년에게는 답이 소수가 되어 차시가 묻는 것과 달라지므로, 문항은
// 나누어떨어지는 자료만 만듭니다. 그 확인을 여기서 합니다.
//
// 가능성은 '몇 가지 가운데 몇 가지'를 정수 두 개로 들고 다닙니다.
// 말로 옮기는 것도, 수로 옮기는 것도 그 둘에서 계산합니다 — 손으로
// 적어 두지 않습니다.
// ════════════════════════════════════════════════════════════════════

// ── 평균 ────────────────────────────────────────────────────────────

export const 합 = (values: number[]) => values.reduce((sum, one) => sum + one, 0);

/** 나누어떨어질 때만 평균을 돌려줍니다. 아니면 null입니다. */
export const 평균 = (values: number[]): number | null => {
  if (!values.length) return null;
  const total = 합(values);
  return total % values.length === 0 ? total / values.length : null;
};

/**
 * 평균이 딱 떨어지는 자료를 만듭니다. 평균에서 얼마씩 오르내리게 하되
 * 오르내린 것을 모두 더하면 0이 되게 둡니다.
 */
export const 자료만들기 = (seed: number, count: number, target: number, spread: number): number[] => {
  const next = rand(seed);
  const values: number[] = [];
  let 남은차이 = 0;
  for (let at = 0; at < count - 1; at += 1) {
    const 차이 = next(spread * 2 + 1) - spread;
    const 값 = target + 차이;
    if (값 < 0) {
      values.push(target);
      continue;
    }
    values.push(값);
    남은차이 += 차이;
  }
  const 마지막 = target - 남은차이;
  if (마지막 < 0) return [];
  values.push(마지막);
  return values;
};

export const 표그림 = (
  label: string,
  categoryLabel: string,
  valueLabel: string,
  names: string[],
  values: Array<number | null>,
): QuestionVisual => ({
  kind: 'table',
  label,
  categoryLabel,
  valueLabel,
  columns: names.map((name, at) => ({ name, value: values[at] })),
});

// ── 가능성 ──────────────────────────────────────────────────────────
// 전체 몇 가지 가운데 바라는 것이 몇 가지인지, 정수 둘로 적습니다.

export type 가능성 = { 바라는것: number; 전체: number };

/**
 * 지도서가 쓰는 다섯 가지 말입니다. 가능성이 커지는 차례로 적어
 * 두었습니다. 5차시부터 이 다섯 말만 씁니다.
 */
export const 가능성말들 = ['불가능하다', '~아닐 것 같다', '반반이다', '~일 것 같다', '확실하다'] as const;

export const 말로 = ({ 바라는것, 전체 }: 가능성): string => {
  if (전체 <= 0) return '불가능하다';
  if (바라는것 <= 0) return '불가능하다';
  if (바라는것 >= 전체) return '확실하다';
  if (바라는것 * 2 === 전체) return '반반이다';
  return 바라는것 * 2 < 전체 ? '~아닐 것 같다' : '~일 것 같다';
};

/**
 * 수로 나타냅니다. 7차시는 0, 1/2, 1만 다루므로(지도서 학습 지도의
 * 주안점) 그 셋이 아니면 null을 돌려주고, 문항은 그런 상황을 내지
 * 않습니다.
 */
export const 수로 = ({ 바라는것, 전체 }: 가능성): string | null => {
  if (바라는것 === 0) return '0';
  if (바라는것 === 전체) return '1';
  if (바라는것 * 2 === 전체) return '1/2';
  return null;
};

/** 두 가능성을 견줍니다. 소수로 바꾸지 않고 어긋셈으로만 봅니다. */
export const 견주기 = (a: 가능성, b: 가능성) => a.바라는것 * b.전체 - b.바라는것 * a.전체;

// ── 회전판과 주머니 ─────────────────────────────────────────────────

export const 색이름: Record<ChanceColor, string> = {
  red: '빨간색',
  blue: '파란색',
  yellow: '노란색',
  green: '초록색',
  white: '흰색',
  black: '검은색',
};

export const 회전판그림 = (
  label: string,
  items: Array<{ name?: string; slices: ChanceColor[] }>,
): QuestionVisual => ({ kind: 'spinner', label, items });

export const 주머니그림 = (
  label: string,
  bags: Array<{ name?: string; marbles: ChanceColor[] }>,
): QuestionVisual => ({ kind: 'marble-bag', label, bags });

export const 세어보기 = (slices: ChanceColor[], color: ChanceColor): 가능성 => ({
  바라는것: slices.filter((one) => one === color).length,
  전체: slices.length,
});
