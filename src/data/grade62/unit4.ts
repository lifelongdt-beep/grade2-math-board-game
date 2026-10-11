import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { gcd } from '../grade5/fraction';
import { 고르개, 사이 } from '../grade11/common';

// ════════════════════════════════════════════════════════════════════
// 6-2 4단원 비례식과 비례배분
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / 비의 성질 / 간단한 자연수의 비 / 비례식 /
// 비례식의 성질 / 비례식 활용 / 비례배분
//
// 지도서가 못박은 것:
//   · 비의 전항과 후항에 0이 아닌 같은 수를 곱하거나 나누어도 비율은 같습니다.
//   · 비율이 같은 두 비를 =로 이은 식이 비례식이고, 바깥쪽 두 항이 외항,
//     안쪽 두 항이 내항입니다. 외항의 곱과 내항의 곱은 같습니다.
//   · '간단한'의 뜻은 사람마다 다를 수 있으므로, 보기에서는 가장 간단한
//     자연수의 비 하나만 답이 되고 같은 비율의 다른 비는 보기에 두지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 비 = (a: number, b: number) => `${a} : ${b}`;
const 같은비율 = (a: number, b: number, c: number, d: number) => a * d === b * c;

const 비의성질: G5Family = {
  id: 'property',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 사이(next, 2, 9);
    if (a === b) return null;
    const k = 사이(next, 2, 6);
    const 나누기 = lv !== '하' && next(2) === 0;
    const [p, q, r, s] = 나누기 ? [a * k, b * k, a, b] : [a, b, a * k, b * k];
    const 앞모름 = next(2) === 0;
    const ans = 앞모름 ? r : s;
    return {
      prompt: `${비(p, q)} = ${앞모름 ? '□' : r} : ${앞모름 ? s : '□'}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(ans),
      wrongs: [...new Set([앞모름 ? s : r, ans + 1, ans * k, 앞모름 ? p + (s - q) : q + (r - p)])].filter((x) => x > 0 && x !== ans).slice(0, 3).map(String),
      tag: 'ratio',
      strategy: '비의 성질',
      hint: '전항과 후항에 같은 수를 곱하거나 나누어도 비율은 같아요.',
      steps: [(() => { const [x, y] = 앞모름 ? [q, s] : [p, r]; return 나누기 ? `${x}÷${k}=${y}이므로 전항과 후항을 ${k}(으)로 나눈 것입니다.` : `${x}×${k}=${y}이므로 전항과 후항에 ${k}을(를) 곱한 것입니다.`; })(), `그러므로 □=${ans}입니다.`],
      misconceptionTip: '같은 수를 더하면 비율이 달라져요. 곱하거나 나누어야 해요.',
    };
  },
};

const 간단히: G5Family = {
  id: 'simplify',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 사이(next, 1, 9);
    if (a === b || gcd(a, b) !== 1) return null;
    const kind = next(lv === '하' ? 1 : 3);
    let 문제: string;
    let 풀이: string;
    if (kind === 0) {
      const k = 사이(next, 2, 9);
      문제 = 비(a * k, b * k);
      풀이 = `두 항을 ${k}(으)로 나누면 ${비(a, b)}입니다.`;
    } else if (kind === 1) {
      문제 = 비(a / 10, b / 10);
      풀이 = `두 항에 10을 곱하면 ${비(a, b)}입니다.`;
    } else {
      // 1/b : 1/a = a : b (두 항에 ab를 곱함)
      문제 = `1/${b} : 1/${a}`;
      if (a === 1 || b === 1) return null;
      풀이 = `두 항에 ${a * b}을(를) 곱하면 ${비(a, b)}입니다.`;
    }
    const ans = 비(a, b);
    const wrongs = [비(b, a), 비(a + 1, b), 비(a, b + 1)].filter((w) => w !== ans);
    return {
      prompt: `${문제}을(를) 가장 간단한 자연수의 비로 나타낸 것은 어느 것일까요?`,
      answer: ans,
      wrongs,
      tag: 'ratio',
      strategy: '간단한 자연수의 비로 나타내기',
      hint: kind === 0 ? '두 항을 공약수로 나누어요.' : kind === 1 ? '소수는 10을 곱해 자연수로 만들어요.' : '분수는 두 분모의 공배수를 곱해요.',
      steps: [풀이],
      misconceptionTip: '전항과 후항의 자리를 바꾸면 다른 비가 돼요.',
    };
  },
};

const 외항내항: G5Family = {
  id: 'terms',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 사이(next, 2, 9);
    const k = 사이(next, 2, 5);
    const [c, d] = [a * k, b * k];
    if (new Set([a, b, c, d]).size < 4) return null;
    const 외 = next(2) === 0;
    const ans = 외 ? `${a}, ${d}` : `${b}, ${c}`;
    return {
      prompt: `비례식 ${비(a, b)} = ${비(c, d)}에서 ${외 ? '외항' : '내항'}을 모두 쓴 것은 어느 것일까요?`,
      answer: ans,
      wrongs: [외 ? `${b}, ${c}` : `${a}, ${d}`, `${a}, ${b}`, `${c}, ${d}`],
      tag: 'ratio',
      strategy: '외항과 내항',
      hint: '바깥쪽 두 수가 외항, 안쪽 두 수가 내항이에요.',
      steps: [`외항은 ${a}, ${d}이고 내항은 ${b}, ${c}입니다.`],
    };
  },
};

const 옳은비례식: G5Family = {
  id: 'true-proportion',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 9);
    const b = 사이(next, 2, 9);
    if (a === b) return null;
    const k = 사이(next, 2, 5);
    const ans = `${비(a, b)} = ${비(a * k, b * k)}`;
    const wrongs = [`${비(a, b)} = ${비(b * k, a * k)}`, `${비(a, b)} = ${비(a + k, b + k)}`, `${비(a, b)} = ${비(a * k, b * k + 1)}`].filter((w) => {
      const m = /^(\d+) : (\d+) = (\d+) : (\d+)$/.exec(w)!;
      return !같은비율(+m[1], +m[2], +m[3], +m[4]);
    });
    if (wrongs.length < 3) return null;
    return {
      prompt: '비례식으로 옳은 것은 어느 것일까요?',
      answer: ans,
      wrongs,
      tag: 'ratio',
      strategy: '비례식 알기',
      hint: '두 비의 비율이 같은지, 외항의 곱과 내항의 곱이 같은지 보세요.',
      steps: [`외항의 곱 ${a}×${b * k}=${a * b * k}, 내항의 곱 ${b}×${a * k}=${a * b * k}(으)로 같습니다.`],
    };
  },
};

const 비례식풀기: G5Family = {
  id: 'solve',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 12);
    const b = 사이(next, 1, 12);
    if (a === b) return null;
    const k = 사이(next, 2, 8);
    const terms = [a, b, a * k, b * k];
    const 자리 = next(4);
    const ans = terms[자리];
    const 식 = terms.map((t, i) => (i === 자리 ? '□' : String(t)));
    const 외곱 = 자리 === 0 || 자리 === 3;
    return {
      prompt: `${식[0]} : ${식[1]} = ${식[2]} : ${식[3]}에서 □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(ans),
      wrongs: [...new Set([ans + 1, ans * 2, terms[3 - 자리], Math.max(1, ans - 1)])].filter((x) => x !== ans).slice(0, 3).map(String),
      tag: 'ratio',
      strategy: '비례식의 성질로 □ 구하기',
      hint: '외항의 곱과 내항의 곱은 같아요.',
      steps: [외곱 ? `내항의 곱은 ${b}×${a * k}=${a * b * k}입니다.` : `외항의 곱은 ${a}×${b * k}=${a * b * k}입니다.`, `${a * b * k}÷${terms[3 - 자리]}=${ans}이므로 □=${ans}입니다.`],
      misconceptionTip: '같은 쪽에 있는 수끼리 곱하지 않도록 외항과 내항을 먼저 찾아요.',
    };
  },
};

const 활용: G5Family = {
  id: 'apply',
  make: (seed) => {
    const next = 고르개(seed);
    const kind = next(3);
    const a = 사이(next, 2, 6);
    const b = 사이(next, 1, 9) * 100;
    const k = 사이(next, 2, 9);
    if (kind === 0) {
      return {
        prompt: `연필 ${a}자루의 값이 ${b * a}원입니다. 같은 연필 ${a * k}자루의 값은 얼마일까요?`,
        answer: `${b * a * k}원`,
        wrongs: [...new Set([b * a + k, b * k, b * a * (k + 1), b * a * k + b])].filter((x) => x !== b * a * k).slice(0, 3).map((x) => `${x}원`),
        tag: 'ratio',
        strategy: '비례식 활용',
        hint: `${a} : ${b * a} = ${a * k} : □로 비례식을 세워요.`,
        steps: [`${a} : ${b * a} = ${a * k} : □`, `${a}×□=${b * a}×${a * k}이므로 □=${b * a * k}입니다.`],
      };
    }
    if (kind === 1) {
      const 거리 = 사이(next, 2, 9);
      return {
        prompt: `일정한 빠르기로 걷는 사람이 ${a}분 동안 ${거리 * a * 10} m를 걷습니다. 같은 빠르기로 ${a * k}분 동안 몇 m를 걸을까요?`,
        answer: `${거리 * a * 10 * k} m`,
        wrongs: [...new Set([거리 * a * 10 + k, 거리 * 10 * k, 거리 * a * 10 * (k + 1)])].filter((x) => x !== 거리 * a * 10 * k).slice(0, 3).map((x) => `${x} m`),
        tag: 'ratio',
        strategy: '비례식 활용',
        hint: '걸린 시간과 간 거리의 비가 같아요.',
        steps: [`${a} : ${거리 * a * 10} = ${a * k} : □`, `□=${거리 * a * 10 * k}`],
      };
    }
    const 밀가루 = 사이(next, 2, 5);
    const 설탕 = 사이(next, 1, 4);
    if (밀가루 === 설탕) return null;
    return {
      prompt: `밀가루와 설탕을 ${비(밀가루, 설탕)}(으)로 섞어 반죽을 만듭니다. 밀가루를 ${밀가루 * k}컵 넣는다면 설탕은 몇 컵 넣어야 할까요?`,
      answer: `${설탕 * k}컵`,
      wrongs: [...new Set([설탕 + k, 밀가루 * k, 설탕 * (k + 1), 설탕 * k - 1])].filter((x) => x > 0 && x !== 설탕 * k).slice(0, 3).map((x) => `${x}컵`),
      tag: 'ratio',
      strategy: '비례식 활용',
      hint: `${밀가루} : ${설탕} = ${밀가루 * k} : □로 비례식을 세워요.`,
      steps: [`${비(밀가루, 설탕)} = ${밀가루 * k} : □`, `${밀가루}×□=${설탕}×${밀가루 * k}이므로 □=${설탕 * k}입니다.`],
    };
  },
};

const 비례배분: G5Family = {
  id: 'distribute',
  make: (seed) => {
    const next = 고르개(seed);
    const a = 사이(next, 1, 7);
    const b = 사이(next, 1, 7);
    if (a === b) return null;
    const unit = 사이(next, 2, 15);
    const 전체 = (a + b) * unit;
    const 누구 = next(2) === 0;
    const ans = 누구 ? a * unit : b * unit;
    return {
      prompt: `구슬 ${전체}개를 형과 동생이 ${비(a, b)}(으)로 나누어 가지려고 합니다. ${누구 ? '형' : '동생'}은 몇 개를 가지게 될까요?`,
      answer: `${ans}개`,
      wrongs: [...new Set([누구 ? b * unit : a * unit, Math.floor(전체 / 2), 전체 - ans + unit, ans + unit])].filter((x) => x > 0 && x !== ans).slice(0, 3).map((x) => `${x}개`),
      tag: 'ratio',
      strategy: '비례배분',
      hint: `전체를 ${a}+${b}=${a + b}(으)로 보고 그중 ${누구 ? a : b}만큼이에요.`,
      steps: [`${전체}×${누구 ? a : b}/${a + b}=${ans}이므로 ${ans}개입니다.`],
      misconceptionTip: '비의 두 수를 더한 것이 전체가 돼요. 분모를 잘못 쓰지 마세요.',
    };
  },
};

export const unit4Lesson62 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [비의성질, 외항내항];
    case 2:
      return [비의성질];
    case 3:
      return [간단히];
    case 4:
      return lv === '하' ? [외항내항] : [외항내항, 옳은비례식];
    case 5:
      return [비례식풀기];
    case 6:
      return [활용];
    case 7:
      return [비례배분];
    default:
      return null;
  }
};
