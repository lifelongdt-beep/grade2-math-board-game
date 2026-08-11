import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
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
    readingTip: '',
    steps: [],
    misconceptionTip: '',
    checkQuestion: '',
    textbookConnection: '',
  },
});

describe('questions written as data', () => {
  it('turns every template into a question somewhere', () => {
    const unused: string[] = [];

    for (const template of questionBank) {
      const fitting = lessons.filter((lesson) => templateFits(template, lesson));
      const made = fitting.some((lesson) =>
        [0, 3, 6, 9].some((index) => buildFromTemplate(template, lesson, '중', index, stub) !== null),
      );
      if (!made) unused.push(`${template.id}: 어느 차시에서도 문항이 되지 않음`);
    }

    expect(unused).toEqual([]);
  });

  it('never lets a number past the range its lesson works in', () => {
    const over: string[] = [];

    for (const template of questionBank) {
      for (const lesson of lessons.filter((one) => templateFits(template, one))) {
        for (let index = 0; index < 30; index += 1) {
          const made = buildFromTemplate(template, lesson, '중', index, stub);
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

  it('never offers the right answer twice', () => {
    const repeated: string[] = [];

    for (const template of questionBank) {
      for (const lesson of lessons.filter((one) => templateFits(template, one))) {
        for (let index = 0; index < 12; index += 1) {
          const made = buildFromTemplate(template, lesson, '중', index, stub);
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
