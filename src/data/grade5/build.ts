import type { ConceptTag, Difficulty, LearningSupport, Lesson, Question, QuestionVisual } from '../../types';
import { rand } from './util';
import {
  g5CoreConcept,
  g5Misconception,
  g5ReadStrategy,
  g5SelfCheck,
  g5StudentConcept,
} from './support';

// ════════════════════════════════════════════════════════════════════
// 5학년 문항을 만드는 곳
// ────────────────────────────────────────────────────────────────────
// 2학년 문항은 questionFactory.ts의 긴 생성기들이 만듭니다. 그 생성기는
// 차시 제목을 문자열로 맞추어 갈래를 정하기 때문에, 5학년 차시가 들어가면
// 어느 것도 맞지 않아 맨 끝의 기본 문항으로 떨어집니다. 그러면 5학년
// 차시에 2학년 문제가 나옵니다.
//
// 그래서 5학년은 자기 길을 따로 냅니다. 이 파일이 하는 일은 셋뿐입니다.
//   1. 문항 뭉치(G5Family)를 씨앗을 바꿔 가며 불러 서른 자리를 채운다
//   2. 보기를 섞고 정답 자리를 정한다
//   3. 선생님 기록에 남을 해설을 문항이 들고 온 풀이로 짓는다
//
// 답이 맞는지는 여기서 보지 않습니다. 문항 뭉치가 문제에 쓴 수로 답을
// 계산하게 하고(손으로 적은 답은 쓰지 않습니다), 시험이 그 계산을 다시
// 독립적으로 해서 맞춰 봅니다(unit1.test.ts). 답·문제·해설이 틀리면
// 학생이 오개념을 가지므로, 사람이 눈으로 읽어 확인하는 데 기대지
// 않습니다.
// ════════════════════════════════════════════════════════════════════

export type G5Spec = {
  prompt: string;
  answer: string;
  // 적어도 셋. 답과 같거나 서로 같은 것은 만드는 쪽에서 걸러 냅니다.
  // 고른 까닭이 있는 오답이어야 합니다 — 경곗값을 빼먹은 값, 아래 자리를
  // 모두 본 값처럼, 그 문항에서 실제로 아이가 하는 실수여야 합니다.
  wrongs: string[];
  tag: ConceptTag;
  // 무엇을 묻는 문항인지. 공부 안내(studyGuide.ts)가 이 이름으로 묶습니다.
  strategy: string;
  // 이 문항에서 어디를 보아야 하는지. 답을 그대로 말하면 안 됩니다.
  hint: string;
  // 풀이입니다. 마지막 줄이 이 문항의 답을 내는 줄입니다.
  steps: string[];
  visual?: QuestionVisual;
  misconceptionTip?: string;
  selfCheck?: string;
};

export type G5Family = {
  id: string;
  make: (seed: number) => G5Spec | null;
};

const difficultyDesign: Record<Difficulty, { label: string; solutionLead: string }> = {
  하: { label: '기초', solutionLead: '한 가지 핵심만 확인하면 풀 수 있습니다.' },
  중: { label: '적용', solutionLead: '개념을 문제 상황에 맞게 적용해야 합니다.' },
  상: { label: '도전', solutionLead: '조건을 끝까지 읽고 핵심 단서를 차례대로 확인해야 합니다.' },
};

const assessmentLayers: Record<Difficulty, Array<{ label: string }>> = {
  하: [{ label: '기초 확인' }, { label: '그림 확인' }, { label: '익힘 기본' }, { label: '보충 연습' }, { label: '개념 확인' }],
  중: [{ label: '형성' }, { label: '익힘' }, { label: '보충' }, { label: '적용' }, { label: '확인' }],
  상: [{ label: '형성' }, { label: '익힘' }, { label: '보충' }, { label: '심화' }, { label: '서술' }],
};

const difficultyIndex: Record<Difficulty, number> = { 하: 0, 중: 1, 상: 2 };

// 같은 차시를 몇 번 열어도 같은 문제가 나오도록 씨앗에서만 뽑습니다.
const shuffle = <T,>(items: T[], seed: number): T[] => {
  const copy = [...items];
  const next = rand(seed);
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = next(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const lessonNote = (support: LearningSupport) =>
  [
    `이 문제의 풀이: ${support.steps[support.steps.length - 1]}`,
    `볼 곳: ${support.studentHint}`,
    `핵심 개념: ${support.coreConcept}`,
    `읽는 방법: ${support.readStrategy}`,
    `풀이 단계: ${support.steps.join(' → ')}`,
    `조심할 점: ${support.misconceptionTip}`,
    `확인 질문: ${support.selfCheck}`,
    support.textbookConnection,
  ].join('\n');

const tagLabel: Partial<Record<ConceptTag, string>> = {
  range: '수의 범위',
  rounding: '어림하기',
  fraction: '분수의 곱셈',
  decimal: '소수의 곱셈',
  congruence: '합동과 대칭',
  average: '평균',
  possibility: '일이 일어날 가능성',
  number: '수 세기와 크기 비교',
};

// 쓸 수 있는 오답입니다. 답과 같은 것, 서로 같은 것은 버립니다.
const usableWrongs = (spec: G5Spec): string[] => {
  const kept: string[] = [];
  for (const wrong of spec.wrongs) {
    if (wrong === spec.answer) continue;
    if (kept.includes(wrong)) continue;
    kept.push(wrong);
    if (kept.length === 3) break;
  }
  return kept;
};

const toQuestion = (
  lesson: Lesson,
  difficulty: Difficulty,
  slot: number,
  spec: G5Spec,
): Question => {
  const layer = assessmentLayers[difficulty][slot % assessmentLayers[difficulty].length];
  const strategy = `${difficultyDesign[difficulty].label} · ${layer.label} · ${spec.strategy}`;
  const options = shuffle([spec.answer, ...usableWrongs(spec)], slot * 31 + difficultyIndex[difficulty] * 7 + lesson.lessonNo);

  const support: LearningSupport = {
    studentConcept: g5StudentConcept[spec.tag] ?? '문제에서 무엇을 구하라고 했는지 먼저 찾으세요.',
    studentHint: spec.hint,
    coreConcept: g5CoreConcept[spec.tag] ?? lesson.objective,
    readStrategy: `${strategy}: ${g5ReadStrategy[spec.tag] ?? '문제에 주어진 조건을 하나씩 표시합니다.'}`,
    steps: [
      '문제에서 무엇을 구하라고 했는지 먼저 찾습니다.',
      ...spec.steps,
    ],
    misconceptionTip: spec.misconceptionTip ?? g5Misconception[spec.tag] ?? '답을 고른 까닭을 한 줄로 말해 보세요.',
    textbookConnection: `차시 목표 "${lesson.objective}"와 연결됩니다. 교과서 핵심은 ${lesson.textbookFocus} 익힘책 핵심은 ${lesson.workbookFocus}`,
    selfCheck: spec.selfCheck ?? g5SelfCheck[spec.tag] ?? '답을 문제에 다시 넣어 말이 되는지 확인했나요?',
  };

  return {
    id: `${lesson.id}-${difficulty}-${slot + 1}`,
    lessonId: lesson.id,
    difficulty,
    prompt: spec.prompt,
    basePrompt: spec.prompt,
    choices: options,
    answerIndex: options.indexOf(spec.answer),
    answer: spec.answer,
    explanation: lessonNote(support),
    misconception: tagLabel[spec.tag] ?? '개념 확인',
    type: spec.tag,
    strategy,
    support,
    ...(spec.visual ? { visual: spec.visual } : {}),
  };
};

// 수만 다른 같은 문항인지 보려고 수를 지우고 견줍니다.
const shapeOfPrompt = (prompt: string) => prompt.replace(/[\d.]+/g, '#').replace(/\s+/g, ' ').trim();

export const SLOTS_PER_LESSON = 30;

export const buildGrade5Questions = (
  lesson: Lesson,
  difficulty: Difficulty,
  families: G5Family[],
): Question[] => {
  if (!families.length) return [];

  const made: Question[] = [];
  const seenPrompt = new Set<string>();
  const shapeCount = new Map<string, number>();
  // 한 모양이 서른 자리를 다 먹으면 그 차시는 같은 문제만 되풀이됩니다.
  // 뭉치가 여섯이면 한 뭉치가 다섯 자리까지입니다.
  const mostPerShape = Math.max(4, Math.ceil(SLOTS_PER_LESSON / families.length) + 2);

  const salt = difficultyIndex[difficulty] * 1009 + lesson.unitNo * 101 + lesson.lessonNo * 17;

  for (let round = 0; round < 200 && made.length < SLOTS_PER_LESSON; round += 1) {
    for (const family of families) {
      if (made.length >= SLOTS_PER_LESSON) break;
      const spec = family.make(salt + round * 37 + family.id.length);
      if (!spec) continue;
      // 같은 문제인지는 글만으로 보면 안 됩니다. '그림이 나타내는 수의
      // 범위는?'처럼 수가 그림에만 있는 문항은 글이 늘 똑같아서, 글로만
      // 견주면 한 차시에 한 문항밖에 남지 않습니다.
      // 보기가 넷이 되지 않는 문항은 내보내지 않습니다. 셋만 나오면
      // 아이가 답을 몰라도 찍을 확률이 달라지고, 무엇보다 이 문항이
      // 겨누던 오개념 하나가 보기에서 빠졌다는 뜻입니다.
      const wrongs = usableWrongs(spec);
      if (wrongs.length < 3) continue;
      // 실제로 화면에 나가는 보기로 견줍니다. 후보 목록으로 견주면
      // 후보는 달라도 쓰이는 셋이 같은 두 문항이 함께 나갑니다.
      const key = `${spec.prompt}||${spec.answer}||${[...wrongs].sort().join('|')}`;
      if (seenPrompt.has(key)) continue;
      const shape = shapeOfPrompt(spec.prompt);
      if ((shapeCount.get(shape) ?? 0) >= mostPerShape) continue;

      seenPrompt.add(key);
      shapeCount.set(shape, (shapeCount.get(shape) ?? 0) + 1);
      made.push(toQuestion(lesson, difficulty, made.length, spec));
    }
  }

  return made;
};
