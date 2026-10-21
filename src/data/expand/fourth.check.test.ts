import { describe, expect, it } from 'vitest';
import type { G5Family, G5Spec } from '../grade5/build';
import {
  각의합, 등호식, 똑같이나누기, 모양만들기, 몫분수, 백분율, 세자리나누기, 세자리몇십, 세제곱미터, 소수나누기관계, 소수나머지, 소수세자리, 수규칙, 수배열표,
  쌓기나무칸, 제곱센티, 직각세기, 초단위, 평행사변형넓이,
} from './fourth';

// ════════════════════════════════════════════════════════════════════
// 넷째 묶음(fourth.ts)의 답을 글만 보고 다시 구해 맞춰 봅니다.
// ────────────────────────────────────────────────────────────────────
// fourth.ts의 셈을 쓰지 않고 문제 글에서 수를 읽어 따로 셈합니다.
// 보기 넷이 서로 다른지, 조사가 괄호 꼴로 남지 않았는지, 결이 밝혀졌는지,
// 글의 틀이 넉넉히 다른지도 봅니다.
// ════════════════════════════════════════════════════════════════════

const 뭉치들: G5Family[] = [
  각의합(false), 각의합(true), 등호식(), 똑같이나누기(), 모양만들기(false), 모양만들기(true), 몫분수(false), 몫분수(true), 백분율(), 세자리나누기(false),
  세자리나누기(true), 세자리몇십(), 세제곱미터(), 소수나누기관계(), 소수나머지(), 소수세자리(), 수규칙(), 수배열표(), 쌓기나무칸(), 제곱센티(), 직각세기(),
  초단위(), 평행사변형넓이(),
];

const 반 = (x: number) => Math.round(x * 1000) / 1000;
const 합 = (t: string) => t.split(/,\s*|\+/).map(Number).reduce((x, y) => x + y, 0);
// 자연수 부분의 끝 숫자 읽기(영·일·삼·육·칠·팔)에 받침이 있으면 '과', 없으면(이·사·오·구) '와'를 씁니다.
const 분수 = (n: number, d: number) => (n % d === 0 ? `${n / d}` : n > d ? `${Math.floor(n / d)}${/[013678]$/.test(String(Math.floor(n / d))) ? '과' : '와'} ${n % d}/${d}` : `${n}/${d}`);

/** 글만 보고 답을 구합니다. 풀 수 없는 글이면 undefined입니다. */
const 풀기 = (s: G5Spec): string | number | undefined => {
  const p = s.prompt;
  let m: RegExpExecArray | null;
  // 모양 만들기
  if ((m = /(상자 모양 (\d+)개, 둥근기둥 모양 (\d+)개, 공 모양 (\d+)개)로 \S+ 만들었습니다\. 가장 (많이|적게)/.exec(p))) {
    const 수 = [+m[2], +m[3], +m[4]]; const k = 수.indexOf(m[5] === '많이' ? Math.max(...수) : Math.min(...수)); return ['상자 모양', '둥근기둥 모양', '공 모양'][k];
  }
  if ((m = /만드는 데 (\S+ 모양)[을를] (\d+)개, (\S+ 모양)[을를] (\d+)개 사용했습니다/.exec(p))) return +m[2] > +m[4] ? m[1] : m[3];
  if ((m = /'(.+)\.' 이 모양은 무엇/.exec(p))) return /굴러가지 않/.test(m[1]) ? '상자 모양' : /어느 쪽으로도/.test(m[1]) ? '공 모양' : '둥근기둥 모양';
  if ((m = /(\d+)개와 \S+ 모양 (\d+)개로 \S+ (?:꾸몄|만들었)습니다\. \S+ 사용한 모양은 모두/.exec(p))) return +m[1] + +m[2];
  if ((m = /(\d+)개와 \S+ 모양 (\d+)개로 \S+ (?:꾸몄|만들었)습니다\. \S+ 모양[은는] \S+ 모양보다 몇 개 더/.exec(p))) return +m[1] - +m[2];
  if ((m = /모양 (\d+)개, \S+ 모양 (\d+)개, \S+ 모양 (\d+)개로/.exec(p))) return +m[1] + +m[2] + +m[3];
  if ((m = /모양 (\d+)개와 \S+ 모양 몇 개로 .*모두 (\d+)개라면/.exec(p))) return +m[2] - +m[1];
  if ((m = /모양[이가] (\d+)개 있어야 합니다\. \S+ \S+ 모양[이가] (\d+)개 있다면/.exec(p))) return +m[1] - +m[2];
  // 수 배열표
  if ((m = /수 배열표가 있습니다\. (\d+) 바로 (오른쪽|아래|위) 칸/.exec(p))) return +m[1] + { 오른쪽: 1, 아래: 10, 위: -10 }[m[2]]!;
  if ((m = /수 배열표가 있습니다\. (\d+)에서 아래로 (\d)칸/.exec(p))) return +m[1] + 10 * +m[2];
  if ((m = /수 배열표가 있습니다\. (\d+)에서 오른쪽으로 (\d)칸, 아래로 (\d)칸/.exec(p))) return +m[1] + +m[2] + 10 * +m[3];
  // 등호
  if ((m = /^□ 안에 알맞은 수를 구하세요\. (\d+)\+(\d+)=(\d+)\+□$/.exec(p))) return +m[1] + +m[2] - +m[3];
  if ((m = /^□ 안에 알맞은 수를 구하세요\. (\d+)-(\d+)=(\d+)-□$/.exec(p))) return +m[3] - (+m[1] - +m[2]);
  if ((m = /^□ 안에 알맞은 수를 구하세요\. (\d+)×(\d+)=(\d+)×□$/.exec(p))) return (+m[1] * +m[2]) / +m[3];
  if ((m = /□\+(\d+)=(\d+)\+(\d+)일 때/.exec(p))) return +m[2] + +m[3] - +m[1];
  if (/^등호\(=\)를 바르게 쓴 식은/.test(p)) { const 맞는 = [s.answer, ...s.wrongs].filter((x) => { const [l, r] = x.split('='); return 합(l) === 합(r); }); return 맞는.length === 1 ? 맞는[0] : 'X'; }
  // 똑같이 나누기
  if ((m = /한 \S+[을를] (\d+)명이 남김없이 똑같이 나누어/.exec(p))) return +m[1];
  if ((m = /똑같은 \S+ (\d+)\S+[을를] 각각 똑같이 (\d+)조각으로/.exec(p))) return +m[1] * +m[2];
  if ((m = /똑같은 길이로 (\d+)도막이 되게/.exec(p))) return +m[1] - 1;
  if ((m = /반으로 접는 일을 (한|두|세) 번/.exec(p))) return 2 ** ({ 한: 1, 두: 2, 세: 3 }[m[1]]!);
  if ((m = /똑같이 (\d+)조각으로 나누어 (\d+)조각을 먹었습니다/.exec(p))) return +m[1] - +m[2];
  // 직각
  if ((m = /^삼각자 한 개에는 직각이 1개 있습니다\. 삼각자 (\d+)개/.exec(p))) return +m[1];
  if ((m = /네 귀퉁이는 모두 직각입니다\. .+? (\d+)장/.exec(p))) return 4 * +m[1];
  if (/짧은바늘이 어느 숫자를 가리킬 때 두 바늘이 이루는 각이 직각/.test(p)) { const 맞는 = [s.answer, ...s.wrongs].filter((x) => x === '3' || x === '9'); return 맞는.length === 1 ? 맞는[0] : 'X'; }
  if ((m = /^삼각자 (\d+)개와 공책 (\d+)권이 있습니다/.exec(p))) return +m[1] + 4 * +m[2];
  // 초
  if ((m = /^(\d+)분은 몇 초/.exec(p))) return 60 * +m[1];
  if ((m = /^(\d+)초는 몇 분 몇 초/.exec(p))) return `${Math.floor(+m[1] / 60)}분 ${+m[1] % 60}초`;
  if ((m = /^(\d+)분 (\d+)초는 몇 초/.exec(p))) return 60 * +m[1] + +m[2];
  if ((m = /첫 바퀴를 (\d+)초, 둘째 바퀴를 (\d+)초/.exec(p))) { const t = +m[1] + +m[2]; return `${Math.floor(t / 60)}분${t % 60 ? ` ${t % 60}초` : ''}`; }
  if ((m = /(\S+)[은는] (\d+)분 (\d+)초, (\S+)[은는] (\d+)초가 걸렸습니다/.exec(p))) { const a = 60 * +m[2] + +m[3]; const b = +m[5]; return a < b ? m[1] : m[4]; }
  // 세 자리 × 몇십
  if ((m = /^(\d+)×(\d)0은 얼마/.exec(p))) return +m[1] * +m[2] * 10;
  if ((m = /\D(\d+)\S*씩 들어 있습니다\. (\d)0\S+에 들어 있는/.exec(p))) return +m[1] * +m[2] * 10;
  if ((m = /^(\d+)×(\d)=\d+입니다\. 이것을 이용하여/.exec(p))) return +m[1] * +m[2] * 10;
  if ((m = /^어떤 수에 (\d)0을 곱했더니 (\d+)[이가] 되었습니다/.exec(p))) return +m[2] / (+m[1] * 10);
  // 세 자리 ÷ 두 자리
  if ((m = /^(\d+)÷(\d+)=(\d+) … (\d+)[을를] 바르게 계산했는지/.exec(p))) return `${m[2]}×${m[3]}+${m[4]}=${m[1]}`;
  if ((m = /(\d+)\S+[을를] 한 \S+ (\d+)\S+씩 담으려고 합니다\. \d+\S+씩 담은/.exec(p))) return Math.floor(+m[1] / +m[2]);
  if ((m = /(\d+)\S+[을를] 한 \S+ (\d+)\S+씩 담으면 몇 \S+ 남을까요/.exec(p))) return +m[1] % +m[2];
  if ((m = /^학생 (\d+)명이 한 대에 (\d+)명씩/.exec(p))) return Math.ceil(+m[1] / +m[2]);
  if ((m = /^어떤 수를 (\d+)(?:으로|로) 나누었더니 몫이 (\d+), 나머지가 (\d+)/.exec(p))) return +m[1] * +m[2] + +m[3];
  // 수의 규칙
  if ((m = /^([\d, ]+), □에서 규칙에 따라/.exec(p))) {
    const 수 = m[1].split(', ').map(Number);
    const 차 = 수[1] - 수[0];
    if (수.every((x, j) => !j || x - 수[j - 1] === 차)) return 수[3] + 차;
    const 배 = 수[1] / 수[0];
    return 수[3] * 배;
  }
  if ((m = /^(\d+), (\d+), \d+, \d+, …와 같은 규칙으로 수를 늘어놓을 때 (\d+)째 수/.exec(p))) return +m[1] + (+m[2] - +m[1]) * (+m[3] - 1);
  // 각의 합
  if ((m = /^(삼각형|사각형)의 (?:두|세) 각의 크기가 ([\d°, ]+)입니다\. 나머지 한 각의 크기는/.exec(p))) return (m[1] === '삼각형' ? 180 : 360) - 합(m[2].replace(/°/g, ''));
  if ((m = /^(삼각형|사각형)에서 (?:두|세) 각의 크기의 합이 (\d+)°입니다/.exec(p))) return (m[1] === '삼각형' ? 180 : 360) - +m[2];
  if ((m = /^한 각이 직각인 삼각자에서 다른 한 각의 크기가 (\d+)°/.exec(p))) return 90 - +m[1];
  if ((m = /두 각이 직각이고, 다른 한 각의 크기가 (\d+)°/.exec(p))) return 180 - +m[1];
  if ((m = /^사각형의 세 각이 (\d+)°, (\d+)°, (\d+)°입니다\. 나머지 한 각의 바깥쪽/.exec(p))) return 180 - (360 - +m[1] - +m[2] - +m[3]);
  if ((m = /^삼각형의 두 각이 (\d+)°, (\d+)°입니다\. 나머지 한 각의 바깥쪽/.exec(p))) return 180 - (180 - +m[1] - +m[2]);
  // 소수 세 자리
  if ((m = /^0\.001이 (\d+)개인 수/.exec(p))) return +m[1] / 1000;
  if ((m = /^(\d)\.(\d)(\d)(\d)에서 소수 셋째 자리 숫자/.exec(p))) return +m[4];
  if ((m = /^(\d)\.(\d)(\d)(\d)에서 숫자 (\d)[이가] 나타내는 수/.exec(p))) return m[3] === m[5] ? +m[5] / 100 : NaN;
  if ((m = /^1이 (\d)개, 0\.1이 (\d)개, 0\.01이 (\d)개, 0\.001이 (\d)개인 수/.exec(p))) return +m[1] + +m[2] / 10 + +m[3] / 100 + +m[4] / 1000;
  if ((m = /^([\d.]+)[은는] 0\.001이 몇 개인 수/.exec(p))) return Math.round(+m[1] * 1000);
  // 1 cm²
  if ((m = /넓이가 1 cm²인 정사각형 (\d+)개로 빈틈없이 덮은/.exec(p))) return `${m[1]} cm²`;
  if ((m = /가로로 (\d+)개씩 (\d+)줄 빈틈없이 늘어놓았습니다\. 늘어놓은 모양의 넓이/.exec(p))) return +m[1] * +m[2];
  if ((m = /정사각형 (\d+)개를 한 줄에 (\d+)개씩 빈틈없이 늘어놓아/.exec(p))) return +m[1] / +m[2];
  if ((m = /가로로 (\d+)개씩 (\d+)줄 늘어놓은 모양에서 .*가로 (\d+)개씩 \d+줄 떼어 냈습니다/.exec(p))) return +m[1] * +m[2] - +m[3] * +m[3];
  if ((m = /(\S+)[은는] 1 cm²인 정사각형을 가로로 (\d+)개씩 (\d+)줄, (\S+)[은는] 가로로 (\d+)개씩 (\d+)줄/.exec(p))) return +m[2] * +m[3] > +m[5] * +m[6] ? m[1] : m[4];
  // 평행사변형
  if ((m = /^밑변의 길이가 (\d+) cm, 높이가 (\d+) cm인 평행사변형의 넓이/.exec(p))) return +m[1] * +m[2];
  if ((m = /^넓이가 (\d+) cm²이고 밑변의 길이가 (\d+) cm인 평행사변형/.exec(p))) return +m[1] / +m[2];
  if ((m = /^넓이가 (\d+) cm²이고 높이가 (\d+) cm인 평행사변형/.exec(p))) return +m[1] / +m[2];
  if ((m = /^밑변의 길이가 (\d+) cm, 높이가 (\d+) cm인 평행사변형과 넓이가 같은 직사각형을 .*가로를 (\d+) cm/.exec(p))) return (+m[1] * +m[2]) / +m[3];
  if ((m = /^밑변의 길이가 (\d+) cm, 높이가 (\d+) cm인 평행사변형에서 높이는 그대로 두고 밑변의 길이만 (\d)배/.exec(p))) return +m[1] * +m[2] * +m[3];
  // 몫을 분수로
  if ((m = /^(\d+)÷(\d+)의 몫을 분수로/.exec(p))) return 분수(+m[1], +m[2]);
  if ((m = /^\S+ (\d+) (L|m|kg)를 (\d+)명이 똑같이 나누어/.exec(p))) return `${분수(+m[1], +m[3])} ${m[2]}`;
  if ((m = /^□÷(\d+)=(\d+)\/\d+일 때/.exec(p))) return +m[2];
  if ((m = /^똑같은 컵 (\d+)개에 우유 (\d+) L를 똑같이 나누어 담았습니다\. 이 가운데 컵 (\d)개/.exec(p))) return `${분수(+m[2] * +m[3], +m[1])} L`;
  // 소수 ÷ 자연수
  if ((m = /^\d+÷(\d+)=\d+입니다\. 이것을 이용하여 ([\d.]+)÷\d+의 몫/.exec(p))) return 반(+m[2] / +m[1]);
  if ((m = /^길이가 ([\d.]+) m인 .+? (\d+)도막으로/.exec(p))) return 반(+m[1] / +m[2]);
  if ((m = /^어떤 수에 (\d+)[을를] 곱했더니 ([\d.]+)[이가] 되었습니다/.exec(p))) return 반(+m[2] / +m[1]);
  // 백분율
  if ((m = /^비율 ([\d.]+)[을를] 백분율로/.exec(p))) return `${반(+m[1] * 100)}%`;
  if ((m = /^비율 (\d+)\/(\d+)[을를] 백분율로/.exec(p))) return `${반((+m[1] / +m[2]) * 100)}%`;
  if ((m = /^(\d+)%를 소수로/.exec(p))) return +m[1] / 100;
  if ((m = /^조사한 학생 (\d+)명 가운데 (\d+)명이/.exec(p))) return `${반((+m[2] / +m[1]) * 100)}%`;
  if ((m = /^학생 (\d+)명 가운데 (\d+)%가/.exec(p))) return (+m[1] * +m[2]) / 100;
  // 1 m³
  if ((m = /^(\d+) m³는 몇 cm³/.exec(p))) return +m[1] * 1000000;
  if ((m = /^(\d+) cm³는 몇 m³/.exec(p))) return +m[1] / 1000000;
  if ((m = /^가로 (\d+) m, 세로 (\d+) m, 높이 (\d+) m인 직육면체의 부피/.exec(p))) return +m[1] * +m[2] * +m[3];
  if ((m = /^가로 (\d+) cm, 세로 (\d+) m, 높이 (\d+) m인 직육면체의 부피/.exec(p))) return (+m[1] / 100) * +m[2] * +m[3];
  if ((m = /^한 모서리의 길이가 (\d+) m인 정육면체의 부피/.exec(p))) return Number(m[1]) ** 3;
  if ((m = /^부피가 (\d+) m³인 직육면체의 가로가 (\d+) m, 세로가 (\d+) m/.exec(p))) return +m[1] / +m[2] / +m[3];
  // 나누어 주고 남는 양
  if ((m = /^\S+ ([\d.]+) L를 한 \S+ ([\d.]+) L씩 나누어 담으려고 합니다\. 몇 \S+ 가득/.exec(p))) return Math.floor(반(+m[1] / +m[2]));
  if ((m = /^\S+ ([\d.]+) L를 한 \S+ ([\d.]+) L씩 나누어 담으면 남는/.exec(p))) return 반(+m[1] - Math.floor(반(+m[1] / +m[2])) * +m[2]);
  if ((m = /^\S+ ([\d.]+) L를 한 \S+ ([\d.]+) L씩 나누어 담았습니다\. 남은/.exec(p))) return 반(+m[2] - (+m[1] - Math.floor(반(+m[1] / +m[2])) * +m[2]));
  if ((m = /^([\d.]+)÷([\d.]+)의 몫을 자연수까지 구하고/.exec(p))) { const q = Math.floor(반(+m[1] / +m[2])); return `${q} … ${반(+m[1] - q * +m[2])}`; }
  // 쌓기나무
  if ((m = /^위에서 본 모양의 각 칸에 쌓인 쌓기나무의 수가 ([\d, ]+)입니다\. 쌓기나무는 모두/.exec(p))) return 합(m[1]);
  if ((m = /^쌓기나무를 (1층에 .*) 쌓았습니다\. 쌓기나무는 모두/.exec(p))) return [...m[1].matchAll(/층에 (\d+)개/g)].reduce((x, k) => x + +k[1], 0);
  if ((m = /^쌓기나무 (\d+)개로 모양을 쌓았습니다\. 1층에 (\d+)개, 2층에 (\d+)개/.exec(p))) return +m[1] - +m[2] - +m[3];
  if ((m = /가는 ([\d, ]+)이고, 나는 ([\d, ]+)입니다\. 어느 모양에/.exec(p))) { const a = 합(m[1]); const b = 합(m[2]); return `${a > b ? '가' : '나'}, ${Math.abs(a - b)}개`; }
  if ((m = /수가 ([\d, ]+)입니다\. 모든 칸을 (\d)층으로 똑같이/.exec(p))) { const 칸 = m[1].split(', ').map(Number); return 칸.reduce((x, y) => x + (+m![2] - y), 0); }
  return undefined;
};

const 값 = (t: string) => Number(t.replace(/[^\d.]/g, ''));

describe('넷째 묶음 문항', () => {
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
        expect(/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로|undefined|NaN|(?:^|[\s,(])-\d/.test([s.prompt, s.answer, ...s.wrongs].join(' ')), `${s.prompt} [${s.answer}, ${s.wrongs.join(', ')}]`).toBe(false);
        expect(/을\(를\)|이\(가\)|은\(는\)|과\(와\)|\(으\)로|undefined|NaN/.test(s.steps.join(' ') + s.hint), s.steps.join(' / ')).toBe(false);
        const 답 = 풀기(s);
        expect(답, `풀 수 없는 글: ${s.prompt}`).not.toBeUndefined();
        if (typeof 답 === 'number') expect(값(s.answer), s.prompt).toBeCloseTo(답, 6);
        else expect(s.answer, s.prompt).toBe(답);
        // 오답 가운데 정답과 같은 값이 없어야 합니다.
        if (typeof 답 === 'number') for (const w of s.wrongs) if (/^[\d.]+\s?\D*$/.test(w)) expect(Math.abs(값(w) - 답) > 1e-9, `${s.prompt} 오답 ${w}`).toBe(true);
      }
      expect(다른글.size, f.id).toBeGreaterThan(60);
      expect(결들.has(-1)).toBe(false);
      expect(결들.size, `${f.id} 결`).toBeGreaterThanOrEqual(2);
    });
  }
});
