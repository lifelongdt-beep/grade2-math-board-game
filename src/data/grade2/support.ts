import type { ConceptTag } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 2학년 문항의 도움말(갈래별 기본 글)
// ────────────────────────────────────────────────────────────────────
// 2학년은 처음 판을 2학년 생성기가 만들고, 고난도(levels/s2hard.ts)와 늘림
// 뭉치(expand/)만 grade5/build.ts의 틀을 빌려 씁니다. 그 틀의 기본 도움말은
// 5학년 말이라 '평면도형', '입체도형', '직육면체' 같은 2학년이 배우지 않은 말이
// 나옵니다. 그래서 2학년 차시는 이 표를 먼저 씁니다. 문항이 concept,
// misconceptionTip, selfCheck를 직접 적으면 그것이 이 표보다 먼저입니다.
// ════════════════════════════════════════════════════════════════════

type 표 = Partial<Record<ConceptTag, string>>;

export const g2TagLabel: 표 = {
  number: '수 세기와 크기 비교',
  placeValue: '세 자리 수와 네 자리 수',
  addition: '덧셈',
  subtraction: '뺄셈',
  shape: '여러 가지 도형',
  solid: '쌓기나무',
  measurement: '길이 재기',
  classification: '분류하기',
  multiplication: '곱셈',
  time: '시각과 시간',
  data: '표와 그래프',
  pattern: '규칙 찾기',
};

export const g2CoreConcept: 표 = {
  placeValue: '같은 숫자라도 어느 자리에 있느냐에 따라 나타내는 값이 다릅니다. 10이 10개이면 100입니다.',
  addition: '덧셈은 두 수를 모으는 것입니다. 일의 자리끼리 더해 10이 넘으면 십의 자리로 받아올림합니다.',
  subtraction: '뺄셈은 덜어 내거나 두 수의 차이를 구하는 것입니다. 덧셈과 뺄셈은 서로 거꾸로 생각할 수 있습니다.',
  shape: '삼각형은 곧은 선 3개, 사각형은 곧은 선 4개로 둘러싸인 도형입니다. 칠교 조각을 이어 붙여 여러 모양을 만들 수 있습니다.',
  solid: '위층의 쌓기나무 아래에는 꼭 받쳐 주는 쌓기나무가 있습니다. 보이지 않는 쌓기나무까지 층별로 셉니다.',
  measurement: '길이는 같은 단위가 몇 번 들어가는지로 잽니다. 1 cm가 □번이면 □ cm입니다.',
  classification: '분명한 기준을 정해 나누면 누가 나누어도 결과가 같습니다. 나눈 것의 수를 모두 더하면 전체입니다.',
  multiplication: '같은 수를 여러 번 더하는 것을 곱셈으로 나타냅니다. ■씩 ▲묶음은 ■×▲입니다.',
};

export const g2StudentConcept: 표 = {
  shape: '조각의 모양과 크기를 견주어 보세요.',
  solid: '1층, 2층, 3층으로 나누어 세어 보세요.',
  measurement: '한 칸(단위)이 몇 번인지 세어 보세요.',
};

export const g2ReadStrategy: 표 = {
  shape: '어느 조각을 쓰는지, 무엇과 크기나 모양이 같아야 하는지 먼저 봅니다.',
  solid: '보이는 것만 세라는지, 쌓은 것을 모두 세라는지 먼저 봅니다.',
  measurement: '한 칸의 길이와 무엇의 길이를 묻는지 먼저 봅니다.',
};

export const g2Misconception: 표 = {
  shape: '조각의 수만 세면 안 됩니다. 크기를 견주어 보세요.',
  solid: '그림에서 보이는 쌓기나무만 세면 가려진 쌓기나무를 빠뜨립니다.',
  measurement: '꺾인 곳에서 칸을 빠뜨리거나 두 번 세지 않도록 짚어 가며 세어요.',
};

export const g2SelfCheck: 표 = {
  shape: '찾은 조각을 이어 붙이면 정말 같은 모양이 되는지 확인했나요?',
  solid: '가려진 쌓기나무까지 셌나요?',
  measurement: '센 칸의 수에 한 칸의 길이를 맞게 곱했나요?',
};
