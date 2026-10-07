import { describe, expect, it } from 'vitest';
import { curriculum } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

// 보기가 넷이 안 될 때 '정답 보기 1'처럼 정답에 꼬리표만 붙인 보기를
// 채우던 일이 있었습니다. 아이에게는 정답이 둘인 문항입니다.
describe('보기를 꼬리표로 채우지 않는다', () => {
  it('어느 보기도 "… 보기 n"으로 끝나지 않습니다', () => {
    const 나쁨: string[] = [];
    for (const lesson of curriculum.flatMap((u) => u.lessons)) {
      for (const d of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, d)) {
          if (q.choices.some((one) => / 보기 \d+$/.test(String(one)))) {
            나쁨.push(`${q.id} [${q.strategy}] ${q.prompt.slice(0, 50)}`);
          }
        }
      }
    }
    expect([...new Set(나쁨)].slice(0, 20)).toEqual([]);
  }, 120000);
});

describe('문항 틀의 수 이름과 낱말 이름이 겹치지 않는다', () => {
  it('vars와 words에 같은 이름이 없습니다', async () => {
    // 같은 이름이면 낱말이 수 자리까지 채워 '병뚜껑 병뚜껑개'가 됩니다.
    const { questionBank } = await import('./questionBank');
    const 겹침 = questionBank
      .filter((t) => t.words && Object.keys(t.words).some((name) => name in t.vars))
      .map((t) => t.id);
    expect(겹침).toEqual([]);
  });
});

describe('2학년 곱셈은 곱셈구구 안에서 한다', () => {
  it('곱셈과 곱셈구구 단원의 곱셈식은 두 수 모두 9 이하입니다', () => {
    // 2학년은 9단까지 배웁니다. '5×6과 곱이 같은 곱셈식'의 답이 10×3이었습니다.
    const 나쁨: string[] = [];
    for (const lesson of curriculum.flatMap((u) => u.lessons)) {
      if (lesson.unitTitle !== '곱셈' && lesson.unitTitle !== '곱셈구구') continue;
      for (const d of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, d)) {
          const 글 = [q.prompt, ...q.choices.map(String), q.answer].join(' ');
          for (const m of 글.matchAll(/(\d+)\s*×\s*(\d+)/g)) {
            if (Number(m[1]) > 9 || Number(m[2]) > 9) 나쁨.push(`${q.id} ${m[0]} — ${q.prompt.slice(0, 40)}`);
          }
        }
      }
    }
    expect([...new Set(나쁨)].slice(0, 20)).toEqual([]);
  }, 120000);
});

describe('규칙 찾기 문항이 두 가지로 읽히지 않는다', () => {
  it('ㄱ~ㄹ에 같은 말이 두 번 나오지 않고, 빈칸 □를 모양 □와 섞어 쓰지 않습니다', () => {
    // '세 색이 한 마디로'와 '3색이 한 마디로'가 함께 나와 옳은 것이 셋이
    // 되었고, '△, □, ○, △, □, □'에서는 어느 □가 빈칸인지 알 수 없었습니다.
    const 나쁨: string[] = [];
    const 같게 = (text: string) => text.replace(/^3(?=색)/, '세 ').replace(/\s+/g, '');
    for (const lesson of curriculum.flatMap((u) => u.lessons)) {
      for (const d of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(lesson, d)) {
          const 말들 = [...q.prompt.matchAll(/[ㄱㄴㄷㄹ] ([^ㄱㄴㄷㄹ]+?\.)/g)].map((m) => 같게(m[1]));
          if (new Set(말들).size !== 말들.length) 나쁨.push(`${q.id} 같은 말 — ${q.prompt.slice(0, 60)}`);
          if (/□에 들어갈 모양/.test(q.prompt)) 나쁨.push(`${q.id} 빈칸 □ — ${q.prompt.slice(0, 60)}`);
          // 'n대가 지나가는 동안'은 버스 사이가 n번인지 n-1번인지 갈립니다.
          if (/대가 지나가는 동안/.test(q.prompt)) 나쁨.push(`${q.id} 사이 수 — ${q.prompt.slice(0, 60)}`);
        }
      }
    }
    expect([...new Set(나쁨)].slice(0, 20)).toEqual([]);
  }, 120000);
});
