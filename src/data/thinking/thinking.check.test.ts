import { describe, expect, it } from 'vitest';
import { lessons as lessons2 } from '../curriculum';
import { curriculum11 } from '../curriculum11';
import { curriculum12 } from '../curriculum12';
import { curriculum31 } from '../curriculum31';
import { curriculum32 } from '../curriculum32';
import { curriculum41 } from '../curriculum41';
import { curriculum42 } from '../curriculum42';
import { curriculum51 } from '../curriculum51';
import { curriculum5 } from '../curriculum5';
import { curriculum61 } from '../curriculum61';
import { curriculum62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// '생각하는 문항'(thinking/)을 학년과 상관없이 처음부터 다시 풉니다.
// 문항의 글만 읽고 답을 따로 구해, 생성기가 낸 답과 견줍니다.
// ════════════════════════════════════════════════════════════════════

const 모든차시 = [...curriculum11, ...curriculum12].flatMap((u) => u.lessons)
  .concat(lessons2)
  .concat([...curriculum31, ...curriculum32, ...curriculum41, ...curriculum42, ...curriculum51, ...curriculum5, ...curriculum61, ...curriculum62].flatMap((u) => u.lessons));
const 모두: Question[] = [];
for (const l of 모든차시) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 순열 = (xs: number[], k: number): number[][] => (k === 0 ? [[]] : xs.flatMap((x, i) => 순열([...xs.slice(0, i), ...xs.slice(i + 1)], k - 1).map((r) => [x, ...r])));

// '1과 3/5', '3/5', '2' → 분자/분모 값
const 분수값 = (t: string): number => {
  const s = t.replace(/ (m|L|cm)$/, '').trim();
  let m = /^(\d+)(?:과|와) (\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2]);
  return Number(s);
};
const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const 수식 = String.raw`(\d+(?:(?:과|와) \d+\/\d+)?|\d+\/\d+|\d+\.\d+)`;

describe('생각하는 문항(분수·소수)', () => {
  it('거꾸로·잘못 계산·수 카드·문장제·□ 범위 답이 맞습니다', () => {
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = new RegExp(`^어떤 수에(서)? ${수식}(?:을|를) (더했|뺐)더니 ${수식}(?:이|가) 되었습니다. 어떤 수는`).exec(p);
      if (m) {
        const a = 분수값(m[2]); const r = 분수값(m[4]);
        expect(같다(분수값(q.answer), m[3] === '더했' ? r - a : r + a), p).toBe(true);
        센다(m[2].includes('.') ? '소수어떤수' : '분수어떤수');
      }
      m = new RegExp(`^어떤 수에 ${수식}(?:을|를) 더해야 할 것을 잘못하여 뺐더니 ${수식}(?:이|가)`).exec(p);
      if (m) { const a = 분수값(m[1]); expect(같다(분수값(q.answer), 분수값(m[2]) + 2 * a), p).toBe(true); 센다(m[1].includes('.') ? '소수잘못' : '분수잘못'); }
      m = /^수 카드 ([\d, ]+) 가운데 2장을 골라 분모가 (\d+)인 대분수를 만들려고 합니다. 만들 수 있는 가장 큰 대분수와 가장 작은 대분수의 (합|차)/.exec(p);
      if (m) {
        const 카드 = m[1].split(', ').map(Number); const d = Number(m[2]);
        const 값 = 카드.flatMap((w) => 카드.filter((n) => n !== w && n < d).map((n) => w + n / d));
        const v = m[3] === '합' ? Math.max(...값) + Math.min(...값) : Math.max(...값) - Math.min(...값);
        expect(같다(분수값(q.answer), v), p).toBe(true);
        센다('분수카드');
      }
      m = /^수 카드 ([\d, ]+)(?:을|를) 한 번씩만 사용하여 소수 두 자리 수를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 (합|차)/.exec(p);
      if (m) {
        const 카드 = m[1].split(', ').map(Number);
        const 값 = 순열(카드, 3).map((x) => x[0] + x[1] / 10 + x[2] / 100);
        const v = m[2] === '합' ? Math.max(...값) + Math.min(...값) : Math.max(...값) - Math.min(...값);
        expect(Math.abs(Number(q.answer) - v) < 1e-9, p).toBe(true);
        센다('소수카드');
      }
      m = new RegExp(`^끈 ${수식} m 가운데 상자를 묶는 데 ${수식} m, 리본을 만드는 데 ${수식} m를 썼습니다`).exec(p);
      if (m) { expect(같다(분수값(q.answer), 분수값(m[1]) - 분수값(m[2]) - 분수값(m[3])), p).toBe(true); 센다('분수문장제'); }
      m = /^□\/(\d+)\+(\d+)\/\1<(.+?)에서 □ 안에 들어갈 수 있는 자연수 가운데 가장 큰 수/.exec(p);
      if (m) {
        const d = Number(m[1]); const a = Number(m[2]); const X = 분수값(m[3]);
        const 맞는 = Array.from({ length: 100 }, (_, i) => i + 1).filter((x) => x / d + a / d < X - 1e-12);
        expect(Number(q.answer), p).toBe(Math.max(...맞는));
        센다('분수네모');
      }
      m = /^물병에 물이 ([\d.]+) L 있었습니다. 그중에서 ([\d.]+) L를 마시고 ([\d.]+) L를 더 부었습니다/.exec(p);
      if (m) { expect(Math.abs(분수값(q.answer) - (Number(m[1]) - Number(m[2]) + Number(m[3]))) < 1e-9, p).toBe(true); 센다('소수문장제'); }
    }
    for (const k of ['분수어떤수', '소수어떤수', '분수잘못', '소수잘못', '분수카드', '소수카드', '분수문장제', '분수네모', '소수문장제']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});

// '3045만 72' → 30450072
const 만값 = (t: string) => t.split(' ').reduce((s, g) => {
  const m = /^(\d+)(조|억|만)?$/.exec(g)!;
  return s + Number(m[1]) * ({ 조: 1e12, 억: 1e8, 만: 1e4 } as Record<string, number>)[m[2] ?? ''] || s + Number(m[1]);
}, 0);

describe('생각하는 문항(4-1 큰 수·각도·이동·규칙)', () => {
  it('답이 맞습니다', () => {
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^어떤 수에서 (.+?)씩 (\d+)번 뛰어 세었더니 (.+?)(?:이|가) 되었습니다/.exec(p);
      if (m) { expect(만값(q.answer), p).toBe(만값(m[3]) - Number(m[2]) * 만값(m[1])); 센다('뛰어거꾸로'); }
      m = /^(.+?)에서 (.+?)씩 몇 번 뛰어 세면 (.+?)(?:이|가) 될까요/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((만값(m[3]) - 만값(m[1])) / 만값(m[2])); 센다('몇번'); }
      m = /^수 카드 ([\d, ]+)(?:을|를) 한 번씩 모두 사용하여 .+ 자리 수를 만들려고 합니다. (가장 큰|둘째로 큰|가장 작은) 수/.exec(p);
      if (m) {
        const 카드 = m[1].split(', ').map(Number);
        const 수들 = 순열(카드, 카드.length).filter((x) => x[0] !== 0).map((x) => Number(x.join(''))).sort((a, b) => b - a);
        const 답 = m[2] === '가장 큰' ? 수들[0] : m[2] === '둘째로 큰' ? 수들[1] : 수들[수들.length - 1];
        expect(Number(q.answer), p).toBe(답);
        센다('큰수카드');
      }
      m = /^(\d*□\d*)([<>])(\d+)에서 □ 안에 들어갈 수 있는 숫자는 모두 몇 개/.exec(p);
      if (m) {
        const n = Array.from({ length: 10 }, (_, d) => Number(m![1].replace('□', String(d)))).filter((x) => (m![2] === '>' ? x > Number(m![3]) : x < Number(m![3]))).length;
        expect(수(q.answer), p).toBe(n);
        센다('네모숫자');
      }
      m = /^(\d+)에서 앞쪽의 숫자 (\d)(?:이|가) 나타내는 값은 뒤쪽의 숫자 \2(?:이|가) 나타내는 값의 몇 배/.exec(p);
      if (m) {
        const ds = m[1].split('');
        const i = ds.indexOf(m[2]); const j = ds.lastIndexOf(m[2]);
        expect(ds.filter((d) => d === m![2]).length, p).toBe(2);
        expect(수(q.answer), p).toBe(10 ** (j - i));
        센다('자릿값배');
      }
      if (p.startsWith('30°, 60°, 90°인 삼각자와 45°, 45°, 90°인 삼각자')) {
        const 된다 = new Set<number>();
        for (const a of [30, 60, 90]) for (const b of [45, 90]) { 된다.add(a + b); 된다.add(Math.abs(a - b)); }
        expect(된다.has(수(q.answer)), p).toBe(false);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(된다.has(수(c)), c).toBe(true);
        센다('삼각자');
      }
      m = /^(.)각형을 한 꼭짓점에서 그은 대각선으로/.exec(p);
      if (m) { const n = { 오: 5, 육: 6, 칠: 7, 팔: 8 }[m[1] as '오']!; expect(수(q.answer), p).toBe((n - 2) * 180); 센다('다각형'); }
      m = /^각도기로 잰 각도는 (\d+)°입니다. 가 모둠은 약 (\d+)°, 나 모둠은 약 (\d+)°/.exec(p);
      if (m) { const r = Number(m[1]); expect(q.answer, p).toBe(Math.abs(r - Number(m[2])) < Math.abs(r - Number(m[3])) ? '가 모둠' : '나 모둠'); 센다('어림'); }
      m = /^점을 (오른쪽|왼쪽)으로 (\d+)칸, (위쪽|아래쪽)으로 (\d+)칸 이동했습니다. 이동한 점을 처음 자리로/.exec(p);
      if (m) {
        const 반 = { 오른쪽: '왼쪽', 왼쪽: '오른쪽', 위쪽: '아래쪽', 아래쪽: '위쪽' } as Record<string, string>;
        expect(q.answer, p).toBe(`${반[m[1]]}으로 ${m[2]}칸, ${반[m[3]]}으로 ${m[4]}칸`);
        센다('되돌기');
      }
      m = /^도형을 시계 방향으로 90°만큼 (\d+)번 돌린 도형은 시계 방향으로 몇 도/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((90 * Number(m[1])) % 360); 센다('여러번'); }
      m = /^도형을 시계 방향으로 (\d+)°만큼 돌린 도형은 시계 반대 방향으로 몇 도/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(360 - Number(m[1])); 센다('반대'); }
      m = /^(\d+), (\d+), (\d+), (\d+), …와 같은 규칙으로 수를 늘어놓을 때 (\d+)째 수/.exec(p);
      if (m) { const a = Number(m[1]); const d = Number(m[2]) - a; expect(Number(m[4]) - Number(m[3]), p).toBe(d); expect(Number(q.answer), p).toBe(a + (Number(m[5]) - 1) * d); 센다('몇째'); }
      const 칸 = (h: number) => Math.min(h, 12 - h);
      m = /^([\d시, ]+) 가운데 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각이 가장 (큰|작은) 시각/.exec(p);
      if (m) {
        const 시들 = m[1].split(', ').map((t) => Number(t.replace('시', '')));
        const 칸들 = 시들.map(칸);
        expect(new Set(칸들).size, p).toBe(4);
        const 목표 = m[2] === '큰' ? Math.max(...칸들) : Math.min(...칸들);
        expect(q.answer, p).toBe(`${시들[칸들.indexOf(목표)]}시`);
        센다('시계비교');
      }
      m = /^(\d+)시 정각일 때 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각도는 몇 도/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(칸(Number(m[1])) * 30); 센다('시계각도'); }
      if (/^세 각의 크기가 모두 같은 삼각형/.test(p)) { expect(q.answer).toBe('60°'); 센다('삼각조건'); }
      if (/^한 각이 직각이고 나머지 두 각의 크기가 같은 삼각형/.test(p)) { expect(q.answer).toBe('45°'); 센다('삼각조건'); }
      m = /^두 각의 크기가 같은 삼각형에서 나머지 한 각이 (\d+)°/.exec(p);
      if (m) { expect(수(q.answer) * 2 + Number(m[1]), p).toBe(180); 센다('삼각조건'); }
      m = /^삼각형 ㄱㄴㄷ에서 변 ㄴㄷ을 꼭짓점 ㄷ 쪽으로 늘였습니다. 각 ㄱㄴㄷ이 (\d+)°, 각 ㄴㄱㄷ이 (\d+)°/.exec(p);
      if (m) { const ㄷ = 180 - Number(m[1]) - Number(m[2]); expect(수(q.answer), p).toBe(180 - ㄷ); 센다('삼각조건'); }
      m = /^사각형의 네 각 가운데 세 각의 크기가 같고, 나머지 한 각은 (\d+)°/.exec(p);
      if (m) { expect(수(q.answer) * 3 + Number(m[1]), p).toBe(360); 센다('사각조건'); }
      m = /^사각형 ㄱㄴㄷㄹ에서 각 ㄱ이 (\d+)°, 각 ㄴ이 (\d+)°, 각 ㄷ이 (\d+)°입니다. 변 ㄷㄹ을/.exec(p);
      if (m) { const ㄹ = 360 - Number(m[1]) - Number(m[2]) - Number(m[3]); expect(수(q.answer), p).toBe(180 - ㄹ); 센다('사각조건'); }
      m = /^(\d+)×(\d+)(?:을|를) 계산하면 곱의 끝에 0이 몇 개/.exec(p);
      if (m) { const 곱 = String(Number(m[1]) * Number(m[2])); expect(수(q.answer), p).toBe(곱.length - 곱.replace(/0+$/, '').length); 센다('끝0'); }
      m = /^(\d+)원이 있습니다. 10000원이 되려면 (천|백|십) 원짜리 \S+ 몇 개 더/.exec(p);
      if (m) { const 단위 = { 천: 1000, 백: 100, 십: 10 }[m[2]]!; expect(수(q.answer), p).toBe((10000 - Number(m[1])) / 단위); 센다('만되려면'); }
    }
    for (const k of ['뛰어거꾸로', '몇번', '큰수카드', '네모숫자', '자릿값배', '삼각자', '다각형', '어림', '되돌기', '여러번', '반대', '몇째', '시계비교', '시계각도', '삼각조건', '사각조건', '끝0', '만되려면']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});

describe('생각하는 문항(4-2 도형)', () => {
  it('답이 맞습니다', () => {
    const 각수 = { 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9, 십: 10 } as Record<string, number>;
    const 참 = new Set(['정사각형은 직사각형', '정사각형은 마름모', '마름모는 평행사변형', '직사각형은 평행사변형', '평행사변형은 사다리꼴', '정사각형은 사다리꼴']);
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      if (p.startsWith('사각형 사이의 관계를 바르게 생각하여')) {
        const 옳은 = p.includes('옳은 것을');
        const 판단 = (t: string) => 참.has(t.replace('이라고 할 수 있습니다.', '').replace('라고 할 수 있습니다.', ''));
        expect(판단(q.answer), q.answer).toBe(옳은);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(판단(c), c).toBe(!옳은);
        센다('관계');
      }
      let m = /^네 변의 길이의 합이 (\d+) cm인 평행사변형이 있습니다. 한 변이 (\d+) cm일 때/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[1]) / 2 - Number(m[2])); 센다('평행사변형'); }
      m = /^네 변의 길이의 합이 (\d+) cm인 마름모의 한 변/.exec(p);
      if (m) { expect(수(q.answer) * 4, p).toBe(Number(m[1])); 센다('마름모'); }
      m = /^모든 변의 길이의 합이 (\d+) cm인 정(.)각형의 한 변/.exec(p);
      if (m) { expect(수(q.answer) * 각수[m[2]], p).toBe(Number(m[1])); 센다('정다각형'); }
      m = /^길이가 (\d+) cm인 철사를 .+ 정(.)각형을 하나 만들었고, 같은 길이의 철사로 정(.)각형도/.exec(p);
      if (m) { const L = Number(m[1]); expect(수(q.answer), p).toBe(Math.abs(L / 각수[m[2]] - L / 각수[m[3]])); 센다('철사'); }
      m = /^대각선이 모두 (\d+)개인 다각형의 이름/.exec(p);
      if (m) { const n = 각수[q.answer[0]]; expect((n * (n - 3)) / 2, p).toBe(Number(m[1])); 센다('대각선'); }
      m = /^서로 평행한 직선 가, 나, 다가 차례로 있습니다. 가와 나 사이의 거리는 (\d+) cm, 나와 다 사이의 거리는 (\d+) cm/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[1]) + Number(m[2])); 센다('평행선합'); }
      m = /가와 다 사이의 거리는 (\d+) cm이고, 나는 가와 다 사이에 있으며 가와 나 사이의 거리는 (\d+) cm/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[1]) - Number(m[2])); 센다('평행선차'); }
      m = /^한 변이 (\d+) cm인 정삼각형 (\d+)개를 변끼리 맞닿게 한 줄로/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((Number(m[2]) + 2) * Number(m[1])); 센다('이어붙인'); }
    }
    for (const k of ['관계', '평행사변형', '마름모', '정다각형', '철사', '대각선', '평행선합', '평행선차', '이어붙인']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});

describe('생각하는 문항(6학년)', () => {
  it('답이 맞습니다', () => {
    const 값 = (t: string): number => {
      const x = t.replace(/ ?(cm|m|km|L|개|명|원|바퀴|배)$/, '').trim();
      let m = /^(\d+)(?:과|와) (\d+)\/(\d+)$/.exec(x);
      if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
      m = /^(\d+)\/(\d+)$/.exec(x);
      if (m) return Number(m[1]) / Number(m[2]);
      return Number(x);
    };
    const 식값 = (t: string) => { const [a, b] = t.split('÷'); return 값(a) / 값(b); };
    const 같 = (a: number, b: number) => Math.abs(a - b) < 1e-9;
    const 수글 = String.raw`(\d+(?:(?:과|와) \d+\/\d+)?|\d+\/\d+|\d+\.\d+)`;
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = new RegExp(`^어떤 수에 ${수글}(?:을|를) 곱했더니 ${수글}(?:이|가) 되었습니다. 어떤 수는`).exec(p);
      if (m) { expect(같(값(q.answer) * 값(m[1]), 값(m[2])), p).toBe(true); 센다('곱어떤수'); }
      m = new RegExp(`^어떤 수를 ${수글}(?:으로|로) 나누어야 할 것을 잘못하여 곱했더니 ${수글}(?:이|가) 되었습니다`).exec(p);
      if (m) { const b = 값(m[1]); expect(같(값(q.answer), 값(m[2]) / b / b), p).toBe(true); 센다('나눔잘못'); }
      m = /^계산하지 않고 몫이 1보다 (큰|작은) 것을 찾으면/.exec(p);
      if (m) {
        const 맞나 = (t: string) => (m![1] === '큰' ? 식값(t) > 1 : 식값(t) < 1);
        expect(맞나(q.answer), p).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(맞나(c), c).toBe(false);
        센다('몫1');
      }
      m = /^수 카드 ([\d, ]+) 가운데 2장을 골라 진분수를 만들려고 합니다. 만들 수 있는 가장 큰 진분수를 가장 작은 진분수로 나눈 몫/.exec(p);
      if (m) {
        const 카드 = m[1].split(', ').map(Number);
        const 진 = 카드.flatMap((n) => 카드.filter((d) => n < d).map((d) => n / d));
        expect(같(값(q.answer), Math.max(...진) / Math.min(...진)), p).toBe(true);
        센다('카드나눔');
      }
      m = /^(\d+)÷(\d+)=(\d+)입니다. 이것을 이용하여 ([\d.]+)÷(\d+)의 몫/.exec(p);
      if (m) { expect(Number(m[1]) / Number(m[2]), p).toBe(Number(m[3])); expect(같(Number(q.answer), Number(m[4]) / Number(m[5])), p).toBe(true); 센다('소수점'); }
      if (p === '몫이 다른 하나를 찾으면 어느 것일까요?') {
        const v = 식값(q.answer);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(같(식값(c), v), c).toBe(false);
        const 나머지값 = q.choices.filter((c) => c !== q.answer).map(식값);
        expect(나머지값.every((x) => 같(x, 나머지값[0])), p).toBe(true);
        센다('몫다름');
      }
      m = /가 모둠은 공을 (\d+)번 던져서 (\d+)번 넣었고, 나 모둠은 (\d+)번 던져서 (\d+)번/.exec(p);
      if (m) { expect(q.answer, p).toBe(Number(m[2]) / Number(m[1]) > Number(m[4]) / Number(m[3]) ? '가 모둠' : '나 모둠'); 센다('비율'); }
      m = /가운데 (\d+)%가 안경을 썼습니다. 안경을 쓴 학생이 (\d+)명이라면/.exec(p);
      if (m) { expect(같(값(q.answer) * Number(m[1]) / 100, Number(m[2])), p).toBe(true); 센다('기준량'); }
      m = /^(\d+)원인 옷을 (\d+)% 할인하여/.exec(p);
      if (m) { expect(값(q.answer), p).toBe(Number(m[1]) * (100 - Number(m[2])) / 100); 센다('할인'); }
      m = /톱니가 (\d+)개인 톱니바퀴 가와 톱니가 (\d+)개인 톱니바퀴 나가 맞물려 돌고 있습니다. 가가 (\d+)바퀴/.exec(p);
      if (m) { expect(값(q.answer), p).toBe(Number(m[1]) * Number(m[3]) / Number(m[2])); 센다('톱니'); }
      m = /1 : (\d+)(?:으로|로) 줄여 나타낸 지도가 있습니다. 지도에서 (\d+) cm인 거리는 실제로 몇 (km|m)/.exec(p);
      if (m) { const cm = Number(m[1]) * Number(m[2]); expect(값(q.answer), p).toBe(m[3] === 'km' ? cm / 100000 : cm / 100); 센다('축척'); }
      m = /가와 나의 비가 (\d+) : (\d+)이고, 나는 가보다 (\d+) 더 큽니다/.exec(p);
      if (m) { const k = Number(m[3]) / (Number(m[2]) - Number(m[1])); expect(값(q.answer), p).toBe(Number(m[2]) * k); 센다('비차'); }
      m = /구슬을 가와 나에게 (\d+) : (\d+)(?:으로|로) 나누어 주었더니 가가 (\d+)개를/.exec(p);
      if (m) { expect(값(q.answer), p).toBe(Number(m[3]) / Number(m[1]) * (Number(m[1]) + Number(m[2]))); 센다('배분거꾸로'); }
      m = /^원주가 ([\d.]+) cm인 원의 지름은/.exec(p);
      if (m) { expect(같(값(q.answer) * 3.14, Number(m[1])), p).toBe(true); 센다('원주거꾸로'); }
      m = /^지름이 (\d+) cm인 바퀴를 (\d+)바퀴 굴렸습니다/.exec(p);
      if (m) { expect(같(값(q.answer), Number(m[1]) * 3.14 * Number(m[2])), p).toBe(true); 센다('바퀴'); }
      m = /^넓이가 (\d+) cm²인 원의 반지름은 몇 cm일까요\? \(원주율: 3\)/.exec(p);
      if (m) { expect(값(q.answer) ** 2 * 3, p).toBe(Number(m[1])); 센다('넓이거꾸로'); }
      m = /^원의 반지름을 (\d)배로 늘리면 (원주|넓이)/.exec(p);
      if (m) { expect(값(q.answer), p).toBe(Number(m[1]) ** (m[2] === '원주' ? 1 : 2)); 센다('배'); }
      m = /^어떤 자연수를 (\d+)(?:으로|로) 나눈 몫을 분수로 나타내면 (\d+)\/(\d+)입니다. 어떤 수를 (\d+)(?:으로|로) 나눈 몫/.exec(p);
      if (m) {
        const 어떤 = Number(m[2]) / Number(m[3]) * Number(m[1]);
        expect(같다(분수값(q.answer), 어떤 / Number(m[4])), p).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(같다(분수값(c), 어떤 / Number(m[4])), c).toBe(false);
        센다('몫분수거꾸로');
      }
      m = /^계산하지 않고 어림해 보세요. ([\d.]+)÷([\d.]+)의 몫은 어느 범위/.exec(p);
      if (m) {
        const v = Number(m[1]) / Number(m[2]);
        const r = /^([\d.]+)(?:과|와) ([\d.]+) 사이$/.exec(q.answer)!;
        expect(Number(r[1]) < v && v < Number(r[2]), p).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) { const t = /^([\d.]+)(?:과|와) ([\d.]+) 사이$/.exec(c)!; expect(Number(t[1]) < v && v < Number(t[2]), c).toBe(false); }
        센다('몫사이');
      }
    }
    for (const k of ['몫분수거꾸로', '몫사이', '곱어떤수', '나눔잘못', '몫1', '카드나눔', '소수점', '몫다름', '비율', '기준량', '할인', '톱니', '축척', '비차', '배분거꾸로', '원주거꾸로', '바퀴', '넓이거꾸로', '배']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});

describe('생각하는 문항(1학년)', () => {
  it('답이 맞습니다', () => {
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^(□|\d+)([+-])(□|\d+)=(\d+)에서 □ 안에 알맞은 수는/.exec(p);
      if (m) {
        const x = Number(q.answer);
        const a = m[1] === '□' ? x : Number(m[1]);
        const b = m[3] === '□' ? x : Number(m[3]);
        expect(m[2] === '+' ? a + b : a - b, p).toBe(Number(m[4]));
        센다('빈칸');
      }
      m = /^두 수를 모아서\(더해서\) (\d+)(?:이|가) 되는 것은/.exec(p);
      if (m) {
        const 합 = (t: string) => t.split(/과 |와 /).map(Number).reduce((s, x) => s + x, 0);
        expect(합(q.answer), p).toBe(Number(m[1]));
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(합(c) === Number(m![1]), c).toBe(false);
        센다('합짝');
      }
      m = /^(\d+)(?:과|와) (\d+) 사이에 있는 수는 모두 몇 개/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[2]) - Number(m[1]) - 1); 센다('사이'); }
      m = /^(\d+)보다 (\d+)만큼 더 큰 수보다 (\d+)만큼 더 작은 수/.exec(p);
      if (m) { expect(Number(q.answer), p).toBe(Number(m[1]) + Number(m[2]) - Number(m[3])); 센다('두단계'); }
      m = /^(\d+)\+(\d+)=(\d+)(?:을|를) 보고 만들 수 있는 뺄셈식/.exec(p);
      if (m) {
        const [a, b, c] = [1, 2, 3].map((k) => Number(m![k]));
        expect(a + b, p).toBe(c);
        expect([`${c}-${a}=${b}`, `${c}-${b}=${a}`].includes(q.answer), p).toBe(true);
        센다('식관계');
      }
      m = /^수 카드 ([\d, ]+) 가운데 2장을 골라 몇십몇을 만들려고 합니다. (?:(\d+)까지의 수 가운데 )?만들 수 있는 가장 (큰|작은) 수/.exec(p);
      if (m) {
        const 카드 = m[1].split(', ').map(Number); const 최대 = m[2] ? Number(m[2]) : 99;
        const 수들 = 카드.flatMap((t) => 카드.filter((o) => o !== t).map((o) => t * 10 + o)).filter((x) => x <= 최대);
        expect(Number(q.answer), p).toBe(m[3] === '큰' ? Math.max(...수들) : Math.min(...수들));
        센다('카드');
      }
      m = /^사탕이 (\d+)개 있었습니다. 그중에서 (\d+)개를 먹고, 언니에게 (\d+)개를 더 받았습니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[1]) - Number(m[2]) + Number(m[3])); 센다('이야기'); }
      m = /^(\d+)(?:과|와) (\d+) 사이에 있는 수 가운데 (짝수|홀수)는 모두 몇 개/.exec(p);
      if (m) {
        const n = Array.from({ length: Number(m[2]) - Number(m[1]) - 1 }, (_, k) => Number(m![1]) + 1 + k).filter((x) => (x % 2 === 0) === (m![3] === '짝수')).length;
        expect(수(q.answer), p).toBe(n);
        센다('짝홀');
      }
      m = /^지금 시각은 (\d+)시( 30분)?입니다. 긴바늘이 (\d)바퀴 돌면/.exec(p);
      if (m) { const h = ((Number(m[1]) + Number(m[3]) - 1) % 12) + 1; expect(q.answer, p).toBe(`${h}시${m[2] ?? ''}`); 센다('시각'); }
      m = /^수를 거꾸로 세었습니다. \(([\d?, ]+)\) \?에 알맞은 수/.exec(p);
      if (m) {
        const xs = m[1].split(', ');
        const k = xs.indexOf('?');
        expect(Number(q.answer), p).toBe(Number(xs[k - 1]) - 1);
        expect(Number(xs[k + 1]), p).toBe(Number(q.answer) - 1);
        센다('거꾸로');
      }
      m = /^10과 어떤 수를 모으면 (\d+)입니다/.exec(p);
      if (m) { expect(Number(q.answer), p).toBe(Number(m[1]) - 10); 센다('십과몇'); }
      m = /^\S+ (\d+)개를 한 봉지에 10개씩 (담으려고|담았습니다)/.exec(p);
      if (m) {
        const n = Number(m[1]);
        expect(q.answer, p).toBe(m[2] === '담으려고' ? `${n / 10}개` : `${Math.floor(n / 10)}봉지, ${n % 10}개`);
        센다('봉지');
      }
      m = /^10개씩 묶음 (\d+)개와 낱개 (\d+)개가 있습니다. 모두 몇 개/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[1]) * 10 + Number(m[2])); 센다('낱개넘침'); }
      m = /^\S+ 가, 나, 다의 .+?(?:을|를) 견주었습니다. (.)(?:은|는) (.)보다 (.+?)\. (.)(?:은|는) (.)보다 (.+?)\. 가장 (.+?) 것은/.exec(p);
      if (m) {
        const 큰말 = ['깁니다', '무겁습니다', '넓습니다', '많이 담깁니다'];
        const 위: Record<string, number> = { 가: 0, 나: 0, 다: 0 };
        // 'X는 Y보다 큰말'이면 X가 Y 위, 작은말이면 Y가 X 위
        for (const [x, y, w] of [[m[1], m[2], m[3]], [m[4], m[5], m[6]]]) {
          if (큰말.includes(w)) 위[x] += 1; else 위[y] += 1;
        }
        // 위에 두 번 올라선 것은 없고, 한 번도 안 내려간 것이 가장 큰 것
        const 아래: Record<string, number> = { 가: 0, 나: 0, 다: 0 };
        for (const [x, y, w] of [[m[1], m[2], m[3]], [m[4], m[5], m[6]]]) {
          if (큰말.includes(w)) 아래[y] += 1; else 아래[x] += 1;
        }
        const 큰쪽 = /^(긴|무거운|넓은|많이 담기는)$/.test(m[7]);
        const 이름들 = ['가', '나', '다'];
        const 답 = 큰쪽 ? 이름들.find((n) => 아래[n] === 0 && 위[n] > 0) : 이름들.find((n) => 위[n] === 0 && 아래[n] > 0);
        expect(q.answer, p).toBe(답);
        센다('세가지');
      }
      m = /^(\d)□(?:은|는) (\d+)보다 (큽니다|작습니다)/.exec(p);
      if (m) {
        const n = Array.from({ length: 10 }, (_, d) => Number(m![1]) * 10 + d).filter((x) => (m![3] === '큽니다' ? x > Number(m![2]) : x < Number(m![2]))).length;
        expect(수(q.answer), p).toBe(n);
        센다('숫자넣기');
      }
      m = /^지우가 오후에 한 일입니다. (.+)\. 가장 (먼저|나중에) 한 일은/.exec(p);
      if (m) {
        const 일 = m[1].split(', ').map((t) => { const r = /^(.+): (\d+)시( 30분)?$/.exec(t)!; return { w: r[1], x: Number(r[2]) * 60 + (r[3] ? 30 : 0) }; });
        const 정렬 = [...일].sort((a, b) => a.x - b.x);
        expect(q.answer, p).toBe(m[2] === '먼저' ? 정렬[0].w : 정렬[정렬.length - 1].w);
        센다('시각순서');
      }
      m = /^두 수를 더해서 (\d+)(?:이|가) 되는 것은/.exec(p);
      if (m) {
        const 합 = (t: string) => t.split(/과 |와 /).map(Number).reduce((s, x) => s + x, 0);
        expect(합(q.answer), p).toBe(Number(m[1]));
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(합(c) === Number(m![1]), c).toBe(false);
        센다('합짝고정');
      }
    }
    for (const k of ['빈칸', '합짝', '사이', '두단계', '식관계', '카드', '이야기', '짝홀', '시각', '거꾸로', '십과몇', '봉지', '낱개넘침', '세가지', '숫자넣기', '시각순서', '합짝고정']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});

describe('생각하는 문항(3학년 덧셈·뺄셈·시간·들이·무게)', () => {
  it('답이 맞습니다', () => {
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^어떤 수에 (\d+)(?:을|를) 더했더니 (\d+)(?:이|가) 되었습니다. 어떤 수는/.exec(p);
      if (m) { expect(Number(q.answer) + Number(m[1]), p).toBe(Number(m[2])); 센다('덧어떤수'); }
      m = /^어떤 수에서 (\d+)(?:을|를) 뺐더니 (\d+)(?:이|가) 되었습니다. 어떤 수는/.exec(p);
      if (m) { expect(Number(q.answer) - Number(m[1]), p).toBe(Number(m[2])); 센다('뺄어떤수'); }
      m = /^어떤 수에 (\d+)(?:을|를) 더해야 할 것을 잘못하여 뺐더니 (\d+)(?:이|가) /.exec(p);
      if (m && /^\d+$/.test(q.answer)) { expect(Number(q.answer), p).toBe(Number(m[2]) + 2 * Number(m[1])); 센다('덧잘못'); }
      m = /^어떤 수에서 (\d+)(?:을|를) 빼야 할 것을 잘못하여 더했더니 (\d+)(?:이|가) /.exec(p);
      if (m) { expect(Number(q.answer), p).toBe(Number(m[2]) - 2 * Number(m[1])); 센다('뺄잘못'); }
      m = /^수 카드 ([\d, ]+)(?:을|를) 한 번씩만 사용하여 세 자리 수를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 (합|차)/.exec(p);
      if (m) {
        const 수들 = 순열(m[1].split(', ').map(Number), 3).map((x) => Number(x.join('')));
        expect(Number(q.answer), p).toBe(m[2] === '합' ? Math.max(...수들) + Math.min(...수들) : Math.max(...수들) - Math.min(...수들));
        센다('세자리카드');
      }
      m = /^어떤 일을 (\d+)시간 (\d+)분 동안 하였더니 (\d+)시 (\d+)분에 끝났습니다/.exec(p);
      if (m) {
        const 시작 = Number(m[3]) * 60 + Number(m[4]) - (Number(m[1]) * 60 + Number(m[2]));
        expect(q.answer, p).toBe(`${Math.floor(시작 / 60)}시 ${시작 % 60}분`);
        센다('시작시각');
      }
      m = /가 컵으로는 (\d+)번, 나 컵으로는 (\d+)번 물을 부어야/.exec(p);
      if (m) { expect(q.answer, p).toBe(Number(m[1]) < Number(m[2]) ? '가 컵' : '나 컵'); 센다('컵'); }
      m = /한쪽에 사과 (\d+)개, 다른 쪽에 귤 (\d+)개를 올렸더니 수평이 되었습니다. 귤 한 개의 무게가 (\d+) g/.exec(p);
      if (m) { expect(수(q.answer) * Number(m[1]), p).toBe(Number(m[2]) * Number(m[3])); 센다('저울'); }
      m = /^(?:길이|걸린 시간|들이|무게)(?:을|를) 나타낸 것입니다. (.+)\. (가장 \S+|들이가 가장 \S+) (?:것은 어느 것|사람은 누구)일까요/.exec(p);
      if (m) {
        // '2 L 50 mL', '2500 mL', '1시간 15분', '75분' 같은 양을 작은 단위로 바꿉니다.
        const 배: Record<string, number> = { cm: 10, m: 100, 시간: 60, 분: 60, L: 1000, kg: 1000 };
        const 작은단위 = new Set(['mm', 'cm', '분', '초', 'mL', 'g']);
        const 바꿈 = (t: string) => {
          const 조각 = [...t.matchAll(/(\d+) ?(mm|mL|cm|m|시간|분|초|L|kg|g)/g)];
          if (조각.length === 2) return Number(조각[0][1]) * 배[조각[0][2]] + Number(조각[1][1]);
          const [, n, u] = 조각[0];
          // 한 단위만 쓴 것: 견주는 네 양에서 작은 단위인지 큰 단위인지 가립니다.
          const 작다 = u === 'cm' ? !/\d mm/.test(p) : u === '분' ? /시간/.test(p) : 작은단위.has(u);
          return 작다 ? Number(n) : Number(n) * 배[u];
        };
        const 줄 = m[1].split(', ').map((t) => { const r = /^(\S+) (.+)$/.exec(t)!; return { 이름: r[1], 값: 바꿈(r[2]) }; });
        const 큰쪽 = /(긴|오래|많은|무거운)$/.test(m[2]) || m[2].includes('많은');
        const 값들 = 줄.map((x) => x.값);
        expect(new Set(값들).size, p).toBe(값들.length);
        const 답 = 줄.find((x) => x.값 === (큰쪽 ? Math.max(...값들) : Math.min(...값들)))!.이름;
        expect(q.answer, p).toBe(답);
        센다('단위견주기');
      }
      m = /^줄넘기를 (\d+)시 (\d+)분 (\d+)초에 시작하여 (\d+)시 (\d+)분 (\d+)초에 마쳤습니다/.exec(p);
      if (m) {
        const [a, b, c, d, e, f] = [1, 2, 3, 4, 5, 6].map((k) => Number(m![k]));
        const 초 = d * 3600 + e * 60 + f - (a * 3600 + b * 60 + c);
        expect(q.answer, p).toBe(`${Math.floor(초 / 60)}분 ${초 % 60}초`);
        센다('걸린시간');
      }
      m = /물 (\d+) L (\d+) mL을\(?를?\)? ?더 부었더니 (\d+) L (\d+) mL/.exec(p) ?? /물 (\d+) L (\d+) mL(?:을|를) 더 부었더니 (\d+) L (\d+) mL/.exec(p);
      if (m) { const 처음 = Number(m[3]) * 1000 + Number(m[4]) - (Number(m[1]) * 1000 + Number(m[2])); expect(q.answer, p).toBe(`${Math.floor(처음 / 1000)} L ${처음 % 1000} mL`); 센다('처음양'); }
      m = /무게가 (\d+) kg (\d+) g(?:이|가) 되었습니다. 담은 귤의 무게가 (\d+) kg (\d+) g/.exec(p);
      if (m) { const 처음 = Number(m[1]) * 1000 + Number(m[2]) - (Number(m[3]) * 1000 + Number(m[4])); expect(q.answer, p).toBe(`${Math.floor(처음 / 1000)} kg ${처음 % 1000} g`); 센다('처음양'); }
      if (/긴바늘과 짧은바늘이 직각을 이루는 시각/.test(p)) { expect(['3시', '9시'].includes(q.answer), p).toBe(true); for (const c of q.choices.filter((c) => c !== q.answer)) expect(['3시', '9시'].includes(c), c).toBe(false); 센다('직각시각'); }
      m = /^직사각형의 네 변의 길이의 합이 (\d+) cm입니다. 가로가 (\d+) cm라면/.exec(p);
      if (m) { expect(수(q.answer) * 2 + Number(m[2]) * 2, p).toBe(Number(m[1])); 센다('직사각형'); }
    }
    for (const k of ['덧어떤수', '뺄어떤수', '세자리카드', '시작시각', '컵', '저울', '단위견주기', '걸린시간', '처음양', '직각시각', '직사각형']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
    expect((셈.get('덧잘못') ?? 0) + (셈.get('뺄잘못') ?? 0)).toBeGreaterThan(0);
  });
});

describe('생각하는 문항(세 수·규칙·등호·원기둥 전개도)', () => {
  it('답이 맞습니다', () => {
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^(\d+)\+□\+(\d+)=(\d+)에서/.exec(p);
      if (m) { expect(Number(m[1]) + Number(q.answer) + Number(m[2]), p).toBe(Number(m[3])); 센다('세수덧'); }
      m = /^(\d+)-□-(\d+)=(\d+)에서/.exec(p);
      if (m) { expect(Number(m[1]) - Number(q.answer) - Number(m[2]), p).toBe(Number(m[3])); 센다('세수뺄'); }
      m = /^([\d, ]+)의 규칙을 바르게 말한 것은/.exec(p);
      if (m) {
        const xs = m[1].split(', ').map(Number); const d = xs[1] - xs[0];
        expect(xs.every((x, i) => i === 0 || x - xs[i - 1] === d), p).toBe(true);
        expect(q.answer, p).toBe(`${Math.abs(d)}씩 ${d > 0 ? '커집니다' : '작아집니다'}`);
        센다('규칙말');
      }
      m = /^계산하지 않고 □ 안에 알맞은 수를 구하면 얼마일까요\? (\d+)([+×-])(\d+)=(\d+)([+×-])□$/.exec(p);
      if (m) {
        const f = (a: number, op: string, b: number) => (op === '+' ? a + b : op === '-' ? a - b : a * b);
        expect(f(Number(m[4]), m[5], Number(q.answer)), p).toBe(f(Number(m[1]), m[2], Number(m[3])));
        센다('등호');
      }
      m = /^원기둥의 전개도에서 옆면의 가로가 ([\d.]+) cm입니다. 이 원기둥의 밑면의 반지름/.exec(p);
      if (m) { expect(Math.abs(수(q.answer) * 2 * 3.14 - Number(m[1])) < 1e-9, p).toBe(true); 센다('전개도반지름'); }
      m = /^밑면의 반지름이 (\d+) cm, 높이가 (\d+) cm인 원기둥의 전개도에서 옆면의 넓이/.exec(p);
      if (m) { expect(Math.abs(수(q.answer) - Number(m[1]) * 2 * 3.14 * Number(m[2])) < 1e-6, p).toBe(true); 센다('옆면넓이'); }
    }
    for (const k of ['세수덧', '세수뺄', '규칙말', '등호', '전개도반지름', '옆면넓이']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});

describe('생각하는 문항(자연수)', () => {
  it('거꾸로·잘못 계산·수 카드·어림·나머지·□ 범위·문장제 답이 맞습니다', () => {
    const 셈 = new Map<string, number>();
    const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^어떤 수에 (\d+)(?:을|를) 곱했더니 (\d+)(?:이|가) 되었습니다/.exec(p);
      if (m && /^\d+$/.test(q.answer)) { expect(Number(q.answer) * Number(m[1]), p).toBe(Number(m[2])); 센다('어떤수×'); }
      m = /^어떤 수를 (\d+)(?:으로|로) 나누었더니 몫이 (\d+), 나머지가 (\d+)(?:이|가) 되었습니다/.exec(p);
      if (m) { expect(Number(m[3]) < Number(m[1]), p).toBe(true); expect(Number(q.answer), p).toBe(Number(m[1]) * Number(m[2]) + Number(m[3])); 센다('어떤수÷'); }
      m = /^어떤 수에 (\d+)(?:을|를) 곱해야 할 것을 잘못하여 더했더니 (\d+)(?:이|가) /.exec(p);
      if (m) { expect(Number(q.answer), p).toBe((Number(m[2]) - Number(m[1])) * Number(m[1])); 센다('잘못×'); }
      m = /^어떤 수를 (\d+)(?:으로|로) 나누어야 할 것을 잘못하여 곱했더니 (\d+)(?:이|가) /.exec(p);
      if (m && /^\d+$/.test(q.answer)) { const b = Number(m[1]); expect(Number(q.answer), p).toBe(Number(m[2]) / b / b); 센다('잘못÷'); }
      m = /^수 카드 ([\d, ]+)(?:을|를) 한 번씩만 사용하여 \((세|두|한) 자리 수\)×\((두|한) 자리 수\)를 만들려고 합니다. 곱이 가장 (클|작을)/.exec(p);
      if (m) {
        const 카드 = m[1].split(', ').map(Number);
        const k = { 세: 3, 두: 2, 한: 1 }[m[2] as '세']!;
        const 값 = 순열(카드, 카드.length).map((x) => Number(x.slice(0, k).join('')) * Number(x.slice(k).join('')));
        expect(Number(q.answer), p).toBe(m[4] === '클' ? Math.max(...값) : Math.min(...값));
        센다('수카드');
      }
      if (/^계산하지 않고 어림하여 계산 결과가 가장 (큰|작은)/.test(p)) {
        const 큰 = p.includes('가장 큰');
        const 값 = (t: string) => { const [a, op, b] = /^(\d+)([×÷+-])(\d+)$/.exec(t)!.slice(1); const x = Number(a); const y = Number(b); return op === '×' ? x * y : op === '÷' ? x / y : op === '+' ? x + y : x - y; };
        const 모든값 = q.choices.map(값);
        expect(값(q.answer), p).toBe(큰 ? Math.max(...모든값) : Math.min(...모든값));
        expect(모든값.filter((v) => v === 값(q.answer)).length, p).toBe(1);
        센다('어림견주기');
      }
      m = /^학생 (\d+)명이 한 대에 (\d+)명씩 탈 수 있는 차에 모두 타려고/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Math.ceil(Number(m[1]) / Number(m[2]))); 센다('올림'); }
      m = /^사탕 (\d+)개를 (\d+)명에게 남김없이 똑같이 나누어 주려면 사탕이 적어도 몇 개 더/.exec(p);
      if (m) { const a = Number(m[1]); const d = Number(m[2]); expect(수(q.answer), p).toBe((d - (a % d)) % d); 센다('더필요'); }
      m = /^어떤 수를 (\d+)(?:으로|로) 나누었을 때 나머지가 될 수 있는 수 가운데 가장 큰 수/.exec(p);
      if (m) { expect(Number(q.answer), p).toBe(Number(m[1]) - 1); 센다('큰나머지'); }
      m = /^□×(\d+)([<>])(\d+)에서 □ 안에 들어갈 수 있는 자연수 가운데 가장 (큰|작은) 수/.exec(p);
      if (m) {
        const b = Number(m[1]); const N = Number(m[3]);
        const 맞는 = Array.from({ length: 2000 }, (_, i) => i + 1).filter((x) => (m![2] === '<' ? x * b < N : x * b > N));
        expect(Number(q.answer), p).toBe(m[4] === '큰' ? Math.max(...맞는) : Math.min(...맞는));
        센다('네모');
      }
      m = /^한 상자에 귤이 (\d+)개씩 들어 있습니다. (\d+)상자 가운데 귤 (\d+)개를 팔았다면/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[1]) * Number(m[2]) - Number(m[3])); 센다('문장제1'); }
      m = /^한 개에 (\d+)원인 공책을 (\d+)권 사고 (\d+)원을 냈습니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Number(m[3]) - Number(m[1]) * Number(m[2])); 센다('문장제2'); }
      m = /^가 가게에서는 구슬을 (\d+)개씩 (\d+)봉지, 나 가게에서는 (\d+)개씩 (\d+)봉지/.exec(p);
      if (m) {
        const 가 = Number(m[1]) * Number(m[2]); const 나 = Number(m[3]) * Number(m[4]);
        expect(q.answer, p).toBe(`${가 > 나 ? '가 가게' : '나 가게'}, ${Math.abs(가 - 나)}개`);
        센다('문장제3');
      }
    }
    // 각 갈래가 실제로 나오는지도 봅니다(글이 바뀌어 검사를 빠져나가지 않게).
    for (const k of ['어떤수×', '어떤수÷', '잘못×', '잘못÷', '수카드', '어림견주기', '올림', '더필요', '큰나머지', '네모', '문장제1', '문장제2', '문장제3']) {
      expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
    }
  });
});
