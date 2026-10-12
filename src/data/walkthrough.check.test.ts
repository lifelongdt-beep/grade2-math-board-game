import { describe, expect, it } from 'vitest';
import { curriculum31 } from './curriculum31';
import { curriculum32 } from './curriculum32';
import { curriculum } from './curriculum';
import { curriculum5 } from './curriculum5';
import { curriculum51 } from './curriculum51';
import { parse as 분수읽기 } from './grade5/fraction';
import { generateQuestions } from './questionFactory';
import { buildWalk, deriveWalkthrough, exprSteps, type ColumnWalk } from './walkthrough';
import type { Difficulty, Question } from '../types';

// ════════════════════════════════════════════════════════════════════
// 세로셈 따라가기 — 장면이 실제 계산과 맞는지 다시 셉니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Question[] = [...curriculum31, ...curriculum32]
  .flatMap((unit) => unit.lessons)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

/** 장면의 한 줄을 수로 읽습니다. */
const 줄읽기 = (walk: ColumnWalk, frame: number, row: string) => {
  const cells = walk.frames[frame].cells.filter((c) => c.row === row && !c.small);
  if (!cells.length) return null;
  const top = Math.max(...cells.map((c) => c.col));
  let text = '';
  for (let col = top; col >= 0; col -= 1) text += cells.find((c) => c.col === col)?.text ?? '';
  return Number(text);
};

describe('세로셈 따라가기', () => {
  it('3학년 계산 문항 가운데 넉넉한 수에 붙습니다', () => {
    const 붙은 = 모두.filter((q) => q.walkthrough);
    expect(붙은.length).toBeGreaterThan(1500);
    const 갈래 = new Set(붙은.map((q) => q.walkthrough!.kind));
    expect([...갈래].sort()).toEqual(['add', 'chain', 'div', 'mul', 'sub', 'time']);
  });

  it('들이·무게의 덧셈과 뺄셈 따라가기는 같은 단위끼리 계산해 답에 닿습니다', () => {
    const 단위 = 모두.filter((q) => q.walkthrough?.kind === 'chain');
    expect(단위.length).toBeGreaterThan(50);
    for (const q of 단위) {
      const w = q.walkthrough!;
      if (w.kind !== 'chain') continue;
      expect(w.lines[w.lines.length - 1], q.prompt).toBe(q.answer);
      expect(w.lines.length, q.prompt).toBe(w.says.length);
      const 괄호 = [...w.lines[1].matchAll(/\((\d+) ([+-]) (\d+)\)/g)].map((m) => (m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3])));
      // 둘째 줄의 두 괄호를 계산한 값이 답의 수와 같습니다(0 L, 0 mL는 답에 쓰지 않습니다).
      const 답수 = (q.answer.match(/\d+/g) ?? []).map(Number);
      expect(괄호.filter((v) => v !== 0), q.prompt).toEqual(답수);
    }
  });

  it('마지막 장면의 답 줄이 실제 계산 결과와 같습니다', () => {
    for (const q of 모두) {
      const w = q.walkthrough;
      if (!w) continue;
      const walk = buildWalk(w);
      if (walk.type === 'div' && w.kind === 'div') {
        expect(walk.quotient, q.prompt).toBe(Math.floor(w.a / w.b));
        expect(walk.remainder, q.prompt).toBe(w.a % w.b);
        const last = walk.frames[walk.frames.length - 1];
        expect(Number(last.quotient.map((d) => d ?? '').join('')), q.prompt).toBe(walk.quotient);
        expect(Number(last.lines[last.lines.length - 1].text), q.prompt).toBe(walk.remainder);
        continue;
      }
      if (walk.type !== 'column') continue;
      if (w.kind === 'time') {
        // 답 줄의 분과 초가 실제 계산과 같은지 봅니다.
        const 초 = (t: { h?: number; m: number; s: number }) => t.m * 60 + t.s;
        const 기대 = w.op === '+' ? 초(w.a) + 초(w.b) : 초(w.a) - 초(w.b);
        expect(walk.result, q.prompt).toBe(기대);
        const last = walk.frames[walk.frames.length - 1].cells;
        const 읽기 = (col: number) => Number(last.find((c) => c.row === 'r' && c.col === col)?.text);
        expect(읽기(1) * 60 + 읽기(0), q.prompt).toBe(기대);
        expect(읽기(0) < 60, q.prompt).toBe(true);
        // 문항의 답에 같은 분·초가 들어 있습니다.
        expect(q.answer.includes(`${읽기(1)}분`) || 읽기(1) === 0, `${q.prompt} → ${q.answer}`).toBe(true);
        continue;
      }
      if (w.kind !== 'add' && w.kind !== 'sub' && w.kind !== 'mul') continue;
      const 기대 = w.kind === 'add' ? w.a + w.b : w.kind === 'sub' ? w.a - w.b : w.a * w.b;
      expect(walk.result).toBe(기대);
      expect(줄읽기(walk, walk.frames.length - 1, 'r'), `${q.prompt} ${JSON.stringify(w)}`).toBe(기대);
      // 처음 장면에 두 수가 그대로 적혀 있습니다.
      expect(줄읽기(walk, 0, 'a')).toBe(w.a);
      expect(줄읽기(walk, 0, 'b')).toBe(w.b);
    }
  });

  it('받아내린 자리의 작은 수는 지운 수보다 1 작거나(빌려 준 자리) 10을 더한 수입니다', () => {
    for (const q of 모두) {
      const w = q.walkthrough;
      if (!w || w.kind !== 'sub') continue;
      const walk = buildWalk(w) as ColumnWalk;
      const last = walk.frames[walk.frames.length - 1].cells;
      for (const small of last.filter((c) => c.small)) {
        const struck = last.find((c) => c.row === 'a' && c.col === small.col && c.struck);
        expect(struck, q.prompt).toBeTruthy();
        const was = Number(struck!.text);
        expect([was - 1, was + 10, was + 9, 9].includes(Number(small.text)), `${q.prompt} ${small.col}`).toBe(true);
      }
    }
  });

  it('말에 조사 괄호가 남지 않고, 어림·분수·두 단위 문항에는 붙지 않습니다', () => {
    for (const q of 모두) {
      if (/어림|\d\/\d/.test(q.prompt)) expect(q.walkthrough, q.prompt).toBeUndefined();
      if (!q.walkthrough) continue;
      const walk = buildWalk(q.walkthrough);
      if (walk.type === 'chain') continue;
      for (const f of walk.frames) expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(f.say), f.say).toBe(false);
    }
  });

  it('식이 여럿이면 문제에 나온 수의 식을 고르고, 크기가 같은 식이 여럿이면 고르지 않습니다', () => {
    expect(deriveWalkthrough('26+65를 계산하면 얼마일까요?', ['일의 자리: 6+5=11.', '그러므로 26+65=91입니다.'], '3-1')).toEqual({ kind: 'add', a: 26, b: 65 });
    expect(deriveWalkthrough('계산 결과가 가장 큰 것은?', ['442+507=949', '101+263=364'], '3-1')).toBeNull();
    // 1학기 나눗셈은 곱셈구구로 구합니다.
    expect(deriveWalkthrough('56÷8의 몫은?', ['56÷8=7'], '3-1')).toBeNull();
    expect(deriveWalkthrough('56÷8의 몫은?', ['56÷8=7'], '3-2')).toEqual({ kind: 'div', a: 56, b: 8 });
    // (한 자리 수)×(두 자리 수)는 바꾸어 씁니다.
    expect(deriveWalkthrough('2×53을 계산하면?', ['2×53=106'], '3-2')).toEqual({ kind: 'mul', a: 53, b: 2 });
  });
});

// ════════════════════════════════════════════════════════════════════
// 2학년 세로셈, 5학년 혼합 계산·소수의 곱셈·분수 계산 줄
// ════════════════════════════════════════════════════════════════════
const 다른학년: Question[] = [...curriculum, ...curriculum51, ...curriculum5]
  .flatMap((unit) => unit.lessons)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

describe('2·5학년 따라가기', () => {
  it('말에 조사 괄호가 남지 않습니다', () => {
    for (const q of 다른학년) {
      if (!q.walkthrough) continue;
      const walk = buildWalk(q.walkthrough);
      const says = walk.type === 'chain' ? walk.says : walk.frames.map((f) => f.say);
      for (const say of says) expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(say), say).toBe(false);
    }
  });

  it('2학년 덧셈·뺄셈 세로셈은 답과 같습니다', () => {
    const 붙은 = 다른학년.filter((q) => q.lessonId.startsWith('2-') && q.walkthrough);
    expect(붙은.length).toBeGreaterThan(150);
    for (const q of 붙은) {
      const w = q.walkthrough!;
      if (w.kind !== 'add' && w.kind !== 'sub') throw new Error(q.prompt);
      const walk = buildWalk(w) as ColumnWalk;
      expect(줄읽기(walk, walk.frames.length - 1, 'r'), q.prompt).toBe(Number(q.answer.replace(/[^\d]/g, '')));
    }
  });

  it('혼합 계산은 계산 순서를 지키고 마지막 값이 풀이와 같습니다', () => {
    const 붙은 = 다른학년.filter((q) => q.lessonId.startsWith('5-1-u1-') && q.walkthrough);
    expect(붙은.length).toBeGreaterThan(150);
    for (const q of 붙은) {
      const w = q.walkthrough!;
      if (w.kind !== 'expr') throw new Error(q.prompt);
      const walk = exprSteps(w.expr)!;
      // 괄호가 남아 있는 동안에는 괄호 밖을 계산하지 않고, 곱셈·나눗셈이 남아 있으면 덧셈·뺄셈을 하지 않습니다.
      for (const f of walk.frames) {
        if (!f.hl) continue;
        const op = f.tokens[f.hl[0] + 1];
        const 괄호 = f.tokens.indexOf('(');
        if (괄호 >= 0) expect(f.hl[0] > 괄호 && f.hl[1] < f.tokens.indexOf(')', 괄호), w.expr).toBe(true);
        if ((op === '+' || op === '-') && 괄호 < 0) expect(f.tokens.some((t) => t === '×' || t === '÷'), w.expr).toBe(false);
      }
      // 계산기로 다시 셉니다.
      const 값 = Function(`return (${w.expr.replace(/×/g, '*').replace(/÷/g, '/')})`)() as number;
      expect(walk.value, w.expr).toBe(값);
    }
  });

  it('소수의 곱셈은 소수점 자리가 맞고 답과 같습니다', () => {
    const 붙은 = 다른학년.filter((q) => q.walkthrough?.kind === 'decmul');
    expect(붙은.length).toBeGreaterThan(50);
    for (const q of 붙은) {
      const w = q.walkthrough!;
      if (w.kind !== 'decmul') continue;
      const walk = buildWalk(w);
      if (walk.type !== 'decmul') throw new Error('');
      expect(Math.abs(Number(walk.result) - Number(w.a) * Number(w.b)) < 1e-9, `${w.a}×${w.b}=${walk.result}`).toBe(true);
    }
  });

  it('분수 계산 줄은 줄마다 값이 같고 마지막 줄이 답입니다', () => {
    const 붙은 = 다른학년.filter((q) => q.walkthrough?.kind === 'chain');
    expect(붙은.length).toBeGreaterThan(100);
    const 값 = (line: string): number | null => {
      const m = /^(.+?) ([+\-×]) (.+)$/.exec(line);
      if (!m) { const f = 분수읽기(line); return f ? f.n / f.d : null; }
      const x = 값(m[1]);
      const y = 값(m[3]);
      if (x === null || y === null) return null;
      return m[2] === '+' ? x + y : m[2] === '-' ? x - y : x * y;
    };
    for (const q of 붙은) {
      const w = q.walkthrough!;
      if (w.kind !== 'chain') continue;
      const first = 값(w.lines[0]);
      expect(first, w.lines.join(' = ')).not.toBeNull();
      for (const line of w.lines) expect(Math.abs((값(line) ?? NaN) - first!) < 1e-9, `${q.prompt}: ${w.lines.join(' = ')}`).toBe(true);
      expect(q.answer.startsWith(w.lines[w.lines.length - 1]), `${q.answer} / ${w.lines.join(' = ')}`).toBe(true);
    }
  });
});
