import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { spacing, radius } from '@/theme';

interface LoadingSkeletonProps {
  count?: number;
}

function SkeletonRow({ theme }: { theme: any }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.avatar,
          { backgroundColor: theme.colors.surfaceVariant },
          animatedStyle,
        ]}
      />
      <View style={styles.textContainer}>
        <Animated.View
          style={[
            styles.nameLine,
            { backgroundColor: theme.colors.surfaceVariant },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.subLine,
            { backgroundColor: theme.colors.surfaceVariant },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

export function LoadingSkeleton({ count = 8 }: LoadingSkeletonProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} theme={theme} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs + spacing.xxs,
  },
  nameLine: {
    width: '60%',
    height: 14,
    borderRadius: radius.sm,
  },
  subLine: {
    width: '40%',
    height: 10,
    borderRadius: radius.sm,
  },
});
