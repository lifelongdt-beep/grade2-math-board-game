import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teacherUid, roomInput, studentInput, canIssue, expiredKeys } from '../functions/policy.mjs';
test('교사 권한을 가진 인증 계정만 토큰을 발급할 수 있다', () => {
  for (const auth of [null, { uid: 's', token: { role: 'student' } }, { uid: 't', token: {} }]) assert.throws(() => teacherUid(auth));
  assert.equal(teacherUid({ uid: 't', token: { mathTeacher: true } }), 't');
});
test('학급·학생 입력을 검증하고 본인 소유의 유효한 방만 허용한다', () => {
  assert.deepEqual(roomInput({ schoolYear: 2026, classId: ' 2-3 ' }), { schoolYear: 2026, classId: '2-3' });
  assert.throws(() => roomInput({ schoolYear: 2026, classId: '' }));
  assert.throws(() => studentInput({ roomId: '../rooms', attendanceNo: 1 }));
  assert.throws(() => studentInput({ roomId: 'a'.repeat(36), attendanceNo: 1.5 }));
  assert.ok(canIssue({ ownerUid: 't', expiresAt: 2000 }, 't', 1000));
  assert.equal(canIssue({ ownerUid: 't', expiresAt: 2000 }, 'other', 1000), false);
  assert.equal(canIssue({ ownerUid: 't', expiresAt: 1000 }, 't', 1000), false);
});
test('정리 정책은 명시된 보존기한을 지난 방만 선택한다', () => {
  assert.deepEqual(expiredKeys({ old: { meta: { deleteAfter: 100 } }, current: { meta: { deleteAfter: 300 } }, legacy: {}, malformed: { meta: { deleteAfter: '100' } } }, 200), ['old']);
});
