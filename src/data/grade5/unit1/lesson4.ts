import type { G5Family } from '../build';
import { eul, eun, gwa, i as iJosa, pick, rand } from '../util';
import { aboveWord, belowWord, inRange, rangeLine, rangeText, type Edge } from './rangeCore';

// ════════════════════════════════════════════════════════════════════
// 4차시 생활 속에서 수의 범위를 활용해 볼까요
// ────────────────────────────────────────────────────────────────────
// 여기서 새로 배우는 것은 '두 가지 수의 범위를 한꺼번에 나타내기'입니다.
// 지도서의 두 활동(올림픽 역도 체급, 학급 티셔츠 치수)이 모두 구간을
// 나눈 표를 읽는 일이고, 표의 각 줄이 곧 '무엇 초과 무엇 이하'입니다.
//
// 구간을 나눈 표에서 가장 잘 걸리는 것은 경계에 딱 걸린 값입니다.
// 58.4 kg이 아니라 59 kg인 선수는 어느 체급인가 — 그래서 문항에
// 경곗값을 반드시 넣습니다.
// ════════════════════════════════════════════════════════════════════

type 구간표 = {
  id: string;
  제목: string;
  단위: string;
  이름: string;
  // 각 줄은 [줄 이름, 아래 경계(없으면 undefined), 위 경계]입니다.
  줄: Array<{ 이름: string; lower?: Edge; upper?: Edge }>;
};

// 지도서 4차시 활동 1: 대한역도연맹 올림픽 여자 체급
const 역도체급: 구간표 = {
  id: 'weightlifting',
  제목: '올림픽 역도 여자 체급',
  단위: 'kg',
  이름: '체급',
  줄: [
    { 이름: '49 kg급', upper: { value: 49, included: true } },
    { 이름: '59 kg급', lower: { value: 49, included: false }, upper: { value: 59, included: true } },
    { 이름: '71 kg급', lower: { value: 59, included: false }, upper: { value: 71, included: true } },
    { 이름: '81 kg급', lower: { value: 71, included: false }, upper: { value: 81, included: true } },
  ],
};

// 지도서 4차시 활동 2: 학급 티셔츠 치수
const 티셔츠치수: 구간표 = {
  id: 'tshirt',
  제목: '학급 티셔츠 치수',
  단위: 'cm',
  이름: '치수',
  줄: [
    { 이름: '11호', lower: { value: 125, included: true }, upper: { value: 135, included: false } },
    { 이름: '13호', lower: { value: 135, included: true }, upper: { value: 145, included: false } },
    { 이름: '15호', lower: { value: 145, included: true }, upper: { value: 155, included: false } },
    { 이름: '17호', lower: { value: 155, included: true }, upper: { value: 165, included: false } },
  ],
};

const 택배요금: 구간표 = {
  id: 'parcel',
  제목: '택배 요금',
  단위: 'kg',
  이름: '요금',
  줄: [
    { 이름: '4000원', upper: { value: 2, included: true } },
    { 이름: '5000원', lower: { value: 2, included: false }, upper: { value: 5, included: true } },
    { 이름: '7000원', lower: { value: 5, included: false }, upper: { value: 10, included: true } },
    { 이름: '9000원', lower: { value: 10, included: false }, upper: { value: 20, included: true } },
  ],
};

const 표들 = [역도체급, 티셔츠치수, 택배요금];

const 표글 = (표: 구간표) =>
  표.줄.map((줄) => `${줄.이름}: ${rangeText(줄.lower, 줄.upper, 표.단위).replace(/인 수$/, '')}`).join(' / ');

const 줄찾기 = (표: 구간표, value: number) => 표.줄.find((줄) => inRange(value, 줄.lower, 줄.upper));

// ── 하 ──────────────────────────────────────────────────────────────
export const lesson4Easy: G5Family[] = [
  {
    id: 'two-sided-meaning',
    make: (seed) => {
      const next = rand(seed);
      const a = 20 + next(20);
      const b = a + 5 + next(15);
      const lowerIncluded = next(2) === 0;
      const upperIncluded = next(2) === 0;
      const lower: Edge = { value: a, included: lowerIncluded };
      const upper: Edge = { value: b, included: upperIncluded };
      const 아래뜻 = (value: number, included: boolean) => (included ? `${gwa(String(value))} 같거나 크고` : `${value}보다 크고`);
      const 위뜻 = (value: number, included: boolean) => (included ? `${gwa(String(value))} 같거나 작은 수` : `${value}보다 작은 수`);
      const 뜻 = `${아래뜻(a, lowerIncluded)} ${위뜻(b, upperIncluded)}`;
      return {
        prompt: `'${rangeText(lower, upper)}'는 어떤 수일까요?`,
        answer: 뜻,
        wrongs: [
          `${아래뜻(a, !lowerIncluded)} ${위뜻(b, upperIncluded)}`,
          `${아래뜻(a, lowerIncluded)} ${위뜻(b, !upperIncluded)}`,
          `${a}보다 작거나 ${b}보다 큰 수`,
        ],
        tag: 'range',
        strategy: '두 가지 수의 범위 읽기',
        hint: '앞쪽 말과 뒤쪽 말을 따로 떼어 읽어 보세요. 두 조건을 동시에 만족하는 수입니다.',
        steps: [
          `${a} ${iJosa(aboveWord(lowerIncluded))} 뜻하는 것은 ${lowerIncluded ? `${gwa(String(a))} 같거나 큰 수` : `${a}보다 큰 수`}입니다.`,
          `${b} ${iJosa(belowWord(upperIncluded))} 뜻하는 것은 ${위뜻(b, upperIncluded)}입니다.`,
          `두 조건을 함께 만족하는 수이므로 ${뜻}입니다.`,
        ],
        visual: rangeLine('수의 범위', 5, lower, upper),
      };
    },
  },
  {
    id: 'read-two-sided-picture',
    make: (seed) => {
      const next = rand(seed);
      const a = (2 + next(8)) * 5;
      const b = a + (2 + next(4)) * 5;
      const lowerIncluded = next(2) === 0;
      const upperIncluded = next(2) === 0;
      const lower: Edge = { value: a, included: lowerIncluded };
      const upper: Edge = { value: b, included: upperIncluded };
      return {
        prompt: '그림이 나타내는 수의 범위는 무엇일까요?',
        answer: rangeText(lower, upper),
        wrongs: [
          rangeText({ value: a, included: !lowerIncluded }, upper),
          rangeText(lower, { value: b, included: !upperIncluded }),
          rangeText({ value: a, included: !lowerIncluded }, { value: b, included: !upperIncluded }),
        ],
        tag: 'range',
        strategy: '그림에서 두 가지 수의 범위 읽기',
        hint: '양쪽 끝의 점을 따로 보세요. 까맣게 칠해진 점과 속이 빈 점이 뜻하는 것이 다릅니다.',
        steps: [
          `왼쪽 끝 점은 ${a} 자리에 있고 ${lowerIncluded ? `까맣게 칠해져 있으므로 ${iJosa(String(a))} 범위에 들어갑니다` : `속이 비어 있으므로 ${eun(String(a))} 범위에 들어가지 않습니다`}.`,
          `오른쪽 끝 점은 ${b} 자리에 있고 ${upperIncluded ? `까맣게 칠해져 있으므로 ${iJosa(String(b))} 범위에 들어갑니다` : `속이 비어 있으므로 ${eun(String(b))} 범위에 들어가지 않습니다`}.`,
          `그러므로 ${rangeText(lower, upper)}입니다.`,
        ],
        visual: rangeLine('수의 범위', 5, lower, upper),
      };
    },
  },
  {
    id: 'count-in-two-sided',
    make: (seed) => {
      const next = rand(seed);
      const a = 20 + next(20);
      const b = a + 6 + next(10);
      const lower: Edge = { value: a, included: next(2) === 0 };
      const upper: Edge = { value: b, included: next(2) === 0 };
      const values = [a - 2, a, Math.floor((a + b) / 2), b, b + 3];
      const 드는것 = values.filter((v) => inRange(v, lower, upper));
      const 양끝포함 = values.filter((v) => inRange(v, { value: a, included: true }, { value: b, included: true }));
      if (드는것.length === 양끝포함.length) return null;
      return {
        prompt: `수 ${values.join(', ')} 중에서 ${rangeText(lower, upper)}에 들어가는 수는 모두 몇 개일까요?`,
        answer: `${드는것.length}개`,
        wrongs: [`${양끝포함.length}개`, `${values.length - 드는것.length}개`, `${드는것.length + 1}개`, `${values.length}개`],
        tag: 'range',
        strategy: '두 가지 수의 범위에 들어가는 수 세기',
        hint: `양쪽 끝의 수 ${gwa(String(a))} ${eul(String(b))} 먼저 살펴보세요. 나머지 수는 대개 헷갈리지 않습니다.`,
        steps: [
          `${rangeText(lower, upper)}는 ${a} ${aboveWord(lower.included)}이면서 ${b} ${belowWord(upper.included)}인 수입니다.`,
          드는것.length
            ? `보기의 수를 하나씩 넣어 보면 ${iJosa(드는것.join(', '))} 조건에 맞습니다.`
            : '보기의 수를 하나씩 넣어 보면 조건에 맞는 수가 없습니다.',
          `그러므로 ${드는것.length}개입니다.`,
        ],
        visual: rangeLine('수의 범위', Math.max(1, Math.round((b - a) / 4)), lower, upper),
      };
    },
  },
];

// ── 중 ──────────────────────────────────────────────────────────────
export const lesson4Middle: G5Family[] = [
  {
    id: 'which-row',
    make: (seed) => {
      const next = rand(seed);
      const 표 = pick(표들, seed);
      const 줄 = 표.줄[1 + next(표.줄.length - 1)];
      if (!줄.lower || !줄.upper) return null;
      // 경계에 딱 걸린 값을 넣습니다. 이 표들은 모두 '초과 ~ 이하'거나
      // '이상 ~ 미만'이라, 경곗값이 어느 줄에 속하는지가 시험대입니다.
      const 값 = next(2) === 0 ? 줄.upper.value : 줄.lower.value + (줄.upper.value - 줄.lower.value) / 2;
      const 정답줄 = 줄찾기(표, 값);
      if (!정답줄) return null;
      return {
        prompt: `${표.제목}입니다. ${표글(표)}. ${표.단위 === 'cm' ? '키' : '무게'}가 ${값} ${표.단위}이면 어느 ${표.이름}일까요?`,
        answer: 정답줄.이름,
        wrongs: 표.줄.filter((행) => 행.이름 !== 정답줄.이름).map((행) => 행.이름),
        tag: 'range',
        strategy: '구간으로 나눈 표에서 알맞은 줄 찾기',
        hint: `${값} ${iJosa(표.단위)} 어느 줄의 두 경곗값 사이에 들어가는지 찾되, 경곗값과 똑같은 값이면 그 줄이 그 수를 넣는지 확인하세요.`,
        steps: [
          `표의 각 줄은 ${표.단위} 값의 범위를 나타냅니다.`,
          `${정답줄.이름}의 범위는 ${rangeText(정답줄.lower, 정답줄.upper, 표.단위)}입니다.`,
          `${값} ${iJosa(표.단위)} 이 범위에 들어가므로 답은 ${정답줄.이름}입니다.`,
        ],
        // 그림을 넣지 않습니다. 정답인 줄의 범위를 그려 주면 그림이
        // 곧 답이 되어, 표를 읽지 않고도 고를 수 있습니다. 표는 이미
        // 문제 글에 그대로 들어 있습니다.
      };
    },
  },
  {
    id: 'row-to-range',
    make: (seed) => {
      const next = rand(seed);
      const 표 = pick(표들, seed + 1);
      const 줄 = 표.줄[1 + next(표.줄.length - 1)];
      if (!줄.lower || !줄.upper) return null;
      const answer = rangeText(줄.lower, 줄.upper, 표.단위);
      return {
        prompt: `${표.제목}에서 ${줄.이름}에 해당하는 범위를 바르게 나타낸 것은 어느 것일까요? (${표글(표)})`,
        answer,
        wrongs: [
          rangeText({ value: 줄.lower.value, included: !줄.lower.included }, 줄.upper, 표.단위),
          rangeText(줄.lower, { value: 줄.upper.value, included: !줄.upper.included }, 표.단위),
          rangeText(
            { value: 줄.lower.value, included: !줄.lower.included },
            { value: 줄.upper.value, included: !줄.upper.included },
            표.단위,
          ),
        ],
        tag: 'range',
        strategy: '표의 한 줄을 수의 범위로 나타내기',
        hint: '바로 위 줄이 어디서 끝나는지 보세요. 위 줄이 끝난 값이 이 줄에 들어가는지 아닌지가 정해집니다.',
        steps: [
          `${줄.이름}의 아래쪽 경계는 ${줄.lower.value} ${표.단위}이고, 이 값은 ${줄.lower.included ? '범위에 들어갑니다' : '앞 줄에 속하므로 범위에 들어가지 않습니다'}.`,
          `위쪽 경계는 ${줄.upper.value} ${표.단위}이고, 이 값은 ${줄.upper.included ? '이 줄에 속하므로 범위에 들어갑니다' : '다음 줄에 속하므로 범위에 들어가지 않습니다'}.`,
          `그러므로 ${answer}입니다.`,
        ],
      };
    },
  },
  {
    id: 'count-people-in-row',
    make: (seed) => {
      const next = rand(seed);
      const 표 = 티셔츠치수;
      const 줄 = 표.줄[next(표.줄.length)];
      if (!줄.lower || !줄.upper) return null;
      const 사람 = ['우리', '주원', '지수', '수현', '민규'];
      const 키 = [줄.lower.value, 줄.upper.value, 줄.lower.value + 4, 줄.lower.value - 2, 줄.upper.value + 3];
      const 드는사람 = 사람.filter((_, index) => inRange(키[index], 줄.lower, 줄.upper));
      const 양끝포함 = 사람.filter((_, index) =>
        inRange(키[index], { value: 줄.lower!.value, included: true }, { value: 줄.upper!.value, included: true }),
      );
      if (드는사람.length === 양끝포함.length) return null;
      return {
        prompt: `${표.제목}는 ${표글(표)}입니다. ${사람.map((이름, index) => `${이름} ${키[index]} cm`).join(', ')}일 때 ${줄.이름} 티셔츠를 입는 학생은 모두 몇 명일까요?`,
        answer: `${드는사람.length}명`,
        wrongs: [
          `${양끝포함.length}명`,
          `${사람.length - 드는사람.length}명`,
          `${드는사람.length + 1}명`,
          `${Math.max(0, 드는사람.length - 1)}명`,
          `${사람.length}명`,
          '1명',
        ],
        tag: 'range',
        strategy: '구간별로 자료를 나누기',
        hint: `${줄.이름}의 범위를 먼저 적어 놓고 키를 하나씩 견주어 보세요. 경계와 똑같은 키가 있는지 눈여겨보세요.`,
        steps: [
          `${줄.이름}의 범위는 ${rangeText(줄.lower, 줄.upper, 'cm')}입니다.`,
          드는사람.length
            ? `${사람.map((이름, index) => `${이름}(${키[index]} cm)`).join(', ')}을 하나씩 살펴보면 ${iJosa(드는사람.join(', '))} 이 범위에 들어갑니다.`
            : `${사람.map((이름, index) => `${이름}(${키[index]} cm)`).join(', ')}을 하나씩 살펴보면 이 범위에 드는 학생이 없습니다.`,
          `그러므로 ${드는사람.length}명입니다.`,
        ],
      };
    },
  },
  {
    id: 'parcel-fee',
    make: (seed) => {
      const next = rand(seed);
      const 표 = 택배요금;
      const 줄 = 표.줄[next(표.줄.length)];
      // 경곗값만 묻지 않고 구간 안쪽의 무게도 묻습니다. 경곗값만 나오면
      // 아이가 '표의 오른쪽 수를 찾으면 된다'는 요령만 익힙니다.
      const 아래 = 줄.lower?.value ?? 0;
      const 위 = 줄.upper?.value ?? 아래 + 1;
      const 값 = next(2) === 0 ? 위 : Math.min(위, 아래 + 1 + next(Math.max(1, 위 - 아래 - 1)));
      const 정답줄 = 줄찾기(표, 값);
      if (!정답줄) return null;
      return {
        prompt: `택배 요금은 ${표글(표)}입니다. 무게가 ${값} kg인 상자를 보내려면 요금은 얼마일까요?`,
        answer: 정답줄.이름,
        wrongs: 표.줄.filter((행) => 행.이름 !== 정답줄.이름).map((행) => 행.이름),
        tag: 'range',
        strategy: '요금표에서 알맞은 요금 찾기',
        hint: `${값} ${iJosa('kg')} 어느 줄의 경계와 같은지 먼저 보세요. '이하'로 끝나는 줄은 그 경곗값까지 자기 줄입니다.`,
        steps: [
          `${정답줄.이름} 줄의 범위는 ${rangeText(정답줄.lower, 정답줄.upper, 'kg')}입니다.`,
          `${값} ${iJosa('kg')} 이 범위에 들어갑니다.`,
          `그러므로 요금은 ${정답줄.이름}입니다.`,
        ],
      };
    },
  },
  {
    id: 'count-rows-between',
    make: (seed) => {
      const next = rand(seed);
      const 표 = pick(표들, seed + 5);
      const 이름표 = ['가', '나', '다', '라', '마'];
      const 줄 = 표.줄[1 + next(표.줄.length - 1)];
      if (!줄.lower || !줄.upper) return null;
      const 값 = [줄.lower.value, 줄.upper.value, 줄.lower.value + 1, 줄.upper.value + 1, 줄.lower.value - 1];
      const 드는것 = 값.filter((v) => inRange(v, 줄.lower, 줄.upper));
      const 양끝포함 = 값.filter((v) =>
        inRange(v, { value: 줄.lower!.value, included: true }, { value: 줄.upper!.value, included: true }),
      );
      if (드는것.length === 양끝포함.length || 드는것.length === 0) return null;
      return {
        prompt: `${표.제목}는 ${표글(표)}입니다. 조사한 값이 ${값.map((v, index) => `${이름표[index]} ${v} ${표.단위}`).join(', ')}일 때 ${줄.이름}에 해당하는 것은 모두 몇 개일까요?`,
        answer: `${드는것.length}개`,
        wrongs: [
          `${양끝포함.length}개`,
          `${값.length - 드는것.length}개`,
          `${드는것.length + 1}개`,
          `${Math.max(0, 드는것.length - 1)}개`,
          `${값.length}개`,
        ],
        tag: 'range',
        strategy: '구간에 드는 것의 개수 세기',
        hint: `묻는 ${표.이름}의 범위를 표에서 찾아 먼저 적고, 경계에 딱 걸린 값부터 살펴보세요.`,
        steps: [
          `${줄.이름}의 범위는 ${rangeText(줄.lower, 줄.upper, 표.단위)}입니다.`,
          `주어진 값 가운데 이 범위에 드는 것은 ${드는것.join(', ')}입니다.`,
          `그러므로 ${드는것.length}개입니다.`,
        ],
      };
    },
  },
];

// ── 상 ──────────────────────────────────────────────────────────────
export const lesson4Hard: G5Family[] = [
  {
    id: 'count-naturals',
    make: (seed) => {
      const next = rand(seed);
      const a = 20 + next(30);
      const b = a + 8 + next(20);
      const lowerIncluded = next(2) === 0;
      const upperIncluded = next(2) === 0;
      const lower: Edge = { value: a, included: lowerIncluded };
      const upper: Edge = { value: b, included: upperIncluded };
      const 처음 = lowerIncluded ? a : a + 1;
      const 끝 = upperIncluded ? b : b - 1;
      const 개수 = 끝 - 처음 + 1;
      const 양끝 = b - a + 1;
      if (개수 === 양끝) return null;
      return {
        prompt: `${rangeText(lower, upper)}인 자연수는 모두 몇 개일까요?`,
        answer: `${개수}개`,
        wrongs: [`${양끝}개`, `${b - a}개`, `${개수 + 1}개`, `${개수 - 1}개`],
        tag: 'range',
        strategy: '범위 안의 자연수 개수 구하기',
        hint: '가장 작은 수와 가장 큰 수를 먼저 적고, (큰 수) - (작은 수) + 1로 세어 보세요.',
        steps: [
          `${a} ${aboveWord(lowerIncluded)}이므로 가장 작은 자연수는 ${처음}입니다.`,
          `${b} ${belowWord(upperIncluded)}이므로 가장 큰 자연수는 ${끝}입니다.`,
          `${처음}부터 ${끝}까지의 자연수는 ${끝} - ${처음} + 1 = ${개수}(개)입니다.`,
        ],
        visual: rangeLine('수의 범위', Math.max(1, Math.round((b - a) / 5)), lower, upper),
      };
    },
  },
  {
    id: 'find-boundary',
    make: (seed) => {
      const next = rand(seed);
      const 표 = pick([역도체급, 티셔츠치수], seed);
      const 줄 = 표.줄[1 + next(표.줄.length - 1)];
      if (!줄.lower || !줄.upper) return null;
      const 가장작은 = 줄.lower.included ? 줄.lower.value : 줄.lower.value + 1;
      const 가장큰 = 줄.upper.included ? 줄.upper.value : 줄.upper.value - 1;
      const 묻는것 = next(2) === 0;
      return {
        prompt: `${표.제목}에서 ${줄.이름}에 속하려면 ${표.단위=== 'cm' ? '키' : '몸무게'}가 ${묻는것 ? '적어도' : '많아야'} 몇 ${표.단위}이어야 할까요? (자연수로 답합니다. ${표글(표)})`,
        answer: `${묻는것 ? 가장작은 : 가장큰} ${표.단위}`,
        wrongs: [
          `${묻는것 ? 줄.lower.value : 줄.upper.value} ${표.단위}`,
          `${묻는것 ? 가장작은 + 1 : 가장큰 - 1} ${표.단위}`,
          `${묻는것 ? 줄.upper.value : 줄.lower.value} ${표.단위}`,
          `${묻는것 ? 가장작은 - 1 : 가장큰 + 1} ${표.단위}`,
        ],
        tag: 'range',
        strategy: '구간의 경계가 되는 값 구하기',
        hint: `묻는 ${표.이름}의 범위를 표에서 찾아 먼저 적고, 경곗값 자신이 그 범위에 들어가는지를 확인하세요.`,
        steps: [
          `${줄.이름}의 범위는 ${rangeText(줄.lower, 줄.upper, 표.단위)}입니다.`,
          묻는것
            ? `아래쪽 경계 ${줄.lower.value} ${iJosa(표.단위)} ${줄.lower.included ? '범위에 들어가므로 가장 작은 값은 ' + 줄.lower.value : '범위에 들어가지 않으므로 가장 작은 자연수는 ' + 가장작은}입니다.`
            : `위쪽 경계 ${줄.upper.value} ${iJosa(표.단위)} ${줄.upper.included ? '범위에 들어가므로 가장 큰 값은 ' + 줄.upper.value : '범위에 들어가지 않으므로 가장 큰 자연수는 ' + 가장큰}입니다.`,
          `그러므로 ${묻는것 ? 가장작은 : 가장큰} ${표.단위}입니다.`,
        ],
      };
    },
  },
  {
    id: 'same-row',
    make: (seed) => {
      const next = rand(seed);
      const 표 = 역도체급;
      const 줄 = 표.줄[1 + next(3)];
      if (!줄.lower || !줄.upper) return null;
      const 선수 = ['가 선수', '나 선수', '다 선수', '라 선수'];
      const 무게 = [
        줄.upper.value,
        줄.lower.value,
        줄.lower.value + 1,
        줄.upper.value + 1,
      ];
      const 같은줄 = 선수.filter((_, index) => 줄찾기(표, 무게[index])?.이름 === 줄.이름);
      if (같은줄.length !== 2) return null;
      const 아닌사람 = 선수.filter((이름) => !같은줄.includes(이름));
      return {
        prompt: `${표.제목}은 ${표글(표)}입니다. ${선수.map((이름, index) => `${이름} ${무게[index]} kg`).join(', ')}일 때, ${줄.이름}에 속하지 않는 선수를 모두 고르면 몇 명일까요?`,
        answer: `${아닌사람.length}명`,
        wrongs: [`${같은줄.length}명`, `${선수.length}명`, `${아닌사람.length + 1}명`, '0명'],
        tag: 'range',
        strategy: '경곗값이 어느 구간에 속하는지 판단하기',
        hint: `${줄.lower.value} kg${gwa(String(줄.lower.value))} ${줄.upper.value} kg처럼 경계에 딱 걸린 무게를 먼저 살펴보세요. 이 표는 '초과 ~ 이하'로 나누어져 있습니다.`,
        steps: [
          `${줄.이름}의 범위는 ${rangeText(줄.lower, 줄.upper, 'kg')}입니다.`,
          `${줄.lower.value} kg은 ${줄.lower.included ? '이 체급에 속합니다' : '앞 체급에 속합니다'}. ${줄.upper.value} kg은 ${줄.upper.included ? '이 체급에 속합니다' : '다음 체급에 속합니다'}.`,
          `${줄.이름}에 속하지 않는 선수는 ${아닌사람.join(', ')}이므로 ${아닌사람.length}명입니다.`,
        ],
      };
    },
  },
  {
    id: 'combine-two-ranges',
    make: (seed) => {
      const next = rand(seed);
      const a = 30 + next(20);
      const b = a + 10 + next(10);
      const lower: Edge = { value: a, included: next(2) === 0 };
      const upper: Edge = { value: b, included: next(2) === 0 };
      return {
        prompt: `${a} ${aboveWord(lower.included)}인 수이면서 ${b} ${belowWord(upper.included)}인 수를 한 번에 나타낸 것은 어느 것일까요?`,
        answer: rangeText(lower, upper),
        wrongs: [
          rangeText({ value: a, included: !lower.included }, upper),
          rangeText(lower, { value: b, included: !upper.included }),
          rangeText({ value: b, included: upper.included }, { value: a, included: lower.included }),
        ],
        tag: 'range',
        strategy: '두 범위를 하나로 합쳐 나타내기',
        hint: '작은 수를 앞에, 큰 수를 뒤에 씁니다. 각 수에 붙은 말은 그대로 가져옵니다.',
        steps: [
          `앞의 조건은 ${a} ${aboveWord(lower.included)}, 뒤의 조건은 ${b} ${belowWord(upper.included)}입니다.`,
          '두 조건을 함께 만족하는 수이므로 작은 수를 앞에 두고 이어서 씁니다.',
          `그러므로 ${rangeText(lower, upper)}입니다.`,
        ],
        visual: rangeLine('수의 범위', Math.max(1, Math.round((b - a) / 4)), lower, upper),
      };
    },
  },
];
