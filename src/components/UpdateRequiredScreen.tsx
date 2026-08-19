import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ProgressBar, ActivityIndicator, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME, APP_BUILD_NUMBER } from '@/utils/constants';
import type { UpdateCheckResult } from '@/services/appUpdateService';

interface UpdateRequiredScreenProps {
  info: UpdateCheckResult | null;
  downloading: boolean;
  installing: boolean;
  downloadProgress: number;
  error: string | null;
  onUpdateNow: () => void;
  onRetry: () => void;
}

/**
 * Mandatory update gate. There is intentionally no Skip/Later button: when
 * `currentVersion < minimumVersion` the user must update before using the
 * online application. Offline users never see this screen.
 */
export function UpdateRequiredScreen({
  info,
  downloading,
  installing,
  downloadProgress,
  error,
  onUpdateNow,
  onRetry,
}: UpdateRequiredScreenProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const colors = isDark
    ? (['#0B7C72', '#00332F'] as const)
    : (['#49E3CE', '#0B7F74'] as const);

  const notes = (info?.releaseNotes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.band}
        >
          <View style={styles.emblem}>
            <Ionicons name="shield-checkmark" size={42} color="#FFFFFF" />
          </View>
          <Text variant="displaySmall" style={styles.title}>
            {APP_NAME}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Office Contact Directory
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Update Required
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 18 }}>
            A new version of {APP_NAME} is available. Please update to continue.
          </Text>

          <View style={[styles.infoRow, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.infoItem}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Installed
              </Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {info?.currentVersion ?? '—'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Build {APP_BUILD_NUMBER}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Required
              </Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {info?.minimumVersion ?? '—'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Latest {info?.latestVersion ?? '—'}
              </Text>
            </View>
          </View>

          {notes.length > 0 ? (
            <View style={styles.notes}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                Release Notes
              </Text>
              {notes.map((line, index) => (
                <Text
                  key={index}
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                >
                  {'\u2022'} {line}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.actionArea}>
            {downloading ? (
              <View>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 10 }}
                >
                  Downloading update... {downloadProgress}%
                </Text>
                <ProgressBar
                  progress={downloadProgress / 100}
                  color={theme.colors.primary}
                  style={styles.progress}
                />
              </View>
            ) : installing ? (
              <View style={styles.installing}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: 10 }}
                >
                  Installing update...
                </Text>
              </View>
            ) : error ? (
              <View>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 6 }}
                >
                  {error}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 14 }}
                >
                  Please check your internet connection and try again.
                </Text>
                <Button
                  mode="contained"
                  onPress={onRetry}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  RETRY
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={onUpdateNow}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                UPDATE NOW
              </Button>
            )}
          </View>

          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 18 }}
          >
            This update is required to continue using {APP_NAME}.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  band: {
    height: 268,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emblem: {
    width: 92,
    height: 92,
    borderRadius: 46,
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
  card: {
    marginTop: -26,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowColor: '#0B7F74',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  cardTitle: {
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
  },
  notes: {
    marginBottom: 18,
  },
  actionArea: {
    marginTop: 4,
  },
  progress: {
    height: 8,
    borderRadius: 4,
  },
  installing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  button: {
    borderRadius: 28,
    height: 52,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    letterSpacing: 1.2,
  },
});
