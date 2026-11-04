import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';

// 3-2 단원별 문제집 유형(s32book.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s32book.ts를 쓰지 않습니다).
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준; 끝: number }[] = lessons32
  .flatMap((l) => 수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d, 끝: l.scope.maxNumber }))));

const N = Number;
const 곱 = (s: string) => s.split('×').map(N).reduce((a, b) => a * b, 1);
type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };

const 풀이들: 풀이[] = [
  // ── 1단원 곱셈 ──
  { 이름: '백의자리값', 수준: '하', 꼴: /^곱셈식 (\d+)×(\d)=(\d+)에서 곱의 백의 자리 숫자/, 답: (m) => String((Math.floor(N(m[3]) / 100) % 10) * 100) },
  { 이름: '두변합', 수준: '중', 꼴: /긴 변의 길이는 짧은 변의 길이의 2배입니다\. 짧은 변의 길이가 (\d+) cm/, 답: (m) => `${N(m[1]) * 3} cm` },
  { 이름: '거스름돈', 수준: '중', 꼴: /(\d+)원짜리 \S+ (\d)개를 사고 (\d+)원을 냈습니다/, 답: (m) => `${N(m[3]) - N(m[1]) * N(m[2])}원` },
  { 이름: '개수곱', 수준: '중', 꼴: /^㉮는 10이 (\d+)개, 1이 (\d+)개인 수입니다\. ㉮와 (\d)의 곱/, 답: (m) => String((N(m[1]) * 10 + N(m[2])) * N(m[3])) },
  {
    이름: '카드곱', 수준: '중', 꼴: /^수 카드 ([\d, ]+) 중 3장을 사용하여 가장 큰 세 자리 수를/, 답: (m) => { const c = m[1].split(', ').map(N).sort((a, b) => b - a); return String((c[0] * 100 + c[1] * 10 + c[2]) * c[3]); },
  },
  {
    이름: '읽은쪽차', 수준: '중', 꼴: /^(\S+)[은는] (\d+)쪽짜리 위인전을 (\d)권 읽었고, (\S+)[은는] (\d+)쪽짜리 위인전을 (\d)권/, 답: (m) => { const a = N(m[2]) * N(m[3]); const b = N(m[5]) * N(m[6]); return `${a > b ? m[1] : m[4]}, ${Math.abs(a - b)}쪽`; },
  },
  { 이름: '뺐더니곱', 수준: '상', 꼴: /^어떤 수에서 (\d)[을를] 뺐더니 (\d+)[이가] 되었습니다/, 답: (m) => String((N(m[2]) + N(m[1])) * N(m[1])) },
  { 이름: '별규칙', 수준: '상', 꼴: /같은 규칙으로 (\d)★(\d+)[을를] 계산하면/, 답: (m) => String((N(m[1]) + N(m[2])) * N(m[1])) },
  {
    이름: '세자리빈칸', 수준: '상', 꼴: /^곱셈식 (\d)□(\d)×(\d)=(\d+)에서/, 답: (m) => { const 맞 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (N(m[1]) * 100 + x * 10 + N(m[2])) * N(m[3]) === N(m[4])); expect(맞).toHaveLength(1); return String(맞[0]); },
  },
  {
    이름: '바꾸어곱', 수준: '상', 꼴: /백의 자리 숫자와 일의 자리 숫자를 바꾸어 (\d)[을를] 곱했더니 (\d+)[이가]/, 답: (m) => { const b = String(N(m[2]) / N(m[1])); return `${b[2]}${b[1]}${b[0]}`; },
  },
  {
    이름: '큰차례', 수준: '중', 꼴: /^계산 결과가 큰 것부터 차례대로 기호를 쓴 것은 어느 것일까요\? (.+)$/, 답: (m) => [...m[1].matchAll(/([㉠-㉢]) (\d+×\d+)/g)].map((x) => ({ k: x[1], v: 곱(x[2]) })).sort((a, b) => b.v - a.v).map((x) => x.k).join(', '),
  },
  { 이름: '네모큰수', 수준: '상', 꼴: /가장 큰 수는 무엇일까요\? (\d+)×□ < (\d+)×(\d+)$/, 답: (m) => String(Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => N(m[1]) * k < N(m[2]) * N(m[3])))) },
  {
    이름: '한두빈칸', 수준: '상', 꼴: /^곱셈식 (\d)×1㉠=1㉡0에서/, 답: (m) => { const b = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (N(m[1]) * (10 + x)) % 10 === 0 && N(m[1]) * (10 + x) >= 100 && N(m[1]) * (10 + x) < 200); expect(b).toHaveLength(1); return String(b[0] + (Math.floor((N(m[1]) * (10 + b[0])) / 10) % 10)); },
  },
  { 이름: '나무도로', 수준: '상', 꼴: /일정한 간격으로 나무 (\d+)그루가 심어져 있습니다\. 나무와 나무 사이의 간격이 (\d+) m/, 답: (m) => `${(N(m[1]) - 1) * N(m[2])} m` },
  {
    이름: '철근자르기', 수준: '상', 꼴: /철근을 (\d+)도막으로 자르려고 합니다\. 철근을 한 번 자르는 데 (\d+)분이 걸리고, 한 번 자른 후 (\d)분씩/, 답: (m) => { const 분 = (N(m[1]) - 1) * N(m[2]) + (N(m[1]) - 2) * N(m[3]); return `${Math.floor(분 / 60)}시간 ${분 % 60}분`; },
  },
  { 이름: '하트규칙', 수준: '상', 꼴: /같은 규칙으로 (\d+)♥(\d+)[을를] 계산하면/, 답: (m) => String(N(m[1]) * N(m[2]) - 1) },
  { 이름: '다리길이', 수준: '상', 꼴: /길이가 (\d+) m인 기차가 1분 동안 (\d+) m씩 .+ (\d)분 30초가 걸렸다면/, 답: (m) => `${N(m[2]) * N(m[3]) + N(m[2]) / 2 - N(m[1])} m` },
  { 이름: '눈깜빡', 수준: '상', 꼴: /1분에 약 (\d)회 줄어든다고 합니다\. 하루에 (\d)시간씩/, 답: (m) => `${N(m[2]) * 60 * N(m[1])}회` },
];

describe('3-2 문제집 유형(하·중·상)', () => {
  const 셈 = new Map<string, number>();
  const 맞는 = (q: Question) => 풀이들.find((p) => p.꼴.test(q.prompt));

  it('글만 보고 다시 푼 답이 문항의 답과 같고, 보기에 답이 하나뿐입니다', () => {
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

  it('유형마다 정한 수준에만 나오고, 차시의 수 범위를 넘지 않습니다', () => {
    for (const { q, 수준, 끝 } of 문항들) {
      const 풀 = 맞는(q);
      if (!풀) continue;
      expect(수준, `${풀.이름}: ${q.prompt}`).toBe(풀.수준);
      const 큰수 = Math.max(0, ...([q.prompt, ...q.choices].join(' ').match(/\d+/g) ?? []).map(Number));
      expect(큰수, q.prompt).toBeLessThanOrEqual(끝);
    }
  });
});
