// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Difficulty, Lesson, Question } from './types';
import { answerFixture } from './reliabilityFixtures';
vi.mock('./components/ScratchPad', () => ({ ScratchPad: () => null }));
vi.mock('./data/engine', () => ({
  generateClassQuestions: (lesson: Lesson, difficulty: Difficulty): Question[] => [{ ...answerFixture(), id: 'q1', lessonId: lesson.id, difficulty, answerIndex: 0 }],
  조작섞기: (_lesson: Lesson, _difficulty: Difficulty, questions: Question[]) => questions,
  놀이문항: () => [],
}));
vi.mock('./relayDelivery', () => ({ enqueueAnswer: vi.fn(async () => {}), flushAnswers: vi.fn(async () => 0), watchAnswerDelivery: () => () => {} }));
vi.mock('./classroomRelay', async original => ({ ...await original<typeof import('./classroomRelay')>(), relayPing: vi.fn(async () => false), relayState: vi.fn(async () => null), relayReset: vi.fn(async () => {}), relayJoin: vi.fn(async () => null) }));
afterEach(() => { cleanup(); if (typeof localStorage !== 'undefined') localStorage.clear(); });
it('일반 힌트를 열었다 접어도 전송 기록에 사용 이력이 남고 QR 학급 정보를 따릅니다', async () => {
  history.replaceState({}, '', '/?m=1&sync=1&s=2-1&u=1&l=2-1-u1-l2&cy=2026&class=2-3');
  const { setMuted } = await import('./sound'); setMuted(true);
  const { default: App } = await import('./App');
  const { enqueueAnswer } = await import('./relayDelivery');
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: '1' }));
  fireEvent.click(await screen.findByRole('button', { name: '힌트 보기' }, { timeout: 5000 }));
  fireEvent.click(screen.getAllByRole('button', { name: '힌트 접기' })[0]);
  fireEvent.click(screen.getByText('10', { exact: true, selector: '.choice-text' }));
  await waitFor(() => expect(enqueueAnswer).toHaveBeenCalled());
  expect(vi.mocked(enqueueAnswer).mock.calls[0][1]).toMatchObject({ hintUsed: true, hintKinds: ['text'], classId: '2-3', schoolYear: 2026, attendanceNo: 1 });
});
