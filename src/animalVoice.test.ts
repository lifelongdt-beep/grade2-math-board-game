import { describe, expect, it } from 'vitest';
import type { Blip } from './sound';
import { 동물이름 } from './data/nameSwap';
import { animalAngryBlips, animalHappyBlips } from './sound';

// 고를 수 있는 동물마다 맞혔을 때 신나는 소리와 틀렸을 때 화난 으르렁 소리가 있어야 하고,
// 둘은 귀로 바로 가를 수 있게 뚜렷이 달라야 합니다.
describe('동물 캐릭터의 정답·오답 소리', () => {
  const 동물들 = Object.keys(동물이름);
  const 길이 = (blips: Blip[]) => Math.max(...blips.map((one) => one.at + one.length));
  const 서명 = (blips: Blip[]) => blips.map((one) => `${one.type}:${Math.round(one.frequency)}@${one.at}`).join(' ');
  const 마지막높이 = (one: Blip) => one.glide?.at(-1) ?? one.slideTo ?? one.frequency;
  // 소리 크기로 무게를 둔 평균 높이입니다. 높은 반짝임·하악 소리 하나에 끌려가지 않도록 큰 소리 위주로 봅니다.
  const 평균높이 = (blips: Blip[]) => {
    const 무게 = blips.map((one) => one.volume ?? 0.16);
    return blips.reduce((sum, one, at) => sum + one.frequency * 무게[at], 0) / 무게.reduce((a, b) => a + b, 0);
  };
  const 거친결 = (blips: Blip[]) => blips.filter((one) => one.type === 'sawtooth' || one.type === 'square').length;

  it('모든 동물이 맞히면 신나 하고, 틀리면 화를 냅니다', () => {
    for (const 동물 of 동물들) {
      expect(animalHappyBlips(동물, '하'), 동물).not.toBeNull();
      expect(animalAngryBlips(동물), 동물).not.toBeNull();
    }
  });

  it('동물마다 소리가 다릅니다', () => {
    expect(new Set(동물들.map((동물) => 서명(animalHappyBlips(동물, '하')!))).size).toBe(동물들.length);
    expect(new Set(동물들.map((동물) => 서명(animalAngryBlips(동물)!))).size).toBe(동물들.length);
  });

  it('다섯이 한꺼번에 내도 시끄럽지 않게 짧고 작습니다', () => {
    for (const 동물 of 동물들) {
      for (const blips of [animalHappyBlips(동물, '상')!, animalAngryBlips(동물)!]) {
        expect(길이(blips), 동물).toBeLessThanOrEqual(0.6);
        for (const one of blips) expect(one.volume ?? 0.16, 동물).toBeLessThanOrEqual(0.09);
      }
    }
  });

  it('신나는 소리는 높고 둥글게 위로 올라가고, 화난 소리는 낮고 거칠게 아래로 떨어집니다', () => {
    for (const 동물 of 동물들) {
      const 신남 = animalHappyBlips(동물, '하')!;
      const 화남 = animalAngryBlips(동물)!;
      // 높이: 화난 소리가 신나는 소리보다 한참 낮습니다.
      expect(평균높이(화남), 동물).toBeLessThan(평균높이(신남) * 0.75);
      // 결: 화난 소리에는 거친 결이 섞이고, 신나는 소리는 거의 둥근 결입니다.
      expect(거친결(화남), 동물).toBeGreaterThanOrEqual(2);
      expect(거친결(신남), 동물).toBeLessThan(거친결(화남));
      // 방향: 화난 소리의 큰 소리들은 끝이 처음보다 낮고, 신나는 소리의 가장 큰 소리는 끝이 높습니다.
      const 큰화남 = 화남.filter((one) => (one.volume ?? 0.16) >= 0.04 && one.glide);
      expect(큰화남.length, 동물).toBeGreaterThan(0);
      for (const one of 큰화남) expect(마지막높이(one), 동물).toBeLessThan(one.frequency);
      const 큰신남 = [...신남].sort((a, b) => (b.volume ?? 0.16) - (a.volume ?? 0.16))[0];
      expect(마지막높이(큰신남), 동물).toBeGreaterThan(큰신남.frequency);
      // 떨림: 화난 소리는 빠르게 떱니다(으르르).
      expect(Math.max(...화남.map((one) => one.vibrato?.rate ?? 0)), 동물).toBeGreaterThanOrEqual(16);
    }
  });

  it('신나는 소리는 늘 높은 반짝임으로 끝납니다', () => {
    for (const 동물 of 동물들) {
      const 신남 = animalHappyBlips(동물, '하')!;
      const 끝 = [...신남].sort((a, b) => a.at + a.length - (b.at + b.length)).at(-1)!;
      expect(끝.frequency, 동물).toBeGreaterThan(1000);
    }
  });

  it('수준이 높을수록 같은 신나는 소리를 조금 높게 냅니다', () => {
    for (const 동물 of 동물들) expect(animalHappyBlips(동물, '상')![0].frequency).toBeGreaterThan(animalHappyBlips(동물, '하')![0].frequency);
  });

  it('동물이 아닌 캐릭터면 원래 소리로 돌아갑니다', () => {
    expect(animalHappyBlips('🤖', '하')).toBeNull();
    expect(animalAngryBlips('')).toBeNull();
  });
});
