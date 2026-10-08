import { describe, expect, it } from 'vitest';
import { lessons32 } from '../curriculum32';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-2 6단원 그림그래프 — 그래프에 실린 수로 답을 다시 확인합니다
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 모두: Question[] = lessons32
  .filter((one) => one.unitNo === 6)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));
const 수 = (text: string) => Number(text.replace(/[^\d]/g, ''));

describe('3-2 6단원 그림그래프', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons32.filter((one) => one.unitNo === 6)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('그래프는 그림 두 가지(10과 1, 100과 10)로 그릴 수 있는 수만 씁니다', () => {
    for (const q of 모두) {
      if (q.visual?.kind !== 'picture-graph') continue;
      expect(q.visual.big).toBe(q.visual.small * 10);
      for (const row of q.visual.rows) {
        expect(row.value % q.visual.small).toBe(0);
        expect(Math.floor(row.value / q.visual.big)).toBeLessThanOrEqual(5);
      }
    }
  });

  it('그래프를 읽은 답이 맞습니다', () => {
    let count = 0;
    for (const q of 모두) {
      if (q.visual?.kind !== 'picture-graph') continue;
      const v = q.visual;
      const 값 = (label: string) => v.rows.find((r) => r.label === label)!.value;
      const 이름 = v.rows.map((r) => r.label).filter((n) => q.prompt.includes(n));
      if (/구하면 몇/.test(q.prompt)) {
        expect(이름.length).toBe(1);
        expect(수(q.answer)).toBe(값(이름[0]));
        count += 1;
      }
      if (/그림 1개는 몇/.test(q.prompt)) expect(수(q.answer)).toBe(q.prompt.includes('큰 그림') ? v.big : v.small);
      if (/가장 많은|가장 적은/.test(q.prompt)) {
        const vals = v.rows.map((r) => r.value);
        const target = q.prompt.includes('가장 많은') ? Math.max(...vals) : Math.min(...vals);
        expect(vals.filter((x) => x === target).length).toBe(1);
        expect(q.answer).toBe(v.rows[vals.indexOf(target)].label);
        count += 1;
      }
      const 차 = /(\S+)[은는] (\S+)보다 몇 \S+ 더 많을까요/.exec(q.prompt);
      if (차) {
        const [a, b] = [차[1], 차[2]].map((n) => v.rows.find((r) => n.startsWith(r.label))!.value);
        expect(a > b).toBe(true);
        expect(수(q.answer)).toBe(a - b);
        count += 1;
      }
      if (/모두 몇/.test(q.prompt)) expect(수(q.answer)).toBe(v.rows.reduce((s, r) => s + r.value, 0));
      if (v.hideRow !== undefined) {
        const 합 = 수(/합계는 (\d+)/.exec(q.prompt)![1]);
        expect(합).toBe(v.rows.reduce((s, r) => s + r.value, 0));
        expect(수(q.answer)).toBe(v.rows[v.hideRow].value);
      }
    }
    expect(count).toBeGreaterThan(40);
  });

  it('그림으로 나타내기, 단위 정하기, 자료 세기가 맞습니다', () => {
    for (const q of 모두) {
      const 그리기 = /(\d+)\S+[을를] 큰 그림\((\d+)\S+\)과 작은 그림\((\d+)\S+\)으로/.exec(q.prompt);
      if (그리기) {
        const [n, big, small] = [Number(그리기[1]), Number(그리기[2]), Number(그리기[3])];
        expect(q.answer).toBe(`큰 그림 ${Math.floor(n / big)}개, 작은 그림 ${(n % big) / small}개`);
      }
      const 단위 = /^자료가 (.+)입니다\. 그림그래프로/.exec(q.prompt);
      if (단위) {
        const 값들 = 단위[1].split(', ').map(수);
        const 백 = 값들.every((x) => x >= 100);
        expect(q.answer.startsWith(백 ? '100' : '10')).toBe(true);
      }
      const 세기 = /말했습니다\. \((.+)\) (\S+)[을를] 좋아하는/.exec(q.prompt);
      if (세기) expect(수(q.answer)).toBe(세기[1].split(', ').filter((x) => x === 세기[2]).length);
      const 표 = /조사(?:하여 표로 나타냈습니다|했습니다)\. (.+)\. (?:조사한 학생은 모두|가장 많은)/.exec(q.prompt);
      if (표) {
        const 항목 = 표[1].split(', ').map((one) => ({ n: one.split(' ')[0], v: 수(one) }));
        if (q.prompt.includes('모두')) expect(수(q.answer)).toBe(항목.reduce((s, x) => s + x.v, 0));
        else expect(q.answer).toBe(항목.reduce((p, c) => (c.v > p.v ? c : p)).n);
      }
    }
  });

  it('조사가 괄호로 남지 않습니다', () => {
    for (const q of 모두) {
      const all = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(/\((을|를|은|는|이|가|과|와|으)\)/.test(all), all).toBe(false);
    }
  });
});
