import type { GridPoint, Manipulation } from '../../types';
import { 채점, 정답모습, 시계로돌리기, 반대로돌리기, 좌우뒤집기, 위아래뒤집기, type ManipState } from './check';
import type { 조작갈래, 조작틀 } from './common';

// ════════════════════════════════════════════════════════════════════
// 상 수준: 친구의 틀린 조작 고치기(오류 분석)
// ────────────────────────────────────────────────────────────────────
// 같은 문제를 친구가 먼저 해 두었는데 틀렸습니다. 아이는 친구가 한 것을
// 문제의 조건과 하나씩 맞추어 보고(비판적으로 따지기), 어디가 왜 틀렸는지
// 찾아 바르게 고칩니다. 친구의 실수는 그 조작에서 아이들이 실제로 자주 하는
// 실수로 만듭니다(자의 1 눈금에 맞추기, 짧은바늘을 정각 숫자에 두기,
// 받아올림 안 하기, 각도기의 반대쪽 눈금 읽기, 날수를 하루 더 세기 등).
// 문제 자체는 그 차시의 상 문항 그대로라 배우지 않은 수나 말이 나오지 않습니다.
// ════════════════════════════════════════════════════════════════════

type 실수 = { state: ManipState; 말: string };

const 각 = (d: number) => ((d % 360) + 360) % 360;

/** 조작마다 흔한 실수 후보를 차례로 냅니다. 채점에서 틀린 것으로 나오는 첫 후보를 씁니다. */
const 실수후보 = (m: Manipulation, seed: number): 실수[] => {
  const 바른 = 정답모습(m);
  const 뒤집기 = seed % 2 === 1;
  switch (m.kind) {
    case 'ruler-measure': {
      if (바른.kind !== 'ruler-measure') return [];
      const 끝 = 바른.endTick ?? m.objectMm;
      return [
        ...(m.objectStartMm >= 10 ? [{ state: { ...바른, rulerAt: m.objectStartMm - 10, endTick: 끝 + 10 }, 말: '자의 0이 아니라 1 눈금을 물건의 왼쪽 끝에 맞추고 오른쪽 끝의 눈금을 그대로 읽었습니다.' }] : []),
        { state: { ...바른, endTick: 끝 + 10 }, 말: '물건의 오른쪽 끝을 지나 다음 눈금을 읽었습니다.' },
      ];
    }
    case 'ruler-draw': {
      if (바른.kind !== 'ruler-draw') return [];
      const 길게 = 바른.end + 10 <= m.rulerCm * 10;
      return [{ state: { ...바른, end: 길게 ? 바른.end + 10 : 바른.end - 10 }, 말: 길게 ? (m.fromMm > 0 ? '시작한 눈금을 1로 세어 1 cm 더 길게 그었습니다.' : '0 눈금이 아니라 1 눈금부터 세어 1 cm 더 길게 그었습니다.') : '눈금 한 칸(1 cm)을 덜 세어 짧게 그었습니다.' }];
    }
    case 'clock': {
      const 시 = (m.h % 12) * 30;
      const 분 = m.m * 6;
      const 짧은 = 시 + m.m / 2;
      const out: 실수[] = [];
      if (m.m >= 20) out.push({ state: { kind: 'clock', hourDeg: 시, minuteDeg: 분 }, 말: `${m.m}분인데 짧은바늘을 ${m.h}에 딱 맞추어 놓았습니다. 짧은바늘은 ${m.h}과(와) ${(m.h % 12) + 1} 사이에 있어야 합니다.` });
      out.push({ state: { kind: 'clock', hourDeg: 각(분), minuteDeg: 각(짧은) }, 말: '긴바늘과 짧은바늘을 바꾸어 놓았습니다. 긴바늘은 분, 짧은바늘은 시를 나타냅니다.' });
      out.push({ state: { kind: 'clock', hourDeg: 짧은, minuteDeg: 각(분 - 30) }, 말: '긴바늘을 숫자 여섯 칸만큼 덜 돌려 놓았습니다.' });
      return out;
    }
    case 'grid-point': {
      if (바른.kind !== 'grid-point' || !바른.pt) return [];
      const [x, y] = 바른.pt;
      const 옆: GridPoint[] = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      return 옆.filter(([a, b]) => a >= 0 && b >= 0 && a <= m.cols && b <= m.rows).map((pt) => ({ state: { kind: 'grid-point' as const, pt }, 말: '칸을 하나 잘못 세어 바로 옆 점에 찍었습니다.' }));
    }
    case 'grid-draw': {
      if (바른.kind !== 'grid-draw' || !바른.segs.length) return [];
      if (바른.segs.length === 1) {
        // 선 하나를 긋는 문항(수직·평행·직각 등): 끝점을 한 칸 비껴 비스듬하게 긋는 실수입니다.
        const [[a, b], [c, d]] = 바른.segs[0];
        const 비낀: GridPoint[] = [[c + 1, d], [c, d + 1], [c - 1, d], [c, d - 1]];
        return 비낀.filter(([x, y]) => x >= 0 && y >= 0 && x <= m.cols && y <= m.rows && !(x === a && y === b))
          .map((끝) => ({ state: { ...바른, segs: [[[a, b], 끝]] as typeof 바른.segs }, 말: '선의 끝점을 한 칸 비껴 찍어 선이 비스듬해졌습니다. 그래서 문제의 조건을 만족하지 않습니다.' }));
      }
      const k = seed % 바른.segs.length;
      return [{ state: { ...바른, segs: 바른.segs.filter((_, i) => i !== k) }, 말: '선분 하나를 빠뜨려 조건에 맞는 모양이 되지 않았습니다.' }];
    }
    case 'shape-move': {
      if (바른.kind !== 'shape-move') return [];
      const [x, y] = 바른.offset;
      // 모양을 바꾸는 문항: 돌리는 방향이나 뒤집는 방향을 반대로 생각한 실수입니다.
      const 모양실수: 실수[] = [
        { state: { ...바른, cells: 반대로돌리기(바른.cells) }, 말: '도형을 돌리는 방향이나 횟수를 잘못 생각했습니다.' },
        { state: { ...바른, cells: 시계로돌리기(바른.cells) }, 말: '도형을 돌리는 방향이나 횟수를 잘못 생각했습니다.' },
        { state: { ...바른, cells: 좌우뒤집기(바른.cells) }, 말: '뒤집는 방향을 반대로 생각했습니다. 오른쪽(왼쪽)으로 뒤집으면 왼쪽과 오른쪽이 바뀝니다.' },
        { state: { ...바른, cells: 위아래뒤집기(바른.cells) }, 말: '뒤집는 방향을 반대로 생각했습니다. 위쪽(아래쪽)으로 뒤집으면 위와 아래가 바뀝니다.' },
      ];
      return [
        ...(m.goal.place ? [{ state: { ...바른, offset: [x + 1, y] as GridPoint }, 말: '한 칸 더 옮겼습니다.' }, { state: { ...바른, offset: [x, y + 1] as GridPoint }, 말: '한 칸 더 옮겼습니다.' }] : []),
        ...모양실수,
      ];
    }
    case 'number-line': {
      const 맞음 = new Set(m.targets ?? [m.target]);
      // 조건에 맞는 수가 여럿이면, 조건 하나만 보고 바로 밖의 수를 고른 실수로 만듭니다.
      const 밖 = [m.target + 1, m.target - 1, Math.min(...맞음) - 1, Math.max(...맞음) + 1].filter((v) => v >= 0 && v <= m.ticks && !맞음.has(v));
      return 밖.map((at) => ({ state: { kind: 'number-line' as const, at }, 말: m.targets ? '조건 가운데 하나만 보고 수를 골라, 다른 조건을 만족하지 않는 수에 점을 놓았습니다.' : '눈금을 한 칸 잘못 세어 점을 놓았습니다.' }));
    }
    case 'tap-fill': {
      if (바른.kind !== 'tap-fill') return [];
      const 미리 = new Set(m.pre);
      const 빈 = Array.from({ length: m.parts }, (_, k) => k).filter((k) => !미리.has(k) && !바른.on.includes(k));
      const out: 실수[] = [];
      if (m.exact && 바른.on.length && 빈.length) {
        // 칠할 자리가 정해진 문항: 한 칸을 엉뚱한 자리에 칠합니다.
        out.push({ state: { ...바른, on: [...바른.on.slice(0, -1), 빈[seed % 빈.length]] }, 말: '한 칸을 알맞지 않은 자리에 칠했습니다.' });
      }
      // 미리 있는 것까지 다시 세지 않고, 모두의 수만큼 더 놓는 실수입니다.
      // 10을 배우기 전 단원에서 판에 10개 넘게 놓이지 않도록 합칠 수를 9까지로 둡니다.
      if (!m.exact && m.pre.length && m.target <= 빈.length + 바른.on.length && (m.parts > 10 || m.pre.length + m.target <= 9)) {
        const 더 = [...바른.on, ...빈].slice(0, m.target);
        out.push({ state: { ...바른, on: 더 }, 말: `이미 있던 ${m.pre.length}칸을 생각하지 않고 ${m.target}칸을 더 채웠습니다.` });
      }
      const 하나더 = 뒤집기 && 빈.length > 0 && (m.parts > 10 || m.pre.length + 바른.on.length + 1 <= 9);
      if (바른.on.length) out.push({ state: { ...바른, on: 하나더 ? [...바른.on, 빈[0]] : 바른.on.slice(0, -1) }, 말: 하나더 ? '하나를 더 세어 한 칸을 더 채웠습니다.' : '하나를 덜 세어 한 칸이 모자랍니다.' });
      return out;
    }
    case 'base-ten': {
      if (바른.kind !== 'base-ten') return [];
      const c = 바른.counts;
      const out: 실수[] = [];
      // 받아올림(바꾸기)을 하지 않아 아랫자리 모형이 10개를 넘는 실수입니다.
      const 위 = c.findIndex((v, i) => i + 1 < c.length && v >= 1 && c[i + 1] + 10 <= 19);
      const 풀기 = (i: number) => ({ state: { ...바른, counts: c.map((v, k) => (k === i ? v - 1 : k === i + 1 ? v + 10 : v)) }, 말: '아랫자리 모형이 10개가 넘었는데 윗자리 모형 1개로 바꾸지 않고 그대로 두었습니다.' });
      // 두 자리의 모형 수를 서로 바꾸어 놓는 실수입니다(자릿값 헷갈리기).
      const 바꿀 = c.findIndex((v, i) => i + 1 < c.length && v !== c[i + 1]);
      const 바꾸기 = (i: number) => ({ state: { ...바른, counts: c.map((v, k) => (k === i ? c[i + 1] : k === i + 1 ? c[i] : v)) }, 말: '두 자리의 모형 수를 서로 바꾸어 놓았습니다. 자리마다 나타내는 크기가 달라요.' });
      if (!m.trade && 바꿀 >= 0) out.push(바꾸기(바꿀));
      if (위 >= 0) out.push(풀기(위));
      if (m.trade && 바꿀 >= 0) out.push(바꾸기(바꿀));
      out.push({ state: { ...바른, counts: c.map((v, k) => (k === c.length - 1 ? v + 1 : v)) }, 말: '가장 낮은 자리 모형을 하나 더 놓았습니다.' });
      return 뒤집기 ? out.reverse() : out;
    }
    case 'bars': {
      if (바른.kind !== 'bars') return [];
      const i = m.labels.findIndex((_, k) => !m.pre.includes(k));
      if (i < 0) return [];
      const v = 바른.vals[i] ?? 0;
      const 더 = v + m.step <= m.max;
      return [{ state: { ...바른, vals: 바른.vals.map((x, k) => (k === i ? (더 ? v + m.step : v - m.step) : x)) }, 말: `${m.labels[i]}의 막대를 눈금 한 칸만큼 ${더 ? '더' : '덜'} 그렸습니다.` }];
    }
    case 'angle': {
      if (m.target !== undefined) {
        const out: 실수[] = [];
        if (m.protractor && m.target !== 90 && m.target < 180) out.push({ state: { kind: 'angle', deg: 180 - m.target }, 말: `각도기의 반대쪽 눈금을 읽어 ${180 - m.target}°로 그렸습니다. 0에서 시작한 쪽의 눈금을 읽어야 합니다.` });
        out.push({ state: { kind: 'angle', deg: m.target + 10 }, 말: '각을 10°만큼 더 벌렸습니다.' });
        return out;
      }
      const [lo, hi] = m.range!;
      return [
        { state: { kind: 'angle', deg: hi === 90 ? 90 : lo === 90 ? 90 : hi + 10 }, 말: '조건의 경계에 있는 각을 그렸습니다. 경계의 각은 조건에 들어가지 않습니다.' },
        { state: { kind: 'angle', deg: hi + 10 }, 말: '조건보다 큰 각을 그렸습니다.' },
      ];
    }
    case 'sort-bins': {
      if (바른.kind !== 'sort-bins') return [];
      const i = 바른.placed.findIndex((b) => b !== 바른.placed[0]);
      if (i < 0) return [];
      const placed = [...바른.placed];
      [placed[0], placed[i]] = [placed[i], placed[0]];
      return [{ state: { ...바른, placed }, 말: `${m.items[0].label}과(와) ${m.items[i].label}을(를) 서로 바뀐 곳에 넣었습니다.` }];
    }
    case 'stack-build': {
      if (바른.kind !== 'stack-build') return [];
      const h = 바른.h.map((row) => [...row]);
      const r = h.length - 1;
      const c = h[r].length - 1;
      if (m.check !== 'exact') {
        h[r] = h[r].map(() => 0);
        return [{ state: { ...바른, h }, 말: '앞에서 본 모양을 보지 않아 앞줄 쌓기나무를 빠뜨렸습니다.' }];
      }
      h[r][c] = h[r][c] >= m.maxH ? h[r][c] - 1 : h[r][c] + 1;
      return [{ state: { ...바른, h }, 말: '앞줄 맨 오른쪽 자리의 층수를 잘못 세었습니다. 뒤에 가려진 쌓기나무와 층을 하나씩 세어야 합니다.' }];
    }
    case 'cube-net': {
      if (바른.kind !== 'cube-net') return [];
      if (바른.picked) {
        const 다른 = m.given.find((c) => c[0] !== 바른.picked![0] || c[1] !== 바른.picked![1]);
        return 다른 ? [{ state: { ...바른, picked: 다른 }, 말: '이웃한 면을 마주 보는 면으로 골랐습니다. 접으면 이웃한 면은 서로 맞닿습니다.' }] : [];
      }
      return 바른.cells.length > m.given.length ? [{ state: { ...바른, cells: 바른.cells.slice(0, -1) }, 말: '면 하나를 빠뜨려 접어도 상자가 닫히지 않습니다.' }] : [];
    }
    case 'cylinder-net': {
      if (바른.kind !== 'cylinder-net') return [];
      return m.mode === 'base'
        ? [{ state: { ...바른, bases: 바른.bases.map((b) => ({ ...b, side: 'top' as const })) }, 말: '두 밑면을 모두 같은 쪽에 붙였습니다. 접으면 두 밑면이 서로 마주 보아야 합니다.' }]
        : [{ state: { ...바른, w: 2 * m.r }, 말: '옆면의 가로를 지름과 같게 했습니다. 옆면의 가로는 밑면의 둘레와 같아야 합니다.' }];
    }
    case 'prism-net': {
      if (바른.kind !== 'prism-net') return [];
      if (바른.picked) {
        const 다른 = m.points?.find((x) => x.name !== 바른.picked);
        return 다른 ? [{ state: { ...바른, picked: 다른.name }, 말: '접었을 때 만나지 않는 점을 골랐습니다.' }] : [];
      }
      return m.mode === 'sides' && 바른.strip.length > 1
        ? [{ state: { ...바른, strip: 바른.strip.slice(1) }, 말: '옆면 하나를 빠뜨렸습니다. 옆면의 수는 밑면의 변의 수와 같습니다.' }]
        : [{ state: { ...바른, bases: 바른.bases.map((b) => ({ ...b, side: 'top' as const })) }, 말: '두 밑면을 모두 같은 쪽에 붙였습니다.' }];
    }
    case 'order': {
      if (바른.kind !== 'order' || 바른.seq.length < 2) return [];
      return [
        { state: { ...바른, seq: [...바른.seq].reverse() }, 말: m.expr ? '계산 순서를 거꾸로 했습니다.' : '거꾸로 늘어놓았습니다. 문제에서 큰 것부터인지 작은 것부터인지 다시 보아야 합니다.' },
        { state: { ...바른, seq: [바른.seq[1], 바른.seq[0], ...바른.seq.slice(2)] }, 말: m.expr ? '앞의 두 계산의 순서를 바꾸었습니다.' : '앞의 두 개의 순서를 바꾸어 놓았습니다.' },
      ];
    }
    case 'gauge': {
      if (바른.kind !== 'gauge') return [];
      const 더 = 바른.value + m.minor <= m.max;
      return [{ state: { ...바른, value: 더 ? 바른.value + m.minor : 바른.value - m.minor }, 말: '작은 눈금 한 칸의 크기를 잘못 읽어 한 칸 어긋나게 맞추었습니다.' }];
    }
    case 'pictograph': {
      if (바른.kind !== 'pictograph') return [];
      const i = 바른.big.findIndex((b, k) => b !== 바른.small[k]);
      if (i < 0) return [{ state: { ...바른, big: 바른.big.map((v, k) => (k === 0 ? v + 1 : v)) }, 말: '큰 그림을 하나 더 그렸습니다.' }];
      return [{ state: { ...바른, big: 바른.big.map((v, k) => (k === i ? 바른.small[i] : v)), small: 바른.small.map((v, k) => (k === i ? 바른.big[i] : v)) }, 말: `${m.labels[i]}에서 큰 그림과 작은 그림의 수를 바꾸어 그렸습니다.` }];
    }
    case 'calendar': {
      if (바른.kind !== 'calendar') return [];
      const 밀기 = 바른.picked.every((d) => d + 1 <= m.days);
      return [{ state: { ...바른, picked: 바른.picked.map((d) => (밀기 ? d + 1 : d - 1)) }, 말: 밀기 ? '시작하는 날까지 넣어 세어 하루가 어긋났습니다.' : '하루를 덜 세었습니다.' }];
    }
    case 'share': {
      if (바른.kind !== 'share') return [];
      if (m.groups && 바른.plates.length > 1) return [{ state: { ...바른, plates: 바른.plates.map((v, i) => (i === 0 ? v + 1 : i === 1 ? v - 1 : v)) }, 말: '접시마다 담은 수가 똑같지 않습니다.' }];
      const 남음 = m.total - 바른.plates.reduce((a, b) => a + b, 0);
      return [
        // 남는 것까지 한 접시로 쳐서 몫을 하나 크게 보는 실수입니다.
        ...(남음 > 0 ? [{ state: { ...바른, plates: [...바른.plates, 남음] }, 말: `남은 ${남음}개도 한 접시에 담아 접시 수를 하나 더 세었습니다. 똑같이 ${m.size}개씩 담을 수 없는 것은 남겨 두어야 합니다.` }] : []),
        ...(바른.plates.length > 1 ? [{ state: { ...바른, plates: 바른.plates.slice(0, -1) }, 말: '한 접시를 덜 담고 그만두었습니다.' }] : []),
        ...(m.size && m.size + 1 <= m.total ? [{ state: { ...바른, plates: 바른.plates.map((v, i) => (i === 0 ? v + 1 : v)) }, 말: `첫 접시에 ${m.size}개보다 하나를 더 담았습니다.` }] : []),
      ];
    }
    case 'array': {
      if (바른.kind !== 'array') return [];
      const 더 = 바른.rows < m.maxRows;
      return [{ state: { ...바른, rows: 더 ? 바른.rows + 1 : 바른.rows - 1 }, 말: `줄의 수를 하나 ${더 ? '더' : '덜'} 놓았습니다.` }];
    }
    case 'pattern': {
      if (바른.kind !== 'pattern') return [];
      const i = m.given.findIndex((v) => v === null);
      if (i < 0) return [];
      return [{ state: { ...바른, fill: 바른.fill.map((v, k) => (k === i ? (v! + 1) % m.palette.length : v)) }, 말: '규칙을 이어 가다 한 칸을 잘못 채웠습니다.' }];
    }
    default: return [];
  }
};

/** 그 조작에서 흔한 실수 하나(채점하면 틀린 것)를 고릅니다. 없으면 null입니다. */
export const 친구실수 = (m: Manipulation, seed = 0): 실수 | null => {
  for (const 후보 of 실수후보(m, seed)) {
    if (!채점(m, 후보.state).ok) return 후보;
  }
  return null;
};

/** 실수를 해 둔 동물 친구들입니다. 아이는 친구의 실수를 찾아 고쳐 주는 '실수 탐정'이 됩니다. */
export const 동물친구들: { 이름: string; emoji: string }[] = [
  { 이름: '곰돌이', emoji: '🐻' }, { 이름: '토끼', emoji: '🐰' }, { 이름: '다람쥐', emoji: '🐿️' },
  { 이름: '여우', emoji: '🦊' }, { 이름: '판다', emoji: '🐼' }, { 이름: '펭귄', emoji: '🐧' },
];

/** 갈래의 문항을 '친구가 틀리게 해 둔 것을 고치기'로 바꿉니다. 고칠 실수를 만들 수 없으면 null을 돌려 다른 씨앗을 쓰게 합니다. */
export const 고쳐보기 = (g: 조작갈래): 조작갈래 => ({
  id: `fix-${g.id}`,
  make: (seed, lv) => {
    const t = g.make(seed, lv);
    if (!t) return null;
    if (t.manipulate.friend) return t;
    const 갈래실수 = (t.실수 ?? []).find((x) => !채점(t.manipulate, x.state as ManipState).ok);
    const 실 = 갈래실수 ? { state: 갈래실수.state as ManipState, 말: 갈래실수.말 } : 친구실수(t.manipulate, seed);
    if (!실) {
      // 이미 틀린 모습을 고치는 조작(정육면체 전개도 고치기)은 그대로 고차 문항입니다.
      // 그 밖에 고칠 실수를 만들 수 없으면 이 씨앗은 버리고 다른 문항을 만듭니다.
      return t.manipulate.kind === 'cube-net' && t.manipulate.mode === 'move' ? { ...t, 결: 2 } : null;
    }
    const 친구 = 동물친구들[seed % 동물친구들.length];
    const 고침: 조작틀 = {
      ...t,
      prompt: `${t.prompt} 그런데 ${친구.이름}이(가) 먼저 해 둔 것이 틀렸어요. ${친구.이름}이(가) 무엇을 잘못했는지 찾아 바르게 고쳐 주세요.`,
      manipulate: { ...t.manipulate, friend: { state: 실.state, who: 친구.이름, emoji: 친구.emoji } },
      strategy: `틀린 곳 찾아 고치기(${t.strategy})`,
      hint: `${친구.이름}이(가) 한 것을 문제의 조건과 하나씩 맞추어 보세요. ${t.hint}`,
      steps: [`${친구.이름}은(는) ${실.말}`, ...t.steps] as 조작틀['steps'],
      misconception: `${실.말} ${t.misconception}`,
      selfCheck: `${친구.이름}이(가) 한 것 가운데 맞는 부분과 틀린 부분을 나누어 말할 수 있나요?`,
      결: 2,
    };
    return 고침;
  },
});
