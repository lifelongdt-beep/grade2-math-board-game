import { describe, expect, it } from 'vitest';
import { 꾸미개들, 다음꾸미개, 받을별, 불꽃단계, 새로붙은, 새배지, 차림새, 틀린뒤불꽃, 배지들 } from './rewards';

describe('캐릭터 키우기', () => {
  it('별이 모이면 자리마다 가장 좋은 꾸미개가 붙습니다', () => {
    expect(차림새(0)).toEqual({});
    expect(차림새(5).hat?.id).toBe('hat-ribbon');
    expect(차림새(49).hat?.id).toBe('hat-ribbon');
    expect(차림새(50).hat?.id).toBe('hat-cap');
    expect(차림새(30).bg?.id).toBe('bg-rainbow');
    expect(차림새(10000).hat?.id).toBe('hat-crown');
  });

  it('꾸미개는 별이 많아질수록 하나씩 열리고, 자리가 고루 섞입니다', () => {
    const 문턱 = 꾸미개들.map((one) => one.stars);
    expect([...문턱].sort((a, b) => a - b)).toEqual(문턱);
    expect(new Set(문턱).size).toBe(문턱.length);
    for (let at = 1; at < 꾸미개들.length; at += 1) expect(꾸미개들[at].slot).not.toBe(꾸미개들[at - 1].slot);
  });

  it('다음 꾸미개까지 남은 별을 알려 줍니다', () => {
    expect(다음꾸미개(0)).toEqual({ item: 꾸미개들[0], left: 5 });
    expect(다음꾸미개(14)?.left).toBe(1);
    expect(다음꾸미개(500)).toBeNull();
  });

  it('문턱을 넘은 순간에만 새 꾸미개가 붙었다고 합니다', () => {
    expect(새로붙은(3, 4)).toEqual([]);
    expect(새로붙은(4, 5).map((one) => one.id)).toEqual(['hat-ribbon']);
    expect(새로붙은(13, 16).map((one) => one.id)).toEqual(['cape-red']);
  });

  it('맞히면 별 하나, 황금 문제는 두 배, 피버 타임에는 하나를 더 줍니다', () => {
    expect(받을별({ golden: false, fever: false })).toBe(1);
    expect(받을별({ golden: true, fever: false })).toBe(2);
    expect(받을별({ golden: false, fever: true })).toBe(2);
    expect(받을별({ golden: true, fever: true })).toBe(3);
  });
});

describe('연속 정답 불꽃', () => {
  it('3·5·10연속에서 한 단계씩 커집니다', () => {
    expect([0, 2, 3, 4, 5, 9, 10, 30].map(불꽃단계)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });

  it('틀리면 한 단계만 줄어듭니다', () => {
    expect(불꽃단계(틀린뒤불꽃(12))).toBe(2);
    expect(불꽃단계(틀린뒤불꽃(6))).toBe(1);
    expect(틀린뒤불꽃(3)).toBe(0);
    expect(틀린뒤불꽃(1)).toBe(0);
  });
});

describe("'처음 해냈다' 배지", () => {
  const 보통 = { correct: true, levelAfter: '하' as const, hintUsed: false, noHintRun: 1, fireCount: 1, friendFix: false, retry: false, golden: false, totalStars: 1 };

  it('해낸 일마다 배지를 주고, 이미 받은 배지는 다시 주지 않습니다', () => {
    expect(새배지(보통, new Set()).map((one) => one.id)).toEqual(['first-correct']);
    expect(새배지(보통, new Set(['first-correct']))).toEqual([]);
    expect(새배지({ ...보통, levelAfter: '상' }, new Set(['first-correct'])).map((one) => one.id)).toEqual(['reach-mid', 'reach-top']);
    expect(새배지({ ...보통, noHintRun: 5, friendFix: true, retry: true }, new Set(['first-correct'])).map((one) => one.id)).toEqual(['no-hint-5', 'fix-friend', 'retry-win']);
  });

  it('틀린 문제로는 해낸 일 배지를 주지 않습니다', () => {
    expect(새배지({ ...보통, correct: false, friendFix: true, golden: true }, new Set())).toEqual([]);
  });

  it('배지는 빠르기나 등수를 말하지 않습니다', () => {
    for (const one of 배지들) expect(one.says).not.toMatch(/빨리|빠르|등|1위|이겼/);
  });
});
