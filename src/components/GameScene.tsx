import type { CSSProperties, ReactNode } from 'react';
import type { Difficulty, QuestionVisual } from '../types';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import { 놀이시간, type GameInfo } from '../data/games';

// ════════════════════════════════════════════════════════════════════
// 단원 놀이 화면
// ────────────────────────────────────────────────────────────────────
// 문제는 다른 차시처럼 아래 보기 단추로 풉니다. 이 자리는 놀이마다 다른
// 그림으로 시간을 보여 줍니다 — 몬스터가 내려오고, 풍선이 떠오르고, 두더지가
// 숨고, 연료나 심지가 줄어들고, 3D 터널 속에서 문제가 날아옵니다. 시간이 다
// 되면(onAnimationEnd) 놓친 것으로 칩니다. 틀린 뒤 도움말을 보는 동안에는
// 멈춰 둡니다.
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
  const 초 = 놀이시간[level] + (sharedScreen && level === '상' ? 함께쓰는화면덤 : 0);
  const 시계: CSSProperties | undefined = stopped ? undefined : { animationDuration: `${초}s` };
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

  switch (game.mode) {
    case 'monster':
      return (
        <div className="game-scene game-monster">
          {줄(<>🏰 {'♥'.repeat(Math.max(0, 8 - wrong))}<i className="lost">{'♥'.repeat(Math.min(8, wrong))}</i></>, `막은 몬스터 ${correct}`)}
          <div className="game-track">
            <div className={`game-faller ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
              <span className="game-big-emoji">{몬스터들[h % 몬스터들.length]}</span>
              {문제}
            </div>
            <div className="game-ground">🧱🧱🧱🏰🧱🧱🧱</div>
          </div>
        </div>
      );
    case 'balloon':
      return (
        <div className="game-scene game-balloon">
          {줄(<>🎈 터뜨린 풍선 {correct}</>, <>날아간 풍선 {wrong}</>)}
          <div className="game-track sky">
            <div className="game-clouds">☁️ ☁️ ☁️</div>
            <div className={`game-riser ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
              <span className="game-balloon-body" style={{ '--balloon': 풍선색[h % 풍선색.length] } as CSSProperties} />
              <span className="game-balloon-string" />
              {문제}
            </div>
          </div>
        </div>
      );
    case 'mole': {
      const 구멍 = h % 3;
      return (
        <div className="game-scene game-mole">
          {줄(<>🔨 잡은 두더지 {correct}</>, <>숨은 두더지 {wrong}</>)}
          <div className="game-track field">
            {문제}
            <div className="game-holes">
              {[0, 1, 2].map((at) => (
                <div className="game-hole" key={at}>
                  {at === 구멍 && (
                    <span className={`game-mole-body ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>🐹</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case 'rocket': {
      const 칸 = correct % 10;
      return (
        <div className="game-scene game-rocket">
          {줄(<>🚀 발사 성공 {Math.floor(correct / 10)}번</>, `고도 ${칸 * 10}km`)}
          <div className="game-track space">
            <div className="game-altitude"><span className="game-rocket-body" style={{ bottom: `${칸 * 9}%` }}>🚀</span></div>
            <div className="game-center">{문제}</div>
          </div>
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
          <div className="game-track road">
            <div className="game-lane"><span style={{ left: `${나 * 9}%` }}>{avatar}</span><b>🏁</b></div>
            <div className="game-lane"><span style={{ left: `${거북 * 9}%` }}>🐢</span><b>🏁</b></div>
            <div className="game-center">{문제}</div>
          </div>
          <div className="game-fuel race"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /></div>
        </div>
      );
    }
    case 'treasure':
      return (
        <div className="game-scene game-treasure">
          {줄(<>모은 보석 {correct}</>, <span className="game-gems">{Array.from({ length: Math.min(correct, 8) }, (_, at) => 보석들[(at * 7 + correct) % 보석들.length]).join('')}</span>)}
          <div className="game-track cave">
            <span className={`game-chest ${stopped ? 'shake' : ''}`}>🧰</span>
            <div className="game-center">{문제}</div>
          </div>
          <div className="game-fuel fuse"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /><span>🔥</span></div>
        </div>
      );
    case 'tunnel3d':
      return (
        <div className="game-scene game-tunnel">
          {줄(<>🛸 지나온 터널 {correct}</>, <>☄️ 부딪힘 {wrong}</>)}
          <div className="game-track tunnel">
            {/* 원근(perspective) 속에서 고리들이 다가오고, 문제 카드가 멀리서 날아옵니다. */}
            <div className="tunnel-rings">{[0, 1, 2, 3, 4].map((at) => <i key={at} style={{ animationDelay: `${at * -0.4}s` }} />)}</div>
            <div className={`tunnel-card ${stopped ? 'stopped' : ''}`} key={questionKey} style={시계} onAnimationEnd={끝나면}>
              <span>☄️</span>
              {문제}
            </div>
            <span className="tunnel-ship">🛸</span>
          </div>
        </div>
      );
    case 'dice3d': {
      const 점수 = correct * 3 + (correct > 0 ? (h % 3) : 0);
      return (
        <div className="game-scene game-dice">
          {줄(<>🎲 점수 {점수}</>, <>놓친 주사위 {wrong}</>)}
          <div className="game-track table">
            <div className="dice-stage">
              <div className={`dice-cube ${stopped ? 'stopped' : ''}`} key={questionKey}>
                {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].map((face, at) => <span className={`dice-face f${at}`} key={at}>{face}</span>)}
              </div>
            </div>
            <div className="game-center">{문제}</div>
          </div>
          <div className="game-fuel dice"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /></div>
        </div>
      );
    }
    default:
      return 문제;
  }
}
