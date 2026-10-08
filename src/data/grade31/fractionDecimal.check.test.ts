import { describe, expect, it } from 'vitest';
import { lessons31 } from '../curriculum31';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, PartitionVisual, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 3-1 6단원 분수와 소수 — 답을 처음부터 다시 셉니다
// ────────────────────────────────────────────────────────────────────
// 생성기의 셈을 가져오지 않고, 화면에 나가는 글과 그림만 보고 다시
// 풉니다. 그림의 조각 크기도 직접 재어 '똑같이 나누었는지'를 봅니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];
const 문항들: Question[] = lessons31
  .filter((one) => one.unitNo === 6)
  .flatMap((lesson) => levels.flatMap((level) => generateQuestions(lesson, level)));

type Fig = PartitionVisual['figures'][number];

/** 그림의 조각 크기(전체를 1로)입니다. */
const 조각들 = (fig: Fig): number[] => {
  if (fig.shape === 'grid') return Array((fig.rows ?? 1) * (fig.columns ?? 1)).fill(1 / ((fig.rows ?? 1) * (fig.columns ?? 1)));
  if (fig.shape === 'diag') return [0.25, 0.25, 0.25, 0.25];
  const bounds = fig.cuts?.length ? [0, ...fig.cuts, 1] : Array.from({ length: (fig.parts ?? 1) + 1 }, (_, at) => at / (fig.parts ?? 1));
  return bounds.slice(1).map((to, at) => to - bounds[at]);
};
const 똑같은가 = (fig: Fig) => {
  const sizes = 조각들(fig);
  return Math.max(...sizes) - Math.min(...sizes) < 1e-9;
};

type Num = { n: number; d: number };
const 수읽기 = (text: string): Num | null => {
  const t = text.trim();
  const f = /^(\d+)\/(\d+)$/.exec(t);
  if (f) return { n: Number(f[1]), d: Number(f[2]) };
  const dec = /^(\d+)(?:\.(\d))?$/.exec(t);
  if (dec) return { n: Number(dec[1]) * 10 + Number(dec[2] ?? 0), d: 10 };
  return null;
};
const 견주기 = (a: Num, b: Num) => Math.sign(a.n * b.d - b.n * a.d);
const 같은수 = (a: string, b: string) => {
  const x = 수읽기(a);
  const y = 수읽기(b);
  return !!x && !!y && 견주기(x, y) === 0;
};

describe('3-1 6단원 분수와 소수', () => {
  it('차시·수준마다 문항이 넉넉합니다', () => {
    for (const lesson of lessons31.filter((one) => one.unitNo === 6)) {
      for (const level of levels) {
        expect(generateQuestions(lesson, level).length, `${lesson.id} ${level}`).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('보기에 답과 값이 같은 다른 보기가 없습니다(0.5와 5/10처럼)', () => {
    for (const q of 문항들) {
      for (const choice of q.choices) {
        if (choice === q.answer) continue;
        expect(같은수(choice, q.answer), `${q.prompt} / ${choice}`).toBe(false);
      }
    }
  });

  it('답에 나오는 분수는 진분수, 소수는 소수 한 자리 수입니다', () => {
    for (const q of 문항들) {
      for (const m of q.answer.matchAll(/(\d+)\/(\d+)/g)) {
        expect(Number(m[1]) < Number(m[2]) && Number(m[2]) <= 10, `${q.prompt} → ${q.answer}`).toBe(true);
      }
      // 0.10은 '0.1이 10개이면 0.10'이라는 오개념을 겨눈 보기라 보기에만 둡니다.
      expect(/\d\.\d\d/.test(q.answer), q.answer).toBe(false);
      for (const choice of q.choices) {
        if (choice === '0.10') continue;
        expect(/\d\.\d\d/.test(choice), `${q.prompt} / ${choice}`).toBe(false);
      }
    }
  });

  it('흐트러진 그림은 조각 크기가 눈에 띄게 다릅니다', () => {
    for (const q of 문항들) {
      if (q.visual?.kind !== 'partition') continue;
      for (const fig of q.visual.figures) {
        if (!fig.cuts) continue;
        const sizes = 조각들(fig);
        expect(Math.max(...sizes) / Math.min(...sizes), q.prompt).toBeGreaterThanOrEqual(1.4);
      }
    }
  });

  it('색칠한 부분의 분수를 그림에서 다시 셉니다', () => {
    let count = 0;
    for (const q of 문항들) {
      if (q.prompt !== '색칠한 부분은 전체의 얼마일까요?') continue;
      if (q.visual?.kind !== 'partition') throw new Error('그림이 없습니다');
      const fig = q.visual.figures[0];
      expect(똑같은가(fig)).toBe(true);
      expect(q.answer).toBe(`${fig.shaded.length}/${조각들(fig).length}`);
      count += 1;
    }
    expect(count).toBeGreaterThan(10);
  });

  it('여러 그림 가운데 고르는 문항은 맞는 그림이 하나뿐입니다', () => {
    let count = 0;
    for (const q of 문항들) {
      if (q.visual?.kind !== 'partition') continue;
      const 똑같이 = /^똑같이 (둘|셋|넷)\(?으?\)?로 나누어진 도형은/.exec(q.prompt) ?? /^똑같이 (둘|셋|넷)으?로 나누어진 도형은/.exec(q.prompt);
      const 색칠 = /^(\d+)\/(\d+)만큼 색칠한 것은/.exec(q.prompt);
      if (!똑같이 && !색칠) continue;
      const 맞는가 = (fig: Fig) => {
        if (!똑같은가(fig)) return false;
        if (똑같이) return 조각들(fig).length === { 둘: 2, 셋: 3, 넷: 4 }[똑같이[1] as '둘']!;
        return 조각들(fig).length === Number(색칠![2]) && fig.shaded.length === Number(색칠![1]);
      };
      const 맞은것 = q.visual.figures.filter(맞는가).map((fig) => fig.name);
      expect(맞은것, q.prompt).toEqual([q.answer]);
      count += 1;
    }
    expect(count).toBeGreaterThan(10);
  });

  it('똑같이 나누었는지 판단하는 문항이 그림과 맞습니다', () => {
    for (const q of 문항들) {
      if (!/^도형을 \d+조각으로 나누었습니다/.test(q.prompt)) continue;
      if (q.visual?.kind !== 'partition') throw new Error('그림이 없습니다');
      expect(q.answer.startsWith('똑같이 나누어졌습니다'), q.prompt).toBe(똑같은가(q.visual.figures[0]));
    }
  });

  it('크기 비교의 답이 맞습니다', () => {
    let count = 0;
    for (const q of 문항들) {
      const m = /^(\S+) ([<>=]) (\S+)$/.exec(q.answer);
      if (!m) continue;
      const a = 수읽기(m[1]);
      const b = 수읽기(m[3]);
      if (!a || !b) throw new Error(q.answer);
      expect({ '>': 1, '<': -1, '=': 0 }[m[2] as '>'], q.answer).toBe(견주기(a, b));
      count += 1;
    }
    expect(count).toBeGreaterThan(20);
  });

  it('가장 큰·작은 수와 차례가 맞습니다', () => {
    for (const q of 문항들) {
      const m = /^가장 (큰|작은) (?:분수|소수)는 어느 것일까요\? \((.+)\)$/.exec(q.prompt);
      if (m) {
        const list = m[2].split(', ').map((one) => ({ text: one, v: 수읽기(one)! }));
        const best = list.reduce((x, y) => (견주기(y.v, x.v) * (m[1] === '큰' ? 1 : -1) > 0 ? y : x));
        expect(q.answer, q.prompt).toBe(best.text);
      }
      const order = /^작은 분수부터 차례로 쓴 것은 어느 것일까요\?/.exec(q.prompt);
      if (order) {
        const list = q.answer.split(', ').map((one) => 수읽기(one)!);
        for (let at = 1; at < list.length; at += 1) expect(견주기(list[at - 1], list[at]), q.answer).toBe(-1);
      }
      const jump = /^멀리뛰기 기록입니다\. (.+)\. 멀리 뛴 사람부터/.exec(q.prompt);
      if (jump) {
        const rec = new Map(jump[1].split(', ').map((one) => {
          const [name, value] = one.split(' ');
          return [name, 수읽기(value)!] as const;
        }));
        const names = q.answer.split(', ');
        for (let at = 1; at < names.length; at += 1) expect(견주기(rec.get(names[at - 1])!, rec.get(names[at])!)).toBe(1);
      }
    }
  });

  it('분수와 소수, 0.1의 개수, mm와 cm를 서로 바꾼 답이 맞습니다', () => {
    for (const q of 문항들) {
      const f = /^(\d)\/10[을를] 소수로 나타내면/.exec(q.prompt);
      if (f) expect(q.answer).toBe(`0.${f[1]}`);
      const d = /^0\.(\d)[을를] 분수로 나타내면/.exec(q.prompt);
      if (d) expect(q.answer).toBe(`${d[1]}/10`);
      const count = /^(\d+(?:\.\d)?)[은는] 0\.1이 몇 개인 수일까요/.exec(q.prompt);
      if (count) expect(q.answer).toBe(`${수읽기(count[1])!.n}개`);
      const make = /^0\.1이 (\d+)개인 수는 얼마일까요/.exec(q.prompt);
      if (make) expect(수읽기(q.answer)!.n, q.prompt).toBe(Number(make[1]));
      const cmmm = /^(\d+) cm (\d) mm는 몇 cm일까요/.exec(q.prompt);
      if (cmmm) expect(q.answer).toBe(`${cmmm[1]}.${cmmm[2]} cm`);
      const mm = /^(\d+) mm는 몇 cm일까요/.exec(q.prompt);
      if (mm) expect(q.answer).toBe(`${Math.floor(Number(mm[1]) / 10)}.${Number(mm[1]) % 10} cm`);
      const unit = /^(\d+)\/(\d+)[은는] 1\/(\d+)이 몇 개일까요/.exec(q.prompt);
      if (unit) expect(q.answer).toBe(`${unit[1]}개`);
    }
  });

  it('수직선의 ⓐ가 답과 같은 자리에 있습니다', () => {
    let count = 0;
    for (const q of 문항들) {
      if (q.visual?.kind !== 'number-line' || !q.prompt.includes('ⓐ')) continue;
      const mark = q.visual.marks.find((one) => one.label === 'ⓐ')!;
      expect(Math.round(mark.value * 10), q.prompt).toBe(수읽기(q.answer)!.n);
      expect(mark.value > q.visual.start && mark.value < q.visual.end).toBe(true);
      count += 1;
    }
    expect(count).toBeGreaterThan(5);
  });

  it('소수 읽기는 소수점 아래를 숫자만 읽습니다', () => {
    const 숫자 = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    for (const q of 문항들) {
      const m = /^(\d)\.(\d)[을를] 바르게 읽은 것은/.exec(q.prompt);
      if (m) expect(q.answer).toBe(`${숫자[Number(m[1])]} 점 ${숫자[Number(m[2])]}`);
    }
  });

  it('조사가 괄호로 남지 않습니다', () => {
    for (const q of 문항들) {
      const all = [q.prompt, q.answer, ...q.choices, q.visual && 'label' in q.visual ? q.visual.label : ''].join(' ');
      expect(/\((을|를|은|는|이|가|과|와|으|이)\)/.test(all), all).toBe(false);
    }
  });
});
