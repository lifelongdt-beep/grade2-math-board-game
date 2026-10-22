import type { ConceptTag } from '../types';

// ════════════════════════════════════════════════════════════════════
// 단원 몬스터 — 성 지키기 말고 다른 단원에도 몬스터가 나옵니다
// ────────────────────────────────────────────────────────────────────
// 구구단·나눗셈 차시의 성 지키기(CastleDefenseScene)는 몬스터가 내려와 시간을
// 재지만, 다른 단원은 생각할 시간이 필요한 문제가 많아 내려오는 시계를 달지
// 않습니다. 대신 그 단원의 몬스터가 문제 위에 서 있다가, 맞힐 때마다 한 대씩
// 맞고 세 대를 맞으면 쓰러집니다. 시계 단원은 시계 몬스터(시각을 맞혀야 멈춥니다),
// 길이 단원은 자 몬스터(자로 재야 쓰러집니다)처럼 단원마다 몬스터가 다릅니다.
// ════════════════════════════════════════════════════════════════════

export const MONSTER_HP = 3;

interface 단원몬스터 {
  look: string;
  name: string;
  /** 무엇을 해야 쓰러지는지 아이에게 짧게 알려 줍니다. */
  how: string;
}

const 몬스터표: Record<ConceptTag, 단원몬스터> = {
  time: { look: '⏰', name: '시계 몬스터', how: '시각을 맞히면 멈춰요' },
  measurement: { look: '📏', name: '자 몬스터', how: '길이를 재면 쓰러져요' },
  number: { look: '🔢', name: '숫자 몬스터', how: '수를 읽으면 쓰러져요' },
  placeValue: { look: '🔢', name: '자릿값 몬스터', how: '자리를 알면 쓰러져요' },
  addition: { look: '➕', name: '덧셈 몬스터', how: '더하면 쓰러져요' },
  subtraction: { look: '➖', name: '뺄셈 몬스터', how: '빼면 쓰러져요' },
  mixedCalc: { look: '🧮', name: '셈 몬스터', how: '차례대로 셈하면 쓰러져요' },
  estimate: { look: '🎯', name: '어림 몬스터', how: '어림하면 쓰러져요' },
  rounding: { look: '🎯', name: '어림 몬스터', how: '어림하면 쓰러져요' },
  range: { look: '🎯', name: '범위 몬스터', how: '범위를 알면 쓰러져요' },
  multiplication: { look: '✖️', name: '곱셈 몬스터', how: '곱하면 쓰러져요' },
  division: { look: '➗', name: '나눗셈 몬스터', how: '나누면 쓰러져요' },
  divisor: { look: '➗', name: '약수 몬스터', how: '약수와 배수를 찾으면 쓰러져요' },
  shape: { look: '🔺', name: '도형 몬스터', how: '도형을 알아보면 쓰러져요' },
  solid: { look: '🧊', name: '입체 몬스터', how: '모양을 알아보면 쓰러져요' },
  congruence: { look: '🪞', name: '거울 몬스터', how: '합동과 대칭을 찾으면 쓰러져요' },
  transform: { look: '🔄', name: '빙글 몬스터', how: '움직임을 알면 쓰러져요' },
  angle: { look: '📐', name: '각도 몬스터', how: '각도를 재면 쓰러져요' },
  fraction: { look: '🍕', name: '분수 몬스터', how: '분수를 알면 쓰러져요' },
  fractionCompare: { look: '🍕', name: '분수 몬스터', how: '분수를 견주면 쓰러져요' },
  fractionAdd: { look: '🍕', name: '분수 몬스터', how: '분수를 셈하면 쓰러져요' },
  fractionDiv: { look: '🍕', name: '분수 몬스터', how: '분수를 나누면 쓰러져요' },
  decimal: { look: '🔘', name: '소수 몬스터', how: '소수를 알면 쓰러져요' },
  decimalDiv: { look: '🔘', name: '소수 몬스터', how: '소수를 나누면 쓰러져요' },
  data: { look: '📊', name: '그래프 몬스터', how: '자료를 읽으면 쓰러져요' },
  classification: { look: '🗂️', name: '분류 몬스터', how: '나누어 세면 쓰러져요' },
  average: { look: '📊', name: '평균 몬스터', how: '평균을 구하면 쓰러져요' },
  possibility: { look: '🎲', name: '주사위 몬스터', how: '가능성을 알면 쓰러져요' },
  pattern: { look: '🌀', name: '규칙 몬스터', how: '규칙을 찾으면 쓰러져요' },
  correspondence: { look: '🔗', name: '짝꿍 몬스터', how: '대응 규칙을 찾으면 쓰러져요' },
  area: { look: '🟩', name: '넓이 몬스터', how: '넓이를 구하면 쓰러져요' },
  volume: { look: '📦', name: '상자 몬스터', how: '부피를 구하면 쓰러져요' },
  ratio: { look: '⚖️', name: '비율 몬스터', how: '비를 알면 쓰러져요' },
};

const 기본몬스터: 단원몬스터 = { look: '❓', name: '수학 몬스터', how: '맞히면 쓰러져요' };

/** 몬스터 얼굴은 쓰러뜨릴 때마다 바뀝니다. */
const 얼굴들 = ['👾', '👹', '👻', '🦖', '🐙', '🧌'];

export const 단원몬스터찾기 = (tag: ConceptTag | undefined): 단원몬스터 => (tag && 몬스터표[tag]) ?? 기본몬스터;

interface UnitMonsterProps {
  tag: ConceptTag | undefined;
  /** 지금 몬스터가 맞은 수입니다(0~MONSTER_HP-1). */
  hits: number;
  /** 지금까지 쓰러뜨린 몬스터 수입니다. */
  defeated: number;
  /** 방금 틀렸으면 몬스터가 놀립니다. */
  taunting: boolean;
}

export function UnitMonster({ tag, hits, defeated, taunting }: UnitMonsterProps) {
  const 몬스터 = 단원몬스터찾기(tag);
  const 얼굴 = 얼굴들[defeated % 얼굴들.length];
  const 남은 = MONSTER_HP - hits;
  return (
    <div className={`unit-monster ${taunting ? 'taunt' : ''}`.trim()} aria-label={`${몬스터.name}, 남은 힘 ${남은}, 쓰러뜨린 몬스터 ${defeated}마리`}>
      {/* 맞을 때마다 key가 바뀌어 맞는 움직임이 다시 납니다. */}
      <span className="unit-monster-face" key={`${defeated}-${hits}`} aria-hidden="true">
        {얼굴}
        <i>{몬스터.look}</i>
      </span>
      <span className="unit-monster-name">{몬스터.name}</span>
      <span className="unit-monster-hp" aria-hidden="true">
        {Array.from({ length: MONSTER_HP }, (_, at) => (
          <b key={at} className={at < 남은 ? 'full' : 'lost'}>♥</b>
        ))}
      </span>
      <small>{taunting ? '히히, 다시 해 봐!' : 몬스터.how}</small>
      {defeated > 0 && <span className="unit-monster-count">쓰러뜨림 {defeated}</span>}
    </div>
  );
}
