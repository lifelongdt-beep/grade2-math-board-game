import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

// 수를 지운 '문항의 모양'입니다. 수만 다른 문항은 아이에게 같은 문항입니다.
const shapeOf = (prompt: string) => prompt.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

// '구구단, 몬스터를 막아라!'는 흥미 유발 차시로, 하/중/상이 문장 모양이
// 아니라 '어느 단까지 내는가'로만 갈립니다(questionFactory.ts 참고). 세
// 수준 모두 문장 모양이 똑같은 '# × # = 얼마일까요?'라 이 검사와는 다른
// 축의 난이도를 씁니다.
const covered = lessons.filter((lesson) => lesson.title !== '구구단, 몬스터를 막아라!');

// 하와 중이 같은 문항을 나눠 가지면 수준을 나눈 뜻이 없습니다.
//
// 둘 다 같은 생성기가 채우고 있어, 한 차시에서 서른 문항 가운데 열아홉이
// 똑같은 모양이던 곳이 있었습니다. 네 가지를 고쳐 509곳에서 127곳으로
// 줄였습니다.
//
//   1. variantForDifficulty에서 하와 중이 서로 다른 모양을 쓰게 나눔
//   2. 중이 먼저 가져갈 자리(midQuestion)를 서른 자리 가운데 스무 곳 냄
//   3. 차시마다 중 전용 문장제를 세 벌씩(91개) 써 넣음
//   4. 마지막까지 남은 여섯 차시를 따로 채움
//
// 첫째가 뿌리였습니다. 하는 앞쪽 두세 모양만 쓰는데 중은 전체를 돌아,
// 중이 도는 길에 하의 모양이 그대로 들어 있었습니다. 문항을 아무리 더
// 써도 이 자리에서는 같은 것이 계속 나왔습니다.
//
// 자리를 넓히면서도 중 안의 다양성은 지켰습니다 — 한 차시의 중 서른
// 문항이 적어도 여섯 가지 서로 다른 모양을 씁니다.
describe('수준 사이의 거리', () => {
  it('한 차시에서 중이 하를 그대로 되풀이하지 않는다', () => {
    const worst: string[] = [];

    for (const lesson of covered) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const same = generateQuestions(lesson, '중').filter((q) => low.has(shapeOf(q.prompt)));

      // 서른 문항 가운데 절반을 넘게 겹치면 두 수준이 같은 것입니다.
      if (same.length > 9) {
        worst.push(`${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo} ${lesson.title}: ${same.length}/30`);
      }
    }

    expect(worst).toEqual([]);
  });

  it('중 안에서도 여러 모양이 나온다', () => {
    // 하와 갈라놓느라 중이 한두 모양만 되풀이하면 안 됩니다.
    const thin: string[] = [];

    for (const lesson of covered) {
      const kinds = new Set(generateQuestions(lesson, '중').map((q) => shapeOf(q.prompt)));
      if (kinds.size < 6) {
        thin.push(`${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo} ${lesson.title}: ${kinds.size}가지`);
      }
    }

    expect(thin).toEqual([]);
  });

  it('전체로 보아도 겹치는 곳이 늘지 않는다', () => {
    let same = 0;
    let all = 0;

    for (const lesson of covered) {
      const low = new Set(generateQuestions(lesson, '하').map((q) => shapeOf(q.prompt)));
      const mid = generateQuestions(lesson, '중');
      same += mid.filter((q) => low.has(shapeOf(q.prompt))).length;
      all += mid.length;
    }

    // 지금은 127곳입니다. 더 늘지 않게 막아 둡니다.
    expect(same).toBeLessThanOrEqual(140);
    expect(all).toBeGreaterThan(2000);
  });
});
