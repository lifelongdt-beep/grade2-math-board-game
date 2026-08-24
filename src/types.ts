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

// 차시가 '무엇을 물어도 되는가'를 적어 둔 선언입니다.
//
// 지금까지 문항 생성기는 차시 제목 문자열을 보고 갈래를 정했습니다
// (lesson.title.includes('몇백') 같은 식). 제목이 조금만 달라도 조용히
// 어긋나고, 그래서 2단 차시에 3단이 나오거나 자를 배우기 전 차시에 자
// 그림이 나오는 일이 반복됐습니다. 그런 판단을 제목이 아니라 이 선언에서
// 읽어 오면, 어긋남을 테스트가 아니라 구조가 막습니다.
export interface LessonScope {
  // 이 차시에서 다루어도 되는 가장 큰 수입니다.
  maxNumber: number;
  // 곱셈구구에서 이 차시가 다루는 단입니다. 없으면 곱셈구구 차시가 아닙니다.
  dans?: number[];
  // 수학적 표현의 단계입니다. 지도서가 차시마다 정해 둔 것으로,
  //   concrete  구체물(수 모형, 바둑돌, 클립)로 다루는 단계
  //   semi      반구체물(그림, ○△)로 다루는 단계
  //   symbolic  기호와 식으로 다루는 단계
  // 아직 구체물 단계인 차시에 기호만 있는 문제를 내면 아이가 붙잡을 것이
  // 없어집니다. 반대로 기호 단계에 구체물만 주면 되돌아가는 셈입니다.
  representation: 'concrete' | 'semi' | 'symbolic';
  // 이 차시에서 쓰면 안 되는 그림입니다. 아직 배우지 않은 도구를 그려
  // 주면 그것부터 설명해야 합니다(자를 배우기 전의 자 그림처럼).
  forbidVisuals?: string[];
}

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
  scope: LessonScope;
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
  // 같은 문제가 여러 번 만들어지면 뒤에 다른 안내 문구를 붙여 구별합니다.
  // 그러면 글자는 달라도 학생에게는 같은 문제라, 겹치는지 보려면 붙이기
  // 전의 문장이 필요합니다.
  basePrompt?: string;
  choices: string[];
  // 보기가 그림일 때 씁니다. 도형을 고르거나 그래프를 고르는 문항은
  // 글로는 물을 수가 없습니다 — '삼각형'이라고 적어 놓고 고르게 하면
  // 도형을 알아보는지가 아니라 낱말을 아는지 묻게 됩니다.
  // choices와 자리를 맞춘 배열이고, 글 대신 이 그림을 보여 줍니다.
  choiceVisuals?: QuestionVisual[];
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

// open-triangle: 곧은 선 셋으로 그렸지만 한쪽이 벌어져 닫히지 않은
// 도형입니다. '삼각형이 아닌 까닭'을 묻는 문제에는 삼각형이 아닌 것을
// 보여 주어야 아이가 무엇을 살펴야 하는지 알 수 있습니다.
export type PlaneShapeKind = 'circle' | 'triangle' | 'square' | 'rectangle' | 'parallelogram' | 'open-triangle';

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

// 쌓은 모양이 차례로 늘어나는 규칙을 보여 줍니다. 낱개 수만 글로 적어
// 두면 아이는 쌓기나무가 아니라 수만 봅니다 — 이 차시는 '쌓은 모양에서'
// 규칙을 찾는 차시입니다.
export interface CubePatternVisual {
  kind: 'cube-pattern';
  label: string;
  steps: number[];
  // 물음표로 비워 둘 자리입니다(다음에 놓을 모양, 가운데 빈 자리).
  unknownIndex?: number;
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

// 곱셈표·덧셈표입니다. 규칙 찾기 단원에서 '표를 보고 규칙을 말하는' 문제에
// 씁니다. 표 자체가 학습 자료이므로 값을 채워서 보여 주고, 계산해서 답을
// 내야 하는 칸만 비워 둡니다.
export interface GridTableVisual {
  kind: 'grid-table';
  label: string;
  operation: '×' | '+';
  rows: number[];
  columns: number[];
  blank?: { row: number; column: number };
  highlightRow?: number;
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
  // 231cm처럼 긴 길이는 0부터 다 그릴 수 없습니다. 왼쪽을 물결로
  // 끊어 '앞은 생략했다'고 알리고 오른쪽 끝만 제대로 보여 줍니다.
  elided?: boolean;
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
  /**
   * 바늘 없이 시계판만 그립니다. '11시 15분일 때 긴바늘은 어느 수를
   * 가리킬까요?'처럼 바늘 자리가 곧 답인 문제에서는 바늘을 그리면
   * 답을 그려 주는 셈입니다. 판만 있으면 5씩 세어 볼 수 있어 도움이
   * 되면서 답은 가려집니다.
   */
  blank?: boolean;
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
  /**
   * 학생이 채워야 할 줄입니다. 그 줄은 칸을 그리지 않고 물음표만 두어
   * '여기를 네가 채워라'로 보이게 합니다. 성취수준 [2수04-03]의 C가
   * '일부가 주어진 그래프를 완성하기'라, 빈 줄이 있어야 담을 수 있습니다.
   */
  blankAt?: number;
  /**
   * 그래프를 세우는 방향입니다. 교과서의 그래프는 항목을 가로줄에 두고
   * ○를 아래에서 위로 쌓습니다. '아래에서부터 한 칸에 하나씩 그립니다'
   * 라고 말해 놓고 옆으로 눕혀 그리면, 아이가 배우는 그림과 보는 그림이
   * 다릅니다. 적지 않으면 옆으로 눕혀 그립니다.
   */
  orientation?: 'up' | 'right';
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
  | CubePatternVisual
  | CubeViewsVisual
  | TangramVisual
  | NumberLineVisual
  | GridTableVisual
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
  // 아이가 고른 동물입니다. 자리 색만으로는 "빨강 자리"라고 부르게 되는데,
  // 아이들은 "내 여우"라고 부르는 쪽을 훨씬 좋아합니다.
  avatar: string;
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
  // 되돌아온 문제는 그때 풀던 수준의 문제집에서 꺼냅니다. 수준마다 문제집이
  // 다르므로 번호만으로는 같은 문제를 다시 찾을 수 없습니다.
  // tries: 이 문제가 지금까지 몇 번 나왔는지. 두 번까지만 되돌아옵니다.
  retries: Array<{ index: number; level: Difficulty; dueAt: number; tries: number }>;
  activeRetry: { index: number; level: Difficulty; tries: number } | null;
  // 풀면서 수준이 오르내립니다. 시작은 하, 연속 3번 맞히면 한 단계 위로,
  // 틀리면 한 단계 아래로 갑니다. 아이를 상·중·하로 미리 나누지 않고
  // 지금 이 아이에게 맞는 문제를 계속 찾아가는 방식입니다.
  level: Difficulty;
  // 방금 수준이 바뀌었는지입니다. 지금까지는 하에서 중으로 올라가도
  // 아무 말이 없어서, 아이는 자기가 올라간 것을 몰랐습니다. 게임에서
  // 레벨업이라고 부르는 그 순간이 여기인데 조용히 지나갔습니다.
  justMoved: 'up' | 'down' | null;
  // streak: 연속 정답 수. 3이 되면 한 단계 올라갑니다.
  // missStreak: 연속 오답 수. 2가 되어야 한 단계 내려갑니다. 한 번 틀렸다고
  // 바로 내리면, 손이 미끄러진 한 번으로 풀 수 있던 수준을 잃습니다.
  streak: number;
  missStreak: number;
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
  // 아이가 실제로 누른 보기입니다. 무엇을 골랐는지가 남아 있어야
  // 오답 노트에서 "48+25를 63이라고 했구나" 하고 짚어 줄 수 있습니다.
  chosen: string;
  attempts: number;
  responseMs: number;
  answeredAt: string;
  // 틀렸을 때, 고른 보기가 무엇을 뜻하는지입니다.
  // 48+25를 63으로 고른 아이와 73으로 고른 아이는 서로 다른 도움이
  // 필요한데, '오답'으로만 적으면 그 차이가 사라집니다.
  chosenMeaning?: string;
}
