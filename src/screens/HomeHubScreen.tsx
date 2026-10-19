import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { VideoCard, VideoCardSkeleton, ViewModeToggle } from '../components/VideoCard';
import { Ollie } from '../components/Ollie';
import { DreamyBackground } from '../components/DreamyBackground';
import { ALL_SECTION_ID, CatalogSection, DEFAULT_CHANNEL_LOGO_URL } from '../data/videos';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeHub'>;

const TINTS = ['#FFE082', '#B8E8FC', '#C8F7DC', '#FFD1DC', '#E0C8FF', '#FFD8BE'];
const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@WiseToons_for_Kids?sub_confirmation=1';
const YOUTUBE_APP_IOS_URL = 'youtube://www.youtube.com/@WiseToons_for_Kids?sub_confirmation=1';
const YOUTUBE_APP_ANDROID_URL = 'vnd.youtube://www.youtube.com/@WiseToons_for_Kids?sub_confirmation=1';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

function getSectionIcon(section: CatalogSection): MaterialIconName {
  if (section.kind === 'all') return 'grid-view';
  if (section.kind === 'videos') return 'smart-display';
  if (section.kind === 'shorts') return 'bolt';

  const title = section.title.toLowerCase();
  if (/rhym|song|music|sing|nursery/.test(title)) return 'music-note';
  if (/bedtime|sleep|night/.test(title)) return 'bedtime';
  if (/story|stories|tale|moral|book/.test(title)) return 'auto-stories';
  if (/abc|count|learn|number/.test(title)) return 'school';
  return 'video-library';
}

interface CategoryTileProps {
  section: CatalogSection;
  tint: string;
  selected: boolean;
  borderColor: string;
  onPress: () => void;
}

const CategoryTile: React.FC<CategoryTileProps> = React.memo(
  ({ section, tint, selected, borderColor, onPress }) => {
    const pressScale = useRef(new Animated.Value(1)).current;
    const selectScale = useRef(new Animated.Value(selected ? 1.05 : 1)).current;
    const selectLift = useRef(new Animated.Value(selected ? -4 : 0)).current;
    const iconWiggle = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(selectScale, {
          toValue: selected ? 1.05 : 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(selectLift, {
          toValue: selected ? -4 : 0,
          friction: 5,
          tension: 110,
          useNativeDriver: true,
        }),
      ]).start();

      if (selected) {
        iconWiggle.setValue(0);
        Animated.sequence([
          Animated.timing(iconWiggle, { toValue: -1, duration: 90, useNativeDriver: true }),
          Animated.timing(iconWiggle, { toValue: 1, duration: 130, useNativeDriver: true }),
          Animated.timing(iconWiggle, { toValue: -0.6, duration: 100, useNativeDriver: true }),
          Animated.timing(iconWiggle, { toValue: 0, duration: 90, useNativeDriver: true }),
        ]).start();
      }
    }, [selected, selectScale, selectLift, iconWiggle]);

    const handlePressIn = () => {
      Animated.spring(pressScale, {
        toValue: 0.9,
        friction: 5,
        tension: 150,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }).start();
    };

    const iconRotate = iconWiggle.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-16deg', '0deg', '16deg'],
    });

    return (
      <Animated.View
        style={{
          transform: [
            { translateY: selectLift },
            { scale: Animated.multiply(pressScale, selectScale) },
          ],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={section.title}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.tile,
            {
              backgroundColor: tint,
              borderColor: selected ? borderColor : 'transparent',
              opacity: selected ? 1 : 0.88,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
            <MaterialIcons name={getSectionIcon(section)} size={30} color="#1D3557" />
          </Animated.View>
          <Text style={styles.tileText} numberOfLines={2}>
            {section.title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export const HomeHubScreen: React.FC<Props> = ({ navigation }) => {
  const {
    colors,
    mode,
    toggleTheme,
    viewMode = 'grid',
    selectedSectionId = ALL_SECTION_ID,
    setSelectedSectionId,
    channelLogoUrl = DEFAULT_CHANNEL_LOGO_URL,
    videos = [],
    sections = [],
    catalogLoading,
    catalogError,
    reloadCatalog,
    favorites = [],
    requestGate,
  } = useApp();
  const { width } = useWindowDimensions();
  const gridColumns = width >= 900 ? 4 : 3;
  const columns = viewMode === 'list' ? 1 : gridColumns;
  const compact = width < 520;
  const narrow = width < 340;
  const gap = SPACING.md;
  const cardWidth =
    viewMode === 'list'
      ? width - SPACING.md * 2
      : Math.floor((width - SPACING.md * 2 - gap * (gridColumns - 1)) / gridColumns);

  // Gentle rocking animation for the channel mascot logo
  const logoRock = useRef(new Animated.Value(0)).current;
  // Bouncy animation for the top-bar Favorites star & theme toggle
  const headerStarScale = useRef(new Animated.Value(1)).current;
  const themePop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoRock, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoRock, {
          toValue: -1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [logoRock]);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(headerStarScale, { toValue: 1.35, friction: 3, tension: 160, useNativeDriver: true }),
      Animated.spring(headerStarScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [favorites.length, headerStarScale]);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
    themePop.setValue(0.8);
    Animated.spring(themePop, {
      toValue: 1,
      friction: 3,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [toggleTheme, themePop]);

  const logoRotate = logoRock.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  const handleSubscribe = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const canOpenIosApp = await Linking.canOpenURL(YOUTUBE_APP_IOS_URL);
        if (canOpenIosApp) {
          await Linking.openURL(YOUTUBE_APP_IOS_URL);
          return;
        }
      } else if (Platform.OS === 'android') {
        const canOpenAndroidApp = await Linking.canOpenURL(YOUTUBE_APP_ANDROID_URL);
        if (canOpenAndroidApp) {
          await Linking.openURL(YOUTUBE_APP_ANDROID_URL);
          return;
        }
      }
      await Linking.openURL(YOUTUBE_SUBSCRIBE_URL);
    } catch {
      await Linking.openURL(YOUTUBE_SUBSCRIBE_URL).catch(() => {});
    }
  }, []);

  const active = sections.find((s) => s.id === selectedSectionId) ?? sections[0];

  const shown = useMemo(() => {
    if (!active || !Array.isArray(active.videoIds)) return videos;
    const byId = new Map(videos.map((v) => [v.videoId, v]));
    return active.videoIds.map((id) => byId.get(id)).filter((v): v is NonNullable<typeof v> => !!v);
  }, [active, videos]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<typeof shown[number]>>(null);
  const categoryListRef = useRef<FlatList<CatalogSection>>(null);

  const handleSelectSection = useCallback(
    (sectionId: string, index: number) => {
      setSelectedSectionId(sectionId);
      categoryListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [setSelectedSectionId]
  );

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handlePlayVideo = useCallback(
    (videoId: string) => {
      navigation.navigate('VideoTheater', { videoId });
    },
    [navigation]
  );

  const getCategoryItemLayout = useCallback(
    (_data: ArrayLike<CatalogSection> | null | undefined, index: number) => {
      const itemSpan = 108 + SPACING.sm;
      return {
        length: 108,
        offset: itemSpan * index,
        index,
      };
    },
    []
  );

  const renderCategoryItem = useCallback(
    ({ item: s, index: i }: { item: CatalogSection; index: number }) => (
      <CategoryTile
        section={s}
        tint={TINTS[i % TINTS.length]}
        selected={s.id === active?.id}
        borderColor={colors.textPrimary}
        onPress={() => handleSelectSection(s.id, i)}
      />
    ),
    [active?.id, colors.textPrimary, handleSelectSection]
  );

  const renderVideoItem = useCallback(
    ({ item }: { item: typeof shown[number] }) => (
      <View style={{ width: cardWidth }}>
        <VideoCard video={item} variant={viewMode} onPlay={handlePlayVideo} />
      </View>
    ),
    [cardWidth, viewMode, handlePlayVideo]
  );

  const scrollTopScale = scrollY.interpolate({
    inputRange: [180, 280],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const header = useMemo(
    () => (
      <View>
        {sections.length > 1 && (
          <FlatList
            ref={categoryListRef}
            data={sections}
            horizontal
            keyExtractor={(s) => s.id}
            renderItem={renderCategoryItem}
            getItemLayout={getCategoryItemLayout}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={108 + SPACING.sm}
            snapToAlignment="start"
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            contentContainerStyle={styles.tileRow}
            style={styles.tileScroll}
            onScrollToIndexFailed={() => {}}
          />
        )}

        {!!active && (
          <View style={styles.sectionRow}>
            <Text style={[styles.section, { color: colors.textPrimary }]} numberOfLines={1}>
              {active.kind === 'all' ? 'Recent' : active.title}
            </Text>
            <ViewModeToggle />
          </View>
        )}
      </View>
    ),
    [sections, renderCategoryItem, getCategoryItemLayout, active, colors.textPrimary]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <DreamyBackground scrollY={scrollY} />
      <View
        style={[
          styles.topBar,
          compact && styles.topBarCompact,
          narrow && styles.topBarNarrow,
          { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder },
        ]}
      >
        <View style={[styles.logoWrap, compact && styles.logoWrapCompact, narrow && styles.logoWrapNarrow]}>
          <Animated.Image
            source={{ uri: channelLogoUrl }}
            style={[
              styles.channelLogo,
              { borderColor: colors.primaryAccent, transform: [{ rotate: logoRotate }] },
            ]}
            resizeMode="cover"
          />
          {!compact && (
            <Text style={[styles.logoText, { color: colors.textPrimary }]} numberOfLines={1}>
              WiseToons
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSubscribe}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Subscribe to WiseToons for Kids on YouTube"
            style={[styles.subscribeBtn, compact && styles.subscribeBtnCompact, narrow && styles.subscribeBtnNarrow]}
          >
            <Ionicons name="logo-youtube" size={16} color="#FFFFFF" />
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actions, compact && styles.actionsCompact]}>
          <TouchableOpacity
            onPress={handleToggleTheme}
            accessibilityRole="switch"
            accessibilityLabel={mode === 'day' ? 'Switch to Bedtime' : 'Switch to Playtime'}
            style={[
              styles.toggle,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder },
            ]}
          >
            <Animated.View
              style={[
                styles.toggleHalf,
                narrow && styles.toggleHalfNarrow,
                mode === 'day' && { backgroundColor: colors.primaryAccent, transform: [{ scale: themePop }] },
              ]}
            >
              <Ionicons name="sunny" size={16} color={mode === 'day' ? colors.onAccent : colors.textSecondary} />
            </Animated.View>
            <Animated.View
              style={[
                styles.toggleHalf,
                narrow && styles.toggleHalfNarrow,
                mode === 'night' && { backgroundColor: colors.primaryAccent, transform: [{ scale: themePop }] },
              ]}
            >
              <Ionicons name="moon" size={15} color={mode === 'night' ? colors.onAccent : colors.textSecondary} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, compact && styles.iconBtnCompact, narrow && styles.iconBtnNarrow]}
            accessibilityRole="button"
            accessibilityLabel="My Starred Toons"
            onPress={() => navigation.navigate('LocalFavorites')}
          >
            <Animated.View style={{ transform: [{ scale: headerStarScale }] }}>
              <Ionicons name={favorites.length ? 'star' : 'star-outline'} size={24} color={colors.starActive} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, compact && styles.iconBtnCompact, narrow && styles.iconBtnNarrow]}
            accessibilityRole="button"
            accessibilityLabel="Parents"
            onPress={() => requestGate(() => navigation.navigate('ParentDashboard'))}
          >
            <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
            <Text style={[styles.lockText, { color: colors.textSecondary }]}>Parents</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.FlatList
        ref={listRef}
        key={`${viewMode}-${columns}`}
        data={catalogLoading ? [] : shown}
        numColumns={columns}
        keyExtractor={(v) => v.videoId}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={columns > 1 ? { gap } : undefined}
        renderItem={renderVideoItem}
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
        ListEmptyComponent={
          catalogLoading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <View key={i} style={{ width: cardWidth }}>
                  <VideoCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ollie size={110} accessory="🔍" />
              <Text style={[styles.empty, { color: colors.textSecondary }]}>
                {catalogError ? 'Ollie can’t reach the forest right now.' : 'Ollie is looking for more toons…'}
              </Text>
              <TouchableOpacity
                onPress={reloadCatalog}
                style={[styles.retry, { backgroundColor: colors.secondaryAccent }]}
                accessibilityRole="button"
              >
                <Ionicons name="refresh" size={24} color={colors.onAccent} />
                <Text style={[styles.retryText, { color: colors.onAccent }]}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          catalogError && shown.length > 0 ? (
            <TouchableOpacity onPress={reloadCatalog} style={styles.offline}>
              <Ionicons name="cloud-offline" size={20} color={colors.textSecondary} />
              <Text style={[styles.offlineText, { color: colors.textSecondary }]}>
                Showing saved toons. Tap to refresh.
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.scrollTopWrap,
          {
            opacity: scrollTopScale,
            transform: [{ scale: scrollTopScale }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleScrollToTop}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Scroll back to top"
          style={[
            styles.scrollTopBtn,
            { backgroundColor: colors.primaryAccent, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons name="arrow-up" size={24} color={colors.onAccent} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 2,
  },
  topBarCompact: { paddingHorizontal: 8 },
  topBarNarrow: { paddingHorizontal: 4 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  logoWrapCompact: { gap: 6 },
  logoWrapNarrow: { gap: 4 },
  channelLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    backgroundColor: '#1B1931',
  },
  logoText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.subtitle },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FF0000',
  },
  subscribeBtnCompact: { paddingHorizontal: 8 },
  subscribeBtnNarrow: { paddingHorizontal: 6 },
  subscribeText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionsCompact: { gap: 0 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    padding: 2,
  },
  toggleHalf: {
    width: 28,
    height: 26,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleHalfNarrow: { width: 24 },
  iconBtn: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
  iconBtnCompact: { width: 36 },
  iconBtnNarrow: { width: 32 },
  lockText: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 10, marginTop: 1 },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  tileScroll: { marginHorizontal: -SPACING.md },
  tileRow: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm },
  tile: {
    width: 108,
    minHeight: 84,
    borderRadius: RADIUS.md,
    borderWidth: 3,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 11,
    lineHeight: 14,
    color: '#1D3557',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  section: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 15,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.md },
  empty: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.sizes.body, textAlign: 'center' },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: SPACING.touchMin,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
  },
  retryText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.subtitle },
  offline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: SPACING.md },
  offlineText: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.sizes.caption },
  scrollTopWrap: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.lg,
  },
  scrollTopBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
