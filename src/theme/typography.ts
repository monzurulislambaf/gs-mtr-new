/**
 * Typography tokens — named text styles.
 *
 * Mirrors the Apple text style ramp so sizes feel native. Each style
 * pairs a font size with a weight; color is applied via the Paper theme
 * at render time, not baked in here.
 *
 * Usage:
 *   import { typography } from '@/theme';
 *   style={typography.title}
 */
import { type TextStyle } from 'react-native';

export const typography = {
  /** 34px / Bold — large hero text, non-stack headers */
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
  } as TextStyle,

  /** 22px / Semibold — screen-level titles */
  title: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  /** 20px / Semibold — card titles, section headings */
  titleMedium: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
  } as TextStyle,

  /** 17px / Semibold — form labels, emphasis text */
  headline: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,

  /** 17px / Regular — body text, descriptions */
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,

  /** 16px / Regular — secondary body, list item text */
  bodySmall: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
  } as TextStyle,

  /** 15px / Regular — subhead, secondary labels */
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  /** 14px / Medium — button text, input labels */
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } as TextStyle,

  /** 13px / Regular — tertiary text, captions */
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  /** 12px / Semibold — overlines, uppercase labels */
  overline: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  /** 11px / Medium — tiny labels, badges */
  micro: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.4,
  } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
