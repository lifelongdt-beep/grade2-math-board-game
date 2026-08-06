import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 그림에 쓰이는 수는 모두 제대로 된 수여야 합니다.
// NaN이 들어가면 화면에는 선 하나와 점 하나만 남은 그림이 그려집니다.
const numbersIn = (visual: QuestionVisual): number[] => {
  switch (visual.kind) {
    case 'number-line':
      return [visual.start, visual.end, visual.step, ...visual.marks.map((mark) => mark.value)];
    case 'ruler':
      return [visual.start, visual.end, visual.highlightStart, visual.highlightEnd];
    case 'place-value':
      return visual.columns.flatMap((column) => [column.value, column.blocks ?? 0]);
    case 'bar-model':
      return visual.bars.map((bar) => bar.value);
    case 'clock':
      return [visual.hour, visual.minute, visual.endHour ?? 0, visual.endMinute ?? 0];
    case 'calendar':
      return [visual.startWeekday, visual.days, ...visual.marks.map((mark) => mark.day)];
    case 'table':
      return [
        ...visual.columns.map((column) => (column.value === null ? 0 : column.value)),
        visual.total ?? 0,
      ];
    case 'pictograph':
      return [visual.unit, ...visual.items.map((item) => item.count)];
    case 'array':
      return [visual.rows, visual.columns, visual.fadedRows ?? 0];
    case 'cube-stack':
      return visual.cubes.flatMap((cube) => [cube.x, cube.y, cube.z]);
    default:
      return [];
  }
};

describe('question visuals', () => {
  it('never draws a visual built from a value that is not a number', () => {
    const broken: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (!question.visual) continue;

          const bad = numbersIn(question.visual).filter((value) => !Number.isFinite(value));
          if (bad.length > 0) {
            broken.push(`${question.id} (${question.visual.kind}): ${question.prompt.slice(0, 34)}`);
          }
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it('leaves enough room between the numbers on a number line', () => {
    // NumberLineGraphic과 같은 값으로 계산합니다.
    const TRACK_WIDTH = 312;
    const tooTight: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'number-line') continue;

          const { start, end, step } = question.visual;
          const ticks: number[] = [];
          for (let value = start; value <= end; value += step) ticks.push(value);
          if (ticks.length < 2) continue;

          const longest = ticks.reduce((most, value) => Math.max(most, String(value).length), 1);
          const needed = longest * 10 + 6;
          const tickGap = TRACK_WIDTH / (ticks.length - 1);
          const labelEvery = Math.max(1, Math.ceil(needed / Math.max(tickGap, 1)));
          const labelGap = tickGap * labelEvery;

          if (labelGap < needed) {
            tooTight.push(`${question.id}: ${start}~${end} 간격 ${Math.round(labelGap)}px`);
          }
        }
      }
    }

    expect(tooTight).toEqual([]);
  });

  it('never hands the answer to the student in the picture', () => {
    const gives: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const visual = question.visual;
          if (!visual) continue;

          const answer = Number(String(question.answer).match(/-?\d+/)?.[0]);
          if (!Number.isFinite(answer)) continue;

          // 수직선에서 굵게 표시된 점이 곧 정답이면 세어 보지 않아도 답이 보입니다.
          if (visual.kind === 'number-line') {
            const active = visual.marks.filter((mark) => mark.active).map((mark) => mark.value);
            if (active.includes(answer)) {
              gives.push(`${question.id} (수직선): ${question.prompt.slice(0, 34)}`);
            }
          }

          // 자리값 표에 적힌 수가 곧 정답이면 표만 읽고 답을 쓸 수 있습니다.
          if (visual.kind === 'place-value') {
            const shown = visual.columns.reduce((total, column) => total * 10 + column.value, 0);
            if (shown === answer) {
              gives.push(`${question.id} (자리값 표 ${shown}): ${question.prompt.slice(0, 30)}`);
            }
          }
        }
      }
    }

    expect(gives).toEqual([]);
  });

  it('never draws a number line whose marks all sit on one spot', () => {
    const flat: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'number-line') continue;

          const marks = question.visual.marks.map((mark) => mark.value);
          if (new Set(marks).size <= 1) {
            flat.push(`${question.id}: ${question.prompt.slice(0, 34)}`);
          }
        }
      }
    }

    expect(flat).toEqual([]);
  });
});
