import { describe, expect, it } from 'vitest';
import { lessons } from '../curriculum';
import { lessons51 } from '../curriculum51';
import { lessons5 } from '../curriculum5';
import { generateQuestions } from '../questionFactory';
import type { Difficulty, Question } from '../../types';

// ════════════════════════════════════════════════════════════════════
// 도형 그림 전수 검사
// ────────────────────────────────────────────────────────────────────
// 사다리꼴 넓이 문항에서 이런 그림이 나갔습니다.
//
//   문제 — 윗변 3 cm, 아랫변 12 cm, 높이 12 cm인 사다리꼴의 넓이는?
//   그림 — 아랫변 12 cm, 높이 12 cm, 그리고 비스듬한 변에 15 cm
//          (윗변의 길이는 그림 밖으로 잘려 나가 보이지 않음)
//
// 아이 눈에는 15가 3+12으로 읽힙니다. 풀이의 한 걸음을 그림이 미리
// 보여 준 셈이고, 정작 있어야 할 윗변은 없습니다.
//
// 지도서(5-1 142쪽·150쪽)가 그리는 꼴은 이렇습니다.
//   · 밑변·윗변·아랫변은 점선 호로 범위를 감싸고 이름을 함께 적는다
//   · 높이는 점선과 직각 표시로 긋는다
//   · 비스듬한 변에는 길이를 적지 않는다
//
// 그래서 여기서는 '그림에 적힌 수'와 '문제에 적힌 수'를 맞춰 봅니다.
// 사람이 눈으로 보아 확인하는 데 기대지 않습니다 — 문항은 3000개가
// 넘고, 잘린 글자는 눈에 띄지도 않습니다.
// ════════════════════════════════════════════════════════════════════

const levels: Difficulty[] = ['하', '중', '상'];

type 그림문항 = { where: string; question: Question };

const 그림문항들 = (): 그림문항[] => {
  const out: 그림문항[] = [];
  // 2학년까지 함께 봅니다. 도형 그림은 학년을 가리지 않고 같은 곳에서
  // 그리므로, 그리는 코드를 고치면 2학년 그림도 함께 달라집니다.
  for (const lesson of [...lessons51, ...lessons5, ...lessons]) {
    for (const level of levels) {
      for (const question of generateQuestions(lesson, level)) {
        if (question.visual?.kind !== 'figure-set') continue;
        out.push({ where: `${lesson.id} ${level} ${question.id}`, question });
      }
    }
  }
  return out;
};

const 수들 = (text: string) => (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

/** 그림에 글로 적힌 것을 모두 모읍니다. */
const 그림글 = (question: Question) => {
  const visual = question.visual;
  if (visual?.kind !== 'figure-set') return [] as string[];
  const out: string[] = [];
  for (const item of visual.items) {
    for (const edge of item.edgeLabels ?? []) out.push(edge.text);
    for (const line of item.diagonals ?? []) out.push(line.text);
    if (item.heightMark) out.push(item.heightMark.text);
  }
  return out;
};

describe('도형 그림', () => {
  const 문항들 = 그림문항들();

  it('볼 만큼 많다', () => {
    expect(문항들.length).toBeGreaterThan(200);
  });

  it('문제가 이름 부른 길이는 그림에도 있다', () => {
    // '윗변의 길이가 3 cm'라고 해 놓고 그림에 윗변이 없으면, 아이는
    // 그림에서 그 변을 찾을 수 없습니다.
    const 이름들 = ['윗변', '아랫변', '밑변', '높이'];
    const broken: string[] = [];
    for (const { where, question } of 문항들) {
      const 글들 = 그림글(question);
      if (!글들.length) continue;
      for (const 이름 of 이름들) {
        const 문제에 = new RegExp(`${이름}의 길이가 (\\d+)|${이름}가 (\\d+)|${이름}이 (\\d+)`).exec(question.prompt);
        if (!문제에) continue;
        const 값 = Number(문제에[1] ?? 문제에[2] ?? 문제에[3]);
        const 그림에 = 글들.some((one) => one.includes(이름) && 수들(one).includes(값));
        if (!그림에) {
          broken.push(`${where}: 그림에 ${이름} ${값}이(가) 없음 · 그림에 적힌 것 [${글들.join(' / ')}]`);
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 12)).toEqual([]);
  });

  it('그림에 적힌 수가 풀이의 한 걸음을 흘리지 않는다', () => {
    // 그림에 적힌 수는 문제에 주어진 수이거나, 넓이를 구하는 데 쓰지
    // 않는 변의 길이입니다. 그 길이가 하필 답이나 (두 변의 합)과 같으면
    // 아이는 그것을 셈의 결과로 읽습니다.
    const broken: string[] = [];
    for (const { where, question } of 문항들) {
      const 글들 = 그림글(question);
      if (!글들.length) continue;
      const 문제수 = 수들(question.prompt);
      const 답수 = 수들(question.answer);
      // 문제에 수가 없으면 그림이 곧 자료입니다. 합동인 두 도형에서
      // 대응변의 길이를 읽는 문항이 그렇습니다 — 그림에 답과 같은 수가
      // 적혀 있는 것이 문항의 뜻이지 흘리는 것이 아닙니다.
      if (문제수.length < 2) continue;
      // 문제에 주어진 수로 만들 수 있는, 풀이 도중에 나오는 값입니다.
      const 걸음: number[] = [...답수];
      for (const a of 문제수) {
        for (const b of 문제수) {
          if (a === b) continue;
          걸음.push(a + b, a * b);
        }
      }
      for (const 글 of 글들) {
        for (const 값 of 수들(글)) {
          if (문제수.includes(값)) continue;
          if (걸음.includes(값)) {
            broken.push(`${where}: 그림의 "${글}"이 풀이 도중의 수와 같음 · 문제 ${question.prompt.slice(0, 50)}`);
          }
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 12)).toEqual([]);
  });

  it('그림의 모양이 적힌 길이와 맞는다', () => {
    // 길이를 글로만 붙이고 모양은 정해 둔 것을 쓰면, 밑변 4 cm에 높이
    // 6 cm인 사다리꼴이 납작하게 그려집니다. 꼭짓점을 길이에서 계산해
    // 넘기고 있는지, 실제 자리로 재어 봅니다.
    const broken: string[] = [];
    for (const { where, question } of 문항들) {
      const visual = question.visual;
      if (visual?.kind !== 'figure-set') continue;
      for (const item of visual.items) {
        if (!item.points || !item.edgeLabels) continue;
        const 잰길이 = (from: number, to: number) => {
          const [x1, y1] = item.points![from];
          const [x2, y2] = item.points![to];
          return Math.hypot(x2 - x1, y2 - y1);
        };
        const 잰것 = item.edgeLabels
          .map((edge) => ({ 적힌: 수들(edge.text)[0], 잰: 잰길이(edge.from, edge.to), text: edge.text }))
          .filter((one) => Number.isFinite(one.적힌));
        if (잰것.length < 2) continue;
        // 그림은 줄여서 그리므로 길이 자체가 아니라 비를 봅니다.
        const 기준 = 잰것[0];
        for (const one of 잰것.slice(1)) {
          const 적힌비 = one.적힌 / 기준.적힌;
          const 잰비 = one.잰 / 기준.잰;
          if (Math.abs(적힌비 - 잰비) > 0.02) {
            broken.push(
              `${where}: "${기준.text}"과 "${one.text}"의 비가 그림에서 ${잰비.toFixed(2)}인데 적힌 수로는 ${적힌비.toFixed(2)}`,
            );
          }
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 12)).toEqual([]);
  });

  it('한 변에 두 가지 길이를 적지 않는다', () => {
    const broken: string[] = [];
    for (const { where, question } of 문항들) {
      const visual = question.visual;
      if (visual?.kind !== 'figure-set') continue;
      for (const item of visual.items) {
        const 본것 = new Set<string>();
        for (const edge of item.edgeLabels ?? []) {
          const key = [edge.from, edge.to].sort().join('-');
          if (본것.has(key)) broken.push(`${where}: 같은 변에 두 번 적음 (${key})`);
          본것.add(key);
        }
      }
    }
    expect([...new Set(broken)].sort().slice(0, 12)).toEqual([]);
  });
});
