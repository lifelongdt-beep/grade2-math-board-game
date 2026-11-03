import { afterEach, expect, it, vi } from 'vitest';
import { answerFixture } from './reliabilityFixtures';
const mocks = vi.hoisted(() => ({ initializeApp: vi.fn(() => ({})), deleteApp: vi.fn(async () => {}), initializeAuth: vi.fn(() => ({})), signOut: vi.fn(async () => {}), signIn: vi.fn(), set: vi.fn(async (_path: unknown, _data: unknown) => {}) }));
vi.mock('firebase/app', () => ({ initializeApp: mocks.initializeApp, deleteApp: mocks.deleteApp }));
vi.mock('firebase/auth', () => ({ initializeAuth: mocks.initializeAuth, inMemoryPersistence: 'memory', signInWithCustomToken: mocks.signIn, signOut: mocks.signOut }));
vi.mock('firebase/database', () => ({ getDatabase: () => ({}), ref: (_db: unknown, path: string) => path, set: mocks.set, get: vi.fn(), query: vi.fn(), orderByKey: vi.fn(), startAfter: vi.fn(), limitToFirst: vi.fn(), remove: vi.fn() }));
afterEach(() => { vi.clearAllMocks(); });
it('학생 토큰은 메모리에만 유지하고 학생 ID를 확인한 뒤 같은 답안을 같은 경로에 전송합니다', async () => {
  mocks.signIn.mockResolvedValue({ user: { getIdTokenResult: async () => ({ claims: { role: 'student', roomId: 'a'.repeat(36), playerId: 100001, attendanceNo: 1 } }) } });
  const { openSecureCloud } = await import('./secureCloudRelay');
  const session = await openSecureCloud({ projectId: 'demo-math-board' }, 'a'.repeat(36), 'FAKE_CUSTOM_TOKEN');
  expect(mocks.initializeAuth).toHaveBeenCalledWith(expect.anything(), { persistence: 'memory' });
  const answer = answerFixture({ playerId: 100001, attendanceNo: 1 });
  await session.record(answer); await session.record(answer);
  expect(mocks.set.mock.calls[0][0]).toBe(mocks.set.mock.calls[1][0]);
  await expect(session.record({ ...answer, playerId: 100002 })).rejects.toThrow();
  await session.close(); expect(mocks.signOut).toHaveBeenCalledOnce(); expect(mocks.deleteApp).toHaveBeenCalledOnce();
});
it('다른 방의 토큰이나 잘못된 방 주소는 거부하고 생성한 인증 앱을 정리합니다', async () => {
  const { openSecureCloud } = await import('./secureCloudRelay');
  await expect(openSecureCloud({}, '../rooms', 'FAKE')).rejects.toThrow();
  expect(mocks.initializeApp).not.toHaveBeenCalled();
  mocks.signIn.mockResolvedValue({ user: { getIdTokenResult: async () => ({ claims: { role: 'student', roomId: 'other', playerId: 1, attendanceNo: 1 } }) } });
  await expect(openSecureCloud({}, 'a'.repeat(36), 'FAKE')).rejects.toThrow();
  expect(mocks.deleteApp).toHaveBeenCalledOnce();
});
