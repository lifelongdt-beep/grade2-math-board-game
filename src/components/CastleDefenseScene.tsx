// '구구단, 몬스터를 막아라!' 차시 전용 그림입니다.
//
// 이 차시의 문제는 다른 차시와 똑같이 하나씩 풀립니다(정답/오답, 다음
// 문제 버튼 모두 그대로입니다). 다만 이 자리만 성벽·하트·몬스터로 꾸며,
// 곱셈 사실을 빠르게 떠올리는 연습이 놀이처럼 느껴지게 합니다.
const MONSTER_EMOJI = ['👻', '🦇', '👹', '👾', '🐲', '🧟'];

const hashOf = (text: string) => text.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

interface CastleDefenseSceneProps {
  questionKey: string;
  prompt: string;
  heartsMax: number;
  heartsLost: number;
  solved: number;
  total: number;
}

export function CastleDefenseScene({
  questionKey,
  prompt,
  heartsMax,
  heartsLost,
  solved,
  total,
}: CastleDefenseSceneProps) {
  const heartsLeft = Math.max(0, heartsMax - heartsLost);
  const remaining = Math.max(0, total - solved);
  const monster = MONSTER_EMOJI[hashOf(questionKey) % MONSTER_EMOJI.length];
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
        <div className="castle-monster-card" key={questionKey}>
          <span className="castle-monster-emoji" aria-hidden="true">{monster}</span>
          <strong className="castle-monster-fact">{fact}</strong>
        </div>
      </div>
    </div>
  );
}
