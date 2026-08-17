import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  ActivityIndicator,
  Dialog,
  Portal,
  Snackbar,
  TextInput,
  Divider,
  Icon,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getUserProfileById, approveRegistration, declineRegistration } from '@/firebase/userService';
import { useAuthStore } from '@/store/authStore';
import { CATEGORY_LABELS, UserProfile } from '@/types/auth';
import { formatDateTime } from '@/utils/formatters';
import { getFriendlyErrorMessage } from '@/utils/errors';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { StatusBadge, STATUS_COLORS } from '@/components/ui/StatusBadge';

function FieldRow({ label, value }: { label: string; value?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.fieldRow}>
      <Text variant="bodySmall" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ flex: 1, textAlign: 'right', fontWeight: '500' }}>
        {value || '—'}
      </Text>
    </View>
  );
}

export default function ApprovalDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const admin = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveDialog, setApproveDialog] = useState(false);
  const [declineDialog, setDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    getUserProfileById(id)
      .then((p) => {
        if (mounted) setProfile(p);
      })
      .catch((e: any) => {
        if (mounted) {
          showSnackbar(getFriendlyErrorMessage(e, 'Failed to load registration details'));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  async function handleApprove() {
    if (!profile || !admin) return;
    setBusy(true);
    try {
      await approveRegistration(profile.uid, admin.uid);
      setApproveDialog(false);
      showSnackbar('Registration approved successfully.');
      setTimeout(() => router.back(), 600);
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Approval failed'));
      setApproveDialog(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    if (!profile || !admin) return;
    setBusy(true);
    try {
      await declineRegistration(profile.uid, admin.uid, declineReason);
      setDeclineDialog(false);
      showSnackbar('Registration declined.');
      setTimeout(() => router.back(), 600);
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Decline failed'));
      setDeclineDialog(false);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Registration not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isStillPending = profile.status === 'pending';
  const labels = CATEGORY_LABELS[profile.category];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <ContactAvatar name={profile.fullName || '?'} size={64} />
          <View style={styles.profileText}>
            <Text variant="titleLarge" numberOfLines={1} style={{ fontWeight: '600' }}>
              {profile.fullName || 'Unnamed'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {profile.category}
              {profile.rank ? ` · ${profile.rank}` : ''} · BD {profile.bdNumber || '—'}
            </Text>
          </View>
          <StatusBadge label={profile.status} color={STATUS_COLORS[profile.status] || undefined} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <View style={styles.sectionTitle}>
            <Icon source="badge-account-outline" size={18} color={theme.colors.primary} />
            <Text variant="labelLarge" style={{ color: theme.colors.primary, letterSpacing: 0.6 }}>
              REGISTRATION INFORMATION
            </Text>
          </View>
          <Divider style={styles.sectionDivider} />
          <FieldRow label="Full Name" value={profile.fullName} />
          <FieldRow label="Category" value={profile.category} />
          <FieldRow label="BD Number" value={profile.bdNumber} />
          <FieldRow label="Retired" value={profile.retired ? 'Yes' : 'No'} />
          <FieldRow label="Rank" value={profile.rank} />
          <FieldRow label={labels.branch} value={profile.branch} />
          {labels.course && <FieldRow label={labels.course!} value={profile.course} />}
          <FieldRow label={labels.date} value={profile.commissionDate} />
          <FieldRow label="Designation" value={profile.designation} />
          <FieldRow label="Office/Unit" value={profile.office} />
          <FieldRow label="Email" value={profile.email} />
          <FieldRow label="Mobile" value={profile.mobile} />
          <FieldRow label="Registration Date" value={formatDateTime(profile.createdAt)} />
        </View>

        {isStillPending ? (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => setApproveDialog(true)}
              disabled={busy}
              style={styles.approveButton}
              contentStyle={styles.actionContent}
              icon="check-circle-outline"
              labelStyle={styles.actionLabel}
            >
              Approve Registration
            </Button>
            <Button
              mode="outlined"
              onPress={() => setDeclineDialog(true)}
              disabled={busy}
              textColor={theme.colors.error}
              style={styles.declineButton}
              contentStyle={styles.actionContent}
              icon="close-circle-outline"
              labelStyle={styles.actionLabel}
            >
              Decline Registration
            </Button>
          </View>
        ) : (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 20 }}>
            This registration has already been processed (status: {profile.status}).
          </Text>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={approveDialog} onDismiss={() => setApproveDialog(false)}>
          <Dialog.Title>Approve Registration</Dialog.Title>
          <Dialog.Content>
            <Text>
              Approve registration for {profile.fullName} (BD {profile.bdNumber})?
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              The user will immediately get access to GS MTR contacts.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setApproveDialog(false)}>Cancel</Button>
            <Button onPress={handleApprove} loading={busy} disabled={busy}>
              Approve
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={declineDialog} onDismiss={() => setDeclineDialog(false)}>
          <Dialog.Title>Decline Registration</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 12 }}>
              Please provide a reason for declining this registration.
            </Text>
            <TextInput
              label="Reason for decline"
              value={declineReason}
              onChangeText={setDeclineReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ borderRadius: 12 }}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              The user will see this reason on their account status screen.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeclineDialog(false)}>Cancel</Button>
            <Button onPress={handleDecline} loading={busy} disabled={busy} textColor={theme.colors.error}>
              Decline
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
  scroll: { padding: 16, paddingBottom: 80 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  profileText: { flex: 1, minWidth: 0 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDivider: { marginVertical: 10 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginVertical: 5,
  },
  fieldLabel: { minWidth: 140 },
  actions: { marginTop: 24, gap: 12 },
  approveButton: { borderRadius: 26, height: 52 },
  declineButton: { borderRadius: 26, height: 52 },
  actionContent: { height: 52 },
  actionLabel: { letterSpacing: 0.6, fontWeight: '600' },
});
