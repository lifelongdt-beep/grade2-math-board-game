import { describe, expect, it } from 'vitest';
import type { Unit } from '../../types';
import { curriculum as c2 } from '../curriculum';
import { curriculum11 } from '../curriculum11';
import { curriculum12 } from '../curriculum12';
import { curriculum31 } from '../curriculum31';
import { curriculum32 } from '../curriculum32';
import { curriculum41 } from '../curriculum41';
import { curriculum42 } from '../curriculum42';
import { curriculum5 } from '../curriculum5';
import { curriculum51 } from '../curriculum51';
import { curriculum61 } from '../curriculum61';
import { curriculum62 } from '../curriculum62';
import { 놀이들, 놀이문항, 놀이차시붙이기, 놀이차시인가, 놀이찾기 } from './index';
import { 단순문항있나 } from './quick';

// 모든 학년 모든 단원 맨 앞에 놀이 차시가 붙고, 놀이마다 단원의 핵심을 묻는 짧은 문항이 넉넉해야 합니다.
const 단원들: Unit[] = 놀이차시붙이기([...curriculum11, ...curriculum12, ...c2, ...curriculum31, ...curriculum32, ...curriculum41, ...curriculum42, ...curriculum51, ...curriculum5, ...curriculum61, ...curriculum62]);

describe('단원 맨 앞의 놀이 차시', () => {
  it('모든 단원이 놀이(성 지키기 또는 새 놀이)로 시작하고, 놀이 방법이 고루 쓰입니다', () => {
    const 쓰인 = new Map<string, number>();
    for (const unit of 단원들) {
      const 첫 = unit.lessons[0];
      const 놀이 = 놀이찾기(첫);
      expect(놀이 !== null || /몬스터를 막아라/.test(첫.title), `${unit.semester} ${unit.unitNo}단원`).toBe(true);
      if (놀이) 쓰인.set(놀이.mode, (쓰인.get(놀이.mode) ?? 0) + 1);
      // 놀이 차시는 단원 맨 앞에 하나뿐입니다.
      expect(unit.lessons.filter(놀이차시인가).length).toBeLessThanOrEqual(1);
    }
    expect(쓰인.size).toBe(Object.keys(놀이들).length);
    const 많은 = Math.max(...쓰인.values());
    const 적은 = Math.min(...쓰인.values());
    expect(많은 - 적은).toBeLessThanOrEqual(1);
  });

  it('모든 놀이 차시가 그 단원의 단순 문항(핵심 개념 질문·단순 계산)을 새로 짓습니다', () => {
    const 없음: string[] = [];
    for (const unit of 단원들) {
      const 첫 = unit.lessons[0];
      if (놀이차시인가(첫) && !단순문항있나(첫)) 없음.push(`${unit.semester} ${unit.unitNo}단원 ${unit.title}`);
    }
    expect(없음).toEqual([]);
  });

  it('놀이마다 한 줄로 읽히는 문항이 넉넉하고, 보기에 답이 꼭 하나 있습니다', () => {
    const 모자람: string[] = [];
    for (const unit of 단원들) {
      const 첫 = unit.lessons[0];
      if (!놀이차시인가(첫)) continue;
      for (const lv of ['하', '중', '상'] as const) {
        for (const seed of [1, 777, 12345]) {
          const qs = 놀이문항(첫, lv, seed);
          if (qs.length < 24) 모자람.push(`${첫.title} ${lv} ${qs.length}개`);
          for (const q of qs) {
            const 글 = [q.prompt, ...q.choices, q.explanation].join(' ');
            expect(글, q.prompt).not.toMatch(/undefined|NaN|Infinity|null/);
            expect(q.prompt.replace(/\n/g, '').length, q.prompt).toBeLessThanOrEqual(56);
            expect(new Set(q.choices).size, q.prompt).toBe(q.choices.length);
            expect(q.choices.length, q.prompt).toBeGreaterThanOrEqual(3);
            expect(q.choices[q.answerIndex], q.prompt).toBe(q.answer);
            for (const one of q.choices) expect(one, q.prompt).not.toMatch(/^-/);
          }
          expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
        }
      }
    }
    expect(모자람).toEqual([]);
  }, 600000);

  // ── 독립 검산 ───────────────────────────────────────────────────────
  // 문항을 지은 코드와 상관없이, 식으로 된 문제는 식을 다시 계산해 답을 맞추어 봅니다.
  // 같은 값의 다른 꼴(2/4와 1/2)이 오답 자리에 있으면 답이 둘이 되므로 그것도 막습니다.
  const 값 = (글: string): number | null => {
    const 식 = 글.trim()
      .replace(/(\d+) (\d+)\/(\d+)/g, '($1+$2/$3)')
      .replace(/(\d+(?:\.\d+)?)\/(\d+)/g, '($1/$2)')
      .replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/(cm²|cm³|cm|mm|km|m|°C|°|%|개|명|마리|분|초|일|mL|L|kg|g|쌍)$/u, '');
    if (!/^[\d\s.+\-*/()]+$/.test(식)) return null;
    // eslint-disable-next-line no-new-func
    const v = Function(`return (${식});`)() as number;
    return Number.isFinite(v) ? v : null;
  };
  const 같다 = (a: number, b: number) => Math.abs(a - b) < 1e-9;

  it('식으로 된 놀이 문제는 다시 계산해도 같은 답이고, 오답에 같은 값이 없습니다', () => {
    let 검산 = 0;
    const 틀림: string[] = [];
    for (const unit of 단원들) {
      const 첫 = unit.lessons[0];
      if (!놀이차시인가(첫)) continue;
      for (const lv of ['하', '중', '상'] as const) {
        for (const q of 놀이문항(첫, lv, 2024)) {
          const 답값 = 값(q.answer);
          let 기대: number | null = null;
          const 계산 = /^(.+) = \?$/.exec(q.prompt);
          const 빈칸 = /^(.+) = (.+?)(?:, □는\?)?$/.exec(q.prompt);
          const 비 = /^(\d+) : (\d+) = (\d+) : □$/.exec(q.prompt);
          if (계산) 기대 = 값(계산[1]);
          else if (비) 기대 = (Number(비[2]) * Number(비[3])) / Number(비[1]);
          else if (빈칸 && q.prompt.includes('□') && 답값 !== null) {
            const 왼 = 값(빈칸[1].replace('□', `(${답값})`));
            const 오른 = 값(빈칸[2].replace('□', `(${답값})`));
            if (왼 !== null && 오른 !== null) {
              검산 += 1;
              if (!같다(왼, 오른)) 틀림.push(`${q.prompt} → ${q.answer}`);
            }
            continue;
          }
          if (기대 === null || 답값 === null) continue;
          검산 += 1;
          if (!같다(기대, 답값)) 틀림.push(`${q.prompt} → ${q.answer} (계산 ${기대})`);
          for (const one of q.choices) {
            const v = 값(one);
            if (one !== q.answer && v !== null && 같다(v, 답값)) 틀림.push(`${q.prompt}: 오답 ${one}이 답 ${q.answer}과 같은 값`);
          }
        }
      }
    }
    expect(틀림).toEqual([]);
    expect(검산).toBeGreaterThan(500);
  }, 600000);
});
