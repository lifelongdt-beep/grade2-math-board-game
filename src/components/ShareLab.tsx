import { useEffect, useState } from 'react';
import type { ShareVisual } from '../types';
import { ShareScene, shareLayout } from './ShareScene';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 똑같이 나누어 보기 — 3-1 3단원 나눗셈의 자세히 보기
// ────────────────────────────────────────────────────────────────────
// 지도서 2~3차시는 곱셈구구보다 먼저 '직접 나누어 보는 일'을 겪게
// 합니다. 나누어 주기는 한 명에게 하나씩 차례로, 묶기는 몇 개씩 덜어
// 냅니다. 단추를 누를 때마다 한 바퀴(한 묶음)씩 물건이 옮겨 갑니다.
//
// 답을 말로 알려 주지 않습니다. 다 나누어진 접시를 아이가 세어 읽습니다.
// 묶기에서는 덜어 낼 때마다 뺄셈식을 한 줄씩 적어, 같은 수를 거듭 빼는
// 것과 나눗셈이 같은 일이라는 것(지도서 3차시)을 보여 줍니다.
// ════════════════════════════════════════════════════════════════════

export function ShareLab({ visual }: { visual: ShareVisual }) {
  const lay = shareLayout(visual);
  const 한번 = visual.mode === 'deal' ? lay.boxes.length : visual.size ?? 1;
  const [moved, setMoved] = useState(0);
  const [playing, setPlaying] = useState(false);
  const 끝 = moved >= visual.total;
  const 몇번 = Math.round(moved / 한번);

  useEffect(() => {
    if (!playing) return undefined;
    if (끝) {
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setMoved((v) => Math.min(visual.total, v + 한번)), 1100);
    return () => window.clearTimeout(timer);
  }, [playing, 끝, 한번, visual.total]);

  const 뺄셈식 = Array.from({ length: 몇번 }, (_, k) => `${visual.total - k * 한번}-${한번}=${visual.total - (k + 1) * 한번}`);
  // 묶기는 덜어 낸 묶음만 칸을 그립니다(앞으로 몇 묶음이 될지 미리 보이지 않게).
  const 칸 = visual.mode === 'deal' ? lay.boxes.length : 몇번;
  return (
    <div className="share-lab">
      <ShareScene visual={visual} moved={moved} showBoxes={칸} tall />
      <p className="walk-say" aria-live="polite">
        {visual.mode === 'deal'
          ? moved === 0
            ? `${visual.item} ${visual.total}개를 ${lay.boxes.length}${visual.holder === '명' ? '명' : '곳'}에게 하나씩 차례로 나누어 줍니다.`
            : `${몇번}바퀴 나누어 주었어요. 남은 ${visual.item}: ${visual.total - moved}개`
          : moved === 0
            ? `${visual.item} ${visual.total}개에서 ${한번}개씩 묶어 덜어 냅니다.`
            : `${몇번}번 덜어 냈어요. 남은 ${visual.item}: ${visual.total - moved}개`}
      </p>
      {visual.mode === 'group' && 뺄셈식.length > 0 && (
        <p className="share-subtract">{뺄셈식.join(' → ')}</p>
      )}
      {끝 && <p className="walk-stop"><strong>다 나누었어요!</strong> {visual.mode === 'deal' ? '한 곳에 몇 개씩 있는지 세어 보세요.' : '몇 번 덜어 냈는지 세어 보세요.'}</p>}
      <div className="walk-controls">
        <button type="button" className="walk-next" disabled={끝} onClick={() => { playTapSound(); setPlaying(false); setMoved((v) => Math.min(visual.total, v + 한번)); }}>
          {visual.mode === 'deal' ? '한 바퀴 나누어 주기' : `${한번}개 묶어 덜어 내기`}
        </button>
        <button
          type="button"
          onClick={() => {
            playTapSound();
            if (끝) {
              setMoved(0);
              setPlaying(false);
              return;
            }
            setPlaying((v) => !v);
          }}
        >
          {playing ? '⏸ 멈추기' : 끝 ? '↺ 처음부터' : '▶ 자동으로'}
        </button>
      </div>
    </div>
  );
}
