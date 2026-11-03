import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { ref, set, get, remove } from 'firebase/database';
let env;
const room = 'a'.repeat(36), other = 'b'.repeat(36);
const record = { id: 'answer-1', playerId: 123456, attendanceNo: 1, lessonId: '2-1-u1-l2', answeredAt: new Date().toISOString(), prompt: '1+1', answer: '2', choices: ['1','2','3','4'], correct: true, elapsedMs: 1000, attempt: 1 };
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-math-board', database: { host: '127.0.0.1', port: 9001, rules: await readFile(new URL('../database.rules.json', import.meta.url), 'utf8') } }); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearDatabase();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.database();
    for (const [id, owner] of [[room, 'teacher'], [other, 'other-teacher']]) await set(ref(db, `secureRooms/${id}`), { meta: { ownerUid: owner, expiresAt: Date.now() + 3600000, deleteAfter: Date.now() + 86400000 }, members: { student: { active: true, playerId: 123456 }, student2: { active: true, playerId: 654321 } }, records: { original: { ...record, id: 'original' } } });
  });
});
const student = (uid = 'student', claims = {}) => env.authenticatedContext(uid, { role: 'student', roomId: room, playerId: 123456, attendanceNo: 1, ...claims }).database();
test('로그인하지 않은 사람은 방 읽기·답안 쓰기·기존 방 접근을 할 수 없다', async () => {
  const db = env.unauthenticatedContext().database();
  await assertFails(get(ref(db, `secureRooms/${room}`)));
  await assertFails(set(ref(db, `secureRooms/${room}/records/new`), record));
  await assertFails(get(ref(db, 'rooms')));
});
test('교사는 본인 방만 읽고 답안 초기화만 할 수 있다', async () => {
  const db = env.authenticatedContext('teacher', { mathTeacher: true }).database();
  await assertSucceeds(get(ref(db, `secureRooms/${room}`)));
  await assertFails(get(ref(db, `secureRooms/${other}`)));
  await assertFails(get(ref(env.authenticatedContext('teacher').database(), `secureRooms/${room}`)));
  await assertFails(set(ref(db, `secureRooms/${room}/meta/ownerUid`), 'attacker'));
  await assertSucceeds(remove(ref(db, `secureRooms/${room}/records`)));
});
test('학생은 본인 답안과 자기 등록만 쓸 수 있고 전체 기록은 읽을 수 없다', async () => {
  const db = student();
  await assertSucceeds(set(ref(db, `secureRooms/${room}/players/123456`), { id: 123456, attendanceNo: 1, name: '1번', difficulty: '하' }));
  await assertFails(set(ref(db, `secureRooms/${room}/players/654321`), { id: 654321, attendanceNo: 2, name: '2번', difficulty: '하' }));
  await assertSucceeds(set(ref(db, `secureRooms/${room}/records/new`), record));
  await assertSucceeds(set(ref(db, `secureRooms/${room}/records/new`), record));
  await assertFails(get(ref(db, `secureRooms/${room}/records`)));
  await assertFails(remove(ref(db, `secureRooms/${room}/records`)));
});
test('방·학생·출석번호 위조, 다른 학생 답안 덮어쓰기, 음수 시간과 불완전 답안을 거부한다', async () => {
  const db = student();
  await assertFails(set(ref(db, `secureRooms/${other}/records/new`), record));
  await assertFails(set(ref(db, `secureRooms/${room}/records/new`), { ...record, playerId: 654321 }));
  await assertFails(set(ref(db, `secureRooms/${room}/records/new`), { ...record, attendanceNo: 2 }));
  await assertFails(set(ref(student('student2', { playerId: 654321, attendanceNo: 2 }), `secureRooms/${room}/records/original`), { ...record, playerId: 654321, attendanceNo: 2 }));
  await assertFails(set(ref(db, `secureRooms/${room}/records/new`), { ...record, elapsedMs: -1 }));
  await assertFails(set(ref(db, `secureRooms/${room}/records/new`), { id: 'partial' }));
});
test('만료된 방과 해제된 학생은 기존 토큰이 있어도 접근할 수 없다', async () => {
  await env.withSecurityRulesDisabled(async context => { await set(ref(context.database(), `secureRooms/${room}/members/student/active`), false); });
  await assertFails(set(ref(student(), `secureRooms/${room}/records/new`), record));
  await env.withSecurityRulesDisabled(async context => { await set(ref(context.database(), `secureRooms/${room}/meta/expiresAt`), Date.now() - 1000); });
  await assertFails(get(ref(env.authenticatedContext('teacher').database(), `secureRooms/${room}`)));
});
