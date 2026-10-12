import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eul, eun, gwa, i as 이가 } from '../grade5/util';
import { 고르개, 물건둘, 물건들, 사이, 셈그림, 수보기 } from './common';
import { 두단계이야기, 빈칸셈, 식관계, 합짝 } from '../grade1/thinking';

// ════════════════════════════════════════════════════════════════════
// 1-1 3단원 덧셈과 뺄셈
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입                       — 모두 세기, 수 비교
//   2 모으기와 가르기를 해 볼까요 ⑴   — 그림을 보고 9까지 모으고 가르기
//   3 모으기와 가르기를 해 볼까요 ⑵   — 구체물로 여러 가지로 가르기
//   4 이야기를 만들어 볼까요          — 그림에 맞는 모으기·더하기·빼기 이야기
//   5 덧셈을 알아볼까요               — 첨가·합병, 덧셈식 쓰고 읽기
//   6 덧셈을 해 볼까요                — 모으기, 이어 세기, 바꾸어 더하기
//   7 뺄셈을 알아볼까요               — 제거·비교, 뺄셈식 쓰고 읽기
//   8 뺄셈을 해 볼까요                — 가르기, 거꾸로 세기, 짝짓기
//   9 0이 있는 덧셈과 뺄셈            — ■+0, 0+■, ■-0, ■-■
//  10 덧셈과 뺄셈을 해 볼까요         — 고른 수가 되는 식 만들기
//
// 지도서가 못박은 것:
//   · 한 자리 수의 범위입니다. 합은 9 이하, 빼지는 수도 9 이하입니다.
//     모으기·가르기도 9 이하입니다(10은 5단원에서 배웁니다).
//   · 덧셈식 읽기: ‘2 더하기 3은 5와 같습니다’, ‘2와 3의 합은 5입니다’.
//     뺄셈식 읽기: ‘5 빼기 2는 3과 같습니다’, ‘5와 2의 차는 3입니다’.
//   · 비교 상황(몇 개 더 많은지)도 뺄셈입니다.
// ════════════════════════════════════════════════════════════════════

/** 합이 lo~hi인 두 수 a, b(둘 다 1 이상)입니다. */
const 두수 = (next: (b: number) => number, lo = 2, hi = 9) => {
  const sum = 사이(next, lo, hi);
  const a = 사이(next, 1, sum - 1);
  return { a, b: sum - a, sum };
};

// ── 도입: 모두 세기 ────────────────────────────────────────────────
const 모두세기: G5Family = {
  id: 'count-all',
  make: (seed) => {
    const next = 고르개(seed);
    const [p, q] = 물건둘(next);
    const thing = 물건들[next(물건들.length)];
    void p; void q;
    const { a, b, sum } = 두수(next, 4, 9);
    return {
      prompt: `${thing.이름}${eun(thing.이름).slice(thing.이름.length)} 모두 몇 ${thing.단위}일까요?`,
      answer: `${sum}${thing.단위}`,
      wrongs: [sum + 1, sum - 1, a, b].filter((v) => v > 0 && v !== sum).map((v) => `${v}${thing.단위}`),
      tag: 'number',
      strategy: '두 무리를 모두 세기',
      hint: '왼쪽 무리부터 오른쪽 무리까지 이어서 세어 보세요.',
      steps: [`왼쪽에 ${a}${thing.단위}, 오른쪽에 ${b}${thing.단위}${이가(`${b}${thing.단위}`).slice(`${b}${thing.단위}`.length)} 있습니다.`, `이어서 세면 모두 ${sum}${thing.단위}입니다.`],
      misconceptionTip: '한쪽 무리만 세고 멈추면 안 돼요.',
      visual: 셈그림(thing.이름, [{ count: a, icon: thing.icon }, { count: b, icon: thing.icon }]),
    };
  },
};

// ── 모으기 ──────────────────────────────────────────────────────────
const 모으기 = (picture: boolean): G5Family => ({
  id: `join-${picture ? 'pic' : 'num'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const { a, b, sum } = 두수(next, lv === '하' ? 3 : 5, lv === '하' ? 6 : 9);
    const thing = 물건들[next(물건들.length)];
    return {
      prompt: picture ? `${gwa(String(a))} ${eul(String(b))} 모으면 얼마가 될까요?` : `${gwa(String(a))} ${eul(String(b))} 모으면 얼마일까요?`,
      answer: String(sum),
      wrongs: 수보기(sum, [sum + 1, sum - 1, Math.abs(a - b), a, b], 0, 9),
      tag: 'number',
      strategy: '두 수를 모으기',
      hint: `${a}에서 ${b}만큼 이어 세어 보세요.`,
      steps: [`${a}에서 ${b}만큼 이어 세면 ${Array.from({ length: b }, (_, k) => a + k + 1).join(', ')}입니다.`, `그러므로 ${gwa(String(a))} ${eul(String(b))} 모으면 ${sum}입니다.`],
      ...(picture
        ? { visual: { kind: 'ten-frame' as const, label: `${gwa(String(a))} ${b}`, frames: 1, fills: [{ count: a, color: 'teal' as const }, { count: b, color: 'orange' as const }] } }
        : {}),
      ...(picture ? {} : { visual: 셈그림(thing.이름, [{ count: a, icon: thing.icon }, { count: b, icon: thing.icon }]) }),
    };
  },
});

// 모으기에서 모르는 한쪽입니다.
const 모으기빈칸: G5Family = {
  id: 'join-missing',
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, sum } = 두수(next, 4, 9);
    return {
      prompt: `${gwa(String(a))} 어떤 수를 모았더니 ${sum}${이가(String(sum)).slice(String(sum).length)} 되었습니다. 어떤 수는 무엇일까요?`,
      answer: String(b),
      wrongs: 수보기(b, [sum, a, b + 1, b - 1, sum + a], 0, 9),
      tag: 'number',
      strategy: '모으기에서 모르는 수 찾기',
      hint: `${a}에서 몇을 더 세어야 ${sum}${이가(String(sum)).slice(String(sum).length)} 되는지 세어 보세요.`,
      steps: [`${a} 다음부터 ${sum}까지 세면 ${Array.from({ length: b }, (_, k) => a + k + 1).join(', ')}입니다.`, `${b}만큼 더 세었으므로 어떤 수는 ${b}입니다.`],
      misconceptionTip: `${gwa(String(a))} ${eul(String(sum))} 모으면 안 돼요. ${sum}${이가(String(sum)).slice(String(sum).length)} 모은 결과예요.`,
      visual: 셈그림('모으기', [{ count: a, icon: 'dot' }, { count: b, icon: 'dot', hidden: true }], '+'),
    };
  },
};

// ── 가르기 ──────────────────────────────────────────────────────────
const 가르기 = (picture: boolean): G5Family => ({
  id: `split-${picture ? 'pic' : 'num'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const { a, b, sum } = 두수(next, lv === '하' ? 3 : 5, lv === '하' ? 6 : 9);
    const thing = 물건들[next(물건들.length)];
    return {
      prompt: `${eun(String(sum))} ${gwa(String(a))} 몇으로 가를 수 있을까요?`,
      answer: String(b),
      wrongs: 수보기(b, [sum, a, b + 1, b - 1, sum + a], 0, 9),
      tag: 'number',
      strategy: '한 수를 두 수로 가르기',
      hint: `${sum}개 중 ${a}개를 덜어 내면 몇 개가 남는지 세어 보세요.`,
      steps: [`${sum}개 중 ${a}개를 한쪽에 두면 다른 쪽에 남는 것은 ${b}개입니다.`, `그러므로 ${eun(String(sum))} ${gwa(String(a))} ${b}(으)로 가를 수 있습니다.`],
      misconceptionTip: '가르기는 나누어 놓는 거예요. 두 수를 모으면 처음 수가 되어야 해요.',
      visual: picture
        ? 셈그림(thing.이름, [{ count: a, icon: thing.icon }, { count: b, icon: thing.icon, hidden: true }])
        : 셈그림(`${thing.이름} ${sum}${thing.단위}`, [{ count: sum, icon: thing.icon }]),
    };
  },
});

// 한 수를 가르는 여러 방법 가운데 틀린 것을 찾습니다(⑵ 차시의 상).
const 가르기아닌것: G5Family = {
  id: 'split-not',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 5, 9);
    const 맞는 = Array.from({ length: n - 1 }, (_, k) => [k + 1, n - k - 1]);
    const 셋: number[][] = [];
    const pool = [...맞는];
    while (셋.length < 3 && pool.length) 셋.push(pool.splice(next(pool.length), 1)[0]);
    const x = 사이(next, 1, n - 1);
    const 틀린 = [x, n - x + (next(2) === 0 ? 1 : -1)];
    if (틀린[1] <= 0) 틀린[1] = n - x + 1;
    return {
      prompt: `${eul(String(n))} 두 수로 가른 것이 아닌 것은 어느 것일까요?`,
      answer: `${gwa(String(틀린[0]))} ${틀린[1]}`,
      wrongs: 셋.map(([p, q]) => `${gwa(String(p))} ${q}`),
      tag: 'number',
      strategy: '여러 가지로 가르기',
      hint: '두 수를 다시 모으면 처음 수가 되는지 확인해 보세요.',
      steps: [`${gwa(String(틀린[0]))} ${eul(String(틀린[1]))} 모으면 ${틀린[0] + 틀린[1]}입니다.`, `${n}${이가(String(n)).slice(String(n).length)} 아니므로 ${n}을(를) 가른 것이 아닙니다.`],
      misconceptionTip: '가른 두 수를 모으면 처음 수가 되어야 해요.',
      sameValueOk: true,
    };
  },
};

// ── 이야기 만들기 ───────────────────────────────────────────────────
const 이야기: G5Family = {
  id: 'story',
  make: (seed) => {
    const next = 고르개(seed);
    const thing = 물건들.filter((t) => t.단위 === '마리')[next(2)];
    const kind = next(2) === 0 ? 'add' : 'sub';
    const { a, b, sum } = 두수(next, 4, 9);
    const 왔다 = thing.이름 === '물고기' ? '헤엄쳐 왔습니다' : '날아왔습니다';
    const 갔다 = thing.이름 === '물고기' ? '헤엄쳐 갔습니다' : '날아갔습니다';
    if (kind === 'add') {
      return {
        prompt: '그림에 알맞은 이야기는 어느 것일까요?',
        answer: `${thing.이름} ${a}마리가 있는데 ${b}마리가 더 ${왔다}. 모두 ${sum}마리입니다.`,
        wrongs: [
          `${thing.이름} ${a}마리가 있는데 ${b}마리가 ${갔다}. 모두 ${sum}마리입니다.`,
          `${thing.이름} ${a}마리가 있는데 ${b}마리가 더 ${왔다}. 모두 ${a}마리입니다.`,
          `${thing.이름} ${sum}마리 중에서 ${b}마리가 ${갔다}. ${a}마리가 남았습니다.`,
        ],
        tag: 'addition',
        strategy: '그림을 보고 더하기 이야기 고르기',
        hint: '그림에서 늘어났는지, 줄어들었는지 먼저 보세요.',
        steps: [`${thing.이름} ${a}마리가 있고 ${b}마리가 더 왔습니다.`, `모두 세면 ${sum}마리입니다.`],
        visual: 셈그림(`${thing.이름}`, [{ count: a, icon: thing.icon, name: '처음' }, { count: b, icon: thing.icon, name: '더 온 것' }], '+'),
      };
    }
    return {
      prompt: '그림에 알맞은 이야기는 어느 것일까요?',
      answer: `${thing.이름} ${sum}마리 중에서 ${b}마리가 ${갔다}. ${a}마리가 남았습니다.`,
      wrongs: [
        `${thing.이름} ${sum}마리가 있는데 ${b}마리가 더 ${왔다}. ${a}마리가 남았습니다.`,
        `${thing.이름} ${sum}마리 중에서 ${b}마리가 ${갔다}. ${b}마리가 남았습니다.`,
        `${thing.이름} ${a}마리가 있는데 ${b}마리가 더 ${왔다}. 모두 ${sum}마리입니다.`,
      ],
      tag: 'subtraction',
      strategy: '그림을 보고 빼기 이야기 고르기',
      hint: '×표 한 것은 간 것이에요. 남은 것을 세어 보세요.',
      steps: [`${thing.이름} ${sum}마리 중 ${b}마리가 갔습니다.`, `남은 것을 세면 ${a}마리입니다.`],
      visual: 셈그림(`${thing.이름}`, [{ count: sum, icon: thing.icon, crossed: b }]),
    };
  },
};

// ── 덧셈식 쓰기와 읽기 ──────────────────────────────────────────────
const 덧셈식고르기: G5Family = {
  id: 'add-sentence',
  make: (seed) => {
    const next = 고르개(seed);
    const [p, q] = 물건둘(next);
    void q;
    const { a, b, sum } = 두수(next, 3, 9);
    return {
      prompt: '그림에 알맞은 덧셈식은 어느 것일까요?',
      answer: `${a}+${b}=${sum}`,
      wrongs: [`${a}+${b}=${sum + 1}`, `${sum}-${b}=${a}`, `${a}+${sum}=${a + sum > 9 ? sum + 2 : a + sum}`, `${a}+${b + 1}=${sum + 1}`].filter((w) => w !== `${a}+${b}=${sum}`),
      tag: 'addition',
      strategy: '그림을 덧셈식으로 나타내기',
      hint: '두 무리가 각각 몇 개인지 세고, 모두 몇 개인지 세어 보세요.',
      steps: [`${a}개와 ${b}개를 모으면 ${sum}개입니다.`, `덧셈식으로 나타내면 ${a}+${b}=${sum}입니다.`],
      minusIsOperator: true,
      visual: 셈그림(p.이름, [{ count: a, icon: p.icon }, { count: b, icon: p.icon }], '+'),
    };
  },
};

const 덧셈읽기: G5Family = {
  id: 'add-read',
  make: (seed) => {
    const next = 고르개(seed);
    const { a, b, sum } = 두수(next, 3, 9);
    const 합 = next(2) === 0;
    return {
      prompt: `${a}+${b}=${eul(String(sum))} 바르게 읽은 것은 어느 것일까요?`,
      answer: 합 ? `${gwa(String(a))} ${b}의 합은 ${sum}입니다.` : `${a} 더하기 ${eun(String(b))} ${gwa(String(sum))} 같습니다.`,
      wrongs: [
        `${a} 빼기 ${eun(String(b))} ${gwa(String(sum))} 같습니다.`,
        `${gwa(String(a))} ${b}의 차는 ${sum}입니다.`,
        합 ? `${a} 더하기 ${eun(String(sum))} ${gwa(String(b))} 같습니다.` : `${gwa(String(a))} ${sum}의 합은 ${b}입니다.`,
      ],
      tag: 'addition',
      strategy: '덧셈식 읽기',
      hint: '+는 ‘더하기’, =는 ‘같습니다’라고 읽어요. 더한 결과를 ‘합’이라고 해요.',
      steps: [`${a}+${b}=${eun(String(sum))} ‘${a} 더하기 ${eun(String(b))} ${gwa(String(sum))} 같습니다’ 또는 ‘${gwa(String(a))} ${b}의 합은 ${sum}입니다’라고 읽습니다.`],
      misconceptionTip: '‘차’는 뺄셈에서 쓰는 말이에요.',
    };
  },
};

// ── 덧셈하기 ────────────────────────────────────────────────────────
const 덧셈 = (picture: boolean): G5Family => ({
  id: `add-${picture ? 'pic' : 'num'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const { a, b, sum } = 두수(next, lv === '하' ? 3 : 4, lv === '하' ? 7 : 9);
    const thing = 물건들[next(물건들.length)];
    return {
      prompt: `${a}+${eun(String(b))} 얼마일까요?`,
      answer: String(sum),
      wrongs: 수보기(sum, [sum + 1, sum - 1, Math.abs(a - b), sum + 2, sum - 2], 0, 9),
      tag: 'addition',
      strategy: '이어 세어 더하기',
      hint: `${a}에서 ${b}만큼 이어 세어 보세요.`,
      steps: [`${a} 다음부터 ${b}만큼 세면 ${Array.from({ length: b }, (_, k) => a + k + 1).join(', ')}입니다.`, `그러므로 ${a}+${b}=${sum}입니다.`],
      misconceptionTip: '이어 셀 때 처음 수는 다시 세지 않아요.',
      ...(picture ? { visual: 셈그림(thing.이름, [{ count: a, icon: thing.icon }, { count: b, icon: thing.icon }], '+') } : {}),
    };
  },
});

// 물건에 어울리는 말입니다. 새를 '친구에게 주었다'거나 '접시에 놓았다'고
// 하면 1학년 아이는 장면을 떠올리지 못합니다.
const 받침말 = (n: number, 단위: string, 조사: 'eul' | 'i') => {
  const t = `${n}${단위}`;
  return 조사 === 'eul' ? eul(t) : 이가(t);
};
const 더생김 = (p: { 이름: string; 단위: string }, b: number) =>
  p.이름 === '새'
    ? `${받침말(b, p.단위, 'i')} 더 날아왔습니다`
    : p.이름 === '물고기'
      ? `${받침말(b, p.단위, 'eul')} 어항에 더 넣었습니다`
      : `${받침말(b, p.단위, 'eul')} 더 받았습니다`;
const 덜어냄 = (p: { 이름: string; 단위: string }, b: number) =>
  p.이름 === '새'
    ? `${받침말(b, p.단위, 'i')} 날아갔습니다`
    : p.이름 === '사과'
      ? `${받침말(b, p.단위, 'eul')} 먹었습니다`
      : p.이름 === '물고기'
        ? `${받침말(b, p.단위, 'eul')} 다른 어항으로 옮겼습니다`
        : `${받침말(b, p.단위, 'eul')} 친구에게 주었습니다`;
// 0이 있는 상황에서 물건을 담는 곳입니다.
const 담는곳: Record<string, string> = { 사과: '접시', 별: '상자', 꽃: '꽃병', 물고기: '어항', 공: '바구니', 자동차: '상자', 새: '나뭇가지' };

const 덧셈문장: G5Family = {
  id: 'add-word',
  make: (seed) => {
    const next = 고르개(seed);
    const [p] = 물건둘(next);
    const { a, b, sum } = 두수(next, 4, 9);
    const 합병 = next(2) === 0;
    const [x, y] = 물건둘(next);
    const prompt = 합병
      ? `빨간 ${p.이름} ${a}${p.단위}와 파란 ${p.이름} ${b}${p.단위}${이가(`${b}${p.단위}`).slice(`${b}${p.단위}`.length)} 있습니다. ${eun(p.이름)} 모두 몇 ${p.단위}일까요?`
      : `${p.이름} ${a}${p.단위}${이가(`${a}${p.단위}`).slice(`${a}${p.단위}`.length)} 있었는데 ${더생김(p, b)}. ${eun(p.이름)} 모두 몇 ${p.단위}일까요?`;
    void x; void y;
    return {
      prompt,
      answer: `${sum}${p.단위}`,
      wrongs: [...new Set([sum + 1, sum - 1, Math.abs(a - b), a, sum - 2])].filter((v) => v > 0 && v !== sum && v <= 9).map((v) => `${v}${p.단위}`),
      tag: 'addition',
      strategy: 합병 ? '합쳐서 모두 몇인지 구하기' : '더 생겨서 모두 몇인지 구하기',
      hint: '‘모두 몇’을 물으면 더해요.',
      steps: [`모두 몇인지 구하므로 덧셈식 ${a}+${b}을(를) 씁니다.`, `${a}+${b}=${sum}이므로 ${sum}${p.단위}입니다.`],
    };
  },
};

const 바꾸어더하기: G5Family = {
  id: 'add-swap',
  make: (seed) => {
    const next = 고르개(seed);
    let { a, b, sum } = 두수(next, 5, 9);
    if (a === b) { a = a - 1; b = b + 1; }
    return {
      prompt: `${a}+${b}과(와) 합이 같은 식은 어느 것일까요?`,
      answer: `${b}+${a}`,
      wrongs: [`${b}-${a > b ? b : a}`, `${a}+${b + 1 <= 9 - a ? b + 1 : b - 1}`, `${b}+${a + 1 <= 9 - b ? a + 1 : a - 1}`, `${sum}-${a}`],
      tag: 'addition',
      strategy: '두 수를 바꾸어 더하기',
      hint: '두 수의 자리를 바꾸어 더해 보세요.',
      steps: [`${a}+${b}=${sum}이고 ${b}+${a}=${sum}입니다.`, `두 수를 바꾸어 더해도 합은 같으므로 답은 ${b}+${a}입니다.`],
      misconceptionTip: '더하는 두 수의 자리를 바꾸어도 합은 같아요.',
      minusIsOperator: true,
    };
  },
};

// ── 뺄셈식 쓰기와 읽기 ──────────────────────────────────────────────
const 뺄셈식고르기 = (비교: boolean): G5Family => ({
  id: `sub-sentence-${비교 ? 'cmp' : 'take'}`,
  make: (seed) => {
    const next = 고르개(seed);
    // 몇 '개' 더 많은지 견주므로 둘 다 '개'로 세는 물건만 씁니다.
    // 물고기와 꽃을 견주며 '몇 개 더 많은지'라고 하면 세는 말이 어긋납니다.
    const 개물건 = 물건들.filter((t) => t.단위 === '개');
    const [p, q] = 비교 ? [개물건[next(개물건.length)], 개물건[next(개물건.length)]] : 물건둘(next);
    if (p.이름 === q.이름) return null;
    const { a: left, b: gone, sum: total } = 두수(next, 3, 9);
    if (비교) {
      // total개와 gone개를 견줍니다.
      return {
        prompt: `${eun(p.이름)} ${q.이름}보다 몇 개 더 많은지 알맞은 뺄셈식은 어느 것일까요?`,
        answer: `${total}-${gone}=${left}`,
        wrongs: [`${total}+${gone}=${total + gone}`, `${total}-${gone}=${left + 1}`, `${total}-${left}=${gone === left ? gone + 1 : gone}`].filter((w) => w !== `${total}-${gone}=${left}`),
        tag: 'subtraction',
        strategy: '견주어 몇 개 더 많은지 뺄셈식으로 나타내기',
        hint: '하나씩 짝지어 보고 남는 것을 세어 보세요.',
        steps: [`${p.이름} ${total}개와 ${q.이름} ${gone}개를 하나씩 짝지으면 ${p.이름} ${left}개가 남습니다.`, `뺄셈식으로 나타내면 ${total}-${gone}=${left}입니다.`],
        minusIsOperator: true,
        visual: 셈그림(`${p.이름}${gwa(p.이름).slice(p.이름.length)} ${q.이름}`, [
          { count: total, icon: p.icon, name: p.이름 },
          { count: gone, icon: q.icon, name: q.이름 },
        ]),
      };
    }
    return {
      prompt: '그림에 알맞은 뺄셈식은 어느 것일까요?',
      answer: `${total}-${gone}=${left}`,
      wrongs: [`${total}-${gone}=${gone === left ? left + 1 : gone}`, `${left}+${gone}=${total}`, `${total}-${left}=${left === gone ? left + 1 : left}`, `${total}-${gone}=${left + 1}`].filter((w) => w !== `${total}-${gone}=${left}`),
      tag: 'subtraction',
      strategy: '덜어 낸 그림을 뺄셈식으로 나타내기',
      hint: '처음에 몇 개였는지, ×표 한 것이 몇 개인지 세어 보세요.',
      steps: [`처음 ${total}개 중 ${gone}개를 덜어 내면 ${left}개가 남습니다.`, `뺄셈식으로 나타내면 ${total}-${gone}=${left}입니다.`],
      minusIsOperator: true,
      visual: 셈그림(p.이름, [{ count: total, icon: p.icon, crossed: gone }]),
    };
  },
});

const 뺄셈읽기: G5Family = {
  id: 'sub-read',
  make: (seed) => {
    const next = 고르개(seed);
    const { a: left, b, sum: total } = 두수(next, 3, 9);
    const 차 = next(2) === 0;
    return {
      prompt: `${total}-${b}=${eul(String(left))} 바르게 읽은 것은 어느 것일까요?`,
      answer: 차 ? `${gwa(String(total))} ${b}의 차는 ${left}입니다.` : `${total} 빼기 ${eun(String(b))} ${gwa(String(left))} 같습니다.`,
      wrongs: [
        `${total} 더하기 ${eun(String(b))} ${gwa(String(left))} 같습니다.`,
        `${gwa(String(total))} ${b}의 합은 ${left}입니다.`,
        // '7 빼기 4는 3과 같습니다', '3과 7의 차는 4입니다'는 식으로는 맞는
        // 말이라 오답이 될 수 없습니다. 틀린 값을 넣은 읽기를 둡니다.
        차 ? `${gwa(String(total))} ${b}의 차는 ${total + b}입니다.` : `${total} 빼기 ${eun(String(b))} ${gwa(String(total + b))} 같습니다.`,
      ],
      tag: 'subtraction',
      strategy: '뺄셈식 읽기',
      hint: '-는 ‘빼기’, =는 ‘같습니다’라고 읽어요. 뺀 결과를 ‘차’라고 해요.',
      steps: [`${total}-${b}=${eun(String(left))} ‘${total} 빼기 ${eun(String(b))} ${gwa(String(left))} 같습니다’ 또는 ‘${gwa(String(total))} ${b}의 차는 ${left}입니다’라고 읽습니다.`],
      misconceptionTip: '‘합’은 덧셈에서 쓰는 말이에요.',
    };
  },
};

// ── 뺄셈하기 ────────────────────────────────────────────────────────
const 뺄셈 = (picture: boolean): G5Family => ({
  id: `sub-${picture ? 'pic' : 'num'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const { a: left, b, sum: total } = 두수(next, lv === '하' ? 3 : 4, lv === '하' ? 7 : 9);
    const thing = 물건들[next(물건들.length)];
    return {
      prompt: `${total}-${eun(String(b))} 얼마일까요?`,
      answer: String(left),
      wrongs: 수보기(left, [left + 1, left - 1, total + b, b, total], 0, 9),
      tag: 'subtraction',
      strategy: '덜어 내어 빼기',
      hint: `${total}에서 ${b}만큼 거꾸로 세어 보세요.`,
      steps: [`${total}에서 ${b}만큼 거꾸로 세면 ${Array.from({ length: b }, (_, k) => total - k - 1).join(', ')}입니다.`, `그러므로 ${total}-${b}=${left}입니다.`],
      misconceptionTip: '빼는 수만큼 덜어 내고 남은 것을 세요.',
      ...(picture ? { visual: 셈그림(thing.이름, [{ count: total, icon: thing.icon, crossed: b }]) } : {}),
    };
  },
});

const 뺄셈문장: G5Family = {
  id: 'sub-word',
  make: (seed) => {
    const next = 고르개(seed);
    const [p, q] = 물건둘(next);
    const { a: left, b, sum: total } = 두수(next, 4, 9);
    const 비교 = next(2) === 0;
    const prompt = 비교
      ? `${p.이름}${이가(p.이름).slice(p.이름.length)} ${total}${p.단위}, ${q.이름}${이가(q.이름).slice(q.이름.length)} ${b}${q.단위} 있습니다. ${eun(p.이름)} ${q.이름}보다 몇 ${p.단위} 더 많을까요?`
      : `${p.이름} ${total}${p.단위} 중에서 ${덜어냄(p, b)}. 남은 ${eun(p.이름)} 몇 ${p.단위}일까요?`;
    // 비교 상황에서 단위가 다르면 '몇 개 더 많은지'가 어색합니다.
    if (비교 && p.단위 !== q.단위) return null;
    return {
      prompt,
      answer: `${left}${p.단위}`,
      // 9까지의 수 단원이라 더해 버린 값(total+b)이 10을 넘으면 보기에 넣지 않습니다.
      wrongs: [...new Set([left + 1, total + b, b, total, left - 1])].filter((v) => v >= 0 && v !== left && v <= 9).map((v) => `${v}${p.단위}`),
      tag: 'subtraction',
      strategy: 비교 ? '몇 개 더 많은지 구하기' : '남은 것 구하기',
      hint: 비교 ? '하나씩 짝지으면 몇 개가 남는지 생각해 보세요.' : '처음 수에서 줄어든 만큼 빼요.',
      steps: [`뺄셈식 ${total}-${b}을(를) 씁니다.`, `${total}-${b}=${left}이므로 ${left}${p.단위}입니다.`],
      misconceptionTip: 비교 ? '‘더 많다’라는 말이 있어도 더하는 것이 아니에요. 차이를 구해요.' : '남은 것을 물었으니 빼요.',
    };
  },
};

// ── 0이 있는 덧셈과 뺄셈 ───────────────────────────────────────────
const 영셈: G5Family = {
  id: 'zero-calc',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 1, 9);
    const kind = next(4);
    const 식 = [`${n}+0`, `0+${n}`, `${n}-0`, `${n}-${n}`][kind];
    const ans = kind === 3 ? 0 : n;
    const 까닭 = [
      `어떤 수에 0을 더하면 그대로 ${n}입니다.`,
      `0에 ${eul(String(n))} 더하면 ${n}입니다.`,
      `어떤 수에서 0을 빼면 그대로 ${n}입니다.`,
      `어떤 수에서 그 수 전체를 빼면 아무것도 남지 않아 0입니다.`,
    ][kind];
    return {
      prompt: `${eun(식)} 얼마일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, kind === 3 ? [n, 1, n + n, n - 1, 2, 3] : [0, n + 1, n - 1, 1, n - 2, n + 2], 0, 9),
      tag: kind < 2 ? 'addition' : 'subtraction',
      strategy: '0이 있는 덧셈과 뺄셈',
      hint: kind === 3 ? '모두 덜어 내면 몇 개가 남을까요?' : '0은 아무것도 없는 것이에요.',
      steps: [까닭, `그러므로 ${식}=${ans}입니다.`],
      misconceptionTip: kind === 3 ? '같은 수를 빼면 0이 돼요.' : '0을 더하거나 빼도 수는 바뀌지 않아요.',
      minusIsOperator: true,
    };
  },
};

const 영문장: G5Family = {
  id: 'zero-word',
  make: (seed) => {
    const next = 고르개(seed);
    const thing = 물건들[next(물건들.length)];
    const n = 사이(next, 2, 9);
    const all = next(2) === 0;
    const 곳 = 담는곳[thing.이름] ?? '접시';
    const 새 = thing.이름 === '새';
    const 몇개 = `${n}${thing.단위}`;
    return {
      prompt: all
        ? 새
          ? `${곳}에 ${thing.이름} ${몇개}${이가(몇개).slice(몇개.length)} 앉아 있었는데 모두 날아갔습니다. ${곳}에 남은 ${eun(thing.이름)} 몇 ${thing.단위}일까요?`
          : `${곳}에 ${thing.이름} ${몇개}${이가(몇개).slice(몇개.length)} 있었는데 모두 꺼냈습니다. ${곳}에 남은 ${eun(thing.이름)} 몇 ${thing.단위}일까요?`
        : 새
          ? `빈 ${곳}에 ${thing.이름} ${몇개}${이가(몇개).slice(몇개.length)} 날아와 앉았습니다. ${곳}에 있는 ${eun(thing.이름)} 몇 ${thing.단위}일까요?`
          : `빈 ${곳}에 ${thing.이름} ${몇개}${eul(몇개).slice(몇개.length)} 넣었습니다. ${곳}에 있는 ${eun(thing.이름)} 몇 ${thing.단위}일까요?`,
      answer: `${all ? 0 : n}${thing.단위}`,
      wrongs: (all ? [n, 1, n - 1 > 1 ? n - 1 : n + 1] : [0, n + 1 <= 9 ? n + 1 : n - 2, n - 1]).map((v) => `${v}${thing.단위}`),
      tag: all ? 'subtraction' : 'addition',
      strategy: '0이 있는 상황을 식으로 풀기',
      hint: all ? `모두 ${새 ? '날아가면' : '꺼내면'} 남는 것이 있나요?` : `빈 ${곳}에는 처음에 몇 ${thing.단위} 있었을까요?`,
      steps: all ? [`${n}-${n}=0입니다.`, `남은 ${eun(thing.이름)} 0${thing.단위}입니다.`] : [`빈 ${곳}에는 0${thing.단위} 있었습니다.`, `0+${n}=${n}이므로 ${n}${thing.단위}입니다.`],
    };
  },
};

// ── 고른 수가 되는 식 ───────────────────────────────────────────────
const 값이같은식: G5Family = {
  id: 'make-value',
  make: (seed) => {
    const next = 고르개(seed);
    const target = 사이(next, 3, 8);
    const plus = next(2) === 0;
    const a = plus ? 사이(next, 1, target - 1) : 사이(next, target + 1, 9);
    const 정답 = plus ? `${a}+${target - a}` : `${a}-${a - target}`;
    const 틀린 = [
      `${a}+${target - a + 1}`,
      plus ? `${target}-${a}` : `${a}-${a - target + 1}`,
      `${target}+${1}`,
      plus ? `${a + 1}+${target - a}` : `${a}-${target}`,
    ].filter((w) => w !== 정답);
    const 값 = (식: string) => {
      const m = /^(\d+)([+-])(\d+)$/.exec(식);
      if (!m) return NaN;
      return m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
    };
    const wrongs = 틀린.filter((w) => 값(w) !== target && 값(w) >= 0 && 값(w) <= 10);
    return {
      prompt: `계산한 값이 ${target}인 식은 어느 것일까요?`,
      answer: 정답,
      wrongs,
      tag: plus ? 'addition' : 'subtraction',
      strategy: '값이 같은 식 찾기',
      hint: '보기의 식을 하나씩 계산해 보세요.',
      steps: [`${정답}=${target}입니다.`, `그러므로 계산한 값이 ${target}인 식은 ${정답}입니다.`],
      minusIsOperator: true,
    };
  },
};

const 가장큰식: G5Family = {
  id: 'biggest-expr',
  make: (seed) => {
    const next = 고르개(seed);
    const 식들: Array<{ 식: string; 값: number }> = [];
    let guard = 0;
    while (식들.length < 4 && guard < 50) {
      guard += 1;
      const plus = next(2) === 0;
      const a = 사이(next, 1, 8);
      const b = plus ? 사이(next, 1, 9 - a) : 사이(next, 0, a);
      const 값 = plus ? a + b : a - b;
      if (식들.some((x) => x.값 === 값)) continue;
      식들.push({ 식: plus ? `${a}+${b}` : `${a}-${b}`, 값 });
    }
    if (식들.length < 4) return null;
    const best = 식들.reduce((m, x) => (x.값 > m.값 ? x : m));
    return {
      prompt: '계산한 값이 가장 큰 식은 어느 것일까요?',
      answer: best.식,
      wrongs: 식들.filter((x) => x !== best).map((x) => x.식),
      tag: 'addition',
      strategy: '덧셈과 뺄셈을 하고 값 견주기',
      hint: '네 식을 모두 계산한 다음 값을 견주어 보세요.',
      steps: [식들.map((x) => `${x.식}=${x.값}`).join(', ') + '입니다.', `가장 큰 값은 ${best.값}이므로 ${best.식}입니다.`],
      minusIsOperator: true,
    };
  },
};

export const unit3Lesson11 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [모두세기];
    case 2:
      if (lv === '하') return [모으기(false), 가르기(false)];
      if (lv === '중') return [모으기(true), 가르기(true), 모으기빈칸];
      return [모으기빈칸, 가르기(true)];
    case 3:
      if (lv === '하') return [모으기(true), 가르기(false)];
      if (lv === '중') return [가르기(true), 모으기빈칸];
      return [가르기아닌것, 모으기빈칸];
    case 4:
      return lv === '하' ? [이야기, 합짝('1-1-3', 9), 빈칸셈('1-1-3', '+', 9)] : [이야기, 합짝('1-1-3', 9), 식관계('1-1-3', 9)];
    case 5:
      if (lv === '하') return [덧셈식고르기, 합짝('1-1-3', 9), 빈칸셈('1-1-3', '+', 9)];
      if (lv === '중') return [덧셈식고르기, 덧셈읽기, 빈칸셈('1-1-3', '+', 9)];
      return [덧셈읽기, 덧셈문장, 빈칸셈('1-1-3', '+', 9), 합짝('1-1-3', 9)];
    case 6:
      if (lv === '하') return [덧셈(true), 덧셈(false), 빈칸셈('1-1-3', '+', 9)];
      if (lv === '중') return [덧셈(false), 덧셈문장, 빈칸셈('1-1-3', '+', 9)];
      return [바꾸어더하기, 덧셈문장, 빈칸셈('1-1-3', '+', 9), 합짝('1-1-3', 9)];
    case 7:
      if (lv === '하') return [뺄셈식고르기(false), 식관계('1-1-3', 9), 빈칸셈('1-1-3', '-', 9)];
      if (lv === '중') return [뺄셈식고르기(false), 뺄셈식고르기(true), 뺄셈읽기, 식관계('1-1-3', 9)];
      return [뺄셈식고르기(true), 뺄셈읽기, 식관계('1-1-3', 9)];
    case 8:
      if (lv === '하') return [뺄셈(true), 뺄셈(false), 빈칸셈('1-1-3', '-', 9)];
      if (lv === '중') return [뺄셈(false), 뺄셈문장, 빈칸셈('1-1-3', '-', 9)];
      return [뺄셈문장, 빈칸셈('1-1-3', '-', 9), 두단계이야기('1-1-3', 9)];
    case 9:
      if (lv === '상') return [영문장, 영셈, 빈칸셈('1-1-3', '-', 9)];
      return [영셈, 영문장];
    case 10:
      if (lv === '하') return [덧셈(false), 뺄셈(false), 빈칸셈('1-1-3', '+', 9), 두단계이야기('1-1-3', 9)];
      if (lv === '중') return [값이같은식, 빈칸셈('1-1-3', '-', 9), 두단계이야기('1-1-3', 9), 식관계('1-1-3', 9)];
      return [가장큰식, 값이같은식, 두단계이야기('1-1-3', 9), 빈칸셈('1-1-3', '-', 9)];
    default:
      return null;
  }
};
