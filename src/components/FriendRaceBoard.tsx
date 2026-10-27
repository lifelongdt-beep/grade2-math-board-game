import type { CSSProperties } from 'react';

// ════════════════════════════════════════════════════════════════════
// 친구들 경주판
// ────────────────────────────────────────────────────────────────────
// 친구와 겨루는 놀이에서 모두가 한눈에 보는 보드게임 길입니다. 출발 칸부터 결승 칸까지
// 칸이 놓이고, 같이 하는 친구들의 말(캐릭터)이 이번 판 점수만큼 칸을 뛰어 나갑니다.
// 두 명씩 견주지 않고 모두가 한 길 위에 있으므로, 누가 앞서고 누가 쫓아오는지 바로 보입니다.
//
// 1등 말에는 왕관이, ⚡부스터를 받은 말에는 번개가 붙습니다. 순위가 오른 말 위에는 '추월!'이
// 잠깐 뜹니다. 판이 끝나면 모두 출발 칸으로 돌아갑니다.
//
// 보기만 하는 판입니다. 아이들이 누르는 곳은 아래 보기 단추이므로 이 판은 터치를 받지 않습니다.
// ════════════════════════════════════════════════════════════════════

export interface 경주말 {
  id: number;
  avatar: string;
  name: string;
  점수: number;
  등수: number;
  이긴판: number;
  부스터: boolean;
  style: CSSProperties;
}

interface FriendRaceBoardProps {
  말들: 경주말[];
  결승: number;
  /** 지금 몇 번째 판인지입니다(1부터). */
  판: number;
  /** 1등이 혼자일 때 그 아이입니다. 공동 1등이면 null입니다. */
  선두: number | null;
  추월: { id: number; n: number } | null;
}

export function FriendRaceBoard({ 말들, 결승, 판, 선두, 추월 }: FriendRaceBoardProps) {
  const 칸수 = 결승 + 1;
  const 칸자리 = (칸: number) => ((칸 + 0.5) / 칸수) * 100;
  // 같은 칸에 선 말들은 옆으로 조금씩 비켜 섭니다.
  const 칸별 = new Map<number, number[]>();
  말들.forEach((말) => {
    const 칸 = Math.min(결승, 말.점수);
    칸별.set(칸, [...(칸별.get(칸) ?? []), 말.id]);
  });
  return (
    <section className="race-board" aria-label={`친구들 경주판, ${판}번째 판, 먼저 ${결승}칸`}>
      <div className="race-board-round" aria-hidden="true">
        <b>{판}판</b>
        <small>먼저 {결승}칸</small>
      </div>
      <div className="race-board-track">
        <ol className="race-board-path" style={{ gridTemplateColumns: `repeat(${칸수}, 1fr)` }} aria-hidden="true">
          {Array.from({ length: 칸수 }, (_, 칸) => (
            <li key={칸} className={칸 === 0 ? 'start' : 칸 === 결승 ? 'goal' : ''}>
              {칸 === 0 ? '출발' : 칸 === 결승 ? '🏁' : 칸}
            </li>
          ))}
        </ol>
        {말들.map((말) => {
          const 칸 = Math.min(결승, 말.점수);
          const 같은칸 = 칸별.get(칸) ?? [말.id];
          const 차례 = 같은칸.indexOf(말.id);
          const 비킴 = (차례 - (같은칸.length - 1) / 2) * 32;
          return (
            <span
              key={말.id}
              className={`race-token ${선두 === 말.id ? 'leader' : ''} ${말.부스터 ? 'boost' : ''}`.trim()}
              style={{ ...말.style, left: `calc(${칸자리(칸)}% + ${비킴}px)`, zIndex: 10 - 말.등수 } as CSSProperties}
              aria-label={`${말.name} ${말.점수}칸, ${말.등수}등${말.부스터 ? ', 부스터' : ''}`}
            >
              {/* 칸을 옮길 때마다 key가 바뀌어 한 번 콩 뛰어오릅니다. */}
              <span className="race-token-face" key={`${판}-${말.점수}`}>{말.avatar}</span>
              <small className="race-token-no">{말.name.replace(/\D/g, '') || 말.name}</small>
              {선두 === 말.id && <i className="race-token-crown" aria-hidden="true">👑</i>}
              {말.부스터 && <i className="race-token-boost" aria-hidden="true">⚡</i>}
              {말.이긴판 > 0 && <em className="race-token-wins" aria-hidden="true">👑{말.이긴판}</em>}
              {추월?.id === 말.id && <b className="race-token-pass" key={`pass-${추월.n}`} aria-hidden="true">추월!</b>}
            </span>
          );
        })}
      </div>
    </section>
  );
}
