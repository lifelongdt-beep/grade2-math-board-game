import type { Difficulty } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { pick, rand } from '../../grade5/util';

// ════════════════════════════════════════════════════════════════════
// 3-1 5단원 길이와 시간 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입
//   2 cm보다 작은 단위(1 mm)       3 m보다 큰 단위(1 km)
//   4 길이를 어림하고 재기(지도서 4~5차시를 한 차시로)
//   5 분보다 작은 단위(1초)        6 시간의 덧셈   7 시간의 뺄셈
//
// 지도서가 못박은 것:
//   · "1 km와 1 cm의 관계 … 등의 지나친 단위 환산은 다루지 않는다."
//     cm↔mm, km↔m만 바꿉니다.
//   · "측정 도구의 눈금에 일치하지 않는 측정값을 '약'으로 표현하게 한다."
//   · 시간의 덧셈·뺄셈은 교과서처럼 분·초끼리, 시각과 분·초로 합니다
//     (2분 30초+1분 50초, 9시 10분 20초+2분 30초, 1시 33분 20초-2분 10초).
//     시각끼리 더하지 않습니다 — 시각에 시각을 더하는 것은 뜻이 없습니다.
// 글은 조사를 '을(를)'처럼 적고, 문항을 만들 때 앞말에 맞춥니다.
// ════════════════════════════════════════════════════════════════════

const cmmm = (mm: number) => (mm % 10 === 0 ? `${mm / 10} cm` : mm < 10 ? `${mm} mm` : `${Math.floor(mm / 10)} cm ${mm % 10} mm`);
const kmm = (m: number) => (m % 1000 === 0 ? `${m / 1000} km` : m < 1000 ? `${m} m` : `${Math.floor(m / 1000)} km ${m % 1000} m`);

// ── 단원 도입 ───────────────────────────────────────────────────────
const 도입문항: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = rand(seed);
    const one = pick([
      () => {
        const m = 1 + next(4);
        const cm = 10 + next(89);
        return { prompt: `${m} m ${cm} cm는 몇 cm일까요?`, answer: `${m * 100 + cm} cm`, wrongs: [`${m}${cm} cm`.replace(/^(\d)(\d) cm$/, '$1$2 cm'), `${m * 10 + cm} cm`, `${m * 100 + cm + 10} cm`, `${m + cm} cm`], steps: [m === 1 ? '1 m=100 cm입니다.' : `1 m=100 cm이므로 ${m} m=${m * 100} cm입니다.`, `${m * 100}+${cm}=${m * 100 + cm}이므로 ${m * 100 + cm} cm입니다.`], concept: '1 m는 100 cm입니다.', strategy: 'm와 cm의 관계 떠올리기' };
      },
      () => {
        const h = 1 + next(3);
        const mins = 5 + next(55);
        return { prompt: `${h}시간 ${mins}분은 몇 분일까요?`, answer: `${h * 60 + mins}분`, wrongs: [`${h * 100 + mins}분`, `${h + mins}분`, `${h * 60 + mins + 10}분`, `${h * 10 + mins}분`], steps: [h === 1 ? '1시간=60분입니다.' : `1시간=60분이므로 ${h}시간=${h * 60}분입니다.`, `${h * 60}+${mins}=${h * 60 + mins}이므로 ${h * 60 + mins}분입니다.`], concept: '1시간은 60분입니다.', strategy: '시간과 분의 관계 떠올리기' };
      },
    ], next(99))();
    return {
      ...one,
      wrongs: one.wrongs.filter((w) => w !== one.answer),
      tag: one.answer.endsWith('분') ? 'time' : 'measurement',
      hint: one.answer.endsWith('분') ? '1시간이 몇 분인지 떠올려 보세요. 시간을 분으로 바꾼 다음 더하세요.' : '1 m가 몇 cm인지 떠올려 보세요. m를 cm로 바꾼 다음 더하세요.',
      misconceptionTip: '숫자를 그대로 이어 붙이면 안 됩니다. 큰 단위를 작은 단위로 바꾼 다음 더하세요.',
    };
  },
};

// ── 2차시: 1 mm ─────────────────────────────────────────────────────
const 자읽기문항 = (시작0: boolean): G5Family => ({
  id: `ruler-${시작0 ? 0 : 'x'}`,
  make: (seed) => {
    const next = rand(seed);
    const start = 시작0 ? 0 : (1 + next(3)) * 10;
    const len = 21 + next(55);
    if (len % 10 === 0) return null;
    const end = start + len;
    const 자끝 = Math.ceil((end + 5) / 10) * 10;
    return {
      prompt: 시작0
        ? '물건의 길이는 몇 cm 몇 mm일까요?'
        : `물건의 한쪽 끝을 자의 눈금 ${start / 10}에 맞추었습니다. 물건의 길이는 몇 cm 몇 mm일까요?`,
      answer: cmmm(len),
      wrongs: [cmmm(end), cmmm(len + 10), cmmm(len - 1), `${Math.floor(len / 10)} cm ${10 - (len % 10)} mm`, cmmm(len + 1)].filter((w) => w !== cmmm(len)),
      tag: 'measurement',
      concept: '1 cm를 10칸으로 똑같이 나눈 작은 눈금 한 칸의 길이를 1 mm라고 합니다. 1 cm=10 mm입니다.',
      strategy: 시작0 ? '자로 길이를 재어 몇 cm 몇 mm로 나타내기' : '눈금 0에서 시작하지 않는 물건의 길이 재기',
      hint: 시작0
        ? '물건의 끝이 몇 cm 눈금을 지났는지 먼저 보고, 그다음 작은 눈금이 몇 칸 더 있는지 세어 보세요.'
        : `시작한 눈금 ${start / 10}부터 큰 눈금 몇 칸, 작은 눈금 몇 칸인지 세어 보세요. 끝의 눈금을 그대로 읽으면 안 됩니다.`,
      steps: 시작0
        ? [`물건의 끝은 ${Math.floor(len / 10)} cm에서 작은 눈금 ${len % 10}칸을 더 간 곳입니다.`, `그러므로 길이는 ${cmmm(len)}입니다.`]
        : [`물건은 눈금 ${start / 10}에서 시작하여 ${cmmm(end)} 눈금에서 끝납니다.`, `${cmmm(end)}에서 ${cmmm(start)}을(를) 빼면 ${cmmm(len)}입니다.`],
      misconceptionTip: 시작0 ? '작은 눈금 한 칸은 1 mm입니다. 1 cm가 아닙니다.' : '물건이 0에서 시작하지 않으면 끝 눈금이 곧 길이가 아닙니다.',
      visual: {
        kind: 'ruler',
        unit: 'mm',
        label: '자와 물건',
        start: 0,
        end: 자끝,
        highlightStart: start,
        highlightEnd: end,
      },
    };
  },
});

const mm바꾸기문항: G5Family = {
  id: 'mm-convert',
  make: (seed) => {
    const next = rand(seed + 3);
    const cm = 1 + next(15);
    const mm = 1 + next(9);
    const total = cm * 10 + mm;
    const 방향 = next(2) === 0;
    if (방향) {
      return {
        prompt: `${cm} cm ${mm} mm는 몇 mm일까요?`,
        answer: `${total} mm`,
        wrongs: [`${cm + mm} mm`, `${cm * 100 + mm} mm`, `${total + 10} mm`, `${cm}${mm}0 mm`],
        tag: 'measurement',
        concept: '1 cm=10 mm입니다.',
        strategy: '몇 cm 몇 mm를 몇 mm로 나타내기',
        hint: '1 cm가 몇 mm인지 떠올려 보세요. cm를 mm로 바꾼 다음 남은 mm를 더하세요.',
        steps: [`${cm} cm=${cm * 10} mm입니다.`, `${cm * 10}+${mm}=${total}이므로 ${total} mm입니다.`],
        misconceptionTip: '1 cm는 100 mm가 아니라 10 mm입니다.',
      };
    }
    return {
      prompt: `${total} mm는 몇 cm 몇 mm일까요?`,
      answer: `${cm} cm ${mm} mm`,
      wrongs: [`${total} cm ${mm} mm`, `${cm} cm ${(mm % 9) + 1} mm`, `${cm + 1} cm ${mm} mm`, `${mm} cm ${cm} mm`].filter((w) => w !== `${cm} cm ${mm} mm`),
      tag: 'measurement',
      concept: '10 mm=1 cm입니다.',
      strategy: '몇 mm를 몇 cm 몇 mm로 나타내기',
      hint: `${total} mm 안에 10 mm가 몇 번 들어 있는지 생각해 보세요.`,
      steps: [`${total} mm=${cm * 10} mm+${mm} mm입니다.`, `${cm * 10} mm=${cm} cm이므로 ${cm} cm ${mm} mm입니다.`],
      misconceptionTip: '100 mm가 1 cm인 것이 아닙니다. 10 mm가 1 cm입니다.',
    };
  },
};

const 길이비교문항: G5Family = {
  id: 'compare-mm',
  make: (seed) => {
    const next = rand(seed + 5);
    const a = 21 + next(70);
    let b = a + (next(2) === 0 ? 1 : -1) * (1 + next(9));
    if (b % 10 === 0) b += 1;
    if (a % 10 === 0 || a === b) return null;
    const 이름 = pick([['빨간 끈', '파란 끈'], ['연필', '크레파스'], ['지우개', '풀']], seed);
    const 긴 = a > b ? 이름[0] : 이름[1];
    return {
      prompt: `${이름[0]}의 길이는 ${cmmm(a)}이고, ${이름[1]}의 길이는 ${b} mm입니다. 더 긴 것은 어느 것일까요?`,
      answer: 긴,
      wrongs: [a > b ? 이름[1] : 이름[0], '두 길이가 같습니다', '알 수 없습니다'],
      tag: 'measurement',
      concept: '단위가 다른 두 길이는 같은 단위로 바꾸어 견줍니다.',
      strategy: 'cm와 mm로 나타낸 길이 견주기',
      hint: '두 길이를 모두 mm로 바꾸어 보세요. 숫자만 보고 견주면 안 됩니다.',
      steps: [`${cmmm(a)}=${a} mm입니다.`, `${a} mm와 ${b} mm를 견주면 ${a > b ? a : b} mm가 더 깁니다.`.replace(/(\d+) mm와/, '$1 mm와'), `그러므로 더 긴 것은 ${긴}입니다.`],
      misconceptionTip: '단위를 같게 하지 않고 숫자만 견주면 안 됩니다.',
    };
  },
};

// ── 3차시: 1 km ─────────────────────────────────────────────────────
const km바꾸기문항: G5Family = {
  id: 'km-convert',
  make: (seed) => {
    const next = rand(seed + 7);
    const km = 1 + next(8);
    const m = pick([50, 100, 200, 300, 450, 500, 600, 750, 800, 900, 30, 5], next(99));
    const total = km * 1000 + m;
    const 방향 = next(2) === 0;
    if (방향) {
      return {
        prompt: `${km} km ${m} m는 몇 m일까요?`,
        answer: `${total} m`,
        wrongs: [`${km}${m} m`, `${km * 100 + m} m`, `${km + m} m`, `${total + 1000} m`].filter((w) => w !== `${total} m`),
        tag: 'measurement',
        concept: '1000 m를 1 km라고 합니다. 1 km=1000 m입니다.',
        strategy: '몇 km 몇 m를 몇 m로 나타내기',
        hint: '1 km가 몇 m인지 떠올려 보세요. km를 m로 바꾼 다음 남은 m를 더하세요.',
        steps: [`${km} km=${km * 1000} m입니다.`, `${km * 1000}+${m}=${total}이므로 ${total} m입니다.`],
        misconceptionTip: `${km} km ${m} m를 ${km}${m} m로 이어 쓰면 안 됩니다. ${m}이(가) 몇 자리 수인지와 상관없이 ${km * 1000}에 더해야 합니다.`,
      };
    }
    return {
      prompt: `${total} m는 몇 km 몇 m일까요?`,
      answer: kmm(total),
      wrongs: [`${Math.floor(total / 100)} km ${total % 100} m`, `${km + 1} km ${m} m`, `${total} km`, `${km} km ${m * 10} m`].filter((w) => w !== kmm(total)),
      tag: 'measurement',
      concept: '1000 m=1 km입니다.',
      strategy: '몇 m를 몇 km 몇 m로 나타내기',
      hint: `${total} m 안에 1000 m가 몇 번 들어 있는지 생각해 보세요.`,
      steps: [`${total} m=${km * 1000} m+${m} m입니다.`, `${km * 1000} m=${km} km이므로 ${kmm(total)}입니다.`],
      misconceptionTip: '100 m가 1 km인 것이 아닙니다. 1000 m가 1 km입니다.',
    };
  },
};

const 단위고르기문항: G5Family = {
  id: 'unit-choice',
  make: (seed) => {
    const one = pick([
      { 무엇: '연필 한 자루의 길이', 수: 150, 단위: 'mm' },
      { 무엇: '개미의 몸길이', 수: 5, 단위: 'mm' },
      { 무엇: '공책의 두께', 수: 7, 단위: 'mm' },
      { 무엇: '교실 칠판의 긴 쪽의 길이', 수: 4, 단위: 'm' },
      { 무엇: '운동장 한 바퀴의 길이', 수: 200, 단위: 'm' },
      { 무엇: '서울에서 부산까지의 거리', 수: 400, 단위: 'km' },
      { 무엇: '집에서 이웃 마을까지의 거리', 수: 3, 단위: 'km' },
      { 무엇: '내 손 한 뼘의 길이', 수: 15, 단위: 'cm' },
      { 무엇: '책상의 짧은 쪽의 길이', 수: 50, 단위: 'cm' },
    ], seed);
    return {
      prompt: `${one.무엇}은(는) 약 ${one.수} □입니다. □ 안에 알맞은 단위는 무엇일까요?`,
      answer: one.단위,
      wrongs: ['mm', 'cm', 'm', 'km'].filter((u) => u !== one.단위),
      tag: 'measurement',
      concept: '길이의 단위에는 mm, cm, m, km가 있습니다. 1 cm=10 mm, 1 m=100 cm, 1 km=1000 m입니다.',
      strategy: '알맞은 길이의 단위 고르기',
      hint: `단위를 하나씩 넣어 보고 실제 길이와 어울리는지 생각해 보세요. ${one.수} mm, ${one.수} cm, ${one.수} m, ${one.수} km는 얼마나 길까요?`,
      steps: [`${one.무엇}은(는) 약 ${one.수} ${one.단위}가 알맞습니다.`],
      misconceptionTip: '수가 크다고 큰 단위를 쓰는 것이 아닙니다. 실제 길이를 떠올려 보세요.',
    };
  },
};

const km어림문항: G5Family = {
  id: 'km-estimate',
  make: (seed) => {
    const next = rand(seed + 11);
    const 한번 = pick([100, 200, 250, 500], next(99));
    const 번 = 1000 / 한번;
    return {
      prompt: `학교에서 공원까지의 거리는 약 ${한번} m입니다. 이 거리를 몇 번 가면 약 1 km가 될까요?`,
      answer: `${번}번`,
      wrongs: [번 * 10, 번 + 1, 번 * 2, Math.max(1, 번 - 1)].filter((v) => v !== 번).map((v) => `${v}번`),
      tag: 'measurement',
      concept: '1 km는 1000 m입니다. 알고 있는 거리를 몇 번 이으면 1 km가 되는지 생각하면 1 km를 어림할 수 있습니다.',
      strategy: '아는 거리를 이용하여 1 km 어림하기',
      hint: `${한번} m를 계속 더해 1000 m가 될 때까지 세어 보세요.`,
      steps: [`${한번} m를 ${번}번 더하면 ${한번 * 번} m입니다.`, `1000 m=1 km이므로 약 ${번}번 가면 1 km가 됩니다.`],
      misconceptionTip: '1 km는 100 m가 아니라 1000 m입니다.',
    };
  },
};

// ── 4차시: 길이를 어림하고 재기 ────────────────────────────────────
const 어림재기문항: G5Family = {
  id: 'estimate-measure',
  make: (seed) => {
    const next = rand(seed + 13);
    const 걸음 = pick([50, 60], next(9));
    const 걸음수 = pick([10, 20, 30], next(9));
    const 거리m = (걸음 * 걸음수) / 100;
    return {
      prompt: `내 한 걸음은 약 ${걸음} cm입니다. 교실 앞에서 뒤까지 걸었더니 약 ${걸음수}걸음이었습니다. 교실 앞에서 뒤까지의 길이는 약 몇 m일까요?`,
      answer: `약 ${거리m} m`,
      wrongs: [`약 ${걸음 * 걸음수} m`, `약 ${거리m * 10} m`, `약 ${걸음수} m`, `약 ${거리m + 1} m`].filter((w) => w !== `약 ${거리m} m`),
      tag: 'measurement',
      concept: '알고 있는 길이(내 걸음, 뼘)를 이용하여 긴 길이를 어림할 수 있습니다.',
      strategy: '걸음으로 길이 어림하기',
      hint: `한 걸음이 약 ${걸음} cm이면 ${걸음수}걸음은 약 몇 cm인지 구한 다음 m로 바꾸어 보세요. 100 cm=1 m입니다.`,
      steps: [`${걸음} cm씩 ${걸음수}걸음이면 약 ${걸음 * 걸음수} cm입니다.`, `100 cm=1 m이므로 약 ${거리m} m입니다.`],
      misconceptionTip: '걸음 수가 곧 m가 아닙니다. 한 걸음의 길이를 함께 생각해야 합니다.',
    };
  },
};

const 약읽기문항: G5Family = {
  id: 'about-read',
  make: (seed) => {
    const next = rand(seed + 17);
    const cm = 3 + next(5);
    const 더 = pick([1, 2, 8, 9], next(9));
    const len = cm * 10 + 더;
    const 가까운cm = 더 <= 2 ? cm : cm + 1;
    return {
      prompt: '물건의 길이는 약 몇 cm일까요?',
      answer: `약 ${가까운cm} cm`,
      wrongs: [`약 ${더 <= 2 ? cm + 1 : cm} cm`, `약 ${len} cm`, `약 ${가까운cm + 2} cm`, `약 ${Math.max(1, 가까운cm - 2)} cm`].filter((w) => w !== `약 ${가까운cm} cm`),
      tag: 'measurement',
      concept: '물건의 끝이 눈금에 딱 맞지 않으면 가까운 쪽의 눈금을 읽고 ‘약’을 붙여 말합니다.',
      strategy: '가까운 눈금을 읽어 약 몇 cm로 나타내기',
      hint: '물건의 끝이 어느 cm 눈금에 더 가까운지 보세요.',
      steps: [`물건의 끝은 ${cm} cm와 ${cm + 1} cm 사이에 있고 ${가까운cm} cm에 더 가깝습니다.`, `그러므로 약 ${가까운cm} cm입니다.`],
      misconceptionTip: '눈금과 딱 맞지 않을 때는 ‘약’을 붙여야 합니다.',
      visual: { kind: 'ruler', unit: 'mm', label: '자와 물건', start: 0, end: (cm + 2) * 10, highlightStart: 0, highlightEnd: len },
    };
  },
};

// ── 5차시: 1초 ──────────────────────────────────────────────────────
const 시각글 = (h: number, m: number, s: number) => `${h}시 ${m}분 ${s}초`;

const 초시계문항: G5Family = {
  id: 'clock-seconds',
  make: (seed) => {
    const next = rand(seed + 19);
    const h = 1 + next(11);
    const m = next(60);
    const s = 1 + next(59);
    const answer = 시각글(h, m, s);
    return {
      prompt: '시계가 나타내는 시각은 몇 시 몇 분 몇 초일까요?',
      answer,
      wrongs: [시각글(h, m, Math.floor(s / 5) + (s % 5 === 0 ? 0 : 1)), 시각글(h, m, (s + 5) % 60), 시각글(h, (m + 5) % 60, s), 시각글(h, Math.floor(s / 5) * 5 % 60, m)].filter((w) => w !== answer),
      tag: 'time',
      concept: '초바늘이 작은 눈금 한 칸을 가는 데 걸리는 시간이 1초입니다. 초바늘이 가리키는 숫자가 1이면 5초, 2이면 10초를 나타냅니다.',
      strategy: '초 단위까지 시각 읽기',
      hint: '짧은바늘로 시, 긴바늘로 분, 가장 가는 빨간 초바늘로 초를 읽으세요. 초바늘이 가리키는 작은 눈금을 0부터 세어 보세요.',
      steps: [`짧은바늘은 ${h}시, 긴바늘은 ${m}분, 초바늘은 ${s}초를 가리킵니다.`, `그러므로 시각은 ${answer}입니다.`],
      misconceptionTip: '초바늘이 가리키는 숫자를 그대로 초로 읽으면 안 됩니다. 숫자 1은 5초입니다.',
      visual: { kind: 'clock', label: '초바늘이 있는 시계', hour: h, minute: m, second: s },
    };
  },
};

const 초바꾸기문항: G5Family = {
  id: 'sec-convert',
  make: (seed) => {
    const next = rand(seed + 23);
    const 분 = 1 + next(5);
    const 초 = 5 + next(55);
    const total = 분 * 60 + 초;
    if (next(2) === 0) {
      return {
        prompt: `${분}분 ${초}초는 몇 초일까요?`,
        answer: `${total}초`,
        wrongs: [`${분 * 100 + 초}초`, `${분 + 초}초`, `${total + 60}초`, `${분}${초}초`].filter((w) => w !== `${total}초`),
        tag: 'time',
        concept: '1분=60초입니다.',
        strategy: '몇 분 몇 초를 몇 초로 나타내기',
        hint: '1분이 몇 초인지 떠올려 보세요. 1분은 100초가 아닙니다.',
        steps: [`${분}분=${분 * 60}초입니다.`, `${분 * 60}+${초}=${total}이므로 ${total}초입니다.`],
        misconceptionTip: '1분을 100초로 생각하면 안 됩니다. 1분은 60초입니다.',
      };
    }
    return {
      prompt: `${total}초는 몇 분 몇 초일까요?`,
      answer: `${분}분 ${초}초`,
      wrongs: [분초글({ 분: Math.floor(total / 100), 초: total % 100 }), 분초글({ 분: 분 + 1, 초: 초 }), 분초글({ 분: 분, 초: (초 + 10) % 60 }), `${total}분`].filter((w) => w !== 분초글({ 분: 분, 초: 초 })),
      tag: 'time',
      concept: '60초=1분입니다.',
      strategy: '몇 초를 몇 분 몇 초로 나타내기',
      hint: `${total}초 안에 60초가 몇 번 들어 있는지 생각해 보세요.`,
      steps: [`${total}초=${분 * 60}초+${초}초입니다.`, `${분 * 60}초=${분}분이므로 ${분}분 ${초}초입니다.`],
      misconceptionTip: '100초가 1분인 것이 아닙니다. 60초가 1분입니다.',
    };
  },
};

const 시간단위고르기문항: G5Family = {
  id: 'time-unit',
  make: (seed) => {
    const one = pick([
      { 무엇: '100 m를 달리는 데 걸린 시간', 수: 18, 단위: '초' },
      { 무엇: '눈을 한 번 깜빡이는 데 걸리는 시간', 수: 1, 단위: '초' },
      { 무엇: '이를 닦는 데 걸리는 시간', 수: 3, 단위: '분' },
      { 무엇: '점심을 먹는 데 걸리는 시간', 수: 30, 단위: '분' },
      { 무엇: '하룻밤 동안 잠을 잔 시간', 수: 9, 단위: '시간' },
      { 무엇: '줄넘기를 10번 하는 데 걸리는 시간', 수: 10, 단위: '초' },
    ], seed);
    return {
      prompt: `${one.무엇}은(는) 약 ${one.수} □입니다. □ 안에 알맞은 단위는 무엇일까요?`,
      answer: one.단위,
      wrongs: ['초', '분', '시간', '일'].filter((u) => u !== one.단위),
      tag: 'time',
      concept: '1분=60초, 1시간=60분입니다. 짧은 시간은 초, 조금 긴 시간은 분, 긴 시간은 시간으로 나타냅니다.',
      strategy: '알맞은 시간의 단위 고르기',
      hint: `${one.수}초, ${one.수}분, ${one.수}시간을 하나씩 넣어 보고 실제 걸리는 시간과 어울리는지 생각해 보세요.`,
      steps: [`${one.무엇}은(는) 약 ${one.수}${one.단위}가 알맞습니다.`],
      misconceptionTip: '수만 보고 단위를 고르면 안 됩니다. 실제로 걸리는 시간을 떠올려 보세요.',
    };
  },
};

// ── 6·7차시: 시간의 덧셈과 뺄셈 ────────────────────────────────────
type 분초 = { 분: number; 초: number };
const 분초글 = (t: 분초) => (t.분 === 0 ? `${t.초}초` : t.초 === 0 ? `${t.분}분` : `${t.분}분 ${t.초}초`);

const 덧셈문항 = (받아올림: boolean, 시각더하기: boolean): G5Family => ({
  id: `add-${받아올림 ? 'c' : 'n'}-${시각더하기 ? 't' : 'd'}`,
  make: (seed) => {
    const next = rand(seed + 29);
    const a: 분초 = { 분: 1 + next(20), 초: 5 + next(50) };
    const b: 분초 = { 분: 1 + next(15), 초: 5 + next(50) };
    const 초합 = a.초 + b.초;
    if (받아올림 !== 초합 >= 60) return null;
    const 분합 = a.분 + b.분 + (초합 >= 60 ? 1 : 0);
    const 초 = 초합 % 60;
    if (분합 >= 60) return null;
    const 올림설명 = 초합 >= 60 ? [`초끼리 더하면 ${a.초}+${b.초}=${초합}초이고, 60초는 1분이므로 1분을 받아올리고 ${초}초가 남습니다.`] : [`초끼리 더하면 ${a.초}+${b.초}=${초합}초입니다.`];
    if (시각더하기) {
      const h = 1 + next(11);
      if (a.분 + b.분 + (초합 >= 60 ? 1 : 0) >= 60) return null;
      const 시작 = 시각글(h, a.분, a.초);
      const answer = 시각글(h, 분합, 초);
      const 장면 = pick([
        `체험을 ${시작}에 시작하여 ${분초글(b)} 동안 했습니다. 체험이 끝난 시각은 몇 시 몇 분 몇 초일까요?`,
        `${시작}부터 ${분초글(b)} 동안 줄넘기를 했습니다. 줄넘기를 마친 시각은 몇 시 몇 분 몇 초일까요?`,
      ], seed);
      return {
        prompt: 장면,
        answer,
        // 받아올린 1분을 더하지 않은 값, 초를 60으로 넘긴 채 쓴 값(아이가 실제로
        // 쓰는 꼴이라 남깁니다), 1분·1시간 어긋난 값입니다.
        wrongs: [시각글(h, a.분 + b.분, 초), `${h}시 ${a.분 + b.분}분 ${초합}초`, 시각글(h, 분합 + 1, 초), 시각글(h + 1, 분합, 초), 시각글(h, Math.max(0, 분합 - 1), 초), 시각글(h, 분합, (초 + 10) % 60)].filter((w, at, all) => w !== answer && all.indexOf(w) === at),
        tag: 'time',
        concept: '(시각)+(시간)=(시각)입니다. 초는 초끼리, 분은 분끼리 더하고, 60초가 되면 1분으로 받아올립니다.',
        strategy: `시각과 시간의 덧셈${받아올림 ? '(받아올림 있음)' : ''}`,
        hint: '초는 초끼리, 분은 분끼리 더하세요. 초끼리 더한 값이 60이거나 60보다 크면 60초를 1분으로 바꿉니다.',
        steps: [...올림설명, `분끼리 더하면 ${a.분}+${b.분}${초합 >= 60 ? '+1' : ''}=${분합}분입니다.`, `그러므로 끝난 시각은 ${answer}입니다.`],
        misconceptionTip: '60초를 넘었는데 그대로 쓰면 안 됩니다. 1분은 100초가 아니라 60초입니다.',
      };
    }
    const 장면 = pick([
      { 앞: '‘동물의 세계’ 영상', 뒤: '‘공룡 시대’ 영상', 끝: '두 영상을 이어서 보는 데 걸리는 시간은 모두 몇 분 몇 초일까요?' },
      { 앞: '보드게임 체험', 뒤: '인공 지능 체험', 끝: '두 가지 체험을 하는 데 걸리는 시간은 모두 몇 분 몇 초일까요?' },
      { 앞: '팝콘을 만드는 시간', 뒤: '빵을 데우는 시간', 끝: '두 시간을 더하면 모두 몇 분 몇 초일까요?' },
    ], seed);
    const answer = 분초글({ 분: 분합, 초 });
    return {
      prompt: `${장면.앞}은(는) ${분초글(a)}, ${장면.뒤}은(는) ${분초글(b)}입니다. ${장면.끝}`,
      answer,
      wrongs: [분초글({ 분: a.분 + b.분, 초: 초 }), 분초글({ 분: a.분 + b.분, 초: 초합 }), 분초글({ 분: 분합 + 1, 초: 초 }), 분초글({ 분: 분합, 초: (초 + 10) % 60 }), 분초글({ 분: Math.max(1, 분합 - 1), 초: 초 }), 분초글({ 분: 분합 + 10, 초: 초 })].filter((w, at, all) => w !== answer && all.indexOf(w) === at),
      tag: 'time',
      concept: '(시간)+(시간)=(시간)입니다. 초는 초끼리, 분은 분끼리 더하고, 60초가 되면 1분으로 받아올립니다.',
      strategy: `시간과 시간의 덧셈${받아올림 ? '(받아올림 있음)' : ''}`,
      hint: '초는 초끼리, 분은 분끼리 더하세요. 초끼리 더한 값이 60이거나 60보다 크면 60초를 1분으로 바꿉니다.',
      steps: [...올림설명, `분끼리 더하면 ${a.분}+${b.분}${초합 >= 60 ? '+1' : ''}=${분합}분입니다.`, `그러므로 ${answer}입니다.`],
      misconceptionTip: '초끼리 더한 값이 60을 넘으면 그대로 쓰지 말고 1분으로 받아올리세요.',
    };
  },
});

const 뺄셈문항 = (받아내림: boolean, 시각빼기: boolean): G5Family => ({
  id: `sub-${받아내림 ? 'b' : 'n'}-${시각빼기 ? 't' : 'd'}`,
  make: (seed) => {
    const next = rand(seed + 31);
    const a: 분초 = { 분: 5 + next(50), 초: next(60) };
    const b: 분초 = { 분: 1 + next(Math.max(1, a.분 - 2)), 초: 5 + next(50) };
    const 내림 = a.초 < b.초;
    if (받아내림 !== 내림) return null;
    const 초 = 내림 ? a.초 + 60 - b.초 : a.초 - b.초;
    const 분 = a.분 - b.분 - (내림 ? 1 : 0);
    if (분 < 1) return null;
    const 내림설명 = 내림
      ? [`초끼리 뺄 수 없으므로 1분을 60초로 바꾸어 받아내립니다. ${a.초 + 60}-${b.초}=${초}초입니다.`, `분끼리 빼면 ${a.분}-1-${b.분}=${분}분입니다.`]
      : [`초끼리 빼면 ${a.초}-${b.초}=${초}초입니다.`, `분끼리 빼면 ${a.분}-${b.분}=${분}분입니다.`];
    if (시각빼기) {
      const h = 1 + next(11);
      const 끝 = 시각글(h, a.분, a.초);
      const answer = 시각글(h, 분, 초);
      return {
        // 시각글은 늘 '초'로 끝나므로 '였습니다'입니다(받침 없음).
        prompt: `범퍼카를 ${분초글(b)} 동안 탔더니 ${끝}였습니다. 범퍼카를 타기 시작한 시각은 몇 시 몇 분 몇 초일까요?`,
        answer,
        // 받아내림을 하고 1분을 빼지 않은 값, 초끼리 거꾸로 뺀 값, 1분 어긋난 값,
        // 빼야 할 것을 더한 값입니다.
        wrongs: [
          시각글(h, a.분 - b.분, 초),
          시각글(h, 분, Math.abs(a.초 - b.초)),
          시각글(h, 분 + 1, 초),
          시각글(h, Math.max(0, 분 - 1), 초),
          ...(a.분 + b.분 + (a.초 + b.초 >= 60 ? 1 : 0) < 60 ? [시각글(h, a.분 + b.분 + (a.초 + b.초 >= 60 ? 1 : 0), (a.초 + b.초) % 60)] : []),
        ].filter((w, at, all) => w !== answer && all.indexOf(w) === at),
        tag: 'time',
        concept: '(시각)-(시간)=(시각)입니다. 초는 초끼리, 분은 분끼리 빼고, 초끼리 뺄 수 없으면 1분을 60초로 바꾸어 받아내립니다.',
        strategy: `시각과 시간의 뺄셈${받아내림 ? '(받아내림 있음)' : ''}`,
        hint: '끝난 시각에서 탄 시간만큼 거꾸로 가면 시작한 시각입니다. 초는 초끼리, 분은 분끼리 빼세요.',
        steps: [`시작한 시각은 ${끝}에서 ${분초글(b)}을(를) 뺀 시각입니다.`, ...내림설명, `그러므로 시작한 시각은 ${answer}입니다.`],
        misconceptionTip: '받아내릴 때 1분은 100초가 아니라 60초입니다.',
      };
    }
    const answer = 분초글({ 분, 초 });
    return {
      prompt: `${분초글(a)}-${분초글(b)}을(를) 계산하면 몇 분 몇 초일까요?`,
      answer,
      wrongs: [분초글({ 분: a.분 - b.분, 초: 초 }), 분초글({ 분: 분, 초: Math.abs(a.초 - b.초) }), 분초글({ 분: 분, 초: (초 + 40) % 60 }), 분초글({ 분: 분 + 1, 초: 초 }), 분초글({ 분: a.분 + b.분, 초: (a.초 + b.초) % 60 }), 분초글({ 분: Math.max(1, 분 - 1), 초: 초 })].filter((w, at, all) => w !== answer && all.indexOf(w) === at),
      tag: 'time',
      concept: '(시간)-(시간)=(시간)입니다. 초끼리 뺄 수 없으면 1분을 60초로 바꾸어 받아내립니다.',
      strategy: `시간과 시간의 뺄셈${받아내림 ? '(받아내림 있음)' : ''}`,
      hint: '초는 초끼리, 분은 분끼리 빼세요. 초끼리 뺄 수 없으면 1분을 60초로 바꾸어 받아내립니다.',
      steps: [...내림설명, `그러므로 ${answer}입니다.`],
      misconceptionTip: '초끼리 뺄 수 없다고 큰 수에서 작은 수를 거꾸로 빼면 안 됩니다. 1분을 60초로 바꾸어 받아내리세요.',
      minusIsOperator: true,
    };
  },
});

const 시각시간구별문항: G5Family = {
  id: 'when-vs-how-long',
  make: (seed) => {
    const one = pick([
      { 말: '영화는 2시 30분에 시작합니다.', 답: '시각' },
      { 말: '줄넘기를 3분 20초 동안 했습니다.', 답: '시간' },
      { 말: '9시 10분 20초에 체험을 시작했습니다.', 답: '시각' },
      { 말: '영상을 보는 데 1분 50초가 걸렸습니다.', 답: '시간' },
    ], seed);
    return {
      prompt: `"${one.말}"에 나온 것은 시각일까요, 시간일까요?`,
      answer: one.답,
      wrongs: [one.답 === '시각' ? '시간' : '시각', '둘 다 아닙니다', '알 수 없습니다'],
      tag: 'time',
      concept: '시각은 어느 한 때를 나타내고, 시간은 어떤 때에서 어떤 때까지의 동안을 나타냅니다.',
      strategy: '시각과 시간 구별하기',
      hint: '‘몇 시에’처럼 한 때를 말하는지, ‘몇 분 동안’처럼 걸린 동안을 말하는지 보세요.',
      steps: [one.답 === '시각' ? '어느 한 때를 나타내므로 시각입니다.' : '어떤 일을 한 동안을 나타내므로 시간입니다.'],
      misconceptionTip: '시각과 시간은 다릅니다. 시각끼리는 더하지 않습니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
export const unit5Lesson = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [도입문항];
  if (lessonNo === 2) {
    if (하) return [자읽기문항(true), mm바꾸기문항];
    if (상) return [자읽기문항(false), 길이비교문항, mm바꾸기문항];
    return [자읽기문항(true), mm바꾸기문항, 길이비교문항];
  }
  if (lessonNo === 3) {
    if (하) return [km바꾸기문항, 단위고르기문항];
    if (상) return [km바꾸기문항, km어림문항, 단위고르기문항];
    return [km바꾸기문항, km어림문항, 단위고르기문항];
  }
  if (lessonNo === 4) {
    if (하) return [약읽기문항, 단위고르기문항, 자읽기문항(true)];
    if (상) return [어림재기문항, km어림문항, 자읽기문항(false), 길이비교문항];
    return [어림재기문항, 약읽기문항, 단위고르기문항];
  }
  if (lessonNo === 5) {
    if (하) return [초시계문항, 초바꾸기문항];
    if (상) return [초바꾸기문항, 시간단위고르기문항, 초시계문항];
    return [초시계문항, 초바꾸기문항, 시간단위고르기문항];
  }
  if (lessonNo === 6) {
    if (하) return [덧셈문항(false, false), 덧셈문항(false, true)];
    if (상) return [덧셈문항(true, true), 덧셈문항(true, false), 시각시간구별문항];
    return [덧셈문항(true, false), 덧셈문항(true, true), 덧셈문항(false, true)];
  }
  if (lessonNo === 7) {
    if (하) return [뺄셈문항(false, false), 뺄셈문항(false, true)];
    if (상) return [뺄셈문항(true, true), 뺄셈문항(true, false), 시각시간구별문항];
    return [뺄셈문항(true, false), 뺄셈문항(true, true), 뺄셈문항(false, true)];
  }
  return null;
};
