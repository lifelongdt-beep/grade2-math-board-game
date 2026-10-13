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
    }
  });
  it('새 문항이 모두 쓰입니다', () => {
    for (const k of ['읽기', '줄', '가르기', '두걸음', '십', '바르게', '긴바늘']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});
