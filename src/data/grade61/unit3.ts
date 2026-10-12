import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { 고르개, 사이 } from '../grade11/common';
import { 몫사이, 소수거꾸로, 소수점관계, 어림문장제소수, 어림확인소수 } from '../grade6/thinking';
import { 소수 } from '../grade42/unit3';

// ════════════════════════════════════════════════════════════════════
// 6-1 3단원 소수의 나눗셈 ((소수)÷(자연수))
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례: 단원 도입 / ⑴ 자연수의 나눗셈 이용 / ⑵ 몫이 1보다 큰
// 세로셈 / ⑶ 몫이 1보다 작은 것 / ⑷ 0을 내려 계산 / ⑸ 몫의 소수 첫째
// 자리에 0 / (자연수)÷(자연수)의 몫을 소수로 / 어림셈
//
// 지도서: 계산 원리를 이해하는 수준에서 다루고 복잡한 계산은 피합니다.
// 나누는 수는 한 자리 수로 둡니다.
//
// 소수는 천분 정수로 들고 다녀 오차가 없습니다(4-2와 같은 도구).
// ════════════════════════════════════════════════════════════════════

const 다른것 = (answer: string, xs: number[]) => [...new Set(xs.filter((x) => x > 0 && Number.isInteger(x)).map(소수))].filter((x) => x !== answer);

type 조건 = '자연수' | '큰몫' | '작은몫' | '영내림' | '몫에영' | '아무거나';

/** 몫(천분)과 나누는 수를 고릅니다. 조건에 맞지 않으면 null. */
const 고르기 = (next: (b: number) => number, 조건: 조건) => {
  const k = 사이(next, 2, 9);
  let q: number;
  switch (조건) {
    case '큰몫':
      q = 사이(next, 101, 999) * 10; // 1.01~9.99
      break;
    case '작은몫':
      q = 사이(next, 11, 99) * 10; // 0.11~0.99
      break;
    case '영내림':
      q = 사이(next, 101, 999) * 10;
      break;
    case '몫에영':
      q = 사이(next, 1, 9) * 1000 + 사이(next, 1, 9) * 10; // ○.0○
      break;
    default:
      q = 사이(next, 11, 999) * 10;
  }
  if (q % 100 === 0 && 조건 !== '몫에영') return null;
  const a = q * k;
  // 나누어지는 수의 소수 자릿수
  const 자리 = (m: number) => (m % 1000 === 0 ? 0 : m % 100 === 0 ? 1 : m % 10 === 0 ? 2 : 3);
  if (조건 === '영내림' && !(자리(a) === 1 && 자리(q) === 2)) return null;
  if (조건 !== '영내림' && 자리(a) !== 자리(q)) return null;
  if (조건 === '몫에영' && Math.floor((a % 1000) / 100) >= k) return null;
  return { a, k, q };
};

const 나눗셈 = (조건: 조건, 이름: string): G5Family => ({
  id: `div-${조건}`,
  make: (seed) => {
    const next = 고르개(seed);
    const one = 고르기(next, 조건);
    if (!one) return null;
    const { a, k, q } = one;
    const ans = 소수(q);
    // 몫의 0을 빠뜨린 실수(1.05 → 1.5), 소수점 자리 실수
    const 영빠짐 = 조건 === '몫에영' ? Number(ans.replace('.0', '.')) * 1000 : q + 1000;
    return {
      prompt: `${소수(a)}÷${k}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [영빠짐, q * 10, q / 10, q + 10, q - 10, q + 100]).slice(0, 4),
      tag: 'decimalDiv',
      strategy: 이름,
      hint: 조건 === '작은몫' ? '나누어지는 수가 나누는 수보다 작으면 몫의 일의 자리에 0을 써요.' : 조건 === '영내림' ? '나누어떨어지지 않으면 소수점 아래 끝자리에 0이 있는 것으로 생각하고 0을 내려 계산해요.' : 조건 === '몫에영' ? '나눌 수 없는 자리의 몫에는 0을 써요.' : '자연수의 나눗셈처럼 계산하고 몫의 소수점은 나누어지는 수의 소수점 자리에 맞추어 찍어요.',
      steps: [`${소수(a)}÷${k}=${ans}`, `확인: ${ans}×${k}=${소수(a)}`],
      misconceptionTip: '몫의 소수점을 빠뜨리거나 0을 빠뜨리지 않았는지 확인하세요.',
    };
  },
});

const 자연수이용: G5Family = {
  id: 'use-whole',
  make: (seed) => {
    const next = 고르개(seed);
    const k = 사이(next, 2, 9);
    const Q = 사이(next, 11, 299);
    const A = Q * k;
    const 배 = [10, 100][next(2)];
    const ans = 소수((Q * 1000) / 배);
    return {
      prompt: `${A}÷${k}=${Q}을(를) 이용하면 ${소수((A * 1000) / 배)}÷${k}은(는) 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [Q * 1000, (Q * 1000) / (배 === 10 ? 100 : 10), (Q * 1000) / (배 * 10), Q * 1000 * 10]).slice(0, 3),
      tag: 'decimalDiv',
      strategy: '자연수의 나눗셈을 이용한 (소수)÷(자연수)',
      hint: `나누어지는 수가 1/${배}배이면 몫도 1/${배}배가 돼요.`,
      steps: [`${소수((A * 1000) / 배)}은(는) ${A}의 1/${배}배입니다.`, `그러므로 몫도 ${Q}의 1/${배}배인 ${ans}입니다.`],
    };
  },
};

const 자연수몫소수: G5Family = {
  id: 'whole-to-decimal',
  make: (seed) => {
    const next = 고르개(seed);
    const k = [2, 4, 5, 8][next(4)];
    const a = 사이(next, 1, 30);
    if (a % k === 0) return null;
    const q = (a * 1000) / k;
    if (!Number.isInteger(q)) return null;
    const ans = 소수(q);
    return {
      prompt: `${a}÷${k}의 몫을 소수로 나타내면 얼마일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [q * 10, q / 10, Math.floor(a / k) * 1000 + (a % k) * 100, (k * 1000) / a]).filter((w) => !w.includes('e')).slice(0, 4),
      tag: 'decimalDiv',
      strategy: '(자연수)÷(자연수)의 몫을 소수로 나타내기',
      hint: '나누어떨어지지 않으면 나누어지는 수 뒤에 소수점과 0을 붙여 계속 나누어요.',
      steps: [`${a}÷${k}=${ans}`, `확인: ${ans}×${k}=${a}`],
      misconceptionTip: '나머지를 소수 부분에 그대로 쓰면 안 돼요.',
    };
  },
};

const 어림: G5Family = {
  id: 'estimate',
  make: (seed) => {
    const next = 고르개(seed);
    const one = 고르기(next, '아무거나');
    if (!one) return null;
    const { a, k, q } = one;
    if (a < 2000) return null;
    const ans = 소수(q);
    const 어림수 = Math.round(a / 1000);
    return {
      prompt: `${소수(a)}÷${k}의 몫을 어림하여 소수점을 바르게 찍은 것은 어느 것일까요?`,
      answer: ans,
      wrongs: 다른것(ans, [q * 10, q / 10, q * 100]).slice(0, 3),
      tag: 'decimalDiv',
      strategy: '어림셈으로 소수점 위치 정하기',
      hint: `${소수(a)}을(를) 가까운 자연수 ${어림수}(으)로 어림해 보세요.`,
      steps: [`${소수(a)}÷${k}은(는) ${어림수}÷${k}쯤이므로 몫은 약 ${Math.round(어림수 / k) || '1보다 작은 수'}입니다.`, `그러므로 ${ans}입니다.`],
    };
  },
};

const 문장제: G5Family = {
  id: 'story',
  make: (seed) => {
    const next = 고르개(seed);
    const one = 고르기(next, '아무거나');
    if (!one) return null;
    const { a, k, q } = one;
    const 장면 = next(2) === 0;
    const ans = 소수(q);
    return {
      prompt: 장면 ? `리본 ${소수(a)} m를 ${k}명이 똑같이 나누어 가지면 한 명이 가지는 리본은 몇 m일까요?` : `무게가 같은 공 ${k}개의 무게가 ${소수(a)} kg입니다. 공 한 개의 무게는 몇 kg일까요?`,
      answer: `${ans} ${장면 ? 'm' : 'kg'}`,
      wrongs: 다른것(ans, [q * 10, q / 10, a * k, q + 100]).slice(0, 3).map((x) => `${x} ${장면 ? 'm' : 'kg'}`),
      tag: 'decimalDiv',
      strategy: '(소수)÷(자연수) 문장제',
      hint: '똑같이 나누므로 나눗셈이에요.',
      steps: [`${소수(a)}÷${k}=${ans}`],
    };
  },
};

export const unit3Lesson61 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [자연수이용, 문장제];
    case 2:
      return [자연수이용, 소수점관계('자연수로')];
    case 3:
      return lv === '하' ? [나눗셈('큰몫', '몫이 1보다 큰 (소수)÷(자연수)'), 소수점관계('자연수로'), 문장제] : [나눗셈('큰몫', '몫이 1보다 큰 (소수)÷(자연수)'), 문장제, 소수거꾸로('자연수')];
    case 4:
      return [나눗셈('작은몫', '몫이 1보다 작은 (소수)÷(자연수)'), 소수거꾸로('자연수'), 문장제];
    case 5:
      return [나눗셈('영내림', '0을 내려 계산하는 (소수)÷(자연수)'), 소수거꾸로('자연수'), 소수점관계('자연수로')];
    case 6:
      return [나눗셈('몫에영', '몫의 소수 첫째 자리에 0이 있는 (소수)÷(자연수)'), 소수거꾸로('자연수'), 문장제];
    case 7:
      return [자연수몫소수, 소수점관계('자연수로'), 소수거꾸로('자연수')];
    case 8:
      return lv === '하'
        ? [어림, 몫사이('자연수'), 어림문장제소수, 소수점관계('자연수로')]
        : [어림, 몫사이('자연수'), 어림확인소수, 어림문장제소수, 소수점관계('자연수로')];
    default:
      return null;
  }
};
