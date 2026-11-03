import type { Difficulty, Lesson } from '../../types';
import type { G5Family } from '../grade5/build';
export type 수준표 = Record<string, Partial<Record<Difficulty, G5Family[]>>>;
const tables = new Set<수준표>();
export const registerLevels = (...items: 수준표[]) => { items.forEach(item => tables.add(item)); };
export const 수준뭉치 = (lesson: Lesson, difficulty: Difficulty): G5Family[] => {
  const key = `${lesson.semester} ${lesson.unitNo}-${lesson.lessonNo}`;
  return [...tables].flatMap(table => table[key]?.[difficulty] ?? []);
};
