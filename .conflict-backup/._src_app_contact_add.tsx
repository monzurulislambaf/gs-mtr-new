import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
  Snackbar,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createNewContact } from '@/services/contactService';
import { validateContact } from '@/utils/validation';
import { useContactsStore } from '@/store/contactsStore';
import { CONTACT_FIELDS } from '@/utils/constants';

interface FormData {
  'BD NO': string;
  RANK: string;
  NAME: string;
  DESIGNATION: string;
  'BRANCH / TRADE': string;
<<<<<<< HEAD
  'OFFICE ADDRESS': string;
  'RESIDENCE ADDRESS': string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
  'OFFICE TELEPHONE': string;
  'PERSONAL TELEPHONE': string;
=======
  OFFICE: string;
  RESIDENCE: string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  REMARKS: string;
}

export default function AddContactScreen() {
  const theme = useTheme();
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const [form, setForm] = useState<FormData>({
    'BD NO': '', RANK: '', NAME: '', DESIGNATION: '',
<<<<<<< HEAD
    'BRANCH / TRADE': '', 'OFFICE ADDRESS': '', 'RESIDENCE ADDRESS': '',
    'SERVICE MOBILE': '', 'PERSONAL MOBILE': '',
    'OFFICE TELEPHONE': '', 'PERSONAL TELEPHONE': '', REMARKS: '',
=======
    'BRANCH / TRADE': '', OFFICE: '', RESIDENCE: '',
    'SERVICE MOBILE': '', 'PERSONAL MOBILE': '', REMARKS: '',
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSave() {
    const validationErrors = validateContact(form);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((e) => { errorMap[e.field] = e.message; });
      setErrors(errorMap);
      return;
    }

    setLoading(true);
    try {
      await createNewContact(form);
      await loadContacts();
      showSnackbar('Contact created');
      setTimeout(() => router.back(), 500);
    } catch (e: any) {
      showSnackbar(e.message || 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
<<<<<<< HEAD
            label="BD NO"
=======
            label="BD NO *"
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
            value={form['BD NO']}
            onChangeText={(t) => updateField('BD NO', t)}
            mode="outlined"
            style={styles.input}
            error={!!errors['BD NO']}
          />
          {errors['BD NO'] && <HelperText type="error">{errors['BD NO']}</HelperText>}

          <TextInput
<<<<<<< HEAD
            label="RANK"
=======
            label="RANK *"
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
            value={form.RANK}
            onChangeText={(t) => updateField('RANK', t)}
            mode="outlined"
            style={styles.input}
            error={!!errors.RANK}
          />
          {errors.RANK && <HelperText type="error">{errors.RANK}</HelperText>}

          <TextInput
<<<<<<< HEAD
            label="NAME"
=======
            label="NAME *"
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
            value={form.NAME}
            onChangeText={(t) => updateField('NAME', t)}
            mode="outlined"
            style={styles.input}
            error={!!errors.NAME}
          />
          {errors.NAME && <HelperText type="error">{errors.NAME}</HelperText>}

          <TextInput
            label="DESIGNATION"
            value={form.DESIGNATION}
            onChangeText={(t) => updateField('DESIGNATION', t)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="BRANCH / TRADE"
            value={form['BRANCH / TRADE']}
            onChangeText={(t) => updateField('BRANCH / TRADE', t)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
<<<<<<< HEAD
            label="OFFICE ADDRESS"
            value={form['OFFICE ADDRESS']}
            onChangeText={(t) => updateField('OFFICE ADDRESS', t)}
=======
            label="OFFICE"
            value={form.OFFICE}
            onChangeText={(t) => updateField('OFFICE', t)}
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
            mode="outlined"
            style={styles.input}
          />

          <TextInput
<<<<<<< HEAD
            label="RESIDENCE ADDRESS"
            value={form['RESIDENCE ADDRESS']}
            onChangeText={(t) => updateField('RESIDENCE ADDRESS', t)}
=======
            label="RESIDENCE"
            value={form.RESIDENCE}
            onChangeText={(t) => updateField('RESIDENCE', t)}
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="SERVICE MOBILE"
            value={form['SERVICE MOBILE']}
            onChangeText={(t) => updateField('SERVICE MOBILE', t)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors['SERVICE MOBILE']}
          />
          {errors['SERVICE MOBILE'] && <HelperText type="error">{errors['SERVICE MOBILE']}</HelperText>}

          <TextInput
            label="PERSONAL MOBILE"
            value={form['PERSONAL MOBILE']}
            onChangeText={(t) => updateField('PERSONAL MOBILE', t)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors['PERSONAL MOBILE']}
          />
          {errors['PERSONAL MOBILE'] && <HelperText type="error">{errors['PERSONAL MOBILE']}</HelperText>}

          <TextInput
<<<<<<< HEAD
            label="OFFICE TELEPHONE"
            value={form['OFFICE TELEPHONE']}
            onChangeText={(t) => updateField('OFFICE TELEPHONE', t)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors['OFFICE TELEPHONE']}
          />
          {errors['OFFICE TELEPHONE'] && <HelperText type="error">{errors['OFFICE TELEPHONE']}</HelperText>}

          <TextInput
            label="RESIDENCE TELEPHONE"
            value={form['PERSONAL TELEPHONE']}
            onChangeText={(t) => updateField('PERSONAL TELEPHONE', t)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors['PERSONAL TELEPHONE']}
          />
          {errors['PERSONAL TELEPHONE'] && <HelperText type="error">{errors['PERSONAL TELEPHONE']}</HelperText>}

          <TextInput
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
            label="REMARKS"
            value={form.REMARKS}
            onChangeText={(t) => updateField('REMARKS', t)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Save Contact
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
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
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 4, paddingBottom: 80 },
  input: { marginBottom: 8, borderRadius: 12 },
  saveButton: {
    marginTop: 16,
    borderRadius: 24,
  },
  saveButtonContent: { paddingVertical: 6 },
});
