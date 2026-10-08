import { describe, expect, it } from 'vitest';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-2 2단원 나눗셈 — 답을 처음부터 다시 셉니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 차시문항 = (lessonNo: number) =>
  lessons32
    .filter((one) => one.unitNo === 2 && one.lessonNo === lessonNo)
    .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));
const 모두: Question[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap(차시문항);

const 몫나머지 = (text: string): { q: number; r: number } | null => {
  const m = /^(\d+)(?: … (\d+))?$/.exec(text.trim());
  return m ? { q: Number(m[1]), r: Number(m[2] ?? 0) } : null;
};

describe('3-2 2단원 나눗셈', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons32.filter((one) => one.unitNo === 2)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('몫과 나머지가 맞고, 나머지는 나누는 수보다 작으며, 차시의 꼴을 지킵니다', () => {
    const 맞는꼴: Record<number, (a: number, d: number) => boolean> = {
      2: (a, d) => a % 10 === 0 && a < 100 && (a / 10) % d === 0,
      3: (a, d) => a < 100 && a % d === 0 && Math.floor(a / 10) % d === 0,
      4: (a, d) => a < 100 && a % d === 0 && Math.floor(a / 10) % d !== 0,
      5: (a, d) => a < 100 && a % d !== 0 && (a < 10 * d || Math.floor(a / 10) % d === 0),
      6: (a, d) => a < 100 && a % d !== 0 && a >= 10 * d && Math.floor(a / 10) % d !== 0,
      8: (a, d) => a >= 100 && a < 1000 && a % d === 0,
      9: (a, d) => a >= 100 && a < 1000 && a % d !== 0,
    };
    let count = 0;
    for (const lessonNo of [2, 3, 4, 5, 6, 8, 9]) {
      for (const q of 차시문항(lessonNo)) {
        const m = /^(\d+)÷(\d+)의 몫(?:과 나머지를 바르게 구한 것은 어느 것일까요| ?은 얼마일까요)\?$/.exec(q.prompt);
        if (!m) continue;
        const a = Number(m[1]);
        const d = Number(m[2]);
        const got = 몫나머지(q.answer)!;
        expect(got.q * d + got.r, q.prompt).toBe(a);
        expect(got.r < d, q.prompt).toBe(true);
        expect(맞는꼴[lessonNo](a, d), `${lessonNo}차시 ${q.prompt}`).toBe(true);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(50);
  });

  it('바르게 고치기와 문장제의 답이 맞습니다', () => {
    for (const q of 모두) {
      const fix = /(\d+)÷(\d+)=[\d …]+(?:이라고|라고) 계산했습니다\. 바르게/.exec(q.prompt);
      if (fix) {
        const a = Number(fix[1]);
        const d = Number(fix[2]);
        expect(q.answer).toBe(a % d === 0 ? String(a / d) : `${Math.floor(a / d)} … ${a % d}`);
      }
      const word = /(\d+)(?:장|개)(?:을|를) (?:한 사람에게|상자|한 줄에) (\d+)/.exec(q.prompt);
      if (word && /남을까요/.test(q.prompt)) {
        const a = Number(word[1]);
        const d = Number(word[2]);
        const nums = q.answer.match(/\d+/g)!.map(Number);
        expect(nums, q.prompt).toEqual([Math.floor(a / d), a % d]);
      }
      const atLeast = /(\d+)(?:명이|개를) (?:한 번에|한 상자에) (\d+)/.exec(q.prompt);
      if (atLeast && /적어도/.test(q.prompt)) {
        const a = Number(atLeast[1]);
        const d = Number(atLeast[2]);
        expect(Number(q.answer.replace(/[^\d]/g, ''))).toBe(Math.ceil(a / d));
      }
    }
  });

  it('확인하는 식은 두 식으로 나누어 쓰고, 맞는 계산은 하나뿐입니다', () => {
    for (const q of 모두) {
      const 확인 = /^(\d+)÷(\d+)=(\d+) … (\d+)의 계산이 맞는지 확인하는/.exec(q.prompt);
      if (확인) {
        const [, a, d, qq, r] = 확인.map(Number);
        expect(q.answer).toBe(`${d}×${qq}=${d * qq}, ${d * qq}+${r}=${a}`);
        // 4×8=32+3=35처럼 이어 쓴 식이 없어야 합니다.
        for (const choice of q.choices) expect(/=\d+[+×]/.test(choice), choice).toBe(false);
      }
      const 고르기 = /^나눗셈의 계산이 맞는 것은 어느 것일까요\? \((.+)\)$/.exec(q.prompt);
      if (고르기) {
        const 맞는 = 고르기[1].split(', ').filter((one) => {
          const [, a, d, qq, r] = /(\d+)÷(\d+)=(\d+) … (\d+)/.exec(one)!.map(Number);
          return d * qq + r === a && r < d;
        });
        expect(맞는.length, q.prompt).toBe(1);
        expect(맞는[0].startsWith(q.answer)).toBe(true);
      }
      const 어떤 = /^어떤 수를 (\d+)[으로]+ 나누었더니 몫이 (\d+), 나머지가 (\d+)/.exec(q.prompt);
      if (어떤) expect(q.answer).toBe(String(Number(어떤[1]) * Number(어떤[2]) + Number(어떤[3])));
      const 나머지 = /^어떤 수를 (\d+)[으로]+ 나누었을 때 나머지가 될 수 없는 수는/.exec(q.prompt);
      if (나머지) {
        const d = Number(나머지[1]);
        expect(Number(q.answer) >= d).toBe(true);
        for (const choice of q.choices) if (choice !== q.answer) expect(Number(choice) < d && Number(choice) > 0).toBe(true);
      }
    }
  });

  it('몫의 자리 수가 맞습니다', () => {
    for (const q of 모두) {
      const m = /^(\d+)÷(\d+)의 몫은 몇 자리 수일까요/.exec(q.prompt);
      if (!m) continue;
      const 자리 = String(Math.floor(Number(m[1]) / Number(m[2]))).length;
      expect(q.answer).toBe(`${['', '한', '두', '세'][자리]} 자리 수`);
    }
  });

  it('어림셈: 나누는 수로 쉽게 나누어지는 가장 가까운 몇십으로 어림하고, 판단이 실제 몫과 맞습니다', () => {
    let count = 0;
    const 어림 = (a: number, d: number) => {
      const 단위 = 10 * d;
      const 아래 = Math.floor(a / 단위) * 단위;
      expect(a - 아래 === 아래 + 단위 - a, `${a}÷${d}는 가운데에 걸립니다`).toBe(false);
      return a - 아래 < 아래 + 단위 - a ? 아래 : 아래 + 단위;
    };
    for (const q of 차시문항(10)) {
      const 식 = /^(\d+)÷(\d+)의 몫을 어림셈하려고/.exec(q.prompt);
      if (식) {
        const a = Number(식[1]);
        const d = Number(식[2]);
        expect(q.answer).toBe(`${어림(a, d)}÷${d}`);
        count += 1;
      }
      const 값 = /(\d+)개를 (?:한 봉지에 |주머니 )(\d+)/.exec(q.prompt);
      if (값 && q.answer.startsWith('약')) {
        const a = Number(값[1]);
        const d = Number(값[2]);
        expect(Number(q.answer.replace(/[^\d]/g, ''))).toBe(어림(a, d) / d);
        count += 1;
      }
      const 판단 = /(\d+)÷(\d+)의 몫이 (\d+)(?:이라고|라고) 말했습니다/.exec(q.prompt);
      if (판단) {
        const a = Number(판단[1]);
        const d = Number(판단[2]);
        const 주장 = Number(판단[3]);
        expect(주장).not.toBe(Math.floor(a / d));
        expect(q.answer.endsWith('바르게 계산하지 않았습니다.')).toBe(true);
        const m = 어림(a, d);
        // 더 큰 수로 어림했으면 실제 몫은 어림한 몫보다 작습니다.
        if (a < m) expect(Math.floor(a / d) < m / d && 주장 >= m / d).toBe(true);
        else expect(Math.floor(a / d) >= m / d && 주장 < m / d).toBe(true);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(40);
  });

  it('조사가 괄호로 남지 않습니다', () => {
    for (const q of 모두) {
      const all = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(all), all).toBe(false);
    }
  });
});
