import { describe, expect, it } from 'vitest';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-2 1단원 곱셈 — 답을 처음부터 다시 셉니다
// ────────────────────────────────────────────────────────────────────
// 생성기(grade32/unit1)의 셈을 가져오지 않습니다. 화면에 나갈 문제 글을
// 읽고 여기 적은 셈으로 다시 풀어 답과 맞춥니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 차시문항 = (lessonNo: number) =>
  lessons32
    .filter((one) => one.unitNo === 1 && one.lessonNo === lessonNo)
    .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));
const 모두: Question[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(차시문항);

// ── 여기서 쓰는 셈 ─────────────────────────────────────────────────
const 숫자들 = (n: number) => String(n).split('').reverse().map(Number);
/** a×d(한 자리)에서 자리마다 올림이 생기는지입니다. */
const 올림자리 = (a: number, d: number) => {
  let carry = 0;
  return 숫자들(a).map((x) => {
    carry = Math.floor((x * d + carry) / 10);
    return carry > 0;
  });
};
const 부분곱올림수 = (a: number, b: number) =>
  숫자들(b).reduce((sum, d) => sum + (d === 0 ? 0 : 올림자리(a, d).filter(Boolean).length), 0);
const 올림안함 = (a: number, d: number) => {
  const ds = 숫자들(a);
  return ds.reduce((sum, x, p) => sum + (p === ds.length - 1 ? x * d : (x * d) % 10) * 10 ** p, 0);
};

const 계산식 = /^(\d+)×(\d+)[을를] 계산하면 얼마일까요\?$/;

describe('3-2 1단원 곱셈', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons32.filter((one) => one.unitNo === 1)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('계산 문항의 답이 맞고, 차시가 다루는 꼴과 올림 자리를 지킵니다', () => {
    const 맞는꼴: Record<number, (a: number, b: number) => boolean> = {
      2: (a, b) => a >= 100 && a < 1000 && b < 10 && 올림자리(a, b).every((c) => !c),
      3: (a, b) => {
        const c = 올림자리(a, b);
        return a >= 100 && a < 1000 && b < 10 && c[0] && !c[1] && !c[2];
      },
      4: (a, b) => {
        const c = 올림자리(a, b);
        return a >= 100 && a < 1000 && b < 10 && !c[0] && (c[1] || c[2]);
      },
      5: (a, b) => a >= 10 && a < 100 && b % 10 === 0 && b >= 20 && b < 100,
      6: (a, b) => a < 10 && b >= 11 && b < 100 && b % 10 !== 0,
      7: (a, b) => a >= 11 && a < 100 && b >= 11 && b < 100 && 부분곱올림수(a, b) === 1,
      8: (a, b) => a >= 11 && a < 100 && b >= 11 && b < 100 && 부분곱올림수(a, b) >= 2,
    };
    let count = 0;
    for (const lessonNo of [2, 3, 4, 5, 6, 7, 8]) {
      for (const q of 차시문항(lessonNo)) {
        const m = 계산식.exec(q.prompt);
        if (!m) continue;
        const a = Number(m[1]);
        const b = Number(m[2]);
        expect(q.answer, q.prompt).toBe(String(a * b));
        expect(맞는꼴[lessonNo](a, b), `${lessonNo}차시 ${q.prompt}`).toBe(true);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(50);
  });

  it('문장제와 바르게 고치기의 답이 맞습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const fix = /(\d+)×(\d+)[을를] \d+(?:이라고|라고) 계산했습니다\. 바르게 계산하면/.exec(q.prompt);
      if (fix) {
        expect(q.answer).toBe(String(Number(fix[1]) * Number(fix[2])));
        count += 1;
        continue;
      }
      const word = /(\d+)(?:개|명|장|번)씩 (?:들어 있습니다\. )?(?:배 )?(\d+)(?:바구니|척|상자|명|봉지|줄|일)/.exec(q.prompt);
      if (word && /모두 몇/.test(q.prompt)) {
        const n = Number(q.answer.replace(/[^\d]/g, ''));
        expect(n, q.prompt).toBe(Number(word[1]) * Number(word[2]));
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(40);
  });

  it('가르기와 부분 곱 문항의 식이 성립합니다', () => {
    for (const q of 모두) {
      const 가르기 = /^(\d+)×(\d+)=(.+)입니다\. □ 안에 알맞은 수는/.exec(q.prompt);
      if (가르기) {
        const 오른쪽 = 가르기[3].replace('□', q.answer);
        const 값 = 오른쪽.split('+').reduce((sum, term) => sum + term.split('×').reduce((p, x) => p * Number(x), 1), 0);
        expect(값, q.prompt).toBe(Number(가르기[1]) * Number(가르기[2]));
      }
      const 부분 = /(\d+)[은는] 어떤 곱셈을 계산한 값일까요/.exec(q.prompt);
      if (부분) {
        const [x, y] = q.answer.split('×').map(Number);
        expect(x * y, q.prompt).toBe(Number(부분[1]));
        for (const choice of q.choices) {
          if (choice === q.answer) continue;
          const [p, r] = choice.split('×').map(Number);
          expect(p * r === Number(부분[1]), `${q.prompt} / ${choice}`).toBe(false);
        }
      }
    }
  });

  it('잘못 계산한 까닭: 고른 까닭으로 그 값이 나오고, 다른 보기로는 나오지 않습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const m = /(\d+)×(\d+)=(\d+)(?:이라고|라고) 계산했습니다\. 잘못 계산한 까닭/.exec(q.prompt);
      if (!m) continue;
      const a = Number(m[1]);
      const b = Number(m[2]);
      const v = Number(m[3]);
      expect(v).not.toBe(a * b);
      const 값: (reason: string) => number[] = (reason) => {
        if (reason.startsWith('올림한 수를 윗자리')) return b < 10 ? [올림안함(a, b)] : [올림안함(a, b % 10) + 올림안함(a, Math.floor(b / 10)) * 10];
        if (reason.startsWith('곱하는 수의 0을')) return [(a * b) / 10];
        if (reason.startsWith('0을 하나 더')) return [a * b * 10];
        if (reason.startsWith('일의 자리 곱에서 올림한 수를')) {
          const c = Math.floor(((a % 10) * (b % 10)) / 10);
          return [a * (b % 10) + (a * Math.floor(b / 10) + c * 10) * 10];
        }
        if (reason.startsWith('올림을 하지 않고 곱셈구구')) {
          const [one, many] = a < 10 ? [a, b] : [b, a];
          return [Number(String(many).split('').map((d) => String(Number(d) * one)).join(''))];
        }
        if (reason.startsWith('곱셈 대신 덧셈')) return [a + b];
        if (/의 값을 몇십으로 쓰지|계산 결과를 자리에 맞추어 쓰지/.test(reason)) {
          return a < 10 ? [a * (b % 10) + a * Math.floor(b / 10)] : [a * (b % 10) + a * Math.floor(b / 10)];
        }
        const 백 = /^백의 자리 계산 (\d+)×/.exec(reason);
        if (백) return [a * b - Number(백[1]) * b + (Number(백[1]) / 100) * b];
        throw new Error(`모르는 까닭: ${reason}`);
      };
      expect(값(q.answer), q.prompt).toContain(v);
      for (const choice of q.choices) {
        if (choice === q.answer) continue;
        expect(값(choice).includes(v), `${q.prompt} / ${choice}`).toBe(false);
      }
      count += 1;
    }
    expect(count).toBeGreaterThan(10);
  });

  it('크기 비교의 답이 맞습니다', () => {
    for (const q of 모두) {
      const m = /^계산 결과가 가장 (큰|작은) 것은 어느 것일까요\? \((.+)\)$/.exec(q.prompt);
      if (!m) continue;
      const items = m[2].split(', ').map((one) => {
        const [mark, expr] = one.split(' ');
        const [x, y] = expr.split('×').map(Number);
        return { mark, v: x * y };
      });
      const best = items.reduce((p, c) => ((m[1] === '큰' ? c.v > p.v : c.v < p.v) ? c : p));
      expect(q.answer, q.prompt).toBe(best.mark);
    }
  });

  it('어림셈: 가까운 몇백·몇십으로 어림하고, 가운데 수는 내지 않습니다', () => {
    const 가까운 = (n: number) => {
      const unit = n >= 100 ? 100 : 10;
      const rest = n % unit;
      expect(rest * 2, `${n}은 가운데에 걸립니다`).not.toBe(unit);
      return rest * 2 < unit ? n - rest : n - rest + unit;
    };
    let count = 0;
    for (const q of 차시문항(9)) {
      const 식 = /^(\d+)×(\d+)[을를] 어림셈하려고/.exec(q.prompt);
      if (식) {
        const a = Number(식[1]);
        const b = Number(식[2]);
        expect(q.answer, q.prompt).toBe(`${가까운(a)}×${b < 10 ? b : 가까운(b)}`);
        count += 1;
      }
      const 값 = /(\d+)(?: m인 호수를|개씩 들어 있는 사탕|장씩|봉지씩) (\d+)/.exec(q.prompt);
      if (값 && q.answer.startsWith('약')) {
        const a = Number(값[1]);
        const b = Number(값[2]);
        expect(Number(q.answer.replace(/[^\d]/g, '')), q.prompt).toBe(가까운(a) * (b < 10 ? b : 가까운(b)));
        count += 1;
      }
      const 판단 = /^어림셈으로 확인했을 때 계산 결과가 잘못된 것은 어느 것일까요\? \((.+)\)$/.exec(q.prompt);
      if (판단) {
        const 틀린 = 판단[1].split(', ').filter((one) => {
          const [, x, y, v] = /(\d+)×(\d+)=(\d+)/.exec(one)!;
          return Number(x) * Number(y) !== Number(v);
        });
        expect(틀린.length, q.prompt).toBe(1);
        expect(틀린[0].startsWith(q.answer)).toBe(true);
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
