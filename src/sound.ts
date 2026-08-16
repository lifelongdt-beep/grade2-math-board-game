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
  // 여러 점을 지나며 음이 오르내립니다. 울음소리는 한 방향으로만
  // 미끄러지지 않습니다 — '야옹'은 올라갔다가 내려옵니다.
  glide?: number[];
  // 떨림입니다. 사자의 으르렁, 판다의 웅얼거림처럼 살아 있는 소리에는
  // 늘 떨림이 있습니다. 없으면 기계에서 나는 삑 소리가 됩니다.
  vibrato?: { rate: number; depth: number };
  // 소리가 붙는 속도입니다. 짐승 소리는 목에서 열리듯 천천히 붙습니다.
  attack?: number;
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
      if (blip.glide?.length) {
        // 점과 점 사이를 고르게 나누어 지나갑니다.
        const step = blip.length / blip.glide.length;
        blip.glide.forEach((point, at) => {
          oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(30, point),
            startAt + step * (at + 1),
          );
        });
      } else if (blip.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(blip.slideTo, stopAt);
      }

      let wobble: OscillatorNode | null = null;
      let wobbleDepth: GainNode | null = null;
      if (blip.vibrato) {
        wobble = ready.createOscillator();
        wobbleDepth = ready.createGain();
        wobble.frequency.setValueAtTime(blip.vibrato.rate, startAt);
        wobbleDepth.gain.setValueAtTime(blip.vibrato.depth, startAt);
        wobble.connect(wobbleDepth);
        wobbleDepth.connect(oscillator.frequency);
        wobble.start(startAt);
        wobble.stop(stopAt);
      }

      // 붙을 때도 잦아들 때도 모서리가 없어야 합니다. 딱 끊기면 '삑'이
      // 되고, 그 소리는 짐승이 아니라 기계 소리로 들립니다.
      const attack = blip.attack ?? 0.015;
      const release = Math.min(0.12, blip.length * 0.45);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + attack);
      gain.gain.setValueAtTime(peak, Math.max(startAt + attack, stopAt - release));
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.connect(gain);
      gain.connect(ready.destination);
      oscillator.start(startAt);
      oscillator.stop(stopAt);

      // 다 울린 소리는 스스로 끊어 둡니다. 놔두면 수업 내내 쌓입니다.
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        wobble?.disconnect();
        wobbleDepth?.disconnect();
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
  // 멍! 멍! — 목이 열리며 '머'가 붙고 '엉'으로 닫힙니다. 두 번 짖고
  // 두 번째는 조금 낮게, 끝에 꼬리를 답니다.
  '🐶': [
    { frequency: 300, at: 0, length: 0.2, volume: 0.12, type: 'square', attack: 0.03, glide: [560, 420, 300] },
    { frequency: 200, at: 0.02, length: 0.16, volume: 0.05, type: 'triangle', glide: [340, 240] },
    { frequency: 280, at: 0.3, length: 0.22, volume: 0.11, type: 'square', attack: 0.03, glide: [500, 380, 270] },
    { frequency: 190, at: 0.32, length: 0.18, volume: 0.045, type: 'triangle', glide: [320, 220] },
    { frequency: 260, at: 0.56, length: 0.24, volume: 0.06, type: 'triangle', glide: [300, 230, 200], vibrato: { rate: 12, depth: 14 } },
  ],
  // 야~옹 — 올라갔다가 길게 내려옵니다. 고양이 소리의 표는 이 오르내림입니다.
  // 430에서 시작했더니 목이 굵은 고양이가 되었습니다. 한 옥타브 가까이
  // 올려 새끼 고양이가 우는 자리에 둡니다.
  '🐱': [
    {
      frequency: 720, at: 0, length: 0.6, volume: 0.085, type: 'sine', attack: 0.04,
      glide: [1000, 1240, 1300, 1120, 860, 700], vibrato: { rate: 7, depth: 18 },
    },
    { frequency: 1440, at: 0.03, length: 0.48, volume: 0.022, type: 'triangle', glide: [2000, 2480, 1720, 1400] },
  ],
  // 여우 — 높고 가는 소리로 깽, 깽, 깨앵.
  '🦊': [
    { frequency: 780, at: 0, length: 0.14, volume: 0.075, type: 'triangle', attack: 0.02, glide: [1180, 900] },
    { frequency: 800, at: 0.2, length: 0.14, volume: 0.075, type: 'triangle', attack: 0.02, glide: [1250, 940] },
    {
      frequency: 820, at: 0.4, length: 0.34, volume: 0.08, type: 'triangle', attack: 0.03,
      glide: [1320, 1150, 880, 700], vibrato: { rate: 9, depth: 22 },
    },
  ],
  // 토끼 — 우는 대신 코를 찡긋거리며 킁킁, 끝에 짧게 뽀.
  '🐰': [
    { frequency: 900, at: 0, length: 0.09, volume: 0.055, type: 'sine', glide: [1150, 950] },
    { frequency: 950, at: 0.13, length: 0.09, volume: 0.055, type: 'sine', glide: [1220, 1000] },
    { frequency: 980, at: 0.26, length: 0.1, volume: 0.05, type: 'sine', glide: [1280, 1040] },
    {
      frequency: 1100, at: 0.42, length: 0.26, volume: 0.06, type: 'sine', attack: 0.04,
      glide: [1500, 1320, 1100], vibrato: { rate: 11, depth: 18 },
    },
  ],
  // 판다 — 새끼 판다는 양처럼 웁니다. 낮고 둥글게 떨리는 소리입니다.
  '🐼': [
    {
      frequency: 300, at: 0, length: 0.5, volume: 0.1, type: 'triangle', attack: 0.06,
      glide: [380, 350, 320, 280], vibrato: { rate: 13, depth: 26 },
    },
    { frequency: 600, at: 0.04, length: 0.4, volume: 0.03, type: 'sine', glide: [740, 640, 560] },
    { frequency: 280, at: 0.56, length: 0.3, volume: 0.07, type: 'triangle', attack: 0.05, glide: [340, 290, 250], vibrato: { rate: 12, depth: 20 } },
  ],
  // 호랑이 — 목 안에서 구르는 으르렁 뒤에 짧게 어흥.
  '🐯': [
    {
      frequency: 130, at: 0, length: 0.46, volume: 0.12, type: 'sawtooth', attack: 0.08,
      glide: [150, 135, 120, 105], vibrato: { rate: 22, depth: 14 },
    },
    { frequency: 260, at: 0.02, length: 0.42, volume: 0.045, type: 'triangle', glide: [300, 250, 210] },
    {
      frequency: 110, at: 0.5, length: 0.42, volume: 0.13, type: 'sawtooth', attack: 0.05,
      glide: [170, 130, 95, 80], vibrato: { rate: 17, depth: 10 },
    },
  ],
  // 개구리 — '개굴'은 두 음절입니다. '개'가 높고 짧게, '굴'이 조금
  // 낮게 이어집니다. 170Hz로 잡았더니 소 우는 자리라 으르렁거렸습니다.
  // 개구리는 그보다 두 옥타브 가까이 위에서 웁니다.
  '🐸': [
    // 개굴 ①
    { frequency: 470, at: 0, length: 0.07, volume: 0.085, type: 'square', attack: 0.012, glide: [560, 500], vibrato: { rate: 34, depth: 26 } },
    { frequency: 380, at: 0.07, length: 0.13, volume: 0.09, type: 'square', attack: 0.012, glide: [340, 300], vibrato: { rate: 30, depth: 22 } },
    // 개굴 ②
    { frequency: 480, at: 0.28, length: 0.07, volume: 0.085, type: 'square', attack: 0.012, glide: [570, 505], vibrato: { rate: 34, depth: 26 } },
    { frequency: 385, at: 0.35, length: 0.13, volume: 0.09, type: 'square', attack: 0.012, glide: [345, 300], vibrato: { rate: 30, depth: 22 } },
    // 개굴 ③ — 끝은 조금 길게 끕니다.
    { frequency: 465, at: 0.56, length: 0.07, volume: 0.08, type: 'square', attack: 0.012, glide: [550, 495], vibrato: { rate: 34, depth: 26 } },
    { frequency: 375, at: 0.63, length: 0.17, volume: 0.085, type: 'square', attack: 0.012, glide: [335, 290, 275], vibrato: { rate: 28, depth: 20 } },
    // 목이 부푸는 낮은 울림은 받쳐 주는 정도로만 깔아 둡니다.
    { frequency: 190, at: 0.02, length: 0.16, volume: 0.028, type: 'triangle', glide: [175, 160] },
    { frequency: 192, at: 0.3, length: 0.16, volume: 0.028, type: 'triangle', glide: [176, 160] },
    { frequency: 188, at: 0.58, length: 0.2, volume: 0.026, type: 'triangle', glide: [172, 155] },
  ],
  // 펭귄 — 나팔처럼 빼액, 두 번째는 길게 끕니다.
  '🐧': [
    { frequency: 620, at: 0, length: 0.16, volume: 0.085, type: 'square', attack: 0.03, glide: [880, 700, 620], vibrato: { rate: 15, depth: 20 } },
    {
      frequency: 640, at: 0.24, length: 0.4, volume: 0.09, type: 'square', attack: 0.04,
      glide: [900, 980, 820, 660], vibrato: { rate: 13, depth: 24 },
    },
  ],
  // 사자 — 배에서 올라오는 긴 울음입니다. 호랑이보다 낮고 오래 갑니다.
  '🦁': [
    {
      frequency: 95, at: 0, length: 0.86, volume: 0.13, type: 'sawtooth', attack: 0.12,
      glide: [120, 105, 90, 78, 68], vibrato: { rate: 16, depth: 9 },
    },
    { frequency: 190, at: 0.05, length: 0.72, volume: 0.05, type: 'triangle', glide: [240, 200, 165, 140] },
    { frequency: 380, at: 0.08, length: 0.5, volume: 0.02, type: 'sine', glide: [430, 360, 300] },
  ],
  // 거북 — 낮게 깔면 교실에서는 들리지 않습니다. 사람이 듣기 좋은 자리로
  // 올리되, 느릿느릿한 걸음이 소리에 남아 있어야 합니다. 길게 두 번,
  // 두 번째가 더 높고 오래갑니다 — 느리게 기지개를 켜는 소리입니다.
  '🐢': [
    {
      frequency: 420, at: 0, length: 0.66, volume: 0.1, type: 'triangle', attack: 0.16,
      glide: [500, 560, 520, 460], vibrato: { rate: 5, depth: 14 },
    },
    { frequency: 840, at: 0.05, length: 0.5, volume: 0.026, type: 'sine', glide: [1000, 1080, 940] },
    {
      frequency: 470, at: 0.72, length: 0.8, volume: 0.095, type: 'triangle', attack: 0.2,
      glide: [560, 640, 600, 520, 470], vibrato: { rate: 4.5, depth: 16 },
    },
    { frequency: 940, at: 0.78, length: 0.62, volume: 0.024, type: 'sine', glide: [1120, 1240, 1080, 960] },
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

// 번호를 누르고 준비가 끝났을 때 나는 소리입니다. 난이도 소리를 빌려
// 쓰고 있었는데, 그 소리는 낮은 데서 시작해 무겁습니다. 자기 번호를
// 누르는 것은 수업에 들어서는 첫걸음이니 맑게 올라가야 합니다.
// 도–미–솔–도로 올라가 종소리 하나로 마칩니다.
export const playReadySound = () => {
  playBlips([
    { frequency: 523.25, at: 0, length: 0.11, volume: 0.09, type: 'triangle' },
    { frequency: 659.25, at: 0.07, length: 0.11, volume: 0.095, type: 'triangle' },
    { frequency: 783.99, at: 0.14, length: 0.12, volume: 0.1, type: 'triangle' },
    { frequency: 1046.5, at: 0.21, length: 0.26, volume: 0.105, type: 'triangle' },
    // 위에서 반짝 하고 얹히는 종소리입니다.
    { frequency: 2093, at: 0.24, length: 0.34, volume: 0.035, type: 'sine' },
    { frequency: 3135.96, at: 0.3, length: 0.26, volume: 0.02, type: 'sine' },
  ]);
};

export const playDifficultySound = (difficulty: Difficulty) => {
  playBlips(difficultyBlips[difficulty]);
};
