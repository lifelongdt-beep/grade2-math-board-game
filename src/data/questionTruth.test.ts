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

  it('shows the table or picture it tells the child to read', () => {
    // '표를 보고', '그래프에서'라고 해 놓고 표가 없으면 볼 것이 없습니다.
    //
    // 처음에는 이 검사를 훨씬 넓게 썼습니다 — '셈을 시키는 말이 있으면 수가
    // 둘은 있어야 한다'로요. 그랬더니 '원 3개를 그렸습니다. 꼭짓점은 모두
    // 몇 개일까요?'가 걸렸습니다. 원에 꼭짓점이 없다는 것은 세는 것이
    // 아니라 아는 것이라 수가 하나뿐인 것이 맞습니다. 예순일곱 건 가운데
    // 진짜는 하나도 없었습니다. 짖기만 하는 검사는 아무도 보지 않게 되므로,
    // 기계가 틀림없이 판단할 수 있는 곳까지 좁혔습니다.
    // '표는 항목별 수를 알아보기 좋습니다' 같은 문장은 표를 읽으라는 말이
    // 아니라 표가 무엇인지 이야기하는 말입니다. 시키는 말만 봅니다.
    const missing: string[] = [];
    const pointsAtSomething = /표를 보고|그래프를 보고|그림을 보고|위 표|위 그래프/;

    for (const { lessonId, level, question } of all) {
      // 풀이 과정 문항의 '③ 표를 보고 그래프로 나타냅니다'는 지금 표를
      // 보라는 말이 아니라 순서를 적어 놓은 말입니다.
      if (question.prompt.includes('①') || question.prompt.includes('바른 차례로')) continue;
      if (!pointsAtSomething.test(question.prompt)) continue;
      // 문제 안에 수가 죽 적혀 있으면 그것이 곧 표를 옮겨 적은 것입니다.
      if ((question.prompt.match(/\d+/g) ?? []).length >= 3) continue;
      if (question.visual) continue;

      missing.push(`${lessonId} ${level} ${question.id}: 보라고 한 것이 없음 — ${question.prompt.slice(0, 50)}`);
    }

    expect(missing).toEqual([]);
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

      // 문제가 '그 칸에 쓰라'고 이름을 대는 곳만 봅니다.
      //
      // 처음에는 '축구를 고른'처럼 세라는 말까지 넣었는데, 그러면
      // '단추를 색깔에 따라 나누었더니 … 단추는 모두 몇 개일까요?'가
      // 걸립니다. 단추는 표의 칸 이름이 아니라 나누는 물건이고, 그림에
      // 빨강·파랑·노랑이 있는 것이 맞습니다. 표의 칸 이름을 대는 말만
      // 남기면 남는 것은 실제로 어긋난 경우뿐입니다.
      const named = [...question.prompt.matchAll(/([가-힣]{2,4})\s*칸/g)]
        .map((match) => match[1])
        // '세로 칸', '아무 칸에나'의 세로·아무는 줄 이름이 아닙니다.
        .filter((name) => name && !/자료|항목|그래프|사람|학생|모두|가장|빈|한|각|세로|가로|아무|다음/.test(name));

      for (const name of named) {
        // 줄 이름이 '투호 놀이'인데 문제가 '놀이 칸'이라고 부르면 그 줄이
        // 있는 것입니다. 글자가 똑같은지가 아니라 그 줄을 가리키는지를
        // 봅니다. 축구는 어느 줄 이름에도 들어 있지 않았습니다.
        const pointsAtARow = drawn.some((row) => row.includes(name) || name.includes(row));
        if (drawn.length > 0 && !pointsAtARow) {
          mismatched.push(`${lessonId} ${level} ${question.id}: 문제는 "${name}"을 세라는데 그림에는 ${drawn.join('·')}뿐`);
        }
      }
    }

    expect([...new Set(mismatched)]).toEqual([]);
  });

  it('does not already show the figures when it asks for the figures', () => {
    // '7000을 숫자로 바르게 쓴 것은?' 하고 보기에 7000을 두면 물음이
    // 되지 않습니다. 숫자로 쓰라고 하려면 숫자가 아닌 것 — 우리말로 읽은
    // 것 — 을 보여 주어야 합니다. 이 문항은 실제로 나가고 있었습니다.
    //
    // 이 검사는 '숫자로 쓰라'고 하는 문항만 봅니다. 한때 '답이 문제에
    // 적혀 있으면 안 된다'로 넓게 잡아 보았는데, 걸린 것이 거의 다
    // 멀쩡한 문항이었습니다 — 0×3의 답은 0이고, 21+33=54를 주고 54-33을
    // 묻는 것은 그 차시가 가르치려는 바로 그것이며, '166과 232 중 더 큰
    // 수'의 답은 둘 중 하나일 수밖에 없습니다. 수학에서 답이 문제에
    // 보이는 것은 흔한 일이라 그것만으로는 아무것도 가릴 수 없습니다.
    const givenAway: string[] = [];

    for (const { lessonId, level, question } of all) {
      if (!/숫자로 (?:바르게 )?쓴|숫자로 나타낸/.test(question.prompt)) continue;
      if (!/^\d+$/.test(question.answer)) continue;

      const standsAlone = new RegExp(`(?:^|[^\\d])${question.answer}(?:[^\\d]|$)`);
      if (standsAlone.test(question.prompt)) {
        givenAway.push(`${lessonId} ${level} ${question.id}: 숫자로 쓰라면서 ${question.answer}을 이미 보여 줌 — ${question.prompt.slice(0, 44)}`);
      }
    }

    expect(givenAway).toEqual([]);
  });

  it('never draws the same picture for two choices', () => {
    // 보기가 그림일 때는 글자가 달라도 그림이 같으면 답이 둘입니다.
    // 실제로 '사과 4명, 귤 4명'이 뽑히자 '두 줄을 바꾸어 그린' 오답이
    // 정답과 글자 하나 다르지 않은 같은 그림이 되었습니다.
    const doubled: string[] = [];

    for (const { lessonId, level, question } of all) {
      if (!question.choiceVisuals) continue;

      const drawn = question.choiceVisuals.map((visual) => JSON.stringify(visual));
      if (new Set(drawn).size !== drawn.length) {
        doubled.push(`${lessonId} ${level} ${question.id}: 같은 그림이 두 보기에 — ${question.prompt.slice(0, 44)}`);
      }
    }

    expect(doubled).toEqual([]);
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

  it('never tells the child the number it is about to ask for', () => {
    // 자료를 읽는 문항에서 되풀이해 나온 잘못입니다. 표나 그래프를 보여
    // 주면서 문제글에 그 수를 또 적으면, 읽을 것이 없어지고 아이는 옮겨
    // 적기만 합니다 — '○가 7개 그려져 있습니다. 몇 명일까요?'
    //
    // 견주는 문항(더 많다, 모두, 남은)은 견줄 수를 문제글에 적어야 하므로
    // 여기서 뺍니다. 넓게 걸었더니 멀쩡한 문항을 스무 개씩 물어 왔고,
    // 물어 오기만 하는 검사는 아무도 읽지 않습니다.
    // 자료를 읽는 문항으로만 겁니다. 글에 나온 낱말로 고르려 했더니
    // '3씩 뛰어 세어'의 세어까지 걸려 곱셈 문항을 스무 개씩 물어 왔습니다.
    const compares = /더|모두|합계|남|덜|많|적|차이|사이|바르게|어느 것/;
    const giveaways: string[] = [];

    for (const { lessonId, level, question } of all) {
      if (question.type !== 'data' && question.type !== 'classification') continue;
      if (compares.test(question.prompt)) continue;

      const asked = question.answer.match(/^(\d+)/);
      if (!asked) continue;
      const already = new RegExp(`(?:^|[^0-9])${asked[1]}(?:[^0-9]|$)`);
      if (already.test(question.prompt)) {
        giveaways.push(`${lessonId} ${level} ${question.id}: 답 ${question.answer} — ${question.prompt.slice(0, 52)}`);
      }
    }

    expect(giveaways).toEqual([]);
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
