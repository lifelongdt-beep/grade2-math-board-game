import { describe, expect, it } from 'vitest';
import type { G5Family, G5Spec } from '../grade5/build';
import * as 융합 from './fusion';

// ════════════════════════════════════════════════════════════════════
// 융합 문항(fusion.ts)의 답을 글만 보고 다시 구해 맞춰 봅니다.
// ────────────────────────────────────────────────────────────────────
// fusion.ts의 셈을 쓰지 않고 문제 글에서 수를 읽어 따로 셈합니다.
// 보기 넷이 서로 다른지, 조사가 괄호 꼴로 남지 않았는지, 결이 2(상)인지,
// 풀이가 두 개념을 차례로 쓰는 두 걸음인지, 글의 틀이 넉넉히 다른지도 봅니다.
// ════════════════════════════════════════════════════════════════════

const 뭉치들: G5Family[] = Object.values(융합).map((f) => f());

const 시각 = (분: number) => { const h = Math.floor(분 / 60); const m = 분 % 60; return m ? `${h}시 ${m}분` : `${h}시`; };
const 시간 = (분: number) => `${Math.floor(분 / 60)}시간${분 % 60 ? ` ${분 % 60}분` : ''}`;
const 엠 = (cm: number) => `${Math.floor(cm / 100)} m${cm % 100 ? ` ${cm % 100} cm` : ''}`;
const 최대 = (a: number, b: number): number => (b ? 최대(b, a % b) : a);
const 반 = (x: number) => Math.round(x * 1000) / 1000;

/** 글만 보고 답을 구합니다. 풀 수 없는 글이면 undefined입니다. */
const 풀기 = (s: G5Spec): string | number | undefined => {
  const p = s.prompt;
  let m: RegExpExecArray | null;
  if ((m = /(\d+)시에 시작하여 (\d+)시간 동안/.exec(p))) return `${+m[1] + +m[2]}시`;
  if ((m = /연필의 길이는 (\d+) cm이고, 색연필은 연필보다 (\d+) cm 더/.exec(p))) return 2 * +m[1] + +m[2];
  if ((m = /길이가 (\d+) cm인 막대와 (\d+) cm인 막대를 이어 붙였습니다\. 이어 붙인 막대는 (\d+) cm인 끈보다/.exec(p))) return +m[1] + +m[2] - +m[3];
  if ((m = /한 \S+에 (\d+)\S+씩 (\d+)\S+ 있습니다\. 낱개로 (\d+)\S+ 더/.exec(p))) return +m[1] * +m[2] + +m[3];
  if ((m = /한 \S+에 (\d+)\S+씩 (\d+)\S+ 있습니다\. 그중 (\d+)\S+ 친구에게/.exec(p))) return +m[1] * +m[2] - +m[3];
  if ((m = /길이가 (\d+) cm인 막대를 겹치지 않게 (\d+)개/.exec(p))) return +m[1] * +m[2];
  if ((m = /(\d+) cm짜리 색 테이프 (\d+)장을 .* 그중 (\d+) cm를/.exec(p))) return +m[1] * +m[2] - +m[3];
  if ((m = /한 걸음은 (\d+) cm입니다\. .* (\d+)걸음을/.exec(p))) return 엠(+m[1] * +m[2]);
  if ((m = /데 (\d+)분씩 걸립니다\. (\d+)시(?: (\d+)분)?에 시작해서 쉬지 않고 (\d+)/.exec(p))) return 시각(+m[2] * 60 + +(m[3] ?? 0) + +m[1] * +m[4]);
  if ((m = /표로 나타냈습니다\. (.+)입니다\. (\S+)[을를] 좋아하는 학생에게 스티커를 한 명에 (\d+)장씩/.exec(p))) {
    const 표 = Object.fromEntries(m[1].split(', ').map((x) => { const [k, v] = x.split(' '); return [k, parseInt(v, 10)]; }));
    return 표[m[2]] * +m[3];
  }
  if ((m = /빨간 끈은 (\d+) cm, 파란 끈은 (\d+) cm입니다/.exec(p))) return 엠(+m[1] + +m[2]);
  if ((m = /길이가 (\d+) m(?: (\d+) cm)?인 끈에서 (\d+) cm를 잘라/.exec(p))) return 엠(+m[1] * 100 + +(m[2] ?? 0) - +m[3]);
  if ((m = /한 변의 길이가 (\d+) cm인 정사각형/.exec(p))) return 4 * +m[1];
  if ((m = /가로가 (\d+) cm, 세로가 (\d+) cm인 직사각형/.exec(p))) return 2 * (+m[1] + +m[2]);
  if ((m = /길이가 (\d+) cm인 (?:\S+ )?\S+ (\d+) cm씩 자르려고/.exec(p))) return +m[1] / +m[2];
  if ((m = /(\d+)분 동안 같은 시간씩 (\d+)번/.exec(p))) return +m[1] / +m[2];
  if ((m = /하루에 (\d+)분씩 (\d+)일 동안/.exec(p))) return 시간(+m[1] * +m[2]);
  if ((m = /(\d+)분 (\d+)초가 걸리는 노래를 쉬지 않고 (\d+)번/.exec(p))) { const 초 = (+m[1] * 60 + +m[2]) * +m[3]; return `${Math.floor(초 / 60)}분 ${초 % 60}초`; }
  if ((m = /똑같이 (\d+)조각으로 나누었습니다\. 오빠가 (\d+)조각, 동생이 (\d+)조각을 먹었습니다\. (남은|두 사람이 먹은)/.exec(p))) return `${m[4] === '남은' ? +m[1] - +m[2] - +m[3] : +m[2] + +m[3]}/${m[1]}`;
  if ((m = /\S+[이가] (\d+)\S+씩 들어 있는 \S+ (\d+)개 있습니다\. 그중 (\d+)\S+ 팔았다면/.exec(p))) return +m[1] * +m[2] - +m[3];
  if ((m = /한 편에 (\d+)분인 만화를 (\d+)시간 동안/.exec(p))) return /남는 시간/.test(p) ? (+m[2] * 60) % +m[1] : Math.floor((+m[2] * 60) / +m[1]);
  if ((m = /가로가 (\d+) cm인 상자의 바닥에 반지름이 (\d+) cm인/.exec(p))) return Math.floor(+m[1] / (2 * +m[2]));
  if ((m = /^1시간의 (\d+)\/(\d+)[은는] 몇 분/.exec(p))) return (60 * +m[1]) / +m[2];
  if ((m = /들이가 (\d+) mL인 컵으로 물을 (\d+)번/.exec(p))) { const v = +m[1] * +m[2]; return `${Math.floor(v / 1000)} L ${v % 1000} mL`; }
  if ((m = /무게가 (\d+) kg (\d+) g인 상자 (\d+)개/.exec(p))) { const v = (+m[1] * 1000 + +m[2]) * +m[3]; return `${Math.floor(v / 1000)} kg ${v % 1000} g`; }
  if ((m = /큰 그림이 (\d+)개, 작은 그림이 (\d+)개 있습니다\. 한 상자에 사과가 (\d+)개씩/.exec(p))) return (10 * +m[1] + +m[2]) * +m[3];
  if ((m = /^(\d+)시 정각에 시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각/.exec(p))) { const a = (30 * +m[1]) % 360; return Math.min(a, 360 - a); }
  if ((m = /1분에 (\d+) m씩 걷습니다\. 같은 빠르기로 (\d+)분/.exec(p))) { const v = +m[1] * +m[2]; return `${Math.floor(v / 1000)} km ${v % 1000} m`; }
  if ((m = /세로 눈금 한 칸은 (\d+)개이고, \S+ 막대는 (\d+)칸입니다\. 빈 병 한 개를 (\d+)원에/.exec(p))) return +m[1] * +m[2] * +m[3];
  if ((m = /오전에 (\d+)\/(\d+)시간, 오후에 (\d+)\/(\d+)시간/.exec(p))) return (60 * (+m[1] + +m[3])) / +m[2];
  if ((m = /길이가 같은 두 변 사이의 각이 (\d+)°/.exec(p))) return (180 - +m[1]) / 2;
  if ((m = /크기가 같은 두 각 가운데 한 각이 (\d+)°/.exec(p))) return 180 - 2 * +m[1];
  if ((m = /빨간 끈은 ([\d.]+) m이고, 파란 끈은 (\d+) cm/.exec(p))) return `${반(+m[1] + +m[2] / 100)} m`;
  if ((m = /한 각의 크기가 (\d+)°입니다\. 이 각과 이웃한 각/.exec(p))) return 180 - +m[1];
  if ((m = /한 변의 길이가 (\d+) cm이고 한 각이 \d+°인 마름모/.exec(p))) return 4 * +m[1];
  if ((m = /가 버스는 (\d+)분마다, 나 버스는 (\d+)분마다 출발합니다\. 오전 (\d+)시에/.exec(p))) { const a = +m[1]; const b = +m[2]; return 시각(+m[3] * 60 + (a * b) / 최대(a, b)); }
  if ((m = /짧은바늘이 (\d+)시부터 (\d+)시까지/.exec(p))) return 30 * (+m[2] - +m[1]);
  if ((m = /긴바늘이 (\d+)분 동안/.exec(p))) return 6 * +m[1];
  if ((m = /^(\d+) cm는 1 m의 몇 분의 몇인지 기약분수로/.exec(p))) { const g = 최대(+m[1], 100); return `${+m[1] / g}/${100 / g}`; }
  if ((m = /^(\d+)분은 1시간의 몇 분의 몇인지 기약분수로/.exec(p))) { const g = 최대(+m[1], 60); return `${+m[1] / g}/${60 / g}`; }
  if ((m = /둘레가 (\d+) cm인 직사각형의 가로가 (\d+) cm/.exec(p))) return +m[2] * (+m[1] / 2 - +m[2]);
  if ((m = /학생 (\d+)명이 한 대에 (\d+)명까지/.exec(p))) return Math.ceil(+m[1] / +m[2]);
  if ((m = /리본 1 m의 값이 (\d+)원입니다\. 이 리본 ([\d.]+) m/.exec(p))) return Math.round(+m[1] * +m[2]);
  if ((m = /한 병에 ([\d.]+) L씩 든 주스가 (\d+)병/.exec(p))) return `${반(+m[1] * +m[2])} L`;
  if ((m = /(\d+)일 동안 하루 평균 (\d+)분씩 운동했습니다/.exec(p))) return 시간(+m[1] * +m[2]);
  if ((m = /(\d+)일 동안 하루 평균 (\d+)분씩 책을 읽으려고 합니다\. 앞의 \d+일 동안 (.+)을 읽었다면/.exec(p))) return +m[1] * +m[2] - m[3].split(', ').reduce((x, y) => x + parseInt(y, 10), 0);
  if ((m = /\d+일 동안 마신 물의 양이 (.+)입니다\. 하루에 마신 물의 양의 평균/.exec(p))) { const 값 = m[1].split(', ').map((x) => parseFloat(x)); return `${반(값.reduce((x, y) => x + y, 0) / 값.length)} L`; }
  if ((m = /정가가 (\d+)원인 가방을 (\d+)% 할인/.exec(p))) return +m[1] * (1 - +m[2] / 100);
  if ((m = /형과 동생이 (\d+) : (\d+)로 나누어 가졌습니다\. 형이 가진 구슬은 전체의 몇 %/.exec(p))) return `${(100 * +m[1]) / (+m[1] + +m[2])}%`;
  if ((m = /반지름이 (\d+) cm인 원을 중심을 지나는 선으로 똑같이 (\d+)조각.*원주율: ([\d.]+)/.exec(p))) return `${반((+m[1] * +m[1] * +m[3]) / +m[2])} cm²`;
  if ((m = /각 ㄱㄴㄹ의 크기가 (\d+)°일 때, 각 ㄹㄴㄷ/.exec(p))) return 90 - +m[1];
  if ((m = /각 ㄱㄴㄷ은 (\d+)°, 각 ㄹㅂㅁ은 (\d+)°일 때, 각 ㄴㄱㄷ/.exec(p))) return 180 - +m[1] - +m[2];
  if ((m = /선분 ㄱㄷ의 길이는 (\d+) cm이고, 점 ㄴ에서 대칭축까지의 거리는 (\d+) cm/.exec(p))) return +m[1] * +m[2];
  if ((m = /높이 (\d+) cm가 놓이고 밑변이 (\d+) cm인 직각삼각형/.exec(p))) return +m[1] * +m[2];
  if ((m = /사각형 ㄱㄴㄷㄹ이 있습니다\. 변 \S+ (\d+) cm이고, 둘레는 (\d+) cm/.exec(p))) return +m[2] / 2 - +m[1];
  if ((m = /육각형 ㄱㄴㄷㄹㅁㅂ이 있습니다\. 변 \S+ (\d+) cm, 변 \S+ (\d+) cm이고, 둘레는 (\d+) cm입니다\. 변 (\S+)은/.exec(p))) {
    // 묻는 변의 짝이 이미 주어진 두 변의 짝이 아니어야 풀 수 있습니다.
    const 짝 = (v: string) => [['ㄱㄴ', 'ㄹㅁ'], ['ㄴㄷ', 'ㅁㅂ'], ['ㄷㄹ', 'ㅂㄱ']].findIndex((x) => x.includes(v));
    const 준 = [...p.matchAll(/변 (\S+)은 \d+ cm/g)].map((x) => 짝(x[1]));
    if (준.includes(짝(m[4])) || 준[0] === 준[1]) return 'X';
    return +m[3] / 2 - +m[1] - +m[2];
  }
  if ((m = /밑변이 (\d+) cm, 높이가 (\d+) cm인 삼각형이 있습니다\. 밑변의 한가운데 점을 대칭의 중심/.exec(p))) return +m[1] * +m[2];
  return undefined;
};

const 값 = (t: string) => Number(t.replace(/[^\d.]/g, ''));

describe('융합 문항', () => {
  for (const f of 뭉치들) {
    it(`${f.id}: 답이 맞고, 보기가 넷이며, 상 문항이고, 풀이가 두 걸음입니다`, () => {
      const 다른글 = new Set<string>();
      for (let seed = 1; seed <= 600; seed += 1) {
        const s = f.make(seed * 7919 + 13);
        if (!s) continue;
        다른글.add(s.prompt);
        expect(s.결, s.prompt).toBe(2);
        expect(s.steps.length, s.prompt).toBeGreaterThanOrEqual(2);
        expect(new Set([s.answer, ...s.wrongs]).size, s.prompt).toBe(4);
        expect(/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로|undefined|NaN|(?:^|[\s,(])-\d/.test([s.prompt, s.answer, ...s.wrongs].join(' ')), `${s.prompt} [${s.answer}, ${s.wrongs.join(', ')}]`).toBe(false);
        expect(/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로|undefined|NaN/.test(s.steps.join(' ') + s.hint), s.steps.join(' / ')).toBe(false);
        // 0 mL, 0 cm처럼 쓰지 않는 말이나 12시를 넘는 시각이 보기에 없습니다.
        for (const w of [s.answer, ...s.wrongs]) {
          expect(/(?:^|\s)0 (?:mL|cm|m|g|kg|L)(?:\s|$)/.test(w), `${s.prompt} 보기 ${w}`).toBe(false);
          const 시 = /^(\d+)시/.exec(w);
          if (시 && /시각/.test(s.prompt)) expect(+시[1] >= 1 && +시[1] <= 12, `${s.prompt} 보기 ${w}`).toBe(true);
        }
        const 답 = 풀기(s);
        expect(답, `풀 수 없는 글: ${s.prompt}`).not.toBeUndefined();
        if (typeof 답 === 'number') expect(값(s.answer), s.prompt).toBeCloseTo(답, 6);
        else expect(s.answer, s.prompt).toBe(답);
        if (typeof 답 === 'number') for (const w of s.wrongs) if (/^[\d.]+\s?\D*$/.test(w)) expect(Math.abs(값(w) - 답) > 1e-9, `${s.prompt} 오답 ${w}`).toBe(true);
      }
      expect(다른글.size, f.id).toBeGreaterThan(30);
    });
  }
});
