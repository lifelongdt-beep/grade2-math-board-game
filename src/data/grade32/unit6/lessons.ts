import type { Difficulty, PictureGraphVisual } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-2 6단원 그림그래프 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입      2 그림그래프는 무엇일까요     3 그림그래프로 나타내기
//   4 그림그래프 해석하기   5 자료를 수집하여 그림그래프로 나타내기(지도서 5~6차시)
//
// 지도서가 못박은 것:
//   · 그림은 두 가지로 합니다. 자료가 몇십이면 10과 1, 몇백이면 100과 10.
//   · 학생의 대표 오류: 그림의 단위를 생각하지 않고 그림의 개수만 세는 것.
//     "그림이 가장 길게 그려져 있는 항목의 수량이 가장 많다는 오개념이
//     생기지 않도록" — 그래서 그림 수가 많은 줄이 실제로는 더 적은 자료를
//     일부러 냅니다.
//   · 자료를 정리할 때 빠뜨리거나 두 번 센 것이 없는지 확인합니다.
// 글은 조사를 '을(를)'처럼 적고, 문항을 만들 때 앞말에 맞춥니다.
// ════════════════════════════════════════════════════════════════════

type 주제 = { 제목: string; 무엇: string; 줄말: (이름: string) => string; 항목말: string; 항목들: string[]; 단위말: string; 큰: number; 작은: number };
const 주제들: 주제[] = [
  { 제목: '마을별 학생 수', 무엇: '학생 수', 줄말: (n) => `${n}의 학생 수`, 항목말: '마을', 항목들: ['가 마을', '나 마을', '다 마을', '라 마을'], 단위말: '명', 큰: 10, 작은: 1 },
  { 제목: '반별 모은 빈 병의 수', 무엇: '모은 빈 병의 수', 줄말: (n) => `${n}이 모은 빈 병의 수`, 항목말: '반', 항목들: ['1반', '2반', '3반', '4반'], 단위말: '개', 큰: 10, 작은: 1 },
  { 제목: '종류별 빌린 책의 수', 무엇: '빌린 책의 수', 줄말: (n) => `빌린 ${n}의 수`, 항목말: '종류', 항목들: ['동화책', '과학책', '위인전', '만화책'], 단위말: '권', 큰: 100, 작은: 10 },
  { 제목: '과수원별 사과 생산량', 무엇: '사과 생산량', 줄말: (n) => `${n} 과수원의 사과 생산량`, 항목말: '과수원', 항목들: ['초록', '하늘', '사랑', '햇빛'], 단위말: '상자', 큰: 100, 작은: 10 },
];

type 자료 = { 주제: 주제; 값들: number[] };
const 자료만들기 = (seed: number, 그림수함정 = false): 자료 => {
  const next = rand(seed);
  const 주제 = 주제들[next(주제들.length)];
  const 값들: number[] = [];
  const 쓴 = new Set<number>();
  while (값들.length < 4) {
    const 큰수 = 1 + next(4);
    const 작은수 = next(10);
    const v = (큰수 * 10 + 작은수) * 주제.작은;
    if (쓴.has(v)) continue;
    쓴.add(v);
    값들.push(v);
  }
  if (그림수함정) {
    // 큰 그림 4개+작은 그림 1개(그림 5개)와 큰 그림 1개+작은 그림 8개(그림 9개)를 넣습니다.
    값들[0] = 41 * 주제.작은;
    값들[1] = 18 * 주제.작은;
  }
  return { 주제, 값들 };
};

const 그래프 = (d: 자료, hideRow?: number): PictureGraphVisual => ({
  kind: 'picture-graph',
  label: d.주제.제목,
  big: d.주제.큰,
  small: d.주제.작은,
  unitWord: d.주제.단위말,
  rowTitle: d.주제.항목말,
  rows: d.주제.항목들.map((label, k) => ({ label, value: d.값들[k] })),
  ...(hideRow !== undefined ? { hideRow } : {}),
});

const 그림수 = (d: 자료, v: number) => ({ 큰: Math.floor(v / d.주제.큰), 작은: (v % d.주제.큰) / d.주제.작은 });
const 읽는말 = (d: 자료, v: number) => {
  const g = 그림수(d, v);
  return `큰 그림 ${g.큰}개는 ${g.큰 * d.주제.큰}${d.주제.단위말}, 작은 그림 ${g.작은}개는 ${g.작은 * d.주제.작은}${d.주제.단위말}이므로 ${v}${d.주제.단위말}입니다.`;
};

// ── 1차시: 단원 도입(표 읽기) ─────────────────────────────────────
const 도입문항: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = rand(seed);
    const 과일 = ['사과', '포도', '딸기', '귤'];
    const 수 = 과일.map(() => 2 + next(9));
    const 합 = 수.reduce((a, b) => a + b, 0);
    if (next(2) === 0) {
      return {
        prompt: `좋아하는 과일을 조사하여 표로 나타냈습니다. ${과일.map((f, k) => `${f} ${수[k]}명`).join(', ')}. 조사한 학생은 모두 몇 명일까요?`,
        answer: `${합}명`,
        wrongs: [합 - 수[0], 합 + 1, 수.length, Math.max(...수) * 4].filter((v, k, all) => v !== 합 && all.indexOf(v) === k).map((v) => `${v}명`),
        tag: 'data',
        concept: '표의 합계는 항목별 수를 모두 더한 것입니다(2학년 표와 그래프).',
        strategy: '표의 수를 모두 더하기',
        hint: '항목마다 수를 빠뜨리지 않고 모두 더하세요.',
        steps: [`${수.join('+')}=${합}입니다.`, `그러므로 모두 ${합}명입니다.`],
        misconceptionTip: '항목의 수(4가지)를 답하면 안 됩니다. 사람 수를 모두 더합니다.',
      };
    }
    const 최대 = Math.max(...수);
    if (수.filter((v) => v === 최대).length > 1) return null;
    return {
      prompt: `좋아하는 과일을 조사했습니다. ${과일.map((f, k) => `${f} ${수[k]}명`).join(', ')}. 가장 많은 학생이 좋아하는 과일은 무엇일까요?`,
      answer: 과일[수.indexOf(최대)],
      wrongs: 과일.filter((_, k) => 수[k] !== 최대),
      tag: 'data',
      concept: '수가 가장 큰 항목이 가장 많은 학생이 좋아하는 것입니다.',
      strategy: '표에서 가장 큰 수 찾기',
      hint: '네 수 가운데 가장 큰 수를 찾으세요.',
      steps: [`가장 큰 수는 ${최대}입니다.`, `그러므로 ${과일[수.indexOf(최대)]}입니다.`],
      misconceptionTip: '표에서 위에 있다고 많은 것이 아닙니다. 수를 비교하세요.',
    };
  },
};

// ── 2차시: 그림그래프 읽기 ─────────────────────────────────────────
const 한줄읽기문항: G5Family = {
  id: 'read-row',
  make: (seed) => {
    const d = 자료만들기(seed + 1);
    const k = rand(seed + 2)(4);
    const v = d.값들[k];
    const g = 그림수(d, v);
    const 이름 = d.주제.항목들[k];
    const U = d.주제.단위말;
    return {
      prompt: `그림그래프를 보고 ${d.주제.줄말(이름)}을(를) 구하면 몇 ${U}일까요?`,
      answer: `${v}${U}`,
      wrongs: [g.큰 + g.작은, g.큰 * d.주제.작은 + g.작은 * d.주제.큰, (g.큰 + g.작은) * d.주제.큰, v + d.주제.큰].filter((w, i, all) => w !== v && w > 0 && all.indexOf(w) === i).map((w) => `${w}${U}`),
      tag: 'data',
      concept: `큰 그림 하나는 ${d.주제.큰}${U}, 작은 그림 하나는 ${d.주제.작은}${U}을(를) 나타냅니다. 그림의 크기와 개수를 함께 보고 수를 읽습니다.`,
      strategy: '그림의 단위를 생각하며 읽기',
      hint: `큰 그림과 작은 그림을 따로 세고, 각각 몇 ${U}을(를) 나타내는지 생각하세요.`,
      steps: [`${이름}에는 큰 그림 ${g.큰}개, 작은 그림 ${g.작은}개가 있습니다.`, 읽는말(d, v)],
      misconceptionTip: '그림의 개수만 세면 안 됩니다. 큰 그림과 작은 그림이 나타내는 수가 다릅니다.',
      visual: 그래프(d),
    };
  },
};

const 범례문항: G5Family = {
  id: 'legend',
  make: (seed) => {
    const d = 자료만들기(seed + 3);
    const 큰묻기 = rand(seed + 4)(2) === 0;
    const U = d.주제.단위말;
    return {
      prompt: `그림그래프에서 ${큰묻기 ? '큰' : '작은'} 그림 1개는 몇 ${U}을(를) 나타낼까요?`,
      answer: `${큰묻기 ? d.주제.큰 : d.주제.작은}${U}`,
      wrongs: [큰묻기 ? d.주제.작은 : d.주제.큰, 큰묻기 ? d.주제.큰 * 10 : d.주제.작은 * 10 === d.주제.큰 ? d.주제.작은 + 1 : d.주제.작은 * 10, 큰묻기 ? d.주제.큰 / 2 : d.주제.작은 * 2, 1000].filter((w, i, all) => w !== (큰묻기 ? d.주제.큰 : d.주제.작은) && all.indexOf(w) === i).map((w) => `${w}${U}`),
      tag: 'data',
      concept: '그림그래프는 그림이 나타내는 수(범례)를 함께 나타냅니다.',
      strategy: '그림이 나타내는 수 확인하기',
      hint: '그래프 아래에 그림이 나타내는 수가 적혀 있습니다.',
      steps: [`큰 그림은 ${d.주제.큰}${U}, 작은 그림은 ${d.주제.작은}${U}을(를) 나타냅니다.`],
      misconceptionTip: '그림 하나가 늘 1을 나타내는 것은 아닙니다.',
      visual: 그래프(d),
    };
  },
};

const 그림수함정문항: G5Family = {
  id: 'icon-trap',
  make: (seed) => {
    const d = 자료만들기(seed + 5, true);
    const 최대 = Math.max(...d.값들);
    const k = d.값들.indexOf(최대);
    if (d.값들.filter((v) => v === 최대).length > 1) return null;
    const 그림많은 = d.값들.map((v) => 그림수(d, v)).map((g) => g.큰 + g.작은);
    const 그림최대 = 그림많은.indexOf(Math.max(...그림많은));
    if (그림최대 === k) return null;
    const U = d.주제.단위말;
    return {
      prompt: `그림그래프에서 ${d.주제.무엇}이(가) 가장 많은 ${d.주제.항목말}은(는) 어디일까요?`.replace('어디일까요', d.주제.항목말 === '종류' ? '무엇일까요' : '어디일까요'),
      answer: d.주제.항목들[k],
      wrongs: d.주제.항목들.filter((_, i) => i !== k),
      tag: 'data',
      concept: '그림그래프에서는 그림의 개수가 아니라 그림이 나타내는 수를 비교합니다. 큰 그림이 많을수록 수가 큽니다.',
      strategy: '큰 그림의 수부터 비교하기',
      hint: '그림이 많이 그려진 줄이 가장 많은 것은 아닙니다. 큰 그림의 수를 먼저 비교하세요.',
      steps: [
        `${d.주제.항목들[그림최대]}은(는) 그림이 ${그림많은[그림최대]}개로 가장 많지만 ${d.값들[그림최대]}${U}입니다.`,
        `${d.주제.항목들[k]}은(는) 큰 그림이 가장 많아 ${최대}${U}입니다.`,
        `그러므로 가장 많은 것은 ${d.주제.항목들[k]}입니다.`,
      ],
      misconceptionTip: '그림이 가장 길게 그려진 줄이 가장 많다고 생각하면 틀립니다.',
      visual: 그래프(d),
    };
  },
};

// ── 3차시: 그림그래프로 나타내기 ────────────────────────────────────
const 그리기문항: G5Family = {
  id: 'draw',
  make: (seed) => {
    const d = 자료만들기(seed + 6);
    const k = rand(seed + 7)(4);
    const v = d.값들[k];
    const g = 그림수(d, v);
    if (g.작은 === 0) return null;
    const U = d.주제.단위말;
    const 글 = (큰: number, 작은: number) => `큰 그림 ${큰}개, 작은 그림 ${작은}개`;
    return {
      prompt: `${d.주제.줄말(d.주제.항목들[k])} ${v}${U}을(를) 큰 그림(${d.주제.큰}${U})과 작은 그림(${d.주제.작은}${U})으로 나타내려고 합니다. 어떻게 그려야 할까요?`,
      answer: 글(g.큰, g.작은),
      wrongs: [글(g.작은, g.큰), 글(0, v / d.주제.작은 > 30 ? g.큰 + g.작은 : v / d.주제.작은), 글(g.큰 + 1, g.작은), 글(g.큰, g.작은 + 1)].filter((w, i, all) => w !== 글(g.큰, g.작은) && all.indexOf(w) === i),
      tag: 'data',
      concept: '그림그래프로 나타낼 때는 큰 단위의 그림을 먼저 그리고, 남은 수만큼 작은 그림을 그립니다.',
      strategy: '큰 단위 그림부터 나타내기',
      hint: `${v}에 ${d.주제.큰}이(가) 몇 번 들어가는지 먼저 생각해 보세요.`,
      steps: [`${v}=${g.큰 * d.주제.큰}+${g.작은 * d.주제.작은}입니다.`, `큰 그림 ${g.큰}개(${g.큰 * d.주제.큰}${U})와 작은 그림 ${g.작은}개(${g.작은 * d.주제.작은}${U})로 나타냅니다.`],
      misconceptionTip: '큰 그림과 작은 그림의 개수를 바꾸어 그리면 전혀 다른 수가 됩니다.',
    };
  },
};

const 단위정하기문항: G5Family = {
  id: 'choose-unit',
  make: (seed) => {
    const next = rand(seed + 8);
    const 백 = next(2) === 0;
    const 값들 = [0, 1, 2, 3].map(() => (백 ? (1 + next(4)) * 100 + (1 + next(9)) * 10 : (1 + next(4)) * 10 + 1 + next(9)));
    const U = 백 ? '권' : '명';
    return {
      prompt: `자료가 ${값들.map((v) => `${v}${U}`).join(', ')}입니다. 그림그래프로 나타낼 때 그림 두 가지가 나타내는 수로 가장 알맞은 것은 어느 것일까요?`,
      answer: 백 ? `100${U}과 10${U}` : `10${U}과 1${U}`,
      wrongs: 백 ? [`10${U}과 1${U}`, `1000${U}과 100${U}`, `50${U}과 5${U}`] : [`100${U}과 10${U}`, `5${U}과 1${U}`, `2${U}과 1${U}`],
      tag: 'data',
      concept: '그림이 나타내는 수는 자료의 크기에 맞게 정합니다. 자료가 몇십이면 10과 1, 몇백이면 100과 10이 알맞습니다.',
      strategy: '자료의 크기에 맞게 그림의 단위 정하기',
      hint: '자료가 몇십인가요, 몇백인가요? 그림을 너무 많이 그리지 않아도 되는 단위를 생각해 보세요.',
      steps: [`자료가 모두 ${백 ? '몇백몇십' : '몇십몇'}입니다.`, `그러므로 ${백 ? `100${U}과 10${U}` : `10${U}과 1${U}`}(으)로 나타내면 알맞습니다.`],
      misconceptionTip: '단위가 너무 작으면 그림을 너무 많이 그려야 하고, 너무 크면 수를 나타낼 수 없습니다.',
    };
  },
};

const 빈줄문항: G5Family = {
  id: 'missing-row',
  make: (seed) => {
    const d = 자료만들기(seed + 9);
    const k = rand(seed + 10)(4);
    const 합 = d.값들.reduce((a, b) => a + b, 0);
    const U = d.주제.단위말;
    return {
      prompt: `${d.주제.제목}의 합계는 ${합}${U}입니다. 그림그래프에서 ?로 가린 ${d.주제.항목들[k]}은(는) 몇 ${U}일까요?`,
      answer: `${d.값들[k]}${U}`,
      wrongs: [합 - d.값들.reduce((a, b, i) => (i === k ? a : a + b), 0) + d.주제.큰, d.값들[k] - d.주제.작은, 합, d.값들[k] + d.주제.작은 * 2].filter((w, i, all) => w !== d.값들[k] && w > 0 && all.indexOf(w) === i).map((w) => `${w}${U}`),
      tag: 'data',
      concept: '합계에서 알고 있는 항목의 수를 모두 빼면 모르는 항목의 수를 구할 수 있습니다.',
      strategy: '합계를 이용하여 빈 줄의 수 구하기',
      hint: '나머지 세 줄의 수를 그림으로 읽어 더한 다음, 합계에서 빼 보세요.',
      steps: [
        `나머지 세 줄은 ${d.값들.filter((_, i) => i !== k).join(', ')}이므로 더하면 ${합 - d.값들[k]}입니다.`,
        `${합}-${합 - d.값들[k]}=${d.값들[k]}이므로 ${d.값들[k]}${U}입니다.`,
      ],
      misconceptionTip: '세 줄을 읽을 때 큰 그림과 작은 그림이 나타내는 수를 구별하세요.',
      visual: 그래프(d, k),
    };
  },
};

// ── 4차시: 해석하기 ─────────────────────────────────────────────────
const 차이문항: G5Family = {
  id: 'diff',
  make: (seed) => {
    const d = 자료만들기(seed + 11);
    const next = rand(seed + 12);
    const i = next(4);
    let j = next(4);
    if (i === j) j = (i + 1) % 4;
    const [a, b] = [d.값들[i], d.값들[j]];
    const U = d.주제.단위말;
    const 많은 = a > b ? i : j;
    const 적은 = a > b ? j : i;
    return {
      prompt: `그림그래프에서 ${d.주제.항목들[많은]}은(는) ${d.주제.항목들[적은]}보다 몇 ${U} 더 많을까요?`,
      answer: `${Math.abs(a - b)}${U}`,
      wrongs: [a + b, Math.abs(a - b) + d.주제.큰, Math.max(a, b), Math.abs(a - b) + d.주제.작은].filter((w, k, all) => w !== Math.abs(a - b) && all.indexOf(w) === k).map((w) => `${w}${U}`),
      tag: 'data',
      concept: '두 항목의 수를 그림으로 읽은 다음, 큰 수에서 작은 수를 빼면 차이를 알 수 있습니다.',
      strategy: '두 줄을 읽어 차이 구하기',
      hint: '두 줄의 수를 각각 읽은 다음 빼 보세요.',
      steps: [`${d.주제.항목들[많은]}은(는) ${Math.max(a, b)}${U}, ${d.주제.항목들[적은]}은(는) ${Math.min(a, b)}${U}입니다.`, `${Math.max(a, b)}-${Math.min(a, b)}=${Math.abs(a - b)}(${U})입니다.`],
      misconceptionTip: '그림의 개수 차이를 답하면 안 됩니다. 수로 바꾸어 뺍니다.',
      visual: 그래프(d),
    };
  },
};

const 합계문항: G5Family = {
  id: 'total',
  make: (seed) => {
    const d = 자료만들기(seed + 13);
    const 합 = d.값들.reduce((a, b) => a + b, 0);
    const 그림합 = d.값들.map((v) => 그림수(d, v)).reduce((s, g) => s + g.큰 + g.작은, 0);
    const U = d.주제.단위말;
    return {
      prompt: `그림그래프에 나타낸 ${d.주제.무엇}은(는) 모두 몇 ${U}일까요?`,
      answer: `${합}${U}`,
      wrongs: [그림합, 합 + d.주제.큰, 합 - d.주제.큰, 합 + d.주제.작은].filter((w, k, all) => w !== 합 && all.indexOf(w) === k).map((w) => `${w}${U}`),
      tag: 'data',
      concept: '그림그래프의 각 줄을 수로 읽은 다음 모두 더하면 전체 수를 알 수 있습니다.',
      strategy: '모든 줄을 읽어 더하기',
      hint: '큰 그림끼리 모두 세고, 작은 그림끼리 모두 세어 더해도 됩니다.',
      steps: [`네 줄은 ${d.값들.join(', ')}입니다.`, `${d.값들.join('+')}=${합}이므로 모두 ${합}${U}입니다.`],
      misconceptionTip: '그림의 개수를 모두 세어 답하면 안 됩니다.',
      visual: 그래프(d),
    };
  },
};

const 가장적은문항: G5Family = {
  id: 'least',
  make: (seed) => {
    const d = 자료만들기(seed + 14);
    const 최소 = Math.min(...d.값들);
    if (d.값들.filter((v) => v === 최소).length > 1) return null;
    const k = d.값들.indexOf(최소);
    return {
      prompt: `그림그래프에서 수가 가장 적은 ${d.주제.항목말}은(는) ${d.주제.항목말 === '종류' ? '무엇일까요' : '어디일까요'}?`,
      answer: d.주제.항목들[k],
      wrongs: d.주제.항목들.filter((_, i) => i !== k),
      tag: 'data',
      concept: '큰 그림이 가장 적은 줄을 먼저 찾고, 큰 그림의 수가 같으면 작은 그림을 비교합니다.',
      strategy: '큰 그림부터 비교하기',
      hint: '큰 그림이 가장 적은 줄을 찾아보세요. 큰 그림 수가 같은 줄이 있으면 작은 그림을 비교합니다.',
      steps: [`네 줄은 ${d.주제.항목들.map((n, i) => `${n} ${d.값들[i]}`).join(', ')}입니다.`, `가장 적은 것은 ${d.주제.항목들[k]}입니다.`],
      misconceptionTip: '그림의 개수가 적다고 수가 적은 것은 아닙니다.',
      visual: 그래프(d),
    };
  },
};

// ── 5차시: 자료 수집과 정리 ─────────────────────────────────────────
const 자료정리문항: G5Family = {
  id: 'tally',
  make: (seed) => {
    const next = rand(seed + 15);
    const 종류 = ['축구', '피구', '줄넘기'];
    const 응답: string[] = [];
    const 수 = 종류.map(() => 2 + next(6));
    종류.forEach((s, k) => { for (let i = 0; i < 수[k]; i += 1) 응답.push(s); });
    for (let i = 응답.length - 1; i > 0; i -= 1) {
      const j = next(i + 1);
      [응답[i], 응답[j]] = [응답[j], 응답[i]];
    }
    const k = next(3);
    return {
      prompt: `학생들이 좋아하는 운동을 하나씩 말했습니다. (${응답.join(', ')}) ${종류[k]}을(를) 좋아하는 학생은 몇 명일까요?`,
      answer: `${수[k]}명`,
      wrongs: [수[k] + 1, 수[k] - 1, 응답.length, 수[(k + 1) % 3]].filter((v, i, all) => v !== 수[k] && v > 0 && all.indexOf(v) === i).map((v) => `${v}명`),
      tag: 'data',
      concept: '자료를 정리할 때는 빠뜨리거나 두 번 세지 않도록 하나씩 표시하며 셉니다.',
      strategy: '자료를 빠짐없이 세어 정리하기',
      hint: `${종류[k]}이(가) 나올 때마다 표시하며 세어 보세요.`,
      steps: [`${종류[k]}을(를) 하나씩 세면 ${수[k]}번 나옵니다.`, `그러므로 ${수[k]}명입니다.`],
      misconceptionTip: '센 것에 표시하지 않으면 빠뜨리거나 두 번 세기 쉽습니다.',
    };
  },
};

const 좋은점문항: G5Family = {
  id: 'why-graph',
  make: () => ({
    prompt: '표와 비교할 때 그림그래프로 나타내면 좋은 점으로 알맞은 것은 어느 것일까요?',
    answer: '자료의 많고 적음을 그림으로 한눈에 비교할 수 있습니다.',
    wrongs: ['그림의 개수만 세면 정확한 수를 바로 알 수 있습니다.', '그림이 길게 그려진 줄이 언제나 가장 많습니다.', '합계를 알 수 없어도 됩니다.'],
    tag: 'data',
    concept: '그림그래프는 자료의 많고 적음을 한눈에 알 수 있고, 무엇에 대한 자료인지 그림으로 알기 쉽습니다. 표는 정확한 수를 알기 쉽습니다.',
    strategy: '표와 그림그래프 비교하기',
    hint: '그림을 보면 무엇이 더 많은지 바로 알 수 있는지 생각해 보세요.',
    steps: ['그림그래프는 그림의 크기와 개수로 자료의 많고 적음을 한눈에 보여 줍니다.'],
    misconceptionTip: '그림의 개수만 세면 그림의 단위를 놓칩니다.',
  }),
};

// ════════════════════════════════════════════════════════════════════
export const unit6Lesson32 = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [도입문항];
  if (lessonNo === 2) return 하 ? [한줄읽기문항, 범례문항] : [한줄읽기문항, 그림수함정문항, 범례문항, 좋은점문항];
  if (lessonNo === 3) return 하 ? [그리기문항, 단위정하기문항] : [그리기문항, 단위정하기문항, 빈줄문항];
  if (lessonNo === 4) return 상 ? [차이문항, 합계문항, 그림수함정문항, 빈줄문항] : [차이문항, 합계문항, 가장적은문항];
  if (lessonNo === 5) return 하 ? [자료정리문항, 한줄읽기문항] : [자료정리문항, 빈줄문항, 합계문항];
  return null;
};
