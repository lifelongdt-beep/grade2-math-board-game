import type { ShareVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 똑같이 나누기 그림 — 문제 그림과 자세히 보기가 함께 씁니다
// ────────────────────────────────────────────────────────────────────
// 물건 하나하나에 자리를 둘 줍니다. 처음 자리(위쪽 더미)와 옮겨 갈
// 자리(받는 사람의 접시, 또는 묶음 칸)입니다. moved개를 옮겼다면 앞의
// moved개가 옮겨 간 자리에 있고, 나머지는 더미에 남아 있습니다.
// 자리가 바뀌면 CSS transition이 물건을 미끄러뜨려 옮깁니다 — 그래서
// 아이 눈에는 사탕이 한 개씩 접시로 날아가는 것처럼 보입니다.
// ════════════════════════════════════════════════════════════════════

const W = 360;
const 줄수 = 10;
const 간격 = 24;
const 반지름 = 8.5;
const 칸가로 = 3;
const 칸간격 = 19;

export type ShareLayout = {
  height: number;
  /** 받는 쪽 칸을 그리지 않을 때의 높이입니다. */
  pileHeight: number;
  home: Array<[number, number]>;
  target: Array<[number, number]>;
  boxes: Array<{ x: number; y: number; w: number; h: number; label: string }>;
  /** k번째 물건이 몇 번째 받는 쪽(묶음)으로 가는지입니다. */
  owner: number[];
};

export const shareLayout = (v: ShareVisual): ShareLayout => {
  const total = v.total;
  const 더미줄 = Math.ceil(total / 줄수);
  const 더미가로 = Math.min(total, 줄수) * 간격;
  const home: Array<[number, number]> = Array.from({ length: total }, (_, k) => [
    (W - 더미가로) / 2 + 간격 / 2 + (k % 줄수) * 간격,
    22 + Math.floor(k / 줄수) * 간격,
  ]);
  // 받는 쪽의 수와 한 곳에 들어갈 물건 수
  const 몇곳 = v.mode === 'deal' ? v.groups ?? 1 : Math.ceil(total / (v.size ?? 1));
  const 한곳 = v.mode === 'deal' ? Math.ceil(total / (v.groups ?? 1)) : v.size ?? 1;
  const 한줄곳 = Math.min(몇곳, 5);
  const 곳줄 = Math.ceil(몇곳 / 한줄곳);
  const boxW = (W - 16) / 한줄곳 - 8;
  const 안줄 = Math.ceil(한곳 / 칸가로);
  const boxH = 안줄 * 칸간격 + 30;
  const top = 22 + 더미줄 * 간격 + 14;
  const boxes = Array.from({ length: 몇곳 }, (_, g) => ({
    x: 12 + (g % 한줄곳) * (boxW + 8),
    y: top + Math.floor(g / 한줄곳) * (boxH + 8),
    w: boxW,
    h: boxH,
    label: v.mode === 'deal' ? `${g + 1}${v.holder === '명' ? '번' : '번 ' + v.holder}` : `${g + 1}묶음`,
  }));
  const owner: number[] = [];
  const target: Array<[number, number]> = [];
  for (let k = 0; k < total; k += 1) {
    // 나누어 주기는 한 바퀴씩 돌며 1번, 2번 … 차례로 하나씩 받습니다.
    // 묶기는 앞에서부터 size개씩 한 묶음입니다.
    const g = v.mode === 'deal' ? k % 몇곳 : Math.floor(k / 한곳);
    const slot = v.mode === 'deal' ? Math.floor(k / 몇곳) : k % 한곳;
    owner.push(g);
    const box = boxes[g];
    const 이줄 = Math.min(칸가로, 한곳);
    target.push([
      box.x + box.w / 2 + ((slot % 칸가로) - (이줄 - 1) / 2) * 칸간격,
      box.y + 12 + 칸간격 / 2 + Math.floor(slot / 칸가로) * 칸간격,
    ]);
  }
  const height = top + 곳줄 * (boxH + 8) + 6;
  return { height, pileHeight: top, home, target, boxes, owner };
};

export function ShareScene({ visual, moved, showBoxes, tall = false }: { visual: ShareVisual; moved: number; showBoxes: number; tall?: boolean }) {
  const lay = shareLayout(visual);
  const height = showBoxes > 0 || tall ? lay.height : lay.pileHeight;
  return (
    <svg className="share-scene" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="4" width={W - 8} height={height - 8} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {lay.boxes.slice(0, showBoxes).map((box, g) => {
        const 받은 = lay.owner.slice(0, moved).filter((o) => o === g).length;
        return (
          <g key={g} className="share-box">
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="12" fill="#fff8e7" stroke="#e0a33a" strokeWidth="2" strokeDasharray={visual.mode === 'group' ? '6 4' : undefined} />
            <text x={box.x + box.w / 2} y={box.y + box.h - 7} textAnchor="middle" fontSize="12" fontWeight="900" fill="#8a5a00">
              {box.label}{받은 ? ` · ${받은}` : ''}
            </text>
          </g>
        );
      })}
      {lay.home.map((_, k) => {
        // 남은 물건은 더미 앞쪽으로 당겨 모읍니다. 더미가 줄어드는 것이 보입니다.
        const [x, y] = k < moved ? lay.target[k] : lay.home[k - moved];
        return (
          <circle
            key={k}
            className="share-item"
            cx={0}
            cy={0}
            r={반지름}
            style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: `${(k % Math.max(1, visual.groups ?? visual.size ?? 1)) * 90}ms` }}
            fill={k < moved ? '#18a7a7' : '#f2b84b'}
            stroke={k < moved ? '#0f7175' : '#b07a10'}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}
