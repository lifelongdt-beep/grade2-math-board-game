import { useEffect, useState } from 'react';
import type { Lesson } from '../types';
import { loadQuestionEngine } from '../data/loadQuestionEngine';
type Engine = typeof import('../data/engine');
export function useQuestionEngine(lessons: Lesson[]) {
  const [ready, setReady] = useState<{ lessons: Lesson[]; engine: Engine } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setError(false);
    void loadQuestionEngine(lessons).then(engine => { if (active) setReady({ lessons, engine }); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [lessons]);
  return { engine: ready?.lessons === lessons ? ready.engine : null, error, retry: () => window.location.reload() };
}
