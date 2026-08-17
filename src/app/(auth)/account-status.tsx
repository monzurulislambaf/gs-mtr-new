import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Snackbar, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/utils/constants';
import { getFriendlyErrorMessage } from '@/utils/errors';
import { AuthHeader } from '@/components/auth/AuthHeader';

function getStatusContent(status: string | undefined, declineReason?: string) {
  switch (status) {
    case 'pending':
      return {
        icon: 'hourglass-outline' as const,
        title: 'Registration Pending',
        message: 'You will get access to GS MTR contacts as soon as an administrator approves your registration.',
        detail: 'For urgent approval, please contact Ext: 10.',
      };
    case 'declined':
      return {
        icon: 'close-circle-outline' as const,
        title: 'Registration Declined',
        message: 'Your registration request was declined.',
        detail: declineReason
          ? `Reason: ${declineReason}`
          : 'Please contact the administrator for more information.',
      };
    case 'suspended':
      return {
        icon: 'ban-outline' as const,
        title: 'Account Suspended',
        message: 'Your account has been suspended. Please contact the administrator.',
        detail: '',
      };
    default:
      return {
        icon: 'shield-checkmark-outline' as const,
        title: 'Account Status',
        message: 'Your account is not yet approved for contact access.',
        detail: '',
      };
  }
}

export default function AccountStatusScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const content = getStatusContent(user?.status, user?.declineReason);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshProfile();
      // If the status is now approved, the root layout guard navigates to tabs.
      if (useAuthStore.getState().canAccessContacts) {
        router.replace('/(tabs)' as any);
      }
    } catch (e: any) {
      setSnackbar({
        visible: true,
        message: getFriendlyErrorMessage(e, 'Could not check your account status. Please try again.'),
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (e: any) {
      setSnackbar({
        visible: true,
        message: getFriendlyErrorMessage(e, 'Could not sign out. Please try again.'),
      });
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthHeader compact icon={content.icon} title={content.title} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.dark ? '#000000' : '#0B7F74',
            },
          ]}
        >
          <Text
            variant="titleLarge"
            style={[styles.message, { color: theme.colors.onSurface }]}
          >
            {content.message}
          </Text>
          {content.detail ? (
            <Text
              variant="bodyMedium"
              style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}
            >
              {content.detail}
            </Text>
          ) : null}

          {user?.bdNumber ? (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 12, textAlign: 'center' }}
            >
              {user.displayName} · BD {user.bdNumber}
            </Text>
          ) : null}

          <Button
            mode="outlined"
            onPress={handleRefresh}
            disabled={refreshing}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {refreshing ? 'Checking...' : 'Check Status'}
          </Button>

          <Button
            mode="text"
            onPress={handleLogout}
            textColor={theme.colors.error}
            style={styles.logoutButton}
            labelStyle={styles.buttonLabel}
          >
            Sign Out
          </Button>

          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 16, textAlign: 'center' }}
          >
            {APP_NAME}
          </Text>
        </View>
      </ScrollView>
      {refreshing ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      <Portal>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  card: {
    marginTop: -24,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    elevation: 6,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  message: {
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  detail: { textAlign: 'center', marginTop: 6, lineHeight: 20 },
  button: { borderRadius: 28, marginTop: 20, minWidth: 220 },
  buttonContent: { height: 50 },
  buttonLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 15,
    letterSpacing: 1,
  },
  logoutButton: { marginTop: 8 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
