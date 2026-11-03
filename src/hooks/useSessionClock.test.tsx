// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSessionClock } from './useSessionClock';
afterEach(() => { cleanup(); vi.useRealTimers(); });
it('탭이 멈춘 동안의 실제 경과 시간을 반영하고 보너스와 재시작을 보존합니다', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-03T00:00:00Z'));
  const done = vi.fn();
  const { result, rerender } = renderHook(({ playing }) => useSessionClock(playing, 10, done), { initialProps: { playing: true } });
  act(() => { vi.setSystemTime(new Date('2026-11-03T00:00:09Z')); vi.advanceTimersByTime(200); });
  expect(result.current[0]).toBe(1);
  act(() => result.current[1](previous => previous + 2)); expect(result.current[0]).toBe(3);
  act(() => { vi.setSystemTime(new Date('2026-11-03T00:00:12Z')); vi.advanceTimersByTime(1000); });
  expect(result.current[0]).toBe(0); expect(done).toHaveBeenCalledTimes(1);
  rerender({ playing: false }); act(() => result.current[1](30)); rerender({ playing: true });
  act(() => vi.advanceTimersByTime(1000)); expect(result.current[0]).toBe(29);
});
