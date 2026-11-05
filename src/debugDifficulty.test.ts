import { it, expect, describe } from 'vitest';
import { curriculum } from './data/allCurriculum';
import { 놀이문항 } from './data/games/questions';

describe('전 학년 놀이 차시 진단', () => {
  const 게임차시들 = curriculum.flatMap(unit => 
    unit.lessons.filter(l => l.id.endsWith('-game'))
  );
  
  게임차시들.forEach(game => {
    it(game.semester + ' - ' + game.title + ' (' + game.id + ')', () => {
      const 하 = 놀이문항(game, '하', 1);
      const 중 = 놀이문항(game, '중', 1);
      const 상 = 놀이문항(game, '상', 1);
      
      if (하.length === 0) console.error('[FAIL] ' + game.id + ' 하 문항 0개');
      if (중.length === 0) console.error('[FAIL] ' + game.id + ' 중 문항 0개');
      if (상.length === 0) console.error('[FAIL] ' + game.id + ' 상 문항 0개');
      
      expect(하.length, game.id + ' 하 문항 부족').toBeGreaterThan(0);
      expect(중.length, game.id + ' 중 문항 부족').toBeGreaterThan(0);
      expect(상.length, game.id + ' 상 문항 부족').toBeGreaterThan(0);
    });
  });
});
