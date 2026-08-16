import type { Difficulty } from './types';

// ════════════════════════════════════════════════════════════════════
// 소리
// ────────────────────────────────────────────────────────────────────
// 소리는 App.tsx 안에 흩어져 있었습니다. 소리를 낼 때마다 AudioContext를
// 새로 만들었는데, 브라우저는 한 페이지가 열 수 있는 AudioContext 수를
// 제한합니다. 한 시간짜리 수업에서 아이 다섯이 서른 문항씩 풀면 수백 번
// 만들게 되고, 어느 시점부터는 소리가 조용히 나지 않습니다.
//
// 여기서는 하나를 만들어 계속 씁니다. 그리고 교실에서 꼭 필요한 것 —
// 소리 끄기 — 를 한 곳에서 다룹니다.
// ════════════════════════════════════════════════════════════════════

export type Blip = {
  frequency: number;
  at: number;
  length: number;
  volume?: number;
  type?: OscillatorType;
  slideTo?: number;
};

// ── 음소거 ──────────────────────────────────────────────────────────
// 교실에서 소리를 꺼야 할 때가 있습니다. 옆 반이 시험을 보거나, 아이가
// 소리에 예민하거나, 선생님이 설명하는 동안입니다. 껐다는 것은 다음
// 수업에도 남아 있어야 하므로 저장해 둡니다.
const muteKey = 'grade2-math-muted';

let muted = (() => {
  try {
    return window.localStorage.getItem(muteKey) === 'on';
  } catch {
    return false;
  }
})();

const listeners = new Set<(value: boolean) => void>();

export const isMuted = () => muted;

export const setMuted = (value: boolean) => {
  muted = value;
  try {
    window.localStorage.setItem(muteKey, value ? 'on' : 'off');
  } catch {
    // 저장하지 못해도 이번 수업 동안은 그대로 지켜집니다.
  }
  listeners.forEach((listen) => listen(value));
};

export const watchMuted = (listen: (value: boolean) => void) => {
  listeners.add(listen);
  return () => void listeners.delete(listen);
};

// ── 소리 내는 곳 ────────────────────────────────────────────────────
let context: AudioContext | null = null;

const audioContext = () => {
  if (context) return context;

  const AudioContextConstructor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  try {
    context = new AudioContextConstructor();
    return context;
  } catch {
    return null;
  }
};

// 브라우저는 사용자가 화면을 한 번 건드리기 전에는 소리를 내지 못하게
// 막습니다. 처음 누르는 곳이 어디든 그때 깨워 두면, 그 뒤로는 정답 소리가
// 제때 납니다. 깨우지 않으면 첫 정답의 소리가 통째로 사라집니다.
export const wakeAudio = () => {
  const ready = audioContext();
  if (ready && ready.state === 'suspended') void ready.resume();
};

export const playBlips = (blips: Blip[], fallback?: () => void) => {
  if (muted) return;

  try {
    const ready = audioContext();
    if (!ready) {
      fallback?.();
      return;
    }

    // 화면을 건드려 소리를 낸 것이므로, 잠겨 있었다면 여기서 풀립니다.
    if (ready.state === 'suspended') void ready.resume();

    const now = ready.currentTime;

    blips.forEach((blip) => {
      const oscillator = ready.createOscillator();
      const gain = ready.createGain();
      const startAt = now + blip.at;
      const stopAt = startAt + blip.length;
      const peak = blip.volume ?? 0.16;

      oscillator.type = blip.type ?? 'sine';
      oscillator.frequency.setValueAtTime(blip.frequency, startAt);
      if (blip.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(blip.slideTo, stopAt);
      }

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.connect(gain);
      gain.connect(ready.destination);
      oscillator.start(startAt);
      oscillator.stop(stopAt);

      // 다 울린 소리는 스스로 끊어 둡니다. 놔두면 수업 내내 쌓입니다.
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  } catch {
    fallback?.();
  }
};

// ── 소리 ────────────────────────────────────────────────────────────
// 정답 소리는 셋이 똑같은 가락입니다. 길이도 세기도 리듬도 같고 음높이만
// 다릅니다. 달라진 것이 음높이 하나뿐이라, 소리를 견주어 듣지 않아도
// 어느 수준을 맞혔는지 바로 알 수 있습니다.
const successTune: Blip[] = [
  { frequency: 523.25, at: 0, length: 0.1, type: 'triangle' },
  { frequency: 659.25, at: 0.075, length: 0.1, type: 'triangle' },
  { frequency: 783.99, at: 0.15, length: 0.11, type: 'triangle' },
  { frequency: 1046.5, at: 0.23, length: 0.2, volume: 0.19, type: 'triangle' },
  { frequency: 1568, at: 0.3, length: 0.16, volume: 0.08 },
];

// 같은 가락을 통째로 올립니다. 1.5배는 5도 위, 2배는 한 옥타브 위입니다.
const transpose = (blips: Blip[], ratio: number): Blip[] =>
  blips.map((blip) => ({
    ...blip,
    frequency: blip.frequency * ratio,
    ...(blip.slideTo ? { slideTo: blip.slideTo * ratio } : {}),
  }));

const successBlips: Record<Difficulty, Blip[]> = {
  하: successTune,
  중: transpose(successTune, 1.5),
  상: transpose(successTune, 2),
};

// 세 소리의 길이가 같으므로 화면의 축하도 같은 시간만큼 머뭅니다.
export const successHoldMs = 720;

export const playSuccessSound = (difficulty: Difficulty, fallback?: () => void) => {
  playBlips(successBlips[difficulty], fallback);
};

// 오답: 낮고 짧게 두 번 '뽀용' 하고 부드럽게 내려옵니다. 혼내는 소리가
// 아니라 '다시 해 보자' 소리여야 합니다.
export const playWrongSound = () => {
  playBlips([
    { frequency: 392, at: 0, length: 0.13, volume: 0.13, type: 'triangle' },
    { frequency: 311.13, at: 0.11, length: 0.24, volume: 0.13, type: 'triangle', slideTo: 261.63 },
  ]);
};

// 보기나 번호를 누를 때 나는 아주 짧은 '톡' 소리입니다.
export const playTapSound = () => {
  playBlips([{ frequency: 880, at: 0, length: 0.05, volume: 0.07, type: 'triangle' }]);
};

// ── 동물 소리 ───────────────────────────────────────────────────────
// 자기 캐릭터를 누르면 그 동물이 웁니다. 고르는 일이 즐거워야 자리에
// 앉는 일도 즐겁습니다. 다만 스무 명이 한꺼번에 누를 수 있으므로 모두
// 짧고(0.5초 안쪽) 작게 울립니다.
const animalCalls: Record<string, Blip[]> = {
  // 멍멍 — 짧게 두 번, 끝을 살짝 내립니다.
  '🐶': [
    { frequency: 420, at: 0, length: 0.11, volume: 0.12, type: 'square', slideTo: 300 },
    { frequency: 400, at: 0.16, length: 0.12, volume: 0.11, type: 'square', slideTo: 280 },
  ],
  // 야옹 — 올라갔다 내려옵니다.
  '🐱': [
    { frequency: 520, at: 0, length: 0.16, volume: 0.1, type: 'sine', slideTo: 760 },
    { frequency: 760, at: 0.15, length: 0.22, volume: 0.1, type: 'sine', slideTo: 430 },
  ],
  // 여우는 높고 짧게 깽깽.
  '🦊': [
    { frequency: 900, at: 0, length: 0.09, volume: 0.09, type: 'triangle', slideTo: 1250 },
    { frequency: 950, at: 0.13, length: 0.09, volume: 0.09, type: 'triangle', slideTo: 1350 },
  ],
  // 토끼는 소리가 거의 없는 동물이라 코 찡긋하는 느낌으로 아주 짧게.
  '🐰': [
    { frequency: 1200, at: 0, length: 0.05, volume: 0.07, type: 'sine' },
    { frequency: 1500, at: 0.07, length: 0.05, volume: 0.07, type: 'sine' },
    { frequency: 1800, at: 0.14, length: 0.06, volume: 0.06, type: 'sine' },
  ],
  // 판다는 낮고 둥글게 웅.
  '🐼': [
    { frequency: 220, at: 0, length: 0.3, volume: 0.11, type: 'sine', slideTo: 180 },
    { frequency: 330, at: 0.05, length: 0.2, volume: 0.05, type: 'sine' },
  ],
  // 호랑이 — 낮게 으르렁.
  '🐯': [
    { frequency: 150, at: 0, length: 0.42, volume: 0.13, type: 'sawtooth', slideTo: 95 },
    { frequency: 90, at: 0.02, length: 0.4, volume: 0.07, type: 'square' },
  ],
  // 개구리 — 개굴개굴, 두 번 낮게.
  '🐸': [
    { frequency: 190, at: 0, length: 0.1, volume: 0.11, type: 'square', slideTo: 150 },
    { frequency: 200, at: 0.15, length: 0.11, volume: 0.11, type: 'square', slideTo: 155 },
  ],
  // 펭귄 — 짧게 빽빽.
  '🐧': [
    { frequency: 700, at: 0, length: 0.08, volume: 0.1, type: 'square', slideTo: 900 },
    { frequency: 720, at: 0.12, length: 0.1, volume: 0.1, type: 'square', slideTo: 950 },
  ],
  // 사자 — 호랑이보다 더 낮고 길게.
  '🦁': [
    { frequency: 120, at: 0, length: 0.5, volume: 0.14, type: 'sawtooth', slideTo: 70 },
    { frequency: 240, at: 0.03, length: 0.42, volume: 0.06, type: 'sawtooth', slideTo: 140 },
  ],
  // 거북 — 느리게 한 번.
  '🐢': [
    { frequency: 260, at: 0, length: 0.36, volume: 0.09, type: 'triangle', slideTo: 210 },
  ],
};

export const playAnimalSound = (avatar: string) => {
  const call = animalCalls[avatar];
  if (call) {
    playBlips(call);
    return;
  }
  playTapSound();
};

// 수업이 끝났을 때 울리는 팡파레입니다. 한 번만 울리므로 길어도 됩니다.
export const playFinishSound = () => {
  playBlips([
    { frequency: 783.99, at: 0, length: 0.09, volume: 0.11, type: 'square' },
    { frequency: 783.99, at: 0.11, length: 0.09, volume: 0.11, type: 'square' },
    { frequency: 783.99, at: 0.22, length: 0.13, volume: 0.12, type: 'square' },

    { frequency: 523.25, at: 0.4, length: 0.1, volume: 0.11, type: 'triangle' },
    { frequency: 659.25, at: 0.48, length: 0.1, volume: 0.11, type: 'triangle' },
    { frequency: 783.99, at: 0.56, length: 0.1, volume: 0.115, type: 'triangle' },
    { frequency: 1046.5, at: 0.64, length: 0.1, volume: 0.12, type: 'triangle' },
    { frequency: 1318.51, at: 0.72, length: 0.1, volume: 0.125, type: 'triangle' },

    { frequency: 1567.98, at: 0.8, length: 0.6, volume: 0.14, type: 'triangle' },
    { frequency: 1046.5, at: 0.8, length: 0.64, volume: 0.09, type: 'triangle' },
    { frequency: 1318.51, at: 0.82, length: 0.6, volume: 0.07, type: 'triangle' },

    { frequency: 2093, at: 0.95, length: 0.5, volume: 0.05, slideTo: 3135.96 },
    { frequency: 2637.02, at: 1.1, length: 0.4, volume: 0.032, slideTo: 4186 },
  ]);
};

// 난이도마다 다른 소리가 납니다. 하는 낮고 포근하게, 중은 그보다 한 단계
// 위로, 상은 높고 씩씩하게 올라갑니다.
export const difficultyBlips: Record<Difficulty, Blip[]> = {
  하: [
    { frequency: 261.63, at: 0, length: 0.62, volume: 0.05, type: 'sine' },
    { frequency: 392, at: 0, length: 0.15, volume: 0.11, type: 'sine' },
    { frequency: 523.25, at: 0.13, length: 0.15, volume: 0.11, type: 'sine' },
    { frequency: 659.25, at: 0.26, length: 0.15, volume: 0.11, type: 'sine' },
    { frequency: 523.25, at: 0.39, length: 0.3, volume: 0.12, type: 'sine' },
  ],
  중: [
    { frequency: 523.25, at: 0, length: 0.12, volume: 0.1, type: 'triangle' },
    { frequency: 659.25, at: 0.1, length: 0.12, volume: 0.1, type: 'triangle' },
    { frequency: 783.99, at: 0.2, length: 0.12, volume: 0.105, type: 'triangle' },
    { frequency: 1046.5, at: 0.3, length: 0.17, volume: 0.12, type: 'triangle' },
    { frequency: 783.99, at: 0.45, length: 0.3, volume: 0.11, type: 'triangle' },
    { frequency: 1567.98, at: 0.47, length: 0.22, volume: 0.05 },
  ],
  상: [
    { frequency: 523.25, at: 0, length: 0.1, volume: 0.1, type: 'triangle' },
    { frequency: 659.25, at: 0.075, length: 0.1, volume: 0.1, type: 'triangle' },
    { frequency: 783.99, at: 0.15, length: 0.1, volume: 0.105, type: 'triangle' },
    { frequency: 1046.5, at: 0.225, length: 0.1, volume: 0.11, type: 'triangle' },
    { frequency: 1318.51, at: 0.3, length: 0.1, volume: 0.115, type: 'triangle' },
    { frequency: 1567.98, at: 0.375, length: 0.34, volume: 0.13, type: 'triangle' },
    { frequency: 2093, at: 0.45, length: 0.34, volume: 0.06 },
    { frequency: 2637.02, at: 0.56, length: 0.3, volume: 0.045, slideTo: 3135.96 },
  ],
};

// 번호를 누르고 준비가 끝났을 때 나는 소리입니다.
export const playReadySound = () => {
  playBlips(difficultyBlips.중);
};

export const playDifficultySound = (difficulty: Difficulty) => {
  playBlips(difficultyBlips[difficulty]);
};
