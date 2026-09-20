import { describe, expect, it } from 'vitest';
import { curriculum51 } from '../curriculum51';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 선행 검수 — 아직 배우지 않은 말이 먼저 나오지 않게
// ────────────────────────────────────────────────────────────────────
// 5-2의 같은 시험과 하는 일이 같습니다. 말마다 '처음 배우는 차시'를
// 적어 두고, 그보다 앞선 차시의 문제·보기·핵심·볼 곳·풀이·조심할 점에
// 그 말이 보이면 잡습니다.
//
// 차시 차례는 지도서의 단원 전개 계획 그대로입니다. 5-1에서는 특히
// 두 곳이 위험합니다.
//   · 2단원 약수 → 공약수 → 최대공약수 → 공배수 → 최소공배수가 한
//     차시씩 이어집니다. 한 차시만 앞질러도 아이는 모르는 말로 된
//     풀이를 읽습니다.
//   · 4단원 크기가 같은 분수 → 약분 → 통분이 이어집니다. 2·3차시의
//     풀이에 '약분'이나 '통분'이 적혀 있으면 안 됩니다.
// ════════════════════════════════════════════════════════════════════

type 자리 = { unit: number; lesson: number };

const 처음배우는곳: Array<{ 말: string[]; at: 자리; 빼고볼것?: RegExp }> = [
  // ── 2단원 약수와 배수 ─────────────────────────────────────────────
  // 1차시(단원 도입)에서는 '나누어떨어진다', '몇 배 한 수'로만 말합니다.
  { 말: ['약수'], at: { unit: 2, lesson: 2 }, 빼고볼것: /공약수/g },
  { 말: ['배수'], at: { unit: 2, lesson: 2 }, 빼고볼것: /공배수/g },
  { 말: ['공약수'], at: { unit: 2, lesson: 3 }, 빼고볼것: /최대공약수/g },
  { 말: ['최대공약수'], at: { unit: 2, lesson: 3 } },
  { 말: ['공배수'], at: { unit: 2, lesson: 5 }, 빼고볼것: /최소공배수/g },
  { 말: ['최소공배수'], at: { unit: 2, lesson: 5 } },

  // ── 3단원 대응 관계 ───────────────────────────────────────────────
  // 1차시는 4학년의 '규칙 찾기'를 떠올리는 자리입니다.
  { 말: ['대응'], at: { unit: 3, lesson: 2 } },
  // ○·△로 식을 세우는 것은 4차시에서 처음 합니다. 2·3차시는 말로만
  // 표현합니다(지도서 단원 학습 목표 2번과 3번이 나뉘어 있습니다).
  { 말: ['○×', '○+', '○-', '○÷', '△×', '△+'], at: { unit: 3, lesson: 4 } },

  // ── 4단원 약분과 통분 ─────────────────────────────────────────────
  { 말: ['약분'], at: { unit: 4, lesson: 4 }, 빼고볼것: /기약분수/g },
  { 말: ['기약분수'], at: { unit: 4, lesson: 4 } },
  { 말: ['통분'], at: { unit: 4, lesson: 5 } },
  { 말: ['공통분모'], at: { unit: 4, lesson: 5 } },

  // ── 6단원 다각형의 둘레와 넓이 ────────────────────────────────────
  // 1·2차시는 둘레만 다룹니다. '넓이'라는 말은 3차시에서 처음입니다.
  { 말: ['넓이'], at: { unit: 6, lesson: 3 } },
  { 말: ['cm²'], at: { unit: 6, lesson: 3 } },
  { 말: ['m²'], at: { unit: 6, lesson: 5 }, 빼고볼것: /cm²/g },
  { 말: ['km²'], at: { unit: 6, lesson: 5 } },
  // 밑변과 높이는 평행사변형의 넓이(6차시)에서 처음 나옵니다.
  { 말: ['밑변'], at: { unit: 6, lesson: 6 } },
  { 말: ['높이'], at: { unit: 6, lesson: 6 } },
  { 말: ['윗변', '아랫변'], at: { unit: 6, lesson: 8 } },
  { 말: ['대각선'], at: { unit: 6, lesson: 9 } },
];

const 먼저인가 = (a: 자리, b: 자리) => a.unit < b.unit || (a.unit === b.unit && a.lesson < b.lesson);

/** 아이가 화면에서 보는 글을 모두 모읍니다. */
const 아이가보는글 = (question: Question) => [
  ['문제', question.prompt],
  ...question.choices.map((one, at) => [`보기${at + 1}`, one] as const),
  ['핵심', question.support.studentConcept],
  ['볼 곳', question.support.studentHint],
  ...question.support.steps.map((one, at) => [`풀이${at + 1}`, one] as const),
  ['조심', question.support.misconceptionTip],
  ['확인', question.support.selfCheck],
  // 그림에 붙은 이름도 아이가 읽습니다.
  ['그림', question.visual ? JSON.stringify(question.visual) : ''],
] as Array<readonly [string, string]>;

describe('5-1 선행 검수', () => {
  const 모든차시 = curriculum51.flatMap((unit) => unit.lessons);

  it('아직 배우지 않은 말이 문제·보기·힌트·풀이에 나오지 않는다', () => {
    const broken: string[] = [];
    for (const lesson of 모든차시) {
      const 여기 = { unit: lesson.unitNo, lesson: lesson.lessonNo };
      const 금지 = 처음배우는곳.filter((one) => 먼저인가(여기, one.at));
      if (!금지.length) continue;
      for (const difficulty of ['하', '중', '상'] as Difficulty[]) {
        for (const question of generateQuestions(lesson, difficulty)) {
          for (const [어디, 글] of 아이가보는글(question)) {
            for (const one of 금지) {
              const 볼글 = one.빼고볼것 ? 글.replace(one.빼고볼것, '○○○') : 글;
              for (const 말 of one.말) {
                if (!볼글.includes(말)) continue;
                broken.push(`${lesson.id} | ${말} | ${어디} | ${글.slice(0, 80)}`);
              }
            }
          }
        }
      }
    }
    expect([...new Set(broken)].sort()).toEqual([]);
  });

  it('1단원은 그 차시가 배운 연산만 식에 쓴다', () => {
    // 2차시는 덧셈과 뺄셈만, 3차시는 곱셈과 나눗셈만, 4차시는 나눗셈을
    // 빼고, 5차시는 곱셈을 뺍니다. 지도서의 차시 차례 그대로입니다.
    const 쓸수있는: Record<number, RegExp> = {
      2: /^[\d+\-() ]+$/,
      3: /^[\d×÷() ]+$/,
      4: /^[\d+\-×() ]+$/,
      5: /^[\d+\-÷() ]+$/,
    };
    const broken: string[] = [];
    for (const lesson of 모든차시.filter((one) => one.unitNo === 1)) {
      const 규칙 = 쓸수있는[lesson.lessonNo];
      if (!규칙) continue;
      for (const difficulty of ['하', '중', '상'] as Difficulty[]) {
        for (const question of generateQuestions(lesson, difficulty)) {
          // 문제 글에서 식처럼 보이는 조각을 모두 꺼냅니다.
          const 식들 = question.prompt.match(/[\d+\-×÷()]{3,}/g) ?? [];
          for (const 식 of 식들) {
            if (!규칙.test(식)) {
              broken.push(`${lesson.id} ${difficulty}: "${식}" — ${question.prompt.slice(0, 60)}`);
            }
          }
        }
      }
    }
    expect([...new Set(broken)].sort()).toEqual([]);
  });

  it('5단원은 그 차시가 배운 꼴만 낸다', () => {
    // 2차시는 합이 1보다 작은 진분수의 덧셈만, 3차시는 1보다 큰 것만,
    // 6차시는 받아내림이 없는 대분수의 뺄셈만, 7차시는 있는 것만.
    const broken: string[] = [];
    const 분수읽기 = (text: string): { n: number; d: number } | null => {
      const 대분수 = /^(\d+)[과와]\s*(\d+)\/(\d+)$/.exec(text.trim());
      if (대분수) return { n: Number(대분수[1]) * Number(대분수[3]) + Number(대분수[2]), d: Number(대분수[3]) };
      const 진분수 = /^(\d+)\/(\d+)$/.exec(text.trim());
      return 진분수 ? { n: Number(진분수[1]), d: Number(진분수[2]) } : null;
    };

    for (const lesson of 모든차시.filter((one) => one.unitNo === 5 && one.lessonNo >= 2)) {
      for (const difficulty of ['하', '중', '상'] as Difficulty[]) {
        for (const question of generateQuestions(lesson, difficulty)) {
          const hit = /(\d+(?:[과와] \d+\/\d+|\/\d+)) ([+\-]) (\d+(?:[과와] \d+\/\d+|\/\d+))/.exec(question.prompt);
          if (!hit) continue;
          const left = 분수읽기(hit[1]);
          const right = 분수읽기(hit[3]);
          if (!left || !right) continue;
          const 대분수있음 = /[과와] /.test(hit[1]) || /[과와] /.test(hit[3]);
          const 더하기 = hit[2] === '+';
          const 자리 = `${lesson.id} ${difficulty}: ${hit[0]}`;

          if (lesson.lessonNo <= 3 || lesson.lessonNo === 5) {
            if (대분수있음) broken.push(`${자리} — 진분수 차시에 대분수가 나옴`);
          } else if (!대분수있음) {
            broken.push(`${자리} — 대분수 차시에 대분수가 없음`);
          }

          if (lesson.lessonNo === 2 || lesson.lessonNo === 3) {
            const 합 = left.n * right.d + right.n * left.d;
            const 분모 = left.d * right.d;
            const 넘음 = 합 > 분모;
            if (lesson.lessonNo === 2 && 넘음) broken.push(`${자리} — 2차시인데 합이 1보다 큼`);
            if (lesson.lessonNo === 3 && !넘음) broken.push(`${자리} — 3차시인데 합이 1보다 작음`);
          }

          if ((lesson.lessonNo === 6 || lesson.lessonNo === 7) && !더하기) {
            // 받아내림이 있는지는 통분한 분수 부분끼리 견주어 정합니다.
            const 왼분수 = /[과와] (\d+)\/(\d+)/.exec(hit[1]);
            const 오른분수 = /[과와] (\d+)\/(\d+)/.exec(hit[3]);
            if (왼분수 && 오른분수) {
              const 왼 = Number(왼분수[1]) / Number(왼분수[2]);
              const 오른 = Number(오른분수[1]) / Number(오른분수[2]);
              const 받아내림 = 왼 < 오른;
              if (lesson.lessonNo === 6 && 받아내림) broken.push(`${자리} — 6차시인데 받아내림이 있음`);
              if (lesson.lessonNo === 7 && !받아내림) broken.push(`${자리} — 7차시인데 받아내림이 없음`);
            }
          }
        }
      }
    }
    expect([...new Set(broken)].sort()).toEqual([]);
  });
});
