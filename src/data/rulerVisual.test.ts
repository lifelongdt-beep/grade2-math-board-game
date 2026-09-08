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

  // 자 그림은 '어디부터 어디까지'를 아주 구체적으로 그립니다. 그 수가
  // 문제에도 답에도 없으면, 아이는 그림과 문제를 이어 붙일 데가 없습니다.
  // 예전에는 '사람마다 뼘의 길이가 달라 불편했습니다. 이를 해결하는
  // 방법은?'처럼 잴 길이가 아예 없는 문항에도 0~8cm짜리 자가 붙어
  // 있었습니다. 8은 문제 어디에도 없는 수였습니다.
  it('draws only rulers whose marks the question actually mentions', () => {
    const loose: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'ruler') continue;

          const { highlightStart, highlightEnd, elided } = question.visual;
          const inPrompt = new Set((question.prompt.match(/\d+/g) ?? []).map(Number));
          const answerNumber = Number(String(question.answer).replace(/[^\d]/g, ''));
          const length = highlightEnd - highlightStart;

          // 왼쪽을 물결로 끊은 자는 0에서 끝 눈금까지를 보여 주는
          // 그림입니다. 시작 눈금은 자리를 맞추려고 잡은 수일 뿐입니다.
          const tied = elided
            ? inPrompt.has(highlightEnd) ||
              highlightEnd === answerNumber ||
              [...inPrompt].some((first) =>
                [...inPrompt].some((second) => first * 100 + second === highlightEnd),
              )
            : inPrompt.has(highlightStart) ||
              inPrompt.has(highlightEnd) ||
              inPrompt.has(length) ||
              length === answerNumber;

          if (!tied) {
            loose.push(
              `${question.id}: '${question.prompt}' (답 ${question.answer}) 인데 자는 ${highlightStart}~${highlightEnd}`,
            );
          }
        }
      }
    }

    expect(loose).toEqual([]);
  });

  // 막대그림은 여섯 줄까지만 그립니다. 그보다 많이 만들면 아래 줄이
  // 그려지지 않아, '6뼘'이라고 적힌 문제 옆에 막대가 네 개만 놓입니다.
  // 그림이 문제와 다른 수를 말하게 됩니다.
  it('never asks for more bars than the picture draws', () => {
    const tooMany: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'bar-model') continue;
          if (question.visual.bars.length > 6) {
            tooMany.push(`${question.id}: 막대 ${question.visual.bars.length}개`);
          }
        }
      }
    }

    expect(tooMany).toEqual([]);
  });
});
