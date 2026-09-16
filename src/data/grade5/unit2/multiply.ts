import type { G5Family, G5Spec } from '../build';
import { add, compare, frac, improperText, mixedText, mixedToImproper, mul, text, whole } from '../fraction';
import { eul, eun, gwa, i as iJosa, particleOf, pick, rand } from '../util';
import { kindName, methodText, modelFor, operandsFor, wrongAnswersFor, wrongMethods, type Kind, type Operands } from './kinds';

// ════════════════════════════════════════════════════════════════════
// 2~8차시 분수의 곱셈
// ────────────────────────────────────────────────────────────────────
// 여섯 차시가 곱셈의 종류를 하나씩 맡습니다. 하는 일이 같으므로 한 벌을
// 두고 종류로 가릅니다(kinds.ts).
//
// 답은 늘 기약분수·대분수 꼴로 적습니다. 지도서는 그렇게 고치지 않아도
// 정답으로 인정하라고 했지만, 보기에서 하나를 고르는 문항은 꼴이 하나여야
// 합니다. 대신 풀이에 '6/5 = 1과 1/5'처럼 고치는 줄을 남겨, 가분수로
// 구한 아이가 자기 답을 보기에서 찾을 수 있게 합니다.
// ════════════════════════════════════════════════════════════════════

// 문장제 안에서 쓸 때는 마지막 '그러므로 답은 …' 줄을 빼고 씁니다.
// 문장제는 단위를 붙여 자기 결론을 따로 내므로, 두면 같은 말을 두 번
// 하게 됩니다.
const 곱한과정 = (operands: Operands, 결론까지 = true): string[] => {
  const { kind, left, right, leftParts, rightParts, leftText, rightText } = operands;
  const answer = mul(left, right);
  const lines: string[] = [];

  if (leftParts) lines.push(`대분수를 가분수로 고칩니다. ${mixedToImproper(leftParts.whole, leftParts.n, leftParts.d)}`);
  if (rightParts) lines.push(`대분수를 가분수로 고칩니다. ${mixedToImproper(rightParts.whole, rightParts.n, rightParts.d)}`);

  if (kind === 'proper-whole') {
    lines.push(`분모는 그대로 두고 분자와 자연수를 곱합니다. ${leftText} × ${rightText} = (${left.n}×${right.n})/${left.d} = ${left.n * right.n}/${left.d}`);
  } else if (kind === 'whole-proper') {
    lines.push(`${eul(leftText)} ${right.d}묶음으로 똑같이 나눈 것 중 ${right.n}묶음입니다. ${leftText} × ${rightText} = (${left.n}×${right.n})/${right.d} = ${left.n * right.n}/${right.d}`);
  } else {
    lines.push(`분자는 분자끼리, 분모는 분모끼리 곱합니다. ${improperText(left)} × ${improperText(right)} = (${left.n}×${right.n})/(${left.d}×${right.d}) = ${left.n * right.n}/${left.d * right.d}`);
  }

  const rawN = left.n * right.n;
  const rawD = left.d * right.d;
  const rawText = rawD === 1 ? String(rawN) : `${rawN}/${rawD}`;
  if (rawText !== text(answer)) {
    lines.push(`${eul(rawText)} 약분하고 대분수로 고치면 ${text(answer)}입니다.`);
  } else if (결론까지) {
    lines.push(`그러므로 답은 ${text(answer)}입니다.`);
  }
  return lines;
};

const 계산문항 = (kind: Kind, index: number): G5Family => ({
  id: `calc-${index}`,
  make: (seed) => {
    const operands = operandsFor(kind, seed + index * 13);
    const answer = mul(operands.left, operands.right);
    return {
      prompt: `${operands.leftText} × ${eul(operands.rightText)} 계산하면 얼마일까요?`,
      answer: text(answer),
      wrongs: wrongAnswersFor(operands),
      tag: 'fraction',
      strategy: `${kindName[kind]} 계산하기`,
      hint: operands.leftParts || operands.rightParts
        ? '대분수가 있으면 먼저 가분수로 고쳐 적으세요. 고치기 전에 곱하면 자연수 부분이 빠집니다.'
        : '분자에 무엇을 곱하고 분모에 무엇을 곱해야 하는지 먼저 적어 보세요.',
      steps: 곱한과정(operands),
      visual: modelFor(operands),
    };
  },
});

const 방법문항 = (kind: Kind): G5Family => ({
  id: 'method',
  make: () => ({
    prompt: `${eun(kindName[kind])} 어떻게 계산할까요?`,
    answer: methodText[kind],
    wrongs: wrongMethods[kind],
    tag: 'fraction',
    strategy: `${kindName[kind]}의 계산 방법 알기`,
    hint: '분자에 무엇이 곱해지고 분모는 어떻게 되는지를 나누어 생각해 보세요.',
    steps: [
      kind.includes('mixed') ? '대분수는 자연수 부분과 분수 부분으로 이루어져 있어, 그대로 곱하면 자연수 부분이 빠집니다.' : '분수는 분모가 한 칸의 크기를, 분자가 칸의 개수를 나타냅니다.',
      methodText[kind],
    ],
  }),
});

// ── 하 ──────────────────────────────────────────────────────────────
export const multiplyEasy = (kind: Kind): G5Family[] => {
  const families: G5Family[] = [계산문항(kind, 0), 계산문항(kind, 1), 계산문항(kind, 2), 방법문항(kind)];

  if (kind === 'proper-whole') {
    families.push({
      id: 'as-addition',
      make: (seed) => {
        const operands = operandsFor(kind, seed);
        const k = operands.right.n;
        if (k > 4) return null;
        const answer = Array.from({ length: k }, () => operands.leftText).join(' + ');
        return {
          prompt: `${operands.leftText} × ${eul(operands.rightText)} 덧셈식으로 나타내면 어느 것일까요?`,
          answer,
          wrongs: [
            Array.from({ length: k + 1 }, () => operands.leftText).join(' + '),
            Array.from({ length: Math.max(2, k - 1) }, () => operands.leftText).join(' + '),
            Array.from({ length: k }, () => operands.rightText).join(' + '),
            `${operands.leftText} + ${operands.rightText}`,
          ],
          tag: 'fraction',
          strategy: '분수의 곱셈을 덧셈식으로 나타내기',
          hint: '곱하는 자연수가 몇 번 더하라는 뜻인지 세어 보세요.',
          steps: [
            `${operands.leftText} × ${eun(operands.rightText)} ${eul(operands.leftText)} ${k}번 더한 것과 같습니다.`,
            `그래서 덧셈식으로 나타내면 ${answer}입니다.`,
          ],
          visual: modelFor(operands),
        };
      },
    });
    families.push({
      id: 'read-bar',
      make: (seed) => {
        const operands = operandsFor(kind, seed + 5);
        if (operands.right.n > 5) return null;
        const answer = mul(operands.left, operands.right);
        return {
          prompt: '그림은 어떤 곱셈을 나타낸 것일까요? 그 값을 구해 보세요.',
          answer: text(answer),
          wrongs: wrongAnswersFor(operands),
          tag: 'fraction',
          strategy: '그림에서 분수의 곱셈 읽기',
          hint: '띠 하나에 칠해진 칸이 몇 칸인지, 그런 띠가 몇 개인지 세어 보세요.',
          steps: [
            `띠 하나는 1을 ${operands.left.d}칸으로 나눈 것이고, 그중 ${operands.left.n}칸이 칠해져 있습니다. 곧 ${operands.leftText}입니다.`,
            `그런 띠가 ${operands.right.n}개이므로 ${operands.leftText} × ${operands.right.n}입니다.`,
            ...곱한과정(operands).slice(-2),
          ],
          visual: modelFor(operands),
        };
      },
    });
  }

  if (kind === 'whole-proper') {
    families.push({
      id: 'unit-fraction-of',
      make: (seed) => {
        const next = rand(seed);
        const d = 2 + next(6);
        const k = d * (1 + next(6)); // 나누어떨어지게 골라, 뜻을 먼저 잡게 합니다.
        const answer = frac(k, d);
        return {
          prompt: `${k}의 ${eun(`1/${d}`)} 얼마일까요?`,
          answer: text(answer),
          wrongs: [text(frac(k, d * d)), String(k * d), String(k - d), text(frac(k + 1, d))],
          tag: 'fraction',
          strategy: '자연수의 단위분수만큼 구하기',
          hint: `${eul(String(k))} 똑같이 ${d}묶음으로 나누면 한 묶음이 얼마가 되는지 세어 보세요.`,
          steps: [
            `${k}의 ${eun(`1/${d}`)} ${eul(String(k))} 똑같이 ${d}묶음으로 나눈 것 중 한 묶음입니다.`,
            `${k} ÷ ${d} = ${k / d}입니다.`,
            `그러므로 ${text(answer)}입니다.`,
          ],
          visual: {
            kind: 'fraction-model',
            label: '똑같이 나눈 것 중 한 묶음',
            shape: 'part',
            denominator: d,
            numerator: 1,
            whole: k,
          },
        };
      },
    });
  }

  if (kind.startsWith('mixed') || kind === 'whole-mixed') {
    families.push({
      id: 'to-improper',
      make: (seed) => {
        const operands = operandsFor(kind, seed + 3);
        const parts = operands.leftParts ?? operands.rightParts;
        if (!parts) return null;
        const answer = `${parts.whole * parts.d + parts.n}/${parts.d}`;
        return {
          prompt: `대분수 ${mixedText(parts.whole, parts.n, parts.d)}${particleOf(`${parts.n}/${parts.d}`, '을')} 가분수로 나타내면 얼마일까요?`,
          answer,
          wrongs: [
            `${parts.whole + parts.n}/${parts.d}`,
            `${parts.whole * parts.n}/${parts.d}`,
            `${parts.whole * parts.d + parts.n}/${parts.d * parts.whole}`,
            `${parts.n}/${parts.d}`,
          ],
          tag: 'fraction',
          strategy: '대분수를 가분수로 고치기',
          hint: '자연수 1이 분모만큼의 칸으로 이루어져 있다고 생각해 보세요. 자연수 부분이 몇 칸인지 먼저 구합니다.',
          steps: [
            `자연수 ${eun(String(parts.whole))} ${iJosa(`1/${parts.d}`)} ${parts.whole} × ${parts.d} = ${parts.whole * parts.d}(개)인 수입니다.`,
            `여기에 ${parts.n}/${parts.d}의 ${parts.n}개를 더하면 ${iJosa(`1/${parts.d}`)} ${parts.whole * parts.d + parts.n}개입니다.`,
            `그러므로 ${answer}입니다.`,
          ],
        };
      },
    });
  }

  if (kind === 'proper-proper') {
    families.push({
      id: 'read-area',
      make: (seed) => {
        const operands = operandsFor(kind, seed + 7);
        const answer = mul(operands.left, operands.right);
        return {
          prompt: '그림에서 두 번 칠해진 곳은 전체의 얼마일까요?',
          answer: text(answer),
          wrongs: wrongAnswersFor(operands),
          tag: 'fraction',
          strategy: '넓이 그림에서 분수의 곱 읽기',
          hint: '전체가 몇 칸으로 나누어졌는지 먼저 세고, 두 번 칠해진 칸이 몇 칸인지 세어 보세요.',
          steps: [
            `가로로 ${operands.left.d}칸, 세로로 ${operands.right.d}칸이므로 전체는 ${operands.left.d} × ${operands.right.d} = ${operands.left.d * operands.right.d}(칸)입니다.`,
            `두 번 칠해진 곳은 ${operands.left.n} × ${operands.right.n} = ${operands.left.n * operands.right.n}(칸)입니다.`,
            `${operands.left.n * operands.right.n}/${operands.left.d * operands.right.d}${
              `${operands.left.n * operands.right.n}/${operands.left.d * operands.right.d}` === text(answer)
                ? `이므로 전체의 ${text(answer)}입니다.`
                : `, 곧 ${text(answer)}이므로 전체의 ${text(answer)}입니다.`
            }`,
          ],
          visual: modelFor(operands),
        };
      },
    });
  }

  return families;
};

// ── 중 ──────────────────────────────────────────────────────────────
type 상황 = {
  id: string;
  // 왼쪽 수와 오른쪽 수를 받아 문장을 만듭니다.
  글: (left: string, right: string) => string;
  단위: string;
  물음: string;
};

const 상황들: Record<Kind, 상황[]> = {
  'proper-whole': [
    { id: 'dough', 글: (l, r) => `화석을 만드는 데 알지네이트 반죽을 한 사람이 ${l} 컵씩 사용했습니다. ${r}명이 사용했다면`, 단위: '컵', 물음: '반죽은 모두 몇 컵일까요?' },
    { id: 'ribbon', 글: (l, r) => `리본을 한 도막에 ${l} m씩 잘랐습니다. ${r}도막이라면`, 단위: 'm', 물음: '리본은 모두 몇 m일까요?' },
    { id: 'milk', 글: (l, r) => `우유를 한 병에 ${l} L씩 담았습니다. ${r}병이라면`, 단위: 'L', 물음: '우유는 모두 몇 L일까요?' },
    { id: 'walk', 글: (l, r) => `하루에 ${l} km씩 걷습니다. ${r}일 동안 걷는다면`, 단위: 'km', 물음: '모두 몇 km를 걸을까요?' },
  ],
  'mixed-whole': [
    { id: 'water', 글: (l, r) => `토기에 물을 ${l} L씩 ${r}번 담았습니다.`, 단위: 'L', 물음: '토기에 담은 물은 모두 몇 L일까요?' },
    { id: 'tape', 글: (l, r) => `색 테이프를 한 도막에 ${l} m씩 잘랐습니다. ${r}도막이라면`, 단위: 'm', 물음: '색 테이프는 모두 몇 m일까요?' },
    { id: 'juice', 글: (l, r) => `주스를 한 병에 ${l} L씩 담았습니다. ${r}병이라면`, 단위: 'L', 물음: '주스는 모두 몇 L일까요?' },
  ],
  'whole-proper': [
    { id: 'thread', 글: (l, r) => `가죽 필통을 만들려고 실 ${l} m의 ${eul(r)} 사용했습니다.`, 단위: 'm', 물음: '사용한 실은 몇 m일까요?' },
    { id: 'candy', 글: (l, r) => `사탕 ${l}개의 ${eul(r)} 동생에게 주었습니다.`, 단위: '개', 물음: '동생에게 준 사탕은 몇 개일까요?' },
    { id: 'land', 글: (l, r) => `밭 ${l} m²의 ${r}에 배추를 심었습니다.`, 단위: 'm²', 물음: '배추를 심은 넓이는 몇 m²일까요?' },
  ],
  'whole-mixed': [
    { id: 'rope', 글: (l, r) => `줄 한 도막의 길이가 ${r} m입니다. 같은 줄 ${l}도막을 이으면`, 단위: 'm', 물음: '줄은 모두 몇 m일까요?' },
    { id: 'flour', 글: (l, r) => `빵 하나를 만드는 데 밀가루가 ${r} 컵 필요합니다. 빵 ${l}개를 만들려면`, 단위: '컵', 물음: '밀가루는 모두 몇 컵 필요할까요?' },
    { id: 'paint', 글: (l, r) => `벽 한 면을 칠하는 데 페인트가 ${r} L 듭니다. ${l}면을 칠하려면`, 단위: 'L', 물음: '페인트는 모두 몇 L 필요할까요?' },
  ],
  'proper-proper': [
    { id: 'rect', 글: (l, r) => `가로가 ${l} m, 세로가 ${r} m인 직사각형 모양의 화단이 있습니다.`, 단위: 'm²', 물음: '화단의 넓이는 몇 m²일까요?' },
    { id: 'drink', 글: (l, r) => `물이 ${l} L 있습니다. 그중 ${eul(r)} 마셨습니다.`, 단위: 'L', 물음: '마신 물은 몇 L일까요?' },
    { id: 'field', 글: (l, r) => `밭 ${l} m²의 ${r}에 고추를 심었습니다.`, 단위: 'm²', 물음: '고추를 심은 넓이는 몇 m²일까요?' },
  ],
  'mixed-mixed': [
    { id: 'room', 글: (l, r) => `가로가 ${l} m, 세로가 ${r} m인 직사각형 모양의 체험장이 있습니다.`, 단위: 'm²', 물음: '체험장의 넓이는 몇 m²일까요?' },
    { id: 'board', 글: (l, r) => `가로가 ${l} m, 세로가 ${r} m인 직사각형 모양의 게시판이 있습니다.`, 단위: 'm²', 물음: '게시판의 넓이는 몇 m²일까요?' },
    { id: 'walkfast', 글: (l, r) => `한 시간에 ${l} km를 걷습니다. ${r}시간 동안 걷는다면`, 단위: 'km', 물음: '모두 몇 km를 걸을까요?' },
  ],
};

export const multiplyMiddle = (kind: Kind): G5Family[] => {
  const 상황목록 = 상황들[kind];

  const 문장제 = (index: number): G5Family => ({
    id: `word-${index}`,
    make: (seed) => {
      const operands = operandsFor(kind, seed + index * 17);
      const 상 = 상황목록[(Math.abs(seed) + index) % 상황목록.length];
      const answer = mul(operands.left, operands.right);
      return {
        prompt: `${상.글(operands.leftText, operands.rightText)} ${상.물음}`,
        answer: `${text(answer)} ${상.단위}`,
        wrongs: wrongAnswersFor(operands).map((w) => `${w} ${상.단위}`),
        tag: 'fraction',
        strategy: `${kindName[kind]} 상황에서 문제 해결하기`,
        hint: '먼저 곱셈식으로 나타내 보세요. 무엇을 몇 번, 또는 무엇의 얼마만큼인지를 찾으면 됩니다.',
        steps: [
          `곱셈식으로 나타내면 ${operands.leftText} × ${operands.rightText}입니다.`,
          ...곱한과정(operands, false),
          `그러므로 ${text(answer)} ${상.단위}입니다.`,
        ],
        visual: modelFor(operands),
      };
    },
  });

  return [
    문장제(0),
    문장제(1),
    문장제(2),
    계산문항(kind, 5),
    {
      id: 'make-expression',
      make: (seed) => {
        const operands = operandsFor(kind, seed + 9);
        const 상 = 상황목록[Math.abs(seed) % 상황목록.length];
        const answer = `${operands.leftText} × ${operands.rightText}`;
        return {
          prompt: `${상.글(operands.leftText, operands.rightText)} ${상.물음} 알맞은 식은 어느 것일까요?`,
          answer,
          wrongs: [
            `${operands.leftText} + ${operands.rightText}`,
            `${operands.rightText} - ${operands.leftText}`,
            `${operands.leftText} ÷ ${operands.rightText}`,
            `${operands.rightText} ÷ ${operands.leftText}`,
          ],
          tag: 'fraction',
          strategy: '상황을 곱셈식으로 나타내기',
          hint: '같은 양이 여러 번인지, 아니면 어떤 양의 몇 분의 몇인지 가려 보세요. 둘 다 곱셈입니다.',
          steps: [
            '같은 양이 여러 번 있거나, 어떤 양의 몇 분의 몇을 구하는 상황은 곱셈으로 나타냅니다.',
            `그러므로 ${answer}입니다.`,
          ],
        };
      },
    },
    {
      id: 'find-error',
      make: (seed) => {
        const operands = operandsFor(kind, seed + 11);
        const answer = mul(operands.left, operands.right);
        const 잘못 = wrongAnswersFor(operands).find((w) => w !== text(answer));
        if (!잘못) return null;
        return {
          prompt: `어떤 학생이 ${operands.leftText} × ${eul(operands.rightText)} 계산하여 ${iJosa(잘못)} 나왔습니다. 바르게 계산하면 얼마일까요?`,
          answer: text(answer),
          wrongs: wrongAnswersFor(operands).filter((w) => w !== 잘못),
          tag: 'fraction',
          strategy: '잘못된 계산을 바로잡기',
          hint: '어디에 무엇을 곱해야 하는지 차례대로 다시 적어 보세요. 대분수가 있으면 가분수로 고치는 것이 먼저입니다.',
          steps: 곱한과정(operands),
          visual: modelFor(operands),
        };
      },
    },
  ];
};

// ── 상 ──────────────────────────────────────────────────────────────
export const multiplyHard = (kind: Kind): G5Family[] => [
  {
    id: 'missing-factor',
    make: (seed) => {
      const operands = operandsFor(kind, seed);
      const answer = mul(operands.left, operands.right);
      const 왼쪽을묻기 = Math.abs(seed) % 2 === 0;
      const 감춘것 = 왼쪽을묻기 ? operands.leftText : operands.rightText;
      const 보이는것 = 왼쪽을묻기 ? operands.rightText : operands.leftText;
      return {
        prompt: `${왼쪽을묻기 ? `▢ × ${보이는것}` : `${보이는것} × ▢`} = ${text(answer)}일 때 ▢에 알맞은 수는 무엇일까요?`,
        answer: 감춘것,
        wrongs: [
          text(answer),
          보이는것,
          text(add(operands.left, operands.right)),
          text(frac(answer.n, answer.d + 1)),
        ],
        tag: 'fraction',
        strategy: '곱셈식에서 빠진 수 구하기',
        hint: '보기의 수를 ▢에 하나씩 넣어 곱해 보세요. 결과가 오른쪽과 같아지는 것을 찾으면 됩니다.',
        steps: [
          `${operands.leftText} × ${eul(operands.rightText)} 계산하면 ${text(answer)}입니다.`,
          `그러므로 ▢에 알맞은 수는 ${감춘것}입니다.`,
        ],
      };
    },
  },
  {
    id: 'compare-products',
    make: (seed) => {
      const a = operandsFor(kind, seed);
      const b = operandsFor(kind, seed + 101);
      const 곱1 = mul(a.left, a.right);
      const 곱2 = mul(b.left, b.right);
      if (compare(곱1, 곱2) === 0) return null;
      const 큰쪽 = compare(곱1, 곱2) > 0 ? a : b;
      const 큰값 = compare(곱1, 곱2) > 0 ? 곱1 : 곱2;
      const 작은값 = compare(곱1, 곱2) > 0 ? 곱2 : 곱1;
      const 식 = (o: Operands) => `${o.leftText} × ${o.rightText}`;
      return {
        prompt: `${식(a)}${gwa(a.rightText).slice(a.rightText.length)} ${식(b)} 중에서 계산 결과가 더 큰 것은 어느 것일까요?`,
        answer: 식(큰쪽),
        wrongs: [식(큰쪽 === a ? b : a), '두 식의 결과는 같습니다.', text(큰값), text(작은값)],
        tag: 'fraction',
        strategy: '두 곱셈의 결과 비교하기',
        hint: '두 식을 각각 끝까지 계산해 같은 꼴로 만든 다음 견주세요.',
        steps: [
          `${식(a)} = ${text(곱1)}입니다.`,
          `${식(b)} = ${text(곱2)}입니다.`,
          `${iJosa(text(큰값))} ${text(작은값)}보다 크므로 ${iJosa(식(큰쪽))} 더 큽니다.`,
        ],
      };
    },
  },
  {
    id: 'bigger-or-smaller',
    make: (seed) => {
      const operands = operandsFor(kind, seed + 5);
      const answer = mul(operands.left, operands.right);
      // 곱하는 수가 1보다 작으면 곱은 곱해지는 수보다 작아집니다.
      const 곱하는수가1보다작다 = compare(operands.right, whole(1)) < 0;
      const 결론 = 곱하는수가1보다작다
        ? `${operands.leftText}보다 작습니다.`
        : `${operands.leftText}보다 큽니다.`;
      return {
        prompt: `계산하지 않고 생각해 봅시다. ${operands.leftText} × ${operands.rightText}의 결과는 ${gwa(operands.leftText)} 견주면 어떠할까요?`,
        answer: 결론,
        wrongs: [
          곱하는수가1보다작다 ? `${operands.leftText}보다 큽니다.` : `${operands.leftText}보다 작습니다.`,
          `${gwa(operands.leftText)} 같습니다.`,
          `${gwa(operands.rightText)} 같습니다.`,
          '알 수 없습니다.',
        ],
        tag: 'fraction',
        strategy: '곱한 결과의 크기를 어림하기',
        hint: `곱하는 수 ${iJosa(operands.rightText)} 1보다 큰지 작은지를 먼저 보세요. 어떤 수에 1을 곱하면 그 수 그대로입니다.`,
        steps: [
          `어떤 수에 1을 곱하면 그 수 그대로입니다.`,
          곱하는수가1보다작다
            ? `곱하는 수 ${iJosa(operands.rightText)} 1보다 작으므로, 곱은 ${operands.leftText}보다 작아집니다.`
            : `곱하는 수 ${iJosa(operands.rightText)} 1보다 크므로, 곱은 ${operands.leftText}보다 커집니다.`,
          `실제로 계산해 보면 ${iJosa(text(answer))} 되어 ${결론}`,
        ],
        misconceptionTip: '자연수끼리 곱하면 늘 커지지만, 1보다 작은 수를 곱하면 오히려 작아집니다.',
      };
    },
  },
  {
    id: 'three-factors',
    make: (seed) => {
      const operands = operandsFor(kind, seed + 7);
      const next = rand(seed + 7);
      const d = 2 + next(5);
      const third = frac(1, d);
      const answer = mul(mul(operands.left, operands.right), third);
      return {
        prompt: `${operands.leftText} × ${operands.rightText} × ${eul(`1/${d}`)} 계산하면 얼마일까요?`,
        answer: text(answer),
        wrongs: [
          text(mul(operands.left, operands.right)),
          text(mul(operands.left, third)),
          text(frac(answer.n * d, answer.d)),
          text(add(mul(operands.left, operands.right), third)),
        ],
        tag: 'fraction',
        strategy: '세 분수의 곱셈 계산하기',
        hint: '앞의 두 수를 먼저 곱한 다음, 그 결과에 남은 수를 곱하세요. 한꺼번에 분자끼리, 분모끼리 곱해도 됩니다.',
        steps: [
          ...곱한과정(operands),
          `여기에 ${eul(`1/${d}`)} 곱하면 ${text(answer)}입니다.`,
        ],
      };
    },
  },
  {
    id: 'error-spot',
    make: (seed) => {
      const operands = operandsFor(kind, seed + 13);
      const 잘못들 = wrongAnswersFor(operands);
      const 잘못 = 잘못들[0];
      const answer = mul(operands.left, operands.right);
      if (!잘못 || 잘못 === text(answer)) return null;
      const 까닭: Record<Kind, string> = {
        'proper-whole': '자연수를 분모에 곱했습니다.',
        'mixed-whole': '대분수를 가분수로 고치지 않고 자연수 부분에만 곱했습니다.',
        'whole-proper': '자연수를 분모에 곱했습니다.',
        'whole-mixed': '대분수의 분수 부분을 빠뜨리고 자연수끼리만 곱했습니다.',
        'proper-proper': '분자끼리 더하고 분모끼리 더했습니다.',
        'mixed-mixed': '대분수를 가분수로 고치지 않고 자연수끼리, 분수끼리 따로 곱했습니다.',
      };
      return {
        prompt: `${operands.leftText} × ${eul(operands.rightText)} 계산했더니 ${iJosa(잘못)} 나왔습니다. 무엇을 잘못한 것일까요?`,
        answer: 까닭[operands.kind],
        wrongs: Object.entries(까닭)
          .filter(([key]) => key !== operands.kind)
          .map(([, value]) => value)
          .concat('약분을 하지 않았습니다.'),
        tag: 'fraction',
        strategy: '계산에서 잘못된 곳 찾기',
        hint: '바르게 계산한 값을 먼저 구하고, 잘못 나온 값과 어디가 다른지 견주어 보세요.',
        steps: [
          ...곱한과정(operands),
          `잘못 나온 ${gwa(잘못)} 견주면, ${까닭[operands.kind]}`,
        ],
      };
    },
  },
];
