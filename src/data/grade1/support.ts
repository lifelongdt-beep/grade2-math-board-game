import type { ConceptTag } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 1학년 문항이 쓰는 도움말
// ────────────────────────────────────────────────────────────────────
// 3학년과 같은 틀(grade5/build.ts)로 만들되, 도움말은 1학년 교과서가
// 쓰는 말로만 적습니다. '직육면체, 원기둥, 구'처럼 1학년이 배우지 않는
// 말은 쓰지 않습니다(지도서: 모양을 가리키는 수학적 용어를 쓰지 않는다).
// 문장도 짧게 씁니다. 1학년 아이는 글을 막 읽기 시작했습니다.
// ════════════════════════════════════════════════════════════════════

export const g1StudentConcept: Partial<Record<ConceptTag, string>> = {
  number: '하나씩 짚으며 세어 보세요. 마지막에 센 수가 모두의 수예요.',
  solid: '평평한 곳, 뾰족한 곳, 둥근 곳이 있는지 보세요.',
  addition: '두 무리를 모으면 모두 몇인지 세어 보세요.',
  subtraction: '덜어 내고 남은 것을 세어 보세요.',
  measurement: '한쪽 끝을 맞추어 견주어 보세요.',
};

export const g1CoreConcept: Partial<Record<ConceptTag, string>> = {
  number: '물건을 하나씩 짚으며 세면 마지막에 센 수가 모두의 수입니다. 수는 하나, 둘처럼 읽기도 하고 일, 이처럼 읽기도 합니다.',
  solid: '상자 모양은 평평한 부분과 뾰족한 부분이 있어 잘 쌓입니다. 둥근기둥 모양은 평평한 부분과 둥근 부분이 있어 눕히면 굴러가고 세우면 쌓입니다. 공 모양은 모두 둥글어 잘 굴러갑니다.',
  addition: '두 수를 모으는 것을 덧셈이라고 합니다. 2+3=5는 2 더하기 3은 5와 같습니다라고 읽습니다.',
  subtraction: '덜어 내고 남은 것, 두 수의 차이를 구하는 것을 뺄셈이라고 합니다. 5-2=3은 5 빼기 2는 3과 같습니다라고 읽습니다.',
  measurement: '길이는 길다·짧다, 무게는 무겁다·가볍다, 넓이는 넓다·좁다, 담을 수 있는 양은 많다·적다로 견주어 말합니다.',
};

export const g1ReadStrategy: Partial<Record<ConceptTag, string>> = {
  number: '무엇을 세는지 먼저 찾고, 그림에서 하나씩 짚으며 셉니다.',
  solid: '그림의 모양에서 평평한 곳, 뾰족한 곳, 둥근 곳을 찾습니다.',
  addition: '모두 몇인지 묻는지 먼저 봅니다.',
  subtraction: '남은 것을 묻는지, 몇 개 더 많은지 묻는지 먼저 봅니다.',
  measurement: '무엇을 견주는지(길이, 무게, 넓이, 담는 양) 먼저 봅니다.',
};

export const g1Misconception: Partial<Record<ConceptTag, string>> = {
  number: '같은 것을 두 번 세거나 빠뜨리지 않게 하나씩 짚으며 세세요.',
  solid: '색이나 크기가 달라도 모양이 같으면 같은 모양입니다.',
  addition: '두 수를 모을 때 처음 수부터 다시 세지 않고 이어 세어도 됩니다.',
  subtraction: '덜어 낸 것을 세면 안 됩니다. 남은 것을 세세요.',
  measurement: '한쪽 끝을 맞추지 않으면 길이를 바르게 견줄 수 없습니다.',
};

export const g1SelfCheck: Partial<Record<ConceptTag, string>> = {
  number: '다시 한 번 세어도 같은 수가 나오나요?',
  solid: '고른 모양이 말한 특징을 모두 가졌나요?',
  addition: '모은 수가 처음 두 수보다 큰가요?',
  subtraction: '남은 수와 덜어 낸 수를 모으면 처음 수가 되나요?',
  measurement: '견주는 말(길다, 무겁다, 넓다, 많다)을 바르게 썼나요?',
};

// 선생님 기록에 남는 이름입니다.
export const g1TagLabel: Partial<Record<ConceptTag, string>> = {
  number: '수 세기와 크기 비교',
  solid: '여러 가지 모양',
  addition: '한 자리 수의 덧셈',
  subtraction: '한 자리 수의 뺄셈',
  measurement: '비교하기',
};
