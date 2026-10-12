import { describe, expect, it } from 'vitest';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-2 5단원 들이와 무게 — 답을 처음부터 다시 셉니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Question[] = lessons32
  .filter((one) => one.unitNo === 5)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

/** '3 L 200 mL', '1500 mL', '2 kg', '4 t'을 작은 단위(mL, g, kg)로 읽습니다. */
const 읽기 = (text: string): number | null => {
  const t = text.trim();
  const m = /^(?:(\d+) (L|kg))?\s?(?:(\d+) (mL|g))?$/.exec(t);
  if (m && (m[1] || m[3])) return Number(m[1] ?? 0) * 1000 + Number(m[3] ?? 0);
  const ton = /^(\d+) t$/.exec(t);
  if (ton) return Number(ton[1]) * 1000;
  return null;
};

describe('3-2 5단원 들이와 무게', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons32.filter((one) => one.unitNo === 5)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('단위 바꾸기가 1 L=1000 mL, 1 kg=1000 g, 1 t=1000 kg을 따르고, 보기에 같은 양이 둘 없습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const 톤 = /^(\d+) (t|kg)[은는] 몇 (kg|t)일까요\?$/.exec(q.prompt);
      if (톤) {
        const n = Number(톤[1]);
        const 답수 = Number(q.answer.replace(/[^\d]/g, ''));
        expect(톤[2] === 't' ? 답수 === n * 1000 && q.answer.endsWith(' kg') : 답수 * 1000 === n && q.answer.endsWith(' t'), q.prompt).toBe(true);
        count += 1;
        continue;
      }
      const m = /^(.+?)[은는] 몇 (L 몇 mL|kg 몇 g|mL|g)일까요\?$/.exec(q.prompt);
      if (!m) continue;
      const 문제 = 읽기(m[1]);
      const 답 = 읽기(q.answer);
      if (문제 === null || 답 === null) continue;
      expect(답, q.prompt).toBe(문제);
      for (const c of q.choices) if (c !== q.answer && 읽기(c) !== null) expect(읽기(c), `${q.prompt} / ${c}`).not.toBe(답);
      count += 1;
    }
    expect(count).toBeGreaterThan(30);
  });

  it('덧셈과 뺄셈은 받아올림·받아내림이 없고 답이 맞습니다', () => {
    let count = 0;
    for (const q of 모두) {
      const m = /(\d+) (L|kg) (\d+) (mL|g) ?([+-]) ?(\d+) \2 (\d+) \4/.exec(q.support.steps.join(' ') + ' ' + q.prompt);
      if (!m || !/계산하면|모두 몇|남은/.test(q.prompt)) continue;
      const [a1, a2, b1, b2] = [Number(m[1]), Number(m[3]), Number(m[6]), Number(m[7])];
      const 더 = m[5] === '+';
      if (더) expect(a2 + b2 < 1000, q.prompt).toBe(true);
      else expect(a2 >= b2 && a1 >= b1, q.prompt).toBe(true);
      expect(읽기(q.answer), q.prompt).toBe(더 ? (a1 + b1) * 1000 + a2 + b2 : (a1 - b1) * 1000 + a2 - b2);
      count += 1;
    }
    expect(count).toBeGreaterThan(40);
  });

  it('크기 비교와 어림, 재기가 맞습니다', () => {
    for (const q of 모두) {
      const c = /^(.+) ([<>=]) (.+)$/.exec(q.answer);
      if (c && 읽기(c[1]) !== null && 읽기(c[3]) !== null) {
        const s = Math.sign(읽기(c[1])! - 읽기(c[3])!);
        expect({ '>': 1, '<': -1, '=': 0 }[c[2] as '>']).toBe(s);
      }
      const 어림 = /재어 본 값은 (\d+) (mL|g)입니다\. 어림한 값은 (.+)입니다/.exec(q.prompt);
      if (어림) {
        const 잰 = Number(어림[1]);
        const 사람 = 어림[3].split(', ').map((one) => {
          const [, 이름, v] = /^(\S+) 약 (\d+)/.exec(one)!;
          return { 이름, 차: Math.abs(Number(v) - 잰) };
        });
        const 가장 = Math.min(...사람.map((p) => p.차));
        expect(사람.filter((p) => p.차 === 가장).map((p) => p.이름)).toEqual([q.answer]);
      }
      const 재기 = /(\d+) (?:mL인 컵으로 물을|g짜리 추) (\d+)(?:번|개)/.exec(q.prompt);
      if (재기) expect(읽기(q.answer)).toBe(Number(재기[1]) * Number(재기[2]));
      const 차이 = /(\d+)(?:컵|개), 나 \S+ (?:바둑돌 )?(\d+)(?:컵|개)/.exec(q.prompt);
      if (차이 && /몇 (?:컵|개)/.test(q.prompt)) expect(q.answer.endsWith(`, ${Math.abs(Number(차이[1]) - Number(차이[2]))}${q.answer.slice(-1)}`)).toBe(true);
    }
  });

  it('조사가 괄호로 남지 않고, t 뒤에는 받침 있는 조사를 씁니다', () => {
    for (const q of 모두) {
      const all = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(all), all).toBe(false);
      expect(/\d t(를|는|가|와)/.test(all), all).toBe(false);
    }
  });
});

// ════════════════════════════════════════════════════════════════════
// 눈금 그림이 답과 어긋나지 않습니다
// ────────────────────────────────────────────────────────────────────
// 비커의 물 높이·저울의 바늘·양팔저울의 추가 답과 다르면, 눈금을 바르게
// 읽은 아이가 틀린 답을 고르게 됩니다.
// ════════════════════════════════════════════════════════════════════
describe('3-2 5단원 눈금 그림', () => {
  it('비커의 물, 저울의 바늘, 양팔저울의 추가 답과 같습니다', () => {
    let 비커 = 0;
    let 저울 = 0;
    let 양팔 = 0;
    for (const q of 모두) {
      const v = q.visual;
      if (v?.kind === 'beaker') {
        비커 += 1;
        expect(v.amountMl, q.prompt).toBe(읽기(q.answer));
        expect(v.amountMl % v.minorMl, q.prompt).toBe(0);
        expect(v.amountMl, q.prompt).toBeLessThan(v.maxMl);
      }
      if (v?.kind === 'scale-dial') {
        저울 += 1;
        expect(v.amountG, q.prompt).toBe(읽기(q.answer));
        expect(v.amountG % v.minorG, q.prompt).toBe(0);
        expect(v.amountG, q.prompt).toBeLessThan(v.maxG);
      }
      if (v?.kind === 'balance' && v.right.unitG) {
        양팔 += 1;
        expect((v.right.count ?? 0) * v.right.unitG, q.prompt).toBe(읽기(q.answer));
        expect(v.leftG, q.prompt).toBe(읽기(q.answer));
        expect(v.tilt, q.prompt).toBe('level');
        expect(q.prompt, q.prompt).toContain(`${v.right.unitG} g짜리 추 ${v.right.count}개`);
      }
      if (/양팔저울에 올렸더니 쇠구슬 쪽이 아래로/.test(q.prompt)) {
        expect(v?.kind === 'balance' && v.tilt, q.prompt).toBe('right');
      }
    }
    expect(비커).toBeGreaterThan(10);
    expect(저울).toBeGreaterThan(10);
    expect(양팔).toBeGreaterThan(5);
  });
});
