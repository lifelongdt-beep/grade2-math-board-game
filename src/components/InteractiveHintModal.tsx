import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { X } from 'lucide-react';
import type { QuestionVisual } from '../types';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import { playTapSound } from '../sound';

interface InteractiveHintModalProps {
  visual: QuestionVisual;
  onClose: () => void;
}

// ════════════════════════════════════════════════════════════════════
// 3단계 힌트: 조작형 인터랙티브 힌트
// ────────────────────────────────────────────────────────────────────
// 1단계(핵심 말 강조)와 2단계(정지된 그림)는 문제 자리에 이미 있습니다.
// 여기서는 그 그림을 손으로 만져 볼 수 있게 합니다 — 시곗바늘을 돌리고,
// 수 모형을 모으거나 지우고, 그림을 하나씩 짚어 세어 봅니다.
//
// 그림마다 만지는 방법이 다르므로 갈래별로 다른 위젯을 둡니다. 아직
// 따로 만들지 않은 갈래는 그림을 크게 보여 주고 짚어 세는 위젯으로
// 받습니다 — 힌트가 없는 것보다는 세어 볼 수 있는 편이 낫습니다.
// ════════════════════════════════════════════════════════════════════

function InteractiveClock() {
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragHand = useRef<'hour' | 'minute' | null>(null);

  const cx = 150;
  const cy = 150;
  const radius = 118;

  const hourAngle = (((hour % 12) + minute / 60) / 12) * Math.PI * 2;
  const minuteAngle = (minute / 60) * Math.PI * 2;
  const hourTip = { x: cx + Math.sin(hourAngle) * 62, y: cy - Math.cos(hourAngle) * 62 };
  const minuteTip = { x: cx + Math.sin(minuteAngle) * 94, y: cy - Math.cos(minuteAngle) * 94 };

  const angleFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    // 뷰박스가 300x300이므로 화면 크기를 그 비율로 되돌립니다.
    const scale = 300 / rect.width;
    const px = (clientX - rect.left) * scale;
    const py = (clientY - rect.top) * scale;
    const angle = Math.atan2(px - cx, cy - py);
    return angle < 0 ? angle + Math.PI * 2 : angle;
  };

  const startDrag = (hand: 'hour' | 'minute', event: ReactPointerEvent) => {
    event.preventDefault();
    (event.target as Element).setPointerCapture(event.pointerId);
    dragHand.current = hand;
    playTapSound();
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    if (!dragHand.current) return;
    const angle = angleFromPointer(event.clientX, event.clientY);
    if (dragHand.current === 'minute') {
      // 5분씩 짚어 세도록 눈금에 맞춥니다 — 2학년이 배우는 방식 그대로입니다.
      const snapped = Math.round((angle / (Math.PI * 2)) * 12) % 12;
      setMinute(((snapped * 5) % 60 + 60) % 60);
    } else {
      const snapped = Math.round((angle / (Math.PI * 2)) * 12) % 12;
      setHour(snapped === 0 ? 12 : snapped);
    }
  };

  const endDrag = () => {
    dragHand.current = null;
  };

  return (
    <div className="interactive-clock-widget">
      <svg
        ref={svgRef}
        viewBox="0 0 300 300"
        role="img"
        aria-label="움직여 볼 수 있는 시계"
        className="interactive-clock-svg"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <circle cx={cx} cy={cy} r={radius} fill="#ffffff" stroke="#8aa0b8" strokeWidth="4" />
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = ((index + 1) / 12) * Math.PI * 2;
          const numberPoint = { x: cx + Math.sin(angle) * 98, y: cy - Math.cos(angle) * 98 };
          const tickInner = { x: cx + Math.sin(angle) * 106, y: cy - Math.cos(angle) * 106 };
          const tickOuter = { x: cx + Math.sin(angle) * 116, y: cy - Math.cos(angle) * 116 };
          return (
            <g key={index}>
              <line x1={tickInner.x} y1={tickInner.y} x2={tickOuter.x} y2={tickOuter.y} stroke="#8aa0b8" strokeWidth="3" />
              <text x={numberPoint.x} y={numberPoint.y + 7} textAnchor="middle" fill="#24364a" fontSize="20" fontWeight="900">
                {index + 1}
              </text>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={hourTip.x} y2={hourTip.y} stroke="#182433" strokeWidth="9" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={minuteTip.x} y2={minuteTip.y} stroke="#0f9f9f" strokeWidth="7" strokeLinecap="round" />
        {/* 손가락으로 짚기 쉽도록 바늘 끝에 큰 손잡이를 둡니다. */}
        <circle
          cx={hourTip.x}
          cy={hourTip.y}
          r="17"
          fill="#182433"
          opacity="0.001"
          className="hand-grip"
          onPointerDown={(event) => startDrag('hour', event)}
        />
        <circle
          cx={minuteTip.x}
          cy={minuteTip.y}
          r="17"
          fill="#0f9f9f"
          opacity="0.001"
          className="hand-grip"
          onPointerDown={(event) => startDrag('minute', event)}
        />
        <circle cx={cx} cy={cy} r="7" fill="#182433" />
      </svg>
      <div className="interactive-clock-readout">
        <span className="interactive-clock-digital">
          {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
        </span>
        <p>짧은바늘(검정)과 긴바늘(초록)을 손가락으로 돌려 보세요.</p>
      </div>
    </div>
  );
}

const PLACE_MULTIPLIER: Record<string, number> = { 천: 1000, 백: 100, 십: 10, 일: 1 };

function InteractivePlaceValue({ visual }: { visual: Extract<QuestionVisual, { kind: 'place-value' }> }) {
  const [values, setValues] = useState(() => visual.columns.map((column) => column.value));

  const multiplierFor = (label: string, indexFromRight: number) =>
    PLACE_MULTIPLIER[label] ?? 10 ** indexFromRight;

  const total = values.reduce((sum, value, index) => {
    const indexFromRight = values.length - 1 - index;
    return sum + value * multiplierFor(visual.columns[index].label, indexFromRight);
  }, 0);

  const change = (index: number, delta: number) => {
    playTapSound();
    setValues((prev) => prev.map((value, at) => (at === index ? Math.max(0, Math.min(9, value + delta)) : value)));
  };

  return (
    <div className="interactive-place-value-widget">
      <div className="interactive-place-value-columns">
        {visual.columns.map((column, index) => (
          <div key={`${column.label}-${index}`} className="interactive-place-value-column">
            <span className="interactive-place-value-label">{column.label}</span>
            <div className="interactive-place-value-blocks">
              {Array.from({ length: values[index] }).map((_, blockIndex) => (
                <span key={blockIndex} className="interactive-place-value-block" />
              ))}
            </div>
            <span className="interactive-place-value-value">{values[index]}</span>
            <div className="interactive-place-value-buttons">
              <button type="button" onClick={() => change(index, -1)} aria-label={`${column.label} 하나 지우기`}>−</button>
              <button type="button" onClick={() => change(index, 1)} aria-label={`${column.label} 하나 모으기`}>+</button>
            </div>
          </div>
        ))}
      </div>
      <p className="interactive-place-value-total">
        모두 <strong>{total.toLocaleString('ko-KR')}</strong>
      </p>
    </div>
  );
}

function InteractiveCounter({ visual }: { visual: QuestionVisual }) {
  const [count, setCount] = useState(0);

  const tap = () => {
    playTapSound();
    setCount((value) => value + 1);
  };

  return (
    <div className="interactive-counter-widget">
      <div className="interactive-counter-visual">
        <QuestionVisualGraphic visual={visual} />
      </div>
      <button type="button" className="interactive-counter-button" onClick={tap}>
        <span className="interactive-counter-number">{count}</span>
        <span>탭해서 하나씩 세어 보세요</span>
      </button>
      {count > 0 && (
        <button type="button" className="interactive-counter-reset" onClick={() => setCount(0)}>
          다시 세기
        </button>
      )}
    </div>
  );
}

// 낱개 물건을 하나씩 짚어 세는 그림만 탭 카운터가 맞습니다. 달력·
// 수직선·자·막대·표·규칙·칠교판은 세는 것이 아니라 읽거나 견주는
// 그림이라, 탭 카운터를 붙이면 문제와 상관없는 숫자만 늘어납니다.
// 이런 그림은 세지 않고 그림만 크게 보여 줍니다.
const COUNTABLE_KINDS = new Set<QuestionVisual['kind']>([
  'array',
  'pictograph',
  'cube-stack',
  'cube-pattern',
  'cube-views',
  'unit-measure',
  'plane-shapes',
]);

const enlargedCaptionFor = (visual: QuestionVisual) => {
  if (visual.kind === 'calendar' || visual.kind === 'year-calendar') return '달력을 자세히 살펴보세요';
  if (visual.kind === 'number-line') return '수직선을 자세히 살펴보세요';
  if (visual.kind === 'ruler') return '자를 자세히 살펴보세요';
  if (visual.kind === 'bar-model') return '막대를 자세히 살펴보세요';
  if (visual.kind === 'grid-table' || visual.kind === 'table') return '표를 자세히 살펴보세요';
  if (visual.kind === 'pattern') return '규칙을 자세히 살펴보세요';
  if (visual.kind === 'tangram') return '칠교판을 자세히 살펴보세요';
  return '그림을 자세히 살펴보세요';
};

function EnlargedVisual({ visual }: { visual: QuestionVisual }) {
  return (
    <div className="interactive-counter-widget">
      <div className="interactive-counter-visual interactive-enlarged-visual">
        <QuestionVisualGraphic visual={visual} />
      </div>
      <p className="interactive-enlarged-caption">{enlargedCaptionFor(visual)}</p>
    </div>
  );
}

const widgetTitleFor = (visual: QuestionVisual) => {
  if (visual.kind === 'clock') return '시계를 움직여 보세요';
  if (visual.kind === 'place-value') return '수 모형을 모으거나 지워 보세요';
  if (COUNTABLE_KINDS.has(visual.kind)) return '하나씩 짚어 세어 보세요';
  return enlargedCaptionFor(visual);
};

export function InteractiveHintModal({ visual, onClose }: InteractiveHintModalProps) {
  const isCountable = COUNTABLE_KINDS.has(visual.kind);
  return (
    <div className="hint-modal-overlay" role="dialog" aria-modal="true" aria-label="움직여 보는 힌트">
      <div className="hint-modal-card">
        <header>
          <h3>🔍 {widgetTitleFor(visual)}</h3>
          <button type="button" className="hint-modal-close" onClick={onClose} aria-label="닫기">
            <X size={22} />
          </button>
        </header>
        {visual.kind === 'clock' && <InteractiveClock />}
        {visual.kind === 'place-value' && <InteractivePlaceValue visual={visual} />}
        {visual.kind !== 'clock' && visual.kind !== 'place-value' && isCountable && (
          <InteractiveCounter visual={visual} />
        )}
        {visual.kind !== 'clock' && visual.kind !== 'place-value' && !isCountable && (
          <EnlargedVisual visual={visual} />
        )}
        <button type="button" className="hint-modal-done" onClick={onClose}>
          다 봤어요
        </button>
      </div>
    </div>
  );
}
