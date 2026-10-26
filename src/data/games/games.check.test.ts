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

// 모든 학년 모든 단원 맨 앞에 놀이 차시가 붙고, 놀이마다 빨리 풀리는 문항이 넉넉해야 합니다.
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

  it('놀이마다 몇 초 안에 읽히는 문항이 넉넉하고, 보기에 답이 꼭 하나 있습니다', () => {
    const 모자람: string[] = [];
    for (const unit of 단원들) {
      const 첫 = unit.lessons[0];
      if (!놀이차시인가(첫)) continue;
      for (const lv of ['하', '중'] as const) {
        const qs = 놀이문항(첫, lv, 12345);
        if (qs.length < 16) 모자람.push(`${첫.title} ${lv} ${qs.length}개`);
        for (const q of qs) {
          expect(q.manipulate, q.prompt).toBeUndefined();
          expect(q.prompt.length, q.prompt).toBeLessThanOrEqual(72);
          expect(new Set(q.choices).size, q.prompt).toBe(4);
          expect(q.choices[q.answerIndex], q.prompt).toBe(q.answer);
        }
        expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
      }
    }
    expect(모자람).toEqual([]);
  }, 600000);
});
