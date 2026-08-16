import type { ConceptTag, Difficulty, Lesson, Question, QuestionVisual } from '../types';

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

// ── 그림 ────────────────────────────────────────────────────────────
// 수를 적는 자리(rows, value, hour …)에는 vars의 calc와 같은 식을 씁니다
// — 중괄호 없이 'per * groups'처럼. 글을 적는 자리(label, object …)에는
// 문장과 같이 중괄호를 씁니다.
//
// 차시가 아직 배우지 않은 도구는 그리지 않습니다(Lesson.scope.forbidVisuals).
// 1cm를 배우기 전 차시에 자가 나오던 일이 여기서 막힙니다. 그림만 빠지고
// 문항은 그대로 나갑니다.
export type VisualSpec =
  | { kind: 'array'; rows: string; columns: string; label?: string }
  | { kind: 'place-value'; value: string; places?: number; label?: string }
  | { kind: 'number-line'; values: string[]; step: string; active?: number; label?: string }
  | { kind: 'clock'; hour: string; minute: string; endHour?: string; endMinute?: string; label?: string }
  | { kind: 'unit-measure'; object: string; unit: string; count: string }
  | { kind: 'ruler'; start: string; end: string; label?: string }
  | { kind: 'bar-model'; bars: Array<{ label: string; value: string }>; label?: string }
  | {
      kind: 'table';
      columns: Array<{ name: string; value: string }>;
      categoryLabel?: string;
      valueLabel?: string;
      label?: string;
    }
  | { kind: 'pictograph'; items: Array<{ label: string; count: string }>; unit?: number; label?: string };

// 식을 모두 수로 바꾼 그림입니다. 실제 그림은 questionFactory가 그립니다 —
// 눈금 여백이나 수직선 시작점 같은 규칙이 이미 그쪽에 있고, 그것을 여기에
// 옮겨 적으면 두 벌이 되어 서로 어긋납니다.
export type DrawnVisual =
  | { kind: 'array'; rows: number; columns: number; label?: string }
  | { kind: 'place-value'; value: number; places?: number; label?: string }
  | { kind: 'number-line'; values: number[]; step: number; active?: number; label?: string }
  | { kind: 'clock'; hour: number; minute: number; endHour?: number; endMinute?: number; label?: string }
  | { kind: 'unit-measure'; object: string; unit: string; count: number }
  | { kind: 'ruler'; start: number; end: number; label?: string }
  | { kind: 'bar-model'; bars: Array<{ label: string; value: number }>; label?: string }
  | {
      kind: 'table';
      columns: Array<{ name: string; value: number }>;
      categoryLabel: string;
      valueLabel: string;
      label?: string;
    }
  | { kind: 'pictograph'; items: Array<{ label: string; count: number }>; unit?: number; label?: string };

export type Claim = { text: string; ok: boolean };

export type Template = {
  id: string;
  // 어느 차시에 쓰는지. 차시 제목과 맞춰 봅니다.
  when: RegExp;
  // 어느 단원에서 쓰는지. 비우면 제목만 맞으면 씁니다.
  units?: string[];
  // 어느 학기에서 쓰는지. '자로 길이를 재어 볼까요'처럼 두 학기에 같은
  // 제목이 있고 다루는 내용이 다를 때 씁니다.
  semester?: '2-1' | '2-2';
  // 이 문항이 요구하는 것. 난이도를 가르는 기준입니다.
  demand: 'recall' | 'connect' | 'reason';
  tag: ConceptTag;
  // 문장과 마찬가지로 중괄호를 쓸 수 있습니다. 한 템플릿이 여러 차시에
  // 걸칠 때 필요합니다 — 2단부터 9단까지 한 템플릿으로 쓰면서 이름이
  // 모두 같으면, 교사용 분석에서 일곱 차시가 한 가지 문항으로 보입니다.
  strategy: string;
  vars: Record<string, VarSpec>;
  // 문장에 쓸 낱말입니다. 자리마다 하나를 골라 씁니다.
  // 문장에서는 {item}으로 쓰고, 조사가 필요하면 {item:이}처럼 적으면
  // 받침을 보고 이/가, 은/는, 을/를을 골라 줍니다.
  words?: Record<string, string[]>;
  // {a}, {a + b}처럼 중괄호 안에 변수나 계산을 씁니다.
  prompt: string;
  // ㄱ·ㄴ·ㄷ·ㄹ 문항은 보기가 문장의 짝으로 정해지므로 적지 않습니다.
  answer?: string;
  wrongs?: string[];
  solution?: string;

  // ── 여기서부터는 필요할 때만 씁니다 ──────────────────────────────

  // 그림입니다.
  visual?: VisualSpec;

  // 풀이 과정 문항입니다. prompt 뒤에 ① ② ③으로 이어 붙고, □가 들어간
  // 단계가 묻는 곳입니다. 남의 풀이를 따라가며 한 단계를 채우는 문항이라
  // 상 수준에서만 씁니다.
  //   prompt '{a}+{b:을} 계산하는 과정입니다. □에 알맞은 수는?'
  //   steps  ['일의 자리끼리 더하면 {aOnes}+{bOnes}=□', '10을 올립니다.']
  steps?: string[];

  // ㄱ·ㄴ·ㄷ·ㄹ 네 문장입니다. 옳은 것이 둘이어야 하고, '옳은 것을 모두
  // 고른 것은?' 형태의 문항이 됩니다. 이때 prompt는 문장 앞에 붙는
  // 상황 설명으로 쓰이고, answer·wrongs는 쓰이지 않습니다.
  claims?: Claim[];
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
  if (template.semester && template.semester !== lesson.semester) return false;
  return template.when.test(lesson.title);
};

// 문항을 실제로 만들어 내는 일은 questionFactory가 합니다. 보기를 섞고,
// 학습 도움말을 붙이고, 그림을 그리는 규칙이 모두 그쪽에 있습니다.
// 여기서는 무엇을 물을지만 정하고 그 일들을 넘깁니다.
export type TemplateTools = {
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
    visual?: QuestionVisual,
  ) => Question;
  // 그림을 그립니다. 차시가 못 쓰는 도구면 undefined를 돌려줍니다.
  draw?: (drawn: DrawnVisual, lesson: Lesson) => QuestionVisual | undefined;
  // ㄱ·ㄴ·ㄷ·ㄹ 문항을 만듭니다.
  pickAll?: (
    lesson: Lesson,
    difficulty: Difficulty,
    index: number,
    claims: Claim[],
    lead: string,
    tag: ConceptTag,
    strategy: string,
    visual?: QuestionVisual,
  ) => Question | null;
};

// 그림에 적힌 식을 수로 바꿉니다. 하나라도 풀리지 않으면 그림을 뺍니다.
const resolveVisual = (
  spec: VisualSpec,
  values: Record<string, number>,
  words: Record<string, string>,
): DrawnVisual | null => {
  const at = (expression: string) => evaluate(expression, values);
  const text = (one?: string) => (one === undefined ? undefined : fill(one, values, words) ?? undefined);

  if (spec.kind === 'array') {
    const rows = at(spec.rows);
    const columns = at(spec.columns);
    if (rows === null || columns === null || rows <= 0 || columns <= 0) return null;
    return { kind: 'array', rows, columns, label: text(spec.label) };
  }

  if (spec.kind === 'place-value') {
    const value = at(spec.value);
    if (value === null || value < 0) return null;
    return { kind: 'place-value', value, places: spec.places, label: text(spec.label) };
  }

  if (spec.kind === 'number-line') {
    const marks = spec.values.map(at);
    const step = at(spec.step);
    if (step === null || step <= 0 || marks.some((one) => one === null)) return null;
    return {
      kind: 'number-line',
      values: marks as number[],
      step,
      active: spec.active,
      label: text(spec.label),
    };
  }

  if (spec.kind === 'clock') {
    const hour = at(spec.hour);
    const minute = at(spec.minute);
    if (hour === null || minute === null) return null;
    const endHour = spec.endHour === undefined ? null : at(spec.endHour);
    const endMinute = spec.endMinute === undefined ? null : at(spec.endMinute);
    return {
      kind: 'clock',
      hour,
      minute,
      ...(endHour === null ? {} : { endHour }),
      ...(endMinute === null ? {} : { endMinute }),
      label: text(spec.label),
    };
  }

  if (spec.kind === 'unit-measure') {
    const count = at(spec.count);
    const object = text(spec.object);
    const unit = text(spec.unit);
    if (count === null || count <= 0 || !object || !unit) return null;
    return { kind: 'unit-measure', object, unit, count };
  }

  if (spec.kind === 'ruler') {
    const start = at(spec.start);
    const end = at(spec.end);
    if (start === null || end === null || end <= start) return null;
    return { kind: 'ruler', start, end, label: text(spec.label) };
  }

  if (spec.kind === 'bar-model') {
    const bars: Array<{ label: string; value: number }> = [];
    for (const bar of spec.bars) {
      const value = at(bar.value);
      const label = text(bar.label);
      if (value === null || value < 0 || !label) return null;
      bars.push({ label, value });
    }
    return { kind: 'bar-model', bars, label: text(spec.label) };
  }

  if (spec.kind === 'table') {
    const columns: Array<{ name: string; value: number }> = [];
    for (const column of spec.columns) {
      const value = at(column.value);
      const name = text(column.name);
      if (value === null || value < 0 || !name) return null;
      columns.push({ name, value });
    }
    return {
      kind: 'table',
      columns,
      categoryLabel: text(spec.categoryLabel) ?? '항목',
      valueLabel: text(spec.valueLabel) ?? '학생 수(명)',
      label: text(spec.label),
    };
  }

  const items: Array<{ label: string; count: number }> = [];
  for (const item of spec.items) {
    const count = at(item.count);
    const label = text(item.label);
    if (count === null || count < 0 || !label) return null;
    items.push({ label, count });
  }
  return { kind: 'pictograph', items, unit: spec.unit, label: text(spec.label) };
};

// 데이터로 적힌 문항을 실제 문항으로 만듭니다.
// 차시 범위를 넘는 수가 하나라도 나오면 만들지 않습니다 — 이것이
// 생성기마다 조심해야 했던 일을 한 곳으로 모아 주는 부분입니다.
export const buildFromTemplate = (
  template: Template,
  lesson: Lesson,
  difficulty: Difficulty,
  index: number,
  tools: TemplateTools,
): Question | null => {
  const { make, draw, pickAll } = tools;
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

  const lead = fill(template.prompt, values, words);
  if (lead === null) return null;

  const strategy = fill(template.strategy, values, words) ?? template.strategy;

  // 그림은 있으면 좋은 것이지 없으면 못 낼 것이 아닙니다. 그리지 못하면
  // 그림 없이 냅니다.
  const drawn = template.visual ? resolveVisual(template.visual, values, words) : null;
  const visual = drawn && draw ? draw(drawn, lesson) : undefined;

  // ㄱ·ㄴ·ㄷ·ㄹ 문항은 보기를 짝으로 만들어야 해서 만드는 길이 다릅니다.
  if (template.claims) {
    if (!pickAll) return null;
    const claims: Claim[] = [];
    for (const claim of template.claims) {
      const text = fill(claim.text, values, words);
      if (text === null) return null;
      claims.push({ text, ok: claim.ok });
    }
    return pickAll(lesson, difficulty, index, claims, lead, template.tag, strategy, visual);
  }

  // ㄱ·ㄴ·ㄷ·ㄹ이 아니면 답과 풀이가 있어야 문항이 됩니다.
  const answer = template.answer === undefined ? null : fill(template.answer, values, words);
  const solution = template.solution === undefined ? null : fill(template.solution, values, words);
  if (answer === null || solution === null) return null;

  // 풀이 과정 문항은 단계를 ① ② ③으로 이어 붙입니다.
  let prompt = lead;
  if (template.steps) {
    const marks = ['①', '②', '③', '④'];
    if (template.steps.length < 2 || template.steps.length > marks.length) return null;
    const parts: string[] = [];
    for (let at = 0; at < template.steps.length; at += 1) {
      const step = fill(template.steps[at], values, words);
      if (step === null) return null;
      parts.push(`${marks[at]} ${step}`);
    }
    // □가 어느 단계에도 없으면 무엇을 묻는지 알 수 없습니다.
    if (!parts.some((part) => part.includes('□'))) return null;
    prompt = `${lead} ${parts.join(' ')}`;
  }

  const wrongs: string[] = [];
  for (const one of template.wrongs ?? []) {
    const filled = fill(one, values, words);
    // 답과 같아진 보기는 버립니다. 남은 자리는 문항을 만드는 쪽에서 채웁니다.
    if (filled !== null && filled !== answer && !wrongs.includes(filled)) wrongs.push(filled);
  }
  if (wrongs.length === 0) return null;

  return make(
    lesson, difficulty, index,
    prompt, answer, wrongs, solution,
    template.tag, strategy, visual,
  );
};
