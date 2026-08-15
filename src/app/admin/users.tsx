import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Dialog,
  Portal,
  Snackbar,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllUsers, setUserStatus, setUserRole } from '@/firebase/userService';
import { useAuthStore } from '@/store/authStore';
import { isAdminRole, isSuperAdminRole, UserProfile } from '@/types/auth';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { StatusBadge, STATUS_COLORS } from '@/components/ui/StatusBadge';

type Action = 'approve' | 'decline' | 'suspend' | 'activate' | 'make-admin' | 'make-user';

export default function UserManagementScreen() {
  const theme = useTheme();
  const me = useAuthStore((s) => s.user);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (e: any) {
      showSnackbar(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  async function runAction(action: Action) {
    if (!selected) return;
    setBusy(true);
    try {
      if (action === 'approve') {
        await setUserStatus(selected.uid, 'approved', me?.uid || '');
        showSnackbar(`${selected.fullName || selected.email} approved.`);
      } else if (action === 'decline') {
        await setUserStatus(selected.uid, 'declined', me?.uid || '', declineReason);
        showSnackbar(`${selected.fullName || selected.email} declined.`);
      } else if (action === 'suspend') {
        await setUserStatus(selected.uid, 'suspended', me?.uid || '');
        showSnackbar(`${selected.fullName || selected.email} suspended.`);
      } else if (action === 'activate') {
        await setUserStatus(selected.uid, 'approved', me?.uid || '');
        showSnackbar(`${selected.fullName || selected.email} activated.`);
      } else if (action === 'make-admin') {
        await setUserRole(selected.uid, 'admin');
        showSnackbar(`${selected.fullName || selected.email} is now an admin.`);
      } else if (action === 'make-user') {
        await setUserRole(selected.uid, 'user');
        showSnackbar(`${selected.fullName || selected.email} is now a regular user.`);
      }
      setSelected(null);
      setDeclineReason('');
      load();
    } catch (e: any) {
      showSnackbar(e.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  const renderItem = useCallback(
    ({ item }: { item: UserProfile }) => {
      const color = STATUS_COLORS[item.status] || '#9E9E9E';
      return (
        <Pressable
          onPress={() => { setSelected(item); setDeclineReason(''); }}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
              shadowColor: theme.dark ? '#000000' : '#0B7F74',
            },
            pressed && { transform: [{ scale: 0.985 }], opacity: 0.9 },
          ]}
        >
          <ContactAvatar name={item.fullName || item.email || '?'} size={42} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="titleSmall" style={{ fontWeight: '600' }} numberOfLines={1}>
              {item.fullName || item.email || 'Unnamed'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              BD {item.bdNumber || '—'} · {item.category}
              {item.rank ? ` · ${item.rank}` : ''}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
          <View style={styles.chips}>
            <StatusBadge label={item.status} color={color} />
            <StatusBadge
              label={item.role.replace('_', ' ')}
              color={isAdminRole(item.role) ? theme.colors.primary : undefined}
              dot={false}
            />
          </View>
        </Pressable>
      );
    },
    [theme]
  );

  const keyExtractor = useCallback((item: UserProfile) => item.uid, []);

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              No users found
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      />

      <Portal>
        <Dialog visible={!!selected} onDismiss={() => setSelected(null)}>
          {selected && (
            <>
              <View style={styles.dialogHeader}>
                <ContactAvatar name={selected.fullName || selected.email || '?'} size={48} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Dialog.Title style={styles.dialogTitle}>
                    {selected.fullName || selected.email || 'User'}
                  </Dialog.Title>
                  <View style={styles.dialogChips}>
                    <StatusBadge label={selected.status} color={STATUS_COLORS[selected.status] || undefined} />
                    <StatusBadge
                      label={selected.role.replace('_', ' ')}
                      color={isAdminRole(selected.role) ? theme.colors.primary : undefined}
                      dot={false}
                    />
                  </View>
                </View>
              </View>
              <Dialog.Content>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                  BD {selected.bdNumber || '—'} · {selected.category}
                  {selected.rank ? ` · ${selected.rank}` : ''}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                  {selected.email}
                </Text>

                {(selected.status === 'pending' ||
                  selected.status === 'approved' ||
                  selected.status === 'declined' ||
                  selected.status === 'suspended') && (
                  <>
                    <Divider style={{ marginVertical: 10 }} />
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, letterSpacing: 0.5 }}>
                      ACCOUNT STATUS
                    </Text>
                    <View style={styles.dialogActions}>
                      {selected.status === 'pending' && (
                        <>
                          <Button
                            mode="contained"
                            onPress={() => runAction('approve')}
                            loading={busy}
                            disabled={busy}
                            style={{ flex: 1, borderRadius: 22 }}
                          >
                            Approve
                          </Button>
                          <Button
                            mode="outlined"
                            textColor={theme.colors.error}
                            onPress={() => runAction('decline')}
                            loading={busy}
                            disabled={busy}
                            style={{ flex: 1, borderRadius: 22 }}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {selected.status === 'approved' && (
                        <Button
                          mode="outlined"
                          textColor={theme.colors.error}
                          onPress={() => runAction('suspend')}
                          loading={busy}
                          disabled={busy}
                          style={{ borderRadius: 22 }}
                        >
                          Suspend Account
                        </Button>
                      )}
                      {(selected.status === 'declined' || selected.status === 'suspended') && (
                        <Button
                          mode="contained"
                          onPress={() => runAction('activate')}
                          loading={busy}
                          disabled={busy}
                          style={{ borderRadius: 22 }}
                        >
                          Approve / Activate
                        </Button>
                      )}
                    </View>

                    {selected.status === 'declined' && (
                      <>
                        <TextInput
                          label="Decline reason"
                          value={declineReason}
                          onChangeText={setDeclineReason}
                          mode="outlined"
                          multiline
                          numberOfLines={2}
                          style={{ marginTop: 12, borderRadius: 12 }}
                        />
                        <Button
                          mode="outlined"
                          textColor={theme.colors.error}
                          onPress={() => runAction('decline')}
                          loading={busy}
                          disabled={busy}
                          style={{ marginTop: 8, borderRadius: 22 }}
                        >
                          Update Decline
                        </Button>
                      </>
                    )}
                  </>
                )}

                {isSuperAdmin && me?.uid !== selected.uid && (
                  <>
                    <Divider style={{ marginVertical: 10 }} />
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, letterSpacing: 0.5 }}>
                      ROLE
                    </Text>
                    <View style={[styles.dialogActions, { marginTop: 8 }]}>
                      {isAdminRole(selected.role) ? (
                        <Button mode="outlined" onPress={() => runAction('make-user')} loading={busy} disabled={busy} style={{ borderRadius: 22 }}>
                          Remove Admin
                        </Button>
                      ) : (
                        <Button mode="outlined" onPress={() => runAction('make-admin')} loading={busy} disabled={busy} style={{ borderRadius: 22 }}>
                          Make Admin
                        </Button>
                      )}
                    </View>
                  </>
                )}
              </Dialog.Content>
            </>
          )}
          <Dialog.Actions>
            <Button onPress={() => setSelected(null)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={2500}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  chips: { gap: 4, alignItems: 'flex-end' },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  dialogTitle: { marginBottom: 0, paddingLeft: 0 },
  dialogChips: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
