import { relayJoin, relayRecord, type RelayTarget } from './classroomRelay';
import type { AnswerRecord, Player } from './types';
import { reportStorage } from './data/storageStatus';

export interface PendingAnswer { id: string; target: RelayTarget; record: AnswerRecord; player: Player; remoteId: number }
const volatile = new Map<string, PendingAnswer>();
let opening: Promise<IDBDatabase | null> | undefined;
const db = () => opening ??= new Promise(resolve => {
  if (typeof indexedDB === 'undefined') return resolve(null);
  try {
    const request = indexedDB.open('mathRelayOutbox', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('pending', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = request.onblocked = () => resolve(null);
  } catch { resolve(null); }
});
const transaction = (database: IDBDatabase, action: (store: IDBObjectStore) => void) => new Promise<void>((resolve, reject) => {
  const tx = database.transaction('pending', 'readwrite');
  tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error);
  action(tx.objectStore('pending'));
});
export const pendingAnswers = async (): Promise<PendingAnswer[]> => {
  const database = await db();
  const saved = database ? await new Promise<PendingAnswer[]>((resolve, reject) => {
    const request = database.transaction('pending').objectStore('pending').getAll();
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  }) : [];
  return [...new Map([...saved, ...volatile.values()].map(x => [x.id, x])).values()];
};
export const enqueueAnswer = async (target: RelayTarget, record: AnswerRecord, player: Player) => {
  const identity = `${record.sessionId ?? record.id}|${record.studentId ?? player.attendanceNo}`;
  const hash = Array.from(identity).reduce((value, ch) => Math.imul(value ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const item: PendingAnswer = { id: `${JSON.stringify(target)}|${record.id}`, target, record, player, remoteId: 100000 + hash % 2000000000 };
  volatile.set(item.id, item);
  try {
    const database = await db();
    if (!database) throw new Error('저장소 없음');
    await transaction(database, store => store.put(item));
    volatile.delete(item.id);
  } catch {
    reportStorage('전송 대기 답안을 기기에 보관하지 못했습니다. 답안 전송이 끝날 때까지 이 창을 닫지 마세요.');
  }
};
let flushing: Promise<number> | undefined;
export const flushAnswers = (): Promise<number> => flushing ??= (async () => {
  for (const item of await pendingAnswers()) {
    // 매번 같은 ID로 등록하므로 서버 재시작·페이지 새로고침 후에도 재전송할 수 있습니다.
    const id = await relayJoin(item.target, { ...item.player, id: item.remoteId });
    if (id === null || !(await relayRecord(item.target, { ...item.record, playerId: id }))) continue;
    const database = await db();
    if (database) await transaction(database, store => store.delete(item.id));
    volatile.delete(item.id);
  }
  return (await pendingAnswers()).length;
})().finally(() => { flushing = undefined; });

/** 온라인 복구와 주기적 재시도를 함께 사용합니다. 동시에 두 번 전송하지 않습니다. */
export const watchAnswerDelivery = (onCount: (count: number) => void) => {
  let active = true;
  const run = () => void flushAnswers().then(count => { if (active) onCount(count); }).catch(() => {
    reportStorage('답안 전송을 마치지 못했습니다. 연결이 복구되면 다시 전송합니다.');
  });
  const refresh = () => { void pendingAnswers().then(items => { if (active) onCount(items.length); }); run(); };
  refresh();
  const timer = window.setInterval(refresh, 5000);
  window.addEventListener('online', refresh);
  return () => { active = false; window.clearInterval(timer); window.removeEventListener('online', refresh); };
};
