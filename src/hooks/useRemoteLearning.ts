import { useEffect, useRef, useState } from 'react';
import { relayState, type RelayTarget } from '../classroomRelay';
import { 기록더하기, 기록만들기, resolveRecordLesson } from '../data/learningLog';
import { reportStorage } from '../data/storageStatus';
import type { AnswerRecord, Lesson, Player } from '../types';

export function useRemoteLearning(target: RelayTarget, enabled: boolean, lessons: Map<string, Lesson>, epoch: number) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const saved = useRef(new Set<string>());
  useEffect(() => {
    setPlayers([]); setRecords([]); saved.current.clear();
    let active = true, running = false, cursor: string | undefined, lastSweep = 0, caughtUp = true;
    const pull = async () => {
      if (!enabled || running) return;
      running = true;
      try {
        // 지연 전송된 답안은 기존 커서 앞에도 들어올 수 있어 정기적으로 처음부터 재검사합니다.
        if (caughtUp && Date.now() - lastSweep > 60000) { cursor = undefined; lastSweep = Date.now(); caughtUp = false; }
        for (let page = 0; active && page < 20; page++) {
          const data = await relayState(target, cursor);
          if (!active || !data) return;
          const numbers = new Map(data.players.map(p => [p.id, p.attendanceNo]));
          const fresh = data.records.filter(r => !saved.current.has(r.id));
          const converted = fresh.map(record => {
            const no = record.attendanceNo ?? numbers.get(record.playerId);
            const lesson = resolveRecordLesson(record, lessons);
            return no !== undefined && lesson ? 기록만들기(record, { no, remote: true }, lesson) : null;
          });
          if (converted.some(r => !r)) return; // 학생 정보가 아직 도착하지 않았으면 다음 조회에서 재시도합니다.
          await 기록더하기(converted.filter((r): r is NonNullable<typeof r> => r !== null));
          if (!active) return;
          fresh.forEach(r => saved.current.add(r.id));
          setPlayers(data.players.map(p => ({ ...p, remote: true })));
          setRecords(prev => [...new Map([...prev, ...data.records].map(r => [r.id, r])).values()]);
          cursor = data.cursor;
          if (!data.hasMore) { caughtUp = true; break; }
        }
      } catch { reportStorage('휴대폰 학습 기록 저장을 완료하지 못했습니다. 다음 연결에서 다시 시도합니다.'); }
      finally { running = false; }
    };
    void pull();
    const timer = window.setInterval(() => void pull(), 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, [target, enabled, lessons, epoch]);
  return { players, records };
}
