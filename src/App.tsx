import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import QRCode from 'qrcode';
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Crown,
  GraduationCap,
  Home,
  Maximize2,
  Medal,
  Minimize2,
  MonitorUp,
  QrCode,
  RefreshCcw,
  Rocket,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import { QuestionVisualGraphic } from './components/QuestionVisualGraphic';
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
const playerIcons = [Rocket, Star, Trophy, Crown, Medal] as const;
let successSoundUrl: string | null = null;
const durations: SessionDuration[] = [30, 60, 120];
const difficultyLevels: Difficulty[] = ['상', '중', '하'];
const attendanceNumbers = Array.from({ length: 30 }, (_, index) => index + 1);

type StudentConfig = {
  attendanceNo: number;
  difficulty: Difficulty;
};

type SetupStep = 'attendance' | 'difficulty' | 'ready';

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
  }));

const createQuestionState = (players: Player[], now = Date.now()): Record<number, PlayerQuestionState> =>
  Object.fromEntries(
    players.map((player, index) => [
      player.id,
      {
        questionIndex: index * 4,
        selected: null,
        correct: null,
        locked: false,
        feedback: 'idle',
        questionStartedAt: now,
      },
    ]),
  );

const formatMs = (ms?: number) => (ms ? `${(ms / 1000).toFixed(1)}초` : '-');

const getPlayerQuestion = (questions: Question[], state: PlayerQuestionState) =>
  questions[state.questionIndex % questions.length];

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
  return shuffledBySeed(
    questions,
    `${scope}-${difficulty}-${bankSeed}-${lessons.map((item) => item.id).join('|')}`,
  );
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

// 아이들이 좋아하는 소리는 짧고 통통 튀는 소리입니다.
// 정답은 위로 올라가는 반짝 소리, 오답은 혼내는 소리가 아니라
// "다시 해 보자" 느낌의 부드럽게 내려오는 소리로 만듭니다.
type Blip = {
  frequency: number;
  at: number;
  length: number;
  volume?: number;
  type?: OscillatorType;
  slideTo?: number;
};

const playBlips = (blips: Blip[], fallback?: () => void) => {
  try {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      fallback?.();
      return;
    }

    const context = new AudioContextConstructor();
    const now = context.currentTime;
    let latest = 0;

    blips.forEach((blip) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + blip.at;
      const stopAt = startAt + blip.length;
      const peak = blip.volume ?? 0.16;

      oscillator.type = blip.type ?? 'sine';
      oscillator.frequency.setValueAtTime(blip.frequency, startAt);
      if (blip.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(blip.slideTo, stopAt);
      }

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(stopAt);
      latest = Math.max(latest, blip.at + blip.length);
    });

    window.setTimeout(() => void context.close(), (latest + 0.2) * 1000);
  } catch {
    fallback?.();
  }
};

// 정답: 도-미-솔-도로 올라간 뒤 반짝하고 마무리합니다.
const playSuccessSound = () => {
  playBlips(
    [
      { frequency: 523.25, at: 0, length: 0.1, type: 'triangle' },
      { frequency: 659.25, at: 0.075, length: 0.1, type: 'triangle' },
      { frequency: 783.99, at: 0.15, length: 0.11, type: 'triangle' },
      { frequency: 1046.5, at: 0.23, length: 0.2, volume: 0.19, type: 'triangle' },
      { frequency: 1568, at: 0.3, length: 0.16, volume: 0.08 },
    ],
    playSuccessSoundFallback,
  );
};

// 오답: 낮고 짧게 두 번 "뽀용" 하고 부드럽게 내려옵니다.
const playWrongSound = () => {
  playBlips([
    { frequency: 392, at: 0, length: 0.13, volume: 0.13, type: 'triangle' },
    { frequency: 311.13, at: 0.11, length: 0.24, volume: 0.13, type: 'triangle', slideTo: 261.63 },
  ]);
};

// 보기나 번호를 누를 때 나는 아주 짧은 "톡" 소리입니다.
const playTapSound = () => {
  playBlips([{ frequency: 880, at: 0, length: 0.05, volume: 0.07, type: 'triangle' }]);
};

// 한 단계를 마쳤을 때 나는 "딩동" 소리입니다.
const playReadySound = () => {
  playBlips([
    { frequency: 783.99, at: 0, length: 0.09, volume: 0.1, type: 'triangle' },
    { frequency: 1046.5, at: 0.07, length: 0.14, volume: 0.1, type: 'triangle' },
  ]);
};

// 남은 시간만큼 위쪽 모래가 남고, 지난 만큼 아래에 쌓입니다.
// 숫자를 빨리 못 읽는 아이도 모래를 보고 시간을 가늠할 수 있습니다.
const SandTimer = ({ remaining, total }: { remaining: number; total: number }) => {
  const left = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;
  const TOP_FLOOR = 16.4;
  const TOP_CEILING = 5;
  const BOTTOM_FLOOR = 29;
  const BOTTOM_CEILING = 17.6;
  const topHeight = (TOP_FLOOR - TOP_CEILING) * left;
  const bottomHeight = (BOTTOM_FLOOR - BOTTOM_CEILING) * (1 - left);

  return (
    <svg
      className="sand-timer"
      viewBox="0 0 26 34"
      width="23"
      height="30"
      role="img"
      aria-label={`남은 시간 ${remaining}초`}
    >
      <defs>
        <clipPath id="sand-timer-top">
          <path d="M5 5 H21 L13.6 16.4 H12.4 Z" />
        </clipPath>
        <clipPath id="sand-timer-bottom">
          <path d="M12.4 17.6 H13.6 L21 29 H5 Z" />
        </clipPath>
      </defs>

      {/* 유리 */}
      <path d="M5 5 H21 L13.6 16.4 H12.4 Z" fill="#fffdf4" />
      <path d="M12.4 17.6 H13.6 L21 29 H5 Z" fill="#fffdf4" />

      {/* 모래 */}
      <rect
        x="4"
        y={TOP_FLOOR - topHeight}
        width="18"
        height={topHeight}
        fill="#f5b301"
        clipPath="url(#sand-timer-top)"
      />
      <rect
        x="4"
        y={BOTTOM_FLOOR - bottomHeight}
        width="18"
        height={bottomHeight}
        fill="#f5b301"
        clipPath="url(#sand-timer-bottom)"
      />
      {left > 0 && left < 1 && <rect className="sand-timer-fall" x="12.6" y="16" width="0.9" height="7" fill="#f5b301" />}

      {/* 테두리와 나무틀 */}
      <path
        d="M5 5 H21 L13.6 16.4 H12.4 Z M12.4 17.6 H13.6 L21 29 H5 Z"
        fill="none"
        stroke="#b9812a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="3" y="1.6" width="20" height="3.4" rx="1.7" fill="#c98f2f" />
      <rect x="3" y="29" width="20" height="3.4" rx="1.7" fill="#c98f2f" />
    </svg>
  );
};

const PlayerAvatar = ({ player, active = false }: { player: Player; active?: boolean }) => {
  const Icon = playerIcons[(player.id - 1) % playerIcons.length];

  return (
    <span
      className={`player-avatar ${active ? 'success' : ''}`}
      style={{ borderColor: player.color, color: player.color }}
      aria-hidden="true"
    >
      <Icon size={18} strokeWidth={3} />
    </span>
  );
};

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

  useEffect(() => {
    if (mode !== 'setup') return;
    setStudentSetupSteps(createStudentSetupSteps(playerCount));
  }, [lesson.id, mode, playerCount]);

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
  const getQuestionForPlayer = (player: Player, state: PlayerQuestionState) =>
    getPlayerQuestion(questionBanks[player.difficulty], state);
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
        ...nextConfig,
      },
    }));
  };

  const selectAttendanceNumber = (studentId: number, attendanceNo: number) => {
    playTapSound();
    updateStudentConfig(studentId, { attendanceNo });
    setStudentSetupSteps((prev) => ({ ...prev, [studentId]: 'difficulty' }));
  };

  const chooseDifficulty = (studentId: number, difficulty: Difficulty) => {
    // 난이도까지 고르면 준비가 끝나므로 '딩동' 하고 두 음을 냅니다.
    playReadySound();
    updateStudentConfig(studentId, { difficulty });
    setStudentSetupSteps((prev) => ({ ...prev, [studentId]: 'ready' }));
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
    setMode('setup');
    setTeacherOpen(false);
    setRecords([]);
    setSuccessSignals({});
    setPlayerStates(createQuestionState(players));
    setRemainingSeconds(sessionDuration);
    setStudentSetupSteps(createStudentSetupSteps(playerCount));
  };

  const resetSession = () => {
    const now = Date.now();
    setRecords([]);
    setSuccessSignals({});
    setBankSeed(Math.floor(Math.random() * 1_000_000_000));
    setPlayerStates(createQuestionState(players, now));
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

  const nextForPlayer = (player: Player) => {
    setPlayerStates((prev) => ({
      ...prev,
      [player.id]: {
        questionIndex: (prev[player.id]?.questionIndex ?? 0) + players.length,
        selected: null,
        correct: null,
        locked: false,
        feedback: 'idle',
        questionStartedAt: Date.now(),
      },
    }));
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

  const triggerSuccessSignal = (playerId: number) => {
    const token = Date.now();
    playSuccessSound();
    setSuccessSignals((prev) => ({ ...prev, [playerId]: token }));
    window.setTimeout(() => {
      setSuccessSignals((prev) => {
        if (prev[playerId] !== token) return prev;
        const { [playerId]: _removed, ...rest } = prev;
        return rest;
      });
    }, 720);
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
      attempts: 1,
      responseMs,
      answeredAt: new Date().toISOString(),
    };

    if (isCorrect) {
      triggerSuccessSignal(player.id);
    } else {
      triggerWrongSignal(player.id);
    }

    setRecords((prev) => [...prev, record]);
    setPlayerStates((prev) => {
      const currentState = prev[player.id] ?? state;

      if (isCorrect) {
        return {
          ...prev,
          [player.id]: {
            questionIndex: currentState.questionIndex + players.length,
            selected: null,
            correct: null,
            locked: false,
            feedback: 'idle',
            questionStartedAt: Date.now(),
          },
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
          <span><Sparkles size={18} /> {reviewScope === 'lesson' ? '학생별 개별 문항' : '종합 랜덤 문항'}</span>
          {!isMobileEntry && (
            <button className="mobile-join-toggle" type="button" onClick={() => setMobileJoinOpen(true)}>
              <QrCode size={18} />
              모바일 QR
            </button>
          )}
        </div>
      </div>

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
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.94), rgba(255,255,255,.82)), url(/assets/math-adventure-bg.png)',
        }}
      >
        <div className="setup-progress">
          <span><Users size={16} /> {isMobileEntry ? `내 준비 ${readyPlayerCount} / 1` : `학생 준비 ${readyPlayerCount} / ${playerCount}`}</span>
          <span>{isMobileEntry ? '번호와 난이도 선택 후 자동 시작' : '출석번호 선택 후 난이도를 고르면 자동 시작'}</span>
        </div>

        <div
          className="player-lanes individual setup-lanes"
          style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 5)}, minmax(${playerCount >= 5 ? 220 : playerCount >= 4 ? 240 : 280}px, 1fr))` }}
        >
          {players.map((player) => {
            const step = studentSetupSteps[player.id] ?? 'attendance';
            const config = studentConfigs[player.id] ?? { attendanceNo: player.id, difficulty: '중' as Difficulty };

            return (
              <article
                className={`player-lane setup-player-lane ${step}`}
                key={player.id}
                style={laneStyleFor(player.id)}
              >
                <header>
                  <PlayerAvatar player={player} />
                  <strong>{player.id}번 자리</strong>
                  <small>{step === 'attendance' ? '번호 선택' : step === 'difficulty' ? `${config.attendanceNo}번` : '준비 완료'}</small>
                </header>

                {step === 'attendance' && (
                  <div className="setup-step-card">
                    <span className="result-kicker">1단계</span>
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

                {step === 'difficulty' && (
                  <div className="setup-step-card">
                    <span className="result-kicker">2단계</span>
                    <strong>{config.attendanceNo}번 난이도</strong>
                    <div className="difficulty-choice-grid">
                    {difficultyLevels.map((level) => (
                      <button
                        type="button"
                        key={level}
                        onClick={() => chooseDifficulty(player.id, level)}
                      >
                        {level}
                      </button>
                    ))}
                    </div>
                  </div>
                )}

                {step === 'ready' && (
                  <div className="setup-ready-card">
                    <CheckCircle2 size={30} />
                    <strong>{config.attendanceNo}번 · {config.difficulty}</strong>
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

  const renderGame = () => (
    <>
      <section className="game-topbar">
        <div>
          <p className="eyebrow">{lessonContextLabel}</p>
          <h2>{lessonHeading}</h2>
          <p className="lesson-objective-inline">{lesson.objective}</p>
        </div>
        <div className="game-topbar-actions">
          <div className={`timer-card ${mode === 'playing' && remainingSeconds <= 10 ? 'urgent' : ''}`}>
            <Timer size={22} />
            <strong>{remainingSeconds}초</strong>
            <SandTimer remaining={remainingSeconds} total={sessionDuration} />
          </div>
          {!isMobileEntry && (
            <button className="teacher-button" type="button" onClick={() => setTeacherOpen(true)}>
              <MonitorUp size={19} />
              교사용 분석
            </button>
          )}
        </div>
      </section>

      <footer className={`command-bar ${mode === 'finished' ? 'finished-actions' : ''}`}>
        <button className="secondary-button" type="button" onClick={goSetup}>
          <Home size={18} />
          {mode === 'finished' ? '처음' : '설정으로'}
        </button>
        <div className="command-status">
          <span>풀이 기록 {records.length}개</span>
          <span>{sessionDuration}초 수업</span>
          <span>{mode === 'finished' ? '시간 종료' : '진행 중'}</span>
        </div>
        <button className="primary-button" type="button" onClick={resetSession}>
          <RefreshCcw size={18} />
          {mode === 'finished' ? '다시 풀기' : '다시 시작'}
        </button>
      </footer>

      <section className={`game-layout individual players-${playerCount}`}>
        <section className="playfield" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.94), rgba(255,255,255,.82)), url(/assets/math-adventure-bg.png)' }}>
          <div className="round-status">
            <span><BarChart3 size={16} /> 정답률 {accuracy}%</span>
            <span>정답 {correctCount}개</span>
            <span>오답 {wrongCount}개</span>
          <span>{reviewScope === 'lesson' ? '유형 다양화 문항' : `${scopedLessons.length}개 차시 랜덤`}</span>
          </div>

          <div
            className="player-lanes individual"
            style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 5)}, minmax(${playerCount >= 5 ? 180 : playerCount >= 4 ? 210 : 260}px, 1fr))` }}
          >
            {players.map((player) => {
              const state = playerStates[player.id] ?? fallbackStates[player.id];
              const playerQuestions = questionBanks[player.difficulty];
              const question = getPlayerQuestion(playerQuestions, state);
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
                    <small>{player.difficulty} · {formatMs(state.responseMs)}</small>
                  </header>
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
                    </div>
                  ) : (
                    <>
                      <div className={`student-question-body ${question.prompt.length > 70 ? 'long-question' : ''} ${question.prompt.length > 100 ? 'very-long-question' : ''}`.trim()}>
                        <div className="student-question-meta">
                          <span>{(state.questionIndex % playerQuestions.length) + 1} / {playerQuestions.length}</span>
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
                        <div className="choice-grid">
                          {question.choices.map((choice, index) => (
                            <button
                              type="button"
                              key={`${question.id}-${player.id}-${choice}`}
                              className={state.selected === index ? 'selected' : ''}
                              onClick={() => answerQuestion(player, question, index)}
                              disabled={state.locked}
                            >
                              <span>{index + 1}</span>
                              {choice}
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
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark"><GraduationCap size={24} /></span>
          <div>
            <h1>{isMobileEntry ? '개인 모바일 수학게임' : '2학년 수학 보드게임'}</h1>
            <p>{mode === 'setup' ? (isMobileEntry ? '모바일 1인 참여' : '수업 설정') : reviewScope === 'lesson' ? `${semester} · ${selectedUnit.title} · ${lesson.lessonNo}차시` : lessonContextLabel}</p>
          </div>
        </div>
        <div className="header-actions">
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
