import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';

export interface KeyboardAwareFormOptions {
  /** Enable the manual auto-scroll behaviour on Android. */
  enableOnAndroid?: boolean;
  /** Extra space kept between the focused field and the keyboard. */
  extraScrollHeight?: number;
}

export interface KeyboardAwareForm {
  /** No-op kept for backward compatibility. Layout is handled by the library. */
  captureLayout: (_key: string) => () => void;
  /** No-op kept for backward compatibility. Scrolling is handled by the library. */
  focusField: (_key: string) => void;
  /** No-op kept for backward compatibility. */
  setBaseOffset: (_y: number) => void;
  /** No-op kept for backward compatibility. */
  handleScroll: () => void;
  /** No-op kept for backward compatibility. */
  handleLayout: () => void;
  /** No-op kept for backward compatibility. */
  handleContentSizeChange: () => void;
  enableOnAndroid: boolean;
  extraScrollHeight: number;
}

/**
 * Creates the keyboard-aware form state for a single screen. Pass the returned
 * object to the `form` prop of a <KeyboardAwareScreen>.
 *
 * This is now a thin compatibility shim — the actual keyboard behaviour is
 * provided by `react-native-keyboard-controller`'s KeyboardAwareScrollView.
 */
export function useKeyboardAwareForm(
  _options: KeyboardAwareFormOptions = {},
): KeyboardAwareForm {
  return {
    captureLayout: () => () => {},
    focusField: () => {},
    setBaseOffset: () => {},
    handleScroll: () => {},
    handleLayout: () => {},
    handleContentSizeChange: () => {},
    enableOnAndroid: _options.enableOnAndroid ?? true,
    extraScrollHeight: _options.extraScrollHeight ?? 16,
  };
}

export interface KeyboardAwareScreenProps {
  /** Returned by useKeyboardAwareForm() in the same component. */
  form: KeyboardAwareForm;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: KeyboardAwareScrollViewProps['contentContainerStyle'];
  keyboardShouldPersistTaps?: KeyboardAwareScrollViewProps['keyboardShouldPersistTaps'];
  showsVerticalScrollIndicator?: boolean;
}

/**
 * Reusable keyboard-aware scroll container.
 *
 * Wraps children in a KeyboardAwareScrollView from react-native-keyboard-controller,
 * which handles keyboard overlap on both iOS and Android automatically — including
 * edge-to-edge Android layouts where the keyboard overlays the content.
 */
export function KeyboardAwareScreen({
  form,
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
}: KeyboardAwareScreenProps) {
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      style={[styles.flex, style]}
      bottomOffset={form.extraScrollHeight}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
