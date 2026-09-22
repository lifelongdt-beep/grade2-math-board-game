import { useMemo, useState } from 'react';
import type { QuestionVisual } from '../types';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 분수의 곱셈 실험실 — 모아 보고, 덜어 보고, 겹쳐 보는 자리
// ────────────────────────────────────────────────────────────────────
// 지도서 5-2 각론1 단원 개관이 이 단원에서 가장 조심할 것을 그대로
// 적어 두었습니다.
//
//   "이 단원을 지도할 때 분수의 곱셈의 계산 절차만 가르치게 되면
//    학생은 그렇게 계산하는 이유를 이해하지 못하고 계산 과정에서
//    쉽게 오류를 보일 수 있다. 따라서 … 분수의 곱셈 방법을 학생
//    스스로 발견하고 왜 그렇게 되는지를 이해하게 하는 것이 중요하다."
//
// 그리고 이름을 붙여 경고한 오개념이 하나 더 있습니다.
//
//   "두 자연수를 곱할 때는 그 계산 결과가 곱하는 두 자연수보다 항상
//    더 크지만, 두 진분수를 곱하면 계산 결과는 곱하는 두 분수보다
//    항상 작게 되는 것처럼 자연수에서의 곱셈과 분수의 곱셈 사이의
//    차이점을 인식할 수 있도록 지도한다."
//
// '곱하면 커진다'는 생각은 자연수만 곱해 온 아이에게 아주 단단합니다.
// 말로 "아니야, 작아져"라고 해서는 바뀌지 않습니다. 넓이 모형에서
// 1/9짜리 띠와 1/7짜리 띠가 겹치는 자리가 둘 중 어느 것보다도 작은
// 것을 눈으로 보아야 합니다. 그래서 이 자리를 만들었습니다.
//
// 지도서가 쓰라고 한 모형도 그대로입니다 — "그림과 영역 모델을
// 이용하여 분수의 곱셈 계산 원리를 탐구하고".
//
// 문항이 쓰는 그림 세 가지에 하나씩 붙입니다.
//   bar  (분수)×(자연수)  같은 만큼씩 여러 번 → 모아서 묶기
//   part (자연수)×(분수)  전체를 똑같이 나눈 것 중 몇 묶음
//   area (분수)×(분수)    가로 띠와 세로 띠를 겹치기
// ════════════════════════════════════════════════════════════════════

type 분수그림 = {
  shape: 'bar' | 'part' | 'area';
  denominator: number;
  numerator: number;
  repeat?: number;
  whole?: number;
  columns?: number;
  shadedColumns?: number;
  rows?: number;
  shadedRows?: number;
};

type 실험 =
  | { 갈래: '모아묶기'; 그림: 분수그림 }
  | { 갈래: '덜어내기'; 그림: 분수그림 }
  | { 갈래: '겹쳐보기'; 그림: 분수그림 };

export const 무엇을겹쳐볼까 = (visual: QuestionVisual | undefined): 실험 | null => {
  if (visual?.kind !== 'fraction-model') return null;
  const 그림 = visual as unknown as 분수그림;
  if (!그림.denominator || 그림.denominator < 1) return null;

  if (그림.shape === 'area') {
    // 가로·세로가 모두 있어야 겹칠 것이 생깁니다.
    if (!그림.columns || !그림.rows) return null;
    return { 갈래: '겹쳐보기', 그림 };
  }
  if (그림.shape === 'bar') {
    if (!그림.repeat || 그림.repeat < 2) return null;
    return { 갈래: '모아묶기', 그림 };
  }
  if (그림.shape === 'part') {
    if (!그림.whole) return null;
    return { 갈래: '덜어내기', 그림 };
  }
  return null;
};

// ── 그리기에 쓰는 공통 조각 ────────────────────────────────────────

const 판너비 = 344;
const 판높이 = 226;
const 칠한색 = 'rgba(46, 134, 193, 0.55)';
const 테두리 = '#41607a';

function 손잡이({
  값,
  바꾸기,
  이름,
  왼쪽말,
  오른쪽말,
}: {
  값: number;
  바꾸기: (다음: number) => void;
  이름: string;
  왼쪽말: string;
  오른쪽말: string;
}) {
  return (
    <div className="symmetry-slider">
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(값 * 100)}
        aria-label={이름}
        onChange={(event) => 바꾸기(Number(event.target.value) / 100)}
      />
      <div className="symmetry-slider-ends">
        <span>{왼쪽말}</span>
        <span>{오른쪽말}</span>
      </div>
    </div>
  );
}

const 판 = (
  <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
);

// ── 모아 묶기 ((분수) × (자연수)) ─────────────────────────────────
//
// 4/5짜리 띠가 넷 있으면 1/5짜리 조각이 모두 16개입니다. 그것을 왼쪽
// 부터 차곡차곡 모으면 띠 세 개가 꽉 차고 한 조각이 남습니다.
// 지도서가 말하는 '동수누가'를 그대로 보입니다.

function 모아묶기({ 그림 }: { 그림: 분수그림 }) {
  const [t, setT] = useState(0);
  const 분모 = 그림.denominator;
  const 분자 = 그림.numerator;
  const 몇번 = 그림.repeat ?? 1;
  const 조각수 = 분자 * 몇번;
  const 꽉찬띠 = Math.floor(조각수 / 분모);
  const 남은조각 = 조각수 % 분모;

  // 띠를 몇 줄로 늘어놓을지. 모으고 나면 띠 수가 줄어들 수 있으므로
  // 처음과 나중 가운데 많은 쪽에 맞춥니다.
  const 띠수 = Math.max(몇번, 꽉찬띠 + (남은조각 ? 1 : 0));
  const 줄당 = 띠수 <= 4 ? 띠수 : Math.ceil(띠수 / 2);
  const 줄수 = Math.ceil(띠수 / 줄당);

  const 여백 = 16;
  const 띠너비 = (판너비 - 여백 * 2 - (줄당 - 1) * 10) / 줄당;
  const 띠높이 = Math.min(38, (판높이 - 70 - (줄수 - 1) * 12) / 줄수);
  const 칸너비 = 띠너비 / 분모;
  // 줄 수가 적으면 위쪽에 빈 자리가 크게 남습니다. 세로 가운데에 놓습니다.
  const 모두높이 = 줄수 * 띠높이 + (줄수 - 1) * 12;
  const 첫줄y = Math.max(34, (판높이 - 모두높이) / 2 + 6);
  const 띠자리 = (at: number) => ({
    x: 여백 + (at % 줄당) * (띠너비 + 10),
    y: 첫줄y + Math.floor(at / 줄당) * (띠높이 + 12),
  });

  // 조각마다 처음 자리와 모은 뒤의 자리를 잡습니다.
  const 조각들 = useMemo(() => {
    const 것들: Array<{ 처음: { x: number; y: number }; 나중: { x: number; y: number } }> = [];
    for (let i = 0; i < 조각수; i += 1) {
      const 처음띠 = Math.floor(i / 분자);
      const 처음칸 = i % 분자;
      const 나중띠 = Math.floor(i / 분모);
      const 나중칸 = i % 분모;
      const a = 띠자리(처음띠);
      const b = 띠자리(나중띠);
      것들.push({
        처음: { x: a.x + 처음칸 * 칸너비, y: a.y },
        나중: { x: b.x + 나중칸 * 칸너비, y: b.y },
      });
    }
    return 것들;
  }, [조각수, 분자, 분모, 띠너비, 띠높이, 첫줄y]);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="같은 만큼씩 여러 번 모아 보는 그림">
        {판}
        {/* 빈 띠들 */}
        {Array.from({ length: 띠수 }).map((_, at) => {
          const { x, y } = 띠자리(at);
          return (
            <g key={`t-${at}`}>
              <rect x={x} y={y} width={띠너비} height={띠높이} fill="#ffffff" stroke={테두리} strokeWidth="2" />
              {Array.from({ length: 분모 - 1 }).map((__, k) => (
                <line
                  key={k}
                  x1={x + (k + 1) * 칸너비}
                  y1={y}
                  x2={x + (k + 1) * 칸너비}
                  y2={y + 띠높이}
                  stroke="#c6d8e2"
                  strokeWidth="1"
                />
              ))}
            </g>
          );
        })}
        {/* 조각들 */}
        {조각들.map((하나, at) => (
          <rect
            key={at}
            x={하나.처음.x + (하나.나중.x - 하나.처음.x) * t}
            y={하나.처음.y + (하나.나중.y - 하나.처음.y) * t}
            width={칸너비}
            height={띠높이}
            fill={칠한색}
            stroke="#2e86c1"
            strokeWidth="1.5"
          />
        ))}
        <text x={12} y={20} fill="#5b7186" fontSize="12" fontWeight="800">
          {`1/${분모}짜리 조각 ${조각수}개`}
        </text>
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="조각을 모아 묶기"
        왼쪽말="같은 만큼씩 여러 번"
        오른쪽말="모아 묶기"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? 꽉찬띠 === 0
            ? `모았더니 띠 하나를 다 채우지 못하고 ${남은조각}조각이 되었습니다.`
            : `모았더니 꽉 찬 띠가 ${꽉찬띠}개${남은조각 ? `, 남은 조각이 ${남은조각}개` : ''}입니다.`
          : `1/${분모}짜리 조각이 모두 몇 개인지 세고, 왼쪽부터 모아 보세요.`}
      </p>
    </div>
  );
}

// ── 덜어내기 ((자연수) × (분수)) ──────────────────────────────────
//
// 7의 5/7이면, 7을 똑같이 7묶음으로 나누고 그 가운데 5묶음을 가져옵니다.
// 지도서가 "연산자로서의 분수"라고 부르는 자리입니다.

function 덜어내기({ 그림 }: { 그림: 분수그림 }) {
  const [t, setT] = useState(0);
  const 분모 = 그림.denominator;
  const 분자 = Math.min(그림.numerator, 분모);
  const 전체 = 그림.whole ?? 분모;

  const 여백 = 22;
  const 띠너비 = 판너비 - 여백 * 2;
  const 띠높이 = 56;
  const y = 64;
  const 칸너비 = 띠너비 / 분모;
  // 한 묶음이 나타내는 수입니다. 7을 7묶음으로 나누면 한 묶음은 1.
  const 한묶음 = 전체 / 분모;
  const 고른것 = 한묶음 * 분자;

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="전체를 똑같이 나누어 몇 묶음을 가져오는 그림">
        {판}
        <text x={12} y={22} fill="#5b7186" fontSize="12" fontWeight="800">
          {`전체 ${전체}`}
        </text>
        {/* 나누는 금은 손잡이를 끌수록 뚜렷해집니다. */}
        <rect x={여백} y={y} width={띠너비} height={띠높이} fill="#ffffff" stroke={테두리} strokeWidth="2.5" />
        {Array.from({ length: 분모 - 1 }).map((_, k) => (
          <line
            key={k}
            x1={여백 + (k + 1) * 칸너비}
            y1={y}
            x2={여백 + (k + 1) * 칸너비}
            y2={y + 띠높이}
            stroke="#8fb6c4"
            strokeWidth="1.5"
            opacity={Math.min(1, t * 2)}
          />
        ))}
        {/* 가져오는 묶음은 손잡이를 끌수록 하나씩 칠해집니다. */}
        {Array.from({ length: 분자 }).map((_, k) => {
          const 차례 = Math.max(0, Math.min(1, (t - 0.5) * 2 * 분자 - k));
          return (
            <rect
              key={k}
              x={여백 + k * 칸너비}
              y={y}
              width={칸너비 * 차례}
              height={띠높이}
              fill={칠한색}
            />
          );
        })}
        <rect x={여백} y={y} width={띠너비} height={띠높이} fill="none" stroke={테두리} strokeWidth="2.5" />
        {/* 한 묶음이 얼마인지 */}
        {t > 0.45 && (
          <text x={여백 + 칸너비 / 2} y={y + 띠높이 + 20} textAnchor="middle" fill="#5b7186" fontSize="12" fontWeight="800">
            {Number.isInteger(한묶음) ? 한묶음 : 한묶음.toFixed(2)}
          </text>
        )}
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="똑같이 나누고 몇 묶음 가져오기"
        왼쪽말="전체 그대로"
        오른쪽말={`${분모}묶음으로 나누어 ${분자}묶음`}
      />
      <p className="symmetry-say">
        {t > 0.99
          ? `${분모}묶음으로 나눈 것 중 ${분자}묶음을 가져왔습니다. 칠해진 만큼이 얼마인지 세어 보세요.`
          : `전체 ${전체}을(를) ${분모}묶음으로 똑같이 나누고, 그 가운데 ${분자}묶음만 가져와 보세요.`}
      </p>
    </div>
  );
}

// ── 겹쳐 보기 ((분수) × (분수)) ───────────────────────────────────
//
// 지도서가 이름 붙여 경고한 오개념을 정면으로 겨눕니다 —
// "두 자연수를 곱할 때는 그 계산 결과가 곱하는 두 자연수보다 항상
//  더 크지만, 두 진분수를 곱하면 계산 결과는 곱하는 두 분수보다
//  항상 작게 되는 것".
//
// 가로로 누운 띠와 세로로 선 띠를 겹치면, 겹친 자리가 둘 중 어느
// 것보다도 작습니다. 말로 들어서는 믿기 어려운 것을 눈으로 봅니다.

function 겹쳐보기({ 그림 }: { 그림: 분수그림 }) {
  const [t, setT] = useState(0);
  const 세로칸 = 그림.columns ?? 1;
  const 가로칸 = 그림.rows ?? 1;
  const 칠한세로 = 그림.shadedColumns ?? 1;
  const 칠한가로 = 그림.shadedRows ?? 1;

  const 여백 = 26;
  const 크기 = Math.min(판너비 - 여백 * 2, 판높이 - 56);
  const x0 = (판너비 - 크기) / 2;
  const y0 = 36;
  const 칸너비 = 크기 / 세로칸;
  const 칸높이 = 크기 / 가로칸;

  // 가로 띠는 처음에 네모 위쪽 바깥에 있다가 내려와 겹칩니다.
  const 가로띠y = y0 - 크기 * 0.5 * (1 - t);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="가로 띠와 세로 띠를 겹쳐 보는 그림">
        {판}
        <rect x={x0} y={y0} width={크기} height={크기} fill="#ffffff" stroke={테두리} strokeWidth="2.5" />

        {/* 세로 띠 — 가로를 나눈 것 중 몇 칸 */}
        <rect x={x0} y={y0} width={칸너비 * 칠한세로} height={크기} fill="rgba(46, 134, 193, 0.34)" />
        {/* 가로 띠 — 세로를 나눈 것 중 몇 칸. 내려와 겹칩니다. */}
        <rect
          x={x0}
          y={가로띠y}
          width={크기}
          height={칸높이 * 칠한가로}
          fill="rgba(224, 138, 30, 0.38)"
        />
        {/* 겹친 자리 */}
        <rect
          x={x0}
          y={가로띠y}
          width={칸너비 * 칠한세로}
          height={칸높이 * 칠한가로}
          fill="rgba(15, 113, 117, 0.55)"
        />

        {/* 눈금 */}
        {Array.from({ length: 세로칸 - 1 }).map((_, k) => (
          <line key={`c${k}`} x1={x0 + (k + 1) * 칸너비} y1={y0} x2={x0 + (k + 1) * 칸너비} y2={y0 + 크기} stroke="#c6d8e2" strokeWidth="1" />
        ))}
        {Array.from({ length: 가로칸 - 1 }).map((_, k) => (
          <line key={`r${k}`} x1={x0} y1={y0 + (k + 1) * 칸높이} x2={x0 + 크기} y2={y0 + (k + 1) * 칸높이} stroke="#c6d8e2" strokeWidth="1" />
        ))}
        <rect x={x0} y={y0} width={크기} height={크기} fill="none" stroke={테두리} strokeWidth="2.5" />

        <text x={12} y={20} fill="#2e86c1" fontSize="12" fontWeight="800">
          {`가로 ${칠한세로}/${세로칸}`}
        </text>
        <text x={110} y={20} fill="#b4761e" fontSize="12" fontWeight="800">
          {`세로 ${칠한가로}/${가로칸}`}
        </text>
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="두 띠를 겹치기"
        왼쪽말="따로 있음"
        오른쪽말="겹치기"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? `겹친 자리는 온 넓이를 ${세로칸 * 가로칸}칸으로 나눈 것 중 ${칠한세로 * 칠한가로}칸입니다. 두 띠 어느 쪽보다도 작습니다.`
          : '주황색 띠를 내려 파란색 띠와 겹쳐 보세요. 겹친 자리가 얼마나 될까요?'}
      </p>
    </div>
  );
}

// ── 바깥으로 내보내는 것 ───────────────────────────────────────────

export function FractionLab({ visual }: { visual: QuestionVisual }) {
  const 할것 = useMemo(() => 무엇을겹쳐볼까(visual), [visual]);
  if (!할것) return null;
  if (할것.갈래 === '모아묶기') return <모아묶기 그림={할것.그림} />;
  if (할것.갈래 === '덜어내기') return <덜어내기 그림={할것.그림} />;
  return <겹쳐보기 그림={할것.그림} />;
}

/** 창 제목입니다. */
export const 분수이름 = (visual: QuestionVisual): string | null => {
  const 할것 = 무엇을겹쳐볼까(visual);
  if (!할것) return null;
  if (할것.갈래 === '모아묶기') return '조각을 모아 묶어 보세요';
  if (할것.갈래 === '덜어내기') return '똑같이 나누어 몇 묶음만 가져와 보세요';
  return '두 띠를 겹쳐 보세요';
};

/** 무엇을 보아야 하는지입니다. 답은 말하지 않습니다. */
export const 분수보는차례 = (visual: QuestionVisual): string[] | null => {
  const 할것 = 무엇을겹쳐볼까(visual);
  if (!할것) return null;
  const { denominator: 분모, numerator: 분자 } = 할것.그림;
  if (할것.갈래 === '모아묶기') {
    return [
      `띠 하나에 1/${분모}짜리 조각이 ${분자}개씩 칠해져 있습니다.`,
      '손잡이를 끌어 조각을 왼쪽부터 차곡차곡 모아 보세요.',
      '띠가 몇 개 꽉 차고 몇 조각이 남는지 세어 보세요.',
    ];
  }
  if (할것.갈래 === '덜어내기') {
    return [
      `전체를 ${분모}묶음으로 똑같이 나눕니다.`,
      `손잡이를 끌어 그 가운데 ${분자}묶음만 가져와 보세요.`,
      '한 묶음이 얼마인지 먼저 보고, 가져온 만큼이 얼마인지 세어 보세요.',
    ];
  }
  return [
    '파란 띠는 가로를 나눈 것 중 몇 칸, 주황 띠는 세로를 나눈 것 중 몇 칸입니다.',
    '손잡이를 끌어 주황 띠를 내려 겹쳐 보세요.',
    '겹친 자리가 온 넓이의 몇 칸인지 세어 보세요. 두 띠보다 커지는지 작아지는지도 보세요.',
  ];
};
