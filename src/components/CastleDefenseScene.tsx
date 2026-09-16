import type { Difficulty } from '../types';

// '구구단, 몬스터를 막아라!' 차시 전용 그림입니다.
//
// 이 차시의 문제는 다른 차시와 똑같이 하나씩 풀립니다(정답/오답, 다음
// 문제 버튼 모두 그대로입니다). 다만 이 자리만 성벽·하트·몬스터로 꾸며,
// 곱셈 사실을 빠르게 떠올리는 연습이 놀이처럼 느껴지게 합니다.
//
// 몬스터는 실제로 아래까지 내려옵니다. 다 내려올 때까지 답하지 못하면
// (onAnimationEnd) 그 문제는 놓친 것으로 처리됩니다 — 오답과 똑같이
// 하트가 하나 사라집니다. 난이도(level)는 몬스터가 내려오는 빠르기입니다.
const MONSTER_EMOJI = ['👻', '🦇', '👹', '👾', '🐲', '🧟'];

const FALL_SECONDS: Record<Difficulty, number> = {
  하: 9,
  중: 5,
  // 상은 3초로도 쉽다고 하여 0.5초 줄였습니다.
  상: 2.5,
};

// 전자칠판에서는 상 수준에만 0.5초를 돌려줍니다.
//
// 한 화면을 여러 아이가 함께 터치합니다. 답을 알아도 앞사람 손이
// 비켜 주기를 기다려야 하고, 큰 화면이라 제 자리까지 손을 뻗는 데도
// 시간이 듭니다. 자기 폰으로 푸는 아이에게는 없는 기다림입니다.
// 곱셈구구를 떠올리는 시간이 아니라 손이 닿기까지의 시간이라, 상
// 수준에서만 이 차이가 답을 못 넣는 것으로 이어졌습니다.
//
// 하·중은 이미 넉넉해서 건드리지 않습니다.
const SHARED_SCREEN_EXTRA_SECONDS = 0.5;

const hashOf = (text: string) => text.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

interface CastleDefenseSceneProps {
  questionKey: string;
  prompt: string;
  heartsMax: number;
  heartsLost: number;
  solved: number;
  total: number;
  level: Difficulty;
  /**
   * 한 화면을 여러 아이가 함께 쓰는 자리(전자칠판)인지입니다.
   * 큐알로 들어온 아이의 폰은 한 사람이 혼자 쓰므로 false입니다.
   */
  sharedScreen: boolean;
  // 몬스터가 답을 만나지 못한 채 성벽까지 다 내려왔을 때 부릅니다.
  onTimeout: () => void;
}

export function CastleDefenseScene({
  questionKey,
  prompt,
  heartsMax,
  heartsLost,
  solved,
  total,
  level,
  sharedScreen,
  onTimeout,
}: CastleDefenseSceneProps) {
  const heartsLeft = Math.max(0, heartsMax - heartsLost);
  const remaining = Math.max(0, total - solved);
  const monster = MONSTER_EMOJI[hashOf(questionKey) % MONSTER_EMOJI.length];
  // 상 수준만 늘립니다. 기다림 때문에 답을 못 넣는 일이 상에서만 생겼습니다.
  const fallSeconds =
    FALL_SECONDS[level] + (sharedScreen && level === '상' ? SHARED_SCREEN_EXTRA_SECONDS : 0);
  // '3 × 4 = 얼마일까요?'에서 몬스터 카드에는 식만 크게 보여 줍니다.
  const fact = prompt.replace(/\s*=\s*얼마일까요\?$/, '');

  return (
    <div className="castle-defense-scene">
      <div className="castle-status-bar">
        <span className="castle-icon" aria-hidden="true">🏰</span>
        <span className="castle-hearts" aria-label={`남은 목숨 ${heartsLeft}개`}>
          {Array.from({ length: heartsMax }).map((_, index) => (
            <span key={index} className={index < heartsLeft ? 'heart-full' : 'heart-lost'} aria-hidden="true">
              ♥
            </span>
          ))}
        </span>
        <span className="castle-remaining">남은 몬스터 {remaining}마리</span>
      </div>
      <div className="castle-monster-track">
        <div
          className="castle-monster-card"
          key={questionKey}
          style={{ animationDuration: `${fallSeconds}s` }}
          onAnimationEnd={onTimeout}
        >
          <span className="castle-monster-emoji" aria-hidden="true">{monster}</span>
          <strong className="castle-monster-fact">{fact}</strong>
        </div>
      </div>
    </div>
  );
}
