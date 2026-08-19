import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { editContact } from '@/services/contactService';
import { useContactsStore } from '@/store/contactsStore';
import * as db from '@/database/database';
import { ContactFormScreen, type ContactFormData, EMPTY_FORM } from '@/components/contact/ContactFormScreen';

export default function EditContactScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const [initialData, setInitialData] = useState<ContactFormData | null>(null);

  useEffect(() => {
    if (id) {
      db.getContactById(id).then((contact) => {
        if (contact) {
          setInitialData({
            'BD NO': contact['BD NO'],
            RANK: contact.RANK,
            NAME: contact.NAME,
            DESIGNATION: contact.DESIGNATION,
            'BRANCH / TRADE': contact['BRANCH / TRADE'],
            'OFFICE ADDRESS': contact['OFFICE ADDRESS'],
            'RESIDENCE ADDRESS': contact['RESIDENCE ADDRESS'],
            'SERVICE MOBILE': contact['SERVICE MOBILE'],
            'PERSONAL MOBILE': contact['PERSONAL MOBILE'],
            'OFFICE TELEPHONE': contact['OFFICE TELEPHONE'],
            'PERSONAL TELEPHONE': contact['PERSONAL TELEPHONE'],
            REMARKS: contact.REMARKS,
          });
        }
      });
    }
  }, [id]);

  async function handleSave(data: ContactFormData) {
    if (!id) return;
    await editContact(id, data);
    await loadContacts();
    setTimeout(() => router.back(), 500);
  }

  if (!initialData) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <ContactFormScreen
      mode="edit"
      initialData={initialData}
      onSubmit={handleSave}
      successMessage="Contact updated"
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
