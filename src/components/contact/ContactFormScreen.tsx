import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  useTheme,
  Snackbar,
  Portal,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScreen, useKeyboardAwareForm } from '@/components/ui/KeyboardAwareScreen';
import { spacing } from '@/theme';

/** Contact form data shape — single source of truth for add and edit screens. */
export interface ContactFormData {
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

export const EMPTY_FORM: ContactFormData = {
  'BD NO': '',
  RANK: '',
  NAME: '',
  DESIGNATION: '',
  'BRANCH / TRADE': '',
  'OFFICE ADDRESS': '',
  'RESIDENCE ADDRESS': '',
  'SERVICE MOBILE': '',
  'PERSONAL MOBILE': '',
  'OFFICE TELEPHONE': '',
  'PERSONAL TELEPHONE': '',
  REMARKS: '',
};

interface FieldDef {
  key: keyof ContactFormData;
  label: string;
  keyboardType?: 'phone-pad' | 'default';
  multiline?: boolean;
}

/** Logical field groups for organized form layout. */
const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Identity',
    fields: [
      { key: 'BD NO' as const, label: 'BD NO' },
      { key: 'RANK' as const, label: 'RANK' },
      { key: 'NAME' as const, label: 'NAME' },
      { key: 'DESIGNATION' as const, label: 'DESIGNATION' },
      { key: 'BRANCH / TRADE' as const, label: 'BRANCH / TRADE' },
    ],
  },
  {
    title: 'Address',
    fields: [
      { key: 'OFFICE ADDRESS' as const, label: 'OFFICE ADDRESS' },
      { key: 'RESIDENCE ADDRESS' as const, label: 'RESIDENCE ADDRESS' },
    ],
  },
  {
    title: 'Phone',
    fields: [
      { key: 'SERVICE MOBILE' as const, label: 'SERVICE MOBILE', keyboardType: 'phone-pad' as const },
      { key: 'PERSONAL MOBILE' as const, label: 'PERSONAL MOBILE', keyboardType: 'phone-pad' as const },
      { key: 'OFFICE TELEPHONE' as const, label: 'OFFICE TELEPHONE', keyboardType: 'phone-pad' as const },
      { key: 'PERSONAL TELEPHONE' as const, label: 'RESIDENCE TELEPHONE', keyboardType: 'phone-pad' as const },
    ],
  },
  {
    title: 'Notes',
    fields: [
      { key: 'REMARKS' as const, label: 'REMARKS', multiline: true },
    ],
  },
];

interface ContactFormScreenProps {
  /** 'add' or 'edit' mode — affects button label. */
  mode: 'add' | 'edit';
  /** Initial form data for edit mode. */
  initialData?: ContactFormData;
  /** Called when the user taps Save. Receives validated form data. */
  onSubmit: (data: ContactFormData) => Promise<void>;
  /** Snackbar message to show after successful save. */
  successMessage?: string;
}

/**
 * Shared contact form screen with logical field grouping.
 *
 * Used by both contact/add.tsx and contact/edit/[id].tsx to eliminate
 * duplication. Handles form state, validation errors, keyboard awareness,
 * and loading/success feedback.
 */
function SectionTitle({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionRow}>
      <View style={[styles.sectionBar, { backgroundColor: theme.colors.primary }]} />
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

export function ContactFormScreen({
  mode,
  initialData,
  onSubmit,
  successMessage,
}: ContactFormScreenProps) {
  const theme = useTheme();
  const keyboardForm = useKeyboardAwareForm();
  const { captureLayout, focusField } = keyboardForm;
  const [form, setForm] = useState<ContactFormData>(initialData ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  function updateField(field: keyof ContactFormData, value: string) {
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
    setLoading(true);
    try {
      await onSubmit(form);
      showSnackbar(successMessage ?? (mode === 'add' ? 'Contact created' : 'Contact updated'));
    } catch (e: any) {
      showSnackbar(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAwareScreen form={keyboardForm} contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.dark ? '#000000' : '#0B7F74',
            },
          ]}
        >
          {FIELD_GROUPS.map((group) => (
            <View key={group.title}>
              <SectionTitle title={group.title} />
              {group.fields.map((field) => (
                <View key={field.key}>
                  <TextInput
                    label={field.label}
                    value={form[field.key]}
                    onChangeText={(t) => updateField(field.key, t)}
                    onFocus={() => focusField(field.key)}
                    onLayout={captureLayout(field.key)}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    error={!!errors[field.key]}
                    keyboardType={field.keyboardType}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 3 : undefined}
                  />
                  {errors[field.key] && (
                    <HelperText type="error">{errors[field.key]}</HelperText>
                  )}
                </View>
              ))}
            </View>
          ))}

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            {mode === 'add' ? 'Save Contact' : 'Update Contact'}
          </Button>
        </View>
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
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  input: {
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 14,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 28,
    height: 52,
  },
  saveButtonContent: {
    height: 52,
  },
});
