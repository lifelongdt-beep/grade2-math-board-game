import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons41 } from '../curriculum41';
import { generateQuestions } from '../questionFactory';

// 4-1 단원별 문제집 유형(s41book.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s41book.ts를 쓰지 않습니다).
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준 }[] = lessons41
  .flatMap((l) => 수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d }))));

const N = Number;
/** '2조 7000억', '8234만 1009'를 수로 읽습니다. */
const 단위수 = (t: string) => t.trim().split(' ').reduce((s, part) => {
  const m = /^(\d+)(조|억|만)?$/.exec(part)!;
  return s + N(m[1]) * (m[2] === '조' ? 1e12 : m[2] === '억' ? 1e8 : m[2] === '만' ? 1e4 : 1);
}, 0);
/** '육천칠백이십만 오천삼백구'를 수로 읽습니다. */
const 한글수 = (t: string) => {
  const 소리: Record<string, number> = { 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9 };
  const 자리: Record<string, number> = { 십: 10, 백: 100, 천: 1000 };
  const 큰: Record<string, number> = { 만: 1e4, 억: 1e8, 조: 1e12 };
  let 합 = 0; let 묶음 = 0; let d = 0;
  for (const c of t.replace(/ /g, '')) {
    if (c in 소리) d = 소리[c];
    else if (c in 자리) { 묶음 += (d || 1) * 자리[c]; d = 0; }
    else if (c in 큰) { 합 += (묶음 + d) * 큰[c]; 묶음 = 0; d = 0; }
    else throw new Error(t);
  }
  return 합 + 묶음 + d;
};
const 영 = (n: number) => [...String(n)].filter((c) => c === '0').length;
const 순열 = <T,>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => 순열([...xs.slice(0, i), ...xs.slice(i + 1)]).map((r) => [x, ...r])));
const 하나 = <T,>(xs: T[]) => { expect(xs).toHaveLength(1); return xs[0]; };

type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };
const 풀이들: 풀이[] = [
  // ── 1단원 큰 수 ──
  {
    이름: '만잘못', 수준: '하', 꼴: /^10000에 대하여 잘못 설명한 것은/, 답: (_m, q) => 하나(q.choices.filter((c) => {
      const 곱 = /^(\d+)이 (\d+)개인 수입니다\.$/.exec(c); if (곱) return N(곱[1]) * N(곱[2]) !== 10000;
      const 큰 = /^(\d+)보다 (\d+) 큰 수입니다\.$/.exec(c); if (큰) return N(큰[1]) + N(큰[2]) !== 10000;
      return false;
    })),
  },
  { 이름: '몇만몇개', 수준: '중', 꼴: /^(\d+)[은는] (\d+)이 몇 개인 수일까요/, 답: (m) => `${N(m[1]) / N(m[2])}개` },
  { 이름: '자리모아', 수준: '하', 꼴: /^(.+)인 다섯 자리 수는 무엇일까요/, 답: (m) => String(m[1].split(', ').reduce((s, p) => { const x = /^(\d+)[이가] (\d+)개$/.exec(p)!; return s + N(x[1]) * N(x[2]); }, 0)) },
  {
    이름: '두힌트수', 수준: '상', 꼴: /^다섯 자리 수 □(\d)(\d)□(\d) 중에서 .+ 합이 (\d+)이야\. .+ 십의 자리 숫자보다 (\d) 더 커/, 답: (m) => {
      const 후보 = []; for (let a = 1; a <= 9; a += 1) for (let t = 0; t <= 9; t += 1) if (a - t === N(m[5]) && a + t + N(m[1]) + N(m[2]) + N(m[3]) === N(m[4])) 후보.push(`${a}${m[1]}${m[2]}${t}${m[3]}`);
      return 하나(후보);
    },
  },
  {
    이름: '조건다섯자리', 수준: '상', 꼴: /^조건을 모두 만족하는 수는 무엇일까요\? ([\d, ]+)[을를] 모두 .+ (\d+)보다 크고 (\d+)보다 작은 수입니다\. 일의 자리 숫자는 홀수/, 답: (m) => String(하나(순열(m[1].split(', ').map(N)).map((p) => N(p.join(''))).filter((n) => n > N(m[2]) && n < N(m[3]) && n % 2 === 1))),
  },
  { 이름: '만이몇개', 수준: '하', 꼴: /^10000이 (\d+)개이면 얼마일까요/, 답: (m) => String(N(m[1]) * 10000) },
  { 이름: '만과일', 수준: '중', 꼴: /^10000이 (\d+)개, 1이 (\d+)개인 수를 쓰면/, 답: (m) => String(N(m[1]) * 10000 + N(m[2])) },
  { 이름: '한글을수로', 수준: '중', 꼴: /^다음을 수로 나타내면 얼마일까요\? (\S.+)$/, 답: (m) => String(한글수(m[1])) },
  { 이름: '영개수', 수준: '중', 꼴: /^(.+)[을를] 수로 나타낼 때 쓰는 0은 모두 몇 개/, 답: (m) => `${영(한글수(m[1]))}개` },
  {
    이름: '영더많은', 수준: '중', 꼴: /0이 더 많은 것을 수로 쓰면 무엇일까요\? ㉠ (.+) ㉡ 만이 (\d+)개, 1이 (\d+)개인 수$/, 답: (m) => { const a = 한글수(m[1]); const b = N(m[2]) * 10000 + N(m[3]); return String(영(a) > 영(b) ? a : b); },
  },
  {
    이름: '자리값합', 수준: '중', 꼴: /^(\d+)의 (\S+)의 자리 숫자가 나타내는 값과 (\d+)의 (\S+)의 자리 숫자가/, 답: (m) => {
      const 자리 = ['일', '십', '백', '천', '만', '십만', '백만']; const 값 = (n: string, z: string) => N(n[n.length - 1 - 자리.indexOf(z)]) * 10 ** 자리.indexOf(z);
      return String(값(m[1], m[2]) + 값(m[3], m[4]));
    },
  },
  { 이름: '수표', 수준: '상', 꼴: /100만 원짜리 수표 (\d)장, 10만 원짜리 수표 (\d)장(?:, 1만 원짜리 지폐 (\d)장)?을 냈습니다/, 답: (m) => String(N(m[1]) * 100 + N(m[2]) * 10 + N(m[3] ?? 0)) },
  { 이름: '억이몇개', 수준: '하', 꼴: /^1억이 (\d+)개인 수를 바르게 쓴 것은/, 답: (m) => String(N(m[1]) * 1e8) },
  { 이름: '억만자리수', 수준: '중', 꼴: /^억이 (\d+)개, 만이 (\d+)개인 수는 몇 자리 수/, 답: (m) => `${String(N(m[1]) * 1e8 + N(m[2]) * 1e4).length}자리 수` },
  {
    이름: '억더하기', 수준: '하', 꼴: /^(\d+)억보다 (\d+)억 큰 수는 얼마일까요/, 답: (m, q) => 하나(q.choices.filter((c) => 단위수(c) === (N(m[1]) + N(m[2])) * 1e8)),
  },
  { 이름: '조몇개', 수준: '하', 꼴: /^(\d)조는 (\d+)억이 몇 개인 수일까요/, 답: (m) => `${(N(m[1]) * 1e12) / (N(m[2]) * 1e8)}개` },
  { 이름: '조의자리', 수준: '상', 꼴: /^10조가 (\d+)개, 1조가 (\d+)개, 1000억이 (\d+)개, 100억이 (\d+)개인 수의 조의 자리 숫자/, 답: (m) => String(Math.floor((N(m[1]) * 10e12 + N(m[2]) * 1e12 + N(m[3]) * 1e11 + N(m[4]) * 1e10) / 1e12) % 10) },
  {
    이름: '조고치기', 수준: '상', 꼴: /^(.+조)[을를] 조건에 맞게 고치면 .+천조의 자리 숫자를 (\d) 더 크게, 십조의 자리 숫자를 (\d)배로, 일조의 자리 숫자를 (\d) 더 작게/, 답: (m) => {
      const d = String(한글수(m[1]) / 1e12).split('').map(N); return `${d[0] + N(m[2])}${d[1]}${d[2] * N(m[3])}${d[3] - N(m[4])}`;
    },
  },
  {
    이름: '십배사슬', 수준: '중', 꼴: /^㉠을 10배 하면 (.+?)입니다\. .+ 그것을 다시 10배 하면 ㉡입니다/, 답: (m, q) => {
      const x = 단위수(m[1]); return 하나(q.choices.filter((c) => { const [a, b] = c.split(', ').map(단위수); return a * 10 === x && b === x * 100; }));
    },
  },
  {
    이름: '수출액', 수준: '상', 꼴: /수출액은 (\d+)년에 (.+?) 달러였고, .+ (\d+)년에 (.+?) 달러가 되었습니다\. .+ 처음으로 (.+?) 달러를 넘는 해/, 답: (m) => {
      const 늘 = (단위수(m[4]) - 단위수(m[2])) / (N(m[3]) - N(m[1])); let 해 = N(m[3]); let v = 단위수(m[4]); while (v <= 단위수(m[5])) { v += 늘; 해 += 1; } return `${해}년`;
    },
  },
  { 이름: '매월모으기', 수준: '중', 꼴: /^다음 달부터 매달 (\d+)만 원씩 모으려고 합니다\. (\d+)만 원을/, 답: (m) => `${Math.ceil(N(m[2]) / N(m[1]))}개월` },
  {
    이름: '네모숫자개수', 수준: '중', 꼴: /□ 안에 들어갈 수 있는 수는 모두 몇 개일까요\? (\d+)□(\d+) < (\d+)$/, 답: (m) => `${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => N(`${m[1]}${x}${m[2]}`) < N(m[3])).length}개`,
  },
  {
    이름: '카드가까운', 수준: '상', 꼴: /^수 카드 ([\d, ]+)[을를] 한 번씩 모두 사용하여 (\d+)만보다 작은 여섯 자리 수/, 답: (m) => String(Math.max(...순열(m[1].split(', ').map(N)).filter((p) => p[0] !== 0).map((p) => N(p.join(''))).filter((n) => n < N(m[2]) * 1e4))),
  },
  {
    이름: '큰차례기호', 수준: '중', 꼴: /^큰 수부터 차례대로 기호를 쓴 것은 어느 것일까요\? ㉠ (\d+) ㉡ (.+?) ㉢ (.+)$/, 답: (m) => [{ k: '㉠', v: N(m[1]) }, { k: '㉡', v: 단위수(m[2]) }, { k: '㉢', v: 한글수(m[3]) }].sort((a, b) => b.v - a.v).map((x) => x.k).join(', '),
  },
  {
    이름: '잘못비교', 수준: '하', 꼴: /^두 수의 크기를 잘못 비교한 것은 어느 것일까요\?$/, 답: (_m, q) => 하나(q.choices.filter((c) => { const [a, op, b] = c.split(/ ([<>]) /); const x = 단위수(a); const y = 단위수(b); return op === '<' ? !(x < y) : !(x > y); })),
  },
];

describe('4-1 단원별 문제집 유형을 글만 보고 다시 풉니다', () => {
  const 맞는 = (q: Question) => 풀이들.find((p) => p.꼴.test(q.prompt));
  const 셈 = new Map<string, number>();
  it('답이 맞고 보기 가운데 하나뿐입니다', () => {
    for (const { q } of 문항들) {
      const 풀 = 맞는(q);
      if (!풀) continue;
      expect(q.answer, `${풀.이름}: ${q.prompt}`).toBe(풀.답(풀.꼴.exec(q.prompt)!, q));
      expect(q.choices.filter((c) => c === q.answer), q.prompt).toHaveLength(1);
      expect(new Set(q.choices).size, q.prompt).toBe(q.choices.length);
      셈.set(풀.이름, (셈.get(풀.이름) ?? 0) + 1);
    }
  });

  it('모든 유형이 실제로 나오고, 힌트·풀이 걸음·핵심을 갖추며 힌트가 답을 말하지 않습니다', () => {
    expect([...셈.keys()].sort()).toEqual(풀이들.map((p) => p.이름).sort());
    for (const { q } of 문항들) {
      if (!맞는(q)) continue;
      expect(q.support.steps.length, q.prompt).toBeGreaterThanOrEqual(2);
      expect(q.support.coreConcept.length, q.prompt).toBeGreaterThan(5);
      if (q.answer.length >= 3) expect(q.support.studentHint, q.prompt).not.toContain(q.answer);
    }
  });

  it('유형마다 정한 수준에만 나오고, 수가 정확히 다룰 수 있는 크기입니다', () => {
    for (const { q, 수준 } of 문항들) {
      const 풀 = 맞는(q);
      if (!풀) continue;
      expect(수준, `${풀.이름}: ${q.prompt}`).toBe(풀.수준);
      for (const n of [q.prompt, ...q.choices].join(' ').match(/\d+/g) ?? []) expect(Number(n) <= Number.MAX_SAFE_INTEGER, q.prompt).toBe(true);
    }
  });
});
