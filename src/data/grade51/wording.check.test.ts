import { describe, expect, it } from 'vitest';
import { lessons51 } from '../curriculum51';
import { lessons5 } from '../curriculum5';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 말글 검수 — 아이가 읽다가 걸리지 않게
// ────────────────────────────────────────────────────────────────────
// 5-2에도 같은 뜻의 시험이 있는데, 그쪽은 '소스에 이렇게 적으면 안
// 된다'를 봅니다. 그 방식으로는 적는 꼴이 조금만 달라도 빠져나갑니다.
// 실제로 5-1을 만들다가 같은 잘못을 네 가지 꼴로 저질렀고, 소스를 훑는
// 시험은 그 가운데 하나도 잡지 못했습니다.
//
//   `${a}${gwa(String(a))}`        → '16과'가 아니라 '1616과'
//   `${분수글(n,d)}${gwa(분수글(n,d))}` → '3/6과'가 아니라 '3/63/6과'
//
// 그래서 여기서는 소스가 아니라 '화면에 나가는 글'을 봅니다. 어떻게
// 적었든 결과가 '1616과'이면 잡힙니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];

const 아이가보는글 = (question: Question): Array<readonly [string, string]> => [
  ['문제', question.prompt],
  ...question.choices.map((one, at) => [`보기${at + 1}`, one] as const),
  ['핵심', question.support.studentConcept],
  ['볼 곳', question.support.studentHint],
  ...question.support.steps.map((one, at) => [`풀이${at + 1}`, one] as const),
  ['조심', question.support.misconceptionTip],
  ['확인', question.support.selfCheck],
];

const 모든글 = (): Array<{ where: string; text: string; prompt: string }> => {
  const out: Array<{ where: string; text: string; prompt: string }> = [];
  // 5-2도 함께 봅니다. 5-2에는 소스를 훑는 시험만 있어 '전체 11을'처럼
  // 화면에서만 드러나는 잘못이 빠져나갔습니다.
  for (const lesson of [...lessons51, ...lessons5]) {
    for (const level of levels) {
      for (const question of generateQuestions(lesson, level)) {
        for (const [어디, 글] of 아이가보는글(question)) {
          out.push({ where: `${lesson.id} ${level} ${어디}`, text: 글, prompt: 아이가보는글(question).map(([, one]) => one).join(' ') });
        }
      }
    }
  }
  return out;
};

// 수를 소리 내어 읽었을 때 받침이 있는지. 0 영, 1 일, 2 이, 3 삼,
// 4 사, 5 오, 6 육, 7 칠, 8 팔, 9 구.
const 수받침 = (digits: string) =>
  [true, true, false, true, false, false, true, true, true, false][Number(digits[digits.length - 1])];

// 분수는 '분모분의 분자'로 읽으므로 마지막에 나는 소리는 분자입니다.
const 분수받침 = (numerator: string) => 수받침(numerator);

describe('5-1 말글 검수', () => {
  const 글들 = 모든글();

  it('화면에 나가는 글이 한 조각도 없지 않다', () => {
    expect(글들.length).toBeGreaterThan(10000);
  });

  it('조사를 붙이려다 앞말을 다시 찍지 않는다', () => {
    // '16과'를 만들려다 '1616과'가 된 자리, '3/6과'가 '3/63/6과'가 된
    // 자리를 찾습니다. 조사 바로 앞에 같은 수(또는 같은 분수)가 두 번
    // 잇따라 적힌 꼴입니다.
    // 두 자리 위의 수가 통째로 되풀이된 것만 봅니다. '11을', '22를'은
    // 그냥 수이고, 잘못 적어 생기는 것은 '1616과', '100100을'처럼
    // 두 자리 위가 겹친 꼴입니다.
    // 되풀이된 것이 '수 전체'일 때만 잡습니다. 앞에 숫자가 더 붙어 있는
    // 자리에서 끊어 보면 10000의 가운데 '0000'이 걸려 멀쩡한 수가
    // 잡힙니다. ${X}${gwa(X)}로 생기는 잘못은 늘 수 전체가 겹칩니다.
    const 수두번 = /(?<!\d)(\d{2,})\1(?=[과와은는이가을를로])/;
    const 분수두번 = /(\d+\/\d+)\1/;
    const broken: string[] = [];
    for (const { where, text, prompt } of 글들) {
      const 겹친수 = text.match(수두번)?.[0];
      // 8072를 올림한 8080처럼 진짜 수는 한 문항 안에서 여러 번 나옵니다
      // (도움말과 풀이에 모두). 조사를 붙이다 겹친 수는 그 자리에만 생깁니다.
      const 진짜수 = 겹친수 !== undefined && prompt.split(겹친수).length - 1 >= 2;
      if ((겹친수 !== undefined && !진짜수) || 분수두번.test(text)) {
        broken.push(`${where}: ${text.slice(0, 80)}`);
      }
    }
    expect([...new Set(broken)].sort().slice(0, 20)).toEqual([]);
  });

  it('수와 분수 뒤의 조사가 소리에 맞는다', () => {
    const broken: string[] = [];
    // 분수 뒤의 조사입니다. '3/5과'(오분의 삼)가 맞고 '3/5와'는 틀립니다.
    const 분수조사 = /(\d+)\/(\d+)(과|와|은|는|이|가|을|를)(?![\w가-힣])/g;
    // 수 뒤의 조사입니다. 분수의 일부가 아닌 수만 봅니다.
    const 수조사 = /(?<![\d/])(\d+)(과|와|은|는|이|가|을|를)(?![\w가-힣])/g;

    for (const { where, text } of 글들) {
      for (const hit of text.matchAll(분수조사)) {
        const 받침 = 분수받침(hit[1]);
        const 맞는것: Record<string, string> = 받침
          ? { 과: '과', 와: '과', 은: '은', 는: '은', 이: '이', 가: '이', 을: '을', 를: '을' }
          : { 과: '와', 와: '와', 은: '는', 는: '는', 이: '가', 가: '가', 을: '를', 를: '를' };
        if (맞는것[hit[3]] !== hit[3]) {
          broken.push(`${where}: "${hit[0]}" — ${맞는것[hit[3]]}(으)로 적어야 함 · ${text.slice(0, 60)}`);
        }
      }
      for (const hit of text.matchAll(수조사)) {
        const 받침 = 수받침(hit[1]);
        const 맞는것: Record<string, string> = 받침
          ? { 과: '과', 와: '과', 은: '은', 는: '은', 이: '이', 가: '이', 을: '을', 를: '을' }
          : { 과: '와', 와: '와', 은: '는', 는: '는', 이: '가', 가: '가', 을: '를', 를: '를' };
        if (맞는것[hit[2]] !== hit[2]) {
          broken.push(`${where}: "${hit[0]}" — ${맞는것[hit[2]]}(으)로 적어야 함 · ${text.slice(0, 60)}`);
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 20)).toEqual([]);
  });

  it('조사 앞이 벌어지거나 공백이 겹치지 않는다', () => {
    const broken: string[] = [];
    for (const { where, text } of 글들) {
      if (/ {2,}/.test(text)) broken.push(`${where}: 공백이 겹침 · ${text.slice(0, 70)}`);
      // 수나 괄호 뒤에서 조사가 떨어져 나온 자리만 봅니다.
      // '이 곱셈식을'의 '이'는 조사가 아니라 '이것의 이'이므로,
      // 앞말을 보지 않고 조사만 찾으면 멀쩡한 문장이 잡힙니다.
      if (/[\d)\]] (을|를|은|는|이|가|과|와)(\s|$)/.test(text)) {
        broken.push(`${where}: 조사 앞이 벌어짐 · ${text.slice(0, 70)}`);
      }
      if (text !== text.trim()) broken.push(`${where}: 앞뒤에 공백 · "${text.slice(0, 40)}"`);
    }
    expect([...new Set(broken)].sort().slice(0, 20)).toEqual([]);
  });

  it('문제는 물음으로 끝난다', () => {
    const broken: string[] = [];
    for (const lesson of lessons51) {
      for (const level of levels) {
        for (const question of generateQuestions(lesson, level)) {
          // 물음표 뒤에 괄호로 조건을 덧붙이는 것은 교과서도 합니다.
          // ('공통분모는 가장 작은 수로 합니다.')
          const 끝 = question.prompt.trimEnd();
          if (!끝.endsWith('?') && !(끝.endsWith(')') && 끝.includes('?'))) {
            broken.push(`${lesson.id} ${level}: ${question.prompt.slice(0, 70)}`);
          }
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 20)).toEqual([]);
  });

  it('풀이와 도움말이 문장으로 끝난다', () => {
    // 마지막 글자가 '.', '?', ')'가 아니면 문장이 잘린 것입니다.
    // 식으로 끝나는 줄(=13, 12(cm²))은 그대로 둡니다.
    const broken: string[] = [];
    for (const { where, text } of 글들) {
      if (!where.includes('풀이') && !where.includes('조심') && !where.includes('볼 곳')) continue;
      if (!text.trim()) continue;
      if (/[.?)\]]$/.test(text.trim())) continue;
      if (/[\d²]$/.test(text.trim())) continue;
      // 늘어놓기는 '…'로 끝나고, 방법의 머리글은 '[방법 1] …'로 시작합니다.
      if (text.trim().endsWith('…')) continue;
      if (text.trim().startsWith('[')) continue;
      broken.push(`${where}: "${text.slice(-40)}"`);
    }
    expect([...new Set(broken)].sort().slice(0, 20)).toEqual([]);
  });
});

describe('조사를 붙이는 함수에 앞말을 다시 적지 않는다', () => {
  it("'1${eul('1')}'처럼 낱말을 적고 같은 낱말에 조사를 붙이지 않습니다", () => {
    // eul('1')은 이미 '1을'을 돌려줍니다. 앞에 1을 또 적으면 화면에는
    // '전체 11을'이 나갑니다. 한 자리 수는 화면 글만 보아서는 진짜 11과
    // 가려낼 수 없어, 소스에서 이 꼴을 찾습니다.
    const 꼴 = /([0-9A-Za-z가-힣]+)\$\{(?:eul|eun|i|iJosa|gwa)\('\1'\)\}/;
    const 나쁨: string[] = [];
    const 훑기 = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) 훑기(path);
        else if (/\.tsx?$/.test(name) && !name.includes('.test.')) {
          readFileSync(path, 'utf8').split('\n').forEach((line, at) => {
            if (꼴.test(line)) 나쁨.push(`${path}:${at + 1}`);
          });
        }
      }
    };
    훑기('src');
    expect(나쁨).toEqual([]);
  });
});

describe('대분수의 곱셈에 대해 틀린 말을 하지 않는다', () => {
  it('"대분수를 나누어 따로 곱하면 안 된다"고 하지 않습니다', () => {
    // (대분수)×(자연수)는 자연수 부분과 분수 부분에 각각 곱해 더하는 것이
    // 교과서가 보이는 바른 방법입니다(2와 2/7 × 3 = 2×3 + 2/7×3).
    // "나누어 곱하면 안 된다", "자연수 부분이 빠진다"는 그 방법을
    // 틀렸다고 가르칩니다.
    const 틀린말 = /나누어 따로 곱하면 안|곱하면 자연수 부분이 빠집니다/;
    const 나쁨 = 모든글()
      .filter(({ text }) => 틀린말.test(text))
      .map(({ where, text }) => `${where}: ${text.slice(0, 60)}`);
    expect([...new Set(나쁨)].slice(0, 5)).toEqual([]);
  });
});
