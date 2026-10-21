import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Linking,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { VideoCard, VideoCardSkeleton, ViewModeToggle } from '../components/VideoCard';
import { WiseOwl } from '../components/WiseOwl';
import { DreamyBackground } from '../components/DreamyBackground';
import { KidsGamesHub } from '../components/KidsGamesHub';
import { KidsLearnHub } from '../components/KidsLearnHub';
import { ALL_SECTION_ID, CatalogSection, DEFAULT_CHANNEL_LOGO_URL } from '../data/videos';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { USE_NATIVE_DRIVER } from '../utils/animation';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeHub'>;

const TINTS = ['#FFD1DC', '#E0C8FF', '#B8E8FC', '#FFE082', '#C8F7DC'];
const LOCAL_CHANNEL_ICON = require('../../assets/channel-icon.png');
const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@WiseToons_for_Kids?sub_confirmation=1';
const YOUTUBE_APP_IOS_URL = 'youtube://www.youtube.com/@WiseToons_for_Kids?sub_confirmation=1';
const YOUTUBE_APP_ANDROID_URL = 'vnd.youtube://www.youtube.com/@WiseToons_for_Kids?sub_confirmation=1';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

function getSectionIcon(section: CatalogSection): MaterialIconName {
  if (section.kind === 'education' || section.id === 'education') return 'school';
  if (section.kind === 'games' || section.id === 'games') return 'sports-esports';
  const title = section.title.toLowerCase();
  if (/education|learn|school|abc|123/.test(title)) return 'school';
  if (/game|play/.test(title)) return 'sports-esports';
  if (/rhym|song|music|sing|nursery/.test(title)) return 'music-note';
  if (/bedtime|sleep|night/.test(title)) return 'bedtime';
  if (/story|stories|tale|moral|book/.test(title)) return 'auto-stories';
  return 'video-library';
}

function getSectionSubtitle(section: CatalogSection): string {
  if (section.kind === 'education' || section.id === 'education') return 'ABC, 123 & Animals!';
  if (section.kind === 'games' || section.id === 'games') return 'Fun Puzzles & Play!';
  const title = section.title.toLowerCase();
  if (/education|learn|school|abc|123/.test(title)) return 'ABC, 123 & Animals!';
  if (/rhym|song|music|sing|nursery/.test(title)) return 'Sing & Dance!';
  if (/bedtime|sleep|night|story|stories/.test(title)) return 'Sweet Dreams & Tales';
  return 'Fun Toons for Kids';
}

interface MainMenuCardProps {
  section: CatalogSection;
  tint: string;
  onPress: () => void;
  width: number;
}

const MainMenuCard: React.FC<MainMenuCardProps> = ({ section, tint, onPress, width }) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconName = getSectionIcon(section);
  const subtitle = getSectionSubtitle(section);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      friction: 5,
      tension: 160,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }], width }}>
      <TouchableOpacity
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`${section.title}, ${subtitle}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.mainMenuTile,
          {
            backgroundColor: tint,
          },
        ]}
      >
        <View style={styles.mainMenuIconCircle}>
          <MaterialIcons name={iconName} size={36} color="#1D3557" />
        </View>
        <View style={styles.mainMenuTextWrap}>
          <Text style={styles.mainMenuTileTitle} numberOfLines={1}>
            {section.title}
          </Text>
          <Text style={styles.mainMenuTileSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.mainMenuArrowCircle}>
          <Ionicons name="chevron-forward" size={22} color="#1D3557" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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

  // Main menu sizing (vertically & horizontally centered)
  const isMenu = selectedSectionId === 'menu';
  const active = isMenu ? null : (sections.find((s) => s.id === selectedSectionId) ?? sections[0]);
  const menuCardWidth = Math.min(width - SPACING.md * 2, 380);

  // Handle Android hardware back button: return to main menu
  useEffect(() => {
    if (isMenu) return;
    const onBackPress = () => {
      setSelectedSectionId('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isMenu, setSelectedSectionId]);

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
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(logoRock, {
          toValue: -1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [logoRock]);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(headerStarScale, { toValue: 1.35, friction: 3, tension: 160, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(headerStarScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [favorites.length, headerStarScale]);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
    themePop.setValue(0.8);
    Animated.spring(themePop, {
      toValue: 1,
      friction: 3,
      tension: 150,
      useNativeDriver: USE_NATIVE_DRIVER,
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

  const shown = useMemo(() => {
    if (!active || !Array.isArray(active.videoIds)) return videos;
    const byId = new Map(videos.map((v) => [v.videoId, v]));
    return active.videoIds.map((id) => byId.get(id)).filter((v): v is NonNullable<typeof v> => !!v);
  }, [active, videos]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<typeof shown[number]>>(null);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handlePlayVideo = useCallback(
    (videoId: string) => {
      navigation.navigate('VideoTheater', { videoId });
    },
    [navigation]
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

  const listHeader = useMemo(
    () =>
      !!active && active.kind !== 'games' ? (
        <View style={styles.sectionRow}>
          <Text style={[styles.section, { color: colors.textPrimary }]} numberOfLines={1}>
            {active.title}
          </Text>
          <ViewModeToggle />
        </View>
      ) : undefined,
    [active, colors.textPrimary]
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
          {!isMenu && (
            <TouchableOpacity
              onPress={() => setSelectedSectionId('menu')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Main Menu"
              style={[styles.backToMenuBtn, compact && styles.backToMenuBtnCompact]}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.backToMenuText}>Menu</Text>
            </TouchableOpacity>
          )}

          <Animated.Image
            source={
              channelLogoUrl && channelLogoUrl !== DEFAULT_CHANNEL_LOGO_URL
                ? { uri: channelLogoUrl }
                : LOCAL_CHANNEL_ICON
            }
            defaultSource={LOCAL_CHANNEL_ICON}
            style={[
              styles.channelLogo,
              { borderColor: colors.primaryAccent, transform: [{ rotate: logoRotate }] },
            ]}
            resizeMode="cover"
          />
          <Text style={[styles.logoText, { color: colors.textPrimary }]} numberOfLines={1}>
            {!isMenu && active?.title ? active.title : 'WiseToons'}
          </Text>
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

      {isMenu ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainMenuCenterContainer}
        >
          <View style={styles.mainMenuContent}>
            <View style={styles.mainMenuHeroWrap}>
              <WiseOwl size={Platform.OS === 'web' ? 104 : 96} waving />
              <Text style={[styles.mainMenuTitle, { color: colors.textPrimary }]}>
                WiseToons
              </Text>
              <Text style={[styles.mainMenuSubtitle, { color: colors.textSecondary }]}>
                Pick your fun! 🦉✨
              </Text>
            </View>

            <View style={styles.mainMenuGrid}>
              {sections.map((section, idx) => (
                <MainMenuCard
                  key={section.id}
                  section={section}
                  tint={TINTS[idx % TINTS.length]}
                  width={menuCardWidth}
                  onPress={() => setSelectedSectionId(section.id)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : active?.kind === 'games' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gamesScrollContent}
        >
          <KidsGamesHub />
        </ScrollView>
      ) : active?.kind === 'education' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gamesScrollContent}
        >
          <KidsLearnHub />
        </ScrollView>
      ) : (
        <Animated.FlatList
          ref={listRef}
          key={`${viewMode}-${columns}`}
          data={catalogLoading ? [] : shown}
          numColumns={columns}
          keyExtractor={(v) => v.videoId}
          ListHeaderComponent={listHeader}
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
            { useNativeDriver: USE_NATIVE_DRIVER }
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
                <WiseOwl size={110} accessory="🔍" />
                <Text style={[styles.empty, { color: colors.textSecondary }]}>
                  {catalogError ? 'Can’t reach the toons right now.' : 'Looking for more toons…'}
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
      )}

      {!isMenu && (
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
      )}
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
  backToMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: '#4A90E2',
    marginRight: 4,
  },
  backToMenuBtnCompact: {
    paddingHorizontal: 7,
    marginRight: 2,
  },
  backToMenuText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  mainMenuCenterContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  mainMenuContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mainMenuHeroWrap: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mainMenuTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 28,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  mainMenuSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.subtitle,
    marginTop: 2,
    textAlign: 'center',
  },
  mainMenuGrid: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.md,
  },
  mainMenuTile: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    borderColor: 'rgba(29, 53, 87, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: SPACING.md,
  },
  mainMenuIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainMenuTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  mainMenuTileTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 20,
    lineHeight: 24,
    color: '#1D3557',
  },
  mainMenuTileSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    lineHeight: 17,
    color: '#2B2D5C',
    opacity: 0.8,
    marginTop: 2,
  },
  mainMenuArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
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
  gamesScrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xl },
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
