export function teacherUid(auth) {
  if (!auth?.uid || auth.token?.mathTeacher !== true) throw new Error('교사 계정이 필요합니다.');
  return auth.uid;
}
export function roomInput(value) {
  const { schoolYear, classId } = value ?? {};
  if (!Number.isInteger(schoolYear) || schoolYear < 2000 || schoolYear > 2200 || typeof classId !== 'string' || !classId.trim() || classId.length > 80) throw new Error('학년도·학급을 확인하세요.');
  return { schoolYear, classId: classId.trim() };
}
export function studentInput(value) {
  const { roomId, attendanceNo } = value ?? {};
  if (!/^[a-f0-9]{36}$/.test(roomId ?? '') || !Number.isInteger(attendanceNo) || attendanceNo < 1 || attendanceNo > 999) throw new Error('방과 출석번호를 확인하세요.');
  return { roomId, attendanceNo };
}
export const canIssue = (meta, uid, now) => !!meta && meta.ownerUid === uid && typeof meta.expiresAt === 'number' && meta.expiresAt > now;
export const expiredKeys = (rooms, now) => Object.entries(rooms).filter(([, room]) => typeof room?.meta?.deleteAfter === 'number' && room.meta.deleteAfter <= now).map(([key]) => key);
