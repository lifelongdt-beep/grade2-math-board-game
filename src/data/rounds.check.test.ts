import { describe, expect, it } from 'vitest';
import type { Difficulty, Lesson, Question } from '../types';
import { lessons as lessons2 } from './curriculum';
import { lessons11 } from './curriculum11';
import { lessons12 } from './curriculum12';
import { lessons31 } from './curriculum31';
import { lessons32 } from './curriculum32';
import { lessons41 } from './curriculum41';
import { lessons42 } from './curriculum42';
import { lessons5 } from './curriculum5';
import { lessons51 } from './curriculum51';
import { lessons61 } from './curriculum61';
import { lessons62 } from './curriculum62';
import { generateClassQuestions } from './questionFactory';
import { 조작섞기 } from './manipulate';

// ════════════════════════════════════════════════════════════════════
// 뒤 판의 문항
// ────────────────────────────────────────────────────────────────────
// 문제집은 판을 여러 벌 이어 붙입니다(App.tsx의 문제판수). 뒤 판은 같은
// 틀에 씨앗만 바꾸어 만들고, 앞 판에서 낸 문항은 피합니다. 처음 판은 다른
// 검사들이 모두 보므로, 여기서는 뒤 판이 처음 판만큼 온전한지 봅니다.
// 시간을 아끼려고 열 차시에 하나씩, 둘째·셋째 판을 봅니다.
// ════════════════════════════════════════════════════════════════════

const 모든차시: Lesson[] = [...lessons11, ...lessons12, ...lessons2, ...lessons31, ...lessons32, ...lessons41, ...lessons42, ...lessons51, ...lessons5, ...lessons61, ...lessons62];
const 볼차시 = 모든차시.filter((_, k) => k % 10 === 0);
const 수준들: Difficulty[] = ['하', '중', '상'];
const 판 = (l: Lesson, lv: Difficulty, p: number): Question[] => 조작섞기(l, lv, generateClassQuestions(l, lv, { 판: p }), p);
const 열쇠 = (q: Question) => `${q.prompt}|${q.answer}|${JSON.stringify(q.visual ?? null)}|${JSON.stringify(q.manipulate ?? null)}`;

describe('뒤 판의 문항', () => {
  it('보기에 답이 하나 들어 있고, 빈 글이나 계산이 깨진 글이 없으며, id가 겹치지 않습니다', () => {
    const 잘못: string[] = [];
    for (const l of 볼차시) for (const lv of 수준들) {
      const ids = new Set<string>();
      for (const p of [0, 1, 2]) for (const q of 판(l, lv, p)) {
        if (!q.manipulate && (q.choices.filter((c) => c === q.answer).length !== 1 || new Set(q.choices).size !== q.choices.length)) 잘못.push(`${q.id} 보기: ${q.prompt}`);
        if (/undefined|NaN|Infinity/.test([q.prompt, q.answer, ...q.choices].join(' '))) 잘못.push(`${q.id} 글: ${q.prompt}`);
        if (ids.has(q.id)) 잘못.push(`${q.id} id 겹침`);
        ids.add(q.id);
      }
    }
    expect(잘못).toEqual([]);
  });

  it('뒤 판은 앞 판에서 낸 문항을 다시 내지 않고, 차시마다 새 문항을 넉넉히 냅니다', () => {
    let 앞판수 = 0;
    let 새것 = 0;
    for (const l of 볼차시) for (const lv of 수준들) {
      const 처음 = new Set(판(l, lv, 0).map(열쇠));
      const 둘째 = 판(l, lv, 1).map(열쇠);
      expect(둘째.filter((k) => 처음.has(k)), `${l.id} ${lv}`).toEqual([]);
      앞판수 += 처음.size;
      새것 += new Set(둘째).size;
    }
    // 둘째 판이 처음 판의 여덟 할은 넘게 새 문항을 냅니다(수가 좁은 차시는 덜 냅니다).
    expect(새것 / 앞판수).toBeGreaterThan(0.8);
  });
});
