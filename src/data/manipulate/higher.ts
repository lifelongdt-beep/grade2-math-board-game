import type { GridPoint, Manipulation } from '../../types';
import { 채점, 정답모습, 조각들, 시계로돌리기, 반대로돌리기, 좌우뒤집기, 위아래뒤집기, type ManipState } from './check';
import type { 조작갈래, 조작틀 } from './common';
import { 고칠움직임 } from './fixSignature';

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

/** 후보의 차례를 씨앗에 따라 돌립니다. 첫 후보가 늘 같으면 실수의 모양이 하나로 굳습니다. */
const 섞기 = <T,>(후보: T[], seed: number): T[] => {
  if (!후보.length) return 후보;
  const 앞 = Math.abs(seed * 7 + 3) % 후보.length;
  return [...후보.slice(앞), ...후보.slice(0, 앞)];
};

const 각 = (d: number) => ((d % 360) + 360) % 360;

/** 조작마다 흔한 실수 후보를 차례로 냅니다. 채점에서 틀린 것으로 나오는 첫 후보를 씁니다. */
const 실수후보 = (m: Manipulation, seed: number): 실수[] => {
  const 바른 = 정답모습(m);
  const 뒤집기 = seed % 2 === 1;

  switch (m.kind) {
    case 'ruler-measure': {
      if (바른.kind !== 'ruler-measure') return [];
      // 실수의 갈래·방향·칸 수를 씨앗마다 바꿉니다. 한 가지(늘 오른쪽으로 1 cm)만 쓰면
      // 아이가 문제를 읽지 않고 '왼쪽으로 한 칸'만 옮겨도 맞히게 됩니다.
      const 끝 = 바른.endTick ?? m.objectMm;
      const 끝눈금 = m.rulerCm * 10;
      const k = 1 + (Math.floor(seed / 2) % 3); // 1~3 cm
      const 후보: 실수[] = [];
      // ① 자의 0이 아니라 k 눈금을 물건의 왼쪽 끝에 맞추고 오른쪽 끝의 눈금을 그대로 읽음(길게 잼)
      if (m.objectStartMm - 10 * k >= -m.rulerCm * 5 && 끝 + 10 * k <= 끝눈금) 후보.push({ state: { ...바른, rulerAt: m.objectStartMm - 10 * k, endTick: 끝 + 10 * k }, 말: `자의 0이 아니라 ${k} 눈금을 물건의 왼쪽 끝에 맞추고 오른쪽 끝의 눈금을 그대로 읽어, ${k} cm 더 길게 재었습니다.` });
      // ② 자의 0을 물건의 왼쪽 끝보다 k cm 안쪽에 두고 오른쪽 끝의 눈금을 읽음(짧게 잼)
      if (끝 - 10 * k > 0) 후보.push({ state: { ...바른, rulerAt: m.objectStartMm + 10 * k, endTick: 끝 - 10 * k }, 말: `자의 0 눈금을 물건의 왼쪽 끝보다 ${k} cm 안쪽에 두어, 물건이 자 밖으로 삐져나온 채 ${k} cm 짧게 재었습니다.` });
      // ③ 0은 바르게 맞추었지만 오른쪽 끝을 지나 읽음 / ④ 오른쪽 끝에 못 미쳐 읽음
      if (끝 + 10 * k <= 끝눈금) 후보.push({ state: { ...바른, endTick: 끝 + 10 * k }, 말: `0 눈금은 바르게 맞추었지만 물건의 오른쪽 끝을 지나 ${k} 칸 더 간 눈금을 읽었습니다.` });
      if (끝 - 10 * k > 0) 후보.push({ state: { ...바른, endTick: 끝 - 10 * k }, 말: `0 눈금은 바르게 맞추었지만 물건의 오른쪽 끝에 못 미친 눈금을 읽어 ${k} cm 짧게 재었습니다.` });
      return 섞기(후보, seed);
    }
    case 'ruler-draw': {
      if (바른.kind !== 'ruler-draw') return [];
      const 끝눈금 = m.rulerCm * 10;
      const 단위 = m.unit === 'mm' ? 1 : 10;
      const 단위말 = m.unit === 'mm' ? 'mm' : 'cm';
      const k = 1 + (Math.floor(seed / 2) % 3);
      const 후보: 실수[] = [];
      // 시작 눈금을 잊고 0부터 센 것처럼 길이 눈금에서 멈춤(시작 눈금만큼 짧음)
      if (m.fromMm > 0) 후보.push({ state: { ...바른, end: m.lengthMm }, 말: `시작한 눈금은 생각하지 않고 ${m.lengthMm / 단위} ${단위말} 눈금에서 멈추어, 시작한 눈금만큼 짧게 그었습니다.` });
      if (바른.end + 단위 * k <= 끝눈금) 후보.push({ state: { ...바른, end: 바른.end + 단위 * k }, 말: `눈금을 ${k} 칸 더 세어 ${k} ${단위말} 더 길게 그었습니다.` });
      if (바른.end - 단위 * k > m.fromMm) 후보.push({ state: { ...바른, end: 바른.end - 단위 * k }, 말: `눈금을 ${k} 칸 덜 세어 ${k} ${단위말} 짧게 그었습니다.` });
      return 섞기(후보, seed);
    }
    case 'clock': {
      const 시 = (m.h % 12) * 30;
      const 분 = m.m * 6;
      const 짧은 = 시 + m.m / 2;
      const out: 실수[] = [];
      if (m.m >= 20) out.push({ state: { kind: 'clock', hourDeg: 시, minuteDeg: 분 }, 말: `${m.m}분인데 짧은바늘을 ${m.h}에 딱 맞추어 놓았습니다. 짧은바늘은 ${m.h}과(와) ${(m.h % 12) + 1} 사이에 있어야 합니다.` });
      out.push({ state: { kind: 'clock', hourDeg: 각(분), minuteDeg: 각(짧은) }, 말: '긴바늘과 짧은바늘을 바꾸어 놓았습니다. 긴바늘은 분, 짧은바늘은 시를 나타냅니다.' });
      for (const 칸 of [-6, -3, -1, 1, 2, 3]) out.push({ state: { kind: 'clock', hourDeg: 짧은, minuteDeg: 각(분 + 칸 * 30) }, 말: `긴바늘을 숫자 ${Math.abs(칸)}칸만큼 ${칸 < 0 ? '덜' : '더'} 돌려 놓았습니다. 긴바늘이 숫자 한 칸을 가면 5분입니다.` });
      out.push({ state: { kind: 'clock', hourDeg: 각(짧은 + 30), minuteDeg: 분 }, 말: '짧은바늘을 한 시간 뒤의 숫자 쪽에 놓았습니다. 짧은바늘이 어느 숫자를 지났는지 보아야 합니다.' });
      return out;
    }
    case 'grid-point': {
      if (바른.kind !== 'grid-point' || !바른.pt) return [];
      const [x, y] = 바른.pt;
      const 안 = ([a, b]: GridPoint) => a >= 0 && b >= 0 && a <= m.cols && b <= m.rows && !m.target.some((t) => t[0] === a && t[1] === b);
      const out: 실수[] = [];
      // 대칭: 대칭축(중심)까지의 거리를 두 배로 세어 너무 멀리 찍는 실수입니다.
      if (m.axis) {
        const w: GridPoint = 'x' in m.axis ? [m.axis.x + 2 * (x - m.axis.x), y] : [x, m.axis.y + 2 * (y - m.axis.y)];
        if (안(w)) out.push({ state: { kind: 'grid-point', pt: w }, 말: '대칭축까지의 거리를 두 번 세어, 대응점을 대칭축에서 너무 멀리 찍었습니다. 대응점은 대칭축에서 같은 거리만큼 떨어져 있어야 합니다.' });
      }
      if (m.center) {
        const w: GridPoint = [m.center[0] + 2 * (x - m.center[0]), m.center[1] + 2 * (y - m.center[1])];
        if (안(w)) out.push({ state: { kind: 'grid-point', pt: w }, 말: '대칭의 중심까지의 거리를 두 번 세어, 대응점을 너무 멀리 찍었습니다. 대응점은 중심에서 같은 거리만큼 떨어져 있어야 합니다.' });
      }
      // 꼭짓점 찾기: 다른 두 점을 기준으로 옮겨, 다른 사각형의 꼭짓점을 찍는 실수입니다.
      const 점들 = m.marks.map((k) => k.at);
      for (const a of 점들) for (const b of 점들) for (const c of 점들) {
        if (a === b || b === c || a === c) continue;
        const w: GridPoint = [a[0] + c[0] - b[0], a[1] + c[1] - b[1]];
        if (안(w) && !점들.some((q) => q[0] === w[0] && q[1] === w[1])) out.push({ state: { kind: 'grid-point', pt: w }, 말: '다른 꼭짓점을 기준으로 옮겨 찍어, 문제에서 말한 차례(이름)와 다른 도형의 꼭짓점을 찍었습니다. 꼭짓점의 이름 차례대로 이어 보아야 합니다.' });
      }
      // 이등변삼각형: 꼭짓점을 밑변 한쪽 끝 바로 위(옆)에 찍어 직각삼각형을 만드는 실수입니다.
      if (점들.length === 2 && !m.axis && !m.center) {
        const [a, b] = 점들;
        const 가로밑변 = a[1] === b[1];
        for (const e of [a, b]) {
          const w: GridPoint = 가로밑변 ? [e[0], y] : [x, e[1]];
          if (안(w)) out.push({ state: { kind: 'grid-point', pt: w }, 말: '꼭짓점을 밑변의 한쪽 끝 바로 위에 찍어, 두 변의 길이가 같지 않은 직각삼각형이 되었습니다. 두 변의 길이가 같으려면 밑변의 가운데를 지나 밑변과 직각을 이루는 선 위에 찍어야 합니다.' });
        }
      }
      // 지름: 원의 중심을 지나지 않고 가로(세로)로만 마주 보는 점을 찍는 실수입니다.
      if (점들.length === 1 && m.target.length === 1 && m.shapes.some((sh) => sh.closed)) {
        const a = 점들[0];
        const [cx, cy] = [(a[0] + x) / 2, (a[1] + y) / 2];
        for (const w of [[a[0], 2 * cy - a[1]], [2 * cx - a[0], a[1]]] as GridPoint[]) {
          if (안(w)) out.push({ state: { kind: 'grid-point', pt: w }, 말: '점 ㄱ과 마주 보는 것처럼 보이는 점을 찍었지만, 이은 선분이 원의 중심을 지나지 않습니다. 지름은 원의 중심을 지나야 합니다.' });
        }
      }
      // 원의 중심: 원 위의 점을 중심으로 생각하는 실수입니다.
      if (!점들.length && m.guide?.length) {
        const w = m.guide[0][0];
        if (안(w)) out.push({ state: { kind: 'grid-point', pt: w }, 말: '원의 한가운데가 아니라 원 위의 점을 찍었습니다. 원의 중심은 원 위의 어느 점에서나 거리가 같은 한가운데 점입니다.' });
      }
      const 옆: GridPoint[] = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      return [...out, ...섞기(옆.filter(안), seed).map((pt) => ({ state: { kind: 'grid-point' as const, pt }, 말: '칸을 하나 잘못 세어 바로 옆 점에 찍었습니다.' }))];
    }
    case 'grid-draw': {
      if (바른.kind !== 'grid-draw') return [];
      // 문제에 주어진 선(검정)은 친구가 그은 선(파랑)에 넣지 않습니다.
      const 주어진조각 = new Set(m.fixed.flatMap(조각들));
      const 그은 = 바른.segs.filter((g) => !조각들(g).every((c) => 주어진조각.has(c)));
      if (!그은.length) return [];
      return 선실수(m, { ...바른, segs: 그은 }, seed);
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
        ...(m.goal.place
          ? 섞기(([[1, 0], [-1, 0], [0, 1], [0, -1]] as GridPoint[]).filter(([dx, dy]) => 바른.cells.every(([a, b]) => a + x + dx >= 0 && a + x + dx < m.cols && b + y + dy >= 0 && b + y + dy < m.rows)), seed).map(([dx, dy]) => ({ state: { ...바른, offset: [x + dx, y + dy] as GridPoint }, 말: `${dx > 0 ? '오른쪽' : dx < 0 ? '왼쪽' : dy > 0 ? '아래쪽' : '위쪽'}으로 한 칸 어긋나게 옮겼습니다. 옮길 칸 수를 다시 세어 보아야 합니다.` }))
          : []),
        ...모양실수,
      ];
    }
    case 'number-line': {
      const 맞음 = new Set(m.targets ?? [m.target]);
      const 안 = (k: number) => Number.isInteger(k) && k >= 0 && k <= m.ticks && !맞음.has(k);
      if (m.targets) {
        // 조건에 맞는 수가 여럿이면, 조건 하나만 보고 바로 밖의 수를 고른 실수로 만듭니다.
        const 밖 = [m.target + 1, m.target - 1, Math.min(...맞음) - 1, Math.max(...맞음) + 1, Math.min(...맞음) - 2, Math.max(...맞음) + 2].filter(안);
        return 밖.map((at) => ({ state: { kind: 'number-line' as const, at }, 말: '조건 가운데 하나만 보고 수를 골라, 다른 조건을 만족하지 않는 수에 점을 놓았습니다.' }));
      }
      const 수 = (t: string) => { const r = /^(\d+)\/(\d+)$/.exec(t); return r ? Number(r[1]) / Number(r[2]) : Number(t); };
      const 이름 = [...m.labels].filter((l) => Number.isFinite(수(l.text))).sort((a, b) => a.at - b.at);
      const out: 실수[] = [];
      const 점 = (at: number, 말: string) => { if (안(at)) out.push({ state: { kind: 'number-line', at }, 말 }); };
      if (이름.length >= 2) {
        const L = [...이름].reverse().find((l) => l.at <= m.target) ?? 이름[0];
        const R = 이름.find((l) => l.at >= m.target && l.at > L.at) ?? 이름[이름.length - 1];
        const 칸수 = R.at - L.at;
        const 한칸 = (수(R.text) - 수(L.text)) / 칸수;
        const v = 수(L.text) + (m.target - L.at) * 한칸;
        const 글 = (x: number) => String(Number(x.toFixed(4)));
        // 소수 수직선(이름이나 한 칸이 0.1, 0.01…)인지 분수 수직선인지에 따라 말을 바꿉니다.
        const 소수줄 = m.labels.some((l) => l.text.includes('.')) || [0.1, 0.01, 0.001].some((u) => Math.abs(한칸 - u) < 1e-9);
        const 폭 = 수(R.text) - 수(L.text);
        const 분수글 = (n: number) => (Number.isInteger(폭) && 폭 === 1 ? `1/${n}` : 글(폭 / n));
        if (Math.abs(한칸 - 1) > 1e-9) {
          // 작은 눈금 한 칸을 1로 생각하고 세는 실수입니다.
          const 하나로 = L.at + (v - 수(L.text));
          if (Math.abs(하나로 - Math.round(하나로)) < 1e-9) 점(Math.round(하나로), `작은 눈금 한 칸을 1로 생각하고 ${글(수(L.text))}에서부터 세었습니다. 큰 눈금 사이가 몇 칸으로 나뉘었는지 보고 한 칸의 크기(${소수줄 || 폭 !== 1 ? 글(한칸) : 분수글(칸수)})를 먼저 구해야 합니다.`);
          // 큰 눈금 사이를 늘 10칸으로 생각하고 세는 실수입니다.
          if (칸수 !== 10) {
            const 열칸 = L.at + (v - 수(L.text)) / ((수(R.text) - 수(L.text)) / 10);
            if (Math.abs(열칸 - Math.round(열칸)) < 1e-9) 점(Math.round(열칸), 소수줄 || 폭 !== 1
              ? `큰 눈금 사이가 ${칸수}칸인데 10칸이라고 생각해 한 칸을 ${글(폭 / 10)}(으)로 세었습니다. 작은 눈금 한 칸은 ${글(한칸)}입니다.`
              : `큰 눈금 사이가 ${칸수}칸인데 10칸이라고 생각해 한 칸을 ${분수글(10)}(으)로 세었습니다. 작은 눈금 한 칸은 ${분수글(칸수)}입니다.`);
          }
          // 소수점의 자리를 잘못 보는 실수입니다(2.3을 0.23이나 23처럼).
          if (소수줄) for (const 배 of [10, 0.1]) {
            const k = L.at + (v * 배 - 수(L.text)) / 한칸;
            if (Math.abs(k - Math.round(k)) < 1e-6) 점(Math.round(k), `소수점의 자리를 잘못 보아 ${글(v * 배)}을(를) 나타내는 곳에 점을 놓았습니다.`);
          }
        }
        // 큰 눈금에서 반대 방향으로 세는 실수입니다.
        if (m.target !== L.at && m.target !== R.at) 점(L.at + R.at - m.target, `${글(수(L.text))}에서부터 오른쪽으로 세어야 할 칸 수를 ${글(수(R.text))}에서부터 왼쪽으로 세었습니다. 어느 눈금에서 어느 쪽으로 세는지 확인해야 합니다.`);
      }
      // 처음 눈금을 1로 세기 시작해 한 칸 모자라게 가는 실수입니다.
      점(m.target - 1, '첫 눈금을 0이 아니라 1로 세기 시작해 한 칸 모자라게 갔습니다.');
      점(m.target + 1, '눈금을 한 칸 더 세어 점을 놓았습니다.');
      점(m.target - 2, '눈금을 두 칸 덜 세어 점을 놓았습니다.');
      점(m.target + 2, '눈금을 두 칸 더 세어 점을 놓았습니다.');
      return out;
    }
    case 'tap-fill': {
      if (바른.kind !== 'tap-fill') return [];
      const 미리 = new Set(m.pre);
      const 빈 = Array.from({ length: m.parts }, (_, k) => k).filter((k) => !미리.has(k) && !바른.on.includes(k));
      const 빈자리 = Array.from({ length: m.parts }, (_, k) => k).filter((k) => !미리.has(k));
      const 앞에서 = (n: number) => 빈자리.slice(0, n);
      // 10을 배우기 전 단원(판이 10칸 이하)에서는 판에 10개 넘게 놓지 않습니다.
      const 놓아도 = (n: number) => n > 0 && n <= 빈자리.length && (m.parts > 10 || m.pre.length + n <= 9);
      const out: 실수[] = [];
      if (m.exact && 바른.on.length && 빈.length) {
        // 칠할 자리가 정해진 문항: 한 칸을 엉뚱한 자리에 칠합니다.
        out.push({ state: { ...바른, on: [...바른.on.slice(0, -1), 빈[seed % 빈.length]] }, 말: '수는 맞게 칠했지만 한 칸을 알맞지 않은 자리에 칠했습니다. 어느 자리를 칠해야 하는지 조건을 다시 보아야 합니다.' });
      }
      // 미리 있는 것까지 다시 세지 않고, 모두의 수만큼 더 놓는 실수입니다.
      if (!m.exact && m.pre.length && 놓아도(m.target)) out.push({ state: { ...바른, on: 앞에서(m.target) }, 말: `이미 있던 ${m.pre.length}칸을 생각하지 않고 ${m.target}칸을 더 채웠습니다.` });
      // 더 놓아야 할 수를 구하지 않고, 이미 있는 수만큼 똑같이 더 놓는 실수입니다.
      if (!m.exact && m.pre.length && m.pre.length * 2 !== m.target && 놓아도(m.pre.length)) out.push({ state: { ...바른, on: 앞에서(m.pre.length) }, 말: `더 놓아야 할 수를 구하지 않고, 이미 있던 ${m.pre.length}개만큼 똑같이 더 놓았습니다. 모두 몇 개가 되어야 하는지에서 이미 있는 수를 빼어 보아야 합니다.` });
      // 100칸: 한 줄(10칸)과 한 칸을 바꾸어 생각해 줄 수와 칸 수가 뒤바뀌는 실수입니다.
      const 줄칸 = m.target >= 10 && m.target < 100 ? (m.target % 10) * 10 + Math.floor(m.target / 10) : -1;
      if (!m.exact && !m.pre.length && m.parts === 100 && 줄칸 !== m.target && 놓아도(줄칸)) out.push({ state: { ...바른, on: 앞에서(줄칸) }, 말: '한 줄(10칸)과 한 칸을 바꾸어 생각해, 칠해야 할 줄 수와 칸 수를 뒤바꾸어 칠했습니다.' });
      // 칠해야 할 만큼이 아니라 나머지(남는 칸)만큼 칠하는 실수입니다.
      const 나머지 = m.parts - m.target;
      if (!m.exact && !m.pre.length && 나머지 !== m.target && 놓아도(나머지)) out.push({ state: { ...바른, on: 앞에서(나머지) }, 말: '채워야 할 만큼이 아니라 남는 칸 수만큼 채웠습니다. 문제에서 무엇만큼 나타내라고 했는지 다시 보아야 합니다.' });
      for (const n of [1, 2]) {
        if (빈.length >= n && (m.parts > 10 || m.pre.length + 바른.on.length + n <= 9)) out.push({ state: { ...바른, on: [...바른.on, ...빈.slice(0, n)] }, 말: `${n === 1 ? '하나를' : '둘을'} 더 세어 ${n}칸을 더 채웠습니다.` });
        if (바른.on.length >= n) out.push({ state: { ...바른, on: 바른.on.slice(0, -n) }, 말: `${n === 1 ? '하나를' : '둘을'} 덜 세어 ${n}칸이 모자랍니다.` });
      }
      return out;
    }
    case 'base-ten': {
      if (바른.kind !== 'base-ten') return [];
      const c = 바른.counts;
      const out: 실수[] = [];
      // 0인 자리를 건너뛰고 숫자만 차례로 놓는 실수입니다(305를 35로).
      const 숫자들 = c.filter((v) => v > 0);
      const 붙임 = [...Array(c.length - 숫자들.length).fill(0), ...숫자들];
      const 영 = c.some((v, i) => v === 0 && c.slice(0, i).some((x) => x > 0)) && 붙임.join() !== c.join();
      if (영) out.push({ state: { ...바른, counts: 붙임 }, 말: '0인 자리를 건너뛰고 숫자만 차례로 놓아, 모형이 한 자리씩 아래 자리로 밀렸습니다. 0인 자리는 모형을 놓지 않고 비워 두어야 합니다.' });
      // 받아올림(바꾸기)을 하지 않아 아랫자리 모형이 10개를 넘는 실수입니다.
      const 위 = c.findIndex((v, i) => i + 1 < c.length && v >= 1 && c[i + 1] + 10 <= 19);
      const 풀기 = (i: number) => ({ state: { ...바른, counts: c.map((v, k) => (k === i ? v - 1 : k === i + 1 ? v + 10 : v)) }, 말: '아랫자리 모형이 10개가 넘었는데 윗자리 모형 1개로 바꾸지 않고 그대로 두었습니다.' });
      // 두 자리의 모형 수를 서로 바꾸어 놓는 실수입니다(자릿값 헷갈리기).
      const 바꿀 = c.findIndex((v, i) => i + 1 < c.length && v !== c[i + 1]);
      const 바꾸기 = (i: number) => ({ state: { ...바른, counts: c.map((v, k) => (k === i ? c[i + 1] : k === i + 1 ? c[i] : v)) }, 말: '두 자리의 모형 수를 서로 바꾸어 놓았습니다. 자리마다 나타내는 크기가 달라요.' });
      const 둘 = [...(바꿀 >= 0 ? [바꾸기(바꿀)] : []), ...(위 >= 0 ? [풀기(위)] : [])];
      out.push(...(m.trade !== 뒤집기 ? 둘.reverse() : 둘));
      for (let 자리 = 0; 자리 < c.length; 자리 += 1) for (const d of [1, -1, 2]) {
        const v = c[자리] + d;
        if (v < 0 || v > 9) continue;
        out.push({ state: { ...바른, counts: c.map((x, k) => (k === 자리 ? v : x)) }, 말: `한 자리의 모형을 ${Math.abs(d)}개 ${d > 0 ? '더' : '덜'} 놓았습니다. 자리마다 모형의 수를 다시 세어 보아야 합니다.` });
      }
      return out;
    }
    case 'bars': {
      if (바른.kind !== 'bars') return [];
      const 칸들 = m.labels.map((_, k) => k).filter((k) => !m.pre.includes(k));
      if (!칸들.length) return [];
      const out: 실수[] = [];
      // 눈금 한 칸을 1로 생각해, 값만큼의 칸 수로 그리는 실수입니다.
      if (m.step !== 1) {
        const i = 칸들.find((k) => (바른.vals[k] ?? 0) * m.step <= m.max && (바른.vals[k] ?? 0) > 0);
        if (i !== undefined) {
          const v = 바른.vals[i] ?? 0;
          out.push({ state: { ...바른, vals: 바른.vals.map((x, k) => (k === i ? v * m.step : x)) }, 말: `세로 눈금 한 칸을 1${m.unitLabel}(으)로 생각해 ${m.labels[i]}의 막대를 ${v}칸 높이로 그렸습니다. 세로 눈금 한 칸은 ${m.step}${m.unitLabel}입니다.` });
        }
      }
      // 표를 옮겨 적다가 두 항목의 값을 서로 바꾸어 그리는 실수입니다.
      const [i, j] = 칸들;
      if (j !== undefined && 바른.vals[i] !== 바른.vals[j]) out.push({ state: { ...바른, vals: 바른.vals.map((x, k) => (k === i ? 바른.vals[j] : k === j ? 바른.vals[i] : x)) }, 말: `${m.labels[i]}과(와) ${m.labels[j]}의 값을 서로 바꾸어 그렸습니다. 항목마다 자료의 값을 다시 확인해야 합니다.` });
      for (const q of 칸들) for (const d of [1, -1, 2, -2]) {
        const v = (바른.vals[q] ?? 0) + d * m.step;
        if (v < 0 || v > m.max) continue;
        out.push({ state: { ...바른, vals: 바른.vals.map((x, k) => (k === q ? v : x)) }, 말: `${m.labels[q]}의 막대를 눈금 ${Math.abs(d)}칸만큼 ${d > 0 ? '더' : '덜'} 그렸습니다.` });
      }
      return out;
    }
    case 'angle': {
      if (m.target !== undefined) {
        const out: 실수[] = [];
        if (m.protractor && m.target !== 90 && m.target < 180) out.push({ state: { kind: 'angle', deg: 180 - m.target }, 말: `각도기의 반대쪽 눈금을 읽어 ${180 - m.target}°로 그렸습니다. 0에서 시작한 쪽의 눈금을 읽어야 합니다.` });
        for (const d of [10, -10, 20, -20, 30, -30]) {
          const deg = m.target + d;
          if (deg > 0 && deg < 360) out.push({ state: { kind: 'angle', deg }, 말: `각을 ${Math.abs(d)}°만큼 ${d > 0 ? '더' : '덜'} 벌렸습니다. 각도기의 0에서 시작한 쪽 눈금을 다시 읽어야 합니다.` });
        }
        return out;
      }
      const [lo, hi] = m.range!;
      const 밖각: 실수[] = [];
      if (lo === 90 || hi === 90) 밖각.push({ state: { kind: 'angle', deg: 90 }, 말: '조건의 경계에 있는 각(직각)을 그렸습니다. 경계의 각은 조건에 들어가지 않습니다.' });
      for (const d of [10, 20, 40]) {
        if (hi + d < 360) 밖각.push({ state: { kind: 'angle', deg: hi + d }, 말: '조건보다 큰 각을 그렸습니다.' });
        if (lo - d > 0) 밖각.push({ state: { kind: 'angle', deg: lo - d }, 말: '조건보다 작은 각을 그렸습니다.' });
      }
      return 밖각;
    }
    case 'sort-bins': {
      if (바른.kind !== 'sort-bins') return [];
      const out: 실수[] = [];
      for (let a = 0; a < 바른.placed.length; a += 1) for (let b = a + 1; b < 바른.placed.length; b += 1) {
        if (바른.placed[a] === 바른.placed[b]) continue;
        const placed = [...바른.placed];
        [placed[a], placed[b]] = [placed[b], placed[a]];
        out.push({ state: { ...바른, placed }, 말: `${m.items[a].label}과(와) ${m.items[b].label}을(를) 서로 바뀐 곳에 넣었습니다.` });
      }
      return out;
    }
    case 'stack-build': {
      if (바른.kind !== 'stack-build') return [];
      // 보는 방향을 헷갈려 왼쪽과 오른쪽을 바꾸어 쌓는 실수입니다.
      const 거울 = 바른.h.map((row) => [...row].reverse());
      const 앞뒤 = [...바른.h].reverse().map((row) => [...row]);
      const h = 바른.h.map((row) => [...row]);
      const r = h.length - 1;
      const c = h[r].length - 1;
      const 끝: 실수 = m.check !== 'exact'
        ? { state: { ...바른, h: h.map((row, k) => (k === r ? row.map(() => 0) : row)) }, 말: '앞에서 본 모양을 보지 않아 앞줄 쌓기나무를 빠뜨렸습니다.' }
        : { state: { ...바른, h: h.map((row, k) => (k === r ? row.map((v, q) => (q === c ? (v >= m.maxH ? v - 1 : v + 1) : v)) : row)) }, 말: '앞줄 맨 오른쪽 자리의 층수를 잘못 세었습니다. 뒤에 가려진 쌓기나무와 층을 하나씩 세어야 합니다.' };
      // 부피: 밑면만 채우고 높이만큼 쌓지 않는 실수입니다(넓이와 부피를 헷갈림).
      const 높이들 = 바른.h.flat();
      const 한층 = 높이들.every((v) => v === 높이들[0]) && 높이들[0] > 1;
      return [
        ...(한층 && m.show === 'none' ? [{ state: { ...바른, h: 바른.h.map((row) => row.map(() => 1)) }, 말: '밑면만 한 층 채우고 높이만큼 쌓지 않았습니다. 부피는 (가로)×(세로)×(높이)이므로 높이만큼 층을 쌓아야 합니다.' }] : []),
        { state: { ...바른, h: 거울 }, 말: '보는 방향을 헷갈려 왼쪽과 오른쪽을 바꾸어 쌓았습니다. 앞에서 보았을 때의 왼쪽·오른쪽을 기준으로 쌓아야 합니다.' },
        { state: { ...바른, h: 앞뒤 }, 말: '앞줄과 뒷줄을 바꾸어 쌓았습니다. 그림에서 앞쪽이 어디인지 먼저 확인해야 합니다.' },
        끝,
      ];
    }
    case 'cube-net': {
      if (바른.kind !== 'cube-net') return [];
      if (바른.picked) {
        const 다른 = m.given.find((c) => c[0] !== 바른.picked![0] || c[1] !== 바른.picked![1]);
        return 다른 ? [{ state: { ...바른, picked: 다른 }, 말: '이웃한 면을 마주 보는 면으로 골랐습니다. 접으면 이웃한 면은 서로 맞닿습니다.' }] : [];
      }
      if (바른.cells.length <= m.given.length) return [];
      // 면을 모두 붙였지만 하나를 엉뚱한 자리에 붙여, 접으면 겹치는 면과 빈 면이 생기는 실수입니다.
      const 열쇠 = (p: GridPoint) => `${p[0]},${p[1]}`;
      const 마지막 = 바른.cells[바른.cells.length - 1];
      const 남은 = 바른.cells.slice(0, -1);
      const 있는 = new Set(남은.map(열쇠));
      const 자리들 = 남은.flatMap(([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as GridPoint[])
        .filter(([x, y]) => x >= 0 && y >= 0 && x < m.cols && y < m.rows && !있는.has(`${x},${y}`) && 열쇠([x, y]) !== 열쇠(마지막));
      return [
        ...자리들.map((p) => ({ state: { ...바른, cells: [...남은, p] }, 말: '면을 모두 붙였지만 하나를 알맞지 않은 자리에 붙였습니다. 접으면 두 면이 겹치고 한쪽이 비어 상자가 닫히지 않습니다.' })),
        { state: { ...바른, cells: 바른.cells.slice(0, -1) }, 말: '면 하나를 빠뜨려 접어도 상자가 닫히지 않습니다.' },
      ];
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
        ? [
          { state: { ...바른, strip: 바른.strip.slice(1) }, 말: '옆면 하나를 빠뜨렸습니다. 옆면의 수는 밑면의 변의 수와 같습니다.' },
          ...(바른.strip.length > 3 ? [{ state: { ...바른, strip: 바른.strip.slice(2) }, 말: '옆면 두 개를 빠뜨렸습니다. 옆면의 수는 밑면의 변의 수와 같습니다.' }] : []),
          { state: { ...바른, strip: [...바른.strip, 바른.strip[바른.strip.length - 1]] }, 말: '옆면을 하나 더 붙였습니다. 옆면의 수는 밑면의 변의 수와 같습니다.' },
          { state: { ...바른, bases: 바른.bases.map((b) => ({ ...b, side: 'top' as const })) }, 말: '옆면은 바르게 붙였지만 두 밑면을 모두 같은 쪽에 붙였습니다. 접으면 두 밑면이 서로 마주 보아야 합니다.' },
        ]
        : [{ state: { ...바른, bases: 바른.bases.map((b) => ({ ...b, side: 'top' as const })) }, 말: '두 밑면을 모두 같은 쪽에 붙였습니다.' }];
    }
    case 'order': {
      if (바른.kind !== 'order' || 바른.seq.length < 2) return [];
      const out: 실수[] = [];
      if (m.expr) {
        // 곱셈·나눗셈과 괄호를 먼저 하지 않고 앞에서부터 차례로 계산하는 실수입니다.
        const 앞부터 = m.items.map((_, i) => i).sort((a, b) => (m.items[a].at ?? a) - (m.items[b].at ?? b));
        if (앞부터.join() !== 바른.seq.join()) out.push({ state: { ...바른, seq: 앞부터 }, 말: '곱셈·나눗셈이나 괄호를 먼저 계산하지 않고, 앞에서부터 차례로 계산했습니다.' });
        out.push({ state: { ...바른, seq: [바른.seq[1], 바른.seq[0], ...바른.seq.slice(2)] }, 말: '앞의 두 계산의 순서를 바꾸었습니다.' });
        if (바른.seq.length >= 3) {
          out.push({ state: { ...바른, seq: [...바른.seq.slice(0, -2), 바른.seq[바른.seq.length - 1], 바른.seq[바른.seq.length - 2]] }, 말: '뒤의 두 계산의 순서를 바꾸었습니다.' });
          out.push({ state: { ...바른, seq: [...바른.seq].reverse() }, 말: '뒤에서부터 거꾸로 계산했습니다.' });
        }
        return out;
      }
      // 자릿수를 보지 않고 맨 앞 숫자부터 견주는 실수입니다(9가 12보다 크다고 봄).
      if (m.items.every((it) => /^\d+$/.test(it.label))) {
        const 글순 = m.items.map((_, i) => i).sort((a, b) => (m.dir === 'asc' ? 1 : -1) * m.items[a].label.localeCompare(m.items[b].label));
        if (글순.join() !== 바른.seq.join()) out.push({ state: { ...바른, seq: 글순 }, 말: '자릿수를 먼저 보지 않고 맨 앞 숫자만 견주어 늘어놓았습니다. 자릿수가 많은 수가 더 큽니다.' });
      }
      // 가운데 두 개의 순서를 바꾸는 실수입니다(끝의 것만 확인하고 가운데를 견주지 않음).
      if (바른.seq.length >= 4) {
        const k = 1 + (seed % (바른.seq.length - 3));
        const seq = [...바른.seq];
        [seq[k], seq[k + 1]] = [seq[k + 1], seq[k]];
        out.push({ state: { ...바른, seq }, 말: '맨 앞과 맨 뒤는 바르게 찾았지만, 가운데에 있는 것끼리는 꼼꼼히 견주지 않고 늘어놓았습니다.' });
      } else {
        out.push({ state: { ...바른, seq: [바른.seq[1], 바른.seq[0], ...바른.seq.slice(2)] }, 말: '앞의 두 개를 견주지 않고 늘어놓았습니다. 하나씩 둘씩 크기를 견주어야 합니다.' });
      }
      out.push({ state: { ...바른, seq: [...바른.seq].reverse() }, 말: '거꾸로 늘어놓았습니다. 문제에서 큰 것부터인지 작은 것부터인지 다시 보아야 합니다.' });
      return out;
    }
    case 'gauge': {
      if (바른.kind !== 'gauge') return [];
      const 단위 = m.tool === 'beaker' ? 'mL' : 'g';
      const out: 실수[] = [];
      // 큰 눈금은 바르게 읽고, 작은 눈금은 칸 수를 그대로 값으로 읽는 실수입니다.
      const 큰 = Math.floor(m.target / m.major) * m.major;
      const 칸 = (m.target - 큰) / m.minor;
      if (m.minor !== 1 && 칸 > 0 && Number.isInteger(칸)) {
        const 값 = 큰 + 칸;
        if (값 !== m.target && 값 <= m.max) out.push({ state: { ...바른, value: 값 }, 말: `큰 눈금은 바르게 읽었지만, 작은 눈금 ${칸}칸을 ${칸} ${단위}로 읽었습니다. 작은 눈금 한 칸은 ${m.minor} ${단위}입니다.` });
      }
      // 큰 눈금 하나를 덜(더) 읽는 실수입니다.
      if (m.target - m.major >= 0 && m.major !== m.minor) out.push({ state: { ...바른, value: m.target - m.major }, 말: `작은 눈금은 바르게 맞추었지만 큰 눈금을 하나 덜 읽어 ${m.major} ${단위}만큼 적게 맞추었습니다.` });
      for (const d of [1, -1, 2, -2, 3]) {
        const v = 바른.value + d * m.minor;
        if (v >= 0 && v <= m.max) out.push({ state: { ...바른, value: v }, 말: `작은 눈금을 ${Math.abs(d)}칸 ${d > 0 ? '더' : '덜'} 세어 맞추었습니다. 작은 눈금 한 칸은 ${m.minor} ${단위}입니다.` });
      }
      if (m.target + m.major <= m.max && m.major !== m.minor) out.push({ state: { ...바른, value: m.target + m.major }, 말: `큰 눈금을 하나 더 읽어 ${m.major} ${단위}만큼 많게 맞추었습니다.` });
      return out;
    }
    case 'pictograph': {
      if (바른.kind !== 'pictograph') return [];
      const i = 바른.big.findIndex((b, k) => b !== 바른.small[k]);
      const out: 실수[] = [];
      if (i >= 0) out.push({ state: { ...바른, big: 바른.big.map((v, k) => (k === i ? 바른.small[i] : v)), small: 바른.small.map((v, k) => (k === i ? 바른.big[i] : v)) }, 말: `${m.labels[i]}에서 큰 그림과 작은 그림의 수를 바꾸어 그렸습니다.` });
      바른.big.forEach((_, k) => {
        out.push({ state: { ...바른, big: 바른.big.map((v, q) => (q === k ? v + 1 : v)) }, 말: `${m.labels[k]}에 큰 그림을 하나 더 그렸습니다.` });
        if (바른.small[k] > 0) out.push({ state: { ...바른, small: 바른.small.map((v, q) => (q === k ? v - 1 : v)) }, 말: `${m.labels[k]}에 작은 그림을 하나 덜 그렸습니다.` });
        if (바른.big[k] > 0) out.push({ state: { ...바른, big: 바른.big.map((v, q) => (q === k ? v - 1 : v)) }, 말: `${m.labels[k]}에 큰 그림을 하나 덜 그렸습니다.` });
      });
      return out;
    }
    case 'calendar': {
      if (바른.kind !== 'calendar') return [];
      const out: 실수[] = [];
      const 말들: Record<number, string> = { 1: '시작하는 날까지 넣어 세어 하루가 어긋났습니다.', [-1]: '하루를 덜 세었습니다.', 2: '이틀을 더 세었습니다.', [-2]: '이틀을 덜 세었습니다.', 7: '일주일을 한 번 더 세었습니다(같은 요일이 한 주 뒤로 밀렸습니다).', [-7]: '일주일을 한 번 덜 세었습니다(같은 요일이 한 주 앞으로 당겨졌습니다).' };
      for (const d of [1, -1, 2, -2, 7, -7]) if (바른.picked.every((x) => x + d >= 1 && x + d <= m.days)) out.push({ state: { ...바른, picked: 바른.picked.map((x) => x + d) }, 말: 말들[d] });
      return out;
    }
    case 'share': {
      if (바른.kind !== 'share') return [];
      const out: 실수[] = [];
      if (m.groups) {
        // 똑같이 나누기(등분제)를 몇 개씩 묶기(포함제)로 헷갈려, 접시 수만큼씩 담는 실수입니다.
        if (m.groups * m.groups <= m.total && m.groups !== 바른.plates[0]) out.push({ state: { ...바른, plates: 바른.plates.map(() => m.groups!) }, 말: `접시 ${m.groups}개에 똑같이 나누어야 하는데, 접시마다 ${m.groups}개씩 담았습니다. 나누는 수가 접시의 수인지, 한 접시에 담는 수인지 구별해야 합니다.` });
        // 어느 접시에서 어느 접시로 하나를 옮겼는지는 문항마다 다릅니다.
        for (let i = 0; i < 바른.plates.length; i += 1) for (let j = 0; j < 바른.plates.length; j += 1) {
          if (i === j || 바른.plates[j] < 1) continue;
          out.push({ state: { ...바른, plates: 바른.plates.map((v, k) => (k === i ? v + 1 : k === j ? v - 1 : v)) }, 말: '모두 담았지만 접시마다 담은 수가 똑같지 않습니다.' });
        }
        return out;
      }
      const 남음 = m.total - 바른.plates.reduce((a, b) => a + b, 0);
      // 몇 개씩 묶기(포함제)를 똑같이 나누기(등분제)로 헷갈려, 접시를 한 접시에 담을 수만큼 놓는 실수입니다.
      const 등분 = m.size ? m.total / m.size : 0;
      if (m.size && Number.isInteger(등분) && 등분 !== m.size && m.size !== 바른.plates.length) out.push({ state: { ...바른, plates: Array.from({ length: m.size }, () => 등분) }, 말: `${m.size}개씩 담아야 하는데, 접시 ${m.size}개에 똑같이 나누어 담았습니다. 한 접시에 담는 수와 접시의 수를 구별해야 합니다.` });
      // 남는 것까지 한 접시로 쳐서 몫을 하나 크게 보는 실수입니다.
      if (남음 > 0) out.push({ state: { ...바른, plates: [...바른.plates, 남음] }, 말: `남은 ${남음}개도 한 접시에 담아 접시 수를 하나 더 세었습니다. 똑같이 ${m.size}개씩 담을 수 없는 것은 남겨 두어야 합니다.` });
      if (m.size && m.size + 1 <= m.total) 바른.plates.forEach((_, k) => out.push({ state: { ...바른, plates: 바른.plates.map((v, i) => (i === k ? v + 1 : v)) }, 말: `한 접시에 ${m.size}개보다 하나를 더 담았습니다.` }));
      if (m.size && m.size > 1) 바른.plates.forEach((_, k) => out.push({ state: { ...바른, plates: 바른.plates.map((v, i) => (i === k ? v - 1 : v)) }, 말: `한 접시에 ${m.size}개보다 하나를 덜 담았습니다.` }));
      if (바른.plates.length > 1) out.push({ state: { ...바른, plates: 바른.plates.slice(0, -1) }, 말: '한 접시를 덜 담고 그만두었습니다.' });
      return out;
    }
    case 'array': {
      if (바른.kind !== 'array') return [];
      const out: 실수[] = [];
      // 한 줄에 놓을 수와 줄의 수를 바꾸어 놓는 실수입니다.
      if (바른.rows !== 바른.cols && 바른.cols <= m.maxRows && 바른.rows <= m.maxCols) out.push({ state: { ...바른, rows: 바른.cols, cols: 바른.rows }, 말: `한 줄에 ${바른.cols}개씩 놓아야 하는데 한 줄에 ${바른.rows}개씩 놓았습니다. 한 줄에 놓는 수와 줄의 수를 구별해야 합니다.` });
      if (바른.rows < m.maxRows) out.push({ state: { ...바른, rows: 바른.rows + 1 }, 말: '줄의 수를 하나 더 놓았습니다.' });
      if (바른.rows > 1) out.push({ state: { ...바른, rows: 바른.rows - 1 }, 말: '줄의 수를 하나 덜 놓았습니다.' });
      if (바른.cols < m.maxCols) out.push({ state: { ...바른, cols: 바른.cols + 1 }, 말: '한 줄에 하나씩 더 놓았습니다.' });
      if (바른.cols > 1) out.push({ state: { ...바른, cols: 바른.cols - 1 }, 말: '한 줄에 하나씩 덜 놓았습니다.' });
      return out;
    }
    case 'pattern': {
      if (바른.kind !== 'pattern') return [];
      const 빈칸들 = m.given.map((v, k) => (v === null ? k : -1)).filter((k) => k >= 0);
      const out: 실수[] = [];
      for (const i of 빈칸들) for (let d = 1; d < m.palette.length; d += 1) out.push({ state: { ...바른, fill: 바른.fill.map((v, k) => (k === i ? (v! + d) % m.palette.length : v)) }, 말: '규칙을 이어 가다 한 칸을 잘못 채웠습니다. 되풀이되는 마디를 다시 찾아보아야 합니다.' });
      return out;
    }
    default: return [];
  }
};

/** 모눈에 선을 긋는 문항의 친구 실수입니다. 바른은 친구가 그어야 했던 선(주어진 선은 뺀 것)입니다. */
const 선실수 = (m: Extract<Manipulation, { kind: 'grid-draw' }>, 바른: Extract<ManipState, { kind: 'grid-draw' }>, seed: number): 실수[] => {
  if (바른.segs.length === 1) {
    // 선 하나를 긋는 문항(수직·평행·직각 등): 끝점을 한 칸 비껴 비스듬하게 긋는 실수입니다.
    const [[a, b], [c, d]] = 바른.segs[0];
    const 비낀: GridPoint[] = [[c + 1, d], [c, d + 1], [c - 1, d], [c, d - 1]];
    return 비낀.filter(([x, y]) => x >= 0 && y >= 0 && x <= m.cols && y <= m.rows && !(x === a && y === b))
      .map((끝) => ({ state: { ...바른, segs: [[[a, b], 끝]] as typeof 바른.segs }, 말: '선의 끝점을 한 칸 비껴 찍어 선이 비스듬해졌습니다. 그래서 문제의 조건을 만족하지 않습니다.' }));
  }
  // 그림은 끝까지 그렸지만 점 하나를 한 칸 엉뚱한 곳에 찍어, 그 점에 이어진 선이 모두 어긋난 실수입니다.
  // 아이는 칸을 세어 어느 점이 틀렸는지 찾고, 그 점에 이어진 선을 지운 뒤 다시 그어야 합니다.
  const 열쇠 = (p: GridPoint) => `${p[0]},${p[1]}`;
  const 고정점 = new Set(m.fixed.flat().map(열쇠));
  const 축위 = (p: GridPoint) => (m.axis ? ('x' in m.axis ? p[0] === m.axis.x : p[1] === m.axis.y) : false);
  const 중심 = (p: GridPoint) => Boolean(m.center && p[0] === m.center[0] && p[1] === m.center[1]);
  const 점들 = [...new Map(바른.segs.flat().map((p) => [열쇠(p), p] as const)).values()]
    .filter((p) => !고정점.has(열쇠(p)) && !축위(p) && !중심(p));
  const 이미 = new Set(바른.segs.flat().map(열쇠));
  const 말 = m.goal.type === 'exact' && m.axis
    ? '대칭축에서 떨어진 칸 수를 잘못 세어 대응점 하나를 엉뚱한 곳에 찍었습니다. 그래서 그 점에 이어진 선이 어긋났습니다.'
    : m.goal.type === 'exact' && m.center
      ? '대칭의 중심에서 반대쪽으로 같은 거리만큼 가지 않고 대응점 하나를 엉뚱한 곳에 찍었습니다. 그래서 그 점에 이어진 선이 어긋났습니다.'
      : m.goal.type === 'congruent'
        ? '꼭짓점 하나를 한 칸 잘못 찍어, 변의 길이가 처음 도형과 달라졌습니다.'
        : '꼭짓점 하나를 한 칸 엉뚱한 곳에 찍어, 그 점에 이어진 선이 어긋나 조건에 맞지 않게 되었습니다.';
  // 한 칸 어긋난 것을 먼저 찾고, 그래도 조건에 맞아 버리면 두 칸·대각선으로 어긋난 것을 찾습니다.
  const 방향들: GridPoint[] = [
    ...(m.axis && 'x' in m.axis ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[0, 1], [1, 0], [0, -1], [-1, 0]]) as GridPoint[],
    [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [-2, 0], [0, 2], [0, -2],
  ];
  const 옮긴: 실수[] = [];
  for (let i = 0; i < 점들.length; i += 1) {
    const v = 점들[(i + seed) % 점들.length];
    for (const [dx, dy] of 방향들) {
      // 대칭축 문항에서는 축에서 더 멀어지는 쪽으로 잘못 셉니다.
      const 멀리 = m.axis && 'x' in m.axis ? Math.sign(v[0] - m.axis.x) : 0;
      const w: GridPoint = [v[0] + (멀리 && dx ? Math.abs(dx) * 멀리 : dx), v[1] + dy];
      if (w[0] < 0 || w[1] < 0 || w[0] > m.cols || w[1] > m.rows || 이미.has(열쇠(w)) || 축위(w)) continue;
      const segs = 바른.segs.map(([a, b]) => [열쇠(a) === 열쇠(v) ? w : a, 열쇠(b) === 열쇠(v) ? w : b] as [GridPoint, GridPoint]);
      옮긴.push({ state: { ...바른, segs }, 말 });
    }
  }
  // 어디로 옮겨도 조건에 맞는 그림(아무 삼각형 등)이면, 점 하나를 이웃한 두 점과 한 줄 위에 찍어
  // 도형이 만들어지지 않게 한 실수로 만듭니다.
  const 한줄: 실수[] = [];
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
  for (const v of 점들) {
    const 이웃 = 바른.segs.filter(([a, b]) => 열쇠(a) === 열쇠(v) || 열쇠(b) === 열쇠(v)).map(([a, b]) => (열쇠(a) === 열쇠(v) ? b : a));
    if (이웃.length !== 2) continue;
    const [a, b] = 이웃;
    const g = gcd(b[0] - a[0], b[1] - a[1]);
    if (!g) continue;
    const [dx, dy] = [(b[0] - a[0]) / g, (b[1] - a[1]) / g];
    for (let t = 1; t < g; t += 1) {
      const w: GridPoint = [a[0] + dx * t, a[1] + dy * t];
      if (이미.has(열쇠(w))) continue;
      const segs = 바른.segs.map(([p, q]) => [열쇠(p) === 열쇠(v) ? w : p, 열쇠(q) === 열쇠(v) ? w : q] as [GridPoint, GridPoint]);
      한줄.push({ state: { ...바른, segs }, 말: '꼭짓점 하나를 이웃한 두 꼭짓점과 한 줄 위에 찍어, 선이 한 줄로 겹쳐 도형이 만들어지지 않았습니다.' });
    }
  }
  // '모눈선에 나란하지 않은 변이 있는' 도형인데 모든 변을 모눈선에 나란하게 그린 실수입니다.
  const 나란히: 실수[] = [];
  if (m.goal.type === 'polygon' && m.goal.goal.tilted && 바른.segs.length === 4) {
    const xs = 바른.segs.flat().map((p) => p[0]);
    const ys = 바른.segs.flat().map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    if (x0 < x1 && y0 < y1) {
      const 네: GridPoint[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      나란히.push({ state: { ...바른, segs: 네.map((p, i) => [p, 네[(i + 1) % 4]] as [GridPoint, GridPoint]) }, 말: '사각형을 그렸지만 네 변을 모두 모눈선에 나란하게 그렸습니다. 문제는 모눈선에 나란하지 않은(비스듬한) 변이 있어야 합니다.' });
    }
  }
  // 선의 끝이 모두 주어진 꼭짓점이면(대각선 긋기) 선 하나의 끝을 꼭짓점이 아닌 점에 이은 실수로 만듭니다.
  const 끝비낌: 실수[] = [];
  if (!점들.length) {
    for (let i = 0; i < 바른.segs.length; i += 1) {
      const k = (i + seed) % 바른.segs.length;
      const [a, b] = 바른.segs[k];
      for (const [dx, dy] of 방향들) {
        const w: GridPoint = [b[0] + dx, b[1] + dy];
        if (w[0] < 0 || w[1] < 0 || w[0] > m.cols || w[1] > m.rows || 이미.has(열쇠(w)) || 고정점.has(열쇠(w))) continue;
        끝비낌.push({ state: { ...바른, segs: 바른.segs.map((g, j) => (j === k ? [a, w] as [GridPoint, GridPoint] : g)) }, 말: '선 하나의 끝을 꼭짓점이 아닌 점에 이었습니다. 대각선은 이웃하지 않은 두 꼭짓점을 이은 선분입니다.' });
      }
    }
  }
  const k = seed % 바른.segs.length;
  const 모두 = [...나란히, ...옮긴, ...한줄, ...끝비낌, { state: { ...바른, segs: 바른.segs.filter((_, i) => i !== k) }, 말: '선분 하나를 빠뜨려 조건에 맞는 모양이 되지 않았습니다.' }];
  // 자리와 상관없이 조건만 맞으면 되는 도형(아무 삼각형, 합동인 도형)은 바른 예가 늘 같은 자리에 있어,
  // 친구의 그림도 늘 같은 자리·같은 모양이 됩니다. 친구의 그림을 모눈 위 다른 자리로 통째로 옮겨 둡니다.
  if ((m.goal.type === 'polygon' || m.goal.type === 'congruent') && !m.fixed.length && !m.marks.length) {
    const 점들모두 = 바른.segs.flat();
    const [x0, x1] = [Math.min(...점들모두.map((p) => p[0])), Math.max(...점들모두.map((p) => p[0]))];
    const [y0, y1] = [Math.min(...점들모두.map((p) => p[1])), Math.max(...점들모두.map((p) => p[1]))];
    const 자리: GridPoint[] = [];
    for (let dx = -x0; dx <= m.cols - x1; dx += 1) for (let dy = -y0; dy <= m.rows - y1; dy += 1) 자리.push([dx, dy]);
    const [dx, dy] = 자리.length ? 자리[(seed * 2654435761 >>> 0) % 자리.length] : [0, 0];
    const 옮기기 = (g: 실수): 실수 => {
      if (g.state.kind !== 'grid-draw') return g;
      const segs = g.state.segs.map(([a, b]) => [[a[0] + dx, a[1] + dy], [b[0] + dx, b[1] + dy]] as [GridPoint, GridPoint]);
      return segs.flat().every(([x, y]) => x >= 0 && y >= 0 && x <= m.cols && y <= m.rows) ? { ...g, state: { ...g.state, segs } } : g;
    };
    return 모두.map(옮기기);
  }
  return 모두;
};


/** 그 조작에서 흔한 실수 하나(채점하면 틀린 것)를 고릅니다. 없으면 null입니다. */
export const 친구실수 = (m: Manipulation, seed = 0): 실수 | null => 움직임골라(m, 실수후보(m, seed).filter((후보) => !채점(m, 후보.state).ok), seed);

/**
 * 틀린 후보를 '고치는 데 필요한 움직임'별로 묶고, 묶음을 고르게 고른 다음 그 안에서 하나를 고릅니다.
 * 같은 움직임(예: 한 칸 더 채우기)을 낳는 후보가 많아도 그 움직임만 자주 나오지 않습니다.
 */
const 움직임골라 = (m: Manipulation, 후보: 실수[], seed: number, 개념만 = false): 실수 | null => {
  const 바른 = 정답모습(m);
  const 묶기 = (xs: 실수[]) => {
    const 묶음 = new Map<string, 실수[]>();
    for (const x of xs) { const k = 고칠움직임(바른, x.state); 묶음.set(k, [...(묶음.get(k) ?? []), x]); }
    return [...묶음.values()];
  };
  // 실수에도 차례가 있습니다. 개념을 따져야 고칠 수 있는 실수를 먼저 쓰고, 다시 세기만 하면 고쳐지는
  // 한두 칸 차이는 개념 실수가 하나뿐일 때(같은 손놀림으로 굳지 않게) 섞거나, 개념 실수가 없을 때만 씁니다.
  // 선분을 빠뜨린 그림은 다른 실수를 만들 수 없을 때에만 씁니다.
  const 최후 = 후보.filter((x) => 빠뜨림말.test(x.말));
  const 세기 = 후보.filter((x) => !빠뜨림말.test(x.말) && 세기말.test(x.말));
  const 개념 = 후보.filter((x) => !빠뜨림말.test(x.말) && !세기말.test(x.말));
  const [개념묶음, 세기묶음] = [묶기(개념), 묶기(세기)];
  const 섞음 = 섞은수(seed * 13 + 5);
  const 세기섞어도 = !개념만;
  const 묶음들 = 개념묶음.length >= 2 ? 개념묶음
    : 개념묶음.length === 1 ? (세기섞어도 && 세기묶음.length && 섞음 % 2 === 0 ? 세기묶음 : 개념묶음)
      : 세기묶음.length ? 세기묶음 : 묶기(최후);
  const 하나 = 고르기(묶음들, seed);
  return 하나 && 고르기(하나, seed * 31 + 17);
};

/** 다시 세기만 하면 고쳐지는 한두 칸 차이의 실수입니다(눈금·칸·개수를 더/덜 셈). */
const 세기말 = /눈금을 (한|두) 칸|(하나|둘)[을를] (덜|더) 세어|칸을 더 채웠|칸이 모자랍|가장 낮은 자리|줄의 수를 하나|한 줄에 하나씩|한 접시를 덜|한 칸 어긋나게|칸 어긋나게 옮겼|막대를 눈금|앞줄 쌓기나무를 빠뜨|칸을 하나 잘못 세어 바로 옆|첫 눈금을 0이 아니라|첫 접시에|한 접시에 \d+개보다 하나를|옆면 하나를 빠뜨|옆면 두 개를|옆면을 하나 더|층수를 잘못 세었|모형을 \d개 (더|덜)|칸만큼 (더|덜) 돌려|°만큼 (더|덜)|하루를|이틀을|작은 눈금을 \d칸|그림을 하나 (더|덜)|규칙을 이어 가다|거꾸로 늘어놓았/;
const 빠뜨림말 = /선분 하나를 빠뜨려/;

/** 틀린 후보 가운데 하나를 씨앗으로 고릅니다. 늘 첫 후보를 쓰면 실수가 한 모양으로 굳어, 같은 손놀림으로 모두 고쳐집니다. */
export const 고르기 = <T,>(후보: T[], seed: number): T | null => (후보.length ? 후보[섞은수(seed) % 후보.length] : null);

/**
 * 씨앗을 고르게 흩뜨립니다(murmur3의 마무리 섞기). 곱하기 하나로만 흩뜨리면 작은 수로 나눈
 * 나머지가 씨앗과 한 줄로 늘어서, 후보 목록을 씨앗으로 돌린 것(섞기)과 맞물려 늘 같은 후보가 뽑혔습니다.
 */
const 섞은수 = (seed: number): number => {
  let h = (seed + 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
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
    // 갈래가 정해 둔 실수(그 차시의 핵심 오개념)와 조작의 흔한 실수를 함께 두고 씨앗으로 고릅니다.
    const 갈래실수 = (t.실수 ?? []).filter((x) => !채점(t.manipulate, x.state as ManipState).ok).map((x) => ({ state: x.state as ManipState, 말: x.말 }));
    const 일반실수 = 실수후보(t.manipulate, seed).filter((x) => !채점(t.manipulate, x.state).ok);
    // 갈래가 그 차시의 오개념을 정해 두었으면 그것만 씁니다(흔한 세기 실수로 바꾸지 않습니다).
    // 비와 비율·띠그래프·원그래프·비례식은 칠할 칸을 개념으로 따지는 차시라, 세기 실수를 섞지 않습니다.
    const 개념만 = 갈래실수.length > 0 && (t.tag === 'ratio' || t.tag === 'data');
    const 실 = 움직임골라(t.manipulate, [...갈래실수, ...일반실수.filter((x) => !빠뜨림말.test(x.말))], seed, 개념만);
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
