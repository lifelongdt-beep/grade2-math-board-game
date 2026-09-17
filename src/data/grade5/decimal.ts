// ════════════════════════════════════════════════════════════════════
// 소수
// ────────────────────────────────────────────────────────────────────
// 5-2 4단원(소수의 곱셈)이 씁니다.
//
// 자바스크립트의 수로 0.1 × 0.3을 하면 0.030000000000000002가 됩니다.
// 소수의 곱셈 단원에서 이런 값이 한 번이라도 나오면 그 문항은 아이에게
// 거짓을 가르칩니다. 그래서 소수를 글자로 받아 정수로만 셉니다.
//
// 교과서가 답을 적는 꼴을 따릅니다 — 0.6 × 0.5는 0.30이 아니라 0.3,
// 1.2 × 5는 6.0이 아니라 6입니다.
// ════════════════════════════════════════════════════════════════════

export type Decimal = { scaled: bigint; places: number };

export const parseDecimal = (text: string): Decimal => {
  const [whole, fraction = ''] = text.trim().split('.');
  return { scaled: BigInt(whole + fraction), places: fraction.length };
};

/** 뒤에 붙은 0을 떼고 적습니다. 3.60 → 3.6, 6.0 → 6 */
export const formatDecimal = ({ scaled, places }: Decimal): string => {
  if (places === 0) return scaled.toString();
  const text = scaled.toString().padStart(places + 1, '0');
  const whole = text.slice(0, text.length - places);
  const fraction = text.slice(text.length - places).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
};

/** 두 소수를 정확히 곱합니다. 소수점 아래 자리 수는 두 수의 자리 수를 더한 것입니다. */
export const mulDecimal = (a: string, b: string): string => {
  const left = parseDecimal(a);
  const right = parseDecimal(b);
  return formatDecimal({ scaled: left.scaled * right.scaled, places: left.places + right.places });
};

/**
 * 두 소수를 곱하되, 끝자리의 0을 지우지 않고 그대로 둡니다.
 * 0.5 × 0.04는 0.020입니다 — '두 자리 수를 더한 만큼 소수점을 찍는다'는
 * 규칙이 실제로 어떻게 되는지 보여 줄 때 이 꼴이 필요합니다.
 */
export const mulDecimalKeepingZeros = (a: string, b: string): string => {
  const left = parseDecimal(a);
  const right = parseDecimal(b);
  const places = left.places + right.places;
  if (places === 0) return (left.scaled * right.scaled).toString();
  const text = (left.scaled * right.scaled).toString().padStart(places + 1, '0');
  return `${text.slice(0, text.length - places)}.${text.slice(text.length - places)}`;
};

/** 소수점 아래 자리 수입니다. '2.40'은 2입니다(적힌 그대로 셉니다). */
export const placesOf = (text: string): number => (text.split('.')[1] ?? '').length;

/** 소수점을 옮깁니다. by가 양수면 오른쪽(10배), 음수면 왼쪽(1/10배)입니다. */
export const shiftPoint = (text: string, by: number): string => {
  const { scaled, places } = parseDecimal(text);
  const nextPlaces = places - by;
  if (nextPlaces >= 0) return formatDecimal({ scaled, places: nextPlaces });
  return formatDecimal({ scaled: scaled * 10n ** BigInt(-nextPlaces), places: 0 });
};

/** 소수점을 지운 자연수입니다. 4.2 → 42 */
export const withoutPoint = (text: string): string => parseDecimal(text).scaled.toString();

/** 소수를 분모가 10, 100…인 분수로 적습니다. 4.2 → 42/10 */
export const asFractionText = (text: string): string => {
  const { scaled, places } = parseDecimal(text);
  return places === 0 ? scaled.toString() : `${scaled}/${10 ** places}`;
};
