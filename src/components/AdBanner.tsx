// src/components/AdBanner.tsx
// Kid-friendly Google AdMob Banner Ad component with Expo Go & Web fallback.
import React, { useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AD_UNIT_IDS, isAdMobAvailable } from '../services/adService';
import { useApp } from '../context/useAppContext';
import { RADIUS, SPACING } from '../theme/theme';

interface AdBannerProps {
  unitId?: string;
  size?: any;
  style?: StyleProp<ViewStyle>;
  showBadge?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  unitId = AD_UNIT_IDS.banner,
  size,
  style,
  showBadge = true,
}) => {
  const { colors } = useApp();
  const [adFailed, setAdFailed] = useState(false);

  // If running in Web, Expo Go, or native module is not linked in binary, render kid-safe fallback
  if (!isAdMobAvailable() || adFailed) {
    return (
      <View style={[styles.container, style]}>
        {showBadge && (
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Ad • Family Safe</Text>
            </View>
          </View>
        )}
        <View style={[styles.placeholderCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={styles.placeholderEmoji}>⭐</Text>
          <View style={styles.placeholderTextWrap}>
            <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
              WiseToons Kids Sponsor
            </Text>
            <Text style={[styles.placeholderSub, { color: colors.textSecondary }]}>
              Safe family entertainment & fun learning
            </Text>
          </View>
        </View>
      </View>
    );
  }

  try {
    const gma = require('react-native-google-mobile-ads');
    const BannerAd = gma.BannerAd;
    const adSize = size || gma.BannerAdSize?.BANNER || 'BANNER';

    return (
      <View style={[styles.container, style]}>
        {showBadge && (
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Ad • Kid-Safe</Text>
            </View>
          </View>
        )}
        <View style={styles.adWrapper}>
          <BannerAd
            unitId={unitId}
            size={adSize}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(err: any) => {
              console.log('[AdMob Banner] Ad not served (normal during 24-48h account review or low fill):', err?.message || err);
              setAdFailed(true);
            }}
          />
        </View>
      </View>
    );
  } catch (err) {
    console.warn('[AdMob Banner] Error rendering native ad:', err);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
    width: '100%',
  },
  badgeRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  adWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    maxWidth: 360,
    width: '92%',
  },
  placeholderEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  placeholderTextWrap: {
    flex: 1,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  placeholderSub: {
    fontSize: 11,
  },
});
