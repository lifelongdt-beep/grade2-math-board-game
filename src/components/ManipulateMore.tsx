import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Manipulation } from '../types';
import type { ManipState } from '../data/manipulate/check';
import { 눈금말, 담은수 } from '../data/manipulate/checkMore';

// ════════════════════════════════════════════════════════════════════
// 손 조작 문항 화면 (2): 순서대로 놓기, 비커·저울 눈금, 그림그래프,
// 달력, 똑같이 나누어 담기, 점 배열, 규칙 채우기
// ────────────────────────────────────────────────────────────────────
// Manipulate.tsx와 같은 약속을 따릅니다 — 손가락 하나로 되도록 누르기와
// pointer 끌기만 쓰고, 틀린 뒤에는 바른 모습(바른)을 초록으로 겹칩니다.
// ════════════════════════════════════════════════════════════════════

const 잉크 = '#1d2b3a';
const 모눈 = '#d3e2ec';
const 파랑 = '#1e88e5';
const 초록 = '#2e7d32';
const 주황 = '#ef6c00';
const 바탕 = '#f7fbff';

type 설정 = (s: ManipState | ((prev: ManipState) => ManipState)) => void;
type 판<K extends Manipulation['kind']> = {
  m: Extract<Manipulation, { kind: K }>;
  s: Extract<ManipState, { kind: K }>;
  set: 설정;
  locked: boolean;
  바른?: Extract<ManipState, { kind: K }>;
  도움: boolean;
};

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

// ── 순서대로 놓기 ─────────────────────────────────────────────────
export function 순서놓기(props: 판<'order'>) {
  return props.m.expr ? <계산순서 {...props} /> : <크기순서 {...props} />;
}

/** 식의 기호를 계산하는 차례대로 누릅니다. 누른 차례가 기호 위에 붙습니다. */
function 계산순서({ m, s, set, locked, 바른, 도움 }: 판<'order'>) {
  const 기호칸 = new Map(m.items.map((it, i) => [it.at!, i]));
  return (
    <div className="manip-order">
      <div className="manip-expr">
        {m.expr!.map((t, k) => {
          const i = 기호칸.get(k);
          if (i === undefined) return <span key={k} className="manip-expr-num">{t}</span>;
          const 차례 = s.seq.indexOf(i);
          const 바른차례 = 바른 ? 바른.seq.indexOf(i) : -1;
          return (
            <button key={k} type="button" disabled={locked} className={`manip-expr-op ${차례 >= 0 ? 'picked' : ''}`}
              onClick={() => set({ ...s, seq: 차례 >= 0 ? s.seq.filter((x) => x !== i) : [...s.seq, i] })}>
              {차례 >= 0 && <small className="manip-expr-badge">{차례 + 1}</small>}
              {바른 && 바른차례 !== 차례 && <small className="manip-expr-badge ok">{바른차례 + 1}</small>}
              {t}
            </button>
          );
        })}
      </div>
      {바른 && <p className="manip-help-line ok">바른 차례: {바른.seq.map((i) => m.items[i].label).join(' → ')}</p>}
      {도움 && <p className="manip-help-line">괄호 안 → 곱셈·나눗셈 → 덧셈·뺄셈, 같은 차례끼리는 왼쪽부터예요. 누른 기호를 다시 누르면 빠져요.</p>}
    </div>
  );
}

function 크기순서({ m, s, set, locked, 바른, 도움 }: 판<'order'>) {
  const 길이 = m.items.some((it) => it.len !== undefined);
  const 기호 = m.dir === 'asc' ? '<' : '>';
  const 칩 = (i: number, 놓임: boolean) => {
    const it = m.items[i];
    return (
      <button key={i} type="button" disabled={locked} className={`manip-chip ${길이 ? 'manip-len-chip' : ''}`}
        onClick={() => set({ ...s, seq: 놓임 ? s.seq.filter((x) => x !== i) : [...s.seq, i] })}>
        {it.emoji && <span className="manip-chip-emoji">{it.emoji}</span>}
        {길이 ? <span className="manip-len-bar" style={{ width: `${(it.len ?? 0) * 18}px` }} aria-label={it.label} /> : null}
        <span>{it.label}</span>
      </button>
    );
  };
  const 남은 = m.items.map((_, i) => i).filter((i) => !s.seq.includes(i));
  return (
    <div className={`manip-order ${길이 ? 'vertical' : ''}`}>
      <p className="manip-order-dir">{길이 ? (m.dir === 'desc' ? '긴 것부터 →' : '짧은 것부터 →') : (m.dir === 'asc' ? '작은 수 → 큰 수' : '큰 수 → 작은 수')}</p>
      <div className="manip-order-row">
        {m.items.map((_, k) => (
          <span key={k} className="manip-order-slot-wrap">
            {k > 0 && !길이 && <span className="manip-order-sign">{기호}</span>}
            <span className={`manip-order-slot ${s.seq[k] === undefined ? 'empty' : ''}`}>
              {s.seq[k] === undefined ? <small>{k + 1}</small> : 칩(s.seq[k], true)}
            </span>
          </span>
        ))}
      </div>
      <div className="manip-order-pool">{남은.map((i) => 칩(i, false))}</div>
      {바른 && <p className="manip-help-line ok">바른 차례: {바른.seq.map((i) => m.items[i].label).join(` ${길이 ? '→' : 기호} `)}</p>}
      {도움 && <p className="manip-help-line">놓은 것을 다시 누르면 빠져요.</p>}
    </div>
  );
}

// ── 비커·저울 눈금 맞추기 ─────────────────────────────────────────
export function 눈금({ m, s, set, locked, 바른, 도움 }: 판<'gauge'>) {
  const ref = useRef<SVGSVGElement>(null);
  const 잡음 = useRef(false);
  const 칸수 = m.max / m.minor;
  const 말 = (v: number) => 눈금말(m.tool, v);
  if (m.tool === 'beaker') {
    const 위 = 18; const 아래 = 250; const 왼 = 70; const 폭 = 100;
    const y = (v: number) => 아래 - (v / m.max) * (아래 - 위);
    const 놓기 = (e: ReactPointerEvent) => {
      if (!잡음.current || locked) return;
      const [, py] = svg좌표(ref.current, e);
      const v = Math.round((((아래 - py) / (아래 - 위)) * m.max) / m.minor) * m.minor;
      set({ ...s, value: Math.max(0, Math.min(m.max, v)) });
    };
    return (
      <svg ref={ref} viewBox="0 0 300 270" className="manip-svg"
        onPointerDown={(e) => { if (locked) return; 붙잡기(e); 잡음.current = true; 놓기(e); }}
        onPointerMove={놓기} onPointerUp={() => { 잡음.current = false; }} onPointerCancel={() => { 잡음.current = false; }}>
        <rect x="1" y="1" width="298" height="268" rx="10" fill={바탕} stroke={모눈} />
        <rect x={왼} y={y(s.value)} width={폭} height={아래 - y(s.value)} fill="rgba(66,165,245,0.45)" />
        <path d={`M${왼},${위 - 8} L${왼},${아래} L${왼 + 폭},${아래} L${왼 + 폭},${위 - 8}`} fill="none" stroke={잉크} strokeWidth="3" />
        {Array.from({ length: 칸수 + 1 }, (_, k) => {
          const v = k * m.minor;
          const 큰 = v % m.major === 0;
          return (
            <g key={k} pointerEvents="none">
              <line x1={왼} y1={y(v)} x2={왼 + (큰 ? 26 : 13)} y2={y(v)} stroke={잉크} strokeWidth={큰 ? 1.8 : 1} />
              {큰 && v > 0 && <text x={왼 + 폭 + 8} y={y(v) + 4} fontSize="11" fontWeight="900" fill={잉크}>{말(v)}</text>}
              {도움 && !큰 && <text x={왼 - 6} y={y(v) + 3} textAnchor="end" fontSize="8" fontWeight="800" fill={주황}>{말(v)}</text>}
            </g>
          );
        })}
        {m.pre > 0 && <line x1={왼 - 10} y1={y(m.pre)} x2={왼 + 폭 + 4} y2={y(m.pre)} stroke={주황} strokeWidth="1.6" strokeDasharray="4 3" pointerEvents="none" />}
        {m.pre > 0 && <text x={왼 - 12} y={y(m.pre) - 4} textAnchor="end" fontSize="9" fontWeight="900" fill={주황}>처음</text>}
        {바른 && <line x1={왼 - 6} y1={y(바른.value)} x2={왼 + 폭 + 6} y2={y(바른.value)} stroke={초록} strokeWidth="4" opacity="0.8" pointerEvents="none" />}
        <line x1={왼} y1={y(s.value)} x2={왼 + 폭} y2={y(s.value)} stroke={파랑} strokeWidth="3" pointerEvents="none" />
        <circle cx={왼 + 폭 / 2} cy={y(s.value)} r="9" fill="rgba(30,136,229,0.2)" stroke={파랑} strokeWidth="2" pointerEvents="none" />
        <text x={8} y={16} fontSize="10" fill={잉크}>(위아래로 끌어요)</text>
      </svg>
    );
  }
  // 저울: 0이 맨 위에 있고, 시계 방향으로 한 바퀴가 max입니다.
  const C: [number, number] = [150, 140];
  const R = 108;
  const 점 = (v: number, r: number): [number, number] => {
    const a = (v / m.max) * Math.PI * 2;
    return [C[0] + r * Math.sin(a), C[1] - r * Math.cos(a)];
  };
  const 놓기 = (e: ReactPointerEvent) => {
    if (!잡음.current || locked) return;
    const [x, y] = svg좌표(ref.current, e);
    let a = Math.atan2(x - C[0], C[1] - y);
    if (a < 0) a += Math.PI * 2;
    const v = (Math.round(((a / (Math.PI * 2)) * m.max) / m.minor) * m.minor) % m.max;
    set({ ...s, value: v });
  };
  const [nx, ny] = 점(s.value, R - 20);
  return (
    <svg ref={ref} viewBox="0 0 300 280" className="manip-svg"
      onPointerDown={(e) => { if (locked) return; 붙잡기(e); 잡음.current = true; 놓기(e); }}
      onPointerMove={놓기} onPointerUp={() => { 잡음.current = false; }} onPointerCancel={() => { 잡음.current = false; }}>
      <rect x="1" y="1" width="298" height="278" rx="10" fill={바탕} stroke={모눈} />
      <rect x={C[0] - 70} y={C[1] + R + 2} width="140" height="18" rx="6" fill="#b0bec5" stroke={잉크} />
      <circle cx={C[0]} cy={C[1]} r={R + 8} fill="#fff" stroke={잉크} strokeWidth="3" />
      {Array.from({ length: 칸수 }, (_, k) => {
        const v = k * m.minor;
        const 큰 = v % m.major === 0;
        const [x1, y1] = 점(v, R);
        const [x2, y2] = 점(v, R - (큰 ? 14 : 7));
        const [tx, ty] = 점(v, R - 28);
        return (
          <g key={k} pointerEvents="none">
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={잉크} strokeWidth={큰 ? 2 : 1} />
            {큰 && <text x={tx} y={ty + 4} textAnchor="middle" fontSize="10.5" fontWeight="900" fill={잉크}>{v === 0 ? '0' : 말(v)}</text>}
          </g>
        );
      })}
      {m.pre > 0 && (() => { const [px, py] = 점(m.pre, R + 4); return <circle cx={px} cy={py} r="5" fill={주황} pointerEvents="none" />; })()}
      {바른 && (() => { const [bx, by] = 점(바른.value, R - 20); return <line x1={C[0]} y1={C[1]} x2={bx} y2={by} stroke={초록} strokeWidth="6" opacity="0.55" pointerEvents="none" />; })()}
      <line x1={C[0]} y1={C[1]} x2={nx} y2={ny} stroke="#e53935" strokeWidth="3.5" strokeLinecap="round" pointerEvents="none" />
      <circle cx={nx} cy={ny} r="11" fill="rgba(229,57,53,0.15)" stroke="#e53935" strokeWidth="2" pointerEvents="none" />
      <circle cx={C[0]} cy={C[1]} r="6" fill={잉크} />
      {도움 && <text x={C[0]} y={C[1] + 34} textAnchor="middle" fontSize="11" fontWeight="900" fill={주황}>작은 눈금 한 칸 = {m.minor} g</text>}
      {m.pre > 0 && <text x={10} y={18} fontSize="10" fontWeight="800" fill={주황}>● 처음 무게</text>}
    </svg>
  );
}

// ── 그림그래프 ────────────────────────────────────────────────────
export function 그림그래프({ m, s, set, locked, 바른, 도움 }: 판<'pictograph'>) {
  const 바꿈 = (i: number, 쪽: 'big' | 'small', d: number) => {
    const arr = s[쪽].map((v, j) => (j === i ? Math.max(0, Math.min(쪽 === 'big' ? 9 : 19, v + d)) : v));
    set({ ...s, [쪽]: arr });
  };
  return (
    <div className="manip-picto">
      <p className="manip-picto-legend"><span className="big">{m.icon}</span> {m.big}{m.unitLabel} <span className="small">{m.icon}</span> {m.small}{m.unitLabel}</p>
      {m.labels.map((label, i) => {
        const 틀림 = 바른 && (바른.big[i] !== s.big[i] || 바른.small[i] !== s.small[i]);
        return (
          <div key={label} className={`manip-picto-row ${틀림 ? 'wrong' : ''}`}>
            <strong>{label}</strong>
            <div className="manip-picto-icons">
              {Array.from({ length: s.big[i] }, (_, k) => <span key={`b${k}`} className="big">{m.icon}</span>)}
              {Array.from({ length: s.small[i] }, (_, k) => <span key={`s${k}`} className="small">{m.icon}</span>)}
              {도움 && <em>{s.big[i] * m.big + s.small[i] * m.small}{m.unitLabel}</em>}
              {틀림 && <em className="ok">→ 큰 {바른!.big[i]}, 작은 {바른!.small[i]}</em>}
            </div>
            <div className="manip-picto-pm">
              <button type="button" disabled={locked} onClick={() => 바꿈(i, 'big', 1)}>큰 ＋</button>
              <button type="button" disabled={locked || !s.big[i]} onClick={() => 바꿈(i, 'big', -1)}>큰 －</button>
              <button type="button" disabled={locked} onClick={() => 바꿈(i, 'small', 1)}>작은 ＋</button>
              <button type="button" disabled={locked || !s.small[i]} onClick={() => 바꿈(i, 'small', -1)}>작은 －</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 달력 ──────────────────────────────────────────────────────────
const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
export function 달력({ m, s, set, locked, 바른, 도움 }: 판<'calendar'>) {
  const 칸들: (number | null)[] = [...Array.from({ length: m.first }, () => null), ...Array.from({ length: m.days }, (_, i) => i + 1)];
  while (칸들.length % 7) 칸들.push(null);
  const 고른 = new Set(s.picked);
  const 바른날 = 바른 ? new Set(바른.picked) : null;
  return (
    <div className="manip-calendar">
      <p className="manip-calendar-title">{m.month}월</p>
      <div className="manip-calendar-grid">
        {요일.map((w, i) => <span key={w} className={`head ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{w}</span>)}
        {칸들.map((d, k) => (d === null
          ? <span key={k} className="blank" />
          : (
            <button key={k} type="button" disabled={locked}
              className={`${고른.has(d) ? 'picked' : ''} ${바른날?.has(d) ? 'right' : ''} ${k % 7 === 0 ? 'sun' : k % 7 === 6 ? 'sat' : ''}`}
              onClick={() => set({ ...s, picked: 고른.has(d) ? s.picked.filter((x) => x !== d) : [...s.picked, d] })}>
              {d}
            </button>
          )))}
      </div>
      {도움 && <p className="manip-help-line">같은 세로줄은 요일이 같고, 한 줄 아래로 가면 7일(1주일) 뒤예요.</p>}
    </div>
  );
}

// ── 똑같이 나누어 담기 ────────────────────────────────────────────
export function 나누어담기({ m, s, set, locked, 바른, 도움 }: 판<'share'>) {
  const 남음 = m.total - 담은수(s.plates);
  const 담기 = (i: number, d: number) => {
    if (locked || (d > 0 && 남음 <= 0) || (d < 0 && s.plates[i] === 0)) return;
    set({ ...s, plates: s.plates.map((v, j) => (j === i ? v + d : v)) });
  };
  return (
    <div className="manip-share">
      <div className="manip-share-pool">
        <strong>남은 것 {남음}개</strong>
        <div>{Array.from({ length: 남음 }, (_, k) => <span key={k}>{m.emoji}</span>)}</div>
      </div>
      <div className="manip-plates">
        {s.plates.map((v, i) => (
          <div key={i} className={`manip-plate ${바른 && 바른.plates[i] !== v ? 'wrong' : ''}`} role="button" tabIndex={0} onClick={() => 담기(i, 1)}>
            <div className="manip-plate-items">{Array.from({ length: v }, (_, k) => <span key={k}>{m.emoji}</span>)}</div>
            <small>{도움 || 바른 ? `${v}개` : ''}</small>
            {!locked && v > 0 && <button type="button" className="manip-plate-minus" onClick={(e) => { e.stopPropagation(); 담기(i, -1); }}>－</button>}
          </div>
        ))}
      </div>
      {!m.groups && !locked && (
        <div className="manip-share-tools">
          <button type="button" disabled={s.plates.length >= 12} onClick={() => set({ ...s, plates: [...s.plates, 0] })}>＋ 접시</button>
          <button type="button" disabled={!s.plates.length} onClick={() => set({ ...s, plates: s.plates.slice(0, -1) })}>－ 접시</button>
        </div>
      )}
      {바른 && <p className="manip-help-line ok">바르게: 접시 {바른.plates.length}개에 {바른.plates[0]}개씩{m.total - 담은수(바른.plates) ? `, ${m.total - 담은수(바른.plates)}개 남음` : ''}</p>}
    </div>
  );
}

// ── 점 배열 ───────────────────────────────────────────────────────
export function 점배열({ m, s, set, locked, 바른, 도움 }: 판<'array'>) {
  const ref = useRef<SVGSVGElement>(null);
  const 잡음 = useRef(false);
  const 칸 = 30; const 왼 = 26; const 위 = 24;
  const W = 왼 + m.maxCols * 칸 + 12; const H = 위 + m.maxRows * 칸 + 12;
  const 놓기 = (e: ReactPointerEvent) => {
    if (!잡음.current || locked) return;
    const [x, y] = svg좌표(ref.current, e);
    const c = Math.max(1, Math.min(m.maxCols, Math.floor((x - 왼) / 칸) + 1));
    const r = Math.max(1, Math.min(m.maxRows, Math.floor((y - 위) / 칸) + 1));
    set({ ...s, rows: r, cols: c });
  };
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="manip-svg"
      onPointerDown={(e) => { if (locked) return; 붙잡기(e); 잡음.current = true; 놓기(e); }}
      onPointerMove={놓기} onPointerUp={() => { 잡음.current = false; }} onPointerCancel={() => { 잡음.current = false; }}>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="10" fill={바탕} stroke={모눈} />
      {s.rows > 0 && <rect x={왼 + 2} y={위 + 2} width={s.cols * 칸 - 4} height={s.rows * 칸 - 4} rx="8" fill="rgba(66,165,245,0.16)" stroke={파랑} strokeWidth="2" />}
      {바른 && <rect x={왼} y={위} width={바른.cols * 칸} height={바른.rows * 칸} rx="8" fill="none" stroke={초록} strokeWidth="3.5" strokeDasharray="6 4" />}
      {Array.from({ length: m.maxRows * m.maxCols }, (_, k) => {
        const r = Math.floor(k / m.maxCols); const c = k % m.maxCols;
        const 안 = r < s.rows && c < s.cols;
        const cx = 왼 + c * 칸 + 칸 / 2; const cy = 위 + r * 칸 + 칸 / 2;
        return 안
          ? <text key={k} x={cx} y={cy + 6} textAnchor="middle" fontSize={m.emoji === '●' ? 18 : 17} fill={m.emoji === '●' ? 파랑 : undefined} pointerEvents="none">{m.emoji}</text>
          : <circle key={k} cx={cx} cy={cy} r="2.5" fill="#b0bec5" pointerEvents="none" />;
      })}
      {도움 && Array.from({ length: m.maxCols }, (_, c) => <text key={`c${c}`} x={왼 + c * 칸 + 칸 / 2} y={16} textAnchor="middle" fontSize="10" fontWeight="900" fill={주황}>{c + 1}</text>)}
      {도움 && Array.from({ length: m.maxRows }, (_, r) => <text key={`r${r}`} x={12} y={위 + r * 칸 + 칸 / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={주황}>{r + 1}</text>)}
    </svg>
  );
}

// ── 규칙 채우기 ───────────────────────────────────────────────────
export function 규칙채우기({ m, s, set, locked, 바른 }: 판<'pattern'>) {
  const [고른, set고른] = useState(0);
  const 칸 = Math.min(44, Math.floor(330 / m.cols));
  return (
    <div className="manip-pattern">
      <div className="manip-pattern-grid" style={{ gridTemplateColumns: `repeat(${m.cols}, ${칸}px)` }}>
        {m.given.map((g, i) => {
          const 빈칸 = g === null;
          const v = s.fill[i];
          const 틀림 = 바른 && 빈칸 && v !== 바른.fill[i];
          return (
            <button key={i} type="button" disabled={locked || !빈칸} style={{ width: 칸, height: 칸, fontSize: 칸 * 0.55 }}
              className={`${빈칸 ? 'blank' : 'given'} ${틀림 ? 'wrong' : ''}`}
              onClick={() => set({ ...s, fill: s.fill.map((x, j) => (j === i ? (x === 고른 ? null : 고른) : x)) })}>
              {v !== null && v !== undefined ? m.palette[v] : ''}
              {틀림 && <small className="ok">{m.palette[바른!.fill[i]!]}</small>}
            </button>
          );
        })}
      </div>
      {!locked && (
        <div className="manip-palette">
          {m.palette.map((p, k) => (
            <button key={p} type="button" aria-pressed={고른 === k} className={고른 === k ? 'picked' : ''} onClick={() => set고른(k)}>{p}</button>
          ))}
          <span className="manip-help-line">그림을 고른 다음 빈칸을 눌러요.</span>
        </div>
      )}
    </div>
  );
}
