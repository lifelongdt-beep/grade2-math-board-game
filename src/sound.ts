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
  // ① 나무 실로폰처럼 통통 튀어 오르는 가락 — 도 미 솔 도
  { frequency: 523.25, at: 0, length: 0.11, volume: 0.14, type: 'triangle' },
  { frequency: 659.25, at: 0.08, length: 0.11, volume: 0.145, type: 'triangle' },
  { frequency: 783.99, at: 0.16, length: 0.12, volume: 0.15, type: 'triangle' },
  { frequency: 1046.5, at: 0.25, length: 0.3, volume: 0.16, type: 'triangle' },

  // ② 그 위에 얹히는 종소리. 한 박 늦게 들어와 여운을 만듭니다.
  { frequency: 1568, at: 0.27, length: 0.42, volume: 0.055, type: 'sine' },
  { frequency: 2093, at: 0.32, length: 0.4, volume: 0.032, type: 'sine' },

  // ③ 아래에서 받쳐 주는 화음 — 도와 솔이 함께 울립니다.
  { frequency: 261.63, at: 0.25, length: 0.44, volume: 0.05, type: 'sine' },
  { frequency: 392, at: 0.27, length: 0.42, volume: 0.04, type: 'sine' },

  // ④ 마지막에 한 번 더 올라가 반짝하고 끝납니다.
  { frequency: 1318.51, at: 0.6, length: 0.12, volume: 0.09, type: 'triangle' },
  { frequency: 1568, at: 0.7, length: 0.34, volume: 0.1, type: 'triangle' },
  { frequency: 2637.02, at: 0.72, length: 0.34, volume: 0.026, type: 'sine', glide: [3135.96, 2637.02] },
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
    // 멍! — 목이 열리는 소리(square) 위에 둥근 몸통(triangle)을 얹고,
    // 아래에서 가슴 울림(sine)이 받칩니다.
    { frequency: 300, at: 0, length: 0.2, volume: 0.11, type: 'square', attack: 0.025, glide: [620, 440, 310] },
    { frequency: 200, at: 0.01, length: 0.19, volume: 0.06, type: 'triangle', glide: [400, 280, 210] },
    { frequency: 150, at: 0, length: 0.2, volume: 0.04, type: 'sine', glide: [190, 150] },
    // 멍! (한 음 낮게)
    { frequency: 280, at: 0.3, length: 0.22, volume: 0.105, type: 'square', attack: 0.025, glide: [560, 400, 285] },
    { frequency: 190, at: 0.31, length: 0.21, volume: 0.055, type: 'triangle', glide: [370, 260, 200] },
    { frequency: 140, at: 0.3, length: 0.22, volume: 0.038, type: 'sine', glide: [175, 140] },
    // 끝에 꼬리를 답니다 — 낑, 하고 살짝 올라갑니다.
    { frequency: 300, at: 0.6, length: 0.3, volume: 0.06, type: 'triangle', glide: [380, 330, 290], vibrato: { rate: 10, depth: 16 } },
    { frequency: 600, at: 0.62, length: 0.26, volume: 0.018, type: 'sine', glide: [760, 660] },
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
    // 아래에서 받쳐 주는 숨결입니다.
    { frequency: 360, at: 0.02, length: 0.5, volume: 0.03, type: 'sine', glide: [500, 620, 430] },
    // 야옹 뒤에 갸르릉 — 목을 고르는 소리로 마칩니다.
    {
      frequency: 260, at: 0.66, length: 0.42, volume: 0.055, type: 'triangle', attack: 0.08,
      glide: [280, 270, 255], vibrato: { rate: 28, depth: 16 },
    },
    { frequency: 780, at: 0.7, length: 0.34, volume: 0.014, type: 'sine', glide: [840, 800] },
  ],
  // 여우 — 높고 가는 소리로 깽, 깽, 깨앵.
  '🦊': [
    { frequency: 780, at: 0, length: 0.14, volume: 0.075, type: 'triangle', attack: 0.02, glide: [1180, 900] },
    { frequency: 800, at: 0.2, length: 0.14, volume: 0.075, type: 'triangle', attack: 0.02, glide: [1250, 940] },
    {
      frequency: 820, at: 0.4, length: 0.38, volume: 0.08, type: 'triangle', attack: 0.03,
      glide: [1320, 1150, 880, 700], vibrato: { rate: 9, depth: 22 },
    },
    // 위에서 함께 우는 배음과, 아래에서 받치는 숨결입니다.
    { frequency: 1640, at: 0.42, length: 0.34, volume: 0.016, type: 'sine', glide: [2400, 1760, 1400] },
    { frequency: 410, at: 0.4, length: 0.36, volume: 0.028, type: 'sine', glide: [640, 470, 360] },
    // 끝에 짧게 한 번 더 — 꺄웅.
    { frequency: 900, at: 0.84, length: 0.22, volume: 0.055, type: 'triangle', glide: [1150, 980, 820], vibrato: { rate: 12, depth: 20 } },
  ],
  // 토끼 — 우는 대신 코를 찡긋거리며 킁킁, 끝에 짧게 뽀.
  '🐰': [
    { frequency: 900, at: 0, length: 0.09, volume: 0.055, type: 'sine', glide: [1150, 950] },
    { frequency: 950, at: 0.13, length: 0.09, volume: 0.055, type: 'sine', glide: [1220, 1000] },
    { frequency: 980, at: 0.26, length: 0.1, volume: 0.05, type: 'sine', glide: [1280, 1040] },
    {
      frequency: 1100, at: 0.42, length: 0.3, volume: 0.06, type: 'sine', attack: 0.04,
      glide: [1500, 1320, 1100], vibrato: { rate: 11, depth: 18 },
    },
    // 콩콩 뛰는 발입니다. 낮고 짧게 두 번.
    { frequency: 300, at: 0.44, length: 0.08, volume: 0.035, type: 'triangle', glide: [240, 200] },
    { frequency: 320, at: 0.6, length: 0.08, volume: 0.032, type: 'triangle', glide: [255, 210] },
    // 끝에 방울 하나.
    { frequency: 1760, at: 0.76, length: 0.3, volume: 0.026, type: 'sine', glide: [2093, 1760] },
  ],
  // 판다 — 새끼 판다는 양처럼 웁니다. 낮고 둥글게 떨리는 소리입니다.
  '🐼': [
    {
      frequency: 300, at: 0, length: 0.5, volume: 0.1, type: 'triangle', attack: 0.06,
      glide: [380, 350, 320, 280], vibrato: { rate: 13, depth: 26 },
    },
    { frequency: 600, at: 0.04, length: 0.4, volume: 0.03, type: 'sine', glide: [740, 640, 560] },
    { frequency: 280, at: 0.56, length: 0.34, volume: 0.07, type: 'triangle', attack: 0.05, glide: [340, 290, 250], vibrato: { rate: 12, depth: 20 } },
    { frequency: 560, at: 0.58, length: 0.3, volume: 0.022, type: 'sine', glide: [680, 580, 500] },
    // 아래에서 둥글게 받치는 소리입니다.
    { frequency: 150, at: 0.02, length: 0.46, volume: 0.035, type: 'sine', glide: [180, 165, 145] },
    { frequency: 145, at: 0.58, length: 0.32, volume: 0.03, type: 'sine', glide: [172, 150] },
  ],
  // 호랑이 — 100Hz 언저리는 교실 스피커가 거의 내지 못해, 웅장한 대신
  // 웅얼거림으로 들렸습니다. 울림의 자리를 한 옥타브 올리고 배음을
  // 층층이 쌓습니다. 낮은 힘은 밑에서 받치고, 들리는 것은 그 위입니다.
  '🐯': [
    // 어— 하고 배에서 올라옵니다.
    {
      frequency: 230, at: 0, length: 0.5, volume: 0.11, type: 'sawtooth', attack: 0.1,
      glide: [290, 260, 235, 210], vibrato: { rate: 19, depth: 16 },
    },
    { frequency: 460, at: 0.02, length: 0.46, volume: 0.05, type: 'triangle', glide: [560, 500, 440] },
    { frequency: 115, at: 0, length: 0.5, volume: 0.05, type: 'sine', glide: [140, 125, 105] },
    // 흥— 하고 크게 벌어졌다 닫힙니다.
    {
      frequency: 260, at: 0.54, length: 0.56, volume: 0.13, type: 'sawtooth', attack: 0.06,
      glide: [360, 320, 260, 205], vibrato: { rate: 15, depth: 14 },
    },
    { frequency: 520, at: 0.56, length: 0.5, volume: 0.055, type: 'triangle', glide: [700, 620, 500, 420] },
    { frequency: 130, at: 0.54, length: 0.56, volume: 0.055, type: 'sine', glide: [175, 155, 125] },
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
  // 펭귄 — 모난 소리로 빼액 하니 비명 같았습니다. 새끼 펭귄이 어미를
  // 부르듯 동글동글한 소리로 짧게 세 번 삐약이고, 끝만 살짝 올립니다.
  '🐧': [
    { frequency: 620, at: 0, length: 0.11, volume: 0.075, type: 'triangle', attack: 0.03, glide: [760, 700], vibrato: { rate: 9, depth: 12 } },
    { frequency: 650, at: 0.17, length: 0.11, volume: 0.075, type: 'triangle', attack: 0.03, glide: [800, 730], vibrato: { rate: 9, depth: 12 } },
    {
      frequency: 680, at: 0.34, length: 0.3, volume: 0.08, type: 'triangle', attack: 0.04,
      glide: [850, 960, 880], vibrato: { rate: 8, depth: 16 },
    },
    // 둥글게 받쳐 주는 배음입니다. 모난 결을 덮어 줍니다.
    { frequency: 1300, at: 0.02, length: 0.6, volume: 0.014, type: 'sine', glide: [1500, 1700, 1560] },
  ],
  // 사자 — 호랑이보다 조금 낮되, 들리는 자리에 둡니다. 짧게 두 번
  // 그르렁거린 뒤 길게 포효합니다. 배음을 세 층으로 쌓아야 작은
  // 스피커에서도 크게 들립니다.
  '🦁': [
    { frequency: 190, at: 0, length: 0.16, volume: 0.075, type: 'sawtooth', attack: 0.05, glide: [210, 185], vibrato: { rate: 24, depth: 12 } },
    { frequency: 195, at: 0.2, length: 0.16, volume: 0.08, type: 'sawtooth', attack: 0.05, glide: [220, 190], vibrato: { rate: 24, depth: 12 } },
    // 크게 벌어지는 포효입니다.
    {
      frequency: 205, at: 0.42, length: 0.86, volume: 0.135, type: 'sawtooth', attack: 0.13,
      glide: [300, 340, 290, 235, 185], vibrato: { rate: 13, depth: 15 },
    },
    { frequency: 410, at: 0.45, length: 0.8, volume: 0.06, type: 'triangle', glide: [600, 680, 560, 450, 370] },
    { frequency: 820, at: 0.5, length: 0.66, volume: 0.022, type: 'sine', glide: [1180, 1320, 1000, 760] },
    { frequency: 103, at: 0.42, length: 0.86, volume: 0.06, type: 'sine', glide: [150, 170, 145, 118, 92] },
  ],
  // 거북 — 느린 걸음이 소리에 남아야 하지만, 낮게 깔면 들리지 않습니다.
  // 악기를 셋 씁니다. 숨을 길게 내쉬는 소리(triangle), 그 위에 얹히는
  // 맑은 울림(sine), 걸음을 세듯 아래에서 느리게 짚는 소리(sine 저음).
  // 두 번 늘어지게 하품하고, 끝에 종처럼 한 번 반짝입니다.
  '🐢': [
    // 하아— (첫 하품)
    {
      frequency: 400, at: 0, length: 0.78, volume: 0.1, type: 'triangle', attack: 0.2,
      glide: [480, 540, 500, 440], vibrato: { rate: 4.5, depth: 16 },
    },
    { frequency: 800, at: 0.06, length: 0.62, volume: 0.03, type: 'sine', glide: [960, 1060, 900] },
    { frequency: 200, at: 0, length: 0.78, volume: 0.045, type: 'sine', glide: [240, 260, 210] },
    // 하아아— (두 번째, 더 높고 더 길게)
    {
      frequency: 460, at: 0.86, length: 0.92, volume: 0.095, type: 'triangle', attack: 0.24,
      glide: [560, 640, 610, 520, 460], vibrato: { rate: 4, depth: 18 },
    },
    { frequency: 920, at: 0.92, length: 0.76, volume: 0.028, type: 'sine', glide: [1120, 1260, 1080, 940] },
    { frequency: 230, at: 0.86, length: 0.92, volume: 0.042, type: 'sine', glide: [280, 300, 250, 220] },
    // 느릿느릿 걸음을 짚습니다.
    { frequency: 320, at: 0.4, length: 0.14, volume: 0.03, type: 'sine' },
    { frequency: 300, at: 1.3, length: 0.16, volume: 0.028, type: 'sine' },
    // 끝에 종 하나.
    { frequency: 1046.5, at: 1.66, length: 0.5, volume: 0.03, type: 'sine' },
    { frequency: 1568, at: 1.7, length: 0.44, volume: 0.018, type: 'sine' },
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

// 반이 함께 채운 목표에 닿는 순간입니다. 한 아이가 맞힌 소리와는 달라야
// 합니다 — 서른 개를 같이 채워야 한 번 울리는 소리라, 교실 전체가 고개를
// 들 만큼 크고 화려해도 됩니다. 나팔 셋이 겹쳐 올라간 뒤 종이 울립니다.
// 목표를 채운 순간의 팡파르입니다. 아이들이 성공을 알아채고 화면을
// 볼 시간을 주려고, 원래 가락(1.84초)의 자리마다 시각을 두 배로 늘려
// 절반 빠르기로(3.68초) 울립니다 — 음은 그대로, 길이만 두 배입니다.
export const playGoalFanfare = () => {
  playBlips([
    // 나팔 신호 — 솔 솔 솔 도
    { frequency: 783.99, at: 0, length: 0.24, volume: 0.12, type: 'square' },
    { frequency: 783.99, at: 0.3, length: 0.24, volume: 0.12, type: 'square' },
    { frequency: 783.99, at: 0.6, length: 0.24, volume: 0.12, type: 'square' },
    { frequency: 1046.5, at: 0.9, length: 0.68, volume: 0.13, type: 'square' },
    // 아래에서 받쳐 주는 화음
    { frequency: 392, at: 0.9, length: 0.72, volume: 0.06, type: 'triangle' },
    { frequency: 523.25, at: 0.9, length: 0.72, volume: 0.05, type: 'triangle' },

    // 올라가는 계단 — 도 미 솔 도
    { frequency: 523.25, at: 1.72, length: 0.22, volume: 0.11, type: 'triangle' },
    { frequency: 659.25, at: 1.94, length: 0.22, volume: 0.115, type: 'triangle' },
    { frequency: 783.99, at: 2.16, length: 0.22, volume: 0.12, type: 'triangle' },
    { frequency: 1046.5, at: 2.38, length: 1.0, volume: 0.13, type: 'triangle' },
    { frequency: 1318.51, at: 2.38, length: 1.0, volume: 0.075, type: 'triangle' },
    { frequency: 1567.98, at: 2.42, length: 0.96, volume: 0.055, type: 'triangle' },

    // 종처럼 위에서 반짝입니다.
    { frequency: 2093, at: 2.48, length: 1.2, volume: 0.04, type: 'sine' },
    { frequency: 2637.02, at: 2.64, length: 1.04, volume: 0.028, type: 'sine', glide: [3135.96, 2637.02] },
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
    // 물방울처럼 또르르 굴러 올라갑니다 — 도 미 솔 도 미
    { frequency: 523.25, at: 0, length: 0.09, volume: 0.085, type: 'triangle' },
    { frequency: 659.25, at: 0.06, length: 0.09, volume: 0.09, type: 'triangle' },
    { frequency: 783.99, at: 0.12, length: 0.09, volume: 0.095, type: 'triangle' },
    { frequency: 1046.5, at: 0.18, length: 0.1, volume: 0.1, type: 'triangle' },
    { frequency: 1318.51, at: 0.25, length: 0.28, volume: 0.1, type: 'triangle' },

    // 그 아래 부드러운 화음 한 겹 — 소리에 두께를 줍니다.
    { frequency: 523.25, at: 0.25, length: 0.32, volume: 0.045, type: 'sine' },
    { frequency: 659.25, at: 0.26, length: 0.3, volume: 0.035, type: 'sine' },

    // 위에서 반짝 하고 얹히는 종소리입니다.
    { frequency: 2093, at: 0.27, length: 0.4, volume: 0.032, type: 'sine' },
    { frequency: 2637.02, at: 0.33, length: 0.34, volume: 0.022, type: 'sine', glide: [3135.96, 2793.83] },
  ]);
};

export const playDifficultySound = (difficulty: Difficulty) => {
  playBlips(difficultyBlips[difficulty]);
};
