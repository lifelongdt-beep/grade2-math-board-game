import { useMemo, useState } from 'react';
import type { QuestionVisual } from '../types';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 넓이 실험실 — 잘라 옮기고, 두 개를 붙여 보는 자리
// ────────────────────────────────────────────────────────────────────
// 5-1 6단원은 넓이 공식을 외우게 하는 단원이 아닙니다. 지도서는 네
// 도형의 공식을 모두 '도형을 바꿔서' 끌어냅니다. 그 바꾸기에 이름까지
// 붙여 두었습니다 — 등적 변형과 배적 변형입니다.
//
//   평행사변형 (지도서 132쪽)
//     "평행사변형을 점선을 따라 자르고 길이가 같은 변끼리 붙여서
//      직사각형을 만들어 보세요."
//     → 밑변은 직사각형의 가로, 높이는 세로. 그래서 밑변 × 높이.
//
//   삼각형 (135쪽)
//     "똑같은 삼각형 2개를 붙여서 평행사변형을 만들어 보세요."
//     "평행사변형의 넓이는 삼각형의 넓이의 2배입니다."
//     → 밑변 × 높이 ÷ 2.
//
//   사다리꼴 (139쪽)
//     "똑같은 사다리꼴 2개를 붙여서 평행사변형을 만들어 보세요."
//     "평행사변형의 밑변은 사다리꼴의 윗변과 아랫변의 합과 같고"
//     → (윗변 + 아랫변) × 높이 ÷ 2.
//
//   마름모 (142쪽)
//     "마름모의 꼭짓점을 지나고 마름모를 둘러싸는 직사각형을 그려
//      보세요." "직사각형의 넓이는 마름모의 넓이의 2배입니다."
//     → 한 대각선 × 다른 대각선 ÷ 2.
//
// 지도서가 못을 박아 둡니다 — "등적 변형은 다른 평면도형의 넓이를
// 구하는 방법을 학습할 때도 중요하게 활용되는 개념이므로 이번 차시에서
// 충분히 이해할 수 있도록 지도한다."
//
// 교실에서는 종이를 자르고 붙입니다. 화면에서는 손잡이를 끕니다.
// 공식은 말해 주지 않습니다 — 잘라 옮긴 것이 무엇이 되는지 아이가
// 보고, 그 도형의 넓이를 이미 알고 있으니 스스로 잇습니다.
// ════════════════════════════════════════════════════════════════════

type 점 = [number, number];

type 도형항목 = {
  shape: string;
  points?: 점[];
  edgeLabels?: Array<{ from: number; to: number; text: string; span?: boolean }>;
  heightMark?: { fromVertex: number; text: string };
  diagonals?: Array<{ from: number; to: number; text: string }>;
};

type 실험 =
  | { 갈래: '평행사변형자르기'; 도형: 도형항목 }
  | { 갈래: '삼각형두개'; 도형: 도형항목 }
  | { 갈래: '사다리꼴두개'; 도형: 도형항목 }
  | { 갈래: '마름모감싸기'; 도형: 도형항목 };

// ── 무엇을 해 볼 수 있는 그림인가 ──────────────────────────────────
//
// 넓이 문항의 그림만 봅니다. 둘레를 묻는 문항(변에 길이만 적힌 것)과
// 이름을 묻는 문항(길이가 아예 없는 것)은 자를 것이 없습니다.
// 넓이 문항은 꼭짓점을 직접 넘기므로(points) 그것으로 가릅니다.
export const 무엇을잘라볼까 = (visual: QuestionVisual | undefined): 실험 | null => {
  if (visual?.kind !== 'figure-set') return null;
  const items = (visual as unknown as { items: 도형항목[] }).items ?? [];
  if (items.length !== 1) return null;
  const 도형 = items[0];
  if (!도형.points || 도형.points.length < 3) return null;

  // 마름모는 두 대각선이 적혀 있어야 넓이 문항입니다.
  if (도형.shape === '마름모') {
    return 도형.diagonals?.length === 2 ? { 갈래: '마름모감싸기', 도형 } : null;
  }
  // 나머지 셋은 높이가 그어져 있어야 넓이 문항입니다.
  if (!도형.heightMark) return null;
  if (도형.shape === '평행사변형') return { 갈래: '평행사변형자르기', 도형 };
  if (도형.shape === '사다리꼴') return { 갈래: '사다리꼴두개', 도형 };
  if (도형.points.length === 3) return { 갈래: '삼각형두개', 도형 };
  return null;
};

// ── 그리기에 쓰는 공통 조각 ────────────────────────────────────────

const 판너비 = 340;
const 판높이 = 250;

/**
 * 도형을 판 안에 들어오게 맞춥니다. 자르고 붙이면 도형이 넓어지므로
 * (삼각형 둘을 붙이면 가로가 거의 두 배가 됩니다) 움직임이 끝났을
 * 때의 크기까지 미리 재어 두고 그 크기에 맞춥니다. 그러지 않으면
 * 손잡이를 끌수록 도형이 판 밖으로 나갑니다.
 */
const 맞추개 = (모든점: 점[]) => {
  const xs = 모든점.map(([x]) => x);
  const ys = 모든점.map(([, y]) => y);
  const 왼 = Math.min(...xs);
  const 오 = Math.max(...xs);
  const 위 = Math.min(...ys);
  const 아래 = Math.max(...ys);
  const 여백 = 34;
  const 배 = Math.min((판너비 - 여백 * 2) / Math.max(오 - 왼, 0.001), (판높이 - 여백 * 2) / Math.max(아래 - 위, 0.001));
  const 가운데x = (오 + 왼) / 2;
  const 가운데y = (아래 + 위) / 2;
  return ([x, y]: 점): 점 => [판너비 / 2 + (x - 가운데x) * 배, 판높이 / 2 + (y - 가운데y) * 배];
};

const 폴리 = (pts: 점[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** 점 M을 중심으로 각도만큼 돌립니다. */
export const 돌리기 = (pts: 점[], M: 점, 라디안: number): 점[] =>
  pts.map(([x, y]) => {
    const dx = x - M[0];
    const dy = y - M[1];
    return [M[0] + dx * Math.cos(라디안) - dy * Math.sin(라디안), M[1] + dx * Math.sin(라디안) + dy * Math.cos(라디안)] as 점;
  });

/** 세로선 x = 자를곳 의 한쪽만 남깁니다(Sutherland–Hodgman). */
export const 세로로자르기 = (pts: 점[], 자를곳: number, 왼쪽을: boolean): 점[] => {
  const 남기나 = (x: number) => (왼쪽을 ? x <= 자를곳 + 1e-9 : x >= 자를곳 - 1e-9);
  const 남은것: 점[] = [];
  for (let at = 0; at < pts.length; at += 1) {
    const 이것 = pts[at];
    const 다음 = pts[(at + 1) % pts.length];
    if (남기나(이것[0])) 남은것.push(이것);
    const 이쪽 = 이것[0] < 자를곳;
    const 저쪽 = 다음[0] < 자를곳;
    if (이쪽 !== 저쪽) {
      const 몫 = (자를곳 - 이것[0]) / (다음[0] - 이것[0]);
      남은것.push([자를곳, 이것[1] + (다음[1] - 이것[1]) * 몫]);
    }
  }
  return 남은것;
};

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

/** 도형에 적혀 있던 길이를 그대로 읽어 옵니다. */
const 길이글 = (도형: 도형항목, 찾을말: string): string | null =>
  도형.edgeLabels?.find((one) => one.text.includes(찾을말))?.text.replace(찾을말, '').trim() ?? null;

const 판 = (
  <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
);

const 조각색 = { 진한: '#0f7175', 연한: '#8fb6c4', 밑그림: '#dbe7ee' };

// ── 평행사변형: 잘라서 옮기면 직사각형 (등적 변형) ────────────────

function 평행사변형자르기({ 도형 }: { 도형: 도형항목 }) {
  const [t, setT] = useState(0);
  const pts = 도형.points as 점[];
  // 0 왼쪽 위, 1 오른쪽 위, 2 오른쪽 아래, 3 왼쪽 아래입니다.
  const 자를곳 = pts[0][0];
  const 옮길거리 = pts[1][0] - pts[0][0];

  const 왼조각 = useMemo(() => 세로로자르기(pts, 자를곳, true), [pts, 자를곳]);
  const 남은조각 = useMemo(() => 세로로자르기(pts, 자를곳, false), [pts, 자를곳]);
  const 옮긴조각 = 왼조각.map(([x, y]) => [x + 옮길거리 * t, y] as 점);

  // 다 옮겼을 때까지 판에 들어오도록 크기를 미리 잡습니다.
  const 화면으로 = useMemo(
    () => 맞추개([...pts, ...왼조각.map(([x, y]) => [x + 옮길거리, y] as 점)]),
    [pts, 왼조각, 옮길거리],
  );

  const 밑변 = 길이글(도형, '밑변');
  const 높이 = 도형.heightMark?.text.replace('높이', '').trim();

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="평행사변형을 잘라 직사각형으로 만드는 그림">
        {판}
        {/* 처음 모양을 흐리게 남겨 둡니다. 어디가 어디로 갔는지 보입니다. */}
        <polygon points={폴리(pts.map(화면으로))} fill="none" stroke={조각색.밑그림} strokeWidth="2.5" />
        <polygon points={폴리(남은조각.map(화면으로))} fill="rgba(15, 113, 117, 0.14)" stroke={조각색.진한} strokeWidth="3" strokeLinejoin="round" />
        <polygon points={폴리(옮긴조각.map(화면으로))} fill="rgba(224, 138, 30, 0.2)" stroke="#e08a1e" strokeWidth="3" strokeLinejoin="round" />
        {/* 자른 자리입니다. 지도서가 '점선을 따라 자르고'라고 합니다. */}
        <line
          x1={화면으로([자를곳, Math.min(...pts.map(([, y]) => y))])[0]}
          y1={화면으로([자를곳, Math.min(...pts.map(([, y]) => y))])[1]}
          x2={화면으로([자를곳, Math.max(...pts.map(([, y]) => y))])[0]}
          y2={화면으로([자를곳, Math.max(...pts.map(([, y]) => y))])[1]}
          stroke="#e08a1e"
          strokeWidth="2"
          strokeDasharray="7 5"
        />
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="자른 조각을 오른쪽으로 옮기기"
        왼쪽말="평행사변형"
        오른쪽말="잘라 옮기기"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? `직사각형이 되었습니다. 가로는 밑변${밑변 ? ` ${밑변}` : ''}, 세로는 높이${높이 ? ` ${높이}` : ''}입니다.`
          : '주황색 조각을 오른쪽 끝으로 옮겨 보세요. 무슨 도형이 될까요?'}
      </p>
    </div>
  );
}

// ── 삼각형·사다리꼴: 똑같은 것 두 개를 붙이면 평행사변형 (배적 변형) ──

function 두개붙이기({
  도형,
  돌리는변,
  이름,
  끝말,
}: {
  도형: 도형항목;
  /** 이 변의 한가운데를 잡고 반 바퀴 돌립니다. */
  돌리는변: [number, number];
  이름: string;
  끝말: string;
}) {
  const [t, setT] = useState(0);
  const pts = 도형.points as 점[];
  const M: 점 = [
    (pts[돌리는변[0]][0] + pts[돌리는변[1]][0]) / 2,
    (pts[돌리는변[0]][1] + pts[돌리는변[1]][1]) / 2,
  ];
  const 돈것 = 돌리기(pts, M, Math.PI * t);
  const 화면으로 = useMemo(() => 맞추개([...pts, ...돌리기(pts, M, Math.PI)]), [pts, M[0], M[1]]);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label={`똑같은 ${이름} 두 개를 붙이는 그림`}>
        {판}
        <polygon points={폴리(pts.map(화면으로))} fill="rgba(15, 113, 117, 0.14)" stroke={조각색.진한} strokeWidth="3" strokeLinejoin="round" />
        <polygon points={폴리(돈것.map(화면으로))} fill="rgba(224, 138, 30, 0.2)" stroke="#e08a1e" strokeWidth="3" strokeLinejoin="round" />
        {/* 돌리는 자리에 핀을 꽂습니다. */}
        <circle cx={화면으로(M)[0]} cy={화면으로(M)[1]} r="5.5" fill="#f0a202" stroke="#8a5a00" strokeWidth="2" />
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름={`똑같은 ${이름}을 반 바퀴 돌려 붙이기`}
        왼쪽말={`${이름} 하나`}
        오른쪽말="붙이기"
      />
      <p className="symmetry-say">
        {t > 0.99 ? 끝말 : `노란 점을 잡고 똑같은 ${이름} 하나를 반 바퀴 돌려 붙여 보세요.`}
      </p>
    </div>
  );
}

// ── 마름모: 둘러싸는 직사각형의 반 (배적 변형) ────────────────────
//
// 지도서 142쪽이 "마름모의 꼭짓점을 지나고 마름모를 둘러싸는 직사각형을
// 그려 보세요"라고 합니다. 직사각형에서 마름모를 뺀 나머지는 네 귀퉁이
// 삼각형인데, 그 넷을 안으로 옮기면 마름모를 꼭 덮습니다. 그래서
// 직사각형의 넓이가 마름모의 두 배입니다.
//
// 옮기는 방법은 '마름모의 변을 축으로 접기'가 아니라 '변의 한가운데를
// 잡고 반 바퀴 돌리기'입니다. 처음에 접기로 만들었다가 시험에서
// 잡혔습니다 — 귀퉁이의 직각 꼭짓점을 변에 비추면 두 대각선의 길이가
// 같을 때(정사각형일 때)에만 가운데로 갑니다. 대각선이 12 cm와 9 cm인
// 마름모에서는 마름모 밖으로 삐져나갔습니다. 반 바퀴 돌리면 어떤
// 마름모에서든 직각 꼭짓점이 정확히 가운데로 옵니다.
//
// 지도서가 함께 못 박아 둔 것도 그립니다 — "직사각형의 가로, 세로에
// 해당하는 부분은 마름모의 한 변의 길이가 아니라 대각선의 길이임을
// 강조하여 지도한다."

function 마름모감싸기({ 도형 }: { 도형: 도형항목 }) {
  const [t, setT] = useState(0);
  const pts = 도형.points as 점[];
  // 0 위, 1 오른쪽, 2 아래, 3 왼쪽입니다.
  const 왼 = Math.min(...pts.map(([x]) => x));
  const 오 = Math.max(...pts.map(([x]) => x));
  const 위 = Math.min(...pts.map(([, y]) => y));
  const 아래 = Math.max(...pts.map(([, y]) => y));
  const 네모: 점[] = [
    [왼, 위],
    [오, 위],
    [오, 아래],
    [왼, 아래],
  ];
  const 화면으로 = useMemo(() => 맞추개(네모), [왼, 오, 위, 아래]);

  // 네 귀퉁이 삼각형입니다. 각각 마름모의 한 변의 한가운데를 잡고
  // 반 바퀴 돌리면 마름모의 네 조각 자리에 하나씩 들어앉습니다.
  const 귀퉁이 = [
    { 삼각: [pts[0], [오, 위] as 점, pts[1]] as 점[], A: pts[0], B: pts[1] },
    { 삼각: [pts[1], [오, 아래] as 점, pts[2]] as 점[], A: pts[1], B: pts[2] },
    { 삼각: [pts[2], [왼, 아래] as 점, pts[3]] as 점[], A: pts[2], B: pts[3] },
    { 삼각: [pts[3], [왼, 위] as 점, pts[0]] as 점[], A: pts[3], B: pts[0] },
  ].map(({ 삼각, A, B }) => ({ 삼각, 한가운데: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] as 점 }));

  const 대각선글 = 도형.diagonals?.map((one) => one.text) ?? [];

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="마름모를 둘러싸는 직사각형을 그리는 그림">
        {판}
        <polygon points={폴리(네모.map(화면으로))} fill="none" stroke={조각색.연한} strokeWidth="2.5" strokeDasharray="8 5" />
        <polygon points={폴리(pts.map(화면으로))} fill="rgba(15, 113, 117, 0.14)" stroke={조각색.진한} strokeWidth="3" strokeLinejoin="round" />
        {귀퉁이.map(({ 삼각, 한가운데 }, at) => (
          <polygon
            key={at}
            points={폴리(돌리기(삼각, 한가운데, Math.PI * t).map(화면으로))}
            fill="rgba(224, 138, 30, 0.24)"
            stroke="#e08a1e"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
        {/* 두 대각선입니다. 가로·세로가 변이 아니라 대각선임을 보이는 것이
            이 그림의 일입니다. */}
        <line x1={화면으로(pts[3])[0]} y1={화면으로(pts[3])[1]} x2={화면으로(pts[1])[0]} y2={화면으로(pts[1])[1]} stroke="#b4532a" strokeWidth="2" strokeDasharray="6 4" />
        <line x1={화면으로(pts[0])[0]} y1={화면으로(pts[0])[1]} x2={화면으로(pts[2])[0]} y2={화면으로(pts[2])[1]} stroke="#b4532a" strokeWidth="2" strokeDasharray="6 4" />
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="네 귀퉁이를 안으로 돌려 넣기"
        왼쪽말="둘러싼 직사각형"
        오른쪽말="귀퉁이 돌리기"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? '네 귀퉁이가 마름모를 꼭 덮었습니다. 직사각형은 마름모의 두 배입니다.'
          : `직사각형의 가로와 세로는 마름모의 변이 아니라 두 대각선${대각선글.length === 2 ? `(${대각선글.join(', ')})` : ''}입니다. 귀퉁이를 안으로 돌려 넣어 보세요.`}
      </p>
    </div>
  );
}

// ── 바깥으로 내보내는 것 ───────────────────────────────────────────

export function AreaLab({ visual }: { visual: QuestionVisual }) {
  const 할것 = useMemo(() => 무엇을잘라볼까(visual), [visual]);
  if (!할것) return null;
  if (할것.갈래 === '평행사변형자르기') return <평행사변형자르기 도형={할것.도형} />;
  if (할것.갈래 === '삼각형두개') {
    // 0 꼭짓점, 1 밑변의 오른쪽 끝, 2 밑변의 왼쪽 끝입니다.
    // 밑변이 아닌 변(꼭짓점–오른쪽 끝)의 한가운데를 잡고 돌립니다.
    return (
      <두개붙이기
        도형={할것.도형}
        돌리는변={[0, 1]}
        이름="삼각형"
        끝말="평행사변형이 되었습니다. 평행사변형의 넓이는 삼각형의 두 배입니다."
      />
    );
  }
  if (할것.갈래 === '사다리꼴두개') {
    // 0 윗변 왼쪽, 1 윗변 오른쪽, 2 아랫변 오른쪽, 3 아랫변 왼쪽입니다.
    // 오른쪽 변의 한가운데를 잡고 돌립니다.
    return (
      <두개붙이기
        도형={할것.도형}
        돌리는변={[1, 2]}
        이름="사다리꼴"
        끝말="평행사변형이 되었습니다. 그 밑변은 윗변과 아랫변을 더한 길이이고, 넓이는 사다리꼴의 두 배입니다."
      />
    );
  }
  return <마름모감싸기 도형={할것.도형} />;
}

/** 창 제목입니다. */
export const 자르기이름 = (visual: QuestionVisual): string | null => {
  const 할것 = 무엇을잘라볼까(visual);
  if (!할것) return null;
  if (할것.갈래 === '평행사변형자르기') return '잘라서 직사각형으로 만들어 보세요';
  if (할것.갈래 === '삼각형두개') return '똑같은 삼각형 두 개를 붙여 보세요';
  if (할것.갈래 === '사다리꼴두개') return '똑같은 사다리꼴 두 개를 붙여 보세요';
  return '마름모를 둘러싸는 직사각형을 보세요';
};

/** 무엇을 보아야 하는지입니다. 공식은 말하지 않습니다. */
export const 자르기보는차례 = (visual: QuestionVisual): string[] | null => {
  const 할것 = 무엇을잘라볼까(visual);
  if (!할것) return null;
  if (할것.갈래 === '평행사변형자르기') {
    return [
      '주황색 점선이 자르는 자리입니다.',
      '손잡이를 끌어 잘린 조각을 오른쪽 끝으로 옮겨 보세요.',
      '무슨 도형이 되는지, 그 도형의 가로와 세로가 무엇인지 보세요.',
    ];
  }
  if (할것.갈래 === '삼각형두개') {
    return [
      '똑같은 삼각형이 하나 더 있습니다.',
      '노란 점을 잡고 반 바퀴 돌려 붙여 보세요.',
      '둘을 붙인 도형의 넓이는 삼각형 하나의 몇 배인지 보세요.',
    ];
  }
  if (할것.갈래 === '사다리꼴두개') {
    return [
      '똑같은 사다리꼴이 하나 더 있습니다.',
      '노란 점을 잡고 반 바퀴 돌려 붙여 보세요.',
      '둘을 붙인 평행사변형의 밑변이 얼마인지 보세요.',
    ];
  }
  return [
    '마름모를 둘러싸는 직사각형이 점선으로 그려져 있습니다.',
    '직사각형의 가로와 세로는 마름모의 변이 아니라 두 대각선입니다.',
    '네 귀퉁이를 안으로 돌려 넣어, 마름모를 꼭 덮는지 보세요.',
  ];
};
