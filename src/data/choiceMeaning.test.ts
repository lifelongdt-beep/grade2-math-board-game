import { describe, expect, it } from 'vitest';
import { meaningOfChoice } from './choiceMeaning';

// 틀린 보기를 읽어 무엇을 잘못 생각했는지 알아내는 부분입니다.
// 잘못 읽으면 선생님이 엉뚱한 것을 가르치게 되므로, 확실할 때만 말하고
// 아닐 때는 아무 말도 하지 않아야 합니다.
describe('reading what a wrong choice means', () => {
  it('names the mistake when the relationship is unmistakable', () => {
    // 48+25=73인데 63을 골랐습니다. 받아올림한 10을 빠뜨린 것입니다.
    expect(meaningOfChoice('48+25는 얼마일까요?', '63', '73')).toBe('받아올림이나 받아내림을 빠뜨림');

    // 빼야 하는데 더한 값을 골랐습니다.
    expect(meaningOfChoice('45에서 12를 빼면?', '57', '33')).toBe('빼야 할 곳에서 더함');

    // 더해야 하는데 뺀 값을 골랐습니다.
    expect(meaningOfChoice('24와 13을 더하면?', '11', '37')).toBe('더해야 할 곳에서 뺌');

    // 계산하지 않고 문제에 있던 수를 그대로 집었습니다.
    expect(meaningOfChoice('35와 22를 더하면?', '35', '57')).toBe('문제에 나온 수를 그대로 고름');

    // 30을 300으로 읽었습니다.
    expect(meaningOfChoice('십의 자리 3은 얼마를 나타낼까요?', '300', '30')).toBe('자리를 한 칸 잘못 봄');

    // 하나 더 세었습니다.
    expect(meaningOfChoice('구슬은 모두 몇 개일까요?', '8', '7')).toBe('하나 더 세거나 덜 셈');
  });

  it('says nothing when the relationship could be anything', () => {
    // 답과 아무 관계가 없는 수입니다. 억지로 이름 붙이면 안 됩니다.
    expect(meaningOfChoice('48+25는 얼마일까요?', '91', '73')).toBeUndefined();

    // 수가 아닌 답은 관계를 따질 수 없습니다.
    expect(meaningOfChoice('어느 것이 삼각형일까요?', '사각형', '삼각형')).toBeUndefined();
  });
});
