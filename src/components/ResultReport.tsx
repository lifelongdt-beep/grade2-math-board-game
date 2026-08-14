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
// ════════════════════════════════════════════════════════════════════

type Props = {
  players: Player[];
  records: AnswerRecord[];
  lesson: Lesson;
  onClose: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
};

type Standing = {
  player: Player;
  total: number;
  correct: number;
  wrong: number;
  averageMs: number;
};

// 칭찬은 잘한 아이에게만 하는 것이 아닙니다. 한 문제를 맞혔든 열 문제를
// 맞혔든, 그 아이가 오늘 한 일을 그대로 말해 줍니다.
const praiseFor = (standing: Standing) => {
  if (standing.total === 0) return '다음에는 함께 풀어 봐요.';
  if (standing.wrong === 0) return '푼 문제를 하나도 빠짐없이 맞혔어요. 대단해요!';
  if (standing.correct === 0) return '끝까지 앉아서 다 풀었어요. 그게 가장 어려운 일이에요.';
  if (standing.correct >= standing.wrong * 3) return '어려운 문제도 척척 풀어냈어요.';
  if (standing.correct >= standing.wrong) return '맞힌 문제가 더 많아요. 잘하고 있어요.';
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
  const standings: Standing[] = players
    .map((player) => {
      const mine = records.filter((record) => record.playerId === player.id);
      const correct = mine.filter((record) => record.correct).length;
      const spent = mine.reduce((total, record) => total + record.responseMs, 0);
      return {
        player,
        total: mine.length,
        correct,
        wrong: mine.length - correct,
        averageMs: mine.length === 0 ? 0 : Math.round(spent / mine.length),
      };
    })
    // 맞힌 개수가 먼저, 같으면 빨리 푼 쪽이 앞입니다.
    .sort((a, b) => b.correct - a.correct || a.averageMs - b.averageMs);

  const best = standings[0];
  // 맞힌 개수가 가장 많은 아이가 여럿이면 모두 이름을 부릅니다.
  const winners = best && best.correct > 0
    ? standings.filter((one) => one.correct === best.correct)
    : [];

  const totalSolved = records.length;
  const totalCorrect = records.filter((record) => record.correct).length;
  const totalWrong = totalSolved - totalCorrect;
  // 막대 길이를 잴 기준입니다. 0으로 나누지 않도록 최소 1로 둡니다.
  const widest = Math.max(1, ...standings.map((one) => one.total));

  // 오답 노트는 아이별로 묶어 보여 줍니다. 같은 문제를 두 번 틀렸으면
  // 한 번만 적습니다 — 같은 것이 두 번 적혀 있으면 더 많이 틀린 것처럼
  // 보이고, 읽을 것만 늘어납니다.
  const wrongByPlayer = players.map((player) => {
    const seen = new Set<string>();
    const mine = records
      .filter((record) => record.playerId === player.id && !record.correct)
      .filter((record) => {
        if (seen.has(record.questionId)) return false;
        seen.add(record.questionId);
        return true;
      });
    return { player, wrongs: mine };
  }).filter((one) => one.wrongs.length > 0);

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

        {winners.length > 0 && (
          <p className="report-winner">
            <span className="report-winner-avatars" aria-hidden="true">
              {winners.map((one) => one.player.avatar).join(' ')}
            </span>
            <strong>
              {winners.map((one) => one.player.name).join(', ')}
            </strong>
            {winners.length > 1 ? '이(가) 나란히 ' : '이(가) '}
            {best.correct}문제를 맞혔어요!
          </p>
        )}

        {/* ── 오늘 우리 반이 푼 것 ─────────────────────────────── */}
        <section className="report-block">
          <h3>오늘 푼 문제</h3>
          <div className="report-totals">
            <div>
              <strong>{totalSolved}</strong>
              <span>푼 문제</span>
            </div>
            <div className="good">
              <strong>{totalCorrect}</strong>
              <span>맞힌 문제</span>
            </div>
            <div className="miss">
              <strong>{totalWrong}</strong>
              <span>틀린 문제</span>
            </div>
          </div>
        </section>

        {/* ── 아이별 막대 ──────────────────────────────────────── */}
        <section className="report-block">
          <h3>친구들이 푼 만큼</h3>
          <ul className="report-bars">
            {standings.map((standing) => (
              <li key={standing.player.id}>
                <span className="report-bar-name">
                  <span aria-hidden="true">{standing.player.avatar}</span>
                  {standing.player.name}
                </span>
                <span className="report-bar-track">
                  {/* 맞힌 만큼 초록, 틀린 만큼 빨강입니다. 한 줄의 길이가
                      그 아이가 푼 문제 수입니다. */}
                  <span
                    className="report-bar-good"
                    style={{ width: `${(standing.correct / widest) * 100}%` }}
                  />
                  <span
                    className="report-bar-miss"
                    style={{ width: `${(standing.wrong / widest) * 100}%` }}
                  />
                </span>
                <span className="report-bar-count">
                  {standing.correct} / {standing.total}
                </span>
                <span className="report-bar-time">{seconds(standing.averageMs)}</span>
              </li>
            ))}
          </ul>
          <ul className="report-praise">
            {standings.map((standing) => (
              <li key={standing.player.id}>
                <span aria-hidden="true">{standing.player.avatar}</span>
                <strong>{standing.player.name}</strong>
                {praiseFor(standing)}
              </li>
            ))}
          </ul>
        </section>

        {/* ── 오답 노트 ────────────────────────────────────────── */}
        <section className="report-block">
          <h3>다시 볼 문제</h3>
          {wrongByPlayer.length === 0 ? (
            <p className="report-empty">틀린 문제가 하나도 없어요. 정말 잘했어요!</p>
          ) : (
            wrongByPlayer.map(({ player, wrongs }) => (
              <div className="report-notes" key={player.id}>
                <h4>
                  <span aria-hidden="true">{player.avatar}</span>
                  {player.name}
                </h4>
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
            ))
          )}
        </section>

        <footer className="report-actions">
          <button className="secondary-button" type="button" onClick={onHome}>
            <Home size={18} />
            처음으로
          </button>
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            <Printer size={18} />
            결과 인쇄
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
