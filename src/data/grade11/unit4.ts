import type { CompareVisual, Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eun } from '../grade5/util';
import { 고르개 } from './common';

// ════════════════════════════════════════════════════════════════════
// 1-1 4단원 비교하기
// ────────────────────────────────────────────────────────────────────
// 지도서 차시 차례:
//   1 단원 도입
//   2 어느 것이 더 길까요            — 길다/짧다, 키는 크다/작다, 높다/낮다
//   3 어느 것이 더 무거울까요        — 무겁다/가볍다, 시소
//   4 어느 것이 더 넓을까요          — 넓다/좁다, 겹쳐 보기
//   5 어느 것에 더 많이 담을 수 있을까요 — 많다/적다, 그릇 크기·물 높이
//
// 지도서가 못박은 것:
//   · "임의 단위나 표준 단위를 사용하지 않음에 유의하여 직관적 또는 직접
//     비교 활동이 이루어지도록" — 수, cm, 칸 세기가 나오지 않습니다.
//   · 셋을 견줄 때는 '가장'을 씁니다.
//   · 길이는 한쪽 끝을 맞추어 견줍니다. 넓이는 겹쳐서 남는 쪽이 넓습니다.
//     시소는 내려간 쪽이 무겁습니다. 같은 그릇이면 물의 높이가 높을수록
//     담긴 양이 많습니다.
//
// 물건 짝은 생활에서 누구나 아는 차이만 씁니다(코끼리와 토끼처럼).
// 아이가 아는 것과 그림이 어긋나면 그림을 믿을지 아는 것을 믿을지
// 헷갈립니다. 그래서 견주는 그림은 가, 나, 다로 이름을 붙입니다.
// ════════════════════════════════════════════════════════════════════

type 속성 = 'length' | 'height' | 'tall' | 'weight' | 'area' | 'capacity';

const 말: Record<속성, { 큰: string; 작은: string; 큰말: string; 작은말: string; 무엇: string }> = {
  length: { 큰: '깁니다', 작은: '짧습니다', 큰말: '긴', 작은말: '짧은', 무엇: '길이' },
  height: { 큰: '높습니다', 작은: '낮습니다', 큰말: '높은', 작은말: '낮은', 무엇: '높이' },
  tall: { 큰: '큽니다', 작은: '작습니다', 큰말: '큰', 작은말: '작은', 무엇: '키' },
  weight: { 큰: '무겁습니다', 작은: '가볍습니다', 큰말: '무거운', 작은말: '가벼운', 무엇: '무게' },
  area: { 큰: '넓습니다', 작은: '좁습니다', 큰말: '넓은', 작은말: '좁은', 무엇: '넓이' },
  capacity: { 큰: '많습니다', 작은: '적습니다', 큰말: '많이 담을 수 있는', 작은말: '적게 담을 수 있는', 무엇: '담을 수 있는 양' },
};

// 누구나 아는 차이입니다. 앞의 것이 더 큽니다.
const 짝: Record<속성, Array<[string, string]>> = {
  length: [['줄넘기', '연필'], ['기차', '자동차'], ['우산', '숟가락'], ['칠판', '지우개'], ['리코더', '크레파스']],
  height: [['아파트', '집'], ['미끄럼틀', '의자'], ['산', '언덕'], ['책장', '책상']],
  tall: [['기린', '강아지'], ['아빠', '아기'], ['코끼리', '토끼'], ['선생님', '동생']],
  weight: [['수박', '사과'], ['코끼리', '토끼'], ['책가방', '공책'], ['볼링공', '탁구공'], ['냉장고', '의자']],
  area: [['운동장', '교실'], ['칠판', '공책'], ['돗자리', '손수건'], ['이불', '수건'], ['신문지', '색종이']],
  capacity: [['욕조', '컵'], ['양동이', '국자'], ['냄비', '숟가락'], ['물통', '종이컵']],
};

const 받침 = (word: string) => {
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};
const 을를 = (w: string) => `${w}${받침(w) ? '을' : '를'}`;

// 문장 앞머리입니다. '기린은 강아지보다 키가 더 ( )' 꼴입니다.
const 앞말 = (s: 속성, a: string, b: string) =>
  s === 'tall' ? `${eun(a)} ${b}보다 키가 더` :
    s === 'capacity' ? `${eun(a)} ${b}보다 담을 수 있는 양이 더` :
      `${eun(a)} ${b}보다 더`;

// ── 낱말 고르기(아는 물건 둘) ───────────────────────────────────────
const 낱말 = (속성들: 속성[]): G5Family => ({
  id: `word-${속성들.join('-')}`,
  make: (seed) => {
    const next = 고르개(seed);
    const s = 속성들[next(속성들.length)];
    const [big, small] = 짝[s][next(짝[s].length)];
    const 거꾸로 = next(2) === 0;
    const [a, b] = 거꾸로 ? [small, big] : [big, small];
    const ans = 거꾸로 ? 말[s].작은 : 말[s].큰;
    const 반대 = 거꾸로 ? 말[s].큰 : 말[s].작은;
    // 다른 속성의 말을 오답으로 둡니다. 다만 그 말이 이 짝에서도 참이면
    // (수박은 사과보다 더 크기도 합니다) 답이 둘이 되므로, 이 문장에
    // 붙여 읽으면 말이 되지 않는 것만 고릅니다.
    const 엉뚱: Record<속성, string[]> = {
      length: ['무겁습니다', '넓습니다'],
      height: ['깁니다', '무겁습니다'],
      tall: ['깁니다', '넓습니다'],
      weight: ['깁니다', '넓습니다'],
      area: ['무겁습니다', '깁니다'],
      capacity: ['깁니다', '높습니다'],
    };
    const 엉뚱작은: Record<속성, string[]> = {
      length: ['가볍습니다', '좁습니다'],
      height: ['짧습니다', '가볍습니다'],
      tall: ['짧습니다', '좁습니다'],
      weight: ['짧습니다', '좁습니다'],
      area: ['가볍습니다', '짧습니다'],
      capacity: ['짧습니다', '낮습니다'],
    };
    return {
      prompt: `${앞말(s, a, b)} (    ). 알맞은 말은 무엇일까요?`,
      answer: ans,
      wrongs: [반대, ...(거꾸로 ? 엉뚱작은[s] : 엉뚱[s])],
      tag: 'measurement',
      strategy: `${을를(말[s].무엇)} 견주는 말 알기`,
      hint: `${을를(말[s].무엇)} 견줄 때 쓰는 말을 떠올려 보세요.`,
      steps: [`${을를(말[s].무엇)} 견줄 때는 ‘${말[s].큰}, ${말[s].작은}’로 말합니다.`, `${앞말(s, a, b)} ${ans}.`],
      misconceptionTip: s === 'tall' ? '키는 ‘길다’가 아니라 ‘크다, 작다’로 말해요.' : s === 'height' ? '높이는 ‘길다’가 아니라 ‘높다, 낮다’로 말해요.' : '무엇을 견주는지에 맞는 말을 써요.',
    };
  },
});

// ── 그림으로 견주기(가, 나, 다) ─────────────────────────────────────
const 이름 = ['가', '나', '다', '라'];

const 그림견주기 = (mode: CompareVisual['mode'], count: 2 | 3 | 4, gap: 'big' | 'small'): G5Family => ({
  id: `pic-${mode}-${count}-${gap}`,
  make: (seed) => {
    const next = 고르개(seed);
    const 크기들: number[] = [];
    while (크기들.length < count) {
      // 넓이와 들이는 그림에서 크기 차이가 길이보다 덜 드러나므로 더
      // 벌려 둡니다. 비슷한 것끼리 견주는 상 문항도 눈으로 가릴 수 있어야
      // 합니다(지도서: 직관적 비교와 직접 비교).
      const 넉넉 = mode === 'area' || mode === 'capacity' || mode === 'water';
      const v = gap === 'big' ? 2 + next(9) * 2 : 넉넉 ? 6 + next(6) * 2 : 10 + next(8);
      if (크기들.every((x) => Math.abs(x - v) >= (gap === 'big' ? 3 : 넉넉 ? 2 : 1))) 크기들.push(v);
    }
    // 시소 그림은 가와 나, 나와 다만 보여 줍니다. 나가 가운데가 아니면
    // 가와 다를 견줄 길이 없어 답을 정할 수 없습니다. 그래서 무게는
    // 차례대로 늘거나 줄게 놓습니다.
    if (mode === 'weight' && count > 2) {
      크기들.sort((p, q) => p - q);
      if (next(2) === 0) 크기들.reverse();
    }
    const items = 크기들.map((size, k) => ({ name: 이름[k], size }));
    const 큰쪽 = next(2) === 0;
    const target = 큰쪽 ? Math.max(...크기들) : Math.min(...크기들);
    const ansIdx = 크기들.indexOf(target);
    const 속 = mode === 'water' ? 'capacity' : (mode as 속성);
    const 형 = 큰쪽 ? 말[속].큰말 : 말[속].작은말;
    const 더가장 = count === 2 ? '더' : '가장';
    const 질문 = mode === 'water'
      ? `물이 ${더가장} ${큰쪽 ? '많이' : '적게'} 담긴 것은 어느 것일까요?`
      : mode === 'capacity'
        ? `${더가장} ${큰쪽 ? '많이' : '적게'} 담을 수 있는 그릇은 어느 것일까요?`
        : count === 2
          ? `더 ${형} 것은 어느 것일까요?`
          : `가장 ${형} 것은 어느 것일까요?`;
    const 방법: Record<CompareVisual['mode'], string> = {
      length: '한쪽 끝을 맞추었을 때 다른 쪽 끝이 더 많이 나온 것이 더 깁니다.',
      weight: '시소는 더 무거운 쪽이 아래로 내려갑니다.',
      area: '겹쳐 보았을 때 남는 부분이 있는 것이 더 넓습니다. 그림에서 더 큰 판이 더 넓습니다.',
      capacity: '그릇이 클수록 더 많이 담을 수 있습니다.',
      water: '같은 그릇에서는 물의 높이가 높을수록 담긴 양이 많습니다.',
    };
    // 2개뿐이면 보기가 모자랍니다. 같다는 보기와 알 수 없다는 보기를 둡니다.
    const wrongs = count === 2
      ? [이름[1 - ansIdx], '두 가지가 같습니다', '알 수 없습니다']
      : [...items.filter((_, k) => k !== ansIdx).map((x) => x.name), ...(count === 3 ? ['모두 같습니다'] : [])];
    const 줄 = [...items].sort((p, q) => (큰쪽 ? q.size - p.size : p.size - q.size)).map((x) => x.name);
    return {
      prompt: 질문,
      answer: 이름[ansIdx],
      wrongs,
      tag: 'measurement',
      strategy: `${말[속].무엇} 직접 견주기`,
      hint: 방법[mode],
      steps: mode === 'weight' && count > 2
        ? [방법[mode], `시소 두 개를 보면 ${줄.join(', ')} 차례로 ${큰쪽 ? '무겁습니다' : '가볍습니다'}.`, `그러므로 가장 ${형} 것은 ${이름[ansIdx]}입니다.`]
        : [방법[mode], `그러므로 ${count === 2 ? '더' : '가장'} ${mode === 'water' || mode === 'capacity' ? (큰쪽 ? '많이' : '적게') + (mode === 'water' ? ' 담긴' : ' 담을 수 있는') : 형} 것은 ${이름[ansIdx]}입니다.`],
      misconceptionTip: mode === 'length' ? '한쪽 끝을 맞추지 않고 견주면 안 돼요.' : mode === 'area' ? '긴 쪽만 보고 넓다고 하면 안 돼요. 겹쳐 보아요.' : mode === 'weight' ? '크기가 크다고 늘 무거운 것은 아니에요.' : mode === 'water' ? '그릇이 같을 때 물의 높이로 견주어요.' : '그릇의 크기를 견주어요.',
      visual: { kind: 'compare', label: `${말[속].무엇} 견주기`, mode, items },
    };
  },
});

// 셋을 시소 두 번으로 견줍니다. 가와 나, 나와 다만 보고 가와 다를
// 견주어야 하는 상 문항입니다.
const 시소셋 = 그림견주기('weight', 3, 'big');

export const unit4Lesson11 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      if (lv === '하') return [낱말(['length', 'weight']), 낱말(['area', 'capacity'])];
      return [낱말(['length', 'weight', 'area', 'capacity', 'tall', 'height'])];
    case 2:
      if (lv === '하') return [그림견주기('length', 2, 'big'), 낱말(['length'])];
      if (lv === '중') return [그림견주기('length', 3, 'big'), 낱말(['tall', 'height'])];
      return [그림견주기('length', 4, 'small'), 낱말(['tall', 'height', 'length'])];
    case 3:
      if (lv === '하') return [그림견주기('weight', 2, 'big'), 낱말(['weight'])];
      if (lv === '중') return [그림견주기('weight', 2, 'big'), 시소셋];
      return [시소셋];
    case 4:
      if (lv === '하') return [그림견주기('area', 2, 'big'), 낱말(['area'])];
      if (lv === '중') return [그림견주기('area', 3, 'big'), 낱말(['area'])];
      return [그림견주기('area', 4, 'small')];
    case 5:
      if (lv === '하') return [그림견주기('capacity', 2, 'big'), 낱말(['capacity'])];
      if (lv === '중') return [그림견주기('capacity', 3, 'big'), 그림견주기('water', 3, 'big')];
      return [그림견주기('water', 4, 'small'), 그림견주기('capacity', 4, 'small')];
    default:
      return null;
  }
};

