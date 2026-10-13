import { describe, expect, it } from 'vitest';
import type { Difficulty, Question, SymmetryDrawVisual } from '../../../types';
import { curriculum5 } from '../../curriculum5';
import { generateQuestions } from '../../questionFactory';

// 그리는 과정 문항의 답을 그림의 좌표만 보고 따로 계산해 맞춰 봅니다.
// 문항을 만든 코드(drawing.ts)는 쓰지 않습니다.
type P = [number, number];
const 단원 = curriculum5.find((u) => u.title === '합동과 대칭')!;
const 문항들: Array<{ q: Question; v: SymmetryDrawVisual; 차시: number }> = [];
for (const lesson of 단원.lessons) {
  for (const lv of ['하', '중', '상'] as Difficulty[]) {
    for (const q of generateQuestions(lesson, lv)) {
      if (q.visual?.kind === 'symmetry-draw') 문항들.push({ q, v: q.visual, 차시: lesson.lessonNo });
    }
  }
}

const 비춤 = (v: SymmetryDrawVisual, p: P): P => {
  if (v.mode === 'line') return [v.axisX! * 2 - p[0], p[1]];
  if (v.mode === 'point') return [v.center![0] * 2 - p[0], v.center![1] * 2 - p[1]];
  // 합동: 점 ㄱ이 점 ㄹ로 간 만큼 옮깁니다.
  const ㄹ = v.drawn!.find((d) => d.name === 'ㄹ')!.at;
  return [p[0] + ㄹ[0] - v.shape[0][0], p[1] + ㄹ[1] - v.shape[0][1]];
};
const 위치 = (v: SymmetryDrawVisual, 이름: string): P => v.shape[v.names.indexOf(이름)];
// '오른쪽으로 2칸, 위쪽으로 1칸'을 (2, -1)로 읽습니다.
const 읽기 = (말: string): P => {
  let x = 0;
  let y = 0;
  for (const m of 말.matchAll(/(오른쪽|왼쪽|위쪽|아래쪽)으로 (\d+)칸/g)) {
    const n = Number(m[2]);
    if (m[1] === '오른쪽') x += n;
    if (m[1] === '왼쪽') x -= n;
    if (m[1] === '아래쪽') y += n;
    if (m[1] === '위쪽') y -= n;
  }
  return [x, y];
};

describe('모눈에 그리는 과정 문항(5-2 3단원)', () => {
  it('3·5·7차시 세 수준에 모두 나옵니다', () => {
    for (const 차시 of [3, 5, 7]) {
      expect(문항들.filter((one) => one.차시 === 차시).length, `${차시}차시`).toBeGreaterThanOrEqual(6);
    }
    expect(문항들.every((one) => [3, 5, 7].includes(one.차시))).toBe(true);
  });

  it('그림의 점은 모두 모눈 안에 있고, 반쪽과 대응점이 겹치지 않습니다', () => {
    for (const { v, q } of 문항들) {
      const 모든 = [...v.shape, ...(v.drawn ?? []).map((d) => d.at), ...(v.candidates ?? []).map((c) => c.at)];
      for (const p of 모든) {
        expect(p[0] >= 0 && p[0] <= v.cols && p[1] >= 0 && p[1] <= v.rows, q.prompt).toBe(true);
      }
      if (v.mode === 'line') {
        // 반쪽은 대칭축 오른쪽에만, 양 끝은 축 위에 있습니다.
        expect(v.shape[0][0]).toBe(v.axisX);
        expect(v.shape[v.shape.length - 1][0]).toBe(v.axisX);
        for (const p of v.shape.slice(1, -1)) expect(p[0]).toBeGreaterThan(v.axisX!);
      }
      if (v.mode === 'point') {
        // 양 끝은 중심을 사이에 두고 마주 봅니다.
        const 끝 = 비춤(v, v.shape[0]);
        expect(끝).toEqual(v.shape[v.shape.length - 1]);
      }
      // 대칭의 중심 위에는 아무 점도 두지 않습니다.
      if (v.mode === 'point') {
        for (const p of [...(v.drawn ?? []).map((d) => d.at), ...(v.candidates ?? []).map((c) => c.at)]) {
          expect(p[0] === v.center![0] && p[1] === v.center![1], q.prompt).toBe(false);
        }
      }
      // 고를 자리는 서로 다릅니다.
      const 자리 = (v.candidates ?? []).map((c) => c.at.join(','));
      expect(new Set(자리).size).toBe(자리.length);
    }
  });

  it('가·나·다·라 가운데 대응점에 놓인 것은 정답 하나뿐입니다', () => {
    let n = 0;
    for (const { q, v } of 문항들) {
      if (!v.candidates) continue;
      n += 1;
      const 누구 = v.mode === 'copy' ? 'ㄷ' : /점 (\S)의 대응점을/.exec(q.prompt)![1];
      const 바른 = 비춤(v, 위치(v, 누구));
      const 맞는 = v.candidates.filter((c) => c.at[0] === 바른[0] && c.at[1] === 바른[1]);
      expect(맞는.length, q.prompt).toBe(1);
      expect(q.answer).toBe(맞는[0].name);
      expect(q.choices).toContain(q.answer);
    }
    expect(n).toBeGreaterThan(10);
  });

  it('칸 수를 묻는 답이 그림과 맞습니다', () => {
    let n = 0;
    for (const { q, v } of 문항들) {
      if (!/몇 칸|어디에 찍어야 할까요\?$/.test(q.prompt) || v.candidates) continue;
      n += 1;
      if (v.mode === 'line') {
        const 누구 = /점 (\S)의 대응점은/.exec(q.prompt)![1];
        const 바른 = 비춤(v, 위치(v, 누구));
        const 칸 = v.axisX! - 바른[0];
        expect(q.answer).toBe(`대칭축에서 ${칸 > 0 ? '왼쪽' : '오른쪽'}으로 ${Math.abs(칸)}칸`);
      } else if (v.mode === 'point') {
        const 누구 = /점 (\S)의 대응점은/.exec(q.prompt)![1];
        const 바른 = 비춤(v, 위치(v, 누구));
        expect(읽기(q.answer), q.prompt).toEqual([바른[0] - v.center![0], 바른[1] - v.center![1]]);
      } else {
        const ㅁ = v.drawn!.find((d) => d.name === 'ㅁ')!.at;
        const ㅂ = 비춤(v, 위치(v, 'ㄷ'));
        expect(읽기(q.answer), q.prompt).toEqual([ㅂ[0] - ㅁ[0], ㅂ[1] - ㅁ[1]]);
      }
      // 오답은 어느 것도 바른 칸 수가 아닙니다.
      for (const w of q.choices.filter((c) => c !== q.answer)) {
        expect(읽기(w), w).not.toEqual(읽기(q.answer));
      }
    }
    expect(n).toBeGreaterThan(5);
  });

  it('잘못 찍은 점을 찾는 문항: 그림에서 어긋난 점은 정확히 하나이고 그것이 답입니다', () => {
    let n = 0;
    for (const { q, v } of 문항들) {
      if (!/잘못 찍은 점/.test(q.prompt)) continue;
      n += 1;
      const 짝 = [...q.prompt.matchAll(/점 (\S)의 대응점은 점 (\S)/g)].map((m) => [m[1], m[2]]);
      expect(짝.length).toBe(v.drawn!.length);
      const 틀린 = 짝.filter(([원래, 찍은]) => {
        const 바른 = 비춤(v, 위치(v, 원래));
        const at = v.drawn!.find((d) => d.name === 찍은)!.at;
        return at[0] !== 바른[0] || at[1] !== 바른[1];
      });
      expect(틀린.length, q.prompt).toBe(1);
      expect(q.answer).toBe(`점 ${틀린[0][1]}`);
    }
    expect(n).toBeGreaterThan(3);
  });

  it('다음에 할 일 문항: 그림에 그려 둔 데까지 보고 다음 걸음을 답합니다', () => {
    let n = 0;
    for (const { q, v } of 문항들) {
      if (!/다음에 할 일/.test(q.prompt)) continue;
      n += 1;
      const 걸음 = v.drawn ? 2 : v.guides ? 1 : 0;
      const 열쇠 = [/선을 긋습니다|직선을 긋습니다/, /대응점을 찍습니다/, /차례로 이어/][걸음];
      expect(q.answer, q.prompt).toMatch(열쇠);
      if (v.drawn) for (const d of v.drawn) expect(비춤(v, v.shape[v.drawn.indexOf(d) + 1])).toEqual(d.at);
    }
    expect(n).toBeGreaterThan(3);
  });
});
