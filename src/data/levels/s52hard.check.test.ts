import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons5 } from '../curriculum5';
import { generateQuestions } from '../questionFactory';

// 5-2 소수의 곱셈 실력·심화 상 문항(s52hard.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s52hard.ts를 쓰지 않습니다).
// 소수는 정수로 바꾸어(만분의 일 단위) 셈해 부동소수점 오차를 피합니다.
const 차시들 = lessons5.filter((l) => l.semester === '5-2' && l.unitNo === 4);
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준 }[] = 차시들.flatMap((l) => 수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d }))));

const E = 1_000_000;
const 정 = (t: string) => Math.round(Number(t) * E);
const 곱 = (a: number, b: number) => Math.round((a * b) / E);
const 글 = (v: number) => String(Number((v / E).toFixed(6)));
const 수 = (t: string) => t.replace(/[^\d.]/g, '');

type 풀이 = { 이름: string; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string; 수준?: 수준 };

const 풀이들: 풀이[] = [
  {
    이름: '재료어림', 꼴: /밀가루 (\d+) kg으로 빵을 .+ 밀가루 ([\d.]+) kg이 필요합니다\. .+ 빵 (\d+)개를 만들 수 있는지/, 답: (m) => {
      const 어림 = Math.round(Number(m[2]) * 10) * (E / 10);
      const 양 = 어림 * Number(m[3]);
      return `${글(양)}, ${양 <= Number(m[1]) * E ? '만들 수 있습니다' : '만들 수 없습니다'}`;
    },
  },
  { 이름: '매일시간', 꼴: /매일 (\d+)시간 (\d+)분씩 운동을 했습니다\. (월요일부터 금요일까지|월요일부터 토요일까지|일주일 동안)/, 답: (m) => `${글(Math.round((Number(m[1]) * 60 + Number(m[2])) * { 월요일부터금요일까지: 5, 월요일부터토요일까지: 6, 일주일동안: 7 }[m[3].replace(/ /g, '') as '일주일동안'] * E / 60))}시간` },
  { 이름: '기어가기', 꼴: /(\d+)분에 ([\d.]+) cm씩 기어갑니다\. .+ (\d+)시간 동안/, 답: (m) => `${글(정(m[2]) * ((Number(m[3]) * 60) / Number(m[1])))} cm` },
  { 이름: '평행사변형', 꼴: /밑변의 길이가 ([\d.]+) m, 높이가 (\d+) m인 평행사변형/, 답: (m) => `${글(정(m[1]) * Number(m[2]))} m²` },
  {
    이름: '사이자연수', 꼴: /자연수는 모두 몇 개일까요\? (\d+)×([\d.]+) < □ < (\d+)×([\d.]+)/, 답: (m) => {
      const L = 정(m[2]) * Number(m[1]); const R = 정(m[4]) * Number(m[3]);
      let n = 0; for (let k = 1; k * E < R; k += 1) if (k * E > L) n += 1;
      return `${n}개`;
    },
  },
  { 이름: '뺀넓이', 꼴: /가로 (\d+) cm, 세로 ([\d.]+) cm인 직사각형 모양 종이에서 가로 (\d+) cm, 세로 ([\d.]+) cm인/, 답: (m) => `${글(정(m[2]) * Number(m[1]) - 정(m[4]) * Number(m[3]))} cm²` },
  {
    이름: '카드곱', 꼴: /수 카드 ([\d, ]+)[을를] □ 안에 .+ 곱이 가장 (클|작을) 때/, 답: (m) => {
      const c = m[1].split(', ').map(Number); const 값: number[] = [];
      for (const a of c) for (const b of c) for (const d of c) for (const e of c) if (new Set([a, b, d, e]).size === 4) 값.push(a * (b * 100 + d * 10 + e));
      return 글((m[2] === '클' ? Math.max(...값) : Math.min(...값)) * (E / 100));
    },
  },
  { 이름: '늘이고줄이기', 꼴: /한 변이 (\d+) cm인 정사각형의 가로를 ([\d.]+)배로 줄이고, 세로를 ([\d.]+)배로/, 답: (m) => `${글(곱(정(m[2]) * Number(m[1]), 정(m[3]) * Number(m[1])))} cm²` },
  {
    이름: '약속', 꼴: /㉮★㉯는 ㉮×㉮에 ㉯를 더한 다음 ([\d.]+)[을를] 뺀 값이라고 약속합니다\. ([\d.]+)★\(([\d.]+)★□\)=([\d.]+)일 때/, 답: (m) => {
      const k = 정(m[1]); const p = 정(m[2]); const q = 정(m[3]); const R = 정(m[4]);
      const 안 = R - 곱(p, p) + k;
      return 글(안 - 곱(q, q) + k);
    },
  },
  {
    이름: '경계자연수', 수준: '중', 꼴: /가장 (작은|큰) 자연수를 구해 볼까요\? □ ([<>]) ([\d.]+)×([\d.]+)/, 답: (m) => {
      const P = 곱(정(m[3]), 정(m[4]));
      return String(m[2] === '>' ? Math.floor(P / E) + 1 : Math.ceil(P / E) - 1);
    },
  },
  { 이름: '양초', 꼴: /1분에 ([\d.]+) cm씩 .+ (\d+)분 (\d+)초 뒤에 껐더니 길이가 ([\d.]+) cm/, 답: (m) => `${글(정(m[4]) + Math.round((정(m[1]) * (Number(m[2]) * 60 + Number(m[3]))) / 60))} cm` },
  { 이름: '몇배두번', 꼴: /몸무게는 ([\d.]+) kg입니다\. 언니의 몸무게는 \S+ 몸무게의 ([\d.]+)배이고, 동생의 몸무게는 언니의 몸무게의 ([\d.]+)배/, 답: (m) => `${글(정(m[1]) - 곱(곱(정(m[1]), 정(m[2])), 정(m[3])))} kg` },
  { 이름: '다리', 꼴: /1분에 ([\d.]+) km를 달리는 기차가 .+ 1분 (\d+)초가 걸렸습니다\. 기차의 길이가 (\d+) m/, 답: (m) => `${글(Math.round((정(m[1]) * (60 + Number(m[2]))) / 60) - (Number(m[3]) * E) / 1000)} km` },
  { 이름: '연료', 꼴: /휘발유 ([\d.]+) L가 필요합니다\. .+ 한 시간에 ([\d.]+) km를 가는 빠르기로 (\d+)시간 (\d+)분 동안/, 답: (m) => `${글(곱(Math.round((정(m[2]) * (Number(m[3]) * 60 + Number(m[4]))) / 60), 정(m[1])))} L` },
  { 이름: '올리고할인', 꼴: /지난달보다 ([\d.]+)배만큼 올랐습니다\. .+ 입장료의 ([\d.]+)만큼을 할인/, 답: (m) => `${글(곱(E + 정(m[1]), E - 정(m[2])))}배` },
  {
    이름: '같은수곱', 꼴: /^([\d.]+)에 ★을 곱했더니 ([\d.]+)[이가] 되었습니다\. ([\d.]+)에 ★을/, 답: (m) => {
      const 배 = 정(m[2]) / 정(m[1]);
      expect([10, 100, 1000]).toContain(Math.round(배));
      return 글(정(m[3]) * Math.round(배));
    },
  },
  {
    이름: '곱고르기', 꼴: /^곱이 가장 (작은|큰) 것을 찾아 그 값을 쓰면 얼마일까요\? (.+)$/, 답: (m) => {
      const 값 = m[2].split(', ').map((식) => { const [a, b] = 식.split('×'); return 곱(정(a), 정(b)); });
      return 글(m[1] === '작은' ? Math.min(...값) : Math.max(...값));
    },
  },
  {
    이름: '곱자리수', 꼴: /계산 결과는 소수 몇 자리 수일까요\? ([\d.×]+)$/, 답: (m) => {
      // 분수로 곱해 끝자리 0을 지운 뒤 소수점 아래 자리를 셉니다.
      let 분자 = 1n; let 자리 = 0;
      for (const t of m[1].split('×')) { const [, 소] = t.split('.'); 분자 *= BigInt(t.replace('.', '')); 자리 += 소.length; }
      while (분자 % 10n === 0n && 자리 > 0) { 분자 /= 10n; 자리 -= 1; }
      return `소수 ${자리}자리 수`;
    },
  },
  // ── 하 ──
  {
    이름: '자연수곱이용', 수준: '하', 꼴: /^(\d+)×(\d+)=(\d+)입니다\. 이 곱셈식을 이용하여 ([\d.]+)×([\d.]+)[을를] 계산하면/, 답: (m) => {
      expect(Number(m[1]) * Number(m[2])).toBe(Number(m[3]));
      return 글(곱(정(m[4]), 정(m[5])));
    },
  },
  {
    이름: '몇분의일배', 수준: '하', 꼴: /^(\d+)×(\d+)=(\d+)입니다\. ([\d.]+)×([\d.]+)[은는] .+의 곱은 \d+의 몇 배일까요/, 답: (m) => {
      const 배 = Number(m[3]) * E / 곱(정(m[4]), 정(m[5]));
      return `1/${Math.round(배)}배`;
    },
  },
  {
    이름: '잘못된소수점', 수준: '하', 꼴: /^곱의 소수점의 위치가 잘못된 것은/, 답: (_, q) => {
      const 틀린 = q.choices.filter((c) => { const [식, 값] = c.split('='); const [a, b] = 식.split('×'); return 곱(정(a), 정(b)) !== 정(값); });
      expect(틀린).toHaveLength(1);
      return 틀린[0];
    },
  },
  // ── 중 ──
  {
    이름: '바꾼곱', 수준: '중', 꼴: /^(\d+)×(\d+)=(\d+)입니다\. 이 곱셈식을 이용하여 두 수의 순서가 바뀐 식 ([\d.]+)×([\d.]+)[을를] 계산하면/, 답: (m) => {
      expect(Number(m[1]) * Number(m[2])).toBe(Number(m[3]));
      return 글(곱(정(m[4]), 정(m[5])));
    },
  },
  {
    이름: '두곱비교', 수준: '중', 꼴: /^계산 결과를 비교하여 더 (작은|큰) 값을 소수로 나타내면 얼마일까요\? ([\d.]+)×([\d.]+), ([\d.]+)×([\d.]+)$/, 답: (m) => {
      const v1 = 곱(정(m[2]), 정(m[3])); const v2 = 곱(정(m[4]), 정(m[5]));
      return 글(m[1] === '작은' ? Math.min(v1, v2) : Math.max(v1, v2));
    },
  },
];

describe('5-2 소수의 곱셈 문제집 유형(하·중·상)', () => {
  const 셈 = new Map<string, number>();
  const 맞는 = (q: Question) => 풀이들.find((p) => p.꼴.test(q.prompt));

  it('글만 보고 다시 푼 답이 문항의 답과 같고, 보기에 답이 하나뿐입니다', () => {
    for (const { q } of 문항들) {
      const 풀 = 맞는(q);
      if (!풀) continue;
      const m = 풀.꼴.exec(q.prompt)!;
      expect(q.answer, `${풀.이름}: ${q.prompt}`).toBe(풀.답(m, q));
      expect(q.choices.filter((c) => c === q.answer), q.prompt).toHaveLength(1);
      expect(new Set(q.choices).size, q.prompt).toBe(q.choices.length);
      for (const c of q.choices) if (/^[\d.]+(\s|$|[a-z가-힣²])/.test(c)) expect(Number(수(c.split(',')[0])), `${q.prompt} / ${c}`).toBeGreaterThan(0);
      셈.set(풀.이름, (셈.get(풀.이름) ?? 0) + 1);
    }
  });

  it('모든 유형이 실제로 나오고, 힌트·풀이 걸음·핵심을 갖춥니다', () => {
    expect([...셈.keys()].sort()).toEqual(풀이들.map((p) => p.이름).sort());
    for (const { q } of 문항들) {
      if (!맞는(q)) continue;
      expect(q.support.studentHint.length, q.prompt).toBeGreaterThan(10);
      expect(q.support.steps.length, q.prompt).toBeGreaterThanOrEqual(2);
      expect(q.support.coreConcept.length, q.prompt).toBeGreaterThan(5);
    }
  });

  it('유형마다 정한 수준에만 나옵니다', () => {
    for (const { q, 수준 } of 문항들) {
      const 풀 = 맞는(q);
      if (풀) expect(수준, `${풀.이름}: ${q.prompt}`).toBe(풀.수준 ?? '상');
    }
  });
});
