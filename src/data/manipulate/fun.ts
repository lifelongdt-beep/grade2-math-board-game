import type { Difficulty, Manipulation, Question } from '../../types';
import { resolveParticles } from '../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 조작 문항을 풀고 싶게: 임무 이름표와 맞혔을 때의 칭찬
// ────────────────────────────────────────────────────────────────────
// 문제 위에 '무엇을 하는 임무인지' 짧은 이름표를 붙이고, 맞히면 그 임무에
// 맞춘 칭찬을 합니다. 열린 문항은 조건에 맞는 다른 수도 보여 주어 '답이
// 여러 개였구나' 하는 발견의 즐거움을 남깁니다. 같은 조작이라도 문항마다
// 말을 조금씩 바꾸어(문항 id로 고릅니다) 되풀이되는 느낌을 줄입니다.
// ════════════════════════════════════════════════════════════════════

export interface 임무 { emoji: string; 이름: string; 할일: string }

const 고르기 = <T,>(items: T[], 열쇠: string) => {
  let h = 0;
  for (const c of 열쇠) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return items[h % items.length];
};

/** 조작마다 '손으로 해 보기' 임무의 이름입니다. */
const 손임무: Partial<Record<Manipulation['kind'], [string, string]>> = {
  'ruler-measure': ['📏', '길이 재기 임무'], 'ruler-draw': ['✏️', '선 긋기 임무'], clock: ['⏰', '시계 맞추기 임무'],
  'grid-point': ['📍', '점 찍기 임무'], 'grid-draw': ['📐', '도형 그리기 임무'], 'shape-move': ['🔄', '도형 움직이기 임무'],
  'number-line': ['🎯', '눈금 과녁 임무'], 'tap-fill': ['🎨', '칠하고 놓기 임무'], 'base-ten': ['🧱', '수 모형 임무'],
  bars: ['📊', '그래프 만들기 임무'], angle: ['📐', '각 만들기 임무'], 'sort-bins': ['🗂️', '나누어 담기 임무'],
  'stack-build': ['🧊', '쌓기나무 임무'], 'cube-net': ['📦', '전개도 임무'], 'cylinder-net': ['🥫', '원기둥 전개도 임무'],
  'prism-net': ['🔷', '각기둥 전개도 임무'], order: ['🔢', '차례로 놓기 임무'], gauge: ['⚖️', '눈금 맞추기 임무'],
  pictograph: ['🖼️', '그림그래프 임무'], calendar: ['📅', '달력 임무'], share: ['🍽️', '똑같이 나누기 임무'],
  array: ['🔵', '점 배열 임무'], pattern: ['🧩', '규칙 무늬 임무'],
};

export const 임무이름표 = (m: Manipulation, difficulty: Difficulty): 임무 => {
  if (m.friend) {
    return { emoji: '🕵️', 이름: `실수 탐정${difficulty === '상' ? ' · 도전' : ''}`, 할일: resolveParticles(`${m.friend.emoji ?? '🧐'} ${m.friend.who ?? '친구'}이(가) 해 둔 모습이에요. 어디가 틀렸는지 찾아 고쳐 주세요!`) };
  }
  if (m.kind === 'number-line' && m.targets) {
    return { emoji: '🔍', 이름: `비밀의 수 찾기${difficulty === '상' ? ' · 도전' : ''}`, 할일: '조건에 맞는 수가 여러 개 숨어 있어요. 하나를 찾아 점을 놓아요!' };
  }
  if (m.kind === 'cube-net' && m.mode === 'move') {
    return { emoji: '🕵️', 이름: '전개도 탐정 · 도전', 할일: '잘못 놓인 면 하나를 찾아 옮기면 상자가 완성돼요!' };
  }
  const [emoji, 이름] = 손임무[m.kind] ?? ['🧩', '손으로 해 보기'];
  return { emoji, 이름, 할일: difficulty === '하' ? '천천히 손으로 해 보면 답이 보여요.' : '손으로 움직여 보며 답을 만들어요.' };
};

export interface 칭찬 { 제목: string; 말: string; 별: number }

/** 맞혔을 때의 칭찬입니다. 별은 하 1개, 중 2개, 상(고차 문항) 3개입니다. */
export const 조작칭찬 = (q: Question): 칭찬 => {
  const m = q.manipulate!;
  const 별 = q.difficulty === '상' ? 3 : q.difficulty === '중' ? 2 : 1;
  if (m.friend) {
    const 누구 = m.friend.who ?? '친구';
    return {
      제목: 고르기(['실수 탐정 성공!', '사건 해결!', '찾아냈어요!'], q.id),
      말: resolveParticles(`${m.friend.emoji ?? ''} ${누구}의 실수를 찾아 바르게 고쳐 주었어요. ${누구}이(가) "고마워!" 하고 말해요.`.trim()),
      별,
    };
  }
  if (m.kind === 'number-line' && m.targets) {
    const 모두 = q.answer.replace(/ 가운데 하나$/, '');
    return {
      제목: 고르기(['비밀의 수 발견!', '찾았다!', '조건을 모두 맞혔어요!'], q.id),
      말: `숨어 있던 수 가운데 하나를 찾아냈어요. 조건에 맞는 수를 모두 모으면 ${모두}. 다른 수도 맞는지 머릿속으로 확인해 볼까요?`,
      별,
    };
  }
  const [emoji, 이름] = 손임무[m.kind] ?? ['🧩', '조작'];
  return {
    제목: 고르기([`${이름} 완료!`, '손으로 해냈어요!', '척척 해냈어요!'], q.id),
    말: `${emoji} ${고르기(['직접 해 보니 답이 보였지요?', '손으로 만든 답이 딱 맞았어요.', '한 단계씩 차근차근 해냈어요.'], `${q.id}말`)}`,
    별,
  };
};
