import { expect, it } from 'vitest';
import { moveClockHand, snapClockAngle } from './clockSnap';
import { 채점 } from '../data/manipulate/check';
const initial = { kind: 'clock', hourDeg: 0, minuteDeg: 0 } as const;

it('시침과 분침을 어느 순서로 옮겨도 모든 시·분을 정확히 놓을 수 있습니다', () => {
  for (const step of [1,5,30]) for (let h=0;h<12;h++) for (let m=0;m<60;m+=step) {
    let a=moveClockHand(initial,'hour',h*30+1,step);
    a=moveClockHand(a,'minute',m*6+1,step);
    let b=moveClockHand(initial,'minute',m*6+1,step);
    b=moveClockHand(b,'hour',h*30+m/2-2,step);
    for (const state of [a,b]) {
      expect(state.hourDeg).toBe(h*30+m/2);
      expect(state.minuteDeg).toBe(m*6);
      expect(채점({kind:'clock',h:h||12,m,step},state).ok).toBe(true);
      expect(채점({kind:'clock',h:(h+1)%12||12,m,step},state).ok).toBe(false);
    }
  }
});

it('눈금 경계의 손 떨림을 흡수하고 충분히 움직이면 다음 눈금으로 옮깁니다', () => {
  expect(snapClockAngle(15.5,30,0)).toBe(0);
  expect(snapClockAngle(20,30,0)).toBe(30);
  expect(snapClockAngle(14.5,30,30)).toBe(30);
  expect(snapClockAngle(10,30,30)).toBe(0);
  expect(snapClockAngle(3.5,6,0)).toBe(0);
  expect(snapClockAngle(4,6,0)).toBe(6);
  expect(snapClockAngle(359,6,0)).toBe(0);
  expect(snapClockAngle(1,6,354)).toBe(0);
});

it('분침이 12를 넘어가도 학생이 고른 시를 유지하고 정답의 시로 바꾸지 않습니다', () => {
  const before={kind:'clock',hourDeg:149.5,minuteDeg:354} as const;
  expect(moveClockHand(before,'minute',1,1)).toEqual({kind:'clock',hourDeg:120,minuteDeg:0});
});
