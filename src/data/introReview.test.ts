import { describe, expect, it } from 'vitest';
import type { Difficulty } from '../types';
import { lessons as lessons2 } from './curriculum';
import { curriculum11 } from './curriculum11';
import { curriculum12 } from './curriculum12';
import { curriculum31 } from './curriculum31';
import { curriculum32 } from './curriculum32';
import { curriculum41 } from './curriculum41';
import { curriculum42 } from './curriculum42';
import { curriculum51 } from './curriculum51';
import { curriculum5 } from './curriculum5';
import { curriculum61 } from './curriculum61';
import { curriculum62 } from './curriculum62';
import { 도입복습차시, 도입선수단원, 도입차시인가 } from './introReview';
import { generateClassQuestions, generateQuestions } from './questionFactory';

// 단원 도입 차시는 앞 학기·앞 학년의 이어지는 단원을 종합해 복습합니다.
const 모든차시 = [...curriculum11, ...curriculum12].flatMap((u) => u.lessons)
  .concat(lessons2)
  .concat([...curriculum31, ...curriculum32, ...curriculum41, ...curriculum42, ...curriculum51, ...curriculum5, ...curriculum61, ...curriculum62].flatMap((u) => u.lessons));
const 저장 = new Map<string, ReturnType<typeof generateQuestions>>();
const 문항 = (l: (typeof 모든차시)[number], lv: Difficulty) => {
  const k = `${l.id}-${lv}`;
  if (!저장.has(k)) 저장.set(k, generateQuestions(l, lv));
  return 저장.get(k)!;
};
const 차례 = (키: string) => { const [g, s, u] = 키.split('-').map(Number); return g * 1000 + s * 100 + u; };

describe('단원 도입 차시의 앞 단원 종합 문제', () => {
  it('표의 앞 단원은 모두 실제로 있고, 이 단원보다 앞서 배웁니다', () => {
    for (const [키, 앞] of Object.entries(도입선수단원)) {
      const 도입 = 모든차시.find((l) => `${l.semester}-${l.unitNo}` === 키 && 도입차시인가(l));
      expect(도입, 키).toBeDefined();
      for (const a of 앞) {
        expect(차례(a), `${키} ← ${a}`).toBeLessThan(차례(키));
        expect(모든차시.some((l) => `${l.semester}-${l.unitNo}` === a), a).toBe(true);
      }
    }
  });

  it('도입 차시마다 앞 단원 문항이 충분히, 여러 차시에서 고루 나옵니다', () => {
    let 도입수 = 0;
    for (const lesson of 모든차시) {
      const 앞차시 = 도입복습차시(lesson);
      if (!앞차시) continue;
      도입수 += 1;
      for (const lv of ['하', '중', '상'] as Difficulty[]) {
        const qs = generateClassQuestions(lesson, lv);
        expect(qs.length, `${lesson.id} ${lv}`).toBeGreaterThanOrEqual(20);
        expect(new Set(qs.map((q) => q.id)).size, lesson.id).toBe(qs.length);
        for (const q of qs) {
          expect(q.lessonId).toBe(lesson.id);
          expect(q.difficulty).toBe(lv);
        }
        // 가져온 문항은 앞 단원 차시가 낸 문항 그대로입니다(그 차시의 검사를 거친 문항).
        const 어디서 = new Map<string, string>();
        for (const l of 앞차시) for (const o of 문항(l, lv)) 어디서.set(`${o.prompt}|${o.answer}`, l.id);
        for (const q of qs) expect(어디서.has(`${q.prompt}|${q.answer}`), `${lesson.id}: ${q.prompt}`).toBe(true);
        // 한두 차시에 몰리지 않고 여러 차시에서 옵니다.
        const 원래차시 = new Set(qs.map((q) => 어디서.get(`${q.prompt}|${q.answer}`)));
        expect(원래차시.size, `${lesson.id} ${lv}`).toBeGreaterThanOrEqual(Math.min(3, 앞차시.length));
      }
    }
    expect(도입수).toBeGreaterThan(60);
  });

  it('도입이 아닌 차시는 원래 문항 그대로입니다', () => {
    for (const lesson of 모든차시.filter((l) => !도입차시인가(l)).slice(0, 40)) {
      expect(generateClassQuestions(lesson, '중').map((q) => q.prompt)).toEqual(generateQuestions(lesson, '중').map((q) => q.prompt));
    }
  });
});
