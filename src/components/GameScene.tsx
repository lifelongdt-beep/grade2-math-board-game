import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Difficulty, QuestionVisual } from '../types';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import { 놀이시간, type GameInfo, type GameMode } from '../data/games';
import { playGameHit, playGameMiss, playGameReady, playGameSpawn, playGameStage, playGameTick } from '../sound';

// ════════════════════════════════════════════════════════════════════
// 단원 놀이 화면
// ────────────────────────────────────────────────────────────────────
// 문제는 다른 차시처럼 아래 보기 단추로 풉니다. 이 자리는 놀이마다 다른
// 그림으로 시간을 보여 줍니다 — 몬스터가 내려오고, 풍선이 떠오르고, 두더지가
// 숨고, 연료나 심지가 줄어들고, 3D 터널 속에서 문제가 날아오고, 3D 승부차기에서 공을 찹니다. 시간이 다
// 되면(onAnimationEnd) 놓친 것으로 칩니다. 틀린 뒤 도움말을 보는 동안에는
// 멈춰 둡니다.
//
// 규칙은 단순하게 두고 손맛을 크게 냅니다. 맞히면 그 자리에서 펑 터지며 조각이
// 튀고, 연달아 맞히면 콤보가 붙고 놀이가 조금씩 빨라집니다. 놓치면 화면이
// 흔들리고 콤보가 끊깁니다. 배경(별·구름·길·터널)은 늘 움직여 멈춘 그림처럼
// 보이지 않게 합니다.
//
// 소리도 놀이마다 다릅니다(sound.ts의 단원 놀이 효과음). 문제가 나올 때 작은
// 신호, 맞히면 놀이에 맞는 효과음과 높아지는 콤보 소리, 놓치면 놓친 소리, 시간이
// 3초 남으면 똑딱 소리가 납니다.
//
// 화면은 오락실 게임처럼 꾸밉니다. 처음에 READY? GO!가 뜨고, 위에는 점수판(SCORE)과
// 스테이지가 있습니다. 맞히면 +100이 튀어 오르고, 연달아 맞히면 배율(×2, ×3…)이 붙어
// 점수가 크게 오릅니다. 10문제를 맞힐 때마다 STAGE가 올라가며 조금 더 빨라집니다.
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
  // 두더지는 망치가 구멍에 있던 두더지를 직접 내리치므로(아래 game-whack), 가운데에는 별만 터뜨립니다.
  mole: { 큰: '⭐', 말: ['뿅!', '딱!', '잡았다!'], 조각: ['💫', '⭐', '✨'] },
  rocket: { 큰: '⭐', 말: ['슝!', '발사!', '부스터!'], 조각: ['✨', '⭐', '💨'] },
  race: { 큰: '💨', 말: ['쌩!', '달려!', '앞질렀다!'], 조각: ['💨', '✨', '⭐'] },
  treasure: { 큰: '✨', 말: ['반짝!', '열렸다!', '보물!'], 조각: ['💎', '🪙', '✨'] },
  tunnel3d: { 큰: '💥', 말: ['콰광!', '명중!', '빔!'], 조각: ['✨', '💫', '⭐'] },
  soccer3d: { 큰: '⭐', 말: ['골인!', '슛!', 'GOAL!'], 조각: ['⭐', '🎉', '✨'] },
};

/**
 * 연달아 맞힐 때마다, 그리고 스테이지가 오를 때마다 시간이 조금씩 줄어 놀이가 빨라집니다.
 * 아무리 빨라도 처음 시간의 70%까지만 줄입니다.
 */
const 빨라짐 = (연속: number, 스테이지: number) => Math.max(0.7, 1 - 연속 * 0.04 - (스테이지 - 1) * 0.03);

/** 한 스테이지는 10문제입니다. */
const 스테이지문제 = 10;
/** 연속 세 번마다 배율이 1씩 오릅니다(최대 ×5). */
export const 점수배율 = (연속: number) => Math.min(5, 1 + Math.floor(Math.max(0, 연속 - 1) / 3));

/** 맞힘·놓침이 새로 생긴 순간을 알아챕니다. 처음 그릴 때 이미 있던 기록으로는 터지지 않습니다. */
function use놀이사건(correct: number, wrong: number) {
  const 앞 = useRef({ correct, wrong });
  const 처음 = { 맞힘: 0, 놓침: 0, 연속: 0, 최고: 0, 점수: 0, 얻은: 0 };
  const [사건, set사건] = useState(처음);
  useEffect(() => {
    const 전 = 앞.current;
    if (correct > 전.correct) {
      set사건((one) => {
        const 연속 = one.연속 + (correct - 전.correct);
        const 얻은 = 100 * 점수배율(연속);
        return { ...one, 맞힘: one.맞힘 + 1, 연속, 최고: Math.max(one.최고, 연속), 점수: one.점수 + 얻은, 얻은 };
      });
    } else if (wrong > 전.wrong) {
      set사건((one) => ({ ...one, 놓침: one.놓침 + 1, 연속: 0 }));
    } else if (correct < 전.correct || wrong < 전.wrong) {
      // 다시 시작했습니다.
      set사건(처음);
    }
    앞.current = { correct, wrong };
  }, [correct, wrong]);
  return 사건;
}

/** 라이벌과 먼저 이만큼 점수를 내는 쪽이 한 판을 이깁니다. 달리기에서는 결승선까지의 칸 수입니다. */
const 결승칸 = 10;
/**
 * 놀이마다 맞서는 라이벌이 있습니다(달리기는 거북이, 풍선은 참새…). 라이벌은 문제와 상관없이
 * 시간이 흐르면 슬금슬금 점수를 냅니다. 그 문제 시간의 70%마다 1점쯤 내므로, 꾸준히 맞히면 이기고
 * 머뭇거리면 따라잡힙니다. 틀리면 라이벌이 1점 더 얻습니다. 너무 뒤처지면 라이벌이 조금 빨라지고,
 * 앞서면 조금 느려져서 늘 엎치락뒤치락하게 둡니다. 먼저 10점을 낸 쪽이 그 판을 이기고 새 판을 합니다.
 */
const 라이벌한점 = 0.7;
const 라이벌걸음간격 = 200;

/** 놀이마다 맞서는 라이벌입니다. 글에 바로 붙여 쓰도록 조사까지 함께 적어 둡니다. */
const 라이벌들: Record<GameMode, { 얼굴: string; 이름: string; 이가: string; 을를: string }> = {
  monster: { 얼굴: '👿', 이름: '몬스터 대장', 이가: '몬스터 대장이', 을를: '몬스터 대장을' },
  balloon: { 얼굴: '🐦', 이름: '참새', 이가: '참새가', 을를: '참새를' },
  tunnel3d: { 얼굴: '👽', 이름: '외계인', 이가: '외계인이', 을를: '외계인을' },
  mole: { 얼굴: '🐱', 이름: '고양이', 이가: '고양이가', 을를: '고양이를' },
  rocket: { 얼굴: '🤖', 이름: '로봇', 이가: '로봇이', 을를: '로봇을' },
  race: { 얼굴: '🐢', 이름: '거북이', 이가: '거북이가', 을를: '거북이를' },
  treasure: { 얼굴: '🏴‍☠️', 이름: '해적', 이가: '해적이', 을를: '해적을' },
  soccer3d: { 얼굴: '🧤', 이름: '골키퍼', 이가: '골키퍼가', 을를: '골키퍼를' },
};

function use라이벌(맞힘: number, 놓침: number, 기본초: number, 멈춤: boolean) {
  const 처음 = { 출발맞힘: 0, 상대: 0, 내승: 0, 상대승: 0, 판: 0 };
  const [경주, set경주] = useState(처음);
  const 맞힘지금 = useRef(맞힘);
  맞힘지금.current = 맞힘;
  // 한 판이 끝나면 둘 다 0점에서 다시 시작합니다.
  const 새판 = (one: typeof 처음, 누가: '나' | '상대') => ({
    출발맞힘: 맞힘지금.current,
    상대: 0,
    내승: one.내승 + (누가 === '나' ? 1 : 0),
    상대승: one.상대승 + (누가 === '상대' ? 1 : 0),
    판: one.판 + 1,
  });
  useEffect(() => {
    if (멈춤) return undefined;
    const 시계 = window.setInterval(() => set경주((one) => {
      const 나 = 맞힘지금.current - one.출발맞힘;
      const 차이 = 나 - one.상대;
      const 빠르기 = 차이 > 3 ? 1.6 : 차이 < -1 ? 0.6 : 1;
      const 상대 = one.상대 + (라이벌걸음간격 / (기본초 * 라이벌한점 * 1000)) * 빠르기;
      return 상대 >= 결승칸 ? 새판(one, '상대') : { ...one, 상대 };
    }), 라이벌걸음간격);
    return () => window.clearInterval(시계);
  }, [멈춤, 기본초]);
  useEffect(() => {
    set경주((one) => (맞힘 - one.출발맞힘 >= 결승칸 ? 새판(one, '나') : one));
  }, [맞힘]);
  useEffect(() => {
    if (놓침 === 0) return;
    set경주((one) => (one.상대 + 1 >= 결승칸 ? 새판(one, '상대') : { ...one, 상대: one.상대 + 1 }));
  }, [놓침]);
  // 다시 시작하면 경주도 처음부터 합니다.
  useEffect(() => {
    if (맞힘 === 0 && 놓침 === 0) set경주(처음);
  }, [맞힘, 놓침]);
  return { ...경주, 나: 맞힘 - 경주.출발맞힘 };
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
  const { 맞힘, 놓침, 연속, 점수, 얻은 } = use놀이사건(correct, wrong);
  const 스테이지 = 1 + Math.floor(맞힘 / 스테이지문제);
  const 배율 = 점수배율(연속);
  const 기본초 = 놀이시간[level] + (sharedScreen && level === '상' ? 함께쓰는화면덤 : 0);
  const 초 = 기본초 * 빨라짐(연속, 스테이지);

  // 처음 화면에 들어오면 READY? GO!를 띄우고 출발 신호를 울립니다.
  const [준비, set준비] = useState(true);
  useEffect(() => {
    playGameReady();
    const 끝 = window.setTimeout(() => set준비(false), 1500);
    return () => window.clearTimeout(끝);
  }, []);
  const 경주 = use라이벌(맞힘, 놓침, 기본초, stopped || 준비);
  const 라이벌 = 라이벌들[game.mode];
  // 바로 앞 판이 끝났을 때의 승패를 기억해, 이번 판을 누가 이겼는지 알아냅니다.
  const 지난판 = useRef({ 판: 0, 내승: 0, 상대승: 0 });
  const 판기억 = useRef({ 판: 0, 내승: 0, 상대승: 0 });
  if (판기억.current.판 !== 경주.판) {
    지난판.current = 판기억.current;
    판기억.current = { 판: 경주.판, 내승: 경주.내승, 상대승: 경주.상대승 };
  }
  // 라이벌을 이기면 스테이지 소리처럼 올라가는 소리를 냅니다(10문제째와 겹치면 이미 울리므로 건너뜁니다).
  const 소리낸판 = useRef(경주.판);
  useEffect(() => {
    if (경주.판 === 소리낸판.current) return;
    소리낸판.current = 경주.판;
    if (game.mode !== 'race' && 경주.내승 > 지난판.current.내승 && 맞힘 % 스테이지문제 !== 0) playGameStage();
    else if (경주.상대승 > 지난판.current.상대승) playGameMiss(game.mode);
  }, [경주.판, 경주.내승, 경주.상대승, 맞힘, game.mode]);
  const 시계: CSSProperties | undefined = stopped ? undefined : { animationDuration: `${초.toFixed(2)}s` };
  const 끝나면 = stopped ? undefined : onTimeout;

  // 맞힘·놓침이 새로 생기면 그 놀이의 효과음을 냅니다.
  const 소리낸 = useRef({ 맞힘, 놓침 });
  useEffect(() => {
    if (맞힘 > 소리낸.current.맞힘) {
      playGameHit(game.mode, 연속);
      if (맞힘 % 스테이지문제 === 0) playGameStage();
    }
    else if (놓침 > 소리낸.current.놓침) playGameMiss(game.mode);
    소리낸.current = { 맞힘, 놓침 };
  }, [맞힘, 놓침, 연속, game.mode]);

  // 새 문제가 나오면 작은 신호를 내고, 시간이 3초 남으면 1초마다 똑딱입니다.
  // 맞힌 소리와 겹치지 않게 등장 신호는 조금 늦게 냅니다.
  useEffect(() => {
    if (stopped) return undefined;
    const 시계들 = [window.setTimeout(() => playGameSpawn(game.mode), 380)];
    for (const 남은 of [3, 2, 1]) {
      const 언제 = (초 - 남은) * 1000;
      if (언제 > 600) 시계들.push(window.setTimeout(() => playGameTick(남은), 언제));
    }
    return () => 시계들.forEach((one) => window.clearTimeout(one));
  }, [questionKey, stopped, 초, game.mode]);
  const h = 해시(questionKey);
  // 바로 앞 문제의 두더지 구멍을 기억해 둡니다. 맞히는 순간 문제가 바뀌어 새 두더지가 나오므로,
  // 망치는 방금 맞힌 문제의 두더지가 있던 구멍을 내리쳐야 합니다.
  // 몬스터·풍선도 같습니다. 문제가 나온 때를 기억해 두면, 맞힌 순간 그 물체가 어디까지 왔는지
  // (진행: 0~1) 알 수 있어 바로 그 자리에서 터뜨릴 수 있습니다.
  const 앞문제 = useRef({ key: questionKey, 구멍: h % 3, 해시: h, 시작: performance.now(), 초 });
  const 직전 = useRef({ 구멍: h % 3, 해시: h, 진행: 0 });
  if (앞문제.current.key !== questionKey) {
    const 지난 = 앞문제.current;
    직전.current = { 구멍: 지난.구멍, 해시: 지난.해시, 진행: Math.min(1, (performance.now() - 지난.시작) / (지난.초 * 1000)) };
    앞문제.current = { key: questionKey, 구멍: h % 3, 해시: h, 시작: performance.now(), 초 };
  }
  const 직전구멍 = { current: 직전.current.구멍 };
  // 맞힌 물체가 있던 높이(%)입니다. game-fall은 6%→72%, game-rise는 2%→78%로 움직입니다.
  const 몬스터높이 = 6 + 66 * 직전.current.진행;
  const 풍선높이 = 2 + 76 * 직전.current.진행;
  // 펑 터지는 자리입니다. 몬스터·풍선·보물은 그 물체 자리에서, 나머지는 가운데에서 터집니다.
  // 로켓은 지금 고도, 달리기는 내 캐릭터 자리, 두더지는 맞힌 구멍, 승부차기는 골문입니다.
  const 터질자리: CSSProperties | undefined = {
    monster: { top: `${Math.min(80, 몬스터높이 + 10)}%` },
    balloon: { top: `${Math.max(12, 100 - 풍선높이 - 30)}%` },
    treasure: { top: '78%' },
    rocket: { left: '9%', top: `${Math.max(12, 82 - (correct % 10) * 9)}%` },
    // 결승선을 밟아 새 판이 되었으면 결승선에서 터집니다.
    race: { left: `${경주.나 === 0 && 경주.판 > 0 ? 88 : Math.min(88, 경주.나 * 9 + 5)}%`, top: '22%' },
    mole: { left: `${((직전.current.구멍 * 2 + 1) / 6) * 100}%`, top: '72%' },
    soccer3d: { top: '22%' },
    tunnel3d: undefined,
  }[game.mode];
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

  // 라이벌과의 줄다리기입니다. 가운데 깃발이 앞선 쪽으로 끌려가고, 라이벌이 점수를 낼 때마다 숫자가 튑니다.
  // 달리기는 길 위에서 거북이와 직접 겨루므로 줄다리기를 따로 두지 않습니다.
  const 상대점수 = Math.floor(경주.상대);
  const 앞섬 = 경주.나 - 경주.상대;
  const 라이벌줄 = game.mode === 'race' ? null : (
    <span
      className={`rival-bar ${앞섬 <= -0.5 ? 'behind' : 앞섬 >= 1 ? 'ahead' : ''}`.trim()}
      aria-label={`나 ${경주.나}점, ${라이벌.이름} ${상대점수}점, 먼저 ${결승칸}점 내기`}
    >
      <b className="rival-me">{avatar}{경주.나}</b>
      <span className="rival-rope" aria-hidden="true"><i style={{ left: `${50 + Math.max(-44, Math.min(44, 앞섬 * 4.4))}%` }} /></span>
      <b className="rival-them" key={`them-${경주.판}-${상대점수}`}>{상대점수}{라이벌.얼굴}</b>
      {경주.내승 + 경주.상대승 > 0 && <small>{경주.내승}승 {경주.상대승}패</small>}
    </span>
  );
  // 한 판이 끝난 순간의 알림입니다. 판이 바뀌면(판 수가 늘면) 누가 이겼는지 띄웁니다.
  const 방금이김 = 경주.판 > 0 && 경주.나 === 0 && 경주.출발맞힘 === 맞힘 && 경주.내승 > 0 && 지난판.current.내승 < 경주.내승;
  const 판끝알림 = game.mode === 'race' || 경주.판 === 0 ? null : 지난판.current.상대승 < 경주.상대승 ? (
    <div className="arcade-banner stage rival lose" key={`rival-${경주.판}`} aria-hidden="true"><b>{라이벌.얼굴} {라이벌.이가} 먼저 {결승칸}점!</b><small>다시 도전!</small></div>
  ) : 방금이김 ? (
    <div className="arcade-banner stage rival win" key={`rival-${경주.판}`} aria-hidden="true"><b>🏆 {라이벌.을를} 이겼다!</b><small>{경주.내승}승 {경주.상대승}패</small></div>
  ) : null;

  // 맞힌 순간의 펑, 놓친 순간의 번쩍임, 연속 콤보입니다. key가 바뀔 때마다 움직임이 처음부터 다시 납니다.
  const 터짐모양 = 터짐[game.mode];
  const 효과 = (
    <>
      {맞힘 > 0 && (
        <div className="game-burst" key={`hit-${맞힘}`} style={터질자리} aria-hidden="true">
          <span className="game-burst-big">{터짐모양.큰}</span>
          <b className="game-burst-word">{터짐모양.말[맞힘 % 터짐모양.말.length]}</b>
          {Array.from({ length: 10 }, (_, at) => (
            <i key={at} style={{ '--angle': `${at * 36 + (맞힘 * 17) % 36}deg`, '--far': `${70 + ((at * 29 + 맞힘 * 13) % 50)}px` } as CSSProperties}>
              {터짐모양.조각[at % 터짐모양.조각.length]}
            </i>
          ))}
        </div>
      )}
      {맞힘 > 0 && (
        <b className={`arcade-points ${배율 > 1 ? 'multi' : ''}`.trim()} key={`pts-${맞힘}`} aria-hidden="true">
          +{얻은}{배율 > 1 && <small> ×{배율}</small>}
        </b>
      )}
      {놓침 > 0 && <div className="game-missflash" key={`miss-${놓침}`} aria-hidden="true"><b>MISS!</b></div>}
      <div className="arcade-hud" aria-label={`점수 ${점수}점, 스테이지 ${스테이지}`}>
        <span className="arcade-score">SCORE <b key={점수} className={점수 > 0 ? 'bump' : ''}>{String(점수).padStart(6, '0')}</b></span>
        {배율 > 1 && <span className="arcade-multi" key={`x-${배율}`}>×{배율}</span>}
        {라이벌줄}
        <span className="arcade-stage">STAGE <b>{스테이지}</b></span>
      </div>
      {준비 && (
        <div className="arcade-banner ready" aria-hidden="true"><b>READY?</b><b>GO!</b></div>
      )}
      {판끝알림}
      {맞힘 > 0 && 맞힘 % 스테이지문제 === 0 && !방금이김 && (
        <div className="arcade-banner stage" key={`stage-${스테이지}`} aria-hidden="true"><b>STAGE {스테이지}!</b><small>SPEED UP</small></div>
      )}
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
              {/* 맞히면 성에서 광선이 그 몬스터가 있던 높이까지 쏘아 올라가고, 몬스터는 그 자리에서 터집니다. */}
              {맞힘 > 0 && <span className="game-laser" key={`laser-${맞힘}`} style={{ '--laser': `${Math.min(92, Math.max(8, 88 - 몬스터높이))}%` } as CSSProperties} aria-hidden="true" />}
              {맞힘 > 0 && (
                <div className="game-ghost monster" key={`ghost-${맞힘}`} style={{ top: `${몬스터높이}%` }} aria-hidden="true">
                  <span>{몬스터들[직전.current.해시 % 몬스터들.length]}</span><b>💥</b>
                </div>
              )}
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
              {/* 맞히면 방금 그 풍선이 떠 있던 자리에서 팡 터집니다. */}
              {맞힘 > 0 && (
                <div className="game-ghost balloon" key={`ghost-${맞힘}`} style={{ bottom: `calc(${풍선높이}% + 40px)` }} aria-hidden="true">
                  <span className="game-balloon-body" style={{ '--balloon': 풍선색[직전.current.해시 % 풍선색.length] } as CSSProperties} /><b>💥</b>
                </div>
              )}
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
                {/* 맞히면 망치가 방금 그 두더지를 쾅 내리치고, 두더지는 납작해져 구멍으로 쏙 들어갑니다. */}
                {맞힘 > 0 && (
                  <div className="game-whack" key={`whack-${맞힘}`} style={{ left: `${((직전구멍.current * 2 + 1) / 6) * 100}%` }} aria-hidden="true">
                    <span className="game-whack-mole">🐹</span>
                    <span className="game-whack-stars">💫</span>
                    <span className="game-whack-hammer">🔨</span>
                  </div>
                )}
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
      const { 나, 상대: 거북, 내승: 내우승, 상대승: 거북우승, 판: 판수 } = 경주;
      // 거북이가 반 칸 넘게 앞서야 '서둘러!'를 띄웁니다. 출발선에서 조금 기어 나간 것만으로는 띄우지 않습니다.
      const 거북앞섬 = 거북 >= 나 + 0.5;
      return (
        <div className="game-scene game-race">
          {줄(
            <>🏆 나 {내우승} : {거북우승} 🐢</>,
            거북앞섬 ? <b className="race-warn">🐢 거북이가 앞서요! 서둘러!</b> : <>🏁 결승까지 {결승칸 - 나}칸</>,
          )}
          {판('road', (
            <>
              <div className="game-lane"><span className="runner" key={`me-run-${판수}`} style={{ left: `${나 * 9}%` }}><span className="game-kick" key={`me-${맞힘}`}>{avatar}{맞힘 > 0 && <i>💨</i>}</span></span><b>🏁</b></div>
              <div className="game-lane"><span className="runner slow crawl" key={`turtle-${판수}`} style={{ left: `${Math.min(결승칸, 거북) * 9}%` }}>🐢</span><b>🏁</b></div>
              <div className="game-center">{문제}</div>
              {거북우승 > 0 && (
                <div className="arcade-banner stage turtle" key={`turtle-win-${거북우승}`} aria-hidden="true"><b>🐢 거북이 먼저 도착!</b><small>다시 출발!</small></div>
              )}
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
              <span className={`game-chest ${stopped ? 'shake' : 'rattle'}`} key={`chest-${맞힘}`}>🧰</span>
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
    case 'soccer3d': {
      // 맞힐 때마다 공이 골문 왼쪽·오른쪽 구석으로 번갈아 날아가고, 골키퍼는 반대쪽으로 몸을 날립니다.
      const 쪽 = 맞힘 % 2 === 0 ? 'left' : 'right';
      return (
        <div className="game-scene game-soccer">
          {줄(<>⚽ 골인 {correct}</>, <>🧤 막힌 공 {wrong}</>)}
          {판('pitch', (
            <>
              {/* 원근(perspective) 속에 비스듬히 누운 잔디와 벌칙 구역 선입니다. */}
              <div className="soccer-plane" aria-hidden="true"><i /></div>
              <div className="soccer-goal" aria-hidden="true">
                <span className={`soccer-keeper ${stopped ? 'save' : 맞힘 > 0 ? `dive-${쪽 === 'left' ? 'right' : 'left'}` : ''}`.trim()} key={`keeper-${맞힘}-${stopped}`}>🙆</span>
              </div>
              {맞힘 > 0 && <span className={`soccer-shot to-${쪽}`} key={`shot-${맞힘}`} aria-hidden="true">⚽</span>}
              {!stopped && <span className="soccer-ball" key={questionKey} aria-hidden="true">⚽</span>}
              <div className="game-center">{문제}</div>
            </>
          ))}
          <div className="game-fuel soccer"><div className={stopped ? 'stopped' : ''} key={questionKey} style={시계} onAnimationEnd={끝나면} /></div>
        </div>
      );
    }
    default:
      return 문제;
  }
}
