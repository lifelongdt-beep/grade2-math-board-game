import type { CounterIcon } from '../../types';
import type { G5Family } from '../grade5/build';
import { 결로, 글오답, 둘, 뭉치, 사람들, 사이, 수문항, 하나 } from './common';

// ════════════════════════════════════════════════════════════════════
// 문제집을 늘리는 문항 뭉치(그림 세기, 모양, 몇백, 3~6학년)
// ════════════════════════════════════════════════════════════════════

const 셀것: Array<{ 이름: string; icon: CounterIcon; 단위: string }> = [
  { 이름: '사과', icon: 'apple', 단위: '개' },
  { 이름: '별', icon: 'star', 단위: '개' },
  { 이름: '꽃', icon: 'flower', 단위: '송이' },
  { 이름: '물고기', icon: 'fish', 단위: '마리' },
  { 이름: '공', icon: 'ball', 단위: '개' },
  { 이름: '자동차', icon: 'car', 단위: '대' },
  { 이름: '새', icon: 'bird', 단위: '마리' },
];

/** 그림을 보고 세기(1학년 1단원) */
export const 그림세기 = (최소: number, 최대: number): G5Family =>
  뭉치(`count-picture-${최소}-${최대}`, (next) => {
    const [가, 나] = 둘(next, 셀것);
    const n = 사이(next, 최소, 최대);
    const m = 사이(next, 1, 최대);
    const spec = 수문항(0, `그림에서 ${가.이름}은(는) 몇 ${가.단위}일까요?`, n, [m, n + 1, n - 1], {
      단위: 가.단위, tag: 'number', strategy: '하나씩 짚으며 세기', hint: '하나씩 짚으면서 하나, 둘, 셋 … 세어 보세요.',
      steps: [`${가.이름}을(를) 하나씩 세면 ${n}${가.단위}입니다.`], 아래: 0, 위: 9,
    });
    if (!spec) return null;
    return { ...spec, visual: { kind: 'counters', label: '셀 것', groups: [{ count: n, icon: 가.icon, name: 가.이름 }, { count: m, icon: 나.icon, name: 나.이름 }] } };
  });

/** 상자·둥근기둥·공 모양의 수 견주기(1학년 2단원) */
export const 모양견주기 = (평면: boolean): G5Family =>
  뭉치(`shape-compare-${평면 ? 'plane' : 'solid'}`, (next) => {
    const 이름들 = 평면 ? ['■ 모양', '▲ 모양', '● 모양'] : ['상자 모양', '둥근기둥 모양', '공 모양'];
    const 수 = 이름들.map(() => 사이(next, 1, 9));
    if (new Set(수).size < 3) return null;
    const 많이 = next(2) === 0;
    const 값 = 많이 ? Math.max(...수) : Math.min(...수);
    const 답 = 이름들[수.indexOf(값)];
    return 결로(1, {
      prompt: `${평면 ? '그림' : '교실'}에서 찾은 물건을 모양별로 세었더니 ${이름들.map((x, k) => `${x} ${수[k]}개`).join(', ')}였습니다. 가장 ${많이 ? '많은' : '적은'} 모양은 무엇일까요?`,
      answer: 답, wrongs: 글오답(답, 이름들.concat(['모두 같습니다'])), tag: 평면 ? 'shape' : 'solid', strategy: '모양별로 센 수 견주기',
      hint: '세 수를 하나씩 견주어 보세요.', steps: [`가장 ${많이 ? '큰' : '작은'} 수는 ${값}이므로 ${답}입니다.`],
    });
  });

/** 몇백(2-1 1단원) */
export const 몇백 = (): G5Family =>
  뭉치('hundreds', (next) => {
    const a = 사이(next, 1, 9);
    const 꼴 = next(3);
    if (꼴 === 0) return 수문항(0, `100이 ${a}개이면 얼마일까요?`, a * 100, [a * 10, a, a * 1000], { tag: 'placeValue', strategy: '몇백 알기', hint: '100이 2개이면 200이에요.', steps: [`100이 ${a}개이면 ${a * 100}입니다.`], 아래: 1 });
    if (꼴 === 1) return 수문항(0, `${a * 100}은(는) 100이 몇 개일까요?`, a, [a * 10, a * 100, a + 1], { 단위: '개', tag: 'placeValue', strategy: '몇백 알기', hint: '백의 자리 숫자를 보세요.', steps: [`${a * 100}은(는) 100이 ${a}개입니다.`], 아래: 1 });
    const 것 = 하나(next, [['색종이', '장', '묶음'], ['구슬', '개', '상자'], ['클립', '개', '상자']] as const);
    return 수문항(1, `${것[0]}이(가) 한 ${것[2]}에 100${것[1]}씩 들어 있습니다. ${a}${것[2]}에는 ${것[0]}이(가) 모두 몇 ${것[1]} 있을까요?`, a * 100, [a * 10, a + 100, (a + 1) * 100], {
      단위: 것[1], tag: 'placeValue', strategy: '100씩 묶음으로 몇백 알기', hint: '100씩 몇 묶음인지 보세요.', steps: [`100이 ${a}개이므로 ${a * 100}${것[1]}입니다.`], 아래: 1,
    });
  });

// ── 3~6학년 ─────────────────────────────────────────────────────────

/** 나눗셈의 몫을 곱셈으로 */
export const 몫곱셈으로 = (): G5Family =>
  뭉치('quotient-by-mul', (next) => {
    const b = 사이(next, 2, 9);
    const q = 사이(next, 2, 9);
    const a = b * q;
    return 수문항(0, `${a}÷${b}의 몫은 ${b}×□=${a}에서 구할 수 있습니다. ${a}÷${b}의 몫은 얼마일까요?`, q, [a - b, b, q + 1, q - 1], {
      tag: 'division', strategy: '곱셈구구로 나눗셈의 몫 구하기', hint: `${b}단 곱셈구구에서 ${a}을(를) 찾아요.`, steps: [`${b}×${q}=${a}이므로 몫은 ${q}입니다.`], 아래: 1,
    });
  });

/** 원의 반지름과 지름 */
export const 반지름지름 = (): G5Family =>
  뭉치('radius-diameter', (next) => {
    const r = 사이(next, 2, 20);
    if (next(2) === 0) return 수문항(0, `반지름이 ${r} cm인 원의 지름은 몇 cm일까요?`, 2 * r, [r, r + 2, r * 3], { 단위: ' cm', tag: 'shape', strategy: '지름은 반지름의 2배', hint: '지름은 반지름의 2배예요.', steps: [`${r}×2=${2 * r}이므로 ${2 * r} cm입니다.`], 아래: 1 });
    return 수문항(0, `지름이 ${2 * r} cm인 원의 반지름은 몇 cm일까요?`, r, [2 * r, 4 * r, r + 1], { 단위: ' cm', tag: 'shape', strategy: '반지름은 지름의 반', hint: '반지름은 지름의 반이에요.', steps: [`${2 * r}÷2=${r}이므로 ${r} cm입니다.`], 아래: 1 });
  });

/** 어림한 들이·무게와 실제의 차이 */
export const 들이무게어림 = (무게: boolean): G5Family =>
  뭉치(`estimate-${무게 ? 'weight' : 'volume'}`, (next) => {
    const 단위 = 무게 ? 'g' : 'mL';
    const 실제 = 사이(next, 2, 19) * 100;
    const 어림 = 실제 + (next(2) ? 1 : -1) * 사이(next, 1, 3) * 100;
    const [p, q] = 둘(next, 사람들);
    const 다른 = 실제 + (next(2) ? 1 : -1) * 사이(next, 1, 3) * 100 + 50;
    const 가 = Math.abs(어림 - 실제);
    const 나 = Math.abs(다른 - 실제);
    if (가 === 나 || 어림 <= 0 || 다른 <= 0) return null;
    const 답 = 가 < 나 ? p : q;
    const 물건 = 무게 ? '사과 한 봉지의 무게' : '물병에 든 물의 양';
    return 결로(1, {
      prompt: `${물건}을(를) ${p}은(는) 약 ${어림}${단위}, ${q}은(는) 약 ${다른}${단위}(으)로 어림했습니다. 실제로 재어 보니 ${실제}${단위}${무게 ? '이었' : '였'}습니다. 더 가깝게 어림한 사람은 누구일까요?`,
      answer: 답, wrongs: 글오답(답, [p, q, '두 사람이 똑같이 가깝습니다', '알 수 없습니다']),
      tag: 'measurement', strategy: `어림한 ${무게 ? '무게' : '들이'}와 잰 ${무게 ? '무게' : '들이'} 견주기`, hint: '어림한 값과 실제 값의 차가 작은 쪽이 더 가까워요.',
      steps: [`${p}: ${가}${단위} 차이, ${q}: ${나}${단위} 차이`, `그러므로 ${답}입니다.`],
    });
  });

const 다각형이름 = ['', '', '', '삼각형', '사각형', '오각형', '육각형', '칠각형', '팔각형'];

/** 정다각형의 둘레와 한 변 */
export const 정다각형둘레 = (변들: number[]): G5Family =>
  뭉치(`regular-perimeter-${변들.join('')}`, (next) => {
    const n = 하나(next, 변들);
    const a = 사이(next, 2, 15);
    const 이름 = `정${다각형이름[n]}`;
    if (next(2) === 0) return 수문항(0, `한 변이 ${a} cm인 ${이름}의 모든 변의 길이의 합은 몇 cm일까요?`, n * a, [(n - 1) * a, a + n, (n + 1) * a], { 단위: ' cm', tag: 'shape', strategy: '정다각형의 둘레', hint: `${이름}의 변은 ${n}개이고 길이가 모두 같아요.`, steps: [`${a}×${n}=${n * a}이므로 ${n * a} cm입니다.`], 아래: 1 });
    return 수문항(1, `모든 변의 길이의 합이 ${n * a} cm인 ${이름}의 한 변은 몇 cm일까요?`, a, [n * a - n, a + 1, Math.floor((n * a) / (n + 1)) || a + 2], { 단위: ' cm', tag: 'shape', strategy: '둘레로 정다각형의 한 변 구하기', hint: `변이 ${n}개이고 모두 같아요.`, steps: [`${n * a}÷${n}=${a}이므로 ${a} cm입니다.`], 아래: 1 });
  });

/** 올림·버림·반올림한 결과로 처음 수의 범위(사고) */
export const 어림거꾸로수 = (방법: '올림' | '버림' | '반올림'): G5Family =>
  뭉치(`round-back-${방법}`, (next) => {
    const 자리 = 하나(next, [10, 100]);
    const 말 = 자리 === 10 ? '십의 자리까지' : '백의 자리까지';
    const 결과 = 사이(next, 2, 9) * 자리 * (자리 === 10 ? 사이(next, 1, 9) : 1);
    const 작은 = 방법 === '올림' ? 결과 - 자리 + 1 : 방법 === '버림' ? 결과 : 결과 - 자리 / 2;
    const 큰 = 방법 === '올림' ? 결과 : 방법 === '버림' ? 결과 + 자리 - 1 : 결과 + 자리 / 2 - 1;
    const 가장작은 = next(2) === 0;
    const v = 가장작은 ? 작은 : 큰;
    return 수문항(2, `어떤 자연수를 ${방법}하여 ${말} 나타내었더니 ${결과}이(가) 되었습니다. 어떤 자연수가 될 수 있는 수 가운데 가장 ${가장작은 ? '작은' : '큰'} 수는 얼마일까요?`, v, [결과, 가장작은 ? 작은 - 1 : 큰 + 1, 가장작은 ? 결과 - 자리 : 결과 + 자리], {
      tag: 'number', strategy: `${방법}한 수에서 처음 수의 범위 거꾸로 찾기`, hint: `${방법}하여 ${결과}이(가) 되는 수를 수직선에 떠올려 보세요.`,
      steps: [`${방법}하여 ${말} ${결과}이(가) 되는 자연수는 ${작은}부터 ${큰}까지입니다.`, `그러므로 가장 ${가장작은 ? '작은' : '큰'} 수는 ${v}입니다.`], 아래: 1,
    });
  });

/** 원주와 지름(원주율 3.14) */
export const 원주지름 = (): G5Family =>
  뭉치('circumference', (next) => {
    const d = 사이(next, 2, 30);
    const c = Math.round(d * 314) / 100;
    const 글 = (x: number) => String(Math.round(x * 100) / 100);
    if (next(2) === 0) {
      return 결로(0, {
        prompt: `지름이 ${d} cm인 원의 원주는 몇 cm일까요? (원주율: 3.14)`, answer: `${글(c)} cm`,
        wrongs: [`${글(d * 3)} cm`, `${글(d * 3.14 * 2)} cm`, `${글((d / 2) * 3.14)} cm`].filter((w) => w !== `${글(c)} cm`),
        tag: 'shape', strategy: '지름으로 원주 구하기', hint: '원주는 지름×원주율이에요.', steps: [`${d}×3.14=${글(c)}이므로 ${글(c)} cm입니다.`],
      });
    }
    return 결로(1, {
      prompt: `원주가 ${글(c)} cm인 원의 지름은 몇 cm일까요? (원주율: 3.14)`, answer: `${d} cm`,
      wrongs: [`${d * 2} cm`, `${글(d / 2)} cm`, `${d + 1} cm`].filter((w) => w !== `${d} cm`),
      tag: 'shape', strategy: '원주로 지름 구하기', hint: '지름은 원주÷원주율이에요.', steps: [`${글(c)}÷3.14=${d}이므로 ${d} cm입니다.`],
    });
  });

/** 원의 넓이(원주율 3.14) */
export const 원넓이 = (): G5Family =>
  뭉치('circle-area', (next) => {
    const r = 사이(next, 2, 20);
    const 넓이 = Math.round(r * r * 314) / 100;
    const 글 = (x: number) => String(Math.round(x * 100) / 100);
    const 지름으로 = next(2) === 0;
    return 결로(지름으로 ? 1 : 0, {
      prompt: `${지름으로 ? `지름이 ${2 * r}` : `반지름이 ${r}`} cm인 원의 넓이는 몇 cm²일까요? (원주율: 3.14)`, answer: `${글(넓이)} cm²`,
      wrongs: [`${글(r * 2 * 3.14)} cm²`, `${글(4 * r * r * 3.14)} cm²`, `${글(r * r * 3)} cm²`].filter((w) => w !== `${글(넓이)} cm²`),
      tag: 'area', strategy: 지름으로 ? '지름으로 원의 넓이 구하기' : '원의 넓이 구하기', hint: '원의 넓이는 반지름×반지름×원주율이에요.',
      steps: [...(지름으로 ? [`반지름은 ${2 * r}÷2=${r}(cm)입니다.`] : []), `${r}×${r}×3.14=${글(넓이)}이므로 ${글(넓이)} cm²입니다.`],
    });
  });

/** 구의 반지름·지름, 원뿔의 높이·모선 */
export const 구원뿔 = (원뿔: boolean): G5Family =>
  뭉치(`sphere-cone-${원뿔 ? 'cone' : 'sphere'}`, (next) => {
    const r = 사이(next, 2, 15);
    if (!원뿔) {
      if (next(2) === 0) return 수문항(0, `반지름이 ${r} cm인 구의 지름은 몇 cm일까요?`, 2 * r, [r, r * 3, r + 2], { 단위: ' cm', tag: 'solid', strategy: '구의 반지름과 지름', hint: '구의 지름은 반지름의 2배예요.', steps: [`${r}×2=${2 * r}이므로 ${2 * r} cm입니다.`], 아래: 1 });
      return 수문항(1, `반원 모양의 종이를 지름을 기준으로 한 바퀴 돌려 구를 만들었습니다. 반원의 지름이 ${2 * r} cm이면 구의 반지름은 몇 cm일까요?`, r, [2 * r, 4 * r, r + 1], { 단위: ' cm', tag: 'solid', strategy: '돌리기 전의 반원과 구 잇기', hint: '반원의 반지름이 구의 반지름이 돼요.', steps: [`반원의 반지름은 ${2 * r}÷2=${r}(cm)이고, 이것이 구의 반지름입니다.`], 아래: 1 });
    }
    const 모선 = r + 사이(next, 1, 8);
    if (next(2) === 0) return 수문항(1, `밑면의 반지름이 ${r} cm, 모선의 길이가 ${모선} cm인 원뿔을 앞에서 보면 이등변삼각형 모양입니다. 이 삼각형의 밑변은 몇 cm일까요?`, 2 * r, [r, 모선, 2 * 모선], { 단위: ' cm', tag: 'solid', strategy: '원뿔을 앞에서 본 모양 알기', hint: '앞에서 본 삼각형의 밑변은 밑면인 원의 지름이에요.', steps: [`밑변은 밑면의 지름이므로 ${r}×2=${2 * r}(cm)입니다.`], 아래: 1 });
    return 수문항(1, `밑면의 반지름이 ${r} cm, 모선의 길이가 ${모선} cm인 원뿔을 앞에서 보면 이등변삼각형 모양입니다. 이 삼각형의 길이가 같은 두 변은 각각 몇 cm일까요?`, 모선, [r, 2 * r, 2 * 모선], { 단위: ' cm', tag: 'solid', strategy: '원뿔을 앞에서 본 모양 알기', hint: '앞에서 본 삼각형의 길이가 같은 두 변은 원뿔의 모선이에요.', steps: [`길이가 같은 두 변은 모선이므로 ${모선} cm입니다.`], 아래: 1 });
  });

/** 정육면체의 모서리 길이의 합 */
export const 정육면체모서리 = (): G5Family =>
  뭉치('cube-edges', (next) => {
    const a = 사이(next, 2, 15);
    if (next(2) === 0) return 수문항(1, `한 모서리가 ${a} cm인 정육면체의 모든 모서리의 길이의 합은 몇 cm일까요?`, 12 * a, [6 * a, 8 * a, 4 * a], { 단위: ' cm', tag: 'solid', strategy: '정육면체의 모서리는 12개', hint: '정육면체의 모서리는 12개이고 길이가 모두 같아요.', steps: [`${a}×12=${12 * a}이므로 ${12 * a} cm입니다.`], 아래: 1 });
    return 수문항(1, `모든 모서리의 길이의 합이 ${12 * a} cm인 정육면체의 한 모서리는 몇 cm일까요?`, a, [2 * a, Math.round((12 * a) / 6), a + 1], { 단위: ' cm', tag: 'solid', strategy: '모서리 길이의 합으로 한 모서리 구하기', hint: '정육면체의 모서리는 12개예요.', steps: [`${12 * a}÷12=${a}이므로 ${a} cm입니다.`], 아래: 1 });
  });

// ── 둘째 묶음: 아직 모자란 차시에 더하는 문항 ──────────────────────────

/** 그림의 두 가지를 세어 견주기(1학년 1단원, 적용) */
export const 그림둘견주기 = (최대: number): G5Family =>
  뭉치(`count-two-compare-${최대}`, (next) => {
    const [가, 나] = 둘(next, 셀것);
    const n = 사이(next, 1, 최대);
    const m = 사이(next, 1, 최대);
    if (n === m) return null;
    const 많이 = next(2) === 0;
    const 답 = (n > m) === 많이 ? 가.이름 : 나.이름;
    return {
      ...결로(1, {
        prompt: `그림에서 ${가.이름}과(와) ${나.이름}을(를) 세어 보세요. 어느 것이 더 ${많이 ? '많을' : '적을'}까요?`,
        answer: 답, wrongs: 글오답(답, [가.이름, 나.이름, '둘이 똑같습니다', '알 수 없습니다']),
        tag: 'number', strategy: '두 가지를 세어 견주기', hint: '하나씩 짝을 지어 보세요. 짝이 없이 남는 쪽이 더 많아요.',
        steps: [`${가.이름}은(는) ${n}${가.단위}, ${나.이름}은(는) ${m}${나.단위}입니다.`, `그러므로 더 ${많이 ? '많은' : '적은'} 것은 ${답}입니다.`],
      }),
      visual: { kind: 'counters', label: '셀 것', groups: [{ count: n, icon: 가.icon, name: 가.이름 }, { count: m, icon: 나.icon, name: 나.이름 }] },
    };
  });

/** 어떤 수보다 k만큼 더 큰(작은) 수가 n — 어떤 수(사고) */
export const 만큼거꾸로 = (보폭: number, 최소: number, 최대: number): G5Family =>
  뭉치(`k-more-back-${보폭}-${최대}`, (next) => {
    const x = 사이(next, 최소, 최대);
    const 큰 = next(2) === 0;
    const n = 큰 ? x + 보폭 : x - 보폭;
    if (n < 0 || n > 최대) return null;
    return 수문항(2, `어떤 수보다 ${보폭}만큼 더 ${큰 ? '큰' : '작은'} 수는 ${n}입니다. 어떤 수는 얼마일까요?`, x, [큰 ? n + 보폭 : n - 보폭, n, x + (큰 ? -2 : 2) * 보폭], {
      tag: 'number', strategy: '거꾸로 생각하여 어떤 수 구하기', hint: `${보폭}만큼 더 ${큰 ? '큰' : '작은'} 수가 ${n}이면, 어떤 수는 ${n}보다 ${보폭}만큼 더 ${큰 ? '작아요' : '커요'}.`,
      steps: [`${n}보다 ${보폭}만큼 더 ${큰 ? '작은' : '큰'} 수를 구합니다.`, `그러므로 어떤 수는 ${x}입니다.`], 아래: 0, 위: 최대,
    });
  });

const 셀물건 = [['구슬', '개'], ['사탕', '개'], ['딱지', '장'], ['스티커', '장'], ['연필', '자루'], ['귤', '개']] as const;

/** a와 어떤 수를 모으면 n — 상황 이야기(사고) */
export const 모으기거꾸로 = (최대: number, 최소 = 2): G5Family =>
  뭉치(`gather-back-${최대}-${최소}`, (next) => {
    const n = 사이(next, 최소, 최대);
    const a = 사이(next, 1, n - 1);
    const [이름, 단위] = 하나(next, 셀물건);
    const [p, q] = 둘(next, 사람들);
    return 수문항(2, `${p}의 ${이름}과(와) ${q}의 ${이름}을(를) 모았더니 ${n}${단위}이(가) 되었습니다. ${p}의 ${이름}이(가) ${a}${단위}이면 ${q}의 ${이름}은(는) 몇 ${단위}일까요?`, n - a, [n, a, n - a + 1], {
      단위, tag: 'number', strategy: '모은 수에서 거꾸로 한 부분 구하기', hint: `${n}을(를) ${a}과(와) 몇으로 가를 수 있는지 생각해요.`,
      steps: [`${n}은(는) ${a}과(와) ${n - a}(으)로 가를 수 있습니다.`, `그러므로 ${n - a}${단위}입니다.`], 아래: 0, 위: 최대,
    });
  });

/** 10이 되려면 몇 개 더(적용) */
export const 십채우기 = (): G5Family =>
  뭉치('fill-ten', (next) => {
    const a = 사이(next, 1, 9);
    const [이름, 단위] = 하나(next, 셀물건);
    const 누구 = 하나(next, 사람들);
    return 수문항(1, `${누구}은(는) ${이름}을(를) ${a}${단위} 가지고 있습니다. 10${단위}이(가) 되려면 몇 ${단위} 더 있어야 할까요?`, 10 - a, [a, 10 + a > 19 ? 9 : 10 - a + 1, 10], {
      단위, tag: 'number', strategy: '10이 되려면 몇이 더 있어야 하는지 알기', hint: `${a}에서 10까지 이어 세어 보세요.`,
      steps: [`${a}과(와) ${10 - a}을(를) 모으면 10입니다.`, `그러므로 ${10 - a}${단위} 더 있어야 합니다.`], 아래: 0, 위: 19,
    });
  });

/** 10개씩 묶음과 낱개로 된 물건 세기(적용) */
export const 묶음낱개이야기 = (최대묶음: number): G5Family =>
  뭉치(`bundle-ones-story-${최대묶음}`, (next) => {
    const t = 사이(next, 1, 최대묶음);
    const o = 사이(next, 1, 9);
    const 것 = 하나(next, [['달걀', '개', '판'], ['연필', '자루', '묶음'], ['색종이', '장', '묶음'], ['구슬', '개', '봉지'], ['사탕', '개', '봉지']] as const);
    const v = t * 10 + o;
    return 수문항(1, `${것[0]}이(가) 10${것[1]}씩 ${t}${것[2]}과(와) 낱개 ${o}${것[1]} 있습니다. ${것[0]}은(는) 모두 몇 ${것[1]}일까요?`, v, [t + o, o * 10 + t, v + 10], {
      단위: 것[1], tag: 'placeValue', strategy: '10개씩 묶음과 낱개로 세기', hint: '10개씩 묶음의 수를 먼저 보고, 낱개를 더해요.',
      steps: [`10개씩 묶음 ${t}개는 ${t * 10}입니다.`, `${t * 10}과(와) 낱개 ${o}을(를) 합하면 ${v}입니다.`], 아래: 1,
    });
  });

/** 같은 수를 여러 번 더해 세는 묶음 이야기(곱셈 기호를 배우기 전) */
export const 묶어세기이야기 = (): G5Family =>
  뭉치('bundle-story-add', (next) => {
    const a = 사이(next, 2, 9);
    const b = 사이(next, 2, 6);
    const 것 = 하나(next, 셀물건);
    const v = a * b;
    return 수문항(1, `${것[0]}을(를) ${a}${것[1]}씩 ${b}묶음으로 묶었습니다. ${것[0]}은(는) 모두 몇 ${것[1]}일까요?`, v, [a + b, v + a, v - a], {
      단위: 것[1], tag: 'multiplication', strategy: '묶어 세기', hint: `${a}씩 ${b}번 뛰어 세어 보세요.`,
      steps: [`${Array.from({ length: b }, () => a).join('+')}=${v}`, `그러므로 ${v}${것[1]}입니다.`], 아래: 1,
    });
  });

/** 곱셈표에서 조건에 맞는 칸의 수(사고) */
export const 곱셈표세기 = (): G5Family =>
  뭉치('times-table-count', (next) => {
    const a = 사이(next, 2, 9);
    const c = 사이(next, a + 1, a * 8);
    const v = Array.from({ length: 9 }, (_, k) => a * (k + 1)).filter((x) => x > c).length;
    if (v === 0) return null;
    return 수문항(2, `곱셈표의 ${a}단(${a}×1부터 ${a}×9까지)에서 ${c}보다 큰 수는 모두 몇 개일까요?`, v, [9 - v, v + 1, v - 1], {
      단위: '개', tag: 'multiplication', strategy: '곱셈표에서 조건에 맞는 수 세기', hint: `${a}단을 차례로 쓰고 ${c}보다 큰 수를 세어 보세요.`,
      steps: [`${a}단: ${Array.from({ length: 9 }, (_, k) => a * (k + 1)).join(', ')}`, `${c}보다 큰 수는 ${v}개입니다.`], 아래: 1,
    });
  });

/** 덧셈표에서 합이 n인 칸의 수(사고) */
export const 덧셈표세기 = (): G5Family =>
  뭉치('add-table-count', (next) => {
    const n = 사이(next, 3, 17);
    const v = Array.from({ length: 9 }, (_, a) => a + 1).filter((a) => n - a >= 1 && n - a <= 9).length;
    return 수문항(2, `가로줄과 세로줄에 1부터 9까지 쓴 덧셈표에서 합이 ${n}인 칸은 모두 몇 개일까요?`, v, [v + 1, v - 1, n], {
      단위: '개', tag: 'pattern', strategy: '덧셈표에서 같은 수가 놓인 규칙 찾기', hint: `더해서 ${n}이(가) 되는 두 수를 빠짐없이 찾아보세요.`,
      steps: [`더해서 ${n}이(가) 되는 (가로줄, 세로줄)은 ${Array.from({ length: 9 }, (_, a) => a + 1).filter((a) => n - a >= 1 && n - a <= 9).map((a) => `(${a}, ${n - a})`).join(', ')}입니다.`, `모두 ${v}개입니다.`], 아래: 1,
    });
  });

/** m와 cm로 나타낸 길이 견주기(사고) */
export const 길이견주기 = (): G5Family =>
  뭉치('compare-m-cm', (next) => {
    const m = 사이(next, 1, 8);
    const cm = 사이(next, 1, 99);
    const 다른 = m * 100 + cm + (next(2) ? 1 : -1) * 사이(next, 1, 30);
    if (다른 <= 100 || 다른 === m * 100 + cm || 다른 >= 1000) return null;
    const [p, q] = 둘(next, ['빨간 끈', '파란 끈', '노란 끈', '초록 끈']);
    const 답 = m * 100 + cm > 다른 ? p : q;
    return 결로(2, {
      prompt: `${p}은(는) ${m}m ${cm}cm이고, ${q}은(는) ${다른}cm입니다. 어느 끈이 더 길까요?`, answer: 답, wrongs: 글오답(답, [p, q, '두 끈의 길이가 같습니다', '알 수 없습니다']),
      tag: 'measurement', strategy: '단위를 같게 하여 길이 견주기', hint: '1m는 100cm예요. 같은 단위로 바꾸어 견주어요.',
      steps: [`${m}m ${cm}cm=${m * 100 + cm}cm입니다.`, `${m * 100 + cm}cm와 ${다른}cm를 견주면 ${답}이(가) 더 깁니다.`],
    });
  });

/** 색깔이 되풀이되는 규칙(적용) */
export const 색반복 = (): G5Family =>
  뭉치('repeat-color', (next) => {
    const 색 = 하나(next, [['빨강', '파랑'], ['빨강', '파랑', '파랑'], ['노랑', '초록', '보라'], ['초록', '초록', '노랑'], ['파랑', '빨강', '노랑', '빨강']]);
    const n = 사이(next, 색.length + 1, 10);
    const 답 = 색[(n - 1) % 색.length];
    const 보인 = Array.from({ length: 색.length * 2 }, (_, k) => 색[k % 색.length]).join(', ');
    return 결로(1, {
      prompt: `구슬을 ${보인} … 차례로 되풀이하여 꿰었습니다. ${['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'][n]} 구슬은 무슨 색일까요?`,
      answer: 답, wrongs: 글오답(답, ['빨강', '파랑', '노랑', '초록', '보라']), tag: 'pattern', strategy: '되풀이되는 색의 규칙 찾기',
      hint: `${색.length}개가 한 묶음으로 되풀이돼요.`, steps: [`${색.join(', ')}이(가) 되풀이됩니다.`, `그러므로 ${답}입니다.`],
    });
  });

/** 분수로 나타내기(먹은 양, 남은 양) */
export const 분수로 = (): G5Family =>
  뭉치('as-fraction', (next) => {
    const n = 사이(next, 3, 10);
    const k = 사이(next, 1, n - 1);
    const 것 = 하나(next, ['피자', '케이크', '색 테이프', '떡', '종이']);
    const 남은 = next(2) === 0;
    const 답 = 남은 ? `${n - k}/${n}` : `${k}/${n}`;
    return 결로(1, {
      prompt: `${것}을(를) 똑같이 ${n}조각으로 나누어 ${k}조각을 ${것 === '종이' || 것 === '색 테이프' ? '썼' : '먹었'}습니다. ${남은 ? '남은' : `${것 === '종이' || 것 === '색 테이프' ? '쓴' : '먹은'}`} 양은 전체의 얼마일까요?`,
      answer: 답, wrongs: 글오답(답, [남은 ? `${k}/${n}` : `${n - k}/${n}`, `${n}/${k}`, `${k}/${n - k}`, `1/${n}`]),
      tag: 'fraction', strategy: '전체와 부분을 분수로 나타내기', hint: `전체를 똑같이 ${n}(으)로 나눈 것 가운데 몇 조각인지 보세요.`,
      steps: [`${남은 ? `남은 조각은 ${n}-${k}=${n - k}조각` : `${k}조각`}입니다.`, `그러므로 전체의 ${답}입니다.`], sameValueOk: true, minusIsOperator: true,
    });
  });

/** cm·mm, km·m 바꾸기 */
export const 단위바꾸기 = (): G5Family =>
  뭉치('mm-km', (next) => {
    if (next(2) === 0) {
      const cm = 사이(next, 1, 20);
      const mm = 사이(next, 1, 9);
      return 수문항(0, `${cm} cm ${mm} mm는 몇 mm일까요?`, cm * 10 + mm, [cm + mm, cm * 100 + mm, cm * 10 + mm + 10], { 단위: ' mm', tag: 'measurement', strategy: '1 cm는 10 mm', hint: '1 cm는 10 mm예요.', steps: [`${cm} cm는 ${cm * 10} mm입니다.`, `${cm * 10}+${mm}=${cm * 10 + mm}이므로 ${cm * 10 + mm} mm입니다.`], 아래: 1 });
    }
    const km = 사이(next, 1, 9);
    const m = 사이(next, 1, 999);
    return 수문항(0, `${km} km ${m} m는 몇 m일까요?`, km * 1000 + m, [km * 100 + m, km + m, km * 10000 + m], { 단위: ' m', tag: 'measurement', strategy: '1 km는 1000 m', hint: '1 km는 1000 m예요.', steps: [`${km} km는 ${km * 1000} m입니다.`, `${km * 1000}+${m}=${km * 1000 + m}이므로 ${km * 1000 + m} m입니다.`], 아래: 1 });
  });

/** 나눗셈 바로 계산 */
export const 나눗셈계산 = (몫범위: [number, number], 제수범위: [number, number], 몇십 = false): G5Family =>
  뭉치(`div-${몫범위.join('-')}-${제수범위.join('-')}-${몇십 ? 10 : 1}`, (next) => {
    const b = 사이(next, ...제수범위);
    // (몇십)÷(몇)은 내림이 없도록 십의 자리 숫자가 나누는 수로 나누어떨어지게 합니다.
    const q = 사이(next, ...몫범위) * (몇십 ? 10 : 1);
    if (몇십 && b * q >= 100) return null;
    const a = b * q;
    return 수문항(0, `${a}÷${b}은(는) 얼마일까요?`, q, [q + 1, q - 1, a - b, q * 10], { tag: 'division', strategy: '나눗셈하기', hint: `${b}에 무엇을 곱하면 ${a}이(가) 되는지 생각해요.`, steps: [`${b}×${q}=${a}이므로 ${a}÷${b}=${q}입니다.`], 아래: 1 });
  });

/** 컴퍼스를 벌린 길이와 원 */
export const 컴퍼스원 = (): G5Family =>
  뭉치('compass-circle', (next) => {
    const r = 사이(next, 2, 15);
    return 수문항(1, `컴퍼스를 ${r} cm만큼 벌려서 원을 그렸습니다. 그린 원의 지름은 몇 cm일까요?`, 2 * r, [r, r + 2, 3 * r], { 단위: ' cm', tag: 'shape', strategy: '컴퍼스를 벌린 길이는 반지름', hint: '컴퍼스를 벌린 길이가 반지름이에요.', steps: [`반지름이 ${r} cm이므로 지름은 ${r}×2=${2 * r}(cm)입니다.`], 아래: 1 });
  });

/** 각도의 합과 차, 직각과 견주기 */
export const 각도계산 = (거꾸로: boolean): G5Family =>
  뭉치(`angle-calc-${거꾸로 ? 'back' : 'plain'}`, (next) => {
    const a = 사이(next, 2, 17) * 5;
    const b = 사이(next, 2, 17) * 5;
    if (거꾸로) {
      const 합 = a + b;
      return 수문항(2, `두 각의 크기의 합이 ${합}°입니다. 한 각이 ${a}°이면 다른 한 각은 몇 도일까요?`, b, [합 + a, a, 180 - b], { 단위: '°', tag: 'shape', strategy: '각도의 합에서 거꾸로 한 각 구하기', hint: '합에서 아는 각을 빼요.', steps: [`${합}°-${a}°=${b}°입니다.`], 아래: 1, 빼기: true });
    }
    const 더 = next(2) === 0;
    if (!더 && a <= b) return null;
    const v = 더 ? a + b : a - b;
    return 수문항(0, `${a}°${더 ? '+' : '-'}${b}°는 몇 도일까요?`, v, [더 ? Math.abs(a - b) : a + b, v + 10, v - 10], { 단위: '°', tag: 'shape', strategy: `각도의 ${더 ? '합' : '차'}`, hint: '자연수의 덧셈, 뺄셈과 같이 계산해요.', steps: [`${a}${더 ? '+' : '-'}${b}=${v}이므로 ${v}°입니다.`], 아래: 1, 빼기: true });
  });

/** 예각·둔각 가리기 */
export const 예각둔각 = (): G5Family =>
  뭉치('acute-obtuse', (next) => {
    const a = 사이(next, 1, 35) * 5;
    if (a === 90 || a === 180) return null;
    const 답 = a < 90 ? '예각' : '둔각';
    return 결로(0, {
      prompt: `${a}°인 각은 예각, 직각, 둔각 가운데 어느 것일까요?`, answer: 답, wrongs: 글오답(답, ['예각', '직각', '둔각', '평각']),
      tag: 'shape', strategy: '각의 크기로 예각과 둔각 가리기', hint: '0°보다 크고 직각보다 작으면 예각, 직각보다 크고 180°보다 작으면 둔각이에요.', steps: [`${a}°는 직각(90°)보다 ${a < 90 ? '작으므로 예각' : '크므로 둔각'}입니다.`],
    });
  });

const 최대공약 = (a: number, b: number): number => (b ? 최대공약(b, a % b) : a);

/** 최대공약수·최소공배수를 쓰는 생활 문제(사고) */
export const 공약배수생활 = (최소공배수로: boolean): G5Family =>
  뭉치(`gcd-lcm-life-${최소공배수로 ? 'lcm' : 'gcd'}`, (next) => {
    const g = 사이(next, 2, 9);
    const x = 사이(next, 2, 7);
    const y = 사이(next, 2, 7);
    if (x === y || 최대공약(x, y) !== 1) return null;
    const a = g * x;
    const b = g * y;
    if (!최소공배수로) {
      const [p, q] = 하나(next, [['구슬', '단추'], ['사과', '배'], ['쿠키', '초콜릿'], ['사탕', '젤리']]);
      return 수문항(2, `${p} ${a}개와 ${q} ${b}개를 남김없이 될 수 있는 대로 많은 사람에게 똑같이 나누어 주려고 합니다. 몇 명에게 나누어 줄 수 있을까요?`, g, [a * b, Math.min(a, b), g * 2, 1].filter((v) => v !== g), { 단위: '명', tag: 'divisor', strategy: '최대공약수를 생활 문제에 쓰기', hint: '두 수를 모두 나누어떨어지게 하는 가장 큰 수를 찾아요.', steps: [`${a}와 ${b}의 최대공약수는 ${g}입니다.`, `그러므로 ${g}명입니다.`], 아래: 1 });
    }
    const l = g * x * y;
    if (l > 120) return null;
    return 수문항(2, `가 버스는 ${a}분마다, 나 버스는 ${b}분마다 출발합니다. 두 버스가 오전 9시에 함께 출발했다면, 다음에 처음으로 함께 출발하는 것은 몇 분 뒤일까요?`, l, [a * b === l ? l + g : a * b, a + b, g], { 단위: '분', tag: 'divisor', strategy: '최소공배수를 생활 문제에 쓰기', hint: '두 수의 공배수 가운데 가장 작은 수를 찾아요.', steps: [`${a}와 ${b}의 최소공배수는 ${l}입니다.`, `그러므로 ${l}분 뒤입니다.`], 아래: 1 });
  });

/** 크기가 같은 분수 */
export const 같은분수 = (): G5Family =>
  뭉치('equal-fraction', (next) => {
    const d = 사이(next, 2, 9);
    const n = 사이(next, 1, d - 1);
    if (최대공약(n, d) !== 1) return null;
    const k = 사이(next, 2, 6);
    const 답 = `${n * k}/${d * k}`;
    return 결로(0, {
      prompt: `${n}/${d}과(와) 크기가 같은 분수 가운데 분모가 ${d * k}인 분수는 무엇일까요?`, answer: 답,
      wrongs: 글오답(답, [`${n + k}/${d * k}`, `${n * k}/${d + k}`, `${n}/${d * k}`, `${n * k + 1}/${d * k}`]), tag: 'fraction', strategy: '분모와 분자에 같은 수를 곱하여 크기가 같은 분수 만들기',
      hint: `분모가 ${d}에서 ${d * k}이(가) 되려면 몇을 곱해야 하는지 보세요.`, steps: [`분모와 분자에 ${k}을(를) 곱하면 ${답}입니다.`], sameValueOk: true,
    });
  });

/** 넓이 단위 바꾸기 */
export const 넓이단위 = (): G5Family =>
  뭉치('area-unit', (next) => {
    const a = 사이(next, 2, 9);
    if (next(2) === 0) return 수문항(0, `${a} m²는 몇 cm²일까요?`, a * 10000, [a * 100, a * 1000, a * 100000], { 단위: ' cm²', tag: 'area', strategy: '1 m²는 10000 cm²', hint: '1 m²는 가로, 세로가 100 cm씩이므로 10000 cm²예요.', steps: [`${a}×10000=${a * 10000}이므로 ${a * 10000} cm²입니다.`], 아래: 1 });
    return 수문항(0, `${a} km²는 몇 m²일까요?`, a * 1000000, [a * 1000, a * 10000, a * 100000], { 단위: ' m²', tag: 'area', strategy: '1 km²는 1000000 m²', hint: '1 km²는 가로, 세로가 1000 m씩이에요.', steps: [`${a}×1000000=${a * 1000000}이므로 ${a * 1000000} m²입니다.`], 아래: 1 });
  });
