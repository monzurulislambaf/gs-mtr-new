import { View, StyleSheet } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useSyncStore } from '@/store/syncStore';
import { spacing, radius, typography } from '@/theme';

function useIsDark(): boolean {
  const themeSetting = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  if (themeSetting === 'system') return systemScheme === 'dark';
  return themeSetting === 'dark';
}

export function HeaderActions() {
  const theme = useTheme();
  const isDark = useIsDark();
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isOnline = useSyncStore((s) => s.isOnline);

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const dotColor = isOnline ? '#34A853' : '#EA4335';

  return (
    <View style={styles.container}>
      <View style={[styles.status, { backgroundColor: dotColor + '22' }]}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text variant="labelSmall" style={[styles.statusText, { color: dotColor }]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
      <IconButton
        icon={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
        size={22}
        onPress={handleToggleTheme}
        // @ts-ignore
        color={theme.colors.onSurface}
        style={styles.iconBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs + spacing.xxs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.micro,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 0,
    margin: 0,
  },
});