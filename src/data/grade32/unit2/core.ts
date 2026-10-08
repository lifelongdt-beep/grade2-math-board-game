import { rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-2 2단원 나눗셈 — 수 고르기, 풀이, 틀린 값
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례(교과서 예):
//   2 내림이 없는 (몇십)÷(몇)                    60÷3, 80÷4, 50÷5, 90÷3
//   3 내림이 없는 (몇십몇)÷(몇)                  24÷2, 62÷2
//   4 내림이 있는 (두 자리 수)÷(한 자리 수)       52÷4=13, 80÷5=16, 84÷3, 91÷7
//   5 내림이 없고 나머지가 있는 것               29÷8=3 … 5, 33÷4, 20÷3
//   6 내림이 있고 나머지가 있는 것               64÷5=12 … 4, 79÷6, 83÷3, 74÷4
//   8 나머지가 없는 (세 자리 수)÷(한 자리 수)     360÷3, 536÷4=134, 834÷6, 765÷5
//   9 나머지가 있는 (세 자리 수)÷(한 자리 수)     417÷4=104 … 1, 659÷8=82 … 3
//
// 틀린 값은 지도서 '나눗셈의 계산 과정에서 보이는 오류'(⑴ 알고리즘,
// ⑵ 0 처리, ⑶ 기초 계산, ⑷ 가정 몫, ⑸ 기수법)를 따릅니다.
//   · 0 처리: 417÷4의 몫 104를 14로 씀
//   · 가정 몫: 몫을 하나 적게 잡아 나머지가 나누는 수보다 커짐(35÷4=7 … 7)
//   · 내림을 하지 않음: 84÷3에서 8÷3=2만 쓰고 남은 2를 버린 채 4÷3=1 → 21
// ════════════════════════════════════════════════════════════════════

export type Div = { a: number; d: number; q: number; r: number };

export type Kind =
  | 't0' // 내림이 없는 (몇십)÷(몇)
  | 'n0' // 내림이 없는 (몇십몇)÷(몇)
  | 'b0' // 내림이 있는 (두)÷(한), 나머지 없음
  | 'nr' // 내림이 없고 나머지가 있는 (두)÷(한)
  | 'br' // 내림이 있고 나머지가 있는 (두)÷(한)
  | 'h0' // 나머지가 없는 (세)÷(한)
  | 'hr'; // 나머지가 있는 (세)÷(한)

const 맞는가: Record<Kind, (a: number, d: number) => boolean> = {
  t0: (a, d) => a % 10 === 0 && (a / 10) % d === 0,
  n0: (a, d) => a % 10 !== 0 && Math.floor(a / 10) % d === 0 && (a % 10) % d === 0 && a >= 10 * d,
  b0: (a, d) => a % d === 0 && a >= 10 * d && Math.floor(a / 10) % d !== 0,
  // 몫이 한 자리이거나(29÷8), 십의 자리가 나누어떨어지는 것(47÷4=11 … 3)
  nr: (a, d) => a % d !== 0 && (a < 10 * d || Math.floor(a / 10) % d === 0),
  br: (a, d) => a % d !== 0 && a >= 10 * d && Math.floor(a / 10) % d !== 0,
  h0: (a, d) => a >= 100 && a % d === 0,
  hr: (a, d) => a >= 100 && a % d !== 0,
};

export const kindOk = (kind: Kind, a: number, d: number) => 맞는가[kind](a, d);

export const divFor = (kind: Kind, seed: number): Div | null => {
  const next = rand(seed);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const d = 2 + next(8);
    const a = kind === 't0'
      ? (1 + next(9)) * 10
      : kind === 'h0' || kind === 'hr'
        ? 100 + next(900)
        : 10 + next(90);
    if (!맞는가[kind](a, d)) continue;
    const q = Math.floor(a / d);
    if (q < 2) continue;
    return { a, d, q, r: a % d };
  }
  return null;
};

/** 몫과 나머지를 교과서처럼 씁니다(29÷8=3 … 5). 나머지가 0이면 몫만 씁니다. */
export const 몫글 = (q: number, r: number) => (r === 0 ? String(q) : `${q} … ${r}`);

/** 남은 수를 버리고 자리마다 따로 나눈 몫입니다(내림을 하지 않은 오류). */
export const noBringDown = (a: number, d: number): number => {
  const ds = String(a).split('').map(Number);
  return Number(ds.map((x) => String(Math.floor(x / d))).join(''));
};

/** 몫 가운데 0을 빠뜨린 값입니다(104 → 14). 가운데 0이 없으면 null입니다. */
export const zeroDrop = (q: number): number | null => {
  const s = String(q);
  if (s.length < 3 || !s.slice(1, -1).includes('0')) return null;
  return Number(s[0] + s.slice(1, -1).replace(/0/g, '') + s[s.length - 1]);
};

/** 틀린 몫·나머지 글입니다. 차례대로 쓰고, 정답과 같은 것은 뺍니다. */
export const wrongsFor = ({ a, d, q, r }: Div): string[] => {
  const out: string[] = [];
  const z = zeroDrop(q);
  if (z !== null) out.push(몫글(z, r));
  // 몫을 하나 적게 잡아 나머지가 나누는 수보다 큼
  if (q >= 2) out.push(몫글(q - 1, r + d));
  const nb = noBringDown(a, d);
  if (nb !== q && nb > 0) out.push(몫글(nb, r));
  if (r > 0) {
    out.push(String(q)); // 나머지를 쓰지 않음
    out.push(몫글(q + 1, r));
    out.push(몫글(q, r === d - 1 ? r - 1 : r + 1));
  } else {
    out.push(String(q + 1), String(q - 1), String(q + 10));
  }
  return out.filter((one, at, all) => one !== 몫글(q, r) && all.indexOf(one) === at && !one.startsWith('0'));
};

// ── 풀이 ────────────────────────────────────────────────────────────
// 조사는 '을(를)'처럼 적어 두면 문항을 만들 때 앞말에 맞추어 고릅니다.

/** 두 자리 수: 52=40+12처럼 '몇십으로 나누어떨어지는 부분'과 나머지로 가릅니다(지도서 52÷4=40÷4+12÷4). */
const 두자리풀이 = ({ a, d, q, r }: Div): string[] => {
  if (a < 10 * d) {
    return [
      `${d}단 곱셈구구에서 ${a}보다 크지 않으면서 ${a}에 가장 가까운 곱은 ${d}×${q}=${d * q}입니다.`,
      r === 0 ? `그러므로 ${a}÷${d}=${q}입니다.` : `${a}-${d * q}=${r}이므로 ${a}÷${d}=${q} … ${r}입니다.`,
    ];
  }
  if (a % 10 === 0 && r === 0 && (a / 10) % d === 0) {
    return [`${a}은(는) 10이 ${a / 10}개입니다. ${a / 10}÷${d}=${a / 10 / d}입니다.`, `10이 ${a / 10 / d}개씩이므로 ${a}÷${d}=${q}입니다.`];
  }
  const 큰 = Math.floor(a / (10 * d)) * 10 * d;
  const 남은 = a - 큰;
  const q1 = 큰 / d;
  const q2 = Math.floor(남은 / d);
  return [
    `${a}=${큰}+${남은}(으)로 가릅니다. ${큰}÷${d}=${q1}입니다.`,
    r === 0 ? `${남은}÷${d}=${q2}입니다.` : `${남은}÷${d}=${q2} … ${r}입니다.`,
    r === 0 ? `${q1}+${q2}=${q}이므로 ${a}÷${d}=${q}입니다.` : `${q1}+${q2}=${q}이므로 ${a}÷${d}=${q} … ${r}입니다.`,
  ];
};

/** 세 자리 수: 높은 자리부터 나누고, 남은 수를 다음 자리와 합해 다시 나눕니다(지도서 536÷4). */
const 세자리풀이 = ({ a, d, q, r }: Div): string[] => {
  const ds = String(a).split('').map(Number);
  const 자리말 = ['백', '십', '일'];
  const lines: string[] = [];
  let 남은 = 0;
  let 시작 = true;
  ds.forEach((x, at) => {
    const 지금 = 남은 * 10 + x;
    const 몫자리 = Math.floor(지금 / d);
    const 나머지 = 지금 % d;
    if (시작 && 몫자리 === 0) {
      lines.push(`${자리말[at]}의 자리 ${x}은(는) ${d}(으)로 나눌 수 없으므로 다음 자리와 함께 나눕니다.`);
    } else {
      lines.push(`${자리말[at]}의 자리: ${지금}÷${d}=${몫자리}${나머지 ? ` … ${나머지}` : ''}`);
      시작 = false;
    }
    남은 = 나머지;
  });
  lines.push(r === 0 ? `그러므로 ${a}÷${d}=${q}입니다.` : `그러므로 ${a}÷${d}=${q} … ${r}입니다.`);
  return lines;
};

export const divSteps = (one: Div): string[] => (one.a >= 100 ? 세자리풀이(one) : 두자리풀이(one));

/** 나눗셈의 계산이 맞는지 확인하는 두 식입니다(지도서: 한 줄로 이어 쓰지 않습니다). */
export const 확인식 = ({ a, d, q, r }: Div) =>
  r === 0 ? `${d}×${q}=${a}` : `${d}×${q}=${d * q}, ${d * q}+${r}=${a}`;
