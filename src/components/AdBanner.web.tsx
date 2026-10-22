// src/components/AdBanner.web.tsx
// Web implementation for AdBanner: zero native code, completely safe for web bundlers.
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useApp } from '../context/useAppContext';
import { RADIUS, SPACING } from '../theme/theme';

interface AdBannerProps {
  unitId?: string;
  size?: any;
  style?: StyleProp<ViewStyle>;
  showBadge?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  style,
  showBadge = true,
}) => {
  const { colors } = useApp();

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
