import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 3학년 시간·들이·무게의 '생각하는 문항'
// ────────────────────────────────────────────────────────────────────
//   · 끝난 시각과 걸린 시간에서 거꾸로 시작한 시각 구하기
//   · 같은 물통을 더 적은 번 부어 채우는 컵이 더 크다(거꾸로 견주기)
//   · 양팔 저울이 맞을 때 한 개의 무게 구하기
// ════════════════════════════════════════════════════════════════════

const 시각글 = (분: number) => `${Math.floor(분 / 60)}시 ${분 % 60}분`;

export const 시작시각: G5Family = {
  id: 'start-time',
  make: (seed) => {
    const next = 고르개(seed);
    const 끝 = 사이(next, 9, 17) * 60 + 사이(next, 0, 11) * 5;
    const 걸림 = 사이(next, 1, 3) * 60 + 사이(next, 1, 11) * 5;
    const 시작 = 끝 - 걸림;
    const h = Math.floor(걸림 / 60);
    const m = 걸림 % 60;
    return {
      prompt: `어떤 일을 ${h}시간 ${m}분 동안 하였더니 ${시각글(끝)}에 끝났습니다. 이 일을 시작한 시각은 몇 시 몇 분일까요?`,
      answer: 시각글(시작),
      wrongs: [끝 + 걸림, 시작 + 60, 시작 - 60, 시작 + 40].filter((x, i, xs) => x !== 시작 && x > 0 && x < 24 * 60 && xs.indexOf(x) === i).slice(0, 3).map(시각글),
      tag: 'time',
      strategy: '끝난 시각에서 걸린 시간을 빼어 시작한 시각 구하기',
      hint: '시작한 시각은 끝난 시각보다 걸린 시간만큼 앞이에요. 분끼리 뺄 수 없으면 1시간을 60분으로 바꾸어요.',
      steps: [`${시각글(끝)}-${h}시간 ${m}분=${시각글(시작)}`],
      misconceptionTip: '걸린 시간을 더하면 끝난 시각보다 더 뒤가 돼요. 시작은 앞이므로 빼요.',
      minusIsOperator: true,
    };
  },
};

export const 컵비교: G5Family = {
  id: 'cup-compare',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 3, 12);
    const b = 사이(next, 3, 12);
    if (a === b) return null;
    const 가큼 = a < b;
    return {
      prompt: `같은 물통을 가득 채우려면 가 컵으로는 ${a}번, 나 컵으로는 ${b}번 물을 부어야 합니다. 들이가 더 많은 컵은 어느 것일까요?`,
      answer: 가큼 ? '가 컵' : '나 컵',
      wrongs: [가큼 ? '나 컵' : '가 컵', '두 컵의 들이가 같습니다', '알 수 없습니다'],
      tag: 'measurement',
      strategy: '부은 횟수로 들이를 거꾸로 견주기',
      hint: '컵이 클수록 적은 번 부어도 물통이 가득 차요.',
      steps: [`같은 물통을 ${가큼 ? '가' : '나'} 컵으로 더 적은 번(${Math.min(a, b)}번) 부어 채웠습니다.`, `그러므로 ${가큼 ? '가' : '나'} 컵의 들이가 더 많습니다.`],
      misconceptionTip: '많이 부은 컵이 큰 것이 아니에요. 적게 부어도 채워지는 컵이 커요.',
    };
  },
};

export const 저울맞춤: G5Family = {
  id: 'balance-unit',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 2, 4);
    const 사과 = 사이(next, 10, 40) * 10;
    const b = 사이(next, a + 1, 8);
    const 전체 = 사과 * a;
    if (전체 % b !== 0) return null;
    const 귤 = 전체 / b;
    return {
      prompt: `양팔 저울의 한쪽에 사과 ${a}개, 다른 쪽에 귤 ${b}개를 올렸더니 수평이 되었습니다. 귤 한 개의 무게가 ${귤} g일 때 사과 한 개의 무게는 몇 g일까요?`,
      answer: `${사과} g`,
      wrongs: [귤 * a, 귤 * b, 전체, 사과 + 귤].filter((x, i, xs) => x !== 사과 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x} g`),
      tag: 'measurement',
      strategy: '수평인 양팔 저울로 한 개의 무게 구하기',
      hint: '수평이면 양쪽의 무게가 같아요. 귤 쪽의 무게를 먼저 구해 보세요.',
      steps: [`귤 ${b}개: ${귤}×${b}=${전체} g`, `사과 ${a}개도 ${전체} g이므로 사과 한 개는 ${전체}÷${a}=${사과} g입니다.`],
    };
  },
};
