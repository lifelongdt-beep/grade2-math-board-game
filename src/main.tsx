import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { 동시탭켜기 } from './multiTouchTap';

// 교사용 학습 기록장은 같은 사이트의 ?page=records 주소로 엽니다. 놀이 화면과 같은 컴퓨터 저장소를 읽습니다.
const TeacherBook = lazy(() => import('./components/TeacherBook').then((m) => ({ default: m.TeacherBook })));
const 기록장인가 = new URLSearchParams(window.location.search).get('page') === 'records';

// 전자칠판에서 여럿이 동시에 눌러도 저마다의 단추가 눌리게 합니다(multiTouchTap.ts).
if (!기록장인가) 동시탭켜기();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {기록장인가 ? (
      <Suspense fallback={<p style={{ padding: 24 }}>학습 기록장을 여는 중입니다…</p>}>
        <TeacherBook />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
