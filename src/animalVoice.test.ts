import { describe, expect, it } from 'vitest';
import { 동물이름 } from './data/nameSwap';
import { animalHappyBlips, animalOopsBlips } from './sound';

// 고를 수 있는 동물마다 맞혔을 때 기뻐하는 소리와 틀렸을 때 갸웃하는 소리가 있어야 합니다.
// 둘 다 그 동물다운 소리이면서 듣기 좋은 소리여야 합니다.
describe('동물 캐릭터의 정답·오답 소리', () => {
  const 동물들 = Object.keys(동물이름);
  const 길이 = (blips: { at: number; length: number }[]) => Math.max(...blips.map((one) => one.at + one.length));
  const 서명 = (blips: { frequency: number; type?: string; at: number }[]) => blips.map((one) => `${one.type}:${Math.round(one.frequency)}@${one.at}`).join(' ');

  it('모든 동물이 맞히면 기뻐하고, 틀리면 갸웃합니다', () => {
    for (const 동물 of 동물들) {
      expect(animalHappyBlips(동물, '하'), 동물).not.toBeNull();
      expect(animalOopsBlips(동물), 동물).not.toBeNull();
    }
  });

  it('동물마다 소리가 다릅니다', () => {
    expect(new Set(동물들.map((동물) => 서명(animalHappyBlips(동물, '하')!))).size).toBe(동물들.length);
    expect(new Set(동물들.map((동물) => 서명(animalOopsBlips(동물)!))).size).toBe(동물들.length);
  });

  it('다섯이 한꺼번에 내도 시끄럽지 않게 짧고 작습니다', () => {
    for (const 동물 of 동물들) {
      for (const blips of [animalHappyBlips(동물, '상')!, animalOopsBlips(동물)!]) {
        expect(길이(blips), 동물).toBeLessThanOrEqual(0.6);
        for (const one of blips) expect(one.volume ?? 0.16, 동물).toBeLessThanOrEqual(0.09);
      }
    }
  });

  it('틀렸을 때도 거친 소리 없이, 끝을 올려 묻는 듯한 듣기 좋은 소리를 냅니다', () => {
    for (const 동물 of 동물들) {
      const 갸웃 = animalOopsBlips(동물)!;
      for (const one of 갸웃) expect(one.type, 동물).not.toBe('sawtooth');
      // 가장 늦게 끝나는 소리의 마지막 높이가 그 소리의 처음보다 높습니다(묻는 말투).
      const 끝 = [...갸웃].sort((a, b) => a.at + a.length - (b.at + b.length)).at(-1)!;
      expect(끝.glide!.at(-1)!, 동물).toBeGreaterThan(끝.frequency);
      // 기쁨 소리보다 작게 냅니다.
      const 큰 = (blips: { volume?: number }[]) => Math.max(...blips.map((one) => one.volume ?? 0.16));
      expect(큰(갸웃), 동물).toBeLessThanOrEqual(큰(animalHappyBlips(동물, '하')!));
    }
  });

  it('수준이 높을수록 같은 기쁨 소리를 조금 높게 냅니다', () => {
    for (const 동물 of 동물들) expect(animalHappyBlips(동물, '상')![0].frequency).toBeGreaterThan(animalHappyBlips(동물, '하')![0].frequency);
  });

  it('동물이 아닌 캐릭터면 원래 소리로 돌아갑니다', () => {
    expect(animalHappyBlips('🤖', '하')).toBeNull();
    expect(animalOopsBlips('')).toBeNull();
  });
});
