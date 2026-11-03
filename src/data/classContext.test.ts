import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { academicYear, classKey, readClassContext, readScopedStorage, scopedStorageKey, studentKey, writeClassContext } from './classContext';
beforeEach(() => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  vi.stubGlobal('localStorage', storage); vi.stubGlobal('window', { localStorage: storage, location: { search: '' } });
});
afterEach(() => vi.unstubAllGlobals());
it('같은 출석번호도 학년도·반이 다르면 별개이고 기존 보상은 한 번만 이동합니다', () => {
  localStorage.setItem('rewards', 'old');
  expect(readScopedStorage('rewards')).toBe('old');
  const first = studentKey(1);
  writeClassContext({ schoolYear: 2026, classId: '2-2' });
  expect(studentKey(1)).not.toBe(first); expect(readScopedStorage('rewards')).toBeNull();
  writeClassContext({ schoolYear: 2027, classId: '기본 학급' });
  expect(readScopedStorage('rewards')).toBeNull();
  expect(classKey({})).toBe('legacy'); expect(scopedStorageKey('x')).toContain('2027');
});
it('휴대폰 공유 링크의 학급을 따르고 1~2월은 이전 학년도로 봅니다', () => {
  window.location.search = '?m=1&cy=2026&class=2-3';
  expect(readClassContext()).toEqual({ schoolYear: 2026, classId: '2-3' });
  expect(academicYear(new Date(2027, 1, 1))).toBe(2026);
  expect(academicYear(new Date(2027, 2, 1))).toBe(2027);
});
