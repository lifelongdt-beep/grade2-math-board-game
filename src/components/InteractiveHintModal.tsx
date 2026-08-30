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

  // 묶음 그림에서는 한 묶음씩 셉니다.
  //
  // 하나씩 세면 1, 2, 3, 4…가 되어 곱셈구구를 배우는 자리에서 낱개
  // 세기로 되돌아갑니다. 묶어 세기는 4, 8, 12, 16, 20처럼 한 묶음이
  // 통째로 늘어나는 것을 보는 일입니다. 그 뛰는 폭이 곧 곱하는 수입니다.
  //
  // 묶지 않고 흩어 놓은 물건(plainCount)은 하나씩 세는 것이 맞습니다.
  const grouped = visual.kind === 'array' && visual.plainCount === undefined ? visual : null;
  const bundle = grouped ? grouped.columns : 1;
  const most = grouped ? grouped.rows * grouped.columns : Number.POSITIVE_INFINITY;
  const bundles = count / bundle;

  // 센 묶음만 나타납니다.
  //
  // 처음에는 흐리게만 두었습니다. 그런데 흐린 것도 보이는 것이라,
  // 아이 눈에는 스무 개가 처음부터 다 놓여 있고 색만 바뀌는 것으로
  // 보였습니다. 없다가 한 묶음씩 나타나야 '한 번 더 더하는 일'이
  // 눈에 들어옵니다.
  const shown: QuestionVisual = grouped
    ? { ...grouped, shownRows: bundles }
    : visual;

  const tap = () => {
    playTapSound();
    setCount((value) => Math.min(most, value + bundle));
  };

  return (
    <div className="interactive-counter-widget">
      <div className="interactive-counter-visual">
        <QuestionVisualGraphic visual={shown} />
      </div>
      <button type="button" className="interactive-counter-button" onClick={tap}>
        <span className="interactive-counter-number">{count}</span>
        {bundle > 1 ? (
          <>
            {/* '3×□=12에서 □는?'을 푸는 아이에게 필요한 것은 지금까지
                센 수만이 아니라 '몇 묶음째인가'입니다. 그것이 곧 □에
                들어갈 수입니다. 그래서 묶음 수를 큰 줄로 따로 둡니다. */}
            <span className="interactive-counter-step">
              {bundle}씩 <strong>{bundles}</strong>묶음째
            </span>
            <span>
              {count >= most
                ? '다 나왔어요. 몇 묶음이었는지 세어 보세요'
                : bundles === 0
                  ? '탭하면 한 묶음씩 나타나요'
                  : '탭하면 한 묶음 더 나타나요'}
            </span>
          </>
        ) : (
          <span>탭해서 하나씩 세어 보세요</span>
        )}
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

// 그림을 크게 보여 주는 것만으로는 푸는 길이 보이지 않습니다. 그림
// 갈래마다 '어디를 먼저 보는지'가 정해져 있는데, 그것을 아는 아이만
// 그림에서 답을 찾습니다. 자는 양 끝의 눈금을 보고 그 사이 칸을 세고,
// 달력은 세로줄이 같은 요일이라는 것을 알아야 읽힙니다.
//
// 답은 알려 주지 않습니다. 보는 차례만 알려 줍니다.
const readingStepsFor = (visual: QuestionVisual): string[] => {
  switch (visual.kind) {
    case 'calendar':
    case 'year-calendar':
      return [
        '세로로 줄지어 있는 날짜는 모두 같은 요일이에요.',
        '한 줄 아래로 내려가면 7일 뒤예요.',
        '날짜를 손가락으로 짚으며 세어 보세요.',
      ];
    case 'number-line':
      return [
        '눈금과 눈금 사이가 얼마씩 벌어지는지 보세요.',
        '색이 진한 점이 어디인지 찾으세요.',
        '거기에서 몇 번 뛰면 되는지 세어 보세요.',
      ];
    case 'ruler':
      return [
        '물건의 왼쪽 끝이 어느 눈금에 있는지 보세요.',
        '오른쪽 끝이 어느 눈금에 있는지 보세요.',
        '두 눈금 사이가 몇 칸인지 세어 보세요.',
      ];
    case 'bar-model':
      return [
        '어느 막대가 더 긴지 보세요.',
        '짧은 막대가 긴 막대 안에 몇 번 들어가는지 보세요.',
      ];
    case 'table':
    case 'grid-table':
      return [
        '맨 윗줄이 무엇을 뜻하는지 읽으세요.',
        '문제가 묻는 것이 어느 칸인지 손가락으로 짚으세요.',
        '그 칸에 적힌 수를 읽으세요.',
      ];
    case 'pictograph':
      return [
        '한 칸이 하나를 뜻해요.',
        '줄마다 칸이 몇 개인지 세어 보세요.',
        '줄끼리 견주어 어느 줄이 긴지 보세요.',
      ];
    case 'array':
      return [
        '한 줄에 몇 개씩 있는지 세어 보세요.',
        '그런 줄이 몇 줄인지 세어 보세요.',
      ];
    case 'pattern':
      return [
        '처음부터 보면서 되풀이되는 부분을 찾으세요.',
        '몇 개마다 되풀이되는지 세어 보세요.',
      ];
    case 'tangram':
      return [
        '조각의 곧은 선이 몇 개인지 세어 보세요.',
        '같은 모양끼리 짝지어 보세요.',
      ];
    case 'clock':
      return [
        '짧은바늘이 어느 숫자를 지났는지 보세요.',
        '긴바늘이 어디를 가리키는지 보세요.',
        '긴바늘은 숫자 한 칸이 5분이에요.',
      ];
    case 'place-value':
      return [
        '자리마다 모형이 몇 개인지 세어 보세요.',
        '한 자리에 10개가 모이면 윗자리 1개가 돼요.',
      ];
    case 'unit-measure':
      return [
        '재는 단위 하나가 얼마만큼인지 보세요.',
        '그것이 몇 번 들어가는지 세어 보세요.',
      ];
    default:
      return [
        '문제가 묻는 곳을 그림에서 손가락으로 짚어 보세요.',
        '수가 적혀 있으면 소리 내어 읽어 보세요.',
      ];
  }
};

function PictureReadingSteps({ visual }: { visual: QuestionVisual }) {
  return (
    <ol className="hint-reading-steps">
      {readingStepsFor(visual).map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

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
  // 아래에 있던 '수직선을 자세히 살펴보세요'는 창 제목과 똑같은 말이라
  // 두 번 읽혔습니다. 그 자리에는 읽는 차례를 둡니다.
  return (
    <div className="interactive-counter-widget">
      <div className="interactive-counter-visual interactive-enlarged-visual">
        <QuestionVisualGraphic visual={visual} />
      </div>
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
        <PictureReadingSteps visual={visual} />
        <button type="button" className="hint-modal-done" onClick={onClose}>
          다 봤어요
        </button>
      </div>
    </div>
  );
}
