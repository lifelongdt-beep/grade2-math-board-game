import { describe, expect, it } from 'vitest';
import { formatDecimal, mulDecimal, parseDecimal, placesOf, shiftPoint, withoutPoint } from './decimal';

// 지도서(동아출판 5-2) 4단원 각론에 답이 적혀 있는 계산입니다.
describe('소수의 곱셈 계산', () => {
  it.each([
    ['0.9', '4', '3.6'],
    ['1.5', '3', '4.5'],
    ['2.4', '1.5', '3.6'],
    ['4.2', '1.6', '6.72'],
    ['1.3', '2.8', '3.64'],
    ['6.2', '3.84', '23.808'],
    ['2.63', '1.4', '3.682'],
    ['9.1', '2.5', '22.75'],
    // 자바스크립트의 수로 하면 어긋나는 값들입니다.
    ['0.1', '0.3', '0.03'],
    ['0.7', '0.1', '0.07'],
    ['1.1', '1.1', '1.21'],
    ['0.29', '3', '0.87'],
    // 끝의 0은 떼고 적습니다.
    ['0.6', '0.5', '0.3'],
    ['1.2', '5', '6'],
    ['2.5', '4', '10'],
  ])('%s × %s = %s', (a, b, want) => {
    expect(mulDecimal(a, b)).toBe(want);
  });

  it('소수점을 옮긴다', () => {
    expect(shiftPoint('4.2', 1)).toBe('42');
    expect(shiftPoint('4.2', 2)).toBe('420');
    expect(shiftPoint('4.2', -1)).toBe('0.42');
    expect(shiftPoint('4.2', -2)).toBe('0.042');
    expect(shiftPoint('0.5', 1)).toBe('5');
  });

  it('소수점 아래 자리 수를 센다', () => {
    expect(placesOf('4.2')).toBe(1);
    expect(placesOf('4.25')).toBe(2);
    expect(placesOf('4')).toBe(0);
  });

  it('소수점을 지운 자연수를 만든다', () => {
    expect(withoutPoint('4.2')).toBe('42');
    // 0.07은 100분의 7이므로 소수점을 지우면 7입니다.
    expect(withoutPoint('0.07')).toBe('7');
    expect(formatDecimal(parseDecimal('0.070'))).toBe('0.07');
  });
});
