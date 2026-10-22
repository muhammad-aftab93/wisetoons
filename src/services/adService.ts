// src/services/adService.ts
// Centralized Google AdMob management with strict COPPA & Family Policy compliance.
// Safely guarded for Expo Go, Web, and native production builds.
import { Platform, NativeModules, TurboModuleRegistry } from 'react-native';

export interface AdUnitIds {
  banner: string;
  interstitial: string;
  rewarded: string;
}

// Google Official Test Ad Unit IDs by default (safe for sandbox testing).
// Replace with live AdMob Unit IDs from Google AdMob console when publishing.
export const AD_UNIT_IDS: AdUnitIds = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }) as string,
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }) as string,
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }) as string,
};

/**
 * Checks whether the native Google Mobile Ads SDK module is linked in the running binary.
 * In Expo Go, Web, or standard simulator runs before prebuild, this returns false
 * to prevent TurboModuleRegistry.getEnforcing crashes.
 */
export function isAdMobAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    const turbo = (TurboModuleRegistry as any)?.get?.('RNGoogleMobileAdsModule');
    if (turbo) return true;
    if (NativeModules && NativeModules.RNGoogleMobileAdsModule) return true;
    return false;
  } catch {
    return false;
  }
}

function getGoogleMobileAds() {
  if (!isAdMobAvailable()) return null;
  try {
    return require('react-native-google-mobile-ads');
  } catch {
    return null;
  }
}

let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Interstitial Ad Management
let interstitialAd: any = null;
let isInterstitialLoaded = false;
let lastInterstitialShowTime = 0;
// Google Families policy & kids UX: Rate-limit interstitials to avoid frustrating children.
const INTERSTITIAL_COOLDOWN_MS = 2.5 * 60 * 1000; // 2.5 minutes

// Rewarded Ad Management
let rewardedAd: any = null;
let isRewardedLoaded = false;

/**
 * Initializes Google Mobile Ads SDK with COPPA and Family Safety configuration.
 */
export async function initializeAdMob(): Promise<void> {
  if (!isAdMobAvailable()) return;
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const gma = getGoogleMobileAds();
      if (!gma) return;

      const mobileAds = gma.default || gma;
      const MaxAdContentRating = gma.MaxAdContentRating || { G: 'G' };

      // 1. Mandatory Google Families & COPPA child-directed compliance
      await mobileAds().setRequestConfiguration({
        // General audiences rating (G) only
        maxAdContentRating: MaxAdContentRating.G,
        // Tag for child directed treatment (COPPA)
        tagForChildDirectedTreatment: true,
        // Tag for under age of consent (GDPR-K)
        tagForUnderAgeOfConsent: true,
      });

      // 2. Initialize Google Mobile Ads SDK
      await mobileAds().initialize();
      isInitialized = true;

      // 3. Preload full-screen ads for smooth transitions
      preloadInterstitialAd();
      preloadRewardedAd();
    } catch (err) {
      console.warn('[AdMob] Initialization notice:', err);
    }
  })();

  return initPromise;
}

/**
 * Preload an Interstitial Ad in the background.
 */
export function preloadInterstitialAd(): void {
  if (!isAdMobAvailable()) return;

  try {
    const gma = getGoogleMobileAds();
    if (!gma || !gma.InterstitialAd || !gma.AdEventType) return;

    const { InterstitialAd, AdEventType } = gma;

    interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      // Preload next interstitial ad
      preloadInterstitialAd();
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
      isInterstitialLoaded = false;
    });

    interstitialAd.load();
  } catch {
    isInterstitialLoaded = false;
  }
}

/**
 * Shows an interstitial ad if ready and cooldown period has elapsed.
 * Returns true if an ad was displayed, false otherwise.
 */
export async function showInterstitialIfAllowed(): Promise<boolean> {
  if (!isAdMobAvailable()) return false;

  const now = Date.now();
  if (now - lastInterstitialShowTime < INTERSTITIAL_COOLDOWN_MS) {
    return false;
  }

  if (interstitialAd && isInterstitialLoaded) {
    try {
      await interstitialAd.show();
      lastInterstitialShowTime = Date.now();
      isInterstitialLoaded = false;
      return true;
    } catch {
      return false;
    }
  }

  if (!interstitialAd || !isInterstitialLoaded) {
    preloadInterstitialAd();
  }
  return false;
}

/**
 * Preload a Rewarded Ad in the background.
 */
export function preloadRewardedAd(): void {
  if (!isAdMobAvailable()) return;

  try {
    const gma = getGoogleMobileAds();
    if (!gma || !gma.RewardedAd || !gma.RewardedAdEventType || !gma.AdEventType) return;

    const { RewardedAd, RewardedAdEventType, AdEventType } = gma;

    rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isRewardedLoaded = true;
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      isRewardedLoaded = false;
      preloadRewardedAd();
    });

    rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
      isRewardedLoaded = false;
    });

    rewardedAd.load();
  } catch {
    isRewardedLoaded = false;
  }
}

/**
 * Shows a rewarded ad. Fires onEarnedReward callback when user completes watching the ad.
 */
export async function showRewardedAd(
  onEarnedReward: (reward: { amount: number; type: string }) => void
): Promise<boolean> {
  if (!isAdMobAvailable()) {
    // Graceful fallback: reward immediately in sandbox/Expo Go
    onEarnedReward({ amount: 50, type: 'Stars' });
    return true;
  }

  if (rewardedAd && isRewardedLoaded) {
    try {
      const gma = getGoogleMobileAds();
      const RewardedAdEventType = gma?.RewardedAdEventType;
      if (RewardedAdEventType) {
        const unsubscribe = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            onEarnedReward(reward || { amount: 50, type: 'Stars' });
            if (typeof unsubscribe === 'function') unsubscribe();
          }
        );
      }
      await rewardedAd.show();
      isRewardedLoaded = false;
      return true;
    } catch {
      return false;
    }
  }

  if (!rewardedAd || !isRewardedLoaded) {
    preloadRewardedAd();
  }
  return false;
}
