import type { Difficulty, SolidShape, SolidsVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun, i as 이가 } from '../grade5/util';
import { 고르개 } from './common';

// ════════════════════════════════════════════════════════════════════
// 1-1 2단원 여러 가지 모양
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입
//   2 여러 가지 모양을 찾아볼까요   — 같은 모양끼리 모으기
//   3 여러 가지 모양을 알아볼까요   — 상자 속 일부 보고 맞히기, 쌓기·굴리기
//   4 여러 가지 모양으로 만들어 볼까요 — 만든 것에 쓴 모양 세기
//   5 모양 찾기 놀이를 해 볼까요    — 특징을 듣고 모양 맞히기
//
// 지도서가 못박은 것:
//   · "모양을 가리키는 수학적 용어를 사용하지 않고" — 직육면체, 원기둥,
//     구라는 말을 쓰지 않습니다. 분류한 모양은 일상용어로 부를 수 있어
//     '상자 모양, 둥근기둥 모양, 공 모양'이라고 씁니다(지도서 예: 상자
//     모양, 둥근 기둥 모양).
//   · 특징은 '평평한 부분, 뾰족한 부분, 둥근 부분'과 '여러 방향으로 잘
//     쌓을 수 있다, 눕히면 잘 굴러간다, 어느 쪽으로도 잘 굴러간다'로
//     말합니다.
//     - 상자 모양: 평평한 부분과 뾰족한 부분. 잘 쌓이고 굴러가지 않는다.
//     - 둥근기둥 모양: 평평한 부분과 둥근 부분. 세우면 쌓이고 눕히면
//       굴러간다.
//     - 공 모양: 모두 둥글다. 어느 쪽으로도 잘 굴러가고 쌓을 수 없다.
//   · 크기·색이 달라도 모양이 같으면 같은 모양입니다.
//
// 물건은 모양이 뚜렷한 것만 씁니다. 귤처럼 공 모양인지 애매한 것,
// 컵처럼 한쪽이 열린 것은 쓰지 않습니다.
// ════════════════════════════════════════════════════════════════════

const 모양이름: Record<SolidShape, string> = { box: '상자 모양', cylinder: '둥근기둥 모양', sphere: '공 모양' };

const 물건: Record<SolidShape, string[]> = {
  box: ['휴지 상자', '과자 상자', '주사위', '벽돌', '선물 상자', '우유갑'],
  cylinder: ['음료수 캔', '딱풀', '북', '통조림', '두루마리 휴지', '분유통'],
  sphere: ['축구공', '구슬', '수박', '야구공', '볼링공', '비치볼'],
};

const 모양들: SolidShape[] = ['box', 'cylinder', 'sphere'];
const 이름표 = ['가', '나', '다', '라', '마', '바'];

const 물건고르기 = (shape: SolidShape, next: (b: number) => number) => 물건[shape][next(물건[shape].length)];

// 특징 하나와 그 특징을 가진 모양입니다. 한 모양만 가진 특징만 씁니다.
// '평평한 부분이 있다'는 상자와 둥근기둥이 함께 가지므로 뺍니다.
const 특징: Array<{ 말: string; 모양: SolidShape }> = [
  { 말: '뾰족한 부분이 있는', 모양: 'box' },
  { 말: '여러 방향으로 잘 쌓을 수 있는', 모양: 'box' },
  { 말: '평평한 부분과 둥근 부분이 함께 있는', 모양: 'cylinder' },
  { 말: '세우면 쌓을 수 있고 눕히면 잘 굴러가는', 모양: 'cylinder' },
  { 말: '평평한 부분이 없는', 모양: 'sphere' },
  { 말: '어느 쪽으로 굴려도 잘 굴러가는', 모양: 'sphere' },
  { 말: '쌓을 수 없는', 모양: 'sphere' },
];

const 특징까닭: Record<SolidShape, string> = {
  box: '상자 모양은 평평한 부분과 뾰족한 부분이 있어 여러 방향으로 잘 쌓을 수 있고 굴러가지 않습니다.',
  cylinder: '둥근기둥 모양은 평평한 부분과 둥근 부분이 있어 세우면 쌓을 수 있고 눕히면 잘 굴러갑니다.',
  sphere: '공 모양은 평평한 부분 없이 모두 둥글어서 어느 쪽으로도 잘 굴러가고 쌓을 수 없습니다.',
};

// ── 같은 모양 찾기(물건 이름으로) ────────────────────────────────────
const 다른하나: G5Family = {
  id: 'odd-one',
  make: (seed) => {
    const next = 고르개(seed);
    const same = 모양들[next(3)];
    const odd = 모양들[(모양들.indexOf(same) + 1 + next(2)) % 3];
    const pool = [...물건[same]];
    const 셋: string[] = [];
    while (셋.length < 3) {
      const v = pool.splice(next(pool.length), 1)[0];
      셋.push(v);
    }
    const 하나 = 물건고르기(odd, next);
    const 보기 = [...셋, 하나];
    return {
      prompt: `${보기.join(', ')} 가운데 모양이 다른 하나는 어느 것일까요?`,
      answer: 하나,
      wrongs: 셋,
      tag: 'solid',
      strategy: '같은 모양끼리 모으기',
      hint: '평평한 부분, 뾰족한 부분, 둥근 부분이 있는지 하나씩 떠올려 보세요.',
      steps: [`${셋.join(', ')}${eun(셋[2]).slice(셋[2].length)} 모두 ${모양이름[same]}입니다.`, `${eun(하나)} ${모양이름[odd]}입니다.`, `그러므로 모양이 다른 하나는 ${하나}입니다.`],
      misconceptionTip: '크기나 색이 아니라 모양을 보고 견주어요.',
    };
  },
};

const 같은모양물건: G5Family = {
  id: 'same-thing',
  make: (seed) => {
    const next = 고르개(seed);
    const shape = 모양들[next(3)];
    const 기준 = 물건고르기(shape, next);
    let 정답 = 물건고르기(shape, next);
    if (정답 === 기준) 정답 = 물건[shape][(물건[shape].indexOf(기준) + 1) % 물건[shape].length];
    const 다른 = 모양들.filter((s) => s !== shape);
    const wrongs = [물건고르기(다른[0], next), 물건고르기(다른[1], next), 물건고르기(다른[next(2)], next)];
    return {
      prompt: `${기준}${와과(기준)} 같은 모양의 물건은 어느 것일까요?`,
      answer: 정답,
      wrongs,
      tag: 'solid',
      strategy: '같은 모양의 물건 찾기',
      hint: `${기준}에 평평한 부분, 뾰족한 부분, 둥근 부분이 있는지 떠올려 보세요.`,
      steps: [`${eun(기준)} ${모양이름[shape]}입니다.`, `${eun(정답)} ${모양이름[shape]}입니다.`, `그러므로 ${기준}${와과(기준)} 같은 모양은 ${정답}입니다.`],
      misconceptionTip: '크기가 달라도 모양이 같으면 같은 모양이에요.',
    };
  },
};

function 와과(word: string) {
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0 ? '과' : '와';
}

// ── 그림에서 같은 모양 세기 ─────────────────────────────────────────
const 모양세기 = (makes: boolean): G5Family => ({
  id: makes ? 'count-built' : 'count-shapes',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const n = lv === '하' ? 4 : lv === '중' ? 5 : 6;
    const items: SolidsVisual['items'] = Array.from({ length: n }, () => ({ shape: 모양들[next(3)] }));
    const target = 모양들[next(3)];
    const count = items.filter((item) => item.shape === target).length;
    if (count === 0) return null;
    return {
      prompt: makes
        ? `놀이 기구를 만드는 데 쓴 모양입니다. ${이가(모양이름[target])} 몇 개일까요?`
        : `그림에서 ${이가(모양이름[target])} 모두 몇 개일까요?`,
      answer: `${count}개`,
      wrongs: [count + 1, count - 1, n - count, n].filter((v) => v > 0 && v !== count).map((v) => `${v}개`),
      tag: 'solid',
      strategy: makes ? '만든 것에 쓴 모양 세기' : '같은 모양 세기',
      hint: `${모양이름[target]}만 하나씩 짚으며 세어 보세요.`,
      steps: [특징까닭[target], `그림에서 ${모양이름[target]}을(를) 세면 ${count}개입니다.`],
      misconceptionTip: '크기가 다른 것도 모양이 같으면 함께 세요.',
      visual: { kind: 'solids', label: makes ? '놀이 기구에 쓴 모양' : '여러 가지 모양', items },
    };
  },
});

// ── 특징으로 모양 고르기(그림 가~라) ────────────────────────────────
const 특징고르기: G5Family = {
  id: 'feature-pick',
  make: (seed) => {
    const next = 고르개(seed);
    const f = 특징[next(특징.length)];
    // 답이 되는 모양은 하나만 넣고, 나머지 셋은 다른 두 모양으로 채웁니다.
    const 다른 = 모양들.filter((s) => s !== f.모양);
    const shapes: SolidShape[] = [f.모양, 다른[0], 다른[1], 다른[next(2)]];
    const order = [0, 1, 2, 3];
    for (let k = order.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [order[k], order[j]] = [order[j], order[k]];
    }
    const items = order.map((k, idx) => ({ shape: shapes[k], name: 이름표[idx] }));
    const ansIdx = items.findIndex((item) => item.shape === f.모양);
    return {
      prompt: `${f.말} 모양은 어느 것일까요?`,
      answer: 이름표[ansIdx],
      wrongs: items.filter((_, k) => k !== ansIdx).map((item) => item.name),
      tag: 'solid',
      strategy: '모양의 특징 알기',
      hint: '평평한 부분, 뾰족한 부분, 둥근 부분이 있는지, 쌓이는지, 굴러가는지 떠올려 보세요.',
      steps: [특징까닭[f.모양], `그러므로 ${f.말} 모양은 ${이름표[ansIdx]}입니다.`],
      misconceptionTip: f.모양 === 'sphere' ? '둥근기둥 모양도 눕히면 굴러가지만, 평평한 부분이 있어요.' : f.모양 === 'cylinder' ? '둥근기둥 모양은 세우면 쌓을 수 있지만 눕히면 굴러가요.' : '상자 모양은 굴러가지 않아요.',
      visual: { kind: 'solids', label: '가, 나, 다, 라 모양', items },
    };
  },
};

// ── 상자 속 일부 보고 맞히기 ────────────────────────────────────────
const 일부보기: G5Family = {
  id: 'peek',
  make: (seed) => {
    const next = 고르개(seed);
    const shape = 모양들[next(3)];
    const 말: Record<SolidShape, string> = {
      box: '보이는 부분이 평평하고 뾰족한 곳이 있습니다',
      cylinder: '보이는 윗부분이 동그랗고 평평합니다',
      sphere: '보이는 부분이 모두 둥급니다',
    };
    return {
      prompt: `상자 속에 물건을 넣고 윗부분만 보이게 했습니다. ${말[shape]}. 어떤 모양일까요?`,
      answer: 모양이름[shape],
      wrongs: [...모양들.filter((s) => s !== shape).map((s) => 모양이름[s]), '알 수 없습니다'],
      tag: 'solid',
      strategy: '일부를 보고 모양 맞히기',
      hint: '뾰족한 곳, 평평한 곳, 둥근 곳 가운데 무엇이 보이는지 생각해 보세요.',
      steps: [특징까닭[shape], `그러므로 ${모양이름[shape]}입니다.`],
      visual: { kind: 'solids', label: '상자 속 물건', items: [{ shape, peek: true }] },
    };
  },
};

// ── 수수께끼: 특징으로 물건 고르기 ──────────────────────────────────
const 수수께끼: G5Family = {
  id: 'riddle',
  make: (seed) => {
    const next = 고르개(seed);
    const f = 특징[next(특징.length)];
    const 답 = 물건고르기(f.모양, next);
    const 다른 = 모양들.filter((s) => s !== f.모양);
    const wrongs = [물건고르기(다른[0], next), 물건고르기(다른[1], next), 물건고르기(다른[next(2)], next)];
    return {
      prompt: `나는 ${f.말} 모양이에요. 나는 어느 물건일까요?`,
      answer: 답,
      wrongs,
      tag: 'solid',
      strategy: '특징을 듣고 물건 맞히기',
      hint: '보기의 물건이 각각 어떤 모양인지 먼저 떠올려 보세요.',
      steps: [특징까닭[f.모양], `${eun(답)} ${모양이름[f.모양]}이므로 답은 ${답}입니다.`],
    };
  },
};

// 두 가지 특징을 함께 말합니다. 하나만 들으면 고를 수 없는 것을 끝까지
// 듣게 하려는 상 문항입니다.
const 두특징: G5Family = {
  id: 'riddle-two',
  make: (seed) => {
    const next = 고르개(seed);
    const 짝: Array<{ 말: string; 모양: SolidShape }> = [
      { 말: '평평한 부분이 있고, 눕히면 잘 굴러가요', 모양: 'cylinder' },
      { 말: '평평한 부분이 있고, 어느 쪽으로 놓아도 굴러가지 않아요', 모양: 'box' },
      { 말: '둥근 부분이 있고, 쌓을 수 없어요', 모양: 'sphere' },
      { 말: '둥근 부분이 있고, 세우면 쌓을 수 있어요', 모양: 'cylinder' },
    ];
    const f = 짝[next(짝.length)];
    const 답 = 물건고르기(f.모양, next);
    const 다른 = 모양들.filter((s) => s !== f.모양);
    const wrongs = [물건고르기(다른[0], next), 물건고르기(다른[1], next), 물건고르기(다른[next(2)], next)];
    return {
      prompt: `${f.말}. 어느 물건일까요?`,
      answer: 답,
      wrongs,
      tag: 'solid',
      strategy: '두 가지 특징으로 모양 맞히기',
      hint: '앞의 말과 뒤의 말을 모두 만족하는 모양을 찾아보세요.',
      steps: [특징까닭[f.모양], `두 가지를 모두 만족하는 것은 ${모양이름[f.모양]}인 ${답}입니다.`],
      misconceptionTip: '앞의 말만 듣고 고르면 안 돼요. 끝까지 들어요.',
    };
  },
};

const 가장많은모양: G5Family = {
  id: 'most-used',
  make: (seed) => {
    const next = 고르개(seed);
    // 모양마다 1개, 2개, 3개를 씁니다. 어느 모양이 3개일지는 씨앗으로 정합니다.
    const 차례 = [...모양들];
    for (let k = 차례.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [차례[k], 차례[j]] = [차례[j], 차례[k]];
    }
    const order = 차례.map((s) => ({ s }));
    const counts = [1, 2, 3];
    const items: SolidsVisual['items'] = [];
    order.forEach(({ s }, idx) => {
      for (let c = 0; c < counts[idx]; c += 1) items.push({ shape: s });
    });
    // 섞어서 늘어놓습니다.
    for (let k = items.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [items[k], items[j]] = [items[j], items[k]];
    }
    const most = order[2].s;
    return {
      prompt: '놀이 기구를 만드는 데 가장 많이 쓴 모양은 어느 것일까요?',
      answer: 모양이름[most],
      wrongs: [...모양들.filter((s) => s !== most).map((s) => 모양이름[s]), '모두 같습니다'],
      tag: 'solid',
      strategy: '쓴 모양의 수 견주기',
      hint: '모양마다 몇 개인지 세어 보세요.',
      steps: [`상자 모양 ${items.filter((x) => x.shape === 'box').length}개, 둥근기둥 모양 ${items.filter((x) => x.shape === 'cylinder').length}개, 공 모양 ${items.filter((x) => x.shape === 'sphere').length}개입니다.`, `가장 많이 쓴 모양은 ${모양이름[most]}입니다.`],
      visual: { kind: 'solids', label: '놀이 기구에 쓴 모양', items },
    };
  },
};

export const unit2Lesson11 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return lv === '상' ? [다른하나, 같은모양물건] : [모양세기(false), 같은모양물건];
    case 2:
      if (lv === '하') return [같은모양물건, 모양세기(false)];
      if (lv === '중') return [다른하나, 모양세기(false), 같은모양물건];
      return [다른하나, 모양세기(false)];
    case 3:
      if (lv === '하') return [특징고르기, 일부보기];
      if (lv === '중') return [특징고르기, 일부보기, 수수께끼];
      return [두특징, 특징고르기];
    case 4:
      if (lv === '하') return [모양세기(true)];
      if (lv === '중') return [모양세기(true), 가장많은모양];
      return [가장많은모양, 모양세기(true)];
    case 5:
      if (lv === '하') return [수수께끼, 특징고르기];
      if (lv === '중') return [수수께끼, 일부보기];
      return [두특징, 수수께끼];
    default:
      return null;
  }
};
