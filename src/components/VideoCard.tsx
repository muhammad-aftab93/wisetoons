// src/components/VideoCard.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { USE_NATIVE_DRIVER } from '../utils/animation';
import { WiseToonVideo, timeAgo } from '../data/videos';
import { useApp, ViewMode } from '../context/AppContext';

interface Props {
  video: WiseToonVideo;
  onPress?: () => void;
  onPlay?: (videoId: string) => void;
  variant?: ViewMode;
}

export const VideoCard: React.FC<Props> = React.memo(({ video, onPress, onPlay, variant = 'grid' }) => {
  const { colors, isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(video.videoId);

  const handlePress = () => {
    if (onPlay) {
      onPlay(video.videoId);
    } else if (onPress) {
      onPress();
    }
  };

  const pressScale = useRef(new Animated.Value(1)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const playPulse = useRef(new Animated.Value(1)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const starRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(playPulse, { toValue: 1.14, duration: 950, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(playPulse, { toValue: 1, duration: 950, useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [enterAnim, playPulse]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.93,
      friction: 6,
      tension: 140,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 110,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(video.videoId);
    starScale.setValue(0.75);
    starRotate.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.spring(starScale, {
          toValue: 1.4,
          friction: 3,
          tension: 160,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(starScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
      Animated.sequence([
        Animated.timing(starRotate, { toValue: -1, duration: 90, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(starRotate, { toValue: 1, duration: 120, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(starRotate, { toValue: 0, duration: 90, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
    ]).start();
  };

  const starSpin = starRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  const cardScale = Animated.multiply(
    pressScale,
    enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
  );

  if (variant === 'list') {
    const snippet = video.lyricsOrStory?.[0]?.replace(/\s+/g, ' ').trim();
    return (
      <Animated.View
        style={[
          styles.listCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            opacity: enterAnim,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`Play ${video.title}`}
          style={styles.listMain}
        >
          <View style={[styles.listThumbWrap, { borderColor: colors.cardBorder }]}>
            <Image
              source={{ uri: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <Animated.View style={[styles.playBadge, { transform: [{ scale: playPulse }] }]}>
              <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
            </Animated.View>
            {!!video.duration && (
              <View style={styles.duration}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            )}
          </View>

          <View style={styles.listInfo}>
            <Text style={[styles.listTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={[styles.listMeta, { color: colors.textSecondary }]} numberOfLines={1}>
              {video.isShort ? 'Short · ' : ''}{timeAgo(video.publishedAt)}
            </Text>
            {!!snippet && (
              <Text style={[styles.listSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                {snippet}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Remove from starred' : 'Add to starred'}
          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
          style={[
            styles.listStar,
            { backgroundColor: fav ? colors.starActive : colors.surfaceElevated },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: starScale }, { rotate: starSpin }] }}>
            <Ionicons
              name={fav ? 'star' : 'star-outline'}
              size={20}
              color={fav ? colors.onAccent : colors.textPrimary}
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: enterAnim,
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Play ${video.title}`}
      >
        <View style={[styles.thumbWrap, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Image
            source={{ uri: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <Animated.View style={[styles.playBadge, { transform: [{ scale: playPulse }] }]}>
            <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
          </Animated.View>
          {!!video.duration && (
            <View style={styles.duration}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Star sits on the thumbnail corner, outside the touch area of the card itself. */}
      <TouchableOpacity
        onPress={handleToggleFavorite}
        accessibilityRole="button"
        accessibilityLabel={fav ? 'Remove from starred' : 'Add to starred'}
        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
        style={[styles.star, { backgroundColor: fav ? colors.starActive : 'rgba(0,0,0,0.55)' }]}
      >
        <Animated.View style={{ transform: [{ scale: starScale }, { rotate: starSpin }] }}>
          <Ionicons name={fav ? 'star' : 'star-outline'} size={16} color={fav ? colors.onAccent : '#fff'} />
        </Animated.View>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {video.title}
      </Text>
      <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
        {video.isShort ? 'Short · ' : ''}{timeAgo(video.publishedAt)}
      </Text>
    </Animated.View>
  );
});

export const ViewModeToggle: React.FC = () => {
  const { colors, viewMode, setViewMode } = useApp();
  return (
    <View
      style={[
        styles.viewToggle,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      <TouchableOpacity
        onPress={() => setViewMode('grid')}
        accessibilityRole="button"
        accessibilityLabel="Cards view"
        style={[
          styles.viewToggleBtn,
          viewMode === 'grid' && { backgroundColor: colors.primaryAccent },
        ]}
      >
        <Ionicons
          name="grid"
          size={16}
          color={viewMode === 'grid' ? colors.onAccent : colors.textSecondary}
        />
        <Text
          style={[
            styles.viewToggleText,
            { color: viewMode === 'grid' ? colors.onAccent : colors.textSecondary },
          ]}
        >
          Cards
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setViewMode('list')}
        accessibilityRole="button"
        accessibilityLabel="Detail list view"
        style={[
          styles.viewToggleBtn,
          viewMode === 'list' && { backgroundColor: colors.primaryAccent },
        ]}
      >
        <Ionicons
          name="list"
          size={18}
          color={viewMode === 'list' ? colors.onAccent : colors.textSecondary}
        />
        <Text
          style={[
            styles.viewToggleText,
            { color: viewMode === 'list' ? colors.onAccent : colors.textSecondary },
          ]}
        >
          List
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const VideoCardSkeleton: React.FC = () => {
  const { colors } = useApp();
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={[styles.thumbWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }]} />
      <View style={[styles.skelLine, { backgroundColor: colors.surfaceElevated, width: '80%' }]} />
      <View style={[styles.skelLine, { backgroundColor: colors.surfaceElevated, width: '40%', height: 12 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: SPACING.md },
  thumbWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 3,
  },
  thumb: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  durationText: { color: '#fff', fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 10 },
  star: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  category: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  skelLine: { height: 12, borderRadius: 6, marginTop: 6, marginHorizontal: 2 },
  // Detail List Row styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  listMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  listThumbWrap: {
    width: 148,
    aspectRatio: 16 / 9,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: '#000',
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  listTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  listMeta: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 11,
  },
  listSnippet: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    opacity: 0.85,
  },
  listStar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Segmented Cards / List toggle
  viewToggle: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  viewToggleText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
  },
});
