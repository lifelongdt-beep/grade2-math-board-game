import type { RatioGraphVisual } from '../types';

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
