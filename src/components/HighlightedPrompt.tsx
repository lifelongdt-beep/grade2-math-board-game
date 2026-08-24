import { Fragment } from 'react';

// 1단계 힌트: 문제에서 붙잡아야 할 말을 색으로 미리 보여 줍니다.
// 숫자와, 그 문제가 무엇을 묻는지 정하는 핵심 낱말입니다.
//
// 낱말 목록은 문제은행 전체를 훑어 실제로 자주 쓰이는 것만 골랐습니다.
// 너무 많이 칠하면 아무것도 강조되지 않은 것과 같아, 계산과 비교를
// 부르는 말 중심으로 짧게 둡니다.

// 어디에 있어도 그 말 하나로 읽히는 낱말입니다.
const SAFE_WORDS = [
  '꼭짓점', '자리 숫자', '자리',
  '요일', '며칠', '개월', '주일', '오전', '오후',
  '받아올림', '받아내림', '규칙', '되풀이', '반복',
  'cm', 'm',
  '가장 많은', '가장 적은', '가장 큰', '가장 작은',
];

// 한 글자짜리 낱말입니다. 우리말은 낱말 사이를 띄어 쓰지 않는 자리가
// 많아, 이런 말은 다른 낱말 속에 그대로 들어 있습니다.
//
//   차 → 차례, 기차, 자동차      합 → 합니다, 종합
//   시 → 시간, 시작, 다시        분 → 부분, 분수
//   배 → 배열, 배우              곱 → 곱셈
//   변 → 변화, 주변
//
// 예전에는 글자만 보고 칠해서 '차례입니다'의 '차' 한 글자에만 색이
// 들어갔습니다. 낱말이 아니라 글자를 칠한 것이라 읽기가 더 어려워
//집니다. 앞뒤를 함께 보고 그 말이 낱말로 쓰였을 때만 칠합니다.
const SHORT_WORDS = ['시', '분', '배', '합', '차', '곱', '변'];

// 낱말 뒤에 올 수 있는 조사와 씨끝의 첫 글자입니다. 이 가운데 하나로
// 이어지거나 한글이 아닌 것(빈칸·문장부호·끝)이 와야 낱말입니다.
const TAIL_LETTERS = '은는이가을를의와과도로만에서부터까입일보';

const HANGUL = /[가-힣]/;

const isTailOk = (next: string | undefined) =>
  next === undefined || !HANGUL.test(next) || TAIL_LETTERS.includes(next);

// 앞은 숫자이거나(3시, 20분, 2배) 한글이 아니어야 합니다. 앞 글자가
// 한글이면 '기차'처럼 더 긴 낱말의 한 부분입니다.
const isHeadOk = (previous: string | undefined) =>
  previous === undefined || !HANGUL.test(previous);

const ALL_WORDS = [...SAFE_WORDS, ...SHORT_WORDS].sort((a, b) => b.length - a.length);

type Piece = { kind: 'plain' | 'number' | 'keyword'; text: string };

// 문제글을 조각으로 나눕니다. 화면과 따로 시험할 수 있게 밖으로 냅니다.
export const splitPrompt = (text: string): Piece[] => {
  const pieces: Piece[] = [];
  let plain = '';

  const flush = () => {
    if (plain) {
      pieces.push({ kind: 'plain', text: plain });
      plain = '';
    }
  };

  let at = 0;
  while (at < text.length) {
    // 숫자는 이어지는 만큼 한 덩어리로 봅니다.
    if (/\d/.test(text[at])) {
      let end = at;
      while (end < text.length && /\d/.test(text[end])) end += 1;
      flush();
      pieces.push({ kind: 'number', text: text.slice(at, end) });
      at = end;
      continue;
    }

    // 긴 낱말부터 찾습니다. '자리 숫자'를 먼저 찾아야 '자리'가 그
    // 앞부분만 칠하지 않습니다.
    const word = ALL_WORDS.find((one) => text.startsWith(one, at));
    const usable = word !== undefined
      && (!SHORT_WORDS.includes(word)
        || (isHeadOk(text[at - 1]) && isTailOk(text[at + word.length])));

    if (usable && word) {
      flush();
      pieces.push({ kind: 'keyword', text: word });
      at += word.length;
      continue;
    }

    plain += text[at];
    at += 1;
  }

  flush();
  return pieces;
};

export function HighlightedPrompt({ text }: { text: string }) {
  return (
    <p className="hint-highlighted-prompt">
      {splitPrompt(text).map((piece, index) => {
        if (piece.kind === 'number') {
          return (
            <mark key={index} className="hint-number">
              {piece.text}
            </mark>
          );
        }
        if (piece.kind === 'keyword') {
          return (
            <mark key={index} className="hint-keyword">
              {piece.text}
            </mark>
          );
        }
        return <Fragment key={index}>{piece.text}</Fragment>;
      })}
    </p>
  );
}
