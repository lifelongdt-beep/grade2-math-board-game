import { describe, expect, it } from 'vitest';
import type { Difficulty } from '../../types';
import { lessons11 } from '../curriculum11';
import { lessons12 } from '../curriculum12';
import { lessons31 } from '../curriculum31';
import { lessons32 } from '../curriculum32';
import { lessons41 } from '../curriculum41';
import { lessons42 } from '../curriculum42';
import { lessons51 } from '../curriculum51';
import { lessons5 } from '../curriculum5';
import { lessons61 } from '../curriculum61';
import { curriculum62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';

// 수 바로 뒤의 조사가 소리에 맞는지 모든 학년에서 봅니다.
// '6로 나눈 수', '3로 약분'처럼 5학년 문항에 실제로 있던 실수를 막습니다.
// 분수(3/5)는 분자로 읽으므로(오분의 삼) 따로 보지 않습니다.
const 모든차시 = [...lessons11, ...lessons12, ...lessons31, ...lessons32, ...lessons41, ...lessons42, ...lessons51, ...lessons5, ...lessons61, ...curriculum62.flatMap((u) => u.lessons)];
const 틀린꼴 = [
  /(?<![\d/.])[036]로\s/, // 3·6·0 뒤에는 '으로'
  /(?<![\d/.])\d*[1245789]으로\s/, // 1·2·4·5·7·8·9 뒤에는 '로'
  /(?<![\d/.])\d*[013678](를|는|가|와)\s/,
  /(?<![\d/.])\d*[2459](을|은|이|과)\s/,
  /[가-힣]\((은|는|을|를|이|가|과|와|으)\)/, // 괄호 꼴이 남음
  /(마름모|[^꼴]모)(과|이 있습니다)\s/,
  // 단위 뒤의 조사: 받침 없는 단위(회, 개 …)와 받침 있는 단위(쪽, 점 …)
  /\d(회|개|대|마리|그루|자루)(이 되|이었습|은 |을 )/,
  /\d(쪽|점|번|권|명|장|병|분|원)(가 되|였습|는 |를 )/,
];

describe('모든 학년 조사', () => {
  it('수 바로 뒤의 조사가 소리에 맞습니다', () => {
    const 틀림: string[] = [];
    for (const l of 모든차시) {
      for (const lv of ['하', '중', '상'] as Difficulty[]) {
        for (const q of generateQuestions(l, lv)) {
          for (const 글 of [q.prompt, ...q.choices]) {
            // 분수와 소수는 빼고 봅니다.
            const 맨글 = 글.replace(/\d+\/\d+/g, '분수').replace(/\d+\.\d+/g, (x) => x);
            if (틀린꼴.some((re) => re.test(맨글))) 틀림.push(`${l.id} ${lv}: ${글.slice(0, 80)}`);
          }
        }
      }
    }
    expect([...new Set(틀림)].slice(0, 15)).toEqual([]);
  });
});
