import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons12 } from '../curriculum12';
import { generateQuestions } from '../questionFactory';

// 1-2 단원별 문제집 유형(s12book.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s12book.ts를 쓰지 않습니다).
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준; 끝: number; 단원: number }[] = lessons12.flatMap((l) =>
  수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d, 끝: l.unitNo === 3 ? 30 : l.scope.maxNumber, 단원: l.unitNo }))),
);

const 열단위 = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const 일이삼 = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };

const 풀이들: 풀이[] = [
  // ── 1단원 100까지의 수 ──
  {
    이름: '몇십바로읽기', 수준: '하', 꼴: /^수를 바르게 읽은 것은 어느 것일까요\?$/, 답: (_, q) => {
      const 바른 = q.choices.filter((c) => { const [n, 말] = c.split(' - '); const t = Number(n) / 10; return 말 === 열단위[t] || 말 === `${일이삼[t]}십`; });
      expect(바른).toHaveLength(1);
      return 바른[0];
    },
  },
  { 이름: '상자로담기', 수준: '중', 꼴: /10개씩 (\d)상자와 낱개로 (\d+)개였습니다\. 이것을 10개씩 상자에 모두 담으면/, 답: (m) => `${Number(m[1]) + Number(m[2]) / 10}상자` },
  { 이름: '봉지더사기', 수준: '상', 꼴: /초콜릿이 (\d+)개 있습니다\. .+ 10개씩 든 초콜릿을 몇 봉지 더 사 와서 (\d+)개가 되게/, 답: (m) => `${(Number(m[2]) - Number(m[1])) / 10}봉지` },
  { 이름: '몇만큼큰수', 수준: '중', 꼴: /^수를 순서대로 이어 셀 때 (\d+)보다 (\d)만큼 더 (큰|작은) 수는 무엇일까요/, 답: (m) => String(Number(m[1]) + (m[3] === '큰' ? 1 : -1) * Number(m[2])) },
  {
    이름: '화살표규칙', 수준: '상', 꼴: /^→는 10만큼 더 큰 수, ↓는 1만큼 더 큰 수로 가는 규칙입니다\. (\d+)에서 ([→↓ ]+) 차례로 가면/, 답: (m) => String(m[2].split(' ').reduce((s, a) => s + (a === '→' ? 10 : 1), Number(m[1]))),
  },
  {
    이름: '사이낱개큰', 수준: '상', 꼴: /^(\d+)[과와] (\d+) 사이에 있는 수 중에서 낱개의 수가 가장 큰 수/, 답: (m) => {
      const 수 = Array.from({ length: Number(m[2]) - Number(m[1]) - 1 }, (_, k) => Number(m[1]) + 1 + k);
      return String(수.reduce((b, v) => (v % 10 > b % 10 ? v : b)));
    },
  },
  { 이름: '사이개수', 수준: '중', 꼴: /^(\d+)보다 크고 (\d+)보다 작은 수는 모두 몇 개일까요/, 답: (m) => `${Number(m[2]) - Number(m[1]) - 1}개` },
  {
    이름: '지워진숫자', 수준: '상', 꼴: /공통으로 들어갈 수 있는 숫자는 무엇일까요\? (.+)$/, 답: (m) => {
      const 맞나 = (식: string, d: number) => { const [l, r] = 식.split(' < ').map((x) => Number(x.replace('□', String(d)))); return l < r; };
      const 맞는 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => m[1].split(', ').every((식) => 맞나(식, d)));
      expect(맞는).toHaveLength(1);
      return String(맞는[0]);
    },
  },
  {
    이름: '홀짝고르기', 수준: '하', 꼴: /^(홀수|짝수)인 것은 어느 것일까요\? \(보기 가운데 하나만/, 답: (m, q) => {
      const 맞는 = q.choices.filter((c) => Number(c) % 2 === (m[1] === '홀수' ? 1 : 0));
      expect(맞는).toHaveLength(1);
      return 맞는[0];
    },
  },
  {
    이름: '사이짝홀큰', 수준: '상', 꼴: /학생 수가 (\d+)명과 (\d+)명 사이에 있는 수 중 가장 (큰|작은) (짝수|홀수)만큼/, 답: (m) => {
      const 후 = Array.from({ length: Number(m[2]) - Number(m[1]) - 1 }, (_, k) => Number(m[1]) + 1 + k).filter((v) => v % 2 === (m[4] === '짝수' ? 0 : 1));
      return `${m[3] === '큰' ? 후[후.length - 1] : 후[0]}개`;
    },
  },
  {
    이름: '두조건짝', 수준: '상', 꼴: /조건 1: (\d+)보다 크고 (\d+)보다 작은 (짝수|홀수)입니다\. 조건 2: 10개씩 묶음의 수가 낱개의 수보다 작습니다/, 답: (m) => {
      const 맞는 = Array.from({ length: Number(m[2]) - Number(m[1]) - 1 }, (_, k) => Number(m[1]) + 1 + k).filter((v) => v % 2 === (m[3] === '짝수' ? 0 : 1) && Math.floor(v / 10) < v % 10);
      return `${맞는.length}개`;
    },
  },
];

describe('1-2 단원별 문제집 유형(하·중·상)', () => {
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
      expect(q.support.studentHint.length, q.prompt).toBeGreaterThan(10);
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
