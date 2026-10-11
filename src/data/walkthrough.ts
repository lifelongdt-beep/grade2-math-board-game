import type { Walkthrough } from '../types';
import { eul, resolveParticles } from './grade5/util';

// ════════════════════════════════════════════════════════════════════
// 세로셈 따라가기 — 자세히 보기에서 한 자리씩 보여 줄 장면
// ────────────────────────────────────────────────────────────────────
// 3학년 계산 문항은 그림이 없어서 '자세히 보기'가 열리지 않았습니다.
// 그런데 3학년 계산에서 아이가 막히는 곳은 늘 같은 자리입니다 —
// 받아올림한 1을 잊거나, 받아내린 자리에서 1을 빼지 않거나, 두 번째
// 줄을 한 칸 왼쪽에 쓰지 않거나, 나눗셈에서 다음 자리를 내리지 않습니다.
// 교과서가 세로셈을 손으로 쓰며 가르치는 그 차례를 한 장면씩 보여
// 주면, 아이는 자기가 어디서 어긋났는지 눈으로 찾습니다.
//
// 장면은 풀이(steps)와 같은 말을 씁니다. 같은 계산을 두 가지 말로
// 설명하면 아이는 둘이 다른 것인 줄 압니다.
// ════════════════════════════════════════════════════════════════════

const 자리말 = ['일의 자리', '십의 자리', '백의 자리', '천의 자리', '만의 자리'];
const 말 = (text: string) => resolveParticles(text);

/** 한 칸에 놓이는 글자입니다. col은 일의 자리가 0이고 왼쪽으로 갈수록 큽니다. */
export type WalkCell = {
  row: string;
  col: number;
  text: string;
  /** 받아올림·받아내림처럼 작게 적는 글자입니다. */
  small?: boolean;
  /** 받아내리고 지운 숫자입니다. */
  struck?: boolean;
};

export type WalkFrame = {
  cells: WalkCell[];
  /** 지금 계산하는 자리입니다. */
  focus: number | null;
  say: string;
  /** 이 장면에서 새로 나타난 칸(row:col)입니다. 움직임을 붙입니다. */
  fresh: string[];
};

export type WalkRow = { id: string; kind: 'small' | 'digit' | 'line' | 'label'; op?: string };

export type ColumnWalk = {
  type: 'column';
  cols: number;
  rows: WalkRow[];
  frames: WalkFrame[];
  /** 계산의 답입니다. 마지막 장면의 답 줄과 같아야 합니다(시험이 확인합니다). */
  result: number;
  /** 답을 고르기 전에 멈출 장면입니다. 없으면 마지막 자리 앞에서 멈춥니다. */
  stopAt?: number;
  /** 한 칸에 두 자리 수(분, 초)를 쓰는 넓은 칸입니다. */
  wide?: boolean;
};

/** 나눗셈의 장면입니다. 칸은 나누어지는 수의 자리를 따릅니다(왼쪽부터 0). */
export type DivFrame = {
  quotient: Array<string | null>;
  /** 몫 아래로 쓰는 줄입니다. 빼는 수 줄 다음에는 선을 긋습니다. */
  lines: Array<{ text: string; endCol: number; kind: 'sub' | 'rest' }>;
  focus: number | null;
  say: string;
  freshLine: number | null;
  freshQuotient: number | null;
};

export type DivWalk = {
  type: 'div';
  divisor: number;
  dividend: string;
  frames: DivFrame[];
  quotient: number;
  remainder: number;
};

const digitsOf = (n: number) => String(n).split('').reverse().map(Number);
const key = (c: WalkCell) => `${c.row}:${c.col}`;

/** 앞 장면의 칸에서 같은 자리를 새 글자로 바꿉니다. */
const put = (cells: WalkCell[], next: WalkCell): WalkCell[] => [...cells.filter((c) => key(c) !== key(next)), next];

const numberCells = (row: string, n: number): WalkCell[] => digitsOf(n).map((d, col) => ({ row, col, text: String(d) }));

// ── 덧셈 ────────────────────────────────────────────────────────────
const addWalk = (a: number, b: number): ColumnWalk => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const width = Math.max(da.length, db.length);
  const result = a + b;
  const cols = Math.max(width, String(result).length);
  const rows: WalkRow[] = [{ id: 'carry', kind: 'small' }, { id: 'a', kind: 'digit' }, { id: 'b', kind: 'digit', op: '+' }, { id: 'line', kind: 'line' }, { id: 'r', kind: 'digit' }];
  let cells: WalkCell[] = [...numberCells('a', a), ...numberCells('b', b)];
  const frames: WalkFrame[] = [{ cells, focus: null, say: '두 수를 자리에 맞추어 세로로 씁니다. 일의 자리부터 더합니다.', fresh: [] }];
  let carry = 0;
  for (let col = 0; col < width; col += 1) {
    const x = da[col] ?? 0;
    const y = db[col] ?? 0;
    const s = x + y + carry;
    const 식 = carry ? `${x}+${y}+1(받아올림)=${s}` : `${x}+${y}=${s}`;
    const fresh: string[] = [];
    const last = col === width - 1;
    let say: string;
    if (s >= 10 && last) {
      cells = put(cells, { row: 'r', col, text: String(s % 10) });
      cells = put(cells, { row: 'r', col: col + 1, text: '1' });
      fresh.push(`r:${col}`, `r:${col + 1}`);
      say = `${자리말[col]}: ${식}. ${eul(String(s % 10))} 쓰고 1을 ${자리말[col + 1]}에 씁니다.`;
    } else if (s >= 10) {
      cells = put(cells, { row: 'r', col, text: String(s % 10) });
      cells = put(cells, { row: 'carry', col: col + 1, text: '1', small: true });
      fresh.push(`r:${col}`, `carry:${col + 1}`);
      say = `${자리말[col]}: ${식}. ${eul(String(s % 10))} 쓰고 1을 ${자리말[col + 1]}로 받아올립니다.`;
    } else {
      cells = put(cells, { row: 'r', col, text: String(s) });
      fresh.push(`r:${col}`);
      say = `${자리말[col]}: ${식}. ${eul(String(s))} 씁니다.`;
    }
    carry = s >= 10 ? 1 : 0;
    frames.push({ cells, focus: col, say: 말(say), fresh });
  }
  frames.push({ cells, focus: null, say: `그러므로 ${a}+${b}=${result}입니다.`, fresh: [] });
  return { type: 'column', cols, rows, frames, result };
};

// ── 뺄셈 ────────────────────────────────────────────────────────────
// 받아내린 자리는 원래 숫자를 지우고 위에 작게 새 수를 씁니다(교과서와 같음).
const subWalk = (a: number, b: number): ColumnWalk => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const width = da.length;
  const result = a - b;
  const rows: WalkRow[] = [{ id: 'carry', kind: 'small' }, { id: 'a', kind: 'digit' }, { id: 'b', kind: 'digit', op: '−' }, { id: 'line', kind: 'line' }, { id: 'r', kind: 'digit' }];
  let cells: WalkCell[] = [...numberCells('a', a), ...numberCells('b', b)];
  const frames: WalkFrame[] = [{ cells, focus: null, say: '두 수를 자리에 맞추어 세로로 씁니다. 일의 자리부터 뺍니다.', fresh: [] }];
  const cur = [...da];
  // 0을 거쳐 받아내린 자리입니다. 10이 되었다가 아랫자리에 1을 내주고 9가 남습니다.
  const 거친자리 = new Set<number>();
  for (let col = 0; col < width; col += 1) {
    const y = db[col] ?? 0;
    const fresh: string[] = [];
    const 줄었나 = cur[col] < da[col];
    const 앞말 = 거친자리.has(col)
      ? `10에서 ${자리말[col - 1]}로 1을 받아내려 주고 남은 ${cur[col]}`
      : 줄었나 ? `${da[col]}에서 받아내려 준 1을 뺀 ${cur[col]}` : String(cur[col]);
    let say = `${자리말[col]}: `;
    if (cur[col] < y) {
      // 바로 윗자리가 0이면 그 위에서 먼저 받아내립니다.
      let from = col + 1;
      while (cur[from] === 0) from += 1;
      const 영거침 = from > col + 1;
      for (let k = from; k > col; k -= 1) {
        cur[k] -= 1;
        if (k < from) {
          cur[k] += 10;
          거친자리.add(k);
        }
        cells = put(cells, { row: 'a', col: k, text: String(da[k]), struck: true });
        cells = put(cells, { row: 'carry', col: k, text: String(cur[k]), small: true });
        fresh.push(`carry:${k}`);
      }
      cur[col] += 10;
      cells = put(cells, { row: 'a', col, text: String(da[col]), struck: true });
      cells = put(cells, { row: 'carry', col, text: String(cur[col]), small: true });
      fresh.push(`carry:${col}`);
      say += 영거침
        ? `${앞말}에서 ${y}을(를) 뺄 수 없는데 ${자리말[col + 1]} 숫자가 0입니다. ${자리말[from]}에서 1을 받아내려 ${자리말[col + 1]}를 10으로 만들고, 그중 1을 ${자리말[col]}로 받아내립니다. `
        : `${앞말}에서 ${y}을(를) 뺄 수 없으므로 ${자리말[col + 1]}에서 ${col === 0 ? '10을 ' : ''}받아내립니다. `;
    } else if (줄었나 || 거친자리.has(col)) {
      say += `${앞말}에서 뺍니다. `;
    }
    const d = cur[col] - y;
    const 맨앞영 = d === 0 && col === width - 1 && col > 0;
    say += `${cur[col]}-${y}=${d}.`;
    if (맨앞영) {
      say += ' 맨 앞의 0은 쓰지 않습니다.';
    } else {
      cells = put(cells, { row: 'r', col, text: String(d) });
      fresh.push(`r:${col}`);
    }
    frames.push({ cells, focus: col, say: 말(say), fresh });
  }
  frames.push({ cells, focus: null, say: `그러므로 ${a}-${b}=${result}입니다.`, fresh: [] });
  return { type: 'column', cols: width, rows, frames, result };
};

// ── 곱셈 ────────────────────────────────────────────────────────────
const mulOneWalk = (a: number, b: number): ColumnWalk => {
  const da = digitsOf(a);
  const result = a * b;
  const cols = Math.max(da.length, String(result).length);
  const rows: WalkRow[] = [{ id: 'carry', kind: 'small' }, { id: 'a', kind: 'digit' }, { id: 'b', kind: 'digit', op: '×' }, { id: 'line', kind: 'line' }, { id: 'r', kind: 'digit' }];
  let cells: WalkCell[] = [...numberCells('a', a), ...numberCells('b', b)];
  const frames: WalkFrame[] = [{ cells, focus: null, say: `${b}을(를) ${a}의 일의 자리부터 차례로 곱합니다.`, fresh: [] }];
  let carry = 0;
  for (let col = 0; col < da.length; col += 1) {
    const x = da[col];
    const p = x * b + carry;
    const 식 = carry ? `${x}×${b}=${x * b}, 올림한 ${carry}을(를) 더하면 ${p}` : `${x}×${b}=${p}`;
    const fresh: string[] = [];
    const last = col === da.length - 1;
    let say: string;
    if (last) {
      digitsOf(p).forEach((d, k) => {
        cells = put(cells, { row: 'r', col: col + k, text: String(d) });
        fresh.push(`r:${col + k}`);
      });
      say = `${자리말[col]}: ${식}. ${eul(String(p))} 씁니다.`;
    } else if (p >= 10) {
      cells = put(cells, { row: 'r', col, text: String(p % 10) });
      cells = put(cells, { row: 'carry', col: col + 1, text: String(Math.floor(p / 10)), small: true });
      fresh.push(`r:${col}`, `carry:${col + 1}`);
      say = `${자리말[col]}: ${식}. ${eul(String(p % 10))} 쓰고 ${eul(String(Math.floor(p / 10)))} ${자리말[col + 1]}로 올림합니다.`;
    } else {
      cells = put(cells, { row: 'r', col, text: String(p) });
      fresh.push(`r:${col}`);
      say = `${자리말[col]}: ${식}. ${eul(String(p))} 씁니다.`;
    }
    carry = last ? 0 : Math.floor(p / 10);
    frames.push({ cells, focus: col, say: 말(say), fresh });
  }
  frames.push({ cells, focus: null, say: `그러므로 ${a}×${b}=${result}입니다.`, fresh: [] });
  return { type: 'column', cols, rows, frames, result };
};

/** (두 자리 수)×(두 자리 수): 일의 자리를 곱한 줄, 십의 자리를 곱한 줄, 두 줄의 합. */
const mulTwoWalk = (a: number, b: number): ColumnWalk => {
  const o = b % 10;
  const t = Math.floor(b / 10) * 10;
  const p1 = a * o;
  const p2 = a * t;
  const result = a * b;
  const cols = Math.max(String(result).length, String(p2).length, String(a).length);
  const rows: WalkRow[] = [{ id: 'a', kind: 'digit' }, { id: 'b', kind: 'digit', op: '×' }, { id: 'line', kind: 'line' }, { id: 'p1', kind: 'digit' }, { id: 'p2', kind: 'digit' }, { id: 'line2', kind: 'line' }, { id: 'r', kind: 'digit' }];
  let cells: WalkCell[] = [...numberCells('a', a), ...numberCells('b', b)];
  const frames: WalkFrame[] = [{ cells, focus: null, say: `${b}=${t}+${o}입니다. ${a}×${o}과(와) ${a}×${t}을(를) 차례로 구해 더합니다.`, fresh: [] }];
  const p1Cells = numberCells('p1', p1);
  cells = [...cells, ...p1Cells];
  frames.push({ cells, focus: null, say: `${a}×${o}=${p1}을(를) 첫째 줄에 씁니다.`, fresh: p1Cells.map(key) });
  const p2Cells = numberCells('p2', p2);
  cells = [...cells, ...p2Cells];
  frames.push({ cells, focus: null, say: `${a}×${t}=${p2}을(를) 둘째 줄에 씁니다. ${a}×${t / 10}=${a * (t / 10)}의 10배라서 한 자리 왼쪽에 맞추어 씁니다.`, fresh: p2Cells.map(key) });
  const rCells = numberCells('r', result);
  cells = [...cells, ...rCells];
  frames.push({ cells, focus: null, say: `두 줄을 더합니다. ${p1}+${p2}=${result}입니다.`, fresh: rCells.map(key) });
  frames.push({ cells, focus: null, say: `그러므로 ${a}×${b}=${result}입니다.`, fresh: [] });
  return { type: 'column', cols, rows, frames: frames.map((f) => ({ ...f, say: 말(f.say) })), result };
};

// ── 나눗셈 ──────────────────────────────────────────────────────────
// 높은 자리부터 나누고, 몫을 쓰고, 곱을 빼고, 다음 자리를 내립니다.
const divWalk = (a: number, b: number): DivWalk => {
  const ds = String(a).split('').map(Number);
  const 자리 = (at: number) => 자리말[ds.length - 1 - at];
  const quotient: Array<string | null> = ds.map(() => null);
  const lines: DivFrame['lines'] = [];
  const frames: DivFrame[] = [{ quotient: [...quotient], lines: [], focus: null, say: `${b}(으)로 ${a}을(를) 나눕니다. 높은 자리부터 나눕니다.`, freshLine: null, freshQuotient: null }];
  const 장면 = (focus: number | null, say: string, freshLine: number | null, freshQuotient: number | null) =>
    frames.push({ quotient: [...quotient], lines: lines.map((l) => ({ ...l })), focus, say, freshLine, freshQuotient });
  let rest = 0;
  let started = false;
  for (let at = 0; at < ds.length; at += 1) {
    const now = rest * 10 + ds[at];
    if (!started && now < b && at < ds.length - 1) {
      장면(at, `${자리(at)}의 ${ds[at]}은(는) ${b}보다 작아서 나눌 수 없습니다. 다음 자리와 함께 ${now * 10 + ds[at + 1]}을(를) 나눕니다.`, null, null);
      rest = now;
      continue;
    }
    if (started) {
      // 앞의 나머지 옆에 다음 자리를 내려 씁니다. 나머지가 0이면 0은 쓰지 않습니다.
      lines[lines.length - 1] = { text: String(now), endCol: at, kind: 'rest' };
      장면(at, `${자리(at)}의 ${ds[at]}을(를) 내려 씁니다. 이제 ${now}을(를) 나눕니다.`, lines.length - 1, null);
    }
    started = true;
    const q = Math.floor(now / b);
    quotient[at] = String(q);
    if (q === 0) {
      // 교과서처럼 0×나누는 수는 쓰지 않고 다음 자리를 내립니다.
      if (!lines.length) lines.push({ text: String(now), endCol: at, kind: 'rest' });
      장면(at, `${now}은(는) ${b}보다 작으므로 몫의 ${자리(at)}에 0을 씁니다.`, null, at);
      rest = now;
      continue;
    }
    const 뺄 = q * b;
    rest = now - 뺄;
    lines.push({ text: String(뺄), endCol: at, kind: 'sub' });
    장면(at, `${b}×${q}=${뺄}이므로 몫의 ${자리(at)}에 ${eul(String(q))} 쓰고, ${뺄}을(를) ${now} 아래에 씁니다.`, lines.length - 1, at);
    lines.push({ text: String(rest), endCol: at, kind: 'rest' });
    장면(at, `${now}-${뺄}=${rest}입니다.`, lines.length - 1, null);
  }
  const q = Math.floor(a / b);
  const r = a % b;
  장면(null, r === 0 ? `그러므로 ${a}÷${b}=${q}입니다.` : `더 내릴 자리가 없고 ${r}은(는) ${b}보다 작으므로 나머지입니다. 그러므로 ${a}÷${b}=${q} … ${r}입니다.`, null, null);
  return { type: 'div', divisor: b, dividend: String(a), frames: frames.map((f) => ({ ...f, say: 말(f.say) })), quotient: q, remainder: r };
};

// ── 시간의 덧셈과 뺄셈 ──────────────────────────────────────────────
// 칸은 초(0), 분(1), 시(2)입니다. 한 칸에 두 자리 수를 그대로 씁니다.
const timeWalk = (w: Extract<Walkthrough, { kind: 'time' }>): ColumnWalk => {
  const { a, b, op } = w;
  const 시있음 = a.h !== undefined;
  const rows: WalkRow[] = [{ id: 'unit', kind: 'label' }, { id: 'carry', kind: 'small' }, { id: 'a', kind: 'digit' }, { id: 'b', kind: 'digit', op: op === '+' ? '+' : '−' }, { id: 'line', kind: 'line' }, { id: 'r', kind: 'digit' }];
  const units = 시있음 ? ['초', '분', '시'] : ['초', '분'];
  let cells: WalkCell[] = [
    ...units.map((u, col) => ({ row: 'unit', col, text: u })),
    { row: 'a', col: 0, text: String(a.s) },
    { row: 'a', col: 1, text: String(a.m) },
    ...(시있음 ? [{ row: 'a', col: 2, text: String(a.h) }] : []),
    { row: 'b', col: 0, text: String(b.s) },
    { row: 'b', col: 1, text: String(b.m) },
  ];
  const frames: WalkFrame[] = [{ cells, focus: null, say: '같은 단위끼리 자리를 맞추어 세로로 씁니다. 초부터 계산합니다.', fresh: [] }];
  let rs: number;
  let rm: number;
  if (op === '+') {
    const S = a.s + b.s;
    const 올림 = S >= 60 ? 1 : 0;
    rs = S - 60 * 올림;
    cells = put(cells, { row: 'r', col: 0, text: String(rs) });
    const fresh = ['r:0'];
    if (올림) {
      cells = put(cells, { row: 'carry', col: 1, text: '1', small: true });
      fresh.push('carry:1');
    }
    frames.push({ cells, focus: 0, say: 올림 ? `초끼리: ${a.s}+${b.s}=${S}. 60초는 1분이므로 1분을 받아올리고 ${S}-60=${rs}(초)를 씁니다.` : `초끼리: ${a.s}+${b.s}=${S}(초).`, fresh });
    rm = a.m + b.m + 올림;
    cells = put(cells, { row: 'r', col: 1, text: String(rm) });
    frames.push({ cells, focus: 1, say: 올림 ? `분끼리: ${a.m}+${b.m}+1(받아올림)=${rm}(분).` : `분끼리: ${a.m}+${b.m}=${rm}(분).`, fresh: ['r:1'] });
  } else {
    const 내림 = a.s < b.s ? 1 : 0;
    rs = a.s + 60 * 내림 - b.s;
    const fresh: string[] = ['r:0'];
    if (내림) {
      cells = put(cells, { row: 'a', col: 1, text: String(a.m), struck: true });
      cells = put(cells, { row: 'carry', col: 1, text: String(a.m - 1), small: true });
      cells = put(cells, { row: 'a', col: 0, text: String(a.s), struck: true });
      cells = put(cells, { row: 'carry', col: 0, text: String(a.s + 60), small: true });
      fresh.push('carry:1', 'carry:0');
    }
    cells = put(cells, { row: 'r', col: 0, text: String(rs) });
    frames.push({ cells, focus: 0, say: 내림 ? `초끼리: ${a.s}에서 ${b.s}을(를) 뺄 수 없으므로 1분을 60초로 바꾸어 받아내립니다. ${a.s}+60=${a.s + 60}, ${a.s + 60}-${b.s}=${rs}(초).` : `초끼리: ${a.s}-${b.s}=${rs}(초).`, fresh });
    rm = a.m - 내림 - b.m;
    cells = put(cells, { row: 'r', col: 1, text: String(rm) });
    frames.push({ cells, focus: 1, say: 내림 ? `분끼리: 받아내려 준 1분을 뺀 ${a.m - 1}에서 ${a.m - 1}-${b.m}=${rm}(분).` : `분끼리: ${a.m}-${b.m}=${rm}(분).`, fresh: ['r:1'] });
  }
  if (시있음) {
    cells = put(cells, { row: 'r', col: 2, text: String(a.h) });
    frames.push({ cells, focus: 2, say: `시는 그대로 ${a.h}시입니다.`, fresh: ['r:2'] });
  }
  const 답 = 시있음 ? `${a.h}시 ${rm}분 ${rs}초` : rm === 0 ? `${rs}초` : rs === 0 ? `${rm}분` : `${rm}분 ${rs}초`;
  frames.push({ cells, focus: null, say: `그러므로 ${답}입니다.`, fresh: [] });
  return { type: 'column', cols: units.length, rows, frames, result: rm * 60 + rs, stopAt: 1, wide: true };
};

export const buildWalk = (w: Walkthrough): ColumnWalk | DivWalk => {
  const walk = w.kind === 'time' ? timeWalk(w)
    : w.kind === 'add' ? addWalk(w.a, w.b)
    : w.kind === 'sub' ? subWalk(w.a, w.b)
      : w.kind === 'div' ? divWalk(w.a, w.b)
        : w.b >= 10 ? mulTwoWalk(w.a, w.b) : mulOneWalk(w.a, w.b);
  // 조사 표시('을(를)')를 앞말에 맞춥니다.
  if (walk.type === 'div') return { ...walk, frames: walk.frames.map((f) => ({ ...f, say: 말(f.say) })) };
  return { ...walk, frames: walk.frames.map((f) => ({ ...f, say: 말(f.say) })) };
};

// ── 문항에서 따라갈 계산 고르기 ──────────────────────────────────────
// 풀이에 적힌 식 가운데 참인 것을 찾고, 문제에 나온 수로 된 것을
// 먼저 봅니다. 크기가 같은 식이 둘 넘게 남으면(가장 큰 것 고르기처럼)
// 어느 것을 보여야 할지 모르므로 보여 주지 않습니다.
const 식꼴 = /(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)(?:\s*…\s*(\d+))?/g;
// 시간(분 초), 들이(L mL), 무게(kg g), 길이(km m, m cm, cm mm)는 단위가 둘인
// 계산입니다. 세로셈을 한 단위로 보여 주면 60이나 1000에서 받아올리는 것을
// 10에서 받아올리는 것처럼 보이게 됩니다.
const 두단위 = /\d+\s*(시간|시|분|L|kg|km|m|cm)\s+\d+\s*(분|초|mL|g|m|cm|mm)/;

// 글 속의 시간·시각입니다(예: 9시 9분 38초, 7분 18초, 45초).
const 시간꼴 = /(?:(\d+)시\s+)?(?:(\d+)분)?\s?(?:(\d+)초)?/g;
type 때 = { h?: number; m: number; s: number };
const 시간들 = (text: string): 때[] =>
  [...text.matchAll(시간꼴)]
    .filter((m) => m[2] !== undefined || m[3] !== undefined)
    .map((m) => ({ ...(m[1] !== undefined ? { h: Number(m[1]) } : {}), m: Number(m[2] ?? 0), s: Number(m[3] ?? 0) }));
const 초로 = (t: 때) => (t.h ?? 0) * 3600 + t.m * 60 + t.s;

/** 시간의 덧셈·뺄셈 문항이면 답과 맞추어 보고 따라갈 계산을 돌려줍니다. */
const deriveTime = (prompt: string, answer: string): Walkthrough | null => {
  if (!/초/.test(prompt) || !/초|분/.test(answer)) return null;
  const 둘 = 시간들(prompt);
  const 답 = 시간들(answer);
  if (둘.length !== 2 || 답.length !== 1) return null;
  const [x, y] = 둘;
  if (x.h !== undefined && y.h !== undefined) return null;
  const [시각, 시간] = y.h !== undefined ? [y, x] : [x, y];
  if (초로(시각) + 초로(시간) === 초로(답[0]) && 시각.m + 시간.m + (시각.s + 시간.s >= 60 ? 1 : 0) < 60) {
    return { kind: 'time', op: '+', a: 시각, b: { m: 시간.m, s: 시간.s } };
  }
  const [큰, 작은] = 초로(x) >= 초로(y) ? [x, y] : [y, x];
  if (작은.h === undefined && 초로(큰) - 초로(작은) === 초로(답[0]) && 큰.m - (큰.s < 작은.s ? 1 : 0) - 작은.m >= 0) {
    return { kind: 'time', op: '-', a: 큰, b: { m: 작은.m, s: 작은.s } };
  }
  return null;
};

export const deriveWalkthrough = (prompt: string, steps: string[], semester: string, answer = ''): Walkthrough | null => {
  if (!semester.startsWith('3')) return null;
  const 때 = semester === '3-1' ? deriveTime(prompt, answer) : null;
  if (때) return 때;
  if (/어림/.test(prompt) || /\d\/\d/.test(prompt) || 두단위.test(prompt) || /의 \d+\/\d+/.test(steps.join(' '))) return null;
  const 문제수 = new Set(prompt.match(/\d+/g) ?? []);
  const 후보: Walkthrough[] = [];
  for (const line of steps) {
    for (const m of line.matchAll(식꼴)) {
      const a = Number(m[1]);
      const b = Number(m[3]);
      const c = Number(m[4]);
      const r = m[5] === undefined ? 0 : Number(m[5]);
      const op = m[2];
      if (op === '+' && a + b === c && a >= 10 && b >= 10 && !(a % 100 === 0 && b % 100 === 0)) 후보.push({ kind: 'add', a, b });
      if (op === '-' && a - b === c && a >= 10 && b >= 10 && !(a % 100 === 0 && b % 100 === 0)) 후보.push({ kind: 'sub', a, b });
      if (op === '×' && a * b === c && (a >= 10 || b >= 10) && a % 10 !== 0 && b % 10 !== 0) {
        // (한 자리 수)×(두 자리 수)는 두 수를 바꾸어 세로로 씁니다.
        const [x, y] = a < 10 ? [b, a] : [a, b];
        if (y < 100 && x < 1000 && !(y >= 10 && x >= 100)) 후보.push({ kind: 'mul', a: x, b: y });
      }
      // 3학년 1학기 나눗셈은 곱셈구구로 몫을 구합니다(세로셈은 2학기).
      if (op === '÷' && semester === '3-2' && b < 10 && a >= 10 && Math.floor(a / b) === c && a % b === r) 후보.push({ kind: 'div', a, b });
    }
  }
  if (!후보.length) return null;
  const 문제에서 = 후보.filter((w) => 문제수.has(String(w.a)) && 문제수.has(String(w.b)));
  const pool = 문제에서.length ? 문제에서 : 후보;
  const 크기 = (w: Walkthrough) => String(w.a).length + String(w.b).length;
  const 최대 = Math.max(...pool.map(크기));
  const 남은 = [...new Map(pool.filter((w) => 크기(w) === 최대).map((w) => [`${w.kind}${w.a},${w.b}`, w])).values()];
  return 남은.length === 1 ? 남은[0] : null;
};
