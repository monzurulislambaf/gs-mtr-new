<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
=======
import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
import {
  Text,
  Button,
  IconButton,
  useTheme,
  Divider,
  Card,
  Dialog,
  Portal,
  Snackbar,
<<<<<<< HEAD
=======
  List,
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { Contact } from '@/types/contact';
import * as db from '@/database/database';
<<<<<<< HEAD
import { getContact } from '@/firebase/firestore';
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
import { deleteContact } from '@/services/contactService';
import { useAuthStore } from '@/store/authStore';
import { makePhoneCall, copyToClipboard } from '@/utils/permissions';
import { formatPhone, formatDateTime } from '@/utils/formatters';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

<<<<<<< HEAD
=======
interface FieldRowProps {
  label: string;
  value: string;
  isPhone?: boolean;
  theme: any;
}

function FieldRow({ label, value, isPhone, theme }: FieldRowProps) {
  if (!value) return null;
  return (
    <View style={styles.fieldRow}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <View style={styles.fieldValueRow}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, flex: 1 }}>
          {isPhone ? formatPhone(value) : value}
        </Text>
        {isPhone && (
          <View style={styles.fieldActions}>
            <IconButton
              icon="phone"
              size={20}
              onPress={() => makePhoneCall(value)}
            />
            <IconButton
              icon="content-copy"
              size={20}
              onPress={() => {
                copyToClipboard(value);
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
export default function ContactDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
<<<<<<< HEAD
  const isAdmin = useAuthStore((s) => s.isAdmin);
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
<<<<<<< HEAD
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        let c = await db.getContactById(id);
        if (!c) {
          c = await getContact(id);
          if (c) await db.upsertContacts([c]);
        }
        if (!cancelled) {
          setContact(c);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setContact(null);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
=======
    if (id) {
      db.getContactById(id).then((c) => {
        setContact(c);
        setLoading(false);
      });
    }
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  }, [id]);

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  async function handleDelete() {
    if (!contact) return;
    try {
      await deleteContact(contact.id);
      setShowDeleteDialog(false);
      showSnackbar('Contact deleted');
      router.back();
    } catch (e: any) {
      showSnackbar(e.message || 'Delete failed');
    }
  }

  async function handleShare() {
    if (!contact) return;
<<<<<<< HEAD
    const nameLine = `${contact.RANK ? contact.RANK + ' ' : ''}${contact.NAME}`;
    const text = [
      nameLine,
      contact['BD NO'] ? `BD No: ${contact['BD NO']}` : '',
      contact.DESIGNATION ? `Designation: ${contact.DESIGNATION}` : '',
      contact['BRANCH / TRADE'] ? `Branch/Trade: ${contact['BRANCH / TRADE']}` : '',
      contact['OFFICE ADDRESS'] ? `Office Address: ${contact['OFFICE ADDRESS']}` : '',
      contact['RESIDENCE ADDRESS'] ? `Residence Address: ${contact['RESIDENCE ADDRESS']}` : '',
      contact['SERVICE MOBILE'] ? `Service Mobile: ${contact['SERVICE MOBILE']}` : '',
      contact['PERSONAL MOBILE'] ? `Personal Mobile: ${contact['PERSONAL MOBILE']}` : '',
      contact['OFFICE TELEPHONE'] ? `Office Telephone: ${contact['OFFICE TELEPHONE']}` : '',
      contact['PERSONAL TELEPHONE'] ? `Residence Telephone: ${contact['PERSONAL TELEPHONE']}` : '',
      contact.REMARKS ? `Remarks: ${contact.REMARKS}` : '',
=======
    const text = [
      `Name: ${contact.NAME}`,
      `Rank: ${contact.RANK}`,
      `BD No: ${contact['BD NO']}`,
      contact.DESIGNATION ? `Designation: ${contact.DESIGNATION}` : '',
      contact.OFFICE ? `Office: ${contact.OFFICE}` : '',
      contact['SERVICE MOBILE'] ? `Service Mobile: ${contact['SERVICE MOBILE']}` : '',
      contact['PERSONAL MOBILE'] ? `Personal Mobile: ${contact['PERSONAL MOBILE']}` : '',
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    ].filter(Boolean).join('\n');

    try {
      const fileUri = `${FileSystem.cacheDirectory}contact_${contact.id}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, { dialogTitle: `Share ${contact.NAME}` });
    } catch {}
  }

<<<<<<< HEAD
  if (loading) {
=======
  async function handleCopyNumber(field: string) {
    if (!contact) return;
    const number = field === 'SERVICE MOBILE' ? contact['SERVICE MOBILE'] : contact['PERSONAL MOBILE'];
    if (number) {
      await copyToClipboard(number);
      showSnackbar('Number copied');
    }
  }

  if (loading || !contact) {
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

<<<<<<< HEAD
  if (!contact) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text variant="titleMedium">Contact not found</Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const phones: { label: string; value: string }[] = [];
  if (contact['SERVICE MOBILE']) phones.push({ label: 'Service Mobile', value: contact['SERVICE MOBILE'] });
  if (contact['PERSONAL MOBILE']) phones.push({ label: 'Personal Mobile', value: contact['PERSONAL MOBILE'] });
  if (contact['OFFICE TELEPHONE']) phones.push({ label: 'Office Telephone', value: contact['OFFICE TELEPHONE'] });
  if (contact['PERSONAL TELEPHONE']) phones.push({ label: 'Residence Telephone', value: contact['PERSONAL TELEPHONE'] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerActions}>
          <IconButton
            icon="share-variant"
            size={22}
            onPress={handleShare}
            // @ts-ignore
            color={theme.colors.onSurfaceVariant}
          />
          {isAdmin && (
            <IconButton
              icon="pencil"
              size={22}
              onPress={() => router.push(`/contact/edit/${contact.id}` as any)}
              // @ts-ignore
              color={theme.colors.onSurfaceVariant}
            />
          )}
        </View>

        <View style={styles.avatarSection}>
          <ContactAvatar name={contact.NAME} size={88} />
          <View style={styles.nameRow}>
            {contact.RANK ? (
              <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {contact.RANK}{' '}
              </Text>
            ) : null}
            <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
              {contact.NAME}
            </Text>
          </View>
          {contact['BD NO'] ? (
            <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              BD No: {contact['BD NO']}
            </Text>
          ) : null}
          {contact.DESIGNATION ? (
            <Text variant="bodyMedium" style={styles.designation}>
              {contact.DESIGNATION}
            </Text>
          ) : null}
          {contact['BRANCH / TRADE'] ? (
            <Text variant="labelMedium" style={styles.branch}>
              {contact['BRANCH / TRADE']}
            </Text>
          ) : null}
        </View>

        {(contact['OFFICE ADDRESS'] || contact['RESIDENCE ADDRESS']) && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Card.Content>
              {contact['OFFICE ADDRESS'] ? (
                <View style={styles.addressBlock}>
                  <Text variant="labelSmall" style={styles.addressLabel}>
                    OFFICE ADDRESS
                  </Text>
                  <Text variant="bodySmall" style={styles.addressValue}>
                    {contact['OFFICE ADDRESS']}
                  </Text>
                </View>
              ) : null}
              {contact['RESIDENCE ADDRESS'] ? (
                <View style={styles.addressBlock}>
                  <Text variant="labelSmall" style={styles.addressLabel}>
                    RESIDENCE ADDRESS
                  </Text>
                  <Text variant="bodySmall" style={styles.addressValue}>
                    {contact['RESIDENCE ADDRESS']}
                  </Text>
                </View>
              ) : null}
            </Card.Content>
          </Card>
        )}

        {phones.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={0}>
            <Card.Content>
              {phones.map((p, i) => (
                <View key={p.label}>
                  {i > 0 && <Divider style={styles.divider} />}
                  <View style={styles.phoneRow}>
                    <View style={styles.phoneLeft}>
                      <Text variant="labelSmall" style={styles.phoneLabel}>
                        {p.label}
                      </Text>
                      <Text variant="titleMedium" style={styles.phoneValue}>
                        {formatPhone(p.value)}
                      </Text>
                    </View>
                    <View style={styles.phoneActions}>
                      <IconButton
                        icon="phone"
                        size={20}
                        onPress={() => makePhoneCall(p.value)}
                        // @ts-ignore
                        color={theme.colors.primary}
                      />
                      <IconButton
                        icon="content-copy"
                        size={20}
                        onPress={async () => {
                          const ok = await copyToClipboard(p.value);
                          showSnackbar(ok ? `${p.label} copied` : 'Copy failed');
                        }}
                        // @ts-ignore
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {contact.REMARKS ? (
          <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Card.Content>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                REMARKS
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: 4 }}>
=======
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <ContactAvatar name={contact.NAME} size={80} />
          <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
            {contact.NAME}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {contact.RANK}
            {contact['BD NO'] ? ` | ${contact['BD NO']}` : ''}
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <FieldRow label="BD NO" value={contact['BD NO']} theme={theme} />
            <FieldRow label="RANK" value={contact.RANK} theme={theme} />
            <FieldRow label="DESIGNATION" value={contact.DESIGNATION} theme={theme} />
            <FieldRow label="BRANCH / TRADE" value={contact['BRANCH / TRADE']} theme={theme} />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <FieldRow label="OFFICE" value={contact.OFFICE} theme={theme} />
            <FieldRow label="RESIDENCE" value={contact.RESIDENCE} theme={theme} />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <FieldRow
              label="SERVICE MOBILE"
              value={contact['SERVICE MOBILE']}
              isPhone
              theme={theme}
            />
            <FieldRow
              label="PERSONAL MOBILE"
              value={contact['PERSONAL MOBILE']}
              isPhone
              theme={theme}
            />
          </Card.Content>
        </Card>

        {contact.REMARKS ? (
          <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                REMARKS
              </Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
                {contact.REMARKS}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

<<<<<<< HEAD
        {isAdmin && (
          <Button
            mode="outlined"
            onPress={() => setShowDeleteDialog(true)}
            textColor={theme.colors.error}
            style={styles.deleteButton}
            icon="delete"
            contentStyle={styles.deleteButtonContent}
          >
            Delete Contact
          </Button>
=======
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <List.Item
              title="Call Service Mobile"
              description={formatPhone(contact['SERVICE MOBILE']) || 'Not available'}
              left={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => contact['SERVICE MOBILE'] && makePhoneCall(contact['SERVICE MOBILE'])}
              disabled={!contact['SERVICE MOBILE']}
            />
            <Divider />
            <List.Item
              title="Call Personal Mobile"
              description={formatPhone(contact['PERSONAL MOBILE']) || 'Not available'}
              left={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => contact['PERSONAL MOBILE'] && makePhoneCall(contact['PERSONAL MOBILE'])}
              disabled={!contact['PERSONAL MOBILE']}
            />
            <Divider />
            <List.Item
              title="Copy Service Number"
              left={(props) => <List.Icon {...props} icon="content-copy" />}
              onPress={() => handleCopyNumber('SERVICE MOBILE')}
              disabled={!contact['SERVICE MOBILE']}
            />
            <Divider />
            <List.Item
              title="Copy Personal Number"
              left={(props) => <List.Icon {...props} icon="content-copy" />}
              onPress={() => handleCopyNumber('PERSONAL MOBILE')}
              disabled={!contact['PERSONAL MOBILE']}
            />
            <Divider />
            <List.Item
              title="Share Contact"
              left={(props) => <List.Icon {...props} icon="share-variant" />}
              onPress={handleShare}
            />
          </Card.Content>
        </Card>

        {isAuthenticated && (
          <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content>
              <List.Item
                title="Edit Contact"
                left={(props) => <List.Icon {...props} icon="pencil" color={theme.colors.primary} />}
                onPress={() => router.push(`/contact/edit/${contact.id}` as any)}
              />
              <Divider />
              <List.Item
                title="Delete Contact"
                titleStyle={{ color: theme.colors.error }}
                left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
                onPress={() => setShowDeleteDialog(true)}
              />
            </Card.Content>
          </Card>
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
        )}

        <View style={styles.metaSection}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Created: {formatDateTime(contact.createdAt)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {formatDateTime(contact.updatedAt)}
          </Text>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Contact</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete {contact.NAME}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor={theme.colors.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={2000}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
<<<<<<< HEAD
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  scroll: { paddingBottom: 40 },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 16,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  name: { fontWeight: '700', textAlign: 'center' },
  designation: {
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  branch: {
    color: '#888',
    textAlign: 'center',
  },
=======
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 32 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  name: { fontWeight: '600', textAlign: 'center' },
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
<<<<<<< HEAD
  },
  addressBlock: {
    paddingVertical: 6,
  },
  addressLabel: {
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  addressValue: {
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  divider: { marginVertical: 4 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  phoneLeft: { flex: 1 },
  phoneLabel: {
    color: '#888',
    fontWeight: '600',
  },
  phoneValue: {
    marginTop: 2,
  },
  phoneActions: { flexDirection: 'row' },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
  },
  deleteButtonContent: { paddingVertical: 6 },
  metaSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
});
=======
    elevation: 0,
  },
  fieldRow: {
    paddingVertical: 8,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  fieldActions: {
    flexDirection: 'row',
  },
  metaSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
});
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
