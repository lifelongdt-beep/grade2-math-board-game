import { describe, it } from 'vitest';
import { lessons5 } from './curriculum5';
import { lessons51 } from './curriculum51';
import { generateQuestions } from './questionFactory';
import type { Difficulty, Lesson } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];
const key = (q: { prompt: string; choices: string[]; visual?: unknown }) =>
  `${q.prompt}||${JSON.stringify(q.visual ?? null)}||${[...q.choices].sort().join('|')}`;

const only = process.env.ONLY;

describe('probe', () => {
  it('겹침', () => {
    const rows: string[] = [];
    let bad = 0;
    for (const lesson of [...lessons51, ...lessons5] as Lesson[]) {
      if (only && !lesson.id.startsWith(only)) continue;
      const qs = levels.map((l) => generateQuestions(lesson, l));
      const sets = qs.map((one) => new Set(one.map(key)));
      const inter = (a: Set<string>, b: Set<string>) => [...a].filter((x) => b.has(x)).length;
      const v = [inter(sets[0], sets[1]), inter(sets[1], sets[2]), inter(sets[0], sets[2])];
      const shapes = qs.map((one) => new Set(one.map((q) => q.prompt.replace(/[\d.]+/g, '#').replace(/\s+/g, ' ').trim())).size);
      const counts = qs.map((one) => one.length);
      const ok = v[0] <= 6 && v[1] <= 6 && v[2] <= 3 && Math.min(...shapes) >= 4 && Math.min(...counts) >= 30;
      if (!ok) bad += 1;
      if (!ok || only) {
        rows.push(`${ok ? '  ' : '✗ '}${lesson.id.padEnd(10)} 겹침 ${v.join('/')}  개수 ${counts.join('/')}  모양 ${shapes.join('/')}  ${lesson.title.slice(0, 22)}`);
      }
    }
    console.log('\n' + rows.join('\n'));
    console.log(`\n걸리는 차시 ${bad}`);
  });
});
