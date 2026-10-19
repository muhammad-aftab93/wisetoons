// src/screens/ParentDashboardScreen.tsx
// Only reachable through ParentalGateModal (navigation is triggered from the gate's success callback).
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { DreamyBackground } from '../components/DreamyBackground';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentDashboard'>;

export const CHANNEL_URL = 'https://www.youtube.com/@WiseToons_for_Kids';
export const YOUTUBE_TOS_URL = 'https://www.youtube.com/t/terms';
export const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy';
// TODO: replace with the hosted COPPA-compliant app privacy policy before publishing.
export const APP_PRIVACY_URL = 'https://example.com/wisetoons/privacy';

const TIMER_OPTIONS = [0, 15, 30, 45, 60];

const openUrl = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert('Oops', 'Could not open this link.'));

export const ParentDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, sleepMinutes, sleepRemainingMs, setSleepTimer, clearFavorites } = useApp();
  const remainingMin = Math.ceil(sleepRemainingMs / 60000);

  const confirmClear = () =>
    Alert.alert('Clear Saved Favorites?', 'This removes all starred toons from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearFavorites() },
    ]);

  const LinkButton = ({ label, url }: { label: string; url: string }) => (
    <TouchableOpacity
      style={[styles.linkBtn, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
      onPress={() => openUrl(url)}
    >
      <Text style={[styles.linkText, { color: colors.textPrimary }]}>{label} ↗</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <DreamyBackground />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.back, { backgroundColor: colors.primaryAccent }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back to Kids Zone"
        >
          <Ionicons name="arrow-back" size={32} color={colors.onAccent} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Parent Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.lg }}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bedtime Sleep Timer</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {sleepMinutes > 0
              ? `Ollie goes to sleep in about ${remainingMin} min.`
              : 'Off. Pick a time and the video will pause with a goodnight screen.'}
          </Text>
          <View style={styles.pills}>
            {TIMER_OPTIONS.map((m) => {
              const active = m === sleepMinutes;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSleepTimer(m)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? colors.primaryAccent : colors.surfaceElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: active ? colors.onAccent : colors.textPrimary }]}>
                    {m === 0 ? 'Off' : `${m} Mins`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Official Channel</Text>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: colors.secondaryAccent }]}
            onPress={() => openUrl(CHANNEL_URL)}
          >
            <Text style={[styles.ctaText, { color: colors.onAccent }]}>Open WiseToons for Kids on YouTube</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Legal & Data</Text>
          <Text style={[styles.hint, { color: colors.textPrimary }]}>This application uses YouTube API Services.</Text>
          <LinkButton label="YouTube Terms of Service" url={YOUTUBE_TOS_URL} />
          <LinkButton label="Google Privacy Policy" url={GOOGLE_PRIVACY_URL} />
          <LinkButton label="WiseToons App Privacy Policy" url={APP_PRIVACY_URL} />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            No account, ads or analytics. Favorites are stored only on this device.
          </Text>
          <TouchableOpacity style={[styles.cta, { backgroundColor: colors.danger }]} onPress={confirmClear}>
            <Text style={[styles.ctaText, { color: '#fff' }]}>Clear Saved Favorites</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, gap: SPACING.md, borderBottomWidth: 2 },
  back: { width: SPACING.touchMin, height: SPACING.touchMin, borderRadius: SPACING.touchMin / 2, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.title },
  section: { borderRadius: RADIUS.lg, borderWidth: 3, padding: SPACING.md, gap: SPACING.sm },
  sectionTitle: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.title },
  hint: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.sizes.caption + 2 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  pill: { minHeight: 56, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, borderWidth: 3, justifyContent: 'center' },
  pillText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.caption + 2 },
  cta: { minHeight: 60, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.md },
  ctaText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.subtitle - 2, textAlign: 'center' },
  linkBtn: { minHeight: 52, borderRadius: RADIUS.sm, borderWidth: 2, justifyContent: 'center', paddingHorizontal: SPACING.md },
  linkText: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.sizes.caption + 2 },
});

