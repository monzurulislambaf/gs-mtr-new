/**
 * Shadow tokens — box-shadow strings.
 *
 * Use these instead of legacy shadow/elevation props. Two or three
 * elevation levels cover most needs.
 *
 * Usage:
 *   import { shadows } from '@/theme';
 *   style={shadows.card}
 */
export const shadows = {
  /** Subtle lift — cards, list items */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  /** Medium lift — floating elements, FABs */
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  /** Heavy lift — modals, overlays */
  overlay: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export type ShadowToken = keyof typeof shadows;
