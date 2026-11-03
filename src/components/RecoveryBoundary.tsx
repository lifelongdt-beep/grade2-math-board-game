import { Component, type ReactNode } from 'react';
export class RecoveryBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <main className="reliability-notice" role="alert"><h1>화면을 불러오지 못했습니다</h1><p>연결을 확인한 뒤 다시 열어 주세요. 기기에 저장된 학습 기록과 전송 대기 답안은 유지됩니다.</p><button type="button" onClick={() => window.location.reload()}>화면 다시 열기</button></main> : this.props.children;
  }
}
