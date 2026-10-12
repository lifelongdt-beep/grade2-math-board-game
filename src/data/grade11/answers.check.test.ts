import { describe, expect, it } from 'vitest';
import { lessons11 } from '../curriculum11';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 1-1 문항을 처음부터 다시 풉니다
// ────────────────────────────────────────────────────────────────────
// 생성기의 계산을 가져오지 않고, 화면에 나갈 문제 글과 그림을 다시 읽어
// 여기 적은 셈으로 풀어 답과 맞춰 봅니다. 1학년은 처음 수를 배우는
// 학년이라, 여기서 틀린 것을 배우면 뒤의 모든 학년이 흔들립니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];

const 모두: Array<{ unitNo: number; lessonNo: number; level: Difficulty; q: Question }> = [];
for (const lesson of lessons11) {
  for (const level of levels) {
    for (const q of generateQuestions(lesson, level)) 모두.push({ unitNo: lesson.unitNo, lessonNo: lesson.lessonNo, level, q });
  }
}
const 단원 = (unitNo: number, lessonNo?: number) =>
  모두.filter((x) => x.unitNo === unitNo && (lessonNo === undefined || x.lessonNo === lessonNo));

const 수 = (text: string) => Number(text.replace(/[^\d]/g, ''));

describe('1-1 모든 문항', () => {
  it('차시·수준마다 문항이 있습니다', () => {
    for (const lesson of lessons11) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('보기가 넷이고 서로 다르며 답이 하나 들어 있습니다', () => {
    for (const { q } of 모두) {
      expect(q.choices.length, q.prompt).toBe(4);
      expect(new Set(q.choices).size, q.prompt).toBe(4);
      expect(q.choices.filter((c) => c === q.answer).length, q.prompt).toBe(1);
    }
  });

  it('조사가 괄호 꼴로 남거나 받침과 어긋나지 않습니다', () => {
    for (const { q } of 모두) {
      const text = [q.prompt, q.answer, ...q.choices, ...q.support.steps, q.support.studentHint].join(' ');
      expect(text, q.prompt).not.toMatch(/을\(를\)|은\(는\)|이\(가\)|과\(와\)|\(으\)로/);
      // 받침 있는 수(0,1,3,6,7,8)에 '를/는/가/와', 없는 수(2,4,5,9)에 '을/은/이/과'
      expect(text, q.prompt).not.toMatch(/[013678](를|는|가|와)\s/);
      expect(text, q.prompt).not.toMatch(/[2459](을|은|이|과)\s/);
    }
  });

  it('물어본 세는 말로 답합니다', () => {
    for (const { q } of 모두) {
      const m = /몇 (개|마리|송이|대)/.exec(q.prompt);
      if (!m) continue;
      if (/묶음 몇 개와 낱개 몇 개|식은 어느/.test(q.prompt)) continue;
      expect(q.answer.endsWith(m[1]) || q.answer.includes(`${m[1]},`), q.prompt).toBe(true);
    }
  });

  it('비교하기 단원에는 수와 단위가 나오지 않습니다', () => {
    for (const { q } of 단원(4)) {
      expect(`${q.prompt} ${q.choices.join(' ')}`, q.prompt).not.toMatch(/\d|cm|kg|L/);
    }
  });

  it('여러 가지 모양 단원은 수학 용어를 쓰지 않습니다', () => {
    for (const { q } of 단원(2)) {
      const text = [q.prompt, ...q.choices, ...q.support.steps].join(' ');
      expect(text, q.prompt).not.toMatch(/직육면체|원기둥|구 모양|정육면체/);
    }
  });
});

describe('1-1 1단원 9까지의 수', () => {
  it('그림의 물건 수가 답과 같습니다', () => {
    for (const { q } of 단원(1)) {
      if (!/^(그림에서 )?\S+ 몇 (개|마리|송이|대)일까요\?$/.test(q.prompt)) continue;
      if (q.visual?.kind !== 'counters') continue;
      const name = /^(?:그림에서 )?(\S+?)(은|는) 몇/.exec(q.prompt)?.[1];
      const group = q.visual.groups.find((g) => !g.name || g.name === name) ?? q.visual.groups[0];
      expect(수(q.answer), q.prompt).toBe(group.count);
    }
  });

  it('몇째는 그림의 표시와 맞습니다', () => {
    const 째 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];
    for (const { q } of 단원(1, 4)) {
      const m = /색칠한 \S+ (왼쪽|오른쪽)에서 몇째/.exec(q.prompt);
      if (!m || q.visual?.kind !== 'counters' || !q.visual.line) continue;
      const total = q.visual.groups[0].count;
      const k = q.visual.line.marks[0];
      const want = m[1] === '왼쪽' ? k + 1 : total - k;
      expect(q.answer, q.prompt).toBe(째[want - 1]);
    }
  });

  it('1만큼 더 큰 수·작은 수와 크기 비교가 맞습니다', () => {
    for (const { q } of 단원(1)) {
      let m = /^(\d)보다 1만큼 더 (큰|작은) 수는/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(Number(m[1]) + (m[2] === '큰' ? 1 : -1));
      m = /^어떤 수보다 1만큼 더 (큰|작은) 수는 (\d)입니다/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(Number(m[2]) + (m[1] === '큰' ? -1 : 1));
      m = /^(\d)보다 (큰|작은) 수는 어느/.exec(q.prompt);
      if (m) {
        const n = Number(m[1]);
        const 맞는 = q.choices.filter((c) => (m![2] === '큰' ? Number(c) > n : Number(c) < n));
        expect(맞는, q.prompt).toEqual([q.answer]);
      }
      const many = /^([\d, ]+) 가운데 가장 (큰|작은) 수는/.exec(q.prompt);
      if (many) {
        const nums = many[1].split(',').map((x) => Number(x.trim()));
        expect(수(q.answer), q.prompt).toBe(many[2] === '큰' ? Math.max(...nums) : Math.min(...nums));
      }
    }
  });
});

describe('1-1 3단원 덧셈과 뺄셈', () => {
  const 식 = /(\d+)\s*([+-])\s*(\d+)/;
  it('모든 수가 9 이하입니다(한 자리 수의 범위)', () => {
    for (const { q } of 단원(3)) {
      for (const n of (q.prompt.match(/\d+/g) ?? []).map(Number)) expect(n, q.prompt).toBeLessThanOrEqual(9);
      for (const n of (q.answer.match(/\d+/g) ?? []).map(Number)) expect(n, q.prompt).toBeLessThanOrEqual(9);
    }
  });

  it('계산 문항의 답이 맞습니다', () => {
    for (const { q } of 단원(3)) {
      const m = new RegExp(`^${식.source}(은|는) 얼마`).exec(q.prompt);
      if (!m) continue;
      const v = m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
      expect(수(q.answer), q.prompt).toBe(v);
    }
  });

  it('모으기·가르기의 답이 맞습니다', () => {
    for (const { q } of 단원(3)) {
      let m = /^(\d)(과|와) (\d)(을|를) 모으면/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(Number(m[1]) + Number(m[3]));
      m = /^(\d)(은|는) (\d)(과|와) 몇으로 가를/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(Number(m[1]) - Number(m[3]));
    }
  });

  it('식 보기 문항은 답만 조건을 만족합니다', () => {
    const 값 = (t: string) => {
      const m = /^(\d+)([+-])(\d+)$/.exec(t);
      return m ? (m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3])) : NaN;
    };
    for (const { q } of 단원(3)) {
      const target = /^계산한 값이 (\d)인 식은/.exec(q.prompt);
      if (target) expect(q.choices.filter((c) => 값(c) === Number(target[1])), q.prompt).toEqual([q.answer]);
      if (/^계산한 값이 가장 큰 식은/.test(q.prompt)) {
        const best = Math.max(...q.choices.map(값));
        expect(q.choices.filter((c) => 값(c) === best), q.prompt).toEqual([q.answer]);
      }
      const same = /^(\d)\+(\d)(과|와) 합이 같은 식은/.exec(q.prompt);
      if (same) {
        const sum = Number(same[1]) + Number(same[2]);
        expect(q.choices.filter((c) => 값(c) === sum), q.prompt).toEqual([q.answer]);
      }
    }
  });

  it('그림 덧셈식·뺄셈식 보기에서 그림과 맞는 식은 답 하나입니다', () => {
    for (const { q } of 단원(3)) {
      if (q.prompt !== '그림에 알맞은 덧셈식은 어느 것일까요?' && q.prompt !== '그림에 알맞은 뺄셈식은 어느 것일까요?') continue;
      if (q.visual?.kind !== 'counters') continue;
      const g = q.visual.groups;
      const want = q.prompt.includes('덧셈')
        ? `${g[0].count}+${g[1].count}=${g[0].count + g[1].count}`
        : `${g[0].count}-${g[0].crossed}=${g[0].count - (g[0].crossed ?? 0)}`;
      expect(q.answer, q.prompt).toBe(want);
    }
  });
});

describe('1-1 4단원 비교하기', () => {
  it('그림으로 고르는 답이 그림의 크기와 맞습니다', () => {
    for (const { q } of 단원(4)) {
      if (q.visual?.kind !== 'compare') continue;
      const sizes = q.visual.items.map((x) => x.size);
      // '담긴 것'에도 '긴 것'이 들어 있으므로 '더 긴', '가장 긴'으로 찾습니다.
      const big = /(더|가장) 긴 것|무거운|넓은|많이/.test(q.prompt);
      const want = big ? Math.max(...sizes) : Math.min(...sizes);
      const item = q.visual.items.find((x) => x.name === q.answer);
      expect(item?.size, q.prompt).toBe(want);
      expect(sizes.filter((v) => v === want).length, q.prompt).toBe(1);
    }
  });

  it('시소 셋은 가운데 것이 가운데 무게라 답을 정할 수 있습니다', () => {
    for (const { q } of 단원(4)) {
      if (q.visual?.kind !== 'compare' || q.visual.mode !== 'weight' || q.visual.items.length < 3) continue;
      const [a, b, c] = q.visual.items.map((x) => x.size);
      expect((a < b && b < c) || (a > b && b > c), q.prompt).toBe(true);
    }
  });
});

describe('1-1 5단원 50까지의 수', () => {
  it('모든 수가 50 이하입니다', () => {
    for (const { q } of 단원(5)) {
      for (const n of (q.prompt.match(/\d+/g) ?? []).map(Number)) expect(n, q.prompt).toBeLessThanOrEqual(50);
    }
  });

  it('묶음 그림과 답이 맞습니다', () => {
    for (const { q } of 단원(5)) {
      if (q.prompt === '그림이 나타내는 수는 얼마일까요?' && q.visual?.kind === 'tens-ones') {
        expect(수(q.answer), q.prompt).toBe(q.visual.tens * 10 + q.visual.ones);
      }
      const m = /^10개씩 묶음 (\d)개와 낱개 (\d)개인 수는/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(Number(m[1]) * 10 + Number(m[2]));
    }
  });

  it('모으기·가르기는 19 이하이고 답이 맞습니다', () => {
    for (const { q } of 단원(5)) {
      let m = /^(\d+)(과|와) (\d+)(을|를) 모으면/.exec(q.prompt);
      if (m) {
        expect(Number(m[1]) <= 9 && Number(m[3]) <= 9, q.prompt).toBe(true);
        expect(수(q.answer), q.prompt).toBe(Number(m[1]) + Number(m[3]));
        expect(수(q.answer), q.prompt).toBeLessThanOrEqual(19);
      }
      m = /^(\d+)(은|는) (\d+)(과|와) 몇으로 가를/.exec(q.prompt);
      if (m) expect(수(q.answer), q.prompt).toBe(Number(m[1]) - Number(m[3]));
    }
  });

  it('크기 비교의 답이 맞습니다', () => {
    for (const { q } of 단원(5)) {
      const two = /^(\d+)(과|와) (\d+) 가운데 더 (큰|작은) 수는/.exec(q.prompt);
      if (two) {
        const a = Number(two[1]);
        const b = Number(two[3]);
        expect(수(q.answer), q.prompt).toBe(two[4] === '큰' ? Math.max(a, b) : Math.min(a, b));
      }
      const many = /^([\d, ]+) 가운데 가장 (큰|작은) 수는/.exec(q.prompt);
      if (many) {
        const nums = many[1].split(',').map((x) => Number(x.trim()));
        expect(수(q.answer), q.prompt).toBe(many[2] === '큰' ? Math.max(...nums) : Math.min(...nums));
      }
    }
  });
});

// ════════════════════════════════════════════════════════════════════
// 아직 배우지 않은 수와 어색한 장면이 나오지 않습니다
// ────────────────────────────────────────────────────────────────────
// 1단원(9까지의 수)과 3단원(9까지의 덧셈과 뺄셈)에서 '13개', '16개' 같은
// 보기가 나왔습니다. 아이는 13을 아직 배우지 않았습니다. 5단원 3차시
// (십몇)에서는 43과 45를 견주는 문항이 나왔습니다.
// 새를 친구에게 주거나 접시에 새·자동차를 놓는 장면도 있었습니다.
// ════════════════════════════════════════════════════════════════════
describe('1-1 수 범위와 장면', () => {
  it('1·3단원 문항과 보기에는 9보다 큰 수가 없습니다', () => {
    for (const { q, unitNo } of 모두) {
      if (unitNo !== 1 && unitNo !== 3) continue;
      for (const t of [q.prompt, ...q.choices]) {
        for (const m of t.matchAll(/\d+/g)) expect(Number(m[0]), `${q.prompt} / ${t}`).toBeLessThanOrEqual(9);
      }
    }
  });

  it('십몇 차시에는 19보다 큰 수가 나오지 않습니다', () => {
    for (const { q } of 단원(5, 3)) {
      for (const t of [q.prompt, ...q.choices]) {
        for (const m of t.matchAll(/\d+/g)) expect(Number(m[0]), `${q.prompt} / ${t}`).toBeLessThanOrEqual(19);
      }
    }
  });

  it('새·물고기·자동차를 어울리지 않는 곳에 두거나 주지 않습니다', () => {
    for (const { q } of 모두) {
      expect(q.prompt, q.prompt).not.toMatch(/접시에 (새|물고기|자동차|공|꽃|별)|새 \d마리 중에서 \d마리를 친구에게|(새|물고기) \d마리가 있었는데 \d마리를 더 받았습니다/);
    }
  });
});
