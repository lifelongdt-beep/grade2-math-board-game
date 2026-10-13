import { useState, type ReactNode } from 'react';
import type {
  AngleVisual,
  BarGraphVisual,
  CircleRegionVisual,
  GridMoveVisual,
  LineGraphVisual,
  ProtractorVisual,
  QuestionVisual,
  RangeLineVisual,
  RatioGraphVisual,
  SolidNetVisual,
  StackIsoVisual,
  StackPlanVisual,
} from '../types';
import { playTapSound } from '../sound';
import { 가장적은모양, 블록들 } from '../data/stackIso';
import { resolveParticles } from '../data/grade5/util';
import { GridMoveGraphic } from './Grade4Visuals';
import { SymmetryDrawLab } from './SymmetryDraw';
import { 단추, 읽기 } from './Grade2Labs';
import { 먼것부터, 쌓기그림틀잡기, 쌓기나무하나, 앞옆표시, 화살촉 } from './StackIso';

// ════════════════════════════════════════════════════════════════════
// 4·5·6학년 자세히 보기 — 손으로 해 보는 실험실
// ────────────────────────────────────────────────────────────────────
//   · 평면도형의 이동: 한 칸씩 밀기, 뒤집기, 90°씩 돌리기, 점 옮기기
//   · 각도기: 0에 맞춘 눈금을 골라 10°, 5°, 1°씩 따라가기
//   · 각: 한 꼭짓점에 모아 겹쳐 보기, 직각 대어 보기, 30°씩 재어 보기
//   · 막대·꺾은선그래프: 눌러서 눈금 칸 세기, 두 개의 차, 큰 순서로 줄 세우기
//   · 수의 범위: 수를 옮기며 들어가는지 보기
//   · 띠·원그래프: 항목 짚기, 10% 눈금 대기
//   · 쌓기나무: 한 층씩 쌓기, 층만 골라 보기
//   · 고리·반원: 작은 원 오려 내기, 원을 반으로 접기
//   · 원기둥 전개도: 밑면을 옆면 위로 한 바퀴 굴리기
// 답은 말해 주지 않습니다. 해 본 결과를 아이가 읽습니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#24364a';
const 주황 = '#ef6c00';
const 청 = '#18a7a7';

// ── 평면도형의 이동 ──────────────────────────────────────────────────
type 이동 = 'slide' | 'flip' | 'rotate' | 'point';
const 이동종류 = (visual: GridMoveVisual, prompt: string): 이동 | null => {
  if (visual.panels[0]?.point) return 'point';
  if (visual.plain || !visual.panels[0]?.cells?.length) return null;
  if (/밀었/.test(prompt)) return 'slide';
  if (/뒤집/.test(prompt)) return 'flip';
  if (/돌렸|돌린/.test(prompt)) return 'rotate';
  return null;
};

function GridMoveLab({ visual, prompt }: { visual: GridMoveVisual; prompt: string }) {
  const 종류 = 이동종류(visual, prompt)!;
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [각, set각] = useState(0);
  const [기록, set기록] = useState<string[]>([]);
  const 처음 = visual.panels[0];
  const n = 종류 === 'point' ? visual.size : 9;
  const 칸 = Math.min(34, 300 / n);
  const W = n * 칸 + 24;
  const H = n * 칸 + 24;
  const ox = 12;
  const oy = 12;
  // 처음 도형을 판 한가운데로 옮겨 놓습니다(밀어도 판 밖으로 나가지 않게).
  const cells = 처음.cells ?? [];
  const xs = cells.map((c) => c[0]);
  const ys = cells.map((c) => c[1]);
  const 너비 = cells.length ? Math.max(...xs) - Math.min(...xs) + 1 : 0;
  const 높이 = cells.length ? Math.max(...ys) - Math.min(...ys) + 1 : 0;
  const 놓기x = Math.floor((n - 너비) / 2) - (cells.length ? Math.min(...xs) : 0);
  const 놓기y = Math.floor((n - 높이) / 2) - (cells.length ? Math.min(...ys) : 0);
  const 가운데x = ox + (Math.floor((n - 너비) / 2) + 너비 / 2) * 칸;
  const 가운데y = oy + (Math.floor((n - 높이) / 2) + 높이 / 2) * 칸;
  const 남김 = (말: string) => set기록((v) => [...v, 말]);
  const 밀기 = (x: number, y: number, 말: string) => {
    if (종류 === 'point') {
      const p = 처음.point!;
      if (p[0] + dx + x < 0 || p[0] + dx + x > n || p[1] + dy + y < 0 || p[1] + dy + y > n) return;
    } else {
      const 안 = cells.every(([cx, cy]) => {
        const nx = cx + 놓기x + dx + x;
        const ny = cy + 놓기y + dy + y;
        return nx >= 0 && nx < n && ny >= 0 && ny < n;
      });
      if (!안) return;
    }
    setDx((v) => v + x);
    setDy((v) => v + y);
    남김(말);
  };
  // 같은 방향으로 이어진 이동은 '오른쪽으로 3칸'처럼 묶어 말합니다.
  const 묶은기록 = 기록.reduce<Array<{ 말: string; 번: number }>>((acc, m) => {
    const 끝 = acc[acc.length - 1];
    if (끝 && 끝.말 === m) 끝.번 += 1;
    else acc.push({ 말: m, 번: 1 });
    return acc;
  }, []);
  const 읽을말: ReactNode = (() => {
    if (!기록.length) {
      return 종류 === 'slide' ? <>화살표를 눌러 한 칸씩 밀어 보세요. 모양이 바뀌는지 보세요.</>
        : 종류 === 'flip' ? <>뒤집는 방향을 골라 눌러 보세요. 주황색 칸이 어디로 가는지 보세요.</>
          : 종류 === 'rotate' ? <>돌리는 방향을 골라 눌러 보세요. 한 번 누를 때마다 90°씩 돌아요.</>
            : <>화살표를 눌러 점을 한 칸씩 옮겨 ○ 자리까지 가 보세요.</>;
    }
    if (종류 === 'slide' || 종류 === 'point') return <>{묶은기록.map((g) => `${g.말}으로 ${g.번}칸`).join(', ')} 옮겼어요.{종류 === 'slide' ? ' 모양과 방향은 그대로이고 자리만 바뀌어요.' : ''}</>;
    if (종류 === 'flip') return <>{기록.join(', ')}(으)로 뒤집었어요. {기록.length % 2 === 0 ? '같은 방향으로 두 번 뒤집으면 처음과 같아져요.' : '왼쪽과 오른쪽(또는 위와 아래)이 서로 바뀌었어요.'}</>;
    return <>모두 {각 >= 0 ? '시계 방향' : '시계 반대 방향'}으로 {Math.abs(각)}°만큼 돌렸어요.{Math.abs(각) % 360 === 0 ? ' 한 바퀴 돌면 처음과 같아요.' : ''}</>;
  })();
  const 보기들 = visual.panels.slice(1);
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {Array.from({ length: n + 1 }, (_, t) => (
            <g key={t}>
              <line x1={ox + t * 칸} y1={oy} x2={ox + t * 칸} y2={oy + n * 칸} stroke="#cfe3ea" />
              <line x1={ox} y1={oy + t * 칸} x2={ox + n * 칸} y2={oy + t * 칸} stroke="#cfe3ea" />
            </g>
          ))}
          {종류 !== 'point' && (
            <>
              {/* 처음 자리를 흐리게 남겨 둡니다. */}
              {cells.map(([x, y], c) => (
                <rect key={`g${c}`} x={ox + (x + 놓기x) * 칸} y={oy + (y + 놓기y) * 칸} width={칸} height={칸} fill="none" stroke="#b0bec5" strokeDasharray="4 3" />
              ))}
              <g style={{
                transform: `translate(${dx * 칸}px, ${dy * 칸}px) rotate(${각}deg) scale(${sx}, ${sy})`,
                transformOrigin: `${가운데x}px ${가운데y}px`,
                transformBox: 'view-box',
                transition: 'transform 0.7s ease',
              }}>
                {cells.map(([x, y], c) => (
                  <rect key={c} x={ox + (x + 놓기x) * 칸} y={oy + (y + 놓기y) * 칸} width={칸} height={칸} fill={c === 0 ? '#ff8a65' : '#4dd0e1'} stroke="#00838f" strokeWidth="1.5" />
                ))}
              </g>
            </>
          )}
          {종류 === 'point' && 처음.point && (
            <>
              {처음.target && <circle cx={ox + 처음.target[0] * 칸} cy={oy + 처음.target[1] * 칸} r="7" fill="none" stroke="#1565c0" strokeWidth="2.5" />}
              <g style={{ transform: `translate(${dx * 칸}px, ${dy * 칸}px)`, transition: 'transform 0.4s ease' }}>
                <circle cx={ox + 처음.point[0] * 칸} cy={oy + 처음.point[1] * 칸} r="6" fill={주황} />
                <text x={ox + 처음.point[0] * 칸 + 8} y={oy + 처음.point[1] * 칸 - 6} fill="#bf360c" fontSize="13" fontWeight="900">ㄱ</text>
              </g>
            </>
          )}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {(종류 === 'slide' || 종류 === 'point') && (
          <>
            <단추 onClick={() => 밀기(-1, 0, '왼쪽')}>⬅️ 왼쪽</단추>
            <단추 onClick={() => 밀기(0, -1, '위쪽')}>⬆️ 위쪽</단추>
            <단추 onClick={() => 밀기(0, 1, '아래쪽')}>⬇️ 아래쪽</단추>
            <단추 onClick={() => 밀기(1, 0, '오른쪽')}>오른쪽 ➡️</단추>
          </>
        )}
        {종류 === 'flip' && (
          <>
            <단추 onClick={() => { setSx((v) => -v); 남김('오른쪽'); }}>오른쪽으로 뒤집기</단추>
            <단추 onClick={() => { setSx((v) => -v); 남김('왼쪽'); }}>왼쪽으로 뒤집기</단추>
            <단추 onClick={() => { setSy((v) => -v); 남김('위쪽'); }}>위쪽으로 뒤집기</단추>
            <단추 onClick={() => { setSy((v) => -v); 남김('아래쪽'); }}>아래쪽으로 뒤집기</단추>
          </>
        )}
        {종류 === 'rotate' && (
          <>
            <단추 onClick={() => { set각((v) => v + 90); 남김('↻'); }}>↻ 시계 방향 90°</단추>
            <단추 onClick={() => { set각((v) => v - 90); 남김('↺'); }}>↺ 시계 반대 방향 90°</단추>
          </>
        )}
        <단추 onClick={() => { setDx(0); setDy(0); setSx(1); setSy(1); set각(0); set기록([]); }} disabled={!기록.length}>처음으로</단추>
      </div>
      <읽기>{읽을말}</읽기>
      {보기들.length > 0 && 종류 !== 'point' && (
        <div className="g3-lab-stage" style={{ marginTop: 6 }}>
          <GridMoveGraphic visual={{ ...visual, panels: 보기들 }} />
        </div>
      )}
    </div>
  );
}

// ── 각도기 ───────────────────────────────────────────────────────────
function ProtractorLab({ visual }: { visual: ProtractorVisual }) {
  const [눈금, set눈금] = useState<'inner' | 'outer' | null>(null);
  const [잰, set잰] = useState(0);
  const cx = 230;
  const cy = 232;
  const R = 200;
  const 점 = (deg: number, r: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)] as const;
  const 밑변 = visual.base === 'inner' ? 0 : 180;
  const 다른변 = visual.base === 'inner' ? visual.deg : 180 - visual.deg;
  // 고른 눈금의 0에서 시작해 잰 만큼 돌아간 화면 각도입니다.
  const 시작 = 눈금 === 'outer' ? 180 : 0;
  const 끝각 = 눈금 === 'outer' ? 180 - 잰 : 잰;
  const 맞는0 = 눈금 !== null && 눈금 === visual.base;
  const 호 = (from: number, to: number, r: number) => {
    const [x0, y0] = 점(from, r);
    const [x1, y1] = 점(to, r);
    const 큰 = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${큰} ${to > from ? 0 : 1} ${x1} ${y1} Z`;
  };
  const 더 = (d: number) => {
    if (!눈금) return;
    playTapSound();
    set잰((v) => Math.min(180, v + d));
  };
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox="0 0 460 262" role="img" aria-label={visual.label}>
          <rect x="2" y="2" width="456" height="258" rx="12" {...판} />
          <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill="#fffde7" stroke="#8d6e63" strokeWidth="1.6" />
          {눈금 && 잰 > 0 && <path d={호(시작, 끝각, R - 60)} fill={맞는0 ? '#ffcc80' : '#ef9a9a'} fillOpacity="0.7" style={{ transition: 'all 0.3s' }} />}
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
                <text x={ox} y={oy + 5} textAnchor="middle" fill={눈금 === 'outer' ? 주황 : '#4e342e'} fontSize="14" fontWeight="800">{180 - t}</text>
                <text x={ix} y={iy + 5} textAnchor="middle" fill={눈금 === 'inner' ? 주황 : '#1565c0'} fontSize="13" fontWeight="800">{t}</text>
              </g>
            );
          })}
          <line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} stroke="#6d4c41" strokeWidth="1.4" />
          {[밑변, 다른변].map((d, k) => {
            const [x, y] = 점(d, R + 18);
            return <line key={k} x1={cx} y1={cy} x2={x} y2={y} stroke="#d84315" strokeWidth="4" strokeLinecap="round" />;
          })}
          {눈금 && 잰 > 0 && (() => {
            const [x, y] = 점(끝각, R + 4);
            return <line x1={cx} y1={cy} x2={x} y2={y} stroke={주황} strokeWidth="3" strokeDasharray="6 4" style={{ transition: 'all 0.3s' }} />;
          })()}
          <circle cx={cx} cy={cy} r="4.5" fill="#d84315" />
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 on={눈금 === 'inner'} onClick={() => { set눈금('inner'); set잰(0); }}>안쪽 눈금(오른쪽 0)</단추>
        <단추 on={눈금 === 'outer'} onClick={() => { set눈금('outer'); set잰(0); }}>바깥쪽 눈금(왼쪽 0)</단추>
        <단추 onClick={() => 더(10)} disabled={!눈금 || 잰 >= 180}>+10°</단추>
        <단추 onClick={() => 더(5)} disabled={!눈금 || 잰 >= 180}>+5°</단추>
        <단추 onClick={() => 더(1)} disabled={!눈금 || 잰 >= 180}>+1°</단추>
      </div>
      <읽기>
        {!눈금
          ? <>먼저 각의 한 변이 어느 쪽 0에 맞추어져 있는지 보고, 그 0이 있는 눈금을 고르세요.</>
          : !맞는0
            ? <>이 눈금의 0에는 각의 변이 없어요. 변이 놓인 쪽의 0에서 시작하는 눈금을 골라야 해요.</>
            : 잰 === 0
              ? <>좋아요! 이제 0에서부터 10°씩 따라가며 다른 변까지 세어 보세요.</>
              : <>{눈금 === 'inner' ? '안쪽' : '바깥쪽'} 눈금으로 0에서 <strong>{잰}°</strong>까지 왔어요. 점선이 다른 변에 닿았는지 보세요.</>}
      </읽기>
    </div>
  );
}

// ── 각 ───────────────────────────────────────────────────────────────
const 각색 = ['#ef6c00', '#1e88e5', '#43a047', '#8e24aa'];

function AngleLab({ visual }: { visual: AngleVisual }) {
  const items = visual.items.slice(0, 4);
  const 여럿 = items.length > 1;
  const [모음, set모음] = useState(false);
  const [직각, set직각] = useState(false);
  const [부채, set부채] = useState(0);
  const W = 360;
  const H = 210;
  const vx = 150;
  const vy = 170;
  const 길이 = 130;
  const 끝 = (deg: number, r = 길이) => [vx + r * Math.cos((-deg * Math.PI) / 180), vy + r * Math.sin((-deg * Math.PI) / 180)] as const;
  const 원래자리 = (k: number) => 30 + k * ((W - 60) / items.length);
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {items.map((it, k) => {
            const 작게 = 여럿 && !모음;
            const 배율 = 작게 ? 0.4 : 1;
            const tx = 작게 ? 원래자리(k) + (it.deg > 90 ? 50 : 8) - vx * 배율 : 0;
            const ty = 작게 ? 40 - (vy - 140) * 배율 : 0;
            const [x2, y2] = 끝(it.deg);
            const [ax, ay] = 끝(0, 28 + k * 10);
            const [bx, by] = 끝(it.deg, 28 + k * 10);
            return (
              <g key={k} style={{ transform: `translate(${tx}px, ${ty}px) scale(${배율})`, transformOrigin: '0px 0px', transition: 'transform 0.8s ease' }}>
                <line x1={vx} y1={vy} x2={vx + 길이} y2={vy} stroke={각색[k]} strokeWidth={작게 ? 5 : 3} strokeLinecap="round" />
                <line x1={vx} y1={vy} x2={x2} y2={y2} stroke={각색[k]} strokeWidth={작게 ? 5 : 3} strokeLinecap="round" />
                <path d={`M ${ax} ${ay} A ${28 + k * 10} ${28 + k * 10} 0 ${it.deg > 180 ? 1 : 0} 0 ${bx} ${by}`} fill="none" stroke={각색[k]} strokeWidth={작게 ? 4 : 2.5} />
                {it.name && <text x={x2 + (it.deg > 90 ? -14 : 6)} y={y2 - 6} fill={각색[k]} fontSize={작게 ? 30 : 16} fontWeight="900">{it.name}</text>}
              </g>
            );
          })}
          {직각 && (
            <g style={{ animation: 'g1-fade 0.4s ease' }}>
              <path d={`M ${vx + 90} ${vy} L ${vx} ${vy} L ${vx} ${vy - 90}`} fill="none" stroke="#6d4c41" strokeWidth="3" strokeDasharray="8 5" />
              <path d={`M ${vx + 14} ${vy} v -14 h -14`} fill="none" stroke="#6d4c41" strokeWidth="2" />
            </g>
          )}
          {Array.from({ length: 부채 }, (_, k) => {
            const [x, y] = 끝((k + 1) * 30, 길이 + 10);
            return (
              <g key={`f${k}`} style={{ animation: 'g1-fade 0.3s ease' }}>
                <line x1={vx} y1={vy} x2={x} y2={y} stroke="#90a4ae" strokeWidth="1.6" strokeDasharray="4 4" />
                <text x={x} y={y - 4} textAnchor="middle" fill="#56708a" fontSize="11" fontWeight="800">{(k + 1) * 30}°</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {여럿 && <단추 on={모음} onClick={() => set모음((v) => !v)}>{모음 ? '흩어 놓기' : '📐 한 꼭짓점에 겹쳐 보기'}</단추>}
        {!여럿 && <단추 on={직각} onClick={() => set직각((v) => !v)}>{직각 ? '직각 치우기' : '📐 직각 대어 보기'}</단추>}
        {!여럿 && <단추 onClick={() => setTimeout(() => set부채((v) => Math.min(6, v + 1)), 0)} disabled={부채 >= 6}>30°씩 펴 보기</단추>}
        {!여럿 && 부채 > 0 && <단추 onClick={() => set부채(0)}>다시</단추>}
      </div>
      <읽기>
        {여럿
          ? 모음
            ? <>한 변을 맞추어 꼭짓점에 모았어요. 다른 변이 <strong>더 많이 벌어진</strong> 각이 더 큰 각이에요. 변의 길이는 각의 크기와 상관없어요.</>
            : <>각을 한 꼭짓점에 모아 겹쳐 보면 크기를 견주기 쉬워요.</>
          : 직각
            ? <>직각(90°)보다 덜 벌어지면 예각, 더 벌어지면 둔각이에요.</>
            : 부채 > 0
              ? <>30°씩 {부채}칸 폈어요. 각의 변이 어느 선 근처에 있는지 보고 어림해 보세요.</>
              : <>직각을 대어 보거나, 30°씩 펴서 각도를 어림해 보세요.</>}
      </읽기>
    </div>
  );
}

// ── 막대그래프 ───────────────────────────────────────────────────────
function BarGraphLab({ visual }: { visual: BarGraphVisual }) {
  const bars = visual.bars.slice(0, 6);
  const [고른, set고른] = useState<number[]>([]);
  const [정렬, set정렬] = useState(false);
  const ticks = Math.max(1, Math.round(visual.max / visual.step));
  const left = 50;
  const top = 30;
  const plotH = 170;
  const colW = Math.max(48, Math.min(64, 300 / bars.length));
  const W = left + colW * bars.length + 24;
  const H = top + plotH + 40;
  const 칸높이 = plotH / ticks;
  const 차례 = 정렬 ? bars.map((_, k) => k).sort((a, b) => (bars[b].hidden ? -1 : bars[b].value) - (bars[a].hidden ? -1 : bars[a].value)) : bars.map((_, k) => k);
  const 자리 = (k: number) => left + 차례.indexOf(k) * colW + colW * 0.2;
  const 누르기 = (k: number) => {
    if (bars[k].hidden) return;
    playTapSound();
    set고른((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v.slice(-1), k]));
  };
  const 칸수 = (v: number) => v / visual.step;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {Array.from({ length: ticks + 1 }, (_, t) => (
            <g key={t}>
              <line x1={left} y1={top + plotH - t * 칸높이} x2={W - 16} y2={top + plotH - t * 칸높이} stroke="#cfe3ea" />
              {t % Math.max(1, Math.round(ticks / 5)) === 0 && <text x={left - 6} y={top + plotH - t * 칸높이 + 4} textAnchor="end" fill="#56708a" fontSize="11" fontWeight="700">{t * visual.step}</text>}
            </g>
          ))}
          <line x1={left} y1={top} x2={left} y2={top + plotH} stroke="#41607a" strokeWidth="1.4" />
          {고른.map((k) => (
            <line key={`g${k}`} x1={left} x2={자리(k) + colW * 0.6} y1={top + plotH - 칸수(bars[k].value) * 칸높이} y2={top + plotH - 칸수(bars[k].value) * 칸높이} stroke={주황} strokeWidth="2" strokeDasharray="6 4" />
          ))}
          {고른.length === 2 && (() => {
            const [a, b] = 고른.map((k) => bars[k].value);
            const 위 = top + plotH - 칸수(Math.max(a, b)) * 칸높이;
            const 아래 = top + plotH - 칸수(Math.min(a, b)) * 칸높이;
            const x = W - 22;
            return a !== b ? <path d={`M ${x - 6} ${위} h 6 V ${아래} h -6`} fill="none" stroke={주황} strokeWidth="2.5" /> : null;
          })()}
          {bars.map((bar, k) => {
            const h = 칸수(bar.value) * 칸높이;
            const 켬 = 고른.includes(k);
            return (
              <g key={k} style={{ transform: `translateX(${자리(k)}px)`, transition: 'transform 0.7s ease', cursor: bar.hidden ? 'default' : 'pointer' }} onClick={() => 누르기(k)}>
                {bar.hidden
                  ? <text x={colW * 0.3} y={top + plotH - 8} textAnchor="middle" fill="#bf360c" fontSize="16" fontWeight="900">?</text>
                  : <rect x="0" y={top + plotH - h} width={colW * 0.6} height={h} fill={켬 ? '#ffcc80' : '#4dd0e1'} stroke={켬 ? 주황 : '#00838f'} strokeWidth={켬 ? 2.5 : 1} />}
                <text x={colW * 0.3} y={top + plotH + 16} textAnchor="middle" fill={글} fontSize="12" fontWeight="800">{bar.name}</text>
              </g>
            );
          })}
          <text x="10" y={top - 12} fill="#56708a" fontSize="11" fontWeight="700">{visual.valueLabel.includes("(") ? visual.valueLabel : `(${visual.valueLabel})`}</text>
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 on={정렬} onClick={() => set정렬((v) => !v)}>{정렬 ? '처음 차례로' : '📊 큰 것부터 줄 세우기'}</단추>
        <단추 onClick={() => set고른([])} disabled={!고른.length}>다시 고르기</단추>
      </div>
      <읽기>
        {고른.length === 0
          ? <>막대를 눌러 보세요. 막대 끝에서 눈금까지 줄을 그어 줘요. 막대 두 개를 누르면 차이를 볼 수 있어요.</>
          : 고른.length === 1
            ? <>{bars[고른[0]].name}의 막대는 눈금 <strong>{칸수(bars[고른[0]].value)}칸</strong>이에요. 눈금 한 칸이 얼마인지 세로 눈금에서 확인하세요.</>
            : <>두 막대의 차이는 눈금 <strong>{Math.abs(칸수(bars[고른[0]].value) - 칸수(bars[고른[1]].value))}칸</strong>이에요.</>}
      </읽기>
    </div>
  );
}

// ── 꺾은선그래프 ─────────────────────────────────────────────────────
function LineGraphLab({ visual }: { visual: LineGraphVisual }) {
  const pts = visual.points.slice(0, 7);
  const [점, set점] = useState<number | null>(null);
  const [선, set선] = useState<number | null>(null);
  const from = visual.from ?? 0;
  const ticks = Math.max(1, Math.round((visual.max - from) / visual.step));
  const left = 50;
  const top = 30;
  const plotH = 170;
  const colW = Math.max(44, Math.min(56, 330 / pts.length));
  const W = left + colW * pts.length + 20;
  const H = top + plotH + 40;
  const yOf = (v: number) => top + plotH - (plotH * (v - from)) / (visual.max - from);
  const xOf = (k: number) => left + k * colW + colW / 2;
  const 칸 = (v: number) => (v - from) / visual.step;
  const 보임 = pts.map((p, k) => ({ ...p, k })).filter((p) => !p.hidden);
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {Array.from({ length: ticks + 1 }, (_, t) => (
            <g key={t}>
              <line x1={left} y1={top + plotH - (plotH * t) / ticks} x2={W - 14} y2={top + plotH - (plotH * t) / ticks} stroke="#cfe3ea" />
              {t % Math.max(1, Math.round(ticks / 5)) === 0 && <text x={left - 6} y={top + plotH - (plotH * t) / ticks + 4} textAnchor="end" fill="#56708a" fontSize="11" fontWeight="700">{from + t * visual.step}</text>}
            </g>
          ))}
          <line x1={left} y1={top} x2={left} y2={top + plotH} stroke="#41607a" strokeWidth="1.4" />
          {보임.slice(0, -1).map((p, i) => {
            const q = 보임[i + 1];
            if (q.k !== p.k + 1) return null;
            const 켬 = 선 === p.k;
            return (
              <g key={`s${p.k}`} style={{ cursor: 'pointer' }} onClick={() => { playTapSound(); set선(p.k); set점(null); }}>
                <line x1={xOf(p.k)} y1={yOf(p.value)} x2={xOf(q.k)} y2={yOf(q.value)} stroke="transparent" strokeWidth="16" />
                <line x1={xOf(p.k)} y1={yOf(p.value)} x2={xOf(q.k)} y2={yOf(q.value)} stroke={켬 ? 주황 : '#e65100'} strokeWidth={켬 ? 4 : 2.2} />
                {켬 && (
                  <>
                    <line x1={xOf(p.k)} y1={yOf(p.value)} x2={xOf(q.k)} y2={yOf(p.value)} stroke={청} strokeWidth="2" strokeDasharray="5 4" />
                    <line x1={xOf(q.k)} y1={yOf(p.value)} x2={xOf(q.k)} y2={yOf(q.value)} stroke={청} strokeWidth="3" />
                  </>
                )}
              </g>
            );
          })}
          {점 !== null && (
            <g>
              <line x1={left} x2={xOf(점)} y1={yOf(pts[점].value)} y2={yOf(pts[점].value)} stroke={주황} strokeWidth="2" strokeDasharray="6 4" />
              <line x1={xOf(점)} x2={xOf(점)} y1={yOf(pts[점].value)} y2={top + plotH} stroke={주황} strokeWidth="2" strokeDasharray="6 4" />
            </g>
          )}
          {pts.map((p, k) => (
            <g key={k} style={{ cursor: p.hidden ? 'default' : 'pointer' }} onClick={() => { if (p.hidden) return; playTapSound(); set점(k); set선(null); }}>
              {p.hidden ? <text x={xOf(k)} y={top + plotH - 8} textAnchor="middle" fill="#bf360c" fontSize="15" fontWeight="900">?</text> : <circle cx={xOf(k)} cy={yOf(p.value)} r={점 === k ? 7 : 5} fill="#e65100" />}
              <text x={xOf(k)} y={top + plotH + 18} textAnchor="middle" fill={글} fontSize="11" fontWeight="800">{p.name}</text>
            </g>
          ))}
          <text x="10" y={top - 12} fill="#56708a" fontSize="11" fontWeight="700">{visual.valueLabel.includes("(") ? visual.valueLabel : `(${visual.valueLabel})`}</text>
        </svg>
      </div>
      <읽기>
        {점 !== null
          ? <>{pts[점].name}의 점에서 세로 눈금까지 줄을 그었어요. 눈금 {from > 0 ? `${from}에서 ` : ''}<strong>{칸(pts[점].value)}칸</strong> 위예요.{visual.step !== 1 && <> 한 칸이 {visual.step}씩이니까 <strong>{pts[점].value}</strong>{resolveParticles(`${pts[점].value}을(를)`).slice(String(pts[점].value).length)} 나타내요.</>}</>
          : 선 !== null
            ? (() => { const 다음 = 보임.find((x) => x.k > 선) ?? pts[선 + 1]; const a = pts[선].value; const b = 다음.value; const d = 칸(b) - 칸(a); return <>{resolveParticles(`${pts[선].name}과(와)`)} {다음.name} 사이: 눈금 <strong>{Math.abs(d)}칸</strong> {d > 0 ? '올라갔어요' : d < 0 ? '내려갔어요' : '그대로예요'}. 선이 많이 기울수록 변화가 커요.</>; })()
            : <>점을 누르면 값을 읽는 줄이, 두 점 사이의 선을 누르면 변화의 크기가 나타나요.</>}
      </읽기>
    </div>
  );
}

// ── 수의 범위 ───────────────────────────────────────────────────────
function RangeLineLab({ visual }: { visual: RangeLineVisual }) {
  const 정수 = Number.isInteger(visual.start) && Number.isInteger(visual.step);
  const 처음 = visual.lower?.value ?? visual.upper?.value ?? visual.start;
  const [값, set값] = useState(처음);
  const span = visual.end - visual.start;
  const W = 380;
  const X = (v: number) => 30 + ((v - visual.start) / span) * (W - 60);
  const 들어감 = (v: number) =>
    (!visual.lower || (visual.lower.included ? v >= visual.lower.value : v > visual.lower.value)) &&
    (!visual.upper || (visual.upper.included ? v <= visual.upper.value : v < visual.upper.value));
  const 옮기기 = (d: number) => {
    const v = Math.round((값 + d) * 1000) / 1000;
    if (v < visual.start || v > visual.end) return;
    playTapSound();
    set값(v);
  };
  const 단위 = 정수 ? 1 : visual.step;
  const 경계말 = (e: { value: number; included: boolean }, 아래: boolean) => `${e.value} ${아래 ? (e.included ? '이상' : '초과') : e.included ? '이하' : '미만'}`;
  const ticks = Array.from({ length: Math.round(span / visual.step) + 1 }, (_, i) => Number((visual.start + visual.step * i).toFixed(6)));
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} 150`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height="146" rx="12" {...판} />
          <line x1="30" y1="96" x2={W - 30} y2="96" stroke="#506579" strokeWidth="4" strokeLinecap="round" />
          {ticks.map((t, i) => (
            <g key={t}>
              <line x1={X(t)} y1="88" x2={X(t)} y2="104" stroke="#8aa0b8" strokeWidth="2.5" />
              {(i % Math.max(1, Math.ceil(ticks.length / 8)) === 0 || i === ticks.length - 1) && <text x={X(t)} y="124" textAnchor="middle" fill={글} fontSize="13" fontWeight="800">{t}</text>}
            </g>
          ))}
          <line x1={visual.lower ? X(visual.lower.value) : 30} y1="96" x2={visual.upper ? X(visual.upper.value) : W - 30} y2="96" stroke={청} strokeWidth="7" />
          {[visual.lower, visual.upper].map((e, i) => e && (
            <circle key={i} cx={X(e.value)} cy="96" r="8" fill={e.included ? 청 : '#ffffff'} stroke="#0f7175" strokeWidth="3" />
          ))}
          <g style={{ transform: `translateX(${X(값)}px)`, transition: 'transform 0.35s ease' }}>
            <path d="M 0 82 L -9 62 L 9 62 Z" fill={들어감(값) ? '#43a047' : '#e53935'} />
            <rect x="-22" y="34" width="44" height="26" rx="8" fill={들어감(값) ? '#e8f5e9' : '#ffebee'} stroke={들어감(값) ? '#43a047' : '#e53935'} strokeWidth="2" />
            <text x="0" y="52" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{값}</text>
          </g>
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => 옮기기(-단위 * 5)}>⏪</단추>
        <단추 onClick={() => 옮기기(-단위)}>◀ {단위}</단추>
        <단추 onClick={() => 옮기기(단위)}>{단위} ▶</단추>
        <단추 onClick={() => 옮기기(단위 * 5)}>⏩</단추>
      </div>
      <읽기>
        <strong>{값}</strong>{resolveParticles(`${값}은(는)`).slice(String(값).length)} {[visual.lower && 경계말(visual.lower, true), visual.upper && 경계말(visual.upper, false)].filter(Boolean).join('이고 ')}인 수에 {들어감(값) ? <strong>들어가요</strong> : <strong>들어가지 않아요</strong>}.
        {' '}경계의 ● 은 그 수가 들어가는 것, ○ 은 들어가지 않는 것이에요.
      </읽기>
    </div>
  );
}

// ── 띠그래프·원그래프 ───────────────────────────────────────────────
const 띠색 = ['#ffcc80', '#90caf9', '#a5d6a7', '#f48fb1', '#ce93d8', '#fff59d'];

function RatioGraphLab({ visual }: { visual: RatioGraphVisual }) {
  const items = visual.items.slice(0, 6);
  const [고른, set고른] = useState<number | null>(null);
  const [눈금, set눈금] = useState(false);
  const 띠 = visual.shape === 'band';
  const W = 380;
  const H = 띠 ? 150 : 250;
  const 누르기 = (k: number) => { playTapSound(); set고른(k === 고른 ? null : k); };
  let 누적 = 0;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          <text x={W / 2} y="22" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{visual.title}</text>
          {띠 ? (
            <>
              {items.map((it, k) => {
                const x0 = 20 + (340 * 누적) / 100;
                const w = (340 * it.percent) / 100;
                누적 += it.percent;
                const 켬 = 고른 === k;
                return (
                  <g key={k} style={{ cursor: 'pointer' }} onClick={() => 누르기(k)}>
                    <rect x={x0} y={켬 ? 34 : 40} width={w} height={켬 ? 58 : 46} fill={띠색[k % 띠색.length]} stroke={켬 ? 주황 : '#37474f'} strokeWidth={켬 ? 3 : 1.2} style={{ transition: 'all 0.3s' }} />
                    {w >= 30 && <text x={x0 + w / 2} y="62" textAnchor="middle" fill={글} fontSize="11" fontWeight="800">{it.name}</text>}
                  </g>
                );
              })}
              {눈금 && Array.from({ length: 11 }, (_, t) => (
                <g key={t}>
                  <line x1={20 + 34 * t} y1="34" x2={20 + 34 * t} y2="98" stroke="#37474f" strokeWidth={t % 5 === 0 ? 2 : 1} strokeDasharray="3 3" />
                  <text x={20 + 34 * t} y="114" textAnchor="middle" fill="#56708a" fontSize="10" fontWeight="800">{t * 10}%</text>
                </g>
              ))}
            </>
          ) : (
            <>
              {items.map((it, k) => {
                const cx = 190;
                const cy = 135;
                const r = 95;
                const a0 = ((-90 + (360 * 누적) / 100) * Math.PI) / 180;
                누적 += it.percent;
                const a1 = ((-90 + (360 * 누적) / 100) * Math.PI) / 180;
                const 켬 = 고른 === k;
                const mid = (a0 + a1) / 2;
                const 밀기 = 켬 ? 10 : 0;
                const 큰 = it.percent > 50 ? 1 : 0;
                return (
                  <g key={k} style={{ cursor: 'pointer', transform: `translate(${밀기 * Math.cos(mid)}px, ${밀기 * Math.sin(mid)}px)`, transition: 'transform 0.3s' }} onClick={() => 누르기(k)}>
                    <path d={`M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${큰} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`} fill={띠색[k % 띠색.length]} stroke={켬 ? 주황 : '#37474f'} strokeWidth={켬 ? 3 : 1.2} />
                    {it.percent >= 8 && <text x={cx + r * 0.62 * Math.cos(mid)} y={cy + r * 0.62 * Math.sin(mid) + 4} textAnchor="middle" fill={글} fontSize="12" fontWeight="800">{it.name}</text>}
                  </g>
                );
              })}
              {눈금 && Array.from({ length: 10 }, (_, t) => {
                const a = ((-90 + 36 * t) * Math.PI) / 180;
                return <line key={t} x1={190} y1={135} x2={190 + 100 * Math.cos(a)} y2={135 + 100 * Math.sin(a)} stroke="#37474f" strokeWidth="1" strokeDasharray="3 3" />;
              })}
            </>
          )}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 on={눈금} onClick={() => set눈금((v) => !v)}>{눈금 ? '눈금 치우기' : '📏 10% 눈금 대기'}</단추>
      </div>
      <읽기>
        {고른 === null
          ? <>항목을 눌러 보세요. 10% 눈금을 대면 몇 칸을 차지하는지 셀 수 있어요. 전체는 100%예요.</>
          : items[고른].hidden
            ? <>{items[고른].name}의 비율은 아직 몰라요. 전체 100%에서 나머지 항목의 비율을 빼 보세요.</>
            : <>{items[고른].name}: <strong>{items[고른].percent}%</strong> — 10% 눈금 {items[고른].percent / 10}칸만큼이에요.</>}
      </읽기>
    </div>
  );
}

// ── 쌓기나무 ─────────────────────────────────────────────────────────
function StackLab({ h, label, 적어도 }: { h: number[][]; label: string; 적어도: boolean }) {
  const 모양 = 적어도 ? 가장적은모양(h) : h;
  const 최고 = Math.max(...모양.flat());
  const [층수, set층수] = useState(최고);
  const [한층, set한층] = useState<number | null>(null);
  const 틀 = 쌓기그림틀잡기(모양, 36, 50, 최고);
  const cubes = 먼것부터(블록들(모양)).filter((b) => b.z < 층수);
  const 층별 = Array.from({ length: 최고 }, (_, z) => 블록들(모양).filter((b) => b.z === z).length);
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${틀.넓이} ${틀.높이}`} role="img" aria-label={label}>
          {화살촉}
          <rect x="2" y="2" width={틀.넓이 - 4} height={틀.높이 - 4} rx="12" {...판} />
          {cubes.map((b) => (
            <쌓기나무하나 key={`${b.x}-${b.y}-${b.z}`} 틀={틀} b={b}
              색={한층 !== null && b.z === 한층 - 1 ? '#ffcc80' : undefined}
              흐림={한층 !== null && b.z !== 한층 - 1}
              style={{ animation: `g1-drop 0.5s ease ${b.z * 0.25}s both` }} />
          ))}
          <앞옆표시 틀={틀} h={모양} />
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => { set층수(1); set한층(null); }}>1층부터</단추>
        <단추 onClick={() => set층수((v) => Math.min(최고, v + 1))} disabled={층수 >= 최고}>⬆️ 한 층 더 쌓기</단추>
        {Array.from({ length: 최고 }, (_, z) => (
          <단추 key={z} on={한층 === z + 1} onClick={() => { set층수(최고); set한층(한층 === z + 1 ? null : z + 1); }}>{z + 1}층만 보기</단추>
        ))}
      </div>
      <읽기>
        {한층 !== null
          ? <>{한층}층에 놓인 쌓기나무를 색칠했어요. 하나씩 세어 보세요.</>
          : 층수 < 최고
            ? <>{층수}층까지 쌓았어요. 층마다 몇 개인지 세면서 쌓아 보세요.</>
            : <>{적어도 ? '그림과 똑같이 보이게 가장 적게 쌓은 모양이에요. 위에 놓인 쌓기나무 아래에는 반드시 받치는 쌓기나무가 있어요. ' : ''}층별로 나누어 보면 셀 때 빠뜨리지 않아요. ({층별.map((_, z) => `${z + 1}층`).join(', ')}을 눌러 보세요.)</>}
      </읽기>
    </div>
  );
}

// ── 고리·반원 ────────────────────────────────────────────────────────
function CircleRegionLab({ visual }: { visual: CircleRegionVisual }) {
  const [단계, set단계] = useState(0);
  const W = 360;
  const H = 230;
  const cx = 130;
  const cy = 118;
  const R = 90;
  const r = visual.shape === 'ring' ? (R * (visual.inner ?? 1)) / visual.outer : 0;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {visual.shape === 'ring' ? (
            <>
              <circle cx={cx} cy={cy} r={R} fill="#ffcc80" stroke="#0f4c5c" strokeWidth="2.5" />
              {/* 작은 원을 오려 내어 오른쪽으로 옮깁니다. */}
              <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#0f4c5c" strokeWidth="2" strokeDasharray={단계 >= 1 ? '5 4' : undefined} />
              <g style={{ transform: `translateX(${단계 >= 1 ? 160 : 0}px)`, transition: 'transform 0.9s ease' }}>
                <circle cx={cx} cy={cy} r={r} fill={단계 >= 1 ? '#90caf9' : '#ffffff'} stroke="#0f4c5c" strokeWidth="2.5" />
                <text x={cx} y={cy + 5} textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{단계 >= 1 ? '작은 원' : ''}</text>
              </g>
              <text x={cx} y={cy - R - 6} textAnchor="middle" fill={글} fontSize="13" fontWeight="900">{단계 >= 1 ? '큰 원 − 작은 원 = 고리' : ''}</text>
            </>
          ) : (
            <>
              <g style={{ opacity: 단계 >= 1 ? 1 : 0, transition: 'opacity 0.6s' }}>
                <circle cx={cx + 50} cy={cy + 10} r={R} fill="#e3f2fd" stroke="#0f4c5c" strokeWidth="2" strokeDasharray="6 4" />
              </g>
              <g style={{ transform: 단계 >= 2 ? 'scaleY(-1)' : 'none', transformOrigin: `${cx + 50}px ${cy + 10}px`, transformBox: 'view-box', transition: 'transform 0.9s ease' }}>
                <path d={`M ${cx + 50 - R} ${cy + 10} A ${R} ${R} 0 0 1 ${cx + 50 + R} ${cy + 10} Z`} fill="#ffcc80" stroke="#0f4c5c" strokeWidth="2.5" />
              </g>
              <line x1={cx + 50 - R} y1={cy + 10} x2={cx + 50 + R} y2={cy + 10} stroke="#0f4c5c" strokeWidth="2.5" />
            </>
          )}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {visual.shape === 'ring'
          ? <단추 on={단계 >= 1} onClick={() => set단계((v) => (v >= 1 ? 0 : 1))}>{단계 >= 1 ? '제자리에 넣기' : '✂️ 작은 원 오려 내기'}</단추>
          : (
            <>
              <단추 on={단계 >= 1} onClick={() => set단계(1)}>⭕ 원 전체 그려 보기</단추>
              <단추 on={단계 >= 2} onClick={() => set단계(2)} disabled={단계 < 1}>반으로 접어 겹치기</단추>
              <단추 onClick={() => set단계(0)} disabled={단계 === 0}>처음으로</단추>
            </>
          )}
      </div>
      <읽기>
        {visual.shape === 'ring'
          ? 단계 >= 1
            ? <>고리 모양은 큰 원에서 작은 원을 오려 낸 것이에요. 넓이는 <strong>(큰 원의 넓이)−(작은 원의 넓이)</strong>로 구해요.</>
            : <>가운데 작은 원을 오려 내 보세요. 고리가 어떻게 생겼는지 보여요.</>
          : 단계 === 0
            ? <>반원을 원 전체와 견주어 보세요.</>
            : 단계 === 1
              ? <>반원 두 개가 모이면 원 하나가 돼요.</>
              : <>반으로 접으니 두 반원이 꼭 겹쳐요. 반원의 넓이는 <strong>원의 넓이의 절반</strong>이에요.</>}
      </읽기>
    </div>
  );
}

// ── 원기둥 전개도 ────────────────────────────────────────────────────
function CylinderNetLab({ visual }: { visual: SolidNetVisual }) {
  const [굴림, set굴림] = useState(false);
  const 가로 = 2 * Math.PI * visual.base;
  const 세로 = visual.height;
  const k = Math.min(300 / 가로, 120 / 세로, 60 / (2 * visual.base));
  const r = visual.base * k;
  // 굴러가는 밑면이 왼쪽·오른쪽 끝에서 잘리지 않도록 반지름만큼 띄웁니다.
  const left = 20 + r;
  const W = left + 가로 * k + r + 20;
  const top = 30 + 2 * r;
  const H = top + 세로 * k + 2 * r + 30;
  const 둘레 = 가로 * k;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          <rect x={left} y={top} width={둘레} height={세로 * k} fill="#dff4f7" stroke="#0f4c5c" strokeWidth="2.2" />
          <circle cx={left + r} cy={top + 세로 * k + r} r={r} fill="#c5ebf1" stroke="#0f4c5c" strokeWidth="2" />
          {/* 위 밑면을 옆면의 윗변을 따라 한 바퀴 굴립니다. */}
          <g style={{
            transform: 굴림 ? `translateX(${둘레}px) rotate(360deg)` : 'none',
            transformOrigin: `${left}px ${top - r}px`,
            transformBox: 'view-box',
            transition: 굴림 ? 'transform 2.4s linear' : 'none',
          }}>
            <circle cx={left} cy={top - r} r={r} fill="#c5ebf1" stroke="#0f4c5c" strokeWidth="2" />
            <line x1={left} y1={top - r} x2={left} y2={top} stroke={주황} strokeWidth="3" />
            <circle cx={left} cy={top} r="3.5" fill={주황} />
          </g>
          {굴림 && <line x1={left} y1={top} x2={left + 둘레} y2={top} stroke={주황} strokeWidth="4" style={{ animation: 'g1-fade 2.4s ease both' }} />}
          <text x={left + 둘레 / 2} y={top + 세로 * k / 2 + 5} textAnchor="middle" fill={글} fontSize="13" fontWeight="900">옆면</text>
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 on={굴림} onClick={() => set굴림((v) => !v)}>{굴림 ? '제자리로' : '🎡 밑면을 한 바퀴 굴리기'}</단추>
      </div>
      <읽기>
        {굴림
          ? <>밑면이 옆면의 윗변을 따라 꼭 한 바퀴 굴렀어요. 그래서 <strong>옆면의 가로 = 밑면의 둘레(원주)</strong>이고, 옆면의 세로는 원기둥의 높이예요.</>
          : <>위의 밑면을 옆면 위로 굴려 보세요. 주황 점이 한 바퀴 돌아 다시 바닥에 닿는 곳을 보세요.</>}
      </읽기>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
export type 고학년실험 = { 제목: string; 화면: ReactNode; 차례: string[] };

export const 무엇을해볼까_고학년 = (visual: QuestionVisual | undefined, prompt = ''): 고학년실험 | null => {
  if (!visual) return null;
  switch (visual.kind) {
    case 'symmetry-draw':
      return {
        제목: visual.mode === 'copy' ? '똑같이 옮겨 그려 보세요' : visual.mode === 'line' ? '대칭축을 따라 그려 보세요' : '대칭의 중심을 지나 그려 보세요',
        화면: <SymmetryDrawLab visual={visual} />,
        차례: visual.mode === 'copy'
          ? ['한 꼭짓점을 옮긴 칸 수를 세어요.', '다른 꼭짓점도 같은 방향으로 같은 칸 수만큼 옮겨요.', '찍은 점을 차례로 이어요.']
          : visual.mode === 'line'
            ? ['각 꼭짓점에서 대칭축에 수직인 선을 그어요.', '대칭축까지와 같은 칸 수만큼 반대쪽에 점을 찍어요.', '찍은 점을 차례로 이어요.']
            : ['각 꼭짓점에서 대칭의 중심을 지나는 선을 그어요.', '중심까지와 같은 거리만큼 반대쪽에 점을 찍어요.', '찍은 점을 차례로 이어요.'],
      };
    case 'grid-move': {
      const 종류 = 이동종류(visual, prompt);
      if (!종류) return null;
      const 제목 = { slide: '한 칸씩 밀어 보세요', flip: '뒤집어 보세요', rotate: '90°씩 돌려 보세요', point: '점을 옮겨 보세요' }[종류];
      return { 제목, 화면: <GridMoveLab visual={visual} prompt={prompt} />, 차례: 종류 === 'rotate' ? ['주황색 칸이 어디로 가는지 따라가요.', '시계 방향과 시계 반대 방향을 헷갈리지 마세요.'] : 종류 === 'flip' ? ['뒤집는 방향의 반대쪽으로 모양이 넘어가요.', '같은 방향으로 두 번 뒤집으면 처음과 같아요.'] : ['몇 칸, 어느 방향인지 세며 옮겨요.'] };
    }
    case 'protractor':
      return { 제목: '각도기의 눈금을 따라가 보세요', 화면: <ProtractorLab visual={visual} />, 차례: ['각의 한 변이 놓인 쪽의 0을 찾아요.', '그 0에서 시작하는 눈금을 따라 다른 변까지 읽어요.'] };
    case 'angle':
      return { 제목: visual.items.length > 1 ? '각을 겹쳐서 견주어 보세요' : '직각을 대어 보세요', 화면: <AngleLab visual={visual} />, 차례: ['각의 크기는 두 변이 벌어진 정도예요.', '변의 길이는 각의 크기와 상관없어요.'] };
    case 'bar-graph':
      if (visual.horizontal) return null;
      return { 제목: '막대를 눌러 눈금을 읽어 보세요', 화면: <BarGraphLab visual={visual} />, 차례: ['세로 눈금 한 칸이 얼마인지 먼저 알아요.', '막대 끝이 눈금 몇 칸인지 세어요.'] };
    case 'line-graph':
      return { 제목: '점과 선을 눌러 보세요', 화면: <LineGraphLab visual={visual} />, 차례: ['점의 높이로 값을 읽어요.', '선이 많이 기울어진 곳이 변화가 큰 곳이에요.'] };
    case 'range-line':
      return { 제목: '수를 옮기며 범위를 확인해 보세요', 화면: <RangeLineLab visual={visual} />, 차례: ['● 는 그 수를 넣고, ○ 는 넣지 않아요.', '이상·이하는 같은 수를 넣고, 초과·미만은 넣지 않아요.'] };
    case 'ratio-graph':
      return { 제목: '항목을 짚고 10% 눈금을 대어 보세요', 화면: <RatioGraphLab visual={visual} />, 차례: ['전체는 100%예요.', '눈금 한 칸이 10%예요.'] };
    case 'stack-plan': {
      if (visual.hidden) return null;
      return { 제목: '한 층씩 쌓아 보세요', 화면: <StackLab h={visual.heights} label={visual.label} 적어도={false} />, 차례: ['위에서 본 모양의 칸마다 적힌 수만큼 쌓아요.', '층별로 나누어 세면 빠뜨리지 않아요.'] };
    }
    case 'stack-iso': {
      if (visual.items || visual.views || visual.plan) return null;
      const 적어도 = /적어도/.test(prompt);
      return { 제목: '한 층씩 쌓아 보세요', 화면: <StackLab h={visual.heights} label={visual.label} 적어도={적어도} />, 차례: ['층별로 나누어 세어요.', '위에 있는 쌓기나무 아래에는 받치는 쌓기나무가 있어요.'] };
    }
    case 'circle-region':
      return { 제목: visual.shape === 'ring' ? '작은 원을 오려 내 보세요' : '원을 반으로 접어 보세요', 화면: <CircleRegionLab visual={visual} />, 차례: visual.shape === 'ring' ? ['고리는 큰 원에서 작은 원을 뺀 모양이에요.'] : ['반원은 원을 똑같이 둘로 나눈 것이에요.'] };
    case 'solid-net':
      if (visual.solid !== 'cylinder') return null;
      return { 제목: '밑면을 굴려 보세요', 화면: <CylinderNetLab visual={visual} />, 차례: ['옆면의 가로는 밑면의 둘레와 같아요.', '옆면의 세로는 원기둥의 높이와 같아요.'] };
    default:
      return null;
  }
};
