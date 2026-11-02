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

/** '8-2-3', '2+4+3'처럼 쓴 식을 앞에서부터 셈합니다. */
const 셈 = (식: string) => { const 토막 = 식.match(/[+-]?\d+/g)!.map(Number); return 토막.reduce((a, b) => a + b); };

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
  // ── 2단원 덧셈과 뺄셈(1) ──
  {
    이름: '세수식비교', 수준: '중', 꼴: /^세 식의 계산 결과 중 가장 (큰|작은) 값을 구해 볼까요\? (.+)$/, 답: (m) => {
      const 값 = m[2].split(', ').map(셈);
      return String(m[1] === '큰' ? Math.max(...값) : Math.min(...값));
    },
  },
  { 이름: '모양기호', 수준: '상', 꼴: /^같은 모양은 같은 수를 나타낼 때 ●에 알맞은 수를 구해 볼까요\? (\S+)=◆, ◆(\S+)=●/, 답: (m) => String(셈(`${셈(m[1])}${m[2]}`)) },
  {
    이름: '과일비교', 수준: '상', 꼴: /^배와 참외가 각각 (\d)개씩 있습니다\. 오늘 아침에 배 (\d)개와 참외 (\d)개를 먹고, 낮에 시장에서 배 (\d)개와 참외 (\d)개를 사 왔습니다/, 답: (m) => {
      const [처음, 배먹, 참먹, 배사, 참사] = m.slice(1).map(Number);
      return `${Math.abs(처음 - 배먹 + 배사 - (처음 - 참먹 + 참사))}개`;
    },
  },
  { 이름: '십되는수', 수준: '하', 꼴: /^어떤 수에 (\d)[을를] 더했더니 10이 되었습니다/, 답: (m) => String(10 - Number(m[1])) },
  { 이름: '잘못뺀계산', 수준: '상', 꼴: /^어떤 수에 (\d)[을를] 더해야 할 것을 잘못하여 뺐더니 (\d+)[이가] 되었습니다/, 답: (m) => String(Number(m[2]) + 2 * Number(m[1])) },
  { 이름: '어떤수합', 수준: '상', 꼴: /^(\d)에 어떤 수를 더했더니 (\d)[이가] 되었습니다\. 어떤 수와 \d의 합/, 답: (m) => String(Number(m[2]) - Number(m[1]) + Number(m[2])) },
  { 이름: '십에서뺀수', 수준: '중', 꼴: /^10에서 어떤 수를 뺐더니 (\d)[이가] 되었습니다/, 답: (m) => String(10 - Number(m[1])) },
  { 이름: '남은딱지', 수준: '상', 꼴: /딱지 (\d+)개, \S+ 딱지 10개를 가지고 나왔습니다\. .+ \S+ (\d)개를 잃었고, \S+ (\d)개를 잃었습니다/, 답: (m) => `${Math.max(Number(m[1]) - Number(m[2]), 10 - Number(m[3]))}개` },
  { 이름: '상자세수합', 수준: '중', 꼴: /가 상자: ([\d, ]+), 나 상자: ([\d, ]+)\. 세 수의 합 중 더 큰 값/, 답: (m) => String(Math.max(...[m[1], m[2]].map((t) => t.split(', ').map(Number).reduce((a, b) => a + b)))) },
  {
    이름: '물건합가장', 수준: '상', 꼴: /^세 사람이 가진 가위, 자, 풀의 수입니다\. (.+)\. 가위, 자, 풀의 수의 합이 가장 큰 사람은/, 답: (m) => {
      const 합 = m[1].split(' / ').map((t) => [...t.matchAll(/(\d+)개/g)].map((x) => Number(x[1])).reduce((a, b) => a + b));
      return `${Math.max(...합)}개`;
    },
  },
  // ── 3단원 모양과 시각 ──
  { 이름: '모양수차', 수준: '상', 꼴: /■ 모양 (\d)개, ▲ 모양 (\d)개, ● 모양 (\d)개를 이용하여 기차를 꾸몄습니다/, 답: (m) => { const 수 = [m[1], m[2], m[3]].map(Number); return String(Math.max(...수) - Math.min(...수)); } },
  {
    이름: '많이쓴모양물건', 수준: '상', 꼴: /■ 모양 (\d)개, ▲ 모양 (\d)개, ● 모양 (\d)개를 이용했습니다\. 가장 많이 이용한 모양과 같은 모양의 물건/, 답: (m, q) => {
      const 물건: Record<string, string[]> = { '■': ['공책', '액자', '색종이', '창문', '수첩', '달력'], '▲': ['삼각자', '삼각김밥', '주의 표지판', '삼각 깃발'], '●': ['동전', '접시', '단추', '벽시계', '바퀴', '둥근 거울'] };
      const 수 = [m[1], m[2], m[3]].map(Number); const 많은 = ['■', '▲', '●'][수.indexOf(Math.max(...수))];
      const 맞는 = q.choices.filter((c) => 물건[많은].includes(c));
      expect(맞는).toHaveLength(1);
      return 맞는[0];
    },
  },
  {
    이름: '시각읽기말', 수준: '하', 꼴: /^(\d+)시( 30분)?[을를] 바르게 읽은 것은/, 답: (m) => `${['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'][Number(m[1])]} 시${m[2] ? ' 삼십 분' : ''}`,
  },
  { 이름: '반짧은바늘', 수준: '중', 꼴: /^(\d+)시 30분일 때 시계의 짧은바늘은 어디를 가리킬까요/, 답: (m) => { const h = Number(m[1]); const n = h === 12 ? 1 : h + 1; return `${h}${[0, 1, 3, 6, 7, 8].includes(h % 10) ? '과' : '와'} ${n} 사이`; } },
  { 이름: '조건시각', 수준: '상', 꼴: /긴바늘은 6을 가리키고, (\d+)시 30분보다 늦고 (\d+)시보다 빠른 시각입니다/, 답: (m) => { const 후 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => h * 60 + 30 > Number(m[1]) * 60 + 30 && h * 60 + 30 < Number(m[2]) * 60); expect(후).toHaveLength(1); return `${후[0]}시 30분`; } },
  {
    이름: '먼저온사람', 수준: '상', 꼴: /^저녁에 가족이 집에 들어온 시각입니다\. (\S+): (\d+)시( 30분)?, (\S+): (\d+)시( 30분)?, (\S+): (\d+)시( 30분)?\. 가장 (먼저|늦게) 들어온 사람/, 답: (m) => {
      const 사람들 = [[m[1], m[2], m[3]], [m[4], m[5], m[6]], [m[7], m[8], m[9]]].map(([n, h, 반]) => ({ n, t: Number(h) * 60 + (반 ? 30 : 0) }));
      사람들.sort((a, b) => (m[10] === '먼저' ? a.t - b.t : b.t - a.t));
      return 사람들[0].n;
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
