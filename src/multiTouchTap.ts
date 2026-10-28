// ════════════════════════════════════════════════════════════════════
// 여럿이 한 화면을 동시에 누를 때의 탭
// ────────────────────────────────────────────────────────────────────
// 전자칠판에서는 아이들이 저마다 자기 칸을 동시에 누릅니다. 그런데 브라우저는 화면에
// 먼저 닿은 손가락(첫 손가락)만 '클릭'으로 바꿔 줍니다. 한 아이가 시계 바늘이나 자를
// 잡고 있는 동안 다른 아이가 보기 단추를 눌러도, 그 손가락은 두 번째 손가락이라 클릭이
// 생기지 않아 단추가 반응하지 않았습니다.
//
// 그래서 두 번째 이후 손가락이 단추를 눌렀다 같은 단추 위에서 떼면 여기서 직접 클릭을
// 일으킵니다. 첫 손가락은 브라우저가 하던 대로 둡니다. 브라우저가 뒤늦게 같은 단추에
// 진짜 클릭을 보내면 두 번 눌리지 않게 그 클릭은 버립니다.
// ════════════════════════════════════════════════════════════════════

/** 탭으로 볼 만큼만 움직였는지입니다(손가락이 이만큼 넘게 미끄러지면 탭이 아닙니다). */
const 탭거리 = 24;
/** 우리가 일으킨 클릭 뒤 이 시간 안에 같은 단추로 오는 진짜 클릭은 겹친 것으로 보고 버립니다. */
const 겹침시간 = 600;

const 누를것 = 'button, [role="button"], a[href], summary, label';

interface 누른손가락 {
  단추: HTMLElement;
  x: number;
  y: number;
}

const 단추찾기 = (target: EventTarget | null): HTMLElement | null =>
  target && typeof (target as Element).closest === 'function' ? ((target as Element).closest(누를것) as HTMLElement | null) : null;

const 막힌단추 = (el: HTMLElement) => (el as HTMLButtonElement).disabled === true || el.getAttribute('aria-disabled') === 'true';

/** 문서에 한 번 걸어 두면 됩니다. 떼어 낼 때 쓰는 함수를 돌려줍니다. */
export function 동시탭켜기(doc: Document = document): () => void {
  const 손가락들 = new Map<number, 누른손가락>();
  let 마지막 = { 단추: null as HTMLElement | null, 때: 0 };

  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' || e.isPrimary) return;
    const 단추 = 단추찾기(e.target);
    if (단추) 손가락들.set(e.pointerId, { 단추, x: e.clientX, y: e.clientY });
  };
  const up = (e: PointerEvent) => {
    const 누른 = 손가락들.get(e.pointerId);
    손가락들.delete(e.pointerId);
    if (!누른) return;
    if (Math.hypot(e.clientX - 누른.x, e.clientY - 누른.y) > 탭거리) return;
    // 뗀 자리가 누른 단추 위여야 합니다(손가락을 끌어 다른 곳에서 떼면 누르지 않은 것입니다).
    const 뗀곳 = 단추찾기(doc.elementFromPoint(e.clientX, e.clientY));
    if (뗀곳 !== 누른.단추 || 막힌단추(누른.단추) || !누른.단추.isConnected) return;
    마지막 = { 단추: 누른.단추, 때: performance.now() };
    누른.단추.click();
  };
  const cancel = (e: PointerEvent) => { 손가락들.delete(e.pointerId); };
  // 브라우저가 같은 단추에 진짜 클릭도 보내면(기기마다 다릅니다) 두 번 눌리지 않게 버립니다.
  const click = (e: MouseEvent) => {
    if (!e.isTrusted || !마지막.단추) return;
    if (performance.now() - 마지막.때 > 겹침시간) return;
    if (단추찾기(e.target) !== 마지막.단추) return;
    마지막 = { 단추: null, 때: 0 };
    e.stopPropagation();
    e.preventDefault();
  };

  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointercancel', cancel, true);
  doc.addEventListener('click', click, true);
  return () => {
    doc.removeEventListener('pointerdown', down, true);
    doc.removeEventListener('pointerup', up, true);
    doc.removeEventListener('pointercancel', cancel, true);
    doc.removeEventListener('click', click, true);
  };
}
