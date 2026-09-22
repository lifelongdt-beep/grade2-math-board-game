import { useMemo, useState } from 'react';
import type { QuestionVisual } from '../types';
import { CHANCE_FILL } from './QuestionVisualGraphic';
import { playTapSound } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 평균과 가능성 실험실 — 고르게 만들어 보고, 돌려 보고, 꺼내 보는 자리
// ────────────────────────────────────────────────────────────────────
// 지도서 5-2 각론2 단원 개관이 이 단원의 두 축을 한 문장씩으로 적어
// 두었습니다.
//
//   평균
//     "평균의 개념은 수집한 자료의 값을 고르게 하여 자료의 대푯값을
//      정하는 것을 바탕으로 하고 있다. 이에 다양한 조작 활동을 통해
//      평균을 구하는 방법을 학습하고…"
//
//   가능성
//     "가능성의 개념은 실생활의 예를 통해 … 사건이 일어날 가능성이
//      직관적으로 파악되는 상황들을 제시하도록 한다."
//     [6수04-06] "제비뽑기, 동전 던지기, 주사위 던지기, 회전판
//      돌리기 등과 같은 간단한 실험 결과를 나타낸 표나 그래프를 보고
//      사건이 일어날 가능성을 비교하고 대략적으로 예상하게 한다."
//
// 그래서 셋을 둡니다.
//
//   · 고르게 만들기 — 자료를 막대로 세우고, 손잡이를 끌면 높은 것이
//     낮은 것으로 흘러 들어가 모두 같은 높이가 됩니다. 그 높이가
//     평균입니다. 공식(합 ÷ 개수)을 말하기 전에 '고르게 한다'는 말이
//     무슨 뜻인지를 눈으로 봅니다.
//
//   · 돌려 보기 — 회전판을 실제로 돌리고 나온 것을 세어 둡니다.
//     성취기준이 말하는 '간단한 실험'입니다.
//
//   · 꺼내 보기 — 주머니에서 바둑돌을 꺼내고 도로 넣기를 되풀이합니다.
//
// 돌려 보기와 꺼내 보기에는 조심할 것이 하나 있습니다. 몇 번 돌려
// 보고 나온 수를 곧 가능성이라고 읽으면 오개념이 됩니다 — 반반인
// 회전판도 열 번에 일곱 번 빨강이 나올 수 있습니다. 그래서 이 자리는
// 답을 말하지 않고, 많이 돌릴수록 칸의 크기에 가까워진다는 것만
// 보여 줍니다. 한 번에 열 번씩 돌리는 단추를 둔 까닭입니다.
// ════════════════════════════════════════════════════════════════════

type 자료칸 = { name: string; value: number | null };
type 회전판 = { name?: string; slices: string[] };
type 주머니 = { name?: string; marbles: string[] };

type 실험 =
  | { 갈래: '고르게만들기'; 칸들: Array<{ name: string; value: number }>; 값이름: string }
  | { 갈래: '돌려보기'; 판들: 회전판[] }
  | { 갈래: '꺼내보기'; 주머니들: 주머니[] };

// ── 무엇을 해 볼 수 있는 그림인가 ──────────────────────────────────
//
// 표는 평균을 묻는 문항에만 내줍니다. "가장 작은 값은 얼마일까요?"는
// 표를 읽는 문항이라 고르게 만들어도 도움이 되지 않고, 빈칸이 있는
// 문항("평균이 12개일 때 빈칸은?")은 아직 모르는 값이 하나 있어
// 고르게 만들 수가 없습니다.
export const 무엇을해볼까_가능성 = (visual: QuestionVisual | undefined, prompt = ''): 실험 | null => {
  if (!visual) return null;

  if (visual.kind === 'table') {
    if (!/평균|고르게/.test(prompt)) return null;
    const 표 = visual as unknown as { columns: 자료칸[]; valueLabel?: string };
    const 칸들 = 표.columns ?? [];
    if (칸들.length < 2) return null;
    if (칸들.some((one) => one.value === null || one.value === undefined)) return null;
    return {
      갈래: '고르게만들기',
      칸들: 칸들.map((one) => ({ name: one.name, value: one.value as number })),
      값이름: 표.valueLabel ?? '',
    };
  }

  if (visual.kind === 'spinner') {
    const 판들 = (visual as unknown as { items: 회전판[] }).items ?? [];
    return 판들.length ? { 갈래: '돌려보기', 판들 } : null;
  }

  if (visual.kind === 'marble-bag') {
    const 주머니들 = (visual as unknown as { bags: 주머니[] }).bags ?? [];
    return 주머니들.length ? { 갈래: '꺼내보기', 주머니들 } : null;
  }

  return null;
};

// ── 그리기에 쓰는 공통 조각 ────────────────────────────────────────

const 판너비 = 344;
const 판높이 = 232;

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

function 고르개({
  이름들,
  고른것,
  고르기,
}: {
  이름들: Array<string | undefined>;
  고른것: number;
  고르기: (at: number) => void;
}) {
  if (이름들.length < 2) return null;
  return (
    <div className="symmetry-pick">
      {이름들.map((one, at) => (
        <button
          key={at}
          type="button"
          className={at === 고른것 ? 'chosen' : ''}
          onClick={() => {
            playTapSound();
            고르기(at);
          }}
        >
          {one ?? `${at + 1}번`}
        </button>
      ))}
    </div>
  );
}

// ── 고르게 만들기 (평균) ───────────────────────────────────────────
//
// 지도서: "자료의 값을 고르게 하여 자료의 대푯값을 정하는 것".
// 손잡이를 끌면 높은 막대가 낮은 막대로 흘러 들어가 모두 같아집니다.
// 그 높이가 평균입니다. 공식은 말하지 않습니다 — 고르게 만든 높이를
// 아이가 눈금에서 읽습니다.

/** t만큼 고르게 만든 값입니다. t가 1이면 모두 평균이 됩니다. */
export const 고르게 = (값들: number[], t: number): number[] => {
  const 평균 = 값들.reduce((s, one) => s + one, 0) / 값들.length;
  return 값들.map((one) => one + (평균 - one) * t);
};

function 고르게만들기({ 칸들, 값이름 }: { 칸들: Array<{ name: string; value: number }>; 값이름: string }) {
  const [t, setT] = useState(0);
  const 값들 = 칸들.map((one) => one.value);
  const 지금 = 고르게(값들, t);
  const 평균 = 값들.reduce((s, one) => s + one, 0) / 값들.length;
  const 가장큰값 = Math.max(...값들, 1);

  const 왼쪽 = 40;
  const 아래 = 판높이 - 34;
  const 위 = 26;
  const 막대너비 = Math.min(42, (판너비 - 왼쪽 - 18) / 칸들.length - 10);
  const 칸너비 = (판너비 - 왼쪽 - 14) / 칸들.length;
  const 높이로 = (값: number) => ((아래 - 위) * 값) / 가장큰값;

  // 평균 자리에 가로선을 그어 둡니다. 막대가 이 선에 맞춰 고르게
  // 되는 것을 보여 주는 것이 이 그림의 일입니다.
  const 평균y = 아래 - 높이로(평균);

  return (
    <div className="symmetry-lab">
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="자료를 고르게 만드는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {/* 바닥 */}
        <line x1={왼쪽 - 8} y1={아래} x2={판너비 - 10} y2={아래} stroke="#9db6c6" strokeWidth="2" />
        {/* 고르게 되었을 때의 높이 */}
        <line
          x1={왼쪽 - 8}
          y1={평균y}
          x2={판너비 - 10}
          y2={평균y}
          stroke="#e08a1e"
          strokeWidth="2"
          strokeDasharray="8 5"
          opacity={0.25 + 0.75 * t}
        />
        {칸들.map((칸, at) => {
          const x = 왼쪽 + 칸너비 * at + (칸너비 - 막대너비) / 2;
          const 높이 = 높이로(지금[at]);
          return (
            <g key={칸.name}>
              <rect
                x={x}
                y={아래 - 높이}
                width={막대너비}
                height={Math.max(0, 높이)}
                rx="4"
                fill="rgba(46, 134, 193, 0.55)"
                stroke="#2e86c1"
                strokeWidth="2"
              />
              <text x={x + 막대너비 / 2} y={아래 - 높이 - 6} textAnchor="middle" fill="#24364a" fontSize="13" fontWeight="900">
                {Number.isInteger(지금[at]) ? 지금[at] : 지금[at].toFixed(1)}
              </text>
              <text x={x + 막대너비 / 2} y={아래 + 17} textAnchor="middle" fill="#5b7186" fontSize="12" fontWeight="800">
                {칸.name}
              </text>
            </g>
          );
        })}
        {값이름 && (
          <text x={12} y={18} fill="#5b7186" fontSize="12" fontWeight="800">
            {값이름}
          </text>
        )}
      </svg>
      <손잡이
        값={t}
        바꾸기={(다음) => {
          if ((다음 > 0.99) !== (t > 0.99)) playTapSound();
          setT(다음);
        }}
        이름="자료를 고르게 만들기"
        왼쪽말="모은 그대로"
        오른쪽말="고르게 만들기"
      />
      <p className="symmetry-say">
        {t > 0.99
          ? '모두 같은 높이가 되었습니다. 이 높이가 자료를 대표하는 값입니다.'
          : '높은 막대에서 낮은 막대로 옮겨 모두 같은 높이로 만들어 보세요.'}
      </p>
    </div>
  );
}

// ── 돌려 보기 (회전판) ─────────────────────────────────────────────
//
// [6수04-06] "회전판 돌리기 등과 같은 간단한 실험 결과를 나타낸 표나
// 그래프를 보고 사건이 일어날 가능성을 비교하고 대략적으로 예상하게
// 한다."
//
// 몇 번 돌려 나온 수를 곧 가능성이라고 읽으면 오개념이 됩니다. 반반인
// 회전판도 열 번에 일곱 번 빨강이 나올 수 있습니다. 그래서 답을
// 말하지 않고, 많이 돌릴수록 칸의 크기에 가까워진다는 것만 보여
// 줍니다 — 한 번에 열 번씩 돌리는 단추를 둔 까닭입니다.

/** 칸을 색깔별로 셉니다. */
const 색깔별로세기 = (칸들: string[]) => {
  const 셈 = new Map<string, number>();
  칸들.forEach((one) => 셈.set(one, (셈.get(one) ?? 0) + 1));
  return [...셈.entries()];
};

function 세어둔것({ 셈, 전체 }: { 셈: Array<[string, number]>; 전체: number }) {
  if (!전체) return null;
  return (
    <div className="chance-tally">
      {셈.map(([색, 몇번]) => (
        <span key={색}>
          <i style={{ background: CHANCE_FILL[색] ?? '#ccc' }} />
          {몇번}번
        </span>
      ))}
      <strong>모두 {전체}번</strong>
    </div>
  );
}

function 돌려보기({ 판들 }: { 판들: 회전판[] }) {
  const [고른것, set고른것] = useState(0);
  const [각, set각] = useState(0);
  const [셈, set셈] = useState<Record<string, number>>({});
  const 판 = 판들[고른것] ?? 판들[0];
  const 칸들 = 판.slices ?? [];
  const 칸수 = Math.max(1, 칸들.length);

  const cx = 판너비 / 2;
  const cy = 판높이 / 2 - 4;
  const r = Math.min(판높이 / 2 - 22, 84);

  const 한번돌리기 = (몇번: number) => {
    playTapSound();
    const 다음셈 = { ...셈 };
    let 마지막 = 0;
    for (let i = 0; i < 몇번; i += 1) {
      마지막 = Math.floor(Math.random() * 칸수);
      const 색 = 칸들[마지막] ?? 'white';
      다음셈[색] = (다음셈[색] ?? 0) + 1;
    }
    set셈(다음셈);
    // 화살이 마지막에 나온 칸의 한가운데를 가리키게 합니다.
    set각((전) => 전 + 720 + (((마지막 + 0.5) / 칸수) * 360 - (((전 + 720) % 360) + 360) % 360));
  };

  const 전체 = Object.values(셈).reduce((s, one) => s + one, 0);

  return (
    <div className="symmetry-lab">
      <고르개 이름들={판들.map((one) => one.name)} 고른것={고른것} 고르기={(at) => { set고른것(at); set각(0); set셈({}); }} />
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="회전판을 돌려 보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {칸들.map((색, at) => {
          const 시작 = ((at / 칸수) * 360 - 90) * (Math.PI / 180);
          const 끝 = (((at + 1) / 칸수) * 360 - 90) * (Math.PI / 180);
          const 큰가 = 1 / 칸수 > 0.5 ? 1 : 0;
          const d =
            칸수 === 1
              ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
              : `M ${cx} ${cy} L ${cx + Math.cos(시작) * r} ${cy + Math.sin(시작) * r} A ${r} ${r} 0 ${큰가} 1 ${cx + Math.cos(끝) * r} ${cy + Math.sin(끝) * r} Z`;
          return <path key={at} d={d} fill={CHANCE_FILL[색] ?? '#ccc'} stroke="#41607a" strokeWidth="1.5" />;
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#41607a" strokeWidth="2.5" />
        {/* 화살입니다. 돌린 결과가 가리키는 칸에 멈춥니다. */}
        <g style={{ transform: `rotate(${각}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.7s cubic-bezier(0.22, 0.9, 0.3, 1)' }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.82} stroke="#24364a" strokeWidth="4" strokeLinecap="round" />
          <polygon
            points={`${cx - 6},${cy - r * 0.78} ${cx + 6},${cy - r * 0.78} ${cx},${cy - r * 0.94}`}
            fill="#24364a"
          />
        </g>
        <circle cx={cx} cy={cy} r="6" fill="#ffffff" stroke="#24364a" strokeWidth="2.5" />
      </svg>
      <div className="symmetry-try">
        <button type="button" onClick={() => 한번돌리기(1)}>한 번 돌리기</button>
        <button type="button" onClick={() => 한번돌리기(10)}>열 번 돌리기</button>
        {전체 > 0 && (
          <button type="button" onClick={() => { playTapSound(); set셈({}); }}>
            다시 세기
          </button>
        )}
      </div>
      <세어둔것 셈={색깔별로세기(칸들).map(([색]) => [색, 셈[색] ?? 0] as [string, number])} 전체={전체} />
      <p className="symmetry-say">
        {전체 >= 30
          ? '많이 돌릴수록 나온 횟수가 칸의 크기와 비슷해집니다.'
          : '돌려 보세요. 몇 번만 돌리면 우연히 한쪽으로 치우칠 수 있으니 여러 번 돌려 보세요.'}
      </p>
    </div>
  );
}

// ── 꺼내 보기 (주머니) ─────────────────────────────────────────────
//
// 꺼냈다 도로 넣기를 되풀이합니다. 도로 넣기 때문에 주머니 속은
// 늘 그대로입니다 — 문항이 "꺼냈다 넣기를 40번 했더니"라고 말하는
// 그대로입니다.

function 꺼내보기({ 주머니들 }: { 주머니들: 주머니[] }) {
  const [고른것, set고른것] = useState(0);
  const [셈, set셈] = useState<Record<string, number>>({});
  const [방금, set방금] = useState<string | null>(null);
  const 주머니 = 주머니들[고른것] ?? 주머니들[0];
  const 돌들 = 주머니.marbles ?? [];

  const 꺼내기 = (몇번: number) => {
    playTapSound();
    const 다음셈 = { ...셈 };
    let 마지막 = '';
    for (let i = 0; i < 몇번; i += 1) {
      마지막 = 돌들[Math.floor(Math.random() * Math.max(1, 돌들.length))] ?? 'white';
      다음셈[마지막] = (다음셈[마지막] ?? 0) + 1;
    }
    set셈(다음셈);
    set방금(마지막);
  };

  const 전체 = Object.values(셈).reduce((s, one) => s + one, 0);
  const 줄당 = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(돌들.length))));
  const 돌크기 = 22;

  return (
    <div className="symmetry-lab">
      <고르개 이름들={주머니들.map((one) => one.name)} 고른것={고른것} 고르기={(at) => { set고른것(at); set셈({}); set방금(null); }} />
      <svg viewBox={`0 0 ${판너비} ${판높이}`} role="img" aria-label="주머니에서 바둑돌을 꺼내 보는 그림">
        <rect x="2" y="2" width={판너비 - 4} height={판높이 - 4} rx="14" fill="#f6fcff" stroke="#d7edf2" />
        {/* 주머니 */}
        <rect
          x={판너비 / 2 - 84}
          y={30}
          width={168}
          height={판높이 - 96}
          rx="26"
          fill="#fdf6e8"
          stroke="#c8a96e"
          strokeWidth="2.5"
        />
        {돌들.map((색, at) => {
          const 줄 = Math.floor(at / 줄당);
          const 칸 = at % 줄당;
          const 이줄개수 = Math.min(줄당, 돌들.length - 줄 * 줄당);
          const x = 판너비 / 2 - ((이줄개수 - 1) * (돌크기 + 6)) / 2 + 칸 * (돌크기 + 6);
          const y = 58 + 줄 * (돌크기 + 6);
          return (
            <circle key={at} cx={x} cy={y} r={돌크기 / 2} fill={CHANCE_FILL[색] ?? '#ccc'} stroke="#41607a" strokeWidth="1.8" />
          );
        })}
        {/* 방금 꺼낸 돌 */}
        {방금 && (
          <g>
            <text x={판너비 / 2} y={판높이 - 32} textAnchor="middle" fill="#5b7186" fontSize="12" fontWeight="800">
              방금 꺼낸 것
            </text>
            <circle
              cx={판너비 / 2}
              cy={판높이 - 14}
              r="11"
              fill={CHANCE_FILL[방금] ?? '#ccc'}
              stroke="#24364a"
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>
      <div className="symmetry-try">
        <button type="button" onClick={() => 꺼내기(1)}>한 개 꺼내기</button>
        <button type="button" onClick={() => 꺼내기(10)}>열 번 꺼내기</button>
        {전체 > 0 && (
          <button type="button" onClick={() => { playTapSound(); set셈({}); set방금(null); }}>
            다시 세기
          </button>
        )}
      </div>
      <세어둔것 셈={색깔별로세기(돌들).map(([색]) => [색, 셈[색] ?? 0] as [string, number])} 전체={전체} />
      <p className="symmetry-say">
        {전체 >= 30
          ? '많이 꺼낼수록 나온 횟수가 주머니 속 개수와 비슷해집니다.'
          : '꺼냈다 도로 넣기를 되풀이합니다. 주머니 속은 늘 그대로입니다.'}
      </p>
    </div>
  );
}

// ── 바깥으로 내보내는 것 ───────────────────────────────────────────

export function ChanceLab({ visual, prompt = '' }: { visual: QuestionVisual; prompt?: string }) {
  const 할것 = useMemo(() => 무엇을해볼까_가능성(visual, prompt), [visual, prompt]);
  if (!할것) return null;
  if (할것.갈래 === '고르게만들기') return <고르게만들기 칸들={할것.칸들} 값이름={할것.값이름} />;
  if (할것.갈래 === '돌려보기') return <돌려보기 판들={할것.판들} />;
  return <꺼내보기 주머니들={할것.주머니들} />;
}

/** 창 제목입니다. */
export const 가능성이름 = (visual: QuestionVisual, prompt = ''): string | null => {
  const 할것 = 무엇을해볼까_가능성(visual, prompt);
  if (!할것) return null;
  if (할것.갈래 === '고르게만들기') return '고르게 만들어 보세요';
  if (할것.갈래 === '돌려보기') return '회전판을 돌려 보세요';
  return '바둑돌을 꺼내 보세요';
};

/** 무엇을 보아야 하는지입니다. 답은 말하지 않습니다. */
export const 가능성보는차례 = (visual: QuestionVisual, prompt = ''): string[] | null => {
  const 할것 = 무엇을해볼까_가능성(visual, prompt);
  if (!할것) return null;
  if (할것.갈래 === '고르게만들기') {
    return [
      '표의 값을 막대로 세워 놓았습니다.',
      '손잡이를 끌면 높은 막대에서 낮은 막대로 옮겨져 모두 같은 높이가 됩니다.',
      '고르게 된 높이가 이 자료를 대표하는 값입니다. 눈금에서 읽어 보세요.',
    ];
  }
  if (할것.갈래 === '돌려보기') {
    return [
      할것.판들.length > 1 ? '회전판을 하나 고르세요.' : '회전판의 칸을 색깔별로 세어 보세요.',
      '"한 번 돌리기"와 "열 번 돌리기"로 실제로 돌려 보세요.',
      '몇 번만 돌리면 우연히 치우칠 수 있습니다. 여러 번 돌려 칸의 크기와 견주어 보세요.',
    ];
  }
  return [
    할것.주머니들.length > 1 ? '주머니를 하나 고르세요.' : '주머니 속 바둑돌을 색깔별로 세어 보세요.',
    '꺼냈다 도로 넣기를 되풀이합니다. 주머니 속은 늘 그대로입니다.',
    '여러 번 꺼내어 나온 횟수를 주머니 속 개수와 견주어 보세요.',
  ];
};
