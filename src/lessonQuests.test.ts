import { describe, expect, it } from 'vitest';
import { 미션들, 빈통계, 오늘미션, 지난나목표, 카드넣기, 카드이름 } from './lessonQuests';

describe('오늘의 미션', () => {
  it('아이마다 미션 셋을 주고, 같은 갈래(5문제·8문제)는 함께 내지 않습니다', () => {
    for (let no = 1; no <= 30; no += 1) {
      for (const lessonId of ['2-1-u1-l2', '2-2-u4-l3', '3-1-u2-l5']) {
        const 고른 = 오늘미션(no, lessonId);
        expect(고른).toHaveLength(3);
        const 갈래 = 고른.map((one) => one.id.split('-')[0]);
        expect(new Set(갈래).size).toBe(3);
      }
    }
  });

  it('같은 아이·같은 차시면 같은 미션이고, 아이나 차시가 바뀌면 미션도 고루 바뀝니다', () => {
    expect(오늘미션(3, 'a').map((m) => m.id)).toEqual(오늘미션(3, 'a').map((m) => m.id));
    const 나온 = new Set<string>();
    for (let no = 1; no <= 25; no += 1) for (const m of 오늘미션(no, `l${no % 4}`)) 나온.add(m.id);
    expect(나온.size).toBe(미션들.length);
  });

  it('통계가 채워지면 미션이 끝납니다', () => {
    const 찾기 = (id: string) => 미션들.find((m) => m.id === id)!;
    const t = 빈통계();
    expect(미션들.some((m) => m.됐나(t))).toBe(false);
    expect(찾기('solve-5').됐나({ ...t, 맞힘: 5 })).toBe(true);
    expect(찾기('no-hint-3').됐나({ ...t, 힌트없이최고: 3 })).toBe(true);
    expect(찾기('catch-1').됐나({ ...t, 잡은몬스터: 1 })).toBe(true);
    expect(찾기('level-up').됐나({ ...t, 올라감: true })).toBe(true);
  });
});

describe('나와의 경주', () => {
  it('지난번 기록을 오늘 수업 시간에 맞춰 줄이거나 늘립니다', () => {
    expect(지난나목표({ 맞힘: 8, 초: 600 }, 300)).toBe(4);
    expect(지난나목표({ 맞힘: 4, 초: 180 }, 300)).toBe(7);
    expect(지난나목표({ 맞힘: 1, 초: 600 }, 60)).toBe(1);
  });

  it('지난 기록이 없거나 한 문제도 못 맞혔으면 견주지 않습니다', () => {
    expect(지난나목표(null, 300)).toBeNull();
    expect(지난나목표({ 맞힘: 0, 초: 300 }, 300)).toBeNull();
  });
});

describe('개념 카드 도감', () => {
  it('처음 얻으면 new, 더 높은 수준이면 up, 같거나 낮으면 그대로입니다', () => {
    const 첫 = 카드넣기({}, 'l1', '하');
    expect(첫).toEqual({ 모음: { l1: '하' }, 바뀜: 'new' });
    const 오름 = 카드넣기(첫.모음, 'l1', '상');
    expect(오름).toEqual({ 모음: { l1: '상' }, 바뀜: 'up' });
    expect(카드넣기(오름.모음, 'l1', '중')).toEqual({ 모음: { l1: '상' }, 바뀜: null });
    expect(카드넣기(오름.모음, 'l1', '상').바뀜).toBeNull();
  });

  it('카드 이름에서 차시 번호를 뺍니다', () => {
    expect(카드이름('몇 시 몇 분을 읽어 볼까요 (1)')).toBe('몇 시 몇 분을 읽어 볼까요');
    expect(카드이름('시각과 시간을 알아볼까요')).toBe('시각과 시간을 알아볼까요');
  });
});
