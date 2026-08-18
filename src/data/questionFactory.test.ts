import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateLessonBank, generateQuestions } from './questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

const advancedTermsForSecondGrade = [
  '나눗셈',
  '몫',
  '나머지',
  '분수',
  '소수',
  '각도',
  '평행',
  '수직',
  '대칭',
  '넓이',
  '부피',
  '비율',
  '방정식',
  '미지수',
  '인수',
  '배수',
  '약수',
  '분모',
  '분자',
  '반지름',
  '지름',
  '교환법칙',
  '결합법칙',
  '분배법칙',
  '표준형',
  '평면도형',
  '입체도형',
  '정사각형',
  '직사각형',
];

const visualText = (visual: QuestionVisual | undefined): string[] => {
  if (!visual) return [];

  if (visual.kind === 'plane-shapes') {
    return [visual.label, ...visual.items.flatMap((item) => (item.label ? [item.label] : []))];
  }

  if (visual.kind === 'place-value') {
    return [visual.label, ...visual.columns.map((column) => column.label)];
  }

  if (visual.kind === 'bar-model') {
    return [visual.label, ...visual.bars.map((bar) => bar.label)];
  }

  if (visual.kind === 'number-line') {
    return [visual.label, ...visual.marks.flatMap((mark) => (mark.label ? [mark.label] : []))];
  }

  if (visual.kind === 'pictograph') {
    return [visual.label, ...visual.items.map((item) => item.label)];
  }

  if (visual.kind === 'pattern') {
    return [visual.label, ...visual.items];
  }

  return [visual.label];
};

const questionText = (question: ReturnType<typeof generateQuestions>[number]) => [
  question.prompt,
  ...question.choices,
  question.answer,
  question.explanation,
  question.misconception,
  question.strategy,
  question.support.studentConcept,
  question.support.studentHint,
  question.support.coreConcept,
  question.support.readStrategy,
  ...question.support.steps,
  question.support.misconceptionTip,
  question.support.textbookConnection,
  question.support.selfCheck,
  ...visualText(question.visual),
];

const countViewCells = (visual: QuestionVisual | undefined, label: '앞' | '옆' | '위' | '보임') => {
  expect(visual?.kind, `${label} view visual`).toBe('cube-views');
  if (visual?.kind !== 'cube-views') return Number.NaN;

  const view = visual.views.find((item) => item.label === label);
  expect(view, `${label} view`).toBeDefined();
  return view?.cells.flat().filter(Boolean).length ?? Number.NaN;
};

const cubeStackIsSupported = (visual: Extract<QuestionVisual, { kind: 'cube-stack' }>) => {
  const occupied = new Set(visual.cubes.map((cube) => `${cube.x}:${cube.y}:${cube.z}`));
  return visual.cubes.every((cube) => cube.z === 0 || occupied.has(`${cube.x}:${cube.y}:${cube.z - 1}`));
};

describe('questionFactory', () => {
  it('generates 30 questions for every difficulty in every lesson', () => {
    for (const lesson of lessons) {
      const bank = generateLessonBank(lesson);
      for (const level of levels) {
        expect(bank[level], `${lesson.id} ${level}`).toHaveLength(30);
      }
    }
  });

  // 서로 다른 문제가 몇 개나 되는지입니다.
  //
  // 예전에는 겹치는 문제글 뒤에 '빠뜨리거나 두 번 세지 않았는지 봐요'
  // 같은 문구를 붙여 서른 개가 모두 다른 것처럼 보이게 했습니다. 문구를
  // 걷어 내니, 300개 조합(차시×수준) 가운데 199개가 서른 개를 채우지
  // 못한다는 것이 드러났습니다. 단원 도입 차시의 하 수준은 세 개뿐입니다.
  //
  // 이것은 감출 일이 아니라 채울 일입니다. 지금 값을 바닥으로 적어 두고,
  // 문항을 더 쓸 때마다 이 수가 올라가야 합니다. 내려가면 검사가 막습니다.
  //
  // 오늘 실제로 센 값은 5518가지입니다(차시×수준 300개 조합, 자리는
  // 9000개). 한 모양이 다섯 자리를 넘기지 못하게 하면서 쉰 가지쯤
  // 줄었습니다 — 수가 다른 같은 문제 대신 다른 모양을 넣은 것이라
  // 아이가 보기에는 나아진 맞바꿈입니다.
  // 바닥은 그보다 조금 낮게 두어 수를 하나 고칠 때마다 걸리지는 않게 합니다.
  const DISTINCT_TODAY = 5900;

  it('keeps growing the number of different questions', () => {
    let total = 0;
    const thin: string[] = [];

    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        const unique = new Set(questions.map((question) => question.prompt)).size;
        total += unique;
        // 서너 개로 서른 자리를 채우면 아이가 같은 문제를 열 번 봅니다.
        if (unique < 3) thin.push(`${lesson.id} ${level}: ${unique}가지뿐`);
      }
    }

    expect(thin).toEqual([]);
    expect(total, '서로 다른 문항 수가 줄었습니다').toBeGreaterThanOrEqual(DISTINCT_TODAY);
  });

  it('creates answer choices and answer indices for generated questions', () => {
    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        for (const question of questions) {
          expect(question.choices).toHaveLength(4);
          expect(question.answerIndex).toBeGreaterThanOrEqual(0);
          expect(question.answerIndex).toBeLessThan(4);
          expect(question.choices[question.answerIndex]).toBe(question.answer);
          expect(question.support.studentConcept.trim().length).toBeGreaterThan(0);
          expect(question.support.studentHint.trim().length).toBeGreaterThan(0);
          expect(question.support.coreConcept.trim().length).toBeGreaterThan(0);
          expect(question.support.readStrategy).toContain(question.strategy);
          expect(question.support.steps).toHaveLength(3);
          expect(question.explanation).toContain('핵심 개념');
          expect(question.explanation).toContain(lesson.objective);
        }
      }
    }
  });

  it('keeps question types and strategies aligned with the lesson', () => {
    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        const strategies = new Set(questions.map((question) => question.strategy));

        expect(strategies.size, `${lesson.id} ${level} strategy variety`).toBeGreaterThanOrEqual(5);

        for (const question of questions) {
          const allowedTypes = new Set(lesson.tags);
          if (allowedTypes.has('number')) allowedTypes.add('placeValue');
          if (allowedTypes.has('placeValue')) allowedTypes.add('number');
          if (allowedTypes.has('classification')) allowedTypes.add('data');

          expect([...allowedTypes], `${lesson.id} ${level} ${question.prompt}`).toContain(question.type);
          expect(question.strategy.trim().length, `${lesson.id} ${level} strategy`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('adds visual support to every shape and solid question', () => {
    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);

        for (const question of questions) {
          if (question.type === 'shape' || question.type === 'solid') {
            expect(question.visual, `${question.id} visual`).toBeDefined();
            expect(question.visual?.label.trim().length, `${question.id} visual label`).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  // 분류하기의 앞 차시는 '무엇을 기준으로 나눌까'를 다룹니다. 셀 수도,
  // 표로 옮길 자료도 아직 없습니다.
  //
  // 이 차시들은 오랫동안 14개를 채우고 있었는데, 그림이 전부 지어낸
  // 것이었습니다 — 자료가 없으면 '가·나·다'에 아무 수나 넣어 표를 그렸고,
  // 그래서 '축구를 고른 사람을 세시오' 옆에 축구가 없는 표가 놓였습니다.
  // 지어내기를 그만두자 0이 되었습니다. 숫자가 줄어든 것이 아니라, 원래
  // 없던 것이 드러난 것입니다.
  //
  // 채우려면 이 차시의 문항에 실제로 셀 자료를 넣어야 합니다. 그때 이
  // 목록에서 지웁니다.
  const noDataToDraw = new Set<string>(['2-1-u5-l1', '2-1-u5-l2', '2-1-u5-l3', '2-2-u5-l1']);

  it('adds rich visual materials and higher-order items across every lesson', () => {
    const expectedRichCount: Record<Difficulty, number> = {
      하: 0,
      중: 6,
      상: 10,
    };
    const visualKinds = new Set<string>();

    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        const visualCount = questions.filter((question) => question.visual).length;
        const richCount = questions.filter((question) => /자료 해석|조건 함께 보기/.test(question.strategy)).length;

        if (!noDataToDraw.has(lesson.id)) {
          expect(visualCount, `${lesson.id} ${level} visual count`).toBeGreaterThanOrEqual(14);
        }
        expect(richCount, `${lesson.id} ${level} rich count`).toBeGreaterThanOrEqual(expectedRichCount[level]);

        questions.forEach((question) => {
          if (question.visual) visualKinds.add(question.visual.kind);
        });
      }
    }

    expect(visualKinds.size).toBeGreaterThanOrEqual(9);
  });

  it('keeps lower difficulty focused on basic one-step practice', () => {
    for (const lesson of lessons) {
      const questions = generateQuestions(lesson, '하');

      for (const question of questions) {
        expect(question.strategy, `${lesson.id} lower strategy`).toContain('기초 ·');
        expect(question.strategy, `${lesson.id} lower advanced label`).not.toMatch(/조건 함께 보기|심화|서술|도전/);
        expect(question.support.readStrategy, `${lesson.id} lower read strategy`).not.toMatch(/조건 함께 보기|심화|서술|도전/);
      }
    }
  });

  it('uses grade 2 curriculum language without advanced terms', () => {
    for (const lesson of lessons) {
      const lessonTexts = [
        lesson.title,
        lesson.objective,
        lesson.achievement,
        lesson.unitTitle,
        lesson.textbookFocus,
        lesson.workbookFocus,
      ];

      for (const text of lessonTexts) {
        for (const term of advancedTermsForSecondGrade) {
          expect(text, `${lesson.id} lesson term ${term}`).not.toContain(term);
        }
      }

      for (const level of levels) {
        const questions = generateQuestions(lesson, level);

        for (const question of questions) {
          for (const text of questionText(question)) {
            for (const term of advancedTermsForSecondGrade) {
              expect(text, `${question.id} advanced term ${term}`).not.toContain(term);
            }
          }
        }
      }
    }
  });

  it('keeps addition and subtraction operands within grade 2 range', () => {
    const operationPattern = /(\d+)\s*[+-]\s*(\d+)/g;

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          if (question.type !== 'addition' && question.type !== 'subtraction') continue;

          const source = questionText(question).join(' ');
          for (const match of source.matchAll(operationPattern)) {
            const left = Number(match[1]);
            const right = Number(match[2]);
            expect(left, `${question.id} left operand`).toBeLessThanOrEqual(99);
            expect(right, `${question.id} right operand`).toBeLessThanOrEqual(99);
          }
        }
      }
    }
  });

  it('keeps solid shape visuals matched with the problem text', () => {
    let checkedViewQuestion = false;

    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);

        for (const question of questions.filter((item) => item.type === 'solid')) {
          const frontTopMatch = question.prompt.match(/앞에서 본 칸이\s*(\d+)칸이고\s*위에서 본 칸이\s*(\d+)칸/);
          if (frontTopMatch) {
            checkedViewQuestion = true;
            expect(countViewCells(question.visual, '앞'), question.id).toBe(Number(frontTopMatch[1]));
            expect(countViewCells(question.visual, '위'), question.id).toBe(Number(frontTopMatch[2]));
          }

          const frontSideMatch = question.prompt.match(/앞에서 보면\s*(\d+)칸,\s*옆에서 보면\s*(\d+)칸/);
          if (frontSideMatch) {
            checkedViewQuestion = true;
            expect(countViewCells(question.visual, '앞'), question.id).toBe(Number(frontSideMatch[1]));
            expect(countViewCells(question.visual, '옆'), question.id).toBe(Number(frontSideMatch[2]));
          }

          const topMatch = question.prompt.match(/위에서\s*(?:본 모양이|보면|보이는 칸이|본 칸은)\s*(\d+)칸/);
          if (topMatch) {
            checkedViewQuestion = true;
            expect(countViewCells(question.visual, '위'), question.id).toBe(Number(topMatch[1]));
          }

          const visibleOnlyMatch = question.prompt.match(/쌓기나무\s*(\d+)개 중\s*(\d+)개만 보인/);
          if (visibleOnlyMatch) {
            checkedViewQuestion = true;
            expect(countViewCells(question.visual, '보임'), question.id).toBe(Number(visibleOnlyMatch[2]));
          }

          if (question.prompt.includes('앞, 옆, 위') || question.prompt.includes('앞에서 본 모양과 위에서 본 모양')) {
            checkedViewQuestion = true;
            expect(question.visual?.kind, question.id).toBe('cube-views');
          }

          if (question.visual?.kind === 'cube-stack' && !visibleOnlyMatch) {
            const countMatch = question.prompt.match(/쌓기나무(?:가|는)?\s*(\d+)개/);
            if (countMatch) {
              expect(question.visual.cubes, `${question.id} cube count`).toHaveLength(Number(countMatch[1]));
            }
            expect(cubeStackIsSupported(question.visual), `${question.id} floating cube`).toBe(true);
          }
        }
      }
    }

    expect(checkedViewQuestion).toBe(true);
  });

  it('keeps plane shape visuals matched with the named shape', () => {
    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);

        for (const question of questions.filter((item) => item.type === 'shape')) {
          const source = `${question.prompt} ${question.answer} ${question.strategy}`;
          const target = (['칠교', '삼각형', '사각형', '원'] as const).find(
            (shapeName) =>
              question.prompt.includes(shapeName) ||
              question.answer === shapeName ||
              question.strategy.includes(shapeName),
          );

          if (!target) continue;

          if (target === '칠교') {
            expect(question.visual?.kind, question.id).toBe('tangram');
            continue;
          }

          expect(question.visual?.kind, question.id).toBe('plane-shapes');
          if (question.visual?.kind !== 'plane-shapes') continue;

          const activeKinds = question.visual.items.filter((item) => item.active).map((item) => item.kind);

          if (target === '원') {
            expect(activeKinds, question.id).toContain('circle');
          }

          if (target === '삼각형') {
            expect(activeKinds, question.id).toContain('triangle');
          }

          if (target === '사각형') {
            expect(activeKinds.some((kind) => kind === 'square' || kind === 'rectangle'), question.id).toBe(true);
          }
        }
      }
    }
  });

  it('varies hidden row counts in hard multiplication array questions', () => {
    const multiplicationLessons = lessons.filter((lesson) => lesson.tags.includes('multiplication'));
    const removedRowCounts = new Set<number>();

    for (const lesson of multiplicationLessons) {
      const questions = generateQuestions(lesson, '상');
      for (const question of questions) {
        const match = question.prompt.match(/아래쪽 (\d+)줄을 가리면/);
        if (match) removedRowCounts.add(Number(match[1]));
      }
    }

    expect([...removedRowCounts].sort()).toEqual([2, 3, 4]);
  });

  it('separates easy, medium, and hard question design', () => {
    const labels: Record<Difficulty, string> = {
      하: '기초',
      중: '적용',
      상: '도전',
    };

    for (const lesson of lessons) {
      for (const level of levels) {
        const questions = generateQuestions(lesson, level);
        for (const question of questions) {
          expect(question.prompt, `${lesson.id} ${level} prompt label`).not.toMatch(/^(기초|적용|도전):/);
          expect(question.strategy, `${lesson.id} ${level} strategy label`).toContain(`${labels[level]} ·`);
        }
      }

      expect(
        levels.flatMap((level) => generateQuestions(lesson, level)).some((question) => question.prompt.includes('민준')),
        `${lesson.id} unnecessary name prompt`,
      ).toBe(false);
    }
  });

  it('keeps generated answer keys correct for checkable question patterns', () => {
    const toNumber = (value: string) => Number(value.match(/-?\d+/)?.[0] ?? Number.NaN);

    for (const lesson of lessons) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          const answer = String(question.answer);

          expect(answer, `${question.id} negative answer`).not.toMatch(/^-\d/);

          const cardMatch = question.prompt.match(/수 카드 ([\d,\s]+)을 왼쪽부터 순서대로 놓아 만든 수는\?/);
          if (cardMatch) {
            const expected = cardMatch[1].replace(/[,\s]/g, '');
            expect(answer, `${question.id} card number`).toBe(expected);
          }

          const mostMatch = question.prompt.match(/축구 (\d+)명, 줄넘기 (\d+)명, 술래잡기 (\d+)명입니다\. 가장 많은 놀이는\?/);
          if (mostMatch) {
            const counts = [
              { name: '축구', count: Number(mostMatch[1]) },
              { name: '줄넘기', count: Number(mostMatch[2]) },
              { name: '술래잡기', count: Number(mostMatch[3]) },
            ];
            const expected = counts.reduce((best, item) => (item.count > best.count ? item : best)).name;
            expect(answer, `${question.id} most item`).toBe(expected);
          }

          const peopleDiffMatch = question.prompt.match(/(.+) (\d+)명, (.+) (\d+)명입니다\. .+는 .+보다 몇 명 더 많을까요\?/);
          if (peopleDiffMatch) {
            expect(toNumber(answer), `${question.id} people difference`).toBe(Number(peopleDiffMatch[2]) - Number(peopleDiffMatch[4]));
          }

          const redBlueMatch = question.prompt.match(/빨강 (\d+)개, 파랑 (\d+)개입니다\. 빨강은 파랑보다 몇 개 더 많을까요\?/);
          if (redBlueMatch) {
            expect(Number(redBlueMatch[1]), `${question.id} red greater than blue`).toBeGreaterThan(Number(redBlueMatch[2]));
            expect(toNumber(answer), `${question.id} red blue difference`).toBe(Number(redBlueMatch[1]) - Number(redBlueMatch[2]));
          }

          const rulerMatch = question.prompt.match(/자의 (\d+)cm 눈금부터 (\d+)cm 눈금까지 잰 선분을 \d+cm라고 읽었습니다\. 바른 길이는\?/);
          if (rulerMatch) {
            expect(answer, `${question.id} ruler difference`).toBe(`${Number(rulerMatch[2]) - Number(rulerMatch[1])}cm`);
          }
        }
      }
    }
  });
});
