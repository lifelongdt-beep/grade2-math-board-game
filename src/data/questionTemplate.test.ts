import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { demandOfStrategy } from './questionFactory';
import { questionBank } from './questionBank';
import { buildFromTemplate, templateFits } from './questionTemplate';
import type { ConceptTag, Difficulty, Lesson, Question } from '../types';

// 데이터로 적은 문항이 실제로 문항이 되는지, 그리고 차시가 정한 범위를
// 지키는지 봅니다. 해석기가 범위를 대신 지켜 주는 것이 이 방식의 핵심이라,
// 그것이 무너지면 데이터로 옮긴 뜻이 없어집니다.
const stub = (
  lesson: Lesson,
  difficulty: Difficulty,
  index: number,
  prompt: string,
  answer: string | number,
  wrongs: Array<string | number>,
  solution: string,
  tag: ConceptTag,
  strategy: string,
): Question => ({
  id: `${lesson.id}-${difficulty}-${index}`,
  lessonId: lesson.id,
  difficulty,
  prompt,
  choices: [String(answer), ...wrongs.map(String)],
  answerIndex: 0,
  answer: String(answer),
  explanation: solution,
  misconception: tag,
  type: tag,
  strategy,
  support: {
    studentConcept: '',
    studentHint: '',
    coreConcept: '',
    readStrategy: '',
    steps: [],
    misconceptionTip: '',
    textbookConnection: '',
    selfCheck: '',
  },
});

// ㄱ·ㄴ·ㄷ·ㄹ 문항은 보기를 짝으로 만드는 곳이 questionFactory에 있습니다.
// 여기서는 네 문장이 제대로 채워졌는지만 보면 되므로 짧게 흉내 냅니다.
const pickAllStub = (
  lesson: Lesson,
  difficulty: Difficulty,
  index: number,
  claims: Array<{ text: string; ok: boolean }>,
  lead: string,
  tag: ConceptTag,
  strategy: string,
): Question | null => {
  if (claims.length !== 4 || claims.filter((claim) => claim.ok).length !== 2) return null;
  const labels = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'];
  const listed = claims.map((claim, at) => `${labels[at]} ${claim.text}`).join(' ');
  const answer = claims
    .map((claim, at) => (claim.ok ? labels[at] : ''))
    .filter(Boolean)
    .join(', ');
  return stub(
    lesson, difficulty, index,
    `${lead} ${listed} 위에서 옳은 것을 모두 고른 것은?`,
    answer, ['ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄷ, ㄹ'].filter((one) => one !== answer),
    '', tag, strategy,
  );
};

const tools = { make: stub, pickAll: pickAllStub };

describe('questions written as data', () => {
  it('turns every template into a question somewhere', () => {
    const unused: string[] = [];

    for (const template of questionBank) {
      const fitting = lessons.filter((lesson) => templateFits(template, lesson));
      const made = fitting.some((lesson) =>
        [0, 3, 6, 9].some((index) => buildFromTemplate(template, lesson, '중', index, tools) !== null),
      );
      if (!made) unused.push(`${template.id}: 어느 차시에서도 문항이 되지 않음`);
    }

    expect(unused).toEqual([]);
  });

  it('says the same thing in its demand and in its strategy name', () => {
    // 요구 수준은 두 군데에서 읽힙니다. 어느 난이도에 낼지는 template.demand로
    // 정하고, 교사용 분석은 문항에 적힌 전략 이름에서 다시 읽습니다. 둘이
    // 어긋나면 상에 낸 문항이 분석에서는 하로 잡힙니다.
    const mismatched: string[] = [];

    for (const template of questionBank) {
      const fromName = demandOfStrategy(template.strategy);
      if (fromName !== template.demand) {
        mismatched.push(`${template.id}: demand는 ${template.demand}인데 "${template.strategy}"는 ${fromName}으로 읽힘`);
      }
    }

    expect(mismatched).toEqual([]);
  });

  it('never lets a number past the range its lesson works in', () => {
    const over: string[] = [];

    for (const template of questionBank) {
      for (const lesson of lessons.filter((one) => templateFits(template, one))) {
        for (let index = 0; index < 30; index += 1) {
          const made = buildFromTemplate(template, lesson, '중', index, tools);
          if (!made) continue;

          const biggest = [made.prompt, ...made.choices]
            .join(' ')
            .match(/\d+/g)
            ?.map(Number)
            .reduce((most, value) => Math.max(most, value), 0) ?? 0;

          if (biggest > lesson.scope.maxNumber) {
            over.push(`${template.id} / ${lesson.id}: ${biggest} > ${lesson.scope.maxNumber}`);
          }
        }
      }
    }

    expect(over).toEqual([]);
  });

  it('never lets a wrong statement come out the same as a right one', () => {
    // ㄱ·ㄴ·ㄷ·ㄹ은 옳은 것 둘, 옳지 않은 것 둘이어야 합니다. 두 변수가
    // 같은 수로 뽑히면 '틀리게 쓴 문장'이 옳은 문장과 글자까지 똑같아져,
    // 답이 둘이 되는 문항이 나갑니다. (5씩 커지는 규칙에 start도 5가
    // 뽑히면 ㄱ과 ㄷ이 같은 문장이 되는 식입니다.)
    const collided: string[] = [];

    for (const template of questionBank) {
      if (!template.claims) continue;

      for (const lesson of lessons.filter((one) => templateFits(template, one))) {
        for (let index = 0; index < 30; index += 1) {
          const made = buildFromTemplate(template, lesson, '상', index, tools);
          if (!made) continue;

          // 만들어진 문항에서 ㄱ~ㄹ 네 문장을 다시 꺼냅니다.
          const said = made.prompt.match(/[ㄱㄴㄷㄹ][^ㄱㄴㄷㄹ]+/g) ?? [];
          const texts = said.map((one) => one.slice(1).trim());
          if (new Set(texts).size !== texts.length) {
            collided.push(`${template.id} / ${lesson.id}: ${texts.join(' | ')}`);
          }
        }
      }
    }

    expect(collided).toEqual([]);
  });

  it('never offers the right answer twice', () => {
    const repeated: string[] = [];

    for (const template of questionBank) {
      for (const lesson of lessons.filter((one) => templateFits(template, one))) {
        for (let index = 0; index < 12; index += 1) {
          const made = buildFromTemplate(template, lesson, '중', index, tools);
          if (!made) continue;
          if (new Set(made.choices).size !== made.choices.length) {
            repeated.push(`${template.id} / ${lesson.id}: ${made.choices.join(' / ')}`);
          }
        }
      }
    }

    expect(repeated).toEqual([]);
  });
});
