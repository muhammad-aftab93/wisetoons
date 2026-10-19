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
  background: '#EAF2FF',
  surface: 'rgba(255, 255, 255, 0.88)',
  surfaceElevated: '#FFF6E5',
  primaryAccent: '#FFBE3D',
  secondaryAccent: '#2EC4B6',
  textPrimary: '#2B2D5C',
  textSecondary: '#5E6494',
  cardBorder: '#D4DFFF',
  playerFrameBg: '#0F172A',
  starActive: '#FFB703',
  danger: '#FF6B8B',
  onAccent: '#2B2D5C',
};

export const NIGHT_COLORS: ThemeColors = {
  background: '#15122A',
  surface: 'rgba(40, 34, 76, 0.88)',
  surfaceElevated: '#362F66',
  primaryAccent: '#F9D966',
  secondaryAccent: '#64DFDF',
  textPrimary: '#FFF9EC',
  textSecondary: '#B8B2D8',
  cardBorder: '#4E4487',
  playerFrameBg: '#090814',
  starActive: '#F9D966',
  danger: '#FF758F',
  onAccent: '#15122A',
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

