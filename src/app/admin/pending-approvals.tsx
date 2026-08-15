import { useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator, FAB, Icon, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePendingRegistrations } from '@/hooks/usePendingRegistrations';
import { useAuthStore } from '@/store/authStore';
import { CATEGORY_LABELS, UserProfile } from '@/types/auth';
import { formatDateTime } from '@/utils/formatters';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { StatusBadge, STATUS_COLORS } from '@/components/ui/StatusBadge';

function InfoItem({ label, value, fullWidth }: { label: string; value?: string; fullWidth?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.infoItem, fullWidth && styles.infoItemFull]}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.3 }}>
        {label}
      </Text>
      <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '500', marginTop: 1 }}>
        {value || '—'}
      </Text>
    </View>
  );
}

function RegistrationItem({ profile, onPress }: { profile: UserProfile; onPress: () => void }) {
  const theme = useTheme();
  const labels = CATEGORY_LABELS[profile.category];
  return (
    <Pressable
      onPress={onPress}
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
      <View style={styles.cardHeader}>
        <ContactAvatar name={profile.fullName || '?'} size={46} />
        <View style={styles.nameBlock}>
          <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '600' }}>
            {profile.fullName || 'Unnamed'}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {profile.category}
            {profile.rank ? ` · ${profile.rank}` : ''}
            {profile.bdNumber ? ` · BD ${profile.bdNumber}` : ''}
          </Text>
        </View>
        <StatusBadge label="Pending" color={STATUS_COLORS.pending} />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.infoGrid}>
        <InfoItem label="BD Number" value={profile.bdNumber} />
        <InfoItem label="Retired" value={profile.retired ? 'Yes' : 'No'} />
        <InfoItem label={labels.branch} value={profile.branch} />
        {labels.course ? <InfoItem label={labels.course} value={profile.course} /> : null}
        <InfoItem label={labels.date} value={profile.commissionDate} />
        <InfoItem label="Designation" value={profile.designation} />
        <InfoItem label="Office/Unit" value={profile.office} />
        <InfoItem label="Mobile" value={profile.mobile} />
        <InfoItem label="Email" value={profile.email} fullWidth />
      </View>

      <View style={styles.cardFooter}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Registered {formatDateTime(profile.createdAt)}
        </Text>
        <Icon source="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
      </View>
    </Pressable>
  );
}

export default function PendingApprovalsScreen() {
  const theme = useTheme();
  const { users, count, loading, refresh } = usePendingRegistrations();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const renderItem = useCallback(
    ({ item }: { item: UserProfile }) => (
      <RegistrationItem
        profile={item}
        onPress={() => router.push(`/admin/approval/${item.uid}` as any)}
      />
    ),
    []
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
        ListHeaderComponent={
          count > 0 ? (
            <View style={[styles.summary, { backgroundColor: theme.colors.primaryContainer }]}>
              <Icon source="account-clock" size={20} color={theme.colors.onPrimaryContainer} />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onPrimaryContainer, fontWeight: '500', flex: 1 }}
              >
                {count} registration request{count === 1 ? '' : 's'} awaiting approval
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCard}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon source="account-check-outline" size={30} color={theme.colors.onSurfaceVariant} />
              </View>
              <Text variant="titleMedium" style={{ fontWeight: '600', marginTop: 12 }}>
                All caught up
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                New registration requests will appear here for your review.
              </Text>
            </View>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      />
      {isAdmin ? (
        <FAB
          icon="account-multiple-plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => router.push('/admin/users' as any)}
          label="Users"
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  list: { padding: 16, paddingBottom: 96 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameBlock: { flex: 1, minWidth: 0 },
  divider: { marginVertical: 12 },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  infoItem: { width: '50%', paddingRight: 12 },
  infoItemFull: { width: '100%' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  emptyWrap: { alignItems: 'center', paddingTop: 48 },
  emptyCard: { alignItems: 'center', paddingHorizontal: 24 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
