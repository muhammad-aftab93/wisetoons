// src/services/storageService.ts
// On-device local persistence service for settings, starred videos, and cached catalog.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../theme/theme';
import { ALL_SECTION_ID, Catalog, WiseToonVideo } from '../data/videos';

export type ViewMode = 'grid' | 'list';

const KEYS = {
  SETTINGS: '@wisetoons_settings_v1',
  FAVORITE_IDS: '@wisetoons_favorites',
  FAVORITE_VIDEOS: '@wisetoons_favorite_videos_v1',
  CATALOG_CACHE: '@wisetoons_catalog_v4',
  // Legacy individual keys for seamless migration
  LEGACY_THEME: '@wisetoons_theme',
  LEGACY_VIEW_MODE: '@wisetoons_view_mode',
} as const;

export interface PersistedSettings {
  themeMode: ThemeMode;
  viewMode: ViewMode;
  sleepMinutes: number;
  sleepEndAt: number | null;
  selectedSectionId: string;
}

export const DEFAULT_SETTINGS: PersistedSettings = {
  themeMode: 'day',
  viewMode: 'grid',
  sleepMinutes: 0,
  sleepEndAt: null,
  selectedSectionId: ALL_SECTION_ID,
};

async function safeGetJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function safeSetJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors
  }
}

export const storageService = {
  /** Loads persisted app settings, migrating any legacy keys if present. */
  async loadSettings(): Promise<PersistedSettings> {
    const saved = await safeGetJson<Partial<PersistedSettings>>(KEYS.SETTINGS);
    if (saved) {
      return {
        themeMode: saved.themeMode === 'night' ? 'night' : 'day',
        viewMode: saved.viewMode === 'list' ? 'list' : 'grid',
        sleepMinutes:
          typeof saved.sleepMinutes === 'number' && saved.sleepMinutes >= 0
            ? saved.sleepMinutes
            : 0,
        sleepEndAt:
          typeof saved.sleepEndAt === 'number' ? saved.sleepEndAt : null,
        selectedSectionId:
          typeof saved.selectedSectionId === 'string' && saved.selectedSectionId
            ? saved.selectedSectionId
            : ALL_SECTION_ID,
      };
    }

    // Migrate from legacy individual keys if present
    let themeMode: ThemeMode = DEFAULT_SETTINGS.themeMode;
    let viewMode: ViewMode = DEFAULT_SETTINGS.viewMode;
    try {
      const [legacyTheme, legacyView] = await Promise.all([
        AsyncStorage.getItem(KEYS.LEGACY_THEME),
        AsyncStorage.getItem(KEYS.LEGACY_VIEW_MODE),
      ]);
      if (legacyTheme === 'day' || legacyTheme === 'night') themeMode = legacyTheme;
      if (legacyView === 'grid' || legacyView === 'list') viewMode = legacyView;
    } catch {
      // Ignore
    }

    const migrated: PersistedSettings = {
      ...DEFAULT_SETTINGS,
      themeMode,
      viewMode,
    };
    await safeSetJson(KEYS.SETTINGS, migrated);
    return migrated;
  },

  /** Saves complete settings object to device storage. */
  async saveSettings(settings: PersistedSettings): Promise<void> {
    await safeSetJson(KEYS.SETTINGS, settings);
  },

  /** Loads starred video IDs and cached full video objects from device storage. */
  async loadFavorites(): Promise<{ ids: string[]; videos: WiseToonVideo[] }> {
    const [ids, videos] = await Promise.all([
      safeGetJson<string[]>(KEYS.FAVORITE_IDS),
      safeGetJson<WiseToonVideo[]>(KEYS.FAVORITE_VIDEOS),
    ]);
    return {
      ids: Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : [],
      videos: Array.isArray(videos) ? videos : [],
    };
  },

  /** Persists starred video IDs and their full metadata objects locally on device. */
  async saveFavorites(ids: string[], videos: WiseToonVideo[]): Promise<void> {
    await Promise.all([
      safeSetJson(KEYS.FAVORITE_IDS, ids),
      safeSetJson(KEYS.FAVORITE_VIDEOS, videos),
    ]);
  },

  /** Clears all starred videos from local storage. */
  async clearFavorites(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(KEYS.FAVORITE_IDS),
        AsyncStorage.removeItem(KEYS.FAVORITE_VIDEOS),
      ]);
    } catch {
      // Ignore
    }
  },

  /** Loads cached YouTube channel catalog from local storage. */
  async loadCatalogCache(): Promise<{ fetchedAt: number; catalog: Catalog } | null> {
    return safeGetJson<{ fetchedAt: number; catalog: Catalog }>(KEYS.CATALOG_CACHE);
  },

  /** Saves YouTube channel catalog to local storage. */
  async saveCatalogCache(catalog: Catalog): Promise<void> {
    await safeSetJson(KEYS.CATALOG_CACHE, {
      fetchedAt: Date.now(),
      catalog,
    });
  },
};

