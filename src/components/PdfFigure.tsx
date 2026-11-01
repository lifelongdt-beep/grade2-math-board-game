import { ManipulateTask } from './Manipulate';
import { QuestionVisualGraphic } from './QuestionVisualGraphic';
import type { Manipulation, QuestionVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 오답 PDF 속 문제 그림
// ────────────────────────────────────────────────────────────────────
// 화면에서 손으로 옮기고 그리는 문제(시계 바늘, 모눈 대칭 그리기, 수 모형 등)는 판 자체가
// 문제입니다. 판을 빼고 글만 찍으면 "나머지 반쪽을 그려 보세요"만 남아 풀 수가 없었습니다.
// 그래서 PDF에도 같은 판을 그대로 그립니다. 문제 쪽은 처음 모습, 정답 쪽은 바른 모습을
// 겹친 판입니다. 누르는 단추는 감춥니다(locked).
// 조작 문제가 아니면 문제 그림을 넉넉한 크기로 그립니다.
// ════════════════════════════════════════════════════════════════════

const 아무것도안함 = () => undefined;

export function PdfFigure({ visual, manipulate, answer = false }: { visual?: QuestionVisual; manipulate?: Manipulation; answer?: boolean }) {
  if (manipulate) {
    return (
      <div className="pdf-manip" aria-hidden="true">
        <ManipulateTask m={manipulate} locked reveal={answer} onSubmit={아무것도안함} />
      </div>
    );
  }
  if (answer || !visual) return null;
  return <QuestionVisualGraphic visual={visual} className="pdf-question-visual pdf-question-visual-large" />;
}

/** 보기를 고르는 문제인지입니다. 조작 문제는 기록에 정답 한 줄만 '보기'로 남으므로 보기 목록을 찍지 않습니다. */
export const 보기있는문제 = (record: { choices: string[]; manipulate?: Manipulation }) => !record.manipulate && record.choices.length > 1;

/** 판 자료가 저장되기 전에 쌓인 조작 문제입니다. 판을 다시 그릴 수 없습니다. */
export const 판없는조작문제 = (record: { choices: string[]; manipulate?: Manipulation; visual?: QuestionVisual }) =>
  !record.manipulate && record.choices.length <= 1;
