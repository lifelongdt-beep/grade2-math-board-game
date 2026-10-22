import { describe, expect, it } from 'vitest';
import { 꾸미개들, 다음꾸미개, 받을별, 불꽃단계, 새로붙은, 새배지, 차림새, 틀린뒤불꽃, 배지들, 황금문제인가, 대왕때리기, 지금대왕, 대왕들 } from './rewards';

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

describe('황금 문제', () => {
  it('융합 문항은 늘 황금이고, 되돌아온 문제는 황금이 아닙니다', () => {
    expect(황금문제인가({ questionId: 'a', seed: 1, fusion: true, retry: false })).toBe(true);
    expect(황금문제인가({ questionId: 'a', seed: 1, fusion: true, retry: true })).toBe(false);
  });

  it('나머지는 열에 하나쯤이고, 판마다 다른 문제가 황금이 됩니다', () => {
    const ids = Array.from({ length: 3000 }, (_, at) => `2-2-u3-l3-상-${at + 1}`);
    const 판1 = ids.filter((id) => 황금문제인가({ questionId: id, seed: 101, retry: false }));
    const 판2 = ids.filter((id) => 황금문제인가({ questionId: id, seed: 202, retry: false }));
    expect(판1.length / ids.length).toBeGreaterThan(0.07);
    expect(판1.length / ids.length).toBeLessThan(0.13);
    const 겹침 = 판1.filter((id) => 판2.includes(id)).length;
    expect(겹침 / 판1.length).toBeLessThan(0.3);
  });
});

describe('몬스터 대왕', () => {
  it('우리 반이 모은 별이 대왕의 힘을 깎고, 남은 별은 다음 대왕에게 넘어갑니다', () => {
    expect(대왕때리기({ round: 0, damage: 0 }, 10)).toEqual({ 싸움: { round: 0, damage: 10 }, 물리친: [] });
    const 끝 = 대왕때리기({ round: 0, damage: 295 }, 12);
    expect(끝.물리친.map((one) => one.name)).toEqual([대왕들[0].name]);
    expect(끝.싸움).toEqual({ round: 1, damage: 7 });
  });

  it('대왕을 다 물리치면 처음 대왕이 더 세게 돌아옵니다', () => {
    expect(지금대왕({ round: 대왕들.length, damage: 0 }).hp).toBe(대왕들[0].hp + 100);
  });
});
