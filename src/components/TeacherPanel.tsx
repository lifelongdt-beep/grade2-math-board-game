import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileDown,
  ListChecks,
  TimerReset,
  X,
  XCircle,
} from 'lucide-react';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import type { AnswerRecord, Lesson, Player, Question } from '../types';

interface TeacherPanelProps {
  isOpen: boolean;
  onClose: () => void;
  records: AnswerRecord[];
  players: Player[];
  lesson: Lesson;
  currentQuestion: Question;
}

const formatMs = (ms: number) => `${(ms / 1000).toFixed(1)}초`;

const chunkRecords = (items: AnswerRecord[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const xmlEscape = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const safeSheetName = (name: string) => name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31);

const safeFileName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-');

const lessonDisplayName = (lesson: Lesson) =>
  lesson.lessonNo > 0 ? `${lesson.lessonNo}차시 · ${lesson.title}` : lesson.title;

const lessonFileLabel = (lesson: Lesson) =>
  lesson.lessonNo > 0 ? `${lesson.lessonNo}차시` : lesson.title;

const excelCell = (value: unknown) => {
  const type = typeof value === 'number' ? 'Number' : 'String';
  return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
};

const excelWorksheet = (name: string, rows: unknown[][]) => `
  <Worksheet ss:Name="${xmlEscape(safeSheetName(name))}">
    <Table>
      ${rows.map((row) => `<Row>${row.map(excelCell).join('')}</Row>`).join('')}
    </Table>
  </Worksheet>`;

const useAnalytics = (records: AnswerRecord[], players: Player[]) =>
  players.map((player) => {
    const mine = records.filter((record) => record.playerId === player.id);
    const wrong = mine.filter((record) => !record.correct);
    const typeCounts = wrong.reduce<Record<string, number>>((acc, record) => {
      acc[record.misconception] = (acc[record.misconception] ?? 0) + 1;
      return acc;
    }, {});
    const strategyCounts = wrong.reduce<Record<string, number>>((acc, record) => {
      acc[record.strategy] = (acc[record.strategy] ?? 0) + 1;
      return acc;
    }, {});
    const weakest = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '아직 없음';
    const weakStrategy = Object.entries(strategyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '아직 없음';

    // 문장으로 쓰려면 '무엇을 잘하는지'도 있어야 합니다. 오답만 모으면
    // 부족한 점만 적히게 됩니다.
    const right = mine.filter((record) => record.correct);
    const strengthCounts = right.reduce<Record<string, number>>((acc, record) => {
      acc[record.misconception] = (acc[record.misconception] ?? 0) + 1;
      return acc;
    }, {});
    // 맞힌 수가 틀린 수보다 많은 유형만 강점으로 봅니다. 그러지 않으면
    // 한 유형을 두고 '잘한다'와 '어려워한다'를 같이 적게 됩니다.
    const strongest = Object.entries(strengthCounts)
      .filter(([type, count]) => count >= 2 && count > (typeCounts[type] ?? 0))
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    // 수준은 풀면서 오르내리므로, 어디까지 올라갔는지가 곧 도달 수준입니다.
    const order: Record<string, number> = { 하: 0, 중: 1, 상: 2 };
    const topLevel = mine.reduce(
      (top, record) => (order[record.difficulty] > order[top] ? record.difficulty : top),
      mine[0]?.difficulty ?? '하',
    );
    // 되돌아온 문제를 두 번째에 맞힌 횟수입니다. 설명을 듣고 해낸 것이므로
    // 그냥 맞힌 것과는 다른 이야기가 됩니다.
    const secondTryCorrect = mine.filter((record) => record.attempts > 1 && record.correct).length;

    // 되풀이되는 실수입니다. '자리값 유형에서 어려움'보다
    // '받아올림한 1을 빠뜨림'이 무엇을 가르쳐야 할지 알려 줍니다.
    const mistakeCounts = wrong.reduce<Record<string, number>>((acc, record) => {
      if (!record.chosenMeaning) return acc;
      acc[record.chosenMeaning] = (acc[record.chosenMeaning] ?? 0) + 1;
      return acc;
    }, {});
    const commonMistake = Object.entries(mistakeCounts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      player,
      total: mine.length,
      correct: right.length,
      wrong: wrong.length,
      averageMs: average(mine.map((record) => record.responseMs)),
      weakest,
      weakStrategy,
      strongest,
      topLevel,
      secondTryCorrect,
      commonMistake: commonMistake ? { what: commonMistake[0], times: commonMistake[1] } : null,
      typeCounts,
    };
  });

// 생활기록부 교과 평가처럼, 잘한 것을 먼저 적고 보완할 점을 뒤에 붙입니다.
// 등급이나 석차 같은 말은 쓰지 않고, 무엇을 할 수 있고 무엇을 더 하면
// 좋을지를 적습니다. 문장은 '-음', '-함'으로 끝맺습니다.
const narrativeFor = (item: ReturnType<typeof useAnalytics>[number], lesson: Lesson) => {
  if (item.total === 0) return '아직 푼 문항이 없어 이번 수업의 학습 상태를 적기 어려움.';

  const rate = Math.round((item.correct / item.total) * 100);
  const seconds = item.averageMs / 1000;
  const parts: string[] = [];

  parts.push(
    `‘${lesson.title}’ 학습에서 ${item.total}문항을 풀어 ${item.correct}문항을 바르게 해결함.`,
  );

  // 도달 수준: 하에서 시작해 어디까지 올라갔는지
  if (item.topLevel === '상') {
    parts.push('기초 문항에서 출발하여 심화 문항까지 스스로 해결하며 학습 범위를 넓혀 감.');
  } else if (item.topLevel === '중') {
    parts.push('기초 문항을 안정적으로 해결한 뒤 한 단계 높은 문항까지 도전함.');
  } else {
    parts.push('기초 문항을 중심으로 차근차근 익히는 단계에 있음.');
  }

  if (item.strongest) {
    parts.push(`특히 ${item.strongest} 유형의 문항을 여러 차례 정확하게 해결함.`);
  }

  if (item.commonMistake) {
    // 어느 유형이 약한지보다, 무엇을 어떻게 틀리는지가 지도에 쓰입니다.
    parts.push(
      `‘${item.commonMistake.what}’ 실수가 ${item.commonMistake.times}차례 되풀이되어, 그 부분을 짚어 주는 지도가 필요함.`,
    );
  } else if (rate >= 80) {
    parts.push('문제의 조건을 끝까지 확인하는 태도가 안정적으로 자리 잡았음.');
  } else if (item.wrong > 0) {
    parts.push(
      `${item.weakest} 유형에서 어려움을 보여, 같은 유형을 반복해 풀어 보며 익히도록 지도할 필요가 있음.`,
    );
  }

  if (item.secondTryCorrect > 0) {
    parts.push(
      `틀린 문항을 다시 만났을 때 ${item.secondTryCorrect}문항을 스스로 해결하여, 설명을 듣고 고쳐 나가는 힘이 있음.`,
    );
  }

  if (seconds > 0 && seconds < 8) {
    parts.push('문제를 빠르게 파악하나, 답을 고르기 전에 한 번 더 확인하는 습관을 기르면 좋겠음.');
  } else if (seconds >= 20) {
    parts.push('한 문항에 충분히 시간을 들여 생각하는 편으로, 자신감을 갖고 답을 정하도록 격려가 필요함.');
  }

  return parts.join(' ');
};

const buildAnalysisWorkbook = (
  lesson: Lesson,
  records: AnswerRecord[],
  wrongRecords: AnswerRecord[],
  analytics: ReturnType<typeof useAnalytics>,
  accuracy: number,
  averageTime: number,
) => {
  const summaryRows = [
    ['항목', '값'],
    ['학기', lesson.semester],
    ['단원', lesson.unitTitle],
    ['차시', lessonDisplayName(lesson)],
    ['학습 목표', lesson.objective],
    ['전체 풀이 수', records.length],
    ['전체 정답 수', records.filter((record) => record.correct).length],
    ['전체 오답 수', wrongRecords.length],
    ['전체 정답률(%)', accuracy],
    ['평균 풀이 시간(초)', Number((averageTime / 1000).toFixed(1))],
  ];

  const studentRows = [
    ['학생', '출석번호', '난이도', '푼 문제', '정답', '오답', '정답률(%)', '평균 시간(초)', '취약 유형', '취약 전략', '오답 유형별 개수', '되풀이되는 실수', '종합 평가'],
    ...analytics.map((item) => [
      item.player.name,
      item.player.attendanceNo,
      item.player.difficulty,
      item.total,
      item.correct,
      item.wrong,
      item.total === 0 ? 0 : Math.round((item.correct / item.total) * 100),
      Number((item.averageMs / 1000).toFixed(1)),
      item.weakest,
      item.weakStrategy,
      Object.entries(item.typeCounts)
        .map(([type, count]) => `${type} ${count}`)
        .join(', ') || '없음',
      item.commonMistake ? `${item.commonMistake.what} ${item.commonMistake.times}회` : '없음',
      narrativeFor(item, lesson),
    ]),
  ];

  const recordHeader = [
    '시간',
    '학생',
    '출석번호',
    '난이도',
    '정답 여부',
    '풀이 시간(초)',
    '문항',
    '정답',
    '선택지',
    '전략',
    '유형',
    '핵심 개념',
    '읽는 방법',
    '풀이 단계',
    '조심할 점',
    '확인 질문',
    '해설',
    '힌트 사용',
  ];
  const recordToRow = (record: AnswerRecord) => {
    const player = analytics.find((item) => item.player.id === record.playerId)?.player;
    return [
      new Date(record.answeredAt).toLocaleString('ko-KR'),
      record.playerName,
      player?.attendanceNo ?? '',
      record.difficulty,
      record.correct ? '정답' : '오답',
      Number((record.responseMs / 1000).toFixed(1)),
      record.prompt,
      record.answer,
      record.choices.join(' / '),
      record.strategy,
      record.misconception,
      record.support.coreConcept,
      record.support.readStrategy,
      record.support.steps.join(' / '),
      record.support.misconceptionTip,
      record.support.selfCheck,
      record.explanation,
      record.hintUsed ? '사용' : '',
    ];
  };

  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  ${excelWorksheet('전체 요약', summaryRows)}
  ${excelWorksheet('학생별 분석', studentRows)}
  ${excelWorksheet('전체 풀이 기록', [recordHeader, ...records.map(recordToRow)])}
  ${excelWorksheet('틀린 문제', [recordHeader, ...wrongRecords.map(recordToRow)])}
</Workbook>`;

  return workbook;
};

export function TeacherPanel({ isOpen, onClose, records, players, lesson, currentQuestion }: TeacherPanelProps) {
  const [wrongRecordFilter, setWrongRecordFilter] = useState<number | 'all'>('all');
  const [excelStatus, setExcelStatus] = useState('');
  const analytics = useAnalytics(records, players);
  const wrongRecords = records.filter((record) => !record.correct);
  const wrongRecordsByPlayer = Object.fromEntries(
    players.map((player) => [player.id, wrongRecords.filter((record) => record.playerId === player.id)]),
  );
  const filteredWrongRecords =
    wrongRecordFilter === 'all'
      ? wrongRecords
      : wrongRecords.filter((record) => record.playerId === wrongRecordFilter);
  const selectedWrongPlayer = players.find((player) => player.id === wrongRecordFilter);
  const totalAnswered = records.length;
  const totalCorrect = records.filter((record) => record.correct).length;
  const accuracy = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);
  const averageTime = average(records.map((record) => record.responseMs));

  const downloadAnalysisExcel = () => {
    const workbook = buildAnalysisWorkbook(lesson, records, wrongRecords, analytics, accuracy, averageTime);
    const blob = new Blob([workbook], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeFileName(`${lesson.semester}-${lesson.unitTitle}-${lessonFileLabel(lesson)}-교사용분석.xls`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExcelStatus('분석 엑셀 파일을 만들었습니다.');
  };

  const downloadWrongPdf = async (player: Player) => {
    const studentWrongRecords = wrongRecordsByPlayer[player.id] ?? [];
    const report = document.getElementById(`wrong-report-pages-${player.id}`);
    if (!report || studentWrongRecords.length === 0) return;

    const pages = Array.from(report.querySelectorAll<HTMLElement>('.pdf-page'));
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const image = canvas.toDataURL('image/png');
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(image, 'PNG', 0, 0, 210, 297);
    }

    pdf.save(`${lesson.semester}-${lesson.unitTitle}-${lessonFileLabel(lesson)}-${player.name}-틀린문제.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="teacher-overlay" role="dialog" aria-modal="true" aria-labelledby="teacher-panel-title">
      <section className="teacher-panel">
        <header className="teacher-head">
          <div>
            <p className="eyebrow">교사용 실시간 분석</p>
            <h2 id="teacher-panel-title">{lesson.unitTitle} · {lessonFileLabel(lesson)}</h2>
            <p>{lesson.objective}</p>
          </div>
          <div className="teacher-head-actions">
            <button className="secondary-button" type="button" onClick={downloadAnalysisExcel} disabled={records.length === 0}>
              <Download size={17} />
              분석 엑셀
            </button>
            {excelStatus && <span className="teacher-export-status">{excelStatus}</span>}
            <button className="icon-button" type="button" onClick={onClose} aria-label="교사용 분석 닫기">
              <X size={22} />
            </button>
          </div>
        </header>

        <div className="teacher-summary">
          <article>
            <BarChart3 size={22} />
            <span>전체 정답률</span>
            <strong>{accuracy}%</strong>
          </article>
          <article>
            <Clock3 size={22} />
            <span>평균 풀이 시간</span>
            <strong>{formatMs(averageTime)}</strong>
          </article>
          <article>
            <XCircle size={22} />
            <span>틀린 기록</span>
            <strong>{wrongRecords.length}개</strong>
          </article>
          <article>
            <ListChecks size={22} />
            <span>현재 문항 전략</span>
            <strong>{currentQuestion.strategy}</strong>
          </article>
        </div>

        <div className="teacher-grid">
          {analytics.map((item) => (
            <article className="student-analytics" key={item.player.id}>
              <div className="student-analytics-head">
                <span className="player-dot" style={{ background: item.player.color }} />
                <strong>{item.player.name}</strong>
              </div>
              <dl>
                <div>
                  <dt>푼 문제</dt>
                  <dd>{item.total}개</dd>
                </div>
                <div>
                  <dt>정답</dt>
                  <dd>{item.correct}개</dd>
                </div>
                <div>
                  <dt>오답</dt>
                  <dd>{item.wrong}개</dd>
                </div>
                <div>
                  <dt>평균 시간</dt>
                  <dd>{formatMs(item.averageMs)}</dd>
                </div>
                <div>
                  <dt>취약 유형</dt>
                  <dd>{item.weakest}</dd>
                </div>
                <div>
                  <dt>취약 전략</dt>
                  <dd>{item.weakStrategy}</dd>
                </div>
                <div>
                  <dt>되풀이되는 실수</dt>
                  <dd>{item.commonMistake ? `${item.commonMistake.what} ${item.commonMistake.times}회` : '아직 없음'}</dd>
                </div>
              </dl>
              <p className="student-narrative">{narrativeFor(item, lesson)}</p>
              <div className="type-chips">
                {Object.entries(item.typeCounts).length === 0 ? (
                  <span>아직 누적 오답 없음</span>
                ) : (
                  Object.entries(item.typeCounts).map(([type, count]) => (
                    <span key={type}>{type} {count}</span>
                  ))
                )}
              </div>
              <button
                className="student-pdf-button"
                type="button"
                onClick={() => downloadWrongPdf(item.player)}
                disabled={item.wrong === 0}
              >
                <Download size={16} />
                {item.player.name} PDF
              </button>
            </article>
          ))}
        </div>

        <section className="wrong-list">
          <div className="wrong-list-head">
            <div>
              <h3>틀린 문제 기록</h3>
              <p>
                {selectedWrongPlayer
                  ? `${selectedWrongPlayer.name}의 틀린 문제만 보고 있습니다.`
                  : '학생 번호를 선택하면 해당 학생의 틀린 문제만 볼 수 있습니다.'}
              </p>
            </div>
            <div className="wrong-filter-actions" aria-label="틀린 문제 학생 선택">
              <button
                className={wrongRecordFilter === 'all' ? 'active' : ''}
                type="button"
                onClick={() => setWrongRecordFilter('all')}
              >
                전체
              </button>
              {analytics.map((item) => (
                <button
                  className={wrongRecordFilter === item.player.id ? 'active' : ''}
                  type="button"
                  key={item.player.id}
                  onClick={() => setWrongRecordFilter(item.player.id)}
                >
                  {item.player.name}
                </button>
              ))}
            </div>
          </div>

          {wrongRecords.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={24} />
              아직 PDF로 내보낼 틀린 문제가 없습니다.
            </div>
          ) : filteredWrongRecords.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={24} />
              {selectedWrongPlayer ? `${selectedWrongPlayer.name}의 틀린 문제가 없습니다.` : '표시할 틀린 문제가 없습니다.'}
            </div>
          ) : (
            <div className="records-table" role="table" aria-label="틀린 문제 상세 기록">
              <div className="records-row records-head" role="row">
                <span>학생</span>
                <span>문항</span>
                <span>전략</span>
                <span>유형</span>
                <span>시간</span>
              </div>
              {filteredWrongRecords.slice().reverse().map((record) => (
                <div className="records-row" role="row" key={record.id}>
                  <span>{record.playerName}</span>
                  <span>{record.prompt}</span>
                  <span>{record.strategy}</span>
                  <span>{record.misconception}</span>
                  <span>{formatMs(record.responseMs)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="teacher-actions">
          <span><TimerReset size={17} /> 팝업을 닫아도 기록은 현재 수업 세션에 유지됩니다.</span>
          <span><Download size={17} /> 분석 엑셀은 전체 요약, 학생별 분석, 전체 풀이 기록, 틀린 문제 시트를 포함합니다.</span>
          <span><FileDown size={17} /> 학생별 PDF는 각 학생 카드에서 내려받을 수 있습니다.</span>
        </div>
      </section>

      <div className="pdf-pages" aria-hidden="true">
        {players.map((player) => {
          const studentWrongRecords = wrongRecordsByPlayer[player.id] ?? [];
          const wrongRecordPages = chunkRecords(studentWrongRecords, 6);

          return (
            <div id={`wrong-report-pages-${player.id}`} key={player.id}>
              {wrongRecordPages.map((pageRecords, pageIndex) => (
                <section className="pdf-page pdf-problem-page" key={`${player.id}-problem-page-${pageIndex + 1}`}>
                  <p className="pdf-kicker">2학년 수학 오답 복습 · 문제</p>
                  <h1>{player.name} · {lesson.unitTitle} · {lessonFileLabel(lesson)}</h1>
                  <p className="pdf-meta">
                    문제 {pageIndex * 6 + 1}-{pageIndex * 6 + pageRecords.length} / 총 {studentWrongRecords.length}문항
                  </p>
                  <div className="pdf-card-grid">
                    {pageRecords.map((record, recordIndex) => (
                      <article className="pdf-mini-card" key={`${record.id}-problem`}>
                        <header>
                          <strong>문제 {pageIndex * 6 + recordIndex + 1}</strong>
                          <span>{record.difficulty}</span>
                        </header>
                        <p className="pdf-mini-meta">{record.strategy}</p>
                        <QuestionVisualGraphic visual={record.visual} className="pdf-question-visual" />
                        <p className="pdf-mini-question">{record.prompt}</p>
                        {/* 화면에서는 보기마다 1·2·3·4 번호가 붙어 있습니다.
                            인쇄물에서도 같은 번호가 보여야 아이가 "3번을
                            골랐구나" 하고 짚어 볼 수 있습니다. 목록 기본
                            번호는 인쇄에서 빠지는 일이 있어 직접 씁니다. */}
                        <ol className="pdf-mini-choices">
                          {record.choices.map((choice, choiceIndex) => (
                            <li key={`${record.id}-choice-${choiceIndex}`}>
                              <span className="pdf-choice-no">{choiceIndex + 1}</span>
                              {choice}
                            </li>
                          ))}
                        </ol>
                      </article>
                    ))}
                  </div>
                  <p className="pdf-foot">정답과 풀이는 모든 문제 페이지가 끝난 다음 쪽부터 있습니다.</p>
                </section>
              ))}

              {wrongRecordPages.map((pageRecords, pageIndex) => (
                <section className="pdf-page pdf-answer-page" key={`${player.id}-answer-page-${pageIndex + 1}`}>
                  <p className="pdf-kicker">2학년 수학 오답 복습 · 정답과 풀이</p>
                  <h1>{player.name} · {lesson.unitTitle} · {lessonFileLabel(lesson)}</h1>
                  <p className="pdf-meta">
                    정답과 풀이 {pageIndex * 6 + 1}-{pageIndex * 6 + pageRecords.length} / 총 {studentWrongRecords.length}문항
                  </p>
                  <div className="pdf-card-grid">
                    {pageRecords.map((record, recordIndex) => (
                      <article className="pdf-mini-card pdf-solution-card" key={`${record.id}-answer`}>
                        <header>
                          <strong>문제 {pageIndex * 6 + recordIndex + 1}</strong>
                          <span>{record.difficulty}</span>
                        </header>
                        <p className="pdf-mini-answer">정답: {record.answer}</p>
                        <p className="pdf-mini-concept">핵심: {record.support.coreConcept}</p>
                        <p className="pdf-mini-explanation">풀이: {record.support.steps.join(' → ')}</p>
                        <p className="pdf-mini-explanation">조심: {record.support.misconceptionTip}</p>
                        <p className="pdf-mini-memo">
                          오개념: {record.misconception} / 전략: {record.strategy} / 풀이 시간: {formatMs(record.responseMs)}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
