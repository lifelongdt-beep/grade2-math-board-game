import { describe, expect, it } from 'vitest';
import { lessons } from '../curriculum';
import { generateClassQuestions } from '../questionFactory';

// 2-2 4단원 5차시 '1시간을 알아볼까요'는 1시간=60분까지만 배웁니다.
// 80분을 1시간 20분으로, 1시간 25분을 85분으로 바꾸는 것은 다음 차시(걸린 시간을
// 알아볼까요)에서 배웁니다. 앞서는 이 차시 문항 대부분이 그 바꾸기여서 아이들이
// 풀 수 없었습니다. 이 검사는 s22hour.ts를 쓰지 않고 글만 봅니다.
const 차시 = lessons.find((l) => l.semester === '2-2' && l.unitTitle === '시각과 시간' && l.lessonNo === 5)!;
const 다음차시내용 = (글: string) =>
  /\d+\s*시간\s*\d+\s*분/.test(글) || [...글.matchAll(/(\d+)\s*분/g)].some((m) => Number(m[1]) > 60 && Number(m[1]) % 60 !== 0);

describe('1시간을 알아볼까요 차시는 다음 차시 내용을 내지 않습니다', () => {
  it('문제, 답, 보기에 몇 시간 몇 분이나 60분을 넘는 몇십 분(80분 같은 것)이 없습니다', () => {
    expect(차시.title).toBe('1시간을 알아볼까요');
    for (const d of ['하', '중', '상'] as const) {
      for (const 판 of [0, 1, 2]) {
        const 문항 = generateClassQuestions(차시, d, { 판 });
        if (판 === 0) expect(문항.length, `${d} 처음 판`).toBe(30);
        const 나쁨 = 문항.filter((q) => 다음차시내용([q.prompt, q.answer, ...q.choices].join(' '))).map((q) => `${q.id}: ${q.prompt} → ${q.answer}`);
        expect(나쁨, `${d} ${판}판`).toEqual([]);
      }
    }
  });

  it('바꾸기 문항의 답이 맞습니다', () => {
    for (const d of ['하', '중', '상'] as const) {
      for (const q of generateClassQuestions(차시, d)) {
        let m = /^(\d)시간은 몇 분일까요\?$/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${Number(m[1]) * 60}분`);
        m = /^(\d+)분은 몇 시간일까요\?$/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${Number(m[1]) / 60}시간`);
        m = /긴바늘이 (\d)바퀴 돌면 몇 분이 지날까요/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${Number(m[1]) * 60}분`);
        m = /^시계가 (\d+)시를 가리키고 있습니다\. 긴바늘이 한 바퀴 돌면 몇 시가/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${Number(m[1]) + 1}시`);
        m = /^지금 시각은 (\d+)시 (\d+)분입니다\. 1시간 뒤는/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${Number(m[1]) + 1}시 ${m[2]}분`);
        m = /^1시간은 (\d+)분과 몇 분을 더한 것과/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${60 - Number(m[1])}분`);
        m = /짧은바늘이 숫자 (\d+)에서 숫자 (\d+)까지 가는 동안 긴바늘은 몇 바퀴/.exec(q.prompt);
        if (m) expect(q.answer).toBe(`${Number(m[2]) - Number(m[1])}바퀴`);
        m = /^(\d)시간 동안 한 .+[이가] (\d+)시(?: (\d+)분)?에 끝났습니다/.exec(q.prompt);
        if (m) { const h = Number(m[2]) - Number(m[1]); expect(q.answer).toBe(m[3] ? `${h}시 ${m[3]}분` : `${h}시`); }
        m = /을\(를\)|를\)/.exec(q.prompt);
        expect(m, q.prompt).toBeNull();
      }
    }
  });
});
