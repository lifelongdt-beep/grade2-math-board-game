import type { ReactNode } from 'react';

// ════════════════════════════════════════════════════════════════════
// 분을 한 칸씩 늘어놓은 그림(2-2 4단원 시각과 시간)
// ────────────────────────────────────────────────────────────────────
// 한 줄에 60칸(=60분=1시간)씩 놓고, 10칸마다 굵은 선을 긋습니다.
// '93분은 몇 시간 몇 분?'을 60칸 한 줄(1시간)과 남은 칸으로 보게 합니다.
//   묶음: 꽉 찬 줄을 주황으로 칠하고 '1시간'이라고 적습니다.
//   세기: 남은 칸에 10, 20, 30 … 을 적어 10분씩 세어 보게 합니다.
// ════════════════════════════════════════════════════════════════════

export function 분칸그림({ total, label, 묶음 = false, 세기 = false }: { total: number; label: string; 묶음?: boolean; 세기?: boolean }) {
  const 줄수 = Math.max(1, Math.ceil(total / 60));
  const 칸 = 5.2;
  const 높이 = 22;
  const left = 22;
  const top = 26;
  const 줄간 = 묶음 || 세기 ? 46 : 34;
  const W = left + 60 * 칸 + 70;
  const H = top + 줄수 * 줄간 + 16;
  const 남은 = total % 60;
  const 꽉찬줄 = Math.floor(total / 60);
  const 줄들: ReactNode[] = [];
  for (let r = 0; r < 줄수; r += 1) {
    const 이줄칸 = Math.min(60, total - r * 60);
    const y = top + r * 줄간;
    const 꽉참 = 이줄칸 === 60;
    줄들.push(
      <g key={r}>
        {Array.from({ length: 이줄칸 }, (_, c) => (
          <rect key={c} x={left + c * 칸} y={y} width={칸} height={높이} fill={묶음 && 꽉참 ? '#ffcc80' : 묶음 ? '#b3e5fc' : '#dffafa'} stroke="#0f7175" strokeWidth={c % 10 === 9 ? 1.6 : 0.4} />
        ))}
        <rect x={left} y={y} width={이줄칸 * 칸} height={높이} fill="none" stroke="#0f7175" strokeWidth="2" />
        {묶음 && 꽉참 && <text x={left + 60 * 칸 + 8} y={y + 16} fill="#e65100" fontSize="14" fontWeight="900">1시간</text>}
        {세기 && !꽉참 &&
          Array.from({ length: Math.floor(이줄칸 / 10) }, (_, k) => (
            <text key={k} x={left + (k + 1) * 10 * 칸} y={y + 38} textAnchor="middle" fill="#0277bd" fontSize="11" fontWeight="900">{(k + 1) * 10}</text>
          ))}
      </g>,
    );
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      <text x={left} y="18" fill="#56708a" fontSize="12" fontWeight="800">한 칸은 1분, 한 줄 60칸은 60분이에요.</text>
      {줄들}
    </svg>
  );
}
