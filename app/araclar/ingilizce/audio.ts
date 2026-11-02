// Spoken English: recorded clips when scripts/ingilizce/generate-audio.mjs has made them, the browser's
// speech synthesis otherwise. Short feedback sounds are made with Web Audio.
import { getProgress } from './progress';

const AUDIO_DIR = '/audio/ingilizce';

/** English text → clip file name, from the generated manifest; null when there is none */
let clips: Record<string, string> | null = null;
let clipsRequested = false;
let playing: HTMLAudioElement | null = null;

/** Loads the clip list once; until it arrives (or if it is missing) speech synthesis is used */
export function prepareAudio() {
  if (clipsRequested || typeof window === 'undefined') return;
  clipsRequested = true;
  fetch(`${AUDIO_DIR}/manifest.json`)
    .then((response) => (response.ok ? response.json() : null))
    .then((manifest: Record<string, string> | null) => {
      clips = manifest;
    })
    .catch(() => {
      clips = null;
    });
}

function hasSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Whether English can be played at all: recorded clips or speech synthesis */
export function canSpeak() {
  return clips !== null || hasSynthesis();
}

// Voices load asynchronously, so the list is read again on every call
function englishVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === 'en-US') ?? voices.find((voice) => voice.lang.startsWith('en')) ?? null;
}

function synthesize(text: string, slow: boolean) {
  if (!hasSynthesis()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.voice = englishVoice();
  utterance.rate = slow ? 0.6 : 0.95;
  window.speechSynthesis.speak(utterance);
}

export function speak(text: string, slow = false) {
  stopSpeaking();
  prepareAudio();
  const clip = clips?.[text];
  if (!clip) {
    synthesize(text, slow);
    return;
  }
  const audio = new Audio(`${AUDIO_DIR}/${clip}`);
  audio.playbackRate = slow ? 0.7 : 1;
  playing = audio;
  audio.play().catch(() => synthesize(text, slow));
}

/** Speaks only when sounds are on; for lines the page reads out by itself */
export function speakAuto(text: string) {
  if (!getProgress().muted) speak(text);
}

export function stopSpeaking() {
  playing?.pause();
  playing = null;
  if (hasSynthesis()) window.speechSynthesis.cancel();
}

// The Web Speech recognition API is not in TypeScript's DOM types; only the parts used here
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

export type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function canRecognize() {
  return recognitionConstructor() !== null;
}

/** An English recogniser for one utterance; null where the browser has none */
export function createRecognition(): Recognition | null {
  const Constructor = recognitionConstructor();
  if (!Constructor) return null;
  const recognition = new Constructor();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

let audio: AudioContext | null = null;

function tone(context: AudioContext, frequency: number, start: number, duration: number, type: OscillatorType) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  const at = context.currentTime + start;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.12, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.02);
}

const SOUNDS = {
  correct: [
    [659, 0, 0.12],
    [988, 0.09, 0.22],
  ],
  wrong: [
    [233, 0, 0.18],
    [185, 0.12, 0.3],
  ],
  complete: [
    [523, 0, 0.16],
    [659, 0.12, 0.16],
    [784, 0.24, 0.16],
    [1047, 0.36, 0.4],
  ],
} as const;

export function playSound(kind: keyof typeof SOUNDS) {
  if (getProgress().muted || typeof window === 'undefined' || !('AudioContext' in window)) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
    for (const [frequency, start, duration] of SOUNDS[kind]) {
      tone(audio, frequency, start, duration, kind === 'wrong' ? 'triangle' : 'sine');
    }
  } catch {
    // No audio output; the colours and text still carry the result
  }
}
