import { describe, expect, it } from 'vitest';
import { lessons as lessons2 } from './curriculum';
import { lessons11 } from './curriculum11';
import { lessons12 } from './curriculum12';
import { lessons31 } from './curriculum31';
import { lessons32 } from './curriculum32';
import { lessons41 } from './curriculum41';
import { lessons42 } from './curriculum42';
import { lessons5 } from './curriculum5';
import { lessons51 } from './curriculum51';
import { lessons61 } from './curriculum61';
import { lessons62 } from './curriculum62';
import { generateClassQuestions } from './questionFactory';
import type { Difficulty, Question } from '../types';

// ════════════════════════════════════════════════════════════════════
// 풀이 걸음에 적힌 식이 맞는지
// ────────────────────────────────────────────────────────────────────
// 힌트의 '풀이 한 걸음씩'과 틀린 뒤의 '왜?'는 풀이 걸음을 그대로 보입니다.
// 걸음에 '60-40=20', '29+21=50'처럼 적힌 식은 아이가 따라 셈해 보는
// 곳이므로 하나라도 틀리면 안 됩니다. 걸음마다 식을 찾아 다시 셈합니다.
// 또 풀이 걸음이 비어 있는 문항이 없는지 봅니다.
// ════════════════════════════════════════════════════════════════════

const 모든차시 = [...lessons11, ...lessons12, ...lessons2, ...lessons31, ...lessons32, ...lessons41, ...lessons42, ...lessons51, ...lessons5, ...lessons61, ...lessons62];
const 수준들: Difficulty[] = ['하', '중', '상'];

const 문항들: Array<{ q: Question; 열쇠: string }> = [];
for (const l of 모든차시) for (const lv of 수준들) for (const q of generateClassQuestions(l, lv, { 판: 0 })) 문항들.push({ q, 열쇠: `${l.semester} ${l.unitNo}-${l.lessonNo} ${lv}` });

/** 앞에서부터 ×·÷를 먼저, 그다음 +·-를 셈합니다. */
const 셈 = (수: number[], 셈표: string[]) => {
  const a = [수[0]];
  const o: string[] = [];
  셈표.forEach((op, k) => {
    const b = 수[k + 1];
    if (op === '×') a[a.length - 1] *= b;
    else if (op === '÷') a[a.length - 1] /= b;
    else { a.push(b); o.push(op); }
  });
  return o.reduce((acc, op, k) => (op === '+' ? acc + a[k + 1] : acc - a[k + 1]), a[0]);
};

// 앞뒤에 분수(/), 괄호, 다른 수가 붙지 않은 'a op b (op c …) = d' 꼴만 봅니다.
const 식꼴 = /(?<![\d./(×÷+\-])(\d+(?:\.\d+)?(?:\s?[+\-×÷]\s?\d+(?:\.\d+)?)+)\s?=\s?(\d+(?:\.\d+)?)(?![\d/…]|\.\d|\s?[+\-×÷)]|\s?(?:…|\.\.\.|나머지))/g;

describe('풀이 걸음', () => {
  it('걸음에 적힌 식의 셈이 맞습니다', () => {
    const 틀림: string[] = [];
    for (const { q, 열쇠 } of 문항들) {
      for (const 걸음 of q.support.steps) {
        // 틀린 설명을 따옴표로 옮겨 적은 곳('8×3=11'은 틀린 설명입니다)은 셈하지 않습니다.
        const step = /틀린|틀립니다|잘못|아닙니다/.test(걸음) ? 걸음.replace(/'[^']*'|"[^"]*"/g, '') : 걸음;
        for (const m of step.matchAll(식꼴)) {
          const 왼 = m[1].replace(/\s/g, '');
          const 수 = 왼.split(/[+\-×÷]/).map(Number);
          const 셈표 = 왼.match(/[+\-×÷]/g) ?? [];
          const 값 = 셈(수, 셈표);
          if (Math.abs(값 - Number(m[2])) > 1e-6 * Math.max(1, Math.abs(값))) 틀림.push(`${열쇠}: '${m[0]}' (${값}) — ${q.prompt}`);
        }
      }
    }
    expect([...new Set(틀림)].slice(0, 40)).toEqual([]);
  });

  it("'가장 ~ 것'을 묻는 문항의 답이 보기 가운데 정말 가장 크거나 작습니다", () => {
    // 보기를 같은 단위의 수로 바꿉니다(3m 5cm → 305). 읽을 수 없는 보기가 하나라도 있으면 보지 않습니다.
    const 단위값: Record<string, number> = { km: 100000, m: 100, cm: 1, mm: 0.1, kg: 1000, g: 1, L: 1000, mL: 1, 시간: 60, 분: 1, 초: 1 / 60, 개: 1, 명: 1, 권: 1, 장: 1, 자루: 1, 마리: 1, 송이: 1, 원: 1, 일: 1, '': 1 };
    const 값 = (t: string): [number, string] | null => {
      const 조각 = [...t.replace(/\s+/g, ' ').trim().matchAll(/(\d+(?:\.\d+)?)\s?(km|mm|cm|m|kg|g|mL|L|시간|분|초|개|명|권|장|자루|마리|송이|원|일)?/g)];
      if (!조각.length || 조각.map((x) => x[0]).join(' ').replace(/\s/g, '') !== t.replace(/\s/g, '')) return null;
      const 갈래 = (u: string) => (['km', 'm', 'cm', 'mm'].includes(u) ? '길이' : ['kg', 'g'].includes(u) ? '무게' : ['L', 'mL'].includes(u) ? '들이' : ['시간', '분', '초'].includes(u) ? '시간' : u);
      return [조각.reduce((합, x) => 합 + Number(x[1]) * 단위값[x[2] ?? ''], 0), 갈래(조각[0][2] ?? '')];
    };
    const 틀림: string[] = [];
    for (const { q, 열쇠 } of 문항들) {
      const m = /가장 (긴|큰|무거운|많이 들어가는|많은|높은|짧은|작은|가벼운|적게 들어가는|적은|낮은) (?:것|수|길이|무게|들이)/.exec(q.prompt);
      // 문제 글에 수가 없고 보기만 견주는 문항(다음 길이 가운데 가장 긴 것)만 봅니다.
      if (!m || q.manipulate || q.visual || /\d|□/.test(q.prompt)) continue;
      const 보기 = q.choices.map(값);
      if (보기.some((x) => !x) || new Set(보기.map((x) => x![1])).size > 1) continue;
      const 수들 = 보기.map((x) => x![0]);
      const 큰쪽 = /긴|큰|무거운|많이|많은|높은/.test(m[1]);
      const 끝 = 큰쪽 ? Math.max(...수들) : Math.min(...수들);
      const 답값 = 값(q.answer)![0];
      if (Math.abs(답값 - 끝) > 1e-9 || 수들.filter((x) => Math.abs(x - 끝) < 1e-9).length > 1) 틀림.push(`${열쇠}: ${q.prompt} [${q.choices.join(', ')}] 답 ${q.answer}`);
    }
    expect(틀림).toEqual([]);
  });

  it('풀이 걸음이 비어 있지 않습니다', () => {
    const 빈 = 문항들.filter(({ q }) => !q.support.steps.length || q.support.steps.some((s) => !s.trim())).map(({ q, 열쇠 }) => `${열쇠}: ${q.prompt}`);
    expect(빈.slice(0, 20)).toEqual([]);
  });
});
