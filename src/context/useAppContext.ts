// src/context/useAppContext.ts
// Decoupled AppContext definition and hook to prevent require cycles with modal/background components.
import { createContext, useContext } from 'react';
import { ThemeColors, ThemeMode } from '../theme/theme';
import { CatalogSection, WiseToonVideo } from '../data/videos';
import { ViewMode } from '../services/storageService';

export interface AppContextValue {
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

export const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

