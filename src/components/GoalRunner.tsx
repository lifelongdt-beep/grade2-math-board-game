/* ── 우리 반 목표를 달리는 것 ────────────────────────────────────────
   목표를 한 번 이룰 때마다 다른 것이 나옵니다. 같은 로켓이 계속 나오면
   두 번째 목표는 첫 번째의 되풀이로 보이지만, 기차 다음에 비행기가
   나오면 아이는 '다음은 뭐지' 하고 한 번 더 채우고 싶어집니다.

   이모지로는 바퀴만 돌릴 수가 없습니다. 🚂는 통째로 하나의 글자라
   프로펠러도 불꽃도 따로 움직이지 못합니다. 그래서 부품을 나눈 그림으로
   그리고, 움직이는 곳마다 제 이름을 붙였습니다. 움직임이 이 그림의
   전부입니다 — 멈춰 있으면 아이 눈에 들어오지 않습니다. */

type RunnerKind = 'train' | 'plane' | 'rocket' | 'saucer' | 'alien' | 'human';

// 목표를 이룬 차례대로 나옵니다. 여섯을 다 만나면 처음으로 돌아갑니다.
const ORDER: RunnerKind[] = ['train', 'plane', 'rocket', 'saucer', 'alien', 'human'];

export const runnerNameFor = (stage: number): string => {
  const kind = ORDER[(Math.max(1, stage) - 1) % ORDER.length];
  return {
    train: '기차', plane: '비행기', rocket: '로켓',
    saucer: '우주선', alien: '외계인', human: '사람',
  }[kind];
};

// 기차 — 바퀴가 돌고 굴뚝에서 연기가 납니다.
const Train = () => (
  <svg viewBox="0 0 56 40" className="runner-art runner-train" role="img" aria-label="기차">
    <g className="runner-smoke">
      <circle cx="45" cy="8" r="3.4" />
      <circle cx="45" cy="8" r="3" />
      <circle cx="45" cy="8" r="2.6" />
    </g>
    <rect x="6" y="15" width="42" height="13" rx="3" fill="#ff6b6b" stroke="#7a1f1f" strokeWidth="1.4" />
    <rect x="8" y="6" width="16" height="11" rx="2.5" fill="#ffd166" stroke="#7a1f1f" strokeWidth="1.4" />
    <rect x="11" y="9" width="9" height="6" rx="1.5" fill="#bfefff" />
    <rect x="41" y="7" width="7" height="9" rx="1.5" fill="#4a4a6a" stroke="#22223a" strokeWidth="1.2" />
    <rect x="4" y="27" width="46" height="3" rx="1.5" fill="#3a3a55" />
    {[14, 27, 40].map((cx) => (
      <g key={cx} className="runner-wheel" style={{ transformOrigin: `${cx}px 31px` }}>
        <circle cx={cx} cy="31" r="6" fill="#2b2b40" stroke="#8fe3ff" strokeWidth="1.6" />
        <line x1={cx - 4} y1="31" x2={cx + 4} y2="31" stroke="#8fe3ff" strokeWidth="1.4" />
        <line x1={cx} y1="27" x2={cx} y2="35" stroke="#8fe3ff" strokeWidth="1.4" />
      </g>
    ))}
  </svg>
);

// 비행기 — 앞의 프로펠러가 돕니다.
const Plane = () => (
  <svg viewBox="0 0 56 40" className="runner-art runner-plane" role="img" aria-label="비행기">
    <path d="M4 20 L14 12 L14 28 Z" fill="#ffd166" stroke="#7a5a10" strokeWidth="1.3" />
    <ellipse cx="27" cy="20" rx="19" ry="7" fill="#6ec8ff" stroke="#12466e" strokeWidth="1.5" />
    <path d="M20 20 L28 30 L38 30 L30 20 Z" fill="#4aa8e0" stroke="#12466e" strokeWidth="1.2" />
    <circle cx="24" cy="19" r="2.4" fill="#0d2b45" />
    <circle cx="32" cy="19" r="2.4" fill="#0d2b45" />
    <g className="runner-prop" style={{ transformOrigin: '47px 20px' }}>
      <rect x="45.4" y="8" width="3.2" height="24" rx="1.6" fill="#eaf4ff" opacity="0.95" />
      <rect x="35" y="18.4" width="24" height="3.2" rx="1.6" fill="#eaf4ff" opacity="0.5" />
    </g>
    <circle cx="47" cy="20" r="3" fill="#ff6b6b" stroke="#7a1f1f" strokeWidth="1.2" />
  </svg>
);

// 로켓 — 뒤에서 불꽃이 뿜어져 나옵니다.
const Rocket = () => (
  <svg viewBox="0 0 56 40" className="runner-art runner-rocket" role="img" aria-label="로켓">
    <g className="runner-flame">
      <path d="M12 20 L1 14 L5 20 L1 26 Z" fill="#ff9b3d" />
      <path d="M12 20 L4 16 L7 20 L4 24 Z" fill="#ffe066" />
    </g>
    <path d="M14 12 L22 12 L26 20 L22 28 L14 28 Z" fill="#8fd8ff" stroke="#12466e" strokeWidth="1.2" />
    <path d="M12 13 L20 8 L20 13 Z" fill="#ff6b6b" stroke="#7a1f1f" strokeWidth="1.1" />
    <path d="M12 27 L20 32 L20 27 Z" fill="#ff6b6b" stroke="#7a1f1f" strokeWidth="1.1" />
    <path d="M14 12 Q40 12 52 20 Q40 28 14 28 Z" fill="#f2f7ff" stroke="#12466e" strokeWidth="1.6" />
    <circle cx="34" cy="20" r="4.2" fill="#4fd2ff" stroke="#12466e" strokeWidth="1.4" />
    <circle cx="32.6" cy="18.6" r="1.4" fill="#ffffff" opacity="0.85" />
  </svg>
);

// 우주선 — 둘레를 형광 고리가 돕니다.
const Saucer = () => (
  <svg viewBox="0 0 56 40" className="runner-art runner-saucer" role="img" aria-label="우주선">
    <g className="runner-ring" style={{ transformOrigin: '28px 22px' }}>
      <ellipse cx="28" cy="22" rx="25" ry="11" fill="none" stroke="#7bffd4" strokeWidth="2.2"
        strokeLinecap="round" strokeDasharray="26 22" />
    </g>
    <path d="M17 19 Q28 3 39 19 Z" fill="#bfefff" stroke="#12466e" strokeWidth="1.4" />
    <ellipse cx="28" cy="21" rx="20" ry="6.5" fill="#c9b6ff" stroke="#3b2a6b" strokeWidth="1.6" />
    <ellipse cx="28" cy="19" rx="20" ry="4" fill="#e6dcff" opacity="0.7" />
    {[16, 22, 28, 34, 40].map((cx, i) => (
      <circle key={cx} cx={cx} cy="23.5" r="2" fill="#ffe066"
        className="runner-lamp" style={{ animationDelay: `${i * 0.16}s` }} />
    ))}
  </svg>
);

// 외계인 — 한쪽 눈을 찡긋합니다.
const Alien = () => (
  <svg viewBox="0 0 56 40" className="runner-art runner-alien" role="img" aria-label="외계인">
    <line x1="20" y1="10" x2="16" y2="3" stroke="#4fbf6a" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="36" y1="10" x2="40" y2="3" stroke="#4fbf6a" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="3" r="2.6" fill="#ffe066" className="runner-antenna" />
    <circle cx="40" cy="3" r="2.6" fill="#ffe066" className="runner-antenna" style={{ animationDelay: '0.4s' }} />
    <ellipse cx="28" cy="23" rx="16" ry="15" fill="#7ee787" stroke="#1f6b34" strokeWidth="1.6" />
    <ellipse cx="21" cy="21" rx="4.6" ry="5.6" fill="#12222c" transform="rotate(-14 21 21)" />
    <circle cx="19.6" cy="19" r="1.5" fill="#ffffff" opacity="0.9" />
    <g className="runner-wink" style={{ transformOrigin: '35px 21px' }}>
      <ellipse cx="35" cy="21" rx="4.6" ry="5.6" fill="#12222c" transform="rotate(14 35 21)" />
      <circle cx="33.6" cy="19" r="1.5" fill="#ffffff" opacity="0.9" />
    </g>
    <path d="M23 30 Q28 34 33 30" fill="none" stroke="#1f6b34" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 사람 — 팔다리를 저으며 달립니다.
const Human = () => (
  <svg viewBox="0 0 56 40" className="runner-art runner-human" role="img" aria-label="달리는 사람">
    <g className="runner-body">
      <circle cx="30" cy="9" r="6" fill="#ffd8a8" stroke="#8a5a2b" strokeWidth="1.4" />
      <path d="M24 6 Q30 0 36 6 Q30 4 24 6 Z" fill="#6b4423" />
      <line x1="29" y1="15" x2="26" y2="26" stroke="#4fd2ff" strokeWidth="6" strokeLinecap="round" />
      <g className="runner-arm-a" style={{ transformOrigin: '29px 17px' }}>
        <line x1="29" y1="17" x2="40" y2="14" stroke="#ffd8a8" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <g className="runner-arm-b" style={{ transformOrigin: '29px 17px' }}>
        <line x1="29" y1="17" x2="19" y2="21" stroke="#f0b57e" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <g className="runner-leg-a" style={{ transformOrigin: '26px 26px' }}>
        <line x1="26" y1="26" x2="34" y2="36" stroke="#ff6b6b" strokeWidth="3.8" strokeLinecap="round" />
      </g>
      <g className="runner-leg-b" style={{ transformOrigin: '26px 26px' }}>
        <line x1="26" y1="26" x2="16" y2="35" stroke="#e0524f" strokeWidth="3.8" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

const ART = {
  train: Train, plane: Plane, rocket: Rocket, saucer: Saucer, alien: Alien, human: Human,
};

export function GoalRunner({ stage }: { stage: number }) {
  const kind = ORDER[(Math.max(1, stage) - 1) % ORDER.length];
  const Art = ART[kind];
  return <Art />;
}
