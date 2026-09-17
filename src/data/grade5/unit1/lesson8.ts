import type { G5Family } from '../build';
import { estimate, eul, i as iJosa, pick, placeName, rand, roundingName, type Rounding } from '../util';
import { lesson567Easy, lesson567Hard, lesson567Middle } from './lesson567';

// ════════════════════════════════════════════════════════════════════
// 8차시 생활 속에서 올림, 버림, 반올림을 활용해 볼까요
// ────────────────────────────────────────────────────────────────────
// 앞의 세 차시가 방법을 하나씩 배웠다면, 이 차시는 '어느 방법을 쓸지'를
// 스스로 고르는 차시입니다. 지도서도 도시락 상자(올림), 적립 점수(버림),
// 드론 수(반올림)를 나란히 놓고 방법을 고르게 합니다.
//
// 그래서 여기서는 세 방법의 문항을 섞어 씁니다. 방법을 미리 말해 주지
// 않는 문항(어떤 방법으로 어림해야 할까요)이 이 차시의 핵심입니다.
// ════════════════════════════════════════════════════════════════════

const 모든방법: Rounding[] = ['ceil', 'floor', 'round'];

const 섞기 = (families: G5Family[][], prefix: string): G5Family[] =>
  families.flat().map((family, index) => ({ ...family, id: `${prefix}-${index}-${family.id}` }));

export const lesson8Easy: G5Family[] = [
  {
    id: 'name-the-method',
    make: (seed) => {
      const 상황 = pick([
        { 글: '한 봉지에 10개씩 담아 파는 사탕을 사려고 합니다. 사탕 34개가 필요하다면 최소 몇 개를 사야 할까요?', 방법: 'ceil' as Rounding },
        { 글: '공책 137권을 10권씩 묶어 팔려고 합니다. 팔 수 있는 공책은 최대 몇 권일까요?', 방법: 'floor' as Rounding },
        { 글: '몸무게가 42.6 kg인 학생의 몸무게를 일의 자리까지 나타내면 몇 kg일까요?', 방법: 'round' as Rounding },
        { 글: '동전 7480원을 1000원짜리 지폐로 바꾸면 최대 얼마까지 바꿀 수 있을까요?', 방법: 'floor' as Rounding },
        { 글: '우리 마을 사람 수 2846명을 약 몇천 명이라고 하려고 합니다.', 방법: 'round' as Rounding },
        { 글: '학생 128명이 8명씩 앉는 탁자에 모두 앉으려면 탁자는 최소 몇 개 필요할까요?', 방법: 'ceil' as Rounding },
      ], seed);
      return {
        prompt: `다음 상황에서는 어떤 방법으로 어림해야 할까요? "${상황.글}"`,
        answer: roundingName[상황.방법],
        wrongs: [...모든방법.filter((m) => m !== 상황.방법).map((m) => roundingName[m]), '어림하지 않습니다.'],
        tag: 'rounding',
        strategy: '상황에 맞는 어림 방법 고르기',
        hint: '모자라면 안 되는 상황인지, 넘치면 안 되는 상황인지, 가장 가까운 값을 말하려는 상황인지 가려 보세요.',
        steps: [
          상황.방법 === 'ceil'
            ? '모자라면 안 되는 상황이므로 참값보다 큰 쪽으로 어림합니다.'
            : 상황.방법 === 'floor'
              ? '단위가 되지 않는 나머지는 쓸 수 없으므로 참값보다 작은 쪽으로 어림합니다.'
              : '참값에 가장 가깝게 나타내려는 상황입니다.',
          `그러므로 ${roundingName[상황.방법]}으로 어림합니다.`,
        ],
      };
    },
  },
  {
    id: 'guess-the-method',
    make: (seed) => {
      const next = rand(seed);
      const mode = 모든방법[next(3)];
      const exp = pick([1, 2, 3], seed);
      const unit = 10 ** exp;
      const 참값 = unit * (2 + next(8)) + 1 + next(unit - 2);
      const answer = estimate(String(참값), exp, mode);
      // 세 방법의 결과가 서로 달라야 어느 방법을 썼는지 가릴 수 있습니다.
      const 값들 = 모든방법.map((m) => estimate(String(참값), exp, m));
      if (값들.filter((v) => v === answer).length !== 1) return null;
      return {
        prompt: `${eul(String(참값))} 어림하여 ${answer}(으)로 나타내었습니다. 올림, 버림, 반올림 중 어떤 방법으로 어림한 것일까요?`,
        answer: roundingName[mode],
        wrongs: [...모든방법.filter((m) => m !== mode).map((m) => roundingName[m]), '세 방법 모두입니다.'],
        tag: 'rounding',
        strategy: '어림한 결과를 보고 방법 알아내기',
        hint: `${eul(String(참값))} 세 가지 방법으로 각각 ${placeName(exp)}까지 어림해 보고, ${iJosa(answer)} 나오는 방법을 찾으세요.`,
        steps: [
          ...모든방법.map((m) => `${roundingName[m]}하여 ${placeName(exp)}까지 나타내면 ${estimate(String(참값), exp, m)}입니다.`),
          `${iJosa(answer)} 나오는 방법은 ${roundingName[mode]}입니다.`,
        ],
      };
    },
  },
  ...섞기([lesson567Easy('ceil').slice(0, 1), lesson567Easy('floor').slice(0, 1), lesson567Easy('round').slice(0, 1)], 'mix-easy'),
  ...섞기([lesson567Easy('ceil').slice(3, 4), lesson567Easy('round').slice(3, 4)], 'mix-easy-decimal'),
];

export const lesson8Middle: G5Family[] = 섞기(
  [
    lesson567Middle('ceil').slice(0, 2),
    lesson567Middle('floor').slice(0, 2),
    lesson567Middle('round').slice(0, 2),
  ],
  'mix-middle',
);

export const lesson8Hard: G5Family[] = [
  ...섞기(
    [
      lesson567Hard('ceil', ['ceil']).slice(0, 1),
      lesson567Hard('floor', ['floor']).slice(0, 1),
      lesson567Hard('round', ['round']).slice(0, 1),
      lesson567Hard('round', 모든방법).slice(3),
    ],
    'mix-hard',
  ),
  {
    id: 'method-changes-answer',
    make: (seed) => {
      const next = rand(seed);
      const exp = pick([2, 3], seed);
      const unit = 10 ** exp;
      const 참값 = unit * (2 + next(8)) + 1 + next(unit - 2);
      const 올림 = Number(estimate(String(참값), exp, 'ceil'));
      const 버림 = Number(estimate(String(참값), exp, 'floor'));
      if (올림 === 버림) return null;
      return {
        prompt: `${eul(String(참값))} ${placeName(exp)}까지 올림한 값과 버림한 값의 차는 얼마일까요?`,
        answer: String(올림 - 버림),
        wrongs: [String(올림), String(버림), String(참값 - 버림), String(올림 - 참값)],
        tag: 'rounding',
        strategy: '어림 방법에 따라 값이 얼마나 달라지는지 알기',
        hint: '올림한 값과 버림한 값을 각각 구해 나란히 적어 보세요. 두 값의 차가 바로 한 칸의 크기입니다.',
        steps: [
          `${eul(String(참값))} 올림하여 ${placeName(exp)}까지 나타내면 ${올림}입니다.`,
          `${eul(String(참값))} 버림하여 ${placeName(exp)}까지 나타내면 ${버림}입니다.`,
          `${올림} - ${버림} = ${올림 - 버림}입니다. 이 값은 ${placeName(exp)} 한 칸의 크기와 같습니다.`,
        ],
      };
    },
  },
  {
    id: 'minimum-packs',
    make: (seed) => {
      const next = rand(seed);
      const 필요 = 100 + next(400);
      const 한묶음 = pick([12, 15, 24], seed);
      const 묶음수 = Math.ceil(필요 / 한묶음);
      if (필요 % 한묶음 === 0) return null;
      const 남는것 = 묶음수 * 한묶음 - 필요;
      return {
        prompt: `사과 ${필요}개를 한 상자에 ${한묶음}개씩 담으려고 합니다. 상자를 모두 채우고 남는 사과가 없도록 하려면 사과가 적어도 몇 개 더 있어야 할까요?`,
        answer: `${남는것}개`,
        wrongs: [`${필요 % 한묶음}개`, `${한묶음}개`, `${남는것 + 1}개`, `${묶음수}개`],
        tag: 'rounding',
        strategy: '올림한 값과 참값의 차 구하기',
        hint: `${필요} ÷ ${한묶음}의 나머지를 구해 보세요. 한 상자를 다 채우려면 몇 개가 더 있어야 하는지가 보입니다.`,
        steps: [
          `${필요} ÷ ${한묶음} = ${Math.floor(필요 / 한묶음)} … ${필요 % 한묶음}입니다.`,
          `상자를 모두 채우려면 ${묶음수}상자가 되어야 하고, 그때 필요한 사과는 ${묶음수} × ${한묶음} = ${묶음수 * 한묶음}(개)입니다.`,
          `${묶음수 * 한묶음} - ${필요} = ${남는것}이므로 ${남는것}개가 더 있어야 합니다.`,
        ],
      };
    },
  },
];
