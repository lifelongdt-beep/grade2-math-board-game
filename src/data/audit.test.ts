import { describe, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

const digitJong: Record<string, boolean> = {
  '0': true, '1': true, '3': true, '6': true, '7': true, '8': true,
  '2': false, '4': false, '5': false, '9': false,
};

const report = (title: string, rows: string[]) => {
  if (rows.length === 0) return;
  console.log(`\n===== ${title} (${rows.length}) =====`);
  rows.slice(0, 30).forEach((row) => console.log(row));
  if (rows.length > 30) console.log(`... and ${rows.length - 30} more`);
};

describe('audit', () => {
  it('collects suspicious generated questions', () => {
    const particle: string[] = [];
    const dupChoices: string[] = [];
    const arithmetic: string[] = [];
    const clockRange: string[] = [];
    const negative: string[] = [];
    const answerNotInChoices: string[] = [];
    const visualMismatch: string[] = [];
    const oddSpacing: string[] = [];
    const tooLong: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const q of generateQuestions(lesson, level)) {
          const id = q.id;
          const texts = [q.prompt, q.answer, q.explanation, ...q.choices];

          for (const text of texts) {
            for (const m of text.matchAll(/(\d)(을|를|이|가|은|는|와|과)(?=[\s.,?!)]|$)/g)) {
              const jong = digitJong[m[1]];
              const bad =
                (jong && ['를', '가', '는', '와'].includes(m[2])) ||
                (!jong && ['을', '이', '은', '과'].includes(m[2]));
              if (bad) particle.push(`${id}: ...${m[0]}... | ${text}`);
            }
          }

          if (new Set(q.choices).size !== q.choices.length) {
            dupChoices.push(`${id}: ${JSON.stringify(q.choices)}`);
          }

          if (q.choices[q.answerIndex] !== q.answer) {
            answerNotInChoices.push(`${id}: answer=${q.answer} idx=${q.answerIndex} choices=${JSON.stringify(q.choices)}`);
          }

          for (const c of q.choices) {
            if (/^-\d/.test(c)) negative.push(`${id}: negative choice ${c} | ${q.prompt}`);
          }

          const calc = q.prompt.match(/(\d+)\s*([+-])\s*(\d+)\s*(?:는|은)\s*(?:얼마|몇)/);
          if (calc) {
            const expected = calc[2] === '+' ? Number(calc[1]) + Number(calc[3]) : Number(calc[1]) - Number(calc[3]);
            const got = Number(String(q.answer).match(/-?\d+/)?.[0] ?? NaN);
            if (got !== expected) arithmetic.push(`${id}: expected ${expected} got ${q.answer} | ${q.prompt}`);
          }

          if (q.visual?.kind === 'clock') {
            const v = q.visual;
            if (v.hour < 1 || v.hour > 12) clockRange.push(`${id}: hour=${v.hour} | ${q.prompt}`);
            if (v.minute < 0 || v.minute > 59) clockRange.push(`${id}: minute=${v.minute} | ${q.prompt}`);
            if (v.endHour != null && (v.endHour < 1 || v.endHour > 12)) clockRange.push(`${id}: endHour=${v.endHour} | ${q.prompt}`);
            if (v.endMinute != null && (v.endMinute < 0 || v.endMinute > 59)) clockRange.push(`${id}: endMinute=${v.endMinute} | ${q.prompt}`);
          }

          // pictograph labels should appear in the prompt when the prompt names categories
          if (q.visual?.kind === 'pictograph') {
            const missing = q.visual.items.map((i) => i.label).filter((label) => !q.prompt.includes(label));
            if (missing.length === q.visual.items.length && /\d+(명|개)/.test(q.prompt)) {
              visualMismatch.push(`${id}: labels=${JSON.stringify(q.visual.items.map((i) => i.label))} | ${q.prompt}`);
            }
          }

          if (/\s{2,}/.test(q.prompt) || /\s$/.test(q.prompt)) oddSpacing.push(`${id}: "${q.prompt}"`);
          if (q.prompt.length > 130) tooLong.push(`${id}: (${q.prompt.length}) ${q.prompt}`);
        }
      }
    }

    report('PARTICLE', particle);
    report('DUPLICATE CHOICES', dupChoices);
    report('ANSWER NOT AT INDEX', answerNotInChoices);
    report('NEGATIVE CHOICE', negative);
    report('ARITHMETIC', arithmetic);
    report('CLOCK RANGE', clockRange);
    report('PICTOGRAPH LABEL MISMATCH', visualMismatch);
    report('ODD SPACING', oddSpacing);
    report('TOO LONG PROMPT', tooLong);
  });
});
