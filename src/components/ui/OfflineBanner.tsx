import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing } from '@/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface OfflineBannerProps {
  isOnline: boolean;
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  const theme = useTheme();
  const translateY = useSharedValue(-60);

  useEffect(() => {
    translateY.value = withTiming(isOnline ? -60 : 0, { duration: 300 });
  }, [isOnline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.colors.error },
        animatedStyle,
      ]}
    >
      <Text style={styles.text} variant="bodyMedium">
        You are offline. Changes will sync when connected.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 1000,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
  },
});
