import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { BalanceVisual, BeakerVisual, CircleVisual, GroupedVisual, LineFigureVisual, PartitionVisual, PictureGraphVisual, QuestionVisual, ScaleDialVisual } from '../types';
import { BalanceGraphic, BeakerGraphic, ScaleDialGraphic, 들이글, 무게글 } from './Grade3Visuals';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 3학년 자세히 보기 — 손으로 해 보는 실험실
// ────────────────────────────────────────────────────────────────────
// 그림을 크게 보여 주기만 하면 아이는 여전히 머릿속으로 상상해야
// 합니다. 3학년 지도서가 차시마다 시키는 '직접 해 보기'를 화면에서
// 그대로 해 봅니다.
//   · 비커에 물을 부어 눈금 맞추기, 저울에 추를 올려 바늘 읽기,
//     양팔저울에 추를 올려 수평 맞추기 (들이와 무게)
//   · 조각을 눌러 색칠하고, 조각을 겹쳐 똑같은지 보기 (분수)
//   · 낱개를 묶음으로 모으고 몇 묶음을 골라 보기 (분수의 이산량)
//   · 컴퍼스를 돌려 원 그리기, 반지름·지름 그어 보기 (원)
//   · 그림그래프의 그림을 하나씩 눌러 더해 가기 (그림그래프)
//   · 삼각자를 각에 대어 직각인지 보기 (평면도형)
//
// 답은 말해 주지 않습니다. 해 본 결과를 아이가 읽습니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 선 = '#0f4c5c';
const 강조 = '#d0482f';

function 읽기({ children }: { children: ReactNode }) {
  return <p className="g3-lab-readout">{children}</p>;
}

function 단추({ onClick, children, disabled }: { onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className="g3-lab-button" disabled={disabled} onClick={() => { playTapSound(); onClick(); }}>
      {children}
    </button>
  );
}

// ── 비커에 물 붓기 ───────────────────────────────────────────────────
function BeakerLab({ visual }: { visual: BeakerVisual }) {
  const [ml, setMl] = useState(0);
  const svgBox = useRef<HTMLDivElement>(null);
  const 같다 = ml === visual.amountMl;
  const 바꾸기 = (d: number) => setMl((v) => Math.max(0, Math.min(visual.maxMl, v + d)));
  // 비커를 끌어 물 높이를 맞출 수도 있습니다(눈금 한 칸씩 붙습니다).
  const 끌기 = (event: ReactPointerEvent) => {
    if (event.buttons !== 1 && event.type !== 'pointerdown') return;
    const box = svgBox.current?.getBoundingClientRect();
    if (!box) return;
    const 비율 = (event.clientY - box.top) / box.height;
    // 그림에서 물은 270 높이 가운데 34~236 사이입니다.
    const y = 비율 * 270;
    const v = ((236 - y) / (236 - 34)) * visual.maxMl;
    setMl(Math.max(0, Math.min(visual.maxMl, Math.round(v / visual.minorMl) * visual.minorMl)));
  };
  return (
    <div className="g3-lab">
      <div ref={svgBox} className="g3-lab-stage" onPointerDown={끌기} onPointerMove={끌기} style={{ touchAction: 'none' }}>
        <BeakerGraphic visual={visual} amountMl={ml} targetMl={visual.amountMl} />
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => 바꾸기(visual.minorMl)}>💧 {visual.minorMl} mL 붓기</단추>
        <단추 onClick={() => 바꾸기(500)}>🪣 500 mL 붓기</단추>
        <단추 onClick={() => 바꾸기(-visual.minorMl)} disabled={ml === 0}>{visual.minorMl} mL 덜기</단추>
      </div>
      <읽기>
        지금 물: <strong>{들이글(ml)}</strong>
        {ml >= 1000 && ml % 1000 !== 0 && <> (= {ml} mL)</>}
        {같다 ? ' — 빨간 점선(그림의 물 높이)과 같아졌어요!' : ' — 빨간 점선까지 물을 부어 보세요.'}
      </읽기>
    </div>
  );
}

// ── 저울에 추 올리기 ─────────────────────────────────────────────────
function ScaleLab({ visual }: { visual: ScaleDialVisual }) {
  const 추들 = visual.maxG > 1000 ? [1000, 100] : [100, 50];
  const [올린, set올린] = useState<number[]>([]);
  const g = 올린.reduce((s, x) => s + x, 0);
  const 같다 = g === visual.amountG;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <ScaleDialGraphic visual={visual} amountG={Math.min(g, visual.maxG)} targetG={visual.amountG} />
      </div>
      <div className="g3-lab-buttons">
        {추들.map((w) => (
          <단추 key={w} onClick={() => set올린((v) => (g + w <= visual.maxG ? [...v, w] : v))}>
            ⚖️ {무게글(w)} 추 올리기
          </단추>
        ))}
        <단추 onClick={() => set올린((v) => v.slice(0, -1))} disabled={!올린.length}>마지막 추 내리기</단추>
      </div>
      <읽기>
        올린 추: <strong>{무게글(g)}</strong>
        {g >= 1000 && g % 1000 !== 0 && <> (= {g} g)</>}
        {같다 ? ' — 바늘이 빨간 점선과 겹쳤어요!' : ' — 바늘이 빨간 점선에 올 때까지 추를 올려 보세요.'}
      </읽기>
    </div>
  );
}

// ── 양팔저울 ─────────────────────────────────────────────────────────
function BalanceLab({ visual }: { visual: BalanceVisual }) {
  const 추로재기 = visual.right.unitG !== undefined && visual.leftG !== undefined;
  const [n, setN] = useState(0);
  const [놓음, set놓음] = useState(false);
  useEffect(() => {
    if (추로재기) return undefined;
    const t = window.setTimeout(() => set놓음(true), 500);
    return () => window.clearTimeout(t);
  }, [추로재기]);
  if (!추로재기) {
    return (
      <div className="g3-lab">
        <div className="g3-lab-stage">
          <BalanceGraphic visual={visual} tilt={놓음 ? visual.tilt : 'level'} />
        </div>
        <div className="g3-lab-buttons">
          <단추 onClick={() => { set놓음(false); window.setTimeout(() => set놓음(true), 500); }}>다시 올려 보기</단추>
        </div>
        <읽기>양팔저울은 <strong>더 무거운 쪽이 아래로</strong> 내려가요. 크기가 아니라 저울이 기운 쪽을 보세요.</읽기>
      </div>
    );
  }
  const unit = visual.right.unitG ?? 0;
  const 오른 = n * unit;
  const 기울 = 오른 === visual.leftG ? 'level' : 오른 > (visual.leftG ?? 0) ? 'right' : 'left';
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <BalanceGraphic visual={visual} rightCount={n} tilt={기울} />
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => setN((v) => Math.min(16, v + 1))}>⚖️ {unit} g 추 올리기</단추>
        <단추 onClick={() => setN((v) => Math.max(0, v - 1))} disabled={n === 0}>추 내리기</단추>
      </div>
      <읽기>
        추 {n}개 = {unit}×{n} = <strong>{오른} g</strong>
        {기울 === 'level'
          ? ` — 수평이에요! ${visual.left.name}의 무게는 추 ${n}개의 무게와 같아요.`
          : 기울 === 'left'
            ? ` — ${visual.left.name} 쪽이 내려가 있어요. 추가 더 필요해요.`
            : ' — 추 쪽이 내려갔어요. 추가 너무 많아요.'}
      </읽기>
    </div>
  );
}

// ── 분수 조각 ────────────────────────────────────────────────────────
// 조각의 모양을 path로 만듭니다. 겹쳐 보기에서는 조각마다 옮길 자리
// (translate)와 돌릴 각도(rotate)를 함께 돌려줍니다.
type 조각 = { d: string; 넓이: number; 옮김: string };

const 조각들 = (one: PartitionVisual['figures'][number], cx: number, cy: number, boxW: number, boxH: number): 조각[] => {
  const 경계 = one.cuts && one.cuts.length ? [0, ...one.cuts, 1] : Array.from({ length: (one.parts ?? 1) + 1 }, (_, k) => k / (one.parts ?? 1));
  const room = Math.min(boxW, boxH);
  if (one.shape === 'bar') {
    const w = boxW;
    const h = Math.min(boxH * 0.6, 70);
    const left = cx - w / 2;
    const top = cy - h / 2;
    return 경계.slice(0, -1).map((from, k) => {
      const to = 경계[k + 1];
      const x = left + from * w;
      // 겹쳐 보기: 조각의 왼쪽 끝을 띠의 왼쪽 끝에 맞춥니다.
      return { d: `M ${x} ${top} h ${(to - from) * w} v ${h} h ${-(to - from) * w} Z`, 넓이: to - from, 옮김: `translate(${left - x}px, 0px)` };
    });
  }
  if (one.shape === 'circle') {
    const r = room / 2;
    const at = (t: number): [number, number] => [cx + r * Math.sin(t * 2 * Math.PI), cy - r * Math.cos(t * 2 * Math.PI)];
    if (경계.length === 2) return [{ d: `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`, 넓이: 1, 옮김: 'none' }];
    return 경계.slice(0, -1).map((from, k) => {
      const to = 경계[k + 1];
      const [x1, y1] = at(from);
      const [x2, y2] = at(to);
      // 겹쳐 보기: 조각의 처음 반지름이 12시를 향하도록 돌립니다.
      return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${to - from > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`, 넓이: to - from, 옮김: `rotate(${-from * 360}deg)` };
    });
  }
  if (one.shape === 'grid') {
    const rows = Math.max(1, one.rows ?? 1);
    const cols = Math.max(1, one.columns ?? 1);
    const cell = Math.min(boxW / cols, boxH / rows, 44);
    const left = cx - (cell * cols) / 2;
    const top = cy - (cell * rows) / 2;
    return Array.from({ length: rows * cols }, (_, k) => {
      const r = Math.floor(k / cols);
      const c = k % cols;
      return { d: `M ${left + c * cell} ${top + r * cell} h ${cell} v ${cell} h ${-cell} Z`, 넓이: 1 / (rows * cols), 옮김: `translate(${-c * cell}px, ${-r * cell}px)` };
    });
  }
  const half = room / 2;
  const 모서리: Array<[number, number]> = [[cx - half, cy - half], [cx + half, cy - half], [cx + half, cy + half], [cx - half, cy + half]];
  return [0, 1, 2, 3].map((k) => {
    const a = 모서리[k];
    const b = 모서리[(k + 1) % 4];
    return { d: `M ${cx} ${cy} L ${a[0]} ${a[1]} L ${b[0]} ${b[1]} Z`, 넓이: 0.25, 옮김: `rotate(${-k * 90}deg)` };
  });
};

function PieceLab({ visual }: { visual: PartitionVisual }) {
  const figs = visual.figures;
  const [칠, set칠] = useState(() => figs.map((f) => new Set(f.shaded)));
  const [겹쳐, set겹쳐] = useState(false);
  const W = 380;
  const 칸 = W / figs.length;
  const 띠하나 = figs.length === 1 && figs[0].shape === 'bar';
  const named = figs.some((f) => f.name);
  const H = 띠하나 ? 150 : 220;
  const boxW = 칸 - 24;
  const boxH = H - (named ? 64 : 40);
  const 누르기 = (fi: number, k: number) => {
    playTapSound();
    set칠((prev) => prev.map((s, at) => {
      if (at !== fi) return s;
      const n = new Set(s);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    }));
  };
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {figs.map((f, fi) => {
            const cx = 칸 * fi + 칸 / 2;
            const cy = 18 + boxH / 2;
            const ps = 조각들(f, cx, cy, boxW, boxH);
            return (
              <g key={fi}>
                {/* 겹쳐 볼 때 원래 모양의 윤곽을 흐리게 남겨 둡니다. */}
                {겹쳐 && ps.map((p, k) => <path key={`o${k}`} d={p.d} fill="none" stroke="#b0bec5" strokeWidth="1.5" strokeDasharray="4 4" />)}
                {ps.map((p, k) => (
                  <path
                    key={k}
                    d={p.d}
                    fill={칠[fi].has(k) ? '#18a7a7' : '#ffffff'}
                    fillOpacity={겹쳐 ? 0.35 : 1}
                    stroke={겹쳐 ? ['#d0482f', '#1565c0', '#2e7d32', '#6a1b9a', '#ef6c00', '#00838f', '#5d4037', '#c2185b', '#455a64', '#827717'][k % 10] : '#24364a'}
                    strokeWidth={겹쳐 ? 3 : 2}
                    strokeLinejoin="round"
                    style={{ transform: 겹쳐 ? p.옮김 : 'none', transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box', transition: `transform 0.7s ease ${겹쳐 ? k * 0.35 : 0}s, fill-opacity 0.4s`, cursor: 'pointer' }}
                    onClick={() => !겹쳐 && 누르기(fi, k)}
                  />
                ))}
                {f.name && <text x={cx} y={H - 18} textAnchor="middle" fill="#24364a" fontSize="18" fontWeight="900">{f.name}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => set겹쳐((v) => !v)}>{겹쳐 ? '제자리로 돌려놓기' : '🔍 조각 겹쳐 보기'}</단추>
        <단추 onClick={() => set칠(figs.map(() => new Set()))}>색칠 지우기</단추>
      </div>
      {figs.map((f, fi) => {
        const ps = 조각들(f, 0, 0, 100, 100);
        const 같은크기 = ps.every((p) => Math.abs(p.넓이 - ps[0].넓이) < 1e-6);
        const n = 칠[fi].size;
        return (
          <읽기 key={fi}>
            {f.name ? `${f.name}: ` : ''}전체 <strong>{ps.length}조각</strong> 가운데 <strong>{n}조각</strong>을 칠했어요.
            {겹쳐
              ? 같은크기
                ? <> 조각 {ps.length}개가 하나씩 와서 <strong>꼭 겹쳤어요</strong>. 똑같이 나눈 거예요.</>
                : <> 겹쳐 보니 <strong>크기가 서로 달라요</strong>. 똑같이 나눈 것이 아니에요.</>
              : 같은크기
                ? n > 0 && <> 똑같이 {ps.length}(으)로 나눈 것 중의 {n} → <strong>{n}/{ps.length}</strong></>
                : ' 조각의 크기가 서로 달라 보여요. 겹쳐 보세요.'}
          </읽기>
        );
      })}
      <p className="g3-lab-tip">조각을 눌러 색칠해 보세요. ‘조각 겹쳐 보기’를 누르면 조각들이 한자리에 모여요. 꼭 겹쳐지면 똑같이 나눈 거예요.</p>
    </div>
  );
}

// ── 묶음으로 나누기 ──────────────────────────────────────────────────
function GroupLab({ visual }: { visual: GroupedVisual }) {
  const total = visual.groups * visual.perGroup;
  const [묶음, set묶음] = useState(false);
  const [고른, set고른] = useState<Set<number>>(new Set());
  const W = 380;
  const perRow = visual.groups <= 4 ? visual.groups : Math.ceil(visual.groups / 2);
  const rows = Math.ceil(visual.groups / perRow);
  const cols = Math.ceil(Math.sqrt(visual.perGroup));
  const inRows = Math.ceil(visual.perGroup / cols);
  const boxW = (W - 24) / perRow - 10;
  const dot = Math.min(16, (boxW - 12) / cols - 4);
  const boxH = inRows * (dot + 5) + 14;
  const H = rows * (boxH + 12) + 18;
  const 자리 = useMemo(() => {
    // 흩어 놓은 자리는 늘 같게(문항마다 같은 그림이 나오게) 만듭니다.
    let s = total * 7919 + visual.perGroup;
    const r = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    return Array.from({ length: total }, (_, i) => {
      const g = Math.floor(i / visual.perGroup);
      const k = i % visual.perGroup;
      const row = Math.floor(g / perRow);
      const col = g % perRow;
      const bx = 17 + col * (boxW + 10);
      const by = 13 + row * (boxH + 12);
      const rr = Math.floor(k / cols);
      const cc = k % cols;
      const used = Math.min(cols, visual.perGroup - rr * cols);
      const gx = bx + boxW / 2 + (cc - (used - 1) / 2) * (dot + 4);
      const gy = by + 7 + dot / 2 + rr * (dot + 5);
      const lx = 20 + r() * (W - 40);
      const ly = 16 + r() * (H - 32);
      return { gx, gy, lx, ly, g };
    });
  }, [total, visual.perGroup, perRow, boxW, boxH, cols, dot, H]);
  const k = 고른.size;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {묶음 && Array.from({ length: visual.groups }, (_, g) => {
            const row = Math.floor(g / perRow);
            const col = g % perRow;
            const bx = 17 + col * (boxW + 10);
            const by = 13 + row * (boxH + 12);
            return (
              <rect key={g} x={bx} y={by} width={boxW} height={boxH} rx="10" fill={고른.has(g) ? '#d6f2f0' : '#ffffff'} stroke={고른.has(g) ? '#0f7175' : '#90a4ae'} strokeWidth={고른.has(g) ? 3 : 2} strokeDasharray={고른.has(g) ? undefined : '5 4'}
                style={{ cursor: 'pointer', transition: 'fill 0.3s' }}
                onClick={() => { playTapSound(); set고른((prev) => { const n = new Set(prev); if (n.has(g)) n.delete(g); else n.add(g); return n; }); }} />
            );
          })}
          {자리.map((p, i) => (
            <circle key={i} cx={0} cy={0} r={dot / 2} fill={묶음 && 고른.has(p.g) ? '#18a7a7' : '#ffffff'} stroke="#0f7175" strokeWidth="2" pointerEvents="none"
              style={{ transform: `translate(${묶음 ? p.gx : p.lx}px, ${묶음 ? p.gy : p.ly}px)`, transition: `transform 0.9s ease ${(i % visual.perGroup) * 0.04}s, fill 0.3s` }} />
          ))}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {!묶음 && <단추 onClick={() => set묶음(true)}>🧺 {visual.perGroup}개씩 묶기</단추>}
        {묶음 && <단추 onClick={() => { set묶음(false); set고른(new Set()); }}>다시 흩어 놓기</단추>}
      </div>
      <읽기>
        {!묶음
          ? <>모두 {total}개예요. ‘{visual.perGroup}개씩 묶기’를 눌러 보세요.</>
          : k === 0
            ? <>{visual.perGroup}개씩 묶으니 <strong>{visual.groups}묶음</strong>이 되었어요. 묶음을 눌러 골라 보세요.</>
            : <>{visual.groups}묶음 가운데 <strong>{k}묶음</strong>을 골랐어요 → 전체의 <strong>{k}/{visual.groups}</strong>, 고른 것은 {visual.perGroup}×{k} = <strong>{visual.perGroup * k}개</strong></>}
      </읽기>
    </div>
  );
}

// ── 컴퍼스로 원 그리기 ───────────────────────────────────────────────
const 길이수 = (name?: string) => {
  const m = /(\d+(?:\.\d+)?)\s*cm/.exec(name ?? '');
  return m ? Number(m[1]) : null;
};

function CompassLab({ visual }: { visual: CircleVisual }) {
  const c = visual.circles[0];
  // 그림에 적힌 반지름(누름 못에서 연필까지, 반지름 선분, 지름 선분)을 찾습니다.
  const 반지름 = useMemo(() => {
    if (visual.strip) return visual.strip.pencilAt;
    for (const s of visual.segments ?? []) {
      const v = 길이수(s.name);
      if (v === null) continue;
      const 중심에서 = Math.hypot(s.from[0] - c.cx, s.from[1] - c.cy) < c.r * 0.05 || Math.hypot(s.to[0] - c.cx, s.to[1] - c.cy) < c.r * 0.05;
      const 길이 = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1]);
      if (중심에서 && Math.abs(길이 - c.r) < c.r * 0.05) return v;
      if (Math.abs(길이 - 2 * c.r) < c.r * 0.05) return v / 2;
    }
    return null;
  }, [visual, c]);
  const W = 320;
  const H = 300;
  const R = 110;
  const cx = W / 2;
  const cy = H / 2;
  const [돈, set돈] = useState(0); // 돌린 각(도), 0~360
  const [각, set각] = useState(0); // 연필의 지금 각
  const [선들, set선들] = useState<number[]>([]);
  const [지름, set지름] = useState(false);
  const 잡음 = useRef(false);
  const svg = useRef<SVGSVGElement>(null);
  const 다 = 돈 >= 359;
  const 각도 = (e: ReactPointerEvent) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return 0;
    const x = ((e.clientX - box.left) / box.width) * W - cx;
    const y = ((e.clientY - box.top) / box.height) * H - cy;
    const a = (Math.atan2(x, -y) * 180) / Math.PI;
    return a < 0 ? a + 360 : a;
  };
  const 움직임 = (e: ReactPointerEvent) => {
    if (!잡음.current) return;
    const a = 각도(e);
    // 앞으로(시계 방향) 돌린 만큼만 그립니다. 한 번에 크게 뛰면 무시합니다.
    let d = a - 각;
    if (d < -180) d += 360;
    if (d > 180) d -= 360;
    // 거의 한 바퀴(345° 이상) 돌리면 원을 닫아 줍니다. 손가락으로 딱 360°를 맞추기는 어렵습니다.
    if (d > 0 && d < 60) set돈((v) => (v + d >= 345 ? 360 : v + d));
    set각(a);
  };
  const 점 = (deg: number, r = R): [number, number] => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const [px, py] = 점(각);
  const [sx, sy] = 점(0);
  const [ex, ey] = 점(Math.min(돈, 359.9));
  const 호 = 다 ? `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}` : `M ${sx} ${sy} A ${R} ${R} 0 ${돈 > 180 ? 1 : 0} 1 ${ex} ${ey}`;
  const 길이 = 반지름 !== null ? `${반지름} cm` : '';
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="컴퍼스로 원 그리기" style={{ touchAction: 'none' }}
          onPointerMove={움직임} onPointerUp={() => { 잡음.current = false; }} onPointerCancel={() => { 잡음.current = false; }}
          onClick={(e) => { if (다 && !잡음.current) { const a = 각도(e as unknown as ReactPointerEvent); playTapSound(); set선들((v) => [...v.slice(-5), a]); } }}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          <path d={호} fill="none" stroke="#0f7175" strokeWidth="3.5" />
          {선들.map((a, k) => {
            const [x, y] = 점(a);
            return (
              <g key={k}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="#1565c0" strokeWidth="2.5" />
                {길이 && <text x={(cx + x) / 2} y={(cy + y) / 2 - 6} textAnchor="middle" fill="#1565c0" fontSize="14" fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">{길이}</text>}
              </g>
            );
          })}
          {지름 && (
            <g>
              <line x1={cx - R} y1={cy} x2={cx} y2={cy} stroke={강조} strokeWidth="4" />
              <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="#ef6c00" strokeWidth="4" />
              <text x={cx} y={cy + 44} textAnchor="middle" fill={강조} fontSize="15" fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">
                지름 = 반지름 2개{반지름 !== null ? ` = ${반지름 * 2} cm` : ''}
              </text>
            </g>
          )}
          {/* 컴퍼스: 누름 못(중심)과 연필을 잇는 다리 */}
          {!다 && <line x1={cx} y1={cy} x2={px} y2={py} stroke="#78909c" strokeWidth="5" strokeLinecap="round" />}
          {!다 && 길이 && <text x={(cx + px) / 2} y={(cy + py) / 2 - 8} textAnchor="middle" fill="#455a64" fontSize="14" fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">{길이}</text>}
          <circle cx={cx} cy={cy} r="7" fill={강조} />
          {!다 && (
            <g style={{ cursor: 'grab' }} onPointerDown={(e) => { e.preventDefault(); (e.target as Element).setPointerCapture?.(e.pointerId); 잡음.current = true; playTapSound(); }}>
              <circle cx={px} cy={py} r="20" fill="#1e88e5" fillOpacity="0.15" />
              <circle cx={px} cy={py} r="9" fill="#1e88e5" stroke="#ffffff" strokeWidth="2.5" />
            </g>
          )}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {다 && <단추 onClick={() => set지름((v) => !v)}>{지름 ? '지름 지우기' : '📏 지름 그어 보기'}</단추>}
        <단추 onClick={() => { set돈(0); set각(0); set선들([]); set지름(false); }}>다시 그리기</단추>
      </div>
      <읽기>
        {!다
          ? <>파란 연필을 잡고 누름 못(빨간 점) 둘레로 한 바퀴 돌려 보세요. 컴퍼스를 벌린 길이{길이 ? ` ${길이}` : ''}는 돌리는 동안 바뀌지 않아요.</>
          : 선들.length === 0
            ? <>원이 완성되었어요! 원 위의 아무 곳이나 눌러 원의 중심과 이어 보세요.</>
            : <>원의 중심에서 원 위까지 그은 선분 {선들.length}개가 모두 같은 길이{길이 ? `(${길이})` : ''}예요. 이것이 <strong>반지름</strong>이에요.</>}
      </읽기>
    </div>
  );
}

// 원 여러 개가 맞닿아 있는 그림: 원을 하나씩 눌러 지름을 이어 봅니다.
function DiameterChainLab({ visual }: { visual: CircleVisual }) {
  const [켠, set켠] = useState<number[]>([]);
  const xs = visual.circles.flatMap((c) => [c.cx - c.r, c.cx + c.r]);
  const ys = visual.circles.flatMap((c) => [c.cy - c.r, c.cy + c.r]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const W = 380;
  const pad = 24;
  const H = Math.max(140, Math.min(260, ((maxY - minY) / (maxX - minX)) * (W - 2 * pad) + 2 * pad + 30));
  const k = Math.min((W - 2 * pad) / (maxX - minX), (H - 2 * pad - 30) / (maxY - minY));
  const X = (x: number) => (W - (maxX - minX) * k) / 2 + (x - minX) * k;
  const Y = (y: number) => pad + (y - minY) * k;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {visual.rect && <rect x={X(visual.rect.x)} y={Y(visual.rect.y)} width={visual.rect.w * k} height={visual.rect.h * k} fill="none" stroke="#506579" strokeWidth="2.5" />}
          {visual.circles.map((c, i) => (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => { playTapSound(); set켠((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i])); }}>
              <circle cx={X(c.cx)} cy={Y(c.cy)} r={c.r * k} fill={켠.includes(i) ? '#e0f7fa' : '#ffffff'} fillOpacity="0.9" stroke="#0f7175" strokeWidth="3" />
              <circle cx={X(c.cx)} cy={Y(c.cy)} r="3.5" fill="#24364a" />
              {켠.includes(i) && (
                <g>
                  <line x1={X(c.cx - c.r)} y1={Y(c.cy)} x2={X(c.cx + c.r)} y2={Y(c.cy)} stroke={강조} strokeWidth="4" />
                  <circle cx={X(c.cx)} cy={Y(c.cy) - c.r * k * 0.45} r="12" fill={강조} />
                  <text x={X(c.cx)} y={Y(c.cy) - c.r * k * 0.45 + 5} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">{켠.indexOf(i) + 1}</text>
                </g>
              )}
            </g>
          ))}
          {(visual.points ?? []).filter((p) => p.name).map((p, i) => (
            <text key={i} x={X(p.x)} y={Y(p.y) + 22} textAnchor="middle" fill="#24364a" fontSize="15" fontWeight="900">{p.name}</text>
          ))}
        </svg>
      </div>
      <읽기>
        원을 하나씩 눌러 보세요. 누른 원마다 <strong>지름</strong>(빨간 선)이 그어져요. 지금까지 지름 <strong>{켠.length}개</strong>를 이었어요.
      </읽기>
    </div>
  );
}

// ── 그림그래프 하나씩 세기 ───────────────────────────────────────────
function PictureGraphLab({ visual }: { visual: PictureGraphVisual }) {
  const [센, set센] = useState<Set<string>>(new Set());
  const W = 380;
  const rowH = 40;
  const top = 34;
  const labelW = 70;
  const sumW = 120;
  const H = top + visual.rows.length * rowH + 16;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          <text x={W / 2} y="22" textAnchor="middle" fill="#0f7175" fontSize="14" fontWeight="900">큰 그림 = {visual.big}{visual.unitWord}, 작은 그림 = {visual.small}{visual.unitWord}</text>
          {visual.rows.map((row, r) => {
            const y = top + r * rowH;
            const cy = y + rowH / 2;
            const 큰 = Math.floor(row.value / visual.big);
            const 작은 = Math.round((row.value % visual.big) / visual.small);
            const 그림들 = [...Array(큰).fill(visual.big), ...Array(작은).fill(visual.small)] as number[];
            let x = 12 + labelW + 8;
            const 합 = 그림들.filter((_, k) => 센.has(`${r}-${k}`));
            return (
              <g key={r}>
                <text x={12 + labelW / 2} y={cy + 5} textAnchor="middle" fill="#24364a" fontSize="14" fontWeight="900">{row.label}</text>
                {visual.hideRow === r
                  ? <text x={x + 10} y={cy + 6} fill={강조} fontSize="18" fontWeight="900">?</text>
                  : 그림들.map((v, k) => {
                    const rr = v === visual.big ? 12 : 7;
                    const cxk = x + rr;
                    x += rr * 2 + 4;
                    const on = 센.has(`${r}-${k}`);
                    return (
                      <circle key={k} cx={cxk} cy={cy} r={rr} fill={on ? '#ffb74d' : '#18a7a7'} stroke={on ? '#e65100' : '#0f7175'} strokeWidth="2" style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                        onClick={() => { playTapSound(); set센((prev) => { const n = new Set(prev); const key = `${r}-${k}`; if (n.has(key)) n.delete(key); else n.add(key); return n; }); }} />
                    );
                  })}
                {합.length > 0 && (
                  <text x={W - sumW / 2 - 6} y={cy + 5} textAnchor="middle" fill="#e65100" fontSize="13" fontWeight="900">
                    {합.length > 4 ? `… = ${합.reduce((s, v) => s + v, 0)}` : `${합.join('+')} = ${합.reduce((s, v) => s + v, 0)}`}
                  </text>
                )}
                <line x1="12" y1={y + rowH} x2={W - 12} y2={y + rowH} stroke="#d7e3ec" strokeWidth="1" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => set센(new Set())}>다시 세기</단추>
      </div>
      <읽기>그림을 하나씩 눌러 보세요. 큰 그림은 {visual.big}, 작은 그림은 {visual.small}씩 더해져요. <strong>그림의 개수가 아니라 그림이 나타내는 수</strong>를 더해요.</읽기>
    </div>
  );
}

// ── 삼각자를 대어 직각 찾기 ──────────────────────────────────────────
function RightAngleLab({ visual }: { visual: LineFigureVisual }) {
  const items = visual.items.filter((one) => one.shape === 'angle' && one.points.length >= 3);
  const W = 380;
  const named = items.some((one) => one.name);
  const 칸 = W / Math.max(1, items.length);
  const H = 230;
  const r = Math.min(칸 / 2 - 8, 62);
  const [대, set대] = useState<number | null>(null);
  const [결과, set결과] = useState<Record<number, '직각' | '좁음' | '넓음'>>({});
  const 각들 = items.map((one, i) => {
    const cx = 칸 * i + 칸 / 2;
    const cy = 92;
    const p = one.points.map(([x, y]) => [cx + x * r, cy + y * r] as [number, number]);
    const v = p[1];
    const u = (q: [number, number]) => { const dx = q[0] - v[0]; const dy = q[1] - v[1]; const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l] as [number, number]; };
    const a1 = u(p[0]);
    const a2 = u(p[2]);
    const 크기 = (Math.acos(Math.max(-1, Math.min(1, a1[0] * a2[0] + a1[1] * a2[1]))) * 180) / Math.PI;
    // 삼각자의 한 변을 a1에 맞추고, 다른 변이 a2 쪽으로 가도록 뒤집을지 정합니다.
    const θ = (Math.atan2(a1[1], a1[0]) * 180) / Math.PI;
    const 왼 = [a1[1], -a1[0]]; // a1을 화면에서 시계 반대 방향으로 90° 돌린 방향(로컬 -y)
    const 뒤집 = 왼[0] * a2[0] + 왼[1] * a2[1] < 0;
    return { one, cx, cy, p, v, 크기, θ, 뒤집 };
  });
  const L = Math.min(r * 0.9, 56);
  const 놓기 = (i: number) => {
    playTapSound();
    set대(i);
    const k = 각들[i].크기;
    window.setTimeout(() => set결과((prev) => ({ ...prev, [i]: Math.abs(k - 90) < 2 ? '직각' : k < 90 ? '좁음' : '넓음' })), 750);
  };
  const 자 = 대 === null ? null : 각들[대];
  const 쉼자리 = { x: W - 60, y: H - 30 };
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {각들.map((g, i) => (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => 놓기(i)}>
              <rect x={칸 * i + 4} y="8" width={칸 - 8} height={H - 56} rx="10" fill={결과[i] === '직각' ? '#e8f5e9' : 결과[i] ? '#fff3e0' : 'transparent'} />
              <line x1={g.v[0]} y1={g.v[1]} x2={g.p[0][0]} y2={g.p[0][1]} stroke="#24364a" strokeWidth="3" strokeLinecap="round" />
              <line x1={g.v[0]} y1={g.v[1]} x2={g.p[2][0]} y2={g.p[2][1]} stroke="#24364a" strokeWidth="3" strokeLinecap="round" />
              {named && g.one.name && <text x={g.cx} y={H - 58} textAnchor="middle" fill="#24364a" fontSize="17" fontWeight="900">{g.one.name}</text>}
              {결과[i] && <text x={g.cx} y={H - 38} textAnchor="middle" fill={결과[i] === '직각' ? '#2e7d32' : '#e65100'} fontSize="14" fontWeight="900">{결과[i] === '직각' ? '직각 ✓' : 결과[i] === '좁음' ? '좁아요' : '넓어요'}</text>}
            </g>
          ))}
          {/* 삼각자: 직각인 모서리가 각의 꼭짓점에 오도록 날아갑니다. */}
          <g pointerEvents="none" style={{
            transform: 자 ? `translate(${자.v[0]}px, ${자.v[1]}px) rotate(${자.θ}deg) scale(1, ${자.뒤집 ? -1 : 1})` : `translate(${쉼자리.x}px, ${쉼자리.y}px) rotate(0deg)`,
            transition: 'transform 0.7s cubic-bezier(.3,1.3,.5,1)',
          }}>
            <path d={`M 0 0 L ${L} 0 L 0 ${-L} Z`} fill="#ffe082" fillOpacity="0.75" stroke="#f9a825" strokeWidth="2.5" />
            <path d={`M 9 0 L 9 -9 L 0 -9`} fill="none" stroke="#f57f17" strokeWidth="2" />
          </g>
        </svg>
      </div>
      <읽기>각을 눌러 보세요. 노란 삼각자의 직각 부분을 대어 봐요. 두 변이 삼각자에 <strong>꼭 맞으면 직각</strong>, 삼각자 안으로 들어오면 직각보다 <strong>좁은</strong> 각, 밖으로 나가면 <strong>넓은</strong> 각이에요.</읽기>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 어느 그림에 어느 실험실을 쓸지
// ════════════════════════════════════════════════════════════════════
export type 삼학년실험 = { 제목: string; 화면: ReactNode; 차례: string[] };

export const 무엇을해볼까_3학년 = (visual: QuestionVisual | undefined): 삼학년실험 | null => {
  if (!visual) return null;
  switch (visual.kind) {
    case 'beaker':
      return { 제목: '비커에 물을 부어 보세요', 화면: <BeakerLab visual={visual} />, 차례: ['작은 눈금 한 칸이 몇 mL인지 먼저 세어 보세요.', '1000 mL가 1 L예요.', '물의 윗면이 닿은 눈금을 읽어요.'] };
    case 'scale-dial':
      return { 제목: '저울에 추를 올려 보세요', 화면: <ScaleLab visual={visual} />, 차례: ['긴 눈금 사이가 작은 눈금 몇 칸인지 세어 보세요.', '1000 g이 1 kg이에요.', '바늘이 가리키는 눈금을 읽어요.'] };
    case 'balance':
      return { 제목: visual.right.unitG ? '추를 올려 수평을 맞춰 보세요' : '양팔저울에 올려 보세요', 화면: <BalanceLab visual={visual} />, 차례: ['양팔저울은 무거운 쪽이 아래로 내려가요.', '수평이 되면 두 쪽의 무게가 같아요.'] };
    case 'partition':
      return { 제목: '조각을 눌러 색칠해 보세요', 화면: <PieceLab visual={visual} />, 차례: ['전체가 몇 조각인지 세어 보세요.', '조각의 모양과 크기가 같은지 겹쳐 보세요.', '색칠한 조각이 몇 개인지 세어 분수로 나타내요.'] };
    case 'grouped':
      return { 제목: '묶어 보고 골라 보세요', 화면: <GroupLab visual={visual} />, 차례: ['똑같이 몇 개씩 묶었는지 보세요.', '전체가 몇 묶음인지 세어 보세요.', '몇 묶음을 골랐는지가 분자, 전체 묶음 수가 분모예요.'] };
    case 'picture-graph':
      return { 제목: '그림을 하나씩 눌러 세어 보세요', 화면: <PictureGraphLab visual={visual} />, 차례: ['큰 그림과 작은 그림이 각각 얼마를 나타내는지 보세요.', '큰 그림부터 세고, 작은 그림을 이어서 세어요.'] };
    case 'circles':
      if (visual.circles.length === 1) return { 제목: '컴퍼스로 원을 그려 보세요', 화면: <CompassLab visual={visual} />, 차례: ['원의 중심은 누름 못이 꽂힌 점이에요.', '중심에서 원 위까지가 반지름, 중심을 지나 원 위의 두 점을 이은 것이 지름이에요.', '지름은 반지름의 2배예요.'] };
      if (visual.circles.length >= 2 && !visual.circles.some((c) => c.faint)) return { 제목: '원마다 지름을 그어 보세요', 화면: <DiameterChainLab visual={visual} />, 차례: ['원 하나의 지름이 얼마인지 먼저 구하세요.', '선분이 지름 몇 개를 이은 것인지 세어 보세요.'] };
      return null;
    case 'line-figure':
      if (visual.items.length >= 2 && visual.items.every((one) => one.shape === 'angle')) return { 제목: '삼각자를 대어 보세요', 화면: <RightAngleLab visual={visual} />, 차례: ['삼각자의 직각 부분을 각의 꼭짓점에 맞추어요.', '한 변을 삼각자에 맞추고, 다른 변이 삼각자의 다른 변과 겹치는지 보세요.'] };
      return null;
    default:
      return null;
  }
};
