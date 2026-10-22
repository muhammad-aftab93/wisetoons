// src/services/adService.web.ts
// Web fallback implementation for Google AdMob (zero native dependencies).

export interface AdUnitIds {
  banner: string;
  interstitial: string;
  rewarded: string;
}

export const AD_UNIT_IDS: AdUnitIds = {
  banner: 'web-banner-placeholder',
  interstitial: 'web-interstitial-placeholder',
  rewarded: 'web-rewarded-placeholder',
};

export function isAdMobAvailable(): boolean {
  return false;
}

export async function initializeAdMob(): Promise<void> {
  // No-op on web
  return Promise.resolve();
}

export function preloadInterstitialAd(): void {
  // No-op on web
}

export async function showInterstitialIfAllowed(): Promise<boolean> {
  // No-op on web
  return Promise.resolve(false);
}

export function preloadRewardedAd(): void {
  // No-op on web
}

export async function showRewardedAd(
  onEarnedReward: (reward: { amount: number; type: string }) => void
): Promise<boolean> {
  // Web preview: immediately grant reward for testing
  onEarnedReward({ amount: 50, type: 'Stars' });
  return Promise.resolve(true);
}
