// src/theme/theme.ts
export type ThemeMode = 'day' | 'night';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primaryAccent: string;
  secondaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  cardBorder: string;
  playerFrameBg: string;
  starActive: string;
  danger: string;
  onAccent: string;
}

export const DAY_COLORS: ThemeColors = {
  background: '#E6F4FE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF9E6',
  primaryAccent: '#FFD166',
  secondaryAccent: '#06D6A0',
  textPrimary: '#1D3557',
  textSecondary: '#457B9D',
  cardBorder: '#BDE0FE',
  playerFrameBg: '#0F172A',
  starActive: '#FFB703',
  danger: '#EF476F',
  onAccent: '#1D3557',
};

export const NIGHT_COLORS: ThemeColors = {
  background: '#1B1931',
  surface: '#282546',
  surfaceElevated: '#34305B',
  primaryAccent: '#F4D35E',
  secondaryAccent: '#70C1B3',
  textPrimary: '#FDFCDC',
  textSecondary: '#A39BA8',
  cardBorder: '#433E70',
  playerFrameBg: '#090814',
  starActive: '#F4D35E',
  danger: '#FF6B6B',
  onAccent: '#1B1931',
};

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  touchMin: 64,
} as const;

export const RADIUS = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 9999,
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Fredoka_600SemiBold',
    bold: 'Fredoka_700Bold',
  },
  sizes: {
    hero: 28,
    title: 22,
    subtitle: 18,
    body: 18,
    caption: 14,
  },
} as const;

