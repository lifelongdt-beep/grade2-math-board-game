import { useEffect, useMemo, useState } from 'react';
import type { Walkthrough } from '../types';
import { buildWalk, type AnyWalk, type ChainWalk, type ColumnWalk, type DecWalk, type DivWalk, type ExprWalk } from '../data/walkthrough';
import { MathText } from './MathText';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 세로셈 따라가기 — 한 자리씩 써 내려가는 모습을 보여 주는 자리
// ────────────────────────────────────────────────────────────────────
// 교과서는 세로셈을 '일의 자리부터 차례로' 쓰게 합니다. 종이 위에서는
// 아이가 한 자리씩 쓰지만, 화면의 풀이 글은 한꺼번에 다 보입니다.
// 그러면 아이는 받아올림한 1이 어디서 왔는지, 둘째 줄이 왜 한 칸
// 왼쪽에 있는지를 글로만 짐작해야 합니다.
//
// 그래서 한 장면에 한 자리만 씁니다. 지금 계산하는 자리를 칠하고,
// 받아올린 1은 아래에서 위로 날아오르고, 받아내린 자리는 숫자를
// 지우고 새 수를 작게 씁니다 — 교과서에서 손으로 하는 그대로입니다.
//
// 답을 고르기 전(자세히 보기)에는 마지막 자리 앞에서 멈춥니다. 남은
// 한 자리는 아이가 직접 하게 하려는 것입니다. 틀린 뒤(만져서 다시
// 보기)에는 끝까지 보여 줍니다.
// ════════════════════════════════════════════════════════════════════

const 기본칸 = 46;
const 줄높이 = { small: 26, digit: 50, line: 12, label: 24 } as const;

/** 답을 고르기 전에 보여 줄 마지막 장면입니다. */
/** 장면의 수와 장면마다의 설명입니다. */
const 장면수 = (walk: AnyWalk) => (walk.type === 'chain' ? walk.lines.length : walk.frames.length);
const 설명 = (walk: AnyWalk, at: number) => (walk.type === 'chain' ? walk.says[at] : walk.frames[at].say);

export const hintStop = (walk: AnyWalk): number => {
  // 마지막 계산 하나는 아이가 직접 합니다.
  if (walk.type === 'expr') return Math.max(1, walk.frames.length - 3);
  // 소수점을 어디에 찍을지 센 데까지 보여 주고, 찍는 것은 아이가 합니다.
  if (walk.type === 'decmul') return 2;
  if (walk.type === 'chain') return Math.max(0, walk.lines.length - 2);
  if (walk.type === 'div') {
    // 마지막으로 몫을 쓰는 장면 바로 앞까지 보여 줍니다.
    let last = -1;
    walk.frames.forEach((f, at) => { if (f.freshQuotient !== null) last = at; });
    return Math.max(0, last - 1);
  }
  if (walk.stopAt !== undefined) return walk.stopAt;
  // 마지막 자리를 쓰는 장면과 정리하는 장면을 남깁니다.
  return Math.max(1, walk.frames.length - 3);
};

function ColumnBoard({ walk, at }: { walk: ColumnWalk; at: number }) {
  const frame = walk.frames[at];
  const 칸 = walk.wide ? 70 : 기본칸;
  const width = (walk.cols + 1) * 칸 + 24;
  let y = 8;
  const rowY: Record<string, number> = {};
  walk.rows.forEach((row) => {
    rowY[row.id] = y;
    y += 줄높이[row.kind];
  });
  const height = y + 8;
  const x = (col: number) => 12 + (walk.cols - col) * 칸;
  const fresh = new Set(frame.fresh);
  return (
    <svg className="walk-board" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="세로셈">
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="14" fill="#fffdf6" stroke="#eadfbe" />
      {frame.focus !== null && (
        <rect key={`focus-${at}`} className="walk-focus" x={x(frame.focus) + 3} y={6} width={칸 - 6} height={height - 12} rx="10" fill="#d9f4f1" />
      )}
      {walk.rows.map((row) => {
        if (row.kind === 'line') {
          return <line key={row.id} x1={12} x2={width - 12} y1={rowY[row.id] + 6} y2={rowY[row.id] + 6} stroke="#24364a" strokeWidth="2.5" />;
        }
        return row.op ? (
          <text key={`${row.id}-op`} x={12 + 칸 / 2} y={rowY[row.id] + 36} textAnchor="middle" fontSize="28" fontWeight="900" fill="#24364a">
            {row.op}
          </text>
        ) : null;
      })}
      {frame.cells.map((cell) => {
        const k = `${cell.row}:${cell.col}`;
        const top = rowY[cell.row];
        const cx = x(cell.col) + 칸 / 2;
        const isFresh = fresh.has(k);
        if (cell.row === 'unit') {
          return (
            <text key={k} x={cx} y={top + 18} textAnchor="middle" fontSize="16" fontWeight="900" fill="#6b7c8f">
              {cell.text}
            </text>
          );
        }
        if (cell.small) {
          return (
            <text
              key={`${k}-${cell.text}-${isFresh ? at : 'old'}`}
              className={isFresh ? 'walk-fly' : undefined}
              x={cx}
              y={top + 20}
              textAnchor="middle"
              fontSize={cell.text.length > 1 ? 17 : 20}
              fontWeight="900"
              fill="#d0482f"
            >
              {cell.text}
            </text>
          );
        }
        return (
          <g key={`${k}-${cell.text}-${isFresh ? at : 'old'}`} className={isFresh ? 'walk-pop' : undefined}>
            <text x={cx} y={top + 36} textAnchor="middle" fontSize="32" fontWeight="900" fill={cell.row === 'r' || cell.row.startsWith('p') ? '#0f7175' : '#24364a'} opacity={cell.struck ? 0.55 : 1}>
              {cell.text}
            </text>
            {cell.struck && <line x1={cx - 12} x2={cx + 12} y1={top + 34} y2={top + 14} stroke="#d0482f" strokeWidth="3" strokeLinecap="round" />}
          </g>
        );
      })}
    </svg>
  );
}

function DivBoard({ walk, at }: { walk: DivWalk; at: number }) {
  const frame = walk.frames[at];
  const 칸 = 기본칸;
  const n = walk.dividend.length;
  const 왼쪽 = 70;
  const width = 왼쪽 + n * 칸 + 30;
  const 몫y = 10;
  const 수y = 몫y + 줄높이.digit + 6;
  const lineH = 44;
  // 장면마다 높이가 바뀌면 그림이 출렁입니다. 가장 긴 장면에 맞춥니다.
  const 가장긴 = walk.frames.reduce((m, f) => Math.max(m, f.lines.length), 0);
  const height = 수y + 줄높이.digit + 가장긴 * lineH + 16;
  const x = (col: number) => 왼쪽 + col * 칸;
  return (
    <svg className="walk-board" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="나눗셈 세로셈">
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="14" fill="#fffdf6" stroke="#eadfbe" />
      {frame.focus !== null && (
        <rect key={`focus-${at}`} className="walk-focus" x={x(frame.focus) + 3} y={6} width={칸 - 6} height={height - 12} rx="10" fill="#d9f4f1" />
      )}
      {/* 나누는 수와 괄호, 나누어지는 수 위의 선 */}
      <text x={왼쪽 - 30} y={수y + 36} textAnchor="middle" fontSize="32" fontWeight="900" fill="#24364a">{walk.divisor}</text>
      <path d={`M ${왼쪽 - 8} ${수y + 46} Q ${왼쪽 + 4} ${수y + 22} ${왼쪽 - 8} ${수y - 2} L ${x(n) + 6} ${수y - 2}`} fill="none" stroke="#24364a" strokeWidth="2.5" />
      {walk.dividend.split('').map((d, col) => (
        <text key={`d${col}`} x={x(col) + 칸 / 2} y={수y + 36} textAnchor="middle" fontSize="32" fontWeight="900" fill="#24364a">{d}</text>
      ))}
      {frame.quotient.map((d, col) => d === null ? null : (
        <text key={`q${col}-${d}-${frame.freshQuotient === col ? at : 'old'}`} className={frame.freshQuotient === col ? 'walk-pop' : undefined} x={x(col) + 칸 / 2} y={몫y + 36} textAnchor="middle" fontSize="32" fontWeight="900" fill="#0f7175">{d}</text>
      ))}
      {frame.lines.map((line, k) => {
        const top = 수y + 줄높이.digit + k * lineH;
        const digits = line.text.split('');
        const 첫칸 = line.endCol - digits.length + 1;
        const isFresh = frame.freshLine === k;
        return (
          <g key={`l${k}-${line.text}-${isFresh ? at : 'old'}`} className={isFresh ? 'walk-pop' : undefined}>
            {digits.map((d, i) => (
              <text key={i} x={x(첫칸 + i) + 칸 / 2} y={top + 32} textAnchor="middle" fontSize="30" fontWeight="900" fill={line.kind === 'sub' ? '#8a5a00' : '#24364a'}>{d}</text>
            ))}
            {line.kind === 'sub' && <line x1={x(첫칸) + 4} x2={x(line.endCol + 1) - 4} y1={top + lineH - 2} y2={top + lineH - 2} stroke="#24364a" strokeWidth="2.5" />}
          </g>
        );
      })}
    </svg>
  );
}

// ── 혼합 계산: 지금 계산할 부분을 칠하고, 계산한 값으로 바꾸어 식을 줄입니다 ──
function ExprBoard({ walk, at }: { walk: ExprWalk; at: number }) {
  const frame = walk.frames[at];
  return (
    <div className="expr-board" role="img" aria-label="계산 순서">
      {frame.tokens.map((tok, k) => {
        const 칠함 = frame.hl && k >= frame.hl[0] && k <= frame.hl[1];
        const 새값 = frame.fresh === k;
        return (
          <span
            key={`${at}-${k}-${tok}`}
            className={`expr-tok${칠함 ? ' expr-hl' : ''}${새값 ? ' expr-fresh walk-pop' : ''}${/[+\-×÷]/.test(tok) ? ' expr-op' : ''}`}
          >
            {tok === '-' ? '−' : tok}
          </span>
        );
      })}
      {frame.hl && (
        <span key={`under-${at}`} className="expr-under">
          먼저!
        </span>
      )}
    </div>
  );
}

// ── 소수의 곱셈: 자연수처럼 곱한 다음, 소수점이 오른쪽 끝에서 한 자리씩 뛰어 갑니다 ──
function DecBoard({ walk, at }: { walk: DecWalk; at: number }) {
  const frame = walk.frames[at];
  const 칸 = 34;
  const ds = walk.digits.split('');
  const width = Math.max(ds.length * 칸 + 60, 300);
  const 시작 = (width - ds.length * 칸) / 2;
  const 보임 = frame.stage !== 'write';
  const 점 = frame.stage === 'point' || frame.stage === 'done';
  // 소수점은 오른쪽 끝(자리 0)에서 출발해 point 자리만큼 왼쪽으로 뜁니다.
  const 점x = 시작 + (ds.length - (점 ? frame.point : 0)) * 칸;
  const 자리표시 = (x: string, n: number) => (n ? `${x} (${n}자리)` : `${x} (0자리)`);
  return (
    <svg className="walk-board" viewBox={`0 0 ${width} 190`} role="img" aria-label="소수의 곱셈">
      <rect x="2" y="2" width={width - 4} height="186" rx="14" fill="#fffdf6" stroke="#eadfbe" />
      <text x={width / 2} y="40" textAnchor="middle" fontSize="26" fontWeight="900" fill="#24364a">
        {walk.a} × {walk.b}
      </text>
      {frame.stage !== 'write' && (
        <text x={width / 2} y="70" textAnchor="middle" fontSize="15" fontWeight="800" fill={frame.stage === 'count' ? '#d0482f' : '#6b7c8f'}>
          {frame.stage === 'whole' ? `${walk.a.replace('.', '')} × ${walk.b.replace('.', '')}` : `${자리표시(walk.a, walk.places[0])} · ${자리표시(walk.b, walk.places[1])}`}
        </text>
      )}
      {보임 && ds.map((d, k) => (
        <text key={`${k}-${d}`} className="walk-pop" x={시작 + k * 칸 + 칸 / 2} y="135" textAnchor="middle" fontSize="34" fontWeight="900" fill={d === '0' && k < ds.length - walk.product.length ? '#d0482f' : '#0f7175'}>
          {d}
        </text>
      ))}
      {보임 && (
        <circle className="dec-point" cx={0} cy={0} r="5.5" fill={점 ? '#d0482f' : 'transparent'} style={{ transform: `translate(${점x}px, 138px)` }} />
      )}
      {점 && frame.point > 0 && Array.from({ length: frame.point }, (_, k) => (
        <path key={k} className="dec-hop" d={`M ${시작 + (ds.length - k) * 칸} 150 q ${-칸 / 2} 22 ${-칸} 0`} fill="none" stroke="#d0482f" strokeWidth="2" strokeDasharray="4 3" style={{ animationDelay: `${k * 0.25}s` }} />
      ))}
    </svg>
  );
}

// ── 분수 계산: 칠판에 한 줄씩 써 내려갑니다 ──────────────────────────
function ChainBoard({ walk, at }: { walk: ChainWalk; at: number }) {
  return (
    <div className="chain-board">
      {walk.lines.slice(0, at + 1).map((line, k) => (
        <div key={k} className={`chain-line${k === at ? ' chain-new' : ''}`}>
          <span className="chain-eq">{k === 0 ? '' : '='}</span>
          <MathText text={line} />
        </div>
      ))}
    </div>
  );
}

export function ColumnLab({ walkthrough, reveal }: { walkthrough: Walkthrough; reveal: boolean }) {
  const walk = useMemo(() => buildWalk(walkthrough), [walkthrough]);
  const stop = reveal ? 장면수(walk) - 1 : hintStop(walk);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);

  // 자동으로 보기: 한 장면씩 넘깁니다. 읽을 틈을 두려고 글 길이에 따라 기다립니다.
  useEffect(() => {
    if (!playing) return undefined;
    if (at >= stop) {
      setPlaying(false);
      return undefined;
    }
    const wait = 1400 + 설명(walk, at).length * 35;
    const timer = window.setTimeout(() => setAt((v) => Math.min(stop, v + 1)), wait);
    return () => window.clearTimeout(timer);
  }, [playing, at, stop, walk]);

  const 끝 = at >= stop;
  const 멈춤 = 끝 && !reveal && stop < 장면수(walk) - 1;
  return (
    <div className="walk-lab">
      {walk.type === 'div' && <DivBoard walk={walk} at={at} />}
      {walk.type === 'column' && <ColumnBoard walk={walk} at={at} />}
      {walk.type === 'expr' && <ExprBoard walk={walk} at={at} />}
      {walk.type === 'decmul' && <DecBoard walk={walk} at={at} />}
      {walk.type === 'chain' && <ChainBoard walk={walk} at={at} />}
      <p className="walk-say" aria-live="polite">
        <span className="walk-count">{at + 1}/{stop + 1}</span> {설명(walk, at)}
      </p>
      {멈춤 && (
        <p className="walk-stop">
          여기까지! <strong>{walk.type === 'decmul' ? '소수점은 직접 찍어 보세요.' : walk.type === 'column' || walk.type === 'div' ? '남은 자리는 직접 계산해 보세요.' : '마지막 계산은 직접 해 보세요.'}</strong>
        </p>
      )}
      <div className="walk-controls">
        <button type="button" disabled={at === 0} onClick={() => { playTapSound(); setPlaying(false); setAt((v) => Math.max(0, v - 1)); }}>
          ◀ 앞으로
        </button>
        <button type="button" className="walk-next" disabled={끝} onClick={() => { playTapSound(); setPlaying(false); setAt((v) => Math.min(stop, v + 1)); }}>
          {walk.type === 'column' || walk.type === 'div' ? '다음 자리 ▶' : '다음 ▶'}
        </button>
        <button
          type="button"
          onClick={() => {
            playTapSound();
            if (끝) setAt(0);
            setPlaying((v) => !v || 끝);
          }}
        >
          {playing ? '⏸ 멈추기' : 끝 ? '↺ 처음부터' : '▶ 자동으로'}
        </button>
      </div>
    </div>
  );
}
