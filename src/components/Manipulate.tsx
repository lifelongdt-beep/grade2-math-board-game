import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { GridPoint, GridSegment, Manipulation } from '../types';
import type { ManipResult, ManipState } from '../data/manipulate/check';
import { 길이말, 시각말, 자여백, 정답모습, 채점, 처음상태 } from '../data/manipulate/check';
import { resolveParticles } from '../data/grade5/util';
import { StackIsoPicture } from './StackIso';
import { 앞에서본, 옆에서본 } from '../data/manipulate/check';

// ════════════════════════════════════════════════════════════════════
// 손으로 조작해서 답하는 문항
// ────────────────────────────────────────────────────────────────────
// 보기를 고르는 대신 자를 밀고, 바늘을 돌리고, 점을 찍고, 선을 잇고,
// 도형을 밀고 돌립니다. 칠판(여럿이 한 화면)과 휴대폰 모두에서 손가락
// 하나로 되도록, 끌기는 pointer 이벤트로만 받고 모든 것이 눈금·모눈에
// 딱 붙습니다(snap).
//   · '도움' — 푸는 첫 걸음을 그림으로 보여 줍니다(정답은 보여 주지 않음).
//   · '확인' — 채점합니다. 틀리면 아이가 한 것 위에 바른 모습을 겹쳐
//     보여 주고, 알아본 실수에 맞춘 말을 붙입니다.
// ════════════════════════════════════════════════════════════════════

const 잉크 = '#1d2b3a';
const 모눈 = '#d3e2ec';
const 파랑 = '#1e88e5';
const 초록 = '#2e7d32';
const 빨강 = '#e53935';
const 주황 = '#ef6c00';
const 바탕 = '#f7fbff';
const 테두리 = { stroke: '#fff', strokeWidth: 3, paintOrder: 'stroke' as const };

type 설정 = (s: ManipState | ((prev: ManipState) => ManipState)) => void;

/** 화면의 손가락 자리를 svg 안의 좌표로 바꿉니다. */
const svg좌표 = (svg: SVGSVGElement | null, e: { clientX: number; clientY: number }): [number, number] => {
  if (!svg) return [0, 0];
  const ctm = svg.getScreenCTM();
  if (!ctm) return [0, 0];
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return [p.x, p.y];
};

const 붙잡기 = (e: ReactPointerEvent) => {
  e.preventDefault();
  (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
};

// ── 자로 길이 재기 ─────────────────────────────────────────────────
const MM = 2.2; // 1 mm의 크기(svg 단위)

function 자({ x, y, cm, unit, onDown, 강조영 = false, 표시 }: {
  x: number; y: number; cm: number; unit: 'cm' | 'mm'; onDown?: (e: ReactPointerEvent<SVGGElement>) => void; 강조영?: boolean; 표시?: number | null;
}) {
  const 길이 = (cm * 10 + 자여백 * 2) * MM;
  const 눈금: ReactNode[] = [];
  for (let k = 0; k <= cm * 10; k += unit === 'mm' ? 1 : 10) {
    const 큰 = k % 10 === 0;
    const 중간 = k % 5 === 0;
    const h = 큰 ? 16 : 중간 ? 11 : 7;
    const tx = x + (자여백 + k) * MM;
    눈금.push(<line key={k} x1={tx} y1={y} x2={tx} y2={y + h} stroke={잉크} strokeWidth={큰 ? 1.4 : 0.8} />);
    if (큰) 눈금.push(<text key={`t${k}`} x={tx} y={y + 30} textAnchor="middle" fontSize="11" fontWeight="800" fill={k === 0 && 강조영 ? 빨강 : 잉크}>{k / 10}</text>);
  }
  return (
    <g onPointerDown={onDown} style={{ cursor: onDown ? 'grab' : undefined }}>
      <rect x={x} y={y} width={길이} height={40} rx="4" fill="#fff7d6" stroke="#c9a227" strokeWidth="1.2" />
      {눈금}
      {강조영 && <circle cx={x + 자여백 * MM} cy={y + 2} r="5" fill="none" stroke={빨강} strokeWidth="2" />}
      {표시 !== undefined && 표시 !== null && (
        <path d={`M${x + (자여백 + 표시) * MM},${y - 1} l-6,-9 h12 z`} fill={빨강} />
      )}
      <text x={x + 길이 - 6} y={y + 37} textAnchor="end" fontSize="8" fill="#8a7a3a">cm</text>
    </g>
  );
}

function 물건({ x, y, mm, item, color = '#4fc3f7' }: { x: number; y: number; mm: number; item: string; color?: string }) {
  const w = mm * MM;
  const 연필 = /연필|색연필/.test(item);
  return (
    <g>
      {연필 ? (
        <path d={`M${x},${y} h${w - 14} l14,9 l-14,9 h-${w - 14} z`} fill={color} stroke={잉크} strokeWidth="1.2" />
      ) : (
        <rect x={x} y={y} width={w} height={18} rx="3" fill={color} stroke={잉크} strokeWidth="1.2" />
      )}
      <text x={x + w / 2} y={y - 6} textAnchor="middle" fontSize="12" fontWeight="900" fill={잉크}>{item}</text>
    </g>
  );
}

function 자로재기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'ruler-measure' }>; s: Extract<ManipState, { kind: 'ruler-measure' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'ruler-measure' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const 판폭 = Math.max(m.objectStartMm + m.objectMm + 20, m.rulerCm * 10 + 자여백 * 2 + 20) * MM + 20;
  const 왼 = 10;
  const 끌기 = useRef<{ x0: number; at0: number; moved: boolean } | null>(null);
  const 자위치 = (at: number) => 왼 + (at - 자여백) * MM;
  const down = (e: ReactPointerEvent<SVGGElement>) => {
    if (locked) return;
    붙잡기(e);
    끌기.current = { x0: svg좌표(ref.current, e)[0], at0: s.rulerAt, moved: false };
  };
  const move = (e: ReactPointerEvent) => {
    const d = 끌기.current;
    if (!d) return;
    const dx = svg좌표(ref.current, e)[0] - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    if (!d.moved) return;
    const at = Math.round(d.at0 + dx / MM);
    const 가장 = Math.round((판폭 - 20) / MM);
    set({ ...s, rulerAt: Math.max(-m.rulerCm * 5, Math.min(가장, at)) });
  };
  const up = (e: ReactPointerEvent) => {
    const d = 끌기.current;
    끌기.current = null;
    if (!d || d.moved || locked) return;
    // 끌지 않고 눌렀으면 그 자리 눈금을 고릅니다.
    const x = svg좌표(ref.current, e)[0];
    const 읽기 = (x - 자위치(s.rulerAt)) / MM - 자여백;
    const 간격 = m.unit === 'mm' ? 1 : 10;
    const t = Math.round(읽기 / 간격) * 간격;
    if (t < 0 || t > m.rulerCm * 10) return;
    set({ ...s, endTick: t });
  };
  return (
    <svg ref={ref} viewBox={`0 0 ${판폭} 130`} className="manip-svg" onPointerMove={move} onPointerUp={up} onPointerCancel={() => { 끌기.current = null; }}>
      <rect x="1" y="1" width={판폭 - 2} height="128" rx="10" fill={바탕} stroke={모눈} />
      <물건 x={왼 + m.objectStartMm * MM} y={40} mm={m.objectMm} item={m.item} />
      {도움 && <line x1={왼 + m.objectStartMm * MM} y1={22} x2={왼 + m.objectStartMm * MM} y2={118} stroke={빨강} strokeDasharray="4 3" strokeWidth="1.4" />}
      {도움 && <line x1={왼 + (m.objectStartMm + m.objectMm) * MM} y1={22} x2={왼 + (m.objectStartMm + m.objectMm) * MM} y2={118} stroke={주황} strokeDasharray="4 3" strokeWidth="1.4" />}
      {바른 && <g opacity="0.55"><자 x={자위치(바른.rulerAt)} y={62} cm={m.rulerCm} unit={m.unit} 표시={바른.endTick} /></g>}
      <g opacity={바른 ? 0.55 : 1}>
        <자 x={자위치(s.rulerAt)} y={62} cm={m.rulerCm} unit={m.unit} onDown={down} 강조영={도움} 표시={s.endTick} />
      </g>
      {바른 && <text x={판폭 - 12} y={20} textAnchor="end" fontSize="12" fontWeight="900" fill={초록}>바르게 재면 {길이말(m.objectMm, m.unit)}</text>}
    </svg>
  );
}

function 자로긋기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'ruler-draw' }>; s: Extract<ManipState, { kind: 'ruler-draw' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'ruler-draw' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const 판폭 = (m.rulerCm * 10 + 자여백 * 2) * MM + 24;
  const 왼 = 12;
  const 눈금x = (mm: number) => 왼 + (자여백 + mm) * MM;
  const 잡음 = useRef(false);
  const 간격 = m.unit === 'mm' ? 1 : 10;
  const move = (e: ReactPointerEvent) => {
    if (!잡음.current || locked) return;
    const x = svg좌표(ref.current, e)[0];
    const t = Math.round(((x - 왼) / MM - 자여백) / 간격) * 간격;
    set({ ...s, end: Math.max(0, Math.min(m.rulerCm * 10, t)) });
  };
  const 컴퍼스 = m.tool === 'compass';
  const 끝 = s.end;
  const 선 = (from: number, to: number, color: string) => 컴퍼스 ? (
    <g>
      <line x1={눈금x(from)} y1={70} x2={(눈금x(from) + 눈금x(to)) / 2} y2={18} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1={(눈금x(from) + 눈금x(to)) / 2} y1={18} x2={눈금x(to)} y2={70} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={(눈금x(from) + 눈금x(to)) / 2} cy={16} r="5" fill={color} />
      <path d={`M${눈금x(from)},70 l-3,-8 h6 z`} fill={잉크} />
    </g>
  ) : (
    <line x1={눈금x(from)} y1={64} x2={눈금x(to)} y2={64} stroke={color} strokeWidth="4" strokeLinecap="round" />
  );
  return (
    <svg ref={ref} viewBox={`0 0 ${판폭} 130`} className="manip-svg" onPointerMove={move} onPointerUp={() => { 잡음.current = false; }}>
      <rect x="1" y="1" width={판폭 - 2} height="128" rx="10" fill={바탕} stroke={모눈} />
      <자 x={왼} y={72} cm={m.rulerCm} unit={m.unit} 강조영={도움 && m.fromMm === 0} />
      {도움 && Array.from({ length: Math.floor((끝 - m.fromMm) / 10) }, (_, k) => (
        <text key={k} x={(눈금x(m.fromMm + k * 10) + 눈금x(m.fromMm + (k + 1) * 10)) / 2} y={58} textAnchor="middle" fontSize="10" fontWeight="900" fill={주황}>{k + 1}</text>
      ))}
      {바른 && <g opacity="0.6">{선(m.fromMm, 바른.end, 초록)}</g>}
      {선(m.fromMm, 끝, 파랑)}
      <circle cx={눈금x(m.fromMm)} cy={64} r="4" fill={잉크} />
      <g style={{ cursor: locked ? undefined : 'ew-resize' }} onPointerDown={(e) => { if (locked) return; 붙잡기(e); 잡음.current = true; }}>
        <circle cx={눈금x(끝)} cy={컴퍼스 ? 70 : 64} r="14" fill="rgba(30,136,229,0.18)" stroke={파랑} strokeWidth="2" />
        <text x={눈금x(끝)} y={컴퍼스 ? 74 : 68} textAnchor="middle" fontSize="11" fontWeight="900" fill={파랑}>{컴퍼스 ? '✎' : '◆'}</text>
      </g>
    </svg>
  );
}

// ── 시계 ──────────────────────────────────────────────────────────
function 시계({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'clock' }>; s: Extract<ManipState, { kind: 'clock' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'clock' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const C = 130;
  const R = 104;
  const 잡은 = useRef<'hour' | 'minute' | null>(null);
  const 각 = (x: number, y: number) => ((Math.atan2(x - C, -(y - C)) * 180) / Math.PI + 360) % 360;
  const 끝 = (deg: number, r: number) => [C + r * Math.sin((deg * Math.PI) / 180), C - r * Math.cos((deg * Math.PI) / 180)];
  const 놓기 = (which: 'hour' | 'minute', x: number, y: number) => {
    const a = 각(x, y);
    if (which === 'minute') {
      const 칸 = m.step * 6;
      set({ ...s, minuteDeg: (Math.round(a / 칸) * 칸) % 360 });
    } else {
      set({ ...s, hourDeg: (Math.round(a / 2.5) * 2.5) % 360 });
    }
  };
  const down = (e: ReactPointerEvent) => {
    if (locked) return;
    붙잡기(e);
    const [x, y] = svg좌표(ref.current, e);
    // 안쪽을 잡으면 짧은바늘, 바깥쪽을 잡으면 긴바늘입니다(두 바늘이 겹쳐도 고를 수 있게).
    const r = Math.hypot(x - C, y - C);
    잡은.current = r < R * 0.55 ? 'hour' : 'minute';
    놓기(잡은.current, x, y);
  };
  const move = (e: ReactPointerEvent) => {
    if (!잡은.current) return;
    const [x, y] = svg좌표(ref.current, e);
    놓기(잡은.current, x, y);
  };
  const 바늘 = (deg: number, r: number, w: number, color: string) => {
    const [x, y] = 끝(deg, r);
    return <line x1={C} y1={C} x2={x} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };
  return (
    <svg ref={ref} viewBox="0 0 260 260" className="manip-svg manip-square" onPointerDown={down} onPointerMove={move} onPointerUp={() => { 잡은.current = null; }} onPointerCancel={() => { 잡은.current = null; }}>
      <circle cx={C} cy={C} r={R + 18} fill={바탕} stroke={모눈} />
      <circle cx={C} cy={C} r={R} fill="#fff" stroke={잉크} strokeWidth="3" />
      <circle cx={C} cy={C} r={R * 0.55} fill="rgba(239,108,0,0.05)" stroke="rgba(239,108,0,0.25)" strokeDasharray="3 4" />
      {Array.from({ length: 60 }, (_, k) => {
        const [x1, y1] = 끝(k * 6, R - (k % 5 === 0 ? 9 : 4));
        const [x2, y2] = 끝(k * 6, R);
        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={잉크} strokeWidth={k % 5 === 0 ? 2 : 1} />;
      })}
      {Array.from({ length: 12 }, (_, k) => {
        const [x, y] = 끝((k + 1) * 30, R - 22);
        return <text key={k} x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="900" fill={잉크}>{k + 1}</text>;
      })}
      {도움 && Array.from({ length: 12 }, (_, k) => {
        const [x, y] = 끝(k * 30, R + 10);
        return <text key={`m${k}`} x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={주황}>{k * 5}분</text>;
      })}
      {바른 && <g opacity="0.45">{바늘(바른.hourDeg, R * 0.5, 8, 초록)}{바늘(바른.minuteDeg, R * 0.82, 5, 초록)}</g>}
      {바늘(s.hourDeg, R * 0.5, 8, 주황)}
      {바늘(s.minuteDeg, R * 0.82, 5, 파랑)}
      <circle cx={C} cy={C} r="6" fill={잉크} />
      <text x={6} y={252} fontSize="11" fontWeight="800" fill={주황}>안쪽: 짧은바늘</text>
      <text x={254} y={252} textAnchor="end" fontSize="11" fontWeight="800" fill={파랑}>바깥쪽: 긴바늘</text>
    </svg>
  );
}

// ── 모눈 ──────────────────────────────────────────────────────────
const 칸 = 30;
const 모눈여백 = 18;
const gx = (x: number) => 모눈여백 + x * 칸;
const gy = (y: number) => 모눈여백 + y * 칸;
const 경로 = (ps: GridPoint[], 닫기: boolean) => ps.map((p, k) => `${k ? 'L' : 'M'}${gx(p[0])},${gy(p[1])}`).join(' ') + (닫기 ? ' Z' : '');

function 모눈판({ cols, rows, children, onPoint, refSvg, axis, center, marks }: {
  cols: number; rows: number; children: ReactNode; onPoint?: (p: GridPoint) => void; refSvg?: React.RefObject<SVGSVGElement | null>;
  axis?: { x: number } | { y: number }; center?: GridPoint; marks?: { at: GridPoint; name: string }[];
}) {
  const 내ref = useRef<SVGSVGElement>(null);
  const ref = refSvg ?? 내ref;
  const W = cols * 칸 + 모눈여백 * 2;
  const H = rows * 칸 + 모눈여백 * 2;
  const down = (e: ReactPointerEvent) => {
    if (!onPoint) return;
    const [x, y] = svg좌표(ref.current, e);
    const px = Math.round((x - 모눈여백) / 칸);
    const py = Math.round((y - 모눈여백) / 칸);
    if (px < 0 || py < 0 || px > cols || py > rows) return;
    if (Math.hypot(gx(px) - x, gy(py) - y) > 칸 * 0.45) return;
    onPoint([px, py]);
  };
  return (
    <svg ref={ref as React.RefObject<SVGSVGElement>} viewBox={`0 0 ${W} ${H}`} className="manip-svg" onPointerDown={down}>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="10" fill={바탕} stroke={모눈} />
      {Array.from({ length: cols + 1 }, (_, t) => <line key={`v${t}`} x1={gx(t)} y1={gy(0)} x2={gx(t)} y2={gy(rows)} stroke={모눈} />)}
      {Array.from({ length: rows + 1 }, (_, t) => <line key={`h${t}`} x1={gx(0)} y1={gy(t)} x2={gx(cols)} y2={gy(t)} stroke={모눈} />)}
      {axis && 'x' in axis && <line x1={gx(axis.x)} y1={gy(0) - 6} x2={gx(axis.x)} y2={gy(rows) + 6} stroke={빨강} strokeWidth="2" strokeDasharray="6 4" />}
      {axis && 'y' in axis && <line x1={gx(0) - 6} y1={gy(axis.y)} x2={gx(cols) + 6} y2={gy(axis.y)} stroke={빨강} strokeWidth="2" strokeDasharray="6 4" />}
      {center && <circle cx={gx(center[0])} cy={gy(center[1])} r="5" fill={빨강} />}
      {children}
      {(marks ?? []).map((mk, k) => (
        <g key={`mk${k}`}>
          <circle cx={gx(mk.at[0])} cy={gy(mk.at[1])} r="4" fill={잉크} />
          <text x={gx(mk.at[0]) + 7} y={gy(mk.at[1]) - 6} fontSize="13" fontWeight="900" fill={잉크} {...테두리}>{mk.name}</text>
        </g>
      ))}
      {/* 누를 수 있는 점 */}
      {onPoint && Array.from({ length: (cols + 1) * (rows + 1) }, (_, k) => {
        const x = k % (cols + 1);
        const y = Math.floor(k / (cols + 1));
        return <circle key={`p${k}`} cx={gx(x)} cy={gy(y)} r="2.2" fill="#9fb4c4" />;
      })}
    </svg>
  );
}

function 점찍기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'grid-point' }>; s: Extract<ManipState, { kind: 'grid-point' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'grid-point' }>; 도움: boolean }) {
  return (
    <모눈판 cols={m.cols} rows={m.rows} axis={m.axis} center={m.center} marks={m.marks} onPoint={locked ? undefined : (pt) => set({ ...s, pt })}>
      {m.shapes.map((sh, k) => <path key={k} d={경로(sh.pts, sh.closed)} fill={sh.closed ? 'rgba(79,195,247,0.22)' : 'none'} stroke={잉크} strokeWidth="2.4" strokeLinejoin="round" />)}
      {도움 && m.guide?.map((g, k) => <line key={`g${k}`} x1={gx(g[0][0])} y1={gy(g[0][1])} x2={gx(g[1][0])} y2={gy(g[1][1])} stroke={주황} strokeWidth="1.8" strokeDasharray="4 3" />)}
      {바른?.pt && <circle cx={gx(바른.pt[0])} cy={gy(바른.pt[1])} r="9" fill="none" stroke={초록} strokeWidth="3" />}
      {s.pt && (
        <g>
          <circle cx={gx(s.pt[0])} cy={gy(s.pt[1])} r="6" fill={파랑} />
          <text x={gx(s.pt[0]) + 8} y={gy(s.pt[1]) + 15} fontSize="13" fontWeight="900" fill={파랑} {...테두리}>{m.pointName}</text>
        </g>
      )}
    </모눈판>
  );
}

function 선긋기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'grid-draw' }>; s: Extract<ManipState, { kind: 'grid-draw' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'grid-draw' }>; 도움: boolean }) {
  const [고른, set고른] = useState<GridPoint | null>(null);
  const 누름 = (p: GridPoint) => {
    if (!고른) { set고른(p); return; }
    if (고른[0] === p[0] && 고른[1] === p[1]) { set고른(null); return; }
    const seg: GridSegment = [고른, p];
    set({ ...s, segs: [...s.segs, seg] });
    // 이어 그리기 쉽게, 방금 끝난 점에서 다음 선을 시작합니다.
    set고른(p);
  };
  const 선 = (g: GridSegment, color: string, w: number, k: string, dash?: string) => (
    <line key={k} x1={gx(g[0][0])} y1={gy(g[0][1])} x2={gx(g[1][0])} y2={gy(g[1][1])} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
  );
  return (
    <모눈판 cols={m.cols} rows={m.rows} axis={m.axis} center={m.center} marks={m.marks} onPoint={locked ? undefined : 누름}>
      {m.fixed.map((g, k) => 선(g, 잉크, 3, `f${k}`))}
      {도움 && m.guide?.map((g, k) => 선(g, 주황, 1.8, `g${k}`, '4 3'))}
      {바른 && 바른.segs.map((g, k) => 선(g, 초록, 6, `r${k}`))}
      {s.segs.map((g, k) => 선(g, 파랑, 3.2, `s${k}`))}
      {고른 && !locked && <circle cx={gx(고른[0])} cy={gy(고른[1])} r="8" fill="rgba(30,136,229,0.25)" stroke={파랑} strokeWidth="2" />}
    </모눈판>
  );
}

// ── 도형 밀기·뒤집기·돌리기 ─────────────────────────────────────────
// 칸의 차례를 지키며 바꿉니다(표시한 칸이 어디로 가는지 아이가 따라가게).
const 바로 = (cells: GridPoint[]) => {
  const x0 = Math.min(...cells.map((c) => c[0]));
  const y0 = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - x0, y - y0] as GridPoint);
};
const 바꾸기 = {
  cw: (c: GridPoint[]) => 바로(c.map(([x, y]) => [-y, x] as GridPoint)),
  ccw: (c: GridPoint[]) => 바로(c.map(([x, y]) => [y, -x] as GridPoint)),
  flipH: (c: GridPoint[]) => 바로(c.map(([x, y]) => [-x, y] as GridPoint)),
  flipV: (c: GridPoint[]) => 바로(c.map(([x, y]) => [x, -y] as GridPoint)),
};
const 도구이름 = { cw: '↻ 시계 방향 90°', ccw: '↺ 반대 방향 90°', flipH: '⇆ 오른쪽으로 뒤집기', flipV: '⇅ 아래쪽으로 뒤집기' } as const;

function 도형움직이기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'shape-move' }>; s: Extract<ManipState, { kind: 'shape-move' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'shape-move' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const 끌기 = useRef<{ x0: number; y0: number; o: GridPoint } | null>(null);
  const 너비 = Math.max(...s.cells.map((c) => c[0])) + 1;
  const 높이 = Math.max(...s.cells.map((c) => c[1])) + 1;
  const 가두기 = (o: GridPoint, cells: GridPoint[]): GridPoint => {
    const w = Math.max(...cells.map((c) => c[0])) + 1;
    const h = Math.max(...cells.map((c) => c[1])) + 1;
    return [Math.max(0, Math.min(m.cols - w, o[0])), Math.max(0, Math.min(m.rows - h, o[1]))];
  };
  const 움직임 = m.tools.includes('move');
  const 칸그림 = (cells: GridPoint[], o: GridPoint, fill: string, stroke: string, k: string, 표시 = false) => (
    <g key={k}>
      {cells.map(([x, y], i) => (
        <rect key={i} x={gx(x + o[0])} y={gy(y + o[1])} width={칸} height={칸} fill={i === 0 && 표시 ? '#ffd54f' : fill} stroke={stroke} strokeWidth="1.6" />
      ))}
      {표시 && <text x={gx(cells[0][0] + o[0]) + 칸 / 2} y={gy(cells[0][1] + o[1]) + 칸 / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={잉크}>★</text>}
    </g>
  );
  return (
    <div className="manip-shape-move">
      <모눈판 cols={m.cols} rows={m.rows} refSvg={ref}>
        {m.ghost && 칸그림(m.goal.cells, [0, 0], 'rgba(46,125,50,0.12)', 'rgba(46,125,50,0.7)', 'ghost')}
        {(도움 || !움직임) && 칸그림(바로(m.cells), m.start, 'rgba(120,144,156,0.12)', 'rgba(120,144,156,0.6)', 'start')}
        {바른 && 칸그림(바른.cells, 바른.offset, 'rgba(46,125,50,0.35)', 초록, 'right')}
        <g
          style={{ cursor: 움직임 && !locked ? 'grab' : undefined, touchAction: 'none' }}
          onPointerDown={(e) => {
            if (!움직임 || locked) return;
            붙잡기(e);
            const [x, y] = svg좌표(ref.current, e);
            끌기.current = { x0: x, y0: y, o: s.offset };
          }}
          onPointerMove={(e) => {
            const d = 끌기.current;
            if (!d) return;
            const [x, y] = svg좌표(ref.current, e);
            const o = 가두기([d.o[0] + Math.round((x - d.x0) / 칸), d.o[1] + Math.round((y - d.y0) / 칸)], s.cells);
            if (o[0] !== s.offset[0] || o[1] !== s.offset[1]) set({ ...s, offset: o });
          }}
          onPointerUp={() => { 끌기.current = null; }}
        >
          {칸그림(s.cells, s.offset, 'rgba(30,136,229,0.55)', '#0d47a1', 'now', true)}
        </g>
        {도움 && 움직임 && (
          <text x={gx(s.offset[0] + 너비 / 2)} y={gy(s.offset[1] + 높이) + 14} textAnchor="middle" fontSize="11" fontWeight="900" fill={주황} {...테두리}>
            처음 자리에서 오른쪽 {s.offset[0] - m.start[0]}칸, 아래 {s.offset[1] - m.start[1]}칸
          </text>
        )}
      </모눈판>
      <div className="manip-tools">
        {m.tools.filter((t): t is 'cw' | 'ccw' | 'flipH' | 'flipV' => t !== 'move').map((t) => (
          <button key={t} type="button" disabled={locked} onClick={() => {
            const cells = 바꾸기[t](s.cells);
            set({ ...s, cells, offset: 가두기(s.offset, cells) });
          }}>{도구이름[t]}</button>
        ))}
      </div>
    </div>
  );
}

// ── 수직선 ────────────────────────────────────────────────────────
function 수직선({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'number-line' }>; s: Extract<ManipState, { kind: 'number-line' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'number-line' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const W = 360;
  const 왼 = 22;
  const 길이 = W - 44;
  const x = (k: number) => 왼 + (k / m.ticks) * 길이;
  const 큰눈금 = new Set(m.labels.map((l) => l.at));
  const down = (e: ReactPointerEvent) => {
    if (locked) return;
    const [px] = svg좌표(ref.current, e);
    const k = Math.round(((px - 왼) / 길이) * m.ticks);
    if (k < 0 || k > m.ticks) return;
    set({ ...s, at: k });
  };
  // 도움: 이름 붙은 눈금에서부터 작은 눈금을 1, 2, 3… 세어 줍니다.
  const 앞이름 = (k: number) => Math.max(...m.labels.map((l) => l.at).filter((a) => a <= k));
  return (
    <svg ref={ref} viewBox={`0 0 ${W} 110`} className="manip-svg" onPointerDown={down}>
      <rect x="1" y="1" width={W - 2} height="108" rx="10" fill={바탕} stroke={모눈} />
      <line x1={왼 - 8} y1={60} x2={왼 + 길이 + 8} y2={60} stroke={잉크} strokeWidth="2.4" />
      {Array.from({ length: m.ticks + 1 }, (_, k) => {
        const 큰 = 큰눈금.has(k) || (m.minor !== undefined && k % m.minor === 0);
        return <line key={k} x1={x(k)} y1={큰 ? 48 : 53} x2={x(k)} y2={큰 ? 72 : 67} stroke={잉크} strokeWidth={큰 ? 2 : 1.2} />;
      })}
      {m.labels.map((l) => <text key={l.at} x={x(l.at)} y={92} textAnchor="middle" fontSize="13" fontWeight="900" fill={잉크}>{l.text}</text>)}
      {도움 && Array.from({ length: m.ticks + 1 }, (_, k) => (큰눈금.has(k) ? null : (
        <text key={`c${k}`} x={x(k)} y={42} textAnchor="middle" fontSize="9" fontWeight="900" fill={주황}>{k - 앞이름(k)}</text>
      )))}
      {바른?.at !== null && 바른 && <circle cx={x(바른.at!)} cy={60} r="10" fill="none" stroke={초록} strokeWidth="3" />}
      {s.at !== null && <path d={`M${x(s.at)},58 l-8,-16 h16 z`} fill={파랑} stroke="#fff" strokeWidth="1.5" />}
    </svg>
  );
}

// ── 칸 색칠하기·구슬 놓기 ───────────────────────────────────────────
function 색칠하기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'tap-fill' }>; s: Extract<ManipState, { kind: 'tap-fill' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'tap-fill' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const 칠하기 = useRef<boolean | null>(null);
  const 켜짐 = new Set(s.on);
  const 미리 = new Set(m.pre);
  const 바른칸 = 바른 ? new Set([...바른.on, ...m.pre]) : null;
  const 누름 = (k: number) => {
    if (locked || 미리.has(k)) return;
    set({ ...s, on: 켜짐.has(k) ? s.on.filter((v) => v !== k) : [...s.on, k] });
  };
  const 색 = (k: number) => (미리.has(k) ? '#90a4ae' : 켜짐.has(k) ? '#42a5f5' : '#fff');
  const 번호 = (k: number, cx: number, cy: number) => 도움 && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill={주황} pointerEvents="none">{k + 1}</text>;
  const 틀 = (k: number, el: ReactNode) => (
    <g key={k} onPointerDown={(e) => { e.preventDefault(); 누름(k); }} style={{ cursor: locked ? undefined : 'pointer' }}>{el}</g>
  );
  let 그림: ReactNode;
  let W = 340;
  let H = 120;
  if (m.layout === 'bar') {
    const w = (W - 40) / m.parts;
    그림 = Array.from({ length: m.parts }, (_, k) => 틀(k, <>
      <rect x={20 + k * w} y={30} width={w} height={56} fill={색(k)} stroke={바른칸?.has(k) ? 초록 : 잉크} strokeWidth={바른칸?.has(k) ? 4 : 1.6} />
      {번호(k, 20 + k * w + w / 2, 58)}
    </>));
  } else if (m.layout === 'circle') {
    W = 240; H = 240;
    const C = 120; const R = 100;
    그림 = Array.from({ length: m.parts }, (_, k) => {
      const a0 = (k / m.parts) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((k + 1) / m.parts) * Math.PI * 2 - Math.PI / 2;
      const big = a1 - a0 > Math.PI ? 1 : 0;
      const d = `M${C},${C} L${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} A${R},${R} 0 ${big} 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} Z`;
      const am = (a0 + a1) / 2;
      return 틀(k, <><path d={d} fill={색(k)} stroke={바른칸?.has(k) ? 초록 : 잉크} strokeWidth={바른칸?.has(k) ? 4 : 1.6} />{번호(k, C + R * 0.62 * Math.cos(am), C + R * 0.62 * Math.sin(am))}</>);
    });
  } else {
    const cols = m.layout === 'tenframe' ? 5 : m.cols ?? Math.min(10, m.parts);
    const rows = Math.ceil(m.parts / cols);
    const 한칸 = Math.min(34, 300 / cols);
    W = cols * 한칸 + 40; H = rows * 한칸 + 30 + (m.layout === 'tenframe' ? Math.floor((rows - 1) / 2) * 10 : 0);
    그림 = Array.from({ length: m.parts }, (_, k) => {
      const c = k % cols; const r = Math.floor(k / cols);
      const x0 = 20 + c * 한칸;
      const y0 = 15 + r * 한칸 + (m.layout === 'tenframe' ? Math.floor(r / 2) * 10 : 0);
      const cx = x0 + 한칸 / 2; const cy = y0 + 한칸 / 2;
      if (m.layout === 'grid') {
        // 모눈은 누른 채로 끌어 여러 칸을 칠합니다(svg 쪽에서 받습니다).
        return <g key={k}><rect x={x0} y={y0} width={한칸} height={한칸} fill={색(k)} stroke={바른칸?.has(k) ? 초록 : 잉크} strokeWidth={바른칸?.has(k) ? 3.5 : 1.2} />{번호(k, cx, cy)}</g>;
      }
      if (m.layout === 'objects') {
        return 틀(k, <>
          <rect x={x0 + 1} y={y0 + 1} width={한칸 - 2} height={한칸 - 2} rx="6" fill={켜짐.has(k) || 미리.has(k) ? 'rgba(66,165,245,0.35)' : 'transparent'} stroke={바른칸?.has(k) ? 초록 : 켜짐.has(k) ? 파랑 : 'transparent'} strokeWidth="2.5" />
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize={한칸 * 0.62}>{m.emoji ?? '●'}</text>
          {번호(k, x0 + 7, y0 + 7)}
        </>);
      }
      // 십 배열판: 칸에 구슬을 놓습니다.
      return 틀(k, <>
        <rect x={x0} y={y0} width={한칸} height={한칸} fill="#fff" stroke={바른칸?.has(k) ? 초록 : 잉크} strokeWidth={바른칸?.has(k) ? 3.5 : 1.4} />
        {(켜짐.has(k) || 미리.has(k)) && <circle cx={cx} cy={cy} r={한칸 * 0.36} fill={미리.has(k) ? '#ef5350' : '#42a5f5'} stroke={잉크} strokeWidth="1" />}
        {번호(k, cx, cy)}
      </>);
    });
  }
  const 앞자리 = useRef<[number, number] | null>(null);
  const 칸번호 = (x: number, y: number): number | null => {
    const cols = m.cols ?? Math.min(10, m.parts);
    const 한칸 = Math.min(34, 300 / cols);
    const c = Math.floor((x - 20) / 한칸);
    const r = Math.floor((y - 15) / 한칸);
    if (c < 0 || c >= cols || r < 0) return null;
    const k = r * cols + c;
    return k < m.parts ? k : null;
  };
  /** 앞 자리에서 지금 자리까지 지나간 칸을 모두 칠합니다(빨리 끌어도 칸을 건너뛰지 않게). */
  const 끌며칠 = (e: ReactPointerEvent, 켜기: boolean) => {
    const [x, y] = svg좌표(ref.current, e);
    const [x0, y0] = 앞자리.current ?? [x, y];
    const 걸음 = Math.max(1, Math.ceil(Math.hypot(x - x0, y - y0) / 4));
    for (let t = 1; t <= 걸음; t += 1) 칠(칸번호(x0 + ((x - x0) * t) / 걸음, y0 + ((y - y0) * t) / 걸음), 켜기);
    앞자리.current = [x, y];
  };
  const 칠 = (k: number | null, 켜기: boolean) => {
    if (k === null || 미리.has(k)) return;
    // 빨리 끌면 그리기 전에 여러 번 불리므로, 앞 상태를 받아서 바꿉니다.
    set((prev) => {
      if (prev.kind !== 'tap-fill' || prev.on.includes(k) === 켜기) return prev;
      return { ...prev, on: 켜기 ? [...prev.on, k] : prev.on.filter((v) => v !== k) };
    });
  };
  const 모눈인가 = m.layout === 'grid';
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={`manip-svg ${m.layout === 'circle' ? 'manip-square' : ''}`}
      onPointerDown={모눈인가 ? (e) => {
        if (locked) return;
        붙잡기(e);
        const [x, y] = svg좌표(ref.current, e);
        const k = 칸번호(x, y);
        if (k === null) return;
        칠하기.current = !켜짐.has(k);
        앞자리.current = [x, y];
        칠(k, 칠하기.current);
      } : undefined}
      onPointerMove={모눈인가 ? (e) => { if (칠하기.current !== null) 끌며칠(e, 칠하기.current); } : undefined}
      onPointerUp={모눈인가 ? () => { 칠하기.current = null; 앞자리.current = null; } : undefined}>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="10" fill={바탕} stroke={모눈} />
      {그림}
    </svg>
  );
}

// ── 수 모형 ───────────────────────────────────────────────────────
const 자리이름: Record<number, string> = { 1000: '천 모형', 100: '백 모형', 10: '십 모형', 1: '일 모형' };
function 수모형({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'base-ten' }>; s: Extract<ManipState, { kind: 'base-ten' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'base-ten' }>; 도움: boolean }) {
  const 모형 = (place: number, k: number) => {
    if (place === 1000) return <rect key={k} x={(k % 3) * 22} y={Math.floor(k / 3) * 22} width="18" height="18" rx="2" fill="#ab47bc" stroke={잉크} />;
    if (place === 100) return <g key={k} transform={`translate(${(k % 3) * 22},${Math.floor(k / 3) * 22})`}><rect width="18" height="18" fill="#ffb74d" stroke={잉크} />{[6, 12].map((t) => <line key={t} x1={t} y1={0} x2={t} y2={18} stroke={잉크} strokeWidth="0.5" />)}</g>;
    if (place === 10) return <rect key={k} x={k * 7} y={0} width="5" height="40" fill="#4fc3f7" stroke={잉크} strokeWidth="0.8" />;
    return <rect key={k} x={(k % 5) * 9} y={Math.floor(k / 5) * 9} width="7" height="7" fill="#aed581" stroke={잉크} strokeWidth="0.8" />;
  };
  const 값 = s.counts.reduce((sum, c, i) => sum + c * m.places[i], 0);
  return (
    <div className="manip-base-ten">
      {m.places.map((place, i) => (
        <div key={place} className={`manip-place ${바른 && 바른.counts[i] !== s.counts[i] ? 'wrong' : ''}`}>
          <strong>{자리이름[place]}</strong>
          <svg viewBox="0 0 70 70" className="manip-place-svg">{Array.from({ length: s.counts[i] }, (_, k) => 모형(place, k))}</svg>
          <span className="manip-count">{s.counts[i]}개{바른 && 바른.counts[i] !== s.counts[i] ? ` → ${바른.counts[i]}개` : ''}</span>
          <div className="manip-pm">
            <button type="button" disabled={locked || s.counts[i] === 0} onClick={() => set({ ...s, counts: s.counts.map((c, j) => (j === i ? c - 1 : c)) })}>－</button>
            <button type="button" disabled={locked || s.counts[i] === 9} onClick={() => set({ ...s, counts: s.counts.map((c, j) => (j === i ? c + 1 : c)) })}>＋</button>
          </div>
        </div>
      ))}
      {도움 && <p className="manip-help-line">지금 만든 수: {값}</p>}
    </div>
  );
}

// ── 그래프 ────────────────────────────────────────────────────────
function 그래프({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'bars' }>; s: Extract<ManipState, { kind: 'bars' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'bars' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const 칸수 = m.max / m.step;
  const 칸높이 = Math.min(22, 170 / 칸수);
  const 왼 = 38;
  const 위 = 14;
  const 바닥 = 위 + 칸수 * 칸높이;
  const 폭 = Math.min(54, 280 / m.labels.length);
  const W = 왼 + m.labels.length * 폭 + 12;
  const H = 바닥 + 34;
  const 잡은 = useRef<number | null>(null);
  const 놓기 = (e: ReactPointerEvent) => {
    const i = 잡은.current;
    if (i === null) return;
    const [, y] = svg좌표(ref.current, e);
    const v = Math.max(0, Math.min(칸수, Math.round((바닥 - y) / 칸높이))) * m.step;
    set({ ...s, vals: s.vals.map((old, j) => (j === i ? v : old)) });
  };
  const cx = (i: number) => 왼 + i * 폭 + 폭 / 2;
  const cy = (v: number) => 바닥 - (v / m.step) * 칸높이;
  const 선점 = s.vals.map((v, i) => (v === null ? null : [cx(i), cy(v)] as [number, number]));
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="manip-svg" onPointerMove={놓기} onPointerUp={() => { 잡은.current = null; }} onPointerCancel={() => { 잡은.current = null; }}>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="10" fill={바탕} stroke={모눈} />
      {Array.from({ length: 칸수 + 1 }, (_, k) => (
        <g key={k}>
          <line x1={왼} y1={바닥 - k * 칸높이} x2={W - 10} y2={바닥 - k * 칸높이} stroke={k ? 모눈 : 잉크} strokeWidth={k ? 1 : 2} />
          {(m.style !== 'stack') && (k % (칸수 > 10 ? 2 : 1) === 0 || 도움) && <text x={왼 - 5} y={바닥 - k * 칸높이 + 4} textAnchor="end" fontSize="10" fontWeight="800" fill={도움 && k % (칸수 > 10 ? 2 : 1) ? 주황 : 잉크}>{k * m.step}</text>}
        </g>
      ))}
      <line x1={왼} y1={위 - 4} x2={왼} y2={바닥} stroke={잉크} strokeWidth="2" />
      <text x={6} y={10} fontSize="9" fill={잉크}>({m.unitLabel})</text>
      {m.labels.map((label, i) => {
        const v = s.vals[i];
        const 고정 = m.pre.includes(i);
        const 바른값 = 바른?.vals[i];
        return (
          <g key={label}
            onPointerDown={(e) => { if (locked || 고정) return; 붙잡기(e); 잡은.current = i; 놓기(e); }}
            style={{ cursor: locked || 고정 ? undefined : 'ns-resize' }}>
            <rect x={왼 + i * 폭} y={위} width={폭} height={바닥 - 위} fill="transparent" />
            {m.style === 'bar' && v !== null && <rect x={cx(i) - 폭 * 0.3} y={cy(v)} width={폭 * 0.6} height={바닥 - cy(v)} fill={고정 ? '#90a4ae' : '#42a5f5'} stroke={잉크} />}
            {m.style === 'stack' && v !== null && Array.from({ length: v / m.step }, (_, k) => <circle key={k} cx={cx(i)} cy={바닥 - (k + 0.5) * 칸높이} r={칸높이 * 0.38} fill="none" stroke={고정 ? '#607d8b' : 파랑} strokeWidth="2.4" />)}
            {m.style === 'line' && v !== null && <circle cx={cx(i)} cy={cy(v)} r="5" fill={고정 ? '#607d8b' : 파랑} />}
            {v === null && !locked && <text x={cx(i)} y={바닥 - 6} textAnchor="middle" fontSize="10" fill="#90a4ae">↕</text>}
            {바른값 !== undefined && 바른값 !== null && 바른값 !== v && <line x1={cx(i) - 폭 * 0.36} y1={cy(바른값)} x2={cx(i) + 폭 * 0.36} y2={cy(바른값)} stroke={초록} strokeWidth="3.5" />}
            <text x={cx(i)} y={바닥 + 16} textAnchor="middle" fontSize="11" fontWeight="900" fill={잉크}>{label}</text>
          </g>
        );
      })}
      {m.style === 'line' && 선점.every(Boolean) && <polyline points={선점.map((p) => p!.join(',')).join(' ')} fill="none" stroke={파랑} strokeWidth="2.4" pointerEvents="none" />}
    </svg>
  );
}

// ── 각 만들기 ─────────────────────────────────────────────────────
function 각만들기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'angle' }>; s: Extract<ManipState, { kind: 'angle' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'angle' }>; 도움: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const C: [number, number] = [170, 178];
  const R = 140;
  const 잡음 = useRef(false);
  const 끝 = (deg: number, r: number) => [C[0] + r * Math.cos((deg * Math.PI) / 180), C[1] - r * Math.sin((deg * Math.PI) / 180)];
  const 놓기 = (e: ReactPointerEvent) => {
    if (!잡음.current || locked) return;
    const [x, y] = svg좌표(ref.current, e);
    let a = (Math.atan2(C[1] - y, x - C[0]) * 180) / Math.PI;
    if (a < 0) a = a < -90 ? 180 : 0;
    set({ ...s, deg: Math.max(0, Math.min(180, Math.round(a / 5) * 5)) });
  };
  const [ex, ey] = 끝(s.deg, R);
  return (
    <svg ref={ref} viewBox="0 0 340 200" className="manip-svg" onPointerMove={놓기} onPointerUp={() => { 잡음.current = false; }}
      onPointerDown={(e) => { if (locked) return; 붙잡기(e); 잡음.current = true; 놓기(e); }}>
      <rect x="1" y="1" width="338" height="198" rx="10" fill={바탕} stroke={모눈} />
      {m.protractor && (
        <g>
          <path d={`M${C[0] - R + 8},${C[1]} A${R - 8},${R - 8} 0 0 1 ${C[0] + R - 8},${C[1]} Z`} fill="rgba(255,236,179,0.55)" stroke="#c9a227" />
          {Array.from({ length: 37 }, (_, k) => {
            const deg = k * 5;
            const [x1, y1] = 끝(deg, R - 8 - (k % 2 === 0 ? 12 : 6));
            const [x2, y2] = 끝(deg, R - 8);
            return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={잉크} strokeWidth={k % 2 === 0 ? 1.2 : 0.7} />;
          })}
          {Array.from({ length: 19 }, (_, k) => {
            const deg = k * 10;
            const [x, y] = 끝(deg, R - 30);
            const [x2, y2] = 끝(deg, R - 46);
            return (
              <g key={k}>
                <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill={도움 ? 빨강 : 잉크}>{deg}</text>
                <text x={x2} y={y2 + 4} textAnchor="middle" fontSize="8" fill="#6d7f8f">{180 - deg}</text>
              </g>
            );
          })}
        </g>
      )}
      {!m.protractor && 도움 && <path d={`M${C[0]},${C[1]} L${C[0] + 30},${C[1]} L${C[0] + 30},${C[1] - 30} L${C[0]},${C[1] - 30}`} fill="none" stroke={주황} strokeWidth="1.6" strokeDasharray="3 3" />}
      <line x1={C[0]} y1={C[1]} x2={C[0] + R + 10} y2={C[1]} stroke={잉크} strokeWidth="3" />
      {바른 && (() => { const [bx, by] = 끝(바른.deg, R); return <line x1={C[0]} y1={C[1]} x2={bx} y2={by} stroke={초록} strokeWidth="5" opacity="0.6" />; })()}
      <line x1={C[0]} y1={C[1]} x2={ex} y2={ey} stroke={파랑} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="12" fill="rgba(30,136,229,0.18)" stroke={파랑} strokeWidth="2" />
      <circle cx={C[0]} cy={C[1]} r="4" fill={잉크} />
      {s.deg > 0 && <path d={`M${C[0] + 22},${C[1]} A22,22 0 0 0 ${끝(s.deg, 22)[0]},${끝(s.deg, 22)[1]}`} fill="none" stroke={주황} strokeWidth="2" />}
      {!m.protractor && s.deg === 90 && <rect x={C[0]} y={C[1] - 14} width="14" height="14" fill="none" stroke={주황} strokeWidth="1.6" />}
    </svg>
  );
}

// ── 분류하기 ──────────────────────────────────────────────────────
function 나누기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'sort-bins' }>; s: Extract<ManipState, { kind: 'sort-bins' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'sort-bins' }>; 도움: boolean }) {
  const [고른, set고른] = useState<number | null>(null);
  const 물건칩 = (i: number) => {
    const it = m.items[i];
    const 틀림 = 바른 && 바른.placed[i] !== s.placed[i];
    return (
      <button key={i} type="button" disabled={locked} className={`manip-chip ${고른 === i ? 'picked' : ''} ${틀림 ? 'wrong' : ''}`}
        onClick={() => set고른(고른 === i ? null : i)}>
        {it.emoji && <span className="manip-chip-emoji">{it.emoji}</span>}<span>{it.label}</span>
        {틀림 && <small> → {m.bins[바른!.placed[i]!]}</small>}
      </button>
    );
  };
  return (
    <div className="manip-sort">
      <div className="manip-sort-pool">
        {m.items.map((_, i) => (s.placed[i] === null ? 물건칩(i) : null))}
        {s.placed.every((p) => p !== null) && <span className="manip-help-line">모두 옮겼어요.</span>}
      </div>
      <div className="manip-bins" style={{ gridTemplateColumns: `repeat(${m.bins.length}, minmax(0, 1fr))` }}>
        {m.bins.map((bin, b) => (
          <div key={bin} className={`manip-bin ${고른 !== null ? 'ready' : ''}`} role="button" tabIndex={0}
            onClick={() => {
              if (locked || 고른 === null) return;
              set({ ...s, placed: s.placed.map((p, i) => (i === 고른 ? b : p)) });
              set고른(null);
            }}>
            <strong>{bin}</strong>
            <div className="manip-bin-items">{m.items.map((_, i) => (s.placed[i] === b ? 물건칩(i) : null))}</div>
          </div>
        ))}
      </div>
      {도움 && <p className="manip-help-line">물건을 누른 다음 넣을 칸을 누르세요. 칸에 든 것을 누르면 다시 옮길 수 있어요.</p>}
    </div>
  );
}


// ── 쌓기나무 쌓기 ─────────────────────────────────────────────────
/** 본 모양(층수 막대)을 정사각형 칸으로 그립니다. cols[k]는 k째 줄의 층수입니다. */
function 본모양({ 이름, 층들, x, 칸, 높이 }: { 이름: string; 층들: number[]; x: number; 칸: number; 높이: number }) {
  const 바닥 = 높이 - 22;
  return (
    <g>
      {층들.map((n, k) => Array.from({ length: n }, (_, z) => (
        <rect key={`${k}-${z}`} x={x + k * 칸} y={바닥 - (z + 1) * 칸} width={칸} height={칸} fill="#dffafa" stroke="#0f7175" strokeWidth="1.6" />
      )))}
      <text x={x + (층들.length * 칸) / 2} y={높이 - 6} textAnchor="middle" fontSize="12" fontWeight="900" fill={잉크}>{이름}</text>
    </g>
  );
}

function 위모양({ 이름, 판, x, y, 칸, 수 = false, 층 }: { 이름: string; 판: number[][]; x: number; y: number; 칸: number; 수?: boolean; 층?: number }) {
  return (
    <g>
      {판.map((row, r) => row.map((v, c) => {
        const 칠함 = 층 === undefined ? v > 0 : v >= 층;
        return <rect key={`${r}-${c}`} x={x + c * 칸} y={y + r * 칸} width={칸} height={칸} fill={칠함 ? '#9edce8' : '#fff'} stroke={칠함 ? '#0f7175' : '#cfe3ea'} strokeWidth="1.4" />;
      }))}
      {수 && 판.map((row, r) => row.map((v, c) => v > 0 && <text key={`t${r}-${c}`} x={x + c * 칸 + 칸 / 2} y={y + r * 칸 + 칸 / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill={잉크}>{v}</text>))}
      <text x={x + (판[0].length * 칸) / 2} y={y + 판.length * 칸 + 14} textAnchor="middle" fontSize="12" fontWeight="900" fill={잉크}>{이름}</text>
    </g>
  );
}

function 쌓기({ m, s, set, locked, 바른, 도움 }: { m: Extract<Manipulation, { kind: 'stack-build' }>; s: Extract<ManipState, { kind: 'stack-build' }>; set: 설정; locked: boolean; 바른?: Extract<ManipState, { kind: 'stack-build' }>; 도움: boolean }) {
  const 칸 = 22;
  // 보고 쌓을 것
  let 보기: ReactNode;
  if (m.show === 'iso') {
    보기 = <div className="manip-stack-target"><StackIsoPicture h={m.target} 크기={26} label="쌓은 모양" /></div>;
  } else if (m.show === 'layers') {
    const 층수 = Math.max(...m.target.flat());
    const 폭 = m.cols * 칸 + 20;
    보기 = (
      <svg viewBox={`0 0 ${폭 * 층수} ${m.rows * 칸 + 26}`} className="manip-svg manip-stack-views">
        <rect x="1" y="1" width={폭 * 층수 - 2} height={m.rows * 칸 + 24} rx="8" fill={바탕} stroke={모눈} />
        {Array.from({ length: 층수 }, (_, k) => <위모양 key={k} 이름={`${k + 1}층`} 판={m.target} x={10 + k * 폭} y={4} 칸={칸} 층={k + 1} />)}
      </svg>
    );
  } else {
    const 앞 = 앞에서본(m.target);
    const 옆 = 옆에서본(m.target);
    const 높이 = Math.max(m.rows * 칸 + 26, Math.max(...앞, ...옆) * 칸 + 26);
    const 폭 = [m.cols * 칸 + 24, m.cols * 칸 + 24, m.rows * 칸 + 24];
    보기 = (
      <svg viewBox={`0 0 ${폭[0] + 폭[1] + 폭[2]} ${높이}`} className="manip-svg manip-stack-views">
        <rect x="1" y="1" width={폭[0] + 폭[1] + 폭[2] - 2} height={높이 - 2} rx="8" fill={바탕} stroke={모눈} />
        <위모양 이름="위" 판={m.target} x={12} y={높이 - 22 - m.rows * 칸} 칸={칸} />
        <본모양 이름="앞" 층들={앞} x={폭[0] + 12} 칸={칸} 높이={높이} />
        <본모양 이름="옆" 층들={옆} x={폭[0] + 폭[1] + 12} 칸={칸} 높이={높이} />
      </svg>
    );
  }
  const 누름 = (r: number, c: number) => {
    if (locked) return;
    set((prev) => (prev.kind !== 'stack-build' ? prev : { ...prev, h: prev.h.map((row, i) => row.map((v, j) => (i === r && j === c ? (v + 1) % (m.maxH + 1) : v))) }));
  };
  const 판칸 = 44;
  const 개수 = s.h.flat().reduce((a, b) => a + b, 0);
  return (
    <div className="manip-stack">
      {보기}
      <div className="manip-stack-work">
        <div className="manip-stack-grid" style={{ gridTemplateColumns: `repeat(${m.cols}, ${판칸}px)` }} aria-label="위에서 본 모양(아래쪽이 앞)">
          {s.h.map((row, r) => row.map((v, c) => {
            const 바른값 = 바른?.h[r][c];
            return (
              <button key={`${r}-${c}`} type="button" disabled={locked} onClick={() => 누름(r, c)} className={`${v ? 'on' : ''} ${바른값 !== undefined && 바른값 !== v ? 'wrong' : ''}`}>
                {v || ''}
                {바른값 !== undefined && 바른값 !== v && <small>→{바른값}</small>}
              </button>
            );
          }))}
          <span className="manip-stack-front" style={{ gridColumn: `1 / span ${m.cols}` }}>앞</span>
        </div>
        <div className="manip-stack-preview">
          <StackIsoPicture h={s.h.some((row) => row.some(Boolean)) ? s.h : s.h.map((row) => row.map(() => 0))} 크기={22} label="내가 쌓은 모양" />
          <span>내가 쌓은 모양 · {개수}개</span>
        </div>
      </div>
      {도움 && m.show === 'views' && <p className="manip-help-line">앞에서 본 모양: 왼쪽부터 {앞에서본(m.target).join(', ')}층 · 옆에서 본 모양: 앞쪽부터 {옆에서본(m.target).join(', ')}층</p>}
    </div>
  );
}

// ── 하나로 묶기 ───────────────────────────────────────────────────
/** 조작마다 '도움'에서 보여 주는 첫 걸음 말입니다. */
const 도움말 = (m: Manipulation): string => {
  switch (m.kind) {
    case 'ruler-measure': return '빨간 점선(물건의 왼쪽 끝)에 자의 0 눈금(빨간 동그라미)을 맞추세요. 그다음 주황 점선(오른쪽 끝)에 닿는 눈금을 누르세요.';
    case 'ruler-draw': return m.tool === 'compass' ? '컴퍼스의 침은 0에 두고, 연필 쪽 다리를 반지름만큼 벌려요. 1 cm마다 세어 주는 숫자를 보세요.' : '시작한 점에서부터 1 cm씩 세어 주는 숫자를 보며 끝을 끌어가세요.';
    case 'clock': return '바깥쪽 숫자는 긴바늘이 가리킬 때의 분이에요. 긴바늘을 먼저 맞추고, 짧은바늘은 그 시각에 맞게 두 숫자 사이(또는 숫자 위)에 두세요.';
    case 'grid-point': return m.guide?.length ? '주황 점선을 따라 칸을 세어 보세요.' : '기준이 되는 점에서부터 한 칸씩 세어 자리를 찾아요.';
    case 'grid-draw': return m.guide?.length ? '주황 점선을 따라 칸을 세면 점을 찍을 자리를 알 수 있어요.' : '꼭짓점이 될 점을 먼저 정하고, 칸을 세어 변의 길이를 확인하며 이어요.';
    case 'shape-move': return '★ 칸이 어디로 가는지 따라가 보세요. 회색 칸은 처음 자리예요.';
    case 'number-line': return '이름이 붙은 눈금 사이가 몇 칸으로 나뉘었는지 세어요. 주황 숫자는 앞의 큰 눈금에서부터 센 칸 수예요.';
    case 'tap-fill': return '칸마다 번호를 붙였어요. 세면서 칠해 보세요.';
    case 'base-ten': return '높은 자리부터, 그 자리 숫자만큼 모형을 놓아요.';
    case 'bars': return `세로 눈금 한 칸은 ${m.step}${m.unitLabel}이에요. 표의 수를 보고 막대 끝을 그 눈금까지 끌어 올리세요.`;
    case 'angle': return m.protractor ? '각도기의 중심은 꼭짓점에, 밑금은 아래 변에 맞추었어요. 아래 변이 가리키는 0에서 시작하는 눈금(빨간 숫자)을 따라 읽어요.' : '직각(90°)의 모서리를 점선으로 보여 줘요. 이보다 좁으면 예각, 넓으면 둔각이에요.';
    case 'sort-bins': return '나누는 기준을 한 번 더 읽고, 하나씩 옮겨 보세요.';
    case 'stack-build': return m.show === 'views' ? '위에서 본 모양의 칸에 먼저 1개씩 놓고, 앞과 옆에서 본 모양의 줄마다 가장 높은 층에 맞추어 올려요. 칸을 누를수록 한 층씩 올라가고, 가장 높이 올라가면 다시 0이 돼요.' : '그림의 맨 앞줄 칸부터 몇 층인지 세어 그만큼 누르세요. 칸을 누를수록 한 층씩 올라가고, 가장 높이 올라가면 다시 0이 돼요.';
    default: return '';
  }
};

export interface ManipulateTaskProps {
  m: Manipulation;
  locked: boolean;
  /** 틀린 뒤입니다. 바른 모습을 겹쳐 보여 줍니다. */
  reveal: boolean;
  onSubmit: (result: ManipResult) => void;
  onTap?: () => void;
  tip?: string;
}

export function ManipulateTask({ m, locked, reveal, onSubmit, onTap, tip }: ManipulateTaskProps) {
  const [s, setS] = useState<ManipState>(() => 처음상태(m));
  const [도움, set도움] = useState(false);
  useEffect(() => { setS(처음상태(m)); set도움(false); }, [m]);
  const set: 설정 = (next) => setS(next);
  const 바른 = reveal ? 정답모습(m) : undefined;
  const 공통 = { set, locked, 도움 } as const;
  let 화면: ReactNode = null;
  if (m.kind === 'ruler-measure' && s.kind === m.kind) 화면 = <자로재기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'ruler-draw' && s.kind === m.kind) 화면 = <자로긋기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'clock' && s.kind === m.kind) 화면 = <시계 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'grid-point' && s.kind === m.kind) 화면 = <점찍기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'grid-draw' && s.kind === m.kind) 화면 = <선긋기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'shape-move' && s.kind === m.kind) 화면 = <도형움직이기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'number-line' && s.kind === m.kind) 화면 = <수직선 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'tap-fill' && s.kind === m.kind) 화면 = <색칠하기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'base-ten' && s.kind === m.kind) 화면 = <수모형 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'bars' && s.kind === m.kind) 화면 = <그래프 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'angle' && s.kind === m.kind) 화면 = <각만들기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'sort-bins' && s.kind === m.kind) 화면 = <나누기 m={m} s={s} 바른={바른 as never} {...공통} />;
  else if (m.kind === 'stack-build' && s.kind === m.kind) 화면 = <쌓기 m={m} s={s} 바른={바른 as never} {...공통} />;
  const 되돌림 = s.kind === 'grid-draw' && s.segs.length > 0;
  return (
    <div className={`manip-task manip-kind-${m.kind}`} onPointerDown={() => onTap?.()}>
      <div className="manip-stage">{화면}</div>
      {도움 && !reveal && <p className="manip-help-line">💡 {resolveParticles(도움말(m))}</p>}
      {reveal && tip && <p className="manip-tip">{resolveParticles(tip)}</p>}
      {reveal && <p className="manip-help-line ok">초록색이 바르게 한 모습이에요.{m.kind === 'clock' ? ` (${시각말(m.h, m.m)})` : ''}</p>}
      <div className="manip-actions">
        {!locked && (
          <button type="button" className="manip-help" aria-pressed={도움} onClick={() => set도움(!도움)}>💡 도움</button>
        )}
        {!locked && 되돌림 && s.kind === 'grid-draw' && (
          <button type="button" onClick={() => set({ ...s, segs: s.segs.slice(0, -1) })}>↶ 한 선 지우기</button>
        )}
        {!locked && (
          <button type="button" onClick={() => setS(처음상태(m))}>처음부터</button>
        )}
        {!locked && (
          <button type="button" className="manip-submit" onClick={() => onSubmit(채점(m, s))}>확인</button>
        )}
      </div>
    </div>
  );
}
