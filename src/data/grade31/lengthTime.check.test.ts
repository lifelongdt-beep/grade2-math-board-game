import { describe, expect, it } from 'vitest';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-1 5단원 길이와 시간 — 답을 처음부터 다시 셉니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 문항들: Question[] = lessons31
  .filter((one) => one.unitNo === 5)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

const mm읽기 = (text: string): number | null => {
  const m = /^(?:(\d+) cm)?\s?(?:(\d+) mm)?$/.exec(text.trim());
  if (!m || (!m[1] && !m[2])) return null;
  return Number(m[1] ?? 0) * 10 + Number(m[2] ?? 0);
};
const m읽기 = (text: string): number | null => {
  const m = /^(?:(\d+) km)?\s?(?:(\d+) m)?$/.exec(text.trim());
  if (!m || (!m[1] && !m[2])) return null;
  return Number(m[1] ?? 0) * 1000 + Number(m[2] ?? 0);
};
const 초읽기 = (text: string): number | null => {
  const m = /^(?:(\d+)분)?\s?(?:(\d+)초)?$/.exec(text.trim());
  if (!m || (!m[1] && !m[2])) return null;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
};
const 시각읽기 = (text: string): number | null => {
  const m = /(\d+)시 (\d+)분 (\d+)초/.exec(text);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
};

describe('3-1 5단원 길이와 시간', () => {
  it('단위 바꾸기의 답이 맞습니다(1 cm=10 mm, 1 km=1000 m, 1분=60초)', () => {
    for (const q of 문항들) {
      const cm = /^(\d+ cm(?: \d+ mm)?)[은는] 몇 mm일까요/.exec(q.prompt);
      if (cm) expect(q.answer, q.prompt).toBe(`${mm읽기(cm[1])} mm`);
      const mm = /^(\d+) mm[은는] 몇 cm 몇 mm일까요/.exec(q.prompt);
      if (mm) expect(mm읽기(q.answer), q.prompt).toBe(Number(mm[1]));
      const km = /^(\d+ km(?: \d+ m)?)[은는] 몇 m일까요/.exec(q.prompt);
      if (km) expect(q.answer, q.prompt).toBe(`${m읽기(km[1])} m`);
      const m = /^(\d+) m[은는] 몇 km 몇 m일까요/.exec(q.prompt);
      if (m) expect(m읽기(q.answer), q.prompt).toBe(Number(m[1]));
      const 분초 = /^(\d+분 \d+초)[은는] 몇 초일까요/.exec(q.prompt);
      if (분초) expect(q.answer, q.prompt).toBe(`${초읽기(분초[1])}초`);
      const 초 = /^(\d+)초[은는] 몇 분 몇 초일까요/.exec(q.prompt);
      if (초) expect(초읽기(q.answer), q.prompt).toBe(Number(초[1]));
    }
  });

  it('자와 시계를 읽는 문항의 답이 그림과 같습니다', () => {
    for (const q of 문항들) {
      if (q.visual?.kind === 'ruler' && /몇 cm 몇 mm/.test(q.prompt)) {
        expect(mm읽기(q.answer), q.prompt).toBe(q.visual.highlightEnd - q.visual.highlightStart);
      }
      if (q.visual?.kind === 'ruler' && /약 몇 cm/.test(q.prompt)) {
        const len = q.visual.highlightEnd - q.visual.highlightStart;
        expect(q.answer, q.prompt).toBe(`약 ${Math.round(len / 10)} cm`);
        expect(len % 10 === 5, q.prompt).toBe(false);
      }
      if (q.visual?.kind === 'clock' && q.visual.second !== undefined) {
        expect(q.answer, q.prompt).toBe(`${q.visual.hour}시 ${q.visual.minute}분 ${q.visual.second}초`);
      }
    }
  });

  it('시간의 덧셈과 뺄셈의 답이 맞고, 초와 분은 60보다 작게 씁니다', () => {
    for (const q of 문항들) {
      const 두시간 = /은?는? (\d+분 \d+초|\d+분|\d+초), .+?[은는] (\d+분 \d+초|\d+분|\d+초)입니다\. .*모두 몇 분 몇 초/.exec(q.prompt);
      if (두시간) expect(초읽기(q.answer), q.prompt).toBe((초읽기(두시간[1]) ?? 0) + (초읽기(두시간[2]) ?? 0));
      const 시작더하기 = /(\d+시 \d+분 \d+초)(?:에 시작하여|부터) (\d+분 \d+초|\d+분|\d+초) 동안/.exec(q.prompt);
      if (시작더하기) expect(시각읽기(q.answer), q.prompt).toBe((시각읽기(시작더하기[1]) ?? 0) + (초읽기(시작더하기[2]) ?? 0));
      const 빼기 = /^(\d+분 \d+초|\d+분)-(\d+분 \d+초|\d+분|\d+초)[을를] 계산하면/.exec(q.prompt);
      if (빼기) expect(초읽기(q.answer), q.prompt).toBe((초읽기(빼기[1]) ?? 0) - (초읽기(빼기[2]) ?? 0));
      const 거꾸로 = /(\d+분 \d+초|\d+분|\d+초) 동안 탔더니 (\d+시 \d+분 \d+초)였습니다/.exec(q.prompt);
      if (거꾸로) expect(시각읽기(q.answer), q.prompt).toBe((시각읽기(거꾸로[2]) ?? 0) - (초읽기(거꾸로[1]) ?? 0));
      // 정답에 나오는 분·초는 60보다 작습니다.
      // '86초'처럼 초만으로 답하는 바꾸기 문항은 빼고, 분과 초를 함께 쓴 답만 봅니다.
      if (/분 \d+초/.test(q.answer)) {
        for (const m of q.answer.matchAll(/(\d+)초/g)) expect(Number(m[1]), q.prompt).toBeLessThan(60);
      }
      if (/시 \d+분/.test(q.answer)) {
        for (const m of q.answer.matchAll(/(\d+)분/g)) expect(Number(m[1]), q.prompt).toBeLessThan(60);
      }
    }
  });

  it('지나친 단위 바꾸기(km와 cm, km와 mm)를 하지 않습니다', () => {
    for (const q of 문항들) {
      const 글 = [q.prompt, q.answer].join(' ');
      expect(/km/.test(글) && /\d+ (?:cm|mm)/.test(글), q.prompt).toBe(false);
    }
  });

  it('보기는 넷이고 서로 다르며 정답이 그 안에 있습니다', () => {
    for (const q of 문항들) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices[q.answerIndex], q.prompt).toBe(q.answer);
    }
  });
});
