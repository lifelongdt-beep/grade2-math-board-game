import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 수학은 한 단계씩 배웁니다. 어떤 차시의 문제가 그 뒤에 배우는 내용을 미리
// 다루면 학생이 아직 배우지 않은 것을 풀게 됩니다.
// 아래는 "이 낱말이 나오면 그 차시는 최소 N차시여야 한다"는 규칙입니다.
const notBefore: Array<{
  unit: string;
  semester: '2-1' | '2-2';
  rules: Array<{ pattern: RegExp; from: number; note: string }>;
}> = [
  {
    semester: '2-2',
    unit: '시각과 시간',
    rules: [
      { pattern: /작은 눈금/, from: 3, note: '1분 단위 읽기는 3차시' },
      { pattern: /분 전/, from: 4, note: '몇 분 전으로 읽기는 4차시' },
      { pattern: /1시간|60분|몇 시간/, from: 5, note: '1시간과 60분의 관계는 5차시' },
      { pattern: /걸린 시간/, from: 6, note: '걸린 시간 구하기는 6차시' },
      { pattern: /오전|오후|하루/, from: 7, note: '하루의 시간은 7차시' },
      { pattern: /달력|요일|1주일/, from: 8, note: '달력은 8차시' },
    ],
  },
  {
    semester: '2-1',
    unit: '덧셈과 뺄셈',
    rules: [
      { pattern: /받아내림/, from: 5, note: '받아내림은 뺄셈 차시부터' },
      { pattern: /세 수/, from: 8, note: '세 수의 계산은 8차시' },
      { pattern: /□/, from: 10, note: '□의 값 구하기는 10차시' },
    ],
  },
  {
    semester: '2-2',
    unit: '표와 그래프',
    rules: [
      { pattern: /그래프/, from: 4, note: '그래프는 4차시부터' },
    ],
  },
];

describe('lesson sequence', () => {
  it('never asks about something taught in a later 차시', () => {
    const problems: string[] = [];

    for (const group of notBefore) {
      const unit = curriculum.find(
        (item) => item.semester === group.semester && item.title === group.unit,
      );
      expect(unit, `${group.semester} ${group.unit}`).toBeDefined();
      if (!unit) continue;

      for (const lesson of unit.lessons) {
        for (const level of levels) {
          for (const question of generateQuestions(lesson, level)) {
            const text = `${question.prompt} ${question.choices.join(' ')} ${question.strategy}`;

            for (const rule of group.rules) {
              if (lesson.lessonNo >= rule.from) continue;
              if (!rule.pattern.test(text)) continue;

              problems.push(
                `${group.unit} ${lesson.lessonNo}차시 "${lesson.title}" (${level}) 가 ${rule.note}인데 먼저 다룸: ${question.prompt.slice(0, 40)}`,
              );
            }
          }
        }
      }
    }

    expect([...new Set(problems)]).toEqual([]);
  });
});
