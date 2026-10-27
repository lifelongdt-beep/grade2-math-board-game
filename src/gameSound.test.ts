import { describe, expect, it } from 'vitest';
import type { Blip } from './sound';
import { 놀이놓침소리, 놀이등장소리, 놀이똑딱소리, 놀이맞힘소리, 놀이스테이지소리, 놀이준비소리, 콤보소리, type 놀이소리모드 } from './sound';

// 단원 놀이 여덟 가지는 저마다 맞힌 소리·놓친 소리·나오는 소리가 있어야 하고,
// 동물 친구 소리와 겹쳐 울려도 시끄럽지 않게 짧고 작아야 합니다.
describe('단원 놀이 효과음', () => {
  const 모드들: 놀이소리모드[] = ['monster', 'balloon', 'mole', 'rocket', 'race', 'treasure', 'tunnel3d', 'soccer3d', 'fishing', 'tower'];
  const 길이 = (blips: Blip[]) => Math.max(...blips.map((one) => one.at + one.length));
  const 서명 = (blips: Blip[]) => blips.map((one) => `${one.type}:${Math.round(one.frequency)}@${one.at}`).join(' ');

  it('놀이마다 맞힌 소리·놓친 소리·나오는 소리가 있고 서로 다릅니다', () => {
    for (const 모드 of 모드들) {
      const 맞힘 = 놀이맞힘소리(모드, 0);
      const 놓침 = 놀이놓침소리(모드);
      expect(맞힘.length, 모드).toBeGreaterThan(0);
      expect(놓침.length, 모드).toBeGreaterThan(0);
      expect(놀이등장소리(모드).length, 모드).toBeGreaterThan(0);
      expect(서명(맞힘), 모드).not.toBe(서명(놓침));
    }
    expect(new Set(모드들.map((모드) => 서명(놀이맞힘소리(모드, 0)))).size).toBe(모드들.length);
    expect(new Set(모드들.map((모드) => 서명(놀이놓침소리(모드)))).size).toBe(모드들.length);
  });

  it('짧고 작습니다. 나오는 소리는 매 문제 울리므로 더 작습니다', () => {
    for (const 모드 of 모드들) {
      for (const blips of [놀이맞힘소리(모드, 10), 놀이놓침소리(모드)]) {
        expect(길이(blips), 모드).toBeLessThanOrEqual(0.6);
        for (const one of blips) expect(one.volume ?? 0.16, 모드).toBeLessThanOrEqual(0.1);
      }
      expect(길이(놀이등장소리(모드)), 모드).toBeLessThanOrEqual(0.45);
      for (const one of 놀이등장소리(모드)) expect(one.volume ?? 0.16, 모드).toBeLessThanOrEqual(0.05);
    }
  });

  it('콤보 소리는 두 번째부터 나고, 맞힐수록 높아집니다', () => {
    expect(콤보소리(0)).toEqual([]);
    expect(콤보소리(1)).toEqual([]);
    for (let n = 2; n < 10; n += 1) expect(콤보소리(n + 1)[0].frequency).toBeGreaterThan(콤보소리(n)[0].frequency);
    // 다섯 번째마다 화음이 더 얹힙니다.
    expect(콤보소리(5).length).toBeGreaterThan(콤보소리(4).length);
    // 아주 길게 이어져도 귀가 아플 만큼 높아지지는 않습니다.
    expect(콤보소리(50)[0].frequency).toBeLessThan(4000);
  });

  it('마지막 1초의 똑딱은 더 높습니다', () => {
    expect(놀이똑딱소리(1)[0].frequency).toBeGreaterThan(놀이똑딱소리(3)[0].frequency);
  });

  it('출발 신호는 마지막 음이 가장 높고, 스테이지 소리는 올라가며 맞힌 소리 뒤에 울립니다', () => {
    const 끝 = 놀이준비소리[2];
    expect(끝.frequency).toBeGreaterThan(놀이준비소리[0].frequency);
    expect(Math.min(...놀이스테이지소리.map((one) => one.at))).toBeGreaterThanOrEqual(0.4);
    const 높이 = 놀이스테이지소리.filter((one) => one.type === 'square').map((one) => one.frequency);
    expect([...높이].sort((a, b) => a - b)).toEqual(높이);
    for (const one of [...놀이준비소리, ...놀이스테이지소리]) expect(one.volume ?? 0.16).toBeLessThanOrEqual(0.1);
  });
});
