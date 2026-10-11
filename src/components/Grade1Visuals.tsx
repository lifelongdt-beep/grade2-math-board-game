import type { ReactNode } from 'react';
import type {
  CompareVisual,
  CounterIcon,
  CountersVisual,
  SolidShape,
  SolidsVisual,
  TenFrameVisual,
  TensOnesVisual,
} from '../types';

// ════════════════════════════════════════════════════════════════════
// 1학년 그림
// ────────────────────────────────────────────────────────────────────
// 1학년 아이는 글을 겨우 읽습니다. 지도서도 수 개념을 "모델(시각적
// 표현), 수 이름, 숫자"를 이어서 세우라고 합니다. 그래서 1학년 문항은
// 셀 물건, 십 배열판, 10개씩 묶음, 모양, 비교할 물건을 그대로 그립니다.
//
// 그림에는 답을 적지 않습니다. 세어 보거나 견주어 보게 하려는 그림입니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#182433';
const 청록 = '#0f9f9f';

// ── 셀 물건 ──────────────────────────────────────────────────────────
// 그림 글꼴(이모지)은 기기마다 다르게 나오거나 아예 빈칸으로 나옵니다.
// 그래서 물건을 도형으로 직접 그립니다.
export function CounterGlyph({ icon, x, y, size = 24 }: { icon: CounterIcon; x: number; y: number; size?: number }) {
  const s = size / 24;
  const t = `translate(${x} ${y}) scale(${s})`;
  if (icon === 'apple') {
    return (
      <g transform={t}>
        <circle cx="0" cy="2" r="10" fill="#ef5350" stroke="#b71c1c" strokeWidth="1.2" />
        <path d="M0 -7 L1 -11" stroke="#6d4c41" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="5" cy="-9" rx="4" ry="2" fill="#43a047" transform="rotate(-25 5 -9)" />
      </g>
    );
  }
  if (icon === 'star') {
    const points = Array.from({ length: 10 }, (_, k) => {
      const r = k % 2 === 0 ? 11 : 4.6;
      const a = (Math.PI / 5) * k - Math.PI / 2;
      return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a) + 1).toFixed(2)}`;
    }).join(' ');
    return (
      <g transform={t}>
        <polygon points={points} fill="#ffc928" stroke="#c99400" strokeWidth="1.2" strokeLinejoin="round" />
      </g>
    );
  }
  if (icon === 'flower') {
    return (
      <g transform={t}>
        {Array.from({ length: 5 }, (_, k) => {
          const a = (Math.PI * 2 * k) / 5 - Math.PI / 2;
          return <circle key={k} cx={6 * Math.cos(a)} cy={6 * Math.sin(a)} r="5" fill="#f48fb1" stroke="#c2185b" strokeWidth="0.8" />;
        })}
        <circle cx="0" cy="0" r="4" fill="#ffd54f" stroke="#c99400" strokeWidth="0.8" />
      </g>
    );
  }
  if (icon === 'fish') {
    return (
      <g transform={t}>
        <polygon points="7,0 13,-6 13,6" fill="#4fc3f7" stroke="#0277bd" strokeWidth="1" strokeLinejoin="round" />
        <ellipse cx="-2" cy="0" rx="10" ry="6.5" fill="#4fc3f7" stroke="#0277bd" strokeWidth="1.2" />
        <circle cx="-7" cy="-1.5" r="1.4" fill={글} />
      </g>
    );
  }
  if (icon === 'ball') {
    return (
      <g transform={t}>
        <circle cx="0" cy="0" r="10" fill="#42a5f5" stroke="#1565c0" strokeWidth="1.2" />
        <path d="M-10 0 Q0 -6 10 0 M-10 0 Q0 6 10 0" fill="none" stroke="#ffffff" strokeWidth="1.6" />
      </g>
    );
  }
  if (icon === 'car') {
    return (
      <g transform={t}>
        <path d="M-11 3 L-11 -2 L-6 -2 L-3 -7 L5 -7 L8 -2 L11 -2 L11 3 Z" fill="#ff7043" stroke="#bf360c" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="-6" cy="4" r="3" fill={글} />
        <circle cx="6" cy="4" r="3" fill={글} />
      </g>
    );
  }
  if (icon === 'bird') {
    return (
      <g transform={t}>
        <circle cx="0" cy="1" r="9" fill="#ffd54f" stroke="#c99400" strokeWidth="1.2" />
        <polygon points="8,0 13,2 8,4" fill="#ff8f00" />
        <circle cx="3" cy="-2" r="1.4" fill={글} />
        <path d="M-6 2 Q-2 7 2 3" fill="none" stroke="#c99400" strokeWidth="1.2" />
      </g>
    );
  }
  return (
    <g transform={t}>
      <circle cx="0" cy="0" r="10" fill="#dffafa" stroke={청록} strokeWidth="2" />
    </g>
  );
}

const 가위표 = (x: number, y: number, r = 11) => (
  <path
    d={`M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`}
    stroke="#d32f2f"
    strokeWidth="2.6"
    strokeLinecap="round"
  />
);

export function CountersGraphic({ visual }: { visual: CountersVisual }) {
  const cell = 30;
  const perRow = 5;
  const pad = 14;

  // 한 줄로 늘어놓고 몇째를 보는 그림입니다.
  if (visual.line) {
    const group = visual.groups[0];
    const count = Math.min(group?.count ?? 0, 10);
    const side = visual.line.sides ? 46 : 0;
    const width = pad * 2 + side * 2 + count * cell;
    const height = 66;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
        {visual.line.sides && (
          <>
            <text x={pad + 18} y="38" textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="800">왼쪽</text>
            <text x={width - pad - 18} y="38" textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="800">오른쪽</text>
          </>
        )}
        {Array.from({ length: count }, (_, k) => {
          const cx = pad + side + k * cell + cell / 2;
          const marked = visual.line?.marks.includes(k);
          return (
            <g key={k}>
              {marked && <circle cx={cx} cy="33" r="14" fill="#fff4bd" stroke="#f0a500" strokeWidth="2" />}
              <CounterGlyph icon={group.icon} x={cx} y={33} />
            </g>
          );
        })}
      </svg>
    );
  }

  const groups = visual.groups.slice(0, 3);
  const widths = groups.map((group) => (group.hidden ? 2 : Math.max(1, Math.min(group.count, perRow))) * cell);
  const rows = Math.max(1, ...groups.map((group) => (group.hidden ? 1 : Math.ceil(group.count / perRow))));
  const joinerRoom = visual.joiner ? 34 : 22;
  const hasNames = groups.some((group) => group.name);
  const width = pad * 2 + widths.reduce((sum, one) => sum + one, 0) + joinerRoom * (groups.length - 1);
  const height = 20 + rows * cell + (hasNames ? 26 : 8);

  let x = pad;
  const nodes: ReactNode[] = [];
  groups.forEach((group, gi) => {
    const top = 14;
    if (group.hidden) {
      nodes.push(
        <g key={`g${gi}`}>
          <rect x={x + 4} y={top + 2} width={widths[gi] - 8} height={rows * cell - 4} rx="8" fill="#fff4bd" stroke="#f0a500" strokeWidth="2" strokeDasharray="5 4" />
          <text x={x + widths[gi] / 2} y={top + (rows * cell) / 2 + 8} textAnchor="middle" fill={글} fontSize="22" fontWeight="900">?</text>
        </g>,
      );
    } else {
      const crossedFrom = group.count - (group.crossed ?? 0);
      for (let k = 0; k < group.count; k += 1) {
        const cx = x + (k % perRow) * cell + cell / 2;
        const cy = top + Math.floor(k / perRow) * cell + cell / 2;
        nodes.push(
          <g key={`g${gi}-${k}`}>
            <CounterGlyph icon={group.icon} x={cx} y={cy} />
            {k >= crossedFrom && 가위표(cx, cy)}
          </g>,
        );
      }
    }
    if (group.name) {
      nodes.push(
        <text key={`n${gi}`} x={x + widths[gi] / 2} y={height - 10} textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="800">
          {group.name}
        </text>,
      );
    }
    x += widths[gi];
    if (gi < groups.length - 1) {
      if (visual.joiner) {
        nodes.push(
          <text key={`j${gi}`} x={x + joinerRoom / 2} y={top + (rows * cell) / 2 + 8} textAnchor="middle" fill={청록} fontSize="22" fontWeight="900">
            {visual.joiner}
          </text>,
        );
      } else {
        nodes.push(<line key={`j${gi}`} x1={x + joinerRoom / 2} y1={top} x2={x + joinerRoom / 2} y2={top + rows * cell} stroke="#cfe3ea" strokeWidth="2" strokeDasharray="4 4" />);
      }
      x += joinerRoom;
    }
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {nodes}
    </svg>
  );
}

// ── 십 배열판 ────────────────────────────────────────────────────────
export function TenFrameGraphic({ visual }: { visual: TenFrameVisual }) {
  const cell = 32;
  const frames = Math.max(1, Math.min(visual.frames, 2));
  const frameW = cell * 5;
  const gap = 18;
  const width = 24 + frames * frameW + (frames - 1) * gap;
  const height = 24 + cell * 2;
  const colors = { teal: { fill: '#26a69a', stroke: '#00796b' }, orange: { fill: '#ffa726', stroke: '#e65100' } };
  const dots: Array<'teal' | 'orange'> = [];
  for (const fill of visual.fills) for (let k = 0; k < fill.count; k += 1) dots.push(fill.color);
  const total = Math.min(dots.length, frames * 10);
  const crossedFrom = total - (visual.crossed ?? 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {Array.from({ length: frames }, (_, f) => {
        const left = 12 + f * (frameW + gap);
        return (
          <g key={f}>
            {Array.from({ length: 10 }, (_, k) => (
              <rect key={k} x={left + (k % 5) * cell} y={12 + Math.floor(k / 5) * cell} width={cell} height={cell} fill="#ffffff" stroke="#41607a" strokeWidth="1.6" />
            ))}
          </g>
        );
      })}
      {dots.slice(0, total).map((color, k) => {
        const f = Math.floor(k / 10);
        const within = k % 10;
        const cx = 12 + f * (frameW + gap) + (within % 5) * cell + cell / 2;
        const cy = 12 + Math.floor(within / 5) * cell + cell / 2;
        return (
          <g key={k}>
            <circle cx={cx} cy={cy} r="11" fill={colors[color].fill} stroke={colors[color].stroke} strokeWidth="1.5" />
            {k >= crossedFrom && 가위표(cx, cy, 10)}
          </g>
        );
      })}
    </svg>
  );
}

// ── 10개씩 묶음과 낱개 ──────────────────────────────────────────────
// 연결 모형 10개를 이은 막대와 낱개 모형으로 그립니다. 지도서 5단원이
// 연결 모형과 수 세기 칩으로 10개씩 묶음과 낱개를 보여 줍니다.
export function TensOnesGraphic({ visual }: { visual: TensOnesVisual }) {
  const cube = 11;
  const tens = Math.max(0, Math.min(visual.tens, 5));
  const ones = Math.max(0, Math.min(visual.ones, 9));
  const tensW = Math.max(1, tens) * (cube + 9);
  const onesCols = Math.max(1, Math.ceil(ones / 5));
  const onesW = onesCols * (cube + 9);
  const gap = 40;
  const width = 40 + Math.max(tensW, 90) + gap + Math.max(onesW, 50);
  const top = 14;
  const height = top + cube * 10 + (visual.showDigits ? 52 : 34);
  const tensLeft = 20 + (Math.max(tensW, 90) - tensW) / 2;
  const onesBox = 20 + Math.max(tensW, 90) + gap;
  const onesLeft = onesBox + (Math.max(onesW, 50) - onesW) / 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {Array.from({ length: tens }, (_, t) =>
        Array.from({ length: 10 }, (_, k) => (
          <rect key={`${t}-${k}`} x={tensLeft + t * (cube + 9)} y={top + k * cube} width={cube} height={cube} fill="#4dd0e1" stroke="#00838f" strokeWidth="1" />
        )),
      )}
      {Array.from({ length: ones }, (_, k) => (
        <rect
          key={`o${k}`}
          x={onesLeft + Math.floor(k / 5) * (cube + 9)}
          y={top + cube * 10 - (5 - (k % 5)) * (cube + 4)}
          width={cube}
          height={cube}
          fill="#ffb74d"
          stroke="#e65100"
          strokeWidth="1"
        />
      ))}
      <line x1={onesBox - gap / 2} y1={top} x2={onesBox - gap / 2} y2={top + cube * 10} stroke="#cfe3ea" strokeWidth="2" strokeDasharray="4 4" />
      <text x={20 + Math.max(tensW, 90) / 2} y={top + cube * 10 + 20} textAnchor="middle" fill="#0f7175" fontSize="12" fontWeight="900">
        10개씩 묶음
      </text>
      <text x={onesBox + Math.max(onesW, 50) / 2} y={top + cube * 10 + 20} textAnchor="middle" fill="#0f7175" fontSize="12" fontWeight="900">
        낱개
      </text>
      {visual.showDigits && (
        <>
          <text x={20 + Math.max(tensW, 90) / 2} y={top + cube * 10 + 42} textAnchor="middle" fill={글} fontSize="17" fontWeight="900">{tens}</text>
          <text x={onesBox + Math.max(onesW, 50) / 2} y={top + cube * 10 + 42} textAnchor="middle" fill={글} fontSize="17" fontWeight="900">{ones}</text>
        </>
      )}
    </svg>
  );
}

// ── 상자·둥근기둥·공 모양 ───────────────────────────────────────────
function SolidGlyph({ shape, cx, base }: { shape: SolidShape; cx: number; base: number }) {
  if (shape === 'box') {
    const w = 52;
    const h = 40;
    const d = 16;
    const x = cx - (w + d) / 2;
    const y = base - h;
    return (
      <g stroke="#41607a" strokeWidth="1.6" strokeLinejoin="round">
        <polygon points={`${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`} fill="#ffe0b2" />
        <polygon points={`${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}`} fill="#ffcc80" />
        <rect x={x} y={y} width={w} height={h} fill="#fff3e0" />
      </g>
    );
  }
  if (shape === 'cylinder') {
    const rx = 24;
    const ry = 8;
    const h = 46;
    return (
      <g stroke="#41607a" strokeWidth="1.6">
        <path d={`M${cx - rx} ${base - h} L${cx - rx} ${base} A${rx} ${ry} 0 0 0 ${cx + rx} ${base} L${cx + rx} ${base - h}`} fill="#c8e6c9" />
        <ellipse cx={cx} cy={base - h} rx={rx} ry={ry} fill="#e8f5e9" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={cx} cy={base - 26} r="26" fill="#bbdefb" stroke="#41607a" strokeWidth="1.6" />
      <ellipse cx={cx - 9} cy={base - 36} rx="7" ry="5" fill="#ffffff" opacity="0.8" />
    </g>
  );
}

export function SolidsGraphic({ visual }: { visual: SolidsVisual }) {
  const items = visual.items.slice(0, 5);
  const slot = 92;
  const width = 24 + items.length * slot;
  const hasThing = items.some((item) => item.thing);
  const hasName = items.some((item) => item.name);
  const base = 92;
  const height = base + 14 + (hasThing ? 18 : 0) + (hasName ? 20 : 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {items.map((item, k) => {
        const cx = 12 + k * slot + slot / 2;
        return (
          <g key={k}>
            {item.active && <rect x={cx - slot / 2 + 4} y="8" width={slot - 8} height={base} rx="10" fill="#fff4bd" stroke="#f0a500" strokeWidth="2" />}
            <SolidGlyph shape={item.shape} cx={cx} base={base - 4} />
            {/* 상자 속에 넣고 윗부분만 보이게 합니다. */}
            {item.peek && (
              <g>
                <rect x={cx - 40} y={base - 50} width="80" height="48" rx="4" fill="#a1887f" stroke="#5d4037" strokeWidth="1.6" />
                <text x={cx} y={base - 20} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">상자</text>
              </g>
            )}
            {item.thing && (
              <text x={cx} y={base + 14} textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="800">{item.thing}</text>
            )}
            {item.name && (
              <text x={cx} y={base + (hasThing ? 34 : 16)} textAnchor="middle" fill={글} fontSize="15" fontWeight="900">{item.name}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── 비교하기 ─────────────────────────────────────────────────────────
// 눈금이나 수를 그리지 않습니다. 지도서가 이 단원에서 임의 단위나
// 표준 단위를 쓰지 않는다고 못박아 두었습니다.
const 비교색 = ['#ef9a9a', '#90caf9', '#a5d6a7', '#ffe082'];
const 비교선 = ['#c62828', '#1565c0', '#2e7d32', '#c99400'];

export function CompareGraphic({ visual }: { visual: CompareVisual }) {
  const items = visual.items.slice(0, 4);
  const biggest = Math.max(...items.map((item) => item.size), 1);

  if (visual.mode === 'length') {
    const nameW = 70;
    const barMax = 250;
    const rowH = 34;
    const width = nameW + barMax + 40;
    const height = 20 + items.length * rowH;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
        {/* 한쪽 끝을 맞추어 늘어놓은 것을 보여 주려고 세로 선을 긋습니다. */}
        <line x1={nameW + 10} y1="8" x2={nameW + 10} y2={height - 8} stroke="#9fb5c4" strokeWidth="1.5" strokeDasharray="4 3" />
        {items.map((item, k) => {
          const y = 14 + k * rowH;
          const w = Math.max(20, (item.size / biggest) * barMax);
          return (
            <g key={k}>
              <text x={nameW} y={y + 18} textAnchor="end" fill={글} fontSize="14" fontWeight="900">{item.name}</text>
              <rect x={nameW + 10} y={y + 4} width={w - 12} height="18" rx="4" fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" />
              <polygon points={`${nameW + w - 2},${y + 4} ${nameW + w + 10},${y + 13} ${nameW + w - 2},${y + 22}`} fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
    );
  }

  if (visual.mode === 'weight') {
    // 둘씩 시소에 올립니다. 셋이면 시소가 두 개입니다(가와 나, 나와 다).
    const pairs: Array<[number, number]> = [];
    for (let k = 0; k + 1 < items.length; k += 1) pairs.push([k, k + 1]);
    const seesawW = 170;
    const width = 24 + pairs.length * (seesawW + 20);
    const height = 132;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
        {pairs.map(([a, b], p) => {
          const cx = 22 + p * (seesawW + 20) + seesawW / 2;
          const pivotY = 100;
          const tilt = items[a].size === items[b].size ? 0 : items[a].size > items[b].size ? 1 : -1;
          const dy = 16 * tilt;
          const lx = cx - seesawW / 2 + 8;
          const rx = cx + seesawW / 2 - 8;
          const ly = pivotY - 8 + dy;
          const ry = pivotY - 8 - dy;
          const 물건 = (x: number, y: number, k: number) => (
            <g>
              <rect x={x - 26} y={y - 34} width="52" height="32" rx="6" fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" />
              <text x={x} y={y - 13} textAnchor="middle" fill={글} fontSize="13" fontWeight="900">{items[k].name}</text>
            </g>
          );
          return (
            <g key={p}>
              <polygon points={`${cx},${pivotY - 8} ${cx - 14},${pivotY + 20} ${cx + 14},${pivotY + 20}`} fill="#90a4ae" stroke="#455a64" strokeWidth="1.5" />
              <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#6d4c41" strokeWidth="6" strokeLinecap="round" />
              {물건(lx + 22, ly + (dy / (seesawW / 2)) * 22, a)}
              {물건(rx - 22, ry - (dy / (seesawW / 2)) * 22, b)}
            </g>
          );
        })}
      </svg>
    );
  }

  if (visual.mode === 'area') {
    // 처음에는 한 귀퉁이를 맞추어 겹쳐 그렸는데, 크기가 비슷하면 위에
    // 놓인 판이 아래 판의 이름을 가려 어느 것이 어느 것인지 읽을 수
    // 없었습니다. 같은 모양(가로세로 비율)의 판을 나란히 놓고 이름을
    // 밑에 적습니다. 모양이 같으니 크기만 보고 견줄 수 있습니다.
    const slot = 92;
    const box = 78;
    const width = 24 + items.length * slot;
    const base = box + 18;
    const height = base + 30;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
        {items.map((item, k) => {
          const side = Math.max(16, Math.sqrt(item.size / biggest) * box);
          const cx = 12 + k * slot + slot / 2;
          return (
            <g key={k}>
              <rect x={cx - side / 2} y={base - side} width={side} height={side} rx="3" fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.8" />
              <text x={cx} y={base + 20} textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{item.name}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // capacity: 크기가 다른 그릇, water: 같은 그릇에 담긴 물의 높이
  const slot = 86;
  const width = 24 + items.length * slot;
  const height = 150;
  const base = 118;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {items.map((item, k) => {
        const cx = 12 + k * slot + slot / 2;
        const scale = visual.mode === 'capacity' ? 0.45 + 0.55 * (item.size / biggest) : 1;
        const w = 56 * Math.sqrt(scale);
        const h = 90 * scale;
        const level = visual.mode === 'water' ? (item.size / biggest) * h * 0.9 : h * 0.0;
        return (
          <g key={k}>
            {level > 0 && <rect x={cx - w / 2 + 2} y={base - level} width={w - 4} height={level} fill="#81d4fa" />}
            <path d={`M${cx - w / 2} ${base - h} L${cx - w / 2} ${base} L${cx + w / 2} ${base} L${cx + w / 2} ${base - h}`} fill="none" stroke="#41607a" strokeWidth="2.2" strokeLinejoin="round" />
            <text x={cx} y={base + 22} textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{item.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
