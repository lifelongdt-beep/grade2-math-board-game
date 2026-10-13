import type { Difficulty, Lesson } from '../../types';
import type { G5Family } from '../grade5/build';
import { 수준41 } from './s41';
import { 수준61 } from './s61';
import { 수준62 } from './s62';

// ════════════════════════════════════════════════════════════════════
// 수준마다 덧붙이는 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   하 — 단순한 지식을 묻습니다(뜻, 이름, 바로 계산).
//   중 — 약간의 고민이 필요합니다.
//   상 — 고차적인 사고력이 필요합니다. 학습목표를 이루는 데 필요한
//        생각이어야 합니다: 풀이 과정과 까닭 따지기, 잘못 찾아 바로잡기,
//        거꾸로 생각하기, 수학 용어를 바르게 쓴 말 고르기, 생활 속 응용.
//
// 열쇠는 '학기 단원-차시'입니다(예: '4-1 2-4'). 문항 하나하나의 답은
// 문제에 쓴 수에서 계산하고, 따로 다시 풀어 보는 검사를 붙입니다.
// ════════════════════════════════════════════════════════════════════

export type 수준표 = Record<string, Partial<Record<Difficulty, G5Family[]>>>;

const 모든표: 수준표[] = [수준41, 수준61, 수준62];

export const 수준뭉치 = (lesson: Lesson, difficulty: Difficulty): G5Family[] => {
  const 열쇠 = `${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo}`;
  return 모든표.flatMap((표) => 표[열쇠]?.[difficulty] ?? []);
};
