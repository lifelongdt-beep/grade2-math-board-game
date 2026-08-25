import { describe, expect, it } from 'vitest';
import { studyGuideFor } from './studyGuide';
import type { AnswerRecord } from '../types';

const record = (over: Partial<AnswerRecord>): AnswerRecord => ({
  id: `${Math.trunc(over.playerId ?? 1)}-${over.questionId ?? 'q'}-${over.correct ? 'o' : 'x'}`,
  playerId: 1,
  playerName: '1번 학생',
  questionId: 'q1',
  lessonId: 'l1',
  unitTitle: '곱셈구구',
  lessonTitle: '5단 곱셈구구를 알아볼까요',
  difficulty: '중',
  prompt: '5×3은 얼마일까요?',
  choices: ['15', '8', '10', '20'],
  answer: '15',
  explanation: '',
  misconception: '',
  type: 'multiplication',
  strategy: '기초 · 개념 확인 · 곱셈구구 계산하기',
  support: {
    studentConcept: '',
    studentHint: '',
    steps: ['', '', ''],
    misconceptionTip: '자리를 맞추어 보세요.',
    selfCheck: '다시 세어 보았나요?',
  },
  correct: true,
  chosen: '15',
  attempts: 1,
  responseMs: 3000,
  answeredAt: '2026-08-25T00:00:00.000Z',
  ...over,
} as AnswerRecord);

describe('공부 안내', () => {
  // 걸린 곳만 적힌 화면을 받아 드는 아이는 다음에 손을 들지 않습니다.
  it('푼 문제가 있으면 늘 칭찬할 말을 찾는다', () => {
    const allWrong = [1, 2, 3].map((no) =>
      record({ questionId: `q${no}`, correct: false, chosen: '8' }),
    );
    expect(studyGuideFor(allWrong, 1).cheer).not.toBe('');

    const mixed = [
      record({ questionId: 'a', correct: false }),
      record({ questionId: 'b', correct: true }),
    ];
    expect(studyGuideFor(mixed, 1).cheer).not.toBe('');

    const perfect = [record({ questionId: 'a' }), record({ questionId: 'b' })];
    expect(studyGuideFor(perfect, 1).cheer).toContain('모두 맞혔어요');
  });

  it('틀렸다가 다시 맞힌 것을 알아본다', () => {
    const again = [
      record({ questionId: 'a', correct: false }),
      record({ questionId: 'a', correct: true }),
      record({ questionId: 'b', correct: false }),
    ];
    const guide = studyGuideFor(again, 1);
    expect(guide.recovered).toBe(1);
    expect(guide.cheer).toContain('다시');
  });

  it('잘한 갈래에는 무엇을 할 줄 알게 되었는지 적는다', () => {
    const good = [record({ questionId: 'a' }), record({ questionId: 'b' })];
    const guide = studyGuideFor(good, 1);
    expect(guide.strong.length).toBeGreaterThan(0);
    for (const one of guide.strong) {
      expect(one.praise.length).toBeGreaterThan(8);
      // 몇 번 맞혔는지는 아이가 이미 압니다.
      expect(one.praise).not.toMatch(/\d+번/);
    }
  });

  it('푼 것이 없으면 칭찬도 없다', () => {
    expect(studyGuideFor([], 1).cheer).toBe('');
  });
});
