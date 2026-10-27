import { describe, expect, it } from 'vitest';
import { 놀이배경곡, 배경곡들, 배경음크기 } from './sound';

// 놀이 배경음악은 8마디가 꼭 맞게 되풀이되어야 하고(어긋나면 박자가 밀립니다),
// 가락은 그 곡의 음계 안에 있어야 듣기 좋습니다.
describe('놀이 배경음악', () => {
  const 음계: Record<keyof typeof 배경곡들, string[]> = {
    adventure: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    bouncy: ['F', 'G', 'A', 'A#', 'C', 'D', 'E'],
    // 가단조는 이끎음(G#)을 함께 씁니다.
    dash: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'G#'],
  };

  it('곡마다 가락 64칸(8분음표 8마디), 베이스 32칸(4분음표 8마디)입니다', () => {
    for (const [이름, 곡] of Object.entries(배경곡들)) {
      expect(곡.가락.length, 이름).toBe(64);
      expect(곡.베이스.length, 이름).toBe(32);
      expect(곡.bpm, 이름).toBeGreaterThanOrEqual(120);
      expect(곡.bpm, 이름).toBeLessThanOrEqual(180);
    }
  });

  it('모든 음이 올바른 음 이름이고 그 곡의 음계 안에 있습니다', () => {
    for (const [이름, 곡] of Object.entries(배경곡들) as [keyof typeof 배경곡들, (typeof 배경곡들)[keyof typeof 배경곡들]][]) {
      for (const 음 of [...곡.가락, ...곡.베이스]) {
        if (음 === null) continue;
        const m = /^([A-G]#?)(\d)$/.exec(음);
        expect(m, `${이름} ${음}`).not.toBeNull();
        expect(음계[이름], `${이름} ${음}`).toContain(m![1]);
      }
      // 쉼표만 있는 곡이 되지 않도록, 가락의 8분의 5 이상은 소리가 납니다(통통 곡은 엇박 쉼표가 많습니다).
      expect(곡.가락.filter(Boolean).length, 이름).toBeGreaterThanOrEqual(40);
    }
  });

  it('세 곡은 서로 다르고, 아홉 가지 놀이 모두 곡이 정해져 있습니다', () => {
    const 서명들 = Object.values(배경곡들).map((곡) => 곡.가락.join(' '));
    expect(new Set(서명들).size).toBe(서명들.length);
    expect(Object.keys(놀이배경곡).sort()).toEqual(['balloon', 'fishing', 'mole', 'monster', 'race', 'rocket', 'soccer3d', 'treasure', 'tunnel3d']);
    for (const 곡 of Object.values(놀이배경곡)) expect(배경곡들[곡]).toBeDefined();
  });

  it('배경음악은 효과음보다 작게 깔립니다', () => {
    expect(배경음크기).toBeLessThan(0.6);
  });
});
