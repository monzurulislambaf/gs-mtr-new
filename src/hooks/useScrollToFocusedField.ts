import { useKeyboardAwareForm } from '@/components/ui/KeyboardAwareScreen';

/**
 * @deprecated Use `useKeyboardAwareForm` from `@/components/ui/KeyboardAwareScreen`
 * together with the `<KeyboardAwareScreen>` wrapper. This re-export keeps the
 * hook working for any remaining callers.
 */
export function useScrollToFocusedField(_baseOffset = 0) {
  return useKeyboardAwareForm();
}