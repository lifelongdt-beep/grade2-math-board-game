import type { ConceptTag, Difficulty, Lesson, Question } from '../../types';
import { generateQuestions } from '../questionFactory';
import { 놀이문항수, 놀이원본 } from './index';
import { 단순문항, 단순문항있나 } from './quick';

// ── 놀이에 맞는 문항 고르기 ───────────────────────────────────────────

/** 놀이 문항은 몇 초 안에 읽혀야 합니다. 글이 이보다 길면 놀이보다 공부가 됩니다. */
const 글한도 = [42, 56, 72];
const 보기한도 = 14;

const 놀이에맞나 = (q: Question, 한도: number) =>
  // 손으로 조작하는 문항은 놀이 시계 안에 끝내기 어렵습니다. 그림은 놀이 카드 안에 함께 보여 줍니다.
  !q.manipulate && q.choices.length === 4 &&
  q.prompt.length <= 한도 && (q.choiceVisuals ? true : q.choices.every((one) => one.length <= 보기한도)) &&
  // 그림이 없는데 그림을 보라고 하는 문항은 글만으로 풀 수 없습니다.
  (Boolean(q.visual || q.choiceVisuals) || !/그림|표를|표에서|그래프|아래|위의/.test(q.prompt));

const 섞기 = <T,>(items: T[], seed: number): T[] => {
  const out = [...items];
  let s = (seed >>> 0) || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};


/**
 * 놀이 차시의 문항입니다. 하는 그 단원의 하 문항, 중·상은 하와 중 문항을 섞어 씁니다
 * (놀이는 쉬워야 신납니다. 상은 문항이 아니라 시간이 짧아져 어려워집니다).
 * 그 단원에서 가장 많이 나오는 갈래(핵심 개념)의 문항을 앞세웁니다.
 */
export const 놀이문항 = (game: Lesson, difficulty: Difficulty, seed: number): Question[] => {
  const sources = 놀이원본(game);
  if (!sources) return [];
  if (단순문항있나(game)) return 단순문항(game, difficulty, seed, 놀이문항수);
  const 수준들: Difficulty[] = difficulty === '하' ? ['하'] : ['하', '중'];
  const 모두 = sources.flatMap((one) => 수준들.flatMap((lv) => {
    try {
      return generateQuestions(one, lv);
    } catch {
      return [];
    }
  }));
  const 본 = new Set<string>();
  const 하나씩 = 모두.filter((q) => (본.has(q.prompt) ? false : (본.add(q.prompt), true)));
  // 글이 짧은 것부터 넉넉히 모일 때까지 한도를 늘립니다.
  let 고른: Question[] = [];
  for (const 한도 of 글한도) {
    고른 = 하나씩.filter((q) => 놀이에맞나(q, 한도));
    if (고른.length >= 24) break;
  }
  // 핵심 개념(가장 많이 나온 갈래)을 앞세웁니다.
  const 셈 = new Map<ConceptTag, number>();
  for (const q of 고른) 셈.set(q.type, (셈.get(q.type) ?? 0) + 1);
  const 핵심 = [...셈.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const 앞 = 섞기(고른.filter((q) => q.type === 핵심), seed);
  const 뒤 = 섞기(고른.filter((q) => q.type !== 핵심), seed + 7);
  // 핵심 개념 문항을 셋에 둘쯤 둡니다.
  const 섞인: Question[] = [];
  while ((앞.length || 뒤.length) && 섞인.length < 놀이문항수) {
    if (앞.length) 섞인.push(앞.shift()!);
    if (앞.length) 섞인.push(앞.shift()!);
    if (뒤.length) 섞인.push(뒤.shift()!);
  }
  return 섞인.map((q, at) => ({ ...q, id: `${game.id}-${difficulty}-${at + 1}`, difficulty }));
};
