/**
 * @fileoverview Text-to-Speech Service
 * @module lib/notes/ai-tts-service
 * @story 44-05: Text-to-speech output block
 * @created 2026-01-14
 */

export interface TTSOptions {
  voice?: string | number;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

let speaking = false;
let paused = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let utteranceQueue: Array<{ text: string; options?: TTSOptions }> = [];
let currentText = '';
let currentPosition = 0;

export async function getVoices(): Promise<TTSVoice[]> {
  if ('speechSynthesis' in window) {
    return new Promise((resolve) => {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        resolve(voices.map(voice => ({
          name: voice.name,
          lang: voice.lang,
          localService: voice.localService,
          default: voice.default,
        })));
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    });
  }
  return Promise.resolve([]);
}

export async function getDefaultVoice(lang: string = 'en-US'): Promise<TTSVoice | null> {
  const voices = await getVoices();
  let voice = voices.find(v => v.lang === lang && v.default);
  if (!voice) {
    const langPrefix = lang.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(langPrefix) && v.localService);
  }
  if (!voice && voices.length > 0) {
    voice = voices.find(v => v.localService) || voices[0];
  }
  return voice || null;
}

export async function speak(text: string, options?: TTSOptions): Promise<void> {
  utteranceQueue.push({ text, options });
  if (!speaking) {
    speaking = true;
    await processQueue();
  }
}

function breakIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

async function processQueue(): Promise<void> {
  if (utteranceQueue.length === 0 || paused) {
    speaking = false;
    currentPosition = 0;
    return;
  }

  const { text, options } = utteranceQueue.shift()!;
  currentText = text;
  currentPosition = 0;

  const chunks = breakIntoChunks(text, 200);
  for (const chunk of chunks) {
    if (paused) {
      utteranceQueue.unshift({ text: text.slice(currentPosition), options });
      return;
    }
    await speakChunk(chunk, options);
    currentPosition += chunk.length;
  }

  await processQueue();
}

async function speakChunk(text: string, options?: TTSOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    if (options) {
      if (options.rate) utterance.rate = Math.max(0.1, Math.min(10, options.rate));
      if (options.pitch) utterance.pitch = Math.max(0, Math.min(2, options.pitch));
      if (options.volume) utterance.volume = Math.max(0, Math.min(1, options.volume));
    }

    const applyVoice = async () => {
      let voice: SpeechSynthesisVoice | undefined;
      if (typeof options?.voice === 'number') {
        const voices = window.speechSynthesis.getVoices();
        voice = voices[options.voice];
      } else if (typeof options?.voice === 'string') {
        const voices = window.speechSynthesis.getVoices();
        voice = voices.find(v => v.name === options.voice);
      }
      if (!voice && options?.lang) {
        voice = window.speechSynthesis.getVoices().find(v => v.lang === options.lang);
      }
      if (voice) {
        utterance.voice = voice;
      }
    };

    applyVoice().catch(() => {});

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      reject(new Error(event.error || 'Speech synthesis error'));
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function pause(): void {
  if (speaking && !paused) {
    paused = true;
    window.speechSynthesis.cancel();
  }
}

export function resume(): void {
  if (paused && utteranceQueue.length > 0) {
    paused = false;
    processQueue().catch(() => {});
  }
}

export function stop(): void {
  utteranceQueue = [];
  paused = false;
  speaking = false;
  window.speechSynthesis.cancel();
  currentUtterance = null;
  currentPosition = 0;
}

export function getPlaybackState(text?: string): { isPlaying: boolean; position: number; length: number } {
  return {
    isPlaying: speaking && !paused,
    position: currentPosition,
    // Use currentText length if available, otherwise use provided text
    length: currentText?.length || text?.length || 0,
  };
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  return speaking && !paused;
}

/**
 * Get current utterance info (for debugging)
 */
export function getCurrentUtteranceInfo(): { hasUtterance: boolean; textLength: number } {
  return {
    hasUtterance: currentUtterance !== null,
    textLength: currentText?.length || 0,
  };
}

export function onPlaybackUpdate(callback: (position: number, isPlaying: boolean) => void): () => void {
  const interval = setInterval(() => {
    callback(currentPosition, speaking && !paused);
  }, 100);
  return () => clearInterval(interval);
}