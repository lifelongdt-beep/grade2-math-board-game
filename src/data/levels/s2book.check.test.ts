import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons } from '../curriculum';
import { generateQuestions } from '../questionFactory';

// 2학년 단원별 문제집 유형(s2book.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s2book.ts를 쓰지 않습니다).
const 수준들 = ['하', '중', '상'] as const;
type 수준 = (typeof 수준들)[number];
const 문항들: { q: Question; 수준: 수준; 끝: number }[] = lessons.flatMap((l) =>
  수준들.flatMap((d) => generateQuestions(l, d).map((q) => ({ q, 수준: d, 끝: l.scope.maxNumber }))),
);

const 일이삼 = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const 읽기 = (n: number) => {
  const 백 = Math.floor(n / 100); const 십 = Math.floor(n / 10) % 10; const 일 = n % 10;
  return `${백 ? `${백 === 1 ? '' : 일이삼[백]}백` : ''}${십 ? `${십 === 1 ? '' : 일이삼[십]}십` : ''}${일 ? 일이삼[일] : ''}`;
};

type 풀이 = { 이름: string; 수준: 수준; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => string };

const 풀이들: 풀이[] = [
  // ── 2-1 1단원 세 자리 수 ──
  {
    이름: '잘못읽은세자리', 수준: '하', 꼴: /^세 자리 수를 잘못 읽은 것은 어느 것일까요\?$/, 답: (_, q) => {
      const 틀린 = q.choices.filter((c) => { const [n, 말] = c.split(' - '); return 읽기(Number(n)) !== 말; });
      expect(틀린).toHaveLength(1);
      return 틀린[0];
    },
  },
  { 이름: '백십개수', 수준: '중', 꼴: /^(\d)00[은는] 100이 ㉠개인 수이고, (\d)00[은는] 10이 ㉡개인 수입니다/, 답: (m) => String(Number(m[1]) + 10 * Number(m[2])) },
  { 이름: '남은상자', 수준: '중', 꼴: /10개씩 들어 있는 누름 못 (\d+)상자를 샀습니다\. 이 중 (\d+)상자는 .+ (\d+)상자는 공예품/, 답: (m) => `${(Number(m[1]) - Number(m[2]) - Number(m[3])) * 10}개` },
  { 이름: '같은숫자값', 수준: '상', 꼴: /^(\d{3})에서 백의 자리 숫자 (\d)[이가] 나타내는 값은 십의 자리 숫자/, 답: (m) => { expect(m[1][0]).toBe(m[1][1]); return `${(Number(m[1][0]) * 100) / (Number(m[1][1]) * 10)}개`; } },
  { 이름: '몇씩뛰었나', 수준: '중', 꼴: /^다음은 몇씩 뛰어 센 것일까요\? (\d+) - (\d+)/, 답: (m) => String(Number(m[2]) - Number(m[1])) },
  {
    이름: '두뛰어세기', 수준: '상', 꼴: /"나는 (\d+)에서 시작하여 (\d+)씩 뛰어 세었어\." \S+ "나는 (\d+)에서 시작하여 (\d+)씩 거꾸로 뛰어 세었어\."/, 답: (m) => String(Math.min(Number(m[1]) + 2 * Number(m[2]), Number(m[3]) - 2 * Number(m[4]))),
  },
  { 이름: '돈비교', 수준: '상', 꼴: /100원짜리 (\d)개와 10원짜리 (\d)개를, \S+ 10원짜리 (\d+)개를 가지고/, 답: (m) => `${Math.max(Number(m[1]) * 100 + Number(m[2]) * 10, Number(m[3]) * 10)}원` },
  {
    이름: '개수로두수', 수준: '상', 꼴: /^100이 (\d+)개, 10이 (\d+)개, 1이 (\d+)개인 수와 100이 (\d+)개, 10이 (\d+)개, 1이 (\d+)개인 수 중에서 더 작은 수/, 답: (m) => {
      const [a, b, c, d, e, f] = m.slice(1).map(Number);
      return String(Math.min(a * 100 + b * 10 + c, d * 100 + e * 10 + f));
    },
  },
  {
    이름: '같은자리개수', 수준: '상', 꼴: /^(\d+)보다 크고 (\d+)보다 작은 세 자리 수 중에서 백의 자리 숫자와 십의 자리 숫자가 같은 수/, 답: (m) => {
      let n = 0;
      for (let v = Number(m[1]) + 1; v < Number(m[2]); v += 1) if (String(v)[0] === String(v)[1]) n += 1;
      return `${n}개`;
    },
  },
  // ── 2-1 3단원 덧셈과 뺄셈 ──
  { 이름: '합과백', 수준: '중', 꼴: /^10이 (\d)개, 1이 (\d)개인 수와 10이 (\d)개, 1이 (\d)개인 수의 합과 100 중에서 더 큰 수/, 답: (m) => String(Math.max(100, Number(m[1]) * 10 + Number(m[2]) + Number(m[3]) * 10 + Number(m[4]))) },
  {
    이름: '카드두수합', 수준: '상', 꼴: /^수 카드 ([\d, ]+)[을를] 한 번씩 사용하여 두 자리 수 두 개를 만들려고 합니다\. 두 수의 합이 가장 클 때/, 답: (m) => {
      const c = m[1].split(', ').map(Number); let 최대 = 0;
      for (const p of [[0, 1, 2, 3], [0, 2, 1, 3], [0, 3, 1, 2], [1, 0, 2, 3], [1, 2, 0, 3], [1, 3, 0, 2], [2, 0, 1, 3], [2, 1, 0, 3], [2, 3, 0, 1], [3, 0, 1, 2], [3, 1, 0, 2], [3, 2, 0, 1]]) 최대 = Math.max(최대, c[p[0]] * 10 + c[p[1]] + c[p[2]] * 10 + c[p[3]]);
      return String(최대);
    },
  },
  {
    이름: '화살차', 수준: '상', 꼴: /^과녁에 ([\d, ]+)[이가] 적혀 있습니다\. .+ 첫 번째 화살로 (\d+)[을를] 맞혔다면/, 답: (m) => {
      const 수 = m[1].split(', ').map(Number).filter((v) => v !== Number(m[2]));
      return String(수.reduce((b, v) => (Math.abs(v - Number(m[2])) > Math.abs(b - Number(m[2])) ? v : b)));
    },
  },
  {
    이름: '세뺄셈', 수준: '중', 꼴: /^셋 중 가장 (작은|큰) 뺄셈식의 값을 구해 볼까요\? (.+)$/, 답: (m) => {
      const 값 = m[2].split(', ').map((x) => { const [a, b] = x.split('-').map(Number); return a - b; });
      return String(m[1] === '작은' ? Math.min(...값) : Math.max(...값));
    },
  },
  {
    이름: '지운숫자두개', 수준: '상', 꼴: /^두 자리 수 ㉠(\d)에서 두 자리 수 (\d)㉡을 빼면 (\d+)입니다\. ㉠과 ㉡에 알맞은/, 답: (m) => {
      const 맞는: number[] = [];
      for (let a = 1; a <= 9; a += 1) for (let b = 0; b <= 9; b += 1) if (a * 10 + Number(m[1]) - (Number(m[2]) * 10 + b) === Number(m[3])) 맞는.push(a + b);
      expect(맞는).toHaveLength(1);
      return String(맞는[0]);
    },
  },
  { 이름: '동전합', 수준: '상', 꼴: /동전이 (\d)개만 더 있으면 (\d+)개가 되고, \S+ \S+보다 (\d)개를 적게/, 답: (m) => { const 가 = Number(m[2]) - Number(m[1]); return `${가 + 가 - Number(m[3])}개`; } },
  {
    이름: '세수고르기', 수준: '상', 꼴: /^([\d, ]+) 중에서 합이 (\d+)[이가] 되는 세 수를 바르게 고른 것은/, 답: (_, q) => {
      const 목표 = Number(/합이 (\d+)/.exec(q.prompt)![1]);
      const 맞는 = q.choices.filter((c) => c.split(', ').map(Number).reduce((a, b) => a + b) === 목표);
      expect(맞는).toHaveLength(1);
      return 맞는[0];
    },
  },
  { 이름: '처음수', 수준: '중', 꼴: /오리 (\d)마리가 연못으로 더 들어와서 모두 (\d+)마리가 되었습니다/, 답: (m) => `${Number(m[2]) - Number(m[1])}마리` },
  { 이름: '별구하기', 수준: '상', 꼴: /^□=(\d+)일 때 ☆의 값을 구해 볼까요\? □\+□\+△=(\d+), □\+△\+△=☆/, 답: (m) => { const 세모 = Number(m[2]) - 2 * Number(m[1]); return String(Number(m[1]) + 2 * 세모); } },
  {
    이름: '조건네모개수', 수준: '상', 꼴: /^십의 자리 숫자가 (\d)인 두 자리 수 중에서 □ 안에 들어갈 수 있는 수는 모두 몇 개일까요\? (\d+)-□ < (\d+)$/, 답: (m) => `${Array.from({ length: 10 }, (_, k) => Number(m[1]) * 10 + k).filter((v) => Number(m[2]) - v < Number(m[3]) && Number(m[2]) - v > 0).length}개`,
  },
  // ── 2-1 6단원 곱셈 ──
  {
    이름: '남김없이', 수준: '중', 꼴: /^오이 (\d+)개를 (.+) 묶어 세려고 합니다\. 오이를 남김없이 묶어 셀 수 있는 사람은/, 답: (m) => {
      const 맞는 = [...m[2].matchAll(/(\S+?)[은는] (\d)개씩/g)].filter((x) => Number(m[1]) % Number(x[2]) === 0).map((x) => x[1]);
      expect(맞는).toHaveLength(1);
      return 맞는[0];
    },
  },
  { 이름: '몇배인가', 수준: '중', 꼴: /딱지를 (\d)장, \S+ (\d+)장 모았습니다\. .+ 몇 배일까요/, 답: (m) => `${Number(m[2]) / Number(m[1])}배` },
  { 이름: '배합차', 수준: '상', 꼴: /^(\d)의 (\d)배와 \d의 (\d)배의 (합|차)[은는] \d의 몇 배/, 답: (m) => `${m[4] === '합' ? Number(m[2]) + Number(m[3]) : Number(m[2]) - Number(m[3])}배` },
  { 이름: '곱셈빈칸합', 수준: '중', 꼴: /^□ 안에 들어갈 수들의 합을 구해 볼까요\? (\d)×□=(\d+), (\d)×(\d)=□$/, 답: (m) => String(Number(m[2]) / Number(m[1]) + Number(m[3]) * Number(m[4])) },
  { 이름: '접시와낱개', 수준: '중', 꼴: /한 접시에 (\d)개씩 담아서 팝니다\. \S+ (\d)접시와 낱개로 (\d)개를 더 샀습니다/, 답: (m) => `${Number(m[1]) * Number(m[2]) + Number(m[3])}개` },
  { 이름: '옷입기', 수준: '상', 꼴: /\S+ (\d)벌과 \S+ (\d)벌을 가지고 있습니다\. .+ 한 벌씩 골라 입는 방법/, 답: (m) => `${Number(m[1]) * Number(m[2])}가지` },
  { 이름: '같은양날수', 수준: '상', 꼴: /하루에 (\d)쪽씩 (\d+)일 동안 읽었습니다\. 같은 양을 (\d)일 만에/, 답: (m) => `${(Number(m[1]) * Number(m[2])) / Number(m[3])}쪽` },
  { 이름: '묶음차', 수준: '중', 꼴: /장미를 \S+ (\d)송이씩 (\d)묶음, \S+ (\d)송이씩 (\d)묶음 가지고/, 답: (m) => `${Math.abs(Number(m[1]) * Number(m[2]) - Number(m[3]) * Number(m[4]))}송이` },
  { 이름: '다리수', 수준: '상', 꼴: /거미 (\d)마리와 메뚜기 (\d)마리를 관찰했습니다/, 답: (m) => `${Number(m[1]) * 8 + Number(m[2]) * 6}개` },
  // ── 2-2 1단원 네 자리 수 ──
  {
    이름: '천아닌것', 수준: '하', 꼴: /^1000을 나타내는 수가 아닌 것은 어느 것일까요\? (.+)$/, 답: (m) => {
      const 값 = (말: string) => { let r = /(\d+)보다 (\d+) 큰 수/.exec(말); if (r) return Number(r[1]) + Number(r[2]); r = /(\d+)이 (\d+)개인 수/.exec(말)!; return Number(r[1]) * Number(r[2]); };
      const 아닌 = m[1].split(', ').filter((x) => 값(x) !== 1000);
      expect(아닌).toHaveLength(1);
      return 아닌[0];
    },
  },
  { 이름: '몇천몇개', 수준: '중', 꼴: /의 값은 (\d+)원입니다\. (\d+)원으로는 몇 (컵|개)/, 답: (m) => `${Number(m[2]) / Number(m[1])}${m[3]}` },
  { 이름: '개수로네자리', 수준: '중', 꼴: /^1000이 (\d)개, 100이 (\d+)개, 10이 (\d)개, 1이 (\d)개인 네 자리 수는/, 답: (m) => String(Number(m[1]) * 1000 + Number(m[2]) * 100 + Number(m[3]) * 10 + Number(m[4])) },
  { 이름: '조건네자리', 수준: '상', 꼴: /천의 자리 숫자가 나타내는 값은 (\d+)입니다\. 백의 자리 숫자가 나타내는 값은 (\d+)입니다\. 십의 자리 숫자는 1보다 작습니다\. 일의 자리 숫자는 (\d)입니다/, 답: (m) => String(Number(m[1]) + Number(m[2]) + Number(m[3])) },
  {
    이름: '거꾸로처음수', 수준: '상', 꼴: /^어떤 네 자리 수에서 (.+) 뛰어 세었더니 (\d+)[이가] 되었습니다/, 답: (m) => {
      const 합 = [...m[1].matchAll(/(\d+)씩 (\d)번/g)].reduce((s, x) => s + Number(x[1]) * Number(x[2]), 0);
      return String(Number(m[2]) - 합);
    },
  },
  {
    이름: '네자리네모개수', 수준: '상', 꼴: /^0부터 9까지의 숫자 중 □ 안에 들어갈 수 있는 숫자는 모두 몇 개일까요\? (\d{4}) < (\d)(\d)□(\d)$/, 답: (m) => `${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => Number(m[1]) < Number(`${m[2]}${m[3]}${x}${m[4]}`)).length}개`,
  },
  {
    이름: '카드네자리작은', 수준: '상', 꼴: /^수 카드 ([\d, ]+)[을를] 한 번씩 모두 사용하여 만들 수 있는 네 자리 수 중 가장 작은 수/, 답: (m) => {
      const c = m[1].split(', '); let 최소 = Infinity;
      const 돌기 = (남: string[], 앞: string) => { if (!남.length) { if (앞[0] !== '0') 최소 = Math.min(최소, Number(앞)); return; } 남.forEach((x, i) => 돌기(남.filter((_, j) => j !== i), 앞 + x)); };
      돌기(c, '');
      return String(최소);
    },
  },
  {
    이름: '정해진자리개수', 수준: '상', 꼴: /^천의 자리 숫자가 (\d), 십의 자리 숫자가 (\d), 일의 자리 숫자가 (\d)인 네 자리 수 중에서 (\d+)보다 큰 수/, 답: (m) => `${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((h) => Number(`${m[1]}${h}${m[2]}${m[3]}`) > Number(m[4])).length}개`,
  },
  // ── 2-2 3단원 길이 재기 ──
  { 이름: '미터읽기', 수준: '하', 꼴: /^(\d)m를 바르게 읽은 것은/, 답: (m) => `${m[1]}미터` },
  { 이름: '미터센티읽기', 수준: '중', 꼴: /^(\d)m (\d)cm를 바르게 읽은 것은/, 답: (m) => `${m[1]}미터 ${m[2]}센티미터` },
  {
    이름: '미터알맞은', 수준: '하', 꼴: /^길이를 m 단위로 나타내기에 알맞은 것은/, 답: (_, q) => {
      const 긴 = q.choices.filter((c) => /게양대|교실|버스|운동장|복도/.test(c)); expect(긴).toHaveLength(1); return 긴[0];
    },
  },
  {
    이름: '오미터보다긴', 수준: '하', 꼴: /^길이가 5m보다 긴 것은/, 답: (_, q) => {
      const 긴 = q.choices.filter((c) => /기차|버스|수영장|건물/.test(c)); expect(긴).toHaveLength(1); return 긴[0];
    },
  },
  {
    이름: '네모미터개수', 수준: '상', 꼴: /□ 안에 들어갈 수 있는 숫자는 모두 몇 개일까요\? (\d)□(\d)cm ([<>]) (\d)m (\d+)cm$/, 답: (m) => {
      const 기준 = Number(m[4]) * 100 + Number(m[5]);
      return `${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => { const v = Number(`${m[1]}${x}${m[2]}`); return m[3] === '<' ? v < 기준 : v > 기준; }).length}개`;
    },
  },
  { 이름: '줄자눈금', 수준: '중', 꼴: /한쪽 끝은 줄자의 눈금 (\d+)에, 다른 쪽 끝은 눈금 (\d+)에 놓였습니다/, 답: (m) => `${Number(m[2]) - Number(m[1])}cm` },
  {
    이름: '더큰키합', 수준: '상', 꼴: /의 키는 (\d)m (\d+)cm이고, \S+ 키는 \S+ (\d+)cm 더 큽니다\. 두 사람의 키의 합/, 답: (m) => {
      const a = Number(m[1]) * 100 + Number(m[2]); const 합 = a * 2 + Number(m[3]); return String(Math.floor(합 / 100) + (합 % 100));
    },
  },
  {
    이름: '동그라미별', 수준: '상', 꼴: /^○와 ★에 알맞은 수의 합은 얼마일까요\? (\d)m ★cm \+ ○m (\d+)cm = (\d)m (\d+)cm$/, 답: (m) => String(Number(m[3]) - Number(m[1]) + Number(m[4]) - Number(m[2])),
  },
  {
    이름: '세식가장긴', 수준: '상', 꼴: /^가장 긴 길이는 □m △cm입니다\. □와 △에 알맞은 두 수의 합은 얼마일까요\? (.+)$/, 답: (m) => {
      const 값 = (s: string) => { const r = /^(?:(\d)m )?(\d+)cm$/.exec(s)!; return Number(r[1] ?? 0) * 100 + Number(r[2]); };
      const 큰 = Math.max(...m[1].split(', ').map((식) => 식.split('+').reduce((s, x) => s + 값(x), 0)));
      return String(Math.floor(큰 / 100) + (큰 % 100));
    },
  },
  {
    이름: '셋긴짧합', 수준: '상', 꼴: /^가장 긴 길이와 가장 짧은 길이의 합은 □m △cm입니다\. .+\? (.+)$/, 답: (m) => {
      const v = m[1].split(', ').map((s) => { const r = /^(?:(\d)m )?(\d+)cm$/.exec(s)!; return Number(r[1] ?? 0) * 100 + Number(r[2]); });
      const 합 = Math.max(...v) + Math.min(...v); return String(Math.floor(합 / 100) + (합 % 100));
    },
  },
  { 이름: '그림자차', 수준: '중', 꼴: /그림자의 길이는 (\d)m (\d+)cm이고, \S+ 그림자의 길이는 (\d)m (\d+)cm입니다\. 두 그림자의 길이의 차는 몇 cm/, 답: (m) => `${Math.abs((Number(m[3]) * 100 + Number(m[4])) - (Number(m[1]) * 100 + Number(m[2])))}cm` },
  {
    이름: '남은철사', 수준: '상', 꼴: /^길이가 (\d)m (\d+)cm인 철사에서 (\d+)cm를 잘라 냈습니다/, 답: (m) => { const 남 = Number(m[1]) * 100 + Number(m[2]) - Number(m[3]); return String(Math.floor(남 / 100) + (남 % 100)); },
  },
  {
    이름: '긴짧차', 수준: '상', 꼴: /^가장 긴 길이와 가장 짧은 길이의 차는 ㉠m ㉡cm입니다\. .+\? (.+)$/, 답: (m) => {
      const v = m[1].split(', ').map((s) => { const r = /^(?:(\d)m )?(\d+)cm$/.exec(s)!; return Number(r[1] ?? 0) * 100 + Number(r[2]); });
      const 차 = Math.max(...v) - Math.min(...v); return String(Math.floor(차 / 100) + (차 % 100));
    },
  },
  {
    이름: '걸음만남', 수준: '상', 꼴: /길이가 (\d+)cm인 신발장을 걸음으로 재었습니다\. \S+ 왼쪽 끝부터 (\d)걸음, \S+ 오른쪽 끝부터 (\d)걸음.+한 걸음이 약 (\d+)cm라면/, 답: (m) => `${(Number(m[1]) - Number(m[2]) * Number(m[4])) / Number(m[3])}cm`,
  },
  {
    이름: '삼각형나머지', 수준: '상', 꼴: /^세 변의 길이의 합이 (\d)m (\d+)cm인 삼각형이 있습니다\. 두 변의 길이가 각각 (\d)m (\d+)cm, (\d)m (\d+)cm일 때/, 답: (m) => {
      const [a, b, c, d, e, f] = m.slice(1).map(Number); const 남 = a * 100 + b - (c * 100 + d) - (e * 100 + f);
      return `${Math.floor(남 / 100) + (남 % 100 >= 50 ? 1 : 0)}m`;
    },
  },
];

describe('2학년 단원별 문제집 유형(하·중·상)', () => {
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
