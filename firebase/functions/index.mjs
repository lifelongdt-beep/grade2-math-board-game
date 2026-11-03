import { randomBytes, randomInt } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { teacherUid, roomInput, studentInput, canIssue, expiredKeys } from './policy.mjs';
initializeApp();
const db = () => getDatabase();
const teacher = request => { try { return teacherUid(request.auth); } catch (error) { throw new HttpsError('permission-denied', error.message); } };
const input = (validate, data) => { try { return validate(data); } catch (error) { throw new HttpsError('invalid-argument', error.message); } };
const options = { region: 'asia-northeast3', enforceAppCheck: true };
export const createSecureRoom = onCall(options, async request => {
  const ownerUid = teacher(request);
  const { schoolYear, classId } = input(roomInput, request.data);
  const roomId = randomBytes(18).toString('hex');
  const now = Date.now();
  // 수업 접근은 12시간, 자료 보존은 30일입니다. 기관의 승인된 정책에 맞게 배포 전에 조정합니다.
  const meta = { ownerUid, schoolYear, classId, createdAt: now, expiresAt: now + 12 * 3600000, deleteAfter: now + 30 * 86400000 };
  await db().ref(`secureRooms/${roomId}/meta`).set(meta);
  return { roomId, expiresAt: meta.expiresAt };
});
export const issueStudentToken = onCall(options, async request => {
  const ownerUid = teacher(request);
  const { roomId, attendanceNo } = input(studentInput, request.data);
  const room = db().ref(`secureRooms/${roomId}`);
  const meta = (await room.child('meta').get()).val();
  if (!canIssue(meta, ownerUid, Date.now())) throw new HttpsError('permission-denied', '사용할 수 없는 방입니다.');
  // 교사에게만 개별 학생 토큰을 발급합니다. 공용 QR 소지로 출석번호를 자칭할 수 없습니다.
  const uid = `math-${roomId}-${attendanceNo}`;
  const membership = room.child(`members/${uid}`);
  const result = await membership.transaction(old => old?.active ? old : { active: true, playerId: randomInt(100000, 2000000000), attendanceNo });
  const member = result.snapshot.val();
  const token = await getAuth().createCustomToken(uid, { role: 'student', roomId, playerId: member.playerId, attendanceNo });
  return { customToken: token, roomId, playerId: member.playerId, attendanceNo, expiresAt: meta.expiresAt };
});
// 기존 /rooms 자료는 정리 대상에 포함하지 않습니다. 새 secureRooms의 명시된 만료만 처리합니다.
export const purgeExpiredSecureRooms = onSchedule({ schedule: 'every day 03:00', timeZone: 'Asia/Seoul', region: 'asia-northeast3' }, async () => {
  const rooms = await db().ref('secureRooms').orderByChild('meta/deleteAfter').endAt(Date.now()).limitToFirst(100).get();
  const expired = {};
  for (const key of expiredKeys(rooms.val() ?? {}, Date.now())) expired[key] = null;
  if (Object.keys(expired).length) await db().ref('secureRooms').update(expired);
});
