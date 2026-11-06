import { expect, it } from 'vitest';
import { lessons12 } from '../curriculum12';
import { generateQuestions } from '../questionFactory';
import { 사고단계 } from './levelPick';
it('단순 수 읽기를 표현만 보고 고차 사고로 분류하지 않습니다', () => {
  expect(사고단계({prompt:'10을 바르게 읽은 것은 어느 것일까요?',strategy:'10 읽기'})).toBe(0);
  expect(사고단계({prompt:'친구가 10을 일영이라고 읽었습니다. 잘못 읽은 까닭은 무엇일까요?',strategy:'잘못 읽기'})).toBe(2);
});
it('1학년 정각 차시는 반 시각을 앞서 내지 않고 시계 차시는 정각·30분만 다룹니다', () => {
  for(const lesson of lessons12.filter(l=>l.unitNo===3&&[5,6].includes(l.lessonNo))) for(const level of ['하','중','상'] as const) for(const round of [0,1,2]) {
    const qs=generateQuestions(lesson,level,{판:round});
    if(!round) expect(qs.length).toBeGreaterThan(0);
    for(const q of qs) {
      const text=[q.prompt,...q.choices,q.explanation,q.support.studentHint,q.support.coreConcept,q.support.readStrategy].join(' ');
      expect(text,q.prompt).not.toMatch(/\d+\s*[×÷]\s*\d+|숫자 한 칸에 5분|작은 눈금 한 칸에 1분/);
      expect([...text.matchAll(/(\d+)\s*분(?!의)/g)].every(m=>[0,30].includes(+m[1])),q.prompt).toBe(true);
      if(lesson.lessonNo===5) expect(text,q.prompt).not.toMatch(/30\s*분|삼십\s*분/);
    }
  }
});
