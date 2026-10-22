import { describe, expect, it } from 'vitest';
import type { Question } from '../types';
import { 명단풀기, 이름바꾼글, 주인공바꾸기 } from './nameSwap';

const 바꿈 = (짝: Record<string, string>) => new Map(Object.entries(짝));

describe('문제 속 주인공 이름 바꾸기', () => {
  it('새 이름의 받침에 맞게 조사를 다시 고릅니다', () => {
    const m = 바꿈({ 민준: '토끼', 서연: '곰돌' });
    expect(이름바꾼글('민준은 사탕을 서연에게 주었습니다.', m)).toBe('토끼는 사탕을 곰돌에게 주었습니다.');
    expect(이름바꾼글('민준이 3개, 서연이 5개를 가졌습니다.', m)).toBe('토끼가 3개, 곰돌이 5개를 가졌습니다.');
    expect(이름바꾼글('민준이는 서연과 함께 갔어요.', m)).toBe('토끼는 곰돌과 함께 갔어요.');
    expect(이름바꾼글('민준을 도와준 서연와', m)).toBe('토끼를 도와준 곰돌과');
    expect(이름바꾼글('민준이랑 서연이랑', m)).toBe('토끼랑 곰돌이랑');
  });

  it('이름이 다른 낱말 속에 있으면 건드리지 않습니다', () => {
    const m = 바꿈({ 지호: '사자', 은서: '판다' });
    expect(이름바꾼글('지호네 집, 은서랍장, 지호가', m)).toBe('사자네 집, 은서랍장, 사자가');
  });

  it('처음 나온 이름이 주인공이 되고, 보기와 답도 같은 이름으로 바뀝니다', () => {
    const q = {
      id: 'q', lessonId: 'l', difficulty: '중', prompt: '민준은 사탕 5개, 서연은 3개를 가졌습니다. 누가 더 많이 가졌을까요?',
      choices: ['민준', '서연', '같다', '모른다'], answerIndex: 0, answer: '민준', explanation: '민준이 더 많습니다.',
      misconception: '', type: 'number', strategy: '', support: { studentConcept: '', studentHint: '민준과 서연을 견주어 보세요.', coreConcept: '', readStrategy: '', steps: ['5>3이므로 민준입니다.'], misconceptionTip: '', textbookConnection: '', selfCheck: '' },
    } as unknown as Question;
    const 바뀐 = 주인공바꾸기(q, '여우', ['여우', '토끼']);
    expect(바뀐.prompt).toBe('여우는 사탕 5개, 토끼는 3개를 가졌습니다. 누가 더 많이 가졌을까요?');
    expect(바뀐.choices.slice(0, 2)).toEqual(['여우', '토끼']);
    expect(바뀐.answer).toBe('여우');
    expect(바뀐.choices[바뀐.answerIndex]).toBe(바뀐.answer);
    expect(바뀐.support.steps[0]).toBe('5>3이므로 여우입니다.');
    expect(주인공바꾸기(q, null, [])).toBe(q);
  });

  it('친구 이름이 모자라면 원래 이름을 그대로 둡니다', () => {
    const q = { prompt: '민준과 서연과 도윤이 섰습니다.', choices: ['1', '2', '3', '4'], answerIndex: 0, answer: '1', explanation: '', support: { studentHint: '', steps: [] } } as unknown as Question;
    expect(주인공바꾸기(q, '여우', ['토끼']).prompt).toBe('여우와 토끼와 도윤이 섰습니다.');
  });

  it('명단은 출석 번호 차례로 읽고 성을 뗍니다', () => {
    expect(명단풀기('김민준\n이서연, 하은')).toEqual({ 1: '민준', 2: '서연', 3: '하은' });
    expect(명단풀기('3. 박지호\n7번 최수아')).toEqual({ 3: '지호', 7: '수아' });
  });
});
