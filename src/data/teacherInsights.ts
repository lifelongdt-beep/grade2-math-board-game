// ════════════════════════════════════════════════════════════════════
// 교사용 학습 기록장의 계산
// ────────────────────────────────────────────────────────────────────
// 학습 기록장(learningLog.ts)에 쌓인 기록을 거르고, 묶어 세고, 지도할 점을 찾습니다.
// 화면(TeacherBook.tsx)은 여기 결과를 그리기만 합니다. 계산을 따로 두어 검사할 수 있게 합니다.
// ════════════════════════════════════════════════════════════════════

import type { ConceptTag, Difficulty, Semester } from '../types';
import type { 학습기록 } from './learningLog';
import { 갈래이름, 지도법들, type 지도법 } from './teachingMethods';

// ── 거르기 ─────────────────────────────────────────────────────────────

/** 비어 있는 칸은 '모두'입니다. 날짜는 YYYY-MM-DD이고 양 끝을 포함합니다. */
export interface 거름 {
  nos?: number[];
  grades?: number[];
  semesters?: Semester[];
  /** 단원 열쇠(단원열쇠 함수) 목록입니다. */
  units?: string[];
  lessonIds?: string[];
  from?: string;
  to?: string;
}

export const 단원열쇠 = (one: Pick<학습기록, 'semester' | 'unitNo'>) => `${one.semester}|${one.unitNo}`;

const 비었나 = (list?: unknown[]) => !list || list.length === 0;

export const 맞나 = (one: 학습기록, f: 거름) =>
  (비었나(f.nos) || f.nos!.includes(one.no)) &&
  (비었나(f.grades) || f.grades!.includes(one.grade)) &&
  (비었나(f.semesters) || f.semesters!.includes(one.semester)) &&
  (비었나(f.units) || f.units!.includes(단원열쇠(one))) &&
  (비었나(f.lessonIds) || f.lessonIds!.includes(one.lessonId)) &&
  (!f.from || one.date >= f.from) &&
  (!f.to || one.date <= f.to);

export const 거르기 = (records: 학습기록[], f: 거름) => records.filter((one) => 맞나(one, f));

/** 아무 조건도 고르지 않았는지입니다. 지울 때 '모두 지우기'를 실수로 하지 않게 따로 묻습니다. */
export const 조건없음 = (f: 거름) =>
  비었나(f.nos) && 비었나(f.grades) && 비었나(f.semesters) && 비었나(f.units) && 비었나(f.lessonIds) && !f.from && !f.to;

/** 거름 조건을 사람이 읽는 글로 씁니다(지우기 확인 창, PDF 머리글). */
export const 거름글 = (
  f: 거름,
  이름: (no: number) => string = (no) => `${no}번`,
  표?: { 단원?: (key: string) => string | undefined; 차시?: (id: string) => string | undefined },
) => {
  const 조각: string[] = [];
  if (!비었나(f.nos)) 조각.push(`학생 ${f.nos!.map(이름).join(', ')}`);
  if (!비었나(f.grades)) 조각.push(`${f.grades!.join('·')}학년`);
  if (!비었나(f.semesters)) 조각.push(`${f.semesters!.map((s) => `${s.replace('-', '학년 ')}학기`).join(', ')}`);
  if (!비었나(f.units)) 조각.push(f.units!.map((key) => 표?.단원?.(key) ?? '').every(Boolean) ? f.units!.map((key) => 표!.단원!(key)!).join(', ') : `단원 ${f.units!.length}개`);
  if (!비었나(f.lessonIds)) 조각.push(f.lessonIds!.map((id) => 표?.차시?.(id) ?? '').every(Boolean) ? f.lessonIds!.map((id) => 표!.차시!(id)!).join(', ') : `차시 ${f.lessonIds!.length}개`);
  if (f.from || f.to) 조각.push(`${f.from ?? '처음'} ~ ${f.to ?? '오늘'}`);
  return 조각.length ? 조각.join(' · ') : '모든 기록';
};

// ── 세기 ──────────────────────────────────────────────────────────────

export interface 묶음줄 {
  key: string;
  label: string;
  문제: number;
  정답: number;
  정답률: number;
  힌트율: number;
  평균초: number;
  학생수: number;
}

const 퍼센트 = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));
const 평균 = (values: number[]) => (values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length);

export const 묶기 = (records: 학습기록[], keyOf: (one: 학습기록) => string, labelOf: (one: 학습기록) => string): 묶음줄[] => {
  const 모음 = new Map<string, 학습기록[]>();
  for (const one of records) {
    const key = keyOf(one);
    모음.set(key, [...(모음.get(key) ?? []), one]);
  }
  return [...모음.entries()].map(([key, list]) => {
    const 정답 = list.filter((one) => one.correct).length;
    return {
      key,
      label: labelOf(list[0]),
      문제: list.length,
      정답,
      정답률: 퍼센트(정답, list.length),
      힌트율: 퍼센트(list.filter((one) => one.hintUsed).length, list.length),
      평균초: Math.round(평균(list.map((one) => one.responseMs)) / 100) / 10,
      학생수: new Set(list.map((one) => one.no)).size,
    };
  });
};

export const 단원이름 = (one: Pick<학습기록, 'semester' | 'unitNo' | 'unitTitle'>) =>
  one.unitNo > 0 ? `${one.semester} ${one.unitNo}. ${one.unitTitle}` : `${one.semester} ${one.unitTitle}`;
export const 차시이름 = (one: Pick<학습기록, 'lessonNo' | 'lessonTitle'>) =>
  one.lessonNo > 0 ? `${one.lessonNo}차시 ${one.lessonTitle}` : one.lessonTitle;

const 학기차례 = (s: string) => {
  const [g, h] = s.split('-').map(Number);
  return g * 10 + h;
};

export const 학생별 = (records: 학습기록[], 이름: (no: number) => string) =>
  묶기(records, (one) => String(one.no), (one) => 이름(one.no)).sort((a, b) => Number(a.key) - Number(b.key));

export const 단원별 = (records: 학습기록[]) =>
  묶기(records, 단원열쇠, 단원이름).sort((a, b) => {
    const [sa, ua] = a.key.split('|');
    const [sb, ub] = b.key.split('|');
    return 학기차례(sa) - 학기차례(sb) || Number(ua) - Number(ub);
  });

export const 차시별 = (records: 학습기록[]) => {
  const 차례 = new Map(records.map((one) => [one.lessonId, [학기차례(one.semester), one.unitNo, one.lessonNo] as const]));
  return 묶기(records, (one) => one.lessonId, (one) => `${단원이름(one)} · ${차시이름(one)}`).sort((a, b) => {
    const x = 차례.get(a.key)!;
    const y = 차례.get(b.key)!;
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });
};

export const 갈래별 = (records: 학습기록[]) =>
  묶기(records, (one) => one.type, (one) => 갈래이름(one.type)).sort((a, b) => a.정답률 - b.정답률);

const 수준차례: Difficulty[] = ['하', '중', '상'];
export const 수준별 = (records: 학습기록[]) =>
  묶기(records, (one) => one.difficulty, (one) => one.difficulty).sort((a, b) => 수준차례.indexOf(a.key as Difficulty) - 수준차례.indexOf(b.key as Difficulty));

/** 날짜마다 푼 문제 수와 정답률입니다(오래된 날부터). */
export const 날짜별 = (records: 학습기록[]) =>
  묶기(records, (one) => one.date, (one) => one.date).sort((a, b) => a.key.localeCompare(b.key));

export interface 요약값 {
  문제: number;
  정답: number;
  정답률: number;
  학생수: number;
  날수: number;
  차시수: number;
  힌트율: number;
  평균초: number;
  /** 틀린 뒤 다시 나온 문제를 맞힌 비율입니다. 설명을 보고 스스로 고쳤는지 봅니다. */
  다시맞힘률: number | null;
  첫날?: string;
  끝날?: string;
}

export const 요약 = (records: 학습기록[]): 요약값 => {
  const 정답 = records.filter((one) => one.correct).length;
  const 다시 = records.filter((one) => one.attempts > 1);
  const 날들 = [...new Set(records.map((one) => one.date))].sort();
  return {
    문제: records.length,
    정답,
    정답률: 퍼센트(정답, records.length),
    학생수: new Set(records.map((one) => one.no)).size,
    날수: 날들.length,
    차시수: new Set(records.map((one) => one.lessonId)).size,
    힌트율: 퍼센트(records.filter((one) => one.hintUsed).length, records.length),
    평균초: Math.round(평균(records.map((one) => one.responseMs)) / 100) / 10,
    다시맞힘률: 다시.length ? 퍼센트(다시.filter((one) => one.correct).length, 다시.length) : null,
    첫날: 날들[0],
    끝날: 날들.at(-1),
  };
};

/** 학생 × 단원 정답률 표입니다(열지도). 칸이 없으면 그 단원을 풀지 않은 것입니다. */
export const 학생단원표 = (records: 학습기록[]) => {
  const 단원들 = 단원별(records);
  const 학생들 = [...new Set(records.map((one) => one.no))].sort((a, b) => a - b);
  const 칸 = new Map<string, { 문제: number; 정답률: number }>();
  for (const 줄 of 묶기(records, (one) => `${one.no}#${단원열쇠(one)}`, () => '')) {
    칸.set(줄.key, { 문제: 줄.문제, 정답률: 줄.정답률 });
  }
  return { 단원들, 학생들, 칸: (no: number, unit: string) => 칸.get(`${no}#${unit}`) };
};

export interface 오개념줄 {
  내용: string;
  횟수: number;
  학생들: number[];
  갈래: ConceptTag;
  도움말: string;
  예시: 학습기록;
}

/** 틀린 문제에서 되풀이되는 오개념입니다. 같은 오개념을 여러 번, 여러 학생이 보일수록 위에 옵니다. */
export const 오개념순위 = (records: 학습기록[]): 오개념줄[] => {
  const 모음 = new Map<string, 학습기록[]>();
  for (const one of records) {
    if (one.correct || !one.misconception?.trim()) continue;
    모음.set(one.misconception, [...(모음.get(one.misconception) ?? []), one]);
  }
  return [...모음.entries()]
    .map(([내용, list]) => ({
      내용,
      횟수: list.length,
      학생들: [...new Set(list.map((one) => one.no))].sort((a, b) => a - b),
      갈래: list[0].type,
      도움말: list[0].support?.misconceptionTip ?? '',
      예시: list.at(-1)!,
    }))
    .sort((a, b) => b.학생들.length - a.학생들.length || b.횟수 - a.횟수);
};

// ── 오답 모음(PDF) ─────────────────────────────────────────────────────

export interface 오답고르기 {
  /** 틀린 뒤 같은 문제를 다시 맞혔으면 뺍니다(아직 해결 못 한 문제만). */
  해결한것빼기: boolean;
  /** 같은 문제를 여러 번 틀렸으면 한 번만 넣습니다. */
  같은문제한번: boolean;
  /** 학생마다 최대 문항 수입니다(0이면 제한 없음). 최근에 틀린 것부터 고릅니다. */
  최대: number;
}

/** 학생 한 명의 오답 모음입니다. records는 이미 거른(범위를 고른) 기록입니다. */
export const 오답모음 = (records: 학습기록[], no: number, o: 오답고르기) => {
  const 내것 = records.filter((one) => one.no === no).sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
  const 마지막맞힘 = new Map<string, string>();
  for (const one of 내것) if (one.correct) 마지막맞힘.set(one.questionId, one.answeredAt);
  let 틀린 = 내것.filter((one) => !one.correct);
  if (o.해결한것빼기) 틀린 = 틀린.filter((one) => !((마지막맞힘.get(one.questionId) ?? '') > one.answeredAt));
  if (o.같은문제한번) {
    const 본 = new Set<string>();
    틀린 = [...틀린].reverse().filter((one) => (본.has(one.questionId) ? false : (본.add(one.questionId), true))).reverse();
  }
  if (o.최대 > 0 && 틀린.length > o.최대) 틀린 = 틀린.slice(-o.최대);
  return 틀린;
};

// ── 지도 도움 ──────────────────────────────────────────────────────────

export type 급함 = '먼저' | '이번 주' | '참고';

export interface 지도항목 {
  급함: 급함;
  제목: string;
  /** 왜 이렇게 보는지, 기록에서 나온 근거입니다. */
  근거: string;
  /** 바로 해 볼 수 있는 구체적인 지도 방법입니다. */
  방법: string[];
  발문?: string[];
  교구?: string;
  활동?: string;
  확인?: string;
  /** 해당 학생들(출석번호)입니다. */
  대상?: number[];
  /** 함께 볼 예시 문제입니다. */
  예시?: 학습기록;
}

const 급함차례: Record<급함, number> = { 먼저: 0, '이번 주': 1, 참고: 2 };

const 갈래지도 = (tag: ConceptTag): Partial<지도항목> => {
  const 법: 지도법 | undefined = 지도법들[tag];
  if (!법) return {};
  return { 발문: 법.발문, 교구: 법.교구, 활동: 법.활동, 확인: 법.확인 };
};

const 많이틀린문제 = (list: 학습기록[]) => {
  const 셈 = new Map<string, { 틀림: number; one: 학습기록 }>();
  for (const one of list) {
    if (one.correct) continue;
    const 앞 = 셈.get(one.questionId);
    셈.set(one.questionId, { 틀림: (앞?.틀림 ?? 0) + 1, one });
  }
  return [...셈.values()].sort((a, b) => b.틀림 - a.틀림)[0]?.one;
};

/** 다시 가르칠 때의 순서입니다. 그 차시 문제의 풀이 단계가 있으면 그것을 앞에 둡니다. */
const 다시가르치기 = (tag: ConceptTag, 예시?: 학습기록) => {
  const 방법 = [...(지도법들[tag]?.순서 ?? [])];
  if (예시?.support?.coreConcept) 방법.unshift(`핵심 개념을 먼저 짚어 줍니다: ${예시.support.coreConcept}`);
  if (예시?.support?.misconceptionTip) 방법.push(`자주 하는 실수 바로잡기: ${예시.support.misconceptionTip}`);
  return 방법;
};

export interface 모둠 {
  보충: number[];
  연습: number[];
  심화: number[];
  자료부족: number[];
}

/** 정답률로 세 모둠을 나눕니다. 다섯 문제보다 적게 푼 학생은 아직 나누지 않습니다. */
export const 모둠나누기 = (records: 학습기록[]): 모둠 => {
  const 결과: 모둠 = { 보충: [], 연습: [], 심화: [], 자료부족: [] };
  for (const 줄 of 학생별(records, String)) {
    const no = Number(줄.key);
    if (줄.문제 < 5) 결과.자료부족.push(no);
    else if (줄.정답률 < 60) 결과.보충.push(no);
    else if (줄.정답률 < 85) 결과.연습.push(no);
    else 결과.심화.push(no);
  }
  return 결과;
};

const 날차이 = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** 반 전체를 보고 찾은 지도할 점입니다. */
export const 반지도 = (records: 학습기록[], 이름: (no: number) => string = (no) => `${no}번`): 지도항목[] => {
  const 항목: 지도항목[] = [];
  // 1) 반 전체가 어려워한 차시: 다시 가르치기(가장 낮은 다섯 차시까지)
  for (const 줄 of 차시별(records).filter((r) => r.문제 >= 8 && r.정답률 < 60).sort((a, b) => a.정답률 - b.정답률).slice(0, 5)) {
    const list = records.filter((one) => one.lessonId === 줄.key);
    const 예시 = 많이틀린문제(list);
    const tag = 예시?.type ?? list[0].type;
    const 낮은학생 = 학생별(list, String).filter((s) => s.문제 >= 3 && s.정답률 < 60).map((s) => Number(s.key));
    항목.push({
      급함: 줄.정답률 < 45 ? '먼저' : '이번 주',
      제목: `다시 가르치기: ${줄.label}`,
      근거: `반 전체 정답률 ${줄.정답률}% (${줄.문제}문제, ${줄.학생수}명). 정답률 60% 아래 학생 ${낮은학생.length}명.`,
      방법: 다시가르치기(tag, 예시),
      ...갈래지도(tag),
      대상: 낮은학생,
      예시,
    });
  }
  // 2) 여러 학생이 같은 오개념(가장 널리 퍼진 넷까지)
  for (const 줄 of 오개념순위(records).filter((r) => r.학생들.length >= 3).slice(0, 4)) {
    항목.push({
      급함: 줄.학생들.length >= 5 ? '먼저' : '이번 주',
      제목: `여러 학생의 같은 실수: ${줄.내용}`,
      근거: `${줄.학생들.length}명이 모두 ${줄.횟수}번 같은 오개념으로 틀렸습니다.`,
      방법: [
        '수업 첫 5분에 이 실수가 담긴 "친구의 풀이"를 보여 주고 어디가 틀렸는지 함께 찾게 합니다(누구의 풀이인지는 밝히지 않습니다).',
        ...(줄.도움말 ? [`바로잡는 말: ${줄.도움말}`] : []),
        ...다시가르치기(줄.갈래).slice(0, 2),
        '같은 결의 문제를 2~3개 더 풀게 하고, 맞힌 뒤 "왜 그렇게 풀었는지" 한 문장으로 쓰게 합니다.',
      ],
      ...갈래지도(줄.갈래),
      대상: 줄.학생들,
      예시: 줄.예시,
    });
  }
  // 3) 힌트에 많이 기대는 반
  const 전체 = 요약(records);
  if (전체.문제 >= 30 && 전체.힌트율 >= 40) {
    항목.push({
      급함: '이번 주',
      제목: '힌트를 먼저 여는 습관',
      근거: `반 전체 힌트 사용률 ${전체.힌트율}%. 문제를 읽기 전에 힌트부터 여는 학생이 많습니다.`,
      방법: [
        '"30초 먼저 생각하기" 약속: 문제를 소리 내지 않고 두 번 읽고, 구하는 것에 밑줄을 그은 뒤에만 힌트를 엽니다.',
        '힌트를 연 문제는 풀고 나서 "힌트의 어느 말이 도움이 되었는지" 짝에게 말하게 합니다.',
        '힌트 없이 3문제 연속 맞히면 개념 카드를 얻는 놀이 규칙을 상기시켜 동기를 줍니다.',
      ],
    });
  }
  // 4) 틀린 뒤 다시 푼 문제도 못 맞힘
  if (전체.다시맞힘률 !== null && records.filter((one) => one.attempts > 1).length >= 10 && 전체.다시맞힘률 < 50) {
    항목.push({
      급함: '이번 주',
      제목: '틀린 뒤 해설을 읽어도 다시 틀림',
      근거: `되돌아온 문제의 정답률이 ${전체.다시맞힘률}%입니다. 해설만으로는 이해가 되지 않고 있습니다.`,
      방법: [
        '오답 해설 화면에서 바로 넘어가지 않게, 해설의 핵심 한 줄을 공책에 옮겨 쓰게 합니다.',
        '오답 PDF(이 페이지의 "오답 PDF")를 출력해 다음 수업 시작 때 2문제씩 다시 풀게 합니다.',
        '교사가 한 문제를 소리 내어 생각하며 푸는 시범(think-aloud)을 보이고, 비슷한 문제를 학생이 같은 방식으로 말하며 풀게 합니다.',
      ],
    });
  }
  // 5) 모둠 편성
  const 나눔 = 모둠나누기(records);
  if (나눔.보충.length + 나눔.연습.length + 나눔.심화.length >= 4) {
    항목.push({
      급함: '참고',
      제목: '수준별 모둠 편성 제안',
      근거: `보충 ${나눔.보충.length}명 · 연습 ${나눔.연습.length}명 · 심화 ${나눔.심화.length}명 (정답률 60%·85% 기준)`,
      방법: [
        `보충 모둠(${나눔.보충.map(이름).join(', ') || '없음'}): 교사와 함께 구체물로 다시 해 보기, 하 수준 문제로 성공 경험 쌓기.`,
        `연습 모둠(${나눔.연습.map(이름).join(', ') || '없음'}): 짝과 번갈아 문제 내고 풀기, 틀린 문제 다시 풀기.`,
        `심화 모둠(${나눔.심화.map(이름).join(', ') || '없음'}): 상 수준·도전 카드 문제, 친구에게 풀이 설명하는 도우미 역할.`,
        '모둠은 차시마다 바뀔 수 있습니다. 한 번 정한 모둠으로 학기 내내 묶지 않습니다.',
      ],
    });
  }
  // 6) 한동안 학습 기록이 없는 학생
  const 끝 = 전체.끝날;
  if (끝) {
    const 쉰 = 학생별(records, String)
      .map((s) => ({ no: Number(s.key), 마지막: records.filter((one) => one.no === Number(s.key)).map((one) => one.date).sort().at(-1)! }))
      .filter((s) => 날차이(s.마지막, 끝) >= 7);
    if (쉰.length) {
      항목.push({
        급함: '참고',
        제목: '한동안 기록이 없는 학생',
        근거: `${쉰.map((s) => `${이름(s.no)}(${s.마지막} 마지막)`).join(', ')}`,
        방법: ['결석·전학 여부를 확인하고, 빠진 차시를 보충 시간에 짧게 풀게 합니다.', '다음 수업에서 이 학생들이 먼저 자리에 앉아 시작하도록 순서를 정해 줍니다.'],
        대상: 쉰.map((s) => s.no),
      });
    }
  }
  return 항목.sort((a, b) => 급함차례[a.급함] - 급함차례[b.급함]);
};

/** 한 학생을 보고 찾은 지도할 점입니다. records는 그 학생의 기록이 아니라 거른 전체 기록입니다(반 평균과 견주려고). */
export const 학생지도 = (records: 학습기록[], no: number): 지도항목[] => {
  const 내것 = records.filter((one) => one.no === no);
  if (내것.length === 0) return [];
  const 항목: 지도항목[] = [];
  const 나 = 요약(내것);
  const 반 = 요약(records);

  // 1) 이 학생이 어려워한 차시(가장 낮은 셋까지)
  for (const 줄 of 차시별(내것).filter((r) => r.문제 >= 5 && r.정답률 < 60).sort((a, b) => a.정답률 - b.정답률).slice(0, 3)) {
    const list = 내것.filter((one) => one.lessonId === 줄.key);
    const 예시 = 많이틀린문제(list);
    const tag = 예시?.type ?? list[0].type;
    항목.push({
      급함: 줄.정답률 < 40 ? '먼저' : '이번 주',
      제목: `보충 지도: ${줄.label}`,
      근거: `이 차시 정답률 ${줄.정답률}% (${줄.문제}문제).`,
      방법: 다시가르치기(tag, 예시),
      ...갈래지도(tag),
      예시,
    });
  }
  // 2) 되풀이되는 오개념(가장 잦은 셋까지)
  for (const 줄 of 오개념순위(내것).filter((r) => r.횟수 >= 2).sort((a, b) => b.횟수 - a.횟수).slice(0, 3)) {
    항목.push({
      급함: 줄.횟수 >= 3 ? '먼저' : '이번 주',
      제목: `되풀이되는 실수: ${줄.내용}`,
      근거: `같은 오개념으로 ${줄.횟수}번 틀렸습니다.`,
      방법: [
        ...(줄.도움말 ? [`바로잡는 말: ${줄.도움말}`] : []),
        '틀린 문제를 함께 보며 "어떻게 생각해서 이 답을 골랐는지" 먼저 들어 봅니다. 생각의 어느 단계에서 어긋났는지 찾는 것이 먼저입니다.',
        ...다시가르치기(줄.갈래).slice(0, 2),
      ],
      ...갈래지도(줄.갈래),
      예시: 줄.예시,
    });
  }
  // 3) 서둘러 틀리는 습관
  const 틀린 = 내것.filter((one) => !one.correct);
  const 빠른오답 = 틀린.filter((one) => one.responseMs > 0 && one.responseMs < 4000);
  if (틀린.length >= 4 && 빠른오답.length / 틀린.length >= 0.5) {
    항목.push({
      급함: '이번 주',
      제목: '문제를 끝까지 읽지 않고 서둘러 답함',
      근거: `틀린 ${틀린.length}문제 중 ${빠른오답.length}문제를 4초 안에 골랐습니다.`,
      방법: [
        '"읽기 3단계" 약속: ① 끝까지 읽기 ② 구하는 것에 밑줄 ③ 답을 고르기 전에 한 번 더 확인.',
        '보기를 고르기 전에 답을 먼저 소리 내어 말하게 하고, 그다음 보기에서 찾게 합니다.',
        '맞힌 수보다 "다시 확인하고 고친 수"를 칭찬해 속도보다 정확함에 상을 줍니다.',
      ],
    });
  }
  // 4) 힌트 의존
  if (내것.length >= 6 && 나.힌트율 >= 50) {
    항목.push({
      급함: '이번 주',
      제목: '힌트에 많이 기댐',
      근거: `힌트 사용률 ${나.힌트율}% (반 평균 ${반.힌트율}%).`,
      방법: [
        '힌트를 열기 전에 "아는 것/구하는 것"을 한 줄씩 말하게 합니다. 말할 수 있으면 힌트 없이 시작하게 합니다.',
        '힌트를 연 문제는 비슷한 문제를 하나 더 힌트 없이 풀게 하여 스스로 할 수 있음을 확인합니다.',
        '오늘의 미션 중 "힌트 없이 3연속"을 목표로 정해 주고 성공하면 크게 칭찬합니다.',
      ],
    });
  }
  // 5) 정확하지만 느림
  if (나.문제 >= 8 && 나.정답률 >= 80 && 반.평균초 > 0 && 나.평균초 >= 반.평균초 * 1.8) {
    항목.push({
      급함: '참고',
      제목: '정확하지만 시간이 오래 걸림',
      근거: `정답률 ${나.정답률}%, 한 문제 평균 ${나.평균초}초 (반 평균 ${반.평균초}초).`,
      방법: [
        '개념은 알고 있으므로 계산 유창성을 기르는 짧은 연습(하루 3분 셈 카드)을 줍니다.',
        '세는 방법(하나씩 세기)을 쓰고 있는지 관찰하고, 묶어 세기·외운 셈(곱셈구구 등)으로 옮겨 가게 돕습니다.',
        '시간 압박을 주지 말고, 지난번보다 빨라진 것을 알려 주어 "지난번의 나"와 비교하게 합니다.',
      ],
    });
  }
  // 6) 잘하고 있음 → 심화
  const 상 = 내것.filter((one) => one.difficulty === '상');
  if (내것.length >= 10 && 나.정답률 >= 85 && 상.length >= 3) {
    항목.push({
      급함: '참고',
      제목: '심화 과제가 필요함',
      근거: `정답률 ${나.정답률}%, 상 수준 문제 ${상.length}개를 풀었습니다(상 정답률 ${퍼센트(상.filter((one) => one.correct).length, 상.length)}%).`,
      방법: [
        '도전 카드를 적극적으로 받게 하고, 상 수준 문제를 "왜 그런지" 설명하는 글로 쓰게 합니다.',
        '모둠에서 친구 도우미 역할을 맡겨 풀이를 설명하게 합니다(설명하며 더 깊이 이해합니다).',
        '문제를 직접 만들어 보는 활동(숫자를 바꾼 비슷한 문제 만들기)을 줍니다.',
      ],
    });
  }
  // 7) 다시 나온 문제를 못 고침
  const 다시 = 내것.filter((one) => one.attempts > 1);
  if (다시.length >= 3 && 퍼센트(다시.filter((one) => one.correct).length, 다시.length) < 50) {
    항목.push({
      급함: '먼저',
      제목: '해설을 보고도 같은 문제를 다시 틀림',
      근거: `다시 나온 문제 ${다시.length}개 중 ${다시.filter((one) => one.correct).length}개만 맞혔습니다.`,
      방법: [
        '해설 화면을 함께 보며 학생이 해설을 자기 말로 다시 말하게 합니다. 말하지 못하면 그 부분부터 구체물로 다시 보여 줍니다.',
        '오답 PDF를 출력해 1:1로 두 문제만 같이 풀고, 다음 날 같은 문제를 혼자 풀게 합니다.',
      ],
    });
  }
  if (항목.length === 0 && 내것.length >= 5) {
    항목.push({
      급함: '참고',
      제목: '고르게 잘하고 있음',
      근거: `정답률 ${나.정답률}%, ${나.문제}문제.`,
      방법: ['지금처럼 꾸준히 풀도록 격려하고, 틀린 문제를 다시 풀어 맞힌 경험을 칭찬합니다.'],
    });
  }
  return 항목.sort((a, b) => 급함차례[a.급함] - 급함차례[b.급함]);
};

/** 기록을 표 파일(CSV)로 씁니다. 엑셀에서 한글이 깨지지 않게 앞에 BOM을 붙입니다. */
export const csv만들기 = (records: 학습기록[], 이름: (no: number) => string = (no) => `${no}번`) => {
  const 칸 = (value: unknown) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const 머리 = ['날짜', '시각', '번호', '이름', '학년', '학기', '단원', '차시', '차시 이름', '수준', '갈래', '문제', '고른 답', '정답', '결과', '힌트', '다시 푼 문제', '걸린 시간(초)', '오개념'];
  const 줄들 = records.map((one) => [
    one.date,
    new Date(one.answeredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    one.no,
    이름(one.no),
    one.grade,
    one.semester,
    `${one.unitNo}. ${one.unitTitle}`,
    one.lessonNo,
    one.lessonTitle,
    one.difficulty,
    갈래이름(one.type),
    one.prompt,
    one.chosen,
    one.answer,
    one.correct ? '정답' : '오답',
    one.hintUsed ? '사용' : '',
    one.attempts > 1 ? '예' : '',
    Math.round(one.responseMs / 100) / 10,
    one.correct ? '' : one.misconception,
  ]);
  return `﻿${[머리, ...줄들].map((row) => row.map(칸).join(',')).join('\n')}`;
};
