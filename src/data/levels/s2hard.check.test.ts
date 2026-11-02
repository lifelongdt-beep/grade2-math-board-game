import { describe, expect, it } from 'vitest';
import type { Question } from '../../types';
import { lessons } from '../curriculum';
import { generateQuestions } from '../questionFactory';

// 2학년 고난도 상 문항(s2hard.ts)을 글만 읽고 다시 풀어 답과 견줍니다(s2hard.ts를 쓰지 않습니다).
const 상문항: { 차시: string; q: Question }[] = [];
for (const l of lessons) for (const q of generateQuestions(l, '상')) 상문항.push({ 차시: `${l.semester} ${l.unitNo}-${l.lessonNo}`, q });

const 수 = (t: string) => Number(t.replace(/[^\d]/g, ''));

type 풀이 = { 이름: string; 꼴: RegExp; 답: (m: RegExpExecArray, q: Question) => number | string };

// 칠교판 그림(QuestionVisualGraphic의 TangramGraphic)과 같은 꼭짓점으로 조각의 넓이를 셉니다.
const 칠교꼭짓점: Record<number, number[][]> = {
  1: [[18, 18], [242, 18], [130, 130]], 2: [[242, 18], [242, 242], [130, 130]], 3: [[18, 18], [18, 130], [74, 74]],
  4: [[18, 130], [74, 74], [130, 130], [74, 186]], 5: [[74, 186], [130, 130], [186, 186]], 6: [[74, 186], [186, 186], [242, 242], [130, 242]], 7: [[18, 130], [18, 242], [130, 242]],
};
const 넓이 = (p: number[][]) => Math.abs(p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
const 작은몇 = (n: number) => 넓이(칠교꼭짓점[n]) / 넓이(칠교꼭짓점[3]);
const 높이들 = (q: Question) => { const v = q.visual; if (v?.kind !== 'stack-iso') throw new Error('쌓기 그림 없음'); return v; };
const 개수 = (h: number[][]) => h.flat().reduce((a, b) => a + b, 0);
const 층 = (h: number[][], k: number) => h.flat().filter((v) => v >= k).length;

const 풀이들: 풀이[] = [
  { 이름: '칠교조각', 꼴: /3번 조각 여러 개를 겹치지 않게 이어 붙여 (\d)번 조각(?:과 (\d)번 조각을 이어 붙인 모양)?과 크기가 같은/, 답: (m) => 작은몇(+m[1]) + (m[2] ? 작은몇(+m[2]) : 0) },
  { 이름: '칠교방법', 꼴: /칠교판의 [12]번 조각과 크기와 모양이 똑같은 삼각형을 다른 조각 3개로/, 답: () => [4, 6, 7].filter((k) => 작은몇(3) + 작은몇(5) + 작은몇(k) === 작은몇(1)).length },
  { 이름: '쌓기남은', 꼴: /쌓기나무 (\d+)개를 가지고 있습니다\. 그림과 똑같은 모양으로 쌓고 나면/, 답: (m, q) => +m[1] - 개수(높이들(q).heights) },
  { 이름: '쌓기비교', 꼴: /^가와 나 모양을 그림과 똑같이 쌓으려고/, 답: (_, q) => { const [가, 나] = 높이들(q).items!; return Math.abs(개수(가.heights) - 개수(나.heights)); } },
  { 이름: '쌓기층', 꼴: /1층에 있는 쌓기나무는 2층에 있는 쌓기나무보다 몇 개 더/, 답: (_, q) => { const h = 높이들(q).heights; return 층(h, 1) - 층(h, 2); } },
  {
    이름: '모눈선', 꼴: /한 칸의 길이가 (\d+) cm인 모눈 위에 빨간 선을/, 답: (m, q) => {
      const v = q.visual;
      if (v?.kind !== 'grid-path') throw new Error('모눈 그림 없음');
      expect(v.cell).toBe(`${m[1]} cm`);
      let 길이 = 0;
      for (let k = 1; k < v.path.length; k += 1) {
        const [a, b] = [v.path[k - 1], v.path[k]];
        expect(a[0] === b[0] || a[1] === b[1], '가로나 세로로만 이어집니다').toBe(true);
        expect(b.every((t, i) => t >= 0 && t <= (i ? v.rows : v.cols)), '모눈 안에 있습니다').toBe(true);
        길이 += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
      }
      return 길이 * +m[1];
    },
  },
  { 이름: '접', 꼴: /'한 접'이라고 합니다\. .+ 10개씩 담긴 곶감 (\d+)접시/, 답: (m) => (+m[1] * 10) / 100 },
  { 이름: '동전', 꼴: /100원짜리 동전 (\d+)개와 10원짜리 동전 (\d+)개를 냈습니다/, 답: (m) => +m[1] * 100 + +m[2] * 10 },
  {
    이름: '공통숫자', 꼴: /공통으로 들어갈 수 있는 숫자는 무엇일까요\? (\d)(\d)(\d) > (\d)□(\d), (\d{3}) < □(\d)(\d)/, 답: (m) => {
      const 맞는 = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => +`${m[1]}${m[2]}${m[3]}` > +`${m[4]}${d}${m[5]}` && +m[6] < +`${d}${m[7]}${m[8]}`);
      return 맞는.length === 1 ? 맞는[0] : -1;
    },
  },
  { 이름: '네모범위', 꼴: /^(\d+)\+□ > (\d+)입니다\. □ 안에 알맞은 수 중 십의 자리 숫자가 1인/, 답: (m) => Array.from({ length: 10 }, (_, k) => 10 + k).filter((b) => +m[1] + b > +m[2]).length },
  { 이름: '차쌍', 꼴: /조건 1: ㉠-㉡=(\d+)입니다\. 조건 2: ㉠과 ㉡은 모두 0이 아닌 수이고 (\d+)보다 작습니다/, 답: (m) => { let n = 0; for (let b = 1; b < +m[2]; b += 1) if (b + +m[1] < +m[2]) n += 1; return n; } },
  {
    이름: '숫자세개', 꼴: /숫자 (\d), (\d), (\d)[을를] 모두 한 번씩 써서 □□-□=(\d+)[을를] 완성/, 답: (m) => {
      const d = [+m[1], +m[2], +m[3]];
      const 맞는 = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((o) => o.map((i) => d[i])).filter((o) => o[0] * 10 + o[1] - o[2] === +m[4]);
      return 맞는.length === 1 ? 맞는[0].join(', ') : 'X';
    },
  },
  {
    이름: '카드지우기', 꼴: /숫자 카드로 ([\d -=]+?)[을를] 만들었더니/, 답: (m) => {
      const 카드 = m[1].split(' ');
      const 맞는 = 카드.map((k, i) => ({ k, i })).filter(({ k }) => /\d/.test(k)).filter(({ i }) => {
        const r = /^(\d+)-(\d+)=(\d+)$/.exec(카드.filter((_, j) => j !== i).join(''));
        return r && +r[1] - +r[2] === +r[3];
      });
      return 맞는.length === 1 ? +맞는[0].k : -1;
    },
  },
  { 이름: '조건수', 꼴: /일의 자리 숫자는 (\d)입니다\. 이 수에서 (\d+)[을를] 뺀 수의 십의 자리 숫자는 (\d)입니다/, 답: (m) => { const 맞는 = Array.from({ length: 9 }, (_, i) => (i + 1) * 10 + +m[1]).filter((v) => v > +m[2] && Math.floor((v - +m[2]) / 10) === +m[3]); return 맞는.length === 1 ? 맞는[0] : -1; } },
  { 이름: '화살표', 꼴: /^(\d+)에서 (\d+)[을를] 빼면 ㉠이 되고, ㉠에 ㉡을 더하면 (\d+)[이가] 됩니다/, 답: (m) => { const a = +m[1] - +m[2]; return Math.abs(a - (+m[3] - a)); } },
  {
    이름: '연속세수', 꼴: /^(\d+), ㉠, (\d+), ㉡, ㉢, ㉣이 차례로 있습니다\. 이웃한 세 수의 합이 왼쪽부터 차례로 (\d+), (\d+), (\d+), (\d+)일 때/, 답: (m) => {
      const x = [+m[1], 0, +m[2], 0, 0, 0]; const s = [+m[3], +m[4], +m[5], +m[6]];
      x[1] = s[0] - x[0] - x[2]; x[3] = s[1] - x[1] - x[2]; x[4] = s[2] - x[2] - x[3]; x[5] = s[3] - x[3] - x[4];
      return x[5];
    },
  },
  { 이름: '어림차', 꼴: /^(\d+) cm인 끈의 길이를 \S+ 약 (\d+) cm, \S+ 약 (\d+) cm라고/, 답: (m) => Math.min(Math.abs(+m[2] - +m[1]), Math.abs(+m[3] - +m[1])) },
  { 이름: '두기준', 꼴: /안경을 쓴 학생 (\d+)명, 안경을 쓰지 않은 학생 \d+명입니다\. 안경을 쓴 남학생이 (\d+)명일 때/, 답: (m) => +m[1] - +m[2] },
  { 이름: '사는곳', 꼴: /동물 (\d+)마리를 사는 곳에 따라 .+ 하늘에 사는 동물은 (\d+)마리이고, 육지에 사는 동물이 물에 사는 동물보다 (\d+)마리 더 많습니다/, 답: (m) => (+m[1] - +m[2] - +m[3]) / 2 },
  { 이름: '다른배', 꼴: /\S+: (\d)의 (\d)배, \S+: (\d)의 □배/, 답: (m) => (+m[1] * +m[2]) / +m[3] },
  { 이름: '바퀴', 꼴: /바퀴는 4개입니다\. 주차장에 승용차가 한 줄에 (\d)대씩 (\d)줄로/, 답: (m) => +m[1] * +m[2] * 4 },
  { 이름: '늘어나기', 꼴: /처음 연필의 길이만큼 늘어납니다\. 주문을 (\d)번 외웠다면/, 답: (m) => +m[1] + 1 },
  { 이름: '하루먹이', 꼴: /토끼 (\d)마리가 하루에 먹는 당근이 (\d+)개일 때, 토끼 (\d)마리가 (\d)일 동안/, 답: (m) => (+m[2] / +m[1]) * +m[3] * +m[4] },
  {
    이름: '곱숫자', 꼴: /이고 (㉢=㉣\+1|㉣=㉢\+1)입니다\. ㉠ < ㉡일 때 ㉠×㉡=㉢㉣이 될 수 있는 곱 중에서 가장 (큰|작은) 값/, 답: (m) => {
      const 곱: number[] = [];
      for (let a = 1; a <= 9; a += 1) for (let b = a + 1; b <= 9; b += 1) {
        const p = a * b; const 십 = Math.floor(p / 10); const 일 = p % 10;
        if (p >= 10 && (m[1].startsWith('㉢') ? 십 === 일 + 1 : 일 === 십 + 1)) 곱.push(p);
      }
      return m[2] === '큰' ? Math.max(...곱) : Math.min(...곱);
    },
  },
];

describe('2학년 고난도 상 문항', () => {
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

  it('차시가 다루는 수의 범위를 넘지 않고, 하·중에는 나오지 않습니다', () => {
    for (const { q, 차시 } of 상문항) {
      if (!풀이들.some((p) => p.꼴.test(q.prompt))) continue;
      const l = lessons.find((one) => `${one.semester} ${one.unitNo}-${one.lessonNo}` === 차시)!;
      const 큰수 = Math.max(0, ...([q.prompt, ...q.choices].join(' ').match(/\d+/g) ?? []).map(Number));
      expect(큰수, `${차시} ${q.prompt}`).toBeLessThanOrEqual(l.scope.maxNumber);
    }
    for (const l of lessons) for (const d of ['하', '중'] as const) {
      for (const q of generateQuestions(l, d)) expect(풀이들.some((p) => p.꼴.test(q.prompt)), `${d} ${q.prompt}`).toBe(false);
    }
  });
});
