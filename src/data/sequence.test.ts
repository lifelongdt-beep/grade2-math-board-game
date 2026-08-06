import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 수학은 한 단계씩 배웁니다. 어떤 차시의 문제가 그 뒤에 배우는 내용을 미리
// 다루면 학생이 아직 배우지 않은 것을 풀게 됩니다.
// 차시 순서는 동아출판 2-1 / 2-2 교사용 지도서의 단원 전개 계획을 따릅니다.
// 규칙: "이 낱말이 나오면 그 차시는 최소 from차시여야 한다"
const notBefore: Array<{
  semester: '2-1' | '2-2';
  unit: string;
  rules: Array<{ pattern: RegExp; from: number; note: string }>;
}> = [
  {
    semester: '2-1',
    unit: '세 자리 수',
    rules: [
      { pattern: /몇백/, from: 3, note: '몇백은 3차시' },
      { pattern: /뛰어 세/, from: 6, note: '뛰어 세기는 6차시' },
      { pattern: /크기를 비교|중 더 큰 수|중 더 작은 수|가장 큰 수|가장 작은 수/, from: 7, note: '크기 비교는 7차시' },
    ],
  },
  {
    semester: '2-1',
    unit: '여러 가지 도형',
    rules: [
      { pattern: /칠교/, from: 5, note: '칠교판은 5차시' },
      { pattern: /쌓기나무|쌓은 모양|몇 층/, from: 6, note: '쌓기나무는 6차시' },
    ],
  },
  {
    semester: '2-1',
    unit: '덧셈과 뺄셈',
    rules: [
      { pattern: /받아올림/, from: 2, note: '받아올림은 2차시' },
      { pattern: /받아내림/, from: 5, note: '받아내림은 5차시' },
      { pattern: /세 수/, from: 8, note: '세 수의 계산은 8차시' },
      { pattern: /□/, from: 10, note: '□의 값 구하기는 10차시' },
    ],
  },
  {
    semester: '2-1',
    unit: '길이 재기',
    rules: [
      { pattern: /cm/, from: 4, note: '1cm는 4차시' },
      { pattern: /자의|눈금/, from: 5, note: '자로 재는 방법은 5차시' },
      { pattern: /어림/, from: 7, note: '어림하기는 7차시' },
    ],
  },
  {
    semester: '2-1',
    unit: '분류하기',
    rules: [
      { pattern: /가장 많은|가장 적은|합계|모두 몇/, from: 4, note: '분류하고 세기는 4차시' },
    ],
  },
  {
    semester: '2-1',
    unit: '곱셈',
    rules: [
      { pattern: /몇 배|\d배/, from: 4, note: '몇의 몇 배는 4차시' },
      { pattern: /곱셈|×/, from: 6, note: '곱셈식은 6차시' },
    ],
  },
  {
    semester: '2-2',
    unit: '네 자리 수',
    rules: [
      { pattern: /몇천/, from: 3, note: '몇천은 3차시' },
      { pattern: /뛰어 세/, from: 6, note: '뛰어 세기는 6차시' },
      { pattern: /크기를 비교|중 더 큰 수|중 더 작은 수|가장 큰 수|가장 작은 수/, from: 7, note: '크기 비교는 7차시' },
    ],
  },
  {
    semester: '2-2',
    unit: '곱셈구구',
    rules: [
      { pattern: /2단/, from: 2, note: '2단은 2차시' },
      { pattern: /5단/, from: 3, note: '5단은 3차시' },
      { pattern: /3단|6단/, from: 4, note: '3단과 6단은 4차시' },
      { pattern: /4단|8단/, from: 5, note: '4단과 8단은 5차시' },
      { pattern: /7단/, from: 6, note: '7단은 6차시' },
      { pattern: /9단/, from: 7, note: '9단은 7차시' },
      { pattern: /1단|0의 곱/, from: 8, note: '1단과 0의 곱은 8차시' },
      { pattern: /곱셈표/, from: 9, note: '곱셈표는 9차시' },
    ],
  },
  {
    semester: '2-2',
    unit: '길이 재기',
    rules: [
      { pattern: /줄자/, from: 3, note: '줄자는 3차시' },
      { pattern: /길이의 합/, from: 4, note: '길이의 합은 4차시' },
      { pattern: /길이의 차/, from: 5, note: '길이의 차는 5차시' },
      { pattern: /어림/, from: 6, note: '어림하기는 6차시' },
    ],
  },
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
    semester: '2-2',
    unit: '표와 그래프',
    rules: [
      { pattern: /그래프/, from: 4, note: '그래프는 4차시부터' },
    ],
  },
  {
    semester: '2-2',
    unit: '규칙 찾기',
    rules: [
      { pattern: /쌓기나무|쌓은 모양/, from: 4, note: '쌓은 모양의 규칙은 4차시' },
      { pattern: /덧셈표/, from: 5, note: '덧셈표는 5차시' },
      { pattern: /곱셈표/, from: 6, note: '곱셈표는 6차시' },
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
                `${group.unit} ${lesson.lessonNo}차시 "${lesson.title}" (${level}) 가 ${rule.note}인데 먼저 다룸: ${question.prompt.slice(0, 36)}`,
              );
            }
          }
        }
      }
    }

    expect([...new Set(problems)].sort()).toEqual([]);
  });
});
