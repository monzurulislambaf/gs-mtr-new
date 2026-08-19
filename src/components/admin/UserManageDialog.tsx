import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Dialog, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { StatusBadge, STATUS_COLORS } from '@/components/ui/StatusBadge';
import { isAdminRole, UserProfile } from '@/types/auth';

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: `${theme.colors.primary}1A` }]}>
        <Ionicons name={icon} size={15} color={theme.colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

interface UserManageDialogProps {
  visible: boolean;
  user: UserProfile | null;
  canManage: boolean;
  /** Whether this user may be permanently deleted. Reserved for super admins. */
  canDelete?: boolean;
  busy: boolean;
  showMakeAdmin?: boolean;
  onDismiss: () => void;
  onMakeAdmin?: () => void;
  onMakeUser: () => void;
  onRequestDelete: () => void;
}

export function UserManageDialog({
  visible,
  user,
  canManage,
  canDelete = false,
  busy,
  showMakeAdmin = true,
  onDismiss,
  onMakeAdmin,
  onMakeUser,
  onRequestDelete,
}: UserManageDialogProps) {
  const theme = useTheme();
  if (!user) return null;
  const radius = 7 * theme.roundness;

  const rows = [
    { icon: 'call' as const, label: 'Mobile', value: user.mobile },
    { icon: 'mail' as const, label: 'Email', value: user.email },
    { icon: 'ribbon' as const, label: 'Rank', value: user.rank },
    { icon: 'business' as const, label: 'Category', value: user.category },
    { icon: 'briefcase' as const, label: 'Designation', value: user.designation },
  ].filter((r) => !!r.value);

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>
        <View style={[styles.band, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={[styles.avatarRing, { borderColor: theme.colors.primary }]}>
            <ContactAvatar name={user.fullName || user.email || '?'} size={60} />
          </View>
          <View style={styles.bandText}>
            <Text
              variant="headlineSmall"
              style={[styles.bandName, { color: theme.colors.onPrimaryContainer }]}
              numberOfLines={1}
            >
              {user.fullName || user.email || 'User'}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}
              numberOfLines={1}
            >
              BD {user.bdNumber || '—'}
              {user.rank ? ` · ${user.rank}` : ''}
            </Text>
            <View style={styles.bandBadges}>
              <StatusBadge label={user.status} color={STATUS_COLORS[user.status] || undefined} />
              <StatusBadge
                label={user.role.replace('_', ' ')}
                color={isAdminRole(user.role) ? theme.colors.primary : undefined}
                dot={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {rows.length > 0 && (
            <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceVariant }]}>
              {rows.map((row, i) => (
                <View key={row.label}>
                  {i > 0 && (
                    <View style={[styles.sheetDivider, { backgroundColor: theme.colors.outlineVariant }]} />
                  )}
                  <InfoRow icon={row.icon} label={row.label} value={row.value} />
                </View>
              ))}
            </View>
          )}

          {canManage && (
            <>
              <View style={styles.section}>
                <Text
                  variant="labelLarge"
                  style={{ color: theme.colors.primary, letterSpacing: 0.5, fontWeight: '700' }}
                >
                  MANAGE ROLE
                </Text>
                {isAdminRole(user.role) ? (
                  <Button
                    mode="outlined"
                    icon="person-remove"
                    textColor={theme.colors.error}
                    onPress={onMakeUser}
                    loading={busy}
                    disabled={busy}
                    style={styles.actionButton}
                  >
                    Remove Admin
                  </Button>
                ) : showMakeAdmin && onMakeAdmin ? (
                  <Button
                    mode="contained"
                    icon="person-add"
                    onPress={onMakeAdmin}
                    loading={busy}
                    disabled={busy}
                    style={styles.actionButton}
                  >
                    Make Admin
                  </Button>
                ) : null}
              </View>

              {canDelete && (
                <View style={styles.section}>
                  <Text
                    variant="labelLarge"
                    style={{ color: theme.colors.error, letterSpacing: 0.5, fontWeight: '700' }}
                  >
                    DELETE ACCOUNT
                  </Text>
                  <Button
                    mode="outlined"
                    icon="trash-bin"
                    textColor={theme.colors.error}
                    onPress={onRequestDelete}
                    disabled={busy}
                    style={styles.actionButton}
                  >
                    Delete User
                  </Button>
                </View>
              )}
            </>
          )}
        </View>

        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  avatarRing: {
    borderRadius: 34,
    borderWidth: 2,
    padding: 3,
  },
  bandText: {
    flex: 1,
    minWidth: 0,
  },
  bandName: {
    fontWeight: '700',
  },
  bandBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  body: {
    padding: 20,
  },
  sheet: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  section: {
    marginTop: 20,
  },
  actionButton: {
    marginTop: 10,
    borderRadius: 14,
  },
});
