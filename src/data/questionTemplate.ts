import type { ConceptTag, Difficulty, Lesson, Question } from '../types';

// ════════════════════════════════════════════════════════════════════
// 문항을 데이터로 쓰기
// ────────────────────────────────────────────────────────────────────
// 지금 문항은 questionFactory.ts 안에 코드로 들어 있습니다. 13,000줄이라
// 하나를 고치면 다른 곳이 어긋나는 일이 잦고, 선생님이 직접 손댈 수도
// 없습니다. 오늘 하루만 해도 문항을 고칠 때마다 차시 범위나 순서가
// 어긋나 테스트가 여덟 번 막았습니다.
//
// 여기서는 문항을 '무엇을 묻는가'만 적은 데이터로 두고, 수를 고르고
// 문장을 채우는 일은 해석기가 맡습니다. 해석기가 차시 선언(Lesson.scope)을
// 보고 수를 고르므로, 범위를 벗어나거나 안 배운 단을 쓰는 일이 구조적으로
// 생기지 않습니다.
// ════════════════════════════════════════════════════════════════════

// 변수를 만드는 방법입니다.
//   {from, to}  그 사이의 수에서 고릅니다.
//   {calc}      이미 정해진 변수로 계산합니다. 예: 'a + b'
export type VarSpec = { from: number; to: number } | { calc: string };

export type Template = {
  id: string;
  // 어느 차시에 쓰는지. 차시 제목과 맞춰 봅니다.
  when: RegExp;
  // 어느 단원에서 쓰는지. 비우면 제목만 맞으면 씁니다.
  units?: string[];
  // 이 문항이 요구하는 것. 난이도를 가르는 기준입니다.
  demand: 'recall' | 'connect' | 'reason';
  tag: ConceptTag;
  strategy: string;
  vars: Record<string, VarSpec>;
  // {a}, {a + b}처럼 중괄호 안에 변수나 계산을 씁니다.
  prompt: string;
  answer: string;
  wrongs: string[];
  solution: string;
};

// 아주 작은 계산기입니다. 변수와 정수, + - × 만 다룹니다.
// 문항 데이터에 임의의 코드가 들어가지 않도록 일부러 좁게 두었습니다.
const evaluate = (expression: string, values: Record<string, number>): number | null => {
  const tokens = expression.match(/[A-Za-z가-힣]+|\d+|[+\-*]/g);
  if (!tokens) return null;

  let total: number | null = null;
  let pending: '+' | '-' | '*' = '+';

  for (const token of tokens) {
    if (token === '+' || token === '-' || token === '*') {
      pending = token;
      continue;
    }

    const value = /^\d+$/.test(token) ? Number(token) : values[token];
    if (value === undefined || !Number.isFinite(value)) return null;

    if (total === null) {
      total = value;
    } else if (pending === '+') {
      total += value;
    } else if (pending === '-') {
      total -= value;
    } else {
      total *= value;
    }
  }

  return total;
};

// 중괄호 안의 변수와 계산을 실제 수로 바꿉니다.
const fill = (text: string, values: Record<string, number>): string | null => {
  let failed = false;
  const filled = text.replace(/\{([^}]+)\}/g, (_, expression: string) => {
    const value = evaluate(expression.trim(), values);
    if (value === null) {
      failed = true;
      return '';
    }
    return String(value);
  });
  return failed ? null : filled;
};

// 늘 같은 수가 나오지 않도록, 차시와 자리로 씨앗을 만듭니다.
const seedOf = (lesson: Lesson, index: number, salt: number) => {
  let hash = 2166136261 ^ salt;
  const text = `${lesson.id}-${index}`;
  for (let at = 0; at < text.length; at += 1) {
    hash ^= text.charCodeAt(at);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

export const templateFits = (template: Template, lesson: Lesson) => {
  if (template.units && !template.units.includes(lesson.unitTitle)) return false;
  return template.when.test(lesson.title);
};

// 데이터로 적힌 문항을 실제 문항으로 만듭니다.
// 차시 범위를 넘는 수가 하나라도 나오면 만들지 않습니다 — 이것이
// 생성기마다 조심해야 했던 일을 한 곳으로 모아 주는 부분입니다.
export const buildFromTemplate = (
  template: Template,
  lesson: Lesson,
  difficulty: Difficulty,
  index: number,
  make: (
    lesson: Lesson,
    difficulty: Difficulty,
    index: number,
    prompt: string,
    answer: string | number,
    wrongs: Array<string | number>,
    solution: string,
    tag: ConceptTag,
    strategy: string,
  ) => Question,
): Question | null => {
  const values: Record<string, number> = {};

  let salt = 0;
  for (const [name, spec] of Object.entries(template.vars)) {
    salt += 1;
    if ('calc' in spec) {
      const value = evaluate(spec.calc, values);
      if (value === null) return null;
      values[name] = value;
    } else {
      const span = spec.to - spec.from + 1;
      if (span <= 0) return null;
      values[name] = spec.from + (seedOf(lesson, index, salt) % span);
    }
  }

  // 나온 수가 모두 이 차시가 다루는 범위 안이어야 합니다.
  const limit = lesson.scope.maxNumber;
  if (Object.values(values).some((value) => value > limit || value < 0)) return null;

  const prompt = fill(template.prompt, values);
  const answer = fill(template.answer, values);
  const solution = fill(template.solution, values);
  if (prompt === null || answer === null || solution === null) return null;

  const wrongs: string[] = [];
  for (const one of template.wrongs) {
    const filled = fill(one, values);
    // 답과 같아진 보기는 버립니다. 남은 자리는 문항을 만드는 쪽에서 채웁니다.
    if (filled !== null && filled !== answer && !wrongs.includes(filled)) wrongs.push(filled);
  }
  if (wrongs.length === 0) return null;

  return make(lesson, difficulty, index, prompt, answer, wrongs, solution, template.tag, template.strategy);
};
