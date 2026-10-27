// ════════════════════════════════════════════════════════════════════
// 차시의 종류와 가벼운 판별 함수
// ────────────────────────────────────────────────────────────────────
// 화면(App)이 처음 열릴 때 바로 필요한 것만 모아 둡니다. 문항을 만드는
// questionFactory.ts는 수천 줄이라, 여기 있는 작은 값을 쓰려고 그 파일을
// 불러오면 앱을 처음 여는 일이 무거워집니다. 문항 생성기는 따로 늦게
// 불러옵니다(engine.ts).
// ════════════════════════════════════════════════════════════════════

// '단 × 수 = ?' 성 지키기에서 고를 수 있는 단입니다. 아무 것도 고르지 않았거나
// 모두 고르면 2~9단이 전부 나옵니다.
export const ALL_CASTLE_DEFENSE_DANS = [2, 3, 4, 5, 6, 7, 8, 9];

// 2-2 곱셈구구와 3-1 나눗셈 단원의 성 지키기 차시 이름입니다.
export const CASTLE_MULTIPLY_TITLE = '구구단, 몬스터를 막아라!';
export const CASTLE_DIVIDE_TITLE = '나눗셈, 몬스터를 막아라!';
export const isCastleLesson = (title: string) => title === CASTLE_MULTIPLY_TITLE || title === CASTLE_DIVIDE_TITLE;

//   recall   아는 것을 꺼내거나 배운 절차를 그대로 수행함
//   connect  상황을 읽고 어떤 식을 세울지 스스로 정해야 함
//   reason   풀이를 이해하고 판단하거나 거꾸로 생각해야 함
export type Demand = 'recall' | 'connect' | 'reason';

// 문항이 스스로 밝히는 전략 이름에서 요구 수준을 읽습니다.
export const demandOfStrategy = (strategy: string): Demand => {
  if (/판단|옳은|비교|견주|거꾸로|다른 방법|틀린|빠진|차례 정하기|확인하기|규칙|쓰임|바꾸어/.test(strategy)) {
    return 'reason';
  }
  if (/문장|묶음|상황|남은|받고|모두|합|차 구하기|해결/.test(strategy)) {
    return 'connect';
  }
  return 'recall';
};
