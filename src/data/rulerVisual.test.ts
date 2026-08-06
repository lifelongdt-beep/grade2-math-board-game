import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 자 그림에서 숫자가 겹치면 학생이 눈금을 읽을 수 없습니다.
// RulerGraphic과 같은 값으로 라벨 간격을 계산해 확인합니다.
const TRACK_WIDTH = 316;
const LABEL_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200];
const MIN_LABEL_GAP = 26;

describe('ruler visual', () => {
  it('leaves enough room between the numbers on the ruler', () => {
    const tooTight: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'ruler') continue;

          const { start, end } = question.visual;
          const range = Math.max(1, end - start);
          const pixelsPerUnit = TRACK_WIDTH / range;
          const labelStep = LABEL_STEPS.find((step) => step * pixelsPerUnit >= MIN_LABEL_GAP) ?? 500;
          const gap = labelStep * pixelsPerUnit;

          if (gap < MIN_LABEL_GAP) {
            tooTight.push(`${question.id}: ${start}~${end} 눈금 간격 ${Math.round(gap)}px`);
          }
        }
      }
    }

    expect(tooTight).toEqual([]);
  });

  it('keeps the highlighted length inside the ruler', () => {
    const outside: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'ruler') continue;

          const { start, end, highlightStart, highlightEnd } = question.visual;
          if (highlightStart < start || highlightEnd > end || highlightEnd < highlightStart) {
            outside.push(
              `${question.id}: 자 ${start}~${end} 인데 표시 구간이 ${highlightStart}~${highlightEnd}`,
            );
          }
        }
      }
    }

    expect(outside).toEqual([]);
  });
});
