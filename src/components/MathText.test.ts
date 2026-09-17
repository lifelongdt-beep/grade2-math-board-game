import { describe, expect, it } from 'vitest';
import { readAloud, splitMath } from './MathText';

const 간추리기 = (text: string) =>
  splitMath(text)
    .map((one) => (one.kind === 'text' ? one.text : `[${one.whole ?? ''}|${one.numerator}/${one.denominator}]`))
    .join('');

describe('우리말 글에서 분수를 찾기', () => {
  it('진분수와 가분수를 찾는다', () => {
    expect(간추리기('5/8 × 6을 계산하면 얼마일까요?')).toBe('[|5/8] × 6을 계산하면 얼마일까요?');
    expect(간추리기('7/5는 어떤 분수일까요?')).toBe('[|7/5]는 어떤 분수일까요?');
  });

  it('대분수는 자연수까지 한 덩어리로 본다', () => {
    expect(간추리기('1과 3/4 km를 걸었습니다.')).toBe('[1|3/4] km를 걸었습니다.');
    expect(간추리기('2와 4/7을 가분수로')).toBe('[2|4/7]을 가분수로');
  });

  // 여기가 이 갈래에서 가장 잘 어긋나는 자리입니다. '1/2과 3/8'에서
  // 대분수를 먼저 찾으면 가운데 '2과 3/8'이 잡혀 2와 8분의 3이 됩니다.
  it('분수 뒤의 조사 과/와를 대분수로 잘못 읽지 않는다', () => {
    expect(간추리기('1/2과 3/8 중에서 더 큰 수는?')).toBe('[|1/2]과 [|3/8] 중에서 더 큰 수는?');
    expect(간추리기('3/4와 1/7 중에서')).toBe('[|3/4]와 [|1/7] 중에서');
    expect(간추리기('21/28과 4/28입니다.')).toBe('[|21/28]과 [|4/28]입니다.');
  });

  it('괄호로 묶은 셈도 분수로 본다', () => {
    expect(간추리기('5/8 × 3/4 = (5×3)/(8×4) = 15/32')).toBe('[|5/8] × [|3/4] = [|5×3/8×4] = [|15/32]');
    expect(간추리기('1과 5/9 = (1×9+5)/9 = 14/9')).toBe('[1|5/9] = [|1×9+5/9] = [|14/9]');
  });

  it('분수가 아닌 것은 건드리지 않는다', () => {
    expect(간추리기('6.72를 반올림하면')).toBe('6.72를 반올림하면');
    expect(간추리기('면 ㄱㄴㄷㄹ과 평행한 면은?')).toBe('면 ㄱㄴㄷㄹ과 평행한 면은?');
    expect(간추리기('가로가 8 cm인 직육면체')).toBe('가로가 8 cm인 직육면체');
    // 괄호 안에 글자가 있으면 셈이 아닙니다.
    expect(간추리기('(자료 값의 합)/(자료의 수)')).toBe('(자료 값의 합)/(자료의 수)');
  });

  it('화면 낭독기는 분모부터 읽는다', () => {
    expect(readAloud({ kind: 'fraction', numerator: '1', denominator: '5' })).toBe('5분의 1');
    expect(readAloud({ kind: 'fraction', whole: '2', numerator: '3', denominator: '4' })).toBe('2과 4분의 3');
    expect(readAloud({ kind: 'fraction', numerator: '5×3', denominator: '8×4' })).toBe('8 곱하기 4분의 5 곱하기 3');
  });
});
