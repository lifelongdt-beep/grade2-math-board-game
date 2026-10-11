import { describe, expect, it } from 'vitest';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-1 4단원 곱셈 — 답을 처음부터 다시 셉니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 문항들: Array<{ lessonNo: number; q: Question }> = lessons31
  .filter((one) => one.unitNo === 4)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level).map((q) => ({ lessonNo: lesson.lessonNo, q }))));

const 올림꼴 = (a: number, m: number) => {
  const ones = (a % 10) * m;
  const tens = Math.floor(a / 10) * m + Math.floor(ones / 10);
  return { onesCarry: ones >= 10, tensOver: tens >= 10 };
};
const 몇십 = (n: number) => (n % 10 < 5 ? n - (n % 10) : n - (n % 10) + 10);

describe('3-1 4단원 곱셈', () => {
  it('계산·문장제·어떤 수·바르게 고치기의 답이 맞습니다', () => {
    for (const { q } of 문항들) {
      const 계산 = /^(\d+)×(\d+)[을를] 계산하면 얼마일까요\?$/.exec(q.prompt) ?? /^(\d+)×(\d+)[은는] 얼마일까요\?$/.exec(q.prompt);
      if (계산) expect(q.answer, q.prompt).toBe(String(Number(계산[1]) * Number(계산[2])));
      const 씩 = /(\d+)(?:개|장|번|명|자루)씩 (?:들어 있습니다\. )?(\d+)(?:상자|묶음|일|대)/.exec(q.prompt) ?? /하루에 (\d+)번씩 (\d+)일/.exec(q.prompt);
      if (씩 && /^\d+[가-힣]+$/.test(q.answer)) expect(Number.parseInt(q.answer, 10), q.prompt).toBe(Number(씩[1]) * Number(씩[2]));
      const 어떤 = /어떤 수를 (\d+)[으로]+ 나누었더니 몫이 (\d+)/.exec(q.prompt);
      if (어떤) expect(q.answer, q.prompt).toBe(String(Number(어떤[1]) * Number(어떤[2])));
      const 바르게 = /(\d+)×(\d+)[을를] \d+(?:이)?라고 계산했습니다/.exec(q.prompt);
      if (바르게) expect(q.answer, q.prompt).toBe(String(Number(바르게[1]) * Number(바르게[2])));
    }
  });

  it('2~5차시는 그 차시의 올림 꼴만 냅니다', () => {
    const 꼴: Record<number, (c: { onesCarry: boolean; tensOver: boolean }) => boolean> = {
      2: (c) => !c.onesCarry && !c.tensOver,
      3: (c) => !c.onesCarry && c.tensOver,
      4: (c) => c.onesCarry && !c.tensOver,
      5: (c) => c.onesCarry && c.tensOver,
    };
    for (const { lessonNo, q } of 문항들) {
      const rule = 꼴[lessonNo];
      if (!rule || /수 카드|가장 큰/.test(q.prompt)) continue;
      const m = /(\d{2})×(\d)(?!\d)/.exec(q.prompt) ?? (() => {
        const w = /(\d{2})(?:개|장|번|명|자루)씩 (?:들어 있습니다\. )?(\d)(?:상자|묶음|일|대)/.exec(q.prompt) ?? /하루에 (\d{2})번씩 (\d)일/.exec(q.prompt) ?? /(\d)[으로]+ 나누었더니 몫이 (\d{2})/.exec(q.prompt);
        return w && /나누었더니/.test(q.prompt) ? [w[0], w[2], w[1]] as unknown as RegExpExecArray : w;
      })();
      if (!m) continue;
      expect(rule(올림꼴(Number(m[1]), Number(m[2]))), `${lessonNo}차시 ${m[1]}×${m[2]} — ${q.prompt}`).toBe(true);
    }
  });

  it('어림셈은 두 자리 수를 가까운 몇십으로 바꾸어 곱하고, 판단은 실제 계산과 맞습니다', () => {
    for (const { lessonNo, q } of 문항들.filter((one) => one.lessonNo === 6)) {
      const 식 = /^(\d+)×(\d)의 계산 결과를 어림하려고/.exec(q.prompt);
      if (식) expect(q.answer, q.prompt).toBe(`${몇십(Number(식[1]))}×${식[2]}`);
      const 약 = /^약 (\d+)/.exec(q.answer);
      const 값들 = /(\d+)(?:개| cm)씩? .*?(\d)(?:상자|개|봉지)/.exec(q.prompt) ?? /(\d+) cm 필요합니다\. 리본 (\d)개/.exec(q.prompt);
      if (약 && 값들) expect(Number(약[1]), q.prompt).toBe(몇십(Number(값들[1])) * Number(값들[2]));
      const 판단 = /(\d+)×(\d)[을를] 계산해서 (\d+)[을를] 구했습니다/.exec(q.prompt);
      if (판단) {
        const exact = Number(판단[1]) * Number(판단[2]);
        expect(q.answer.startsWith(Number(판단[3]) === exact ? '바르게' : '잘못'), q.prompt).toBe(true);
      }
      for (const m of q.prompt.matchAll(/(\d{2})×/g)) expect(Number(m[1]) % 10, `${lessonNo} ${q.prompt}`).not.toBe(5);
      for (const c of q.choices) for (const m of String(c).matchAll(/(\d+)×(\d+)/g)) expect(Number(m[2]), `${c} — ${q.prompt}`).toBeLessThanOrEqual(10);
    }
  });

  it('수 카드 문항의 답이 모든 경우 가운데 가장 큰 곱입니다', () => {
    for (const { q } of 문항들) {
      const m = /수 카드 (\d), (\d), (\d)/.exec(q.prompt);
      if (!m) continue;
      const [x, y, z] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const 경우 = [[x, y, z], [x, z, y], [y, x, z], [y, z, x], [z, x, y], [z, y, x]].map(([p, r, t]) => ({ text: `${p}${r}×${t}`, v: (p * 10 + r) * t }));
      const best = 경우.reduce((a, b) => (b.v > a.v ? b : a));
      expect(q.answer, q.prompt).toBe(best.text);
    }
  });

  it('보기는 넷이고 서로 다르며 정답이 그 안에 있습니다', () => {
    for (const { q } of 문항들) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices[q.answerIndex], q.prompt).toBe(q.answer);
    }
  });
});
