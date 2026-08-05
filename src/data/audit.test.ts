import { describe, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

const hasFinalConsonant = (word: string) => {
  const last = word.trim().slice(-1);
  const digitJong: Record<string, boolean> = {
    '0': true, '1': true, '3': true, '6': true, '7': true, '8': true,
    '2': false, '4': false, '5': false, '9': false,
  };
  if (digitJong[last] !== undefined) return digitJong[last];
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  return (code - 0xac00) % 28 !== 0;
};

const report = (title: string, rows: string[]) => {
  if (rows.length === 0) return;
  console.log(`\n===== ${title} (${rows.length}) =====`);
  rows.slice(0, 40).forEach((row) => console.log(row));
  if (rows.length > 40) console.log(`... and ${rows.length - 40} more`);
};

describe('audit', () => {
  it('collects suspicious generated questions', () => {
    const particleIssues: string[] = [];
    const duplicateChoices: string[] = [];
    const arithmeticIssues: string[] = [];
    const emptyish: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const id = `${question.id}`;

          // particle agreement right after a digit, e.g. "73+26를"
          const texts = [question.prompt, question.answer, question.explanation, ...question.choices];
          for (const text of texts) {
            for (const m of text.matchAll(/(\d)(을|를|이|가|은|는|와|과)(?=[\s.,?!)]|$)/g)) {
              const jong = hasFinalConsonant(m[1]);
              if (jong === null) continue;
              const particle = m[2];
              const wrong =
                (jong && ['를', '가', '는', '와'].includes(particle)) ||
                (!jong && ['을', '이', '은', '과'].includes(particle));
              if (wrong) particleIssues.push(`${id}: ...${m[0]}...  | ${text}`);
            }
          }

          const uniq = new Set(question.choices);
          if (uniq.size !== question.choices.length) {
            duplicateChoices.push(`${id}: ${JSON.stringify(question.choices)} | ${question.prompt}`);
          }

          if (question.choices.some((c) => !c || !c.trim())) {
            emptyish.push(`${id}: empty choice | ${question.prompt}`);
          }

          // verify simple "A+B는?" / "A-B는?" answers
          const calc = question.prompt.match(/(\d+)\s*([+-])\s*(\d+)\s*(?:는|은)\s*(?:얼마|몇)/);
          if (calc) {
            const a = Number(calc[1]);
            const b = Number(calc[3]);
            const expected = calc[2] === '+' ? a + b : a - b;
            const got = Number(String(question.answer).match(/-?\d+/)?.[0] ?? NaN);
            if (got !== expected) {
              arithmeticIssues.push(`${id}: ${a}${calc[2]}${b} expected ${expected} got ${question.answer} | ${question.prompt}`);
            }
          }
        }
      }
    }

    report('PARTICLE', particleIssues);
    report('DUPLICATE CHOICES', duplicateChoices);
    report('ARITHMETIC', arithmeticIssues);
    report('EMPTY CHOICE', emptyish);
  });
});
