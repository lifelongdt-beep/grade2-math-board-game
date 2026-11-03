import { useEffect, useRef, useState, type SetStateAction } from 'react';
/** 숨겨진 탭에서 interval이 늦게 실행되어도 실제 경과 시간을 기준으로 셉니다. */
export function useSessionClock(playing: boolean, initial: number, onFinish: () => void) {
  const [seconds, update] = useState(initial);
  const current = useRef(initial), deadline = useRef(0), active = useRef(playing), finish = useRef(onFinish);
  active.current = playing; finish.current = onFinish;
  const setSeconds = (value: SetStateAction<number>) => {
    const next = Math.max(0, typeof value === 'function' ? value(current.current) : value);
    if (active.current && typeof value === 'function') deadline.current += (next - current.current) * 1000;
    else deadline.current = Date.now() + next * 1000;
    current.current = next; update(next);
  };
  useEffect(() => {
    if (!playing) return;
    deadline.current = Date.now() + current.current * 1000;
    let finished = false;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      if (next !== current.current) { current.current = next; update(next); }
      if (!next && !finished) { finished = true; finish.current(); }
    };
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [playing]);
  return [seconds, setSeconds] as const;
}
