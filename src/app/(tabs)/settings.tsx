import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import {
  Text,
  Button,
  List,
  Divider,
  Badge,
  useTheme,
  Dialog,
  Portal,
  Snackbar,
  RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useContactsStore } from '@/store/contactsStore';
import { usePendingRegistrations } from '@/hooks/usePendingRegistrations';
import { getAllContactsCount } from '@/database/database';
import { exportContactsToCsv, bulkImportFromCsv } from '@/services/csvService';
import { bulkImportContacts } from '@/firebase/firestore';
import { APP_NAME, APP_VERSION } from '@/utils/constants';
import { HeaderActions } from '@/components/ui/HeaderActions';

export default function SettingsScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const { theme: themeMode, setTheme } = useSettingsStore();
  const reloadContacts = useContactsStore((s) => s.loadContacts);

  const [contactCount, setContactCount] = useState(0);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const { count: pendingCount } = usePendingRegistrations(isAdmin);

  useEffect(() => {
    getAllContactsCount().then(setContactCount);
  }, []);

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportContactsToCsv();
      showSnackbar('Contacts exported');
    } catch (e: any) {
      showSnackbar(e.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const result = await bulkImportFromCsv(bulkImportContacts);
      await reloadContacts();
      getAllContactsCount().then(setContactCount);
      showSnackbar(`Imported: ${result.imported}, Skipped: ${result.skipped}`);
    } catch (e: any) {
      showSnackbar(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  async function handleLogout() {
    await logout();
    setShowLogoutDialog(false);
    showSnackbar('Signed out successfully');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: '600' }}>
          Settings
        </Text>
        <HeaderActions />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Account
          </List.Subheader>
          {user ? (
            <>
              <List.Item
                title={user.displayName || user.email || ''}
                description={user.email}
                left={(props) => <List.Icon {...props} icon="account-circle" />}
              />
            </>
          ) : (
            <List.Item
              title="Sign In"
              description="Sign in for full access"
              left={(props) => <List.Icon {...props} icon="login" />}
              onPress={() => router.push('/(auth)/login' as any)}
            />
          )}
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Appearance
          </List.Subheader>
          <List.Item
            title="Theme"
            description={themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            onPress={() => setShowThemeDialog(true)}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Synchronization
          </List.Subheader>
          <List.Item
            title="Synced Contacts"
            description={`${contactCount} contacts`}
            left={(props) => <List.Icon {...props} icon="contacts" />}
          />
        </List.Section>

        {isAdmin && (
          <>
            <Divider />

            <List.Section>
              <List.Subheader style={{ color: theme.colors.primary }}>
                Administration
              </List.Subheader>
              <List.Item
                title="Pending Approvals"
                description="Review new registration requests"
                left={(props) => <List.Icon {...props} icon="account-clock" />}
                right={(props) =>
                  pendingCount > 0 ? (
                    <View style={styles.badgeWrap}>
                      <Badge visible={pendingCount > 0} size={22}>
                        {pendingCount}
                      </Badge>
                    </View>
                  ) : null
                }
                onPress={() => router.push('/admin/pending-approvals' as any)}
              />
              <List.Item
                title="User Management"
                description="View and manage all users"
                left={(props) => <List.Icon {...props} icon="account-group" />}
                onPress={() => router.push('/admin/users' as any)}
              />
            </List.Section>
          </>
        )}

        {isAdmin && (
          <>
            <Divider />

            <List.Section>
              <List.Subheader style={{ color: theme.colors.primary }}>
                Data Management
              </List.Subheader>
              <List.Item
                title="Export Contacts (CSV)"
                description="Download all contacts as CSV file"
                left={(props) => <List.Icon {...props} icon="file-export" />}
                onPress={handleExport}
                disabled={exporting}
              />
              <List.Item
                title="Import Contacts (CSV)"
                description="Upload contacts from CSV file"
                left={(props) => <List.Icon {...props} icon="file-import" />}
                onPress={handleImport}
                disabled={importing}
              />
            </List.Section>
          </>
        )}

        <Divider />

        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            About
          </List.Subheader>
          <List.Item
            title={APP_NAME}
            description={`Version ${APP_VERSION}`}
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Developed by"
            description="BD/470504 Sgt Monzurul GS"
            left={(props) => <List.Icon {...props} icon="account-tie" />}
          />
          <List.Item
            title="Email"
            description="monzurulislambaf@gmail.com"
            left={(props) => <List.Icon {...props} icon="email" />}
            onPress={() => Linking.openURL('mailto:monzurulislambaf@gmail.com')}
          />
          <List.Item
            title="GitHub"
            description="github.com/monzurulislambaf"
            left={(props) => <List.Icon {...props} icon="github" />}
            onPress={() => Linking.openURL('https://github.com/monzurulislambaf')}
          />
        </List.Section>

        {user && (
          <>
            <Divider />
            <View style={styles.logoutSection}>
              <Button
                mode="outlined"
                onPress={() => setShowLogoutDialog(true)}
                textColor={theme.colors.error}
                style={styles.logoutButton}
              >
                Sign Out
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={showThemeDialog} onDismiss={() => setShowThemeDialog(false)}>
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(v) => {
                setTheme(v as any);
                setShowThemeDialog(false);
              }}
              value={themeMode}
            >
              <RadioButton.Item label="System" value="system" />
              <RadioButton.Item label="Light" value="light" />
              <RadioButton.Item label="Dark" value="dark" />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>

        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>Sign Out</Button>
          </Dialog.Actions>
        </Dialog>

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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  scroll: {
    paddingBottom: 80,
  },
  badgeWrap: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  logoutSection: {
    padding: 24,
    alignItems: 'center',
  },
  logoutButton: {
    borderRadius: 24,
    minWidth: 200,
  },
});
