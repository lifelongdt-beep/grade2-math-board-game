import { useState, type ReactNode } from 'react';
import type { CompareVisual, CountersVisual, QuestionVisual, SolidShape, SolidsVisual, TenFrameVisual, TensOnesVisual } from '../types';
import { playTapSound } from '../sound';
import { CounterGlyph } from './Grade1Visuals';
import { 단추, 읽기 } from './Grade2Labs';

// ════════════════════════════════════════════════════════════════════
// 1학년 자세히 보기 — 손으로 해 보는 실험실
// ────────────────────────────────────────────────────────────────────
// 1학년 지도서는 수를 '구체물 → 그림 → 수'의 차례로 세우라고 합니다.
// 아이가 물건을 하나씩 짚어 세고, 모으고, 덜어 내고, 짝을 지어 보는
// 일이 먼저입니다. 화면에서도 그 일을 손가락으로 합니다.
//   · 물건: 하나씩 눌러 세기, 모으기, 덜어 내기, 하나씩 짝 짓기,
//           둘씩 짝 짓기, 가르기, 몇째 세기
//   · 십 배열판: 바둑돌을 옮겨 10 만들기, 빈칸 채우기, 덜어 내기, 가르기
//   · 10개씩 묶음: 10, 20, 30 … 하고 이어 세기
//   · 모양: 모양끼리 모으기, 굴려 보기, 쌓아 보기, 상자에서 꺼내 보기
//   · 비교: 한쪽 끝 맞추기, 겹쳐 보기, 시소에 올려 보기, 같은 컵에 옮겨 붓기
// 답은 말해 주지 않습니다. 해 본 결과를 아이가 읽습니다.
// ════════════════════════════════════════════════════════════════════

const 판 = { fill: '#f6fcff', stroke: '#d7edf2' };
const 글 = '#24364a';
const 진청 = '#0f7175';
const 주황 = '#ef6c00';

const 차례말 = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];

// 누른 차례대로 붙는 수 딱지입니다.
function 수딱지({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={x} cy={y} r="9" fill={주황} stroke="#ffffff" strokeWidth="1.5" />
      <text x={x} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">{n}</text>
    </g>
  );
}

// ── 셀 물건 ──────────────────────────────────────────────────────────
type 물건 = { 무리: number; k: number; icon: CountersVisual['groups'][number]['icon']; 지운것: boolean };

function CountersLab({ visual, prompt }: { visual: CountersVisual; prompt: string }) {
  const 줄 = visual.line;
  const groups = visual.groups.slice(0, 3);
  const 숨은 = groups.some((g) => g.hidden);
  const 다른것끼리 = groups.length === 2 && !visual.joiner && (groups[0].icon !== groups[1].icon || Boolean(groups[0].name && groups[1].name && groups[0].name !== groups[1].name));
  const 견주기 = 다른것끼리 && /많|적/.test(prompt);
  const 짝수홀수 = groups.length === 1 && /짝/.test(prompt);
  const 지울것 = groups.reduce((s, g) => s + (g.crossed ?? 0), 0);
  const 모을수있음 = groups.length >= 2 && !숨은 && !다른것끼리 && !지울것;
  const 가르기 = groups.length === 1 && /가를/.test(prompt) && !지울것;
  const 하나더 = groups.length === 1 && /1만큼 더 큰/.test(prompt);
  const [모양, set모양] = useState<'처음' | '모음' | '짝' | '둘씩'>('처음');
  const [지움, set지움] = useState(false);
  const [센, set센] = useState<string[]>([]);
  const [칸막이, set칸막이] = useState<number | null>(null);
  const [더놓음, set더놓음] = useState(false);
  const [쪽, set쪽] = useState<'왼쪽' | '오른쪽' | null>(null);
  const cell = 34;
  const pad = 16;

  // ── 몇째 세기 ─────────────────────────────────────────────────────
  if (줄) {
    const g = groups[0];
    const n = Math.min(g.count, 10);
    const W = pad * 2 + 52 * 2 + n * cell;
    const H = 96;
    const 자리 = (k: number) => pad + 52 + k * cell + cell / 2;
    const 센수 = 센.length;
    const 순서 = (k: number) => (쪽 === '오른쪽' ? n - 1 - k : k);
    const 표시 = 줄.marks[0];
    const 다음 = () => {
      if (!쪽 || 센수 >= n) return;
      playTapSound();
      set센((v) => [...v, String(v.length)]);
    };
    const 닿음 = 쪽 !== null && 표시 !== undefined && 센수 > 순서(표시);
    return (
      <div className="g3-lab">
        <div className="g3-lab-stage">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
            <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
            <text x={pad + 24} y="58" textAnchor="middle" fill={쪽 === '왼쪽' ? 주황 : '#56708a'} fontSize="13" fontWeight="900">왼쪽</text>
            <text x={W - pad - 24} y="58" textAnchor="middle" fill={쪽 === '오른쪽' ? 주황 : '#56708a'} fontSize="13" fontWeight="900">오른쪽</text>
            {Array.from({ length: n }, (_, k) => {
              const 차례 = 순서(k);
              const 셈 = 쪽 !== null && 차례 < 센수;
              return (
                <g key={k} style={{ cursor: 쪽 ? 'pointer' : 'default' }} onClick={다음}>
                  {줄.marks.includes(k) && <circle cx={자리(k)} cy="54" r="15" fill="#fff4bd" stroke="#f0a500" strokeWidth="2" />}
                  <CounterGlyph icon={g.icon} x={자리(k)} y={54} />
                  {셈 && (
                    <text x={자리(k)} y="26" textAnchor="middle" fill={주황} fontSize="11" fontWeight="900" style={{ animation: 'g1-pop 0.35s ease' }}>
                      {차례말[차례]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="g3-lab-buttons">
          <단추 on={쪽 === '왼쪽'} onClick={() => { set쪽('왼쪽'); set센([]); }}>👈 왼쪽부터 세기</단추>
          <단추 on={쪽 === '오른쪽'} onClick={() => { set쪽('오른쪽'); set센([]); }}>오른쪽부터 세기 👉</단추>
          {쪽 && <단추 onClick={다음} disabled={센수 >= n}>👆 하나 세기</단추>}
        </div>
        <읽기>
          {!쪽
            ? <>어느 쪽부터 셀지 먼저 고르세요. 문제에 ‘왼쪽에서’인지 ‘오른쪽에서’인지 쓰여 있어요.</>
            : 센수 === 0
              ? <>{쪽} 끝부터 하나씩 눌러 ‘첫째, 둘째, …’ 하고 세어 보세요.</>
              : <>{쪽}부터 <strong>{차례말[센수 - 1]}</strong>까지 셌어요.{닿음 ? ' 색칠한 것까지 왔어요!' : ''}</>}
        </읽기>
      </div>
    );
  }

  // ── 물건 늘어놓기 ──────────────────────────────────────────────────
  const 물건들: 물건[] = [];
  groups.forEach((g, gi) => {
    if (g.hidden) return;
    const 지울 = g.count - (g.crossed ?? 0);
    for (let k = 0; k < g.count; k += 1) 물건들.push({ 무리: gi, k, icon: g.icon, 지운것: k >= 지울 });
  });
  if (하나더 && 더놓음) 물건들.push({ 무리: 0, k: groups[0].count, icon: groups[0].icon, 지운것: false });
  const perRow = 가르기 ? Math.min(groups[0].count, 10) : 모양 === '처음' ? Math.min(visual.perRow ?? 5, 8) : 5;
  const 무리넓이 = groups.map((g, gi) => {
    const 수 = g.hidden ? 2 : g.count + (하나더 && 더놓음 && gi === 0 ? 1 : 0);
    return Math.max(1, Math.min(수, perRow)) * cell;
  });
  const 이음 = visual.joiner ? 38 : 26;
  const 처음줄수 = Math.max(1, ...groups.map((g) => (g.hidden ? 1 : Math.ceil((g.count + (하나더 && 더놓음 ? 1 : 0)) / perRow))));
  const 무리시작 = 무리넓이.map((_, gi) => pad + 무리넓이.slice(0, gi).reduce((s, w) => s + w + 이음, 0));
  const 남은것들 = 물건들.filter((m) => !m.지운것);

  const 자리 = (m: 물건, 순번: number): { x: number; y: number } => {
    // 순번은 늘어놓은 차례입니다. 한데 모을 때만 씁니다.
    if (모양 === '모음') {
      return { x: pad + (순번 % 5) * cell + cell / 2, y: 22 + Math.floor(순번 / 5) * cell + cell / 2 };
    }
    if (모양 === '짝') {
      return { x: pad + 70 + m.k * cell + cell / 2, y: m.무리 === 0 ? 34 : 34 + cell + 34 };
    }
    if (모양 === '둘씩') {
      return { x: pad + Math.floor(m.k / 2) * (cell + 8) + cell / 2, y: 26 + (m.k % 2) * cell + cell / 2 };
    }
    if (지움 && m.지운것) {
      const 지운순번 = m.k - (groups[m.무리].count - (groups[m.무리].crossed ?? 0));
      return { x: pad + 80 + 지운순번 * (cell - 4) + cell / 2, y: 22 + 처음줄수 * cell + 40 };
    }
    const 칸막이밀기 = 가르기 && 칸막이 !== null && m.k > 칸막이 ? 22 : 0;
    return {
      x: 무리시작[m.무리] + (m.k % perRow) * cell + cell / 2 + 칸막이밀기,
      y: 22 + Math.floor(m.k / perRow) * cell + cell / 2,
    };
  };

  const 넓이들 = [
    무리시작[groups.length - 1] + 무리넓이[groups.length - 1] + pad + (가르기 ? 24 : 0),
    모양 === '짝' ? pad + 70 + Math.max(...groups.map((g) => g.count)) * cell + pad : 0,
    지움 ? pad + 80 + 지울것 * (cell - 4) + pad + 10 : 0,
  ];
  const W = Math.max(200, ...넓이들);
  const H = 모양 === '짝'
    ? 34 + cell + 34 + 34
    : 모양 === '모음'
      ? 22 + Math.ceil(남은것들.length / 5) * cell + 28
      : 모양 === '둘씩'
        ? 26 + 2 * cell + 26
        : 22 + 처음줄수 * cell + (지움 || 지울것 ? 64 : 22) + (groups.some((g) => g.name) ? 10 : 0);

  const 누르기 = (id: string, m: 물건) => {
    if (가르기 && 모양 === '처음') {
      playTapSound();
      set칸막이(m.k === 칸막이 ? null : m.k);
      return;
    }
    if (m.지운것 && 지움) return;
    if (센.includes(id)) return;
    playTapSound();
    set센((v) => [...v, id]);
  };

  // 하나씩 짝 짓기: 짝이 없는 것을 찾습니다.
  const 적은수 = groups.length === 2 ? Math.min(groups[0].count, groups[1].count) : 0;

  const 모으기글 = visual.joiner === '-' ? '' : '모으기';
  const 읽을말: ReactNode = (() => {
    if (모양 === '짝') return <>위아래로 하나씩 짝을 지었어요. <strong>짝이 없이 남은 것</strong>이 있는 쪽이 더 많아요. 남은 것이 몇 개인지 세어 보세요.</>;
    if (모양 === '둘씩') {
      const n = groups[0].count;
      return <>둘씩 짝을 지었어요. {n % 2 === 0 ? '남는 것이 없어요.' : <strong>하나가 짝 없이 남았어요.</strong>} 남는 것이 없으면 짝수, 하나 남으면 홀수예요.</>;
    }
    if (가르기 && 칸막이 !== null) {
      const 왼 = 칸막이 + 1;
      return <>왼쪽 <strong>{왼}</strong>개, 오른쪽 <strong>{groups[0].count - 왼}</strong>개로 갈랐어요.</>;
    }
    if (가르기) return <>물건 하나를 누르면 그 뒤에 칸막이가 생겨 둘로 갈라져요. 문제의 수만큼 왼쪽에 남기고 갈라 보세요.</>;
    if (센.length) return <>하나씩 짚어 <strong>{센.length}</strong>까지 셌어요. 마지막에 센 수가 모두의 수예요.</>;
    if (지움) return <>덜어 낸 것은 아래로 옮겼어요. 위에 <strong>남은 것</strong>을 하나씩 눌러 세어 보세요.</>;
    if (모양 === '모음') return <>한데 모았어요. 이제 처음부터 하나씩 눌러 세어 보세요.</>;
    if (하나더 && 더놓음) return <>하나를 더 놓았어요. 모두 몇인지 하나씩 눌러 세어 보세요.</>;
    return <>물건을 하나씩 눌러 보세요. 누른 차례대로 수가 붙어요.</>;
  })();

  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label} style={{ transition: 'all 0.5s' }}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {모양 === '처음' && groups.map((g, gi) => (
            <g key={`n${gi}`}>
              {g.hidden && (
                <g>
                  <rect x={무리시작[gi] + 4} y="24" width={무리넓이[gi] - 8} height={처음줄수 * cell - 4} rx="8" fill="#fff4bd" stroke="#f0a500" strokeWidth="2" strokeDasharray="5 4" />
                  <text x={무리시작[gi] + 무리넓이[gi] / 2} y={22 + (처음줄수 * cell) / 2 + 8} textAnchor="middle" fill={글} fontSize="22" fontWeight="900">?</text>
                </g>
              )}
              {g.name && <text x={무리시작[gi] + 무리넓이[gi] / 2} y={22 + 처음줄수 * cell + 16} textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="800">{g.name}</text>}
              {gi < groups.length - 1 && (visual.joiner
                ? <text x={무리시작[gi] + 무리넓이[gi] + 이음 / 2} y={22 + (처음줄수 * cell) / 2 + 8} textAnchor="middle" fill={진청} fontSize="22" fontWeight="900">{visual.joiner}</text>
                : <line x1={무리시작[gi] + 무리넓이[gi] + 이음 / 2} y1="22" x2={무리시작[gi] + 무리넓이[gi] + 이음 / 2} y2={22 + 처음줄수 * cell} stroke="#cfe3ea" strokeWidth="2" strokeDasharray="4 4" />)}
            </g>
          ))}
          {모양 === '짝' && groups.map((g, gi) => (
            <text key={`p${gi}`} x={pad + 60} y={(gi === 0 ? 34 : 34 + cell + 34) + 5} textAnchor="end" fill="#56708a" fontSize="13" fontWeight="900">{g.name ?? ''}</text>
          ))}
          {모양 === '짝' && Array.from({ length: 적은수 }, (_, k) => (
            <line key={`l${k}`} x1={pad + 70 + k * cell + cell / 2} y1={34 + 14} x2={pad + 70 + k * cell + cell / 2} y2={34 + cell + 34 - 14} stroke={진청} strokeWidth="2.5" style={{ animation: `g1-fade 0.4s ease ${0.5 + k * 0.08}s both` }} />
          ))}
          {모양 === '짝' && groups.map((g, gi) => g.count > 적은수 && (
            <rect key={`r${gi}`} x={pad + 70 + 적은수 * cell + 2} y={(gi === 0 ? 34 : 34 + cell + 34) - cell / 2 + 1} width={(g.count - 적은수) * cell - 4} height={cell - 2} rx="8" fill="none" stroke={주황} strokeWidth="2.5" strokeDasharray="6 4" style={{ animation: 'g1-fade 0.4s ease 0.9s both' }} />
          ))}
          {모양 === '둘씩' && Array.from({ length: Math.floor(groups[0].count / 2) }, (_, c) => (
            <rect key={`d${c}`} x={pad + c * (cell + 8) + 1} y="27" width={cell - 2} height={2 * cell - 2} rx="10" fill="none" stroke={진청} strokeWidth="2" style={{ animation: `g1-fade 0.4s ease ${0.6 + c * 0.05}s both` }} />
          ))}
          {모양 === '둘씩' && groups[0].count % 2 === 1 && (
            <circle cx={pad + Math.floor(groups[0].count / 2) * (cell + 8) + cell / 2} cy={26 + cell / 2} r="16" fill="none" stroke={주황} strokeWidth="3" style={{ animation: 'g1-fade 0.4s ease 1s both' }} />
          )}
          {지움 && 모양 === '처음' && (
            <text x={pad + 4} y={22 + 처음줄수 * cell + 45} fill="#d32f2f" fontSize="12" fontWeight="900">덜어 낸 것</text>
          )}
          {가르기 && 칸막이 !== null && 칸막이 < groups[0].count - 1 && (() => {
            const p = 자리({ 무리: 0, k: 칸막이, icon: groups[0].icon, 지운것: false }, 칸막이);
            return <line x1={p.x + cell / 2 + 11} y1="16" x2={p.x + cell / 2 + 11} y2={22 + 처음줄수 * cell + 4} stroke={주황} strokeWidth="3" strokeDasharray="6 4" />;
          })()}
          {물건들.map((m) => {
            const id = `${m.무리}-${m.k}`;
            const { x, y } = 자리(m, 물건들.indexOf(m));
            const 순서 = 센.indexOf(id);
            const 새것 = 하나더 && m.k === groups[0].count;
            return (
              <g key={id} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.7s ease', cursor: 'pointer' }} onClick={() => 누르기(id, m)}>
                <circle cx="0" cy="0" r="16" fill="transparent" />
                <g style={{ opacity: 지움 && m.지운것 ? 0.45 : 1, transition: 'opacity 0.5s' }}>
                  <CounterGlyph icon={m.icon} x={0} y={0} />
                </g>
                {새것 && <circle cx="0" cy="0" r="15" fill="none" stroke={주황} strokeWidth="2" strokeDasharray="4 3" />}
                {m.지운것 && <path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#d32f2f" strokeWidth="2.6" strokeLinecap="round" />}
                {순서 >= 0 && <수딱지 x={11} y={-12} n={순서 + 1} />}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {모을수있음 && 모으기글 && <단추 on={모양 === '모음'} onClick={() => { set모양(모양 === '모음' ? '처음' : '모음'); set센([]); }}>{모양 === '모음' ? '처음으로' : '🤲 한데 모으기'}</단추>}
        {지울것 > 0 && <단추 on={지움} onClick={() => { set지움((v) => !v); set센([]); }}>{지움 ? '되돌리기' : '✋ 덜어 내기'}</단추>}
        {견주기 && <단추 on={모양 === '짝'} onClick={() => { set모양(모양 === '짝' ? '처음' : '짝'); set센([]); }}>{모양 === '짝' ? '처음으로' : '🔗 하나씩 짝 지어 보기'}</단추>}
        {짝수홀수 && <단추 on={모양 === '둘씩'} onClick={() => { set모양(모양 === '둘씩' ? '처음' : '둘씩'); set센([]); }}>{모양 === '둘씩' ? '처음으로' : '👫 둘씩 짝 짓기'}</단추>}
        {하나더 && <단추 on={더놓음} onClick={() => { set더놓음((v) => !v); set센([]); }}>{더놓음 ? '되돌리기' : '➕ 하나 더 놓기'}</단추>}
        <단추 onClick={() => { set센([]); set칸막이(null); }} disabled={!센.length && 칸막이 === null}>다시 세기</단추>
      </div>
      <읽기>{읽을말}</읽기>
    </div>
  );
}

// ── 십 배열판 ────────────────────────────────────────────────────────
const 돌색 = { teal: { fill: '#26a69a', stroke: '#00796b' }, orange: { fill: '#ffa726', stroke: '#e65100' } };

function TenFrameLab({ visual, prompt }: { visual: TenFrameVisual; prompt: string }) {
  const frames = Math.max(1, Math.min(visual.frames, 2));
  const 칸수 = frames * 10;
  const 청록수 = visual.fills.filter((f) => f.color === 'teal').reduce((s, f) => s + f.count, 0);
  const 주황수 = visual.fills.filter((f) => f.color === 'orange').reduce((s, f) => s + f.count, 0);
  const 지울수 = visual.crossed ?? 0;
  const 옮기기 = 주황수 > 0 && 청록수 + 주황수 <= 칸수;
  const 가르기 = !옮기기 && !지울수 && /가를/.test(prompt);
  const [옮긴, set옮긴] = useState(0);
  const [지운, set지운] = useState(0);
  const [더, set더] = useState<number[]>([]);
  const [칸막이, set칸막이] = useState<number | null>(null);
  const cell = 34;
  const frameW = cell * 5;
  const gap = 20;
  const W = Math.max(320, 32 + frames * frameW + (frames - 1) * gap);
  const left = (W - (frames * frameW + (frames - 1) * gap)) / 2;
  const 판아래 = 14 + cell * 2;
  const 쟁반 = 옮기기 || 지울수 > 0;
  const H = 판아래 + (쟁반 ? 66 : 14);
  const 칸자리 = (i: number) => {
    const f = Math.floor(i / 10);
    const w = i % 10;
    return { x: left + f * (frameW + gap) + (w % 5) * cell + cell / 2, y: 14 + Math.floor(w / 5) * cell + cell / 2 };
  };
  const 쟁반칸 = Math.min(28, (W - 110) / Math.max(1, 옮기기 ? 주황수 : 지울수));
  const 쟁반자리 = (j: number) => ({ x: 92 + j * 쟁반칸, y: 판아래 + 34 });
  // 바둑돌마다 지금 있을 자리입니다.
  type 돌 = { id: string; color: 'teal' | 'orange'; x: number; y: number; 빠짐?: boolean };
  const 돌들: 돌[] = [];
  const 전체 = 옮기기 ? 청록수 : Math.min(청록수 + 주황수, 칸수);
  for (let i = 0; i < 전체; i += 1) {
    const color = 옮기기 ? 'teal' : 가르기 && 칸막이 !== null ? (i <= 칸막이 ? 'teal' : 'orange') : i < 청록수 ? 'teal' : 'orange';
    const 지울차례 = 전체 - 1 - i;
    const 빠짐 = 지울수 > 0 && 지울차례 < 지운;
    돌들.push({ id: `t${i}`, color, ...(빠짐 ? 쟁반자리(지울차례) : 칸자리(i)), 빠짐 });
  }
  if (옮기기) {
    for (let j = 0; j < 주황수; j += 1) {
      const 들어감 = j < 옮긴;
      돌들.push({ id: `o${j}`, color: 'orange', ...(들어감 ? 칸자리(청록수 + j) : 쟁반자리(j)) });
    }
  }
  const 찬칸 = new Set(Array.from({ length: 옮기기 ? 청록수 + 옮긴 : 전체 }, (_, i) => i));
  const 첫판참 = 옮기기 && 청록수 + 옮긴 >= 10;
  const 하나옮기기 = () => {
    if (옮긴 >= 주황수) return;
    playTapSound();
    set옮긴((v) => v + 1);
  };
  const 빈칸누르기 = (i: number) => {
    if (옮기기 || 지울수 || 가르기 || 찬칸.has(i)) return;
    playTapSound();
    set더((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]));
  };
  const 읽을말: ReactNode = 옮기기
    ? 옮긴 === 0
      ? <>아래 주황 바둑돌을 하나씩 판의 빈칸으로 옮겨 보세요. 앞의 판부터 꽉 채워요.</>
      : 첫판참 && 청록수 < 10
        ? <>{청록수}에 {10 - 청록수}개를 옮기니 <strong>10</strong>이 되었어요!{옮긴 > 10 - 청록수 ? <> 그다음에 <strong>{옮긴 - (10 - 청록수)}</strong>개를 더 옮겼어요.</> : ''}{옮긴 < 주황수 ? ' 남은 것도 옮겨 보세요.' : ' 10과 몇인지 세어 보세요.'}</>
        : <>{청록수}에 {옮긴}개를 옮겼어요.{옮긴 < 주황수 ? ' 계속 옮겨 보세요.' : ' 판에 있는 바둑돌을 세어 보세요.'}</>
    : 지울수
      ? 지운 === 0
        ? <>‘하나 덜어 내기’를 누르면 뒤에서부터 하나씩 판 밖으로 옮겨요.</>
        : <><strong>{지운}</strong>개를 덜어 냈어요.{지운 < 지울수 ? ' 계속 덜어 내 보세요.' : ' 판에 남은 바둑돌을 세어 보세요.'}</>
      : 가르기
        ? 칸막이 === null
          ? <>바둑돌 하나를 누르면 거기까지가 한 덩이, 나머지가 다른 덩이가 돼요.</>
          : <>초록 <strong>{칸막이 + 1}</strong>개와 주황 <strong>{전체 - 칸막이 - 1}</strong>개로 갈랐어요.</>
        : 더.length
          ? <>바둑돌을 <strong>{더.length}</strong>개 더 놓았어요. 모두 {전체 + 더.length}개예요.{전체 + 더.length === 10 ? ' 판이 꽉 찼어요 — 10이에요!' : ''}</>
          : <>빈칸을 눌러 바둑돌을 더 놓아 보세요. 판이 꽉 차면 10이에요.</>;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {Array.from({ length: 칸수 }, (_, i) => {
            const { x, y } = 칸자리(i);
            const 첫판 = 첫판참 && i < 10;
            return (
              <g key={i} style={{ cursor: !옮기기 && !지울수 && !가르기 && !찬칸.has(i) ? 'pointer' : 'default' }} onClick={() => 빈칸누르기(i)}>
                <rect x={x - cell / 2} y={y - cell / 2} width={cell} height={cell} fill={첫판 ? '#fff3e0' : '#ffffff'} stroke="#41607a" strokeWidth="1.6" style={{ transition: 'fill 0.4s' }} />
                {더.includes(i) && <circle cx={x} cy={y} r="12" fill="#fff59d" stroke="#f9a825" strokeWidth="2" strokeDasharray="4 3" style={{ animation: 'g1-pop 0.3s ease' }} />}
              </g>
            );
          })}
          {첫판참 && <rect x={left - 3} y="11" width={frameW + 6} height={cell * 2 + 6} rx="4" fill="none" stroke={주황} strokeWidth="3" style={{ animation: 'g1-fade 0.4s ease' }} />}
          {쟁반 && (
            <g>
              <rect x="12" y={판아래 + 14} width={W - 24} height="40" rx="10" fill="#eceff1" stroke="#b0bec5" strokeDasharray="5 4" />
              <text x="20" y={판아래 + 39} fill="#56708a" fontSize="12" fontWeight="900">{옮기기 ? '옮길 것' : '덜어 낸 것'}</text>
            </g>
          )}
          {돌들.map((d, k) => (
            <g key={d.id}
              style={{ transform: `translate(${d.x}px, ${d.y}px)`, transition: 'transform 0.6s ease', cursor: (옮기기 && d.color === 'orange') || 가르기 ? 'pointer' : 'default' }}
              onClick={() => {
                if (옮기기 && d.color === 'orange') 하나옮기기();
                if (가르기) { playTapSound(); set칸막이(k === 칸막이 ? null : k); }
              }}>
              <circle cx="0" cy="0" r="12" fill={돌색[d.color].fill} stroke={돌색[d.color].stroke} strokeWidth="1.6" style={{ transition: 'fill 0.3s' }} />
              {d.빠짐 && <path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#d32f2f" strokeWidth="2.4" strokeLinecap="round" />}
            </g>
          ))}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {옮기기 && <단추 onClick={하나옮기기} disabled={옮긴 >= 주황수}>👆 하나 옮기기</단추>}
        {지울수 > 0 && <단추 onClick={() => set지운((v) => Math.min(지울수, v + 1))} disabled={지운 >= 지울수}>✋ 하나 덜어 내기</단추>}
        <단추 onClick={() => { set옮긴(0); set지운(0); set더([]); set칸막이(null); }} disabled={!옮긴 && !지운 && !더.length && 칸막이 === null}>다시 하기</단추>
      </div>
      <읽기>{읽을말}</읽기>
    </div>
  );
}

// ── 10개씩 묶음과 낱개 ──────────────────────────────────────────────
function TensOnesLab({ visual }: { visual: TensOnesVisual }) {
  const tens = Math.max(0, Math.min(visual.tens, 9));
  const ones = Math.max(0, Math.min(visual.ones, 9));
  const [센, set센] = useState(0);
  const cube = 12;
  const 묶음칸 = cube + 12;
  const 묶음넓이 = Math.max(1, tens) * 묶음칸;
  const 낱개넓이 = Math.max(2, Math.ceil(ones / 5)) * 묶음칸;
  const W = Math.max(300, 40 + 묶음넓이 + 44 + 낱개넓이);
  const top = 30;
  const H = top + cube * 10 + 40;
  const 낱개시작 = 20 + 묶음넓이 + 44;
  const 끝 = tens + ones;
  const 지금수 = 센 <= tens ? 센 * 10 : tens * 10 + (센 - tens);
  const 다음 = () => {
    if (센 >= 끝) return;
    playTapSound();
    set센((v) => v + 1);
  };
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {Array.from({ length: tens }, (_, t) => {
            const 켬 = t < 센;
            return (
              <g key={t} style={{ cursor: 'pointer', transform: 켬 ? 'translateY(-4px)' : 'none', transition: 'transform 0.3s' }} onClick={다음}>
                {Array.from({ length: 10 }, (_, k) => (
                  <rect key={k} x={20 + t * 묶음칸} y={top + k * cube} width={cube} height={cube} fill={켬 ? '#ffcc80' : '#4dd0e1'} stroke={켬 ? 주황 : '#00838f'} strokeWidth="1" style={{ transition: 'fill 0.3s' }} />
                ))}
                {켬 && <text x={20 + t * 묶음칸 + cube / 2} y={top - 8} textAnchor="middle" fill={주황} fontSize="12" fontWeight="900" style={{ animation: 'g1-pop 0.3s ease' }}>{(t + 1) * 10}</text>}
              </g>
            );
          })}
          {Array.from({ length: ones }, (_, k) => {
            const 켬 = tens + k < 센;
            const x = 낱개시작 + Math.floor(k / 5) * 묶음칸;
            const y = top + cube * 10 - (5 - (k % 5)) * (cube + 6);
            return (
              <g key={`o${k}`} style={{ cursor: 'pointer' }} onClick={다음}>
                <rect x={x} y={y} width={cube} height={cube} fill={켬 ? '#ffcc80' : '#ffb74d'} stroke="#e65100" strokeWidth={켬 ? 2.2 : 1} />
                {켬 && <text x={x + cube + 3} y={y + 10} fill={주황} fontSize="11" fontWeight="900" style={{ animation: 'g1-pop 0.3s ease' }}>{tens * 10 + k + 1}</text>}
              </g>
            );
          })}
          <line x1={낱개시작 - 22} y1={top} x2={낱개시작 - 22} y2={top + cube * 10} stroke="#cfe3ea" strokeWidth="2" strokeDasharray="4 4" />
          <text x={20 + 묶음넓이 / 2} y={H - 12} textAnchor="middle" fill={진청} fontSize="12" fontWeight="900">10개씩 묶음</text>
          <text x={낱개시작 + 낱개넓이 / 2 - 6} y={H - 12} textAnchor="middle" fill={진청} fontSize="12" fontWeight="900">낱개</text>
        </svg>
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={다음} disabled={센 >= 끝}>{센 < tens ? '👆 10씩 세기' : '👆 하나씩 세기'}</단추>
        <단추 onClick={() => set센(0)} disabled={센 === 0}>다시 세기</단추>
      </div>
      <읽기>
        {센 === 0
          ? <>묶음부터 눌러 보세요. 묶음 하나는 10개라서 ‘10, 20, 30 …’ 하고 셀 수 있어요.</>
          : <>지금까지 <strong>{지금수}</strong>{센 === 끝 ? ' — 다 셌어요!' : 센 === tens && ones ? ' — 이제 낱개를 하나씩 이어 세어요.' : ''}</>}
      </읽기>
    </div>
  );
}

// ── 상자·둥근기둥·공 모양 ───────────────────────────────────────────
const 모양이름: Record<SolidShape, string> = { box: '상자 모양', cylinder: '둥근기둥 모양', sphere: '공 모양' };

function 입체({ shape, cx, base }: { shape: SolidShape; cx: number; base: number }) {
  if (shape === 'box') {
    const w = 46;
    const h = 36;
    const d = 14;
    const x = cx - (w + d) / 2;
    const y = base - h;
    return (
      <g stroke="#41607a" strokeWidth="1.6" strokeLinejoin="round">
        <polygon points={`${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`} fill="#ffe0b2" />
        <polygon points={`${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}`} fill="#ffcc80" />
        <rect x={x} y={y} width={w} height={h} fill="#fff3e0" />
      </g>
    );
  }
  if (shape === 'cylinder') {
    const rx = 21;
    const ry = 7;
    const h = 42;
    return (
      <g stroke="#41607a" strokeWidth="1.6">
        <path d={`M${cx - rx} ${base - h} L${cx - rx} ${base} A${rx} ${ry} 0 0 0 ${cx + rx} ${base} L${cx + rx} ${base - h}`} fill="#c8e6c9" />
        <ellipse cx={cx} cy={base - h} rx={rx} ry={ry} fill="#e8f5e9" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={cx} cy={base - 23} r="23" fill="#bbdefb" stroke="#41607a" strokeWidth="1.6" />
      <ellipse cx={cx - 8} cy={base - 32} rx="6" ry="4" fill="#ffffff" opacity="0.85" />
      <path d={`M${cx - 23} ${base - 23} Q${cx} ${base - 12} ${cx + 23} ${base - 23}`} fill="none" stroke="#1e88e5" strokeWidth="1.4" />
    </g>
  );
}

const 윗면높이: Record<SolidShape, number> = { box: 50, cylinder: 46, sphere: 46 };

function SolidsLab({ visual }: { visual: SolidsVisual }) {
  const items = visual.items.slice(0, 6);
  const 상자속 = items.length === 1 && items[0].peek;
  const 이름있음 = items.some((i) => i.name);
  const [놀이, set놀이] = useState<{ 할것: '굴리기' | '쌓기'; 번: number } | null>(null);
  const [모음, set모음] = useState<number[]>([]);
  const [꺼냄, set꺼냄] = useState(false);
  const slot = 84;
  const W = Math.max(300, 24 + items.length * slot);
  const base = 104;
  const 통있음 = !상자속 && !이름있음;
  const H = base + (이름있음 ? 30 : 12) + (통있음 ? 96 : 0) + (상자속 ? 10 : 0);
  const 통들: SolidShape[] = ['box', 'cylinder', 'sphere'];
  const 통넓이 = (W - 32) / 3;
  const 통자리 = (s: SolidShape, 차례: number) => {
    const b = 통들.indexOf(s);
    const 칸 = Math.min(34, (통넓이 - 30) / 4);
    return { x: 16 + b * 통넓이 + 28 + (차례 % 4) * 칸, y: base + 88 };
  };
  const 애니 = (shape: SolidShape) => {
    if (!놀이) return undefined;
    return 놀이.할것 === '굴리기' ? `g1-roll-${shape} 1.8s ease-in-out forwards` : undefined;
  };
  const 모은수 = (s: SolidShape) => 모음.filter((k) => items[k].shape === s).length;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          <line x1="12" y1={base} x2={W - 12} y2={base} stroke="#b0bec5" strokeWidth="2" />
          {통있음 && 통들.map((s, b) => (
            <g key={s}>
              <rect x={16 + b * 통넓이 + 4} y={base + 30} width={통넓이 - 8} height="62" rx="10" fill="#eef7f7" stroke="#9fc9c9" strokeDasharray="5 4" />
              <text x={16 + b * 통넓이 + 통넓이 / 2} y={base + 24} textAnchor="middle" fill={진청} fontSize="12" fontWeight="900">{모양이름[s]} {모은수(s) ? `${모은수(s)}개` : ''}</text>
            </g>
          ))}
          {items.map((item, k) => {
            const cx = 12 + k * slot + slot / 2;
            const 모은차례 = 모음.indexOf(k);
            const 갈곳 = 모은차례 >= 0 ? 통자리(item.shape, 모음.filter((j, n) => n < 모은차례 && items[j].shape === item.shape).length) : null;
            const 옮김 = 갈곳 ? `translate(${갈곳.x - cx}px, ${갈곳.y - base}px) scale(0.62)` : 'none';
            return (
              <g key={`${k}-${놀이?.번 ?? 0}`} style={{ cursor: 통있음 ? 'pointer' : 'default' }}
                onClick={() => { if (!통있음 || 모은차례 >= 0) return; playTapSound(); set모음((v) => [...v, k]); }}>
                <g style={{ transform: 옮김, transformOrigin: `${cx}px ${base}px`, transformBox: 'view-box', transition: 'transform 0.7s ease' }}>
                  <g style={{ animation: 애니(item.shape), transformOrigin: item.shape === 'sphere' ? `${cx}px ${base - 25}px` : `${cx}px ${base - 2}px`, transformBox: 'view-box' }}>
                    {item.active && <rect x={cx - slot / 2 + 4} y="10" width={slot - 8} height={base - 6} rx="10" fill="#fff4bd" stroke="#f0a500" strokeWidth="2" />}
                    <입체 shape={item.shape} cx={cx} base={base - 2} />
                  </g>
                  {/* 쌓아 보기: 작은 상자를 위에 올립니다. 공 위에서는 굴러떨어집니다. */}
                  {놀이?.할것 === '쌓기' && (
                    <g style={{ animation: `${item.shape === 'sphere' ? 'g1-fall' : 'g1-drop'} 1.6s ease-in forwards`, transformBox: 'fill-box', transformOrigin: 'center' }}>
                      <rect x={cx - 12} y={base - 2 - 윗면높이[item.shape] - 16} width="24" height="16" rx="2" fill="#ef9a9a" stroke="#c62828" strokeWidth="1.5" />
                    </g>
                  )}
                </g>
                {상자속 && (
                  <g style={{ transform: 꺼냄 ? 'translateY(70px)' : 'none', opacity: 꺼냄 ? 0.15 : 1, transition: 'all 0.8s ease' }}>
                    <rect x={cx - 44} y={base - 34} width="88" height="36" rx="4" fill="#a1887f" stroke="#5d4037" strokeWidth="1.6" />
                    <text x={cx} y={base - 11} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">상자</text>
                  </g>
                )}
                {item.name && <text x={cx} y={base + 22} textAnchor="middle" fill={글} fontSize="15" fontWeight="900">{item.name}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="g3-lab-buttons">
        {상자속 && <단추 on={꺼냄} onClick={() => set꺼냄((v) => !v)}>{꺼냄 ? '다시 넣기' : '📦 꺼내 보기'}</단추>}
        {!상자속 && <단추 onClick={() => set놀이({ 할것: '굴리기', 번: (놀이?.번 ?? 0) + 1 })}>🎳 굴려 보기</단추>}
        {!상자속 && <단추 onClick={() => set놀이({ 할것: '쌓기', 번: (놀이?.번 ?? 0) + 1 })}>🧱 위에 쌓아 보기</단추>}
        {통있음 && <단추 onClick={() => set모음([])} disabled={!모음.length}>다시 놓기</단추>}
      </div>
      <읽기>
        {상자속
          ? 꺼냄
            ? <>꺼내 보니 이런 모양이었어요. 평평한 곳, 뾰족한 곳, 둥근 곳이 어디인지 보세요.</>
            : <>보이는 윗부분만 보고 어떤 모양일지 생각한 다음, 꺼내 보세요.</>
          : 놀이?.할것 === '굴리기'
            ? <>공 모양은 어느 쪽으로도 잘 굴러가요. 둥근기둥 모양은 <strong>눕히면</strong> 굴러가요. 상자 모양은 굴러가지 않아요.</>
            : 놀이?.할것 === '쌓기'
              ? <>평평한 부분이 위에 있으면 그 위에 쌓을 수 있어요. 공 모양 위에서는 <strong>굴러떨어져요</strong>.</>
              : 통있음
                ? <>모양을 하나씩 누르면 같은 모양끼리 아래 통에 모여요. 굴리거나 쌓아 볼 수도 있어요.</>
                : <>‘굴려 보기’와 ‘위에 쌓아 보기’를 눌러 모양마다 어떻게 되는지 보세요.</>}
      </읽기>
    </div>
  );
}

// ── 비교하기 ─────────────────────────────────────────────────────────
const 비교색 = ['#ef9a9a', '#90caf9', '#a5d6a7', '#ffe082'];
const 비교선 = ['#c62828', '#1565c0', '#2e7d32', '#c99400'];

function CompareLab({ visual }: { visual: CompareVisual }) {
  const items = visual.items.slice(0, 4);
  const 가장 = Math.max(...items.map((i) => i.size), 1);
  const [맞춤, set맞춤] = useState(false);
  const [저울, set저울] = useState<number[]>([]);
  const [단계, set단계] = useState(0);
  const [기준, set기준] = useState<number | null>(null);
  const W = 360;

  if (visual.mode === 'length') {
    const 어긋남 = [34, 0, 58, 18];
    const rowH = 40;
    const H = 24 + items.length * rowH;
    const barMax = 230;
    return (
      <div className="g3-lab">
        <div className="g3-lab-stage">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
            <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
            {맞춤 && <line x1="60" y1="8" x2="60" y2={H - 8} stroke={주황} strokeWidth="2.5" strokeDasharray="5 4" style={{ animation: 'g1-fade 0.4s ease 0.6s both' }} />}
            {items.map((item, k) => {
              const y = 16 + k * rowH;
              const w = Math.max(20, (item.size / 가장) * barMax);
              const dx = 맞춤 ? 0 : 어긋남[k % 어긋남.length];
              return (
                <g key={k}>
                  <text x="40" y={y + 18} textAnchor="end" fill={글} fontSize="15" fontWeight="900">{item.name}</text>
                  <g style={{ transform: `translateX(${dx}px)`, transition: 'transform 0.8s ease' }}>
                    <rect x="60" y={y + 4} width={w - 12} height="20" rx="4" fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" />
                    <polygon points={`${48 + w},${y + 4} ${60 + w},${y + 14} ${48 + w},${y + 24}`} fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" strokeLinejoin="round" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="g3-lab-buttons">
          <단추 on={맞춤} onClick={() => set맞춤((v) => !v)}>{맞춤 ? '흩어 놓기' : '📏 한쪽 끝 맞추기'}</단추>
        </div>
        <읽기>{맞춤 ? <>왼쪽 끝을 맞추었어요. 이제 <strong>오른쪽 끝</strong>만 보면 어느 것이 더 길고 짧은지 알 수 있어요.</> : <>끝이 맞지 않으면 길이를 견줄 수 없어요. ‘한쪽 끝 맞추기’를 눌러 보세요.</>}</읽기>
      </div>
    );
  }

  if (visual.mode === 'area') {
    const box = 120;
    const H = 200;
    const 큰차례 = items.map((_, k) => k).sort((a, b) => items[b].size - items[a].size);
    const 흩자리 = (k: number) => 16 + k * ((W - 32) / items.length);
    return (
      <div className="g3-lab">
        <div className="g3-lab-stage">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
            <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
            {큰차례.map((k) => {
              const item = items[k];
              const side = Math.max(18, Math.sqrt(item.size / 가장) * (맞춤 ? box + 40 : Math.min(box, (W - 40) / items.length - 8)));
              const x = 맞춤 ? 30 : 흩자리(k) + 4;
              const y = 맞춤 ? 20 : H - 40 - side;
              return (
                <g key={k} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.8s ease' }}>
                  <rect x="0" y="0" width={side} height={side} rx="3" fill={비교색[k]} fillOpacity="0.9" stroke={비교선[k]} strokeWidth="2" style={{ transition: 'width 0.8s, height 0.8s' }} />
                  <text x={맞춤 ? side - 6 : side / 2} y={맞춤 ? side - 6 : side + 22} textAnchor={맞춤 ? 'end' : 'middle'} fill={글} fontSize="15" fontWeight="900">{item.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="g3-lab-buttons">
          <단추 on={맞춤} onClick={() => set맞춤((v) => !v)}>{맞춤 ? '나란히 놓기' : '🟥 겹쳐 보기'}</단추>
        </div>
        <읽기>{맞춤 ? <>한 귀퉁이를 맞추어 겹쳤어요. <strong>남는 부분이 있는 것</strong>이 더 넓어요. 다른 것에 다 덮이는 것이 더 좁아요.</> : <>넓이는 겹쳐 보면 견줄 수 있어요. ‘겹쳐 보기’를 눌러 보세요.</>}</읽기>
      </div>
    );
  }

  if (visual.mode === 'weight') {
    const H = 200;
    const [왼, 오] = 저울;
    const 기욺 = 왼 === undefined || 오 === undefined ? 0 : items[왼].size === items[오].size ? 0 : items[왼].size > items[오].size ? 12 : -12;
    const cx = W / 2;
    const py = 120;
    const 접시 = (k: number | undefined, side: -1 | 1) => {
      const 각 = (-기욺 * Math.PI) / 180;
      const x = cx + side * 100 * Math.cos(각);
      const y = py + side * 100 * Math.sin(각) + 30;
      return (
        <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.7s ease' }}>
          <path d="M -36 0 L 0 -30 L 36 0" fill="none" stroke="#90a4ae" strokeWidth="1.4" />
          <path d="M -40 0 Q 0 14 40 0" fill="#eceff1" stroke="#41607a" strokeWidth="2" />
          {k !== undefined && (
            <g style={{ cursor: 'pointer' }} onClick={() => { playTapSound(); set저울((v) => v.filter((j) => j !== k)); }}>
              <rect x="-26" y="-34" width="52" height="32" rx="6" fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" />
              <text x="0" y="-12" textAnchor="middle" fill={글} fontSize="14" fontWeight="900">{items[k].name}</text>
            </g>
          )}
        </g>
      );
    };
    return (
      <div className="g3-lab">
        <div className="g3-lab-stage">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
            <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
            {items.map((item, k) => {
              const 올림 = 저울.includes(k);
              return (
                <g key={k} style={{ cursor: 올림 ? 'default' : 'pointer', opacity: 올림 ? 0.25 : 1 }} onClick={() => { if (올림 || 저울.length >= 2) return; playTapSound(); set저울((v) => [...v, k]); }}>
                  <rect x={20 + k * 80} y="14" width="56" height="34" rx="6" fill={비교색[k]} stroke={비교선[k]} strokeWidth="1.5" />
                  <text x={48 + k * 80} y="37" textAnchor="middle" fill={글} fontSize="15" fontWeight="900">{item.name}</text>
                </g>
              );
            })}
            <polygon points={`${cx},${py} ${cx - 18},${H - 14} ${cx + 18},${H - 14}`} fill="#90a4ae" stroke="#455a64" strokeWidth="1.5" />
            <g style={{ transform: `rotate(${-기욺}deg)`, transformOrigin: `${cx}px ${py}px`, transformBox: 'view-box', transition: 'transform 0.7s ease' }}>
              <rect x={cx - 110} y={py - 4} width="220" height="8" rx="4" fill="#8d6e63" stroke="#5d4037" />
            </g>
            {접시(왼, -1)}
            {접시(오, 1)}
          </svg>
        </div>
        <div className="g3-lab-buttons">
          <단추 onClick={() => set저울([])} disabled={!저울.length}>시소 비우기</단추>
        </div>
        <읽기>
          {저울.length < 2
            ? <>위의 물건을 두 개 눌러 시소에 올려 보세요. 올린 물건을 누르면 내려와요.</>
            : 기욺 === 0
              ? <>시소가 기울지 않았어요. 두 물건의 무게가 같아요.</>
              : <>시소가 <strong>{items[기욺 > 0 ? 왼! : 오!].name}</strong> 쪽으로 내려갔어요. 내려간 쪽이 더 무거워요. 다른 짝도 올려 보세요.</>}
        </읽기>
      </div>
    );
  }

  // 담을 수 있는 양: 그릇마다 물을 가득 담아 똑같은 컵에 옮겨 붓습니다.
  // 물의 양: 같은 그릇이므로 물의 높이를 한 줄로 견줍니다.
  const H = visual.mode === 'capacity' ? 280 : 170;
  const slotW = (W - 24) / items.length;
  const base = 128;
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
          <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" {...판} />
          {items.map((item, k) => {
            const cx = 12 + k * slotW + slotW / 2;
            const scale = visual.mode === 'capacity' ? 0.45 + 0.55 * (item.size / 가장) : 1;
            const w = 56 * Math.sqrt(scale);
            const h = 92 * scale;
            const 물 = visual.mode === 'water' ? (item.size / 가장) * h * 0.9 : 단계 >= 1 && 단계 < 2 ? h - 2 : 0;
            // 똑같은 컵에 옮겨 부으면 물의 높이가 담을 수 있는 양에 비례합니다.
            const 컵물 = 단계 >= 2 ? (item.size / 가장) * 90 : 0;
            return (
              <g key={k} style={{ cursor: visual.mode === 'water' ? 'pointer' : 'default' }} onClick={() => { if (visual.mode !== 'water') return; playTapSound(); set기준(k); }}>
                <rect x={cx - w / 2 + 2} y={base - 물} width={w - 4} height={물} fill="#81d4fa" style={{ transition: 'all 0.8s ease' }} />
                <path d={`M${cx - w / 2} ${base - h} L${cx - w / 2} ${base} L${cx + w / 2} ${base} L${cx + w / 2} ${base - h}`} fill="none" stroke="#41607a" strokeWidth="2.2" strokeLinejoin="round" />
                <text x={cx} y={base + 22} textAnchor="middle" fill={글} fontSize="15" fontWeight="900">{item.name}</text>
                {visual.mode === 'capacity' && (
                  <g style={{ opacity: 단계 >= 2 ? 1 : 0.25, transition: 'opacity 0.5s' }}>
                    <rect x={cx - 16 + 2} y={base + 140 - 컵물} width="28" height={컵물} fill="#81d4fa" style={{ transition: 'all 0.9s ease 0.2s' }} />
                    <path d={`M${cx - 16} ${base + 40} L${cx - 16} ${base + 140} L${cx + 16} ${base + 140} L${cx + 16} ${base + 40}`} fill="none" stroke="#41607a" strokeWidth="2" />
                  </g>
                )}
              </g>
            );
          })}
          {visual.mode === 'water' && 기준 !== null && (() => {
            const 높이 = (items[기준].size / 가장) * 92 * 0.9;
            return <line x1="12" x2={W - 12} y1={base - 높이} y2={base - 높이} stroke={주황} strokeWidth="2.5" strokeDasharray="6 4" style={{ transition: 'all 0.5s' }} />;
          })()}
          {visual.mode === 'capacity' && 단계 >= 2 && (
            <text x={W / 2} y={base + 40 - 8} textAnchor="middle" fill="#56708a" fontSize="12" fontWeight="900">똑같은 컵에 옮겨 부었어요</text>
          )}
        </svg>
      </div>
      {visual.mode === 'capacity' && (
        <div className="g3-lab-buttons">
          <단추 on={단계 === 1} onClick={() => set단계(1)}>💧 물 가득 담기</단추>
          <단추 on={단계 === 2} onClick={() => set단계(2)} disabled={단계 < 1}>🥤 같은 컵에 옮겨 붓기</단추>
          <단추 onClick={() => set단계(0)} disabled={단계 === 0}>비우기</단추>
        </div>
      )}
      <읽기>
        {visual.mode === 'water'
          ? 기준 === null
            ? <>그릇 하나를 눌러 보세요. 그 물의 높이에 줄을 그어 다른 그릇과 견줄 수 있어요.</>
            : <>{items[기준].name}의 물 높이에 줄을 그었어요. 줄보다 <strong>위로 올라온</strong> 그릇은 물이 더 많고, 아래면 더 적어요.</>
          : 단계 === 0
            ? <>그릇의 크기만 보고는 헷갈릴 수 있어요. 물을 가득 담아 보세요.</>
            : 단계 === 1
              ? <>그릇마다 물을 가득 담았어요. 이제 똑같은 컵에 옮겨 부어 보세요.</>
              : <>똑같은 컵에 옮기니 물의 높이가 달라요. <strong>물이 높이 올라온</strong> 컵의 그릇이 더 많이 담을 수 있어요.</>}
      </읽기>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
export type 일학년실험 = { 제목: string; 화면: ReactNode; 차례: string[] };

export const 무엇을해볼까_1학년 = (visual: QuestionVisual | undefined, prompt = ''): 일학년실험 | null => {
  if (!visual) return null;
  switch (visual.kind) {
    case 'counters': {
      if (visual.line) return { 제목: '하나씩 눌러 몇째인지 세어 보세요', 화면: <CountersLab visual={visual} prompt={prompt} />, 차례: ['어느 쪽부터 셀지 먼저 정해요.', '첫째, 둘째, … 하고 하나씩 짚어요.'] };
      const groups = visual.groups.slice(0, 3);
      if (!groups.length || groups.some((g) => !g.hidden && g.count > 20)) return null;
      const 짝 = groups.length === 2 && /많|적/.test(prompt) && !visual.joiner;
      return {
        제목: 짝 ? '하나씩 짝 지어 견주어 보세요' : /짝/.test(prompt) ? '둘씩 짝을 지어 보세요' : '하나씩 눌러 세어 보세요',
        화면: <CountersLab visual={visual} prompt={prompt} />,
        차례: 짝 ? ['위아래로 하나씩 짝을 지어요.', '짝 없이 남는 쪽이 더 많아요.'] : ['하나씩 짚으며 빠뜨리지 않고 세요.', '마지막에 센 수가 모두의 수예요.'],
      };
    }
    case 'ten-frame':
      return { 제목: '바둑돌을 옮겨 10을 만들어 보세요', 화면: <TenFrameLab visual={visual} prompt={prompt} />, 차례: ['십 배열판 한 판은 10칸이에요.', '빈칸이 몇 개인지 보면 10이 되려면 몇 개 더 있어야 하는지 알 수 있어요.'] };
    case 'tens-ones':
      return { 제목: '10씩 세고 낱개를 이어 세어 보세요', 화면: <TensOnesLab visual={visual} />, 차례: ['10개씩 묶음은 10, 20, 30 … 하고 세어요.', '낱개는 하나씩 이어 세어요.'] };
    case 'solids':
      return { 제목: '모양을 굴리고 쌓아 보세요', 화면: <SolidsLab visual={visual} />, 차례: ['평평한 부분, 둥근 부분, 뾰족한 부분을 찾아요.', '굴러가는지, 쌓을 수 있는지 해 보아요.'] };
    case 'compare': {
      const 제목 = { length: '한쪽 끝을 맞추어 보세요', area: '겹쳐서 견주어 보세요', weight: '시소에 올려 보세요', capacity: '물을 담아 옮겨 부어 보세요', water: '물의 높이를 견주어 보세요' }[visual.mode];
      return { 제목, 화면: <CompareLab visual={visual} />, 차례: ['두 물건을 직접 대어 보거나 겹쳐 보아요.', '‘더’, ‘가장’을 붙여 말해요.'] };
    }
    default:
      return null;
  }
};
