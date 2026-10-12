import type { CSSProperties, ReactNode } from 'react';
import type { StackIsoVisual } from '../types';
import { 블록들, 비추기, type 블록, type 높이판 } from '../data/stackIso';

// ════════════════════════════════════════════════════════════════════
// 쌓기나무 등각 그림(6-2 3단원)
// ────────────────────────────────────────────────────────────────────
// src/data/stackIso.ts의 '비추기'와 똑같은 자리에 그립니다. 그래야
// 문항이 셈한 '보이는 쌓기나무'와 아이가 보는 그림이 어긋나지 않습니다.
// 먼 것부터(x+y+z가 작은 것부터) 그리면 가까운 것이 먼 것을 덮습니다.
// ════════════════════════════════════════════════════════════════════

const 면색 = { 위: '#effcff', 앞: '#c5eef3', 옆: '#9edce8' };
const 테 = '#4f8f9a';

export type 쌓기그림틀 = { 크기: number; 왼쪽: number; 위: number; 넓이: number; 높이: number };

/** 높이판을 그릴 판의 크기와 자리입니다. 바닥 칸 전체가 들어가게 잡습니다. */
export const 쌓기그림틀잡기 = (h: 높이판, 크기: number, 여백 = 50, 최고층 = 0): 쌓기그림틀 => {
  const rows = h.length;
  const cols = Math.max(...h.map((r) => r.length));
  const 층 = Math.max(최고층, ...h.flat());
  const 점들 = [비추기(0, 0, 층), 비추기(cols, 0, 층), 비추기(0, rows, 0), 비추기(cols, rows, 0), 비추기(0, 0, 0), 비추기(cols, rows, 층)];
  const xs = 점들.map((p) => p[0] * 크기);
  const ys = 점들.map((p) => p[1] * 크기);
  const 넓이 = Math.max(...xs) - Math.min(...xs) + 여백 * 2;
  const 높이 = Math.max(...ys) - Math.min(...ys) + 여백 * 2;
  return { 크기, 왼쪽: 여백 - Math.min(...xs), 위: 여백 - Math.min(...ys), 넓이, 높이 };
};

export const 자리 = (틀: 쌓기그림틀, x: number, y: number, z: number): [number, number] => {
  const [u, v] = 비추기(x, y, z);
  return [틀.왼쪽 + u * 틀.크기, 틀.위 + v * 틀.크기];
};

const 이어 = (pts: Array<[number, number]>) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** 쌓기나무 하나입니다. 보이는 세 면(위, 앞, 오른쪽 옆)을 그립니다. */
export function 쌓기나무하나({ 틀, b, 색, style, 흐림 }: { 틀: 쌓기그림틀; b: 블록; 색?: string; style?: CSSProperties; 흐림?: boolean }) {
  const p = (dx: number, dy: number, dz: number) => 자리(틀, b.x + dx, b.y + dy, b.z + dz);
  const 위 = [p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)];
  const 앞 = [p(0, 1, 0), p(1, 1, 0), p(1, 1, 1), p(0, 1, 1)];
  const 옆 = [p(1, 0, 0), p(1, 1, 0), p(1, 1, 1), p(1, 0, 1)];
  return (
    <g style={style} opacity={흐림 ? 0.35 : 1}>
      <polygon points={이어(앞)} fill={색 ?? 면색.앞} stroke={테} strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points={이어(옆)} fill={색 ?? 면색.옆} stroke={테} strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points={이어(위)} fill={색 ?? 면색.위} stroke={테} strokeWidth="1.8" strokeLinejoin="round" />
    </g>
  );
}

/** '앞', '옆' 표시입니다. 화살표가 쌓은 모양을 바라봅니다. */
export function 앞옆표시({ 틀, h }: { 틀: 쌓기그림틀; h: 높이판 }) {
  const rows = h.length;
  const cols = Math.max(...h.map((r) => r.length));
  const [ax, ay] = 자리(틀, cols / 2, rows, 0);
  const [sx, sy] = 자리(틀, cols, rows / 2, 0);
  const 앞글 = [ax - 0.866 * 34, ay + 0.5 * 34];
  const 옆글 = [sx + 0.866 * 34, sy + 0.5 * 34];
  return (
    <g fill="#0f7175" fontSize="15" fontWeight="900">
      <line x1={앞글[0] + 8} y1={앞글[1] - 6} x2={ax - 6} y2={ay + 3} stroke="#0f7175" strokeWidth="2" markerEnd="url(#stack-iso-arrow)" />
      <text x={앞글[0] - 2} y={앞글[1] + 10} textAnchor="end">앞</text>
      <line x1={옆글[0] - 8} y1={옆글[1] - 6} x2={sx + 6} y2={sy + 3} stroke="#0f7175" strokeWidth="2" markerEnd="url(#stack-iso-arrow)" />
      <text x={옆글[0] + 2} y={옆글[1] + 10} textAnchor="start">옆</text>
    </g>
  );
}

export const 화살촉 = (
  <defs>
    <marker id="stack-iso-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#0f7175" />
    </marker>
  </defs>
);

export const 먼것부터 = (cubes: 블록[]) => cubes.slice().sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));

export function StackIsoPicture({ h, 크기 = 40, label, children }: { h: 높이판; 크기?: number; label: string; children?: ReactNode }) {
  const 틀 = 쌓기그림틀잡기(h, 크기);
  return (
    <svg viewBox={`0 0 ${틀.넓이} ${틀.높이}`} role="img" aria-label={label}>
      {화살촉}
      <rect x="2" y="2" width={틀.넓이 - 4} height={틀.높이 - 4} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {먼것부터(블록들(h)).map((b) => <쌓기나무하나 key={`${b.x}-${b.y}-${b.z}`} 틀={틀} b={b} />)}
      <앞옆표시 틀={틀} h={h} />
      {children}
    </svg>
  );
}

/** 위에서 본 모양에 수를 쓴 그림입니다(아래쪽이 앞). */
function 수쓴위모양({ h, x, y, 칸 }: { h: 높이판; x: number; y: number; 칸: number }) {
  return (
    <g>
      {h.map((row, r) => row.map((n, c) => n > 0 && (
        <g key={`${r}-${c}`}>
          <rect x={x + c * 칸} y={y + r * 칸} width={칸} height={칸} fill="#dffafa" stroke="#0f7175" strokeWidth="2" />
          <text x={x + c * 칸 + 칸 / 2} y={y + r * 칸 + 칸 / 2 + 7} textAnchor="middle" fill="#24364a" fontSize="19" fontWeight="900">{n}</text>
        </g>
      )))}
      <text x={x + (h[0].length * 칸) / 2} y={y + h.length * 칸 + 20} textAnchor="middle" fill="#0f7175" fontSize="13" fontWeight="900">앞</text>
    </g>
  );
}

/** 앞·옆·위에서 본 모양을 정사각형으로 그립니다. */
function 본모양그림({ cells, x, y, 칸 }: { cells: boolean[][]; x: number; y: number; 칸: number }) {
  return (
    <g>
      {cells.map((row, r) => row.map((on, c) => on && (
        <rect key={`${r}-${c}`} x={x + c * 칸} y={y + r * 칸} width={칸} height={칸} fill="#dffafa" stroke="#0f7175" strokeWidth="2" />
      )))}
    </g>
  );
}

function 본모양고르기({ visual }: { visual: StackIsoVisual }) {
  const views = visual.views ?? [];
  const 칸 = 22;
  const 보기넓이 = Math.max(...views.map((v) => Math.max(...v.cells.map((r) => r.length)))) * 칸 + 30;
  const 보기높이 = Math.max(...views.map((v) => v.cells.length)) * 칸 + 34;
  const 왼쪽틀 = visual.planOnly ? null : 쌓기그림틀잡기(visual.heights, 30, 46);
  const 위칸 = 36;
  const 왼넓이 = 왼쪽틀 ? 왼쪽틀.넓이 : visual.heights[0].length * 위칸 + 50;
  const 왼높이 = 왼쪽틀 ? 왼쪽틀.높이 : visual.heights.length * 위칸 + 60;
  const 넓이 = 왼넓이 + 2 * 보기넓이 + 16;
  const 높이 = Math.max(왼높이, 2 * 보기높이 + 8) + 4;
  return (
    <svg viewBox={`0 0 ${넓이} ${높이}`} role="img" aria-label={visual.label}>
      {화살촉}
      <rect x="2" y="2" width={넓이 - 4} height={높이 - 4} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {왼쪽틀 ? (
        <g transform={`translate(0 ${(높이 - 왼쪽틀.높이) / 2})`}>
          {먼것부터(블록들(visual.heights)).map((b) => <쌓기나무하나 key={`${b.x}-${b.y}-${b.z}`} 틀={왼쪽틀} b={b} />)}
          <앞옆표시 틀={왼쪽틀} h={visual.heights} />
        </g>
      ) : (
        <g>
          <text x={왼넓이 / 2} y={(높이 - 왼높이) / 2 + 18} textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="900">위에서 본 모양</text>
          <수쓴위모양 h={visual.heights} x={25} y={(높이 - 왼높이) / 2 + 28} 칸={위칸} />
          <text x={25 + visual.heights[0].length * 위칸 + 14} y={(높이 - 왼높이) / 2 + 28 + (visual.heights.length * 위칸) / 2 + 5} fill="#0f7175" fontSize="13" fontWeight="900">옆</text>
        </g>
      )}
      <line x1={왼넓이 + 2} y1="14" x2={왼넓이 + 2} y2={높이 - 14} stroke="#cfe3ea" strokeWidth="2" strokeDasharray="4 4" />
      {views.map((v, k) => {
        const x = 왼넓이 + 8 + (k % 2) * 보기넓이;
        const y = 6 + Math.floor(k / 2) * (보기높이 + 4);
        const 줄 = v.cells.length;
        const 열 = Math.max(...v.cells.map((r) => r.length));
        return (
          <g key={v.name}>
            <rect x={x + 2} y={y} width={보기넓이 - 6} height={보기높이} rx="8" fill="#ffffff" stroke="#cfeaf0" />
            <본모양그림 cells={v.cells} x={x + (보기넓이 - 열 * 칸) / 2} y={y + 6 + (보기높이 - 34 - 줄 * 칸) + 4} 칸={칸} />
            <text x={x + 보기넓이 / 2} y={y + 보기높이 - 8} textAnchor="middle" fill="#24364a" fontSize="15" fontWeight="900">{v.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function StackIsoGraphic({ visual }: { visual: StackIsoVisual }) {
  if (visual.views?.length) return <본모양고르기 visual={visual} />;
  if (!visual.items?.length && !visual.plan) return <StackIsoPicture h={visual.heights} label={visual.label} />;
  const 모양들 = visual.items?.length ? visual.items : [{ name: '', heights: visual.heights }];
  const 최고층 = Math.max(...모양들.flatMap((m) => m.heights.flat()));
  const 크기 = 모양들.length >= 3 ? 24 : 28;
  // 모양 칸의 크기를 모두 같게 잡아야 가·나·다·라를 견주기 쉽습니다.
  const 줄수 = Math.max(...모양들.map((m) => m.heights.length));
  const 열수 = Math.max(...모양들.map((m) => m.heights[0].length));
  const 본보기 = Array.from({ length: 줄수 }, () => Array.from({ length: 열수 }, () => 최고층));
  const 틀 = 쌓기그림틀잡기(본보기, 크기, 44, 최고층);
  const 가로칸 = 모양들.length === 4 ? 2 : 모양들.length;
  const 세로칸 = Math.ceil(모양들.length / 가로칸);
  const 칸높이 = 틀.높이 + 16;
  const 칸 = 34;
  const 위넓이 = visual.plan ? visual.plan[0].length * 칸 + 40 : 0;
  const 높이 = Math.max(세로칸 * 칸높이, visual.plan ? visual.plan.length * 칸 + 70 : 0) + 12;
  const 넓이 = 위넓이 + 가로칸 * 틀.넓이 + 8;
  const 위모양위 = visual.plan ? (높이 - (visual.plan.length * 칸 + 40)) / 2 : 0;
  return (
    <svg viewBox={`0 0 ${넓이} ${높이}`} role="img" aria-label={visual.label}>
      {화살촉}
      <rect x="2" y="2" width={넓이 - 4} height={높이 - 4} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {visual.plan && (
        <g>
          <text x={위넓이 / 2 + 2} y={위모양위 + 4} textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="900">위에서 본 모양</text>
          <수쓴위모양 h={visual.plan} x={20} y={위모양위 + 14} 칸={칸} />
          <line x1={위넓이 + 2} y1="14" x2={위넓이 + 2} y2={높이 - 14} stroke="#cfe3ea" strokeWidth="2" strokeDasharray="4 4" />
        </g>
      )}
      {모양들.map((m, k) => {
        const x = 위넓이 + 4 + (k % 가로칸) * 틀.넓이;
        const y = 6 + Math.floor(k / 가로칸) * 칸높이;
        // 바닥 칸이 작은 모양도 같은 자리에 놓이도록, 큰 틀에 맞추어 그립니다.
        return (
          <g key={k} transform={`translate(${x} ${y})`}>
            {먼것부터(블록들(m.heights)).map((b) => <쌓기나무하나 key={`${b.x}-${b.y}-${b.z}`} 틀={틀} b={b} />)}
            <앞옆표시 틀={틀} h={m.heights} />
            {m.name && <text x={틀.넓이 / 2} y={칸높이 - 6} textAnchor="middle" fill="#24364a" fontSize="17" fontWeight="900">{m.name}</text>}
          </g>
        );
      })}
    </svg>
  );
}
