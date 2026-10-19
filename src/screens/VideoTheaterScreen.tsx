// src/screens/VideoTheaterScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { YouTubePlayer as YoutubePlayer } from '../components/YouTubePlayer';
import { DreamyBackground } from '../components/DreamyBackground';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { WiseToonVideo } from '../data/videos';
import { RADIUS, SPACING, TYPOGRAPHY, ThemeColors } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoTheater'>;

// Fixed height of each upNext item (72px thumb + 16px padding + 8px border + 16px marginBottom = 112px)
const UP_NEXT_ITEM_HEIGHT = 112;

interface RecommendedItemProps {
  item: WiseToonVideo;
  index: number;
  selected: boolean;
  colors: ThemeColors;
  onSelect: (id: string, index: number) => void;
}

const RecommendedItem: React.FC<RecommendedItemProps> = React.memo(
  ({ item, index, selected, colors, onSelect }) => {
    const pressScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressScale, {
        toValue: 0.95,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
        tension: 110,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onSelect(item.videoId, index)}
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
      </Animated.View>
    );
  }
);

export const VideoTheaterScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, videos, isFavorite, toggleFavorite, requestGate, overlayActive } = useApp();
  const { width: screenWidth } = useWindowDimensions();
  const focused = useIsFocused();

  const [videoId, setVideoId] = useState(route.params.videoId);
  const [isPlaying, setIsPlaying] = useState(true);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  const starScale = useRef(new Animated.Value(1)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const backScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<WiseToonVideo>>(null);

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

  const handleSelectRecommended = useCallback((nextId: string, index: number) => {
    setVideoId(nextId);
    setIsPlaying(true);
    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.2,
    });
  }, []);

  const getRecommendedItemLayout = useCallback(
    (_data: ArrayLike<WiseToonVideo> | null | undefined, index: number) => ({
      length: UP_NEXT_ITEM_HEIGHT,
      offset: UP_NEXT_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderRecommendedItem = useCallback(
    ({ item, index }: { item: WiseToonVideo; index: number }) => (
      <RecommendedItem
        item={item}
        index={index}
        selected={item.videoId === currentVideo?.videoId}
        colors={colors}
        onSelect={handleSelectRecommended}
      />
    ),
    [currentVideo?.videoId, colors, handleSelectRecommended]
  );

  if (!currentVideo) return null;
  const fav = isFavorite(currentVideo.videoId);
  const play = isPlaying && !overlayActive && focused && appActive;

  const handleToggleFav = () => {
    toggleFavorite(currentVideo.videoId);
    starScale.setValue(0.75);
    starRotate.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.spring(starScale, { toValue: 1.38, friction: 3, tension: 160, useNativeDriver: true }),
        Animated.spring(starScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(starRotate, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.timing(starRotate, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(starRotate, { toValue: 0, duration: 90, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const starSpin = starRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
      {/* 1. Header: strictly ABOVE and outside the player */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <Animated.View style={{ transform: [{ scale: backScale }] }}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primaryAccent }]}
            onPressIn={() => Animated.spring(backScale, { toValue: 0.88, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(backScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
            onPress={() => {
              setIsPlaying(false);
              navigation.goBack();
            }}
            accessibilityLabel="Back to Home"
          >
            <Ionicons name="arrow-back" size={32} color={colors.onAccent} />
          </TouchableOpacity>
        </Animated.View>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {currentVideo.title}
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: fav ? colors.starActive : colors.surfaceElevated }]}
          onPress={handleToggleFav}
          accessibilityLabel="Favorite Star"
        >
          <Animated.View style={{ transform: [{ scale: starScale }, { rotate: starSpin }] }}>
            <Ionicons name={fav ? 'star' : 'star-outline'} size={32} color={fav ? colors.onAccent : colors.textPrimary} />
          </Animated.View>
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
        <DreamyBackground scrollY={scrollY} />
        <Text style={[styles.videoTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {currentVideo.title}
        </Text>
        <Text style={[styles.recommendedLabel, { color: colors.textSecondary }]}>
          Recommended
        </Text>

        <Animated.FlatList
          ref={listRef}
          data={videos}
          keyExtractor={(v) => v.videoId}
          renderItem={renderRecommendedItem}
          getItemLayout={getRecommendedItemLayout}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews={Platform.OS !== 'web'}
          contentContainerStyle={{ paddingBottom: SPACING.lg }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScrollToIndexFailed={() => {}}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
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

