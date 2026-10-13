import { useState } from 'react';
import type { SymmetryDrawVisual } from '../types';
import { 단추, 읽기 } from './Grade2Labs';
import { resolveParticles } from '../data/grade5/util';

// ════════════════════════════════════════════════════════════════════
// 모눈 위에서 합동·대칭인 도형을 그리는 과정
// ────────────────────────────────────────────────────────────────────
// 5-2 3단원은 '나머지 부분을 그릴 수 있다'가 목표입니다. 그리는 과정을
// 묻는 문항은 모눈이 있어야 칸을 세어 확인할 수 있습니다.
//   · 선대칭: 대칭축(세로 점선)과 오른쪽 반쪽
//   · 점대칭: 대칭의 중심(빨간 점)과 위쪽 반쪽
//   · 합동: 왼쪽 도형과 오른쪽에 옮겨 그리는 중인 도형
// 고를 자리는 ○와 가·나·다·라로, 아이가 찍은 점은 파란 점으로 그립니다.
// ════════════════════════════════════════════════════════════════════

const 칸 = 24;
const 여백 = 22;
const 선색 = '#24364a';
const 축색 = '#e53935';
const 파랑 = '#1e88e5';
const 주황 = '#ef6c00';
// 글자가 선 위에 놓여도 읽히도록 흰 테두리를 두릅니다.
const 테두리 = { stroke: '#fff', strokeWidth: 3, paintOrder: 'stroke' as const };

type 점 = [number, number];

/** 꼭짓점 하나의 대응점입니다. copy는 첫 꼭짓점을 옮긴 만큼 옮깁니다. */
export const 대응점자리 = (visual: SymmetryDrawVisual, p: 점): 점 => {
  if (visual.mode === 'line') return [2 * visual.axisX! - p[0], p[1]];
  if (visual.mode === 'point') return [2 * visual.center![0] - p[0], 2 * visual.center![1] - p[1]];
  const 첫 = visual.drawn![0].at;
  return [p[0] + 첫[0] - visual.shape[0][0], p[1] + 첫[1] - visual.shape[0][1]];
};

/** 그려야 할 대응점이 있는 꼭짓점(선대칭에서 축 위의 점은 저 자신이 대응점입니다) */
const 옮길꼭짓점 = (visual: SymmetryDrawVisual) =>
  visual.shape.map((p, at) => ({ p, at })).filter(({ p }) => (visual.mode === 'line' ? p[0] !== visual.axisX : true));

export function SymmetryDrawGraphic({ visual, 단계 = 0 }: { visual: SymmetryDrawVisual; 단계?: number }) {
  const W = visual.cols * 칸 + 여백 * 2;
  const H = visual.rows * 칸 + 여백 * 2;
  const X = (x: number) => 여백 + x * 칸;
  const Y = (y: number) => 여백 + y * 칸;
  const 모든점 = [...visual.shape, ...visual.shape.map((p) => 대응점자리(visual, p))];
  const 가운데: 점 = visual.mode === 'copy'
    ? [visual.shape.reduce((s, p) => s + p[0], 0) / visual.shape.length, visual.shape.reduce((s, p) => s + p[1], 0) / visual.shape.length]
    : [모든점.reduce((s, p) => s + p[0], 0) / 모든점.length, 모든점.reduce((s, p) => s + p[1], 0) / 모든점.length];
  const 이름자리 = (p: 점, 기준: 점 = 가운데): 점 => {
    const dx = p[0] - 기준[0];
    const dy = p[1] - 기준[1];
    const 길이 = Math.hypot(dx, dy) || 1;
    return [X(p[0]) + (dx / 길이) * 12, Y(p[1]) + (dy / 길이) * 12 + 4];
  };
  const 꺾은선 = (ps: 점[], 닫기 = false) => ps.map((p, k) => `${k ? 'L' : 'M'}${X(p[0])},${Y(p[1])}`).join(' ') + (닫기 ? ' Z' : '');
  const 보조선 = visual.guides || 단계 >= 1;
  const 옮길것 = 옮길꼭짓점(visual);
  const 대응 = visual.shape.map((p) => 대응점자리(visual, p));
  // 완성한 도형: 선대칭·점대칭은 반쪽과 그 대응을 거꾸로 이어 닫습니다.
  const 완성 = visual.mode === 'copy' ? 대응 : [...visual.shape, ...[...대응].reverse()];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {Array.from({ length: visual.cols + 1 }, (_, t) => (
        <line key={`v${t}`} x1={X(t)} y1={Y(0)} x2={X(t)} y2={Y(visual.rows)} stroke="#cfe3ea" strokeWidth="1" />
      ))}
      {Array.from({ length: visual.rows + 1 }, (_, t) => (
        <line key={`h${t}`} x1={X(0)} y1={Y(t)} x2={X(visual.cols)} y2={Y(t)} stroke="#cfe3ea" strokeWidth="1" />
      ))}
      {visual.mode === 'line' && (
        <g>
          <line x1={X(visual.axisX!)} y1={Y(0) - 8} x2={X(visual.axisX!)} y2={Y(visual.rows) + 8} stroke={축색} strokeWidth="2" strokeDasharray="6 4" />
          <text x={X(visual.axisX!) - 5} y={Y(0) - 8} textAnchor="end" fill={축색} fontSize="10" fontWeight="800" {...테두리}>대칭축</text>
        </g>
      )}
      {/* 보조선: 선대칭은 축에 수직인 선, 점대칭은 중심을 지나는 선, 합동은 옮긴 화살표 */}
      {보조선 && visual.mode !== 'copy' && 옮길것.map(({ p, at }) => (
        <line key={`g${at}`} x1={X(p[0])} y1={Y(p[1])} x2={X(대응[at][0])} y2={Y(대응[at][1])} stroke="#8e9aaf" strokeWidth="1.4" strokeDasharray="3 3" />
      ))}
      {visual.mode === 'copy' && 단계 >= 1 && (단계 === 1 ? visual.shape.slice(0, 1) : visual.shape).map((p, at) => (
        <line key={`c${at}`} x1={X(p[0])} y1={Y(p[1])} x2={X(대응[at][0])} y2={Y(대응[at][1])} stroke="#8e9aaf" strokeWidth="1.4" strokeDasharray="3 3" markerEnd="url(#sd-arrow)" />
      ))}
      <defs>
        <marker id="sd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#8e9aaf" />
        </marker>
      </defs>
      <path d={꺾은선(visual.shape, visual.mode === 'copy')} fill={visual.mode === 'copy' ? 'rgba(77,208,225,0.25)' : 'none'} stroke={선색} strokeWidth="2.4" strokeLinejoin="round" />
      {visual.drawnPath && <path d={꺾은선(visual.drawnPath)} fill="none" stroke={파랑} strokeWidth="2.2" strokeLinejoin="round" />}
      {(visual.candidates ?? []).map((c, k) => (
        <g key={`k${k}`}>
          <circle cx={X(c.at[0])} cy={Y(c.at[1])} r="9" fill="#fff" stroke="#6a1b9a" strokeWidth="2" />
          <text x={X(c.at[0])} y={Y(c.at[1]) + 4} textAnchor="middle" fill="#6a1b9a" fontSize="11" fontWeight="900">{c.name}</text>
        </g>
      ))}
      {/* 자세히 보기에서 바르게 그린 결과 */}
      {단계 >= 3 && <path d={꺾은선(완성, true)} fill="rgba(239,108,0,0.12)" stroke={주황} strokeWidth="2.2" strokeLinejoin="round" />}
      {단계 >= 2 && (visual.mode === 'copy' ? visual.shape.map((p, at) => ({ p, at })) : 옮길것).map(({ at }) => (
        <g key={`m${at}`}>
          <circle cx={X(대응[at][0])} cy={Y(대응[at][1])} r="5" fill={주황} />
        </g>
      ))}
      {visual.mode === 'point' && (
        <g>
          <circle cx={X(visual.center![0])} cy={Y(visual.center![1])} r="4.5" fill={축색} />
          <text x={X(visual.center![0]) + 6} y={Y(visual.center![1]) + 14} fill={축색} fontSize="10" fontWeight="800" {...테두리}>대칭의 중심</text>
        </g>
      )}
      {visual.shape.map((p, at) => {
        // 대칭축 위의 꼭짓점은 이름을 축 오른쪽에 둡니다(축 글자·점선과 겹치지 않게).
        const [tx, ty] = visual.mode === 'line' && p[0] === visual.axisX ? [X(p[0]) + 11, Y(p[1]) + 4] : 이름자리(p);
        return (
          <g key={`s${at}`}>
            <circle cx={X(p[0])} cy={Y(p[1])} r="3.5" fill={선색} />
            <text x={tx} y={ty} textAnchor="middle" fill={선색} fontSize="12" fontWeight="900" {...테두리}>{visual.names[at]}</text>
          </g>
        );
      })}
      {(visual.drawn ?? []).map((d, k) => {
        const [tx, ty] = 이름자리(d.at, visual.mode === 'copy' ? 대응점자리(visual, 가운데) : 가운데);
        return (
          <g key={`d${k}`}>
            <circle cx={X(d.at[0])} cy={Y(d.at[1])} r="4" fill={파랑} />
            <text x={tx} y={ty} textAnchor="middle" fill={파랑} fontSize="12" fontWeight="900" {...테두리}>{d.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

const 방향말 = (dx: number, dy: number) =>
  [dx ? `${dx > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(dx)}칸` : '', dy ? `${dy > 0 ? '아래' : '위'}로 ${Math.abs(dy)}칸` : '']
    .filter(Boolean)
    .join(', ');

export function SymmetryDrawLab({ visual }: { visual: SymmetryDrawVisual }) {
  const [단계, set단계] = useState(0);
  const 첫단추 = visual.mode === 'line' ? '① 대칭축에 수직인 선 긋기' : visual.mode === 'point' ? '① 중심을 지나는 선 긋기' : '① 옮긴 칸 세기';
  const 둘째단추 = visual.mode === 'copy' ? '② 다른 꼭짓점도 똑같이 옮기기' : '② 같은 거리에 점 찍기';
  const 읽을말 = (() => {
    if (단계 === 0) return '단추를 차례대로 눌러 그리는 과정을 따라가 보세요.';
    if (visual.mode === 'copy') {
      const 첫 = visual.drawn![0].at;
      const 말 = 방향말(첫[0] - visual.shape[0][0], 첫[1] - visual.shape[0][1]);
      if (단계 === 1) return `점 ${visual.names[0]}에서 점 ${visual.drawn![0].name}까지 ${말} 옮겼어요.`;
      if (단계 === 2) return `다른 꼭짓점도 똑같이 ${말} 옮겨 점을 찍어요.`;
      return '찍은 점을 차례로 이으면 처음 도형과 합동인 도형이 돼요.';
    }
    const 하나 = 옮길꼭짓점(visual)[0];
    if (!하나) return '';
    const p = 하나.p;
    if (visual.mode === 'line') {
      const 거리 = Math.abs(p[0] - visual.axisX!);
      if (단계 === 1) return `점 ${visual.names[하나.at]}에서 대칭축까지 ${거리}칸이에요. 다른 꼭짓점도 칸을 세어 보세요.`;
      if (단계 === 2) return `대칭축에서 반대쪽으로 같은 칸 수(점 ${visual.names[하나.at]}은(는) ${거리}칸)만큼 가서 점을 찍어요.`;
      return '대응점을 차례로 이으면 선대칭도형이 완성돼요.';
    }
    const c = visual.center!;
    if (단계 === 1) return `점 ${visual.names[하나.at]}에서 중심까지 ${방향말(c[0] - p[0], c[1] - p[1])} 가요.`;
    if (단계 === 2) return `중심에서 같은 방향으로 한 번 더 ${방향말(c[0] - p[0], c[1] - p[1])} 가서 점을 찍어요.`;
    return '대응점을 차례로 이으면 점대칭도형이 완성돼요.';
  })();
  return (
    <div className="g3-lab">
      <div className="g3-lab-stage">
        <SymmetryDrawGraphic visual={visual} 단계={단계} />
      </div>
      <div className="g3-lab-buttons">
        <단추 onClick={() => set단계(1)} on={단계 >= 1}>{첫단추}</단추>
        <단추 onClick={() => set단계(2)} on={단계 >= 2} disabled={단계 < 1}>{둘째단추}</단추>
        <단추 onClick={() => set단계(3)} on={단계 >= 3} disabled={단계 < 2}>③ 차례로 잇기</단추>
        {단계 > 0 && <단추 onClick={() => set단계(0)}>처음부터</단추>}
      </div>
      <읽기>{resolveParticles(읽을말)}</읽기>
    </div>
  );
}
