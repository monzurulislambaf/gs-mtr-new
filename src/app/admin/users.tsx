import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import {
  Text,
  useTheme,
  Dialog,
  Portal,
  Snackbar,
  TextInput,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteUser, getAllUsers, setUserRole } from '@/firebase/userService';
import { useAuthStore } from '@/store/authStore';
import { isAdminRole, UserProfile } from '@/types/auth';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { StatusBadge, STATUS_COLORS } from '@/components/ui/StatusBadge';
import { UserManageDialog } from '@/components/admin/UserManageDialog';
import { getFriendlyErrorMessage } from '@/utils/errors';

type Action = 'make-admin' | 'make-user' | 'delete';

export default function UserManagementScreen() {
  const theme = useTheme();
  const me = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Failed to load users'));
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
      if (action === 'make-admin') {
        await setUserRole(selected.uid, 'admin');
        showSnackbar(`${selected.fullName || selected.email} is now an admin.`);
      } else if (action === 'make-user') {
        await setUserRole(selected.uid, 'user');
        showSnackbar(`${selected.fullName || selected.email} is now a regular user.`);
      } else if (action === 'delete') {
        await deleteUser(selected.uid, selected.bdNumber);
        showSnackbar(`${selected.fullName || selected.email} deleted.`);
      }
      setShowDeleteDialog(false);
      setSelected(null);
      load();
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Action failed'));
    } finally {
      setBusy(false);
    }
  }

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.bdNumber.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const canManage =
    !!selected &&
    !!me &&
    isAdminRole(me.role) &&
    me.uid !== selected.uid &&
    selected.role !== 'super_admin';

  // Only regular users can be deleted directly. To delete an admin you must
  // first demote them via "Remove Admin", then the delete option appears.
  const canDelete =
    !!selected &&
    !!me &&
    isAdminRole(me.role) &&
    me.uid !== selected.uid &&
    selected.role === 'user';

  const renderItem = useCallback(
    ({ item }: { item: UserProfile }) => {
      const color = STATUS_COLORS[item.status] || '#9E9E9E';
      return (
        <Pressable
          onPress={() => setSelected(item)}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardRow}>
            <ContactAvatar name={item.fullName || item.email || '?'} size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="titleSmall" style={{ fontWeight: '700' }} numberOfLines={1}>
                {item.fullName || item.email || 'Unnamed'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                BD {item.bdNumber || '—'} · {item.category}
                {item.rank ? ` · ${item.rank}` : ''}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                {item.mobile || item.email}
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
      <TextInput
        mode="outlined"
        placeholder="Search by BD Number"
        value={query}
        onChangeText={setQuery}
        left={<TextInput.Icon icon="magnify" />}
        right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
        style={styles.search}
        autoCorrect={false}
        autoCapitalize="characters"
      />
      <FlatList
        data={visibleUsers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.center}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {query ? 'No users match your search' : 'No users found'}
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      />

      <Portal>
        <UserManageDialog
          visible={!!selected}
          user={selected}
          canManage={canManage}
          canDelete={canDelete}
          busy={busy}
          onDismiss={() => setSelected(null)}
          onMakeAdmin={() => runAction('make-admin')}
          onMakeUser={() => runAction('make-user')}
          onRequestDelete={() => setShowDeleteDialog(true)}
        />

        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete User?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will permanently delete {selected?.fullName || selected?.email || 'this user'} and revoke
              their login access. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
              onPress={() => runAction('delete')}
              loading={busy}
              disabled={busy}
            >
              Delete
            </Button>
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
  search: { marginHorizontal: 16, marginTop: 12, marginBottom: 6, borderRadius: 12 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chips: { gap: 4, alignItems: 'flex-end' },
});