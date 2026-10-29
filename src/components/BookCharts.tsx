// ════════════════════════════════════════════════════════════════════
// 교사용 학습 기록장의 그래프
// ────────────────────────────────────────────────────────────────────
// 그래프 도구를 따로 들이지 않고 SVG·HTML로 그립니다. 모든 막대·점에는 마우스를 올리면
// 값이 뜨는 풍선말(title)을 달고, 값은 글로도 함께 적어 색만으로 읽지 않게 합니다.
// 두 가지 값(문제 수와 정답률)은 한 그래프에 축을 둘 두지 않고 그래프를 나눕니다.
// ════════════════════════════════════════════════════════════════════

import type { 묶음줄 } from '../data/teacherInsights';

/** 가로 막대: 단원·차시·갈래별 정답률처럼 이름이 긴 항목을 견줍니다. 기준선(예: 60%)을 함께 긋습니다. */
export function HBarChart({ rows, 값, 끝 = 100, 단위 = '%', 기준, 부가 }: {
  rows: 묶음줄[];
  값: (row: 묶음줄) => number;
  끝?: number;
  단위?: string;
  기준?: number;
  부가?: (row: 묶음줄) => string;
}) {
  if (rows.length === 0) return <p className="tb-empty">기록이 없습니다.</p>;
  return (
    <div className="tb-hbars" role="list">
      {rows.map((row) => {
        const v = 값(row);
        const 낮음 = 기준 !== undefined && v < 기준;
        return (
          <div className="tb-hbar" role="listitem" key={row.key} title={`${row.label}\n${v}${단위} · ${row.문제}문제 · ${row.학생수}명`}>
            <span className="tb-hbar-label">{row.label}</span>
            <span className="tb-hbar-track">
              <span className={`tb-hbar-fill ${낮음 ? 'low' : ''}`} style={{ width: `${Math.max(1, (v / 끝) * 100)}%` }} />
              {기준 !== undefined && <span className="tb-hbar-ref" style={{ left: `${(기준 / 끝) * 100}%` }} aria-hidden="true" />}
            </span>
            <span className="tb-hbar-value">
              {낮음 && <b aria-label="기준 아래">▼ </b>}
              {v}{단위}
              {부가 && <small> {부가(row)}</small>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const 날짜짧게 = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

/** 날짜마다 푼 문제 수(세로 막대)입니다. */
export function DayColumns({ rows }: { rows: 묶음줄[] }) {
  if (rows.length === 0) return <p className="tb-empty">기록이 없습니다.</p>;
  const 높이 = 150;
  const 폭 = Math.max(320, rows.length * 26);
  const 최대 = Math.max(...rows.map((row) => row.문제));
  const 눈금 = 눈금들(최대);
  const 칸 = 폭 / rows.length;
  const 막대 = Math.min(22, 칸 - 4);
  const 이름간격 = Math.ceil(rows.length / 12);
  return (
    <div className="tb-chart-scroll">
      <svg className="tb-svg" viewBox={`0 0 ${폭 + 52} ${높이 + 34}`} width={폭 + 52} height={높이 + 34} role="img" aria-label="날짜별 푼 문제 수">
        {눈금.map((t) => {
          const y = 8 + 높이 - (t / 눈금.at(-1)!) * 높이;
          return (
            <g key={t}>
              <line x1={32} x2={폭 + 32} y1={y} y2={y} className="tb-grid" />
              <text x={28} y={y + 4} className="tb-axis" textAnchor="end">{t}</text>
            </g>
          );
        })}
        {rows.map((row, i) => {
          const h = (row.문제 / 눈금.at(-1)!) * 높이;
          const x = 32 + i * 칸 + (칸 - 막대) / 2;
          return (
            <g key={row.key}>
              <title>{`${row.key}: ${row.문제}문제, 정답률 ${row.정답률}%, ${row.학생수}명`}</title>
              <rect x={x - 2} y={8} width={막대 + 4} height={높이} fill="transparent" />
              <path className="tb-col" d={위둥근막대(x, 8 + 높이 - h, 막대, h)} />
              {i % 이름간격 === 0 && <text x={x + 막대 / 2} y={높이 + 26} className="tb-axis" textAnchor="middle">{날짜짧게(row.key)}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** 날짜마다 정답률(꺾은선)입니다. 0~100%로 고정합니다. */
export function DayLine({ rows, 기준 = 60 }: { rows: 묶음줄[]; 기준?: number }) {
  if (rows.length === 0) return <p className="tb-empty">기록이 없습니다.</p>;
  const 높이 = 150;
  const 폭 = Math.max(320, rows.length * 26);
  const 칸 = 폭 / rows.length;
  const 점 = rows.map((row, i) => ({ x: 32 + i * 칸 + 칸 / 2, y: 8 + 높이 - (row.정답률 / 100) * 높이, row }));
  const 이름간격 = Math.ceil(rows.length / 12);
  const 기준y = 8 + 높이 - (기준 / 100) * 높이;
  return (
    <div className="tb-chart-scroll">
      <svg className="tb-svg" viewBox={`0 0 ${폭 + 52} ${높이 + 34}`} width={폭 + 52} height={높이 + 34} role="img" aria-label="날짜별 정답률">
        {[0, 25, 50, 75, 100].map((t) => {
          const y = 8 + 높이 - (t / 100) * 높이;
          return (
            <g key={t}>
              <line x1={32} x2={폭 + 32} y1={y} y2={y} className="tb-grid" />
              <text x={28} y={y + 4} className="tb-axis" textAnchor="end">{t}</text>
            </g>
          );
        })}
        <line x1={32} x2={폭 + 32} y1={기준y} y2={기준y} className="tb-ref" />
        <text x={폭 + 30} y={기준y - 4} className="tb-axis" textAnchor="end">{기준}% 기준</text>
        <polyline className="tb-line" points={점.map((p) => `${p.x},${p.y}`).join(' ')} />
        {점.map((p, i) => (
          <g key={p.row.key}>
            <title>{`${p.row.key}: 정답률 ${p.row.정답률}% (${p.row.정답}/${p.row.문제})`}</title>
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={4.5} className="tb-dot" />
            {i % 이름간격 === 0 && <text x={p.x} y={높이 + 26} className="tb-axis" textAnchor="middle">{날짜짧게(p.row.key)}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** 0부터 시작하는 보기 좋은 눈금(1·2·5 단위)입니다. */
export const 눈금들 = (최대: number) => {
  const 목표 = Math.max(1, 최대);
  const 날것 = 목표 / 4;
  const 자리 = 10 ** Math.floor(Math.log10(날것));
  const 걸음 = [1, 2, 5, 10].map((m) => m * 자리).find((s) => s >= 날것) ?? 10 * 자리;
  const 끝 = Math.ceil(목표 / 걸음) * 걸음;
  return Array.from({ length: Math.round(끝 / 걸음) + 1 }, (_, i) => Math.round(i * 걸음 * 1000) / 1000);
};

/** 위 두 모서리만 4px 둥근 막대입니다(아래는 바닥선에 붙습니다). */
const 위둥근막대 = (x: number, y: number, w: number, h: number) => {
  if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
};

/** 정답률을 다섯 칸으로 나눈 색 단계입니다(열지도). 빨강(낮음)–회색(중간)–파랑(높음). */
export const 정답률단계 = (rate: number) => (rate < 40 ? 0 : rate < 60 ? 1 : rate < 75 ? 2 : rate < 90 ? 3 : 4);
export const 단계이름 = ['40% 미만', '40~59%', '60~74%', '75~89%', '90% 이상'];
