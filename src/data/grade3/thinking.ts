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

// ── 더 넓힌 3학년 생각 문항 ─────────────────────────────────────────
//   · 단위가 섞인 양 견주기: 2 L 50 mL와 2500 mL처럼 숫자만 보면
//     속는 양을 같은 단위로 바꾸어 견주기
//   · 두 시각 사이의 시간(걸린 시간)
//   · 더 부은(더 담은) 양에서 거꾸로 처음 양 구하기
//   · 두 바늘이 직각을 이루는 시각
//   · 네 변의 길이의 합에서 거꾸로 직사각형의 변 구하기

type 단위꼴 = 'cm-mm' | 'm-cm' | '시간-분' | '분-초' | 'L-mL' | 'kg-g';
const 단위표: Record<단위꼴, { 큰: string; 작은: string; 배: number; 무엇: string; 큰말: string; 작은말: string; 물건: string[] }> = {
  'cm-mm': { 큰: 'cm', 작은: 'mm', 배: 10, 무엇: '길이', 큰말: '가장 긴', 작은말: '가장 짧은', 물건: ['리본', '끈', '철사', '털실'] },
  'm-cm': { 큰: 'm', 작은: 'cm', 배: 100, 무엇: '길이', 큰말: '가장 긴', 작은말: '가장 짧은', 물건: ['줄넘기', '밧줄', '테이프', '전선'] },
  '시간-분': { 큰: '시간', 작은: '분', 배: 60, 무엇: '걸린 시간', 큰말: '가장 오래 걸린', 작은말: '가장 짧게 걸린', 물건: ['숙제', '청소', '독서', '운동'] },
  '분-초': { 큰: '분', 작은: '초', 배: 60, 무엇: '걸린 시간', 큰말: '가장 오래 걸린', 작은말: '가장 빨리 끝낸', 물건: ['민수', '지아', '태호', '서연'] },
  'L-mL': { 큰: 'L', 작은: 'mL', 배: 1000, 무엇: '들이', 큰말: '들이가 가장 많은', 작은말: '들이가 가장 적은', 물건: ['물병', '주전자', '어항', '냄비'] },
  'kg-g': { 큰: 'kg', 작은: 'g', 배: 1000, 무엇: '무게', 큰말: '가장 무거운', 작은말: '가장 가벼운', 물건: ['수박', '가방', '상자', '호박'] },
};

const 양말 = (꼴: 단위꼴, x: number, 섞어: boolean) => {
  const t = 단위표[꼴];
  const 띄 = 꼴 === '시간-분' || 꼴 === '분-초' ? '' : ' ';
  if (!섞어) return `${x}${띄}${t.작은}`;
  const 큰 = Math.floor(x / t.배);
  const 작은 = x % t.배;
  return 작은 === 0 ? `${큰}${띄}${t.큰}` : `${큰}${띄}${t.큰} ${작은}${띄}${t.작은}`;
};

/** 네 양 가운데 가장 큰(작은) 것: 큰 단위가 섞인 것과 작은 단위로만 쓴 것 */
export const 단위견주기 = (꼴: 단위꼴): G5Family => ({
  id: `unit-compare-${꼴}`,
  make: (seed) => {
    const next = 고르개(seed);
    const t = 단위표[꼴];
    const 큰수 = 사이(next, 1, 꼴 === '시간-분' ? 2 : 4);
    // 같은 '큰 단위 수'를 공유하게 해서 숫자 모양에 속기 쉽게 만듭니다.
    const 바탕 = 큰수 * t.배;
    const 조각 = t.배 >= 1000 ? [50, 500, 300, 30, 800, 80, 5] : t.배 === 100 ? [5, 50, 20, 70, 8] : t.배 === 60 ? [5, 50, 15, 40, 10, 25] : [2, 5, 8, 3, 7];
    const 값들: number[] = [];
    for (let k = 0; k < 30 && 값들.length < 4; k += 1) {
      const v = 바탕 + 조각[next(조각.length)] + (next(3) === 0 ? t.배 : 0);
      if (!값들.includes(v)) 값들.push(v);
    }
    if (값들.length < 4) return null;
    // 둘은 섞어서, 둘은 작은 단위로만 씁니다.
    const 엇갈림 = next(2);
    const 이름 = t.물건;
    const 큰것 = next(2) === 0;
    const v = 큰것 ? Math.max(...값들) : Math.min(...값들);
    const k = 값들.indexOf(v);
    const 줄 = 값들.map((x, j) => `${이름[j]} ${양말(꼴, x, (j + 엇갈림) % 2 === 0)}`);
    return {
      prompt: `${t.무엇}을(를) 나타낸 것입니다. ${줄.join(', ')}. ${큰것 ? t.큰말 : t.작은말} ${꼴 === '분-초' ? '사람은 누구일까요' : '것은 어느 것일까요'}?`,
      answer: 이름[k],
      wrongs: 이름.filter((_, j) => j !== k),
      tag: 'measurement',
      strategy: '단위를 하나로 맞추어 견주기',
      hint: `1 ${t.큰}=${t.배} ${t.작은}입니다. 모두 ${t.작은}(으)로 바꾸어 견주어 보세요.`,
      steps: [`모두 ${t.작은}(으)로 바꾸면 ${값들.map((x, j) => `${이름[j]} ${x}${꼴 === '시간-분' || 꼴 === '분-초' ? '' : ' '}${t.작은}`).join(', ')}입니다.`, `${큰것 ? t.큰말 : t.작은말} 것은 ${이름[k]}입니다.`],
      misconceptionTip: `${t.작은}(으)로 쓴 수가 크다고 더 큰 양은 아니에요. 단위를 맞추어야 해요.`,
    };
  },
});

/** 두 시각 사이의 시간(분·초) */
export const 걸린시간: G5Family = {
  id: 'elapsed-time',
  make: (seed) => {
    const next = 고르개(seed);
    const 시 = 사이(next, 1, 10);
    const 시작 = 시 * 3600 + 사이(next, 1, 50) * 60 + 사이(next, 1, 11) * 5;
    const 걸림 = 사이(next, 1, 9) * 60 + 사이(next, 1, 11) * 5;
    const 끝 = 시작 + 걸림;
    const 글 = (s: number) => `${Math.floor(s / 3600)}시 ${Math.floor((s % 3600) / 60)}분 ${s % 60}초`;
    const 길이 = (s: number) => `${Math.floor(s / 60)}분 ${s % 60}초`;
    if (Math.floor(끝 / 3600) !== 시) return null;
    const 틀린값 = [걸림 + 60, 걸림 - 60, 걸림 + 40, Math.abs(Math.floor(끝 / 60) % 60 - Math.floor(시작 / 60) % 60) * 60 + Math.abs((끝 % 60) - (시작 % 60))];
    return {
      prompt: `줄넘기를 ${글(시작)}에 시작하여 ${글(끝)}에 마쳤습니다. 줄넘기를 한 시간은 몇 분 몇 초일까요?`,
      answer: 길이(걸림),
      wrongs: 틀린값.filter((x, i, xs) => x >= 60 && x !== 걸림 && xs.indexOf(x) === i).slice(0, 3).map(길이),
      tag: 'time',
      strategy: '마친 시각에서 시작한 시각을 빼기',
      hint: '초는 초끼리, 분은 분끼리 빼요. 초끼리 뺄 수 없으면 1분을 60초로 바꾸어요.',
      steps: [`${글(끝)}-${글(시작)}`, `=${길이(걸림)}`],
      misconceptionTip: '초끼리 뺄 수 없을 때 1분을 100초로 바꾸면 안 돼요. 1분은 60초예요.',
      minusIsOperator: true,
    };
  },
};

/** 더 부은(더 담은) 뒤의 양에서 처음 양 구하기(받아내림 없음) */
export const 처음양 = (꼴: 'L-mL' | 'kg-g'): G5Family => ({
  id: `start-amount-${꼴}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 처음큰 = 사이(next, 1, 5);
    const 처음작은 = 사이(next, 1, 5) * 100;
    const 더큰 = 사이(next, 1, 3);
    const 더작은 = 사이(next, 1, 4) * 100;
    if (처음작은 + 더작은 >= 1000) return null;
    const 처음 = 처음큰 * 1000 + 처음작은;
    const 더 = 더큰 * 1000 + 더작은;
    const 끝 = 처음 + 더;
    const 말 = (x: number) => 양말(꼴, x, true);
    const 들이 = 꼴 === 'L-mL';
    return {
      prompt: 들이
        ? `물통에 물이 들어 있었습니다. 여기에 물 ${말(더)}을(를) 더 부었더니 ${말(끝)}이(가) 되었습니다. 처음 물통에 들어 있던 물은 몇 L 몇 mL일까요?`
        : `상자에 귤을 담았더니 무게가 ${말(끝)}이(가) 되었습니다. 담은 귤의 무게가 ${말(더)}이라면 빈 상자의 무게는 몇 kg 몇 g일까요?`,
      answer: 말(처음),
      wrongs: [끝 + 더, 처음 + 100, 처음 + 1000, Math.max(100, 처음 - 1000)].filter((x, i, xs) => x !== 처음 && xs.indexOf(x) === i).slice(0, 3).map(말),
      tag: 'measurement',
      strategy: '나중 양에서 더한 양을 빼어 처음 양 구하기',
      hint: `${들이 ? 'L는 L끼리, mL는 mL끼리' : 'kg은 kg끼리, g은 g끼리'} 빼요.`,
      steps: [`${말(끝)}-${말(더)}=${말(처음)}`],
      misconceptionTip: '처음 양을 구할 때는 나중 양에 더한 양을 더하지 않고 빼요.',
      minusIsOperator: true,
    };
  },
});

/** 두 바늘이 직각을 이루는 시각(정각) */
export const 직각시각: G5Family = {
  id: 'right-angle-clock',
  make: (seed) => {
    const next = 고르개(seed);
    const 답 = next(2) === 0 ? 3 : 9;
    const 나머지 = [1, 2, 4, 5, 6, 7, 8, 10, 11, 12];
    const 틀린: number[] = [];
    while (틀린.length < 3) {
      const h = 나머지[next(나머지.length)];
      if (!틀린.includes(h)) 틀린.push(h);
    }
    return {
      prompt: '시계의 긴바늘이 12를 가리킬 때, 긴바늘과 짧은바늘이 직각을 이루는 시각은 어느 것일까요?',
      answer: `${답}시`,
      wrongs: 틀린.map((h) => `${h}시`),
      tag: 'shape',
      strategy: '시계 위에서 직각 찾기',
      hint: '긴바늘이 12에 있을 때, 짧은바늘이 12에서 숫자 세 칸 떨어지면 직각이에요.',
      steps: ['12에서 3까지(또는 9까지)는 시계를 네 번 똑같이 나눈 것 가운데 하나입니다.', `그러므로 ${답}시에 두 바늘이 직각을 이룹니다.`],
      misconceptionTip: '6시는 두 바늘이 일직선이 되어 직각이 아니에요.',
    };
  },
};

/** 네 변의 길이의 합에서 직사각형의 다른 한 변 구하기 */
export const 직사각형변거꾸로: G5Family = {
  id: 'rect-side-back',
  make: (seed) => {
    const next = 고르개(seed);
    const 가로 = 사이(next, 4, 15);
    const 세로 = 사이(next, 2, 12);
    if (가로 === 세로) return null;
    const 합 = 2 * (가로 + 세로);
    return {
      prompt: `직사각형의 네 변의 길이의 합이 ${합} cm입니다. 가로가 ${가로} cm라면 세로는 몇 cm일까요?`,
      answer: `${세로} cm`,
      wrongs: [합 - 가로, (합 - 가로) / 2, 합 - 2 * 가로, 세로 + 1].filter((x, i, xs) => Number.isInteger(x) && x > 0 && x !== 세로 && xs.indexOf(x) === i).slice(0, 3).map((x) => `${x} cm`),
      tag: 'shape',
      strategy: '직사각형은 마주 보는 두 변의 길이가 같음을 이용하기',
      hint: '직사각형에는 가로가 두 개, 세로가 두 개 있어요.',
      steps: [`가로 두 개의 길이: ${가로}+${가로}=${가로 * 2} cm`, `세로 두 개의 길이: ${합}-${가로 * 2}=${세로 * 2} cm`, `세로 한 개: ${세로 * 2}÷2=${세로} cm`],
      misconceptionTip: '네 변의 길이의 합에서 가로를 한 번만 빼면 안 돼요. 가로는 두 개예요.',
      minusIsOperator: true,
    };
  },
};
