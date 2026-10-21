import { describe, expect, it } from 'vitest';
import type { G5Family, G5Spec } from '../grade5/build';
import {
  각기둥각뿔, 곱셈으로몫, 구문제, 덧셈표규칙, 두양비교, 몇십나누기이야기, 모양조각, 범위생활, 분수소수비교, 삼각형사고, 알맞은그래프, 원넓이더, 원주더, 정육면체더,
  칠교모양, 하나더이야기,
} from './thin';

// ════════════════════════════════════════════════════════════════════
// 셋째 묶음(thin.ts)의 답을 글만 보고 다시 구해 맞춰 봅니다.
// ────────────────────────────────────────────────────────────────────
// 뭉치마다 씨앗을 여럿 넣어 문항을 만들고, 문제 글에서 수를 읽어 답을
// 따로 셈합니다. 결(0·1·2)이 고루 나오는지와 문항이 넉넉히 다른지도 봅니다.
// ════════════════════════════════════════════════════════════════════

const 뭉치들: G5Family[] = [
  각기둥각뿔(), 곱셈으로몫(), 구문제(), 덧셈표규칙(), 두양비교(), 몇십나누기이야기(), 모양조각(), 범위생활(), 분수소수비교(), 삼각형사고(false), 삼각형사고(true),
  알맞은그래프(), 원넓이더(true), 원넓이더(false), 원주더(), 정육면체더(false), 정육면체더(true), 칠교모양(), 하나더이야기(),
];

const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 반올림 = (x: number) => Math.round(x * 1000) / 1000;
const 각말 = ['', '', '', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
const 조각넓이: Record<string, number> = { 정삼각형: 1, 마름모: 2, 사다리꼴: 3, 정육각형: 6 };

/** 글만 보고 답을 구합니다. 풀 수 없는 글이면 undefined입니다. */
const 풀기 = (s: G5Spec): string | number | undefined => {
  const p = s.prompt;
  let m: RegExpExecArray | null;
  // 모양 조각
  if ((m = /^(\S+) 모양 조각으로 (\S+) 모양 (\d+)개를 겹치지 않게/.exec(p))) return (조각넓이[m[2]] / 조각넓이[m[1]]) * +m[3];
  if ((m = /^정육각형 모양 (\d+)개를 사다리꼴 모양 조각 (\d+)개와 마름모 모양 조각 (\d+)개로 채우고/.exec(p))) return 6 * +m[1] - 3 * +m[2] - 2 * +m[3];
  if ((m = /^정삼각형 모양 조각 (\d+)개(?:와 |, )마름모 모양 조각 (\d+)개(?:, 사다리꼴 모양 조각 (\d+)개)?[을를] 이어 붙여/.exec(p))) return +m[1] + 2 * +m[2] + 3 * +(m[3] ?? 0);
  if ((m = /^정육각형 모양 (\d+)개를 채우는 데 사다리꼴 모양 조각 (\d+)개를 쓰고, 나머지는 마름모/.exec(p))) return 3 * (+m[1] - +m[2] / 2);
  if ((m = /^정삼각형 모양 조각이 (\d+)개 있습니다\. 이 조각으로 (\S+) 모양을/.exec(p))) return Math.floor(+m[1] / 조각넓이[m[2]]);
  // 칠교
  if ((m = /삼각형 조각 (\d+)개와 사각형 조각 (\d+)개를 썼다면/.exec(p))) return +m[1] + +m[2];
  if ((m = /삼각형 조각이 (\d+)개, 사각형 조각이 (\d+)개 있습니다\. 삼각형 조각은 사각형 조각보다/.exec(p))) return +m[1] - +m[2];
  if ((m = /칠교 조각 (\d+)개로 모양을 만들었습니다\. 그 가운데 사각형 조각이 (\d+)개/.exec(p))) return +m[1] - +m[2];
  if ((m = /^칠교판 (\d+)개를 흩어 놓고 \S+ 삼각형 조각을 (\d+)개 가져갔습니다/.exec(p))) return 5 * +m[1] - +m[2];
  // 두 양 비교
  if ((m = /^한 모둠에 학생이 (\d+)명이고, 모둠마다 \S+ (\d+)\D+씩 나누어 줍니다\. (.*)$/.exec(p))) {
    const [사람, 물건] = [+m[1], +m[2]];
    const 뒤 = m[3];
    let k: RegExpExecArray | null;
    if ((k = /^모둠이 (\d+)개일 때 \S+ 수는 학생 수의 몇 배/.exec(뒤))) return 물건 / 사람;
    if ((k = /^모둠이 (\d+)개일 때 \S+ 학생보다 몇/.exec(뒤))) return +k[1] * (물건 - 사람);
    if ((k = /학생보다 (\d+)\D+ 더 많았다면 모둠은 몇 개/.exec(뒤))) return +k[1] / (물건 - 사람);
    if ((k = /늘어나면 \((\S+) 수\)([÷-])\(학생 수\)는 어떻게/.exec(뒤))) return k[2] === '÷' ? '변하지 않습니다' : '커집니다';
  }
  // 수의 범위
  if ((m = /^(\d+) (이상|초과) (\d+) (이하|미만)인 자연수는 모두 몇 개/.exec(p))) return (m[4] === '이하' ? +m[3] : +m[3] - 1) - (m[2] === '이상' ? +m[1] : +m[1] + 1) + 1;
  if ((m = /^(\d+) 이상 (\d+) 이하인 자연수 가운데 (\d+) 초과 (\d+) 미만인 수는/.exec(p))) return Math.min(+m[2], +m[4] - 1) - Math.max(+m[1], +m[3] + 1) + 1;
  // 구
  if ((m = /^반지름이 (\d+) cm인 구가 있습니다\. 구의 중심에서/.exec(p))) return +m[1];
  if ((m = /^지름이 (\d+) cm인 구 모양의 공을 꼭 맞게 넣을 수 있는 정육면체/.exec(p))) return +m[1];
  if ((m = /^반지름이 (\d+) cm인 구 모양의 공 (\d+)개를 한 줄로 맞닿게/.exec(p))) return 2 * +m[1] * +m[2];
  if ((m = /가장 큰 원의 지름이 (\d+) cm입니다\. 이 구의 반지름/.exec(p))) return +m[1] / 2;
  if ((m = /^길이가 (\d+) cm인 상자에 크기가 같은 구 모양의 공 (\d+)개가/.exec(p))) return +m[1] / +m[2] / 2;
  // 원
  const π = (m = /\(원주율: ([\d.]+)\)$/.exec(p)) ? +m[1] : NaN;
  if ((m = /^지름이 (\d+) cm인 원의 원주는/.exec(p))) return 반올림(+m[1] * π);
  if ((m = /^반지름이 (\d+) cm인 원의 원주는/.exec(p))) return 반올림(2 * +m[1] * π);
  if ((m = /^원주가 ([\d.]+) cm인 원의 반지름은/.exec(p))) return Math.round(+m[1] / π / 2);
  if ((m = /^반지름이 (\d+) cm인 원과 반지름이 (\d+) cm인 원이 있습니다\. 두 원의 원주의 차/.exec(p))) return 반올림(2 * (+m[1] - +m[2]) * π);
  if ((m = /^반지름이 (\d+) cm인 원의 바깥에 꼭 맞게 그린 정사각형/.exec(p))) return 4 * Number(m[1]) ** 2;
  if ((m = /^반지름이 (\d+) cm인 원의 안에 네 꼭짓점이 원 위에/.exec(p))) return 2 * Number(m[1]) ** 2;
  if ((m = /^원주율을 3으로 어림하여 반지름이 (\d+) cm인 원의 넓이/.exec(p))) return 3 * Number(m[1]) ** 2;
  if ((m = /^반지름이 (\d+) cm인 원의 넓이를 원 안과 밖의 정사각형으로 어림하면/.exec(p))) return `${2 * Number(m[1]) ** 2} cm²보다 크고 ${4 * Number(m[1]) ** 2} cm²보다 작습니다`;
  if ((m = /^반지름이 (\d+) cm인 원을 반으로 나눈 반원의 넓이/.exec(p))) return 반올림((Number(m[1]) ** 2 * π) / 2);
  if ((m = /^원주가 ([\d.]+) cm인 원의 넓이는/.exec(p))) { const r = Math.round(+m[1] / π / 2); return 반올림(r * r * π); }
  if ((m = /^넓이가 ([\d.]+) cm²인 원의 반지름은/.exec(p))) return Math.round(Math.sqrt(+m[1] / π));
  if ((m = /^반지름이 (\d+) cm인 원 안에 중심이 같고 반지름이 (\d+) cm인 원을/.exec(p))) return 반올림((Number(m[1]) ** 2 - Number(m[2]) ** 2) * π);
  if ((m = /^반지름이 (\d+) cm인 원의 넓이는/.exec(p))) return 반올림(Number(m[1]) ** 2 * π);
  if ((m = /^지름이 (\d+) cm인 원의 넓이는/.exec(p))) return 반올림((Number(m[1]) / 2) ** 2 * π);
  if ((m = /^반지름이 (\d+) cm인 원을 중심을 지나는 두 지름으로 똑같이 4조각/.exec(p))) return 반올림((Number(m[1]) ** 2 * π) / 4);
  // 정육면체
  if ((m = /^한 면의 둘레가 (\d+) cm인 정육면체의 전개도를 그렸습니다\. 전개도의 둘레/.exec(p))) return (14 * +m[1]) / 4;
  if ((m = /^정육면체의 전개도의 둘레가 (\d+) cm입니다\. 이 정육면체의 한 모서리/.exec(p))) return +m[1] / 14;
  if ((m = /^정육면체의 한 면의 넓이가 (\d+) cm²일 때, 모든 모서리/.exec(p))) return 12 * Math.sqrt(+m[1]);
  if ((m = /^모든 모서리의 길이의 합이 (\d+) cm인 정육면체가 있습니다\. 이 정육면체의 한 면의 넓이/.exec(p))) return (+m[1] / 12) ** 2;
  if ((m = /^정육면체의 전개도를 (\d+)장 그리려고/.exec(p))) return 6 * +m[1];
  if ((m = /^한 모서리가 (\d+) cm인 정육면체의 전개도를 그렸습니다\. 전개도의 둘레/.exec(p))) return 14 * +m[1];
  if ((m = /^한 모서리가 (\d+) cm인 정육면체의 전개도의 넓이/.exec(p))) return 6 * Number(m[1]) ** 2;
  if ((m = /^정육면체 (\d+)개의 (면|모서리|꼭짓점)[은는] 모두/.exec(p))) return { 면: 6, 모서리: 12, 꼭짓점: 8 }[m[2]]! * +m[1];
  if ((m = /^한 모서리가 (\d+) cm인 정육면체의 한 면의 넓이/.exec(p))) return Number(m[1]) ** 2;
  if ((m = /^한 면의 둘레가 (\d+) cm인 정육면체의 모든 모서리/.exec(p))) return 3 * +m[1];
  // 나눗셈
  if ((m = /(\d+)\D+ (\d+)명에게 똑같이 나누어 주려고/.exec(p))) return +m[1] / +m[2];
  if ((m = /(\d+)쪽짜리 책을 (\d+)일 동안/.exec(p))) return +m[1] / +m[2];
  if ((m = /^곱셈식 (\d)×□=(\d+)에서/.exec(p))) return +m[2] / +m[1];
  if ((m = /\S+ (\d+)\D+ \S+ (\d)개에 똑같이 나누어 담으려고/.exec(p))) return +m[1] / +m[2];
  // 1만큼 더 큰 수
  if ((m = /^(\d)보다 1만큼 더 큰 수와 \d보다 1만큼 더 작은 수가 있습니다/.exec(p))) return +m[1];
  if ((m = /을 (\d)개 가지고 있습니다\. \S+ \S+ 1개 더 많이 가지고 있고/.exec(p)) || (m = /를 (\d)개 가지고 있습니다\. \S+ \S+ 1개 더 많이 가지고 있고/.exec(p))) return +m[1] + 2;
  if ((m = /[을를] (\d)개 가지고 있습니다\. \S+ \S+ 1개 더 (많이|적게) 가지고 있습니다\./.exec(p))) return +m[1] + (m[2] === '많이' ? 1 : -1);
  if ((m = /[을를] (\d)개 가지고 있었습니다\. \S+ 1개를 (더 받았습니다|주었습니다)/.exec(p))) return +m[1] + (m[2] === '주었습니다' ? -1 : 1);
  if ((m = /보다 1개 더 적습니다\. \S+ \S+ (\d)개이면/.exec(p))) return +m[1] + 1;
  if ((m = /[을를] (\d)개 가지고 있었습니다\. \S+ 1개를 먹고/.exec(p))) return +m[1];
  // 덧셈표
  if ((m = /가로줄의 (\d)[과와] 세로줄의 (\d)[이가] 만나는 칸의 바로 (?:오른쪽|아래쪽) 칸의 수/.exec(p))) return +m[1] + +m[2] + 1;
  if ((m = /가로줄의 (\d)[과와] 세로줄의 (\d)[이가] 만나는 칸의 수와 같은 수가 가로줄의 (\d)[과와] 세로줄의 어떤 수/.exec(p))) return +m[1] + +m[2] - +m[3];
  if ((m = /가로줄의 (\d)[과와] 세로줄의 (\d)[이가] 만나는 칸에서 오른쪽으로 (\d)칸 간 칸의 수/.exec(p))) return +m[1] + +m[2] + +m[3];
  if ((m = /어느 칸의 수가 (\d+)입니다\. 이 칸에서 오른쪽으로 (\d)칸, 아래로 (\d)칸/.exec(p))) return +m[1] + +m[2] + +m[3];
  if ((m = /가로줄의 (\d)[과와] 세로줄의 (\d)[이가] 만나는 칸의 수와 가로줄의 (\d)[과와] 세로줄의 (\d)[이가] 만나는 칸의 수의 차/.exec(p))) return Math.abs(+m[1] + +m[2] - +m[3] - +m[4]);
  // 그래프
  if (/그래프로 나타내려고 합니다\. 막대그래프와 꺾은선그래프 가운데/.test(p)) return /마다|해마다|날마다|주마다|달마다/.test(p) ? '꺾은선그래프' : '막대그래프';
  if ((m = /세로 눈금 한 칸이 (\d+)명을 나타냅니다\. 막대의 길이가 (\d+)칸이면/.exec(p))) return +m[1] * +m[2];
  if ((m = /세로 눈금 한 칸이 (\d+) °C를 나타냅니다\. 오전 10시의 온도가 (\d+) °C, 낮 12시의 온도가 (\d+) °C/.exec(p))) return Math.abs(+m[2] - +m[3]) / +m[1];
  // 분수와 소수
  if ((m = /^분수 (\d+)\/(\d+)의 값을 소수로/.exec(p))) return 반올림(+m[1] / +m[2]);
  if ((m = /^두 수 (\d+)\/(\d+), ([\d.]+) 가운데 더 큰 수/.exec(p))) { const f = +m[1] / +m[2]; const x = +m[3]; return f === x ? '두 수는 같습니다' : x > f ? m[3] : `${m[1]}/${m[2]}`; }
  if ((m = /^세 수 (.+) 가운데 큰 수부터 차례로 쓸 때 가운데에 오는 수/.exec(p))) {
    const 값 = (t: string) => (t.includes('/') ? +t.split('/')[0] / +t.split('/')[1] : +t);
    return m[1].split(', ').sort((x, y) => 값(y) - 값(x))[1];
  }
  // 각기둥과 각뿔
  if ((m = /^밑면이 (\S)각형인 각(기둥|뿔)의 이름/.exec(p))) return `${m[1]}각${m[2]}`;
  if ((m = /^(\S)각(기둥|뿔)의 옆면은 몇 개/.exec(p))) return 각말.indexOf(m[1]);
  if ((m = /^(\S)각(기둥|뿔) (\d)개의 (밑면|옆면)[은는] 모두/.exec(p))) return (m[4] === '옆면' ? 각말.indexOf(m[1]) : m[2] === '기둥' ? 2 : 1) * +m[3];
  // 삼각형
  if ((m = /삼각형 몇 개를 따로따로 그렸더니 (?:꼭짓점|변)[이가] 모두 (\d+)개/.exec(p))) return +m[1] / 3;
  if ((m = /^삼각형 (\d)개와 사각형 몇 개를 따로따로 그리고 \S+ 세었더니 모두 (\d+)개/.exec(p))) return (+m[2] - 3 * +m[1]) / 4;
  if ((m = /곧은 선 (\d+)개로 서로 떨어진 삼각형을/.exec(p))) return Math.floor(+m[1] / 3);
  return undefined;
};

/** 범위 문항: 답만 조건을 지키고 오답은 모두 어깁니다. */
const 범위맞음 = (s: G5Spec) => {
  const m = /(\d+)(?: cm| kg|세) (이상|이하|미만|초과)/.exec(s.prompt)!;
  const 기준 = +m[1];
  const 된다 = (x: number) => (m[2] === '이상' ? x >= 기준 : m[2] === '이하' ? x <= 기준 : m[2] === '미만' ? x < 기준 : x > 기준);
  return 된다(수(s.answer)) && s.wrongs.every((w) => !된다(수(w)));
};

describe('셋째 묶음 문항', () => {
  for (const f of 뭉치들) {
    it(`${f.id}: 답이 맞고, 보기가 넷이며, 문항이 넉넉히 다릅니다`, () => {
      const 다른글 = new Set<string>();
      const 결들 = new Set<number>();
      for (let seed = 1; seed <= 600; seed += 1) {
        const s = f.make(seed * 7919 + 13);
        if (!s) continue;
        다른글.add(s.prompt);
        결들.add(s.결 ?? -1);
        expect(new Set([s.answer, ...s.wrongs]).size, s.prompt).toBe(4);
        expect(/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로|undefined|NaN/.test([s.prompt, s.answer, ...s.wrongs, ...s.steps].join(' ')), s.prompt).toBe(false);
        if (/어린이만 탈 수 있는|입장료가 무료|요금을 더 내야/.test(s.prompt)) { expect(범위맞음(s), s.prompt).toBe(true); continue; }
        const 답 = 풀기(s);
        expect(답, `풀 수 없는 글: ${s.prompt}`).not.toBeUndefined();
        if (typeof 답 === 'number') expect(수(s.answer), s.prompt).toBeCloseTo(답, 6);
        else expect(s.answer, s.prompt).toBe(답);
      }
      expect(다른글.size, f.id).toBeGreaterThan(60);
      expect(결들.has(-1)).toBe(false);
    });
  }
});
