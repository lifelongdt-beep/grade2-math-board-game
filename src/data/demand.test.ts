import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 난이도가 서로 다른 문제여야 합니다. 예전에는 난이도가 '풀이 과정 문항을
// 몇 개 넣는가'로만 정해져, 중과 상에 같은 문항이 그대로 나오고 보기만
// 조금 달랐습니다. 세 수준이 실제로 다른 일을 요구하는지 봅니다.
//
//   하 아는 것을 꺼내거나 배운 절차를 그대로 수행
//   중 상황을 읽고 어떤 식을 세울지 정해야 함
//   상 풀이를 이해하고 판단하거나 거꾸로 생각해야 함
const shapeOf = (prompt: string) =>
  prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

// 단원 도입은 그 단원 내용을 아직 하나도 배우지 않아 낼 수 있는 문제가
// 앞 학년 내용으로 묶여 있습니다.
// 상에만 있는 문항이 아직 세 가지가 안 되는 차시입니다. 기준을 낮추는
// 대신 목록으로 남깁니다. 원인은 하나로 좁혀져 있습니다 — 이 차시들의
// 풀이 과정 생성기가 차시마다 한 가지 상황만 만들어, 상이 중과 같은
// 문항을 쓰게 됩니다. 그 생성기에 상황을 두세 가지씩 넣으면 풀리고,
// 넣는 대로 이 목록에서 지워야 합니다.
const sameAsMiddle = new Set<string>([]);

const covered = lessons.filter(
  (lesson) => lesson.title !== '단원 도입' && !sameAsMiddle.has(lesson.id));

describe('difficulty is a difference in what the question asks', () => {
  it('does not hand 중 and 상 the same questions', () => {
    const same: string[] = [];

    for (const lesson of covered) {
      const middle = new Set(generateQuestions(lesson, '중').map((q) => shapeOf(q.prompt)));
      const hard = new Set(generateQuestions(lesson, '상').map((q) => shapeOf(q.prompt)));

      // 상에만 있는 모양이 몇 가지인지를 봅니다. 겹치는 것을 세면
      // 문항 수가 많은 차시가 불리해지므로, '상에만 있는 것'을 셉니다.
      const onlyHard = [...hard].filter((shape) => !middle.has(shape));
      if (onlyHard.length < 3) {
        same.push(`${lesson.id}: 상에만 있는 모양이 ${onlyHard.length}가지뿐`);
      }
    }

    expect(same).toEqual([]);
  });

  it('never blanks a middle step at the easiest level', () => {
    // 예전에는 하에 단계가 붙은 문항을 아예 넣지 않았습니다. 까닭은
    // '남의 풀이를 따라가며 중간 빈칸을 채우는 일'이 아직 이르다는
    // 것이었고, 그 자체는 옳습니다.
    //
    // 그런데 2022 개정 성취수준에서 C 수준의 진술은 거의 모두 '안내된
    // 절차에 따라 ~할 수 있다'입니다([2수01-06] C: "안내된 절차에 따라
    // 두 자리 수의 범위에서 간단한 덧셈과 뺄셈을 할 수 있다"). 단계를
    // 보여 주는 것은 어렵게 만드는 장치가 아니라 도와주는 장치입니다.
    //
    // 그래서 가리는 곳을 바꿉니다. 하에서는 길을 끝까지 보여 주고 마지막
    // 답만 묻습니다. 중간 단계를 비워 두는 것만 막습니다.
    const blanked: string[] = [];

    for (const lesson of lessons) {
      for (const question of generateQuestions(lesson, '하')) {
        const prompt = question.basePrompt ?? question.prompt;
        if (!prompt.includes('①')) continue;

        // 마지막 단계 앞에 □가 있으면 중간을 비운 것입니다.
        const marks = ['①', '②', '③', '④'];
        const lastAt = Math.max(...marks.map((mark) => prompt.lastIndexOf(mark)));
        // 문두의 '□에 알맞은 수는?'은 묻는 말이지 비워 둔 단계가
        // 아닙니다. 마지막 □가 어디 있는지를 봅니다.
        const blankAt = prompt.lastIndexOf('□');
        if (blankAt >= 0 && blankAt < lastAt) {
          blanked.push(`${question.id}: ${prompt.slice(0, 40)}`);
        }
      }
    }

    expect(blanked).toEqual([]);
  });
});
