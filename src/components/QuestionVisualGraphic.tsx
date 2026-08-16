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

const renderCube = (cube: { x: number; y: number; z: number }, index: number) => {
  const sx = 160 + (cube.x - cube.y) * 32;
  const sy = 34 + (cube.x + cube.y) * 17 - cube.z * 32;
  const top = `${sx},${sy} ${sx + 28},${sy + 14} ${sx},${sy + 28} ${sx - 28},${sy + 14}`;
  const left = `${sx - 28},${sy + 14} ${sx},${sy + 28} ${sx},${sy + 60} ${sx - 28},${sy + 46}`;
  const right = `${sx + 28},${sy + 14} ${sx},${sy + 28} ${sx},${sy + 60} ${sx + 28},${sy + 46}`;

  return (
    <g key={`${cube.x}-${cube.y}-${cube.z}-${index}`}>
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
          .map(renderCube)}
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
      {visual.marks.map((mark, index) => (
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
            <text x={x + (cellWidth - 8) / 2} y="106" textAnchor="middle" fill="#182433" fontSize="24" fontWeight="900">
              {column.value}
            </text>
            {Array.from({ length: blockCount }).map((_, blockIndex) => (
              <rect
                key={blockIndex}
                x={x + 12 + (blockIndex % 6) * 10}
                y={56 + Math.floor(blockIndex / 6) * 12}
                width="7"
                height="7"
                rx="2"
                fill="#dffafa"
                stroke="#0f9f9f"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function BarModelGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'bar-model' }> }) {
  const maxValue = Math.max(...visual.bars.map((bar) => bar.value), 1);

  return (
    <svg viewBox="0 0 376 150" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="138" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {visual.bars.slice(0, 4).map((bar, index) => {
        const y = 28 + index * 28;
        const width = Math.max(24, (bar.value / maxValue) * 220);
        return (
          <g key={`${bar.label}-${index}`}>
            <text x="28" y={y + 18} fill="#24364a" fontSize="14" fontWeight="900">
              {bar.label}
            </text>
            <rect x="104" y={y} width="230" height="22" rx="7" fill="#eef6f8" />
            <rect x="104" y={y} width={width} height="22" rx="7" fill={index % 2 === 0 ? '#dffafa' : '#fff4bd'} stroke="#0f9f9f" />
            <text x={Math.min(344, 114 + width)} y={y + 17} fill="#182433" fontSize="14" fontWeight="900">
              {bar.value}
            </text>
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
      <rect x={toX(visual.highlightStart)} y="50" width={toX(visual.highlightEnd) - toX(visual.highlightStart)} height="42" rx="6" fill="#dffafa" opacity="0.9" />
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
}: {
  hour: number;
  minute: number;
  x: number;
  label: string;
  example?: boolean;
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
      <circle cx={x} cy={CLOCK_CENTER_Y} r="5" fill="#182433" opacity={example ? 0.55 : 1} />
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
        label={example ? '바늘 위치는 바뀔 수 있어요' : '시작'}
        example={example}
      />
      {hasEnd && <ClockFace hour={visual.endHour ?? visual.hour} minute={visual.endMinute ?? visual.minute} x={230} label="끝" />}
    </svg>
  );
}

function TableGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'table' }> }) {
  const cells = [...visual.columns.map((column) => ({ name: column.name, value: column.value }))];
  if (visual.totalLabel) cells.push({ name: visual.totalLabel, value: visual.total ?? null });

  // 흰 카드 위에 표를 얹으면 카드의 둥근 모서리와 안쪽 여백이 세로의
  // 3분의 1을 먹습니다. 표는 선과 글자만 있으면 표이므로, 자리의 검은
  // 바탕에 그대로 긋습니다.
  const labelWidth = 96;
  const cellWidth = Math.max(58, Math.min(84, Math.round(320 / Math.max(cells.length, 1))));
  const rowHeight = 38;
  const edge = 4;
  const width = edge * 2 + labelWidth + cellWidth * cells.length;
  const height = edge * 2 + rowHeight * 2;
  const gridWidth = labelWidth + cellWidth * cells.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={visual.label}>
      {[0, 1].map((row) => (
        <rect
          key={row}
          x={edge}
          y={edge + row * rowHeight}
          width={gridWidth}
          height={rowHeight}
          fill={row === 0 ? 'rgba(126, 226, 255, 0.14)' : 'transparent'}
          stroke="#6fd3ea"
          strokeWidth="2"
        />
      ))}
      {[visual.categoryLabel, visual.valueLabel].map((text, row) => (
        <text
          key={text}
          x={edge + labelWidth / 2}
          y={edge + row * rowHeight + rowHeight / 2 + 6}
          textAnchor="middle"
          fill="#8ee9ff"
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
            <line x1={x} y1={edge} x2={x} y2={edge + rowHeight * 2} stroke="#6fd3ea" strokeWidth="2" />
            <text
              x={x + cellWidth / 2}
              y={edge + rowHeight / 2 + 6}
              textAnchor="middle"
              fill={isTotal ? '#ffd479' : '#ffffff'}
              fontSize="16"
              fontWeight="900"
            >
              {cell.name}
            </text>
            <text
              x={x + cellWidth / 2}
              y={edge + rowHeight + rowHeight / 2 + 7}
              textAnchor="middle"
              fill={cell.value === null ? '#ff9aa2' : '#ffffff'}
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

function PictographGraphic({ visual }: { visual: Extract<QuestionVisual, { kind: 'pictograph' }> }) {
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
      <rect x="112" y="121" width="152" height="20" rx="10" fill="#e8fbfb" />
      <text x="188" y="136" textAnchor="middle" fill="#0f7175" fontSize="13" fontWeight="900">
        {visual.rows}묶음 × {visual.columns}개
      </text>
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
  return (
    <svg viewBox="0 0 376 126" role="img" aria-label={visual.label}>
      <rect x="4" y="6" width="368" height="114" rx="14" fill="#f6fcff" stroke="#d7edf2" />
      {visual.items.slice(0, 9).map((item, index) => {
        const isMissing = visual.missingIndex === index;
        return (
          <g key={`${item}-${index}`}>
            <rect x={30 + index * 36} y="40" width="28" height="28" rx="8" fill={isMissing ? '#fff4bd' : '#dffafa'} stroke="#0f9f9f" strokeWidth="2" />
            <text x={44 + index * 36} y="60" textAnchor="middle" fill="#182433" fontSize="17" fontWeight="900">
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
      {visual.kind === 'unit-measure' && <UnitMeasureGraphic visual={visual} />}
      {visual.kind === 'place-value' && <PlaceValueGraphic visual={visual} />}
      {visual.kind === 'bar-model' && <BarModelGraphic visual={visual} />}
      {visual.kind === 'ruler' && <RulerGraphic visual={visual} />}
      {visual.kind === 'clock' && <ClockGraphic visual={visual} />}
      {visual.kind === 'calendar' && <CalendarGraphic visual={visual} />}
      {visual.kind === 'table' && <TableGraphic visual={visual} />}
      {visual.kind === 'pictograph' && <PictographGraphic visual={visual} />}
      {visual.kind === 'array' && <ArrayGraphic visual={visual} />}
      {visual.kind === 'pattern' && <PatternGraphic visual={visual} />}
      {visual.kind === 'grid-table' && <GridTableGraphic visual={visual} />}
    </figure>
  );
}
