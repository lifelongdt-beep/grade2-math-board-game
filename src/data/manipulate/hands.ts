import type { GridPoint, GridSegment } from '../../types';
import { resolveParticles } from '../grade5/util';
import { 고르개, 사이, 섞기, type 조작갈래 } from './common';
import { 들이말, 무게말, 째말 } from './checkMore';

// ════════════════════════════════════════════════════════════════════
// 1~4학년 손 조작 문항 (2)
// ────────────────────────────────────────────────────────────────────
//   · 크기 순서대로 늘어놓기(수, 분수, 소수, 길이)
//   · 몇째 고르기, 수 배열표·곱셈표·시간 띠 색칠하기
//   · 규칙에 따라 빈칸 채우기(한 줄 무늬, 여러 줄 무늬)
//   · 수 모형으로 받아올림·받아내림 하기, 돈으로 큰 수 만들기
//   · 똑같이 나누어 담기(등분제·포함제·나머지), 점 배열로 곱셈·나눗셈
//   · 비커·저울의 눈금 맞추기(들이와 무게), 그림그래프 그리기, 달력
//   · 사각형의 네 각, 평행선 사이의 거리, 다각형 그리기
// 조작은 아이가 머릿속에서 하던 것을 손으로 해 보게 합니다 — 10개를
// 묶어 바꾸고, 하나씩 나누어 주고, 눈금을 하나씩 세어 올라갑니다.
// ════════════════════════════════════════════════════════════════════

type 다음 = (n: number) => number;
const 뽑기 = <T,>(items: T[], k: number, next: 다음) => 섞기(items, next).slice(0, k);
const 서로다른 = (k: number, make: () => number, 같은지 = (a: number, b: number) => a === b): number[] | null => {
  const out: number[] = [];
  for (let t = 0; out.length < k && t < 200; t += 1) {
    const v = make();
    if (!out.some((x) => 같은지(x, v))) out.push(v);
  }
  return out.length === k ? out : null;
};

// ── 크기 순서대로 늘어놓기 ────────────────────────────────────────
type 순서종류 = 'n9' | 'n50' | 'n99' | 'n3' | 'n4' | 'big' | 'unitfrac' | 'samefrac' | 'mixedfrac' | 'dec1' | 'dec2' | 'fracdiff' | 'fracdec' | 'length';

const 대분수글 = (w: number, n: number, d: number) => resolveParticles(`${w}과(와) ${n}/${d}`);

const 순서재료 = (종류: 순서종류, k: number, next: 다음): { label: string; value: number; len?: number; emoji?: string }[] | null => {
  const 수들 = (make: () => number) => 서로다른(k, make)?.map((v) => ({ label: String(v), value: v })) ?? null;
  switch (종류) {
    case 'n9': return 수들(() => 사이(next, 0, 9));
    case 'n50': return 수들(() => 사이(next, 11, 50));
    case 'n99': {
      // 십의 자리가 같은 수를 섞어 일의 자리까지 비교하게 합니다.
      const 십 = 사이(next, 2, 8);
      return 수들(() => (next(2) ? 십 : 사이(next, 1, 9)) * 10 + 사이(next, 0, 9));
    }
    case 'n3': {
      // 같은 숫자를 자리만 바꾼 수(452, 425, 524 …)를 섞습니다.
      const ds = 뽑기([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, next);
      const 차례들 = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
      const 고른 = 뽑기(차례들, k, next);
      return 고른.map(([a, b, c]) => ds[a] * 100 + ds[b] * 10 + ds[c]).map((v) => ({ label: String(v), value: v }));
    }
    case 'n4': {
      const 천 = 사이(next, 2, 8);
      return 수들(() => (next(3) ? 천 : 사이(next, 1, 9)) * 1000 + 사이(next, 0, 9) * 100 + 사이(next, 0, 9) * 10 + 사이(next, 0, 9));
    }
    case 'big': {
      // 자릿수가 다른 수와 높은 자리가 같은 수를 섞습니다.
      const 앞 = 사이(next, 2, 8);
      return 수들(() => {
        const 자리 = 사이(next, 5, 7);
        const 머리 = next(2) ? 앞 : 사이(next, 1, 9);
        let v = 머리;
        for (let j = 1; j < 자리; j += 1) v = v * 10 + 사이(next, 0, 9);
        return v;
      });
    }
    case 'unitfrac': {
      const ds = 서로다른(k, () => 사이(next, 2, 9));
      return ds?.map((d) => ({ label: `1/${d}`, value: 1 / d })) ?? null;
    }
    case 'samefrac': {
      const d = 사이(next, 5, 12);
      const ns = 서로다른(k, () => 사이(next, 1, d - 1));
      return ns?.map((n) => ({ label: `${n}/${d}`, value: n / d })) ?? null;
    }
    case 'mixedfrac': {
      // 가분수와 대분수를 섞어 같은 분모로 비교합니다.
      const d = 사이(next, 3, 7);
      const ns = 서로다른(k, () => 사이(next, d + 1, d * 3 - 1), (a, b) => a === b || a % d === 0 || b % d === 0);
      if (!ns || ns.some((n) => n % d === 0)) return null;
      return ns.map((n) => ({ label: next(2) ? `${n}/${d}` : 대분수글(Math.floor(n / d), n % d, d), value: n / d }));
    }
    case 'dec1': {
      const vs = 서로다른(k, () => 사이(next, 1, 29));
      if (!vs || vs.some((v) => v % 10 === 0)) return null;
      return vs.map((v) => ({ label: (v / 10).toFixed(1), value: v / 10 }));
    }
    case 'dec2': {
      // 0.5와 0.45처럼 자릿수가 많다고 크지 않은 수를 섞습니다.
      const a = 사이(next, 1, 8);
      const b = 사이(next, 1, 9);
      const 후보 = [`0.${a}`, `0.${a}${b}`, `0.${b}${a}`, `0.${a}0${b}`, `${a}.${b}`, `0.${(a + 1) % 10 || 1}`];
      const 고른 = 뽑기([...new Set(후보)], k, next);
      const vs = 고른.map((t) => ({ label: t, value: Number(t) }));
      return new Set(vs.map((v) => v.value)).size === k ? vs : null;
    }
    case 'fracdiff': {
      const 후보 = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 8], [5, 8], [7, 8], [5, 12], [7, 12], [7, 10], [3, 10], [4, 9], [5, 9]];
      const 고른 = 뽑기(후보, k, next);
      const vs = 고른.map(([n, d]) => ({ label: `${n}/${d}`, value: n / d }));
      return new Set(vs.map((v) => v.value)).size === k ? vs : null;
    }
    case 'fracdec': {
      const 분수 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [3, 10], [7, 10], [9, 20], [7, 20], [3, 8]];
      const 소수 = ['0.3', '0.45', '0.6', '0.72', '0.35', '0.8', '0.55', '0.25'];
      const 고른분수 = 뽑기(분수, Math.ceil(k / 2), next).map(([n, d]) => ({ label: `${n}/${d}`, value: n / d }));
      const 고른소수 = 뽑기(소수, Math.floor(k / 2), next).map((t) => ({ label: t, value: Number(t) }));
      const vs = [...고른분수, ...고른소수];
      return new Set(vs.map((v) => Math.round(v.value * 1000))).size === k ? 섞기(vs, next) : null;
    }
    case 'length': {
      const 물건 = 뽑기([['연필', '✏️'], ['크레파스', '🖍️'], ['붓', '🖌️'], ['빨대', '🥤'], ['열쇠', '🔑'], ['숟가락', '🥄'], ['리본', '🎀']], k, next);
      const 길이 = 서로다른(k, () => 사이(next, 3, 11), (a, b) => Math.abs(a - b) < 2);
      return 길이 ? 물건.map(([label, emoji], i) => ({ label, emoji, value: 길이[i], len: 길이[i] })) : null;
    }
  }
};

export const 크기순서 = (종류: 순서종류, k: number, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `order-${종류}-${k}`,
  make: (seed) => {
    const next = 고르개(seed);
    const raw = 순서재료(종류, k, next);
    if (!raw || raw.length !== k) return null;
    const items = 섞기(raw, next);
    // 이미 차례대로 놓여 있으면 할 일이 없으므로 다시 고릅니다.
    const 큰부터 = next(2) === 0;
    const dir = 큰부터 ? 'desc' as const : 'asc' as const;
    const 정렬 = [...items].sort((a, b) => (큰부터 ? b.value - a.value : a.value - b.value));
    if (정렬.every((x, i) => x === items[i])) return null;
    const 길이 = 종류 === 'length';
    const 말 = 길이 ? (큰부터 ? '가장 긴 것부터' : '가장 짧은 것부터') : (큰부터 ? '큰 수부터' : '작은 수부터');
    const 기호 = 큰부터 ? ' > ' : ' < ';
    const 분수 = /frac/.test(종류);
    const 소수 = 종류.startsWith('dec');
    const 첫걸음 = 길이
      ? '물건들의 왼쪽 끝이 맞추어져 있어요. 오른쪽 끝이 어디까지 나왔는지 견주어 보세요.'
      : 종류 === 'unitfrac' ? '단위분수는 분모가 클수록 전체를 더 잘게 나눈 것이라 한 조각이 작아요.'
        : 종류 === 'samefrac' ? '분모가 같으면 분자만 비교하면 돼요.'
          : 종류 === 'mixedfrac' ? '가분수를 대분수로(또는 대분수를 가분수로) 바꾸어 같은 꼴로 만든 다음 비교해요.'
            : 종류 === 'fracdiff' ? '두 분수씩 분모를 같게 통분하거나, 1/2과 견주어 큰지 작은지 먼저 나누어 보세요.'
              : 종류 === 'fracdec' ? '분수를 분모가 10이나 100인 분수로 고쳐 소수로 나타낸 다음 비교해요.'
                : 종류 === 'dec1' ? '자연수 부분을 먼저 비교하고, 같으면 소수 부분(0.1이 몇 개인지)을 비교해요.'
                : 소수 ? '자연수 부분부터 비교하고, 같으면 소수 첫째 자리, 그다음 둘째 자리를 비교해요. 0.5는 0.50과 같아요.'
                  : 종류 === 'big' || 종류 === 'n4' || 종류 === 'n3' ? '먼저 자릿수를 세어 보세요. 자릿수가 같으면 가장 높은 자리의 숫자부터 차례로 비교해요.'
                    : 종류 === 'n9' ? '수를 하나, 둘, 셋… 순서대로 세어 보며 먼저 나오는 수가 작은 수예요.'
                      : '먼저 십의 자리 숫자를 비교하고, 같으면 일의 자리 숫자를 비교해요.';
    const 답 = 정렬.map((x) => x.label).join(기호);
    return {
      prompt: 길이 ? `왼쪽 끝을 맞추어 놓은 물건들입니다. ${말} 차례로 눌러 늘어놓아 보세요.` : `${말} 차례로 눌러 늘어놓아 보세요.`,
      answer: 답,
      manipulate: { kind: 'order', items, dir },
      tag: 길이 ? 'measurement' : 분수 ? (종류 === 'fracdiff' || 종류 === 'fracdec' ? 'fractionCompare' : 'fraction') : 소수 ? 'decimal' : 'number',
      strategy: 길이 ? '한쪽 끝을 맞추어 길이 비교하기' : '수의 크기를 비교하여 순서대로 놓기',
      hint: 첫걸음,
      steps: [
        첫걸음,
        길이 ? `${말} 하나씩 골라 차례로 누릅니다.` : `가장 ${큰부터 ? '큰' : '작은'} 것을 먼저 찾아 누르고, 남은 것 가운데에서 다시 가장 ${큰부터 ? '큰' : '작은'} 것을 찾습니다.`,
        `그러므로 ${답} 차례입니다.`,
      ],
      concept: 길이 ? '길이를 비교할 때는 한쪽 끝을 맞추고 다른 쪽 끝을 봅니다.' : '두 수씩 크기를 비교하며 차례를 정합니다.',
      misconception: 길이 ? '끝을 맞추지 않고 보면 길이를 잘못 비교하기 쉽습니다.' : 분수 ? '분모가 큰 분수가 더 크다고 생각하기 쉽습니다.' : 소수 ? '소수점 아래 숫자가 많으면 더 큰 수라고 생각하기 쉽습니다.' : '숫자의 개수나 첫 숫자만 보고 비교하기 쉽습니다.',
      결,
    };
  },
});

// ── 몇째 고르기(1-1) ──────────────────────────────────────────────
export const 몇째고르기: 조작갈래 = {
  id: 'ordinal-pick',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 왼쪽에서 몇째·몇 개(작은 수), 중: 큰 수, 상: 오른쪽에서 몇째
    const parts = lv === 0 ? 사이(next, 5, 6) : 사이(next, 7, 9);
    const k = lv === 0 ? 사이(next, 2, 3) : 사이(next, 4, Math.min(7, parts - 1));
    const 몇개 = lv < 2 && next(2) === 0;
    const 오른쪽 = lv === 2;
    const emoji = ['🍎', '🐥', '🚗', '⭐', '🌷'][next(5)];
    const 이름 = { '🍎': '사과', '🐥': '병아리', '🚗': '자동차', '⭐': '별', '🌷': '꽃' }[emoji]!;
    const exact = 몇개 ? Array.from({ length: k }, (_, i) => i) : [오른쪽 ? parts - k : k - 1];
    return {
      prompt: 몇개 ? `${이름}이(가) 한 줄로 서 있습니다. 왼쪽에서부터 ${이름} ${k}개를 눌러 보세요.` : `${이름}이(가) 한 줄로 서 있습니다. ${오른쪽 ? '오른쪽' : '왼쪽'}에서 ${째말(k - 1)} ${이름}을(를) 눌러 보세요.`,
      answer: 몇개 ? `왼쪽부터 ${k}개` : `${오른쪽 ? '오른쪽' : '왼쪽'}에서 ${째말(k - 1)}`,
      manipulate: { kind: 'tap-fill', layout: 'objects', parts, cols: parts, pre: [], target: exact.length, emoji, exact },
      tag: 'number',
      strategy: '몇째와 몇 개를 구별하기',
      hint: 몇개 ? '하나, 둘, 셋… 세면서 처음부터 차례로 모두 눌러요.' : `${오른쪽 ? '오른쪽' : '왼쪽'} 끝에서부터 첫째, 둘째, 셋째… 세어 가다가 멈춘 하나만 눌러요.`,
      steps: 몇개
        ? ['몇 개는 모두 몇인지를 나타냅니다.', '왼쪽 끝에서부터 하나, 둘, 셋… 세면서 차례로 누릅니다.', `${k}까지 세었으면 멈춥니다. 모두 ${k}개를 누릅니다.`]
        : ['몇째는 순서를 나타냅니다.', `${오른쪽 ? '오른쪽' : '왼쪽'} 끝의 ${이름}이(가) 첫째입니다.`, `첫째, 둘째, 셋째… 하고 세어 ${째말(k - 1)}인 하나만 누릅니다.`],
      concept: '몇째는 순서를, 몇 개는 양을 나타냅니다.',
      misconception: '셋째를 고르라고 했는데 셋을 모두 고르기 쉽습니다.',
      결: 몇개 ? 0 : 오른쪽 ? 2 : 1,
    };
  },
};

// ── 수 배열표에서 규칙 찾기 ───────────────────────────────────────
export const 수배열표 = (시작들: number[], 걸음들: number[], 결: 0 | 1 | 2): 조작갈래 => ({
  id: `numgrid-${시작들.join('-')}-${걸음들.join('-')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const from = 시작들[next(시작들.length)];
    const 걸음 = 걸음들[next(걸음들.length)];
    // 작은 수씩 뛰어 세면 칠할 칸이 많아지므로 판을 줄입니다.
    const parts = 걸음 < 5 ? 30 : 50;
    // 9씩(↙)과 11씩(↘)은 대각선이 끊기지 않도록 첫 줄의 알맞은 자리에서 시작합니다.
    const 첫 = 걸음 === 9 ? 사이(next, 4, 9) : 걸음 === 11 ? 사이(next, 0, 5) : 사이(next, 0, Math.min(9, 걸음 - 1));
    const 칸들: number[] = [];
    for (let k = 첫; k < parts; k += 걸음) 칸들.push(k);
    if (칸들.length < 5) return null;
    const pre = 칸들.slice(0, 3);
    const 방향 = 걸음 === 10 ? '아래로' : 걸음 === 11 ? '오른쪽 아래로' : 걸음 === 9 ? '왼쪽 아래로' : '오른쪽으로';
    return {
      prompt: `수 배열표에서 색칠한 수에는 규칙이 있습니다. 규칙에 따라 나머지 수에도 모두 색칠해 보세요.`,
      answer: `${칸들.map((k) => from + k).join(', ')}에 색칠`,
      manipulate: { kind: 'tap-fill', layout: 'numgrid', parts, cols: 10, pre, target: 칸들.length, exact: 칸들, from },
      tag: 'pattern',
      strategy: '수 배열표에서 수가 얼마씩 커지는지 찾기',
      hint: `색칠한 수 ${from + pre[0]}, ${from + pre[1]}, ${from + pre[2]}을(를) 보세요. 다음 수로 갈 때마다 얼마씩 커지는지 세어 보세요.`,
      steps: [`색칠한 수는 ${from + pre[0]}, ${from + pre[1]}, ${from + pre[2]}입니다.`, `${from + pre[1]}-${from + pre[0]}=${걸음}이므로 ${걸음}씩 커지는 규칙입니다 — 수 배열표에서는 ${방향} 이어집니다.`, `${from + pre[2]}에서부터 ${걸음}씩 뛰어 세며 끝까지 색칠합니다.`],
      concept: '수 배열표에서 오른쪽으로 한 칸 가면 1씩, 아래로 한 칸 가면 10씩 커집니다.',
      misconception: '규칙을 끝까지 이어 가지 않고 중간에 멈추거나, 한 칸씩 어긋나게 칠하기 쉽습니다.',
      결,
    };
  },
});

// ── 곱셈표 ────────────────────────────────────────────────────────
export const 곱셈표찾기: 조작갈래 = {
  id: 'multtable-product',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 칸이 2개인 곱, 중: 칸이 3개 이상인 작은 곱, 상: 칸이 3개 이상인 큰 곱
    const 후보 = [[10, 14, 15, 20, 21, 28, 35, 40, 45, 56, 63, 72], [4, 6, 8, 9, 12, 16], [18, 24, 36]][lv];
    const P = 후보[next(후보.length)];
    const exact: number[] = [];
    for (let a = 1; a <= 9; a += 1) for (let b = 1; b <= 9; b += 1) if (a * b === P) exact.push((a - 1) * 9 + (b - 1));
    if (exact.length < 2) return null;
    if (lv > 0 && exact.length < 3) return null;
    return {
      prompt: `곱셈표에서 곱이 ${P}인 칸을 모두 찾아 눌러 색칠해 보세요. 칸에는 곱이 적혀 있지 않습니다.`,
      answer: `${exact.map((k) => `${Math.floor(k / 9) + 1}×${(k % 9) + 1}`).join(', ')}`,
      manipulate: { kind: 'tap-fill', layout: 'multtable', parts: 81, cols: 9, pre: [], target: exact.length, exact },
      tag: 'multiplication',
      strategy: '곱셈구구로 곱이 같은 곱셈식 찾기',
      hint: `1단부터 9단까지 차례로 외워 보며 곱이 ${P}이(가) 나오는 곱셈구구를 찾아요. 곱하는 두 수의 순서를 바꾸어도 곱은 같아요.`,
      steps: [`곱셈표에서 칸의 곱은 맨 왼쪽 줄의 수와 맨 윗줄의 수를 곱한 것입니다.`, `곱셈구구에서 곱이 ${P}인 것을 모두 찾습니다.`, `${exact.map((k) => `${Math.floor(k / 9) + 1}×${(k % 9) + 1}`).join(', ')}이(가) ${P}이므로 그 칸에 모두 색칠합니다.`],
      concept: '곱셈표에서 곱하는 두 수의 순서를 바꾸어도 곱은 같습니다. 그래서 같은 곱이 대각선을 사이에 두고 마주 보며 나옵니다.',
      misconception: '한 칸만 찾고 순서를 바꾼 곱셈식의 칸을 빠뜨리기 쉽습니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
};

// ── 시간 띠(하루의 시간) ──────────────────────────────────────────
const 시각글 = (h: number) => `${h < 12 ? '오전' : '오후'} ${h % 12 === 0 ? 12 : h % 12}시`;
export const 시간띠: 조작갈래 = {
  id: 'hours-bar',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 오전 안에서, 중: 오후 안에서, 상: 낮 12시를 지나는 시간
    const 종류 = [0, 2, 1][lv];
    const 시작 = 종류 === 0 ? 사이(next, 6, 9) : 종류 === 1 ? 사이(next, 8, 11) : 사이(next, 13, 16);
    const 끝 = 종류 === 0 ? 사이(next, 시작 + 2, 11) : 종류 === 1 ? 사이(next, 13, 17) : 사이(next, 시작 + 2, 21);
    if (끝 <= 시작) return null;
    const 이름 = ['지우', '하준', '서아', '도윤'][next(4)];
    const 일 = [['박물관에 들어가서', '나왔습니다', '박물관에 있었던'], ['집을 나서서', '돌아왔습니다', '집 밖에 있었던'], ['도서관에 가서', '집으로 왔습니다', '도서관에 있었던']][next(3)];
    const exact = Array.from({ length: 끝 - 시작 }, (_, k) => 시작 + k);
    return {
      prompt: `${이름}은(는) ${시각글(시작)}에 ${일[0]} ${시각글(끝)}에 ${일[1]}. ${일[2]} 시간만큼 시간 띠를 색칠해 보세요. 한 칸은 1시간입니다.`,
      answer: `${시각글(시작)}부터 ${시각글(끝)}까지 ${끝 - 시작}칸`,
      manipulate: { kind: 'tap-fill', layout: 'hours', parts: 24, cols: 12, pre: [], target: exact.length, exact },
      tag: 'time',
      strategy: '시간 띠로 걸린 시간 알아보기',
      hint: `시간 띠의 윗줄은 오전, 아랫줄은 오후예요. ${시각글(시작)} 눈금에서 시작해 ${시각글(끝)} 눈금까지 한 칸씩 색칠해요.`,
      steps: ['하루는 24시간이고, 오전 12시간과 오후 12시간으로 나뉩니다.', `${시각글(시작)}에서 ${시각글(끝)}까지 1시간마다 한 칸씩 셉니다${시작 < 12 && 끝 > 12 ? ' — 낮 12시를 지나면 오후입니다' : ''}.`, `그러므로 ${시각글(시작)}부터 ${시각글(끝)}까지 ${끝 - 시작}칸을 색칠합니다.`],
      concept: '전날 밤 12시부터 낮 12시까지를 오전, 낮 12시부터 밤 12시까지를 오후라고 합니다.',
      misconception: '오후 시각을 오전 칸에 칠하거나, 낮 12시를 지날 때 시간을 잘못 세기 쉽습니다.',
      결: lv,
    };
  },
};

// ── 규칙에 따라 빈칸 채우기 ───────────────────────────────────────
const 그림묶음 = [['🍎', '🍌', '🍇'], ['🔴', '🔵', '🟡'], ['⭐', '🌙', '☀️'], ['🐶', '🐱', '🐰'], ['🟥', '🟦', '🟨']];
const 되풀이들: Record<0 | 1 | 2, number[][]> = {
  0: [[0, 1], [0, 1, 2]],
  1: [[0, 0, 1], [0, 1, 1], [0, 1, 2]],
  2: [[0, 0, 1, 1], [0, 1, 1, 2], [0, 1, 0, 2], [0, 0, 1, 2]],
};
export const 규칙채우기 = (줄: 1 | 3, 결: 0 | 1 | 2): 조작갈래 => ({
  id: `pattern-${줄}-${결}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 묶음 = 되풀이들[결][next(되풀이들[결].length)];
    const p = 묶음.length;
    const palette = 줄 === 3 ? 그림묶음[next(2) ? 4 : 1] : 그림묶음[next(그림묶음.length)];
    const cols = 줄 === 3 ? 사이(next, 4, 6) : 2 * p + 2 + 결;
    if (줄 === 3 && cols % p === 0) return null;
    const L = 줄 === 3 ? cols * 3 : Math.min(12, cols);
    const answer = Array.from({ length: L }, (_, i) => 묶음[i % p]);
    // 되풀이되는 묶음이 두 번은 온전히 보이도록, 빈칸은 그 뒤에만 둡니다.
    const 빈후보 = Array.from({ length: L - 2 * p }, (_, i) => 2 * p + i);
    const 빈수 = Math.min(빈후보.length, 줄 === 3 ? 3 + 결 : 2 + 결);
    if (빈수 < 2) return null;
    const 빈 = new Set(결 === 0 && 줄 === 1 ? 빈후보.slice(-빈수) : 뽑기(빈후보, 빈수, next));
    const given = answer.map((v, i) => (빈.has(i) ? null : v));
    const 한묶음 = 묶음.map((v) => palette[v]).join('');
    return {
      prompt: 줄 === 3
        ? '규칙에 따라 무늬를 꾸미고 있습니다. 무늬는 윗줄의 오른쪽 끝에서 다음 줄 왼쪽으로 이어집니다. 빈칸에 알맞은 색을 골라 채워 보세요.'
        : '규칙에 따라 늘어놓았습니다. 빈칸에 알맞은 그림을 골라 채워 보세요.',
      answer: `${한묶음}이(가) 되풀이됨`,
      manipulate: { kind: 'pattern', palette, cols: 줄 === 3 ? cols : L, given, answer },
      tag: 'pattern',
      strategy: '되풀이되는 부분을 찾아 규칙 이어 가기',
      hint: '처음부터 하나씩 짚으며 같은 차례가 다시 시작되는 곳을 찾아보세요. 되풀이되는 묶음을 찾으면 빈칸에 무엇이 올지 알 수 있어요.',
      steps: [`처음부터 보면 ${한묶음}이(가) 한 묶음으로 되풀이됩니다.`, `묶음 안의 차례대로 ${p}개씩 끊어 짚어 갑니다${줄 === 3 ? ' — 줄이 바뀌어도 앞 줄에 이어서 셉니다' : ''}.`, '빈칸은 묶음에서 그 자리에 오는 그림으로 채웁니다.'],
      concept: '규칙은 되풀이되는 부분을 찾아 말하고 이어 가는 것입니다.',
      misconception: '바로 앞의 그림만 보고 채우거나, 줄이 바뀔 때 처음부터 다시 세기 쉽습니다.',
      결,
    };
  },
});

// ── 수 모형으로 계산하기 ──────────────────────────────────────────
const 자리수들 = (n: number, places: number[]) => places.map((p) => Math.floor(n / p) % 10);
const 자리글 = { 100: '백', 10: '십', 1: '일' } as Record<number, string>;
/** 받아올림(받아내림)이 생기는 자리의 수를 셉니다. */
const 올림수 = (a: number, b: number, op: '+' | '-', places: number[]) => {
  let 수 = 0;
  let 빌림 = 0;
  for (let i = places.length - 1; i >= 0; i -= 1) {
    const x = Math.floor(a / places[i]) % 10;
    const y = Math.floor(b / places[i]) % 10;
    if (op === '+') { 빌림 = x + y + 빌림 >= 10 ? 1 : 0; 수 += 빌림; } else { 빌림 = x - y - 빌림 < 0 ? 1 : 0; 수 += 빌림; }
  }
  return 수;
};

export const 수모형계산 = (places: number[], op: '+' | '-', 받아: 0 | 1 | 2, b한자리 = false): 조작갈래 => ({
  id: `base-ten-calc-${places.join('-')}-${op}-${받아}${b한자리 ? '-b1' : ''}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 작은 수, 중: 큰 수, 상: □가 있는 식(처음 수에서 결과가 되도록 모형을 더하거나 덜어 내고 □ 구하기)
    const 최대 = lv === 0 ? places[0] * 5 - 1 : places[0] * 10 - 1;
    const a = lv === 0 ? 사이(next, places[0] + 1, 최대) : 사이(next, places[0] * 3, 최대);
    const b한계 = op === '+' ? 최대 - a : a - 1;
    if (!b한자리 && b한계 < places[0]) return null;
    const b = b한자리 ? 사이(next, 2, 9) : 사이(next, places[0], b한계);
    const 결과 = op === '+' ? a + b : a - b;
    if (결과 > 최대 || 결과 < 1) return null;
    const 몇번 = 올림수(a, b, op, places);
    if (받아 === 0 ? 몇번 !== 0 : 받아 === 1 ? 몇번 !== 1 : 몇번 < 2) return null;
    // 일의 자리가 0인 수를 빼면(몇십-몇십몇) 처음부터 바꾸어야 합니다.
    if (결과 < 10) return null;
    const 바꿈 = op === '+' ? '같은 자리 모형이 10개가 되면 윗자리 모형 1개로 바꾸어요' : '덜어 낼 모형이 모자라면 윗자리 모형 1개를 아랫자리 모형 10개로 바꾸어요';
    const 놓을것 = 자리수들(b, places).map((c, i) => (c ? `${자리글[places[i]]} 모형 ${c}개` : '')).filter(Boolean).reverse().join(', ');
    const 식 = `${a}${op}${b}`;
    const 자리 = [...places].reverse();
    if (lv === 2) {
      return {
        prompt: `${a}${op}□=${결과}에서 □를 구하려고 합니다. 수 모형 ${a}에서 모형을 ${op === '+' ? '더 놓아' : '덜어 내어'} ${결과}을(를) 만들어 보세요. ${op === '+' ? '더 놓은' : '덜어 낸'} 모형이 나타내는 수가 □입니다.${받아 ? ` ${바꿈}.` : ''}`,
        answer: `${결과}을(를) 만들면 □=${b}`,
        manipulate: { kind: 'base-ten', places, target: 결과, start: 자리수들(a, places), trade: 받아 > 0 },
        tag: op === '+' ? 'addition' : 'subtraction',
        strategy: '덧셈과 뺄셈의 관계로 □ 구하기',
        hint: `${a}과(와) ${결과}을(를) 자리마다 견주어 보세요. 자리마다 모형이 몇 개 ${op === '+' ? '모자란지' : '남는지'} 세면 □를 알 수 있어요.${받아 ? ' 모자라거나 넘치는 자리는 윗자리와 바꾸어 정리해요.' : ''}`,
        steps: [`${a}${op}□=${결과}은(는) ${op === '+' ? `${결과}-${a}=□` : `${a}-${결과}=□`}와 같습니다.`.replace('와 같습니다', '과(와) 같습니다'), `수 모형 ${a}에서 ${op === '+' ? '더 놓아' : '덜어 내어'} ${결과}을(를) 만들고, ${op === '+' ? '더 놓은' : '덜어 낸'} 모형을 셉니다.`, `그러므로 □=${b}입니다.`],
        concept: '덧셈과 뺄셈은 서로 거꾸로 하는 계산이므로, 덧셈식의 □는 뺄셈으로, 뺄셈식의 □는 덧셈이나 뺄셈으로 구할 수 있습니다.',
        misconception: '□ 자리를 생각하지 않고 보이는 두 수를 그대로 더하기 쉽습니다.',
        결: 2,
      };
    }
    return {
      prompt: `수 모형이 ${a}을(를) 나타내고 있습니다. ${b}만큼 모형을 ${op === '+' ? '더 놓아' : '덜어 내어'} ${식}을(를) 구해 보세요.${받아 ? ` ${바꿈}.` : ''}`,
      answer: String(결과),
      manipulate: { kind: 'base-ten', places, target: 결과, start: 자리수들(a, places), trade: 받아 > 0 },
      tag: op === '+' ? 'addition' : 'subtraction',
      strategy: 받아 ? `수 모형으로 ${op === '+' ? '받아올림' : '받아내림'}하기` : '같은 자리 모형끼리 계산하기',
      hint: op === '+'
        ? `${놓을것}만큼 낮은 자리부터 차례로 더 놓아요.${받아 ? ' 한 자리에 모형이 10개가 넘으면 「10개 → 1개」를 눌러 윗자리 모형 1개로 바꾸어요.' : ''}`
        : `${놓을것}만큼 낮은 자리부터 차례로 덜어 내요.${받아 ? ' 덜어 낼 모형이 모자라면 윗자리에서 「1개 → 10개」를 눌러 바꾼 다음 덜어 내요.' : ''}`,
      steps: [
        `${a}은(는) ${places.map((p) => `${자리글[p]} 모형 ${Math.floor(a / p) % 10}개`).join(', ')}입니다.`,
        `일의 자리부터 같은 자리 모형끼리 ${op === '+' ? '더합니다' : '뺍니다'}${받아 ? (op === '+' ? ' — 10개가 되면 윗자리 모형 1개로 바꿉니다' : ' — 모자라면 윗자리 모형 1개를 10개로 바꿉니다') : ''}.`,
        `${자리.map((p) => `${자리글[p]} 모형 ${Math.floor(결과 / p) % 10}개`).reverse().join(', ')}가 되므로 ${식}=${결과}입니다.`,
      ],
      concept: op === '+' ? '같은 자리끼리 더하고, 10이 되면 윗자리로 받아올립니다.' : '같은 자리끼리 빼고, 뺄 수 없으면 윗자리에서 10을 받아내립니다.',
      misconception: op === '+' ? '받아올린 1을 윗자리에 더하지 않기 쉽습니다.' : '큰 수에서 작은 수를 거꾸로 빼거나(3-7을 7-3으로), 받아내린 뒤 윗자리를 1 줄이지 않기 쉽습니다.',
      결: 받아 === 2 ? 2 : lv === 1 || 받아 === 1 ? 1 : 0,
    };
  },
});

// ── 돈으로 큰 수 만들기(4-1) ──────────────────────────────────────
export const 돈으로만들기 = (종류: 'man' | 'five'): 조작갈래 => ({
  id: `money-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const places = [10000, 1000, 100, 10];
    const n = 종류 === 'man' ? 사이(next, 1, 5) * 10000 + 사이(next, 0, 9) * 1000 + (lv === 2 ? 사이(next, 1, 9) * 100 : 0) : 사이(next, 1, 9) * 10000 + 사이(next, 0, 9) * 1000 + 사이(next, 0, 9) * 100 + 사이(next, 0, 9) * 10;
    // 하: 0인 자리가 없는 수, 중: 0인 자리가 하나, 상: 0인 자리가 둘 이상(빠뜨리기 쉬움)
    const 영 = [1000, 100, 10].filter((p) => Math.floor(n / p) % 10 === 0).length;
    if (종류 === 'five' && (lv === 0 ? 영 !== 0 : lv === 1 ? 영 !== 1 : 영 < 2)) return null;
    if (종류 === 'man' && lv === 1 && Math.floor(n / 1000) % 10 !== 0) return null;
    const 글 = String(n);
    return {
      prompt: `만 원짜리, 천 원짜리, 백 원짜리, 십 원짜리로 ${글}원을 만들어 보세요. 돈은 가장 적은 장수(개수)로 놓아요.`,
      answer: `${글}원`,
      manipulate: { kind: 'base-ten', places, target: n, money: true },
      tag: 'placeValue',
      strategy: '자리의 값을 생각하여 돈으로 나타내기',
      hint: '가장 높은 자리부터 읽어요. 만의 자리 숫자만큼 만 원짜리를, 천의 자리 숫자만큼 천 원짜리를 놓아요. 0인 자리는 놓지 않아요.',
      steps: [`${글}에서 만의 자리, 천의 자리, 백의 자리, 십의 자리 숫자를 차례로 읽습니다.`, '각 자리 숫자만큼 그 자리의 돈을 놓습니다 — 천 원짜리 10장은 만 원짜리 1장과 같습니다.', `그러므로 ${places.map((p) => `${{ 10000: '만', 1000: '천', 100: '백', 10: '십' }[p]} 원짜리 ${Math.floor(n / p) % 10}`).join(', ')}을(를) 놓으면 ${글}원입니다.`],
      concept: '10000은 1000이 10개인 수이고, 만이라고 읽습니다. 다섯 자리 수는 자리마다 숫자가 나타내는 값이 다릅니다.',
      misconception: '0인 자리를 빼고 나머지 숫자를 앞으로 당겨 놓기 쉽습니다.',
      결: lv,
    };
  },
});

// ── 똑같이 나누어 담기 ────────────────────────────────────────────
const 담을것 = [['사탕', '🍬'], ['딸기', '🍓'], ['구슬', '🔵'], ['쿠키', '🍪'], ['귤', '🍊']] as const;
export const 나누어담기 = (종류: 'share' | 'group' | 'group2' | 'rest' | 'rest-big' | 'big'): 조작갈래 => ({
  id: `share-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const [이름, emoji] = 담을것[next(담을것.length)];
    // 하: 적은 수를 적은 접시에, 중: 조금 더 많이, 상: 많은 수를 많은 접시에
    if (종류 === 'share' || 종류 === 'big') {
      // 내림이 있는 (몇십몇)÷(몇): 십의 자리가 나누는 수로 나누어떨어지지 않고 몫이 10보다 큰 것
      const g = 종류 === 'big' ? [2, 3, 4][lv] : [사이(next, 2, 3), 사이(next, 3, 4), 사이(next, 4, 6)][lv];
      const 내림후보 = Array.from({ length: 40 }, (_, i) => 20 + i).filter((t) => t % g === 0 && Math.floor(t / 10) % g !== 0 && t / g >= 10);
      const q = 종류 === 'big' ? (내림후보.length ? 내림후보[next(내림후보.length)] / g : 0) : [사이(next, 2, 3), 사이(next, 3, 5), 사이(next, 4, 7)][lv];
      if (!q) return null;
      const total = g * q;
      if (total > 56) return null;
      if (종류 === 'big' && Math.floor(total / 10) % g === 0) return null;
      return {
        prompt: `${이름} ${total}개를 접시 ${g}개에 똑같이 나누어 담아 보세요. 접시를 누를 때마다 하나씩 담깁니다.`,
        answer: `한 접시에 ${q}개씩`,
        manipulate: { kind: 'share', total, groups: g, emoji, rest: false },
        tag: 'division',
        strategy: '하나씩 돌아가며 똑같이 나누기',
        hint: `접시 ${g}개에 하나씩 돌아가며 담아요. 한 바퀴 돌 때마다 ${g}개가 줄어들어요.`,
        steps: [`${이름}을(를) 접시마다 하나씩 차례로 담습니다.`, `한 바퀴에 ${g}개씩 담기므로, 남은 것이 없을 때까지 되풀이합니다.`, `${total}÷${g}=${q}이므로 한 접시에 ${q}개씩 담깁니다.`],
        concept: '똑같이 나누는 것을 나눗셈으로 나타낼 수 있습니다. 나누어 담은 한 접시의 수가 몫입니다.',
        misconception: '한 접시에 많이 담고 다른 접시에 적게 담아 똑같이 나누지 않기 쉽습니다.',
        결: 종류 === 'big' ? 2 : lv,
      };
    }
    if (종류 === 'group' || 종류 === 'group2') {
      const size = [사이(next, 2, 3), 사이(next, 3, 5), 사이(next, 4, 6)][lv];
      const q = [사이(next, 2, 3), 사이(next, 3, 5), 사이(next, 4, 6)][lv];
      const total = size * q;
      if (total > 36) return null;
      const 둘 = 종류 === 'group2';
      return {
        prompt: 둘
          ? `${이름} ${total}개를 ${size}개씩 묶으려고 합니다. ＋ 접시를 눌러 접시를 놓고, 한 접시에 ${size}개씩 담아 보세요.`
          : `${이름} ${total}개를 한 접시에 ${size}개씩 담으려고 합니다. ＋ 접시를 눌러 접시를 놓고 담아 보세요.`,
        answer: 둘 ? `${size}개씩 ${q}묶음` : `접시 ${q}개`,
        manipulate: { kind: 'share', total, size, emoji, rest: false },
        tag: 둘 ? 'multiplication' : 'division',
        strategy: 둘 ? '몇씩 묶어 세기' : '몇씩 덜어 내며 나누기',
        hint: `한 접시에 ${size}개를 담으면 ${total}개에서 ${size}개가 줄어요. 남은 것이 없을 때까지 접시를 하나씩 더 놓아요.`,
        steps: [`접시 하나에 ${size}개씩 담습니다.`, `${total}에서 ${size}씩 덜어 내면 ${Array.from({ length: q }, (_, i) => total - size * (i + 1)).join(', ')}이(가) 남습니다.`, 둘 ? `${size}개씩 ${q}묶음이 되므로 ${size}의 ${q}배입니다.` : `${q}번 덜어 내었으므로 접시는 ${q}개이고, ${total}÷${size}=${q}입니다.`],
        concept: 둘 ? '몇씩 몇 묶음으로 묶어 세면 많은 수를 빠르게 셀 수 있습니다.' : '전체를 몇씩 덜어 내어 몇 번 덜어 낼 수 있는지 구하는 것도 나눗셈입니다.',
        misconception: '접시마다 담는 수를 다르게 하거나, 마지막에 남은 것을 그대로 두기 쉽습니다.',
        결: lv === 2 ? 2 : 1,
      };
    }
    // 나머지가 있는 나눗셈(3-2)
    const g = 종류 === 'rest-big' ? (lv === 2 ? 3 : 2) : [3, 사이(next, 4, 5), 사이(next, 5, 7)][lv];
    // 내림이 있고 나머지가 있는 것: 하·중은 2로(30~39), 상은 3으로(40~44) 나눕니다.
    const total = 종류 === 'rest-big' ? (lv === 2 ? 사이(next, 40, 44) : [사이(next, 31, 35), 사이(next, 33, 39)][lv]) : [사이(next, 10, 17), 사이(next, 16, 23), 사이(next, 22, 34)][lv];
    const q = Math.floor(total / g);
    const r = total % g;
    if (r === 0) return null;
    if (종류 === 'rest-big' && Math.floor(total / 10) % g === 0) return null;
    return {
      prompt: `${이름} ${total}개를 접시 ${g}개에 똑같이 나누어 담고, 남는 것은 그대로 두세요.`,
      answer: `한 접시에 ${q}개씩, ${r}개 남음`,
      manipulate: { kind: 'share', total, groups: g, emoji, rest: true },
      tag: 'division',
      strategy: '똑같이 나누고 남는 것 알기(나머지)',
      hint: `접시 ${g}개에 하나씩 돌아가며 담아요. 남은 것이 ${g}개보다 적어 모든 접시에 하나씩 더 담을 수 없으면 멈춰요.`,
      steps: [`접시 ${g}개에 하나씩 돌아가며 똑같이 담습니다.`, `남은 것이 ${g}개보다 적으면 더 이상 똑같이 나눌 수 없습니다.`, `${total}÷${g}=${q}…${r}이므로 한 접시에 ${q}개씩 담고 ${r}개가 남습니다.`],
      concept: '나머지는 나누는 수보다 항상 작아야 합니다.',
      misconception: '남은 것이 나누는 수보다 많은데도 멈추거나, 남은 것을 한 접시에 몰아 담기 쉽습니다.',
      결: lv === 0 ? 1 : 2,
    };
  },
});

// ── 점 배열로 곱셈·나눗셈 ─────────────────────────────────────────
export const 점배열 = (종류: 'times' | 'mul' | 'dan' | 'dan-more' | 'dan-product' | 'div' | 'times-think', 단들: number[] = [2, 3, 4, 5, 6, 7, 8, 9]): 조작갈래 => ({
  id: `array-${종류}-${단들.join('')}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 작은 수, 중: 중간, 상: 큰 수(단이 정해진 곱셈구구는 곱하는 수만 커집니다)
    const 고른단 = 단들.length > 2 ? 단들.filter((d) => (lv === 0 ? d <= 4 : lv === 1 ? d >= 3 && d <= 6 : d >= 5)) : 단들;
    const a = (고른단.length ? 고른단 : 단들)[next((고른단.length ? 고른단 : 단들).length)];
    const b = [사이(next, 2, 4), 사이(next, 4, 6), 사이(next, 6, 종류 === 'dan-more' ? 8 : 9)][lv];
    if (a * b > 81 || a > 9) return null;
    // 나눗셈은 '점 몇 개'라고 말하므로 점으로 놓습니다.
    const emoji = 종류 === 'div' ? '●' : ['●', '🍓', '⭐', '🍪'][next(4)];
    let prompt = '';
    let rows = b;
    let cols = a;
    let answer = '';
    let steps: [string, string, string];
    let hint = '';
    let 결: 0 | 1 | 2 = 1;
    if (종류 === 'times') {
      prompt = `${a}의 ${b}배만큼 놓으려고 합니다. 한 줄에 ${a}개씩 놓아 점 배열을 만들어 보세요.`;
      answer = `한 줄에 ${a}개씩 ${b}줄`;
      hint = `${a}의 ${b}배는 ${a}씩 ${b}묶음이에요. 한 줄을 한 묶음으로 생각해요.`;
      steps = [`${a}의 ${b}배는 ${a}씩 ${b}묶음입니다.`, `한 줄에 ${a}개씩 놓은 줄 하나가 한 묶음입니다.`, `그러므로 한 줄에 ${a}개씩 ${b}줄을 만듭니다.`];
      결 = 0;
    } else if (종류 === 'times-think') {
      const 전체 = a * b;
      prompt = `${전체}은(는) ${a}의 몇 배인지 알아보려고 합니다. 한 줄에 ${a}개씩, 모두 ${전체}개가 되도록 점 배열을 만들어 보세요.`;
      answer = `${a}의 ${b}배(한 줄에 ${a}개씩 ${b}줄)`;
      hint = `한 줄에 ${a}개씩 한 줄씩 늘려 가며 ${a}, ${a * 2}, ${a * 3}… 하고 뛰어 세어 보세요.`;
      steps = [`한 줄에 ${a}개씩 놓으면 한 줄마다 ${a}개씩 늘어납니다.`, `${a}씩 뛰어 세어 ${전체}이(가) 될 때까지 줄을 늘립니다.`, `${a}씩 ${b}줄이면 ${전체}개이므로 ${전체}은(는) ${a}의 ${b}배입니다.`];
      결 = 2;
    } else if (종류 === 'mul' || 종류 === 'dan') {
      prompt = `${a}×${b}을(를) 점 배열로 나타내 보세요. 한 줄에 ${a}개씩 놓아요.`;
      answer = `한 줄에 ${a}개씩 ${b}줄`;
      hint = `${a}×${b}은(는) ${a}씩 ${b}묶음이에요. 한 줄이 한 묶음이에요.`;
      steps = [`${a}×${b}은(는) ${a}을(를) ${b}번 더한 것과 같습니다.`, `한 줄에 ${a}개씩 놓은 줄을 ${b}줄 만듭니다.`, `그러므로 한 줄에 ${a}개씩 ${b}줄입니다.`];
      결 = 0;
    } else if (종류 === 'dan-more') {
      prompt = `${a}×${b}보다 ${a}만큼 더 큰 수를 점 배열로 나타내 보세요. 한 줄에 ${a}개씩 놓아요.`;
      rows = b + 1;
      answer = `한 줄에 ${a}개씩 ${b + 1}줄`;
      hint = `${a}단 곱셈구구에서는 곱하는 수가 1 커질 때마다 곱이 ${a}씩 커져요. 줄을 몇 개 놓아야 할까요?`;
      steps = [`${a}×${b}은(는) 한 줄에 ${a}개씩 ${b}줄입니다.`, `${a}만큼 더 크려면 ${a}개짜리 줄을 하나 더 놓습니다.`, `그러므로 한 줄에 ${a}개씩 ${b + 1}줄이고, ${a}×${b + 1}과(와) 같습니다.`];
      결 = 2;
    } else if (종류 === 'dan-product') {
      const P = a * b;
      prompt = `${a}단 곱셈구구에서 곱이 ${P}인 곱셈식을 점 배열로 나타내 보세요. 한 줄에 ${a}개씩 놓아요.`;
      answer = `한 줄에 ${a}개씩 ${b}줄`;
      hint = `${a}단을 ${a}×1부터 차례로 외우며 곱이 ${P}이(가) 되는 곳을 찾아요.`;
      steps = [`${a}단 곱셈구구를 차례로 외웁니다.`, `${a}씩 뛰어 세어 ${P}이(가) 되는 곳을 찾습니다.`, `${a}×${b}=${P}이므로 한 줄에 ${a}개씩 ${b}줄을 만듭니다.`];
      결 = 1;
    } else {
      // 나눗셈: 전체를 몇 줄로 똑같이 놓으면 한 줄에 몇 개
      const 전체 = a * b;
      rows = a;
      cols = b;
      if (b > 9) return null;
      prompt = `점 ${전체}개를 ${a}줄로 똑같이 나누어 놓으려고 합니다. 점 배열을 만들어 보세요.`;
      answer = `한 줄에 ${b}개씩 ${a}줄`;
      hint = `${a}줄로 놓으면 ${a}×(한 줄의 수)가 ${전체}이(가) 돼요. ${a}단 곱셈구구에서 곱이 ${전체}인 것을 찾아보세요.`;
      steps = [`${전체}개를 ${a}줄로 똑같이 놓으면 ${전체}÷${a}의 몫이 한 줄의 수입니다.`, `${a}×□=${전체}에서 □를 곱셈구구로 구합니다.`, `${a}×${b}=${전체}이므로 한 줄에 ${b}개씩 ${a}줄이고, ${전체}÷${a}=${b}입니다.`];
      결 = 1;
    }
    return {
      prompt,
      answer,
      manipulate: { kind: 'array', maxRows: 9, maxCols: 9, rows, cols, emoji },
      tag: 종류 === 'div' ? 'division' : 'multiplication',
      strategy: 종류 === 'div' ? '곱셈과 나눗셈의 관계를 배열로 알기' : '곱셈을 점 배열로 나타내기',
      hint,
      steps,
      concept: 종류 === 'div' ? '곱셈식 하나로 나눗셈식 두 개를 만들 수 있습니다.' : '같은 수씩 여러 줄로 놓은 배열은 곱셈으로 나타낼 수 있습니다.',
      misconception: '한 줄에 놓는 수와 줄의 수를 바꾸어 놓기 쉽습니다.',
      결: (lv === 2 ? Math.max(결, 1) : 결) as 0 | 1 | 2,
    };
  },
});

// ── 들이와 무게: 눈금 맞추기 ──────────────────────────────────────
export const 눈금맞추기 = (tool: 'beaker' | 'scale', 종류: 'small' | 'big' | 'fine' | 'add' | 'sub'): 조작갈래 => ({
  id: `gauge-${tool}-${종류}`,
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    const 비커 = tool === 'beaker';
    const 말 = (v: number) => (비커 ? 들이말(v) : 무게말(v));
    const 단위 = 비커 ? 'mL' : 'g';
    const 이다 = 비커 ? '예요' : '이에요';
    const 큰단위 = 비커 ? 'L' : 'kg';
    const 설정 = {
      small: { max: 1000, major: 500, minor: 100 },
      big: { max: 2000, major: 500, minor: 100 },
      fine: { max: 1000, major: 100, minor: 비커 ? 50 : 20 },
      add: { max: 3000, major: 1000, minor: 100 },
      sub: { max: 3000, major: 1000, minor: 100 },
    }[종류];
    let target = 0;
    let pre = 0;
    let prompt = '';
    let steps: [string, string, string];
    let hint = '';
    if (종류 === 'small' || 종류 === 'big' || 종류 === 'fine') {
      const 칸 = 사이(next, 1, 설정.max / 설정.minor - 1);
      target = 칸 * 설정.minor;
      if (종류 === 'big' && target <= 1000) return null;
      if (target % 설정.major === 0 || target === 설정.minor) return null;
      prompt = 비커 ? `비커에 물을 ${말(target)}만큼 부으려고 합니다. 물의 높이를 끌어 눈금을 맞추어 보세요.` : `저울의 바늘을 돌려 ${말(target)}을(를) 가리키게 해 보세요.`;
      hint = `큰 눈금 한 칸은 ${말(설정.major)}, 작은 눈금 한 칸은 ${설정.minor} ${단위}${이다}. ${target >= 1000 ? `${비커 ? '1 L는 1000 mL' : '1 kg은 1000 g'}${이다}. ` : ''}가까운 큰 눈금을 먼저 찾고 작은 눈금을 세어요.`;
      steps = [`작은 눈금 한 칸은 ${설정.minor} ${단위}입니다.`, `${말(target)}은(는) ${target} ${단위}입니다${target >= 1000 ? ` — ${비커 ? '1 L=1000 mL' : '1 kg=1000 g'}` : ''}.`, `그러므로 ${Math.floor(target / 설정.major) * 설정.major ? `${말(Math.floor(target / 설정.major) * 설정.major)}에서 ` : '0에서 '}작은 눈금 ${(target % 설정.major) / 설정.minor}칸 더 간 곳에 맞춥니다.`];
    } else {
      const 더 = 종류 === 'add';
      // 하: 작은 양, 중: 큰 양, 상: 큰 양을 'L·mL'로 섞어 말하기
      const a = (더 ? [사이(next, 6, 9), 사이(next, 11, 15), 사이(next, 14, 18)][lv] : [사이(next, 11, 15), 사이(next, 16, 22), 사이(next, 21, 28)][lv]) * 100;
      const b = [사이(next, 3, 5), 사이(next, 5, 7), 사이(next, 6, 9)][lv] * 100;
      target = 더 ? a + b : a - b;
      if (target <= 0 || target >= 설정.max) return null;
      // 받아올림(받아내림)이 생기도록 합니다.
      if (더 ? (a % 1000) + b < 1000 : a % 1000 >= b) return null;
      if (target % 1000 === 0) return null;
      pre = a;
      prompt = 비커
        ? `비커에 물이 ${말(a)} 들어 있습니다. 물을 ${말(b)} ${더 ? '더 부으면' : '덜어 내면'} 물은 모두 얼마가 될지, 물의 높이를 끌어 맞추어 보세요.`
        : 더 ? `저울에 ${말(a)}인 수박이 올려져 있습니다. ${말(b)}인 멜론을 함께 올리면 바늘이 가리킬 무게에 맞추어 바늘을 돌려 보세요.` : `책가방을 단 무게가 ${말(a)}입니다. 가방에서 ${말(b)}인 책을 꺼내면 바늘이 가리킬 무게에 맞추어 바늘을 돌려 보세요.`;
      hint = 더
        ? `${단위}끼리 먼저 더해요. ${a % 1000}+${b}이(가) 1000을 넘으면 1000 ${단위}을(를) 1 ${큰단위}(으)로 받아올려요.`
        : `${단위}끼리 뺄 수 없으면 1 ${큰단위}을(를) 1000 ${단위}(으)로 받아내려 빼요.`;
      steps = [
        `${말(a)}은(는) ${a} ${단위}, ${말(b)}은(는) ${b} ${단위}입니다.`,
        `${a}${더 ? '+' : '-'}${b}=${target}(${단위})입니다.`,
        `그러므로 ${말(target)}에 맞춥니다.`,
      ];
    }
    return {
      prompt,
      answer: 말(target),
      manipulate: { kind: 'gauge', tool, max: 설정.max, major: 설정.major, minor: 설정.minor, target, pre },
      tag: 'measurement',
      strategy: 비커 ? '들이의 눈금 읽고 맞추기' : '저울의 눈금 읽고 맞추기',
      hint,
      steps,
      concept: 비커 ? '1 L는 1000 mL입니다. 들이를 잴 때는 물의 윗면과 만나는 눈금을 읽습니다.' : '1 kg은 1000 g입니다. 저울의 바늘이 가리키는 눈금을 읽습니다.',
      misconception: `작은 눈금 한 칸을 1 ${단위}나 10 ${단위}로 생각하거나, ${비커 ? '1 L 200 mL를 1200 mL가 아닌 1020 mL' : '1 kg 200 g을 1200 g이 아닌 1020 g'}로 바꾸기 쉽습니다.`,
      결: 종류 === 'small' ? (lv === 2 ? 1 : 0) : 종류 === 'big' || 종류 === 'fine' ? (lv === 2 ? 2 : 1) : lv === 0 ? 1 : 2,
    };
  },
});

// ── 그림그래프(3-2) ───────────────────────────────────────────────
const 그림그래프주제 = [
  { 말: '마을별 사과 생산량', 라벨: ['가 마을', '나 마을', '다 마을', '라 마을'], 단위: '상자', icon: '🍎' },
  { 말: '반별로 모은 빈 병의 수', 라벨: ['1반', '2반', '3반', '4반'], 단위: '병', icon: '🍾' },
  { 말: '농장별 기르는 닭의 수', 라벨: ['초록 농장', '하늘 농장', '햇살 농장', '바람 농장'], 단위: '마리', icon: '🐔' },
  { 말: '학교별 심은 나무의 수', 라벨: ['해솔 학교', '나래 학교', '푸른 학교', '별빛 학교'], 단위: '그루', icon: '🌳' },
];
export const 그림그래프그리기 = (큰: 10 | 100): 조작갈래 => ({
  id: `pictograph-${큰}`,
  make: (seed) => {
    const next = 고르개(seed);
    const t = 그림그래프주제[next(그림그래프주제.length)];
    const 작은 = 큰 / 10;
    const values = t.라벨.map(() => 사이(next, 1, 5) * 큰 + 사이(next, 0, 9) * 작은);
    if (new Set(values).size < values.length) return null;
    if (values.every((v) => v % 큰 === 0)) return null;
    const 표 = t.라벨.map((l, i) => `${l} ${values[i]}${t.단위}`).join(', ');
    return {
      prompt: `${t.말}을(를) 그림그래프로 나타내려고 합니다. ${표}입니다. 큰 그림은 ${큰}${t.단위}, 작은 그림은 ${작은}${t.단위}을(를) 나타냅니다. 줄마다 그림의 수를 알맞게 맞추어 보세요.`,
      answer: t.라벨.map((l, i) => `${l} 큰 그림 ${Math.floor(values[i] / 큰)}개, 작은 그림 ${(values[i] % 큰) / 작은}개`).join(' / '),
      manipulate: { kind: 'pictograph', labels: t.라벨, values, big: 큰, small: 작은, icon: t.icon, unitLabel: t.단위 },
      tag: 'data',
      strategy: '큰 그림과 작은 그림으로 수를 나타내기',
      hint: `수의 ${큰 === 10 ? '십의 자리 숫자만큼 큰 그림을, 일의 자리' : '백의 자리 숫자만큼 큰 그림을, 십의 자리'} 숫자만큼 작은 그림을 그려요.`,
      steps: [`큰 그림 하나는 ${큰}${t.단위}, 작은 그림 하나는 ${작은}${t.단위}입니다.`, `${t.라벨[0]}의 ${values[0]}${t.단위}은(는) 큰 그림 ${Math.floor(values[0] / 큰)}개와 작은 그림 ${(values[0] % 큰) / 작은}개입니다.`, '다른 줄도 같은 방법으로 큰 그림을 먼저 그리고, 남는 수만큼 작은 그림을 그립니다.'],
      concept: '그림그래프는 알려고 하는 수를 그림으로 나타낸 그래프입니다. 큰 그림을 쓰면 그림의 수가 줄어 한눈에 비교하기 쉽습니다.',
      misconception: `작은 그림만 많이 그리거나, 큰 그림과 작은 그림이 나타내는 수를 바꾸어 생각하기 쉽습니다.`,
      결: 큰 === 10 ? 1 : 2,
    };
  },
});

// ── 달력(2-2 4-8) ─────────────────────────────────────────────────
const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
const 달날수 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const 달력누르기 = (종류: 'all' | 'nth' | 'week' | 'days'): 조작갈래 => ({
  id: `calendar-${종류}`,
  make: (seed) => {
    const next = 고르개(seed);
    const month = 사이(next, 1, 12);
    const first = next(7);
    const days = 달날수[month - 1];
    const 요일의 = (d: number) => (first + d - 1) % 7;
    const w = next(7);
    const 그요일 = Array.from({ length: days }, (_, i) => i + 1).filter((d) => 요일의(d) === w);
    let target: number[];
    let prompt: string;
    let hint: string;
    let steps: [string, string, string];
    let 결: 0 | 1 | 2 = 1;
    if (종류 === 'all') {
      target = 그요일;
      prompt = `${month}월 달력입니다. 이달의 ${요일[w]}요일을 모두 눌러 보세요.`;
      hint = `맨 윗줄에서 ${요일[w]}요일을 찾고, 그 아래로 세로줄을 따라 내려가요.`;
      steps = [`달력의 같은 세로줄에 있는 날은 요일이 같습니다.`, `'${요일[w]}' 아래 세로줄의 날짜를 위에서부터 차례로 찾습니다.`, `같은 요일은 7일마다 돌아오므로 ${target[0]}일에서 7씩 더해 가며 모두 누릅니다.`];
      결 = 0;
    } else if (종류 === 'nth') {
      const k = 사이(next, 2, 4);
      target = [그요일[k - 1]];
      prompt = `${month}월 달력입니다. 이달의 ${째말(k - 1)} ${요일[w]}요일을 눌러 보세요.`;
      hint = `'${요일[w]}' 아래 세로줄에서 날짜가 있는 칸만 위에서부터 첫째, 둘째… 하고 세어요. 빈칸은 세지 않아요.`;
      steps = [`'${요일[w]}' 세로줄에서 첫째 ${요일[w]}요일은 ${그요일[0]}일입니다.`, '같은 요일은 7일마다 돌아옵니다.', `${째말(k - 1)} ${요일[w]}요일은 첫째에서 7일씩 ${k - 1}번 더 간 날입니다.`];
    } else if (종류 === 'week') {
      const k = 사이(next, 1, 3);
      const 뒤 = next(2) === 0;
      const d = 뒤 ? 사이(next, 1, days - 7 * k) : 사이(next, 1 + 7 * k, days);
      target = [뒤 ? d + 7 * k : d - 7 * k];
      prompt = `${month}월 달력입니다. ${month}월 ${d}일로부터 ${k}주일 ${뒤 ? '후' : '전'}인 날을 눌러 보세요.`;
      hint = `1주일은 7일이에요. 달력에서 같은 세로줄을 따라 한 줄 ${뒤 ? '아래로 가면 1주일 후예요' : '위로 가면 1주일 전이에요'}.`;
      steps = ['1주일은 7일입니다.', `${k}주일은 ${7 * k}일입니다.`, `${d}일에서 ${7 * k}일 ${뒤 ? '후' : '전'}이므로 같은 세로줄을 따라 ${k}줄 ${뒤 ? '아래' : '위'}로 갑니다.`];
      결 = k === 1 ? 1 : 2;
    } else {
      const k = 사이(next, 8, 13);
      const d = 사이(next, 1, days - k);
      target = [d + k];
      prompt = `${month}월 달력입니다. ${month}월 ${d}일로부터 ${k}일 후인 날을 눌러 보세요.`;
      hint = `${k}일은 1주일(7일)과 ${k - 7}일이에요. 한 줄 아래로 간 다음 ${k - 7}칸 더 가요.`;
      steps = [`${k}일은 7일과 ${k - 7}일입니다.`, `${d}일에서 7일 후는 같은 세로줄 한 줄 아래입니다.`, `거기에서 ${k - 7}일을 더 가면 ${k}일 후인 날입니다.`];
      결 = 2;
    }
    if (!target.length || target.some((t) => t < 1 || t > days)) return null;
    return {
      prompt,
      answer: target.map((t) => `${month}월 ${t}일`).join(', '),
      manipulate: { kind: 'calendar', month, first, days, target },
      tag: 'time',
      strategy: '달력에서 요일과 날짜 알아보기',
      hint,
      steps,
      concept: '1주일은 7일이고, 달력에서 같은 세로줄의 날은 요일이 같습니다.',
      misconception: '1주일 후를 바로 다음 날로 생각하거나, 빈칸까지 세기 쉽습니다.',
      결,
    };
  },
});

// ── 평행선 사이의 거리(4-2 4-4) ───────────────────────────────────
export const 평행선거리 = (방향: 'h' | 'v' | 'd'): 조작갈래 => ({
  id: `between-${방향}`,
  make: (seed) => {
    const next = 고르개(seed);
    const cols = 9;
    const rows = 7;
    let a: GridSegment;
    let b: GridSegment;
    let 예: GridSegment;
    if (방향 === 'h') {
      const y1 = 사이(next, 1, 3);
      const y2 = 사이(next, y1 + 2, 6);
      a = [[0, y1], [cols, y1]];
      b = [[0, y2], [cols, y2]];
      const x = 사이(next, 1, 8);
      예 = [[x, y1], [x, y2]];
    } else if (방향 === 'v') {
      const x1 = 사이(next, 1, 3);
      const x2 = 사이(next, x1 + 2, 8);
      a = [[x1, 0], [x1, rows]];
      b = [[x2, 0], [x2, rows]];
      const y = 사이(next, 1, 6);
      예 = [[x1, y], [x2, y]];
    } else {
      // x+y=s1, x+y=s2인 두 비스듬한 평행선. 수직인 방향은 (1, 1)입니다.
      const s1 = 사이(next, 3, 5);
      const s2 = s1 + 2 * 사이(next, 1, 2);
      const 끝점 = (s: number): GridSegment => [[Math.max(0, s - rows), Math.min(rows, s)], [Math.min(cols, s), Math.max(0, s - cols)]];
      a = 끝점(s1);
      b = 끝점(s2);
      const x = 사이(next, 1, s1 - 1);
      const d = (s2 - s1) / 2;
      예 = [[x, s1 - x], [x + d, s1 - x + d]];
      if (예[1][1] > rows || 예[1][0] > cols) return null;
    }
    const fixed: GridSegment[] = [a, b];
    return {
      prompt: '두 직선은 서로 평행합니다. 평행선 사이의 거리를 나타내는 선분을 하나 그어 보세요.',
      answer: '두 평행선에 수직인 선분을 그음',
      manipulate: { kind: 'grid-draw', cols, rows, fixed, marks: [], goal: { type: 'between', a, b }, example: [예] },
      tag: 'shape',
      strategy: '평행선에 수직인 선분 긋기',
      hint: 방향 === 'd' ? '비스듬한 선에 수직인 방향은 오른쪽으로 한 칸 갈 때 아래로도 한 칸 가는 방향이에요. 한 직선 위의 점에서 시작해 다른 직선까지 그어요.' : '한 직선 위의 점에서 시작해 모눈선을 따라 곧게 다른 직선까지 그어요. 비스듬히 그으면 수직이 아니에요.',
      steps: ['평행선 사이의 거리는 두 평행선에 수직인 선분의 길이입니다.', '한 직선 위의 한 점에서 시작해, 다른 직선과 직각으로 만나도록 긋습니다.', '양 끝이 두 직선 위에 있고 두 직선과 직각으로 만나면 평행선 사이의 거리를 나타냅니다.'],
      concept: '평행선 사이에 그은 선분 가운데 수직인 선분의 길이가 가장 짧고, 이것을 평행선 사이의 거리라고 합니다.',
      misconception: '비스듬히 그은 선분도 거리라고 생각하기 쉽습니다. 비스듬한 선분은 수직인 선분보다 깁니다.',
      결: 방향 === 'd' ? 2 : 방향 === 'v' ? 1 : 0,
    };
  },
});

// ── 다각형 그리기(4-2 6-2) ────────────────────────────────────────
const 닫은선 = (ps: GridPoint[]): GridSegment[] => ps.map((p, i) => [p, ps[(i + 1) % ps.length]]);
export const 다각형그리기 = (n: 5 | 6): 조작갈래 => {
  const 이름 = n === 5 ? '오각형' : '육각형';
  const 예: GridPoint[] = n === 5 ? [[4, 1], [7, 3], [6, 6], [2, 6], [1, 3]] : [[3, 1], [6, 1], [8, 4], [6, 6], [3, 6], [1, 4]];
  return {
    id: `draw-poly-${n}`,
    make: (_seed, lv = 0) => (lv === 2 ? {
      // 상: 육각형은 모눈선만으로(오목한 ㄱ자), 오각형은 직각이 2개 이상이 되게(집 모양)
      prompt: n === 6 ? '모눈선을 따라서만 그어 육각형을 그려 보세요. 비스듬한 변은 쓰지 않습니다.' : '직각이 2개 이상인 오각형을 그려 보세요.',
      answer: `${이름}을 그림`,
      manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: n === 6 ? { sides: 6, axisAligned: true } : { sides: 5, minRightAngles: 2 } }, example: 닫은선(n === 5 ? [[1, 6], [1, 3], [4, 1], [7, 3], [7, 6]] : [[1, 1], [6, 1], [6, 3], [4, 3], [4, 6], [1, 6]]) },
      tag: 'shape',
      strategy: n === 6 ? '모눈선만으로 변의 수 맞추기' : '직각과 변의 수를 함께 맞추기',
      hint: n === 6 ? '가로선과 세로선만 쓰면 꼭짓점마다 직각으로 꺾여요. 직사각형의 한 모서리를 ㄱ자처럼 안쪽으로 들어가게 그려 변을 6개로 맞추어 보세요.' : '아래쪽은 직사각형처럼 가로선과 세로선으로 직각을 만들고, 위쪽은 지붕처럼 비스듬한 변 두 개로 닫아 보세요.',
      steps: [`변이 ${n}개인 다각형이 ${이름}입니다.`, n === 6 ? '모눈선만 쓰면 변은 모두 가로나 세로이고, 꼭짓점에서 직각으로 꺾입니다.' : '가로선과 세로선이 만나는 꼭짓점은 직각이 됩니다.', n === 6 ? '직사각형의 한 모서리를 안쪽으로 오목하게 들이면 변이 2개 늘어나 육각형이 됩니다.' : '직사각형 위에 지붕을 얹은 집 모양으로 그리면 아래 두 각이 직각인 오각형이 됩니다.'],
      concept: '다각형은 변의 수에 따라 이름을 붙입니다. 모양이 오목해도 변의 수가 같으면 같은 이름입니다.',
      misconception: '오목한 도형은 다각형이 아니라고 생각하거나 변의 수를 잘못 세기 쉽습니다.',
      결: 2,
    } : {
      prompt: `모눈의 점을 이어 ${이름}을 그려 보세요.`,
      answer: `${이름}을 그림`,
      manipulate: { kind: 'grid-draw', cols: 9, rows: 7, fixed: [], marks: [], goal: { type: 'polygon', goal: { sides: n } }, example: 닫은선(예) },
      tag: 'shape',
      strategy: '변의 수에 맞게 다각형 그리기',
      hint: `${이름}은(는) 변이 ${n}개예요. 꼭짓점이 될 점 ${n}개를 먼저 정하되, 세 점이 한 직선 위에 놓이지 않게 해요.`,
      steps: [`선분으로만 둘러싸인 도형을 다각형이라 하고, 변이 ${n}개이면 ${이름}입니다.`, `꼭짓점이 될 점 ${n}개를 정합니다 — 이웃한 세 점이 한 직선 위에 있으면 변이 하나로 합쳐집니다.`, `점을 차례로 이어 처음 점까지 닫으면 ${이름}이 됩니다.`],
      concept: '다각형은 변의 수에 따라 이름을 붙입니다. 변이 5개이면 오각형, 6개이면 육각형입니다.',
      misconception: '한 직선 위에 놓인 점을 꼭짓점으로 세어 변의 수를 잘못 알기 쉽습니다.',
      결: 1,
    }),
  };
};

// ── 전체 길이의 분수만큼(3-2 4-4) ─────────────────────────────────
export const 분수만큼긋기: 조작갈래 = {
  id: 'ruler-frac',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 단위분수, 중: 진분수, 상: 분모가 큰 진분수
    const d = lv === 2 ? [5, 6][next(2)] : [2, 3, 4][next(3)];
    const 전체 = d * 사이(next, 2, Math.floor(14 / d));
    const n = lv === 0 ? 1 : 사이(next, 2, d - 1);
    if (n >= d) return null;
    const len = (전체 * n) / d;
    if (전체 > 14 || !Number.isInteger(len)) return null;
    return {
      prompt: `길이가 ${전체} cm인 색 테이프의 ${n}/${d}만큼 선을 그으려고 합니다. 자의 0 눈금에서 시작하여 연필 끝(◆)을 끌어 그어 보세요.`,
      answer: `${len} cm`,
      manipulate: { kind: 'ruler-draw', tool: 'pencil', unit: 'cm', fromMm: 0, lengthMm: len * 10, rulerCm: 15 },
      tag: 'fraction',
      strategy: '전체 길이를 똑같이 나누어 분수만큼의 길이 구하기',
      hint: `${전체} cm를 똑같이 ${d}부분으로 나누면 한 부분은 몇 cm인지 먼저 구해요.`,
      steps: [`${전체} cm를 똑같이 ${d}부분으로 나누면 1/${d}은(는) ${전체 / d} cm입니다.`, `${n}/${d}은(는) 1/${d}이 ${n}개입니다.`, `그러므로 ${전체 / d}×${n}=${len}(cm)만큼 긋습니다.`],
      concept: '전체 길이의 분수만큼은 전체를 분모만큼 똑같이 나눈 것 가운데 분자만큼입니다.',
      misconception: `분자 ${n}을(를) 그대로 ${n} cm로 생각하기 쉽습니다.`,
      결: lv === 2 ? 2 : 1,
    };
  },
};

// ── 10을 만들어 더하기(1-2 6단원) ─────────────────────────────────
export const 십만들어더하기: 조작갈래 = {
  id: 'tenframe-add-teen',
  make: (seed, lv = 0) => {
    const next = 고르개(seed);
    // 하: 9+몇(1개만 옮기면 10), 중: 8·7+몇, 상: 6·5+몇(많이 가르기)
    const a = [9, 사이(next, 7, 8), 사이(next, 5, 6)][lv];
    const b = 사이(next, 11 - a, 9);
    const 합 = a + b;
    if (합 <= 10 || 합 > 18) return null;
    const pre = Array.from({ length: a }, (_, k) => k);
    return {
      prompt: `빨간 구슬이 ${a}개 있습니다. 파란 구슬 ${b}개를 더 놓아 ${a}+${b}을(를) 구해 보세요. 위의 판 10칸을 먼저 채워요.`,
      answer: `${합}개`,
      manipulate: { kind: 'tap-fill', layout: 'tenframe', parts: 20, pre, target: 합 },
      tag: 'addition',
      strategy: '10을 만들어 더하기',
      hint: `위의 판에 빈칸이 ${10 - a}개 있어요. 파란 구슬 ${b}개 가운데 ${10 - a}개로 10을 먼저 만들고, 나머지는 아래 판에 놓아요.`,
      steps: [`${a}에 ${10 - a}을(를) 더하면 10이 됩니다.`, `${b}을(를) ${10 - a}과(와) ${b - (10 - a)}(으)로 가르기 하여, ${10 - a}개로 위의 판을 채우고 ${b - (10 - a)}개를 아래 판에 놓습니다.`, `10과 ${b - (10 - a)}이므로 ${a}+${b}=${합}입니다.`],
      concept: '더해서 10이 넘을 때는 10을 먼저 만들고 남은 수를 더하면 쉽습니다.',
      misconception: '구슬을 하나씩 세다가 빠뜨리거나, 처음 구슬까지 다시 놓기 쉽습니다.',
      결: lv === 2 ? 2 : 1,
    };
  },
};
