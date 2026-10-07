import { describe, expect, it } from 'vitest';
import { FIGURE_POINTS } from '../components/QuestionVisualGraphic';
import { lessons } from './curriculum';
import { lessons5 } from './curriculum5';
import { lessons51 } from './curriculum51';
import { generateQuestions } from './questionFactory';
import type { Difficulty, QuestionVisual } from '../types';

// 그림에 적은 숫자를 그림에서 실제로 잽니다.
//
// 대응각 문항은 한 가지 사각형을 그려 두고 각도만 바꾸어 적었습니다.
// 그래서 144°쯤으로 그린 꼭짓점에 74°라고 적혔습니다. 아이는 그림을
// 믿고 풉니다 — 그림이 둔각인데 숫자가 예각이면 "각도는 그림과 상관없다"
// 는 것을 배웁니다. 문항마다 숫자를 따로 맞추었는지 눈으로 볼 수는
// 없으므로, 모든 문항을 만들어 재 봅니다.

const levels: Difficulty[] = ['하', '중', '상'];

type 항목 = Extract<QuestionVisual, { kind: 'figure-set' }>['items'][number];

const 꼭짓점들 = (one: 항목): Array<[number, number]> | undefined =>
  one.points ?? FIGURE_POINTS[one.shape];

const 내각 = (점들: Array<[number, number]>, 자리: number) => {
  const n = 점들.length;
  const 앞 = 점들[(자리 + n - 1) % n];
  const 뒤 = 점들[(자리 + 1) % n];
  const 가운데 = 점들[자리];
  const a = [앞[0] - 가운데[0], 앞[1] - 가운데[1]];
  const b = [뒤[0] - 가운데[0], 뒤[1] - 가운데[1]];
  const 코사인 = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]));
  return (Math.acos(Math.max(-1, Math.min(1, 코사인))) * 180) / Math.PI;
};

const 모든그림항목 = () => {
  const 모음: Array<{ 이름: string; 항목: 항목 }> = [];
  for (const lesson of [...lessons, ...lessons51, ...lessons5]) {
    for (const level of levels) {
      for (const q of generateQuestions(lesson, level)) {
        for (const visual of [q.visual, ...(q.choiceVisuals ?? [])]) {
          if (visual?.kind !== 'figure-set') continue;
          for (const 항목 of visual.items) 모음.push({ 이름: `${q.id}: ${q.prompt.slice(0, 40)}`, 항목 });
        }
      }
    }
  }
  return 모음;
};

describe('그림에 적은 숫자는 그림과 맞는다', () => {
  const 모음 = 모든그림항목();

  it('각에 적은 크기가 그 꼭짓점의 실제 내각과 같습니다', () => {
    const 어긋남: string[] = [];
    let 잰수 = 0;
    for (const { 이름, 항목 } of 모음) {
      const 점들 = 꼭짓점들(항목);
      if (!점들 || !항목.angleLabels?.length) continue;
      for (const 표 of 항목.angleLabels) {
        const 적은것 = /^(\d+)°$/.exec(표.text);
        if (!적은것) continue;
        잰수 += 1;
        const 잰것 = 내각(점들, 표.at);
        if (Math.abs(잰것 - Number(적은것[1])) > 1.5) {
          어긋남.push(`${이름} — ${표.at}번에 ${표.text}, 그림은 ${잰것.toFixed(1)}°`);
        }
      }
    }
    expect(잰수).toBeGreaterThan(50);
    expect([...new Set(어긋남)].slice(0, 200)).toEqual([]);
  });

  it('변에 적은 길이가 그려진 길이와 같은 비율입니다', () => {
    const 어긋남: string[] = [];
    let 잰수 = 0;
    for (const { 이름, 항목 } of 모음) {
      const 점들 = 꼭짓점들(항목);
      if (!점들 || (항목.edgeLabels?.length ?? 0) < 2) continue;
      const 비율들: number[] = [];
      for (const 표 of 항목.edgeLabels!) {
        const 적은것 = /^(\d+(?:\.\d+)?) ?cm$/.exec(표.text);
        if (!적은것) continue;
        const [x1, y1] = 점들[표.from];
        const [x2, y2] = 점들[표.to];
        비율들.push(Math.hypot(x2 - x1, y2 - y1) / Number(적은것[1]));
      }
      if (비율들.length < 2) continue;
      잰수 += 1;
      if (Math.max(...비율들) / Math.min(...비율들) > 1.05) {
        어긋남.push(`${이름} — ${항목.edgeLabels!.map((one: { text: string }) => one.text).join(', ')}`);
      }
    }
    expect(잰수).toBeGreaterThan(10);
    expect([...new Set(어긋남)].slice(0, 200)).toEqual([]);
  });
});
