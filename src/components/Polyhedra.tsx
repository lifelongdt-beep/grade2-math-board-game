import type { ReactNode } from 'react';

// ════════════════════════════════════════════════════════════════════
// 각기둥·각뿔·각뿔대 겨냥도
// ────────────────────────────────────────────────────────────────────
// 꼭짓점과 면을 3차원으로 만들고, 앞쪽 조금 위에서 내려다봅니다. 면이
// 보는 쪽을 향하는지로 보이는 면을 가리고, 보이는 면에 닿은 모서리는
// 실선, 아닌 모서리는 점선으로 그립니다. 그래서 세워 두든 눕혀 두든
// 같은 규칙으로 맞게 그려집니다.
// ════════════════════════════════════════════════════════════════════

export type 다면체종류 = 'prism' | 'pyramid' | 'frustum';
type V3 = [number, number, number];
type P2 = [number, number];

const 내려봄 = (22 * Math.PI) / 180;
const 사인 = Math.sin(내려봄);
const 코사인 = Math.cos(내려봄);
// (x 오른쪽, y 위, z 앞) → 화면. 보는 쪽 방향은 (0, 사인, 코사인)입니다.
const 비춤 = ([x, y, z]: V3): P2 => [x, -y * 코사인 + z * 사인];
const 보는쪽: V3 = [0, 사인, 코사인];

const 빼기 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const 곱 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const 점곱 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export type 다면체 = { 점: V3[]; 면: Array<{ 꼭: number[]; 갈래: 'base' | 'side' }> };

/** n각기둥·n각뿔·n각뿔대입니다. 눕히면 밑면이 왼쪽과 오른쪽에 섭니다. */
export const 다면체만들기 = (종류: 다면체종류, n: number, 눕힘 = false, 비율?: number): 다면체 => {
  // 비율(옆 모서리 ÷ 밑면의 한 변)을 주면 그 비율 그대로 그립니다. 반지름 1인
  // 정다각형의 한 변은 2×sin(180°÷n)입니다.
  const 한변 = 2 * Math.sin(Math.PI / n);
  const 높이 = 비율 === undefined
    ? (종류 === 'prism' ? 1.5 : 1.7)
    : 종류 === 'prism'
      ? 비율 * 한변
      : Math.sqrt(Math.max(0.15, (비율 * 한변) ** 2 - 1));
  // 세운 것은 한 면이 정면을 똑바로 보지 않게 조금 돌립니다. 눕힌 것은
  // 한 옆면이 바닥에 닿게 돌립니다.
  const 시작 = 눕힘 ? -Math.PI / 2 - Math.PI / n : Math.PI / 2 - Math.PI / n + 0.22;
  const 각 = Array.from({ length: n }, (_, k) => 시작 + (2 * Math.PI * k) / n);
  // 눕힌 것은 그대로 두면 밑면이 옆을 똑바로 보아 선 하나로만 보입니다.
  // 오른쪽 밑면이 보는 쪽으로 오도록 세로축으로 조금 돌립니다.
  const 돌림 = -0.42;
  const 눕혀놓기 = (x: number, y: number, z: number): V3 => [x * Math.cos(돌림) + z * Math.sin(돌림), y, -x * Math.sin(돌림) + z * Math.cos(돌림)];
  const 놓기 = (t: number, h: number, r = 1): V3 => (눕힘 ? 눕혀놓기(h * 1.8, r * Math.sin(t), r * Math.cos(t)) : [r * Math.cos(t), h, r * Math.sin(t)]);
  const 아래 = 각.map((t) => 놓기(t, -높이 / 2));
  if (종류 === 'pyramid') {
    const 꼭대기: V3 = 눕힘 ? 눕혀놓기((높이 / 2) * 1.8, 0, 0) : [0, 높이 / 2, 0];
    return {
      점: [...아래, 꼭대기],
      면: [
        { 꼭: 아래.map((_, k) => k), 갈래: 'base' },
        ...아래.map((_, k) => ({ 꼭: [k, (k + 1) % n, n], 갈래: 'side' as const })),
      ],
    };
  }
  const 위 = 각.map((t) => 놓기(t, 높이 / 2, 종류 === 'frustum' ? 0.5 : 1));
  return {
    점: [...아래, ...위],
    면: [
      { 꼭: 아래.map((_, k) => k), 갈래: 'base' },
      { 꼭: 위.map((_, k) => n + k), 갈래: 'base' },
      ...아래.map((_, k) => ({ 꼭: [k, (k + 1) % n, n + ((k + 1) % n), n + k], 갈래: 'side' as const })),
    ],
  };
};

/** 면마다 보는 쪽을 향하는지입니다. 바깥을 향하는 법선으로 셉니다. */
export const 보이는면 = (d: 다면체) => {
  const 가운데 = d.점.reduce<V3>((s, p) => [s[0] + p[0] / d.점.length, s[1] + p[1] / d.점.length, s[2] + p[2] / d.점.length], [0, 0, 0]);
  return d.면.map((f) => {
    const [a, b, c] = f.꼭.map((i) => d.점[i]);
    let 법선 = 곱(빼기(b, a), 빼기(c, a));
    const 면가운데 = f.꼭.reduce<V3>((s, i) => [s[0] + d.점[i][0] / f.꼭.length, s[1] + d.점[i][1] / f.꼭.length, s[2] + d.점[i][2] / f.꼭.length], [0, 0, 0]);
    if (점곱(법선, 빼기(면가운데, 가운데)) < 0) 법선 = [-법선[0], -법선[1], -법선[2]];
    return 점곱(법선, 보는쪽) > 1e-6;
  });
};

const 선 = '#0f4c5c';
const 면색 = '#dff4f7';
const 칠색 = '#ffcc80';
const 글색 = '#bf360c';

export type 다면체그림설정 = {
  종류: 다면체종류;
  n: number;
  눕힘?: boolean;
  칠?: 'base' | 'side';
  길이?: { base?: string; lateral?: string };
  /** 옆 모서리 ÷ 밑면의 한 변. 길이를 적은 그림은 이 비율 그대로 그립니다. */
  비율?: number;
  /** 그림이 들어갈 칸 */
  x: number;
  y: number;
  w: number;
  h: number;
};

export function 다면체그림({ 종류, n, 눕힘 = false, 칠, 길이, 비율, x, y, w, h }: 다면체그림설정): ReactNode {
  const d = 다면체만들기(종류, n, 눕힘, 비율);
  const 보임 = 보이는면(d);
  const 화면 = d.점.map(비춤);
  const xs = 화면.map((p) => p[0]);
  const ys = 화면.map((p) => p[1]);
  const 여백 = 길이 ? 30 : 12;
  const k = Math.min((w - 2 * 여백) / (Math.max(...xs) - Math.min(...xs)), (h - 2 * 여백) / (Math.max(...ys) - Math.min(...ys)));
  const ox = x + w / 2 - ((Math.max(...xs) + Math.min(...xs)) / 2) * k;
  const oy = y + h / 2 - ((Math.max(...ys) + Math.min(...ys)) / 2) * k;
  const at = (i: number): P2 => [ox + 화면[i][0] * k, oy + 화면[i][1] * k];
  // 모서리마다 이웃한 면 둘을 찾아, 하나라도 보이면 실선입니다.
  const 모서리 = new Map<string, { a: number; b: number; 보: boolean }>();
  d.면.forEach((f, fi) => {
    f.꼭.forEach((a, i) => {
      const b = f.꼭[(i + 1) % f.꼭.length];
      const 열쇠 = a < b ? `${a}-${b}` : `${b}-${a}`;
      const 전 = 모서리.get(열쇠);
      모서리.set(열쇠, { a, b, 보: (전?.보 ?? false) || 보임[fi] });
    });
  });
  // 칠할 면: 보이는 것 가운데 고릅니다. 밑면이면 보이는 밑면, 옆면이면 가장 정면에 가까운 옆면.
  const 칠할 = 칠 ? d.면.findIndex((f, fi) => 보임[fi] && f.갈래 === 칠) : -1;
  const 이은 = (꼭: number[]) => 꼭.map((i) => at(i).map((v) => v.toFixed(1)).join(',')).join(' ');
  // 길이 글: 밑면의 한 변은 보이는 밑면 모서리 가운데 가장 아래 것, 옆 모서리는 보이는 것 가운데 가장 오른쪽 것.
  const 글들: ReactNode[] = [];
  if (길이) {
    const 모서리들 = [...모서리.values()].filter((e) => e.보);
    const 밑면모서리 = 모서리들.filter((e) => d.면[0].꼭.includes(e.a) && d.면[0].꼭.includes(e.b));
    const 옆모서리 = 모서리들.filter((e) => !(d.면[0].꼭.includes(e.a) && d.면[0].꼭.includes(e.b)) && !(d.면[1]?.갈래 === 'base' && d.면[1].꼭.includes(e.a) && d.면[1].꼭.includes(e.b)));
    const 가운데 = (e: { a: number; b: number }): P2 => [(at(e.a)[0] + at(e.b)[0]) / 2, (at(e.a)[1] + at(e.b)[1]) / 2];
    if (길이.base && 밑면모서리.length) {
      const e = 밑면모서리.reduce((m, o) => (가운데(o)[1] > 가운데(m)[1] ? o : m));
      const [mx, my] = 가운데(e);
      글들.push(<line key="bl" x1={at(e.a)[0]} y1={at(e.a)[1]} x2={at(e.b)[0]} y2={at(e.b)[1]} stroke={글색} strokeWidth="3" />);
      글들.push(<text key="bt" x={mx} y={my + 20} textAnchor="middle" fill={글색} fontSize="16" fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">{길이.base}</text>);
    }
    if (길이.lateral && 옆모서리.length) {
      const e = 옆모서리.reduce((m, o) => (가운데(o)[0] > 가운데(m)[0] ? o : m));
      const [mx, my] = 가운데(e);
      글들.push(<line key="ll" x1={at(e.a)[0]} y1={at(e.a)[1]} x2={at(e.b)[0]} y2={at(e.b)[1]} stroke={글색} strokeWidth="3" />);
      글들.push(<text key="lt" x={mx + 8} y={my + 5} textAnchor="start" fill={글색} fontSize="16" fontWeight="900" paintOrder="stroke" stroke="#ffffff" strokeWidth="4">{길이.lateral}</text>);
    }
  }
  return (
    <g>
      {d.면.map((f, fi) => 보임[fi] && <polygon key={`f${fi}`} points={이은(f.꼭)} fill={fi === 칠할 ? 칠색 : 면색} stroke="none" />)}
      {[...모서리.values()].filter((e) => !e.보).map((e, i) => (
        <line key={`h${i}`} x1={at(e.a)[0]} y1={at(e.a)[1]} x2={at(e.b)[0]} y2={at(e.b)[1]} stroke={선} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.75" />
      ))}
      {[...모서리.values()].filter((e) => e.보).map((e, i) => (
        <line key={`v${i}`} x1={at(e.a)[0]} y1={at(e.a)[1]} x2={at(e.b)[0]} y2={at(e.b)[1]} stroke={선} strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {글들}
    </g>
  );
}
