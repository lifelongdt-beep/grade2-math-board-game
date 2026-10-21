import type { CounterIcon, QuestionVisual } from '../../types';
import type { G5Family, G5Spec } from '../grade5/build';
import { 결로, 글오답, 뭉치, 사이, 수문항, 하나 } from './common';
import type { 고르개형 } from './common';

// ════════════════════════════════════════════════════════════════════
// 그림이 바뀌는 문항 둘째 묶음
// ────────────────────────────────────────────────────────────────────
// 판을 거듭해도 문항이 적던 차시에, 수만이 아니라 그림이 바뀌는 문항을
// 더합니다. 각의 크기, 도형의 모양과 놓인 방향, 칠한 칸, 그래프의 점,
// 상자의 크기가 씨앗마다 달라지고 답은 그 그림에서 나옵니다. 검사
// (pictures2.check.test.ts)는 그림의 값만 보고 답을 다시 구합니다.
// ════════════════════════════════════════════════════════════════════

type 점 = [number, number];
const 이름표 = ['가', '나', '다', '라'];
const 글 = (x: number) => String(Math.round(x * 1000) / 1000);
const 붙이기 = (spec: G5Spec | null, visual: QuestionVisual): G5Spec | null => spec && { ...spec, visual };

/** 점들을 가운데로 모으고 -0.85~0.85 안에 들게 줄입니다. 가로·세로를 같은 비율로 줄이므로 각은 그대로입니다. */
const 맞추기 = (pts: 점[], 끝 = 0.85): 점[] => {
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2; const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const r = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 || 1;
  return pts.map(([x, y]) => [Math.round(((x - cx) / r) * 끝 * 1000) / 1000, Math.round(((y - cy) / r) * 끝 * 1000) / 1000]);
};
const 라디안 = (d: number) => (d * Math.PI) / 180;

/** 꼭짓점에서 두 반직선이 deg°만큼 벌어진 각입니다. 화면 좌표(아래가 +)로 적습니다. */
const 각점 = (next: 고르개형, deg: number): 점[] => {
  const 시작 = 사이(next, 0, 359);
  const a = 라디안(시작); const b = 라디안(시작 + deg);
  return 맞추기([[Math.cos(a), -Math.sin(a)], [0, 0], [Math.cos(b), -Math.sin(b)]]);
};

/** 두 점이 꼭짓점에서 이루는 각을 다시 잽니다(검사도 같은 방법으로 잽니다). */
export const 재기 = (p: 점[]): number => {
  const [a, o, b] = p;
  const u = [a[0] - o[0], a[1] - o[1]]; const v = [b[0] - o[0], b[1] - o[1]];
  return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180) / Math.PI;
};

// ── 3-1 2단원 직각, 4-1 2단원 예각·둔각·각도 어림 ──────────────────────

/** 직각이 아닌 각: 직각과 눈으로 구별되도록 30°쯤 떨어뜨립니다. */
const 예각하나 = (next: 고르개형) => 사이(next, 25, 65);
const 둔각하나 = (next: 고르개형) => 사이(next, 115, 160);

export const 각그림 = (꼴: '직각' | '예둔' | '어림'): G5Family =>
  뭉치(`pic-angles-${꼴}`, (next) => {
    const tag = 'angle';
    if (꼴 === '어림') {
      const 어림 = 사이(next, 2, 16) * 10; const d = 어림 + 사이(next, -3, 3);
      if (next(3) === 0) {
        const d2 = d + (next(2) ? 1 : -1) * 사이(next, 25, 60); if (d2 < 15 || d2 > 170) return null;
        const 답 = d > d2 ? '가' : '나';
        return 붙이기(결로(0, { prompt: '그림의 두 각 가와 나 가운데 더 큰 각은 어느 것일까요?', answer: 답, wrongs: 글오답(답, ['가', '나', '두 각의 크기가 같습니다', '알 수 없습니다']), tag, strategy: '두 각의 크기 견주기', hint: '두 반직선이 벌어진 정도를 견주어 보세요. 변의 길이는 각의 크기와 상관이 없습니다.', steps: [`가는 약 ${어림}°, 나는 약 ${Math.round(d2 / 10) * 10}°쯤 벌어져 있습니다.`, `더 많이 벌어진 ${답}이(가) 더 큰 각입니다.`] }), { kind: 'line-figure', label: '두 각', items: [{ name: '가', shape: 'angle', points: 각점(next, d) }, { name: '나', shape: 'angle', points: 각점(next, d2) }] });
      }
      const 후보 = [어림 - 30, 어림 + 30, 어림 + 60, 어림 - 60, 어림 + 90, 어림 - 90].filter((x) => x > 0 && x < 180);
      return 붙이기(결로(1, { prompt: '그림의 각도를 어림한 것으로 가장 알맞은 것은 어느 것일까요?', answer: `약 ${어림}°`, wrongs: 글오답(`약 ${어림}°`, 후보.map((x) => `약 ${x}°`)), tag, strategy: '직각을 기준으로 각도 어림하기', hint: '직각(90°)보다 큰지 작은지 먼저 보고, 직각의 반(45°)이나 직각과 반(135°)과도 견주어 보세요.', steps: [`그림의 각은 ${d < 90 ? '직각보다 작습니다' : d > 90 ? '직각보다 큽니다' : '직각쯤입니다'}.`, `${d}°쯤이므로 가장 가까운 것은 약 ${어림}°입니다.`] }), { kind: 'line-figure', label: '각', items: [{ shape: 'angle', points: 각점(next, d) }] });
    }
    // 네 각을 가~라로 그립니다.
    const 종류 = Array.from({ length: 4 }, () => next(3)); // 0 예각, 1 직각, 2 둔각
    const 각들 = 종류.map((k) => (k === 0 ? 예각하나(next) : k === 1 ? 90 : 둔각하나(next)));
    const visual: QuestionVisual = { kind: 'line-figure', label: '각 네 개', items: 각들.map((d, j) => ({ name: 이름표[j], shape: 'angle' as const, points: 각점(next, d) })) };
    const 세기 = (k: number) => 종류.filter((x) => x === k).length;
    const 말 = ['예각', '직각', '둔각'];
    if (꼴 === '직각') {
      if (next(2) === 0) {
        if (세기(1) !== 1) return null;
        const 답 = 이름표[종류.indexOf(1)];
        return 붙이기(결로(0, { prompt: '그림의 각 가운데 직각인 것은 어느 것일까요?', answer: 답, wrongs: 글오답(답, 이름표), tag, strategy: '삼각자의 직각을 대어 직각 찾기', hint: '삼각자의 직각 부분을 각의 꼭짓점에 대고 두 변이 꼭 맞는지 보세요.', steps: [`삼각자의 직각을 대어 보면 ${답}의 두 변이 꼭 맞습니다.`, `그러므로 직각은 ${답}입니다.`] }), visual);
      }
      const n = 세기(1);
      return 붙이기(수문항(1, '그림의 각 가운데 직각은 모두 몇 개일까요?', n, [4 - n, n + 1, n === 0 ? 2 : n - 1], { 단위: '개', tag, strategy: '여러 각에서 직각 세기', hint: '각마다 삼각자의 직각을 대어 보고, 꼭 맞는 것만 세어 보세요.', steps: [`삼각자의 직각과 꼭 맞는 각은 ${n ? 이름표.filter((_, j) => 종류[j] === 1).join(', ') : '없습니다'}${n ? '입니다' : ''}.`, `그러므로 직각은 ${n}개입니다.`], 아래: 0 }), visual);
    }
    const k = next(2) === 0 ? 0 : 2;
    if (next(2) === 0) {
      if (세기(k) !== 1) return null;
      const 답 = 이름표[종류.indexOf(k)];
      return 붙이기(결로(0, { prompt: `그림의 각 가운데 ${말[k]}은 어느 것일까요?`, answer: 답, wrongs: 글오답(답, 이름표), tag, strategy: '직각과 견주어 예각과 둔각 가리기', hint: '각마다 직각보다 작은지 큰지 견주어 보세요. 예각은 직각보다 작고, 둔각은 직각보다 크고 180°보다 작습니다.', steps: [`${답}은(는) 직각보다 ${k === 0 ? '작으므로 예각' : '크므로 둔각'}입니다.`, `나머지는 ${말[k]}이 아닙니다.`] }), visual);
    }
    const n = 세기(k);
    return 붙이기(수문항(1, `그림의 각 가운데 ${말[k]}은 모두 몇 개일까요?`, n, [4 - n, n + 1, 세기(1)], { 단위: '개', tag, strategy: '여러 각에서 예각·둔각 세기', hint: '각마다 직각보다 작은지, 직각인지, 직각보다 큰지 표시하며 세어 보세요.', steps: [`각마다 보면 ${각들.map((_, j) => `${이름표[j]} ${말[종류[j]]}`).join(', ')}입니다.`, `${말[k]}은 ${n}개입니다.`], 아래: 0 }), visual);
  });

// ── 4-1 2단원 삼각형·사각형의 각의 크기의 합 ─────────────────────────

const 꼭짓이름 = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'];

/** 각 a, b(도)를 가진 삼각형을 아무 방향으로 그립니다. */
const 삼각형점 = (next: 고르개형, a: number, b: number): 점[] => {
  const t = Math.sin(라디안(b)) / Math.sin(라디안(a + b));
  const 돌림 = 라디안(사이(next, 0, 359));
  const 기본: 점[] = [[0, 0], [1, 0], [t * Math.cos(라디안(a)), -t * Math.sin(라디안(a))]];
  return 맞추기(기본.map(([x, y]) => [x * Math.cos(돌림) - y * Math.sin(돌림), x * Math.sin(돌림) + y * Math.cos(돌림)]), 1);
};

export const 각합그림 = (사각: boolean): G5Family =>
  뭉치(`pic-angle-sum-${사각 ? 'quad' : 'tri'}`, (next) => {
    const tag = 'angle';
    const 합 = 사각 ? 360 : 180; const 이름 = 사각 ? '사각형' : '삼각형';
    let 점들: 점[]; let 각들: number[];
    if (!사각) {
      const a = 사이(next, 25, 110); const b = 사이(next, 25, 130 - Math.min(a, 100)); const c = 180 - a - b;
      if (c < 20) return null;
      점들 = 삼각형점(next, a, b); 각들 = [a, b, c];
    } else {
      // 볼록한 사각형의 꼭짓점을 고르고 그 각을 잽니다. 보인 세 각과 묻는 각의 합은 꼭 360°가 되게 묻는 각을 셈합니다.
      const 반지름 = [0, 1, 2, 3].map(() => 0.6 + next(5) / 10);
      const 방향 = [사이(next, 0, 40), 사이(next, 80, 130), 사이(next, 170, 220), 사이(next, 260, 310)];
      점들 = 맞추기(방향.map((d, j) => [반지름[j] * Math.cos(라디안(d)), -반지름[j] * Math.sin(라디안(d))] as 점), 1);
      각들 = 점들.map((_, j) => Math.round(재기([점들[(j + 3) % 4], 점들[j], 점들[(j + 1) % 4]])));
      if (각들.some((x) => x < 40 || x > 150)) return null;
      각들[3] = 360 - 각들[0] - 각들[1] - 각들[2];
      if (각들[3] < 40 || 각들[3] > 150) return null;
    }
    const 묻는 = next(각들.length);
    const v = 각들[묻는];
    const 보인 = 각들.filter((_, j) => j !== 묻는);
    const 그림: QuestionVisual = { kind: 'figure-set', label: 이름, items: [{ shape: 이름, active: true, points: 점들, vertexLabels: 꼭짓이름.slice(0, 각들.length), angleLabels: 각들.map((x, j) => ({ at: j, text: j === 묻는 ? '?' : `${x}°` })) }] };
    const 각이름 = (j: number) => `각 ${꼭짓이름[(j + 각들.length - 1) % 각들.length]}${꼭짓이름[j]}${꼭짓이름[(j + 1) % 각들.length]}`;
    if (next(3) < 2) {
      return 붙이기(수문항(next(2) ? 0 : 1, `그림의 ${이름}에서 ${각이름(묻는)}의 크기는 몇 도일까요?`, v, [v + 10, v - 10, 180 - v === v ? v + 20 : 180 - v].filter((x) => x > 0 && x !== v), { 단위: '°', tag, strategy: `${이름}의 각의 크기의 합으로 모르는 각 구하기`, hint: `${이름}의 ${사각 ? '네' : '세'} 각의 크기를 모두 더하면 ${합}°입니다. 그림에 적힌 각을 빼 보세요.`, steps: [`${이름}의 각의 크기의 합은 ${합}°입니다.`, `${합}°-${보인.map((x) => `${x}°`).join('-')}=${v}°입니다.`], 아래: 1, 빼기: true }), 그림);
    }
    // 바깥쪽 각: 묻는 각과 한 직선을 이루는 각
    return 붙이기(수문항(2, `그림의 ${이름}에서 ${각이름(묻는)}의 바깥쪽에 변을 늘여 그렸을 때, ${각이름(묻는)}과(와) 한 직선을 이루는 각의 크기는 몇 도일까요?`, 180 - v, [v, 360 - v, 180 - v + 10], { 단위: '°', tag, strategy: '각의 합과 직선이 이루는 각 이용하기', hint: '먼저 ? 자리의 각을 구하고, 직선이 이루는 각 180°에서 빼 보세요.', steps: [`? 자리의 각은 ${합}°-${보인.map((x) => `${x}°`).join('-')}=${v}°입니다.`, `180°-${v}°=${180 - v}°입니다.`], 아래: 1, 빼기: true }), 그림);
  });

// ── 3-1 6단원 똑같이 나누기 ─────────────────────────────────────────

/** 같은 크기로 보이지 않을 만큼 어긋난 금 자리입니다. */
const 어긋난금 = (next: 고르개형, n: number): number[] => {
  for (let t = 0; t < 20; t += 1) {
    const 금 = Array.from({ length: n - 1 }, (_, j) => (j + 1) / n + (next(2) ? 1 : -1) * (0.06 + next(5) / 100));
    const 자리 = [0, ...금, 1];
    if (자리.every((x, j) => !j || x - 자리[j - 1] > 0.08) && 자리.some((x, j) => j && Math.abs(x - 자리[j - 1] - 1 / n) > 0.05)) return 금.map((x) => Math.round(x * 100) / 100);
  }
  return [];
};

export const 나누기그림 = (): G5Family =>
  뭉치('pic-equal-parts', (next) => {
    const tag = 'fraction';
    const 찾기 = next(2) === 0; // true: 똑같이 나눈 것 하나 찾기, false: 똑같이 나누지 않은 것 하나 찾기
    const 답자리 = next(4);
    const figures = 이름표.map((name, j) => {
      const n = 사이(next, 2, 6);
      const 같게 = 찾기 ? j === 답자리 : j !== 답자리;
      const 모양 = next(3) === 0 ? 'circle' : 'bar';
      if (같게) return { name, shape: 모양 as 'bar' | 'circle', parts: n, shaded: [] as number[] };
      const cuts = 어긋난금(next, n);
      return cuts.length ? { name, shape: 모양 as 'bar' | 'circle', parts: n, cuts, shaded: [] as number[] } : null;
    });
    if (figures.some((f) => !f)) return null;
    const 답 = 이름표[답자리];
    const visual: QuestionVisual = { kind: 'partition', label: '나눈 도형', figures: figures as Array<{ name: string; shape: 'bar' | 'circle'; parts: number; cuts?: number[]; shaded: number[] }> };
    return 붙이기(결로(찾기 ? 0 : 1, { prompt: `그림에서 ${찾기 ? '똑같이 나누어진' : '똑같이 나누어지지 않은'} 도형은 어느 것일까요?`, answer: 답, wrongs: 글오답(답, 이름표), tag, strategy: '조각의 모양과 크기가 같은지 보기', hint: '조각을 오려 서로 겹쳐 본다고 생각해 보세요. 모든 조각이 꼭 겹쳐야 똑같이 나눈 것입니다.', steps: [찾기 ? `${답}만 조각의 모양과 크기가 모두 같습니다.` : `${답}은(는) 조각의 크기가 서로 다릅니다.`, `그러므로 답은 ${답}입니다.`] }), visual);
  });

// ── 6-1 4단원 백분율 ────────────────────────────────────────────────

const 칸판 = [[10, 10], [4, 5], [5, 5], [2, 5], [5, 4], [4, 10], [5, 10], [2, 10]] as const;

/** rows×columns 칸 가운데 k칸을 칠한 그림입니다. 칠한 칸은 앞에서부터 고르게 흩지 않고 줄마다 채웁니다. */
const 칸칠 = (next: 고르개형, name?: string) => {
  const [rows, columns] = 하나(next, 칸판);
  const 전체 = rows * columns; const k = 사이(next, 1, 전체 - 1);
  const 앞 = next(2) === 0;
  const shaded = Array.from({ length: k }, (_, j) => (앞 ? j : 전체 - 1 - j));
  return { 전체, k, 그림: { name, shape: 'grid' as const, rows, columns, shaded }, 퍼센트: (k * 100) / 전체 };
};

export const 백분율그림 = (): G5Family =>
  뭉치('pic-percentage', (next) => {
    const tag = 'ratio';
    const 꼴 = next(3);
    if (꼴 < 2) {
      const a = 칸칠(next);
      const 칠한 = 꼴 === 0; const p = 칠한 ? a.퍼센트 : 100 - a.퍼센트;
      if (!Number.isInteger(p)) return null;
      const 칸수 = 칠한 ? a.k : a.전체 - a.k;
      return 붙이기(글문항(칠한 ? 0 : 1, `그림에서 ${칠한 ? '색칠한' : '색칠하지 않은'} 부분은 전체의 몇 %일까요?`, `${p}%`, [`${칸수}%`, `${100 - p}%`, `${p + 10}%`, `${p / 10}%`], { tag, strategy: '칠한 칸의 비율을 백분율로 나타내기', hint: `전체 ${a.전체}칸 가운데 ${칠한 ? '색칠한' : '색칠하지 않은'} 칸이 몇 칸인지 세고, 비율에 100을 곱해 보세요.`, steps: [`전체 ${a.전체}칸 가운데 ${칸수}칸입니다.`, `${칸수}/${a.전체}×100=${p}이므로 ${p}%입니다.`] }), { kind: 'partition', label: '칠한 칸', figures: [a.그림] });
    }
    const a = 칸칠(next, '가'); const b = 칸칠(next, '나');
    if (!Number.isInteger(a.퍼센트) || !Number.isInteger(b.퍼센트) || a.퍼센트 === b.퍼센트) return null;
    const 답 = a.퍼센트 > b.퍼센트 ? '가' : '나';
    return 붙이기(결로(2, { prompt: '가와 나 가운데 전체에 대한 색칠한 부분의 비율이 더 높은 것은 어느 것일까요?', answer: 답, wrongs: 글오답(답, ['가', '나', '두 비율이 같습니다', '알 수 없습니다']), tag, strategy: '전체가 다른 두 그림의 비율 견주기', hint: '칠한 칸의 수만 견주면 안 됩니다. 전체 칸 수가 다르니 각각 백분율로 바꾸어 견주어 보세요.', steps: [`가는 ${a.k}/${a.전체}=${a.퍼센트}%, 나는 ${b.k}/${b.전체}=${b.퍼센트}%입니다.`, `비율이 더 높은 것은 ${답}입니다.`] }), { kind: 'partition', label: '칠한 칸', figures: [a.그림, b.그림] });
  });

const 글문항 = (결: 0 | 1 | 2, prompt: string, answer: string, 후보: string[], o: Pick<G5Spec, 'tag' | 'strategy' | 'hint' | 'steps'>): G5Spec | null => {
  const wrongs = 글오답(answer, 후보.filter((w) => w && !/^-|NaN|undefined/.test(w)));
  return wrongs.length < 3 ? null : 결로(결, { prompt, answer, wrongs, ...o });
};

// ── 5-1 6단원 평행사변형의 넓이 ──────────────────────────────────────

/** 밑변·높이·밀린 정도의 비율 그대로, 칸을 가득 쓰게(±1) 그립니다. */
const 평행점 = (o: number, b: number, h: number): 점[] => 맞추기([[o, 0], [o + b, 0], [b, h], [0, h]], 1);
/** 두 평행사변형을 같은 비율로 줄여, 그림에서도 크기를 견줄 수 있게 합니다. */
const 같은비율평행점 = (둘: Array<[number, number, number]>): 점[][] => {
  const 큰 = Math.max(...둘.map(([o, b, h]) => Math.max(o + b, h)));
  return 둘.map(([o, b, h]) => [[o, 0], [o + b, 0], [b, h], [0, h]].map(([x, y]) => [Math.round(((x - (o + b) / 2) / 큰) * 2 * 1000) / 1000, Math.round(((y - h / 2) / 큰) * 2 * 1000) / 1000] as 점));
};

export const 평행사변형그림 = (): G5Family =>
  뭉치('pic-parallelogram', (next) => {
    const tag = 'area';
    const b = 사이(next, 3, 15); const h = 사이(next, 2, 12); const o = 사이(next, 1, 6); const S = b * h;
    // 너무 납작하거나 길쭉하면 밑변과 높이를 알아보기 어렵습니다.
    if (h * 3 < b || b * 2 < h) return null;
    const 비스듬 = Math.ceil(Math.hypot(o, h));
    const 하나그림 = (높이글: string, 밑변글: string): QuestionVisual => ({ kind: 'figure-set', label: '평행사변형의 밑변과 높이', items: [{ shape: '평행사변형', active: true, points: 평행점(o, b, h), edgeLabels: [{ from: 3, to: 2, text: 밑변글, span: true }, { from: 0, to: 3, text: `${비스듬} cm` }], heightMark: { fromVertex: 0, text: 높이글 } }] });
    const 꼴 = next(4);
    if (꼴 === 0) return 붙이기(수문항(0, '그림의 평행사변형의 넓이는 몇 cm²일까요?', S, [b * 비스듬, 2 * (b + 비스듬), S + b], { 단위: ' cm²', tag, strategy: '밑변과 높이로 평행사변형의 넓이 구하기', hint: '비스듬한 변이 아니라 밑변과 수직인 높이를 쓰세요.', steps: ['(평행사변형의 넓이)=(밑변의 길이)×(높이)', `${b}×${h}=${S}(cm²)`], 아래: 1 }), 하나그림(`높이 ${h} cm`, `밑변 ${b} cm`));
    if (꼴 === 1) return 붙이기(수문항(1, `그림의 평행사변형의 넓이가 ${S} cm²일 때 높이는 몇 cm일까요?`, h, [비스듬, S - b, h + 1].filter((x) => x !== h), { 단위: ' cm', tag, strategy: '넓이와 밑변으로 높이 구하기', hint: '넓이를 구하는 식에서 높이를 □로 놓고 거꾸로 구해 보세요.', steps: [`${b}×□=${S}`, `□=${S}÷${b}=${h}(cm)`], 아래: 1 }), 하나그림('높이 ? cm', `밑변 ${b} cm`));
    if (꼴 === 2) return 붙이기(수문항(1, `그림의 평행사변형의 넓이가 ${S} cm²일 때 밑변의 길이는 몇 cm일까요?`, b, [비스듬, S - h, b + 1].filter((x) => x !== b), { 단위: ' cm', tag, strategy: '넓이와 높이로 밑변 구하기', hint: '넓이를 구하는 식에서 밑변을 □로 놓고 거꾸로 구해 보세요.', steps: [`□×${h}=${S}`, `□=${S}÷${h}=${b}(cm)`], 아래: 1 }), 하나그림(`높이 ${h} cm`, '밑변 ? cm'));
    // 밑변과 높이가 같은 두 평행사변형(밀린 정도만 다름)의 넓이 견주기
    const o2 = o + 사이(next, 2, 5); const 같음 = next(2) === 0; const h2 = 같음 ? h : h + 사이(next, 1, 3);
    const 답 = 같음 ? '두 넓이가 같습니다' : '나';
    const 비2 = Math.ceil(Math.hypot(o2, h2));
    const [가점, 나점] = 같은비율평행점([[o, b, h], [o2, b, h2]]);
    return 붙이기(결로(2, { prompt: '그림의 두 평행사변형 가와 나 가운데 넓이가 더 넓은 것은 어느 것일까요?', answer: 답, wrongs: 글오답(답, ['가', '나', '두 넓이가 같습니다', '알 수 없습니다']), tag, strategy: '밑변과 높이로 넓이 견주기', hint: '비스듬한 변의 길이나 기울어진 정도가 아니라 밑변과 높이를 견주어 보세요.', steps: [`가의 넓이는 ${b}×${h}=${S}(cm²), 나의 넓이는 ${b}×${h2}=${b * h2}(cm²)입니다.`, 같음 ? '밑변과 높이가 같으므로 넓이가 같습니다.' : '나의 넓이가 더 넓습니다.'] }), { kind: 'figure-set', label: '두 평행사변형', items: [
      { name: '가', shape: '평행사변형', points: 가점, edgeLabels: [{ from: 3, to: 2, text: `${b} cm` }, { from: 0, to: 3, text: `${비스듬} cm` }], heightMark: { fromVertex: 0, text: `${h} cm` } },
      { name: '나', shape: '평행사변형', points: 나점, edgeLabels: [{ from: 3, to: 2, text: `${b} cm` }, { from: 0, to: 3, text: `${비2} cm` }], heightMark: { fromVertex: 0, text: `${h2} cm` } },
    ] });
  });

// ── 6-1 6단원 직육면체의 겉넓이와 부피 ───────────────────────────────

export const 상자그림 = (묻기: '겉넓이' | '부피' | 'm³'): G5Family =>
  뭉치(`pic-box-${묻기}`, (next) => {
    const tag = 'volume';
    const 정 = next(4) === 0;
    const w = 사이(next, 2, 12); const d = 정 ? w : 사이(next, 2, 10); const h = 정 ? w : 사이(next, 2, 10);
    const 이름 = w === d && d === h ? '정육면체' : '직육면체';
    const 그림 = (글들: { width: string; depth: string; height: string }): QuestionVisual => ({ kind: 'box-drawing', label: 이름, width: w, depth: d, height: h, edgeLabels: 글들 });
    if (묻기 === '겉넓이') {
      const S = 2 * (w * d + d * h + w * h);
      return 붙이기(수문항(next(2) ? 1 : 0, `그림의 ${이름}의 겉넓이는 몇 cm²일까요?`, S, [w * d * h, S / 2, w * d + d * h + w * h + w * d], { 단위: ' cm²', tag, strategy: '여섯 면의 넓이를 더해 겉넓이 구하기', hint: '마주 보는 면은 넓이가 같습니다. 서로 다른 세 면의 넓이를 구해 2배 하세요.', steps: [`서로 다른 세 면의 넓이는 ${w}×${d}=${w * d}, ${d}×${h}=${d * h}, ${w}×${h}=${w * h}(cm²)입니다.`, `(${w * d}+${d * h}+${w * h})×2=${S}(cm²)입니다.`], 아래: 1 }), 그림({ width: `${w} cm`, depth: `${d} cm`, height: `${h} cm` }));
    }
    if (묻기 === '부피') {
      const V = w * d * h;
      if (next(3) === 0) return 붙이기(수문항(2, `그림의 직육면체의 부피는 ${V} cm³입니다. 높이는 몇 cm일까요?`, h, [V / w, w * d, h + 1].filter((x) => Number.isInteger(x) && x !== h), { 단위: ' cm', tag, strategy: '부피와 밑면으로 높이 구하기', hint: '(가로)×(세로)를 먼저 구하고 부피를 그 수로 나누어 보세요.', steps: [`${w}×${d}=${w * d}입니다.`, `${V}÷${w * d}=${h}이므로 높이는 ${h} cm입니다.`], 아래: 1 }), 그림({ width: `${w} cm`, depth: `${d} cm`, height: '? cm' }));
      return 붙이기(수문항(next(2) ? 1 : 0, `그림의 ${이름}의 부피는 몇 cm³일까요?`, V, [2 * (w * d + d * h + w * h), w * d, V + w * d], { 단위: ' cm³', tag, strategy: '가로·세로·높이로 부피 구하기', hint: '(직육면체의 부피)=(가로)×(세로)×(높이)입니다.', steps: [`${w}×${d}×${h}=${V}(cm³)입니다.`], 아래: 1 }), 그림({ width: `${w} cm`, depth: `${d} cm`, height: `${h} cm` }));
    }
    // m³: 한 모서리는 cm로 적고 나머지는 m로 적습니다.
    const W = 사이(next, 1, 6); const D = 사이(next, 1, 6); const H = 사이(next, 1, 5); const V = W * D * H;
    const 어느 = next(3);
    const 글들 = { width: 어느 === 0 ? `${W * 100} cm` : `${W} m`, depth: 어느 === 1 ? `${D * 100} cm` : `${D} m`, height: 어느 === 2 ? `${H * 100} cm` : `${H} m` };
    return 붙이기(수문항(어느 === 0 ? 1 : 2, '그림의 직육면체의 부피는 몇 m³일까요?', V, [V * 100, V * 1000000, W + D + H], { 단위: ' m³', tag, strategy: '길이의 단위를 m로 맞추어 부피 구하기', hint: '먼저 cm로 적힌 길이를 m로 바꾸세요(100 cm=1 m).', steps: [`세 모서리는 ${W} m, ${D} m, ${H} m입니다.`, `${W}×${D}×${H}=${V}(m³)입니다.`], 아래: 1 }), { kind: 'box-drawing', label: '직육면체', width: W, depth: D, height: H, edgeLabels: 글들 });
  });

// ── 6-2 5단원 원주와 원의 넓이 ──────────────────────────────────────

export const 원그림둘 = (묻기: '원주' | '넓이'): G5Family =>
  뭉치(`pic-circle-${묻기}`, (next) => {
    const tag = 'measurement';
    const π = 하나(next, [3, 3.1, 3.14]);
    const r = 사이(next, 2, 15);
    const 지름으로 = next(2) === 0;
    const 원: QuestionVisual = { kind: 'circles', label: '원', circles: [{ cx: 0, cy: 0, r }], points: [{ x: 0, y: 0, name: 'ㅇ' }], segments: [지름으로 ? { from: [-r, 0], to: [r, 0], name: `${2 * r} cm` } : { from: [0, 0], to: [r, 0], name: `${r} cm` }] };
    const 뒤 = ` (원주율: ${π})`;
    if (묻기 === '원주') {
      const v = 2 * r * π;
      return 붙이기(소수답(지름으로 ? 0 : 1, `그림의 원의 원주는 몇 cm일까요?${뒤}`, v, [r * π, r * r * π, v + π, 2 * r * 3.14 === v ? v + 1 : 2 * r * 3.14], ' cm', { tag, strategy: '지름으로 원주 구하기', hint: `(원주)=(지름)×(원주율)입니다.${지름으로 ? '' : ' 그림에 적힌 길이가 반지름인지 지름인지 먼저 보세요.'}`, steps: [...(지름으로 ? [] : [`반지름이 ${r} cm이므로 지름은 ${2 * r} cm입니다.`]), `${2 * r}×${π}=${글(v)}(cm)입니다.`] }), 원);
    }
    if (next(3) === 0) {
      const r2 = 사이(next, 1, r - 1);
      const v = (r * r - r2 * r2) * π;
      return 붙이기(소수답(2, `그림처럼 중심이 같은 두 원을 그렸습니다. 큰 원의 반지름은 ${r} cm, 작은 원의 반지름은 ${r2} cm입니다. 두 원 사이의 넓이는 몇 cm²일까요?${뒤}`, v, [(r - r2) * (r - r2) * π, r * r * π, (r + r2) * π, v + π], ' cm²', { tag, strategy: '큰 원의 넓이에서 작은 원의 넓이 빼기', hint: '큰 원의 넓이와 작은 원의 넓이를 각각 구해 빼 보세요.', steps: [`큰 원: ${r}×${r}×${π}=${글(r * r * π)}(cm²)`, `작은 원: ${r2}×${r2}×${π}=${글(r2 * r2 * π)}(cm²)`, `${글(r * r * π)}-${글(r2 * r2 * π)}=${글(v)}(cm²)`] }), { kind: 'circles', label: '중심이 같은 두 원', circles: [{ cx: 0, cy: 0, r }, { cx: 0, cy: 0, r: r2 }], points: [{ x: 0, y: 0, name: 'ㅇ' }], segments: [{ from: [0, 0], to: [r, 0], name: `${r} cm` }, { from: [0, 0], to: [0, -r2], name: `${r2} cm` }] });
    }
    const v = r * r * π;
    return 붙이기(소수답(지름으로 ? 1 : 0, `그림의 원의 넓이는 몇 cm²일까요?${뒤}`, v, [2 * r * π, 4 * r * r * π, (2 * r) * (2 * r), v + π].filter((x) => Math.abs(x - v) > 1e-9), ' cm²', { tag, strategy: '반지름으로 원의 넓이 구하기', hint: `(원의 넓이)=(반지름)×(반지름)×(원주율)입니다.${지름으로 ? ' 그림에 적힌 길이는 지름입니다.' : ''}`, steps: [...(지름으로 ? [`지름이 ${2 * r} cm이므로 반지름은 ${r} cm입니다.`] : []), `${r}×${r}×${π}=${글(v)}(cm²)입니다.`] }), 원);
  });

const 소수답 = (결: 0 | 1 | 2, prompt: string, 답: number, 후보: number[], 단위: string, o: Pick<G5Spec, 'tag' | 'strategy' | 'hint' | 'steps'>) =>
  글문항(결, prompt, `${글(답)}${단위}`, 후보.filter((x) => x > 0).map((x) => `${글(x)}${단위}`), o);

// ── 4-2 5단원 꺾은선그래프 해석 ─────────────────────────────────────

export const 꺾은선그림 = (): G5Family =>
  뭉치('pic-line-graph', (next) => {
    const tag = 'data';
    const [제목, 무엇, 단위, 때들] = 하나(next, [
      ['강낭콩의 키', '키', 'cm', ['1일', '3일', '5일', '7일', '9일']],
      ['교실의 온도', '온도', '°C', ['9시', '10시', '11시', '12시', '1시']],
      ['도서관 방문자 수', '방문자 수', '명', ['3월', '4월', '5월', '6월', '7월']],
      ['저금한 돈', '저금한 돈', '원', ['1주', '2주', '3주', '4주', '5주']],
    ] as const);
    const step = 단위 === '명' ? 10 : 단위 === '원' ? 100 : 1;
    const 값 = [사이(next, 2, 8)];
    for (let j = 1; j < 5; j += 1) 값.push(Math.max(1, 값[j - 1] + 사이(next, -3, 6)));
    const vs = 값.map((x) => x * step);
    const max = Math.ceil((Math.max(...vs) + step) / step) * step;
    const 그래프: QuestionVisual = { kind: 'line-graph', label: 제목, title: 제목, valueLabel: `${무엇}(${단위})`, step, max, points: 때들.map((name, j) => ({ name, value: vs[j] })) };
    const 차들 = vs.slice(1).map((x, j) => x - vs[j]);
    const 꼴 = next(4);
    const 단 = 단위 === '°C' ? ' °C' : 단위 === 'cm' ? ' cm' : 단위;
    if (꼴 === 0) {
      const j = next(5);
      return 붙이기(수문항(0, `그래프에서 ${때들[j]}의 ${무엇}은(는) 얼마일까요?`, vs[j], vs.filter((_, k) => k !== j), { 단위: 단, tag, strategy: '꺾은선그래프에서 값 읽기', hint: `${때들[j]}의 점에서 왼쪽 눈금으로 곧게 가서 읽어 보세요. 눈금 한 칸은 ${step}${단}입니다.`, steps: [`${때들[j]}의 점은 ${vs[j]}${단}에 있습니다.`], 아래: 0 }), 그래프);
    }
    if (꼴 === 1) {
      const 큰 = Math.max(...차들);
      if (큰 <= 0 || 차들.filter((x) => x === 큰).length !== 1) return null;
      const j = 차들.indexOf(큰);
      const 답 = `${때들[j]}과(와) ${때들[j + 1]} 사이`;
      return 붙이기(글문항(1, `그래프에서 ${무엇}이(가) 가장 많이 늘어난 때는 언제일까요?`, 답, 차들.map((_, k) => `${때들[k]}과(와) ${때들[k + 1]} 사이`), { tag, strategy: '선분의 기울기로 변화가 큰 때 찾기', hint: '선분이 오른쪽 위로 가장 많이 기울어진 곳을 찾아보세요.', steps: [`이웃한 때의 차는 ${차들.map((x) => `${x}`).join(', ')}입니다.`, `가장 많이 늘어난 때는 ${답}입니다.`] }), 그래프);
    }
    if (꼴 === 2) {
      const a = next(4); const b = a + 1 + next(4 - a);
      if (b > 4) return null;
      const v = Math.abs(vs[b] - vs[a]);
      if (!v) return null;
      return 붙이기(수문항(1, `그래프에서 ${때들[a]}과(와) ${때들[b]}의 ${무엇}의 차는 얼마일까요?`, v, [vs[b], vs[a], v + step], { 단위: 단, tag, strategy: '꺾은선그래프에서 두 값의 차 구하기', hint: '두 점의 값을 각각 읽은 다음 큰 값에서 작은 값을 빼 보세요.', steps: [`${때들[a]}은(는) ${vs[a]}${단}, ${때들[b]}은(는) ${vs[b]}${단}입니다.`, `${Math.max(vs[a], vs[b])}-${Math.min(vs[a], vs[b])}=${v}이므로 ${v}${단}입니다.`], 아래: 1, 빼기: true }), 그래프);
    }
    // 줄어든 때
    const 줄어든 = 차들.map((x, k) => (x < 0 ? k : -1)).filter((k) => k >= 0);
    if (줄어든.length !== 1) return null;
    const j = 줄어든[0];
    const 답 = `${때들[j]}과(와) ${때들[j + 1]} 사이`;
    return 붙이기(글문항(2, `그래프에서 ${무엇}이(가) 줄어든 때는 언제일까요?`, 답, 차들.map((_, k) => `${때들[k]}과(와) ${때들[k + 1]} 사이`), { tag, strategy: '선분이 내려간 곳 찾기', hint: '선분이 오른쪽 아래로 내려간 곳을 찾아보세요.', steps: [`${때들[j]}의 ${vs[j]}${단}에서 ${때들[j + 1]}의 ${vs[j + 1]}${단}(으)로 줄었습니다.`, `그러므로 ${답}입니다.`] }), 그래프);
  });

// ── 1-2 2단원 세 수의 덧셈 ──────────────────────────────────────────

const 셈그림 = ['apple', 'star', 'flower', 'fish', 'ball', 'car', 'bird'] as const;

export const 세수그림 = (): G5Family =>
  뭉치('pic-three-addends', (next) => {
    const tag = 'addition';
    const a = 사이(next, 1, 5); const b = 사이(next, 1, 4); const c = 사이(next, 1, 4); const v = a + b + c;
    if (v > 9) return null;
    const 아이콘 = 하나(next, 셈그림) as CounterIcon;
    const 그림: QuestionVisual = { kind: 'counters', label: '세 무리', groups: [{ count: a, icon: 아이콘 }, { count: b, icon: 아이콘 }, { count: c, icon: 아이콘 }], joiner: '+' };
    if (next(3) === 0) {
      return 붙이기(글문항(0, '그림을 보고 알맞은 덧셈식을 고르세요.', `${a}+${b}+${c}=${v}`, [`${a}+${b}=${a + b}`, `${a}+${b}+${c}=${v + 1}`, `${a + b}+${c}=${v + 1}`, `${a}+${c}=${a + c}`], { tag, strategy: '그림을 세 수의 덧셈식으로 나타내기', hint: '세 무리의 수를 차례로 세어 덧셈식으로 써 보세요.', steps: [`세 무리는 ${a}개, ${b}개, ${c}개입니다.`, `${a}+${b}=${a + b}, ${a + b}+${c}=${v}이므로 ${a}+${b}+${c}=${v}입니다.`] }), 그림);
    }
    return 붙이기(수문항(1, '그림의 세 무리를 모두 모으면 몇 개일까요?', v, [a + b, b + c, v + 1], { 단위: '개', tag, strategy: '세 수를 차례로 더하기', hint: '앞의 두 무리를 먼저 모으고, 거기에 나머지 무리를 더 모아 보세요.', steps: [`${a}+${b}=${a + b}입니다.`, `${a + b}+${c}=${v}이므로 ${v}개입니다.`], 아래: 1 }), 그림);
  });

// ── 1-2 5단원, 4-1 6단원 수 배열표 ──────────────────────────────────

export const 수배열그림 = (일학년: boolean): G5Family =>
  뭉치(`pic-number-array-${일학년 ? 'g1' : 'g4'}`, (next) => {
    const tag = 'pattern';
    const 줄 = 3; const 칸 = 일학년 ? 5 : 4;
    const 가로 = 일학년 ? 1 : 하나(next, [1, 10, 100, 1000, 5, 50, 11, 101]);
    const 세로 = 일학년 ? 10 : 하나(next, [10, 100, 1000, 20, 200, 1001, 110].filter((x) => x !== 가로));
    const 첫 = 일학년 ? 사이(next, 0, 6) * 10 + 사이(next, 1, 5) : 사이(next, 1000, 6000);
    const 값 = (i: number, j: number) => 첫 + i * 세로 + j * 가로;
    if (값(줄 - 1, 칸 - 1) > (일학년 ? 100 : 99999)) return null;
    const qi = next(줄); const qj = next(칸);
    const rows = Array.from({ length: 줄 }, (_, i) => Array.from({ length: 칸 }, (_, j) => (i === qi && j === qj ? null : 값(i, j))));
    const 그림: QuestionVisual = { kind: 'number-array', label: '수 배열표', rows };
    const 꼴 = next(4);
    if (꼴 <= 1) {
      const v = 값(qi, qj);
      return 붙이기(수문항(꼴 === 0 ? 0 : 1, '수 배열표에서 ?에 알맞은 수는 얼마일까요?', v, [v + 가로, v - 가로, v + 세로, v - 세로], { tag, strategy: '수 배열표의 가로·세로 규칙으로 빈칸 채우기', hint: '?가 있는 줄에서 오른쪽으로 갈 때와, 아래로 갈 때 수가 얼마씩 변하는지 찾아보세요.', steps: [`오른쪽으로 한 칸 갈 때마다 ${가로}씩, 아래로 한 칸 갈 때마다 ${세로}씩 커집니다.`, `그러므로 ?에 알맞은 수는 ${v}입니다.`], 아래: 1 }), 그림);
    }
    if (꼴 === 2) {
      return 붙이기(수문항(1, '수 배열표에서 아래로 한 칸 내려갈 때마다 수가 얼마씩 커질까요?', 세로, [가로, 세로 + 가로, 세로 * 10], { tag, strategy: '수 배열표의 세로 규칙 찾기', hint: '한 세로줄에서 위아래로 이웃한 두 수의 차를 구해 보세요.', steps: [`${값(0, qj === 0 ? 1 : 0)}과(와) 그 아래 ${값(1, qj === 0 ? 1 : 0)}의 차는 ${세로}입니다.`, `그러므로 아래로 ${세로}씩 커집니다.`], 아래: 1 }), 그림);
    }
    return 붙이기(수문항(2, '수 배열표에서 ↘ 방향(오른쪽 아래)으로 한 칸 갈 때마다 수가 얼마씩 커질까요?', 가로 + 세로, [가로, 세로, 세로 - 가로 > 0 ? 세로 - 가로 : 세로 * 2], { tag, strategy: '수 배열표의 대각선 규칙 찾기', hint: '↘ 방향은 오른쪽으로 한 칸, 아래로 한 칸 가는 것과 같습니다. 두 규칙을 모아 보세요.', steps: [`오른쪽으로 ${가로}, 아래로 ${세로}씩 커집니다.`, `↘ 방향으로는 ${가로}+${세로}=${가로 + 세로}씩 커집니다.`], 아래: 1 }), 그림);
  });
