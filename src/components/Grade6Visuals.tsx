import type { ReactNode } from 'react';
import type { CircleRegionVisual, RatioGraphVisual, SolidFigureVisual, SolidNetVisual, StackPlanVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 6학년 그림 — 띠그래프와 원그래프
// ────────────────────────────────────────────────────────────────────
// 띠의 길이와 부채꼴의 크기는 백분율 그대로 그립니다. 교과서처럼 각
// 칸에 항목 이름과 백분율을 적고, 모르는 값은 '?'로 둡니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#182433';
const 색 = ['#4dd0e1', '#ffb74d', '#aed581', '#f48fb1', '#b39ddb', '#90a4ae'];

export function RatioGraphGraphic({ visual }: { visual: RatioGraphVisual }) {
  const items = visual.items.slice(0, 6);
  const 글자 = (it: { percent: number; hidden?: boolean }) => (it.hidden ? '?' : `${it.percent}%`);
  if (visual.shape === 'band') {
    const left = 20;
    const w = 380;
    const top = 40;
    const h = 46;
    let x = left;
    return (
      <svg viewBox={`0 0 ${left * 2 + w} ${top + h + 40}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={left * 2 + w - 4} height={top + h + 36} rx="12" {...판} />
        <text x={left + w / 2} y="24" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{visual.title}</text>
        {items.map((it, k) => {
          const ww = (w * it.percent) / 100;
          const x0 = x;
          x += ww;
          return (
            <g key={k}>
              <rect x={x0} y={top} width={ww} height={h} fill={색[k % 색.length]} stroke="#37474f" strokeWidth="1.2" />
              {ww >= 30 && <text x={x0 + ww / 2} y={top + 19} textAnchor="middle" fill={글} fontSize="11" fontWeight="800">{it.name}</text>}
              {ww >= 22 && <text x={x0 + ww / 2} y={top + 36} textAnchor="middle" fill={글} fontSize="11" fontWeight="900">{글자(it)}</text>}
            </g>
          );
        })}
        {Array.from({ length: 11 }, (_, t) => (
          <g key={t}>
            <line x1={left + (w * t) / 10} y1={top + h} x2={left + (w * t) / 10} y2={top + h + 5} stroke="#56708a" />
            {t % 2 === 0 && <text x={left + (w * t) / 10} y={top + h + 18} textAnchor="middle" fill="#56708a" fontSize="10" fontWeight="700">{t * 10}</text>}
          </g>
        ))}
        <text x={left + w} y={top + h + 32} textAnchor="end" fill="#56708a" fontSize="10" fontWeight="700">(%)</text>
      </svg>
    );
  }
  const cx = 150;
  const cy = 132;
  const r = 92;
  let 시작 = -90;
  return (
    <svg viewBox="0 0 300 240" role="img" aria-label={visual.label}>
      <rect x="2" y="2" width="296" height="236" rx="12" {...판} />
      <text x={cx} y="24" textAnchor="middle" fill={글} fontSize="16" fontWeight="900">{visual.title}</text>
      {items.map((it, k) => {
        const 각 = (360 * it.percent) / 100;
        const a0 = (시작 * Math.PI) / 180;
        const a1 = ((시작 + 각) * Math.PI) / 180;
        const mid = ((시작 + 각 / 2) * Math.PI) / 180;
        시작 += 각;
        const 큰 = 각 > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${큰} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
        const lx = cx + r * 0.62 * Math.cos(mid);
        const ly = cy + r * 0.62 * Math.sin(mid);
        return (
          <g key={k}>
            <path d={d} fill={색[k % 색.length]} stroke="#37474f" strokeWidth="1.2" />
            {it.percent >= 8 && (
              <>
                <text x={lx} y={ly - 3} textAnchor="middle" fill={글} fontSize="14" fontWeight="800">{it.name}</text>
                <text x={lx} y={ly + 14} textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{글자(it)}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── 쌓기나무를 위에서 본 모양 ───────────────────────────────────────
// 아래쪽에 '앞', 오른쪽에 '옆'을 적어 보는 방향을 못박습니다. 등각
// 그림만 주면 뒤에 숨은 쌓기나무를 셀 수 없고 '앞'이 어느 쪽인지도
// 흔들립니다.
export function StackPlanGraphic({ visual }: { visual: StackPlanVisual }) {
  const rows = visual.heights.length;
  const cols = Math.max(...visual.heights.map((r) => r.length));
  const cell = 40;
  const left = 30;
  const top = 18;
  const width = left + cols * cell + 60;
  const height = top + rows * cell + 40;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" {...판} />
      {visual.heights.map((row, r) =>
        row.map((h, c) =>
          h > 0 ? (
            <g key={`${r}-${c}`}>
              <rect x={left + c * cell} y={top + r * cell} width={cell} height={cell} fill="#dffafa" stroke="#0f7175" strokeWidth="2" />
              {visual.numbers && (
                <text x={left + c * cell + cell / 2} y={top + r * cell + cell / 2 + 7} textAnchor="middle" fill={visual.hidden && visual.hidden[0] === r && visual.hidden[1] === c ? '#bf360c' : 글} fontSize="20" fontWeight="900">
                  {visual.hidden && visual.hidden[0] === r && visual.hidden[1] === c ? '?' : h}
                </text>
              )}
            </g>
          ) : null,
        ),
      )}
      <text x={left + (cols * cell) / 2} y={top + rows * cell + 26} textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">앞</text>
      <text x={left + cols * cell + 30} y={top + (rows * cell) / 2 + 5} textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">옆</text>
    </svg>
  );
}

// ── 입체도형의 겨냥도 ──────────────────────────────────────────────
// 앞쪽 조금 위에서 내려다본 모습입니다(정사영). 면이 보는 쪽을 향하는지로
// 모서리가 보이는지를 정하고, 보이지 않는 모서리는 점선으로 그립니다.
// 겨냥도에서 보이지 않는 모서리를 점선으로 그리는 것은 5학년부터 써 온
// 약속입니다.
const 선 = '#0f4c5c';
const 면색 = '#dff4f7';
const 이름색 = '#bf360c';
const 내려봄 = (20 * Math.PI) / 180;
const 사인 = Math.sin(내려봄);
const 코사인 = Math.cos(내려봄);
// (x, 위, 앞) → 화면 (x, y). 앞으로 나온 점일수록 화면에서 아래에 놓입니다.
const 비춤 = (x: number, y: number, z: number): [number, number] => [x, -y * 코사인 + z * 사인];

type P2 = [number, number];
const 이어 = (pts: P2[]) => pts.map(([x, y], k) => `${k === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

function 길이글({ x, y, text, anchor = 'middle', size = 19 }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={이름색} fontSize={size} fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">
      {text}
    </text>
  );
}

export function SolidFigureGraphic({ visual }: { visual: SolidFigureVisual }) {
  const W = 300;
  const H = 230;
  // 그림 좌표(반지름 1 기준)를 화면에 맞추는 배율과 중심입니다.
  const 맞춤 = (pts: P2[], 여백 = 46) => {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs) || 1;
    const h = Math.max(...ys) - Math.min(...ys) || 1;
    const k = Math.min((W - 2 * 여백) / w, (H - 2 * 여백 + 10) / h);
    const ox = W / 2 - ((Math.max(...xs) + Math.min(...xs)) / 2) * k;
    const oy = H / 2 - ((Math.max(...ys) + Math.min(...ys)) / 2) * k;
    return { k, at: ([x, y]: P2): P2 => [ox + x * k, oy + y * k] };
  };
  const 판그림 = (children: ReactNode) => (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
      {children}
    </svg>
  );

  if (visual.solid === 'prism' || visual.solid === 'pyramid') {
    const n = Math.max(3, visual.sides ?? 3);
    const 높이 = visual.solid === 'prism' ? 1.5 : 1.7;
    // 한 면이 정면을 똑바로 보지 않게 조금 돌립니다. 똑바로 보면 옆의 두
    // 면이 선 하나로 겹쳐 보입니다.
    const 시작 = Math.PI / 2 - Math.PI / n + 0.22;
    const 각 = Array.from({ length: n }, (_, k) => 시작 + (2 * Math.PI * k) / n);
    const 아래 = 각.map((t) => 비춤(Math.cos(t), -높이 / 2, Math.sin(t)));
    const 위 = 각.map((t) => 비춤(Math.cos(t), 높이 / 2, Math.sin(t)));
    const 꼭대기 = 비춤(0, 높이 / 2, 0);
    const 변심 = Math.cos(Math.PI / n);
    const 보임 = 각.map((t) => {
      const m = t + Math.PI / n;
      return visual.solid === 'prism' ? Math.sin(m) > 1e-6 : 변심 * 사인 + 높이 * Math.sin(m) * 코사인 > 1e-6;
    });
    const { at } = 맞춤(visual.solid === 'prism' ? [...아래, ...위] : [...아래, 꼭대기]);
    const 모서리: Array<{ a: P2; b: P2; 보: boolean }> = [];
    for (let k = 0; k < n; k += 1) {
      const j = (k + 1) % n;
      const 옆보임 = 보임[k] || 보임[(k + n - 1) % n];
      모서리.push({ a: 아래[k], b: 아래[j], 보: 보임[k] });
      if (visual.solid === 'prism') {
        모서리.push({ a: 위[k], b: 위[j], 보: true });
        모서리.push({ a: 아래[k], b: 위[k], 보: 옆보임 });
      } else {
        모서리.push({ a: 꼭대기, b: 아래[k], 보: 옆보임 });
      }
    }
    return 판그림(
      <>
        {visual.solid === 'prism' && <path d={`${이어(위.map(at))} Z`} fill={면색} stroke="none" />}
        {/* 숨은 모서리를 먼저, 보이는 모서리를 위에 그립니다. */}
        {모서리
          .filter((e) => !e.보)
          .map((e, k) => (
            <line key={`h${k}`} x1={at(e.a)[0]} y1={at(e.a)[1]} x2={at(e.b)[0]} y2={at(e.b)[1]} stroke={선} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.75" />
          ))}
        {모서리
          .filter((e) => e.보)
          .map((e, k) => (
            <line key={`v${k}`} x1={at(e.a)[0]} y1={at(e.a)[1]} x2={at(e.b)[0]} y2={at(e.b)[1]} stroke={선} strokeWidth="2.4" strokeLinecap="round" />
          ))}
      </>,
    );
  }

  const r = Math.max(0.1, visual.radius ?? 1);
  const h = Math.max(0.1, visual.height ?? (visual.solid === 'sphere' ? 2 * r : 2 * r));
  const ry = r * 사인;
  if (visual.solid === 'sphere') {
    const { k, at } = 맞춤([[-r, -r], [r, r]], 40);
    const [cx, cy] = at([0, 0]);
    const R = r * k;
    const L = visual.labels ?? {};
    return 판그림(
      <>
        <circle cx={cx} cy={cy} r={R} fill={면색} stroke={선} strokeWidth="2.4" />
        <path d={`M ${cx - R} ${cy} A ${R} ${ry * k} 0 0 0 ${cx + R} ${cy}`} fill="none" stroke={선} strokeWidth="1.8" />
        <path d={`M ${cx - R} ${cy} A ${R} ${ry * k} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke={선} strokeWidth="1.4" strokeDasharray="5 4" opacity="0.75" />
        <circle cx={cx} cy={cy} r="3.5" fill={선} />
        {L.diameter ? (
          <>
            <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={이름색} strokeWidth="2.2" />
            <길이글 x={cx} y={cy - ry * k - 6} text={L.diameter} />
          </>
        ) : L.radius ? (
          <>
            <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={이름색} strokeWidth="2.2" />
            <길이글 x={cx + R / 2} y={cy - 9} text={L.radius} />
          </>
        ) : null}
      </>,
    );
  }

  // 원기둥과 원뿔: 밑면(아래 타원)의 중심을 (0, 0)에 둡니다.
  const 꼭대기y = -h * 코사인;
  const { k, at } = 맞춤([[-r, 꼭대기y - (visual.solid === 'cylinder' ? ry : 0)], [r, ry]], 46);
  const [cx, by] = at([0, 0]);
  const [, ty] = at([0, 꼭대기y]);
  const R = r * k;
  const RY = Math.max(4, ry * k);
  const L = visual.labels ?? {};
  const 앞반 = (y: number) => `M ${cx - R} ${y} A ${R} ${RY} 0 0 0 ${cx + R} ${y}`;
  const 뒤반 = (y: number) => `M ${cx - R} ${y} A ${R} ${RY} 0 0 1 ${cx + R} ${y}`;
  if (visual.solid === 'cylinder') {
    return 판그림(
      <>
        <path d={`M ${cx - R} ${ty} L ${cx - R} ${by} A ${R} ${RY} 0 0 0 ${cx + R} ${by} L ${cx + R} ${ty} Z`} fill={면색} stroke="none" />
        <ellipse cx={cx} cy={ty} rx={R} ry={RY} fill="#c5ebf1" stroke={선} strokeWidth="2.4" />
        <line x1={cx - R} y1={ty} x2={cx - R} y2={by} stroke={선} strokeWidth="2.4" />
        <line x1={cx + R} y1={ty} x2={cx + R} y2={by} stroke={선} strokeWidth="2.4" />
        <path d={앞반(by)} fill="none" stroke={선} strokeWidth="2.4" />
        <path d={뒤반(by)} fill="none" stroke={선} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.75" />
        {(L.radius || L.diameter) && (
          <>
            <circle cx={cx} cy={ty} r="3" fill={이름색} />
            <line x1={L.diameter ? cx - R : cx} y1={ty} x2={cx + R} y2={ty} stroke={이름색} strokeWidth="2.2" />
            <길이글 x={L.diameter ? cx : cx + R / 2} y={ty - RY - 6} text={(L.diameter ?? L.radius) as string} />
          </>
        )}
        {L.height && <길이글 x={cx + R + 8} y={(ty + by) / 2 + 5} text={L.height} anchor="start" />}
      </>,
    );
  }
  // 원뿔
  return 판그림(
    <>
      <path d={`M ${cx} ${ty} L ${cx - R} ${by} A ${R} ${RY} 0 0 0 ${cx + R} ${by} Z`} fill={면색} stroke="none" />
      <line x1={cx} y1={ty} x2={cx - R} y2={by} stroke={선} strokeWidth="2.4" strokeLinejoin="round" />
      <line x1={cx} y1={ty} x2={cx + R} y2={by} stroke={L.slant ? 이름색 : 선} strokeWidth="2.4" />
      <path d={앞반(by)} fill="none" stroke={선} strokeWidth="2.4" />
      <path d={뒤반(by)} fill="none" stroke={선} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.75" />
      <circle cx={cx} cy={by} r="3" fill={선} />
      {L.height && (
        <>
          <line x1={cx} y1={ty} x2={cx} y2={by} stroke={이름색} strokeWidth="2" strokeDasharray="6 4" />
          <path d={`M ${cx} ${by - 10} L ${cx + 10} ${by - 10} L ${cx + 10} ${by}`} fill="none" stroke={이름색} strokeWidth="1.4" />
          <길이글 x={cx - 7} y={(ty + by) / 2 + 5} text={L.height} anchor="end" />
        </>
      )}
      {(L.radius || L.diameter) && (
        <>
          <line x1={L.diameter ? cx - R : cx} y1={by} x2={cx + R} y2={by} stroke={이름색} strokeWidth="2.2" />
          <길이글 x={L.diameter ? cx : cx + R / 2} y={by + RY + 18} text={(L.diameter ?? L.radius) as string} />
        </>
      )}
      {L.slant && <길이글 x={(cx + cx + R) / 2 + 10} y={(ty + by) / 2} text={L.slant} anchor="start" />}
    </>,
  );
}

// ── 각기둥·원기둥의 전개도 ─────────────────────────────────────────
// 옆면을 이은 큰 직사각형을 가운데 두고, 밑면을 위아래에 하나씩
// 붙입니다. 길이는 비율 그대로이고, 묻는 길이는 '?'로 적습니다.
const L0 = (v: SolidNetVisual) => v.labels ?? {};

export function SolidNetGraphic({ visual }: { visual: SolidNetVisual }) {
  const n = Math.max(3, visual.sides ?? 4);
  const s = visual.base;
  const h = visual.height;
  const 가로 = visual.solid === 'prism' ? n * s : 2 * Math.PI * s;
  // 밑면이 붙는 자리(가로 방향)와 밑면이 위아래로 튀어나오는 길이입니다.
  const 붙는곳 = visual.solid === 'prism' ? s * Math.min(1, n - 1) : 가로 * 0.28;
  const 튀어나옴 = visual.solid === 'prism' ? (n % 2 === 0 ? s / Math.tan(Math.PI / n) : s / (2 * Math.tan(Math.PI / n)) + s / (2 * Math.sin(Math.PI / n))) : 2 * s;
  const 전체가로 = 가로;
  const 전체세로 = h + 2 * 튀어나옴;
  const W = 360;
  const 여백 = 34;
  // 왼쪽에 높이를 적을 자리를 더 둡니다.
  const 왼자리 = L0(visual).height ? 50 : 0;
  const k = Math.min((W - 2 * 여백 - 왼자리) / 전체가로, 250 / 전체세로);
  const 아래칸 = L0(visual).width ? 34 : 0;
  const Hh = 전체세로 * k + 2 * 여백 + 아래칸;
  const ox = (W - 전체가로 * k + 왼자리) / 2;
  const oy = 여백 + 튀어나옴 * k;
  const X = (x: number) => ox + x * k;
  const Y = (y: number) => oy + y * k;
  const L = visual.labels ?? {};
  // 한 변이 (x0, y0)~(x0+s, y0)이고 바깥(dir: -1 위, 1 아래)으로 붙은 정n각형
  const 다각형 = (x0: number, y0: number, dir: number) => {
    const 반지름 = s / (2 * Math.sin(Math.PI / n));
    const 변심 = s / (2 * Math.tan(Math.PI / n));
    const c: P2 = [x0 + s / 2, y0 + dir * 변심];
    const 처음 = Math.atan2(y0 - c[1], x0 - c[0]);
    return Array.from({ length: n }, (_, j): P2 => [c[0] + 반지름 * Math.cos(처음 + (dir * 2 * Math.PI * j) / n), c[1] + 반지름 * Math.sin(처음 + (dir * 2 * Math.PI * j) / n)]);
  };
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={Hh - 4} rx="12" {...판} />
      <rect x={X(0)} y={Y(0)} width={가로 * k} height={h * k} fill={면색} stroke={선} strokeWidth="2.2" />
      {visual.solid === 'prism' ? (
        <>
          {Array.from({ length: n - 1 }, (_, j) => (
            <line key={j} x1={X((j + 1) * s)} y1={Y(0)} x2={X((j + 1) * s)} y2={Y(h)} stroke={선} strokeWidth="1.6" strokeDasharray="5 4" />
          ))}
          <path d={`${이어(다각형(붙는곳, 0, -1).map(([x, y]) => [X(x), Y(y)] as P2))} Z`} fill="#c5ebf1" stroke={선} strokeWidth="2.2" />
          <path d={`${이어(다각형(붙는곳, h, 1).map(([x, y]) => [X(x), Y(y)] as P2))} Z`} fill="#c5ebf1" stroke={선} strokeWidth="2.2" />
          {/* 밑면이 붙지 않은 마지막 옆면의 윗변에 한 변의 길이를 적습니다. */}
          {L.base && <길이글 x={X((n - 0.5) * s)} y={Y(0) - 7} text={L.base} size={21} />}
        </>
      ) : (
        <>
          <circle cx={X(붙는곳)} cy={Y(-s)} r={s * k} fill="#c5ebf1" stroke={선} strokeWidth="2.2" />
          <circle cx={X(붙는곳)} cy={Y(h + s)} r={s * k} fill="#c5ebf1" stroke={선} strokeWidth="2.2" />
          {L.base && (
            <>
              <circle cx={X(붙는곳)} cy={Y(-s)} r="2.6" fill={이름색} />
              <line x1={X(붙는곳)} y1={Y(-s)} x2={X(붙는곳 + s)} y2={Y(-s)} stroke={이름색} strokeWidth="2" />
              <길이글 x={X(붙는곳 + s) + 6} y={Y(-s) + 5} text={L.base} anchor="start" size={21} />
            </>
          )}
        </>
      )}
      {L.height && <길이글 x={X(0) - 6} y={Y(h / 2) + 5} text={L.height} anchor="end" size={21} />}
      {/* 옆면의 가로는 밑면에 가리지 않게 맨 아래에 괄호로 적습니다. */}
      {L.width && (
        <>
          <line x1={X(0)} y1={Y(h)} x2={X(0)} y2={Y(h + 튀어나옴) + 14} stroke={이름색} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={X(가로)} y1={Y(h)} x2={X(가로)} y2={Y(h + 튀어나옴) + 14} stroke={이름색} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={X(0)} y1={Y(h + 튀어나옴) + 12} x2={X(가로)} y2={Y(h + 튀어나옴) + 12} stroke={이름색} strokeWidth="1.8" />
          <길이글 x={X(가로 / 2)} y={Y(h + 튀어나옴) + 32} text={L.width} size={21} />
        </>
      )}
    </svg>
  );
}

// ── 반원과 고리 ─────────────────────────────────────────────────────
export function CircleRegionGraphic({ visual }: { visual: CircleRegionVisual }) {
  const W = 300;
  const H = visual.shape === 'semicircle' ? 170 : 240;
  const R = visual.shape === 'semicircle' ? 120 : 100;
  const cx = W / 2;
  const cy = visual.shape === 'semicircle' ? 140 : H / 2;
  if (visual.shape === 'semicircle') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
        <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill="#b2ebf2" stroke={선} strokeWidth="2.4" />
        <circle cx={cx} cy={cy} r="3.5" fill={선} />
        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={이름색} strokeWidth="2.4" />
        <길이글 x={cx + R / 2} y={cy - 9} text={visual.labels.outer} />
      </svg>
    );
  }
  const r = (R * (visual.inner ?? 0)) / visual.outer;
  const 기울기 = (-35 * Math.PI) / 180;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} Z M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`} fill="#b2ebf2" fillRule="evenodd" stroke={선} strokeWidth="2.4" />
      <circle cx={cx} cy={cy} r="3.5" fill={선} />
      <line x1={cx} y1={cy} x2={cx + R * Math.cos(기울기)} y2={cy + R * Math.sin(기울기)} stroke={이름색} strokeWidth="2.2" />
      <길이글 x={cx + R * 0.62 * Math.cos(기울기) + 6} y={cy + R * 0.62 * Math.sin(기울기) - 6} text={visual.labels.outer} anchor="start" />
      <line x1={cx} y1={cy} x2={cx - r} y2={cy} stroke="#1565c0" strokeWidth="2.2" />
      {visual.labels.inner && (
        <text x={cx - r / 2} y={cy + 20} textAnchor="middle" fill="#1565c0" fontSize="19" fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">
          {visual.labels.inner}
        </text>
      )}
    </svg>
  );
}
