import { useEffect, useMemo, useRef, useState } from 'react';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import { MathText } from './MathText';
import { DayColumns, DayLine, HBarChart, 단계이름, 정답률단계 } from './BookCharts';
import {
  기록더하기,
  기록모두읽기,
  기록지우기,
  날짜글,
  되돌리기,
  바뀜듣기,
  백업만들기,
  백업파일고르기,
  백업파일끊기,
  백업파일다시허락,
  백업파일상태읽기,
  백업파일지원,
  백업파일에쓰기,
  백업풀기,
  오래남기기,
  휴지통읽기,
  type 백업파일상태,
  type 학습기록,
} from '../data/learningLog';
import {
  csv만들기,
  갈래별,
  거르기,
  거름글,
  날짜별,
  단원별,
  단원열쇠,
  단원이름,
  모둠나누기,
  반지도,
  수준별,
  오개념순위,
  오답모음,
  요약,
  조건없음,
  차시별,
  차시이름,
  학생단원표,
  학생별,
  학생지도,
  type 거름,
  type 오답고르기,
  type 지도항목,
} from '../data/teacherInsights';
import { 명단읽기, 명단풀기 } from '../data/nameSwap';
import type { Semester } from '../types';

// ════════════════════════════════════════════════════════════════════
// 교사용 학습 기록장 페이지
// ────────────────────────────────────────────────────────────────────
// 놀이 화면의 '학습 기록장' 단추나 ?page=records 주소로 엽니다. 이 컴퓨터에 쌓인 기록
// (learningLog.ts)을 읽어
//   한눈에 · 학생별 · 단원·차시 · 지도 도움 · 오답 PDF · 기록 관리
// 여섯 쪽으로 보여 줍니다. 위쪽 거름(학생·학년·학기·단원·차시·기간)은 모든 쪽에 함께 걸리고,
// 기록 관리에서 지울 때도, 오답 PDF를 만들 때도 이 범위를 씁니다.
// 놀이 화면에서 문제를 풀면 열어 둔 이 페이지도 저절로 새로 고쳐집니다.
// ════════════════════════════════════════════════════════════════════

type 쪽 = 'overview' | 'students' | 'lessons' | 'guide' | 'pdf' | 'manage';
const 쪽들: Array<{ id: 쪽; 이름: string }> = [
  { id: 'overview', 이름: '한눈에 보기' },
  { id: 'students', 이름: '학생별' },
  { id: 'lessons', 이름: '단원·차시별' },
  { id: 'guide', 이름: '지도 도움' },
  { id: 'pdf', 이름: '오답 PDF' },
  { id: 'manage', 이름: '기록 관리' },
];

type 기간 = 'all' | 'today' | '7' | '30' | 'custom';

const 며칠전 = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return 날짜글(d);
};

const 파일받기 = (text: string, name: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const 초글 = (ms: number) => `${(ms / 1000).toFixed(1)}초`;

export function TeacherBook() {
  const [모두, set모두] = useState<학습기록[]>([]);
  const [읽는중, set읽는중] = useState(true);
  const [쪽, set쪽] = useState<쪽>('overview');
  const [학생, set학생] = useState<number | ''>('');
  const [학년, set학년] = useState<number | ''>('');
  const [학기, set학기] = useState<Semester | ''>('');
  const [단원, set단원] = useState('');
  const [차시, set차시] = useState('');
  const [기간, set기간] = useState<기간>('all');
  const [시작, set시작] = useState('');
  const [끝, set끝] = useState('');
  const [고른학생, set고른학생] = useState<number | null>(null);
  const [알림, set알림] = useState('');
  const [휴지통수, set휴지통수] = useState(0);
  const [오래, set오래] = useState<boolean | null>(null);
  const [백업, set백업] = useState<백업파일상태>(null);
  const 이름표 = useMemo(() => 명단풀기(명단읽기()), []);
  const 이름 = (no: number) => (이름표[no] ? `${no}번 ${이름표[no]}` : `${no}번`);

  const 새로읽기 = async () => {
    const [기록, 휴지통, 파일] = await Promise.all([기록모두읽기(), 휴지통읽기(), 백업파일상태읽기()]);
    set모두(기록);
    set휴지통수(휴지통.length);
    set백업(파일);
    set읽는중(false);
  };

  useEffect(() => {
    document.title = '학습 기록장 · 교사용';
    document.body.classList.add('teacher-book-page');
    void 새로읽기();
    void 오래남기기().then(set오래);
    const 그만 = 바뀜듣기(() => void 새로읽기());
    return () => {
      그만();
      document.body.classList.remove('teacher-book-page');
    };
  }, []);

  const 알리기 = (text: string) => {
    set알림(text);
    window.setTimeout(() => set알림((now) => (now === text ? '' : now)), 5000);
  };

  // ── 거름 ──
  const 거름값: 거름 = useMemo(() => {
    const 기간값 = 기간 === 'today' ? { from: 날짜글(new Date()), to: 날짜글(new Date()) }
      : 기간 === '7' ? { from: 며칠전(6) }
        : 기간 === '30' ? { from: 며칠전(29) }
          : 기간 === 'custom' ? { from: 시작 || undefined, to: 끝 || undefined }
            : {};
    return {
      ...(학생 !== '' ? { nos: [학생] } : {}),
      ...(학년 !== '' ? { grades: [학년] } : {}),
      ...(학기 ? { semesters: [학기] } : {}),
      ...(단원 ? { units: [단원] } : {}),
      ...(차시 ? { lessonIds: [차시] } : {}),
      ...기간값,
    };
  }, [학생, 학년, 학기, 단원, 차시, 기간, 시작, 끝]);
  const 걸린 = useMemo(() => 거르기(모두, 거름값), [모두, 거름값]);
  // 학생을 빼고 거른 기록입니다. 학생 한 명을 볼 때도 반 평균과 견주려고 씁니다.
  const 반범위 = useMemo(() => 거르기(모두, { ...거름값, nos: undefined }), [모두, 거름값]);

  const 고를학생 = useMemo(() => [...new Set(모두.map((one) => one.no))].sort((a, b) => a - b), [모두]);
  const 고를학년 = useMemo(() => [...new Set(모두.map((one) => one.grade))].sort(), [모두]);
  const 고를학기 = useMemo(() => [...new Set(모두.filter((one) => 학년 === '' || one.grade === 학년).map((one) => one.semester))].sort(), [모두, 학년]);
  const 고를단원 = useMemo(() => 단원별(모두.filter((one) => (학년 === '' || one.grade === 학년) && (!학기 || one.semester === 학기))), [모두, 학년, 학기]);
  const 고를차시 = useMemo(() => (단원 ? 차시별(모두.filter((one) => 단원열쇠(one) === 단원)) : []), [모두, 단원]);
  const 단원표 = useMemo(() => new Map(단원별(모두).map((u) => [u.key, u.label])), [모두]);
  const 차시표 = useMemo(() => new Map(모두.map((one) => [one.lessonId, 차시이름(one)])), [모두]);
  const 거름글값 = 거름글(거름값, 이름, { 단원: (key) => 단원표.get(key), 차시: (id) => 차시표.get(id) });
  const 거름비우기 = () => {
    set학생(''); set학년(''); set학기(''); set단원(''); set차시(''); set기간('all'); set시작(''); set끝('');
  };

  const 합 = useMemo(() => 요약(걸린), [걸린]);

  return (
    <div className="tb-root">
      <header className="tb-head">
        <div>
          <p className="tb-kicker">교사용</p>
          <h1>📒 학습 기록장</h1>
          <p className="tb-sub">
            학생들이 푼 문제가 이 컴퓨터에 자동으로 쌓입니다 · 모두 {모두.length.toLocaleString()}문제
            {오래 === true && ' · 오래 보관 허락됨'}
            {백업?.쓸수있음 && ` · 백업 파일(${백업.이름})에도 자동 저장 중`}
          </p>
        </div>
        <a className="tb-button ghost" href={`${window.location.pathname}`}>← 놀이 화면으로</a>
      </header>

      <section className="tb-filters" aria-label="보고 싶은 범위">
        <label>학생
          <select value={학생} onChange={(e) => set학생(e.target.value ? Number(e.target.value) : '')}>
            <option value="">모든 학생</option>
            {고를학생.map((no) => <option key={no} value={no}>{이름(no)}</option>)}
          </select>
        </label>
        <label>학년
          <select value={학년} onChange={(e) => { set학년(e.target.value ? Number(e.target.value) : ''); set학기(''); set단원(''); set차시(''); }}>
            <option value="">모든 학년</option>
            {고를학년.map((g) => <option key={g} value={g}>{g}학년</option>)}
          </select>
        </label>
        <label>학기
          <select value={학기} onChange={(e) => { set학기(e.target.value as Semester | ''); set단원(''); set차시(''); }}>
            <option value="">모든 학기</option>
            {고를학기.map((s) => <option key={s} value={s}>{s.replace('-', '학년 ')}학기</option>)}
          </select>
        </label>
        <label>단원
          <select value={단원} onChange={(e) => { set단원(e.target.value); set차시(''); }}>
            <option value="">모든 단원</option>
            {고를단원.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </label>
        <label>차시
          <select value={차시} onChange={(e) => set차시(e.target.value)} disabled={!단원}>
            <option value="">{단원 ? '모든 차시' : '단원을 먼저 고르세요'}</option>
            {고를차시.map((l) => <option key={l.key} value={l.key}>{l.label.split(' · ').at(-1)}</option>)}
          </select>
        </label>
        <label>기간
          <select value={기간} onChange={(e) => set기간(e.target.value as 기간)}>
            <option value="all">전체 기간</option>
            <option value="today">오늘</option>
            <option value="7">최근 7일</option>
            <option value="30">최근 30일</option>
            <option value="custom">날짜 직접 고르기</option>
          </select>
        </label>
        {기간 === 'custom' && (
          <span className="tb-dates">
            <input type="date" value={시작} onChange={(e) => set시작(e.target.value)} aria-label="시작 날짜" />
            ~
            <input type="date" value={끝} onChange={(e) => set끝(e.target.value)} aria-label="끝 날짜" />
          </span>
        )}
        {!조건없음(거름값) && <button type="button" className="tb-button ghost small" onClick={거름비우기}>범위 지우기</button>}
        <p className="tb-scope">지금 보는 범위: <b>{거름글값}</b> · {걸린.length.toLocaleString()}문제</p>
      </section>

      <nav className="tb-tabs" role="tablist">
        {쪽들.map((one) => (
          <button key={one.id} type="button" role="tab" aria-selected={쪽 === one.id} className={쪽 === one.id ? 'on' : ''} onClick={() => set쪽(one.id)}>
            {one.이름}
          </button>
        ))}
      </nav>

      {알림 && <p className="tb-toast" role="status">{알림}</p>}

      <main className="tb-main">
        {읽는중 ? <p className="tb-empty">기록을 읽는 중입니다…</p>
          : 모두.length === 0 ? (
            <section className="tb-card tb-welcome">
              <h2>아직 쌓인 기록이 없습니다</h2>
              <p>놀이 화면에서 학생들이 문제를 풀면 이곳에 자동으로 쌓입니다. QR로 들어온 학생 휴대폰의 기록도 이 컴퓨터의 놀이 화면이 받아 오는 대로 쌓입니다.</p>
              <p>다른 컴퓨터에서 쓰던 기록이 있다면 <b>기록 관리 → 백업 불러오기</b>로 옮겨 올 수 있습니다.</p>
            </section>
          ) : (
            <>
              {쪽 === 'overview' && <Overview 걸린={걸린} 합={합} 이름={이름} />}
              {쪽 === 'students' && <Students 걸린={걸린} 반범위={반범위} 이름={이름} 고른={고른학생} 고르기={set고른학생} />}
              {쪽 === 'lessons' && <Lessons 걸린={걸린} 이름={이름} />}
              {쪽 === 'guide' && <Guide 걸린={걸린} 반범위={반범위} 이름={이름} 학생={학생} />}
              {쪽 === 'pdf' && <WrongPdf 걸린={걸린} 이름={이름} 범위글={거름글값} 알리기={알리기} />}
            </>
          )}
        {쪽 === 'manage' && !읽는중 && (
          <Manage
            모두={모두}
            걸린={걸린}
            거름값={거름값}
            범위글={거름글값}
            이름={이름}
            휴지통수={휴지통수}
            백업={백업}
            오래={오래}
            알리기={알리기}
            새로읽기={새로읽기}
          />
        )}
      </main>
    </div>
  );
}

// ── 한눈에 보기 ────────────────────────────────────────────────────────

function Tiles({ 합 }: { 합: ReturnType<typeof 요약> }) {
  const 칸 = [
    { 이름: '푼 문제', 값: `${합.문제.toLocaleString()}`, 단위: '문제' },
    { 이름: '정답률', 값: `${합.정답률}`, 단위: '%' },
    { 이름: '학생', 값: `${합.학생수}`, 단위: '명' },
    { 이름: '학습한 날', 값: `${합.날수}`, 단위: '일' },
    { 이름: '학습한 차시', 값: `${합.차시수}`, 단위: '차시' },
    { 이름: '힌트 사용', 값: `${합.힌트율}`, 단위: '%' },
    { 이름: '다시 나온 문제 정답률', 값: 합.다시맞힘률 === null ? '–' : `${합.다시맞힘률}`, 단위: 합.다시맞힘률 === null ? '' : '%' },
    { 이름: '한 문제 평균', 값: `${합.평균초}`, 단위: '초' },
  ];
  return (
    <div className="tb-tiles">
      {칸.map((one) => (
        <div className="tb-tile" key={one.이름}>
          <span>{one.이름}</span>
          <strong>{one.값}<small>{one.단위}</small></strong>
        </div>
      ))}
    </div>
  );
}

function Overview({ 걸린, 합, 이름 }: { 걸린: 학습기록[]; 합: ReturnType<typeof 요약>; 이름: (no: number) => string }) {
  const 날 = 날짜별(걸린);
  const 수준 = 수준별(걸린);
  const 오개념 = 오개념순위(걸린).slice(0, 6);
  return (
    <>
      <Tiles 합={합} />
      {합.첫날 && <p className="tb-note">기록 기간: {합.첫날} ~ {합.끝날}</p>}
      <div className="tb-grid2">
        <section className="tb-card">
          <h2>날짜별 푼 문제 수</h2>
          <DayColumns rows={날} />
        </section>
        <section className="tb-card">
          <h2>날짜별 정답률</h2>
          <DayLine rows={날} />
        </section>
        <section className="tb-card">
          <h2>단원별 정답률</h2>
          <HBarChart rows={단원별(걸린)} 값={(r) => r.정답률} 기준={60} 부가={(r) => `${r.문제}문제`} />
        </section>
        <section className="tb-card">
          <h2>개념 갈래별 정답률 <small>낮은 순</small></h2>
          <HBarChart rows={갈래별(걸린)} 값={(r) => r.정답률} 기준={60} 부가={(r) => `${r.문제}문제`} />
        </section>
        <section className="tb-card">
          <h2>수준(하·중·상)별 풀이</h2>
          <HBarChart rows={수준} 값={(r) => r.문제} 끝={Math.max(1, ...수준.map((r) => r.문제))} 단위="문제" 부가={(r) => `정답률 ${r.정답률}%`} />
          <p className="tb-note">하에서 시작해 3문제 연속 맞히면 한 단계 오릅니다. 상 수준 풀이가 많을수록 깊이 이해한 학생이 많습니다.</p>
        </section>
        <section className="tb-card">
          <h2>자주 보이는 오개념</h2>
          {오개념.length === 0 ? <p className="tb-empty">틀린 문제가 없습니다.</p> : (
            <ol className="tb-mis">
              {오개념.map((one) => (
                <li key={one.내용}>
                  <b>{one.내용}</b>
                  <span>{one.횟수}번 · {one.학생들.length}명 ({one.학생들.slice(0, 6).map(이름).join(', ')}{one.학생들.length > 6 ? ' …' : ''})</span>
                  {one.도움말 && <small>바로잡기: {one.도움말}</small>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

// ── 학생별 ────────────────────────────────────────────────────────────

function Students({ 걸린, 반범위, 이름, 고른, 고르기 }: {
  걸린: 학습기록[];
  반범위: 학습기록[];
  이름: (no: number) => string;
  고른: number | null;
  고르기: (no: number | null) => void;
}) {
  const 줄들 = 학생별(걸린, 이름);
  const 모둠 = 모둠나누기(걸린);
  const 모둠이름 = (no: number) => (모둠.보충.includes(no) ? '보충' : 모둠.연습.includes(no) ? '연습' : 모둠.심화.includes(no) ? '심화' : '자료 부족');
  const 마지막날 = (no: number) => 걸린.filter((one) => one.no === no).map((one) => one.date).sort().at(-1) ?? '';
  const 보는 = 고른 !== null && 줄들.some((r) => Number(r.key) === 고른) ? 고른 : null;
  return (
    <>
      <section className="tb-card">
        <h2>학생별 요약 <small>줄을 누르면 그 학생을 자세히 봅니다</small></h2>
        <div className="tb-table-wrap">
          <table className="tb-table">
            <thead>
              <tr><th>학생</th><th>푼 문제</th><th>정답률</th><th>힌트</th><th>평균 시간</th><th>푼 차시</th><th>마지막 학습</th><th>모둠 제안</th></tr>
            </thead>
            <tbody>
              {줄들.map((r) => {
                const no = Number(r.key);
                return (
                  <tr key={r.key} className={보는 === no ? 'on' : ''} onClick={() => 고르기(보는 === no ? null : no)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') 고르기(no); }}>
                    <th scope="row">{r.label}</th>
                    <td>{r.문제}</td>
                    <td><span className="tb-rate"><span className={`tb-rate-bar step-${정답률단계(r.정답률)}`} style={{ width: `${r.정답률}%` }} /></span>{r.정답률}%</td>
                    <td>{r.힌트율}%</td>
                    <td>{r.평균초}초</td>
                    <td>{new Set(걸린.filter((one) => one.no === no).map((one) => one.lessonId)).size}</td>
                    <td>{마지막날(no)}</td>
                    <td><span className={`tb-group g-${모둠이름(no)}`}>{모둠이름(no)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {보는 !== null && <StudentDetail no={보는} 걸린={걸린} 반범위={반범위} 이름={이름} />}
    </>
  );
}

function StudentDetail({ no, 걸린, 반범위, 이름 }: { no: number; 걸린: 학습기록[]; 반범위: 학습기록[]; 이름: (no: number) => string }) {
  const 내것 = 걸린.filter((one) => one.no === no);
  const 오답 = 내것.filter((one) => !one.correct).slice(-8).reverse();
  return (
    <section className="tb-card tb-student">
      <h2>{이름(no)} 자세히 보기</h2>
      <Tiles 합={요약(내것)} />
      <div className="tb-grid2">
        <div>
          <h3>차시별 정답률</h3>
          <HBarChart rows={차시별(내것)} 값={(r) => r.정답률} 기준={60} 부가={(r) => `${r.문제}문제`} />
        </div>
        <div>
          <h3>날짜별 정답률</h3>
          <DayLine rows={날짜별(내것)} />
        </div>
      </div>
      <h3>이 학생 지도 도움</h3>
      <GuideList 항목={학생지도(반범위, no)} 이름={이름} />
      <h3>최근 틀린 문제</h3>
      {오답.length === 0 ? <p className="tb-empty">틀린 문제가 없습니다.</p> : (
        <ul className="tb-wrongs">
          {오답.map((one) => (
            <li key={one.id}>
              <small>{one.date} · {차시이름(one)} · {one.difficulty}</small>
              <p><MathText text={one.prompt} /></p>
              <p className="tb-wrong-line">고른 답 <b className="bad"><MathText text={one.chosen || '-'} /></b> · 정답 <b><MathText text={one.answer} /></b>{one.hintUsed ? ' · 힌트 봄' : ''}</p>
              {one.misconception && <p className="tb-wrong-why">오개념: {one.misconception}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── 단원·차시별 ───────────────────────────────────────────────────────

function Lessons({ 걸린, 이름 }: { 걸린: 학습기록[]; 이름: (no: number) => string }) {
  const 표 = 학생단원표(걸린);
  const 차시들 = 차시별(걸린);
  return (
    <>
      <section className="tb-card">
        <h2>학생 × 단원 정답률 <small>칸의 수는 정답률(푼 문제 수), 빈칸은 아직 풀지 않은 단원</small></h2>
        <div className="tb-legend" aria-label="색 단계">
          {단계이름.map((t, i) => <span key={t}><i className={`step-${i}`} />{t}</span>)}
        </div>
        <div className="tb-table-wrap">
          <table className="tb-table tb-heat">
            <thead>
              <tr><th>학생</th>{표.단원들.map((u) => <th key={u.key} title={u.label}>{u.label.replace(/^\d-\d\s*/, '')}</th>)}</tr>
            </thead>
            <tbody>
              {표.학생들.map((no) => (
                <tr key={no}>
                  <th scope="row">{이름(no)}</th>
                  {표.단원들.map((u) => {
                    const 칸 = 표.칸(no, u.key);
                    return (
                      <td key={u.key} className={칸 ? `step-${정답률단계(칸.정답률)}` : 'none'} title={칸 ? `${이름(no)} · ${u.label}\n정답률 ${칸.정답률}% (${칸.문제}문제)` : '아직 풀지 않음'}>
                        {칸 ? <>{칸.정답률}<small>({칸.문제})</small></> : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="tb-card">
        <h2>차시별 결과</h2>
        <div className="tb-table-wrap">
          <table className="tb-table">
            <thead><tr><th>단원 · 차시</th><th>푼 문제</th><th>학생</th><th>정답률</th><th>힌트</th><th>평균 시간</th></tr></thead>
            <tbody>
              {차시들.map((r) => (
                <tr key={r.key}>
                  <th scope="row">{r.label}</th>
                  <td>{r.문제}</td>
                  <td>{r.학생수}명</td>
                  <td><span className="tb-rate"><span className={`tb-rate-bar step-${정답률단계(r.정답률)}`} style={{ width: `${r.정답률}%` }} /></span>{r.정답률}%{r.정답률 < 60 && r.문제 >= 8 ? ' ▼ 다시 가르치기' : ''}</td>
                  <td>{r.힌트율}%</td>
                  <td>{r.평균초}초</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ── 지도 도움 ──────────────────────────────────────────────────────────

// 한꺼번에 너무 많으면 무엇부터 할지 흐려집니다. 급한 것부터 넷만 펼치고 나머지는 접어 둡니다.
const 처음보일수 = 4;

function GuideList({ 항목, 이름 }: { 항목: 지도항목[]; 이름: (no: number) => string }) {
  const [다보기, set다보기] = useState(false);
  if (항목.length === 0) return <p className="tb-empty">이 범위에서는 따로 지도할 점을 찾지 못했습니다. 기록이 더 쌓이면 다시 살펴보세요.</p>;
  const 보일 = 다보기 ? 항목 : 항목.slice(0, 처음보일수);
  return (
    <>
    <div className="tb-guides">
      {보일.map((one, i) => (
        <article className={`tb-guide u-${one.급함 === '먼저' ? 'now' : one.급함 === '이번 주' ? 'week' : 'info'}`} key={`${one.제목}-${i}`}>
          <header>
            <span className="tb-urgency">{one.급함 === '먼저' ? '❗ 먼저' : one.급함 === '이번 주' ? '⏱ 이번 주' : 'ℹ 참고'}</span>
            <h3>{one.제목}</h3>
          </header>
          <p className="tb-why">{one.근거}</p>
          {one.대상 && one.대상.length > 0 && <p className="tb-who">대상: {one.대상.map(이름).join(', ')}</p>}
          <h4>이렇게 지도해 보세요</h4>
          <ol>{one.방법.map((m) => <li key={m}><MathText text={m} /></li>)}</ol>
          <dl className="tb-guide-extra">
            {one.발문 && <><dt>발문</dt><dd>{one.발문.map((q) => `“${q}”`).join(' ')}</dd></>}
            {one.교구 && <><dt>준비물</dt><dd>{one.교구}</dd></>}
            {one.활동 && <><dt>짧은 활동</dt><dd>{one.활동}</dd></>}
            {one.확인 && <><dt>확인 문제</dt><dd>{one.확인}</dd></>}
          </dl>
          {one.예시 && (
            <details className="tb-example">
              <summary>가장 많이 틀린 문제 보기</summary>
              <p><MathText text={one.예시.prompt} /></p>
              <p>정답: <MathText text={one.예시.answer} /> · 흔한 오답: <MathText text={one.예시.chosen || '-'} /></p>
              {one.예시.explanation && <p className="tb-note"><MathText text={one.예시.explanation} /></p>}
            </details>
          )}
        </article>
      ))}
    </div>
    {항목.length > 처음보일수 && (
      <button type="button" className="tb-button ghost small tb-more" onClick={() => set다보기(!다보기)}>
        {다보기 ? '접기' : `나머지 ${항목.length - 처음보일수}개 더 보기`}
      </button>
    )}
    </>
  );
}

function Guide({ 걸린, 반범위, 이름, 학생 }: { 걸린: 학습기록[]; 반범위: 학습기록[]; 이름: (no: number) => string; 학생: number | '' }) {
  const [누구, set누구] = useState<number | ''>(학생);
  useEffect(() => set누구(학생), [학생]);
  const 학생들 = [...new Set(반범위.map((one) => one.no))].sort((a, b) => a - b);
  const 반 = useMemo(() => 반지도(반범위, 이름), [반범위]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <section className="tb-card">
        <div className="tb-card-head">
          <h2>우리 반 지도 도움</h2>
          <button type="button" className="tb-button ghost small" onClick={() => window.print()}>인쇄하기</button>
        </div>
        <p className="tb-note">기록에서 찾은 근거와 함께, 다음 수업에서 바로 해 볼 수 있는 방법을 적었습니다. "먼저"부터 살펴보세요.</p>
        <GuideList 항목={반} 이름={이름} />
      </section>
      <section className="tb-card">
        <div className="tb-card-head">
          <h2>학생 한 명 지도 도움</h2>
          <select value={누구} onChange={(e) => set누구(e.target.value ? Number(e.target.value) : '')} aria-label="학생 고르기">
            <option value="">학생을 고르세요</option>
            {학생들.map((no) => <option key={no} value={no}>{이름(no)}</option>)}
          </select>
        </div>
        {누구 === '' ? <p className="tb-empty">학생을 고르면 그 학생에게 맞는 지도 방법을 보여 줍니다.</p>
          : <GuideList 항목={학생지도(반범위, 누구)} 이름={이름} />}
        {걸린.length === 0 && <p className="tb-empty">이 범위에는 기록이 없습니다.</p>}
      </section>
    </>
  );
}

// ── 오답 PDF ──────────────────────────────────────────────────────────

function WrongPdf({ 걸린, 이름, 범위글, 알리기 }: { 걸린: 학습기록[]; 이름: (no: number) => string; 범위글: string; 알리기: (t: string) => void }) {
  const 학생들 = useMemo(() => [...new Set(걸린.map((one) => one.no))].sort((a, b) => a - b), [걸린]);
  const [뺄학생, set뺄학생] = useState<Set<number>>(new Set());
  const [고르기, set고르기] = useState<오답고르기>({ 해결한것빼기: true, 같은문제한번: true, 최대: 0 });
  const [풀이넣기, set풀이넣기] = useState(true);
  const [만드는중, set만드는중] = useState(false);
  const [그릴것, set그릴것] = useState<Array<{ no: number; 문제: 학습기록[] }> | null>(null);
  const 판 = useRef<HTMLDivElement>(null);

  const 모음 = useMemo(() => 학생들.map((no) => ({ no, 문제: 오답모음(걸린, no, 고르기) })), [학생들, 걸린, 고르기]);
  const 고른모음 = 모음.filter((one) => !뺄학생.has(one.no) && one.문제.length > 0);

  useEffect(() => {
    if (!그릴것 || !판.current) return;
    let 살아있음 = true;
    void (async () => {
      try {
        const pages = Array.from(판.current!.querySelectorAll<HTMLElement>('.pdf-page'));
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
        const pdf = new jsPDF('p', 'mm', 'a4');
        for (let i = 0; i < pages.length; i += 1) {
          const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true });
          if (i > 0) pdf.addPage();
          // PNG로 넣으면 한 쪽이 수 MB가 되어 학생 몇 명만 모아도 수백 MB가 됩니다. JPEG로 줄입니다.
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        }
        const 이름부분 = 그릴것.length === 1 ? 이름(그릴것[0].no) : `${그릴것.length}명`;
        if (살아있음) {
          const url = URL.createObjectURL(pdf.output('blob'));
          const a = document.createElement('a');
          a.href = url;
          a.download = `틀린문제-${이름부분}-${날짜글(new Date())}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
        알리기(`오답 PDF를 만들었습니다(${그릴것.length}명, ${pages.length}쪽).`);
      } catch {
        알리기('PDF를 만들지 못했습니다. 다시 눌러 주세요.');
      } finally {
        if (살아있음) {
          set그릴것(null);
          set만드는중(false);
        }
      }
    })();
    return () => { 살아있음 = false; };
  }, [그릴것]); // eslint-disable-line react-hooks/exhaustive-deps

  const 만들기 = () => {
    if (고른모음.length === 0) return;
    set만드는중(true);
    set그릴것(고른모음);
  };

  const 쪽묶기 = (list: 학습기록[]) => Array.from({ length: Math.ceil(list.length / 6) }, (_, i) => list.slice(i * 6, i * 6 + 6));

  return (
    <section className="tb-card">
      <h2>학생별 틀린 문제 PDF</h2>
      <p className="tb-note">위쪽 범위(<b>{범위글}</b>) 안에서 틀린 문제를 모읍니다. 학년·단원·차시·기간을 바꾸면 PDF에 들어갈 문제도 바뀝니다.</p>
      <div className="tb-options">
        <label><input type="checkbox" checked={고르기.해결한것빼기} onChange={(e) => set고르기({ ...고르기, 해결한것빼기: e.target.checked })} /> 나중에 다시 맞힌 문제는 빼기(아직 해결 못 한 문제만)</label>
        <label><input type="checkbox" checked={고르기.같은문제한번} onChange={(e) => set고르기({ ...고르기, 같은문제한번: e.target.checked })} /> 같은 문제를 여러 번 틀렸으면 한 번만</label>
        <label><input type="checkbox" checked={풀이넣기} onChange={(e) => set풀이넣기(e.target.checked)} /> 뒤쪽에 정답과 풀이 쪽 넣기</label>
        <label>학생마다 최대
          <select value={고르기.최대} onChange={(e) => set고르기({ ...고르기, 최대: Number(e.target.value) })}>
            <option value={0}>모두</option>
            <option value={6}>6문제(1쪽)</option>
            <option value={12}>12문제(2쪽)</option>
            <option value={24}>24문제(4쪽)</option>
          </select>
          <small>최근에 틀린 것부터</small>
        </label>
      </div>
      <div className="tb-pick">
        <div className="tb-card-head">
          <h3>넣을 학생</h3>
          <span>
            <button type="button" className="tb-button ghost small" onClick={() => set뺄학생(new Set())}>모두 고르기</button>
            <button type="button" className="tb-button ghost small" onClick={() => set뺄학생(new Set(학생들))}>모두 빼기</button>
          </span>
        </div>
        <ul className="tb-checks">
          {모음.map((one) => (
            <li key={one.no}>
              <label className={one.문제.length === 0 ? 'off' : ''}>
                <input type="checkbox" disabled={one.문제.length === 0} checked={!뺄학생.has(one.no) && one.문제.length > 0}
                  onChange={(e) => {
                    const 다음 = new Set(뺄학생);
                    if (e.target.checked) 다음.delete(one.no); else 다음.add(one.no);
                    set뺄학생(다음);
                  }} />
                {이름(one.no)} <small>{one.문제.length}문제</small>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="tb-button" disabled={고른모음.length === 0 || 만드는중} onClick={만들기}>
        {만드는중 ? 'PDF 만드는 중…' : `PDF 만들기 (${고른모음.length}명, ${고른모음.reduce((s, one) => s + one.문제.length, 0)}문제)`}
      </button>
      <p className="tb-note">학생마다 새 쪽에서 시작합니다. 한 쪽에 6문제씩 들어갑니다.</p>

      {그릴것 && (
        <div className="pdf-pages" aria-hidden="true" ref={판}>
          {그릴것.map(({ no, 문제 }) => {
            const 쪽들 = 쪽묶기(문제);
            return (
              <div key={no}>
                {쪽들.map((page, pi) => (
                  <section className="pdf-page pdf-problem-page" key={`p${no}-${pi}`}>
                    <p className="pdf-kicker">수학 오답 복습 · 문제</p>
                    <h1>{이름(no)} · 틀린 문제 다시 풀기</h1>
                    <p className="pdf-meta">{범위글} · 문제 {pi * 6 + 1}-{pi * 6 + page.length} / 총 {문제.length}문항</p>
                    <div className="pdf-card-grid">
                      {page.map((one, i) => (
                        <article className="pdf-mini-card" key={one.id}>
                          <header><strong>문제 {pi * 6 + i + 1}</strong><span>{one.difficulty}</span></header>
                          <p className="pdf-mini-meta">{단원이름(one)} · {차시이름(one)}</p>
                          <QuestionVisualGraphic visual={one.visual} className="pdf-question-visual" />
                          <p className="pdf-mini-question"><MathText text={one.prompt} /></p>
                          {one.choices.length > 1 && (
                            <ol className="pdf-mini-choices">
                              {one.choices.map((c, ci) => <li key={ci}><span className="pdf-choice-no">{ci + 1}</span><MathText text={c} /></li>)}
                            </ol>
                          )}
                        </article>
                      ))}
                    </div>
                    {풀이넣기 && <p className="pdf-foot">정답과 풀이는 문제 쪽이 끝난 다음 쪽에 있습니다.</p>}
                  </section>
                ))}
                {풀이넣기 && 쪽들.map((page, pi) => (
                  <section className="pdf-page pdf-answer-page" key={`a${no}-${pi}`}>
                    <p className="pdf-kicker">수학 오답 복습 · 정답과 풀이</p>
                    <h1>{이름(no)} · 정답과 풀이</h1>
                    <p className="pdf-meta">정답과 풀이 {pi * 6 + 1}-{pi * 6 + page.length} / 총 {문제.length}문항</p>
                    <div className="pdf-card-grid">
                      {page.map((one, i) => (
                        <article className="pdf-mini-card pdf-solution-card" key={`${one.id}-a`}>
                          <header><strong>문제 {pi * 6 + i + 1}</strong><span>{one.date}</span></header>
                          <p className="pdf-mini-answer">정답: <MathText text={one.answer} /></p>
                          <p className="pdf-mini-memo">그때 고른 답: <MathText text={one.chosen || '-'} /></p>
                          {one.support?.coreConcept && <p className="pdf-mini-concept">핵심: <MathText text={one.support.coreConcept} /></p>}
                          {one.support?.steps?.length ? <p className="pdf-mini-explanation">풀이: <MathText text={one.support.steps.join(' → ')} /></p>
                            : one.explanation && <p className="pdf-mini-explanation">풀이: <MathText text={one.explanation} /></p>}
                          {one.support?.misconceptionTip && <p className="pdf-mini-explanation">조심: <MathText text={one.support.misconceptionTip} /></p>}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── 기록 관리 ──────────────────────────────────────────────────────────

function Manage({ 모두, 걸린, 거름값, 범위글, 이름, 휴지통수, 백업, 오래, 알리기, 새로읽기 }: {
  모두: 학습기록[];
  걸린: 학습기록[];
  거름값: 거름;
  범위글: string;
  이름: (no: number) => string;
  휴지통수: number;
  백업: 백업파일상태;
  오래: boolean | null;
  알리기: (t: string) => void;
  새로읽기: () => Promise<void>;
}) {
  const 파일 = useRef<HTMLInputElement>(null);
  const 학생수 = new Set(걸린.map((one) => one.no)).size;
  const 날수 = new Set(걸린.map((one) => one.date)).size;

  const 지우기 = async () => {
    if (걸린.length === 0) return;
    const 전부 = 조건없음(거름값);
    const 물음 = 전부
      ? `범위를 고르지 않았습니다. 이 컴퓨터의 학습 기록 ${걸린.length}개를 모두 지울까요?`
      : `"${범위글}" 범위의 기록 ${걸린.length}개(학생 ${학생수}명, ${날수}일)를 지울까요?\n지운 뒤 바로 '되돌리기'로 살릴 수 있습니다.`;
    if (!window.confirm(물음)) return;
    if (전부 && window.prompt('정말 모두 지우려면 "모두 지우기"라고 써 주세요.') !== '모두 지우기') return;
    const n = await 기록지우기(걸린.map((one) => one.id));
    await 새로읽기();
    알리기(`${n}개 기록을 지웠습니다. 실수였다면 '되돌리기'를 누르세요.`);
  };

  const 살리기 = async () => {
    const n = await 되돌리기();
    await 새로읽기();
    알리기(`${n}개 기록을 되살렸습니다.`);
  };

  const 불러오기 = async (file: File) => {
    const 꺼낸 = 백업풀기(await file.text());
    if (!꺼낸) {
      알리기('학습 기록장 백업 파일이 아닙니다.');
      return;
    }
    const 있던 = new Set(모두.map((one) => one.id));
    await 기록더하기(꺼낸);
    await 새로읽기();
    알리기(`백업에서 ${꺼낸.length}개를 읽었습니다(새로 더해진 기록 ${꺼낸.filter((one) => !있던.has(one.id)).length}개).`);
  };

  return (
    <div className="tb-grid2">
      <section className="tb-card">
        <h2>기록 지우기</h2>
        <p>모든 학습을 다 볼 필요는 없을 때, 위쪽에서 <b>학생·학년·학기·단원·차시·기간</b>을 골라 그 범위만 지웁니다.</p>
        <div className="tb-delete-box">
          <p>지울 범위: <b>{범위글}</b></p>
          <p>기록 {걸린.length.toLocaleString()}개 · 학생 {학생수}명 · {날수}일</p>
          {걸린.length > 0 && (
            <p className="tb-note">
              포함된 학생: {[...new Set(걸린.map((one) => one.no))].sort((a, b) => a - b).slice(0, 12).map(이름).join(', ')}
              {학생수 > 12 ? ' …' : ''}
            </p>
          )}
          <button type="button" className="tb-button danger" disabled={걸린.length === 0} onClick={() => void 지우기()}>
            이 범위의 기록 {걸린.length.toLocaleString()}개 지우기
          </button>
        </div>
        <div className="tb-undo">
          <span>방금 지운 기록: {휴지통수}개</span>
          <button type="button" className="tb-button ghost small" disabled={휴지통수 === 0} onClick={() => void 살리기()}>되돌리기</button>
        </div>
        <p className="tb-note">가장 최근에 지운 한 묶음만 되돌릴 수 있습니다. 중요한 기록은 지우기 전에 백업 파일을 받아 두세요.</p>
      </section>

      <section className="tb-card">
        <h2>자동 저장과 백업</h2>
        <ul className="tb-status">
          <li>✅ 학생이 문제를 풀 때마다 <b>이 컴퓨터의 브라우저 저장소</b>에 바로 저장됩니다. 창을 닫거나 판을 다시 시작해도 남습니다.</li>
          <li>{오래 ? '✅ 브라우저에 "오래 보관"을 허락받았습니다. 저장 공간이 모자라도 지워지지 않습니다.' : '⚠️ 브라우저가 "오래 보관"을 아직 허락하지 않았습니다. 이 페이지를 즐겨찾기에 넣거나 자주 열면 허락됩니다. 백업 파일 연결을 함께 쓰면 안전합니다.'}</li>
          <li>⚠️ 브라우저의 "인터넷 사용 기록 삭제(쿠키·사이트 데이터)"를 하면 지워집니다. 다른 컴퓨터·다른 브라우저에서는 보이지 않습니다.</li>
        </ul>
        <h3>백업 파일에 자동 저장</h3>
        {!백업파일지원() ? (
          <p className="tb-note">이 브라우저는 파일 자동 저장을 지원하지 않습니다(크롬·엣지에서 됩니다). 아래 "백업 파일 받기"를 주기적으로 눌러 주세요.</p>
        ) : 백업 ? (
          <div className="tb-backup">
            <p>연결된 파일: <b>{백업.이름}</b> {백업.쓸수있음 ? `· 마지막 저장 ${백업.마지막 ? new Date(백업.마지막).toLocaleString('ko-KR') : '-'}` : '· 브라우저를 다시 열어 쓰기 허락이 필요합니다'}</p>
            {!백업.쓸수있음 && <button type="button" className="tb-button small" onClick={() => void 백업파일다시허락().then(새로읽기)}>파일 저장 다시 허락하기</button>}
            {백업.쓸수있음 && <button type="button" className="tb-button ghost small" onClick={() => void 백업파일에쓰기().then(새로읽기)}>지금 저장</button>}
            <button type="button" className="tb-button ghost small" onClick={() => void 백업파일끊기().then(새로읽기)}>연결 끊기</button>
          </div>
        ) : (
          <>
            <p className="tb-note">컴퓨터의 폴더(예: 문서 › 수학놀이)에 백업 파일을 하나 정해 두면, 기록이 바뀔 때마다 그 파일에도 자동으로 저장합니다.</p>
            <button type="button" className="tb-button" onClick={() => void 백업파일고르기().then(새로읽기).catch(() => undefined)}>백업 파일 정하기</button>
          </>
        )}
        <h3>파일로 받기·옮기기</h3>
        <div className="tb-row">
          <button type="button" className="tb-button ghost" onClick={() => 파일받기(JSON.stringify(백업만들기(모두)), `학습기록-백업-${날짜글(new Date())}.json`, 'application/json')}>전체 백업 파일 받기</button>
          <button type="button" className="tb-button ghost" onClick={() => 파일.current?.click()}>백업 불러오기</button>
          <button type="button" className="tb-button ghost" disabled={걸린.length === 0} onClick={() => 파일받기(csv만들기(걸린, 이름), `학습기록-${날짜글(new Date())}.csv`, 'text/csv')}>지금 범위를 엑셀(CSV)로</button>
          <input ref={파일} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void 불러오기(f); e.target.value = ''; }} />
        </div>
        <p className="tb-note">백업 불러오기는 지금 기록에 더합니다(같은 기록은 한 번만). 다른 컴퓨터로 옮길 때 씁니다.</p>
        <h3>학생 이름</h3>
        <p className="tb-note">놀이 화면 설정의 "우리 반 이름" 명단을 넣어 두면 이곳에도 번호 옆에 이름이 함께 보입니다. 이름은 이 컴퓨터에만 있고 기록에는 번호만 남습니다.</p>
        <p className="tb-note">학년별 기록 수: {[...new Set(모두.map((one) => one.grade))].sort().map((g) => `${g}학년 ${모두.filter((one) => one.grade === g).length}개`).join(' · ')}</p>
        <p className="tb-note">이 페이지 주소를 즐겨찾기에 넣어 두면 언제든 바로 열 수 있습니다: <code>{window.location.href.split('#')[0]}</code></p>
      </section>
    </div>
  );
}
