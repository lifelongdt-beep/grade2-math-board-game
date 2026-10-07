import { describe, expect, it } from 'vitest';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-1 문항의 답을 처음부터 다시 셉니다
// ────────────────────────────────────────────────────────────────────
// 생성기의 계산을 하나도 가져오지 않습니다. 화면에 나갈 문제 글을
// 다시 읽고 여기 적은 셈으로 풀어 답과 맞춰 봅니다. 답·문제·해설이
// 틀리면 아이는 그것을 배웁니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];

const 문항들 = (unitNo: number, lessonNo?: number) => {
  const out: Array<{ lessonNo: number; level: Difficulty; q: Question }> = [];
  for (const lesson of lessons31.filter((one) => one.unitNo === unitNo && (lessonNo === undefined || one.lessonNo === lessonNo))) {
    for (const level of levels) {
      for (const q of generateQuestions(lesson, level)) out.push({ lessonNo: lesson.lessonNo, level, q });
    }
  }
  return out;
};

// ── 여기서 쓰는 셈 ─────────────────────────────────────────────────
const 자리 = (n: number) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10];
const 받아올림수 = (a: number, b: number) => {
  let carry = 0;
  let count = 0;
  for (let p = 0; p < 3; p += 1) {
    const sum = 자리(a)[p] + 자리(b)[p] + carry;
    carry = sum >= 10 ? 1 : 0;
    count += carry;
  }
  return count;
};
const 받아내림수 = (a: number, b: number) => {
  let borrow = 0;
  let count = 0;
  for (let p = 0; p < 3; p += 1) {
    const top = 자리(a)[p] - borrow;
    borrow = top < 자리(b)[p] ? 1 : 0;
    count += borrow;
  }
  return count;
};
const 가까운몇백 = (n: number) => (n % 100 < 50 ? n - (n % 100) : n - (n % 100) + 100);

describe('3-1 1단원 덧셈과 뺄셈', () => {
  const all = 문항들(1);

  it('문항이 차시·수준마다 서른 개 가까이 있습니다', () => {
    for (const lesson of lessons31.filter((one) => one.unitNo === 1)) {
      for (const level of levels) {
        const count = generateQuestions(lesson, level).length;
        expect(count, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('보기는 넷이고 서로 다르며 정답이 그 안에 있습니다', () => {
    for (const { q } of all) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices[q.answerIndex], q.prompt).toBe(q.answer);
    }
  });

  it('“a+b를 계산하면”의 답이 맞습니다', () => {
    for (const { q } of all) {
      const m = /^(\d+)([+-])(\d+)[을를] 계산하면 얼마일까요\?$/.exec(q.prompt);
      if (!m) continue;
      const a = Number(m[1]);
      const b = Number(m[3]);
      expect(q.answer, q.prompt).toBe(String(m[2] === '+' ? a + b : a - b));
    }
  });

  it('문장제의 답이 문제의 두 수로 계산한 값과 같습니다', () => {
    for (const { lessonNo, q } of all) {
      if (![2, 3, 4, 6, 7, 8].includes(lessonNo)) continue;
      const nums = [...q.prompt.matchAll(/(\d+)(명|권|개|번|장|마리)/g)].map((m) => Number(m[1]));
      const 단위답 = /^(\d+)(명|권|개|번|장|마리)$/.exec(q.answer);
      if (nums.length !== 2 || !단위답) continue;
      const [a, b] = nums;
      const expected = lessonNo <= 4 ? a + b : a - b;
      expect(Number(단위답[1]), q.prompt).toBe(expected);
    }
  });

  it('계산 차시의 식은 그 차시의 받아올림·받아내림 횟수를 지킵니다', () => {
    const 횟수: Record<number, (n: number) => boolean> = {
      2: (n) => n === 0, 3: (n) => n === 1, 4: (n) => n >= 2,
      6: (n) => n === 0, 7: (n) => n === 1, 8: (n) => n === 2,
    };
    const 나쁨: string[] = [];
    for (const { lessonNo, q } of all) {
      const rule = 횟수[lessonNo];
      if (!rule) continue;
      const 덧셈차시 = lessonNo <= 4;
      // 문제에 나온 세 자리 수 두 개의 계산(식 또는 문장)을 다시 셉니다.
      const 식 = /(\d{3})([+-])(\d{3})/.exec(q.prompt.replace(/□/g, '0'));
      const 문장 = [...q.prompt.matchAll(/(\d{3})(명|권|개|번|장|마리)/g)].map((m) => Number(m[1]));
      let a: number | null = null;
      let b: number | null = null;
      if (식 && !q.prompt.includes('□')) {
        a = Number(식[1]);
        b = Number(식[3]);
      } else if (문장.length === 2) {
        [a, b] = 문장;
      }
      if (a === null || b === null) continue;
      // 어떤 수 문항은 거꾸로 셈을 합니다(□-b=a → a+b).
      if (/어떤 수에서 (\d+)[을를] 뺐더니 (\d+)/.test(q.prompt)) {
        const m = /어떤 수에서 (\d+)[을를] 뺐더니 (\d+)/.exec(q.prompt)!;
        [a, b] = [Number(m[2]), Number(m[1])];
      }
      if (/어떤 수에 (\d+)[을를] 더했더니 (\d+)/.test(q.prompt)) {
        const m = /어떤 수에 (\d+)[을를] 더했더니 (\d+)/.exec(q.prompt)!;
        [a, b] = [Number(m[2]), Number(m[1])];
      }
      const n = 덧셈차시 ? 받아올림수(a, b) : 받아내림수(a, b);
      if (!rule(n)) 나쁨.push(`${lessonNo}차시 ${a}${덧셈차시 ? '+' : '-'}${b} (${n}번) — ${q.prompt.slice(0, 50)}`);
    }
    expect(나쁨).toEqual([]);
  });

  it('3차시(받아올림 한 번)의 합은 세 자리 수입니다', () => {
    for (const { q } of 문항들(1, 3)) {
      const m = /^(\d+)\+(\d+)[을를] 계산하면/.exec(q.prompt);
      if (m) expect(Number(m[1]) + Number(m[2]), q.prompt).toBeLessThan(1000);
    }
  });

  it('어림셈은 두 수를 가까운 몇백으로 바꾸어 계산합니다', () => {
    for (const { q } of [...문항들(1, 5), ...문항들(1, 9)]) {
      const 약 = /^약 (\d+)/.exec(q.answer);
      const nums = [...q.prompt.matchAll(/(\d{3})(?=명|개| m)/g)].map((m) => Number(m[1]));
      if (약 && nums.length === 2) {
        const [a, b] = nums;
        const plus = /모두|거쳐|동안/.test(q.prompt);
        const expected = plus ? 가까운몇백(a) + 가까운몇백(b) : 가까운몇백(a) - 가까운몇백(b);
        expect(Number(약[1]), q.prompt).toBe(expected);
      }
      const 식 = /^(\d+)([+-])(\d+)의 어림셈을/.exec(q.prompt);
      if (식) {
        expect(q.answer, q.prompt).toBe(`${가까운몇백(Number(식[1]))}${식[2]}${가까운몇백(Number(식[3]))}`);
      }
      const 하나 = /^(\d+)[을를] 가까운 몇백으로 어림하면/.exec(q.prompt);
      if (하나) expect(q.answer, q.prompt).toBe(String(가까운몇백(Number(하나[1]))));
      // 몇백오십처럼 가운데에 걸리는 수는 어림할 쪽이 정해지지 않습니다.
      for (const m of q.prompt.matchAll(/\d{3}/g)) expect(Number(m[0]) % 100, q.prompt).not.toBe(50);
    }
  });

  it('어림셈으로 판단한 것이 실제 계산과 어긋나지 않습니다', () => {
    for (const { q } of [...문항들(1, 5), ...문항들(1, 9)]) {
      const m = /(\d+)명.*?(\d+)명.*?"[^"]*?(\d+)명보다 (적습니다|많습니다)/.exec(q.prompt);
      if (!m) continue;
      const a = Number(m[1]);
      const b = Number(m[2]);
      const 기준 = Number(m[3]);
      const exact = q.prompt.includes('차는') ? a - b : a + b;
      const 참 = m[4] === '적습니다' ? exact < 기준 : exact > 기준;
      expect(q.answer.startsWith(참 ? '옳습니다' : '옳지 않습니다'), q.prompt).toBe(true);
    }
  });

  it('“바르게 계산하면”과 “어떤 수”의 답이 맞습니다', () => {
    for (const { q } of all) {
      const 바르게 = /(\d+)([+-])(\d+)[을를] \d+(?:이)?라고 계산했습니다\. 바르게/.exec(q.prompt);
      if (바르게) {
        const a = Number(바르게[1]);
        const b = Number(바르게[3]);
        expect(q.answer, q.prompt).toBe(String(바르게[2] === '+' ? a + b : a - b));
      }
      const 뺐더니 = /어떤 수에서 (\d+)[을를] 뺐더니 (\d+)/.exec(q.prompt);
      if (뺐더니) expect(q.answer, q.prompt).toBe(String(Number(뺐더니[1]) + Number(뺐더니[2])));
      const 더했더니 = /어떤 수에 (\d+)[을를] 더했더니 (\d+)/.exec(q.prompt);
      if (더했더니) expect(q.answer, q.prompt).toBe(String(Number(더했더니[2]) - Number(더했더니[1])));
      const 빈칸 = /^(\d)□(\d)([+-])(\d+)=(\d+)에서/.exec(q.prompt);
      if (빈칸) {
        const [, h, o, op, b, r] = 빈칸;
        const 맞는 = [...Array(10).keys()].filter((d) => {
          const a = Number(`${h}${d}${o}`);
          return (op === '+' ? a + Number(b) : a - Number(b)) === Number(r);
        });
        expect(맞는, q.prompt).toEqual([Number(q.answer)]);
      }
    }
  });

  it('힌트가 답을 그대로 말하지 않고, 풀이의 끝이 답을 말합니다', () => {
    for (const { q } of all) {
      const 수답 = /^\d{2,}$/.test(q.answer) ? q.answer : null;
      if (수답) expect(q.support.studentHint.includes(수답), `${q.prompt} / ${q.support.studentHint}`).toBe(false);
      const 끝 = q.support.steps[q.support.steps.length - 1];
      // 문장으로 된 답은 첫 마디(옳습니다/옳지 않습니다)가 풀이에 있으면 됩니다.
      const 알맹이 = q.answer.replace(/^약 /, '').split('. ')[0].replace(/\.$/, '');
      expect(q.support.steps.join(' ').includes(알맹이), `${q.prompt} → ${q.answer} / ${끝}`).toBe(true);
    }
  });

  it('수 뒤의 조사가 받침에 맞습니다', () => {
    // 수를 읽은 마지막 소리: 0 영(십·백·천), 1 일, 2 이, 3 삼, 4 사, 5 오, 6 육, 7 칠, 8 팔, 9 구
    const 받침 = [true, true, false, true, false, false, true, true, true, false];
    const 짝: Record<string, [string, string]> = { 은: ['은', '는'], 는: ['은', '는'], 을: ['을', '를'], 를: ['을', '를'], 이: ['이', '가'], 가: ['이', '가'], 과: ['과', '와'], 와: ['과', '와'] };
    const 나쁨: string[] = [];
    for (const { q } of all) {
      const 글 = [q.prompt, q.support.studentHint, ...q.support.steps, ...q.choices.map(String)].join(' ');
      for (const m of 글.matchAll(/(\d)(은|는|을|를|이|가|과|와)(?=[\s.,])/g)) {
        const [있음, 없음] = 짝[m[2]];
        const 바른 = 받침[Number(m[1])] ? 있음 : 없음;
        if (m[2] !== 바른) 나쁨.push(`${m[0]} — ${글.slice(Math.max(0, m.index! - 20), m.index! + 10)}`);
      }
      // 받침 없는 말 뒤 '은' 같은 실수 가운데 실제로 나왔던 것들
      for (const bad of ['배은', '줄넘기은', '색종이은', '수은 ', '썼은', '뺐은', '했은', '뺐서', '했서', '썼서']) {
        if (글.includes(bad)) 나쁨.push(`${bad} — ${q.prompt.slice(0, 40)}`);
      }
    }
    expect([...new Set(나쁨)].slice(0, 20)).toEqual([]);
  });
});
