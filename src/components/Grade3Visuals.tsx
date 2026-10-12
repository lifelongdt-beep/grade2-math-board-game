import type { BalanceVisual, BeakerVisual, ScaleDialVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 3학년 그림 — 들이와 무게(3-2 5단원)
// ────────────────────────────────────────────────────────────────────
// 지도서는 들이를 비커의 눈금으로, 무게를 저울의 바늘로 읽게 합니다.
// 1 L=1000 mL, 1 kg=1000 g을 글로만 외우면 '1 L 300 mL'와 '1300 mL'가
// 같은 양이라는 것이 손에 잡히지 않습니다. 눈금을 직접 읽어야 합니다.
//
// 그림마다 물의 양·바늘·추의 수를 바깥에서 바꿀 수 있게 합니다.
// 자세히 보기에서 아이가 물을 붓고 추를 올리면 같은 그림이 움직입니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#182433';
const 선 = '#0f4c5c';

/** 1300 → '1 L 300 mL'처럼 씁니다. */
export const 들이글 = (ml: number) => {
  const L = Math.floor(ml / 1000);
  const m = ml % 1000;
  if (L === 0) return `${m} mL`;
  if (m === 0) return `${L} L`;
  return `${L} L ${m} mL`;
};

/** 2300 → '2 kg 300 g'처럼 씁니다. */
export const 무게글 = (g: number) => {
  const k = Math.floor(g / 1000);
  const r = g % 1000;
  if (k === 0) return `${r} g`;
  if (r === 0) return `${k} kg`;
  return `${k} kg ${r} g`;
};

// ── 비커 ────────────────────────────────────────────────────────────
export function BeakerGraphic({ visual, amountMl, targetMl }: { visual: BeakerVisual; amountMl?: number; targetMl?: number }) {
  const W = 300;
  const H = 270;
  const left = 132;
  const right = 236;
  const top = 34;
  const bottom = 236;
  const amount = amountMl ?? visual.amountMl;
  const y = (ml: number) => bottom - ((bottom - top) * ml) / visual.maxMl;
  const 눈금 = Array.from({ length: Math.floor(visual.maxMl / visual.minorMl) + 1 }, (_, k) => k * visual.minorMl);
  const 큰눈금글 = (ml: number) => (ml % 1000 === 0 ? `${ml / 1000} L` : `${ml} mL`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
      {/* 물: 높이가 바뀔 때 부드럽게 오르내립니다. */}
      <rect x={left + 2} y={y(amount)} width={right - left - 4} height={Math.max(0, bottom - y(amount))} fill="#7fd3f5" style={{ transition: 'y 0.45s ease, height 0.45s ease' }} />
      <line x1={left + 2} x2={right - 2} y1={y(amount)} y2={y(amount)} stroke="#1e88c8" strokeWidth="3" style={{ transition: 'all 0.45s ease' }} />
      {/* 비커 */}
      <path d={`M ${left - 8} ${top - 10} L ${left} ${top} L ${left} ${bottom} Q ${left} ${bottom + 8} ${left + 8} ${bottom + 8} L ${right - 8} ${bottom + 8} Q ${right} ${bottom + 8} ${right} ${bottom} L ${right} ${top - 10}`} fill="none" stroke={선} strokeWidth="3.5" strokeLinejoin="round" />
      {눈금.map((ml) => {
        const 큰 = ml % visual.majorMl === 0;
        return (
          <g key={ml}>
            <line x1={left} x2={left + (큰 ? 26 : 14)} y1={y(ml)} y2={y(ml)} stroke={선} strokeWidth={큰 ? 2.4 : 1.4} />
            {큰 && ml > 0 && (
              <text x={left - 8} y={y(ml) + 5} textAnchor="end" fill={글} fontSize="15" fontWeight="900">{큰눈금글(ml)}</text>
            )}
          </g>
        );
      })}
      {targetMl !== undefined && (
        <g>
          <line x1={left - 4} x2={right + 10} y1={y(targetMl)} y2={y(targetMl)} stroke="#d0482f" strokeWidth="2.5" strokeDasharray="7 5" />
          <text x={right + 12} y={y(targetMl) + 5} fill="#d0482f" fontSize="14" fontWeight="900">그림</text>
        </g>
      )}
    </svg>
  );
}

// ── 바늘 저울 ───────────────────────────────────────────────────────
// 0이 맨 위, 시계 방향으로 300°까지 씁니다. 한 바퀴를 다 쓰거나 거의
// 다 쓰면 0과 끝 눈금이 붙어 '0인지 끝인지' 헷갈립니다.
const 저울각 = (g: number, max: number) => (g / max) * 300;

export function ScaleDialGraphic({ visual, amountG, targetG }: { visual: ScaleDialVisual; amountG?: number; targetG?: number }) {
  const W = 300;
  const H = 290;
  const cx = 150;
  const cy = 170;
  const R = 104;
  const amount = amountG ?? visual.amountG;
  const at = (deg: number, r: number): [number, number] => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const 눈금 = Array.from({ length: Math.floor(visual.maxG / visual.minorG) + 1 }, (_, k) => k * visual.minorG);
  const kg단위 = visual.maxG > 1000;
  const 큰글 = (g: number) => (kg단위 ? (g % 1000 === 0 ? `${g / 1000} kg` : '') : String(g));
  const 바늘 = 저울각(amount, visual.maxG);
  const [nx, ny] = at(0, R - 16);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
      {/* 접시와 몸통 */}
      <rect x={cx - 92} y="22" width="184" height="12" rx="6" fill="#cfd8dc" stroke={선} strokeWidth="2.5" />
      <rect x={cx - 10} y="34" width="20" height="18" fill="#b0bec5" stroke={선} strokeWidth="2" />
      <rect x={cx - 126} y="52" width="252" height="232" rx="26" fill="#fff8e1" stroke={선} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={R + 6} fill="#ffffff" stroke={선} strokeWidth="2.5" />
      {눈금.map((g) => {
        const 큰 = g % visual.majorG === 0;
        const 반 = !큰 && kg단위 && g % 500 === 0;
        const [x1, y1] = at(저울각(g, visual.maxG), R);
        const [x2, y2] = at(저울각(g, visual.maxG), R - (큰 ? 16 : 반 ? 12 : 8));
        const [tx, ty] = at(저울각(g, visual.maxG), R - 32);
        return (
          <g key={g}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={선} strokeWidth={큰 ? 2.6 : 1.3} />
            {큰 && <text x={tx} y={ty + 5} textAnchor="middle" fill={글} fontSize={kg단위 ? 15 : 12} fontWeight="900">{g === 0 ? '0' : 큰글(g)}</text>}
          </g>
        );
      })}
      {!kg단위 && <text x={cx} y={cy + 52} textAnchor="middle" fill="#56708a" fontSize="16" fontWeight="900">g</text>}
      {targetG !== undefined && (() => {
        const [tx, ty] = at(저울각(targetG, visual.maxG), R - 12);
        return <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#d0482f" strokeWidth="3" strokeDasharray="6 5" opacity="0.8" />;
      })()}
      {/* 바늘: 무게가 바뀌면 돌아갑니다. */}
      <g style={{ transform: `rotate(${바늘}deg)`, transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box', transition: 'transform 0.6s cubic-bezier(.3,1.6,.5,1)' }}>
        <line x1={cx} y1={cy + 14} x2={nx} y2={ny} stroke="#d32f2f" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r="8" fill="#d32f2f" />
    </svg>
  );
}

// ── 양팔저울 ────────────────────────────────────────────────────────
const 기울기 = { left: -11, right: 11, level: 0 } as const;

export function BalanceGraphic({ visual, rightCount, tilt }: { visual: BalanceVisual; rightCount?: number; tilt?: BalanceVisual['tilt'] }) {
  const W = 340;
  const H = 230;
  const px = W / 2;
  const py = 74;
  const half = 112;
  const 각 = 기울기[tilt ?? visual.tilt];
  const rad = (각 * Math.PI) / 180;
  // 막대 양 끝(돌린 뒤)의 자리입니다. 접시는 끝에서 실로 늘어뜨립니다.
  const 끝 = (side: -1 | 1): [number, number] => [px + side * half * Math.cos(rad), py + side * half * Math.sin(rad)];
  const [lx, ly] = 끝(-1);
  const [rx, ry] = 끝(1);
  const 줄 = 58;
  const count = rightCount ?? visual.right.count;
  const 접시 = (x: number, y: number, side: 'left' | 'right', 물건: BalanceVisual['left']) => {
    const 추 = side === 'right' && count !== undefined && visual.right.unitG;
    return (
      <g style={{ transform: `translate(${x - px}px, ${y - py}px)`, transition: 'transform 0.6s ease' }}>
        <line x1={px - 30} y1={py} x2={px - 40} y2={py + 줄} stroke="#78909c" strokeWidth="1.6" />
        <line x1={px + 30} y1={py} x2={px + 40} y2={py + 줄} stroke="#78909c" strokeWidth="1.6" />
        <path d={`M ${px - 48} ${py + 줄} Q ${px} ${py + 줄 + 18} ${px + 48} ${py + 줄}`} fill="#eceff1" stroke={선} strokeWidth="2.5" />
        {추 ? (
          Array.from({ length: count ?? 0 }, (_, k) => {
            const col = k % 4;
            const row = Math.floor(k / 4);
            const bx = px - 34 + col * 18;
            const by = py + 줄 - 14 - row * 15;
            return <rect key={k} x={bx} y={by} width="15" height="13" rx="2" fill="#90a4ae" stroke={선} strokeWidth="1.4" />;
          })
        ) : (
          <g>
            <ellipse cx={px} cy={py + 줄 - (물건.big ? 22 : 11)} rx={물건.big ? 30 : 12} ry={물건.big ? 22 : 11} fill={side === 'left' ? '#ffcc80' : '#b0bec5'} stroke={선} strokeWidth="2" />
          </g>
        )}
        <text x={px} y={py + 줄 + 30} textAnchor="middle" fill={글} fontSize="14" fontWeight="900">
          {추 ? `${visual.right.unitG} g 추 ${count}개` : 물건.name}
        </text>
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
      {/* 받침 */}
      <path d={`M ${px - 40} ${H - 14} L ${px + 40} ${H - 14} L ${px + 10} ${py + 10} L ${px - 10} ${py + 10} Z`} fill="#cfd8dc" stroke={선} strokeWidth="2.5" />
      {접시(lx, ly, 'left', visual.left)}
      {접시(rx, ry, 'right', visual.right)}
      {/* 막대: 무거운 쪽으로 기웁니다. */}
      <g style={{ transform: `rotate(${각}deg)`, transformOrigin: `${px}px ${py}px`, transformBox: 'view-box', transition: 'transform 0.6s ease' }}>
        <rect x={px - half - 6} y={py - 5} width={half * 2 + 12} height="10" rx="5" fill="#8d6e63" stroke={선} strokeWidth="2" />
      </g>
      <circle cx={px} cy={py} r="8" fill="#ffd54f" stroke={선} strokeWidth="2" />
    </svg>
  );
}
