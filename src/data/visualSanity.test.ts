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

  it('marks the number line in the same steps the question jumps by', () => {
    const mismatched: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'number-line') continue;

          // '3000에서 1000씩 뛰어'인데 눈금이 300씩이면 세어 볼 수가 없습니다.
          const jump = question.prompt.match(/(\d+)에서 (\d+)씩/);
          if (!jump) continue;

          const step = Number(jump[2]);
          if (question.visual.step !== step) {
            mismatched.push(
              `${question.id}: ${step}씩 뛰는데 눈금은 ${question.visual.step}씩`,
            );
          }
        }
      }
    }

    expect(mismatched).toEqual([]);
  });

  it('counts in the question\'s own step and hides the answer for "몇보다 몇만큼 더" questions', () => {
    // '14보다 1만큼 더 큰 수'에 13씩 눈금을 그리면 한 칸을 셀 수가 없습니다.
    // 눈금 한 칸이 문제가 말하는 크기와 같아야(1만큼이면 1씩, 10만큼이면
    // 10씩) 한 칸만 세면 됩니다. 그리고 답이 있는 자리는 눈금만 있고 숫자는
    // 없어야 세어 보지 않고 읽어 버리는 일이 없습니다.
    const broken: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const nearby = question.prompt.match(/(\d+)보다 (\d+)만큼 더 (큰|작은)/);
          if (!nearby || question.visual?.kind !== 'number-line') continue;

          const from = Number(nearby[1]);
          const gap = Number(nearby[2]);
          const target = nearby[3] === '큰' ? from + gap : from - gap;
          if (target < 0) continue;

          const line = question.visual;
          if (line.step !== gap) {
            broken.push(`${question.id}: ${gap}만큼 세는 문제인데 눈금이 ${line.step}씩`);
          }
          if (from < line.start || from > line.end || target < line.start || target > line.end) {
            broken.push(`${question.id}: ${from}과 ${target}이 ${line.start}~${line.end} 밖`);
          }
          if (!line.hiddenLabels?.includes(target)) {
            broken.push(`${question.id}: 답 ${target}의 숫자가 눈금에 그대로 보임`);
          }
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it('only draws a shape pattern that the question actually shows', () => {
    // 규칙 찾기 단원에는 무늬 규칙 말고도 곱셈표·덧셈표·달력 규칙이 있습니다.
    // 예전에는 이 단원의 모든 문제에 ○△□ 무늬를 붙여서, 곱셈표 문제 옆에
    // 아무 상관 없는 도형이 놓였습니다. 그림에 그린 모양은 문제에도 그
    // 순서대로 적혀 있어야 합니다.
    const mismatched: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'pattern') continue;

          const drawn = question.visual.items.filter((item) => item !== '?');
          const inPrompt = question.prompt.match(/[○△□◇☆●▲■♥]/g) ?? [];

          if (inPrompt.length > 0) {
            // 문제가 모양을 적어 두었으면 그림도 그 순서 그대로여야 합니다.
            if (drawn.join('') !== inPrompt.join('')) {
              mismatched.push(
                `${question.id}: 그림은 ${drawn.join('')}인데 문제에는 ${inPrompt.join('')} — ${question.prompt.slice(0, 30)}`,
              );
            }
          } else if (!/무늬|모양/.test(question.prompt)) {
            // '무늬에서 ?에 들어갈 모양은?'처럼 그림이 곧 자료인 문제는
            // 문제에 모양을 적지 않는 것이 맞습니다. 그러나 곱셈표·덧셈표처럼
            // 모양 이야기가 아예 없는 문제에 무늬 그림이 붙으면 안 됩니다.
            mismatched.push(
              `${question.id}: 모양 이야기가 없는 문제에 ${drawn.join('')} 무늬가 붙음 — ${question.prompt.slice(0, 30)}`,
            );
          }
        }
      }
    }

    expect(mismatched).toEqual([]);
  });

  it('never draws a number line whose marks all sit on one spot', () => {
    const flat: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'number-line') continue;

          const marks = question.visual.marks.map((mark) => mark.value);
          // 점이 하나뿐인 것은 괜찮습니다. '14에서 한 칸'처럼 출발점만
          // 찍어 두고 도착점은 학생이 세어 찾게 하는 그림이 그렇습니다.
          // 점이 여럿인데 모두 같은 자리에 있으면 잘못 만든 그림입니다.
          if (marks.length > 1 && new Set(marks).size === 1) {
            flat.push(`${question.id}: ${question.prompt.slice(0, 34)}`);
          }
        }
      }
    }

    expect(flat).toEqual([]);
  });
});
