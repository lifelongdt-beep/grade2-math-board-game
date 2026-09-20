import type { PlaneShapeVisualItem, QuestionVisual } from '../types';

interface QuestionVisualGraphicProps {
  visual?: QuestionVisual;
  className?: string;
}

const shapeColor = (active?: boolean) => ({
  fill: active ? '#dffafa' : '#ffffff',
  stroke: active ? '#0f9f9f' : '#8aa0b8',
  strokeWidth: active ? 5 : 4,
});

const renderPlaneShape = (item: PlaneShapeVisualItem, index: number, total: number) => {
  const cellWidth = 320 / total;
  const cx = 28 + cellWidth * index + cellWidth / 2;
  const cy = 62;
  const size = item.kind === 'rectangle' ? 42 : 36;
  const style = shapeColor(item.active);
  const transform = item.rotate ? `rotate(${item.rotate} ${cx} ${cy})` : undefined;
  const label = item.label ? (
    <text x={cx} y="114" textAnchor="middle" fill={item.active ? '#087f83' : '#526779'} fontSize="18" fontWeight="900">
      {item.label}
    </text>
  ) : null;

  if (item.kind === 'circle') {
    return (
      <g key={`${item.kind}-${index}`}>
        <circle cx={cx} cy={cy} r={34} {...style} />
        {label}
      </g>
    );
  }

  if (item.kind === 'open-triangle') {
    return (
      <g key={`${item.kind}-${index}`}>
        {openTriangle(cx, cy, 76, style.stroke, style.strokeWidth)}
        {label}
      </g>
    );
  }

  if (item.kind === 'triangle') {
    return (
      <g key={`${item.kind}-${index}`}>
        <polygon points={`${cx},${cy - 40} ${cx - 40},${cy + 34} ${cx + 40},${cy + 34}`} transform={transform} {...style} />
        {label}
      </g>
    );
  }

  if (item.kind === 'rectangle') {
    return (
      <g key={`${item.kind}-${index}`}>
        <rect x={cx - 46} y={cy - 28} width={92} height={56} rx={5} transform={transform} {...style} />
        {label}
      </g>
    );
  }

  if (item.kind === 'parallelogram') {
    return (
      <g key={`${item.kind}-${index}`}>
        <polygon
          points={`${cx - 46},${cy + 30} ${cx - 20},${cy - 32} ${cx + 48},${cy - 32} ${cx + 22},${cy + 30}`}
          transform={transform}
          {...style}
        />
        {label}
      </g>
    );
  }

  return (
    <g key={`${item.kind}-${index}`}>
      <rect x={cx - size} y={cy - size} width={size * 2} height={size * 2} rx={5} transform={transform} {...style} />
      {label}
    </g>
  );
};

const renderCube = (
  cube: { x: number; y: number; z: number },
  index: number,
  // 비쳐 보이게 그리면 뒤에 숨은 쌓기나무까지 셀 수 있습니다.
  seeThrough = false,
) => {
  const sx = 160 + (cube.x - cube.y) * 32;
  const sy = 34 + (cube.x + cube.y) * 17 - cube.z * 32;
  const top = `${sx},${sy} ${sx + 28},${sy + 14} ${sx},${sy + 28} ${sx - 28},${sy + 14}`;
  const left = `${sx - 28},${sy + 14} ${sx},${sy + 28} ${sx},${sy + 60} ${sx - 28},${sy + 46}`;
  const right = `${sx + 28},${sy + 14} ${sx},${sy + 28} ${sx},${sy + 60} ${sx + 28},${sy + 46}`;

  return (
    <g key={`${cube.x}-${cube.y}-${cube.z}-${index}`} opacity={seeThrough ? 0.55 : 1}>
      <polygon points={left} fill="#c5eef3" stroke="#4f8f9a" strokeWidth="2" />
      <polygon points={right} fill="#9edce8" stroke="#4f8f9a" strokeWidth="2" />
      <polygon points={top} fill="#effcff" stroke="#4f8f9a" strokeWidth="2" />
    </g>
  );
};

// 쌓은 모양 차례를 그립니다. 한 칸은 등각으로 그린 쌓기나무이고, 모두
// 같은 면에 세워 어느 것도 뒤에 숨지 않습니다 — 아이가 세어야 하니까요.
const ORDINALS = ['첫째', '둘째', '셋째', '넷째', '다섯째'];

const smallCube = (x: number, z: number, originX: number, baseY: number, key: string) => {
  const w = 11;
  const h = 5.5;
  const v = 13;
  const sx = originX + x * w * 2;
  const sy = baseY - z * (v + h);
  const top = `${sx},${sy} ${sx + w},${sy + h} ${sx},${sy + h * 2} ${sx - w},${sy + h}`;
  const left = `${sx - w},${sy + h} ${sx},${sy + h * 2} ${sx},${sy + h * 2 + v} ${sx - w},${sy + h + v}`;
  const right = `${sx + w},${sy + h} ${sx},${sy + h * 2} ${sx},${sy + h * 2 + v} ${sx + w},${sy + h + v}`;

  return (
    <g key={key}>
      <polygon points={left} fill="#c5eef3" stroke="#4f8f9a" strokeWidth="1.6" />
      <polygon points={right} fill="#9edce8" stroke="#4f8f9a" strokeWidth="1.6" />
      <polygon points={top} fill="#effcff" stroke="#4f8f9a" strokeWidth="1.6" />
    </g>
  );
};

function CubePatternGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'cube-pattern' }> }) {
  const steps = visual.steps.slice(0, 4);
  const slot = 376 / Math.max(steps.length, 1);
  const baseY = 96;

  return (
    <svg viewBox="0 0 376 132" role="img" aria-label={visual.label}>
      <rect x="4" y="4" width="368" height="124" rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {steps.map((count, stepIndex) => {
        const middle = slot * stepIndex + slot / 2;
        const unknown = visual.unknownIndex === stepIndex;
        // 한 줄에 셋까지 놓고 위로 올립니다. 앞뒤로 겹치지 않으니
        // 그린 것이 곧 센 것이 됩니다.
        const wide = Math.min(3, Math.max(1, count));
        const originX = middle - ((wide - 1) * 11 * 2) / 2;

        return (
          <g key={`step-${stepIndex}`}>
            {unknown ? (
              <>
                <rect
                  x={middle - 26}
                  y={baseY - 44}
                  width="52"
                  height="60"
                  rx="10"
                  fill="#fff8dc"
                  stroke="#d9a521"
                  strokeWidth="2.5"
                  strokeDasharray="7 5"
                />
                <text x={middle} y={baseY - 4} textAnchor="middle" fill="#a2760f" fontSize="30" fontWeight="900">
                  ?
                </text>
              </>
            ) : (
              Array.from({ length: Math.min(count, 12) }).map((_, cubeIndex) =>
                smallCube(cubeIndex % 3, Math.floor(cubeIndex / 3), originX, baseY, `c-${stepIndex}-${cubeIndex}`),
              )
            )}
            <text x={middle} y="120" textAnchor="middle" fill="#0f7175" fontSize="14" fontWeight="900">
              {ORDINALS[stepIndex]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// 연필 하나를 그리고, 그 길이에 딱 맞게 클립을 이어 놓습니다.
// 자는 그리지 않습니다. 이 차시는 자를 배우기 전이기 때문입니다.
function UnitMeasureGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'unit-measure' }> }) {
  const count = Math.max(1, Math.min(12, visual.count));
  const left = 30;
  const width = 316;
  const unitWidth = width / count;

  return (
    <svg viewBox="0 0 376 128" role="img" aria-label={visual.label}>
      {/* 연필 */}
      <rect x={left} y="20" width={width - 26} height="24" rx="4" fill="#ffd86b" stroke="#b9812a" strokeWidth="2.5" />
      <rect x={left} y="20" width="16" height="24" rx="4" fill="#f2a0a0" stroke="#b9812a" strokeWidth="2.5" />
      <polygon
        points={`${left + width - 26},20 ${left + width},32 ${left + width - 26},44`}
        fill="#f7e2b8"
        stroke="#b9812a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text x={left - 4} y="14" fill="#0f7175" fontSize="14" fontWeight="900">
        {visual.object}
      </text>

      {/* 클립을 겹치지 않게 이어 놓은 모습 */}
      {Array.from({ length: count }).map((_, index) => (
        <g key={index}>
          <rect
            x={left + index * unitWidth + 2}
            y="62"
            width={unitWidth - 4}
            height="22"
            rx="11"
            fill="#dffafa"
            stroke="#0f9f9f"
            strokeWidth="2.5"
          />
          <rect
            x={left + index * unitWidth + 7}
            y="67"
            width={Math.max(3, unitWidth - 16)}
            height="12"
            rx="6"
            fill="none"
            stroke="#0f9f9f"
            strokeWidth="1.8"
          />
        </g>
      ))}
      <text x={left - 4} y="104" fill="#0f7175" fontSize="14" fontWeight="900">
        {visual.unit}
      </text>
    </svg>
  );
}

// 곧은 선 셋으로 그렸지만 한쪽이 벌어져 있는 도형입니다. 삼각형처럼
// 보이지만 닫히지 않아 삼각형이 아닙니다.
const openTriangle = (cx: number, cy: number, size: number, stroke: string, width: number) => {
  const half = size / 2;
  const top = `${cx},${cy - half}`;
  const left = `${cx - half},${cy + half}`;
  const right = `${cx + half},${cy + half}`;
  // 아래 변을 짧게 그려 오른쪽을 벌려 둡니다.
  const gapEnd = `${cx + half - size * 0.28},${cy + half}`;
  return (
    <g>
      <polyline points={`${left} ${top} ${right}`} fill="none" stroke={stroke} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`${left} ${gapEnd}`} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" />
    </g>
  );
};

function PlaneShapesGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'plane-shapes' }> }) {
  return (
    <svg viewBox="0 0 376 128" role="img" aria-label={visual.label}>
      {visual.items.map((item, index) => renderPlaneShape(item, index, visual.items.length))}
    </svg>
  );
}

function CubeStackGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'cube-stack' }> }) {
  return (
    <svg viewBox="0 0 376 142" role="img" aria-label={visual.label}>
      <g transform="translate(8 8)">
        {visual.cubes
          .slice()
          .sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z))
          .map((cube, index) => renderCube(cube, index, visual.seeThrough))}
      </g>
    </svg>
  );
}

const renderCubeView = (
  view: Extract<QuestionVisual, { kind: 'cube-views' }>['views'][number],
  index: number,
  total: number,
) => {
  const labelText = view.label === '보임' ? '보이는 것' : `${view.label}에서`;
  const panelWidth = total === 1 ? 150 : total === 2 ? 132 : 104;
  const gap = total === 1 ? 0 : 12;
  const startX = (376 - (panelWidth * total + gap * (total - 1))) / 2;
  const panelX = startX + index * (panelWidth + gap);
  const rows = view.cells.length;
  const columns = view.cells.reduce((max, row) => Math.max(max, row.length), 1);
  const cellGap = 4;
  const maxCellWidth = (panelWidth - 22 - cellGap * (columns - 1)) / columns;
  const maxCellHeight = (58 - cellGap * (rows - 1)) / rows;
  const cellSize = Math.max(7, Math.min(22, maxCellWidth, maxCellHeight));
  const gridWidth = columns * cellSize + (columns - 1) * cellGap;
  const gridHeight = rows * cellSize + (rows - 1) * cellGap;
  const gridX = panelX + (panelWidth - gridWidth) / 2;
  const gridY = 54 + (58 - gridHeight) / 2;

  return (
    <g key={`${view.label}-${index}`}>
      <rect x={panelX} y="24" width={panelWidth} height="96" rx="12" fill="#ffffff" stroke="#cfeaf0" />
      <text x={panelX + panelWidth / 2} y="43" textAnchor="middle" fill="#0f7175" fontSize="16" fontWeight="900">
        {labelText}
      </text>
      {view.cells.map((row, rowIndex) =>
        row.map((active, columnIndex) => (
          <rect
            key={`${view.label}-${rowIndex}-${columnIndex}`}
            x={gridX + columnIndex * (cellSize + cellGap)}
            y={gridY + rowIndex * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            rx="3"
            fill={active ? '#dffafa' : '#f7fbfc'}
            stroke={active ? '#0f9f9f' : '#cddfe5'}
            strokeWidth={active ? 3 : 2}
          />
        )),
      )}
    </g>
  );
};

function CubeViewsGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'cube-views' }> }) {
  return (
    <svg viewBox="0 0 376 142" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="130" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {visual.views.map((view, index) => renderCubeView(view, index, visual.views.length))}
    </svg>
  );
}

function TangramGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'tangram' }> }) {
  const pieces = [
    { label: '1', labelX: 134, labelY: 74, points: '18,18 242,18 130,130', fill: '#8f969d' },
    { label: '2', labelX: 208, labelY: 132, points: '242,18 242,242 130,130', fill: '#c7ccd1' },
    { label: '3', labelX: 48, labelY: 84, points: '18,18 18,130 74,74', fill: '#757c83' },
    { label: '4', labelX: 64, labelY: 132, points: '18,130 74,74 130,130 74,186', fill: '#f7fbff' },
    { label: '5', labelX: 130, labelY: 160, points: '74,186 130,130 186,186', fill: '#eef1f4' },
    { label: '6', labelX: 168, labelY: 204, points: '74,186 186,186 242,242 130,242', fill: '#d6dce2' },
    { label: '7', labelX: 50, labelY: 204, points: '18,130 18,242 130,242', fill: '#626971' },
  ];

  return (
    <svg viewBox="0 0 260 260" role="img" aria-label={visual.label}>
      <rect x="4" y="4" width="252" height="252" rx="22" fill="rgba(255,255,255,0.98)" stroke="#d7edf2" strokeWidth="2" />
      {pieces.map((piece) => (
        <g key={piece.label}>
          <polygon points={piece.points} fill={piece.fill} stroke="#404854" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx={piece.labelX} cy={piece.labelY} r="16" fill="rgba(255,255,255,0.82)" stroke="#404854" strokeWidth="2.3" />
          <text x={piece.labelX} y={piece.labelY + 7} textAnchor="middle" fontSize="22" fontWeight="900" fill="#20384f">
            {piece.label}
          </text>
        </g>
      ))}
      <rect x="18" y="18" width="224" height="224" fill="none" stroke="#404854" strokeWidth="2.8" />
    </svg>
  );
}

const NUMBER_LINE_TRACK_WIDTH = 312;

function NumberLineGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'number-line' }> }) {
  const range = Math.max(1, visual.end - visual.start);
  const toX = (value: number) => 32 + ((value - visual.start) / range) * NUMBER_LINE_TRACK_WIDTH;
  const ticks = [];
  for (let value = visual.start; value <= visual.end; value += visual.step) {
    ticks.push(value);
  }

  // 눈금마다 숫자를 쓰면 4000처럼 자리가 긴 수에서 서로 겹칩니다.
  // 가장 긴 숫자가 들어갈 만큼 자리가 날 때만 숫자를 씁니다.
  const longestLabel = ticks.reduce((longest, value) => Math.max(longest, String(value).length), 1);
  const neededWidth = longestLabel * 10 + 6;
  const tickGap = NUMBER_LINE_TRACK_WIDTH / Math.max(1, ticks.length - 1);
  const labelEvery = Math.max(1, Math.ceil(neededWidth / Math.max(tickGap, 1)));

  return (
    <svg viewBox="0 0 376 142" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="130" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      <line x1="32" y1="76" x2="344" y2="76" stroke="#506579" strokeWidth="4" strokeLinecap="round" />
      {ticks.map((value, index) => {
        // 첫 눈금과 마지막 눈금은 어디서 시작하고 끝나는지 알려 주므로 보여 줍니다.
        // 다만 마지막 눈금이 앞 라벨과 붙으면 글자가 겹치므로 그때는 생략합니다.
        const isLast = index === ticks.length - 1;
        const lastFits = (ticks.length - 1) % labelEvery === 0
          || (ticks.length - 1) % labelEvery >= Math.ceil(labelEvery / 2);
        const labelled = index % labelEvery === 0 || (isLast && lastFits);
        // 감추기로 한 자리는 눈금만 그리고 숫자는 쓰지 않습니다.
        const hidden = visual.hiddenLabels?.includes(value) ?? false;
        return (
          <g key={value}>
            <line x1={toX(value)} y1="64" x2={toX(value)} y2={labelled ? 88 : 84} stroke="#8aa0b8" strokeWidth="3" />
            {labelled && !hidden && (
              <text x={toX(value)} y="112" textAnchor="middle" fill="#24364a" fontSize="16" fontWeight="800">
                {value}
              </text>
            )}
          </g>
        );
      })}
      {(visual.jumpsShown === undefined
        ? visual.marks
        // 한 번씩 뛰어 보는 중입니다. 처음 자리에서 뛴 만큼만 점을
        // 찍고, 지금 서 있는 자리를 굵게 표시합니다.
        : Array.from({ length: visual.jumpsShown + 1 }, (_, step) => ({
            value: visual.start + visual.step * step,
            active: step === visual.jumpsShown,
            label: undefined as string | undefined,
          }))
      ).map((mark, index) => (
        <g key={`${mark.value}-${index}`}>
          <circle cx={toX(mark.value)} cy="76" r={mark.active ? 11 : 8} fill={mark.active ? '#18a7a7' : '#fff4bd'} stroke="#0f7175" strokeWidth="3" />
          {mark.label && (
            <text x={toX(mark.value)} y="46" textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">
              {mark.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// 수의 범위를 그립니다(5-2 1단원).
//
// 지도서가 그리는 방법을 그대로 따릅니다.
//   · 경곗값이 들어가면 ●, 들어가지 않으면 ○
//   · 들어가는 쪽으로 굵은 선을 긋고, 끝이 없으면 화살표로 뻗는다
// '이상'과 '초과'의 차이는 이 점 하나가 채워져 있는지뿐이므로, 점은
// 눈금보다 크고 또렷하게 그립니다.
function RangeLineGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'range-line' }> }) {
  const span = Math.max(1e-9, visual.end - visual.start);
  const toX = (value: number) => 32 + ((value - visual.start) / span) * NUMBER_LINE_TRACK_WIDTH;

  const ticks: number[] = [];
  // 소수 간격에서 0.30000000000000004 같은 값이 나오지 않게 칸 수로 셉니다.
  const tickCount = Math.round(span / visual.step);
  for (let i = 0; i <= tickCount; i += 1) {
    ticks.push(Number((visual.start + visual.step * i).toFixed(6)));
  }

  const longestLabel = ticks.reduce((longest, value) => Math.max(longest, String(value).length), 1);
  const tickGap = NUMBER_LINE_TRACK_WIDTH / Math.max(1, ticks.length - 1);
  const labelEvery = Math.max(1, Math.ceil((longestLabel * 10 + 6) / Math.max(tickGap, 1)));

  const left = visual.lower ? toX(visual.lower.value) : 32;
  const right = visual.upper ? toX(visual.upper.value) : 344;

  return (
    <svg viewBox="0 0 376 142" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="130" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      <line x1="32" y1="86" x2="344" y2="86" stroke="#506579" strokeWidth="4" strokeLinecap="round" />

      {ticks.map((value, index) => {
        const labelled = index % labelEvery === 0 || index === ticks.length - 1;
        return (
          <g key={`tick-${value}`}>
            <line x1={toX(value)} y1="76" x2={toX(value)} y2={labelled ? 96 : 92} stroke="#8aa0b8" strokeWidth="3" />
            {labelled && (
              <text x={toX(value)} y="118" textAnchor="middle" fill="#24364a" fontSize="15" fontWeight="800">
                {value}
              </text>
            )}
          </g>
        );
      })}

      {/* 범위를 나타내는 굵은 선입니다. */}
      <line x1={left} y1="86" x2={right} y2="86" stroke="#18a7a7" strokeWidth="7" strokeLinecap="butt" />

      {/* 끝이 정해지지 않은 쪽에는 화살표를 답니다. */}
      {!visual.lower && <polygon points="32,86 44,79 44,93" fill="#18a7a7" />}
      {!visual.upper && <polygon points="344,86 332,79 332,93" fill="#18a7a7" />}

      {([visual.lower ? { ...visual.lower, side: 'lower' as const } : null,
         visual.upper ? { ...visual.upper, side: 'upper' as const } : null]
        .filter(Boolean) as Array<{ value: number; included: boolean; side: 'lower' | 'upper' }>)
        .map((edge) => (
          <g key={edge.side}>
            <circle
              cx={toX(edge.value)}
              cy="86"
              r="9"
              fill={edge.included ? '#18a7a7' : '#ffffff'}
              stroke="#0f7175"
              strokeWidth="3"
            />
            {/*
              경곗값은 늘 숫자로 적어 줍니다. 눈금은 5나 10 간격인데
              경곗값이 32나 49처럼 눈금 사이에 놓이면, 아이는 점이
              30에 있는지 32에 있는지 알 수가 없습니다. 어느 수가
              경계인지는 이 그림에서 읽어야 할 것이 아니라 읽기의
              출발점입니다 — 읽어야 할 것은 점이 찼는지 비었는지입니다.
            */}
            <text
              x={toX(edge.value)}
              y="70"
              textAnchor="middle"
              fill="#0f7175"
              fontSize="16"
              fontWeight="900"
            >
              {edge.value}
            </text>
          </g>
        ))}

      {/* 범위에 들어가는지 살펴볼 수 있게 함께 찍어 주는 수입니다. */}
      {visual.dots?.map((dot, index) => (
        <g key={`dot-${dot.value}-${index}`}>
          <line x1={toX(dot.value)} y1="86" x2={toX(dot.value)} y2="58" stroke="#f0a202" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx={toX(dot.value)} cy="54" r="6" fill="#ffd166" stroke="#c07f00" strokeWidth="2" />
          {dot.label && (
            <text x={toX(dot.value)} y="36" textAnchor="middle" fill="#8a5a00" fontSize="14" fontWeight="900">
              {dot.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// 분수를 그림으로 보입니다(5-2 2단원).
//
// 지도서가 세 가지 모델을 씁니다. 차시가 다루는 곱셈의 종류에 따라
// 어느 모델로 보여 줄지가 다릅니다 — (진분수)×(자연수)는 같은 만큼을
// 여러 번 더하는 띠로, (자연수)×(진분수)는 하나를 똑같이 나눈 것 중
// 몇 묶음으로, (분수)×(분수)는 가로·세로로 나눈 넓이로 보입니다.
function FractionModelGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'fraction-model' }> }) {
  const FILL = '#18a7a7';
  const EMPTY = '#ffffff';
  const LINE = '#0f7175';

  if (visual.shape === 'area') {
    const columns = Math.max(1, visual.columns ?? 1);
    const rows = Math.max(1, visual.rows ?? 1);
    const shadedColumns = Math.min(columns, visual.shadedColumns ?? 0);
    const shadedRows = Math.min(rows, visual.shadedRows ?? 0);
    const size = 190;
    const left = (376 - size) / 2;
    const top = 14;
    const cellWidth = size / columns;
    const cellHeight = size / rows;

    return (
      <svg viewBox="0 0 376 230" role="img" aria-label={visual.label}>
        <rect x="4" y="4" width="368" height="222" rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: columns }, (_, column) => {
            // 가로로 고른 칸과 세로로 고른 칸이 겹치는 곳이 두 분수의 곱입니다.
            //
            // 한 번만 칠해진 두 곳을 같은 색으로 두었더니 어느 쪽이
            // 가로에서 온 것이고 어느 쪽이 세로에서 온 것인지 알 수가
            // 없었습니다. '두 번 칠해진 곳'을 세라고 해 놓고 한 번
            // 칠해진 것이 몇 가지인지 보이지 않으면 그림이 뜻을
            // 잃습니다. 두 방향을 다른 색으로 둡니다.
            const byColumn = column < shadedColumns;
            const byRow = row < shadedRows;
            const both = byColumn && byRow;
            return (
              <rect
                key={`${row}-${column}`}
                x={left + column * cellWidth}
                y={top + row * cellHeight}
                width={cellWidth}
                height={cellHeight}
                fill={both ? FILL : byColumn ? '#cdeeee' : byRow ? '#ffe6a8' : EMPTY}
                stroke="#8aa0b8"
                strokeWidth="1.5"
              />
            );
          }),
        )}
        <rect x={left} y={top} width={size} height={size} fill="none" stroke={LINE} strokeWidth="3" />
        <text x="188" y="222" textAnchor="middle" fill="#526779" fontSize="15" fontWeight="800">
          가로로 칠한 곳과 세로로 칠한 곳이 겹치는 자리
        </text>
      </svg>
    );
  }

  if (visual.shape === 'part') {
    // 띠 하나가 자연수 하나를 나타냅니다. 그 띠를 분모만큼 나누고
    // 분자만큼 칠합니다 — '6의 1/3'이면 6을 3으로 나눈 것 중 1입니다.
    const parts = Math.max(1, visual.denominator);
    const shaded = Math.min(parts, visual.numerator);
    const width = 312;
    const left = 32;
    const cell = width / parts;

    return (
      <svg viewBox="0 0 376 150" role="img" aria-label={visual.label}>
        <rect x="4" y="4" width="368" height="142" rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {Array.from({ length: parts }, (_, index) => (
          <rect
            key={index}
            x={left + index * cell}
            y={52}
            width={cell}
            height={46}
            fill={index < shaded ? FILL : EMPTY}
            stroke="#8aa0b8"
            strokeWidth="2"
          />
        ))}
        <rect x={left} y={52} width={width} height={46} fill="none" stroke={LINE} strokeWidth="3" />
        {visual.whole !== undefined && (
          <>
            <text x="188" y="38" textAnchor="middle" fill="#0f7175" fontSize="17" fontWeight="900">
              전체 {visual.whole}
            </text>
            {/*
              칸 수를 글로 적어 두면 그림을 볼 필요가 없어집니다.
              '그림이 나타내는 곱셈은?'을 묻는 문항에서는 그것이 곧
              답을 적어 두는 것과 같습니다. 무엇을 세어야 하는지만
              적습니다.
            */}
            <text x="188" y="126" textAnchor="middle" fill="#526779" fontSize="15" fontWeight="800">
              똑같이 나눈 묶음 수와 칠한 묶음 수를 세어 보세요
            </text>
          </>
        )}
      </svg>
    );
  }

  // bar: 띠를 여러 개 두고 같은 만큼씩 칠합니다.
  const repeat = Math.max(1, visual.repeat ?? 1);
  const parts = Math.max(1, visual.denominator);
  const shaded = Math.min(parts, visual.numerator);
  const barWidth = Math.min(96, 312 / repeat - 8);
  const gap = repeat > 1 ? (312 - barWidth * repeat) / (repeat - 1) : 0;
  const cell = barWidth / parts;

  return (
    <svg viewBox="0 0 376 150" role="img" aria-label={visual.label}>
      <rect x="4" y="4" width="368" height="142" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {Array.from({ length: repeat }, (_, bar) => {
        const left = 32 + bar * (barWidth + gap);
        return (
          <g key={bar}>
            {Array.from({ length: parts }, (_, index) => (
              <rect
                key={index}
                x={left + index * cell}
                y={48}
                width={cell}
                height={48}
                fill={index < shaded ? FILL : EMPTY}
                stroke="#8aa0b8"
                strokeWidth="1.5"
              />
            ))}
            <rect x={left} y={48} width={barWidth} height={48} fill="none" stroke={LINE} strokeWidth="3" />
          </g>
        );
      })}
      {/* 칸 수를 적어 두면 그림을 읽을 일이 없어집니다. */}
      <text x="188" y="126" textAnchor="middle" fill="#526779" fontSize="15" fontWeight="800">
        띠 하나에 칠한 칸 수와 띠의 개수를 세어 보세요
      </text>
    </svg>
  );
}

// 도형의 꼭짓점입니다. -1 ~ 1 사이의 자리로 적어 두고, 그릴 때 크기를
// 맞춥니다. 차례는 시계 반대 방향이 아니라 '왼쪽 위에서 시작해 시계
// 방향'입니다 — 교과서가 ㄱㄴㄷㄹ을 그렇게 붙입니다.
const FIGURE_POINTS: Record<string, Array<[number, number]>> = {
  정삼각형: [[0, -1], [0.866, 0.5], [-0.866, 0.5]],
  이등변삼각형: [[0, -1], [0.62, 0.7], [-0.62, 0.7]],
  직각삼각형: [[-0.8, -0.7], [-0.8, 0.7], [0.9, 0.7]],
  // 높이가 도형 밖에 있는 삼각형입니다. 지도서가 "삼각형의 넓이를 구할
  // 때는 높이가 삼각형의 외부에 있는 것도 다룬다"고 적어 두었습니다.
  // 꼭짓점이 밑변의 오른쪽 끝보다 더 오른쪽에 있어, 수직으로 내린 발이
  // 밑변 밖에 떨어집니다.
  둔각삼각형: [[1, -0.8], [0.2, 0.6], [-0.95, 0.6]],
  정사각형: [[-0.75, -0.75], [0.75, -0.75], [0.75, 0.75], [-0.75, 0.75]],
  직사각형: [[-1, -0.6], [1, -0.6], [1, 0.6], [-1, 0.6]],
  마름모: [[0, -0.95], [0.8, 0], [0, 0.95], [-0.8, 0]],
  평행사변형: [[-0.55, -0.6], [1, -0.6], [0.55, 0.6], [-1, 0.6]],
  사다리꼴: [[-0.35, -0.6], [0.95, -0.6], [1, 0.6], [-1, 0.6]],
  // 아무 조건도 없는 사각형입니다. 변의 길이와 각의 크기를 마음대로
  // 적어도 그림과 어긋나지 않습니다 — 직사각형에 107°를 적어 두는 일이
  // 생기지 않게, 대응변·대응각을 묻는 문항은 이 도형을 씁니다.
  사각형: [[-0.85, -0.7], [0.7, -0.9], [0.95, 0.5], [-0.6, 0.85]],
  정오각형: Array.from({ length: 5 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    return [Math.cos(angle), Math.sin(angle)] as [number, number];
  }),
  정육각형: Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    return [Math.cos(angle), Math.sin(angle)] as [number, number];
  }),
};

// 합동과 대칭을 보이는 그림입니다(5-2 3단원).
function FigureSetGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'figure-set' }> }) {
  const count = Math.max(1, visual.items.length);
  const width = 376;
  const cellWidth = width / count;
  // 도형이 셋 넷 늘어서면 하나하나가 작아집니다. 꼭짓점 이름과 길이가
  // 붙는 그림은 도형이 한둘뿐이므로, 개수에 따라 반지름을 정합니다.
  // 도형이 하나뿐이면 크게 그립니다. 길이를 적어 넣는 그림(넓이)은
  // 글자가 들어갈 자리가 있어야 읽힙니다.
  const radius = Math.min(cellWidth / 2 - 22, count === 1 ? 72 : count === 2 ? 62 : 40);
  const height = count <= 2 ? 190 : 160;
  const centerY = height / 2 - 6;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="4" width={width - 8} height={height - 8} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {visual.items.map((item, index) => {
        const cx = cellWidth * index + cellWidth / 2;
        const scale = radius * (item.scale ?? 1);
        const radians = ((item.rotate ?? 0) * Math.PI) / 180;

        const place = ([x, y]: [number, number]): [number, number] => {
          const flipped = item.flip ? -x : x;
          const rx = flipped * Math.cos(radians) - y * Math.sin(radians);
          const ry = flipped * Math.sin(radians) + y * Math.cos(radians);
          return [cx + rx * scale, centerY + ry * scale];
        };

        const stroke = item.active ? '#0f7175' : '#41607a';
        const fill = item.active ? '#dffafa' : '#ffffff';

        if (item.shape === '원') {
          return (
            <g key={index}>
              <circle cx={cx} cy={centerY} r={scale} fill={fill} stroke={stroke} strokeWidth="3.5" />
              {item.center && <circle cx={cx} cy={centerY} r="5" fill="#f0a202" stroke="#8a5a00" strokeWidth="2" />}
              {item.name && (
                <text x={cx} y={height - 12} textAnchor="middle" fill="#24364a" fontSize="17" fontWeight="900">
                  {item.name}
                </text>
              )}
            </g>
          );
        }

        // 꼭짓점을 직접 준 그림(넓이 문항)은 그것을 그대로 씁니다.
        // 길이에서 계산한 자리라, 그림과 적힌 수가 어긋나지 않습니다.
        const base = item.points ?? FIGURE_POINTS[item.shape] ?? FIGURE_POINTS.정사각형;
        const drawn = base.map(place);
        const points = drawn.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

        return (
          <g key={index}>
            <polygon points={points} fill={fill} stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />

            {/* 대칭축입니다. 도형 밖으로 조금 넘겨 그어야 축으로 보입니다. */}
            {item.axes?.map((axis) => {
              const reach = scale * 1.25;
              const direction =
                axis === 'vertical'
                  ? ([0, 1] as const)
                  : axis === 'horizontal'
                    ? ([1, 0] as const)
                    : axis === 'diagonal'
                      ? ([0.7071, 0.7071] as const)
                      : ([0.7071, -0.7071] as const);
              const [dx, dy] = direction;
              const rdx = dx * Math.cos(radians) - dy * Math.sin(radians);
              const rdy = dx * Math.sin(radians) + dy * Math.cos(radians);
              return (
                <line
                  key={axis}
                  x1={cx - rdx * reach}
                  y1={centerY - rdy * reach}
                  x2={cx + rdx * reach}
                  y2={centerY + rdy * reach}
                  stroke="#f0a202"
                  strokeWidth="2.5"
                  strokeDasharray="7 5"
                />
              );
            })}

            {item.center && <circle cx={cx} cy={centerY} r="5" fill="#f0a202" stroke="#8a5a00" strokeWidth="2" />}

            {/* 밑변에 수직으로 그은 높이입니다.
                넓이를 구할 때 쓰는 길이가 비스듬한 변이 아니라는 것을
                그림이 말해 주어야 합니다. 점선과 직각 표시로 그립니다. */}
            {item.heightMark && (() => {
              const [hx, hy] = drawn[item.heightMark.fromVertex] ?? [cx, centerY];
              const baseY = Math.max(...drawn.map(([, y]) => y));
              const baseXs = drawn.filter(([, y]) => Math.abs(y - baseY) < 0.5).map(([x]) => x);
              const 밖 = baseXs.length >= 2 && (hx > Math.max(...baseXs) + 0.5 || hx < Math.min(...baseXs) - 0.5);
              const 위쪽 = hy < baseY;
              const mark = 위쪽 ? 10 : -10;
              return (
                <g>
                  {밖 && (
                    <line
                      x1={Math.max(...baseXs)}
                      y1={baseY}
                      x2={hx}
                      y2={baseY}
                      stroke="#8aa0b8"
                      strokeWidth="2"
                      strokeDasharray="3 4"
                    />
                  )}
                  <line x1={hx} y1={hy} x2={hx} y2={baseY} stroke="#f0a202" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* 직각 표시 */}
                  <polyline
                    points={`${hx - 9},${baseY - Math.sign(mark) * 0} ${hx - 9},${baseY - mark} ${hx},${baseY - mark}`}
                    fill="none"
                    stroke="#f0a202"
                    strokeWidth="2"
                  />
                  {/* 높이를 적는 자리입니다.
                      높이를 내린 선은 늘 비스듬한 변 옆에 붙어 있어서,
                      가운데 높이에 적으면 그 변에 붙은 길이와 겹칩니다.
                      그래서 자리를 두 가지로 비켜 둡니다 — 옆으로는 빈
                      쪽으로, 위아래로는 밑변에 가깝게. 비스듬한 변의
                      길이는 변의 한가운데에 적히므로 서로 떨어집니다. */}
                  {(() => {
                    const xs = drawn.map(([x]) => x);
                    const 오른쪽 = Math.max(...xs) - hx >= hx - Math.min(...xs);
                    return (
                      <text
                        x={hx + (오른쪽 ? 7 : -7)}
                        y={hy + (baseY - hy) * 0.72 + 4}
                        textAnchor={오른쪽 ? 'start' : 'end'}
                        fill="#8a5a00"
                        fontSize="15"
                        fontWeight="900"
                      >
                        {item.heightMark?.text}
                      </text>
                    );
                  })()}
                </g>
              );
            })()}

            {/* 대각선입니다. 마름모의 넓이에서 씁니다. */}
            {item.diagonals?.map((line, at) => {
              const [x1, y1] = drawn[line.from] ?? [cx, centerY];
              const [x2, y2] = drawn[line.to] ?? [cx, centerY];
              return (
                <g key={`d-${at}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0a202" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* 두 대각선은 한가운데에서 만납니다. 길이를 가운데에
                      적으면 두 글자가 겹치므로, 각자 자기 쪽으로 조금
                      물러나 적습니다. */}
                  <text
                    x={x1 + (x2 - x1) * 0.27 + (y1 === y2 ? 0 : 14)}
                    y={y1 + (y2 - y1) * 0.27 + (y1 === y2 ? -8 : 5)}
                    textAnchor="middle"
                    fill="#8a5a00"
                    fontSize="15"
                    fontWeight="900"
                  >
                    {line.text}
                  </text>
                </g>
              );
            })}

            {/* 꼭짓점 이름은 도형 바깥쪽으로 조금 밀어 놓습니다. */}
            {item.vertexLabels?.map((label, at) => {
              const [x, y] = drawn[at] ?? [cx, centerY];
              const outX = x + (x - cx) * 0.22;
              const outY = y + (y - centerY) * 0.22;
              return (
                <text
                  key={`v-${at}`}
                  x={outX}
                  y={outY + 5}
                  textAnchor="middle"
                  fill="#0f7175"
                  fontSize="15"
                  fontWeight="900"
                >
                  {label}
                </text>
              );
            })}

            {item.edgeLabels?.map((edge, at) => {
              const [x1, y1] = drawn[edge.from] ?? [cx, centerY];
              const [x2, y2] = drawn[edge.to] ?? [cx, centerY];
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              return (
                <text
                  key={`e-${at}`}
                  x={midX + (midX - cx) * 0.3}
                  y={midY + (midY - centerY) * 0.3 + 4}
                  textAnchor="middle"
                  fill="#24364a"
                  fontSize="14"
                  fontWeight="800"
                >
                  {edge.text}
                </text>
              );
            })}

            {item.angleLabels?.map((angle, at) => {
              const [x, y] = drawn[angle.at] ?? [cx, centerY];
              return (
                <text
                  key={`a-${at}`}
                  x={x + (cx - x) * 0.34}
                  y={y + (centerY - y) * 0.34 + 4}
                  textAnchor="middle"
                  fill="#a8410a"
                  fontSize="13"
                  fontWeight="800"
                >
                  {angle.text}
                </text>
              );
            })}

            {item.name && (
              <text x={cx} y={height - 12} textAnchor="middle" fill="#24364a" fontSize="17" fontWeight="900">
                {item.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function PlaceValueGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'place-value' }> }) {
  const cellWidth = 320 / visual.columns.length;

  return (
    // 자리별 칸이 저마다 흰 상자를 갖고 있어서, 그 뒤에 흰 판을 한 겹 더
    // 깔 필요가 없습니다. 판이 없으면 칸 세 개가 더 또렷하게 떨어져 보입니다.
    <svg viewBox="0 0 376 150" role="img" aria-label={visual.label}>
      {visual.columns.map((column, index) => {
        const x = 28 + index * cellWidth;
        const blockCount = Math.min(column.blocks ?? column.value, 12);
        return (
          <g key={`${column.label}-${index}`}>
            <rect x={x} y="24" width={cellWidth - 8} height="96" rx="10" fill="#ffffff" stroke="#cfeaf0" />
            <text x={x + (cellWidth - 8) / 2} y="45" textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">
              {column.label}
            </text>
            {/* 모형을 세어 수를 쓰는 문항에서는 숫자를 적지 않습니다.
                적어 두면 세어 볼 것 없이 그대로 옮기면 됩니다. */}
            {!visual.countOnly && (
              <text x={x + (cellWidth - 8) / 2} y="106" textAnchor="middle" fill="#182433" fontSize="24" fontWeight="900">
                {column.value}
              </text>
            )}
            {/* 숫자를 지운 그림에서는 모형이 곧 읽을 것입니다. 작게
                구석에 몰아 두면 세기 어려우므로 크게, 칸 가운데에
                놓습니다. */}
            {Array.from({ length: blockCount }).map((_, blockIndex) => {
              const perRow = visual.countOnly ? 3 : 6;
              const size = visual.countOnly ? 13 : 7;
              const gap = visual.countOnly ? 17 : 10;
              const rows = Math.ceil(Math.min(blockCount, 12) / perRow);
              const inRow = Math.min(blockCount - Math.floor(blockIndex / perRow) * perRow, perRow);
              const left = x + (cellWidth - 8) / 2 - (inRow * gap - (gap - size)) / 2;
              const top = visual.countOnly ? 88 - ((rows - 1) * (size + 4)) / 2 : 56;
              return (
                <rect
                  key={blockIndex}
                  x={left + (blockIndex % perRow) * gap}
                  y={top + Math.floor(blockIndex / perRow) * (size + 4)}
                  width={size}
                  height={size}
                  rx="2"
                  fill="#dffafa"
                  stroke="#0f9f9f"
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function BarModelGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'bar-model' }> }) {
  const maxValue = Math.max(...visual.bars.map((bar) => bar.value), 1);
  // 막대 옆 글자는 '9'처럼 짧기도 하고 '2m 15cm'처럼 길기도 합니다.
  // 짧은 것에 맞춰 자리를 잡아 두었더니 긴 글자가 그림 밖으로 잘려
  // '2m 1'까지만 보였습니다. 가장 긴 글자가 들어갈 자리를 먼저 떼어
  // 두고, 남는 만큼만 막대를 늘립니다.
  const longest = Math.max(...visual.bars.map((bar) => String(bar.text ?? bar.value).length), 1);
  // 굵은 14px에서 숫자는 8px, m은 11px쯤 됩니다. 넉넉히 잡지 않으면
  // 마지막 글자가 그림 테두리에 걸립니다 — 한 글자에 9px로 잡았더니
  // '3m 21cm'의 끝 m이 테두리에 닿았습니다.
  const textRoom = longest * 11 + 16;
  const barRoom = Math.max(60, 372 - 104 - textRoom);

  // 막대를 넉 줄까지만 그리고 있었습니다. 그래서 '한 뼘이 약 12cm입니다.
  // 6뼘은 약 몇 cm일까요?'에 막대가 네 개만 놓였고, 아이가 그림을 세면
  // 문제가 말한 여섯 번이 아니라 네 번이 되었습니다. 그림이 문제와
  // 다른 말을 하고 있었던 것입니다. 여섯 줄까지 그리고, 줄이 많으면
  // 그림 높이를 늘려 아래 줄이 테두리 밖으로 나가지 않게 합니다.
  const bars = visual.bars.slice(0, 6);
  const crowded = bars.length > 4;
  const rowHeight = crowded ? 24 : 28;
  const barHeight = crowded ? 18 : 22;
  const height = crowded ? 28 + bars.length * rowHeight + 12 : 150;

  return (
    <svg viewBox={`0 0 376 ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height={height - 12} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {bars.map((bar, index) => {
        const y = 28 + index * rowHeight;
        const width = Math.max(24, (bar.value / maxValue) * barRoom);
        return (
          <g key={`${bar.label}-${index}`}>
            <text x="28" y={y + barHeight - 4} fill="#24364a" fontSize="14" fontWeight="900">
              {bar.label}
            </text>
            <rect x="104" y={y} width={barRoom} height={barHeight} rx="7" fill="#eef6f8" />
            <rect x="104" y={y} width={width} height={barHeight} rx="7" fill={index % 2 === 0 ? '#dffafa' : '#fff4bd'} stroke="#0f9f9f" />
            <text x={114 + barRoom} y={y + barHeight - 5} fill="#182433" fontSize="14" fontWeight="900">
              {bar.text ?? bar.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 직육면체의 겨냥도 (5-2 5단원) ───────────────────────────────────
// 지도서가 못박아 둔 그리는 방법 그대로입니다.
//   · 평행한 모서리는 평행하게 그린다
//   · 보이는 모서리는 실선으로, 보이지 않는 모서리는 점선으로 그린다
//   · 각의 크기는 고려하지 않는다
// 보이는 모서리 9개, 보이지 않는 모서리 3개, 보이지 않는 꼭짓점 1개가
// 되도록 그립니다. 그 수를 묻는 문항이 있으므로 그림이 그 수와 다르면
// 안 됩니다.
const BOX_VISIBLE_EDGES: Array<[string, string]> = [
  ['ㄴ', 'ㄷ'], ['ㄷ', 'ㅅ'], ['ㅅ', 'ㅂ'], ['ㅂ', 'ㄴ'],
  ['ㄱ', 'ㄹ'], ['ㄹ', 'ㅇ'],
  ['ㄴ', 'ㄱ'], ['ㄷ', 'ㄹ'], ['ㅅ', 'ㅇ'],
];
const BOX_HIDDEN_EDGES: Array<[string, string]> = [['ㄱ', 'ㅁ'], ['ㅁ', 'ㅂ'], ['ㅁ', 'ㅇ']];
// 잘못 그린 겨냥도에서 점선으로 잘못 그을 '보이는 모서리' 셋입니다.


const BOX_FACE_CORNERS: Record<string, string[]> = {
  top: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
  bottom: ['ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'],
  front: ['ㄴ', 'ㅂ', 'ㅅ', 'ㄷ'],
  back: ['ㄱ', 'ㅁ', 'ㅇ', 'ㄹ'],
  left: ['ㄱ', 'ㄴ', 'ㅂ', 'ㅁ'],
  right: ['ㄹ', 'ㄷ', 'ㅅ', 'ㅇ'],
};
const BOX_HIDDEN_FACES = new Set(['bottom', 'back', 'left']);

function BoxDrawingGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'box-drawing' }> }) {
  const width = 376;
  const height = 214;
  const { width: bw, depth: bd, height: bh } = visual;

  // 세 길이를 그대로 쓰면 납작하거나 가느다란 그림이 나옵니다. 비율은
  // 살리되 너무 치우치지 않게 눌러 줍니다.
  const tame = (value: number, other: number) => Math.min(Math.max(value / other, 0.45), 2.2);
  const unitW = 1;
  const unitH = tame(bh, bw);
  const unitD = tame(bd, bw);

  // 평행하게 그리지 않은 잘못을 보일 때는 오른쪽 뒤 두 꼭짓점만 더
  // 멀리 밀어 놓습니다. 그러면 모서리 ㄱㄹ이 모서리 ㄴㄷ과, 모서리
  // ㄷㄹ이 모서리 ㄴㄱ과 평행하지 않게 됩니다. 더 멀리 밀어 놓는
  // 만큼 그림도 커지므로, 크기를 정할 때 이것부터 셈에 넣습니다 —
  // 넣지 않으면 오른쪽 위 모퉁이가 그림 밖으로 잘려 나갑니다.
  const skew = visual.flaw === 'not-parallel' ? 1.75 : 1;

  const slant = 0.52;
  const spanX = unitW + unitD * slant * skew;
  const spanY = unitH + unitD * slant * 0.82 * skew;
  const scale = Math.min((width - 104) / spanX, (height - 62) / spanY);

  const faceW = unitW * scale;
  const faceH = unitH * scale;
  const offX = unitD * slant * scale;
  const offY = unitD * slant * 0.82 * scale;

  const left = (width - (faceW + offX * skew)) / 2;
  const top = (height - (faceH + offY * skew)) / 2 + offY * skew;
  const point: Record<string, [number, number]> = {
    ㄴ: [left, top],
    ㄷ: [left + faceW, top],
    ㅂ: [left, top + faceH],
    ㅅ: [left + faceW, top + faceH],
    ㄱ: [left + offX, top - offY],
    ㄹ: [left + faceW + offX * skew, top - offY * skew],
    ㅁ: [left + offX, top + faceH - offY],
    ㅇ: [left + faceW + offX * skew, top + faceH - offY * skew],
  };

  const polygon = (face: string) => BOX_FACE_CORNERS[face].map((name) => point[name].join(',')).join(' ');
  const shaded = visual.shaded ?? [];
  const shaded2 = visual.shaded2 ?? [];
  const boxCenter: [number, number] = [left + (faceW + offX) / 2, top + (faceH - offY) / 2];

  const edge = (from: string, to: string, dashed: boolean, key: string) => (
    <line
      key={key}
      x1={point[from][0]}
      y1={point[from][1]}
      x2={point[to][0]}
      y2={point[to][1]}
      stroke="#41607a"
      strokeWidth="3"
      strokeLinecap="round"
      {...(dashed ? { strokeDasharray: '7 6' } : {})}
    />
  );

  const hiddenSolid = visual.flaw === 'hidden-solid';
  const hiddenGone = visual.flaw === 'missing-edges';

  const label = (from: string, to: string, text: string, push: [number, number]) => {
    const midX = (point[from][0] + point[to][0]) / 2;
    const midY = (point[from][1] + point[to][1]) / 2;
    return (
      <text
        x={midX + push[0]}
        y={midY + push[1]}
        textAnchor="middle"
        fill="#24364a"
        fontSize="14"
        fontWeight="800"
      >
        {text}
      </text>
    );
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="4" width={width - 8} height={height - 8} rx="14" fill="#f6fcff" stroke="#d7edf2" />

      {/* 가려진 쪽의 색칠은 옅게 깔아 둡니다. 앞쪽 면보다 뒤에 있다는 것이
          보여야 합니다. */}
      {[...shaded.map((face) => [face, '#9fdcea'] as const), ...shaded2.map((face) => [face, '#f7c98b'] as const)].map(
        ([face, color]) => (
          <polygon
            key={`f-${face}`}
            points={polygon(face)}
            fill={color}
            fillOpacity={BOX_HIDDEN_FACES.has(face) ? 0.42 : 0.85}
          />
        ),
      )}

      {!hiddenGone && BOX_HIDDEN_EDGES.map(([from, to]) => edge(from, to, !hiddenSolid, `h-${from}${to}`))}
      {BOX_VISIBLE_EDGES.map(([from, to]) => edge(from, to, false, `v-${from}${to}`))}

      {/* 꼭짓점 이름을 놓을 자리입니다. 가운데에서 밀어내는 식으로
          잡으면 ㄷ과 ㅁ이 갈 곳이 없습니다 — 이 둘은 그림의 테두리가
          아니라 안쪽에서 세 면이 만나는 점이라 바깥이 없습니다.
          그래서 꼭짓점마다 놓을 자리를 따로 적어 둡니다. */}
      {visual.labelVertices &&
        Object.entries(point).map(([name, [x, y]]) => {
          const push: Record<string, [number, number]> = {
            ㄱ: [-4, -9],
            ㄴ: [-15, -3],
            ㄷ: [-13, 17],
            ㄹ: [13, -9],
            ㅁ: [-14, -4],
            ㅂ: [-14, 16],
            ㅅ: [4, 20],
            ㅇ: [17, 8],
          };
          const [dx, dy] = push[name] ?? [0, 0];
          return (
            <text
              key={`p-${name}`}
              x={x + dx}
              y={y + dy}
              textAnchor="middle"
              fill="#0f7175"
              fontSize="15"
              fontWeight="900"
            >
              {name}
            </text>
          );
        })}

      {visual.edgeLabels?.width && label('ㅂ', 'ㅅ', visual.edgeLabels.width, [0, 18])}
      {visual.edgeLabels?.height && label('ㄴ', 'ㅂ', visual.edgeLabels.height, [-20, 4])}
      {visual.edgeLabels?.depth && label('ㅅ', 'ㅇ', visual.edgeLabels.depth, [24, 12])}
    </svg>
  );
}

// ── 직육면체·정육면체의 전개도 (5-2 5단원) ──────────────────────────
// 지도서: "전개도에서 잘린 모서리는 실선으로, 잘리지 않은 모서리는
// 점선으로 그린다." 그래서 이웃한 칸이 있는 쪽은 점선(접는 선),
// 바깥 테두리는 실선으로 그립니다. 어느 쪽인지는 칸의 자리에서
// 스스로 알아내므로, 손으로 잘못 적을 자리가 없습니다.
function BoxNetGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'box-net' }> }) {
  const width = 376;
  const height = 224;
  const { cols, rows, cells } = visual;
  const totalW = cols.reduce((sum, one) => sum + one, 0);
  const totalH = rows.reduce((sum, one) => sum + one, 0);
  const pad = 30;
  const scale = Math.min((width - pad * 2) / totalW, (height - pad * 2) / totalH);

  const before = (sizes: number[], upto: number) => sizes.slice(0, upto).reduce((sum, one) => sum + one, 0);
  const drawnW = totalW * scale;
  const drawnH = totalH * scale;
  const originX = (width - drawnW) / 2;
  const originY = (height - drawnH) / 2;
  const atX = (units: number) => originX + units * scale;
  const atY = (units: number) => originY + units * scale;

  const taken = new Set(cells.map((one) => `${one.col},${one.row}`));
  const fill = ['#ffffff', '#cdeef6', '#fbe0bd'];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="4" width={width - 8} height={height - 8} rx="14" fill="#f6fcff" stroke="#d7edf2" />

      {cells.map((cell) => {
        const x = atX(before(cols, cell.col));
        const y = atY(before(rows, cell.row));
        const w = cols[cell.col] * scale;
        const h = rows[cell.row] * scale;
        return (
          <rect
            key={`c-${cell.col}-${cell.row}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={fill[cell.shade ?? 0]}
          />
        );
      })}

      {cells.map((cell) => {
        const x = atX(before(cols, cell.col));
        const y = atY(before(rows, cell.row));
        const w = cols[cell.col] * scale;
        const h = rows[cell.row] * scale;
        const sides: Array<{ dc: number; dr: number; from: [number, number]; to: [number, number] }> = [
          { dc: 0, dr: -1, from: [x, y], to: [x + w, y] },
          { dc: 1, dr: 0, from: [x + w, y], to: [x + w, y + h] },
          { dc: 0, dr: 1, from: [x, y + h], to: [x + w, y + h] },
          { dc: -1, dr: 0, from: [x, y], to: [x, y + h] },
        ];
        return sides.map((side, at) => {
          const folds = taken.has(`${cell.col + side.dc},${cell.row + side.dr}`);
          // 잘린 모서리(바깥 테두리)와 접는 선(칸과 칸 사이)은 아이가
          // 세어 답해야 하는 것이라, 굵기만 다르게 해서는 화면에서
          // 가려지지 않습니다. 색까지 바꿉니다.
          return (
            <line
              key={`s-${cell.col}-${cell.row}-${at}`}
              x1={side.from[0]}
              y1={side.from[1]}
              x2={side.to[0]}
              y2={side.to[1]}
              stroke={folds ? '#8fb0c4' : '#2f4f68'}
              strokeWidth={folds ? 2 : 4}
              strokeLinecap="round"
              {...(folds ? { strokeDasharray: '7 6' } : {})}
            />
          );
        });
      })}

      {cells.map((cell) =>
        cell.text ? (
          <text
            key={`t-${cell.col}-${cell.row}`}
            x={atX(before(cols, cell.col) + cols[cell.col] / 2)}
            y={atY(before(rows, cell.row) + rows[cell.row] / 2) + 6}
            textAnchor="middle"
            fill="#24364a"
            fontSize="17"
            fontWeight="900"
          >
            {cell.text}
          </text>
        ) : null,
      )}

      {visual.edgeLabels?.map((one, at) => {
        const x = before(cols, one.col);
        const y = before(rows, one.row);
        const w = cols[one.col];
        const h = rows[one.row];
        const spot =
          one.side === 'top'
            ? [atX(x + w / 2), atY(y) - 7]
            : one.side === 'bottom'
              ? [atX(x + w / 2), atY(y + h) + 16]
              : one.side === 'left'
                ? [atX(x) - 15, atY(y + h / 2) + 5]
                : [atX(x + w) + 15, atY(y + h / 2) + 5];
        return (
          <text key={`e-${at}`} x={spot[0]} y={spot[1]} textAnchor="middle" fill="#24364a" fontSize="13" fontWeight="800">
            {one.text}
          </text>
        );
      })}

      {/* 꼭짓점 이름은 면이 없는 모퉁이 쪽에 적습니다. 면 위에 겹쳐
          적으면 어느 점을 가리키는지 알 수 없습니다. */}
      {visual.points?.map((one) => {
        const col = cols.reduce((found, size, at) => (before(cols, at) === one.x ? at : found), -1);
        const row = rows.reduce((found, size, at) => (before(rows, at) === one.y ? at : found), -1);
        const colBefore = cols.reduce((found, size, at) => (before(cols, at) + size === one.x ? at : found), -1);
        const rowBefore = rows.reduce((found, size, at) => (before(rows, at) + size === one.y ? at : found), -1);
        const quads: Array<[number, number, boolean]> = [
          [1, 1, col >= 0 && row >= 0 && taken.has(`${col},${row}`)],
          [-1, 1, colBefore >= 0 && row >= 0 && taken.has(`${colBefore},${row}`)],
          [1, -1, col >= 0 && rowBefore >= 0 && taken.has(`${col},${rowBefore}`)],
          [-1, -1, colBefore >= 0 && rowBefore >= 0 && taken.has(`${colBefore},${rowBefore}`)],
        ];
        // 바깥쪽으로 밀어 놓습니다. 비어 있기만 하면 아무 쪽이나 쓰면,
        // 왼쪽 끝 꼭짓점의 이름이 오른쪽 아래에 붙어 어느 점을
        // 가리키는지 알 수 없게 됩니다.
        const away: [number, number] = [
          one.x * 2 <= totalW ? -1 : 1,
          one.y * 2 <= totalH ? -1 : 1,
        ];
        const free =
          quads.find(([dx, dy, used]) => !used && dx === away[0] && dy === away[1]) ??
          quads.find(([dx, , used]) => !used && dx === away[0]) ??
          quads.find(([, dy, used]) => !used && dy === away[1]) ??
          quads.find(([, , used]) => !used) ??
          quads[0];
        return (
          <text
            key={`v-${one.text}`}
            x={atX(one.x) + free[0] * 12}
            y={atY(one.y) + free[1] * 13 + 4}
            textAnchor="middle"
            fill="#0f7175"
            fontSize="14"
            fontWeight="900"
          >
            {one.text}
          </text>
        );
      })}
    </svg>
  );
}

// ── 회전판과 주머니 (5-2 6단원) ─────────────────────────────────────
// 가능성은 눈으로 보이는 상황에서 시작합니다. 칸은 모두 같은 크기로
// 나눕니다 — 칸의 크기가 조금씩 다르면 '반반이다'인지 아닌지를 아이가
// 그림에서 읽을 수 없습니다.
const CHANCE_FILL: Record<string, string> = {
  red: '#e8615a',
  blue: '#4a8fe0',
  yellow: '#f2c53d',
  green: '#54b878',
  white: '#ffffff',
  black: '#33404d',
};

function SpinnerGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'spinner' }> }) {
  const count = Math.max(1, visual.items.length);
  const width = 376;
  const height = count <= 2 ? 200 : 168;
  const cellWidth = width / count;
  const radius = Math.min(cellWidth / 2 - 14, count <= 2 ? 66 : 44);
  const centerY = height / 2 - 8;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="4" width={width - 8} height={height - 8} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {visual.items.map((item, index) => {
        const cx = cellWidth * index + cellWidth / 2;
        const slices = item.slices.length ? item.slices : ['white'];
        const step = (Math.PI * 2) / slices.length;
        return (
          <g key={index}>
            {slices.length === 1 ? (
              <circle cx={cx} cy={centerY} r={radius} fill={CHANCE_FILL[slices[0]]} stroke="#2f4f68" strokeWidth="2.5" />
            ) : (
              slices.map((color, at) => {
                // 12시 방향에서 시작해 시계 방향으로 나눕니다.
                const from = -Math.PI / 2 + step * at;
                const to = from + step;
                const x1 = cx + radius * Math.cos(from);
                const y1 = centerY + radius * Math.sin(from);
                const x2 = cx + radius * Math.cos(to);
                const y2 = centerY + radius * Math.sin(to);
                const big = step > Math.PI ? 1 : 0;
                return (
                  <path
                    key={at}
                    d={`M ${cx} ${centerY} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${big} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
                    fill={CHANCE_FILL[color]}
                    stroke="#2f4f68"
                    strokeWidth="2"
                  />
                );
              })
            )}
            <circle cx={cx} cy={centerY} r={radius} fill="none" stroke="#2f4f68" strokeWidth="2.5" />
            {/* 화살은 칸과 칸 사이 경계에 세워 둡니다. 어느 한 칸을
                가리키게 그리면, 아이가 '이미 그 색에 멈췄다'로 읽고
                묻는 색과 다르다는 이유만으로 '불가능하다'를 고르게
                됩니다. 칸은 12시 방향에서 시작하므로 위쪽이 늘
                경계입니다. */}
            <line x1={cx} y1={centerY} x2={cx} y2={centerY - radius * 0.86} stroke="#24364a" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={cx} cy={centerY} r="4.5" fill="#24364a" />
            {item.name && (
              <text x={cx} y={height - 10} textAnchor="middle" fill="#24364a" fontSize="16" fontWeight="900">
                {item.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MarbleBagGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'marble-bag' }> }) {
  const count = Math.max(1, visual.bags.length);
  const width = 376;
  const height = count <= 2 ? 176 : 156;
  const cellWidth = width / count;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="4" width={width - 8} height={height - 8} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {visual.bags.map((bag, index) => {
        const cx = cellWidth * index + cellWidth / 2;
        const bagWidth = Math.min(cellWidth - 16, 108);
        const bagHeight = height - 62;
        const left = cx - bagWidth / 2;
        const top = 22;
        // 바둑돌은 한 줄에 셋씩 담습니다.
        const perRow = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(bag.marbles.length))));
        const r = Math.min(13, (bagWidth - 20) / (perRow * 2.4));
        const rows = Math.ceil(bag.marbles.length / perRow);
        return (
          <g key={index}>
            <path
              d={`M ${left} ${top + 14} Q ${left} ${top} ${left + 14} ${top} L ${left + bagWidth - 14} ${top} Q ${left + bagWidth} ${top} ${left + bagWidth} ${top + 14} L ${left + bagWidth} ${top + bagHeight - 16} Q ${left + bagWidth} ${top + bagHeight} ${left + bagWidth - 18} ${top + bagHeight} L ${left + 18} ${top + bagHeight} Q ${left} ${top + bagHeight} ${left} ${top + bagHeight - 16} Z`}
              fill="#fff8ea"
              stroke="#b08a52"
              strokeWidth="2.5"
            />
            {bag.marbles.map((color, at) => {
              const row = Math.floor(at / perRow);
              const col = at % perRow;
              const inRow = Math.min(perRow, bag.marbles.length - row * perRow);
              const spanX = (inRow - 1) * r * 2.4;
              const x = cx - spanX / 2 + col * r * 2.4;
              const y = top + bagHeight / 2 - ((rows - 1) * r * 2.4) / 2 + row * r * 2.4;
              return (
                <circle
                  key={at}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={CHANCE_FILL[color]}
                  stroke={color === 'white' ? '#6d7f8d' : '#24364a'}
                  strokeWidth="2"
                />
              );
            })}
            {bag.name && (
              <text x={cx} y={height - 12} textAnchor="middle" fill="#24364a" fontSize="16" fontWeight="900">
                {bag.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const RULER_TRACK_WIDTH = 316;
const RULER_LABEL_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200];

function RulerGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'ruler' }> }) {
  const range = Math.max(1, visual.end - visual.start);
  const toX = (value: number) => 30 + ((value - visual.start) / range) * RULER_TRACK_WIDTH;
  const pixelsPerUnit = RULER_TRACK_WIDTH / range;

  // 눈금 수는 자의 길이에 따라 달라집니다. 간격을 정해 두지 않으면
  // 긴 자에서 숫자가 서로 겹쳐 읽을 수 없습니다.
  const labelStep = RULER_LABEL_STEPS.find((step) => step * pixelsPerUnit >= 26) ?? 500;
  const tickStep = pixelsPerUnit >= 4 ? 1 : Math.max(1, Math.round(labelStep / 5));

  const ticks: number[] = [];
  for (let value = visual.start; value <= visual.end; value += tickStep) {
    ticks.push(value);
  }

  return (
    <svg viewBox="0 0 376 132" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="120" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      <rect x="26" y="48" width="324" height="46" rx="8" fill="#fff4bd" stroke="#d4a62f" />
      {/* 앞쪽을 생략했다는 물결 표시입니다. 231cm를 0부터 다 그리면
          눈금이 뭉개져 읽을 수 없으므로, 왼쪽을 끊고 재는 끝만
          제대로 보여 줍니다. */}
      {visual.elided && (
        <g>
          <rect x="26" y="48" width="22" height="46" fill="#f6fcff" />
          <path
            d="M30 56 q5 -6 10 0 q5 6 10 0 M30 71 q5 -6 10 0 q5 6 10 0 M30 86 q5 -6 10 0 q5 6 10 0"
            fill="none"
            stroke="#d4a62f"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
      <rect x={toX(visual.highlightStart)} y="50" width={toX(visual.highlightEnd) - toX(visual.highlightStart)} height="42" rx="6" fill="#dffafa" opacity="0.9" />
      {/* 재는 물건입니다. 자 위에 얹어 두어야 어느 눈금에서 시작해
          어느 눈금에서 끝났는지가 눈에 보입니다. 눈금 0에서 시작하지
          않은 자를 다루는 문항은 이 그림이 없으면 읽을 수 없습니다. */}
      <rect
        x={toX(visual.highlightStart)}
        y="26"
        width={Math.max(6, toX(visual.highlightEnd) - toX(visual.highlightStart))}
        height="16"
        rx="8"
        fill="#7fd4ff"
        stroke="#2b7fa8"
        strokeWidth="2"
      />
      {/* 물건의 양 끝이 어느 눈금에 놓였는지 점선으로 내려 짚어 줍니다. */}
      {[visual.highlightStart, visual.highlightEnd].map((mark) => (
        <line
          key={`edge-${mark}`}
          x1={toX(mark)}
          y1="26"
          x2={toX(mark)}
          y2="96"
          stroke="#2b7fa8"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      ))}
      {ticks.map((value) => {
        const labelled = value % labelStep === 0;
        return (
          <g key={value}>
            <line
              x1={toX(value)}
              y1="48"
              x2={toX(value)}
              y2={labelled ? 78 : 66}
              stroke="#7b6233"
              strokeWidth={labelled ? 3 : 2}
            />
            {labelled && (
              <text x={toX(value)} y="113" textAnchor="middle" fill="#24364a" fontSize="13" fontWeight="800">
                {value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// 시계 그림은 프레임을 시계에 딱 맞춰야 화면에서 크게 보입니다.
const CLOCK_CENTER_Y = 76;
const CLOCK_RADIUS = 68;
const CLOCK_FRAME_HEIGHT = 170;

const handPoint = (center: number, length: number, angle: number) => ({
  x: center + Math.sin(angle) * length,
  y: CLOCK_CENTER_Y - Math.cos(angle) * length,
});

function ClockFace({
  hour,
  minute,
  x,
  label,
  example = false,
  blank = false,
}: {
  hour: number;
  minute: number;
  x: number;
  label: string;
  example?: boolean;
  blank?: boolean;
}) {
  const hourAngle = (((hour % 12) + minute / 60) / 12) * Math.PI * 2;
  const minuteAngle = (minute / 60) * Math.PI * 2;
  const hourHand = handPoint(x, 36, hourAngle);
  const minuteHand = handPoint(x, 54, minuteAngle);
  // 예시 시계는 바늘이 정답이 아니므로 점선으로 흐리게 그려 문제 글을 읽게 합니다.
  const handStyle = example
    ? { strokeDasharray: '7 6', opacity: 0.55 }
    : {};

  return (
    <g>
      <circle cx={x} cy={CLOCK_CENTER_Y} r={CLOCK_RADIUS} fill="#ffffff" stroke="#8aa0b8" strokeWidth="3" />
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = ((index + 1) / 12) * Math.PI * 2;
        const point = handPoint(x, 56, angle);
        return (
          <text key={index} x={point.x} y={point.y + 6} textAnchor="middle" fill="#24364a" fontSize="16" fontWeight="800">
            {index + 1}
          </text>
        );
      })}
      {/* 바늘 자리가 곧 답인 문제에서는 바늘을 그리지 않습니다. 판만
          있어도 5씩 세어 볼 수 있어 도움이 되고, 답은 가려집니다. */}
      {!blank && (
        <>
          <line
            x1={x}
            y1={CLOCK_CENTER_Y}
            x2={hourHand.x}
            y2={hourHand.y}
            stroke="#182433"
            strokeWidth="6"
            strokeLinecap="round"
            {...handStyle}
          />
          <line
            x1={x}
            y1={CLOCK_CENTER_Y}
            x2={minuteHand.x}
            y2={minuteHand.y}
            stroke="#0f9f9f"
            strokeWidth="5"
            strokeLinecap="round"
            {...handStyle}
          />
        </>
      )}
      <circle cx={x} cy={CLOCK_CENTER_Y} r="5" fill="#182433" opacity={blank ? 0.35 : example ? 0.55 : 1} />
      <text
        x={x}
        y="160"
        textAnchor="middle"
        fill={example ? '#9a6b12' : '#0f7175'}
        fontSize={example ? 14 : 16}
        fontWeight="900"
      >
        {label}
      </text>
    </g>
  );
}

function ClockGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'clock' }> }) {
  const hasEnd = visual.endHour != null && visual.endMinute != null;
  const example = visual.example === true;
  const frameWidth = hasEnd ? 310 : example ? 240 : 150;

  return (
    <svg viewBox={`0 0 ${frameWidth} ${CLOCK_FRAME_HEIGHT}`} role="img" aria-label={visual.label}>
      <rect x="3" y="3" width={frameWidth - 6} height={CLOCK_FRAME_HEIGHT - 6} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      <ClockFace
        hour={visual.hour}
        minute={visual.minute}
        x={hasEnd ? 80 : frameWidth / 2}
        // '시작'은 끝 시계가 나란히 있을 때만 뜻이 있는 말입니다. 시계가
        // 하나뿐인데 '시작'이라고 적으면, 무엇이 시작한다는 것인지 알 수
        // 없는 글자가 문제 밑에 붙습니다.
        label={
          visual.blank
            ? '어느 수를 가리킬까요'
            : example
              ? '바늘 위치는 바뀔 수 있어요'
              : hasEnd
                ? '시작'
                : ''
        }
        example={example}
        blank={visual.blank === true}
      />
      {hasEnd && <ClockFace hour={visual.endHour ?? visual.hour} minute={visual.endMinute ?? visual.minute} x={230} label="끝" />}
    </svg>
  );
}

function TableGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'table' }> }) {
  const cells = [...visual.columns.map((column) => ({ name: column.name, value: column.value }))];
  if (visual.totalLabel) cells.push({ name: visual.totalLabel, value: visual.total ?? null });

  // 판은 표가 차지하는 만큼만 깔아 자리를 더 쓰지 않습니다. 예전에는
  // 판을 아예 깔지 않고 자리의 검은 바탕에 흰 글자로 그렸는데, 자세히
  // 보기 창은 바탕이 밝아 글자가 보이지 않았습니다.
  const labelWidth = 96;
  const cellWidth = Math.max(58, Math.min(84, Math.round(320 / Math.max(cells.length, 1))));
  const rowHeight = 38;
  const edge = 4;
  const width = edge * 2 + labelWidth + cellWidth * cells.length;
  const height = edge * 2 + rowHeight * 2;
  const gridWidth = labelWidth + cellWidth * cells.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect
        x={edge}
        y={edge}
        width={gridWidth}
        height={rowHeight * 2}
        rx="10"
        fill="#f6fcff"
        stroke="#d7edf2"
      />
      {[0, 1].map((row) => (
        <rect
          key={row}
          x={edge}
          y={edge + row * rowHeight}
          width={gridWidth}
          height={rowHeight}
          fill={row === 0 ? '#e6f7f7' : 'transparent'}
          stroke="#7fc3ce"
          strokeWidth="2"
        />
      ))}
      {[visual.categoryLabel, visual.valueLabel].map((text, row) => (
        <text
          key={text}
          x={edge + labelWidth / 2}
          y={edge + row * rowHeight + rowHeight / 2 + 6}
          textAnchor="middle"
          fill="#0f7175"
          fontSize="16"
          fontWeight="900"
        >
          {text}
        </text>
      ))}
      {cells.map((cell, index) => {
        const x = edge + labelWidth + index * cellWidth;
        const isTotal = Boolean(visual.totalLabel) && index === cells.length - 1;
        return (
          <g key={`${cell.name}-${index}`}>
            <line x1={x} y1={edge} x2={x} y2={edge + rowHeight * 2} stroke="#7fc3ce" strokeWidth="2" />
            <text
              x={x + cellWidth / 2}
              y={edge + rowHeight / 2 + 6}
              textAnchor="middle"
              fill={isTotal ? '#8a6500' : '#24364a'}
              fontSize="16"
              fontWeight="900"
            >
              {cell.name}
            </text>
            <text
              x={x + cellWidth / 2}
              y={edge + rowHeight + rowHeight / 2 + 7}
              textAnchor="middle"
              fill={cell.value === null ? '#c2454f' : '#24364a'}
              fontSize="19"
              fontWeight="900"
            >
              {cell.value === null ? '?' : cell.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function CalendarGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'calendar' }> }) {
  const cellWidth = 38;
  const cellHeight = 31;
  const left = 12;
  const firstRowBaseline = 56;
  const rows = Math.ceil((visual.startWeekday + visual.days) / 7);
  const width = left * 2 + cellWidth * 7;
  const height = firstRowBaseline + rows * cellHeight - 4;
  const fill = { start: '#dffafa', end: '#fff4bd' };
  const stroke = { start: '#0f9f9f', end: '#d4a62f' };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="3" y="3" width={width - 6} height={height - 6} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {WEEKDAY_NAMES.map((name, index) => (
        <text
          key={name}
          x={left + index * cellWidth + cellWidth / 2}
          y="28"
          textAnchor="middle"
          fill={index === 0 ? '#c2454f' : index === 6 ? '#2f6fb5' : '#0f7175'}
          fontSize="15"
          fontWeight="900"
        >
          {name}
        </text>
      ))}
      {Array.from({ length: visual.days }).map((_, index) => {
        const day = index + 1;
        const slot = visual.startWeekday + index;
        const cx = left + (slot % 7) * cellWidth + cellWidth / 2;
        const baseline = firstRowBaseline + Math.floor(slot / 7) * cellHeight;
        const mark = visual.marks.find((item) => item.day === day);

        return (
          <g key={day}>
            {mark && (
              <circle cx={cx} cy={baseline - 5} r="14" fill={fill[mark.tone]} stroke={stroke[mark.tone]} strokeWidth="3" />
            )}
            <text
              x={cx}
              y={baseline}
              textAnchor="middle"
              fill={slot % 7 === 0 ? '#c2454f' : '#24364a'}
              fontSize="15"
              fontWeight={mark ? 900 : 700}
            >
              {day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// '다음 달은 몇 월', '1년은 몇 개월'처럼 달의 순서·개수를 묻는 문제용
// 연간 달력입니다. 하루짜리 달력(day grid)으로는 몇 월 다음이 몇 월인지
// 보여줄 수 없어서, 1월~12월을 3×4 칸으로 늘어놓습니다.
function YearCalendarGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'year-calendar' }> }) {
  const columns = 4;
  const rows = 3;
  const cellWidth = 84;
  const cellHeight = 44;
  const left = 12;
  const top = 12;
  const width = left * 2 + cellWidth * columns;
  const height = top * 2 + cellHeight * rows;
  const markedMonths = new Set(visual.marks.map((mark) => mark.month));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="3" y="3" width={width - 6} height={height - 6} rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {Array.from({ length: 12 }).map((_, index) => {
        const month = index + 1;
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = left + column * cellWidth;
        const y = top + row * cellHeight;
        const marked = markedMonths.has(month);
        return (
          <g key={month}>
            <rect
              x={x + 4}
              y={y + 4}
              width={cellWidth - 8}
              height={cellHeight - 8}
              rx="10"
              fill={marked ? '#dffafa' : '#ffffff'}
              stroke={marked ? '#0f9f9f' : '#cfeaf0'}
              strokeWidth={marked ? 3 : 2}
            />
            <text
              x={x + cellWidth / 2}
              y={y + cellHeight / 2 + 6}
              textAnchor="middle"
              fill="#24364a"
              fontSize="17"
              fontWeight={marked ? 900 : 700}
            >
              {month}월
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// 교과서의 그래프는 항목을 아래 가로줄에 두고 ○를 아래에서 위로 쌓습니다.
// '아래에서부터 한 칸에 하나씩 그립니다'라고 가르쳐 놓고 옆으로 눕힌
// 그림만 보여 주면, 배우는 그림과 보는 그림이 다릅니다.
function StandingPictograph({ visual }: { visual: Extract<QuestionVisual, { kind: 'pictograph' }> }) {
  const items = visual.items.slice(0, 4);
  const tallest = Math.max(1, ...items.map((item) => Math.ceil(item.count / visual.unit)));
  const rows = Math.min(Math.max(tallest, 3), 10);
  const cell = 20;
  const left = 70;
  const columnWidth = 62;
  const bottom = 20 + rows * cell;
  const width = left + items.length * columnWidth + 16;
  const height = bottom + 28;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="3" y="3" width={width - 6} height={height - 6} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {/* 세로 눈금입니다. 몇 칸째인지 세지 않아도 되도록 수를 적습니다. */}
      {Array.from({ length: rows }).map((_, row) => {
        const y = bottom - row * cell;
        return (
          <g key={`rule-${row}`}>
            <line x1={left - 6} y1={y} x2={width - 16} y2={y} stroke="#dbeef3" strokeWidth="1" />
            <text x={left - 12} y={y - cell / 2 + 5} textAnchor="end" fill="#5b7c8a" fontSize="12" fontWeight="800">
              {row + 1}
            </text>
          </g>
        );
      })}
      <line x1={left - 6} y1={bottom} x2={width - 16} y2={bottom} stroke="#7fb9bb" strokeWidth="2.5" />
      <line x1={left - 6} y1="16" x2={left - 6} y2={bottom} stroke="#7fb9bb" strokeWidth="2.5" />
      {items.map((item, index) => {
        const x = left + index * columnWidth + columnWidth / 2;
        const units = Math.min(Math.ceil(item.count / visual.unit), rows);
        // 학생이 채울 줄입니다. ○를 그리지 않고 자리만 비워 둡니다.
        // 성취수준 [2수04-03] C가 '일부가 주어진 그래프를 완성하기'라,
        // 채워야 할 곳이 눈에 보여야 물음이 성립합니다.
        const blank = visual.blankAt === index;
        return (
          <g key={`${item.label}-${index}`}>
            {blank && (
              <g>
                <rect
                  x={x - 14}
                  y={bottom - rows * cell}
                  width="28"
                  height={rows * cell}
                  rx="6"
                  fill="#fff1f3"
                  stroke="#ff9aa2"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
                <text x={x} y={bottom - cell / 2 + 5} textAnchor="middle" fill="#c2485a" fontSize="16" fontWeight="900">
                  ?
                </text>
              </g>
            )}
            {!blank && Array.from({ length: units }).map((_, at) => (
              <circle
                key={at}
                cx={x}
                cy={bottom - at * cell - cell / 2}
                r="7.5"
                fill="#dffafa"
                stroke="#0f9f9f"
                strokeWidth="2"
              />
            ))}
            <text x={x} y={bottom + 18} textAnchor="middle" fill="#24364a" fontSize="13" fontWeight="900">
              {item.label}
            </text>
          </g>
        );
      })}
      <text x={left - 12} y="13" textAnchor="end" fill="#0f7175" fontSize="12" fontWeight="900">
        수
      </text>
    </svg>
  );
}

function PictographGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'pictograph' }> }) {
  if (visual.orientation === 'up') return <StandingPictograph visual={visual} />;

  // 줄이 셋이든 넷이든 한 크기로 그려서, 셋일 때는 아래가 34px 비었습니다.
  // 보기 넷이 세로로 서는 자리에서는 그 여백이 네 번 쌓입니다.
  const rows = Math.min(visual.items.length, 4);
  const firstRow = 26;
  const bottom = firstRow + (rows - 1) * 24 + 16;
  const height = bottom + 8;

  return (
    <svg viewBox={`0 0 376 ${height}`} role="img" aria-label={visual.label}>
      <rect x="4" y="3" width="368" height={height - 6} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      <text x="188" y="18" textAnchor="middle" fill="#0f7175" fontSize="13" fontWeight="900">
        한 칸 = {visual.unit}
      </text>
      {visual.items.slice(0, 4).map((item, index) => {
        const y = firstRow + index * 24;
        const units = Math.ceil(item.count / visual.unit);
        return (
          <g key={`${item.label}-${index}`}>
            <text x="28" y={y + 15} fill="#24364a" fontSize="14" fontWeight="900">
              {item.label}
            </text>
            {Array.from({ length: units }).map((_, unitIndex) => (
              <rect
                key={unitIndex}
                x={100 + unitIndex * 22}
                y={y}
                width="16"
                height="16"
                rx="5"
                fill={unitIndex * visual.unit + visual.unit <= item.count ? '#dffafa' : '#fff4bd'}
                stroke="#0f9f9f"
              />
            ))}
            <text x="326" y={y + 15} fill="#182433" fontSize="14" fontWeight="900">
              {item.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ArrayGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'array' }> }) {
  const plotWidth = 316;
  const plotHeight = 100;
  const baseGap = visual.rows >= 7 || visual.columns >= 7 ? 3 : 10;
  const gap = Math.min(baseGap, Math.max(2, plotWidth / Math.max(visual.columns * 4, 1)));
  const maxDotByWidth = (plotWidth - (visual.columns - 1) * gap) / visual.columns;
  const maxDotByHeight = (plotHeight - (visual.rows - 1) * gap) / visual.rows;
  const dot = Math.max(6, Math.min(20, maxDotByWidth, maxDotByHeight));
  const width = visual.columns * dot + (visual.columns - 1) * gap;
  const height = visual.rows * dot + (visual.rows - 1) * gap;
  const startX = 188 - width / 2;
  const startY = 12 + (plotHeight - height) / 2;

  return (
    <svg viewBox="0 0 376 146" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="134" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      <rect x="30" y="10" width="316" height="110" rx="12" fill="#ffffff" stroke="#d7edf2" opacity="0.68" />
      {Array.from({ length: visual.rows }).map((_, row) =>
        Array.from({ length: visual.columns }).map((__, column) => {
          const faded = visual.fadedRows != null && row >= visual.rows - visual.fadedRows;
          // 아직 세지 않은 묶음은 그리지 않습니다. 자리는 그대로 두어
          // 그림의 크기가 탭할 때마다 들썩이지 않게 합니다.
          if (visual.shownRows !== undefined && row >= visual.shownRows) return null;
          // 묶지 않은 물건은 적힌 개수만큼만 그립니다. 마지막 줄이 다
          // 차지 않으면 남는 자리는 비워 둡니다 — 7개라고 적어 놓고
          // 다섯 개짜리 두 줄(열 개)을 그리면 말과 그림이 어긋납니다.
          if (visual.plainCount !== undefined && row * visual.columns + column >= visual.plainCount) {
            return null;
          }
          return (
            <circle
              key={`${row}-${column}`}
              cx={startX + column * (dot + gap) + dot / 2}
              cy={startY + row * (dot + gap) + dot / 2}
              r={dot / 2}
              fill={faded ? '#fff4bd' : '#dffafa'}
              stroke="#0f9f9f"
              strokeWidth="2"
            />
          );
        }),
      )}
      {/* 설명이 곧 답이 되는 문항에서는 이 줄을 통째로 뺍니다. 빈 띠만
          남겨 두면 무언가 지워진 자리처럼 보여 아이가 신경을 씁니다. */}
      {!visual.hideCaption && (
        <>
          <rect x="112" y="121" width="152" height="20" rx="10" fill="#e8fbfb" />
          <text x="188" y="136" textAnchor="middle" fill="#0f7175" fontSize="13" fontWeight="900">
            {/* 우리말은 '한 묶음의 크기'를 먼저 말합니다 — 5개씩 2묶음.
                '2묶음 × 5개'로 적어 두었더니 무엇이 묶음이고 무엇이 낱개인지
                거꾸로 읽혔습니다. */}
            {visual.plainCount === undefined
              ? `${visual.columns}개씩 ${visual.rows}묶음`
              : `${visual.plainCount}개`}
          </text>
        </>
      )}
    </svg>
  );
}

// 곱셈표·덧셈표를 그립니다. 맨 윗줄과 맨 왼쪽 줄이 머리이고, 가운데가 값입니다.
function GridTableGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'grid-table' }> }) {
  const columns = visual.columns.slice(0, 6);
  const rows = visual.rows.slice(0, 4);
  const cellWidth = Math.min(52, 340 / (columns.length + 1));
  const cellHeight = 26;
  const left = (376 - cellWidth * (columns.length + 1)) / 2;
  const top = 10;
  const valueOf = (row: number, column: number) =>
    visual.operation === '×' ? row * column : row + column;

  return (
    <svg viewBox={`0 0 376 ${top + cellHeight * (rows.length + 1) + 10}`} role="img" aria-label={visual.label}>
      {/* 머리 칸: 연산 기호와 가로줄 숫자 */}
      <rect x={left} y={top} width={cellWidth} height={cellHeight} fill="#e6f7f7" stroke="#0f9f9f" strokeWidth="2" />
      <text x={left + cellWidth / 2} y={top + 18} textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">
        {visual.operation}
      </text>
      {columns.map((column, at) => (
        <g key={`head-${column}`}>
          <rect x={left + cellWidth * (at + 1)} y={top} width={cellWidth} height={cellHeight} fill="#e6f7f7" stroke="#0f9f9f" strokeWidth="2" />
          <text x={left + cellWidth * (at + 1.5)} y={top + 18} textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">
            {column}
          </text>
        </g>
      ))}

      {rows.map((row, rowAt) => {
        const y = top + cellHeight * (rowAt + 1);
        const lit = visual.highlightRow === row;
        return (
          <g key={`row-${row}`}>
            <rect x={left} y={y} width={cellWidth} height={cellHeight} fill="#e6f7f7" stroke="#0f9f9f" strokeWidth="2" />
            <text x={left + cellWidth / 2} y={y + 18} textAnchor="middle" fill="#0f7175" fontSize="15" fontWeight="900">
              {row}
            </text>
            {columns.map((column, at) => {
              const hidden = visual.blank?.row === row && visual.blank?.column === column;
              return (
                <g key={`cell-${row}-${column}`}>
                  <rect
                    x={left + cellWidth * (at + 1)}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    fill={hidden ? '#fff4bd' : lit ? '#dffafa' : '#ffffff'}
                    stroke={lit || hidden ? '#0f9f9f' : '#cfeaf0'}
                    strokeWidth={lit || hidden ? 2.4 : 1.6}
                  />
                  <text
                    x={left + cellWidth * (at + 1.5)}
                    y={y + 18}
                    textAnchor="middle"
                    fill={hidden ? '#9a6b12' : '#182433'}
                    fontSize="15"
                    fontWeight={lit || hidden ? 900 : 800}
                  >
                    {hidden ? '?' : valueOf(row, column)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function PatternGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'pattern' }> }) {
  const items = visual.items.slice(0, 9);
  // 칸을 28px로 못박아 두었더니 ○△□ 말고는 다 넘쳤습니다 — '초록',
  // '10분'처럼 글자로 늘어놓는 되풀이도 이 그림으로 보여 줍니다.
  const longest = items.reduce((max, item) => Math.max(max, [...item].length), 1);
  const cell = Math.max(30, longest * 16 + 12);
  const gap = 8;
  const edge = 18;
  const width = edge * 2 + items.length * cell + Math.max(0, items.length - 1) * gap;
  const height = 62;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      <rect x="2" y="2" width={width - 4} height={height - 4} rx="12" fill="#f6fcff" stroke="#d7edf2" />
      {items.map((item, index) => {
        const isMissing = visual.missingIndex === index;
        const x = edge + index * (cell + gap);
        return (
          <g key={`${item}-${index}`}>
            <rect x={x} y="14" width={cell} height="34" rx="8" fill={isMissing ? '#fff4bd' : '#dffafa'} stroke="#0f9f9f" strokeWidth="2" />
            <text x={x + cell / 2} y="38" textAnchor="middle" fill="#182433" fontSize="19" fontWeight="900">
              {isMissing ? '?' : item}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function QuestionVisualGraphic({ visual, className = '' }: QuestionVisualGraphicProps) {
  if (!visual) return null;

  return (
    // 표는 두 줄이라 옆으로 넓고 세로로 낮습니다. 다른 그림과 같은 키를
    // 주면 위아래가 빈 채로 자리만 차지합니다.
    <figure
      className={[
        'question-visual-figure',
        visual.kind === 'clock' ? 'is-clock' : '',
        visual.kind === 'table' ? 'is-table' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={visual.label}
    >
      {visual.kind === 'plane-shapes' && <PlaneShapesGraphic visual={visual} />}
      {visual.kind === 'cube-stack' && <CubeStackGraphic visual={visual} />}
      {visual.kind === 'cube-pattern' && <CubePatternGraphic visual={visual} />}
      {visual.kind === 'cube-views' && <CubeViewsGraphic visual={visual} />}
      {visual.kind === 'tangram' && <TangramGraphic visual={visual} />}
      {visual.kind === 'number-line' && <NumberLineGraphic visual={visual} />}
      {visual.kind === 'range-line' && <RangeLineGraphic visual={visual} />}
      {visual.kind === 'fraction-model' && <FractionModelGraphic visual={visual} />}
      {visual.kind === 'figure-set' && <FigureSetGraphic visual={visual} />}
      {visual.kind === 'box-drawing' && <BoxDrawingGraphic visual={visual} />}
      {visual.kind === 'box-net' && <BoxNetGraphic visual={visual} />}
      {visual.kind === 'spinner' && <SpinnerGraphic visual={visual} />}
      {visual.kind === 'marble-bag' && <MarbleBagGraphic visual={visual} />}
      {visual.kind === 'unit-measure' && <UnitMeasureGraphic visual={visual} />}
      {visual.kind === 'place-value' && <PlaceValueGraphic visual={visual} />}
      {visual.kind === 'bar-model' && <BarModelGraphic visual={visual} />}
      {visual.kind === 'ruler' && <RulerGraphic visual={visual} />}
      {visual.kind === 'clock' && <ClockGraphic visual={visual} />}
      {visual.kind === 'calendar' && <CalendarGraphic visual={visual} />}
      {visual.kind === 'year-calendar' && <YearCalendarGraphic visual={visual} />}
      {visual.kind === 'table' && <TableGraphic visual={visual} />}
      {visual.kind === 'pictograph' && <PictographGraphic visual={visual} />}
      {visual.kind === 'array' && <ArrayGraphic visual={visual} />}
      {visual.kind === 'pattern' && <PatternGraphic visual={visual} />}
      {visual.kind === 'grid-table' && <GridTableGraphic visual={visual} />}
    </figure>
  );
}
