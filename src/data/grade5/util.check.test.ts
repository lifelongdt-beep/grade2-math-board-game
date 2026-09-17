import { describe, expect, it } from 'vitest';
import { estimate, digitAt, preimage } from './util';

// 지도서(동아출판 5-2) 각론 5~8차시에 답이 적혀 있는 수를 그대로 넣어
// 봅니다. 어림은 이 단원 전체가 기대는 계산이라, 한 자리라도 어긋나면
// 그 위에 쌓은 문항이 모두 틀립니다.
const 지도서에_적힌_답: Array<[string, number, 'ceil' | 'floor' | 'round', string]> = [
  ['4605', 1, 'ceil', '4610'], ['4605', 2, 'ceil', '4700'], ['4605', 3, 'ceil', '5000'],
  ['52.084', -2, 'ceil', '52.09'], ['52.084', -1, 'ceil', '52.1'], ['52.084', 0, 'ceil', '53'],
  ['1.947', -2, 'ceil', '1.95'], ['1.708', -1, 'ceil', '1.8'], ['1.915', 0, 'ceil', '2'],
  ['12345', 1, 'floor', '12340'], ['12345', 2, 'floor', '12300'], ['12345', 3, 'floor', '12000'],
  ['514.876', -2, 'floor', '514.87'], ['514.876', -1, 'floor', '514.8'], ['514.876', 0, 'floor', '514'],
  ['18.635', -1, 'floor', '18.6'], ['12.398', -2, 'floor', '12.39'], ['15.173', 0, 'floor', '15'],
  ['90.074', -1, 'round', '90.1'], ['374.981', -2, 'round', '374.98'], ['72.859', 0, 'round', '73'],
  ['6372', 2, 'round', '6400'], ['14.832', -2, 'round', '14.83'],
  ['68236', 2, 'round', '68200'], ['68236', 4, 'round', '70000'],
  ['228', 2, 'round', '200'], ['228', 1, 'round', '230'],
  ['352', 1, 'ceil', '360'], ['352', 2, 'ceil', '400'],
  ['847', 1, 'floor', '840'], ['847', 2, 'floor', '800'],
  ['11870', 3, 'ceil', '12000'], ['11870', 4, 'ceil', '20000'],
  ['18450', 3, 'floor', '18000'],
  ['3528', 3, 'floor', '3000'], ['3528', 1, 'floor', '3520'], ['3528', 2, 'floor', '3500'],
  ['425', 1, 'ceil', '430'], ['1278', 2, 'round', '1300'],
];

describe('어림 계산', () => {
  it.each(지도서에_적힌_답)('%s을 %s자리에서 %s하면 %s', (value, exp, mode, want) => {
    expect(estimate(value, exp, mode)).toBe(want);
  });

  // 그 자리에서 이미 딱 떨어지는 수는 올림해도 커지지 않습니다.
  // 4600을 올림하여 백의 자리까지 나타내면 4700이 아니라 4600입니다.
  it('딱 떨어지는 수는 올림해도 그대로다', () => {
    expect(estimate('4600', 2, 'ceil')).toBe('4600');
    expect(estimate('4600', 2, 'floor')).toBe('4600');
    expect(estimate('4600', 2, 'round')).toBe('4600');
    expect(estimate('3000', 3, 'ceil')).toBe('3000');
  });

  it('반올림은 바로 아래 자리의 숫자만 본다', () => {
    // 2.4999는 소수 첫째 자리가 4이므로 버립니다. 뒤에 9가 이어져도
    // 올라가지 않습니다 — 올림과 다른 점입니다.
    expect(estimate('2.4999', 0, 'round')).toBe('2');
    expect(estimate('2.4999', 0, 'ceil')).toBe('3');
    expect(estimate('2.5', 0, 'round')).toBe('3');
    expect(estimate('1499', 3, 'round')).toBe('1000');
    expect(estimate('1802', 3, 'round')).toBe('2000');
  });

  it('자리의 숫자를 읽는다', () => {
    expect(digitAt('4605', 1)).toBe(0);
    expect(digitAt('4605', 3)).toBe(4);
    expect(digitAt('52.084', -2)).toBe(8);
    expect(digitAt('52.084', -3)).toBe(4);
  });

  it('어림하기 전의 수가 들어갈 범위를 되돌린다', () => {
    // 올림하여 백의 자리까지 3700 → 3601부터 3700까지
    expect(preimage('3700', 2, 'ceil')).toEqual({ fromNatural: 3601, toNatural: 3700 });
    // 버림하여 백의 자리까지 3700 → 3700부터 3799까지
    expect(preimage('3700', 2, 'floor')).toEqual({ fromNatural: 3700, toNatural: 3799 });
    // 반올림하여 백의 자리까지 3700 → 3650부터 3749까지
    expect(preimage('3700', 2, 'round')).toEqual({ fromNatural: 3650, toNatural: 3749 });
  });
});
