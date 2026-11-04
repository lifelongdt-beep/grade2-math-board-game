import type { Lesson, Question } from '../../types';
// 2학년은 두 자리 수 곱셈 알고리즘을 전제로 설명하지 않고, 배운 묶음·뛰어 세기로 설명합니다.
export function grade2Support(question: Question, lesson: Lesson): Question {
  if (!lesson.semester.startsWith('2')) return question;
  const beforeMultiplication = lesson.semester === '2-1' && lesson.unitNo < 6;
  const wording = (text: string) => text
    .replace(/곱셈식 (\d+)×(\d+)(?:을\(를\)|을|를) 세워 계산하세요\./g, (whole, a, b) => beforeMultiplication || +a > 9 || +b > 9 ? `${a}씩 ${b}묶음이므로 뛰어 세거나 더해 보세요.` : whole)
    .replace(/(\d+)\s*×\s*(\d+)\s*=\s*(\d+)/g, (whole, a, b, result) => beforeMultiplication || +a > 9 || +b > 9 ? `${a}씩 ${b}번 더하면 ${result}` : whole)
    .replace(/(\d+)\s*×\s*(\d+)/g, (whole, a, b) => beforeMultiplication || +a > 9 || +b > 9 ? `(${a}씩 ${b}번 더한 수)` : whole);
  const support = question.support;
  return { ...question, explanation: wording(question.explanation), support: { ...support,
    studentHint: wording(support.studentHint), studentConcept: wording(support.studentConcept),
    coreConcept: wording(support.coreConcept), readStrategy: wording(support.readStrategy),
    steps: support.steps.map(wording), misconceptionTip: wording(support.misconceptionTip), selfCheck: wording(support.selfCheck),
  } };
}
