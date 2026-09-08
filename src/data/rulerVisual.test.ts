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

  // 문제가 되풀이하는 무늬를 이름 대어 말했으면, 그림도 그 무늬여야
  // 합니다. '○△△가 되풀이됩니다'(답 △)에 ○△□가 놓여 있었고,
  // '빨강과 파랑이 되풀이될 때'에도 ○△□가 놓였습니다. 그림을 믿고 센
  // 아이는 문제와 다른 답에 이릅니다.
  it('repeats the pattern the question names, not a stock one', () => {
    const wrong: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.visual?.kind !== 'pattern') continue;

          const shapes = /([○△◇☆●▲■♥]{2,6})[이가을를]?\s*(?:되풀이|반복)/.exec(question.prompt);
          const named = /([가-힣]{1,4})(?:과|와)\s*([가-힣]{1,4}?)[이가]?\s*(?:되풀이|반복)/.exec(
            question.prompt,
          );
          if (!shapes && !named) continue;

          const said = shapes
            ? new Set(shapes[1].split(''))
            : new Set([named![1], named![2].replace(/(?:이|가)$/, '')]);
          const drawn = new Set(question.visual.items.filter((one) => one !== '?'));
          const same = said.size === drawn.size && [...said].every((one) => drawn.has(one));
          if (!same) {
            wrong.push(
              `${question.id}: '${question.prompt}' 인데 그림은 ${question.visual.items.join('')}`,
            );
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  // 자리값표는 문제가 묻는 자리를 가려야 합니다. 맨 앞 자리를 가리던
  // 때에는 '8541의 일의 자리 숫자는 무엇일까요?'(답 1)의 일 칸에 1이
  // 그대로 적혀 있어, 수를 읽어 볼 것 없이 표만 보면 되었습니다.
  it('hides the place the question asks about', () => {
    const shown: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const visual = question.visual;
          if (visual?.kind !== 'table' || visual.label !== '자리값 표') continue;

          const asked = /(천|백|십|일)의 자리/.exec(question.prompt)?.[1];
          if (!asked) continue;
          const cell = visual.columns.find((one) => one.name === asked);
          if (cell && cell.value !== null) {
            shown.push(`${question.id}: '${question.prompt}' 인데 ${asked} 칸에 ${cell.value}`);
          }
        }
      }
    }

    expect(shown).toEqual([]);
  });

  // 같은 물음에 두 가지 답이 있으면 아이는 무엇을 배워야 할지 알 수
  // 없습니다. '2547은 100이 몇 개인 수일까요?'의 답은 25(통째로 센 것)
  // 였고 '5941은 10이 몇 개인 수일까요?'의 답은 4(자리의 숫자)였습니다.
  // 같은 4차시 안에서였습니다.
  it('never asks the same place-value question two different ways', () => {
    const mixed: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const asked = /^(\d+)[은는]\s*(\d+)이 몇 개인 수일까요\?$/.exec(question.prompt);
          if (!asked) continue;

          const value = Number(asked[1]);
          const unit = Number(asked[2]);
          const answer = Number(String(question.answer).replace(/[^\d]/g, ''));
          const whole = Math.floor(value / unit);
          const digit = whole % 10;
          // 두 읽기가 갈리는 수에서는 이 물음을 쓰지 않습니다. 자리별로
          // 가르는 문항은 네 자리를 모두 늘어놓고 한 자리만 비웁니다.
          //
          // 다만 자리의 숫자가 0이면 그 읽기는 뜻이 없습니다 — '100은
          // 10이 몇 개인 수일까요?'를 '0개'라고 답할 아이는 없습니다.
          // 100을 처음 배울 때 쓰는 교과서 문장이므로 그대로 둡니다.
          if (whole !== digit && digit !== 0) {
            mixed.push(`${question.id}: '${question.prompt}' → ${question.answer} (통째로 ${whole} / 자리 ${digit})`);
          }
        }
      }
    }

    expect(mixed).toEqual([]);
  });

  // 셈하는 문항의 막대그림이 답까지 그리고 있었습니다. '39+24+6은
  // 얼마일까요?' 옆에 69짜리 막대가 놓여, 더할 것 없이 그것만 읽으면
  // 되었습니다.
  it('does not draw the answer as one of the calculation bars', () => {
    const gaveItAway: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.type !== 'addition' && question.type !== 'subtraction') continue;
          if (question.visual?.kind !== 'bar-model') continue;

          const answer = Number(String(question.answer).replace(/[^\d]/g, ''));
          if (!Number.isFinite(answer)) continue;
          const inPrompt = (question.prompt.match(/\d+/g) ?? []).map(Number);
          if (inPrompt.includes(answer)) continue;

          if (question.visual.bars.some((bar) => bar.value === answer)) {
            gaveItAway.push(`${question.id}: '${question.prompt}' → ${question.answer} 인데 막대에 ${answer}`);
          }
        }
      }
    }

    expect(gaveItAway).toEqual([]);
  });
});
