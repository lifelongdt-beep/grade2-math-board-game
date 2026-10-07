import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

// 2-1 덧셈과 뺄셈은 차시마다 다루는 셈의 꼴이 정해져 있습니다(지도서 단원
// 전개 계획). 앞 차시에서 뒤 차시의 셈을 시키면 아직 배우지 않은 것을 묻게
// 됩니다. 예전에는 5차시((두 자리 수)-(한 자리 수))에 64-18이, 2차시에
// 세 수의 계산 56+38-8이 나왔습니다.
const 꼴 = (x: number, op: string, y: number) => {
  if (op === '+') {
    if (x < 10 && y < 10) return '한자리+한자리';
    if (Math.min(x, y) < 10) return (x % 10) + (y % 10) >= 10 ? '두자리+한자리 받아올림' : '두자리+한자리';
    if (x + y >= 100) return '합이 세 자리';
    return (x % 10) + (y % 10) >= 10 ? '두자리+두자리 받아올림' : '두자리+두자리';
  }
  if (x < y) return '음수';
  if (y < 10) return x % 10 < y ? '두자리-한자리 받아내림' : '두자리-한자리';
  if (x % 10 === 0 && y % 10 !== 0) return '몇십-몇십몇';
  return x % 10 < y % 10 ? '두자리-두자리 받아내림' : '두자리-두자리';
};

// 1학년에서 배운 꼴은 언제나 씁니다. 차시마다 새 꼴이 하나씩 더해집니다.
const 배운꼴 = new Map<number, string[]>();
const 쌓기 = ['한자리+한자리', '두자리+한자리', '두자리+두자리', '두자리-한자리', '두자리-두자리'];
[
  '두자리+한자리 받아올림',
  '두자리+두자리 받아올림',
  '합이 세 자리',
  '두자리-한자리 받아내림',
  '몇십-몇십몇',
  '두자리-두자리 받아내림',
].forEach((one, at) => {
  쌓기.push(one);
  배운꼴.set(at + 2, [...쌓기]);
});

describe('덧셈과 뺄셈 차시는 그 차시까지 배운 셈만 시킨다', () => {
  it('2~7차시 문항과 풀이에 나오는 식이 배운 꼴입니다', () => {
    const 나쁨: string[] = [];
    let 본수 = 0;
    const 차시들 = curriculum
      .flatMap((u) => u.lessons)
      .filter((l) => l.semester === '2-1' && l.unitTitle === '덧셈과 뺄셈' && l.lessonNo >= 2 && l.lessonNo <= 7);
    for (const lesson of 차시들) {
      const 허용 = 배운꼴.get(lesson.lessonNo)!;
      for (const d of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, d)) {
          const 글 = `${q.prompt} ${q.explanation.split('\n')[0]}`;
          for (const m of 글.matchAll(/(\d+)\s*([+-])\s*(\d+)(?:\s*([+-])\s*(\d+))?/g)) {
            본수 += 1;
            if (m[4]) {
              // 십의 자리에 올린 1을 더하는 6+1+1은 받아올림 풀이입니다.
              if (!(m[5] === '1' && 글.includes('올'))) 나쁨.push(`${q.id} 세 수의 계산(8차시): ${m[0]}`);
              continue;
            }
            const kind = 꼴(Number(m[1]), m[2], Number(m[3]));
            if (!허용.includes(kind)) 나쁨.push(`${q.id} ${kind}: ${m[0]} — ${q.prompt.slice(0, 40)}`);
          }
        }
      }
    }
    expect(본수).toBeGreaterThan(300);
    expect([...new Set(나쁨)].slice(0, 30)).toEqual([]);
  });
});
