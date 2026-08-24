import { describe, expect, it } from 'vitest';
import { splitPrompt } from './HighlightedPrompt';
import { lessons } from '../data/curriculum';
import { generateQuestions } from '../data/questionFactory';

const marked = (text: string) =>
  splitPrompt(text)
    .filter((piece) => piece.kind === 'keyword')
    .map((piece) => piece.text);

describe('문제글의 핵심 말 강조', () => {
  // 낱말이 아니라 글자를 칠하면 읽기가 더 어려워집니다. '차례입니다'의
  // '차' 한 글자에만 색이 들어가 있어, 아이가 '차'와 '례'를 따로 읽게
  // 되었습니다.
  it('다른 낱말 속에 든 글자는 칠하지 않는다', () => {
    const traps: Array<[string, string]> = [
      ['안내된 차례를 따라 수를 알아보는 차례입니다.', '차'],
      ['두 수를 더하면 얼마인지 구합니다.', '합'],
      ['1시간은 60분입니다.', '시'],
      ['색칠한 부분은 얼마일까요?', '분'],
      ['그림을 배열해 보세요.', '배'],
      ['곱셈구구를 알아볼까요?', '곱'],
      ['모양이 변화하는 규칙을 찾아보세요.', '변'],
      ['기차가 지나갑니다.', '차'],
    ];

    for (const [text, letter] of traps) {
      expect(marked(text), text).not.toContain(letter);
    }
  });

  it('낱말로 쓰인 곳은 칠한다', () => {
    expect(marked('두 수의 합은 얼마일까요?')).toContain('합');
    expect(marked('두 수의 차를 구해 보세요.')).toContain('차');
    expect(marked('지금은 3시입니다.')).toContain('시');
    expect(marked('20분 뒤는 몇 시일까요?')).toContain('분');
    expect(marked('파란 끈은 빨간 끈의 몇 배일까요?')).toContain('배');
    expect(marked('변이 3개인 도형입니다.')).toContain('변');
    expect(marked('백의 자리 숫자는 얼마일까요?')).toContain('자리 숫자');
  });

  it('실제 문항에서 글자를 쪼개거나 낱말 가운데를 칠하지 않는다', () => {
    const hangul = /[가-힣]/;
    // 한 글자 낱말 뒤에 올 수 있는 조사와 씨끝의 첫 글자입니다.
    const tails = '은는이가을를의와과도로만에서부터까입일보';
    const lost: string[] = [];
    const split: string[] = [];

    for (const lesson of lessons) {
      for (const level of ['하', '중', '상'] as const) {
        for (const question of generateQuestions(lesson, level)) {
          const pieces = splitPrompt(question.prompt);

          // 칠하다가 글자를 흘리면 문제글이 달라집니다.
          if (pieces.map((piece) => piece.text).join('') !== question.prompt) {
            lost.push(question.prompt);
          }

          pieces.forEach((piece, index) => {
            if (piece.kind !== 'keyword' || piece.text.length !== 1) return;
            const before = pieces[index - 1]?.text.slice(-1);
            const after = pieces[index + 1]?.text.slice(0, 1);
            if (before && hangul.test(before)) {
              split.push(`${question.prompt} → 앞이 '${before}'인데 '${piece.text}'을 칠함`);
            }
            if (after && hangul.test(after) && !tails.includes(after)) {
              split.push(`${question.prompt} → 뒤가 '${after}'인데 '${piece.text}'을 칠함`);
            }
          });
        }
      }
    }

    expect(lost.slice(0, 3)).toEqual([]);
    expect(split.slice(0, 5)).toEqual([]);
  });
});
