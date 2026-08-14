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
//   {dan: true} 이 차시가 다루는 단에서 고릅니다(Lesson.scope.dans).
//               2단 차시에서 7씩 묶는 문제가 나오지 않게 하는 것이 이
//               한 줄이 하는 일입니다. 곱하는 수를 직접 적으면 차시마다
//               다시 확인해야 하지만, 여기서는 차시 선언이 대신 정합니다.
export type VarSpec = { from: number; to: number } | { calc: string } | { dan: true };

// 수를 소리 내어 읽었을 때 받침이 있는지입니다.
//   0 영  1 일  3 삼  6 육  7 칠  8 팔 → 받침 있음
//   2 이  4 사  5 오  9 구             → 받침 없음
// 0으로 끝나면 십·백·천으로 읽으므로 모두 받침이 있습니다.
const numberHasFinal = [true, true, false, true, false, false, true, true, true, false];

const hasFinalSound = (word: string) => {
  const last = word[word.length - 1];
  if (/\d/.test(last)) return numberHasFinal[Number(last)];
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};

// 받침이 있으면 '이/은/을/과', 없으면 '가/는/를/와'입니다.
// 낱말뿐 아니라 수에도 붙습니다 — '31+33는', '9을'처럼 어긋나면 아이가
// 문제를 읽다가 걸립니다.
const withParticle = (word: string, kind: string) => {
  const hasFinal = hasFinalSound(word);
  if (kind === '이') return `${word}${hasFinal ? '이' : '가'}`;
  if (kind === '은') return `${word}${hasFinal ? '은' : '는'}`;
  if (kind === '을') return `${word}${hasFinal ? '을' : '를'}`;
  if (kind === '와') return `${word}${hasFinal ? '과' : '와'}`;
  return word;
};

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
  // 문장에 쓸 낱말입니다. 자리마다 하나를 골라 씁니다.
  // 문장에서는 {item}으로 쓰고, 조사가 필요하면 {item:이}처럼 적으면
  // 받침을 보고 이/가, 은/는, 을/를을 골라 줍니다.
  words?: Record<string, string[]>;
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

  // ×를 +와 −보다 먼저 계산합니다. 앞에서부터 차례로만 계산하면
  // 'hundreds * 100 + tens * 10 + ones'가 (백의 자리*100+십의 자리)*10+…이
  // 되어, 적은 대로가 아닌 다른 수가 나옵니다.
  let sum = 0;
  let sign = 1;
  let term: number | null = null;
  let multiplying = false;

  for (const token of tokens) {
    if (token === '*') {
      if (term === null) return null;
      multiplying = true;
      continue;
    }

    if (token === '+' || token === '-') {
      if (term === null) return null;
      sum += sign * term;
      term = null;
      multiplying = false;
      sign = token === '+' ? 1 : -1;
      continue;
    }

    const value = /^\d+$/.test(token) ? Number(token) : values[token];
    if (value === undefined || !Number.isFinite(value)) return null;

    if (term === null) {
      term = value;
    } else if (multiplying) {
      term *= value;
      multiplying = false;
    } else {
      // 연산자 없이 두 수가 붙어 있습니다.
      return null;
    }
  }

  if (term === null) return null;
  return sum + sign * term;
};

// 중괄호 안의 변수와 계산을 실제 수로 바꿉니다.
const fill = (
  text: string,
  values: Record<string, number>,
  words: Record<string, string> = {},
): string | null => {
  let failed = false;
  const filled = text.replace(/\{([^}]+)\}/g, (_, inside: string) => {
    const [name, particle] = inside.split(':').map((part) => part.trim());

    // 낱말이면 조사까지 붙여 돌려줍니다.
    if (words[name] !== undefined) {
      return particle ? withParticle(words[name], particle) : words[name];
    }

    const value = evaluate(name, values);
    if (value === null) {
      failed = true;
      return '';
    }
    return particle ? withParticle(String(value), particle) : String(value);
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
    } else if ('dan' in spec) {
      // 아직 배우지 않은 단은 고를 수 없습니다. 이 차시가 다루는 단이
      // 없으면 문항을 만들지 않습니다.
      const dans = lesson.scope.dans;
      if (!dans || dans.length === 0) return null;
      values[name] = dans[seedOf(lesson, index, salt) % dans.length];
    } else {
      const span = spec.to - spec.from + 1;
      if (span <= 0) return null;
      values[name] = spec.from + (seedOf(lesson, index, salt) % span);
    }
  }

  // 낱말도 자리마다 다르게 고릅니다.
  const words: Record<string, string> = {};
  for (const [name, list] of Object.entries(template.words ?? {})) {
    if (list.length === 0) return null;
    salt += 1;
    words[name] = list[seedOf(lesson, index, salt) % list.length];
  }

  // 나온 수가 모두 이 차시가 다루는 범위 안이어야 합니다.
  const limit = lesson.scope.maxNumber;
  if (Object.values(values).some((value) => value > limit || value < 0)) return null;

  const prompt = fill(template.prompt, values, words);
  const answer = fill(template.answer, values, words);
  const solution = fill(template.solution, values, words);
  if (prompt === null || answer === null || solution === null) return null;

  const wrongs: string[] = [];
  for (const one of template.wrongs) {
    const filled = fill(one, values, words);
    // 답과 같아진 보기는 버립니다. 남은 자리는 문항을 만드는 쪽에서 채웁니다.
    if (filled !== null && filled !== answer && !wrongs.includes(filled)) wrongs.push(filled);
  }
  if (wrongs.length === 0) return null;

  return make(lesson, difficulty, index, prompt, answer, wrongs, solution, template.tag, template.strategy);
};
