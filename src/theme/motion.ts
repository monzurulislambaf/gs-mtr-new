/**
 * Motion tokens — shared animation configs.
 *
 * Keep animation timing consistent across the app. Reanimated caveat:
 * don't pass Color/PlatformColor token values into Reanimated styles.
 *
 * Usage:
 *   import { motion } from '@/theme';
 *   duration={motion.base}
 */
export const motion = {
  /** 150ms — state feedback: press, toggle, ripple */
  fast: 150,
  /** 250ms — element transitions: enter/exit, list reorder */
  base: 250,
  /** 400ms — large surfaces: sheets, screens, modals */
  slow: 400,
} as const;

/**
 * Shared spring configs for use with react-native-reanimated.
 */
export const spring = {
  /** Snappy feedback — button press, toggle */
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  /** Gentle settle — sheet dismiss, card expand */
  gentle: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
} as const;
