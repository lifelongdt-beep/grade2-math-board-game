import { describe, expect, it } from 'vitest';
import { lessons5 } from '../curriculum5';
import { lessons51 } from '../curriculum51';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Lesson } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 하·중·상이 정말로 다른 문제인지
// ────────────────────────────────────────────────────────────────────
// 2학년에는 levelGap.test.ts가 이 일을 합니다. 그런데 그 시험은
// curriculum.ts(2학년)만 보아서, 5학년은 아무도 보지 않고 있었습니다.
// 그 사이에 5-1 마흔 차시와 5-2 마흔다섯 차시 가운데 마흔여덟 차시가
// 수준을 갈라도 같은 문제를 내게 되었습니다. 가장 심한 곳은 '하'와
// '상'이 서른 문항 가운데 스물다섯을 똑같이 내고 있었습니다.
//
// 까닭은 하나였습니다. 수준을 나눈다면서 뭉치의 차례만 돌렸습니다.
//
//     if (difficulty === '하') return 뭉치;
//     if (difficulty === '중') return [...뭉치.slice(1), 뭉치[0]];
//     return [...뭉치.slice(2), ...뭉치.slice(0, 2)];
//
// 차례가 달라도 서른 자리를 채우고 나면 같은 뭉치에서 같은 문항이
// 나옵니다. 수준을 고르는 뜻이 없어집니다.
//
// 그래서 여기서는 '무엇을 냈는가'를 글자 그대로 봅니다. 뭉치를 어떻게
// 나누었는지는 보지 않습니다 — 나누는 방법은 바뀌어도, 아이 앞에 놓인
// 서른 문항이 수준마다 달라야 한다는 것은 바뀌지 않습니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const all: Lesson[] = [...lessons51, ...lessons5];

// 이웃한 수준(하-중, 중-상)은 조금 겹쳐도 됩니다. 한 칸 올라간 것이지
// 딴 과목이 된 것은 아니기 때문입니다. 하지만 두 칸 떨어진 하와 상이
// 겹치면 수준을 고른 뜻이 사라집니다.
const 이웃한계 = 6;
const 먼한계 = 3;

// 아이 앞에 놓인 것 전부로 견줍니다. 글만 보면 안 됩니다 — 그림에만
// 수가 있는 문항은 글이 늘 같아서 다른 문항도 같아 보이고, 반대로 글이
// 같아도 그림과 보기가 다르면 아이에게는 다른 문항입니다.
const 보이는것 = (q: { prompt: string; choices: string[]; visual?: unknown }) =>
  `${q.prompt}||${JSON.stringify(q.visual ?? null)}||${[...q.choices].sort().join('|')}`;

const 문항들 = (lesson: Lesson) =>
  levels.map((level) => new Set(generateQuestions(lesson, level).map(보이는것)));

const 겹친수 = (a: Set<string>, b: Set<string>) => [...a].filter((one) => b.has(one)).length;

describe('5학년 수준 사이의 거리', () => {
  it('하와 상이 같은 문제를 내지 않는다', () => {
    const broken: string[] = [];
    for (const lesson of all) {
      const [low, , high] = 문항들(lesson);
      const same = 겹친수(low, high);
      if (same > 먼한계) {
        broken.push(`${lesson.id} ${lesson.title.slice(0, 24)}: 하·상 ${same}/30`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('이웃한 수준도 절반 넘게 겹치지 않는다', () => {
    const broken: string[] = [];
    for (const lesson of all) {
      const [low, mid, high] = 문항들(lesson);
      const 하중 = 겹친수(low, mid);
      const 중상 = 겹친수(mid, high);
      if (하중 > 이웃한계) broken.push(`${lesson.id} ${lesson.title.slice(0, 24)}: 하·중 ${하중}/30`);
      if (중상 > 이웃한계) broken.push(`${lesson.id} ${lesson.title.slice(0, 24)}: 중·상 ${중상}/30`);
    }
    expect(broken).toEqual([]);
  });

  it('어느 수준도 서른 자리를 채운다', () => {
    // 수준을 갈라 놓느라 낼 문항이 모자라면 판이 짧아집니다.
    const thin: string[] = [];
    for (const lesson of all) {
      for (const level of levels) {
        const count = generateQuestions(lesson, level).length;
        if (count < 30) thin.push(`${lesson.id} ${level}: ${count}/30`);
      }
    }
    expect(thin).toEqual([]);
  });

  it('한 수준 안에서도 여러 모양이 나온다', () => {
    // 수준을 가르느라 한 수준이 한두 모양만 되풀이하면 안 됩니다.
    const thin: string[] = [];
    for (const lesson of all) {
      for (const level of levels) {
        const shapes = new Set(
          generateQuestions(lesson, level).map((q) => q.prompt.replace(/[\d.]+/g, '#').replace(/\s+/g, ' ').trim()),
        );
        if (shapes.size < 4) thin.push(`${lesson.id} ${level}: ${shapes.size}가지`);
      }
    }
    expect(thin).toEqual([]);
  });
});
