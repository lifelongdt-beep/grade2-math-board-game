import type { QuestionVisual } from '../../../types';
import type { G5Family } from '../build';
import { eul, eun, gwa, i as iJosa, rand } from '../util';
import type { Folded, NetLayout } from './box';
import { fold, meetingPoints, oppositeCells, overlappingSegment } from './box';
import { CUBE_NETS, CUBE_NOT_NETS, boxNetLayouts, brokenBoxNet } from './nets';
import { 답으로맺기 } from './lessons';

// ════════════════════════════════════════════════════════════════════
// 5단원 6·7차시 직육면체와 정육면체의 전개도
// ────────────────────────────────────────────────────────────────────
// 답을 손으로 적지 않습니다. 전개도를 실제로 접어(box.ts) 어느 점이
// 어느 점과 만나는지, 어느 면이 어느 면과 마주 보는지를 계산해서
// 그대로 씁니다. 그림도 같은 자료로 그리므로 글과 그림이 어긋날
// 자리가 없습니다.
//
// 지도서가 아이에게 말하게 하는 '전개도가 될 수 없는 까닭'도 접어 본
// 결과에서 읽습니다.
//   · 면이 6개가 아닙니다
//   · 접었을 때 겹치는 면이 있습니다
//   · 접었을 때 만나는 선분의 길이가 다릅니다
// ════════════════════════════════════════════════════════════════════

const 면이름 = ['가', '나', '다', '라', '마', '바'];

const 섞기 = <T,>(items: T[], seed: number): T[] => {
  const copy = [...items];
  const next = rand(seed);
  for (let at = copy.length - 1; at > 0; at -= 1) {
    const to = next(at + 1);
    [copy[at], copy[to]] = [copy[to], copy[at]];
  }
  return copy;
};

const 꼭짓점그림 = (label: string, layout: NetLayout, folded: Folded): QuestionVisual => ({
  kind: 'box-net',
  label,
  cols: layout.cols,
  rows: layout.rows,
  cells: layout.cells.map((cell) => ({ col: cell.col, row: cell.row })),
  points: folded.points.map((one) => ({ x: one.x, y: one.y, text: one.name })),
});

const 면그림 = (label: string, layout: NetLayout, 색칠?: number, 글자?: string[]): QuestionVisual => ({
  kind: 'box-net',
  label,
  cols: layout.cols,
  rows: layout.rows,
  cells: layout.cells.map((cell, at) => ({
    col: cell.col,
    row: cell.row,
    text: (글자 ?? 면이름)[at],
    ...(색칠 === at ? { shade: 1 as const } : {}),
  })),
});

const 민그림 = (label: string, layout: NetLayout): QuestionVisual => ({
  kind: 'box-net',
  label,
  cols: layout.cols,
  rows: layout.rows,
  cells: layout.cells.map((cell) => ({ col: cell.col, row: cell.row })),
});

/** 전개도를 쓰는 차시가 정육면체인지 직육면체인지에 따라 모양을 고릅니다. */
const 전개도고르기 = (정육면체인가: boolean, seed: number): NetLayout => {
  if (정육면체인가) return CUBE_NETS[Math.abs(seed) % CUBE_NETS.length];
  const next = rand(seed);
  const size = { width: 4 + next(5), depth: 2 + next(3), height: 3 + next(5) };
  const 후보 = boxNetLayouts(size);
  return 후보[Math.abs(seed) % 후보.length];
};

export const 전개도Families = (정육면체인가: boolean): G5Family[] => {
  const 이름 = 정육면체인가 ? '정육면체' : '직육면체';
  const 면모양 = 정육면체인가 ? '정사각형' : '직사각형';

  const families: G5Family[] = [
    {
      id: 'net-meaning',
      make: (seed) => {
        const 거꾸로 = Math.abs(seed) % 2 === 0;
        const layout = 전개도고르기(정육면체인가, seed);
        if (거꾸로) {
          return {
            prompt: `${이름}의 모서리를 잘라서 평면 위에 펼친 그림을 무엇이라고 할까요?`,
            answer: '전개도',
            wrongs: ['겨냥도', '밑면', '평면도형'],
            tag: 'solid',
            strategy: '전개도의 뜻 알기',
            hint: '보이는 그대로 그린 그림인지, 잘라서 펼친 그림인지 가려 보세요.',
            steps: [`${이름}의 모서리를 잘라서 평면 위에 펼친 그림을 ${이름}의 전개도라고 합니다.`],
            visual: 민그림('펼친 그림', layout),
          };
        }
        return {
          prompt: `${이름}의 전개도는 어떤 그림일까요?`,
          answer: `${이름}의 모서리를 잘라서 평면 위에 펼친 그림`,
          wrongs: [
            `${eul(이름)} 한 방향에서 보고 보이는 그대로 그린 그림`,
            `${이름}의 한 면만 크게 그린 그림`,
            `${eul(이름)} 위에서 내려다본 그림`,
          ],
          tag: 'solid',
          strategy: '전개도의 뜻 알기',
          hint: '보이는 그대로 그린 그림은 겨냥도입니다.',
          steps: [`${이름}의 모서리를 잘라서 평면 위에 펼친 그림이 전개도입니다.`],
          visual: 민그림('펼친 그림', layout),
        };
      },
    },
    {
      id: 'net-cut-rule',
      make: (seed) => {
        const 하나 = [
          {
            q: '전개도를 만들 때 상자를 어떻게 잘라야 할까요?',
            a: '모서리를 따라 잘라야 합니다.',
            w: ['면의 한가운데를 잘라야 합니다.', '아무 데나 잘라도 됩니다.', '꼭짓점만 잘라야 합니다.'],
            why: '모서리를 따라 자르지 않으면 펼친 모양만 보고 원래 모양을 떠올리기 어렵습니다.',
          },
          {
            q: '전개도에서 잘린 모서리는 어떤 선으로 그릴까요?',
            a: '실선으로 그립니다.',
            w: ['점선으로 그립니다.', '그리지 않습니다.', '물결선으로 그립니다.'],
            why: '전개도에서 잘린 모서리는 실선으로, 잘리지 않은 모서리(접는 선)는 점선으로 그립니다.',
          },
          {
            q: '전개도에서 잘리지 않은 모서리는 어떤 선으로 그릴까요?',
            a: '점선으로 그립니다.',
            w: ['실선으로 그립니다.', '그리지 않습니다.', '두 줄로 그립니다.'],
            why: '잘리지 않은 모서리는 접는 선이므로 점선으로 그립니다.',
          },
          {
            q: '전개도를 접었을 때 겹치는 두 선분의 길이는 어떠할까요?',
            a: '서로 같습니다.',
            w: ['서로 다릅니다.', '한쪽이 두 배입니다.', '길이를 알 수 없습니다.'],
            why: '한 모서리를 잘라서 생긴 두 선분이므로 길이가 서로 같습니다.',
          },
          {
            q: '전개도를 접었을 때 마주 보는 두 면은 어떠할까요?',
            a: '모양과 크기가 같습니다.',
            w: ['모양만 같습니다.', '크기만 같습니다.', '모양과 크기가 모두 다릅니다.'],
            why: `${이름}에서 마주 보는 두 면은 서로 평행하고 모양과 크기가 같습니다.`,
          },
        ][Math.abs(seed) % 5];
        return {
          prompt: 하나.q,
          answer: 하나.a,
          wrongs: 하나.w,
          tag: 'solid',
          strategy: '전개도를 그리는 방법 알기',
          hint: '자른 곳과 접는 곳을 어떻게 다르게 나타내는지 떠올리세요.',
          steps: 답으로맺기(하나.why, 하나.a),
        };
      },
    },
    {
      id: 'meeting-point',
      make: (seed) => {
        const layout = 전개도고르기(정육면체인가, seed);
        const folded = fold(layout);
        // 만나는 점이 하나뿐인 꼭짓점만 씁니다. 둘이면 답이 둘이 됩니다.
        const 후보 = folded.points.filter((one) => meetingPoints(folded, one.name).length === 1);
        if (!후보.length) return null;
        const 물은점 = 후보[Math.abs(seed) % 후보.length];
        const 답 = meetingPoints(folded, 물은점.name)[0];
        const 오답 = 섞기(
          folded.points.filter((one) => one.name !== 답 && one.name !== 물은점.name).map((one) => `점 ${one.name}`),
          seed,
        ).slice(0, 3);
        return {
          prompt: `그림은 ${이름}의 전개도입니다. 접었을 때 ${gwa(`점 ${물은점.name}`)} 만나는 점은 어느 것일까요?`,
          answer: `점 ${답}`,
          wrongs: 오답,
          tag: 'solid',
          strategy: '접었을 때 만나는 점 찾기',
          hint: '전개도를 손으로 접는다고 생각하고, 그 점이 붙어 있는 면이 어느 쪽으로 세워지는지 따라가 보세요.',
          steps: [
            '전개도를 접으면 잘렸던 두 곳이 다시 붙습니다.',
            `${iJosa(`점 ${물은점.name}`)} 있는 면을 접어 세우면 그 점은 잘리기 전의 자리로 돌아갑니다.`,
            `그 자리에서 만나는 점은 점 ${답}입니다.`,
          ],
          visual: 꼭짓점그림('전개도', layout, folded),
          misconceptionTip: '전개도에서 멀리 떨어져 있어도 접으면 만나는 점이 있습니다. 거리로 고르지 마세요.',
        };
      },
    },
    {
      id: 'overlap-segment',
      make: (seed) => {
        const layout = 전개도고르기(정육면체인가, seed + 1);
        const folded = fold(layout);
        const 물은변 = folded.border[Math.abs(seed) % folded.border.length];
        const 답 = overlappingSegment(folded, 물은변.from, 물은변.to);
        if (!답) return null;
        const 오답 = 섞기(
          folded.border
            .map((one) => `선분 ${one.from}${one.to}`)
            .filter((one) => one !== 답 && one !== `선분 ${물은변.from}${물은변.to}`),
          seed,
        ).slice(0, 3);
        return {
          prompt: `그림은 ${이름}의 전개도입니다. 접었을 때 ${gwa(`선분 ${물은변.from}${물은변.to}`)} 겹치는 선분은 어느 것일까요?`,
          answer: 답,
          wrongs: 오답,
          tag: 'solid',
          strategy: '접었을 때 겹치는 선분 찾기',
          hint: '그 선분은 상자의 한 모서리를 자른 자리입니다. 같은 모서리를 자른 나머지 한쪽을 찾으세요.',
          steps: [
            '전개도의 바깥 테두리는 잘린 모서리입니다.',
            '한 모서리를 자르면 선분이 둘로 나뉘므로, 접으면 그 둘이 다시 겹칩니다.',
            `${gwa(`선분 ${물은변.from}${물은변.to}`)} 겹치는 선분은 ${답}입니다.`,
          ],
          visual: 꼭짓점그림('전개도', layout, folded),
        };
      },
    },
    {
      id: 'opposite-face',
      make: (seed) => {
        const layout = 전개도고르기(정육면체인가, seed + 2);
        const folded = fold(layout);
        const 쌍 = oppositeCells(folded);
        if (쌍.length !== 3) return null;
        const 고른쌍 = 쌍[Math.abs(seed) % 3];
        const 물은면 = Math.abs(seed) % 2 === 0 ? 고른쌍[0] : 고른쌍[1];
        const 답 = 물은면 === 고른쌍[0] ? 고른쌍[1] : 고른쌍[0];
        const 오답 = 섞기(
          면이름.map((name, at) => ({ name, at })).filter((one) => one.at !== 답 && one.at !== 물은면),
          seed,
        )
          .slice(0, 3)
          .map((one) => `면 ${one.name}`);
        return {
          prompt: `그림은 ${이름}의 전개도입니다. 접었을 때 색칠한 ${gwa(`면 ${면이름[물은면]}`)} 마주 보는 면은 어느 것일까요?`,
          answer: `면 ${면이름[답]}`,
          wrongs: 오답,
          tag: 'solid',
          strategy: '접었을 때 마주 보는 면 찾기',
          // 같은 줄에서 한 칸 건너뛴 면끼리 마주 본다는 것은 학교에서
          // 널리 쓰는 요령입니다. 다만 줄이 꺾이면 그대로 쓸 수 없으므로,
          // 맞닿는지를 보는 방법을 함께 적어 둡니다.
          hint: '같은 줄에서 한 칸 건너뛴 면끼리 마주 봅니다. 줄이 꺾여 바로 알기 어려우면, 색칠한 면과 한 모서리라도 맞닿는 면을 하나씩 지워 보세요.',
          steps: [
            `${이름}에서 마주 보는 두 면은 서로 평행하여 맞닿지 않습니다.`,
            `전개도를 접어 보면 ${gwa(`면 ${면이름[물은면]}`)} 닿지 않는 면은 하나뿐입니다.`,
            `그 면은 면 ${면이름[답]}입니다.`,
          ],
          visual: 면그림('전개도', layout, 물은면),
          misconceptionTip: '전개도에서 한 칸 건너 있는 면이 마주 보는 면인 경우가 많지만, 모양에 따라 다릅니다. 접어서 확인하세요.',
        };
      },
    },
    {
      id: 'is-net',
      make: (seed) => {
        const next = rand(seed);
        const 맞는것인가 = Math.abs(seed) % 2 === 0;
        const layout = 맞는것인가
          ? 전개도고르기(정육면체인가, seed + 3)
          : 정육면체인가
            ? CUBE_NOT_NETS[Math.abs(seed) % CUBE_NOT_NETS.length]
            : Math.abs(seed) % 2 === 0
              ? brokenBoxNet({ width: 4 + next(4), depth: 2 + next(3), height: 3 + next(4) })
              : CUBE_NOT_NETS[Math.abs(seed) % CUBE_NOT_NETS.length];
        const folded = fold(layout);
        if (맞는것인가 !== folded.makesBox) return null;
        const 답 = folded.makesBox ? `${eul(이름)} 만들 수 있습니다.` : (folded.reason as string);
        const 오답 = folded.makesBox
          ? ['접었을 때 겹치는 면이 있습니다.', '면이 6개가 아닙니다.', '접었을 때 만나는 선분의 길이가 다릅니다.']
          : [
              `${eul(이름)} 만들 수 있습니다.`,
              ...['접었을 때 겹치는 면이 있습니다.', '면이 6개가 아니라 5개입니다.', '접었을 때 만나는 선분의 길이가 다릅니다.'].filter(
                (one) => one !== 답,
              ),
            ];
        return {
          prompt: `그림을 접어 ${eul(이름)} 만들 수 있을까요? 만들 수 없다면 그 까닭은 무엇일까요?`,
          answer: 답,
          wrongs: 오답,
          tag: 'solid',
          strategy: '전개도가 될 수 있는지 판단하기',
          hint: '면이 6개인지 세고, 접었을 때 겹치는 면이 없는지, 맞닿는 선분의 길이가 같은지 차례로 보세요.',
          steps: [
            `${이름}의 전개도는 면이 6개이고, 접었을 때 겹치는 면이 없어야 합니다.`,
            '또 접었을 때 맞닿는 두 선분의 길이가 같아야 합니다.',
            folded.makesBox ? `이 그림은 세 가지를 모두 갖추었으므로 ${eul(이름)} 만들 수 있습니다.` : `이 그림은 ${답}`,
          ],
          visual: 민그림('펼친 그림', layout),
        };
      },
    },
    {
      id: 'net-counts',
      make: (seed) => {
        const 하나 = [
          {
            q: `${이름}의 전개도에서 면은 모두 몇 개일까요?`,
            a: '6개',
            w: ['4개', '5개', '8개'],
            why: `${이름}는 면이 6개이므로 전개도에도 면이 6개 있습니다.`,
          },
          {
            q: `${이름} 모양의 상자를 펼칠 때 모서리를 자른 곳은 몇 군데일까요?`,
            a: '7군데',
            w: ['5군데', '6군데', '12군데'],
            why: '모서리 12개 가운데 7개를 자르고 5개는 접는 선으로 남깁니다.',
          },
          {
            q: `${이름}의 전개도에서 잘리지 않은 모서리는 몇 군데일까요?`,
            a: '5군데',
            w: ['6군데', '7군데', '12군데'],
            why: '모서리 12개 가운데 7개를 자르므로 잘리지 않은 모서리는 5개입니다.',
          },
          {
            q: `${이름}의 전개도에서 면은 어떤 모양일까요?`,
            a: 면모양,
            w: 정육면체인가
              ? ['직사각형이지만 정사각형은 아닌 모양', '마름모', '평행사변형']
              : ['정삼각형', '마름모', '사다리꼴'],
            why: `${이름}는 ${면모양} 6개로 둘러싸여 있습니다.`,
          },
        ][Math.abs(seed) % 4];
        return {
          prompt: 하나.q,
          answer: 하나.a,
          wrongs: 하나.w,
          tag: 'solid',
          strategy: '전개도의 면과 모서리 세기',
          hint: `${이름}의 면은 6개, 모서리는 12개입니다. 그 가운데 몇 개를 잘랐는지 생각해 보세요.`,
          steps: 답으로맺기(하나.why, 하나.a),
          visual: 민그림('펼친 그림', 전개도고르기(정육면체인가, seed + 4)),
        };
      },
    },
  ];

  if (정육면체인가) {
    families.push(
      {
        id: 'cube-net-kinds',
        make: (seed) => {
          const 하나 = [
            {
              q: '정육면체의 전개도는 서로 다른 모양이 모두 몇 가지일까요?',
              a: '11가지',
              w: ['6가지', '8가지', '1가지'],
              why: '모서리를 자르는 방법에 따라 서로 다른 모양이 11가지 나옵니다.',
            },
            {
              q: '한 정육면체를 펼쳐 만들 수 있는 전개도의 모양은 몇 가지일까요?',
              a: '여러 가지입니다.',
              w: ['한 가지뿐입니다.', '두 가지뿐입니다.', '모양을 정할 수 없습니다.'],
              why: '모서리를 어디에서 자르느냐에 따라 펼친 모양이 달라집니다.',
            },
          ][Math.abs(seed) % 2];
          return {
            prompt: 하나.q,
            answer: 하나.a,
            wrongs: 하나.w,
            tag: 'solid',
            strategy: '전개도가 여러 가지임을 알기',
            hint: '같은 상자라도 어느 모서리를 자르느냐에 따라 펼친 모양이 달라집니다.',
            steps: 답으로맺기(하나.why, 하나.a),
            visual: 민그림('펼친 그림', CUBE_NETS[Math.abs(seed) % CUBE_NETS.length]),
          };
        },
      },
      {
        id: 'dice',
        make: (seed) => {
          const layout = CUBE_NETS[Math.abs(seed) % CUBE_NETS.length];
          const folded = fold(layout);
          const 쌍 = oppositeCells(folded);
          if (쌍.length !== 3) return null;
          // 주사위는 마주 보는 두 면의 눈의 수의 합이 7입니다.
          const 눈 = new Array(6).fill(0);
          const 짝값: Array<[number, number]> = [[1, 6], [2, 5], [3, 4]];
          const 섞은짝 = 섞기(짝값, seed);
          쌍.forEach((pair, at) => {
            const [작은, 큰] = 섞은짝[at];
            눈[pair[0]] = Math.abs(seed + at) % 2 === 0 ? 작은 : 큰;
            눈[pair[1]] = 7 - 눈[pair[0]];
          });
          const 고른쌍 = 쌍[Math.abs(seed) % 3];
          const 물은면 = 고른쌍[0];
          const 답 = 눈[고른쌍[1]];
          return {
            prompt: `그림은 주사위의 전개도입니다. 주사위는 마주 보는 두 면의 눈의 수의 합이 7입니다. 색칠한 면과 마주 보는 면의 눈의 수는 얼마일까요?`,
            answer: `${답}`,
            wrongs: [1, 2, 3, 4, 5, 6].filter((one) => one !== 답).slice(0, 3).map(String),
            tag: 'solid',
            strategy: '마주 보는 면의 눈의 수 구하기',
            hint: '색칠한 면과 접었을 때 닿지 않는 면을 먼저 찾고, 합이 7이 되도록 계산하세요.',
            steps: [
              '마주 보는 두 면은 접었을 때 서로 닿지 않습니다.',
              `색칠한 면의 눈의 수는 ${눈[물은면]}입니다.`,
              `7 - ${눈[물은면]} = ${답}이므로 마주 보는 면의 눈의 수는 ${답}입니다.`,
            ],
            visual: 면그림('전개도', layout, 물은면, 눈.map(String)),
          };
        },
      },
    );
  } else {
    families.push({
      id: 'net-edge-length',
      make: (seed) => {
        const next = rand(seed);
        const size = { width: 4 + next(5), depth: 2 + next(3), height: 3 + next(5) };
        if (size.width === size.depth || size.depth === size.height || size.width === size.height) return null;
        const 후보 = boxNetLayouts(size);
        const layout = 후보[Math.abs(seed) % 후보.length];
        const 무엇 = ['가로', '세로', '높이'][next(3)];
        const 길이: Record<string, number> = { 가로: size.width, 세로: size.depth, 높이: size.height };
        const 다른값 = [size.width, size.depth, size.height].filter((one) => one !== 길이[무엇]);
        return {
          prompt: `그림은 가로가 ${size.width} cm, 세로가 ${size.depth} cm, 높이가 ${size.height} cm인 직육면체의 전개도입니다. 이 전개도를 접었을 때 ${eul(무엇)} 나타내는 모서리의 길이는 몇 cm일까요?`,
          answer: `${길이[무엇]} cm`,
          wrongs: [
            `${다른값[0]} cm`,
            `${다른값[1]} cm`,
            `${size.width + size.depth + size.height} cm`,
            `${길이[무엇] * 2} cm`,
          ],
          tag: 'solid',
          strategy: '전개도에서 모서리의 길이 찾기',
          hint: '전개도를 접으면 가로, 세로, 높이가 그대로 살아납니다. 문제에 적힌 세 길이 가운데 어느 것인지 고르세요.',
          steps: [
            '전개도를 접으면 원래 직육면체가 되므로 길이는 바뀌지 않습니다.',
            `${eun(무엇)} ${길이[무엇]} cm입니다.`,
          ],
          visual: 민그림('전개도', layout),
        };
      },
    });
  }

  return families;
};
