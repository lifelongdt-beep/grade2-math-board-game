import { describe, expect, it } from 'vitest';
import { createQuestionState } from './playerState';
import type { Player } from './types';

// ════════════════════════════════════════════════════════════════════
// 검사용 시작 수준
// ────────────────────────────────────────────────────────────────────
// 수업에서는 늘 '하'에서 시작합니다. 화면을 단원·차시·수준별로 모두
// 훑어보는 검사에서만 다른 수준에서 시작할 수 있어야 합니다. 이 문이
// 실수로 수업 쪽에 새어 들어가면 아이가 첫 문제부터 상 수준을 만나게
// 되므로, 기본값이 '하'인지를 못 박아 둡니다.
// ════════════════════════════════════════════════════════════════════

const 아이들: Player[] = [
  { id: 1, name: '1번', attendanceNo: 1, avatar: '🦊', color: '#2f4f68', difficulty: '중' },
];

describe('시작 수준', () => {
  it('아무 것도 넣지 않으면 하에서 시작한다', () => {
    expect(createQuestionState(아이들)[1].level).toBe('하');
  });

  it('검사에서 넣은 수준이 있으면 그 수준에서 시작한다', () => {
    expect(createQuestionState(아이들, 0, '상')[1].level).toBe('상');
    expect(createQuestionState(아이들, 0, '중')[1].level).toBe('중');
  });
});
