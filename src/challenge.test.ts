import { describe, expect, it } from 'vitest';
import { advancePlayerState, getPlayerQuestion, shownLevel } from './playerState';
import type { Difficulty, PlayerQuestionState, Question } from './types';

const 상태 = (덧: Partial<PlayerQuestionState> = {}): PlayerQuestionState => ({
  questionIndex: 0,
  served: 0,
  selected: null,
  correct: null,
  locked: false,
  questionStartedAt: 0,
  feedback: 'idle',
  answered: 0,
  retries: [],
  activeRetry: null,
  level: '하',
  justMoved: null,
  streak: 1,
  missStreak: 1,
  ...덧,
});

const 문제집 = Object.fromEntries((['하', '중', '상'] as Difficulty[]).map((level) => [
  level,
  Array.from({ length: 5 }, (_, i) => ({ id: `${level}-${i}` }) as Question),
])) as Record<Difficulty, Question[]>;

describe('도전 카드', () => {
  it('도전 중이면 한 단계 위 문제집에서 문제를 냅니다', () => {
    const 도전 = 상태({ challenge: '중' });
    expect(shownLevel(도전)).toBe('중');
    expect(getPlayerQuestion(문제집, 도전).id).toBe('중-0');
  });

  it('도전 문제를 틀려도 다시 내지 않고 연속 오답·연속 정답 셈도 그대로 둡니다', () => {
    const 다음 = advancePlayerState(상태({ challenge: '중' }), 1, true, 5);
    expect(다음.retries).toHaveLength(0);
    expect(다음.missStreak).toBe(1);
    expect(다음.streak).toBe(1);
    expect(다음.level).toBe('하');
    expect(다음.challenge ?? null).toBeNull();
  });

  it('보통 문제를 틀리면 예전처럼 다시 낼 줄에 넣습니다', () => {
    const 다음 = advancePlayerState(상태(), 1, true, 5);
    expect(다음.retries).toHaveLength(1);
    expect(다음.missStreak).toBe(2);
    expect(다음.level).toBe('하');
  });

  it('도전 문제를 맞히면 연속 정답으로 셉니다', () => {
    const 다음 = advancePlayerState(상태({ challenge: '중', streak: 2 }), 1, false, 5);
    expect(다음.level).toBe('중');
    expect(다음.justMoved).toBe('up');
  });
});
