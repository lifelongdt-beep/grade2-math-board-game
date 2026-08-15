import { useState } from 'react';
import { Home, Printer, RefreshCcw, XCircle } from 'lucide-react';
import type { AnswerRecord, Lesson, Player } from '../types';

// ════════════════════════════════════════════════════════════════════
// 수업이 끝난 뒤 보는 리포트
// ────────────────────────────────────────────────────────────────────
// 교사용 분석은 선생님이 보는 화면입니다. 이것은 아이가 보는 화면입니다.
// 그래서 두 가지가 다릅니다.
//
// 하나, 말투. '정답률 62%'가 아니라 '10문제 중 6문제를 맞혔어요'입니다.
// 둘, 무엇을 보여 주는가. 못한 것을 세어 보여 주는 대신, 틀린 문제를
// 다시 한 번 짚어 주고 왜 그렇게 되는지를 알려 줍니다. 수업이 끝나고
// 나서 아이가 남기고 갈 것은 점수가 아니라 '아, 그렇구나' 하나입니다.
//
// 한 아이씩 봅니다. 여럿을 한 화면에 늘어놓으면 전자칠판 앞에 선 아이가
// 자기 것을 찾기 전에 옆자리 것부터 보게 되고, 틀린 개수가 나란히 놓이면
// 그 줄이 곧 등수가 됩니다. 인쇄도 한 장에 한 아이씩 나가야 집으로
// 보낼 수 있습니다.
// ════════════════════════════════════════════════════════════════════

type Props = {
  players: Player[];
  records: AnswerRecord[];
  lesson: Lesson;
  onClose: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
};

// 칭찬은 잘한 아이에게만 하는 것이 아닙니다. 한 문제를 맞혔든 열 문제를
// 맞혔든, 그 아이가 오늘 한 일을 그대로 말해 줍니다.
const praiseFor = (total: number, correct: number, wrong: number) => {
  if (total === 0) return '다음에는 함께 풀어 봐요.';
  if (wrong === 0) return '푼 문제를 하나도 빠짐없이 맞혔어요. 대단해요!';
  if (correct === 0) return '끝까지 앉아서 다 풀었어요. 그게 가장 어려운 일이에요.';
  if (correct >= wrong * 3) return '어려운 문제도 척척 풀어냈어요.';
  if (correct >= wrong) return '맞힌 문제가 더 많아요. 잘하고 있어요.';
  return '틀린 문제가 있어도 괜찮아요. 그만큼 배운 거예요.';
};

const seconds = (ms: number) => (ms === 0 ? '-' : `${(ms / 1000).toFixed(1)}초`);

export const ResultReport = ({
  players,
  records,
  lesson,
  onClose,
  onPlayAgain,
  onHome,
}: Props) => {
  const [shownId, setShownId] = useState(players[0]?.id ?? 1);
  const player = players.find((one) => one.id === shownId) ?? players[0];

  if (!player) return null;

  const mine = records.filter((record) => record.playerId === player.id);
  const correct = mine.filter((record) => record.correct).length;
  const wrong = mine.length - correct;
  const spent = mine.reduce((total, record) => total + record.responseMs, 0);
  const averageMs = mine.length === 0 ? 0 : Math.round(spent / mine.length);

  // 같은 문제를 두 번 틀렸으면 한 번만 적습니다. 같은 것이 두 번 적혀
  // 있으면 더 많이 틀린 것처럼 보이고, 읽을 것만 늘어납니다.
  const seen = new Set<string>();
  const wrongs = mine
    .filter((record) => !record.correct)
    .filter((record) => {
      if (seen.has(record.questionId)) return false;
      seen.add(record.questionId);
      return true;
    });

  // 막대 길이를 잴 기준입니다. 0으로 나누지 않도록 최소 1로 둡니다.
  const widest = Math.max(1, mine.length);

  return (
    <div className="report-overlay" role="dialog" aria-modal="true" aria-label="수업 결과">
      <section className="report-card">
        <header className="report-header">
          <div>
            <p className="eyebrow">{lesson.unitTitle} · {lesson.lessonNo}차시</p>
            <h2>오늘 공부 끝!</h2>
            <p className="report-lesson">{lesson.title}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="결과 닫기">
            <XCircle size={22} />
          </button>
        </header>

        {/* ── 누구 것을 볼지 ───────────────────────────────────── */}
        {players.length > 1 && (
          <div className="report-tabs" role="tablist" aria-label="학생 고르기">
            {players.map((one) => (
              <button
                type="button"
                key={one.id}
                role="tab"
                aria-selected={one.id === player.id}
                className={one.id === player.id ? 'chosen' : ''}
                onClick={() => setShownId(one.id)}
              >
                <span aria-hidden="true">{one.avatar}</span>
                {one.name}
              </button>
            ))}
          </div>
        )}

        <p className="report-winner">
          <span className="report-winner-avatars" aria-hidden="true">{player.avatar}</span>
          <span className="report-winner-label">오늘 푼 만큼</span>
          <strong>{player.name}</strong>
          <span>{correct}문제를 맞혔어요!</span>
        </p>

        {/* ── 이 아이가 푼 것 ──────────────────────────────────── */}
        <section className="report-block">
          <h3>오늘 푼 문제</h3>
          <div className="report-totals">
            <div>
              <strong>{mine.length}</strong>
              <span>푼 문제</span>
            </div>
            <div className="good">
              <strong>{correct}</strong>
              <span>맞힌 문제</span>
            </div>
            <div className="miss">
              <strong>{wrong}</strong>
              <span>틀린 문제</span>
            </div>
          </div>

          <ul className="report-bars">
            <li>
              <span className="report-bar-name">
                <span aria-hidden="true">{player.avatar}</span>
                {player.name}
              </span>
              <span className="report-bar-track">
                {/* 맞힌 만큼 초록, 틀린 만큼 빨강입니다. */}
                <span className="report-bar-good" style={{ width: `${(correct / widest) * 100}%` }} />
                <span className="report-bar-miss" style={{ width: `${(wrong / widest) * 100}%` }} />
              </span>
              <span className="report-bar-count">{correct} / {mine.length}</span>
              <span className="report-bar-time">{seconds(averageMs)}</span>
            </li>
          </ul>

          <ul className="report-praise">
            <li>
              <span aria-hidden="true">{player.avatar}</span>
              <strong>{player.name}</strong>
              {praiseFor(mine.length, correct, wrong)}
            </li>
          </ul>
        </section>

        {/* ── 오답 노트 ────────────────────────────────────────── */}
        <section className="report-block">
          <h3>다시 볼 문제</h3>
          {mine.length === 0 ? (
            // 한 문제도 풀지 못한 채 끝났을 때 '틀린 문제가 없어요'라고 하면
            // 칭찬이 아니라 빈말이 됩니다. 아이도 그걸 압니다.
            <p className="report-empty quiet">아직 푼 문제가 없어요. 다음에 다시 해 봐요.</p>
          ) : wrongs.length === 0 ? (
            <p className="report-empty">틀린 문제가 하나도 없어요. 정말 잘했어요!</p>
          ) : (
            <div className="report-notes">
              {wrongs.map((record) => (
                <article className="report-note" key={record.id}>
                  <p className="report-note-prompt">{record.prompt}</p>
                  <p className="report-note-answers">
                    <span className="picked">내가 고른 답 {record.chosen}</span>
                    <span className="right">바른 답 {record.answer}</span>
                  </p>
                  {record.chosenMeaning && (
                    <p className="report-note-why">{record.chosenMeaning}</p>
                  )}
                  <p className="report-note-help">{record.support.studentHint}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="report-actions">
          <button className="secondary-button" type="button" onClick={onHome}>
            <Home size={18} />
            처음으로
          </button>
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            <Printer size={18} />
            {player.name} 결과 인쇄
          </button>
          <button className="primary-button" type="button" onClick={onPlayAgain}>
            <RefreshCcw size={18} />
            다시 풀기
          </button>
        </footer>
      </section>
    </div>
  );
};
