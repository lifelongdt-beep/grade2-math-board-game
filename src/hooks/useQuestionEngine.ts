import { useEffect, useState } from 'react';
type Engine = typeof import('../data/engine');
export function useQuestionEngine(parts: Record<string, () => Promise<unknown>>) {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    void import('../data/engine').then(module => { if (active) setEngine(module); }).catch(() => { if (active) setError(true); });
    // 교사용 PDF와 힌트 등은 실제로 열 때 받습니다. 전 학년 부품을 미리 받지 않습니다.
    void parts;
    return () => { active = false; };
  }, []);
  // 실패한 모듈을 기억하는 브라우저 캐시까지 새로 시작합니다. 기록·전송 큐는 기기에 남습니다.
  return { engine, error, retry: () => window.location.reload() };
}
