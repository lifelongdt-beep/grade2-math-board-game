import { describe, expect, it } from 'vitest';
import {
  isRoomCode,
  makeRoomCode,
  normalizeDbUrl,
  readCloudState,
  rehydrateCloudRecord,
  trimRecordForCloud,
} from './classroomRelay';
import type { AnswerRecord } from './types';

const sampleRecord = (): AnswerRecord => ({
  id: 'lesson-하-3-1-1700000000000',
  playerId: 1001,
  playerName: '3번 학생',
  questionId: 'lesson-하-3',
  lessonId: '2-1-u1-l1',
  unitTitle: '세 자리 수',
  lessonTitle: '단원 도입',
  difficulty: '하',
  prompt: '100은 몇십인가요?',
  choices: ['십', '백', '천', '만'],
  answer: '백',
  explanation: '아주 긴 해설입니다.'.repeat(40),
  misconception: '수 세기와 크기 비교',
  type: 'number',
  strategy: '기초 · 익힘 기본',
  support: {
    studentConcept: '개념',
    studentHint: '힌트',
    coreConcept: '핵심',
    readStrategy: '읽기',
    steps: ['하나', '둘'],
    misconceptionTip: '조심',
    textbookConnection: '연결',
    selfCheck: '확인',
  },
  correct: true,
  chosen: '백',
  attempts: 1,
  responseMs: 4200,
  answeredAt: '2026-09-08T01:00:00.000Z',
});

describe('연동 주소 확인', () => {
  it('무료 저장소 주소만 받아들인다', () => {
    expect(normalizeDbUrl('https://my-class-default-rtdb.firebasedatabase.app')).toBe(
      'https://my-class-default-rtdb.firebasedatabase.app',
    );
    expect(normalizeDbUrl('https://my-class.firebaseio.com/')).toBe('https://my-class.firebaseio.com');
  });

  it('엉뚱한 곳으로 학생 답이 가지 않게 막는다', () => {
    // 큐알 주소에 담겨 오는 값이므로, 아무 데나 받으면 학생 폰이 모르는
    // 곳으로 답을 보내게 됩니다.
    expect(normalizeDbUrl('https://evil.example.com')).toBeNull();
    expect(normalizeDbUrl('http://my-class.firebaseio.com')).toBeNull();
    expect(normalizeDbUrl('아무거나')).toBeNull();
    expect(normalizeDbUrl('')).toBeNull();
  });

  it('방 이름은 읽기 쉬운 글자로만 만든다', () => {
    const room = makeRoomCode();
    expect(room).toHaveLength(6);
    expect(isRoomCode(room)).toBe(true);
    expect(room).not.toMatch(/[OI01]/);
  });

  it('이상한 방 이름은 받지 않는다', () => {
    expect(isRoomCode('ab/cd')).toBe(false);
    expect(isRoomCode('AB')).toBe(false);
    expect(isRoomCode('')).toBe(false);
  });
});

describe('실시간 저장소로 오가는 기록', () => {
  it('무거운 글은 빼고 보낸다', () => {
    // 해설·도움말·그림이 기록 하나 크기의 대부분인데 분석에는 쓰이지
    // 않습니다. 빼야 한 시간 수업에서 오가는 양이 감당됩니다.
    const trimmed = trimRecordForCloud(sampleRecord()) as Partial<AnswerRecord>;
    expect(trimmed.explanation).toBeUndefined();
    expect(trimmed.support).toBeUndefined();
    expect(trimmed.visual).toBeUndefined();
    expect(JSON.stringify(trimmed).length).toBeLessThan(JSON.stringify(sampleRecord()).length / 2);
  });

  it('분석에 쓰는 값은 그대로 남긴다', () => {
    const trimmed = trimRecordForCloud(sampleRecord());
    expect(trimmed.playerId).toBe(1001);
    expect(trimmed.correct).toBe(true);
    expect(trimmed.misconception).toBe('수 세기와 크기 비교');
    expect(trimmed.responseMs).toBe(4200);
    expect(trimmed.difficulty).toBe('하');
  });

  it('빠진 자리는 모양을 채워 돌려준다', () => {
    // 선생님 화면의 다른 코드가 이 자리를 그대로 읽습니다.
    const restored = rehydrateCloudRecord(trimRecordForCloud(sampleRecord()));
    expect(restored.explanation).toBe('');
    expect(restored.support.steps).toEqual([]);
    expect(restored.support.coreConcept).toBe('');
  });

  it('꾸러미로 온 목록을 학생과 기록으로 읽는다', () => {
    const state = readCloudState(
      { '100123': { id: 100123, name: '3번 학생', attendanceNo: 3, avatar: '🦊', difficulty: '중', color: '#7c6bd6' } },
      { '-Nabc': trimRecordForCloud(sampleRecord()) },
    );
    expect(state.players).toHaveLength(1);
    expect(state.players[0].name).toBe('3번 학생');
    expect(state.records).toHaveLength(1);
    expect(state.records[0].playerId).toBe(1001);
  });

  it('빈 방이나 깨진 값은 조용히 건너뛴다', () => {
    const state = readCloudState(null, { '-Nabc': null, '-Nabd': { nope: true } });
    expect(state.players).toEqual([]);
    expect(state.records).toEqual([]);
  });
});
