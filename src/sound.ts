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

// ── 맞혔을 때, 틀렸을 때 내 동물이 내는 소리 ─────────────────────────
// 정답과 오답 소리를 아이가 고른 동물이 냅니다. 소리만 들어도 강아지인지
// 개구리인지 알 수 있게 동물마다 그 동물다운 소리를 따로 지었습니다.
// 맞히면 신나게(멍멍!, 개굴개굴!, 삐약삐약!) 높이 올라가며 '도미솔' 반짝임으로
// 끝나고, 틀리면 화가 나서 으르렁거립니다(으르르 컹!, 하악!, 크르릉 어흥!).
// 둘을 귀로 바로 가를 수 있게, 정답은 높고 둥근 결로 위로 올라가고 오답은 낮고
// 거친 결(sawtooth·square)로 빠르게 떨며 아래로 떨어집니다.
// 다섯 자리가 한꺼번에 울릴 수 있으므로 모두 0.6초 안쪽으로 짧고 작게 둡니다.

/** 맞혔을 때 위에 얹는 '도미솔' 반짝임입니다. 동물이 달라도 '맞았다, 신난다'는 같은 신호로 들립니다. */
const 반짝 = (at: number): Blip[] => [
  { frequency: 1568, at, length: 0.08, volume: 0.03, type: 'sine' },
  { frequency: 1975.53, at: at + 0.045, length: 0.08, volume: 0.03, type: 'sine' },
  { frequency: 2349.32, at: at + 0.09, length: 0.08, volume: 0.032, type: 'sine', glide: [2637] },
];

const 기쁨소리: Record<string, Blip[]> = {
  // 멍멍! 왕! — 꼬리를 흔들며 짧게 두 번 짖고, 한 번 더 높게 짖습니다.
  '🐶': [
    { frequency: 620, at: 0, length: 0.1, volume: 0.075, type: 'triangle', attack: 0.012, glide: [760, 560] },
    { frequency: 310, at: 0, length: 0.1, volume: 0.03, type: 'sine', glide: [380, 290] },
    { frequency: 680, at: 0.14, length: 0.1, volume: 0.078, type: 'triangle', attack: 0.012, glide: [840, 610] },
    { frequency: 340, at: 0.14, length: 0.1, volume: 0.03, type: 'sine', glide: [420, 310] },
    { frequency: 760, at: 0.3, length: 0.2, volume: 0.085, type: 'triangle', attack: 0.015, glide: [1000, 1180, 1100] },
    ...반짝(0.36),
  ],
  // 야~옹♪ — 올라갔다 살짝 내려온 뒤 한 번 더 올라가며 기분 좋게 웁니다.
  '🐱': [
    { frequency: 980, at: 0, length: 0.46, volume: 0.068, type: 'sine', attack: 0.04, glide: [1250, 1420, 1260, 1520], vibrato: { rate: 7, depth: 18 } },
    { frequency: 1960, at: 0.03, length: 0.4, volume: 0.014, type: 'triangle', glide: [2500, 2700, 2900] },
    { frequency: 490, at: 0.02, length: 0.4, volume: 0.023, type: 'sine', glide: [620, 700, 650] },
    ...반짝(0.4),
  ],
  // 깽깽 꺄웅! — 여우는 높고 가늘게, 통통 튀듯 웁니다.
  '🦊': [
    { frequency: 1100, at: 0, length: 0.09, volume: 0.065, type: 'triangle', attack: 0.012, glide: [1350, 1150] },
    { frequency: 1150, at: 0.12, length: 0.09, volume: 0.065, type: 'triangle', attack: 0.012, glide: [1420, 1200] },
    { frequency: 1200, at: 0.26, length: 0.26, volume: 0.075, type: 'triangle', attack: 0.02, glide: [1500, 1700, 1600], vibrato: { rate: 10, depth: 20 } },
    { frequency: 600, at: 0.26, length: 0.24, volume: 0.022, type: 'sine', glide: [750, 820] },
    ...반짝(0.38),
  ],
  // 콩! 콩! 콩! — 토끼는 우는 대신 높이 깡충 뛰어오릅니다.
  '🐰': [
    { frequency: 620, at: 0, length: 0.1, volume: 0.084, type: 'sine', glide: [900] },
    { frequency: 720, at: 0.13, length: 0.1, volume: 0.084, type: 'sine', glide: [1050] },
    { frequency: 820, at: 0.26, length: 0.14, volume: 0.09, type: 'sine', glide: [1250, 1400] },
    { frequency: 1760, at: 0.4, length: 0.18, volume: 0.036, type: 'sine', glide: [2093] },
    ...반짝(0.42),
  ],
  // 메헤~ — 새끼 판다는 양처럼 웁니다. 둥글게 떨며 올라갑니다.
  '🐼': [
    { frequency: 400, at: 0, length: 0.42, volume: 0.064, type: 'triangle', attack: 0.04, glide: [470, 540, 620], vibrato: { rate: 13, depth: 22 } },
    { frequency: 800, at: 0.03, length: 0.36, volume: 0.019, type: 'sine', glide: [940, 1100, 1240] },
    { frequency: 200, at: 0, length: 0.4, volume: 0.024, type: 'sine', glide: [230, 260] },
    ...반짝(0.36),
  ],
  // 어흥! — 무섭지 않은 아기 호랑이의 짧고 씩씩한 어흥입니다.
  '🐯': [
    { frequency: 300, at: 0, length: 0.36, volume: 0.066, type: 'triangle', attack: 0.05, glide: [380, 470, 540], vibrato: { rate: 15, depth: 14 } },
    { frequency: 600, at: 0.02, length: 0.32, volume: 0.023, type: 'triangle', glide: [760, 940, 1080] },
    { frequency: 150, at: 0, length: 0.34, volume: 0.023, type: 'sine', glide: [190, 230] },
    ...반짝(0.36),
  ],
  // 개굴개굴! — 짧은 울음 넷이 계단처럼 올라갑니다.
  '🐸': [
    { frequency: 470, at: 0, length: 0.08, volume: 0.086, type: 'triangle', attack: 0.012, glide: [520], vibrato: { rate: 34, depth: 22 } },
    { frequency: 500, at: 0.1, length: 0.08, volume: 0.086, type: 'triangle', attack: 0.012, glide: [560], vibrato: { rate: 34, depth: 22 } },
    { frequency: 540, at: 0.2, length: 0.08, volume: 0.089, type: 'triangle', attack: 0.012, glide: [610], vibrato: { rate: 34, depth: 24 } },
    { frequency: 600, at: 0.3, length: 0.16, volume: 0.09, type: 'triangle', attack: 0.012, glide: [700, 760], vibrato: { rate: 30, depth: 24 } },
    ...반짝(0.4),
  ],
  // 삐약삐약! — 동글동글한 소리로 셋째 울음만 높이 올립니다.
  '🐧': [
    { frequency: 820, at: 0, length: 0.1, volume: 0.07, type: 'triangle', attack: 0.02, glide: [960, 900] },
    { frequency: 860, at: 0.14, length: 0.1, volume: 0.07, type: 'triangle', attack: 0.02, glide: [1010, 940] },
    { frequency: 900, at: 0.28, length: 0.22, volume: 0.078, type: 'triangle', attack: 0.02, glide: [1100, 1350, 1300], vibrato: { rate: 8, depth: 14 } },
    { frequency: 1800, at: 0.3, length: 0.2, volume: 0.016, type: 'sine', glide: [2200, 2600] },
    ...반짝(0.4),
  ],
  // 아웅! — 사자는 굵게 시작해 씩씩하게 올라갑니다. 무섭지 않게 둥근 결로만 짓습니다.
  '🦁': [
    { frequency: 260, at: 0, length: 0.4, volume: 0.063, type: 'triangle', attack: 0.06, glide: [330, 420, 500, 470], vibrato: { rate: 13, depth: 14 } },
    { frequency: 520, at: 0.03, length: 0.36, volume: 0.024, type: 'triangle', glide: [660, 840, 940] },
    { frequency: 130, at: 0, length: 0.38, volume: 0.026, type: 'sine', glide: [165, 210, 235] },
    ...반짝(0.4),
  ],
  // 하~아♪ — 거북이는 천천히 기지개를 켜듯 올라가고, 끝에 종을 칩니다.
  '🐢': [
    { frequency: 460, at: 0, length: 0.4, volume: 0.08, type: 'sine', attack: 0.1, glide: [540, 640, 720], vibrato: { rate: 4.5, depth: 14 } },
    { frequency: 920, at: 0.05, length: 0.32, volume: 0.022, type: 'sine', glide: [1080, 1280] },
    { frequency: 1046.5, at: 0.4, length: 0.19, volume: 0.04, type: 'sine' },
    { frequency: 1568, at: 0.42, length: 0.16, volume: 0.022, type: 'sine' },
  ],
};

// 화가 나서 으르렁거리는 소리입니다. 낮고 거칠게, 빠르게 떨며 아래로 떨어집니다.
// 입을 다문 채 목으로 으르르 하는 떨림(vibrato가 빠른 sawtooth)이 바탕이고, 동물마다
// 마지막에 그 동물다운 성난 한마디를 붙입니다.
const 으르르 = (f: number, at: number, length: number, volume = 0.06): Blip[] => [
  { frequency: f, at, length, volume, type: 'sawtooth', attack: 0.03, glide: [f * 1.08, f * 0.95, f * 0.85], vibrato: { rate: 28, depth: f * 0.09 } },
  { frequency: f * 2, at: at + 0.01, length: length - 0.02, volume: volume * 0.45, type: 'square', glide: [f * 2.1, f * 1.7], vibrato: { rate: 28, depth: f * 0.14 } },
];

const 화남소리: Record<string, Blip[]> = {
  // 으르르… 컹! — 이를 드러내고 으르렁거리다 크게 한 번 짖습니다.
  '🐶': [
    ...으르르(150, 0, 0.3),
    { frequency: 360, at: 0.34, length: 0.16, volume: 0.07, type: 'square', attack: 0.01, glide: [420, 230] },
    { frequency: 180, at: 0.34, length: 0.16, volume: 0.04, type: 'sawtooth', glide: [200, 120] },
  ],
  // 하악! 으르릉 — 털을 세우고 하악거린 뒤 낮게 웁니다.
  '🐱': [
    { frequency: 2400, at: 0, length: 0.16, volume: 0.022, type: 'sawtooth', attack: 0.005, glide: [2100, 1800], vibrato: { rate: 70, depth: 900 } },
    { frequency: 1200, at: 0, length: 0.16, volume: 0.02, type: 'square', glide: [1050, 900], vibrato: { rate: 63, depth: 500 } },
    ...으르르(230, 0.2, 0.34, 0.055),
  ],
  // 크르르 캉! — 여우는 날카롭게 짖으며 화를 냅니다.
  '🦊': [
    ...으르르(190, 0, 0.28),
    { frequency: 900, at: 0.32, length: 0.18, volume: 0.06, type: 'square', attack: 0.008, glide: [1000, 520] },
    { frequency: 450, at: 0.32, length: 0.18, volume: 0.03, type: 'sawtooth', glide: [500, 260] },
  ],
  // 쿵! 쿵! 끄응 — 토끼는 화가 나면 뒷발을 굴러 쿵쿵거립니다.
  '🐰': [
    { frequency: 160, at: 0, length: 0.1, volume: 0.08, type: 'triangle', attack: 0.004, glide: [70] },
    { frequency: 160, at: 0.15, length: 0.1, volume: 0.08, type: 'triangle', attack: 0.004, glide: [70] },
    ...으르르(260, 0.3, 0.26, 0.05),
  ],
  // 으어엉! — 판다가 낮게 성을 냅니다.
  '🐼': [
    ...으르르(160, 0, 0.5, 0.065),
    { frequency: 320, at: 0.05, length: 0.4, volume: 0.025, type: 'triangle', glide: [300, 220] },
  ],
  // 크르릉 어흥! — 호랑이가 화나서 으르렁거린 뒤 크게 어흥 합니다.
  '🐯': [
    ...으르르(125, 0, 0.26),
    { frequency: 230, at: 0.28, length: 0.3, volume: 0.075, type: 'sawtooth', attack: 0.03, glide: [290, 210, 150], vibrato: { rate: 18, depth: 20 } },
    { frequency: 460, at: 0.29, length: 0.28, volume: 0.03, type: 'square', glide: [560, 380, 280] },
  ],
  // 꽥꽥! — 개구리가 성나서 거칠게 웁니다.
  '🐸': [
    { frequency: 330, at: 0, length: 0.14, volume: 0.06, type: 'square', attack: 0.01, glide: [300, 220], vibrato: { rate: 45, depth: 40 } },
    { frequency: 320, at: 0.2, length: 0.2, volume: 0.06, type: 'square', attack: 0.01, glide: [280, 180], vibrato: { rate: 45, depth: 40 } },
    { frequency: 160, at: 0.2, length: 0.2, volume: 0.035, type: 'sawtooth', glide: [140, 95] },
  ],
  // 꽉! 꽉! — 펭귄이 날개를 퍼덕이며 꽥꽥댑니다.
  '🐧': [
    { frequency: 700, at: 0, length: 0.12, volume: 0.055, type: 'square', attack: 0.01, glide: [620, 430], vibrato: { rate: 38, depth: 50 } },
    { frequency: 680, at: 0.17, length: 0.14, volume: 0.055, type: 'square', attack: 0.01, glide: [600, 380], vibrato: { rate: 38, depth: 50 } },
    ...으르르(230, 0.34, 0.22, 0.045),
  ],
  // 크아앙! — 사자가 낮게 으르렁거리다 크게 포효합니다.
  '🦁': [
    ...으르르(115, 0, 0.22),
    { frequency: 200, at: 0.22, length: 0.36, volume: 0.08, type: 'sawtooth', attack: 0.04, glide: [270, 240, 170, 120], vibrato: { rate: 16, depth: 18 } },
    { frequency: 400, at: 0.23, length: 0.34, volume: 0.032, type: 'square', glide: [520, 460, 320] },
  ],
  // 쉬익! 끄응 — 거북이는 목을 쏙 넣으며 쉬익거리고 낮게 툴툴댑니다.
  '🐢': [
    { frequency: 2000, at: 0, length: 0.2, volume: 0.022, type: 'sawtooth', attack: 0.01, glide: [1800, 1500], vibrato: { rate: 66, depth: 800 } },
    ...으르르(170, 0.24, 0.34, 0.055),
  ],
};

// 수준이 높을수록 같은 기쁨 소리를 조금 높여, 어느 수준을 맞혔는지도 들리게 합니다.
const 수준높이: Record<Difficulty, number> = { 하: 1, 중: 1.06, 상: 1.12 };

const 높이기 = (blips: Blip[], ratio: number): Blip[] =>
  blips.map((one) => ({
    ...one,
    frequency: one.frequency * ratio,
    ...(one.slideTo ? { slideTo: one.slideTo * ratio } : {}),
    ...(one.glide ? { glide: one.glide.map((point) => point * ratio) } : {}),
  }));

export const animalHappyBlips = (avatar: string, difficulty: Difficulty): Blip[] | null => {
  const blips = 기쁨소리[avatar];
  return blips ? 높이기(blips, 수준높이[difficulty]) : null;
};

export const animalAngryBlips = (avatar: string): Blip[] | null => 화남소리[avatar] ?? null;

/** 맞혔을 때 그 동물이 기뻐합니다. 동물이 없으면 원래 정답 소리를 냅니다. */
export const playAnimalHappy = (avatar: string, difficulty: Difficulty, fallback?: () => void) => {
  const blips = animalHappyBlips(avatar, difficulty);
  if (blips) playBlips(blips, fallback);
  else playSuccessSound(difficulty, fallback);
};

/** 틀렸을 때 그 동물이 화가 나서 으르렁거립니다. 동물이 없으면 원래 오답 소리를 냅니다. */
export const playAnimalAngry = (avatar: string) => {
  const blips = animalAngryBlips(avatar);
  if (blips) playBlips(blips);
  else playWrongSound();
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

// ── 피버 타임 ────────────────────────────────────────────────────────
// 마지막 30초가 시작되는 순간의 신호입니다. 올라가는 짧은 나팔로 '이제부터 별이 더 붙는다'를 알립니다.
export const playFeverStart = () => {
  playBlips([
    { frequency: 392, at: 0, length: 0.1, volume: 0.1, type: 'square' },
    { frequency: 523.25, at: 0.1, length: 0.1, volume: 0.1, type: 'square' },
    { frequency: 659.25, at: 0.2, length: 0.1, volume: 0.105, type: 'square' },
    { frequency: 783.99, at: 0.3, length: 0.32, volume: 0.11, type: 'square' },
    { frequency: 1567.98, at: 0.32, length: 0.3, volume: 0.04, type: 'sine', slideTo: 2093 },
  ]);
};

// 피버 타임 동안 1초마다 울리는 박자입니다. 낮은 북과 높은 반짝임을 번갈아 울려 음악이 바뀐 것처럼 들리게 합니다.
// 아이들 답 소리를 덮지 않게 작게 둡니다.
export const playFeverBeat = (tick: number) => {
  const 높음 = tick % 2 === 0;
  playBlips([
    { frequency: 110, at: 0, length: 0.12, volume: 0.07, type: 'sine', slideTo: 60 },
    { frequency: 높음 ? 1318.51 : 1046.5, at: 0.25, length: 0.07, volume: 0.03, type: 'triangle' },
    { frequency: 높음 ? 1567.98 : 1318.51, at: 0.5, length: 0.07, volume: 0.03, type: 'triangle' },
  ]);
};

// ── 단원 놀이 효과음 ─────────────────────────────────────────────────
// 놀이마다 맞힌 소리·놓친 소리·문제가 나오는 소리가 다릅니다. 몬스터는 광선이
// '퓨웅' 나가 '쾅' 터지고, 풍선은 '팡', 두더지는 망치로 '뿅', 로켓은 '슈우웅'
// 올라가고, 보물 상자는 동전이 '짤랑'거립니다. 연달아 맞히면 맞힐 때마다 한 칸씩
// 높아지는 콤보 소리가 뒤따르고, 시간이 3초 남으면 '똑딱'으로 서두르게 합니다.
//
// 동물 친구의 기쁨·화남 소리와 함께 울리므로, 하나하나는 짧고(0.6초 안쪽)
// 작게(0.1 이하) 둡니다. 다섯이 한꺼번에 내도 시끄럽지 않아야 합니다.

export type 놀이소리모드 = 'monster' | 'balloon' | 'mole' | 'rocket' | 'race' | 'treasure' | 'tunnel3d' | 'soccer3d' | 'fishing' | 'tower';

// 터지는 소리입니다. 거친 톱니파를 빠르게 떨며 낮게 떨어뜨리면 '쾅'처럼 들립니다.
const 쾅 = (at: number, volume = 0.07): Blip[] => [
  { frequency: 150, at, length: 0.32, volume, type: 'sawtooth', slideTo: 40, vibrato: { rate: 47, depth: 38 } },
  { frequency: 90, at, length: 0.3, volume: volume * 0.8, type: 'sine', slideTo: 35 },
];

const 맞힘효과: Record<놀이소리모드, Blip[]> = {
  // 퓨웅 — 쾅!
  monster: [
    { frequency: 1900, at: 0, length: 0.16, volume: 0.05, type: 'square', slideTo: 320 },
    ...쾅(0.12),
  ],
  // 팡! — 그리고 색종이가 반짝반짝
  balloon: [
    { frequency: 1500, at: 0, length: 0.06, volume: 0.09, type: 'triangle', slideTo: 180 },
    { frequency: 220, at: 0, length: 0.08, volume: 0.06, type: 'sawtooth', slideTo: 70 },
    { frequency: 2349.32, at: 0.1, length: 0.12, volume: 0.035, type: 'sine' },
    { frequency: 3135.96, at: 0.18, length: 0.16, volume: 0.03, type: 'sine' },
  ],
  // 딱(망치) — 뿅!
  mole: [
    { frequency: 260, at: 0, length: 0.08, volume: 0.09, type: 'triangle', slideTo: 110 },
    { frequency: 1800, at: 0, length: 0.03, volume: 0.05, type: 'square' },
    { frequency: 600, at: 0.08, length: 0.14, volume: 0.07, type: 'sine', slideTo: 1500 },
  ],
  // 슈우우웅 — 위로 솟구칩니다.
  rocket: [
    { frequency: 180, at: 0, length: 0.45, volume: 0.05, type: 'sawtooth', slideTo: 1400, vibrato: { rate: 33, depth: 45 } },
    { frequency: 400, at: 0.05, length: 0.4, volume: 0.05, type: 'sine', slideTo: 2200 },
  ],
  // 쌩 — 다다닥 달려 나갑니다.
  race: [
    { frequency: 500, at: 0, length: 0.18, volume: 0.06, type: 'triangle', glide: [900, 1600] },
    { frequency: 330, at: 0.16, length: 0.05, volume: 0.07, type: 'square' },
    { frequency: 392, at: 0.23, length: 0.05, volume: 0.07, type: 'square' },
    { frequency: 494, at: 0.3, length: 0.05, volume: 0.07, type: 'square' },
  ],
  // 끼익(상자 열림) — 짤랑짤랑(동전)
  treasure: [
    { frequency: 300, at: 0, length: 0.12, volume: 0.04, type: 'square', slideTo: 520 },
    { frequency: 1975.53, at: 0.12, length: 0.07, volume: 0.06, type: 'square' },
    { frequency: 2637.02, at: 0.18, length: 0.2, volume: 0.06, type: 'square' },
    { frequency: 1975.53, at: 0.3, length: 0.06, volume: 0.04, type: 'square' },
    { frequency: 2637.02, at: 0.36, length: 0.18, volume: 0.04, type: 'square' },
  ],
  // 지이잉(빔) — 콰광!
  tunnel3d: [
    { frequency: 2600, at: 0, length: 0.14, volume: 0.045, type: 'sawtooth', slideTo: 700 },
    { frequency: 1300, at: 0.02, length: 0.12, volume: 0.04, type: 'square', slideTo: 400 },
    ...쾅(0.11, 0.075),
  ],
  // 뻥(슛) — 철썩(그물) — 따라란(골인)!
  soccer3d: [
    { frequency: 160, at: 0, length: 0.09, volume: 0.09, type: 'sine', slideTo: 55 },
    { frequency: 700, at: 0, length: 0.03, volume: 0.05, type: 'square' },
    { frequency: 300, at: 0.16, length: 0.12, volume: 0.04, type: 'sawtooth', slideTo: 120, vibrato: { rate: 40, depth: 30 } },
    { frequency: 783.99, at: 0.26, length: 0.08, volume: 0.06, type: 'triangle' },
    { frequency: 1046.5, at: 0.34, length: 0.08, volume: 0.06, type: 'triangle' },
    { frequency: 1318.51, at: 0.42, length: 0.16, volume: 0.07, type: 'triangle' },
  ],
  // 첨벙 — 드르륵(릴 감기) — 뿅(낚아 올림)!
  fishing: [
    { frequency: 500, at: 0, length: 0.12, volume: 0.06, type: 'sine', slideTo: 120 },
    { frequency: 900, at: 0.1, length: 0.18, volume: 0.035, type: 'square', vibrato: { rate: 38, depth: 160 } },
    { frequency: 700, at: 0.3, length: 0.16, volume: 0.06, type: 'sine', slideTo: 1800 },
  ],
  // 쿵(블록이 내려앉음) — 띵(한 층 더)!
  tower: [
    { frequency: 140, at: 0, length: 0.12, volume: 0.09, type: 'sine', slideTo: 60 },
    { frequency: 300, at: 0, length: 0.05, volume: 0.05, type: 'square' },
    { frequency: 1318.51, at: 0.12, length: 0.18, volume: 0.05, type: 'triangle' },
  ],
};

const 놓침효과: Record<놀이소리모드, Blip[]> = {
  // 쿵! 성벽에 부딪힙니다.
  monster: [
    ...쾅(0, 0.08),
    { frequency: 200, at: 0.12, length: 0.3, volume: 0.05, type: 'triangle', slideTo: 90 },
  ],
  // 휘이잉 — 풍선이 하늘로 날아가 버립니다.
  balloon: [
    { frequency: 700, at: 0, length: 0.5, volume: 0.05, type: 'sine', glide: [1100, 1700, 2400], vibrato: { rate: 9, depth: 40 } },
  ],
  // 쏘옥 — 두더지가 숨어 버립니다.
  mole: [
    { frequency: 1000, at: 0, length: 0.22, volume: 0.07, type: 'sine', slideTo: 180 },
    { frequency: 150, at: 0.2, length: 0.08, volume: 0.05, type: 'triangle' },
  ],
  // 피시식 — 연료가 새어 버립니다.
  rocket: [
    { frequency: 320, at: 0, length: 0.5, volume: 0.05, type: 'sawtooth', slideTo: 60, vibrato: { rate: 60, depth: 80 } },
  ],
  // 뚜벅뚜벅 — 거북이가 한 걸음 앞섭니다.
  race: [
    { frequency: 330, at: 0, length: 0.12, volume: 0.07, type: 'triangle' },
    { frequency: 262, at: 0.16, length: 0.12, volume: 0.07, type: 'triangle' },
    { frequency: 196, at: 0.32, length: 0.22, volume: 0.06, type: 'triangle', slideTo: 165 },
  ],
  // 철컥 — 상자가 잠겨 버립니다.
  treasure: [
    { frequency: 220, at: 0, length: 0.05, volume: 0.08, type: 'square' },
    { frequency: 150, at: 0.07, length: 0.09, volume: 0.08, type: 'square' },
    { frequency: 110, at: 0.1, length: 0.25, volume: 0.04, type: 'triangle', slideTo: 80 },
  ],
  // 콰앙! — 운석에 부딪혀 우주선이 흔들립니다.
  tunnel3d: [
    ...쾅(0, 0.085),
    { frequency: 500, at: 0.05, length: 0.4, volume: 0.04, type: 'square', slideTo: 120, vibrato: { rate: 18, depth: 60 } },
  ],
  // 탁(골키퍼가 잡음) — 우우우(아쉬움)
  soccer3d: [
    { frequency: 240, at: 0, length: 0.06, volume: 0.08, type: 'square' },
    { frequency: 170, at: 0.04, length: 0.08, volume: 0.06, type: 'triangle' },
    { frequency: 330, at: 0.14, length: 0.4, volume: 0.05, type: 'triangle', slideTo: 165, vibrato: { rate: 6, depth: 8 } },
  ],
  // 퐁당 — 물고기가 줄을 끊고 물속으로 달아납니다.
  fishing: [
    { frequency: 1200, at: 0, length: 0.08, volume: 0.05, type: 'sine', slideTo: 300 },
    { frequency: 260, at: 0.1, length: 0.3, volume: 0.05, type: 'triangle', slideTo: 90, vibrato: { rate: 14, depth: 20 } },
  ],
  // 와르르 — 블록이 옆으로 굴러떨어집니다.
  tower: [
    { frequency: 500, at: 0, length: 0.4, volume: 0.05, type: 'triangle', slideTo: 80 },
    { frequency: 120, at: 0.3, length: 0.12, volume: 0.07, type: 'sawtooth', slideTo: 50 },
  ],
};

// 새 문제가 나올 때의 작은 신호입니다. 매 문제 울리므로 가장 작게 둡니다.
const 등장효과: Record<놀이소리모드, Blip[]> = {
  monster: [{ frequency: 1600, at: 0, length: 0.32, volume: 0.03, type: 'sine', slideTo: 600 }],
  balloon: [{ frequency: 300, at: 0, length: 0.24, volume: 0.035, type: 'sine', slideTo: 760 }],
  mole: [{ frequency: 500, at: 0, length: 0.08, volume: 0.045, type: 'sine', slideTo: 1200 }],
  rocket: [
    { frequency: 880, at: 0, length: 0.05, volume: 0.035, type: 'triangle' },
    { frequency: 1174.66, at: 0.08, length: 0.06, volume: 0.035, type: 'triangle' },
  ],
  race: [{ frequency: 700, at: 0, length: 0.05, volume: 0.04, type: 'square' }],
  treasure: [{ frequency: 2800, at: 0, length: 0.16, volume: 0.018, type: 'sawtooth', vibrato: { rate: 70, depth: 500 } }],
  tunnel3d: [{ frequency: 180, at: 0, length: 0.4, volume: 0.035, type: 'sine', slideTo: 900 }],
  // 삑(심판 호루라기)
  soccer3d: [{ frequency: 2900, at: 0, length: 0.18, volume: 0.03, type: 'sine', vibrato: { rate: 45, depth: 120 } }],
  fishing: [{ frequency: 1400, at: 0, length: 0.12, volume: 0.03, type: 'sine', slideTo: 2100 }],
  tower: [{ frequency: 600, at: 0, length: 0.14, volume: 0.025, type: 'square', vibrato: { rate: 30, depth: 40 } }],
};

// 콤보 소리는 도 레 미 솔 라(5음 음계)를 따라 맞힐 때마다 한 칸씩 올라갑니다.
const 콤보계단 = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

/** 연달아 맞힌 수(2 이상)에 따라 높아지는 콤보 소리입니다. 다섯 번째마다 화음을 얹어 크게 축하합니다. */
export const 콤보소리 = (연속: number): Blip[] => {
  if (연속 < 2) return [];
  const 칸 = 콤보계단[Math.min(연속 - 2, 콤보계단.length - 1)];
  const 바탕 = 783.99 * 2 ** (칸 / 12);
  const blips: Blip[] = [
    { frequency: 바탕, at: 0.2, length: 0.08, volume: 0.06, type: 'triangle' },
    { frequency: 바탕 * 1.5, at: 0.27, length: 0.16, volume: 0.06, type: 'triangle' },
  ];
  if (연속 % 5 === 0) {
    blips.push(
      { frequency: 바탕 * 1.25, at: 0.34, length: 0.22, volume: 0.045, type: 'square' },
      { frequency: 바탕 * 2, at: 0.36, length: 0.22, volume: 0.035, type: 'sine', slideTo: 바탕 * 3 },
    );
  }
  return blips;
};

export const 놀이맞힘소리 = (mode: 놀이소리모드, 연속: number): Blip[] => [...맞힘효과[mode], ...콤보소리(연속)];
export const 놀이놓침소리 = (mode: 놀이소리모드): Blip[] => 놓침효과[mode];
export const 놀이등장소리 = (mode: 놀이소리모드): Blip[] => 등장효과[mode];

/** 시간이 얼마 남지 않았을 때의 '똑딱'입니다. 마지막(남은 1초)은 더 높게 울립니다. */
export const 놀이똑딱소리 = (남은초: number): Blip[] => [
  { frequency: 남은초 <= 1 ? 1760 : 1318.51, at: 0, length: 0.04, volume: 0.04, type: 'square' },
];

export const playGameHit = (mode: 놀이소리모드, 연속: number) => playBlips(놀이맞힘소리(mode, 연속));
export const playGameMiss = (mode: 놀이소리모드) => playBlips(놀이놓침소리(mode));
export const playGameSpawn = (mode: 놀이소리모드) => playBlips(놀이등장소리(mode));
export const playGameTick = (남은초: number) => playBlips(놀이똑딱소리(남은초));

// 오락실 출발 신호입니다 — 삐, 삐, 뿌우! 두 번 낮게 울린 뒤 한 옥타브 높게 길게 울립니다.
export const 놀이준비소리: Blip[] = [
  { frequency: 523.25, at: 0.15, length: 0.12, volume: 0.06, type: 'square' },
  { frequency: 523.25, at: 0.55, length: 0.12, volume: 0.06, type: 'square' },
  { frequency: 1046.5, at: 0.95, length: 0.35, volume: 0.07, type: 'square' },
  { frequency: 1567.98, at: 0.97, length: 0.33, volume: 0.03, type: 'sine' },
];

// 스테이지가 오를 때의 짧은 팡파르입니다. 맞힌 소리 뒤에 이어 울립니다.
export const 놀이스테이지소리: Blip[] = [
  { frequency: 523.25, at: 0.45, length: 0.08, volume: 0.06, type: 'square' },
  { frequency: 659.25, at: 0.53, length: 0.08, volume: 0.06, type: 'square' },
  { frequency: 783.99, at: 0.61, length: 0.08, volume: 0.06, type: 'square' },
  { frequency: 1046.5, at: 0.69, length: 0.3, volume: 0.07, type: 'square' },
  { frequency: 2093, at: 0.71, length: 0.28, volume: 0.025, type: 'sine', slideTo: 3135.96 },
];

export const playGameReady = () => playBlips(놀이준비소리);
export const playGameStage = () => playBlips(놀이스테이지소리);

// ── 놀이 배경음악 ────────────────────────────────────────────────────
// 오락실 게임처럼 놀이 내내 신나는 8비트 음악이 돕니다. 네모파 가락, 세모파 베이스,
// 그리고 북(킥)·작은북(스네어)·하이햇 박자가 8마디를 되풀이합니다. 놀이마다 곡이
// 다르고(모험·통통·질주), 마지막 피버 타임에는 같은 곡이 빨라집니다.
//
// 효과음과 동물 소리가 잘 들리도록 아주 작게 깔고, 소리를 끄면 바로 멈췄다가
// 다시 켜면 이어서 납니다. 소리는 화면이 하나뿐이라 학생이 여럿이어도 한 곡만 돕니다.

export type 배경곡 = 'adventure' | 'bouncy' | 'dash';

/** 음 이름(C4, F#5…)을 주파수로 바꿉니다. null은 쉼표입니다. */
const 음높이 = (name: string): number => {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  if (!m) throw new Error(`음 이름이 이상합니다: ${name}`);
  const 자리 = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1] as 'A'] + (m[2] ? 1 : 0);
  return 440 * 2 ** ((자리 + (Number(m[3]) - 4) * 12) / 12);
};

export interface 곡 {
  bpm: number;
  /** 8분음표 하나에 한 칸입니다(8마디 = 64칸). */
  가락: (string | null)[];
  /** 4분음표 하나에 한 칸입니다(8마디 = 32칸). */
  베이스: string[];
}

// 마디마다 8분음표 8칸입니다. '-'는 앞 음을 이어서 끌지 않고 쉽니다.
const 칸 = (text: string) => text.trim().split(/\s+/).map((one) => (one === '-' ? null : one));

export const 배경곡들: Record<배경곡, 곡> = {
  // 모험: 다장조, C–G–Am–F를 두 번. 뒤 네 마디는 가락이 한 옥타브 위로 뛰어오릅니다.
  adventure: {
    bpm: 150,
    가락: 칸(`
      E5 G5 C6 G5 E5 G5 C6 D6   B5 G5 D5 G5 B5 D6 B5 G5
      C6 A5 E5 A5 C6 E6 D6 C6   A5 F5 C5 F5 A5 C6 B5 G5
      C6 -  C6 D6 E6 -  D6 C6   D6 -  B5 -  G5 A5 B5 D6
      E6 -  C6 -  A5 B5 C6 E6   F6 E6 D6 C6 B5 G5 A5 B5`),
    베이스: 칸(`C3 C3 G2 C3  G2 G2 D3 G2  A2 A2 E3 A2  F2 F2 C3 G2
               C3 E3 G2 C3  G2 B2 D3 G2  A2 C3 E3 A2  F2 A2 G2 G2`) as string[],
  },
  // 통통: 바장조, 통통 튀는 엇박 가락(F–Bb–C–F).
  bouncy: {
    bpm: 140,
    가락: 칸(`
      F5 -  A5 F5 C6 -  A5 -    D6 -  A#5 F5 D6 -  C6 -
      C6 -  E5 G5 C6 -  E6 -    F6 E6 C6 A5 F5 -  -  -
      A5 C6 -  A5 F5 -  A5 C6   A#5 D6 -  A#5 F5 -  D6 -
      C6 -  G5 C6 E6 -  D6 C6   F5 A5 C6 F6 -  -  F5 -`),
    베이스: 칸(`F2 C3 F2 C3  A#2 F2 A#2 F2  C3 G2 C3 G2  F2 C3 F2 F2
               F2 A2 C3 A2  A#2 D3 F3 D3  C3 E3 G3 E3  F2 C3 F2 C3`) as string[],
  },
  // 질주: 가단조, 쉬지 않고 내달리는 가락(Am–F–G–Am).
  dash: {
    bpm: 164,
    가락: 칸(`
      A5 E5 A5 B5 C6 B5 A5 E5   F5 A5 C6 A5 F5 A5 C6 D6
      D6 B5 G5 B5 D6 E6 D6 B5   C6 B5 A5 G#5 A5 -  E5 -
      A5 -  C6 -  E6 D6 C6 B5   C6 -  A5 -  F5 G5 A5 C6
      B5 -  G5 -  D6 C6 B5 G5   A5 E5 A5 C6 E6 -  A5 -`),
    베이스: 칸(`A2 A2 A3 A2  F2 F2 F3 F2  G2 G2 G3 G2  A2 A2 E3 A2
               A2 E3 A2 E3  F2 C3 F2 C3  G2 D3 G2 D3  A2 E3 A2 E3`) as string[],
  },
};

/** 놀이 방법마다 어울리는 곡입니다. */
export const 놀이배경곡: Record<놀이소리모드, 배경곡> = {
  monster: 'adventure', tunnel3d: 'adventure', rocket: 'adventure',
  balloon: 'bouncy', mole: 'bouncy', soccer3d: 'dash',
  race: 'dash', treasure: 'dash', fishing: 'bouncy', tower: 'dash',
};

const 배경 = {
  곡: null as 배경곡 | null,
  빠르게: false,
  시계: 0 as number,
  다음칸: 0,
  다음때: 0,
  출력: null as GainNode | null,
  소음: null as AudioBuffer | null,
};

// 하이햇·작은북에 쓰는 흰 소음입니다. 한 번 만들어 계속 씁니다.
const 소음버퍼 = (ready: AudioContext) => {
  if (배경.소음) return 배경.소음;
  const buffer = ready.createBuffer(1, Math.floor(ready.sampleRate * 0.2), ready.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  배경.소음 = buffer;
  return buffer;
};

const 음하나 = (ready: AudioContext, out: AudioNode, type: OscillatorType, frequency: number, at: number, length: number, volume: number, slideTo?: number) => {
  const osc = ready.createOscillator();
  const gain = ready.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain);
  gain.connect(out);
  osc.start(at);
  osc.stop(at + length + 0.02);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
};

const 소음하나 = (ready: AudioContext, out: AudioNode, at: number, length: number, volume: number, 높이: number) => {
  const src = ready.createBufferSource();
  src.buffer = 소음버퍼(ready);
  const filter = ready.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(높이, at);
  const gain = ready.createGain();
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  src.start(at);
  src.stop(at + length + 0.02);
  src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
};

/** 8분음표 한 칸에 들어갈 소리를 예약합니다. 칸은 0부터 63까지 돕니다. */
const 칸예약 = (ready: AudioContext, out: AudioNode, 노래: 곡, 칸번호: number, at: number, 한칸: number) => {
  const 가락 = 노래.가락[칸번호 % 노래.가락.length];
  if (가락) 음하나(ready, out, 'square', 음높이(가락), at, 한칸 * 0.9, 0.05);
  if (칸번호 % 2 === 0) {
    const 베이스 = 노래.베이스[(칸번호 / 2) % 노래.베이스.length];
    if (베이스) 음하나(ready, out, 'triangle', 음높이(베이스), at, 한칸 * 1.8, 0.11);
    // 북: 1·3박에 쿵, 2·4박에 탁.
    const 박 = (칸번호 / 2) % 4;
    if (박 === 0 || 박 === 2) 음하나(ready, out, 'sine', 140, at, 0.16, 0.16, 45);
    else 소음하나(ready, out, at, 0.11, 0.07, 1500);
  }
  // 하이햇: 8분음표마다 칙.
  소음하나(ready, out, at, 0.035, 칸번호 % 2 ? 0.025 : 0.035, 7000);
};

const 배경돌기 = () => {
  const ready = context;
  if (!ready || !배경.곡 || !배경.출력) return;
  const 노래 = 배경곡들[배경.곡];
  const 한칸 = 60 / (노래.bpm * (배경.빠르게 ? 1.25 : 1)) / 2;
  // 0.2초 앞까지 미리 예약해 둡니다. 화면이 잠깐 멈춰도 박자가 흔들리지 않습니다.
  if (배경.다음때 < ready.currentTime) 배경.다음때 = ready.currentTime + 0.05;
  while (배경.다음때 < ready.currentTime + 0.2) {
    칸예약(ready, 배경.출력, 노래, 배경.다음칸, 배경.다음때, 한칸);
    배경.다음칸 = (배경.다음칸 + 1) % 64;
    배경.다음때 += 한칸;
  }
};

const 배경멈추기 = () => {
  window.clearInterval(배경.시계);
  배경.시계 = 0;
  if (배경.출력 && context) {
    // 뚝 끊기지 않게 살짝 줄이며 끕니다.
    const out = 배경.출력;
    out.gain.setTargetAtTime(0.0001, context.currentTime, 0.05);
    window.setTimeout(() => out.disconnect(), 400);
  }
  배경.출력 = null;
};

const 배경켜기 = () => {
  if (muted || !배경.곡 || 배경.시계) return;
  const ready = audioContext();
  if (!ready) return;
  if (ready.state === 'suspended') void ready.resume();
  const out = ready.createGain();
  // 전체 크기입니다. 효과음보다 확실히 작게 둡니다.
  out.gain.setValueAtTime(0.0001, ready.currentTime);
  out.gain.setTargetAtTime(배경음크기, ready.currentTime, 0.2);
  out.connect(ready.destination);
  배경.출력 = out;
  배경.다음때 = ready.currentTime + 0.1;
  배경돌기();
  배경.시계 = window.setInterval(배경돌기, 50);
};

/** 배경음악 전체 크기입니다. */
export const 배경음크기 = 0.45;

/** 놀이 배경음악을 틉니다. 같은 곡이 이미 돌고 있으면 그대로 둡니다. */
export const startGameMusic = (곡이름: 배경곡) => {
  if (배경.곡 === 곡이름 && 배경.시계) return;
  if (배경.시계) 배경멈추기();
  배경.곡 = 곡이름;
  배경.다음칸 = 0;
  배경켜기();
};

/** 배경음악을 멈춥니다. */
export const stopGameMusic = () => {
  배경.곡 = null;
  배경.빠르게 = false;
  배경멈추기();
};

/** 피버 타임에는 같은 곡을 1.25배 빠르게 돌립니다. */
export const setGameMusicFast = (빠르게: boolean) => {
  배경.빠르게 = 빠르게;
};

// 소리를 끄면 배경음악도 멈추고, 다시 켜면 이어서 납니다.
watchMuted((value) => {
  if (value) 배경멈추기();
  else 배경켜기();
});
