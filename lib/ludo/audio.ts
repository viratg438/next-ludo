const SOUND_FILES = {
  dice: "/sounds/dice.mp3",
  cut: "/sounds/cut.mp3",
  pass: "/sounds/pass.mp3",
  final: "/sounds/final.mp3",
  stamp: "/sounds/stamp.mp3",
} as const;

const clips = new Map<string, HTMLAudioElement>();

function clip(src: string) {
  const existing = clips.get(src);
  if (existing) return existing;
  const audio = new Audio(src);
  audio.preload = "auto";
  clips.set(src, audio);
  return audio;
}

export function primeAudio() {
  for (const src of Object.values(SOUND_FILES)) clip(src);
}

function playFile(src: string) {
  const audio = new Audio(src);
  audio.preload = "auto";
  void audio.play().catch(() => {});
}

export function playDiceShake() {
  playFile(SOUND_FILES.dice);
}

export function playCut() {
  playFile(SOUND_FILES.cut);
}

export function playTurnPass() {
  playFile(SOUND_FILES.pass);
}

export function playFinalPass() {
  playFile(SOUND_FILES.final);
}

export function playStamp() {
  playFile(SOUND_FILES.stamp);
}
