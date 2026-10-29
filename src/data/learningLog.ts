// ════════════════════════════════════════════════════════════════════
// 학습 기록장: 학생이 푼 문제를 교사용 컴퓨터에 계속 쌓아 둡니다
// ────────────────────────────────────────────────────────────────────
// 놀이 화면의 풀이 기록(records)은 화면 상태라서, 판을 다시 시작하거나 창을 닫으면
// 사라졌습니다. 여기서는 한 문제를 풀 때마다 그 기록을 이 컴퓨터의 브라우저 저장소
// (IndexedDB)에 바로 적어 둡니다. 교사용 학습 기록장 페이지(TeacherBook)가 이 기록을
// 읽어 표와 그래프, 지도 방안을 보여 줍니다.
//
//   · 같은 컴퓨터, 같은 브라우저에서만 보입니다. 다른 컴퓨터로 옮기려면 백업 파일을 씁니다.
//   · 브라우저가 공간이 모자랄 때 지우지 않도록 '오래 남기기(persist)'를 요청합니다.
//   · 선생님이 백업 파일을 연결해 두면(크롬·엣지) 기록이 바뀔 때마다 그 파일에도 저장합니다.
//   · 학생 휴대폰(QR로 들어온 화면)에서는 쌓지 않습니다. 그 기록은 교사 화면이 받아 와서 쌓습니다.
// ════════════════════════════════════════════════════════════════════

import type { AnswerRecord, ConceptTag, Difficulty, LearningSupport, Lesson, QuestionVisual, Semester } from '../types';

/** 학습 기록장에 남는 한 문제의 기록입니다. 누가(출석번호)·언제·어느 차시를 풀었는지가 함께 남습니다. */
export interface 학습기록 {
  id: string;
  /** 출석번호입니다. 학생은 이 번호로 구별합니다. */
  no: number;
  semester: Semester;
  grade: number;
  unitNo: number;
  unitTitle: string;
  lessonId: string;
  /** 단원 정리·학기 정리처럼 차시가 아닌 판은 0입니다. */
  lessonNo: number;
  lessonTitle: string;
  /** 푼 날짜(이 컴퓨터 시각 기준, YYYY-MM-DD)입니다. 날짜별로 거르고 지울 때 씁니다. */
  date: string;
  answeredAt: string;
  correct: boolean;
  difficulty: Difficulty;
  type: ConceptTag;
  strategy: string;
  questionId: string;
  prompt: string;
  choices: string[];
  answer: string;
  chosen: string;
  chosenMeaning?: string;
  explanation: string;
  misconception: string;
  support: LearningSupport;
  visual?: QuestionVisual;
  hintUsed: boolean;
  /** 1이면 처음 푼 문제, 2 이상이면 틀린 뒤 다시 나온 문제입니다. */
  attempts: number;
  responseMs: number;
  /** QR로 들어온 휴대폰에서 푼 기록이면 true입니다. */
  remote?: boolean;
}

const 두자리 = (n: number) => String(n).padStart(2, '0');

/** 이 컴퓨터 시각으로 날짜를 적습니다. toISOString은 세계 표준시라 아침 9시 전 기록이 전날로 갑니다. */
export const 날짜글 = (when: Date) => `${when.getFullYear()}-${두자리(when.getMonth() + 1)}-${두자리(when.getDate())}`;

export const 학년 = (semester: Semester) => Number(semester.split('-')[0]);

/** 놀이 화면의 풀이 기록 하나를 학습 기록장 기록으로 바꿉니다. */
export const 기록만들기 = (
  record: AnswerRecord,
  who: { no: number; remote?: boolean },
  lesson: Pick<Lesson, 'semester' | 'unitNo' | 'unitTitle' | 'lessonNo' | 'title' | 'id'>,
): 학습기록 => {
  const when = new Date(record.answeredAt);
  const 시각 = Number.isNaN(when.getTime()) ? new Date() : when;
  return {
    // 휴대폰 기록은 휴대폰마다 자리 번호(playerId)가 같을 수 있어, 출석번호를 붙여 겹치지 않게 합니다.
    id: `${record.id}#${who.no}`,
    no: who.no,
    semester: lesson.semester,
    grade: 학년(lesson.semester),
    unitNo: lesson.unitNo,
    unitTitle: lesson.unitTitle || record.unitTitle,
    lessonId: lesson.id,
    lessonNo: lesson.lessonNo,
    lessonTitle: lesson.title || record.lessonTitle,
    date: 날짜글(시각),
    answeredAt: 시각.toISOString(),
    correct: record.correct,
    difficulty: record.difficulty,
    type: record.type,
    strategy: record.strategy,
    questionId: record.questionId,
    prompt: record.prompt,
    choices: record.choices,
    answer: record.answer,
    chosen: record.chosen,
    ...(record.chosenMeaning ? { chosenMeaning: record.chosenMeaning } : {}),
    explanation: record.explanation,
    misconception: record.misconception,
    support: record.support,
    ...(record.visual ? { visual: record.visual } : {}),
    hintUsed: Boolean(record.hintUsed),
    attempts: record.attempts,
    responseMs: record.responseMs,
    ...(who.remote ? { remote: true } : {}),
  };
};

// ── 저장소 ─────────────────────────────────────────────────────────────

const DB이름 = 'mathLearningLog';
const 기록칸 = 'records';
const 휴지통칸 = 'trash';
const 설정칸 = 'settings';
const 알림통로 = 'mathLearningLog';

/** 저장소가 바뀌었을 때 같은 컴퓨터의 다른 탭(기록장 페이지)에 알립니다. */
const 알리기 = () => {
  try {
    const 통로 = new BroadcastChannel(알림통로);
    통로.postMessage('changed');
    통로.close();
  } catch {
    // 오래된 브라우저면 기록장 페이지가 다시 열 때 새로 읽습니다.
  }
  바뀜듣는이들.forEach((one) => one());
};

const 바뀜듣는이들 = new Set<() => void>();

/** 기록이 바뀌면 부릅니다(같은 탭과 다른 탭 모두). 그만 들으려면 돌려준 함수를 부릅니다. */
export const 바뀜듣기 = (듣는이: () => void) => {
  바뀜듣는이들.add(듣는이);
  let 통로: BroadcastChannel | null = null;
  try {
    통로 = new BroadcastChannel(알림통로);
    통로.onmessage = () => 듣는이();
  } catch {
    통로 = null;
  }
  return () => {
    바뀜듣는이들.delete(듣는이);
    통로?.close();
  };
};

// IndexedDB가 없는 곳(검사 환경, 아주 오래된 브라우저)에서는 이 탭의 메모리에만 둡니다.
const 메모리 = { records: new Map<string, 학습기록>(), trash: [] as 학습기록[], settings: new Map<string, unknown>() };

let 여는중: Promise<IDBDatabase | null> | null = null;

const 열기 = (): Promise<IDBDatabase | null> => {
  if (여는중) return 여는중;
  여는중 = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const 요청 = indexedDB.open(DB이름, 1);
      요청.onupgradeneeded = () => {
        const db = 요청.result;
        if (!db.objectStoreNames.contains(기록칸)) db.createObjectStore(기록칸, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(휴지통칸)) db.createObjectStore(휴지통칸, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(설정칸)) db.createObjectStore(설정칸);
      };
      요청.onsuccess = () => resolve(요청.result);
      요청.onerror = () => resolve(null);
      요청.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return 여는중;
};

const 끝날때까지 = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

const 모두꺼내기 = <T>(db: IDBDatabase, 칸: string) =>
  new Promise<T[]>((resolve, reject) => {
    const 요청 = db.transaction(칸, 'readonly').objectStore(칸).getAll();
    요청.onsuccess = () => resolve(요청.result as T[]);
    요청.onerror = () => reject(요청.error);
  });

/** 기록을 더합니다. 같은 id가 이미 있으면 덮어씁니다(같은 기록을 두 번 받아도 하나만 남습니다). */
export const 기록더하기 = async (items: 학습기록[]) => {
  if (items.length === 0) return;
  const db = await 열기();
  if (!db) {
    items.forEach((one) => 메모리.records.set(one.id, one));
  } else {
    const tx = db.transaction(기록칸, 'readwrite');
    const 칸 = tx.objectStore(기록칸);
    items.forEach((one) => 칸.put(one));
    await 끝날때까지(tx);
  }
  알리기();
  void 백업파일에쓰기();
};

export const 기록모두읽기 = async (): Promise<학습기록[]> => {
  const db = await 열기();
  const 모두 = db ? await 모두꺼내기<학습기록>(db, 기록칸) : [...메모리.records.values()];
  return 모두.sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
};

/**
 * 고른 기록을 지웁니다. 지운 기록은 휴지통에 한 묶음으로 남겨, 바로 '되돌리기'할 수 있습니다.
 * 휴지통에는 가장 최근에 지운 한 묶음만 남깁니다.
 */
export const 기록지우기 = async (ids: string[]) => {
  if (ids.length === 0) return 0;
  const 지울 = new Set(ids);
  const db = await 열기();
  if (!db) {
    메모리.trash = [...메모리.records.values()].filter((one) => 지울.has(one.id));
    지울.forEach((id) => 메모리.records.delete(id));
  } else {
    const 지금 = await 모두꺼내기<학습기록>(db, 기록칸);
    const 버릴 = 지금.filter((one) => 지울.has(one.id));
    const tx = db.transaction([기록칸, 휴지통칸], 'readwrite');
    const 기록 = tx.objectStore(기록칸);
    const 휴지통 = tx.objectStore(휴지통칸);
    휴지통.clear();
    버릴.forEach((one) => {
      휴지통.put(one);
      기록.delete(one.id);
    });
    await 끝날때까지(tx);
  }
  알리기();
  void 백업파일에쓰기();
  return 지울.size;
};

export const 휴지통읽기 = async (): Promise<학습기록[]> => {
  const db = await 열기();
  return db ? 모두꺼내기<학습기록>(db, 휴지통칸) : [...메모리.trash];
};

/** 방금 지운 묶음을 되살립니다. */
export const 되돌리기 = async () => {
  const 버린 = await 휴지통읽기();
  if (버린.length === 0) return 0;
  const db = await 열기();
  if (!db) {
    버린.forEach((one) => 메모리.records.set(one.id, one));
    메모리.trash = [];
  } else {
    const tx = db.transaction([기록칸, 휴지통칸], 'readwrite');
    버린.forEach((one) => tx.objectStore(기록칸).put(one));
    tx.objectStore(휴지통칸).clear();
    await 끝날때까지(tx);
  }
  알리기();
  void 백업파일에쓰기();
  return 버린.length;
};

/** 브라우저가 공간이 모자랄 때 이 기록을 지우지 않도록 부탁합니다. 이미 허락되었으면 true입니다. */
export const 오래남기기 = async (): Promise<boolean> => {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
};

// ── 백업 ──────────────────────────────────────────────────────────────

export interface 백업묶음 {
  kind: 'math-learning-log';
  version: 1;
  savedAt: string;
  records: 학습기록[];
}

export const 백업만들기 = (records: 학습기록[]): 백업묶음 => ({
  kind: 'math-learning-log',
  version: 1,
  savedAt: new Date().toISOString(),
  records,
});

/** 백업 파일 글을 읽어 기록을 꺼냅니다. 이 앱의 백업이 아니면 null입니다. */
export const 백업풀기 = (text: string): 학습기록[] | null => {
  try {
    const data = JSON.parse(text) as Partial<백업묶음>;
    if (data?.kind !== 'math-learning-log' || !Array.isArray(data.records)) return null;
    return data.records.filter((one): one is 학습기록 =>
      Boolean(one && typeof one.id === 'string' && typeof one.no === 'number' && typeof one.semester === 'string' && typeof one.date === 'string'));
  } catch {
    return null;
  }
};

// 크롬·엣지에서는 선생님이 고른 파일 하나에 기록이 바뀔 때마다 백업을 덮어씁니다.
// 파일을 가리키는 손잡이(handle)는 저장소에 넣어 두고, 다시 열면 쓰기 허락만 한 번 더 받습니다.
type 파일손잡이 = {
  name: string;
  createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>;
  queryPermission?: (o: { mode: 'readwrite' }) => Promise<PermissionState>;
  requestPermission?: (o: { mode: 'readwrite' }) => Promise<PermissionState>;
};

const 설정읽기 = async <T>(key: string): Promise<T | undefined> => {
  const db = await 열기();
  if (!db) return 메모리.settings.get(key) as T | undefined;
  return new Promise((resolve) => {
    const 요청 = db.transaction(설정칸, 'readonly').objectStore(설정칸).get(key);
    요청.onsuccess = () => resolve(요청.result as T | undefined);
    요청.onerror = () => resolve(undefined);
  });
};

const 설정쓰기 = async (key: string, value: unknown) => {
  const db = await 열기();
  if (!db) {
    if (value === undefined) 메모리.settings.delete(key);
    else 메모리.settings.set(key, value);
    return;
  }
  const tx = db.transaction(설정칸, 'readwrite');
  if (value === undefined) tx.objectStore(설정칸).delete(key);
  else tx.objectStore(설정칸).put(value, key);
  await 끝날때까지(tx);
};

export const 백업파일지원 = () => typeof window !== 'undefined' && 'showSaveFilePicker' in window;

export type 백업파일상태 = { 이름: string; 쓸수있음: boolean; 마지막?: string } | null;

export const 백업파일상태읽기 = async (): Promise<백업파일상태> => {
  const 손잡이 = await 설정읽기<파일손잡이>('backupFile');
  if (!손잡이) return null;
  const 허락 = (await 손잡이.queryPermission?.({ mode: 'readwrite' })) ?? 'granted';
  return { 이름: 손잡이.name, 쓸수있음: 허락 === 'granted', 마지막: await 설정읽기<string>('backupSavedAt') };
};

/** 선생님이 백업 파일을 고릅니다(단추를 누른 그 순간에만 부를 수 있습니다). */
export const 백업파일고르기 = async () => {
  const 고르기 = (window as unknown as { showSaveFilePicker: (o: unknown) => Promise<파일손잡이> }).showSaveFilePicker;
  const 손잡이 = await 고르기({
    suggestedName: '수학놀이-학습기록-백업.json',
    types: [{ description: '학습 기록 백업', accept: { 'application/json': ['.json'] } }],
  });
  await 설정쓰기('backupFile', 손잡이);
  await 백업파일에쓰기();
};

/** 브라우저를 다시 연 뒤에는 쓰기 허락을 한 번 더 받아야 합니다(단추를 누른 그 순간에 부릅니다). */
export const 백업파일다시허락 = async () => {
  const 손잡이 = await 설정읽기<파일손잡이>('backupFile');
  if (!손잡이) return false;
  const 허락 = (await 손잡이.requestPermission?.({ mode: 'readwrite' })) ?? 'granted';
  if (허락 === 'granted') await 백업파일에쓰기();
  return 허락 === 'granted';
};

export const 백업파일끊기 = async () => {
  await 설정쓰기('backupFile', undefined);
  await 설정쓰기('backupSavedAt', undefined);
};

let 쓰는중: Promise<void> | null = null;
let 또써야함 = false;

/** 연결된 백업 파일이 있고 쓰기 허락이 있으면, 지금 기록 전체를 그 파일에 씁니다. 여러 번 겹치면 한 번 더 씁니다. */
export const 백업파일에쓰기 = async (): Promise<void> => {
  if (쓰는중) {
    또써야함 = true;
    return 쓰는중;
  }
  쓰는중 = (async () => {
    try {
      const 손잡이 = await 설정읽기<파일손잡이>('backupFile');
      if (!손잡이) return;
      const 허락 = (await 손잡이.queryPermission?.({ mode: 'readwrite' })) ?? 'granted';
      if (허락 !== 'granted') return;
      const 쓰개 = await 손잡이.createWritable();
      await 쓰개.write(JSON.stringify(백업만들기(await 기록모두읽기())));
      await 쓰개.close();
      await 설정쓰기('backupSavedAt', new Date().toISOString());
    } catch {
      // 파일이 옮겨졌거나 허락이 없어지면 다음 기회에 다시 씁니다. 기록 자체는 브라우저 저장소에 있습니다.
    }
  })();
  await 쓰는중;
  쓰는중 = null;
  if (또써야함) {
    또써야함 = false;
    await 백업파일에쓰기();
  }
};

/** 검사에서 메모리 저장소를 비울 때만 씁니다. */
export const 검사용비우기 = () => {
  메모리.records.clear();
  메모리.trash = [];
  메모리.settings.clear();
};
