import { Fragment, useMemo } from 'react';
import katex from 'katex';
import '../katex-layout.css';

// ════════════════════════════════════════════════════════════════════
// 우리말 문장 속의 분수를 수학 표기로 그립니다
// ────────────────────────────────────────────────────────────────────
// 문제은행은 분수를 '1/5', '1과 3/4'처럼 글자로 들고 있습니다. 코드에서
// 다루기에는 이 편이 낫지만, 아이에게 그대로 보이면 안 됩니다. 분수는
// 분모 위에 가로선을 긋고 그 위에 분자를 얹어 적는 수이고, 1/5는
// '1 나누기 5'로 읽힐 수도 있는 다른 표기입니다.
//
// 그리는 일은 KaTeX에 맡깁니다. 분자와 분모의 크기, 가로선의 굵기와
// 자리, 글줄 위에서의 높이가 모두 수학 조판 규칙대로 잡힙니다. 손으로
// CSS를 짜면 이 가운데 높이가 늘 어긋나, 분수가 글줄 아래로 흘러
// 내립니다.
//
// 다만 글자체는 앱 것을 그대로 씁니다(styles.css의 .math-fraction 규칙).
// KaTeX가 들고 오는 글자체는 세리프라 한글 옆에서 혼자 튀고, 그 글자
// 파일을 받으려면 1 MB가 넘는데 교실에서는 인터넷이 끊겨도 앱이
// 열려야 합니다.
// ════════════════════════════════════════════════════════════════════

export type MathPiece =
  | { kind: 'text'; text: string }
  | { kind: 'fraction'; whole?: string; numerator: string; denominator: string };

// 분자나 분모에 셈이 들어가는 줄이 있습니다 — 풀이에서 곱한 직후의
// 모양을 보일 때 교과서가 쓰는 꼴입니다.
//
//   5   3   5×3   15
//   ─ × ─ = ─── = ──
//   8   4   8×4   32
//
// 글에서는 '(5×3)/(8×4)'로 적혀 있습니다. 괄호 안에 숫자와 ×, + 만
// 있을 때에만 분수로 봅니다. 다른 글자가 섞여 있으면 그냥 글입니다.
const 셈만 = /^[\d×+\s]+$/;

const 괄호읽기 = (text: string, at: number): { body: string; end: number } | null => {
  if (text[at] !== '(') return null;
  const close = text.indexOf(')', at + 1);
  if (close < 0) return null;
  const body = text.slice(at + 1, close);
  return 셈만.test(body) ? { body: body.trim(), end: close + 1 } : null;
};

/**
 * 글을 보통 글자와 분수로 나눕니다.
 *
 * 왼쪽에서 오른쪽으로 한 번만 훑으면서, 분수를 먼저 집습니다. 이 차례가
 * 중요합니다. '1/2과 3/8 중에서'를 대분수부터 찾으면 가운데 '2과 3/8'이
 * 대분수로 읽혀 2와 8분의 3이 되어 버립니다. 분수를 먼저 집으면 '1/2'을
 * 떼어 낸 뒤라 '과'는 그냥 조사로 남습니다.
 */
export const splitMath = (text: string): MathPiece[] => {
  const pieces: MathPiece[] = [];
  let plain = '';

  const flush = () => {
    if (plain) {
      pieces.push({ kind: 'text', text: plain });
      plain = '';
    }
  };

  let at = 0;
  while (at < text.length) {
    // ⓪ 괄호로 묶은 셈이 분자나 분모인 분수
    const 괄호 = 괄호읽기(text, at);
    if (괄호 && text[괄호.end] === '/') {
      const 아래괄호 = 괄호읽기(text, 괄호.end + 1);
      let denominator: string | null = null;
      let tail = 괄호.end + 1;
      if (아래괄호) {
        denominator = 아래괄호.body;
        tail = 아래괄호.end;
      } else if (/\d/.test(text[괄호.end + 1] ?? '')) {
        let cursor = 괄호.end + 1;
        while (cursor < text.length && /\d/.test(text[cursor])) cursor += 1;
        denominator = text.slice(괄호.end + 1, cursor);
        tail = cursor;
      }
      if (denominator) {
        flush();
        pieces.push({ kind: 'fraction', numerator: 괄호.body, denominator });
        at = tail;
        continue;
      }
    }

    if (!/\d/.test(text[at])) {
      plain += text[at];
      at += 1;
      continue;
    }

    let end = at;
    while (end < text.length && /\d/.test(text[end])) end += 1;
    const 수 = text.slice(at, end);

    // ① 분수: 숫자 / 숫자
    if (text[end] === '/' && /\d/.test(text[end + 1] ?? '')) {
      let tail = end + 1;
      while (tail < text.length && /\d/.test(text[tail])) tail += 1;
      flush();
      pieces.push({ kind: 'fraction', numerator: 수, denominator: text.slice(end + 1, tail) });
      at = tail;
      continue;
    }

    // ② 대분수: 자연수 + '과/와' + 분수
    const 대분수 = /^[과와]\s*(\d+)\/(\d+)/.exec(text.slice(end));
    if (대분수) {
      flush();
      pieces.push({ kind: 'fraction', whole: 수, numerator: 대분수[1], denominator: 대분수[2] });
      at = end + 대분수[0].length;
      continue;
    }

    plain += 수;
    at = end;
  }

  flush();
  return pieces;
};

/** 글에 분수가 있는지 봅니다. 없으면 KaTeX를 부르지 않습니다. */
export const hasMath = (text: string) => /\d\/\d/.test(text) || /\)\//.test(text);

/** 화면 낭독기가 읽을 말입니다. 우리말은 분모를 먼저 읽습니다. */
export const readAloud = (piece: Extract<MathPiece, { kind: 'fraction' }>) => {
  const 읽기 = (one: string) => one.replace(/×/g, ' 곱하기 ').replace(/\+/g, ' 더하기 ').replace(/\s+/g, ' ').trim();
  return `${piece.whole ? `${piece.whole}과 ` : ''}${읽기(piece.denominator)}분의 ${읽기(piece.numerator)}`;
};

// 같은 분수가 한 화면에 여러 번 나옵니다. 그릴 때마다 다시 짜지 않게
// 만들어 둔 것을 들고 있습니다.
const 그려둔것 = new Map<string, string>();

/** 우리말 글에 적힌 셈을 TeX로 옮깁니다. 숫자와 ×, + 만 다룹니다. */
const 셈을TeX로 = (text: string) => text.replace(/×/g, '\\times ').replace(/\s+/g, '');

const 그리기 = (piece: Extract<MathPiece, { kind: 'fraction' }>): string => {
  const tex = `${piece.whole ?? ''}\\dfrac{${셈을TeX로(piece.numerator)}}{${셈을TeX로(piece.denominator)}}`;
  const 있던것 = 그려둔것.get(tex);
  if (있던것) return 있던것;
  // 숫자만 넣으므로 LaTeX 명령이 섞일 자리가 없습니다.
  const html = katex.renderToString(tex, { throwOnError: false, output: 'html', displayMode: false });
  그려둔것.set(tex, html);
  return html;
};

export function MathFraction({ piece }: { piece: Extract<MathPiece, { kind: 'fraction' }> }) {
  const html = useMemo(() => 그리기(piece), [piece.whole, piece.numerator, piece.denominator]);
  return (
    <span className="math-fraction" role="math" aria-label={readAloud(piece)}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  );
}

/** 우리말 문장을 그대로 두고, 그 안의 분수만 수학 표기로 바꿔 그립니다. */
export function MathText({ text }: { text: string }) {
  if (!hasMath(text)) return <>{text}</>;
  return (
    <>
      {splitMath(text).map((piece, index) =>
        piece.kind === 'fraction' ? (
          <MathFraction key={index} piece={piece} />
        ) : (
          <Fragment key={index}>{piece.text}</Fragment>
        ),
      )}
    </>
  );
}
