import { beforeEach, describe, expect, it } from 'vitest';
import { 검사용비우기, 기록더하기, 기록만들기, 기록모두읽기, 기록지우기, 날짜글, 되돌리기, 백업만들기, 백업풀기, type 학습기록 } from './learningLog';
import { csv만들기, 거르기, 거름글, 단원열쇠, 모둠나누기, 반지도, 오답모음, 오개념순위, 요약, 조건없음, 차시별, 학생단원표, 학생지도 } from './teacherInsights';
import { 지도법들 } from './teachingMethods';
import type { AnswerRecord, ConceptTag } from '../types';

let 차례 = 0;
const 기록 = (덧: Partial<학습기록> = {}): 학습기록 => {
  차례 += 1;
  return {
    id: `r${차례}`,
    no: 1,
    semester: '2-2',
    grade: 2,
    unitNo: 4,
    unitTitle: '시각과 시간',
    lessonId: '2-2-u4-l2',
    lessonNo: 2,
    lessonTitle: '몇 시 몇 분',
    date: '2026-10-01',
    answeredAt: `2026-10-01T01:00:${String(차례 % 60).padStart(2, '0')}.000Z`,
    correct: true,
    difficulty: '하',
    type: 'time',
    strategy: '',
    questionId: `q${차례}`,
    prompt: '시계를 읽어 보세요',
    choices: ['1', '2'],
    answer: '1',
    chosen: '1',
    explanation: '',
    misconception: '짧은바늘을 다음 숫자로 읽음',
    support: { studentConcept: '', studentHint: '', coreConcept: '긴바늘 한 칸은 5분', readStrategy: '', steps: [], misconceptionTip: '지나온 숫자를 읽어요', textbookConnection: '', selfCheck: '' },
    hintUsed: false,
    attempts: 1,
    responseMs: 8000,
    ...덧,
  };
};

describe('학습 기록 만들기', () => {
  it('놀이 기록에 출석번호·학년·단원·차시·날짜를 붙입니다', () => {
    const record = { id: 'a', playerId: 2, playerName: '2번', questionId: 'q', lessonId: 'L', unitTitle: '곱셈구구', lessonTitle: '2단', difficulty: '중', prompt: 'p', choices: [], answer: '4', explanation: '', misconception: '', type: 'multiplication', strategy: '', support: 기록().support, correct: false, chosen: '5', attempts: 1, responseMs: 3000, answeredAt: '2026-03-02T23:30:00.000Z', hintUsed: true } as AnswerRecord;
    const one = 기록만들기(record, { no: 7 }, { id: 'L', semester: '2-2', unitNo: 2, unitTitle: '곱셈구구', lessonNo: 3, title: '2단 곱셈구구' });
    expect(one).toMatchObject({ id: 'a#7', no: 7, grade: 2, semester: '2-2', unitNo: 2, lessonNo: 3, lessonTitle: '2단 곱셈구구', correct: false, hintUsed: true });
    expect(one.date).toBe(날짜글(new Date('2026-03-02T23:30:00.000Z')));
  });
});

describe('거르기', () => {
  const 모두 = [
    기록({ no: 1, date: '2026-10-01' }),
    기록({ no: 2, date: '2026-10-05', semester: '2-1', grade: 2, unitNo: 1, lessonId: 'x' }),
    기록({ no: 3, date: '2026-10-09', semester: '3-1', grade: 3, unitNo: 2, lessonId: 'y' }),
  ];
  it('학생·학년·학기·단원·차시·날짜로 거릅니다', () => {
    expect(거르기(모두, { nos: [2] })).toHaveLength(1);
    expect(거르기(모두, { grades: [2] })).toHaveLength(2);
    expect(거르기(모두, { semesters: ['3-1'] })).toHaveLength(1);
    expect(거르기(모두, { units: [단원열쇠(모두[0])] })).toHaveLength(1);
    expect(거르기(모두, { lessonIds: ['x', 'y'] })).toHaveLength(2);
    expect(거르기(모두, { from: '2026-10-02', to: '2026-10-09' })).toHaveLength(2);
    expect(조건없음({})).toBe(true);
    expect(조건없음({ nos: [] })).toBe(true);
    expect(조건없음({ from: '2026-10-01' })).toBe(false);
    expect(거름글({ nos: [1, 2], from: '2026-10-01' })).toContain('1번, 2번');
    expect(거름글({ units: ['2-2|4'] }, undefined, { 단원: () => '2-2 4. 시각과 시간' })).toBe('2-2 4. 시각과 시간');
    expect(거름글({ units: ['2-2|4'] })).toBe('단원 1개');
  });
});

describe('세기', () => {
  it('요약과 차시·학생×단원 표를 셉니다', () => {
    const 모두 = [기록({ correct: true }), 기록({ correct: false }), 기록({ correct: false, attempts: 2 }), 기록({ no: 2, correct: true, hintUsed: true })];
    const 값 = 요약(모두);
    expect(값).toMatchObject({ 문제: 4, 정답: 2, 정답률: 50, 학생수: 2, 날수: 1, 차시수: 1, 힌트율: 25, 다시맞힘률: 0 });
    expect(차시별(모두)[0]).toMatchObject({ 문제: 4, 정답률: 50, 학생수: 2 });
    const 표 = 학생단원표(모두);
    expect(표.학생들).toEqual([1, 2]);
    expect(표.칸(1, 단원열쇠(모두[0]))).toEqual({ 문제: 3, 정답률: 33 });
    expect(표.칸(3, 단원열쇠(모두[0]))).toBeUndefined();
  });

  it('여러 학생의 같은 오개념이 위에 옵니다', () => {
    const 모두 = [
      기록({ no: 1, correct: false, misconception: 'A' }),
      기록({ no: 1, correct: false, misconception: 'A' }),
      기록({ no: 1, correct: false, misconception: 'B' }),
      기록({ no: 2, correct: false, misconception: 'B' }),
    ];
    expect(오개념순위(모두).map((one) => one.내용)).toEqual(['B', 'A']);
  });
});

describe('오답 모음', () => {
  it('다시 맞힌 문제는 빼고, 같은 문제는 한 번만, 최근 것부터 최대 수만큼 넣습니다', () => {
    const 모두 = [
      기록({ questionId: 'a', correct: false, answeredAt: '2026-10-01T01:00:00Z' }),
      기록({ questionId: 'a', correct: true, answeredAt: '2026-10-01T01:05:00Z' }),
      기록({ questionId: 'b', correct: false, answeredAt: '2026-10-01T01:01:00Z' }),
      기록({ questionId: 'b', correct: false, answeredAt: '2026-10-01T01:06:00Z' }),
      기록({ questionId: 'c', correct: false, answeredAt: '2026-10-01T01:07:00Z' }),
      기록({ no: 2, questionId: 'd', correct: false }),
    ];
    expect(오답모음(모두, 1, { 해결한것빼기: false, 같은문제한번: false, 최대: 0 }).map((one) => one.questionId)).toEqual(['a', 'b', 'b', 'c']);
    expect(오답모음(모두, 1, { 해결한것빼기: true, 같은문제한번: true, 최대: 0 }).map((one) => one.questionId)).toEqual(['b', 'c']);
    expect(오답모음(모두, 1, { 해결한것빼기: true, 같은문제한번: false, 최대: 2 }).map((one) => one.questionId)).toEqual(['b', 'c']);
  });
});

describe('지도 도움', () => {
  it('모든 갈래에 구체적인 지도 순서·교구·발문·활동·확인이 있습니다', () => {
    for (const [tag, 법] of Object.entries(지도법들) as [ConceptTag, (typeof 지도법들)[ConceptTag]][]) {
      expect(법.순서.length, tag).toBeGreaterThanOrEqual(3);
      expect(법.교구 && 법.활동 && 법.확인, tag).toBeTruthy();
      expect(법.발문.length, tag).toBeGreaterThanOrEqual(1);
    }
  });

  it('반 전체가 어려워한 차시와 여러 학생의 같은 실수를 찾고 구체적인 방법을 줍니다', () => {
    const 모두: 학습기록[] = [];
    for (let no = 1; no <= 5; no += 1) {
      모두.push(기록({ no, correct: false, misconception: '짧은바늘을 다음 숫자로 읽음' }));
      모두.push(기록({ no, correct: false, misconception: '짧은바늘을 다음 숫자로 읽음' }));
      모두.push(기록({ no, correct: true }));
    }
    const 항목 = 반지도(모두);
    const 다시 = 항목.find((one) => one.제목.startsWith('다시 가르치기'));
    expect(다시?.급함).toBe('먼저');
    expect(다시?.방법.join(' ')).toContain('모형 시계');
    expect(다시?.방법[0]).toContain('긴바늘 한 칸은 5분');
    expect(다시?.대상).toEqual([1, 2, 3, 4, 5]);
    expect(항목.some((one) => one.제목.includes('같은 실수'))).toBe(true);
  });

  it('학생마다 서두름·힌트 의존·심화 같은 습관을 찾습니다', () => {
    const 서두름 = Array.from({ length: 6 }, () => 기록({ no: 3, correct: false, responseMs: 2000, misconception: '' }));
    expect(학생지도(서두름, 3).some((one) => one.제목.includes('서둘러'))).toBe(true);
    const 힌트 = Array.from({ length: 8 }, () => 기록({ no: 4, hintUsed: true }));
    expect(학생지도(힌트, 4).some((one) => one.제목.includes('힌트'))).toBe(true);
    const 잘함 = Array.from({ length: 12 }, () => 기록({ no: 5, difficulty: '상' }));
    expect(학생지도(잘함, 5).some((one) => one.제목.includes('심화'))).toBe(true);
    expect(학생지도(잘함, 9)).toEqual([]);
  });

  it('정답률로 모둠을 나눕니다', () => {
    const 모두 = [
      ...Array.from({ length: 5 }, (_, i) => 기록({ no: 1, correct: i < 2 })),
      ...Array.from({ length: 5 }, (_, i) => 기록({ no: 2, correct: i < 4 })),
      ...Array.from({ length: 5 }, () => 기록({ no: 3 })),
      기록({ no: 4 }),
    ];
    expect(모둠나누기(모두)).toEqual({ 보충: [1], 연습: [2], 심화: [3], 자료부족: [4] });
  });

  it('CSV는 BOM과 머리줄로 시작하고 쉼표가 든 칸을 감쌉니다', () => {
    const text = csv만들기([기록({ prompt: '3, 4 중 큰 수' })]);
    expect(text.startsWith('﻿날짜,')).toBe(true);
    expect(text).toContain('"3, 4 중 큰 수"');
  });
});

describe('학습 기록 저장소(메모리 대체)', () => {
  beforeEach(() => 검사용비우기());

  it('더하고, 같은 기록은 한 번만 두고, 지운 묶음을 되돌립니다', async () => {
    const a = 기록({ id: 'a' });
    const b = 기록({ id: 'b' });
    await 기록더하기([a, b, a]);
    expect((await 기록모두읽기()).map((one) => one.id).sort()).toEqual(['a', 'b']);
    await 기록지우기(['a']);
    expect((await 기록모두읽기()).map((one) => one.id)).toEqual(['b']);
    expect(await 되돌리기()).toBe(1);
    expect((await 기록모두읽기()).map((one) => one.id).sort()).toEqual(['a', 'b']);
  });

  it('백업을 만들고 다시 풀 수 있고, 다른 파일은 받지 않습니다', () => {
    const 묶음 = 백업만들기([기록({ id: 'z' })]);
    expect(백업풀기(JSON.stringify(묶음))?.map((one) => one.id)).toEqual(['z']);
    expect(백업풀기('{"kind":"other"}')).toBeNull();
    expect(백업풀기('not json')).toBeNull();
  });
});
