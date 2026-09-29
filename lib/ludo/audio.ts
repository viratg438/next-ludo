const SOUND_FILES = {
  cut: "/sounds/cut.mp3",
  final: "/sounds/final.mp3",
  stamp: "/sounds/stamp.mp3",
} as const;

let current: HTMLAudioElement | null = null;
let clickContext: AudioContext | null = null;

function stopCurrent() {
  if (!current) return;
  current.pause();
  current.currentTime = 0;
  current = null;
}

export function primeAudio() {
  for (const src of Object.values(SOUND_FILES)) {
    const audio = new Audio(src);
    audio.preload = "auto";
  }
  if (!clickContext) clickContext = new window.AudioContext();
  if (clickContext.state === "suspended") void clickContext.resume();
}

function playFile(src: string) {
  stopCurrent();
  const audio = new Audio(src);
  current = audio;
  void audio.play().catch(() => {});
}

export function playDiceShake() {
  stopCurrent();
  if (!clickContext) clickContext = new window.AudioContext();
  if (clickContext.state === "suspended") void clickContext.resume();
  const ctx = clickContext;
  const at = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(980, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.2, at + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.05);
}

export function playCut() {
  playFile(SOUND_FILES.cut);
}

export function playFinalPass() {
  playFile(SOUND_FILES.final);
}

export function playStamp() {
  playFile(SOUND_FILES.stamp);
}
