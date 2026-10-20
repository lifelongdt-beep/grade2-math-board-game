import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons11 } from '../curriculum11';
import { lessons12 } from '../curriculum12';
import { generateQuestions } from '../questionFactory';

// 1학년 수준 문항을 글만 읽고 다시 풀어 답과 견줍니다(s1.ts를 쓰지 않습니다).
const 모두: Question[] = [];
for (const l of [...lessons11, ...lessons12]) for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
const 수 = (t: string) => Number(t.replace(/[^\d]/g, ''));
const 째 = ['', '첫째', '둘째', '셋째', '넷째', '다섯째'];

describe('1학년 수준 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞습니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^'(.+)'[을를] 바르게 읽은 것은/.exec(p);
      if (m && /(개|장|월|층|번 버스)'/.test(p)) {
        const 개수 = /(개|장)$/.test(m[1]);
        expect(/[일이삼사오육칠팔구십]/.test(q.answer.split(' ')[개수 ? 1 : 0].replace(/^(사과|색종이)$/, '')) === !개수 || 개수, p).toBe(true);
        if (개수) expect(/[일이삼사오육칠팔구]\s?(개|장)$/.test(q.answer) && !/(하나|둘|셋|넷|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|스물|스무|서른|마흔|쉰|예순|일흔|여든|아흔)/.test(q.answer), p).toBe(false);
        센다('읽기');
      }
      m = /지우는 앞에서 (\S+)이고, 뒤에서 (\S+)입니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(째.indexOf(m[1]) + 째.indexOf(m[2]) - 1); 센다('줄'); }
      m = /^구슬 (\d+)개를 두 상자에 나누어 담으려고/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] - 1); 센다('가르기'); }
      m = /^바구니에 사과가 (\d+)개 있고, 배는 사과보다 (\d+)개 적게/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(2 * +m[1] - +m[2]); 센다('두걸음'); }
      m = /^두 수를 더하면 10이고, 큰 수에서 작은 수를 빼면 (\d+)입니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((10 + +m[1]) / 2); 센다('십'); }
      m = /^(\d+)시( 30분)?[을를] 나타낼 때 긴바늘은 숫자 몇을/.exec(p);
      if (m) { expect(q.answer, p).toBe(m[2] ? '6' : '12'); 센다('긴바늘'); }
      if (/에 대해 바르게 말한 사람은 누구일까요\?/.test(p)) { expect(q.choices).toContain(q.answer); 센다('바르게'); }
      m = /(\d+)개 있었습니다\. 한 번에 1개씩 .+ 0개가 되었습니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1]); 센다('영까지'); }
      m = /왼손에 (\d+)\D+, 오른손에 (\d+)\D+ 있습니다\. 모두 10/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(10 - +m[1] - +m[2]); 센다('십까지'); }
      m = /^10은 (\d+)[와과] 몇으로 가를 수/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(10 - +m[1]); 센다('십가르기'); }
      m = /^(\d+)[을를] (\d+)[와과] □[으로]+ 가르고, □[을를] 다시 (\d+)[와과] 몇으로/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] - +m[2] - +m[3]); 센다('두번가르기'); }
      m = /10\D+씩 묶음 (\d)개와 낱개 (\d)\D+ 있습니다\. 10\D+씩 묶음을 하나 더/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(10 - +m[2]); 센다('묶음하나'); }
      m = /10\D+씩 묶음 (\d)개 있었습니다\. 10\D+씩 묶음 (\d)개를 더 받았습니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] + +m[2]) * 10); 센다('몇십모두'); }
      m = /^\S+ (\d+)\D+ 한 봉지에 10\D+씩 담으면 몇 봉지/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] / 10); 센다('봉지'); }
      m = /^'(\S+ )?(\d+)(개|장|번 버스)'[을를] 바르게 읽은 것은/.exec(p);
      if (m && +m[2] % 10 === 0 && +m[2] >= 60) {
        const 우리 = ['예순', '일흔', '여든', '아흔'][+m[2] / 10 - 6];
        expect(q.answer, p).toBe(m[3] === '번 버스' ? `${'육칠팔구'[+m[2] / 10 - 6]}십 번 버스` : `${우리} ${m[3]}`);
        센다('몇십읽기');
      }
      m = /^어떤 수는 (짝수|홀수)입니다\. 이 수는 (\d+)보다 크고 (\d+)보다 작습니다/.exec(p);
      if (m) {
        const [, 종류, 아래, 위] = m;
        const 답들 = Array.from({ length: +위 - +아래 - 1 }, (_, k) => +아래 + 1 + k).filter((n) => (n % 2 === 0) === (종류 === '짝수'));
        expect(답들, p).toEqual([수(q.answer)]); 센다('짝홀');
      }
      m = /언니에게 (\d+)\D+ 더 받았더니 모두 10/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(10 - +m[1]); 센다('처음수'); }
      m = /10\D+ 있었습니다\. 몇 \D+ (\d+)\D+ 남았습니다/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(10 - +m[1]); 센다('먹은수'); }
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['읽기', '줄', '가르기', '두걸음', '십', '바르게', '긴바늘', '영까지', '십까지', '십가르기', '두번가르기', '묶음하나', '몇십모두', '봉지', '몇십읽기', '짝홀', '처음수', '먹은수']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});
