import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
  showBack?: boolean;
}

/**
 * Signature header for the auth screens: a teal gradient band with a shield
 * emblem and Oswald display type, over which the form card floats.
 */
export function AuthHeader({
  title,
  subtitle,
  icon = 'shield-checkmark',
  compact = false,
  showBack = false,
}: AuthHeaderProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const colors = isDark
    ? (['#0B7C72', '#00332F'] as const)
    : (['#49E3CE', '#0B7F74'] as const);

  const emblemSize = compact ? 62 : 92;
  const iconSize = compact ? 28 : 42;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.band, compact ? styles.bandCompact : styles.bandFull]}
    >
      {showBack && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
      )}

      <View style={[styles.emblem, { width: emblemSize, height: emblemSize, borderRadius: emblemSize / 2 }]}>
        <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
      </View>

      <Text
        variant={compact ? 'headlineMedium' : 'displaySmall'}
        style={[styles.title, compact && { fontSize: 30 }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  band: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bandFull: {
    height: 268,
    paddingTop: 12,
  },
  bandCompact: {
    height: 188,
    paddingTop: 8,
  },
  emblem: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Oswald_700Bold',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 2,
    letterSpacing: 1,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
