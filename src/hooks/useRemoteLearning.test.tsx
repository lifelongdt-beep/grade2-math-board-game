// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { answerFixture } from '../reliabilityFixtures';
vi.mock('../classroomRelay', () => ({ relayState: vi.fn() }));
vi.mock('../data/learningLog', async original => ({ ...await original<typeof import('../data/learningLog')>(), 기록더하기: vi.fn(), resolveRecordLesson: () => ({ id: '2-1-u1-l2', semester: '2-1', unitNo: 1, unitTitle: '수', lessonNo: 2, title: '백' }) }));
afterEach(() => { cleanup(); vi.useRealTimers(); });
it('영구 저장 실패 시 커서를 앞당기지 않고 다음 조회에서 같은 답안을 다시 저장합니다', async () => {
  vi.useFakeTimers();
  const { relayState } = await import('../classroomRelay');
  const { 기록더하기 } = await import('../data/learningLog');
  const { useRemoteLearning } = await import('./useRemoteLearning');
  vi.mocked(relayState).mockResolvedValue({ players: [], records: [answerFixture()], cursor: 'key1', hasMore: false });
  vi.mocked(기록더하기).mockRejectedValueOnce(new Error('disk full')).mockResolvedValue(undefined);
  const target = { kind: 'local' as const }, lessons = new Map();
  const { result } = renderHook(() => useRemoteLearning(target, true, lessons, 0));
  await act(async () => {});
  expect(result.current.records).toHaveLength(0);
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(vi.mocked(relayState).mock.calls.slice(0, 2).map(call => call[1])).toEqual([undefined, undefined]);
  expect(result.current.records).toHaveLength(1);
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(vi.mocked(relayState).mock.calls[2][1]).toBe('key1');
});
