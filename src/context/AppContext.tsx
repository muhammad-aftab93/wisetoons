// src/context/AppContext.tsx
// Theme, view mode, section selection, favorites, catalog, parental gate, and sleep timer
// with automatic on-device persistence via storageService.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DAY_COLORS, NIGHT_COLORS, ThemeColors, ThemeMode } from '../theme/theme';
import {
  ALL_SECTION_ID,
  BUNDLED_CATALOG,
  Catalog,
  CatalogSection,
  DEFAULT_CHANNEL_LOGO_URL,
  WiseToonVideo,
} from '../data/videos';
import { fetchChannelCatalog, hasApiKey } from '../services/youtubeApiService';
import {
  DEFAULT_SETTINGS,
  PersistedSettings,
  storageService,
  ViewMode,
} from '../services/storageService';
import { ParentalGateModal } from '../components/ParentalGateModal';
import { SleepOverlayModal } from '../components/SleepOverlayModal';

export type { ViewMode } from '../services/storageService';

const CATALOG_TTL_MS = 6 * 60 * 60 * 1000;

interface AppContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedSectionId: string;
  setSelectedSectionId: (id: string) => void;
  channelLogoUrl: string;
  videos: WiseToonVideo[];
  sections: CatalogSection[];
  catalogLoading: boolean;
  catalogError: boolean;
  reloadCatalog: () => void;
  bootstrap: () => Promise<void>;
  favorites: string[];
  favoriteVideos: WiseToonVideo[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => Promise<void>;
  /** Shows the parental gate; runs onPass only after a correct answer. */
  requestGate: (onPass: () => void) => void;
  /** True while any modal/overlay is covering the player: playback must be paused. */
  overlayActive: boolean;
  sleepMinutes: number;
  sleepRemainingMs: number;
  setSleepTimer: (minutes: number) => void;
  wakeFromSleep: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_SETTINGS.themeMode);
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_SETTINGS.viewMode);
  const [selectedSectionId, setSelectedSectionIdState] = useState<string>(
    DEFAULT_SETTINGS.selectedSectionId
  );

  const [catalog, setCatalog] = useState<Catalog>(
    hasApiKey() ? { videos: [], sections: [] } : BUNDLED_CATALOG
  );
  const [catalogLoading, setCatalogLoading] = useState(hasApiKey());
  const [catalogError, setCatalogError] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedFavoriteVideos, setSavedFavoriteVideos] = useState<WiseToonVideo[]>([]);

  const [gateVisible, setGateVisible] = useState(false);
  const gateCallback = useRef<(() => void) | null>(null);

  const [sleepMinutes, setSleepMinutes] = useState(DEFAULT_SETTINGS.sleepMinutes);
  const [sleepEndAt, setSleepEndAt] = useState<number | null>(DEFAULT_SETTINGS.sleepEndAt);
  const [sleepRemainingMs, setSleepRemainingMs] = useState(0);
  const [sleeping, setSleeping] = useState(false);

  const hydratedRef = useRef(false);
  const bootPromiseRef = useRef<Promise<void> | null>(null);

  // Keep a ref of current settings so any single setter can persist the full snapshot atomically.
  const settingsRef = useRef<PersistedSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    settingsRef.current = {
      themeMode: mode,
      viewMode,
      sleepMinutes,
      sleepEndAt,
      selectedSectionId,
    };
  }, [mode, viewMode, sleepMinutes, sleepEndAt, selectedSectionId]);

  const loadCatalog = useCallback(async (haveCache = false) => {
    if (!hasApiKey()) {
      if (!haveCache) setCatalog(BUNDLED_CATALOG);
      setCatalogLoading(false);
      return;
    }
    setCatalogLoading(!haveCache);
    setCatalogError(false);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const list = await fetchChannelCatalog(ctrl.signal);
      setCatalog(list);
      await storageService.saveCatalogCache(list);
    } catch {
      if (!haveCache) {
        setCatalog(BUNDLED_CATALOG);
        setCatalogError(true);
      }
    } finally {
      clearTimeout(timer);
      setCatalogLoading(false);
    }
  }, []);

  const bootstrap = useCallback(async () => {
    if (bootPromiseRef.current) {
      return bootPromiseRef.current;
    }

    const promise = (async () => {
      const [settings, favData, cachedCatalog] = await Promise.all([
        storageService.loadSettings(),
        storageService.loadFavorites(),
        storageService.loadCatalogCache(),
      ]);

      setMode(settings.themeMode);
      setViewModeState(settings.viewMode);
      setSelectedSectionIdState(settings.selectedSectionId || ALL_SECTION_ID);

      // Restore sleep timer setting: if a previous timer was active, resume or restart it
      setSleepMinutes(settings.sleepMinutes);
      if (settings.sleepMinutes > 0) {
        if (settings.sleepEndAt && settings.sleepEndAt > Date.now()) {
          setSleepEndAt(settings.sleepEndAt);
          setSleepRemainingMs(settings.sleepEndAt - Date.now());
        } else {
          const nextEnd = Date.now() + settings.sleepMinutes * 60_000;
          setSleepEndAt(nextEnd);
          setSleepRemainingMs(settings.sleepMinutes * 60_000);
          storageService.saveSettings({ ...settings, sleepEndAt: nextEnd });
        }
      } else {
        setSleepEndAt(null);
        setSleepRemainingMs(0);
      }

      setFavorites(favData.ids);
      setSavedFavoriteVideos(favData.videos);

      const hasCachedVideos = Boolean(cachedCatalog?.catalog?.videos?.length);
      if (hasCachedVideos && cachedCatalog) {
        setCatalog(cachedCatalog.catalog);
        setCatalogLoading(false);
      }

      hydratedRef.current = true;

      const fresh =
        Boolean(cachedCatalog) &&
        Date.now() - (cachedCatalog?.fetchedAt ?? 0) < CATALOG_TTL_MS;
      if (!fresh) {
        loadCatalog(hasCachedVideos);
      }
    })();

    bootPromiseRef.current = promise;
    return promise;
  }, [loadCatalog]);

  // Always run bootstrap automatically when AppProvider mounts (covers web reloads and direct routes).
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Whenever live catalog updates, refresh cached metadata for any starred videos.
  useEffect(() => {
    if (!hydratedRef.current || catalog.videos.length === 0) return;
    const byId = new Map(catalog.videos.map((v) => [v.videoId, v]));
    setSavedFavoriteVideos((prev) => {
      const prevById = new Map(prev.map((v) => [v.videoId, v]));
      const merged = favorites
        .map((id) => byId.get(id) ?? prevById.get(id))
        .filter((v): v is WiseToonVideo => Boolean(v));
      storageService.saveFavorites(favorites, merged);
      return merged;
    });
  }, [catalog.videos, favorites]);

  const toggleTheme = useCallback(() => {
    setMode((m) => {
      const next: ThemeMode = m === 'day' ? 'night' : 'day';
      storageService.saveSettings({ ...settingsRef.current, themeMode: next });
      return next;
    });
  }, []);

  const setViewMode = useCallback((next: ViewMode) => {
    setViewModeState(next);
    storageService.saveSettings({ ...settingsRef.current, viewMode: next });
  }, []);

  const setSelectedSectionId = useCallback((id: string) => {
    setSelectedSectionIdState(id);
    storageService.saveSettings({ ...settingsRef.current, selectedSectionId: id });
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prevIds) => {
        const nextIds = prevIds.includes(id)
          ? prevIds.filter((x) => x !== id)
          : [...prevIds, id];

        setSavedFavoriteVideos((prevVideos) => {
          const pool = new Map<string, WiseToonVideo>();
          for (const v of prevVideos) pool.set(v.videoId, v);
          for (const v of catalog.videos) pool.set(v.videoId, v);
          const nextVideos = nextIds
            .map((vid) => pool.get(vid))
            .filter((v): v is WiseToonVideo => Boolean(v));
          storageService.saveFavorites(nextIds, nextVideos);
          return nextVideos;
        });

        return nextIds;
      });
    },
    [catalog.videos]
  );

  const clearFavorites = useCallback(async () => {
    setFavorites([]);
    setSavedFavoriteVideos([]);
    await storageService.clearFavorites();
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const requestGate = useCallback((onPass: () => void) => {
    gateCallback.current = onPass;
    setGateVisible(true);
  }, []);

  const setSleepTimer = useCallback((minutes: number) => {
    setSleepMinutes(minutes);
    if (minutes > 0) {
      const endAt = Date.now() + minutes * 60_000;
      setSleepEndAt(endAt);
      setSleepRemainingMs(minutes * 60_000);
      storageService.saveSettings({
        ...settingsRef.current,
        sleepMinutes: minutes,
        sleepEndAt: endAt,
      });
    } else {
      setSleepEndAt(null);
      setSleepRemainingMs(0);
      storageService.saveSettings({
        ...settingsRef.current,
        sleepMinutes: 0,
        sleepEndAt: null,
      });
    }
  }, []);

  useEffect(() => {
    if (sleepEndAt === null) return;
    const id = setInterval(() => {
      const left = sleepEndAt - Date.now();
      if (left <= 0) {
        setSleepEndAt(null);
        setSleepMinutes(0);
        setSleepRemainingMs(0);
        setSleeping(true);
        storageService.saveSettings({
          ...settingsRef.current,
          sleepMinutes: 0,
          sleepEndAt: null,
        });
      } else {
        setSleepRemainingMs(left);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sleepEndAt]);

  const wakeFromSleep = useCallback(() => setSleeping(false), []);

  // Combine catalog videos + locally stored favorite video objects so starred videos
  // are always available immediately upon restart, even before network fetch completes.
  const favoriteVideos = useMemo(() => {
    const pool = new Map<string, WiseToonVideo>();
    for (const v of savedFavoriteVideos) pool.set(v.videoId, v);
    for (const v of catalog.videos) pool.set(v.videoId, v);
    return favorites
      .map((id) => pool.get(id))
      .filter((v): v is WiseToonVideo => Boolean(v));
  }, [favorites, savedFavoriteVideos, catalog.videos]);

  const value = useMemo<AppContextValue>(
    () => ({
      mode,
      colors: mode === 'day' ? DAY_COLORS : NIGHT_COLORS,
      toggleTheme,
      viewMode,
      setViewMode,
      selectedSectionId,
      setSelectedSectionId,
      channelLogoUrl: catalog?.channelLogoUrl || DEFAULT_CHANNEL_LOGO_URL,
      videos: catalog?.videos ?? [],
      sections: catalog?.sections ?? [],
      catalogLoading,
      catalogError,
      reloadCatalog: () => loadCatalog(false),
      bootstrap,
      favorites,
      favoriteVideos,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      requestGate,
      overlayActive: gateVisible || sleeping,
      sleepMinutes,
      sleepRemainingMs,
      setSleepTimer,
      wakeFromSleep,
    }),
    [
      mode,
      toggleTheme,
      viewMode,
      setViewMode,
      selectedSectionId,
      setSelectedSectionId,
      catalog,
      catalogLoading,
      catalogError,
      loadCatalog,
      bootstrap,
      favorites,
      favoriteVideos,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      requestGate,
      gateVisible,
      sleeping,
      sleepMinutes,
      sleepRemainingMs,
      setSleepTimer,
      wakeFromSleep,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <SleepOverlayModal visible={sleeping} onWake={() => requestGate(wakeFromSleep)} />
      <ParentalGateModal
        visible={gateVisible}
        onCancel={() => {
          gateCallback.current = null;
          setGateVisible(false);
        }}
        onSuccess={() => {
          const cb = gateCallback.current;
          gateCallback.current = null;
          setGateVisible(false);
          cb?.();
        }}
      />
    </AppContext.Provider>
  );
};
