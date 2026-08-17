import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { Contact } from '@/types/contact';
import * as db from '@/database/database';
import { getContact } from '@/firebase/firestore';
import { deleteContact } from '@/services/contactService';
import { useAuthStore } from '@/store/authStore';
import { makePhoneCall, copyToClipboard } from '@/utils/permissions';
import { formatPhone, formatDateTime } from '@/utils/formatters';
import { getFriendlyErrorMessage } from '@/utils/errors';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export default function ContactDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
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
      showSnackbar(getFriendlyErrorMessage(e, 'Delete failed'));
    }
  }

  async function handleShare() {
    if (!contact) return;
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
    ].filter(Boolean).join('\n');

    try {
      const fileUri = `${FileSystem.cacheDirectory}contact_${contact.id}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, { dialogTitle: `Share ${contact.NAME}` });
    } catch {}
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                {contact.REMARKS}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

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
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
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
