import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons41 } from '../curriculum41';
import { generateQuestions } from '../questionFactory';

// 4-1 상 수준 사고력 문항을 글만 읽고 다시 풀어 답과 견줍니다(s41.ts를 쓰지 않습니다).
const 모두: Array<Question & { 차시: string }> = [];
for (const l of lessons41) for (const lv of ['하', '중', '상'] as Difficulty[]) for (const q of generateQuestions(l, lv)) 모두.push({ ...q, 차시: l.id });
const 수 = (t: string) => Number(t.replace(/[^\d]/g, ''));
const 정각각 = (h: number) => Math.min(h % 12, 12 - (h % 12)) * 30;

describe('4-1 상 수준 사고력 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);

  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /1000원짜리 지폐 (\d+)장과 100원짜리 동전 (\d+)개.*100원짜리 동전이 몇 개 더/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((10000 - 1000 * +m[1] - 100 * +m[2]) / 100); 센다('만'); }
      m = /10만 원짜리 수표 (\d+)장, 만 원짜리 지폐 (\d+)장, 천 원짜리 지폐 (\d+)장.*100만 원이 되려면/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(1000000 - 100000 * +m[1] - 10000 * +m[2] - 1000 * +m[3]); 센다('수표'); }
      m = /만의 자리 숫자는 (\d), 백의 자리 숫자는 (\d), 일의 자리 숫자는 (\d)입니다. 천의 자리와 십의 자리에는 (\d)[과와] (\d)[이가]/.exec(p);
      if (m) {
        const 큰 = Math.max(+m[4], +m[5]); const 작은 = Math.min(+m[4], +m[5]);
        expect(q.answer, p).toBe(`${m[1]}${큰}${m[2]}${작은}${m[3]}`); 센다('조건');
      }
      m = /^숫자 (\d)[이가] 나타내는 값이 가장 큰 수/.exec(p);
      if (m) {
        const 값 = (n: string) => 10 ** (n.length - 1 - n.indexOf(m![1]));
        const 가장 = Math.max(...q.choices.map(값));
        expect(값(q.answer), p).toBe(가장);
        expect(q.choices.filter((c) => 값(c) === 가장).length).toBe(1); 센다('자리값');
      }
      m = /^(\d)□(\d+) < (\d+)입니다/.exec(p);
      if (m) {
        const n = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => Number(`${m![1]}${d}${m![2]}`) < Number(m![3])).length;
        expect(수(q.answer), p).toBe(n); 센다('□');
      }
      m = /다른 쪽 눈금을 읽어 (\d+)°라고/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(180 - +m[1]); 센다('각도기'); }
      m = /^(.*) 가운데 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각이 (예각|둔각)인 시각을 모두 고른/.exec(p);
      if (m) {
        const 시들 = [...m[1].matchAll(/(㉠|㉡|㉢|㉣) (\d+)시/g)];
        const 답 = 시들.filter((x) => (m![2] === '예각' ? 정각각(+x[2]) < 90 : 정각각(+x[2]) > 90)).map((x) => x[1]).join(', ');
        expect(q.answer, p).toBe(답); 센다('시계');
      }
      m = /^(\S+?)[은는] 각도를 (\d+)°, (\S+?)[은는] (\d+)°로 어림했습니다. 각도기로 재어 보니 (\d+)°/.exec(p);
      if (m) { const 실 = +m[5]; expect(q.answer, p).toBe(Math.abs(+m[2] - 실) < Math.abs(+m[4] - 실) ? m[1] : m[3]); 센다('어림'); }
      m = /두 각의 크기의 합은 (\d+)°이고, 큰 각은 작은 각보다 (\d+)° 큽니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] - +m[2]) / 2); 센다('합차'); }
      if (/^삼각형의 세 각의 크기가 될 수 있는 것/.test(p)) {
        const 합 = (c: string) => c.match(/\d+/g)!.map(Number).reduce((s, x) => s + x, 0);
        expect(합(q.answer)).toBe(180);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(합(c), c).not.toBe(180);
        센다('삼각형');
      }
      if (/^사각형의 네 각의 크기가 될 수 없는 것/.test(p)) {
        const 합 = (c: string) => c.match(/\d+/g)!.map(Number).reduce((s, x) => s + x, 0);
        expect(합(q.answer)).not.toBe(360);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(합(c), c).toBe(360);
        센다('사각형');
      }
      m = /한 개에 (\d+)원인 공책을 (\d+)권 사려고 합니다. (\d+)원으로/.exec(p);
      if (m) { const 필요 = +m[1] * +m[2]; expect(q.answer, p).toBe(`${+m[3] >= 필요 ? '살 수 있습니다' : '살 수 없습니다'}. 필요한 돈은 ${필요}원입니다.`); 센다('공책'); }
      m = /^(\d+)×(\d+)[을를] (\d+)×(\d+)[으로]+ 어림하였습니다/.exec(p);
      if (m) { expect(q.answer, p).toBe(+m[1] * +m[2] < +m[3] * +m[4] ? '실제 곱이 어림한 값보다 작습니다.' : '실제 곱이 어림한 값보다 큽니다.'); 센다('어림곱'); }
      m = /한 상자에 (\d+)개씩 (\d+)상자 땄습니다. 그중 (\d+)개를/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] * +m[2] - +m[3]); 센다('사과'); }
      m = /도형을 (\S+)으로 (\d+)번 뒤집었습니다/.exec(p);
      if (m) { expect(q.answer === '처음 도형과 같습니다.', p).toBe(+m[2] % 2 === 0); 센다('뒤집기'); }
      m = /도형을 (시계 방향|시계 반대 방향)으로 (\d+)°만큼 돌린 것과 결과가 같은 것/.exec(p);
      if (m) {
        const 반대 = m[1] === '시계 방향' ? '시계 반대 방향' : '시계 방향';
        expect(q.answer, p).toBe(`${반대}으로 ${360 - +m[2]}°만큼 돌린 것`); 센다('돌리기');
      }
      m = /세로 눈금 한 칸이 (\d+)명인 막대그래프에서 어떤 막대의 길이가 (\d+)칸입니다. 이 자료를 세로 눈금 한 칸이 (\d+)명인/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] * +m[2]) / +m[3]); 센다('눈금'); }
      if (/가장 많은 항목은 가장 적은 항목의 몇 배/.test(p) && q.visual?.kind === 'bar-graph') {
        const vs = q.visual.bars.map((b) => b.value);
        expect(수(q.answer), p).toBe(Math.max(...vs) / Math.min(...vs)); 센다('몇배');
      }
      if (/특별 급식으로 한 가지 메뉴/.test(p) && q.visual?.kind === 'bar-graph') {
        const 큰 = q.visual.bars.reduce((a, b) => (b.value > a.value ? b : a));
        expect(q.answer.startsWith(`${큰.name},`), p).toBe(true); 센다('급식');
      }
      m = /첫째는 (\d+)개, 둘째는 (\d+)개, 셋째는 (\d+)개, 넷째는 (\d+)개입니다. 바둑돌이 (\d+)개인 것은 몇째/.exec(p);
      if (m) { const d = +m[2] - +m[1]; expect(수(q.answer), p).toBe((+m[5] - +m[1]) / d + 1); 센다('몇째'); }
      m = /^수의 배열 ([\d, ]+)에서 찾은 규칙/.exec(p);
      if (m) { const xs = m[1].split(', ').map(Number); expect(q.answer).toBe(`${xs[1] - xs[0]}씩 커지는 규칙입니다.`); 센다('규칙'); }
      m = /계산 결과가 (\d+)인 계산식은 홀수를 몇 개/.exec(p);
      if (m) { expect(수(q.answer) ** 2, p).toBe(+m[1]); 센다('홀수'); }
      m = /11×(\d)=\d+, 22×\d=\d+, 33×\d=\d+에서 규칙을 찾을 때, (\d)째 계산식의 계산 결과/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(11 * +m[2] * +m[1]); 센다('계산식'); }
      if (/등호\(=\)를 써서 바르게 나타낸 식/.test(p)) {
        const 값 = (e: string) => Function(`return (${e.replace(/×/g, '*')})`)() as number;
        const 맞나 = (c: string) => { const [l, r] = c.split('='); return 값(l) === 값(r); };
        expect(맞나(q.answer), q.answer).toBe(true);
        for (const c of q.choices.filter((c) => c !== q.answer)) expect(맞나(c), c).toBe(false);
        센다('등호');
      }
      m = /버스 한 대에 (\d+)명씩 탈 수 있습니다. 학생 (\d+)명/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(Math.ceil(+m[2] / +m[1])); 센다('버스'); }
      m = /^삼각형의 두 각이 (\d+)°, (\d+)°입니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(180 - +m[1] - +m[2]); 센다('삼각합'); }
      m = /^사각형의 세 각이 (\d+)°, (\d+)°, (\d+)°입니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(360 - +m[1] - +m[2] - +m[3]); 센다('사각합'); }
      m = /^([\d, ]+), □에서 □에 알맞은 수/.exec(p);
      if (m) { const xs = m[1].split(', ').map(Number); expect(수(q.answer), p).toBe(xs[3] + xs[1] - xs[0]); 센다('다음수'); }
      m = /^(\d+)씩 뛰어 세면 어느 자리 숫자가/.exec(p);
      if (m) { expect(q.answer, p).toBe(`${['만', '십만', '백만', '천만', '억'][m[1].length - 5]}의 자리`); 센다('뛰어'); }
      m = /^점을 오른쪽으로 (\d+)칸 이동한 다음, 왼쪽으로 (\d+)칸, 위쪽으로 (\d+)칸 이동했습니다/.exec(p);
      if (m) {
        const 가로 = +m[1] - +m[2];
        expect(q.answer, p).toBe(`${가로 > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(가로)}칸, 위쪽으로 ${m[3]}칸`); 센다('두번이동');
      }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) {
        expect(q.choices).toContain(q.answer); 센다('바르게');
      }
    }
  });

  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['만', '수표', '조건', '자리값', '□', '각도기', '시계', '어림', '합차', '삼각형', '사각형', '공책', '어림곱', '사과', '뒤집기', '돌리기', '눈금', '몇배', '급식', '몇째', '규칙', '홀수', '계산식', '등호', '바르게', '버스', '삼각합', '사각합', '다음수', '뛰어', '두번이동']) {
      expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
    }
  });
});
