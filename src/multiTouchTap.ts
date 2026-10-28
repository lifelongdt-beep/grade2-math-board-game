// ════════════════════════════════════════════════════════════════════
// 여럿이 한 화면을 동시에 누를 때의 탭
// ────────────────────────────────────────────────────────────────────
// 전자칠판에서는 아이들이 저마다 자기 칸을 동시에 누릅니다. 브라우저가 터치를 '클릭'으로
// 바꿔 주는 방식은 이런 화면과 잘 맞지 않았습니다.
//   · 화면에 먼저 닿은 손가락(첫 손가락)만 클릭이 됩니다. 한 아이가 시계 바늘을 잡고
//     있거나 여럿이 거의 동시에 누르면, 뒤에 닿은 손가락은 단추를 눌러도 반응이 없습니다.
//   · 단추를 꾹 누르고 있으면(0.5초쯤) '길게 누르기'로 보아 클릭이 생기지 않습니다.
//     어린 아이들은 단추를 꾹 누르는 일이 많습니다.
//   · 누르는 동안 손가락이 조금만 미끄러져도 클릭이 취소됩니다.
//
// 그래서 터치(펜)로 단추를 눌렀다가 같은 단추 위에서 떼면, 몇 번째 손가락이든 얼마나
// 오래 눌렀든 여기서 직접 클릭을 일으킵니다. 브라우저가 같은 단추에 진짜 클릭도 보내면
// 두 번 눌리지 않게 그 클릭은 버립니다. 마우스는 브라우저가 하던 대로 둡니다.
// ════════════════════════════════════════════════════════════════════

/** 탭으로 볼 만큼만 움직였는지입니다. 큰 칠판에서 아이 손가락은 꽤 미끄러지므로 넉넉히 둡니다. */
const 탭거리 = 48;
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
  // 여기서 클릭을 일으킨 손가락과 그때·자리입니다. 여럿이 동시에 누르므로 손가락마다 기억합니다.
  // 단추가 아니라 손가락으로 기억하는 까닭: 클릭으로 문제가 바뀌면 그 자리에 새 단추가 놓이는데,
  // 브라우저가 뒤늦게 보내는 클릭이 그 새 단추를 눌러 다음 문제까지 답해 버렸습니다.
  const 일으킨 = new Map<number, { 때: number; x: number; y: number }>();

  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    const 단추 = 단추찾기(e.target);
    if (단추) 손가락들.set(e.pointerId, { 단추, x: e.clientX, y: e.clientY });
  };
  const up = (e: PointerEvent) => {
    const 누른 = 손가락들.get(e.pointerId);
    손가락들.delete(e.pointerId);
    if (!누른) return;
    // 뗀 자리가 누른 단추 위이거나, 단추를 살짝 벗어났어도 누른 자리에서 멀지 않으면 누른 것으로 봅니다.
    // 손가락을 끌어 멀리(다른 단추로) 가서 떼면 누르지 않은 것입니다.
    const 뗀곳 = 단추찾기(doc.elementFromPoint(e.clientX, e.clientY));
    const 가까움 = Math.hypot(e.clientX - 누른.x, e.clientY - 누른.y) <= 탭거리;
    if (!(뗀곳 === 누른.단추 || (가까움 && !뗀곳))) return;
    if (막힌단추(누른.단추) || !누른.단추.isConnected) return;
    일으킨.set(e.pointerId, { 때: performance.now(), x: e.clientX, y: e.clientY });
    누른.단추.click();
  };
  const cancel = (e: PointerEvent) => { 손가락들.delete(e.pointerId); };
  // 브라우저가 같은 단추에 진짜 클릭도 보내면(기기마다 다릅니다) 두 번 눌리지 않게 버립니다.
  const click = (e: MouseEvent) => {
    if (!e.isTrusted) return;
    const 지금 = performance.now();
    for (const [id, one] of 일으킨) if (지금 - one.때 > 겹침시간) 일으킨.delete(id);
    // 같은 손가락이 만든 클릭이면 버립니다. 손가락 번호가 없는 기기는 자리가 가까운지로 봅니다.
    const id = (e as PointerEvent).pointerId;
    const 같은손 = typeof id === 'number' && 일으킨.has(id)
      ? id
      : [...일으킨].find(([, one]) => Math.hypot(e.clientX - one.x, e.clientY - one.y) <= 탭거리)?.[0];
    if (같은손 === undefined) return;
    일으킨.delete(같은손);
    e.stopPropagation();
    e.preventDefault();
  };
  // 단추를 길게 눌렀을 때 뜨는 메뉴(길게 누르기)를 막습니다. 메뉴가 뜨면 손을 떼어도 눌리지 않습니다.
  const menu = (e: Event) => {
    if (단추찾기(e.target)) e.preventDefault();
  };

  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointercancel', cancel, true);
  doc.addEventListener('click', click, true);
  doc.addEventListener('contextmenu', menu, true);
  return () => {
    doc.removeEventListener('pointerdown', down, true);
    doc.removeEventListener('pointerup', up, true);
    doc.removeEventListener('pointercancel', cancel, true);
    doc.removeEventListener('click', click, true);
    doc.removeEventListener('contextmenu', menu, true);
  };
}
