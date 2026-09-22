import { useMemo, useState } from 'react';
import type { QuestionVisual } from '../types';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 직육면체 실험실 — 전개도를 접어 보고, 겨냥도를 돌려 보는 자리
// ────────────────────────────────────────────────────────────────────
// 지도서 5-2 각론2가 이 단원의 어려움을 그대로 적어 두었습니다.
//
//   "직육면체를 실제로 보이는 대로 그리면 안 보이는 쪽의 모양은
//    정확히 알 수가 없다. 따라서 안 보이는 부분을 나타내기 위해
//    점선을 통해 그린 것이 겨냥도이다. 그런데 겨냥도는 3차원을
//    2차원인 평면에 나타냈기 때문에 모양과 크기의 왜곡이 생길 수
//    있다."
//
// 평면도형과 달리 입체도형은 한눈에 전체를 볼 수 없습니다. 그래서
// 이 단원의 도움말은 '크게 보여 주기'로는 안 됩니다 — 크게 보여
// 주어도 뒤쪽은 여전히 안 보입니다.
//
// 지도서가 시키는 것은 하나입니다. 접었다 펼쳐 보라는 것입니다.
//
//   6차시 활동3 지도 도움말
//     "준비물 11의 전개도를 접었다 다시 펼쳐 보는 활동을 통해
//      전개도를 접었을 때 서로 겹치는 면이 있는지, 겹치는 선분의
//      길이는 어떠한지 등의 질문을 통해 직육면체의 전개도가 될 수
//      있는 조건을 생각해 보도록 한다."
//     "직육면체의 전개도를 직접 접어 보는 활동을 통해 만나는 점과
//      겹치는 선분을 이해할 수 있도록 지도한다."
//
//   그리고 아이에게 묻게 하는 것이 바로 이 문항들입니다.
//     "전개도를 접었을 때 점 ㅅ과 만나는 점을 말해 보세요."  점 ㄷ
//     "전개도를 접었을 때 선분 ㅅㅇ과 겹치는 선분을 말해 보세요." 선분 ㄷㄴ
//
// 교실에서는 종이를 접습니다. 화면에서는 손잡이를 끕니다. 이름표가
// 면을 따라 함께 올라가므로, 다 접히면 만나는 두 점이 한자리에
// 모입니다. 답은 말해 주지 않습니다 — 아이가 보고 읽습니다.
//
// 처음(손잡이가 왼쪽 끝)에는 문제에 실린 전개도와 똑같이 납작하게
// 보입니다. 카메라도 함께 기울어지기 때문입니다. 그래야 아이가
// '내가 보던 그 그림'이 일어서는 것으로 읽습니다.
// ════════════════════════════════════════════════════════════════════

type 점3 = [number, number, number];
type 점2 = [number, number];

type 전개도 = {
  cols: number[];
  rows: number[];
  cells: Array<{ col: number; row: number; text?: string; shade?: 1 | 2 }>;
  points?: Array<{ x: number; y: number; text: string }>;
};

type 겨냥도 = {
  width: number;
  depth: number;
  height: number;
  labelVertices?: boolean;
  shaded?: string[];
  shaded2?: string[];
  edgeLabels?: { width?: string; depth?: string; height?: string };
  flaw?: string;
};

type 실험 = { 갈래: '전개도접기'; 그림: 전개도 } | { 갈래: '겨냥도돌리기'; 그림: 겨냥도 };

// ── 무엇을 해 볼 수 있는 그림인가 ──────────────────────────────────
//
// 잘못 그린 겨냥도(flaw)는 돌리지 않습니다. 일부러 틀리게 그린
// 그림이라 3차원으로 되돌릴 수가 없고, 되돌려 놓으면 '무엇이
// 잘못인지'가 그림에서 사라져 문제가 못 쓰게 됩니다.
//
// 겨냥도를 돌려 보는 것이 도움이 되는 문항과 그렇지 않은 문항이
// 갈립니다. 5단원 2차시의 겨냥도 문항을 늘어놓고 보면 뚜렷합니다.
//
//   도움이 되는 것 — 한눈에 다 볼 수 없는 것을 세는 문항
//     "직육면체에서 모서리는 모두 몇 개일까요?"
//     "한 꼭짓점에서 만나는 면은 몇 개일까요?"
//     "서로 평행한 두 면은 모두 몇 쌍일까요?"
//     지도서가 겨냥도를 두고 "안 보이는 쪽의 모양은 정확히 알 수가
//     없다"고 한 바로 그 자리입니다. 돌려 보면 셀 수 있습니다.
//
//   도움이 되지 않는 것 — 말을 묻는 문항
//     "직사각형 6개로 둘러싸인 도형을 무엇이라고 할까요?"
//     "직육면체에서 면은 무엇일까요?"
//     돌려 보아도 답이 나오지 않습니다. 딴 길입니다.
//
// 그림에 이름·색칠·길이가 붙어 있으면 그것을 보라는 표시이므로
// 그대로 내줍니다. 아무 표시도 없으면 세는 문항일 때만 내줍니다.
export const 무엇을접어볼까 = (visual: QuestionVisual | undefined, prompt = ''): 실험 | null => {
  if (!visual) return null;
  if (visual.kind === 'box-net') {
    const 그림 = visual as unknown as 전개도;
    if (!그림.cells?.length) return null;
    return { 갈래: '전개도접기', 그림 };
  }
  if (visual.kind === 'box-drawing') {
    const 그림 = visual as unknown as 겨냥도;
    if (그림.flaw) return null;
    const 표시있음 = Boolean(그림.labelVertices || 그림.shaded?.length || 그림.shaded2?.length || 그림.edgeLabels);
    const 세는문항 = /몇 개|몇 쌍|몇 군데/.test(prompt);
    if (!표시있음 && !세는문항) return null;
    return { 갈래: '겨냥도돌리기', 그림 };
  }
  return null;
};

// ── 3차원 셈 ───────────────────────────────────────────────────────

const 빼기 = (a: 점3, b: 점3): 점3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const 외적 = (a: 점3, b: 점3): 점3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const 내적 = (a: 점3, b: 점3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** 점 A를 지나고 방향이 u인 직선을 축으로 q를 각도만큼 돌립니다(로드리게스). */
const 축돌리기 = (q: 점3, A: 점3, u: 점3, 각: number): 점3 => {
  const v = 빼기(q, A);
  const c = Math.cos(각);
  const s = Math.sin(각);
  const cr = 외적(u, v);
  const d = 내적(u, v) * (1 - c);
  return [
    A[0] + v[0] * c + cr[0] * s + u[0] * d,
    A[1] + v[1] * c + cr[1] * s + u[1] * d,
    A[2] + v[2] * c + cr[2] * s + u[2] * d,
  ];
};

const 판너비 = 344;
const 판높이 = 244;

/**
 * 카메라입니다. t가 0이면 위에서 곧게 내려다보므로 전개도가 문제에
 * 실린 그림 그대로 납작하게 보이고, t가 커질수록 기울어져 입체가
 * 드러납니다.
 */
const 카메라 = (t: number) => {
  const ψ = (-24 * Math.PI) / 180 * t;
  const φ = (54 * Math.PI) / 180 * t;
  return (p: 점3): { 점: 점2; 깊이: number } => {
    const x1 = p[0] * Math.cos(ψ) - p[1] * Math.sin(ψ);
    const y1 = p[0] * Math.sin(ψ) + p[1] * Math.cos(ψ);
    const z1 = p[2];
    // 위로 접힌 면(z가 큰 쪽)이 화면에서 위로 올라오게 합니다.
    const y2 = y1 * Math.cos(φ) - z1 * Math.sin(φ);
    const 깊이 = y1 * Math.sin(φ) + z1 * Math.cos(φ);
    return { 점: [x1, y2], 깊이 };
  };
};

/** 모든 점이 판 안에 들어오게 맞춥니다. */
const 맞추개 = (모든점: 점2[]) => {
  const xs = 모든점.map(([x]) => x);
  const ys = 모든점.map(([, y]) => y);
  const 왼 = Math.min(...xs);
  const 오 = Math.max(...xs);
  const 위 = Math.min(...ys);
  const 아래 = Math.max(...ys);
  const 여백 = 30;
  const 배 = Math.min(
    (판너비 - 여백 * 2) / Math.max(오 - 왼, 0.001),
    (판높이 - 여백 * 2) / Math.max(아래 - 위, 0.001),
  );
  const 가운데x = (오 + 왼) / 2;
  const 가운데y = (아래 + 위) / 2;
  return ([x, y]: 점2): 점2 => [판너비 / 2 + (x - 가운데x) * 배, 판높이 / 2 + (y - 가운데y) * 배];
};

const 폴리 = (pts: 점2[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

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

// 면은 속이 비치지 않게 칠합니다. 처음에 0.92로 두었더니 뒤에 있는
// 면의 글자와 모서리가 어슴푸레 비쳐, 여섯 면의 이름이 한꺼번에 보여
// 어느 것이 앞면인지 알 수 없었습니다. 상자는 속이 안 보이는 것이
// 맞습니다 — 안 보이기 때문에 돌려 보는 것입니다.
const 면색 = (shade?: 1 | 2) =>
  shade === 1 ? '#a9cfe8' : shade === 2 ? '#f0c08a' : '#ffffff';

// ── 전개도 접기 ────────────────────────────────────────────────────

type 면 = {
  /** 펼쳐 놓았을 때의 네 모퉁이입니다(격자 좌표, z는 0). */
  평면: 점3[];
  /** 접힌 뒤의 네 모퉁이입니다. */
  접힌: 점3[];
  shade?: 1 | 2;
  text?: string;
};

/**
 * 전개도를 t만큼 접습니다. t가 0이면 펼친 그대로, 1이면 다 접힌
 * 모습입니다. 화면과 시험이 같은 셈을 쓰도록 따로 빼 두었습니다 —
 * 시험이 딴 셈을 다시 쓰면 그것은 그림이 맞는지가 아니라 제가 두 번
 * 같은 생각을 했는지를 보는 것이 됩니다.
 */
export const 접기셈 = (그림: 전개도, t: number): { 면들: 면[]; 이름들: Array<{ 점: 점3; text: string }> } => {
  const { cols, rows, cells } = 그림;
  // 격자에서 각 칸의 모서리 자리를 구합니다.
  const x자리 = [0];
  cols.forEach((one) => x자리.push(x자리[x자리.length - 1] + one));
  const y자리 = [0];
  rows.forEach((one) => y자리.push(y자리[y자리.length - 1] + one));

  const 모퉁이 = (c: { col: number; row: number }): 점3[] => [
    [x자리[c.col], y자리[c.row], 0],
    [x자리[c.col + 1], y자리[c.row], 0],
    [x자리[c.col + 1], y자리[c.row + 1], 0],
    [x자리[c.col], y자리[c.row + 1], 0],
  ];

  // 이웃: 가로나 세로로 딱 붙어 있는 칸끼리입니다.
  const 이웃 = cells.map((이것, at) =>
    cells
      .map((other, 저at) => ({ other, 저at }))
      .filter(({ other, 저at }) => {
        if (저at === at) return false;
        const 가로이웃 = 이것.row === other.row && Math.abs(이것.col - other.col) === 1;
        const 세로이웃 = 이것.col === other.col && Math.abs(이것.row - other.row) === 1;
        return 가로이웃 || 세로이웃;
      })
      .map(({ 저at }) => 저at),
  );

  // 이웃이 가장 많은 칸을 바닥으로 삼습니다. 그 칸이 가만히 있고
  // 나머지가 그 둘레로 올라섭니다 — 종이 상자를 접는 것과 같습니다.
  let 뿌리 = 0;
  이웃.forEach((one, at) => {
    if (one.length > 이웃[뿌리].length) 뿌리 = at;
  });

  /** 두 칸이 함께 쓰는 모서리(두 점)를 찾습니다. */
  const 함께쓰는모서리 = (a: number, b: number): [점3, 점3] | null => {
    const A = 모퉁이(cells[a]);
    const B = 모퉁이(cells[b]);
    const 같은점 = A.filter((p) => B.some((q) => Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9));
    return 같은점.length === 2 ? [같은점[0], 같은점[1]] : null;
  };

  // 뿌리에서 넓혀 가며 각 면의 '접는 변환'을 쌓습니다.
  type 변환 = (p: 점3) => 점3;
  const 변환들: 변환[] = cells.map(() => (p: 점3) => p);
  const 본것 = cells.map(() => false);
  본것[뿌리] = true;
  const 줄: number[] = [뿌리];
  while (줄.length) {
    const 지금 = 줄.shift() as number;
    for (const 다음 of 이웃[지금]) {
      if (본것[다음]) continue;
      const 모서리 = 함께쓰는모서리(지금, 다음);
      if (!모서리) continue;
      본것[다음] = true;
      줄.push(다음);

      const [A, B] = 모서리;
      const 길이 = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      const u: 점3 = [(B[0] - A[0]) / 길이, (B[1] - A[1]) / 길이, 0];

      // 접히는 쪽이 위(z가 커지는 쪽)로 올라가도록 방향을 잡습니다.
      // 평면 위의 두 벡터를 외적하면 z 성분만 남으므로 그 부호만
      // 보면 됩니다.
      const 자식모퉁이 = 모퉁이(cells[다음]);
      const 자식가운데: 점3 = [
        자식모퉁이.reduce((s, p) => s + p[0], 0) / 4,
        자식모퉁이.reduce((s, p) => s + p[1], 0) / 4,
        0,
      ];
      const 부호 = 외적(u, 빼기(자식가운데, A))[2] > 0 ? 1 : -1;

      const 부모변환 = 변환들[지금];
      변환들[다음] = (p: 점3) => 부모변환(축돌리기(p, A, u, (Math.PI / 2) * 부호 * t));
    }
  }

  const 면들: 면[] = cells.map((c, at) => ({
    평면: 모퉁이(c),
    접힌: 모퉁이(c).map(변환들[at]),
    shade: c.shade,
    text: c.text,
  }));

  // 꼭짓점 이름은 면의 모퉁이에 붙여 함께 올라갑니다. 한 모퉁이를
  // 두 면이 함께 쓰면 이름도 둘 다 답니다 — 접었을 때 두 이름이
  // 한자리에 모이는 것을 보여 주는 것이 이 그림의 일입니다.
  const 이름들: Array<{ 점: 점3; text: string }> = [];
  for (const 하나 of 그림.points ?? []) {
    cells.forEach((c, at) => {
      모퉁이(c).forEach((p) => {
        if (Math.abs(p[0] - 하나.x) < 1e-9 && Math.abs(p[1] - 하나.y) < 1e-9) {
          이름들.push({ 점: 변환들[at](p), text: 하나.text });
        }
      });
    });
  }

  return { 면들, 이름들 };
};

/** 시험이 쓰는 문입니다. 다 접었을 때의 여섯 면을 그대로 내줍니다. */
export const 접은면들 = (visual: QuestionVisual, t: number): 점3[][] =>
  접기셈(visual as unknown as 전개도, t).면들.map((one) => one.접힌);

function 전개도접기({ 그림 }: { 그림: 전개도 }) {
  const [t, setT] = useState(0);
  const { 면들, 이름들 } = useMemo(() => 접기셈(그림, t), [그림, t]);

  const 찍개 = 카메라(t);
  // 지금 이 순간의 도형에 맞춰 크기를 잡습니다.
  //
  // 처음에는 펼친 전개도와 다 접은 상자를 함께 재어 하나의 크기로
  // 잡았는데, 펼친 전개도가 훨씬 넓다 보니 다 접고 나면 상자가 판의
  // 한구석에 손톱만 하게 남았습니다. 접힐수록 도형이 작아지므로
  // 그때그때 다시 재어 키웁니다 — 카메라가 따라붙는 셈입니다.
  const 화면으로 = useMemo(() => {
    const 모두: 점2[] = [];
    면들.forEach((f) => {
      f.접힌.forEach((p) => 모두.push(찍개(p).점));
    });
    return 맞추개(모두);
  }, [면들, t]);

  const 그릴면 = 면들
    .map((f) => {
      const 찍힌 = f.접힌.map(찍개);
      return {
        pts: 찍힌.map((one) => 화면으로(one.점)),
        깊이: 찍힌.reduce((s, one) => s + one.깊이, 0) / 찍힌.length,
        shade: f.shade,
        text: f.text,
      };
    })
    // 멀리 있는 면부터 그립니다.
    .sort((a, b) => a.깊이 - b.깊이);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="전개도를 접어 직육면체를 만드는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {그릴면.map((f, at) => {
          const 가운데: 점2 = [
            f.pts.reduce((s, p) => s + p[0], 0) / f.pts.length,
            f.pts.reduce((s, p) => s + p[1], 0) / f.pts.length,
          ];
          return (
            <g key={at}>
              <polygon points={폴리(f.pts)} fill={면색(f.shade)} stroke="#41607a" strokeWidth="2.5" strokeLinejoin="round" />
              {f.text && (
                <text x={가운데[0]} y={가운데[1] + 5} textAnchor="middle" fill="#24364a" fontSize="15" fontWeight="900">
                  {f.text}
                </text>
              )}
            </g>
          );
        })}
        {/* 꼭짓점 이름은 도형 바깥으로 조금 밀어 놓습니다. 모퉁이에
            그대로 찍으면 모서리 위에 얹혀 읽히지 않습니다.

            그리고 다 접으면 여러 이름이 한 꼭짓점에 모입니다. 그것이
            바로 "접었을 때 점 ㅋ과 만나는 점은?"의 답인데, 그대로
            찍으면 둘이 정확히 겹쳐 한 글자로만 보입니다. 같은 자리에
            모인 이름들은 옆으로 조금씩 벌려 나란히 놓습니다. */}
        {(() => {
          const 찍힌이름 = 이름들.map((하나) => ({ text: 하나.text, 자리: 화면으로(찍개(하나.점).점) }));
          // 같은 자리에 모인 것끼리 묶습니다.
          const 묶음: Array<{ 자리: 점2; 글자: string[] }> = [];
          찍힌이름.forEach((하나) => {
            const 있던것 = 묶음.find((one) => Math.hypot(one.자리[0] - 하나.자리[0], one.자리[1] - 하나.자리[1]) < 6);
            if (있던것) {
              if (!있던것.글자.includes(하나.text)) 있던것.글자.push(하나.text);
            } else {
              묶음.push({ 자리: 하나.자리, 글자: [하나.text] });
            }
          });
          return 묶음.flatMap((one, 묶음번호) => {
            const dx = one.자리[0] - 판너비 / 2;
            const dy = one.자리[1] - 판높이 / 2;
            const 멀기 = Math.hypot(dx, dy) || 1;
            const 밀린x = one.자리[0] + (dx / 멀기) * 14;
            const 밀린y = one.자리[1] + (dy / 멀기) * 14;
            // 여럿이면 가로로 나란히 벌립니다.
            const 사이 = 15;
            const 시작 = -((one.글자.length - 1) * 사이) / 2;
            return one.글자.map((글, at) => (
              <text
                key={`${묶음번호}-${글}`}
                x={밀린x + 시작 + at * 사이}
                y={밀린y + 5}
                textAnchor="middle"
                fill="#0f7175"
                fontSize="15"
                fontWeight="900"
              >
                {글}
              </text>
            ));
          });
        })()}
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="전개도를 접기"
        왼쪽말="펼친 전개도"
        오른쪽말="다 접음"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? (그림.points?.length
              ? '다 접었습니다. 한자리에 모인 두 이름을 읽어 보세요.'
              : '다 접었습니다. 빈 곳 없이 상자가 되었는지, 겹친 면은 없는지 보세요.')
          : '손잡이를 끌어 전개도를 접어 보세요.'}
      </p>
    </div>
  );
}

// ── 겨냥도 돌려 보기 ──────────────────────────────────────────────
//
// 지도서가 겨냥도를 두고 "안 보이는 쪽의 모양은 정확히 알 수가 없다"
// 고 적었습니다. 그래서 돌려 봅니다. 점선으로 숨어 있던 모서리가
// 돌아 나오면, 아이는 그 점선이 무엇이었는지 눈으로 확인합니다.
//
// 꼭짓점 이름은 문제 그림과 같은 차례입니다(윗면 ㄱㄴㄷㄹ, 아랫면
// ㅁㅂㅅㅇ, ㄱ 아래가 ㅁ).

const 꼭짓점차례 = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'];
const 면모퉁이: Record<string, string[]> = {
  top: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
  bottom: ['ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'],
  front: ['ㄴ', 'ㅂ', 'ㅅ', 'ㄷ'],
  back: ['ㄱ', 'ㅁ', 'ㅇ', 'ㄹ'],
  left: ['ㄱ', 'ㄴ', 'ㅂ', 'ㅁ'],
  right: ['ㄹ', 'ㄷ', 'ㅅ', 'ㅇ'],
};

function 겨냥도돌리기({ 그림 }: { 그림: 겨냥도 }) {
  // 0.5에서 문제에 실린 그림과 거의 같게 보입니다. 거기서 시작해
  // 좌우로 돌려 볼 수 있게 합니다.
  const [돌림, set돌림] = useState(0.5);

  const { 자리, 면들 } = useMemo(() => {
    // 비율은 살리되 너무 치우치지 않게 눌러 줍니다(문제 그림과 같은 셈).
    const 누르기 = (값: number, 딴것: number) => Math.min(Math.max(값 / 딴것, 0.45), 2.2);
    const w = 1;
    const d = 누르기(그림.depth, 그림.width);
    const h = 누르기(그림.height, 그림.width);
    const 자리: Record<string, 점3> = {
      ㄴ: [-w / 2, -d / 2, h / 2],
      ㄷ: [w / 2, -d / 2, h / 2],
      ㅂ: [-w / 2, -d / 2, -h / 2],
      ㅅ: [w / 2, -d / 2, -h / 2],
      ㄱ: [-w / 2, d / 2, h / 2],
      ㄹ: [w / 2, d / 2, h / 2],
      ㅁ: [-w / 2, d / 2, -h / 2],
      ㅇ: [w / 2, d / 2, -h / 2],
    };
    return { 자리, 면들: Object.entries(면모퉁이) };
  }, [그림.width, 그림.depth, 그림.height]);

  // 좌우로 한 바퀴 돌립니다. 위아래 기울기는 고정입니다 — 기울기까지
  // 움직이면 무엇을 보고 있는지 놓치기 쉽습니다.
  const ψ = ((돌림 - 0.5) * 2 * Math.PI) - (24 * Math.PI) / 180;
  const φ = (52 * Math.PI) / 180;
  const 찍개 = (p: 점3): { 점: 점2; 깊이: number } => {
    const x1 = p[0] * Math.cos(ψ) - p[1] * Math.sin(ψ);
    const y1 = p[0] * Math.sin(ψ) + p[1] * Math.cos(ψ);
    const y2 = y1 * Math.cos(φ) - p[2] * Math.sin(φ);
    return { 점: [x1, y2], 깊이: y1 * Math.sin(φ) + p[2] * Math.cos(φ) };
  };

  // 어느 각도로 돌려도 판을 벗어나지 않도록, 가장 큰 경우로 크기를 잡습니다.
  const 화면으로 = useMemo(() => {
    const 모두: 점2[] = [];
    for (let 각 = 0; 각 < 360; 각 += 15) {
      const a = (각 * Math.PI) / 180;
      Object.values(자리).forEach((p) => {
        const x1 = p[0] * Math.cos(a) - p[1] * Math.sin(a);
        const y1 = p[0] * Math.sin(a) + p[1] * Math.cos(a);
        모두.push([x1, y1 * Math.cos(φ) - p[2] * Math.sin(φ)]);
      });
    }
    return 맞추개(모두);
  }, [자리, φ]);

  const 칠한것 = new Set(그림.shaded ?? []);
  const 칠한것2 = new Set(그림.shaded2 ?? []);

  const 그릴면 = 면들
    .map(([이름, 모퉁이]) => {
      const 찍힌 = 모퉁이.map((n) => 찍개(자리[n]));
      return {
        이름,
        pts: 찍힌.map((one) => 화면으로(one.점)),
        깊이: 찍힌.reduce((s, one) => s + one.깊이, 0) / 4,
        shade: 칠한것.has(이름) ? (1 as const) : 칠한것2.has(이름) ? (2 as const) : undefined,
      };
    })
    .sort((a, b) => a.깊이 - b.깊이);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="겨냥도를 돌려 보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {그릴면.map((f) => (
          <polygon
            key={f.이름}
            points={폴리(f.pts)}
            fill={면색(f.shade)}
            stroke="#41607a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
        {그림.labelVertices &&
          꼭짓점차례.map((이름) => {
            const 찍힌 = 찍개(자리[이름]);
            const [x, y] = 화면으로(찍힌.점);
            // 가운데에서 바깥으로 조금 밀어 모서리 위에 얹히지 않게 합니다.
            const dx = x - 판너비 / 2;
            const dy = y - 판높이 / 2;
            return (
              <text
                key={이름}
                x={x + dx * 0.13}
                y={y + dy * 0.13 + 5}
                textAnchor="middle"
                fill="#0f7175"
                fontSize="14"
                fontWeight="900"
              >
                {이름}
              </text>
            );
          })}
      </svg>
      <손잡이
        값={돌림}
        바꾸기={(다음) => set돌림(다음)}
        이름="겨냥도를 좌우로 돌리기"
        왼쪽말="왼쪽으로"
        오른쪽말="오른쪽으로"
      />
      <p className="symmetry-say">
        {칠한것.size || 칠한것2.size
          ? '돌려서 색칠한 면의 뒤쪽을 보세요. 마주 보는 면이 어느 것인지 찾을 수 있습니다.'
          : '돌려 보세요. 겨냥도에서 점선으로 숨어 있던 모서리가 앞으로 나옵니다.'}
      </p>
    </div>
  );
}

// ── 바깥으로 내보내는 것 ───────────────────────────────────────────

export function BoxLab({ visual, prompt = '' }: { visual: QuestionVisual; prompt?: string }) {
  const 할것 = useMemo(() => 무엇을접어볼까(visual, prompt), [visual, prompt]);
  if (!할것) return null;
  if (할것.갈래 === '전개도접기') return <전개도접기 그림={할것.그림} />;
  return <겨냥도돌리기 그림={할것.그림} />;
}

/** 창 제목입니다. */
export const 접기이름 = (visual: QuestionVisual, prompt = ''): string | null => {
  const 할것 = 무엇을접어볼까(visual, prompt);
  if (!할것) return null;
  return 할것.갈래 === '전개도접기' ? '전개도를 접어 보세요' : '겨냥도를 돌려 보세요';
};

/** 무엇을 보아야 하는지입니다. 답은 말하지 않습니다. */
export const 접기보는차례 = (visual: QuestionVisual, prompt = ''): string[] | null => {
  const 할것 = 무엇을접어볼까(visual, prompt);
  if (!할것) return null;
  if (할것.갈래 === '전개도접기') {
    return [
      '손잡이를 끌면 전개도가 상자처럼 접힙니다.',
      할것.그림.points?.length
        ? '이름표가 면을 따라 함께 올라갑니다. 다 접었을 때 한자리에 모이는 두 이름을 찾으세요.'
        : '다 접었을 때 빈 곳이 없는지, 두 면이 겹치지는 않는지 보세요.',
      '겹치는 모서리끼리는 길이가 같고, 마주 보는 면끼리는 모양과 크기가 같습니다.',
    ];
  }
  return [
    '겨냥도는 3차원을 평면에 그린 것이라 뒤쪽이 보이지 않습니다.',
    '손잡이를 끌어 좌우로 돌려 보세요.',
    '점선으로 숨어 있던 모서리와 뒤쪽 면이 앞으로 나옵니다.',
  ];
};
