import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';

// 3-1 3단원 나눗셈·4단원 곱셈 문제집 유형(s31book.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s31book.ts를 쓰지 않습니다).
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준; 끝: number }[] = lessons31
  .filter((l) => l.unitNo === 3 || l.unitNo === 4)
  .flatMap((l) => 수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d, 끝: l.scope.maxNumber }))));

const N = Number;
const 곱 = (s: string) => s.split('×').map(N).reduce((a, b) => a * b, 1);
type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };

const 풀이들: 풀이[] = [
  // ── 3단원 나눗셈 ──
  {
    이름: '못나누는봉지', 수준: '중', 꼴: /^\S+ (\d+)개를 봉지에 똑같이 나누어 담으려고 합니다\. 남김없이/, 답: (m, q) => {
      const 안됨 = q.choices.filter((c) => N(m[1]) % N(c.replace('봉지', '')) !== 0); expect(안됨).toHaveLength(1); return 안됨[0];
    },
  },
  { 이름: '뺄셈을나눗셈', 수준: '하', 꼴: /^빵 (\d+)개를 한 명에게 (\d)개씩 나누어 주려고/, 답: (m) => String(N(m[1]) / N(m[2])) },
  {
    이름: '남김없는수', 수준: '중', 꼴: /^스티커를 한 묶음에 (\d)장씩 담아/, 답: (m, q) => {
      const 됨 = q.choices.filter((c) => N(c.replace('장', '')) % N(m[1]) === 0); expect(됨).toHaveLength(1); return 됨[0];
    },
  },
  { 이름: '카드나눗셈', 수준: '중', 꼴: /^수 카드 (\d), (\d), (\d+)[을를] 모두 사용하여/, 답: (m) => String(N(m[3]) / N(m[1]) + N(m[3]) / N(m[2])) },
  {
    이름: '몫곱셈식', 수준: '하', 꼴: /^(\d+)÷(\d)의 몫을 구할 수 있는 곱셈식은/, 답: (m, q) => {
      const 맞 = q.choices.filter((c) => { const [l, r] = c.split('='); const [x] = l.split('×').map(N); return x === N(m[2]) && N(r) === N(m[1]) && 곱(l) === N(r); });
      expect(맞).toHaveLength(1); return 맞[0];
    },
  },
  { 이름: '변몇배', 수준: '중', 꼴: /긴 변의 길이는 (\d+) cm이고 짧은 변의 길이는 (\d) cm입니다/, 답: (m) => `${N(m[1]) / N(m[2])}배` },
  { 이름: '나누는수구하기', 수준: '중', 꼴: /^(\d+)[을를] 어떤 수로 나누었더니 몫이 (\d)/, 답: (m) => String(N(m[1]) / N(m[2])) },
  {
    이름: '몫큰것', 수준: '중', 꼴: /^몫이 가장 큰 것은 어느 것일까요\? (.+)$/, 답: (m) => {
      const 식 = [...m[1].matchAll(/([㉠-㉣]) (\d+)÷(\d)/g)].map((x) => ({ k: x[1], v: N(x[2]) / N(x[3]) }));
      return 식.reduce((a, b) => (b.v > a.v ? b : a)).k;
    },
  },
  { 이름: '모아나누기', 수준: '중', 꼴: /한 상자에 (\d)개씩 (\d)상자 있습니다\. .+ 한 명에게 (\d)개씩/, 답: (m) => `${(N(m[1]) * N(m[2])) / N(m[3])}명` },
  { 이름: '남은쪽나누기', 수준: '중', 꼴: /위인전은 모두 (\d+)쪽입니다\. (\d+)쪽을 읽고/, 답: (m) => `${(N(m[1]) - N(m[2])) / 7}쪽` },
  { 이름: '두번나누기', 수준: '상', 꼴: /^어떤 수를 (\d)[으로]+ 나눈 몫을 다시 (\d)[으로]+ 나누었더니 몫이 (\d)/, 답: (m) => String(N(m[1]) * N(m[2]) * N(m[3])) },
  { 이름: '바둑돌규칙', 수준: '상', 꼴: /흰 바둑돌 (\d)개, 검은 바둑돌 (\d)개를 차례로 놓는 것을 되풀이하여 바둑돌 (\d+)개/, 답: (m) => `${(N(m[3]) / (N(m[1]) + N(m[2]))) * N(m[1])}개` },
  { 이름: '테이프두번자르기', 수준: '상', 꼴: /길이가 (\d+) cm인 색 테이프를 똑같이 (\d)도막으로 자른 다음, 자른 색 테이프를 다시 (\d) cm씩/, 답: (m) => `${N(m[2]) * (N(m[1]) / N(m[2]) / N(m[3]))}도막` },
  { 이름: '부족한수', 수준: '상', 꼴: /한 명에게 (\d)\S+씩 주면 딱 맞고, (\d)\S+씩 주면 (\d+)\S+ 부족합니다/, 답: (m) => `${N(m[3]) / (N(m[2]) - N(m[1]))}명` },
  {
    이름: '몫될수큰', 수준: '상', 꼴: /^다음 나눗셈은 곱셈구구 안에서 나누어떨어집니다\. (\d)□÷(\d)의 몫이 될 수 있는 가장 큰 수/, 답: (m) => String(Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => Math.floor((N(m[2]) * k) / 10) === N(m[1])))),
  },
  { 이름: '몫될수개수', 수준: '상', 꼴: /^(\d)□÷(\d)[이가] 곱셈구구 안에서 나누어떨어질 때, 몫이 될 수 있는 수는 모두 몇 개/, 답: (m) => `${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => Math.floor((N(m[2]) * k) / 10) === N(m[1])).length}개` },
  {
    이름: '몫작게숫자', 수준: '상', 꼴: /^(\d)□는 두 자리 수이고 (\d)[으로]+ 나누어떨어집니다/, 답: (m) => {
      const k = Math.min(...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => Math.floor((N(m[2]) * x) / 10) === N(m[1]))); return String((N(m[2]) * k) % 10);
    },
  },
  // ── 4단원 곱셈 ──
  { 이름: '십의자리값', 수준: '하', 꼴: /^곱셈식 (\d+)×(\d)=(\d+)에서 곱의 십의 자리 숫자/, 답: (m) => String((Math.floor(N(m[3]) / 10) % 10) * 10) },
  { 이름: '두번곱하기', 수준: '하', 꼴: /^(\d+)에 (\d)[을를] 곱하고, 그 곱에 다시 \d[을를] 곱하면/, 답: (m) => String(N(m[1]) * N(m[2]) * N(m[2])) },
  { 이름: '몇주동안', 수준: '상', 꼴: /영양제를 1알씩 먹습니다\. 이 영양제를 (\d)주 동안/, 답: (m) => `${N(m[1]) * 7 * 3}알` },
  { 이름: '누름못', 수준: '상', 꼴: /그림 (\d+)장을 고정하려면 누름 못은/, 답: (m) => `${4 + (N(m[1]) - 1) * 2}개` },
  { 이름: '세균', 수준: '상', 꼴: /이 세균 (\d)마리를 (\d)번 배양하면/, 답: (m) => `${N(m[1]) * 2 ** N(m[2])}마리` },
  {
    이름: '결과다른하나', 수준: '하', 꼴: /^계산 결과가 다른 하나는 어느 것일까요\?$/, 답: (_, q) => {
      const 값 = q.choices.map(곱); const 다른 = q.choices.filter((_, i) => 값.filter((v) => v === 값[i]).length === 1);
      expect(다른).toHaveLength(1); return 다른[0];
    },
  },
  { 이름: '문장곱', 수준: '중', 꼴: /^(?:어항 한 개에 물고기가|한 상자에 공책이|한 봉지에 사탕이|한 꽃병에 꽃이) (\d+)(\S+)씩 들어 있습니다\. \S+ (\d)개에/, 답: (m) => `${N(m[1]) * N(m[3])}${m[2]}` },
  { 이름: '몇배구슬', 수준: '중', 꼴: /^팔찌를 만드는 데 구슬이 (\d+)개 필요합니다\. .+ (\d)배입니다/, 답: (m) => `${N(m[1]) * N(m[2])}개` },
  { 이름: '나누어곱', 수준: '하', 꼴: /^(\d+)×(\d)[을를] \d+×\d[과와] \d×\d[으로]+ 나누어 계산하려고/, 답: (m) => String(N(m[1]) * N(m[2])) },
  {
    이름: '빈칸숫자', 수준: '중', 꼴: /^곱셈식 □(\d)×(\d)=(\d+)에서 □ 안에/, 답: (m) => {
      const 맞 = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((t) => (t * 10 + N(m[1])) * N(m[2]) === N(m[3])); expect(맞).toHaveLength(1); return String(맞[0]);
    },
  },
  { 이름: '세로과정', 수준: '중', 꼴: /^(\d+)×(\d)[을를] 계산하는 과정입니다\. □에 알맞은 수는/, 답: (m) => String(N(m[1]) * N(m[2])) },
  {
    이름: '작은순서', 수준: '중', 꼴: /^계산 결과가 작은 것부터 차례대로 기호를 쓴 것은 어느 것일까요\? (.+)$/, 답: (m) => [...m[1].matchAll(/([㉠-㉢]) (\d+×\d)/g)].map((x) => ({ k: x[1], v: 곱(x[2]) })).sort((a, b) => a.v - b.v).map((x) => x.k).join(', '),
  },
  { 이름: '구슬두사람', 수준: '중', 꼴: /구슬이 (\d+)개씩 들어 있는 주머니를 (\d)개, \S+ 구슬이 (\d+)개씩 들어 있는 주머니를 (\d)개/, 답: (m) => `${N(m[1]) * N(m[2]) + N(m[3]) * N(m[4])}개` },
  { 이름: '잘못뺀', 수준: '상', 꼴: /^어떤 수에 (\d)[을를] 곱해야 할 것을 잘못하여 어떤 수에서 \d[을를] 뺐더니 (\d+)[이가]/, 답: (m) => String((N(m[2]) + N(m[1])) * N(m[1])) },
  { 이름: '네모비교곱', 수준: '상', 꼴: /가장 큰 수는 무엇일까요\? (\d+)×□ < (\d+)×(\d)$/, 답: (m) => String(Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => N(m[1]) * k < N(m[2]) * N(m[3])))) },
  { 이름: '나무간격', 수준: '상', 꼴: /나무 (\d+)그루를 (\d) m 간격으로 심었습니다/, 답: (m) => `${(N(m[1]) - 1) * N(m[2])}m` },
  { 이름: '테이프겹침', 수준: '상', 꼴: /길이가 (\d+) cm인 색 테이프 (\d)장을 (\d) cm씩 겹쳐서/, 답: (m) => `${N(m[1]) * N(m[2]) - N(m[3]) * (N(m[2]) - 1)}cm` },
  {
    이름: '같은숫자곱', 수준: '상', 꼴: /^□ 안에는 모두 같은 수가 들어갑니다\. □□×□=(\d+)일 때/, 답: (m) => {
      const 맞 = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d * 11 * d === N(m[1])); expect(맞).toHaveLength(1); return String(맞[0]);
    },
  },
  { 이름: '세수가운데', 수준: '상', 꼴: /^일정하게 커지는 수 3개를 늘어놓았습니다\. 세 수의 합이 (\d+)이고 가장 큰 수와 가장 작은 수의 차가 (\d+)일 때/, 답: (m) => String(N(m[1]) / 3 + N(m[2]) / 2) },
];

describe('3-1 나눗셈·곱셈 문제집 유형(하·중·상)', () => {
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
