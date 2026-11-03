import { afterEach, expect, it, vi } from 'vitest';
import { authorizeLocalTeacher } from './classroomRelay';
afterEach(() => vi.unstubAllGlobals());
it('로컬 교사 키만 헤더로 전달하고 성공하면 주소에서 제거하며 외부 호스트에는 보내지 않습니다', async () => {
  const fetcher = vi.fn(async () => new Response('{}'));
  const replaceState = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  vi.stubGlobal('window', { location: { hostname: '127.0.0.1', hash: '#teacher=test-secret&other=keep', pathname: '/', search: '?s=2-1' }, history: { replaceState } });
  await authorizeLocalTeacher();
  expect(fetcher).toHaveBeenCalledWith('/api/session', expect.objectContaining({ headers: { 'X-Math-Teacher': 'test-secret' } }));
  expect(replaceState).toHaveBeenCalledWith(null, '', '/?s=2-1#other=keep');
  vi.stubGlobal('window', { location: { hostname: 'example.com', hash: '#teacher=test-secret' } });
  await authorizeLocalTeacher(); expect(fetcher).toHaveBeenCalledTimes(1);
});
