import { describe, expect, it } from 'vitest';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-1 3단원 나눗셈 — 답을 처음부터 다시 셉니다
// ────────────────────────────────────────────────────────────────────
// 이 단원의 나눗셈은 곱셈구구 안에서 나누어떨어지는 것뿐입니다(나머지는
// 3-2). 문제 글을 다시 읽어 몫을 구하고, 화면에 나오는 모든 식이 곱셈구구
// 범위에 있는지(아이가 셈할 수 있는지)도 봅니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 문항들: Array<{ lessonNo: number; q: Question }> = lessons31
  .filter((one) => one.unitNo === 3)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level).map((q) => ({ lessonNo: lesson.lessonNo, q }))));

const 글 = (q: Question) => [q.prompt, ...q.choices.map(String), ...q.support.steps].join(' ');

describe('3-1 3단원 나눗셈', () => {
  it('나머지를 다루지 않고, 0으로 나누거나 0을 나누지 않습니다', () => {
    for (const { q } of 문항들) {
      expect(글(q), q.id).not.toMatch(/나머지/);
      for (const m of 글(q).matchAll(/(\d+)÷(\d+)/g)) {
        expect(Number(m[1]), q.prompt).toBeGreaterThan(0);
        expect(Number(m[2]), q.prompt).toBeGreaterThan(0);
      }
    }
  });

  it('맞다고 말하는 나눗셈식은 곱셈구구 안에서 나누어떨어집니다', () => {
    for (const { q } of 문항들) {
      // 정답과 풀이 속의 식은 모두 참이어야 합니다.
      const 참글 = [q.answer, ...q.support.steps].join(' ');
      for (const m of 참글.matchAll(/(\d+)÷(\d+)=(\d+)/g)) {
        const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
        expect(b * c, `${m[0]} — ${q.prompt}`).toBe(a);
        expect(b <= 9 && c <= 9, `${m[0]} — ${q.prompt}`).toBe(true);
      }
      for (const m of 참글.matchAll(/(\d+)×(\d+)=(\d+)/g)) {
        expect(Number(m[1]) * Number(m[2]), `${m[0]} — ${q.prompt}`).toBe(Number(m[3]));
      }
    }
  });

  it('보기의 곱셈식은 곱셈구구 범위(두 수가 9 이하)입니다', () => {
    for (const { q } of 문항들) {
      for (const m of q.choices.join(' ').matchAll(/(\d+)×(\d+)/g)) {
        expect(Number(m[1]) <= 9 && Number(m[2]) <= 9, `${m[0]} — ${q.prompt}`).toBe(true);
      }
    }
  });

  it('셈이 맞는 다른 나눗셈식(a÷q=b)을 오답으로 두지 않습니다', () => {
    for (const { q } of 문항들) {
      const 정답 = /^(\d+)÷(\d+)=(\d+)$/.exec(q.answer);
      if (!정답) continue;
      expect(q.choices, q.prompt).not.toContain(`${정답[1]}÷${정답[3]}=${정답[2]}`);
    }
  });

  it('문장제와 계산의 답이 맞습니다', () => {
    for (const { q } of 문항들) {
      const 계산 = /^(\d+)÷(\d+)[을를] 계산하면 몫은/.exec(q.prompt);
      if (계산) expect(q.answer, q.prompt).toBe(String(Number(계산[1]) / Number(계산[2])));
      const 나누어 = /(\d+)(?:개|장|자루|권)[을를] (\d+)명(?:에게|이) 똑같이 나누어/.exec(q.prompt);
      const 수답 = /^\d+[가-힣]*$/.test(q.answer);
      if (나누어 && 수답 && !/봉지/.test(q.prompt)) expect(Number.parseInt(q.answer, 10), q.prompt).toBe(Number(나누어[1]) / Number(나누어[2]));
      const 씩 = /(\d+)(?:개|자루|명)[을를이]? (?:한 접시에|한 명에게|한 상자에|한 모둠에) (\d+)(?:개|자루|명)씩/.exec(q.prompt);
      if (씩 && 수답) expect(Number.parseInt(q.answer, 10), q.prompt).toBe(Number(씩[1]) / Number(씩[2]));
      const 빈칸앞 = /^□÷(\d+)=(\d+)에서/.exec(q.prompt);
      if (빈칸앞) expect(q.answer, q.prompt).toBe(String(Number(빈칸앞[1]) * Number(빈칸앞[2])));
      const 빈칸뒤 = /^(\d+)÷□=(\d+)에서/.exec(q.prompt);
      if (빈칸뒤) expect(q.answer, q.prompt).toBe(String(Number(빈칸뒤[1]) / Number(빈칸뒤[2])));
      const 뺄셈 = /^뺄셈식 (\d+)((?:-\d+)+)=0/.exec(q.prompt);
      if (뺄셈) {
        const 빼는수 = 뺄셈[2].split('-').filter(Boolean).map(Number);
        expect(빼는수.reduce((s, v) => s + v, 0), q.prompt).toBe(Number(뺄셈[1]));
        expect(q.answer, q.prompt).toBe(`${뺄셈[1]}÷${빼는수[0]}=${빼는수.length}`);
      }
    }
  });

  it('2~3차시(곱셈과의 관계를 배우기 전)는 나누어지는 수가 40 이하입니다', () => {
    for (const { lessonNo, q } of 문항들.filter((one) => one.lessonNo === 2 || one.lessonNo === 3)) {
      for (const m of q.prompt.matchAll(/(\d+)÷/g)) expect(Number(m[1]), `${lessonNo}차시 ${q.prompt}`).toBeLessThanOrEqual(40);
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
