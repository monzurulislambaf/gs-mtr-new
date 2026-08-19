/**
 * Semantic color tokens for the GS MTR design system.
 *
 * These complement the Paper theme (LightTheme/DarkTheme in constants/theme.ts)
 * and provide a single source of truth for colors used outside Paper components.
 *
 * Usage:
 *   import { colors } from '@/theme';
 *   style={{ color: colors.textSecondary }}
 */
import { useColorScheme } from 'react-native';

/**
 * Light-mode palette. Import from here for static styles that don't
 * receive the Paper theme via props (rare — prefer useTheme() when available).
 */
const light = {
  /** Primary accent — matches Paper primary */
  primary: '#44EBD3',
  onPrimary: '#005D58',
  primaryContainer: '#CFF6EF',
  onPrimaryContainer: '#003F3B',

  /** Surfaces */
  background: '#FAF7F5',
  surface: '#FFFFFF',
  surfaceVariant: '#EFEAE6',

  /** Text */
  textPrimary: '#291334',
  textSecondary: '#5A4A64',
  textTertiary: '#888090',
  textInverse: '#FAF7F5',

  /** Borders / dividers */
  border: '#E7E2DF',
  borderLight: '#EFEAE6',
  divider: '#E7E2DF',

  /** Status */
  error: '#FE1C55',
  errorContainer: '#FDE2E8',
  success: '#4CAF50',
  successContainer: '#E8F5E9',
  warning: '#FF9800',
  warningContainer: '#FFF3E0',
  info: '#2196F3',
  infoContainer: '#E3F2FD',
  pending: '#FF9800',
  approved: '#4CAF50',
  declined: '#F44336',
  suspended: '#9E9E9E',

  /** Overlays */
  scrim: 'rgba(0, 0, 0, 0.32)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * Dark-mode palette.
 */
const dark = {
  primary: '#7FF0E0',
  onPrimary: '#003B37',
  primaryContainer: '#005D58',
  onPrimaryContainer: '#7FF0E0',

  background: '#1A1519',
  surface: '#261E22',
  surfaceVariant: '#362D33',

  textPrimary: '#FAF7F5',
  textSecondary: '#C9C0CB',
  textTertiary: '#9E95A3',
  textInverse: '#291334',

  border: '#5A4A64',
  borderLight: '#362D33',
  divider: '#5A4A64',

  error: '#FE5C82',
  errorContainer: '#4D0218',
  success: '#66BB6A',
  successContainer: '#1B5E20',
  warning: '#FFB74D',
  warningContainer: '#E65100',
  info: '#64B5F6',
  infoContainer: '#0D47A1',
  pending: '#FFB74D',
  approved: '#66BB6A',
  declined: '#EF5350',
  suspended: '#757575',

  scrim: 'rgba(0, 0, 0, 0.6)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
} as const;

export type ColorTokens = Record<keyof typeof light, string>;

/**
 * Hook that returns the correct color palette for the current theme mode.
 * Use this in components that don't receive the Paper theme via props.
 */
export function useColors(): ColorTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

/** Static light palette — for use in StyleSheet.create at module scope. */
export const colors: ColorTokens = light;
