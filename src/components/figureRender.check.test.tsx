import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { writeFileSync, mkdirSync } from 'node:fs';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import { lessons } from '../data/curriculum';
import { lessons5 } from '../data/curriculum5';
import { lessons51 } from '../data/curriculum51';
import { generateQuestions } from '../data/questionFactory';
import type { Difficulty, Question } from '../types';

// ════════════════════════════════════════════════════════════════════
// 그림에 적은 글이 판 밖으로 잘리지 않는지
// ────────────────────────────────────────────────────────────────────
// 사다리꼴 문항에서 '윗변 3 cm'가 통째로 잘려 나갔습니다. 문제 글에는
// 윗변이 있는데 그림에는 없는 셈이라, 아이는 그림에서 윗변을 찾을 수
// 없었습니다. 자료를 보는 시험으로는 잡히지 않습니다 — 자료에는 글이
// 들어 있었고, 잘린 것은 그린 다음이기 때문입니다.
//
// 그래서 실제로 그려 보고 글자의 자리를 잽니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];

const 그림문항 = (): Array<{ where: string; question: Question }> => {
  const out: Array<{ where: string; question: Question }> = [];
  for (const lesson of [...lessons51, ...lessons5, ...lessons]) {
    for (const level of levels) {
      for (const question of generateQuestions(lesson, level)) {
        if (question.visual?.kind !== 'figure-set') continue;
        out.push({ where: `${lesson.id} ${level} ${question.id}`, question });
      }
    }
  }
  return out;
};

const viewBoxOf = (svg: string) => {
  const hit = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  return hit ? { width: Number(hit[1]), height: Number(hit[2]) } : null;
};

const 글자들 = (svg: string) => {
  const out: Array<{ x: number; y: number; text: string }> = [];
  const re = /<text[^>]*\bx="([-\d.]+)"[^>]*\by="([-\d.]+)"[^>]*>([^<]*)<\/text>/g;
  for (let hit = re.exec(svg); hit; hit = re.exec(svg)) {
    out.push({ x: Number(hit[1]), y: Number(hit[2]), text: hit[3] });
  }
  return out;
};

describe('도형 그림 그리기', () => {
  const 문항들 = 그림문항();

  it('그릴 것이 있다', () => {
    expect(문항들.length).toBeGreaterThan(100);
  });

  it('글자가 판 밖으로 나가지 않는다', () => {
    const broken: string[] = [];
    for (const { where, question } of 문항들) {
      const svg = renderToStaticMarkup(createElement(QuestionVisualGraphic, { visual: question.visual! }));
      const box = viewBoxOf(svg);
      if (!box) { broken.push(`${where}: viewBox를 찾을 수 없음`); continue; }
      for (const one of 글자들(svg)) {
        // 글자는 가운데를 기준으로 놓이므로 좌우로 조금 더 번집니다.
        if (one.x < 4 || one.x > box.width - 4 || one.y < 10 || one.y > box.height - 2) {
          broken.push(`${where}: "${one.text}"이 (${one.x}, ${one.y})로 판(${box.width}×${box.height}) 밖`);
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 10)).toEqual([]);
  });

  it('글자끼리 겹치지 않는다', () => {
    const broken: string[] = [];
    for (const { where, question } of 문항들) {
      const svg = renderToStaticMarkup(createElement(QuestionVisualGraphic, { visual: question.visual! }));
      const texts = 글자들(svg).filter((one) => one.text.trim());
      for (let a = 0; a < texts.length; a += 1) {
        for (let b = a + 1; b < texts.length; b += 1) {
          // 글자 한 자를 8, 높이를 15로 잡습니다.
          const 가로겹침 = Math.abs(texts[a].x - texts[b].x) < (texts[a].text.length + texts[b].text.length) * 4 - 6;
          const 세로겹침 = Math.abs(texts[a].y - texts[b].y) < 14;
          if (가로겹침 && 세로겹침) {
            broken.push(`${where}: "${texts[a].text}"과 "${texts[b].text}"이 겹침`);
          }
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 10)).toEqual([]);
  });

  it('본보기 그림을 남긴다', () => {
    // 사람이 눈으로 보고 싶을 때 쓰는 파일입니다. 시험이 아닙니다.
    mkdirSync('/tmp/claude-0/figures', { recursive: true });
    const 뽑은 = ['5-1-u6-l6', '5-1-u6-l7', '5-1-u6-l8', '5-1-u6-l9'];
    for (const id of 뽑은) {
      const one = 문항들.find((item) => item.where.startsWith(id));
      if (!one) continue;
      const svg = renderToStaticMarkup(createElement(QuestionVisualGraphic, { visual: one.question.visual! }));
      writeFileSync(`/tmp/claude-0/figures/${id}.svg`, `<!-- ${one.question.prompt} -->\n${svg}`);
    }
    expect(true).toBe(true);
  });
});
