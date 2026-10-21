import type { ChanceColor, FigureSetVisual, QuestionVisual } from '../../types';
import type { G5Family } from '../grade5/build';
import { 결로, 글오답, 뭉치, 사이, 수문항, 하나 } from './common';
import type { 고르개형 } from './common';

// ════════════════════════════════════════════════════════════════════
// 그림이 바뀌는 문항
// ────────────────────────────────────────────────────────────────────
// 도형 개념 차시는 수를 바꿀 자리가 거의 없어 같은 문항이 되풀이됩니다.
// 그래서 그림을 바꿉니다. 꼭짓점을 씨앗에서 정해 도형의 모양·크기·놓인
// 방향이 문항마다 달라지고, 답은 그 그림에서 나옵니다. 검사(expand.check.
// test.ts)는 그림의 좌표만 보고 답을 다시 구합니다.
// ════════════════════════════════════════════════════════════════════

type 점 = [number, number];
const 이름표 = ['가', '나', '다', '라'];

/** 꼭짓점을 가운데로 모으고 -0.9~0.9 안에 들게 줄입니다(돌려도 판 밖으로 나가지 않게). */
const 맞추기 = (pts: 점[]): 점[] => {
  const cx = (Math.min(...pts.map((p) => p[0])) + Math.max(...pts.map((p) => p[0]))) / 2;
  const cy = (Math.min(...pts.map((p) => p[1])) + Math.max(...pts.map((p) => p[1]))) / 2;
  const r = Math.max(...pts.map(([x, y]) => Math.hypot(x - cx, y - cy))) || 1;
  return pts.map(([x, y]) => [Math.round(((x - cx) / r) * 0.9 * 1000) / 1000, Math.round(((y - cy) / r) * 0.9 * 1000) / 1000]);
};

/** 사각형을 아무 방향으로 돌립니다. 돌려도 평행·길이·각은 그대로입니다. */
const 돌리기 = (pts: 점[], deg: number): 점[] => {
  const t = (deg * Math.PI) / 180;
  return pts.map(([x, y]) => [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)]);
};

type 사각종류 = '정사각형' | '직사각형' | '마름모' | '평행사변형' | '사다리꼴' | '사각형';

/** 종류에 꼭 맞는(더 좁은 종류는 아닌) 사각형의 꼭짓점을 만듭니다. */
const 사각형점 = (next: 고르개형, 종류: 사각종류): 점[] | null => {
  const 세쌍 = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]];
  if (종류 === '정사각형') { const a = 사이(next, 2, 5); return [[0, 0], [a, 0], [a, a], [0, a]]; }
  if (종류 === '직사각형') { const w = 사이(next, 3, 7); const h = 사이(next, 2, 5); return w === h ? null : [[0, 0], [w, 0], [w, h], [0, h]]; }
  if (종류 === '마름모') { const [a, b, c] = 하나(next, 세쌍); return [[0, 0], [c, 0], [c + a, b], [a, b]]; }
  if (종류 === '평행사변형') {
    const b = 사이(next, 4, 8); const s = 사이(next, 1, 3) * (next(2) ? 1 : -1); const h = 사이(next, 2, 4);
    if (b * b === s * s + h * h) return null;
    return [[0, 0], [b, 0], [b + s, h], [s, h]];
  }
  if (종류 === '사다리꼴') {
    const b = 사이(next, 5, 9); const t = 사이(next, 2, b - 1); const s = 사이(next, 0, b - t); const h = 사이(next, 2, 4);
    return [[0, 0], [b, 0], [s + t, h], [s, h]];
  }
  // 평행한 변이 하나도 없는 사각형
  const p: 점[] = [[0, 0], [사이(next, 4, 7), 사이(next, 0, 1)], [사이(next, 5, 8), 사이(next, 3, 5)], [사이(next, 0, 2), 사이(next, 2, 4)]];
  // 눈으로 보아도 평행해 보이지 않도록, 마주 보는 변이 6° 넘게 기울어진 것만 씁니다.
  return !비슷평행(p[0], p[1], p[3], p[2]) && !비슷평행(p[1], p[2], p[0], p[3]) && 볼록(p) ? p : null;
};

const 평행 = (a: 점, b: 점, c: 점, d: 점) => Math.abs((b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])) < 1e-9;
const 비슷평행 = (a: 점, b: 점, c: 점, d: 점) => {
  const u = [b[0] - a[0], b[1] - a[1]]; const v = [d[0] - c[0], d[1] - c[1]];
  return Math.abs(u[0] * v[1] - u[1] * v[0]) < 0.1 * Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]);
};
/** 마주 보는 변 가운데 평행한 쌍의 수입니다. */
export const 평행쌍 = (p: 점[]) => (평행(p[0], p[1], p[3], p[2]) ? 1 : 0) + (평행(p[1], p[2], p[0], p[3]) ? 1 : 0);
const 볼록 = (p: 점[]) => {
  const 부호 = p.map((_, k) => { const [a, b, c] = [p[k], p[(k + 1) % 4], p[(k + 2) % 4]]; return Math.sign((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])); });
  return 부호.every((s) => s === 부호[0]) && 부호[0] !== 0;
};

const 사각포함: Record<사각종류, 사각종류[]> = {
  // 이 종류의 사각형이 함께 속하는 종류입니다(4-2 4단원의 포함 관계).
  정사각형: ['정사각형', '직사각형', '마름모', '평행사변형', '사다리꼴', '사각형'],
  직사각형: ['직사각형', '평행사변형', '사다리꼴', '사각형'],
  마름모: ['마름모', '평행사변형', '사다리꼴', '사각형'],
  평행사변형: ['평행사변형', '사다리꼴', '사각형'],
  사다리꼴: ['사다리꼴', '사각형'],
  사각형: ['사각형'],
};

/** 그 차시에서 아직 배우지 않은 사각형 이름을 쓰지 않도록, 목표에 맞는 성질로 도형을 설명합니다. */
const 성질말 = (k: 사각종류, 목표: 사각종류) => {
  if (목표 === '사다리꼴' || 목표 === '평행사변형') {
    const 쌍 = { 정사각형: 2, 직사각형: 2, 마름모: 2, 평행사변형: 2, 사다리꼴: 1, 사각형: 0 }[k];
    return 쌍 ? `평행한 변이 ${쌍}쌍입니다` : '평행한 변이 없습니다';
  }
  if (목표 === '마름모') return ['정사각형', '마름모'].includes(k) ? '네 변의 길이가 모두 같습니다' : '네 변의 길이가 모두 같지는 않습니다';
  if (목표 === '직사각형') return ['정사각형', '직사각형'].includes(k) ? '네 각이 모두 직각입니다' : '네 각이 모두 직각이지는 않습니다';
  return k === '정사각형' ? '네 변의 길이가 같고 네 각이 모두 직각입니다' : '네 변의 길이가 같고 네 각이 모두 직각이지는 않습니다';
};

const 그림판 = (label: string, 모양들: 점[][], next: 고르개형): FigureSetVisual => ({
  kind: 'figure-set', label,
  items: 모양들.map((p, k) => ({ name: 이름표[k], shape: '사각형', points: 맞추기(돌리기(p, 사이(next, 0, 11) * 30)) })),
});

/** 사각형 넷 가운데 목표 종류 찾기·아닌 것 찾기·모두 세기 */
export const 사각형고르기 = (목표들: 사각종류[], 꼴: '찾기' | '아닌것' | '세기'): G5Family =>
  뭉치(`pic-quad-${꼴}-${목표들.join('')}`, (next) => {
    const 목표 = 하나(next, 목표들);
    const 모든종류: 사각종류[] = ['정사각형', '직사각형', '마름모', '평행사변형', '사다리꼴', '사각형'];
    const 속함 = (k: 사각종류) => 사각포함[k].includes(목표);
    const 맞는것 = 모든종류.filter(속함);
    const 아닌것 = 모든종류.filter((k) => !속함(k));
    if (!아닌것.length) return null;
    let 종류들: 사각종류[];
    if (꼴 === '찾기') 종류들 = [하나(next, 맞는것), 하나(next, 아닌것), 하나(next, 아닌것), 하나(next, 아닌것)];
    else if (꼴 === '아닌것') 종류들 = [하나(next, 아닌것), 하나(next, 맞는것), 하나(next, 맞는것), 하나(next, 맞는것)];
    else 종류들 = Array.from({ length: 4 }, () => (next(2) ? 하나(next, 맞는것) : 하나(next, 아닌것)));
    // 자리를 섞습니다.
    const 차례 = [0, 1, 2, 3].sort(() => next(3) - 1);
    const 놓인 = 차례.map((k) => 종류들[k]);
    const 점들 = 놓인.map((k) => 사각형점(next, k));
    if (점들.some((p) => !p)) return null;
    const visual = 그림판('사각형', 점들 as 점[][], next);
    const 받침 = (w: string) => ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? '이' : '가');
    if (꼴 === '세기') {
      const v = 놓인.filter(속함).length;
      const spec = 수문항(2, `그림의 사각형 가운데 ${목표}은(는) 모두 몇 개일까요?`, v, [v + 1, v - 1, 4 - v, 1], {
        단위: '개', tag: 'shape', strategy: '사각형 사이의 관계를 따져 세기', hint: `${목표}의 뜻을 떠올리고, 그 뜻에 맞는 도형을 빠짐없이 세어요. 다른 이름으로 부르는 도형도 ${목표}일 수 있어요.`,
        steps: [`${놓인.map((k, i) => `${이름표[i]}는 ${성질말(k, 목표)}`).join(' ')}`, `이 가운데 ${목표}의 뜻에 맞는 것은 ${v}개입니다.`], 아래: 0, 위: 4,
      });
      return spec && { ...spec, visual };
    }
    const 답자리 = 꼴 === '찾기' ? 놓인.findIndex(속함) : 놓인.findIndex((k) => !속함(k));
    const 답 = 이름표[답자리];
    return {
      ...결로(꼴 === '찾기' ? 1 : 2, {
        prompt: 꼴 === '찾기' ? `그림에서 ${목표}은(는) 어느 것일까요?` : `그림에서 ${목표}${받침(목표)} 아닌 것은 어느 것일까요?`,
        answer: 답, wrongs: 이름표.filter((n) => n !== 답),
        tag: 'shape', strategy: 꼴 === '찾기' ? `${목표}의 뜻으로 도형 찾기` : `${목표}의 뜻에 맞지 않는 도형 찾기`,
        hint: `마주 보는 변이 평행한지, 변의 길이와 각이 어떤지 차례로 살펴보세요.`,
        steps: [`${놓인.map((k, i) => `${이름표[i]}는 ${성질말(k, 목표)}`).join(' ')}`, `그러므로 ${답}입니다.`],
      }),
      visual,
    };
  });

/** 삼각형·사각형·원 가운데 세기(2-1 2단원) */
export const 도형세기 = (): G5Family =>
  뭉치('pic-shape-count', (next) => {
    const 종류들 = Array.from({ length: 4 }, () => 하나(next, ['삼각형', '사각형', '원'] as const));
    const 목표 = 하나(next, ['삼각형', '사각형', '원'] as const);
    const v = 종류들.filter((k) => k === 목표).length;
    if (v === 0) return null;
    const 세모 = (): 점[] => [[0, 0], [사이(next, 3, 7), 사이(next, 0, 2)], [사이(next, 1, 5), 사이(next, 3, 6)]];
    const 네모 = (): 점[] | null => 사각형점(next, 하나(next, ['직사각형', '사다리꼴', '사각형', '평행사변형'] as const));
    const items: FigureSetVisual['items'] = [];
    for (const k of 종류들) {
      if (k === '원') { items.push({ shape: '원', scale: 0.6 + next(4) * 0.1 }); continue; }
      const p = k === '삼각형' ? 세모() : 네모();
      if (!p) return null;
      items.push({ shape: k === '삼각형' ? '삼각형' : '사각형', points: 맞추기(돌리기(p, 사이(next, 0, 11) * 30)) });
    }
    const spec = 수문항(0, `그림에서 ${목표}은(는) 모두 몇 개일까요?`, v, [4 - v, v + 1, v - 1], {
      단위: '개', tag: 'shape', strategy: `${목표}을(를) 찾아 세기`, hint: 목표 === '원' ? '곧은 선 없이 둥근 도형을 찾아요.' : `곧은 선이 ${목표 === '삼각형' ? 3 : 4}개, 꼭짓점이 ${목표 === '삼각형' ? 3 : 4}개인 도형을 찾아요.`,
      steps: [`${목표}은(는) ${v}개입니다.`], 아래: 0, 위: 4,
    });
    return spec && { ...spec, visual: { kind: 'figure-set', label: '도형', items } };
  });

/** 정삼각형·이등변삼각형 찾기(4-2 2단원) */
export const 삼각형고르기 = (): G5Family =>
  뭉치('pic-triangle', (next) => {
    const 목표 = 하나(next, ['정삼각형', '이등변삼각형'] as const);
    const 정 = (): 점[] => [[0, 0], [2, 0], [1, Math.sqrt(3)]];
    const 이등변 = (): 점[] => { const b = 사이(next, 2, 6); const h = 사이(next, 2, 7); return Math.abs(h - (b / 2) * Math.sqrt(3)) < 0.3 ? [[0, 0], [b, 0], [b / 2, h + 2]] : [[0, 0], [b, 0], [b / 2, h]]; };
    const 부등변 = (): 점[] => {
        for (;;) {
            const t: 점[] = [[0, 0], [사이(next, 5, 7), 0], [사이(next, 1, 2), 사이(next, 2, 4)]];
            const [a, b, c] = [0, 1, 2].map((i) => Math.hypot(t[i][0] - t[(i + 1) % 3][0], t[i][1] - t[(i + 1) % 3][1]));
            const 최소 = Math.min(a, b, c);
            if (Math.abs(a - b) > 최소 * 0.1 && Math.abs(b - c) > 최소 * 0.1 && Math.abs(a - c) > 최소 * 0.1) return t;
        }
    };
    // 정삼각형은 이등변삼각형이기도 하므로, 이등변을 찾을 때는 정삼각형을 보기에 넣지 않습니다.
    const 답모양 = 목표 === '정삼각형' ? 정() : 이등변();
    const 다른 = 목표 === '정삼각형' ? [이등변(), 부등변(), 부등변()] : [부등변(), 부등변(), 부등변()];
    const 자리 = next(4);
    const 모양들 = [...다른];
    모양들.splice(자리, 0, 답모양);
    const 답 = 이름표[자리];
    return {
      ...결로(1, {
        prompt: `그림에서 ${목표}은(는) 어느 것일까요?`, answer: 답, wrongs: 이름표.filter((n) => n !== 답),
        tag: 'shape', strategy: `변의 길이로 ${목표} 찾기`, hint: 목표 === '정삼각형' ? '세 변의 길이가 모두 같은 삼각형을 찾아요.' : '두 변의 길이가 같은 삼각형을 찾아요.',
        steps: [`${답}는 ${목표 === '정삼각형' ? '세 변의 길이가 모두 같습니다' : '두 변의 길이가 같습니다'}.`, `그러므로 ${답}입니다.`],
      }),
      visual: { kind: 'figure-set', label: '삼각형', items: 모양들.map((p, k) => ({ name: 이름표[k], shape: '삼각형', points: 맞추기(돌리기(p, 사이(next, 0, 11) * 30)) })) },
    };
  });

/** 두 선분이 서로 수직인 것 찾기(4-2 4단원) */
export const 수직찾기 = (): G5Family =>
  뭉치('pic-perpendicular', (next) => {
    const 자리 = next(4);
    const 각들 = 이름표.map((_, k) => (k === 자리 ? 90 : 하나(next, [45, 55, 65, 115, 125, 135])));
    const items = 각들.map((deg, k) => {
      const t0 = (사이(next, 0, 11) * 30 * Math.PI) / 180;
      const t1 = t0 + (deg * Math.PI) / 180;
      const p1: 점 = [Math.round(Math.cos(t0) * 800) / 1000, Math.round(Math.sin(t0) * 800) / 1000];
      const p2: 점 = [Math.round(Math.cos(t1) * 800) / 1000, Math.round(Math.sin(t1) * 800) / 1000];
      return { name: 이름표[k], shape: 'angle' as const, points: [p1, [0, 0] as 점, p2] };
    });
    const 답 = 이름표[자리];
    return {
      ...결로(1, {
        prompt: '그림에서 두 선분이 서로 수직인 것은 어느 것일까요?', answer: 답, wrongs: 이름표.filter((n) => n !== 답),
        tag: 'shape', strategy: '두 선분이 만나 이루는 각이 직각인지 보기', hint: '삼각자의 직각 부분을 대어 보세요. 두 선분이 만나서 이루는 각이 직각이면 수직이에요.',
        steps: [`${답}의 두 선분이 만나서 이루는 각은 직각입니다.`, `그러므로 ${답}입니다.`],
      }),
      visual: { kind: 'line-figure', label: '선분', items },
    };
  });

/** 평면도형 돌리기(4-1 4단원) */
export const 도형돌리기 = (): G5Family =>
  뭉치('pic-rotate', (next) => {
    // 돌려도 자기 자신과 겹치지 않도록 모양이 고르지 않은 사각형을 씁니다.
    const p = 사각형점(next, '사각형');
    if (!p) return null;
    const pts = 맞추기(p);
    const 돌림 = 하나(next, [90, 180, 270]);
    const 방향 = 하나(next, ['시계 방향', '시계 반대 방향'] as const);
    const 화면각 = 방향 === '시계 방향' ? 돌림 : 360 - 돌림;
    const 처음 = 사이(next, 0, 3) * 90;
    const 보기각 = [화면각, (화면각 + 90) % 360, (화면각 + 180) % 360, (화면각 + 270) % 360].filter((d) => d !== 0).slice(0, 3);
    if (!보기각.includes(화면각)) return null;
    const 섞인 = [...보기각].sort(() => next(3) - 1);
    const 뒤집 = 섞인.map(() => false);
    // 사고형: 하나는 같은 각으로 돌렸지만 뒤집은 도형으로 바꾸어 놓습니다.
    const 함정 = next(2) === 0;
    if (함정) { const k = 섞인.findIndex((d) => d !== 화면각); if (k >= 0) { 섞인[k] = 화면각; 뒤집[k] = true; } }
    // 보기끼리 모양이 겹치면(도형이 어느 축에 대칭이면) 답이 둘이 될 수 있어 쓰지 않습니다.
    const 놓기 = (d: number, f: boolean) => 돌리기(pts.map(([x, y]) => [f ? -x : x, y] as 점), d).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).sort().join(' ');
    const 모습 = 섞인.map((d, k) => 놓기(d, 뒤집[k]));
    if (new Set(모습).size < 모습.length || 모습.includes(놓기(0, false))) return null;
    const 답자리 = 섞인.findIndex((d, k) => d === 화면각 && !뒤집[k]);
    const 답 = 이름표[답자리];
    return {
      ...결로(2, {
        prompt: `처음 도형을 ${방향}으로 ${돌림}°만큼 돌린 도형은 가, 나, 다 가운데 어느 것일까요?`, answer: 답, wrongs: 글오답(답, ['가', '나', '다', '없습니다']),
        tag: 'shape', strategy: '평면도형을 돌렸을 때의 모양 알기', hint: '도형의 한 변을 정해 그 변이 어디로 가는지 따라가 보세요. 90°만큼 돌리면 위쪽이 오른쪽(시계 방향)으로 가요.',
        steps: [`${방향}으로 ${돌림}°만큼 돌리면 처음 도형의 위쪽이 ${돌림 === 180 ? '아래쪽' : (방향 === '시계 방향') === (돌림 === 90) ? '오른쪽' : '왼쪽'}으로 갑니다.`, `그러므로 ${답}입니다.`],
      }),
      visual: {
        kind: 'figure-set', label: '돌리기',
        items: [{ name: '처음', shape: '사각형', points: pts, rotate: 처음, active: true }, ...섞인.map((d, k) => ({ name: 이름표[k], shape: '사각형' as const, points: pts, rotate: (처음 + d) % 360, flip: 뒤집[k] }))],
      },
    };
  });

const 정다각형점 = (n: number, 처음각: number): 점[] => Array.from({ length: n }, (_, k) => { const t = ((처음각 + (360 / n) * k - 90) * Math.PI) / 180; return [Math.round(Math.cos(t) * 900) / 1000, Math.round(Math.sin(t) * 900) / 1000] as 점; });

/** 선대칭도형의 대칭축 수(5-2 3단원) */
export const 대칭축세기 = (): G5Family =>
  뭉치('pic-axes-count', (next) => {
    const 종류 = 하나(next, ['정다각형', '직사각형', '이등변삼각형', '마름모'] as const);
    let pts: 점[];
    let v: number;
    let 이름: string;
    if (종류 === '정다각형') { const n = 사이(next, 3, 8); pts = 정다각형점(n, 0); v = n; 이름 = `정${['', '', '', '삼', '사', '오', '육', '칠', '팔'][n]}각형`; }
    else if (종류 === '직사각형') { const p = 사각형점(next, '직사각형'); if (!p) return null; pts = 맞추기(p); v = 2; 이름 = '직사각형'; }
    else if (종류 === '마름모') { const p = 사각형점(next, '마름모'); if (!p) return null; pts = 맞추기(p); v = 2; 이름 = '마름모'; }
    else { const b = 사이(next, 2, 5); const h = 사이(next, 2, 7); if (Math.abs(h - (b / 2) * Math.sqrt(3)) < 0.3) return null; pts = 맞추기([[0, 0], [b, 0], [b / 2, h]]); v = 1; 이름 = '이등변삼각형'; }
    const spec = 수문항(1, `그림의 ${이름}은(는) 선대칭도형입니다. 대칭축은 모두 몇 개일까요?`, v, [v * 2, v + 1, v - 1, 1], {
      단위: '개', tag: 'shape', strategy: '선대칭도형의 대칭축 찾기', hint: '도형을 반으로 접어 완전히 겹치게 하는 선을 빠짐없이 찾아보세요.',
      steps: [`${이름}을(를) 완전히 겹치게 접는 선은 ${v}개입니다.`], 아래: 1,
    });
    return spec && { ...spec, visual: { kind: 'figure-set', label: 이름, items: [{ shape: '사각형', points: 돌리기(pts, 사이(next, 0, 3) * 90).map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000] as 점) }] } };
  });

/** 원의 반지름과 지름, 이어 붙인 원(3-2 3단원) */
export const 원그림 = (): G5Family =>
  뭉치('pic-circles', (next) => {
    const r = 사이(next, 2, 9);
    const n = 사이(next, 1, 4);
    if (n === 1) {
      const 지름으로 = next(2) === 0;
      const spec = 수문항(0, `그림에서 원의 ${지름으로 ? '지름' : '반지름'}은(는) 몇 cm일까요?`, 지름으로 ? 2 * r : r, [지름으로 ? r : 2 * r, r + 1, 3 * r], {
        단위: ' cm', tag: 'shape', strategy: '원의 반지름과 지름', hint: '지름은 반지름의 2배예요.', steps: [`반지름이 ${r} cm이므로 ${지름으로 ? `지름은 ${2 * r}` : `반지름은 ${r}`} cm입니다.`], 아래: 1,
      });
      return spec && { ...spec, visual: { kind: 'circles', label: '원', circles: [{ cx: 0, cy: 0, r }], points: [{ x: 0, y: 0, name: 'ㅇ' }, { x: r, y: 0, name: 'ㄱ' }], segments: [{ from: [0, 0], to: [r, 0], name: `${r} cm` }] } };
    }
    const v = 2 * r * n;
    const spec = 수문항(1, `반지름이 ${r} cm인 원 ${n}개를 맞닿게 한 줄로 놓고 둘레에 꼭 맞는 직사각형을 그렸습니다. 직사각형의 가로는 몇 cm일까요?`, v, [r * n, 2 * r * (n - 1), 2 * r * n + r], {
      단위: ' cm', tag: 'shape', strategy: '이어 붙인 원으로 길이 구하기', hint: '직사각형의 가로는 원의 지름이 몇 개인지 보세요.', steps: [`지름은 ${2 * r} cm이고 원이 ${n}개이므로 ${2 * r}×${n}=${v}(cm)입니다.`], 아래: 1,
    });
    return spec && { ...spec, visual: { kind: 'circles', label: '원', circles: Array.from({ length: n }, (_, k) => ({ cx: r + 2 * r * k, cy: r, r })), rect: { x: 0, y: 0, w: 2 * r * n, h: 2 * r }, segments: [{ from: [r, r], to: [2 * r, r], name: `${r} cm` }] } };
  });

const 색말: Record<ChanceColor, string> = { red: '빨간', blue: '파란', yellow: '노란', green: '초록', white: '흰', black: '검은' };
const 가능성말 = (a: number, n: number) => (a === 0 ? '불가능하다' : a === n ? '확실하다' : a * 2 === n ? '반반이다' : a * 2 < n ? '~아닐 것 같다' : '~일 것 같다');

/** 주머니에서 공 꺼내기: 가능성을 말로, 수로, 두 주머니 견주기(5-2 6단원) */
export const 주머니가능성 = (꼴: '말' | '수' | '견주기'): G5Family =>
  뭉치(`pic-chance-${꼴}`, (next) => {
    const 색 = 하나(next, ['red', 'blue', 'yellow', 'green'] as const);
    const 다른 = 하나(next, (['red', 'blue', 'yellow', 'green'] as const).filter((c) => c !== 색));
    const 주머니 = () => { const n = 사이(next, 2, 8); const a = 사이(next, 0, n); return { a, n, marbles: [...Array(a).fill(색), ...Array(n - a).fill(다른)] as ChanceColor[] }; };
    if (꼴 === '견주기') {
      const [가, 나] = [주머니(), 주머니()];
      if (가.a * 나.n === 나.a * 가.n) return null;
      const 답 = 가.a * 나.n > 나.a * 가.n ? '가' : '나';
      return {
        ...결로(2, {
          prompt: `가 주머니와 나 주머니 가운데 한 주머니에서 공 하나를 꺼냅니다. ${색말[색]} 공을 꺼낼 가능성이 더 큰 주머니는 어느 것일까요?`, answer: 답, wrongs: 글오답(답, ['가', '나', '가능성이 같습니다', '알 수 없습니다']),
          tag: 'data', strategy: '두 경우의 가능성 견주기', hint: '공의 개수만 보지 말고, 전체 가운데 그 색 공이 얼마나 되는지 견주어 보세요.',
          steps: [`가는 ${가.n}개 가운데 ${가.a}개, 나는 ${나.n}개 가운데 ${나.a}개입니다.`, `전체에 비해 ${색말[색]} 공이 더 많은 ${답} 주머니의 가능성이 더 큽니다.`],
        }),
        visual: { kind: 'marble-bag', label: '주머니', bags: [{ name: '가', marbles: 가.marbles }, { name: '나', marbles: 나.marbles }] },
      };
    }
    const b = 주머니();
    if (꼴 === '수' && !(b.a === 0 || b.a === b.n || b.a * 2 === b.n)) return null;
    const 답 = 꼴 === '말' ? 가능성말(b.a, b.n) : b.a === 0 ? '0' : b.a === b.n ? '1' : '1/2';
    return {
      ...결로(꼴 === '말' ? 0 : 1, {
        prompt: `주머니에서 공 하나를 꺼낼 때, ${색말[색]} 공이 나올 가능성을 ${꼴 === '말' ? '말로 나타내면 어느 것일까요' : '수로 나타내면 얼마일까요'}?`,
        answer: 답, wrongs: 꼴 === '말' ? 글오답(답, ['불가능하다', '~아닐 것 같다', '반반이다', '~일 것 같다', '확실하다']) : 글오답(답, ['0', '1/2', '1', '2']),
        tag: 'data', strategy: 꼴 === '말' ? '일이 일어날 가능성을 말로 나타내기' : '일이 일어날 가능성을 수로 나타내기',
        hint: '주머니 속 공 가운데 그 색 공이 얼마나 되는지 세어 보세요.', steps: [`공 ${b.n}개 가운데 ${색말[색]} 공은 ${b.a}개입니다.`, `그러므로 ${답}입니다.`],
      }),
      visual: { kind: 'marble-bag', label: '주머니', bags: [{ marbles: b.marbles }] },
    };
  });

/** 띠 그림으로 가분수·대분수(3-2 4단원) */
export const 분수띠 = (대분수도: boolean): G5Family =>
  뭉치(`pic-fraction-bars-${대분수도 ? 'mixed' : 'improper'}`, (next) => {
    const d = 사이(next, 2, 6);
    const 전체 = 사이(next, 1, 3);
    const 남 = 사이(next, 1, d - 1);
    const n = 전체 * d + 남;
    const 대분수로 = 대분수도 && next(2) === 0;
    const 대 = (w: number, a: number) => `${w}과(와) ${a}/${d}`;
    const 답 = 대분수로 ? 대(전체, 남) : `${n}/${d}`;
    const figures = [
      ...Array.from({ length: 전체 }, () => ({ shape: 'bar' as const, parts: d, shaded: Array.from({ length: d }, (_, k) => k) })),
      { shape: 'bar' as const, parts: d, shaded: Array.from({ length: 남 }, (_, k) => k) },
    ];
    const spec = 결로(대분수로 ? 2 : 1, {
      prompt: `띠 하나를 1로 볼 때, 색칠한 부분을 ${대분수로 ? '대분수' : '가분수'}로 나타내면 얼마일까요?`, answer: 답,
      wrongs: 대분수로 ? [대(남, 전체 % d || 1), 대(전체 + 1, 남), 대(전체, d - 남 === 남 ? Math.max(1, 남 - 1) : d - 남)] : [`${n}/${d + 1}`, `${남}/${d}`, `${n + 1}/${d}`],
      tag: 'fraction', strategy: 대분수로 ? '그림을 대분수로 나타내기' : '그림을 가분수로 나타내기', hint: `띠 하나는 ${d}칸이에요. 다 칠한 띠가 몇 개이고 남은 칸이 몇 칸인지 보세요.`,
      steps: [`1/${d}이(가) ${n}개이므로 ${n}/${d}입니다.`, ...(대분수로 ? [`다 칠한 띠 ${전체}개와 ${남}칸이므로 ${대(전체, 남)}입니다.`] : [])],
      sameValueOk: true,
    });
    const 오답 = [...new Set(spec.wrongs)].filter((w) => w !== spec.answer);
    if (오답.length < 3) return null;
    return { ...spec, wrongs: 오답, visual: { kind: 'partition', label: '분수 띠', figures } as QuestionVisual };
  });

/** 자로 잰 길이: 색칠한 부분은 1cm가 몇 번(2-1 4단원) */
export const 자그림 = (): G5Family =>
  뭉치('pic-ruler', (next) => {
    const a = 사이(next, 0, 6);
    const b = a + 사이(next, 2, 8);
    const v = b - a;
    const spec = 수문항(0, `자에서 색칠한 부분은 1cm가 몇 번일까요?`, v, [b, v + 1, v - 1, a], {
      단위: '번', tag: 'measurement', strategy: '1cm가 몇 번인지 세기', hint: '색칠한 부분의 시작 눈금부터 끝 눈금까지 1cm 칸을 세어 보세요.',
      steps: [`${a}cm 눈금부터 ${b}cm 눈금까지는 1cm가 ${v}번입니다.`], 아래: 1,
    });
    return spec && { ...spec, visual: { kind: 'ruler', label: '자', start: 0, end: Math.max(10, b + 1), highlightStart: a, highlightEnd: b } };
  });

/** 무늬의 빈칸(2-2 6단원) */
export const 무늬빈칸 = (): G5Family =>
  뭉치('pic-pattern-blank', (next) => {
    const 묶음 = 하나(next, [['●', '▲'], ['●', '▲', '■'], ['★', '●', '●'], ['▲', '▲', '■'], ['■', '●', '▲', '●'], ['♥', '★'], ['♥', '♥', '●']]);
    const 길이 = 사이(next, 묶음.length * 2 + 1, 10);
    const items = Array.from({ length: 길이 }, (_, k) => 묶음[k % 묶음.length]);
    const 빈 = 사이(next, 묶음.length, 길이 - 1);
    const 답 = items[빈];
    return {
      ...결로(1, {
        prompt: '규칙에 따라 늘어놓은 무늬입니다. 빈칸에 알맞은 모양은 무엇일까요?', answer: 답, wrongs: 글오답(답, ['●', '▲', '■', '★', '♥']),
        tag: 'pattern', strategy: '되풀이되는 무늬에서 빈칸 채우기', hint: '되풀이되는 부분을 먼저 찾고, 빈칸이 그 가운데 몇째인지 보세요.',
        steps: [`${묶음.join(' ')}이(가) 되풀이됩니다.`, `빈칸에는 ${답}이(가) 들어갑니다.`],
      }),
      visual: { kind: 'pattern', label: '무늬', items, missingIndex: 빈 },
    };
  });

