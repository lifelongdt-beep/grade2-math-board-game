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
    '어느 자리부터 더하는지 확인해요.',
    '수 모형으로 더해 보세요.',
    '식과 이야기 상황을 연결해요.',
    '잘못된 계산을 고쳐 보세요.',
  ],
  subtraction: [
    '무엇에서 무엇을 빼는지 먼저 읽어요.',
    '어느 자리부터 빼는지 확인해요.',
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
    '어디서 시작해서 어디서 끝나는지 보세요.',
    '같은 단위끼리 비교해요.',
    '무엇의 길이를 묻는지 다시 읽어요.',
    '두 길이를 나란히 놓고 생각해요.',
    '문제에서 묻는 것을 다시 확인해요.',
  ],
  classification: [
    '분류 기준을 하나만 정해요.',
    '빠지거나 겹치는 것이 없는지 보세요.',
    '같은 기준에 맞는 것끼리 모아요.',
    '기준이 분명한지 다시 확인해요.',
    '기준을 바꾸면 묶음도 바뀌는지 생각해요.',
  ],
  multiplication: [
    '한 묶음의 수와 묶음 수를 나누어 봐요.',
    '같은 수가 몇 번 있는지 세어 봐요.',
    '그림을 묶어서 살펴봐요.',
    '무엇을 묻는지 다시 읽어요.',
    '수를 하나씩 짚어 가며 확인해요.',
  ],
  time: [
    '긴바늘과 짧은바늘의 역할을 나누어 봐요.',
    '짧은바늘이 지나온 숫자를 먼저 봐요.',
    '긴바늘이 어디를 가리키는지 봐요.',
    '문제에서 묻는 것을 다시 읽어요.',
    '숫자와 눈금을 다시 한 번 확인해요.',
  ],
  data: [
    '표의 항목 이름을 먼저 읽어요.',
    '가장 큰 수와 작은 수를 비교해요.',
    '전체 수인지 차이인지 확인해요.',
    '빠뜨리거나 두 번 세지 않았는지 봐요.',
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
  '배운 것을 떠올리며 근거를 찾아요.',
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
    visual.kind === 'grid-table' ||
    visual.kind === 'unit-measure' ||
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

// 서로 다른 한 자리 수를 필요한 개수만큼 만듭니다. 0은 넣지 않습니다.
// '이 수에서 숫자 3이 나타내는 값'을 물으려면 3이 한 번만 나와야 합니다.
const distinctDigits = (seed: number, count: number) => {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const picked: number[] = [];
  let cursor = seed;

  for (let taken = 0; taken < count; taken += 1) {
    cursor = (cursor * 7 + 3) % pool.length;
    picked.push(pool.splice(cursor % pool.length, 1)[0]);
  }

  return picked;
};

// ── 세 자리 수(2-1 1단원) / 네 자리 수(2-2 1단원) ─────────────────────────
// 지도서 차시: 백(천) 알기 → 몇백(몇천) → 세(네) 자리 수 → 각 자리의 숫자 →
// 뛰어 세기 → 크기 비교. 차시마다 다루는 내용이 분명하므로 나누어 냅니다.
const placeValueUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const four = lesson.unitTitle === '네 자리 수';
  if (!four && lesson.unitTitle !== '세 자리 수') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 6, 3);
  const unitBase = four ? 1000 : 100;
  const unitName = four ? '천' : '백';
  const seed = n(lesson, index);

  // 단원 도입: 아직 백(천)도 배우기 전이므로 앞 학년에서 배운 두(세) 자리 수까지만
  if (title.includes('단원 도입')) {
    const small = four ? 100 + (seed % 800) : 10 + (seed % 80);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${small}보다 1만큼 더 큰 수는 얼마일까요?`,
        small + 1, [small - 1, small + 10, small],
        `${small} 다음 수는 ${small + 1}입니다.`,
        'number', '바로 뒤의 수 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `생활에서 ${four ? '1000보다 큰 수' : '100보다 큰 수'}를 볼 수 있는 곳으로 알맞은 것은?`,
        four ? '책의 쪽수나 물건의 값' : '교실 사물함 번호나 책의 쪽수',
        ['한 사람의 손가락 수', '한 주의 날수', '한 상자의 색연필 수'],
        `생활 속에는 큰 수로 나타내야 하는 것이 많습니다.`,
        'number', '큰 수가 필요한 상황 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '물건이 아주 많을 때 수를 세는 방법으로 알맞은 것은?',
        '10개씩 묶어서 센다',
        ['눈으로 어림한다', '하나씩만 센다', '세지 않는다'],
        `10개씩 묶어 세면 많은 물건도 빠르고 정확하게 셀 수 있습니다.`,
        'number', '큰 수를 세는 방법 생각하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${small}은 10이 몇 개인 수에 가까울까요?`,
        `${Math.floor(small / 10)}개`,
        [`${small}개`, `${Math.floor(small / 10) + 2}개`, '1개'],
        `${small}은 10이 ${Math.floor(small / 10)}개인 수와 가깝습니다.`,
        'placeValue', '10씩 묶어 수 살펴보기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '수가 많을 때 세기 쉬운 방법으로 알맞은 것은?',
      '10개씩 묶어 세고 남은 것을 센다',
      ['보이는 대로 어림한다', '큰 것부터 센다', '세지 않고 넘어간다'],
      `10개씩 묶어 세면 많은 물건도 빠짐없이 셀 수 있습니다.`,
      'number', '묶어 세는 방법 고르기',
    );
  }

  // 백을 알아볼까요 / 천을 알아볼까요 ('몇백'은 아래에서 따로 다루므로 제외)
  if ((title.includes('백을 알아') || title.includes('천을 알아')) && !title.includes('몇')) {
    const below = unitBase - (four ? 100 : 10);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${below}보다 ${four ? 100 : 10}만큼 더 큰 수는 얼마일까요?`,
        unitBase, [below, unitBase + (four ? 100 : 10), four ? 100 : 10],
        `${below}에서 ${four ? 100 : 10}만큼 더 크면 ${unitBase}입니다.`,
        'number', `${unitName}이 되는 과정 알기`,
      );
    }
    if (variant === 1) {
      const piece = four ? 100 : 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${piece}이 10개이면 얼마일까요?`,
        unitBase, [piece, unitBase * 10, piece * 5],
        `${piece}씩 10묶음을 모으면 ${unitBase}이 됩니다.`,
        'placeValue', `${unitName}의 구성 알기`,
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${unitBase}을 읽는 방법으로 알맞은 것은?`,
        unitName,
        four ? ['백', '만', '십'] : ['십', '천', '만'],
        `${unitBase}은 ${unitName}이라고 읽습니다.`,
        'number', `${unitName} 읽고 쓰기`,
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${unitBase - 1}보다 1만큼 더 큰 수는 얼마일까요?`,
        unitBase, [unitBase - 2, unitBase + 1, unitBase - 10],
        `${unitBase - 1} 다음 수는 ${unitBase}입니다.`,
        'number', `${unitName} 바로 앞의 수 알기`,
      );
    }
    if (variant === 4) {
      const zeros = four ? 3 : 2;
      return makeQuestion(
        lesson, difficulty, index,
        `${unitBase}을 숫자로 쓸 때 0은 몇 개일까요?`,
        `${zeros}개`, [`${zeros + 1}개`, `${zeros - 1}개`, '1개'],
        `${unitBase}은 1 다음에 0을 ${zeros}개 써서 나타냅니다.`,
        'placeValue', `${unitName}을 숫자로 쓰기`,
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${unitBase}은 ${four ? 100 : 10}이 몇 개인 수일까요?`,
      '10개', ['1개', '100개', '5개'],
      `${four ? 100 : 10}이 10개 모이면 ${unitBase}입니다.`,
      'placeValue', `${unitName}을 묶음으로 보기`,
    );
  }

  // 몇백 / 몇천
  if (title.includes('몇백') || title.includes('몇천')) {
    const count = 2 + (index % 8);
    const value = unitBase * count;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${unitBase}이 ${count}개인 수는 얼마일까요?`,
        value, [unitBase * (count + 1), count, unitBase + count],
        `${unitBase}이 ${count}개이므로 ${value}입니다.`,
        'number', `몇${unitName} 만들기`,
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}은 ${unitBase}이 몇 개인 수일까요?`,
        `${count}개`, [`${count + 1}개`, `${value}개`, '10개'],
        `${value}은 ${unitBase}이 ${count}개인 수입니다.`,
        'placeValue', `몇${unitName}을 묶음으로 보기`,
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}을 숫자로 바르게 쓴 것은?`,
        `${value}`,
        [`${count}`, `${unitBase}${count}`, `${count}${unitBase}`],
        `${unitBase}이 ${count}개이므로 ${value}이라고 씁니다.`,
        'placeValue', `몇${unitName}을 숫자로 쓰기`,
      );
    }
    if (variant === 3) {
      const words = ['이', '삼', '사', '오', '육', '칠', '팔', '구'];
      const word = `${words[count - 2]}${unitName}`;
      return makeQuestion(
        lesson, difficulty, index,
        `${value}을 읽으면 무엇일까요?`,
        word,
        [`${words[(count - 1) % 8]}${unitName}`, `${unitName}${words[count - 2]}`, `${count}${unitName}`],
        `${value}은 ${word}이라고 읽습니다.`,
        'number', `몇${unitName} 읽기`,
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        `${unitBase}이 ${count}개이면 몇${unitName}이라고 읽을까요?`,
        `${['이', '삼', '사', '오', '육', '칠', '팔', '구'][count - 2]}${unitName}`,
        [`${count}${unitName}`, `${unitName}${count}`, `${value}${unitName}`],
        `${unitBase}이 ${count}개인 수는 ${['이', '삼', '사', '오', '육', '칠', '팔', '구'][count - 2]}${unitName}이라고 읽습니다.`,
        'number', `몇${unitName}을 말로 읽기`,
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${value}을 숫자로 쓸 때 ${unitName}의 자리 숫자는?`,
      count, [0, count + 1, value],
      `${value}에서 ${unitName}의 자리 숫자는 ${count}입니다.`,
      'placeValue', `몇${unitName}의 자리 숫자 알기`,
    );
  }

  // 각 자리의 숫자는 얼마를 나타낼까요
  if (title.includes('각 자리')) {
    const digits = four
      ? [1 + (seed % 8), (seed + 1) % 10, (seed + 4) % 10, (seed + 7) % 10]
      : [1 + (seed % 8), (seed + 1) % 10, (seed + 4) % 10];
    const value = digits.reduce((acc, d) => acc * 10 + d, 0);
    const names = four ? ['천', '백', '십', '일'] : ['백', '십', '일'];
    const place = index % names.length;
    const digit = digits[place];
    const worth = digit * Math.pow(10, names.length - 1 - place);

    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}에서 ${names[place]}의 자리 숫자는 무엇일까요?`,
        digit, [digits[(place + 1) % names.length], worth, value % 10],
        `${value}에서 ${names[place]}의 자리 숫자는 ${digit}입니다.`,
        'placeValue', '자리의 숫자 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}에서 ${names[place]}의 자리 숫자 ${digit}은 얼마를 나타낼까요?`,
        worth, [digit, worth * 10, value],
        `${names[place]}의 자리에 있는 ${digit}은 ${worth}을 나타냅니다.`,
        'placeValue', '자리 숫자가 나타내는 값 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}에서 숫자 ${digits[0]}은 얼마를 나타낼까요?`,
        digits[0] * Math.pow(10, names.length - 1),
        [digits[0], value, digits[0] * 10],
        `${digits[0]}은 ${names[0]}의 자리에 있으므로 ${digits[0] * Math.pow(10, names.length - 1)}을 나타냅니다.`,
        'placeValue', '같은 숫자라도 자리에 따라 값이 다름 알기',
      );
    }
    if (variant === 3) {
      const parts = names
        .map((name, i) => `${name}의 자리 ${digits[i]}`)
        .join(', ');
      return makeQuestion(
        lesson, difficulty, index,
        `${parts}인 수는 얼마일까요?`,
        value, [value + 1, value - 1, value + 10],
        `각 자리의 숫자를 자리에 맞게 놓으면 ${value}입니다.`,
        'placeValue', '자리 숫자를 모아 수 만들기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${value}에서 가장 큰 값을 나타내는 자리는 어디일까요?`,
      `${names[0]}의 자리`,
      names.slice(1).map((name) => `${name}의 자리`).concat('모두 같다'),
      `왼쪽으로 갈수록 나타내는 값이 큽니다. 그래서 ${names[0]}의 자리가 가장 큽니다.`,
      'placeValue', '자리의 크기 순서 알기',
    );
  }

  // 뛰어 세어 볼까요
  if (title.includes('뛰어 세')) {
    const step = four
      ? [1, 10, 100, 1000][index % 4]
      : [1, 10, 100][index % 3];
    const start = four ? 1000 + (seed % 6000) : 100 + (seed % 700);
    const third = start + step * 2;

    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${start}, ${start + step}, ${third}, □ 에서 □에 알맞은 수는?`,
        third + step, [third, third + step * 2, start],
        `${step}씩 뛰어 세고 있으므로 다음 수는 ${third + step}입니다.`,
        'number', '뛰어 세어 다음 수 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${start}에서 ${start + step}으로 뛰어 셌습니다. 몇씩 뛰어 센 것일까요?`,
        `${step}씩`, [`${step * 10}씩`, '1씩', `${step + 1}씩`],
        `두 수의 차가 ${step}이므로 ${step}씩 뛰어 센 것입니다.`,
        'number', '뛰어 센 크기 알아내기',
      );
    }
    if (variant === 2) {
      const changed = step === 1 ? '일' : step === 10 ? '십' : step === 100 ? '백' : '천';
      return makeQuestion(
        lesson, difficulty, index,
        `${step}씩 뛰어 세면 어느 자리 숫자가 변할까요?`,
        `${changed}의 자리`,
        ['일의 자리', '십의 자리', '백의 자리'].filter((name) => name !== `${changed}의 자리`).slice(0, 3),
        `${step}씩 뛰어 세면 ${changed}의 자리 숫자가 1씩 커집니다.`,
        'number', '뛰어 셀 때 변하는 자리 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${third}에서 ${step}만큼 거꾸로 뛰어 센 수는?`,
        third - step, [third + step, third, start],
        `거꾸로 뛰어 세면 ${step}만큼 작아지므로 ${third - step}입니다.`,
        'number', '거꾸로 뛰어 세기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${start}에서 ${step}씩 3번 뛰어 세면 얼마일까요?`,
      start + step * 3, [start + step, start + step * 2, start + step * 4],
      `${step}씩 3번이면 ${step * 3}만큼 커지므로 ${start + step * 3}입니다.`,
      'number', '여러 번 뛰어 센 결과 구하기',
    );
  }

  // 수의 크기를 비교해 볼까요
  if (title.includes('크기를 비교')) {
    const a = four ? 1000 + (seed % 8000) : 100 + (seed % 800);
    const b = a + (four ? 100 + (seed % 900) : 10 + (seed % 90));

    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}과 ${b} 중 더 큰 수는?`,
        b, [a, a + b, Math.abs(b - a)],
        `가장 높은 자리부터 차례로 비교하면 ${b}이 더 큽니다.`,
        'number', '두 수의 크기 비교하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '수의 크기를 비교할 때 어느 자리부터 볼까요?',
        '가장 높은 자리부터',
        ['일의 자리부터', '가운데 자리부터', '아무 자리부터'],
        `가장 높은 자리부터 비교하고, 같으면 그다음 자리를 비교합니다.`,
        'placeValue', '크기를 비교하는 차례 알기',
      );
    }
    if (variant === 2) {
      const c = a + (four ? 2000 : 200);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}, ${b}, ${c}을 작은 수부터 차례로 놓으면 가장 앞에 오는 수는?`,
        Math.min(a, b, c), [Math.max(a, b, c), b, a + b],
        `세 수를 비교하면 ${Math.min(a, b, c)}이 가장 작습니다.`,
        'number', '세 수를 작은 수부터 놓기',
      );
    }
    if (variant === 3) {
      const same = four ? 1000 : 100;
      const x = same * 3 + 40 + (seed % 9);
      const y = same * 3 + 50 + (seed % 9);
      return makeQuestion(
        lesson, difficulty, index,
        `${x}과 ${y}처럼 높은 자리 숫자가 같으면 어떻게 비교할까요?`,
        '그다음 자리 숫자를 비교한다',
        ['더 이상 비교할 수 없다', '두 수는 항상 같다', '작은 자리부터 다시 센다'],
        `높은 자리가 같으면 그다음 자리를 비교합니다. ${y}이 더 큽니다.`,
        'placeValue', '높은 자리가 같을 때 비교하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${b}보다 작은 수는 어느 것일까요?`,
      a, [b + 1, b + (four ? 1000 : 100), b],
      `${a}은 ${b}보다 작습니다.`,
      'number', '기준보다 작은 수 찾기',
    );
  }

  // 세 자리 수 / 네 자리 수를 알아볼까요
  if (title.includes('자리 수를 알아')) {
    const h = 1 + (seed % 8);
    const t = seed % 10;
    const o = (seed + 3) % 10;
    const th = four ? 1 + ((seed + 5) % 8) : 0;
    const value = four ? th * 1000 + h * 100 + t * 10 + o : h * 100 + t * 10 + o;
    const parts = four
      ? `1000이 ${th}개, 100이 ${h}개, 10이 ${t}개, 1이 ${o}개`
      : `100이 ${h}개, 10이 ${t}개, 1이 ${o}개`;

    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${parts}인 수는 얼마일까요?`,
        value, [value + 10, value + 100, value - 1],
        `${parts}이면 ${value}입니다.`,
        'placeValue', '모형을 보고 수로 나타내기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}은 100이 몇 개인 수일까요?`,
        `${four ? th * 10 + h : h}개`,
        [`${h + 1}개`, `${t}개`, `${o}개`],
        `${value}에서 100의 자리까지 보면 100이 ${four ? th * 10 + h : h}개입니다.`,
        'placeValue', '수를 자리별 묶음으로 나누기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}에서 십의 자리 숫자는 무엇일까요?`,
        t, [o, h, value % 100],
        `${value}에서 십의 자리 숫자는 ${t}입니다.`,
        'placeValue', '자리별 숫자 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}에서 일의 자리 숫자는 무엇일까요?`,
        o, [t, h, value % 100],
        `${value}에서 일의 자리 숫자는 ${o}입니다.`,
        'placeValue', '일의 자리 숫자 찾기',
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        `${value}보다 1만큼 더 큰 수는?`,
        value + 1, [value - 1, value + 10, value + 100],
        `${value} 다음 수는 ${value + 1}입니다.`,
        'number', '바로 뒤의 수 찾기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${value}보다 1만큼 더 작은 수는?`,
      value - 1, [value + 1, value - 10, value - 100],
      `${value} 앞의 수는 ${value - 1}입니다.`,
      'number', '바로 앞의 수 찾기',
    );
  }

  return null;
};

const numberQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const unitSpecific = placeValueUnitQuestion(lesson, difficulty, index);
  if (unitSpecific) return unitSpecific;

  return legacyNumberQuestion(lesson, difficulty, index);
};

const legacyNumberQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const text = `${lesson.unitTitle} ${lesson.title}`;
  const fourDigit = text.includes('네 자리');
  const base = fourDigit ? 1000 + (n(lesson, index) % 8000) : 100 + (n(lesson, index) % 800);
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  if (text.includes('백을 알아') || text.includes('천을 알아')) {
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

  if ((text.includes('백을 알아') || text.includes('천을 알아')) && variant === 0) {
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

  if ((text.includes('뛰어 세') && variant === 0) || variant === 0) {
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

  if ((text.includes('크기를 비교') && variant <= 1) || variant === 1) {
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

// ── 2-1 3단원 덧셈과 뺄셈 (동아출판 2-1 지도서 206~239쪽) ──────────────────
// 차시마다 다루는 계산 유형이 다릅니다.
//  덧셈⑴ 일의 자리 받아올림 (두 자리)+(한 자리)
//  덧셈⑵ 일의 자리 받아올림 (두 자리)+(두 자리)
//  여러 가지 방법으로 덧셈 십의 자리 받아올림
//  뺄셈⑴ 받아내림 (두 자리)-(한 자리)
//  뺄셈⑵ 받아내림 (몇십)-(몇십몇)
//  여러 가지 방법으로 뺄셈 받아내림 (두 자리)-(두 자리)
const calcUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '덧셈과 뺄셈') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 5, 3);
  const seed = n(lesson, index);

  const carryAsk = (a: number, b: number, tag: 'addition' | 'subtraction', strategy: string) => {
    const answer = tag === 'addition' ? a + b : a - b;
    const sign = tag === 'addition' ? '+' : '-';
    const near = tag === 'addition' ? answer - 10 : answer + 10;
    return makeQuestion(
      lesson, difficulty, index,
      `${a}${sign}${b}는 얼마일까요?`,
      answer,
      [Math.max(0, near), Math.max(0, answer + 1), Math.max(0, answer - 1)],
      tag === 'addition'
        ? `일의 자리부터 더합니다. 일의 자리 합이 10이 넘으면 십의 자리로 1을 받아올림합니다. 답은 ${answer}입니다.`
        : `일의 자리가 부족하면 십의 자리에서 10을 받아내립니다. 답은 ${answer}입니다.`,
      tag, strategy,
    );
  };

  // 단원 도입: 받아올림과 받아내림을 배우기 전이므로 1학년에서 배운
  // 받아올림 없는 계산과 상황 읽기까지만 다룹니다.
  if (title.includes('단원 도입')) {
    const a = 10 * (1 + (seed % 4)) + (seed % 5);
    const b = 10 * (1 + ((seed + 1) % 3)) + ((seed + 2) % 4);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}는 얼마일까요?`,
        a + b, [a + b + 10, Math.max(0, a + b - 10), a + b + 1],
        `일의 자리끼리, 십의 자리끼리 더하면 ${a + b}입니다.`,
        'addition', '자리끼리 더하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a + b}-${b}는 얼마일까요?`,
        a, [a + b, b, a + 10],
        `일의 자리끼리, 십의 자리끼리 빼면 ${a}입니다.`,
        'subtraction', '자리끼리 빼기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '두 수를 모두 합한 수를 구할 때 쓰는 계산은?',
        '덧셈', ['뺄셈', '비교하기', '세어 보기'],
        '모두 몇 개인지 구할 때는 덧셈을 씁니다.',
        'addition', '더하는 상황 알아보기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '남은 수를 구할 때 쓰는 계산은?',
        '뺄셈', ['덧셈', '묶어 세기', '뛰어 세기'],
        '전체에서 없어진 만큼을 덜어 낼 때는 뺄셈을 씁니다.',
        'subtraction', '빼는 상황 알아보기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `딱지 ${a}장에 ${b}장을 더 얻었습니다. 모두 몇 장일까요?`,
      `${a + b}장`, [`${a}장`, `${Math.abs(a - b)}장`, `${a + b + 1}장`],
      `더 얻었으므로 더합니다. ${a}+${b}=${a + b}장입니다.`,
      'addition', '이야기를 보고 계산 고르기',
    );
  }

  // 덧셈 ⑴ : (두 자리 수) + (한 자리 수), 일의 자리 받아올림
  if (title.includes('덧셈을 해 볼까요 ⑴')) {
    const a = 10 * (1 + (seed % 8)) + (5 + (seed % 4));
    const b = 10 - (a % 10) + (1 + (index % 4));
    if (variant === 0) return carryAsk(a, b, 'addition', '일의 자리 받아올림이 있는 덧셈하기');
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 계산할 때 일의 자리 합은 얼마일까요?`,
        (a % 10) + b, [a % 10, b, (a % 10) + b + 10],
        `일의 자리끼리 더하면 ${a % 10}+${b}=${(a % 10) + b}입니다. 10이 넘으므로 받아올림합니다.`,
        'addition', '일의 자리 합 먼저 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '일의 자리 합이 10이 넘으면 어떻게 해야 할까요?',
        '십의 자리로 1을 받아올림한다',
        ['일의 자리에 그대로 쓴다', '십의 자리에서 1을 빼낸다', '계산을 다시 시작한다'],
        `일의 자리에 10이 모이면 십 한 묶음이 되므로 십의 자리로 1을 올려 줍니다.`,
        'addition', '받아올림의 뜻 알기',
      );
    }
    if (variant === 3) {
      const wrong = a + b - 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 ${wrong}이라고 계산했습니다. 무엇을 빠뜨렸을까요?`,
        '받아올림한 1을 더하지 않았다',
        ['일의 자리를 잘못 더했다', '십의 자리를 두 번 더했다', '두 수를 바꾸어 더했다'],
        `받아올림한 1을 십의 자리에 더해야 합니다. 바른 답은 ${a + b}입니다.`,
        'addition', '받아올림 빠뜨린 계산 고치기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `색종이 ${a}장에 ${b}장을 더 샀습니다. 색종이는 모두 몇 장일까요?`,
      `${a + b}장`, [`${a}장`, `${a + b - 10}장`, `${a + b + 1}장`],
      `모두 몇 장인지 구하므로 더합니다. ${a}+${b}=${a + b}장입니다.`,
      'addition', '받아올림 덧셈을 이야기 문제에 쓰기',
    );
  }

  // 덧셈 ⑵ : (두 자리 수) + (두 자리 수), 일의 자리 받아올림
  if (title.includes('덧셈을 해 볼까요 ⑵')) {
    const a = 10 * (1 + (seed % 5)) + (6 + (seed % 3));
    const b = 10 * (1 + ((seed + 2) % 3)) + (10 - (a % 10) + (index % 3));
    if (variant === 0) return carryAsk(a, b, 'addition', '두 자리 수끼리 받아올림 덧셈하기');
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}에서 십의 자리끼리의 합은 얼마일까요?`,
        Math.floor(a / 10) + Math.floor(b / 10),
        [Math.floor(a / 10), Math.floor(b / 10), Math.floor(a / 10) + Math.floor(b / 10) + 1],
        `십의 자리 숫자끼리 더하면 ${Math.floor(a / 10)}+${Math.floor(b / 10)}=${Math.floor(a / 10) + Math.floor(b / 10)}입니다. 여기에 받아올림한 1을 더합니다.`,
        'addition', '십의 자리끼리 더하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '두 자리 수끼리 더할 때 어느 자리부터 계산할까요?',
        '일의 자리부터',
        ['십의 자리부터', '큰 수부터', '아무 자리부터'],
        `일의 자리부터 계산해야 받아올림을 바르게 처리할 수 있습니다.`,
        'addition', '계산하는 차례 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}의 답은 몇십몇일까요?`,
        a + b, [a + b - 10, a + b + 10, a + b - 1],
        `일의 자리부터 더하고 받아올림한 1을 십의 자리에 더하면 ${a + b}입니다.`,
        'addition', '받아올림하여 답 구하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `사탕이 ${a}개, 젤리가 ${b}개 있습니다. 모두 몇 개일까요?`,
      `${a + b}개`, [`${a}개`, `${a + b - 10}개`, `${Math.abs(a - b)}개`],
      `모두 몇 개인지 구하므로 더합니다. ${a}+${b}=${a + b}개입니다.`,
      'addition', '두 자리 수 덧셈을 이야기 문제에 쓰기',
    );
  }

  // 여러 가지 방법으로 덧셈 : 십의 자리 받아올림
  if (title.includes('여러 가지 방법으로 덧셈')) {
    const a = 10 * (5 + (seed % 4)) + (seed % 5);
    const b = 10 * (4 + ((seed + 1) % 4)) + ((seed + 2) % 5);
    if (variant === 0) return carryAsk(a, b, 'addition', '십의 자리 받아올림이 있는 덧셈하기');
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 계산할 때 십의 자리 합이 10이 넘으면 어떻게 할까요?`,
        '백의 자리로 1을 받아올림한다',
        ['십의 자리에 그대로 쓴다', '일의 자리로 내린다', '더하지 않는다'],
        `십의 자리에 10이 모이면 백 한 묶음이 되므로 백의 자리로 올려 줍니다.`,
        'addition', '십의 자리 받아올림 알기',
      );
    }
    if (variant === 2) {
      const round = Math.round(b / 10) * 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 쉽게 계산하려고 ${b}를 ${round}과 ${b - round}로 나누었습니다. 다음에 할 일은?`,
        `${a}에 ${round}을 먼저 더한다`,
        [`${a}에서 ${round}을 뺀다`, `${round}과 ${b - round}을 곱한다`, '두 수를 바꾸어 쓴다'],
        `큰 자리부터 더하면 쉽습니다. ${a}+${round}을 먼저 구하고 남은 ${b - round}을 더합니다.`,
        'addition', '수를 갈라서 더하는 방법 쓰기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}의 답은 얼마일까요?`,
        a + b, [a + b - 100, a + b + 10, a + b - 10],
        `일의 자리, 십의 자리 차례로 더하고 받아올림을 반영하면 ${a + b}입니다.`,
        'addition', '여러 자리 받아올림 덧셈 마무리하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '덧셈을 여러 가지 방법으로 계산하면 좋은 점은?',
      '자기에게 편한 방법을 골라 빠르게 계산할 수 있다',
      ['답이 달라진다', '계산하지 않아도 된다', '항상 더 오래 걸린다'],
      `방법은 달라도 답은 같습니다. 자신에게 편한 방법을 고르면 계산이 쉬워집니다.`,
      'addition', '여러 가지 계산 방법 비교하기',
    );
  }

  // 뺄셈 ⑴ : (두 자리 수) - (한 자리 수), 받아내림
  if (title.includes('뺄셈을 해 볼까요 ⑴')) {
    const a = 10 * (2 + (seed % 8)) + (seed % 4);
    const b = (a % 10) + 1 + (index % 4);
    if (variant === 0) return carryAsk(a, b, 'subtraction', '받아내림이 있는 뺄셈하기');
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}를 계산할 때 일의 자리에서 바로 뺄 수 있을까요?`,
        '뺄 수 없어서 십의 자리에서 받아내린다',
        ['바로 뺄 수 있다', '십의 자리를 먼저 뺀다', '두 수를 바꾸어 뺀다'],
        `일의 자리 ${a % 10}에서 ${b}를 뺄 수 없으므로 십의 자리에서 10을 받아내립니다.`,
        'subtraction', '받아내림이 필요한지 판단하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '십의 자리에서 10을 받아내리면 십의 자리 숫자는 어떻게 될까요?',
        '1만큼 작아진다',
        ['1만큼 커진다', '그대로이다', '0이 된다'],
        `십 한 묶음을 풀어 일의 자리로 보냈으므로 십의 자리는 1 줄어듭니다.`,
        'subtraction', '받아내림 뒤 십의 자리 변화 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}의 답은 얼마일까요?`,
        a - b, [a - b + 10, a - b - 1, a - b + 1],
        `십의 자리에서 10을 받아내려 계산하면 ${a - b}입니다.`,
        'subtraction', '받아내림 뺄셈의 답 구하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `구슬 ${a}개 중에서 ${b}개를 잃어버렸습니다. 남은 구슬은 몇 개일까요?`,
      `${a - b}개`, [`${a}개`, `${a - b + 10}개`, `${a + b}개`],
      `남은 수를 구하므로 뺍니다. ${a}-${b}=${a - b}개입니다.`,
      'subtraction', '받아내림 뺄셈을 이야기 문제에 쓰기',
    );
  }

  // 뺄셈 ⑵ : (몇십) - (몇십몇)
  if (title.includes('뺄셈을 해 볼까요 ⑵')) {
    const a = 10 * (4 + (seed % 6));
    const b = 10 * (1 + (seed % 3)) + (1 + (index % 8));
    if (variant === 0) return carryAsk(a, b, 'subtraction', '몇십에서 몇십몇을 빼기');
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}에서 ${b}를 뺄 때 일의 자리는 어떻게 계산할까요?`,
        '십의 자리에서 10을 받아내려 뺀다',
        ['0에서 그냥 뺀다', '빼지 않고 넘어간다', '일의 자리를 더한다'],
        `${a}의 일의 자리는 0이므로 십의 자리에서 10을 받아내려야 뺄 수 있습니다.`,
        'subtraction', '몇십에서 받아내리기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}의 답은 얼마일까요?`,
        a - b, [a - b + 10, a - b - 10, a - b + 1],
        `십의 자리에서 10을 받아내려 계산하면 ${a - b}입니다.`,
        'subtraction', '몇십에서 빼는 계산 마무리하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}는 십이 몇 개인 수일까요?`,
        `${a / 10}개`, [`${a}개`, `${a / 10 + 1}개`, '10개'],
        `${a}은 십이 ${a / 10}개인 수입니다. 그중 한 묶음을 풀어 받아내립니다.`,
        'subtraction', '몇십의 구성 보고 받아내림 준비하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `색연필 ${a}자루 중 ${b}자루를 나누어 주었습니다. 남은 것은 몇 자루일까요?`,
      `${a - b}자루`, [`${a}자루`, `${a - b + 10}자루`, `${a + b}자루`],
      `남은 수를 구하므로 뺍니다. ${a}-${b}=${a - b}자루입니다.`,
      'subtraction', '몇십에서 빼는 이야기 문제 풀기',
    );
  }

  // 여러 가지 방법으로 뺄셈 : (두 자리) - (두 자리)
  if (title.includes('여러 가지 방법으로 뺄셈')) {
    const a = 10 * (4 + (seed % 6)) + (seed % 4);
    const b = 10 * (1 + (seed % 3)) + ((a % 10) + 1 + (index % 4));
    if (variant === 0) return carryAsk(a, b, 'subtraction', '두 자리 수끼리 받아내림 뺄셈하기');
    if (variant === 1) {
      const round = Math.round(b / 10) * 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}를 쉽게 계산하려고 ${b}를 ${round}과 ${b - round}로 나누었습니다. 다음에 할 일은?`,
        `${a}에서 ${round}을 먼저 뺀다`,
        [`${a}에 ${round}을 더한다`, `${round}과 ${b - round}을 곱한다`, '두 수를 바꾸어 쓴다'],
        `큰 자리부터 빼면 쉽습니다. ${a}-${round}을 먼저 구하고 남은 ${b - round}을 더 뺍니다.`,
        'subtraction', '수를 갈라서 빼는 방법 쓰기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}의 답은 얼마일까요?`,
        a - b, [a - b + 10, a - b - 10, b - a + 10],
        `일의 자리에서 받아내림한 뒤 십의 자리를 계산하면 ${a - b}입니다.`,
        'subtraction', '두 자리 수 뺄셈의 답 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}=${a - b}이 맞는지 어떻게 확인할까요?`,
        `${a - b}에 ${b}를 더해 ${a}가 되는지 본다`,
        [`${a}에 ${b}를 더해 본다`, `${a}에서 ${a - b}를 곱해 본다`, '확인할 수 없다'],
        `뺄셈은 덧셈으로 확인합니다. ${a - b}+${b}=${a}이면 바르게 계산한 것입니다.`,
        'subtraction', '덧셈으로 뺄셈 확인하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '뺄셈을 여러 가지 방법으로 계산하면 좋은 점은?',
      '자기에게 편한 방법을 골라 빠르게 계산할 수 있다',
      ['답이 달라진다', '계산하지 않아도 된다', '항상 더 오래 걸린다'],
      `방법은 달라도 답은 같습니다. 자신에게 편한 방법을 고르면 계산이 쉬워집니다.`,
      'subtraction', '여러 가지 뺄셈 방법 비교하기',
    );
  }

  // 세 수의 계산을 해 볼까요
  if (title.includes('세 수의 계산')) {
    const a = 10 + (seed % 30);
    const b = 5 + (seed % 20);
    const c = 3 + ((seed + 4) % 15);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}+${c}는 얼마일까요?`,
        a + b + c, [a + b, b + c, a + b + c + 10],
        `앞에서부터 차례로 계산합니다. ${a}+${b}=${a + b}, ${a + b}+${c}=${a + b + c}입니다.`,
        'addition', '세 수의 덧셈을 차례로 하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a + b + c}-${b}-${c}는 얼마일까요?`,
        a, [a + b, a - c, a + c],
        `앞에서부터 차례로 뺍니다. ${a + b + c}-${b}=${a + c}, ${a + c}-${c}=${a}입니다.`,
        'subtraction', '세 수의 뺄셈을 차례로 하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}-${c}는 얼마일까요?`,
        a + b - c, [a + b + c, a - b + c, a + b],
        `앞에서부터 계산합니다. ${a}+${b}=${a + b}, ${a + b}-${c}=${a + b - c}입니다.`,
        'addition', '더하고 빼는 세 수의 계산하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '세 수의 계산은 어떤 차례로 할까요?',
        '앞에서부터 차례로',
        ['뒤에서부터 거꾸로', '큰 수부터', '작은 수부터'],
        '세 수의 덧셈과 뺄셈은 앞에서부터 차례로 계산합니다.',
        'addition', '세 수를 계산하는 차례 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `버스에 ${a}명이 타고 있었습니다. ${b}명이 더 타고 ${c}명이 내렸습니다. 지금 버스에는 몇 명이 있을까요?`,
      `${a + b - c}명`, [`${a + b + c}명`, `${a - b + c}명`, `${a + b}명`],
      `타면 더하고 내리면 뺍니다. ${a}+${b}-${c}=${a + b - c}명입니다.`,
      'addition', '세 수의 계산을 이야기 문제에 쓰기',
    );
  }

  // 덧셈과 뺄셈의 관계를 식으로 나타내 볼까요
  if (title.includes('관계를 식으로')) {
    const a = 10 + (seed % 40);
    const b = 5 + (seed % 25);
    const sum = a + b;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}=${sum}을 뺄셈식으로 나타내면?`,
        `${sum}-${b}=${a}`,
        [`${sum}+${b}=${a}`, `${a}-${b}=${sum}`, `${b}-${a}=${sum}`],
        `전체 ${sum}에서 ${b}를 빼면 ${a}가 됩니다.`,
        'subtraction', '덧셈식을 뺄셈식으로 바꾸기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${sum}-${a}=${b}를 덧셈식으로 나타내면?`,
        `${b}+${a}=${sum}`,
        [`${sum}+${a}=${b}`, `${b}-${a}=${sum}`, `${a}+${sum}=${b}`],
        `부분 ${b}와 ${a}를 더하면 전체 ${sum}이 됩니다.`,
        'addition', '뺄셈식을 덧셈식으로 바꾸기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}=${sum}에서 전체를 나타내는 수는?`,
        sum, [a, b, a - b],
        `두 부분을 더한 ${sum}이 전체입니다.`,
        'addition', '전체와 부분 구별하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '덧셈과 뺄셈은 어떤 관계일까요?',
        '한 상황을 두 가지 식으로 쓸 수 있다',
        ['서로 관계가 없다', '덧셈이 더 정확하다', '뺄셈만 쓸 수 있다'],
        '전체와 부분의 관계를 덧셈식으로도, 뺄셈식으로도 나타낼 수 있습니다.',
        'addition', '두 계산의 관계 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${sum}-${b}=${a}가 맞는지 덧셈으로 확인하면?`,
      `${a}+${b}=${sum}`,
      [`${a}-${b}=${sum}`, `${sum}+${a}=${b}`, `${b}+${sum}=${a}`],
      `뺀 결과에 뺀 수를 더해 처음 수가 되면 바르게 계산한 것입니다.`,
      'addition', '덧셈으로 뺄셈 검산하기',
    );
  }

  // □의 값을 구해 볼까요
  if (title.includes('□의 값')) {
    const a = 10 + (seed % 30);
    const b = 5 + (seed % 20);
    const sum = a + b;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+□=${sum}일 때 □에 알맞은 수는?`,
        b, [a, sum, sum + a],
        `전체에서 아는 부분을 빼면 됩니다. ${sum}-${a}=${b}입니다.`,
        'subtraction', '덧셈식에서 □ 구하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `□-${b}=${a}일 때 □에 알맞은 수는?`,
        sum, [a, b, a - b],
        `빼기 전의 수는 결과에 뺀 수를 더해 구합니다. ${a}+${b}=${sum}입니다.`,
        'addition', '뺄셈식에서 처음 수 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${sum}-□=${a}일 때 □에 알맞은 수는?`,
        b, [sum, a, sum + a],
        `빼는 수는 전체에서 결과를 빼면 됩니다. ${sum}-${a}=${b}입니다.`,
        'subtraction', '뺄셈식에서 빼는 수 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '모르는 수를 □로 나타내면 좋은 점은?',
        '식을 세워 답을 찾을 수 있다',
        ['계산하지 않아도 된다', '답이 여러 개가 된다', '문제가 쉬워 보인다'],
        '모르는 수를 □로 두면 식을 세워 차근차근 구할 수 있습니다.',
        'addition', '□를 쓰는 까닭 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `사탕 ${sum}개 중 몇 개를 먹었더니 ${a}개가 남았습니다. 먹은 사탕은 몇 개일까요?`,
      `${b}개`, [`${sum}개`, `${a}개`, `${sum + a}개`],
      `먹은 수를 □로 두면 ${sum}-□=${a}이고, ${sum}-${a}=${b}개입니다.`,
      'subtraction', '□를 이용해 이야기 문제 풀기',
    );
  }

  return null;
};

const operationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number, mode: 'addition' | 'subtraction'): Question => {
  const unitSpecific = calcUnitQuestion(lesson, difficulty, index);
  if (unitSpecific) return unitSpecific;

  return legacyOperationQuestion(lesson, difficulty, index, mode);
};

const legacyOperationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number, mode: 'addition' | 'subtraction'): Question => {
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

// ── 길이 재기 (2-1 4단원 지도서 244~275쪽 / 2-2 3단원 지도서 208~233쪽) ────
// 2-1 차시: 길이 비교 방법 → 여러 가지 단위 → 1cm → 자로 재는 방법 →
//           자로 재기(약 몇 cm) → 어림하기
// 2-2 차시: cm보다 큰 단위(1m=100cm) → 줄자로 재기 → 합 → 차 → 어림⑴⑵
const lengthUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '길이 재기') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 5, 3);
  const seed = n(lesson, index);

  if (title.includes('단원 도입')) {
    const secondSemester = lesson.semester === '2-2';
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        secondSemester
          ? '교실의 긴 벽처럼 아주 긴 길이를 잴 때 어떤 점이 불편할까요?'
          : '연필과 색연필 중 어느 것이 더 긴지 알아보려면 어떻게 할까요?',
        secondSemester ? '짧은 자로는 여러 번 재어야 해서 불편하다' : '두 물건을 나란히 맞대어 본다',
        secondSemester
          ? ['한 번에 잴 수 있다', '길이를 알 수 없다', '무게를 재면 된다']
          : ['무게를 재어 본다', '색깔을 비교한다', '개수를 센다'],
        secondSemester
          ? '짧은 자로 긴 길이를 재면 여러 번 옮겨 재야 해서 불편합니다.'
          : '한쪽 끝을 맞추어 나란히 놓으면 어느 것이 더 긴지 알 수 있습니다.',
        'measurement', secondSemester ? '긴 길이를 잴 때의 불편함 알기' : '길이를 견주어 보기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '길이를 비교할 때 쓰는 말로 알맞은 것은?',
        '더 길다, 더 짧다',
        ['더 무겁다, 더 가볍다', '더 많다, 더 적다', '더 예쁘다, 덜 예쁘다'],
        '길이는 더 길다, 더 짧다로 비교해서 말합니다.',
        'measurement', '길이를 나타내는 말 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '길이를 재야 하는 상황으로 알맞은 것은?',
        '책상에 맞는 책꽂이를 고를 때',
        ['우유가 몇 개인지 셀 때', '오늘이 며칠인지 알 때', '누가 더 무거운지 알 때'],
        '물건이 자리에 맞는지 알아보려면 길이를 재어야 합니다.',
        'measurement', '길이 재기가 필요한 상황 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '두 물건을 맞대어 길이를 비교할 때 지켜야 할 것은?',
        '한쪽 끝을 나란히 맞춘다',
        ['가운데를 맞춘다', '서로 겹쳐 놓는다', '아무렇게나 놓는다'],
        '한쪽 끝을 맞추어야 어느 것이 더 긴지 바르게 알 수 있습니다.',
        'measurement', '맞대어 비교하는 방법 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '길이가 무엇을 나타내는 말인지 알맞은 것은?',
      '얼마나 긴지를 나타내는 말',
      ['얼마나 무거운지', '몇 개인지', '어떤 색인지'],
      '길이는 물건이 얼마나 긴지를 나타냅니다.',
      'measurement', '길이의 뜻 알기',
    );
  }

  if (title.includes('길이를 비교하는 방법')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '옮길 수 없는 두 물건의 길이를 비교하는 방법으로 알맞은 것은?',
        '끈으로 길이를 옮겨 와서 비교한다',
        ['눈으로만 보고 정한다', '무게를 재어 비교한다', '색깔로 비교한다'],
        `직접 맞댈 수 없을 때는 끈이나 종이띠에 길이를 옮겨서 비교합니다.`,
        'measurement', '옮겨서 길이 비교하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '두 물건을 직접 맞대어 길이를 비교할 때 지켜야 할 것은?',
        '한쪽 끝을 나란히 맞춘다',
        ['가운데를 맞춘다', '아무렇게나 놓는다', '서로 겹쳐 놓는다'],
        `한쪽 끝을 맞추어야 어느 것이 더 긴지 바르게 알 수 있습니다.`,
        'measurement', '맞대어 비교할 때의 약속 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '끈으로 옮겨 비교하면 무엇을 알 수 있을까요?',
        '어느 것이 더 긴지 알 수 있다',
        ['얼마나 긴지 수로 알 수 있다', '무게를 알 수 있다', '개수를 알 수 있다'],
        `끈으로 옮기면 길고 짧음은 알 수 있지만 정확한 길이는 자로 재야 합니다.`,
        'measurement', '비교로 알 수 있는 것 구별하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '교실 문의 높이와 창문의 높이를 비교하려면 어떻게 할까요?',
        '끈에 옮겨 표시한 뒤 견주어 본다',
        ['문을 떼어 옮긴다', '창문을 떼어 옮긴다', '비교할 수 없다'],
        `옮길 수 없는 것은 끈에 길이를 옮겨 표시한 다음 비교합니다.`,
        'measurement', '생활 속 길이 비교하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '길이를 비교할 때 쓰는 말로 알맞은 것은?',
      '더 길다, 더 짧다',
      ['더 무겁다, 더 가볍다', '더 많다, 더 적다', '더 넓다, 더 좁다'],
      `길이를 비교할 때는 더 길다, 더 짧다로 말합니다.`,
      'measurement', '길이를 비교하는 말 알기',
    );
  }

  if (title.includes('여러 가지 단위')) {
    const clips = 4 + (seed % 6);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `연필의 길이가 클립으로 ${clips}번이었습니다. 이때 클립은 무엇일까요?`,
        '길이를 재는 단위',
        ['재는 물건의 이름', '길이의 정확한 값', '무게를 재는 것'],
        `클립처럼 반복해서 재는 데 쓰는 것을 단위라고 합니다.`,
        'measurement', '단위의 뜻 알기',
        // 자를 배우기 전 차시입니다. 그림 짐작에 맡기면 자가 나옵니다.
        unitMeasureVisualFor('연필', '클립', clips),
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '같은 물건을 뼘으로 재면 사람마다 잰 수가 다른 까닭은?',
        '사람마다 뼘의 길이가 다르기 때문',
        ['물건이 늘어나기 때문', '잘못 세었기 때문', '뼘은 단위가 아니기 때문'],
        `뼘은 사람마다 길이가 달라서 잰 횟수도 달라집니다.`,
        'measurement', '단위가 다르면 결과가 달라짐 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '같은 길이를 짧은 단위로 재면 잰 횟수는 어떻게 될까요?',
        '더 많아진다', ['더 적어진다', '변하지 않는다', '알 수 없다'],
        `단위가 짧을수록 여러 번 재야 하므로 잰 횟수가 많아집니다.`,
        'measurement', '단위 길이와 잰 횟수의 관계 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `책상의 길이를 뼘으로 ${clips}번 쟀습니다. 이 길이를 친구에게 정확히 알려 주려면?`,
        '누구나 같은 단위로 재어 알려 준다',
        ['뼘의 수만 말해 준다', '눈으로 본 대로 말한다', '알려 줄 수 없다'],
        `사람마다 다른 단위로는 정확히 알려 줄 수 없어 공통 단위가 필요합니다.`,
        'measurement', '공통 단위가 필요한 까닭 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '길이를 잴 때 단위로 쓰기에 알맞지 않은 것은?',
      '길이가 자꾸 변하는 것',
      ['클립', '지우개', '연필'],
      `단위는 길이가 늘 같아야 합니다. 길이가 변하면 잴 때마다 결과가 달라집니다.`,
      'measurement', '단위로 알맞은 것 고르기',
    );
  }

  if (title.includes('1cm를 알아')) {
    const times = 3 + (seed % 8);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '사람마다 뼘의 길이가 달라 불편했습니다. 이를 해결하는 방법은?',
        '누구나 똑같은 단위를 정해서 쓴다',
        ['가장 큰 뼘으로 잰다', '뼘을 쓰지 않는다', '길이를 재지 않는다'],
        '누구나 같은 단위를 쓰면 잰 길이를 서로 정확히 알려 줄 수 있습니다.',
        'measurement', '공통 단위가 필요한 까닭 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `1cm가 ${times}번 이어진 길이는 얼마일까요?`,
        `${times}cm`, [`1cm`, `${times + 1}cm`, `${times}번`],
        `1cm가 ${times}번이면 ${times}cm입니다.`,
        'measurement', '1cm를 이어 길이 나타내기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '1cm를 바르게 읽은 것은?',
        '1센티미터', ['1미터', '1번', '일센치'],
        'cm는 센티미터라고 읽습니다.',
        'measurement', 'cm 읽고 쓰기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${times}cm는 1cm가 몇 번 이어진 길이일까요?`,
        `${times}번`, [`1번`, `${times + 1}번`, `${times}cm`],
        `${times}cm는 1cm가 ${times}번 이어진 길이입니다.`,
        'measurement', 'cm로 나타낸 길이의 뜻 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '길이를 cm로 나타내면 좋은 점은?',
      '누구에게나 같은 길이를 알려 줄 수 있다',
      ['길이가 짧아진다', '재지 않아도 된다', '물건이 커진다'],
      'cm는 누구나 같은 길이이므로 잰 결과를 정확히 전할 수 있습니다.',
      'measurement', 'cm를 쓰면 좋은 점 알기',
    );
  }

  if (title.includes('자로 길이를 재는 방법')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '자로 길이를 잴 때 물건의 한끝을 어디에 맞추어야 할까요?',
        '자의 0', ['자의 1', '자의 아무 곳', '자의 끝'],
        `물건의 한끝을 자의 0에 맞추어야 눈금을 그대로 읽을 수 있습니다.`,
        'measurement', '자의 0에 맞추어 재기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '물건의 한끝을 자의 2에 맞추어 재고 끝이 9였습니다. 이 물건의 길이는?',
        '7cm', ['9cm', '2cm', '11cm'],
        `시작 눈금을 빼야 합니다. 9-2=7cm입니다.`,
        'measurement', '시작 눈금이 0이 아닐 때 길이 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '자로 길이를 잴 때 자를 어떻게 놓아야 할까요?',
        '물건과 자를 나란히 붙여 놓는다',
        ['비스듬히 놓는다', '물건에서 떨어뜨려 놓는다', '자를 세워 놓는다'],
        `자를 물건과 나란히 붙여 놓아야 바르게 잴 수 있습니다.`,
        'measurement', '자를 바르게 놓기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '자의 큰 눈금 한 칸은 얼마를 나타낼까요?',
        '1cm', ['1m', '10cm', '1번'],
        `자의 큰 눈금 한 칸이 1cm입니다.`,
        'measurement', '자의 눈금이 뜻하는 길이 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '자로 잰 길이를 읽을 때 보는 것은?',
      '물건의 끝이 닿은 눈금',
      ['물건의 가운데 눈금', '자의 맨 끝 숫자', '자의 색깔'],
      `물건의 끝이 닿은 눈금을 읽으면 길이를 알 수 있습니다.`,
      'measurement', '자의 눈금 읽기',
    );
  }

  if (title.includes('자로 길이를 재어') && lesson.semester === '2-1') {
    const cm = 4 + (seed % 12);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `물건의 끝이 자의 ${cm}과 ${cm + 1} 사이에 있고 ${cm}에 더 가깝습니다. 길이는?`,
        `약 ${cm}cm`, [`약 ${cm + 1}cm`, `${cm + 1}cm`, `약 ${cm - 1}cm`],
        `눈금 사이에 있을 때는 더 가까운 눈금을 읽고 약 몇 cm라고 합니다.`,
        'measurement', '약 몇 cm로 읽기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '길이를 잴 때 약 몇 cm라고 말하는 때는?',
        '물건의 끝이 눈금 사이에 있을 때',
        ['눈금에 정확히 맞을 때', '자가 짧을 때', '물건이 클 때'],
        `끝이 눈금과 정확히 맞지 않을 때 가까운 눈금으로 약 몇 cm라고 읽습니다.`,
        'measurement', '약 몇 cm를 쓰는 때 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `길이가 ${cm}cm인 물건은 1cm가 몇 번 들어간 길이일까요?`,
        `${cm}번`, [`${cm + 1}번`, '1번', `${cm - 1}번`],
        `${cm}cm는 1cm가 ${cm}번 반복된 길이입니다.`,
        'measurement', 'cm의 뜻과 잰 값 잇기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${cm}cm를 바르게 읽은 것은?`,
        `${cm}센티미터`, [`${cm}미터`, `${cm}밀리미터`, `${cm}번`],
        `cm는 센티미터라고 읽습니다.`,
        'measurement', 'cm 읽기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `자로 잰 길이가 ${cm}cm입니다. 이보다 1cm 더 긴 물건의 길이는?`,
      `${cm + 1}cm`, [`${cm - 1}cm`, `${cm}cm`, `${cm + 2}cm`],
      `1cm 더 길므로 ${cm}+1=${cm + 1}cm입니다.`,
      'measurement', '잰 길이를 비교하기',
    );
  }

  if (title.includes('줄자') || (title.includes('자로 길이를 재어') && lesson.semester === '2-2')) {
    const m = 1 + (seed % 4);
    const cm = 10 + (seed % 80);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '교실의 긴 벽처럼 긴 길이를 잴 때 알맞은 도구는?',
        '줄자', ['30cm 자', '연필', '지우개'],
        `줄자는 길게 늘어나므로 긴 길이를 한 번에 잴 수 있습니다.`,
        'measurement', '긴 길이를 재는 도구 고르기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `줄자로 잰 길이가 ${m * 100 + cm}cm였습니다. 몇 m 몇 cm일까요?`,
        `${m}m ${cm}cm`, [`${m}m`, `${m + 1}m ${cm}cm`, `${cm}m ${m}cm`],
        `100cm가 1m이므로 ${m * 100 + cm}cm는 ${m}m ${cm}cm입니다.`,
        'measurement', '잰 길이를 m와 cm로 나타내기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '줄자로 길이를 잴 때 시작점을 어디에 맞출까요?',
        '줄자의 0', ['줄자의 1', '줄자의 가운데', '아무 곳'],
        `줄자도 자와 같이 0에 맞추어 재야 합니다.`,
        'measurement', '줄자를 바르게 사용하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${m}m ${cm}cm는 몇 cm일까요?`,
        `${m * 100 + cm}cm`, [`${m + cm}cm`, `${m * 10 + cm}cm`, `${cm}cm`],
        `1m는 100cm이므로 ${m}m는 ${m * 100}cm이고, 여기에 ${cm}cm를 더하면 ${m * 100 + cm}cm입니다.`,
        'measurement', 'm와 cm를 cm로 바꾸기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '줄자와 30cm 자의 다른 점은?',
      '줄자는 더 긴 길이를 잴 수 있다',
      ['줄자는 더 짧다', '눈금이 없다', '길이를 잴 수 없다'],
      `줄자는 길고 휘어져서 긴 물건이나 둥근 물건도 잴 수 있습니다.`,
      'measurement', '재는 도구를 상황에 맞게 고르기',
    );
  }

  if (title.includes('어림해 볼까요 ⑴') || title.includes('길이를 어림하고')) {
    const span = 10 + (seed % 10);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '내 몸을 이용해 길이를 어림할 때 쓸 수 있는 것은?',
        '뼘, 걸음, 양팔 길이',
        ['눈의 크기', '목소리', '머리카락 색깔'],
        '뼘이나 걸음처럼 몸의 부분은 늘 가지고 다닐 수 있어 어림에 쓰기 좋습니다.',
        'measurement', '몸의 부분으로 어림하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `한 뼘이 약 ${span}cm인 사람이 두 뼘으로 잰 길이는 약 얼마일까요?`,
        `약 ${span * 2}cm`, [`약 ${span}cm`, `약 ${span * 3}cm`, `약 ${span + 2}cm`],
        `한 뼘이 약 ${span}cm이므로 두 뼘은 약 ${span * 2}cm입니다.`,
        'measurement', '뼘으로 길이 어림하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '어림한 길이를 말할 때 쓰는 말은?',
        '약', ['정확히', '반드시', '모두'],
        '어림한 길이는 정확한 값이 아니므로 약 몇 cm라고 말합니다.',
        'measurement', '어림한 값을 말하는 방법 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '어림한 길이와 자로 잰 길이가 다를 때 알맞은 생각은?',
        '어림은 대강의 값이라 다를 수 있다',
        ['어림이 틀렸으니 하면 안 된다', '자가 잘못되었다', '길이가 변했다'],
        '어림은 대강 짐작하는 것이므로 잰 값과 조금 다를 수 있습니다.',
        'measurement', '어림과 잰 값의 차이 이해하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '어림을 잘하려면 무엇이 필요할까요?',
      '알고 있는 길이를 기준으로 삼는 것',
      ['빠르게 말하는 것', '눈을 감는 것', '아무 수나 대는 것'],
      '1cm나 한 뼘처럼 아는 길이를 기준으로 삼으면 어림이 정확해집니다.',
      'measurement', '어림의 기준 정하기',
    );
  }

  if (title.includes('어림해 볼까요 ⑵')) {
    const known = 10 * (1 + (seed % 5));
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `길이가 ${known}cm인 색 테이프를 기준으로 물건의 길이를 어림하려고 합니다. 알맞은 방법은?`,
        `${known}cm가 몇 번쯤 들어가는지 본다`,
        ['눈을 감고 생각한다', '무게를 재어 본다', '색깔을 비교한다'],
        `아는 길이가 몇 번 들어가는지 보면 전체 길이를 어림할 수 있습니다.`,
        'measurement', '아는 길이를 기준으로 어림하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${known}cm짜리가 3번쯤 들어가는 물건의 길이는 약 얼마일까요?`,
        `약 ${known * 3}cm`, [`약 ${known}cm`, `약 ${known * 2}cm`, `약 ${known + 3}cm`],
        `${known}cm가 3번이면 약 ${known * 3}cm입니다.`,
        'measurement', '기준 길이를 여러 번 써서 어림하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '1m를 어림할 때 기준으로 삼기 좋은 것은?',
        '양팔을 벌린 길이',
        ['새끼손가락 길이', '연필 한 자루', '지우개 하나'],
        '어른이나 아이의 양팔을 벌린 길이는 1m와 비슷해 기준으로 쓰기 좋습니다.',
        'measurement', '1m를 어림하는 기준 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '어림한 뒤에 자로 재어 보면 좋은 점은?',
        '어림이 얼마나 가까웠는지 알 수 있다',
        ['어림을 안 해도 된다', '자가 필요 없어진다', '길이가 정확해진다'],
        '재어 보면 어림이 얼마나 가까웠는지 알 수 있어 다음 어림이 더 정확해집니다.',
        'measurement', '어림한 뒤 확인하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '긴 거리를 어림할 때 알맞은 기준은?',
      '걸음 수',
      ['손톱 길이', '연필 길이', '지우개 길이'],
      '긴 거리는 걸음처럼 큰 기준으로 어림해야 편합니다.',
      'measurement', '길이에 맞는 어림 기준 고르기',
    );
  }

  if (title.includes('길이의 합')) {
    const a = 1 + (seed % 4);
    const acm = 10 + (seed % 40);
    const b = 1 + ((seed + 1) % 3);
    const bcm = 10 + ((seed + 5) % 40);
    const sumCm = acm + bcm;
    const carry = sumCm >= 100 ? 1 : 0;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}m ${acm}cm와 ${b}m ${bcm}cm를 이으면 길이는 얼마일까요?`,
        `${a + b + carry}m ${sumCm - carry * 100}cm`,
        [`${a + b}m ${sumCm}cm`, `${a + b}m`, `${a + b + 1}m ${sumCm}cm`],
        `m는 m끼리, cm는 cm끼리 더합니다. cm가 100이 넘으면 1m로 바꾸어 올립니다.`,
        'measurement', 'm와 cm를 각각 더하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '길이의 합을 구할 때 어떻게 더할까요?',
        'm는 m끼리, cm는 cm끼리 더한다',
        ['모두 섞어서 더한다', 'm만 더한다', 'cm만 더한다'],
        `단위가 같은 것끼리 더해야 바른 답이 나옵니다.`,
        'measurement', '길이를 더하는 방법 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${acm}cm와 ${bcm}cm를 더하면 얼마일까요?`,
        `${sumCm}cm`, [`${acm}cm`, `${sumCm + 10}cm`, `${Math.abs(acm - bcm)}cm`],
        `같은 단위끼리 더하면 ${acm}+${bcm}=${sumCm}cm입니다.`,
        'measurement', 'cm끼리 더하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '길이를 더했더니 cm가 100보다 컸습니다. 어떻게 해야 할까요?',
        '100cm를 1m로 바꾸어 m에 더한다',
        ['그대로 둔다', 'cm를 지운다', 'm에서 1을 뺀다'],
        `100cm가 1m이므로 넘는 만큼 m로 바꾸어 올려 줍니다.`,
        'measurement', 'cm가 넘칠 때 m로 바꾸기',
      );
    }
    const joinedCm = acm + bcm;
    const joinedCarry = joinedCm >= 100 ? 1 : 0;
    return makeQuestion(
      lesson, difficulty, index,
      `끈 ${a}m ${acm}cm에 ${bcm}cm를 더 이었습니다. 전체 길이는?`,
      `${a + joinedCarry}m ${joinedCm - joinedCarry * 100}cm`,
      [`${a}m ${acm}cm`, `${a}m ${joinedCm}cm`, `${a + 1}m ${joinedCm}cm`],
      `cm끼리 더하면 ${acm}+${bcm}=${joinedCm}cm입니다. 100cm가 넘으면 1m로 바꾸어 올립니다.`,
      'measurement', '길이를 이어 붙인 전체 구하기',
    );
  }

  if (title.includes('길이의 차')) {
    const a = 3 + (seed % 4);
    const acm = 40 + (seed % 50);
    const b = 1 + ((seed + 1) % 2);
    const bcm = 10 + ((seed + 5) % 30);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}m ${acm}cm와 ${b}m ${bcm}cm의 차는 얼마일까요?`,
        `${a - b}m ${acm - bcm}cm`,
        [`${a + b}m ${acm + bcm}cm`, `${a - b}m`, `${a - b + 1}m ${acm - bcm}cm`],
        `m는 m끼리, cm는 cm끼리 뺍니다. ${a - b}m ${acm - bcm}cm입니다.`,
        'measurement', 'm와 cm를 각각 빼기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '길이의 차를 구할 때 어떻게 뺄까요?',
        'm는 m끼리, cm는 cm끼리 뺀다',
        ['모두 섞어서 뺀다', 'm만 뺀다', 'cm만 뺀다'],
        `단위가 같은 것끼리 빼야 바른 답이 나옵니다.`,
        'measurement', '길이를 빼는 방법 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${acm}cm에서 ${bcm}cm를 빼면 얼마일까요?`,
        `${acm - bcm}cm`, [`${acm + bcm}cm`, `${acm}cm`, `${bcm}cm`],
        `같은 단위끼리 빼면 ${acm}-${bcm}=${acm - bcm}cm입니다.`,
        'measurement', 'cm끼리 빼기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}m ${acm}cm인 줄과 ${b}m ${bcm}cm인 줄 중 어느 것이 더 길까요?`,
        `${a}m ${acm}cm인 줄`,
        [`${b}m ${bcm}cm인 줄`, '두 줄의 길이가 같다', '비교할 수 없다'],
        `m를 먼저 비교합니다. ${a}m가 ${b}m보다 크므로 더 깁니다.`,
        'measurement', 'm를 먼저 보고 길이 비교하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${a}m ${acm}cm인 끈에서 ${bcm}cm를 잘라 냈습니다. 남은 길이는?`,
      `${a}m ${acm - bcm}cm`,
      [`${a}m ${acm}cm`, `${a - 1}m ${acm - bcm}cm`, `${a}m ${acm + bcm}cm`],
      `cm끼리 빼면 ${acm}-${bcm}=${acm - bcm}cm이므로 ${a}m ${acm - bcm}cm입니다.`,
      'measurement', '잘라 낸 뒤 남은 길이 구하기',
    );
  }

  return null;
};

const measurementQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const unitSpecific = lengthUnitQuestion(lesson, difficulty, index);
  if (unitSpecific) return unitSpecific;

  return legacyMeasurementQuestion(lesson, difficulty, index);
};

const legacyMeasurementQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
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

  if (text.includes('더 큰 단위') && variant === 0) {
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

  if ((text.includes('m와 cm') || text.includes('더 큰 단위') || text.includes('자로 길이를 재어')) && variant <= 2) {
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

  if (text.includes('길이의 합') && variant === 0) {
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

  if ((text.includes('길이의 차') && variant <= 1) || variant === 1) {
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

  if (text.includes('길이의 합') && variant === 2) {
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

// ── 2-1 5단원 분류하기 (동아출판 2-1 지도서 280~301쪽) ──────────────────────
// 차시: 분류는 어떻게 할까요(분명한 기준) → 기준에 따라 분류 → 분류하고 세기 →
//       분류한 결과 말하기
const sortingUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '분류하기') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 5, 3);
  // 세 수는 서로 달라야 '가장 많은/적은 것'과 '몇 개 더 많은지'의 답이 하나로 정해집니다.
  const steps = [1 + (index % 3), 4 + (index % 3), 7 + (index % 2)];
  const rotate3 = index % 3;
  const red = steps[rotate3];
  const blue = steps[(rotate3 + 1) % 3];
  const green = steps[(rotate3 + 2) % 3];
  const total = red + blue + green;
  const colours = [
    { name: '빨강', count: red },
    { name: '파랑', count: blue },
    { name: '초록', count: green },
  ];
  const mostColour = mostOf(colours);
  const leastColour = leastOf(colours);
  const [moreColour, lessColour] = red >= blue
    ? [{ name: '빨강', count: red }, { name: '파랑', count: blue }]
    : [{ name: '파랑', count: blue }, { name: '빨강', count: red }];

  if (title.includes('단원 도입')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '어질러진 학용품을 정리할 때 하면 좋은 일은?',
        '같은 것끼리 모은다',
        ['상자에 아무렇게나 넣는다', '큰 것만 남긴다', '색을 칠한다'],
        '같은 것끼리 모아 두면 정리도 쉽고 찾기도 쉽습니다.',
        'classification', '같은 것끼리 모으기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '생활에서 물건을 나누어 놓은 곳으로 알맞은 것은?',
        '가게의 물건 진열대',
        ['빈 운동장', '하늘', '창문'],
        '가게에서는 비슷한 물건끼리 모아 놓아 찾기 쉽게 합니다.',
        'classification', '생활 속 분류 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '물건을 나누어 놓으면 좋은 점은?',
        '찾고 싶은 것을 쉽게 찾을 수 있다',
        ['물건이 많아진다', '물건이 예뻐진다', '물건이 커진다'],
        '나누어 놓으면 필요한 것을 빨리 찾을 수 있습니다.',
        'classification', '분류하면 좋은 점 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '색연필과 크레파스를 함께 두었다면 무엇을 보고 나눈 것일까요?',
        '쓰임이 비슷한 것끼리',
        ['크기가 큰 것끼리', '값이 비싼 것끼리', '새것끼리'],
        '둘 다 색칠할 때 쓰는 물건이므로 쓰임이 비슷합니다.',
        'classification', '나눈 까닭 생각하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '옷장에 옷을 넣을 때 하면 좋은 방법은?',
      '비슷한 옷끼리 모아 넣는다',
      ['아무 칸에나 넣는다', '큰 옷만 넣는다', '색을 칠해 둔다'],
      '비슷한 것끼리 모아 두면 옷을 쉽게 찾을 수 있습니다.',
      'classification', '생활에서 나누어 넣기',
    );
  }

  if (title.includes('분류는 어떻게')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류 기준으로 알맞은 것은?',
        '누가 나누어도 결과가 같은 기준',
        ['예쁜 것과 예쁘지 않은 것', '내가 좋아하는 것', '멋있어 보이는 것'],
        `분류 기준은 분명해야 합니다. 사람마다 달라지는 기준은 알맞지 않습니다.`,
        'classification', '분명한 분류 기준 고르기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '옷을 "예쁜 옷"과 "안 예쁜 옷"으로 나누면 안 되는 까닭은?',
        '사람마다 생각이 달라 결과가 달라진다',
        ['옷이 너무 많아서', '색깔이 많아서', '옷은 나눌 수 없어서'],
        `예쁘다는 기준은 사람마다 다르므로 분류 기준으로 알맞지 않습니다.`,
        'classification', '분명하지 않은 기준 알아보기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '단추를 분류하는 기준으로 알맞은 것은?',
        '구멍의 수', ['단추의 값', '좋아하는 정도', '만든 사람'],
        `구멍의 수는 누가 보아도 같으므로 분명한 분류 기준입니다.`,
        'classification', '알맞은 기준 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류를 하면 좋은 점은?',
        '필요한 것을 쉽게 찾을 수 있다',
        ['물건이 많아진다', '물건이 예뻐진다', '수를 몰라도 된다'],
        `같은 것끼리 모아 두면 찾기 쉽고 정리도 편합니다.`,
        'classification', '분류하는 까닭 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '분류할 때 한 물건은 몇 곳에 들어가야 할까요?',
      '한 곳에만', ['두 곳에', '여러 곳에', '어디든 상관없다'],
      `기준이 분명하면 한 물건은 한 곳에만 들어갑니다. 겹치면 안 됩니다.`,
      'classification', '겹치지 않게 나누기',
    );
  }

  if (title.includes('기준에 따라')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '색깔을 기준으로 분류하면 어떻게 나누어야 할까요?',
        '같은 색깔끼리 모은다',
        ['같은 모양끼리 모은다', '큰 것부터 모은다', '아무렇게나 모은다'],
        `기준이 색깔이면 색깔만 보고 같은 것끼리 모읍니다.`,
        'classification', '정해진 기준대로 나누기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '같은 물건을 모양으로 분류할 때와 색깔로 분류할 때 결과는?',
        '기준이 다르면 묶음도 달라진다',
        ['항상 같다', '기준과 상관없다', '나눌 수 없다'],
        `기준을 바꾸면 묶는 방법도 달라집니다.`,
        'classification', '기준을 바꾸면 결과가 달라짐 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류할 때 빠뜨린 물건이 있으면 어떻게 될까요?',
        '전체 수가 실제보다 적어진다',
        ['전체 수가 많아진다', '아무 문제 없다', '기준이 바뀐다'],
        `빠뜨리면 센 수가 실제보다 적어지므로 빠짐없이 나누어야 합니다.`,
        'classification', '빠짐없이 분류하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '연필, 지우개, 공책을 한 묶음으로 분류했습니다. 알맞은 기준은?',
        '쓰임', ['색깔', '맛', '무게'],
        `연필, 지우개, 공책은 모두 공부할 때 쓰는 물건이므로 쓰임을 기준으로 묶은 것입니다.`,
        'classification', '묶음을 보고 기준 찾기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '분류를 마친 뒤 확인할 것은?',
      '빠지거나 겹친 것이 없는지',
      ['묶음이 예쁜지', '묶음이 많은지', '순서가 맞는지'],
      `분류가 끝나면 빠진 것과 겹친 것이 없는지 확인합니다.`,
      'classification', '분류 결과 점검하기',
    );
  }

  if (title.includes('분류하고 세어')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `색깔별로 분류한 딱지가 빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개입니다. 딱지는 모두 몇 개일까요?`,
        `${total}개`, [`${red + blue}개`, `${blue + green}개`, `${total + 1}개`],
        `분류한 결과의 전체 수는 항목별 수를 모두 더합니다. ${red}+${blue}+${green}=${total}개입니다.`,
        'data', '분류한 결과의 전체 수 구하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류하여 셀 때 바르게 세는 방법은?',
        '센 것에 표시를 하면서 센다',
        ['눈으로만 보고 센다', '큰 것부터 센다', '두 번씩 센다'],
        `센 것에 표시를 해야 빠뜨리거나 두 번 세지 않습니다.`,
        'classification', '표시하며 빠짐없이 세기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `빨강 ${red}개, 파랑 ${blue}개입니다. ${josa(moreColour.name, '은', '는')} ${lessColour.name}보다 몇 개 더 많을까요?`,
        `${moreColour.count - lessColour.count}개`,
        [`${red + blue}개`, `${lessColour.count}개`, `${moreColour.count}개`],
        `더 많은 정도는 두 수의 차로 구합니다. ${moreColour.count}-${lessColour.count}=${moreColour.count - lessColour.count}개입니다.`,
        'data', '분류 결과의 차 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류하여 센 결과를 적어 두면 좋은 점은?',
        '어느 것이 많고 적은지 한눈에 알 수 있다',
        ['물건이 늘어난다', '기준이 바뀐다', '세지 않아도 된다'],
        `센 결과를 적어 두면 많고 적음을 쉽게 비교할 수 있습니다.`,
        'classification', '센 결과를 적는 까닭 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `딱지를 세었더니 빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개였습니다. 가장 많은 색은?`,
      mostColour.name,
      colours.filter((item) => item.name !== mostColour.name).map((item) => item.name).concat('모두 같음'),
      `세 수를 비교하면 ${mostColour.count}개인 ${josa(mostColour.name, '이', '가')} 가장 많습니다.`,
      'data', '분류하여 센 뒤 비교하기',
    );
  }

  if (title.includes('분류한 결과를 말해')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개로 분류했습니다. 가장 적은 색은?`,
        leastColour.name,
        colours.filter((item) => item.name !== leastColour.name).map((item) => item.name).concat('모두 같음'),
        `세 수를 비교하면 ${leastColour.count}개인 ${josa(leastColour.name, '이', '가')} 가장 적습니다.`,
        'data', '분류 결과에서 가장 적은 것 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류한 결과를 말할 때 알맞은 것은?',
        '가장 많은 것과 가장 적은 것을 함께 말한다',
        ['좋아하는 것만 말한다', '색깔만 말한다', '적은 것은 빼고 말한다'],
        `분류 결과는 많고 적음, 전체 수처럼 알 수 있는 사실을 말합니다.`,
        'classification', '분류 결과를 말하는 방법 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `분류한 결과가 빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개입니다. 알 수 있는 것은?`,
        '색깔별 개수와 많고 적음',
        ['딱지를 만든 사람', '딱지의 무게', '딱지를 산 날짜'],
        `분류 결과로는 색깔별 개수와 어느 것이 많고 적은지를 알 수 있습니다.`,
        'data', '분류 결과로 알 수 있는 것 구별하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '분류 결과를 보고 다음에 무엇을 더 준비하면 좋을지 알 수 있는 까닭은?',
        '무엇이 적은지 알 수 있기 때문',
        ['색깔이 예뻐서', '수가 많아서', '기준이 바뀌어서'],
        `적은 것이 무엇인지 알면 더 준비할 것을 정할 수 있습니다.`,
        'classification', '분류 결과를 생활에 쓰기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개입니다. 파랑과 초록을 합하면 몇 개일까요?`,
      `${blue + green}개`, [`${total}개`, `${red}개`, `${blue}개`],
      `두 색의 수를 더하면 ${blue}+${green}=${blue + green}개입니다.`,
      'data', '분류 결과의 일부를 합하기',
    );
  }

  return null;
};

const classificationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const unitSpecific = sortingUnitQuestion(lesson, difficulty, index);
  if (unitSpecific) return unitSpecific;

  return legacyClassificationQuestion(lesson, difficulty, index);
};

const legacyClassificationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
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

// ── 2-2 2단원 곱셈구구 (동아출판 2-2 지도서 170~203쪽) ──────────────────────
// 차시마다 다루는 단이 정해져 있습니다. 2단 / 5단 / 3단·6단 / 4단·8단 / 7단 /
// 9단 / 1단과 0의 곱 / 곱셈표 / 곱셈구구로 문제 해결.
const dansOfLesson = (title: string): number[] => {
  const found = [2, 3, 4, 5, 6, 7, 8, 9].filter((dan) => title.includes(`${dan}단`));
  return found.length ? found : [];
};

const timesTableQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '곱셈구구') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 6, 3);

  // 1단 곱셈구구와 0의 곱
  if (title.includes('1단')) {
    const k = 2 + (index % 8);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `1×${k}는 얼마일까요?`,
        k, [1, k + 1, 0],
        `1단은 1이 ${k}묶음이므로 곱한 결과가 그대로 ${k}입니다.`,
        'multiplication', '1단 곱셈구구 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `0×${k}는 얼마일까요?`,
        0, [k, 1, k + 1],
        `0이 ${k}묶음이면 하나도 없으므로 0입니다.`,
        'multiplication', '0의 곱 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${k}×0은 얼마일까요?`,
        0, [k, 1, k + 1],
        `${k}가 0묶음이면 하나도 없으므로 0입니다.`,
        'multiplication', '어떤 수와 0의 곱 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '1과 어떤 수를 곱하면 결과가 어떻게 될까요?',
        '곱하는 수가 그대로 나온다',
        ['항상 1이 된다', '항상 0이 된다', '두 배가 된다'],
        `1단은 1이 여러 묶음인 것이므로 곱하는 수가 그대로 나옵니다.`,
        'multiplication', '1단의 성질 알기',
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        '0과 어떤 수를 곱하면 결과가 어떻게 될까요?',
        '항상 0이 된다',
        ['곱하는 수가 그대로 나온다', '항상 1이 된다', '두 배가 된다'],
        `0은 하나도 없다는 뜻이므로 몇 묶음이 있어도 0입니다.`,
        'multiplication', '0의 곱의 성질 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `1×${k}와 ${k}×1의 결과를 비교하면?`,
      '두 값이 같다',
      [`1×${k}가 더 크다`, `${k}×1이 더 크다`, '비교할 수 없다'],
      `곱하는 두 수의 순서를 바꾸어도 결과는 같습니다. 둘 다 ${k}입니다.`,
      'multiplication', '순서를 바꾸어 곱하기',
    );
  }

  // 곱셈표를 만들어 볼까요
  if (title.includes('곱셈표')) {
    const a = 2 + (index % 7);
    const b = 2 + ((index + 3) % 7);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}와 ${b}가 만나는 칸에 알맞은 수는?`,
        a * b, [a + b, a * b + a, Math.max(0, a * b - b)],
        `곱셈표는 가로와 세로의 두 수를 곱한 값을 씁니다. ${a}×${b}=${a * b}입니다.`,
        'multiplication', '곱셈표의 빈칸 채우기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${a}×${b}와 ${b}×${a}의 값을 비교하면?`,
        '두 값이 같다',
        [`${a}×${b}가 더 크다`, `${b}×${a}가 더 크다`, '비교할 수 없다'],
        `두 수를 바꾸어 곱해도 결과는 같습니다. 둘 다 ${a * b}입니다.`,
        'multiplication', '두 수를 바꾸어 곱하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}단은 오른쪽으로 갈수록 몇씩 커질까요?`,
        `${a}씩`,
        [`${a + 1}씩`, '1씩', `${a * 2}씩`],
        `${a}단은 ${a}씩 커집니다. ${a}×1=${a}, ${a}×2=${a * 2}처럼 ${a}씩 늘어납니다.`,
        'multiplication', '곱셈표에서 커지는 규칙 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}×${b}=${a * b}일 때 ${a}×${b + 1}은 얼마일까요?`,
        a * (b + 1), [a * b, a * b + 1, a * (b + 2)],
        `${a}단은 ${a}씩 커지므로 ${a * b}에 ${a}를 더하면 ${a * (b + 1)}입니다.`,
        'multiplication', '곱셈표에서 다음 수 구하기',
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        '곱셈표에서 곱이 가장 작은 칸은 어디일까요?',
        '작은 수끼리 만나는 칸',
        ['큰 수끼리 만나는 칸', '가운데 칸', '맨 오른쪽 칸'],
        `곱셈표는 두 수가 클수록 곱도 커집니다. 그래서 작은 수끼리 만나는 칸의 곱이 가장 작습니다.`,
        'multiplication', '곱셈표 전체의 규칙 보기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `곱셈표에서 ${a}×${a}처럼 같은 수끼리 곱한 칸은 어떤 줄에 놓일까요?`,
      '대각선으로 나란히 놓인다',
      ['맨 윗줄에 모인다', '맨 왼쪽 줄에 모인다', '흩어져 있다'],
      `같은 수끼리 곱한 칸은 왼쪽 위에서 오른쪽 아래로 대각선을 이룹니다.`,
      'multiplication', '곱셈표의 대각선 규칙 찾기',
    );
  }

  // 곱셈구구를 이용하여 문제를 해결해 볼까요
  if (title.includes('문제를 해결')) {
    const each = 2 + (index % 8);
    const groups = 3 + ((index + 2) % 6);
    const total = each * groups;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `한 상자에 사과가 ${each}개씩 들어 있습니다. ${groups}상자에는 사과가 모두 몇 개일까요?`,
        `${total}개`, [`${each + groups}개`, `${total + each}개`, `${Math.max(1, total - each)}개`],
        `한 묶음 ${each}개가 ${groups}묶음이므로 ${each}×${groups}=${total}개입니다.`,
        'multiplication', '곱셈구구로 전체 수 구하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `연필 ${total}자루를 한 사람에게 ${each}자루씩 주면 몇 사람에게 줄 수 있을까요?`,
        `${groups}명`, [`${each}명`, `${groups + 1}명`, `${total}명`],
        `${each}×□=${total}인 □를 찾습니다. ${each}×${groups}=${total}이므로 ${groups}명입니다.`,
        'multiplication', '곱셈구구로 묶음 수 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×${groups}를 나타내는 상황으로 알맞은 것은?`,
        `${each}개씩 ${groups}묶음`,
        [`${each}개와 ${groups}개`, `${each}묶음에서 ${groups}개를 뺀 것`, `${groups}개씩 ${groups}묶음`],
        `곱셈식 ${each}×${groups}는 ${each}개씩 ${groups}묶음이 있는 상황을 나타냅니다.`,
        'multiplication', '곱셈식에 맞는 상황 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×□=${total}일 때 □에 알맞은 수는?`,
        groups, [each, groups + 1, total],
        `${each}단에서 곱이 ${total}이 되는 수를 찾습니다. ${each}×${groups}=${total}입니다.`,
        'multiplication', '곱셈식의 빈칸 구하기',
      );
    }
    if (variant === 4) {
      const other = 2 + ((index + 4) % 7);
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×${groups}와 ${other}×${groups} 중 더 큰 것은?`,
        each > other ? `${each}×${groups}` : `${other}×${groups}`,
        [each > other ? `${other}×${groups}` : `${each}×${groups}`, '두 값이 같다', '비교할 수 없다'],
        `묶음 수가 같으면 한 묶음의 수가 클수록 곱도 큽니다. ${each * groups}과 ${other * groups}을 비교합니다.`,
        'multiplication', '곱의 크기 비교하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${each}명씩 앉는 의자가 ${groups}개 있습니다. 모두 몇 명이 앉을 수 있을까요?`,
      `${total}명`, [`${each + groups}명`, `${total + groups}명`, `${Math.max(1, total - groups)}명`],
      `한 의자에 ${each}명씩 ${groups}개이므로 ${each}×${groups}=${total}명입니다.`,
      'multiplication', '곱셈구구를 생활 문제에 쓰기',
    );
  }

  const dans = dansOfLesson(title);
  if (dans.length === 0) return null;

  const dan = dans[index % dans.length];
  const k = 2 + (index % 8);
  const product = dan * k;

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}×${k}는 얼마일까요?`,
      product, [product + dan, Math.max(0, product - dan), dan + k],
      `${dan}단은 ${dan}씩 커집니다. ${dan}이 ${k}묶음이므로 ${dan}×${k}=${product}입니다.`,
      'multiplication', `${dan}단 곱셈구구 외우기`,
    );
  }

  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}단 곱셈구구는 몇씩 커질까요?`,
      `${dan}씩`,
      [`${dan + 1}씩`, '1씩', `${dan * 2}씩`],
      `${dan}단은 ${dan}이 한 묶음씩 늘어나므로 ${dan}씩 커집니다.`,
      'multiplication', `${dan}단이 커지는 규칙 알기`,
    );
  }

  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}×□=${product}일 때 □에 알맞은 수는?`,
      k, [k + 1, Math.max(1, k - 1), product],
      `${dan}단에서 곱이 ${product}이 되는 수를 찾습니다. ${dan}×${k}=${product}입니다.`,
      'multiplication', `${dan}단에서 빈칸 채우기`,
    );
  }

  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}×${k}보다 ${dan}×${k + 1}은 얼마나 더 클까요?`,
      dan, [1, k, dan * 2],
      `묶음이 하나 늘면 ${dan}만큼 커집니다. ${dan * (k + 1)}-${product}=${dan}입니다.`,
      'multiplication', `${dan}단에서 한 묶음 늘어날 때의 변화 알기`,
    );
  }

  // 3단·6단, 4단·8단 차시는 두 단의 관계를 다룹니다.
  if (variant === 4 && dans.length === 2) {
    const [small, big] = dans[0] < dans[1] ? [dans[0], dans[1]] : [dans[1], dans[0]];
    return makeQuestion(
      lesson, difficulty, index,
      `${small}×${k}=${small * k}일 때 ${big}×${k}는 얼마일까요?`,
      big * k, [small * k, big * k + big, Math.max(0, big * k - k)],
      `${big}단은 ${small}단의 두 배입니다. ${small * k}의 두 배인 ${big * k}입니다.`,
      'multiplication', `${small}단과 ${big}단의 관계 알기`,
    );
  }

  if (variant === 4) {
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}개씩 ${k}묶음은 모두 몇 개일까요?`,
      `${product}개`,
      [`${dan + k}개`, `${product + dan}개`, `${Math.max(1, product - dan)}개`],
      `${dan}개씩 ${k}묶음이므로 ${dan}×${k}=${product}개입니다.`,
      'multiplication', `${dan}단을 묶음 상황에 쓰기`,
    );
  }

  return makeQuestion(
    lesson, difficulty, index,
    `${dan}씩 ${k}번 뛰어 세면 얼마일까요?`,
    product, [dan + k, product + dan, Math.max(0, product - dan)],
    `${dan}씩 ${k}번 뛰어 세는 것은 ${dan}×${k}와 같습니다. 답은 ${product}입니다.`,
    'multiplication', `${dan}단을 뛰어 세기와 잇기`,
  );
};

// -- 2-1 6단원 곱셈 (동아출판 2-1 지도서 306~329쪽) --
// 차시: 여러 가지 방법으로 세기 -> 묶어 세기 -> 몇의 몇 배 알기 ->
//       몇의 몇 배로 나타내기 -> 곱셈 알기 -> 곱셈식으로 나타내기
const multiplyUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '곱셈') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 5, 3);
  const each = 2 + (index % 6);
  const groups = 3 + ((index + 2) % 5);
  const total = each * groups;
  const repeated = Array.from({ length: groups }, () => each).join('+');

  if (title.includes('단원 도입')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `물건이 ${total}개 있습니다. 하나씩 세면 어떤 점이 불편할까요?`,
        '오래 걸리고 빠뜨리기 쉽다',
        ['수가 줄어든다', '물건이 없어진다', '아무 불편이 없다'],
        '물건이 많으면 하나씩 세는 것은 오래 걸리고 빠뜨리기도 쉽습니다.',
        'multiplication', '하나씩 세기의 불편함 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}씩 뛰어 세면 ${each} 다음에 오는 수는?`,
        each * 2, [each + 1, each * 3, each],
        `${each}씩 뛰어 세면 ${each}, ${each * 2}, ${each * 3}으로 이어집니다.`,
        'multiplication', '뛰어 세기로 세어 보기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '많은 물건의 수를 빠르게 세려면 어떻게 하면 좋을까요?',
        '같은 수씩 모아서 센다',
        ['하나씩 천천히 센다', '눈으로 어림한다', '가장 큰 것만 센다'],
        '같은 수씩 모아 세면 빠르고 정확하게 셀 수 있습니다.',
        'multiplication', '빠르게 세는 방법 생각하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}+${each}+${each}는 얼마일까요?`,
        each * 3, [each * 2, each + 3, each * 4],
        `${each}를 세 번 더하면 ${each * 3}입니다.`,
        'multiplication', '같은 수를 여러 번 더하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '같은 수를 여러 번 더하는 상황으로 알맞은 것은?',
      '한 접시에 같은 수씩 담겨 있을 때',
      ['접시마다 수가 다를 때', '물건이 하나뿐일 때', '수를 모를 때'],
      '똑같은 수가 되풀이될 때 같은 수를 여러 번 더하게 됩니다.',
      'multiplication', '같은 수가 되풀이되는 상황 찾기',
    );
  }

  if (title.includes('여러 가지 방법으로 세어')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `구슬 ${total}개를 빠르게 세는 방법으로 알맞은 것은?`,
        '몇 개씩 묶어서 센다',
        ['하나씩 오래 센다', '눈으로 어림한다', '세지 않고 넘어간다'],
        '묶어 세면 하나씩 세는 것보다 빠르고 정확하게 셀 수 있습니다.',
        'multiplication', '빠르게 세는 방법 고르기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}씩 ${groups}번 뛰어 세면 얼마일까요?`,
        total, [each + groups, total + each, Math.max(1, total - each)],
        `${each}씩 ${groups}번 뛰어 세면 ${total}입니다.`,
        'multiplication', '뛰어 세기로 전체 수 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '하나씩 세기와 묶어 세기의 결과를 비교하면?',
        '세는 방법이 달라도 전체 수는 같다',
        ['묶어 세면 더 많아진다', '하나씩 세면 더 많아진다', '비교할 수 없다'],
        '어떻게 세든 물건의 수는 변하지 않습니다.',
        'multiplication', '세는 방법과 전체 수의 관계 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${total}개를 ${each}개씩 묶으면 몇 묶음이 될까요?`,
        `${groups}묶음`, [`${each}묶음`, `${groups + 1}묶음`, `${total}묶음`],
        `${each}개씩 묶으면 ${groups}묶음이 됩니다.`,
        'multiplication', '묶음의 수 세어 보기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${each}씩 뛰어 셀 때 두 번째로 세는 수는?`,
      each * 2, [each, each * 3, each + 2],
      `${each}씩 뛰어 세면 ${each}, ${each * 2}, ${each * 3}으로 이어집니다.`,
      'multiplication', '뛰어 세는 순서 알기',
    );
  }

  if (title.includes('묶어 세어')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}개씩 ${groups}묶음은 모두 몇 개일까요?`,
        `${total}개`, [`${each + groups}개`, `${total + each}개`, `${Math.max(1, total - each)}개`],
        `${each}개씩 ${groups}묶음이므로 모두 ${total}개입니다.`,
        'multiplication', '몇씩 몇 묶음의 전체 수 구하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${total}개를 ${groups}묶음으로 똑같이 나누면 한 묶음에 몇 개일까요?`,
        `${each}개`, [`${groups}개`, `${each + 1}개`, `${total}개`],
        `${each}개씩 ${groups}묶음이면 ${total}개이므로 한 묶음은 ${each}개입니다.`,
        'multiplication', '한 묶음의 수 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}개씩 ${groups}묶음을 덧셈식으로 쓰면?`,
        repeated,
        [`${each}+${groups}`, `${total}+${each}`, `${each}+${each}`],
        `${each}가 ${groups}묶음이므로 ${each}를 ${groups}번 더합니다.`,
        'multiplication', '묶어 세기를 덧셈식으로 쓰기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `같은 물건을 ${each}개씩 묶을 때와 ${groups}개씩 묶을 때 묶음 수는?`,
        '묶는 수가 다르면 묶음 수도 다르다',
        ['항상 같다', '묶음 수는 변하지 않는다', '전체 수가 달라진다'],
        '한 묶음에 담는 수가 달라지면 묶음 수도 달라집니다. 전체 수는 그대로입니다.',
        'multiplication', '묶는 방법에 따른 묶음 수 비교하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${each}개씩 ${groups}묶음에서 한 묶음이 더 늘면 모두 몇 개일까요?`,
      `${total + each}개`, [`${total}개`, `${total + 1}개`, `${total + groups}개`],
      `한 묶음이 늘면 ${each}개가 늘어나므로 ${total + each}개입니다.`,
      'multiplication', '묶음이 늘 때의 변화 알기',
    );
  }

  if (title.includes('몇의 몇 배를 알아')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}씩 ${groups}묶음은 ${each}의 몇 배일까요?`,
        `${groups}배`, [`${each}배`, `${groups + 1}배`, `${total}배`],
        `똑같은 묶음이 ${groups}개이므로 ${each}의 ${groups}배입니다.`,
        'multiplication', '묶음 수로 몇 배 말하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}의 ${groups}배는 얼마일까요?`,
        total, [each + groups, total + each, Math.max(1, total - each)],
        `${each}를 ${groups}번 더한 것과 같으므로 ${total}입니다.`,
        'multiplication', '몇의 몇 배의 값 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '몇 배라고 말할 수 있는 때는 언제일까요?',
        '똑같은 묶음이 여러 개 있을 때',
        ['묶음의 수가 모두 다를 때', '물건이 많을 때', '수를 셀 수 없을 때'],
        '배는 똑같은 묶음이 몇 번 있는지를 나타내는 말입니다.',
        'multiplication', '몇 배의 뜻 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}의 1배는 얼마일까요?`,
        each, [1, each * 2, 0],
        `1배는 한 묶음이므로 ${each} 그대로입니다.`,
        'multiplication', '1배의 뜻 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${each}의 ${groups}배와 ${each}씩 ${groups}묶음은 어떤 관계일까요?`,
      '같은 것을 다르게 말한 것이다',
      ['서로 다른 수이다', '배가 더 크다', '묶음이 더 크다'],
      `똑같은 묶음이 ${groups}개인 상황을 ${each}의 ${groups}배라고도 합니다.`,
      'multiplication', '묶음과 배를 잇기',
    );
  }

  if (title.includes('몇의 몇 배로 나타내')) {
    const small = 2 + (index % 4);
    const times = 2 + ((index + 1) % 4);
    const big = small * times;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `빨간 끈이 ${small}cm, 파란 끈이 ${big}cm입니다. 파란 끈은 빨간 끈의 몇 배일까요?`,
        `${times}배`, [`${small}배`, `${times + 1}배`, `${big}배`],
        `${small}이 ${times}번이면 ${big}이므로 ${times}배입니다.`,
        'multiplication', '두 양을 비교해 몇 배 구하기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${small}의 ${times}배인 수는 얼마일까요?`,
        big, [small + times, big + small, Math.max(1, big - small)],
        `${small}을 ${times}번 더하면 ${big}입니다.`,
        'multiplication', '몇 배인 수 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${big}은 ${small}의 몇 배일까요?`,
        `${times}배`, [`${big}배`, `${times + 1}배`, `${small}배`],
        `${small}씩 ${times}묶음이면 ${big}이므로 ${times}배입니다.`,
        'multiplication', '기준이 되는 수로 몇 배 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '몇 배를 구할 때 기준이 되는 수는 어느 것일까요?',
        '비교의 바탕이 되는 작은 쪽',
        ['항상 큰 쪽', '가운데 수', '아무 수나'],
        '기준이 되는 수를 몇 번 모으면 비교하는 수가 되는지를 봅니다.',
        'multiplication', '기준이 되는 수 찾기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${small}의 ${times}배와 ${small}의 ${times + 1}배 중 더 큰 것은?`,
      `${small}의 ${times + 1}배`,
      [`${small}의 ${times}배`, '두 값이 같다', '비교할 수 없다'],
      `배가 클수록 결과도 큽니다. ${small * (times + 1)}이 ${big}보다 큽니다.`,
      'multiplication', '몇 배의 크기 비교하기',
    );
  }

  if (title.includes('곱셈을 알아')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}의 ${groups}배를 곱셈식으로 나타내면?`,
        `${each}×${groups}`, [`${each}+${groups}`, `${groups}×${groups}`, `${each}×${each}`],
        `몇의 몇 배는 곱셈식으로 나타냅니다. ${each}의 ${groups}배는 ${each}×${groups}입니다.`,
        'multiplication', '몇의 몇 배를 곱셈식으로 쓰기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×${groups}를 읽으면?`,
        `${each} 곱하기 ${groups}`,
        [`${each} 더하기 ${groups}`, `${each} 빼기 ${groups}`, `${groups} 곱하기 ${each}`],
        '×는 곱하기라고 읽습니다.',
        'multiplication', '곱셈식 읽기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${repeated}을 곱셈식으로 나타내면?`,
        `${each}×${groups}`, [`${each}+${groups}`, `${groups}×${groups}`, `${each}×${each}`],
        `같은 수 ${each}를 ${groups}번 더한 것이므로 ${each}×${groups}입니다.`,
        'multiplication', '덧셈식을 곱셈식으로 바꾸기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×${groups}의 값은 얼마일까요?`,
        total, [each + groups, total + each, Math.max(1, total - each)],
        `${each}를 ${groups}번 더하면 ${total}입니다.`,
        'multiplication', '곱셈식의 값 구하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '곱셈식으로 나타내면 좋은 점은?',
      '같은 수를 여러 번 더하는 것을 짧게 쓸 수 있다',
      ['수가 작아진다', '답이 달라진다', '더하지 않아도 된다'],
      '같은 수를 여러 번 더하는 상황을 곱셈식으로 간단히 나타낼 수 있습니다.',
      'multiplication', '곱셈식의 편리한 점 알기',
    );
  }

  if (title.includes('곱셈식으로 나타내')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `한 접시에 ${each}개씩 ${groups}접시에 담았습니다. 곱셈식으로 나타내면?`,
        `${each}×${groups}`, [`${groups}×${groups}`, `${each}+${groups}`, `${each}×${each}`],
        `한 묶음의 수 ${each}와 묶음 수 ${groups}를 곱합니다.`,
        'multiplication', '이야기 상황을 곱셈식으로 쓰기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×${groups}에서 앞의 수 ${each}는 무엇을 나타낼까요?`,
        '한 묶음의 수', ['묶음의 수', '전체 수', '남은 수'],
        '곱셈식에서 앞의 수는 한 묶음에 몇 개인지를 나타냅니다.',
        'multiplication', '곱셈식에서 각 수의 뜻 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}×${groups}에서 뒤의 수 ${groups}는 무엇을 나타낼까요?`,
        '묶음의 수', ['한 묶음의 수', '전체 수', '남은 수'],
        '곱셈식에서 뒤의 수는 묶음이 몇 개인지를 나타냅니다.',
        'multiplication', '곱셈식에서 묶음 수 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${total}개를 나타내는 곱셈식으로 알맞은 것은?`,
        `${each}×${groups}`, [`${each}+${groups}`, `${total}×${each}`, `${each}×${each}`],
        `${each}개씩 ${groups}묶음이면 ${total}개이므로 ${each}×${groups}입니다.`,
        'multiplication', '전체 수에 맞는 곱셈식 고르기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${each}×${groups}와 ${groups}×${each}의 값을 비교하면?`,
      '두 값이 같다',
      [`${each}×${groups}가 더 크다`, `${groups}×${each}가 더 크다`, '비교할 수 없다'],
      `두 수를 바꾸어 곱해도 결과는 같습니다. 둘 다 ${total}입니다.`,
      'multiplication', '순서를 바꾼 곱셈식 비교하기',
    );
  }

  return null;
};

const multiplicationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const timesTable = timesTableQuestion(lesson, difficulty, index);
  if (timesTable) return timesTable;

  const multiplyUnit = multiplyUnitQuestion(lesson, difficulty, index);
  if (multiplyUnit) return multiplyUnit;

  return legacyMultiplicationQuestion(lesson, difficulty, index);
};

const legacyMultiplicationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
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

// ── 2-2 4단원 시각과 시간 (동아출판 2-2 지도서 239~265쪽) ──────────────────
// 차시: 5분 단위 읽기 → 1분 단위 읽기 → 몇 분 전으로 읽기 → 1시간(60분) →
// 걸린 시간 → 하루의 시간(24시간, 오전·오후) → 달력(1주일·1개월·1년).
const clockUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '시각과 시간') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 6, 3);
  const hour = 1 + (index % 12);

  // 몇 시 몇 분을 읽어 볼까요 ⑴ : 5분 단위
  if (title.includes('몇 시 몇 분을 읽어 볼까요 ⑴')) {
    const five = 5 * (1 + (index % 11));
    const pointer = five / 5;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `긴바늘이 숫자 ${pointer}를 가리키면 몇 분일까요?`,
        `${five}분`, [`${pointer}분`, `${Math.max(5, five - 5)}분`, `${five < 55 ? five + 5 : 15}분`],
        `긴바늘이 숫자 한 칸을 지날 때마다 5분입니다. ${pointer}×5=${five}분입니다.`,
        'time', '긴바늘이 가리키는 숫자로 분 읽기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '긴바늘이 숫자 한 칸을 지나면 몇 분이 지날까요?',
        '5분', ['1분', '10분', '12분'],
        '시계의 숫자와 숫자 사이는 5분입니다.',
        'time', '숫자 한 칸이 5분임을 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${five}분일 때 긴바늘은 어느 숫자를 가리킬까요?`,
        `${pointer}`, [`${five}`, `${pointer + 1}`, '12'],
        `5씩 뛰어 세면 ${five}분은 숫자 ${pointer}입니다.`,
        'time', '분을 보고 긴바늘 위치 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '5분 단위로 분을 읽을 때 쓰는 방법은?',
        '숫자를 5씩 뛰어 센다',
        ['숫자를 그대로 읽는다', '1씩 센다', '짧은바늘을 본다'],
        '긴바늘이 가리키는 숫자를 5씩 뛰어 세면 몇 분인지 알 수 있습니다.',
        'time', '5씩 뛰어 세어 분 읽기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `짧은바늘이 ${hour}과 ${hour === 12 ? 1 : hour + 1} 사이에 있고 긴바늘이 ${pointer}를 가리킵니다. 몇 시 몇 분일까요?`,
      `${hour}시 ${five}분`,
      [`${hour === 12 ? 1 : hour + 1}시 ${five}분`, `${hour}시 ${pointer}분`, `${five}시 ${hour}분`],
      `짧은바늘이 지나온 숫자가 시이고, 긴바늘의 ${pointer}는 ${five}분입니다.`,
      'time', '5분 단위로 몇 시 몇 분 읽기',
    );
  }

  // 몇 시 몇 분을 읽어 볼까요 ⑵ : 1분 단위
  if (title.includes('몇 시 몇 분을 읽어 볼까요 ⑵')) {
    const base = 5 * (1 + (index % 10));
    const extra = 1 + (index % 4);
    const minute = base + extra;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '시계의 작은 눈금 한 칸은 몇 분일까요?',
        '1분', ['5분', '10분', '2분'],
        '숫자와 숫자 사이를 다섯 칸으로 나눈 작은 눈금 한 칸이 1분입니다.',
        'time', '작은 눈금 한 칸이 1분임을 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `긴바늘이 숫자 ${base / 5}에서 작은 눈금으로 ${extra}칸 더 갔습니다. 몇 분일까요?`,
        `${minute}분`, [`${base}분`, `${base / 5 + extra}분`, `${minute + 5}분`],
        `숫자 ${base / 5}는 ${base}분이고 작은 눈금 ${extra}칸은 ${extra}분이므로 ${minute}분입니다.`,
        'time', '작은 눈금까지 세어 분 읽기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `${minute}분은 숫자 ${base / 5}에서 작은 눈금 몇 칸을 더 간 것일까요?`,
        `${extra}칸`, [`${base}칸`, `${extra + 1}칸`, '5칸'],
        `${minute}-${base}=${extra}이므로 작은 눈금 ${extra}칸을 더 간 것입니다.`,
        'time', '분에서 작은 눈금 수 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '숫자와 숫자 사이에는 작은 눈금이 몇 칸 있을까요?',
        '5칸', ['1칸', '10칸', '12칸'],
        '숫자 사이가 5분이고 한 칸이 1분이므로 작은 눈금은 5칸입니다.',
        'time', '숫자 사이의 눈금 수 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${hour}시 ${minute}분을 읽을 때 긴바늘을 어떻게 볼까요?`,
      '숫자를 5씩 세고 작은 눈금을 1씩 더 센다',
      ['숫자만 읽는다', '작은 눈금만 센다', '짧은바늘로 센다'],
      `숫자까지는 5씩, 남은 작은 눈금은 1씩 세어 ${minute}분을 읽습니다.`,
      'time', '1분 단위로 시각 읽는 방법 알기',
    );
  }

  // 1차시 단원 도입: 1학년에서 배운 몇 시, 몇 시 30분까지만 다룹니다.
  // 뒤에서 배울 1시간, 걸린 시간, 오전·오후, 달력은 여기서 내지 않습니다.
  if (title.includes('단원 도입')) {
    const half = index % 2 === 0;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `긴바늘이 12를 가리키고 짧은바늘이 ${hour}를 가리킵니다. 몇 시일까요?`,
        `${hour}시`, [`${hour === 12 ? 1 : hour + 1}시`, `12시`, `${hour}시 30분`],
        `긴바늘이 12를 가리키면 몇 시 정각입니다. 짧은바늘이 ${hour}이므로 ${hour}시입니다.`,
        'time', '몇 시 읽기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `긴바늘이 6을 가리키고 짧은바늘이 ${hour}와 ${hour === 12 ? 1 : hour + 1} 사이에 있습니다. 몇 시 몇 분일까요?`,
        `${hour}시 30분`,
        [`${hour === 12 ? 1 : hour + 1}시 30분`, `${hour}시`, `6시 ${hour}분`],
        `긴바늘이 6을 가리키면 30분입니다. 짧은바늘이 지나온 숫자가 ${hour}이므로 ${hour}시 30분입니다.`,
        'time', '몇 시 30분 읽기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '시계에서 짧은바늘은 무엇을 나타낼까요?',
        '시', ['분', '초', '날짜'],
        '짧은바늘은 몇 시인지를, 긴바늘은 몇 분인지를 나타냅니다.',
        'time', '두 바늘의 역할 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '시각을 알아야 하는 때로 알맞은 것은?',
        '약속 시각을 지켜야 할 때',
        ['물건의 무게를 알 때', '물건의 길이를 잴 때', '물건의 수를 셀 때'],
        '몇 시에 무엇을 하는지 정하려면 시각을 알아야 합니다.',
        'time', '시각이 필요한 상황 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      half ? '시계에서 긴바늘은 무엇을 나타낼까요?' : '시계의 큰 숫자는 모두 몇 개일까요?',
      half ? '분' : '12개',
      half ? ['시', '날짜', '무게'] : ['10개', '20개', '6개'],
      half
        ? '긴바늘은 몇 분인지를 나타냅니다.'
        : '시계에는 1부터 12까지 큰 숫자가 12개 있습니다.',
      'time', half ? '긴바늘의 역할 알기' : '시계판 살펴보기',
    );
  }

  // 여러 가지 방법으로 시각을 읽어 볼까요 (몇 시 몇 분 전)
  if (title.includes('여러 가지 방법')) {
    const before = 5 * (1 + (index % 3));
    const minute = 60 - before;
    const nextHour = hour === 12 ? 1 : hour + 1;

    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${hour}시 ${minute}분을 다른 방법으로 읽으면?`,
        `${nextHour}시 ${before}분 전`,
        [`${hour}시 ${before}분 전`, `${nextHour}시 ${minute}분 전`, `${hour}시 ${before}분`],
        `${minute}분은 ${nextHour}시가 되기 ${before}분 전입니다. 그래서 ${nextHour}시 ${before}분 전이라고도 읽습니다.`,
        'time', '몇 시 몇 분 전으로 읽기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${nextHour}시 ${before}분 전은 몇 시 몇 분일까요?`,
        `${hour}시 ${minute}분`,
        [`${nextHour}시 ${before}분`, `${hour}시 ${before}분`, `${nextHour}시 ${minute}분`],
        `${nextHour}시에서 ${before}분을 되돌리면 ${hour}시 ${minute}분입니다.`,
        'time', '몇 분 전을 몇 시 몇 분으로 바꾸기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '몇 시 몇 분 전이라고 읽는 때는 언제일까요?',
        '다음 시각이 되기 조금 전일 때',
        ['시가 막 바뀐 뒤일 때', '정각일 때', '분을 모를 때'],
        `긴바늘이 12에 가까워졌을 때는 다음 시각을 기준으로 몇 분 전이라고 읽으면 편합니다.`,
        'time', '두 가지 읽기를 구별하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `${hour}시 50분은 ${nextHour}시가 되려면 몇 분 남았을까요?`,
        '10분', ['50분', '5분', '20분'],
        `한 시간은 60분입니다. 60-50=10분 남았습니다.`,
        'time', '다음 시각까지 남은 시간 구하기',
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        `${hour}시 55분과 ${nextHour}시 5분 전은 같은 시각일까요?`,
        '같은 시각이다',
        ['다른 시각이다', `${nextHour}시 5분 전이 더 빠르다`, `${hour}시 55분이 더 늦다`],
        `${nextHour}시가 되기 5분 전이 바로 ${hour}시 55분입니다. 같은 시각을 두 가지로 읽은 것입니다.`,
        'time', '같은 시각의 두 가지 읽기 확인하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${hour}시 45분을 몇 분 전으로 읽으면?`,
      `${nextHour}시 15분 전`,
      [`${hour}시 15분 전`, `${nextHour}시 45분 전`, `${hour}시 45분 전`],
      `60-45=15이므로 ${nextHour}시 15분 전입니다.`,
      'time', '분을 보고 몇 분 전 구하기',
    );
  }

  // 1시간을 알아볼까요
  if (title.includes('1시간')) {
    const minutes = 60 + 10 * (1 + (index % 4));
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '1시간은 몇 분일까요?',
        '60분', ['50분', '100분', '30분'],
        `긴바늘이 시계를 한 바퀴 도는 데 걸리는 시간이 1시간이고, 이는 60분입니다.`,
        'time', '1시간과 60분의 관계 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${minutes}분은 몇 시간 몇 분일까요?`,
        `1시간 ${minutes - 60}분`,
        [`${minutes}시간`, `2시간 ${minutes - 60}분`, `1시간 ${minutes}분`],
        `60분이 1시간입니다. ${minutes}-60=${minutes - 60}이므로 1시간 ${minutes - 60}분입니다.`,
        'time', '분을 시간과 분으로 바꾸기',
      );
    }
    if (variant === 2) {
      const m = 10 * (1 + (index % 5));
      return makeQuestion(
        lesson, difficulty, index,
        `1시간 ${m}분은 몇 분일까요?`,
        `${60 + m}분`, [`${m}분`, '60분', `${120 + m}분`],
        `1시간은 60분이므로 60+${m}=${60 + m}분입니다.`,
        'time', '시간과 분을 분으로 바꾸기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '시계의 긴바늘이 한 바퀴 돌면 얼마만큼의 시간이 지날까요?',
        '1시간', ['1분', '30분', '10분'],
        `긴바늘이 한 바퀴를 도는 동안 60분, 곧 1시간이 지납니다.`,
        'time', '긴바늘 한 바퀴의 뜻 알기',
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        '짧은바늘이 숫자 한 칸을 지나가면 얼마만큼의 시간이 지날까요?',
        '1시간', ['1분', '5분', '10분'],
        `짧은바늘이 숫자 한 칸을 지나는 동안 1시간이 지납니다.`,
        'time', '짧은바늘의 한 칸이 뜻하는 시간 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '2시간은 몇 분일까요?',
      '120분', ['60분', '100분', '200분'],
      `1시간이 60분이므로 2시간은 60+60=120분입니다.`,
      'time', '몇 시간을 분으로 바꾸기',
    );
  }

  // 하루의 시간을 알아볼까요
  if (title.includes('하루의 시간')) {
    const h = 1 + (index % 11);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '하루는 몇 시간일까요?',
        '24시간', ['12시간', '30시간', '60시간'],
        `오전 12시간과 오후 12시간을 합하면 하루는 24시간입니다.`,
        'time', '하루가 24시간임을 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '밤 12시부터 낮 12시까지를 무엇이라고 할까요?',
        '오전', ['오후', '하루', '한 주'],
        `밤 12시부터 낮 12시까지가 오전이고, 낮 12시부터 밤 12시까지가 오후입니다.`,
        'time', '오전과 오후 구별하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '학교에서 점심을 먹는 낮 1시는 언제일까요?',
        '오후 1시', ['오전 1시', '밤 1시', '새벽 1시'],
        `낮 12시가 지나면 오후입니다. 그래서 낮 1시는 오후 1시입니다.`,
        'time', '생활 시각을 오전·오후로 말하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '오전은 몇 시간일까요?',
        '12시간', ['24시간', '10시간', '6시간'],
        `오전은 밤 12시부터 낮 12시까지로 12시간입니다.`,
        'time', '오전의 길이 알기',
      );
    }
    if (variant === 4) {
      return makeQuestion(
        lesson, difficulty, index,
        `오전 ${h}시에서 12시간이 지나면 언제일까요?`,
        `오후 ${h}시`, [`오전 ${h}시`, `오후 ${h + 1}시`, '다음 날'],
        `12시간이 지나면 오전이 오후로 바뀌고 시각의 숫자는 같습니다.`,
        'time', '12시간 뒤의 시각 구하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '하루에 시계의 짧은바늘은 몇 바퀴 돌까요?',
      '2바퀴', ['1바퀴', '12바퀴', '24바퀴'],
      `짧은바늘은 12시간에 한 바퀴 돌고, 하루는 24시간이므로 2바퀴 돕니다.`,
      'time', '하루 동안 바늘의 움직임 알기',
    );
  }

  return null;
};

const timeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const unitSpecific = clockUnitQuestion(lesson, difficulty, index);
  if (unitSpecific) return unitSpecific;

  return legacyTimeQuestion(lesson, difficulty, index);
};

const legacyTimeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
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
// 항목별 수는 서로 달라야 합니다. 같은 수가 나오면 "가장 많은 항목"의 답이
// 하나로 정해지지 않고 보기의 '모두 같음'이 정답이 되어 버립니다.
const surveyFor = (index: number): SurveySet => {
  const base = surveySets[index % surveySets.length];
  const shift = Math.floor(index / surveySets.length);
  const used = new Set<number>();

  return {
    ...base,
    items: base.items.map((item, itemIndex) => {
      let count = Math.max(1, item.count + ((shift + itemIndex) % 3) - 1);
      while (used.has(count)) count += 1;
      used.add(count);
      return { ...item, count };
    }),
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
      `우리 반 친구들이 ${josa(survey.subject, '을', '를')} 어떻게 조사하면 좋을까요?`,
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
      ['표의 색깔을 정한다', '합계를 먼저 쓴다', '답을 미리 정해 둔다'],
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

const dataIntroQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const variant = variantForDifficulty(difficulty, index, 5, 3);
  const soccer = 5 + (index % 4);
  const rope = 2 + ((index + 1) % 3);
  const tag = 8 + ((index + 2) % 3);

  if (variant === 0) {
    return makeQuestion(
      lesson, difficulty, index,
      '우리 반 친구들이 좋아하는 것을 알아보려면 먼저 무엇을 해야 할까요?',
      '무엇을 조사할지 정한다',
      ['답을 미리 정한다', '가장 좋아하는 것을 고른다', '수를 먼저 센다'],
      '무엇을 알아볼지 정해야 자료를 모을 수 있습니다.',
      'data', '조사할 것을 정하기',
    );
  }
  if (variant === 1) {
    return makeQuestion(
      lesson, difficulty, index,
      '친구들이 좋아하는 것을 이름만 죽 적어 놓으면 어떤 점이 불편할까요?',
      '무엇이 가장 많은지 한눈에 알기 어렵다',
      ['이름을 쓸 수 없다', '친구가 줄어든다', '자료가 없어진다'],
      '적어 놓기만 하면 세어 보기 전에는 많고 적음을 알기 어렵습니다.',
      'data', '자료를 정리해야 하는 까닭 알기',
    );
  }
  if (variant === 2) {
    return makeQuestion(
      lesson, difficulty, index,
      `축구 ${soccer}명, 줄넘기 ${rope}명, 술래잡기 ${tag}명을 조사했습니다. 조사한 학생은 모두 몇 명일까요?`,
      `${soccer + rope + tag}명`,
      [`${soccer + rope}명`, `${rope + tag}명`, `${soccer + rope + tag + 1}명`],
      `항목별 수를 모두 더합니다. ${soccer}+${rope}+${tag}=${soccer + rope + tag}명입니다.`,
      'data', '조사한 자료의 전체 수 구하기',
    );
  }
  if (variant === 3) {
    return makeQuestion(
      lesson, difficulty, index,
      '조사한 자료를 알아보기 쉽게 하려면 어떻게 하면 좋을까요?',
      '같은 것끼리 모아 수를 센다',
      ['순서를 뒤섞는다', '적은 것은 지운다', '이름만 다시 쓴다'],
      '같은 것끼리 모아 세면 무엇이 많고 적은지 쉽게 알 수 있습니다.',
      'data', '자료를 정리하는 방법 생각하기',
    );
  }
  return makeQuestion(
    lesson, difficulty, index,
    '자료를 조사할 때 지켜야 할 것으로 알맞은 것은?',
    '빠뜨리거나 두 번 세지 않는다',
    ['좋아하는 친구만 조사한다', '많아 보이는 것만 센다', '어림해서 적는다'],
    '빠짐과 겹침이 없어야 조사 결과가 정확합니다.',
    'data', '바르게 조사하기',
  );
};

const tableGraphLessonQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '표와 그래프') return null;

  const title = lesson.title;
  if (title.includes('단원 도입')) return dataIntroQuestion(lesson, difficulty, index);
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

  // 분류하기 단원의 뒤쪽 차시는 data 태그가 있어 이 경로로 들어옵니다.
  const sorting = sortingUnitQuestion(lesson, difficulty, index);
  if (sorting) return sorting;

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

// ── 2-2 6단원 규칙 찾기 (동아출판 2-2 지도서 299~323쪽) ────────────────────
// 차시: 무늬⑴ → 무늬⑵ → 쌓은 모양 → 덧셈표 → 곱셈표 → 생활 속 규칙
const ruleUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '규칙 찾기') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 5, 3);

  if (title.includes('무늬에서 규칙을 찾아볼까요 ⑴')) {
    const shapes = ['○', '△', '□'];
    const colours = ['빨강', '노랑', '파랑'];
    const startAt = index % 3;
    if (variant === 0) {
      const seq = [0, 1, 2, 0, 1].map((i) => shapes[(i + startAt) % 3]);
      return makeQuestion(
        lesson, difficulty, index,
        `${seq.join(', ')} 다음에 올 모양은?`,
        shapes[(2 + startAt) % 3],
        shapes.filter((sh) => sh !== shapes[(2 + startAt) % 3]).concat('알 수 없다'),
        `${shapes[startAt]}, ${shapes[(1 + startAt) % 3]}, ${shapes[(2 + startAt) % 3]}이 반복되는 규칙입니다.`,
        'pattern', '반복되는 모양의 다음 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `${colours[startAt]}, ${colours[(1 + startAt) % 3]}, ${colours[startAt]}, ${colours[(1 + startAt) % 3]}으로 이어집니다. 반복되는 묶음은 몇 개짜리일까요?`,
        '2개', ['1개', '3개', '4개'],
        `${colours[startAt]}과 ${colours[(1 + startAt) % 3]} 두 개가 반복되는 규칙입니다.`,
        'pattern', '반복되는 묶음의 크기 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '무늬에서 규칙을 찾을 때 먼저 할 일은?',
        '반복되는 한 묶음을 찾는다',
        ['맨 끝을 먼저 본다', '색깔을 센다', '개수를 모두 센다'],
        '어디까지가 한 묶음인지 찾으면 다음에 올 것을 알 수 있습니다.',
        'pattern', '규칙을 찾는 방법 알기',
      );
    }
    if (variant === 3) {
      const seq = [0, 1, 0, 1, 0].map((i) => shapes[(i + startAt) % 3]);
      return makeQuestion(
        lesson, difficulty, index,
        `${seq.join(', ')}에서 빈칸에 올 모양은?`,
        shapes[(1 + startAt) % 3],
        [shapes[startAt], shapes[(2 + startAt) % 3], '알 수 없다'],
        `${shapes[startAt]}과 ${shapes[(1 + startAt) % 3]}이 번갈아 나오는 규칙입니다.`,
        'pattern', '번갈아 나오는 규칙 찾기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '무늬가 반복된다는 것은 무슨 뜻일까요?',
      '같은 순서가 되풀이된다',
      ['모양이 점점 커진다', '색깔이 사라진다', '순서가 뒤바뀐다'],
      '반복되는 무늬는 같은 순서가 계속 되풀이됩니다.',
      'pattern', '반복의 뜻 알기',
    );
  }

  if (title.includes('무늬에서 규칙을 찾아볼까요 ⑵')) {
    const start = 1 + (index % 3);
    const step = 1 + (index % 2);
    if (variant === 0) {
      const seq = [start, start + step, start + step * 2, start + step * 3];
      return makeQuestion(
        lesson, difficulty, index,
        `모양의 개수가 ${seq.join('개, ')}개로 늘어납니다. 다음은 몇 개일까요?`,
        `${start + step * 4}개`,
        [`${start + step * 3}개`, `${start + step * 5}개`, `${start}개`],
        `${step}개씩 늘어나는 규칙이므로 다음은 ${start + step * 4}개입니다.`,
        'pattern', '개수가 늘어나는 규칙 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '△이 오른쪽으로 조금씩 돌아가며 놓였습니다. 이것은 어떤 규칙일까요?',
        '방향이 일정하게 바뀌는 규칙',
        ['개수가 늘어나는 규칙', '색깔이 바뀌는 규칙', '규칙이 없다'],
        '모양은 그대로이고 방향만 일정하게 바뀌는 규칙입니다.',
        'pattern', '방향이 바뀌는 규칙 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `모양이 ${start}개, ${start + step}개, ${start + step * 2}개로 놓였습니다. 몇 개씩 늘어날까요?`,
        `${step}개씩`, [`${step + 1}개씩`, `${start}개씩`, '늘어나지 않는다'],
        `앞뒤 수의 차가 ${step}이므로 ${step}개씩 늘어납니다.`,
        'pattern', '늘어나는 크기 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '반복되는 규칙과 늘어나는 규칙의 다른 점은?',
        '반복은 같은 것이 되풀이되고 늘어나는 규칙은 수가 커진다',
        ['둘은 같은 것이다', '반복은 수가 커진다', '늘어나는 규칙은 되풀이된다'],
        '반복 규칙은 같은 묶음이 되풀이되고, 늘어나는 규칙은 개수가 일정하게 커집니다.',
        'pattern', '두 가지 규칙 구별하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `${start}개에서 ${step}개씩 늘어날 때 세 번 뒤에는 몇 개일까요?`,
      `${start + step * 3}개`,
      [`${start + step}개`, `${start + step * 2}개`, `${start + step * 4}개`],
      `${step}씩 세 번 늘어나므로 ${start}+${step * 3}=${start + step * 3}개입니다.`,
      'pattern', '규칙을 여러 번 적용해 예상하기',
    );
  }

  if (title.includes('쌓은 모양')) {
    const start = 1 + (index % 3);
    const step = 1 + (index % 3);
    const third = start + step * 2;
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무를 ${start}개, ${start + step}개, ${third}개로 늘어놓았습니다. 몇 개씩 늘어나는 규칙일까요?`,
        `${step}개씩`, [`${step + 1}개씩`, '1개씩', `${start}개씩`],
        `앞의 수와 뒤의 수의 차를 보면 ${step}개씩 늘어나는 규칙입니다.`,
        'pattern', '쌓은 모양이 늘어나는 규칙 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무가 ${start}개, ${start + step}개, ${third}개로 놓였습니다. 다음에 놓을 쌓기나무는 몇 개일까요?`,
        `${third + step}개`, [`${third}개`, `${third + step + 1}개`, `${start}개`],
        `${step}개씩 늘어나므로 ${third}에 ${step}을 더한 ${third + step}개입니다.`,
        'pattern', '다음에 놓을 쌓기나무 수 구하기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '쌓은 모양에서 규칙을 찾을 때 무엇을 살펴봐야 할까요?',
        '쌓기나무가 몇 개씩 늘거나 줄어드는지',
        ['쌓기나무의 색깔', '쌓기나무를 만든 사람', '쌓은 곳의 위치'],
        `쌓은 모양의 규칙은 개수가 얼마씩 변하는지를 보고 찾습니다.`,
        'pattern', '쌓은 모양에서 볼 곳 알기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무를 ${start}개, ${start + step}개, □개, ${third + step}개로 놓았습니다. □는 몇 개일까요?`,
        `${third}개`, [`${third + step}개`, `${start}개`, `${third + 1}개`],
        `${step}개씩 늘어나는 규칙이므로 □는 ${third}개입니다.`,
        'pattern', '쌓은 모양의 빈칸 채우기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `쌓기나무가 ${step}개씩 늘어날 때 두 번 더 놓으면 몇 개가 늘어날까요?`,
      `${step * 2}개`, [`${step}개`, `${step * 3}개`, '1개'],
      `한 번에 ${step}개씩 늘어나므로 두 번이면 ${step}+${step}=${step * 2}개입니다.`,
      'pattern', '규칙을 여러 번 적용하기',
    );
  }

  if (title.includes('덧셈표')) {
    const a = 1 + (index % 8);
    const b = 1 + ((index + 3) % 8);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `덧셈표에서 ${a}와 ${b}가 만나는 칸에 알맞은 수는?`,
        a + b, [a * b, a + b + 1, Math.abs(a - b)],
        `덧셈표는 가로와 세로의 두 수를 더한 값을 씁니다. ${a}+${b}=${a + b}입니다.`,
        'pattern', '덧셈표의 빈칸 채우기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '덧셈표에서 오른쪽으로 한 칸 갈 때마다 수는 어떻게 될까요?',
        '1씩 커진다', ['1씩 작아진다', '2씩 커진다', '변하지 않는다'],
        `오른쪽으로 가면 더하는 수가 1씩 커지므로 합도 1씩 커집니다.`,
        'pattern', '덧셈표에서 가로 규칙 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '덧셈표에서 아래쪽으로 한 칸 갈 때마다 수는 어떻게 될까요?',
        '1씩 커진다', ['1씩 작아진다', '2씩 커진다', '변하지 않는다'],
        `아래로 가면 더해지는 수가 1씩 커지므로 합도 1씩 커집니다.`,
        'pattern', '덧셈표에서 세로 규칙 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        `덧셈표에서 ${a}+${b}와 ${b}+${a}의 값을 비교하면?`,
        '두 값이 같다', [`${a}+${b}가 더 크다`, `${b}+${a}가 더 크다`, '비교할 수 없다'],
        `두 수를 바꾸어 더해도 합은 같습니다. 둘 다 ${a + b}입니다.`,
        'pattern', '덧셈표에서 순서를 바꾼 규칙 찾기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `덧셈표에서 ${a}+${b}=${a + b}일 때 ${a}+${b + 1}은 얼마일까요?`,
      a + b + 1, [a + b, a + b + 2, a + b - 1],
      `더하는 수가 1 커졌으므로 합도 1 커져 ${a + b + 1}입니다.`,
      'pattern', '덧셈표에서 다음 칸 구하기',
    );
  }

  if (title.includes('곱셈표')) {
    const a = 2 + (index % 7);
    const b = 2 + ((index + 3) % 7);
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}와 ${b}가 만나는 칸에 알맞은 수는?`,
        a * b, [a + b, a * b + a, Math.max(0, a * b - b)],
        `곱셈표는 가로와 세로의 두 수를 곱한 값을 씁니다. ${a}×${b}=${a * b}입니다.`,
        'pattern', '곱셈표의 빈칸 채우기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}단은 오른쪽으로 갈수록 몇씩 커질까요?`,
        `${a}씩`, [`${a + 1}씩`, '1씩', `${a * 2}씩`],
        `${a}단은 묶음이 하나씩 늘어나므로 ${a}씩 커집니다.`,
        'pattern', '곱셈표에서 커지는 규칙 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}×${b}와 ${b}×${a}의 값을 비교하면?`,
        '두 값이 같다', [`${a}×${b}가 더 크다`, `${b}×${a}가 더 크다`, '비교할 수 없다'],
        `두 수를 바꾸어 곱해도 곱은 같습니다. 둘 다 ${a * b}입니다.`,
        'pattern', '곱셈표에서 순서를 바꾼 규칙 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '곱셈표에서 같은 수끼리 곱한 칸은 어떻게 놓일까요?',
        '대각선으로 나란히 놓인다',
        ['맨 윗줄에 모인다', '맨 왼쪽 줄에 모인다', '흩어져 있다'],
        `같은 수끼리 곱한 칸은 왼쪽 위에서 오른쪽 아래로 대각선을 이룹니다.`,
        'pattern', '곱셈표의 대각선 규칙 찾기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `곱셈표에서 ${a}×${b}=${a * b}일 때 ${a}×${b + 1}은 얼마일까요?`,
      a * (b + 1), [a * b, a * b + 1, a * (b + 2)],
      `묶음이 하나 늘었으므로 ${a}만큼 커져 ${a * (b + 1)}입니다.`,
      'pattern', '곱셈표에서 다음 칸 구하기',
    );
  }

  if (title.includes('생활에서')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '달력에서 같은 요일은 며칠마다 반복될까요?',
        '7일마다', ['5일마다', '10일마다', '30일마다'],
        `한 주는 7일이므로 같은 요일은 7일마다 다시 나옵니다.`,
        'pattern', '달력에서 규칙 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '신호등이 초록, 노랑, 빨강 순서로 계속 바뀝니다. 빨강 다음에 오는 색은?',
        '초록', ['노랑', '빨강', '알 수 없다'],
        `초록, 노랑, 빨강이 반복되는 규칙이므로 빨강 다음은 다시 초록입니다.`,
        'pattern', '반복되는 순서에서 다음 찾기',
      );
    }
    if (variant === 2) {
      const start = 1 + (index % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `사물함 번호가 ${start}, ${start + 2}, ${start + 4}로 이어집니다. 다음 번호는?`,
        start + 6, [start + 5, start + 8, start + 4],
        `2씩 커지는 규칙이므로 다음은 ${start + 6}입니다.`,
        'pattern', '생활 속 수 배열에서 규칙 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '생활에서 규칙을 찾으면 좋은 점은?',
        '다음에 올 것을 예상할 수 있다',
        ['수를 세지 않아도 된다', '규칙을 바꿀 수 있다', '아무 도움이 안 된다'],
        `규칙을 알면 다음에 무엇이 올지 미리 알 수 있습니다.`,
        'pattern', '규칙을 찾는 까닭 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '계단을 한 칸씩 오를 때마다 높이가 같게 올라갑니다. 이것은 무엇일까요?',
      '반복되는 규칙', ['우연한 일', '규칙이 없는 것', '수의 크기'],
      `같은 크기로 되풀이되는 것은 규칙입니다.`,
      'pattern', '생활 속 규칙 알아보기',
    );
  }

  return null;
};

const patternQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const unitSpecific = ruleUnitQuestion(lesson, difficulty, index);
  if (unitSpecific) return unitSpecific;

  return legacyPatternQuestion(lesson, difficulty, index);
};

const legacyPatternQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
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

// places를 주면 그 자리 수만큼 칸을 만듭니다. 네 자리 수 단원에서는
// 보여 주는 수가 100이더라도 천의 자리 칸이 있어야 합니다. 칸이 없으면
// '100이 70개면 7000'을 천의 자리 없이 생각하게 됩니다.
const placeValueVisualFor = (value: number, label = '자리값표', places?: number): QuestionVisual => {
  const safe = Math.max(0, Math.floor(value));
  const thousands = Math.floor(safe / 1000);
  const hundreds = Math.floor((safe % 1000) / 100);
  const tens = Math.floor((safe % 100) / 10);
  const ones = safe % 10;
  const showThousands = places === undefined ? thousands > 0 : places >= 4;
  const columns = [
    ...(showThousands ? [{ label: '천', value: thousands, blocks: thousands }] : []),
    { label: '백', value: hundreds, blocks: hundreds },
    { label: '십', value: tens, blocks: tens },
    { label: '일', value: ones, blocks: ones },
  ];

  return { kind: 'place-value', label, columns };
};

// activeIndex를 -1로 주면 아무 점도 강조하지 않습니다.
// 강조한 점이 곧 정답이면 학생이 세어 보지 않고도 답을 알게 됩니다.
const numberLineVisualFor = (
  values: number[],
  step = 10,
  label = '수의 길 그림',
  activeIndex = values.length - 1,
): QuestionVisual => {
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
    marks: values.map((value, index) => ({ value, active: index === activeIndex })),
  };
};

// 임의 단위로 재는 차시에 쓰는 그림입니다.
const unitMeasureVisualFor = (object: string, unit: string, count: number): QuestionVisual => ({
  kind: 'unit-measure',
  label: `${object}을 ${unit}으로 재어 본 그림`,
  object,
  unit,
  count,
});

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
  const four = lesson.unitTitle === '네 자리 수';
  const unitBase = four ? 1000 : 100;
  const count = 2 + (index % 7);
  const value = unitBase * count;

  const numberUnit = lesson.unitTitle === '세 자리 수' || four;

  // 몇백몇십몇(몇천몇백몇십몇)을 만드는 것은 4차시에서 배웁니다.
  // 1~3차시에서는 몇백(몇천)까지만 다룹니다.
  if (numberUnit && lesson.lessonNo < 4) {
    const piece = four ? 100 : 10;
    return makeQuestion(
      lesson, difficulty, index,
      `${piece}이 ${count * 10}개이면 얼마일까요?`,
      value,
      [piece * count, value + piece, count * 10],
      `${piece}이 10개이면 ${unitBase}입니다. ${piece}이 ${count * 10}개이면 ${unitBase}이 ${count}개이므로 ${value}입니다.`,
      'placeValue',
      '조건 함께 보기 · 작은 묶음을 큰 묶음으로 바꾸어 세기',
    );
  }

  // 뛰어 세기는 6차시, 크기 비교는 7차시입니다. 그 앞 차시에서는
  // 자리별 묶음까지만 다룹니다.
  const jumpTaught = !numberUnit || lesson.lessonNo >= 6;

  if (!jumpTaught) {
    return makeQuestion(
      lesson, difficulty, index,
      `${unitBase}이 ${count}개, 10이 ${count}개인 수는 얼마일까요?`,
      value + count * 10,
      [value, count * 10, value + count],
      `${unitBase}이 ${count}개면 ${value}이고, 10이 ${count}개면 ${count * 10}입니다. 합하면 ${value + count * 10}입니다.`,
      'placeValue',
      '조건 함께 보기 · 자리별 묶음을 수로 나타내기',
      // 정답을 그대로 그리면 표만 읽고 답을 쓸 수 있으므로 묻는 자리는 비워 둡니다.
      tableVisualFor(
        (four ? ['천', '백', '십', '일'] : ['백', '십', '일']).map((name, position, all) => ({
          name,
          value: position === all.length - 1 ? 0 : null,
        })),
        '자리값 표',
        { categoryLabel: '자리', valueLabel: '숫자' },
      ),
    );
  }

  const step = four ? 100 : 10;
  const start = unitBase * count;
  return makeQuestion(
    lesson, difficulty, index,
    `${start}에서 ${step}씩 3번 뛰어 센 수는 얼마일까요?`,
    start + step * 3,
    [start + step, start + step * 2, start + step * 4],
    `${step}씩 3번이면 ${step * 3}만큼 커지므로 ${start + step * 3}입니다.`,
    'number',
    '조건 함께 보기 · 여러 번 뛰어 센 수 구하기',
    // 마지막 점을 찍으면 그림이 답이 되므로 세 번째까지만 보여 줍니다.
    numberLineVisualFor([start, start + step, start + step * 2], step, '수의 위치 자료'),
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
  const start = 1 + (index % 6);
  const span = difficulty === '중' ? 7 + (index % 5) : 9 + (index % 7);
  const end = start + span;

  // 2-1 길이 재기는 4차시에서 1cm를, 5차시에서 자 읽는 방법을 배웁니다.
  const rulerTaught = lesson.unitTitle !== '길이 재기' || lesson.semester === '2-2' || lesson.lessonNo >= 5;

  if (!rulerTaught) {
    const clips = 3 + (index % 5);
    const more = clips + 1 + (index % 3);
    return makeQuestion(
      lesson, difficulty, index,
      `같은 연필을 클립으로 재면 ${clips}번, 지우개로 재면 ${more}번이었습니다. 더 짧은 단위는?`,
      '지우개',
      ['클립', '두 단위가 같다', '알 수 없다'],
      `같은 길이를 잴 때 잰 횟수가 많을수록 단위가 짧습니다. 지우개로 ${more}번이므로 지우개가 더 짧습니다.`,
      'measurement',
      '조건 함께 보기 · 잰 횟수로 단위의 길이 견주기',
    );
  }

  return makeQuestion(
    lesson, difficulty, index,
    `자의 ${start}cm 눈금부터 ${end}cm 눈금까지 잰 선분을 ${end}cm라고 읽었습니다. 바른 길이는?`,
    `${span}cm`,
    [`${end}cm`, `${start}cm`, `${span + start}cm`],
    `시작 눈금이 0이 아니므로 끝 눈금에서 시작 눈금을 뺍니다. ${end}-${start}=${span}cm입니다.`,
    'measurement',
    '조건 함께 보기 · 시작 눈금을 빼고 길이 읽기',
    rulerVisualFor(start, end, '자로 잰 길이'),
  );
};
const richDataQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const unit = difficulty === '상' ? 2 : 1;
  const items = [
    { label: '축구', count: 5 + (index % 4) * unit },
    { label: '줄넘기', count: 7 + ((index + 1) % 4) * unit },
    { label: '책읽기', count: 4 + ((index + 2) % 4) * unit },
  ];
  const most = items.reduce((best, item) => (item.count > best.count ? item : best));
  const least = items.reduce((best, item) => (item.count < best.count ? item : best));
  const answer = most.count - least.count;
  const tag = lesson.tags.includes('classification') ? 'classification' : 'data';

  // 그래프는 표와 그래프 4차시에서 배웁니다. 그 앞 차시와 분류하기 단원에서는
  // 그래프를 쓰지 않습니다. 분류하기는 4차시부터 수를 셉니다.
  const graphTaught = lesson.unitTitle === '표와 그래프' && lesson.lessonNo >= 4;

  if (lesson.unitTitle === '분류하기' && lesson.lessonNo < 4) {
    return makeQuestion(
      lesson, difficulty, index,
      '연필, 지우개, 색종이, 풀을 나눌 때 알맞은 분류 기준은?',
      '쓰임',
      ['좋아하는 정도', '값이 비싼 순서', '새것인지 아닌지'],
      '연필과 지우개는 쓰고 지울 때, 색종이와 풀은 만들 때 쓰므로 쓰임으로 나눌 수 있습니다.',
      'classification',
      '조건 함께 보기 · 여러 물건에 맞는 기준 고르기',
    );
  }

  if (!graphTaught) {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    return makeQuestion(
      lesson, difficulty, index,
      '표를 보고 가장 많은 항목과 가장 적은 항목의 차를 구하세요.',
      answer,
      [most.count, least.count, total],
      `표에서 가장 많은 것은 ${most.label} ${most.count}명, 가장 적은 것은 ${least.label} ${least.count}명입니다. 차는 ${most.count}-${least.count}=${answer}명입니다.`,
      tag,
      '자료 해석 · 표에서 가장 많은 것과 적은 것의 차 읽기',
      tableVisualFor(
        items.map((item) => ({ name: item.label, value: item.count })),
        '좋아하는 활동별 학생 수',
        { categoryLabel: '활동', valueLabel: '학생 수(명)', totalLabel: '합계', total },
      ),
    );
  }

  return makeQuestion(
    lesson, difficulty, index,
    `그림그래프를 보고 가장 많은 항목과 가장 적은 항목의 차를 구하세요. 한 칸은 ${unit}명을 나타냅니다.`,
    answer,
    [most.count, least.count, answer + unit],
    `그래프에서 가장 많은 것은 ${most.label} ${most.count}명, 가장 적은 것은 ${least.label} ${least.count}명입니다. 차는 ${most.count}-${least.count}=${answer}명입니다.`,
    tag,
    '자료 해석 · 그림그래프의 단위와 차이 읽기',
    pictographVisualFor(items, unit, '좋아하는 활동 그림그래프'),
  );
};
const richMultiplicationQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const rows = difficulty === '중' ? 4 + (index % 3) : 6 + (index % 4);
  const columns = difficulty === '중' ? 5 + (index % 3) : 7 + (index % 3);
  const hardRemovedRows = 2 + ((index + Math.floor(index / 3)) % 3);
  const removedRows = difficulty === '상' ? Math.min(hardRemovedRows, rows - 2) : 1;
  const answer = (rows - removedRows) * columns;

  // 2-1 곱셈 단원은 6차시에서 곱셈식을 배웁니다. 그 앞 차시에서는
  // 묶어 세기까지만 다루어야 합니다.
  const timesTaught = lesson.unitTitle !== '곱셈' || lesson.lessonNo >= 6;

  if (!timesTaught) {
    return makeQuestion(
      lesson, difficulty, index,
      `배열 그림은 한 줄에 ${columns}개씩 ${rows}줄입니다. 아래쪽 ${removedRows}줄을 가리면 보이는 것은 몇 개일까요?`,
      answer,
      [rows * columns, removedRows * columns, answer + columns],
      `처음에는 ${columns}개씩 ${rows}줄입니다. ${removedRows}줄을 가리면 ${rows - removedRows}줄이 보이므로 ${columns}씩 ${rows - removedRows}묶음, 곧 ${answer}개입니다.`,
      'multiplication',
      '조건 함께 보기 · 배열에서 보이는 묶음만 세기',
      arrayVisualFor(rows, columns, '일정한 배열 그림', removedRows),
    );
  }

  return makeQuestion(
    lesson, difficulty, index,
    `배열 그림은 한 줄에 ${columns}개씩 ${rows}줄입니다. 아래쪽 ${removedRows}줄을 가리면 보이는 것은 몇 개일까요?`,
    answer,
    [rows * columns, removedRows * columns, answer + columns],
    `처음에는 ${columns}개씩 ${rows}줄입니다. ${removedRows}줄을 가리면 ${rows - removedRows}줄이 보이므로 ${columns}×${rows - removedRows}=${answer}개입니다.`,
    'multiplication',
    '조건 함께 보기 · 배열에서 보이는 묶음만 계산',
    arrayVisualFor(rows, columns, '일정한 배열 그림', removedRows),
  );
};
const richTimeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const title = lesson.title;
  const hour = 2 + (index % 7);

  // 8차시 달력: 시계가 아니라 달력 자료를 해석합니다.
  if (title.includes('달력')) {
    const day = 3 + (index % 20);
    const later = day + 7;
    if (index % 2 === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `달력에서 ${day}일이 수요일입니다. ${later}일은 무슨 요일일까요?`,
        '수요일',
        ['목요일', '화요일', '금요일'],
        `같은 요일은 7일마다 돌아옵니다. ${day}일에서 7일 뒤인 ${later}일도 수요일입니다.`,
        'time',
        '자료 해석 · 달력에서 요일의 반복 읽기',
        calendarVisualFor([{ day, tone: 'start' }], '요일이 반복되는 달력'),
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '달력을 보고 1주일과 1개월의 관계로 알맞은 것은?',
      '1개월은 4주가 조금 넘는다',
      ['1개월은 정확히 4주이다', '1개월은 2주이다', '1개월은 7일이다'],
      `1주일은 7일이고 한 달은 28일에서 31일이므로 4주보다 조금 깁니다.`,
      'time',
      '자료 해석 · 달력에서 주와 달의 관계 읽기',
      calendarVisualFor([], '한 달 달력'),
    );
  }

  // 7차시 하루의 시간: 오전과 오후를 조건으로 읽습니다.
  if (title.includes('하루의 시간')) {
    return makeQuestion(
      lesson, difficulty, index,
      `오전 ${hour}시부터 오후 ${hour}시까지는 몇 시간일까요?`,
      '12시간',
      ['24시간', `${hour}시간`, '6시간'],
      `오전 ${hour}시에서 오후 ${hour}시까지는 반나절이므로 12시간입니다.`,
      'time',
      '자료 해석 · 오전과 오후로 하루 읽기',
    );
  }

  // 6차시 걸린 시간: 여기서부터 두 시계를 비교할 수 있습니다.
  if (title.includes('걸린 시간')) {
    const minute = difficulty === '중' ? 25 + (index % 3) * 5 : 40 + (index % 3) * 5;
    const elapsed = difficulty === '중' ? 45 : 75;
    const totalMinute = hour * 60 + minute + elapsed;
    const endHour = Math.floor(totalMinute / 60);
    const endMinute = totalMinute % 60;

    return makeQuestion(
      lesson, difficulty, index,
      '두 시계를 보고 시작 시각부터 끝 시각까지 걸린 시간을 구하세요.',
      `${elapsed}분`,
      [`${endMinute}분`, `${elapsed - 15}분`, `${elapsed + 15}분`],
      `시작은 ${hour}시 ${minute}분, 끝은 ${endHour}시 ${endMinute}분입니다. 1시간을 넘으면 60분을 먼저 세고 남은 분을 더해 ${elapsed}분입니다.`,
      'time',
      '자료 해석 · 두 시계 사이의 시간 구하기',
      clockVisualFor(hour, minute, '시작과 끝 시각', endHour, endMinute),
    );
  }

  // 5차시 1시간: 시간과 분을 서로 바꿉니다.
  if (title.includes('1시간')) {
    const minutes = 60 + 5 * (1 + (index % 8));
    return makeQuestion(
      lesson, difficulty, index,
      `${minutes}분은 몇 시간 몇 분일까요?`,
      `1시간 ${minutes - 60}분`,
      [`${minutes}시간`, `2시간 ${minutes - 60}분`, `1시간 ${minutes}분`],
      `60분이 1시간입니다. ${minutes}-60=${minutes - 60}이므로 1시간 ${minutes - 60}분입니다.`,
      'time',
      '자료 해석 · 시간과 분을 바꾸어 읽기',
    );
  }

  // 4차시 몇 분 전: 같은 시각을 두 가지로 읽습니다.
  if (title.includes('여러 가지 방법')) {
    const before = 5 * (1 + (index % 3));
    const minute = 60 - before;
    const nextHour = hour === 12 ? 1 : hour + 1;
    return makeQuestion(
      lesson, difficulty, index,
      '시계를 보고 몇 시 몇 분 전으로 읽어 보세요.',
      `${nextHour}시 ${before}분 전`,
      [`${hour}시 ${before}분 전`, `${nextHour}시 ${minute}분 전`, `${hour}시 ${before}분`],
      `${hour}시 ${minute}분은 ${nextHour}시가 되기 ${before}분 전입니다.`,
      'time',
      '자료 해석 · 시계를 몇 분 전으로 읽기',
      clockVisualFor(hour, minute, '시각 자료'),
    );
  }

  // 3차시 1분 단위 읽기
  if (title.includes('⑵')) {
    const base = 5 * (1 + (index % 10));
    const extra = 1 + (index % 4);
    const minute = base + extra;
    return makeQuestion(
      lesson, difficulty, index,
      '시계를 보고 몇 시 몇 분인지 읽어 보세요.',
      `${hour}시 ${minute}분`,
      [`${hour}시 ${base}분`, `${hour}시 ${minute + 5}분`, `${hour + 1}시 ${minute}분`],
      `숫자 ${base / 5}까지는 ${base}분이고 작은 눈금 ${extra}칸을 더 가면 ${minute}분입니다.`,
      'time',
      '자료 해석 · 작은 눈금까지 시각 읽기',
      clockVisualFor(hour, minute, '시각 자료'),
    );
  }

  // 1~2차시: 5분 단위 읽기까지만 다룹니다.
  const five = 5 * (1 + (index % 11));
  return makeQuestion(
    lesson, difficulty, index,
    '시계를 보고 몇 시 몇 분인지 읽어 보세요.',
    `${hour}시 ${five}분`,
    [`${hour}시 ${five / 5}분`, `${hour + 1}시 ${five}분`, `${five}시 ${hour}분`],
    `긴바늘이 숫자 ${five / 5}를 가리키므로 ${five}분이고, 짧은바늘이 지나온 숫자가 ${hour}시입니다.`,
    'time',
    '자료 해석 · 시계를 보고 5분 단위로 읽기',
    clockVisualFor(hour, five, '시각 자료'),
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

// '원 1개와 삼각형 1개의 꼭짓점을 모두 세면?' 같은 문제에 쓰는 그림입니다.
// 전에는 원·삼각형·사각형 셋을 늘 그리고 번호를 붙였는데, 두 가지 문제가
// 있었습니다. 문제에 없는 도형까지 그려져 그것도 세게 되고, 도형 아래 번호가
// '번호를 고르는 문제'처럼 보였습니다. 문제가 말한 도형만, 번호 없이 그립니다.
const shapeVisualForTargets = (label: string, targets: PlaneTarget[], index: number): QuestionVisual =>
  planeShapesVisual(
    label,
    targets.map((target, targetIndex) => itemForShape(target, true, '', index + targetIndex)),
  );

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
      ['원', '굽은 선으로 된 모양', '꼭짓점이 없는 모양'],
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
        ? ['변 3개, 꼭짓점 3개', '변 4개, 꼭짓점 4개', '변 5개, 꼭짓점 5개']
        : target === '삼각형'
          ? ['굽은 선, 꼭짓점 0개', '변 4개, 꼭짓점 4개', '변 5개, 꼭짓점 5개']
          : ['굽은 선, 꼭짓점 0개', '변 3개, 꼭짓점 3개', '변 5개, 꼭짓점 5개'],
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
        ? ['곧은 변 3개가 있습니다.', '곧은 변 4개가 있습니다.', '곧은 변 5개가 있습니다.']
        : target === '삼각형'
          ? ['굽은 선으로만 둘러싸여 있습니다.', '변과 꼭짓점이 4개씩 있습니다.', '곧은 변이 없습니다.']
          : ['굽은 선으로만 둘러싸여 있습니다.', '변과 꼭짓점이 3개씩 있습니다.', '곧은 변이 없습니다.'],
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
  if (lesson.unitNo === 2 && lesson.semester === '2-1') {
    // 6~7차시가 쌓기나무 차시입니다. 단원 도입은 도형 찾기로 다룹니다.
    if (lesson.lessonNo >= 6) return true;
  }
  return lesson.tags.includes('solid') && !lesson.tags.includes('shape');
};

// -- 2-1 2단원 여러 가지 도형: 쌓기나무 차시 (지도서 195~197쪽) --
// 6차시 쌓은 모양을 알아볼까요: 쌓인 모양을 위·앞·옆과 층으로 설명하기
// 7차시 여러 가지 모양으로 쌓아 볼까요: 같은 개수로 여러 모양 만들기
const blockUnitQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (lesson.unitTitle !== '여러 가지 도형') return null;

  const title = lesson.title;
  const variant = variantForDifficulty(difficulty, index, 5, 3);
  const cubes = 3 + (index % 3);

  // 단원 도입: 생활 주변에서 여러 가지 도형 찾기
  if (title.includes('단원 도입')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '동전이나 시계처럼 어느 쪽에서 보아도 둥근 모양은?',
        '원', ['삼각형', '사각형', '곧은 선'],
        '어느 쪽에서 보아도 둥근 모양을 원이라고 합니다.',
        'shape', '생활 물건에서 원 찾기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        '창문이나 책처럼 곧은 변 4개로 둘러싸인 모양은?',
        '사각형', ['원', '삼각형', '굽은 선'],
        '곧은 변 4개로 둘러싸인 모양을 사각형이라고 합니다.',
        'shape', '생활 물건에서 사각형 찾기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '교통 표지판처럼 곧은 변 3개로 둘러싸인 모양은?',
        '삼각형', ['원', '사각형', '둥근 모양'],
        '곧은 변 3개로 둘러싸인 모양을 삼각형이라고 합니다.',
        'shape', '생활 물건에서 삼각형 찾기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '도형의 이름을 정할 때 무엇을 보아야 할까요?',
        '변과 꼭짓점의 수, 굽은 선인지 곧은 선인지',
        ['색깔과 크기', '만든 재료', '놓인 자리'],
        '도형은 크기나 색깔이 아니라 변과 꼭짓점 같은 성질로 구별합니다.',
        'shape', '도형을 구별하는 기준 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '주변에서 도형을 찾아볼 때 알맞은 말은?',
      '물건의 모양을 도형으로 바꾸어 본다',
      ['물건의 무게를 잰다', '물건의 값을 알아본다', '물건을 세어 본다'],
      '물건의 겉모양을 원, 삼각형, 사각형처럼 도형으로 바라볼 수 있습니다.',
      'shape', '생활 속 도형 찾아보기',
    );
  }

  if (title.includes('쌓은 모양을 알아')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        '쌓은 모양을 친구에게 설명할 때 쓰면 좋은 말은?',
        '앞, 옆, 위와 몇 층',
        ['예쁘다, 멋있다', '크다, 작다', '많다, 적다'],
        '쌓은 모양은 방향과 층을 써야 정확히 설명할 수 있습니다.',
        'solid', '쌓은 모양을 설명하는 말 알기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무 ${cubes}개를 옆으로 나란히 놓았습니다. 몇 층일까요?`,
        '1층', ['2층', `${cubes}층`, '3층'],
        '옆으로만 놓으면 위로 쌓이지 않으므로 1층입니다.',
        'solid', '층수 세어 보기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        '쌓기나무를 셀 때 뒤에 가려진 것은 어떻게 해야 할까요?',
        '가려진 것도 빠뜨리지 않고 센다',
        ['보이는 것만 센다', '가려진 것은 빼고 센다', '두 번 센다'],
        '보이지 않아도 쌓기나무가 있을 수 있으므로 함께 세어야 합니다.',
        'solid', '가려진 쌓기나무까지 세기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '쌓기나무 2개를 위로 포개어 놓으면 몇 층일까요?',
        '2층', ['1층', '3층', '4층'],
        '위로 하나씩 포개면 층이 하나씩 늘어나므로 2층입니다.',
        'solid', '위로 쌓을 때의 층 알기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '친구가 설명한 대로 똑같이 쌓으려면 무엇을 알아야 할까요?',
      '쌓기나무의 개수와 놓인 위치',
      ['쌓기나무의 색깔', '쌓은 사람의 이름', '쌓은 시간'],
      '개수와 위치를 알아야 같은 모양으로 쌓을 수 있습니다.',
      'solid', '똑같이 쌓기 위해 필요한 정보 알기',
    );
  }

  if (title.includes('여러 가지 모양으로 쌓아')) {
    if (variant === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무 ${cubes}개로 서로 다른 모양을 만들 수 있을까요?`,
        '개수가 같아도 여러 모양을 만들 수 있다',
        ['한 가지 모양만 된다', '만들 수 없다', '개수가 달라진다'],
        '같은 개수라도 놓는 위치를 바꾸면 여러 모양이 됩니다.',
        'solid', '같은 개수로 여러 모양 만들기',
      );
    }
    if (variant === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무 ${cubes}개로 만든 두 모양이 다릅니다. 쌓기나무의 개수는?`,
        '두 모양 모두 같다',
        ['앞의 모양이 더 많다', '뒤의 모양이 더 많다', '알 수 없다'],
        `모양이 달라도 사용한 쌓기나무는 ${cubes}개로 같습니다.`,
        'solid', '모양이 달라도 개수는 같음 알기',
      );
    }
    if (variant === 2) {
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무 ${cubes}개로 만든 모양에 1개를 더 놓으면 몇 개일까요?`,
        `${cubes + 1}개`, [`${cubes}개`, `${cubes + 2}개`, `${cubes - 1}개`],
        `${cubes}개에 1개를 더하면 ${cubes + 1}개입니다.`,
        'solid', '쌓기나무를 더할 때의 개수 구하기',
      );
    }
    if (variant === 3) {
      return makeQuestion(
        lesson, difficulty, index,
        '똑같은 모양으로 쌓았는지 확인하는 방법은?',
        '개수와 놓인 자리를 하나씩 맞추어 본다',
        ['색깔을 비교한다', '높이만 본다', '멀리서 본다'],
        '개수와 놓인 자리가 모두 같아야 똑같은 모양입니다.',
        'solid', '같은 모양인지 확인하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      '쌓기나무로 모양을 만들 때 아래층을 먼저 놓는 까닭은?',
      '아래가 받쳐 주어야 위에 쌓을 수 있어서',
      ['색깔을 맞추려고', '개수를 세려고', '높이를 낮추려고'],
      '아래층이 없으면 위에 쌓을 수 없으므로 아래부터 놓습니다.',
      'solid', '쌓는 차례 생각하기',
    );
  }

  return null;
};

const shapeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question => {
  const blockUnit = blockUnitQuestion(lesson, difficulty, index);
  if (blockUnit) return blockUnit;
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

  // 3의 배수 자리는 기존 유형 10문항, 나머지 20자리는 풀이 과정 문항입니다.
  // 심화 문항은 기존 유형 자리에만 놓아 두 종류가 서로 밀어내지 않게 합니다.
  const hardSlots = new Set([0, 3, 6, 9, 12, 15, 18, 21, 24, 27]);
  const mediumSlots = new Set([0, 6, 12, 18, 24, 27]);
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

// 자리 수는 단원에서 정합니다. 정답의 자리 수로 정하면 '답이 네 자리구나'
// 하고 보기 하나를 지울 수 있게 되므로, 답이 아니라 단원을 봅니다.
const placesForUnit = (lesson: Lesson) => (lesson.unitTitle.includes('네 자리 수') ? 4 : 3);

const visualForGeneratedQuestion = (
  question: Question,
  index: number,
  lesson: Lesson,
): QuestionVisual | undefined => {
  if (question.visual) return question.visual;
  const places = placesForUnit(lesson);

  const answerNumber = numberFromAnswer(question.answer);
  const promptNumbers = question.prompt.match(/\d+/g)?.map(Number) ?? [];

  if (question.type === 'placeValue') {
    // '6000은 1000이 몇 개인 수일까요?' 같은 문제는 자리값 표에 답이 그대로
    // 보입니다. 묻는 자리를 빈칸으로 두어 생각할 거리는 남기고 답은 가립니다.
    if (/몇 개인 수|자리 숫자는 무엇/.test(question.prompt)) {
      const shown = promptNumbers.find((value) => Number.isFinite(value) && value >= 100);
      if (shown === undefined) return undefined;

      const digits = String(shown).padStart(places, '0').split('').map(Number);
      const names = places >= 4 ? ['천', '백', '십', '일'] : ['백', '십', '일'];
      if (digits.length !== names.length) return undefined;

      // 앞자리를 0으로 채워 칸을 맞췄으므로, 가릴 자리도 그만큼 밀립니다.
      // 맨 앞 칸을 가리면 0을 가리는 셈이 되어 정답이 그대로 보입니다.
      const leading = digits.findIndex((digit) => digit > 0);
      const blankAt = leading === -1 ? 0 : leading;

      return tableVisualFor(
        names.map((name, position) => ({ name, value: position === blankAt ? null : digits[position] })),
        '자리값 표',
        { categoryLabel: '자리', valueLabel: '숫자' },
      );
    }

    // 표는 문제에 나온 수로만 만듭니다. 정답으로 만들면 '1000이 4개, 10이 4개인
    // 수는?' 같은 문제에서 표가 곧 답(4040)이 되어 버립니다.
    const fromPrompt = promptNumbers.filter((value) => Number.isFinite(value));
    const shown = fromPrompt.length ? Math.max(...fromPrompt) : 100;
    if (Number.isFinite(answerNumber) && shown === answerNumber) return undefined;

    return placeValueVisualFor(shown, '자리값 시각자료', places);
  }

  if (question.type === 'number') {
    // 답이 '이천'처럼 수가 아니면 수직선을 만들 수 없습니다.
    // 예전에는 NaN으로 그려져 점 하나와 선만 남은 그림이 나왔습니다.
    const values = promptNumbers.length >= 2
      ? promptNumbers.slice(0, 3)
      : Number.isFinite(answerNumber)
        ? [Math.max(0, answerNumber - 20), answerNumber, answerNumber + 20]
        : [];

    if (values.length === 0) {
      const shown = promptNumbers.find((value) => Number.isFinite(value));
      return shown === undefined ? undefined : placeValueVisualFor(shown, '자리값 시각자료', places);
    }

    // '14보다 1만큼 더 큰 수'는 한 칸만 움직이면 되는 문제입니다.
    // 눈금이 13씩이면 셀 수가 없습니다. 눈금 한 칸을 문제가 말하는 크기와
    // 같게 맞추면(1만큼이면 1씩, 10만큼이면 10씩) 한 칸만 세면 됩니다.
    // 필요한 언저리만 보여 주고, 정답 자리는 눈금만 두고 숫자는 감춥니다.
    const nearby = question.prompt.match(/(\d+)보다 (\d+)만큼 더 (큰|작은)/);
    if (nearby) {
      const from = Number(nearby[1]);
      const gap = Number(nearby[2]);
      const target = nearby[3] === '큰' ? from + gap : from - gap;

      if (Number.isFinite(from) && Number.isFinite(gap) && gap >= 1 && target >= 0) {
        const low = Math.max(0, Math.min(from, target) - gap * 3);
        const high = Math.max(from, target) + gap * 3;
        return {
          kind: 'number-line',
          label: `${from}에서 ${gap}씩 세어 보는 자료`,
          start: low,
          end: high,
          step: gap,
          marks: [{ value: from, label: `${from}`, active: true }],
          hiddenLabels: [target],
        };
      }
    }

    // '634보다 크고 638보다 작은 수'는 사이의 수를 하나씩 세어야 합니다.
    // 눈금이 1씩이어야 수직선을 보고 셀 수 있습니다.
    const between = question.prompt.match(/(\d+)보다 크고 (\d+)보다 작은/);
    if (between) {
      const from = Number(between[1]);
      const to = Number(between[2]);
      if (Number.isFinite(from) && Number.isFinite(to) && to > from && to - from <= 10) {
        return numberLineVisualFor([from, to], 1, '두 수 사이를 세는 자료', -1);
      }
    }

    // 뛰어 세는 문제는 문제에 적힌 뛰는 크기가 곧 눈금 간격입니다.
    // '3000에서 1000씩'인데 눈금이 300씩이면 세어 볼 수가 없습니다.
    const jump = question.prompt.match(/(\d+)에서 (\d+)씩/);
    if (jump) {
      const start = Number(jump[1]);
      const step = Number(jump[2]);
      if (Number.isFinite(start) && Number.isFinite(step) && step > 0) {
        return numberLineVisualFor(
          [start, start + step, start + step * 2, start + step * 3],
          step,
          '수의 위치 자료',
          // 마지막 점이 답인 경우가 많아 강조하지 않습니다.
          -1,
        );
      }
    }

    const gap = Math.max(1, values.length >= 2 ? Math.abs(values[1] - values[0]) || 10 : 10);
    // 눈금이 너무 촘촘하지 않도록 간격을 값의 크기에 맞춥니다.
    const span = Math.max(...values) - Math.min(...values);
    const step = span > 0 ? Math.max(gap, Math.ceil(span / 8)) : gap;
    // 정답이 그림에 굵게 표시되면 답을 알려 주는 셈이 됩니다.
    const answerShown = Number.isFinite(answerNumber) && values.includes(answerNumber);
    return numberLineVisualFor(
      values,
      step,
      '수의 위치 자료',
      answerShown ? -1 : values.length - 1,
    );
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
    // 규칙 찾기 단원에는 무늬 규칙 말고도 곱셈표·덧셈표 규칙이 있습니다.
    // 전에는 어떤 문제든 ○△□ 무늬를 붙여서, 곱셈표 문제 옆에 아무 상관 없는
    // 도형이 놓였습니다. 문제가 무엇을 보라고 하는지에 따라 그림을 고릅니다.

    // ① 문제가 무늬를 늘어놓았으면 그 무늬를 그대로 그립니다.
    //    정해 둔 무늬를 그리면 문제는 ○○△라는데 그림은 ○△□인 일이 생깁니다.
    //    쉼표로 이어진 것만 봅니다. □는 빈칸 기호로도 쓰여서, 낱개로 세면
    //    '□에 알맞은 수는?'의 빈칸까지 도형으로 세어 버립니다.
    const shapeRun = question.prompt.match(/[○△◇☆●▲■♥□](?:\s*,\s*[○△◇☆●▲■♥□]){2,}/);
    if (shapeRun) {
      const drawn = shapeRun[0].match(/[○△◇☆●▲■♥□]/g) ?? [];
      return patternVisualFor([...drawn, '?'], '무늬 규칙 자료', drawn.length);
    }

    // ② 곱셈표·덧셈표 문제에는 그 표를 그려 줍니다. 표에서 규칙을 찾아
    //    설명하는 것이 이 차시의 목표이므로, 표가 곧 학습 자료입니다.
    const table = question.prompt.match(/(곱셈표|덧셈표)/);
    if (table) {
      const operation: '×' | '+' = table[1] === '곱셈표' ? '×' : '+';
      const span = (centre: number, count: number) => {
        const from = Math.max(1, Math.min(9 - count + 1, centre - Math.floor(count / 2)));
        return Array.from({ length: count }, (_, at) => from + at);
      };

      // 'a×b는 얼마일까요?'는 계산해서 답을 내야 하므로 그 칸만 비웁니다.
      const asked = question.prompt.match(/(\d+)\s*[×+]\s*(\d+)은?\s*얼마/);
      if (asked) {
        const row = Number(asked[1]);
        const column = Number(asked[2]);
        if (row >= 1 && row <= 9 && column >= 1 && column <= 9) {
          return {
            kind: 'grid-table',
            label: `${table[1]}의 한 부분`,
            operation,
            rows: span(row, 4),
            columns: span(column, 5),
            blank: { row, column },
          };
        }
      }

      // 'N단은 오른쪽으로 갈수록 몇씩 커질까요?'는 그 줄을 짚어 줍니다.
      const dan = question.prompt.match(/(\d+)단/);
      const centre = dan ? Number(dan[1]) : 3;
      return {
        kind: 'grid-table',
        label: `${table[1]}의 한 부분`,
        operation,
        rows: span(centre, 4),
        columns: span(3, 5),
        ...(dan ? { highlightRow: centre } : {}),
      };
    }

    // ③ '4, 6, 8, 10, □ 에서 □는?' 같은 수 규칙입니다. 늘어놓은 수를 그대로
    //    칸에 적고 마지막을 물음표로 둡니다. 아이가 칸을 짚어 가며 얼마씩
    //    커지는지 셀 수 있습니다.
    const numberRun = question.prompt.match(/\d+\s*(?:,\s*\d+\s*){2,}/);
    if (numberRun) {
      const drawn = numberRun[0].match(/\d+/g) ?? [];
      return patternVisualFor([...drawn, '?'], '수 규칙 자료', drawn.length);
    }

    // ④ 늘어놓은 것이 문제에 적혀 있지 않은 규칙 문제입니다.
    //    '무늬에서 ?에 들어갈 모양은?'처럼 그림이 곧 자료인 문제와,
    //    '생활에서 규칙을 찾는 방법은?'처럼 되풀이 자체를 묻는 문제입니다.
    //    여기서는 되풀이의 본보기로 무늬 한 줄을 보여 줍니다.
    //    곱셈표·덧셈표는 위(②)에서 이미 자기 표를 받았으므로 여기 오지 않습니다.
    if (/무늬|모양|색|되풀이|반복|규칙/.test(question.prompt)) {
      return patternVisualFor(['○', '△', '□', '○', '△', '□', '○'], '무늬 규칙 자료', 6);
    }

    // ⑤ 그 밖에는 그림 없이 둡니다. 상관없는 그림보다 없는 편이 낫습니다.
    return undefined;
  }

  return undefined;
};

const withRichVisual = (question: Question, index: number, lesson: Lesson): Question => {
  const visual = visualForGeneratedQuestion(question, index, lesson);
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

// time 태그에는 시계 차시와 달력 차시가 함께 있습니다.
// 달력 문제에 '긴바늘' 같은 시계 힌트가 붙지 않도록 문제에 맞는 힌트를 고릅니다.
const calendarPromptNotes = [
  '달력에서 같은 줄과 같은 칸을 살펴봐요.',
  '날짜를 하나씩 짚으며 세어 봐요.',
  '한 주가 며칠인지 떠올려요.',
  '문제에서 묻는 것을 다시 읽어요.',
  '달력의 요일 이름을 먼저 봐요.',
];

const notesForQuestion = (question: Question) => {
  if (question.type === 'time' && /달력|요일|며칠|날짜/.test(question.prompt)) {
    return calendarPromptNotes;
  }
  return promptNotes[question.type];
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

    const notes = notesForQuestion(question);
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

// ── 풀이 과정 빈칸 문항 ────────────────────────────────────────────────────
// 답만 묻는 문제는 학생이 어떻게 풀었는지 알기 어렵습니다. 교육부·시도교육청
// 평가지에서 쓰는 방식대로 풀이 과정을 단계로 보여 주고 그중 한 곳을 □로
// 비워 두면, 학생이 과정을 따라가며 생각하게 됩니다.
// (예: "짧은바늘이 2와 3 사이이므로 □시입니다. 긴바늘이 …")
const stepBlankQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  const unit = lesson.unitTitle;
  const title = lesson.title;
  const seed = n(lesson, index);
  const pick = index % 2;

  // 덧셈과 뺄셈: 받아올림·받아내림 과정의 한 단계를 비웁니다.
  if (unit === '덧셈과 뺄셈') {
    // 덧셈 ⑴ : (두 자리)+(한 자리). 일의 자리에서 무슨 일이 일어나는지 봅니다.
    if (title.includes('덧셈을 해 볼까요 ⑴')) {
      const a = 10 * (1 + (seed % 8)) + (5 + (seed % 4));
      const b = 10 - (a % 10) + (1 + (index % 4));
      const onesSum = (a % 10) + b;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 계산하는 과정입니다. □에 알맞은 수는? ① 일의 자리끼리 더하면 ${a % 10}+${b}=□ ② 10이 넘으므로 십의 자리로 1을 올립니다.`,
        onesSum, [onesSum % 10, onesSum + 10, Math.max(0, onesSum - 10)],
        `일의 자리끼리 더하면 ${a % 10}+${b}=${onesSum}입니다.`,
        'addition', '일의 자리 합을 구하는 과정',
      );
    }

    // 덧셈 ⑵ : (두 자리)+(두 자리). 올린 1을 십의 자리에 더하는 곳을 봅니다.
    if (title.includes('덧셈을 해 볼까요 ⑵')) {
      const a = 10 * (1 + (seed % 6)) + (6 + (seed % 3));
      const b = 10 * (1 + ((seed + 1) % 3)) + (10 - (a % 10) + (index % 3));
      const onesSum = (a % 10) + (b % 10);
      const tens = Math.floor(a / 10) + Math.floor(b / 10) + 1;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 계산하는 과정입니다. □에 알맞은 수는? ① 일의 자리: ${a % 10}+${b % 10}=${onesSum}, ${onesSum % 10}을 쓰고 1을 올립니다. ② 십의 자리: ${Math.floor(a / 10)}+${Math.floor(b / 10)}+1=□`,
        tens, [tens - 1, tens + 1, onesSum],
        `올린 1까지 더하면 십의 자리는 ${tens}이 됩니다.`,
        'addition', '올린 수까지 더해 십의 자리를 구하는 과정',
      );
    }

    // 여러 가지 방법으로 덧셈 : 수를 갈라 큰 자리부터 더하는 방법
    if (title.includes('여러 가지 방법으로 덧셈')) {
      const a = 10 * (2 + (seed % 3)) + (3 + (seed % 5));
      const bTens = 10 * (1 + (seed % 3));
      const bOnes = 2 + (index % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${bTens + bOnes}를 갈라서 계산하는 과정입니다. □에 알맞은 수는? ① ${bTens + bOnes}을 ${bTens}과 ${bOnes}으로 가릅니다. ② ${a}+${bTens}=${a + bTens} ③ ${a + bTens}+${bOnes}=□`,
        a + bTens + bOnes, [a + bTens, a + bOnes, a + bTens + bOnes + 10],
        `갈라서 차례로 더하면 ${a + bTens}+${bOnes}=${a + bTens + bOnes}입니다.`,
        'addition', '수를 갈라 차례로 더하는 과정',
      );
    }

    // 뺄셈 ⑴ : (두 자리)-(한 자리). 십의 자리에서 10을 가져오는 곳을 봅니다.
    if (title.includes('뺄셈을 해 볼까요 ⑴')) {
      const a = 10 * (3 + (seed % 6)) + (seed % 4);
      const b = (a % 10) + 2 + (index % 5);
      const borrowed = (a % 10) + 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}를 계산하는 과정입니다. □에 알맞은 수는? ① 일의 자리 ${a % 10}에서 ${b}를 뺄 수 없습니다. ② 십의 자리에서 10을 가져오면 일의 자리는 □이 됩니다.`,
        borrowed, [a % 10, borrowed - b, 10],
        `${a % 10}에 10을 더하면 ${borrowed}이 됩니다.`,
        'subtraction', '10을 가져온 뒤 일의 자리를 구하는 과정',
      );
    }

    // 뺄셈 ⑵ : (몇십)-(몇십몇). 일의 자리가 0인 몇십에서 가져오는 곳을 봅니다.
    if (title.includes('뺄셈을 해 볼까요 ⑵')) {
      const a = 10 * (4 + (seed % 6));
      const b = 10 * (1 + (seed % 3)) + (1 + (index % 8));
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${b}를 계산하는 과정입니다. □에 알맞은 수는? ① ${a}의 일의 자리는 0이라 뺄 수 없습니다. ② 십의 자리에서 10을 가져와 10-${b % 10}=□`,
        10 - (b % 10), [b % 10, 10, 10 + (b % 10)],
        `10에서 ${b % 10}을 빼면 ${10 - (b % 10)}입니다.`,
        'subtraction', '몇십에서 10을 가져와 빼는 과정',
      );
    }

    // 여러 가지 방법으로 뺄셈 : 수를 갈라 큰 자리부터 빼는 방법
    if (title.includes('여러 가지 방법으로 뺄셈')) {
      const a = 10 * (5 + (seed % 4)) + (2 + (seed % 5));
      const bTens = 10 * (1 + (seed % 3));
      const bOnes = 1 + (index % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}-${bTens + bOnes}을 갈라서 계산하는 과정입니다. □에 알맞은 수는? ① ${bTens + bOnes}을 ${bTens}과 ${bOnes}으로 가릅니다. ② ${a}-${bTens}=${a - bTens} ③ ${a - bTens}-${bOnes}=□`,
        a - bTens - bOnes, [a - bTens, a - bOnes, a - bTens - bOnes + 10],
        `갈라서 차례로 빼면 ${a - bTens}-${bOnes}=${a - bTens - bOnes}입니다.`,
        'subtraction', '수를 갈라 차례로 빼는 과정',
      );
    }
  }

  // 곱셈구구: 앞의 곱에서 한 묶음을 더해 다음 곱을 구하는 과정
  if (unit === '곱셈구구') {
    const dans = dansOfLesson(title);
    if (dans.length > 0) {
      const dan = dans[index % dans.length];
      const k = 3 + (index % 7);

      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${dan}×${k}를 구하는 과정입니다. □에 알맞은 수는? ① ${dan}×${k - 1}=${dan * (k - 1)} ② ${dan}×${k}는 여기에 □를 더합니다.`,
          dan, [k, dan * (k - 1), dan + k],
          `묶음이 하나 늘면 ${dan}만큼 커집니다. ${dan * (k - 1)}+${dan}=${dan * k}입니다.`,
          'multiplication', `${dan}단에서 앞의 곱으로 다음 곱 구하기`,
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${dan}×${k}를 구하는 과정입니다. □에 알맞은 수는? ① ${dan}씩 ${k}묶음입니다. ② ${Array.from({ length: k }, () => dan).join('+')}=□`,
        dan * k, [dan + k, dan * (k - 1), dan * (k + 1)],
        `${dan}을 ${k}번 더하면 ${dan * k}입니다.`,
        'multiplication', `${dan}단을 더하기로 확인하는 과정`,
      );
    }
  }

  // 시각과 시간: 평가지처럼 두 바늘을 차례로 읽는 과정
  if (unit === '시각과 시간') {
    const hour = 1 + (index % 11);
    const nextHour = hour === 12 ? 1 : hour + 1;

    if (title.includes('읽어 볼까요 ⑴')) {
      const pointer = 1 + (index % 11);
      const minute = pointer * 5;
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `시각을 읽는 과정입니다. □에 알맞은 수는? ① 짧은바늘이 ${hour}과 ${nextHour} 사이이므로 □시입니다. ② 긴바늘이 ${pointer}을 가리키므로 ${minute}분입니다.`,
          hour, [nextHour, pointer, minute],
          `짧은바늘이 지나온 숫자가 몇 시인지 알려 줍니다. 그래서 ${hour}시입니다.`,
          'time', '시각 읽는 과정의 빈칸 채우기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `시각을 읽는 과정입니다. □에 알맞은 수는? ① 짧은바늘이 ${hour}과 ${nextHour} 사이이므로 ${hour}시입니다. ② 긴바늘이 ${pointer}을 가리키므로 □분입니다.`,
        minute, [pointer, minute + 5, hour],
        `긴바늘이 가리키는 숫자를 5씩 뛰어 세면 ${pointer}×5=${minute}분입니다.`,
        'time', '분을 읽는 과정의 빈칸 채우기',
      );
    }

    if (title.includes('걸린 시간')) {
      const startMinute = 10 + (index % 5) * 5;
      const toHour = 60 - startMinute;
      const after = 5 + (index % 4) * 5;
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${hour}시 ${startMinute}분부터 ${nextHour}시 ${after}분까지 걸린 시간을 구하는 과정입니다. □에 알맞은 수는? ① ${hour}시 ${startMinute}분에서 ${nextHour}시까지 □분 ② ${nextHour}시에서 ${after}분 더`,
          toHour, [startMinute, after, toHour + after],
          `한 시간은 60분입니다. 60-${startMinute}=${toHour}분입니다.`,
          'time', '걸린 시간을 나누어 구하는 과정',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${hour}시 ${startMinute}분부터 ${nextHour}시 ${after}분까지 걸린 시간을 구하는 과정입니다. □에 알맞은 수는? ① ${nextHour}시까지 ${toHour}분 ② ${after}분 더 ③ 모두 □분`,
        toHour + after, [toHour, after, toHour + after + 5],
        `두 시간을 더합니다. ${toHour}+${after}=${toHour + after}분입니다.`,
        'time', '나누어 구한 시간을 더하기',
      );
    }
  }

  // 길이 재기(2-2): m끼리, cm끼리 계산하는 과정
  if (unit === '길이 재기' && lesson.semester === '2-2') {
    const am = 1 + (seed % 4);
    const acm = 20 + (seed % 40);
    const bm = 1 + ((seed + 1) % 3);
    const bcm = 10 + ((seed + 5) % 30);

    if (title.includes('더 큰 단위')) {
      const m = 2 + (seed % 4);
      const cm = 10 + (seed % 8) * 5;
      return makeQuestion(
        lesson, difficulty, index,
        `${m * 100 + cm}cm를 m와 cm로 나타내는 과정입니다. □에 알맞은 수는? ① 100cm는 1m입니다. ② ${m * 100}cm는 ${m}m입니다. ③ 남은 것은 □cm입니다.`,
        cm, [m, m * 100, cm + 100],
        `${m * 100 + cm}cm에서 ${m * 100}cm를 빼면 ${cm}cm가 남습니다.`,
        'measurement', 'cm를 m와 cm로 나누는 과정',
      );
    }
    if (title.includes('자로 길이를 재어')) {
      const m = 1 + (seed % 3);
      const cm = 20 + (seed % 7) * 10;
      return makeQuestion(
        lesson, difficulty, index,
        `줄자로 잰 길이를 쓰는 과정입니다. □에 알맞은 수는? ① 줄자의 0에 한끝을 맞춥니다. ② 끝 눈금이 ${m * 100 + cm}cm였습니다. ③ ${m}m □cm라고 씁니다.`,
        cm, [m, m * 100 + cm, cm + 100],
        `${m * 100 + cm}cm는 ${m}m ${cm}cm입니다.`,
        'measurement', '줄자로 잰 값을 m와 cm로 쓰는 과정',
      );
    }
    if (title.includes('어림해 볼까요 ⑴')) {
      const span = 10 + (seed % 6);
      return makeQuestion(
        lesson, difficulty, index,
        `뼘으로 길이를 어림하는 과정입니다. □에 알맞은 수는? ① 한 뼘은 약 ${span}cm입니다. ② 세 뼘이면 약 ${span * 3}cm이므로 □cm쯤입니다.`,
        span * 3, [span, span * 2, span * 4],
        `한 뼘이 약 ${span}cm이므로 세 뼘은 약 ${span * 3}cm입니다.`,
        'measurement', '몸의 부분으로 어림하는 과정',
      );
    }
    if (title.includes('어림해 볼까요 ⑵')) {
      const known = 10 * (2 + (seed % 4));
      return makeQuestion(
        lesson, difficulty, index,
        `아는 길이를 기준으로 어림하는 과정입니다. □에 알맞은 수는? ① 색 테이프는 ${known}cm입니다. ② 물건에 3번쯤 들어갑니다. ③ 물건은 약 □cm입니다.`,
        known * 3, [known, known * 2, known + 3],
        `${known}cm가 3번이면 약 ${known * 3}cm입니다.`,
        'measurement', '기준 길이를 세어 어림하는 과정',
      );
    }
    if (title.includes('길이의 합')) {
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${am}m ${acm}cm + ${bm}m ${bcm}cm를 구하는 과정입니다. □에 알맞은 수는? ① m끼리: ${am}+${bm}=□ ② cm끼리: ${acm}+${bcm}=${acm + bcm}`,
          am + bm, [acm + bcm, am, am + bm + 1],
          `m는 m끼리 더합니다. ${am}+${bm}=${am + bm}m입니다.`,
          'measurement', '길이의 합에서 m 부분 구하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${am}m ${acm}cm + ${bm}m ${bcm}cm를 구하는 과정입니다. □에 알맞은 수는? ① m끼리: ${am}+${bm}=${am + bm} ② cm끼리: ${acm}+${bcm}=□`,
        acm + bcm, [am + bm, acm, acm + bcm + 10],
        `cm는 cm끼리 더합니다. ${acm}+${bcm}=${acm + bcm}cm입니다.`,
        'measurement', '길이의 합에서 cm 부분 구하기',
      );
    }

    if (title.includes('길이의 차')) {
      const bigM = am + 2;
      const bigCm = acm + 20;
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${bigM}m ${bigCm}cm - ${bm}m ${bcm}cm를 구하는 과정입니다. □에 알맞은 수는? ① m끼리: ${bigM}-${bm}=□ ② cm끼리: ${bigCm}-${bcm}=${bigCm - bcm}`,
          bigM - bm, [bigCm - bcm, bigM, bigM - bm + 1],
          `m는 m끼리 뺍니다. ${bigM}-${bm}=${bigM - bm}m입니다.`,
          'measurement', '길이의 차에서 m 부분 구하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${bigM}m ${bigCm}cm - ${bm}m ${bcm}cm를 구하는 과정입니다. □에 알맞은 수는? ① m끼리: ${bigM}-${bm}=${bigM - bm} ② cm끼리: ${bigCm}-${bcm}=□`,
        bigCm - bcm, [bigM - bm, bigCm, bigCm - bcm + 10],
        `cm는 cm끼리 뺍니다. ${bigCm}-${bcm}=${bigCm - bcm}cm입니다.`,
        'measurement', '길이의 차에서 cm 부분 구하기',
      );
    }
  }

  // 단원 도입 차시: 새로 배울 것을 꺼내기 전이므로 앞 학년에서 배운 것과
  // 생활 상황을 차례로 따라가는 과정만 다룹니다.
  if (title.includes('단원 도입')) {
    if (unit === '세 자리 수' || unit === '네 자리 수') {
      const value = 10 + (seed % 80);
      return makeQuestion(
        lesson, difficulty, index,
        `물건 ${value}개를 세는 과정입니다. □에 알맞은 수는? ① 10개씩 묶어 셉니다. ② 묶음이 ${Math.floor(value / 10)}개 생기고 □개가 남습니다.`,
        value % 10, [Math.floor(value / 10), value, 10],
        `${value}는 10개씩 ${Math.floor(value / 10)}묶음과 ${value % 10}개입니다.`,
        'placeValue', '10씩 묶어 세는 과정',
      );
    }

    if (unit === '여러 가지 도형') {
      if (seed % 3 === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          '생활 물건의 겉모양을 살펴보는 과정입니다. □에 들어갈 말은? ① 물건의 테두리를 따라갑니다. ② □ ③ 어떤 모양인지 말합니다.',
          '곧은 선인지 굽은 선인지 봅니다',
          ['물건의 색을 봅니다', '물건의 무게를 잽니다', '물건의 값을 봅니다'],
          '테두리가 곧은 선인지 굽은 선인지 보면 어떤 모양인지 알 수 있습니다.',
          'shape', '겉모양을 살펴보는 차례',
        );
      }
      if (seed % 3 === 1) {
        const corners = 3 + (seed % 2);
        return makeQuestion(
          lesson, difficulty, index,
          `모양의 뾰족한 곳을 세는 과정입니다. □에 알맞은 수는? ① 테두리를 따라갑니다. ② 뾰족한 곳마다 표시합니다. ③ 표시한 곳이 □개입니다.`,
          corners, [corners + 1, corners - 1, 0],
          `뾰족한 곳을 하나씩 표시하며 세면 ${corners}개입니다.`,
          'shape', '뾰족한 곳을 세는 차례',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        '물건을 모양끼리 모으는 과정입니다. □에 들어갈 말은? ① 겉모양을 봅니다. ② □ ③ 같은 모양끼리 모읍니다.',
        '테두리가 비슷한 것을 찾습니다',
        ['큰 것부터 고릅니다', '색이 같은 것을 찾습니다', '무거운 것을 찾습니다'],
        '겉모양의 테두리가 비슷한 것끼리 모으면 같은 모양끼리 모입니다.',
        'shape', '모양끼리 모으는 차례',
      );
    }

    if (unit === '덧셈과 뺄셈') {
      const a = 10 * (1 + (seed % 4)) + (seed % 5);
      const b = 10 * (1 + ((seed + 1) % 3)) + ((seed + 2) % 4);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 계산하는 과정입니다. □에 알맞은 수는? ① 일의 자리끼리 더하면 ${a % 10}+${b % 10}=${(a % 10) + (b % 10)} ② 십의 자리끼리 더하면 ${Math.floor(a / 10)}+${Math.floor(b / 10)}=□`,
        Math.floor(a / 10) + Math.floor(b / 10),
        [(a % 10) + (b % 10), Math.floor(a / 10), Math.floor(a / 10) + Math.floor(b / 10) + 1],
        `십의 자리끼리 더하면 ${Math.floor(a / 10) + Math.floor(b / 10)}입니다.`,
        'addition', '자리끼리 더하는 차례',
      );
    }

    if (unit === '길이 재기') {
      return makeQuestion(
        lesson, difficulty, index,
        '두 물건의 길이를 견주는 과정입니다. □에 들어갈 말은? ① 두 물건을 나란히 놓습니다. ② □ ③ 어느 것이 더 긴지 말합니다.',
        '한쪽 끝을 맞춥니다',
        ['가운데를 맞춥니다', '겹쳐 놓습니다', '멀리 떨어뜨립니다'],
        '한쪽 끝을 맞추어야 어느 것이 더 긴지 바르게 알 수 있습니다.',
        'measurement', '길이를 견주는 차례',
      );
    }

    if (unit === '곱셈') {
      const each = 2 + (seed % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `물건을 빠르게 세는 과정입니다. □에 알맞은 수는? ① 하나씩 세면 오래 걸립니다. ② ${each}씩 뛰어 셉니다. ③ ${each}, ${each * 2}, □`,
        each * 3, [each * 2, each * 4, each + 3],
        `${each}씩 뛰어 세면 ${each * 2} 다음은 ${each * 3}입니다.`,
        'multiplication', '뛰어 세어 빠르게 세는 차례',
      );
    }

    if (unit === '곱셈구구') {
      const each = 2 + (seed % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `${each}개씩 3묶음의 수를 구하는 과정입니다. □에 알맞은 수는? ① 같은 수 ${each}가 3번 있습니다. ② ${each}+${each}+${each}=□`,
        each * 3, [each * 2, each + 3, each * 4],
        `${each}를 세 번 더하면 ${each * 3}입니다.`,
        'multiplication', '같은 수를 여러 번 더하는 차례',
      );
    }

    if (unit === '시각과 시간') {
      const hour = 1 + (seed % 11);
      return makeQuestion(
        lesson, difficulty, index,
        `시계를 읽는 과정입니다. □에 알맞은 수는? ① 짧은바늘이 ${hour}을 가리킵니다. ② 긴바늘이 12를 가리킵니다. ③ □시입니다.`,
        hour, [12, hour + 1, hour * 2],
        `긴바늘이 12를 가리키면 몇 시 정각이고, 짧은바늘이 ${hour}이므로 ${hour}시입니다.`,
        'time', '두 바늘을 차례로 보는 과정',
      );
    }

    if (unit === '표와 그래프') {
      const a = 4 + (seed % 4);
      const b = 2 + ((seed + 1) % 3);
      return makeQuestion(
        lesson, difficulty, index,
        `조사한 것을 알아보기 쉽게 하는 과정입니다. □에 알맞은 수는? ① 같은 것끼리 모읍니다. ② 축구 ${a}명, 줄넘기 ${b}명 ③ 조사한 사람은 모두 □명`,
        `${a + b}명`, [`${a}명`, `${b}명`, `${a + b + 1}명`],
        `항목별 수를 더하면 ${a}+${b}=${a + b}명입니다.`,
        'data', '모아서 세는 차례',
      );
    }

    if (unit === '규칙 찾기') {
      return makeQuestion(
        lesson, difficulty, index,
        '생활에서 규칙을 찾는 과정입니다. □에 들어갈 말은? ① 되풀이되는 것을 찾습니다. ② □ ③ 다음에 올 것을 말합니다.',
        '어디까지가 한 묶음인지 정합니다',
        ['맨 끝만 봅니다', '개수를 모두 셉니다', '색을 칠합니다'],
        '되풀이되는 한 묶음을 찾아야 다음에 올 것을 알 수 있습니다.',
        'pattern', '규칙을 찾는 차례',
      );
    }
  }

  // 세 자리 수 / 네 자리 수: 수를 자리별로 모으고 세는 과정
  if (unit === '세 자리 수' || unit === '네 자리 수') {
    const four = unit === '네 자리 수';
    const base = four ? 1000 : 100;
    const name = four ? '천' : '백';

    if (title.includes('백을 알아') && !title.includes('몇')) {
      const piece = four ? 100 : 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${base}을 알아보는 과정입니다. □에 알맞은 수는? ① ${piece}이 9개이면 ${piece * 9} ② ${piece}이 한 개 더 있으면 □`,
        base, [piece * 9, piece, base + piece],
        `${piece}이 10개 모이면 ${base}입니다.`,
        'number', `${name}이 되는 과정 따라가기`,
      );
    }

    if (title.includes('천을 알아') && !title.includes('몇')) {
      return makeQuestion(
        lesson, difficulty, index,
        `1000을 알아보는 과정입니다. □에 알맞은 수는? ① 100이 9개이면 900 ② 100이 한 개 더 있으면 □`,
        1000, [900, 100, 1100],
        `100이 10개 모이면 1000입니다.`,
        'number', '천이 되는 과정 따라가기',
      );
    }

    if (title.includes('몇백') || title.includes('몇천')) {
      const count = 3 + (index % 6);
      return makeQuestion(
        lesson, difficulty, index,
        `${base * count}을 알아보는 과정입니다. □에 알맞은 수는? ① ${base}이 1개이면 ${base} ② ${base}이 □개이면 ${base * count}`,
        count, [base * count, count + 1, base],
        `${base * count}은 ${base}이 ${count}개인 수입니다.`,
        'placeValue', `몇${name}을 묶음으로 세는 과정`,
      );
    }

    if (title.includes('자리 수를 알아')) {
      // 한 자리만 계속 물으면 그 자리만 익히게 됩니다.
      // 비우는 자리를 천, 백, 십, 일로 돌아가며 바꿉니다.
      const digits = four
        ? [1 + (seed % 8), 1 + ((seed + 2) % 8), 1 + ((seed + 4) % 8), 1 + ((seed + 6) % 8)]
        : [1 + (seed % 8), 1 + ((seed + 3) % 8), 1 + ((seed + 5) % 8)];
      const units = four ? [1000, 100, 10, 1] : [100, 10, 1];
      const marks = ['①', '②', '③', '④'];
      const value = digits.reduce((sum, digit, at) => sum + digit * units[at], 0);
      const blank = seed % digits.length;

      const steps = digits
        .map((digit, at) =>
          `${marks[at]} ${units[at]}이 ${digit}개이면 ${at === blank ? '□' : digit * units[at]}`)
        .join(' ');
      const answer = digits[blank] * units[blank];

      return makeQuestion(
        lesson, difficulty, index,
        `${value}를 만드는 과정입니다. □에 알맞은 수는? ${steps}`,
        answer,
        [
          digits[blank],
          answer * 10,
          digits[(blank + 1) % digits.length] * units[(blank + 1) % digits.length],
        ],
        `${units[blank]}이 ${digits[blank]}개이면 ${answer}입니다.`,
        'placeValue', '자리별 묶음을 모으는 과정',
      );
    }

    if (title.includes('각 자리')) {
      // 묻는 숫자가 실제로 그 수 안에 있어야 하고, 같은 숫자가 두 번 나오면
      // 어느 자리를 말하는지 알 수 없으므로 각 자리 숫자를 모두 다르게 만듭니다.
      const digits = distinctDigits(seed, four ? 4 : 3);
      const units = four ? [1000, 100, 10, 1] : [100, 10, 1];
      const names = four ? ['천', '백', '십', '일'] : ['백', '십', '일'];
      const at = seed % digits.length;
      const value = digits.reduce((sum, digit, position) => sum + digit * units[position], 0);
      const digit = digits[at];
      const worth = digit * units[at];

      return makeQuestion(
        lesson, difficulty, index,
        `${value}에서 숫자 ${digit}이 나타내는 값을 구하는 과정입니다. □에 알맞은 수는? ① ${digit}은 ${names[at]}의 자리에 있습니다. ② ${names[at]}의 자리 ${digit}은 □을 나타냅니다.`,
        worth,
        [digit, worth * 10, value],
        `${names[at]}의 자리에 있는 ${digit}은 ${worth}을 나타냅니다.`,
        'placeValue', '자리 숫자의 값을 구하는 과정',
      );
    }

    if (title.includes('뛰어 세')) {
      const step = four ? 100 : 10;
      const start = base * (2 + (index % 6));
      return makeQuestion(
        lesson, difficulty, index,
        `${start}에서 ${step}씩 뛰어 세는 과정입니다. □에 알맞은 수는? ① ${start} ② ${start + step} ③ □`,
        start + step * 2, [start + step, start + step * 3, start],
        `${step}씩 커지므로 ${start + step} 다음은 ${start + step * 2}입니다.`,
        'number', '뛰어 세는 과정 따라가기',
      );
    }

    if (title.includes('크기를 비교')) {
      const high = 2 + (index % 6);
      const bigDigit = 5 + (seed % 4);
      const smallDigit = 1 + (seed % 3);
      const a = four ? high * 1000 + bigDigit * 100 : high * 100 + bigDigit * 10;
      const b = four ? high * 1000 + smallDigit * 100 : high * 100 + smallDigit * 10;
      const place = four ? '백' : '십';
      // 큰 수만 계속 물으면 '더 작은 수'를 찾는 연습이 되지 않습니다.
      const askBigger = seed % 2 === 0;

      return makeQuestion(
        lesson, difficulty, index,
        `${a}과 ${b}의 크기를 비교하는 과정입니다. □에 알맞은 수는? ① 가장 높은 자리 숫자가 ${high}으로 같습니다. ② 그다음 ${place}의 자리를 비교하면 □이 더 ${askBigger ? '큽니다' : '작습니다'}.`,
        askBigger ? a : b,
        [askBigger ? b : a, high, a + b],
        `${place}의 자리 숫자를 비교하면 ${askBigger ? `${a}이 더 큽니다` : `${b}이 더 작습니다`}.`,
        'placeValue', `크기를 비교해 더 ${askBigger ? '큰' : '작은'} 수 찾는 차례`,
        barModelVisualFor([{ label: '첫째 수', value: a }, { label: '둘째 수', value: b }], '두 수의 크기'),
      );
    }
  }

  // 여러 가지 도형: 변과 꼭짓점을 세어 확인하는 과정
  if (unit === '여러 가지 도형') {
    if (title.includes('△')) {
      return makeQuestion(
        lesson, difficulty, index,
        '삼각형인지 알아보는 과정입니다. □에 알맞은 수는? ① 곧은 선으로 둘러싸여 있습니다. ② 변을 세어 보니 □개입니다.',
        3, [4, 5, 0],
        '삼각형은 곧은 변이 3개입니다.',
        'shape', '삼각형을 확인하는 과정',
      );
    }
    if (title.includes('□')) {
      return makeQuestion(
        lesson, difficulty, index,
        '사각형인지 알아보는 과정입니다. □에 알맞은 수는? ① 곧은 선으로 둘러싸여 있습니다. ② 꼭짓점을 세어 보니 □개입니다.',
        4, [3, 5, 0],
        '사각형은 꼭짓점이 4개입니다.',
        'shape', '사각형을 확인하는 과정',
      );
    }
    if (title.includes('○')) {
      return makeQuestion(
        lesson, difficulty, index,
        '원인지 알아보는 과정입니다. □에 알맞은 수는? ① 굽은 선으로 둘러싸여 있습니다. ② 곧은 변을 세어 보니 □개입니다.',
        0, [1, 3, 4],
        '원은 곧은 변이 하나도 없습니다.',
        'shape', '원을 확인하는 과정',
      );
    }
    if (title.includes('칠교')) {
      return makeQuestion(
        lesson, difficulty, index,
        '칠교 조각으로 사각형을 만드는 과정입니다. □에 알맞은 수는? ① 삼각형 2개를 긴 변끼리 붙입니다. ② 바깥에 곧은 변이 □개 생깁니다.',
        4, [3, 2, 5],
        '삼각형 두 개를 붙이면 바깥에 곧은 변이 4개 생겨 사각형이 됩니다.',
        'shape', '칠교 조각을 붙이는 과정',
      );
    }
    if (title.includes('쌓은 모양')) {
      const first = 2 + (seed % 3);
      const second = 1 + (seed % 2);
      return makeQuestion(
        lesson, difficulty, index,
        `쌓은 모양의 쌓기나무 수를 세는 과정입니다. □에 알맞은 수는? ① 1층에 ${first}개 ② 2층에 ${second}개 ③ 모두 □개`,
        first + second, [first, second, first + second + 1],
        `층별로 세어 더하면 ${first}+${second}=${first + second}개입니다.`,
        'solid', '층별로 세어 모으는 과정',
      );
    }
    if (title.includes('여러 가지 모양으로 쌓아')) {
      const total = 4 + (seed % 3);
      const used = 1 + (seed % 3);
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무 ${total}개로 모양을 바꾸는 과정입니다. □에 알맞은 수는? ① 1층에서 ${used}개를 빼 위로 옮깁니다. ② 모양은 달라졌지만 쌓기나무는 □개 그대로입니다.`,
        total, [total - used, total + used, used],
        `자리를 옮겨도 쌓기나무의 수는 ${total}개로 변하지 않습니다.`,
        'solid', '모양을 바꿔도 개수가 같음을 확인하는 과정',
      );
    }
  }

  // 길이 재기(2-1): 단위를 반복해 세는 과정
  if (unit === '길이 재기' && lesson.semester === '2-1') {
    if (title.includes('여러 가지 단위')) {
      const times = 4 + (index % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `클립으로 연필의 길이를 재는 과정입니다. □에 알맞은 수는? ① 클립을 겹치지 않게 이어 놓습니다. ② 클립이 □번 들어갔습니다. ③ 연필은 클립으로 ${times}번입니다.`,
        times, [times + 1, times - 1, 1],
        `클립이 ${times}번 들어갔으므로 연필의 길이는 클립으로 ${times}번입니다.`,
        'measurement', '단위를 이어 세는 과정',
        unitMeasureVisualFor('연필', '클립', times),
      );
    }
    if (title.includes('1cm를 알아')) {
      const times = 3 + (index % 6);
      return makeQuestion(
        lesson, difficulty, index,
        `${times}cm를 알아보는 과정입니다. □에 알맞은 수는? ① 1cm가 1번이면 1cm ② 1cm가 □번이면 ${times}cm`,
        times, [1, times + 1, times * 2],
        `${times}cm는 1cm가 ${times}번 이어진 길이입니다.`,
        'measurement', '1cm를 이어 세는 과정',
      );
    }
    if (title.includes('자로 길이를 재는 방법')) {
      const end = 4 + (seed % 9);
      return makeQuestion(
        lesson, difficulty, index,
        `자로 길이를 재는 과정입니다. □에 알맞은 수는? ① 물건의 한끝을 자의 □에 맞춥니다. ② 다른 끝이 닿은 눈금 ${end}을 읽습니다.`,
        0, [1, end, end + 1],
        `한끝을 0에 맞추어야 끝 눈금을 그대로 읽을 수 있습니다.`,
        'measurement', '자를 0에 맞추는 과정',
      );
    }
    if (title.includes('자로 길이를 재어')) {
      const start = 2 + (seed % 4);
      const end = start + 3 + (seed % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `자로 잰 길이를 구하는 과정입니다. □에 알맞은 수는? ① 시작 눈금은 ${start} ② 끝 눈금은 ${end} ③ 길이는 ${end}-${start}=□`,
        `${end - start}cm`, [`${end}cm`, `${start}cm`, `${end + start}cm`],
        `끝 눈금에서 시작 눈금을 빼면 ${end - start}cm입니다.`,
        'measurement', '눈금을 빼서 길이를 구하는 과정',
      );
    }
    if (title.includes('어림하고')) {
      const span = 10 + (seed % 6);
      return makeQuestion(
        lesson, difficulty, index,
        `뼘으로 길이를 어림하는 과정입니다. □에 알맞은 수는? ① 한 뼘은 약 ${span}cm입니다. ② 세 뼘이면 약 ${span}+${span}+${span}=□cm입니다.`,
        span * 3, [span, span * 2, span * 4],
        `한 뼘이 약 ${span}cm이므로 세 뼘은 약 ${span * 3}cm입니다.`,
        'measurement', '몸의 부분을 여러 번 써서 어림하는 과정',
      );
    }
    if (title.includes('길이를 비교하는 방법')) {
      return makeQuestion(
        lesson, difficulty, index,
        '옮길 수 없는 물건의 길이를 비교하는 과정입니다. □에 들어갈 말은? ① 끈에 물건의 길이를 옮겨 표시합니다. ② □ ③ 어느 것이 더 긴지 알 수 있습니다.',
        '표시한 끈을 다른 물건에 대어 봅니다',
        ['끈을 잘라 버립니다', '물건의 무게를 잽니다', '물건의 색을 봅니다'],
        '끈에 옮긴 길이를 다른 물건에 대어 보면 길고 짧음을 알 수 있습니다.',
        'measurement', '끈으로 옮겨 비교하는 차례',
      );
    }
  }

  // 곱셈(2-1): 묶어 세기에서 곱셈식까지 이어지는 과정
  if (unit === '곱셈') {
    const each = 2 + (index % 5);
    const groups = 3 + ((index + 1) % 4);
    const total = each * groups;

    if (title.includes('여러 가지 방법으로 세어')) {
      const steps = Array.from({ length: groups - 1 }, (_, i) => each * (i + 1)).join(', ');
      return makeQuestion(
        lesson, difficulty, index,
        `${total}개를 세는 과정입니다. □에 알맞은 수는? ① 하나씩 세지 않고 ${each}씩 뛰어 셉니다. ② ${steps}, □`,
        total, [total - each, total + each, each + groups],
        `${each}씩 뛰어 세면 마지막은 ${total}입니다.`,
        'multiplication', '뛰어 세어 전체를 구하는 과정',
      );
    }
    if (title.includes('묶어 세어')) {
      return makeQuestion(
        lesson, difficulty, index,
        `${total}개를 ${each}개씩 묶어 세는 과정입니다. □에 알맞은 수는? ① ${each}개씩 묶습니다. ② 묶음이 □개 생깁니다. ③ ${each}개씩 ${groups}묶음입니다.`,
        groups, [each, total, groups + 1],
        `${each}개씩 묶으면 ${groups}묶음이 됩니다.`,
        'multiplication', '묶음의 수를 세는 과정',
      );
    }
    if (title.includes('몇의 몇 배를 알아')) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}의 ${groups}배를 구하는 과정입니다. □에 알맞은 수는? ① ${each}씩 ${groups}묶음입니다. ② ${Array.from({ length: groups }, () => each).join('+')}=□`,
        total, [each + groups, total - each, total + each],
        `${each}를 ${groups}번 더하면 ${total}입니다.`,
        'multiplication', '더하여 몇 배를 구하는 과정',
      );
    }
    if (title.includes('몇의 몇 배로 나타내')) {
      const small = 2 + (seed % 4);
      const times = 2 + (index % 4);
      return makeQuestion(
        lesson, difficulty, index,
        `${small * times}이 ${small}의 몇 배인지 구하는 과정입니다. □에 알맞은 수는? ① 기준이 되는 수는 ${small}입니다. ② ${small}씩 몇 묶음인지 세면 □묶음입니다. ③ 그래서 ${times}배입니다.`,
        times, [small, small * times, times + 1],
        `${small}씩 ${times}묶음이면 ${small * times}이므로 ${times}배입니다.`,
        'multiplication', '기준이 되는 수로 몇 배인지 구하는 과정',
      );
    }
    if (title.includes('곱셈을 알아')) {
      return makeQuestion(
        lesson, difficulty, index,
        `${each}의 ${groups}배를 곱셈식으로 바꾸는 과정입니다. □에 알맞은 수는? ① ${each}씩 ${groups}묶음입니다. ② 곱셈식으로 쓰면 ${each}×□입니다.`,
        groups, [each, total, each + groups],
        `묶음 수가 ${groups}이므로 ${each}×${groups}로 씁니다.`,
        'multiplication', '몇 배를 곱셈식으로 바꾸는 과정',
      );
    }
    if (title.includes('곱셈식으로 나타내')) {
      return makeQuestion(
        lesson, difficulty, index,
        `한 접시에 ${each}개씩 ${groups}접시를 곱셈식으로 나타내는 과정입니다. □에 알맞은 수는? ① 한 묶음의 수는 ${each} ② 묶음 수는 ${groups} ③ ${each}×${groups}=□`,
        total, [each + groups, total - each, total + each],
        `${each}×${groups}=${total}이므로 모두 ${total}개입니다.`,
        'multiplication', '상황을 곱셈식으로 세워 계산하는 과정',
      );
    }
  }

  // 표와 그래프: 세고, 표에 옮기고, 해석하는 과정
  if (unit === '표와 그래프') {
    const a = 5 + (index % 4);
    const b = 3 + ((index + 1) % 3);
    const c = 2 + ((index + 2) % 3);

    if (title.includes('분류하여 표로')) {
      return makeQuestion(
        lesson, difficulty, index,
        `자료를 분류해 표를 채우는 과정입니다. □에 알맞은 수는? ① 축구를 고른 사람을 셉니다. ② 센 것에 표시하며 빠뜨리지 않습니다. ③ 축구 칸에 □을 씁니다.`,
        `${a}`, [`${a + 1}`, `${b}`, `${a + b}`],
        `축구를 고른 사람이 ${a}명이므로 표의 축구 칸에는 ${a}을 씁니다.`,
        'data', '세어서 표의 칸을 채우는 과정',
      );
    }
    if (title.includes('조사하여 표로')) {
      return makeQuestion(
        lesson, difficulty, index,
        `조사한 자료를 표로 옮기는 과정입니다. □에 알맞은 수는? ① 축구 ${a}명 ② 줄넘기 ${b}명 ③ 술래잡기 ${c}명 ④ 합계는 ${a}+${b}+${c}=□`,
        `${a + b + c}명`, [`${a + b}명`, `${b + c}명`, `${a + b + c + 1}명`],
        `항목별 수를 모두 더하면 ${a + b + c}명입니다.`,
        'data', '조사 결과의 합계를 구하는 과정',
      );
    }
    if (title.includes('분류하여 그래프로')) {
      return makeQuestion(
        lesson, difficulty, index,
        `그래프를 그리는 과정입니다. □에 알맞은 수는? ① 표에서 축구는 ${a}명입니다. ② 아래에서부터 한 칸에 하나씩 ◯를 □개 그립니다.`,
        `${a}개`, [`${a + 1}개`, '1개', `${a - 1}개`],
        `${a}명이므로 ◯를 ${a}개 그립니다.`,
        'data', '그래프에 표시하는 과정',
      );
    }
    if (title.includes('표와 그래프로 나타내')) {
      return makeQuestion(
        lesson, difficulty, index,
        `조사한 자료를 나타내는 차례입니다. □에 들어갈 말은? ① 자료를 조사합니다. ② □ ③ 표를 보고 그래프로 나타냅니다.`,
        '표로 나타냅니다',
        ['그래프를 먼저 그립니다', '자료를 버립니다', '수를 바꿉니다'],
        `조사한 자료는 먼저 표로 정리한 뒤 그래프로 나타냅니다.`,
        'data', '조사에서 표, 그래프로 이어지는 차례',
      );
    }
    if (title.includes('무엇을 알 수 있')) {
      const most = Math.max(a, b, c);
      const least = Math.min(a, b, c);
      return makeQuestion(
        lesson, difficulty, index,
        `가장 많은 것과 가장 적은 것의 차를 구하는 과정입니다. □에 알맞은 수는? ① 가장 많은 수는 ${most} ② 가장 적은 수는 ${least} ③ 차는 ${most}-${least}=□`,
        `${most - least}명`, [`${most}명`, `${least}명`, `${most + least}명`],
        `가장 많은 수에서 가장 적은 수를 빼면 ${most - least}명입니다.`,
        'data', '표에서 차를 구하는 과정',
      );
    }
  }

  // 규칙 찾기: 규칙을 찾아 다음을 예상하는 과정
  if (unit === '규칙 찾기') {
    if (title.includes('쌓은 모양')) {
      const start = 1 + (index % 3);
      const step = 1 + (index % 3);
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무의 규칙을 찾는 과정입니다. □에 알맞은 수는? ① ${start}개, ${start + step}개, ${start + step * 2}개 ② ${step}개씩 늘어납니다. ③ 다음은 □개`,
        start + step * 3, [start + step * 2, start + step * 4, start],
        `${step}개씩 늘어나므로 다음은 ${start + step * 3}개입니다.`,
        'pattern', '늘어나는 규칙으로 다음을 구하는 과정',
      );
    }
    if (title.includes('덧셈표')) {
      const x = 2 + (index % 6);
      const y = 3 + (index % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `덧셈표의 규칙을 찾는 과정입니다. □에 알맞은 수는? ① ${x}+${y}=${x + y} ② 오른쪽으로 한 칸 가면 1 커집니다. ③ ${x}+${y + 1}=□`,
        x + y + 1, [x + y, x + y + 2, x + y - 1],
        `오른쪽으로 한 칸 가면 1 커지므로 ${x + y + 1}입니다.`,
        'pattern', '덧셈표에서 다음 칸을 구하는 과정',
      );
    }
    if (title.includes('곱셈표')) {
      const x = 2 + (index % 6);
      const y = 3 + (index % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표의 규칙을 찾는 과정입니다. □에 알맞은 수는? ① ${x}×${y}=${x * y} ② ${x}단은 ${x}씩 커집니다. ③ ${x}×${y + 1}=□`,
        x * (y + 1), [x * y, x * (y + 2), x * y + 1],
        `${x}단은 ${x}씩 커지므로 ${x * y}+${x}=${x * (y + 1)}입니다.`,
        'pattern', '곱셈표에서 다음 칸을 구하는 과정',
      );
    }
    if (title.includes('생활에서')) {
      return makeQuestion(
        lesson, difficulty, index,
        '달력의 규칙을 찾는 과정입니다. □에 알맞은 수는? ① 한 주는 7일입니다. ② 같은 요일은 □일마다 돌아옵니다.',
        '7일', ['5일', '10일', '30일'],
        '한 주가 7일이므로 같은 요일은 7일마다 돌아옵니다.',
        'pattern', '달력에서 반복을 찾는 과정',
      );
    }
  }

  // 시각과 시간: 남은 차시들
  if (unit === '시각과 시간') {
    const hour2 = 1 + (index % 11);
    const next2 = hour2 === 12 ? 1 : hour2 + 1;

    if (title.includes('읽어 볼까요 ⑵')) {
      const pointer = 1 + (index % 10);
      const extra = 1 + (index % 4);
      return makeQuestion(
        lesson, difficulty, index,
        `시각을 읽는 과정입니다. □에 알맞은 수는? ① 긴바늘이 숫자 ${pointer}을 지났으므로 ${pointer * 5}분 ② 작은 눈금 ${extra}칸을 더 갔으므로 □분`,
        pointer * 5 + extra, [pointer * 5, extra, pointer * 5 + 5],
        `숫자까지 ${pointer * 5}분이고 작은 눈금 ${extra}칸은 ${extra}분이므로 ${pointer * 5 + extra}분입니다.`,
        'time', '작은 눈금까지 더해 읽는 과정',
      );
    }
    if (title.includes('여러 가지 방법')) {
      const before = 5 * (1 + (index % 3));
      return makeQuestion(
        lesson, difficulty, index,
        `${hour2}시 ${60 - before}분을 다르게 읽는 과정입니다. □에 알맞은 수는? ① ${next2}시까지 남은 시간을 봅니다. ② 60-${60 - before}=□ ③ 그래서 ${next2}시 ${before}분 전입니다.`,
        before, [60 - before, next2, 60],
        `${next2}시가 되기까지 ${before}분 남았습니다.`,
        'time', '몇 분 전으로 바꾸는 과정',
      );
    }
    if (title.includes('1시간')) {
      const extra = 5 * (1 + (index % 8));
      return makeQuestion(
        lesson, difficulty, index,
        `${60 + extra}분이 몇 시간 몇 분인지 구하는 과정입니다. □에 알맞은 수는? ① 60분은 1시간 ② 남은 시간은 ${60 + extra}-60=□`,
        `${extra}분`, [`${60 + extra}분`, `60분`, `${extra + 5}분`],
        `${60 + extra}분에서 60분을 빼면 ${extra}분이 남습니다.`,
        'time', '분을 시간과 분으로 나누는 과정',
      );
    }
    if (title.includes('하루의 시간')) {
      return makeQuestion(
        lesson, difficulty, index,
        '하루가 몇 시간인지 구하는 과정입니다. □에 알맞은 수는? ① 오전은 12시간 ② 오후는 12시간 ③ 하루는 12+12=□',
        '24시간', ['12시간', '20시간', '30시간'],
        '오전 12시간과 오후 12시간을 더하면 하루는 24시간입니다.',
        'time', '오전과 오후를 더해 하루를 구하는 과정',
      );
    }
    if (title.includes('달력')) {
      const weeks = 2 + (index % 3);
      return makeQuestion(
        lesson, difficulty, index,
        `${weeks}주일이 며칠인지 구하는 과정입니다. □에 알맞은 수는? ① 1주일은 7일 ② ${weeks}주일은 7×${weeks}=□`,
        `${7 * weeks}일`, [`${weeks}일`, `7일`, `${7 * weeks + 7}일`],
        `1주일이 7일이므로 ${weeks}주일은 ${7 * weeks}일입니다.`,
        'time', '주일을 날수로 바꾸는 과정',
      );
    }
  }

  // 분류하기: 기준을 정하고 세어 결과를 읽는 과정
  if (unit === '분류하기') {
    const red = 4 + (seed % 4);
    const blue = 2 + (seed % 3);
    const green = 1 + ((seed + 1) % 3);

    // 단원 도입: 아직 기준이라는 말을 배우기 전이므로 정리 상황까지만 다룹니다.
    if (title.includes('단원 도입')) {
      return makeQuestion(
        lesson, difficulty, index,
        '어질러진 학용품을 정리하는 과정입니다. □에 들어갈 말은? ① 흩어진 물건을 모읍니다. ② □ ③ 자리에 넣어 둡니다.',
        '비슷한 것끼리 모아 놓습니다',
        ['큰 것만 골라 둡니다', '아무 곳에나 넣습니다', '색을 칠해 둡니다'],
        '비슷한 것끼리 모아 두면 정리도 쉽고 찾기도 쉽습니다.',
        'classification', '정리하는 차례 생각하기',
      );
    }
    if (title.includes('분류는 어떻게')) {
      return makeQuestion(
        lesson, difficulty, index,
        '물건을 나누는 과정입니다. □에 들어갈 말은? ① 무엇으로 나눌지 정합니다. ② □ ③ 같은 것끼리 모읍니다.',
        '누가 보아도 같게 나뉘는 기준인지 확인합니다',
        ['내가 좋아하는 것을 고릅니다', '물건을 더 사 옵니다', '개수를 먼저 셉니다'],
        '분류는 누가 나누어도 결과가 같은 분명한 기준이 있어야 합니다.',
        'classification', '분류 기준을 정하는 차례',
      );
    }
    if (title.includes('기준에 따라')) {
      return makeQuestion(
        lesson, difficulty, index,
        '색깔을 기준으로 나누는 과정입니다. □에 들어갈 말은? ① 기준은 색깔입니다. ② 빨강끼리 모읍니다. ③ □',
        '남은 색도 색깔끼리 모읍니다',
        ['모양끼리 다시 모읍니다', '큰 것만 모읍니다', '빨강만 남깁니다'],
        '한 가지 기준을 끝까지 적용해 남은 것도 색깔끼리 모읍니다.',
        'classification', '한 기준을 끝까지 적용하는 차례',
      );
    }
    if (title.includes('분류하고 세어')) {
      return makeQuestion(
        lesson, difficulty, index,
        `분류하고 세는 과정입니다. □에 알맞은 수는? ① 빨강 ${red}개 ② 파랑 ${blue}개 ③ 초록 ${green}개 ④ 모두 ${red}+${blue}+${green}=□개`,
        `${red + blue + green}개`,
        [`${red + blue}개`, `${blue + green}개`, `${red + blue + green + 1}개`],
        `항목별 수를 모두 더하면 ${red + blue + green}개입니다.`,
        'data', '분류한 것을 세어 모으는 과정',
      );
    }
    if (title.includes('결과를 말해')) {
      const most = Math.max(red, blue, green);
      const least = Math.min(red, blue, green);
      return makeQuestion(
        lesson, difficulty, index,
        `분류 결과를 말하는 과정입니다. □에 알맞은 수는? ① 가장 많은 것은 ${most}개 ② 가장 적은 것은 ${least}개 ③ 차는 ${most}-${least}=□개`,
        `${most - least}개`, [`${most}개`, `${least}개`, `${most + least}개`],
        `가장 많은 것에서 가장 적은 것을 빼면 ${most - least}개입니다.`,
        'data', '분류 결과에서 차를 구하는 과정',
      );
    }
  }

  // 덧셈과 뺄셈 뒷부분 차시
  if (unit === '덧셈과 뺄셈') {
    if (title.includes('세 수의 계산')) {
      const a = 10 + (seed % 25);
      const b = 5 + (seed % 15);
      const c = 3 + ((seed + 2) % 12);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}-${c}를 계산하는 과정입니다. □에 알맞은 수는? ① 앞에서부터 ${a}+${b}=${a + b} ② ${a + b}-${c}=□`,
        a + b - c, [a + b, a - b + c, a + b + c],
        `앞에서부터 차례로 계산하면 ${a + b}-${c}=${a + b - c}입니다.`,
        'addition', '세 수를 앞에서부터 계산하는 과정',
      );
    }
    if (title.includes('관계를 식으로')) {
      // b를 a보다 작게 잡습니다. 그러지 않으면 오답 보기 a-b가 음수가 되어
      // 2학년이 아직 배우지 않은 수가 보기에 나옵니다.
      const b = 5 + (seed % 14);
      const a = b + 7 + (seed % 15);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}=${a + b}을 뺄셈식으로 바꾸는 과정입니다. □에 알맞은 수는? ① 전체는 ${a + b}입니다. ② 부분 하나는 ${b}입니다. ③ ${a + b}-${b}=□`,
        a, [b, a + b, a - b],
        `전체에서 한 부분을 빼면 다른 부분인 ${a}가 나옵니다.`,
        'subtraction', '덧셈식을 뺄셈식으로 바꾸는 과정',
      );
    }
    if (title.includes('□의 값')) {
      const b = 5 + (seed % 14);
      const a = b + 7 + (seed % 15);

      // □가 어디에 있느냐에 따라 세우는 식이 달라집니다. 한 자리에만 두면
      // '전체에서 아는 것을 뺀다'는 절차만 외우게 됩니다.
      const place = index % 3;

      if (place === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `□-${b}=${a}에서 □를 구하는 과정입니다. □에 알맞은 수는? ① 뺀 결과가 ${a}입니다. ② 뺀 수는 ${b}입니다. ③ ${a}+${b}=□`,
          a + b, [a, b, a - b > 0 ? a - b : b - a],
          `뺀 결과에 뺀 수를 도로 더하면 처음 수가 나옵니다. □는 ${a + b}입니다.`,
          'subtraction', '빼기 전의 수를 거꾸로 구하는 과정',
        );
      }

      if (place === 2) {
        return makeQuestion(
          lesson, difficulty, index,
          `${a + b}-□=${a}에서 □를 구하는 과정입니다. □에 알맞은 수는? ① 처음 수는 ${a + b}입니다. ② 남은 수는 ${a}입니다. ③ ${a + b}-${a}=□`,
          b, [a, a + b, a + b - 1],
          `처음 수에서 남은 수를 빼면 덜어 낸 수인 ${b}가 나옵니다.`,
          'subtraction', '덜어 낸 수를 거꾸로 구하는 과정',
        );
      }

      return makeQuestion(
        lesson, difficulty, index,
        `${a}+□=${a + b}에서 □를 구하는 과정입니다. □에 알맞은 수는? ① 전체는 ${a + b}입니다. ② 아는 부분은 ${a}입니다. ③ ${a + b}-${a}=□`,
        b, [a, a + b, a - b],
        `전체에서 아는 부분을 빼면 □는 ${b}입니다.`,
        'subtraction', '□를 빼기로 구하는 과정',
      );
    }
  }

  // 곱셈구구 뒷부분 차시
  if (unit === '곱셈구구') {
    const k = 2 + (seed % 8);
    if (title.includes('1단')) {
      return makeQuestion(
        lesson, difficulty, index,
        `0×${k}를 구하는 과정입니다. □에 알맞은 수는? ① 0이 ${k}묶음입니다. ② 한 묶음에 아무것도 없으므로 모두 □입니다.`,
        0, [k, 1, k + 1],
        `0은 하나도 없다는 뜻이므로 몇 묶음이어도 0입니다.`,
        'multiplication', '0의 곱을 따져 보는 과정',
      );
    }
    if (title.includes('곱셈표')) {
      const a = 2 + (seed % 7);
      const b = 2 + ((seed + 3) % 7);
      return makeQuestion(
        lesson, difficulty, index,
        `곱셈표에서 ${a}와 ${b}가 만나는 칸을 채우는 과정입니다. □에 알맞은 수는? ① 가로의 수는 ${a}입니다. ② 세로의 수는 ${b}입니다. ③ 두 수를 곱하면 □입니다.`,
        a * b, [a + b, a * b + a, Math.max(0, a * b - b)],
        `곱셈표의 칸에는 두 수의 곱을 씁니다. ${a}×${b}=${a * b}입니다.`,
        'multiplication', '곱셈표의 칸을 채우는 과정',
      );
    }
    if (title.includes('문제를 해결')) {
      const each = 2 + (seed % 7);
      const groups = 3 + ((seed + 2) % 6);

      // 문장 상황이 한 가지뿐이면 풀이 과정 20문항이 모두 같은 문제가 됩니다.
      // 곱셈으로 푸는 상황에는 묶음 세기 말고도 덜어 내기, 두 묶음 합치기가
      // 있습니다. 같은 곱셈이라도 상황이 다르면 세워야 할 식이 달라집니다.
      const situation = index % 3;

      if (situation === 1) {
        const gone = 1 + (seed % 4);
        return makeQuestion(
          lesson, difficulty, index,
          `한 봉지에 ${each}개씩 ${groups}봉지가 있었는데 ${gone}개를 먹었습니다. 남은 수를 구하는 과정입니다. □에 알맞은 수는? ① 처음 수는 ${each}×${groups}=${each * groups}입니다. ② 먹은 수는 ${gone}입니다. ③ ${each * groups}-${gone}=□`,
          each * groups - gone,
          [each * groups, each * groups + gone, Math.max(1, each * groups - gone - 1)],
          `먼저 곱셈으로 처음 수를 구하고, 먹은 수를 빼면 ${each * groups - gone}개입니다.`,
          'multiplication', '곱한 뒤 덜어 내는 과정',
          arrayVisualFor(groups, each, `${each}씩 ${groups}묶음`),
        );
      }

      if (situation === 2) {
        const other = 2 + ((seed + 3) % 5);
        return makeQuestion(
          lesson, difficulty, index,
          `빨간 상자에 ${each}개씩 ${groups}상자, 파란 상자에 ${other}개씩 ${groups}상자가 있습니다. 모두 몇 개인지 구하는 과정입니다. □에 알맞은 수는? ① 빨간 상자는 ${each}×${groups}=${each * groups}입니다. ② 파란 상자는 ${other}×${groups}=${other * groups}입니다. ③ ${each * groups}+${other * groups}=□`,
          (each + other) * groups,
          [each * groups, other * groups, (each + other) * groups + groups],
          `두 상자의 수를 각각 곱셈으로 구한 뒤 더하면 ${(each + other) * groups}개입니다.`,
          'multiplication', '두 묶음을 각각 곱해 합치는 과정',
        );
      }

      return makeQuestion(
        lesson, difficulty, index,
        `한 상자에 ${each}개씩 ${groups}상자의 수를 구하는 과정입니다. □에 알맞은 수는? ① 한 묶음의 수는 ${each}입니다. ② 묶음 수는 ${groups}입니다. ③ ${each}×${groups}=□`,
        each * groups, [each + groups, each * groups + each, Math.max(1, each * groups - each)],
        `${each}×${groups}=${each * groups}이므로 모두 ${each * groups}개입니다.`,
        'multiplication', '문장을 곱셈식으로 세워 푸는 과정',
      );
    }
  }

  // 규칙 찾기 무늬 차시
  if (unit === '규칙 찾기') {
    if (title.includes('무늬에서 규칙을 찾아볼까요 ⑴')) {
      const shapes = ['○', '△', '□'];
      const start = seed % 3;
      const order = [0, 1, 2].map((offset) => shapes[(start + offset) % 3]);
      return makeQuestion(
        lesson, difficulty, index,
        `무늬의 규칙을 찾는 과정입니다. □에 들어갈 모양은? ① ${order.join(', ')}가 되풀이됩니다. ② ${order[0]}, ${order[1]}, ${order[2]}, ${order[0]}, ${order[1]}, □`,
        order[2], [order[0], order[1], '☆'],
        `${order.join(', ')}가 반복되므로 다음은 ${order[2]}입니다.`,
        'pattern', '반복 묶음을 찾아 다음을 구하는 과정',
      );
    }
    if (title.includes('무늬에서 규칙을 찾아볼까요 ⑵')) {
      const start = 1 + (seed % 3);
      const step = 1 + (seed % 2);
      return makeQuestion(
        lesson, difficulty, index,
        `무늬의 개수 규칙을 찾는 과정입니다. □에 알맞은 수는? ① ${start}개, ${start + step}개, ${start + step * 2}개로 놓였습니다. ② 몇 개씩 늘어나는지 보면 □개씩입니다.`,
        step, [start, step + 1, start + step],
        `앞뒤 수의 차가 ${step}이므로 ${step}개씩 늘어납니다.`,
        'pattern', '늘어나는 크기를 찾는 과정',
      );
    }
  }

  return null;
};

const KOREAN_ONES = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

// 세 자리 수를 우리말로 읽습니다. (305 -> 삼백오)
const readKoreanNumber = (value: number) => {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  const parts = [
    hundreds > 0 ? `${hundreds > 1 ? KOREAN_ONES[hundreds] : ''}백` : '',
    tens > 0 ? `${tens > 1 ? KOREAN_ONES[tens] : ''}십` : '',
    ones > 0 ? KOREAN_ONES[ones] : '',
  ];
  return parts.join('') || '영';
};

// ── 응용 문항 ─────────────────────────────────────────────────────────────
// 교과서·수학익힘·시도교육청 평가지에서 쓰는 형태를 따랐습니다.
// 동전으로 금액 구하기, 수를 우리말로 읽기, 조건에 맞는 수 찾기,
// 잘못 계산한 것 고치기, 수 카드로 수 만들기, 설명을 읽고 답 구하기 등
// 한 단계 더 생각해야 하는 문항입니다.
// 각 분기는 그 차시까지 배운 것만 씁니다.
const challengeQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  if (difficulty === '하') return null;

  const unit = lesson.unitTitle;
  const title = lesson.title;
  const no = lesson.lessonNo;
  const seed = n(lesson, index);
  const pick = seed % 3;

  // ── 세 자리 수 / 네 자리 수 ────────────────────────────────────────────
  if (unit === '세 자리 수' || unit === '네 자리 수') {
    const four = unit === '네 자리 수';

    // 4차시부터: 자리별 묶음을 수로 나타낼 수 있습니다.
    if (no >= 4 && no < 5) {
      const h = 2 + (seed % 7);
      const t = 1 + ((seed + 2) % 8);
      const o = 1 + ((seed + 5) % 8);
      const value = h * 100 + t * 10 + o;

      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `100원짜리 ${h}개, 10원짜리 ${t}개, 1원짜리 ${o}개가 있습니다. 모두 얼마일까요?`,
          `${value}원`,
          [`${h + t + o}원`, `${h * 100 + t + o}원`, `${value + 100}원`],
          `100원이 ${h}개면 ${h * 100}원, 10원이 ${t}개면 ${t * 10}원, 1원이 ${o}개면 ${o}원입니다. 모두 ${value}원입니다.`,
          'placeValue', '조건 함께 보기 · 동전을 모아 금액 구하기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `${value}를 우리말로 바르게 읽은 것은?`,
          readKoreanNumber(value),
          [readKoreanNumber(value + 100), readKoreanNumber(value - o + (o % 9) + 1), `${h}${t}${o}`],
          `${value}는 ${readKoreanNumber(value)}이라고 읽습니다.`,
          'number', '조건 함께 보기 · 수를 우리말로 읽기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `100이 ${h}개, 1이 ${o}개인 수는 얼마일까요?`,
        h * 100 + o,
        [h * 100 + o * 10, h + o, h * 100 + o + 10],
        `10이 없으므로 십의 자리는 0입니다. ${h * 100 + o}입니다.`,
        'placeValue', '조건 함께 보기 · 빠진 자리가 있는 수 만들기',
      );
    }

    // 5차시부터: 같은 숫자라도 자리에 따라 값이 다릅니다.
    if (no === 5) {
      // 같은 숫자를 이웃한 두 자리에 놓아 자리에 따라 값이 10배 달라짐을 보게 합니다.
      const [digit, low, lower] = distinctDigits(seed, 3);
      const highName = four ? '천' : '백';
      const nextName = four ? '백' : '십';
      const highWorth = four ? digit * 1000 : digit * 100;
      const nextWorth = four ? digit * 100 : digit * 10;
      const value = four
        ? digit * 1000 + digit * 100 + low * 10 + lower
        : digit * 100 + digit * 10 + low;

      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${value}에서 ${highName}의 자리 숫자가 나타내는 값은 ${nextName}의 자리 숫자가 나타내는 값의 몇 배일까요?`,
          '10배', ['2배', '5배', '100배'],
          `${highName}의 자리 ${digit}은 ${highWorth}을, ${nextName}의 자리 ${digit}은 ${nextWorth}을 나타냅니다. ${highWorth}은 ${nextWorth}의 10배입니다.`,
          'placeValue', '조건 함께 보기 · 같은 숫자가 나타내는 값 견주기',
        );
      }
      if (pick === 1) {
        // 같은 숫자가 다른 수에서는 더 낮은 자리에 오도록 만듭니다.
        const other = four
          ? low * 1000 + lower * 100 + digit * 10 + digit
          : low * 100 + digit * 10 + digit;
        return makeQuestion(
          lesson, difficulty, index,
          `${value}와 ${other}에서 숫자 ${digit}이 나타내는 값이 가장 큰 것은?`,
          `${value}의 ${highName}의 자리`,
          [`${value}의 ${nextName}의 자리`, `${other}의 십의 자리`, `${other}의 일의 자리`],
          `${value}의 ${highName}의 자리 ${digit}은 ${highWorth}을 나타내어 가장 큽니다.`,
          'placeValue', '조건 함께 보기 · 여러 수에서 자리값 견주기',
        );
      }
      const parts = four
        ? `1000이 ${digit}개, 100이 ${digit}개, 10이 ${low}개, 1이 □개`
        : `100이 ${digit}개, 10이 ${digit}개, 1이 □개`;
      return makeQuestion(
        lesson, difficulty, index,
        `${value}는 ${parts}인 수입니다. □는?`,
        value % 10, [digit, low, 0],
        `${value}에서 일의 자리 숫자가 ${value % 10}이므로 1이 ${value % 10}개입니다.`,
        'placeValue', '조건 함께 보기 · 수를 자리별로 되돌려 보기',
      );
    }

    // 6차시부터: 뛰어 세기
    if (no === 6) {
      const step = four ? 100 : 10;
      const start = (four ? 1000 : 100) * (2 + (seed % 6));
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${start}, ${start + step}, ${start + step * 2}로 이어집니다. 이 규칙으로 5번째 수는?`,
          start + step * 4,
          [start + step * 3, start + step * 5, start + step * 2],
          `${step}씩 커지므로 5번째는 ${start}에서 ${step}씩 4번 뛴 ${start + step * 4}입니다.`,
          'number', '조건 함께 보기 · 규칙대로 여러 번 뛰어 세기',
        );
      }
      if (pick === 1) {
        const jump = four ? 1000 : 100;
        return makeQuestion(
          lesson, difficulty, index,
          `${start}에서 ${jump}씩 뛰어 세면 어느 자리 숫자만 바뀔까요?`,
          four ? '천의 자리' : '백의 자리',
          four ? ['백의 자리', '십의 자리', '일의 자리'] : ['십의 자리', '일의 자리', '모든 자리'],
          `${jump}씩 뛰어 세면 ${four ? '천' : '백'}의 자리 숫자만 1씩 커집니다.`,
          'number', '조건 함께 보기 · 뛰어 셀 때 바뀌는 자리 찾기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${start}에서 몇씩 뛰어 세었더니 ${start + step * 3}이 되었습니다. 3번 뛰었다면 몇씩 뛴 것일까요?`,
        `${step}씩`, [`${step * 3}씩`, `${step + 1}씩`, '1씩'],
        `${start + step * 3}-${start}=${step * 3}이고 3번 뛰었으므로 한 번에 ${step}씩 뛴 것입니다.`,
        'number', '조건 함께 보기 · 뛴 크기를 거꾸로 찾기',
      );
    }

    // 7차시: 크기 비교와 수 만들기
    if (no >= 7) {
      // 단원에 맞는 자릿수로 만듭니다. 네 자리 수 단원이면 카드도 4장입니다.
      const cardCount = four ? 4 : 3;
      const cards = distinctDigits(seed, cardCount);
      const units = four ? [1000, 100, 10, 1] : [100, 10, 1];
      const high = [...cards].sort((x, y) => y - x);
      const low = [...cards].sort((x, y) => x - y);
      const toNumber = (list: number[]) =>
        list.reduce((sum, digit, at) => sum + digit * units[at], 0);
      const biggest = toNumber(high);
      const smallest = toNumber(low);
      const sizeName = four ? '네 자리 수' : '세 자리 수';

      if (pick === 0) {
        const swapped = [...high];
        [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
        return makeQuestion(
          lesson, difficulty, index,
          `수 카드 ${cards.join(', ')}을 한 번씩 써서 만들 수 있는 가장 큰 ${sizeName}는?`,
          biggest, [smallest, toNumber(swapped), biggest - 1],
          `큰 숫자를 높은 자리에 놓아야 합니다. ${biggest}입니다.`,
          'number', '조건 함께 보기 · 수 카드로 가장 큰 수 만들기',
        );
      }
      if (pick === 1) {
        const swapped = [...low];
        [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
        return makeQuestion(
          lesson, difficulty, index,
          `수 카드 ${cards.join(', ')}을 한 번씩 써서 만들 수 있는 가장 작은 ${sizeName}는?`,
          smallest, [biggest, toNumber(swapped), smallest + 1],
          `작은 숫자를 높은 자리에 놓아야 합니다. ${smallest}입니다.`,
          'number', '조건 함께 보기 · 수 카드로 가장 작은 수 만들기',
        );
      }
      const from = four ? high[0] * 1000 + high[1] * 100 + 4 : high[0] * 100 + high[1] * 10 + 4;
      return makeQuestion(
        lesson, difficulty, index,
        `${from}보다 크고 ${from + 4}보다 작은 수는 모두 몇 개일까요?`,
        '3개', ['2개', '4개', '5개'],
        `${from + 1}, ${from + 2}, ${from + 3}으로 모두 3개입니다. 양 끝의 두 수는 넣지 않습니다.`,
        'number', '조건 함께 보기 · 두 수 사이의 수 세기',
      );
    }
  }

  // ── 덧셈과 뺄셈 ────────────────────────────────────────────────────────
  if (unit === '덧셈과 뺄셈' && no >= 2) {
    const a = 10 * (2 + (seed % 5)) + (5 + (seed % 4));
    const b = 10 * (1 + (seed % 3)) + (6 + (seed % 3));

    if (no >= 2 && no <= 4) {
      const wrong = a + b - 10;
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${a}+${b}를 ${wrong}이라고 계산했습니다. 바르게 고치면?`,
          a + b, [wrong, a + b + 10, a + b - 1],
          `일의 자리에서 올린 1을 십의 자리에 더해야 합니다. 바른 답은 ${a + b}입니다.`,
          'addition', '조건 함께 보기 · 잘못 계산한 것 고치기',
        );
      }
      if (pick === 1) {
        const c = 10 * (1 + ((seed + 1) % 3)) + (2 + (seed % 5));
        return makeQuestion(
          lesson, difficulty, index,
          `${a}+${b}와 ${a}+${c} 중 더 큰 것은?`,
          b > c ? `${a}+${b}` : `${a}+${c}`,
          [b > c ? `${a}+${c}` : `${a}+${b}`, '두 값이 같다', '비교할 수 없다'],
          `더하는 수가 클수록 합도 큽니다. ${b}와 ${c}를 비교하면 됩니다.`,
          'addition', '조건 함께 보기 · 더하지 않고 합 견주기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `구슬을 ${a}개 가지고 있었는데 ${b}개를 더 얻고 ${5 + (seed % 5)}개를 잃었습니다. 지금 몇 개일까요?`,
        `${a + b - (5 + (seed % 5))}개`,
        [`${a + b}개`, `${a - b}개`, `${a + b + (5 + (seed % 5))}개`],
        `얻으면 더하고 잃으면 뺍니다. ${a}+${b}-${5 + (seed % 5)}=${a + b - (5 + (seed % 5))}개입니다.`,
        'addition', '조건 함께 보기 · 두 번 바뀌는 상황 계산하기',
      );
    }

    if (no >= 5) {
      const big = 10 * (5 + (seed % 4)) + (2 + (seed % 5));
      const small = 10 * (1 + (seed % 3)) + (6 + (seed % 3));
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${big}-${small}을 계산한 뒤 답이 맞는지 확인하는 방법으로 알맞은 것은?`,
          `답에 ${small}을 더해 ${big}이 되는지 본다`,
          [`답에서 ${small}을 뺀다`, `${big}에 ${small}을 더한다`, '확인할 수 없다'],
          `뺄셈은 덧셈으로 확인합니다. ${big - small}+${small}=${big}이면 맞습니다.`,
          'subtraction', '조건 함께 보기 · 덧셈으로 검산하기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `색종이 ${big}장 중 ${small}장을 쓰고 ${4 + (seed % 5)}장을 더 받았습니다. 지금 몇 장일까요?`,
          `${big - small + (4 + (seed % 5))}장`,
          [`${big - small}장`, `${big + small}장`, `${big - small - (4 + (seed % 5))}장`],
          `쓰면 빼고 받으면 더합니다. ${big}-${small}+${4 + (seed % 5)}=${big - small + (4 + (seed % 5))}장입니다.`,
          'subtraction', '조건 함께 보기 · 두 번 바뀌는 상황 계산하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${big}-${small}과 ${big}-${small + 10} 중 더 큰 것은?`,
        `${big}-${small}`,
        [`${big}-${small + 10}`, '두 값이 같다', '비교할 수 없다'],
        `빼는 수가 작을수록 남는 수가 큽니다. ${small}이 ${small + 10}보다 작으므로 ${big}-${small}이 더 큽니다.`,
        'subtraction', '조건 함께 보기 · 빼지 않고 차 견주기',
      );
    }
  }

  // ── 곱셈구구 ───────────────────────────────────────────────────────────
  if (unit === '곱셈구구' && no >= 2) {
    const dans = dansOfLesson(title);
    const dan = dans.length ? dans[seed % dans.length] : 2;
    const k = 3 + (seed % 6);

    if (dans.length > 0) {
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${dan}×${k}와 ${dan}×${k + 1} 중 더 큰 것은?`,
          `${dan}×${k + 1}`,
          [`${dan}×${k}`, '두 값이 같다', '비교할 수 없다'],
          `묶음이 하나 더 많으므로 ${dan}×${k + 1}이 ${dan}만큼 더 큽니다.`,
          'multiplication', `조건 함께 보기 · ${dan}단에서 곱 견주기`,
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `한 봉지에 사탕이 ${dan}개씩 들어 있습니다. ${k}봉지를 사고 ${dan}개를 더 받으면 모두 몇 개일까요?`,
          `${dan * k + dan}개`,
          [`${dan * k}개`, `${dan * (k + 2)}개`, `${dan + k}개`],
          `${dan}×${k}=${dan * k}개에 ${dan}개를 더하면 ${dan * k + dan}개입니다.`,
          'multiplication', `조건 함께 보기 · ${dan}단을 두 단계 문제에 쓰기`,
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${dan}×□=${dan * k}입니다. □에 알맞은 수는?`,
        k, [dan, k + 1, dan * k],
        `${dan}단에서 곱이 ${dan * k}이 되는 수를 찾으면 ${k}입니다.`,
        'multiplication', `조건 함께 보기 · ${dan}단에서 빈칸 구하기`,
      );
    }

    if (title.includes('곱셈표') || title.includes('문제를 해결')) {
      const a = 2 + (seed % 7);
      const b = 2 + ((seed + 3) % 7);
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `㉠ ${a}×${b}, ㉡ ${b}×${a}, ㉢ ${a}×${b + 1} 중 곱이 가장 큰 것은?`,
          '㉢', ['㉠', '㉡', '모두 같다'],
          `㉠과 ㉡은 ${a * b}으로 같고 ㉢은 ${a * (b + 1)}이므로 ㉢이 가장 큽니다.`,
          'multiplication', '조건 함께 보기 · 여러 곱을 견주어 순서 정하기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `${a}×□가 ${a * 5}보다 작습니다. □에 들어갈 수 있는 수 중 가장 큰 수는?`,
          4, [5, 3, a],
          `${a}×5=${a * 5}이므로 □는 5보다 작아야 합니다. 가장 큰 수는 4입니다.`,
          'multiplication', '조건 함께 보기 · 조건에 맞는 수 찾기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `연필 ${a}자루씩 든 묶음이 ${b}개 있습니다. 한 묶음을 친구에게 주면 남은 연필은 몇 자루일까요?`,
        `${a * (b - 1)}자루`,
        [`${a * b}자루`, `${a * b - 1}자루`, `${a}자루`],
        `묶음이 ${b - 1}개 남으므로 ${a}×${b - 1}=${a * (b - 1)}자루입니다.`,
        'multiplication', '조건 함께 보기 · 묶음이 줄어드는 상황 풀기',
      );
    }
  }

  // ── 시각과 시간 ────────────────────────────────────────────────────────
  if (unit === '시각과 시간' && no >= 2) {
    const hour = 1 + (seed % 11);
    const next = hour === 12 ? 1 : hour + 1;

    if (no >= 2 && no <= 3) {
      const pointer = 1 + (seed % 11);
      const minute = pointer * 5;
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `지호가 말했습니다. "짧은바늘은 ${hour}과 ${next} 사이에 있고, 긴바늘은 ${pointer}을 가리켜." 지호가 본 시각은?`,
          `${hour}시 ${minute}분`,
          [`${next}시 ${minute}분`, `${hour}시 ${pointer}분`, `${pointer}시 ${hour}분`],
          `짧은바늘이 지나온 숫자가 ${hour}이므로 ${hour}시이고, 긴바늘 ${pointer}은 ${minute}분입니다.`,
          'time', '조건 함께 보기 · 설명을 읽고 시각 알아내기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `${hour}시 ${minute}분을 "${pointer}시 ${hour}분"이라고 읽었습니다. 무엇을 잘못했을까요?`,
          '짧은바늘과 긴바늘을 바꾸어 읽었다',
          ['분을 5씩 세지 않았다', '숫자를 잘못 보았다', '잘못한 것이 없다'],
          `짧은바늘이 시, 긴바늘이 분을 나타냅니다. 두 바늘의 역할을 바꾸어 읽으면 안 됩니다.`,
          'time', '조건 함께 보기 · 잘못 읽은 까닭 찾기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `긴바늘이 ${pointer}을 가리킬 때와 ${pointer === 11 ? 1 : pointer + 1}을 가리킬 때는 몇 분 차이일까요?`,
        '5분', ['1분', '10분', `${pointer}분`],
        `숫자 한 칸은 5분이므로 5분 차이입니다.`,
        'time', '조건 함께 보기 · 숫자 한 칸의 차이 알기',
      );
    }

    if (no >= 6) {
      const startMinute = 10 + (seed % 5) * 5;
      const spent = 20 + (seed % 4) * 10;
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${hour}시 ${startMinute}분에 시작해 ${spent}분 동안 책을 읽고 바로 ${10 + (seed % 3) * 5}분 동안 정리했습니다. 모두 몇 분이 걸렸을까요?`,
          `${spent + 10 + (seed % 3) * 5}분`,
          [`${spent}분`, `${10 + (seed % 3) * 5}분`, `${spent + 60}분`],
          `두 활동에 걸린 시간을 더합니다. ${spent}+${10 + (seed % 3) * 5}=${spent + 10 + (seed % 3) * 5}분입니다.`,
          'time', '조건 함께 보기 · 이어진 두 활동의 시간 더하기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `${hour}시에 시작해 ${hour}시 ${startMinute}분에 끝냈습니다. 걸린 시간이 더 긴 것은? ㉠ 이 활동 ㉡ ${startMinute + 10}분 걸린 활동`,
          '㉡', ['㉠', '두 활동이 같다', '알 수 없다'],
          `㉠은 ${startMinute}분이고 ㉡은 ${startMinute + 10}분이므로 ㉡이 더 깁니다.`,
          'time', '조건 함께 보기 · 걸린 시간 견주기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${hour}시 ${startMinute}분부터 ${spent}분이 지나면 몇 시 몇 분일까요?`,
        startMinute + spent >= 60
          ? `${next}시 ${startMinute + spent - 60}분`
          : `${hour}시 ${startMinute + spent}분`,
        [`${hour}시 ${spent}분`, `${next}시 ${startMinute}분`, `${hour}시 ${startMinute}분`],
        `${startMinute}분에 ${spent}분을 더합니다. 60분이 넘으면 1시간으로 바꿉니다.`,
        'time', '조건 함께 보기 · 지난 뒤의 시각 구하기',
      );
    }
  }

  // ── 표와 그래프 ────────────────────────────────────────────────────────
  if (unit === '표와 그래프' && no >= 5) {
    // 네 수는 서로 달라야 '가장 많은/적은 것'의 답이 하나로 정해집니다.
    const counts = [2 + (seed % 2), 5 + (seed % 2), 7 + (seed % 2), 9 + (seed % 2)];
    const names = ['축구', '줄넘기', '책읽기', '그림그리기'];
    const shift = seed % 4;
    const items = names.map((name, position) => ({
      name,
      count: counts[(position + shift) % 4],
    }));
    const line = items.map((item) => `${item.name} ${item.count}명`).join(', ');
    const threshold = 4;
    const over = items.filter((item) => item.count > threshold);

    if (pick === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `${line}입니다. ${threshold}명보다 많은 활동은 모두 몇 가지일까요?`,
        `${over.length}가지`,
        [`${over.length + 1}가지`, `${Math.max(0, over.length - 1)}가지`, '4가지'],
        `${threshold}명보다 많다는 것은 ${threshold}명은 넣지 않습니다. ${over.map((item) => item.name).join(', ')}로 ${over.length}가지입니다.`,
        'data', '조건 함께 보기 · 기준보다 많은 항목 찾기',
      );
    }
    if (pick === 1) {
      const most = items.reduce((best, item) => (item.count > best.count ? item : best));
      const least = items.reduce((best, item) => (item.count < best.count ? item : best));
      return makeQuestion(
        lesson, difficulty, index,
        `${line}입니다. 가장 많은 활동과 가장 적은 활동의 학생 수 차는?`,
        `${most.count - least.count}명`,
        [`${most.count}명`, `${least.count}명`, `${most.count + least.count}명`],
        `가장 많은 ${most.name} ${most.count}명에서 가장 적은 ${least.name} ${least.count}명을 뺍니다.`,
        'data', '조건 함께 보기 · 최다와 최소의 차 구하기',
      );
    }
    const total = items.reduce((sum, item) => sum + item.count, 0);
    return makeQuestion(
      lesson, difficulty, index,
      `${line}입니다. 조사한 학생이 모두 ${total}명일 때 알 수 있는 것으로 알맞은 것은?`,
      '한 사람이 한 가지씩 골랐다',
      ['한 사람이 두 가지씩 골랐다', '고르지 않은 학생이 있다', '알 수 없다'],
      `항목별 수를 모두 더한 값이 조사한 학생 수와 같으므로 한 사람이 한 가지씩 고른 것입니다.`,
      'data', '조건 함께 보기 · 합계로 조사 방법 따져 보기',
    );
  }

  // ── 여러 가지 도형 ─────────────────────────────────────────────────────
  if (unit === '여러 가지 도형' && no >= 2) {
    const triangles = 2 + (seed % 4);
    const squares = 1 + ((seed + 2) % 4);

    if (no >= 2 && no <= 4) {
      if (pick === 0) {
        const shape = no === 2 ? '삼각형' : no === 3 ? '사각형' : '원';
        const sides = no === 2 ? 3 : no === 3 ? 4 : 0;
        return makeQuestion(
          lesson, difficulty, index,
          `${shape}을 찾을 때 크기와 방향이 달라도 되는 까닭은?`,
          no === 4 ? '어느 쪽에서 보아도 둥근 모양이면 되기 때문' : `곧은 변이 ${sides}개이면 되기 때문`,
          no === 4
            ? ['크기가 같아야 하기 때문', '색이 같아야 하기 때문', '방향이 같아야 하기 때문']
            : ['크기가 같아야 하기 때문', '색이 같아야 하기 때문', '방향이 같아야 하기 때문'],
          `${shape}은 크기나 방향이 아니라 모양의 성질로 정합니다.`,
          'shape', `조건 함께 보기 · ${shape}을 성질로 판단하기`,
        );
      }
      if (pick === 1 && no <= 3) {
        const sides = no === 2 ? 3 : 4;
        const count = 2 + (seed % 4);
        return makeQuestion(
          lesson, difficulty, index,
          `${no === 2 ? '삼각형' : '사각형'} ${count}개의 변은 모두 몇 개일까요?`,
          sides * count, [count, sides, sides * count + sides],
          `한 개에 변이 ${sides}개이므로 ${count}개이면 ${sides * count}개입니다.`,
          'shape', '조건 함께 보기 · 여러 도형의 변 수 모으기',
        );
      }
      // 문제가 말하는 두 도형이 그대로 보여야 합니다. 그림 짐작에 맡기면
      // 삼각형 두 개가 나와 문제와 그림이 어긋납니다.
      return makeQuestion(
        lesson, difficulty, index,
        '변이 3개인 도형과 변이 4개인 도형의 꼭짓점 수를 더하면 몇 개일까요?',
        7, [3, 4, 8],
        `변이 3개인 도형은 꼭짓점이 3개, 변이 4개인 도형은 꼭짓점이 4개이므로 3+4=7개입니다.`,
        'shape', '조건 함께 보기 · 두 도형의 꼭짓점 모으기',
        planeShapesVisual('변이 3개인 도형과 변이 4개인 도형', [
          { kind: 'triangle', active: true },
          { kind: 'square', active: true },
        ]),
      );
    }

    if (no === 5) {
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `칠교 조각 중 삼각형이 ${triangles}개, 사각형이 ${squares}개 쓰였습니다. 쓴 조각은 모두 몇 개일까요?`,
          `${triangles + squares}개`,
          [`${triangles}개`, `${squares}개`, `${triangles + squares + 1}개`],
          `${triangles}+${squares}=${triangles + squares}개입니다.`,
          'shape', '조건 함께 보기 · 쓴 칠교 조각 세기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `칠교판은 조각이 모두 7개입니다. ${triangles + squares}개를 쓰면 남는 조각은 몇 개일까요?`,
          `${7 - triangles - squares}개`,
          [`${triangles + squares}개`, '7개', `${7 - triangles}개`],
          `7-${triangles + squares}=${7 - triangles - squares}개가 남습니다.`,
          'shape', '조건 함께 보기 · 남은 칠교 조각 구하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        '칠교 조각을 붙여 새로운 모양을 만들 때 지켜야 할 것은?',
        '변끼리 겹치지 않게 맞대어 붙인다',
        ['조각을 겹쳐 붙인다', '조각을 잘라서 붙인다', '아무렇게나 놓는다'],
        `조각을 겹치거나 자르지 않고 변끼리 맞대어야 새로운 모양이 됩니다.`,
        'shape', '조건 함께 보기 · 칠교 조각을 맞대는 규칙 알기',
      );
    }

    if (no >= 6) {
      // 앞·옆·위에서 본 모양을 묻는 기존 심화 문항도 남겨 둡니다.
      if (pick === 2) return null;

      const first = 3 + (seed % 3);
      const second = 1 + (seed % 3);
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `1층에 ${first}개, 2층에 ${second}개를 쌓았습니다. 여기에 2층으로 ${1 + (seed % 2)}개를 더 올리면 모두 몇 개일까요?`,
          `${first + second + 1 + (seed % 2)}개`,
          [`${first + second}개`, `${first + 1 + (seed % 2)}개`, `${first + second + 2}개`],
          `${first}+${second}+${1 + (seed % 2)}=${first + second + 1 + (seed % 2)}개입니다.`,
          'solid', '조건 함께 보기 · 더 쌓은 뒤의 개수 구하기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `쌓기나무 ${first + second}개로 만든 모양에서 위층 ${second}개를 옆으로 옮겼습니다. 쌓기나무는 몇 개일까요?`,
          `${first + second}개`,
          [`${first}개`, `${second}개`, `${first + second - second}개`],
          `자리를 옮겨도 개수는 변하지 않아 ${first + second}개 그대로입니다.`,
          'solid', '조건 함께 보기 · 옮겨도 개수가 같음 확인하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `쌓기나무 ${first + second}개를 모두 1층에만 놓으면 몇 층이 될까요?`,
        '1층', ['2층', `${first}층`, `${first + second}층`],
        `위로 쌓지 않고 옆으로만 놓으면 1층입니다.`,
        'solid', '조건 함께 보기 · 놓는 방법과 층수 관계 알기',
      );
    }
  }

  // ── 길이 재기 ─────────────────────────────────────────────────────────
  if (unit === '길이 재기') {
    const second = lesson.semester === '2-2';

    if (!second && no >= 3 && no <= 4) {
      const clips = 4 + (seed % 5);
      const erasers = clips + 2 + (seed % 3);
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `같은 끈을 클립으로 재면 ${clips}번, 지우개로 재면 ${erasers}번입니다. 더 짧은 것은?`,
          '지우개', ['클립', '두 단위가 같다', '알 수 없다'],
          `잰 횟수가 많을수록 단위가 짧습니다. ${erasers}번인 지우개가 더 짧습니다.`,
          'measurement', '조건 함께 보기 · 잰 횟수로 단위 견주기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `연필은 클립으로 ${clips}번, 색연필은 클립으로 ${clips + 2}번입니다. 더 긴 것은?`,
          '색연필', ['연필', '두 물건이 같다', '알 수 없다'],
          `같은 단위로 잴 때 잰 횟수가 많을수록 깁니다.`,
          'measurement', '조건 함께 보기 · 같은 단위로 길이 견주기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `한 뼘으로 ${clips}번인 책상과 ${clips}번인 창문의 길이는 어떨까요?`,
        '같은 사람이 재었다면 길이가 비슷하다',
        ['책상이 더 길다', '창문이 더 길다', '비교할 수 없다'],
        `같은 단위로 잰 횟수가 같으면 길이도 비슷합니다.`,
        'measurement', '조건 함께 보기 · 같은 횟수의 뜻 따져 보기',
      );
    }

    if (!second && no >= 5) {
      const start = 2 + (seed % 5);
      const end = start + 4 + (seed % 6);
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `자의 ${start}에서 시작해 ${end}에서 끝난 색 테이프와, 0에서 시작해 ${end - start + 1}에서 끝난 색 테이프 중 더 긴 것은?`,
          `0에서 ${end - start + 1}까지인 것`,
          [`${start}에서 ${end}까지인 것`, '두 테이프가 같다', '알 수 없다'],
          `앞의 것은 ${end}-${start}=${end - start}cm이고 뒤의 것은 ${end - start + 1}cm이므로 뒤가 더 깁니다.`,
          'measurement', '조건 함께 보기 · 시작 눈금이 다른 두 길이 견주기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `길이가 ${end - start}cm인 막대 2개를 이어 붙이면 몇 cm일까요?`,
          `${(end - start) * 2}cm`,
          [`${end - start}cm`, `${(end - start) * 3}cm`, `${end - start + 2}cm`],
          `${end - start}+${end - start}=${(end - start) * 2}cm입니다.`,
          'measurement', '조건 함께 보기 · 이어 붙인 길이 구하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${end}cm인 끈에서 ${start}cm를 잘라 냈습니다. 남은 끈의 길이는?`,
        `${end - start}cm`,
        [`${end}cm`, `${start}cm`, `${end + start}cm`],
        `${end}-${start}=${end - start}cm가 남습니다.`,
        'measurement', '조건 함께 보기 · 잘라 낸 뒤 남은 길이 구하기',
      );
    }

    if (second && no >= 4) {
      const am = 1 + (seed % 3);
      const acm = 20 + (seed % 5) * 10;
      const bcm = 100 + (seed % 4) * 50;

      if (pick === 0) {
        const totalCm = am * 100 + acm + bcm;
        return makeQuestion(
          lesson, difficulty, index,
          `${am}m ${acm}cm인 끈과 ${bcm}cm인 끈을 이으면 몇 m 몇 cm일까요?`,
          `${Math.floor(totalCm / 100)}m ${totalCm % 100}cm`,
          [`${am}m ${acm + bcm}cm`, `${am + 1}m ${acm}cm`, `${totalCm}cm`],
          `${bcm}cm는 ${Math.floor(bcm / 100)}m ${bcm % 100}cm입니다. 모두 더하면 ${Math.floor(totalCm / 100)}m ${totalCm % 100}cm입니다.`,
          'measurement', '조건 함께 보기 · 단위가 다른 두 길이 더하기',
        );
      }
      if (pick === 1) {
        const heights = [
          { name: '가연', cm: 100 + 40 + (seed % 9) },
          { name: '나연', cm: 100 + 60 + (seed % 9) },
          { name: '다연', cm: 100 + 20 + (seed % 9) },
        ];
        const closest = heights.reduce((best, item) =>
          Math.abs(item.cm - 200) < Math.abs(best.cm - 200) ? item : best);
        return makeQuestion(
          lesson, difficulty, index,
          `${heights.map((item) => `${item.name} ${Math.floor(item.cm / 100)}m ${item.cm % 100}cm`).join(', ')}입니다. 2m에 가장 가까운 사람은?`,
          closest.name,
          heights.filter((item) => item.name !== closest.name).map((item) => item.name).concat('모두 같다'),
          `2m는 200cm입니다. ${closest.name}의 키 ${closest.cm}cm가 200cm에 가장 가깝습니다.`,
          'measurement', '조건 함께 보기 · 기준 길이에 가까운 것 찾기',
        );
      }
      // 키는 1m 몇십 cm 정도가 자연스럽습니다.
      const taller = 5 + (seed % 6);
      const heightCm = 20 + (seed % 5) * 5;
      return makeQuestion(
        lesson, difficulty, index,
        `민수의 키는 1m ${heightCm}cm이고 지호는 민수보다 ${taller}cm 더 큽니다. 지호의 키는?`,
        `1m ${heightCm + taller}cm`,
        [`1m ${heightCm}cm`, `1m ${heightCm - taller}cm`, `2m ${heightCm}cm`],
        `${heightCm}+${taller}=${heightCm + taller}이므로 1m ${heightCm + taller}cm입니다.`,
        'measurement', '조건 함께 보기 · 더 큰 키를 이어서 구하기',
      );
    }
  }

  // ── 분류하기 ──────────────────────────────────────────────────────────
  if (unit === '분류하기' && no >= 4) {
    const red = 4 + (seed % 3);
    const blue = 7 + (seed % 3);
    const green = 2 + (seed % 2);
    const total = red + blue + green;

    if (pick === 0) {
      return makeQuestion(
        lesson, difficulty, index,
        `빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개입니다. ${red}개보다 많은 색은 모두 몇 가지일까요?`,
        '1가지', ['2가지', '3가지', '0가지'],
        `${red}개보다 많은 것은 파랑 ${blue}개뿐이므로 1가지입니다. ${red}개인 빨강은 넣지 않습니다.`,
        'data', '조건 함께 보기 · 기준보다 많은 것 세기',
      );
    }
    if (pick === 1) {
      return makeQuestion(
        lesson, difficulty, index,
        `딱지가 모두 ${total}개인데 빨강이 ${red}개, 초록이 ${green}개입니다. 파랑은 몇 개일까요?`,
        `${blue}개`, [`${red}개`, `${green}개`, `${total - red}개`],
        `전체에서 아는 것을 빼면 ${total}-${red}-${green}=${blue}개입니다.`,
        'data', '조건 함께 보기 · 전체에서 빠진 항목 구하기',
      );
    }
    return makeQuestion(
      lesson, difficulty, index,
      `같은 물건을 색깔로 나누면 3묶음, 모양으로 나누면 2묶음이 되었습니다. 알 수 있는 것은?`,
      '기준이 다르면 묶음 수도 다르다',
      ['물건 수가 달라진다', '색깔이 더 정확하다', '모양이 더 정확하다'],
      `기준을 바꾸면 나누어지는 묶음 수가 달라지지만 물건의 수는 그대로입니다.`,
      'classification', '조건 함께 보기 · 두 기준의 결과 견주기',
    );
  }

  // ── 곱셈(2-1) ─────────────────────────────────────────────────────────
  if (unit === '곱셈' && no >= 3) {
    const each = 2 + (seed % 5);
    const groups = 3 + ((seed + 1) % 4);
    const total = each * groups;

    if (no >= 3 && no <= 5) {
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `구슬 ${total}개를 ${each}개씩 묶으면 ${groups}묶음입니다. ${groups}개씩 묶으면 몇 묶음일까요?`,
          `${each}묶음`, [`${groups}묶음`, `${total}묶음`, `${each + 1}묶음`],
          `${total}개를 ${groups}개씩 묶으면 ${each}묶음이 됩니다. 전체 수는 그대로입니다.`,
          'multiplication', '조건 함께 보기 · 묶는 수를 바꾸어 세기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `${each}씩 뛰어 세어 ${total}이 되었습니다. 몇 번 뛰어 세었을까요?`,
          `${groups}번`, [`${each}번`, `${total}번`, `${groups + 1}번`],
          `${each}씩 ${groups}번 뛰어 세면 ${total}이 됩니다.`,
          'multiplication', '조건 함께 보기 · 뛴 횟수를 거꾸로 찾기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${each}개씩 ${groups}묶음에서 ${each}개를 더 놓으면 몇 묶음이 될까요?`,
        `${groups + 1}묶음`, [`${groups}묶음`, `${each}묶음`, `${groups + each}묶음`],
        `${each}개가 한 묶음이므로 묶음이 하나 늘어 ${groups + 1}묶음이 됩니다.`,
        'multiplication', '조건 함께 보기 · 묶음이 늘어나는 상황 따지기',
      );
    }

    if (no >= 6) {
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${Array.from({ length: groups }, () => each).join('+')}을 곱셈식으로 바르게 나타낸 것은?`,
          `${each}×${groups}`,
          [`${groups}×${groups}`, `${each}×${each}`, `${each}+${groups}`],
          `같은 수 ${each}를 ${groups}번 더했으므로 ${each}×${groups}입니다.`,
          'multiplication', '조건 함께 보기 · 덧셈식을 곱셈식으로 바꾸기',
        );
      }
      if (pick === 1) {
        const other = 2 + ((seed + 2) % 5);
        return makeQuestion(
          lesson, difficulty, index,
          `㉠ ${each}×${groups}, ㉡ ${other}×${groups} 중 더 큰 것은?`,
          each > other ? '㉠' : '㉡',
          [each > other ? '㉡' : '㉠', '두 값이 같다', '비교할 수 없다'],
          `묶음 수가 같으면 한 묶음의 수가 클수록 큽니다. ${each}과 ${other}을 비교합니다.`,
          'multiplication', '조건 함께 보기 · 두 곱셈식 견주기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `한 상자에 ${each}개씩 ${groups}상자가 있고 낱개로 ${1 + (seed % 3)}개가 더 있습니다. 모두 몇 개일까요?`,
        `${total + 1 + (seed % 3)}개`,
        [`${total}개`, `${each + groups}개`, `${total + each}개`],
        `${each}×${groups}=${total}개에 낱개 ${1 + (seed % 3)}개를 더하면 ${total + 1 + (seed % 3)}개입니다.`,
        'multiplication', '조건 함께 보기 · 묶음과 낱개를 함께 세기',
      );
    }
  }

  // ── 규칙 찾기 ─────────────────────────────────────────────────────────
  if (unit === '규칙 찾기' && no >= 2) {
    const start = 1 + (seed % 5);
    const step = 2 + (seed % 3);

    if (no >= 2 && no <= 3) {
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}으로 이어집니다. 6번째 수는?`,
          start + step * 5,
          [start + step * 4, start + step * 6, start + step * 3],
          `${step}씩 커지므로 6번째는 ${start}에서 ${step}씩 5번 뛴 ${start + step * 5}입니다.`,
          'pattern', '조건 함께 보기 · 규칙으로 먼 자리 수 구하기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          `○△△가 되풀이됩니다. 9번째에 오는 모양은?`,
          '△', ['○', '□', '알 수 없다'],
          `○△△ 세 개가 한 묶음입니다. 9번째는 세 번째 묶음의 마지막이므로 △입니다.`,
          'pattern', '조건 함께 보기 · 반복 묶음으로 먼 자리 찾기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        `${start}, □, ${start + step * 2}로 이어집니다. □에 알맞은 수는?`,
        start + step, [start, start + step * 2, start + step * 3],
        `양쪽 수의 차가 ${step * 2}이므로 가운데는 ${step}만큼 큰 ${start + step}입니다.`,
        'pattern', '조건 함께 보기 · 가운데 빠진 수 찾기',
      );
    }

    if (title.includes('생활에서')) {
      const start2 = 1 + (seed % 5);
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          `사물함 번호가 ${start2}, ${start2 + 5}, ${start2 + 10}으로 이어집니다. 다음 사물함 번호는?`,
          start2 + 15, [start2 + 11, start2 + 20, start2 + 5],
          `5씩 커지는 규칙이므로 다음은 ${start2 + 15}입니다.`,
          'pattern', '조건 함께 보기 · 생활 속 번호에서 규칙 찾기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          '달력에서 어떤 날이 화요일이면 그로부터 14일 뒤는 무슨 요일일까요?',
          '화요일', ['수요일', '월요일', '목요일'],
          `같은 요일은 7일마다 돌아옵니다. 14일은 7일이 두 번이므로 다시 화요일입니다.`,
          'pattern', '조건 함께 보기 · 반복 주기를 여러 번 적용하기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        '신호등이 초록, 노랑, 빨강 순서로 되풀이됩니다. 7번째에 켜지는 색은?',
        '초록', ['노랑', '빨강', '알 수 없다'],
        `세 색이 한 묶음입니다. 7번째는 세 번째 묶음의 첫 번째이므로 초록입니다.`,
        'pattern', '조건 함께 보기 · 되풀이되는 순서에서 먼 자리 찾기',
      );
    }

    if (no >= 5 && !title.includes('생활에서')) {
      const a = 2 + (seed % 5);
      const b = 3 + (seed % 4);
      const table = title.includes('곱셈표');
      if (pick === 0) {
        return makeQuestion(
          lesson, difficulty, index,
          table
            ? `곱셈표에서 ${a}×${b}=${a * b}입니다. ${a}×${b + 2}는 얼마일까요?`
            : `덧셈표에서 ${a}+${b}=${a + b}입니다. ${a}+${b + 2}는 얼마일까요?`,
          table ? a * (b + 2) : a + b + 2,
          table ? [a * b, a * (b + 1), a * (b + 3)] : [a + b, a + b + 1, a + b + 3],
          table
            ? `${a}단은 ${a}씩 커지므로 두 칸 오른쪽은 ${a * 2}만큼 큰 ${a * (b + 2)}입니다.`
            : `오른쪽으로 한 칸에 1씩 커지므로 두 칸이면 2 커져 ${a + b + 2}입니다.`,
          'pattern', '조건 함께 보기 · 표에서 두 칸 건너뛰기',
        );
      }
      if (pick === 1) {
        return makeQuestion(
          lesson, difficulty, index,
          table
            ? '곱셈표에서 세로줄과 가로줄을 바꾸어 보면 어떤 점을 알 수 있을까요?'
            : '덧셈표에서 세로줄과 가로줄을 바꾸어 보면 어떤 점을 알 수 있을까요?',
          '두 수를 바꾸어도 결과가 같다',
          ['결과가 커진다', '결과가 작아진다', '규칙이 사라진다'],
          `두 수의 순서를 바꾸어도 ${table ? '곱' : '합'}은 같습니다.`,
          'pattern', '조건 함께 보기 · 순서를 바꾸어도 같은 규칙 찾기',
        );
      }
      return makeQuestion(
        lesson, difficulty, index,
        table
          ? `곱셈표에서 ${a}단을 아래로 읽으면 몇씩 커질까요?`
          : `덧셈표에서 아래로 한 칸 갈 때마다 몇씩 커질까요?`,
        table ? `${a}씩` : '1씩',
        table ? [`1씩`, `${a + 1}씩`, `${a * 2}씩`] : ['2씩', `${a}씩`, '변하지 않는다'],
        table
          ? `${a}단은 묶음이 하나씩 늘어 ${a}씩 커집니다.`
          : `아래로 갈수록 더해지는 수가 1씩 커집니다.`,
        'pattern', '조건 함께 보기 · 표에서 세로 규칙 찾기',
      );
    }
  }

  return null;
};

const generateRawQuestions = (lesson: Lesson, difficulty: Difficulty): Question[] =>
  Array.from({ length: 30 }, (_, index) => {
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

// 풀이 과정 문항(① ② 로 나눠 빈칸을 채우는 문항)은 읽을 것이 많고 단계를
// 따라가야 해서 어렵습니다. 30문항 중 몇 자리를 이 문항에 줄지 난이도마다
// 다르게 정합니다.
//   하  0문항  — 먼저 답을 낼 수 있어야 합니다.
//   중 10문항  — 세 문제에 한 번쯤 과정을 짚어 봅니다.
//   상 20문항  — 과정을 설명할 수 있어야 합니다.
const isStepSlot = (difficulty: Difficulty, index: number) => {
  if (difficulty === '하') return false;
  if (difficulty === '중') return index % 3 === 1;
  return index % 3 !== 0;
};


// ════════════════════════════════════════════════════════════════════
// 문제의 '모양'을 여러 가지로 갖추기
// ────────────────────────────────────────────────────────────────────
// 같은 차시의 문제가 숫자만 바뀐 채 되풀이되면, 아이는 문제를 이해하는
// 대신 한 가지 절차를 외웁니다. 국가 학습 진단 평가지(에듀넷·기초학력)의
// 같은 주제 문항들을 보면 한 주제에 열 가지 안팎의 서로 다른 모양이
// 쓰입니다. 여기서는 그중 되풀이해서 나타나는 모양들을 갖춥니다.
//
//   A 같은 값 다른 표현  '112를 민준이와 다른 방법으로 나타내 보세요'
//   B 두 값 비교        '2×8 ○ 5×3'
//   C 거꾸로 구하기      '2×□=10'
//   D 읽기 ↔ 쓰기       '512 ─ 오백십이 잇기'
//   E 실생활 묶음 문장제  '100개씩 6상자, 10개씩 4봉지, 낱개 3개'
//   F 옳은 것 고르기     오개념을 보기로 세워 판단하게 하기
//
// 슬롯마다 모양을 돌려 쓰므로, 운이 아니라 구조로 다양해집니다.
// ════════════════════════════════════════════════════════════════════

// 모양마다 어느 차시에 어울리는지를 함께 적어 둡니다. 이것이 없으면
// 한 단원의 모든 차시가 같은 문제를 받게 되어, 차시별 학습 목표와
// 상관없는 문제가 나옵니다(크기 비교를 배우기 전에 비교를 묻는 식으로).
// 하 수준에는 '조건 함께 보기' 같은 심화 계열 이름을 붙이지 않습니다.
// 같은 문항이라도 하에서는 조건을 줄여 내므로 이름도 그에 맞춰야 합니다.
const shapeStrategy = (difficulty: Difficulty, rich: string, plain: string) =>
  difficulty === '하' ? plain : rich;

// 받침이 있으면 '이/은', 없으면 '가/는'입니다. '구슬가', '사과이'처럼
// 쓰면 2학년이 읽다가 걸립니다.
const hasFinal = (word: string) => {
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};
const subject = (word: string) => `${word}${hasFinal(word) ? '이' : '가'}`;
const topic = (word: string) => `${word}${hasFinal(word) ? '은' : '는'}`;

type Shape = {
  fits: (lesson: Lesson) => boolean;
  make: (lesson: Lesson, difficulty: Difficulty, index: number) => Question | null;
};

// ── 수(세 자리 수 / 네 자리 수) ────────────────────────────────────
const numberShapes: Shape[] = [
  // A. 같은 값을 다른 묶음으로 나타내기
  {
    fits: (lesson) => /세 자리 수를 알아|네 자리 수를 알아/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const four = lesson.unitTitle === '네 자리 수';
    const seed = index * 7 + lesson.lessonNo * 3;
    const big = 2 + (seed % 6);
    const mid = 1 + (seed % 4);
    const ones = 1 + (seed % 8);
    const value = four ? big * 1000 + mid * 100 + ones : big * 100 + mid * 10 + ones;
    const bigName = four ? '1000' : '100';
    const midName = four ? '100' : '10';
    const swap = four ? 10 : 10;

    return makeQuestion(
      lesson, difficulty, index,
      `${value}를 ${bigName}이 ${big}개, ${midName}이 ${mid}개, 1이 ${ones}개로 나타냈습니다. 같은 수를 다르게 나타낸 것은?`,
      `${bigName}이 ${big - 1}개, ${midName}이 ${mid + swap}개, 1이 ${ones}개`,
      [
        `${bigName}이 ${big + 1}개, ${midName}이 ${mid}개, 1이 ${ones}개`,
        `${bigName}이 ${big}개, ${midName}이 ${mid + 1}개, 1이 ${ones}개`,
        `${bigName}이 ${big - 1}개, ${midName}이 ${mid}개, 1이 ${ones}개`,
      ],
      `${bigName} 1개를 ${midName} ${swap}개로 바꾸어도 수는 그대로입니다.`,
      'placeValue', shapeStrategy(difficulty, '자료 해석 · 같은 수를 다른 방법으로 나타내기', '같은 수를 다른 방법으로 나타내기'),
      placeValueVisualFor(value, '바꾸어 나타내기', four ? 4 : 3),
    );
  } },

  // D. 읽기 ↔ 쓰기
  {
    fits: (lesson) => /세 자리 수를 알아|네 자리 수를 알아/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const four = lesson.unitTitle === '네 자리 수';
    const seed = index * 11 + lesson.lessonNo;
    const value = four
      ? (1 + (seed % 8)) * 1000 + (seed % 9) * 100 + ((seed + 3) % 9) * 10 + (seed % 8)
      : (1 + (seed % 8)) * 100 + ((seed + 2) % 9) * 10 + ((seed + 5) % 9);
    const said = readKoreanNumber(value);
    return makeQuestion(
      lesson, difficulty, index,
      `${said}을(를) 수로 쓰면 얼마일까요?`,
      value, [value + (four ? 1000 : 100), value - 1, value + 10],
      `자리마다 숫자를 차례로 써서 ${value}입니다.`,
      'number', '읽은 것을 수로 쓰기',
    );
  } },

  // E. 실생활 묶음 문장제
  {
    fits: (lesson) => /세 자리 수를 알아|네 자리 수를 알아|단원 종합|학기 종합/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const four = lesson.unitTitle === '네 자리 수';
    const seed = index * 5 + lesson.lessonNo * 2;
    const box = 2 + (seed % 7);
    const bag = 1 + (seed % 9);
    const loose = 1 + (seed % 8);
    const per = four ? 1000 : 100;
    const total = box * per + bag * 10 + loose;
    const thing = ['사과', '구슬', '색종이', '단추'][seed % 4];
    return makeQuestion(
      lesson, difficulty, index,
      `${subject(thing)} ${per}개씩 든 상자 ${box}개, 10개씩 든 봉지 ${bag}개, 낱개 ${loose}개 있습니다. ${topic(thing)} 모두 몇 개일까요?`,
      total, [total + per, total - 10, box * per + bag + loose],
      `${per}이 ${box}개, 10이 ${bag}개, 1이 ${loose}개이므로 ${total}개입니다.`,
      'placeValue', shapeStrategy(difficulty, '조건 함께 보기 · 묶음으로 담긴 물건의 수 구하기', '묶음으로 담긴 물건의 수 구하기'),
    );
  } },

  // B. 두 수 비교 — 자리마다 견주기
  {
    fits: (lesson) => /크기를 비교/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const four = lesson.unitTitle === '네 자리 수';
    const seed = index * 13 + lesson.lessonNo;
    const head = 2 + (seed % 6);
    const a = four ? head * 1000 + 480 : head * 100 + 48;
    const b = four ? head * 1000 + 840 : head * 100 + 84;
    const askBig = seed % 2 === 0;
    return makeQuestion(
      lesson, difficulty, index,
      `${a}와 ${b} 중 더 ${askBig ? '큰' : '작은'} 수는 얼마일까요?`,
      askBig ? b : a, [askBig ? a : b, a + b, Math.abs(a - b)],
      `가장 높은 자리가 같으므로 다음 자리를 견주면 ${askBig ? b : a}이(가) 더 ${askBig ? '큽니다' : '작습니다'}.`,
      'placeValue', shapeStrategy(difficulty, '자료 해석 · 자리마다 견주어 크기 비교하기', '자리마다 견주어 크기 비교하기'),
    );
  } },

  // F. 옳은 것 고르기 — 오개념을 보기로 세웁니다
  {
    fits: (lesson) => /각 자리의 숫자|단원 종합|학기 종합/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const four = lesson.unitTitle === '네 자리 수';
    const seed = index * 17 + lesson.lessonNo;
    const value = four ? 3000 + (seed % 9) * 100 + 50 : 300 + (seed % 9) * 10 + 5;
    const digit = Math.floor((value % 100) / 10);
    return makeQuestion(
      lesson, difficulty, index,
      `${value}에 대한 설명으로 옳은 것은?`,
      `십의 자리 숫자는 ${digit}입니다`,
      [
        `십의 자리 숫자는 ${value % 10}입니다`,
        `가장 큰 자리는 일의 자리입니다`,
        `숫자가 클수록 나타내는 값도 항상 큽니다`,
      ],
      `자리마다 나타내는 값이 다릅니다. 십의 자리 숫자는 ${digit}입니다.`,
      'placeValue', shapeStrategy(difficulty, '자료 해석 · 설명이 옳은지 판단하기', '설명이 옳은지 판단하기'),
      placeValueVisualFor(value, '자리값 살펴보기', four ? 4 : 3),
    );
  } },
];

// ── 곱셈 / 곱셈구구 ────────────────────────────────────────────────
// 이 차시가 다루는 단입니다. '2단 곱셈구구를 알아볼까요'면 2단만 씁니다.
// 이걸 보지 않고 아무 단이나 쓰면 2단 차시에 3단 문제가 나옵니다.
const dansOf = (lesson: Lesson): number[] => {
  const found = lesson.title.match(/(\d)단/g)?.map((x) => Number(x[0])) ?? [];
  if (found.length) return found;
  // 곱셈구구를 모두 배운 뒤(활용·종합)에는 어느 단이든 쓸 수 있습니다.
  return /곱셈구구를 이용|곱셈표|단원 종합|학기 종합/.test(lesson.title)
    ? [2, 3, 4, 5, 6, 7, 8, 9]
    : [];
};

const multiplyShapes: Shape[] = [
  // B. 두 곱 비교
  {
    fits: (lesson) => /곱셈구구를 이용|단원 종합|학기 종합/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const seed = index * 7 + lesson.lessonNo;
    const dans = dansOf(lesson);
    if (dans.length === 0) return null;
    const a1 = dans[seed % dans.length];
    const b1 = 2 + ((seed + 3) % 7);
    const a2 = dans[(seed + 1) % dans.length];
    const b2 = 2 + ((seed + 1) % 7);
    if (a1 * b1 === a2 * b2) return null;
    const bigger = a1 * b1 > a2 * b2 ? `${a1}×${b1}` : `${a2}×${b2}`;
    return makeQuestion(
      lesson, difficulty, index,
      `${a1}×${b1}과 ${a2}×${b2} 중 더 큰 것은?`,
      bigger,
      [a1 * b1 > a2 * b2 ? `${a2}×${b2}` : `${a1}×${b1}`, '두 값은 같다', '알 수 없다'],
      `${a1}×${b1}=${a1 * b1}, ${a2}×${b2}=${a2 * b2}이므로 ${bigger}이 더 큽니다.`,
      'multiplication', shapeStrategy(difficulty, '자료 해석 · 두 곱의 크기 비교하기', '두 곱의 크기 비교하기'),
    );
  } },

  // C. 거꾸로 구하기 — 곱하는 수를 찾기
  {
    fits: (lesson) => /곱셈표|곱셈구구를 이용|곱셈구구로 문제/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const seed = index * 11 + lesson.lessonNo;
    const dans = dansOf(lesson);
    if (dans.length === 0) return null;
    const dan = dans[seed % dans.length];
    const times = 2 + ((seed + 4) % 8);
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}×□=${dan * times}에서 □에 알맞은 수는?`,
      times, [times + 1, times - 1, dan],
      `${dan}씩 ${times}묶음이면 ${dan * times}이므로 □는 ${times}입니다.`,
      'multiplication', shapeStrategy(difficulty, '조건 함께 보기 · 곱하는 수를 거꾸로 찾기', '곱하는 수를 거꾸로 찾기'),
      arrayVisualFor(times, dan, `${dan}씩 묶어 보기`),
    );
  } },

  // A. 같은 곱을 다른 곱셈식으로
  {
    fits: (lesson) => /곱셈표|곱셈구구를 이용/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const seed = index * 5 + lesson.lessonNo;
    const dans = dansOf(lesson);
    if (dans.length === 0) return null;
    const a = dans[seed % dans.length];
    const b = 2 + ((seed + 2) % 4);
    const product = a * b * 2;
    return makeQuestion(
      lesson, difficulty, index,
      `${a}×${b * 2}와 곱이 같은 곱셈식은?`,
      `${a * 2}×${b}`,
      [`${a}×${b}`, `${a * 2}×${b * 2}`, `${a + 2}×${b}`],
      `${a}×${b * 2}=${product}이고 ${a * 2}×${b}=${product}로 곱이 같습니다.`,
      'multiplication', shapeStrategy(difficulty, '자료 해석 · 곱이 같은 다른 식 찾기', '곱이 같은 다른 식 찾기'),
    );
  } },

  // E. 실생활 문장제 — 묶음 상황
  {
    fits: (lesson) => /곱셈식으로 나타내|단원 종합|학기 종합/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const seed = index * 13 + lesson.lessonNo;
    const dans = dansOf(lesson);
    const per = dans.length ? dans[seed % dans.length] : 2 + (seed % 8);
    const groups = 2 + ((seed + 3) % 8);
    const thing = ['한 상자', '한 봉지', '한 접시', '한 묶음'][seed % 4];
    const item = ['빵', '귤', '초콜릿', '연필'][seed % 4];
    return makeQuestion(
      lesson, difficulty, index,
      `${thing}에 ${subject(item)} ${per}개씩 들어 있습니다. ${groups}${thing.slice(1)}에는 ${subject(item)} 모두 몇 개일까요?`,
      `${per * groups}개`,
      [`${per + groups}개`, `${per * groups + per}개`, `${per * (groups - 1)}개`],
      `${per}씩 ${groups}묶음이므로 ${per}×${groups}=${per * groups}개입니다.`,
      'multiplication', shapeStrategy(difficulty, '조건 함께 보기 · 묶음 상황을 곱셈으로 해결하기', '묶음 상황을 곱셈으로 해결하기'),
      arrayVisualFor(groups, per, `${per}씩 ${groups}묶음`),
    );
  } },

  // F. 옳은 것 고르기
  {
    fits: (lesson) => /단 곱셈구구/.test(lesson.title),
    make: (lesson, difficulty, index) => {
    const seed = index * 19 + lesson.lessonNo;
    const dans = dansOf(lesson);
    if (dans.length === 0) return null;
    const dan = dans[seed % dans.length];
    return makeQuestion(
      lesson, difficulty, index,
      `${dan}단 곱셈구구에 대한 설명으로 옳은 것은?`,
      `곱하는 수가 1 커지면 곱은 ${dan}씩 커집니다`,
      [
        `곱하는 수가 1 커지면 곱은 1씩 커집니다`,
        `곱하는 수가 커져도 곱은 그대로입니다`,
        `${dan}단에는 ${dan}보다 작은 곱도 있습니다`,
      ],
      `${dan}씩 한 묶음이 늘어나므로 곱은 ${dan}씩 커집니다.`,
      'multiplication', shapeStrategy(difficulty, '자료 해석 · 곱셈구구의 성질 판단하기', '곱셈구구의 성질 판단하기'),
    );
  } },
];


// ── 덧셈과 뺄셈 ────────────────────────────────────────────────────
const calcShapes: Shape[] = [
  // 문장 상황을 식으로 세우기 (합치기 / 더 많이)
  {
    fits: (lesson) => /덧셈을 해|여러 가지 방법으로 덧셈/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const a = 24 + (seed % 40);
      const b = 15 + ((seed + 3) % 30);
      const item = ['딱지', '구슬', '색연필', '스티커'][seed % 4];
      return makeQuestion(
        lesson, difficulty, index,
        `바구니에 ${subject(item)} ${a}개 있습니다. 상자에는 바구니보다 ${b}개 더 많습니다. 상자에 있는 ${topic(item)} 몇 개일까요?`,
        `${a + b}개`, [`${a - b > 0 ? a - b : b - a}개`, `${b}개`, `${a + b + 10}개`],
        `'더 많이'는 더하는 상황입니다. ${a}+${b}=${a + b}개입니다.`,
        'addition',
        shapeStrategy(difficulty, '조건 함께 보기 · 문장을 덧셈식으로 세우기', '문장을 덧셈식으로 세우기'),
      );
    } },

  // 틀린 풀이 찾기 — 받아올림을 빠뜨린 오개념
  {
    fits: (lesson) => /덧셈을 해 볼까요 ⑵|여러 가지 방법으로 덧셈/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const a = 20 + (seed % 5) * 10 + 7;
      const b = 10 + ((seed + 2) % 5) * 10 + 8;
      const wrong = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10 + ((a % 10) + (b % 10)) % 10;
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 ${wrong}이라고 답했습니다. 무엇을 빠뜨렸을까요?`,
        '일의 자리에서 받아올림한 1을 더하지 않았습니다',
        ['십의 자리끼리 더하지 않았습니다', '일의 자리끼리 더하지 않았습니다', '틀린 곳이 없습니다'],
        `${a % 10}+${b % 10}=${(a % 10) + (b % 10)}이므로 10을 십의 자리로 올려야 합니다. 답은 ${a + b}입니다.`,
        'addition',
        shapeStrategy(difficulty, '자료 해석 · 틀린 풀이에서 빠진 곳 찾기', '틀린 곳 찾기'),
      );
    } },

  // 계산하지 않고 견주기
  {
    fits: (lesson) => /여러 가지 방법으로 덧셈|여러 가지 방법으로 뺄셈/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 13 + lesson.lessonNo;
      // 두 자리 수 범위를 넘지 않게 합니다. 뺄셈 쪽은 40을 더해 쓰므로
      // 그만큼 시작 값을 낮춰 둡니다.
      const base = 20 + (seed % 25);
      const add = 15 + (seed % 12);
      const plus = /덧셈/.test(lesson.title);
      const left = plus ? `${base}+${add}` : `${base + 40}-${add}`;
      const right = plus ? `${base}+${add + 1}` : `${base + 40}-${add + 1}`;
      return makeQuestion(
        lesson, difficulty, index,
        `${left}과 ${right} 중 더 큰 것은? 계산하지 않고 생각해 보세요.`,
        plus ? right : left,
        [plus ? left : right, '두 값은 같다', '알 수 없다'],
        plus
          ? `더하는 수가 1 크면 합도 1 큽니다.`
          : `빼는 수가 1 크면 남는 수는 1 작습니다.`,
        plus ? 'addition' : 'subtraction',
        shapeStrategy(difficulty, '자료 해석 · 계산하지 않고 크기 견주기', '계산하지 않고 견주기'),
      );
    } },

  // 뺄셈 문장 상황 (남은 것 / 차이)
  {
    fits: (lesson) => /뺄셈을 해/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 17 + lesson.lessonNo;
      const all = 40 + (seed % 45);
      const gone = 12 + ((seed + 5) % 25);
      const item = ['사탕', '색종이', '풍선', '연필'][seed % 4];
      return makeQuestion(
        lesson, difficulty, index,
        `${subject(item)} ${all}개 있었는데 ${gone}개를 썼습니다. 남은 ${item}은 몇 개일까요?`,
        `${all - gone}개`, [`${all + gone}개`, `${gone}개`, `${all - gone + 10}개`],
        `쓴 만큼 덜어 내면 ${all}-${gone}=${all - gone}개입니다.`,
        'subtraction',
        shapeStrategy(difficulty, '조건 함께 보기 · 문장을 뺄셈식으로 세우기', '문장을 뺄셈식으로 세우기'),
      );
    } },

  // 덧셈과 뺄셈의 관계 — 검산
  {
    fits: (lesson) => /관계를 식으로/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 19 + lesson.lessonNo;
      const a = 20 + (seed % 30);
      const b = 13 + ((seed + 4) % 25);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}=${a + b}입니다. 이것을 이용하면 ${a + b}-${b}는 얼마일까요?`,
        a, [b, a + b, a - b > 0 ? a - b : b - a],
        `전체에서 한 부분을 빼면 다른 부분이 나옵니다. ${a + b}-${b}=${a}입니다.`,
        'subtraction',
        shapeStrategy(difficulty, '자료 해석 · 덧셈으로 뺄셈 알아보기', '덧셈으로 뺄셈 알아보기'),
      );
    } },

  // 세 수의 계산 — 앞에서부터 차례로
  {
    fits: (lesson) => /세 수의 계산/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 23 + lesson.lessonNo;
      const a = 20 + (seed % 30);
      const b = 10 + ((seed + 3) % 20);
      const c = 5 + ((seed + 7) % 15);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}-${c}를 계산할 때, 먼저 계산해야 하는 것은?`,
        `${a}+${b}`, [`${b}-${c}`, `${a}-${c}`, '어느 것이든 좋다'],
        `세 수의 계산은 앞에서부터 차례로 합니다. ${a}+${b}=${a + b}, ${a + b}-${c}=${a + b - c}입니다.`,
        'addition',
        shapeStrategy(difficulty, '자료 해석 · 계산 차례 정하기', '계산 차례 정하기'),
      );
    } },

  // 세 수의 계산 — 문장 상황
  {
    fits: (lesson) => /세 수의 계산/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 29 + lesson.lessonNo;
      const start = 30 + (seed % 30);
      const got = 8 + (seed % 12);
      const gave = 5 + ((seed + 4) % 10);
      const item = ['구슬', '딱지', '사탕', '색종이'][seed % 4];
      return makeQuestion(
        lesson, difficulty, index,
        `${subject(item)} ${start}개 있었습니다. ${got}개를 더 받고 ${gave}개를 주었습니다. 지금 ${topic(item)} 몇 개일까요?`,
        `${start + got - gave}개`,
        [`${start + got + gave}개`, `${start - got + gave}개`, `${start + got}개`],
        `받으면 더하고 주면 뺍니다. ${start}+${got}-${gave}=${start + got - gave}개입니다.`,
        'addition',
        shapeStrategy(difficulty, '조건 함께 보기 · 받고 준 상황을 차례로 계산하기', '받고 준 상황 계산하기'),
      );
    } },

  // □의 값 — 어떤 식으로 구할지 고르기
  {
    fits: (lesson) => /□의 값/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 31 + lesson.lessonNo;
      const part = 12 + (seed % 20);
      const whole = part + 15 + ((seed + 5) % 25);
      return makeQuestion(
        lesson, difficulty, index,
        `${part}+□=${whole}에서 □를 구하려면 어떤 식으로 계산해야 할까요?`,
        `${whole}-${part}`, [`${whole}+${part}`, `${part}-${whole}`, `${part}+${whole}`],
        `전체에서 아는 부분을 빼면 □가 나옵니다. ${whole}-${part}=${whole - part}입니다.`,
        'subtraction',
        shapeStrategy(difficulty, '자료 해석 · □를 구하는 식 세우기', '□를 구하는 식 세우기'),
      );
    } },

  // □의 값 — 문장 상황
  {
    fits: (lesson) => /□의 값/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 37 + lesson.lessonNo;
      const had = 15 + (seed % 20);
      const now = had + 10 + ((seed + 3) % 20);
      return makeQuestion(
        lesson, difficulty, index,
        `연필이 ${had}자루 있었는데 몇 자루를 더 받아 ${now}자루가 되었습니다. 더 받은 연필은 몇 자루일까요?`,
        `${now - had}자루`,
        [`${now + had}자루`, `${now}자루`, `${now - had + 5}자루`],
        `늘어난 만큼이 더 받은 수입니다. ${now}-${had}=${now - had}자루입니다.`,
        'subtraction',
        shapeStrategy(difficulty, '조건 함께 보기 · 늘어난 수를 거꾸로 구하기', '늘어난 수 거꾸로 구하기'),
      );
    } },

  // 뺄셈 — 두 수의 차 견주기
  {
    fits: (lesson) => /뺄셈을 해|여러 가지 방법으로 뺄셈/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 41 + lesson.lessonNo;
      const big = 50 + (seed % 40);
      const small = 20 + ((seed + 6) % 25);
      const item = ['빨간 구슬', '파란 구슬'];
      return makeQuestion(
        lesson, difficulty, index,
        `${item[0]}이 ${big}개, ${item[1]}이 ${small}개 있습니다. ${item[0]}은 ${item[1]}보다 몇 개 더 많을까요?`,
        `${big - small}개`, [`${big + small}개`, `${small}개`, `${big}개`],
        `'몇 개 더 많은지'는 빼서 구합니다. ${big}-${small}=${big - small}개입니다.`,
        'subtraction',
        shapeStrategy(difficulty, '조건 함께 보기 · 두 수의 차를 구하기', '두 수의 차 구하기'),
      );
    } },

  // 뺄셈 — 검산으로 확인하기
  {
    fits: (lesson) => /뺄셈을 해|여러 가지 방법으로 뺄셈|□의 값/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 43 + lesson.lessonNo;
      const whole = 45 + (seed % 40);
      const part = 15 + ((seed + 5) % 20);
      return makeQuestion(
        lesson, difficulty, index,
        `${whole}-${part}=${whole - part}이 맞는지 확인하려면 어떻게 하면 될까요?`,
        `${whole - part}+${part}가 ${whole}인지 본다`,
        [`${whole}+${part}가 맞는지 본다`, `${whole - part}-${part}를 해 본다`, `확인할 방법이 없다`],
        `뺀 값에 뺀 수를 도로 더하면 처음 수가 되어야 합니다.`,
        'subtraction',
        shapeStrategy(difficulty, '자료 해석 · 덧셈으로 뺄셈 확인하기', '덧셈으로 확인하기'),
      );
    } },

  // 십 몇을 만들어 계산하기
  {
    fits: (lesson) => /여러 가지 방법으로 덧셈|세 수의 계산/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 47 + lesson.lessonNo;
      const a = 20 + (seed % 30);
      const need = 10 - (a % 10);
      if (need === 10) return null;
      const b = need + 10 + (seed % 20);
      return makeQuestion(
        lesson, difficulty, index,
        `${a}+${b}를 쉽게 계산하려고 합니다. ${b}를 어떻게 가르면 좋을까요?`,
        `${need}과 ${b - need}`,
        [`${b - 1}과 1`, `${Math.floor(b / 2)}과 ${b - Math.floor(b / 2)}`, `10과 ${b - 10}`],
        `${a}에 ${need}을 더하면 ${a + need}으로 몇십이 되어 계산이 쉬워집니다.`,
        'addition',
        shapeStrategy(difficulty, '자료 해석 · 몇십을 만들어 쉽게 계산하기', '몇십을 만들어 계산하기'),
      );
    } },
];

// ── 여러 가지 도형 ─────────────────────────────────────────────────
const figureShapes: Shape[] = [
  // 성질을 듣고 도형 이름 찾기
  {
    fits: (lesson) => /을 알아보고 찾아/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const target = lesson.title.includes('△') ? '삼각형'
        : lesson.title.includes('□') ? '사각형' : '원';
      const facts: Record<string, string> = {
        삼각형: '곧은 선 3개로 둘러싸인 도형',
        사각형: '곧은 선 4개로 둘러싸인 도형',
        원: '어느 쪽에서 보아도 똑같이 둥근 도형',
      };
      const others = ['삼각형', '사각형', '원'].filter((x) => x !== target);
      return makeQuestion(
        lesson, difficulty, index,
        `${facts[target]}의 이름은 무엇일까요?`,
        target, [...others, '곧은 선이 없는 도형'],
        `${facts[target]}을 ${target}이라고 합니다.`,
        'shape',
        shapeStrategy(difficulty, '자료 해석 · 성질을 듣고 도형 알아보기', '성질을 듣고 도형 알아보기'),
      );
    } },

  // 생활 속 물건과 잇기
  {
    fits: (lesson) => /을 알아보고 찾아/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const target = lesson.title.includes('△') ? '삼각형'
        : lesson.title.includes('□') ? '사각형' : '원';
      const things: Record<string, string> = { 삼각형: '삼각김밥', 사각형: '공책', 원: '동전' };
      const others = ['삼각김밥', '공책', '동전'].filter((x) => x !== things[target]);
      return makeQuestion(
        lesson, difficulty, index,
        `${target} 모양을 찾을 수 있는 물건은 무엇일까요?`,
        things[target], [...others, '구슬'],
        `${things[target]}의 겉면에서 ${target} 모양을 찾을 수 있습니다.`,
        'shape',
        shapeStrategy(difficulty, '조건 함께 보기 · 생활 속에서 도형 찾기', '생활 속에서 도형 찾기'),
      );
    } },

  // 쌓기나무 — 위치로 말하기
  {
    fits: (lesson) => /쌓은 모양|쌓아 볼까요/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const bottom = 2 + (seed % 3);
      const top = 1 + (seed % 2);
      return makeQuestion(
        lesson, difficulty, index,
        `1층에 ${bottom}개, 2층에 ${top}개를 쌓았습니다. 쌓기나무는 모두 몇 개일까요?`,
        `${bottom + top}개`,
        [`${bottom}개`, `${bottom * top}개`, `${bottom + top + 1}개`],
        `층마다 세어 더하면 ${bottom}+${top}=${bottom + top}개입니다.`,
        'solid',
        shapeStrategy(difficulty, '자료 해석 · 층마다 세어 개수 구하기', '층마다 세어 보기'),
      );
    } },
];

// ── 길이 재기 ──────────────────────────────────────────────────────
const lengthShapes: Shape[] = [
  // 자로 잴 때 0이 아닌 곳에서 시작한 경우
  {
    fits: (lesson) => /자로 길이를 재/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const from = 1 + (seed % 4);
      const len = 4 + (seed % 6);
      return makeQuestion(
        lesson, difficulty, index,
        `연필의 왼쪽 끝이 자의 ${from}에, 오른쪽 끝이 ${from + len}에 있습니다. 연필의 길이는 몇 cm일까요?`,
        `${len}cm`, [`${from + len}cm`, `${len + 1}cm`, `${from}cm`],
        `0에서 시작하지 않았으므로 ${from + len}-${from}=${len}cm입니다.`,
        'measurement',
        shapeStrategy(difficulty, '조건 함께 보기 · 시작 눈금을 살펴 길이 재기', '시작 눈금 살펴보기'),
        rulerVisualFor(from, from + len, '자로 재어 보기'),
      );
    } },

  // 어림한 길이와 실제 길이
  {
    fits: (lesson) => /어림/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const real = 8 + (seed % 12);
      const guess = real + (seed % 2 === 0 ? 2 : -2);
      return makeQuestion(
        lesson, difficulty, index,
        `막대의 길이를 약 ${guess}cm로 어림했는데 실제로 재어 보니 ${real}cm였습니다. 어림한 길이와 실제 길이의 차는 몇 cm일까요?`,
        `${Math.abs(real - guess)}cm`,
        [`${real + guess}cm`, `${real}cm`, `${Math.abs(real - guess) + 1}cm`],
        `${Math.max(real, guess)}-${Math.min(real, guess)}=${Math.abs(real - guess)}cm입니다.`,
        'measurement',
        shapeStrategy(difficulty, '자료 해석 · 어림과 실제 길이 견주기', '어림과 실제 견주기'),
      );
    } },

  // 단위가 다르면 잰 횟수도 다름
  {
    fits: (lesson) => /여러 가지 단위|길이를 비교하는 방법/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 13 + lesson.lessonNo;
      const clips = 6 + (seed % 6);
      const erasers = Math.max(2, clips - 2 - (seed % 2));
      return makeQuestion(
        lesson, difficulty, index,
        `같은 끈을 클립으로 재면 ${clips}번, 지우개로 재면 ${erasers}번입니다. 클립과 지우개 중 더 긴 것은?`,
        '지우개', ['클립', '길이가 같다', '알 수 없다'],
        `같은 길이인데 잰 횟수가 적을수록 단위가 깁니다. ${erasers}번인 지우개가 더 깁니다.`,
        'measurement',
        shapeStrategy(difficulty, '자료 해석 · 잰 횟수로 단위 길이 견주기', '잰 횟수로 견주기'),
      );
    } },

  // m와 cm 바꾸기
  {
    fits: (lesson) => /더 큰 단위/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 17 + lesson.lessonNo;
      const m = 1 + (seed % 4);
      const cm = 10 + (seed % 80);
      return makeQuestion(
        lesson, difficulty, index,
        `${m}m ${cm}cm는 몇 cm일까요?`,
        `${m * 100 + cm}cm`,
        [`${m + cm}cm`, `${m * 100}cm`, `${m * 10 + cm}cm`],
        `1m는 100cm이므로 ${m}m는 ${m * 100}cm입니다. 여기에 ${cm}cm를 더하면 ${m * 100 + cm}cm입니다.`,
        'measurement',
        shapeStrategy(difficulty, '조건 함께 보기 · m를 cm로 바꾸기', 'm를 cm로 바꾸기'),
      );
    } },

  // 길이의 합·차 문장 상황
  {
    fits: (lesson) => /길이의 합|길이의 차/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 19 + lesson.lessonNo;
      const a = 1 + (seed % 3);
      const acm = 20 + (seed % 60);
      const b = 1 + ((seed + 1) % 3);
      const bcm = 10 + ((seed + 20) % 30);
      const plus = lesson.title.includes('합');
      const total = plus ? (a + b) * 100 + acm + bcm : (a - b) * 100 + acm - bcm;
      const m = Math.floor(total / 100);
      const cm = total % 100;
      if (total <= 0) return null;
      return makeQuestion(
        lesson, difficulty, index,
        plus
          ? `${a}m ${acm}cm인 끈과 ${b}m ${bcm}cm인 끈을 이었습니다. 이은 끈의 길이는?`
          : `${a}m ${acm}cm인 끈에서 ${b}m ${bcm}cm를 잘랐습니다. 남은 끈의 길이는?`,
        `${m}m ${cm}cm`,
        [`${m + 1}m ${cm}cm`, `${m}m ${cm + 10}cm`, `${m}m ${Math.max(0, cm - 10)}cm`],
        `m는 m끼리, cm는 cm끼리 ${plus ? '더하면' : '빼면'} ${m}m ${cm}cm입니다.`,
        'measurement',
        shapeStrategy(difficulty, '조건 함께 보기 · 단위끼리 맞추어 계산하기', '단위끼리 맞추어 계산하기'),
      );
    } },

  // 두 물건의 길이 견주기
  {
    fits: (lesson) => /길이의 차/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 23 + lesson.lessonNo;
      const a = 6 + (seed % 10);
      const b = a + 2 + (seed % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `크레파스는 ${a}cm, 색연필은 ${b}cm입니다. 색연필은 크레파스보다 몇 cm 더 길까요?`,
        `${b - a}cm`, [`${a + b}cm`, `${b}cm`, `${b - a + 1}cm`],
        `더 긴 것에서 짧은 것을 빼면 ${b}-${a}=${b - a}cm입니다.`,
        'measurement',
        shapeStrategy(difficulty, '조건 함께 보기 · 두 길이의 차 구하기', '두 길이의 차 구하기'),
      );
    } },
];

// ── 분류하기 ───────────────────────────────────────────────────────
const sortShapes: Shape[] = [
  {
    fits: (lesson) => /분류는 어떻게|기준에 따라/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const good = ['색깔', '모양', '크기'][seed % 3];
      return makeQuestion(
        lesson, difficulty, index,
        `단추를 분류하려고 합니다. 분류 기준으로 알맞은 것은?`,
        good, ['예쁜 것', '내가 좋아하는 것', '멋있는 것'],
        `누가 분류해도 같은 결과가 나오는 것이 분류 기준입니다. ${good}은(는) 분명합니다.`,
        'classification',
        shapeStrategy(difficulty, '자료 해석 · 분명한 분류 기준 고르기', '분류 기준 고르기'),
      );
    } },
  {
    fits: (lesson) => /분류하고 세어|분류한 결과/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const red = 3 + (seed % 6);
      const blue = 2 + ((seed + 2) % 6);
      const yellow = 1 + ((seed + 4) % 5);
      const total = red + blue + yellow;
      return makeQuestion(
        lesson, difficulty, index,
        `빨강 ${red}개, 파랑 ${blue}개, 노랑 ${yellow}개로 분류했습니다. 분류한 것을 모두 세면 몇 개일까요?`,
        `${total}개`, [`${red + blue}개`, `${total - 1}개`, `${Math.max(red, blue, yellow)}개`],
        `분류한 수를 모두 더하면 처음 수와 같아야 합니다. ${red}+${blue}+${yellow}=${total}개입니다.`,
        'classification',
        shapeStrategy(difficulty, '자료 해석 · 분류한 수를 모두 세어 확인하기', '분류한 수 모두 세기'),
        tableVisualFor(
          [{ name: '빨강', value: red }, { name: '파랑', value: blue }, { name: '노랑', value: yellow }],
          '분류한 결과', { categoryLabel: '색깔', valueLabel: '개수' },
        ),
      );
    } },
];

// ── 시각과 시간 ────────────────────────────────────────────────────
const timeShapes: Shape[] = [
  // 몇 시 몇 분 전
  {
    fits: (lesson) => /여러 가지 방법으로 시각/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const hour = 1 + (seed % 11);
      const before = [5, 10, 15][seed % 3];
      return makeQuestion(
        lesson, difficulty, index,
        `${hour + 1}시 ${before}분 전은 몇 시 몇 분일까요?`,
        `${hour}시 ${60 - before}분`,
        [`${hour + 1}시 ${before}분`, `${hour}시 ${before}분`, `${hour + 1}시 ${60 - before}분`],
        `${hour + 1}시가 되기 ${before}분 전이므로 ${hour}시 ${60 - before}분입니다.`,
        'time',
        shapeStrategy(difficulty, '자료 해석 · 같은 시각을 다르게 읽기', '같은 시각 다르게 읽기'),
        clockVisualFor(hour, 60 - before, '같은 시각 읽기'),
      );
    } },

  // 걸린 시간 문장 상황
  {
    fits: (lesson) => /걸린 시간/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const start = 1 + (seed % 9);
      const mins = [20, 30, 40, 50][seed % 4];
      const endMin = mins;
      return makeQuestion(
        lesson, difficulty, index,
        `${start}시에 시작해서 ${start}시 ${endMin}분에 끝났습니다. 걸린 시간은 몇 분일까요?`,
        `${mins}분`, [`${60 - mins}분`, `${mins + 10}분`, `1시간`],
        `${start}시에서 ${start}시 ${endMin}분까지이므로 ${mins}분 걸렸습니다.`,
        'time',
        shapeStrategy(difficulty, '조건 함께 보기 · 시작과 끝으로 걸린 시간 구하기', '걸린 시간 구하기'),
        clockVisualFor(start, 0, '시작과 끝', start, endMin),
      );
    } },

  // 하루의 시간 — 오전·오후
  {
    fits: (lesson) => /하루의 시간/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 13 + lesson.lessonNo;
      const hour = 1 + (seed % 9);
      return makeQuestion(
        lesson, difficulty, index,
        `오전 ${hour}시에서 오후 ${hour}시까지는 몇 시간일까요?`,
        '12시간', ['24시간', `${hour}시간`, '6시간'],
        `오전과 오후는 각각 12시간이므로 오전 ${hour}시에서 오후 ${hour}시까지는 12시간입니다.`,
        'time',
        shapeStrategy(difficulty, '자료 해석 · 오전과 오후로 하루 나누어 보기', '오전과 오후 알아보기'),
      );
    } },

  // 달력 — 같은 요일
  {
    fits: (lesson) => /달력/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 17 + lesson.lessonNo;
      const day = 3 + (seed % 10);
      return makeQuestion(
        lesson, difficulty, index,
        `이번 달 ${day}일이 수요일입니다. 다음 수요일은 며칠일까요?`,
        `${day + 7}일`, [`${day + 1}일`, `${day + 5}일`, `${day + 14}일`],
        `같은 요일은 7일마다 돌아옵니다. ${day}+7=${day + 7}일입니다.`,
        'time',
        shapeStrategy(difficulty, '자료 해석 · 요일이 7일마다 돌아옴을 이용하기', '7일마다 돌아오는 요일'),
        calendarVisualFor([{ day, tone: 'start' }], '달력에서 찾기'),
      );
    } },

  // 시각 읽기 — 긴바늘이 가리키는 수와 분
  {
    fits: (lesson) => /몇 시 몇 분|여러 가지 방법으로 시각/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 23 + lesson.lessonNo;
      const point = 1 + (seed % 11);
      return makeQuestion(
        lesson, difficulty, index,
        `시계에서 긴바늘이 ${point}을 가리키면 몇 분일까요?`,
        `${point * 5}분`, [`${point}분`, `${point * 5 + 5}분`, `${point * 10}분`],
        `긴바늘이 한 칸 갈 때마다 5분입니다. ${point}×5=${point * 5}분입니다.`,
        'time',
        shapeStrategy(difficulty, '자료 해석 · 긴바늘이 가리키는 수를 분으로 바꾸기', '긴바늘을 분으로 바꾸기'),
        clockVisualFor(3, point * 5, '긴바늘 살펴보기'),
      );
    } },

  // 달력 — 한 주는 7일
  {
    fits: (lesson) => /달력|하루의 시간/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 29 + lesson.lessonNo;
      const weeks = 2 + (seed % 3);
      return makeQuestion(
        lesson, difficulty, index,
        `${weeks}주일은 며칠일까요?`,
        `${weeks * 7}일`, [`${weeks}일`, `${weeks * 7 + 7}일`, `${weeks * 5}일`],
        `1주일은 7일이므로 ${weeks}주일은 ${weeks}×7=${weeks * 7}일입니다.`,
        'time',
        shapeStrategy(difficulty, '자료 해석 · 주일을 날수로 바꾸기', '주일을 날수로 바꾸기'),
      );
    } },
];

// ── 표와 그래프 ────────────────────────────────────────────────────
const dataShapes: Shape[] = [
  // 표에서 빠진 칸 구하기
  {
    fits: (lesson) => /표로 나타내/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const a = 3 + (seed % 5);
      const b = 2 + ((seed + 2) % 5);
      const total = 12 + (seed % 6);
      const c = total - a - b;
      if (c < 1) return null;
      return makeQuestion(
        lesson, difficulty, index,
        `표에서 사과 ${a}명, 배 ${b}명이고 모두 ${total}명입니다. 포도를 좋아하는 학생은 몇 명일까요?`,
        `${c}명`, [`${total}명`, `${a + b}명`, `${c + 1}명`],
        `모두에서 아는 수를 차례로 빼면 ${total}-${a}-${b}=${c}명입니다.`,
        'data',
        shapeStrategy(difficulty, '자료 해석 · 합계를 이용해 빠진 수 구하기', '합계로 빠진 수 구하기'),
        tableVisualFor(
          [{ name: '사과', value: a }, { name: '배', value: b }, { name: '포도', value: null }],
          '좋아하는 과일', { categoryLabel: '과일', valueLabel: '학생 수', total },
        ),
      );
    } },

  // 표와 그래프 각각의 좋은 점
  {
    fits: (lesson) => /무엇을 알 수 있을까요|표와 그래프로 나타내/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const askGraph = seed % 2 === 0;
      return makeQuestion(
        lesson, difficulty, index,
        askGraph ? '그래프가 표보다 좋은 점은 무엇일까요?' : '표가 그래프보다 좋은 점은 무엇일까요?',
        askGraph ? '많고 적음을 한눈에 알 수 있습니다' : '정확한 수를 바로 알 수 있습니다',
        askGraph
          ? ['정확한 수를 바로 알 수 있습니다', '조사한 사람을 알 수 있습니다', '색깔이 예쁩니다']
          : ['많고 적음을 한눈에 알 수 있습니다', '그림을 그릴 수 있습니다', '자리를 적게 차지합니다'],
        askGraph
          ? '그래프는 길이로 나타내어 많고 적음이 한눈에 보입니다.'
          : '표는 수를 그대로 적으므로 정확한 수를 바로 읽을 수 있습니다.',
        'data',
        shapeStrategy(difficulty, '자료 해석 · 표와 그래프의 쓰임 견주기', '표와 그래프 견주기'),
      );
    } },
];

// ── 규칙 찾기 ──────────────────────────────────────────────────────
const ruleShapes: Shape[] = [
  // 규칙을 말로 설명한 것 고르기
  {
    fits: (lesson) => /무늬에서 규칙/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const size = 2 + (seed % 2);
      return makeQuestion(
        lesson, difficulty, index,
        `무늬가 되풀이될 때 가장 먼저 할 일은 무엇일까요?`,
        '되풀이되는 한 묶음을 찾는다',
        ['맨 끝을 먼저 본다', '개수를 모두 센다', '색깔을 센다'],
        `되풀이되는 한 묶음(${size}개짜리 같은)을 찾으면 다음에 올 것을 알 수 있습니다.`,
        'pattern',
        shapeStrategy(difficulty, '자료 해석 · 되풀이되는 묶음 찾기', '되풀이되는 묶음 찾기'),
      );
    } },

  // 덧셈표·곱셈표에서 줄의 규칙
  {
    fits: (lesson) => /덧셈표에서 규칙|곱셈표에서 규칙/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const plus = lesson.title.includes('덧셈표');
      const dan = 2 + (seed % 6);
      return makeQuestion(
        lesson, difficulty, index,
        plus
          ? `덧셈표에서 오른쪽으로 한 칸 갈 때마다 수는 어떻게 될까요?`
          : `곱셈표에서 ${dan}단은 오른쪽으로 갈수록 몇씩 커질까요?`,
        plus ? '1씩 커진다' : `${dan}씩`,
        plus
          ? ['1씩 작아진다', '2씩 커진다', '그대로이다']
          : ['1씩', `${dan + 1}씩`, '그대로'],
        plus
          ? '오른쪽으로 갈수록 더하는 수가 1씩 커지므로 합도 1씩 커집니다.'
          : `${dan}씩 한 묶음이 늘어나므로 ${dan}씩 커집니다.`,
        'pattern',
        shapeStrategy(difficulty, '자료 해석 · 표에서 줄의 규칙 말하기', '표에서 규칙 말하기'),
      );
    } },

  // 생활 속 규칙
  {
    fits: (lesson) => /생활에서 규칙/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 13 + lesson.lessonNo;
      const cases = [
        ['신호등이 초록, 노랑, 빨강 순서로 바뀝니다', '색이 정해진 순서로 되풀이됩니다'],
        ['버스가 10분마다 옵니다', '같은 시간마다 되풀이됩니다'],
        ['달력에서 같은 요일이 7일마다 옵니다', '7일마다 되풀이됩니다'],
      ];
      const [scene, rule] = cases[seed % cases.length];
      return makeQuestion(
        lesson, difficulty, index,
        `${scene} 여기에서 찾을 수 있는 규칙은 무엇일까요?`,
        rule,
        ['규칙이 없습니다', '수가 점점 커집니다', '모양이 커집니다'].filter((x) => x !== rule).slice(0, 3),
        `되풀이되는 것이 무엇인지 찾으면 규칙을 말할 수 있습니다.`,
        'pattern',
        shapeStrategy(difficulty, '조건 함께 보기 · 생활 속 되풀이 찾기', '생활 속 되풀이 찾기'),
      );
    } },


  // 표에서 세로줄의 규칙
  {
    fits: (lesson) => /덧셈표에서 규칙|곱셈표에서 규칙/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 23 + lesson.lessonNo;
      const plus = lesson.title.includes('덧셈표');
      const dan = 2 + (seed % 5);
      return makeQuestion(
        lesson, difficulty, index,
        plus
          ? '덧셈표에서 아래로 한 칸 갈 때마다 수는 어떻게 될까요?'
          : `곱셈표에서 세로줄과 가로줄을 바꾸어 보면 곱은 어떻게 될까요?`,
        plus ? '1씩 커진다' : '곱이 같다',
        plus
          ? ['1씩 작아진다', '2씩 커진다', '그대로이다']
          : ['곱이 커진다', '곱이 작아진다', '알 수 없다'],
        plus
          ? '아래로 갈수록 더해지는 수가 1씩 커집니다.'
          : `${dan}×3과 3×${dan}처럼 두 수를 바꾸어도 곱은 같습니다.`,
        'pattern',
        shapeStrategy(difficulty, '자료 해석 · 표를 다른 방향에서 살펴보기', '표를 다른 방향에서 보기'),
      );
    } },
];

// 2-1 곱셈 단원은 곱셈구구를 배우기 전입니다. 묶어 세기와 몇의 몇 배로
// 곱셈의 뜻을 세우는 단계라, 구구를 쓰는 문제를 내면 안 됩니다.
const earlyMultiplyShapes: Shape[] = [
  {
    fits: (lesson) => /묶어 세어|여러 가지 방법으로 세어/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 7 + lesson.lessonNo;
      const per = 2 + (seed % 4);
      const groups = 3 + ((seed + 2) % 4);
      return makeQuestion(
        lesson, difficulty, index,
        `구슬 ${per * groups}개를 ${per}개씩 묶으면 몇 묶음이 될까요?`,
        `${groups}묶음`, [`${per}묶음`, `${groups + 1}묶음`, `${per * groups}묶음`],
        `${per}개씩 묶어 세면 ${groups}묶음입니다.`,
        'multiplication',
        shapeStrategy(difficulty, '자료 해석 · 묶음 수를 세어 보기', '묶음 수 세어 보기'),
        arrayVisualFor(groups, per, `${per}개씩 묶기`),
      );
    } },
  {
    fits: (lesson) => /몇의 몇 배/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 11 + lesson.lessonNo;
      const base = 2 + (seed % 5);
      const times = 2 + ((seed + 3) % 4);
      return makeQuestion(
        lesson, difficulty, index,
        `${base}의 ${times}배는 ${base}씩 몇 묶음일까요?`,
        `${times}묶음`, [`${base}묶음`, `${base * times}묶음`, `${times + 1}묶음`],
        `몇 배는 몇 묶음과 같습니다. ${base}의 ${times}배는 ${base}씩 ${times}묶음입니다.`,
        'multiplication',
        shapeStrategy(difficulty, '자료 해석 · 몇 배와 몇 묶음 잇기', '몇 배와 몇 묶음 잇기'),
        arrayVisualFor(times, base, `${base}씩 ${times}묶음`),
      );
    } },
  {
    fits: (lesson) => /곱셈을 알아|곱셈식으로 나타내/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 13 + lesson.lessonNo;
      const per = 2 + (seed % 5);
      const groups = 2 + ((seed + 4) % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `${per}씩 ${groups}묶음을 곱셈식으로 나타내면?`,
        `${per}×${groups}`, [`${per}+${groups}`, `${groups}×${groups}`, `${per}×${per}`],
        `몇씩 몇 묶음은 (몇)×(묶음 수)로 씁니다. ${per}×${groups}입니다.`,
        'multiplication',
        shapeStrategy(difficulty, '자료 해석 · 묶음을 곱셈식으로 쓰기', '묶음을 곱셈식으로 쓰기'),
      );
    } },
  {
    fits: (lesson) => /곱셈을 알아|곱셈식으로 나타내/.test(lesson.title),
    make: (lesson, difficulty, index) => {
      const seed = index * 17 + lesson.lessonNo;
      const per = 2 + (seed % 5);
      const groups = 2 + ((seed + 2) % 5);
      return makeQuestion(
        lesson, difficulty, index,
        `${per}×${groups}를 덧셈식으로 나타내면?`,
        Array.from({ length: groups }, () => per).join('+'),
        [`${per}+${groups}`, Array.from({ length: per }, () => groups).join('+') + '+1', `${per}+${per}`],
        `${per}을 ${groups}번 더한 것과 같습니다.`,
        'multiplication',
        shapeStrategy(difficulty, '자료 해석 · 곱셈을 덧셈으로 풀어 보기', '곱셈을 덧셈으로 풀기'),
      );
    } },
];

// 차시가 다루는 개념에 맞는 모양 묶음을 고릅니다.
const shapesForLesson = (lesson: Lesson): Shape[] => {
  const tag = primaryTag(lesson);
  if (tag === 'multiplication') {
    // 곱셈구구를 배우기 전 단원(2-1 곱셈)과 배운 뒤(2-2 곱셈구구)를 나눕니다.
    return lesson.unitTitle === '곱셈' ? earlyMultiplyShapes : multiplyShapes;
  }
  if (tag === 'placeValue' || tag === 'number') return numberShapes;
  if (tag === 'addition' || tag === 'subtraction') return calcShapes;
  if (tag === 'shape' || tag === 'solid') return figureShapes;
  if (tag === 'measurement') return lengthShapes;
  if (tag === 'classification') return sortShapes;
  if (tag === 'time') return timeShapes;
  if (tag === 'data') return dataShapes;
  if (tag === 'pattern') return ruleShapes;
  return [];
};

// 슬롯 번호에 따라 모양을 돌려 씁니다. 한 차시 안에서 같은 모양이
// 연달아 나오지 않도록 하는 것이 목적입니다.
const variedQuestion = (lesson: Lesson, difficulty: Difficulty, index: number): Question | null => {
  // 이 차시에 어울리는 모양만 남깁니다.
  const shapes = shapesForLesson(lesson).filter((shape) => shape.fits(lesson));
  if (shapes.length === 0) return null;
  // 자리를 고른 기준과 같은 값으로 돌려야 모양이 실제로 바뀝니다.
  const maker = shapes[Math.floor(index / 3) % shapes.length];
  try {
    return maker.make(lesson, difficulty, index);
  } catch {
    return null;
  }
};

export const generateQuestions = (lesson: Lesson, difficulty: Difficulty): Question[] =>
  makePromptsUnique(
    generateRawQuestions(lesson, difficulty)
      .map((question, index) =>
        isStepSlot(difficulty, index)
          ? stepBlankQuestion(lesson, difficulty, index) ?? question
          // 응용 문항을 먼저 쓰고, 남은 자리의 절반만 새 모양에 내줍니다.
          // 전부 새 모양으로 채우면 이번에는 그 모양 하나가 차시를 덮어
          // 결국 또 같은 문제만 되풀이됩니다. 기존 문항과 섞어야 합니다.
          // 자리의 '순번'(index/3)이 홀수인 곳은 새 모양이 먼저 가져갑니다.
          // 응용 문항을 앞에 두면 중·상에서는 그것이 모든 자리를 채워
          // 새 모양이 한 번도 쓰이지 않습니다. index를 2나 4로 거르지 않는
          // 것도 같은 까닭입니다 — 상은 자리가 3칸 간격이라 늘 같은
          // 나머지가 나옵니다.
          : (Math.floor(index / 3) % 3 === 1 ? variedQuestion(lesson, difficulty, index) : null)
            ?? challengeQuestion(lesson, difficulty, index)
            ?? richQuestionFor(lesson, difficulty, index)
            ?? question)
      .map((question, index) => withRichVisual(question, index, lesson))
      .map(addAssessmentLayer),
  );

export const generateLessonBank = (lesson: Lesson): Record<Difficulty, Question[]> => ({
  하: generateQuestions(lesson, '하'),
  중: generateQuestions(lesson, '중'),
  상: generateQuestions(lesson, '상'),
});
