import { describe, expect, it } from 'vitest';
import { lessons5 } from '../../curriculum5';
import { lessons51 } from '../../curriculum51';
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
    for (const l of [...lessons5, ...lessons51]) {
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

// 5-2 5단원에서 "그림에서 평행사변형이 모두 몇 개?"가 그림의 직사각형을
// 빼고 세었습니다. "네 변의 길이가 모두 같은 사각형을 무엇이라고 할까요?"
// 의 틀린 보기에는 정사각형이 있었습니다. 둘 다 아이에게 "정사각형은
// 마름모가 아니다"를 가르칩니다.
const 뜻에맞는이름: Record<string, string[]> = {
  '네 각이 모두 직각인 사각형': ['직사각형', '정사각형'],
  '네 변의 길이가 모두 같은 사각형': ['마름모', '정사각형'],
  '마주 보는 두 쌍의 변이 서로 평행한 사각형': ['평행사변형', '직사각형', '마름모', '정사각형'],
  '네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형': ['정사각형'],
  '평행한 변이 한 쌍이라도 있는 사각형': ['사다리꼴', '평행사변형', '마름모', '직사각형', '정사각형'],
  // 정사각형은 직사각형이므로 정육면체도 직육면체입니다.
  '정사각형 6개로 둘러싸인 도형': ['정육면체', '직육면체'],
  '직사각형 6개로 둘러싸인 도형': ['직육면체', '정육면체'],
};

describe('도형을 세거나 이름을 묻는 문항도 포함 관계를 따른다', () => {
  const 모든문항 = [...lessons5, ...lessons51].flatMap((l) =>
    (['하', '중', '상'] as Difficulty[]).flatMap((d) => generateQuestions(l, d)),
  );

  it('"그림에서 X이 모두 몇 개"는 X의 조건을 갖춘 도형을 모두 셉니다', () => {
    const 나쁨: string[] = [];
    let 본수 = 0;
    for (const q of 모든문항) {
      const m = q.prompt.match(/^그림에서 (\S+?)[이가] 모두 몇 개일까요/);
      if (!m || q.visual?.kind !== 'figure-set') continue;
      const 맞는것 = 이것도맞음[m[1]];
      if (!맞는것) continue;
      본수 += 1;
      const 센것 = q.visual.items.filter((it) => 맞는것.includes(it.shape)).length;
      if (`${센것}개` !== q.answer) {
        나쁨.push(`${q.id}: ${m[1]} — 그림 ${q.visual.items.map((it) => it.shape).join(',')} → ${센것}개인데 정답 ${q.answer}`);
      }
    }
    expect(본수).toBeGreaterThan(8);
    expect([...new Set(나쁨)].slice(0, 8)).toEqual([]);
  });

  it('뜻을 주고 이름을 물을 때 그 뜻을 갖춘 다른 이름이 틀린 보기로 나오지 않습니다', () => {
    const 나쁨: string[] = [];
    let 본수 = 0;
    for (const q of 모든문항) {
      const m = q.prompt.match(/^(.+?)[을를] 무엇이라고 할까요/);
      if (!m) continue;
      const 맞는이름 = 뜻에맞는이름[m[1]];
      if (!맞는이름) continue;
      본수 += 1;
      const 맞는보기 = q.choices.filter((one) => 맞는이름.includes(one));
      if (맞는보기.length !== 1) 나쁨.push(`${q.id}: ${m[1]} → 맞는 보기 ${맞는보기.join(',')}`);
    }
    expect(본수).toBeGreaterThan(3);
    expect([...new Set(나쁨)].slice(0, 8)).toEqual([]);
  });

  it('"정육면체의 면은 어떤 모양"에 정사각형을 품는 이름이 틀린 보기로 나오지 않습니다', () => {
    const 나쁨: string[] = [];
    for (const q of 모든문항) {
      if (!q.prompt.startsWith('정육면체의 면은 어떤 모양')) continue;
      const 맞는보기 = q.choices.filter((one) => ['정사각형', '직사각형', '마름모', '평행사변형', '사다리꼴'].includes(one));
      if (맞는보기.length !== 1) 나쁨.push(`${q.id}: ${맞는보기.join(',')}`);
    }
    expect([...new Set(나쁨)]).toEqual([]);
  });
});
