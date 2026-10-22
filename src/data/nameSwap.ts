import type { Question } from '../types';

// ════════════════════════════════════════════════════════════════════
// 문제 속 주인공 이름 바꾸기
// ────────────────────────────────────────────────────────────────────
// 문제의 '민준, 서연' 자리에 아이가 고른 동물 친구나 우리 반 친구 이름을 넣습니다.
// 자기 캐릭터가 문제 속에서 사탕을 나누면, 아이는 남의 이야기가 아니라 제 이야기로
// 읽습니다. 선생님이 켜고 끕니다(기본은 끔).
//
// 이름 뒤의 조사는 새 이름의 받침에 맞게 다시 고릅니다 — '민준은'을 '토끼'로 바꾸면
// '토끼는'이 되어야 합니다. '민준이가'처럼 받침 뒤에 붙는 '이'는 새 이름에 맞게 뺍니다.
// 문제를 푸는 데 필요한 수와 말은 건드리지 않고 사람 이름만 바꿉니다.
// ════════════════════════════════════════════════════════════════════

export type 이름바꾸기방식 = 'off' | 'animals' | 'class';

/** 문항 생성기들이 쓰는 사람 이름입니다(expand/common.ts의 사람들과 여러 갈래의 이름들). */
export const 문제속이름들 = [
  '민준', '서연', '도윤', '하은', '지호', '수아', '예준', '민서', '하준', '민아', '서아', '재우', '민재', '기범',
  '성호', '연진', '준서', '은서', '동훈', '태은', '서윤', '건우', '지후', '선우', '경진', '유주', '민지', '서준',
  '하윤', '지아', '시우', '은지', '지우',
] as const;

/** 캐릭터 그림 글자를 부르는 이름입니다(App.tsx의 avatarChoices와 같은 동물). */
export const 동물이름: Record<string, string> = {
  '🦊': '여우', '🐰': '토끼', '🐶': '강아지', '🐱': '고양이', '🐼': '판다',
  '🐯': '호랑이', '🐸': '개구리', '🐧': '펭귄', '🦁': '사자', '🐢': '거북이',
};

const 받침 = (word: string) => {
  const last = word.charCodeAt(word.length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
};

// 이름 바로 뒤에 붙는 조사입니다. 긴 것부터 맞춥니다('이랑'이 '이'보다 먼저).
const 조사들 = ['입니다', '이에요', '예요', '이에게', '에게', '한테', '이랑', '랑', '이네', '네', '이는', '이가', '이를', '이의', '이도', '이와', '이만', '이보다', '보다', '처럼', '까지', '만', '도', '의', '는', '은', '가', '이', '를', '을', '와', '과'];

const 조사고르기 = (새이름: string, 조사: string): string => {
  const 있음 = 받침(새이름);
  // 받침 있는 이름 뒤에 붙는 '이'(민준이가)는 떼고 나머지 조사로 봅니다. '이' 홀로는 주격 조사입니다.
  if (조사 === '이에요' || 조사 === '예요') return 있음 ? '이에요' : '예요';
  const 본 = 조사 !== '이' && 조사.startsWith('이') && 조사.length > 1 ? 조사.slice(1) : 조사;
  switch (본) {
    case '는': case '은': return 있음 ? '은' : '는';
    case '가': case '이': return 있음 ? '이' : '가';
    case '를': case '을': return 있음 ? '을' : '를';
    case '와': case '과': return 있음 ? '과' : '와';
    case '랑': return 있음 ? '이랑' : '랑';
    default: return 본;
  }
};

const 이름틀 = new RegExp(`(^|[^가-힣])(${문제속이름들.join('|')})(${조사들.join('|')})?(?![가-힣])`, 'g');

/** 글에 나오는 이름을 처음 나온 차례대로 모읍니다. */
export const 나온이름들 = (글들: string[]): string[] => {
  const 차례: string[] = [];
  for (const 글 of 글들) for (const m of 글.matchAll(이름틀)) if (!차례.includes(m[2])) 차례.push(m[2]);
  return 차례;
};

export const 이름바꾼글 = (글: string, 바꿀: ReadonlyMap<string, string>): string =>
  글.replace(이름틀, (whole, 앞: string, 이름: string, 조사?: string) => {
    const 새 = 바꿀.get(이름);
    if (!새) return whole;
    return `${앞}${새}${조사 ? 조사고르기(새, 조사) : ''}`;
  });

/**
 * 문항의 사람 이름을 바꿉니다. 처음 나온 이름이 주인공(그 자리 아이의 캐릭터)이 되고,
 * 다음 이름들은 친구 목록에서 차례로 받습니다. 친구가 모자라면 원래 이름을 둡니다.
 */
export const 주인공바꾸기 = (question: Question, 주인공: string | null, 친구들: string[]): Question => {
  if (!주인공) return question;
  const 글들 = [question.prompt, ...question.choices, question.answer, question.support.studentHint, ...question.support.steps];
  const 이름 = 나온이름들(글들);
  if (이름.length === 0) return question;
  // 그림이나 따라 풀기 안에도 이름이 적혀 있으면 글과 그림이 어긋나므로 바꾸지 않습니다.
  const 그림글 = JSON.stringify([question.visual ?? null, question.choiceVisuals ?? null, question.walkthrough ?? null, question.manipulate ?? null]);
  if (이름.some((one) => 그림글.includes(one))) return question;
  const 남은친구 = 친구들.filter((one) => one !== 주인공 && !이름.includes(one));
  const 바꿀 = new Map<string, string>();
  이름.forEach((one, at) => {
    const 새 = at === 0 ? 주인공 : 남은친구[at - 1];
    if (새) 바꿀.set(one, 새);
  });
  const 바꿔 = (글: string) => 이름바꾼글(글, 바꿀);
  const choices = question.choices.map(바꿔);
  return {
    ...question,
    prompt: 바꿔(question.prompt),
    choices,
    answer: choices[question.answerIndex] ?? 바꿔(question.answer),
    explanation: 바꿔(question.explanation),
    support: {
      ...question.support,
      studentHint: 바꿔(question.support.studentHint),
      steps: question.support.steps.map(바꿔),
    },
  };
};

// ── 선생님 설정: 이 컴퓨터에 남깁니다 ─────────────────────────────────

const 방식열쇠 = 'nameSwapMode:v1';
const 명단열쇠 = 'nameSwapRoster:v1';

export const 방식읽기 = (): 이름바꾸기방식 => {
  try {
    const raw = window.localStorage.getItem(방식열쇠);
    return raw === 'animals' || raw === 'class' ? raw : 'off';
  } catch {
    return 'off';
  }
};

export const 방식쓰기 = (방식: 이름바꾸기방식) => {
  try {
    window.localStorage.setItem(방식열쇠, 방식);
  } catch {
    // 저장할 수 없으면 이번 수업에만 적용됩니다.
  }
};

/** 우리 반 명단입니다. 한 줄(또는 쉼표)에 한 명씩, 출석 번호 차례로 적습니다. */
export const 명단읽기 = (): string => {
  try {
    return window.localStorage.getItem(명단열쇠) ?? '';
  } catch {
    return '';
  }
};

export const 명단쓰기 = (명단: string) => {
  try {
    window.localStorage.setItem(명단열쇠, 명단);
  } catch {
    // 저장할 수 없으면 이번 수업에만 적용됩니다.
  }
};

/**
 * 명단 글을 출석 번호별 부를 이름으로 바꿉니다. '김민준'처럼 성까지 적으면 성을 떼고 '민준'으로 부릅니다
 * (두 글자 이름은 그대로, 세 글자 이상은 첫 글자를 성으로 봅니다).
 */
export const 명단풀기 = (명단: string): Record<number, string> => {
  const 줄 = 명단.split(/[\n,]/).map((one) => one.trim()).filter(Boolean);
  const 표: Record<number, string> = {};
  줄.forEach((one, at) => {
    const m = /^(\d+)\s*[.)번:]?\s*(.+)$/.exec(one);
    const 번호 = m ? Number(m[1]) : at + 1;
    const 이름 = (m ? m[2] : one).replace(/\s+/g, '');
    if (!/^[가-힣]{2,5}$/.test(이름)) return;
    표[번호] = 이름.length >= 3 ? 이름.slice(1) : 이름;
  });
  return 표;
};
