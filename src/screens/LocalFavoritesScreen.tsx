// src/screens/LocalFavoritesScreen.tsx
import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { VideoCard, ViewModeToggle } from '../components/VideoCard';
import { Ollie } from '../components/Ollie';
import { DreamyBackground } from '../components/DreamyBackground';
import { WiseToonVideo } from '../data/videos';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LocalFavorites'>;

export const LocalFavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, viewMode = 'grid', favoriteVideos = [] } = useApp();
  const { width } = useWindowDimensions();
  const gridColumns = width >= 900 ? 4 : 3;
  const columns = viewMode === 'list' ? 1 : gridColumns;
  const gap = SPACING.md;
  const cardWidth =
    viewMode === 'list'
      ? width - SPACING.md * 2
      : Math.floor((width - SPACING.md * 2 - gap * (gridColumns - 1)) / gridColumns);
  const starred = favoriteVideos;
  const scrollY = useRef(new Animated.Value(0)).current;

  const handlePlayVideo = useCallback(
    (videoId: string) => {
      navigation.navigate('VideoTheater', { videoId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: WiseToonVideo }) => (
      <View style={{ width: cardWidth }}>
        <VideoCard video={item} variant={viewMode} onPlay={handlePlayVideo} />
      </View>
    ),
    [cardWidth, viewMode, handlePlayVideo]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <DreamyBackground scrollY={scrollY} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.back, { backgroundColor: colors.primaryAccent }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={32} color={colors.onAccent} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          My Starred Toons
        </Text>
        <ViewModeToggle />
      </View>

      {starred.length === 0 ? (
        <View style={styles.empty}>
          <Ollie size={160} accessory="🔍" />
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Tap the star on any toon to save it here!</Text>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: colors.secondaryAccent }]}
            onPress={() => navigation.navigate('HomeHub')}
          >
            <Text style={[styles.ctaText, { color: colors.onAccent }]}>Explore Stories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          key={`${viewMode}-${columns}`}
          data={starred}
          numColumns={columns}
          keyExtractor={(v) => v.videoId}
          contentContainerStyle={{ padding: SPACING.md }}
          columnWrapperStyle={columns > 1 ? { gap } : undefined}
          renderItem={renderItem}
          initialNumToRender={columns * 3}
          maxToRenderPerBatch={columns * 2}
          windowSize={5}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews={Platform.OS !== 'web'}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, gap: SPACING.sm, borderBottomWidth: 2 },
  back: { width: SPACING.touchMin, height: SPACING.touchMin, borderRadius: SPACING.touchMin / 2, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.title },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.title, textAlign: 'center', marginVertical: SPACING.lg },
  cta: { height: 68, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.pill, justifyContent: 'center' },
  ctaText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.title },
});
