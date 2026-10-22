// src/utils/speechService.ts
// Natural, warm, friendly human speech synthesis tailored for kids learning.
import * as Speech from 'expo-speech';

let preferredVoiceIdentifier: string | undefined = undefined;
let isVoiceInitialized = false;

// High quality warm human voices across iOS, Android, and Web
const PREFERRED_VOICES = [
  'Samantha',
  'Ava',
  'Nicky',
  'Karen',
  'Allison',
  'Google US English',
  'en-us-x-sfg#female_1',
  'en-us-x-tpd#female_1',
  'en-US-language',
  'Microsoft Jenny',
  'Microsoft Zira',
  'en-US',
];

export async function initSpeechService(): Promise<void> {
  if (isVoiceInitialized) return;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (voices && voices.length > 0) {
      for (const pref of PREFERRED_VOICES) {
        const found = voices.find(
          (v) =>
            v.name?.toLowerCase().includes(pref.toLowerCase()) ||
            v.identifier?.toLowerCase().includes(pref.toLowerCase())
        );
        if (found) {
          preferredVoiceIdentifier = found.identifier;
          break;
        }
      }

      if (!preferredVoiceIdentifier) {
        const enVoice =
          voices.find(
            (v) =>
              v.language?.startsWith('en') &&
              (v.quality === Speech.VoiceQuality.Enhanced || v.name?.toLowerCase().includes('female'))
          ) || voices.find((v) => v.language?.startsWith('en'));
        if (enVoice) {
          preferredVoiceIdentifier = enVoice.identifier;
        }
      }
    }
    isVoiceInitialized = true;
  } catch {
    // Fallback to system default
  }
}

export interface SpeakOptions {
  onStart?: () => void;
  onDone?: () => void;
  rate?: number;
  pitch?: number;
}

/**
 * Speaks text using a warm, smiling, friendly preschool-teacher voice cadence.
 */
export async function speakFriendly(text: string, options?: SpeakOptions): Promise<void> {
  try {
    await Speech.stop();
    await initSpeechService();

    // Rate 0.85 = relaxed, easy for children to articulate and comprehend
    // Pitch 1.12 = cheerful, welcoming, warm human tone
    Speech.speak(text, {
      language: 'en-US',
      pitch: options?.pitch ?? 1.12,
      rate: options?.rate ?? 0.85,
      voice: preferredVoiceIdentifier,
      onStart: options?.onStart,
      onDone: options?.onDone,
      onStopped: options?.onDone,
      onError: () => options?.onDone?.(),
    });
  } catch {
    options?.onDone?.();
  }
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {}
}
