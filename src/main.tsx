import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { 동시탭켜기 } from './multiTouchTap';

// 전자칠판에서 여럿이 동시에 눌러도 저마다의 단추가 눌리게 합니다(multiTouchTap.ts).
동시탭켜기();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
