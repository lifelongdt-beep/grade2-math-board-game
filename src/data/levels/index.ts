import { auditGrade3, auditGrade5 } from './auditRepairs';
import type { Difficulty, Lesson } from '../../types';
import type { G5Family } from '../grade5/build';
import { 수준1 } from './s1';
import { 수준1고난도 } from './s1hard';
import { 수준11문제집 } from './s11book';
import { 수준12문제집 } from './s12book';
import { 수준3 } from './s3';
import { 수준31문제집 } from './s31book';
import { 수준32문제집 } from './s32book';
import { 수준41 } from './s41';
import { 수준41문제집 } from './s41book';
import { 수준42 } from './s42';
import { 수준51 } from './s51';
import { 수준52 } from './s52';
import { 수준52고난도 } from './s52hard';
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

export type { 수준표 } from './registry';
export { 수준뭉치 } from './registry';
import { registerLevels } from './registry';
const 모든표 = [수준1, 수준1고난도, 수준11문제집, 수준12문제집, 수준3, 수준31문제집, 수준32문제집, 수준41, 수준41문제집, 수준42, 수준51, 수준52, 수준52고난도, 수준61, 수준62, auditGrade3, auditGrade5];

registerLevels(...모든표);
