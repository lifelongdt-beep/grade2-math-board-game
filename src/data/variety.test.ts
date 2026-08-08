import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// 숫자만 바꾼 같은 문제가 되풀이되면, 아이는 문제를 이해하는 대신 한 가지
// 절차를 외웁니다. 문제의 '모양'은 숫자를 지우고 남는 문장 틀입니다.
//   '100이 5개, 10이 8개, 1이 1개인 수는 얼마일까요?'
//   '100이 3개, 10이 0개, 1이 3개인 수는 얼마일까요?'
// 이 둘은 숫자만 다를 뿐 같은 모양이고, 학생에게는 같은 문제입니다.
const shapeOf = (prompt: string) =>
  prompt
    .replace(/\d+/g, '#')
    .replace(/[○△□◇☆●▲■♥]/g, '@')
    .replace(/\s+/g, ' ')
    .trim();

// 문항 모양을 갖춘 단원만 검사합니다. 나머지 단원(덧셈과 뺄셈, 도형,
// 길이 재기, 분류하기, 시각과 시간, 표와 그래프, 규칙 찾기)은 아직
// 모양이 적어 이 기준에 못 미칩니다. 그 단원들에 모양을 갖추는 대로
// 여기 범위를 넓혀야 합니다. 기준을 낮추지 말고 범위를 넓히는 쪽으로.
// 단원 도입 차시는 뺍니다. 아직 그 단원 내용을 하나도 배우지 않은 상태라
// 낼 수 있는 문제가 앞 학년 내용으로 묶여 있어, 모양을 늘리려다 배우지도
// 않은 것을 묻게 됩니다.
const covered = lessons.filter((lesson) =>
  /세 자리 수|네 자리 수|곱셈구구/.test(lesson.unitTitle) && lesson.title !== '단원 도입');

describe('question variety', () => {
  it('does not serve one lesson the same question shape over and over', () => {
    const thin: string[] = [];

    for (const lesson of covered) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        const shapes = new Set(questions.map((question) => shapeOf(question.prompt)));

        // 30문항이면 적어도 여섯 가지 모양은 되어야 합니다. 국가 학습 진단
        // 평가지가 한 주제에 열 가지 안팎을 쓰는 것에 견주면 낮은 기준입니다.
        if (shapes.size < 6) {
          thin.push(`${lesson.id} (${level}): 30문항에 모양이 ${shapes.size}가지뿐`);
        }
      }
    }

    expect(thin).toEqual([]);
  });

  it('never lets one shape take over a lesson', () => {
    // 이 검사는 상 수준에서 큰 것을 하나 드러냈습니다. 풀이 과정 문항이
    // 30문항 중 20문항인데 그 20문항이 모두 같은 모양입니다. 그 생성기에
    // 모양을 갖추는 것이 다음 할 일이고, 그때 범위를 전 단원으로 넓힙니다.
    const dominated: string[] = [];

    for (const lesson of covered) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        const counts = new Map<string, number>();
        for (const question of questions) {
          const shape = shapeOf(question.prompt);
          counts.set(shape, (counts.get(shape) ?? 0) + 1);
        }

        const [worst, times] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
        // 한 모양이 절반을 넘으면 사실상 그 차시는 한 문제만 푸는 셈입니다.
        if (times > questions.length / 2) {
          dominated.push(`${lesson.id} (${level}): "${worst.slice(0, 34)}"가 ${times}/${questions.length}`);
        }
      }
    }

    expect(dominated).toEqual([]);
  });
});
