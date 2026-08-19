/**
 * Spacing tokens — 4-point grid.
 *
 * Every visual gap, margin, and padding should use one of these steps.
 * If a value between steps recurs, add it to the scale instead of
 * scattering magic numbers.
 *
 * Usage:
 *   import { spacing } from '@/theme';
 *   style={{ padding: spacing.md, gap: spacing.sm }}
 */
export const spacing = {
  /** 2px — hairline gaps, icon nudges */
  xxs: 2,
  /** 4px — tight grouping, inline gaps */
  xs: 4,
  /** 8px — small gaps between related items */
  sm: 8,
  /** 12px — medium gaps, card inner padding */
  md: 12,
  /** 16px — standard section padding, screen edge insets */
  lg: 16,
  /** 24px — between sections, large card padding */
  xl: 24,
  /** 32px — between major sections */
  xxl: 32,
  /** 48px — top-level screen padding, large vertical gaps */
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
