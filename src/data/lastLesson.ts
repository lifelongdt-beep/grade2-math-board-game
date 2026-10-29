// ════════════════════════════════════════════════════════════════════
// 선생님이 마지막으로 수업한 차시
// ────────────────────────────────────────────────────────────────────
// 첫 화면은 늘 2학년 1학기 1단원 첫 차시로 열려서, 선생님이 매번 학년·학기·단원·차시를
// 다시 골라야 했습니다. 수업을 시작할 때 그 차시를 이 컴퓨터에 적어 두고, 다음에 첫 화면을
// 열면 그 차시가 골라져 있게 합니다. 수업 시간(분)도 함께 둡니다.
//
// 주소에 차시가 적혀 있으면(공유 링크, QR로 들어온 휴대폰) 주소가 먼저입니다.
// ════════════════════════════════════════════════════════════════════

import type { Semester, Unit } from '../types';

export interface 마지막차시 {
  semester: Semester;
  /** 단원 번호이거나 학기 종합('semester-review')입니다. */
  unit: number | 'semester-review';
  lessonId: string;
  duration?: number;
}

const 열쇠 = 'lastLesson:v1';

export const 마지막차시쓰기 = (값: 마지막차시) => {
  try {
    window.localStorage.setItem(열쇠, JSON.stringify(값));
  } catch {
    // 저장할 수 없으면 다음에도 처음 차시로 열릴 뿐입니다.
  }
};

/**
 * 적어 둔 차시가 지금 교육과정에 그대로 있는지 확인해 돌려줍니다. 차시가 바뀌었거나 지워졌으면
 * (앱이 고쳐져 차시 id가 달라진 경우 등) 엉뚱한 차시를 열지 않도록 null입니다.
 */
export const 마지막차시확인 = (raw: unknown, curriculum: Unit[]): 마지막차시 | null => {
  if (!raw || typeof raw !== 'object') return null;
  const 값 = raw as Partial<마지막차시>;
  if (typeof 값.semester !== 'string' || typeof 값.lessonId !== 'string') return null;
  const 단원들 = curriculum.filter((unit) => unit.semester === 값.semester);
  if (단원들.length === 0) return null;
  const 시간 = typeof 값.duration === 'number' && Number.isFinite(값.duration) ? { duration: 값.duration } : {};
  if (값.unit === 'semester-review') {
    return 값.lessonId === `${값.semester}-semester-review` ? { semester: 값.semester, unit: 'semester-review', lessonId: 값.lessonId, ...시간 } : null;
  }
  const 단원 = 단원들.find((unit) => unit.unitNo === 값.unit);
  if (!단원) return null;
  const 있음 = 단원.lessons.some((lesson) => lesson.id === 값.lessonId) || 값.lessonId === `${값.semester}-u${단원.unitNo}-review`;
  return 있음 ? { semester: 값.semester, unit: 단원.unitNo, lessonId: 값.lessonId, ...시간 } : null;
};

export const 마지막차시읽기 = (curriculum: Unit[]): 마지막차시 | null => {
  try {
    const raw = window.localStorage.getItem(열쇠);
    return raw ? 마지막차시확인(JSON.parse(raw), curriculum) : null;
  } catch {
    return null;
  }
};
