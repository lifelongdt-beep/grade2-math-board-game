import type { RangeLineVisual } from '../../../types';
import { gwa } from '../util';

// ── 수의 범위를 다루는 말과 그림 ─────────────────────────────────────
// 2차시(이상·이하)와 3차시(초과·미만)는 하는 일이 같고 경곗값을 넣느냐
// 마느냐만 다릅니다. 두 차시의 문항을 따로 쓰면 한쪽만 고치는 일이
// 생기므로, 여기 한 벌만 두고 inclusive로 가릅니다.

export type Edge = { value: number; included: boolean };

export const aboveWord = (included: boolean) => (included ? '이상' : '초과');
export const belowWord = (included: boolean) => (included ? '이하' : '미만');

export const aboveMeaning = (value: number, included: boolean) =>
  included ? `${gwa(String(value))} 같거나 ${value}보다 큰 수` : `${value}보다 큰 수`;
export const belowMeaning = (value: number, included: boolean) =>
  included ? `${gwa(String(value))} 같거나 ${value}보다 작은 수` : `${value}보다 작은 수`;

export const inAbove = (x: number, edge: Edge) => (edge.included ? x >= edge.value : x > edge.value);
export const inBelow = (x: number, edge: Edge) => (edge.included ? x <= edge.value : x < edge.value);

/** 수 하나가 범위에 들어가는지입니다. lower·upper 중 없는 쪽은 끝이 없습니다. */
export const inRange = (x: number, lower?: Edge, upper?: Edge) =>
  (lower ? inAbove(x, lower) : true) && (upper ? inBelow(x, upper) : true);

/**
 * 범위 그림을 만듭니다.
 *
 * 눈금이 너무 촘촘하거나 너무 성기면 읽을 수가 없습니다. 경곗값이 눈금
 * 위에 정확히 놓이도록 간격을 고르고, 양쪽으로 두어 칸 남겨 둡니다.
 */
export const rangeLine = (
  label: string,
  step: number,
  lower?: Edge,
  upper?: Edge,
  dots?: Array<{ value: number; label?: string }>,
): RangeLineVisual => {
  const anchors = [lower?.value, upper?.value].filter((value): value is number => value !== undefined);
  const low = Math.min(...anchors);
  const high = Math.max(...anchors);
  // 경곗값이 눈금에 놓이도록 간격의 배수로 맞춥니다.
  const start = Math.floor(low / step) * step - step * (lower ? 2 : 3);
  const end = Math.ceil(high / step) * step + step * (upper ? 2 : 3);
  return {
    kind: 'range-line',
    label,
    start: Number(start.toFixed(6)),
    end: Number(end.toFixed(6)),
    step,
    ...(lower ? { lower } : {}),
    ...(upper ? { upper } : {}),
    ...(dots ? { dots } : {}),
  };
};

/** '49 초과 59 이하인 수'처럼 범위를 말로 씁니다. */
// 단위를 수 뒤에 붙입니다. cm, kg처럼 알파벳 단위는 한 칸 띄우고,
// 세·권처럼 우리말 단위(의존 명사)는 '18세', '5권'처럼 붙여 씁니다.
export const unitTail = (unit: string) => {
  if (!unit) return '';
  return /^[가-힣]+$/.test(unit) ? unit : ` ${unit}`;
};

export const rangeText = (lower?: Edge, upper?: Edge, unit = ''): string => {
  const tail = unitTail(unit);
  if (lower && upper) {
    return `${lower.value}${tail} ${aboveWord(lower.included)} ${upper.value}${tail} ${belowWord(upper.included)}인 수`;
  }
  if (lower) return `${lower.value}${tail} ${aboveWord(lower.included)}인 수`;
  if (upper) return `${upper.value}${tail} ${belowWord(upper.included)}인 수`;
  return '모든 수';
};
