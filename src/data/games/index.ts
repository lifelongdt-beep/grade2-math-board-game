import type { ConceptTag, Difficulty, Lesson, Question, Unit } from '../../types';
import { 도입차시인가 } from '../introReview';
import { generateQuestions, isCastleLesson } from '../questionFactory';
import { 단순문항, 단순문항있나 } from './quick';

// ════════════════════════════════════════════════════════════════════
// 단원 맨 앞의 놀이 차시
// ────────────────────────────────────────────────────────────────────
// '구구단, 몬스터를 막아라!'처럼, 모든 학년 모든 단원의 맨 앞에 그 단원의
// 가장 핵심 개념을 빠르게 떠올리는 놀이를 둡니다. 놀이 방법은 여덟 가지이고
// (내려오는 몬스터 막기, 떠오르는 풍선, 두더지, 로켓, 달리기, 보물 상자,
// 3D 우주 터널, 3D 주사위), 단원마다 돌아가며 붙여 학년이 바뀌어도 같은
// 놀이만 되풀이되지 않게 합니다.
//
// 문제는 단원마다 새로 짓습니다(quick.ts) — 그 단원의 핵심 개념을 묻는 한 줄
// 질문이나 한 번에 끝나는 단순 계산입니다. 차시 문항을 다시 내면 이미 풀어 본
// 긴 문제라 지겹기 때문입니다. 단순 문항이 없는 단원만 그 단원 차시들의 하·중
// 문항 가운데 짧고 조작이 없는 것을 골라 씁니다.
//
// 놀이 차시는 화면(App)에서만 단원 앞에 붙습니다. 교과 차시 자료(curriculum*.ts)는
// 그대로 두어, 차시 번호로 짝지어 둔 다른 표들이 어긋나지 않습니다.
// ════════════════════════════════════════════════════════════════════

export type GameMode = 'monster' | 'balloon' | 'mole' | 'rocket' | 'race' | 'treasure' | 'tunnel3d' | 'dice3d';

export interface GameInfo {
  mode: GameMode;
  /** 놀이 이름 뒤쪽입니다('두더지를 잡아라!'). */
  title: string;
  /** 놀이 방법을 한 줄로 알려 줍니다. */
  how: string;
  /** 틀리거나 놓쳤을 때 도움말 칸의 제목입니다. */
  missTitle: string;
}

export const 놀이들: Record<GameMode, GameInfo> = {
  monster: { mode: 'monster', title: '몬스터를 막아라!', how: '몬스터가 땅에 닿기 전에 답을 골라 막아요', missTitle: '몬스터가 성에 닿았어요!' },
  balloon: { mode: 'balloon', title: '풍선을 터뜨려라!', how: '풍선이 하늘 끝에 닿기 전에 답을 골라 터뜨려요', missTitle: '풍선이 날아가 버렸어요!' },
  mole: { mode: 'mole', title: '두더지를 잡아라!', how: '두더지가 숨기 전에 답을 골라 뿅 잡아요', missTitle: '두더지가 숨어 버렸어요!' },
  rocket: { mode: 'rocket', title: '로켓을 쏘아 올려라!', how: '연료가 다 떨어지기 전에 맞히면 로켓이 한 칸씩 올라가요', missTitle: '연료가 새어 버렸어요!' },
  race: { mode: 'race', title: '달리기 시합!', how: '맞힐 때마다 내 캐릭터가 달려 나가요. 거북이보다 먼저 결승선에!', missTitle: '거북이가 한 걸음 앞섰어요!' },
  treasure: { mode: 'treasure', title: '보물 상자를 열어라!', how: '심지가 다 타기 전에 맞히면 보석이 나와요', missTitle: '상자가 잠겨 버렸어요!' },
  tunnel3d: { mode: 'tunnel3d', title: '3D 우주 터널을 지나라!', how: '우주선 쪽으로 날아오는 문제를 부딪히기 전에 맞혀요', missTitle: '운석에 부딪혔어요!' },
  dice3d: { mode: 'dice3d', title: '3D 주사위를 굴려라!', how: '주사위가 멈추기 전에 맞히면 주사위 눈만큼 점수가 쌓여요', missTitle: '주사위가 멈춰 버렸어요!' },
};

const 돌림차례: GameMode[] = ['monster', 'balloon', 'tunnel3d', 'mole', 'rocket', 'dice3d', 'race', 'treasure'];

const 놀이꼬리 = '-game';

export const 놀이차시인가 = (lesson: Pick<Lesson, 'id'>) => lesson.id.endsWith(놀이꼬리);

const 놀이표 = new Map<string, { info: GameInfo; sources: Lesson[] }>();

/** 놀이 차시면 그 놀이의 정보를, 아니면 null을 줍니다. */
export const 놀이찾기 = (lesson: Pick<Lesson, 'id'>): GameInfo | null => 놀이표.get(lesson.id)?.info ?? null;

/**
 * 단원마다 맨 앞에 놀이 차시를 붙입니다. 이미 놀이(성 지키기)로 시작하는 단원은 그대로 둡니다.
 * 놀이 방법은 학기·단원 차례대로 돌려 가며 붙입니다.
 */
export const 놀이차시붙이기 = (units: Unit[]): Unit[] => {
  let 차례 = 0;
  return units.map((unit) => {
    const 차시들 = unit.lessons.filter((one) => !도입차시인가(one) && !isCastleLesson(one.title));
    if (차시들.length === 0 || isCastleLesson(unit.lessons[0]?.title ?? '')) return unit;
    const info = 놀이들[돌림차례[차례 % 돌림차례.length]];
    차례 += 1;
    const 끝차시 = 차시들[차시들.length - 1];
    const 태그 = [...new Set(차시들.flatMap((one) => one.tags))] as ConceptTag[];
    const game: Lesson = {
      ...끝차시,
      id: `${unit.semester}-u${unit.unitNo}${놀이꼬리}`,
      lessonNo: 0,
      title: `${unit.title}, ${info.title}`,
      objective: `${unit.title} 단원의 핵심 개념을 놀이로 빠르게 떠올린다.`,
      achievement: 차시들.map((one) => one.achievement).join(' / '),
      tags: 태그,
      textbookFocus: `${unit.title} 단원 전체의 핵심 개념을 놀이로 확인한다.`,
      workbookFocus: info.how,
    };
    놀이표.set(game.id, { info, sources: 차시들 });
    return { ...unit, lessons: [game, ...unit.lessons] };
  });
};

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

/** 한 판에 내는 놀이 문항 수입니다. 구구단 몬스터처럼 넉넉히 두어 같은 문제가 금방 되풀이되지 않게 합니다. */
export const 놀이문항수 = 60;

/**
 * 놀이 차시의 문항입니다. 하는 그 단원의 하 문항, 중·상은 하와 중 문항을 섞어 씁니다
 * (놀이는 쉬워야 신납니다. 상은 문항이 아니라 시간이 짧아져 어려워집니다).
 * 그 단원에서 가장 많이 나오는 갈래(핵심 개념)의 문항을 앞세웁니다.
 */
export const 놀이문항 = (game: Lesson, difficulty: Difficulty, seed: number): Question[] => {
  const 자료 = 놀이표.get(game.id);
  if (!자료) return [];
  if (단순문항있나(game)) return 단순문항(game, difficulty, seed, 놀이문항수);
  const 수준들: Difficulty[] = difficulty === '하' ? ['하'] : ['하', '중'];
  const 모두 = 자료.sources.flatMap((one) => 수준들.flatMap((lv) => {
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

/** 놀이 시간(초)입니다. 문항이 구구단보다 길어 넉넉히 두고, 수준이 오르면 짧아집니다. */
export const 놀이시간: Record<Difficulty, number> = { 하: 14, 중: 11, 상: 8 };
