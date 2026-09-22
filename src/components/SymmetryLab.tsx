import { useMemo, useState } from 'react';
import type { QuestionVisual } from '../types';
import { FIGURE_POINTS } from './QuestionVisualGraphic';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 합동과 대칭 실험실 — 접어 보고, 돌려 보고, 포개어 보는 자리
// ────────────────────────────────────────────────────────────────────
// 지도서 5-2 각론2가 이 단원에서 되풀이해 말하는 것은 하나입니다.
// '구체적 조작 활동'입니다.
//
//   4차시 "준비물 6 을 이용하여 도형이 완전히 겹치도록 접어 보면서
//          도형의 의미와 대칭축을 이해하게 한다"
//   2차시 "오려낸 두 사각형을 포개어 완전히 겹치는지 확인하고"
//   7차시 "꼭짓점을 대칭의 중심을 기준으로 180° 이동시켜 대응점을
//          찾아보도록 한 후"
//
// 교실에서는 종이를 접습니다. 화면에서는 접을 종이가 없으니, 접는
// 일을 그대로 보여 주는 수밖에 없습니다. 그림을 크게만 보여 주는 것과
// 접어 보는 것은 다릅니다 — 크게 보여 주면 아이는 여전히 '어느
// 꼭짓점이 어느 꼭짓점과 겹치는지'를 머릿속으로 상상해야 합니다.
// 그 상상이 안 되는 아이를 위해 있는 것이 이 도움말입니다.
//
// 답은 말해 주지 않습니다. 손잡이를 끌어 도형이 포개지는 것을 보고,
// 겹친 자리를 아이가 스스로 읽습니다. 이름표는 도형을 따라 함께
// 움직이므로, 다 접히면 두 이름이 같은 자리에 놓입니다.
//
// 지도서가 이름 붙여 경고한 오개념도 여기서 함께 답니다 —
//   4차시 "선대칭도형을 처음 배울 때 학생들이 선대칭도형은 대칭축이
//          1개라는 오개념을 가질 수 있다."
// 그래서 '접는 선 찾기'는 아이가 선을 아무 각도로나 돌려 보게 하고,
// 접히는 선을 찾을 때마다 세어 둡니다. 정오각형에서 다섯 개를 찾고
// 나면 '하나뿐'이라는 생각은 남지 않습니다.
// ════════════════════════════════════════════════════════════════════

type 점 = [number, number];

type 도형항목 = {
  shape: string;
  rotate?: number;
  flip?: boolean;
  scale?: number;
  vertexLabels?: string[];
  axes?: string[];
  center?: boolean;
  points?:점[];
};

type 실험 =
  | { 갈래: '포개기'; 왼쪽: 도형항목; 오른쪽: 도형항목 }
  | { 갈래: '접기'; 도형: 도형항목; 축각도: number }
  | { 갈래: '돌리기'; 도형: 도형항목 }
  | { 갈래: '접는선찾기'; 도형: 도형항목 };

/** 도형의 밑점입니다. 문항이 꼭짓점을 직접 준 경우 그것을 씁니다. */
const 밑점 = (item: 도형항목): 점[] =>
  item.points ?? FIGURE_POINTS[item.shape] ?? FIGURE_POINTS.정사각형;

/** 그림에 그려진 대로의 점입니다(뒤집기·돌리기·크기까지 먹인 것). */
const 그려진점 = (item: 도형항목): 점[] => {
  const radians = ((item.rotate ?? 0) * Math.PI) / 180;
  const 배 = item.scale ?? 1;
  return 밑점(item).map(([x, y]) => {
    const fx = item.flip ? -x : x;
    return [
      (fx * Math.cos(radians) - y * Math.sin(radians)) * 배,
      (fx * Math.sin(radians) + y * Math.cos(radians)) * 배,
    ] as 점;
  });
};

const 가운데 = (pts: 점[]): 점 => [
  pts.reduce((sum, [x]) => sum + x, 0) / pts.length,
  pts.reduce((sum, [, y]) => sum + y, 0) / pts.length,
];

/** 이름 붙은 축을 각도(도)로 바꿉니다. 0도가 세로선입니다. */
const 축각도 = (name: string): number => {
  if (name === 'horizontal') return 90;
  if (name === 'diagonal') return 45;
  if (name === 'anti-diagonal') return -45;
  return 0;
};

// ── 무엇을 해 볼 수 있는 그림인가 ──────────────────────────────────
//
// 도형이 여럿이어도 모양이 서로 다르면('정사각형을 찾으면?') 포갤
// 것이 없습니다. 같은 모양이 둘 있고 한쪽이 돌려져 있거나 뒤집혀
// 있을 때에만 포개어 볼 거리가 생깁니다.
export const 무엇을해볼까 = (visual: QuestionVisual | undefined): 실험 | null => {
  if (visual?.kind !== 'figure-set') return null;
  const items = (visual as unknown as { items: 도형항목[] }).items ?? [];
  if (!items.length) return null;

  for (let a = 0; a < items.length; a += 1) {
    for (let b = a + 1; b < items.length; b += 1) {
      const 하나 = items[a];
      const 둘 = items[b];
      if (하나.shape !== 둘.shape) continue;
      if ((하나.scale ?? 1) !== (둘.scale ?? 1)) continue;
      const 돌아갔나 = ((둘.rotate ?? 0) - (하나.rotate ?? 0)) % 360 !== 0;
      const 뒤집혔나 = Boolean(하나.flip) !== Boolean(둘.flip);
      if (돌아갔나 || 뒤집혔나) return { 갈래: '포개기', 왼쪽: 하나, 오른쪽: 둘 };
    }
  }

  if (items.length !== 1) return null;
  const 하나 = items[0];
  if (하나.axes?.length) return { 갈래: '접기', 도형: 하나, 축각도: 축각도(하나.axes[0]) };
  if (하나.center) return { 갈래: '돌리기', 도형: 하나 };
  return { 갈래: '접는선찾기', 도형: 하나 };
};

// ── 그리기에 쓰는 공통 조각 ────────────────────────────────────────

// 이름표는 꼭짓점에서 바깥으로 0.26배만큼 더 밀려 나가므로, 도형이
// 판을 꽉 채우면 이름이 잘립니다. 두 도형을 나란히 놓는 '포개기'에서
// 오른쪽 도형의 ㅁ과 ㅇ이 실제로 잘렸습니다. 판을 넓히고 도형을
// 줄여 이름까지 들어오게 합니다.
const 판너비 = 340;
const 판높이 = 240;
const 반지름 = 62;

const 화면으로 = ([x, y]: 점, cx: number, cy: number): 점 => [cx + x * 반지름, cy + y * 반지름];

// 이름표를 꼭짓점에서 얼마나 바깥으로 미느냐입니다. 포개진 뒤에는
// 두 이름이 한 꼭짓점에 겹쳐 읽을 수 없게 되므로, 움직이는 쪽 이름을
// 조금 더 바깥으로 밀어 나란히 놓습니다.
function 도형그리기({
  pts,
  labels,
  cx,
  cy,
  진하게,
  색,
  밀기 = 0.26,
}: {
  pts: 점[];
  labels?: string[];
  cx: number;
  cy: number;
  진하게?: boolean;
  색: string;
  밀기?: number;
}) {
  const 화면점 = pts.map((p) => 화면으로(p, cx, cy));
  const 중심 = 가운데(화면점);
  return (
    <g>
      <polygon
        points={화면점.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill={진하게 ? 'rgba(15, 113, 117, 0.16)' : 'rgba(255, 255, 255, 0.82)'}
        stroke={색}
        strokeWidth={진하게 ? 3.5 : 3}
        strokeLinejoin="round"
      />
      {labels?.map((label, at) => {
        const [x, y] = 화면점[at] ?? 중심;
        return (
          <text
            key={`${label}-${at}`}
            x={x + (x - 중심[0]) * 밀기}
            y={y + (y - 중심[1]) * 밀기 + 5}
            textAnchor="middle"
            fill={색}
            fontSize="15"
            fontWeight="900"
          >
            {label}
          </text>
        );
      })}
    </g>
  );
}

/** 손잡이 줄입니다. 끝까지 끌면 도형이 다 포개집니다. */
function 손잡이({
  값,
  바꾸기,
  이름,
  왼쪽말,
  오른쪽말,
}: {
  값: number;
  바꾸기: (다음: number) => void;
  이름: string;
  왼쪽말: string;
  오른쪽말: string;
}) {
  return (
    <div className="symmetry-slider">
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(값 * 100)}
        aria-label={이름}
        onChange={(event) => 바꾸기(Number(event.target.value) / 100)}
      />
      <div className="symmetry-slider-ends">
        <span>{왼쪽말}</span>
        <span>{오른쪽말}</span>
      </div>
    </div>
  );
}

// ── 포개어 보기 ────────────────────────────────────────────────────
//
// 지도서 2차시가 "오려낸 두 사각형을 포개어 완전히 겹치는지 확인"
// 하라고 합니다. 오른쪽 도형이 왼쪽으로 미끄러져 가면서, 돌려진
// 만큼 제자리로 돌고, 뒤집혀 있으면 뒤집힙니다. 이름표가 따라가므로
// 다 포개지면 두 이름이 같은 꼭짓점에 놓입니다.

function 포개어보기({ 왼쪽, 오른쪽 }: { 왼쪽: 도형항목; 오른쪽: 도형항목 }) {
  const [t, setT] = useState(0);
  const 왼쪽가운데 = 판너비 * 0.27;
  const 오른쪽가운데 = 판너비 * 0.73;
  const cy = 판높이 * 0.46;

  const 왼쪽점 = useMemo(() => 그려진점(왼쪽), [왼쪽]);

  // 오른쪽 도형을 왼쪽 도형의 자리로 옮겨 놓습니다. 돌아간 각도는
  // 왼쪽 도형의 각도까지 되돌리고, 뒤집힘이 다르면 가로로 -1까지
  // 줄여 실제로 뒤집히는 것처럼 보이게 합니다.
  const 시작각 = 오른쪽.rotate ?? 0;
  const 끝각 = 왼쪽.rotate ?? 0;
  const 뒤집기필요 = Boolean(오른쪽.flip) !== Boolean(왼쪽.flip);

  const 지금각 = (시작각 + (끝각 - 시작각) * t) * (Math.PI / 180);
  const 가로배 = 뒤집기필요 ? 1 - 2 * t : 1;
  const cx = 오른쪽가운데 + (왼쪽가운데 - 오른쪽가운데) * t;
  const 배 = 오른쪽.scale ?? 1;

  const 움직이는점 = 밑점(오른쪽).map(([x, y]) => {
    const fx = (오른쪽.flip ? -x : x) * 가로배;
    return [
      (fx * Math.cos(지금각) - y * Math.sin(지금각)) * 배,
      (fx * Math.sin(지금각) + y * Math.cos(지금각)) * 배,
    ] as 점;
  });

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="두 도형을 포개어 보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        <도형그리기 pts={왼쪽점} labels={왼쪽.vertexLabels} cx={왼쪽가운데} cy={cy} 색="#41607a" />
        <도형그리기
          pts={움직이는점}
          labels={오른쪽.vertexLabels}
          cx={cx}
          cy={cy}
          진하게
          색="#0f7175"
          밀기={0.26 + 0.3 * t}
        />
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="오른쪽 도형을 왼쪽 도형 위로 옮기기"
        왼쪽말="떨어져 있음"
        오른쪽말={뒤집기필요 ? '뒤집어 포개기' : '포개기'}
      />
      <p className="symmetry-say">
        {t > 0.99
          ? '다 포개졌습니다. 한 꼭짓점에 놓인 두 이름을 읽어 보세요.'
          : '손잡이를 오른쪽 끝까지 끌어 보세요.'}
      </p>
    </div>
  );
}

// ── 접어 보기 ──────────────────────────────────────────────────────
//
// 접는 것을 옆에서 보면, 접히는 쪽 점은 접는 선에서 떨어진 거리가
// d → d·cos(각) 으로 줄었다가 반대쪽 -d 에 닿습니다. 그대로 씁니다.
// 화면에서 종이가 정말 넘어가는 것처럼 보입니다.
//
// 다만 '꼭짓점만' 넘기면 안 됩니다. 직사각형을 세로 가운데 선에서
// 접으면 네 꼭짓점이 모두 오른쪽 두 꼭짓점 자리로 가 버려, 도형이
// 선 하나로 납작해집니다. 실제로 화면에서 그랬습니다 — 아이가 보는
// 것은 '완전히 겹친 반쪽'이 아니라 가느다란 막대였습니다.
//
// 종이를 접으면 넘어가는 것은 '선 한쪽의 반쪽'입니다. 그래서 먼저
// 도형을 접는 선으로 잘라 반쪽을 만들고, 그 반쪽을 넘깁니다.

/** 꼭짓점 하나입니다. 자르면서 생긴 점에는 이름이 없습니다. */
type 이름붙은점 = { p: 점; 이름?: string };

/**
 * 도형을 접는 선으로 잘라 한쪽만 남깁니다(Sutherland–Hodgman).
 * 쪽이 +1이면 선의 바깥쪽(넘어가는 쪽), -1이면 책상에 붙어 있는 쪽입니다.
 */
const 반쪽자르기 = (
  pts: 점[],
  labels: string[] | undefined,
  축라디안: number,
  중심: 점,
  쪽: 1 | -1,
): 이름붙은점[] => {
  const nx = Math.cos(축라디안);
  const ny = Math.sin(축라디안);
  const 거리 = ([x, y]: 점) => ((x - 중심[0]) * nx + (y - 중심[1]) * ny) * 쪽;

  const 남은것: 이름붙은점[] = [];
  for (let at = 0; at < pts.length; at += 1) {
    const 이것 = pts[at];
    const 다음 = pts[(at + 1) % pts.length];
    const d1 = 거리(이것);
    const d2 = 거리(다음);
    if (d1 >= -1e-9) 남은것.push({ p: 이것, 이름: labels?.[at] });
    // 선을 가로지르면 만나는 점을 끼워 넣습니다.
    if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) {
      const 몫 = d1 / (d1 - d2);
      남은것.push({
        p: [이것[0] + (다음[0] - 이것[0]) * 몫, 이것[1] + (다음[1] - 이것[1]) * 몫] as 점,
      });
    }
  }
  return 남은것;
};

/** 접는 선을 축으로 각도만큼 넘깁니다. t가 1이면 다 넘어갑니다. */
const 넘기기 = (pts: 점[], 축라디안: number, 중심: 점, t: number): 점[] => {
  const ux = Math.sin(축라디안);
  const uy = -Math.cos(축라디안);
  const nx = Math.cos(축라디안);
  const ny = Math.sin(축라디안);
  return pts.map(([x, y]) => {
    const dx = x - 중심[0];
    const dy = y - 중심[1];
    const 따라 = dx * ux + dy * uy;
    const 떨어진 = dx * nx + dy * ny;
    const 새거리 = 떨어진 * Math.cos(Math.PI * t);
    return [중심[0] + ux * 따라 + nx * 새거리, 중심[1] + uy * 따라 + ny * 새거리] as 점;
  });
};

function 접어보기({ 도형, 축각도: 각, 말 }: { 도형: 도형항목; 축각도: number; 말?: string }) {
  const [t, setT] = useState(0);
  const cx = 판너비 / 2;
  const cy = 판높이 * 0.46;
  const 점들 = useMemo(() => 그려진점(도형), [도형]);
  const 중심 = useMemo(() => 가운데(점들), [점들]);
  const 라디안 = (각 * Math.PI) / 180;

  // 넘어가는 반쪽과, 책상에 붙어 있는 반쪽입니다.
  const 넘어갈반쪽 = useMemo(
    () => 반쪽자르기(점들, 도형.vertexLabels, 라디안, 중심, 1),
    [점들, 도형.vertexLabels, 라디안, 중심],
  );
  const 붙은반쪽 = useMemo(
    () => 반쪽자르기(점들, 도형.vertexLabels, 라디안, 중심, -1),
    [점들, 도형.vertexLabels, 라디안, 중심],
  );
  const 넘긴것 = 넘기기(넘어갈반쪽.map((one) => one.p), 라디안, 중심, t);

  const 선끝 = 1.35;
  const [ax, ay] = 화면으로(
    [중심[0] + Math.sin(라디안) * 선끝, 중심[1] - Math.cos(라디안) * 선끝],
    cx,
    cy,
  );
  const [bx, by] = 화면으로(
    [중심[0] - Math.sin(라디안) * 선끝, 중심[1] + Math.cos(라디안) * 선끝],
    cx,
    cy,
  );

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="접어 보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {/* 펼쳐 놓았을 때의 테두리입니다. 어디에서 접는지 보이게 남깁니다. */}
        <도형그리기 pts={점들} cx={cx} cy={cy} 색="#dbe7ee" />
        {/* 책상에 붙어 있는 반쪽 */}
        <도형그리기
          pts={붙은반쪽.map((one) => one.p)}
          labels={붙은반쪽.map((one) => one.이름 ?? '')}
          cx={cx}
          cy={cy}
          색="#9db6c6"
        />
        {/* 넘어가는 반쪽 */}
        <도형그리기
          pts={넘긴것}
          labels={넘어갈반쪽.map((one) => one.이름 ?? '')}
          cx={cx}
          cy={cy}
          진하게
          색="#0f7175"
          밀기={0.26 + 0.3 * t}
        />
        {/* 접는 선입니다. 지도서가 대칭축을 한 점 쇄선으로 긋습니다. */}
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#e08a1e" strokeWidth="2.5" strokeDasharray="10 5 3 5" />
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="접는 선을 따라 접기"
        왼쪽말="펼친 모양"
        오른쪽말="다 접음"
      />
      <p className="symmetry-say">
        {말 ?? (t > 0.99 ? '다 접었습니다. 두 쪽이 완전히 겹쳤는지 보세요.' : '손잡이를 끌어 접어 보세요.')}
      </p>
    </div>
  );
}

// ── 반 바퀴 돌려 보기 ──────────────────────────────────────────────
//
// 지도서 7차시 "꼭짓점을 대칭의 중심을 기준으로 180° 이동시켜
// 대응점을 찾아보도록 한 후, 이를 기준으로 대응변도 찾아보도록".

function 돌려보기({ 도형 }: { 도형: 도형항목 }) {
  const [t, setT] = useState(0);
  const cx = 판너비 / 2;
  const cy = 판높이 * 0.46;
  const 점들 = useMemo(() => 그려진점(도형), [도형]);
  const 중심 = useMemo(() => 가운데(점들), [점들]);
  const 각 = Math.PI * t;

  const 돈것 = 점들.map(([x, y]) => {
    const dx = x - 중심[0];
    const dy = y - 중심[1];
    return [
      중심[0] + dx * Math.cos(각) - dy * Math.sin(각),
      중심[1] + dx * Math.sin(각) + dy * Math.cos(각),
    ] as 점;
  });
  const [mx, my] = 화면으로(중심, cx, cy);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="반 바퀴 돌려 보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        <도형그리기 pts={점들} labels={도형.vertexLabels} cx={cx} cy={cy} 색="#9db6c6" />
        <도형그리기
          pts={돈것}
          labels={도형.vertexLabels}
          cx={cx}
          cy={cy}
          진하게
          색="#0f7175"
          밀기={0.26 + 0.3 * t}
        />
        {/* 대칭의 중심입니다. 여기에 핀을 꽂고 돌립니다. */}
        <circle cx={mx} cy={my} r="6" fill="#f0a202" stroke="#8a5a00" strokeWidth="2" />
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="대칭의 중심을 잡고 돌리기"
        왼쪽말="0°"
        오른쪽말="180°"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? '반 바퀴 돌렸습니다. 처음 모양과 똑같이 포개졌는지 보세요.'
          : '노란 점에 핀을 꽂았다고 생각하고 반 바퀴 돌려 보세요.'}
      </p>
    </div>
  );
}

// ── 접는 선 찾기 ──────────────────────────────────────────────────
//
// 지도서 4차시가 이름 붙여 경고하는 오개념이 있습니다 — "선대칭도형은
// 대칭축이 1개라는 오개념". 여기서는 아이가 선을 아무 각도로나 돌려
// 보고, 접히는 선을 찾을 때마다 세어 둡니다. 정오각형에서 다섯 개를
// 찾고 나면 '하나뿐'이라는 생각은 남지 않습니다.
//
// 답(대칭축의 개수)은 적어 주지 않습니다. 아이가 찾은 것만 셉니다.

/** 이 선을 따라 접으면 두 쪽이 완전히 겹치는가. */
const 접히는가 = (pts: 점[], 라디안: number, 중심: 점): boolean => {
  const nx = Math.cos(라디안);
  const ny = Math.sin(라디안);
  const 비춘것 = pts.map(([x, y]) => {
    const d = (x - 중심[0]) * nx + (y - 중심[1]) * ny;
    return [x - 2 * d * nx, y - 2 * d * ny] as 점;
  });
  let 큰것 = 0;
  for (const [ax, ay] of pts) {
    for (const [bx, by] of pts) 큰것 = Math.max(큰것, Math.hypot(ax - bx, ay - by));
  }
  const 봐주기 = Math.max(0.02, 큰것 * 0.035);
  // 비춘 점마다 제자리에 원래 점이 있어야 합니다.
  return 비춘것.every(([x, y]) => pts.some(([px, py]) => Math.hypot(x - px, y - py) < 봐주기));
};

function 접는선찾기({ 도형 }: { 도형: 도형항목 }) {
  const [각, set각] = useState(0);
  const [찾은것, set찾은것] = useState<number[]>([]);
  const [접기, set접기] = useState(0);

  const cx = 판너비 / 2;
  const cy = 판높이 * 0.46;
  const 점들 = useMemo(() => 그려진점(도형), [도형]);
  const 중심 = useMemo(() => 가운데(점들), [점들]);
  const 원인가 = 도형.shape === '원';
  const 라디안 = (각 * Math.PI) / 180;
  const 맞는선 = 원인가 || 접히는가(점들, 라디안, 중심);

  // 같은 선을 두 번 세지 않습니다. 180도 돌리면 같은 선입니다.
  const 이미찾음 = 찾은것.some((one) => {
    const 차 = Math.abs(((one - 각) % 180 + 180) % 180);
    return Math.min(차, 180 - 차) < 7;
  });

  // 누른 그때의 결과를 그대로 들고 있습니다. 찾은 목록에서 다시 세면,
  // 방금 넣은 선이 목록에 들어 있어서 처음 찾은 선한테도 '벌써
  // 찾았어요'라고 말하게 됩니다 — 아이가 '완전히 겹쳤어요!'를 한 번도
  // 못 보는 일이 실제로 있었습니다.
  const [결과, set결과] = useState<'아직' | '겹침' | '이미' | '어긋남'>('아직');

  const 접어보기누름 = () => {
    playTapSound();
    set접기(1);
    if (!맞는선) {
      set결과('어긋남');
      return;
    }
    if (이미찾음) {
      set결과('이미');
      return;
    }
    set결과('겹침');
    set찾은것((prev) => [...prev, ((각 % 180) + 180) % 180]);
  };

  const 선끝 = 1.45;
  const [ax, ay] = 화면으로([중심[0] + Math.sin(라디안) * 선끝, 중심[1] - Math.cos(라디안) * 선끝], cx, cy);
  const [bx, by] = 화면으로([중심[0] - Math.sin(라디안) * 선끝, 중심[1] + Math.cos(라디안) * 선끝], cx, cy);
  const 넘어갈반쪽 = 반쪽자르기(점들, 도형.vertexLabels, 라디안, 중심, 1);
  const 붙은반쪽 = 반쪽자르기(점들, 도형.vertexLabels, 라디안, 중심, -1);
  const 넘긴것 = 넘기기(넘어갈반쪽.map((one) => one.p), 라디안, 중심, 접기);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="접는 선을 찾아보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#e08a1e" strokeWidth="2.5" strokeDasharray="10 5 3 5" />
        {원인가 ? (
          <circle
            cx={화면으로(중심, cx, cy)[0]}
            cy={화면으로(중심, cx, cy)[1]}
            r={반지름}
            fill="rgba(15, 113, 117, 0.16)"
            stroke="#0f7175"
            strokeWidth="3.5"
          />
        ) : (
          <>
            <도형그리기 pts={점들} cx={cx} cy={cy} 색="#dbe7ee" />
            <도형그리기
              pts={붙은반쪽.map((one) => one.p)}
              labels={붙은반쪽.map((one) => one.이름 ?? '')}
              cx={cx}
              cy={cy}
              색="#9db6c6"
            />
            <도형그리기
              pts={넘긴것}
              labels={넘어갈반쪽.map((one) => one.이름 ?? '')}
              cx={cx}
              cy={cy}
              진하게
              색="#0f7175"
              밀기={0.26 + 0.3 * 접기}
            />
          </>
        )}
      </svg>

      <손잡이
        값={각 / 180}
        바꾸기={(다음) => {
          set각(Math.round(다음 * 180));
          set접기(0);
          set결과('아직');
        }}
        이름="접는 선을 돌리기"
        왼쪽말="선 눕히기"
        오른쪽말="선 세우기"
      />

      <div className="symmetry-try">
        <button type="button" onClick={접어보기누름}>
          이 선으로 접어 보기
        </button>
        <span className={결과 === '어긋남' ? 'symmetry-no' : 결과 === '아직' ? '' : 'symmetry-yes'}>
          {결과 === '아직'
            ? '선을 돌려 놓고 눌러 보세요'
            : 결과 === '겹침'
              ? '완전히 겹쳤어요!'
              : 결과 === '이미'
                ? '이 선은 벌써 찾았어요'
                : '두 쪽이 어긋납니다'}
        </span>
      </div>

      <p className="symmetry-say">
        찾은 접는 선: <strong>{원인가 && 찾은것.length ? '세어도 세어도 끝이 없어요' : `${찾은것.length}개`}</strong>
        {찾은것.length >= 2 && ' — 접는 선은 하나뿐이 아닐 수 있어요.'}
      </p>
    </div>
  );
}

// ── 바깥으로 내보내는 것 ───────────────────────────────────────────

export function SymmetryLab({ visual }: { visual: QuestionVisual }) {
  const 할것 = useMemo(() => 무엇을해볼까(visual), [visual]);
  if (!할것) return null;
  if (할것.갈래 === '포개기') return <포개어보기 왼쪽={할것.왼쪽} 오른쪽={할것.오른쪽} />;
  if (할것.갈래 === '접기') return <접어보기 도형={할것.도형} 축각도={할것.축각도} />;
  if (할것.갈래 === '돌리기') return <돌려보기 도형={할것.도형} />;
  return <접는선찾기 도형={할것.도형} />;
}

/** 창 제목입니다. 무엇을 해 보는 자리인지 한눈에 보여야 합니다. */
export const 실험이름 = (visual: QuestionVisual): string | null => {
  const 할것 = 무엇을해볼까(visual);
  if (!할것) return null;
  if (할것.갈래 === '포개기') return '두 도형을 포개어 보세요';
  if (할것.갈래 === '접기') return '접는 선을 따라 접어 보세요';
  if (할것.갈래 === '돌리기') return '반 바퀴 돌려 보세요';
  return '접으면 겹치는 선을 찾아보세요';
};

/** 무엇을 보아야 하는지입니다. 답은 말하지 않습니다. */
export const 실험보는차례 = (visual: QuestionVisual): string[] | null => {
  const 할것 = 무엇을해볼까(visual);
  if (!할것) return null;
  if (할것.갈래 === '포개기') {
    return [
      '합동인 두 도형은 포개면 완전히 겹칩니다.',
      '손잡이를 끝까지 끌어 한 도형을 다른 도형 위에 올려 보세요.',
      '한 꼭짓점에 두 이름이 함께 놓입니다. 그 둘이 서로 대응합니다.',
    ];
  }
  if (할것.갈래 === '접기') {
    return [
      '주황색 한 점 쇄선이 접는 선(대칭축)입니다.',
      '손잡이를 끌어 그 선을 따라 접어 보세요.',
      '접었을 때 겹치는 점이 대응점, 겹치는 변이 대응변입니다.',
    ];
  }
  if (할것.갈래 === '돌리기') {
    return [
      '노란 점이 대칭의 중심입니다. 거기에 핀을 꽂았다고 생각하세요.',
      '손잡이를 끌어 반 바퀴(180°) 돌려 보세요.',
      '돌렸을 때 처음 자리에 오는 꼭짓점이 대응점입니다.',
    ];
  }
  return [
    '선을 돌려 놓고 "이 선으로 접어 보기"를 눌러 보세요.',
    '두 쪽이 완전히 겹치면 그 선이 대칭축입니다.',
    '겹치는 선이 여러 개일 수도 있으니 여기저기 돌려 보세요.',
  ];
};
