import type { ConceptTag, Difficulty, Lesson, Question } from '../types';
import { 놀이차시인가 } from './games';
type 문항엔진 = typeof import('./engine');
type ReviewScope = 'lesson' | 'unit' | 'semester';
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

export const buildScopedQuestions = (
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