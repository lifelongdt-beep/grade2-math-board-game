import { expect, it } from 'vitest';
import { auditGrade3, auditGrade5 } from './auditRepairs';
import type { Difficulty } from '../../types';
const fraction = (s: string) => { const [n,d]=s.split('/').map(Number); return n/d; };
it('전 학년 점검으로 보충한 유형의 답을 문제의 수와 조건에서 독립적으로 검산합니다', () => {
  for(const table of [auditGrade3,auditGrade5]) for(const group of Object.values(table)) for(const [level,families] of Object.entries(group)) for(const family of families!) for(let seed=1;seed<=80;seed++) {
    const q=family.make(seed*7919,level as Difficulty)!;
    expect(q).toBeTruthy();
    const p=q.prompt;
    if(p.includes('조각들의 크기가 서로 다릅니다')) expect(q.answer).toBe('조각 수뿐 아니라 조각들의 크기도 같아야 합니다.');
    else if(p.startsWith('종이를 크기가 같은')) {
      const m=/같은 (\d+)조각.*그중 (\d+)조각/.exec(p)!;
      expect(q.answer).toMatch(new RegExp(`전체를 나눈 ${m[1]}[은는] 아래에, 색칠한 ${m[2]}[은는] 위에`));
    } else if(p.startsWith('종이의')) {
      const m=/종이의 (\d+)\/(\d+)/.exec(p)!;
      expect(q.answer).toBe(`전체를 똑같이 ${m[2]}조각으로 나누고 그중 ${m[1]}조각을 칠해야 합니다.`);
    } else if(p.includes('곱셈으로 확인할 수 있는')) {
      const m=/(\d+)×(\d+)=(\d+).* (\d+)÷(\d+)/.exec(p)!;
      expect(+m[1]*+m[2]).toBe(+m[3]); expect(+m[4]).toBe(+m[3]); expect(+q.answer).toBe(+m[4]/+m[5]);
    } else if(p.startsWith('크기가 같은 컵')) {
      const m=/물통은 (\d+)컵.*물통은 (\d+)컵/.exec(p)!;
      expect(+m[2]).toBeGreaterThan(+m[1]); expect(q.answer).toBe('나 물통');
    } else if(p.startsWith('길이가')) {
      const m=/길이가 (\d+) cm/.exec(p)!; expect(q.answer).toBe(`${m[1]} cm`);
    } else if(p.startsWith('주머니에')) {
      const m=/흰 공 (\d+)개와 검은 공 (\d+)개/.exec(p)!; expect(m[1]).toBe(m[2]); expect(q.answer).toBe('두 색이 나올 가능성은 같습니다.');
    } else if(p.startsWith('분모가 20인')) {
      const m=/(\d+\.\d+)보다 크고 (\d+\.\d+)보다 작은/.exec(p)!;
      expect([q.answer,...q.wrongs].filter(x=>fraction(x)>+m[1]&&fraction(x)<+m[2])).toEqual([q.answer]);
    } else if(p.startsWith('가:')) {
      const m=/가: (\d+\/\d+), 나: (\d+\.\d+), 다: (\d+\.\d+)/.exec(p)!;
      const sorted=[{name:'가',n:fraction(m[1])},{name:'나',n:+m[2]},{name:'다',n:+m[3]}].sort((a,b)=>a.n-b.n).map(x=>x.name).join(' → ');
      expect(q.answer).toBe(sorted);
    } else if(p.startsWith('친구는 자연수')) {
      const m=/자연수 (\d+).*진분수 (\d+)\/(\d+)/.exec(p)!;
      const fractions=[...q.answer.matchAll(/(\d+)\/(\d+)/g)];
      const last=fractions.at(-1)!; expect(+last[1]*+m[3]).toBe((+m[1]*+m[3]+ +m[2])*+last[2]);
    } else if(p.startsWith('친구는')) {
      const m=/친구는 (\d+\/\d+)과(?:\(와\))? (\d+\.\d+)/.exec(p)!;
      expect(fraction(m[1])).toBeGreaterThan(+m[2]);
      const equivalent=[...q.answer.matchAll(/\d+\/\d+/g)].map(x=>fraction(x[0])); expect(equivalent).toHaveLength(2); expect(equivalent[0]).toBe(equivalent[1]); expect(q.answer).toContain('분수가 더 큽니다.');
    } else throw new Error(`검산하지 않은 유형: ${p}`);
    expect(new Set([q.answer,...q.wrongs]).size).toBe(4);
  }
});
