export const clockAngle = (angle: number) => ((angle % 360) + 360) % 360;

/** 눈금 경계의 작은 손 떨림에는 현재 눈금을 유지합니다. */
export function snapClockAngle(angle: number, step: number, previous?: number, offset = 0): number {
  if (previous !== undefined) {
    const distance = Math.abs(clockAngle(angle - previous + 180) - 180);
    if (distance <= step * 0.65) return clockAngle(previous);
  }
  return clockAngle(Math.round((angle - offset) / step) * step + offset);
}

/** 정답과 무관하게, 학생이 고른 시와 분에 맞추어 두 바늘을 연결합니다. */
export function moveClockHand(
  state: { kind: 'clock'; hourDeg: number; minuteDeg: number },
  hand: 'hour' | 'minute', angle: number, minuteStep: number, dragging = false,
) {
  const offset = clockAngle(state.minuteDeg) / 12;
  if (hand === 'hour') {
    return { ...state, hourDeg: snapClockAngle(angle, 30, dragging ? state.hourDeg : undefined, offset) };
  }
  const minuteDeg = snapClockAngle(angle, minuteStep * 6, dragging ? state.minuteDeg : undefined);
  const hour = Math.round((state.hourDeg - offset) / 30);
  return { ...state, minuteDeg, hourDeg: clockAngle(hour * 30 + minuteDeg / 12) };
}
