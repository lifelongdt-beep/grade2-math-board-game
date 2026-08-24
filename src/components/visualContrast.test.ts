import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// 그림은 두 곳에 나옵니다 — 학생 자리(어두운 바탕)와 '자세히 보기'
// 창(밝은 바탕)입니다. 그래서 그림마다 제 판을 깔고 그 위에 진한
// 글자로 적어야 어느 쪽에서든 읽힙니다.
//
// 표 하나만 판을 깔지 않고 검은 바탕에 흰 글자로 그려져 있었습니다.
// 자세히 보기를 누르면 표의 수가 그대로 사라졌습니다.
describe('그림의 글자색', () => {
  it('흰 글자로 적는 그림은 없다', () => {
    const source = readFileSync(new URL('./QuestionVisualGraphic.tsx', import.meta.url), 'utf-8');
    const pale = /#f{3}(f{3})?\b|["']white["']/i;
    const bad: string[] = [];

    for (const tag of source.match(/<text[^>]*>/g) ?? []) {
      const fill = /fill=(\{[^}]*\}|"[^"]*")/.exec(tag);
      if (fill && pale.test(fill[1])) bad.push(fill[0]);
    }

    expect(bad).toEqual([]);
  });
});
