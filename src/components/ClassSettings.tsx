import { useState } from 'react';
import { readClassContext, writeClassContext } from '../data/classContext';
export function ClassSettings() {
  const [context, setContext] = useState(readClassContext);
  const [error, setError] = useState('');
  return <details className="class-settings"><summary>학급 설정 · {context.schoolYear}학년도 {context.classId}</summary>
    <p>기록을 학년도와 학급별로 나눕니다. 변경하면 새 학급으로 화면을 다시 엽니다. 기존 기록은 기록장에 남습니다.</p>
    <label>학년도 <input type="number" min="2000" max="2200" value={context.schoolYear} onChange={e => setContext({ ...context, schoolYear: Number(e.target.value) })} /></label>
    <label>학급 이름 <input maxLength={80} value={context.classId} onChange={e => setContext({ ...context, classId: e.target.value })} /></label>
    <button type="button" onClick={() => { try { writeClassContext(context); window.location.reload(); } catch { setError('학급 설정을 저장하지 못했습니다. 학년도·이름과 브라우저 저장 권한을 확인해 주세요.'); } }}>학급 저장</button>
    {error && <p role="alert">{error}</p>}
  </details>;
}
