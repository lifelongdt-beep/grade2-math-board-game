import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

// 2-2 길이 재기 지도서 '유의 사항':
// "이 단원은 수와 연산 영역이 아닌 도형과 측정 영역이므로 길이의 합과 차의
//  지도 시 연산 방법이나 절차에 지나치게 초점이 맞추어지지 않도록 지도한다.
//  같은 까닭으로 길이의 합과 차 문제 또는 문제 상황을 구성할 때 받아올림이나
//  받아내림이 필요한 상황은 가급적 제시하지 않도록 한다."
// 각론 Q&A도 "이 단원에서는 받아올림과 받아내림이 없는 계산만을 다루고 있으므로"라고
// 적습니다. 교과서 예도 1 m 70 cm+1 m 20 cm, 6 m 80 cm-4 m 50 cm, 9 m 48 cm-1 m 3 cm처럼
// 어느 자리에서도 받아올림·받아내림이 없습니다.
const 차시들 = curriculum
  .flatMap((u) => u.lessons)
  .filter((l) => l.semester === '2-2' && /길이의 합|길이의 차/.test(l.title));

const 길이 = /(\d+)\s*m(?:\s*(\d+)\s*cm)?|(\d+)\s*cm/g;
const 잰값 = (text: string) => [...text.matchAll(길이)].map((m) =>
  m[1] !== undefined ? Number(m[1]) * 100 + Number(m[2] ?? 0) : Number(m[3]));

const 자리넘김 = (x: number, y: number, 더하기: boolean) => {
  const [큰, 작은] = 더하기 ? [x, y] : [Math.max(x, y), Math.min(x, y)];
  for (let p = 1; p <= 1000; p *= 10) {
    const a = Math.floor(큰 / p) % 10;
    const b = Math.floor(작은 / p) % 10;
    if (더하기 ? a + b >= 10 : a < b) return true;
  }
  return false;
};

describe('길이의 합과 차는 받아올림·받아내림 없이 냅니다', () => {
  it('두 길이를 더하거나 빼는 문항에 자리 넘김이 없습니다', () => {
    const 나쁨: string[] = [];
    let 본수 = 0;
    for (const lesson of 차시들) {
      for (const d of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, d)) {
          // ㄱ, ㄴ, ㄷ 설명에는 틀린 값도 들어 있으므로 상황 문장만 봅니다.
          const 상황 = q.prompt.split(/ ㄱ /)[0].replace(/'/g, ' ');
          const 더하기 = /이어|이었|이으|더하|더한|더 커|더 큰|\+|합/.test(상황);
          const 빼기 = /잘라|잘랐|썼|빼|차는|차를|더 길|-|남은|짧/.test(상황);
          if (더하기 === 빼기) continue;
          const 값 = 잰값(상황);
          if (값.length < 2) continue;
          본수 += 1;
          if (자리넘김(값[0], 값[1], 더하기)) 나쁨.push(`${q.id} [${q.strategy}] ${상황.slice(0, 70)}`);
        }
      }
    }
    expect(본수).toBeGreaterThan(60);
    expect([...new Set(나쁨)].slice(0, 300)).toEqual([]);
  });
});
