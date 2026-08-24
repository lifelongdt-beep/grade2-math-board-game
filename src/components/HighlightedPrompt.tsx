import { Fragment } from 'react';

// 1단계 힌트: 문제에서 붙잡아야 할 말을 색으로 미리 보여 줍니다.
// 숫자와, 그 문제가 무엇을 묻는지 정하는 핵심 낱말입니다.
//
// 낱말 목록은 문제은행 전체를 훑어 실제로 자주 쓰이는 것만 골랐습니다.
// 너무 많이 칠하면 아무것도 강조되지 않은 것과 같아, 계산과 비교를
// 부르는 말 중심으로 짧게 둡니다.
const KEYWORDS = [
  '꼭짓점', '변', '자리', '자리 숫자',
  '시', '분', '요일', '며칠', '개월', '주일', '오전', '오후',
  '받아올림', '받아내림', '규칙', '되풀이', '반복',
  'cm', 'm', '배', '곱', '합', '차',
  '가장 많은', '가장 적은', '가장 큰', '가장 작은',
];

// 긴 말이 짧은 말 안에 걸려 반씩 잘리지 않도록 긴 것부터 찾습니다
// (예: '자리 숫자'를 먼저 찾아야 '자리'가 그 앞부분만 칠하지 않습니다).
const KEYWORD_PATTERN = new RegExp(
  `(${[...KEYWORDS].sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}|\\d+)`,
  'g',
);

export function HighlightedPrompt({ text }: { text: string }) {
  const parts = text.split(KEYWORD_PATTERN);

  return (
    <p className="hint-highlighted-prompt">
      {parts.map((part, index) => {
        if (!part) return null;
        if (/^\d+$/.test(part)) {
          return (
            <mark key={index} className="hint-number">
              {part}
            </mark>
          );
        }
        if (KEYWORDS.includes(part)) {
          return (
            <mark key={index} className="hint-keyword">
              {part}
            </mark>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </p>
  );
}
