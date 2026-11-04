import { resolveParticles } from '../grade5/util';
import type { Difficulty, Lesson, Question } from '../../types';

// 2-2 4단원 7차시: 큰 수나 분 계산 대신 같은 하루 개념에서 사고 단계를 높입니다.
const people = ['시우', '수아', '지호', '하은', '도윤', '서연'];
interface Item { prompt: string; answer: string; wrongs: string[]; steps: string[]; focus: string; }
const hours = (n: number) => `${n}시간`;
const time = (period: string, h: number) => `${period} ${h}시`;
const opposite = (period: string) => period === '오전' ? '오후' : '오전';
const times = (period: string, h: number) => [time(opposite(period), h), time(period, h % 11 + 1), time(opposite(period), h % 11 + 1)];
const numbers = (n: number) => [n + 1, n + 2, n > 1 ? n - 1 : n + 3].map(hours);

function item(level: Difficulty, kind: number, seed: number): Item {
  const who = people[seed % people.length];
  const h = 1 + seed % 11, a = 7 + seed % 4, b = 1 + Math.floor(seed / 3) % 5;
  const c = 6 + seed % 5;
  if (level === '하') {
    switch (kind) {
      case 0: return { prompt: `${who}의 하루 생활표에는 오전 12시간과 오후 12시간이 있습니다. 하루는 모두 몇 시간일까요?`, answer: hours(24), wrongs: ['12시간', '20시간', '60시간'], steps: ['오전은 12시간입니다.', '오후도 12시간이므로 12+12=24시간입니다.'], focus: '하루의 길이 알기' };
      case 1: return { prompt: `${who}은(는) 아침 ${a}시에 일어났습니다. 오전과 오후를 넣어 이 시각을 바르게 나타내면 무엇일까요?`, answer: time('오전', a), wrongs: times('오전', a), steps: ['아침은 같은 날 낮 12시보다 앞입니다.', `따라서 ${time('오전', a)}입니다.`], focus: '아침 시각 구별하기' };
      case 2: return { prompt: `${who}은(는) 저녁 ${c}시에 밥을 먹었습니다. 이때의 시각을 오전과 오후로 나타내세요.`, answer: time('오후', c), wrongs: times('오후', c), steps: ['저녁은 낮 12시를 지난 뒤입니다.', `따라서 ${time('오후', c)}입니다.`], focus: '저녁 시각 구별하기' };
      case 3: { const dawn = 1 + seed % 5; return { prompt: `${who}의 시계는 새벽 ${dawn}시를 가리킵니다. 새벽의 시각은 어떻게 써야 할까요?`, answer: time('오전', dawn), wrongs: times('오전', dawn), steps: ['새벽은 밤 12시가 지난 뒤이고 낮 12시보다 앞입니다.', `따라서 ${time('오전', dawn)}입니다.`], focus: '새벽 시각 구별하기' }; }
      case 4: return { prompt: `${who}은(는) 낮 12시가 지난 뒤 ${b}시에 놀이터에 갔습니다. 이 시각은 언제일까요?`, answer: time('오후', b), wrongs: times('오후', b), steps: ['낮 12시부터 밤 12시까지가 오후입니다.', `따라서 ${time('오후', b)}입니다.`], focus: '낮 시각 구별하기' };
      default: { const period = seed % 2 ? '오전' : '오후'; return { prompt: `${who}의 하루 계획에서 ${period}에 해당하는 시간은 모두 몇 시간일까요?`, answer: hours(12), wrongs: ['24시간', '6시간', '60시간'], steps: ['하루는 오전과 오후로 나눕니다.', '오전과 오후는 각각 12시간입니다.'], focus: '오전과 오후의 길이 알기' }; }
    }
  }
  if (level === '중') {
    switch (kind) {
      case 0: return { prompt: `${who}의 시계는 오전 ${h}시와 오후 ${h}시에 같은 숫자를 가리킵니다. 오전 ${h}시에서 같은 날 오후 ${h}시까지는 몇 시간일까요?`, answer: hours(12), wrongs: ['24시간', '1시간', '6시간'], steps: ['같은 숫자의 시각이라도 오전과 오후는 다릅니다.', '짧은바늘이 한 바퀴 도는 동안 12시간이 지납니다.'], focus: '같은 숫자의 오전과 오후 비교하기' };
      case 1: { const total = 12 - a + b; return { prompt: `${who}은(는) 오전 ${a}시부터 같은 날 오후 ${b}시까지 외출했습니다. 걸린 시간을 구하는 과정입니다. ① 낮 12시까지 ${12 - a}시간 ② 낮 12시부터 ${b}시간 ③ 모두 □시간. □에 알맞은 수는?`, answer: hours(total), wrongs: numbers(total), steps: [`낮 12시까지 ${12 - a}시간, 그 뒤 ${b}시간입니다.`, `${12 - a}+${b}=${total}이므로 ${hours(total)}입니다.`], focus: '낮 12시를 기준으로 시간 구하기' }; }
      case 2: return { prompt: `${who}의 오늘 일정에는 오전 ${a}시와 오후 ${b}시가 적혀 있습니다. 두 시각 중 더 나중인 시각은 무엇일까요?`, answer: time('오후', b), wrongs: [time('오전', a), time('오전', b), time('오후', a)], steps: ['같은 날 오전은 오후보다 먼저입니다.', `따라서 더 나중인 시각은 ${time('오후', b)}입니다.`], focus: '시각의 앞뒤 비교하기' };
      case 3: return { prompt: `${who}은(는) 오늘 오전 ${h}시에 시계를 보았습니다. 그때부터 12시간 뒤의 시각을 고르세요.`, answer: time('오후', h), wrongs: times('오후', h), steps: ['12시간이 지나면 짧은바늘은 한 바퀴 돌아 같은 숫자를 가리킵니다.', `오전에서 오후로 바뀌므로 ${time('오후', h)}입니다.`], focus: '반나절 뒤의 시각 적용하기' };
      case 4: return { prompt: `${who}은(는) 오늘 오전 ${a}시에 책을 읽었습니다. 다음 날 오전 ${a}시에 다시 책을 읽으면 처음부터 몇 시간이 지난 것일까요?`, answer: hours(24), wrongs: ['12시간', '1시간', '2시간'], steps: ['오늘 오전의 같은 시각에서 다음 날 오전의 같은 시각까지는 하루입니다.', '하루는 24시간입니다.'], focus: '다음 날 같은 시각에 하루 적용하기' };
      default: return { prompt: `${who}의 오늘 일정은 등교 오전 ${a}시, 운동 오후 ${b}시, 잠자기 오후 ${c}시입니다. 낮 12시가 지난 뒤의 일정만 고르면 무엇일까요?`, answer: '운동과 잠자기', wrongs: ['등교와 운동', '등교와 잠자기', '등교만'], steps: ['오후로 표시한 일정은 낮 12시가 지난 뒤입니다.', '운동과 잠자기가 오후 일정입니다.'], focus: '생활표에서 오후 일정 찾기' };
    }
  }
  switch (kind) {
    case 0: { const total = 12 - a + b; return { prompt: `${who}은(는) 오전 ${a}시부터 같은 날 오후 ${b}시까지의 시간을 다음과 같이 구했습니다. ① 낮 12시까지 ${12 - a}시간 ② 그 뒤 ${b}시간 ③ 두 시간을 빼기. 잘못된 ③을 고쳐 구한 시간은 몇 시간일까요?`, answer: hours(total), wrongs: numbers(total), steps: ['앞뒤로 이어지는 시간이므로 두 시간을 더해야 합니다.', `${12 - a}+${b}=${total}이므로 ${hours(total)}입니다.`], focus: '잘못된 시간 풀이 고치기' }; }
    case 1: { const total = 12 - a + b; return { prompt: `${who}은(는) 오늘 오전에 외출해 오후 ${b}시에 돌아왔습니다. 외출한 시간은 ${total}시간입니다. ① 낮 12시 이후는 ${b}시간 ② 낮 12시 이전은 ${total}-${b}시간 ③ 출발한 시각은?`, answer: time('오전', a), wrongs: [time('오후', a), time('오전', a - 1), time('오전', a + 1)], steps: [`오전 동안 외출한 시간은 ${total}-${b}=${12 - a}시간입니다.`, `낮 12시보다 ${12 - a}시간 전이므로 ${time('오전', a)}에 출발했습니다.`], focus: '오후와 걸린 시간으로 오전 시각 거꾸로 찾기' }; }
    case 2: { const rest = 24 - a - b; return { prompt: `${who}은(는) 하루 동안 잠을 ${a}시간 자고, 학교에서 ${b}시간을 보냈습니다. 두 시간은 겹치지 않습니다. ① 하루는 24시간 ② 잠과 학교 시간은 ${a}+${b}시간 ③ 남은 시간은 모두 몇 시간일까요?`, answer: hours(rest), wrongs: numbers(rest), steps: [`잠과 학교에서 보낸 시간은 ${a}+${b}=${a + b}시간입니다.`, `24-${a + b}=${rest}이므로 ${hours(rest)}이 남습니다.`], focus: '하루 전체와 두 조건 연결하기' }; }
    case 3: { const sleep = 12 - c + a; return { prompt: `${who}은(는) 오늘 오후 ${c}시에 잠들어 다음 날 오전 ${a}시에 일어났습니다. 밤 12시를 기준으로 나누어 생각할 때 잠잔 시간은 모두 몇 시간일까요?`, answer: hours(sleep), wrongs: numbers(sleep), steps: [`오늘 밤 12시까지 ${12 - c}시간입니다.`, `밤 12시부터 다음 날 오전 ${a}시까지 ${a}시간이므로 모두 ${12 - c}+${a}=${sleep}시간입니다.`], focus: '날짜가 바뀌는 두 구간 연결하기' }; }
    case 4: { const earlier = 1 + seed % 3, later = 1 + Math.floor(seed / 5) % 3;
      const extra = earlier + later;
      return { prompt: `${who}은(는) 오전 ${a}시부터 오후 ${b}시까지 공부했습니다. 친구는 오전 ${a - earlier}시부터 같은 날 오후 ${b + later}시까지 공부했습니다. 두 사람의 시작과 끝 시각을 비교할 때, 친구가 더 공부한 시간은 몇 시간일까요?`, answer: hours(extra), wrongs: numbers(extra), steps: [`친구는 시작을 ${earlier}시간 먼저 하고 끝을 ${later}시간 나중에 했습니다.`, `두 시간을 합하면 ${earlier}+${later}=${extra}이므로 ${hours(extra)} 더 공부했습니다.`], focus: '시작과 끝의 두 조건 비교하기' }; }
    default: return { prompt: `${who}은(는) 오늘 오후 ${h}시부터 12시간 뒤의 시각을 오늘 오전 ${h}시라고 했습니다. 날짜와 오전·오후를 함께 생각하여 바르게 고치면 무엇일까요?`, answer: `다음 날 오전 ${h}시`, wrongs: [`오늘 오전 ${h}시`, `오늘 오후 ${h}시`, `다음 날 오후 ${h}시`], steps: ['오후에서 12시간 뒤에는 밤 12시를 지나 다음 날이 됩니다.', `시곗바늘이 같은 숫자를 가리키고 오전으로 바뀌므로 다음 날 오전 ${h}시입니다.`], focus: '날짜와 오전·오후의 두 조건으로 오류 설명하기' };
  }
}

export function generateDayTimeQuestions(lesson: Lesson, difficulty: Difficulty, round = 0): Question[] {
  const earlierPrompts = new Set<string>();
  for (let previous = 0; previous < round; previous++) {
    for (let i = 0; i < 30; i++) earlierPrompts.add(resolveParticles(item(difficulty, i % 6, previous * 31 + Math.floor(i / 6) * 7 + (i % 6) * 13).prompt));
  }
  return Array.from({ length: 30 }, (_, index): Question => {
    const kind = index % 6;
    const seed = round * 31 + Math.floor(index / 6) * 7 + kind * 13;
    const raw = item(difficulty, kind, seed);
    const spec = { ...raw, prompt: resolveParticles(raw.prompt) };
    const choices = [spec.answer, ...spec.wrongs];
    // 정답 위치가 수준·자리마다 바뀌되 재전송·검산에서는 같은 결과를 만듭니다.
    const offset = (seed + index + ['하','중','상'].indexOf(difficulty)) % 4;
    const ordered = [...choices.slice(offset), ...choices.slice(0, offset)];
    const label = difficulty === '하' ? '기초 확인' : difficulty === '중' ? '자료 해석' : '조건 함께 보기';
    const strategy = `${difficulty === '하' ? '기초' : difficulty === '중' ? '적용' : '도전'} · ${label} · ${spec.focus}`;
    const misconception = '시계의 숫자만 보지 말고 오전·오후와 날짜를 함께 확인합니다.';
    return {
      id: `${lesson.id}-${difficulty}-${round ? `p${round}-` : ''}day-${index + 1}`,
      lessonId: lesson.id, difficulty, thinkingLevel: difficulty === '하' ? 0 : difficulty === '중' ? 1 : 2,
      prompt: spec.prompt, basePrompt: spec.prompt, choices: ordered, answerIndex: ordered.indexOf(spec.answer), answer: spec.answer,
      type: 'time', strategy, explanation: `핵심 개념: 하루는 24시간이며 오전과 오후는 각각 12시간입니다. 학습 목표: ${lesson.objective} 풀이: ${spec.steps.join(' ')}`, misconception,
      support: {
        studentConcept: '하루와 오전·오후', coreConcept: '하루는 오전 12시간과 오후 12시간을 합한 24시간입니다.',
        studentHint: difficulty === '하' ? '낮 12시보다 앞인지 뒤인지, 또는 하루와 반나절 중 무엇을 묻는지 살펴보세요.' : '낮 12시나 밤 12시를 기준으로 나누고, 문제에 적힌 조건을 차례로 확인하세요.',
        readStrategy: strategy, steps: spec.steps, misconceptionTip: misconception,
        textbookConnection: lesson.textbookFocus, selfCheck: '오전·오후와 오늘·다음 날을 바르게 구별했나요?',
      },
    };
  }).filter(q => !earlierPrompts.has(q.prompt));
}
