import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Difficulty, QuestionVisual } from '../types';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import { 놀이시간, type GameInfo, type GameMode } from '../data/games';

// ════════════════════════════════════════════════════════════════════
// 단원 놀이 화면
// ────────────────────────────────────────────────────────────────────
// 문제는 다른 차시처럼 아래 보기 단추로 풉니다. 이 자리는 놀이마다 다른
// 그림으로 시간을 보여 줍니다 — 몬스터가 내려오고, 풍선이 떠오르고, 두더지가
// 숨고, 연료나 심지가 줄어들고, 3D 터널 속에서 문제가 날아옵니다. 시간이 다
// 되면(onAnimationEnd) 놓친 것으로 칩니다. 틀린 뒤 도움말을 보는 동안에는
// 멈춰 둡니다.
//
// 규칙은 단순하게 두고 손맛을 크게 냅니다. 맞히면 그 자리에서 펑 터지며 조각이
// 튀고, 연달아 맞히면 콤보가 붙고 놀이가 조금씩 빨라집니다. 놓치면 화면이
// 흔들리고 콤보가 끊깁니다. 배경(별·구름·길·터널)은 늘 움직여 멈춘 그림처럼
// 보이지 않게 합니다.
//
// 내려오고 날아오는 움직임은 꾸밈이 아니라 놀이의 시계이므로, 컴퓨터의
// '움직임 줄이기' 설정과 상관없이 움직입니다.
// ════════════════════════════════════════════════════════════════════

const 해시 = (text: string) => text.split('').reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);

const 몬스터들 = ['👾', '👹', '👻', '🐲', '🦖', '🐙'];
const 풍선색 = ['#ff5a7a', '#ffb347', '#59d68a', '#4fb3ff', '#b779ff', '#ff7ad9'];
const 보석들 = ['💎', '💍', '👑', '🪙', '🔮', '⭐'];

// 전자칠판은 여럿이 한 화면을 함께 누르므로 상 수준에 1초를 돌려줍니다(구구단 몬스터와 같은 까닭).
const 함께쓰는화면덤 = 1;

/** 맞혔을 때 터지는 모양과 외치는 말입니다. */
const 터짐: Record<GameMode, { 큰: string; 말: string[]; 조각: string[] }> = {
  monster: { 큰: '💥', 말: ['퍽!', '쾅!', '막았다!'], 조각: ['⭐', '✨', '💫'] },
  balloon: { 큰: '🎉', 말: ['팡!', '펑!', '빵!'], 조각: ['🎊', '✨', '🎈'] },
  mole: { 큰: '🔨', 말: ['뿅!', '딱!', '잡았다!'], 조각: ['💫', '⭐', '✨'] },
  rocket: { 큰: '🔥', 말: ['슝!', '발사!', '부스터!'], 조각: ['✨', '⭐', '💨'] },
  race: { 큰: '💨', 말: ['쌩!', '달려!', '앞질렀다!'], 조각: ['💨', '✨', '⭐'] },
  treasure: { 큰: '✨', 말: ['반짝!', '열렸다!', '보물!'], 조각: ['💎', '🪙', '✨'] },
  tunnel3d: { 큰: '💥', 말: ['콰광!', '명중!', '빔!'], 조각: ['✨', '💫', '⭐'] },
  dice3d: { 큰: '🎲', 말: ['데구르르!', '착!', '굴렸다!'], 조각: ['⭐', '✨', '🎯'] },
};

/** 연달아 맞힐 때마다 시간이 조금씩 줄어 놀이가 빨라집니다. 아무리 빨라도 처음의 4분의 3까지만 줄입니다. */
const 빨라짐 = (연속: number) => Math.max(0.75, 1 - 연속 * 0.04);

/** 맞힘·놓침이 새로 생긴 순간을 알아챕니다. 처음 그릴 때 이미 있던 기록으로는 터지지 않습니다. */
function use놀이사건(correct: number, wrong: number) {
  const 앞 = useRef({ correct, wrong });
  const [사건, set사건] = useState({ 맞힘: 0, 놓침: 0, 연속: 0, 최고: 0 });
  useEffect(() => {
    const 전 = 앞.current;
    if (correct > 전.correct) {
      set사건((one) => {
        const 연속 = one.연속 + (correct - 전.correct);
        return { ...one, 맞힘: one.맞힘 + 1, 연속, 최고: Math.max(one.최고, 연속) };
      });
    } else if (wrong > 전.wrong) {
      set사건((one) => ({ ...one, 놓침: one.놓침 + 1, 연속: 0 }));
    } else if (correct < 전.correct || wrong < 전.wrong) {
      // 다시 시작했습니다.
      set사건({ 맞힘: 0, 놓침: 0, 연속: 0, 최고: 0 });
    }
    앞.current = { correct, wrong };
  }, [correct, wrong]);
  return 사건;
}

interface GameSceneProps {
  game: GameInfo;
  questionKey: string;
  prompt: string;
  /** 그림이 있는 문항이면 놀이 카드 안에 그림을 함께 띄웁니다. */
  visual?: QuestionVisual;
  level: Difficulty;
  correct: number;
  wrong: number;
  avatar: string;
  sharedScreen: boolean;
  /** 틀린 뒤 도움말을 보는 동안이면 true입니다. 시계가 멈춥니다. */
  stopped: boolean;
  onTimeout: () => void;
}

export function GameScene({ game, questionKey, prompt, visual, level, correct, wrong, avatar, sharedScreen, stopped, onTimeout }: GameSceneProps) {
  const { 맞힘, 놓침, 연속 } = use놀이사건(correct, wrong);
  const 초 = (놀이시간[level] + (sharedScreen && level === '상' ? 함께쓰는화면덤 : 0)) * 빨라짐(연속);
  const 시계: CSSProperties | undefined = stopped ? undefined : { animationDuration: `${초.toFixed(2)}s` };
  const 끝나면 = stopped ? undefined : onTimeout;
  const h = 해시(questionKey);
  const 문제 = (
    <div className={`game-card ${visual ? 'with-visual' : ''}`.trim()}>
      {visual && <div className="game-visual"><QuestionVisualGraphic visual={visual} /></div>}
      <strong className="game-prompt">{prompt}</strong>
    </div>
  );
  const 줄 = (왼쪽: ReactNode, 오른쪽: ReactNode) => (
    <div className="game-status">
      <span>{왼쪽}</span>
      <small>{game.how}</small>
      <span>{오른쪽}</span>
    </div>
  );

  // 맞힌 순간의 펑, 놓친 순간의 번쩍임, 연속 콤보입니다. key가 바뀔 때마다 움직임이 처음부터 다시 납니다.
  const 터짐모양 = 터짐[game.mode];
  const 효과 = (
    <>
      {맞힘 > 0 && (
        <div className="game-burst" key={`hit-${맞힘}`} aria-hidden="true">
          <span className="game-burst-big">{터짐모양.큰}</span>
          <b className="game-burst-word">{터짐모양.말[맞힘 % 터짐모양.말.length]}</b>
          {Array.from({ length: 10 }, (_, at) => (
            <i key={at} style={{ '--angle': `${at * 36 + (맞힘 * 17) % 36}deg`, '--far': `${70 + ((at * 29 + 맞힘 * 13) % 50)}px` } as CSSProperties}>
              {터짐모양.조각[at % 터짐모양.조각.length]}
            </i>
          ))}
        </div>
      )}
      {놓침 > 0 && <div className="game-missflash" key={`miss-${놓침}`} aria-hidden="true" />}
      {연속 >= 2 && (
        <div className={`game-combo ${연속 >= 5 ? 'hot' : ''}`.trim()} key={`combo-${연속}`}>
          🔥 {연속} 콤보!{연속 >= 3 && <small>속도 UP</small>}
        </div>
      )}
    </>
  );
  // 놓칠 때마다 이름이 다른 두 흔들림을 번갈아 걸어, 같은 흔들림이 다시 납니다.
  const 흔들림 = 놓침 > 0 ? `shake-${놓침 % 2}` : '';
  const 판 = (className: string, children: ReactNode) => (
    <div className={`game-track ${className} ${흔들림} ${연속 >= 5 ? 'fever' : ''}`.replace(/\s+/g, ' ').trim()}>
      {children}
      {효과}
    </div>
  );

  switch (game.mode) {
    case 'monster':
      return (
        <div className="game-scene game-monster">
          {줄(<>🏰 {'♥'.repeat(Math.max(0, 8 - wrong))}<i className="lost">{'♥'.repeat(Math.min(8, wrong))}</i></>, `막은 몬스터 ${correct}`)}
          {판('night', (
            <>
              <div className="game-stars" aria-hidden="true" />
              <div className={`game-faller ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
                <span className="game-big-emoji wobble">{몬스터들[h % 몬스터들.length]}</span>
                {문제}
              </div>
              {맞힘 > 0 && <span className="game-laser" key={`laser-${맞힘}`} aria-hidden="true" />}
              <div className="game-ground">🧱🧱🧱<b className="game-cannon">🏰</b>🧱🧱🧱</div>
            </>
          ))}
        </div>
      );
    case 'balloon':
      return (
        <div className="game-scene game-balloon">
          {줄(<>🎈 터뜨린 풍선 {correct}</>, <>날아간 풍선 {wrong}</>)}
          {판('sky', (
            <>
              <div className="game-clouds" aria-hidden="true"><span>☁️</span><span>☁️</span><span>☁️</span></div>
              <div className={`game-riser ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
                <span className="game-balloon-sway">
                  <span className="game-balloon-body" style={{ '--balloon': 풍선색[h % 풍선색.length] } as CSSProperties} />
                  <span className="game-balloon-string" />
                </span>
                {문제}
              </div>
              <span className="game-dart" aria-hidden="true">🎯</span>
            </>
          ))}
        </div>
      );
    case 'mole': {
      const 구멍 = h % 3;
      return (
        <div className="game-scene game-mole">
          {줄(<>🔨 잡은 두더지 {correct}</>, <>숨은 두더지 {wrong}</>)}
          {판('field', (
            <>
              {문제}
              <div className="game-holes">
                {[0, 1, 2].map((at) => (
                  <div className="game-hole" key={at}>
                    {at === 구멍 && (
                      <span className={`game-mole-body ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
                        <span className="game-mole-peek">🐹</span>
                      </span>
                    )}
                    {at !== 구멍 && <span className="game-mole-fake" style={{ animationDelay: `${(at + h) % 3}s` }} aria-hidden="true">👀</span>}
                  </div>
                ))}
              </div>
            </>
          ))}
        </div>
      );
    }
    case 'rocket': {
      const 칸 = correct % 10;
      return (
        <div className="game-scene game-rocket">
          {줄(<>🚀 발사 성공 {Math.floor(correct / 10)}번</>, `고도 ${칸 * 10}km`)}
          {판('space', (
            <>
              <div className="game-stars fast" aria-hidden="true" />
              <div className="game-altitude">
                <span className="game-rocket-body" style={{ bottom: `${칸 * 9}%` }}>
                  <span className="game-kick" key={`rocket-${맞힘}`}>🚀<i className="game-rocket-flame">🔥</i></span>
                </span>
              </div>
              <div className="game-center">{문제}</div>
            </>
          ))}
          <div className="game-fuel"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /></div>
        </div>
      );
    }
    case 'race': {
      const 나 = correct % 10;
      const 거북 = Math.min(9, wrong % 10);
      return (
        <div className="game-scene game-race">
          {줄(<>🏆 우승 {Math.floor(correct / 10)}번</>, <>🏁 결승까지 {10 - 나}칸</>)}
          {판('road', (
            <>
              <div className="game-lane"><span className="runner" style={{ left: `${나 * 9}%` }}><span className="game-kick" key={`me-${맞힘}`}>{avatar}{맞힘 > 0 && <i>💨</i>}</span></span><b>🏁</b></div>
              <div className="game-lane"><span className="runner slow" style={{ left: `${거북 * 9}%` }}>🐢</span><b>🏁</b></div>
              <div className="game-center">{문제}</div>
            </>
          ))}
          <div className="game-fuel race"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /></div>
        </div>
      );
    }
    case 'treasure':
      return (
        <div className="game-scene game-treasure">
          {줄(<>모은 보석 {correct}</>, <span className="game-gems">{Array.from({ length: Math.min(correct, 8) }, (_, at) => 보석들[(at * 7 + correct) % 보석들.length]).join('')}</span>)}
          {판('cave', (
            <>
              <span className={`game-chest ${stopped ? 'shake' : 'rattle'}`} key={`chest-${맞힘}`}>{맞힘 > 0 ? '🎁' : '🧰'}</span>
              {맞힘 > 0 && <span className="game-gem-fly" key={`gem-${맞힘}`} aria-hidden="true">{보석들[(correct * 7) % 보석들.length]}</span>}
              <div className="game-center">{문제}</div>
            </>
          ))}
          <div className="game-fuel fuse"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /><span>🔥</span></div>
        </div>
      );
    case 'tunnel3d':
      return (
        <div className="game-scene game-tunnel">
          {줄(<>🛸 지나온 터널 {correct}</>, <>☄️ 부딪힘 {wrong}</>)}
          {판('tunnel', (
            <>
              {/* 원근(perspective) 속에서 고리들이 다가오고, 문제 카드가 멀리서 날아옵니다. 콤보가 붙으면 고리가 빨라집니다. */}
              <div className="tunnel-rings" style={{ '--ring': `${Math.max(0.9, 2 - 연속 * 0.15)}s` } as CSSProperties}>
                {[0, 1, 2, 3, 4].map((at) => <i key={at} style={{ animationDelay: `${at * -0.4}s` }} />)}
              </div>
              <div className={`tunnel-card ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
                <span>☄️</span>
                {문제}
              </div>
              {맞힘 > 0 && <span className="tunnel-beam" key={`beam-${맞힘}`} aria-hidden="true" />}
              <span className="tunnel-ship">🛸</span>
            </>
          ))}
        </div>
      );
    case 'dice3d': {
      const 점수 = correct * 3 + (correct > 0 ? (h % 3) : 0);
      return (
        <div className="game-scene game-dice">
          {줄(<>🎲 점수 {점수}</>, <>놓친 주사위 {wrong}</>)}
          {판('table', (
            <>
              <div className="dice-stage" key={`dice-${맞힘}`}>
                <div className={`dice-cube ${stopped ? 'stopped' : ''}`} key={questionKey}>
                  {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].map((face, at) => <span className={`dice-face f${at}`} key={at}>{face}</span>)}
                </div>
              </div>
              <div className="game-center">{문제}</div>
            </>
          ))}
          <div className="game-fuel dice"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /></div>
        </div>
      );
    }
    default:
      return 문제;
  }
}
