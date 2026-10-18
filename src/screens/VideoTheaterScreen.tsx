// src/screens/VideoTheaterScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, AppState, AppStateStatus,
  useWindowDimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { YouTubePlayer as YoutubePlayer } from '../components/YouTubePlayer';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoTheater'>;

export const VideoTheaterScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, videos, isFavorite, toggleFavorite, requestGate, overlayActive } = useApp();
  const { width: screenWidth } = useWindowDimensions();
  const focused = useIsFocused();

  const [videoId, setVideoId] = useState(route.params.videoId);
  const [isPlaying, setIsPlaying] = useState(true);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  const currentVideo = videos.find((v) => v.videoId === videoId) ?? videos[0];
  // Strict 16:9, never below YouTube's 200px minimum.
  const playerHeight = Math.max(200, Math.round((screenWidth * 9) / 16));

  // No background playback: pause when app leaves foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      setAppActive(s === 'active');
      if (s !== 'active') setIsPlaying(false);
    });
    return () => sub.remove();
  }, []);

  // Pause when any modal (parental gate / sleep overlay) covers the player or screen loses focus.
  useEffect(() => {
    if (overlayActive || !focused) setIsPlaying(false);
  }, [overlayActive, focused]);

  const onPlayerStateChange = useCallback((state: string) => {
    if (state === 'playing') setIsPlaying(true);
    else if (state === 'paused' || state === 'ended') setIsPlaying(false);
  }, []);

  if (!currentVideo) return null;
  const fav = isFavorite(currentVideo.videoId);
  const play = isPlaying && !overlayActive && focused && appActive;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
      {/* 1. Header: strictly ABOVE and outside the player */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primaryAccent }]}
          onPress={() => {
            setIsPlaying(false);
            navigation.goBack();
          }}
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={32} color={colors.onAccent} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {currentVideo.title}
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: fav ? colors.starActive : colors.surfaceElevated }]}
          onPress={() => toggleFavorite(currentVideo.videoId)}
          accessibilityLabel="Favorite Star"
        >
          <Ionicons name={fav ? 'star' : 'star-outline'} size={32} color={fav ? colors.onAccent : colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 2. YouTube viewport: no siblings overlap, no border radius, no overlays */}
      <View style={{ width: screenWidth, height: playerHeight, backgroundColor: colors.playerFrameBg }}>
        <YoutubePlayer
          height={playerHeight}
          width={screenWidth}
          play={play}
          videoId={currentVideo.videoId}
          onChangeState={onPlayerStateChange}
        />
      </View>

      {/* 3. Recommended videos panel */}
      <View style={styles.panel}>
        <Text style={[styles.videoTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {currentVideo.title}
        </Text>
        <Text style={[styles.recommendedLabel, { color: colors.textSecondary }]}>
          Recommended
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: SPACING.lg }} showsVerticalScrollIndicator={false}>
          {videos.map((item) => {
            const selected = item.videoId === currentVideo.videoId;
            return (
              <TouchableOpacity
                key={item.videoId}
                activeOpacity={0.85}
                onPress={() => {
                  setVideoId(item.videoId);
                  setIsPlaying(true);
                }}
                style={[
                  styles.upNext,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.primaryAccent : colors.cardBorder,
                  },
                ]}
              >
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` }}
                  style={styles.thumb}
                />
                <Text style={[styles.upNextTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.parents}
        onPress={() => requestGate(() => navigation.navigate('ParentDashboard'))}
        accessibilityLabel="Parents Lock"
      >
        <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
        <Text style={[styles.parentsText, { color: colors.textSecondary }]}>Parents</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 2,
  },
  btn: { width: SPACING.touchMin, height: SPACING.touchMin, borderRadius: SPACING.touchMin / 2, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 30 },
  title: { flex: 1, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.subtitle },
  panel: { flex: 1, paddingTop: SPACING.sm, paddingHorizontal: SPACING.md },
  videoTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: SPACING.xs,
    paddingHorizontal: 2,
  },
  recommendedLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 13,
    marginBottom: SPACING.xs,
    paddingHorizontal: 2,
  },
  upNext: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 4, padding: SPACING.xs, marginBottom: SPACING.md },
  thumb: { width: 128, aspectRatio: 16 / 9, borderRadius: RADIUS.sm },
  upNextTitle: { flex: 1, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.body },
  parents: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, justifyContent: 'center', paddingHorizontal: SPACING.md },
  parentsText: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.sizes.caption, opacity: 0.8 },
});

