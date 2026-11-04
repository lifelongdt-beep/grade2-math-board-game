import type { G5Family, G5Spec } from '../grade5/build';
import type { 수준표 } from './registry';
import { 고르개, 사이 } from '../grade11/common';
import { 지식, 사고 } from './common';
const family = (id: string, make: (next: (n: number) => number) => G5Spec): G5Family => ({ id: `audit-${id}`, make: seed => make(고르개(seed)) });
const common = { selfCheck: '문제의 조건과 구한 답이 모두 맞는지 확인했나요?', misconceptionTip: '문제에 주어진 조건을 빠뜨리지 말고 확인하세요.' };
const equalParts = family('equal-parts-reason', next => {
  const n = 사이(next,3,8), object = ['색종이','피자 모양 종이','직사각형 종이','원 모양 종이'][next(4)];
  return 사고({ ...common, tag:'fraction', prompt:`${object}를 ${n}조각으로 나누었지만 조각들의 크기가 서로 다릅니다. 친구가 "조각 수가 ${n}개이므로 똑같이 나눈 것이다"라고 했습니다. 바르게 고친 생각은 무엇일까요?`, answer:'조각 수뿐 아니라 조각들의 크기도 같아야 합니다.', wrongs:['조각 수만 같으면 똑같이 나눈 것입니다.','색이 같으면 크기가 달라도 됩니다.','모양이 원이면 크기를 비교하지 않아도 됩니다.'], strategy:'조건 함께 보기 · 똑같이 나눈 것의 조건 설명하기', hint:'조각 수와 조각의 크기는 같은 조건인지 생각해 보세요.', concept:'전체를 똑같이 나누려면 각 부분의 크기가 같아야 합니다.', steps:[`${n}조각이라는 것은 조각의 수만 알려 줍니다.`,'조각들의 크기가 서로 다르므로 똑같이 나눈 것이 아닙니다.'] });
});
const fractionReason = family('fraction-label-reason', next => {
  const d=사이(next,3,12), n=사이(next,1,d-1);
  if (next(2)) return 사고({ ...common, tag:'fraction', prompt:`종이의 ${n}/${d}을(를) 색칠하려는데 친구가 "전체를 ${n}조각으로 나누고 ${d}조각을 칠하자"고 했습니다. 잘못된 생각을 고친 설명은 무엇일까요?`, answer:`전체를 똑같이 ${d}조각으로 나누고 그중 ${n}조각을 칠해야 합니다.`, wrongs:[`전체를 ${n}조각으로 나누고 ${d}조각을 칠해야 합니다.`,`전체를 ${d+n}조각으로 나누기만 하면 됩니다.`,'전체를 나눈 조각의 크기는 달라도 됩니다.'], strategy:'조건 함께 보기 · 분수와 색칠 조건의 오류 연결하기', hint:'분수 아래의 수와 위의 수가 각각 무엇을 나타내는지 확인하세요.', concept:'아래의 수는 전체를 똑같이 나눈 수, 위의 수는 그중 선택한 수입니다.', steps:[`전체를 나눌 수는 ${d}이고 색칠할 조각은 ${n}개입니다.`,`${n}조각 중 ${d}조각을 칠하자는 제안은 두 수의 역할을 바꾼 것입니다.`] });
  return 사고({ ...common, tag:'fraction', prompt:`종이를 크기가 같은 ${d}조각으로 나누고 그중 ${n}조각을 색칠했습니다. 친구는 색칠한 부분을 ${d}/${n}라고 썼습니다. 잘못을 바르게 설명한 것은 무엇일까요?`, answer:`전체를 나눈 ${d}은(는) 아래에, 색칠한 ${n}은(는) 위에 써야 합니다.`, wrongs:[`전체를 나눈 ${d}은(는) 위에, 색칠한 ${n}은(는) 아래에 써야 합니다.`,`두 수를 더한 ${d+n}만 쓰면 됩니다.`,'두 수가 다르면 분수로 나타낼 수 없습니다.'], strategy:'조건 함께 보기 · 분수를 잘못 쓴 까닭 찾기', hint:'전체를 똑같이 나눈 수와 색칠한 수가 각각 어디에 쓰이는지 확인하세요.', concept:'전체를 나눈 수는 분수의 아래에, 선택한 부분의 수는 위에 씁니다.', steps:[`전체를 나눈 수는 ${d}이고 색칠한 조각은 ${n}개입니다.`,`색칠한 부분은 ${n}/${d}이므로 두 수의 자리를 바르게 써야 합니다.`] });
});
const verifyDivision = family('division-known-fact', next => {
  const a=사이(next,2,9), q=사이(next,12,99), total=a*q;
  return 지식({ ...common, tag:'division', prompt:`${a}×${q}=${total}입니다. 곱셈으로 확인할 수 있는 ${total}÷${a}의 몫은 얼마일까요?`, answer:String(q), wrongs:[String(q+1),String(q-1),String(q+2)], strategy:'곱셈과 나눗셈의 관계 바로 확인하기', hint:'주어진 곱셈식에서 나누는 수와 곱해지는 수를 짚어 보세요.', concept:'나누는 수에 몫을 곱하면 나누어지는 수가 됩니다.', steps:[`주어진 식은 ${a}×${q}=${total}입니다.`,`따라서 ${total}÷${a}의 몫은 ${q}입니다.`] });
});
const sameCup = family('capacity-same-unit', next => {
  const a=사이(next,2,15), b=a+사이(next,1,6);
  return 지식({ ...common, tag:'measurement', prompt:`크기가 같은 컵으로 가 물통은 ${a}컵, 나 물통은 ${b}컵의 물이 들어갑니다. 들이가 더 큰 물통은 어느 것일까요?`, answer:'나 물통', wrongs:['가 물통','두 물통의 들이는 같습니다.','컵의 크기가 같으면 비교할 수 없습니다.'], strategy:'같은 단위로 잰 들이 바로 비교하기', hint:'같은 컵으로 쟀으므로 컵 수를 비교해 보세요.', concept:'같은 단위로 재면 단위의 수가 많은 물건의 들이가 더 큽니다.', steps:[`같은 컵으로 ${a}컵과 ${b}컵입니다.`,`${b}이 ${a}보다 크므로 나 물통의 들이가 더 큽니다.`] });
});
const overlapLength = family('congruent-overlap', next => {
  const a=사이(next,3,40);
  return 지식({ ...common, tag:'congruence', prompt:`길이가 ${a} cm인 선분 위에 다른 선분을 놓았더니 두 끝점까지 완전히 겹쳐졌습니다. 다른 선분의 길이는 몇 cm일까요?`, answer:`${a} cm`, wrongs:[`${a+1} cm`,`${a-1} cm`,`${a+2} cm`], strategy:'완전히 겹쳐지는 길이 바로 확인하기', hint:'두 끝점까지 겹쳐지는 두 선분의 길이를 생각해 보세요.', concept:'완전히 겹쳐지는 두 선분의 길이는 같습니다.', steps:['두 끝점까지 완전히 겹쳐지므로 두 선분의 길이가 같습니다.',`다른 선분의 길이도 ${a} cm입니다.`] });
});
const equalChance = family('equal-chance-basic', next => {
  const n=사이(next,2,35);
  return 지식({ ...common, tag:'possibility', prompt:`주머니에 크기와 모양이 같은 흰 공 ${n}개와 검은 공 ${n}개가 있습니다. 잘 섞어 보지 않고 하나를 꺼낼 때 두 색이 나올 가능성을 바르게 비교한 것은 무엇일까요?`, answer:'두 색이 나올 가능성은 같습니다.', wrongs:['흰색이 나올 가능성이 더 큽니다.','검은색이 나올 가능성이 더 큽니다.','어느 색도 나올 수 없습니다.'], strategy:'같은 수의 공에서 가능성 바로 비교하기', hint:'두 색의 공 수가 같은지 먼저 확인하세요.', concept:'다른 조건이 같고 공의 수도 같으면 두 색이 나올 가능성은 같습니다.', steps:[`두 색의 공이 각각 ${n}개로 같습니다.`,'크기와 모양도 같으므로 두 색이 나올 가능성은 같습니다.'] });
});
const fractionBounds = family('fraction-decimal-two-bounds', next => {
  const n=사이(next,4,17), lo=((n-1)*5/100).toFixed(2), hi=((n+1)*5/100).toFixed(2);
  return 사고({ ...common, tag:'fractionCompare', prompt:`분모가 20인 분수 중에서 ${lo}보다 크고 ${hi}보다 작은 분수는 어느 것일까요?`, answer:`${n}/20`, wrongs:[`${n-1}/20`,`${n+1}/20`,`${n+2}/20`], strategy:'조건 함께 보기 · 분수와 소수의 두 경계 비교하기', hint:'분모를 100으로 바꾸고 양쪽 소수와 각각 비교해 보세요.', concept:'분모를 100으로 바꾸면 소수 둘째 자리까지의 수와 크기를 비교할 수 있습니다.', steps:[`${n}/20=${n*5}/100=${(n*5/100).toFixed(2)}입니다.`,`이 수는 ${lo}보다 크고 ${hi}보다 작습니다.`] });
});
const fractionOrder = family('fraction-decimal-order', next => {
  const n=사이(next,4,17), lo=((n*5-2)/100).toFixed(2), hi=((n*5+3)/100).toFixed(2);
  return 사고({ ...common, tag:'fractionCompare', prompt:`가: ${n}/20, 나: ${lo}, 다: ${hi}입니다. 세 수를 작은 것부터 차례로 놓은 것은 무엇일까요?`, answer:'나 → 가 → 다', wrongs:['가 → 나 → 다','다 → 가 → 나','나 → 다 → 가'], strategy:'조건 함께 보기 · 분수와 소수를 같은 기준으로 정렬하기', hint:'분수를 소수로 바꾸어 세 수를 같은 기준으로 비교해 보세요.', concept:'분수와 소수를 같은 형태로 나타내면 크기 순서를 비교할 수 있습니다.', steps:[`가의 ${n}/20은(는) ${(n*5/100).toFixed(2)}입니다.`,`${lo}, ${(n*5/100).toFixed(2)}, ${hi} 순서이므로 나 → 가 → 다입니다.`] });
});
const fractionError = family('fraction-decimal-error', next => {
  const n=사이(next,4,17), hundred=n*5, small=(hundred-1)/100;
  return 사고({ ...common, tag:'fractionCompare', prompt:`친구는 ${n}/20과(와) ${small.toFixed(2)}를 비교하며 "${n}이(가) ${hundred-1}보다 작으므로 분수가 더 작다"고 했습니다. 바르게 고친 설명은 무엇일까요?`, answer:`${n}/20=${hundred}/100이므로 분수가 더 큽니다.`, wrongs:[`${n}이(가) 작으므로 분수가 더 작습니다.`,'분수와 소수는 크기를 비교할 수 없습니다.','두 수는 항상 같습니다.'], strategy:'조건 함께 보기 · 서로 다른 기준을 비교한 오류 찾기', hint:'서로 다른 자리의 수를 바로 비교해도 되는지 생각해 보세요.', concept:'분수와 소수는 같은 크기의 단위로 나타낸 뒤 비교해야 합니다.', steps:[`${n}/20=${hundred}/100=${(hundred/100).toFixed(2)}입니다.`,`${(hundred/100).toFixed(2)}이(가) ${small.toFixed(2)}보다 크므로 분수가 더 큽니다.`] });
});
const mixedError = family('mixed-fraction-error', next => {
  const d=사이(next,2,9), w=사이(next,1,4), n=사이(next,1,d-1), total=w*d+n;
  return 사고({ ...common, tag:'fraction', prompt:`친구는 자연수 ${w}과(와) 진분수 ${n}/${d}로 이루어진 대분수를 가분수로 바꾸면서 자연수를 분자에 바로 더해 ${w+n}/${d}라고 했습니다. 잘못을 바르게 설명한 것은 무엇일까요?`, answer:`자연수 ${w}은(는) 1/${d}이(가) ${w*d}개이므로 모두 ${total}개인 ${total}/${d}입니다.`, wrongs:[`자연수를 분자에 바로 더한 ${w+n}/${d}이(가) 맞습니다.`,`분모에만 자연수를 더한 ${n}/${d+w}이(가) 맞습니다.`,`자연수 부분을 빼고 ${n}/${d}만 쓰면 됩니다.`], strategy:'단위분수의 개수로 잘못된 변환 설명하기', hint:'자연수 1을 단위분수 몇 개로 나타내는지 생각해 보세요.', concept:'자연수를 단위분수의 개수로 바꾸어 남은 진분수 조각과 함께 셉니다.', steps:[`1은 1/${d}이(가) ${d}개이므로 ${w}은(는) ${w*d}개입니다.`,`여기에 ${n}개를 더하면 ${total}개이므로 ${total}/${d}입니다.`] });
});
export const auditGrade3: 수준표 = { '3-1 6-2':{상:[equalParts]}, '3-1 6-3':{상:[fractionReason]}, '3-2 4-6':{상:[mixedError]}, '3-2 2-7':{하:[verifyDivision]}, '3-2 5-2':{하:[sameCup]} };
export const auditGrade5: 수준표 = { '5-1 4-7':{상:[fractionBounds,fractionOrder,fractionError]}, '5-2 3-2':{하:[overlapLength]}, '5-2 6-8':{하:[equalChance]} };
