import { useRef } from 'react';
import { ScrollView, type LayoutChangeEvent } from 'react-native';

/**
 * Auto-scrolls a ScrollView so the focused form field stays visible above the
 * keyboard. With Android edge-to-edge the native auto-scroll does not always
 * kick in, so we scroll explicitly on focus using the field's offset from the
 * top of the ScrollView content (each field's onLayout.y, plus an optional
 * base offset for fields nested inside a container).
 *
 * Usage:
 *   const { scrollRef, captureLayout, focusField } = useScrollToFocusedField();
 *   <ScrollView ref={scrollRef}>...</ScrollView>
 *   <TextInput onFocus={() => focusField('name')} onLayout={captureLayout('name')} />
 */
export function useScrollToFocusedField(baseOffset = 0) {
  const scrollRef = useRef<ScrollView>(null);
  const baseRef = useRef(baseOffset);
  const fieldsRef = useRef<Record<string, number>>({});

  /** Offset of the form container relative to the ScrollView content. */
  const setBaseOffset = (y: number) => {
    baseRef.current = y;
  };

  /** Capture a field's offset from the top of the ScrollView content. */
  const captureLayout = (field: string) => (e: LayoutChangeEvent) => {
    fieldsRef.current[field] = e.nativeEvent.layout.y;
  };

  /** Scroll the focused field to a comfortable position above the keyboard. */
  const focusField = (field: string) => {
    const y = fieldsRef.current[field];
    if (y == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, baseRef.current + y - 96),
      animated: true,
    });
  };

  return { scrollRef, captureLayout, focusField, setBaseOffset };
}
