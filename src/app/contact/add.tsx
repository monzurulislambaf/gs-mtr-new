import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
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
import { getFriendlyErrorMessage } from '@/utils/errors';
import { useContactsStore } from '@/store/contactsStore';
import { KeyboardAwareScreen, useKeyboardAwareForm } from '@/components/ui/KeyboardAwareScreen';

interface FormData {
  'BD NO': string;
  RANK: string;
  NAME: string;
  DESIGNATION: string;
  'BRANCH / TRADE': string;
  'OFFICE ADDRESS': string;
  'RESIDENCE ADDRESS': string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
  'OFFICE TELEPHONE': string;
  'PERSONAL TELEPHONE': string;
  REMARKS: string;
}

export default function AddContactScreen() {
  const theme = useTheme();
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const keyboardForm = useKeyboardAwareForm();
  const { captureLayout, focusField } = keyboardForm;
  const [form, setForm] = useState<FormData>({
    'BD NO': '', RANK: '', NAME: '', DESIGNATION: '',
    'BRANCH / TRADE': '', 'OFFICE ADDRESS': '', 'RESIDENCE ADDRESS': '',
    'SERVICE MOBILE': '', 'PERSONAL MOBILE': '',
    'OFFICE TELEPHONE': '', 'PERSONAL TELEPHONE': '', REMARKS: '',
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
      showSnackbar(getFriendlyErrorMessage(e, 'Failed to create contact'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAwareScreen form={keyboardForm} contentContainerStyle={styles.scroll}>
        <TextInput
          label="BD NO"
            value={form['BD NO']}
            onChangeText={(t) => updateField('BD NO', t)}
            onFocus={() => focusField('BD NO')}
            onLayout={captureLayout('BD NO')}
            mode="outlined"
            style={styles.input}
            error={!!errors['BD NO']}
          />
          {errors['BD NO'] && <HelperText type="error">{errors['BD NO']}</HelperText>}

          <TextInput
            label="RANK"
            value={form.RANK}
            onChangeText={(t) => updateField('RANK', t)}
            onFocus={() => focusField('RANK')}
            onLayout={captureLayout('RANK')}
            mode="outlined"
            style={styles.input}
            error={!!errors.RANK}
          />
          {errors.RANK && <HelperText type="error">{errors.RANK}</HelperText>}

          <TextInput
            label="NAME"
            value={form.NAME}
            onChangeText={(t) => updateField('NAME', t)}
            onFocus={() => focusField('NAME')}
            onLayout={captureLayout('NAME')}
            mode="outlined"
            style={styles.input}
            error={!!errors.NAME}
          />
          {errors.NAME && <HelperText type="error">{errors.NAME}</HelperText>}

          <TextInput
            label="DESIGNATION"
            value={form.DESIGNATION}
            onChangeText={(t) => updateField('DESIGNATION', t)}
            onFocus={() => focusField('DESIGNATION')}
            onLayout={captureLayout('DESIGNATION')}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="BRANCH / TRADE"
            value={form['BRANCH / TRADE']}
            onChangeText={(t) => updateField('BRANCH / TRADE', t)}
            onFocus={() => focusField('BRANCH / TRADE')}
            onLayout={captureLayout('BRANCH / TRADE')}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="OFFICE ADDRESS"
            value={form['OFFICE ADDRESS']}
            onChangeText={(t) => updateField('OFFICE ADDRESS', t)}
            onFocus={() => focusField('OFFICE ADDRESS')}
            onLayout={captureLayout('OFFICE ADDRESS')}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="RESIDENCE ADDRESS"
            value={form['RESIDENCE ADDRESS']}
            onChangeText={(t) => updateField('RESIDENCE ADDRESS', t)}
            onFocus={() => focusField('RESIDENCE ADDRESS')}
            onLayout={captureLayout('RESIDENCE ADDRESS')}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="SERVICE MOBILE"
            value={form['SERVICE MOBILE']}
            onChangeText={(t) => updateField('SERVICE MOBILE', t)}
            onFocus={() => focusField('SERVICE MOBILE')}
            onLayout={captureLayout('SERVICE MOBILE')}
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
            onFocus={() => focusField('PERSONAL MOBILE')}
            onLayout={captureLayout('PERSONAL MOBILE')}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors['PERSONAL MOBILE']}
          />
          {errors['PERSONAL MOBILE'] && <HelperText type="error">{errors['PERSONAL MOBILE']}</HelperText>}

          <TextInput
            label="OFFICE TELEPHONE"
            value={form['OFFICE TELEPHONE']}
            onChangeText={(t) => updateField('OFFICE TELEPHONE', t)}
            onFocus={() => focusField('OFFICE TELEPHONE')}
            onLayout={captureLayout('OFFICE TELEPHONE')}
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
            onFocus={() => focusField('PERSONAL TELEPHONE')}
            onLayout={captureLayout('PERSONAL TELEPHONE')}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors['PERSONAL TELEPHONE']}
          />
          {errors['PERSONAL TELEPHONE'] && <HelperText type="error">{errors['PERSONAL TELEPHONE']}</HelperText>}

          <TextInput
            label="REMARKS"
            value={form.REMARKS}
            onChangeText={(t) => updateField('REMARKS', t)}
            onFocus={() => focusField('REMARKS')}
            onLayout={captureLayout('REMARKS')}
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
        </KeyboardAwareScreen>

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
