/**
 * Border radius tokens.
 *
 * Pair every non-capsule radius with `borderCurve: "continuous"` (per
 * expo-native-ui) for smooth, native-feeling corners.
 *
 * Usage:
 *   import { radius } from '@/theme';
 *   style={{ borderRadius: radius.lg, borderCurve: 'continuous' }}
 */
export const radius = {
  /** 4px — subtle rounding (badges, chips) */
  sm: 4,
  /** 8px — inputs, small cards */
  md: 8,
  /** 12px — cards, dialogs, modals */
  lg: 12,
  /** 16px — large cards, section containers */
  xl: 16,
  /** 24px — search bars, prominent containers */
  xxl: 24,
  /** 9999 — capsules, pills, avatars */
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
