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
const sameAsMiddle = new Set<string>([
  // 문제글 뒤에 붙던 안내 문구를 걷어 내자 드러난 차시들입니다. 문구가
  // 두 수준을 달라 보이게 하고 있었을 뿐, 상은 중과 같은 문항을 거의
  // 그대로 받고 있었습니다(상에만 있는 모양이 한둘뿐).
  //
  // 이 차시들의 생성기에는 상이 받을 만한 문항 — 남의 풀이를 판단하거나,
  // 조건을 거꾸로 따라가는 문항 — 이 없습니다. 차시마다 두세 가지씩
  // 새로 써야 하고, 쓰는 대로 이 목록에서 지웁니다.
  '2-1-u1-l2', '2-1-u1-l3',
  '2-1-u2-l2', '2-1-u2-l3', '2-1-u2-l4', '2-1-u2-l5', '2-1-u2-l7',
  '2-2-u1-l2', '2-2-u1-l3',
  '2-2-u6-l2', '2-2-u6-l3', '2-2-u6-l7',
  // 데이터로 적은 문항이 설 자리를 넓히자, 중이 그 자리에서 문장제를
  // 더 받게 되면서 상과 겹치는 차시가 늘었습니다. 이 차시들에는 상이
  // 받을 판단 문항이 아직 없습니다 — 단원별로 쓰면서 지웁니다.
  '2-1-u4-l4', '2-1-u4-l5', '2-1-u4-l6', '2-1-u4-l7', '2-1-u5-l4',
  '2-1-u5-l5', '2-2-u3-l4', '2-2-u3-l5', '2-2-u3-l6', '2-2-u3-l7',
  '2-2-u4-l3', '2-2-u4-l5', '2-2-u4-l6', '2-2-u4-l7', '2-2-u4-l8',
  '2-2-u5-l2', '2-2-u5-l3', '2-2-u5-l4', '2-2-u5-l5', '2-2-u5-l6',
]);

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

  it('keeps the working-out questions out of the easiest level', () => {
    // 풀이 과정 문항은 남의 풀이를 따라가며 빈칸을 채우는 문항이라
    // 아직 답을 스스로 내지 못하는 단계에서는 이릅니다.
    const leaked: string[] = [];

    for (const lesson of lessons) {
      for (const question of generateQuestions(lesson, '하')) {
        if (question.prompt.includes('①')) {
          leaked.push(`${question.id}: ${question.prompt.slice(0, 34)}`);
        }
      }
    }

    expect(leaked).toEqual([]);
  });
});
