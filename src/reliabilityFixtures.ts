import type { AnswerRecord } from './types';
export const answerFixture = (overrides: Partial<AnswerRecord> = {}): AnswerRecord => ({
  id: 'answer-1', playerId: 1, playerName: '1번', attendanceNo: 1, sessionId: 'session-1',
  schoolYear: 2026, classId: '2-1', studentId: '2026|2-1|1',
  questionId: 'q1', lessonId: '2-1-u1-l2', unitTitle: '세 자리 수', lessonTitle: '백',
  prompt: '100은 몇십인가요?', choices: ['10', '1', '100'], answer: '10', chosen: '10',
  difficulty: '하', type: 'number', strategy: '세기', correct: true, explanation: '십이 열 개입니다.', misconception: '자리 혼동',
  support: { studentConcept: '백', studentHint: '십을 모아요', coreConcept: '백', readStrategy: '', steps: ['십을 열 개 모아요'], misconceptionTip: '', textbookConnection: '', selfCheck: '' },
  attempts: 1, responseMs: 5000, answeredAt: '2026-11-03T00:00:00.000Z', hintUsed: false, ...overrides,
});
