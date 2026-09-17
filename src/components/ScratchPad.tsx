import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, PencilLine, Trash2, Undo2, X } from 'lucide-react';
import { MathText } from './MathText';

// ════════════════════════════════════════════════════════════════════
// 계산판 — 문제 화면에서 바로 손으로 풀어 보는 자리
// ────────────────────────────────────────────────────────────────────
// 5학년 문제는 암산으로 되지 않습니다. 5.82 × 1.8이나 2와 4/7 × 1과 5/9는
// 세로로 적어 자리를 맞추고, 받아올림을 적어 두어야 풀립니다. 적을 곳이
// 없으면 아이는 둘 중 하나를 합니다 — 머릿속으로 하다 틀리거나, 찍습니다.
// 둘 다 이 프로그램이 하려는 일과 반대입니다.
//
// 그래서 종이 대신 화면에 손가락으로 쓸 자리를 둡니다. 태블릿에서는
// 손가락이나 펜으로, 컴퓨터에서는 마우스로 씁니다.
//
// 자리는 문제 칸을 그대로 덮습니다. 답 칸은 덮지 않습니다 — 쓰다가
// 답이 보이면 계산판을 접지 않고 바로 누를 수 있어야 합니다.
// 문제 글은 계산판 머리에 다시 적습니다. 무엇을 계산하는지 보이지 않으면
// 계산판은 쓸모가 없습니다.
// ════════════════════════════════════════════════════════════════════

/**
 * 획 하나입니다. 점은 0~1로 normalize해 둡니다 — 칸의 크기가 바뀌어도
 * (다인용 화면에서 창을 줄이거나 폰을 돌려도) 쓴 것이 같은 자리에
 * 남아야 하기 때문입니다.
 */
type Stroke = {
  지우개: boolean;
  굵기: number;
  점: Array<[number, number]>;
};

const 연필굵기 = 2.6;
const 지우개굵기 = 22;

/** 캔버스의 실제 크기(픽셀)를 화면 배율에 맞춰 잡습니다. */
const 크기맞추기 = (canvas: HTMLCanvasElement): { width: number; height: number } | null => {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(rect.width * ratio);
  const height = Math.round(rect.height * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width: rect.width, height: rect.height };
};

const 다시그리기 = (canvas: HTMLCanvasElement, strokes: Stroke[]) => {
  const size = 크기맞추기(canvas);
  const ctx = canvas.getContext('2d');
  if (!size || !ctx) return;

  ctx.setTransform(canvas.width / size.width, 0, 0, canvas.height / size.height, 0, 0);
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of strokes) {
    if (!stroke.점.length) continue;
    ctx.globalCompositeOperation = stroke.지우개 ? 'destination-out' : 'source-over';
    ctx.strokeStyle = '#123c52';
    ctx.lineWidth = stroke.굵기;
    ctx.beginPath();
    const 점 = stroke.점.map(([x, y]) => [x * size.width, y * size.height] as const);
    if (점.length === 1) {
      // 톡 찍은 자리도 보여야 합니다 — 소수점이나 자리 맞춤 점입니다.
      ctx.moveTo(점[0][0], 점[0][1]);
      ctx.lineTo(점[0][0] + 0.01, 점[0][1]);
    } else {
      ctx.moveTo(점[0][0], 점[0][1]);
      // 점을 곧게 이으면 글씨가 각집니다. 두 점의 가운데를 지나는
      // 곡선으로 이어야 손으로 쓴 것처럼 부드럽습니다.
      for (let at = 1; at < 점.length - 1; at += 1) {
        const 가운데x = (점[at][0] + 점[at + 1][0]) / 2;
        const 가운데y = (점[at][1] + 점[at + 1][1]) / 2;
        ctx.quadraticCurveTo(점[at][0], 점[at][1], 가운데x, 가운데y);
      }
      ctx.lineTo(점[점.length - 1][0], 점[점.length - 1][1]);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
};

export function ScratchPad({
  open,
  prompt,
  onClose,
  onTap,
}: {
  open: boolean;
  prompt: string;
  onClose: () => void;
  /** 단추를 누를 때 나는 소리입니다. 없어도 됩니다. */
  onTap?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const 그리는중 = useRef<Stroke | null>(null);
  const [지우개인가, set지우개인가] = useState(false);
  // 되돌리기·지우기 단추를 쓸 수 있는지만 알면 되므로 획 수만 셉니다.
  const [획수, set획수] = useState(0);

  const 새로그리기 = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) 다시그리기(canvas, strokesRef.current);
  }, []);

  // 칸의 크기가 바뀌면 캔버스는 비워집니다(브라우저가 그렇게 합니다).
  // 쓴 것을 들고 있다가 그때마다 다시 그립니다.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = new ResizeObserver(() => 새로그리기());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [새로그리기]);

  useEffect(() => {
    if (open) 새로그리기();
  }, [open, 새로그리기]);

  const 자리 = (event: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
  };

  const 시작 = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // 손가락으로 그을 때 화면이 함께 끌려가면 글씨가 되지 않습니다.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke: Stroke = {
      지우개: 지우개인가,
      굵기: 지우개인가 ? 지우개굵기 : 연필굵기,
      점: [자리(event)],
    };
    그리는중.current = stroke;
    strokesRef.current = [...strokesRef.current, stroke];
    set획수(strokesRef.current.length);
    새로그리기();
  };

  const 이어그리기 = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = 그리는중.current;
    if (!stroke) return;
    event.preventDefault();
    stroke.점.push(자리(event));
    새로그리기();
  };

  const 끝 = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!그리는중.current) return;
    그리는중.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const 되돌리기 = () => {
    onTap?.();
    strokesRef.current = strokesRef.current.slice(0, -1);
    set획수(strokesRef.current.length);
    새로그리기();
  };

  const 모두지우기 = () => {
    onTap?.();
    strokesRef.current = [];
    set획수(0);
    새로그리기();
  };

  return (
    <div className="scratch-pad" hidden={!open} aria-label="계산하는 곳">
      <div className="scratch-pad-head">
        <p className="scratch-pad-prompt"><MathText text={prompt} /></p>
        <button type="button" className="scratch-close" onClick={() => { onTap?.(); onClose(); }}>
          <X size={16} /> 접기
        </button>
      </div>

      {/* 연필과 지우개는 지금 무엇을 쥐고 있는지 늘 보여야 하므로 글자를
          답니다. 되돌리기와 모두 지우기는 자리가 좁으면(여럿이 한 화면을
          쓸 때) 그림만 남깁니다 — 도구 줄이 두 줄이 되면 그만큼 쓸 자리가
          줄어듭니다. 글자를 감출 때에도 읽어 주는 이름은 남겨 둡니다. */}
      <div className="scratch-tools" role="group" aria-label="계산판 도구">
        <button
          type="button"
          className={지우개인가 ? '' : 'chosen'}
          aria-pressed={!지우개인가}
          onClick={() => { onTap?.(); set지우개인가(false); }}
        >
          <PencilLine size={16} /> <span>연필</span>
        </button>
        <button
          type="button"
          className={지우개인가 ? 'chosen' : ''}
          aria-pressed={지우개인가}
          onClick={() => { onTap?.(); set지우개인가(true); }}
        >
          <Eraser size={16} /> <span>지우개</span>
        </button>
        <button type="button" className="scratch-undo" onClick={되돌리기} disabled={획수 === 0} aria-label="되돌리기">
          <Undo2 size={16} /> <span>되돌리기</span>
        </button>
        <button type="button" className="scratch-clear" onClick={모두지우기} disabled={획수 === 0} aria-label="모두 지우기">
          <Trash2 size={16} /> <span>모두 지우기</span>
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        onPointerDown={시작}
        onPointerMove={이어그리기}
        onPointerUp={끝}
        onPointerCancel={끝}
        onPointerLeave={끝}
      />
    </div>
  );
}
