import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from '../../types';
import { lessons31 } from '../curriculum31';
import { lessons32 } from '../curriculum32';
import { lessons42 } from '../curriculum42';
import { lessons5 } from '../curriculum5';
import { lessons61 } from '../curriculum61';
import { lessons62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';

// ════════════════════════════════════════════════════════════════════
// 수준을 고르게 하려고 더한 3~6학년 문항을 글만 읽고 다시 풉니다
// ────────────────────────────────────────────────────────────────────
// 상에 사고형이, 하에 지식형이 모자라던 차시에 더한 문항입니다(s3·s42·
// s52·s61·s62). 만든 코드를 쓰지 않고 문제 글의 수로 답을 다시 구합니다.
// ════════════════════════════════════════════════════════════════════

const 모두: Question[] = [];
for (const l of [...lessons31, ...lessons32, ...lessons42, ...lessons5, ...lessons61, ...lessons62]) {
  for (const lv of ['하', '중', '상'] as Difficulty[]) 모두.push(...generateQuestions(l, lv));
}
const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 각형 = ['', '', '', '삼', '사', '오', '육', '칠', '팔'];

describe('수준을 고르게 하려고 더한 문항', () => {
  const 셈 = new Map<string, number>();
  const 센다 = (k: string) => 셈.set(k, (셈.get(k) ?? 0) + 1);
  it('답이 맞고 보기에 답이 하나뿐입니다', () => {
    for (const q of 모두) {
      const p = q.prompt;
      let m = /^분모가 (\d+)인 진분수는 모두 몇 개/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] - 1); 센다('진분수'); }
      m = /^분모가 (\d+)인 가분수 가운데 분자가 (\d+)보다 작은 것은/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[2] - +m[1]); 센다('가분수'); }
      m = /^(\d+)×(\d+)=(\d+)입니다\. (\d+)÷(\d+)의 몫은/.exec(p);
      if (m) { expect(+m[1] * +m[2], p).toBe(+m[3]); expect(수(q.answer), p).toBe(+m[4] / +m[5]); 센다('곱셈몫'); }
      m = /^(\S+) 모양 조각 (\d+)개를 빈틈없이 채우려면 정삼각형 모양 조각이 몇 개/.exec(p);
      const 넓이: Record<string, number> = { 정삼각형: 1, 마름모: 2, 사다리꼴: 3, 정육각형: 6 };
      if (m && 넓이[m[1]]) { expect(수(q.answer), p).toBe(넓이[m[1]] * +m[2]); 센다('조각하나'); }
      m = /^(\S+) 모양 조각 (\d+)개와 (\S+) 모양 조각 (\d+)개로 만든 모양을 정삼각형/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(넓이[m[1]] * +m[2] + 넓이[m[3]] * +m[4]); 센다('조각둘'); }
      m = /^(\d+) (이상|초과)이고 (\d+) (이하|미만)인 자연수 가운데 (짝수|홀수)는 모두 몇 개/.exec(p);
      if (m) {
        const [, a, 왼, b, 오, 종류] = m;
        let n = 0;
        for (let x = 1; x <= 200; x += 1) {
          const 안 = (왼 === '이상' ? x >= +a : x > +a) && (오 === '이하' ? x <= +b : x < +b);
          if (안 && (x % 2 === 0) === (종류 === '짝수')) n += 1;
        }
        expect(수(q.answer), p).toBe(n); 센다('범위');
      }
      m = /^(\d+)\/(\d+)÷(\d+)[을를] 분수의 곱셈으로 바르게/.exec(p);
      if (m) { expect(q.answer, p).toBe(`${m[1]}/${m[2]}×1/${m[3]}`); 센다('곱셈으로'); }
      m = /^(\S)각기둥의 전개도에서 밑면은 어떤 모양/.exec(p);
      if (m) { expect(q.answer, p).toBe(`${m[1]}각형`); 센다('밑면'); }
      m = /^밑면이 한 변 (\d+) cm인 정(\S)각형이고 높이가 \d+ cm인 \S+의 전개도입니다\. 옆면 (\d+)개/.exec(p);
      if (m) { expect(+m[3], p).toBe(각형.indexOf(m[2])); expect(수(q.answer), p).toBe(+m[1] * +m[3]); 센다('옆면가로'); }
      m = /전체의 (\d+)%, \S+ 전체의 (\d+)%입니다\. \S+ 또는/.exec(p);
      if (m) { expect(수(q.answer), p).toBe(+m[1] + +m[2]); 센다('띠합'); }
      m = /^전체 학생 (\d+)명을 .+ 전체의 (\d+)%일 때/.exec(p);
      if (m) { expect(수(q.answer), p).toBe((+m[1] * +m[2]) / 100); 센다('백분율'); }
      m = /^반지름이 (\d+) cm인 원 안에 네 꼭짓점이 원 위에 오도록 정사각형/.exec(p);
      if (m) { expect(수(q.answer.replace('cm²', '')), p).toBe(2 * +m[1] * +m[1]); 센다('원안'); }
      m = /^직각을 낀 두 변의 길이가 (\d+) cm, (\d+) cm인 .+ (\d+) cm인 변을 기준으로 .+ 원뿔의 (밑면의 지름|높이)/.exec(p);
      if (m) { expect(+m[3], p).toBe(+m[2]); expect(수(q.answer), p).toBe(m[4] === '높이' ? +m[2] : 2 * +m[1]); 센다('원뿔'); }
      if (/(선분, 반직선, 직선|직각삼각형|대각선|선대칭도형)에 대해 바르게 말한 사람은/.test(p)) { expect(q.choices.filter((c) => c === q.answer)).toHaveLength(1); 센다('바르게'); }
    }
  });
  it('더한 문항이 모두 쓰입니다', () => {
    for (const k of ['진분수', '가분수', '곱셈몫', '조각하나', '조각둘', '범위', '곱셈으로', '밑면', '옆면가로', '띠합', '백분율', '원안', '원뿔', '바르게']) expect(셈.get(k) ?? 0, k).toBeGreaterThan(0);
  });
});
