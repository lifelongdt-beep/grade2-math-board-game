export type Difficulty = '하' | '중' | '상';

export type SessionDuration = 30 | 60 | 120;

export type ConceptTag =
  | 'number'
  | 'placeValue'
  | 'addition'
  | 'subtraction'
  | 'shape'
  | 'solid'
  | 'measurement'
  | 'classification'
  | 'multiplication'
  | 'time'
  | 'data'
  | 'pattern';

export interface Lesson {
  id: string;
  semester: '2-1' | '2-2';
  unitNo: number;
  unitTitle: string;
  lessonNo: number;
  title: string;
  objective: string;
  achievement: string;
  tags: ConceptTag[];
  textbookFocus: string;
  workbookFocus: string;
}

export interface Unit {
  semester: '2-1' | '2-2';
  unitNo: number;
  title: string;
  lessons: Lesson[];
}

export interface Question {
  id: string;
  lessonId: string;
  difficulty: Difficulty;
  prompt: string;
  choices: string[];
  answerIndex: number;
  answer: string;
  explanation: string;
  misconception: string;
  type: ConceptTag;
  strategy: string;
  support: LearningSupport;
  visual?: QuestionVisual;
}

export interface LearningSupport {
  studentConcept: string;
  studentHint: string;
  coreConcept: string;
  readStrategy: string;
  steps: string[];
  misconceptionTip: string;
  textbookConnection: string;
  selfCheck: string;
}

export type PlaneShapeKind = 'circle' | 'triangle' | 'square' | 'rectangle' | 'parallelogram';

export interface PlaneShapeVisualItem {
  kind: PlaneShapeKind;
  active?: boolean;
  label?: string;
  rotate?: number;
}

export interface PlaneShapesVisual {
  kind: 'plane-shapes';
  label: string;
  items: PlaneShapeVisualItem[];
}

export interface CubeStackVisual {
  kind: 'cube-stack';
  label: string;
  cubes: Array<{
    x: number;
    y: number;
    z: number;
  }>;
}

export interface CubeViewPattern {
  label: '앞' | '옆' | '위' | '보임';
  cells: boolean[][];
}

export interface CubeViewsVisual {
  kind: 'cube-views';
  label: string;
  views: CubeViewPattern[];
}

export interface TangramVisual {
  kind: 'tangram';
  label: string;
}

// 자를 배우기 전에, 클립이나 뼘처럼 가까이 있는 것을 단위로 삼아 길이를
// 재어 보는 차시가 있습니다. 그때 자를 그려 주면 안 됩니다.
export interface UnitMeasureVisual {
  kind: 'unit-measure';
  label: string;
  object: string;
  unit: string;
  count: number;
}

export interface NumberLineVisual {
  kind: 'number-line';
  label: string;
  start: number;
  end: number;
  step: number;
  marks: Array<{
    value: number;
    label?: string;
    active?: boolean;
  }>;
  // 눈금은 보이되 숫자는 감출 자리입니다. 정답 자리에 숫자를 그대로 쓰면
  // 세어 보지 않고 답을 읽어 버립니다. 눈금만 두면 한 칸을 세어야 합니다.
  hiddenLabels?: number[];
}

export interface PlaceValueVisual {
  kind: 'place-value';
  label: string;
  columns: Array<{
    label: string;
    value: number;
    blocks?: number;
  }>;
}

export interface BarModelVisual {
  kind: 'bar-model';
  label: string;
  bars: Array<{
    label: string;
    value: number;
  }>;
}

export interface RulerVisual {
  kind: 'ruler';
  label: string;
  start: number;
  end: number;
  highlightStart: number;
  highlightEnd: number;
}

export interface ClockVisual {
  kind: 'clock';
  label: string;
  hour: number;
  minute: number;
  endHour?: number;
  endMinute?: number;
  /** 바늘이 실제 정답 시각이 아니라 시계 모양을 보여 주는 예시일 때 true */
  example?: boolean;
}

export interface TableVisual {
  kind: 'table';
  label: string;
  categoryLabel: string;
  valueLabel: string;
  /** value가 null이면 학생이 채워야 할 빈칸으로 표시합니다. */
  columns: Array<{
    name: string;
    value: number | null;
  }>;
  totalLabel?: string;
  total?: number | null;
}

export interface CalendarVisual {
  kind: 'calendar';
  label: string;
  /** 1일이 놓이는 요일 (0=일 ... 6=토) */
  startWeekday: number;
  days: number;
  marks: Array<{
    day: number;
    tone: 'start' | 'end';
  }>;
}

export interface PictographVisual {
  kind: 'pictograph';
  label: string;
  unit: number;
  items: Array<{
    label: string;
    count: number;
  }>;
}

export interface ArrayVisual {
  kind: 'array';
  label: string;
  rows: number;
  columns: number;
  fadedRows?: number;
}

export interface PatternVisual {
  kind: 'pattern';
  label: string;
  items: string[];
  missingIndex?: number;
}

export type QuestionVisual =
  | PlaneShapesVisual
  | CubeStackVisual
  | CubeViewsVisual
  | TangramVisual
  | NumberLineVisual
  | UnitMeasureVisual
  | PlaceValueVisual
  | BarModelVisual
  | RulerVisual
  | ClockVisual
  | TableVisual
  | CalendarVisual
  | PictographVisual
  | ArrayVisual
  | PatternVisual;

export interface Player {
  id: number;
  attendanceNo: number;
  name: string;
  color: string;
  difficulty: Difficulty;
}

export interface PlayerQuestionState {
  questionIndex: number;
  selected: number | null;
  correct: boolean | null;
  locked: boolean;
  responseMs?: number;
  questionStartedAt: number;
  feedback: 'idle' | 'correct' | 'explain';
  // 틀린 문제는 설명만 보고 넘어가면 '봤다'로 끝납니다. 몇 문제 뒤에 다시
  // 만나 스스로 풀어 봐야 '할 수 있다'가 됩니다.
  // answered: 이 학생이 지금까지 끝낸 문제 수 (되돌아올 때를 재는 자)
  // retries: 다시 낼 문제들. index는 문제 은행 자리, dueAt은 몇 번째에 낼지
  // activeRetry: 지금 화면에 떠 있는 것이 되돌아온 문제라면 그 자리
  answered: number;
  retries: Array<{ index: number; dueAt: number }>;
  activeRetry: number | null;
}

export interface AnswerRecord {
  id: string;
  playerId: number;
  playerName: string;
  questionId: string;
  lessonId: string;
  unitTitle: string;
  lessonTitle: string;
  difficulty: Difficulty;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
  misconception: string;
  type: ConceptTag;
  strategy: string;
  support: LearningSupport;
  visual?: QuestionVisual;
  correct: boolean;
  attempts: number;
  responseMs: number;
  answeredAt: string;
}
