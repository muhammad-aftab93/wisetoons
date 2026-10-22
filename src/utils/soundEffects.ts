// src/utils/soundEffects.ts
// Cheerful, kid-friendly sound effects for mini games.
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

let audioInitialized = false;

export async function setupAudioMode(): Promise<void> {
  if (audioInitialized || Platform.OS === 'web') return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioInitialized = true;
  } catch {
    // Non-critical if audio session configuration fails
  }
}

// Helper to get Web Audio Context
function getWebAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/**
 * Web Audio API synthesizers for instant 0ms latency on Web browsers.
 */
function playWebPopSound(): void {
  try {
    const ctx = getWebAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const pitchJitter = Math.random() * 160 - 80;
    osc.frequency.setValueAtTime(820 + pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {}
}

function playWebFlipSound(): void {
  try {
    const ctx = getWebAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}

function playWebMatchSuccessSound(): void {
  try {
    const ctx = getWebAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Note 1: E5 (659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.32, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Note 2: A5 (880Hz) - higher sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.001, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch {}
}

function playWebMatchFailSound(): void {
  try {
    const ctx = getWebAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Boop 1 (340Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(340, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.19);

    // Boop 2 (240Hz, gentle lower drop)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(240, now + 0.1);
    gain2.gain.setValueAtTime(0.001, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.32, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.29);
  } catch {}
}

function playWebVictorySound(): void {
  try {
    const ctx = getWebAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { start: 0.0, freq: 523.25 }, // C5
      { start: 0.1, freq: 659.25 }, // E5
      { start: 0.2, freq: 783.99 }, // G5
      { start: 0.3, freq: 1046.5 }, // C6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.start);
      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(0.28, now + n.start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + 0.36);
    });
  } catch {}
}

/**
 * Universal Native sound player using expo-av.
 */
async function playNativeSound(source: number, volume = 0.9): Promise<void> {
  try {
    await setupAudioMode();
    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true, volume });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {
    // Non-critical fallback
  }
}

/**
 * Balloon pop sound.
 */
export async function playPopSound(): Promise<void> {
  if (Platform.OS === 'web') {
    playWebPopSound();
    return;
  }
  await playNativeSound(require('../../assets/pop.wav'), 0.9);
}

/**
 * Memory card flip sound.
 */
export async function playFlipSound(): Promise<void> {
  if (Platform.OS === 'web') {
    playWebFlipSound();
    return;
  }
  await playNativeSound(require('../../assets/flip.wav'), 0.65);
}

/**
 * Memory match success (right match) cheerful sparkling chime.
 */
export async function playMatchSuccessSound(): Promise<void> {
  if (Platform.OS === 'web') {
    playWebMatchSuccessSound();
    return;
  }
  await playNativeSound(require('../../assets/match.wav'), 0.85);
}

/**
 * Memory match fail (wrong match) soft friendly boop.
 */
export async function playMatchFailSound(): Promise<void> {
  if (Platform.OS === 'web') {
    playWebMatchFailSound();
    return;
  }
  await playNativeSound(require('../../assets/fail.wav'), 0.75);
}

/**
 * Game complete celebratory fanfare.
 */
export async function playVictorySound(): Promise<void> {
  if (Platform.OS === 'web') {
    playWebVictorySound();
    return;
  }
  await playNativeSound(require('../../assets/win.wav'), 0.9);
}

// -------------------------------------------------------------
// Real Animal Sounds (authentic wildlife & farm recordings)
// -------------------------------------------------------------
const ANIMAL_SOUNDS: Record<string, any> = {
  owl: require('../../assets/animals/owl.mp3'),
  lion: require('../../assets/animals/lion.mp3'),
  elephant: require('../../assets/animals/elephant.mp3'),
  bear: require('../../assets/animals/bear.mp3'),
  dog: require('../../assets/animals/dog.mp3'),
  cow: require('../../assets/animals/cow.wav'),
  frog: require('../../assets/animals/frog.wav'),
  dolphin: require('../../assets/animals/dolphin.mp3'),
};

let activeAnimalSound: Audio.Sound | null = null;
let activeWebAudio: HTMLAudioElement | null = null;

/**
 * Stops any currently playing animal audio to avoid overlapping animal sounds.
 */
export async function stopAnimalSound(): Promise<void> {
  if (Platform.OS === 'web' && activeWebAudio) {
    try {
      activeWebAudio.pause();
      activeWebAudio.currentTime = 0;
    } catch {}
    activeWebAudio = null;
  }

  if (activeAnimalSound) {
    try {
      await activeAnimalSound.stopAsync();
      await activeAnimalSound.unloadAsync();
    } catch {}
    activeAnimalSound = null;
  }
}

/**
 * Plays the real, authentic sound effect for a given animal friend.
 */
export async function playAnimalSound(animalId: string, volume = 0.95): Promise<void> {
  const assetSource = ANIMAL_SOUNDS[animalId.toLowerCase()];
  if (!assetSource) return;

  try {
    await stopAnimalSound();
    await setupAudioMode();

    if (Platform.OS === 'web') {
      try {
        const uri =
          typeof assetSource === 'string'
            ? assetSource
            : assetSource?.default || assetSource?.uri;
        if (uri && typeof window !== 'undefined' && window.Audio) {
          const webAudio = new window.Audio(uri);
          webAudio.volume = volume;
          activeWebAudio = webAudio;
          webAudio.onended = () => {
            if (activeWebAudio === webAudio) activeWebAudio = null;
          };
          await webAudio.play();
          return;
        }
      } catch {
        // Fall back to expo-av if HTML5 audio fails
      }
    }

    const { sound } = await Audio.Sound.createAsync(assetSource, {
      shouldPlay: true,
      volume,
    });
    activeAnimalSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (activeAnimalSound === sound) {
          activeAnimalSound = null;
        }
      }
    });
  } catch {
    // Non-critical fallback
  }
}

