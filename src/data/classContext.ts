export interface ClassContext { schoolYear: number; classId: string }
const KEY = 'mathClassContext:v1';
export const academicYear = (date = new Date()) => date.getFullYear() - (date.getMonth() < 2 ? 1 : 0);
export const readClassContext = (): ClassContext => {
  try {
    const params = new URLSearchParams(window.location.search);
    const year = Number(params.get('cy')), classId = params.get('class');
    if ((params.get('m') === '1' || params.get('mobile') === '1') && Number.isInteger(year) && year >= 2000 && year <= 2200 && classId?.trim() && classId.length <= 80) return { schoolYear: year, classId: classId.trim() };
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (Number.isInteger(value?.schoolYear) && value.schoolYear >= 2000 && typeof value.classId === 'string' && value.classId.trim()) return value;
  } catch { /* 기본 학급으로 시작합니다. */ }
  return { schoolYear: academicYear(), classId: '기본 학급' };
};
export const writeClassContext = (value: ClassContext) => {
  if (!Number.isInteger(value.schoolYear) || value.schoolYear < 2000 || value.schoolYear > 2200 || !value.classId.trim() || value.classId.length > 80) throw new Error('학년도와 학급 이름을 확인해 주세요.');
  localStorage.setItem(KEY, JSON.stringify({ ...value, classId: value.classId.trim() }));
};
export const classKey = (value: Partial<ClassContext>) => value.schoolYear && value.classId ? `${value.schoolYear}|${value.classId}` : 'legacy';
export const studentKey = (no: number, context = readClassContext()) => `${classKey(context)}|${no}`;
export const scopedStorageKey = (key: string) => `${key}:${classKey(readClassContext())}`;
/** 기존 명단·보상은 첫 기본 학급에 한 번만 옮기고 다른 학급과 공유하지 않습니다. */
export const readScopedStorage = (key: string): string | null => {
  try {
    const store = window.localStorage, scoped = scopedStorageKey(key);
    const current = store.getItem(scoped);
    if (current !== null) return current;
    const marker = `mathClassMigration:${key}`, assigned = store.getItem(marker);
    if (readClassContext().classId !== '기본 학급' || (assigned && assigned !== scoped)) return null;
    const legacy = store.getItem(key);
    if (legacy !== null) { store.setItem(scoped, legacy); store.setItem(marker, scoped); }
    return legacy;
  } catch { return null; }
};
