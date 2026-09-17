import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { eul, eun, gwa, i as iJosa, particleOf } from './util';

// ════════════════════════════════════════════════════════════════════
// 분수를 우리말로 적을 때 어긋나기 쉬운 두 가지
// ────────────────────────────────────────────────────────────────────
// ① 분수 뒤의 조사
//    분수는 '분모분의 분자'로 읽습니다. 3/5는 '오분의 삼'이므로 마지막에
//    나는 소리는 분자(삼)입니다. 글자 차례대로 맨 뒤인 분모(오)로 정하면
//    '3/5와'가 되어 어긋납니다.
//
// ② 조사를 붙이려다 앞말을 다시 찍는 것
//    `${n}/${d}${gwa(String(n))}`처럼 적으면 '21/28' 뒤에 '21과'가 또
//    찍혀 '21/2821과'가 됩니다. 그러면 글에는 없던 분수 21/2821이
//    생기는데, 겉보기에는 멀쩡한 분수라 눈으로도 시험으로도 잘
//    드러나지 않습니다. 조사를 따로 붙여야 할 때는 particleOf를 씁니다.
// ════════════════════════════════════════════════════════════════════

describe('분수 뒤의 조사', () => {
  it('분모가 아니라 분자를 보고 고른다', () => {
    // 3/5 → 오분의 삼 → 받침 있음,  3/4 → 사분의 삼 → 받침 있음
    expect(gwa('3/5')).toBe('3/5과');
    expect(eul('3/4')).toBe('3/4을');
    expect(eun('7/5')).toBe('7/5은');
    expect(iJosa('1/7')).toBe('1/7이');
    // 2/5 → 오분의 이 → 받침 없음
    expect(gwa('2/5')).toBe('2/5와');
    expect(eul('2/7')).toBe('2/7를');
    expect(iJosa('4/9')).toBe('4/9가');
    // 21/28 → 이십팔분의 이십일 → 받침 있음
    expect(gwa('21/28')).toBe('21/28과');
    // 대분수도 분수 부분을 봅니다.
    expect(eul('1과 3/4')).toBe('1과 3/4을');
    // 4/7 → 칠분의 사 → 받침 없음
    expect(gwa('2와 4/7')).toBe('2와 4/7와');
    // 단위가 붙으면 단위를 봅니다.
    expect(iJosa('3/4 km')).toBe('3/4 km가');
    expect(iJosa('3/4 kg')).toBe('3/4 kg이');
    // 조사만 따로 받는 것도 같습니다.
    expect(particleOf('3/4', '을')).toBe('을');
  });
});

describe('문항을 만드는 코드', () => {
  const 모으기 = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return 모으기(path);
      return path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : [];
    });

  it('조사를 붙이려고 앞말을 다시 찍지 않는다', () => {
    // `.../${d}}${gwa(String(n))}`처럼 분수 바로 뒤에서 수를 다시 찍는
    // 자리를 찾습니다. 조사만 필요하면 particleOf를 씁니다.
    const 잘못 = /\/\$\{[^}]*\}\$\{(?:gwa|eul|eun|iJosa|i|euro)\(String\(/;
    const broken: string[] = [];
    for (const path of 모으기(join(__dirname))) {
      const lines = readFileSync(path, 'utf8').split('\n');
      lines.forEach((line, at) => {
        if (잘못.test(line)) broken.push(`${path}:${at + 1} — ${line.trim().slice(0, 90)}`);
      });
    }
    expect(broken).toEqual([]);
  });
});
