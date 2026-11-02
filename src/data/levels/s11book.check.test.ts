import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons11 } from '../curriculum11';
import { generateQuestions } from '../questionFactory';

// 1-1 단원별 문제집 유형(s11book.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s11book.ts를 쓰지 않습니다).
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준; 차시: string; 끝: number }[] = lessons11.flatMap((l) =>
  수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d, 차시: `${l.unitNo}-${l.lessonNo}`, 끝: l.scope.maxNumber }))),
);

const 하나둘 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const 일이삼 = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const 째 = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];
const 값 = (t: string) => (/^\d$/.test(t) ? Number(t) : 하나둘.includes(t) ? 하나둘.indexOf(t) : 일이삼.indexOf(t));
// 물건의 모양입니다(grade11/unit2.ts와 같은 물건을 따로 적어 둡니다).
const 모양표: Record<string, string> = Object.fromEntries([
  ...['휴지 상자', '과자 상자', '주사위', '벽돌', '선물 상자', '우유갑'].map((x) => [x, '상자 모양']),
  ...['음료수 캔', '딱풀', '북', '통조림', '두루마리 휴지', '분유통'].map((x) => [x, '둥근기둥 모양']),
  ...['축구공', '구슬', '수박', '야구공', '볼링공', '비치볼'].map((x) => [x, '공 모양']),
]);
const 모양 = (x: string) => { expect(모양표[x], x).toBeDefined(); return 모양표[x]; };
const 받침 =(w: string) => ((w.charCodeAt(w.length - 1) - 0xac00) % 28 !== 0);

type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };

const 풀이들: 풀이[] = [
  // ── 1단원 9까지의 수 ──
  { 이름: '읽은수', 수준: '하', 꼴: /^'(\S+)'[을를] 수로 나타내면 무엇일까요/, 답: (m) => String(값(m[1])) },
  {
    이름: '다른하나', 수준: '중', 꼴: /^나타내는 수가 나머지와 다른 하나는 어느 것일까요\? (.+)$/, 답: (m) => {
      const 것 = m[1].split(', ');
      const 다른 = 것.filter((x) => 것.filter((y) => 값(y) === 값(x)).length === 1);
      expect(다른).toHaveLength(1);
      return 다른[0];
    },
  },
  { 이름: '묶고남은', 수준: '중', 꼴: /^\S+(?: \S+)? (\d)개가 있습니다\. 그중 (\d)개만큼 묶었습니다/, 답: (m) => `${Number(m[1]) - Number(m[2])}개` },
  {
    이름: '몇째색', 수준: '하', 꼴: /^캔이 위에서부터 (.+) 차례로 쌓여 있습니다\. (위|아래)에서 (\S+)에 있는 캔은/, 답: (m) => {
      const 색 = m[1].split(', '); const k = 째.indexOf(m[3]);
      return m[2] === '위' ? 색[k - 1] : 색[색.length - k];
    },
  },
  { 이름: '오른쪽째', 수준: '중', 꼴: /^왼쪽부터 (.+?)[이가] 한 줄로 서 있습니다\. 오른쪽에서 (\S+)에 서 있는 사람은/, 답: (m) => { const 줄 = m[1].split(', '); return 줄[줄.length - 째.indexOf(m[2])]; } },
  { 이름: '반대쪽째', 수준: '상', 꼴: /^(\d)명이 한 줄로 서 있습니다\. 오른쪽에서 (\S+)에 서 있는 사람은 왼쪽에서 몇째/, 답: (m) => 째[Number(m[1]) + 1 - 째.indexOf(m[2])] },
  {
    이름: '순서말', 수준: '상', 꼴: /㉠, ㉡에 들어갈 말을 차례로 쓴 것은 어느 것일까요\? (\S+), (\S+), ㉠, ㉡/, 답: (m) => {
      const a = 째.indexOf(m[1]); const d = 째.indexOf(m[2]) - a;
      return `${째[a + 2 * d]}, ${째[a + 3 * d]}`;
    },
  },
  { 이름: '서랍째', 수준: '상', 꼴: /서랍이 위아래로 (\d)칸 있습니다\. \S+ 아래에서 (\S+) 서랍에/, 답: (m) => 째[Number(m[1]) + 1 - 째.indexOf(m[2])] },
  {
    이름: '순서빈칸', 수준: '중', 꼴: /^수의 순서에 맞게 빈칸에 알맞은 수를 앞에서부터 차례로 쓴 것은 어느 것일까요\? (.+)$/, 답: (m) => {
      const 칸 = m[1].split(', '); const 첫 = 칸.findIndex((x) => x !== '□'); const 시작 = Number(칸[첫]) - 첫;
      return 칸.map((x, k) => (x === '□' ? String(시작 + k) : '')).filter(Boolean).join(', ');
    },
  },
  { 이름: '더그리기', 수준: '상', 꼴: /^\S+[이가] (\d)개 있습니다\. \S+ 수와 (\d)[이가] 같아지도록 ○를 더 그리려고/, 답: (m) => `${Number(m[2]) - Number(m[1])}개` },
  { 이름: '영알기', 수준: '하', 꼴: /(\d)개 있었는데 (\d)개를 모두 먹었습니다\. 접시에 남은/, 답: (m) => String(Number(m[1]) - Number(m[2])) },
  { 이름: '큰수개수', 수준: '중', 꼴: /^(\d)보다 (큰|작은) 수는 모두 몇 개일까요\? ([\d, ]+)$/, 답: (m) => `${m[3].split(', ').map(Number).filter((v) => (m[2] === '큰' ? v > Number(m[1]) : v < Number(m[1]))).length}개` },
  { 이름: '가장많은', 수준: '중', 꼴: /집에 (.+) 있습니다\. 가장 (많은|적은) 인형은 몇 개/, 답: (m) => { const 수 = [...m[1].matchAll(/(\d)개/g)].map((x) => Number(x[1])); return `${m[2] === '많은' ? Math.max(...수) : Math.min(...수)}개`; } },
  {
    이름: '공통개수', 수준: '상', 꼴: /공통으로 들어갈 수 있는 수는 모두 몇 개일까요\? (\d)[은는] □보다 작습니다\. □는 (\d)보다 (큽니다|작습니다)/, 답: (m) => {
      const a = Number(m[1]); const b = Number(m[2]);
      return `${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v > a && (m[3] === '큽니다' ? v > b : v < b)).length}개`;
    },
  },
  {
    이름: '카드오른쪽', 수준: '상', 꼴: /^수 카드 ([\d, ]+)[을를] (큰|작은) 수부터 왼쪽에서 차례로 늘어놓을 때, 오른쪽에서 (\S+)에/, 답: (m) => {
      const 놓기 = m[1].split(', ').map(Number).sort((x, y) => (m[2] === '큰' ? y - x : x - y));
      return String(놓기[놓기.length - 째.indexOf(m[3])]);
    },
  },
  {
    이름: '대화수', 수준: '상', 꼴: /"(\d)보다 작은 수구나\." \S+ "그래도 (\d)보다는 크네\." \S+ "그런데 (\d)[은는] 아니야\."/, 답: (m) => {
      const 맞는 = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v < Number(m[1]) && v > Number(m[2]) && v !== Number(m[3]));
      expect(맞는).toHaveLength(1);
      return String(맞는[0]);
    },
  },
  // ── 2단원 여러 가지 모양 ──
  { 이름: '모양개수', 수준: '중', 꼴: /^방 정리를 하다가 (.+?)[이가] 나왔습니다\. 이 중 (\S+ 모양)인 물건은 모두 몇 개/, 답: (m) => `${m[1].split(', ').filter((x) => 모양(x) === m[2]).length}개` },
  {
    이름: '다른모양', 수준: '중', 꼴: /^모양이 다른 하나는 어느 것일까요\? (.+)$/, 답: (m) => {
      const 것 = m[1].split(', '); const 다른 = 것.filter((x) => 것.filter((y) => 모양(y) === 모양(x)).length === 1);
      expect(다른).toHaveLength(1);
      return 다른[0];
    },
  },
  {
    이름: '가장적은모양', 수준: '상', 꼴: /^집에 있는 물건 (.+?)[을를] 모양에 따라 나누려고 합니다\. 가장 (적은|많은) 모양은/, 답: (m) => {
      const 셈 = ['상자 모양', '둥근기둥 모양', '공 모양'].map((s) => ({ s, n: m[1].split(', ').filter((x) => 모양(x) === s).length }));
      셈.sort((a, b) => (m[2] === '적은' ? a.n - b.n : b.n - a.n));
      expect(셈[0].n).not.toBe(셈[1].n);
      return 셈[0].s;
    },
  },
  {
    이름: '둘다모양', 수준: '상', 꼴: /^\S+? (.+?)[을를], \S+? (.+?)[을를] 가지고 있습니다\. 두 사람이 모두 가지고 있는 모양은/, 답: (m) => {
      const 가 = new Set(m[1].split(', ').map(모양)); const 공통 = m[2].split(', ').map(모양).filter((s) => 가.has(s));
      expect(new Set(공통).size).toBe(1);
      return 공통[0];
    },
  },
  { 이름: '설명모양', 수준: '상', 꼴: /^세 사람이 한 모양을 설명하고 있습니다\. .+"(눕히면 잘 굴러가요|굴러가지 않아요)\."/, 답: (m) => (m[1].startsWith('눕히면') ? '둥근기둥 모양' : '상자 모양') },
  {
    이름: '굴러가는개수', 수준: '상', 꼴: /^(.+) 중에서 (굴렸을 때 잘 굴러가는 물건|평평한 부분이 2개 있는 물건)은 모두 몇 개/, 답: (m) => {
      const 것 = m[1].split(', ').map(모양);
      return `${것.filter((s) => (m[2].startsWith('굴렸을') ? s !== '상자 모양' : s === '둥근기둥 모양')).length}개`;
    },
  },
  // ── 3단원 덧셈과 뺄셈 ──
  {
    이름: '모으고가른', 수준: '중', 꼴: /^㉠은 (\d)[과와] (\d)[을를] 모은 수이고, ㉡은 (\d)[을를] (\d)[과와] 어떤 수로 가를 때의 어떤 수입니다\. ㉠과 ㉡ 중 더 (작은|큰) 수/, 답: (m) => {
      const 가 = Number(m[1]) + Number(m[2]); const 나 = Number(m[3]) - Number(m[4]);
      return String(m[5] === '작은' ? Math.min(가, 나) : Math.max(가, 나));
    },
  },
  {
    이름: '카드세장식', 수준: '상', 꼴: /이 적힌 수 카드가 한 장씩 있습니다\. 이 카드를 한 번씩 써서 덧셈식을 바르게 만든 것은/, 답: (_, q) => {
      const 맞는 = q.choices.filter((c: string) => { const [l, r] = c.split('='); const [a, b] = l.split('+').map(Number); return a + b === Number(r); });
      expect(맞는).toHaveLength(1);
      return 맞는[0];
    },
  },
  {
    이름: '남은식', 수준: '중', 꼴: /피자 (\d)조각 중에서 (\d)조각을 먹었습니다\. 남은 피자 조각의 수를 구하는 뺄셈식/, 답: (m) => `${m[1]}-${m[2]}=${Number(m[1]) - Number(m[2])}`,
  },
  { 이름: '화살표계산', 수준: '중', 꼴: /^(\d)에서 (\d)[을를] 빼고, 그 수에 (\d)[을를] 더하면 얼마일까요/, 답: (m) => String(Number(m[1]) - Number(m[2]) + Number(m[3])) },
  {
    이름: '가장작은식', 수준: '중', 꼴: /^계산 결과가 가장 (작은|큰) 것은 어느 것일까요\? (.+)$/, 답: (m) => {
      const 셈 = (식: string) => (식.includes('+') ? 식.split('+').map(Number).reduce((a, b) => a + b) : 식.split('-').map(Number).reduce((a, b) => a - b));
      const 식들 = m[2].split(', ').sort((x, y) => (m[1] === '작은' ? 셈(x) - 셈(y) : 셈(y) - 셈(x)));
      return 식들[0];
    },
  },
  {
    이름: '영아닌것', 수준: '하', 꼴: /^계산 결과가 0이 아닌 것은 어느 것일까요\? (.+)$/, 답: (m) => {
      const 셈 = (식: string) => (식.includes('+') ? 식.split('+').map(Number).reduce((a, b) => a + b) : 식.split('-').map(Number).reduce((a, b) => a - b));
      const 아닌 = m[1].split(', ').filter((x) => 셈(x) !== 0);
      expect(아닌).toHaveLength(1);
      return 아닌[0];
    },
  },
  {
    이름: '합아닌식', 수준: '중', 꼴: /^합이 (\d)인 덧셈식이 아닌 것은 어느 것일까요\? (.+)$/, 답: (m) => {
      const 아닌 = m[2].split(', ').filter((x) => x.split('+').map(Number).reduce((a, b) => a + b) !== Number(m[1]));
      expect(아닌).toHaveLength(1);
      return 아닌[0];
    },
  },
  {
    이름: '세수식', 수준: '상', 꼴: /두 사람이 식을 만들었습니다\. (\S+): (\S+), (\S+): (\S+) 바르게 만든 사람은/, 답: (m) => {
      const 맞나 = (식: string) => { const [l, r] = 식.split('='); const v = l.includes('+') ? l.split('+').map(Number).reduce((a, b) => a + b) : l.split('-').map(Number).reduce((a, b) => a - b); return v === Number(r); };
      const 바른 = [[m[1], m[2]], [m[3], m[4]]].filter(([, 식]) => 맞나(식));
      expect(바른).toHaveLength(1);
      return 바른[0][0];
    },
  },
  // ── 4단원 비교하기 ──
  {
    이름: '키순서', 수준: '상', 꼴: /^(.+)\. (키가 가장 작은 사람|키가 둘째로 작은 사람|키가 가장 큰 사람)은 누구일까요/, 답: (m) => {
      // 'A은(는) B보다 키가 더 큽니다/작습니다'에서 작은 차례를 세웁니다.
      const 더큰 = new Map<string, string>();
      for (const [, a, b, 말] of m[1].matchAll(/(\S+?)[은는] (\S+?)보다 키가 더 (큽|작습)니다/g)) {
        if (말 === '큽') 더큰.set(b, a); else 더큰.set(a, b);
      }
      const 모두 = new Set([...더큰.keys(), ...더큰.values()]);
      const 맨아래 = [...모두].find((x) => ![...더큰.values()].includes(x))!;
      const 차례 = [맨아래, 더큰.get(맨아래)!, 더큰.get(더큰.get(맨아래)!)!];
      return 차례[['키가 가장 작은 사람', '키가 둘째로 작은 사람', '키가 가장 큰 사람'].indexOf(m[2])];
    },
  },
  { 이름: '가장무거운', 수준: '하', 꼴: /^가장 (무거운|가벼운) 것은 어느 것일까요\? (.+)$/, 답: (m) => { const 차례 = ['깃털', '지우개', '사과', '책가방', '자전거', '피아노']; const 것 = m[2].split(', ').sort((a, b) => 차례.indexOf(a) - 차례.indexOf(b)); return m[1] === '무거운' ? 것[것.length - 1] : 것[0]; } },
  {
    이름: '고무줄', 수준: '중', 꼴: /^똑같은 고무줄에 .+ 고무줄이 (.+) 늘어났습니다\. 가장 (무거운|가벼운) 것은/, 답: (m) => {
      const 정도 = ['조금', '꽤', '아주 많이'];
      const 것 = [...m[1].matchAll(/(\S+?)[은는] (조금|꽤|아주 많이)/g)].map((x) => ({ 이름: x[1], 늘 : 정도.indexOf(x[2]) }));
      것.sort((a, b) => a.늘 - b.늘);
      return m[2] === '무거운' ? 것[것.length - 1].이름 : 것[0].이름;
    },
  },
  { 이름: '넓이순서', 수준: '상', 꼴: /^(\S+?)[은는] (\S+?)보다 좁고, \S+? (\S+?)보다 좁습니다\. .+ 가장 (넓은|좁은) 것은/, 답: (m) => (m[4] === '넓은' ? m[3] : m[1]) },
  { 이름: '그릇순서', 수준: '상', 꼴: /^(\S) 그릇에 가득 담긴 물을 (\S) 그릇에 부었더니 물이 넘쳤고, (\S) 그릇에 가득 담긴 물을 \S 그릇에 부었더니 물이 넘쳤습니다\. 담을 수 있는 양이 가장 (많은|적은)/, 답: (m) => (m[4] === '많은' ? m[3] : m[2]) },
  {
    이름: '옮겨담기', 수준: '중', 꼴: /^(\S) 그릇은 (\S) 그릇보다 담을 수 있는 양이 더 많습니다\. (\S) 그릇에 가득 담긴 물을/, 답: (m) => (m[3] === m[1] ? '넘쳐 흐릅니다' : '가득 차지 않습니다'),
  },
  // ── 5단원 50까지의 수 ──
  { 이름: '열되려면', 수준: '하', 꼴: /붙임 딱지를 (\d)장 가지고 있습니다\. 붙임 딱지가 10장이 되려면/, 답: (m) => `${10 - Number(m[1])}장` },
  { 이름: '앞뒤수', 수준: '중', 꼴: /^(\d+)보다 1만큼 더 작은 수와 1만큼 더 큰 수를 차례로 쓴 것은/, 답: (m) => `${Number(m[1]) - 1}, ${Number(m[1]) + 1}` },
  {
    이름: '짝찾기', 수준: '상', 꼴: /^수 카드 ([\d, ]+) 중에서 두 수를 모아 (\d+)[이가] 되도록 짝을 지으려고 합니다\. (\d)[과와] 짝이 되는 수는/, 답: (m) => {
      const 카드 = m[1].split(', ').map(Number); const 짝 = 카드.filter((v) => v !== Number(m[3]) && v + Number(m[3]) === Number(m[2]));
      expect(짝).toHaveLength(1);
      return String(짝[0]);
    },
  },
  { 이름: '묶음낱개많은', 수준: '중', 꼴: /^낱개가 10개보다 많습니다\. 10개씩 묶음 (\d)개와 낱개 (\d+)개인 수는 얼마일까요/, 답: (m) => String(Number(m[1]) * 10 + Number(m[2])) },
  {
    이름: '잘못읽기', 수준: '중', 꼴: /^수를 잘못 읽은 것은 어느 것일까요\?$/, 답: (_, q) => {
      const 열 = ['', '열', '스물', '서른', '마흔', '쉰']; const 십 = ['', '십', '이십', '삼십', '사십', '오십'];
      const 읽기 = (n: number) => [`${열[Math.floor(n / 10)]}${하나둘[n % 10]}`, `${십[Math.floor(n / 10)]}${n % 10 ? 일이삼[n % 10] : ''}`];
      const 틀린 = q.choices.filter((c) => { const [n, 말] = c.split(' → '); return !읽기(Number(n)).includes(말); });
      expect(틀린).toHaveLength(1);
      return 틀린[0];
    },
  },
  { 이름: '차례늘어놓기', 수준: '중', 꼴: /^([\d, ]+)[을를] (큰|작은) 수부터 순서대로 바르게 쓴 것은/, 답: (m) => m[1].split(', ').map(Number).sort((a, b) => (m[2] === '큰' ? b - a : a - b)).join(', ') },
  {
    이름: '말로쓴비교', 수준: '상', 꼴: /^배 따기 체험에서 \S+ (\S+) 개, \S+ (\S+) 개, \S+ (\S+) 개를 땄습니다\. 배를 가장 (많이|적게) 딴 사람은/, 답: (m) => {
      const 열 = ['', '열', '스물', '서른', '마흔', '쉰'];
      const 수 = (말: string) => { const k = 열.findIndex((x, i) => i > 0 && 말.startsWith(x)); return k * 10 + 하나둘.indexOf(말.slice(열[k].length)); };
      const 값 = [m[1], m[2], m[3]].map(수);
      return `${m[4] === '많이' ? Math.max(...값) : Math.min(...값)}개`;
    },
  },
];

describe('1-1 단원별 문제집 유형(하·중·상)', () => {
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
    expect(받침('셋')).toBe(true);
  });
});
