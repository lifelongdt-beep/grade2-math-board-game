import type { Manipulation } from '../../types';
import type { ManipResult } from './check';

// ════════════════════════════════════════════════════════════════════
// 손 조작 문항의 채점 (2): 순서대로 놓기, 눈금 맞추기(들이·무게),
// 그림그래프, 달력, 똑같이 나누어 담기, 점 배열, 규칙 채우기
// ────────────────────────────────────────────────────────────────────
// check.ts의 채점()이 이 갈래를 여기로 넘깁니다. 기록에 남는 말의
// 조사는 채점()이 고릅니다.
// ════════════════════════════════════════════════════════════════════

type 조작<K extends Manipulation['kind']> = Extract<Manipulation, { kind: K }>;

export type 더한상태 =
  | { kind: 'order'; seq: number[] }
  | { kind: 'gauge'; value: number }
  | { kind: 'pictograph'; big: number[]; small: number[] }
  | { kind: 'calendar'; picked: number[] }
  | { kind: 'share'; plates: number[] }
  | { kind: 'array'; rows: number; cols: number }
  | { kind: 'pattern'; fill: (number | null)[] };

const 째 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째', '열한째', '열두째'];
export const 째말 = (k: number) => 째[k] ?? `${k + 1}번째`;

/** 1300 → '1 L 300 mL', 2000 g → '2 kg' */
export const 들이말 = (mL: number) => (mL >= 1000 ? `${Math.floor(mL / 1000)} L${mL % 1000 ? ` ${mL % 1000} mL` : ''}` : `${mL} mL`);
export const 무게말 = (g: number) => (g >= 1000 ? `${Math.floor(g / 1000)} kg${g % 1000 ? ` ${g % 1000} g` : ''}` : `${g} g`);
export const 눈금말 = (tool: 'beaker' | 'scale', v: number) => (tool === 'beaker' ? 들이말(v) : 무게말(v));

// ── 순서대로 놓기 ─────────────────────────────────────────────────
const 순서채점 = (m: 조작<'order'>, seq: number[]): ManipResult => {
  const 큰쪽 = m.dir === 'desc';
  const said = seq.map((i) => m.items[i].label).join(m.expr ? ' → ' : 큰쪽 ? ' > ' : ' < ') || '놓지 않음';
  if (seq.length < m.items.length) return { ok: false, said, tip: `아직 놓지 않은 것이 ${m.items.length - seq.length}개 있어요.` };
  for (let k = 0; k + 1 < seq.length; k += 1) {
    const a = m.items[seq[k]];
    const b = m.items[seq[k + 1]];
    if (큰쪽 ? a.value > b.value : a.value < b.value) continue;
    if (m.why) return { ok: false, said, tip: m.why };
    const 말 = `'${a.label}'과(와) '${b.label}'의 크기를 다시 비교해 보세요.`;
    const 단위분수 = [a, b].every((x) => /^1\/\d+$/.test(x.label));
    const 분수 = [a, b].every((x) => x.label.includes('/'));
    const 소수 = [a, b].some((x) => x.label.includes('.'));
    let 까닭 = '높은 자리의 숫자부터 차례로 비교해요. 자릿수가 다르면 자릿수가 많은 수가 더 커요.';
    if (a.len !== undefined) 까닭 = '한쪽 끝을 맞추었으니 다른 쪽 끝이 더 많이 나온 것이 더 길어요.';
    else if (단위분수) 까닭 = '단위분수는 분모가 클수록 더 작게 나눈 것이라 크기가 작아요.';
    else if (분수 && /^\d+\/(\d+)$/.test(a.label) && a.label.split('/')[1] === b.label.split('/')[1]) 까닭 = '분모가 같으면 분자가 클수록 큰 분수예요.';
    else if (분수) 까닭 = '분모를 같게(통분) 하거나, 대분수는 자연수 부분부터 비교해 보세요.';
    else if (소수) 까닭 = '소수는 자연수 부분, 소수 첫째 자리, 소수 둘째 자리 차례로 비교해요. 숫자가 많이 적혀 있다고 더 큰 수가 아니에요.';
    return { ok: false, said, tip: `${말} ${까닭}` };
  }
  return { ok: true, said };
};

// ── 눈금 맞추기 ───────────────────────────────────────────────────
const 눈금채점 = (m: 조작<'gauge'>, v: number): ManipResult => {
  const 말 = (x: number) => 눈금말(m.tool, x);
  const 단위 = m.tool === 'beaker' ? 'mL' : 'g';
  const 큰단위 = m.tool === 'beaker' ? '1 L는 1000 mL' : '1 kg은 1000 g';
  const said = `${말(v)}에 맞춤`;
  if (v === m.target) return { ok: true, said };
  if (Math.abs(v - m.target) === m.minor) return { ok: false, said, tip: `한 눈금 차이예요. 작은 눈금 한 칸은 ${m.minor} ${단위}${m.tool === 'beaker' ? '예요' : '이에요'}. 큰 눈금에서부터 작은 눈금을 하나씩 세어 보세요.` };
  if (m.target >= 1000 && v === m.target % 1000) return { ok: false, said, tip: `${큰단위}${m.tool === 'beaker' ? '예요' : '이에요'}. ${말(m.target)}에서 앞의 ${m.tool === 'beaker' ? 'L' : 'kg'}만큼도 채워야 해요.` };
  if (m.pre > 0 && v === 2 * m.pre - m.target) return { ok: false, said, tip: '처음 양에서 더하는지 빼는지 문제를 다시 읽어 보세요.' };
  return { ok: false, said, tip: `지금은 ${말(v)}이에요. ${큰단위}임을 생각하며, 큰 눈금을 먼저 읽고 작은 눈금을 세어 보세요.`.replace(/mL이에요/, 'mL예요') };
};

// ── 그림그래프 ────────────────────────────────────────────────────
const 그림그래프채점 = (m: 조작<'pictograph'>, big: number[], small: number[]): ManipResult => {
  const 값 = (i: number) => big[i] * m.big + small[i] * m.small;
  const said = m.labels.map((l, i) => `${l} 큰 ${big[i]}·작은 ${small[i]}`).join(', ');
  const 틀린 = m.labels.findIndex((_, i) => 값(i) !== m.values[i]);
  if (틀린 >= 0) {
    const 큰그림이작은 = big[틀린] * m.small + small[틀린] * m.big === m.values[틀린] && m.big !== m.small;
    return {
      ok: false,
      said,
      tip: 큰그림이작은
        ? `'${m.labels[틀린]}'에서 큰 그림과 작은 그림을 바꾸어 그렸어요. 큰 그림은 ${m.big}${m.unitLabel}, 작은 그림은 ${m.small}${m.unitLabel}을(를) 나타내요.`
        : `'${m.labels[틀린]}'은(는) 지금 ${값(틀린)}${m.unitLabel}을(를) 나타내요. 표의 수를 다시 보고, 큰 그림 하나가 ${m.big}${m.unitLabel}임을 생각해요.`,
    };
  }
  const 많은 = m.labels.findIndex((_, i) => small[i] * m.small >= m.big);
  if (많은 >= 0) return { ok: false, said, tip: `'${m.labels[많은]}'의 수는 맞지만 작은 그림이 ${small[많은]}개예요. 작은 그림 ${m.big / m.small}개는 큰 그림 1개로 바꾸어 그려야 한눈에 알아볼 수 있어요.` };
  return { ok: true, said };
};

// ── 달력 ──────────────────────────────────────────────────────────
const 달력채점 = (m: 조작<'calendar'>, picked: number[]): ManipResult => {
  const 고른 = [...new Set(picked)].sort((a, b) => a - b);
  const said = 고른.length ? `${고른.map((d) => `${d}일`).join(', ')}을(를) 누름` : '누르지 않음';
  const 목표 = new Set(m.target);
  const 빠짐 = m.target.filter((d) => !고른.includes(d));
  const 더 = 고른.filter((d) => !목표.has(d));
  if (!빠짐.length && !더.length) return { ok: true, said };
  if (!고른.length) return { ok: false, said, tip: '알맞은 날짜를 눌러요.' };
  if (m.target.length === 1 && 고른.length === 1) {
    const 차 = 고른[0] - m.target[0];
    if (Math.abs(차) % 7 === 0) return { ok: false, said, tip: `1주일은 7일이에요. 달력에서 한 줄 아래로 가면 1주일 뒤, 한 줄 위로 가면 1주일 앞이에요. ${Math.abs(차) / 7}주일만큼 어긋났어요.` };
    if (Math.abs(차) === 1) return { ok: false, said, tip: '하루 차이예요. 요일을 맨 위의 이름에서 다시 읽어 보세요.' };
  }
  return { ok: false, said, tip: 빠짐.length && !더.length ? `아직 누르지 않은 날이 ${빠짐.length}개 있어요. 같은 요일은 달력의 같은 세로줄에 있어요.` : '맞지 않는 날짜가 있어요. 요일은 맨 위의 이름을 따라 세로줄로 읽어요.' };
};

// ── 똑같이 나누어 담기 ────────────────────────────────────────────
export const 담은수 = (plates: number[]) => plates.reduce((a, b) => a + b, 0);
const 나누기채점 = (m: 조작<'share'>, plates: number[]): ManipResult => {
  const 남음 = m.total - 담은수(plates);
  const said = `접시 ${plates.length}개에 ${plates.join(', ') || 0}개씩 담고 ${남음}개 남김`;
  if (!plates.length || 담은수(plates) === 0) return { ok: false, said, tip: m.groups ? '접시를 누를 때마다 하나씩 담겨요.' : '＋ 접시를 눌러 접시를 놓고, 접시를 누를 때마다 하나씩 담아요.' };
  if (m.groups) {
    const 같음 = plates.every((v) => v === plates[0]);
    if (!같음) return { ok: false, said, tip: '접시마다 담긴 수가 달라요. 똑같이 나누려면 모든 접시에 같은 수만큼 담아야 해요.' };
    if (남음 >= m.groups) return { ok: false, said, tip: `아직 ${남음}개가 남았어요. 접시마다 하나씩 더 담을 수 있어요.` };
    if (!m.rest && 남음 > 0) return { ok: false, said, tip: `아직 ${남음}개가 남았어요. 남김없이 똑같이 나누어 보세요.` };
    return { ok: true, said };
  }
  const size = m.size!;
  const 다른 = plates.findIndex((v) => v !== size);
  if (다른 >= 0) return { ok: false, said, tip: `${째말(다른)} 접시에 ${plates[다른]}개가 있어요. 한 접시에 꼭 ${size}개씩 담아요.` };
  if (남음 >= size) return { ok: false, said, tip: `남은 ${남음}개로 접시를 하나 더 채울 수 있어요.` };
  if (!m.rest && 남음 > 0) return { ok: false, said, tip: `아직 ${남음}개가 남았어요.` };
  return { ok: true, said };
};

// ── 점 배열 ───────────────────────────────────────────────────────
const 배열채점 = (m: 조작<'array'>, rows: number, cols: number): ManipResult => {
  const said = `한 줄에 ${cols}개씩 ${rows}줄(${rows * cols}개)을 만듦`;
  if (rows === m.rows && cols === m.cols) return { ok: true, said };
  if (!rows || !cols) return { ok: false, said: '배열을 만들지 않음', tip: '왼쪽 위의 점에서 시작해 대각선으로 끌어 보세요.' };
  if (rows === m.cols && cols === m.rows) return { ok: false, said, tip: `개수는 맞지만 한 줄의 수와 줄의 수가 바뀌었어요. 가로로 한 줄에 ${m.cols}개씩이에요.` };
  if (rows * cols === m.rows * m.cols) return { ok: false, said, tip: '모두 몇 개인지는 맞아요. 문제에서 말한 줄의 수와 한 줄의 수를 다시 보세요.' };
  return { ok: false, said, tip: rows !== m.rows ? `줄의 수를 다시 세어 보세요. 지금은 ${rows}줄이에요.` : `한 줄에 놓인 수를 다시 세어 보세요. 지금은 ${cols}개예요.` };
};

// ── 규칙 채우기 ───────────────────────────────────────────────────
const 규칙채점 = (m: 조작<'pattern'>, fill: (number | null)[]): ManipResult => {
  const 빈칸 = m.given.map((g, i) => (g === null ? i : -1)).filter((i) => i >= 0);
  const 채운 = 빈칸.filter((i) => fill[i] !== null && fill[i] !== undefined);
  const said = `빈칸 ${빈칸.length}개 가운데 ${채운.length}개를 채움(${빈칸.map((i) => (fill[i] === null || fill[i] === undefined ? '□' : m.palette[fill[i]!])).join('')})`;
  if (채운.length < 빈칸.length) return { ok: false, said, tip: `아직 비어 있는 칸이 ${빈칸.length - 채운.length}개 있어요.` };
  const 틀린 = 빈칸.findIndex((i) => fill[i] !== m.answer[i]);
  if (틀린 < 0) return { ok: true, said };
  return { ok: false, said, tip: `${째말(틀린)} 빈칸이 규칙에 맞지 않아요. 되풀이되는 묶음을 찾아 손가락으로 하나씩 짚으며 이어 가 보세요.` };
};

export const 더채점 = (m: Manipulation, s: 더한상태): ManipResult | null => {
  if (m.kind === 'order' && s.kind === 'order') return 순서채점(m, s.seq);
  if (m.kind === 'gauge' && s.kind === 'gauge') return 눈금채점(m, s.value);
  if (m.kind === 'pictograph' && s.kind === 'pictograph') return 그림그래프채점(m, s.big, s.small);
  if (m.kind === 'calendar' && s.kind === 'calendar') return 달력채점(m, s.picked);
  if (m.kind === 'share' && s.kind === 'share') return 나누기채점(m, s.plates);
  if (m.kind === 'array' && s.kind === 'array') return 배열채점(m, s.rows, s.cols);
  if (m.kind === 'pattern' && s.kind === 'pattern') return 규칙채점(m, s.fill);
  return null;
};

export const 더처음 = (m: Manipulation): 더한상태 | null => {
  switch (m.kind) {
    case 'order': return { kind: m.kind, seq: [] };
    case 'gauge': return { kind: m.kind, value: m.pre };
    case 'pictograph': return { kind: m.kind, big: m.labels.map(() => 0), small: m.labels.map(() => 0) };
    case 'calendar': return { kind: m.kind, picked: [] };
    case 'share': return { kind: m.kind, plates: m.groups ? Array.from({ length: m.groups }, () => 0) : [] };
    case 'array': return { kind: m.kind, rows: 0, cols: 0 };
    case 'pattern': return { kind: m.kind, fill: [...m.given] };
    default: return null;
  }
};

export const 더정답 = (m: Manipulation): 더한상태 | null => {
  switch (m.kind) {
    case 'order': {
      const seq = m.items.map((_, i) => i).sort((a, b) => (m.dir === 'asc' ? m.items[a].value - m.items[b].value : m.items[b].value - m.items[a].value));
      return { kind: m.kind, seq };
    }
    case 'gauge': return { kind: m.kind, value: m.target };
    case 'pictograph': return { kind: m.kind, big: m.values.map((v) => Math.floor(v / m.big)), small: m.values.map((v) => (v % m.big) / m.small) };
    case 'calendar': return { kind: m.kind, picked: [...m.target] };
    case 'share': {
      if (m.groups) return { kind: m.kind, plates: Array.from({ length: m.groups }, () => Math.floor(m.total / m.groups!)) };
      return { kind: m.kind, plates: Array.from({ length: Math.floor(m.total / m.size!) }, () => m.size!) };
    }
    case 'array': return { kind: m.kind, rows: m.rows, cols: m.cols };
    case 'pattern': return { kind: m.kind, fill: [...m.answer] };
    default: return null;
  }
};
