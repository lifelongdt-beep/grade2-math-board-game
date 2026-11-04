import { expect, it } from 'vitest';
import { lessons } from '../curriculum';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';
const lesson = lessons.find(l => l.semester === '2-2' && l.unitNo === 4 && l.lessonNo === 7)!;
const levels: Difficulty[] = ['하','중','상'];
// 문제 글을 읽어 독립적으로 풉니다. 생성기의 계산 함수나 씨앗은 사용하지 않습니다.
function solve(q: Question): string {
  const p = q.prompt;
  let m: RegExpMatchArray | null;
  if (p.includes('하루 생활표에는')) return '24시간';
  if ((m = p.match(/아침 (\d+)시/))) return `오전 ${m[1]}시`;
  if ((m = p.match(/저녁 (\d+)시/))) return `오후 ${m[1]}시`;
  if ((m = p.match(/새벽 (\d+)시/))) return `오전 ${m[1]}시`;
  if ((m = p.match(/낮 12시가 지난 뒤 (\d+)시/))) return `오후 ${m[1]}시`;
  if (p.includes('하루 계획에서')) return '12시간';
  if (p.includes('시계는 오전')) return '12시간';
  if (p.includes('외출했습니다. 걸린 시간을 구하는 과정') || p.includes('잘못된 ③')) {
    m = p.match(/오전 (\d+)시부터 같은 날 오후 (\d+)시/)!;
    return `${Number(m[2]) + 12 - Number(m[1])}시간`;
  }
  if ((m = p.match(/오늘 일정에는 오전 (\d+)시와 오후 (\d+)시/))) return `오후 ${m[2]}시`;
  if ((m = p.match(/오늘 오전 (\d+)시에 시계를 보았습니다/))) return `오후 ${m[1]}시`;
  if (p.includes('다음 날 오전') && p.includes('다시 책')) return '24시간';
  if (p.includes('오늘 일정은 등교')) return '운동과 잠자기';
  if ((m = p.match(/오전에 외출해 오후 (\d+)시에 돌아왔습니다. 외출한 시간은 (\d+)시간/))) return `오전 ${12 + Number(m[1]) - Number(m[2])}시`;
  if ((m = p.match(/잠을 (\d+)시간 자고, 학교에서 (\d+)시간/))) return `${24 - Number(m[1]) - Number(m[2])}시간`;
  if ((m = p.match(/오늘 오후 (\d+)시에 잠들어 다음 날 오전 (\d+)시/))) return `${24 + Number(m[2]) - (12 + Number(m[1]))}시간`;
  if (p.includes('두 사람의 시작과 끝')) {
    const times = [...p.matchAll(/(오전|오후) (\d+)시/g)].map(x => Number(x[2]) + (x[1] === '오후' ? 12 : 0));
    return `${(times[3] - times[2]) - (times[1] - times[0])}시간`;
  }
  if ((m = p.match(/오늘 오후 (\d+)시부터 12시간 뒤/))) return `다음 날 오전 ${m[1]}시`;
  throw new Error(`독립 검산기가 다루지 않은 문제: ${p}`);
}
it('수준별 30문항의 답·보기와 여러 판의 답을 문제 글만 읽어 검산합니다', () => {
  for (const level of levels) {
    const seen = new Set<string>();
    for (let round = 0; round < 20; round++) {
      const questions = generateQuestions(lesson, level, { 판: round });
      if (!round) expect(questions).toHaveLength(30);
      for (const q of questions) {
        expect(q.answer, q.prompt).toBe(solve(q));
        expect(q.choices).toHaveLength(4); expect(new Set(q.choices).size).toBe(4);
        expect(q.choices[q.answerIndex]).toBe(q.answer);
        expect(q.choices.filter(x => x === q.answer)).toHaveLength(1);
        expect(seen.has(q.prompt), q.prompt).toBe(false); seen.add(q.prompt);
      }
    }
  }
});
it('하의 계산 부담과 차시 밖의 시차·시계 오차·여러 날·분 계산을 제외합니다', () => {
  for (const level of levels) for (const round of [0,1,3,7]) for (const q of generateQuestions(lesson, level, { 판: round })) {
    expect([q.prompt, q.answer, ...q.choices, ...q.support.steps].join(' ')).not.toMatch(/파리|시차|빨라지는|인터넷 뱅킹|㉠|㉡|[2-9]일|\d+분|\d+×/);
    if (level === '하') expect(q.prompt).not.toMatch(/부터.*까지|남은 시간|더 오래|시간 뒤|잘못된|①/);
  }
  const banks = levels.map(l => generateQuestions(lesson,l));
  expect(banks[1].filter(q=>q.prompt.includes('①'))).toHaveLength(5);
  expect(banks[2].filter(q=>q.prompt.includes('①'))).toHaveLength(15);
  for (const a of [0,1,2]) for (const b of [0,1,2]) if (a !== b) expect(banks[a].some(q=>banks[b].some(r=>r.prompt===q.prompt))).toBe(false);
});
