import type { AngleSplitVisual, AngleVisual, BarGraphVisual, GridMoveVisual, LineGraphVisual, NumberArrayVisual, ParallelDistanceVisual, ProtractorVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 4학년 그림 — 각, 막대그래프, 꺾은선그래프, 모눈 위 도형의 이동
// ────────────────────────────────────────────────────────────────────
// 그림이 문제의 수와 어긋나면 아이는 그림을 믿지 않게 됩니다. 각은
// 적힌 각도 그대로, 그래프는 눈금 그대로, 모눈 도형은 칸 그대로
// 그립니다. 답이 되는 값은 그림에 적지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#182433';
const 선 = '#41607a';

// ── 각 ──────────────────────────────────────────────────────────────
export function AngleGraphic({ visual }: { visual: AngleVisual }) {
  const items = visual.items.slice(0, 4);
  const slot = 150;
  const width = 20 + items.length * slot;
  const height = 150;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {items.map((item, k) => {
        const rot = item.rotate ?? 0;
        // 꼭짓점을 칸 안에 두되, 둔각이면 왼쪽으로 뻗을 자리를 남깁니다.
        const vx = 10 + k * slot + (item.deg > 90 ? 82 : 40);
        const vy = 108;
        const len = item.deg > 90 ? 62 : 92;
        const a1 = (-rot * Math.PI) / 180;
        const a2 = (-(rot + item.deg) * Math.PI) / 180;
        const p1 = [vx + len * Math.cos(a1), vy + len * Math.sin(a1)];
        const p2 = [vx + len * Math.cos(a2), vy + len * Math.sin(a2)];
        const r = 22;
        const q1 = [vx + r * Math.cos(a1), vy + r * Math.sin(a1)];
        const q2 = [vx + r * Math.cos(a2), vy + r * Math.sin(a2)];
        const mid = (a1 + a2) / 2;
        const right = item.deg === 90;
        return (
          <g key={k}>
            <line x1={vx} y1={vy} x2={p1[0]} y2={p1[1]} stroke={선} strokeWidth="2.4" strokeLinecap="round" />
            <line x1={vx} y1={vy} x2={p2[0]} y2={p2[1]} stroke={선} strokeWidth="2.4" strokeLinecap="round" />
            {right ? (
              <path d={`M${vx + 14 * Math.cos(a1)} ${vy + 14 * Math.sin(a1)} L${vx + 14 * Math.cos(a1) + 14 * Math.cos(a2)} ${vy + 14 * Math.sin(a1) + 14 * Math.sin(a2)} L${vx + 14 * Math.cos(a2)} ${vy + 14 * Math.sin(a2)}`} fill="none" stroke="#e65100" strokeWidth="1.8" />
            ) : (
              <path d={`M${q1[0]} ${q1[1]} A${r} ${r} 0 ${item.deg > 180 ? 1 : 0} 0 ${q2[0]} ${q2[1]}`} fill="none" stroke="#e65100" strokeWidth="2" />
            )}
            {item.text && (
              <text x={vx + 40 * Math.cos(mid)} y={vy + 40 * Math.sin(mid) + 5} textAnchor="middle" fill="#bf360c" fontSize="14" fontWeight="900">{item.text}</text>
            )}
            {item.name && <text x={10 + k * slot + slot / 2} y={height - 10} textAnchor="middle" fill={글} fontSize="15" fontWeight="900">{item.name}</text>}
            <circle cx={vx} cy={vy} r="2.6" fill={선} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 막대그래프 ──────────────────────────────────────────────────────
export function BarGraphGraphic({ visual }: { visual: BarGraphVisual }) {
  const bars = visual.bars.slice(0, 6);
  const ticks = Math.max(1, Math.round(visual.max / visual.step));
  if (visual.horizontal) {
    const left = 70;
    const top = 36;
    const rowH = 28;
    const plotW = 280;
    const width = left + plotW + 24;
    const height = top + bars.length * rowH + 34;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
        <text x={width / 2} y="22" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{visual.title}</text>
        {Array.from({ length: ticks + 1 }, (_, t) => {
          const x = left + (plotW * t) / ticks;
          return (
            <g key={t}>
              <line x1={x} y1={top - 4} x2={x} y2={top + bars.length * rowH} stroke="#cfe3ea" strokeWidth={t % 5 === 0 ? 1.4 : 0.8} />
              {(t % Math.max(1, Math.round(ticks / 5)) === 0) && <text x={x} y={top + bars.length * rowH + 16} textAnchor="middle" fill="#56708a" fontSize="11" fontWeight="700">{t * visual.step}</text>}
            </g>
          );
        })}
        {bars.map((bar, k) => {
          const y = top + k * rowH + 5;
          const w = (plotW * bar.value) / visual.max;
          return (
            <g key={k}>
              <text x={left - 8} y={y + 14} textAnchor="end" fill={글} fontSize="12" fontWeight="800">{bar.name}</text>
              {bar.hidden ? <text x={left + 10} y={y + 14} fill="#bf360c" fontSize="14" fontWeight="900">?</text> : <rect x={left} y={y} width={w} height="18" fill="#4dd0e1" stroke="#00838f" />}
            </g>
          );
        })}
        <text x={left + plotW} y={height - 4} textAnchor="end" fill="#56708a" fontSize="11" fontWeight="700">({visual.valueLabel})</text>
      </svg>
    );
  }
  const left = 46;
  const top = 50;
  const plotH = 160;
  const colW = Math.max(56, Math.min(64, 320 / bars.length));
  const width = left + colW * bars.length + 24;
  const height = top + plotH + 36;
  const labelEvery = Math.max(1, Math.round(ticks / 5));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      <text x={width / 2} y="20" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{visual.title}</text>
      {Array.from({ length: ticks + 1 }, (_, t) => {
        const y = top + plotH - (plotH * t) / ticks;
        return (
          <g key={t}>
            <line x1={left} y1={y} x2={width - 16} y2={y} stroke="#cfe3ea" strokeWidth={t % labelEvery === 0 ? 1.4 : 0.8} />
            {t % labelEvery === 0 && <text x={left - 6} y={y + 4} textAnchor="end" fill="#56708a" fontSize="11" fontWeight="700">{t * visual.step}</text>}
          </g>
        );
      })}
      <line x1={left} y1={top} x2={left} y2={top + plotH} stroke={선} strokeWidth="1.4" />
      {bars.map((bar, k) => {
        const x = left + k * colW + colW * 0.2;
        const h = (plotH * bar.value) / visual.max;
        return (
          <g key={k}>
            {bar.hidden ? <text x={x + colW * 0.3} y={top + plotH - 8} textAnchor="middle" fill="#bf360c" fontSize="16" fontWeight="900">?</text> : <rect x={x} y={top + plotH - h} width={colW * 0.6} height={h} fill="#4dd0e1" stroke="#00838f" />}
            <text x={x + colW * 0.3} y={top + plotH + 16} textAnchor="middle" fill={글} fontSize="12" fontWeight="800">{bar.name}</text>
          </g>
        );
      })}
      <text x="10" y={top - 12} fill="#56708a" fontSize="11" fontWeight="700">({visual.valueLabel})</text>
    </svg>
  );
}

// ── 꺾은선그래프 ────────────────────────────────────────────────────
export function LineGraphGraphic({ visual }: { visual: LineGraphVisual }) {
  const pts = visual.points.slice(0, 7);
  const from = visual.from ?? 0;
  const ticks = Math.max(1, Math.round((visual.max - from) / visual.step));
  const left = 48;
  const top = 50;
  const plotH = 160;
  const colW = Math.max(46, Math.min(56, 330 / pts.length));
  const width = left + colW * pts.length + 20;
  const height = top + plotH + 36;
  const yOf = (v: number) => top + plotH - (plotH * (v - from)) / (visual.max - from);
  const xOf = (k: number) => left + k * colW + colW / 2;
  const labelEvery = Math.max(1, Math.round(ticks / 5));
  const shown = pts.map((p, k) => ({ ...p, k })).filter((p) => !p.hidden);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      <text x={width / 2} y="20" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{visual.title}</text>
      {Array.from({ length: ticks + 1 }, (_, t) => {
        const y = top + plotH - (plotH * t) / ticks;
        return (
          <g key={t}>
            <line x1={left} y1={y} x2={width - 14} y2={y} stroke="#cfe3ea" strokeWidth={t % labelEvery === 0 ? 1.4 : 0.8} />
            {t % labelEvery === 0 && <text x={left - 6} y={y + 4} textAnchor="end" fill="#56708a" fontSize="11" fontWeight="700">{from + t * visual.step}</text>}
          </g>
        );
      })}
      <line x1={left} y1={top} x2={left} y2={top + plotH + 8} stroke={선} strokeWidth="1.4" />
      {/* 0부터 그리지 않을 때는 세로축 아래에 물결선을 그립니다. */}
      {from > 0 && <path d={`M${left - 7} ${top + plotH + 2} q 3.5 -5 7 0 t 7 0`} fill="none" stroke={선} strokeWidth="1.6" />}
      {from > 0 && <text x={left - 6} y={top + plotH + 18} textAnchor="end" fill="#56708a" fontSize="11" fontWeight="700">0</text>}
      <polyline points={shown.map((p) => `${xOf(p.k)},${yOf(p.value)}`).join(' ')} fill="none" stroke="#e65100" strokeWidth="2.2" />
      {pts.map((p, k) => (
        <g key={k}>
          {p.hidden ? <text x={xOf(k)} y={top + plotH - 8} textAnchor="middle" fill="#bf360c" fontSize="15" fontWeight="900">?</text> : <circle cx={xOf(k)} cy={yOf(p.value)} r="3.6" fill="#e65100" />}
          <text x={xOf(k)} y={top + plotH + 22} textAnchor="middle" fill={글} fontSize="11" fontWeight="800">{p.name}</text>
        </g>
      ))}
      <text x="10" y={top - 12} fill="#56708a" fontSize="11" fontWeight="700">({visual.valueLabel})</text>
    </svg>
  );
}

// ── 모눈 위 도형의 이동 ─────────────────────────────────────────────
export function GridMoveGraphic({ visual }: { visual: GridMoveVisual }) {
  const panels = visual.panels.slice(0, 5);
  const n = visual.size;
  const cell = Math.min(18, 120 / n);
  const pw = n * cell;
  const gap = 18;
  const width = 20 + panels.length * pw + (panels.length - 1) * gap;
  const hasName = panels.some((p) => p.name || p.caption);
  const height = 16 + pw + (hasName ? 26 : 10);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {panels.map((p, k) => {
        const ox = 10 + k * (pw + gap);
        const oy = 10;
        return (
          <g key={k}>
            {Array.from({ length: n + 1 }, (_, t) => (
              <g key={t}>
                <line x1={ox + t * cell} y1={oy} x2={ox + t * cell} y2={oy + pw} stroke="#cfe3ea" strokeWidth="1" />
                <line x1={ox} y1={oy + t * cell} x2={ox + pw} y2={oy + t * cell} stroke="#cfe3ea" strokeWidth="1" />
              </g>
            ))}
            {(p.cells ?? []).map(([x, y], c) => (
              <rect key={c} x={ox + x * cell} y={oy + y * cell} width={cell} height={cell} fill={c === 0 && !visual.plain ? '#ff8a65' : '#4dd0e1'} stroke="#00838f" strokeWidth="1" />
            ))}
            {p.point && <circle cx={ox + p.point[0] * cell} cy={oy + p.point[1] * cell} r="4.5" fill="#e65100" />}
            {p.point && <text x={ox + p.point[0] * cell + 6} y={oy + p.point[1] * cell - 5} fill="#bf360c" fontSize="11" fontWeight="900">ㄱ</text>}
            {p.target && <circle cx={ox + p.target[0] * cell} cy={oy + p.target[1] * cell} r="4" fill="none" stroke="#1565c0" strokeWidth="2" />}
            {(p.name || p.caption) && <text x={ox + pw / 2} y={height - 9} textAnchor="middle" fill={글} fontSize="13" fontWeight="900">{p.name ?? p.caption}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── 각도기 ──────────────────────────────────────────────────────────
// 안쪽 눈금은 오른쪽이 0이고 시계 반대 방향으로 커집니다. 바깥쪽 눈금은
// 왼쪽이 0이고 시계 방향으로 커집니다(교과서 각도기와 같습니다).
export function ProtractorGraphic({ visual }: { visual: ProtractorVisual }) {
  const cx = 230;
  const cy = 232;
  const R = 200;
  const 점 = (deg: number, r: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)] as const;
  // 화면 각도(오른쪽 0, 반시계)로 두 변을 정합니다.
  const 밑변 = visual.base === 'inner' ? 0 : 180;
  const 다른변 = visual.base === 'inner' ? visual.deg : 180 - visual.deg;
  return (
    <svg viewBox="0 0 460 262" role="img" aria-label={visual.label}>
      <rect x="2" y="2" width="456" height="258" rx="12" {...판} />
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill="#fffde7" stroke="#8d6e63" strokeWidth="1.6" />
      {Array.from({ length: 181 }, (_, t) => {
        const 길이 = t % 10 === 0 ? 14 : t % 5 === 0 ? 9 : 5;
        const [x1, y1] = 점(t, R);
        const [x2, y2] = 점(t, R - 길이);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6d4c41" strokeWidth={t % 10 === 0 ? 1.4 : 0.7} />;
      })}
      {Array.from({ length: 19 }, (_, k) => {
        const t = k * 10;
        const [ox, oy] = 점(t, R - 28);
        const [ix, iy] = 점(t, R - 54);
        return (
          <g key={k}>
            <text x={ox} y={oy + 5} textAnchor="middle" fill="#4e342e" fontSize="14" fontWeight="800">{180 - t}</text>
            <text x={ix} y={iy + 5} textAnchor="middle" fill="#1565c0" fontSize="13" fontWeight="800">{t}</text>
          </g>
        );
      })}
      <line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} stroke="#6d4c41" strokeWidth="1.4" />
      {[밑변, 다른변].map((d, k) => {
        const [x, y] = 점(d, R + 18);
        return <line key={k} x1={cx} y1={cy} x2={x} y2={y} stroke="#d84315" strokeWidth="4" strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r="4.5" fill="#d84315" />
      <text x="12" y="22" fill="#4e342e" fontSize="12" fontWeight="800">바깥쪽 눈금(검정)</text>
      <text x="12" y="38" fill="#1565c0" fontSize="12" fontWeight="800">안쪽 눈금(파랑)</text>
    </svg>
  );
}

// ── 한 직선 위의 두 각 ──────────────────────────────────────────────
export function AngleSplitGraphic({ visual }: { visual: AngleSplitVisual }) {
  const cx = 170;
  const cy = 120;
  const r = 110;
  const a = (visual.known * Math.PI) / 180;
  const ex = cx + r * Math.cos(a);
  const ey = cy - r * Math.sin(a);
  const 호 = (from: number, to: number, rr: number) => {
    const p = (d: number) => [cx + rr * Math.cos((d * Math.PI) / 180), cy - rr * Math.sin((d * Math.PI) / 180)];
    const [x0, y0] = p(from);
    const [x1, y1] = p(to);
    return `M ${x0} ${y0} A ${rr} ${rr} 0 0 0 ${x1} ${y1}`;
  };
  const 글자 = (d: number, rr: number) => [cx + rr * Math.cos((d * Math.PI) / 180), cy - rr * Math.sin((d * Math.PI) / 180) + 5];
  const [kx, ky] = 글자(visual.known / 2, 52);
  const [ux, uy] = 글자((visual.known + 180) / 2, 52);
  return (
    <svg viewBox="0 0 340 150" role="img" aria-label={visual.label}>
      <rect x="2" y="2" width="336" height="146" rx="12" {...판} />
      <line x1={cx - r - 30} y1={cy} x2={cx + r + 30} y2={cy} stroke={선} strokeWidth="3" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={선} strokeWidth="3" />
      <path d={호(0, visual.known, 30)} fill="none" stroke="#ef6c00" strokeWidth="2" />
      <path d={호(visual.known, 180, 24)} fill="none" stroke="#1565c0" strokeWidth="2" />
      <text x={kx} y={ky} textAnchor="middle" fill="#bf360c" fontSize="15" fontWeight="900">{visual.known}°</text>
      <text x={ux} y={uy} textAnchor="middle" fill="#1565c0" fontSize="17" fontWeight="900">?</text>
    </svg>
  );
}

// ── 평행선 사이의 선분 ──────────────────────────────────────────────
export function ParallelDistanceGraphic({ visual }: { visual: ParallelDistanceVisual }) {
  const top = 36;
  const bottom = 116;
  const segs = visual.segments.slice(0, 4);
  return (
    <svg viewBox="0 0 380 150" role="img" aria-label={visual.label}>
      <rect x="2" y="2" width="376" height="146" rx="12" {...판} />
      <line x1="16" y1={top} x2="364" y2={top} stroke={선} strokeWidth="3" />
      <line x1="16" y1={bottom} x2="364" y2={bottom} stroke={선} strokeWidth="3" />
      <text x="20" y={top - 8} fill="#56708a" fontSize="11" fontWeight="800">가</text>
      <text x="20" y={bottom + 18} fill="#56708a" fontSize="11" fontWeight="800">나</text>
      {segs.map((sg, k) => {
        const x = 70 + k * (260 / Math.max(1, segs.length - 1 || 1));
        const x2 = x + sg.slant;
        return (
          <g key={k}>
            <line x1={x} y1={top} x2={x2} y2={bottom} stroke="#ef6c00" strokeWidth="2.6" />
            {sg.slant === 0 && <path d={`M ${x} ${bottom - 10} h 10 v 10`} fill="none" stroke="#ef6c00" strokeWidth="1.6" />}
            <text x={(x + x2) / 2 + 8} y={(top + bottom) / 2} fill="#bf360c" fontSize="13" fontWeight="900">{sg.text}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 수 배열표 ───────────────────────────────────────────────────────
export function NumberArrayGraphic({ visual }: { visual: NumberArrayVisual }) {
  const rows = visual.rows;
  const cols = Math.max(...rows.map((r) => r.length));
  const w = 70;
  const h = 34;
  const width = cols * w + 20;
  const height = rows.length * h + 20;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {rows.map((row, r) =>
        row.map((v, c) => (
          <g key={`${r}-${c}`}>
            <rect x={10 + c * w} y={10 + r * h} width={w} height={h} fill={v === null ? '#fff3e0' : '#ffffff'} stroke="#90a4ae" />
            <text x={10 + c * w + w / 2} y={10 + r * h + h / 2 + 5} textAnchor="middle" fill={v === null ? '#bf360c' : 글} fontSize="14" fontWeight="900">{v === null ? '?' : v}</text>
          </g>
        )),
      )}
    </svg>
  );
}
