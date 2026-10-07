import { describe, expect, it } from 'vitest';
import { lessons5 } from '../../curriculum5';
import { generateQuestions } from '../../questionFactory';
import type { Difficulty } from '../../../types';

// "그림에서 이등변삼각형을 찾으면?"의 보기에 정삼각형이 있으면 정답이
// 둘입니다. 정삼각형도 두 변의 길이가 같으므로 이등변삼각형입니다.
// 실제로 그렇게 나가고 있었습니다.
//
// 관계표는 생성기의 것을 가져다 쓰지 않고 여기 따로 적습니다. 같은
// 표를 쓰면 표가 틀렸을 때 검사도 함께 틀립니다.
const 이것도맞음: Record<string, string[]> = {
  이등변삼각형: ['이등변삼각형', '정삼각형'],
  정삼각형: ['정삼각형'],
  직각삼각형: ['직각삼각형'],
  정사각형: ['정사각형'],
  직사각형: ['직사각형', '정사각형'],
  마름모: ['마름모', '정사각형'],
  평행사변형: ['평행사변형', '직사각형', '마름모', '정사각형'],
  사다리꼴: ['사다리꼴', '평행사변형', '직사각형', '마름모', '정사각형'],
};

describe('도형 찾기 문항의 정답은 하나뿐이다', () => {
  it('찾는 도형에 함께 드는 도형이 다른 보기로 나오지 않습니다', () => {
    const 나쁨: string[] = [];
    let 본수 = 0;
    for (const l of lessons5.filter((one) => one.unitNo === 3)) {
      for (const d of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(l, d)) {
          const m = q.prompt.match(/^그림에서 (\S+?)[을를] 찾으면/);
          if (!m || q.visual?.kind !== 'figure-set') continue;
          const 맞는것 = 이것도맞음[m[1]];
          if (!맞는것) continue;
          본수 += 1;
          const 맞는보기 = q.visual.items.filter((it) => 맞는것.includes(it.shape)).map((it) => it.name);
          if (맞는보기.length !== 1 || 맞는보기[0] !== q.answer) {
            나쁨.push(`${q.id}: ${m[1]} → 맞는 보기 ${맞는보기.join(',')} / 정답 ${q.answer}`);
          }
        }
      }
    }
    expect(본수).toBeGreaterThan(8);
    expect([...new Set(나쁨)].slice(0, 8)).toEqual([]);
  });
});
