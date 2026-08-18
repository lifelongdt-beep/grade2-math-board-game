import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import QRCode from 'qrcode';
import {
  BarChart3,
  CheckCircle2,
  Copy,
  GraduationCap,
  Home,
  Maximize2,
  Minimize2,
  MonitorUp,
  QrCode,
  RefreshCcw,
  Smartphone,
  Sparkles,
  Timer,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { meaningOfChoice } from './data/choiceMeaning';
import {
  isMuted,
  playAnimalSound,
  playFinishSound,
  playGoalFanfare,
  playReadySound,
  playSuccessSound,
  playDifficultySound,
  playTapSound,
  playWrongSound,
  setMuted,
  successHoldMs,
  wakeAudio,
  watchMuted,
} from './sound';
import { QuestionVisualGraphic } from './components/QuestionVisualGraphic';
import { GoalRunner, runnerNameFor } from './components/GoalRunner';
import { studyGuideFor } from './data/studyGuide';
import { advancePlayerState, createQuestionState, getPlayerQuestion } from './playerState';
import { TeacherPanel } from './components/TeacherPanel';
import { curriculum } from './data/curriculum';
import { generateQuestions } from './data/questionFactory';
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
const durations: SessionDuration[] = [30, 60, 120];
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
  semester: Unit['semester'];
  unitSelection?: UnitSelection;
  lessonId?: string;
  duration: SessionDuration;
};

const isSemesterValue = (value: string | null): value is Unit['semester'] => value === '2-1' || value === '2-2';

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

  return {
    isMobileEntry: params.get('mobile') === '1' || params.get('m') === '1',
    semester: isSemesterValue(semesterParam) ? semesterParam : '2-1',
    unitSelection: parseUnitSelection(unitParam),
    lessonId: lessonParam ?? undefined,
    duration: parseSessionDuration(durationParam),
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

const buildScopedQuestions = (
  lessons: Lesson[],
  difficulty: Difficulty,
  scope: ReviewScope,
  bankSeed: number,
): Question[] => {
  const questions = lessons.flatMap((sourceLesson) => generateQuestions(sourceLesson, difficulty));

  // 한 차시를 고른 경우에도 순서를 섞습니다. 섞지 않으면 수업을 다시 해도
  // 늘 같은 순서로 나와 학생이 순서를 외워 버립니다.
  // bankSeed는 수업을 시작할 때마다 새로 정해지므로 매번 순서가 달라집니다.
  const shuffled = shuffledBySeed(
    questions,
    `${scope}-${difficulty}-${bankSeed}-${lessons.map((item) => item.id).join('|')}`,
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

const PlayerAvatar = ({ player, active = false }: { player: Player; active?: boolean }) => (
  <span
    className={`player-avatar ${active ? 'success' : ''}`}
    style={{ borderColor: player.color }}
    aria-hidden="true"
  >
    {player.avatar}
  </span>
);

const ClassroomQrCode = ({ value }: { value: string }) => {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setQrFailed(false);

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'H',
      margin: 5,
      scale: 14,
      width: 560,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
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
  const skipInitialSemesterReset = useRef(true);
  const skipInitialUnitReset = useRef(true);
  const [semester, setSemester] = useState<'2-1' | '2-2'>(initialRoute.semester);
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
      if (reviewScope === 'semester') return semesterUnits.flatMap((unit) => unit.lessons);
      if (reviewScope === 'unit') return selectedUnit.lessons;
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
  const lessonHeading = reviewScope === 'lesson' ? `${lesson.lessonNo}차시 · ${lesson.title}` : lesson.title;
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
  const [round, setRound] = useState(1);
  // 맞힐 때마다 시간이 조금씩 늘어납니다. 줄어들기만 하는 시계는 2학년에게
  // 재미보다 불안이라, 잘 풀수록 더 오래 놀 수 있게 합니다.
  //
  // 다만 끝이 나긴 해야 합니다. 아이 셋이 5초에 한 문제씩 맞히면 1초에
  // 1.2초씩 붙어 시계가 영영 멈추지 않습니다. 그래서 처음 시간의 절반까지만
  // 늘려 줍니다 — 60초 수업이면 최대 30초입니다.
  const [bonusUsed, setBonusUsed] = useState(0);
  const [bonusFlash, setBonusFlash] = useState(0);
  const players = useMemo(() => createPlayers(playerCount, studentConfigs), [playerCount, studentConfigs]);
  const [bankSeed, setBankSeed] = useState(0);
  const questionBanks = useMemo<Record<Difficulty, Question[]>>(
    () => ({
      하: buildScopedQuestions(scopedLessons, '하', reviewScope, bankSeed),
      중: buildScopedQuestions(scopedLessons, '중', reviewScope, bankSeed),
      상: buildScopedQuestions(scopedLessons, '상', reviewScope, bankSeed),
    }),
    [bankSeed, reviewScope, scopedLessons],
  );
  const [remainingSeconds, setRemainingSeconds] = useState<SessionDuration | number>(sessionDuration);
  const [playerStates, setPlayerStates] = useState<Record<number, PlayerQuestionState>>(() => createQuestionState(players));
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [mobileJoinOpen, setMobileJoinOpen] = useState(false);
  const [mobileUrlCopied, setMobileUrlCopied] = useState(false);
  const [mobileJoinOrigin, setMobileJoinOrigin] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenFallback, setFullscreenFallback] = useState(false);
  const [successSignals, setSuccessSignals] = useState<Record<number, number>>({});
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
    setPlayerStates(createQuestionState(players));
    setRemainingSeconds(sessionDuration);
  }, [players, sessionDuration, mode]);

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

  // 한 단계는 아이 한 명당 여섯 문제입니다. 한 판에 한두 단계를 채울
  // 만한 크기라, 채우는 맛도 있고 손에 닿지 않지도 않습니다.
  const goalStep = Math.max(6, playerCount * 6);
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
  const fallbackStates = createQuestionState(players);
  const firstPlayer = players[0];
  const sampleQuestion = firstPlayer
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
    return url.toString();
  }, [isSemesterReviewSelected, lesson.id, mobileJoinOrigin, selectedUnit.unitNo, semester, sessionDuration]);
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
    setBankSeed(Math.floor(Math.random() * 1_000_000_000));
    setPlayerStates(createQuestionState(players, now));
    setRemainingSeconds(sessionDuration);
    setTeacherOpen(false);
    setMode('playing');
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
    setPlayerStates(createQuestionState(players));
    setRemainingSeconds(sessionDuration);
    setStudentSetupSteps(createStudentSetupSteps(playerCount));
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
    setRound((value) => value + 1);
    setBonusUsed(0);
    setBonusFlash(0);
    setSuccessSignals({});
    setWrongSignals({});
    setBankSeed(Math.floor(Math.random() * 1_000_000_000));
    setPlayerStates(createQuestionState(players));
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

  const addBonusTime = () => {
    if (bonusUsed >= bonusCap) return;
    const giving = Math.min(BONUS_SECONDS, bonusCap - bonusUsed);
    setBonusUsed((value) => value + giving);
    setRemainingSeconds((value) => value + giving);
    setBonusFlash(Date.now());
  };

  const nextForPlayer = (player: Player) => {
    setPlayerStates((prev) => {
      const current = prev[player.id];
      if (!current) return prev;
      // 올라갔으면 그 수준의 소리를 들려 줍니다. 소리만으로도 옆자리
      // 친구가 올라간 것을 압니다.
      const moved = advancePlayerState(current, players.length, current.correct === false);
      if (moved.justMoved === 'up') playDifficultySound(moved.level);
      // '다음 문제'를 누르는 자리는 정답을 맞힌 뒤와 오답 도움말을 본 뒤,
      // 두 곳입니다. 오답이었으면 그 문제를 다시 낼 줄에 넣습니다.
      return { ...prev, [player.id]: moved };
    });
  };

  const triggerWrongSignal = (playerId: number) => {
    const token = Date.now();
    playWrongSound();
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
    playSuccessSound(difficulty);
    setSuccessSignals((prev) => ({ ...prev, [playerId]: token }));
    window.setTimeout(() => {
      setSuccessSignals((prev) => {
        if (prev[playerId] !== token) return prev;
        const { [playerId]: _removed, ...rest } = prev;
        return rest;
      });
    }, successHoldMs);
  };

  const answerQuestion = (player: Player, question: Question, choiceIndex: number) => {
    const state = playerStates[player.id];
    if (!state || state.locked || mode !== 'playing') return;

    const isCorrect = choiceIndex === question.answerIndex;
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
      chosen: question.choices[choiceIndex] ?? '',
      // 되돌아온 문제면 두 번째 이후 시도입니다.
      attempts: state.activeRetry === null ? 1 : 2,
      responseMs,
      answeredAt: new Date().toISOString(),
      ...(isCorrect
        ? {}
        : (() => {
            const meaning = meaningOfChoice(
              question.prompt,
              question.choices[choiceIndex] ?? '',
              question.answer,
            );
            return meaning ? { chosenMeaning: meaning } : {};
          })()),
    };

    if (isCorrect) {
      triggerSuccessSignal(player.id, question.difficulty);
      addBonusTime();
    } else {
      triggerWrongSignal(player.id);
    }

    setRecords((prev) => [...prev, record]);
    setPlayerStates((prev) => {
      const currentState = prev[player.id] ?? state;

      if (isCorrect) {
        return {
          ...prev,
          [player.id]: advancePlayerState(currentState, players.length, false),
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
      <div className="setup-hero">
        <div className="setup-copy">
          <p className="eyebrow">수업 시작</p>
          <h2>오늘 풀 차시와 시간을 고르세요</h2>
          <p>{lesson.objective}</p>
        </div>
        <div className="setup-summary">
          <span><Users size={18} /> {isMobileEntry ? '모바일 1명' : `${playerCount}명`}</span>
          <span><Timer size={18} /> {sessionDuration}초</span>
          {/* 모바일 QR로 들어오면 학생마다 다른 문항을 받습니다. 같은 이야기를
              두 칸에 나눠 쓰면 따로따로 읽히므로 한 칸으로 합쳤습니다. */}
          {isMobileEntry ? (
            <span><Sparkles size={18} /> {reviewScope === 'lesson' ? '학생별 개별 문항' : '종합 랜덤 문항'}</span>
          ) : (
            <button className="mobile-join-toggle" type="button" onClick={() => setMobileJoinOpen(true)}>
              <Sparkles size={18} />
              {reviewScope === 'lesson' ? '학생별 개별 문항' : '종합 랜덤 문항'}
              <QrCode size={18} />
              모바일 QR
            </button>
          )}
        </div>
      </div>

      {/* QR로 들어온 학생은 선생님이 정해 준 차시만 풉니다. 고르는 상자를
          그대로 두면 다른 단원으로 넘어가 버려서, 선생님이 무엇을 시켰는지와
          아이가 무엇을 푸는지가 어긋납니다. 보여 주기만 하고 바꾸지는
          못하게 합니다. */}
      {isMobileEntry ? (
        <div className="setup-grid mobile-fixed-lesson">
          <p className="eyebrow">선생님이 정한 오늘 문제</p>
          <strong>{lessonHeading}</strong>
          <span>{lessonContextLabel}</span>
        </div>
      ) : (
      <div className="setup-grid">
        <label>
          학기
          <select value={semester} onChange={(event) => setSemester(event.target.value as '2-1' | '2-2')}>
            <option value="2-1">2학년 1학기</option>
            <option value="2-2">2학년 2학기</option>
          </select>
        </label>
        <label>
          단원
          <select
            value={isSemesterReviewSelected ? semesterReviewUnitValue : String(selectedUnit.unitNo)}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === semesterReviewUnitValue) {
                setUnitSelection(semesterReviewUnitValue);
                setLessonId(semesterReviewId);
                return;
              }

              const nextUnitNo = Number(nextValue);
              const nextUnit = semesterUnits.find((unit) => unit.unitNo === nextUnitNo);
              setUnitSelection(nextUnitNo);
              if (nextUnit) setLessonId(nextUnit.lessons[0].id);
            }}
          >
            {semesterUnits.map((unit) => (
              <option value={String(unit.unitNo)} key={unit.title}>{unit.unitNo}. {unit.title}</option>
            ))}
            <option value={semesterReviewUnitValue}>학기 종합 · {semester} 전체</option>
          </select>
        </label>
        <label>
          차시
          {isSemesterReviewSelected ? (
            <select value={semesterReviewId} disabled>
              <option value={semesterReviewId}>학기 종합 · {semester} 전체</option>
            </select>
          ) : (
            <select value={lesson.id} onChange={(event) => setLessonId(event.target.value)}>
              {selectedUnit.lessons.map((item) => (
                <option value={item.id} key={item.id}>{item.lessonNo}차시 · {item.title}</option>
              ))}
              <option value={unitReviewId}>단원 종합 · {selectedUnit.title} 전체</option>
            </select>
          )}
        </label>
      </div>
      )}

      <div className="setup-options">
        {isMobileEntry ? (
          <section className="mobile-single-option">
            <h3>개인 모바일</h3>
            <div className="mobile-single-status">
              <Smartphone size={24} />
              <strong>1명</strong>
              <span>출석번호와 난이도만 고르면 바로 시작</span>
            </div>
          </section>
        ) : (
          <section>
            <h3>학생 인원수</h3>
            <div className="big-segmented">
              {[1, 2, 3, 4, 5].map((count) => (
                <button type="button" className={playerCount === count ? 'active' : ''} key={count} onClick={() => setPlayerCount(count)}>
                  {count}명
                </button>
              ))}
            </div>
          </section>
        )}
        <section>
          <h3>학습 시간</h3>
          <div className="big-segmented time-options">
            {durations.map((duration) => (
              <button
                type="button"
                className={sessionDuration === duration ? 'active' : ''}
                key={duration}
                onClick={() => setSessionDuration(duration)}
              >
                {duration}초
              </button>
            ))}
          </div>
        </section>
      </div>

      <section
        className="setup-playfield playfield"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,.93), rgba(0,0,0,.88)), url(./assets/math-adventure-bg.png)',
        }}
      >
        <div className="setup-progress">
          <span><Users size={16} /> {isMobileEntry ? `내 준비 ${readyPlayerCount} / 1` : `학생 준비 ${readyPlayerCount} / ${playerCount}`}</span>
          <span>{isMobileEntry ? '번호를 누르면 자동 시작' : '출석번호를 누르면 자동 시작'}</span>
        </div>

        <div
          className="player-lanes individual setup-lanes"
          style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 5)}, minmax(${playerCount >= 5 ? 220 : playerCount >= 4 ? 240 : 280}px, 1fr))` }}
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
                  <PlayerAvatar player={player} />
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
        <p className="eyebrow">{lessonContextLabel}</p>
        <h2>{lessonHeading}</h2>
        <p className="lesson-objective-inline">{lesson.objective}</p>
      </div>
      <div className="game-topbar-actions">
          <div className={`timer-cluster ${mode === 'playing' && remainingSeconds <= 10 ? 'urgent' : ''}`}>
            <SandTimer remaining={remainingSeconds} total={sessionDuration + bonusCap} />
            <div className={`timer-card ${mode === 'playing' && remainingSeconds <= 10 ? 'urgent' : ''}`}>
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

  const renderGame = () => (
    <>
      <footer className={`command-bar ${mode === 'finished' ? 'finished-actions' : ''}`}>
        <button className="secondary-button" type="button" onClick={goSetup}>
          <Home size={18} />
          {mode === 'finished' ? '처음' : '설정으로'}
        </button>
        <div className="command-status">
          <span>풀이 기록 {records.length}개</span>
          {round > 1 && <span>{round}판째 · 기록 이어짐</span>}
          <span>{sessionDuration}초 수업</span>
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

      {/* 우리 반이 함께 채우는 길입니다. 아이는 자기 칸만 보게 되어 있어서,
          서른 문제가 '혼자 푸는 서른 개'로 끝납니다. 등수가 아니라 합계라
          늦게 푸는 아이도 채우는 데 낍니다.
          교실 뒤에서도 보여야 함께 채우는 맛이 나므로 제 줄을 씁니다.
          로켓이 나아가고 별에 불이 들어옵니다 — 얼마나 왔는지가 수보다
          그림으로 먼저 읽혀야 2학년이 다음 문제를 풀고 싶어집니다. */}
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
      </div>

      <section className={`game-layout individual players-${playerCount}`}>
        <section className="playfield" style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,.93), rgba(0,0,0,.88)), url(./assets/math-adventure-bg.png)' }}>
          <div
            className="player-lanes individual"
            style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 5)}, minmax(${playerCount >= 5 ? 180 : playerCount >= 4 ? 210 : 260}px, 1fr))` }}
          >
            {players.map((player) => {
              const state = playerStates[player.id] ?? fallbackStates[player.id];
              const playerQuestions = questionBanks[state.activeRetry?.level ?? state.level];
              const question = getPlayerQuestion(questionBanks, state);
              const result = playerResults[player.id] ?? { total: 0, correct: 0, wrong: 0 };
              const successActive = Boolean(successSignals[player.id]);
              const wrongActive = Boolean(wrongSignals[player.id]);
              return (
                <article
                  className={`player-lane student-question ${mode === 'finished' ? 'finished-result' : state.feedback} ${successActive ? 'success-signal' : ''} ${wrongActive ? 'wrong-signal' : ''}`}
                  key={player.id}
                  style={laneStyleFor(player.id)}
                >
                  <header>
                    <PlayerAvatar player={player} active={successActive} />
                    <strong>{player.name}</strong>
                    <small>{state.level} · {formatMs(state.responseMs)}</small>
                  </header>
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
                        </div>
                      )}

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
                            {guide.strong.length > 0 && (
                              <section className="lane-guide-block good">
                                <h4>잘한 문제</h4>
                                <ul className="lane-guide-kinds">
                                  {guide.strong.map((one) => (
                                    <li key={one.kind}>
                                      <strong>{one.kind}</strong>
                                      <span>{one.total}번 만나 모두 맞혔어요</span>
                                    </li>
                                  ))}
                                </ul>
                              </section>
                            )}

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
                                      <strong>{one.kind}</strong>
                                      <span>{one.total}번 중 {one.wrong}번 걸렸어요</span>
                                    </li>
                                  ))}
                                </ul>

                                <div className="lane-guide-advice">
                                  {guide.advice.map((line) => (
                                    <p className="lane-guide-line how" key={line}>
                                      <span>이렇게 해 봐요</span>{line}
                                    </p>
                                  ))}
                                  {guide.watchOut && (
                                    <p className="lane-guide-line"><span>조심할 곳</span>{guide.watchOut}</p>
                                  )}
                                  {guide.selfCheck && (
                                    <p className="lane-guide-line check"><span>다 풀고 나서</span>{guide.selfCheck}</p>
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
                      <div className={`student-question-body ${question.prompt.length > 70 ? 'long-question' : ''} ${question.prompt.length > 100 ? 'very-long-question' : ''}`.trim()}>
                        <div className="student-question-meta">
                          <span>{((state.activeRetry?.index ?? state.questionIndex) % playerQuestions.length) + 1} / {playerQuestions.length}</span>
                          {/* 아까 틀린 문제가 돌아왔다는 것을 알려 줍니다.
                              모르고 다시 틀리는 것과, 알고 다시 푸는 것은
                              아이에게 완전히 다른 일입니다. */}
                          {state.activeRetry !== null && <span className="retry-tag">다시 도전</span>}
                          <span>{question.strategy}</span>
                        </div>
                        <QuestionVisualGraphic visual={question.visual} />
                        <p>{question.prompt}</p>
                      </div>

                      {state.feedback === 'correct' && (
                        <div className="student-feedback correct-feedback">
                          <strong><CheckCircle2 size={18} /> 정답</strong>
                          <button type="button" onClick={() => nextForPlayer(player)}>다음 문제</button>
                        </div>
                      )}

                      {state.feedback === 'explain' && (
                        <div className="student-feedback wrong-feedback">
                          <strong><XCircle size={18} /> 짧은 도움</strong>
                          <div className="support-card quick-support-card" aria-label={`${player.name} 오답 도움`}>
                            <p className="quick-core"><span>핵심</span>{question.support.studentConcept}</p>
                            <p><span>볼 곳</span>{question.support.studentHint}</p>
                            <p><span>정답</span>{question.answer}</p>
                            <p className="quick-reason"><span>왜?</span>{question.support.steps[2]}</p>
                          </div>
                          <button type="button" onClick={() => nextForPlayer(player)}>다음 문제</button>
                        </div>
                      )}

                      <div className="student-answer-dock">
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
                                  <span className="choice-caption">{choice}</span>
                                </span>
                              ) : (
                                choice
                              )}
                            </button>
                          ))}
                        </div>
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
        <div className="brand">
          <span className="brand-mark"><GraduationCap size={24} /></span>
          <div>
            <h1>보조개샘ai클래스 수학 게임</h1>
            {mode === 'setup' && <p>{isMobileEntry ? '모바일 1인 참여' : '수업 설정'}</p>}
          </div>
        </div>
        {mode !== 'setup' && renderLessonBar()}
        <div className="header-actions">
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
          <button className="secondary-button fullscreen-button" type="button" onClick={toggleFullscreen}>
            {fullscreenActive ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            {fullscreenActive ? '전체화면 나가기' : '전체화면'}
          </button>
        </div>
      </header>

      {mode === 'setup' ? renderSetup() : renderGame()}

      <TeacherPanel
        isOpen={teacherOpen}
        onClose={() => setTeacherOpen(false)}
        records={records}
        players={players}
        lesson={lesson}
        currentQuestion={sampleQuestion}
      />

    </main>
  );
}

export default App;
