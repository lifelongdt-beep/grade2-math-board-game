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

  it('수와 단위 뒤의 조사가 받침에 맞습니다', () => {
    // '6시을 나타냅니다', '5점가 됩니다', '9시간가 알맞습니다'처럼 단위의 받침과 조사가 어긋난 곳을 찾습니다.
    const 라틴: Record<string, boolean> = { cm: false, mm: false, km: false, m: false, g: true, kg: true, L: false, mL: false, 'cm²': false, 'm²': false, 'cm³': false, 'm³': false, '°': false, '%': false };
    // 한글 단위는 수에 붙여 쓴 것만 봅니다('25 초과'의 '초과'는 단위가 아닙니다).
    const 꼴 = /\d+(?:\.\d+)?(?:\s?(cm²|m²|cm³|m³|kg|km|cm|mm|mL|g|m|L|°|%)|(시간|시|분|초|일|개월|년|개|명|권|장|번|층|칸|원|점|쪽|살|배|송이|자루|마리|대|도|묶음|줄|조각|상자|봉지))(이|가|을|를|은|는|과|와)(?=[\s.,?!]|$)/g;
    const 받침 = (u: string) => (u in 라틴 ? 라틴[u] : (u.charCodeAt(u.length - 1) - 0xac00) % 28 !== 0);
    const 있어야 = new Set(['이', '을', '은', '과']);
    const 틀림: string[] = [];
    for (const { q, 열쇠 } of 문항들) {
      for (const 글 of [q.prompt, q.answer, ...q.choices, q.support.studentHint, ...q.support.steps]) {
        for (const m of 글.matchAll(꼴)) if (받침(m[1] ?? m[2]) !== 있어야.has(m[3])) 틀림.push(`${열쇠}: '${m[0]}' — ${글}`);
      }
    }
    expect([...new Set(틀림)].slice(0, 30)).toEqual([]);
  });

  it('문장제 힌트가 세워 준 식을 셈하면 답이 나옵니다', () => {
    // '곱셈식 12×4를 세워 계산하세요'처럼 힌트가 식을 세워 준 문항입니다. 식이 문장의 수를
    // 잘못 꺼냈다면 아이는 힌트를 따라가다 틀립니다.
    const 수값 = (t: string) => {
      const x = t.replace(/[()]/g, '').trim();
      const 대 = /^(\d+)[과와] (\d+)\/(\d+)$/.exec(x);
      if (대) return Number(대[1]) + Number(대[2]) / Number(대[3]);
      const 분 = /^(\d+)\/(\d+)$/.exec(x);
      return 분 ? Number(분[1]) / Number(분[2]) : Number(x);
    };
    const 답값 = (t: string) => {
      const 분 = /^(?:(\d+)[과와] )?(\d+)\/(\d+)/.exec(t.trim());
      if (분) return Number(분[1] ?? 0) + Number(분[2]) / Number(분[3]);
      const n = /^[\d.]+/.exec(t.trim());
      return n ? Number(n[0]) : NaN;
    };
    const 틀림: string[] = [];
    let 본 = 0;
    for (const { q, 열쇠 } of 문항들) {
      const m = /(?:곱셈식|나눗셈식) (\(?[\d./과와 ]+?\)?)([×÷])(\(?[\d./과와 ]+?\)?)(?:을|를|으로|로) /.exec(q.support.studentHint);
      if (!m || /몫과 나머지|남/.test(q.prompt)) continue;
      const 값 = m[2] === '×' ? 수값(m[1]) * 수값(m[3]) : 수값(m[1]) / 수값(m[3]);
      const 답 = 답값(q.answer);
      if (Number.isNaN(답)) continue;
      본 += 1;
      if (Math.abs(값 - 답) > 1e-6 * Math.max(1, 답)) 틀림.push(`${열쇠}: ${m[1]}${m[2]}${m[3]}=${값} 답 ${q.answer} — ${q.prompt}`);
    }
    expect(본).toBeGreaterThan(50);
    expect(틀림.slice(0, 20)).toEqual([]);
  });

  it('힌트와 풀이가 문제와 어긋나지 않습니다', () => {
    const 틀림: string[] = [];
    for (const { q, 열쇠 } of 문항들) {
      const h = q.support.studentHint;
      // 풀이 걸음은 아이에게 되묻지 않고 풀어 보입니다('…몇이 되나요?'가 걸음에 들어가면 안 됩니다).
      for (const s of q.support.steps) if (/[가-힣]\?(?!['"’”])/.test(s.replace(/'[^']*'|"[^"]*"|‘[^’]*’|“[^”]*”/g, ''))) 틀림.push(`${열쇠} 묻는 걸음: ${s}`);
      // '8×7과 8×7을 각각 구해'처럼 같은 식을 두 번 견주라고 하지 않습니다.
      if (/(\d+[×÷+-]\d+)[과와] \1[을를]/.test(h)) 틀림.push(`${열쇠} 같은 식 둘: ${h}`);
      // '몇 개 더 많을까요'에 '모두 더해 보세요'가 붙으면 아이는 반대로 셈합니다.
      if (/몇 개 더 (?:많|적|썼)/.test(q.prompt) && /모두 더해/.test(h)) 틀림.push(`${열쇠} 차를 묻는데 더하라는 힌트: ${q.prompt} / ${h}`);
      // '5가 5 이상이므로'를 '55가 5 이상이므로'로 숫자를 겹쳐 쓰지 않습니다.
      for (const s of q.support.steps) if (/(?<!\d)(\d)\1[이가] 5 (?:이상|미만)/.test(s)) 틀림.push(`${열쇠} 숫자 겹침: ${s}`);
      // 평균 힌트가 세운 식의 수는 모두 문제에 늘어놓은 자료여야 합니다.
      const 평균 = /자료 (\d+)개를 모두 더한 뒤 \d+(?:으로|로) 나누어요: \(([\d+]+)\)/.exec(h);
      if (평균 && 평균[2].split('+').some((x) => !new RegExp(`(?<!\\d)${x}(?!\\d)`).test(q.prompt.replace(/평균은 \d+/g, '')))) 틀림.push(`${열쇠} 평균 식: ${h}`);
    }
    expect([...new Set(틀림)].slice(0, 30)).toEqual([]);
  });

  it('풀이 걸음이 비어 있지 않습니다', () => {
    const 빈 = 문항들.filter(({ q }) => !q.support.steps.length || q.support.steps.some((s) => !s.trim())).map(({ q, 열쇠 }) => `${열쇠}: ${q.prompt}`);
    expect(빈.slice(0, 20)).toEqual([]);
  });
});
