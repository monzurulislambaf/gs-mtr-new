import React, { useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface FieldLayout {
  y: number;
  height: number;
}

export interface KeyboardAwareFormOptions {
  /** Enable the manual auto-scroll behaviour on Android. */
  enableOnAndroid?: boolean;
  /** Extra space kept between the focused field and the keyboard. */
  extraScrollHeight?: number;
}

export interface KeyboardAwareForm {
  scrollRef: React.RefObject<ScrollView | null>;
  /** Attach to a TextInput's onLayout to record its position/size. */
  captureLayout: (key: string) => (e: LayoutChangeEvent) => void;
  /** Attach to a TextInput's onFocus to scroll it above the keyboard. */
  focusField: (key: string) => void;
  /** Offset of a nested form container relative to the ScrollView content. */
  setBaseOffset: (y: number) => void;
  handleScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleLayout: (e: LayoutChangeEvent) => void;
  handleContentSizeChange: (w: number, h: number) => void;
  enableOnAndroid: boolean;
  extraScrollHeight: number;
}

/**
 * Creates the keyboard-aware form state for a single screen. Pass the returned
 * object to the `form` prop of a <KeyboardAwareScreen>.
 *
 * Usage:
 *   const form = useKeyboardAwareForm();
 *   const { captureLayout, focusField } = form;
 *   <KeyboardAwareScreen form={form} contentContainerStyle={styles.scroll}>
 *     <TextInput onFocus={() => focusField('name')} onLayout={captureLayout('name')} />
 *   </KeyboardAwareScreen>
 */
export function useKeyboardAwareForm(
  options: KeyboardAwareFormOptions = {},
): KeyboardAwareForm {
  const enableOnAndroid = options.enableOnAndroid ?? true;
  const extraScrollHeight = options.extraScrollHeight ?? 16;

  const scrollRef = useRef<ScrollView>(null);
  const fieldsRef = useRef<Record<string, FieldLayout>>({});
  const baseOffsetRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const focusedKeyRef = useRef<string | null>(null);
  const keyboardHeightRef = useRef(0);
  const windowResizedRef = useRef(false);
  const initialViewportHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const focusField = useCallback(
    (key: string) => {
      if (Platform.OS === 'android' && !enableOnAndroid) return;
      focusedKeyRef.current = key;

      const field = fieldsRef.current[key];
      const node = scrollRef.current;
      if (!field || !node) return;

      const nativeRef = node.getNativeScrollRef();
      if (!nativeRef) return;

      nativeRef.measureInWindow((x, y, w, h) => {
        const scrollViewTop = y;
        const viewportHeight = h;
        const fieldBottomInWindow =
          scrollViewTop +
          baseOffsetRef.current +
          field.y -
          scrollOffsetRef.current +
          field.height;

        const keyboardVisible = keyboardHeightRef.current > 0;
        const visibleBottom = keyboardVisible && !windowResizedRef.current
          ? scrollViewTop + viewportHeight - keyboardHeightRef.current
          : scrollViewTop + viewportHeight;

        if (fieldBottomInWindow > visibleBottom - extraScrollHeight) {
          const target = Math.max(
            0,
            fieldBottomInWindow - visibleBottom + extraScrollHeight + scrollOffsetRef.current,
          );
          const maxScroll = Math.max(0, contentHeightRef.current - viewportHeight);
          node.scrollTo({ y: Math.min(target, maxScroll), animated: true });
        }
      });
    },
    [enableOnAndroid, extraScrollHeight],
  );

  const focusFieldRef = useRef(focusField);
  useEffect(() => {
    focusFieldRef.current = focusField;
  }, [focusField]);

  useEffect(() => {
    if (Platform.OS === 'android' && !enableOnAndroid) return;

    const changeEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidChangeFrame';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener('keyboardDidShow', (e: any) => {
      keyboardHeightRef.current = e.endCoordinates?.height ?? 0;
      // Once the keyboard is fully shown the viewport is stable, so re-align the
      // focused field and correct any in-flight animation inaccuracy.
      const focused = focusedKeyRef.current;
      if (focused) {
        requestAnimationFrame(() => focusFieldRef.current(focused));
      }
    });
    const changeSub = Keyboard.addListener(changeEvent, (e: any) => {
      keyboardHeightRef.current = e.endCoordinates?.height ?? 0;
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      windowResizedRef.current = false;
      focusedKeyRef.current = null;
    });

    return () => {
      showSub.remove();
      changeSub.remove();
      hideSub.remove();
    };
  }, [enableOnAndroid]);

  const captureLayout = useCallback((key: string) => (e: LayoutChangeEvent) => {
    fieldsRef.current[key] = {
      y: e.nativeEvent.layout.y,
      height: e.nativeEvent.layout.height,
    };
  }, []);

  const setBaseOffset = useCallback((y: number) => {
    baseOffsetRef.current = y;
  }, []);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    viewportHeightRef.current = height;
    if (initialViewportHeightRef.current === 0) {
      initialViewportHeightRef.current = height;
    } else if (keyboardHeightRef.current > 0 && height < initialViewportHeightRef.current - 40) {
      // Android adjustResize shrunk the viewport, so the keyboard no longer
      // overlaps the scroll view and no height compensation is needed.
      windowResizedRef.current = true;
    }
  }, []);

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    contentHeightRef.current = h;
  }, []);

  return {
    scrollRef,
    captureLayout,
    focusField,
    setBaseOffset,
    handleScroll,
    handleLayout,
    handleContentSizeChange,
    enableOnAndroid,
    extraScrollHeight,
  };
}

export interface KeyboardAwareScreenProps {
  /** Returned by useKeyboardAwareForm() in the same component. */
  form: KeyboardAwareForm;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  showsVerticalScrollIndicator?: boolean;
}

/**
 * Reusable keyboard-aware scroll container.
 *
 * Wraps children in a KeyboardAvoidingView (iOS padding only; on Android the
 * window is resized instead) and a ScrollView that auto-scrolls the focused
 * field above the keyboard on both platforms.
 */
export function KeyboardAwareScreen({
  form,
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
}: KeyboardAwareScreenProps) {
  const { scrollRef, handleScroll, handleLayout, handleContentSizeChange } = form;
  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});