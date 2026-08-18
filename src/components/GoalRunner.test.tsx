import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GoalRunner, runnerNameFor } from './GoalRunner';

/* 목표를 이룰 때마다 다른 것이 달려야 합니다. 화면에서 이것을 눈으로
   보려면 정답을 여섯 개씩 맞혀 단계를 올려야 해서, 차례가 어긋나도
   한참 뒤에야 드러납니다. 여기서 못 박아 둡니다. */
const ORDER = ['기차', '비행기', '로켓', '우주선', '외계인', '사람'];

describe('우리 반 목표를 달리는 것', () => {
  it('단계마다 다른 것이 나온다', () => {
    const seen = ORDER.map((_, i) => {
      const html = renderToStaticMarkup(<GoalRunner stage={i + 1} />);
      const label = /aria-label="([^"]+)"/.exec(html);
      return label ? label[1] : '없음';
    });

    expect(seen).toEqual(['기차', '비행기', '로켓', '우주선', '외계인', '달리는 사람']);
  });

  it('여섯을 다 만나면 처음으로 돌아간다', () => {
    const first = renderToStaticMarkup(<GoalRunner stage={1} />);
    expect(renderToStaticMarkup(<GoalRunner stage={7} />)).toBe(first);
    expect(renderToStaticMarkup(<GoalRunner stage={13} />)).toBe(first);
  });

  it('다음에 나올 것의 이름을 알려 준다', () => {
    expect(ORDER.map((_, i) => runnerNameFor(i + 1))).toEqual(ORDER);
    expect(runnerNameFor(7)).toBe('기차');
  });

  it('저마다 움직이는 곳을 가지고 있다', () => {
    // 움직이지 않으면 이 그림은 있을 까닭이 없습니다. 부품마다 붙인
    // 이름이 styles.css의 규칙과 짝이 맞아야 실제로 움직입니다.
    const movingPart = [
      'runner-wheel', 'runner-prop', 'runner-flame',
      'runner-ring', 'runner-wink', 'runner-leg-a',
    ];

    const missing = movingPart.filter((part, i) => {
      const html = renderToStaticMarkup(<GoalRunner stage={i + 1} />);
      return !html.includes(part);
    });

    expect(missing).toEqual([]);
  });
});
