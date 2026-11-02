import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons11 } from '../curriculum11';
import { lessons12 } from '../curriculum12';
import { generateQuestions } from '../questionFactory';

// 1학년 고난도 상 문항(s1hard.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s1hard.ts를 쓰지 않습니다).
const 상문항: { 차시: string; q: Question }[] = [];
for (const l of [...lessons11, ...lessons12]) for (const q of generateQuestions(l, '상')) 상문항.push({ 차시: `${l.semester} ${l.unitNo}-${l.lessonNo}`, q });

const 수 = (t: string) => Number(t.replace(/[^\d]/g, ''));
const 째 = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];
const 범위 = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, k) => a + k);

type 풀이 = { 이름: string; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => number | string };

const 풀이들: 풀이[] = [
  { 이름: '두조건', 꼴: /조건 1: (\d+)[과와] (\d+) 사이에 있는 수입니다\. 조건 2: (\d+)보다 작은 수/, 답: (m) => 범위(+m[1] + 1, +m[2] - 1).filter((n) => n < +m[3]).length },
  { 이름: '카드순서', 꼴: /수 카드 ([\d, ]+)[을를] (작은|큰) 수부터 차례로 늘어놓을 때 왼쪽에서 (\S+)에 오는/, 답: (m) => m[1].split(', ').map(Number).sort((a, b) => (m[2] === '작은' ? a - b : b - a))[째.indexOf(m[3]) - 1] },
  { 이름: '뒤에서째', 꼴: /^(\d+)명이 한 줄로 서 있습니다\. 그중 \S+ 뒤에서 (\S+)에 서 있습니다/, 답: (m) => +m[1] - 째.indexOf(m[2]) },
  { 이름: '앞뒤', 꼴: /앞에는 (\d+)명이 서 있고, 뒤에는 (\d+)명이 서 있습니다/, 답: (m) => +m[1] + +m[2] + 1 },
  { 이름: '모으기비교', 꼴: /^(\S+?)[은는] 수 카드 (\d)[과와] (\d)[을를], (\S+?)[은는] 수 카드 (\d)[과와] (\d)[을를] 모으기/, 답: (m) => (+m[2] + +m[3] > +m[5] + +m[6] ? m[1] : m[4]) },
  { 이름: '가르기셋', 꼴: /^(\d)[을를] ㉠과 ㉡으로, (\d)[을를] ㉢과 ㉣으로 가르기/, 답: (m) => +m[2] / 2 + 1 },
  { 이름: '합같은식', 꼴: /^\S+? (\d)\+(\d), \S+? (\d)\+(\d)[을를] 말했습니다\. 세 사람이 합이 같은/, 답: (m, q) => { const s = +m[1] + +m[2]; const 맞는 = q.choices.filter((c) => { const [x, y] = c.split('+').map(Number); return x + y === s; }); return 맞는.length === 1 ? 맞는[0] : 'X'; } },
  { 이름: '모양수', 꼴: /◇=(\d)일 때, ◇\+◇=●, ●([+-])◇=■/, 답: (m) => (m[2] === '+' ? 3 * +m[1] : +m[1]) },
  { 이름: '같아지게', 꼴: /과자를 (\d)개, \S+ (\d)개 가지고 있습니다\. 두 사람이 가진 과자의 수를 같게/, 답: (m) => (+m[1] - +m[2]) / 2 },
  { 이름: '카드식', 꼴: /수 카드 ([\d, ]+) 중 2장을 골라 (차가 가장 큰 뺄셈식|합이 가장 큰 덧셈식)/, 답: (m) => { const c = m[1].split(', ').map(Number).sort((a, b) => a - b); return m[2].startsWith('차') ? c[3] - c[0] : c[3] + c[2]; } },
  { 이름: '매일', 꼴: /어제는 아침에 (\d)개, 저녁에 (\d)개를 먹었습니다\. 오늘 아침에 (\d)개를/, 답: (m) => +m[1] + +m[2] - +m[3] },
  {
    이름: '무게', 꼴: /^(.+) 네 과일 중 (둘째로 무거운|둘째로 가벼운) 과일/, 답: (m) => {
      // 'A은 B보다 가볍습니다', 'A은 B보다 무겁습니다'에서 가벼운 순서를 다시 세웁니다.
      const 가벼운 = new Map<string, Set<string>>();
      for (const [, a, b, 말] of m[1].matchAll(/(\S+?)[은는] (\S+?)보다 (가볍|무겁)습니다/g)) {
        const [작, 큰] = 말 === '가볍' ? [a, b] : [b, a];
        if (!가벼운.has(작)) 가벼운.set(작, new Set());
        가벼운.get(작)!.add(큰);
        if (!가벼운.has(큰)) 가벼운.set(큰, new Set());
      }
      const 모두 = [...가벼운.keys()];
      const 더무거운수 = (x: string): number => { const 본 = new Set<string>(); const 가기 = (y: string) => { for (const z of 가벼운.get(y) ?? []) if (!본.has(z)) { 본.add(z); 가기(z); } }; 가기(x); return 본.size; };
      const 순 = [...모두].sort((a, b) => 더무거운수(b) - 더무거운수(a));
      return m[2] === '둘째로 무거운' ? 순[순.length - 2] : 순[1];
    },
  },
  { 이름: '똑같이', 꼴: /수박 (\d+)조각을 똑같이 나누어/, 답: (m) => +m[1] / 2 },
  { 이름: '손가락', 꼴: /선생님이 (\d+)(?:이)?라고 말했고, \S+ (두 손의 손가락을 모두|한 손은 모두, 다른 손은 (\d)개를) 폈습니다/, 답: (m) => +m[1] - (m[3] ? 5 + +m[3] : 10) },
  { 이름: '묶음덤', 꼴: /배추 (\d)묶음과 낱개 (\d)포기를 샀더니 가게에서 (\d)포기를 더/, 답: (m) => +m[1] * 10 + +m[2] + +m[3] },
  { 이름: '더많이', 꼴: /땅콩 (\d+)개를 \S+ 동생이 나누어 먹습니다\. \S+ 동생보다 (\d)개 더 많이/, 답: (m) => (+m[1] + +m[2]) / 2 },
  { 이름: '상자', 꼴: /사과를 (\d+)개 땄습니다\. 한 상자에 10개씩 (\d)상자를 가득/, 답: (m) => +m[2] * 10 - +m[1] },
  { 이름: '봉지', 꼴: /과자 (\d)봉지와 낱개 (\d)개를 샀습니다\. 그중 한 봉지와 낱개 (\d)개를 먹었다면/, 답: (m) => (+m[1] - 1) * 10 + +m[2] - +m[3] },
  { 이름: '우표', 꼴: /묶음 (\d)개와 낱장 (\d+)장, \S+ 10장씩 묶음 (\d)개와 낱장 (\d)장, \S+ (\d+)장\./, 답: (m) => Math.max(+m[1] * 10 + +m[2], +m[3] * 10 + +m[4], +m[5]) },
  { 이름: '목걸이', 꼴: /구슬 (\d)봉지와 낱개 구슬 (\d+)개가 있습니다\. 목걸이를/, 답: (m) => Math.floor((+m[1] * 10 + +m[2]) / 10) },
  { 이름: '사이홀짝', 꼴: /^(\d+)[과와] (\d+) 사이에 있는 수 중에서 가장 (큰|작은) (홀수|짝수)/, 답: (m) => { const 후 = 범위(+m[1] + 1, +m[2] - 1).filter((n) => (n % 2 === 1) === (m[4] === '홀수')); return m[3] === '큰' ? 후[후.length - 1] : 후[0]; } },
  { 이름: '모둠', 꼴: /어린이 (\d+)명이 10명씩 짝을 지어/, 답: (m) => Math.floor(+m[1] / 10) },
  { 이름: '홀짝족', 꼴: /'(\d+)보다 큰 수 중 가장 작은 수', 짝수족은 '(\d+)보다 작은 수 중 가장 큰 수'/, 답: (m) => { let a = +m[1] + 1; while (a % 2 === 0) a += 1; let b = +m[2] - 1; while (b % 2 === 1) b -= 1; return a + b; } },
  { 이름: '세수합가짓수', 꼴: /1부터 (\d)까지의 수가 적힌 수 카드가 많이 있습니다\. 카드 3장을 골라 세 수의 합이 (\d)인/, 답: (m) => { let n = 0; for (let a = 1; a <= +m[1]; a += 1) for (let b = a; b <= +m[1]; b += 1) { const c = +m[2] - a - b; if (c >= b && c <= +m[1]) n += 1; } return n; } },
  { 이름: '남은차', 꼴: /귤이 (\d)개씩 있습니다\. \S+ 아침에 (\d)개, 저녁에 (\d)개를 먹었고, \S+ 아침에 (\d)개, 저녁에 (\d)개를/, 답: (m) => Math.abs((+m[1] - +m[2] - +m[3]) - (+m[1] - +m[4] - +m[5])) },
  { 이름: '층', 꼴: /(\d)층에 삽니다\. 심부름을 하러 (\d)층을 올라갔다가, 친구네 집에 가려고 (\d)층을 내려/, 답: (m) => +m[1] + +m[2] - +m[3] },
  { 이름: '세경기', 꼴: /세 경기 동안 넣은 골의 수입니다\. (.+)\. 가장 많은 골/, 답: (m) => Math.max(...m[1].split(' / ').map((s) => (s.match(/(\d+)골/g) ?? []).map(수).reduce((a, b) => a + b, 0))) },
  { 이름: '긴바늘', 꼴: /시계가 (\d+)시를 가리키고 있습니다\. (\d+)시가 될 때까지 긴바늘은 몇 바퀴/, 답: (m) => +m[2] - +m[1] },
  { 이름: '반시간', 꼴: /시계가 (\d+)시 30분을 가리키고 있습니다\. 긴바늘이 시계가 돌아가는 방향으로 숫자 6칸/, 답: (m) => +m[1] + 1 },
  { 이름: '주고받기', 꼴: /^(\S+), (\S+), (\S+?)[이가] 구슬을 가지고 있습니다\. \S+ \S+ (\d)개, \S+ (\d)개를 주었고, 이번에는 \S+ \S+ (\d)개를/, 답: (m) => 2 * +m[4] + +m[5] + +m[6] },
  { 이름: '묶음배열', 꼴: /^어떤 규칙에 따라 수를 늘어놓았습니다\. ([\d, ]+), … 이 규칙대로 늘어놓을 때 (\d+)번째 수와 (\d+)번째 수의 합/, 답: (m) => { const 배열 = Array.from({ length: 12 }, (_, i) => [i + 1, i + 2, i + 1]).flat(); expect(m[1].split(', ').map(Number)).toEqual(배열.slice(0, 9)); return 배열[+m[2] - 1] + 배열[+m[3] - 1]; } },
  { 이름: '색칸', 꼴: /^(\S+), (\S+), (\S+) 칸이 이 순서대로 되풀이되도록 띠를 칠하고 있습니다\. (\d+)번째 칸까지 칠했을 때 (\S+) 칸과 (\S+) 칸은/, 답: (m) => { const 색 = [m[1], m[2], m[3]]; const n = +m[4]; return 범위(0, n - 1).filter((k) => 색[k % 3] === m[5] || 색[k % 3] === m[6]).length; } },
  { 이름: '합같게', 꼴: /1회에 (\d+)점, 2회에 (\d+)점을 냈습니다\. \S+ 1회에 (\d+)점을 냈는데/, 답: (m) => +m[1] + +m[2] - +m[3] },
  { 이름: '떠난뒤', 꼴: /젖소가 (\d+)마리, 양이 (\d+)마리 있었습니다\. 오늘 젖소 (\d+)마리와 양 (\d+)마리가/, 답: (m) => Math.abs((+m[1] - +m[3]) - (+m[2] - +m[4])) },
];

describe('1학년 고난도 상 문항', () => {
  const 셈 = new Map<string, number>();

  it('글만 보고 다시 푼 답이 문항의 답과 같고, 보기에 답이 하나뿐입니다', () => {
    for (const { q } of 상문항) {
      for (const 풀 of 풀이들) {
        const m = 풀.꼴.exec(q.prompt);
        if (!m) continue;
        const 답 = 풀.답(m, q);
        if (typeof 답 === 'number') expect(수(q.answer), `${풀.이름}: ${q.prompt}`).toBe(답);
        else expect(q.answer, `${풀.이름}: ${q.prompt}`).toBe(답);
        expect(q.choices.filter((c) => c === q.answer), q.prompt).toHaveLength(1);
        expect(new Set(q.choices).size, q.prompt).toBe(q.choices.length);
        셈.set(풀.이름, (셈.get(풀.이름) ?? 0) + 1);
        break;
      }
    }
  });

  it('모든 유형이 실제로 나오고, 힌트·풀이 걸음·핵심을 갖춥니다', () => {
    expect([...셈.keys()].sort()).toEqual(풀이들.map((p) => p.이름).sort());
    for (const { q } of 상문항) {
      if (!풀이들.some((p) => p.꼴.test(q.prompt))) continue;
      expect(q.support.studentHint.length, q.prompt).toBeGreaterThan(10);
      expect(q.support.steps.length, q.prompt).toBeGreaterThanOrEqual(2);
      expect(q.support.coreConcept.length, q.prompt).toBeGreaterThan(5);
    }
  });

  it('차시가 다루는 수의 범위를 넘지 않습니다', () => {
    for (const { q, 차시 } of 상문항) {
      if (!풀이들.some((p) => p.꼴.test(q.prompt))) continue;
      const l = [...lessons11, ...lessons12].find((one) => `${one.semester} ${one.unitNo}-${one.lessonNo}` === 차시)!;
      // 시각 차시는 '30분'을 읽으므로 30까지 둡니다.
      const 끝 = l.semester === '1-2' && l.unitNo === 3 ? 30 : l.scope.maxNumber;
      const 큰수 = Math.max(0, ...([q.prompt, ...q.choices].join(" ").match(/\d+/g) ?? []).map(Number));
      expect(큰수, `${차시} ${q.prompt}`).toBeLessThanOrEqual(끝);
    }
  });
});
