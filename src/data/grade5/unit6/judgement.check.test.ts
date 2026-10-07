import { describe, expect, it } from 'vitest';
import { lessons5 } from '../../curriculum5';
import { generateQuestions } from '../../questionFactory';
import type { Difficulty } from '../../../types';

// 평균과 가능성 문항을 직접 풀어 보다 찾은 것을 지킵니다.
const 모든문항 = lessons5
  .filter((one) => one.unitNo === 6)
  .flatMap((l) => (['하', '중', '상'] as Difficulty[]).flatMap((d) => generateQuestions(l, d)));

describe('평균과 가능성 문항의 정답은 하나뿐이다', () => {
  it('"평균이 될 수 없는 수"에서 가장 작은 값·가장 큰 값을 될 수 있는 수로 두지 않습니다', () => {
    // 가장 작은 값과 가장 큰 값이 다르면 평균은 그 둘과 같을 수 없습니다.
    // 그 둘을 보기에 두면 정답이 셋이 됩니다.
    const 나쁨: string[] = [];
    let 본수 = 0;
    for (const q of 모든문항) {
      const m = q.prompt.match(/가장 작은 값이 (\d+)\D+, 가장 큰 값이 (\d+)\D+였습니다\. 이 자료의 평균이 될 수 없는/);
      if (!m) continue;
      본수 += 1;
      const [작은, 큰] = [Number(m[1]), Number(m[2])];
      const 될수없음 = q.choices.filter((one) => {
        const v = Number(one.match(/\d+/)?.[0]);
        return v <= 작은 || v >= 큰;
      });
      if (될수없음.length !== 1 || 될수없음[0] !== q.answer) {
        나쁨.push(`${q.id}: ${작은}~${큰} → 될 수 없는 보기 ${될수없음.join(',')} / 정답 ${q.answer}`);
      }
    }
    expect(본수).toBeGreaterThan(3);
    expect([...new Set(나쁨)].slice(0, 8)).toEqual([]);
  });

  it('실험 횟수로 판단하는 문항은 횟수 차이가 뚜렷합니다', () => {
    // 25번과 23번처럼 작은 차이로 "더 많이 들어 있다"고 하면 우연을
    // 근거로 판단하는 것을 가르치게 됩니다.
    const 나쁨: string[] = [];
    let 본수 = 0;
    for (const q of 모든문항) {
      if (!/(번 했더니|회 돌려 화살이 멈춘 횟수)/.test(q.prompt)) continue;
      const 횟수 = [...q.prompt.matchAll(/색 (\d+)[번회]/g)].map((one) => Number(one[1])).sort((a, b) => a - b);
      if (횟수.length < 2) continue;
      본수 += 1;
      for (let i = 1; i < 횟수.length; i += 1) {
        if (횟수[i] < 횟수[i - 1] * 1.5) 나쁨.push(`${q.id}: ${횟수.join(', ')}`);
      }
    }
    expect(본수).toBeGreaterThan(3);
    expect([...new Set(나쁨)].slice(0, 8)).toEqual([]);
  });

  it('그림에 없는 것을 풀이에서 세지 않습니다 — 회전판과 주머니를 견줄 때 주머니 속이 글에 있습니다', () => {
    const 나쁨 = 모든문항
      .filter((q) => q.prompt.includes('㉡') && q.prompt.includes('주머니에서') && q.visual?.kind === 'spinner')
      .filter((q) => !/바둑돌 \d+개/.test(q.prompt))
      .map((q) => q.id);
    expect(나쁨).toEqual([]);
  });
});
