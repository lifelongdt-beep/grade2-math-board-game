import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Copy,
  GraduationCap,
  Home,
  Maximize2,
  Minimize2,
  MonitorUp,
  PencilLine,
  QrCode,
  RefreshCcw,
  Smartphone,
  Lightbulb,
  Search,
  Sparkles,
  Timer,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { ScratchPad } from './components/ScratchPad';
import { meaningOfChoice } from './data/choiceMeaning';
import {
  DEFAULT_DB_URL,
  isRoomCode,
  loadOrCreateRoom,
  loadSavedDbUrl,
  normalizeDbUrl,
  relayJoin,
  relayPing,
  relayRecord,
  relayReset,
  relayState,
  saveDbUrl,
  type RelayTarget,
} from './classroomRelay';
import {
  isMuted,
  playAnimalSound,
  playFeverBeat, playFeverStart, playFinishSound, playGameStage, setGameMusicFast, startGameMusic, stopGameMusic, 놀이배경곡,
  playGoalFanfare,
  playReadySound,
  playAnimalAngry,
  playAnimalHappy,
  playDifficultySound,
  playTapSound,
  setMuted,
  successHoldMs,
  wakeAudio,
  watchMuted,
} from './sound';
import { HighlightedPrompt } from './components/HighlightedPrompt';
import { MathText } from './components/MathText';
import { 결승점수, 놀이차시붙이기, 놀이차시인가, 놀이찾기 } from './data/games';
import { 등수표시, 맞힘반영, 부스터인가, 새친구판, 순위매기기, 판점수, type 친구판 } from './data/games/friendRace';
import { FriendRaceBoard } from './components/FriendRaceBoard';
import { MONSTER_HP, UnitMonster, 단원몬스터찾기 } from './components/UnitMonster';
import { 조작칭찬 } from './data/manipulate/fun';
import { 답전까지걸음 } from './data/hintUpgrade';
import type { ManipResult } from './data/manipulate/check';
import { GoalRunner, runnerNameFor } from './components/GoalRunner';
import { studyGuideFor } from './data/studyGuide';
import { RETRY_LIMIT, advancePlayerState, createQuestionState, getPlayerQuestion } from './playerState';
import { 나이김보너스별, 몬스터보너스별, 미션보너스별, 빈통계, 오늘미션, 지난나모두지우기, 지난나목표, 지난나쓰기, 지난나읽기, 카드넣기, 카드모두지우기, 카드모양, 카드읽기, 카드이름, 카드조건, 카드쓰기, type 미션통계, type 카드등급 } from './lessonQuests';
import { 동물이름, 명단쓰기, 명단읽기, 명단풀기, 방식쓰기, 방식읽기, 주인공바꾸기, type 이름바꾸기방식 } from './data/nameSwap';
import { 기록장모두지우기, 기록장읽기, 기록장쓰기, 다음꾸미개, 받을별, 배지들, 불꽃단계, 새로붙은, 새배지, 차림새, 틀린뒤불꽃, 황금문제인가, 대왕때리기, 대왕읽기, 대왕쓰기, 지금대왕, type 기록장, type 대왕, type 대왕싸움 } from './rewards';
import { curriculum as curriculum2 } from './data/curriculum';
import { curriculum5 } from './data/curriculum5';
import { curriculum51 } from './data/curriculum51';
import { curriculum31 } from './data/curriculum31';
import { curriculum11 } from './data/curriculum11';
import { curriculum12 } from './data/curriculum12';
import { curriculum41 } from './data/curriculum41';
import { curriculum42 } from './data/curriculum42';
import { curriculum61 } from './data/curriculum61';
import { curriculum62 } from './data/curriculum62';
import { curriculum32 } from './data/curriculum32';
import { 도입차시인가 } from './data/introReview';
import { ALL_CASTLE_DEFENSE_DANS, CASTLE_DIVIDE_TITLE, isCastleLesson } from './data/lessonKinds';
// 문항 엔진은 무거워서 화면을 먼저 띄운 뒤 따로 불러옵니다(engine.ts).
type 문항엔진 = typeof import('./data/engine');
// 수업 화면에서만 쓰는 큰 부품들(문제 그림, 손 조작, 힌트 실험실, 놀이 장면)도 늦게 불러옵니다.
// 설정 화면이 뜬 뒤 문항 엔진과 함께 미리 받아 두므로, 수업을 시작할 때는 이미 와 있습니다.
const 부품불러오기 = {
  그림: () => import('./components/QuestionVisualGraphic'),
  성: () => import('./components/CastleDefenseScene'),
  놀이: () => import('./components/GameScene'),
  힌트: () => import('./components/InteractiveHintModal'),
  조작: () => import('./components/Manipulate'),
  교사: () => import('./components/TeacherPanel'),
};
const QuestionVisualGraphic = lazy(() => 부품불러오기.그림().then((m) => ({ default: m.QuestionVisualGraphic })));
const CastleDefenseScene = lazy(() => 부품불러오기.성().then((m) => ({ default: m.CastleDefenseScene })));
const GameScene = lazy(() => 부품불러오기.놀이().then((m) => ({ default: m.GameScene })));
const InteractiveHintModal = lazy(() => 부품불러오기.힌트().then((m) => ({ default: m.InteractiveHintModal })));
const ManipulateTask = lazy(() => 부품불러오기.조작().then((m) => ({ default: m.ManipulateTask })));
const TeacherPanel = lazy(() => 부품불러오기.교사().then((m) => ({ default: m.TeacherPanel })));
import type { AnswerRecord, ConceptTag, Difficulty, Lesson, Player, PlayerQuestionState, Question, SessionDuration, Unit } from './types';

// 자리 색은 빨강·주황·노랑·초록·파랑 순서입니다. 아이들이 "나는 노랑" 하고
// 바로 알아볼 수 있게 무지개 순서를 씁니다. 글씨에 쓰는 진한 색(color)과
// 자리 배경에 까는 연한 색(tint)을 짝지어 둡니다.
const playerPalette = ['#e5484d', '#f0761a', '#d99e00', '#2ea043', '#3b6ef5'];
// 배경은 아주 옅게 깝니다. 정답(초록)·오답(빨강)으로 칠해질 때가 더 진해야
// 아이들이 맞았는지 틀렸는지를 자리 색과 헷갈리지 않습니다.
const playerTints = ['#fff7f7', '#fff9f2', '#fffcef', '#f4fbf5', '#f5f8ff'];
const laneStyleFor = (playerId: number) => {
  const at = (playerId - 1) % playerPalette.length;
  return {
    '--player-color': playerPalette[at],
    '--player-tint': playerTints[at],
  } as CSSProperties;
};
// 아이가 고르는 캐릭터입니다. 자리마다 처음에 하나씩 다르게 놓여 있고,
// 마음에 들지 않으면 눌러서 바꿉니다. 2학년이 한눈에 알아보는 동물로만
// 골랐습니다 — 이름을 대며 "나는 여우"라고 말할 수 있어야 합니다.
const avatarChoices = ['🦊', '🐰', '🐶', '🐱', '🐼', '🐯', '🐸', '🐧', '🦁', '🐢'] as const;
let successSoundUrl: string | null = null;
const durations: SessionDuration[] = [30, 60, 120, 180, 240, 300];
// 1분이 넘는 시간은 '2분'처럼 분으로 읽습니다.
const durationLabel = (seconds: number) => (seconds < 60 ? `${seconds}초` : `${seconds / 60}분`);
// 한 문제를 맞힐 때마다 붙는 시간입니다.
const BONUS_SECONDS = 2;
// 서른까지만 두었더니 번호가 더 큰 반에서는 그 아이들이 자기 번호를
// 누를 수가 없었습니다.
const attendanceNumbers = Array.from({ length: 38 }, (_, index) => index + 1);

type StudentConfig = {
  attendanceNo: number;
  difficulty: Difficulty;
  avatar: string;
};

// 수준은 이제 고르지 않습니다. 번호만 누르면 준비가 끝납니다.
type SetupStep = 'attendance' | 'ready';

type PlayerResult = {
  total: number;
  correct: number;
  wrong: number;
};

type ReviewScope = 'lesson' | 'unit' | 'semester';
const semesterReviewUnitValue = 'semester-review' as const;
type UnitSelection = number | typeof semesterReviewUnitValue;

type InitialRoute = {
  isMobileEntry: boolean;
  // 선생님이 큐알을 만들 때 정합니다 — 이 폰의 답을 선생님 화면과
  // 연동할지입니다. 값이 없으면(예전 큐알) 연동을 켠 것으로 봅니다.
  syncEnabled: boolean;
  // 선생님이 무료 실시간 저장소를 쓰기로 한 경우, 그 주소와 방 이름이
  // 큐알에 함께 담겨 옵니다. 없으면 선생님 컴퓨터에서 켠 서버를 씁니다.
  cloudDbUrl?: string;
  cloudRoom?: string;
  semester: Unit['semester'];
  unitSelection?: UnitSelection;
  lessonId?: string;
  duration: SessionDuration;
  // 검사용입니다. 주소에 ?check=상 을 붙이면 그 수준부터 시작합니다.
  // 수업에서는 늘 '하'에서 시작하고 풀면서 오르내립니다. 이 문은 화면을
  // 단원·차시·수준별로 모두 훑어보는 검사에서 상 수준 문항까지 실제로
  // 그려 보기 위한 것입니다. 수준만 정할 뿐 답을 알려 주지 않으므로,
  // 이 주소로 얻을 수 있는 것은 더 어려운 문제뿐입니다.
  checkLevel?: Difficulty;
};

// 2학년 차시와 5학년 차시를 한 앱에서 씁니다. 2학년 문항을 지키는
// 시험들이 curriculum만 훑도록, 두 학기는 파일을 따로 두고 여기서만
// 이어 붙입니다.
// 단원마다 맨 앞에 놀이 차시를 붙입니다(data/games). 교과 차시 자료는 그대로 둡니다.
const curriculum: Unit[] = 놀이차시붙이기([...curriculum11, ...curriculum12, ...curriculum2, ...curriculum31, ...curriculum32, ...curriculum41, ...curriculum42, ...curriculum51, ...curriculum5, ...curriculum61, ...curriculum62]);

const isSemesterValue = (value: string | null): value is Unit['semester'] =>
  value === '1-1' || value === '1-2' || value === '2-1' || value === '2-2' || value === '3-1' || value === '3-2' || value === '4-1' || value === '4-2' || value === '5-1' || value === '5-2' || value === '6-1' || value === '6-2';

const parseSessionDuration = (value: string | null): SessionDuration => {
  const parsed = Number(value);
  return durations.includes(parsed as SessionDuration) ? parsed as SessionDuration : 60;
};

const parseUnitSelection = (value: string | null): UnitSelection | undefined => {
  if (!value) return undefined;
  if (value === semesterReviewUnitValue) return semesterReviewUnitValue;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const readInitialRoute = (): InitialRoute => {
  const params = new URLSearchParams(window.location.search);
  const semesterParam = params.get('s') ?? params.get('semester');
  const unitParam = params.get('u') ?? params.get('unit');
  const lessonParam = params.get('l') ?? params.get('lesson');
  const durationParam = params.get('t') ?? params.get('duration');
  const dbParam = params.get('db');
  const roomParam = params.get('room');
  const checkParam = params.get('check');

  return {
    isMobileEntry: params.get('mobile') === '1' || params.get('m') === '1',
    syncEnabled: params.get('sync') !== '0',
    cloudDbUrl: (dbParam && normalizeDbUrl(dbParam)) || undefined,
    cloudRoom: roomParam && isRoomCode(roomParam) ? roomParam : undefined,
    semester: isSemesterValue(semesterParam) ? semesterParam : '2-1',
    unitSelection: parseUnitSelection(unitParam),
    lessonId: lessonParam ?? undefined,
    duration: parseSessionDuration(durationParam),
    checkLevel: checkParam === '하' || checkParam === '중' || checkParam === '상' ? checkParam : undefined,
  };
};

const isLoopbackHost = () => {
  const host = window.location.hostname;
  return host === 'localhost' || host === '0.0.0.0' || host.startsWith('127.');
};

const isLoopbackOrigin = (origin: string) => {
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '0.0.0.0' || host.startsWith('127.');
  } catch {
    return true;
  }
};

const isUnsupportedMobileOrigin = (origin: string) => {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'api.trycloudflare.com' || isLoopbackOrigin(origin);
  } catch {
    return true;
  }
};

const isPublicTunnelOrigin = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && url.hostname.toLowerCase().endsWith('.trycloudflare.com');
  } catch {
    return false;
  }
};

const createStudentConfigs = (count: number, previous: Record<number, StudentConfig> = {}) => {
  const used = new Set<number>();
  const next: Record<number, StudentConfig> = {};

  for (let index = 1; index <= count; index += 1) {
    const previousConfig = previous[index];
    const attendanceNo =
      previousConfig && !used.has(previousConfig.attendanceNo)
        ? previousConfig.attendanceNo
        : attendanceNumbers.find((number) => !used.has(number)) ?? index;

    used.add(attendanceNo);
    next[index] = {
      attendanceNo,
      difficulty: previousConfig?.difficulty ?? '중',
      avatar: previousConfig?.avatar ?? avatarChoices[(index - 1) % avatarChoices.length],
    };
  }

  return next;
};

const createStudentSetupSteps = (count: number): Record<number, SetupStep> =>
  Object.fromEntries(Array.from({ length: count }, (_, index) => [index + 1, 'attendance']));

const createPlayers = (count: number, configs: Record<number, StudentConfig>): Player[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    attendanceNo: configs[index + 1]?.attendanceNo ?? index + 1,
    name: `${configs[index + 1]?.attendanceNo ?? index + 1}번 학생`,
    color: playerPalette[index],
    difficulty: configs[index + 1]?.difficulty ?? '중',
    avatar: configs[index + 1]?.avatar ?? avatarChoices[index % avatarChoices.length],
  }));

const formatMs = (ms?: number) => (ms ? `${(ms / 1000).toFixed(1)}초` : '-');

const unitReviewIdFor = (semester: Unit['semester'], unitNo: number) => `${semester}-u${unitNo}-review`;

const semesterReviewIdFor = (semester: Unit['semester']) => `${semester}-semester-review`;

const uniqueTags = (lessons: Lesson[]): ConceptTag[] =>
  Array.from(new Set(lessons.flatMap((item) => item.tags))) as ConceptTag[];

const createReviewLesson = (
  scope: Exclude<ReviewScope, 'lesson'>,
  semester: Unit['semester'],
  selectedUnit: Unit,
  semesterUnits: Unit[],
): Lesson => {
  const sourceLessons = scope === 'unit'
    ? selectedUnit.lessons
    : semesterUnits.flatMap((unit) => unit.lessons);
  const title = scope === 'unit' ? '단원 종합' : '학기 종합';
  const unitTitle = scope === 'unit' ? selectedUnit.title : `${semester} 전체 단원`;
  const objective = scope === 'unit'
    ? `${selectedUnit.title} 단원 전체 차시의 핵심 내용을 섞어서 해결한다.`
    : `${semester} 학기 전체 단원의 핵심 내용을 섞어서 해결한다.`;

  return {
    id: scope === 'unit' ? unitReviewIdFor(semester, selectedUnit.unitNo) : semesterReviewIdFor(semester),
    semester,
    unitNo: scope === 'unit' ? selectedUnit.unitNo : 0,
    unitTitle,
    lessonNo: 0,
    title,
    objective,
    achievement: sourceLessons.map((item) => item.achievement).join(' / '),
    tags: uniqueTags(sourceLessons),
    textbookFocus: scope === 'unit'
      ? `${selectedUnit.title} 단원의 모든 차시 내용을 종합한다.`
      : `${semester} 학기 모든 단원의 주요 개념을 종합한다.`,
    workbookFocus: '여러 차시의 문제를 무작위로 풀며 단원과 학기 성취를 점검한다.',
    // 종합 차시는 모아 온 차시들의 선언을 합칩니다. 수 범위는 가장 넓은
    // 것으로, 금지한 그림은 모든 차시가 허락한 것만 남깁니다.
    scope: {
      maxNumber: Math.max(...sourceLessons.map((item) => item.scope.maxNumber), 0),
      representation: 'symbolic',
      forbidVisuals: sourceLessons
        .map((item) => item.scope.forbidVisuals ?? [])
        .reduce<string[]>(
          (shared, list, at) => (at === 0 ? list : shared.filter((kind) => list.includes(kind))),
          [],
        ),
    },
  };
};

const hashSeed = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const shuffledBySeed = <T,>(items: T[], seedText: string): T[] => {
  const copy = [...items];
  let seed = hashSeed(seedText) || 1;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

// 학생에게 같은 문제로 보이는지 가르는 기준입니다. 뒤에 붙은 안내 문구와
// 숫자는 지웁니다. '100이 3개…'와 '100이 5개…'는 숫자만 다른 같은 문제입니다.
const sameQuestionKey = (question: Question) =>
  (question.basePrompt ?? question.prompt).replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();

// 섞기만 하면 같은 문제가 잇따라 나오는 자리가 생깁니다. 바로 앞과 같은
// 문제는 뒤로 미루고 다른 문제를 먼저 냅니다. 미룰 것이 없으면 그대로 둡니다.
// 여러 명이 함께 풀 때는 한 학생이 사람 수만큼 건너뛰며 받으므로, 그 간격
// 안에서도 겹치지 않도록 사람 수만큼 앞을 살펴봅니다.
const spaceOutRepeats = (questions: Question[], gap: number): Question[] => {
  const remaining = [...questions];
  const placed: Question[] = [];
  const recent: string[] = [];

  while (remaining.length > 0) {
    let pick = remaining.findIndex((question) => !recent.includes(sameQuestionKey(question)));
    if (pick === -1) pick = 0;

    const [chosen] = remaining.splice(pick, 1);
    placed.push(chosen);
    recent.push(sameQuestionKey(chosen));
    if (recent.length > gap) recent.shift();
  }

  return placed;
};

// 문제집에 이어 붙이는 판의 수입니다. 한 판이 차시마다 서른 문항쯤이고 뒤 판은 앞 판에 없던 문항만 내므로, 일곱 판이면 차시마다 백오십 문항쯤 됩니다.
const 문제판수 = 7;

const buildScopedQuestions = (
  { generateClassQuestions, 놀이문항, 조작섞기 }: 문항엔진,
  lessons: Lesson[],
  difficulty: Difficulty,
  scope: ReviewScope,
  bankSeed: number,
  castleDans: number[],
): Question[] => {
  // castleDans는 '구구단, 몬스터를 막아라!'만 읽습니다. 다른 차시는
  // generateQuestions 안에서 조용히 무시합니다. 단원 도입 차시는 앞 단원
  // 종합 문제로 바뀝니다(generateClassQuestions).
  // 차시마다 셋에 하나쯤은 보기를 고르지 않고 손으로 조작하는 문항으로 바꿉니다.
  // 판을 여러 벌 이어 붙입니다. 판마다 같은 틀에 다른 수가 들어가므로, 한
  // 판(차시마다 서른 문항쯤)을 다 풀어도 바로 같은 문제가 되풀이되지 않습니다.
  // 판끼리 우연히 같은 문항은 한 번만 둡니다.
  // 단원 놀이 차시는 그 단원 차시들에서 놀이에 맞는 문항을 골라 냅니다(data/games).
  if (lessons.length === 1 && 놀이차시인가(lessons[0])) return 놀이문항(lessons[0], difficulty, bankSeed);
  const 본 = new Set<string>();
  // 여러 차시를 함께 고르면 한 판만으로도 문제집이 넉넉하므로, 문제집이
  // 백오십 문항쯤 되는 데까지만 판을 더합니다(만드는 시간을 아낍니다).
  const 판수 = Math.max(1, Math.min(문제판수, Math.ceil(문제판수 / Math.max(1, lessons.length))));
  const questions = Array.from({ length: 판수 }, (_, 판) =>
    lessons.flatMap((sourceLesson) => {
      // 처음 판은 검사를 모두 거친 판이라 그대로 씁니다. 뒤 판에서 문항을 만들다
      // 멈추는 일이 생기면 그 차시의 그 판만 건너뛰고 수업은 이어 갑니다.
      if (판 === 0) return 조작섞기(sourceLesson, difficulty, generateClassQuestions(sourceLesson, difficulty, { castleDans }), 0);
      try {
        return 조작섞기(sourceLesson, difficulty, generateClassQuestions(sourceLesson, difficulty, { castleDans, 판 }), 판);
      } catch {
        return [];
      }
    }),
  ).flat().filter((q) => {
    const 열쇠 = `${q.lessonId}|${q.prompt}|${q.answer}|${JSON.stringify(q.visual ?? null)}|${JSON.stringify(q.manipulate ?? null)}`;
    if (본.has(열쇠)) return false;
    본.add(열쇠);
    return true;
  });

  // 한 차시를 고른 경우에도 순서를 섞습니다. 섞지 않으면 수업을 다시 해도
  // 늘 같은 순서로 나와 학생이 순서를 외워 버립니다.
  // bankSeed는 수업을 시작할 때마다 새로 정해지므로 매번 순서가 달라집니다.
  const shuffled = shuffledBySeed(
    questions,
    `${scope}-${difficulty}-${bankSeed}-${castleDans.join(',')}-${lessons.map((item) => item.id).join('|')}`,
  );

  // 앞의 두 문제와 겹치지 않게 벌려 둡니다. 두 칸이면 혼자 풀 때도,
  // 여럿이 나누어 풀 때도 바로 앞 문제와는 달라집니다.
  return spaceOutRepeats(shuffled, 2);
};

const writeAscii = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

const createSuccessSoundUrl = () => {
  if (successSoundUrl) return successSoundUrl;

  const sampleRate = 12000;
  const duration = 0.38;
  const sampleCount = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, sampleCount * 2, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const frequency = time < 0.12 ? 523.25 : time < 0.24 ? 659.25 : 783.99;
    const envelope = Math.min(1, time / 0.035) * Math.max(0, 1 - time / duration);
    const sample = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.38;
    view.setInt16(44 + index * 2, sample * 32767, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }

  successSoundUrl = `data:audio/wav;base64,${window.btoa(binary)}`;
  return successSoundUrl;
};

const playSuccessSoundFallback = () => {
  try {
    const audio = document.createElement('audio');
    audio.src = createSuccessSoundUrl();
    audio.volume = 0.72;
    void audio.play().catch(() => undefined);
    window.setTimeout(() => audio.remove(), 800);
  } catch {
    // Visual success feedback still handles environments without media playback.
  }
};

// 남은 시간만큼 위쪽 모래가 남고, 지난 만큼 아래에 쌓입니다.
// 숫자를 빨리 못 읽는 아이도 모래를 보고 시간을 가늠할 수 있습니다.
// 유리는 삼각형이 아니라 항아리처럼 볼록하게 부풀렸다가 목으로 좁아집니다.
const TOP_CEILING = 8;
const TOP_FLOOR = 37.6;
const BOTTOM_CEILING = 40.4;
const BOTTOM_FLOOR = 70;
// 위 항아리: 어깨에서 볼록하게 나왔다가 가운데 목으로 모입니다.
const TOP_BULB = 'M 8 8 H 44 C 44 20, 38 30, 27.4 37.6 H 24.6 C 14 30, 8 20, 8 8 Z';
const BOTTOM_BULB = 'M 24.6 40.4 H 27.4 C 38 48, 44 58, 44 70 H 8 C 8 58, 14 48, 24.6 40.4 Z';

const SandTimer = ({ remaining, total }: { remaining: number; total: number }) => {
  const left = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;
  const topHeight = (TOP_FLOOR - TOP_CEILING) * left;
  const bottomHeight = (BOTTOM_FLOOR - BOTTOM_CEILING) * (1 - left);

  return (
    <svg
      className="sand-timer"
      viewBox="0 0 52 78"
      role="img"
      aria-label={`남은 시간 ${remaining}초`}
    >
      <defs>
        <clipPath id="sand-timer-top">
          <path d={TOP_BULB} />
        </clipPath>
        <clipPath id="sand-timer-bottom">
          <path d={BOTTOM_BULB} />
        </clipPath>
      </defs>

      {/* 나무 기둥 */}
      <rect x="6.5" y="5" width="3.4" height="68" rx="1.7" fill="#a9741f" />
      <rect x="42.1" y="5" width="3.4" height="68" rx="1.7" fill="#a9741f" />

      {/* 유리 */}
      <path d={TOP_BULB} fill="#fffdf4" />
      <path d={BOTTOM_BULB} fill="#fffdf4" />

      {/* 모래 */}
      <rect
        x="6"
        y={TOP_FLOOR - topHeight}
        width="40"
        height={topHeight}
        fill="#f5b301"
        clipPath="url(#sand-timer-top)"
      />
      <rect
        x="6"
        y={BOTTOM_FLOOR - bottomHeight}
        width="40"
        height={bottomHeight}
        fill="#f5b301"
        clipPath="url(#sand-timer-bottom)"
      />
      {left > 0 && left < 1 && (
        <rect className="sand-timer-fall" x="25" y="37" width="2" height="17" fill="#f5b301" />
      )}

      {/* 유리에 비치는 빛 */}
      <path d="M 13 11 C 13 20, 17 27, 22 32" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
      <path d="M 13 67 C 13 58, 17 51, 22 46" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />

      {/* 유리 테두리 */}
      <path d={TOP_BULB} fill="none" stroke="#b9812a" strokeWidth="2" strokeLinejoin="round" />
      <path d={BOTTOM_BULB} fill="none" stroke="#b9812a" strokeWidth="2" strokeLinejoin="round" />

      {/* 위아래 나무 받침 */}
      <rect x="3" y="1.5" width="46" height="6.5" rx="3.2" fill="#c98f2f" />
      <rect x="3" y="70" width="46" height="6.5" rx="3.2" fill="#c98f2f" />
    </svg>
  );
};

// 모은 별로 붙은 모자·망토가 캐릭터에 함께 그려집니다(rewards.ts). 별을 모르는 자리(번호를
// 고르기 전)에는 맨몸 캐릭터만 보입니다.
// 연속 정답 불꽃(fire, 0~3단계)은 캐릭터 발치에 붙습니다.
const PlayerAvatar = ({ player, active = false, stars, fire = 0 }: { player: Player; active?: boolean; stars?: number; fire?: number }) => {
  const 옷 = stars === undefined ? {} : 차림새(stars);
  return (
    <span
      className={`player-avatar ${active ? 'success' : ''} ${옷.cape ? `has-cape ${옷.cape.look}` : ''} ${fire ? `on-fire fire-${fire}` : ''}`.trim()}
      style={{ borderColor: player.color }}
      aria-hidden="true"
    >
      {player.avatar}
      {옷.hat && <span className="avatar-hat">{옷.hat.look}</span>}
      {fire > 0 && <span className="avatar-flame">🔥</span>}
    </span>
  );
};

const ClassroomQrCode = ({ value }: { value: string }) => {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setQrFailed(false);

    // 큐알 도구는 큐알을 띄울 때 불러옵니다(처음 여는 무게를 줄입니다).
    import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(value, {
      errorCorrectionLevel: 'H',
      margin: 5,
      scale: 14,
      width: 560,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    }))
      .then((nextUrl) => {
        if (!active) return;
        setQrImageUrl(nextUrl);
      })
      .catch(() => {
        if (!active) return;
        setQrImageUrl('');
        setQrFailed(true);
      });

    return () => {
      active = false;
    };
  }, [value]);

  if (qrFailed || !qrImageUrl) {
    return (
      <div className="qr-code-fallback">
        <QrCode size={36} />
        <span>QR 준비 중</span>
      </div>
    );
  }

  return (
    <img className="qr-code-image" src={qrImageUrl} alt="모바일 참여 QR 코드" draggable={false} />
  );
};

function App() {
  const [mode, setMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const initialRoute = useMemo(() => readInitialRoute(), []);
  const isMobileEntry = initialRoute.isMobileEntry;
  // 검사로 열었을 때만 값이 있습니다(위 readInitialRoute의 설명 참고).
  const checkLevel = initialRoute.checkLevel;
  // 이 폰의 답을 선생님 화면과 연동할지입니다 — 선생님이 큐알을 만들 때
  // 정한 값을 그대로 물려받습니다(모바일이 아니면 뜻이 없습니다).
  const mobileSyncEnabled = isMobileEntry && initialRoute.syncEnabled;
  // 선생님 화면에서, 새로 보여 줄 큐알에 연동을 켤지 끌지 고르는 자리입니다.
  const [qrSyncEnabled, setQrSyncEnabled] = useState(true);
  // 선생님이 한 번 넣어 둔 무료 실시간 저장소 주소입니다. 학생 폰은 이
  // 값을 큐알로 물려받고, 선생님 화면은 자기 컴퓨터에 적어 둔 값을 씁니다.
  const [relayDbUrl, setRelayDbUrl] = useState(() => (isMobileEntry ? '' : loadSavedDbUrl()));
  const [relayRoom] = useState(() => (isMobileEntry ? '' : loadOrCreateRoom()));
  // 주소를 넣는 칸과, 잘못 넣었을 때 알려 줄 자리입니다.
  const [relayDbInput, setRelayDbInput] = useState(relayDbUrl);
  const [relaySetupOpen, setRelaySetupOpen] = useState(false);
  const [relayDbError, setRelayDbError] = useState('');
  // 이 기기가 어디로 답을 주고받을지입니다. 저장소 주소가 있으면 그쪽을,
  // 없으면 선생님 컴퓨터에서 켠 서버(/api/*)를 씁니다.
  const relayTarget = useMemo<RelayTarget>(() => {
    // 선생님이 따로 넣은 주소가 있으면 그것을, 없으면 앱에 미리 넣어 둔
    // 공용 저장소를 씁니다. 그래서 보통은 아무 설정도 필요 없습니다.
    const dbUrl = isMobileEntry
      ? initialRoute.cloudDbUrl
      : (normalizeDbUrl(relayDbUrl) ?? normalizeDbUrl(DEFAULT_DB_URL));
    const room = isMobileEntry ? initialRoute.cloudRoom : relayRoom;
    if (dbUrl && room) return { kind: 'cloud', dbUrl, room };
    return { kind: 'local' };
  }, [initialRoute.cloudDbUrl, initialRoute.cloudRoom, isMobileEntry, relayDbUrl, relayRoom]);
  const skipInitialSemesterReset = useRef(true);
  const skipInitialUnitReset = useRef(true);
  const [semester, setSemester] = useState<Unit['semester']>(initialRoute.semester);
  const semesterUnits = useMemo(() => curriculum.filter((unit) => unit.semester === semester), [semester]);
  const [unitSelection, setUnitSelection] = useState<UnitSelection>(initialRoute.unitSelection ?? 1);
  const isSemesterReviewSelected = unitSelection === semesterReviewUnitValue;
  const selectedUnitNo = isSemesterReviewSelected ? semesterUnits[0]?.unitNo : unitSelection;
  const selectedUnit = semesterUnits.find((unit) => unit.unitNo === selectedUnitNo) ?? semesterUnits[0];
  const unitReviewId = unitReviewIdFor(semester, selectedUnit.unitNo);
  const semesterReviewId = semesterReviewIdFor(semester);
  const [lessonId, setLessonId] = useState(initialRoute.lessonId ?? selectedUnit.lessons[0].id);
  const reviewScope: ReviewScope =
    isSemesterReviewSelected ? 'semester' : lessonId === unitReviewId ? 'unit' : 'lesson';
  const selectedLesson = selectedUnit.lessons.find((item) => item.id === lessonId) ?? selectedUnit.lessons[0];
  const scopedLessons = useMemo(
    () => {
      // 단원·학기 종합은 그 단원 차시의 내용만 냅니다. 단원 도입 차시는 앞
      // 학기·앞 학년 단원을 복습하므로(introReview.ts) 종합에서는 뺍니다.
      // 놀이 차시는 그 단원 문항을 다시 쓰는 것이라 종합에 넣지 않습니다.
      const 이단원차시 = (unit: (typeof semesterUnits)[number]) => unit.lessons.filter((item) => !도입차시인가(item) && !놀이차시인가(item));
      if (reviewScope === 'semester') return semesterUnits.flatMap(이단원차시);
      if (reviewScope === 'unit') return 이단원차시(selectedUnit);
      return [selectedLesson];
    },
    [reviewScope, selectedLesson, selectedUnit, semesterUnits],
  );
  const lesson = useMemo(
    () => {
      if (reviewScope === 'lesson') return selectedLesson;
      return createReviewLesson(reviewScope, semester, selectedUnit, semesterUnits);
    },
    [reviewScope, selectedLesson, selectedUnit, semester, semesterUnits],
  );
  const lessonHeading = reviewScope !== 'lesson' ? lesson.title : 놀이차시인가(lesson) ? `🎮 놀이 · ${lesson.title}` : `${lesson.lessonNo}차시 · ${lesson.title}`;
  const lessonContextLabel =
    reviewScope === 'semester'
      ? `${semester} · 학기 종합`
      : reviewScope === 'unit'
        ? `${semester} · ${selectedUnit.unitNo}. ${selectedUnit.title} · 단원 종합`
        : `${semester} · ${selectedUnit.unitNo}. ${selectedUnit.title}`;
  const [playerCount, setPlayerCount] = useState(isMobileEntry ? 1 : 3);
  const [studentConfigs, setStudentConfigs] = useState<Record<number, StudentConfig>>(() => createStudentConfigs(isMobileEntry ? 1 : 3));
  const [studentSetupSteps, setStudentSetupSteps] = useState<Record<number, SetupStep>>(() => createStudentSetupSteps(isMobileEntry ? 1 : 3));
  const [sessionDuration, setSessionDuration] = useState<SessionDuration>(initialRoute.duration);
  const [muted, setMutedState] = useState(isMuted);
  const [openResults, setOpenResults] = useState<Record<number, boolean>>({});
  // 3단계 스캐폴딩 힌트: 1단계(핵심 말 강조)는 문제글에 늘 켜 두고,
  // 2단계(정지된 그림)도 이미 문제와 함께 보입니다. 여기서는 그 위의
  // 두 가지를 다룹니다 — 짧은 도움말을 미리 열어 보는 것과, 조작형
  // 힌트 창을 여는 것입니다. 둘 다 새 문제로 넘어가면 다시 닫힙니다.
  const [hintTextOpen, setHintTextOpen] = useState<Record<number, boolean>>({});
  // 조작 문항에서 틀렸을 때, 알아본 실수에 맞춘 도움말입니다.
  const [manipTips, setManipTips] = useState<Record<number, string>>({});
  // 힌트에서 풀이를 한 걸음씩 펼친 수입니다(답을 말하는 걸음 앞에서 멈춥니다).
  const [hintSteps, setHintSteps] = useState<Record<number, number>>({});
  const [hintModalOpen, setHintModalOpen] = useState<Record<number, boolean>>({});
  // 이 문제에서 조작형 힌트를 열어 본 적이 있는지입니다. 정답 기록에
  // 실어 두면 교사가 어느 문제에서 도움이 더 필요했는지 볼 수 있습니다.
  const [hintUsedThisQuestion, setHintUsedThisQuestion] = useState<Record<number, boolean>>({});
  // 계산판을 펴 두었는지입니다. 힌트와 달리 문제가 바뀌어도 닫지
  // 않습니다 — 손으로 써야 풀리는 아이는 다음 문제에서도 써야 하는데,
  // 문제마다 다시 펴게 하면 그것이 곧 쓰지 말라는 말이 됩니다.
  // 쓴 내용은 문제마다 지웁니다(ScratchPad의 key).
  const [scratchOpen, setScratchOpen] = useState<Record<number, boolean>>({});
  const [round, setRound] = useState(1);
  // 맞힐 때마다 시간이 조금씩 늘어납니다. 줄어들기만 하는 시계는 2학년에게
  // 재미보다 불안이라, 잘 풀수록 더 오래 놀 수 있게 합니다.
  //
  // 다만 끝이 나긴 해야 합니다. 아이 셋이 5초에 한 문제씩 맞히면 1초에
  // 1.2초씩 붙어 시계가 영영 멈추지 않습니다. 그래서 처음 시간의 절반까지만
  // 늘려 줍니다 — 60초 수업이면 최대 30초입니다.
  const [bonusUsed, setBonusUsed] = useState(0);
  const [bonusFlash, setBonusFlash] = useState(0);
  // 맞힌 아이 자리에서 시계까지 날아가는 별입니다. 시간이 왜 늘었는지가
  // 눈에 보여야 '맞히면 시간이 붙는다'가 규칙으로 읽힙니다.
  const [flyingStars, setFlyingStars] = useState<
    Array<{ id: number; left: number; top: number; dx: number; dy: number }>
  >([]);
  const timerCardRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<Record<number, HTMLElement | null>>({});
  const players = useMemo(() => createPlayers(playerCount, studentConfigs), [playerCount, studentConfigs]);
  const [bankSeed, setBankSeed] = useState(0);
  // '구구단, 몬스터를 막아라!'에서 학생이 스스로 고르는 구구단입니다.
  // 아무것도 고르지 않은 채 시작하면(전부 꺼진 상태) 문제 생성기가
  // 전체(2~9단)로 채웁니다 — questionFactory.ts의 fallback 참고.
  const [castleDans, setCastleDans] = useState<number[]>([]);
  const toggleCastleDan = (dan: number) => {
    setCastleDans((prev) => {
      const has = prev.includes(dan);
      return has ? prev.filter((value) => value !== dan) : [...prev, dan].sort((a, b) => a - b);
    });
  };
  const toggleAllCastleDans = () => {
    setCastleDans((prev) => (prev.length === ALL_CASTLE_DEFENSE_DANS.length ? [] : ALL_CASTLE_DEFENSE_DANS));
  };
  // 판을 여러 벌 만들면 시간이 걸리므로, 수준마다 처음 꺼낼 때 한 번만 만듭니다.
  // 하에서 시작한 학생이 상에 오르기 전에는 상 문제집을 만들지 않습니다.
  // 문항 엔진입니다. 화면을 먼저 그린 뒤 뒤에서 내려받습니다. 받기 전에는 문제집이 비어 있고,
  // 수업 화면은 '문제를 준비하고 있어요'를 잠깐 보여 줍니다.
  const [engine, setEngine] = useState<문항엔진 | null>(null);
  useEffect(() => {
    let 살아있음 = true;
    void import('./data/engine').then((loaded) => {
      if (살아있음) setEngine(loaded);
    });
    // 수업 화면 부품도 이때 미리 받아 둡니다.
    for (const 받기 of Object.values(부품불러오기)) void 받기();
    return () => {
      살아있음 = false;
    };
  }, []);
  const questionBanks = useMemo<Record<Difficulty, Question[]>>(() => {
    if (!engine) return { 하: [], 중: [], 상: [] };
    const 만든것: Partial<Record<Difficulty, Question[]>> = {};
    const 꺼내기 = (level: Difficulty) => (만든것[level] ??= buildScopedQuestions(engine, scopedLessons, level, reviewScope, bankSeed, castleDans));
    return {
      get 하() { return 꺼내기('하'); },
      get 중() { return 꺼내기('중'); },
      get 상() { return 꺼내기('상'); },
    };
  }, [engine, bankSeed, reviewScope, scopedLessons, castleDans]);
  const [remainingSeconds, setRemainingSeconds] = useState<SessionDuration | number>(sessionDuration);
  const [playerStates, setPlayerStates] = useState<Record<number, PlayerQuestionState>>(() => createQuestionState(players, undefined, checkLevel));
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  // 큐알로 들어온 학생 폰의 결과입니다. 폰은 자기 답을 서버에 올리고,
  // 선생님 화면은 이 자리로 주기적으로 받아 옵니다(server가 없으면
  // 그냥 비어 있습니다 — 평소처럼 동작합니다).
  const [remotePlayers, setRemotePlayers] = useState<Player[]>([]);
  const [remoteRecords, setRemoteRecords] = useState<AnswerRecord[]>([]);
  const remotePlayerIdRef = useRef<number | null>(null);
  // 등록(/api/join)이 끝나기 전에 이미 푼 문제가 있을 때 잠깐 담아 두는
  // 자리입니다. 등록이 끝나면 여기 담긴 것부터 마저 올려 보냅니다.
  const pendingRemoteRecordsRef = useRef<AnswerRecord[]>([]);
  // 몇 번째 판인지입니다. 판을 새로 시작하면 하나 올라가고, 그보다 앞선
  // 판에서 떠난 물음의 대답은 버립니다(지운 기록이 되살아나지 않게).
  const remoteEpochRef = useRef(0);
  const [teacherOpen, setTeacherOpen] = useState(false);
  // 학습이 끝나면 교사용 분석 파일을 자동으로 내려받을지 고릅니다. 이 컴퓨터에서
  // 고른 것을 기억해 두어 수업마다 다시 고르지 않아도 됩니다.
  const [autoDownloadAnalysis, setAutoDownloadAnalysis] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('autoDownloadAnalysis') === '1';
    } catch {
      return false;
    }
  });
  const toggleAutoDownloadAnalysis = (next: boolean) => {
    setAutoDownloadAnalysis(next);
    try {
      window.localStorage.setItem('autoDownloadAnalysis', next ? '1' : '0');
    } catch {
      // 저장할 수 없는 환경(사생활 보호 창 등)이면 이번 수업에만 적용됩니다.
    }
  };
  const [mobileJoinOpen, setMobileJoinOpen] = useState(false);
  const [mobileUrlCopied, setMobileUrlCopied] = useState(false);
  const [mobileJoinOrigin, setMobileJoinOrigin] = useState('');
  // 이 QR 화면을 열 때, 연동에 꼭 필요한 서버(published-server)가 지금
  // 실제로 켜져 있는지 살짝 찔러 봅니다. null=확인 중, true=서버 응답함,
  // false=응답 없음(예: 그냥 배포된 github.io 사이트만 켜져 있는 경우 —
  // 이때는 체크박스를 켜도 연동될 방법이 없으므로 미리 알려 줘야 합니다.
  const [relayAvailable, setRelayAvailable] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenFallback, setFullscreenFallback] = useState(false);
  const [successSignals, setSuccessSignals] = useState<Record<number, number>>({});
  // 출석 번호마다 모은 별과 받은 배지입니다. 이 컴퓨터에 남아 다음 시간에도 이어집니다.
  const [profiles, setProfiles] = useState<Record<number, 기록장>>({});
  const profileOf = (attendanceNo: number) => profiles[attendanceNo] ?? 기록장읽기(attendanceNo);
  // 자리마다 잠깐 떠오르는 알림(새 꾸미개, 새 배지)입니다. 한꺼번에 생기면 차례로 띄웁니다.
  const [laneToasts, setLaneToasts] = useState<Record<number, Array<{ id: number; look: string; text: string }>>>({});
  // 자리마다 이어서 맞힌 수입니다. fire는 연속 정답 불꽃, noHint는 힌트 없이 이어서 맞힌 수입니다.
  const [runs, setRuns] = useState<Record<number, { fire: number; noHint: number }>>({});
  // 문제 속 주인공 이름을 바꿀지입니다. 선생님이 정하고, 이 컴퓨터에 남습니다(기본은 끔).
  const [nameMode, setNameMode] = useState<이름바꾸기방식>(() => 방식읽기());
  const [roster, setRoster] = useState(() => 명단읽기());
  const rosterNames = useMemo(() => 명단풀기(roster), [roster]);
  // 그 자리 아이가 주인공으로 나올 이름입니다. 동물 친구면 고른 캐릭터, 우리 반 이름이면 명단의 그 번호입니다.
  const heroOf = (player: Player): string | null =>
    nameMode === 'animals' ? 동물이름[player.avatar] ?? null : nameMode === 'class' ? rosterNames[player.attendanceNo] ?? null : null;
  // 문제에 둘째·셋째 사람이 나오면 함께 푸는 친구들, 그다음 나머지 이름을 차례로 씁니다.
  const friendNamesFor = (player: Player): string[] => {
    const 함께 = players.filter((other) => other.id !== player.id).map(heroOf).filter((one): one is string => Boolean(one));
    const 나머지 = nameMode === 'animals' ? Object.values(동물이름) : Object.values(rosterNames);
    return [...new Set([...함께, ...나머지])];
  };
  // 우리 반이 함께 싸우는 몬스터 대왕입니다. 모은 별만큼 힘이 깎이고, 판이 끝나도 이어집니다.
  // 휴대폰으로 들어온 아이는 자기 기기에서 혼자 푸므로 반 목표를 보여 주지 않습니다.
  const [boss, setBoss] = useState<대왕싸움>(() => 대왕읽기());
  const [bossWin, setBossWin] = useState<{ id: number; boss: 대왕 } | null>(null);
  // 성 지키기가 아닌 차시에서 문제 위에 서 있는 단원 몬스터입니다. 맞힐 때마다 한 대씩 맞습니다.
  const [monsters, setMonsters] = useState<Record<number, { hits: number; defeated: number }>>({});
  // 이번 판에 받은 배지입니다(판 결과에 보여 줍니다).
  const [sessionBadges, setSessionBadges] = useState<Record<number, string[]>>({});
  // 이번 판에 모은 별입니다(판 결과에 보여 줍니다).
  const [sessionStars, setSessionStars] = useState<Record<number, number>>({});
  // 일반 차시의 게임 요소(lessonQuests.ts)입니다. 놀이 차시에서는 쓰지 않습니다.
  // quests는 이번 판에 해낸 것과, 미션을 다 했는지·지난번의 나를 이겼는지입니다.
  const [quests, setQuests] = useState<Record<number, { 통계: 미션통계; 다함: boolean; 나이김: boolean }>>({});
  // 오늘 넘어설 '지난번의 나'의 맞힌 수입니다. 판을 시작할 때 정합니다(지난 기록이 없으면 null).
  const [ghosts, setGhosts] = useState<Record<number, number | null>>({});
  const questStartRef = useRef(0);
  // 출석 번호마다 모은 개념 카드(차시 id → 등급)입니다. 이 컴퓨터에 남아 다음 시간에도 이어집니다.
  const [cardBook, setCardBook] = useState<Record<number, Record<string, 카드등급>>>({});
  const cardsOf = (attendanceNo: number) => cardBook[attendanceNo] ?? 카드읽기(attendanceNo);
  // 이번 판에 새로 얻거나 올린 카드입니다(판 결과에서 빛나게 합니다).
  const [sessionCards, setSessionCards] = useState<Record<number, string[]>>({});
  const ghostSavedRef = useRef(false);
  const [wrongSignals, setWrongSignals] = useState<Record<number, number>>({});

  useEffect(() => {
    if (skipInitialSemesterReset.current) {
      skipInitialSemesterReset.current = false;
      return;
    }

    const firstUnit = curriculum.find((unit) => unit.semester === semester);
    if (!firstUnit) return;
    setUnitSelection(firstUnit.unitNo);
    setLessonId(firstUnit.lessons[0].id);
  }, [semester]);

  useEffect(() => {
    if (skipInitialUnitReset.current) {
      skipInitialUnitReset.current = false;
      return;
    }

    if (isSemesterReviewSelected) {
      setLessonId(semesterReviewId);
      return;
    }
    setLessonId(selectedUnit.lessons[0].id);
  }, [isSemesterReviewSelected, selectedUnit, semesterReviewId]);

  useEffect(() => {
    if (!isMobileEntry || playerCount === 1) return;
    setPlayerCount(1);
  }, [isMobileEntry, playerCount]);

  useEffect(() => {
    setStudentConfigs((prev) => createStudentConfigs(playerCount, prev));
    setStudentSetupSteps(createStudentSetupSteps(playerCount));
  }, [playerCount]);

  // 차시나 인원이 바뀌면 준비를 처음부터 다시 합니다.
  // mode는 일부러 넣지 않았습니다. 넣으면 설정 화면으로 돌아오는 것만으로도
  // 이 효과가 돌아서, '다시 풀기'로 난이도만 다시 고르게 해 둔 것이
  // 출석번호부터 다시 누르는 것으로 되돌아갑니다. 차시와 인원은 설정
  // 화면에서만 바꿀 수 있으므로 mode를 볼 필요가 없습니다.
  useEffect(() => {
    setStudentSetupSteps(createStudentSetupSteps(playerCount));
  }, [lesson.id, playerCount]);

  // 브라우저는 화면을 한 번 건드리기 전에는 소리를 내지 못하게 막습니다.
  // 어디를 누르든 그때 한 번 깨워 두면 첫 정답 소리부터 제대로 납니다.
  useEffect(() => {
    const wake = () => wakeAudio();
    window.addEventListener('pointerdown', wake, { once: true });
    window.addEventListener('keydown', wake, { once: true });
    return () => {
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  // 소리를 껐다 켜는 것은 이 화면 말고 다른 곳에서도 바뀔 수 있으므로
  // 저장된 값을 지켜보다 따라갑니다.
  useEffect(() => watchMuted(setMutedState), []);

  useEffect(() => {
    if (mode !== 'setup') return;
    setPlayerStates(createQuestionState(players, undefined, checkLevel));
    setRemainingSeconds(sessionDuration);
  }, [players, sessionDuration, mode]);

  // ── 마지막 피버 타임 ──
  // 남은 시간이 30초(30초 수업은 10초)가 되면 시작합니다. 맞혀서 시간이 다시 늘어나도 한번 시작한
  // 피버는 그 판이 끝날 때까지 이어집니다 — 꺼졌다 켜지면 신호가 거듭 울려 어수선합니다.
  const feverSeconds = sessionDuration >= 60 ? 30 : 10;
  const [feverOn, setFeverOn] = useState(false);
  // 놀이 차시(단원 놀이·성 지키기)에는 오락실 배경음악이 돕니다. 피버 타임에는 박자 소리 대신 음악이 빨라집니다.
  const 놀이곡 = 놀이찾기(lesson) ? 놀이배경곡[놀이찾기(lesson)!.mode] : isCastleLesson(lesson.title) ? 'adventure' : null;
  useEffect(() => {
    if (mode === 'playing' && 놀이곡) startGameMusic(놀이곡);
    else stopGameMusic();
  }, [mode, 놀이곡]);
  useEffect(() => () => stopGameMusic(), []);
  useEffect(() => {
    setGameMusicFast(feverOn && mode === 'playing');
  }, [feverOn, mode]);
  useEffect(() => {
    if (mode !== 'playing') {
      setFeverOn(false);
      return;
    }
    if (!feverOn && remainingSeconds > 0 && remainingSeconds <= feverSeconds) {
      setFeverOn(true);
      playFeverStart();
    } else if (feverOn && remainingSeconds > 0 && remainingSeconds <= feverSeconds && !놀이곡) {
      playFeverBeat(remainingSeconds);
    }
  }, [mode, remainingSeconds, feverSeconds, feverOn, 놀이곡]);

  useEffect(() => {
    if (mode !== 'playing') return;
    const timerId = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timerId);
          playFinishSound();
          setMode('finished');
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [mode]);

  useEffect(() => {
    const syncFullscreenState = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active) setFullscreenFallback(false);
    };
    syncFullscreenState();
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    let active = true;
    let retryTimer: number | undefined;

    const syncMobileOrigin = async () => {
      const configUrl = `./mobile-origin.json?ts=${Date.now()}`;
      try {
        const response = await fetch(configUrl, { cache: 'no-store' });
        const data = response.ok ? ((await response.json()) as { origin?: unknown } | null) : null;
        if (!active || typeof data?.origin !== 'string') return;
        const origin = data.origin.replace(/\/$/, '');
        if (/^https?:\/\/[^/]+$/i.test(origin) && !isUnsupportedMobileOrigin(origin)) {
          setMobileJoinOrigin(origin);
          if (retryTimer && isPublicTunnelOrigin(origin)) window.clearInterval(retryTimer);
        }
      } catch {
        // The launcher writes mobile-origin.json after startup; keep polling quietly.
      }
    };

    void syncMobileOrigin();
    if (isLoopbackHost()) {
      retryTimer = window.setInterval(syncMobileOrigin, 2000);
    }

    return () => {
      active = false;
      if (retryTimer) window.clearInterval(retryTimer);
    };
  }, []);

  // 큐알 화면을 열 때마다, 연동에 꼭 필요한 서버가 지금 응답하는지 한 번
  // 찔러 봅니다. 그냥 배포된 github.io 사이트만 켜 둔 채로는 체크박스를
  // 켜도 학생 결과가 절대 넘어오지 않으므로, 열 때마다 다시 확인해 미리
  // 알려 줍니다.
  useEffect(() => {
    if (!mobileJoinOpen) {
      setRelayAvailable(null);
      return;
    }
    let active = true;
    setRelayAvailable(null);
    void relayPing(relayTarget).then((reachable) => {
      if (active) setRelayAvailable(reachable);
    });
    return () => {
      active = false;
    };
  }, [mobileJoinOpen, relayTarget]);

  // 선생님 화면에서만 큐알 학생 폰의 결과를 받아 옵니다. 연결할 곳이
  // 없으면(그냥 배포된 사이트에 저장소 주소도 안 넣은 경우) 조용히 null이
  // 오므로 아무 일도 일어나지 않습니다.
  //
  // 설정 화면에서도 받아 옵니다. 큐알로만 수업할 때는 선생님이 자기
  // 수업을 시작하지 않고 QR만 띄워 두는데, 그때 아무것도 가져오지 않으면
  // 학생이 아무리 풀어도 선생님 화면에는 영영 나타나지 않습니다.
  useEffect(() => {
    if (isMobileEntry) return;
    if (mode === 'setup' && relayTarget.kind !== 'cloud') return;
    let active = true;

    const pull = async () => {
      // 새 판이 시작되면 지난 판 기록을 지웁니다. 그런데 지우기 직전에
      // 떠난 물음이 지운 뒤에 대답으로 돌아오면, 지운 기록이 되살아납니다.
      // 몇 번째 판의 물음이었는지를 적어 두었다가, 지난 판 것이면 버립니다.
      const epoch = remoteEpochRef.current;
      const data = await relayState(relayTarget);
      if (!active || !data || epoch !== remoteEpochRef.current) return;

      setRemotePlayers(data.players.map((item) => ({ ...item, remote: true })));
      // 실시간 저장소에서는 매번 가장 나중 몇 개만 받아 옵니다. 이미 받아
      // 둔 기록과 합쳐야 앞부분이 사라지지 않습니다(같은 기록은 한 번만).
      setRemoteRecords((prev) => {
        const merged = new Map(prev.map((record) => [record.id, record]));
        for (const record of data.records) merged.set(record.id, record);
        return merged.size === prev.length ? prev : [...merged.values()];
      });
    };

    void pull();
    const intervalId = window.setInterval(pull, 3000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isMobileEntry, mode, relayTarget]);

  const sessionRecords = useMemo(() => records.filter((record) => record.lessonId === lesson.id), [records, lesson.id]);
  const playerResults = useMemo<Record<number, PlayerResult>>(() => {
    const summaries = Object.fromEntries(
      players.map((player) => [player.id, { total: 0, correct: 0, wrong: 0 }]),
    ) as Record<number, PlayerResult>;

    sessionRecords.forEach((record) => {
      const summary = summaries[record.playerId] ?? { total: 0, correct: 0, wrong: 0 };
      summary.total += 1;
      if (record.correct) {
        summary.correct += 1;
      } else {
        summary.wrong += 1;
      }
      summaries[record.playerId] = summary;
    });

    return summaries;
  }, [players, sessionRecords]);
  const correctCount = sessionRecords.filter((record) => record.correct).length;
  const wrongCount = sessionRecords.filter((record) => !record.correct).length;
  const accuracy = sessionRecords.length === 0 ? 0 : Math.round((correctCount / sessionRecords.length) * 100);
  // '구구단, 몬스터를 막아라!'만 문제 자리를 성벽·몬스터 그림으로 바꿉니다.
  // 정답을 고르고 다음 문제로 넘어가는 방식은 다른 차시와 똑같습니다.
  // 3-1 '나눗셈, 몬스터를 막아라!'도 같은 그림을 씁니다(단추는 나누는 수).
  const isCastleDefense = isCastleLesson(lesson.title);
  // 단원 맨 앞의 놀이 차시입니다. 성 지키기처럼 문제 자리를 놀이 그림이 차지합니다.
  const game = 놀이찾기(lesson);
  const isPlayScene = isCastleDefense || Boolean(game);

  // 일반 차시가 끝나면 아이마다 이번에 맞힌 수를 '지난번의 나'로 남깁니다. 다음에 같은 단원을 하면 이 기록과 겨룹니다.
  // 한 문제도 풀지 않은 아이(자리만 있던 아이)는 지난 기록을 그대로 둡니다.
  useEffect(() => {
    if (mode !== 'finished' || isPlayScene || ghostSavedRef.current) return;
    ghostSavedRef.current = true;
    const 초 = Math.max(30, Math.round((Date.now() - questStartRef.current) / 1000));
    players.forEach((player) => {
      const 결과 = playerResults[player.id];
      if (!결과 || 결과.total === 0) return;
      지난나쓰기(player.attendanceNo, `${lesson.semester}-${lesson.unitNo}`, { 맞힘: 결과.correct, 초 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  // 둘 이상이 놀이 차시를 하면 컴퓨터 라이벌 대신 같이 하는 친구들과 겨룹니다(friendRace.ts).
  // 짧은 판을 여러 번 합니다. 먼저 결승 점수를 낸 아이가 판을 이기고(👑) 모두 0점에서 다시 시작해서,
  // 한 번 뒤처진 아이도 다음 판에서 이길 수 있습니다. 1등이 바뀌면 '역전!'을 띄웁니다.
  // 놀이(단원 놀이·성 지키기)에서만 겨룹니다. 보통 차시는 저마다 수준이 달라 견주지 않습니다.
  const 겨루기 = !isMobileEntry && players.length >= 2 && isPlayScene;
  const 겨룬결승 = 결승점수(sessionDuration);
  const 겨룬맞힘 = useMemo(
    () => Object.fromEntries(players.map((player) => [player.id, playerResults[player.id]?.correct ?? 0])) as Record<number, number>,
    [players, playerResults],
  );
  const [겨룬판, set겨룬판] = useState<친구판>(새친구판);
  const 겨룬아이들 = useMemo(() => players.map((player) => player.id), [players]);
  // 바로 앞에 본 맞힌 개수입니다. 부스터였던 아이가 새로 맞혔는지 알아내는 데 씁니다.
  const 앞겨룬맞힘 = useRef(겨룬맞힘);
  useEffect(() => {
    const 앞 = 앞겨룬맞힘.current;
    앞겨룬맞힘.current = 겨룬맞힘;
    if (!겨루기 || mode !== 'playing') return;
    const 다음 = 맞힘반영(겨룬판, 겨룬아이들, 앞, 겨룬맞힘, 겨룬결승);
    if (다음 === 겨룬판) return;
    set겨룬판(다음);
    if (다음.판 !== 겨룬판.판) playGameStage();
  }, [겨룬맞힘, 겨루기, 겨룬결승, mode, 겨룬아이들, 겨룬판]);
  const 등수 = 겨루기 ? 순위매기기(겨룬판, 겨룬아이들, 겨룬맞힘) : {};
  const 부스터들 = 겨루기 && mode === 'playing' ? 겨룬아이들.filter((id) => 부스터인가(겨룬판, 겨룬아이들, 겨룬맞힘, id)) : [];
  // 순위가 오른 아이에게 '추월!'을 띄웁니다. 새 판이 시작되어 모두 0점이 된 순간은 세지 않습니다.
  const 앞등수 = useRef<{ 판: number; 등수: Record<number, number> }>({ 판: 0, 등수: {} });
  const [추월, set추월] = useState<{ id: number; n: number } | null>(null);
  const 등수열쇠 = 겨룬아이들.map((id) => 등수[id] ?? 0).join(',');
  useEffect(() => {
    const 앞 = 앞등수.current;
    앞등수.current = { 판: 겨룬판.판, 등수 };
    if (!겨루기 || mode !== 'playing' || 앞.판 !== 겨룬판.판) return;
    const 오른 = 겨룬아이들.find((id) => 앞.등수[id] !== undefined && (등수[id] ?? 0) < 앞.등수[id]);
    if (오른 !== undefined) set추월((one) => ({ id: 오른, n: (one?.n ?? 0) + 1 }));
    // 등수는 그릴 때마다 새 객체이므로 등수열쇠(글자)로 바뀜을 봅니다.
  }, [등수열쇠, 겨룬판.판]);
  const 일등들 = 겨룬아이들.filter((id) => 등수[id] === 1);
  const 선두 = 일등들.length === 1 ? 일등들[0] : null;
  const 앞선두 = useRef<number | null>(null);
  const [역전, set역전] = useState<{ id: number; n: number } | null>(null);
  useEffect(() => {
    if (선두 === null) return;
    if (앞선두.current !== null && 앞선두.current !== 선두) {
      set역전((one) => ({ id: 선두, n: (one?.n ?? 0) + 1 }));
      if (mode === 'playing') playGameStage();
    }
    앞선두.current = 선두;
  }, [선두, mode]);
  // 다시 시작하면 판도, 누가 앞섰는지도 잊습니다.
  useEffect(() => {
    if (sessionRecords.length === 0) {
      앞선두.current = null;
      set역전(null);
      set추월(null);
      set겨룬판(새친구판());
    }
  }, [sessionRecords.length]);
  const isCastleDivide = lesson.title === CASTLE_DIVIDE_TITLE;
  const CASTLE_HEARTS_MAX = 8;

  // 한 단계는 아이 한 명당 여섯 문제입니다.
  //
  // 넷이었을 때는 한 칸이 너무 빨리 찼습니다. 한 명이 두 문제씩 더
  // 맞혀야 한 칸이 차도록 여섯으로 둡니다.
  const goalStep = Math.max(6, playerCount * 6);

  // 시간이 다 되어 학습이 끝나면, 고른 경우에 교사용 분석 파일을 한 번 내려받습니다.
  // 푼 문항이 하나도 없으면 빈 파일이므로 내려받지 않습니다.
  const autoDownloadedRef = useRef(false);
  useEffect(() => {
    if (mode !== 'finished') {
      autoDownloadedRef.current = false;
      return;
    }
    if (!autoDownloadAnalysis || isMobileEntry || autoDownloadedRef.current) return;
    const 모든기록 = [...records, ...remoteRecords];
    if (모든기록.length === 0) return;
    autoDownloadedRef.current = true;
    void 부품불러오기.교사().then(({ downloadAnalysisFile }) => downloadAnalysisFile(lesson, 모든기록, [...players, ...remotePlayers], goalStep));
  }, [mode, autoDownloadAnalysis, isMobileEntry, records, remoteRecords, lesson, players, remotePlayers, goalStep]);
  const goalStage = Math.floor(correctCount / goalStep) + 1;
  const goalTarget = goalStage * goalStep;
  const goalPercent = Math.round(((correctCount % goalStep) / goalStep) * 100);
  // 방금 딱 채운 순간입니다.
  const goalJustReached = correctCount > 0 && correctCount % goalStep === 0;
  // 그 순간에 딱 한 번 울립니다. 채운 단계를 적어 두어, 같은 단계에서
  // 두 번 울리거나 다시 그려질 때마다 울리는 일이 없게 합니다.
  const celebratedStage = useRef(0);
  useEffect(() => {
    if (!goalJustReached) return;
    if (celebratedStage.current === correctCount) return;
    celebratedStage.current = correctCount;
    playGoalFanfare();
  }, [goalJustReached, correctCount]);
  const getQuestionForPlayer = (_player: Player, state: PlayerQuestionState) =>
    getPlayerQuestion(questionBanks, state);
  const fallbackStates = createQuestionState(players, undefined, checkLevel);
  const firstPlayer = players[0];
  // 문항 엔진을 받기 전에는 문제집이 비어 있으므로 없을 수 있습니다.
  const sampleQuestion: Question | undefined = firstPlayer
    ? getQuestionForPlayer(firstPlayer, playerStates[firstPlayer.id] ?? fallbackStates[firstPlayer.id])
    : questionBanks.중[0];
  const fullscreenActive = isFullscreen || fullscreenFallback;
  const mobileJoinUrl = useMemo(() => {
    const origin = mobileJoinOrigin || (isLoopbackHost() ? '' : window.location.origin);
    if (!origin) return '';
    const url = new URL(window.location.pathname || '/', `${origin}/`);
    url.searchParams.set('m', '1');
    url.searchParams.set('s', semester);
    url.searchParams.set('u', isSemesterReviewSelected ? semesterReviewUnitValue : String(selectedUnit.unitNo));
    url.searchParams.set('l', lesson.id);
    url.searchParams.set('t', String(sessionDuration));
    // 선생님이 체크박스로 고른 연동 여부를 큐알 주소에 그대로 담아 둡니다
    // — 학생 폰이 이 값을 읽어서 서버에 답을 보낼지 말지를 정합니다.
    url.searchParams.set('sync', qrSyncEnabled ? '1' : '0');
    // 무료 실시간 저장소를 쓰기로 했으면, 학생 폰이 어디로 답을 보낼지도
    // 큐알에 함께 담습니다. 이게 있어야 선생님 컴퓨터에 아무것도 깔지 않고
    // 배포된 주소 그대로 연동이 됩니다.
    if (qrSyncEnabled && relayTarget.kind === 'cloud') {
      url.searchParams.set('db', relayTarget.dbUrl);
      url.searchParams.set('room', relayTarget.room);
    }
    return url.toString();
  }, [
    isSemesterReviewSelected,
    lesson.id,
    mobileJoinOrigin,
    qrSyncEnabled,
    relayTarget,
    selectedUnit.unitNo,
    semester,
    sessionDuration,
  ]);
  const mobileJoinNeedsLanAddress = !isMobileEntry && !mobileJoinUrl;

  const copyMobileJoinUrl = async () => {
    if (!mobileJoinUrl) return;
    try {
      await navigator.clipboard.writeText(mobileJoinUrl);
      setMobileUrlCopied(true);
      window.setTimeout(() => setMobileUrlCopied(false), 1500);
    } catch {
      setMobileUrlCopied(false);
    }
  };

  // 큐알로 들어온 학생 기록을 이 화면에서도, 저장소에서도 비웁니다.
  // 지우는 사이에 오간 대답이 지운 것을 되살리지 못하도록 판 번호를
  // 앞뒤로 한 번씩 올려 둡니다.
  const clearRemoteResults = () => {
    remoteEpochRef.current += 1;
    setRemotePlayers([]);
    setRemoteRecords([]);
    void relayReset(relayTarget).then(() => {
      remoteEpochRef.current += 1;
      setRemotePlayers([]);
      setRemoteRecords([]);
    });
  };

  const saveRelayDbUrl = () => {
    const trimmed = relayDbInput.trim();
    if (!trimmed) {
      saveDbUrl('');
      setRelayDbUrl('');
      setRelayDbError('');
      return;
    }
    const normalized = normalizeDbUrl(trimmed);
    if (!normalized) {
      setRelayDbError('주소를 다시 확인해 주세요. https://... 로 시작하고 firebasedatabase.app 또는 firebaseio.com 으로 끝나야 합니다.');
      return;
    }
    saveDbUrl(normalized);
    setRelayDbUrl(normalized);
    setRelayDbInput(normalized);
    setRelayDbError('');
  };

  const updateStudentConfig = (studentId: number, nextConfig: Partial<StudentConfig>) => {
    setStudentConfigs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        attendanceNo: prev[studentId]?.attendanceNo ?? studentId,
        difficulty: prev[studentId]?.difficulty ?? '중',
        avatar: prev[studentId]?.avatar ?? avatarChoices[(studentId - 1) % avatarChoices.length],
        ...nextConfig,
      },
    }));
  };

  const selectAttendanceNumber = (studentId: number, attendanceNo: number) => {
    // 번호를 누르면 바로 준비 완료입니다. 어느 수준부터 풀지는 아이가
    // 고르는 것이 아니라, 풀어 가면서 정해집니다.
    playReadySound();
    updateStudentConfig(studentId, { attendanceNo });
    setStudentSetupSteps((prev) => ({ ...prev, [studentId]: 'ready' }));
  };

  // 캐릭터를 고릅니다. 남이 이미 고른 것은 누를 수 없게 해 두었으므로
  // 여기서는 그대로 받습니다. 같은 동물이 둘이면 아이들이 자기 자리를
  // 헷갈립니다.
  // 누르면 그 동물이 웁니다. '톡' 소리보다 이쪽이 아이에게는 훨씬
  // 신나고, 어떤 동물을 골랐는지 소리로도 남습니다.
  const selectAvatar = (studentId: number, avatar: string) => {
    playAnimalSound(avatar);
    updateStudentConfig(studentId, { avatar });
  };

  const resetStudentSetup = (studentId: number) => {
    playTapSound();
    setStudentSetupSteps((prev) => ({ ...prev, [studentId]: 'attendance' }));
  };

  const selectedAttendanceNumbers = new Set(
    players
      .filter((player) => (studentSetupSteps[player.id] ?? 'attendance') !== 'attendance')
      .map((player) => player.attendanceNo),
  );
  const readyPlayerCount = players.filter((player) => studentSetupSteps[player.id] === 'ready').length;

  const startGame = () => {
    const now = Date.now();
    setBonusUsed(0);
    setBonusFlash(0);
    setRecords([]);
    setSuccessSignals({});
    setSessionStars({});
    setLaneToasts({});
    setRuns({});
    setSessionBadges({});
    setMonsters({});
    beginQuests();
    setBankSeed(Math.floor(Math.random() * 1_000_000_000));
    setPlayerStates(createQuestionState(players, now, checkLevel));
    setRemainingSeconds(sessionDuration);
    setTeacherOpen(false);
    setMode('playing');

    if (mobileSyncEnabled) {
      // 이 폰의 학생을 서버에 새로 등록합니다. 서버가 없으면(평범한
      // 배포본) 조용히 실패하고, 이 폰은 원래처럼 혼자 풉니다.
      const solo = players[0];
      if (solo) {
        remotePlayerIdRef.current = null;
        pendingRemoteRecordsRef.current = [];
        void relayJoin(relayTarget, {
          name: solo.name,
          attendanceNo: solo.attendanceNo,
          avatar: solo.avatar,
          difficulty: solo.difficulty,
        }).then((joinedId) => {
          if (joinedId === null) return;
          remotePlayerIdRef.current = joinedId;
          // 등록이 끝나기 전에 이미 답한 문제가 있으면(빠르게 첫 문제를
          // 맞힌 경우) 여기서 한꺼번에 올려 보냅니다 — 놓치지 않습니다.
          const queued = pendingRemoteRecordsRef.current;
          pendingRemoteRecordsRef.current = [];
          for (const queuedRecord of queued) {
            void relayRecord(relayTarget, { ...queuedRecord, playerId: joinedId });
          }
        });
      }
    } else if (!isMobileEntry) {
      // 새 판이 시작되었으니, 지난 판에서 큐알로 들어왔던 학생 기록은
      // 저장소에서도 비웁니다 — 안 그러면 다음 번 받아올 때 지난 판 학생이
      // 이번 판 분석에 섞여 들어옵니다.
      clearRemoteResults();
    }
    // (연동을 끈 큐알 폰은 여기서 할 일이 없습니다 — 서버에 아무것도
    // 보내지 않고, 이 폰 혼자만의 화면으로 풉니다.)
  };

  useEffect(() => {
    if (mode !== 'setup') return;
    const allStudentsReady = players.length > 0 && players.every((player) => studentSetupSteps[player.id] === 'ready');
    if (!allStudentsReady) return;

    const timerId = window.setTimeout(() => {
      startGame();
    }, 450);

    return () => window.clearTimeout(timerId);
  }, [mode, players, studentSetupSteps]);

  const goSetup = () => {
    // 설정으로 돌아가는 것은 다른 아이들, 다른 차시로 간다는 뜻이므로
    // 그때는 기록을 비웁니다.
    setMode('setup');
    setTeacherOpen(false);
    setOpenResults({});
    setRound(1);
    setBonusUsed(0);
    setBonusFlash(0);
    setRecords([]);
    setSuccessSignals({});
    setPlayerStates(createQuestionState(players, undefined, checkLevel));
    setRemainingSeconds(sessionDuration);
    setStudentSetupSteps(createStudentSetupSteps(playerCount));
    if (!isMobileEntry) {
      // 아직 돌아오지 않은 물음의 대답이 이 비움을 되돌리지 못하게 합니다.
      remoteEpochRef.current += 1;
      setRemotePlayers([]);
      setRemoteRecords([]);
    }
    remotePlayerIdRef.current = null;
    pendingRemoteRecordsRef.current = [];
  };

  const resetSession = () => {
    // 수준을 고르는 단계가 없어졌으므로 곧바로 다시 시작합니다.
    // 다시 풀 때도 모두 하에서 출발해, 그날 컨디션에 맞게 다시 올라갑니다.
    //
    // 푼 기록은 지우지 않습니다. 같은 아이들이 같은 차시를 한 번 더 푸는
    // 것이므로, 두 번을 합쳐 보아야 그 아이가 무엇에서 거듭 걸리는지
    // 보입니다. 한 판만 보면 열 문제 남짓이라 실수인지 모르는 것인지
    // 가릴 수 없습니다.
    setTeacherOpen(false);
    setOpenResults({});
    // 열어 두었던 힌트와 자세히 보기 창을 닫습니다. 닫지 않으면 다시
    // 시작한 첫 화면에 남의 창이 열린 채로 떠서, 아이가 문제를 보기도
    // 전에 그림부터 보게 됩니다.
    setHintTextOpen({});
    setHintModalOpen({});
    setRound((value) => value + 1);
    setBonusUsed(0);
    setBonusFlash(0);
    setSuccessSignals({});
    setWrongSignals({});
    setSessionStars({});
    setLaneToasts({});
    setRuns({});
    setSessionBadges({});
    setMonsters({});
    beginQuests();
    setBankSeed(Math.floor(Math.random() * 1_000_000_000));
    setPlayerStates(createQuestionState(players, undefined, checkLevel));
    setRemainingSeconds(sessionDuration);
    setMode('playing');
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement || fullscreenFallback) {
        if (document.fullscreenElement) await document.exitFullscreen();
        setFullscreenFallback(false);
        return;
      }

      await document.documentElement.requestFullscreen();

      if (!document.fullscreenElement) {
        setFullscreenFallback(true);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setFullscreenFallback(true);
    }
  };

  const bonusCap = Math.floor(sessionDuration / 2);

  // 별이 날아가는 시간입니다. CSS의 star-fly와 같은 값이어야, 별이 시계에
  // 닿는 그 순간에 '+2초'가 뜹니다.
  const STAR_FLIGHT_MS = 700;

  // stars는 날아가는 별의 수입니다. 황금 문제나 피버 타임에는 별이 여럿 날아갑니다(붙는 시간은 같습니다).
  const addBonusTime = (fromPlayerId?: number, stars = 1) => {
    if (bonusUsed >= bonusCap) return;
    const giving = Math.min(BONUS_SECONDS, bonusCap - bonusUsed);
    // 시간은 곧바로 붙입니다. 별이 닿을 때까지 미루면, 그 사이에 시계가
    // 0이 되어 상을 못 받는 일이 생깁니다.
    setBonusUsed((value) => value + giving);
    setRemainingSeconds((value) => value + giving);

    const lane = fromPlayerId === undefined ? null : laneRefs.current[fromPlayerId];
    const timer = timerCardRef.current;
    if (!lane || !timer) {
      setBonusFlash(Date.now());
      return;
    }

    const from = lane.getBoundingClientRect();
    const to = timer.getBoundingClientRect();
    const ids = Array.from({ length: stars }, (_, at) => ({ id: Date.now() + Math.random(), spread: (at - (stars - 1) / 2) * 46 }));
    setFlyingStars((flying) => [
      ...flying,
      ...ids.map(({ id, spread }) => ({
        id,
        left: from.left + from.width / 2 + spread,
        top: from.top + 28,
        dx: to.left + to.width / 2 - (from.left + from.width / 2 + spread),
        dy: to.top + to.height / 2 - (from.top + 28),
      })),
    ]);
    window.setTimeout(() => {
      setFlyingStars((flying) => flying.filter((star) => !ids.some((one) => one.id === star.id)));
      setBonusFlash(Date.now());
    }, STAR_FLIGHT_MS);
  };

  // 새 문제로 넘어갈 때 힌트 상태를 접습니다. 열어 두었던 도움말이나
  // 조작형 힌트가 다음 문제까지 이어지면, 아직 보지도 않은 문제의
  // 그림이 열려 있는 채로 나타납니다.
  const resetHintState = (playerId: number) => {
    setHintTextOpen((prev) => ({ ...prev, [playerId]: false }));
    setHintSteps((prev) => ({ ...prev, [playerId]: 0 }));
    setHintModalOpen((prev) => ({ ...prev, [playerId]: false }));
    setHintUsedThisQuestion((prev) => ({ ...prev, [playerId]: false }));
  };

  const nextForPlayer = (player: Player) => {
    resetHintState(player.id);
    setPlayerStates((prev) => {
      const current = prev[player.id];
      if (!current) return prev;
      // 올라갔으면 그 수준의 소리를 들려 줍니다. 소리만으로도 옆자리
      // 친구가 올라간 것을 압니다.
      const moved = advancePlayerState(current, players.length, current.correct === false, questionBanks.하.length);
      if (moved.justMoved === 'up') playDifficultySound(moved.level);
      // '다음 문제'를 누르는 자리는 정답을 맞힌 뒤와 오답 도움말을 본 뒤,
      // 두 곳입니다. 오답이었으면 그 문제를 다시 낼 줄에 넣습니다.
      return { ...prev, [player.id]: moved };
    });
  };

  // 맞히면 그 자리 아이가 고른 동물이 신나 하고, 틀리면 화가 나서 으르렁거립니다(sound.ts).
  const avatarOf = (playerId: number) => players.find((one) => one.id === playerId)?.avatar ?? '';

  const triggerWrongSignal = (playerId: number) => {
    const token = Date.now();
    playAnimalAngry(avatarOf(playerId));
    setWrongSignals((prev) => ({ ...prev, [playerId]: token }));
    window.setTimeout(() => {
      setWrongSignals((prev) => {
        if (prev[playerId] !== token) return prev;
        const { [playerId]: _removed, ...rest } = prev;
        return rest;
      });
    }, 620);
  };

  const triggerSuccessSignal = (playerId: number, difficulty: Difficulty) => {
    const token = Date.now();
    playAnimalHappy(avatarOf(playerId), difficulty);
    setSuccessSignals((prev) => ({ ...prev, [playerId]: token }));
    window.setTimeout(() => {
      setSuccessSignals((prev) => {
        if (prev[playerId] !== token) return prev;
        const { [playerId]: _removed, ...rest } = prev;
        return rest;
      });
    }, successHoldMs);
  };

  // 자리 위에 잠깐 떠오르는 알림입니다. 하나가 떠 있을 때 새것이 오면 새것으로 바꿉니다.
  const LANE_TOAST_MS = 2600;
  const dropLaneToast = (playerId: number, id: number) => {
    setLaneToasts((prev) => {
      const 줄 = prev[playerId] ?? [];
      if (줄[0]?.id !== id) return prev;
      const 남은 = 줄.slice(1);
      // 다음 알림이 있으면 그것도 제 시간만큼 띄웁니다.
      if (남은[0]) window.setTimeout(() => dropLaneToast(playerId, 남은[0].id), LANE_TOAST_MS);
      return { ...prev, [playerId]: 남은 };
    });
  };
  const 단원열쇠 = `${lesson.semester}-${lesson.unitNo}`;
  // 판을 새로 시작할 때 일반 차시의 미션 기록을 비우고, 아이마다 '지난번의 나'를 불러옵니다.
  const beginQuests = () => {
    setQuests({});
    setSessionCards({});
    setGhosts(Object.fromEntries(players.map((player) => [player.id, 지난나목표(지난나읽기(player.attendanceNo, 단원열쇠), sessionDuration)])));
    questStartRef.current = Date.now();
    ghostSavedRef.current = false;
  };

  const showLaneToast = (playerId: number, look: string, text: string) => {
    const id = Date.now() + Math.random();
    setLaneToasts((prev) => {
      const 줄 = prev[playerId] ?? [];
      if (줄.length === 0) window.setTimeout(() => dropLaneToast(playerId, id), LANE_TOAST_MS);
      return { ...prev, [playerId]: [...줄, { id, look, text }] };
    });
  };

  // 맞힌 문제 하나에 별을 줍니다. 모은 별은 출석 번호마다 이 컴퓨터에 남고,
  // 별이 문턱을 넘으면 캐릭터에 새 꾸미개가 붙습니다.
  // 배지는 빠르기가 아니라 처음 해낸 일에 줍니다(rewards.ts의 배지들).
  const rewardAnswer = (
    player: Player,
    o: { correct: boolean; golden: boolean; fever: boolean; hintUsed: boolean; friendFix: boolean; retry: boolean; levelAfter: Difficulty; bonus?: number },
  ) => {
    const 장 = profileOf(player.attendanceNo);
    const 앞 = runs[player.id] ?? { fire: 0, noHint: 0 };
    const run = o.correct
      ? { fire: 앞.fire + 1, noHint: o.hintUsed ? 0 : 앞.noHint + 1 }
      : { fire: 틀린뒤불꽃(앞.fire), noHint: 0 };
    setRuns((prev) => ({ ...prev, [player.id]: run }));
    // bonus는 일반 차시의 실수 몬스터·미션·지난번의 나에서 더 받는 별입니다.
    const gain = o.correct ? 받을별(o) + (o.bonus ?? 0) : 0;
    const stars = 장.stars + gain;
    const 받은 = 새배지(
      { ...o, noHintRun: run.noHint, fireCount: run.fire, totalStars: stars },
      new Set(장.badges),
    );
    // 불꽃이 커지면 알리고, 틀려서 작아지면 '한 단계만' 줄었다고 다독입니다.
    const 앞불꽃 = 불꽃단계(앞.fire);
    const 새불꽃 = 불꽃단계(run.fire);
    if (새불꽃 > 앞불꽃) showLaneToast(player.id, '🔥', `${run.fire}연속! 불꽃이 커졌어요`);
    else if (새불꽃 < 앞불꽃 && 새불꽃 > 0) showLaneToast(player.id, '🔥', '불꽃이 조금만 작아졌어요. 다시 키워요!');
    if (gain === 0 && 받은.length === 0) return;
    const next: 기록장 = { stars, badges: [...장.badges, ...받은.map((one) => one.id)] };
    기록장쓰기(player.attendanceNo, next);
    setProfiles((prev) => ({ ...prev, [player.attendanceNo]: next }));
    if (gain) setSessionStars((prev) => ({ ...prev, [player.id]: (prev[player.id] ?? 0) + gain }));
    if (gain && !isMobileEntry) {
      const 결과 = 대왕때리기(boss, gain);
      대왕쓰기(결과.싸움);
      setBoss(결과.싸움);
      const 진 = 결과.물리친.at(-1);
      if (진) {
        const id = Date.now();
        setBossWin({ id, boss: 진 });
        playGoalFanfare();
        window.setTimeout(() => setBossWin((now) => (now?.id === id ? null : now)), 4200);
      }
    }
    if (받은.length) setSessionBadges((prev) => ({ ...prev, [player.id]: [...(prev[player.id] ?? []), ...받은.map((one) => one.id)] }));
    const 붙은 = 새로붙은(장.stars, stars).at(-1);
    if (붙은) showLaneToast(player.id, 붙은.icon, `새 꾸미개: ${붙은.name}!`);
    for (const one of 받은) showLaneToast(player.id, one.look, `배지: ${one.name}`);
  };

  // 일반 차시에서 한 문제를 답했을 때 실수 몬스터·오늘의 미션·지난번의 나를 따져 봅니다.
  // 알림을 띄우고, 더 줄 별의 수를 돌려줍니다(별은 rewardAnswer가 한꺼번에 줍니다).
  const questAnswer = (player: Player, state: PlayerQuestionState, correct: boolean, hintUsed: boolean, levelUp: boolean) => {
    const 앞 = quests[player.id] ?? { 통계: 빈통계(), 다함: false, 나이김: false };
    const 앞런 = runs[player.id] ?? { fire: 0, noHint: 0 };
    const 다시 = state.activeRetry;
    if (!correct) {
      // 틀린 문제는 몇 문제 뒤에 다시 나옵니다. 두 번째에도 틀리면 다시 나오지 않으므로 몬스터가 달아납니다.
      if ((다시?.tries ?? 1) < RETRY_LIMIT) showLaneToast(player.id, '👾', '실수 몬스터가 나타났어요! 조금 뒤에 다시 와요');
      else showLaneToast(player.id, '💨', '실수 몬스터가 달아났어요. 풀이를 꼭 읽어 봐요');
      return 0;
    }
    let bonus = 0;
    const 통계: 미션통계 = {
      맞힘: 앞.통계.맞힘 + 1,
      연속최고: Math.max(앞.통계.연속최고, 앞런.fire + 1),
      힌트없이최고: Math.max(앞.통계.힌트없이최고, hintUsed ? 0 : 앞런.noHint + 1),
      잡은몬스터: 앞.통계.잡은몬스터 + (다시 ? 1 : 0),
      올라감: 앞.통계.올라감 || levelUp,
    };
    if (다시) {
      bonus += 몬스터보너스별;
      showLaneToast(player.id, '👾', `실수 몬스터를 잡았어요! 별 +${몬스터보너스별}`);
    }
    const 미션 = 오늘미션(player.attendanceNo, lesson.id);
    for (const one of 미션) if (one.됐나(통계) && !one.됐나(앞.통계)) showLaneToast(player.id, '🎯', `미션 성공: ${one.글}`);
    const 다함 = 앞.다함 || 미션.every((one) => one.됐나(통계));
    if (다함 && !앞.다함) {
      bonus += 미션보너스별;
      showLaneToast(player.id, '🏆', `오늘의 미션 완료! 별 +${미션보너스별}`);
    }
    const 목표 = ghosts[player.id];
    const 나이김 = 앞.나이김 || (목표 != null && 통계.맞힘 > 목표);
    if (나이김 && !앞.나이김) {
      bonus += 나이김보너스별;
      showLaneToast(player.id, '👻', `지난번의 나를 이겼어요! 별 +${나이김보너스별}`);
    }
    setQuests((prev) => ({ ...prev, [player.id]: { 통계, 다함, 나이김 } }));
    // 힌트 없이 이어서 맞히면 이 차시의 개념 카드를 얻습니다. 등급은 지금 푼 문제의 수준입니다.
    if (!hintUsed && 앞런.noHint + 1 >= 카드조건) {
      const 등급 = (다시?.level ?? state.level) as 카드등급;
      const 넣음 = 카드넣기(cardsOf(player.attendanceNo), lesson.id, 등급);
      if (넣음.바뀜) {
        카드쓰기(player.attendanceNo, 넣음.모음);
        setCardBook((prev) => ({ ...prev, [player.attendanceNo]: 넣음.모음 }));
        setSessionCards((prev) => ({ ...prev, [player.id]: [...new Set([...(prev[player.id] ?? []), lesson.id])] }));
        const 모양 = 카드모양[등급];
        showLaneToast(player.id, 모양.look, `${넣음.바뀜 === 'new' ? '개념 카드 얻음' : '카드가 올랐어요'}: ${카드이름(lesson.title)} (${모양.이름})`);
      }
    }
    return bonus;
  };

  const answerQuestion = (player: Player, question: Question, choiceIndex: number, manip?: ManipResult) => {
    const state = playerStates[player.id];
    if (!state || state.locked || mode !== 'playing') return;
    if (manip) setManipTips((prev) => ({ ...prev, [player.id]: manip.ok ? '' : manip.tip ?? '' }));

    const isCorrect = choiceIndex === question.answerIndex;
    const golden = 황금문제인가({ questionId: question.id, seed: bankSeed, fusion: question.fusion, retry: state.activeRetry !== null });
    const responseMs = Date.now() - state.questionStartedAt;
    const record: AnswerRecord = {
      id: `${question.id}-${player.id}-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      questionId: question.id,
      lessonId: lesson.id,
      unitTitle: lesson.unitTitle,
      lessonTitle: lesson.title,
      difficulty: question.difficulty,
      prompt: question.prompt,
      choices: question.choices,
      answer: question.answer,
      explanation: question.explanation,
      misconception: question.misconception,
      type: question.type,
      strategy: question.strategy,
      support: question.support,
      visual: question.visual,
      correct: isCorrect,
      chosen: manip ? manip.said : question.choices[choiceIndex] ?? '',
      // 되돌아온 문제면 두 번째 이후 시도입니다.
      attempts: state.activeRetry === null ? 1 : 2,
      responseMs,
      answeredAt: new Date().toISOString(),
      hintUsed: hintUsedThisQuestion[player.id] ?? false,
      ...(isCorrect
        ? {}
        : manip
          ? (manip.tip ? { chosenMeaning: manip.tip } : {})
          : (() => {
            const meaning = meaningOfChoice(
              question.prompt,
              question.choices[choiceIndex] ?? '',
              question.answer,
            );
            return meaning ? { chosenMeaning: meaning } : {};
          })()),
    };

    if (isCorrect && !isPlayScene) {
      // 단원 몬스터가 한 대 맞습니다. 세 대를 맞으면 쓰러지고 다음 몬스터가 나옵니다.
      const 앞몬스터 = monsters[player.id] ?? { hits: 0, defeated: 0 };
      const 쓰러짐 = 앞몬스터.hits + 1 >= MONSTER_HP;
      setMonsters((prev) => ({
        ...prev,
        [player.id]: 쓰러짐 ? { hits: 0, defeated: 앞몬스터.defeated + 1 } : { ...앞몬스터, hits: 앞몬스터.hits + 1 },
      }));
      if (쓰러짐) {
        const 몬스터 = 단원몬스터찾기(lesson.tags[0] ?? question.type);
        showLaneToast(player.id, 몬스터.look, `${몬스터.name}를 쓰러뜨렸어요!`);
      }
    }
    if (isCorrect) {
      triggerSuccessSignal(player.id, question.difficulty);
      addBonusTime(player.id, (golden ? 2 : 1) + (feverOn ? 1 : 0));
    } else {
      triggerWrongSignal(player.id);
    }

    const hintUsed = Boolean(hintUsedThisQuestion[player.id] || hintTextOpen[player.id]);
    const 맞힌뒤 = isCorrect ? advancePlayerState(state, players.length, false, questionBanks.하.length) : null;
    const bonus = isPlayScene ? 0 : questAnswer(player, state, isCorrect, hintUsed, 맞힌뒤?.justMoved === 'up');
    rewardAnswer(player, {
      correct: isCorrect,
      golden,
      fever: feverOn,
      hintUsed,
      friendFix: Boolean(question.manipulate?.friend),
      retry: state.activeRetry !== null,
      levelAfter: 맞힌뒤?.level ?? state.level,
      bonus,
    });
    setRecords((prev) => [...prev, record]);
    // 큐알로 들어온 폰은 선생님 화면과 다른 기기입니다. 로컬 상태만으로는
    // 선생님이 볼 수 없으므로 연결된 곳에도 올려 둡니다. 연결할 곳이 없는
    // 보통 배포본에서는 조용히 실패하고 넘어갑니다.
    if (mobileSyncEnabled) {
      if (remotePlayerIdRef.current !== null) {
        void relayRecord(relayTarget, { ...record, playerId: remotePlayerIdRef.current });
      } else {
        // 등록이 아직 끝나지 않았습니다 — 첫 문제를 아주 빠르게 맞히면
        // 이 순간이 생길 수 있습니다. 잃어버리지 않도록 담아 두었다가
        // 등록이 끝나는 대로 마저 올려 보냅니다.
        pendingRemoteRecordsRef.current.push(record);
      }
    }
    if (isCorrect) {
      // 맞히면 바로 다음 문제로 넘어가므로, 여기서 곧장 힌트 상태를 접습니다.
      resetHintState(player.id);
    }
    setPlayerStates((prev) => {
      const currentState = prev[player.id] ?? state;

      if (isCorrect) {
        return {
          ...prev,
          [player.id]: advancePlayerState(currentState, players.length, false, questionBanks.하.length),
        };
      }

      return {
        ...prev,
        [player.id]: {
          ...currentState,
          selected: choiceIndex,
          correct: false,
          locked: true,
          responseMs,
          feedback: 'explain',
        },
      };
    });
  };

  const renderSetup = () => (
    <section className="setup-screen">
      {/* QR로 들어온 학생은 선생님이 정한 차시·시간으로 혼자 풉니다. 고를 것이 없으므로
          안내·차시·인원·시간 칸은 모두 빼고, 동물과 출석번호만 고르면 바로 시작합니다. */}
      {!isMobileEntry && (
      <section className="board-setup" aria-labelledby="board-setup-title">
        {/* 선생님이 고르는 곳은 화면 위쪽에 가로로 모읍니다. 전자칠판 앞의 2학년은 키가 작아
            위쪽에 손이 닿지 않으므로, 학생이 누르는 자리 카드는 아래 절반에 둡니다. */}
        <div className="board-setup-head">
          <h2 id="board-setup-title">오늘 놀이판 차리기</h2>
          <span>선생님이 고르는 곳</span>
        </div>
        <div className="board-setup-cols">
          <div className="board-setup-col wide">
            <div className="board-field">
              <span className="board-label">학년과 학기</span>
              <div className="board-chips">
                {[1, 2, 3, 4, 5, 6].map((grade) => {
                  const on = semester.startsWith(`${grade}-`);
                  return (
                    <button type="button" key={grade} className={`board-chip ${on ? 'on' : ''}`.trim()} aria-pressed={on}
                      onClick={() => setSemester(`${grade}-${semester.endsWith('2') ? 2 : 1}` as Unit['semester'])}>
                      {grade}학년
                    </button>
                  );
                })}
                <span className="board-chip-gap" />
                {[1, 2].map((term) => {
                  const on = semester.endsWith(`-${term}`);
                  return (
                    <button type="button" key={term} className={`board-chip ${on ? 'on' : ''}`.trim()} aria-pressed={on}
                      onClick={() => setSemester(`${semester.split('-')[0]}-${term}` as Unit['semester'])}>
                      {term}학기
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="board-field">
              <span className="board-label">단원</span>
              <div className="board-units">
                {semesterUnits.map((unit) => {
                  const on = !isSemesterReviewSelected && selectedUnit.unitNo === unit.unitNo;
                  return (
                    <button type="button" key={unit.title} className={`board-chip unit ${on ? 'on' : ''}`.trim()} aria-pressed={on}
                      onClick={() => {
                        setUnitSelection(unit.unitNo);
                        setLessonId(unit.lessons[0].id);
                      }}>
                      <span className="board-unit-no">{unit.unitNo}</span>
                      <span className="board-unit-title">{unit.title}</span>
                    </button>
                  );
                })}
                <button type="button" className={`board-chip unit ${isSemesterReviewSelected ? 'on' : ''}`.trim()} aria-pressed={isSemesterReviewSelected}
                  onClick={() => {
                    setUnitSelection(semesterReviewUnitValue);
                    setLessonId(semesterReviewId);
                  }}>
                  <span className="board-unit-no">✓</span>
                  <span className="board-unit-title">학기 종합</span>
                </button>
              </div>
            </div>
          </div>

          <div className="board-setup-col">
            <label className="board-field">
              <span className="board-label">차시</span>
              {isSemesterReviewSelected ? (
                <select className="board-select" value={semesterReviewId} disabled>
                  <option value={semesterReviewId}>학기 종합 · {semester} 전체</option>
                </select>
              ) : (
                <select className="board-select" value={lesson.id} onChange={(event) => setLessonId(event.target.value)}>
                  {selectedUnit.lessons.map((item) => (
                    <option value={item.id} key={item.id}>{놀이차시인가(item) ? '놀이' : `${item.lessonNo}차시`} · {item.title}</option>
                  ))}
                  <option value={unitReviewId}>단원 종합 · {selectedUnit.title} 전체</option>
                </select>
              )}
            </label>
            <div className="board-field">
              <span className="board-label">놀이 시간</span>
              <div className="board-chips even six">
                {durations.map((duration) => (
                  <button type="button" key={duration} className={`board-chip ${sessionDuration === duration ? 'on' : ''}`.trim()}
                    aria-pressed={sessionDuration === duration} onClick={() => setSessionDuration(duration)}>
                    {durationLabel(duration)}
                  </button>
                ))}
              </div>
              <span className="board-hint">
                {isPlayScene
                  ? `${sessionDuration <= 120 ? '짧은 수업: ' : ''}${playerCount >= 2 ? '친구들' : '라이벌'}과 먼저 ${결승점수(sessionDuration)}점 내기예요.${playerCount >= 2 ? ' 판마다 1등에게 👑!' : ''}`
                  : lesson.objective}
              </span>
            </div>
            {isCastleDefense && (
            <div className="castle-dan-row">
              <span className="castle-dan-label">{isCastleDivide ? '나누는 수' : '구구단'}</span>
              <div className="castle-dan-options" role="group" aria-label={isCastleDivide ? '출제할 나누는 수' : '출제할 구구단'}>
                {ALL_CASTLE_DEFENSE_DANS.map((dan) => (
                  <button
                    type="button"
                    className={castleDans.includes(dan) ? 'active' : ''}
                    key={dan}
                    onClick={() => toggleCastleDan(dan)}
                    aria-pressed={castleDans.includes(dan)}
                  >
                    {isCastleDivide ? `÷${dan}` : `${dan}단`}
                  </button>
                ))}
                <button
                  type="button"
                  className={castleDans.length === ALL_CASTLE_DEFENSE_DANS.length ? 'active' : ''}
                  onClick={toggleAllCastleDans}
                  aria-pressed={castleDans.length === ALL_CASTLE_DEFENSE_DANS.length}
                >
                  전체
                </button>
              </div>
            </div>
          )}
          </div>

          <div className="board-setup-col">
            <div className="board-field">
              <span className="board-label">함께 하는 학생</span>
              <div className="board-chips even five">
                {[1, 2, 3, 4, 5].map((count) => (
                  <button type="button" key={count} className={`board-chip ${playerCount === count ? 'on' : ''}`.trim()}
                    aria-pressed={playerCount === count} onClick={() => setPlayerCount(count)}>
                    {count}명
                  </button>
                ))}
              </div>
            </div>
            {/* 문제의 '민준, 서연' 자리에 아이의 동물 친구나 우리 반 이름을 넣습니다. */}
            <div className="board-field">
              <span className="board-label">문제 속 주인공</span>
              <div className="board-chips even three" role="group" aria-label="문제 속 주인공">
                {([['off', '그대로'], ['animals', '동물 친구'], ['class', '우리 반 이름']] as const).map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={`board-chip ${nameMode === value ? 'on' : ''}`.trim()}
                    aria-pressed={nameMode === value}
                    onClick={() => {
                      setNameMode(value);
                      방식쓰기(value);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {nameMode === 'class' && (
              <label className="name-roster">
                <input
                  type="text"
                  value={roster}
                  placeholder="출석 번호 차례로 쉼표로 적기: 김민준, 이서연, 박하은 (이 컴퓨터에만 저장)"
                  onChange={(event) => {
                    setRoster(event.target.value);
                    명단쓰기(event.target.value);
                  }}
                />
                <small>{Object.keys(rosterNames).length}명</small>
              </label>
            )}
            {/* 별과 꾸미개, 배지는 출석 번호마다 이 컴퓨터에 남습니다. 새 반을 맡으면 지웁니다. */}
            <div className="board-setup-foot">
              <label className="auto-download-option">
                <input
                  type="checkbox"
                  checked={autoDownloadAnalysis}
                  onChange={(event) => toggleAutoDownloadAnalysis(event.target.checked)}
                />
                <span>끝나면 분석 파일 내려받기</span>
              </label>
              <button
                type="button"
                className="board-link-button"
                onClick={() => {
                  if (!window.confirm('이 컴퓨터에 모아 둔 별·꾸미개·배지·개념 카드와 지난번 기록을 모든 번호에서 지울까요?')) return;
                  기록장모두지우기();
                  지난나모두지우기();
                  카드모두지우기();
                  setCardBook({});
                  setProfiles({});
                }}
              >
                별·배지 기록 지우기
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      <section
        className="setup-playfield playfield"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,.93), rgba(0,0,0,.88)), url(./assets/math-adventure-bg.webp)',
        }}
      >
        {isMobileEntry ? (
          <div className="setup-progress">
            <span><Users size={16} /> 내 준비 {readyPlayerCount} / 1</span>
            <span>번호를 누르면 자동 시작</span>
          </div>
        ) : (
          <div className="board-seats-head">
            <div>
              <h2>출석번호를 눌러요</h2>
              <span>학생이 누르는 곳 · 모두 고르면 바로 시작해요</span>
            </div>
            <div className="board-ready" role="status"><b>{readyPlayerCount} / {playerCount}</b> 준비됨</div>
          </div>
        )}

        <div
          className={`player-lanes individual setup-lanes seats-${Math.min(playerCount, 5)}`}
          style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 5)}, minmax(${isMobileEntry ? (playerCount >= 5 ? 220 : playerCount >= 4 ? 240 : 280) : 0}px, 1fr))` }}
        >
          {players.map((player) => {
            const step = studentSetupSteps[player.id] ?? 'attendance';
            const config = studentConfigs[player.id] ?? { attendanceNo: player.id, difficulty: '중' as Difficulty, avatar: player.avatar };

            return (
              <article
                className={`player-lane setup-player-lane ${step}`}
                key={player.id}
                style={laneStyleFor(player.id)}
              >
                <header>
                  {/* 번호를 고르면 그 번호로 모아 둔 꾸미개가 붙어 나옵니다. */}
                  <PlayerAvatar player={player} stars={step === 'attendance' ? undefined : profileOf(config.attendanceNo).stars} />
                  <strong>{player.id}번 자리</strong>
                  <small>{step === 'attendance' ? '번호 선택' : `${config.attendanceNo}번 · 준비 완료`}</small>
                </header>

                {step === 'attendance' && (
                  <div className="setup-step-card">
                    {/* 캐릭터를 먼저 고릅니다. 번호를 누르면 바로 시작되므로
                        캐릭터가 번호보다 앞에 있어야 고를 틈이 있습니다.
                        '캐릭터'라는 딱지는 붙이지 않습니다 — 자리 이름과
                        겹쳐 찍혔고, 무엇을 고르는 자리인지는 그림이 말합니다. */}
                    <div className="avatar-pad" role="group" aria-label={`${player.id}번 자리 캐릭터 선택`}>
                      {avatarChoices.map((avatar) => {
                        const takenByOther = players.some(
                          (other) => other.id !== player.id && other.avatar === avatar,
                        );
                        return (
                          <button
                            type="button"
                            key={avatar}
                            className={config.avatar === avatar ? 'chosen' : ''}
                            disabled={takenByOther}
                            aria-pressed={config.avatar === avatar}
                            aria-label={takenByOther ? `${avatar} 이미 다른 자리에서 고름` : avatar}
                            onClick={() => selectAvatar(player.id, avatar)}
                          >
                            {avatar}
                          </button>
                        );
                      })}
                    </div>

                    <span className="result-kicker">준비</span>
                    <strong>출석번호를 누르세요</strong>
                    <div className="attendance-number-pad" aria-label={`${player.id}번 자리 출석번호 선택`}>
                      {attendanceNumbers.map((number) => {
                        const isReservedByOther =
                          selectedAttendanceNumbers.has(number) &&
                          players.some((otherPlayer) => otherPlayer.id !== player.id && otherPlayer.attendanceNo === number);
                        return (
                          <button
                            type="button"
                            key={number}
                            disabled={isReservedByOther}
                            onClick={() => selectAttendanceNumber(player.id, number)}
                          >
                            {number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 'ready' && (
                  <div className="setup-ready-card">
                    <CheckCircle2 size={30} />
                    <strong><span className="ready-avatar">{config.avatar}</span> {config.attendanceNo}번</strong>
                    <span>준비 완료</span>
                    <button className="secondary-button" type="button" onClick={() => resetStudentSetup(player.id)}>
                      다시 선택
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {!isMobileEntry && mobileJoinOpen && (
        <div className="mobile-join-overlay" role="dialog" aria-modal="true" aria-label="모바일 참여 QR">
          <section className="mobile-join-card">
            <header>
              <div>
                <p className="eyebrow">개인 모바일 참여</p>
                <h3>휴대폰 1인용 QR</h3>
              </div>
              <button className="icon-button" type="button" onClick={() => setMobileJoinOpen(false)} aria-label="모바일 QR 닫기">
                <XCircle size={21} />
              </button>
            </header>
            <label className="mobile-join-sync-toggle">
              <input
                type="checkbox"
                checked={qrSyncEnabled}
                onChange={(event) => setQrSyncEnabled(event.target.checked)}
              />
              <span>평가 결과를 선생님 화면과 연동하기</span>
            </label>
            <p className="mobile-join-sync-hint">
              {qrSyncEnabled
                ? '체크하면 이 QR로 들어온 학생의 풀이 결과가 선생님 분석 화면에 함께 보입니다.'
                : '체크를 끄면 이 QR로 들어온 학생은 선생님 화면과 연동되지 않고 혼자 풉니다.'}
            </p>
            {qrSyncEnabled && relayAvailable === false && (
              <p className="mobile-join-warning">
                지금은 연동할 곳에 닿지 않습니다. 인터넷 연결을 확인해 주세요. 학교에서 따로 쓰는
                저장소가 있으면 아래에서 주소를 넣어 두셔도 됩니다.
              </p>
            )}
            {qrSyncEnabled && relayAvailable === true && (
              <p className="mobile-join-sync-ok">
                연동 준비가 되었습니다 — 이 QR로 들어온 학생 결과가 아래 &lsquo;결과 보기&rsquo;에 쌓입니다.
                {relayTarget.kind === 'cloud' && ` (우리 반 방 이름 ${relayTarget.room})`}
              </p>
            )}
            {/* 큐알로만 수업할 때는 선생님이 자기 수업을 시작하지 않습니다.
                그래서 이 창 안에서 바로 몇 명이 들어와 얼마나 풀었는지 보이고,
                분석 화면도 여기서 열 수 있어야 합니다. */}
            {qrSyncEnabled && relayTarget.kind === 'cloud' && (
              <div className="relay-live">
                <span className="relay-live-count">
                  지금까지 학생 <strong>{remotePlayers.length}명</strong> · 푼 문제{' '}
                  <strong>{remoteRecords.length}개</strong>
                </span>
                <div className="relay-live-actions">
                  <button type="button" onClick={() => setTeacherOpen(true)}>
                    <BarChart3 size={16} />
                    결과 보기
                  </button>
                  <button
                    type="button"
                    className="relay-live-clear"
                    onClick={clearRemoteResults}
                    disabled={remotePlayers.length === 0 && remoteRecords.length === 0}
                  >
                    결과 지우기
                  </button>
                </div>
              </div>
            )}
            {qrSyncEnabled && !isMobileEntry && (
              <div className="relay-setup">
                {/* 보통은 아무 설정도 필요 없으므로 작게 접어 둡니다.
                    학교가 자기 저장소를 쓰고 싶을 때만 펼치면 됩니다. */}
                <button
                  className="relay-setup-toggle"
                  type="button"
                  onClick={() => setRelaySetupOpen((prev) => !prev)}
                >
                  {relaySetupOpen ? '저장소 설정 접기' : '학교 저장소 따로 쓰기'}
                </button>
                {(relaySetupOpen || relayAvailable === false) && (
                  <div className="relay-setup-body">
                    <p>
                      보통은 이 설정을 하지 않아도 연동됩니다. 학교에서 기록을 자기 저장소에만
                      두고 싶을 때만 아래대로 한 번 만들어 넣으시면 됩니다.
                    </p>
                    <ol>
                      <li>console.firebase.google.com 에 접속해 프로젝트를 하나 만듭니다.</li>
                      <li>왼쪽 메뉴 &lsquo;빌드 &gt; Realtime Database&rsquo;에서 데이터베이스를 만듭니다(위치는 아무 곳이나 괜찮습니다).</li>
                      <li>
                        &lsquo;규칙&rsquo; 탭에서 아래 내용을 그대로 붙여 넣고 게시합니다.
                        <code className="relay-setup-rules">
                          {'{ "rules": { "rooms": { "$room": { ".read": true, ".write": true } } } }'}
                        </code>
                        <span className="relay-setup-note">
                          $room 이 있어야 방 이름을 아는 사람만 그 방을 볼 수 있습니다. 이게 빠지면
                          주소만 알아도 모든 학급 기록이 한 번에 열립니다.
                        </span>
                      </li>
                      <li>&lsquo;데이터&rsquo; 탭 위쪽에 보이는 https://... 주소를 그대로 아래 칸에 붙여 넣습니다.</li>
                    </ol>
                    <div className="relay-setup-input">
                      <input
                        type="url"
                        inputMode="url"
                        placeholder="https://내프로젝트-default-rtdb.firebasedatabase.app"
                        value={relayDbInput}
                        onChange={(event) => setRelayDbInput(event.target.value)}
                      />
                      <button type="button" onClick={saveRelayDbUrl}>
                        저장
                      </button>
                    </div>
                    {relayDbError && <p className="relay-setup-error">{relayDbError}</p>}
                    <p className="relay-setup-note">
                      이 주소를 아는 사람은 저장된 기록을 볼 수 있으니, 학생 이름은 번호나 별명으로
                      두는 편이 좋습니다. 기록은 새 판을 시작할 때마다 지워집니다.
                    </p>
                  </div>
                )}
              </div>
            )}
            {mobileJoinUrl ? (
              <>
                <ClassroomQrCode value={mobileJoinUrl} />
                <div className="mobile-join-url">
                  <span>{mobileJoinUrl}</span>
                  <button type="button" onClick={copyMobileJoinUrl}>
                    <Copy size={16} />
                    {mobileUrlCopied ? '복사됨' : '주소 복사'}
                  </button>
                </div>
              </>
            ) : (
              <div className="mobile-join-blocked">
                <Smartphone size={42} />
                <strong>휴대폰 주소 준비가 필요해요</strong>
                <span>인터넷 주소를 만드는 중입니다. 실행 창을 닫지 말고 잠시 기다리면 QR이 자동으로 준비됩니다.</span>
              </div>
            )}
            {mobileJoinNeedsLanAddress && (
              <p className="mobile-join-warning">
                인터넷 화면이 새로 열리면 그 화면에서 QR을 보여 주세요. 같은 와이파이용으로 쓸 때는 start-local.cmd를 실행하세요.
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );

  // 차시 정보와 도구는 제목 줄 안으로 들어갑니다. 따로 한 줄을 쓰면
  // 그만큼 아래 문제 자리가 줄어듭니다.
  const renderLessonBar = () => (
    <section className="game-topbar">
      <div>
        {!isMobileEntry && <p className="eyebrow">{lessonContextLabel}</p>}
        <h2>{lessonHeading}</h2>
        {!isMobileEntry && <p className="lesson-objective-inline">{lesson.objective}</p>}
      </div>
      <div className="game-topbar-actions">
          <div className={`timer-cluster ${mode === 'playing' && remainingSeconds <= 10 ? 'urgent' : ''}`}>
            {!isMobileEntry && <SandTimer remaining={remainingSeconds} total={sessionDuration + bonusCap} />}
            <div
              ref={timerCardRef}
              className={`timer-card ${mode === 'playing' && remainingSeconds <= 10 ? 'urgent' : ''}`}
            >
              <Timer size={22} />
              <strong>{remainingSeconds}초</strong>
              {/* 방금 붙은 시간입니다. 맞혀서 늘어났다는 것이 보여야
                  시계가 상으로 읽힙니다. */}
              {bonusFlash > 0 && <span className="timer-bonus" key={bonusFlash}>+{BONUS_SECONDS}초</span>}
            </div>
          </div>
          {!isMobileEntry && (
            <button className="teacher-button" type="button" onClick={() => setTeacherOpen(true)}>
              <MonitorUp size={19} />
              교사용 분석
            </button>
          )}
        </div>
    </section>
  );

  // 맞힌 자리에서 시계로 날아가는 별입니다. 화면 어디에나 떠야 하므로
  // 자리 계산을 화면 기준(fixed)으로 하고 문서 맨 위에 얹습니다.
  const renderFlyingStars = () =>
    flyingStars.map((star) => (
      <span
        key={star.id}
        className="bonus-star"
        aria-hidden="true"
        style={
          {
            left: star.left,
            top: star.top,
            '--star-dx': `${star.dx}px`,
            '--star-dy': `${star.dy}px`,
          } as CSSProperties
        }
      >
        ⭐
      </span>
    ));

  // 문항 엔진이나 수업 부품을 다 받기 전에 수업을 시작하면 잠깐 이 화면이 보입니다.
  const 준비화면 = (
    <section className="engine-loading" role="status" aria-live="polite">
      <span aria-hidden="true">⚽</span>
      <strong>문제를 준비하고 있어요…</strong>
    </section>
  );
  const renderGame = () => (
    <>
      {renderFlyingStars()}
      {/* 휴대폰으로 푸는 학생은 그 차시 문제만 풀면 됩니다. 설정·기록 줄은 빼고,
          시간이 끝났을 때만 '다시 풀기'를 둡니다. */}
      {isMobileEntry ? (
        mode === 'finished' && (
          <footer className="command-bar finished-actions mobile-actions">
            <button className="primary-button" type="button" onClick={resetSession}>
              <RefreshCcw size={18} />
              다시 풀기
            </button>
          </footer>
        )
      ) : (
      <footer className={`command-bar ${mode === 'finished' ? 'finished-actions' : ''}`}>
        <button className="secondary-button" type="button" onClick={goSetup}>
          <Home size={18} />
          {mode === 'finished' ? '처음' : '설정으로'}
        </button>
        <div className="command-status">
          <span>풀이 기록 {records.length}개</span>
          {round > 1 && <span>{round}판째 · 기록 이어짐</span>}
          <span>{durationLabel(sessionDuration)} 수업</span>
          <span>{mode === 'finished' ? '시간 종료' : '진행 중'}</span>
        </div>

        {/* 맞힌 수는 이 줄에 함께 섭니다. 따로 한 줄을 쓰면 그만큼 아래
            문제 자리가 줄어듭니다. */}
        <div className="round-status">
          <span><BarChart3 size={16} /> 정답률 {accuracy}%</span>
          <span>정답 {correctCount}개</span>
          <span>오답 {wrongCount}개</span>
          {reviewScope !== 'lesson' && <span>{scopedLessons.length}개 차시 랜덤</span>}
        </div>

        <button className="primary-button" type="button" onClick={resetSession}>
          <RefreshCcw size={18} />
          {mode === 'finished' ? '다시 풀기' : '다시 시작'}
        </button>
      </footer>
      )}

      {/* 우리 반이 함께 채우는 길입니다. 아이는 자기 칸만 보게 되어 있어서,
          서른 문제가 '혼자 푸는 서른 개'로 끝납니다. 등수가 아니라 합계라
          늦게 푸는 아이도 채우는 데 낍니다.
          교실 뒤에서도 보여야 함께 채우는 맛이 나므로 제 줄을 씁니다.
          로켓이 나아가고 별에 불이 들어옵니다 — 얼마나 왔는지가 수보다
          그림으로 먼저 읽혀야 2학년이 다음 문제를 풀고 싶어집니다. */}
      {!isMobileEntry && (
      <div className={`class-goal ${goalJustReached ? 'reached' : ''}`} aria-live="polite">
        <strong className="class-goal-count">
          <span className="class-goal-badge">🏁</span>
          우리 반 {correctCount}개
        </strong>
        <div className="class-goal-track">
          <div className="class-goal-fill" style={{ width: `${goalPercent}%` }}>
            <span className="class-goal-sparks" aria-hidden="true">
              <i /><i /><i />
            </span>
          </div>
          {[25, 50, 75].map((mark) => (
            <span
              key={mark}
              className={`class-goal-mark ${goalPercent >= mark ? 'lit' : ''}`}
              style={{ left: `${mark}%` }}
              aria-hidden="true"
            >
              ⭐
            </span>
          ))}
          {/* 목표를 이룰 때마다 다른 것이 달립니다 — 기차, 비행기, 로켓,
              우주선, 외계인, 사람. 무엇이 나올지가 다음 목표를 채울
              까닭이 됩니다. */}
          <span className="class-goal-runner" style={{ left: `${goalPercent}%` }}>
            <GoalRunner stage={goalStage} />
          </span>
          {/* 선물은 다 와 가면 흔들리고, 닿으면 열립니다. */}
          <span className={`class-goal-prize ${goalJustReached ? 'open' : goalPercent >= 92 ? 'near' : ''}`} aria-hidden="true">
            {goalJustReached ? '🎉' : '🎁'}
          </span>
          {goalJustReached && (
            <span className="class-goal-confetti" aria-hidden="true">
              <i>✨</i><i>🎊</i><i>⭐</i><i>✨</i><i>🎈</i><i>⭐</i>
            </span>
          )}
        </div>
        <small>
          {goalJustReached
            ? `목표 달성! 다음은 ${runnerNameFor(goalStage)} 🎉`
            : `${goalStage}단계 · 다음 목표 ${goalTarget}개`}
        </small>
        {/* 우리 반이 모은 별로 물리치는 몬스터 대왕입니다. 이 판만이 아니라 지난 시간의 별도 쌓여 있습니다. */}
        {!isMobileEntry && (() => {
          const 대왕지금 = 지금대왕(boss);
          const 남은힘 = Math.max(0, 대왕지금.hp - boss.damage);
          return (
            <div className="class-boss" aria-label={`${대왕지금.name}의 남은 힘 ${남은힘}`}>
              <span className="class-boss-face" key={boss.damage} aria-hidden="true">{대왕지금.look}</span>
              <div className="class-boss-info">
                <span>{대왕지금.name}</span>
                <div className="class-boss-hp" aria-hidden="true">
                  <div style={{ width: `${Math.round((남은힘 / 대왕지금.hp) * 100)}%` }} />
                </div>
              </div>
              <strong>남은 ⭐{남은힘}</strong>
            </div>
          );
        })()}
      </div>
      )}
      {bossWin && (
        <div className="boss-win" key={bossWin.id} aria-live="assertive">
          <span aria-hidden="true">{bossWin.boss.look}💥</span>
          <strong>우리 반이 {bossWin.boss.name}을 물리쳤어요!</strong>
          <small>모두가 모은 별 덕분이에요 🎉</small>
        </div>
      )}

      {feverOn && mode === 'playing' && (
        <div className="fever-banner" aria-live="polite">
          <span aria-hidden="true">🔥</span>
          <strong>피버 타임!</strong>
          <span>맞히면 별 +1</span>
        </div>
      )}
      {/* 한 판이 끝난 순간입니다. 모두가 보도록 놀이판 가운데에 잠깐 띄웁니다. */}
      {겨루기 && mode === 'playing' && 겨룬판.판 > 0 && (
        <div className="friend-round-banner" key={`round-${겨룬판.판}`} aria-live="polite">
          <b>🏁 {players.filter((player) => 겨룬판.승자.includes(player.id)).map((player) => `${player.avatar} ${player.name}`).join(', ')} 먼저 {겨룬결승}점!</b>
          <small>👑 {겨룬판.판}판 끝 · 모두 0점에서 다시 출발!</small>
        </div>
      )}
      {겨루기 && mode === 'playing' && (
        <FriendRaceBoard
          말들={players.map((player) => ({
            id: player.id,
            avatar: player.avatar,
            name: player.name,
            점수: 판점수(겨룬판, 겨룬맞힘, player.id),
            등수: 등수[player.id] ?? 1,
            이긴판: 겨룬판.승[player.id] ?? 0,
            부스터: 부스터들.includes(player.id),
            style: laneStyleFor(player.id),
          }))}
          결승={겨룬결승}
          판={겨룬판.판 + 1}
          선두={선두}
          추월={추월}
        />
      )}
      <section className={`game-layout individual players-${playerCount} ${feverOn && mode === 'playing' ? 'fever' : ''}`}>
        <section className="playfield" style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,.93), rgba(0,0,0,.88)), url(./assets/math-adventure-bg.webp)' }}>
          <div
            className="player-lanes individual"
            style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 5)}, minmax(${playerCount >= 5 ? 180 : playerCount >= 4 ? 210 : 260}px, 1fr))` }}
          >
            {players.map((player) => {
              const state = playerStates[player.id] ?? fallbackStates[player.id];
              const playerQuestions = questionBanks[state.activeRetry?.level ?? state.level];
              const question = 주인공바꾸기(getPlayerQuestion(questionBanks, state), heroOf(player), friendNamesFor(player));
              const result = playerResults[player.id] ?? { total: 0, correct: 0, wrong: 0 };
              const successActive = Boolean(successSignals[player.id]);
              const wrongActive = Boolean(wrongSignals[player.id]);
              const golden = mode === 'playing' && 황금문제인가({ questionId: question.id, seed: bankSeed, fusion: question.fusion, retry: state.activeRetry !== null });
              return (
                <article
                  className={`player-lane student-question ${mode === 'finished' ? 'finished-result' : state.feedback} ${successActive ? 'success-signal' : ''} ${wrongActive ? 'wrong-signal' : ''} ${mode === 'playing' && 불꽃단계(runs[player.id]?.fire ?? 0) ? `lane-fire-${불꽃단계(runs[player.id]?.fire ?? 0)}` : ''} ${golden ? 'golden-question' : ''}`}
                  key={player.id}
                  ref={(node) => {
                    laneRefs.current[player.id] = node;
                  }}
                  style={laneStyleFor(player.id)}
                >
                  <header className={`lane-head ${차림새(profileOf(player.attendanceNo).stars).bg?.look ?? ''}`.trim()}>
                    <PlayerAvatar player={player} active={successActive} stars={profileOf(player.attendanceNo).stars} fire={mode === 'playing' ? 불꽃단계(runs[player.id]?.fire ?? 0) : 0} />
                    <strong>{player.name}</strong>
                    {겨루기 && mode === 'playing' && (() => {
                      const 내등수 = 등수[player.id] ?? 1;
                      const 이번판 = 판점수(겨룬판, 겨룬맞힘, player.id);
                      const 이긴판 = 겨룬판.승[player.id] ?? 0;
                      const 모양 = 내등수 > 1 ? 'chase' : 선두 === player.id ? 'lead' : 'tie';
                      return (
                        <span className={`versus-chip ${모양}`} key={`vs-${내등수}-${이번판}`} aria-label={`${내등수}등, 이번 판 ${이번판}점, 이긴 판 ${이긴판}`}>
                          {모양 === 'tie' ? '⚔️ 공동 1등' : 등수표시(내등수)} {이번판}/{겨룬결승}
                          {이긴판 > 0 && <small> 👑{이긴판}</small>}
                        </span>
                      );
                    })()}
                    {mode === 'playing' && 불꽃단계(runs[player.id]?.fire ?? 0) > 0 && (
                      <span className={`fire-chip fire-${불꽃단계(runs[player.id]?.fire ?? 0)}`} aria-label={`${runs[player.id]?.fire}문제 연속 정답`}>
                        🔥 {runs[player.id]?.fire}
                      </span>
                    )}
                    <span className="lane-stars" aria-label={`모은 별 ${profileOf(player.attendanceNo).stars}개`}>⭐ {profileOf(player.attendanceNo).stars}</span>
                    <small>{state.level} · {formatMs(state.responseMs)}</small>
                  </header>
                  {/* 일반 차시의 게임 요소입니다: 오늘의 미션 셋, 실수 몬스터 수, 지난번의 나. */}
                  {!isPlayScene && mode === 'playing' && (() => {
                    const 퀘 = quests[player.id] ?? { 통계: 빈통계(), 다함: false, 나이김: false };
                    const 몬스터수 = state.retries.length + (state.activeRetry || state.feedback === 'explain' ? 1 : 0);
                    const 목표 = ghosts[player.id];
                    return (
                      <div className={`quest-row ${퀘.다함 ? 'all-done' : ''}`.trim()}>
                        {오늘미션(player.attendanceNo, lesson.id).map((one) => {
                          const 됨 = one.됐나(퀘.통계);
                          return (
                            <span key={one.id} className={`quest-chip ${됨 ? 'done' : ''}`.trim()} title={one.글} aria-label={`미션 ${one.글}${됨 ? ', 성공' : ''}`}>
                              <i aria-hidden="true">{됨 ? '✅' : one.look}</i>
                              <em>{one.글}</em>
                            </span>
                          );
                        })}
                        {몬스터수 > 0 && (
                          <span className="quest-chip mistake" key={`m-${몬스터수}`} aria-label={`잡을 실수 몬스터 ${몬스터수}마리`}>
                            <i aria-hidden="true">👾</i><em>×{몬스터수}</em>
                          </span>
                        )}
                        {목표 != null && (
                          <span className={`quest-chip ghost ${퀘.나이김 ? 'done' : ''}`.trim()} aria-label={`지난번의 나 ${목표}개, 지금 ${퀘.통계.맞힘}개`}>
                            <i aria-hidden="true">{퀘.나이김 ? '🏅' : '👻'}</i>
                            <em>{퀘.통계.맞힘} : {목표}</em>
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  {겨루기 && mode === 'playing' && 역전?.id === player.id && (
                    <div className="versus-flip" key={`flip-${역전.n}`} aria-live="polite"><b>역전!</b><small>👑 이제 내가 앞서요</small></div>
                  )}
                  {laneToasts[player.id]?.[0] && (
                    <div className="lane-toast" key={laneToasts[player.id][0].id} aria-live="polite">
                      <span aria-hidden="true">{laneToasts[player.id][0].look}</span>
                      <strong>{laneToasts[player.id][0].text}</strong>
                    </div>
                  )}
                  {/* 하에서 중으로 올라간 그 순간입니다. 지금까지는 조용히
                      바뀌어서 아이가 자기가 올라간 것을 몰랐습니다. */}
                  {state.justMoved === 'up' && mode === 'playing' && (
                    <div className="level-up" aria-live="polite">
                      <Sparkles size={20} />
                      <strong>{state.level} 단계로!</strong>
                      <span>세 문제를 이어서 맞혔어요</span>
                    </div>
                  )}

                  {successActive && (
                    <div className="success-burst" aria-live="polite">
                      <CheckCircle2 size={30} />
                      <span>정답!</span>
                    </div>
                  )}
                  {wrongActive && (
                    <div className="wrong-burst" aria-live="polite">
                      <span aria-hidden="true">🤔</span>
                      <span>다시 한번!</span>
                    </div>
                  )}

                  {mode === 'finished' ? (
                    <div className="student-result-summary">
                      <span className="result-kicker">시간 종료</span>
                      <strong>{player.name} 결과</strong>
                      {겨루기 && (() => {
                        const 내등수 = 등수[player.id] ?? 1;
                        const 모양 = 내등수 > 1 ? 'lose' : 선두 === player.id ? 'win' : 'tie';
                        return (
                          <span className={`versus-result ${모양}`}>
                            {모양 === 'win' ? '🏆 겨루기 1등!' : 모양 === 'tie' ? '🤝 공동 1등!' : `${내등수 <= 3 ? 등수표시(내등수) : '💪'} ${내등수}등! 다음엔 1등 도전!`}
                            <small> 👑 {겨룬판.승[player.id] ?? 0}판</small>
                          </span>
                        );
                      })()}
                      {/* 개수는 접혀 있을 때만 보여 줍니다. 펼치면 그 자리는
                          '무엇을 더 공부할까'가 씁니다. 몇 개 맞혔는지는
                          아이가 이미 압니다 — 풀 때마다 보았으니까요. */}
                      {!openResults[player.id] && (
                        <div className="student-result-list">
                          <div>
                            <span>푼 문제</span>
                            <strong>{result.total}개</strong>
                          </div>
                          <div className="correct-result">
                            <span>정답</span>
                            <strong>{result.correct}개</strong>
                          </div>
                          <div className="wrong-result">
                            <span>오답</span>
                            <strong>{result.wrong}개</strong>
                          </div>
                          {/* 우리 반 길은 모두의 정답을 합해서 채웁니다.
                              내가 몇 칸을 밀었는지 보이지 않으면, 함께
                              채웠다는 말이 남의 이야기로 들립니다. */}
                          <div className="share-result">
                            <span>우리 반에 보탬</span>
                            <strong>{result.correct}개</strong>
                          </div>
                          {/* 이번 판에 모은 별과, 다음 꾸미개까지 남은 별입니다. */}
                          <div className="star-result">
                            <span>모은 별</span>
                            <strong>⭐ {sessionStars[player.id] ?? 0}개</strong>
                            {(() => {
                              const 다음 = 다음꾸미개(profileOf(player.attendanceNo).stars);
                              return <small>{다음 ? `${다음.item.icon} ${다음.item.name}까지 ${다음.left}개` : '꾸미개를 모두 모았어요!'}</small>;
                            })()}
                          </div>
                          {/* 받은 배지입니다. 이번 판에 새로 받은 것은 빛나게 합니다. */}
                          <div className="badge-result">
                            <span>배지 {profileOf(player.attendanceNo).badges.length}/{배지들.length}</span>
                            <span className="badge-row">
                              {배지들.map((one) => {
                                const 가짐 = profileOf(player.attendanceNo).badges.includes(one.id);
                                const 새것 = (sessionBadges[player.id] ?? []).includes(one.id);
                                return (
                                  <i key={one.id} className={`${가짐 ? 'have' : ''} ${새것 ? 'new' : ''}`.trim()} title={가짐 ? `${one.name}: ${one.says}` : '아직 받지 않은 배지'}>
                                    {가짐 ? one.look : '◌'}
                                  </i>
                                );
                              })}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 일반 차시의 미션·실수 몬스터·지난번의 나와 개념 카드 도감입니다. 점수 칸과 섞이지 않게 따로 얇게 둡니다. */}
                      {!openResults[player.id] && !isPlayScene && (() => {
                        const 퀘 = quests[player.id] ?? { 통계: 빈통계(), 다함: false, 나이김: false };
                        const 미션 = 오늘미션(player.attendanceNo, lesson.id);
                        const 목표 = ghosts[player.id];
                        const 이단원 = semesterUnits.find((unit) => unit.lessons.some((one) => one.id === lesson.id)) ?? selectedUnit;
                        const 칸들 = 이단원.lessons.filter((one) => !놀이차시인가(one) && !isCastleLesson(one.title));
                        const 모음 = cardsOf(player.attendanceNo);
                        const 새것 = sessionCards[player.id] ?? [];
                        return (
                          <section className="quest-summary" aria-label="오늘의 미션과 개념 카드">
                            <p className="quest-stats">
                              <span>🎯 미션 <b>{미션.filter((one) => one.됐나(퀘.통계)).length}/{미션.length}{퀘.다함 ? ' 🏆' : ''}</b></span>
                              <span>👾 잡은 실수 몬스터 <b>{퀘.통계.잡은몬스터}마리</b></span>
                              <span>
                                👻 지난번의 나 <b>{목표 == null ? '첫 기록' : `${목표}개 → 오늘 ${result.correct}개`}</b>
                                {목표 != null && <em>{퀘.나이김 ? ' 이겼어요!' : ' 다음엔 이겨요'}</em>}
                              </span>
                            </p>
                            {/* 개념 카드 도감: 이 단원의 차시마다 한 칸입니다. 놀이 차시는 카드가 없으므로 뺍니다. */}
                            <div className="card-book">
                              <span className="card-book-title">🃏 {이단원.title} 카드 <b>{칸들.filter((one) => 모음[one.id]).length}/{칸들.length}</b></span>
                              <span className="card-row">
                                {칸들.map((one) => {
                                  const 등급 = 모음[one.id];
                                  return (
                                    <i
                                      key={one.id}
                                      className={`concept-card ${등급 ? `tier-${카드모양[등급].이름}` : 'empty'} ${새것.includes(one.id) ? 'new' : ''} ${one.id === lesson.id ? 'here' : ''}`.trim()}
                                      title={등급 ? `${one.lessonNo}차시 ${카드이름(one.title)} (${카드모양[등급].이름} 카드)` : `${one.lessonNo}차시: 힌트 없이 ${카드조건}문제를 이어서 맞히면 얻어요`}
                                    >
                                      <b>{등급 ? 카드모양[등급].look : '?'}</b>
                                      <small>{one.lessonNo}</small>
                                    </i>
                                  );
                                })}
                              </span>
                            </div>
                          </section>
                        );
                      })()}

                      {openResults[player.id] && (() => {
                        const guide = studyGuideFor(sessionRecords, player.id);
                        if (guide.answered === 0) {
                          return (
                            <div className="lane-result-detail">
                              <p className="lane-result-empty">아직 푼 문제가 없어요. 다음에 함께 해 봐요.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="lane-result-detail">
                            {/* 칭찬을 맨 위에 둡니다. 걸린 곳부터 읽는
                                아이는 그 뒤를 잘 읽지 않습니다. */}
                            <section className="lane-guide-block good">
                              <h4>잘한 점</h4>
                              {guide.cheer && <p className="lane-cheer"><MathText text={guide.cheer} /></p>}

                              {/* 우리 반 목표에 얼마나 보탰는지입니다.
                                  등수가 아니라 보탬이라, 적게 푼 아이도
                                  자기 몫이 길에 남아 있는 것을 봅니다. */}
                              {correctCount > 0 && (
                                <div className="lane-share">
                                  <p className="lane-share-line">
                                    우리 반이 채운 <strong>{correctCount}개</strong> 가운데
                                    {' '}<strong>{result.correct}개</strong>를 보탰어요
                                    {result.correct > 0 && (
                                      <span className="lane-share-percent">
                                        {Math.round((result.correct / correctCount) * 100)}%
                                      </span>
                                    )}
                                  </p>
                                  <div className="lane-share-track" aria-hidden="true">
                                    <div
                                      className="lane-share-fill"
                                      style={{ width: `${Math.min(100, Math.round((result.correct / correctCount) * 100))}%` }}
                                    />
                                  </div>
                                  <p className="lane-share-note">
                                    {result.correct === 0
                                      ? `다음에 한 문제만 맞혀도 ${runnerNameFor(goalStage)}가 한 칸 더 갑니다.`
                                      : `${runnerNameFor(goalStage)}를 ${result.correct}칸 밀어 준 셈이에요.`}
                                  </p>
                                </div>
                              )}
                              {guide.strong.length > 0 && (
                                <ul className="lane-guide-kinds">
                                  {guide.strong.map((one) => (
                                    <li key={one.kind}>
                                      <strong><MathText text={one.kind} /></strong>
                                      {/* 몇 번 맞혔는지는 아이가 이미
                                          압니다. 무엇을 할 줄 알게
                                          되었는지를 적어 줍니다. */}
                                      <span><MathText text={one.praise} /></span>
                                      <span className="lane-guide-count">{one.total}번 다 맞혔어요</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </section>

                            {guide.weak.length === 0 ? (
                              <p className="lane-result-empty good">
                                걸린 곳이 없었어요. 다음에는 조금 더 어려운 문제도 해 볼까요?
                              </p>
                            ) : (
                              <section className="lane-guide-block">
                                <h4>더 공부하면 좋은 것</h4>
                                {/* 걸린 갈래를 먼저 늘어놓고, 공부하는
                                    방법과 조심할 곳은 아래에 한 번만
                                    적습니다. 갈래마다 붙이면 같은 문장을
                                    세 번 읽게 됩니다. */}
                                <ul className="lane-guide-kinds missed">
                                  {guide.weak.map((one) => (
                                    <li key={one.kind}>
                                      <strong><MathText text={one.kind} /></strong>
                                      <span>{one.total}번 중 {one.wrong}번 걸렸어요</span>
                                      {/* '무엇을 더 공부하라'는 말만으로는
                                          집에서 무엇을 펼쳐야 할지 알 수
                                          없습니다. 실제로 틀린 문제와 그
                                          문제의 첫 동작을 함께 둡니다. */}
                                      {one.example && (
                                        <span className="lane-guide-example">
                                          <em><MathText text={one.example.prompt} /></em>
                                          <b>답 <MathText text={one.example.answer} /></b>
                                          <i><MathText text={one.example.firstMove} /></i>
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>

                                {/* 두 번 넘게 되풀이된 실수입니다. 한 번은
                                    실수이고 두 번부터가 버릇입니다. */}
                                {guide.habits.length > 0 && (
                                  <ul className="lane-habits">
                                    {guide.habits.map((one) => (
                                      <li key={one.what}>
                                        <strong><MathText text={one.what} /> {one.times}번</strong>
                                        <span><MathText text={one.fix} /></span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <div className="lane-guide-advice">
                                  {guide.advice.map((line) => (
                                    <p className="lane-guide-line how" key={line}>
                                      <span>이렇게 해 봐요</span><MathText text={line} />
                                    </p>
                                  ))}
                                  {guide.watchOut && (
                                    <p className="lane-guide-line"><span>조심할 곳</span><MathText text={guide.watchOut} /></p>
                                  )}
                                  {guide.selfCheck && (
                                    <p className="lane-guide-line check"><span>다 풀고 나서</span><MathText text={guide.selfCheck} /></p>
                                  )}
                                </div>
                              </section>
                            )}
                          </div>
                        );
                      })()}

                      {/* 자기 자리에서 자기 것을 엽니다. 한가운데 뜨는 창
                          하나에 다 같이 모이면, 자기 것을 보기 전에 옆자리
                          것부터 보게 됩니다.
                          단추는 풀이 글보다 아래에 둡니다. 위에 두었더니
                          결과를 펼쳤을 때 글에 밀려 위로 올라가, 칠판 앞
                          아이가 '결과 접기'에 손이 닿지 않았습니다. */}
                      <button
                        className="lane-result-toggle"
                        type="button"
                        aria-expanded={Boolean(openResults[player.id])}
                        onClick={() => {
                          playTapSound();
                          setOpenResults((prev) => ({ ...prev, [player.id]: !prev[player.id] }));
                        }}
                      >
                        <BarChart3 size={16} />
                        {openResults[player.id] ? '결과 접기' : '결과 자세히 보기'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`student-question-body ${scratchOpen[player.id] ? 'scratch-open' : ''} ${question.prompt.length > 70 ? 'long-question' : ''} ${question.prompt.length > 100 ? 'very-long-question' : ''}`.trim()}>
                        <div className="student-question-meta">
                          <span>{((state.activeRetry?.index ?? state.questionIndex) % playerQuestions.length) + 1} / {playerQuestions.length}</span>
                          {/* 아까 틀린 문제가 돌아왔다는 것을 알려 줍니다.
                              모르고 다시 틀리는 것과, 알고 다시 푸는 것은
                              아이에게 완전히 다른 일입니다. */}
                          {state.activeRetry !== null && <span className="retry-tag">{isPlayScene ? '다시 도전' : '👾 실수 몬스터 등장!'}</span>}
                          {/* 황금 문제는 맞히면 별을 두 배로 받습니다. 융합 문항은 늘 황금입니다. */}
                          {golden && <span className="golden-tag">🌟 황금 문제 · 별 2배</span>}
                          <span>{question.strategy}</span>
                        </div>
                        {/* 틀린 뒤 도움말이 열리면 몬스터는 비켜 섭니다. 이 칸은 높이가 정해져 있어,
                            몬스터가 남아 있으면 문제 글이 밀려 가려집니다. */}
                        {!isPlayScene && state.feedback !== 'explain' && (
                          <UnitMonster
                            tag={lesson.tags[0] ?? question.type}
                            hits={monsters[player.id]?.hits ?? 0}
                            defeated={monsters[player.id]?.defeated ?? 0}
                            taunting={wrongActive}
                          />
                        )}
                        {game ? (
                          <GameScene
                            game={game}
                            questionKey={question.id}
                            prompt={question.prompt}
                            visual={question.visual}
                            level={state.activeRetry?.level ?? state.level}
                            correct={result.correct}
                            wrong={result.wrong}
                            avatar={player.avatar}
                            sharedScreen={!isMobileEntry}
                            stopped={state.feedback === 'explain'}
                            onTimeout={() => answerQuestion(player, question, -1)}
                            goal={겨룬결승}
                            friends={겨루기 ? {
                              나: 판점수(겨룬판, 겨룬맞힘, player.id),
                              판: 겨룬판.판,
                              부스터: 부스터들.includes(player.id),
                              친구들: players.filter((one) => one.id !== player.id).map((one) => ({ 얼굴: one.avatar, 이름: one.name, 점수: 판점수(겨룬판, 겨룬맞힘, one.id) })),
                            } : undefined}
                          />
                        ) : isCastleDefense ? (
                          <CastleDefenseScene
                            questionKey={question.id}
                            prompt={question.prompt}
                            heartsMax={CASTLE_HEARTS_MAX}
                            heartsLost={result.wrong}
                            solved={result.correct}
                            total={playerQuestions.length}
                            level={state.activeRetry?.level ?? state.level}
                            sharedScreen={!isMobileEntry}
                            // 틀린 뒤 도움말을 보는 동안에는 몬스터가 더 내려올 까닭이 없습니다. 제자리에 세워 둡니다.
                            stopped={state.feedback === 'explain'}
                            onTimeout={() => answerQuestion(player, question, -1)}
                          />
                        ) : (
                          <>
                            <QuestionVisualGraphic visual={question.visual} />
                            <HighlightedPrompt text={question.prompt} />
                          </>
                        )}

                        {/* 힌트 스캐폴딩: 1단계(핵심 말 강조)는 위 문제글에
                            이미 켜져 있고, 2단계(정지된 그림)도 이미
                            보입니다. 이 줄은 그 위 두 가지 — 짧은 도움말을
                            미리 열어 보는 것과, 만져 보는 힌트 창을 여는
                            것 — 을 아이가 원할 때 스스로 꺼내 쓰게 합니다.
                            문제 칸 안에 두어, 답 칸(student-answer-dock)의
                            자리를 밀어내지 않고 이 칸 안에서만 스크롤됩니다. */}
                        {state.feedback !== 'explain' && (
                          <div className="hint-controls">
                            <button
                              type="button"
                              className="hint-toggle-button"
                              aria-expanded={Boolean(hintTextOpen[player.id])}
                              onClick={() => {
                                playTapSound();
                                setHintTextOpen((prev) => ({ ...prev, [player.id]: !prev[player.id] }));
                              }}
                            >
                              <Lightbulb size={16} /> {hintTextOpen[player.id] ? '힌트 접기' : '힌트 보기'}
                            </button>
                            {(question.visual || question.walkthrough) && (
                              <button
                                type="button"
                                className="hint-interactive-button"
                                onClick={() => {
                                  playTapSound();
                                  setHintModalOpen((prev) => ({ ...prev, [player.id]: true }));
                                  setHintUsedThisQuestion((prev) => ({ ...prev, [player.id]: true }));
                                }}
                              >
                                <Search size={16} /> 자세히 보기
                              </button>
                            )}
                            {/* 고학년 계산은 암산으로 되지 않습니다. 적을
                                자리가 없으면 아이는 머릿속으로 하다 틀리거나
                                찍습니다. 손으로 풀 자리를 문제 옆에 둡니다. */}
                            {!isPlayScene && (
                              <button
                                type="button"
                                className="scratch-toggle-button"
                                aria-expanded={Boolean(scratchOpen[player.id])}
                                onClick={() => {
                                  playTapSound();
                                  setScratchOpen((prev) => ({ ...prev, [player.id]: !prev[player.id] }));
                                }}
                              >
                                <PencilLine size={16} /> 계산판
                              </button>
                            )}
                          </div>
                        )}

                        {state.feedback !== 'explain' && hintTextOpen[player.id] && (
                          <div className="hint-text-panel" aria-label={`${player.name} 힌트`}>
                            <p className="quick-core"><span>핵심</span><span><MathText text={question.support.studentConcept} /></span></p>
                            <p><span>볼 곳</span><span><MathText text={question.support.studentHint} /></span></p>
                            {(() => {
                              // 풀이를 한 걸음씩 펼칩니다. 답이 나오는 걸음은 보여 주지 않아,
                              // 마지막 한 걸음은 아이가 스스로 갑니다.
                              const 걸음들 = 답전까지걸음(question);
                              const 펼친 = Math.min(hintSteps[player.id] ?? 0, 걸음들.length);
                              if (!걸음들.length) return null;
                              return (
                                <div className="hint-steps">
                                  {걸음들.slice(0, 펼친).map((step, k) => (
                                    <p key={k} className="hint-step"><span>{k + 1}걸음</span><span><MathText text={step} /></span></p>
                                  ))}
                                  {펼친 < 걸음들.length ? (
                                    <button
                                      type="button"
                                      className="hint-step-button"
                                      onClick={() => {
                                        playTapSound();
                                        setHintSteps((prev) => ({ ...prev, [player.id]: 펼친 + 1 }));
                                        setHintUsedThisQuestion((prev) => ({ ...prev, [player.id]: true }));
                                      }}
                                    >
                                      👣 {펼친 === 0 ? '풀이 첫 걸음 보기' : '다음 걸음 보기'} ({펼친}/{걸음들.length})
                                    </button>
                                  ) : (
                                    <p className="hint-step-last">이제 마지막 걸음은 스스로 해 보세요!</p>
                                  )}
                                </div>
                              );
                            })()}
                            {/* 쌓은 모양은 앞의 것이 뒤의 것을 가립니다. 개수를
                                묻는 문제에서 아이가 보이는 것만 세고 숨은 것을
                                빠뜨립니다. 힌트를 열었을 때만 비쳐 보이게 그려
                                숨은 쌓기나무까지 세게 합니다. */}
                            {question.visual?.kind === 'cube-stack' && (
                              <div className="hint-see-through">
                                <QuestionVisualGraphic
                                  visual={{ ...question.visual, seeThrough: true }}
                                />
                                <span>뒤에 숨은 쌓기나무까지 비쳐 보입니다. 하나씩 짚어 세어 보세요.</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 계산판입니다. 문제 칸을 그대로 덮되 답 칸은
                            덮지 않습니다 — 쓰다가 답이 보이면 접지 않고
                            바로 누를 수 있어야 합니다. key에 문제 번호를
                            넣어, 다음 문제로 넘어가면 쓴 것이 지워집니다.
                            성 지키기는 몬스터가 내려오는 화면이라 덮지
                            않습니다. */}
                        {!isPlayScene && (
                          <ScratchPad
                            key={`${player.id}-${question.id}-${state.answered}`}
                            open={Boolean(scratchOpen[player.id])}
                            prompt={question.prompt}
                            onTap={playTapSound}
                            onClose={() => setScratchOpen((prev) => ({ ...prev, [player.id]: false }))}
                          />
                        )}
                      </div>

                      {state.feedback === 'correct' && (
                        <div className="student-feedback correct-feedback">
                          <strong><CheckCircle2 size={18} /> 정답</strong>
                          {/* 조작 문항은 임무에 맞춘 칭찬과 별로 해낸 것을 알려 줍니다. */}
                          {question.manipulate && (() => {
                            const 칭찬 = 조작칭찬(question);
                            return (
                              <div className="manip-cheer" aria-live="polite">
                                <span className="manip-cheer-stars" aria-label={`별 ${칭찬.별}개`}>{'★'.repeat(칭찬.별)}<span className="dim">{'★'.repeat(3 - 칭찬.별)}</span></span>
                                <b>{칭찬.제목}</b>
                                <span>{칭찬.말}</span>
                              </div>
                            );
                          })()}
                          <button type="button" onClick={() => nextForPlayer(player)}>다음 문제</button>
                        </div>
                      )}

                      {state.feedback === 'explain' && (
                        <div className="student-feedback wrong-feedback">
                          <strong><XCircle size={18} /> {game ? game.missTitle : isCastleDefense ? '성벽이 흔들렸어요!' : '짧은 도움'}</strong>
                          <div className="support-card quick-support-card" aria-label={`${player.name} 오답 도움`}>
                            <p className="quick-core"><span>핵심</span><span><MathText text={question.support.studentConcept} /></span></p>
                            <p><span>볼 곳</span><span><MathText text={question.support.studentHint} /></span></p>
                            {question.manipulate ? (
                              <p><span>바르게</span><span>아래 판에 초록색으로 바르게 한 모습을 겹쳐 보여 줘요.</span></p>
                            ) : (
                              <p><span>정답</span><span><MathText text={question.answer} /></span></p>
                            )}
                            <p className="quick-reason"><span>왜?</span><span><MathText text={question.support.steps.join(' ')} /></span></p>
                          </div>
                          <div className="wrong-feedback-actions">
                            {(question.visual || question.walkthrough) && (
                              <button
                                type="button"
                                className="hint-interactive-button"
                                onClick={() => {
                                  playTapSound();
                                  setHintModalOpen((prev) => ({ ...prev, [player.id]: true }));
                                  setHintUsedThisQuestion((prev) => ({ ...prev, [player.id]: true }));
                                }}
                              >
                                <Search size={16} /> {question.visual ? '만져서 다시 보기' : '한 자리씩 다시 보기'}
                              </button>
                            )}
                            <button type="button" onClick={() => nextForPlayer(player)}>다음 문제</button>
                          </div>
                        </div>
                      )}

                      {hintModalOpen[player.id] && (question.visual || question.walkthrough) && (
                        <InteractiveHintModal
                          visual={question.visual}
                          walkthrough={question.walkthrough}
                          reveal={state.feedback === 'explain'}
                          prompt={question.prompt}
                          onClose={() => setHintModalOpen((prev) => ({ ...prev, [player.id]: false }))}
                        />
                      )}

                      <div className={`student-answer-dock ${question.manipulate ? 'manip-dock' : ''}`}>
                        {question.manipulate ? (
                          <ManipulateTask
                            key={`${player.id}-${question.id}-${state.answered}`}
                            m={question.manipulate}
                            difficulty={question.difficulty}
                            locked={state.locked}
                            reveal={state.feedback === 'explain'}
                            tip={manipTips[player.id]}
                            onSubmit={(result) => answerQuestion(player, question, result.ok ? question.answerIndex : -1, result)}
                          />
                        ) : (
                        <div className={`choice-grid ${question.choiceVisuals ? 'picture-choices' : ''}`}>
                          {question.choices.map((choice, index) => (
                            <button
                              type="button"
                              key={`${question.id}-${player.id}-${choice}`}
                              className={state.selected === index ? 'selected' : ''}
                              onClick={() => answerQuestion(player, question, index)}
                              disabled={state.locked}
                            >
                              <span>{index + 1}</span>
                              {/* 그림 보기입니다. 글은 읽어 주는 이름으로만 남깁니다. */}
                              {question.choiceVisuals?.[index] ? (
                                <span className="choice-picture">
                                  <QuestionVisualGraphic visual={question.choiceVisuals[index]} />
                                  <span className="choice-caption"><MathText text={choice} /></span>
                                </span>
                              ) : (
                                <span className="choice-text"><MathText text={choice} /></span>
                              )}
                            </button>
                          ))}
                        </div>
                        )}
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>

    </>
  );

  return (
    <main className={`app-shell ${mode} ${isMobileEntry ? 'mobile-entry' : ''} ${fullscreenActive ? 'fullscreen-mode' : ''}`}>
      <header className={`app-header ${mode === 'setup' ? '' : 'with-lesson'}`}>
        {/* QR로 들어온 휴대폰·패드에서는 화면이 좁습니다. 이름표와 전체화면 단추는 빼고,
            차시 제목·시계·소리 단추만 한 줄에 둡니다. */}
        {isMobileEntry ? (
          mode === 'setup' && <strong className="mobile-lesson-title">{lessonHeading}</strong>
        ) : (
        <div className="brand">
          <span className="brand-mark"><GraduationCap size={24} /></span>
          <div>
            <h1>보조개샘ai클래스 수학 게임</h1>
            {mode === 'setup' && <p>수업 설정</p>}
          </div>
        </div>
        )}
        {mode !== 'setup' && renderLessonBar()}
        <div className="header-actions">
          {/* 휴대폰 QR은 선생님이 여는 것이라 머리줄에 둡니다(자리 카드가 있는 아래쪽은 학생이 누르는 곳). */}
          {mode === 'setup' && !isMobileEntry && (
            <button className="secondary-button mobile-join-toggle header-qr" type="button" onClick={() => setMobileJoinOpen(true)}>
              <QrCode size={20} />
              휴대폰으로 함께 풀기
            </button>
          )}
          {/* 교실에서 소리를 꺼야 할 때가 있습니다. 옆 반이 시험을 보거나
              선생님이 설명하는 동안입니다. 수업이 시작된 뒤에야 끌 수
              있으면 이미 한 번은 울린 뒤입니다 — 첫 화면부터 둡니다.
              끈 것은 다음 수업에도 남습니다. */}
          <button
            className={`sound-toggle ${muted ? 'off' : ''}`}
            type="button"
            onClick={() => setMuted(!muted)}
            aria-pressed={muted}
            title={muted ? '소리 켜기' : '소리 끄기'}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            <span>{muted ? '소리 꺼짐' : '소리 켜짐'}</span>
          </button>
          {!isMobileEntry && (
            <button className="secondary-button fullscreen-button" type="button" onClick={toggleFullscreen}>
              {fullscreenActive ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              {fullscreenActive ? '전체화면 나가기' : '전체화면'}
            </button>
          )}
        </div>
      </header>

      {mode === 'setup' ? renderSetup() : engine ? <Suspense fallback={준비화면}>{renderGame()}</Suspense> : 준비화면}

      {teacherOpen && (
      <Suspense fallback={null}>
      <TeacherPanel
        isOpen={teacherOpen}
        onClose={() => setTeacherOpen(false)}
        {...(mode === 'setup'
          ? // 아직 교실 수업을 시작하지 않았으므로, 큐알로 들어온 학생만
            // 보여 줍니다. 빈 자리 카드가 앞에 늘어서면 정작 봐야 할
            // 학생이 묻힙니다.
            { records: remoteRecords, players: remotePlayers }
          : { records: [...records, ...remoteRecords], players: [...players, ...remotePlayers] })}
        lesson={lesson}
        currentQuestion={sampleQuestion}
        goalStep={goalStep}
      />
      </Suspense>
      )}

    </main>
  );
}

export default App;
