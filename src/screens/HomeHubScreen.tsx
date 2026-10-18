import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { VideoCard, VideoCardSkeleton, ViewModeToggle } from '../components/VideoCard';
import { Ollie } from '../components/Ollie';
import { ALL_SECTION_ID, CatalogSection, DEFAULT_CHANNEL_LOGO_URL } from '../data/videos';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeHub'>;

const TINTS = ['#FFD166', '#7BDFF2', '#B2F7A1', '#FFADAD', '#CDB4FF', '#FFC6FF'];

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
  const compact = width < 420;
  const gap = SPACING.md;
  const cardWidth =
    viewMode === 'list'
      ? width - SPACING.md * 2
      : Math.floor((width - SPACING.md * 2 - gap * (gridColumns - 1)) / gridColumns);

  const active = sections.find((s) => s.id === selectedSectionId) ?? sections[0];

  const shown = useMemo(() => {
    if (!active || !Array.isArray(active.videoIds)) return videos;
    const byId = new Map(videos.map((v) => [v.videoId, v]));
    return active.videoIds.map((id) => byId.get(id)).filter((v): v is NonNullable<typeof v> => !!v);
  }, [active, videos]);

  const header = (
    <View>
      {sections.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tileRow}
          style={styles.tileScroll}
        >
          {sections.map((s, i) => {
            const selected = s.id === active?.id;
            return (
              <TouchableOpacity
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={s.title}
                onPress={() => setSelectedSectionId(s.id)}
                style={[
                  styles.tile,
                  {
                    backgroundColor: TINTS[i % TINTS.length],
                    borderColor: selected ? colors.textPrimary : 'transparent',
                    opacity: selected ? 1 : 0.88,
                  },
                ]}
              >
                <MaterialIcons name={getSectionIcon(s)} size={30} color="#1D3557" />
                <Text style={styles.tileText} numberOfLines={2}>
                  {s.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: channelLogoUrl }}
            style={[styles.channelLogo, { borderColor: colors.primaryAccent }]}
            resizeMode="cover"
          />
          {!compact && (
            <Text style={[styles.logoText, { color: colors.textPrimary }]} numberOfLines={1}>
              WiseToons
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={toggleTheme}
            accessibilityRole="switch"
            accessibilityLabel={mode === 'day' ? 'Switch to Bedtime' : 'Switch to Playtime'}
            style={[styles.toggle, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }]}
          >
            <View style={[styles.toggleHalf, mode === 'day' && { backgroundColor: colors.primaryAccent }]}>
              <Ionicons name="sunny" size={16} color={mode === 'day' ? colors.onAccent : colors.textSecondary} />
            </View>
            <View style={[styles.toggleHalf, mode === 'night' && { backgroundColor: colors.primaryAccent }]}>
              <Ionicons name="moon" size={15} color={mode === 'night' ? colors.onAccent : colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="My Starred Toons"
            onPress={() => navigation.navigate('LocalFavorites')}
          >
            <Ionicons name={favorites.length ? 'star' : 'star-outline'} size={24} color={colors.starActive} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Parents"
            onPress={() => requestGate(() => navigation.navigate('ParentDashboard'))}
          >
            <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
            <Text style={[styles.lockText, { color: colors.textSecondary }]}>Parents</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        key={`${viewMode}-${columns}`}
        data={catalogLoading ? [] : shown}
        numColumns={columns}
        keyExtractor={(v) => v.videoId}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={columns > 1 ? { gap } : undefined}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <VideoCard
              video={item}
              variant={viewMode}
              onPress={() => navigation.navigate('VideoTheater', { videoId: item.videoId })}
            />
          </View>
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
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  channelLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    backgroundColor: '#1B1931',
  },
  logoText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.subtitle },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  iconBtn: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
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
});
