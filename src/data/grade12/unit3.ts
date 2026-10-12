import type { Difficulty, PlaneShapeKind, PlaneShapeVisualItem } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun } from '../grade5/util';
import { 고르개, 사이 } from '../grade11/common';
import { 시각뒤 } from '../grade1/thinking';

// ════════════════════════════════════════════════════════════════════
// 1-2 3단원 모양과 시각
// ────────────────────────────────────────────────────────────────────
// 단원 전개 계획:
//   1 단원 도입
//   2 모양을 찾아볼까요          — 물건에서 ■, ▲, ● 모양 찾아 모으기
//   3 모양을 알아볼까요          — 본뜨기·찍기, 뾰족한 부분·곧은 선·둥근 선
//   4 여러 가지 모양을 만들어 볼까요 — 만든 모양에서 ■, ▲, ● 세기
//   5 몇 시를 알아볼까요         — 긴바늘 12, 짧은바늘이 가리키는 수
//   6 몇 시 30분을 알아볼까요    — 긴바늘 6, 짧은바늘은 두 수 사이
//
// 유의 사항:
//   · "모양을 지칭하기 위한 용어를 사용하지 않고" — 사각형·삼각형·원이라는
//     말을 쓰지 않고 ■, ▲, ● 모양이라고 부릅니다.
//   · 같은 모양이라도 크기·위치·색깔을 바꾸어 보여 줍니다.
//   · 짧은바늘은 '몇 시', 긴바늘은 '몇 분'을 나타냅니다. 몇 시 30분에는
//     짧은바늘이 두 수 사이에 있습니다.
// ════════════════════════════════════════════════════════════════════

type 모양 = '■' | '▲' | '●';
const 모양들: 모양[] = ['■', '▲', '●'];
const 그림종류: Record<모양, PlaneShapeKind[]> = { '■': ['square', 'rectangle'], '▲': ['triangle'], '●': ['circle'] };
const 이름표 = ['가', '나', '다', '라', '마', '바'];

const 물건: Record<모양, string[]> = {
  '■': ['공책', '액자', '색종이', '창문', '수첩', '달력'],
  '▲': ['삼각자', '삼각김밥', '주의 표지판', '삼각 깃발'],
  '●': ['동전', '접시', '단추', '벽시계', '바퀴', '둥근 거울'],
};

const 그림 = (shape: 모양, next: (b: number) => number, extra: Partial<PlaneShapeVisualItem> = {}): PlaneShapeVisualItem => {
  const kinds = 그림종류[shape];
  return { kind: kinds[next(kinds.length)], ...(shape === '▲' && next(2) === 0 ? { rotate: 180 } : {}), ...extra };
};

const 특징: Array<{ 말: string; 모양: 모양 }> = [
  { 말: '뾰족한 부분이 3군데인', 모양: '▲' },
  { 말: '곧은 선이 3개인', 모양: '▲' },
  { 말: '뾰족한 부분이 4군데인', 모양: '■' },
  { 말: '곧은 선이 4개인', 모양: '■' },
  { 말: '뾰족한 부분이 없는', 모양: '●' },
  { 말: '곧은 선 없이 둥근 선으로만 된', 모양: '●' },
];

const 까닭: Record<모양, string> = {
  '■': '■ 모양은 곧은 선이 4개이고 뾰족한 부분이 4군데입니다.',
  '▲': '▲ 모양은 곧은 선이 3개이고 뾰족한 부분이 3군데입니다.',
  '●': '● 모양은 곧은 선과 뾰족한 부분이 없고 둥근 선으로 되어 있습니다.',
};

// ── 같은 모양 세기 ──────────────────────────────────────────────────
const 모양세기 = (made: boolean): G5Family => ({
  id: made ? 'count-made' : 'count',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const n = lv === '하' ? 4 : lv === '중' ? 5 : 6;
    const shapes = Array.from({ length: n }, () => 모양들[next(3)]);
    const target = 모양들[next(3)];
    const count = shapes.filter((s) => s === target).length;
    if (count === 0) return null;
    return {
      prompt: made ? `여러 가지 모양을 만드는 데 쓴 모양입니다. ${target} 모양은 몇 개일까요?` : `${target} 모양은 모두 몇 개일까요?`,
      answer: `${count}개`,
      wrongs: [count + 1, count - 1, n - count, n].filter((v) => v > 0 && v !== count).map((v) => `${v}개`),
      tag: 'shape',
      strategy: made ? '만든 모양에서 같은 모양 세기' : '같은 모양 찾아 세기',
      hint: `${target} 모양만 하나씩 짚으며 세어 보세요. 크기나 놓인 방향이 달라도 같은 모양이에요.`,
      steps: [까닭[target], `그림에서 ${target} 모양을 세면 ${count}개입니다.`],
      misconceptionTip: '크기가 다르거나 뒤집혀 있어도 같은 모양이에요.',
      visual: { kind: 'plane-shapes', label: '여러 가지 모양', items: shapes.map((s) => 그림(s, next)) },
    };
  },
});

// ── 물건에서 모양 찾기 ──────────────────────────────────────────────
const 물건모양: G5Family = {
  id: 'thing-shape',
  make: (seed) => {
    const next = 고르개(seed);
    const target = 모양들[next(3)];
    const 답 = 물건[target][next(물건[target].length)];
    const 다른 = 모양들.filter((s) => s !== target);
    const wrongs = [물건[다른[0]][next(물건[다른[0]].length)], 물건[다른[1]][next(물건[다른[1]].length)], 물건[다른[next(2)]][next(4)]];
    return {
      prompt: `본뜨면 ${target} 모양이 나오는 물건은 어느 것일까요?`,
      answer: 답,
      wrongs,
      tag: 'shape',
      strategy: '물건에서 모양 찾기',
      hint: '물건을 종이에 대고 본뜨면 어떤 모양이 나올지 떠올려 보세요.',
      steps: [`${eul물건(답)} 본뜨면 ${target} 모양이 나옵니다.`, `그러므로 답은 ${답}입니다.`],
    };
  },
};

function eul물건(word: string) {
  const code = word.charCodeAt(word.length - 1);
  const 받침 = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return /[A-Z]$/.test(word) ? `${word}를` : `${word}${받침 ? '을' : '를'}`;
}

// ── 특징으로 고르기 ────────────────────────────────────────────────
const 특징고르기: G5Family = {
  id: 'feature',
  make: (seed) => {
    const next = 고르개(seed);
    const f = 특징[next(특징.length)];
    const 다른 = 모양들.filter((s) => s !== f.모양);
    const shapes: 모양[] = [f.모양, 다른[0], 다른[1], 다른[next(2)]];
    for (let k = shapes.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [shapes[k], shapes[j]] = [shapes[j], shapes[k]];
    }
    const ansIdx = shapes.indexOf(f.모양);
    return {
      prompt: `${f.말} 모양은 어느 것일까요?`,
      answer: 이름표[ansIdx],
      wrongs: shapes.map((_, k) => 이름표[k]).filter((_, k) => k !== ansIdx),
      tag: 'shape',
      strategy: '모양의 특징 알기',
      hint: '곧은 선과 뾰족한 부분이 몇 개인지 세어 보세요.',
      steps: [까닭[f.모양], `그러므로 ${이름표[ansIdx]}입니다.`],
      visual: { kind: 'plane-shapes', label: '가, 나, 다, 라', items: shapes.map((s, k) => 그림(s, next, { label: 이름표[k] })) },
    };
  },
};

const 뾰족개수: G5Family = {
  id: 'corners',
  make: (seed) => {
    const next = 고르개(seed);
    const target = 모양들[next(2)]; // ■ 또는 ▲
    const n = target === '■' ? 4 : 3;
    const 무엇 = next(2) === 0 ? '뾰족한 부분은 몇 군데' : '곧은 선은 몇 개';
    const 단위 = 무엇.includes('군데') ? '군데' : '개';
    return {
      prompt: `${target} 모양의 ${무엇}일까요?`,
      answer: `${n}${단위}`,
      wrongs: [n === 4 ? 3 : 4, 0, 2, 5].filter((v) => v !== n).slice(0, 3).map((v) => `${v}${단위}`),
      tag: 'shape',
      strategy: '모양의 특징 세기',
      hint: '모양의 테두리를 손가락으로 따라가며 세어 보세요.',
      steps: [까닭[target], `그러므로 ${n}${단위}입니다.`],
      visual: { kind: 'plane-shapes', label: `${target} 모양`, items: [그림(target, next)] },
    };
  },
};

const 수수께끼: G5Family = {
  id: 'riddle',
  make: (seed) => {
    const next = 고르개(seed);
    const f = 특징[next(특징.length)];
    const 답 = 물건[f.모양][next(물건[f.모양].length)];
    const 다른 = 모양들.filter((s) => s !== f.모양);
    const wrongs = [물건[다른[0]][next(4)], 물건[다른[1]][next(4)], 물건[다른[next(2)]][next(4)]];
    return {
      prompt: `본뜨면 ${f.말} 모양이 나오는 물건은 어느 것일까요?`,
      answer: 답,
      wrongs,
      tag: 'shape',
      strategy: '특징을 듣고 물건 찾기',
      hint: '보기의 물건을 본뜨면 각각 어떤 모양이 나올지 떠올려 보세요.',
      steps: [까닭[f.모양], `${eun(답)} 본뜨면 ${f.모양} 모양이 나오므로 답은 ${답}입니다.`],
    };
  },
};

const 가장많이: G5Family = {
  id: 'most',
  make: (seed) => {
    const next = 고르개(seed);
    const 차례 = [...모양들];
    for (let k = 차례.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [차례[k], 차례[j]] = [차례[j], 차례[k]];
    }
    const shapes: 모양[] = [];
    차례.forEach((s, idx) => { for (let c = 0; c <= idx; c += 1) shapes.push(s); });
    for (let k = shapes.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [shapes[k], shapes[j]] = [shapes[j], shapes[k]];
    }
    const most = 차례[2];
    return {
      prompt: '모양을 만드는 데 가장 많이 쓴 모양은 어느 것일까요?',
      answer: `${most} 모양`,
      wrongs: [...모양들.filter((s) => s !== most).map((s) => `${s} 모양`), '모두 같습니다'],
      tag: 'shape',
      strategy: '쓴 모양의 수 견주기',
      hint: '모양마다 몇 개인지 세어 보세요.',
      steps: [`■ 모양 ${shapes.filter((s) => s === '■').length}개, ▲ 모양 ${shapes.filter((s) => s === '▲').length}개, ● 모양 ${shapes.filter((s) => s === '●').length}개입니다.`, `가장 많이 쓴 모양은 ${most} 모양입니다.`],
      visual: { kind: 'plane-shapes', label: '모양을 만드는 데 쓴 모양', items: shapes.map((s) => 그림(s, next)) },
    };
  },
};

// ── 시각 ────────────────────────────────────────────────────────────
const 시계읽기 = (half: boolean): G5Family => ({
  id: `clock-${half ? 'half' : 'hour'}`,
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 12);
    const nextH = h === 12 ? 1 : h + 1;
    const answer = half ? `${h}시 30분` : `${h}시`;
    const wrongs = half
      ? [`${nextH}시 30분`, `${h}시`, `6시 ${h === 6 ? 5 : h}분`]
      : [`${nextH}시`, `${h}시 30분`, h === 12 ? '1시 12분' : `12시 ${h}분`];
    return {
      prompt: '시계가 나타내는 시각은 몇 시일까요?'.replace('몇 시일까요', half ? '몇 시 몇 분일까요' : '몇 시일까요'),
      answer,
      wrongs,
      tag: 'time',
      strategy: half ? '몇 시 30분 읽기' : '몇 시 읽기',
      hint: half ? '긴바늘이 6을 가리키면 30분이에요. 짧은바늘이 지난 수가 몇 시예요.' : '긴바늘이 12를 가리키면 몇 시예요. 짧은바늘이 가리키는 수를 보세요.',
      steps: half
        ? [`긴바늘이 6을 가리키므로 30분입니다.`, `짧은바늘이 ${h}과(와) ${nextH} 사이에 있으므로 ${h}시입니다.`, `그러므로 ${answer}입니다.`]
        : [`긴바늘이 12를 가리킵니다.`, `짧은바늘이 ${h}을(를) 가리키므로 ${answer}입니다.`],
      misconceptionTip: half ? `짧은바늘이 ${nextH} 쪽으로 갔더라도 아직 ${nextH}시가 되지 않았어요.` : '짧은바늘은 몇 시, 긴바늘은 몇 분을 나타내요.',
      visual: { kind: 'clock', label: '시계', hour: h, minute: half ? 30 : 0 },
    };
  },
});

const 바늘말로: G5Family = {
  id: 'hands-words',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 11);
    const half = next(2) === 0;
    const answer = half ? `${h}시 30분` : `${h}시`;
    return {
      prompt: half
        ? `긴바늘이 6을 가리키고, 짧은바늘이 ${h}과(와) ${h + 1} 사이에 있습니다. 몇 시 몇 분일까요?`
        : `긴바늘이 12를 가리키고, 짧은바늘이 ${h}을(를) 가리킵니다. 몇 시일까요?`,
      answer,
      wrongs: half ? [`${h + 1}시 30분`, `${h}시`, `6시 ${h}분`] : [`12시 ${h}분`, `${h}시 30분`, `${h + 1}시`],
      tag: 'time',
      strategy: '바늘의 위치로 시각 말하기',
      hint: '짧은바늘은 몇 시, 긴바늘은 몇 분을 나타내요.',
      steps: half ? ['긴바늘이 6을 가리키면 30분입니다.', `짧은바늘이 ${h}과(와) ${h + 1} 사이에 있으면 ${h}시입니다.`, `그러므로 ${answer}입니다.`] : ['긴바늘이 12를 가리키면 몇 시입니다.', `짧은바늘이 ${h}을(를) 가리키므로 ${answer}입니다.`],
      misconceptionTip: '긴바늘과 짧은바늘을 바꾸어 읽지 않아요.',
    };
  },
};

const 짧은바늘어디: G5Family = {
  id: 'short-hand',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 11);
    const half = next(2) === 0;
    return {
      prompt: `${h}시${half ? ' 30분' : ''}일 때 짧은바늘은 어디를 가리킬까요?`,
      answer: half ? `${h}과(와) ${h + 1} 사이` : `${h}`,
      wrongs: half ? [`${h}`, `${h + 1}`, '6'] : [`${h}과(와) ${h + 1} 사이`, '12', `${h + 1}`],
      tag: 'time',
      strategy: '시각에 맞게 짧은바늘 놓기',
      hint: half ? '긴바늘이 반 바퀴 도는 동안 짧은바늘도 조금 움직여요.' : '몇 시 정각에는 짧은바늘이 그 수를 가리켜요.',
      steps: half ? [`${h}시에서 30분이 지나면 짧은바늘은 ${h}과(와) ${h + 1}의 가운데로 갑니다.`, `그러므로 ${h}과(와) ${h + 1} 사이입니다.`] : [`${h}시에는 짧은바늘이 ${h}을(를) 가리킵니다.`],
      misconceptionTip: '몇 시 30분에 짧은바늘은 숫자를 딱 가리키지 않아요.',
    };
  },
};

const 늦은시각: G5Family = {
  id: 'later',
  make: (seed) => {
    const next = 고르개(seed);
    const h = 사이(next, 1, 10);
    const 시각들 = [`${h}시`, `${h}시 30분`, `${h + 1}시`, `${h + 1}시 30분`];
    const 늦은 = next(2) === 0;
    const pick = 늦은 ? 시각들[3] : 시각들[0];
    return {
      prompt: `${시각들.join(', ')} 가운데 가장 ${늦은 ? '늦은' : '이른'} 시각은 언제일까요?`,
      answer: pick,
      wrongs: 시각들.filter((t) => t !== pick),
      tag: 'time',
      strategy: '시각의 앞뒤 알기',
      hint: `${h}시 다음에 ${h}시 30분, 그다음에 ${h + 1}시가 와요.`,
      steps: [`시각을 차례로 늘어놓으면 ${시각들.join(', ')}입니다.`, `그러므로 가장 ${늦은 ? '늦은' : '이른'} 시각은 ${pick}입니다.`],
    };
  },
};

export const unit3Lesson12 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return lv === '상' ? [물건모양, 모양세기(false)] : [모양세기(false), 시계읽기(false)];
    case 2:
      if (lv === '하') return [모양세기(false), 물건모양];
      return [물건모양, 모양세기(false)];
    case 3:
      if (lv === '하') return [특징고르기, 뾰족개수];
      if (lv === '중') return [특징고르기, 뾰족개수, 수수께끼];
      return [수수께끼, 특징고르기];
    case 4:
      if (lv === '하') return [모양세기(true)];
      return [모양세기(true), 가장많이];
    case 5:
      if (lv === '하') return [시계읽기(false), 바늘말로];
      if (lv === '중') return [시계읽기(false), 바늘말로, 시각뒤('1-2-3', false)];
      return [바늘말로, 짧은바늘어디, 시각뒤('1-2-3', false)];
    case 6:
      if (lv === '하') return [시계읽기(true), 시각뒤('1-2-3', true)];
      if (lv === '중') return [시계읽기(true), 바늘말로, 짧은바늘어디];
      return [짧은바늘어디, 늦은시각, 시계읽기(true)];
    default:
      return null;
  }
};

