import { newRecordId } from './recordId';
import { initializeApp, deleteApp, type FirebaseOptions } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, signInWithCustomToken, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get, query, orderByKey, startAfter, limitToFirst, remove } from 'firebase/database';
import type { AnswerRecord } from './types';
import { validAnswer } from './data/recordValidation';
import { relayRecordKey } from './classroomRelay';

/** 관리자 배포 준비용 전송 계층입니다. 기존 인증 없는 /rooms 연동에는 자동 연결하지 않습니다. */
export async function openSecureCloud(config: FirebaseOptions, roomId: string, customToken: string) {
  if (!/^[a-f0-9]{36}$/.test(roomId)) throw new Error('방 식별자를 확인하세요.');
  const app = initializeApp(config, `secure-${newRecordId()}`);
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });
  try {
    const { user } = await signInWithCustomToken(auth, customToken);
    const claims = (await user.getIdTokenResult()).claims;
    if (claims.role !== 'student' || claims.roomId !== roomId || typeof claims.playerId !== 'number' || typeof claims.attendanceNo !== 'number') throw new Error('이 수업의 학생 토큰이 아닙니다.');
    const db = getDatabase(app);
    return {
      playerId: claims.playerId,
      async join(name: string, difficulty: '하' | '중' | '상') {
        await set(ref(db, `secureRooms/${roomId}/players/${claims.playerId}`), { id: claims.playerId, attendanceNo: claims.attendanceNo, name: name.slice(0, 80), difficulty });
      },
      async record(answer: AnswerRecord) {
        if (!validAnswer(answer) || answer.playerId !== claims.playerId || answer.attendanceNo !== claims.attendanceNo) throw new Error('학생 정보와 답안을 확인하세요.');
        await set(ref(db, `secureRooms/${roomId}/records/${relayRecordKey(answer)}`), answer);
      },
      async close() { await signOut(auth); await deleteApp(app); },
    };
  } catch (error) { await deleteApp(app); throw error; }
}

/** 교사 로그인은 관리자가 설정한 공급자로 별도 수행합니다. SDK는 토큰 갱신을 처리합니다. */
export function secureTeacherRoom(db: ReturnType<typeof getDatabase>, roomId: string) {
  if (!/^[a-f0-9]{36}$/.test(roomId)) throw new Error('방 식별자를 확인하세요.');
  return {
    async records(after?: string) {
      const base = ref(db, `secureRooms/${roomId}/records`);
      const rows = await get(query(base, orderByKey(), ...(after ? [startAfter(after)] : []), limitToFirst(101)));
      const entries = Object.entries(rows.val() ?? {}) as [string, unknown][];
      const page = entries.slice(0, 100);
      if (page.some(([, row]) => !validAnswer(row))) throw new Error('잘못된 답안 형식입니다.');
      return { records: page.map(([, row]) => row as AnswerRecord), cursor: page[page.length - 1]?.[0] ?? after, hasMore: entries.length > 100 };
    },
    async reset() { await remove(ref(db, `secureRooms/${roomId}/records`)); },
  };
}
