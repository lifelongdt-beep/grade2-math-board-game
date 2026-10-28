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

  it('첫 손가락의 탭은 브라우저에 맡기므로 여기서 한 번 더 누르지 않습니다', () => {
    const { doc, 단추, 손 } = 만들기();
    동시탭켜기(doc);
    const 보기 = 단추('보기');
    손('pointerdown', 보기, 1, true);
    손('pointerup', 보기, 1, true);
    expect(보기.눌림).toBe(0);
  });

  it('손가락을 끌어 다른 곳에서 떼거나, 막힌 단추면 누르지 않습니다', () => {
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
    보내기('click', { target: 보기, isTrusted: true, stopPropagation: () => { 멈춤 += 1; }, preventDefault() {} });
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
