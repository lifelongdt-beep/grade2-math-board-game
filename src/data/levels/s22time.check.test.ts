import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons } from '../curriculum';
import { generateQuestions } from '../questionFactory';

// 2-2 시각과 시간 문제집 유형(s22time.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s22time.ts를 쓰지 않습니다).
const 차시들 = lessons.filter((l) => l.semester === '2-2' && l.unitNo === 4);
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준 }[] = 차시들.flatMap((l) => 수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d }))));

const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
const 날수 = (월: number) => new Date(2023, 월, 0).getDate(); // 2023년은 2월이 28일입니다.
const 시각 = (t: number) => `${Math.floor(t / 60)}시${t % 60 ? ` ${t % 60}분` : ''}`;
const 몇시간몇분 = (분: number) => `${Math.floor(분 / 60)}시간${분 % 60 ? ` ${분 % 60}분` : ''}`;
/** '4시간 33분', '273분'처럼 쓴 시간을 분으로 셉니다. */
const 분으로 = (t: string) => { const m = /^(?:(\d+)시간)?\s*(?:(\d+)분)?$/.exec(t.trim())!; return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0); };
const 주일 = (t: string) => { const m = /^(?:(\d+)주)?\s*(?:(\d+)일)?$/.exec(t.trim())!; return Number(m[1] ?? 0) * 7 + Number(m[2] ?? 0); };

type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };

const 풀이들: 풀이[] = [
  // ── 하 ──
  { 이름: '긴바늘분', 수준: '하', 꼴: /^시계의 긴바늘이 (\d+)[을를] 가리키면 몇 분을 나타낼까요/, 답: (m) => `${5 * Number(m[1])}분` },
  { 이름: '몇분전', 수준: '하', 꼴: /^(\d+)시 (\d+)분[은는] (\d+)시 □분 전입니다/, 답: (m) => { expect(Number(m[3])).toBe(Number(m[1]) + 1); return String(60 - Number(m[2])); } },
  { 이름: '시간을분', 수준: '하', 꼴: /^(\d+시간 \d+분)[은는] 몇 분일까요/, 답: (m) => `${분으로(m[1])}분` },
  { 이름: '분을시간', 수준: '하', 꼴: /^(\d+)분을 몇 시간 몇 분으로 나타내면 어느 것일까요/, 답: (m) => 몇시간몇분(Number(m[1])) },
  { 이름: '일을시간', 수준: '하', 꼴: /^(\d+)일(?: (\d+)시간)?[은는] 몇 시간일까요/, 답: (m) => `${Number(m[1]) * 24 + Number(m[2] ?? 0)}시간` },
  { 이름: '주일', 수준: '하', 꼴: /^(\d+)주 (\d+)일[은는] 며칠일까요/, 답: (m) => `${Number(m[1]) * 7 + Number(m[2])}일` },
  { 이름: '년개월', 수준: '하', 꼴: /^(\d+)년(?: (\d+)개월)?[은는] 몇 개월일까요/, 답: (m) => `${Number(m[1]) * 12 + Number(m[2] ?? 0)}개월` },
  { 이름: '월날수', 수준: '하', 꼴: /^(\d+)월은 며칠까지 있을까요\? \(단, 2월은 28일/, 답: (m) => `${날수(Number(m[1]))}일` },
  // ── 중 ──
  { 이름: '설명시각', 수준: '중', 꼴: /^시계의 짧은바늘이 (\d+)[과와] (\d+) 사이에 있고, 긴바늘이 (\d+)[을를] 가리킵니다\. 시계가 나타내는 시각은/, 답: (m) => 시각(Number(m[1]) * 60 + 5 * Number(m[3])) },
  { 이름: '전긴바늘', 수준: '중', 꼴: /(\d+)시 (\d+)분 전에 집을 나섰습니다\. 이때 시계의 긴바늘은 어느 숫자/, 답: (m) => String((60 - Number(m[2])) / 5) },
  { 이름: '더짧은시간', 수준: '중', 꼴: /^(\d+)분과 (\d+시간 \d+분) 중에서 더 (짧은|긴) 시간은 몇 분/, 답: (m) => { const a = Number(m[1]); const b = 분으로(m[2]); return `${m[3] === '짧은' ? Math.min(a, b) : Math.max(a, b)}분`; } },
  { 이름: '끝난시각', 수준: '중', 꼴: /(\d+시(?: \d+분)?)부터 (\d+)시간 동안 .+[을를] 끝낸 시각은/, 답: (m) => { const [, h, mm] = /(\d+)시(?: (\d+)분)?/.exec(m[1])!; return 시각((Number(h) + Number(m[2])) * 60 + Number(mm ?? 0)); } },
  { 이름: '오전오후시간', 수준: '중', 꼴: /오전 (\d+)시에 집에서 출발하여 오후 (\d+)시에 할머니 댁에 도착/, 답: (m) => `${12 - Number(m[1]) + Number(m[2])}시간` },
  { 이름: '주며칠', 수준: '중', 꼴: /^(\d+)일은 □주 △일입니다\. □와 △에 알맞은 수의 합/, 답: (m) => String(Math.floor(Number(m[1]) / 7) + (Number(m[1]) % 7)) },
  {
    이름: '날수다른달', 수준: '중', 꼴: /^((?:\d+월, ){3}\d+월) 중에서 날수가 다른 달/, 답: (m) => {
      const 월들 = m[1].split(', ').map((t) => Number(t.replace('월', '')));
      const 다른 = 월들.filter((x) => 월들.filter((y) => 날수(y) === 날수(x)).length === 1);
      expect(다른).toHaveLength(1);
      return `${다른[0]}월`;
    },
  },
  { 이름: '며칠요일', 수준: '중', 꼴: /^어느 해 (\d+)월 1일은 (\S)요일입니다\. 같은 해 \d+월 (\d+)일은 무슨 요일/, 답: (m) => `${요일[(요일.indexOf(m[2]) + Number(m[3]) - 1) % 7]}요일` },
  // ── 상 ──
  {
    이름: '몇분뒤', 수준: '상', 꼴: /^시계의 짧은바늘이 (\d+)[과와] \d+ 사이에 있고, 긴바늘이 (\d+)[을를] 가리킵니다\. 이 시각에서 (\d+)분 뒤의 시각을/, 답: (m) => {
      const t = Number(m[1]) * 60 + 5 * Number(m[2]) + Number(m[3]);
      return String(Math.floor(t / 60) + (t % 60));
    },
  },
  { 이름: '두읽기차', 수준: '상', 꼴: /긴바늘이 (\d+)[을를] 가리킵니다\. 이 시각은 \d+시 □분 또는 \d+시 △분 전이라고/, 답: (m) => { const 분 = 5 * Number(m[1]); return String(Math.abs(분 - (60 - 분))); } },
  {
    // 짧은바늘을 잘못 본 사람에게서는 분을, 긴바늘을 잘못 본 사람에게서는 시를 가져옵니다.
    이름: '잘못본바늘', 수준: '상', 꼴: /짧은바늘만 잘못 보고 \d+시 (\d+)분 전이라 하고, \S+ 긴바늘만 잘못 보고 (\d+)시 \d+분이라고/, 답: (m) => {
      const 분 = 60 - Number(m[1]); const 시 = Number(m[2]);
      return String(시 + 1 + (60 - 분));
    },
  },
  {
    이름: '가장긴시간', 수준: '상', 꼴: /^(\d+분), (\d+시간 \d+분), (\d+시간 \d+분) 중에서 가장 (긴|짧은) 시간은 몇 분/, 답: (m) => {
      const 값 = [m[1], m[2], m[3]].map(분으로);
      return `${m[4] === '긴' ? Math.max(...값) : Math.min(...값)}분`;
    },
  },
  {
    이름: '누가오래', 수준: '상', 꼴: /^(\S+?)[은는] (\d+)시(?: (\d+)분)?부터 (\d+)시(?: (\d+)분)?까지, (\S+?)[은는] (\d+)시(?: (\d+)분)?부터 (\d+)시(?: (\d+)분)?까지 공부했습니다/, 답: (m) => {
      const t = (h: string, mm?: string) => Number(h) * 60 + Number(mm ?? 0);
      const d1 = t(m[4], m[5]) - t(m[2], m[3]); const d2 = t(m[9], m[10]) - t(m[7], m[8]);
      const 누구 = d1 > d2 ? m[1] : m[6];
      return `${누구}${/[가-힣]/.test(누구) && (누구.charCodeAt(누구.length - 1) - 0xac00) % 28 ? '이' : '가'} ${Math.abs(d1 - d2)}분 더 오래 했습니다`;
    },
  },
  {
    이름: '첫교시', 수준: '상', 꼴: /수업은 (\d+)분씩이고, 수업이 끝나면 (\d+)분씩 쉽니다\. (\d+)교시 수업이 끝나는 시각이 (\d+)시(?: (\d+)분)?일 때/, 답: (m) => {
      const n = Number(m[3]); const 끝 = Number(m[4]) * 60 + Number(m[5] ?? 0);
      return 시각(끝 - n * Number(m[1]) - (n - 1) * Number(m[2]));
    },
  },
  { 이름: '짧은바늘바퀴', 수준: '상', 꼴: /^지금은 (오전|오후) (\d+시(?: \d+분)?)입니다\. 시계의 짧은바늘이 한 바퀴 돌면/, 답: (m) => `${m[1] === '오전' ? '오후' : '오전'} ${m[2]}` },
  {
    이름: '시차', 수준: '상', 꼴: /^서울이 오후 (\d+)시일 때 파리는 같은 날 오전 (\d+)시입니다\. 서울이 오후 (\d+)시일 때 파리는 오전 □시/, 답: (m) => {
      const 차 = 12 + Number(m[1]) - Number(m[2]);
      return String(12 + Number(m[3]) - 차);
    },
  },
  {
    이름: '빠른시계', 수준: '상', 꼴: /^1시간에 (\d+)분씩 빨라지는 시계가 있습니다\. 이 시계를 오늘 오전 (\d+)시에 정확하게 맞추었습니다\. 오늘 오후 (\d+)시에/, 답: (m) => {
      const 시간 = 12 - Number(m[2]) + Number(m[3]);
      return String(Number(m[3]) + Number(m[1]) * 시간);
    },
  },
  { 이름: '점검시간', 수준: '상', 꼴: /어제 오후 11시 (\d+)분부터 오늘 오전 (\d+)시 (\d+)분까지 점검/, 답: (m) => `${60 - Number(m[1]) + Number(m[2]) * 60 + Number(m[3])}분` },
  {
    이름: '여행시간', 수준: '상', 꼴: /(\d+)월 (\d+)일 오전 (\d+)시부터 (\d+)월 (\d+)일 오후 (\d+)시까지 여행/, 답: (m) => {
      expect(Number(m[5])).toBe(Number(m[2]) + 1);
      return `${24 + 12 - Number(m[3]) + Number(m[6])}시간`;
    },
  },
  { 이름: '가장긴기간', 수준: '상', 꼴: /^(\d+주 \d+일), (\d+일), (\d+주 \d+일) 중에서 가장 긴 기간은 며칠/, 답: (m) => `${Math.max(주일(m[1]), 주일(m[2]), 주일(m[3]))}일` },
  {
    이름: '요일몇번', 수준: '상', 꼴: /^어느 해 (\d+)월 1일은 (\S)요일입니다\. 이 달에 (\S)요일은 몇 번/, 답: (m) => {
      let n = 0;
      for (let d = 1; d <= 날수(Number(m[1])); d += 1) if ((요일.indexOf(m[2]) + d - 1) % 7 === 요일.indexOf(m[3])) n += 1;
      return `${n}번`;
    },
  },
  { 이름: '생일', 수준: '상', 꼴: /생일은 (\d+)월 마지막 날입니다\. \S+ \S+보다 (\d+)일 먼저 태어났습니다/, 답: (m) => `${날수(Number(m[1])) - Number(m[2])}일` },
];

describe('2-2 시각과 시간 문제집 유형(하·중·상)', () => {
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

  it('유형마다 정한 수준에만 나오고, 하루(1440분)를 넘는 수가 없습니다', () => {
    for (const { q, 수준 } of 문항들) {
      const 풀 = 맞는(q);
      if (!풀) continue;
      expect(수준, `${풀.이름}: ${q.prompt}`).toBe(풀.수준);
      const 큰수 = Math.max(0, ...([q.prompt, ...q.choices].join(' ').match(/\d+/g) ?? []).map(Number));
      expect(큰수, q.prompt).toBeLessThanOrEqual(1440);
    }
  });
});
