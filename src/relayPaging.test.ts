import { afterEach, expect, it, vi } from 'vitest';
import { relayRecord, relayState } from './classroomRelay';
import { answerFixture } from './reliabilityFixtures';
afterEach(() => vi.unstubAllGlobals());
it('250개 답안을 여러 페이지로 가져오며 경계 답안을 중복하거나 누락하지 않습니다', async () => {
  const all = Object.fromEntries(Array.from({ length: 250 }, (_, i) => [String(i).padStart(4, '0'), answerFixture({ id: `a${i}` })]));
  vi.stubGlobal('fetch', vi.fn(async (value: string) => {
    const url = new URL(value);
    const from = JSON.parse(url.searchParams.get('startAt') ?? '""');
    const body = url.pathname.endsWith('/players.json') ? {} : Object.fromEntries(Object.entries(all).filter(([key]) => key >= from).slice(0, Number(url.searchParams.get('limitToFirst'))));
    return new Response(JSON.stringify(body));
  }));
  const ids: string[] = []; let cursor: string | undefined;
  for (let i = 0; i < 5; i++) {
    const state = await relayState({ kind: 'cloud', dbUrl: 'https://example.firebaseio.com', room: 'ABCDEFGH' }, cursor);
    expect(state).not.toBeNull(); ids.push(...state!.records.map(r => r.id)); cursor = state!.cursor;
    if (!state!.hasMore) break;
  }
  expect(ids).toHaveLength(250); expect(new Set(ids).size).toBe(250);
});
it('같은 답안 재전송은 같은 키를 덮어쓰고 해설·그림을 보존합니다', async () => {
  const fetcher = vi.fn(async (_url: string, _init?: RequestInit) => new Response('{}'));
  vi.stubGlobal('fetch', fetcher);
  const record = answerFixture({ visual: { kind: 'clock', label: '시계', hour: 3, minute: 0 } });
  const target = { kind: 'cloud' as const, dbUrl: 'https://example.firebaseio.com', room: 'ABCDEFGH' };
  expect(await relayRecord(target, record)).toBe(true); expect(await relayRecord(target, record)).toBe(true);
  expect(fetcher.mock.calls[0][0]).toBe(fetcher.mock.calls[1][0]);
  expect(fetcher.mock.calls[0][1]).toMatchObject({ method: 'PUT', body: JSON.stringify(record) });
});
