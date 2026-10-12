import type { Difficulty } from '../../types';
import type { G5Family } from '../grade5/build';
import { eul, eun } from '../grade5/util';
import { 고르개, 사이, 수보기, 우리말로, 한자어로 } from '../grade11/common';
import { 두단계수, 사이개수, 수카드몇십몇, 짝홀사이 } from '../grade1/thinking';

// ════════════════════════════════════════════════════════════════════
// 1-2 1단원 100까지의 수
// ────────────────────────────────────────────────────────────────────
// 단원 전개 계획:
//   1 단원 도입
//   2 60, 70, 80, 90을 알아볼까요   — 육십(예순), 칠십(일흔), 팔십(여든), 구십(아흔)
//   3 99까지의 수를 알아볼까요      — 10개씩 묶음과 낱개
//   4 수를 넣어 이야기를 해 볼까요  — 장면에 어울리게 읽기
//   5 수의 순서를 알아볼까요        — 99 다음 100(백)
//   6 수의 크기를 비교해 볼까요     — >, <
//   7 짝수와 홀수를 알아볼까요      — 20 이하, 둘씩 짝짓기
//
// 유의 사항:
//   · 수를 한글로 쓰게 하지 않습니다 — 읽은 것을 고르게 합니다.
//   · 한자어와 우리말을 섞어 읽지 않습니다(육십일곱 ✗).
//   · 개수는 우리말(예순일곱 개), 번호는 한자어(육십칠 번)로 읽습니다.
//   · 짝수와 홀수는 20 이하에서만 다룹니다.
// ════════════════════════════════════════════════════════════════════

const 묶음그림 = (n: number) => ({ kind: 'tens-ones' as const, label: '10개씩 묶음과 낱개', tens: Math.floor(n / 10), ones: n % 10 });

const 그림수 = (id: string, lo: number, hi: number, onlyTens = false): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = onlyTens ? 사이(next, lo / 10, hi / 10) * 10 : 사이(next, lo, hi);
    const t = Math.floor(n / 10);
    const o = n % 10;
    return {
      prompt: '그림이 나타내는 수는 얼마일까요?',
      answer: String(n),
      wrongs: 수보기(n, [o * 10 + t, t + o, n + 10, n - 10, n + 1, t], 1, 100),
      tag: 'number',
      strategy: '10개씩 묶음과 낱개로 세기',
      hint: '10개씩 묶음이 몇 개인지, 낱개가 몇 개인지 따로 세어 보세요.',
      steps: [`10개씩 묶음이 ${t}개, 낱개가 ${o}개입니다.`, `그러므로 ${n}입니다.`],
      misconceptionTip: '10개씩 묶음 하나는 10이에요. 묶음의 수가 앞자리예요.',
      visual: 묶음그림(n),
    };
  },
});

const 묶음으로 = (id: string, lo: number, hi: number, onlyTens = false): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = onlyTens ? 사이(next, lo / 10, hi / 10) * 10 : 사이(next, lo, hi);
    const t = Math.floor(n / 10);
    const o = n % 10;
    const 거꾸로 = next(2) === 0;
    if (거꾸로) {
      if (onlyTens) {
        return {
          prompt: `${eun(String(n))} 10개씩 묶음 몇 개일까요?`,
          answer: `${t}개`,
          wrongs: [n, t + 1, t - 1, 10].filter((v) => v > 0 && v !== t).map((v) => `${v}개`),
          tag: 'number',
          strategy: '몇십을 10개씩 묶음으로 나타내기',
          hint: '10, 20, 30 …처럼 10씩 세어 보세요.',
          steps: [`10씩 ${t}번 세면 ${n}입니다.`, `그러므로 10개씩 묶음 ${t}개입니다.`],
        };
      }
      if (o === 0 || o === t) return null;
      return {
        prompt: `${eun(String(n))} 10개씩 묶음 몇 개와 낱개 몇 개일까요?`,
        answer: `묶음 ${t}개, 낱개 ${o}개`,
        wrongs: [`묶음 ${o}개, 낱개 ${t}개`, `묶음 ${t}개, 낱개 ${o + 1}개`, `묶음 ${t - 1}개, 낱개 ${o}개`],
        tag: 'number',
        strategy: '수를 묶음과 낱개로 나타내기',
        hint: '앞의 숫자는 10개씩 묶음, 뒤의 숫자는 낱개예요.',
        steps: [`${n}의 앞 숫자 ${t}은(는) 10개씩 묶음의 수, 뒤 숫자 ${o}은(는) 낱개의 수입니다.`, `그러므로 묶음 ${t}개, 낱개 ${o}개입니다.`],
      };
    }
    return {
      prompt: onlyTens ? `10개씩 묶음 ${t}개는 얼마일까요?` : `10개씩 묶음 ${t}개와 낱개 ${o}개인 수는 얼마일까요?`,
      answer: String(n),
      wrongs: 수보기(n, [o * 10 + t, t + o, t, n + 10, n + 1, n - 1], 1, 100),
      tag: 'number',
      strategy: '묶음과 낱개로 수 쓰기',
      hint: '10개씩 묶음의 수를 앞에, 낱개의 수를 뒤에 써요.',
      steps: onlyTens ? [`10개씩 묶음 ${t}개는 ${n}입니다.`] : [`10개씩 묶음 ${t}개는 ${t * 10}입니다.`, `${t * 10}과(와) 낱개 ${o}개를 합하면 ${n}입니다.`],
      misconceptionTip: '묶음의 수와 낱개의 수를 더하면 안 돼요.',
    };
  },
});

const 읽기 = (id: string, lo: number, hi: number, onlyTens = false): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const n = onlyTens ? 사이(next, lo / 10, hi / 10) * 10 : 사이(next, lo, hi);
    const t = Math.floor(n / 10);
    const o = n % 10;
    const 우리 = next(2) === 0;
    const ans = 우리 ? 우리말로(n) : 한자어로(n);
    const 한자낱 = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const 우리낱 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
    const 섞기 = o === 0
      ? (우리 ? `${우리낱[t]}십` : `${한자낱[t]}영`)
      : 우리 ? `${우리말로(t * 10)}${한자낱[o]}` : `${한자어로(t * 10)}${우리낱[o]}`;
    const 이웃 = 우리 ? 우리말로(n + 1 <= 99 ? n + 1 : n - 1) : 한자어로(n + 1 <= 99 ? n + 1 : n - 1);
    const 바꿈수 = o === 0 || o === t ? (n - 10 >= 10 ? n - 10 : n + 10) : o * 10 + t;
    const 바꿈 = 우리 ? 우리말로(바꿈수) : 한자어로(바꿈수);
    return {
      prompt: `${eul(String(n))} ${우리 ? '하나, 둘처럼 세는 말로' : '일, 이처럼 세는 말로'} 바르게 읽은 것은 어느 것일까요?`,
      answer: ans,
      wrongs: [섞기, 이웃, 바꿈],
      tag: 'number',
      strategy: '두 자리 수 읽기',
      hint: 우리 ? '열, 스물, 서른, 마흔, 쉰, 예순, 일흔, 여든, 아흔을 떠올려 보세요.' : '십, 이십, 삼십 … 구십을 떠올려 보세요.',
      steps: [`${n}은(는) ${한자어로(n)} 또는 ${우리말로(n)}(이)라고 읽습니다.`, `그러므로 ${ans}입니다.`],
      misconceptionTip: '한자어와 우리말을 섞어 읽지 않아요. 육십일곱이 아니라 육십칠 또는 예순일곱이에요.',
    };
  },
});

// 수를 넣어 이야기하기: 개수는 우리말, 번호는 한자어입니다.
const 장면읽기: G5Family = {
  id: 'context-read',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 51, 99);
    if (n % 10 === 0) return null;
    const 개수 = next(2) === 0;
    const 장면 = 개수
      ? [`귤이 ${n}개 있습니다.`, `운동장에 학생이 ${n}명 있습니다.`, `색종이가 ${n}장 있습니다.`][next(3)]
      : [`${n}번 버스를 탔습니다.`, `내 사물함은 ${n}번입니다.`, `${n}번 자리에 앉았습니다.`][next(3)];
    const 한 = 한자어로(n);
    const 우 = 우리말로(n);
    const t = Math.floor(n / 10);
    const 섞기 = 개수 ? `${한자어로(t * 10)}${['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'][n % 10]}` : `${우리말로(t * 10)}${['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'][n % 10]}`;
    return {
      prompt: `‘${장면}’에서 ${eul(String(n))} 알맞게 읽은 것은 어느 것일까요?`,
      answer: 개수 ? 우 : 한,
      wrongs: [개수 ? 한 : 우, 섞기, 개수 ? 우리말로(n + 1 <= 99 ? n + 1 : n - 1) : 한자어로(n + 1 <= 99 ? n + 1 : n - 1)],
      tag: 'number',
      strategy: '장면에 어울리게 수 읽기',
      hint: 개수 ? '물건이나 사람의 수를 셀 때는 하나, 둘처럼 읽어요.' : '번호를 말할 때는 일, 이처럼 읽어요.',
      steps: [개수 ? `개수를 나타내므로 하나, 둘처럼 세는 말로 읽습니다.` : `번호를 나타내므로 일, 이처럼 세는 말로 읽습니다.`, `그러므로 ${개수 ? 우 : 한}입니다.`],
      misconceptionTip: '번호는 육십칠 번, 개수는 예순일곱 개처럼 읽어요.',
    };
  },
};

// ── 순서 ────────────────────────────────────────────────────────────
const 순서카드 = (id: string, down: boolean): G5Family => ({
  id,
  make: (seed) => {
    const next = 고르개(seed);
    const len = 5;
    const start = down ? 사이(next, 55, 100) : 사이(next, 50, 96);
    const seq = Array.from({ length: len }, (_, k) => (down ? start - k : start + k));
    const crossing = seq.findIndex((v) => v % 10 === 0);
    const miss = crossing > 0 && next(2) === 0 ? crossing : 사이(next, 1, len - 1);
    const ans = seq[miss];
    return {
      prompt: down ? '수를 거꾸로 세었습니다. ?에 알맞은 수는 무엇일까요?' : '수를 순서대로 놓았습니다. ?에 알맞은 수는 무엇일까요?',
      answer: String(ans),
      wrongs: 수보기(ans, [ans + 1, ans - 1, ans + 10, ans - 10, ans === 100 ? 910 : ans + 2], 1, 100).filter((w) => w !== '910'),
      tag: 'number',
      strategy: down ? '100까지 거꾸로 세기' : '100까지 순서대로 세기',
      hint: `${seq[miss - 1]}보다 1만큼 더 ${down ? '작은' : '큰'} 수를 생각해 보세요.`,
      steps: [`${seq[miss - 1]}보다 1만큼 더 ${down ? '작은' : '큰'} 수는 ${ans}입니다.`, `그러므로 ?에 알맞은 수는 ${ans}입니다.`],
      misconceptionTip: '69 다음은 70이에요. 낱개가 10개가 되면 10개씩 묶음이 하나 늘어요.',
      visual: { kind: 'pattern', label: '수 카드', items: seq.map(String), missingIndex: miss },
    };
  },
});

const 백: G5Family = {
  id: 'hundred',
  make: (seed) => {
    const which = seed % 3;
    if (which === 0) {
      return {
        prompt: '99보다 1만큼 더 큰 수는 무엇일까요?',
        answer: '100',
        wrongs: ['98', '910', '90'],
        tag: 'number',
        strategy: '100 알기',
        hint: '99 바로 다음 수를 생각해 보세요.',
        steps: ['99보다 1만큼 더 큰 수를 100이라 쓰고 백이라고 읽습니다.'],
        misconceptionTip: '99 다음 수를 910이라고 쓰지 않아요.',
      };
    }
    if (which === 1) {
      return {
        prompt: '100을 바르게 읽은 것은 어느 것일까요?',
        answer: '백',
        wrongs: ['십', '일영영', '구십구'],
        tag: 'number',
        strategy: '100 읽기',
        hint: '99보다 1만큼 더 큰 수예요.',
        steps: ['100은 백이라고 읽습니다.'],
      };
    }
    return {
      prompt: '10개씩 묶음 10개는 얼마일까요?',
      answer: '100',
      wrongs: ['10', '1010', '90'],
      tag: 'number',
      strategy: '10개씩 묶음 10개',
      hint: '10, 20, 30 …으로 10번 세어 보세요.',
      steps: ['10씩 10번 세면 10, 20, 30, 40, 50, 60, 70, 80, 90, 100입니다.', '그러므로 100입니다.'],
      visual: 묶음그림(100),
    };
  },
};

const 하나큰작은: G5Family = {
  id: 'one-more-less',
  make: (seed) => {
    const next = 고르개(seed);
    const bigger = next(2) === 0;
    const n = 사이(next, 51, 99);
    const ans = bigger ? n + 1 : n - 1;
    return {
      prompt: `${n}보다 1만큼 더 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: 수보기(ans, [bigger ? n - 1 : n + 1, n + (bigger ? 10 : -10), n, bigger ? n + 2 : n - 2], 1, 100),
      tag: 'number',
      strategy: '1만큼 더 큰 수와 1만큼 더 작은 수',
      hint: bigger ? `${n} 바로 다음 수를 생각해 보세요.` : `${n} 바로 앞의 수를 생각해 보세요.`,
      steps: [`${n} 바로 ${bigger ? '다음' : '앞의'} 수는 ${ans}입니다.`, `그러므로 ${ans}입니다.`],
      misconceptionTip: '1만큼은 낱개 하나예요. 10개씩 묶음이 바뀌는 것이 아니에요.',
    };
  },
};

// ── 크기 비교(>, <) ─────────────────────────────────────────────────
const 부등호: G5Family = {
  id: 'inequality',
  make: (seed, lv) => {
    const next = 고르개(seed);
    const sameTens = lv !== '하' && next(2) === 0;
    const a = 사이(next, 51, 98);
    let b = sameTens ? Math.floor(a / 10) * 10 + 사이(next, 0, 9) : 사이(next, 51, 99);
    if (b === a) b = a + 1;
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    // 참인 문장은 하나만 둡니다. 'a > b'가 답이면 'b < a'는 넣지 않습니다.
    const first = next(2) === 0;
    const answer = first ? `${big} > ${small}` : `${small} < ${big}`;
    const wrongs = first ? [`${big} < ${small}`, `${small} > ${big}`, `${big} = ${small}`] : [`${small} > ${big}`, `${big} < ${small}`, `${small} = ${big}`];
    return {
      prompt: '두 수의 크기를 바르게 나타낸 것은 어느 것일까요?',
      answer,
      wrongs,
      tag: 'number',
      strategy: '>, <로 크기 나타내기',
      hint: '10개씩 묶음의 수를 먼저 견주고, 같으면 낱개의 수를 견주어 보세요. 벌어진 쪽에 큰 수가 와요.',
      steps: [Math.floor(a / 10) === Math.floor(b / 10) ? `10개씩 묶음의 수가 같으므로 낱개를 견주면 ${big}이(가) 더 큽니다.` : `10개씩 묶음의 수를 견주면 ${big}이(가) 더 큽니다.`, `${big} > ${small} 또는 ${small} < ${big}(으)로 나타냅니다.`, `그러므로 ${answer}입니다.`],
      misconceptionTip: '>와 <는 벌어진 쪽이 큰 수를 향해요.',
    };
  },
};

const 가장큰수: G5Family = {
  id: 'cmp-three',
  make: (seed) => {
    const next = 고르개(seed);
    const t = 사이(next, 6, 9);
    const nums = [t * 10 + 사이(next, 0, 4), t * 10 + 사이(next, 5, 9), (t - 1) * 10 + 9];
    if (new Set(nums).size < 3) return null;
    for (let k = nums.length - 1; k > 0; k -= 1) {
      const j = next(k + 1);
      [nums[k], nums[j]] = [nums[j], nums[k]];
    }
    const bigger = next(2) === 0;
    const ans = bigger ? Math.max(...nums) : Math.min(...nums);
    return {
      prompt: `${nums.join(', ')} 가운데 가장 ${bigger ? '큰' : '작은'} 수는 무엇일까요?`,
      answer: String(ans),
      wrongs: [...nums.filter((v) => v !== ans).map(String), String(t * 10)].filter((v) => v !== String(ans)),
      tag: 'number',
      strategy: '세 수의 크기 비교',
      hint: '10개씩 묶음의 수를 먼저 견주고, 같으면 낱개의 수를 견주어 보세요.',
      steps: [`작은 수부터 늘어놓으면 ${[...nums].sort((x, y) => x - y).join(', ')}입니다.`, `그러므로 가장 ${bigger ? '큰' : '작은'} 수는 ${ans}입니다.`],
      misconceptionTip: '낱개가 9라도 10개씩 묶음이 적으면 더 작은 수예요.',
    };
  },
};

// ── 짝수와 홀수(20 이하) ────────────────────────────────────────────
const 짝짓기그림: G5Family = {
  id: 'even-odd-pic',
  make: (seed) => {
    const next = 고르개(seed);
    const n = 사이(next, 5, 16);
    const even = n % 2 === 0;
    const 이름 = even ? '짝수' : '홀수';
    const 반대 = even ? '홀수' : '짝수';
    return {
      prompt: '바둑돌을 둘씩 짝지어 보았습니다. 바둑돌의 수와 짝수·홀수를 바르게 말한 것은 어느 것일까요?',
      answer: `${n}개, ${이름}`,
      wrongs: [`${n}개, ${반대}`, `${n + 1}개, ${이름}`, `${n - 1}개, ${이름}`],
      tag: 'number',
      strategy: '둘씩 짝지어 짝수·홀수 알기',
      hint: '위아래로 짝을 지었을 때 남는 바둑돌이 있는지 보세요.',
      steps: [`바둑돌은 ${n}개입니다.`, even ? '둘씩 짝지으면 남는 것이 없으므로 짝수입니다.' : '둘씩 짝지으면 하나가 남으므로 홀수입니다.'],
      misconceptionTip: '남는 것이 없으면 짝수, 하나가 남으면 홀수예요.',
      visual: { kind: 'counters', label: `바둑돌 ${n}개`, groups: [{ count: n, icon: 'dot' }], perRow: Math.ceil(n / 2) },
    };
  },
};

const 짝수고르기 = (want: '짝수' | '홀수'): G5Family => ({
  id: `pick-${want}`,
  make: (seed) => {
    const next = 고르개(seed);
    const pool = Array.from({ length: 20 }, (_, k) => k + 1);
    const 맞는 = pool.filter((v) => (v % 2 === 0) === (want === '짝수'));
    const 틀린 = pool.filter((v) => (v % 2 === 0) !== (want === '짝수'));
    const ans = 맞는[next(맞는.length)];
    const wrongs: number[] = [];
    while (wrongs.length < 3) {
      const v = 틀린[next(틀린.length)];
      if (!wrongs.includes(v)) wrongs.push(v);
    }
    return {
      prompt: `다음 중 ${want}는 어느 것일까요?`,
      answer: String(ans),
      wrongs: wrongs.map(String),
      tag: 'number',
      strategy: `${want} 찾기`,
      hint: '둘씩 짝지었을 때 남는 것이 있는지 생각해 보세요. 낱개 자리가 0, 2, 4, 6, 8이면 짝수예요.',
      steps: [`${eun(String(ans))} 둘씩 짝지으면 ${ans % 2 === 0 ? '남는 것이 없습니다' : '하나가 남습니다'}.`, `그러므로 ${want}는 ${ans}입니다.`],
    };
  },
});

export const unit1Lesson12 = (lessonNo: number, lv: Difficulty): G5Family[] | null => {
  switch (lessonNo) {
    case 1:
      return [그림수('intro', 21, 50), 묶음으로('intro-word', 21, 50)];
    case 2:
      if (lv === '하') return [그림수('tens', 60, 90, true), 묶음으로('tens-word', 60, 90, true)];
      if (lv === '중') return [그림수('tens', 60, 90, true), 읽기('tens-read', 60, 90, true), 묶음으로('tens-word', 60, 90, true)];
      return [읽기('tens-read', 60, 90, true), 묶음으로('tens-word', 60, 90, true)];
    case 3:
      if (lv === '하') return [그림수('99', 51, 99), 묶음으로('99-word', 51, 99)];
      if (lv === '중') return [그림수('99', 51, 99), 읽기('99-read', 51, 99), 묶음으로('99-word', 51, 99)];
      return [읽기('99-read', 51, 99), 묶음으로('99-word', 51, 99)];
    case 4:
      return lv === '하' ? [장면읽기, 읽기('99-read', 51, 99)] : [장면읽기];
    case 5:
      if (lv === '하') return [순서카드('order-up', false), 하나큰작은, 사이개수('1-2-1', 99)];
      if (lv === '중') return [순서카드('order-up', false), 하나큰작은, 백, 사이개수('1-2-1', 99), 두단계수('1-2-1', 99)];
      return [순서카드('order-down', true), 백, 하나큰작은, 두단계수('1-2-1', 99, 10), 사이개수('1-2-1', 99)];
    case 6:
      if (lv === '하') return [부등호, 수카드몇십몇('1-2-1', 99)];
      return [부등호, 가장큰수, 수카드몇십몇('1-2-1', 99)];
    case 7:
      if (lv === '하') return [짝짓기그림, 짝수고르기('짝수')];
      return [짝수고르기('짝수'), 짝수고르기('홀수'), 짝짓기그림, 짝홀사이('1-2-1')];
    default:
      return null;
  }
};

