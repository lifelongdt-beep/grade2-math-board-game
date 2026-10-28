import type { FigureSetVisual, QuestionVisual, SolidFigureVisual } from '../types';

// ════════════════════════════════════════════════════════════════════
// 도형 문항에 그림이 없을 때, 문제 글에 적힌 수만으로 그림을 그립니다.
// ────────────────────────────────────────────────────────────────────
// 도형·입체 문항은 그림을 보며 생각해야 합니다. 문항 뭉치마다 그림을
// 붙여 왔지만, 문장으로만 낸 문항(넓이 문장제, 세 각이 주어진 삼각형,
// 원기둥·원뿔·구의 뜻 등)이 많이 남아 있었습니다.
//
// 지키는 약속
//   · 그림에 적는 수는 문제 글에 이미 있는 수뿐입니다. 묻는 값은 '?'로
//     둡니다. 그림이 답을 알려 주지 않게 하기 위함입니다.
//   · 길이와 각은 비율 그대로 그립니다(그림이 글과 어긋나면 안 됩니다).
//   · 이름을 묻는 문항(옆면이 6개인 각기둥의 이름, 꼭짓점이 5개인 도형)은
//     그 도형을 그리면 답이 보이므로 그리지 않습니다.
//   · 회전해서 생기는 입체를 묻는 문항은 입체 대신 돌리는 평면도형을 그립니다.
// ════════════════════════════════════════════════════════════════════

type P = [number, number];

/** 가장 긴 쪽이 -1~1을 채우도록 줄이고 가운데로 옮깁니다. */
const 맞추기 = (points: P[]): P[] => {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const 가로 = Math.max(...xs) - Math.min(...xs);
  const 세로 = Math.max(...ys) - Math.min(...ys);
  const 배 = 2 / Math.max(가로, 세로, 1e-9);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return points.map(([x, y]) => [(x - cx) * 배, (y - cy) * 배]);
};

const 도 = (d: number) => (d * Math.PI) / 180;

const 도형하나 = (label: string, item: FigureSetVisual['items'][number]): FigureSetVisual => ({ kind: 'figure-set', label, items: [{ active: true, ...item }] });

// ── 각으로 정해지는 삼각형·사각형 ───────────────────────────────────
/** 세 각(도)으로 삼각형을 그립니다. 밑변이 아래에 놓이고 y는 아래로 갑니다. */
const 각삼각형 = (a: number, b: number, 글: [string, string, string], label: string): FigureSetVisual | null => {
  const c = 180 - a - b;
  if (a <= 0 || b <= 0 || c <= 0) return null;
  // 꼭짓점 0(왼쪽 아래, 각 a), 1(오른쪽 아래, 각 b), 2(위, 각 c)
  const 빗변 = Math.sin(도(b)) / Math.sin(도(c));
  const top: P = [빗변 * Math.cos(도(a)), -빗변 * Math.sin(도(a))];
  const pts = 맞추기([[0, 0], [1, 0], top]);
  return 도형하나(label, { shape: '삼각형', points: pts, angleLabels: [{ at: 0, text: 글[0] }, { at: 1, text: 글[1] }, { at: 2, text: 글[2] }].filter((l) => l.text) });
};

/** 네 각(도)으로 볼록사각형을 그립니다. 0→1이 밑변(왼쪽 아래에서 오른쪽 아래). */
const 각사각형 = (각: [number, number, number, number], 글: string[], label: string): FigureSetVisual | null => {
  if (Math.abs(각.reduce((s, x) => s + x, 0) - 360) > 1e-6 || 각.some((x) => x <= 0 || x >= 180)) return null;
  for (const 둘째 of [0.8, 1, 0.6, 1.2, 0.5]) {
    const v0: P = [0, 0];
    const v1: P = [1, 0];
    // 수학 좌표(y 위쪽)에서 반시계로 돕니다.
    const t1 = 180 - 각[1];
    const v2: P = [v1[0] + 둘째 * Math.cos(도(t1)), v1[1] + 둘째 * Math.sin(도(t1))];
    const t2 = t1 + 180 - 각[2];
    const t3 = t2 + 180 - 각[3];
    // v3 = v2 + s·d2 = v0 - u·d3
    const d2: P = [Math.cos(도(t2)), Math.sin(도(t2))];
    const d3: P = [Math.cos(도(t3)), Math.sin(도(t3))];
    const det = d2[0] * d3[1] - d2[1] * d3[0];
    if (Math.abs(det) < 1e-9) continue;
    const rx = v0[0] - v2[0];
    const ry = v0[1] - v2[1];
    const s = (rx * d3[1] - ry * d3[0]) / det;
    const u = (d2[0] * ry - d2[1] * rx) / det;
    if (s < 0.25 || u < 0.25) continue;
    const v3: P = [v2[0] + s * d2[0], v2[1] + s * d2[1]];
    const pts = 맞추기([v0, v1, v2, v3].map(([x, y]) => [x, -y] as P));
    return 도형하나(label, { shape: '사각형', points: pts, angleLabels: 글.map((text, at) => ({ at, text })).filter((l) => l.text) });
  }
  return null;
};

// ── 길이로 정해지는 평면도형(넓이·둘레) ────────────────────────────
const 직사각형 = (가로: number, 세로: number, 글: { 가로: string; 세로: string }, label = '직사각형'): FigureSetVisual =>
  도형하나(label, {
    shape: '직사각형',
    points: 맞추기([[0, 0], [가로, 0], [가로, 세로], [0, 세로]]),
    edgeLabels: [{ from: 0, to: 1, text: 글.가로 }, { from: 1, to: 2, text: 글.세로 }].filter((e) => e.text),
  });

const 평행사변형 = (밑변: number, 높이: number, 글: { 밑변: string; 높이: string }): FigureSetVisual => {
  // 잘라 옮기면 직사각형이 되도록 밀림을 밑변보다 짧게 둡니다.
  const o = Math.min(높이 * 0.5, 밑변 * 0.4);
  return 도형하나('평행사변형의 밑변과 높이', {
    shape: '평행사변형',
    points: 맞추기([[o, 0], [o + 밑변, 0], [밑변, 높이], [0, 높이]]),
    edgeLabels: [{ from: 3, to: 2, text: 글.밑변, span: true }],
    heightMark: { fromVertex: 0, text: 글.높이 },
  });
};

const 삼각형밑높이 = (밑변: number, 높이: number, 글: { 밑변: string; 높이: string }): FigureSetVisual =>
  도형하나('삼각형의 밑변과 높이', {
    shape: '삼각형',
    points: 맞추기([[밑변 * 0.35, 0], [밑변, 높이], [0, 높이]]),
    edgeLabels: [{ from: 1, to: 2, text: 글.밑변, span: true }],
    heightMark: { fromVertex: 0, text: 글.높이 },
  });

const 사다리꼴 = (윗변: number, 아랫변: number, 높이: number, 글: { 윗변: string; 아랫변: string; 높이: string }): FigureSetVisual | null => {
  if (윗변 >= 아랫변) return null;
  const o = 아랫변 - 윗변;
  return 도형하나('사다리꼴의 윗변, 아랫변, 높이', {
    shape: '사다리꼴',
    points: 맞추기([[o, 0], [아랫변, 0], [아랫변, 높이], [0, 높이]]),
    edgeLabels: [{ from: 0, to: 1, text: 글.윗변, span: true }, { from: 3, to: 2, text: 글.아랫변, span: true }],
    heightMark: { fromVertex: 0, text: 글.높이 },
  });
};

const 마름모 = (가: number, 나: number, 글: [string, string]): FigureSetVisual =>
  도형하나('마름모의 두 대각선', {
    shape: '마름모',
    points: 맞추기([[0, -나 / 2], [가 / 2, 0], [0, 나 / 2], [-가 / 2, 0]]),
    diagonals: [{ from: 3, to: 1, text: 글[0] }, { from: 0, to: 2, text: 글[1] }],
  });

// ── 원 ────────────────────────────────────────────────────────────
// r은 실제 반지름(cm)입니다. 그린 길이와 적은 길이가 비율로 맞아야 합니다.
const 원그림 = (글: string, 지름: boolean, r = 1): QuestionVisual => ({
  kind: 'circles',
  label: 지름 ? '원과 지름' : '원과 반지름',
  circles: [{ cx: 0, cy: 0, r }],
  points: [{ x: 0, y: 0 }],
  segments: [지름 ? { from: [-r, 0], to: [r, 0], name: 글 } : { from: [0, 0], to: [r, 0], name: 글 }],
});

// ── 직육면체와 정육면체(5-2 5단원) ──────────────────────────────────
// 면·모서리·꼭짓점의 수, 밑면, 전개도의 약속은 겨냥도나 전개도를 보며
// 세고 확인합니다. 겨냥도와 전개도 가운데 어느 것인지를 묻는 문항은
// 그림이 곧 답이므로 그리지 않습니다.
// 이름표는 답이 될 수 있으므로(이 직육면체는 정육면체일까요?) '입체도형'으로 둡니다.
const 상자 = (w: number, d: number, h: number, edgeLabels?: { width?: string; depth?: string; height?: string }, label = '입체도형'): QuestionVisual => ({
  kind: 'box-drawing', label, width: w, depth: d, height: h, ...(edgeLabels ? { edgeLabels } : {}),
});
const 십자전개도 = (w: number, d: number, h: number, label: string): QuestionVisual => ({
  kind: 'box-net',
  label,
  cols: [d, w, d, w],
  rows: [d, h, d],
  cells: [{ col: 1, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 1, row: 2 }],
});
const 상자그림 = (p: string): QuestionVisual | null => {
  if (/겨냥도는|겨냥도와|전개도와 겨냥도|쌓기나무|원기둥|원뿔|각기둥|각뿔/.test(p)) return null;
  let m = /가로가? (\d+) cm, 세로가? (\d+) cm, 높이가? (\d+) cm인 직육면체/.exec(p);
  if (m) return 상자(Number(m[1]), Number(m[2]), Number(m[3]), { width: `${m[1]} cm`, depth: `${m[2]} cm`, height: `${m[3]} cm` });
  m = /한 모서리의 길이가 (\d+) cm인 정육면체/.exec(p);
  if (m && !/직육면체/.test(p)) return 상자(1, 1, 1, { width: `${m[1]} cm` });
  const 정육 = /정육면체/.test(p) && !/직육면체/.test(p);
  if (/전개도/.test(p)) return 정육 ? 십자전개도(1, 1, 1, '전개도') : 십자전개도(4, 2, 3, '전개도');
  if (/직육면체|정육면체/.test(p)) return 정육 ? 상자(1, 1, 1) : 상자(5, 3, 3);
  return null;
};

// ── 여러 가지 사각형(4-2 4단원) ─────────────────────────────────────
const 사각형이름들 = ['사다리꼴', '평행사변형', '마름모', '직사각형', '정사각형'] as const;
const 사각형그림 = (p: string): QuestionVisual | null => {
  if (/사각형 사이의 관계/.test(p)) {
    return { kind: 'figure-set', label: '여러 가지 사각형', items: 사각형이름들.map((shape) => ({ name: shape, shape })) };
  }
  const m = /^(사다리꼴|평행사변형|마름모|직사각형|정사각형)(?:의 성질|에 대한 설명|에서)/.exec(p);
  if (m && !/\d/.test(p)) return { kind: 'figure-set', label: m[1], items: [{ name: m[1], shape: m[1] as (typeof 사각형이름들)[number], active: true }] };
  // 뜻으로 이름을 묻는 문항은 이름 없이 가~마로 여러 사각형을 보여 줍니다.
  if (/사각형을 무엇이라고 할까요/.test(p)) {
    return { kind: 'figure-set', label: '여러 가지 사각형', items: 사각형이름들.map((shape, k) => ({ name: '가나다라마'[k], shape })) };
  }
  if (/두 직선이 서로 수직으로 만날 때/.test(p)) {
    return { kind: 'line-figure', label: '서로 수직인 두 직선', items: [{ shape: 'angle', points: [[0.9, -0.1], [-0.6, -0.1], [-0.6, 0.9]], rightMark: true }] };
  }
  return null;
};

// ── 입체 ──────────────────────────────────────────────────────────
const 각수 = { 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9, 십: 10 } as const;
const 둥근 = (solid: 'cylinder' | 'cone' | 'sphere', labels?: SolidFigureVisual['labels']): SolidFigureVisual => ({
  kind: 'solid-figure',
  label: { cylinder: '원기둥', cone: '원뿔', sphere: '구' }[solid],
  solid,
  radius: 1,
  height: solid === 'sphere' ? 2 : 2.2,
  ...(labels ? { labels } : {}),
});

const 구낱말 = /(^|[ ,(])구(?=[의는가를와과에도,)]| 가운데| 모양|$)/;

const 입체그림 = (p: string): QuestionVisual | null => {
  const 원기둥 = p.includes('원기둥');
  const 원뿔 = p.includes('원뿔');
  const 구 = 구낱말.test(p);
  const 몇 = [원기둥, 원뿔, 구].filter(Boolean).length;
  // 한 바퀴 돌려 만드는 입체를 묻는 문항은 돌리는 평면도형을 그립니다.
  if (/돌리면|돌려/.test(p)) {
    if (/직사각형 모양의 종이/.test(p)) return 직사각형(3, 4, { 가로: '', 세로: '' }, '한 변을 기준으로 돌릴 직사각형');
    if (/직각삼각형 모양의 종이/.test(p)) return 도형하나('한 변을 기준으로 돌릴 직각삼각형', { shape: '직각삼각형', points: 맞추기([[0, 0], [0, 4], [3, 4]]) });
    return null;
  }
  if (몇 >= 2) {
    return { kind: 'solid-figure', label: '원기둥, 원뿔, 구', solid: 'cylinder', items: [{ name: '원기둥', solid: 'cylinder' }, { name: '원뿔', solid: 'cone' }, { name: '구', solid: 'sphere' }] };
  }
  if (몇 === 1) {
    const labels: SolidFigureVisual['labels'] = {};
    const r = /반지름이 ([\d.]+) cm/.exec(p);
    const d = /지름이 ([\d.]+) cm/.exec(p);
    const h = /높이가 ([\d.]+) cm/.exec(p);
    if (r) labels.radius = `${r[1]} cm`;
    else if (d && !/반지름이/.test(p.slice(Math.max(0, d.index - 1), d.index + 3))) labels.diameter = `${d[1]} cm`;
    if (h && !구) labels.height = `${h[1]} cm`;
    return 둥근(원기둥 ? 'cylinder' : 원뿔 ? 'cone' : 'sphere', Object.keys(labels).length ? labels : undefined);
  }
  // 각기둥·각뿔: 이름을 묻거나 면·모서리 수로 이름을 찾는 문항은 그리지 않습니다.
  const 각기둥 = /각기둥/.test(p);
  const 각뿔 = /각뿔/.test(p);
  // 각기둥과 각뿔을 함께 견주는 문항은 하나만 그리면 어긋나므로 그리지 않습니다.
  if (!각기둥 && !각뿔) return null;
  if (각기둥 && 각뿔) return null;
  const 밑면이름 = /밑면의 모양이 (삼|사|오|육|칠|팔)각형인 각(기둥|뿔)/.exec(p);
  if (밑면이름) return { kind: 'solid-figure', label: '입체도형', solid: 밑면이름[2] === '기둥' ? 'prism' : 'pyramid', sides: 각수[밑면이름[1] as keyof typeof 각수] };
  if (/이름|\d+개인|모두 더하면|몇 각기둥|몇 각뿔/.test(p)) return null;
  const 이름 = /(삼|사|오|육|칠|팔|구|십)각(기둥|뿔)/.exec(p);
  const sides = 이름 ? 각수[이름[1] as keyof typeof 각수] : 5;
  return { kind: 'solid-figure', label: 이름 ? 이름[0] : 각기둥 ? '각기둥' : '각뿔', solid: 각기둥 ? 'prism' : 'pyramid', sides };
};

// ── 더 많은 평면도형 ──────────────────────────────────────────────
const 정다각형이름 = { 정삼각형: 3, 정사각형: 4, 정오각형: 5, 정육각형: 6 } as const;
const 정다각형점 = (n: number): P[] => 맞추기(Array.from({ length: n }, (_, k) => {
  const t = Math.PI / 2 + Math.PI / n + (2 * Math.PI * k) / n;
  return [Math.cos(t), -Math.sin(t)] as P;
}));

/** 분수·대분수·소수로 쓴 길이를 값으로 읽습니다('2와 1/4', '3/8', '1.5'). */
const 길이값 = (t: string): number => {
  let m = /^(\d+)(?:과|와) (\d+)\/(\d+)$/.exec(t);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)$/.exec(t);
  if (m) return Number(m[1]) / Number(m[2]);
  return Number(t);
};
const 길이글 = String.raw`(\d+(?:(?:과|와) \d+\/\d+)?|\d+\/\d+|\d+(?:\.\d+)?)`;

const 더평면 = (p: string): QuestionVisual | null => {
  let m: RegExpExecArray | null;
  // 삼각자 두 개
  m = /(\d+)°, (\d+)°, (\d+)°인 삼각자와 (\d+)°, (\d+)°, (\d+)°인 삼각자/.exec(p);
  if (m) {
    const 하나 = 각삼각형(Number(m[1]), Number(m[2]), [`${m[1]}°`, `${m[2]}°`, `${m[3]}°`], '삼각자');
    const 둘 = 각삼각형(Number(m[4]), Number(m[5]), [`${m[4]}°`, `${m[5]}°`, `${m[6]}°`], '삼각자');
    if (하나 && 둘) return { kind: 'figure-set', label: '두 삼각자', items: [{ ...하나.items[0], name: '가' }, { ...둘.items[0], name: '나' }] };
  }
  // 분수·대분수 길이의 직사각형(넓이)
  m = new RegExp(`가로가 ${길이글} (cm|m), 세로가 ${길이글} \\2인 직사각형`).exec(p);
  if (m) return 직사각형(길이값(m[1]), 길이값(m[3]), { 가로: `${m[1]} ${m[2]}`, 세로: `${m[3]} ${m[2]}` });
  m = new RegExp(`넓이가 ${길이글} (cm|m)²이고 가로가 ${길이글} \\2인 직사각형`).exec(p);
  if (m) return 직사각형(길이값(m[3]), 길이값(m[1]) / 길이값(m[3]), { 가로: `${m[3]} ${m[2]}`, 세로: '?' });
  // 평행사변형의 둘레
  m = /네 변의 길이의 합이 (\d+) cm인 평행사변형이 있습니다\. 한 변이 (\d+) cm/.exec(p);
  if (m) {
    const a = Number(m[2]);
    const b = Number(m[1]) / 2 - a;
    if (b > 0) {
      const 밀림 = b * 0.5;
      const 높이 = b * Math.sin(Math.PI / 3);
      return 도형하나('평행사변형', { shape: '평행사변형', points: 맞추기([[밀림, 0], [밀림 + a, 0], [a, 높이], [0, 높이]]), edgeLabels: [{ from: 0, to: 1, text: `${a} cm` }, { from: 1, to: 2, text: '?' }] });
    }
  }
  // 정다각형의 둘레
  m = /(?:세 변의 길이의 합|모든 변의 길이의 합|둘레)(?:이|가) (\d+) cm인 (정삼각형|정사각형|정오각형|정육각형)/.exec(p);
  if (m) return 도형하나(m[2], { shape: m[2] as '정삼각형', points: 정다각형점(정다각형이름[m[2] as keyof typeof 정다각형이름]), edgeLabels: [{ from: 0, to: 1, text: '?' }] });
  // 한 변이 a cm인 정삼각형 k개를 한 줄로 이어 붙인 도형
  m = /한 변이 (\d+) cm인 정삼각형 (\d+)개를 변끼리 맞닿게 한 줄로 이어 붙여/.exec(p);
  if (m) {
    const k = Number(m[2]);
    const h = Math.sqrt(3) / 2;
    const 아래 = Array.from({ length: Math.ceil(k / 2) + 1 }, (_, i) => [i, h] as P);
    const 위 = Array.from({ length: Math.floor(k / 2) + 1 }, (_, i) => [i + 0.5, 0] as P);
    // 바깥 둘레: 아래 왼쪽→오른쪽, 위 오른쪽→왼쪽
    const 바깥 = [...아래, ...[...위].reverse()];
    const 점들 = 맞추기(바깥);
    // 안쪽 변(맞닿은 변)은 대각선으로 긋습니다. 위 꼭짓점 i는 아래 꼭짓점
    // i, i+1과 이어지고, 그 가운데 바깥 둘레에 있는 변은 뺍니다.
    const N = 바깥.length;
    const 위번호 = (i: number) => 아래.length + (위.length - 1 - i);
    const 둘레인가 = (a: number, b: number) => Math.abs(a - b) === 1 || Math.abs(a - b) === N - 1;
    const 안: Array<{ from: number; to: number; text: string }> = [];
    위.forEach((_, i) => [i, i + 1].forEach((j) => {
      if (j < 아래.length && !둘레인가(위번호(i), j)) 안.push({ from: 위번호(i), to: j, text: '' });
    }));
    return 도형하나('정삼각형을 이어 붙인 도형', { shape: '사각형', points: 점들, diagonals: 안, edgeLabels: [{ from: 0, to: 1, text: `${m[1]} cm` }] });
  }
  // 직사각형의 두 대각선
  m = /직사각형의 한 대각선의 길이가 (\d+) cm/.exec(p);
  if (m) return 도형하나('직사각형의 두 대각선', { shape: '직사각형', points: 맞추기([[0, 0], [4, 0], [4, 2.6], [0, 2.6]]), diagonals: [{ from: 0, to: 2, text: `${m[1]} cm` }, { from: 1, to: 3, text: '?' }] });
  // 꼭짓점 이름이 붙은 삼각형·사각형(바깥쪽 각을 묻는 문항)
  m = /삼각형 ㄱㄴㄷ에서 변 ㄴㄷ을 꼭짓점 ㄷ 쪽으로 늘였습니다\. 각 ㄱㄴㄷ이 (\d+)°, 각 ㄴㄱㄷ이 (\d+)°/.exec(p);
  if (m) {
    const 그림 = 각삼각형(Number(m[1]), 180 - Number(m[1]) - Number(m[2]), [`${m[1]}°`, '', `${m[2]}°`], '삼각형 ㄱㄴㄷ');
    if (그림) return { ...그림, items: [{ ...그림.items[0], vertexLabels: ['ㄴ', 'ㄷ', 'ㄱ'] }] };
  }
  m = /사각형 ㄱㄴㄷㄹ에서 각 ㄱ이 (\d+)°, 각 ㄴ이 (\d+)°, 각 ㄷ이 (\d+)°/.exec(p);
  if (m) {
    const [a, b, c] = [1, 2, 3].map((k) => Number(m![k]));
    const 그림 = 각사각형([a, b, c, 360 - a - b - c], [`${a}°`, `${b}°`, `${c}°`, ''], '사각형 ㄱㄴㄷㄹ');
    if (그림) return { ...그림, items: [{ ...그림.items[0], vertexLabels: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'] }] };
  }
  // 조건으로 정해지는 삼각형(4-1)
  if (/^세 각의 크기가 모두 같은 삼각형/.test(p)) return 각삼각형(60, 60, ['?', '?', '?'], '세 각의 크기가 같은 삼각형');
  if (/^한 각이 직각이고 나머지 두 각의 크기가 같은 삼각형/.test(p)) return 각삼각형(45, 45, ['?', '?', '90°'], '직각삼각형');
  // 합동인 두 도형
  m = /(?:서로 합동인 두|두) (삼각형|사각형|오각형)(?:은|이) (?:서로 합동|있습니다)/.exec(p);
  if (m && /합동/.test(p)) {
    const shape = m[1] as '삼각형';
    return { kind: 'figure-set', label: `서로 합동인 두 ${m[1]}`, items: [{ name: '가', shape }, { name: '나', shape, rotate: 180 }] };
  }
  // 도형의 뜻·설명을 묻는 문항: 그 도형을 이름과 함께 보여 줍니다.
  m = /^(이등변삼각형|정삼각형|직각삼각형|직사각형|정사각형)(?:에 대한 설명|의 세 변의 길이가 될 수|은 어떤 도형|는 어떤 도형)/.exec(p);
  if (m) return { kind: 'figure-set', label: m[1], items: [{ name: m[1], shape: m[1] as '정삼각형', active: true }] };
  m = /^(직사각형)과 (정사각형)의 (?:같은|다른) 점/.exec(p);
  if (m) return { kind: 'figure-set', label: '직사각형과 정사각형', items: [{ name: '직사각형', shape: '직사각형' }, { name: '정사각형', shape: '정사각형' }] };
  // 밀기·뒤집기·돌리기의 성질(4-1 4단원): 모눈 위에 처음 도형을 보여 줍니다(자세히 보기에서 직접 움직여 봄).
  if (/(?:돌린 도형|돌리면|뒤집었을|밀었을)/.test(p) && !/\d+번|한 바퀴|종이|기준/.test(p)) {
    return { kind: 'grid-move', label: '처음 도형', size: 5, panels: [{ name: '처음 도형', cells: [[1, 1], [1, 2], [1, 3], [2, 3]] }] };
  }
  // 각도의 합과 차(4-1 2단원): 두 각을 그립니다.
  m = /^(\d+)°([+-])(\d+)°는 몇 도/.exec(p);
  if (m && Number(m[1]) < 180 && Number(m[3]) < 180) {
    return { kind: 'angle', label: '두 각', items: [{ deg: Number(m[1]), name: '가', text: `${m[1]}°` }, { deg: Number(m[3]), name: '나', text: `${m[3]}°` }] };
  }
  // 뜻으로 삼각형의 이름을 묻는 문항: 이름 없이 가~라로 여러 삼각형을 보여 줍니다.
  if (/삼각형을 무엇이라고 할까요/.test(p)) {
    return { kind: 'figure-set', label: '여러 가지 삼각형', items: (['정삼각형', '이등변삼각형', '직각삼각형', '둔각삼각형'] as const).map((shape, k) => ({ name: '가나다라'[k], shape })) };
  }
  if (/^둔각삼각형에는|^예각삼각형에는/.test(p)) {
    const shape = p.startsWith('둔각') ? '둔각삼각형' : '정삼각형';
    return { kind: 'figure-set', label: shape, items: [{ shape, active: true }] };
  }
  // 수직의 뜻(4-2 4단원)
  if (/수직인 직선|수직으로 만날 때|수직의 뜻/.test(p)) {
    return { kind: 'line-figure', label: '서로 수직인 두 직선', items: [{ shape: 'angle', points: [[0.9, -0.1], [-0.6, -0.1], [-0.6, 0.9]], rightMark: true }] };
  }
  // 원의 중심·반지름·지름의 뜻(3-2): 이름을 적지 않고 선만 그립니다.
  if (/^(?:원을 그릴 때|원의 중심과|원 위의 두 점|한 원에)/.test(p)) {
    return { kind: 'circles', label: '원', circles: [{ cx: 0, cy: 0, r: 1 }], points: [{ x: 0, y: 0 }], segments: [{ from: [0, 0], to: [0.71, -0.71] }, { from: [-1, 0], to: [1, 0] }] };
  }
  return null;
};

// ── 길이 재기(2-2 3단원) ───────────────────────────────────────────
// 몸의 부분으로 어림하기, 이어 붙인 길이, 키 견주기를 그립니다.
const 몸단위 = (물건: string): '뼘' | '걸음' | '양팔' =>
  /복도|운동장|교실|담장|뒷벽/.test(물건) ? '걸음' : /칠판|교실 문|창틀/.test(물건) ? '양팔' : '뼘';
const 엠씨 = (m: string, cm: string) => Number(m) * 100 + Number(cm);
const 길이재기 = (p: string): QuestionVisual | null => {
  let m = /^(.+?)(?:을|를) (?:몸으로 어림할 때|어림해 말할 때)/.exec(p);
  if (m) return { kind: 'body-measure', label: '몸으로 어림하기', object: m[1], unit: 몸단위(m[1]) };
  m = /내 걸음으로 (\d+)걸음이 약 (\d+)m입니다\. (.+?) 끝까지 (\d+)걸음/.exec(p);
  if (m) return { kind: 'body-measure', label: '걸음으로 어림하기', object: m[3], unit: '걸음', count: Number(m[4]) };
  m = /한 걸음은 약 (\d+)cm입니다\. \S+ (.+?)(?:을|를) 따라 (\d+)걸음/.exec(p);
  if (m) return { kind: 'body-measure', label: '걸음으로 어림하기', object: m[2], unit: '걸음', count: Number(m[3]) };
  if (/자 없이 어림하려고/.test(p)) return { kind: 'body-measure', label: '몸으로 어림하기', object: '교실의 긴 쪽', unit: '걸음' };
  m = /(\S+)(?:는|은) (\d+)m (\d+)cm, (\S+)(?:는|은) (\d+)m (\d+)cm인 색 테이프/.exec(p);
  if (m) return { kind: 'bar-model', label: '이어 붙일 두 색 테이프', bars: [{ label: m[1], value: 엠씨(m[2], m[3]), text: `${m[2]}m ${m[3]}cm` }, { label: m[4], value: 엠씨(m[5], m[6]), text: `${m[5]}m ${m[6]}cm` }] };
  m = /빨간 철사는 (\d+)m (\d+)cm이고 파란 철사는 (\d+)m (\d+)cm/.exec(p);
  if (m) return { kind: 'bar-model', label: '이어 붙일 두 철사', bars: [{ label: '빨간 철사', value: 엠씨(m[1], m[2]), text: `${m[1]}m ${m[2]}cm` }, { label: '파란 철사', value: 엠씨(m[3], m[4]), text: `${m[3]}m ${m[4]}cm` }] };
  m = /리본 (\d+)cm와 (\d+)cm를 겹치지 않게/.exec(p) ?? /리본 (\d+)cm(?:와|과) (\d+)cm(?:를|을) 겹치지 않게/.exec(p);
  if (m) return { kind: 'bar-model', label: '이어 붙일 두 리본', bars: [{ label: '리본 1', value: Number(m[1]), text: `${m[1]}cm` }, { label: '리본 2', value: Number(m[2]), text: `${m[2]}cm` }] };
  m = /(\S+)의 키는 (\d+)m (\d+)cm이고 (\S+)(?:는|은) \S+보다 (\d+)cm 더 큽니다/.exec(p);
  if (m) return { kind: 'bar-model', label: '두 사람의 키', bars: [{ label: m[1], value: 엠씨(m[2], m[3]), text: `${m[2]}m ${m[3]}cm` }, { label: m[4], value: 엠씨(m[2], m[3]) + Number(m[5]), text: '?' }] };
  // 시간과 분(2-2 4단원): '93분은 몇 시간 몇 분'은 분을 60칸씩 늘어놓은 그림으로 봅니다.
  m = /(\d+)분'? 동안 [^.?]*\. '?(?:몇|1)시간 몇 분/.exec(p) ?? /(\d+)분(?:은|는|이) 몇 시간 몇 분/.exec(p);
  if (m && Number(m[1]) > 60 && Number(m[1]) <= 240) return { kind: 'minute-bar', label: `${m[1]}분`, total: Number(m[1]) };
  return null;
};

/** 문제 글로 그림을 정합니다. 그릴 수 없으면 null입니다. */
// ── 시계·달력 ─────────────────────────────────────────────────────────
// '짧은바늘이 6과 7 사이에 있고, 긴바늘이 숫자 6을 가리킵니다. 몇 시 몇 분일까요?'처럼
// 바늘 자리를 글로만 알려 주던 문제가 많았습니다. 2학년에게 바늘 자리를 머릿속에
// 그리게 하는 것은 시계 읽기보다 어렵습니다. 글이 말한 바늘 자리 그대로 시계를 그려
// 보여 줍니다(글에 이미 있는 것만 그리므로 답을 더 알려 주지 않습니다).
const 바늘글 = (p: string): { hour: number; minute: number } | null => {
  if (!/몇 시(?: 몇 분)?일까요\?\s*$/.test(p)) return null;
  const 눈금 = /긴바늘[이은는]?\s*(?:숫자\s*)?(\d+)(?:에서|을 지나|를 지나)\s*작은 눈금(?:으로)?\s*(\d+)\s*칸/.exec(p);
  const 긴 = /긴바늘[이은는]?\s*(?:숫자\s*)?(\d+)[을를]?\s*가리/.exec(p);
  const minute = 눈금 ? (Number(눈금[1]) % 12) * 5 + Number(눈금[2]) : 긴 ? (Number(긴[1]) % 12) * 5 : null;
  if (minute === null || minute > 59) return null;
  const 사이 = /짧은바늘[이은는]?\s*(\d+)[과와]\s*\d+\s*사이/.exec(p);
  const 가리킴 = /짧은바늘[이은는]?\s*(\d+)[을를]?\s*(?:조금\s*)?가리/.exec(p);
  const 짧은 = 사이 ?? 가리킴;
  if (!짧은) return null;
  const hour = Number(짧은[1]);
  if (hour < 1 || hour > 12) return null;
  // '짧은바늘이 4를 가리키는' 것은 정각뿐입니다. 글이 어긋나면 그리지 않습니다.
  if (가리킴 && !사이 && minute !== 0) return null;
  return { hour, minute };
};

const 요일이름 = ['일', '월', '화', '수', '목', '금', '토'];
/** '어느 달 3일은 화요일입니다. 같은 달 17일은 무슨 요일일까요?' — 알려 준 날을 표시한 달력입니다. */
const 달력글 = (p: string): QuestionVisual | null => {
  const m = /(\d+)일[은이]\s*(일|월|화|수|목|금|토)요일입니다\.\s*같은 달 (\d+)일은 무슨 요일/.exec(p);
  if (!m) return null;
  const 날 = Number(m[1]);
  const 그날 = Number(m[3]);
  if (날 < 1 || 그날 < 1 || 그날 > 31) return null;
  const 처음 = (((요일이름.indexOf(m[2]) - (날 - 1)) % 7) + 7) % 7;
  return { kind: 'calendar', label: '요일을 알려 주는 달력', startWeekday: 처음, days: Math.max(30, 그날), marks: [{ day: 날, tone: 'start' }] };
};

export const 그림추론 = (p: string): QuestionVisual | null => {
  let m: RegExpExecArray | null;

  const 바늘 = 바늘글(p);
  if (바늘) return { kind: 'clock', label: '바늘 자리를 그린 시계', hour: 바늘.hour, minute: 바늘.minute };
  const 달력 = 달력글(p);
  if (달력) return 달력;

  // 칠교판(2-1 2단원): 조각을 세거나 견주는 문제는 번호가 붙은 칠교 7조각을 보여 줍니다.
  // 그림이 없으면 아이는 삼각형 조각 5개, 사각형 조각 2개를 떠올릴 수가 없습니다.
  if (/칠교/.test(p)) return { kind: 'tangram', label: '번호가 붙은 칠교 7조각' };

  // 세 각이 주어진 삼각형
  m = /세 각의 크기가 (\d+)°, (\d+)°, (\d+)°인 삼각형/.exec(p);
  if (m) return 각삼각형(Number(m[1]), Number(m[2]), [`${m[1]}°`, `${m[2]}°`, `${m[3]}°`], '세 각의 크기가 주어진 삼각형');
  m = /삼각형의 (?:두|2개의) 각의 크기가 (\d+)(°|도), (\d+)(°|도)/.exec(p);
  if (m) return 각삼각형(Number(m[1]), Number(m[3]), [`${m[1]}°`, `${m[3]}°`, '?'], '두 각의 크기가 주어진 삼각형');
  m = /삼각형에서 (?:2|두)개의 각의 크기가 (\d+)°, (\d+)°/.exec(p);
  if (m) return 각삼각형(Number(m[1]), Number(m[2]), [`${m[1]}°`, `${m[2]}°`, '?'], '두 각의 크기가 주어진 삼각형');
  m = /두 각의 크기가 같은 삼각형에서 나머지 한 각이 (\d+)°/.exec(p);
  if (m) { const x = Number(m[1]); const y = (180 - x) / 2; return 각삼각형(y, y, ['?', '?', `${x}°`], '두 각의 크기가 같은 삼각형'); }
  m = /이등변삼각형의 꼭지각의 크기가 (\d+)도/.exec(p);
  if (m) { const x = Number(m[1]); const y = (180 - x) / 2; return 각삼각형(y, y, ['?', '?', `${x}°`], '이등변삼각형'); }
  m = /이등변삼각형의 한 밑각의 크기가 (\d+)도/.exec(p);
  if (m) { const y = Number(m[1]); return 각삼각형(y, y, [`${y}°`, '', '?'], '이등변삼각형'); }
  m = /이등변삼각형에서 크기가 같은 두 각 가운데 한 각이 (\d+)°/.exec(p);
  if (m) { const y = Number(m[1]); return 각삼각형(y, y, [`${y}°`, '', '?'], '이등변삼각형'); }

  // 세 각이 주어진 사각형
  m = /사각형의 (?:세|3개의) 각의 크기가 (\d+)(?:°|도), (\d+)(?:°|도), (\d+)(?:°|도)/.exec(p) ?? /사각형의 세 각의 크기가 (\d+)°, (\d+)°, (\d+)°/.exec(p);
  if (m) {
    const [a, b, c] = [1, 2, 3].map((k) => Number(m![k]));
    return 각사각형([a, b, c, 360 - a - b - c], [`${a}°`, `${b}°`, `${c}°`, '?'], '세 각의 크기가 주어진 사각형');
  }
  m = /사각형의 네 각 가운데 세 각의 크기가 같고, 나머지 한 각은 (\d+)°/.exec(p);
  if (m) { const x = Number(m[1]); const y = (360 - x) / 3; return 각사각형([y, y, y, x], ['?', '?', '?', `${x}°`], '세 각의 크기가 같은 사각형'); }

  // 넓이·둘레의 평면도형
  m = /윗변의 길이가 (\d+) (cm|m), 아랫변의 길이가 (\d+) \2, 높이가 (\d+) \2인 사다리꼴/.exec(p);
  if (m) return 사다리꼴(Number(m[1]), Number(m[3]), Number(m[4]), { 윗변: `윗변 ${m[1]} ${m[2]}`, 아랫변: `아랫변 ${m[3]} ${m[2]}`, 높이: `높이 ${m[4]} ${m[2]}` });
  m = /넓이가 (\d+) (cm|m)²이고 윗변의 길이가 (\d+) \2, 아랫변의 길이가 (\d+) \2인 사다리꼴/.exec(p);
  if (m) { const h = (2 * Number(m[1])) / (Number(m[3]) + Number(m[4])); return 사다리꼴(Number(m[3]), Number(m[4]), h, { 윗변: `윗변 ${m[3]} ${m[2]}`, 아랫변: `아랫변 ${m[4]} ${m[2]}`, 높이: '높이 ?' }); }
  m = /밑변의 길이가 (\d+) (cm|m), 높이가 (\d+) \2인 평행사변형/.exec(p);
  if (m) return 평행사변형(Number(m[1]), Number(m[3]), { 밑변: `밑변 ${m[1]} ${m[2]}`, 높이: `높이 ${m[3]} ${m[2]}` });
  m = /넓이가 (\d+) (cm|m)²이고 밑변의 길이가 (\d+) \2인 평행사변형/.exec(p);
  if (m) return 평행사변형(Number(m[3]), Number(m[1]) / Number(m[3]), { 밑변: `밑변 ${m[3]} ${m[2]}`, 높이: '높이 ?' });
  m = /밑변의 길이가 (\d+) (cm|m), 높이가 (\d+) \2인 삼각형/.exec(p);
  if (m) return 삼각형밑높이(Number(m[1]), Number(m[3]), { 밑변: `밑변 ${m[1]} ${m[2]}`, 높이: `높이 ${m[3]} ${m[2]}` });
  m = /넓이가 (\d+) (cm|m)²이고 밑변의 길이가 (\d+) \2인 삼각형/.exec(p);
  if (m) return 삼각형밑높이(Number(m[3]), (2 * Number(m[1])) / Number(m[3]), { 밑변: `밑변 ${m[3]} ${m[2]}`, 높이: '높이 ?' });
  m = /두 대각선의 길이가 (\d+) (cm|m), (\d+) \2인 마름모/.exec(p);
  if (m) return 마름모(Number(m[1]), Number(m[3]), [`${m[1]} ${m[2]}`, `${m[3]} ${m[2]}`]);
  m = /넓이가 (\d+) (cm|m)²이고 한 대각선의 길이가 (\d+) \2인 마름모/.exec(p);
  if (m) return 마름모(Number(m[3]), (2 * Number(m[1])) / Number(m[3]), [`${m[3]} ${m[2]}`, '?']);
  m = /가로가? ([\d.]+) (cm|m|km), 세로가? ([\d.]+) \2인 직사각형/.exec(p);
  if (m) return 직사각형(Number(m[1]), Number(m[3]), { 가로: `${m[1]} ${m[2]}`, 세로: `${m[3]} ${m[2]}` });
  m = /네 변의 길이의 합이 (\d+) cm인 마름모/.exec(p);
  if (m) return 도형하나('마름모', { shape: '마름모', edgeLabels: [{ from: 0, to: 1, text: '?' }] });
  m = /넓이가 ([\d.]+) (cm|m)²이고 가로가 ([\d.]+) \2인 직사각형/.exec(p);
  if (m) return 직사각형(Number(m[3]), Number(m[1]) / Number(m[3]), { 가로: `${m[3]} ${m[2]}`, 세로: '?' });
  m = /둘레가 (\d+) cm이고 가로가 (\d+) cm인 직사각형/.exec(p);
  if (m) return 직사각형(Number(m[2]), Number(m[1]) / 2 - Number(m[2]), { 가로: `${m[2]} cm`, 세로: '?' });
  m = /네 변의 길이의 합이 (\d+) cm입니다\. 가로가 (\d+) cm/.exec(p);
  if (m && p.startsWith('직사각형')) return 직사각형(Number(m[2]), Number(m[1]) / 2 - Number(m[2]), { 가로: `${m[2]} cm`, 세로: '?' });

  // 원(원기둥·원뿔·구·반원이 아닌 것)
  // 원 여러 개를 견주는 문항(㉠ 반지름이 8 cm인 원, ㉡ …)은 그리지 않습니다.
  if (!/원기둥|원뿔|반원|구의|구를|구는|㉠/.test(p)) {
    m = /(?:^|[ .])지름이 ([\d.]+) cm인 원/.exec(p);
    if (m) return 원그림(`${m[1]} cm`, true, Number(m[1]) / 2);
    m = /반지름이 ([\d.]+) cm인 원/.exec(p);
    if (m) return 원그림(`${m[1]} cm`, false, Number(m[1]));
    if (/^원주는 지름의|^원의 지름에 대한 원주의|^원주율|원의 크기가 커지면 원주율/.test(p)) return 원그림('지름', true);
  }

  return 길이재기(p) ?? 더평면(p) ?? 사각형그림(p) ?? 입체그림(p) ?? 상자그림(p);
};
