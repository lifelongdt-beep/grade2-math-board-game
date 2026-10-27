import { describe, expect, it } from 'vitest';
import { 결승점수 } from './index';

describe('라이벌과 겨루는 결승 점수', () => {
  it('2분 이하의 짧은 수업은 먼저 5점, 그보다 긴 수업은 먼저 10점입니다', () => {
    expect([30, 60, 120].map(결승점수)).toEqual([5, 5, 5]);
    expect([180, 240, 300].map(결승점수)).toEqual([10, 10, 10]);
  });
});
