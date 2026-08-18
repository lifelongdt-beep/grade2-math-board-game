import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';

const isNum = (s: string) => /^-?\d/.test(s.trim());
const shape = (s: string) => s.replace(/\d+/g, '#');

describe('peek', () => {
  it('measures sharper leaks', () => {
    const out: string[] = [];
    let total = 0;
    const atIndex = [0, 0, 0, 0];
    let longestAndOdd = 0;
    let longestAndOddTried = 0;
    let lonelyWrongs = 0;
    let textQuestions = 0;
    let answerAlsoAWrong = 0;
    const repeatedAnswer: string[] = [];

    // 어느 보기가 다른 문제에서 정답으로 쓰인 적이 있는지 모아 둡니다.
    const everCorrect = new Set<string>();
    const all: { lessonId: string; level: string; q: ReturnType<typeof generateQuestions>[number] }[] = [];
    for (const lesson of lessons) {
      if (lesson.title === '단원 도입') continue;
      for (const level of ['하', '중', '상'] as const) {
        for (const q of generateQuestions(lesson, level)) {
          all.push({ lessonId: lesson.id, level, q });
          everCorrect.add(q.answer.trim());
        }
      }
    }

    const perLessonAnswers = new Map<string, Map<string, number>>();

    for (const { lessonId, level, q } of all) {
      total += 1;
      const i = q.choices.indexOf(q.answer);
      if (i >= 0 && i < 4) atIndex[i] += 1;

      // 요령 두 개를 겹칩니다 — '길면서 혼자 생김새가 다른 것'.
      const byLength = [...q.choices].sort((a, b) => b.length - a.length)[0];
      const tally = new Map<string, number>();
      q.choices.forEach((c) => tally.set(shape(c), (tally.get(shape(c)) ?? 0) + 1));
      const odd = q.choices.find((c) => tally.get(shape(c)) === 1);
      if (odd && odd === byLength) {
        longestAndOddTried += 1;
        if (odd === q.answer) longestAndOdd += 1;
      }

      // 글로 된 보기: 오답 셋이 어디서도 정답이 된 적 없으면, 아이는
      // '저건 늘 아니야'를 외워서 지웁니다.
      if (!isNum(q.answer)) {
        textQuestions += 1;
        const wrongs = q.choices.filter((c) => c !== q.answer);
        if (wrongs.every((w) => !everCorrect.has(w.trim()))) lonelyWrongs += 1;
        if (wrongs.some((w) => everCorrect.has(w.trim()))) answerAlsoAWrong += 1;
      }

      const key = `${lessonId}|${level}`;
      if (!perLessonAnswers.has(key)) perLessonAnswers.set(key, new Map());
      const m = perLessonAnswers.get(key)!;
      m.set(q.answer, (m.get(q.answer) ?? 0) + 1);
    }

    // 한 차시 서른 문제에 같은 답이 몇 번이나 나오는지.
    for (const [key, m] of perLessonAnswers) {
      const worst = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
      if (worst && worst[1] >= 5) repeatedAnswer.push(`${key} '${worst[0]}' ${worst[1]}번`);
    }

    const pct = (n: number, d: number) => `${Math.round((n / d) * 100)}%`;
    out.push(`문항 ${total}개`);
    out.push(`정답 자리 1~4번: ${atIndex.map((n) => pct(n, total)).join(' / ')}`);
    out.push(`'길면서 혼자 다른 것' ${pct(longestAndOdd, Math.max(1, longestAndOddTried))} (${longestAndOddTried}문항에서 통함)`);
    out.push(`글 보기 ${textQuestions}개 중 오답 셋이 모두 '어디서도 답이 아닌 것' ${pct(lonelyWrongs, Math.max(1, textQuestions))}`);
    out.push(`같은 답이 한 차시에 5번 넘게: ${repeatedAnswer.length}곳`);
    out.push(...repeatedAnswer.slice(0, 12));

    expect(out).toEqual([]);
  });
});
