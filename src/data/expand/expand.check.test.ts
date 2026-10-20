import { describe, expect, it } from 'vitest';
import type { Difficulty, Lesson, Question } from '../../types';
import { lessons as lessons2 } from '../curriculum';
import { lessons11 } from '../curriculum11';
import { lessons12 } from '../curriculum12';
import { lessons31 } from '../curriculum31';
import { lessons32 } from '../curriculum32';
import { lessons41 } from '../curriculum41';
import { lessons42 } from '../curriculum42';
import { lessons5 } from '../curriculum5';
import { lessons51 } from '../curriculum51';
import { lessons61 } from '../curriculum61';
import { lessons62 } from '../curriculum62';
import { generateQuestions } from '../questionFactory';
import { 늘림뭉치, 늘림차시, 수범위 } from './index';

// ════════════════════════════════════════════════════════════════════
// 문제집을 늘리는 문항을 글만 읽고 다시 풉니다
// ────────────────────────────────────────────────────────────────────
// 늘림 뭉치(expand/)는 둘째 판부터 나옵니다. 처음 판을 보는 다른 검사들이
// 이 문항을 보지 못하므로, 여기서 둘째·셋째 판을 만들어 봅니다.
//   · 문제 글의 수로 답을 다시 구해 견줍니다(families.ts를 쓰지 않습니다).
//   · 보기에 답이 꼭 하나 있고, 조사가 괄호 꼴로 남지 않았는지 봅니다.
//   · 1·2학년은 차시가 다루는 수의 범위(scope.maxNumber)와 곱셈구구 단을 지킵니다.
// ════════════════════════════════════════════════════════════════════

const 모든차시: Lesson[] = [...lessons11, ...lessons12, ...lessons2, ...lessons31, ...lessons32, ...lessons41, ...lessons42, ...lessons51, ...lessons5, ...lessons61, ...lessons62];
const 차시 = (열쇠: string) => 모든차시.find((l) => `${l.semester} ${l.unitNo}-${l.lessonNo}` === 열쇠)!;
const 수준들: Difficulty[] = ['하', '중', '상'];

const 문항들: Array<{ q: Question; l: Lesson }> = [];
for (const 열쇠 of 늘림차시) {
  const l = 차시(열쇠);
  for (const lv of 수준들) for (const 판 of [1, 2]) for (const q of generateQuestions(l, lv, { 판 })) 문항들.push({ q, l });
}

// 늘림 뭉치가 내는 문항의 갈래 이름입니다. 뭉치를 몇 번 불러 모읍니다.
const 늘림갈래 = new Set<string>();
for (const 열쇠 of 늘림차시) for (const lv of 수준들) for (const f of 늘림뭉치(차시(열쇠), lv)) for (let s = 1; s < 60; s += 1) { const spec = f.make(s * 7919, lv); if (spec) 늘림갈래.add(spec.strategy); }
const 늘림문항 = (q: Question) => 늘림갈래.has(q.strategy.split(' · ').pop()!);

const 수 = (t: string) => Number(t.replace(/[^\d.]/g, ''));
const 한자 = '영일이삼사오육칠팔구';
/** 한자어로 읽은 수를 수로 바꿉니다(칠백사십삼 → 743). */
const 읽은수 = (말: string) => {
  let 합 = 0;
  let 앞 = 0;
  for (const c of 말) {
    const d = 한자.indexOf(c);
    if (d >= 0) { 앞 = d; continue; }
    const 자리 = { 십: 10, 백: 100, 천: 1000 }[c];
    if (!자리) return NaN;
    합 += (앞 || 1) * 자리;
    앞 = 0;
  }
  return 합 + 앞;
};
const 째 = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
const 요일 = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const 분으로 = (t: string) => { const m = /(\d+)시(?: (\d+)분)?/.exec(t)!; return Number(m[1]) * 60 + Number(m[2] ?? 0); };
const 시각글 = (분: number) => { const h = Math.floor(분 / 60) % 12 || 12; const m = 분 % 60; return m ? `${h}시 ${m}분` : `${h}시`; };
const 항목들 = (글: string) => [...글.matchAll(/(\S+) (\d+)(명|개)/g)].map((m) => ({ 이름: m[1], 수: Number(m[2]) }));

// ── 그림만 보고 다시 풀 때 쓰는 셈 ─────────────────────────────────
type 점 = [number, number];
const 길이 = (a: 점, b: 점) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const 같다 = (x: number, y: number, 틈 = 0.03) => Math.abs(x - y) < 틈;
const 평행하다 = (a: 점, b: 점, c: 점, d: 점) => { const u = [b[0] - a[0], b[1] - a[1]]; const v = [d[0] - c[0], d[1] - c[1]]; return Math.abs(u[0] * v[1] - u[1] * v[0]) < 0.02 * Math.hypot(...u) * Math.hypot(...v); };
const 직각이다 = (a: 점, b: 점, c: 점) => { const u = [a[0] - b[0], a[1] - b[1]]; const v = [c[0] - b[0], c[1] - b[1]]; return Math.abs(u[0] * v[0] + u[1] * v[1]) < 0.02 * Math.hypot(...u) * Math.hypot(...v); };
/** 사각형이 속하는 이름들(4-2 4단원의 뜻 그대로) */
const 사각이름 = (p: 점[]) => {
  const 쌍 = (평행하다(p[0], p[1], p[3], p[2]) ? 1 : 0) + (평행하다(p[1], p[2], p[0], p[3]) ? 1 : 0);
  const 변 = p.map((_, k) => 길이(p[k], p[(k + 1) % 4]));
  const 네변같음 = 변.every((x) => 같다(x, 변[0]));
  const 네각직각 = p.every((_, k) => 직각이다(p[(k + 3) % 4], p[k], p[(k + 1) % 4]));
  const 이름: string[] = ['사각형'];
  if (쌍 >= 1) 이름.push('사다리꼴');
  if (쌍 === 2) 이름.push('평행사변형');
  if (쌍 === 2 && 네변같음) 이름.push('마름모');
  if (네각직각) 이름.push('직사각형');
  if (네각직각 && 네변같음) 이름.push('정사각형');
  return 이름;
};
/** 다각형의 대칭축 수: 무게중심을 지나는 여러 방향의 선으로 접어 꼭짓점이 겹치는지 봅니다. */
const 대칭축수 = (p: 점[]) => {
  const c: 점 = [p.reduce((s0, q) => s0 + q[0], 0) / p.length, p.reduce((s0, q) => s0 + q[1], 0) / p.length];
  const 후보 = [...p, ...p.map((q, k) => [(q[0] + p[(k + 1) % p.length][0]) / 2, (q[1] + p[(k + 1) % p.length][1]) / 2] as 점)];
  const 방향들: number[] = [];
  for (const q of 후보) {
    const deg = (((Math.atan2(q[1] - c[1], q[0] - c[0]) * 180) / Math.PI) + 360) % 180;
    if (!방향들.some((d) => Math.min(Math.abs(d - deg), 180 - Math.abs(d - deg)) < 1)) 방향들.push(deg);
  }
  return 방향들.filter((deg) => {
    const t = (deg * Math.PI) / 180;
    const 접기 = ([x, y]: 점): 점 => { const dx = x - c[0]; const dy = y - c[1]; const d = dx * Math.cos(t) + dy * Math.sin(t); return [c[0] + 2 * d * Math.cos(t) - dx, c[1] + 2 * d * Math.sin(t) - dy]; };
    return p.every((q) => p.some((r) => 길이(접기(q), r) < 0.03));
  }).length;
};

describe('문제집을 늘리는 문항', () => {
  const 셈 = new Map<string, number>();
  const 맞다 = (k: string, 받은: unknown, 바라는: unknown, 글: string) => { expect(받은, 글).toEqual(바라는); 셈.set(k, (셈.get(k) ?? 0) + 1); };

  it('답이 맞습니다', () => {
    for (const { q } of 문항들) {
      const p = q.prompt;
      const a = q.answer;
      let m: RegExpExecArray | null;
      if ((m = /^10개씩 묶음 (\d)개와 낱개 (\d)개인 수는/.exec(p))) 맞다('묶음낱개', 수(a), +m[1] * 10 + +m[2], p);
      if ((m = /^((?:\d+이 \d개, )*\d+이 \d개)인 수는/.exec(p))) 맞다('자릿값', 수(a), [...m[1].matchAll(/(\d+)이 (\d)개/g)].reduce((s, x) => s + +x[1] * +x[2], 0), p);
      if ((m = /^(\d+)에서 (일|십|백|천)의 자리 숫자는/.exec(p))) 맞다('자리숫자', a, m[1][m[1].length - 1 - '일십백천'.indexOf(m[2])], p);
      if ((m = /^(\d+)에서 숫자 (\d)[은는] 얼마를 나타낼까요/.exec(p))) { const k = m[1].length - 1 - m[1].indexOf(m[2]); 맞다('나타내는값', 수(a), +m[2] * 10 ** k, p); }
      if ((m = /^(\d+)[을를] 바르게 읽은 것은/.exec(p))) 맞다('수읽기', 읽은수(a), +m[1], p);
      if ((m = /^'([일이삼사오육칠팔구십백천]+)'[을를] 수로 쓰면/.exec(p))) 맞다('수쓰기', 수(a), 읽은수(m[1]), p);
      if ((m = /^(\d+)에서 (\d+)씩 (거꾸로 )?(\d)번 뛰어 센 수는/.exec(p))) 맞다('뛰어세기', 수(a), +m[1] + (m[3] ? -1 : 1) * +m[2] * +m[4], p);
      if ((m = /^(\d+)[과와] (\d+) 가운데 더 (큰|작은) 수는/.exec(p))) 맞다('두수비교', 수(a), (m[3] === '큰' ? Math.max : Math.min)(+m[1], +m[2]), p);
      if ((m = /^([\d, ]+) 가운데 가장 (큰|작은) 수는/.exec(p))) 맞다('세수비교', 수(a), (m[2] === '큰' ? Math.max : Math.min)(...m[1].split(', ').map(Number)), p);
      if ((m = /^(\d+)보다 크고 (\d+)보다 작은 수는 모두 몇 개/.exec(p))) 맞다('사이개수', 수(a), +m[2] - +m[1] - 1, p);
      if ((m = /^(\d+)보다 (\d+)만큼 더 (큰|작은) 수는 얼마/.exec(p))) 맞다('만큼큰수', 수(a), +m[1] + (m[3] === '큰' ? 1 : -1) * +m[2], p);
      if ((m = /^(\d+)([+-])(\d+)[은는] 얼마일까요/.exec(p))) 맞다('계산', 수(a), m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3], p);
      if ((m = /^(\d+)([+-])(\d+)([+-])(\d+)[은는] 얼마일까요/.exec(p))) { const 첫 = m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3]; 맞다('세수계산', 수(a), m[4] === '+' ? 첫 + +m[5] : 첫 - +m[5], p); }
      if ((m = /(\d+)\D+ 가지고 있었습니다\. 친구에게 (\d+)\D+ 더 받았습니다/.exec(p)) || (m = /(\d+)\D+ 있습니다\. (\d+)\D+ 더 사 왔습니다/.exec(p))) 맞다('더하기이야기', 수(a), +m[1] + +m[2], p);
      if ((m = /(\d+)\D+ 가지고 있었습니다\. 동생에게 (\d+)\D+ 주었습니다/.exec(p)) || (m = /(\d+)\D+ 있었습니다\. 그 가운데 (\d+)\D+ 썼습니다/.exec(p))) 맞다('빼기이야기', 수(a), +m[1] - +m[2], p);
      if ((m = /^(\S+)[은는] \S+ (\d+)\D+, (\S+)[은는] (\d+)\D+ 가지고 있습니다\. (\S+)[이가] 몇/.exec(p))) { expect(m[5], p).toBe(+m[2] > +m[4] ? m[1] : m[3]); 맞다('차이야기', 수(a), Math.abs(+m[2] - +m[4]), p); }
      if ((m = /^(□|\d+)([+-])(□|\d+)=(\d+)에서 □ 안에/.exec(p))) {
        const [x, o, y, c] = [m[1], m[2], m[3], +m[4]];
        const v = x === '□' ? (o === '+' ? c - +y : c + +y) : (o === '+' ? c - +x : +x - c);
        맞다('네모식', 수(a), v, p);
      }
      if ((m = /^어떤 수에 (\d+)[을를] (더했더니|뺐더니) (\d+)[이가] 되었습니다/.exec(p))) 맞다('어떤수', 수(a), m[2] === '더했더니' ? +m[3] - +m[1] : +m[3] + +m[1], p);
      if ((m = /^(\d)×(\d)[은는] 얼마일까요/.exec(p))) 맞다('곱', 수(a), +m[1] * +m[2], p);
      if ((m = /^(0|1)×(\d)[은는]|^(\d)×(0|1)[은는]/.exec(p))) 셈.set('영일', (셈.get('영일') ?? 0) + 1);
      if ((m = /한 \S+에 (\d+)\D+씩 (\d+)\S+ 있습니다\. \S+ 모두 몇/.exec(p))) 맞다('묶음이야기', 수(a), +m[1] * +m[2], p);
      if ((m = /^(\d)×□=(\d+)에서 □/.exec(p))) 맞다('곱네모', 수(a), +m[2] / +m[1], p);
      if ((m = /^(\d)씩 (\d)묶음은 모두/.exec(p)) || (m = /^(\d)의 (\d)배는 얼마일까요/.exec(p))) 맞다('묶어세기', 수(a), +m[1] * +m[2], p);
      if ((m = /^((\d)(?:\+\2)+)[은는] 얼마/.exec(p))) 맞다('같은수더하기', 수(a), +m[2] * m[1].split('+').length, p);
      if ((m = /^((\d)(?:\+\2)+)[을를] 곱셈식으로/.exec(p))) 맞다('곱셈식으로', a, `${m[2]}×${m[1].split('+').length}`, p);
      if ((m = /(\d+)cm, \S+ \S+[은는] (\d+)cm입니다\. .+ 몇 배/.exec(p))) 맞다('몇배', 수(a), +m[1] / +m[2], p);
      if ((m = /^빈 \S+ (\d)개가 있습니다\. .+0\D+씩 들어 있습니다/.exec(p))) 맞다('빈묶음', 수(a), 0, p);
      if ((m = /곱셈표에서 (\d)단의 가로줄과 (\d)의 세로줄/.exec(p))) 맞다('곱셈표', 수(a), +m[1] * +m[2], p);
      if ((m = /^(\d)m (\d+)cm는 몇 cm/.exec(p))) 맞다('m를cm로', 수(a), +m[1] * 100 + +m[2], p);
      if ((m = /^(\d+)cm는 몇 m 몇 cm/.exec(p))) 맞다('cm를m로', a, `${Math.floor(+m[1] / 100)}m ${+m[1] % 100}cm`, p);
      if ((m = /^(\d)m (\d+)cm ([+-]) (\d)m (\d+)cm는/.exec(p))) { const x = +m[1] * 100 + +m[2]; const y = +m[4] * 100 + +m[5]; const v = m[3] === '+' ? x + y : x - y; 맞다('길이합차', a, `${Math.floor(v / 100)}m ${v % 100}cm`, p); }
      if ((m = /자의 (\d+)cm 눈금에 맞추었더니 다른 끝이 (\d+)cm 눈금/.exec(p))) 맞다('눈금사이', 수(a), +m[2] - +m[1], p);
      if ((m = /^1cm가 (\d+)번이면/.exec(p)) || (m = /^(\d+)cm는 1cm가 몇 번/.exec(p))) 맞다('일센티', 수(a), +m[1], p);
      if ((m = /(\S+)[은는] 약 (\d+)(cm|m|g|mL), (\S+)[은는] 약 (\d+)\3(?:으로|로) 어림했습니다\. .*재어 보니 (\d+)\3/.exec(p))) {
        const [가, 나] = [Math.abs(+m[2] - +m[6]), Math.abs(+m[5] - +m[6])];
        맞다('어림', a, 가 < 나 ? m[1] : m[4], p);
      }
      if ((m = /(\S+ 끈)[은는] \S+?(?:으로|로) (\d+)번, (\S+ 끈)[은는] \S+?(?:으로|로) (\d+)번 잰 길이/.exec(p))) 맞다('같은단위', a, +m[2] > +m[4] ? m[1] : m[3], p);
      if ((m = /^같은 책상의 길이를 (\S+?)(?:으로|로) 재면 (\d+)번, (\S+?)(?:으로|로) 재면 (\d+)번/.exec(p))) 맞다('다른단위', a, +m[2] < +m[4] ? m[1] : m[3], p);
      if ((m = /짧은바늘이 (\d+)[과와] \d+ 사이에 있고, 긴바늘이 숫자 (\d+)(?:에서 작은 눈금 (\d)칸 더 간 곳)?[을를] 가리킵니다/.exec(p))) 맞다('바늘읽기', a, `${m[1]}시 ${+m[2] * 5 + +(m[3] ?? 0)}분`, p);
      if ((m = /^(\d+)시 (\d+)분은 몇 시 몇 분 전/.exec(p))) 맞다('몇분전', a, `${+m[1] + 1}시 ${60 - +m[2]}분 전`, p);
      if ((m = /^(\d)시간 (\d+)분은 몇 분/.exec(p))) 맞다('시간을분', 수(a), +m[1] * 60 + +m[2], p);
      if ((m = /^(\d+)분은 몇 시간 몇 분/.exec(p))) 맞다('분을시간', a, `${Math.floor(+m[1] / 60)}시간 ${+m[1] % 60}분`, p);
      if ((m = /^(\d+시(?: \d+분)?)부터 (\d+)분 동안 .+ 끝난 시각은/.exec(p))) 맞다('끝난시각', a, 시각글(분으로(m[1]) + +m[2]), p);
      if ((m = /^(\d+시(?: \d+분)?)부터 (\d+시(?: \d+분)?)까지 .+ 몇 분 동안/.exec(p))) 맞다('걸린분', 수(a), 분으로(m[2]) - 분으로(m[1]), p);
      if ((m = /^(\d)일은 몇 시간/.exec(p))) 맞다('하루', 수(a), +m[1] * 24, p);
      if ((m = /^오전 (\d+)시부터 오후 (\d+)시까지/.exec(p))) 맞다('오전오후', 수(a), 12 - +m[1] + +m[2], p);
      if ((m = /^(\d)주일(?: (\d)일)?[은는] 며칠/.exec(p))) 맞다('주일', 수(a), +m[1] * 7 + +(m[2] ?? 0), p);
      if ((m = /^어느 달 (\d+)일은 (\S+요일)입니다\. 같은 달 (\d+)일은/.exec(p))) 맞다('요일', a, 요일[(요일.indexOf(m[2]) + +m[3] - +m[1]) % 7], p);
      if ((m = /짧은바늘이 (\d+)(과 \d+ 사이|와 \d+ 사이)?에 있고, 긴바늘이 (6|12)[을를] 가리켰습니다/.exec(p))) 맞다('정각반읽기', a, m[3] === '6' ? `${m[1]}시 30분` : `${m[1]}시`, p);
      if ((m = /[은는] (\d+)시( 30분)?에 .+ 짧은바늘은 숫자 몇/.exec(p))) 맞다('짧은바늘', 수(a), +m[1], p);
      if (/^우리 반 학생들의 .+ 조사했더니/.test(p)) {
        const 표 = 항목들(p.split('조사했더니')[1].split('이었습니다')[0]);
        if ((m = /가장 (많은|적은) 학생이 고른 것은/.exec(p))) { const 값 = (m[1] === '많은' ? Math.max : Math.min)(...표.map((x) => x.수)); 맞다('표가장', a, 표.find((x) => x.수 === 값)!.이름, p); }
        if (/조사한 학생은 모두 몇 명/.test(p)) 맞다('표모두', 수(a), 표.reduce((s, x) => s + x.수, 0), p);
        if ((m = /(\S+)[을를] 고른 학생은 (\S+)[을를] 고른 학생보다 몇 명/.exec(p))) { const 수of = (n: string) => 표.find((x) => x.이름 === n)!.수; 맞다('표차', 수(a), 수of(m[1]) - 수of(m[2]), p); }
      }
      if ((m = /^우리 반 학생 (\d+)명의 .+ 조사했더니 (.+)이었습니다\. □에/.exec(p))) 맞다('표빈칸', 수(a), +m[1] - 항목들(m[2]).reduce((s, x) => s + x.수, 0), p);
      if ((m = /에 따라 분류했더니 (.+)였습니다\. (.+)$/.exec(p))) {
        const 표 = 항목들(m[1]);
        if (/모두 몇 개/.test(m[2])) 맞다('분류모두', 수(a), 표.reduce((s, x) => s + x.수, 0), p);
        if (/가장 많은 것은 가장 적은 것보다/.test(m[2])) 맞다('분류차', 수(a), Math.max(...표.map((x) => x.수)) - Math.min(...표.map((x) => x.수)), p);
      }
      if ((m = /^규칙에 따라 수를 늘어놓았습니다\. ([\d, ]+), □ — □/.exec(p))) { const xs = m[1].split(', ').map(Number); 맞다('수배열', 수(a), xs[3] + (xs[1] - xs[0]), p); }
      if ((m = /^규칙에 따라 모양을 늘어놓았습니다\. ([●▲■★ ]+) … (\S+)에 올 모양/.exec(p))) {
        const 줄 = m[1].trim().split(' ');
        const 묶음 = 줄.slice(0, 줄.length / 2);
        const n = 째.indexOf(m[2]) > 0 ? 째.indexOf(m[2]) : Number(m[2].replace('번째', ''));
        맞다('반복모양', a, 묶음[(n - 1) % 묶음.length], p);
      }
      if ((m = /가로줄의 (\d+)[과와] 세로줄의 (\d+)[이가] 만나는 칸/.exec(p))) 맞다('덧셈표', 수(a), +m[1] + +m[2], p);
      if ((m = /첫째에 (\d+)개, 둘째에 (\d+)개, 셋째에 (\d+)개 쌓았습니다\. .+ (\S+)에는 몇 개/.exec(p))) 맞다('늘어나는쌓기', 수(a), +m[1] + (+m[2] - +m[1]) * (째.indexOf(m[4]) - 1), p);
      if ((m = /^버스가 (\d+)시에 처음 떠나고 (\d+)분마다 떠납니다\. (\S+) 버스/.exec(p))) 맞다('버스', a, 시각글(+m[1] * 60 + +m[2] * (째.indexOf(m[3]) - 1)), p);
      if ((m = /^(삼각형|사각형|원) (\d)개(?:와|과) (삼각형|사각형|원) (\d)개의 (꼭짓점|변)[은는] 모두/.exec(p)) || (m = /^(삼각형|사각형|원) (\d)개의 (꼭짓점|변)[은는] 모두/.exec(p))) {
        const 변 = { 삼각형: 3, 사각형: 4, 원: 0 } as Record<string, number>;
        const v = m.length > 4 && m[4] ? 변[m[1]] * +m[2] + 변[m[3]] * +m[4] : 변[m[1]] * +m[2];
        맞다('꼭짓점합', 수(a), v, p);
      }
      if ((m = /^칠교판 (\d)개를 모두 흩어 놓았습니다\. (삼각형 모양 조각|사각형 모양 조각|조각)[은는]/.exec(p))) 맞다('칠교', 수(a), +m[1] * (m[2] === '조각' ? 7 : m[2].startsWith('삼각형') ? 5 : 2), p);
      if (/^쌓기나무를 (?:\d층에 \d개, )*\d층에 \d개 쌓았습니다\. 쌓기나무는 모두 몇 개/.test(p)) 맞다('층쌓기', 수(a), [...p.matchAll(/\d층에 (\d)개/g)].reduce((s, x) => s + +x[1], 0), p);
      if ((m = /^\S+[은는] 바둑돌 (\d)개, \S+[은는] 바둑돌 (\d)개와 무게가 같습니다/.exec(p)) || (m = /^\S+[은는] 작은 칸 (\d)개, \S+[은는] 작은 칸 (\d)개로 덮을/.exec(p)) || (m = /작은 컵으로 (\d)번, .+작은 컵으로 (\d)번 부을/.exec(p))) {
        const 이름 = [...p.matchAll(/(?:^|, )(\S+?)(?:은|는|에) /g)].map((x) => x[1]).slice(0, 2);
        맞다('견주기', a, +m[1] > +m[2] ? 이름[0] : 이름[1], p);
      }
      if ((m = /^(\d)명이 한 줄로 서 있습니다\. \S+ 앞에서 (\S+)입니다/.exec(p))) 맞다('몇째', a, 째[+m[1] - 째.indexOf(m[2]) + 1], p);
      if ((m = /^(\d+)[과와] (\d+)[을를] 모으면 얼마/.exec(p))) 맞다('모으기', 수(a), +m[1] + +m[2], p);
      if ((m = /^(\d+)[은는] (\d+)[과와] 몇으로 가를 수/.exec(p))) 맞다('가르기', 수(a), +m[1] - +m[2], p);
      if (/^그림에서 \S+[은는] 몇/.test(p) && q.visual?.kind === 'counters') 맞다('그림세기', 수(a), q.visual.groups[0].count, p);
      if ((m = /모양별로 세었더니 (.+)였습니다\. 가장 (많은|적은) 모양은/.exec(p))) { const 표 = [...m[1].matchAll(/(\S+ 모양) (\d)개/g)].map((x) => ({ 이름: x[1], 수: +x[2] })); const 값 = (m[2] === '많은' ? Math.max : Math.min)(...표.map((x) => x.수)); 맞다('모양견주기', a, 표.find((x) => x.수 === 값)!.이름, p); }
      if ((m = /^100이 (\d)개이면 얼마/.exec(p))) 맞다('몇백', 수(a), +m[1] * 100, p);
      if ((m = /^(\d)00[은는] 100이 몇 개/.exec(p))) 맞다('몇백거꾸로', 수(a), +m[1], p);
      if ((m = /한 \S+에 100\D+씩 들어 있습니다\. (\d)\S+에는/.exec(p))) 맞다('백씩', 수(a), +m[1] * 100, p);
      if ((m = /^(\d+)÷(\d+)의 몫은 \d×□=\d+에서/.exec(p))) 맞다('몫곱셈', 수(a), +m[1] / +m[2], p);
      if ((m = /^반지름이 (\d+) cm인 원의 지름/.exec(p))) 맞다('지름', 수(a), +m[1] * 2, p);
      if ((m = /^지름이 (\d+) cm인 원의 반지름/.exec(p))) 맞다('반지름', 수(a), +m[1] / 2, p);
      if ((m = /^한 변이 (\d+) cm인 정(\S)각형의 모든 변/.exec(p))) 맞다('정다각형둘레', 수(a), +m[1] * '   삼사오육칠팔'.indexOf(m[2]), p);
      if ((m = /^모든 변의 길이의 합이 (\d+) cm인 정(\S)각형의 한 변/.exec(p))) 맞다('정다각형한변', 수(a), +m[1] / '   삼사오육칠팔'.indexOf(m[2]), p);
      if ((m = /^어떤 자연수를 (올림|버림|반올림)하여 (십|백)의 자리까지 나타내었더니 (\d+)[이가] 되었습니다\. .+ 가장 (작은|큰) 수는/.exec(p))) {
        const 자리 = m[2] === '십' ? 10 : 100;
        const 어림 = (x: number) => (m![1] === '올림' ? Math.ceil(x / 자리) : m![1] === '버림' ? Math.floor(x / 자리) : Math.round(x / 자리)) * 자리;
        const 된다 = Array.from({ length: 2000 }, (_, k) => k + 1).filter((x) => 어림(x) === +m![3]);
        맞다('어림거꾸로', 수(a), m[4] === '작은' ? 된다[0] : 된다[된다.length - 1], p);
      }
      if ((m = /^지름이 (\d+) cm인 원의 원주는 몇 cm일까요\? \(원주율: 3\.14\)$/.exec(p))) 맞다('원주', 수(a), Math.round(+m[1] * 314) / 100, p);
      if ((m = /^원주가 ([\d.]+) cm인 원의 지름은 몇 cm일까요\? \(원주율: 3\.14\)$/.exec(p))) 맞다('원주로지름', 수(a), Math.round(+m[1] / 3.14), p);
      if ((m = /^(지름|반지름)이 (\d+) cm인 원의 넓이는 몇 cm²일까요\? \(원주율: 3\.14\)$/.exec(p))) { const r = m[1] === '지름' ? +m[2] / 2 : +m[2]; 맞다('원넓이', 수(a.replace('cm²', '')), Math.round(r * r * 314) / 100, p); }
      if ((m = /^반지름이 (\d+) cm인 구의 지름/.exec(p))) 맞다('구지름', 수(a), +m[1] * 2, p);
      if ((m = /반원의 지름이 (\d+) cm이면 구의 반지름/.exec(p))) 맞다('구반지름', 수(a), +m[1] / 2, p);
      if ((m = /^밑면의 반지름이 (\d+) cm, 모선의 길이가 (\d+) cm인 원뿔을 앞에서 보면 .+ (밑변|길이가 같은 두 변)/.exec(p))) 맞다('원뿔앞', 수(a), m[3] === '밑변' ? +m[1] * 2 : +m[2], p);
      // ── 그림 묶음
      const v = q.visual;
      if (v?.kind === 'figure-set' && (m = /^그림에서 (사다리꼴|평행사변형|마름모|직사각형|정사각형)(은|는|이|가) (어느 것일까요|아닌 것은)/.exec(p))) {
        const 이름들 = v.items.map((it) => 사각이름(it.points as 점[]));
        const 맞는 = v.items.map((it, k) => ({ 이름: it.name, 속함: 이름들[k].includes(m![1]) }));
        const 고를 = m[3].startsWith('아닌') ? 맞는.filter((x) => !x.속함) : 맞는.filter((x) => x.속함);
        expect(고를, p).toHaveLength(1);
        맞다('사각형고르기', a, 고를[0].이름, p);
      }
      if (v?.kind === 'figure-set' && (m = /^그림의 사각형 가운데 (\S+?)[은는] 모두 몇 개/.exec(p))) 맞다('사각형세기', 수(a), v.items.filter((it) => 사각이름(it.points as 점[]).includes(m![1])).length, p);
      if (v?.kind === 'figure-set' && (m = /^그림에서 (삼각형|사각형|원)[은는] 모두 몇 개/.exec(p))) {
        const 꼴 = (it: (typeof v.items)[number]) => (it.shape === '원' ? '원' : it.points!.length === 3 ? '삼각형' : '사각형');
        맞다('도형세기', 수(a), v.items.filter((it) => 꼴(it) === m![1]).length, p);
      }
      if (v?.kind === 'figure-set' && (m = /^그림에서 (정삼각형|이등변삼각형)[은는] 어느 것/.exec(p))) {
        const 변들 = v.items.map((it) => { const t = it.points as 점[]; return [길이(t[0], t[1]), 길이(t[1], t[2]), 길이(t[2], t[0])]; });
        const 맞음 = 변들.map(([x, y, z]) => (m![1] === '정삼각형' ? 같다(x, y) && 같다(y, z) : 같다(x, y) || 같다(y, z) || 같다(x, z)));
        expect(맞음.filter(Boolean), p).toHaveLength(1);
        맞다('삼각형고르기', a, v.items[맞음.indexOf(true)].name, p);
      }
      if (v?.kind === 'line-figure' && /두 선분이 서로 수직인 것은/.test(p)) {
        const 직각 = v.items.map((it) => 직각이다(it.points[0], it.points[1], it.points[2]));
        expect(직각.filter(Boolean), p).toHaveLength(1);
        맞다('수직', a, v.items[직각.indexOf(true)].name, p);
      }
      if (v?.kind === 'figure-set' && (m = /^처음 도형을 (시계 방향|시계 반대 방향)으로 (\d+)°만큼 돌린 도형은/.exec(p))) {
        const 처음 = v.items[0].rotate ?? 0;
        const 바라는 = (처음 + (m[1] === '시계 방향' ? +m[2] : 360 - +m[2])) % 360;
        const 맞음 = v.items.slice(1).filter((it) => (it.rotate ?? 0) % 360 === 바라는 && !it.flip);
        맞다('돌리기', a, 맞음.length === 1 ? 맞음[0].name : '없습니다', p);
      }
      if (v?.kind === 'figure-set' && /선대칭도형입니다\. 대칭축은 모두 몇 개/.test(p)) 맞다('대칭축', 수(a), 대칭축수(v.items[0].points as 점[]), p);
      if (v?.kind === 'circles' && /^그림에서 원의 (지름|반지름)/.test(p)) { const r = v.circles[0].r; 맞다('원그림', 수(a), /지름은/.test(p) && !/반지름/.test(p) ? 2 * r : r, p); }
      if (v?.kind === 'circles' && /맞닿게 한 줄로 놓고 둘레에 꼭 맞는 직사각형/.test(p)) 맞다('원이어붙이기', 수(a), v.rect!.w, p);
      if (v?.kind === 'marble-bag' && (m = /(\S+) 공이 나올 가능성을 (말로|수로)/.exec(p))) {
        const 색 = { 빨간: 'red', 파란: 'blue', 노란: 'yellow', 초록: 'green' }[m[1]]!;
        const 공 = v.bags[0].marbles;
        const k = 공.filter((c) => c === 색).length;
        const n = 공.length;
        const 말 = k === 0 ? '불가능하다' : k === n ? '확실하다' : k * 2 === n ? '반반이다' : k * 2 < n ? '~아닐 것 같다' : '~일 것 같다';
        맞다('가능성', a, m[2] === '말로' ? 말 : k === 0 ? '0' : k === n ? '1' : '1/2', p);
      }
      if (v?.kind === 'marble-bag' && (m = /(\S+) 공을 꺼낼 가능성이 더 큰 주머니/.exec(p))) {
        const 색 = { 빨간: 'red', 파란: 'blue', 노란: 'yellow', 초록: 'green' }[m[1]]!;
        const 몫 = v.bags.map((b) => b.marbles.filter((c) => c === 색).length / b.marbles.length);
        맞다('가능성견주기', a, 몫[0] > 몫[1] ? '가' : '나', p);
      }
      if (v?.kind === 'partition' && (m = /색칠한 부분을 (대분수|가분수)로/.exec(p))) {
        const d = v.figures[0].parts!;
        const n = v.figures.reduce((s0, f) => s0 + f.shaded.length, 0);
        const 대 = `${Math.floor(n / d)}${'영일이삼사오육칠팔구'[Math.floor(n / d)].match(/[일삼칠팔]/) ? '과' : '와'} ${n % d}/${d}`;
        맞다('분수띠', a, m[1] === '가분수' ? `${n}/${d}` : 대, p);
      }
      if (v?.kind === 'ruler' && /^자에서 색칠한 부분은 1cm가 몇 번/.test(p)) 맞다('자그림', 수(a), v.highlightEnd - v.highlightStart, p);
      if (v?.kind === 'pattern' && /빈칸에 알맞은 모양은/.test(p)) 맞다('무늬', a, v.items[v.missingIndex!], p);
      // ── 둘째 묶음
      if ((m = /^그림에서 (\S+?)[과와] (\S+?)[을를] 세어 보세요\. 어느 것이 더 (많을|적을)까요/.exec(p)) && q.visual?.kind === 'counters') {
        const [x, y] = q.visual.groups.map((g) => g.count);
        맞다('그림둘견주기', a, (x > y) === (m[3] === '많을') ? m[1] : m[2], p);
      }
      if ((m = /^어떤 수보다 (\d+)만큼 더 (큰|작은) 수는 (\d+)입니다/.exec(p))) 맞다('만큼거꾸로', 수(a), +m[3] + (m[2] === '큰' ? -1 : 1) * +m[1], p);
      if ((m = /모았더니 (\d+)\D+ 되었습니다\. \S+ \S+ (\d+)\D+이면/.exec(p))) 맞다('모으기거꾸로', 수(a), +m[1] - +m[2], p);
      if ((m = /(\d+)\D+ 가지고 있습니다\. 10\D+ 되려면 몇/.exec(p))) 맞다('십채우기', 수(a), 10 - +m[1], p);
      if ((m = /10\D+씩 (\d)\S+ 낱개 (\d)\D+ 있습니다\. \S+ 모두 몇/.exec(p))) 맞다('묶음낱개이야기', 수(a), +m[1] * 10 + +m[2], p);
      if ((m = /^\S+ (\d)\D+씩 (\d)묶음으로 묶었습니다/.exec(p))) 맞다('묶어세기이야기', 수(a), +m[1] * +m[2], p);
      if ((m = /^곱셈표의 (\d)단\(.+\)에서 (\d+)보다 큰 수는 모두 몇 개/.exec(p))) { const 단 = +m[1]; 맞다('곱셈표세기', 수(a), Array.from({ length: 9 }, (_, k) => 단 * (k + 1)).filter((x) => x > +m![2]).length, p); }
      if ((m = /덧셈표에서 합이 (\d+)인 칸은 모두 몇 개/.exec(p))) { const n = +m[1]; 맞다('덧셈표세기', 수(a), Array.from({ length: 9 }, (_, k) => k + 1).filter((x) => n - x >= 1 && n - x <= 9).length, p); }
      if ((m = /^(\S+ 끈)[은는] (\d)m (\d+)cm이고, (\S+ 끈)[은는] (\d+)cm입니다/.exec(p))) 맞다('길이견주기', a, +m[2] * 100 + +m[3] > +m[5] ? m[1] : m[4], p);
      if ((m = /^구슬을 ([가-힣, ]+) … 차례로 되풀이하여 꿰었습니다\. (\S+) 구슬은/.exec(p))) { const 줄 = m[1].split(', '); const 묶음 = 줄.slice(0, 줄.length / 2); 맞다('색반복', a, 묶음[(째.indexOf(m[2]) - 1) % 묶음.length], p); }
      if ((m = /똑같이 (\d+)조각으로 나누어 (\d+)조각을 \S+ (남은|먹은|쓴) 양은/.exec(p))) 맞다('분수로', a, m[3] === '남은' ? `${+m[1] - +m[2]}/${m[1]}` : `${m[2]}/${m[1]}`, p);
      if ((m = /^(\d+) cm (\d) mm는 몇 mm/.exec(p))) 맞다('mm로', 수(a), +m[1] * 10 + +m[2], p);
      if ((m = /^(\d) km (\d+) m는 몇 m/.exec(p))) 맞다('m로', 수(a), +m[1] * 1000 + +m[2], p);
      if ((m = /^(\d+)÷(\d+)[은는] 얼마일까요/.exec(p))) 맞다('나눗셈', 수(a), +m[1] / +m[2], p);
      if ((m = /^컴퍼스를 (\d+) cm만큼 벌려서 원을 그렸습니다\. 그린 원의 지름/.exec(p))) 맞다('컴퍼스', 수(a), +m[1] * 2, p);
      if ((m = /^두 각의 크기의 합이 (\d+)°입니다\. 한 각이 (\d+)°이면/.exec(p))) 맞다('각도거꾸로', 수(a), +m[1] - +m[2], p);
      if ((m = /^(\d+)°([+-])(\d+)°는 몇 도/.exec(p))) 맞다('각도계산', 수(a), m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3], p);
      if ((m = /^(\d+)°인 각은 예각, 직각, 둔각 가운데/.exec(p))) 맞다('예각둔각', a, +m[1] < 90 ? '예각' : +m[1] === 90 ? '직각' : '둔각', p);
      if ((m = /(\d+)개와 \S+ (\d+)개를 남김없이 될 수 있는 대로 많은 사람에게/.exec(p))) { const g = (x: number, y: number): number => (y ? g(y, x % y) : x); 맞다('최대공약수생활', 수(a), g(+m[1], +m[2]), p); }
      if ((m = /가 버스는 (\d+)분마다, 나 버스는 (\d+)분마다 출발합니다/.exec(p))) { const g = (x: number, y: number): number => (y ? g(y, x % y) : x); 맞다('최소공배수생활', 수(a), (+m[1] * +m[2]) / g(+m[1], +m[2]), p); }
      if ((m = /^(\d+)\/(\d+)[과와] 크기가 같은 분수 가운데 분모가 (\d+)인 분수/.exec(p))) 맞다('같은분수', a, `${(+m[1] * +m[3]) / +m[2]}/${m[3]}`, p);
      if ((m = /^(\d) m²는 몇 cm²/.exec(p))) 맞다('m²', 수(a.replace('cm²', '')), +m[1] * 10000, p);
      if ((m = /^(\d) km²는 몇 m²/.exec(p))) 맞다('km²', 수(a.replace('m²', '')), +m[1] * 1000000, p);
      if ((m = /^한 모서리가 (\d+) cm인 정육면체의 모든 모서리/.exec(p))) 맞다('정육면체합', 수(a), +m[1] * 12, p);
      if ((m = /^모든 모서리의 길이의 합이 (\d+) cm인 정육면체의 한 모서리/.exec(p))) 맞다('정육면체한모서리', 수(a), +m[1] / 12, p);
    }
  });

  it('늘린 문항이 모두 쓰입니다', () => {
    const 바라는 = ['묶음낱개', '자릿값', '자리숫자', '나타내는값', '수읽기', '수쓰기', '뛰어세기', '두수비교', '세수비교', '사이개수', '만큼큰수', '계산', '세수계산', '더하기이야기', '빼기이야기', '차이야기', '네모식', '어떤수', '곱', '영일', '묶음이야기', '곱네모', '묶어세기', '같은수더하기', '곱셈식으로', '몇배', '빈묶음', '곱셈표', 'm를cm로', 'cm를m로', '길이합차', '눈금사이', '일센티', '어림', '같은단위', '다른단위', '바늘읽기', '몇분전', '시간을분', '분을시간', '끝난시각', '걸린분', '하루', '오전오후', '주일', '요일', '정각반읽기', '짧은바늘', '표가장', '표모두', '표차', '표빈칸', '분류모두', '분류차', '수배열', '반복모양', '덧셈표', '늘어나는쌓기', '버스', '꼭짓점합', '칠교', '층쌓기', '견주기', '몇째', '모으기', '가르기', '그림세기', '모양견주기', '몇백', '몇백거꾸로', '백씩', '몫곱셈', '지름', '반지름', '정다각형둘레', '정다각형한변', '어림거꾸로', '원주', '원주로지름', '원넓이', '구지름', '구반지름', '원뿔앞', '정육면체합', '정육면체한모서리', '그림둘견주기', '만큼거꾸로', '모으기거꾸로', '십채우기', '묶음낱개이야기', '묶어세기이야기', '곱셈표세기', '덧셈표세기', '길이견주기', '색반복', '분수로', 'mm로', 'm로', '나눗셈', '컴퍼스', '각도거꾸로', '각도계산', '예각둔각', '최대공약수생활', '최소공배수생활', '같은분수', 'm²', 'km²', '사각형고르기', '사각형세기', '도형세기', '삼각형고르기', '수직', '돌리기', '대칭축', '원그림', '원이어붙이기', '가능성', '가능성견주기', '분수띠', '자그림', '무늬'];
    expect(바라는.filter((k) => !셈.get(k))).toEqual([]);
  });

  it('보기에 답이 꼭 하나 있고, 조사가 괄호 꼴로 남지 않습니다', () => {
    const 잘못: string[] = [];
    for (const { q } of 문항들) {
      if (!q.manipulate && q.choices.filter((c) => c === q.answer).length !== 1) 잘못.push(`보기: ${q.prompt}`);
      if (/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로/.test([q.prompt, q.answer, ...q.choices].join(' '))) 잘못.push(`조사: ${q.prompt}`);
      if (/'[을를은는이가]/.test(q.prompt) && /[가-힣]'/.test(q.prompt)) {
        // 따옴표 안 말의 받침에 맞는 조사인지 봅니다.
        const m = /([가-힣])'([을를은는이가]) /.exec(q.prompt);
        if (m) {
          const 받침 = (m[1].charCodeAt(0) - 0xac00) % 28 !== 0;
          if ((['을', '은', '이'].includes(m[2])) !== 받침) 잘못.push(`따옴표 조사: ${q.prompt}`);
        }
      }
    }
    expect(잘못).toEqual([]);
  });

  it('1·2학년 차시의 수 범위와 곱셈구구 단을 지킵니다', () => {
    const 넘침: string[] = [];
    for (const { q, l } of 문항들) {
      // 늘림 뭉치에서 나온 문항만 봅니다(처음 판의 문항은 lessonScope.test.ts가 봅니다).
      if (!/^[12]-/.test(l.semester) || !늘림문항(q)) continue;
      const 끝 = 수범위(l)!;
      const 큰 = Math.max(0, ...([q.prompt, ...q.choices].join(' ').match(/\d+/g) ?? []).map(Number));
      if (큰 > 끝) 넘침.push(`${l.semester} ${l.unitNo}-${l.lessonNo}: ${큰} > ${끝} — ${q.prompt}`);
      const 단 = [...q.prompt.matchAll(/(\d)단/g)].map((x) => Number(x[1]));
      if (l.scope.dans && 단.some((d) => !l.scope.dans!.includes(d))) 넘침.push(`단: ${q.prompt}`);
    }
    expect(넘침).toEqual([]);
  });
});
