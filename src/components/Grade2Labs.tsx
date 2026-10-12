import { useState, type ReactNode } from 'react';
import type { BarModelVisual, CalendarVisual, GridTableVisual, PatternVisual, QuestionVisual, RulerVisual, TableVisual } from '../types';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 2학년 자세히 보기 — 손으로 해 보는 실험실
// ────────────────────────────────────────────────────────────────────
// 2학년 아이는 그림을 '읽는' 것보다 '해 보는' 것에서 더 많이 배웁니다.
// 지도서도 차시마다 이어 붙이고, 나란히 대고, 뛰어 세고, 줄 세워
// 보게 합니다. 그 일을 화면에서 그대로 합니다.
//   · 막대: 같은 길이를 하나씩 눌러 뛰어 세기 / 이어 붙여 '모두' 보기 /
//           나란히 대어 '차이' 보기
//   · 자: 1 cm씩 눌러 세기, 물건을 0에 맞추어 옮기기
//   · 규칙: 되풀이 묶음으로 줄 세우기, 수와 수 사이를 눌러 '몇씩' 보기
//   · 곱셈표·덧셈표: 가로·세로 수를 눌러 만나는 칸 찾기
//   · 달력: 하루 뒤, 한 주 뒤로 말 옮기기
//   · 표: 수를 눌러 차례로 더해 가기
// 답은 말해 주지 않습니다. 해 본 결과를 아이가 읽습니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#24364a';
const 청 = '#18a7a7';
const 진청 = '#0f7175';
const 주황 = '#ef6c00';
const 막대색 = ['#4fc3f7', '#ffb74d', '#aed581', '#f48fb1', '#b39ddb', '#90a4ae'];

function 읽기({ children }: { children: ReactNode }) {
  return <p className="g3-lab-readout">{children}</p>;
}

function 단추({ onClick, children, disabled, on }: { onClick: () => void; children: ReactNode; disabled?: boolean; on?: boolean }) {
  return (
    <button type="button" className="g3-lab-button" aria-pressed={on} disabled={disabled} onClick={() => { playTapSound(); onClick(); }}>
      {children}
    </button>
  );
}

// ── 막대 ─────────────────────────────────────────────────────────────
const 같은막대 = (bars: BarModelVisual['bars']) => {
  // 1m씩 나누어 보기처럼 마지막 하나만 남은 길이인 것도 뛰어 세기로 봅니다.
  const 앞 = bars.length >= 3 && bars[bars.length - 1].value < bars[0].value ? bars.slice(0, -1) : bars;
  return 앞.length >= 2 && 앞.every((b) => b.value === 앞[0].value);
};

function BarLab({ visual }: { visual: BarModelVisual }) {
  const bars = visual.bars.filter((b) => b.value > 0);
  const 뛰어세기 = 같은막대(bars);
  const [모양, set모양] = useState<'처음' | '이어' | '나란히'>(뛰어세기 ? '이어' : '처음');
  const [센, set센] = useState(0);
  const W = 380;
  const 합 = bars.reduce((s, b) => s + b.value, 0);
  const 가장 = Math.max(...bars.map((b) => b.value));
  const 이어자 = (W - 40) / 합;
  const 따로자 = (W - 130) / 가장;
  const barH = 34;
  const 이은 = 모양 === '이어';
  const H = 이은 ? 130 : 30 + bars.length * (barH + 14) + 30;
  const 글자 = (b: BarModelVisual['bars'][number]) => b.text ?? String(b.value);
  // 전체와 부분: 첫 막대가 나머지의 합입니다(58과 45, 13). 이어 붙이면
  // 부분들을 전체 아래에 이어 놓아 길이가 꼭 맞는 것을 보입니다.
  const 부분전체 = !뛰어세기 && bars.length >= 3 && bars[0].value === bars.slice(1).reduce((t, b) => t + b.value, 0);
  // 줄어든 양(사용, 내림, 먹음 …)은 이어 붙일 때 끝에서 덜어 냅니다.
  const 줄어듦 = (b: BarModelVisual['bars'][number]) => !부분전체 && /사용|내림|내렸|먹|줌|준|뺌|덜|빼|잃|날아/.test(b.label);
  const 늘합 = bars.filter((b) => !줄어듦(b)).reduce((t, b) => t + b.value, 0);
  const 전체자 = 부분전체 ? (W - 40) / bars[0].value : 뛰어세기 ? 이어자 : (W - 40) / Math.max(1, 늘합);
  // 막대마다 지금 모양에서 놓일 자리입니다. 바뀌면 미끄러지듯 옮겨 갑니다.
  let 앞쪽 = 0;
  let 뒤쪽 = 늘합;
  const 자리 = bars.map((b, k) => {
    if (!이은) return { x: 110, y: 24 + k * (barH + 14), w: b.value * 따로자 };
    if (부분전체) {
      if (k === 0) return { x: 20, y: 24, w: b.value * 전체자 };
      const x = 20 + 앞쪽 * 전체자;
      앞쪽 += b.value;
      return { x, y: 24 + barH + 16, w: b.value * 전체자 };
    }
    if (줄어듦(b)) {
      뒤쪽 -= b.value;
      return { x: 20 + 뒤쪽 * 전체자, y: 40, w: b.value * 전체자 };
    }
    const x = 20 + 앞쪽 * 전체자;
    앞쪽 += b.value;
    return { x, y: 40, w: b.value * 전체자 };
  });
  const 남은 = 늘합 - bars.filter(줄어듦).reduce((t, b) => t + b.value, 0);
  const 차이 = !이은 && bars.length === 2 ? Math.abs(bars[0].value - bars[1].value) : 0;
  const 짧은 = bars.length === 2 ? (bars[0].value < bars[1].value ? 0 : 1) : 0;
  const 누르기 = (k: number) => {
    if (!뛰어세기 || !이은) return;
    if (k !== 센) return; // 왼쪽부터 차례로 셉니다.
    playTapSound();
    set센((v) => v + 1);
  };
  const 누계 = bars.slice(0, 센).reduce((s, b) => s + b.value, 0);
  const 누계글 = bars.slice(0, 센).map((b) => 글자(b));
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label} style={{ transition: 'height 0.5s' }}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {bars.map((b, k) => {
            const p = 자리[k];
            const 켬 = 뛰어세기 && k < 센;
            return (
              <g key={k} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform 0.7s ease', cursor: 뛰어세기 && 이은 ? 'pointer' : 'default' }} onClick={() => 누르기(k)}>
                <rect x="0" y="0" width={p.w} height={barH} rx="4"
                  fill={켬 ? 주황 : 이은 && 줄어듦(b) ? '#ffcdd2' : 막대색[(뛰어세기 ? 0 : k) % 막대색.length]}
                  stroke={이은 && 줄어듦(b) ? '#d32f2f' : 진청} strokeWidth="2" strokeDasharray={이은 && 줄어듦(b) ? '6 4' : undefined}
                  style={{ transition: 'width 0.7s ease, fill 0.3s' }} />
                {p.w > 26 && <text x={p.w / 2} y={barH / 2 + 6} textAnchor="middle" fill={글} fontSize={p.w > 60 ? 15 : 12} fontWeight="900">{글자(b)}</text>}
                {!이은 && <text x="-8" y={barH / 2 + 6} textAnchor="end" fill={글} fontSize="14" fontWeight="900">{b.label}</text>}
              </g>
            );
          })}
          {이은 && !뛰어세기 && !부분전체 && (
            <g>
              <path d={`M 20 ${40 + barH + 8} v 8 H ${20 + 남은 * 전체자} v -8`} fill="none" stroke={주황} strokeWidth="2.5" style={{ transition: 'all 0.5s' }} />
              <text x={20 + (남은 * 전체자) / 2} y={40 + barH + 36} textAnchor="middle" fill={주황} fontSize="16" fontWeight="900">{남은 === 늘합 ? '모두 ?' : '남은 것 ?'}</text>
            </g>
          )}
          {이은 && 뛰어세기 && 센 > 0 && (
            <g>
              <path d={`M 20 ${40 + barH + 8} v 8 H ${20 + 누계 * 이어자} v -8`} fill="none" stroke={주황} strokeWidth="2.5" style={{ transition: 'all 0.4s' }} />
            </g>
          )}
          {!이은 && bars.length === 2 && 모양 === '나란히' && 차이 > 0 && (
            <g>
              <rect x={110 + bars[짧은].value * 따로자} y={24 + 짧은 * (barH + 14)} width={차이 * 따로자} height={barH} fill="none" stroke={주황} strokeWidth="3" strokeDasharray="6 4" />
              <text x={110 + (bars[짧은].value + 차이 / 2) * 따로자} y={24 + 짧은 * (barH + 14) + barH / 2 + 6} textAnchor="middle" fill={주황} fontSize="15" fontWeight="900">차이 ?</text>
            </g>
          )}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {뛰어세기 ? (
          <단추 onClick={() => set센(0)} disabled={센 === 0}>다시 세기</단추>
        ) : (
          <>
            <단추 on={모양 === '이어'} onClick={() => set모양('이어')}>➡️ {부분전체 ? '부분을 이어 전체와 대어 보기' : '이어 붙여 보기'}</단추>
            {bars.length === 2 && <단추 on={모양 === '나란히'} onClick={() => set모양('나란히')}>⬇️ 나란히 대어 보기</단추>}
            {모양 !== '처음' && <단추 onClick={() => set모양('처음')}>처음으로</단추>}
          </>
        )}
      </div>
      <읽기>
        {뛰어세기
          ? 센 === 0
            ? <>왼쪽 막대부터 하나씩 눌러 보세요. 누를 때마다 길이가 더해져요.</>
            : <>{누계글.join(' + ')} → 지금까지 <strong>{bars.slice(0, 센).every((b) => b.text?.endsWith('cm')) ? `${누계}cm` : 누계}</strong>{센 === bars.length ? ' (끝까지 셌어요!)' : ''}</>
          : 모양 === '이어' && 부분전체
            ? <>아래 막대들을 이어 붙였더니 위의 막대(전체)와 길이가 <strong>꼭 같아요</strong>. 전체는 부분을 <strong>더한</strong> 것이고, 모르는 부분은 전체에서 아는 부분을 <strong>빼서</strong> 구해요.</>
            : 모양 === '이어' && 남은 !== 늘합
              ? <>늘어난 만큼 이어 붙이고, 줄어든 만큼(빨간 점선)은 끝에서 덜어 냈어요. 남은 것은 <strong>더하고 빼서</strong> 구해요.</>
            : 모양 === '이어'
            ? <>막대를 겹치지 않게 이었어요. 모두 얼마인지는 <strong>더해서</strong> 구해요.</>
            : 모양 === '나란히'
              ? <>왼쪽 끝을 맞추어 나란히 대었어요. 더 나온 부분이 <strong>차이</strong>예요. 차이는 <strong>빼서</strong> 구해요.</>
              : <>막대를 이어 붙이거나 나란히 대어 보세요.</>}
      </읽기>
    </div>
  );
}

// ── 자 ───────────────────────────────────────────────────────────────
function RulerLab({ visual }: { visual: RulerVisual }) {
  const [센, set센] = useState(0);
  const [옮김, set옮김] = useState(false);
  const 길이 = visual.highlightEnd - visual.highlightStart;
  const W = 380;
  const H = 150;
  const left = 22;
  const 칸 = (W - 2 * left) / Math.max(1, visual.end - visual.start);
  const X = (cm: number) => left + (cm - visual.start) * 칸;
  const 시작 = 옮김 ? 0 : visual.highlightStart;
  const 영에맞춤 = visual.highlightStart !== 0 && visual.start === 0;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {/* 물건(색 테이프): 옮기면 왼쪽 끝이 0으로 갑니다. */}
          <g style={{ transform: `translateX(${(시작 - visual.highlightStart) * 칸}px)`, transition: 'transform 0.8s ease' }}>
            <rect x={X(visual.highlightStart)} y="30" width={길이 * 칸} height="26" rx="5" fill="#ffe082" stroke="#f9a825" strokeWidth="2" />
            {Array.from({ length: Math.min(센, 길이) }, (_, k) => (
              <g key={k}>
                <rect x={X(visual.highlightStart + k) + 1} y="31" width={칸 - 2} height="24" rx="3" fill={주황} fillOpacity="0.85" />
                <text x={X(visual.highlightStart + k) + 칸 / 2} y="48" textAnchor="middle" fill="#ffffff" fontSize={칸 > 24 ? 14 : 10} fontWeight="900">{k + 1}</text>
              </g>
            ))}
          </g>
          {/* 자 */}
          <rect x={left - 8} y="64" width={W - 2 * left + 16} height="56" rx="6" fill="#fffde7" stroke="#8d6e63" strokeWidth="2" />
          {Array.from({ length: visual.end - visual.start + 1 }, (_, k) => {
            const cm = visual.start + k;
            return (
              <g key={cm}>
                <line x1={X(cm)} y1="64" x2={X(cm)} y2="84" stroke="#5d4037" strokeWidth="2" />
                <text x={X(cm)} y="104" textAnchor="middle" fill={글} fontSize={칸 > 22 ? 15 : 11} fontWeight="900">{cm}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => set센((v) => Math.min(길이, v + 1))} disabled={센 >= 길이}>👆 1 cm 세기</단추>
        {영에맞춤 && <단추 on={옮김} onClick={() => set옮김((v) => !v)}>{옮김 ? '제자리로' : '↔️ 0에 맞추어 옮기기'}</단추>}
        <단추 onClick={() => { set센(0); set옮김(false); }} disabled={센 === 0 && !옮김}>다시 하기</단추>
      </div>
      <읽기>
        {센 === 0
          ? <>‘1 cm 세기’를 누를 때마다 1 cm가 한 칸씩 칠해져요. 눈금의 숫자가 아니라 <strong>칸의 수</strong>를 세어요.</>
          : <>1 cm가 <strong>{센}번</strong>{센 >= 길이 ? ' — 물건의 끝까지 왔어요!' : ''}</>}
        {옮김 && ' 물건의 왼쪽 끝을 0에 맞추었어요. 이제 오른쪽 끝의 눈금이 길이예요.'}
      </읽기>
    </div>
  );
}

// ── 규칙 ─────────────────────────────────────────────────────────────
const 마디길이 = (items: string[], miss?: number) => {
  for (let p = 2; p <= Math.floor(items.length / 2); p += 1) {
    let 맞음 = true;
    for (let i = 0; i + p < items.length; i += 1) {
      if (i === miss || i + p === miss) continue;
      if (items[i] !== items[i + p]) { 맞음 = false; break; }
    }
    if (맞음) return p;
  }
  return null;
};
const 수들 = (items: string[]) => (items.every((t, k) => /^\d+$/.test(t) || t === '?' || t === '□') ? items.map((t) => (/^\d+$/.test(t) ? Number(t) : null)) : null);

function PatternLab({ visual }: { visual: PatternVisual }) {
  const items = visual.items.slice(0, 12);
  const miss = visual.missingIndex;
  const 수 = 수들(items);
  const p = 수 ? null : 마디길이(items, miss);
  const [줄, set줄] = useState(false);
  const [틈, set틈] = useState<Set<number>>(new Set());
  const W = 380;
  const 칸 = Math.min(44, (W - 30) / items.length - 4);
  const 줄수 = p ? Math.ceil(items.length / p) : 1;
  const H = 줄 && p ? 30 + 줄수 * (칸 + 10) + 10 : 수 ? 130 : 90;
  const 자리 = (k: number) => {
    if (줄 && p) return { x: 30 + (k % p) * (칸 + 10), y: 20 + Math.floor(k / p) * (칸 + 10) };
    return { x: 15 + k * (칸 + 4), y: 수 ? 56 : 24 };
  };
  const 색 = (t: string) => ({ 빨강: '#ef5350', 파랑: '#42a5f5', 노랑: '#ffe14d', 초록: '#66bb6a', 주황: '#ffa726', 보라: '#ab47bc' } as Record<string, string>)[t];
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {줄 && p && Array.from({ length: 줄수 }, (_, r) => (
            <rect key={r} x="22" y={14 + r * (칸 + 10)} width={p * (칸 + 10) + 6} height={칸 + 12} rx="10" fill="none" stroke={진청} strokeWidth="2" strokeDasharray="6 4" />
          ))}
          {items.map((t, k) => {
            const { x, y } = 자리(k);
            const 빈 = k === miss;
            return (
              <g key={k} style={{ transform: `translate(${x}px, ${y}px)`, transition: `transform 0.7s ease ${k * 0.06}s` }}>
                <rect x="0" y="0" width={칸} height={칸} rx="8" fill={빈 ? '#fff4bd' : 색(t) ?? '#dffafa'} stroke="#0f9f9f" strokeWidth="2" />
                <text x={칸 / 2} y={칸 / 2 + 7} textAnchor="middle" fill={글} fontSize={t.length > 2 ? 12 : 18} fontWeight="900">{빈 ? '?' : t}</text>
              </g>
            );
          })}
          {수 && items.slice(0, -1).map((_, k) => {
            const a = 수[k];
            const b = 수[k + 1];
            const { x } = 자리(k);
            const cx = x + 칸 + 2;
            const 보임 = 틈.has(k);
            const 차 = a !== null && b !== null ? b - a : null;
            return (
              <g key={`g${k}`} style={{ cursor: 차 !== null ? 'pointer' : 'default' }} onClick={() => { if (차 === null) return; playTapSound(); set틈((v) => new Set(v).add(k)); }}>
                <path d={`M ${cx - 칸 / 2} 54 Q ${cx} 22 ${cx + 칸 / 2} 54`} fill="none" stroke={보임 ? 주황 : '#b0bec5'} strokeWidth="2.5" strokeDasharray={보임 ? undefined : '4 4'} />
                <text x={cx} y="24" textAnchor="middle" fill={주황} fontSize="14" fontWeight="900">{보임 && 차 !== null ? `${차 >= 0 ? '+' : ''}${차}` : 차 !== null ? '?' : ''}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {p && <단추 on={줄} onClick={() => set줄((v) => !v)}>{줄 ? '한 줄로 되돌리기' : `🔁 ${p}개씩 줄 세우기`}</단추>}
        {수 && <단추 onClick={() => set틈(new Set())} disabled={!틈.size}>다시 보기</단추>}
      </div>
      <읽기>
        {수
          ? <>수와 수 사이의 <strong>?</strong>를 눌러 보세요. 몇씩 커지는지(작아지는지) 나타나요.</>
          : p
            ? 줄
              ? <>되풀이되는 한 묶음({p}개)마다 한 줄로 세웠어요. <strong>?</strong> 위에 있는 모양들을 보세요.</>
              : <>되풀이되는 묶음을 찾았어요. ‘{p}개씩 줄 세우기’를 눌러 보세요.</>
            : <>처음부터 보면서 되풀이되는 부분을 찾아보세요.</>}
      </읽기>
    </div>
  );
}

// ── 곱셈표·덧셈표 ──────────────────────────────────────────────────
function GridTableLab({ visual }: { visual: GridTableVisual }) {
  const [가로, set가로] = useState<number | null>(visual.highlightRow ?? null);
  const [세로, set세로] = useState<number | null>(null);
  const W = 380;
  const 칸 = Math.min(56, (W - 20) / (visual.columns.length + 1));
  const H = 20 + 칸 * (visual.rows.length + 1);
  const left = (W - 칸 * (visual.columns.length + 1)) / 2;
  const 값 = (r: number, c: number) => (visual.operation === '×' ? r * c : r + c);
  const 빈칸 = (r: number, c: number) => visual.blank?.row === r && visual.blank?.column === c;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          <rect x={left} y="10" width={칸} height={칸} fill="#cfd8dc" stroke="#90a4ae" />
          <text x={left + 칸 / 2} y={10 + 칸 / 2 + 7} textAnchor="middle" fill={글} fontSize="20" fontWeight="900">{visual.operation}</text>
          {visual.columns.map((c, j) => (
            <g key={`c${c}`} style={{ cursor: 'pointer' }} onClick={() => { playTapSound(); set세로(c); }}>
              <rect x={left + (j + 1) * 칸} y="10" width={칸} height={칸} fill={세로 === c ? '#ffcc80' : '#e0f2f1'} stroke="#90a4ae" />
              <text x={left + (j + 1.5) * 칸} y={10 + 칸 / 2 + 7} textAnchor="middle" fill={글} fontSize="18" fontWeight="900">{c}</text>
            </g>
          ))}
          {visual.rows.map((r, i) => (
            <g key={`r${r}`}>
              <g style={{ cursor: 'pointer' }} onClick={() => { playTapSound(); set가로(r); }}>
                <rect x={left} y={10 + (i + 1) * 칸} width={칸} height={칸} fill={가로 === r ? '#ffcc80' : '#e0f2f1'} stroke="#90a4ae" />
                <text x={left + 칸 / 2} y={10 + (i + 1.5) * 칸 + 7} textAnchor="middle" fill={글} fontSize="18" fontWeight="900">{r}</text>
              </g>
              {visual.columns.map((c, j) => {
                const 줄 = 가로 === r;
                const 열 = 세로 === c;
                const 만남 = 줄 && 열;
                return (
                  <g key={c}>
                    <rect x={left + (j + 1) * 칸} y={10 + (i + 1) * 칸} width={칸} height={칸} fill={만남 ? 주황 : 줄 || 열 ? '#fff3e0' : '#ffffff'} stroke="#90a4ae" style={{ transition: 'fill 0.3s' }} />
                    <text x={left + (j + 1.5) * 칸} y={10 + (i + 1.5) * 칸 + 6} textAnchor="middle" fill={만남 ? '#ffffff' : 글} fontSize="16" fontWeight="900">
                      {빈칸(r, c) ? '?' : 값(r, c)}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      <읽기>
        {가로 !== null && 세로 !== null
          ? <>가로 <strong>{가로}</strong>과(와) 세로 <strong>{세로}</strong>이(가) 만나는 칸이에요. 그 칸은 {가로}{visual.operation}{세로}의 값이에요.</>
          : <>왼쪽의 수 하나와 위쪽의 수 하나를 눌러 보세요. 두 줄이 만나는 칸이 칠해져요.</>}
      </읽기>
    </div>
  );
}

// ── 달력 ─────────────────────────────────────────────────────────────
function CalendarLab({ visual }: { visual: CalendarVisual }) {
  const 처음 = visual.marks.find((m) => m.tone === 'start')?.day ?? 1;
  const [날, set날] = useState(처음);
  const [기록, set기록] = useState<number[]>([]);
  const W = 380;
  const 칸 = (W - 20) / 7;
  const 줄수 = Math.ceil((visual.startWeekday + visual.days) / 7);
  const H = 40 + 줄수 * 40 + 10;
  const 자리 = (d: number) => {
    const i = visual.startWeekday + d - 1;
    return { x: 10 + (i % 7) * 칸, y: 40 + Math.floor(i / 7) * 40 };
  };
  const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
  const 가기 = (d: number) => {
    if (날 + d < 1 || 날 + d > visual.days) return;
    playTapSound();
    set날((v) => v + d);
    set기록((v) => [...v, d]);
  };
  const 지난 = 기록.reduce((s, d) => s + d, 0);
  const 말 = 자리(날);
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {요일.map((y, k) => <text key={y} x={10 + k * 칸 + 칸 / 2} y="28" textAnchor="middle" fill={k === 0 ? '#d32f2f' : k === 6 ? '#1565c0' : 글} fontSize="15" fontWeight="900">{y}</text>)}
          {Array.from({ length: visual.days }, (_, k) => {
            const d = k + 1;
            const { x, y } = 자리(d);
            const 끝 = visual.marks.some((m) => m.day === d && m.tone === 'end');
            return (
              <g key={d} style={{ cursor: 'pointer' }} onClick={() => { playTapSound(); set날(d); set기록([]); }}>
                <rect x={x + 2} y={y} width={칸 - 4} height="36" rx="6" fill={끝 ? '#ffe0b2' : '#ffffff'} stroke="#cfd8dc" />
                <text x={x + 칸 / 2} y={y + 24} textAnchor="middle" fill={글} fontSize="15" fontWeight="800">{d}</text>
              </g>
            );
          })}
          <circle cx={말.x + 칸 / 2} cy={말.y + 18} r="16" fill="none" stroke={주황} strokeWidth="4" style={{ transition: 'cx 0.5s ease, cy 0.5s ease' }} />
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => 가기(1)}>하루 뒤 ➡️</단추>
        <단추 onClick={() => 가기(7)}>한 주 뒤 ⬇️</단추>
        <단추 onClick={() => 가기(-7)}>한 주 앞 ⬆️</단추>
      </div>
      <읽기>
        지금 <strong>{날}일</strong> ({요일[(visual.startWeekday + 날 - 1) % 7]}요일)
        {기록.length > 0 && <> · {처음}일에서 {기록.map((d) => (d > 0 ? `+${d}` : `${d}`)).join(' ')} = <strong>{지난}일</strong> 지났어요</>}
        {기록.length === 0 && ' · 한 주 뒤를 누르면 바로 아래 칸, 같은 요일로 가요.'}
      </읽기>
    </div>
  );
}

// ── 표 ───────────────────────────────────────────────────────────────
function TableLab({ visual }: { visual: TableVisual }) {
  const [고른, set고른] = useState<number[]>([]);
  const cols = visual.columns;
  const W = 380;
  const 칸 = (W - 20) / (cols.length + 1 + (visual.totalLabel ? 1 : 0));
  const H = 110;
  const 합 = 고른.reduce((s, k) => s + (cols[k].value ?? 0), 0);
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {[visual.categoryLabel, ...cols.map((c) => c.name), ...(visual.totalLabel ? [visual.totalLabel] : [])].map((t, k) => (
            <g key={`h${k}`}>
              <rect x={10 + k * 칸} y="14" width={칸} height="40" fill={k === 0 ? '#cfd8dc' : '#e0f2f1'} stroke="#90a4ae" />
              <text x={10 + k * 칸 + 칸 / 2} y="40" textAnchor="middle" fill={글} fontSize={t.length > 4 ? 11 : 14} fontWeight="900">{t}</text>
            </g>
          ))}
          <rect x="10" y="54" width={칸} height="40" fill="#cfd8dc" stroke="#90a4ae" />
          <text x={10 + 칸 / 2} y="80" textAnchor="middle" fill={글} fontSize={visual.valueLabel.length > 4 ? 10 : 13} fontWeight="900">{visual.valueLabel}</text>
          {cols.map((c, k) => {
            const 켬 = 고른.includes(k);
            return (
              <g key={k} style={{ cursor: c.value === null ? 'default' : 'pointer' }} onClick={() => { if (c.value === null) return; playTapSound(); set고른((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k])); }}>
                <rect x={10 + (k + 1) * 칸} y="54" width={칸} height="40" fill={켬 ? '#ffcc80' : '#ffffff'} stroke="#90a4ae" style={{ transition: 'fill 0.3s' }} />
                <text x={10 + (k + 1.5) * 칸} y="80" textAnchor="middle" fill={c.value === null ? '#d0482f' : 글} fontSize="17" fontWeight="900">{c.value === null ? '?' : c.value}</text>
              </g>
            );
          })}
          {visual.totalLabel && (
            <g>
              <rect x={10 + (cols.length + 1) * 칸} y="54" width={칸} height="40" fill="#ffffff" stroke="#90a4ae" />
              <text x={10 + (cols.length + 1.5) * 칸} y="80" textAnchor="middle" fill={visual.total === null || visual.total === undefined ? '#d0482f' : 글} fontSize="17" fontWeight="900">{visual.total ?? '?'}</text>
            </g>
          )}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => set고른([])} disabled={!고른.length}>다시 고르기</단추>
      </div>
      <읽기>
        {고른.length === 0
          ? <>표의 수를 눌러 보세요. 누른 수를 차례로 더해 줘요. 가장 큰 수와 가장 작은 수를 견줄 때도 눌러서 짚어 보세요.</>
          : <>{고른.map((k) => cols[k].value).join(' + ')} = <strong>{합}</strong></>}
      </읽기>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
export type 이학년실험 = { 제목: string; 화면: ReactNode; 차례: string[] };

export const 무엇을해볼까_2학년 = (visual: QuestionVisual | undefined): 이학년실험 | null => {
  if (!visual) return null;
  switch (visual.kind) {
    case 'bar-model': {
      const bars = visual.bars.filter((b) => b.value > 0);
      if (bars.length < 2) return null;
      return 같은막대(bars)
        ? { 제목: '막대를 하나씩 눌러 세어 보세요', 화면: <BarLab visual={visual} />, 차례: ['막대 하나가 얼마인지 보세요.', '왼쪽부터 하나씩 이어 세어요.'] }
        : { 제목: '막대를 이어 붙이거나 대어 보세요', 화면: <BarLab visual={visual} />, 차례: ['모두 얼마인지 물으면 이어 붙여 더해요.', '얼마나 더 많은지(남은지) 물으면 나란히 대어 차이를 빼요.'] };
    }
    case 'ruler':
      if (visual.unit === 'mm' || visual.elided || visual.end - visual.start > 15 || visual.highlightEnd <= visual.highlightStart) return null;
      return { 제목: '자로 1 cm씩 세어 보세요', 화면: <RulerLab visual={visual} />, 차례: ['물건의 왼쪽 끝이 어느 눈금에 있는지 보세요.', '1 cm가 몇 번인지 칸을 세어요.'] };
    case 'pattern': {
      const 수 = 수들(visual.items);
      if (!수 && !마디길이(visual.items, visual.missingIndex)) return null;
      return { 제목: 수 ? '수 사이를 눌러 보세요' : '되풀이 묶음으로 줄 세워 보세요', 화면: <PatternLab visual={visual} />, 차례: 수 ? ['이웃한 두 수의 차이를 보세요.', '차이가 모두 같으면 그만큼씩 커지는 규칙이에요.'] : ['되풀이되는 한 묶음을 찾으세요.', '묶음마다 줄을 세우면 같은 자리에 같은 모양이 와요.'] };
    }
    case 'grid-table':
      return { 제목: '두 수를 눌러 만나는 칸을 찾아보세요', 화면: <GridTableLab visual={visual} />, 차례: ['왼쪽 수와 위쪽 수를 하나씩 고르세요.', '두 줄이 만나는 칸이 두 수의 곱(합)이에요.', '오른쪽으로 한 칸 가면 얼마씩 커지는지 보세요.'] };
    case 'calendar':
      if (visual.days < 7) return null;
      return { 제목: '달력에서 날짜를 옮겨 보세요', 화면: <CalendarLab visual={visual} />, 차례: ['한 주는 7일이에요.', '같은 세로줄은 같은 요일이에요.', '한 주 뒤는 바로 아래 칸이에요.'] };
    case 'table':
      if (!visual.columns.length || visual.columns.length > 6) return null;
      return { 제목: '표의 수를 눌러 보세요', 화면: <TableLab visual={visual} />, 차례: ['맨 윗줄이 무엇을 뜻하는지 읽으세요.', '문제가 묻는 칸을 눌러 짚어 보세요.'] };
    default:
      return null;
  }
};
