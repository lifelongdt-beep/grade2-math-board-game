import { describe, expect, it } from 'vitest';
import { 동시탭켜기 } from './multiTouchTap';

// 브라우저 없이 문서와 단추를 흉내 냅니다. 단추를 누르면(click) 몇 번 눌렸는지 셉니다.
const 만들기 = () => {
  const 듣기: Record<string, ((e: unknown) => void)[]> = {};
  const 단추 = (이름: string) => {
    const el = {
      이름,
      눌림: 0,
      disabled: false,
      isConnected: true,
      closest: () => el,
      getAttribute: () => null,
      click: () => {
        el.눌림 += 1;
        // 진짜 브라우저처럼 click 은 문서의 듣는 이에게도 갑니다(우리가 일으킨 것은 isTrusted 가 아닙니다).
        보내기('click', { target: el, isTrusted: false, stopPropagation() {}, preventDefault() {} });
      },
    };
    return el;
  };
  const 바탕 = { closest: () => null };
  let 아래: unknown = 바탕;
  const doc = {
    addEventListener: (t: string, f: (e: unknown) => void) => { (듣기[t] ??= []).push(f); },
    removeEventListener: (t: string, f: (e: unknown) => void) => { 듣기[t] = (듣기[t] ?? []).filter((g) => g !== f); },
    elementFromPoint: () => 아래,
  };
  const 보내기 = (t: string, e: unknown) => { for (const f of 듣기[t] ?? []) f(e); };
  const 손 = (t: string, target: unknown, id: number, isPrimary: boolean, x = 10, y = 10) => {
    아래 = target;
    보내기(t, { target, pointerId: id, isPrimary, pointerType: 'touch', clientX: x, clientY: y });
  };
  return { doc: doc as unknown as Document, 단추, 바탕, 손, 보내기, 듣기 };
};

describe('여럿이 동시에 누르는 화면', () => {
  it('한 아이가 시계를 잡고 있는 동안 다른 아이가 누른 단추도 눌립니다', () => {
    const { doc, 단추, 바탕, 손 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    손('pointerdown', 바탕, 1, true); // 첫 손가락: 시계를 잡고 있습니다.
    손('pointerdown', 보기, 2, false); // 두 번째 손가락: 다른 칸의 보기 단추
    손('pointerup', 보기, 2, false);
    expect(보기.눌림).toBe(1);
  });

  it('첫 손가락도, 꾹 눌렀다 떼도 한 번만 눌립니다', () => {
    const { doc, 단추, 손, 보내기 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    손('pointerdown', 보기, 1, true);
    손('pointerup', 보기, 1, true);
    expect(보기.눌림).toBe(1);
    // 브라우저가 뒤이어 보내는 진짜 클릭은 버립니다.
    let 멈춤 = 0;
    보내기('click', { target: 보기, isTrusted: true, pointerId: 1, clientX: 10, clientY: 10, stopPropagation: () => { 멈춤 += 1; }, preventDefault() {} });
    expect(멈춤).toBe(1);
  });

  it('두 단추를 거의 동시에 누르면 둘 다 한 번씩만 눌립니다', () => {
    const { doc, 단추, 손, 보내기 } = 만들기();
    동시탭켜기(doc);
    const 가 = 단추('가');
    const 나 = 단추('나');
    손('pointerdown', 가, 1, true);
    손('pointerdown', 나, 2, false);
    손('pointerup', 가, 1, true);
    손('pointerup', 나, 2, false);
    let 멈춤 = 0;
    보내기('click', { target: 가, isTrusted: true, pointerId: 1, clientX: 10, clientY: 10, stopPropagation: () => { 멈춤 += 1; }, preventDefault() {} });
    expect([가.눌림, 나.눌림, 멈춤]).toEqual([1, 1, 1]);
  });

  it('마우스는 브라우저가 하던 대로 둡니다', () => {
    const { doc, 단추, 보내기 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    보내기('pointerdown', { target: 보기, pointerId: 1, isPrimary: true, pointerType: 'mouse', clientX: 10, clientY: 10 });
    보내기('pointerup', { target: 보기, pointerId: 1, isPrimary: true, pointerType: 'mouse', clientX: 10, clientY: 10 });
    expect(보기.눌림).toBe(0);
  });

  it('문제가 바뀌어 같은 자리에 새 단추가 와도, 브라우저의 늦은 클릭은 버립니다', () => {
    const { doc, 단추, 손, 보내기 } = 만들기();
    동시탭켜기(doc);
    const 앞단추 = 단추('앞 문제 보기');
    const 새단추 = 단추('새 문제 보기');
    손('pointerdown', 앞단추, 5, true);
    손('pointerup', 앞단추, 5, true);
    let 멈춤 = 0;
    보내기('click', { target: 새단추, isTrusted: true, pointerId: 5, clientX: 10, clientY: 10, stopPropagation: () => { 멈춤 += 1; }, preventDefault() {} });
    expect([앞단추.눌림, 멈춤]).toEqual([1, 1]);
  });

  it('손가락이 단추를 살짝 벗어나 떼어도 눌립니다', () => {
    const { doc, 단추, 바탕, 손 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    손('pointerdown', 보기, 2, false, 10, 10);
    손('pointerup', 바탕, 2, false, 10, 40);
    expect(보기.눌림).toBe(1);
  });

  it('손가락을 끌어 멀리 가서 떼거나, 막힌 단추면 누르지 않습니다', () => {
    const { doc, 단추, 바탕, 손 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    손('pointerdown', 보기, 2, false);
    손('pointerup', 바탕, 2, false, 80, 80);
    expect(보기.눌림).toBe(0);
    보기.disabled = true;
    손('pointerdown', 보기, 3, false);
    손('pointerup', 보기, 3, false);
    expect(보기.눌림).toBe(0);
  });

  it('브라우저가 같은 단추에 진짜 클릭을 또 보내면 버려서 두 번 눌리지 않게 합니다', () => {
    const { doc, 단추, 손, 보내기 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    손('pointerdown', 보기, 2, false);
    손('pointerup', 보기, 2, false);
    let 멈춤 = 0;
    보내기('click', { target: 보기, isTrusted: true, pointerId: 1, clientX: 10, clientY: 10, stopPropagation: () => { 멈춤 += 1; }, preventDefault() {} });
    expect(멈춤).toBe(1);
  });

  it('떼어 내면 더는 듣지 않습니다', () => {
    const { doc, 단추, 손, 듣기 } = 만들기();
    const 끄기 = 동시탭켜기(doc);
    끄기();
    expect(Object.values(듣기).every((fs) => fs.length === 0)).toBe(true);
    const 보기 = 단추('보기');
    손('pointerdown', 보기, 2, false);
    손('pointerup', 보기, 2, false);
    expect(보기.눌림).toBe(0);
  });
});
