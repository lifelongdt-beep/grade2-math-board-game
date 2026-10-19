import type { DrawGoal, GridPoint, GridSegment, Manipulation, PolygonGoal } from '../../types';
import { resolveParticles } from '../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 손 조작 문항의 채점
// ────────────────────────────────────────────────────────────────────
// 아이가 조작한 결과(상태)를 받아 맞았는지와, 무엇을 했는지를 한 줄로
// 돌려줍니다. 틀렸을 때는 자주 하는 실수를 알아보아 그 실수에 맞는
// 말(tip)을 붙입니다 — "틀렸어요"보다 "0이 아니라 1에서 시작했어요"가
// 다음에 바르게 하도록 돕습니다.
// 화면(Manipulate.tsx)과 떨어져 있어 검사에서 그대로 부를 수 있습니다.
// ════════════════════════════════════════════════════════════════════

export type ManipState =
  | { kind: 'ruler-measure'; rulerAt: number; endTick: number | null }
  | { kind: 'ruler-draw'; end: number }
  | { kind: 'clock'; hourDeg: number; minuteDeg: number }
  | { kind: 'grid-point'; pt: GridPoint | null }
  | { kind: 'grid-draw'; segs: GridSegment[] }
  | { kind: 'shape-move'; cells: GridPoint[]; offset: GridPoint }
  | { kind: 'number-line'; at: number | null }
  | { kind: 'tap-fill'; on: number[] }
  | { kind: 'base-ten'; counts: number[] }
  | { kind: 'bars'; vals: (number | null)[] }
  | { kind: 'angle'; deg: number }
  | { kind: 'sort-bins'; placed: (number | null)[] }
  | { kind: 'stack-build'; h: number[][] };

export interface ManipResult {
  ok: boolean;
  /** 아이가 한 것을 한 줄로 적습니다(기록과 교사용 분석에 남습니다). */
  said: string;
  /** 틀렸을 때, 알아본 실수에 맞춘 도움말입니다. */
  tip?: string;
}

// ── 모눈 계산 ─────────────────────────────────────────────────────
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const 같은점 = (a: GridPoint, b: GridPoint) => a[0] === b[0] && a[1] === b[1];
const 점열쇠 = (p: GridPoint) => `${p[0]},${p[1]}`;

/** 선분을 모눈점 사이의 가장 짧은 조각들로 나눕니다(같은 선을 나누어 그어도 같게 봅니다). */
export const 조각들 = (s: GridSegment): string[] => {
  const [a, b] = s;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = gcd(dx, dy);
  if (n === 0) return [];
  const out: string[] = [];
  for (let k = 0; k < n; k += 1) {
    const p: GridPoint = [a[0] + (dx / n) * k, a[1] + (dy / n) * k];
    const q: GridPoint = [a[0] + (dx / n) * (k + 1), a[1] + (dy / n) * (k + 1)];
    const [u, v] = 점열쇠(p) < 점열쇠(q) ? [p, q] : [q, p];
    out.push(`${점열쇠(u)}-${점열쇠(v)}`);
  }
  return out;
};

export const 조각집합 = (segs: GridSegment[]) => new Set(segs.flatMap(조각들));

/** 선분들이 이루는 닫힌 도형 하나의 꼭짓점(곧게 이어지는 점은 뺍니다). 하나가 아니면 null */
export const 닫힌도형 = (segs: GridSegment[]): GridPoint[] | null => {
  const pieces = [...조각집합(segs)];
  if (pieces.length < 3) return null;
  const 이웃 = new Map<string, string[]>();
  for (const piece of pieces) {
    const [a, b] = piece.split('-');
    이웃.set(a, [...(이웃.get(a) ?? []), b]);
    이웃.set(b, [...(이웃.get(b) ?? []), a]);
  }
  if ([...이웃.values()].some((ns) => ns.length !== 2)) return null;
  const 시작 = pieces[0].split('-')[0];
  const 차례: string[] = [시작];
  let 앞 = 시작;
  let 지금 = 이웃.get(시작)![0];
  while (지금 !== 시작) {
    차례.push(지금);
    const 다음 = 이웃.get(지금)!.find((n) => n !== 앞)!;
    앞 = 지금;
    지금 = 다음;
    if (차례.length > pieces.length + 1) return null;
  }
  if (차례.length !== 이웃.size) return null; // 떨어진 도형이 또 있습니다.
  const ps = 차례.map((k) => k.split(',').map(Number) as GridPoint);
  // 곧게 이어지는 점을 뺍니다.
  return ps.filter((p, i) => {
    const a = ps[(i - 1 + ps.length) % ps.length];
    const b = ps[(i + 1) % ps.length];
    return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) !== 0;
  });
};

const 넓이두배 = (ps: GridPoint[]) =>
  Math.abs(ps.reduce((s, p, i) => {
    const q = ps[(i + 1) % ps.length];
    return s + p[0] * q[1] - q[0] * p[1];
  }, 0));

const 길이제곱 = (a: GridPoint, b: GridPoint) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

export interface PolygonFacts {
  sides: number;
  rightAngles: number;
  sideSq: number[];
  parallelPairs: number;
  area: number;
  axisAligned: boolean;
  width: number;
  height: number;
  perimeter: number;
  triangle?: 'acute' | 'right' | 'obtuse';
}

export const 도형살피기 = (ps: GridPoint[]): PolygonFacts => {
  const n = ps.length;
  const 변 = ps.map((p, i) => [p, ps[(i + 1) % n]] as GridSegment);
  const 벡터 = 변.map(([a, b]) => [b[0] - a[0], b[1] - a[1]]);
  let rightAngles = 0;
  for (let i = 0; i < n; i += 1) {
    const u = 벡터[(i - 1 + n) % n];
    const v = 벡터[i];
    if (u[0] * v[0] + u[1] * v[1] === 0) rightAngles += 1;
  }
  let parallelPairs = 0;
  for (let i = 0; i < n; i += 1) for (let j = i + 1; j < n; j += 1) {
    const u = 벡터[i];
    const v = 벡터[j];
    if (u[0] * v[1] - u[1] * v[0] === 0) parallelPairs += 1;
  }
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  const axisAligned = 벡터.every(([dx, dy]) => dx === 0 || dy === 0);
  // 삼각형이면 각의 종류를 봅니다(꼭짓점에서 두 변의 내적이 0이면 직각, 음수면 둔각).
  let triangle: PolygonFacts['triangle'];
  if (n === 3) {
    const 내적 = ps.map((p, i) => {
      const a = ps[(i + 2) % 3];
      const b = ps[(i + 1) % 3];
      return (a[0] - p[0]) * (b[0] - p[0]) + (a[1] - p[1]) * (b[1] - p[1]);
    });
    triangle = 내적.some((d) => d === 0) ? 'right' : 내적.some((d) => d < 0) ? 'obtuse' : 'acute';
  }
  return {
    triangle,
    sides: n,
    rightAngles,
    sideSq: 변.map(([a, b]) => 길이제곱(a, b)),
    parallelPairs,
    area: 넓이두배(ps) / 2,
    axisAligned,
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    perimeter: axisAligned ? 벡터.reduce((s, [dx, dy]) => s + Math.abs(dx) + Math.abs(dy), 0) : NaN,
  };
};

const 가장많이같은변 = (sq: number[]) => Math.max(...sq.map((v) => sq.filter((w) => w === v).length));

/** 조건에 맞지 않는 첫 까닭을 돌려줍니다. 모두 맞으면 null */
export const 도형조건어긋남 = (f: PolygonFacts, g: PolygonGoal): string | null => {
  if (g.sides !== undefined && f.sides !== g.sides) return `변이 ${g.sides}개인 도형을 그려야 하는데 변이 ${f.sides}개예요.`;
  if (g.rightAngles !== undefined && f.rightAngles !== g.rightAngles) {
    return g.rightAngles === 0 ? '직각이 없어야 해요.' : `직각이 ${g.rightAngles}개여야 하는데 ${f.rightAngles}개예요.`;
  }
  if (g.minRightAngles !== undefined && f.rightAngles < g.minRightAngles) return `직각이 ${g.minRightAngles}개 있어야 해요. 지금은 ${f.rightAngles}개예요.`;
  if (g.allSidesEqual && new Set(f.sideSq).size !== 1) return '네 변의 길이가 모두 같아야 해요. 칸을 세어 변의 길이를 견주어 보세요.';
  if (g.equalSides !== undefined && 가장많이같은변(f.sideSq) < g.equalSides) return `길이가 같은 변이 ${g.equalSides}개 있어야 해요.`;
  if (g.parallelPairs !== undefined && f.parallelPairs !== g.parallelPairs) {
    return g.parallelPairs === 1 ? '평행한 변이 한 쌍만 있어야 해요.' : `평행한 변이 ${g.parallelPairs}쌍이어야 하는데 ${f.parallelPairs}쌍이에요.`;
  }
  if (g.minParallelPairs !== undefined && f.parallelPairs < g.minParallelPairs) return '마주 보는 한 쌍의 변이 서로 평행해야 해요.';
  if (g.axisAligned && !f.axisAligned) return '모눈의 선을 따라 그려야 해요.';
  if (g.tilted && f.axisAligned) return '모눈의 선을 따르지 않는, 비스듬한 변이 있도록 그려 보세요.';
  if (g.notAllSidesEqual && new Set(f.sideSq).size === 1) return '변의 길이가 모두 같으면 안 돼요.';
  if (g.triangle && f.triangle !== g.triangle) {
    const 이름 = { acute: '예각삼각형', right: '직각삼각형', obtuse: '둔각삼각형' } as const;
    return f.triangle ? `${이름[f.triangle]}을 그렸어요. ${이름[g.triangle]}이 되도록 꼭짓점을 옮겨 보세요.` : '삼각형을 그려야 해요.';
  }
  if (g.width !== undefined && g.height !== undefined) {
    const 맞음 = (f.width === g.width && f.height === g.height) || (f.width === g.height && f.height === g.width);
    if (!맞음) return `가로 ${g.width}칸, 세로 ${g.height}칸이어야 하는데 ${f.width}칸, ${f.height}칸이에요.`;
  }
  if (g.area !== undefined && f.area !== g.area) return `넓이가 ${g.area}칸이어야 하는데 ${f.area}칸이에요.`;
  if (g.perimeter !== undefined && f.perimeter !== g.perimeter) return `둘레가 ${g.perimeter}칸이어야 하는데 ${Number.isNaN(f.perimeter) ? '모눈선을 따르지 않았어요' : `${f.perimeter}칸이에요`}.`;
  return null;
};

/** 두 다각형이 합동인지(돌리거나 뒤집어 포갤 수 있는지) 봅니다. */
export const 합동인가 = (a: GridPoint[], b: GridPoint[]) => {
  if (a.length !== b.length) return false;
  const 특징 = (ps: GridPoint[]) => ps.map((p, i) => {
    const q = ps[(i + 1) % ps.length];
    const r = ps[(i + 2) % ps.length];
    const u = [q[0] - p[0], q[1] - p[1]];
    const v = [r[0] - q[0], r[1] - q[1]];
    return `${u[0] ** 2 + u[1] ** 2}:${u[0] * v[0] + u[1] * v[1]}:${Math.abs(u[0] * v[1] - u[1] * v[0])}:${Math.sign(u[0] * v[1] - u[1] * v[0])}`;
  });
  const 뒤집기 = (ps: GridPoint[]) => ps.map(([x, y]) => [-x, y] as GridPoint);
  const fa = 특징(a).join('|');
  const 고리 = (fs: string[]) => fs.map((_, k) => [...fs.slice(k), ...fs.slice(0, k)].join('|'));
  // 같은 방향으로 돈 차례든 거꾸로 돈 차례든, 뒤집은 것이든 같은 고리가 있으면 합동입니다.
  const 차례들 = [b, [...b].reverse(), 뒤집기(b), [...뒤집기(b)].reverse()];
  return 차례들.some((ps) => 고리(특징(ps)).includes(fa));
};

const 선분포함 = (s: GridSegment, p: GridPoint) => {
  const [a, b] = s;
  const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  if (cross !== 0) return false;
  return Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
};

export const 그림채점 = (goal: DrawGoal, fixed: GridSegment[], segs: GridSegment[]): ManipResult => {
  if (!segs.length) return { ok: false, said: '아무 선도 긋지 않음', tip: '점 두 개를 차례로 누르면 선이 그어져요.' };
  if (goal.type === 'exact') {
    const 그린 = 조각집합([...fixed, ...segs]);
    const 견주기 = (목표segs: GridSegment[]) => {
      const 목표 = 조각집합(목표segs);
      return { 빠짐: [...목표].filter((k) => !그린.has(k)).length, 더: [...그린].filter((k) => !목표.has(k)).length };
    };
    const 후보 = [goal.segs, ...(goal.alt ?? [])].map(견주기);
    if (후보.some((c) => !c.빠짐 && !c.더)) return { ok: true, said: '바르게 그림' };
    const { 빠짐, 더 } = 후보[0];
    return {
      ok: false,
      said: `선 ${빠짐}조각 빠짐, ${더}조각 더 그음`,
      tip: 더 ? '맞지 않는 선이 있어요. 꼭짓점의 대응점을 먼저 찍듯이, 칸 수를 세어 점을 정한 뒤 이어 보세요.' : '아직 다 잇지 않았어요. 빠진 변을 찾아 이어 보세요.',
    };
  }
  if (goal.type === 'line') {
    const 맞는선 = segs.find((s) => {
      if (!선분포함(s, goal.through)) return false;
      const u = [s[1][0] - s[0][0], s[1][1] - s[0][1]];
      const v = [goal.to[1][0] - goal.to[0][0], goal.to[1][1] - goal.to[0][1]];
      const 관계 = goal.rel === 'perp' ? u[0] * v[0] + u[1] * v[1] === 0 : u[0] * v[1] - u[1] * v[0] === 0;
      return 관계 && 길이제곱(s[0], s[1]) >= (goal.minLength ?? 1) ** 2;
    });
    if (맞는선 && segs.length === 1) return { ok: true, said: goal.rel === 'perp' ? '수선을 바르게 그음' : '평행선을 바르게 그음' };
    if (맞는선) return { ok: false, said: '맞는 선과 다른 선을 함께 그음', tip: '필요한 선 하나만 남기고 나머지는 지워 보세요.' };
    const 지남 = segs.some((s) => 선분포함(s, goal.through));
    return {
      ok: false,
      said: goal.rel === 'perp' ? '수선이 아님' : '평행선이 아님',
      tip: !지남
        ? '선이 표시한 점을 지나야 해요.'
        : goal.rel === 'perp'
          ? '두 선이 만나서 이루는 각이 직각이 되어야 해요. 모눈의 칸을 따라 가 보세요.'
          : '두 선을 길게 늘여도 만나지 않아야 해요. 기준 선과 같은 방향으로 칸을 세어 보세요.',
    };
  }
  const ps = 닫힌도형(segs);
  if (!ps) return { ok: false, said: '닫힌 도형이 아님', tip: '선이 끊어진 곳 없이 처음 점으로 돌아와 닫혀야 해요.' };
  const f = 도형살피기(ps);
  if (goal.type === 'congruent') {
    if (합동인가(ps, goal.shape)) return { ok: true, said: '합동인 도형을 바르게 그림' };
    const g = 도형살피기(goal.shape);
    return {
      ok: false,
      said: `변 ${f.sides}개, 넓이 ${f.area}칸인 도형`,
      tip: f.sides !== g.sides ? `변이 ${g.sides}개여야 해요.` : f.area !== g.area ? '크기가 달라요. 대응하는 변의 칸 수를 하나씩 세어 보세요.' : '모양이 달라요. 꼭짓점을 하나씩 옮겨 찍듯이 칸 수를 세어 그려 보세요.',
    };
  }
  const 어긋남 = 도형조건어긋남(f, goal.goal);
  return 어긋남
    ? { ok: false, said: `변 ${f.sides}개, 직각 ${f.rightAngles}개, 넓이 ${f.area}칸인 도형`, tip: 어긋남 }
    : { ok: true, said: `변 ${f.sides}개, 넓이 ${f.area}칸인 도형을 바르게 그림` };
};

// ── 도형 움직이기 ─────────────────────────────────────────────────
export const 칸바로놓기 = (cells: GridPoint[]): GridPoint[] => {
  const x0 = Math.min(...cells.map((c) => c[0]));
  const y0 = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - x0, y - y0] as GridPoint).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
};
const 칸글 = (cells: GridPoint[]) => cells.map(점열쇠).sort().join(' ');
/** 시계 방향 90° 돌리기(세로가 아래로 커지므로 (x,y)→(-y,x)) */
export const 시계로돌리기 = (cells: GridPoint[]) => 칸바로놓기(cells.map(([x, y]) => [-y, x] as GridPoint));
export const 반대로돌리기 = (cells: GridPoint[]) => 칸바로놓기(cells.map(([x, y]) => [y, -x] as GridPoint));
export const 좌우뒤집기 = (cells: GridPoint[]) => 칸바로놓기(cells.map(([x, y]) => [-x, y] as GridPoint));
export const 위아래뒤집기 = (cells: GridPoint[]) => 칸바로놓기(cells.map(([x, y]) => [x, -y] as GridPoint));
export const 놓인칸 = (cells: GridPoint[], offset: GridPoint) => cells.map(([x, y]) => [x + offset[0], y + offset[1]] as GridPoint);

/** 자의 왼쪽 가장자리에서 0 눈금까지(mm). 실제 자처럼 0이 가장자리보다 안쪽에 있습니다. */
export const 자여백 = 6;

// ── 공통 ──────────────────────────────────────────────────────────
const 길이말 = (mm: number, unit: 'cm' | 'mm') =>
  unit === 'cm' || mm % 10 === 0 ? `${mm / 10} cm` : mm < 10 ? `${mm} mm` : `${Math.floor(mm / 10)} cm ${mm % 10} mm`;
export { 길이말 };

const 각차 = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return Math.min(d, 360 - d);
};
export const 시각말 = (h: number, m: number) => `${h}시${m ? ` ${m}분` : ''}`;
/** 바늘의 각도에서 읽은 시각(짧은바늘은 지나온 숫자를 읽습니다) */
const 바늘읽기 = (hourDeg: number, minuteDeg: number) => {
  const m = Math.round(((minuteDeg % 360) + 360) % 360 / 6) % 60;
  // 긴바늘만큼 앞서 간 몫을 빼고 시를 읽습니다.
  const base = ((hourDeg - m / 2) % 360 + 360) % 360;
  const h = Math.round(base / 30) % 12 || 12;
  return { h, m };
};

/** 채점합니다. 기록에 남는 말의 조사도 여기서 고릅니다. */
export const 채점 = (m: Manipulation, s: ManipState): ManipResult => {
  const r = 채점하기(m, s);
  return { ...r, said: resolveParticles(r.said), ...(r.tip ? { tip: resolveParticles(r.tip) } : {}) };
};

const 채점하기 = (m: Manipulation, s: ManipState): ManipResult => {
  if (m.kind === 'ruler-measure' && s.kind === 'ruler-measure') {
    const 맞춤 = s.rulerAt === m.objectStartMm;
    const 읽음 = s.endTick;
    if (읽음 === null) return { ok: false, said: '끝 눈금을 누르지 않음', tip: '자를 맞춘 다음, 물건의 오른쪽 끝에 있는 눈금을 눌러요.' };
    const said = `자의 0을 ${맞춤 ? '왼쪽 끝에 맞추고' : '맞추지 않고'} ${길이말(읽음, m.unit)}을(를) 읽음`;
    if (맞춤 && 읽음 === m.objectMm) return { ok: true, said };
    if (s.rulerAt === m.objectStartMm + 자여백) return { ok: false, said, tip: '자의 끝(가장자리)에 맞추었어요. 자의 끝이 아니라 0 눈금을 물건의 끝에 맞추어야 해요.' };
    if (s.rulerAt === m.objectStartMm - 10) return { ok: false, said, tip: '자의 1에 끝을 맞추었어요. 길이를 잴 때는 0 눈금에 맞추어야 해요.' };
    if (!맞춤) return { ok: false, said, tip: '먼저 자를 밀어 0 눈금을 물건의 왼쪽 끝에 꼭 맞추세요.' };
    return { ok: false, said, tip: m.unit === 'mm' ? '큰 눈금(cm)을 먼저 읽고, 작은 눈금(mm)이 몇 칸 더 있는지 세어 보세요.' : '물건의 오른쪽 끝과 딱 맞닿은 눈금을 다시 찾아보세요.' };
  }
  if (m.kind === 'ruler-draw' && s.kind === 'ruler-draw') {
    const 길이 = s.end - m.fromMm;
    const said = `${길이말(Math.abs(길이), m.unit)}만큼 ${m.tool === 'compass' ? '벌림' : '그음'}`;
    if (길이 === m.lengthMm) return { ok: true, said };
    if (s.end === m.lengthMm && m.fromMm !== 0) return { ok: false, said, tip: `${길이말(m.fromMm, m.unit)}에서 시작했으니 끝 눈금은 그만큼 더 가야 해요.` };
    if (m.tool === 'compass' && 길이 === m.lengthMm * 2) return { ok: false, said, tip: '컴퍼스는 반지름만큼 벌려요. 지름의 반이 반지름이에요.' };
    return { ok: false, said, tip: '시작한 눈금에서 몇 칸을 갔는지 세어 보세요.' };
  }
  if (m.kind === 'clock' && s.kind === 'clock') {
    const 읽음 = 바늘읽기(s.hourDeg, s.minuteDeg);
    // 짧은바늘이 놓인 자리를 그대로 적습니다(틀린 시계는 시각으로 읽히지 않을 수 있습니다).
    const 짧은자리 = ((s.hourDeg % 360) + 360) % 360 / 30;
    const 짧은말 = Number.isInteger(짧은자리) ? `${짧은자리 || 12}을(를) 가리키게` : `${Math.floor(짧은자리) || 12}과(와) ${Math.floor(짧은자리) + 1} 사이에`;
    const said = `긴바늘은 ${읽음.m}분, 짧은바늘은 ${짧은말} 놓음`;
    const 긴맞음 = 각차(s.minuteDeg, m.m * 6) < 1;
    const 짧은목표 = (m.h % 12) * 30 + m.m / 2;
    const 짧은맞음 = 각차(s.hourDeg, 짧은목표) <= 8;
    if (긴맞음 && 짧은맞음) return { ok: true, said: `${시각말(m.h, m.m)}으로 맞춤` };
    if (각차(s.minuteDeg, 짧은목표) <= 8 && 각차(s.hourDeg, m.m * 6) <= 8) return { ok: false, said, tip: '긴바늘과 짧은바늘을 바꾸어 놓았어요. 긴바늘은 분, 짧은바늘은 시를 나타내요.' };
    if (긴맞음 && m.m >= 20 && 각차(s.hourDeg, (m.h % 12) * 30) <= 3) return { ok: false, said, tip: `${m.m}분일 때 짧은바늘은 ${m.h}을(를) 정확히 가리키지 않고 ${m.h}과(와) ${(m.h % 12) + 1} 사이에 있어요.` };
    if (긴맞음 && 각차(s.hourDeg, ((m.h % 12) + 1) * 30) <= 8) return { ok: false, said, tip: '짧은바늘이 다음 숫자에 너무 가까워요. 짧은바늘은 지나온 숫자가 시를 나타내요.' };
    if (!긴맞음) return { ok: false, said, tip: m.m === 0 ? '몇 시일 때 긴바늘은 12를 가리켜요.' : `긴바늘이 숫자 1을 가리키면 5분이에요. 5분씩 세어 ${m.m}분을 찾아보세요.` };
    return { ok: false, said, tip: `짧은바늘을 ${m.h} 근처로 옮겨 보세요.` };
  }
  if (m.kind === 'grid-point' && s.kind === 'grid-point') {
    if (!s.pt) return { ok: false, said: '점을 찍지 않음', tip: '알맞은 자리의 점을 눌러요.' };
    const pt = s.pt;
    const ok = m.target.some((t) => 같은점(t, pt));
    const said = `(${pt[0]}, ${pt[1]})에 점을 찍음`;
    if (ok) return { ok: true, said };
    const t = m.target[0];
    const dx = pt[0] - t[0];
    const dy = pt[1] - t[1];
    const 방향 = [dx ? `${dx > 0 ? '왼쪽' : '오른쪽'}으로 ${Math.abs(dx)}칸` : '', dy ? `${dy > 0 ? '위쪽' : '아래쪽'}으로 ${Math.abs(dy)}칸` : ''].filter(Boolean).join(', ');
    return { ok: false, said, tip: Math.abs(dx) + Math.abs(dy) === 1 ? '한 칸 차이예요. 칸을 셀 때 점이 아니라 칸(사이)을 세어 보세요.' : `알맞은 자리는 찍은 점에서 ${방향}이에요. 칸을 하나씩 세어 다시 찍어 보세요.` };
  }
  if (m.kind === 'grid-draw' && s.kind === 'grid-draw') return 그림채점(m.goal, m.fixed, s.segs);
  if (m.kind === 'shape-move' && s.kind === 'shape-move') {
    const 지금 = 놓인칸(s.cells, s.offset);
    const 모양맞음 = 칸글(칸바로놓기(s.cells)) === 칸글(칸바로놓기(m.goal.cells));
    const 자리맞음 = 칸글(지금) === 칸글(m.goal.cells);
    const 처음그대로 = 칸글(칸바로놓기(s.cells)) === 칸글(칸바로놓기(m.cells));
    const said = `${처음그대로 ? '모양은 그대로' : '모양을 바꾸어'} (${s.offset[0]}, ${s.offset[1]}) 자리에 놓음`;
    if (m.goal.place ? 자리맞음 : 모양맞음) return { ok: true, said };
    if (!모양맞음) {
      const 시계 = 칸글(시계로돌리기(m.cells)) === 칸글(칸바로놓기(s.cells));
      const 반대 = 칸글(반대로돌리기(m.cells)) === 칸글(칸바로놓기(s.cells));
      return {
        ok: false,
        said,
        tip: 시계 || 반대
          ? `${시계 ? '시계 방향' : '시계 반대 방향'}으로 90°만큼 돌린 모양이에요. 돌리는 방향과 횟수를 다시 생각해 보세요.`
          : '모양이 달라요. 도형의 한 변(또는 한 칸)에 표시를 해 두고, 그 변이 어디로 가는지 따라가 보세요.',
      };
    }
    return { ok: false, said, tip: '모양은 맞아요. 이제 칸 수를 세어 알맞은 자리로 옮겨 보세요.' };
  }
  if (m.kind === 'number-line' && s.kind === 'number-line') {
    if (s.at === null) return { ok: false, said: '점을 놓지 않음', tip: '알맞은 눈금을 눌러 점을 놓아요.' };
    const said = `${s.at}번째 작은 눈금에 놓음`;
    if (s.at === m.target) return { ok: true, said };
    return { ok: false, said, tip: Math.abs(s.at - m.target) === 1 ? '한 눈금 차이예요. 0에서부터 작은 눈금을 하나씩 다시 세어 보세요.' : '큰 눈금 사이가 몇 칸으로 나뉘었는지 먼저 세고, 한 칸의 크기를 생각해 보세요.' };
  }
  if (m.kind === 'tap-fill' && s.kind === 'tap-fill') {
    const n = new Set([...m.pre, ...s.on]).size;
    const said = `${n}칸을 채움`;
    if (n === m.target) return { ok: true, said };
    return { ok: false, said, tip: n > m.target ? `${n - m.target}칸을 더 칠했어요.` : `${m.target - n}칸이 모자라요.` };
  }
  if (m.kind === 'base-ten' && s.kind === 'base-ten') {
    const v = s.counts.reduce((sum, c, i) => sum + c * m.places[i], 0);
    const said = `${v}을(를) 만듦`;
    if (v === m.target) return { ok: true, said };
    return { ok: false, said, tip: '자리마다 모형의 수를 세어 보세요. 그 자리의 숫자만큼 모형이 있어야 해요.' };
  }
  if (m.kind === 'bars' && s.kind === 'bars') {
    const 틀린 = m.values.map((v, i) => (s.vals[i] === v ? -1 : i)).filter((i) => i >= 0);
    const said = s.vals.map((v, i) => `${m.labels[i]} ${v ?? '-'}`).join(', ');
    if (!틀린.length) return { ok: true, said };
    const i = 틀린[0];
    const v = s.vals[i];
    return {
      ok: false,
      said,
      tip: v !== null && m.step > 1 && v === m.values[i] * m.step ? `눈금 한 칸은 ${m.step}${m.unitLabel}이에요. 칸 수가 아니라 눈금의 값을 읽어 보세요.` : `'${m.labels[i]}'의 ${m.style === 'line' ? '점' : '막대'}이(가) 맞지 않아요. 표의 수를 다시 보세요.`,
    };
  }
  if (m.kind === 'angle' && s.kind === 'angle') {
    const said = `${s.deg}°인 각을 만듦`;
    const ok = m.target !== undefined ? s.deg === m.target : s.deg > m.range![0] && s.deg < m.range![1];
    if (ok) return { ok: true, said };
    if (m.target !== undefined && s.deg === 180 - m.target) return { ok: false, said, tip: '각도기의 바깥쪽 눈금과 안쪽 눈금을 바꾸어 읽었어요. 0에서 시작하는 눈금을 따라 읽어요.' };
    if (m.range) return { ok: false, said, tip: m.range[1] <= 90 ? '예각은 0°보다 크고 직각(90°)보다 작은 각이에요.' : '둔각은 직각(90°)보다 크고 180°보다 작은 각이에요.' };
    return { ok: false, said, tip: '변 하나를 0에 맞춘 다음, 그 0에서 시작하는 눈금을 따라 읽어 보세요.' };
  }
  if (m.kind === 'sort-bins' && s.kind === 'sort-bins') {
    const 틀린 = m.items.map((it, i) => (s.placed[i] === it.bin ? -1 : i)).filter((i) => i >= 0);
    const said = `${m.items.length - 틀린.length}개를 바르게 나눔`;
    if (!틀린.length) return { ok: true, said };
    const 안놓음 = 틀린.filter((i) => s.placed[i] === null).length;
    return { ok: false, said, tip: 안놓음 ? `아직 옮기지 않은 것이 ${안놓음}개 있어요.` : `'${m.items[틀린[0]].label}'을(를) 다시 살펴보세요. 나누는 기준에 맞는지 생각해 보세요.` };
  }
  if (m.kind === 'stack-build' && s.kind === 'stack-build') return 쌓기채점(m, s.h);
  return { ok: false, said: '알 수 없는 조작' };
};

// ── 쌓기나무 ──────────────────────────────────────────────────────
// 0번 줄이 뒤, 마지막 줄이 앞입니다. 옆(오른쪽)에서 보면 앞쪽 줄이 왼쪽에 옵니다.
export const 앞에서본 = (h: number[][]) => h[0].map((_, c) => Math.max(...h.map((row) => row[c])));
export const 옆에서본 = (h: number[][]) => [...h].reverse().map((row) => Math.max(...row));
export const 위에서본 = (h: number[][]) => h.map((row) => row.map((v) => v > 0));
const 개수 = (h: number[][]) => h.flat().reduce((a, b) => a + b, 0);
const 째말 = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
const 같은판 = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const 쌓기채점 = (m: Extract<Manipulation, { kind: 'stack-build' }>, h: number[][]): ManipResult => {
  const n = 개수(h);
  const said = `쌓기나무 ${n}개로 쌓음(${h.map((row) => row.join('')).join('/')})`;
  if (n === 0) return { ok: false, said: '쌓지 않음', tip: '아래 칸을 누를 때마다 그 자리에 쌓기나무가 한 층씩 올라가요.' };
  if (m.check === 'exact') {
    if (같은판(h, m.target)) return { ok: true, said };
    const 적음 = n < 개수(m.target);
    const 다른곳 = h.flatMap((row, r) => row.map((v, c) => (v !== m.target[r][c] ? [r, c] : null))).filter(Boolean).length;
    return {
      ok: false,
      said,
      tip: m.show === 'layers'
        ? '1층, 2층, 3층 그림을 차례로 보고, 칸마다 몇 층까지 색칠되어 있는지 세어 그만큼 쌓아요.'
        : 적음 ? `쌓기나무가 모자라요(${다른곳}곳이 달라요). 앞에 있는 쌓기나무에 가려진 뒤쪽 칸도 아래층부터 받쳐 주어야 해요.` : `${다른곳}곳의 층수가 달라요. 그림에서 칸마다 가장 위에 보이는 쌓기나무가 몇 층에 있는지 세어 보세요.`,
    };
  }
  const 앞 = 앞에서본(h);
  const 옆 = 옆에서본(h);
  const 목앞 = 앞에서본(m.target);
  const 목옆 = 옆에서본(m.target);
  if (!같은판(위에서본(h), 위에서본(m.target))) return { ok: false, said, tip: '위에서 본 모양과 쌓기나무가 놓인 자리가 달라요. 위에서 본 모양의 칸에만, 빠짐없이 쌓아요.' };
  const 앞틀린 = 앞.findIndex((v, i) => v !== 목앞[i]);
  if (앞틀린 >= 0) return { ok: false, said, tip: `앞에서 본 모양이 달라요. 왼쪽에서 ${째말[앞틀린]} 세로줄의 가장 높은 곳이 ${목앞[앞틀린]}층이어야 하는데 ${앞[앞틀린]}층이에요.` };
  const 옆틀린 = 옆.findIndex((v, i) => v !== 목옆[i]);
  if (옆틀린 >= 0) return { ok: false, said, tip: `옆에서 본 모양이 달라요. 앞쪽에서 ${째말[옆틀린]} 가로줄의 가장 높은 곳이 ${목옆[옆틀린]}층이어야 하는데 ${옆[옆틀린]}층이에요.` };
  if (m.check !== 'views' && m.count !== undefined && n !== m.count) {
    return {
      ok: false,
      said,
      tip: m.check === 'views-min'
        ? `본 모양은 모두 맞아요. 그런데 ${n}개를 썼어요. 줄마다 가장 높은 층이 한 번씩만 나오면 되니, 나머지 칸은 더 낮출 수 있는지 보세요.`
        : `본 모양은 모두 맞아요. 그런데 ${n}개를 썼어요. 칸마다 앞에서 본 층수와 옆에서 본 층수 가운데 작은 쪽까지 쌓을 수 있어요.`,
    };
  }
  return { ok: true, said };
};

/** 본 모양(위·앞·옆)이 같은 쌓기 가운데 가장 적은·많은 개수입니다(칸마다 1층부터 차례로 따져 봅니다). */
export const 본모양개수 = (target: number[][], 어느: 'min' | 'max'): number => {
  const 앞 = 앞에서본(target);
  const 옆 = 옆에서본(target);
  const rows = target.length;
  const 칸들 = target.flatMap((row, r) => row.map((v, c) => (v > 0 ? [r, c] : null))).filter((x): x is number[] => x !== null);
  const 위 = 칸들.map(([r, c]) => Math.min(앞[c], 옆[rows - 1 - r]));
  let 답 = 어느 === 'min' ? Infinity : -Infinity;
  const h = target.map((row) => row.map(() => 0));
  const 돌기 = (k: number) => {
    if (k === 칸들.length) {
      if (같은판(앞에서본(h), 앞) && 같은판(옆에서본(h), 옆)) {
        const n = 개수(h);
        답 = 어느 === 'min' ? Math.min(답, n) : Math.max(답, n);
      }
      return;
    }
    const [r, c] = 칸들[k];
    for (let v = 1; v <= 위[k]; v += 1) { h[r][c] = v; 돌기(k + 1); }
    h[r][c] = 0;
  };
  돌기(0);
  return 답;
};

/** 아무것도 하지 않은 처음 상태입니다. */
export const 처음상태 = (m: Manipulation): ManipState => {
  switch (m.kind) {
    case 'ruler-measure': return { kind: m.kind, rulerAt: m.objectStartMm + (m.objectStartMm >= 30 ? -25 : 35), endTick: null };
    case 'ruler-draw': return { kind: m.kind, end: m.fromMm };
    case 'clock': return { kind: m.kind, hourDeg: 0, minuteDeg: 0 };
    case 'grid-point': return { kind: m.kind, pt: null };
    case 'grid-draw': return { kind: m.kind, segs: [] };
    case 'shape-move': return { kind: m.kind, cells: 칸바로놓기(m.cells), offset: m.start };
    case 'number-line': return { kind: m.kind, at: null };
    case 'tap-fill': return { kind: m.kind, on: [] };
    case 'base-ten': return { kind: m.kind, counts: m.places.map(() => 0) };
    case 'bars': return { kind: m.kind, vals: m.values.map((v, i) => (m.pre.includes(i) ? v : null)) };
    // 처음에는 왼쪽으로 펼쳐 둡니다(180°는 어떤 문제의 답도 아닙니다).
    case 'angle': return { kind: m.kind, deg: 180 };
    case 'sort-bins': return { kind: m.kind, placed: m.items.map(() => null) };
    case 'stack-build': return { kind: m.kind, h: m.target.map((row) => row.map(() => 0)) };
    default: return { kind: 'grid-point', pt: null };
  }
};

/** 바르게 한 모습 하나입니다(틀렸을 때 보여 줍니다). 답이 여럿이면 그 가운데 하나입니다. */
export const 정답모습 = (m: Manipulation): ManipState => {
  switch (m.kind) {
    case 'ruler-measure': return { kind: m.kind, rulerAt: m.objectStartMm, endTick: m.objectMm };
    case 'ruler-draw': return { kind: m.kind, end: m.fromMm + m.lengthMm };
    case 'clock': return { kind: m.kind, hourDeg: (m.h % 12) * 30 + m.m / 2, minuteDeg: m.m * 6 };
    case 'grid-point': return { kind: m.kind, pt: m.target[0] };
    case 'grid-draw': {
      const g = m.goal;
      const segs = g.type === 'exact' ? g.segs : m.example ?? [];
      return { kind: m.kind, segs };
    }
    case 'shape-move': {
      const cells = 칸바로놓기(m.goal.cells);
      const x0 = Math.min(...m.goal.cells.map((c) => c[0]));
      const y0 = Math.min(...m.goal.cells.map((c) => c[1]));
      return { kind: m.kind, cells, offset: m.goal.place ? [x0, y0] : m.start };
    }
    case 'number-line': return { kind: m.kind, at: m.target };
    case 'tap-fill': {
      const on: number[] = [];
      for (let k = 0; on.length + m.pre.length < m.target && k < m.parts; k += 1) if (!m.pre.includes(k)) on.push(k);
      return { kind: m.kind, on };
    }
    case 'base-ten': {
      let rest = m.target;
      return { kind: m.kind, counts: m.places.map((p) => { const c = Math.floor(rest / p); rest -= c * p; return c; }) };
    }
    case 'bars': return { kind: m.kind, vals: [...m.values] };
    case 'angle': return { kind: m.kind, deg: m.target ?? Math.round((m.range![0] + m.range![1]) / 10) * 5 };
    case 'sort-bins': return { kind: m.kind, placed: m.items.map((it) => it.bin) };
    case 'stack-build': return { kind: m.kind, h: 쌓기본보기(m) };
    default: return 처음상태(m);
  }
};

/** 쌓기 문항의 바른 모습 하나: 꼭 같게면 target, 가장 적게면 줄마다 가장 높은 층이 한 번씩 나오게, 가장 많게면 칸마다 작은 쪽까지. */
const 쌓기본보기 = (m: Extract<Manipulation, { kind: 'stack-build' }>): number[][] => {
  if (m.check === 'exact' || m.check === 'views') return m.target.map((row) => [...row]);
  const 앞 = 앞에서본(m.target);
  const 옆 = 옆에서본(m.target);
  const rows = m.target.length;
  if (m.check === 'views-max') return m.target.map((row, r) => row.map((v, c) => (v > 0 ? Math.min(앞[c], 옆[rows - 1 - r]) : 0)));
  // 가장 적게: 가능한 쌓기 가운데 개수가 count인 것을 찾습니다.
  const 칸들 = m.target.flatMap((row, r) => row.map((v, c) => (v > 0 ? [r, c] : null))).filter((x): x is number[] => x !== null);
  const h = m.target.map((row) => row.map(() => 0));
  let 찾음: number[][] | null = null;
  const 돌기 = (k: number) => {
    if (찾음) return;
    if (k === 칸들.length) {
      if (같은판(앞에서본(h), 앞) && 같은판(옆에서본(h), 옆) && h.flat().reduce((a, b) => a + b, 0) === m.count) 찾음 = h.map((row) => [...row]);
      return;
    }
    const [r, c] = 칸들[k];
    for (let v = 1; v <= Math.min(앞[c], 옆[rows - 1 - r]); v += 1) { h[r][c] = v; 돌기(k + 1); }
    h[r][c] = 0;
  };
  돌기(0);
  return 찾음 ?? m.target.map((row) => [...row]);
};
