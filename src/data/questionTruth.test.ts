import { describe, expect, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty, Question } from '../types';

const levels: Difficulty[] = ['하', '중', '상'];

// ════════════════════════════════════════════════════════════════════
// 문제가 참인가
// ────────────────────────────────────────────────────────────────────
// 다른 검사들은 문제의 '모양'을 봅니다 — 범위를 넘지 않는지, 차시 순서를
// 지키는지, 모양이 되풀이되지 않는지. 이 검사는 문제의 '내용'을 봅니다.
// 적힌 셈이 정말 그 답이 되는지, 답이 보기 안에 있는지, 문제만 읽고 답을
// 낼 수 있는지.
//
// 이 검사가 생긴 까닭은 실제로 나간 문제 하나 때문입니다.
//   "축구를 고른 사람을 세어 표의 축구 칸에 쓰시오" 옆에
//   가·나·다만 있는 표가 놓이고, 정답 6은 어디에도 없었습니다.
// 세라고 한 것이 그림에 없으면 아이는 아무리 세어도 맞힐 수 없습니다.
// 모양 검사는 이런 것을 잡지 못합니다. 수가 범위 안이고, 보기도 넷이고,
// 차시 순서도 맞으니까요.
//
// 여기서는 기계가 정말로 판단할 수 있는 것만 봅니다. 애매한 것을 넣으면
// 거짓 경고가 쌓이고, 그러면 아무도 이 검사를 보지 않게 됩니다.
// ════════════════════════════════════════════════════════════════════

const everyQuestion = (): Array<{ lessonId: string; level: Difficulty; question: Question }> => {
  const all: Array<{ lessonId: string; level: Difficulty; question: Question }> = [];
  for (const lesson of lessons) {
    for (const level of levels) {
      for (const question of generateQuestions(lesson, level)) {
        all.push({ lessonId: lesson.id, level, question });
      }
    }
  }
  return all;
};

const all = everyQuestion();

// 답에 적힌 수입니다. '35장' → 35, '2m 34cm'처럼 수가 둘이면 셈을 견줄 수
// 없으므로 보지 않습니다.
const soleNumber = (text: string): number | null => {
  const found = text.match(/-?\d+/g);
  return found && found.length === 1 ? Number(found[0]) : null;
};

describe('the maths in each question is true', () => {
  it('gives the answer the arithmetic in the question actually produces', () => {
    // 'a+b는 얼마일까요?'처럼 셈이 그대로 적힌 문제만 봅니다. 문장제는
    // 무엇을 더하고 무엇을 빼는지 기계가 정할 수 없으므로 지나갑니다.
    const wrong: string[] = [];

    for (const { lessonId, level, question } of all) {
      // 풀이 과정 문항은 중간 단계를 묻습니다. 앞에 적힌 식이 곧 답이
      // 아니므로 이 검사에서 뺍니다.
      if (question.prompt.includes('①')) continue;

      const sum = question.prompt.match(/(?:^|[\s(])(\d+)\s*([+\-×*])\s*(\d+)\s*(?:은|는|을|를|이|가)?\s*얼마/);
      if (!sum) continue;

      const [, left, operator, right] = sum;
      const a = Number(left);
      const b = Number(right);
      const expected = operator === '+' ? a + b : operator === '-' ? a - b : a * b;
      const given = soleNumber(question.answer);
      if (given === null) continue;

      if (given !== expected) {
        wrong.push(`${lessonId} ${level} ${question.id}: ${a}${operator}${b}는 ${expected}인데 답이 ${given} — ${question.prompt.slice(0, 40)}`);
      }
    }

    expect(wrong).toEqual([]);
  });

  it('never puts the right answer in the choices more than once', () => {
    // 같은 값이 두 자리에 있으면 맞게 골라도 틀렸다고 나옵니다.
    const doubled: string[] = [];

    for (const { lessonId, level, question } of all) {
      const same = question.choices.filter((choice) => choice === question.answer).length;
      if (same !== 1) {
        doubled.push(`${lessonId} ${level} ${question.id}: 정답 "${question.answer}"이 보기에 ${same}번 — ${question.choices.join(' / ')}`);
      }
    }

    expect(doubled).toEqual([]);
  });

  it('marks the choice it says is the answer', () => {
    // answerIndex가 가리키는 자리와 answer가 어긋나면, 아이가 화면에서
    // 고른 것과 채점하는 것이 달라집니다.
    const mismatched: string[] = [];

    for (const { lessonId, level, question } of all) {
      if (question.choices[question.answerIndex] !== question.answer) {
        mismatched.push(`${lessonId} ${level} ${question.id}: ${question.answerIndex}번은 "${question.choices[question.answerIndex]}"인데 정답은 "${question.answer}"`);
      }
    }

    expect(mismatched).toEqual([]);
  });

  it('never shows a second grader a negative number', () => {
    // 2학년은 음수를 배우지 않습니다. 보기에 -5가 있으면 그것이 무엇인지
    // 물어볼 수조차 없습니다.
    const below: string[] = [];

    for (const { lessonId, level, question } of all) {
      const shown = [question.prompt, ...question.choices].join(' ');
      // '3-5'처럼 식 안의 빼기 기호는 음수가 아닙니다. 수 앞에 붙은
      // 빼기만 봅니다 — 앞이 공백이거나 문장의 시작인 경우입니다.
      const negatives = shown.match(/(?:^|[\s(])-\d+/g);
      if (negatives) {
        below.push(`${lessonId} ${level} ${question.id}: ${negatives.join(', ')} — ${question.prompt.slice(0, 40)}`);
      }
    }

    expect(below).toEqual([]);
  });

  it('gives the numbers the question asks the child to work with', () => {
    // '축구를 고른 사람을 세시오'라고 하면서 축구가 몇 명인지도, 셀 그림도
    // 주지 않으면 답을 낼 길이 없습니다. 셈을 시키는 말이 있으면 문제나
    // 그림 어딘가에 수가 둘 이상은 있어야 합니다.
    const impossible: string[] = [];
    const asksToCompute = /모두 몇|몇 개 더|몇 명 더|몇 cm 더|차는|합은|세어|더하면|빼면/;

    for (const { lessonId, level, question } of all) {
      if (!asksToCompute.test(question.prompt)) continue;

      const inPrompt = (question.prompt.match(/\d+/g) ?? []).length;
      const inVisual = question.visual
        ? JSON.stringify(question.visual).match(/:\s*-?\d+/g)?.length ?? 0
        : 0;

      if (inPrompt + inVisual < 2) {
        impossible.push(`${lessonId} ${level} ${question.id}: 셀 것이 없음 — ${question.prompt.slice(0, 50)}`);
      }
    }

    expect(impossible).toEqual([]);
  });

  it('draws only what the question is about', () => {
    // 문제가 이름을 대며 세라고 하는데 그림에 그 이름이 없으면, 아이가
    // 그림을 아무리 세어도 정답이 나오지 않습니다. 실제로 나갔던 문제가
    // 이것이었습니다 — '축구 칸에 쓰시오' 옆에 가·나·다 표.
    const mismatched: string[] = [];

    for (const { lessonId, level, question } of all) {
      const visual = question.visual;
      if (!visual || (visual.kind !== 'pictograph' && visual.kind !== 'table')) continue;

      const drawn = visual.kind === 'pictograph'
        ? visual.items.map((item) => item.label)
        : visual.columns.map((column) => column.name);

      // 문제가 부르는 이름들입니다. '축구를', '축구 칸' 같은 말에서 뽑습니다.
      const named = [...question.prompt.matchAll(/([가-힣]{2,4})(?:를|을)\s*(?:고른|좋아하는|세)|([가-힣]{2,4})\s*칸/g)]
        .map((match) => match[1] ?? match[2])
        .filter((name) => name && !/자료|항목|그래프|사람|학생|모두|가장/.test(name));

      for (const name of named) {
        if (drawn.length > 0 && !drawn.includes(name)) {
          mismatched.push(`${lessonId} ${level} ${question.id}: 문제는 "${name}"을 세라는데 그림에는 ${drawn.join('·')}뿐`);
        }
      }
    }

    expect([...new Set(mismatched)]).toEqual([]);
  });

  it('offers four choices that are all different', () => {
    const thin: string[] = [];

    for (const { lessonId, level, question } of all) {
      if (question.choices.length !== 4) {
        thin.push(`${lessonId} ${level} ${question.id}: 보기가 ${question.choices.length}개`);
        continue;
      }
      if (new Set(question.choices).size !== 4) {
        thin.push(`${lessonId} ${level} ${question.id}: 겹치는 보기 — ${question.choices.join(' / ')}`);
      }
    }

    expect(thin).toEqual([]);
  });

  it('never leaves a blank where a number should be', () => {
    // 채워지지 않은 자리는 'undefined'나 'NaN'으로 나옵니다. 아이에게는
    // 읽을 수 없는 글자입니다.
    const broken: string[] = [];

    for (const { lessonId, level, question } of all) {
      const shown = [question.prompt, question.answer, ...question.choices, question.explanation].join(' ');
      if (/undefined|NaN|null|\[object/.test(shown)) {
        broken.push(`${lessonId} ${level} ${question.id}: ${question.prompt.slice(0, 40)}`);
      }
    }

    expect(broken).toEqual([]);
  });
});
