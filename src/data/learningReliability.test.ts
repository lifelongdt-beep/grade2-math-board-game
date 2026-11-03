import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { answerFixture } from '../reliabilityFixtures';

beforeEach(() => { vi.resetModules(); vi.stubGlobal('indexedDB', new IDBFactory()); });
describe('실제 IndexedDB 기록과 백업 검증', () => {
  it('영구 저장·중복 제거·복원과 불완전 백업 거부', async () => {
    const log = await import('./learningLog');
    const one = log.기록만들기(answerFixture(), { no: 1 }, { id: 'L', semester: '2-1', unitNo: 1, unitTitle: '세 자리 수', lessonNo: 2, title: '백' });
    await log.기록더하기([one, one]);
    expect(await log.기록모두읽기()).toHaveLength(1);
    expect(log.백업풀기(JSON.stringify(log.백업만들기([one])))).toEqual([one]);
    const reject = (record: unknown, version = 1) => log.백업풀기(JSON.stringify({ kind: 'math-learning-log', version, records: [record] }));
    expect(reject(one, 999)).toBeNull();
    expect(reject({ id: 'broken', no: 1, semester: '2-1', date: '2026-11-03' })).toBeNull();
    expect(reject({ ...one, date: '2026-02-31' })).toBeNull();
    expect(reject({ ...one, responseMs: -1 })).toBeNull();
    expect(reject({ ...one, support: { steps: '잘못된 형식' } })).toBeNull();
    expect(reject({ ...one, semester: '9-1' })).toBeNull();
    await log.기록지우기([one.id]); expect(await log.기록모두읽기()).toEqual([]);
    await log.되돌리기(); expect(await log.기록모두읽기()).toHaveLength(1);
  });
  it('교사 선택 차시와 다른 종합 복습 기록도 복원', async () => {
    const { resolveRecordLesson } = await import('./learningLog');
    expect(resolveRecordLesson(answerFixture({ lessonId: '2-1-u3-review' }), new Map())).toMatchObject({ semester: '2-1', unitNo: 3, lessonNo: 0 });
    expect(resolveRecordLesson(answerFixture({ lessonId: '2-1-semester-review' }), new Map())).toMatchObject({ semester: '2-1', unitNo: 0 });
  });
});
