import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 소수 } from '../grade42/unit3';

// ════════════════════════════════════════════════════════════════════
// 6-2 2단원 소수의 나눗셈 ((소수)÷(소수), (자연수)÷(소수))
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / (소수)÷(소수) ⑴ 자연수의 나눗셈 이용 /
// ⑵ 자릿수가 같은 것 / ⑶ 자릿수가 다른 것 / (자연수)÷(소수) / 몫을
// 반올림하기 / 나누어 주고 남는 양 / 어림셈
//
// 지도서가 못박은 것:
//   · 나누는 수와 나누어지는 수에 똑같이 10, 100을 곱해도 몫은 같습니다.
//   · 소수의 나눗셈에서 '나머지'라는 말은 쓰지 않고 '나누어 주고 남는
//     양'이라고 합니다. 남는 양은 원래 문제의 수(소수점을 옮기기 전)로
//     구합니다.
//   · 나누어떨어지지 않으면 몫을 반올림하여 나타냅니다.
//
// 모든 소수는 천분 정수로 다룹니다(값 m은 m/1000).
// ════════════════════════════════════════════════════════════════════

const 다른것 = (answer: string, xs: number[]) => [...new Set(xs.filter((x) => x > 0 && Number.isInteger(x)).map(소수))].filter((x) => x !== answer);
const 자리 = (m: number) => (m % 1000 === 0 ? 0 : m % 100 === 0 ? 1 : m % 10 === 0 ? 2 : 3);

/** 나누는 수 b(천분)와 몫 q(천분)에서 나누어지는 수를 만듭니다. 정수 천분이 아니면 null. */
const 짝 = (b: number, q: number) => {
  const a = (b * q) / 1000;
  return Number.isInteger(a) ? a : null;
};

const 자연수이용: G5Family = {
  id: 'use-whole',
  make: (seed) => {
    const next = 고르개(seed);
    const B = 사이(next, 2, 9);
    const Q = 사이(next, 11, 99);
    const A = B * Q;
    const 배 = [10, 100][next(2)];
    const a = (A * 1000) / 배;
    const b = (B * 1000) / 배;
    return {
      prompt: `${A}÷${B}=${Q}입니다. ${소수(a)}÷${소수(b)}은(는) 얼마일까요?`,
      answer: String(Q),
      wrongs: [Q * 10, Q / 10, Q * 100].map((x) => (Number.isInteger(x) ? String(x) : 소수(x * 1000))),
      tag: 'decimalDiv',
      strategy: '자연수의 나눗셈을 이용한 (소수)÷(소수)',
      hint: '나누어지는 수와 나누는 수가 똑같이 줄었으니 몫은 그대로예요.',
      steps: [`${소수(a)}과(와) ${소수(b)}에 똑같이 ${배}을(를) 곱하면 ${A}÷${B}입니다.`, `그러므로 몫은 ${Q}입니다.`],
      misconceptionTip: '두 수에 똑같이 곱하면 몫은 변하지 않아요.',
    };
  },
};

const 소수나누기 = (같은자리: boolean): G5Family => ({
  id: `dec-div-${같은자리 ? 'same' : 'diff'}`,
  make: (seed, lv) => {
    const next = 고르개(seed);
    const bp = 같은자리 ? (lv === '하' ? 1 : [1, 2][next(2)]) : 1;
    const b = 사이(next, 2, bp === 1 ? 99 : 99) * (bp === 1 ? 100 : 10);
    if (b % 1000 === 0) return null;
    const q = 같은자리 ? 사이(next, 2, 60) * 1000 : 사이(next, 11, 99) * 100;
    const a = 짝(b, q);
    if (a === null || a <= 0) return null;
    if (같은자리 && 자리(a) !== 자리(b)) return null;
    if (!같은자리 && 자리(a) !== 2) return null;
    const ans = 소수(q);
    return {
      prompt: `${소수(a)}÷${소수(b)}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [q * 10, q / 10, q * 100, q + 1000]).slice(0, 4),
      tag: 'decimalDiv',
      strategy: 같은자리 ? '자릿수가 같은 (소수)÷(소수)' : '자릿수가 다른 (소수)÷(소수)',
      hint: '나누는 수가 자연수가 되도록 두 수의 소수점을 똑같이 옮겨요.',
      steps: [`두 수의 소수점을 똑같이 ${자리(b) === 1 ? '한' : '두'} 자리씩 옮기면 ${소수(a * 10 ** 자리(b))}÷${소수(b * 10 ** 자리(b))}입니다.`, `몫은 ${ans}입니다.`],
      misconceptionTip: '나누는 수의 소수점만 옮기고 나누어지는 수는 그대로 두면 안 돼요.',
    };
  },
});

const 자연수나누기소수: G5Family = {
  id: 'whole-div-dec',
  make: (seed) => {
    const next = 고르개(seed);
    const b = [사이(next, 2, 9) * 100, 사이(next, 11, 99) * 10, [250, 750, 1250, 500, 1500][next(5)]][next(3)];
    if (b % 1000 === 0) return null;
    const q = 사이(next, 2, 40) * 1000;
    const a = 짝(b, q);
    if (a === null || a % 1000 !== 0) return null;
    const ans = 소수(q);
    return {
      prompt: `${소수(a)}÷${소수(b)}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [q / 10, q * 10, q / 100, q + 1000]).slice(0, 3),
      tag: 'decimalDiv',
      strategy: '(자연수)÷(소수)',
      hint: '나누는 수가 자연수가 되도록 두 수에 똑같이 10이나 100을 곱해요.',
      steps: [`${소수(a)}÷${소수(b)}=${소수(a * 10 ** 자리(b))}÷${소수(b * 10 ** 자리(b))}=${ans}`],
      misconceptionTip: '자연수에도 똑같이 10이나 100을 곱해야 해요(0을 붙여요).',
    };
  },
};

const 반올림: G5Family = {
  id: 'round',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const k = [3, 6, 7, 9, 11][next(5)];
    const a = 사이(next, 1, 30);
    if (a % k === 0) return null;
    const 자리수 = lv === '하' ? 1 : [1, 2][next(2)];
    const 단위 = 10 ** 자리수;
    const v = Math.round((a / k) * 단위);
    // 반올림 경계에 걸리면(…5) 판단이 흔들리므로 피합니다.
    const 다음 = Math.floor(((a * 단위 * 10) / k) % 10);
    if (다음 === 5) return null;
    const ans = (v / 단위).toFixed(자리수);
    const 버림 = (Math.floor((a / k) * 단위) / 단위).toFixed(자리수);
    const 올림 = (Math.ceil((a / k) * 단위) / 단위).toFixed(자리수);
    const 다른자리 = (Math.round((a / k) * 단위 * 10) / (단위 * 10)).toFixed(자리수 + 1);
    const 다른 = [버림, 올림, 다른자리, (Math.round(a / k)).toFixed(0)].filter((x, i, xs) => x !== ans && xs.indexOf(x) === i);
    return {
      prompt: `${a}÷${k}의 몫을 반올림하여 소수 ${자리수 === 1 ? '첫째' : '둘째'} 자리까지 나타내면 얼마일까요?`,
      answer: ans,
      wrongs: 다른.slice(0, 3),
      tag: 'decimalDiv',
      strategy: '몫을 반올림하여 나타내기',
      hint: `몫을 소수 ${자리수 === 1 ? '둘째' : '셋째'} 자리까지 구한 다음 반올림해요.`,
      steps: [`${a}÷${k}=${(Math.floor((a / k) * 단위 * 10) / (단위 * 10)).toFixed(자리수 + 1)}…`, `소수 ${자리수 === 1 ? '둘째' : '셋째'} 자리 숫자가 ${다음}이므로 ${다음 >= 5 ? '올림' : '버림'}하여 ${ans}입니다.`],
      misconceptionTip: '구하려는 자리 바로 아래 자리의 숫자를 보고 반올림해요.',
    };
  },
};

const 남는양: G5Family = {
  id: 'leftover',
  make: (seed) => {
    const next = 고르개(seed);
    const 한병 = 사이(next, 2, 5);
    const 병 = 사이(next, 2, 9);
    const 남 = 사이(next, 1, 한병 * 10 - 1) * 100; // 천분
    const 전체 = 병 * 한병 * 1000 + 남;
    if (남 % 1000 === 0) return null;
    const 물건 = ['간장', '식용유', '물'][next(3)];
    const ans = `${병}병, ${소수(남)} L`;
    return {
      prompt: `${물건} ${소수(전체)} L를 한 병에 ${한병} L씩 나누어 담으려고 합니다. 담을 수 있는 병의 수와 남는 ${물건}의 양을 바르게 구한 것은 어느 것일까요?`,
      answer: ans,
      wrongs: [`${병}병, ${소수(남 / 10)} L`, `${병 + 1}병, ${소수(남)} L`, `${병}병, ${소수(남 * 10 > 한병 * 1000 ? 남 + 1000 : 남 * 10)} L`].filter((w) => w !== ans),
      tag: 'decimalDiv',
      strategy: '나누어 주고 남는 양 구하기',
      hint: '병의 수는 자연수까지만 구하고, 남는 양은 원래 양에서 담은 양을 빼요.',
      steps: [`${한병}×${병}=${병 * 한병}이므로 ${병}병에 담을 수 있습니다.`, `${소수(전체)}-${병 * 한병}=${소수(남)}이므로 ${소수(남)} L가 남습니다.`],
      misconceptionTip: '남는 양의 소수점은 원래 양의 소수점 자리에 맞추어 찍어요.',
      minusIsOperator: true,
    };
  },
};

const 어림: G5Family = {
  id: 'estimate',
  make: (seed) => {
    const next = 고르개(seed);
    const b = 사이(next, 11, 99) * 100;
    const q = 사이(next, 11, 99) * 100;
    const a = 짝(b, q);
    if (a === null || a < 2000) return null;
    const ans = 소수(q);
    return {
      prompt: `${소수(a)}÷${소수(b)}의 몫을 어림하여 소수점을 바르게 찍은 것은 어느 것일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [q * 10, q / 10, q * 100]).slice(0, 3),
      tag: 'decimalDiv',
      strategy: '어림셈으로 몫의 소수점 정하기',
      hint: '두 수를 가까운 자연수로 어림하여 몫이 얼마쯤인지 짐작해요.',
      steps: [`${소수(a)}÷${소수(b)}은(는) ${Math.round(a / 1000)}÷${Math.max(1, Math.round(b / 1000))}쯤입니다.`, `그러므로 ${ans}입니다.`],
    };
  },
};

export const unit2Lesson62 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [자연수이용];
    case 2:
      return [자연수이용];
    case 3:
      return [소수나누기(true)];
    case 4:
      return [소수나누기(false)];
    case 5:
      return [자연수나누기소수];
    case 6:
      return [반올림];
    case 7:
      return [남는양];
    case 8:
      return lv === '하' ? [어림] : [어림, 소수나누기(false)];
    default:
      return null;
  }
};
