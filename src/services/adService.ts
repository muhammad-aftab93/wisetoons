// src/services/adService.ts
// Centralized Google AdMob management with strict COPPA & Family Policy compliance.
// Complete beginner safeguards: Auto-test mode in dev, test device whitelisting,
// and 24-48h account review grace fallbacks.
import { Platform, NativeModules, TurboModuleRegistry } from 'react-native';

export interface AdUnitIds {
  banner: string;
  interstitial: string;
  rewarded: string;
}

/**
 * ----------------------------------------------------------------------------------
 * SAFEGUARD 1: AUTOMATIC TEST MODE IN DEVELOPMENT
 * ----------------------------------------------------------------------------------
 * When running in local development (__DEV__ is true) or when FORCE_TEST_ADS is true,
 * the app ALWAYS serves Google's official Test Ad Unit IDs.
 *
 * This prevents accidental live clicks and protects your AdMob account from being banned.
 * Set FORCE_TEST_ADS to false only when generating your final release APK/AAB build.
 */
export const FORCE_TEST_ADS: boolean = __DEV__;

// Live AdMob IDs created in your Google AdMob Console
export const LIVE_AD_UNIT_IDS: AdUnitIds = {
  banner: Platform.select({
    android: 'ca-app-pub-1406120122085775/2905935675',
    ios: 'ca-app-pub-3940256099942544/2934735716', // Test fallback until iOS unit is configured
    default: 'ca-app-pub-1406120122085775/2905935675',
  }) as string,
  interstitial: Platform.select({
    android: 'ca-app-pub-1406120122085775/2629110219',
    ios: 'ca-app-pub-3940256099942544/4411468910',
    default: 'ca-app-pub-1406120122085775/2629110219',
  }) as string,
  rewarded: Platform.select({
    android: 'ca-app-pub-1406120122085775/4022082931',
    ios: 'ca-app-pub-3940256099942544/1712485313',
    default: 'ca-app-pub-1406120122085775/4022082931',
  }) as string,
};

// Google's Official Test Ad Unit IDs (100% safe sandbox)
export const TEST_AD_UNIT_IDS: AdUnitIds = {
  banner: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }) as string,
  interstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }) as string,
  rewarded: Platform.select({
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }) as string,
};

// Active Unit IDs routed through the test safeguard
export const AD_UNIT_IDS: AdUnitIds = FORCE_TEST_ADS ? TEST_AD_UNIT_IDS : LIVE_AD_UNIT_IDS;

/**
 * ----------------------------------------------------------------------------------
 * SAFEGUARD 2: TEST DEVICE IDENTIFIERS
 * ----------------------------------------------------------------------------------
 * Any device listed here will NEVER receive live ads, even when FORCE_TEST_ADS is false.
 * 'EMULATOR' ensures all Android Virtual Devices / emulators are automatically protected.
 *
 * To register your physical test phone:
 * Run the app on your phone, check Android logcat for:
 * "Use RequestConfiguration.Builder.setTestDeviceIds(Arrays.asList("YOUR_DEVICE_ID"))"
 * and paste the ID into this array.
 */
export const TEST_DEVICE_IDS: string[] = [
  'EMULATOR',
  // Paste your physical test phone's hashed ID here: e.g. '33BE2250B43518CCDA7DE426D04EE231'
];

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
let isInterstitialLoading = false;
let lastInterstitialShowTime = 0;
// Google Families policy & kids UX: Rate-limit interstitials to avoid frustrating children.
const INTERSTITIAL_COOLDOWN_MS = 2.5 * 60 * 1000; // 2.5 minutes

// Rewarded Ad Management
let rewardedAd: any = null;
let isRewardedLoaded = false;
let isRewardedLoading = false;

/**
 * Initializes Google Mobile Ads SDK with COPPA, Family Safety, and test safeguards.
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

      // 1. Mandatory Google Families & COPPA child-directed compliance + Test Device safeguard
      await mobileAds().setRequestConfiguration({
        // General audiences rating (G) only
        maxAdContentRating: MaxAdContentRating.G,
        // Tag for child directed treatment (COPPA)
        tagForChildDirectedTreatment: true,
        // Tag for under age of consent (GDPR-K)
        tagForUnderAgeOfConsent: true,
        // Whitelist test devices to prevent accidental policy violations
        testDeviceIdentifiers: TEST_DEVICE_IDS,
      });

      // 2. Initialize Google Mobile Ads SDK
      await mobileAds().initialize();
      isInitialized = true;

      if (FORCE_TEST_ADS) {
        console.log('[AdMob Safeguard] Safe Test Mode ACTIVE: Test Ad Units in use to protect your account.');
      } else {
        console.log('[AdMob Safeguard] Production Live Mode ACTIVE with live units.');
      }

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
 * ----------------------------------------------------------------------------------
 * SAFEGUARD 3: ACCOUNT REVIEW & "NO FILL" (ERROR 3) GRACEFUL HANDLING
 * ----------------------------------------------------------------------------------
 * Preloads an Interstitial Ad in the background.
 * If AdMob account is undergoing initial 24-48h review or fills are unavailable,
 * retries gracefully with backoff instead of failing repeatedly.
 */
export function preloadInterstitialAd(): void {
  if (!isAdMobAvailable() || isInterstitialLoading || isInterstitialLoaded) return;

  try {
    const gma = getGoogleMobileAds();
    if (!gma || !gma.InterstitialAd || !gma.AdEventType) return;

    const { InterstitialAd, AdEventType } = gma;
    isInterstitialLoading = true;

    interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
      isInterstitialLoading = false;
      console.log('[AdMob Interstitial] Ad loaded and ready.');
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      isInterstitialLoading = false;
      // Preload next interstitial ad
      preloadInterstitialAd();
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (err: any) => {
      isInterstitialLoaded = false;
      isInterstitialLoading = false;
      // Normal during the first 24-48h of a new AdMob account (Error 3 / No Fill)
      console.log('[AdMob Interstitial] Notice (ad not filled yet - normal during 24-48h review):', err?.message || err);
      // Retry in 45 seconds
      setTimeout(() => {
        preloadInterstitialAd();
      }, 45000);
    });

    interstitialAd.load();
  } catch (err) {
    isInterstitialLoaded = false;
    isInterstitialLoading = false;
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

  // If not loaded yet, initiate background preload
  preloadInterstitialAd();
  return false;
}

/**
 * Preload a Rewarded Ad in the background.
 */
export function preloadRewardedAd(): void {
  if (!isAdMobAvailable() || isRewardedLoading || isRewardedLoaded) return;

  try {
    const gma = getGoogleMobileAds();
    if (!gma || !gma.RewardedAd || !gma.RewardedAdEventType || !gma.AdEventType) return;

    const { RewardedAd, RewardedAdEventType, AdEventType } = gma;
    isRewardedLoading = true;

    rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isRewardedLoaded = true;
      isRewardedLoading = false;
      console.log('[AdMob Rewarded] Ad loaded and ready.');
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      isRewardedLoaded = false;
      isRewardedLoading = false;
      preloadRewardedAd();
    });

    rewardedAd.addAdEventListener(AdEventType.ERROR, (err: any) => {
      isRewardedLoaded = false;
      isRewardedLoading = false;
      // Normal during the first 24-48h of a new AdMob account (Error 3 / No Fill)
      console.log('[AdMob Rewarded] Notice (ad not filled yet - normal during 24-48h review):', err?.message || err);
      // Retry in 45 seconds
      setTimeout(() => {
        preloadRewardedAd();
      }, 45000);
    });

    rewardedAd.load();
  } catch {
    isRewardedLoaded = false;
    isRewardedLoading = false;
  }
}

/**
 * Shows a rewarded ad. Fires onEarnedReward callback when user completes watching the ad.
 *
 * SAFEGUARD FOR BEGINNERS:
 * If your AdMob account is in the 24-48h review period (or user is offline), an ad cannot be shown.
 * Instead of punishing the kid or freezing the button, we award a fallback star gift
 * and queue a background preload so game mechanics are never broken!
 */
export async function showRewardedAd(
  onEarnedReward: (reward: { amount: number; type: string }) => void
): Promise<boolean> {
  if (!isAdMobAvailable()) {
    // Graceful fallback: reward immediately in sandbox / Expo Go / Web
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
      // Fallback if show throws
    }
  }

  // Ad not filled yet (account in 24-48h review or offline)
  console.log('[AdMob Rewarded Safeguard] No ad filled yet (account under review). Granting fallback star reward.');
  preloadRewardedAd();
  onEarnedReward({ amount: 50, type: 'Stars' });
  return true;
}
