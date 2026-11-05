// @vitest-environment jsdom
import { it, expect, describe, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock lazy components
vi.mock('./components/QuestionVisualGraphic', () => ({
  QuestionVisualGraphic: () => null,
}));
vi.mock('./components/CastleDefenseScene', () => ({
  CastleDefenseScene: () => null,
}));
vi.mock('./components/GameScene', () => ({
  GameScene: () => null,
}));
vi.mock('./components/InteractiveHintModal', () => ({
  InteractiveHintModal: () => null,
}));
vi.mock('./components/Manipulate', () => ({
  ManipulateTask: () => null,
}));
vi.mock('./components/TeacherPanel', () => ({
  TeacherPanel: () => null,
}));

describe('게임 통합 테스트', () => {
  it('App이 오류 없이 렌더링되어야 함', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/보조개샘ai클래스 수학 게임/i)).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('학년 선택 화면이 표시되어야 함', async () => {
    render(<App />);
    await waitFor(() => {
      const yearButtons = screen.getAllByText(/학년/);
      expect(yearButtons.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});
