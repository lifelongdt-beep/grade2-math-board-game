import type { Difficulty } from '../../../types';
import type { G5Family } from '../../grade5/build';
import { pick, rand } from '../../grade5/util';
import { divFor, divSteps, wrongsFor, 몫글, 확인식, type Div, type Kind } from './core';

// ════════════════════════════════════════════════════════════════════
// 3-2 2단원 나눗셈 — 문항 뭉치
// ────────────────────────────────────────────────────────────────────
//   1 단원 도입
//   2 내림이 없는 (몇십)÷(몇)          3 내림이 없는 (몇십몇)÷(몇)
//   4 내림이 있는 (두 자리 수)÷(한 자리 수)
//   5 내림이 없고 나머지가 있는 것      6 내림이 있고 나머지가 있는 것
//   7 나눗셈의 계산이 맞는지 확인하기
//   8 나머지가 없는 (세 자리 수)÷(한 자리 수)
//   9 나머지가 있는 (세 자리 수)÷(한 자리 수)
//   10 나눗셈의 어림셈
//
// 지도서가 못박은 것:
//   · 나머지는 나누는 수보다 작아야 합니다. 나머지가 0이면 나누어떨어진다고 합니다.
//   · '검산'이라는 말 대신 '확인'이라고 씁니다(2022 개정).
//   · 확인하는 식은 4×8=32, 32+3=35처럼 둘로 나누어 씁니다. 혼합 계산은
//     5~6학년에서 배우므로 4×8+3=35나 4×8=32+3=35처럼 쓰지 않습니다.
//   · 어림셈은 나누어지는 수를 나누는 수로 쉽게 나누어지는 수로 바꿉니다
//     (298÷3 → 300÷3, 704÷7 → 700÷7, 477÷6 → 480÷6).
// 글은 조사를 '을(를)'처럼 적고, 문항을 만들 때 앞말에 맞춥니다.
// ════════════════════════════════════════════════════════════════════

const 꼴이름: Record<Kind, string> = {
  t0: '내림이 없는 (몇십)÷(몇)',
  n0: '내림이 없는 (몇십몇)÷(몇)',
  b0: '내림이 있는 (두 자리 수)÷(한 자리 수)',
  nr: '내림이 없고 나머지가 있는 (두 자리 수)÷(한 자리 수)',
  br: '내림이 있고 나머지가 있는 (두 자리 수)÷(한 자리 수)',
  h0: '나머지가 없는 (세 자리 수)÷(한 자리 수)',
  hr: '나머지가 있는 (세 자리 수)÷(한 자리 수)',
};

const 핵심: Record<Kind, string> = {
  t0: '(몇십)÷(몇)은 10이 몇 개인지 생각하여 (몇)÷(몇)으로 계산합니다. 6÷3=2이므로 60÷3=20입니다.',
  n0: '(몇십몇)÷(몇)은 십의 자리와 일의 자리를 각각 나누어 더합니다. 24÷2는 20÷2=10과 4÷2=2를 더한 12입니다.',
  b0: '십의 자리를 나누고 남은 수는 일의 자리로 내려 일의 자리 수와 함께 나눕니다. 52÷4는 40÷4=10과 12÷4=3을 더한 13입니다.',
  nr: '나누고 남는 수를 나머지라고 합니다. 나머지는 나누는 수보다 작아야 합니다. 29÷8=3 … 5입니다.',
  br: '십의 자리를 나누고 남은 수를 일의 자리로 내려 함께 나눈 다음, 남는 수를 나머지로 씁니다. 64÷5=12 … 4입니다.',
  h0: '(세 자리 수)÷(한 자리 수)는 높은 자리부터 나누고, 남은 수를 다음 자리 수와 함께 나눕니다.',
  hr: '높은 자리부터 나누고, 마지막에 남는 수가 나머지입니다. 백의 자리에서 나눌 수 없으면 십의 자리까지 함께 나눕니다.',
};

const 볼곳: Record<Kind, string> = {
  t0: '0을 떼고 (몇)÷(몇)을 먼저 계산해 보세요. 그 몫은 10이 몇 개인지를 나타냅니다.',
  n0: '십의 자리 수와 일의 자리 수를 각각 나누어 보세요.',
  b0: '십의 자리를 나누고 남은 수를 잊지 마세요. 남은 수는 일의 자리로 내려 일의 자리 수와 함께 나눕니다.',
  nr: '나누는 수의 단 곱셈구구에서 나누어지는 수를 넘지 않는 가장 큰 곱을 찾으세요. 남는 수가 나머지입니다.',
  br: '십의 자리부터 나누고, 남은 수를 일의 자리로 내려 함께 나누세요. 마지막에 남은 수가 나누는 수보다 작은지 보세요.',
  h0: '백의 자리부터 나누세요. 남은 수는 다음 자리로 내려 함께 나눕니다. 몫의 자리에 0이 들어갈 수도 있습니다.',
  hr: '먼저 백의 자리 수가 나누는 수보다 작은지 보세요. 작으면 십의 자리까지 함께 나눕니다.',
};

const 오개념: Record<Kind, string> = {
  t0: '60÷3을 2로 쓰면 안 됩니다. 십 모형 6개를 3묶음으로 나누면 한 묶음에 십 모형 2개, 즉 20입니다.',
  n0: '십의 자리 몫은 몇십입니다. 자리를 맞추어 쓰세요.',
  b0: '십의 자리에서 남은 수를 버리면 안 됩니다. 일의 자리로 내려서 함께 나눕니다.',
  nr: '나머지가 나누는 수와 같거나 크면 몫을 하나 더 크게 할 수 있다는 뜻입니다.',
  br: '나머지가 나누는 수보다 크면 다시 계산하세요. 십의 자리에서 남은 수를 내리는 것도 잊지 마세요.',
  h0: '몫의 가운데 자리가 0일 때 0을 빠뜨리면 안 됩니다(104를 14로 쓰면 안 됩니다).',
  hr: '나머지가 나누는 수보다 작은지 확인하세요. 몫의 자리에 들어가는 0도 빠뜨리지 마세요.',
};

const 식 = ({ a, d }: Div) => `${a}÷${d}`;
const 자기확인 = '나누는 수와 몫을 곱하고 나머지를 더하면 나누어지는 수가 되나요?';

// ── 계산 ────────────────────────────────────────────────────────────
const 계산문항 = (kind: Kind): G5Family => ({
  id: `calc-${kind}`,
  make: (seed) => {
    const one = divFor(kind, seed);
    if (!one) return null;
    const 나머지 = one.r > 0;
    return {
      prompt: 나머지 ? `${식(one)}의 몫과 나머지를 바르게 구한 것은 어느 것일까요?` : `${식(one)}의 몫은 얼마일까요?`,
      answer: 몫글(one.q, one.r),
      wrongs: wrongsFor(one),
      tag: 'division',
      concept: 핵심[kind],
      strategy: `${꼴이름[kind]} 계산하기`,
      hint: 볼곳[kind],
      steps: divSteps(one),
      misconceptionTip: 오개념[kind],
      selfCheck: 자기확인,
      ...(나머지 ? { sameValueOk: true } : {}),
    };
  },
});

// ── 문장제(똑같이 나누기 / 몇씩 묶기) ───────────────────────────────
type 장면 = (one: Div) => { prompt: string; answer: string; 오답: (q: number, r: number) => string; 뜻: string };
const 장면들: 장면[] = [
  ({ a, d }) => ({
    prompt: `색종이 ${a}장을 한 사람에게 ${d}장씩 나누어 주려고 합니다. 몇 명에게 나누어 줄 수 있고, 몇 장이 남을까요?`,
    answer: '',
    오답: (q, r) => `${q}명에게 나누어 주고, ${r}장이 남습니다.`,
    뜻: `${d}장씩 묶어 몇 묶음인지 구하므로 ${a}÷${d}입니다.`,
  }),
  ({ a, d }) => ({
    prompt: `구슬 ${a}개를 상자 ${d}개에 똑같이 나누어 담으려고 합니다. 한 상자에 몇 개씩 담을 수 있고, 몇 개가 남을까요?`,
    answer: '',
    오답: (q, r) => `${q}개씩 담고, ${r}개가 남습니다.`,
    뜻: `${a}개를 ${d}곳으로 똑같이 나누므로 ${a}÷${d}입니다.`,
  }),
  ({ a, d }) => ({
    prompt: `그림 ${a}장을 한 줄에 ${d}장씩 걸어 전시하려고 합니다. 몇 줄에 걸 수 있고, 몇 장이 남을까요?`,
    answer: '',
    오답: (q, r) => `${q}줄에 걸고, ${r}장이 남습니다.`,
    뜻: `${d}장씩 묶어 몇 줄인지 구하므로 ${a}÷${d}입니다.`,
  }),
];
type 장면0 = (one: Div) => { prompt: string; 단위: string; 뜻: string };
const 나누어떨어지는장면: 장면0[] = [
  ({ a, d }) => ({ prompt: `빨대 ${a}개를 ${d}명에게 똑같이 나누어 주려고 합니다. 한 명에게 몇 개씩 줄 수 있을까요?`, 단위: '개', 뜻: `${a}개를 ${d}명에게 똑같이 나누므로 ${a}÷${d}입니다.` }),
  ({ a, d }) => ({ prompt: `길이가 ${a} cm인 끈을 ${d} cm씩 자르려고 합니다. ${d} cm짜리 도막을 몇 개 만들 수 있을까요?`, 단위: '개', 뜻: `${d} cm씩 몇 번 자를 수 있는지 구하므로 ${a}÷${d}입니다.` }),
  ({ a, d }) => ({ prompt: `병뚜껑 ${a}개를 ${d}모둠에 똑같이 나누어 주려고 합니다. 한 모둠에 몇 개씩 줄 수 있을까요?`, 단위: '개', 뜻: `${a}개를 ${d}모둠에 똑같이 나누므로 ${a}÷${d}입니다.` }),
];

const 문장제문항 = (kind: Kind, at: number): G5Family => ({
  id: `word-${kind}-${at}`,
  make: (seed) => {
    const one = divFor(kind, seed + at * 17 + 5);
    if (!one) return null;
    const { q, r, a, d } = one;
    if (r === 0) {
      const s = pick(나누어떨어지는장면, seed + at)(one);
      return {
        prompt: s.prompt,
        answer: `${q}${s.단위}`,
        wrongs: wrongsFor(one).filter((w) => !w.includes('…')).map((w) => `${w}${s.단위}`).concat([`${a * d}${s.단위}`, `${a - d}${s.단위}`]),
        tag: 'division',
        concept: 핵심[kind],
        strategy: `${꼴이름[kind]}(으)로 문제 해결하기`,
        hint: '전체가 얼마이고, 몇으로 똑같이 나누는지 또는 몇씩 묶는지 먼저 찾으세요.',
        steps: [s.뜻, ...divSteps(one).slice(0, -1), `${a}÷${d}=${q}이므로 ${q}${s.단위}입니다.`],
        misconceptionTip: '전체와 나누는 수를 바꾸어 쓰거나, 나누어야 하는데 곱하지 않도록 하세요.',
        selfCheck: `${d}×${q}=${a}인지 확인했나요?`,
      };
    }
    const s = pick(장면들, seed + at)(one);
    return {
      prompt: s.prompt,
      answer: s.오답(q, r),
      wrongs: [s.오답(q - 1, r + d), s.오답(q + 1, r), s.오답(r, q), s.오답(q, d - r === r ? r + 1 : d - r)].filter((w, k, all) => all.indexOf(w) === k),
      tag: 'division',
      concept: '나누고 남는 수가 나머지입니다. 나머지는 나누는 수보다 작아야 합니다.',
      strategy: `${꼴이름[kind]}(으)로 문제 해결하기`,
      hint: '나눗셈식을 세운 다음 몫과 나머지가 각각 무엇을 뜻하는지 문제에 맞추어 말해 보세요.',
      steps: [s.뜻, ...divSteps(one).slice(0, -1), `${a}÷${d}=${q} … ${r}이므로 ${s.오답(q, r)}`],
      misconceptionTip: '남은 수가 나누는 수와 같거나 크면 한 번 더 나누어 줄 수 있습니다.',
      selfCheck: `${d}×${q}=${d * q}, ${d * q}+${r}=${a}인지 확인했나요?`,
    };
  },
});

// ── 나머지의 뜻 ────────────────────────────────────────────────────
const 나머지될수없는문항: G5Family = {
  id: 'rem-range',
  make: (seed) => {
    const next = rand(seed + 7);
    const d = 3 + next(7);
    const 큰 = next(2) === 0;
    if (큰) {
      return {
        prompt: `어떤 수를 ${d}(으)로 나누었을 때 나올 수 있는 나머지 가운데 가장 큰 수는 얼마일까요?`,
        answer: String(d - 1),
        wrongs: [String(d), String(d + 1), String(d - 2), '9'].filter((w) => w !== String(d - 1)),
        tag: 'division',
        concept: '나머지는 나누는 수보다 작아야 합니다. 나누는 수와 같거나 크면 한 번 더 나눌 수 있습니다.',
        strategy: '나머지의 크기 알기',
        hint: `${d}(으)로 나누고 ${d}이(가) 남았다면 어떻게 될지 생각해 보세요.`,
        steps: [`나머지는 ${d}보다 작아야 합니다.`, `${d}보다 작은 수 가운데 가장 큰 수는 ${d - 1}입니다.`],
        misconceptionTip: '나머지가 나누는 수와 같으면 몫이 하나 더 커집니다. 그래서 나머지가 될 수 없습니다.',
      };
    }
    const 될수없는 = d + next(3);
    return {
      prompt: `어떤 수를 ${d}(으)로 나누었을 때 나머지가 될 수 없는 수는 어느 것일까요?`,
      answer: String(될수없는),
      wrongs: [1, 2, d - 1, d - 2].filter((v, k, all) => v > 0 && v < d && all.indexOf(v) === k).map(String),
      tag: 'division',
      concept: '나머지는 나누는 수보다 작아야 합니다.',
      strategy: '나머지의 크기 알기',
      hint: '나머지는 나누는 수와 견주어 어떤 크기여야 하나요?',
      steps: [`나머지는 ${d}보다 작아야 합니다.`, `${될수없는}은(는) ${d}과(와) 같거나 크므로 나머지가 될 수 없습니다.`],
      misconceptionTip: '나머지가 나누는 수와 같거나 크면 한 번 더 나누어야 합니다.',
    };
  },
};

// ── 몫의 자리, 부분 몫 ─────────────────────────────────────────────
const 부분몫문항 = (kind: Kind): G5Family => ({
  id: `partial-${kind}`,
  make: (seed) => {
    const one = divFor(kind, seed + 11);
    if (!one) return null;
    const { a, d } = one;
    if (a < 10 * d || a >= 100) return null;
    const 큰 = Math.floor(a / (10 * d)) * 10 * d;
    const 남은 = a - 큰;
    if (남은 === 0) return null;
    return {
      prompt: `${식(one)}을(를) ${큰}÷${d}과(와) □÷${d}(으)로 나누어 계산하려고 합니다. □ 안에 알맞은 수는 얼마일까요?`,
      answer: String(남은),
      wrongs: [String(a % 10), String(Math.floor(a / 10)), String(큰), String(남은 + d)].filter((w) => w !== String(남은)),
      tag: 'division',
      concept: '나누어지는 수를 몇십으로 나누어떨어지는 수와 남은 수로 가르면 나누기 쉽습니다.',
      strategy: '나누어지는 수를 갈라 나누기',
      hint: `${a}에서 ${큰}을(를) 빼면 얼마가 남나요?`,
      steps: [`${a}=${큰}+${남은}입니다.`, `그러므로 ${식(one)}은(는) ${큰}÷${d}과(와) ${남은}÷${d}(으)로 나누어 계산하고 □=${남은}입니다.`],
      misconceptionTip: '일의 자리 수만 따로 나누면 십의 자리에서 남은 수를 버리게 됩니다.',
    };
  },
});

const 몫자리문항 = (kind: Kind): G5Family => ({
  id: `qdigits-${kind}`,
  make: (seed) => {
    const one = divFor(kind, seed + 13);
    if (!one) return null;
    const 자리수 = String(one.q).length;
    const 이름 = ['', '한', '두', '세'];
    const 백몫 = Math.floor(one.a / 100) >= one.d;
    return {
      prompt: `${식(one)}의 몫은 몇 자리 수일까요?`,
      answer: `${이름[자리수]} 자리 수`,
      wrongs: ['한 자리 수', '두 자리 수', '세 자리 수', '네 자리 수'].filter((w) => w !== `${이름[자리수]} 자리 수`),
      tag: 'division',
      concept: '나누어지는 수의 백의 자리 수가 나누는 수보다 작으면 백의 자리에는 몫을 쓸 수 없습니다. 그러면 몫은 두 자리 수입니다.',
      strategy: '몫의 자리 수 어림하기',
      hint: `${Math.floor(one.a / 100)}을(를) ${one.d}(으)로 나눌 수 있는지 보세요. 몫이 100보다 큰지 작은지 어림해 보세요.`,
      steps: [
        백몫
          ? `백의 자리 수 ${Math.floor(one.a / 100)}은(는) ${one.d}보다 크거나 같으므로 백의 자리부터 몫이 나옵니다.`
          : `백의 자리 수 ${Math.floor(one.a / 100)}은(는) ${one.d}보다 작으므로 백의 자리에는 몫이 나오지 않습니다.`,
        `실제로 ${one.r === 0 ? `${식(one)}=${one.q}` : `${식(one)}=${one.q} … ${one.r}`}이므로 몫은 ${이름[자리수]} 자리 수입니다.`,
      ],
      misconceptionTip: '나누어지는 수가 세 자리 수라고 몫도 세 자리 수인 것은 아닙니다.',
    };
  },
});

// ── 잘못 계산한 것 고치기 ──────────────────────────────────────────
const 이름들 = ['은빈', '도윤', '서아', '하준', '지우', '민재', '민서'];

const 고치기문항 = (kind: Kind): G5Family => ({
  id: `fix-${kind}`,
  make: (seed) => {
    const one = divFor(kind, seed + 19);
    if (!one) return null;
    const wrongs = wrongsFor(one);
    const 틀린 = pick(wrongs.slice(0, 2), seed);
    const who = pick(이름들, seed + 1);
    const 맞음 = 몫글(one.q, one.r);
    return {
      prompt: `${who}은(는) ${식(one)}=${틀린}(이)라고 계산했습니다. 바르게 계산한 것은 어느 것일까요?`,
      answer: 맞음,
      wrongs: [틀린, ...wrongs.filter((w) => w !== 틀린)],
      tag: 'division',
      concept: 핵심[kind],
      strategy: `${꼴이름[kind]}에서 잘못 계산한 것 고치기`,
      hint: '나누는 수와 몫을 곱하고 나머지를 더해 나누어지는 수가 되는지, 나머지가 나누는 수보다 작은지 확인해 보세요.',
      steps: [...divSteps(one), `확인: ${확인식(one)}입니다.`],
      misconceptionTip: 오개념[kind],
      ...(one.r > 0 ? { sameValueOk: true } : {}),
    };
  },
});

// ── 7차시: 계산이 맞는지 확인하기 ──────────────────────────────────
const 확인식문항: G5Family = {
  id: 'check-expr',
  make: (seed) => {
    const one = divFor(pick(['br', 'nr', 'hr'] as Kind[], seed), seed + 23);
    if (!one || one.r === 0) return null;
    const { a, d, q, r } = one;
    return {
      prompt: `${a}÷${d}=${q} … ${r}의 계산이 맞는지 확인하는 방법으로 알맞은 것은 어느 것일까요?`,
      answer: `${d}×${q}=${d * q}, ${d * q}+${r}=${a}`,
      wrongs: [
        `${q}×${r}=${q * r}, ${q * r}+${d}=${q * r + d}`,
        `${d}×${r}=${d * r}, ${d * r}+${q}=${d * r + q}`,
        `${a}×${d}=${a * d}, ${a * d}+${r}=${a * d + r}`,
      ],
      tag: 'division',
      concept: '나누는 수와 몫을 곱한 다음 나머지를 더해 나누어지는 수가 되면 계산이 맞습니다.',
      strategy: '나눗셈의 계산이 맞는지 확인하는 식 알기',
      hint: `${d}개씩 ${q}묶음과 남은 ${r}개를 합하면 처음 수가 되는지 생각해 보세요.`,
      steps: [`${d}씩 ${q}묶음은 ${d}×${q}=${d * q}입니다.`, `남은 ${r}을(를) 더하면 ${d * q}+${r}=${a}이므로 나누어지는 수와 같습니다.`],
      misconceptionTip: '곱셈식과 덧셈식을 4×8=32+3=35처럼 한 줄로 이어 쓰면 안 됩니다. 두 식으로 나누어 씁니다.',
    };
  },
};

const 맞는계산고르기문항: G5Family = {
  id: 'check-pick',
  make: (seed) => {
    const next = rand(seed + 29);
    const 꼴들: Kind[] = ['nr', 'br', 'hr'];
    const divs: Div[] = [];
    for (let k = 0; k < 20 && divs.length < 4; k += 1) {
      const one = divFor(꼴들[next(3)], seed * 3 + k * 89);
      if (one && one.r > 0 && one.q >= 3 && !divs.some((x) => x.a === one.a && x.d === one.d)) divs.push(one);
    }
    if (divs.length < 4) return null;
    const 맞는자리 = next(4);
    const 기호 = ['㉠', '㉡', '㉢', '㉣'];
    // 맞지 않는 셋: 나머지가 너무 큼 / 곱과 나머지의 합이 맞지 않음
    const 줄 = divs.map((one, k) => {
      if (k === 맞는자리) return `${기호[k]} ${one.a}÷${one.d}=${one.q} … ${one.r}`;
      return k % 2 === 0
        ? `${기호[k]} ${one.a}÷${one.d}=${one.q - 1} … ${one.r + one.d}`
        : `${기호[k]} ${one.a}÷${one.d}=${one.q} … ${one.r === one.d - 1 ? one.r - 1 : one.r + 1}`;
    });
    if (divs.some((one, k) => k !== 맞는자리 && k % 2 === 1 && one.r === 1 && one.d === 2)) return null;
    return {
      prompt: `나눗셈의 계산이 맞는 것은 어느 것일까요? (${줄.join(', ')})`,
      answer: 기호[맞는자리],
      wrongs: 기호.filter((_, k) => k !== 맞는자리),
      tag: 'division',
      concept: '계산이 맞으려면 나머지가 나누는 수보다 작고, (나누는 수)×(몫)+(나머지)가 나누어지는 수와 같아야 합니다.',
      strategy: '나눗셈의 계산이 맞는지 확인하기',
      hint: '먼저 나머지가 나누는 수보다 작은지 보세요. 그다음 나누는 수와 몫을 곱하고 나머지를 더해 보세요.',
      steps: [
        ...divs.map((one, k) => (k === 맞는자리 ? `${기호[k]} ${확인식(one)}이므로 맞습니다.` : k % 2 === 0 ? `${기호[k]} 나머지 ${one.r + one.d}이(가) 나누는 수 ${one.d}보다 크므로 틀렸습니다.` : `${기호[k]} ${one.d}×${one.q}=${one.d * one.q}에 나머지를 더해도 ${one.a}이(가) 되지 않으므로 틀렸습니다.`)),
        `그러므로 계산이 맞는 것은 ${기호[맞는자리]}입니다.`,
      ],
      misconceptionTip: '나머지가 나누는 수보다 크면 몫을 더 크게 할 수 있으므로 틀린 계산입니다.',
    };
  },
};

const 어떤수문항: G5Family = {
  id: 'unknown',
  make: (seed) => {
    const one = divFor(pick(['br', 'nr', 'hr'] as Kind[], seed + 3), seed + 31);
    if (!one || one.r === 0) return null;
    const { a, d, q, r } = one;
    return {
      prompt: `어떤 수를 ${d}(으)로 나누었더니 몫이 ${q}, 나머지가 ${r}이었습니다. 어떤 수는 얼마일까요?`.replace(/(\d)이었습니다/, (_, x: string) => `${x}${[true, true, false, true, false, false, true, true, true, false][Number(x)] ? '이었습니다' : '였습니다'}`),
      answer: String(a),
      wrongs: [d * q, d * q - r, q * r + d, a + d].filter((v) => v !== a && v > 0).map(String),
      tag: 'division',
      concept: '(나누는 수)×(몫)에 나머지를 더하면 나누어지는 수가 됩니다.',
      strategy: '나눗셈의 확인 방법으로 어떤 수 구하기',
      hint: '나눗셈의 계산이 맞는지 확인하는 방법을 거꾸로 써 보세요.',
      steps: [`${d}×${q}=${d * q}입니다.`, `${d * q}+${r}=${a}이므로 어떤 수는 ${a}입니다.`],
      misconceptionTip: '나머지를 더하는 것을 잊지 마세요.',
    };
  },
};

// ── 상: 나머지가 있을 때 실생활 판단 ───────────────────────────────
const 적어도문항: G5Family = {
  id: 'at-least',
  make: (seed) => {
    const one = divFor(pick(['br', 'nr'] as Kind[], seed + 5), seed + 37);
    if (!one || one.r === 0) return null;
    const { a, d, q, r } = one;
    const s = pick([
      { p: `학생 ${a}명이 한 번에 ${d}명씩 탈 수 있는 보트를 모두 타려고 합니다. 보트는 적어도 몇 번 운행해야 할까요?`, u: '번' },
      { p: `사과 ${a}개를 한 상자에 ${d}개씩 모두 담으려고 합니다. 상자는 적어도 몇 개 필요할까요?`, u: '개' },
    ], seed);
    return {
      prompt: s.p,
      answer: `${q + 1}${s.u}`,
      wrongs: [`${q}${s.u}`, `${q + 2}${s.u}`, `${r}${s.u}`].filter((w) => w !== `${q + 1}${s.u}`),
      tag: 'division',
      concept: '남는 것까지 모두 담거나 태워야 하면 나머지를 위해 하나가 더 필요합니다.',
      strategy: '나머지를 생각하여 문제 해결하기',
      hint: `${a}÷${d}의 몫과 나머지를 구한 다음, 남은 ${r === 1 ? '하나' : '것'}을(를) 어떻게 해야 할지 생각해 보세요.`,
      steps: [`${a}÷${d}=${q} … ${r}입니다.`, `${q}${s.u}(으)로는 ${r}${s.u === '번' ? '명' : '개'}이(가) 남으므로 하나가 더 필요합니다.`, `그러므로 적어도 ${q}+1=${q + 1}${s.u}입니다.`],
      misconceptionTip: '몫만 답으로 쓰면 남은 것을 담거나 태우지 못합니다. 문제에서 무엇을 묻는지 보세요.',
    };
  },
};

// ── 1차시: 단원 도입 ───────────────────────────────────────────────
const 도입문항: G5Family = {
  id: 'review',
  make: (seed) => {
    const next = rand(seed);
    const d = 2 + next(8);
    const q = 2 + next(8);
    const a = d * q;
    if (next(2) === 0) {
      return {
        prompt: `${a}÷${d}의 몫은 얼마일까요?`,
        answer: String(q),
        wrongs: [q + 1, q - 1, a - d, d].filter((v) => v !== q && v > 0).map(String),
        tag: 'division',
        concept: '나눗셈의 몫은 곱셈구구로 구할 수 있습니다(3학년 1학기).',
        strategy: '곱셈구구로 나눗셈의 몫 구하기',
        hint: `${d}단 곱셈구구에서 ${a}이(가) 나오는 곱을 찾아보세요.`,
        steps: [`${d}×${q}=${a}입니다.`, `그러므로 ${a}÷${d}=${q}입니다.`],
        misconceptionTip: '나누어지는 수에서 나누는 수를 빼는 것이 아닙니다.',
      };
    }
    return {
      prompt: `${d}×${q}=${a}을(를) 나눗셈식으로 바르게 나타낸 것은 어느 것일까요?`,
      answer: `${a}÷${d}=${q}`,
      wrongs: [`${d}÷${a}=${q}`, `${a}÷${q}=${q}`, `${q}÷${d}=${a}`, `${a}÷${d}=${d}`].filter((w) => w !== `${a}÷${d}=${q}` && w !== `${a}÷${q}=${d}`),
      tag: 'division',
      concept: '곱셈식 ■×▲=●은 나눗셈식 ●÷■=▲, ●÷▲=■로 나타낼 수 있습니다.',
      strategy: '곱셈과 나눗셈의 관계',
      hint: '곱셈식의 곱이 나눗셈식에서는 나누어지는 수가 됩니다.',
      steps: [`${d}×${q}=${a}에서 곱 ${a}이(가) 나누어지는 수입니다.`, `그러므로 ${a}÷${d}=${q}입니다.`],
      misconceptionTip: '나누어지는 수와 나누는 수의 자리를 바꾸면 안 됩니다.',
    };
  },
};

// ── 10차시: 어림셈 ──────────────────────────────────────────────────
type 어림 = { a: number; d: number; m: number };
/** 나누어지는 수를 '나누는 수×10'의 배수 가운데 가장 가까운 수 m으로 어림합니다. 가까운 수가 둘이면 쓰지 않습니다. */
const 어림뽑기 = (seed: number): 어림 | null => {
  const next = rand(seed);
  const d = 2 + next(8);
  const 단위 = d * 10;
  const k = Math.ceil(100 / 단위) + next(Math.floor(900 / 단위) - Math.ceil(100 / 단위));
  const m = k * 단위;
  const s = (1 + next(Math.min(9, Math.floor(단위 / 2) - 1))) * (next(2) === 0 ? 1 : -1);
  const a = m + s;
  if (a < 100 || a > 999 || m < 100) return null;
  // m이 정말 가장 가까운 배수인지 다시 셉니다.
  const 아래 = Math.floor(a / 단위) * 단위;
  const 가까운 = a - 아래 < 아래 + 단위 - a ? 아래 : a - 아래 > 아래 + 단위 - a ? 아래 + 단위 : null;
  if (가까운 !== m) return null;
  return { a, d, m };
};

const 어림식문항: G5Family = {
  id: 'est-expr',
  make: (seed) => {
    const e = 어림뽑기(seed + 41);
    if (!e) return null;
    const { a, d, m } = e;
    return {
      prompt: `${a}÷${d}의 몫을 어림셈하려고 합니다. 어림셈을 하기 위한 식으로 가장 알맞은 것은 어느 것일까요?`,
      answer: `${m}÷${d}`,
      wrongs: [`${m + 10 * d}÷${d}`, `${m - 10 * d}÷${d}`, `${m}÷${d + 1}`].filter((w) => !w.startsWith('0÷')),
      tag: 'estimate',
      concept: '나눗셈의 몫을 어림할 때는 나누어지는 수를 가깝고 나누는 수로 쉽게 나누어지는 수로 바꿉니다.',
      strategy: '나눗셈의 어림셈 식 세우기',
      hint: `${a}에 가까우면서 ${d}(으)로 쉽게 나누어지는 수를 찾아보세요.`,
      steps: [`${a}에 가까우면서 ${d}(으)로 나누어떨어지는 몇십은 ${m}입니다.`, `그러므로 어림셈을 하기 위한 식은 ${m}÷${d}입니다.`],
      misconceptionTip: '나누는 수를 바꾸면 안 됩니다. 나누어지는 수만 쉬운 수로 바꿉니다.',
    };
  },
};

const 어림값문항: G5Family = {
  id: 'est-value',
  make: (seed) => {
    const e = 어림뽑기(seed + 43);
    if (!e) return null;
    const { a, d, m } = e;
    const v = m / d;
    const s = pick([
      { p: `컵 받침 ${a}개를 한 봉지에 ${d}개씩 담으려고 합니다. 약 몇 봉지에 담을 수 있는지 어림셈으로 구해 보세요.`, u: '봉지' },
      { p: `블록 ${a}개를 주머니 ${d}개에 똑같이 나누어 담으려고 합니다. 한 주머니에 약 몇 개씩 담을 수 있는지 어림셈으로 구해 보세요.`, u: '개' },
    ], seed);
    return {
      prompt: s.p,
      answer: `약 ${v}${s.u}`,
      wrongs: [v + 10, v - 10, v * 10, m * d].filter((w) => w > 0 && w !== v).map((w) => `약 ${w}${s.u}`),
      tag: 'estimate',
      concept: '나누어지는 수를 나누는 수로 쉽게 나누어지는 가까운 수로 바꾸어 몫을 어림합니다.',
      strategy: '나눗셈의 어림셈으로 실생활 문제 해결하기',
      hint: `${a}에 가까우면서 ${d}(으)로 쉽게 나누어지는 수를 찾아 나누어 보세요.`,
      steps: [`${a}은(는) ${m}에 가깝고, ${m}은(는) ${d}(으)로 나누어떨어집니다.`, `${m}÷${d}=${v}이므로 약 ${v}${s.u}입니다.`],
      misconceptionTip: '어림셈에서도 곱하지 않고 나눕니다. 나누는 상황인지 다시 확인하세요.',
    };
  },
};

const 어림판단문항: G5Family = {
  id: 'est-judge',
  make: (seed) => {
    const next = rand(seed + 47);
    const e = 어림뽑기(seed + 47);
    if (!e) return null;
    const { a, d, m } = e;
    const v = m / d;
    const q = Math.floor(a / d);
    const who = pick(이름들, seed);
    // a<m이면 몫은 v보다 작고, a>m이면 몫은 v와 같거나 큽니다. 그 반대쪽 값을 주장하게 합니다.
    const 주장 = a < m ? v + 1 + next(4) : Math.max(1, v - 1 - next(4));
    if (주장 === q) return null;
    const 방향 = a < m ? '작아야' : '작지 않아야';
    return {
      prompt: `${who}은(는) ${a}÷${d}의 몫이 ${주장}(이)라고 말했습니다. 어림셈을 이용하여 판단한 것으로 알맞은 것은 어느 것일까요?`,
      answer: `${a}은(는) ${m}보다 ${a < m ? '작으므로' : '크므로'} 몫은 ${v}보다 ${방향} 합니다. 그래서 바르게 계산하지 않았습니다.`,
      wrongs: [
        `${a}은(는) ${m}에 가까우므로 몫이 ${주장}인 것이 맞습니다.`,
        `${a}÷${d}은(는) 어림할 수 없으므로 판단할 수 없습니다.`,
        `몫은 ${v * 10}에 가까워야 하므로 바르게 계산하지 않았습니다.`,
      ],
      tag: 'estimate',
      concept: '어림한 값과 비교하면 계산한 몫이 타당한지 판단할 수 있습니다. 더 큰 수로 어림했으면 실제 몫은 어림한 몫보다 작습니다.',
      strategy: '어림셈으로 몫이 타당한지 판단하기',
      hint: `${a}을(를) ${d}(으)로 쉽게 나누어지는 가까운 수로 어림해 보세요. 어림한 수가 ${a}보다 큰지 작은지도 보세요.`,
      steps: [`${a}을(를) ${m}(으)로 어림하면 ${m}÷${d}=${v}입니다.`, `${a}은(는) ${m}보다 ${a < m ? '작으므로' : '크므로'} 몫은 ${v}보다 ${방향} 합니다.`, `실제로 ${a}÷${d}=${몫글(q, a % d)}이므로 ${주장}은(는) 틀렸습니다.`],
      misconceptionTip: '어림한 수가 실제 수보다 큰지 작은지에 따라 몫이 어느 쪽이어야 하는지 정해집니다.',
    };
  },
};

// ════════════════════════════════════════════════════════════════════
const 차시꼴: Record<number, Kind> = { 2: 't0', 3: 'n0', 4: 'b0', 5: 'nr', 6: 'br', 8: 'h0', 9: 'hr' };

export const unit2Lesson32 = (lessonNo: number, difficulty: Difficulty): G5Family[] | null => {
  const 하 = difficulty === '하';
  const 상 = difficulty === '상';
  if (lessonNo === 1) return [도입문항];
  if (lessonNo === 7) {
    if (하) return [확인식문항, 어떤수문항];
    if (상) return [맞는계산고르기문항, 어떤수문항, 확인식문항, 고치기문항('br')];
    return [확인식문항, 맞는계산고르기문항, 어떤수문항];
  }
  if (lessonNo === 10) {
    if (하) return [어림식문항, 어림값문항];
    if (상) return [어림판단문항, 어림값문항, 어림식문항];
    return [어림값문항, 어림식문항, 어림판단문항];
  }
  const kind = 차시꼴[lessonNo];
  if (!kind) return null;
  const 세자리 = kind === 'h0' || kind === 'hr';
  const 나머지 = kind === 'nr' || kind === 'br' || kind === 'hr';
  if (하) return [계산문항(kind), 문장제문항(kind, 0), ...(세자리 ? [몫자리문항(kind)] : [부분몫문항(kind)])];
  if (상) {
    return [
      고치기문항(kind),
      문장제문항(kind, 1),
      ...(나머지 ? [적어도문항, 나머지될수없는문항] : []),
      ...(세자리 ? [몫자리문항(kind)] : [계산문항(kind)]),
    ];
  }
  return [
    계산문항(kind),
    문장제문항(kind, 0),
    고치기문항(kind),
    ...(나머지 && !세자리 ? [나머지될수없는문항] : []),
    ...(세자리 ? [몫자리문항(kind)] : [부분몫문항(kind)]),
  ];
};
