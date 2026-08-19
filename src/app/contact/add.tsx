import { router } from 'expo-router';
import { createNewContact } from '@/services/contactService';
import { useContactsStore } from '@/store/contactsStore';
import { ContactFormScreen, type ContactFormData } from '@/components/contact/ContactFormScreen';

export default function AddContactScreen() {
  const loadContacts = useContactsStore((s) => s.loadContacts);

  async function handleSave(data: ContactFormData) {
    await createNewContact(data);
    await loadContacts();
    // Brief delay for snackbar to show before navigating back
    setTimeout(() => router.back(), 500);
  }

  return (
    <ContactFormScreen
      mode="add"
      onSubmit={handleSave}
      successMessage="Contact created"
    />
  );
}
