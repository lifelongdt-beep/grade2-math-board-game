import { describe, expect, it } from 'vitest';
import { 동물이름 } from './data/nameSwap';
import { animalGrowlBlips, animalHappyBlips } from './sound';

// 고를 수 있는 동물마다 맞혔을 때 기뻐하는 소리와 틀렸을 때 으르렁거리는 소리가 있어야 합니다.
describe('동물 캐릭터의 정답·오답 소리', () => {
  const 동물들 = Object.keys(동물이름);
  const 길이 = (blips: { at: number; length: number }[]) => Math.max(...blips.map((one) => one.at + one.length));

  it('모든 동물이 기뻐하고 으르렁거립니다', () => {
    for (const 동물 of 동물들) {
      expect(animalHappyBlips(동물, '하'), 동물).not.toBeNull();
      expect(animalGrowlBlips(동물), 동물).not.toBeNull();
    }
  });

  it('다섯이 한꺼번에 내도 시끄럽지 않게 짧고 작습니다', () => {
    for (const 동물 of 동물들) {
      for (const blips of [animalHappyBlips(동물, '상')!, animalGrowlBlips(동물)!]) {
        expect(길이(blips), 동물).toBeLessThanOrEqual(0.6);
        for (const one of blips) expect(one.volume ?? 0.16, 동물).toBeLessThanOrEqual(0.1);
      }
    }
  });

  it('기뻐하는 소리는 올라가고, 으르렁은 낮게 떨립니다', () => {
    for (const 동물 of 동물들) {
      const 기쁨 = animalHappyBlips(동물, '하')!;
      const 으르렁 = animalGrowlBlips(동물)!;
      const 끝 = 기쁨[2];
      expect(Math.max(...끝.glide!), 동물).toBeGreaterThan(끝.frequency);
      expect(으르렁[0].frequency, 동물).toBeLessThan(기쁨[0].frequency);
      expect(으르렁[0].vibrato, 동물).toBeDefined();
    }
  });

  it('수준이 높을수록 같은 기쁨 소리를 조금 높게 냅니다', () => {
    for (const 동물 of 동물들) expect(animalHappyBlips(동물, '상')![0].frequency).toBeGreaterThan(animalHappyBlips(동물, '하')![0].frequency);
  });

  it('동물이 아닌 캐릭터면 원래 소리로 돌아갑니다', () => {
    expect(animalHappyBlips('🤖', '하')).toBeNull();
    expect(animalGrowlBlips('')).toBeNull();
  });
});
