import type { ConceptTag, Difficulty, LearningSupport, Lesson, PlaneShapeVisualItem, Question, QuestionVisual } from '../types';

const difficultyIndex: Record<Difficulty, number> = {
  하: 0,
  중: 1,
  상: 2,
};

const difficultyDesign: Record<Difficulty, { label: string; solutionLead: string }> = {
  하: {
    label: '기초',
    solutionLead: '한 가지 핵심만 확인하면 풀 수 있습니다.',
  },
  중: {
    label: '적용',
    solutionLead: '개념을 문제 상황에 맞게 적용해야 합니다.',
  },
  상: {
    label: '도전',
    solutionLead: '조건을 끝까지 읽고 핵심 단서를 차례대로 확인해야 합니다.',
  },
};

const variantForDifficulty = (difficulty: Difficulty, index: number, total: number, easyCount = 2) => {
  if (difficulty === '하') {
    return index % Math.max(1, Math.min(easyCount, total));
  }

  const offset = difficulty === '중' ? Math.max(1, easyCount - 1) : Math.max(2, easyCount);
  return (index + offset) % total;
};

const tagLabel: Record<ConceptTag, string> = {
  number: '수 세기와 크기 비교',
  placeValue: '자리값 이해',
  addition: '덧셈 전략',
  subtraction: '뺄셈 전략',
  shape: '도형 구별과 구성',
  solid: '쌓기나무 모양 관찰',
  measurement: '길이와 측정',
  classification: '분류 기준',
  multiplication: '곱셈 의미와 구구단',
  time: '시각과 시간',
  data: '표와 그래프 해석',
  pattern: '규칙 찾기',
};

const tagAdvice: Record<ConceptTag, string> = {
  number: '수를 비교하거나 세어 볼 때는 어느 자리부터 달라지는지, 얼마씩 변하는지 먼저 확인합니다.',
  placeValue: '자리값은 숫자가 놓인 위치가 정합니다. 백의 자리 4는 4가 아니라 400을 뜻합니다.',
  addition: '덧셈은 일의 자리와 십의 자리를 나누어 보고, 받아올림이 생기는지 확인하면 안정적입니다.',
  subtraction: '뺄셈은 빼야 할 수와 남는 수를 구별하고, 필요하면 십을 10개로 풀어 받아내림합니다.',
  shape: '도형은 크기나 방향이 달라도 변, 꼭짓점, 둥근 선 같은 특징으로 구별합니다.',
  solid: '쌓기나무는 보이는 칸만 세지 말고 위, 앞, 옆에서 본 모양과 숨어 있는 나무를 함께 생각합니다.',
  measurement: '길이는 같은 단위끼리 비교하고, 자로 잴 때는 시작점과 끝점의 눈금 차를 봅니다.',
  classification: '분류는 한 가지 기준을 정하고 빠짐과 겹침이 없도록 나누는 활동입니다.',
  multiplication: '곱셈은 같은 수가 여러 묶음 있는 상황입니다. 한 묶음의 수와 묶음 수를 구별합니다.',
  time: '시각은 한 순간이고 시간은 두 시각 사이의 길이입니다. 60분은 1시간입니다.',
  data: '자료는 항목별 수, 전체 수, 차이를 읽고 그 결과로 알 수 있는 내용을 말해야 합니다.',
  pattern: '규칙은 반복되는 묶음이나 일정하게 변하는 양을 찾고 말로 설명하는 것이 핵심입니다.',
};

const coreConceptGuide: Record<ConceptTag, string> = {
  number: '수의 크기와 순서는 자릿값, 기준 수, 뛰어 세는 간격으로 결정됩니다.',
  placeValue: '같은 숫자라도 어느 자리에 있는지에 따라 나타내는 값이 달라집니다.',
  addition: '같은 자리끼리 더하고, 10개가 모이면 바로 왼쪽 자리로 받아올림합니다.',
  subtraction: '같은 자리끼리 빼고, 부족하면 윗자리의 1묶음을 10개로 바꾸어 받아내림합니다.',
  shape: '도형은 방향이나 크기보다 변, 꼭짓점, 곧은 선과 굽은 선 같은 성질로 구별합니다.',
  solid: '쌓기나무 모양은 보이는 것뿐 아니라 가려진 부분과 보는 방향을 함께 생각합니다.',
  measurement: '길이는 같은 단위로 재고, 자에서는 끝 눈금에서 시작 눈금을 뺀 값이 실제 길이입니다.',
  classification: '분류는 한 가지 기준을 끝까지 적용해 빠지거나 겹치는 것이 없게 나누는 것입니다.',
  multiplication: '곱셈은 같은 수가 여러 묶음 있을 때 전체를 빠르게 구하는 방법입니다.',
  time: '시각은 어느 한 순간이고, 시간은 두 시각 사이의 길이입니다. 60분은 1시간입니다.',
  data: '표와 그래프는 항목별 수, 차이, 전체 수를 읽고 비교해서 의미를 찾습니다.',
  pattern: '규칙은 반복되는 모양이나 일정하게 변하는 양을 찾아 다음을 예상하는 힘입니다.',
};

const studentConceptGuide: Record<ConceptTag, string> = {
  number: '얼마씩 커지거나 작아지는지 보세요.',
  placeValue: '숫자가 어느 자리에 있는지 보세요.',
  addition: '같은 자리끼리 더하세요.',
  subtraction: '같은 자리끼리 빼세요.',
  shape: '변과 꼭짓점을 세어 보세요.',
  solid: '보이는 방향과 숨은 부분을 같이 보세요.',
  measurement: '시작 눈금과 끝 눈금의 차를 보세요.',
  classification: '나누는 기준을 하나만 정하세요.',
  multiplication: '한 묶음의 수와 묶음 수를 찾으세요.',
  time: '시각인지 시간인지 먼저 보세요.',
  data: '묻는 항목의 수를 찾아 비교하세요.',
  pattern: '반복되거나 변하는 규칙을 찾으세요.',
};

const studentHintGuide: Record<ConceptTag, string> = {
  number: '앞뒤 수의 차이를 먼저 확인해요.',
  placeValue: '백, 십, 일의 자리를 손가락으로 짚어 봐요.',
  addition: '일의 자리부터 계산하고 10이 넘는지 봐요.',
  subtraction: '어느 수에서 어느 수를 빼는지 다시 읽어요.',
  shape: '그림이 돌아가 있어도 성질은 그대로예요.',
  solid: '아래층부터 차례대로 확인해요.',
  measurement: '끝 눈금만 읽지 말고 시작 눈금을 빼요.',
  classification: '같은 기준에 맞는 것끼리만 모아요.',
  multiplication: '같은 수가 몇 번 있는지 세어 봐요.',
  time: '60분이 1시간이라는 점을 떠올려요.',
  data: '표 제목과 항목 이름을 먼저 읽어요.',
  pattern: '처음부터 같은 규칙이 이어지는지 확인해요.',
};

const readStrategyGuide: Record<ConceptTag, string> = {
  number: '기준 수와 변화량을 먼저 찾은 뒤 어느 자리의 수가 변하는지 봅니다.',
  placeValue: '숫자가 몇 개인지가 아니라 백, 십, 일 중 어느 자리에 놓였는지 먼저 봅니다.',
  addition: '더하는 수를 같은 자리끼리 세로로 맞추고 일의 자리부터 계산합니다.',
  subtraction: '전체에서 빼는 것인지, 두 수의 차이를 구하는 것인지 먼저 구별합니다.',
  shape: '그림의 방향에 끌려가지 말고 변과 꼭짓점의 개수를 손가락으로 짚어 봅니다.',
  solid: '위, 앞, 옆에서 본 모양 중 문제에서 요구하는 방향을 먼저 확인합니다.',
  measurement: '몇 cm에서 시작해 몇 cm에서 끝나는지 두 눈금을 먼저 표시합니다.',
  classification: '무엇으로 나누라는 문제인지 기준 낱말을 먼저 찾습니다.',
  multiplication: '한 묶음에 몇 개인지와 그런 묶음이 몇 개인지를 따로 표시합니다.',
  time: '시작 시각, 끝 시각, 구해야 하는 것이 시각인지 시간인지 먼저 나눕니다.',
  data: '표 제목과 항목 이름을 먼저 읽고, 묻는 항목의 수만 골라 봅니다.',
  pattern: '앞에서 반복되는 묶음이나 계속 더해지는 수를 먼저 표시합니다.',
};

const misconceptionGuide: Record<ConceptTag, string> = {
  number: '가장 가까이 보이는 숫자를 고르지 말고, 기준에서 몇씩 움직였는지 다시 세어 보세요.',
  placeValue: '숫자 모양만 보고 답하지 마세요. 4가 백의 자리에 있으면 4가 아니라 400입니다.',
  addition: '십의 자리와 일의 자리를 섞어 더하면 답이 달라집니다. 같은 자리끼리만 계산하세요.',
  subtraction: '작은 수에서 큰 수를 그냥 빼려고 하면 안 됩니다. 어느 수에서 어느 수를 빼는지 다시 읽으세요.',
  shape: '도형이 돌려져 있어도 같은 도형일 수 있습니다. 방향보다 성질을 확인하세요.',
  solid: '눈에 보이는 나무만 세면 숨어 있는 나무를 놓칠 수 있습니다. 아래층부터 확인하세요.',
  measurement: '자를 0이 아닌 곳에서 대면 끝 눈금만 답이 아닙니다. 끝 눈금에서 시작 눈금을 빼야 합니다.',
  classification: '두 기준을 한꺼번에 쓰면 헷갈립니다. 한 문제에서는 한 기준으로만 나누세요.',
  multiplication: '묶음 수와 한 묶음의 수를 바꾸어 읽으면 상황 설명이 틀릴 수 있습니다.',
  time: '분은 60이 되면 1시간으로 바뀝니다. 100분처럼 계산하지 마세요.',
  data: '막대가 길어 보이는 느낌보다 정확한 칸 수와 숫자를 읽어야 합니다.',
  pattern: '마지막 두 개만 보지 말고 처음부터 같은 규칙이 계속되는지 확인하세요.',
};

const selfCheckGuide: Record<ConceptTag, string> = {
  number: '답을 넣었을 때 수의 순서나 뛰어 세기 규칙이 계속 맞나요?',
  placeValue: '답의 각 숫자를 백, 십, 일의 값으로 다시 말할 수 있나요?',
  addition: '일의 자리 계산과 받아올림을 다시 확인했나요?',
  subtraction: '뺄셈 결과를 다시 더했을 때 처음 수가 되나요?',
  shape: '변과 꼭짓점의 개수를 다시 세어도 같은 도형인가요?',
  solid: '보이지 않는 아래층이나 뒤쪽 나무를 빠뜨리지 않았나요?',
  measurement: '시작 눈금이 0인지, 0이 아니라면 눈금 차를 구했는지 확인했나요?',
  classification: '모든 대상이 한 곳에만 들어가고 빠진 것이 없나요?',
  multiplication: '같은 수씩 몇 묶음인지 덧셈식으로도 말할 수 있나요?',
  time: '시계에서 긴바늘과 짧은바늘이 가리키는 뜻을 다시 확인했나요?',
  data: '문제에서 묻는 항목만 골라 비교했나요?',
  pattern: '찾은 규칙을 다음 자리에도 적용했을 때 맞나요?',
};

const primaryTag = (lesson: Lesson): ConceptTag => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  if (lesson.tags.includes('time')) return 'time';
  if (lesson.tags.includes('data')) return 'data';
  if (lesson.tags.includes('classification')) return 'classification';
  if (lesson.tags.includes('measurement')) return 'measurement';
  if (lesson.tags.includes('multiplication')) return 'multiplication';
  if (lesson.tags.includes('pattern') && !lesson.tags.includes('number')) return 'pattern';
  if (lesson.tags.includes('solid') && (text.includes('쌓') || !lesson.tags.includes('shape'))) return 'solid';
  if (lesson.tags.includes('shape')) return 'shape';
  if (lesson.tags.includes('subtraction') && !lesson.tags.includes('addition')) return 'subtraction';
  if (lesson.tags.includes('addition')) return 'addition';
  if (lesson.tags.includes('subtraction')) return 'subtraction';
  if (lesson.tags.includes('number')) return 'number';
  if (lesson.tags.includes('placeValue')) return 'placeValue';
  return lesson.tags[0] ?? 'number';
};

const buildLearningSupport = (
  lesson: Lesson,
  tag: ConceptTag,
  solution: string,
  strategy: string,
): LearningSupport => ({
  studentConcept: studentConceptGuide[tag],
  studentHint: studentHintGuide[tag],
  coreConcept: coreConceptGuide[tag],
  readStrategy: `${strategy}: ${readStrategyGuide[tag]}`,
  steps: [
    '문제에서 무엇을 구하라고 했는지 먼저 찾습니다.',
    readStrategyGuide[tag],
    solution,
  ],
  misconceptionTip: misconceptionGuide[tag],
  textbookConnection: `차시 목표 "${lesson.objective}"와 연결됩니다. 교과서 핵심은 ${lesson.textbookFocus} 익힘책 핵심은 ${lesson.workbookFocus}`,
  selfCheck: selfCheckGuide[tag],
});

const lessonNote = (support: LearningSupport) =>
  [
    `핵심 개념: ${support.coreConcept}`,
    `읽는 방법: ${support.readStrategy}`,
    `풀이 단계: ${support.steps.join(' → ')}`,
    `조심할 점: ${support.misconceptionTip}`,
    `확인 질문: ${support.selfCheck}`,
    support.textbookConnection,
  ].join('\n');

const assessmentLayers: Record<Difficulty, Array<{ label: string; note: string }>> = {
  하: [
    { label: '기초 확인', note: '교과서 활동처럼 한 가지 핵심만 확인해요.' },
    { label: '그림 확인', note: '그림이나 표에서 바로 보이는 단서를 찾아요.' },
    { label: '익힘 기본', note: '수학익힘 기본 문제처럼 차근차근 풀어요.' },
    { label: '보충 연습', note: '헷갈리기 쉬운 부분을 쉬운 수로 다시 확인해요.' },
    { label: '개념 확인', note: '차시 목표의 핵심 낱말을 떠올려요.' },
  ],
  중: [
    { label: '형성', note: '교과서 활동처럼 핵심 조건을 확인해요.' },
    { label: '익힘', note: '수학익힘 문제처럼 답을 고른 까닭도 생각해요.' },
    { label: '보충', note: '헷갈리기 쉬운 부분을 다시 확인해요.' },
    { label: '적용', note: '배운 개념을 문제 상황에 맞게 써요.' },
    { label: '확인', note: '답이 맞는 까닭을 짧게 떠올려요.' },
  ],
  상: [
    { label: '형성', note: '교과서 활동처럼 핵심 조건을 확인해요.' },
    { label: '익힘', note: '수학익힘 문제처럼 답을 고른 까닭도 생각해요.' },
    { label: '보충', note: '헷갈리기 쉬운 부분을 다시 확인해요.' },
    { label: '심화', note: '조건을 끝까지 읽고 한 번 더 판단해요.' },
    { label: '서술', note: '답이 맞는 까닭을 말로 설명해요.' },
  ],
};

const promptNotes: Record<ConceptTag, string[]> = {
  number: [
    '수 모형을 떠올려 보세요.',
    '수의 길 그림에서 움직인다고 생각해요.',
    '자릿값 표에 놓아 보세요.',
    '앞뒤 수의 차이를 확인해요.',
    '생활 속 번호표처럼 읽어 보세요.',
  ],
  placeValue: [
    '백, 십, 일의 자리를 나누어 보세요.',
    '같은 숫자라도 자리를 먼저 확인해요.',
    '모형의 묶음 수를 세어 보세요.',
    '수 카드의 위치를 바꾸지 말고 읽어요.',
    '값과 숫자를 구별해요.',
  ],
  addition: [
    '일의 자리부터 차례대로 계산해요.',
    '받아올림이 있는지 확인해요.',
    '수 모형으로 더해 보세요.',
    '식과 이야기 상황을 연결해요.',
    '잘못된 계산을 고쳐 보세요.',
  ],
  subtraction: [
    '무엇에서 무엇을 빼는지 먼저 읽어요.',
    '받아내림이 필요한지 확인해요.',
    '남은 양을 묻는지 차이를 묻는지 살펴요.',
    '덧셈으로 다시 확인해요.',
    '식과 이야기 상황을 연결해요.',
  ],
  shape: [
    '변과 꼭짓점을 손가락으로 짚어 보세요.',
    '돌려진 도형도 같은 성질인지 확인해요.',
    '생활 물건의 모양과 연결해요.',
    '아닌 까닭을 성질로 말해요.',
    '곧은 선과 굽은 선을 구별해요.',
  ],
  solid: [
    '위, 앞, 옆에서 본 모양을 함께 생각해요.',
    '보이지 않는 아래층을 놓치지 마세요.',
    '같은 개수라도 모양이 달라질 수 있어요.',
    '보기와 같은 위치인지 확인해요.',
    '층별로 나누어 세어 보세요.',
  ],
  measurement: [
    '시작 눈금과 끝 눈금을 함께 보세요.',
    '같은 단위끼리 비교해요.',
    '1m와 100cm의 관계를 떠올려요.',
    '어림한 값과 잰 값을 비교해요.',
    '길이의 합인지 차인지 먼저 읽어요.',
  ],
  classification: [
    '분류 기준을 하나만 정해요.',
    '빠지거나 겹치는 것이 없는지 보세요.',
    '같은 기준에 맞는 것끼리 모아요.',
    '분류한 결과를 말로 설명해요.',
    '기준을 바꾸면 묶음도 바뀌는지 생각해요.',
  ],
  multiplication: [
    '한 묶음의 수와 묶음 수를 나누어 봐요.',
    '같은 수를 여러 번 더하는지 확인해요.',
    '뛰어 세기와 곱셈식을 연결해요.',
    '몇 배에서 기준량을 찾아요.',
    '곱셈구구 규칙을 활용해요.',
  ],
  time: [
    '긴바늘과 짧은바늘의 역할을 나누어 봐요.',
    '60분이 1시간임을 떠올려요.',
    '시작 시각과 끝 시각을 구별해요.',
    '시각인지 시간인지 먼저 구분해요.',
    '숫자와 눈금을 다시 한 번 확인해요.',
  ],
  data: [
    '표의 항목 이름을 먼저 읽어요.',
    '가장 큰 수와 작은 수를 비교해요.',
    '전체 수인지 차이인지 확인해요.',
    '그래프 한 칸이 무엇을 뜻하는지 봐요.',
    '결과를 근거와 함께 말해요.',
  ],
  pattern: [
    '반복되는 한 묶음을 찾아요.',
    '얼마씩 변하는지 확인해요.',
    '처음부터 같은 규칙인지 살펴요.',
    '다음 자리에도 같은 규칙을 적용해요.',
    '규칙을 말로 설명해요.',
  ],
};

const duplicatePromptAngles = [
  '핵심 조건을 표시해 보세요.',
  '답을 고른 까닭까지 생각해요.',
  '틀리기 쉬운 보기를 먼저 지워요.',
  '교과서 활동 장면으로 떠올려요.',
  '수학익힘 확인 문제처럼 풀어요.',
  '그림이나 표의 기준을 먼저 찾아요.',
  '말로 설명할 수 있는 답을 골라요.',
  '비슷한 보기끼리 비교해요.',
  '문제에서 묻는 말을 다시 확인해요.',
  '한 단계 더 필요한지 살펴요.',
  '답을 넣어 보며 맞는지 확인해요.',
  '친구에게 설명한다고 생각해요.',
  '오개념 보기를 조심해요.',
  '생활 속 예와 연결해요.',
  '단원평가 문제처럼 근거를 찾아요.',
  '보기의 차이를 하나씩 비교해요.',
  '처음 조건과 마지막 질문을 연결해요.',
  '계산이나 판단 순서를 정해요.',
  '교과서 핵심 낱말을 떠올려요.',
  '마지막에 스스로 검산해요.',
];

const grade2LanguageReplacements: Array<[RegExp, string]> = [
  [/평면도형/g, '도형'],
  [/입체도형/g, '쌓기나무 모양'],
  [/미지수/g, '빈칸'],
  [/교환법칙/g, '순서를 바꾸어 보기'],
  [/결합법칙/g, '묶어 보기'],
  [/분배법칙/g, '나누어 생각하기'],
  [/어림 전략/g, '어림하는 방법'],
  [/수직선/g, '수의 길 그림'],
  [/표준형/g, '수'],
  [/막대모델/g, '막대그림'],
  [/조건 조합/g, '조건 함께 보기'],
  [/변화량/g, '달라지는 크기'],
  [/기준량/g, '기준이 되는 수'],
  [/단위 변환/g, '단위 바꾸기'],
  [/원의 지름/g, '원의 색깔'],
  [/지름/g, '가운데를 지나는 선'],
  [/색칠한 넓이만/g, '색칠한 부분만'],
  [/넓이/g, '넓은 정도'],
  [/정사각형|직사각형/g, '사각형'],
  [/오개념/g, '헷갈리는 보기'],
  [/자연수/g, '수'],
];

// 숫자를 우리말로 읽었을 때 받침이 있는지 (0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔).
// 10, 100처럼 0으로 끝나는 수는 십·백·천으로 읽어도 모두 받침이 있어 같은 결과가 됩니다.
const digitHasFinalConsonant: Record<string, boolean> = {
  '0': true, '1': true, '2': false, '3': true, '4': false,
  '5': false, '6': true, '7': true, '8': true, '9': false,
};

const josaPairs: Array<[withFinal: string, withoutFinal: string]> = [
  ['을', '를'],
  ['이', '가'],
  ['은', '는'],
  ['과', '와'],
];

const fixJosaAfterNumbers = (text: string): string =>
  text.replace(/(\d)(을|를|이|가|은|는|과|와)(?=[\s.,?!)]|$)/g, (match, digit: string, josa: string) => {
    const hasFinal = digitHasFinalConsonant[digit];
    const pair = josaPairs.find(([withFinal, withoutFinal]) => josa === withFinal || josa === withoutFinal);
    if (!pair) return match;
    return `${digit}${hasFinal ? pair[0] : pair[1]}`;
  });

const hasBatchim = (word: string): boolean => {
  const last = word.trim().slice(-1);
  if (last >= '0' && last <= '9') return digitHasFinalConsonant[last];
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
};

/** 항목 이름이 문제마다 달라지므로 조사를 받침에 맞춰 붙입니다. (예: 놀이를 / 공기놀이는) */
const josa = (word: string, withFinal: string, withoutFinal: string) =>
  `${word}${hasBatchim(word) ? withFinal : withoutFinal}`;

const cleanGrade2Text = (text: string): string =>
  fixJosaAfterNumbers(
    grade2LanguageReplacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text),
  );

const cleanGrade2Visual = (visual: QuestionVisual | undefined): QuestionVisual | undefined => {
  if (!visual) return undefined;

  if (visual.kind === 'plane-shapes') {
    return {
      ...visual,
      label: cleanGrade2Text(visual.label),
      items: visual.items.map((item) => ({
        ...item,
        ...(item.label ? { label: cleanGrade2Text(item.label) } : {}),
      })),
    };
  }

  if (visual.kind === 'cube-stack') {
    return { ...visual, label: cleanGrade2Text(visual.label) };
  }

  if (visual.kind === 'cube-views') {
    return { ...visual, label: cleanGrade2Text(visual.label) };
  }

  if (visual.kind === 'tangram') {
    return { ...visual, label: cleanGrade2Text(visual.label) };
  }

  if (visual.kind === 'number-line') {
    return {
      ...visual,
      label: cleanGrade2Text(visual.label),
      marks: visual.marks.map((mark) => ({
        ...mark,
        ...(mark.label ? { label: cleanGrade2Text(mark.label) } : {}),
      })),
    };
  }

  if (visual.kind === 'place-value') {
    return {
      ...visual,
      label: cleanGrade2Text(visual.label),
      columns: visual.columns.map((column) => ({ ...column, label: cleanGrade2Text(column.label) })),
    };
  }

  if (visual.kind === 'bar-model') {
    return {
      ...visual,
      label: cleanGrade2Text(visual.label),
      bars: visual.bars.map((bar) => ({ ...bar, label: cleanGrade2Text(bar.label) })),
    };
  }

  if (visual.kind === 'table') {
    return {
      ...visual,
      label: cleanGrade2Text(visual.label),
      categoryLabel: cleanGrade2Text(visual.categoryLabel),
      valueLabel: cleanGrade2Text(visual.valueLabel),
      columns: visual.columns.map((column) => ({ ...column, name: cleanGrade2Text(column.name) })),
      ...(visual.totalLabel ? { totalLabel: cleanGrade2Text(visual.totalLabel) } : {}),
    };
  }

  if (
    visual.kind === 'ruler' ||
    visual.kind === 'clock' ||
    visual.kind === 'calendar' ||
    visual.kind === 'pictograph' ||
    visual.kind === 'array'
  ) {
    return { ...visual, label: cleanGrade2Text(visual.label) };
  }

  return {
    ...visual,
    label: cleanGrade2Text(visual.label),
    items: visual.items.map(cleanGrade2Text),
  };
};

const enforceSecondGradeLanguage = (question: Question): Question => {
  const choices = question.choices.map(cleanGrade2Text);
  const answer = cleanGrade2Text(question.answer);
  const answerIndex = choices.indexOf(answer);
  const support: LearningSupport = {
    studentConcept: cleanGrade2Text(question.support.studentConcept),
    studentHint: cleanGrade2Text(question.support.studentHint),
    coreConcept: cleanGrade2Text(question.support.coreConcept),
    readStrategy: cleanGrade2Text(question.support.readStrategy),
    steps: question.support.steps.map(cleanGrade2Text),
    misconceptionTip: cleanGrade2Text(question.support.misconceptionTip),
    textbookConnection: cleanGrade2Text(question.support.textbookConnection),
    selfCheck: cleanGrade2Text(question.support.selfCheck),
  };

  return {
    ...question,
    prompt: cleanGrade2Text(question.prompt),
    choices,
    answer,
    answerIndex: answerIndex >= 0 ? answerIndex : question.answerIndex,
    explanation: cleanGrade2Text(question.explanation),
    misconception: cleanGrade2Text(question.misconception),
    strategy: cleanGrade2Text(question.strategy),
    support,
    ...(question.visual ? { visual: cleanGrade2Visual(question.visual) } : {}),
  };
};

const rotate = <T,>(items: T[], seed: number): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = (seed * 13 + i * 7) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const makeChoices = (answer: string | number, wrongs: Array<string | number>, seed: number) => {
  const answerText = String(answer);
  const unique = [answerText, ...wrongs.map(String)].filter((value, index, arr) => arr.indexOf(value) === index);
  const fallbackChoice = (delta: number) => {
    const match = answerText.match(/^(-?\d+)(.*)$/);
    if (!match) return `${answerText} 보기 ${delta}`;
    return `${Math.max(0, Number(match[1]) + delta)}${match[2]}`;
  };
  let delta = 1;
  while (unique.length < 4) {
    const candidate = fallbackChoice(delta);
    if (!unique.includes(candidate)) {
      unique.push(candidate);
    }
    delta += 1;
  }
  const options = rotate(unique.slice(0, 4), seed);
  return {
    options,
    answerIndex: options.indexOf(answerText),
    answer: answerText,
  };
};

const tuneWrongsForDifficulty = (
  answer: string | number,
  wrongs: Array<string | number>,
  difficulty: Difficulty,
) => {
  const answerText = String(answer);
  const match = answerText.match(/^(-?\d+)(.*)$/);

  if (!match) return wrongs;

  const value = Number(match[1]);
  const suffix = match[2];
  if (/[+\-=×÷]/.test(suffix)) return wrongs;
  const step = value >= 1000 ? 100 : value >= 100 ? 10 : 1;
  const format = (next: number) => `${Math.max(0, next)}${suffix}`;

  if (difficulty === '하') {
    return [wrongs[0], format(value + step * 3), format(value - step * 3), ...wrongs.slice(1)];
  }

  if (difficulty === '상') {
    return [format(value + step), format(value - step), wrongs[0], ...wrongs.slice(1)];
  }

  return wrongs;
};

const cubePool = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 2, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
  { x: 2, y: 0, z: 1 },
  { x: 0, y: 2, z: 1 },
  { x: 0, y: 0, z: 2 },
  { x: 1, y: 0, z: 2 },
  { x: 0, y: 1, z: 2 },
];

const buildCubeStack = (count: number, index: number) => {
  const safeCount = Math.max(1, Math.min(count, cubePool.length));
  const footprints = [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
  ];
  const footprint = footprints[index % footprints.length];
  const baseCount = Math.min(safeCount, Math.max(3, Math.min(footprint.length, Math.ceil(safeCount / 2) + 1)));
  const base = footprint.slice(0, baseCount).map(({ x, y }) => ({ x, y, z: 0 }));
  const cubes = [...base];
  let next = 0;

  while (cubes.length < safeCount) {
    const baseCell = footprint[next % baseCount];
    const z = Math.floor(next / baseCount) + 1;
    cubes.push({ x: baseCell.x, y: baseCell.y, z });
    next += 1;
  }

  return cubes;
};

const viewCells = (count: number): boolean[][] => {
  const safeCount = Math.max(1, Math.min(count, 15));
  const columns = safeCount <= 4 ? safeCount : safeCount <= 6 ? 3 : safeCount <= 8 ? 4 : 5;
  let remaining = safeCount;

  return Array.from({ length: Math.ceil(safeCount / columns) }, () => {
    const filled = Math.min(columns, remaining);
    remaining -= filled;
    return Array.from({ length: columns }, (_, column) => column < filled);
  });
};

const cubeViewsVisual = (
  views: Array<{ label: '앞' | '옆' | '위' | '보임'; count: number }>,
  label = '방향별로 본 쌓기나무 모양',
): QuestionVisual => ({
  kind: 'cube-views',
  label,
  views: views.map((view) => ({
    label: view.label,
    cells: viewCells(view.count),
  })),
});

const cubeStackVisual = (prompt: string, index: number, countOverride?: number): QuestionVisual => {
  const promptCount = prompt.match(/쌓기나무(?:가|는)?\s*(\d+)개/)?.[1];
  const count = countOverride ?? Number(promptCount ?? 6 + (index % 3));

  return {
    kind: 'cube-stack',
    label: `쌓기나무 ${count}개 모양`,
    cubes: buildCubeStack(count, index),
  };
};

const solidQuestionVisual = (prompt: string, index: number): QuestionVisual => {
  const visibleOnlyMatch = prompt.match(/쌓기나무\s*(\d+)개 중\s*(\d+)개만 보인/);
  if (visibleOnlyMatch) {
    const visibleCount = Number(visibleOnlyMatch[2]);
    return cubeViewsVisual([{ label: '보임', count: visibleCount }], `보이는 쌓기나무 ${visibleCount}개`);
  }

  const frontTopMatch = prompt.match(/앞에서 본 칸이\s*(\d+)칸이고\s*위에서 본 칸이\s*(\d+)칸/);
  if (frontTopMatch) {
    return cubeViewsVisual(
      [
        { label: '앞', count: Number(frontTopMatch[1]) },
        { label: '위', count: Number(frontTopMatch[2]) },
      ],
      '앞과 위에서 본 쌓기나무 모양',
    );
  }

  const frontSideMatch = prompt.match(/앞에서 보면\s*(\d+)칸,\s*옆에서 보면\s*(\d+)칸/);
  if (frontSideMatch) {
    return cubeViewsVisual(
      [
        { label: '앞', count: Number(frontSideMatch[1]) },
        { label: '옆', count: Number(frontSideMatch[2]) },
      ],
      '앞과 옆에서 본 쌓기나무 모양',
    );
  }

  const topMatch = prompt.match(/위에서\s*(?:본 모양이|보면|보이는 칸이|본 칸은)\s*(\d+)칸/);
  if (topMatch) {
    return cubeViewsVisual([{ label: '위', count: Number(topMatch[1]) }], '위에서 본 쌓기나무 모양');
  }

  const layerMatch = prompt.match(/1층에\s*(\d+)개,\s*2층에\s*(\d+)개/);
  if (layerMatch) {
    return cubeStackVisual(prompt, index, Number(layerMatch[1]) + Number(layerMatch[2]));
  }

  const topLayerMatch = prompt.match(/맨 위층에\s*(\d+)개,\s*아래층에\s*(\d+)개/);
  if (topLayerMatch) {
    return cubeStackVisual(prompt, index, Number(topLayerMatch[1]) + Number(topLayerMatch[2]));
  }

  if (prompt.includes('앞, 옆, 위') || prompt.includes('앞에서 본 모양과 위에서 본 모양')) {
    return cubeViewsVisual(
      [
        { label: '앞', count: 3 + (index % 2) },
        { label: '옆', count: 2 + (index % 3) },
        { label: '위', count: 4 + (index % 2) },
      ],
      '세 방향에서 본 쌓기나무 모양',
    );
  }

  if (prompt.includes('위에서 본 모양만')) {
    return cubeViewsVisual([{ label: '위', count: 4 + (index % 3) }], '위에서 본 쌓기나무 모양');
  }

  return cubeStackVisual(prompt, index);
};

const planeShapesVisual = (label: string, items: PlaneShapeVisualItem[]): QuestionVisual => ({
  kind: 'plane-shapes',
  label,
  items,
});

const planeVisualForTarget = (target: '원' | '삼각형' | '사각형' | '칠교', index: number): QuestionVisual => {
  if (target === '칠교') {
    return { kind: 'tangram', label: '칠교 조각으로 만든 모양' };
  }

  if (target === '원') {
    return planeShapesVisual('원 모양', [
      { kind: 'circle', active: true },
      { kind: 'square' },
      { kind: 'triangle' },
    ]);
  }

  if (target === '삼각형') {
    return planeShapesVisual('삼각형 모양', [
      { kind: 'triangle', active: true, rotate: index % 2 === 0 ? 0 : 180 },
      { kind: 'square' },
      { kind: 'circle' },
    ]);
  }

  return planeShapesVisual('사각형 모양', [
    { kind: 'square', active: true, rotate: index % 2 === 0 ? 0 : 12 },
    { kind: 'rectangle', active: true, rotate: -8 },
    { kind: 'circle' },
  ]);
};

const inferQuestionVisual = (
  tag: ConceptTag,
  prompt: string,
  answer: string | number,
  strategy: string,
  index: number,
): QuestionVisual | undefined => {
  if (tag === 'solid') return solidQuestionVisual(prompt, index);
  if (tag !== 'shape') return undefined;

  const source = `${prompt} ${answer} ${strategy}`;
  const targetShape = (['칠교', '삼각형', '사각형', '원'] as const).find(
    (shapeName) => prompt.includes(shapeName) || String(answer) === shapeName || strategy.includes(shapeName),
  );

  if (targetShape) {
    return planeVisualForTarget(targetShape, index);
  }

  if (source.includes('칠교')) {
    return { kind: 'tangram', label: '칠교 조각으로 만든 모양' };
  }

  if (source.includes('아닌 모양') && (source.includes('둥근') || source.includes('원'))) {
    return planeShapesVisual('도형 비교', [
      { kind: 'circle', active: true },
      { kind: 'square' },
      { kind: 'rectangle' },
    ]);
  }

  if (source.includes('삼각형') || source.includes('세모') || source.includes('3개')) {
    return planeShapesVisual('삼각형 모양', [
      { kind: 'triangle', active: true, rotate: index % 2 === 0 ? 0 : 180 },
      { kind: 'triangle', rotate: -28 },
    ]);
  }

  if (source.includes('사각형') || source.includes('네모') || source.includes('4개') || source.includes('문 모양')) {
    return planeShapesVisual('사각형 모양', [
      { kind: 'square', active: true, rotate: index % 2 === 0 ? 0 : 12 },
      { kind: 'rectangle', active: true, rotate: -8 },
      { kind: 'circle' },
    ]);
  }

  if (source.includes('원') || source.includes('동그란') || source.includes('둥근')) {
    return planeShapesVisual('원 모양', [
      { kind: 'circle', active: true },
      { kind: 'triangle' },
      { kind: 'square' },
    ]);
  }

  return planeShapesVisual('여러 가지 도형', [
    { kind: 'circle' },
    { kind: 'triangle' },
    { kind: 'square' },
    { kind: 'rectangle' },
  ]);
};

const makeQuestion = (
  lesson: Lesson,
  difficulty: Difficulty,
  index: number,
  prompt: string,
  answer: string | number,
  wrongs: Array<string | number>,
  solution: string,
  tag: ConceptTag,
  strategy: string,
  visual = inferQuestionVisual(tag, prompt, answer, strategy, index),
): Question => {
  const leveledStrategy = `${difficultyDesign[difficulty].label} · ${strategy}`;
  const leveledSolution = `${difficultyDesign[difficulty].solutionLead} ${solution}`;
  const madeChoices = makeChoices(
    answer,
    tuneWrongsForDifficulty(answer, wrongs, difficulty),
    lesson.unitNo * 101 + lesson.lessonNo * 17 + index * 19 + difficultyIndex[difficulty],
  );
  const support = buildLearningSupport(lesson, tag, leveledSolution, leveledStrategy);
  return enforceSecondGradeLanguage({
    id: `${lesson.id}-${difficulty}-${index + 1}`,
    lessonId: lesson.id,
    difficulty,
    prompt,
    choices: madeChoices.options,
    answerIndex: madeChoices.answerIndex,
    answer: madeChoices.answer,
    explanation: lessonNote(support),
    misconception: tagLabel[tag],
    type: tag,
    strategy: leveledStrategy,
    support,
    ...(visual ? { visual } : {}),
  });
};

const n = (lesson: Lesson, index: number, add = 0) => lesson.unitNo * 97 + lesson.lessonNo * 31 + index * 23 + add;

const numberQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const fourDigit = text.includes('네 자리');
  const base = fourDigit ? 1000 + (n(lesson, index) % 8000) : 100 + (n(lesson, index) % 800);
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  if (text.includes('90보다') || text.includes('1000을')) {
    const start = fourDigit ? 900 : 90;
    const target = fourDigit ? 1000 : 100;
    const step = fourDigit ? 100 : 10;
    const near = target + (index % 5) * step;
    const small = target - step * (1 + (index % 3));
    const focusVariant = variantForDifficulty(difficulty, index, 20, 7);

    if (focusVariant === 0) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${start}보다 ${step}만큼 큰 수는 무엇일까요?`,
        target,
        [start, target + step, step],
        `${start}에서 ${step}만큼 커지면 ${target}입니다.`,
        'number',
        '기준 수에서 10 또는 100만큼 커지는 수 찾기',
      );
    }

    if (focusVariant === 1) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}은 ${step}씩 몇 번 센 수일까요?`,
        10,
        [1, step, 9],
        `${step}이 10번 모이면 ${target}이 됩니다.`,
        'placeValue',
        '10묶음이 모여 100 또는 1000이 되는 구조 이해',
      );
    }

    if (focusVariant === 2) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${small}, ${small + step}, ${small + step * 2}, □ 에서 □에 알맞은 수는?`,
        small + step * 3,
        [small + step * 2, small + step * 4, target],
        `${step}씩 뛰어 세고 있으므로 다음 수는 ${small + step * 3}입니다.`,
        'number',
        '10 또는 100씩 뛰어 세기',
      );
    }

    if (focusVariant === 3) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}보다 ${step}만큼 작은 수는 무엇일까요?`,
        start,
        [target + step, step, target - step * 2],
        `${target}에서 ${step}만큼 작아지면 ${start}입니다.`,
        'number',
        '기준 수에서 10 또는 100만큼 작아지는 수 찾기',
      );
    }

    if (focusVariant === 4) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}을 만들려면 ${start}에 얼마를 더해야 할까요?`,
        step,
        [target, start, step * 2],
        `${start}에서 ${target}까지는 ${step}만큼 더 가야 합니다.`,
        'number',
        '두 수 사이의 차를 기준 단위로 보기',
      );
    }

    if (focusVariant === 5) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${step}짜리 묶음이 9개 있고 1개 더 있습니다. 모두 얼마일까요?`,
        target,
        [start, step, target + step],
        `${step}짜리 묶음 9개는 ${start}이고, 한 묶음을 더하면 ${target}입니다.`,
        'placeValue',
        '묶음 9개에서 10개로 넘어가기',
      );
    }

    if (focusVariant === 6) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}에 대한 설명으로 알맞은 것은?`,
        `${step}이 10개인 수`,
        [`${step}이 9개인 수`, '일의 자리 수가 10인 수', `${target + step}보다 큰 수`],
        `${target}은 ${step}이 10개 모인 수입니다.`,
        'placeValue',
        '100 또는 1000의 의미 설명',
      );
    }

    if (focusVariant === 7) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${near}, ${near + step}, ${near + step * 2} 중 ${target}보다 큰 수는 몇 개일까요?`,
        near > target ? 3 : near + step > target ? 2 : 1,
        [0, 2, 3],
        `${target}보다 큰지 하나씩 비교합니다.`,
        'number',
        '기준 수보다 큰 수 찾기',
      );
    }

    if (focusVariant === 8) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `수직선에서 ${start}에서 오른쪽으로 ${step}만큼 가면 도착하는 수는?`,
        target,
        [start, target + step, step],
        `수직선에서 오른쪽으로 가면 수가 커집니다. ${start}+${step}=${target}입니다.`,
        'number',
        '수직선으로 기준 수 이동하기',
      );
    }

    if (focusVariant === 9) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target} 바로 앞의 ${step}단위 수는 무엇일까요?`,
        start,
        [target, target + step, step],
        `${step}씩 세는 수에서 ${target} 바로 앞은 ${start}입니다.`,
        'number',
        '기준 수 앞뒤 관계 알기',
      );
    }

    if (focusVariant === 10) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${start}, □, ${target + step}에서 같은 간격으로 뛰어 셀 때 □는?`,
        target,
        [start + step * 2, start - step, step],
        `같은 간격은 ${step}입니다. ${start} 다음은 ${target}입니다.`,
        'number',
        '빈칸 수 배열 완성',
      );
    }

    if (focusVariant === 11) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}을 읽는 방법으로 알맞은 것은?`,
        fourDigit ? '천' : '백',
        fourDigit ? ['구백', '백', '십'] : ['구십', '천', '십'],
        `${target}은 ${fourDigit ? '천' : '백'}이라고 읽습니다.`,
        'number',
        '100 또는 1000 읽기',
      );
    }

    if (focusVariant === 12) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}을 쓰는 방법으로 알맞은 것은?`,
        String(target),
        [String(start), String(target + step), String(step)],
        `${fourDigit ? '천' : '백'}은 숫자로 ${target}이라고 씁니다.`,
        'number',
        '100 또는 1000 쓰기',
      );
    }

    if (focusVariant === 13) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}보다 작은 수를 고르세요.`,
        start,
        [target + step, target + step * 2, target],
        `${start}은 ${target}보다 ${step}만큼 작습니다.`,
        'number',
        '기준 수와 크기 비교',
      );
    }

    if (focusVariant === 14) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}보다 큰 수를 고르세요.`,
        target + step,
        [start, step, target - step * 2],
        `${target + step}은 ${target}보다 ${step}만큼 큽니다.`,
        'number',
        '기준 수보다 큰 수 고르기',
      );
    }

    if (focusVariant === 15) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${start}에서 ${target}까지 ${step}씩 세면 몇 번 더 세어야 할까요?`,
        1,
        [2, 9, 10],
        `${start}에서 ${step}만큼 한 번 더 세면 ${target}입니다.`,
        'number',
        '한 번 더 세어 기준 수 만들기',
      );
    }

    if (focusVariant === 16) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${target}은 ${start}보다 얼마만큼 큰 수일까요?`,
        step,
        [target, start, step * 2],
        `${target}-${start}=${step}입니다.`,
        'number',
        '기준 수 사이의 차 구하기',
      );
    }

    if (focusVariant === 17) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${step}씩 8번 센 수에서 ${step}씩 2번 더 세면 얼마일까요?`,
        target,
        [start, target + step, step * 2],
        `${step}씩 모두 10번 센 것이므로 ${target}입니다.`,
        'placeValue',
        '묶음 수를 합쳐 10묶음 만들기',
      );
    }

    if (focusVariant === 18) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `친구가 ${start}보다 ${step} 큰 수를 ${target + step}이라고 했습니다. 바른 수는?`,
        target,
        [start, target + step, step],
        `${start}보다 ${step} 큰 수는 한 번만 더 센 ${target}입니다.`,
        'number',
        '오답을 고쳐 기준 수 찾기',
      );
    }

    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 만들 수 있는 묶음으로 알맞은 것은?`,
      `${step}짜리 묶음 10개`,
      [`${step}짜리 묶음 9개`, `${target}짜리 묶음 10개`, `${step}짜리 묶음 1개`],
      `${target}은 ${step}짜리 묶음이 10개인 수입니다.`,
      'placeValue',
      '기준 묶음 10개로 수 만들기',
    );
  }

  if ((text.includes('90보다') || text.includes('1000을')) && variant === 0) {
    const start = fourDigit ? 900 : 90;
    const step = fourDigit ? 100 : 10;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${start}보다 ${step}만큼 큰 수는 무엇일까요?`,
      start + step,
      [start - step, start + step * 2, step],
      `${start}에서 ${step}만큼 커지면 ${start + step}입니다.`,
      'number',
      '기준 수에서 10 또는 100만큼 커지는 수 찾기',
    );
  }

  if ((text.includes('몇백') || text.includes('몇천')) && variant === 1) {
    const unit = fourDigit ? 1000 : 100;
    const count = 2 + (index % (fourDigit ? 7 : 6));
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${unit}이 ${count}개인 수는 무엇일까요?`,
      unit * count,
      [unit + count, unit * (count + 1), unit * Math.max(1, count - 1)],
      `${unit}이 ${count}개이면 ${unit}을 ${count}번 모은 수이므로 ${unit * count}입니다.`,
      'placeValue',
      '백 또는 천 단위의 묶음 수 이해',
    );
  }

  if ((text.includes('뛰어서') && variant === 0) || variant === 0) {
    const step = difficulty === '하' ? (fourDigit ? 100 : 10) : difficulty === '중' ? (fourDigit ? 200 : 20) : (fourDigit ? 500 : 50);
    const start = fourDigit ? 1000 + (index % 8) * 100 : 100 + (index % 7) * 10;
    const answer = start + step * 3;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${start}, ${start + step}, ${start + step * 2}, □ 에서 □에 알맞은 수는?`,
      answer,
      [answer - step, answer + step, start + 3],
      `앞의 수가 ${step}씩 커지고 있으므로 ${start + step * 2} 다음은 ${answer}입니다.`,
      'number',
      '일정한 간격으로 뛰어 세기',
    );
  }

  if ((text.includes('어느 수') && variant <= 1) || variant === 1) {
    const a = base;
    const b = base + (fourDigit ? 103 : 13) + (index % 4) * (fourDigit ? 100 : 10);
    const answer = Math.max(a, b);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${a}와 ${b} 중 더 큰 수를 고르세요.`,
      answer,
      [Math.min(a, b), answer - (fourDigit ? 100 : 10), answer + 1],
      `큰 수를 비교할 때는 가장 높은 자리부터 비교합니다. 그래서 ${answer}가 더 큽니다.`,
      'number',
      '높은 자리부터 수의 크기 비교',
    );
  }

  if ((text.includes('각 자리') && variant <= 2) || variant === 2) {
    const places = fourDigit ? ['천', '백', '십', '일'] : ['백', '십', '일'];
    const place = places[index % places.length];
    const value =
      place === '천'
        ? Math.floor(base / 1000) * 1000
        : place === '백'
          ? Math.floor((base % 1000) / 100) * 100
          : place === '십'
            ? Math.floor((base % 100) / 10) * 10
            : base % 10;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${base}에서 ${place}의 자리 숫자가 나타내는 값은?`,
      value,
      [String(value).replace(/0/g, '') || value + 1, value + 10, Math.max(0, value - 10)],
      `${base}을 자리별로 나누어 보면 ${place}의 자리 값은 ${value}입니다.`,
      'placeValue',
      '자리 위치가 나타내는 값 해석',
    );
  }

  if (variant === 3) {
    const thousands = fourDigit ? Math.floor(base / 1000) : 0;
    const hundreds = Math.floor((base % 1000) / 100);
    const tens = Math.floor((base % 100) / 10);
    const ones = base % 10;
    const prompt = fourDigit
      ? `천 ${thousands}개, 백 ${hundreds}개, 십 ${tens}개, 일 ${ones}개로 만든 수는?`
      : `백 ${hundreds}개, 십 ${tens}개, 일 ${ones}개로 만든 수는?`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      prompt,
      base,
      [hundreds * 100 + tens + ones, base + 10, Math.max(0, base - 100)],
      `각 자리의 값을 합하면 ${base}가 됩니다.`,
      'placeValue',
      '수 모형을 숫자로 나타내기',
    );
  }

  if (variant === 4) {
    const first = base;
    const second = base + (fourDigit ? 210 : 21);
    const third = base - (fourDigit ? 120 : 12);
    const ordered = [third, first, second].sort((a, b) => a - b);
    const answer = ordered.join(', ');
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${first}, ${second}, ${third}을 작은 수부터 차례로 놓은 것은?`,
      answer,
      [
        [first, third, second].join(', '),
        [second, first, third].join(', '),
        [third, second, first].join(', '),
      ],
      `수를 차례로 놓을 때는 가장 높은 자리부터 비교합니다. 작은 수부터 쓰면 ${answer}입니다.`,
      'number',
      '여러 수를 순서대로 정렬하기',
    );
  }

  const target = base + (fourDigit ? 40 : 4);
  const cards = String(target).split('').map(Number);
  return makeQuestion(
    lesson,
    difficulty,
    index,
    `수 카드 ${cards.join(', ')}을 왼쪽부터 순서대로 놓아 만든 수는?`,
    target,
    [target + 10, Math.max(0, target - 10), Number(String(target).split('').reverse().join(''))],
    `카드를 왼쪽부터 차례대로 놓으면 각 자리 숫자가 ${cards.join(', ')}인 수 ${target}이 됩니다.`,
    'number',
    '수 카드로 수 만들기',
  );
};

const operationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number, mode: 'addition' | 'subtraction'): Question => {
  const seed = n(lesson, index, mode === 'addition' ? 5 : 11);
  const variant = variantForDifficulty(difficulty, index, 6, 2);
  const a = difficulty === '하' ? 24 + (seed % 36) : difficulty === '중' ? 48 + (seed % 28) : 58 + (seed % 22);
  const rawB = difficulty === '하' ? 12 + (seed % 18) : difficulty === '중' ? 14 + (seed % 22) : 18 + (seed % 21);
  const b = Math.max(10, Math.min(rawB, 99 - a));
  const bigger = Math.max(a, b + 20);
  const smaller = Math.min(a, b);
  const isMixedOperation = lesson.tags.includes('addition') && lesson.tags.includes('subtraction');

  if ((lesson.title.includes('관계') && variant === 0) || (isMixedOperation && variant === 0)) {
    const total = a + b;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${a}+${b}=${total}을 보고 만들 수 있는 뺄셈식으로 알맞은 것은?`,
      `${total}-${a}=${b}`,
      [`${a}-${b}=${total}`, `${total}+${a}=${b}`, `${b}-${a}=${total}`],
      `덧셈과 뺄셈은 서로 거꾸로 확인할 수 있습니다. 전체 ${total}에서 한 부분 ${a}를 빼면 다른 부분 ${b}가 남습니다.`,
      'subtraction',
      '덧셈과 뺄셈의 관계식 만들기',
    );
  }

  if (lesson.title.includes('관계') && variant === 1) {
    const total = a + b;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${total}-${a}=${b}을 보고 만들 수 있는 덧셈식으로 알맞은 것은?`,
      `${a}+${b}=${total}`,
      [`${total}+${a}=${b}`, `${a}-${b}=${total}`, `${b}-${total}=${a}`],
      `뺄셈식에서 전체는 ${total}, 두 부분은 ${a}와 ${b}입니다. 두 부분을 더하면 전체가 되므로 ${a}+${b}=${total}입니다.`,
      'addition',
      '뺄셈식에서 덧셈식으로 바꾸기',
    );
  }

  if ((lesson.title.includes('□') && variant <= 1) || (isMixedOperation && variant === 1)) {
    const known = 16 + (seed % 29);
    const rawHidden = difficulty === '상' ? 35 + (seed % 24) : 18 + (seed % 35);
    const hidden = Math.max(10, Math.min(rawHidden, 99 - known));
    const total = hidden + known;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `□+${known}=${total}입니다. □에 알맞은 수는?`,
      hidden,
      [total, known, Math.max(0, hidden - 10)],
      `빈칸은 전체 ${total}에서 알고 있는 부분 ${known}를 빼서 구합니다. ${total}-${known}=${hidden}입니다.`,
      'subtraction',
      '빈칸이 있는 식 해결',
    );
  }

  if ((lesson.title.includes('세 수') && variant <= 1) || (isMixedOperation && variant === 2)) {
    const c = 7 + (seed % 19);
    const answer = mode === 'addition' ? a + b - c : bigger - smaller + c;
    const prompt = mode === 'addition'
      ? `${a}+${b}-${c}의 값은?`
      : `${bigger}-${smaller}+${c}의 값은?`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      prompt,
      answer,
      [answer + c, answer - c, answer + 10],
      `세 수의 계산은 왼쪽부터 차례대로 합니다. 중간 결과를 확인하면 답은 ${answer}입니다.`,
      mode,
      '세 수의 계산 순서 적용',
    );
  }

  if (variant === 0) {
    const tensA = Math.floor(a / 10);
    const onesA = a % 10;
    const tensB = Math.floor(b / 10);
    const onesB = b % 10;
    if (mode === 'addition') {
      const answer = a + b;
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `십 모형 ${tensA + tensB}개와 일 모형 ${onesA + onesB}개를 합친 수는?`,
        answer,
        [answer - 10, answer + 1, answer + 10],
        `십 모형은 ${tensA + tensB}개라서 ${10 * (tensA + tensB)}이고, 일 모형은 ${onesA + onesB}개입니다. 모두 더하면 ${answer}입니다.`,
        'addition',
        '수 모형으로 덧셈 이해',
      );
    }

    const answer = bigger - smaller;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${bigger}에서 십의 자리 ${Math.floor(smaller / 10)}개와 일의 자리 ${smaller % 10}개를 빼면?`,
      answer,
      [answer + 10, Math.max(0, answer - 10), answer + 1],
      `${smaller}는 십의 자리 ${Math.floor(smaller / 10)}개와 일의 자리 ${smaller % 10}개입니다. 자리별로 빼면 ${answer}입니다.`,
      'subtraction',
      '수 모형으로 뺄셈 이해',
    );
  }

  if (variant === 1) {
    if (mode === 'addition') {
      const tensSum = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10;
      const onesSum = (a % 10) + (b % 10);
      const answer = a + b;
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${a}+${b}를 십의 자리와 일의 자리로 나누어 계산할 때 알맞은 식은?`,
        `${tensSum}+${onesSum}=${answer}`,
        [`${tensSum}+${a % 10}=${tensSum + (a % 10)}`, `${a}+${onesSum}=${a + onesSum}`, `${tensSum - onesSum}=${tensSum - onesSum}`],
        `십의 자리끼리 더해 ${tensSum}, 일의 자리끼리 더해 ${onesSum}를 만든 뒤 다시 더하면 ${answer}입니다.`,
        'addition',
        '자리값을 나누어 덧셈하기',
      );
    }

    const answer = bigger - smaller;
    const tensDiff = Math.floor(bigger / 10) * 10 - Math.floor(smaller / 10) * 10;
    const onesDiff = (bigger % 10) - (smaller % 10);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${bigger}-${smaller}를 자리값으로 나누어 볼 때 먼저 확인할 것은?`,
      '같은 자리끼리 빼야 한다',
      ['큰 숫자부터 아무 자리나 뺀다', '두 수를 모두 더한다', '색깔이 같은 수만 본다'],
      `뺄셈은 십의 자리와 일의 자리를 맞추어 계산합니다. 자리값을 맞추면 ${bigger}-${smaller}=${answer}입니다.`,
      'subtraction',
      onesDiff >= 0 ? '자리값을 나누어 뺄셈하기' : '받아내림이 필요한 자리 확인',
    );
  }

  if (variant === 2) {
    if (mode === 'addition') {
      const answer = a + b;
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${a}+${b}를 계산할 때 일의 자리 합을 먼저 보면 알 수 있는 것은?`,
        (a % 10) + (b % 10) >= 10 ? '받아올림이 필요하다' : '받아올림이 필요 없다',
        [(a % 10) + (b % 10) >= 10 ? '받아올림이 필요 없다' : '받아올림이 필요하다', `${answer}에서 10을 빼야 한다`, '십의 자리를 보지 않아도 된다'],
        `일의 자리 ${(a % 10)}와 ${(b % 10)}를 더해 10이 넘는지 확인하면 받아올림 여부를 알 수 있습니다. 바른 계산값은 ${answer}입니다.`,
        'addition',
        '받아올림 여부 판단',
      );
    }

    const answer = bigger - smaller;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${bigger}-${smaller}에서 일의 자리끼리 바로 뺄 수 있는지 판단하려면 무엇을 비교해야 할까요?`,
      '빼어지는 수와 빼는 수의 일의 자리',
      ['두 수의 색깔', '십의 자리 이름', '문제에 나온 글자 수'],
      `일의 자리에서 바로 뺄 수 없으면 십의 자리에서 받아내림을 해야 합니다. 판단 뒤 계산하면 답은 ${answer}입니다.`,
      'subtraction',
      '받아내림 여부 판단',
    );
  }

  if (variant === 3) {
    const answer = mode === 'addition' ? a + b : bigger - smaller;
    const prompt = mode === 'addition'
      ? `도서관에 책이 ${a}권 있고 ${b}권을 더 가져왔습니다. 모두 몇 권일까요?`
      : `스티커가 ${bigger}장 있었고 ${smaller}장을 사용했습니다. 남은 스티커는 몇 장일까요?`;
    const solution = mode === 'addition'
      ? `${a}권에 ${b}권을 더하면 ${answer}권입니다.`
      : `${bigger}장에서 사용한 ${smaller}장을 빼면 ${answer}장입니다.`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      prompt,
      answer,
      [answer + 1, answer + 10, Math.max(0, answer - 10)],
      solution,
      mode,
      '생활 장면을 식으로 나타내기',
    );
  }

  if (variant === 4) {
    const answer = mode === 'addition' ? a + b : bigger - smaller;
    const wrong = mode === 'addition' ? answer - 10 : answer + 10;
    const prompt = mode === 'addition'
      ? `${a}+${b}의 잘못된 답이 ${wrong}입니다. 바른 답은?`
      : `${bigger}-${smaller}의 잘못된 답이 ${wrong}입니다. 바른 답은?`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      prompt,
      answer,
      [wrong, answer + 1, Math.max(0, answer - 1)],
      `자리별로 다시 계산하면 바른 답은 ${answer}입니다. 오답은 받아올림이나 받아내림을 놓쳤을 때 자주 나옵니다.`,
      mode,
      '계산 오류 찾기와 고치기',
    );
  }

  const answer = mode === 'addition' ? a + b : bigger - smaller;
  const prompt = mode === 'addition' ? `${a}+${b}의 값은?` : `${bigger}-${smaller}의 값은?`;
  return makeQuestion(
    lesson,
    difficulty,
    index,
    prompt,
    answer,
    [answer + 10, Math.max(0, answer - 10), answer + 1],
    `자리값에 맞게 계산하면 ${prompt.replace('의 값은?', '')}=${answer}입니다.`,
    mode,
    mode === 'addition' ? '두 자리 수 덧셈 계산' : '두 자리 수 뺄셈 계산',
  );
};

const legacyPlaneShapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const variant = variantForDifficulty(difficulty, index, 20, 6);
  const targets = text.includes('○')
    ? ['원']
    : text.includes('△')
      ? ['삼각형']
      : text.includes('□')
        ? ['사각형']
        : text.includes('칠교')
          ? ['칠교']
          : ['원', '삼각형', '사각형', '칠교'];
  const target = targets[index % targets.length];
  const examples: Record<string, { object: string; nonObject: string; feature: string; answerReason: string }> = {
    원: {
      object: ['동그란 접시', '시계의 둥근 테두리', '동전의 앞면', '훌라후프'][index % 4],
      nonObject: ['세모 표지판', '네모 창문', '책 표지', '교실 칠판'][index % 4],
      feature: '둥근 선으로 이루어져 있다',
      answerReason: '원은 곧은 변과 꼭짓점이 없고 둥근 선으로 이루어진 평면도형입니다.',
    },
    삼각형: {
      object: ['세모 표지판', '삼각 깃발', '샌드위치 반쪽 모양', '삼각자 한 면'][index % 4],
      nonObject: ['동그란 접시', '네모 창문', '공 모양', '쌓기나무'][index % 4],
      feature: '변과 꼭짓점이 각각 3개',
      answerReason: '삼각형은 변이 3개, 꼭짓점이 3개인 평면도형입니다.',
    },
    사각형: {
      object: ['네모 창문', '책 표지', '교실 칠판', '문 모양'][index % 4],
      nonObject: ['동그란 접시', '세모 표지판', '공 모양', '둥근 바퀴'][index % 4],
      feature: '변과 꼭짓점이 각각 4개',
      answerReason: '사각형은 변이 4개, 꼭짓점이 4개인 평면도형입니다.',
    },
    칠교: {
      object: '칠교 조각',
      nonObject: '쌓기나무',
      feature: '조각을 돌리거나 뒤집어 새 모양을 만들 수 있다',
      answerReason: '칠교판 활동은 여러 평면도형 조각을 돌리고 뒤집고 맞추며 새로운 모양을 만드는 활동입니다.',
    },
  };
  const data = examples[target];
  const rotation = ['바로 놓아도', '옆으로 돌려도', '거꾸로 놓아도', '크기가 달라도'][index % 4];

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 찾을 때 가장 먼저 확인할 특징은?`,
      target === '칠교' ? '조각을 맞추어 모양을 만드는지' : data.feature,
      target === '원'
        ? ['변이 3개인지', '꼭짓점이 4개인지', '쌓을 수 있는지']
        : target === '삼각형'
          ? ['둥근 선만 있는지', '꼭짓점이 4개인지', '굴러가는지']
          : target === '사각형'
            ? ['둥근 선만 있는지', '변이 3개인지', '공처럼 굴러가는지']
            : ['숫자를 크게 쓰는지', '색깔이 모두 같은지', '한 조각만 쓰는지'],
      data.answerReason,
      'shape',
      `${target}의 기본 성질 확인`,
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target} 모양인 물건으로 알맞은 것은?`,
      data.object,
      [data.nonObject, target === '원' ? '쌓기나무' : '동그란 접시', '긴 막대'],
      `${data.object}은 ${target}의 특징과 닮아 ${target} 모양으로 볼 수 있습니다.`,
      'shape',
      `생활 속 ${target} 모양 찾기`,
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${data.nonObject}을 ${target}이라고 보기 어려운 까닭은?`,
      target === '칠교' ? '칠교 조각을 맞춘 모양이 아니기 때문' : `${target}의 특징인 ${data.feature}에 맞지 않기 때문`,
      ['색깔이 다르기 때문', '이름이 짧기 때문', '책상 위에 있기 때문'],
      `도형은 색깔이나 놓인 곳이 아니라 변, 꼭짓점, 둥근 선 같은 성질로 판단합니다.`,
      'shape',
      `${target}이 아닌 이유 설명`,
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${rotation} 같은 ${target}으로 볼 수 있는 까닭은?`,
      '방향보다 도형의 성질이 같기 때문',
      ['색깔이 항상 같기 때문', '크기가 반드시 같기 때문', '이름을 마음대로 붙여도 되기 때문'],
      `도형을 돌리거나 크기를 바꾸어도 변과 꼭짓점, 둥근 선 같은 성질이 같으면 같은 도형으로 볼 수 있습니다.`,
      'shape',
      '도형의 방향과 크기 불변성 판단',
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 설명한 말로 알맞은 것은?`,
      data.feature,
      target === '원'
        ? ['변과 꼭짓점이 각각 3개', '변과 꼭짓점이 각각 4개', '앞에서만 볼 수 있는 입체 모양']
        : target === '삼각형'
          ? ['둥근 선으로만 이루어짐', '변과 꼭짓점이 각각 4개', '쌓아서 만든 입체 모양']
          : target === '사각형'
            ? ['둥근 선으로만 이루어짐', '변과 꼭짓점이 각각 3개', '쌓아서 만든 입체 모양']
            : ['한 조각만 사용함', '쌓기나무를 위로 쌓음', '길이를 재는 도구임'],
      data.answerReason,
      'shape',
      `${target}의 설명 고르기`,
    );
  }

  if (variant === 5) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `보기에서 ${target}을 고를 때 알맞은 판단 방법은?`,
      target === '원' ? '둥근 선인지 본다' : target === '칠교' ? '조각을 돌리고 맞추어 본다' : '변과 꼭짓점의 개수를 센다',
      ['색깔만 본다', '가장 큰 것만 고른다', '이름이 긴 것만 고른다'],
      `도형은 겉모양의 성질을 기준으로 판단해야 합니다.`,
      'shape',
      `${target} 판단 기준 세우기`,
    );
  }

  if (variant === 6) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target === '원' ? '둥근 선이 있는 모양' : target === '칠교' ? '조각을 맞춘 모양' : `${data.feature}인 모양`}을 찾아 이름을 붙이면?`,
      target,
      target === '원' ? ['삼각형', '사각형', '쌓기나무'] : ['원', target === '삼각형' ? '사각형' : '삼각형', '쌓기나무'],
      `${data.answerReason}`,
      'shape',
      '성질을 도형 이름과 연결',
    );
  }

  if (variant === 7) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target} 모양을 그리거나 만들 때 조심할 점은?`,
      target === '원' ? '곧은 변과 꼭짓점을 만들지 않는다' : target === '칠교' ? '조각 사이가 겹치지 않게 맞춘다' : `변과 꼭짓점의 개수가 ${target === '삼각형' ? '3개' : '4개'}인지 확인한다`,
      ['색깔만 맞춘다', '이름을 먼저 크게 쓴다', '가장 긴 선만 본다'],
      `도형 만들기에서는 목표 도형의 성질이 드러나도록 구성해야 합니다.`,
      'shape',
      `${target} 만들기 조건 확인`,
    );
  }

  if (variant === 8) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `두 모양이 모두 ${target}인지 비교할 때 가장 알맞은 말은?`,
      '성질이 같은지 확인한다',
      ['색깔만 같으면 된다', '큰 모양만 맞으면 된다', '이름을 보지 않고 찍는다'],
      `같은 도형인지 비교할 때는 변, 꼭짓점, 둥근 선 같은 성질을 확인해야 합니다.`,
      'shape',
      '두 도형 비교 기준 찾기',
    );
  }

  if (variant === 9) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}에 대한 친구의 말 중 바른 것은?`,
      target === '원'
        ? '꼭짓점이 없고 둥근 선으로 이루어졌어'
        : target === '칠교'
          ? '조각을 돌려도 같은 조각을 사용할 수 있어'
          : `변과 꼭짓점을 세어 보면 ${target}인지 알 수 있어`,
      ['색깔이 같으면 모두 같은 도형이야', '큰 도형만 이름을 붙일 수 있어', '돌리면 도형 이름이 반드시 바뀌어'],
      `도형 이름은 색깔이나 방향이 아니라 성질로 정합니다.`,
      'shape',
      '도형 설명의 참거짓 판단',
    );
  }

  if (variant === 10) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 찾은 뒤 이유를 말하려면 어떤 말을 넣어야 할까요?`,
      target === '원' ? '둥근 선' : target === '칠교' ? '조각을 맞춘 방법' : '변과 꼭짓점의 개수',
      ['색깔', '친구 이름', '놓인 자리 번호'],
      `도형을 고른 이유는 도형의 성질을 사용해 말해야 합니다.`,
      'shape',
      '도형 선택 이유 말하기',
    );
  }

  if (variant === 11) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `교실에서 ${target}과 비슷한 물건을 찾으려면 무엇을 보아야 할까요?`,
      target === '원' ? '둥근 테두리' : target === '칠교' ? '여러 조각을 맞춘 모양' : `곧은 변과 꼭짓점 ${target === '삼각형' ? '3개' : '4개'}`,
      ['물건의 가격', '물건을 든 사람', '책상 색깔'],
      `생활 속 물건도 도형의 성질로 살펴볼 수 있습니다.`,
      'shape',
      '생활 물건을 도형으로 관찰',
    );
  }

  if (variant === 12) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 다른 도형과 나누어 분류할 때 알맞은 기준은?`,
      target === '원' ? '둥근 선이 있는지' : target === '칠교' ? '조각을 맞추어 만든 모양인지' : `변과 꼭짓점이 ${target === '삼각형' ? '3개' : '4개'}인지`,
      ['가장 좋아하는 색인지', '책상 가까이에 있는지', '그림이 큰지'],
      `분류 기준은 도형을 빠짐없이 나누는 성질이어야 합니다.`,
      'shape',
      '도형 분류 기준 세우기',
    );
  }

  if (variant === 13) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 고른 답이 맞는지 마지막에 확인할 것은?`,
      target === '원' ? '곧은 변이나 꼭짓점이 없는지' : target === '칠교' ? '조각을 돌리거나 뒤집어 맞출 수 있는지' : `변과 꼭짓점이 각각 ${target === '삼각형' ? '3개' : '4개'}인지`,
      ['선생님 이름', '문제 번호', '그림의 색깔만'],
      `답을 고른 뒤에도 도형의 핵심 성질을 다시 확인해야 합니다.`,
      'shape',
      `${target} 답 검산하기`,
    );
  }

  if (variant === 14) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}과 가장 관계 깊은 낱말은?`,
      target === '원' ? '둥근 선' : target === '칠교' ? '돌리기와 뒤집기' : target === '삼각형' ? '세 변' : '네 변',
      ['시각', '받아올림', '요일'],
      `차시 목표와 직접 연결되는 낱말을 고르면 도형의 핵심 개념을 확인할 수 있습니다.`,
      'shape',
      '도형 핵심 낱말 찾기',
    );
  }

  if (variant === 15) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 찾는 문제에서 가장 자주 하는 실수는?`,
      '방향이나 크기만 보고 판단하는 것',
      ['성질을 세어 보는 것', '이유를 말하는 것', '보기의 모양을 살피는 것'],
      `도형은 방향과 크기가 달라도 성질이 같으면 같은 도형일 수 있습니다.`,
      'shape',
      '도형 오개념 점검',
    );
  }

  if (variant === 16) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 설명하는 문장을 완성하려면 □에 들어갈 말은? "${target}은/는 □으로 구별합니다."`,
      target === '원' ? '둥근 선' : target === '칠교' ? '조각을 맞춘 모양' : '변과 꼭짓점',
      ['요일', '색깔만', '받아올림'],
      `도형 설명은 모양의 성질을 넣어 완성해야 합니다.`,
      'shape',
      '도형 설명 문장 완성',
    );
  }

  if (variant === 17) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `문제에서 "${data.feature}"라고 했습니다. 떠올릴 수 있는 도형은?`,
      target,
      target === '원' ? ['삼각형', '사각형', '쌓기나무'] : ['원', target === '삼각형' ? '사각형' : '삼각형', '쌓기나무'],
      `${data.answerReason}`,
      'shape',
      '성질 단서로 도형 추론',
    );
  }

  if (variant === 18) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target} 문제를 풀 때 그림에 표시하면 가장 도움이 되는 것은?`,
      target === '원' ? '둥근 선' : target === '칠교' ? '조각의 위치' : '변과 꼭짓점',
      ['문제 번호', '친구 이름', '색칠한 넓이만'],
      `문제 풀이에 필요한 표시를 하면 도형의 성질을 놓치지 않을 수 있습니다.`,
      'shape',
      '그림에 표시하며 풀기',
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `${target}을 고른 뒤 알맞은 확인 질문은?`,
    target === '원' ? '둥근 선으로 이루어졌나요?' : target === '칠교' ? '조각을 돌려 맞출 수 있나요?' : `변과 꼭짓점이 ${target === '삼각형' ? '3개' : '4개'}인가요?`,
    ['몇 시인가요?', '몇 명인가요?', '얼마씩 커지나요?'],
    `확인 질문도 차시 목표인 도형의 성질에 맞아야 합니다.`,
    'shape',
    `${target} 자기 점검 질문 고르기`,
  );
};

const legacySolidQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const variant = variantForDifficulty(difficulty, index, 20, 6);
  const cubes = 4 + (index % 8) + difficultyIndex[difficulty] * 2;
  const visible = Math.max(2, cubes - (1 + (index % 3)));
  const hidden = cubes - visible;
  const front = 2 + (index % 3);
  const side = 2 + ((index + 1) % 3);
  const top = 3 + ((index + 2) % 4);

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${cubes}개 중 위에서 보이는 칸이 ${visible}칸입니다. 보이지 않는 쌓기나무는 몇 개일까요?`,
      hidden,
      [visible, hidden + 1, Math.max(0, hidden - 1)],
      `전체 ${cubes}개에서 위에서 보이는 ${visible}개를 제외하면 숨어 있는 쌓기나무는 ${hidden}개입니다.`,
      'solid',
      '보이는 모양과 전체 개수 연결',
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '보기와 똑같은 쌓기나무 모양을 만들 때 먼저 확인할 것은?',
      '앞, 옆, 위에서 본 모양',
      ['나무의 색깔만', '책상 위 글자', '둥근 선의 개수'],
      `같은 입체 모양을 만들려면 한 방향만 보지 말고 앞, 옆, 위에서 본 모양을 함께 확인해야 합니다.`,
      'solid',
      '여러 방향에서 본 모양 확인',
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${cubes}개로 만들 수 있는 모양을 설명한 말로 알맞은 것은?`,
      '같은 개수라도 모양은 여러 가지가 될 수 있다',
      ['항상 한 줄 모양만 된다', '원 모양만 된다', '개수가 다르면 같은 모양이다'],
      `같은 개수의 쌓기나무라도 놓는 위치가 달라지면 서로 다른 입체 모양을 만들 수 있습니다.`,
      'solid',
      '조건에 맞는 입체 모양 구성',
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `앞에서 보면 ${front}칸, 옆에서 보면 ${side}칸인 쌓기나무 모양을 만들 때 반드시 생각해야 할 것은?`,
      '숨어 있는 쌓기나무',
      ['색깔', '가장 큰 면', '둥근 선'],
      `입체도형은 한 방향에서 보이는 모양만으로는 부족합니다. 보이지 않는 쌓기나무까지 생각해야 같은 모양을 만들 수 있습니다.`,
      'solid',
      '앞, 옆, 위에서 본 모양 비교',
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `위에서 보면 ${top}칸인데 쌓기나무가 모두 ${cubes}개라면 알 수 있는 것은?`,
      '아래에 가려진 쌓기나무가 있을 수 있다',
      ['반드시 모두 한 층이다', '원 모양으로 쌓았다', `쌓기나무는 항상 ${top}개이다`],
      `위에서 보이는 칸 수와 전체 개수가 다르면, 위에서는 보이지 않는 아래층 쌓기나무가 있을 수 있습니다.`,
      'solid',
      '쌓기나무의 숨은 부분 추론',
    );
  }

  if (variant === 5) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `1층에 ${front + side}개, 2층에 ${difficulty === '하' ? 1 : 2}개를 쌓았습니다. 쌓기나무는 모두 몇 개일까요?`,
      front + side + (difficulty === '하' ? 1 : 2),
      [front + side, front + side + 3, Math.max(1, front + side - 1)],
      `층별 개수를 모두 더합니다.`,
      'solid',
      '층별 쌓기나무 개수 세기',
    );
  }

  if (variant === 6) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${cubes}개를 모두 한 줄로 놓은 모양과 계단 모양은 무엇이 같을까요?`,
      '사용한 쌓기나무의 개수',
      ['앞에서 본 모양', '항상 높이', '둥근 선의 수'],
      `놓는 위치가 달라도 사용한 쌓기나무 개수는 같을 수 있습니다.`,
      'solid',
      '개수와 모양의 차이 구별',
    );
  }

  if (variant === 7) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '위에서 본 모양만 보고 전체 쌓기나무 개수를 바로 알 수 없는 까닭은?',
      '아래층에 가려진 쌓기나무가 있을 수 있기 때문',
      ['색깔을 모르기 때문', '모두 원 모양이기 때문', '숫자가 없기 때문'],
      `위에서 본 칸은 위치를 알려 주지만 높이가 몇 층인지는 따로 확인해야 합니다.`,
      'solid',
      '위에서 본 모양의 한계 이해',
    );
  }

  if (variant === 8) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `앞에서 본 칸이 ${front}칸이고 위에서 본 칸이 ${top}칸입니다. 같은 모양을 만들려면 무엇을 함께 보아야 할까요?`,
      '옆에서 본 모양',
      ['도형의 색깔', '문제 번호', '원의 지름'],
      `입체 모양은 앞, 옆, 위에서 본 정보를 함께 써야 더 정확히 만들 수 있습니다.`,
      'solid',
      '세 방향 정보 연결',
    );
  }

  if (variant === 9) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${cubes}개 중 ${cubes - 2}개만 보인다고 했습니다. 숨어 있는 것은 몇 개일까요?`,
      2,
      [0, 1, cubes - 2],
      `전체에서 보이는 개수를 빼면 숨어 있는 개수를 알 수 있습니다.`,
      'solid',
      '보이지 않는 쌓기나무 계산',
    );
  }

  if (variant === 10) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '쌓기나무 모양을 설명할 때 가장 알맞은 말은?',
      '몇 층인지와 어느 위치에 있는지 함께 말한다',
      ['색깔만 말한다', '원인지 아닌지만 말한다', '가장 큰 수만 말한다'],
      `입체 모양은 높이와 위치가 중요합니다.`,
      'solid',
      '쌓기나무 모양 설명하기',
    );
  }

  if (variant === 11) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `보기 모양에서 맨 위층에 1개, 아래층에 ${cubes - 1}개가 있습니다. 모두 몇 개일까요?`,
      cubes,
      [cubes - 1, cubes + 1, 1],
      `층별 개수를 더하면 ${cubes}개입니다.`,
      'solid',
      '층별 정보로 전체 개수 구하기',
    );
  }

  if (variant === 12) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '같은 쌓기나무 모양인지 확인할 때 가장 좋은 방법은?',
      '방향을 바꾸어 보며 위치와 높이를 비교한다',
      ['색깔 이름만 비교한다', '가장 앞의 1개만 본다', '문제 글자 수를 센다'],
      `같은 입체 모양은 위치와 높이가 모두 맞아야 합니다.`,
      'solid',
      '같은 입체 모양 판단',
    );
  }

  if (variant === 13) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `위에서 본 칸은 ${top}칸이고, 그중 한 칸은 2층입니다. 쌓기나무는 모두 몇 개일까요?`,
      top + 1,
      [top, top + 2, Math.max(1, top - 1)],
      `위에서 본 칸마다 1개씩 있고, 2층인 칸은 1개가 더 있으므로 ${top}+1=${top + 1}개입니다.`,
      'solid',
      '층 높이를 반영해 개수 세기',
    );
  }

  if (variant === 14) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '쌓기나무 문제에서 그림에 표시하면 가장 도움이 되는 것은?',
      '층과 위치',
      ['요일', '받아올림', '둥근 선'],
      `층과 위치를 표시하면 빠뜨린 쌓기나무를 줄일 수 있습니다.`,
      'solid',
      '그림에 표시하며 입체 추론',
    );
  }

  if (variant === 15) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${cubes}개를 1층에 ${cubes - 1}개 놓고 그 위에 1개를 놓았습니다. 가장 높은 층은?`,
      '2층',
      ['1층', '3층', `${cubes}층`],
      `아래층 위에 1개를 올렸으므로 가장 높은 곳은 2층입니다.`,
      'solid',
      '층의 높이 판단',
    );
  }

  if (variant === 16) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '앞에서 본 모양과 위에서 본 모양이 모두 필요하다는 설명으로 알맞은 것은?',
      '한 방향만 보면 숨은 부분을 놓칠 수 있다',
      ['한 방향만 보면 항상 충분하다', '위에서 본 모양은 필요 없다', '쌓기나무는 평면도형이다'],
      `입체도형은 보이는 방향에 따라 정보가 달라집니다.`,
      'solid',
      '여러 방향 관찰의 필요성',
    );
  }

  if (variant === 17) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무가 ${cubes}개 있습니다. 2개를 더 쌓으면 모두 몇 개일까요?`,
      cubes + 2,
      [cubes, cubes + 1, Math.max(0, cubes - 2)],
      `기존 개수에 더 쌓은 개수를 더하면 됩니다.`,
      'solid',
      '쌓기나무 개수 변화 계산',
    );
  }

  if (variant === 18) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '쌓기나무 모양을 말로 설명한 뒤 꼭 확인해야 할 것은?',
      '실제로 같은 위치에 쌓을 수 있는지',
      ['글씨가 예쁜지', '색깔이 모두 같은지', '문제가 짧은지'],
      `설명한 위치대로 쌓아 보며 같은 모양인지 확인해야 합니다.`,
      'solid',
      '설명과 구성 결과 확인',
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `위에서 본 모양이 ${top}칸이고 모두 한 층이라면 쌓기나무는 몇 개일까요?`,
    top,
    [top + 1, Math.max(1, top - 1), top * 2],
    `모두 한 층이면 위에서 보이는 칸 수와 전체 쌓기나무 개수가 같습니다.`,
    'solid',
    '한 층 모양에서 전체 개수 찾기',
  );
};

const legacyShapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;

  if (text.includes('쌓') || lesson.tags.includes('solid')) {
    return solidQuestion(lesson, difficulty, index);
  }

  return planeShapeQuestion(lesson, difficulty, index);
};

/*
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const variant = variantForDifficulty(difficulty, index, 5, 2);

  if (text.includes('쌓') || lesson.tags.includes('solid')) {
    const cubes = 4 + (index % 5) + difficultyIndex[difficulty] * 2;
    if (variant === 0) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `쌓기나무 ${cubes}개 중 위에서 보이는 칸이 ${cubes - 1}칸입니다. 보이지 않는 쌓기나무는 몇 개일까요?`,
        1,
        [0, 2, cubes - 1],
        `전체 ${cubes}개에서 위에서 보이는 ${cubes - 1}개를 제외하면 숨어 있는 쌓기나무는 1개입니다.`,
        'solid',
        '보이는 모양과 전체 개수 연결',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '보기와 똑같은 쌓기나무 모양을 만들 때 먼저 확인할 것은?',
        '앞, 옆, 위에서 본 모양',
        ['나무의 색깔만', '책상 위 글자', '둥근 선의 개수'],
        `같은 입체 모양을 만들려면 한 방향만 보지 말고 앞, 옆, 위에서 본 모양을 함께 확인해야 합니다.`,
        'solid',
        '여러 방향에서 본 모양 확인',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `쌓기나무 ${cubes}개로 만들 수 있는 모양을 설명한 말로 알맞은 것은?`,
        '같은 개수라도 모양은 여러 가지가 될 수 있다',
        ['항상 한 줄 모양만 된다', '원 모양만 된다', '개수가 다르면 같은 모양이다'],
        `같은 개수의 쌓기나무라도 놓는 위치가 달라지면 서로 다른 입체 모양을 만들 수 있습니다.`,
        'solid',
        '조건에 맞는 입체 모양 구성',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `앞에서 보면 3칸, 옆에서 보면 2칸인 쌓기나무 모양을 만들 때 반드시 생각해야 할 것은?`,
        '숨어 있는 쌓기나무',
        ['색깔', '가장 큰 면', '둥근 선'],
        `입체도형은 한 방향에서 보이는 모양만으로는 부족합니다. 보이지 않는 쌓기나무까지 생각해야 같은 모양을 만들 수 있습니다.`,
        'solid',
        '앞, 옆, 위에서 본 모양 비교',
      );
    }

    return makeQuestion(
      lesson,
      difficulty,
      index,
      `위에서 보면 4칸인데 쌓기나무가 모두 ${cubes}개라면 알 수 있는 것은?`,
      '아래에 가려진 쌓기나무가 있을 수 있다',
      ['반드시 모두 한 층이다', '원 모양으로 쌓았다', '쌓기나무는 항상 4개이다'],
      `위에서 보이는 칸 수와 전체 개수가 다르면, 위에서는 보이지 않는 아래층 쌓기나무가 있을 수 있습니다.`,
      'solid',
      '쌓기나무의 숨은 부분 추론',
    );
  }

  if (text.includes('○') && variant <= 2) {
    if (variant === 1) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '원 모양인 물건으로 알맞은 것은?',
        '동그란 접시',
        ['세모 표지판', '네모 창문', '쌓기나무'],
        `원은 둥근 선으로 이루어진 모양입니다. 동그란 접시는 원 모양으로 볼 수 있습니다.`,
        'shape',
        '생활 속 원 모양 찾기',
      );
    }

    if (variant === 2) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '변과 꼭짓점이 있는 모양을 원이라고 할 수 없는 까닭은?',
        '원은 둥근 선으로 이루어져 있기 때문',
        ['원은 항상 파란색이기 때문', '원은 쌓기나무이기 때문', '원은 숫자이기 때문'],
        `원은 곧은 변이나 꼭짓점이 아니라 둥근 선으로 이루어진 평면도형입니다.`,
        'shape',
        '원이 아닌 모양의 까닭 찾기',
      );
    }

    return makeQuestion(
      lesson,
      difficulty,
      index,
      '원에 대한 설명으로 알맞은 것은?',
      '둥근 선으로 이루어져 있다',
      ['변이 3개이다', '꼭짓점이 4개이다', '쌓을 수 있다'],
      `원은 곧은 변과 꼭짓점이 없고 둥근 선으로 이루어진 평면도형입니다.`,
      'shape',
      '원의 특징 구별',
    );
  }

  if (text.includes('△') && variant <= 2) {
    if (variant === 0) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '삼각형 모양인 물건으로 알맞은 것은?',
        '세모 표지판',
        ['동그란 접시', '네모 창문', '공 모양'],
        `삼각형은 변과 꼭짓점이 각각 3개인 모양입니다. 세모 표지판은 삼각형으로 볼 수 있습니다.`,
        'shape',
        '생활 속 삼각형 찾기',
      );
    }

    if (variant === 2) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '삼각형이 아닌 모양을 고를 때 확인할 것은?',
        '변과 꼭짓점이 3개가 아닌지',
        ['색깔이 예쁜지', '종이가 큰지', '이름이 긴지'],
        `삼각형인지 아닌지는 색깔이나 크기가 아니라 변과 꼭짓점의 개수로 확인합니다.`,
        'shape',
        '삼각형이 아닌 이유 찾기',
      );
    }

    return makeQuestion(
      lesson,
      difficulty,
      index,
      '삼각형을 찾을 때 가장 먼저 볼 특징은?',
      '변과 꼭짓점이 각각 3개',
      ['둥근 선이 있는지', '색깔이 같은지', '쌓을 수 있는지'],
      `삼각형은 변이 3개, 꼭짓점이 3개인 도형입니다. 방향이 달라져도 특징은 같습니다.`,
      'shape',
      '삼각형의 변과 꼭짓점 확인',
    );
  }

  if (text.includes('□') && variant <= 2) {
    if (variant === 0) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '사각형을 찾을 때 먼저 확인할 것은?',
        '변과 꼭짓점이 각각 4개인지',
        ['둥근 선만 있는지', '색깔이 같은지', '굴러가는지'],
        `사각형은 변과 꼭짓점이 각각 4개인 평면도형입니다.`,
        'shape',
        '사각형의 기본 성질 확인',
      );
    }

    if (variant === 1) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '사각형이 아닌 모양은?',
        '둥근 접시 모양',
        ['네모 창문', '책 표지', '교실 칠판'],
        `둥근 접시는 곧은 변 4개와 꼭짓점 4개가 없으므로 사각형이 아닙니다.`,
        'shape',
        '사각형과 아닌 모양 구별',
      );
    }

    return makeQuestion(
      lesson,
      difficulty,
      index,
      '사각형으로 볼 수 있는 모양은?',
      '변이 4개인 문 모양',
      ['둥근 접시 모양', '변이 3개인 표지판', '공 모양'],
      `사각형은 변이 4개이고 꼭짓점이 4개인 평면도형입니다.`,
      'shape',
      '사각형의 변과 꼭짓점 확인',
    );
  }

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '원에 대한 설명으로 알맞은 것은?',
      '둥근 선으로 이루어져 있다',
      ['변이 3개이다', '꼭짓점이 4개이다', '쌓을 수 있다'],
      `원은 곧은 변과 꼭짓점이 없고 둥근 선으로 이루어진 평면도형입니다.`,
      'shape',
      '원의 특징 구별',
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '삼각형을 찾을 때 가장 먼저 볼 특징은?',
      '변과 꼭짓점이 각각 3개',
      ['둥근 선이 있는지', '색깔이 같은지', '쌓을 수 있는지'],
      `삼각형은 변이 3개, 꼭짓점이 3개인 도형입니다. 방향이 달라져도 특징은 같습니다.`,
      'shape',
      '삼각형의 변과 꼭짓점 확인',
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '사각형으로 볼 수 있는 모양은?',
      '변이 4개인 문 모양',
      ['둥근 접시 모양', '변이 3개인 표지판', '공 모양'],
      `사각형은 변이 4개이고 꼭짓점이 4개인 평면도형입니다.`,
      'shape',
      '사각형의 변과 꼭짓점 확인',
    );
  }

  if ((text.includes('칠교') && variant <= 2) || variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각으로 같은 모양을 만들 때 알맞은 방법은?',
      '조각을 돌리거나 뒤집어 맞추기',
      ['조각의 이름만 외우기', '항상 큰 조각만 쓰기', '색깔별로만 나누기'],
      `칠교판 활동은 도형을 돌리고 뒤집고 맞추며 새로운 모양을 만드는 활동입니다.`,
      'shape',
      '도형의 합성 및 분해',
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    '변이 4개, 꼭짓점이 4개인 도형의 이름은?',
    '사각형',
    ['원', '삼각형', '쌓기나무'],
    `변과 꼭짓점이 각각 4개이면 사각형입니다.`,
    'shape',
    '도형의 기본 특징으로 이름 찾기',
  );
*/

const measurementQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const seed = n(lesson, index);
  const variant = variantForDifficulty(difficulty, index, 5, 2);

  if (text.includes('여러 가지 단위') && variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '같은 책상의 길이를 손 한 뼘으로 잰 결과가 친구마다 다른 까닭은?',
      '손 한 뼘의 길이가 사람마다 다르기 때문',
      ['책상이 줄어들기 때문', '숫자를 쓰면 안 되기 때문', '항상 1cm이기 때문'],
      `임의 단위는 사람이나 물건에 따라 길이가 달라 결과가 달라질 수 있습니다.`,
      'measurement',
      '임의 단위의 한계 이해',
    );
  }

  if (text.includes('여러 가지 단위') && variant === 1) {
    const clips = 4 + (seed % 5);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `지우개의 긴 쪽에 같은 클립을 빈틈없이 ${clips}개 놓았습니다. 지우개 길이는 클립 몇 개쯤일까요?`,
      `${clips}개`,
      [`${clips + 2}개`, `${Math.max(1, clips - 1)}개`, '1cm'],
      `같은 단위를 빈틈없이 이어 놓아 잰 횟수를 세면 됩니다. 클립 ${clips}개를 놓았으므로 ${clips}개쯤입니다.`,
      'measurement',
      '같은 임의 단위로 길이 세기',
    );
  }

  if (text.includes('1cm') && variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '자에서 0부터 1까지의 한 칸 길이는?',
      '1cm',
      ['10cm', '1m', '1분'],
      `센티미터 자에서 0과 1 사이의 길이가 1cm입니다.`,
      'measurement',
      '1cm 단위 이해',
    );
  }

  if (text.includes('1cm') && variant === 1) {
    const length = 3 + (seed % 7);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `자의 0cm 눈금에서 ${length}cm 눈금까지 잰 선분의 길이는?`,
      `${length}cm`,
      [`${length + 1}cm`, `${Math.max(1, length - 1)}cm`, `${length * 10}cm`],
      `0cm에서 시작해 ${length}cm 눈금까지 갔으므로 선분의 길이는 ${length}cm입니다.`,
      'measurement',
      '0에서 시작해 cm 눈금 읽기',
    );
  }

  if (text.includes('1m를') && variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '1m와 가장 비슷한 길이로 알맞은 것은?',
      '교실 책상 높이쯤 되는 길이',
      ['손톱의 길이', '연필심 두께', '시계의 1분'],
      `1m는 긴 길이를 잴 때 쓰는 단위입니다. 몸이나 주변 물건에서 1m와 비슷한 기준을 떠올리면 어림할 수 있습니다.`,
      'measurement',
      '1m 기준 길이 찾기',
    );
  }

  if (text.includes('1m를') && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '교실에서 1m보다 긴 것으로 알맞은 것은?',
      '칠판의 가로 길이',
      ['지우개 한 개의 길이', '손톱의 길이', '연필심의 두께'],
      `1m는 작은 물건보다 훨씬 긴 길이입니다. 칠판의 가로 길이는 보통 1m보다 깁니다.`,
      'measurement',
      '1m와 주변 물건 비교',
    );
  }

  if (text.includes('1m를') && variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '1m는 몇 cm일까요?',
      '100cm',
      ['10cm', '1cm', '60cm'],
      `1m는 100cm와 같습니다. 긴 길이를 cm로 나타낼 때 이 관계를 사용합니다.`,
      'measurement',
      '1m와 100cm 관계 알기',
    );
  }

  if ((text.includes('m와 cm') || (text.includes('1m') && !text.includes('1m를'))) && variant <= 2) {
    const meters = 1 + (index % 4);
    const cm = (seed * 7) % 90;
    const answer = meters * 100 + cm;
    if (variant === 0) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${meters}m ${cm}cm는 모두 몇 cm일까요?`,
        `${answer}cm`,
        [`${meters + cm}cm`, `${answer + 10}cm`, `${meters * 100}cm`],
        `1m는 100cm이므로 ${meters}m는 ${meters * 100}cm입니다. 여기에 ${cm}cm를 더하면 ${answer}cm입니다.`,
        'measurement',
        'm와 cm를 모두 cm로 바꾸기',
      );
    }

    if (variant === 1) {
      const other = answer - 8;
      return makeQuestion(
        lesson,
        difficulty,
        index,
        `${meters}m ${cm}cm와 ${other}cm 중 더 긴 길이는?`,
        `${meters}m ${cm}cm`,
        [`${other}cm`, '둘 다 같다', `${Math.max(0, other - 10)}cm`],
        `${meters}m ${cm}cm는 ${answer}cm입니다. ${answer}cm가 ${other}cm보다 크므로 ${meters}m ${cm}cm가 더 깁니다.`,
        'measurement',
        '단위를 같게 하여 길이 비교',
      );
    }

    const totalCm = 100 + ((seed * 5) % 180);
    const splitMeters = Math.floor(totalCm / 100);
    const restCm = totalCm % 100;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${totalCm}cm를 m와 cm로 나타낸 것은?`,
      `${splitMeters}m ${restCm}cm`,
      [`${splitMeters}m ${restCm + 10}cm`, `${totalCm}m`, `${restCm}m ${splitMeters}cm`],
      `${totalCm}cm에서 100cm씩 묶으면 ${splitMeters}m이고 남는 길이는 ${restCm}cm입니다.`,
      'measurement',
      'cm를 m와 cm로 나누어 나타내기',
    );
  }

  if ((text.includes('어림') && variant === 0) || variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '교실 문 높이를 어림할 때 가장 알맞은 기준은?',
      '1m 정도 되는 길이를 떠올린다',
      ['손톱 길이만 떠올린다', '시계 바늘을 본다', '색깔을 비교한다'],
      `길이를 어림할 때는 이미 알고 있는 기준 길이와 비교하면 좋습니다.`,
      'measurement',
      '기준 길이를 활용한 어림',
    );
  }

  if (text.includes('어림') && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '책상 길이를 어림한 뒤 실제로 재어 보았을 때 해야 할 일은?',
      '어림한 길이와 잰 길이를 비교한다',
      ['어림한 값만 정답으로 쓴다', '단위를 지운다', '시계로 다시 잰다'],
      `어림은 대략 생각한 길이입니다. 실제로 잰 길이와 비교하면 어림이 알맞았는지 확인할 수 있습니다.`,
      'measurement',
      '어림값과 실제 측정값 비교',
    );
  }

  if (text.includes('합과 차') && variant === 0) {
    const a = 35 + (seed % 40);
    const b = 12 + (seed % 25);
    const answer = a + b;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${a}cm 끈과 ${b}cm 끈을 이어 붙였습니다. 모두 몇 cm일까요?`,
      `${answer}cm`,
      [`${Math.max(0, a - b)}cm`, `${answer + 10}cm`, `${answer - 1}cm`],
      `두 길이를 이으면 길이의 합을 구해야 합니다. ${a}+${b}=${answer}cm입니다.`,
      'measurement',
      '길이의 합 구하기',
    );
  }

  if ((text.includes('합과 차') && variant === 1) || variant === 1) {
    const a = 30 + (seed % 45);
    const b = 12 + (seed % 24);
    const answer = difficulty === '상' ? a + b : a - Math.min(b, a - 1);
    const prompt = difficulty === '상'
      ? `파란 끈은 ${a}cm, 노란 끈은 ${b}cm입니다. 두 끈을 이으면 모두 몇 cm일까요?`
      : `${a}cm 리본에서 ${Math.min(b, a - 1)}cm를 잘랐습니다. 남은 길이는?`;
    const solution = difficulty === '상'
      ? `${a}cm와 ${b}cm를 더하면 ${answer}cm입니다.`
      : `${a}cm에서 ${Math.min(b, a - 1)}cm를 빼면 ${answer}cm입니다.`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      prompt,
      `${answer}cm`,
      [`${answer + 1}cm`, `${answer + 10}cm`, `${Math.max(0, answer - 1)}cm`],
      solution,
      'measurement',
      '길이의 합과 차 계산',
    );
  }

  if (text.includes('합과 차') && variant === 2) {
    const long = 50 + (seed % 30);
    const short = 20 + (seed % 20);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${long}cm 끈과 ${short}cm 끈의 길이 차를 구하려면 어떤 계산을 해야 할까요?`,
      `${long}-${short}`,
      [`${long}+${short}`, `${short}-${long}`, `${long}×${short}`],
      `길이의 차는 더하는 것이 아니라 긴 길이에서 짧은 길이를 빼서 구합니다. 그래서 ${long}-${short}를 계산합니다.`,
      'measurement',
      '길이 차를 구하는 식 선택',
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '두 물건의 길이를 비교하려면 가장 먼저 맞추어야 할 것은?',
      '같은 단위로 재기',
      ['다른 손으로 재기', '색깔만 보기', '숫자를 쓰지 않기'],
      `길이를 비교하려면 손 한 뼘, 클립, cm처럼 같은 단위를 사용해야 결과를 바르게 비교할 수 있습니다.`,
      'measurement',
      '같은 단위로 측정 결과 비교',
    );
  }

  if (variant === 3) {
    const startMark = 2 + (seed % 4);
    const endMark = startMark + 9 + (seed % 7);
    const answer = `${endMark - startMark}cm`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `자의 ${startMark}cm 눈금부터 ${endMark}cm 눈금까지 잰 선분을 ${endMark}cm라고 읽었습니다. 바른 길이는?`,
      answer,
      [`${endMark}cm`, `${startMark}cm`, `${endMark - startMark + 1}cm`],
      `0에서 시작하지 않았으므로 끝 눈금 ${endMark}에서 시작 눈금 ${startMark}를 빼야 합니다. ${endMark}-${startMark}=${endMark - startMark}cm입니다.`,
      'measurement',
      '0이 아닌 눈금에서 잰 길이 판단',
    );
  }

  const start = 2 + (index % 5);
  const end = start + 5 + (seed % 12);
  return makeQuestion(
    lesson,
    difficulty,
    index,
    `자의 ${start}cm 눈금에서 시작해 ${end}cm 눈금까지 이어진 선분의 길이는?`,
    `${end - start}cm`,
    [`${end}cm`, `${start}cm`, `${end - start + 1}cm`],
    `0에서 시작하지 않았을 때는 끝 눈금에서 시작 눈금을 뺍니다. ${end}-${start}=${end - start}cm입니다.`,
    'measurement',
    '자를 바르게 읽고 길이 구하기',
  );
};

const classificationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const variant = variantForDifficulty(difficulty, index, 4, 2);
  const red = 5 + (index % 5);
  const blue = 2 + ((index + 2) % 3);
  const green = 1 + ((index + 4) % 3);

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '연필, 지우개, 공책을 한 묶음으로 분류했습니다. 가장 알맞은 기준은?',
      '쓰임',
      ['색깔', '맛', '요일'],
      `연필, 지우개, 공책은 모두 공부할 때 쓰는 물건이므로 쓰임을 기준으로 분류한 것입니다.`,
      'classification',
      '분류 기준 찾기',
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '분류할 때 좋은 기준으로 알맞은 것은?',
      '빠지거나 겹치지 않게 나눌 수 있는 기준',
      ['내가 좋아하는 것만 고르는 기준', '계속 바뀌는 기준', '아무 설명이 없는 기준'],
      `좋은 분류 기준은 자료를 빠짐없이, 겹치지 않게 나눌 수 있어야 합니다.`,
      'classification',
      '좋은 분류 기준 판단',
    );
  }

  if (variant === 2) {
    const answer = red + blue + green;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `색깔별로 분류한 딱지가 빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개입니다. 딱지는 모두 몇 개일까요?`,
      answer,
      [red + blue, blue + green, answer + 1],
      `분류한 결과의 전체 수는 항목별 수를 모두 더해 구합니다. ${red}+${blue}+${green}=${answer}개입니다.`,
      'data',
      '분류 결과의 전체 수 구하기',
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `빨강 ${red}개, 파랑 ${blue}개입니다. 빨강은 파랑보다 몇 개 더 많을까요?`,
    Math.max(0, red - blue),
    [red + blue, blue, Math.abs(red - blue) + 1],
    `더 많은 정도는 두 항목의 차로 구합니다. ${red}-${blue}=${Math.max(0, red - blue)}개입니다.`,
    'data',
    '분류 결과 비교하기',
  );
};

const multiplicationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const seed = n(lesson, index);
  const variant = variantForDifficulty(difficulty, index, 6, 3);
  const group = difficulty === '하' ? 2 + (seed % 4) : 2 + (seed % 8);
  const count = difficulty === '하' ? 2 + ((seed + 1) % 4) : 3 + ((seed + 2) % 7);
  const answer = group * count;
  const hasSpecificMultiplicationFocus = text.includes('몇 배') || text.includes('곱셈식') || text.includes('구구');

  if (((text.includes('여러 가지 방법') || text.includes('묶어')) && variant === 0) || (!hasSpecificMultiplicationFocus && variant === 0)) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}개씩 ${count}묶음이 있습니다. 모두 몇 개일까요?`,
      answer,
      [group + count, answer + group, Math.max(0, answer - group)],
      `${group}개가 ${count}묶음이므로 같은 수 ${group}을 ${count}번 더한 것과 같습니다. 답은 ${answer}개입니다.`,
      'multiplication',
      '같은 수씩 묶어 세기',
    );
  }

  if ((text.includes('여러 가지 방법') || text.includes('묶어')) && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}씩 ${count}번 뛰어 세면 마지막 수는 무엇일까요?`,
      answer,
      [group + count, answer + group, Math.max(0, answer - group)],
      `${group}씩 ${count}번 뛰어 세는 것은 ${group}이 ${count}묶음 있는 것과 같습니다. 마지막 수는 ${answer}입니다.`,
      'multiplication',
      '뛰어 세기로 묶음 세기',
    );
  }

  if (text.includes('몇 배') && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}개씩 담긴 접시가 ${count}개 있습니다. 몇 배 상황에서 기준량은 무엇일까요?`,
      `${group}개`,
      [`${count}개`, `${answer}개`, `${group + count}개`],
      `몇 배에서 기준량은 한 번에 있는 양입니다. 한 접시에 ${group}개씩 있으므로 기준량은 ${group}개입니다.`,
      'multiplication',
      '몇 배 상황에서 기준량 찾기',
    );
  }

  if ((text.includes('몇 배') && variant === 0) || variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}의 ${count}배는 얼마일까요?`,
      answer,
      [group + count, count, answer + group],
      `${group}의 ${count}배는 ${group}이 ${count}번 있는 것이므로 ${group}×${count}=${answer}입니다.`,
      'multiplication',
      '배의 의미 이해',
    );
  }

  if (text.includes('곱셈식') && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}×${count}가 나타내는 뜻으로 알맞은 것은?`,
      `${group}이 ${count}묶음`,
      [`${group}+${count}`, `${count}이 ${group + count}묶음`, `${answer}이 ${count}묶음`],
      `${group}×${count}는 ${group}이 ${count}묶음 있다는 뜻입니다.`,
      'multiplication',
      '곱셈식의 뜻 읽기',
    );
  }

  if (text.includes('곱셈식') && variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}개씩 ${count}묶음인 그림을 곱셈식으로 나타낸 것은?`,
      `${group}×${count}`,
      [`${group}+${count}`, `${count}×${group + count}`, `${answer}×${count}`],
      `한 묶음에 ${group}개씩 있고 그런 묶음이 ${count}개이므로 ${group}×${count}입니다.`,
      'multiplication',
      '묶음 그림을 곱셈식으로 나타내기',
    );
  }

  if ((text.includes('곱셈식') && variant === 0) || variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${group}+${group}+${group}+${group}을 곱셈식으로 나타낸 것은?`,
      `${group}×4`,
      [`4×${group + 1}`, `${group}+4`, `${group}×${count}`],
      `같은 수 ${group}이 4번 더해졌으므로 ${group}×4로 나타냅니다.`,
      'multiplication',
      '반복 덧셈을 곱셈식으로 나타내기',
    );
  }

  if ((text.includes('구구') && variant <= 1) || variant === 3) {
    const dan = text.includes('2단') ? 2 : text.includes('5단') ? 5 : text.includes('3단') ? 3 : text.includes('6단') ? 6 : text.includes('4단') ? 4 : text.includes('8단') ? 8 : text.includes('7단') ? 7 : text.includes('9단') ? 9 : group;
    const times = 2 + (index % 8);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${dan}×${times}의 값은?`,
      dan * times,
      [dan + times, dan * (times + 1), Math.max(0, dan * times - dan)],
      `${dan}단에서 ${dan}씩 ${times}번 뛰어 세면 ${dan * times}입니다.`,
      'multiplication',
      '곱셈구구 적용',
    );
  }

  if (variant === 4) {
    const total = answer;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `□×${count}=${total}입니다. □에 알맞은 수는?`,
      group,
      [count, total, group + 1],
      `${total}은 같은 수가 ${count}묶음 있는 전체입니다. ${group}이 ${count}번 모이면 ${total}이 됩니다.`,
      'multiplication',
      '빠진 곱셈식 값 찾기',
    );
  }

  const result = answer - group;
  return makeQuestion(
    lesson,
    difficulty,
    index,
    `한 상자에 연필이 ${group}자루씩 있습니다. ${count}상자 중 한 상자를 친구에게 주면 몇 자루가 남을까요?`,
    result,
    [answer, result + group, Math.max(0, result - group)],
    `먼저 전체는 ${group}×${count}=${answer}자루입니다. 한 상자 ${group}자루를 주면 ${answer}-${group}=${result}자루가 남습니다.`,
    'multiplication',
    '곱셈을 활용한 두 단계 문제',
  );
};

const timeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const hour = 1 + (index % 10);
  const minute = (index * 5 + difficultyIndex[difficulty] * 10) % 60;
  const variant = variantForDifficulty(difficulty, index, 4, 1);

  if (text.includes('몇 시 몇 분') && variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `긴바늘이 ${minute / 5 === 0 ? 12 : minute / 5}를 가리키고 짧은바늘이 ${hour} 근처에 있습니다. 알맞은 시각은?`,
      `${hour}시 ${minute}분`,
      [`${hour + 1}시 ${minute}분`, `${hour}시 ${Math.max(0, minute - 5)}분`, `${hour}시 ${(minute + 10) % 60}분`],
      `짧은바늘은 시, 긴바늘은 분을 나타냅니다. 긴바늘 한 숫자 간격은 5분입니다.`,
      'time',
      '시계 바늘로 시각 읽기',
    );
  }

  if (text.includes('몇 시 몇 분') && variant === 1) {
    const hand = minute / 5 === 0 ? 12 : minute / 5;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `긴바늘이 ${hand}를 가리키면 몇 분을 나타낼까요?`,
      `${minute}분`,
      [`${hand}분`, `${Math.max(0, minute - 5)}분`, `${(minute + 10) % 60}분`],
      `긴바늘은 숫자 하나를 지날 때마다 5분씩 늘어납니다. ${hand}까지는 ${minute}분입니다.`,
      'time',
      '긴바늘 숫자와 분 연결',
    );
  }

  if (text.includes('몇 시 몇 분') && variant === 2) {
    const targetMinute = ((index % 11) + 1) * 5;
    const targetHand = targetMinute === 60 ? 12 : targetMinute / 5;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${hour}시 ${targetMinute}분을 나타낼 때 긴바늘이 가리키는 숫자는?`,
      targetHand,
      [targetHand + 1, Math.max(1, targetHand - 1), targetMinute],
      `${targetMinute}분은 5분씩 ${targetHand}번 간 것입니다. 그래서 긴바늘은 ${targetHand}를 가리킵니다.`,
      'time',
      '시각에서 긴바늘 위치 찾기',
    );
  }

  if (text.includes('몇 시 몇 분') && variant === 3) {
    const targetHour = 1 + (index % 10);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `긴바늘이 9를 가리키고 짧은바늘이 ${targetHour}와 ${targetHour + 1} 사이에 있습니다. 알맞은 시각은?`,
      `${targetHour}시 45분`,
      [`${targetHour + 1}시 45분`, `${targetHour}시 9분`, `${targetHour}시 40분`],
      `긴바늘이 9를 가리키면 45분입니다. 짧은바늘은 아직 다음 시에 닿지 않았으므로 ${targetHour}시 45분입니다.`,
      'time',
      '두 바늘 위치로 시각 판단',
    );
  }

  if (text.includes('걸린') && variant === 1) {
    const elapsed = difficulty === '하' ? 20 : difficulty === '중' ? 35 : 50;
    const endMinute = minute + elapsed;
    const endHour = hour + Math.floor(endMinute / 60);
    const endRest = endMinute % 60;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${hour}시 ${minute}분에 시작해서 ${endHour}시 ${endRest}분에 끝났습니다. 걸린 시간은?`,
      `${elapsed}분`,
      [`${endRest}분`, `${minute}분`, `${elapsed + 10}분`],
      `시계에서 시작 시각부터 끝 시각까지 앞으로 세면 ${elapsed}분이 지났습니다.`,
      'time',
      '시작과 끝으로 걸린 시간 구하기',
    );
  }

  if ((text.includes('걸린') && variant === 0) || (!text.includes('몇 시 몇 분') && !text.includes('달력') && variant === 1)) {
    const elapsed = difficulty === '하' ? 20 : difficulty === '중' ? 35 : 50;
    const endMinute = minute + elapsed;
    const answer = `${hour + Math.floor(endMinute / 60)}시 ${endMinute % 60}분`;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${hour}시 ${minute}분에 시작해서 ${elapsed}분 동안 했습니다. 끝난 시각은?`,
      answer,
      [`${hour}시 ${elapsed}분`, `${hour + 1}시 ${minute}분`, `${hour}시 ${(minute + elapsed + 10) % 60}분`],
      `${minute}분에 ${elapsed}분을 더합니다. 60분이 넘으면 1시간으로 바꾸어 ${answer}입니다.`,
      'time',
      '몇 분 후의 시각 구하기',
    );
  }

  if (text.includes('걸린') && variant === 2) {
    const first = difficulty === '하' ? 20 : difficulty === '중' ? 30 : 45;
    const second = 10 + (index % 4) * 5;
    const total = first + second;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `그림 그리기를 ${first}분, 정리를 ${second}분 했습니다. 모두 걸린 시간은?`,
      `${total}분`,
      [`${first}분`, `${second}분`, `${total + 10}분`],
      `두 활동에 걸린 시간을 모두 더합니다. ${first}+${second}=${total}분입니다.`,
      'time',
      '걸린 시간의 합 구하기',
    );
  }

  if (text.includes('걸린') && variant === 3) {
    const minutes = 10 + (index % 4) * 5;
    const total = 60 + minutes;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `1시간 ${minutes}분 동안 활동했습니다. 모두 몇 분 동안 활동했을까요?`,
      `${total}분`,
      [`${minutes}분`, '60분', `${total - 10}분`],
      `1시간은 60분입니다. 60분에 ${minutes}분을 더하면 ${total}분입니다.`,
      'time',
      '1시간을 60분으로 바꾸어 계산',
    );
  }

  if (text.includes('달력') && variant === 1) {
    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    const dayName = weekdays[index % weekdays.length];
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${dayName}에서 7일 뒤의 요일은?`,
      dayName,
      [weekdays[(index + 1) % weekdays.length], weekdays[(index + 2) % weekdays.length], weekdays[(index + 6) % weekdays.length]],
      `요일은 7일마다 같은 순서로 반복됩니다. 그래서 ${dayName}에서 7일 뒤도 ${dayName}입니다.`,
      'time',
      '요일의 7일 반복 알기',
    );
  }

  if (text.includes('달력') && variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '달력에서 같은 요일이 다시 나오려면 보통 며칠 뒤일까요?',
      '7일',
      ['1일', '5일', '10일'],
      `한 주는 7일이므로 같은 요일은 7일마다 다시 나옵니다.`,
      'time',
      '한 주의 7일 관계 이해',
    );
  }

  if (text.includes('달력') && variant === 3) {
    const today = 5 + (index % 10);
    const eventDay = today + 4;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `오늘은 ${today}일이고 행사는 ${eventDay}일입니다. 행사는 며칠 뒤일까요?`,
      '4일 뒤',
      ['3일 뒤', '5일 뒤', `${eventDay}일 뒤`],
      `행사 날짜 ${eventDay}에서 오늘 날짜 ${today}를 빼면 ${eventDay - today}일 뒤입니다.`,
      'time',
      '달력에서 남은 날 수 구하기',
    );
  }

  if ((text.includes('달력') && variant === 0) || (!text.includes('몇 시 몇 분') && !text.includes('걸린') && variant === 2)) {
    const day = 3 + (index % 20);
    const add = 7 + (index % 3);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${day}일에서 ${add}일 뒤는 며칠일까요?`,
      `${day + add}일`,
      [`${day + 7}일`, `${day - 1}일`, `${add}일`],
      `달력에서 며칠 뒤를 찾을 때는 날짜에 지난 날 수를 더합니다. ${day}+${add}=${day + add}일입니다.`,
      'time',
      '달력에서 날짜 이동하기',
    );
  }

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `긴바늘이 ${minute / 5 === 0 ? 12 : minute / 5}를 가리키고 짧은바늘이 ${hour} 근처에 있습니다. 알맞은 시각은?`,
      `${hour}시 ${minute}분`,
      [`${hour + 1}시 ${minute}분`, `${hour}시 ${Math.max(0, minute - 5)}분`, `${hour}시 ${(minute + 10) % 60}분`],
      `짧은바늘은 시, 긴바늘은 분을 나타냅니다. 긴바늘 한 숫자 간격은 5분입니다.`,
      'time',
      '시계 바늘로 시각 읽기',
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    '1시간은 몇 분일까요?',
    '60분',
    ['10분', '30분', '100분'],
    `시간 단위의 기본 관계는 1시간=60분입니다.`,
    'time',
    '시간 단위 관계 이해',
  );
};

// ── 5단원 표와 그래프 (동아출판 2-2 교사용 지도서 268~291쪽 기준) ──────────────
// 차시별 학습 목표와 주요 활동에 맞춘 문항입니다.
//  2차시 자료를 분류하여 표로 나타내기: 분류 -> 세기 -> 표, 합계는 항목별 수의 합
//  3차시 자료를 조사하여 표로 나타내기: 조사 방법 고르기, 조사 결과를 표로
//  4차시 자료를 분류하여 그래프로 나타내기: 아래에서부터 한 칸에 하나씩 ◯
//  5차시 표와 그래프를 보고 알 수 있는 내용 찾기: 최다/최소/차이/합계/편리한 점
//  6차시 표와 그래프로 나타내기: 조사 -> 표 -> 그래프 순서와 해석

type SurveySet = {
  subject: string;
  categoryLabel: string;
  items: Array<{ name: string; count: number }>;
};

const surveySets: SurveySet[] = [
  {
    subject: '2학년 때 즐거웠던 활동',
    categoryLabel: '활동',
    items: [
      { name: '현장체험학습', count: 7 },
      { name: '안전 체험', count: 3 },
      { name: '놀이 한마당', count: 5 },
    ],
  },
  {
    subject: '태어난 계절',
    categoryLabel: '계절',
    items: [
      { name: '봄', count: 7 },
      { name: '여름', count: 4 },
      { name: '가을', count: 6 },
    ],
  },
  {
    subject: '좋아하는 동물',
    categoryLabel: '동물',
    items: [
      { name: '개', count: 6 },
      { name: '고양이', count: 5 },
      { name: '토끼', count: 3 },
    ],
  },
  {
    subject: '좋아하는 전통 놀이',
    categoryLabel: '전통 놀이',
    items: [
      { name: '공기놀이', count: 9 },
      { name: '투호 놀이', count: 8 },
      { name: '제기차기', count: 2 },
    ],
  },
  {
    subject: '원하는 교실 놀이',
    categoryLabel: '교실 놀이',
    items: [
      { name: '보드게임', count: 6 },
      { name: '공기놀이', count: 5 },
      { name: '땅따먹기', count: 4 },
    ],
  },
];

// 같은 차시 안에서 20문항이 서로 다른 수를 갖도록 지문마다 조금씩 바꿉니다.
const surveyFor = (index: number): SurveySet => {
  const base = surveySets[index % surveySets.length];
  const shift = Math.floor(index / surveySets.length);
  return {
    ...base,
    items: base.items.map((item, itemIndex) => ({
      ...item,
      count: Math.max(1, item.count + ((shift + itemIndex) % 3) - 1),
    })),
  };
};

const totalOf = (items: Array<{ count: number }>) => items.reduce((sum, item) => sum + item.count, 0);

const mostOf = (items: Array<{ name: string; count: number }>) =>
  items.reduce((best, item) => (item.count > best.count ? item : best));

const leastOf = (items: Array<{ name: string; count: number }>) =>
  items.reduce((best, item) => (item.count < best.count ? item : best));

const tableVisualFor = (
  columns: Array<{ name: string; value: number | null }>,
  label: string,
  options: { categoryLabel?: string; valueLabel?: string; totalLabel?: string; total?: number | null } = {},
): QuestionVisual => ({
  kind: 'table',
  label,
  categoryLabel: options.categoryLabel ?? '항목',
  valueLabel: options.valueLabel ?? '학생 수(명)',
  columns,
  ...(options.totalLabel ? { totalLabel: options.totalLabel } : {}),
  ...(options.total !== undefined ? { total: options.total } : {}),
});

const surveyTable = (survey: SurveySet, options: { blankIndex?: number; showTotal?: boolean; blankTotal?: boolean } = {}) => {
  const columns = survey.items.map((item, itemIndex) => ({
    name: item.name,
    value: options.blankIndex === itemIndex ? null : item.count,
  }));
  return tableVisualFor(columns, `${survey.subject}별 학생 수`, {
    categoryLabel: survey.categoryLabel,
    valueLabel: '학생 수(명)',
    ...(options.showTotal
      ? { totalLabel: '합계', total: options.blankTotal ? null : totalOf(survey.items) }
      : {}),
  });
};

const surveyGraph = (survey: SurveySet) =>
  pictographVisualFor(
    survey.items.map((item) => ({ label: item.name, count: item.count })),
    1,
    `${survey.subject}별 학생 수 그래프`,
  );

// 2차시: 자료를 분류하여 표로 나타내기
const classifyToTableQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const survey = surveyFor(index);
  const total = totalOf(survey.items);
  const target = survey.items[index % survey.items.length];
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      `${josa(survey.subject, '을', '를')} 조사한 자료를 분류했더니 ${survey.items.map((item) => `${item.name} ${item.count}명`).join(', ')}이었습니다. 표의 ${target.name} 칸에 알맞은 수는?`,
      target.count,
      [total, target.count + 1, Math.max(1, target.count - 1)],
      `분류한 ${target.name}의 학생 수를 세어 표의 같은 칸에 그대로 씁니다. ${josa(target.name, '은', '는')} ${target.count}명입니다.`,
      'data',
      '분류한 수를 표에 옮겨 쓰기',
      surveyTable(survey, { blankIndex: index % survey.items.length }),
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      `표에서 ${survey.items.map((item) => `${item.name} ${item.count}명`).join(', ')}일 때 합계는 몇 명일까요?`,
      `${total}명`,
      [`${total + 1}명`, `${Math.max(1, total - 2)}명`, `${mostOf(survey.items).count}명`],
      `합계는 항목별 학생 수를 모두 더한 것입니다. ${survey.items.map((item) => item.count).join('+')}=${total}명입니다.`,
      'data',
      '표의 합계 구하기',
      surveyTable(survey, { showTotal: true, blankTotal: true }),
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      `${josa(survey.subject, '을', '를')} 표로 나타낼 때 분류 기준으로 알맞은 것은?`,
      survey.categoryLabel,
      ['이름의 첫 글자', '앉은 자리', '키의 순서'],
      `표로 나타내려면 조사한 내용에 맞는 기준이 필요합니다. ${josa(survey.subject, '은', '는')} ${josa(survey.categoryLabel, '을', '를')} 기준으로 분류합니다.`,
      'data',
      '분류 기준 정하기',
      surveyTable(survey),
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      '자료를 분류하여 셀 때 바르게 세는 방법은?',
      '센 것에 표시하며 빠뜨리거나 두 번 세지 않는다',
      ['눈으로만 보고 어림한다', '많아 보이는 것부터 센다', '이름이 긴 것만 센다'],
      `분류하여 셀 때는 센 자료에 표시를 하면서 세어야 빠뜨리거나 두 번 세지 않습니다.`,
      'data',
      '빠짐과 겹침 없이 세기',
      surveyTable(survey),
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson, difficulty, index,
      '자료를 표로 나타내면 편리한 점은?',
      '항목별 학생 수를 한눈에 알기 쉽다',
      ['학생의 이름을 알 수 있다', '자리를 알 수 있다', '조사한 날짜를 알 수 있다'],
      `표는 항목별 수를 한눈에 알아보기 쉽습니다. 누가 골랐는지는 표만 보고 알 수 없습니다.`,
      'data',
      '표의 편리한 점 알기',
      surveyTable(survey, { showTotal: true }),
    );
  }

  const most = mostOf(survey.items);
  return makeQuestion(
    lesson, difficulty, index,
    `표에서 ${survey.items.map((item) => `${item.name} ${item.count}명`).join(', ')}일 때 가장 많은 항목은?`,
    most.name,
    survey.items.filter((item) => item.name !== most.name).map((item) => item.name).concat('모두 같음'),
    `표의 학생 수를 비교하면 ${most.count}명인 ${josa(most.name, '이', '가')} 가장 많습니다.`,
    'data',
    '표에서 가장 많은 항목 찾기',
    surveyTable(survey),
  );
};

// 3차시: 자료를 조사하여 표로 나타내기
const surveyToTableQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const survey = surveyFor(index);
  const total = totalOf(survey.items);
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      `우리 반 친구들의 ${josa(survey.subject, '을', '를')} 조사하는 방법으로 알맞은 것은?`,
      '손을 들어 세어 본다',
      ['내 생각대로 정한다', '선생님께만 여쭤본다', '책에서 찾아본다'],
      `조사는 친구들에게 직접 물어봐야 합니다. 손을 들어 세거나, 한 사람씩 말하거나, 붙임쪽지에 적는 방법이 있습니다.`,
      'data',
      '조사하는 방법 정하기',
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      '자료를 조사할 때 한 친구가 두 번 대답하면 어떻게 될까요?',
      '실제보다 수가 많아진다',
      ['수가 그대로이다', '실제보다 수가 적어진다', '합계만 작아진다'],
      `한 사람은 한 번만 대답해야 합니다. 두 번 세면 실제보다 수가 많아져 표가 정확하지 않습니다.`,
      'data',
      '겹치지 않게 조사하기',
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      `${josa(survey.subject, '을', '를')} 조사해 ${survey.items.map((item) => `${item.name} ${item.count}명`).join(', ')}이 나왔습니다. 조사한 학생은 모두 몇 명일까요?`,
      `${total}명`,
      [`${total + 2}명`, `${Math.max(1, total - 1)}명`, `${mostOf(survey.items).count}명`],
      `조사한 학생 수는 항목별 수를 모두 더한 합계입니다. ${survey.items.map((item) => item.count).join('+')}=${total}명입니다.`,
      'data',
      '조사 결과의 합계 구하기',
      surveyTable(survey, { showTotal: true, blankTotal: true }),
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      '조사한 자료를 표로 나타낼 때 표에 꼭 써야 하는 것은?',
      '무엇을 조사했는지 알려 주는 제목',
      ['조사한 사람의 나이', '교실 자리 번호', '조사한 날의 날씨'],
      `표에는 제목을 씁니다. 제목을 보면 무엇을 조사한 표인지 알 수 있습니다.`,
      'data',
      '표의 제목 쓰기',
      surveyTable(survey, { showTotal: true }),
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson, difficulty, index,
      '조사를 시작하기 전에 가장 먼저 정할 것은?',
      '무엇을 조사할지 정한다',
      ['표의 색깔을 정한다', '합계를 먼저 쓴다', '그래프를 먼저 그린다'],
      `조사는 무엇을 조사할지 정하는 것부터 시작합니다. 그다음에 누구에게 어떻게 물어볼지 정합니다.`,
      'data',
      '조사 계획 세우기',
    );
  }

  const target = survey.items[(index + 1) % survey.items.length];
  return makeQuestion(
    lesson, difficulty, index,
    `${survey.subject} 조사에서 ${josa(target.name, '을', '를')} 고른 친구가 ${target.count}명입니다. 표의 ${target.name} 칸에 쓸 수는?`,
    target.count,
    [total, target.count + 2, Math.max(1, target.count - 1)],
    `조사에서 센 수를 표의 같은 칸에 그대로 씁니다. ${josa(target.name, '은', '는')} ${target.count}명입니다.`,
    'data',
    '조사 결과를 표에 옮기기',
    surveyTable(survey, { blankIndex: (index + 1) % survey.items.length }),
  );
};

// 4차시: 자료를 분류하여 그래프로 나타내기
const classifyToGraphQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const survey = surveyFor(index);
  const target = survey.items[index % survey.items.length];
  const most = mostOf(survey.items);
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      `표에서 ${josa(target.name, '이', '가')} ${target.count}명입니다. 그래프에 ◯를 몇 개 그려야 할까요?`,
      `${target.count}개`,
      [`${target.count + 1}개`, `${Math.max(1, target.count - 1)}개`, '1개'],
      `그래프는 학생 수만큼 ◯를 그립니다. ${target.count}명이므로 ◯를 ${target.count}개 그립니다.`,
      'data',
      '표의 수만큼 그래프에 나타내기',
      surveyTable(survey),
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      '그래프에 ◯를 그릴 때 어디부터 그려야 할까요?',
      '맨 아래 칸부터 위로 하나씩',
      ['맨 위 칸부터 아래로', '가운데부터 양쪽으로', '아무 칸에나 자유롭게'],
      `그래프는 맨 아래 칸부터 위로 빠짐없이 한 칸에 하나씩 그립니다.`,
      'data',
      '그래프 그리는 방향 알기',
      surveyGraph(survey),
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      '그래프에서 한 칸에는 ◯를 몇 개 그릴까요?',
      '1개',
      ['2개', '3개', '자리에 맞게 여러 개'],
      `한 칸에는 ◯를 하나만 그립니다. 그래야 칸 수를 세어 학생 수를 알 수 있습니다.`,
      'data',
      '한 칸에 하나씩 나타내기',
      surveyGraph(survey),
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      `가장 많은 항목이 ${most.count}명일 때 그래프의 칸은 적어도 몇 칸 필요할까요?`,
      `${most.count}칸`,
      [`${Math.max(1, most.count - 1)}칸`, '1칸', `${most.count + 2}칸`],
      `가장 많은 수만큼 칸이 있어야 모두 나타낼 수 있습니다. 가장 많은 것이 ${most.count}명이므로 ${most.count}칸이 필요합니다.`,
      'data',
      '그래프에 필요한 칸 수 구하기',
      surveyGraph(survey),
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson, difficulty, index,
      '그래프를 그릴 때 바르지 않은 것은?',
      '◯와 ×를 섞어서 그린다',
      ['◯를 한 칸에 하나씩 그린다', '아래 칸부터 채워 그린다', '그래프에 제목을 쓴다'],
      `그래프는 ◯, ×, / 중 한 가지만 골라 나타냅니다. 여러 기호를 섞어 쓰면 헷갈립니다.`,
      'data',
      '그래프 그리는 약속 알기',
      surveyGraph(survey),
    );
  }

  return makeQuestion(
    lesson, difficulty, index,
    '자료를 그래프로 나타내면 편리한 점은?',
    '많고 적음을 한눈에 비교하기 쉽다',
    ['조사한 사람의 이름을 알 수 있다', '조사한 날짜를 알 수 있다', '합계를 쓰지 않아도 된다'],
    `그래프는 ◯의 높이로 많고 적음을 한눈에 비교할 수 있습니다.`,
    'data',
    '그래프의 편리한 점 알기',
    surveyGraph(survey),
  );
};

// 5차시: 표와 그래프를 보고 알 수 있는 내용 찾기
const readTableGraphQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const survey = surveyFor(index);
  const total = totalOf(survey.items);
  const most = mostOf(survey.items);
  const least = leastOf(survey.items);
  const gap = most.count - least.count;
  const variant = variantForDifficulty(difficulty, index, 6, 3);
  const listed = survey.items.map((item) => `${item.name} ${item.count}명`).join(', ');

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      `${survey.subject}별 학생 수가 ${listed}입니다. 가장 많은 학생이 고른 것은?`,
      most.name,
      survey.items.filter((item) => item.name !== most.name).map((item) => item.name).concat('모두 같음'),
      `학생 수를 비교하면 ${most.count}명인 ${josa(most.name, '이', '가')} 가장 많습니다.`,
      'data',
      '가장 많은 항목 찾기',
      surveyGraph(survey),
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      `${survey.subject}별 학생 수가 ${listed}입니다. 가장 적은 학생이 고른 것은?`,
      least.name,
      survey.items.filter((item) => item.name !== least.name).map((item) => item.name).concat('모두 같음'),
      `학생 수를 비교하면 ${least.count}명인 ${josa(least.name, '이', '가')} 가장 적습니다.`,
      'data',
      '가장 적은 항목 찾기',
      surveyGraph(survey),
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      `${survey.subject}별 학생 수가 ${listed}입니다. ${josa(most.name, '은', '는')} ${least.name}보다 몇 명 더 많을까요?`,
      `${gap}명`,
      [`${most.count}명`, `${least.count}명`, `${gap + 1}명`],
      `두 항목의 차를 구합니다. ${most.count}-${least.count}=${gap}명입니다.`,
      'data',
      '두 항목의 차 구하기',
      surveyTable(survey),
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      `${survey.subject}별 학생 수가 ${listed}입니다. 조사한 학생은 모두 몇 명일까요?`,
      `${total}명`,
      [`${total + 1}명`, `${most.count}명`, `${Math.max(1, total - 2)}명`],
      `합계는 항목별 수를 모두 더합니다. ${survey.items.map((item) => item.count).join('+')}=${total}명입니다.`,
      'data',
      '자료의 합계 읽기',
      surveyTable(survey, { showTotal: true, blankTotal: true }),
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson, difficulty, index,
      '항목별 학생 수를 정확한 수로 알아보기에 더 좋은 것은?',
      '표',
      ['그래프', '조사한 자료 그대로', '제목만 보기'],
      `표는 항목별 수가 수로 적혀 있어 정확한 수를 알기 좋습니다. 그래프는 많고 적음을 한눈에 비교하기 좋습니다.`,
      'data',
      '표와 그래프의 좋은 점 비교',
      surveyTable(survey, { showTotal: true }),
    );
  }

  const threshold = least.count;
  const above = survey.items.filter((item) => item.count > threshold);
  return makeQuestion(
    lesson, difficulty, index,
    `${survey.subject}별 학생 수가 ${listed}입니다. ${threshold}명보다 많은 항목은 모두 몇 개일까요?`,
    `${above.length}개`,
    [`${above.length + 1}개`, `${survey.items.length}개`, `${Math.max(0, above.length - 1)}개`],
    `${threshold}명보다 많다는 것은 ${threshold}명은 넣지 않는다는 뜻입니다. ${above.map((item) => item.name).join(', ')}으로 ${above.length}개입니다.`,
    'data',
    '기준보다 많은 항목 찾기',
    surveyGraph(survey),
  );
};

// 6차시: 조사한 자료를 표와 그래프로 나타내기
const tableAndGraphQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const survey = surveyFor(index);
  const total = totalOf(survey.items);
  const most = mostOf(survey.items);
  const target = survey.items[index % survey.items.length];
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      '조사한 자료를 정리하는 차례로 알맞은 것은?',
      '조사하기 → 표로 나타내기 → 그래프로 나타내기',
      ['그래프로 나타내기 → 조사하기 → 표로 나타내기', '표로 나타내기 → 조사하기 → 그래프로 나타내기', '그래프로 나타내기 → 표로 나타내기 → 조사하기'],
      `먼저 조사하고, 조사한 것을 표로 정리한 다음, 표를 보고 그래프로 나타냅니다.`,
      'data',
      '자료 정리하는 차례 알기',
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      `표에서 ${josa(target.name, '이', '가')} ${target.count}명입니다. 그래프의 ${target.name} 칸에 ◯를 몇 개 그릴까요?`,
      `${target.count}개`,
      [`${target.count + 1}개`, `${Math.max(1, target.count - 1)}개`, `${total}개`],
      `표의 수만큼 ◯를 그립니다. ${josa(target.name, '은', '는')} ${target.count}명이므로 ◯를 ${target.count}개 그립니다.`,
      'data',
      '표를 보고 그래프 완성하기',
      surveyTable(survey),
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      `그래프에서 ${target.name} 칸에 ◯가 ${target.count}개 있습니다. 표의 ${target.name} 칸에 쓸 수는?`,
      target.count,
      [target.count + 1, Math.max(1, target.count - 1), total],
      `◯ 한 개는 학생 1명입니다. ◯가 ${target.count}개이므로 표에는 ${target.count}을 씁니다.`,
      'data',
      '그래프를 보고 표 완성하기',
      surveyGraph(survey),
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      '같은 자료로 만든 표와 그래프에서 합계는 어떨까요?',
      '표와 그래프의 합계는 서로 같다',
      ['표가 더 크다', '그래프가 더 크다', '서로 다를 때가 많다'],
      `표와 그래프는 같은 자료를 다르게 나타낸 것이므로 합계는 서로 같습니다.`,
      'data',
      '표와 그래프의 관계 알기',
      surveyTable(survey, { showTotal: true }),
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson, difficulty, index,
      `${josa(survey.subject, '을', '를')} 조사한 결과를 보고 반 친구들에게 알릴 내용으로 알맞은 것은?`,
      `가장 많은 학생이 고른 것은 ${most.name}입니다`,
      ['조사는 하지 않아도 됩니다', '내가 좋아하는 것으로 정하면 됩니다', '수는 말하지 않는 것이 좋습니다'],
      `조사 결과를 알릴 때는 표와 그래프에서 알 수 있는 사실을 말합니다. 가장 많은 것은 ${most.name}입니다.`,
      'data',
      '조사 결과로 의견 말하기',
      surveyGraph(survey),
    );
  }

  return makeQuestion(
    lesson, difficulty, index,
    `조사한 자료를 표로 정리했더니 ${survey.items.map((item) => `${item.name} ${item.count}명`).join(', ')}이었습니다. 합계는?`,
    `${total}명`,
    [`${total + 1}명`, `${most.count}명`, `${Math.max(1, total - 3)}명`],
    `합계는 항목별 수를 모두 더합니다. ${survey.items.map((item) => item.count).join('+')}=${total}명입니다.`,
    'data',
    '표의 합계로 전체 알기',
    surveyTable(survey, { showTotal: true, blankTotal: true }),
  );
};

const tableGraphLessonQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '표와 그래프') return null;

  const title = lesson.title;
  if (title.includes('분류하여 표로')) return classifyToTableQuestion(lesson, difficulty, index);
  if (title.includes('조사하여 표로')) return surveyToTableQuestion(lesson, difficulty, index);
  if (title.includes('그래프로 나타내 볼까요') && title.includes('분류하여')) {
    return classifyToGraphQuestion(lesson, difficulty, index);
  }
  if (title.includes('무엇을 알 수 있')) return readTableGraphQuestion(lesson, difficulty, index);
  if (title.includes('표와 그래프로 나타내')) return tableAndGraphQuestion(lesson, difficulty, index);
  return null;
};

const dataQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const lessonSpecific = tableGraphLessonQuestion(lesson, difficulty, index);
  if (lessonSpecific) return lessonSpecific;

  return legacyDataQuestion(lesson, difficulty, index);
};

const legacyDataQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const dataSets = [
    { soccer: 7, jump: 5, tag: 3 },
    { soccer: 4, jump: 8, tag: 5 },
    { soccer: 5, jump: 4, tag: 7 },
    { soccer: 9, jump: 6, tag: 2 },
  ];
  const { soccer, jump, tag } = dataSets[index % dataSets.length];
  const entries = [
    { name: '축구', count: soccer },
    { name: '줄넘기', count: jump },
    { name: '술래잡기', count: tag },
  ];
  const variant = variantForDifficulty(difficulty, index, 5, 2);

  if (variant === 0) {
    const most = entries.reduce((best, item) => (item.count > best.count ? item : best));
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `좋아하는 놀이 조사 결과가 축구 ${soccer}명, 줄넘기 ${jump}명, 술래잡기 ${tag}명입니다. 가장 많은 놀이는?`,
      most.name,
      entries.filter((item) => item.name !== most.name).map((item) => item.name).concat('모두 같음'),
      `${entries.map((item) => `${item.name} ${item.count}명`).join(', ')} 중 가장 큰 수는 ${most.count}이므로 ${most.name}가 가장 많습니다.`,
      'data',
      '표에서 가장 많은 항목 찾기',
    );
  }

  if (variant === 1) {
    const [first, second] = [entries[0], entries[2]].sort((a, b) => b.count - a.count);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${first.name} ${first.count}명, ${second.name} ${second.count}명입니다. ${first.name}는 ${second.name}보다 몇 명 더 많을까요?`,
      first.count - second.count,
      [first.count + second.count, jump, first.count - second.count + 1],
      `두 항목의 차를 구하면 됩니다. ${first.count}-${second.count}=${first.count - second.count}명입니다.`,
      'data',
      '자료의 차이 해석',
    );
  }

  if (variant === 2) {
    const total = soccer + jump + tag;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `축구 ${soccer}명, 줄넘기 ${jump}명, 술래잡기 ${tag}명을 조사했습니다. 조사한 학생은 모두 몇 명일까요?`,
      total,
      [soccer + jump, jump + tag, total + 1],
      `전체 수는 항목별 수를 모두 더합니다. ${soccer}+${jump}+${tag}=${total}명입니다.`,
      'data',
      '자료의 전체 수 구하기',
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '그래프에서 한 칸이 학생 1명을 나타낼 때 칸 6개는 몇 명을 뜻할까요?',
      '6명',
      ['1명', '5명', '12명'],
      `한 칸이 1명을 나타내므로 6칸은 6명을 뜻합니다.`,
      'data',
      '그래프의 단위 읽기',
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    '조사 결과를 발표할 때 가장 알맞은 말은?',
    '가장 많은 항목과 차이를 함께 말한다',
    ['표를 보지 않고 말한다', '색깔만 말한다', '적은 항목은 숨긴다'],
    `자료를 해석할 때는 많고 적음, 전체 수, 차이처럼 표와 그래프에서 알 수 있는 내용을 말합니다.`,
    'data',
    '자료 해석 결과 말하기',
  );
};

const patternQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const variant = variantForDifficulty(difficulty, index, 5, 2);
  const start = 2 + (index % 8);
  const step = difficulty === '하' ? 2 + (index % 3) : difficulty === '중' ? 5 + (index % 5) : 10 + (index % 9);

  if (text.includes('무늬') && variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '○, △, □, ○, △, □, 다음에 올 모양은?',
      '○',
      ['△', '□', '☆'],
      `반복되는 묶음은 ○, △, □입니다. 한 묶음이 끝났으므로 다음은 다시 ○입니다.`,
      'pattern',
      '반복 단위 찾기',
    );
  }

  if (text.includes('무늬') && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '○, △, ☆, ○, 빈칸, ☆ 에서 빈칸에 알맞은 모양은?',
      '△',
      ['○', '☆', '□'],
      `반복되는 묶음은 ○, △, ☆입니다. 두 번째 묶음도 ○ 다음에는 △가 와야 합니다.`,
      'pattern',
      '반복 무늬의 빈칸 찾기',
    );
  }

  if (text.includes('무늬') && variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '○, △, □, ○, △, □ 에서 반복되는 한 묶음은?',
      '○, △, □',
      ['○, ○', '△, □, ○', '□, □'],
      `처음부터 같은 순서로 되풀이되는 부분을 찾으면 ○, △, □가 한 묶음입니다.`,
      'pattern',
      '반복되는 묶음 찾기',
    );
  }

  if (text.includes('계산식') && variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '20-2=18, 20-4=16, 20-6=□ 입니다. □에 알맞은 수는?',
      14,
      [12, 16, 18],
      `빼는 수가 2씩 커지면 결과는 2씩 작아집니다. 16 다음은 14입니다.`,
      'pattern',
      '식 결과의 변화 규칙 채우기',
    );
  }

  if (text.includes('계산식') && variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '12+3=15, 12+6=18, 12+9=21에서 더하는 수는 얼마씩 커질까요?',
      '3씩',
      ['1씩', '6씩', '12씩'],
      `더하는 수 3, 6, 9를 보면 3씩 커집니다.`,
      'pattern',
      '식에서 변하는 수 찾기',
    );
  }

  if ((text.includes('계산식') && variant === 0) || (!text.includes('계산식') && variant === 1)) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `12+3=15, 12+6=18, 12+9=21입니다. 다음 식으로 알맞은 것은?`,
      '12+12=24',
      ['12+10=21', '12+6=24', '12+1=24'],
      `더하는 수가 3씩 커지고 결과도 3씩 커집니다. 그래서 다음은 12+12=24입니다.`,
      'pattern',
      '식 배열의 변화 규칙 찾기',
    );
  }

  if ((text.includes('곱셈구구') && variant <= 1) || (!text.includes('계산식') && variant === 2)) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '4단 곱셈구구에서 4, 8, 12, 16 다음 수는?',
      20,
      [18, 24, 12],
      `4단은 4씩 커지는 규칙입니다. 16 다음은 16+4=20입니다.`,
      'pattern',
      '곱셈구구 표의 규칙 찾기',
    );
  }

  if ((text.includes('만들') && variant <= 1) || variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '내가 만든 규칙을 친구가 찾게 하려면 무엇을 알려 주어야 할까요?',
      '무엇이 어떻게 반복되거나 변하는지',
      ['답만 말하기', '색깔을 숨기기', '아무 숫자나 말하기'],
      `규칙을 설명할 때는 반복 단위나 변화량을 말해야 친구가 다음 것을 찾을 수 있습니다.`,
      'pattern',
      '규칙 설명하기',
    );
  }

  const answer = start + step * 4;
  return makeQuestion(
    lesson,
    difficulty,
    index,
    `${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, □ 에서 □는?`,
    answer,
    [answer - step, answer + step, answer + 1],
    `${step}씩 커지는 규칙입니다. ${start + step * 3}+${step}=${answer}입니다.`,
    'pattern',
    '수 배열의 변화량 찾기',
  );
};

const numberFromAnswer = (answer: string | number) => Number(String(answer).match(/-?\d+/)?.[0] ?? Number.NaN);

const placeValueVisualFor = (value: number, label = '자리값표'): QuestionVisual => {
  const safe = Math.max(0, Math.floor(value));
  const thousands = Math.floor(safe / 1000);
  const hundreds = Math.floor((safe % 1000) / 100);
  const tens = Math.floor((safe % 100) / 10);
  const ones = safe % 10;
  const columns = [
    ...(thousands > 0 ? [{ label: '천', value: thousands, blocks: thousands }] : []),
    { label: '백', value: hundreds, blocks: hundreds },
    { label: '십', value: tens, blocks: tens },
    { label: '일', value: ones, blocks: ones },
  ];

  return { kind: 'place-value', label, columns };
};

const numberLineVisualFor = (values: number[], step = 10, label = '수의 길 그림'): QuestionVisual => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  return {
    kind: 'number-line',
    label,
    start,
    end: Math.max(end, start + step * 4),
    step,
    marks: values.map((value, index) => ({ value, active: index === values.length - 1 })),
  };
};

const barModelVisualFor = (bars: Array<{ label: string; value: number }>, label = '막대모델 자료'): QuestionVisual => ({
  kind: 'bar-model',
  label,
  bars,
});

const rulerVisualFor = (start: number, end: number, label = '자 눈금 자료'): QuestionVisual => ({
  kind: 'ruler',
  label,
  start: Math.max(0, start - 2),
  end: end + 2,
  highlightStart: start,
  highlightEnd: end,
});

const pictographVisualFor = (items: Array<{ label: string; count: number }>, unit = 1, label = '그림그래프 자료'): QuestionVisual => ({
  kind: 'pictograph',
  label,
  unit,
  items,
});

const arrayVisualFor = (rows: number, columns: number, label = '배열 자료', fadedRows?: number): QuestionVisual => ({
  kind: 'array',
  label,
  rows,
  columns,
  ...(fadedRows ? { fadedRows } : {}),
});

const clockVisualFor = (
  hour: number,
  minute: number,
  label = '시계 자료',
  endHour?: number,
  endMinute?: number,
  example = false,
): QuestionVisual => ({
  kind: 'clock',
  label,
  hour,
  minute,
  ...(endHour != null ? { endHour } : {}),
  ...(endMinute != null ? { endMinute } : {}),
  ...(example ? { example: true } : {}),
});

// 1일을 일요일에 두면 같은 세로줄이 곧 같은 요일이 되어 "7일마다 반복"이 눈에 보입니다.
const calendarVisualFor = (
  marks: Array<{ day: number; tone: 'start' | 'end' }> = [],
  label = '달력 자료',
): QuestionVisual => ({
  kind: 'calendar',
  label,
  startWeekday: 0,
  days: 30,
  marks,
});

const patternVisualFor = (items: string[], label = '무늬 규칙 자료', missingIndex?: number): QuestionVisual => ({
  kind: 'pattern',
  label,
  items,
  ...(missingIndex != null ? { missingIndex } : {}),
});

const richNumberQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const hard = difficulty === '상';
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const fourDigit = text.includes('네 자리') || text.includes('1000') || text.includes('몇천');
  const thousands = fourDigit ? 1 + (index % 8) : 0;
  const hundreds = fourDigit ? 1 + ((index + 2) % 8) : 2 + (n(lesson, index, 41) % 7);
  const tens = hard ? 6 + (index % 4) : difficulty === '중' ? 3 + (index % 5) : 1 + (index % 5);
  const ones = 2 + (index % 7);
  const normalized = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

  if (index % 3 === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${fourDigit ? `천 ${thousands}개, ` : ''}백 ${hundreds}개, 십 ${tens}개, 일 ${ones}개를 수로 나타내면?`,
      normalized,
      [normalized - tens * 10, normalized + 10, Math.max(0, normalized - 100)],
      `${fourDigit ? `천 ${thousands}개는 ${thousands * 1000}, ` : ''}백 ${hundreds}개는 ${hundreds * 100}, 십 ${tens}개는 ${tens * 10}, 일 ${ones}개는 ${ones}입니다. 모두 모으면 ${normalized}입니다.`,
      'placeValue',
      '자료 해석 · 자리값 묶음을 수로 나타내기',
      {
        kind: 'place-value',
        label: '자리값 묶음 자료',
        columns: [
          ...(fourDigit ? [{ label: '천', value: thousands, blocks: thousands }] : []),
          { label: '백', value: hundreds, blocks: hundreds },
          { label: '십', value: tens, blocks: Math.min(tens, 12) },
          { label: '일', value: ones, blocks: ones },
        ],
      },
    );
  }

  const start = hard ? 260 + index * 10 : 120 + index * 5;
  const step = difficulty === '하' ? 10 : difficulty === '중' ? 20 : 50;
  const target = start + step * 3;
  return makeQuestion(
    lesson,
    difficulty,
    index,
    `수의 길 그림에서 A는 ${start}, B는 ${start + step * 2}입니다. 같은 간격으로 한 번 더 가면 도착하는 수는?`,
    target,
    [start + step, start + step * 2, target + step],
    `A에서 B까지 두 칸 동안 ${step * 2}만큼 커졌으므로 한 칸은 ${step}입니다. 한 번 더 가면 ${target}입니다.`,
    'number',
    '자료 해석 · 수의 길 그림 간격 살피기',
    numberLineVisualFor([start, start + step * 2, target], step, '간격이 같은 수의 길 그림'),
  );
};

const richOperationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number, mode: 'addition' | 'subtraction'): Question => {
  const start = difficulty === '하' ? 36 + (index % 20) : difficulty === '중' ? 54 + (index % 18) : 62 + (index % 17);
  const rawAdded = difficulty === '하' ? 12 + (index % 12) : difficulty === '중' ? 18 + (index % 17) : 22 + (index % 18);
  const added = Math.max(10, Math.min(rawAdded, 99 - start));
  const used = difficulty === '하' ? 7 + (index % 8) : difficulty === '중' ? 14 + (index % 13) : 18 + (index % 17);
  const answer = mode === 'addition' ? start + added - used : start - used + added;
  const prompt =
    mode === 'addition'
      ? `자료를 보고 남은 수를 구하세요. 처음에 ${start}개가 있었고 ${added}개가 더 왔습니다. 그중 ${used}개를 사용했습니다. 지금은 몇 개일까요?`
      : `자료를 보고 남은 수를 구하세요. 처음에 ${start}개가 있었고 ${used}개를 사용한 뒤 ${added}개를 다시 채웠습니다. 지금은 몇 개일까요?`;

  return makeQuestion(
    lesson,
    difficulty,
    index,
    prompt,
    answer,
    [start + added, Math.max(0, start - used), answer + 10],
    `변한 순서대로 계산합니다. ${mode === 'addition' ? `${start}+${added}-${used}` : `${start}-${used}+${added}`}=${answer}입니다.`,
    mode === 'addition' ? 'addition' : 'subtraction',
    '조건 조합 · 변화 상황을 막대모델로 계산',
    barModelVisualFor(
      [
        { label: '처음', value: start },
        { label: mode === 'addition' ? '더 옴' : '사용', value: mode === 'addition' ? added : used },
        { label: mode === 'addition' ? '사용' : '채움', value: mode === 'addition' ? used : added },
        { label: '결과', value: answer },
      ],
      '변화가 있는 막대모델',
    ),
  );
};

const richMeasurementQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const start = 2 + (index % 5);
  const length = difficulty === '하' ? 8 + (index % 5) : difficulty === '중' ? 12 + (index % 6) : 17 + (index % 7);
  const end = start + length;
  const cut = difficulty === '상' ? 5 + (index % 4) : 2 + (index % 4);
  const answer = `${length - cut}cm`;

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `자에서 색 테이프가 ${start}cm 눈금부터 ${end}cm 눈금까지 놓여 있습니다. 이 테이프에서 ${cut}cm를 잘라 쓰면 남은 길이는?`,
    answer,
    [`${length}cm`, `${end - cut}cm`, `${Math.max(1, length - cut + 2)}cm`],
    `테이프의 전체 길이는 끝 눈금에서 시작 눈금을 뺀 ${end}-${start}=${length}cm입니다. ${cut}cm를 쓰면 ${length}-${cut}=${length - cut}cm가 남습니다.`,
    'measurement',
    '조건 조합 · 자 눈금과 남은 길이 계산',
    rulerVisualFor(start, end, '시작 눈금이 0이 아닌 자'),
  );
};

// 표와 그래프 단원에서는 차시 내용에 맞춘 자료 해석 문항을 냅니다.
const richTableGraphQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '표와 그래프') return null;

  const survey = surveyFor(index + 2);
  const total = totalOf(survey.items);
  const most = mostOf(survey.items);
  const least = leastOf(survey.items);
  const listed = survey.items.map((item) => `${item.name} ${item.count}명`).join(', ');
  const title = lesson.title;

  if (title.includes('분류하여 표로') || title.includes('조사하여 표로')) {
    const hidden = survey.items[index % survey.items.length];
    const rest = total - hidden.count;
    return makeQuestion(
      lesson, difficulty, index,
      `표의 합계는 ${total}명입니다. ${survey.items
        .filter((item) => item.name !== hidden.name)
        .map((item) => `${item.name} ${item.count}명`)
        .join(', ')}일 때 ${josa(hidden.name, '은', '는')} 몇 명일까요?`,
      `${hidden.count}명`,
      [`${total}명`, `${rest}명`, `${hidden.count + 1}명`],
      `합계에서 다른 항목의 수를 빼면 됩니다. ${total}-${rest}=${hidden.count}명입니다.`,
      'data',
      '자료 해석 · 합계에서 빠진 항목 수 구하기',
      surveyTable(survey, { blankIndex: index % survey.items.length, showTotal: true }),
    );
  }

  if (title.includes('그래프로 나타내 볼까요') && title.includes('분류하여')) {
    return makeQuestion(
      lesson, difficulty, index,
      `그래프에 ${survey.items.map((item) => `${item.name} ◯ ${item.count}개`).join(', ')}를 그렸습니다. ◯를 모두 몇 개 그렸을까요?`,
      `${total}개`,
      [`${most.count}개`, `${total + 1}개`, `${Math.max(1, total - 2)}개`],
      `◯ 한 개는 학생 1명입니다. 항목별 ◯를 모두 더하면 ${survey.items.map((item) => item.count).join('+')}=${total}개입니다.`,
      'data',
      '자료 해석 · 그래프의 ◯ 개수 모두 세기',
      surveyGraph(survey),
    );
  }

  if (title.includes('무엇을 알 수 있')) {
    const gap = most.count - least.count;
    return makeQuestion(
      lesson, difficulty, index,
      `${survey.subject}별 학생 수가 ${listed}입니다. 가장 많은 것과 가장 적은 것의 차는 몇 명일까요?`,
      `${gap}명`,
      [`${most.count}명`, `${least.count}명`, `${gap + 1}명`],
      `가장 많은 것은 ${most.name} ${most.count}명, 가장 적은 것은 ${least.name} ${least.count}명입니다. ${most.count}-${least.count}=${gap}명입니다.`,
      'data',
      '자료 해석 · 가장 많은 것과 적은 것의 차 구하기',
      surveyGraph(survey),
    );
  }

  if (title.includes('표와 그래프로 나타내')) {
    const hidden = survey.items[(index + 1) % survey.items.length];
    const rest = total - hidden.count;
    return makeQuestion(
      lesson, difficulty, index,
      `조사한 학생이 모두 ${total}명입니다. ${survey.items
        .filter((item) => item.name !== hidden.name)
        .map((item) => `${item.name} ${item.count}명`)
        .join(', ')}일 때 그래프의 ${hidden.name} 칸에 ◯를 몇 개 그릴까요?`,
      `${hidden.count}개`,
      [`${rest}개`, `${total}개`, `${hidden.count + 1}개`],
      `전체에서 다른 항목을 빼면 ${total}-${rest}=${hidden.count}명입니다. 그래서 ◯를 ${hidden.count}개 그립니다.`,
      'data',
      '자료 해석 · 합계를 이용해 그래프 완성하기',
      surveyTable(survey, { blankIndex: (index + 1) % survey.items.length, showTotal: true }),
    );
  }

  return null;
};

const richDataQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const lessonSpecific = richTableGraphQuestion(lesson, difficulty, index);
  if (lessonSpecific) return lessonSpecific;

  const unit = difficulty === '상' ? 2 : 1;
  const items = [
    { label: '축구', count: 5 + (index % 4) * unit },
    { label: '줄넘기', count: 7 + ((index + 1) % 4) * unit },
    { label: '책읽기', count: 4 + ((index + 2) % 4) * unit },
  ];
  const most = items.reduce((best, item) => (item.count > best.count ? item : best));
  const least = items.reduce((best, item) => (item.count < best.count ? item : best));
  const answer = most.count - least.count;

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `그림그래프를 보고 가장 많은 항목과 가장 적은 항목의 차를 구하세요. 한 칸은 ${unit}명을 나타냅니다.`,
    answer,
    [most.count, least.count, answer + unit],
    `그래프에서 가장 많은 것은 ${most.label} ${most.count}명, 가장 적은 것은 ${least.label} ${least.count}명입니다. 차는 ${most.count}-${least.count}=${answer}명입니다.`,
    lesson.tags.includes('classification') ? 'classification' : 'data',
    '자료 해석 · 그림그래프의 단위와 차이 읽기',
    pictographVisualFor(items, unit, '좋아하는 활동 그림그래프'),
  );
};

const richMultiplicationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const rows = difficulty === '하' ? 3 + (index % 2) : difficulty === '중' ? 4 + (index % 3) : 6 + (index % 4);
  const columns = difficulty === '하' ? 3 + (index % 3) : difficulty === '중' ? 5 + (index % 3) : 7 + (index % 3);
  const hardRemovedRows = 2 + ((index + Math.floor(index / 3)) % 3);
  const removedRows = difficulty === '상' ? Math.min(hardRemovedRows, rows - 2) : 1;
  const answer = (rows - removedRows) * columns;

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `배열 그림은 한 줄에 ${columns}개씩 ${rows}줄입니다. 아래쪽 ${removedRows}줄을 가리면 보이는 것은 몇 개일까요?`,
    answer,
    [rows * columns, removedRows * columns, answer + columns],
    `처음에는 ${columns}개씩 ${rows}줄입니다. ${removedRows}줄을 가리면 ${rows - removedRows}줄이 보이므로 ${columns}×${rows - removedRows}=${answer}개입니다.`,
    'multiplication',
    '조건 조합 · 배열에서 보이는 묶음만 계산',
    arrayVisualFor(rows, columns, '일정한 배열 그림', removedRows),
  );
};

const richTimeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const hour = 2 + (index % 7);
  const minute = difficulty === '하' ? 10 + (index % 3) * 10 : difficulty === '중' ? 25 + (index % 3) * 5 : 40 + (index % 3) * 5;
  const elapsed = difficulty === '하' ? 20 : difficulty === '중' ? 45 : 75;
  const totalMinute = hour * 60 + minute + elapsed;
  const endHour = Math.floor(totalMinute / 60);
  const endMinute = totalMinute % 60;

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `두 시계를 보고 시작 시각부터 끝 시각까지 걸린 시간을 구하세요.`,
    `${elapsed}분`,
    [`${endMinute}분`, `${elapsed - 15}분`, `${elapsed + 15}분`],
    `시작은 ${hour}시 ${minute}분, 끝은 ${endHour}시 ${endMinute}분입니다. 1시간을 넘으면 60분을 먼저 세고 남은 분을 더해 ${elapsed}분입니다.`,
    'time',
    '자료 해석 · 두 시계 사이의 시간 구하기',
    clockVisualFor(hour, minute, '시작과 끝 시각', endHour, endMinute),
  );
};

const richPatternQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const shapes = difficulty === '상' ? ['○', '△', '□', '☆'] : ['○', '△', '□'];
  const items = Array.from({ length: 9 }, (_, itemIndex) => shapes[itemIndex % shapes.length]);
  const missingIndex = difficulty === '하' ? 4 : difficulty === '중' ? 5 : 7;
  const answer = items[missingIndex];

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `무늬에서 ?에 들어갈 모양을 고르세요. 반복되는 한 묶음을 먼저 찾으세요.`,
    answer,
    shapes.filter((shape) => shape !== answer).slice(0, 3),
    `반복되는 한 묶음은 ${shapes.join(', ')}입니다. ?는 그 순서에서 ${answer}가 오는 자리입니다.`,
    'pattern',
    '자료 해석 · 반복 단위로 빈칸 찾기',
    patternVisualFor(items, '반복 무늬 자료', missingIndex),
  );
};

const legacyRichShapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  if (lesson.tags.includes('solid') || `${lesson.unitTitle} ${lesson.title}`.includes('쌓')) {
    const front = 3 + (index % 3);
    const top = 4 + (index % 3);
    const side = 2 + ((index + 1) % 3);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `앞에서 본 모양은 ${front}칸, 위에서 본 모양은 ${top}칸입니다. 같은 쌓기나무 모양을 정확히 만들기 위해 더 필요한 자료는?`,
      '옆에서 본 모양',
      ['쌓기나무의 색깔', '문제 번호', '원의 지름'],
      `앞과 위에서 본 모양만으로는 높이와 가려진 위치가 달라질 수 있습니다. 옆에서 본 모양까지 비교해야 정확히 만들 수 있습니다.`,
      'solid',
      '조건 조합 · 세 방향 자료로 입체 모양 판단',
      cubeViewsVisual(
        [
          { label: '앞', count: front },
          { label: '위', count: top },
          { label: '옆', count: side },
        ],
        '세 방향에서 본 쌓기나무 자료',
      ),
    );
  }

  const target = lesson.title.includes('○') ? '원' : lesson.title.includes('△') ? '삼각형' : lesson.title.includes('□') ? '사각형' : '칠교';
  const answer = target === '원' ? '곧은 변과 꼭짓점이 없다' : target === '삼각형' ? '변과 꼭짓점이 각각 3개이다' : target === '사각형' ? '변과 꼭짓점이 각각 4개이다' : '조각을 돌리거나 뒤집어 맞춘다';

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `보기의 도형을 보고 ${target}으로 판단할 때 꼭 확인해야 할 조건은?`,
    answer,
    ['색깔이 같은지', '크기가 가장 큰지', '위에 쌓을 수 있는지'],
    `도형은 색깔이나 크기가 아니라 차시 목표와 연결된 성질로 판단합니다. ${answer}가 핵심 조건입니다.`,
    'shape',
    '자료 해석 · 도형의 핵심 성질로 판단',
    planeVisualForTarget(target, index),
  );
};

type PlaneTarget = '원' | '삼각형' | '사각형';
type ShapeFocus = PlaneTarget | '칠교';

const planeShapeFacts: Record<PlaneTarget, {
  kind: PlaneShapeVisualItem['kind'];
  feature: string;
  shortFeature: string;
  vertices: number;
  sides: number;
  objects: string[];
  nearMisses: string[];
}> = {
  원: {
    kind: 'circle',
    feature: '굽은 선으로 둘러싸여 있고 변과 꼭짓점이 없습니다.',
    shortFeature: '굽은 선, 꼭짓점 0개',
    vertices: 0,
    sides: 0,
    objects: ['동전의 앞면', '둥근 접시의 가장자리', '시계의 둥근 테두리', '병뚜껑의 윗면'],
    nearMisses: ['네모 창문', '삼각 깃발', '책 표지', '칠판 모서리'],
  },
  삼각형: {
    kind: 'triangle',
    feature: '곧은 변 3개와 꼭짓점 3개가 있습니다.',
    shortFeature: '변 3개, 꼭짓점 3개',
    vertices: 3,
    sides: 3,
    objects: ['삼각 깃발', '샌드위치 반쪽', '교통 표지판의 윤곽', '세모 자 조각'],
    nearMisses: ['둥근 접시', '네모 창문', '책 표지', '동전의 앞면'],
  },
  사각형: {
    kind: 'square',
    feature: '곧은 변 4개와 꼭짓점 4개가 있습니다.',
    shortFeature: '변 4개, 꼭짓점 4개',
    vertices: 4,
    sides: 4,
    objects: ['교실 칠판의 바깥 윤곽', '책 표지', '네모 창문', '문패의 바깥 윤곽'],
    nearMisses: ['둥근 접시', '삼각 깃발', '동전의 앞면', '구슬'],
  },
};

const itemForShape = (target: PlaneTarget, active: boolean, label: string, seed: number): PlaneShapeVisualItem => {
  if (target === '사각형') {
    return {
      kind: seed % 2 === 0 ? 'square' : 'rectangle',
      active,
      label,
      rotate: seed % 3 === 0 ? 8 : 0,
    };
  }

  return {
    kind: planeShapeFacts[target].kind,
    active,
    label,
    rotate: target === '삼각형' ? ((seed % 3) - 1) * 10 : 0,
  };
};

const singleTargetBoard = (target: PlaneTarget, index: number): { visual: QuestionVisual; answerLabel: string; wrongLabels: string[] } => {
  const distractorsByTarget: Record<PlaneTarget, PlaneTarget[]> = {
    원: ['삼각형', '사각형', '삼각형'],
    삼각형: ['원', '사각형', '원'],
    사각형: ['원', '삼각형', '원'],
  };
  const activeSlot = index % 4;
  const labels = ['1', '2', '3', '4'];
  const distractors = rotate(distractorsByTarget[target], index);
  let distractorIndex = 0;
  const items = labels.map((label, slot) => {
    if (slot === activeSlot) return itemForShape(target, true, label, index + slot);
    const shape = distractors[distractorIndex % distractors.length];
    distractorIndex += 1;
    return itemForShape(shape, false, label, index + slot);
  });

  return {
    visual: planeShapesVisual(`${target} 찾기`, items),
    answerLabel: `${labels[activeSlot]}번`,
    wrongLabels: labels.filter((label) => label !== labels[activeSlot]).map((label) => `${label}번`),
  };
};

const twoTargetBoard = (target: PlaneTarget, index: number): { visual: QuestionVisual; answer: string; wrongs: string[] } => {
  const labels = ['1', '2', '3', '4'];
  const activeSlots = index % 2 === 0 ? [0, 2] : [1, 3];
  const distractorsByTarget: Record<PlaneTarget, PlaneTarget[]> = {
    원: ['삼각형', '사각형'],
    삼각형: ['원', '사각형'],
    사각형: ['원', '삼각형'],
  };
  let distractorIndex = 0;
  const items = labels.map((label, slot) => {
    if (activeSlots.includes(slot)) return itemForShape(target, true, label, index + slot);
    const shape = distractorsByTarget[target][distractorIndex % 2];
    distractorIndex += 1;
    return itemForShape(shape, false, label, index + slot);
  });
  const answerLabels = activeSlots.map((slot) => `${labels[slot]}번`).join('과 ');

  return {
    visual: planeShapesVisual(`${target}을 모두 찾기`, items),
    answer: answerLabels,
    wrongs: [
      `${labels[activeSlots[0]]}번만`,
      `${labels[(activeSlots[0] + 1) % 4]}번과 ${labels[(activeSlots[1] + 1) % 4]}번`,
      `${labels.filter((_, slot) => !activeSlots.includes(slot))[0]}번과 ${labels[activeSlots[1]]}번`,
    ],
  };
};

const shapeFocusForLesson = (lesson: Lesson, index: number): ShapeFocus => {
  if (lesson.unitNo === 2) {
    if (lesson.lessonNo === 2) return '원';
    if (lesson.lessonNo === 3) return '삼각형';
    if (lesson.lessonNo === 4) return '사각형';
    if (lesson.lessonNo === 5) return '칠교';
    if (lesson.lessonNo === 9) return (['원', '삼각형', '사각형', '칠교'] as ShapeFocus[])[index % 4];
  }

  const text = `${lesson.unitTitle} ${lesson.title}`;
  if (text.includes('칠교')) return '칠교';
  if (text.includes('삼각형')) return '삼각형';
  if (text.includes('사각형')) return '사각형';
  if (text.includes('원')) return '원';
  return (['원', '삼각형', '사각형', '칠교'] as ShapeFocus[])[index % 4];
};

const shapeVisualForTargets = (label: string, targets: PlaneTarget[], index: number): QuestionVisual => {
  const base = rotate<PlaneTarget>(['원', '삼각형', '사각형'], index);
  const items = base.map((target, targetIndex) =>
    itemForShape(target, targets.includes(target), `${targetIndex + 1}`, index + targetIndex),
  );
  return planeShapesVisual(label, items);
};

const countWrongs = (answer: number, unit = '개') =>
  [answer + 1, Math.max(0, answer - 1), answer + 2, Math.max(0, answer - 2), answer + 3]
    .filter((value, position, values) => value !== answer && values.indexOf(value) === position)
    .slice(0, 3)
    .map((value) => `${value}${unit}`);

const tangramQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const variant = variantForDifficulty(difficulty, index, 14, 5);
  const visual: QuestionVisual = { kind: 'tangram', label: '번호가 붙은 칠교 7조각' };

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교판 7조각 중 삼각형 조각은 모두 몇 개일까요?',
      '5개',
      ['2개', '4개', '7개'],
      '칠교판은 큰 삼각형 2개, 중간 삼각형 1개, 작은 삼각형 2개가 있어 삼각형 조각이 모두 5개입니다.',
      'shape',
      '칠교 조각을 도형의 성질로 분류',
      visual,
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교판에서 삼각형이 아닌 조각은 모두 몇 개일까요?',
      '2개',
      ['1개', '5개', '7개'],
      '칠교판 7조각 중 삼각형이 5개이므로 삼각형이 아닌 조각은 7-5=2개입니다.',
      'shape',
      '칠교 조각 개수와 분류 연결',
      visual,
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '작은 삼각형 2개를 긴 변끼리 붙이면 바깥 윤곽으로 볼 수 있는 도형은 무엇일까요?',
      '사각형',
      ['원', '쌓기나무', '꼭짓점이 없는 모양'],
      '삼각형 2개를 변에 맞추어 붙이면 바깥쪽에 곧은 변 4개가 생겨 사각형으로 볼 수 있습니다.',
      'shape',
      '칠교 조각 합치기와 바깥 윤곽 판단',
      visual,
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각으로 보기와 같은 모양을 만들 때 먼저 맞추어 보아야 할 것은 무엇일까요?',
      '조각의 방향과 맞닿는 변',
      ['조각의 색깔만', '문제 번호', '가장 작은 숫자'],
      '칠교는 조각을 돌리거나 뒤집을 수 있으므로 어느 변이 서로 맞닿는지와 방향을 먼저 살펴야 합니다.',
      'shape',
      '칠교 조각의 회전과 뒤집기 활용',
      visual,
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각 1번과 2번은 크기가 같은 큰 삼각형입니다. 두 조각을 겹치지 않게 붙일 때 변하지 않는 것은 무엇일까요?',
      '각 조각의 변과 꼭짓점',
      ['조각의 이름표 번호', '조각의 색깔', '화면에서 보이는 위치'],
      '조각을 돌리거나 옮겨도 삼각형 조각의 변 3개와 꼭짓점 3개라는 성질은 변하지 않습니다.',
      'shape',
      '도형의 방향 변화와 성질 보존',
      visual,
    );
  }

  if (variant === 5) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교판의 모든 조각을 한 번씩 사용해 새로운 모양을 만들었습니다. 확인해야 할 조건으로 알맞은 것은 무엇일까요?',
      '7조각을 겹치지 않고 모두 썼는지',
      ['삼각형 조각만 썼는지', '조각을 모두 같은 방향으로 놓았는지', '번호 순서대로 놓았는지'],
      '칠교 모양 만들기에서는 7조각을 빠짐없이, 겹치지 않게 사용하는지가 중요합니다.',
      'shape',
      '조건 조합 · 칠교 구성 조건 확인',
      visual,
    );
  }

  if (variant === 6) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각 중 삼각형 3개와 삼각형이 아닌 조각 1개를 골랐습니다. 고른 조각은 모두 몇 개일까요?',
      '4개',
      ['3개', '5개', '7개'],
      '삼각형 3개와 삼각형이 아닌 조각 1개를 함께 골랐으므로 3+1=4개입니다.',
      'shape',
      '자료 해석 · 칠교 조각 조건 세기',
      visual,
    );
  }

  if (variant === 7) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '보기 모양을 만들었는데 빈틈이 생겼습니다. 가장 먼저 고쳐야 할 부분은 무엇일까요?',
      '맞닿는 변이 서로 맞는지',
      ['조각의 색을 바꾸기', '숫자 라벨 지우기', '아무 조각이나 하나 빼기'],
      '빈틈이 생기면 조각의 변끼리 정확히 맞닿았는지, 돌리거나 뒤집어야 하는지 확인해야 합니다.',
      'shape',
      '칠교 구성 오류 찾기',
      visual,
    );
  }

  if (variant === 8) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교에서 큰 삼각형 2개와 작은 삼각형 2개를 사용했습니다. 아직 쓰지 않은 삼각형 조각은 몇 개일까요?',
      '1개',
      ['0개', '2개', '3개'],
      '칠교에는 삼각형 조각이 모두 5개입니다. 4개를 사용했으므로 남은 삼각형은 1개입니다.',
      'shape',
      '자료 해석 · 전체와 사용한 조각 비교',
      visual,
    );
  }

  if (variant === 9) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각을 돌려 놓아도 같은 조각인지 판단하려면 무엇을 보아야 할까요?',
      '변의 길이와 꼭짓점의 수',
      ['위에 적힌 번호만', '색깔만', '놓인 자리의 높이'],
      '조각의 방향이 달라져도 변과 꼭짓점, 크기가 같으면 같은 조각으로 볼 수 있습니다.',
      'shape',
      '도형의 회전과 같은 조각 판단',
      visual,
    );
  }

  if (variant === 10) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각 4개를 붙여 사각형 모양을 만들었습니다. 설명으로 알맞은 것은 무엇일까요?',
      '바깥 윤곽의 변이 4개인지 확인한다',
      ['안쪽 선이 몇 개인지만 본다', '색깔이 모두 같은지만 본다', '삼각형 조각 수만 본다'],
      '여러 조각을 붙인 뒤에는 안쪽 선보다 바깥 윤곽을 보고 사각형인지 판단해야 합니다.',
      'shape',
      '조건 조합 · 조각 구성 후 바깥 윤곽 판단',
      visual,
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    '칠교판을 보고 알 수 없는 정보는 무엇일까요?',
    '조각을 놓을 정답 순서',
    ['삼각형 조각의 개수', '전체 조각의 개수', '삼각형이 아닌 조각의 개수'],
    '칠교판 그림에서는 조각의 종류와 개수는 알 수 있지만, 모양 만들기의 정답 순서는 문제 조건을 더 보아야 알 수 있습니다.',
    'shape',
    '자료 해석 · 그림에서 알 수 있는 정보 구별',
    visual,
  );
};

const planeShapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const focus = shapeFocusForLesson(lesson, index);
  if (focus === '칠교') return tangramQuestion(lesson, difficulty, index);

  const target = focus;
  const fact = planeShapeFacts[target];
  const variant = variantForDifficulty(difficulty, index, 18, 6);

  if (variant === 0) {
    const board = singleTargetBoard(target, index);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `그림에서 ${target}인 도형의 번호는 무엇일까요?`,
      board.answerLabel,
      board.wrongLabels,
      `${target}은 ${fact.feature} 번호가 붙은 그림에서 이 성질을 만족하는 도형을 고릅니다.`,
      'shape',
      `${target}의 기본 성질로 번호 찾기`,
      board.visual,
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 찾을 때 꼭 확인해야 할 성질은 무엇일까요?`,
      fact.shortFeature,
      target === '원'
        ? ['변 3개, 꼭짓점 3개', '변 4개, 꼭짓점 4개', '높이가 2층']
        : target === '삼각형'
          ? ['굽은 선, 꼭짓점 0개', '변 4개, 꼭짓점 4개', '쌓기나무 3개']
          : ['굽은 선, 꼭짓점 0개', '변 3개, 꼭짓점 3개', '쌓기나무 4개'],
      `${target}은 이름보다 성질을 먼저 보아야 합니다. ${fact.feature}`,
      'shape',
      `${target} 성질 확인`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 2) {
    const object = fact.objects[index % fact.objects.length];
    const wrongs = rotate([...fact.nearMisses], index).slice(0, 3);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `생활 물건의 바깥 윤곽을 도형으로 본다면 ${target} 모양인 것은 무엇일까요?`,
      object,
      wrongs,
      `${object}의 바깥 윤곽은 ${target}의 성질과 같습니다. ${fact.feature}`,
      'shape',
      `생활 장면에서 ${target} 찾기`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 3) {
    const board = twoTargetBoard(target, index);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `그림에서 ${target}인 도형을 모두 고른 것은 무엇일까요?`,
      board.answer,
      board.wrongs,
      `하나만 고르지 말고 모든 보기를 확인합니다. ${target}은 ${fact.feature}`,
      'shape',
      `자료 해석 · ${target} 모두 찾기`,
      board.visual,
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}의 꼭짓점은 모두 몇 개일까요?`,
      `${fact.vertices}개`,
      countWrongs(fact.vertices),
      `${target}의 꼭짓점은 모서리처럼 만나는 점입니다. ${target}은 꼭짓점이 ${fact.vertices}개입니다.`,
      'shape',
      `${target}의 꼭짓점 세기`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 5) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}의 변은 모두 몇 개일까요?`,
      `${fact.sides}개`,
      countWrongs(fact.sides),
      target === '원'
        ? '원은 곧은 변으로 둘러싸인 도형이 아니므로 변이 0개입니다.'
        : `${target}의 변은 곧게 이어진 선분입니다. ${target}은 변이 ${fact.sides}개입니다.`,
      'shape',
      `${target}의 변 세기`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 6) {
    const other = target === '원' ? '삼각형' : target === '삼각형' ? '사각형' : '원';
    const otherFact = planeShapeFacts[other];
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}과 ${other}을 구별할 때 가장 알맞은 기준은 무엇일까요?`,
      '변과 꼭짓점의 수',
      ['색깔', '그림의 위치', '문제 번호'],
      `${target}은 ${fact.shortFeature}이고, ${other}은 ${otherFact.shortFeature}입니다. 도형은 색깔보다 변과 꼭짓점으로 구별합니다.`,
      'shape',
      `자료 해석 · 두 도형의 성질 비교`,
      shapeVisualForTargets(`${target}과 ${other} 비교`, [target, other], index),
    );
  }

  if (variant === 7) {
    const first = target === '원' ? '삼각형' : target;
    const second = target === '사각형' ? '삼각형' : '사각형';
    const answer = planeShapeFacts[first].vertices + planeShapeFacts[second].vertices;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${first} 1개와 ${second} 1개의 꼭짓점 수를 모두 더하면 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `${first}의 꼭짓점 ${planeShapeFacts[first].vertices}개와 ${second}의 꼭짓점 ${planeShapeFacts[second].vertices}개를 더하면 ${answer}개입니다.`,
      'shape',
      '자료 해석 · 여러 도형의 꼭짓점 합산',
      shapeVisualForTargets('꼭짓점 수 더하기', [first, second], index),
    );
  }

  if (variant === 8) {
    const wrongObject = fact.nearMisses[index % fact.nearMisses.length];
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${wrongObject}을 ${target}이라고 보기 어려운 까닭은 무엇일까요?`,
      `${target}의 성질과 맞지 않기 때문`,
      ['색깔이 다르기 때문', '이름이 길기 때문', '화면 아래에 있기 때문'],
      `도형은 물건 이름이나 색깔보다 성질로 판단합니다. ${target}은 ${fact.feature}`,
      'shape',
      `${target}이 아닌 이유 설명`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 9) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 돌려 놓거나 크게 그려도 같은 종류의 도형으로 볼 수 있는 까닭은 무엇일까요?`,
      '변과 꼭짓점 같은 성질이 변하지 않기 때문',
      ['색깔이 항상 같기 때문', '번호가 변하지 않기 때문', '항상 같은 자리에 있기 때문'],
      `도형의 방향과 크기가 달라도 ${target}의 성질이 그대로이면 같은 종류의 도형입니다.`,
      'shape',
      '도형의 방향과 크기 변화 이해',
      planeVisualForTarget(target, index + 2),
    );
  }

  if (variant === 10) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 설명하는 말로 알맞은 것은 무엇일까요?`,
      fact.feature,
      target === '원'
        ? ['곧은 변 3개가 있습니다.', '곧은 변 4개가 있습니다.', '쌓기나무로만 만들 수 있습니다.']
        : target === '삼각형'
          ? ['굽은 선으로만 둘러싸여 있습니다.', '변과 꼭짓점이 4개씩 있습니다.', '입체도형입니다.']
          : ['굽은 선으로만 둘러싸여 있습니다.', '변과 꼭짓점이 3개씩 있습니다.', '쌓기나무입니다.'],
      `${target}을 설명할 때는 변과 꼭짓점의 수를 정확히 말해야 합니다.`,
      'shape',
      `${target} 설명 문장 고르기`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 11) {
    const first = target === '원' ? '삼각형' : target;
    const second = target === '사각형' ? '원' : '사각형';
    const answer = planeShapeFacts[first].sides + planeShapeFacts[second].sides;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${first} 1개와 ${second} 1개의 변 수를 모두 더하면 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `${first}의 변 ${planeShapeFacts[first].sides}개와 ${second}의 변 ${planeShapeFacts[second].sides}개를 더합니다. 원은 곧은 변이 0개입니다.`,
      'shape',
      '조건 조합 · 여러 도형의 변 수 합산',
      shapeVisualForTargets('변 수 더하기', [first, second], index),
    );
  }

  if (variant === 12) {
    const board = twoTargetBoard(target, index + 1);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `네 도형을 ${target}과 ${target}이 아닌 것으로 나누려고 합니다. ${target} 쪽에 들어갈 번호는 무엇일까요?`,
      board.answer,
      board.wrongs,
      `${target} 쪽에는 ${fact.shortFeature}인 도형만 넣어야 합니다.`,
      'shape',
      `자료 해석 · ${target} 분류 기준 적용`,
      board.visual,
    );
  }

  if (variant === 13) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}을 고른 뒤 마지막에 스스로 확인할 질문으로 가장 알맞은 것은 무엇일까요?`,
      target === '원' ? '굽은 선으로 둘러싸였고 꼭짓점이 없나요?' : `변과 꼭짓점이 각각 ${fact.vertices}개인가요?`,
      ['어떤 색인가요?', '누가 그렸나요?', '몇 번째 문제인가요?'],
      `검토 질문은 차시 목표와 연결되어야 합니다. ${target}은 ${fact.feature}`,
      'shape',
      `${target} 자기 점검 질문 만들기`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 14) {
    const board = singleTargetBoard(target, index + 3);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `도형의 색깔을 모두 지워도 ${target}을 찾을 수 있을까요? 알맞은 까닭을 고르세요.`,
      '변과 꼭짓점으로 판단할 수 있기 때문',
      ['색깔이 가장 중요하기 때문', '번호가 항상 정답이기 때문', '크기가 모두 같기 때문'],
      `도형을 구별하는 기준은 색깔이 아니라 성질입니다. ${target}은 ${fact.shortFeature}입니다.`,
      'shape',
      '조건 조합 · 불필요한 정보 버리기',
      board.visual,
    );
  }

  if (variant === 15) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target}과 가장 관계 깊은 핵심 낱말은 무엇일까요?`,
      target === '원' ? '굽은 선' : target === '삼각형' ? '세 변' : '네 변',
      ['시각', '받아올림', '측정 단위'],
      `이 차시에서는 ${target}의 성질을 말할 수 있어야 합니다. ${fact.feature}`,
      'shape',
      `${target} 핵심 개념 연결`,
      planeVisualForTarget(target, index),
    );
  }

  if (variant === 16) {
    const answer = fact.sides + fact.vertices;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${target} 1개에서 변의 수와 꼭짓점의 수를 모두 더하면 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `${target}은 변 ${fact.sides}개, 꼭짓점 ${fact.vertices}개이므로 모두 ${answer}개입니다.`,
      'shape',
      '조건 조합 · 변과 꼭짓점 함께 세기',
      planeVisualForTarget(target, index),
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `${target}을 찾는 문제에서 필요 없는 정보는 무엇일까요?`,
    '도형의 색깔',
    ['변의 수', '꼭짓점의 수', target === '원' ? '굽은 선인지' : '곧은 변인지'],
    `도형 이름을 판단할 때는 색깔보다 ${fact.shortFeature} 같은 성질이 필요합니다.`,
    'shape',
    '자료 해석 · 필요한 정보와 필요 없는 정보 구별',
    planeVisualForTarget(target, index),
  );
};

type StackScene = {
  name: string;
  heights: number[][];
};

const stackScenes: StackScene[] = [
  { name: 'ㄴ자 2층 모양', heights: [[2, 1], [1, 0]] },
  { name: '계단 모양', heights: [[1, 2, 3]] },
  { name: '가운데가 높은 모양', heights: [[1, 2], [1, 1]] },
  { name: '앞줄이 긴 모양', heights: [[1, 1, 1], [2, 0, 1]] },
  { name: '모서리가 높은 모양', heights: [[3, 1], [1, 1]] },
  { name: '두 기둥 모양', heights: [[2, 0, 2], [1, 1, 0]] },
  { name: '십자 모양', heights: [[0, 1, 0], [1, 2, 1], [0, 1, 0]] },
  { name: '넓은 받침 모양', heights: [[1, 1, 1], [1, 2, 0], [0, 1, 0]] },
];

const cubesFromHeights = (heights: number[][]) =>
  heights.flatMap((row, y) =>
    row.flatMap((height, x) => Array.from({ length: height }, (_, z) => ({ x, y, z }))),
  );

const stackStats = (scene: StackScene) => {
  const cells = scene.heights.flat();
  const rows = scene.heights.length;
  const columns = Math.max(...scene.heights.map((row) => row.length));
  const total = cells.reduce((sum, height) => sum + height, 0);
  const top = cells.filter((height) => height > 0).length;
  const second = cells.filter((height) => height >= 2).length;
  const third = cells.filter((height) => height >= 3).length;
  const maxHeight = Math.max(...cells);
  const front = Array.from({ length: columns }, (_, x) => Math.max(...scene.heights.map((row) => row[x] ?? 0))).filter(Boolean).length;
  const side = scene.heights.map((row) => Math.max(...row)).filter(Boolean).length;

  return { total, top, second, third, maxHeight, front, side, rows, columns };
};

const stackVisualForScene = (scene: StackScene): QuestionVisual => ({
  kind: 'cube-stack',
  label: scene.name,
  cubes: cubesFromHeights(scene.heights),
});

const stackSceneFor = (lesson: Lesson, index: number): StackScene => stackScenes[(lesson.lessonNo * 5 + index) % stackScenes.length];

const solidQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const scene = stackSceneFor(lesson, index);
  const stats = stackStats(scene);
  const visual = stackVisualForScene(scene);
  const variant = variantForDifficulty(difficulty, index, 20, 5);

  if (variant === 0) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '그림의 쌓기나무는 모두 몇 개일까요?',
      `${stats.total}개`,
      countWrongs(stats.total),
      `아래층부터 위층까지 빠뜨리지 않고 세면 모두 ${stats.total}개입니다.`,
      'solid',
      '쌓기나무 전체 개수 세기',
      visual,
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '그림에서 1층에 놓인 쌓기나무는 몇 개일까요?',
      `${stats.top}개`,
      countWrongs(stats.top),
      `1층은 바닥에 닿아 있는 자리입니다. 위에서 보이는 칸 수와 같아서 ${stats.top}개입니다.`,
      'solid',
      '1층 자리와 위에서 본 칸 연결',
      visual,
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '그림에서 가장 높은 곳은 몇 층일까요?',
      `${stats.maxHeight}층`,
      countWrongs(stats.maxHeight, '층'),
      `한 자리에 위로 쌓인 쌓기나무 수가 층수입니다. 가장 높은 기둥은 ${stats.maxHeight}층입니다.`,
      'solid',
      '쌓기나무 층수 판단',
      visual,
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '그림에서 2층에 있는 쌓기나무는 몇 개일까요?',
      `${stats.second}개`,
      countWrongs(stats.second),
      `높이가 2층 이상인 자리마다 2층 쌓기나무가 하나씩 있습니다. 그런 자리는 ${stats.second}곳입니다.`,
      'solid',
      '층별 쌓기나무 개수 세기',
      visual,
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '그림을 위에서 보면 칸이 몇 칸 보일까요?',
      `${stats.top}칸`,
      countWrongs(stats.top, '칸'),
      `위에서 보면 각 기둥의 맨 위만 보입니다. 쌓기나무가 놓인 자리가 ${stats.top}곳이므로 ${stats.top}칸입니다.`,
      'solid',
      '위에서 본 모양과 자리 수 연결',
      visual,
    );
  }

  if (variant === 5) {
    const hidden = stats.total - stats.top;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `위에서 보이는 칸이 ${stats.top}칸이고 전체 쌓기나무는 ${stats.total}개입니다. 위에서 바로 보이지 않는 쌓기나무는 몇 개일까요?`,
      `${hidden}개`,
      countWrongs(hidden),
      `전체 ${stats.total}개에서 위에서 보이는 ${stats.top}개를 빼면 아래에 숨어 있는 쌓기나무는 ${hidden}개입니다.`,
      'solid',
      '자료 해석 · 보이는 칸과 전체 개수 비교',
      cubeViewsVisual([{ label: '위', count: stats.top }], '위에서 본 쌓기나무 칸'),
    );
  }

  if (variant === 6) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `앞에서 보면 ${stats.front}칸, 옆에서 보면 ${stats.side}칸입니다. 같은 모양을 만들려면 무엇을 함께 보아야 할까요?`,
      '위에서 본 모양',
      ['쌓기나무의 색깔', '문제 번호', '도형 이름'],
      '앞과 옆에서 본 모양만으로는 어느 자리에 쌓였는지 부족할 수 있습니다. 위에서 본 모양까지 보아야 위치를 알 수 있습니다.',
      'solid',
      '조건 조합 · 여러 방향 자료로 입체 모양 판단',
      cubeViewsVisual(
        [
          { label: '앞', count: stats.front },
          { label: '옆', count: stats.side },
        ],
        '앞과 옆에서 본 쌓기나무 모양',
      ),
    );
  }

  if (variant === 7) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '보기와 똑같이 쌓으려면 먼저 확인해야 할 것은 무엇일까요?',
      '각 쌓기나무의 위치와 층수',
      ['쌓기나무의 색깔만', '가장 왼쪽 번호만', '문제의 글자 수'],
      '같은 모양을 만들려면 어느 자리에 몇 층으로 쌓였는지를 함께 확인해야 합니다.',
      'solid',
      '쌓기나무 위치와 층수 맞추기',
      visual,
    );
  }

  if (variant === 8) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${stats.total}개로 다른 모양을 만들었습니다. 지금 그림과 반드시 같은 것은 무엇일까요?`,
      '사용한 쌓기나무의 개수',
      ['위에서 본 모양', '가장 높은 층수', '앞에서 본 칸 수'],
      `같은 ${stats.total}개를 사용해도 놓는 위치가 달라지면 보이는 모양과 높이는 달라질 수 있습니다.`,
      'solid',
      '같은 개수와 다른 모양 구별',
      visual,
    );
  }

  if (variant === 9) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `이 모양은 1층 자리가 ${stats.top}곳이고 2층 이상인 자리가 ${stats.second}곳입니다. 설명으로 알맞은 것은 무엇일까요?`,
      `전체 개수는 ${stats.total}개입니다.`,
      [`전체 개수는 ${stats.top}개입니다.`, `2층 이상인 자리는 없습니다.`, `가장 높은 곳은 1층입니다.`],
      `1층 자리만 세면 부족합니다. 각 자리의 높이를 모두 더해야 전체 ${stats.total}개가 됩니다.`,
      'solid',
      '자료 해석 · 자리 수와 전체 개수 구별',
      visual,
    );
  }

  if (variant === 10) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `위에서 본 칸은 ${stats.top}칸입니다. 이 정보만으로 알 수 없는 것은 무엇일까요?`,
      '각 자리의 높이',
      ['1층에 놓인 자리 수', '바닥에 닿은 자리 수', '위에서 보이는 칸 수'],
      '위에서 본 모양은 자리 수를 알려 주지만, 각 자리가 몇 층인지는 앞이나 옆의 정보가 더 필요합니다.',
      'solid',
      '자료 해석 · 위에서 본 모양의 한계 알기',
      cubeViewsVisual([{ label: '위', count: stats.top }], '위에서 본 쌓기나무 모양'),
    );
  }

  if (variant === 11) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `앞에서 본 칸이 ${stats.front}칸이고 위에서 본 칸이 ${stats.top}칸입니다. 같은 모양을 더 정확히 만들기 위해 더 필요한 것은 무엇일까요?`,
      '옆에서 본 모양',
      ['쌓기나무의 색깔', '문제 번호', '칠교 조각 수'],
      '앞에서 본 모양과 위에서 본 모양에 옆에서 본 모양을 더하면 위치와 높이를 더 정확히 판단할 수 있습니다.',
      'solid',
      '조건 조합 · 세 방향 자료 연결',
      cubeViewsVisual(
        [
          { label: '앞', count: stats.front },
          { label: '위', count: stats.top },
        ],
        '앞과 위에서 본 쌓기나무 모양',
      ),
    );
  }

  if (variant === 12) {
    const answer = stats.top + stats.second;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `위에서 보이는 칸은 ${stats.top}칸이고, 그중 ${stats.second}칸은 2층 이상입니다. 쌓기나무는 적어도 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `각 칸에 1개씩 있으면 ${stats.top}개이고, 2층 이상인 ${stats.second}칸에는 하나씩 더 필요하므로 적어도 ${answer}개입니다.`,
      'solid',
      '조건 조합 · 최소 개수 추론',
      cubeViewsVisual([{ label: '위', count: stats.top }], '위에서 본 칸과 높은 자리'),
    );
  }

  if (variant === 13) {
    const extra = 1 + (index % 2);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `쌓기나무 ${stats.total}개에 ${extra}개를 더 올려 같은 자리에 쌓았습니다. 전체는 몇 개가 될까요?`,
      `${stats.total + extra}개`,
      countWrongs(stats.total + extra),
      `기존 ${stats.total}개에 새로 올린 ${extra}개를 더하면 ${stats.total + extra}개입니다.`,
      'solid',
      '쌓기나무 개수 변화 계산',
      visual,
    );
  }

  if (variant === 14) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '쌓기나무 모양을 말로 설명할 때 빠지면 안 되는 정보는 무엇일까요?',
      '자리와 높이',
      ['색깔과 이름', '문제 쪽수', '학생 번호'],
      '입체 모양은 어느 자리에 몇 층으로 놓였는지를 말해야 친구가 같은 모양을 만들 수 있습니다.',
      'solid',
      '쌓기나무 모양 설명하기',
      visual,
    );
  }

  if (variant === 15) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `가장 높은 곳이 ${stats.maxHeight}층이고 위에서 보이는 칸이 ${stats.top}칸입니다. 전체 개수를 구할 때 필요한 행동은 무엇일까요?`,
      '각 칸의 높이를 모두 더한다',
      ['가장 높은 층만 답한다', '위에서 보이는 칸만 답한다', '색깔을 센다'],
      '전체 개수는 자리 수와 높이를 함께 보아야 합니다. 각 칸의 높이를 모두 더해야 정확합니다.',
      'solid',
      '조건 조합 · 층수와 자리 수 함께 보기',
      cubeViewsVisual([{ label: '위', count: stats.top }], '위에서 본 쌓기나무 칸'),
    );
  }

  if (variant === 16) {
    const answer = Math.max(0, stats.total - stats.top);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `그림에서 맨 위에 보이는 쌓기나무만 세면 ${stats.top}개입니다. 전체와 비교하면 더 세어야 할 쌓기나무는 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `전체 ${stats.total}개 중 맨 위에 보이는 ${stats.top}개를 뺀 ${answer}개가 아래층에 더 있습니다.`,
      'solid',
      '자료 해석 · 보이는 것과 전체 비교',
      visual,
    );
  }

  if (variant === 17) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      '친구가 같은 쌓기나무 모양을 만들었는지 확인하는 가장 좋은 방법은 무엇일까요?',
      '앞, 옆, 위에서 본 모양과 전체 개수를 비교한다',
      ['색깔만 비교한다', '가장 앞의 한 개만 본다', '쌓은 순서를 외운다'],
      '같은 입체 모양인지 보려면 여러 방향에서 본 모양, 위치, 전체 개수를 함께 비교해야 합니다.',
      'solid',
      '조건 조합 · 같은 입체 모양 검토',
      visual,
    );
  }

  if (variant === 18) {
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `3층인 자리가 ${stats.third}곳입니다. 3층인 자리에서 3층 쌓기나무를 하나씩 빼면 전체는 몇 개 줄어들까요?`,
      `${stats.third}개`,
      countWrongs(stats.third),
      `3층인 자리마다 맨 위 쌓기나무를 하나씩 빼므로 줄어드는 개수는 ${stats.third}개입니다.`,
      'solid',
      '조건 조합 · 특정 층의 개수 추론',
      visual,
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    '쌓기나무 문제에서 그림이 꼭 필요한 까닭은 무엇일까요?',
    '자리와 층을 함께 보아야 하기 때문',
    ['숫자가 없어도 되기 때문', '색깔만 알면 되기 때문', '평면도형 이름을 외우기 때문'],
    '쌓기나무는 입체 모양이라 글과 숫자만으로는 위치와 높이를 놓치기 쉽습니다. 그림으로 자리와 층을 함께 확인합니다.',
    'solid',
    '입체도형 시각 자료의 필요성 이해',
    visual,
  );
};

const shouldUseSolidQuestion = (lesson: Lesson, index: number) => {
  if (lesson.unitNo === 2) {
    if (lesson.lessonNo >= 6 && lesson.lessonNo <= 8) return true;
    if (lesson.lessonNo === 1 || lesson.lessonNo === 9) return index % 3 === 0;
  }
  return lesson.tags.includes('solid') && !lesson.tags.includes('shape');
};

const shapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  if (shouldUseSolidQuestion(lesson, index)) return solidQuestion(lesson, difficulty, index);
  return planeShapeQuestion(lesson, difficulty, index);
};

const richShapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  if (shouldUseSolidQuestion(lesson, index + 1)) {
    const scene = stackSceneFor(lesson, index + 3);
    const stats = stackStats(scene);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `앞에서 본 칸이 ${stats.front}칸이고 위에서 본 칸이 ${stats.top}칸입니다. 같은 쌓기나무 모양인지 판단하려면 더 확인해야 할 자료는 무엇일까요?`,
      '옆에서 본 모양',
      ['쌓기나무의 색깔', '문제 번호', '칠교판 조각 수'],
      '앞에서 본 모양은 높이를, 위에서 본 모양은 자리를 알려 줍니다. 옆에서 본 모양까지 비교하면 숨은 위치를 더 정확히 판단할 수 있습니다.',
      'solid',
      '조건 조합 · 세 방향 자료로 입체 모양 판단',
      cubeViewsVisual(
        [
          { label: '앞', count: stats.front },
          { label: '위', count: stats.top },
        ],
        '쌓기나무 방향별 관찰 자료',
      ),
    );
  }

  const focus = shapeFocusForLesson(lesson, index + 2);
  if (focus === '칠교') {
    const visual: QuestionVisual = { kind: 'tangram', label: '번호가 붙은 칠교 7조각' };
    if (index % 4 === 0) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '칠교판에서 삼각형 조각 5개 중 3개를 사용하고, 삼각형이 아닌 조각 2개를 모두 사용했습니다. 사용한 조각은 모두 몇 개일까요?',
        '5개',
        ['3개', '6개', '7개'],
        '사용한 삼각형 3개와 삼각형이 아닌 조각 2개를 더하면 5개입니다. 칠교 조각은 종류별로 나누어 세면 정확합니다.',
        'shape',
        '자료 해석 · 칠교 조각을 종류별로 세기',
        visual,
      );
    }

    if (index % 4 === 1) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '칠교판에서 큰 삼각형 2개와 작은 삼각형 2개를 썼습니다. 아직 쓰지 않은 삼각형 조각은 몇 개일까요?',
        '1개',
        ['0개', '2개', '3개'],
        '칠교판에는 삼각형 조각이 모두 5개입니다. 4개를 사용했으므로 남은 삼각형 조각은 1개입니다.',
        'shape',
        '자료 해석 · 전체와 사용한 칠교 조각 비교',
        visual,
      );
    }

    if (index % 4 === 2) {
      return makeQuestion(
        lesson,
        difficulty,
        index,
        '칠교 조각을 붙여 만든 모양이 사각형인지 확인하려고 합니다. 가장 먼저 보아야 할 것은 무엇일까요?',
        '바깥 윤곽의 변이 4개인지',
        ['안쪽 선의 색깔', '조각 번호의 순서', '가장 작은 조각의 위치만'],
        '여러 조각을 붙이면 안쪽 선이 생깁니다. 도형 이름은 바깥 윤곽의 변과 꼭짓점으로 판단합니다.',
        'shape',
        '조건 조합 · 칠교 구성 후 바깥 윤곽 판단',
        visual,
      );
    }

    return makeQuestion(
      lesson,
      difficulty,
      index,
      '칠교 조각으로 보기와 같은 모양을 만들었는데 빈틈이 생겼습니다. 고칠 때 가장 필요한 생각은 무엇일까요?',
      '조각을 돌리거나 뒤집어 맞닿는 변을 맞춘다',
      ['조각의 색깔을 바꾼다', '삼각형 조각을 모두 뺀다', '번호가 작은 조각만 쓴다'],
      '칠교는 조각을 돌리거나 뒤집어도 같은 조각입니다. 빈틈이 있으면 맞닿는 변과 방향을 확인합니다.',
      'shape',
      '조건 조합 · 칠교 조각의 회전과 뒤집기 활용',
      visual,
    );
  }

  const first = focus;
  const second: PlaneTarget = first === '삼각형' ? '사각형' : first === '사각형' ? '삼각형' : '삼각형';
  const variant = index % 4;

  if (variant === 0) {
    const answer = planeShapeFacts[first].vertices + planeShapeFacts[second].vertices;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${first} 1개와 ${second} 1개를 보고 꼭짓점 수를 모두 세었습니다. 모두 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `${first}의 꼭짓점 ${planeShapeFacts[first].vertices}개와 ${second}의 꼭짓점 ${planeShapeFacts[second].vertices}개를 더하면 ${answer}개입니다. 그림에서 꼭짓점을 하나씩 표시하며 세면 빠뜨리지 않습니다.`,
      'shape',
      '자료 해석 · 여러 도형의 꼭짓점 수 합산',
      shapeVisualForTargets('두 도형의 꼭짓점 합산', [first, second], index),
    );
  }

  if (variant === 1) {
    const answer = planeShapeFacts[first].sides + planeShapeFacts[second].sides;
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `${first} 1개와 ${second} 1개를 보고 변의 수를 모두 세었습니다. 모두 몇 개일까요?`,
      `${answer}개`,
      countWrongs(answer),
      `${first}의 변 ${planeShapeFacts[first].sides}개와 ${second}의 변 ${planeShapeFacts[second].sides}개를 더합니다. 원은 곧은 변이 0개라는 점을 조심합니다.`,
      'shape',
      '자료 해석 · 여러 도형의 변 수 합산',
      shapeVisualForTargets('두 도형의 변 수 합산', [first, second], index),
    );
  }

  if (variant === 2) {
    const board = twoTargetBoard(first, index + 2);
    return makeQuestion(
      lesson,
      difficulty,
      index,
      `네 도형을 보고 ${first}인 것을 모두 고르세요. 한 개만 고르면 안 됩니다.`,
      board.answer,
      board.wrongs,
      `${first}의 성질은 ${planeShapeFacts[first].shortFeature}입니다. 모든 보기를 같은 기준으로 확인합니다.`,
      'shape',
      `자료 해석 · ${first}을 모두 찾고 근거 확인`,
      board.visual,
    );
  }

  return makeQuestion(
    lesson,
    difficulty,
    index,
    `${first}을 찾는 데 꼭 필요한 정보와 필요 없는 정보를 나누려고 합니다. 필요 없는 정보는 무엇일까요?`,
    '도형의 색깔',
    ['변의 수', '꼭짓점의 수', first === '원' ? '굽은 선인지' : '곧은 변인지'],
    `${first}은 ${planeShapeFacts[first].feature} 색깔은 도형의 종류를 판단하는 핵심 조건이 아닙니다.`,
    'shape',
    '조건 조합 · 필요한 정보와 불필요한 정보 구별',
    planeVisualForTarget(first, index),
  );
};

const richQuestionFor = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (difficulty === '하') return null;

  const hardSlots = new Set([2, 3, 6, 7, 10, 11, 14, 15, 18, 19]);
  const mediumSlots = new Set([3, 6, 9, 12, 15, 18]);
  const useRich = difficulty === '상' ? hardSlots.has(index) : mediumSlots.has(index);
  if (!useRich) return null;

  const tag = primaryTag(lesson);
  if (tag === 'addition') return richOperationQuestion(lesson, difficulty, index, 'addition');
  if (tag === 'subtraction') return richOperationQuestion(lesson, difficulty, index, 'subtraction');
  if (tag === 'shape' || tag === 'solid') return richShapeQuestion(lesson, difficulty, index);
  if (tag === 'measurement') return richMeasurementQuestion(lesson, difficulty, index);
  if (tag === 'classification' || tag === 'data') return richDataQuestion(lesson, difficulty, index);
  if (tag === 'multiplication') return richMultiplicationQuestion(lesson, difficulty, index);
  if (tag === 'time') return richTimeQuestion(lesson, difficulty, index);
  if (tag === 'pattern') return richPatternQuestion(lesson, difficulty, index);
  return richNumberQuestion(lesson, difficulty, index);
};

const visualForGeneratedQuestion = (question: Question, index: number): QuestionVisual | undefined => {
  if (question.visual) return question.visual;

  const answerNumber = numberFromAnswer(question.answer);
  const promptNumbers = question.prompt.match(/\d+/g)?.map(Number) ?? [];

  if (question.type === 'placeValue') {
    // 자리값 문제의 정답은 보통 한 자리 값(예: 274의 일의 자리 → 4)이라
    // 정답을 그리면 표가 000이 됩니다. 문제에 나온 수 중 가장 큰 수를 그려야
    // 학생이 실제로 분해할 수를 볼 수 있습니다.
    const candidates = [...promptNumbers, ...(Number.isNaN(answerNumber) ? [] : [answerNumber])];
    return placeValueVisualFor(candidates.length ? Math.max(...candidates) : 100, '자리값 시각자료');
  }

  if (question.type === 'number') {
    const values = promptNumbers.length >= 2 ? promptNumbers.slice(0, 3) : [Math.max(0, answerNumber - 20), answerNumber, answerNumber + 20];
    const step = Math.max(1, values.length >= 2 ? Math.abs(values[1] - values[0]) || 10 : 10);
    return numberLineVisualFor(values, step > 100 ? 100 : step > 10 ? 10 : step, '수의 위치 자료');
  }

  if (question.type === 'addition' || question.type === 'subtraction') {
    const bars = promptNumbers.slice(0, 3).map((value, valueIndex) => ({ label: valueIndex === 0 ? '처음' : valueIndex === 1 ? '변화' : '다음', value }));
    if (!Number.isNaN(answerNumber)) bars.push({ label: '답', value: answerNumber });
    return barModelVisualFor(bars.length ? bars : [{ label: '부분', value: 1 }, { label: '전체', value: 2 }], '계산 관계 자료');
  }

  if (question.type === 'measurement') {
    const start = promptNumbers[0] ?? 2;
    const end = promptNumbers[1] && promptNumbers[1] > start ? promptNumbers[1] : start + Math.max(4, answerNumber || 8);
    return rulerVisualFor(start, end, '길이 측정 자료');
  }

  if (question.type === 'data' || question.type === 'classification') {
    const labeledCounts = question.prompt
      .match(/[가-힣]{1,4}\s*\d+(?:명|개)/g)
      ?.map((chunk) => {
        const chunkMatch = chunk.match(/^([가-힣]{1,4})\s*(\d+)/);
        return chunkMatch ? { label: chunkMatch[1], count: Number(chunkMatch[2]) } : null;
      })
      .filter((item): item is { label: string; count: number } => item !== null);

    const items =
      labeledCounts && labeledCounts.length >= 2
        ? labeledCounts.slice(0, 3)
        : [
            { label: '가', count: promptNumbers[0] ?? 5 },
            { label: '나', count: promptNumbers[1] ?? 7 },
            { label: '다', count: promptNumbers[2] ?? 4 },
          ];

    return pictographVisualFor(items, 1, '자료 조사 그림그래프');
  }

  if (question.type === 'multiplication') {
    const rows = promptNumbers[1] ?? 3;
    const columns = promptNumbers[0] ?? 4;
    return arrayVisualFor(Math.max(1, Math.min(rows, 9)), Math.max(1, Math.min(columns, 9)), '묶음 배열 자료');
  }

  if (question.type === 'time') {
    // 달력 문제에는 시계가 아니라 달력을 보여 줍니다.
    if (/달력|요일|며칠|날짜/.test(question.prompt)) {
      // 답이 되는 날짜는 표시하지 않습니다. 학생이 달력에서 직접 세어야 합니다.
      const eventMatch = question.prompt.match(/오늘은 (\d+)일이고 행사는 (\d+)일/);
      if (eventMatch) {
        return calendarVisualFor(
          [
            { day: Number(eventMatch[1]), tone: 'start' },
            { day: Number(eventMatch[2]), tone: 'end' },
          ],
          '오늘과 행사 날짜 달력',
        );
      }

      const moveMatch = question.prompt.match(/^(\d+)일에서 \d+일 뒤/);
      if (moveMatch) {
        return calendarVisualFor([{ day: Number(moveMatch[1]), tone: 'start' }], '날짜를 세는 달력');
      }

      return calendarVisualFor([], '요일이 반복되는 달력');
    }

    // 문제에 적힌 숫자를 그대로 시·분으로 읽은 값이라 실제 답과 다릅니다.
    // (예: "긴바늘이 9를 가리키고 짧은바늘이 2와 3 사이" -> 답은 2시 45분인데 9시 2분이 됩니다.)
    // 그래서 시계 모양을 보여 주는 예시로만 표시하고 바늘은 점선으로 그립니다.
    const hour = promptNumbers[0] ?? 3;
    const minute = promptNumbers[1] ?? 0;
    return clockVisualFor(
      Math.max(1, Math.min(hour, 12)),
      Math.max(0, Math.min(minute, 55)),
      '시계 모양 예시',
      undefined,
      undefined,
      true,
    );
  }

  if (question.type === 'pattern') {
    return patternVisualFor(['○', '△', '□', '○', '△', '□', '○'], '규칙 자료', 6);
  }

  return undefined;
};

const withRichVisual = (question: Question, index: number): Question => {
  const visual = visualForGeneratedQuestion(question, index);
  return visual ? { ...question, visual } : question;
};

const addAssessmentLayer = (question: Question, index: number): Question => {
  const layers = assessmentLayers[question.difficulty];
  const layer = layers[index % layers.length];
  const firstSeparator = question.strategy.indexOf(' · ');
  const strategy =
    firstSeparator === -1
      ? `${layer.label} · ${question.strategy}`
      : `${question.strategy.slice(0, firstSeparator)} · ${layer.label} · ${question.strategy.slice(firstSeparator + 3)}`;
  const support = {
    ...question.support,
    readStrategy: question.support.readStrategy.replace(question.strategy, strategy),
  };

  return {
    ...question,
    strategy,
    support,
    explanation: lessonNote(support),
  };
};

const makePromptsUnique = (questions: Question[]): Question[] => {
  const seenBasePrompts = new Map<string, number>();
  const usedPrompts = new Set<string>();

  return questions.map((question, index) => {
    const count = seenBasePrompts.get(question.prompt) ?? 0;
    seenBasePrompts.set(question.prompt, count + 1);

    if (count === 0 && !usedPrompts.has(question.prompt)) {
      usedPrompts.add(question.prompt);
      return question;
    }

    const notes = promptNotes[question.type];
    const note = notes[(index + count) % notes.length];
    const angle = duplicatePromptAngles[index % duplicatePromptAngles.length];
    let prompt = `${question.prompt} ${note} ${angle}`;
    let guard = 0;
    while (usedPrompts.has(prompt)) {
      prompt = `${question.prompt} ${note} ${duplicatePromptAngles[(index + guard + 1) % duplicatePromptAngles.length]}`;
      guard += 1;
    }
    usedPrompts.add(prompt);

    return {
      ...question,
      prompt,
    };
  });
};

const generateRawQuestions = (lesson: Lesson, difficulty: Difficulty): Question[] =>
  Array.from({ length: 20 }, (_, index) => {
    const tag = primaryTag(lesson);
    if (tag === 'addition') return operationQuestion(lesson, difficulty, index, 'addition');
    if (tag === 'subtraction') return operationQuestion(lesson, difficulty, index, 'subtraction');
    if (tag === 'shape' || tag === 'solid') return shapeQuestion(lesson, difficulty, index);
    if (tag === 'measurement') return measurementQuestion(lesson, difficulty, index);
    if (tag === 'classification') return classificationQuestion(lesson, difficulty, index);
    if (tag === 'multiplication') return multiplicationQuestion(lesson, difficulty, index);
    if (tag === 'time') return timeQuestion(lesson, difficulty, index);
    if (tag === 'data') return dataQuestion(lesson, difficulty, index);
    if (tag === 'pattern') return patternQuestion(lesson, difficulty, index);
    return numberQuestion(lesson, difficulty, index);
  });

export const generateQuestions = (lesson: Lesson, difficulty: Difficulty): Question[] =>
  makePromptsUnique(
    generateRawQuestions(lesson, difficulty)
      .map((question, index) => richQuestionFor(lesson, difficulty, index) ?? question)
      .map(withRichVisual)
      .map(addAssessmentLayer),
  );

export const generateLessonBank = (lesson: Lesson): Record<Difficulty, Question[]> => ({
  하: generateQuestions(lesson, '하'),
  중: generateQuestions(lesson, '중'),
  상: generateQuestions(lesson, '상'),
});
