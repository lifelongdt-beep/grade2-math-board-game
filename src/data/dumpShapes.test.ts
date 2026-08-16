import { describe, it } from 'vitest';
import { lessons } from './curriculum';
import { generateQuestions } from './questionFactory';
import type { Difficulty } from '../types';

// 문제풀과 대조하려고 잠깐 두는 덤프입니다. 차시마다 어떤 '모양'의
// 문항이 나오는지 한 줄씩 찍습니다. 대조가 끝나면 지웁니다.
const levels: Difficulty[] = ['하', '중', '상'];

// 수를 지우면 남는 것이 문항의 틀입니다. 30문항이 예닐곱 줄로 줄어듭니다.
const shapeOf = (prompt: string) =>
  prompt
    .replace(/\d+/g, '#')
    .replace(/\s+/g, ' ')
    .replace(/(?:앞뒤 수의|수 모형을|그림을|무엇을 묻는지|수를 하나씩|한 묶음의|같은 수가|비슷한 보기|답을 넣어|말로 설명|계산이나|처음 조|실제 장면|아닌 까닭|곧은 선과|차근차|핵심 낱말|한 단계 더|그림이나 표의|생활 물건).*$/, '')
    .trim();

describe('dump', () => {
  it('prints the question shapes of every lesson', () => {
    const out: string[] = [];
    for (const lesson of lessons) {
      for (const level of levels) {
        const shapes = [...new Set(generateQuestions(lesson, level).map((q) => shapeOf(q.prompt)))];
        for (const shape of shapes) {
          out.push(`@@ ${lesson.id} ${lesson.unitTitle}/${lesson.lessonNo} ${level} | ${shape}`);
        }
      }
    }
    console.log(out.join('\n'));
  });
});
