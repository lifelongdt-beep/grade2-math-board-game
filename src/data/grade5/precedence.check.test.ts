import { describe, expect, it } from 'vitest';
import { curriculum5 } from '../curriculum5';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 선행 검수 — 아직 배우지 않은 말이 먼저 나오지 않게
// ────────────────────────────────────────────────────────────────────
// 차시는 앞에서 배운 것 위에 하나씩 얹히도록 짜여 있습니다. 5차시에서
// 처음 꺼내는 말이 3차시 문제나 힌트에 미리 나오면, 아이는 모르는 말로
// 된 설명을 읽게 됩니다. 문제 글만이 아니라 보기·힌트·풀이·조심할 점까지
// 모두 아이가 보는 글이므로 함께 봅니다.
//
// 말마다 '처음 배우는 차시'를 적어 두고, 그 차시보다 앞선 차시에서
// 그 말이 보이면 잡습니다. 차시 차례는 지도서의 단원 전개 계획입니다.
// ════════════════════════════════════════════════════════════════════

type 자리 = { unit: number; lesson: number };

const 처음배우는곳: Array<{ 말: string[]; at: 자리; 빼고볼것?: RegExp }> = [
  // ── 1단원 수의 범위와 올림, 버림, 반올림 ──────────────────────────
  { 말: ['이상'], at: { unit: 1, lesson: 2 } },
  { 말: ['이하'], at: { unit: 1, lesson: 2 } },
  { 말: ['초과'], at: { unit: 1, lesson: 3 } },
  { 말: ['미만'], at: { unit: 1, lesson: 3 } },
  // '올림픽'과 '받아올림'은 올림이 아닙니다.
  { 말: ['올림'], at: { unit: 1, lesson: 5 }, 빼고볼것: /올림픽|받아올림/g },
  { 말: ['버림'], at: { unit: 1, lesson: 6 } },
  { 말: ['반올림'], at: { unit: 1, lesson: 7 } },

  // ── 2단원 분수의 곱셈 ─────────────────────────────────────────────
  // 낱말만이 아니라 '계산 방법'도 차례가 있습니다. 분자끼리·분모끼리
  // 곱하는 방법은 (진분수)×(진분수)를 배우는 6차시에서 처음 나옵니다.
  // 2~5차시(자연수가 낀 곱셈)의 힌트에 그 방법이 먼저 적혀 있으면,
  // 아이는 아직 해 보지 않은 방법으로 설명을 듣게 됩니다.
  // 분모가 같은 분수의 덧셈('분자끼리 더한다')은 4학년에서 배웁니다.
  // 여기서 보는 것은 곱셈뿐입니다.
  { 말: ['분자끼리 곱', '분모끼리 곱'], at: { unit: 2, lesson: 6 } },

  // ── 3단원 합동과 대칭 ─────────────────────────────────────────────
  { 말: ['합동'], at: { unit: 3, lesson: 2 } },
  { 말: ['대응점', '대응변', '대응각'], at: { unit: 3, lesson: 2 } },
  { 말: ['선대칭'], at: { unit: 3, lesson: 4 } },
  { 말: ['대칭축'], at: { unit: 3, lesson: 4 } },
  { 말: ['점대칭'], at: { unit: 3, lesson: 6 } },
  { 말: ['대칭의 중심'], at: { unit: 3, lesson: 6 } },

  // ── 5단원 직육면체와 정육면체 ─────────────────────────────────────
  { 말: ['직육면체'], at: { unit: 5, lesson: 2 } },
  // '꼭짓점'은 3학년 1학기 평면도형에서 이미 배웁니다. '모서리'는
  // 입체도형의 용어라 여기서 처음입니다.
  { 말: ['모서리'], at: { unit: 5, lesson: 2 } },
  { 말: ['밑면', '옆면'], at: { unit: 5, lesson: 3 } },
  { 말: ['정육면체'], at: { unit: 5, lesson: 4 } },
  { 말: ['겨냥도'], at: { unit: 5, lesson: 5 } },
  { 말: ['전개도'], at: { unit: 5, lesson: 6 } },

  // ── 6단원 평균과 가능성 ───────────────────────────────────────────
  { 말: ['평균'], at: { unit: 6, lesson: 2 } },
  { 말: ['대푯값'], at: { unit: 6, lesson: 2 } },
  { 말: ['가능성'], at: { unit: 6, lesson: 5 } },
  { 말: ['불가능하다', '반반이다', '확실하다'], at: { unit: 6, lesson: 5 } },
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
] as Array<readonly [string, string]>;

describe('5-2 선행 검수', () => {
  const 모든차시 = curriculum5.flatMap((unit) => unit.lessons);

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
});
